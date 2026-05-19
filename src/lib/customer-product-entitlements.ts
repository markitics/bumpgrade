import { getCloudflareContext } from "@opennextjs/cloudflare";

import { entitlementGrantMappings } from "@/lib/product-entitlements";
import { productAccessCatalogs } from "@/lib/product-access";
import { downloadableAssetForProduct, productDownloadTokenApiRoute } from "@/lib/product-download-tokens";

export const customerProductEntitlementLookupIssue = 141;
export const customerProductEntitlementLookupStatus = "customer-product-entitlement-lookup-ready";
export const customerProductEntitlementLookupRoute = "/products/entitlements";
export const customerProductEntitlementLookupApiRoute = "/api/products/entitlements";

type CustomerEntitlementRuntime = {
  db: D1Database;
};

type CheckoutIntentLookupRow = {
  id: string;
  status: string;
  amount_cents: number | string | null;
  currency: string | null;
  updated_at: number | string | null;
};

type CustomerEntitlementRow = {
  entitlement_id: string;
  product_id: string;
  entitlement_template_id: string;
  access_rule_id: string;
  entitlement_status: string;
  grant_kind: string;
  source_price_id: string | null;
  granted_at: number | string;
  updated_at: number | string;
  source_product_name: string | null;
  source_product_slug: string | null;
  source_price_nickname: string | null;
  source_price_amount_cents: number | string | null;
  currency: string | null;
  fulfillment_task_id: string | null;
  fulfillment_status: string | null;
  fulfillment_kind: string | null;
  fulfillment_summary: string | null;
  fulfillment_updated_at: number | string | null;
};

export type CustomerProductEntitlement = {
  id: string;
  productId: string;
  productTitle: string;
  entitlementTemplateId: string;
  entitlementTemplateTitle: string;
  accessRuleId: string;
  accessRuleTitle: string;
  status: string;
  grantKind: string;
  grantSummary: string;
  sourceProductName: string | null;
  sourceProductSlug: string | null;
  sourcePriceLabel: string | null;
  sourcePriceAmount: string | null;
  grantedAt: string;
  updatedAt: string;
  fulfillment: {
    id: string | null;
    status: string | null;
    kind: string | null;
    summary: string | null;
    updatedAt: string | null;
  };
  downloadDelivery: {
    available: boolean;
    assetId: string | null;
    assetTitle: string | null;
    tokenApiRoute: typeof productDownloadTokenApiRoute;
    deliveryMode: "private-r2-fixture" | null;
    r2Backed: boolean;
    privateR2KeysIncluded: false;
    signedUrlsIncluded: false;
  };
};

export type CustomerProductEntitlementLookup = {
  id: "customer-product-entitlement-lookup-contract";
  status: typeof customerProductEntitlementLookupStatus;
  issue: typeof customerProductEntitlementLookupIssue;
  parentIssue: 16;
  route: typeof customerProductEntitlementLookupRoute;
  apiRoute: typeof customerProductEntitlementLookupApiRoute;
  sourceDataRoute: "/products/source-data";
  source: "d1" | "missing" | "invalid" | "unavailable";
  loadError: string | null;
  checkoutIntentId: string | null;
  checkout: {
    checkoutIntentId: string;
    status: string;
    amount: string | null;
    updatedAt: string | null;
    privateDataIncluded: false;
    rawStripeIdsIncluded: false;
  } | null;
  counts: {
    entitlements: number;
    activeEntitlements: number;
    fulfillmentTasks: number;
  };
  entitlements: CustomerProductEntitlement[];
  redaction: {
    buyerEmailIncluded: false;
    buyerEmailHashIncluded: false;
    rawStripeIdsIncluded: false;
    sourceStripeEventIdsIncluded: false;
    rawR2KeysIncluded: false;
    signedUrlsIncluded: false;
    metadataJsonIncluded: false;
    downloadTokensIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type CustomerProductEntitlementLookupSummary = Omit<
  CustomerProductEntitlementLookup,
  "checkoutIntentId" | "checkout" | "counts" | "entitlements" | "source" | "loadError"
> & {
  authBoundary: "checkout-intent-bearer-reference";
  lookupInput: "checkoutIntentId";
};

async function getRuntime(): Promise<CustomerEntitlementRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function timestampValue(value: number | string | null | undefined) {
  const seconds = numberValue(value);
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function moneyValue(amount: number | string | null | undefined, currency: string | null | undefined) {
  const cents = numberValue(amount);
  if (!cents || !currency) return null;
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function productById() {
  return new Map(productAccessCatalogs.flatMap((catalog) => catalog.products.map((product) => [product.id, product] as const)));
}

function templateById() {
  return new Map(
    productAccessCatalogs.flatMap((catalog) =>
      catalog.entitlementTemplates.map((template) => [template.id, template] as const),
    ),
  );
}

function accessRuleById() {
  return new Map(productAccessCatalogs.flatMap((catalog) => catalog.accessRules.map((rule) => [rule.id, rule] as const)));
}

function mappingByTemplateAndPrice() {
  return new Map(
    entitlementGrantMappings.map((mapping) => [`${mapping.entitlementTemplateId}:${mapping.sourcePriceId}`, mapping] as const),
  );
}

export function normalizeCustomerCheckoutIntentId(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  if (!/^checkout-intent-[0-9a-fA-F-]{36}$/.test(trimmed)) return null;
  return trimmed;
}

const privateFieldsExcluded = [
  "buyerEmail",
  "buyerEmailHash",
  "buyerUserId",
  "ownerUserId",
  "sourceStripeEventId",
  "stripeCheckoutSessionId",
  "stripePaymentIntentId",
  "stripeSubscriptionId",
  "metadataJson",
  "privateR2ObjectKeys",
  "signedUrls",
];

const writeBoundary =
  "Issue #141 exposes a checkout-intent-scoped customer entitlement lookup with product, access-rule, and fulfillment status only. Issue #143 can create one-use download tokens for active file entitlements, issue #146 can stream a seeded private R2-backed fixture through Bumpgrade, and issue #147 revalidates current entitlement and trusted checkout state at redemption. Private R2 keys, signed URLs, protected lessons, private buyer data, entitlement mutation, revocation, arbitrary asset uploads, and live fulfillment automation remain future authenticated confirmed-write APIs.";

export const customerProductEntitlementLookupSummary: CustomerProductEntitlementLookupSummary = {
  id: "customer-product-entitlement-lookup-contract",
  status: customerProductEntitlementLookupStatus,
  issue: customerProductEntitlementLookupIssue,
  parentIssue: 16,
  route: customerProductEntitlementLookupRoute,
  apiRoute: customerProductEntitlementLookupApiRoute,
  sourceDataRoute: "/products/source-data",
  authBoundary: "checkout-intent-bearer-reference",
  lookupInput: "checkoutIntentId",
  redaction: {
    buyerEmailIncluded: false,
    buyerEmailHashIncluded: false,
    rawStripeIdsIncluded: false,
    sourceStripeEventIdsIncluded: false,
    rawR2KeysIncluded: false,
    signedUrlsIncluded: false,
    metadataJsonIncluded: false,
    downloadTokensIncluded: false,
  },
  privateFieldsExcluded,
  writeBoundary,
};

function emptyLookup(
  source: CustomerProductEntitlementLookup["source"],
  checkoutIntentId: string | null,
  loadError: string | null,
): CustomerProductEntitlementLookup {
  return {
    ...customerProductEntitlementLookupSummary,
    source,
    loadError,
    checkoutIntentId,
    checkout: null,
    counts: {
      entitlements: 0,
      activeEntitlements: 0,
      fulfillmentTasks: 0,
    },
    entitlements: [],
  };
}

function customerEntitlement(row: CustomerEntitlementRow): CustomerProductEntitlement {
  const products = productById();
  const templates = templateById();
  const accessRules = accessRuleById();
  const mappings = mappingByTemplateAndPrice();
  const mapping = mappings.get(`${row.entitlement_template_id}:${row.source_price_id ?? ""}`);
  const product = products.get(row.product_id);
  const template = templates.get(row.entitlement_template_id);
  const accessRule = accessRules.get(row.access_rule_id);
  const downloadableAsset = downloadableAssetForProduct(row.product_id);

  return {
    id: row.entitlement_id,
    productId: row.product_id,
    productTitle: product?.title ?? mapping?.productTitle ?? row.product_id,
    entitlementTemplateId: row.entitlement_template_id,
    entitlementTemplateTitle: template?.title ?? mapping?.entitlementTemplateTitle ?? row.entitlement_template_id,
    accessRuleId: row.access_rule_id,
    accessRuleTitle: accessRule?.title ?? row.access_rule_id,
    status: row.entitlement_status,
    grantKind: row.grant_kind,
    grantSummary: mapping?.grantSummary ?? "Granted from trusted checkout evidence.",
    sourceProductName: row.source_product_name,
    sourceProductSlug: row.source_product_slug,
    sourcePriceLabel: row.source_price_nickname,
    sourcePriceAmount: moneyValue(row.source_price_amount_cents, row.currency),
    grantedAt: timestampValue(row.granted_at) ?? "Unknown",
    updatedAt: timestampValue(row.updated_at) ?? "Unknown",
    fulfillment: {
      id: row.fulfillment_task_id,
      status: row.fulfillment_status,
      kind: row.fulfillment_kind,
      summary: row.fulfillment_summary,
      updatedAt: timestampValue(row.fulfillment_updated_at),
    },
    downloadDelivery: {
      available: row.entitlement_status === "active" && Boolean(downloadableAsset),
      assetId: downloadableAsset?.assetId ?? null,
      assetTitle: downloadableAsset?.assetTitle ?? null,
      tokenApiRoute: productDownloadTokenApiRoute,
      deliveryMode: downloadableAsset?.deliveryMode ?? null,
      r2Backed: downloadableAsset?.r2Backed ?? false,
      privateR2KeysIncluded: false,
      signedUrlsIncluded: false,
    },
  };
}

export async function getCustomerProductEntitlementLookup(
  checkoutIntentIdInput: string | null | undefined,
): Promise<CustomerProductEntitlementLookup> {
  const checkoutIntentId = normalizeCustomerCheckoutIntentId(checkoutIntentIdInput);
  if (!checkoutIntentId) {
    return emptyLookup(checkoutIntentIdInput?.trim() ? "invalid" : "missing", null, null);
  }

  try {
    const { db } = await getRuntime();
    const checkout = await db
      .prepare(
        `SELECT id, status, amount_cents, currency, updated_at
        FROM checkout_intents
        WHERE id = ?`,
      )
      .bind(checkoutIntentId)
      .first<CheckoutIntentLookupRow>();

    if (!checkout) {
      return emptyLookup("missing", checkoutIntentId, null);
    }

    const entitlements = await db
      .prepare(
        `SELECT
          e.id AS entitlement_id,
          e.product_id,
          e.entitlement_template_id,
          e.access_rule_id,
          e.status AS entitlement_status,
          e.grant_kind,
          e.source_price_id,
          e.granted_at,
          e.updated_at,
          source_product.name AS source_product_name,
          source_product.slug AS source_product_slug,
          source_price.nickname AS source_price_nickname,
          source_price.unit_amount_cents AS source_price_amount_cents,
          source_price.currency,
          ft.id AS fulfillment_task_id,
          ft.status AS fulfillment_status,
          ft.fulfillment_kind,
          ft.summary AS fulfillment_summary,
          ft.updated_at AS fulfillment_updated_at
        FROM product_entitlements e
        LEFT JOIN commerce_products source_product ON source_product.id = e.source_commerce_product_id
        LEFT JOIN commerce_prices source_price ON source_price.id = e.source_price_id
        LEFT JOIN product_fulfillment_tasks ft ON ft.entitlement_id = e.id
        WHERE e.checkout_intent_id = ?
        ORDER BY e.granted_at DESC, e.product_id ASC`,
      )
      .bind(checkoutIntentId)
      .all<CustomerEntitlementRow>();

    const rows = entitlements.results ?? [];
    const safeEntitlements = rows.map(customerEntitlement);

    return {
      ...customerProductEntitlementLookupSummary,
      source: "d1",
      loadError: null,
      checkoutIntentId,
      checkout: {
        checkoutIntentId,
        status: checkout.status,
        amount: moneyValue(checkout.amount_cents, checkout.currency),
        updatedAt: timestampValue(checkout.updated_at),
        privateDataIncluded: false,
        rawStripeIdsIncluded: false,
      },
      counts: {
        entitlements: safeEntitlements.length,
        activeEntitlements: safeEntitlements.filter((entitlement) => entitlement.status === "active").length,
        fulfillmentTasks: safeEntitlements.filter((entitlement) => entitlement.fulfillment.id).length,
      },
      entitlements: safeEntitlements,
    };
  } catch (error) {
    return emptyLookup(
      "unavailable",
      checkoutIntentId,
      error instanceof Error ? error.message : "Unable to load customer product entitlements.",
    );
  }
}
