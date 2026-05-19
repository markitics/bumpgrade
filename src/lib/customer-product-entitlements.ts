import { getCloudflareContext } from "@opennextjs/cloudflare";

import { productAccessCatalogs } from "@/lib/product-access";
import { entitlementGrantMappings } from "@/lib/product-entitlements";

export const customerProductEntitlementLookupIssue = 141;
export const customerProductEntitlementLookupStatus = "customer-product-entitlement-lookup-ready";
export const customerProductEntitlementRoutePrefix = "/products/entitlements";
export const customerProductEntitlementApiRoute = "/api/products/entitlements";
export const customerProductEntitlementRoutePattern = "/products/entitlements/{checkoutIntentId}";

type ProductRuntime = {
  db: D1Database;
};

type CheckoutLookupRow = {
  id: string;
  status: string;
  amount_cents: number | string | null;
  currency: string | null;
  updated_at: number | string | null;
};

type EntitlementLookupRow = {
  product_id: string;
  source_commerce_product_id: string | null;
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
  source_price_currency: string | null;
  source_price_amount_cents: number | string | null;
  fulfillment_status: string | null;
  fulfillment_kind: string | null;
  fulfillment_summary: string | null;
  fulfillment_updated_at: number | string | null;
};

export type CustomerProductEntitlementLookupStatus =
  | "ready"
  | "waiting_for_checkout"
  | "waiting_for_entitlements"
  | "not_found"
  | "invalid"
  | "unavailable";

export type CustomerProductEntitlement = {
  id: string;
  productId: string;
  productTitle: string;
  sourceCommerceProductId: string | null;
  sourceCommerceProductName: string | null;
  sourceCommerceProductSlug: string | null;
  entitlementTemplateId: string;
  entitlementTemplateTitle: string;
  accessRuleId: string;
  accessRuleTitle: string;
  status: string;
  grantKind: string;
  grants: string[];
  sourcePriceId: string | null;
  sourcePriceLabel: string | null;
  sourcePriceAmount: string | null;
  grantedAt: string | null;
  updatedAt: string | null;
  fulfillment: {
    status: string | null;
    kind: string | null;
    summary: string | null;
    updatedAt: string | null;
  };
  nextSteps: string[];
};

export type CustomerProductEntitlementLookupState = {
  id: string;
  status: typeof customerProductEntitlementLookupStatus;
  issue: typeof customerProductEntitlementLookupIssue;
  parentIssue: 16;
  routePattern: typeof customerProductEntitlementRoutePattern;
  apiRoute: typeof customerProductEntitlementApiRoute;
  publicSourceDataRoute: "/products/source-data";
  lookupEvidence: readonly ["checkoutIntentId"];
  lookupStatus: CustomerProductEntitlementLookupStatus;
  source: "d1" | "unavailable";
  loadError: string | null;
  checkout: {
    checkoutIntentId: string;
    status: string;
    amount: string | null;
    updatedAt: string | null;
    entitlementCount: number;
    privateDataIncluded: false;
    rawStripeIdsIncluded: false;
  } | null;
  entitlements: CustomerProductEntitlement[];
  redaction: {
    privateBuyerDataIncluded: false;
    rawBuyerEmailIncluded: false;
    buyerEmailHashIncluded: false;
    rawStripeIdsIncluded: false;
    sourceStripeEventIdsIncluded: false;
    rawR2KeysIncluded: false;
    signedUrlsIncluded: false;
    metadataJsonIncluded: false;
  };
  privateFieldsExcluded: string[];
  safeFields: string[];
  caveat: string;
  writeBoundary: string;
};

export const customerProductEntitlementLookupContract = {
  id: "customer-product-entitlement-lookup-contract",
  status: customerProductEntitlementLookupStatus as typeof customerProductEntitlementLookupStatus,
  issue: customerProductEntitlementLookupIssue as typeof customerProductEntitlementLookupIssue,
  parentIssue: 16 as const,
  routePattern: customerProductEntitlementRoutePattern as typeof customerProductEntitlementRoutePattern,
  apiRoute: customerProductEntitlementApiRoute as typeof customerProductEntitlementApiRoute,
  publicSourceDataRoute: "/products/source-data" as const,
  lookupEvidence: ["checkoutIntentId"] as const,
  safeFields: [
    "checkoutIntentId",
    "checkoutStatus",
    "productId",
    "productTitle",
    "entitlementTemplateId",
    "accessRuleId",
    "entitlementStatus",
    "grantKind",
    "fulfillmentStatus",
    "fulfillmentSummary",
    "nextSteps",
  ],
  privateFieldsExcluded: [
    "buyerEmail",
    "buyerEmailHash",
    "buyerUserId",
    "sourceStripeEventId",
    "stripeCheckoutSessionId",
    "stripePaymentIntentId",
    "stripeSubscriptionId",
    "stripeCustomerId",
    "metadataJson",
    "privateR2ObjectKeys",
    "signedUrls",
  ],
  caveat:
    "Customer lookup proves entitlement status and queued fulfillment evidence for a checkout intent. It does not expose private buyer identity, raw Stripe identifiers, private asset keys, signed downloads, protected lessons, revocation, or live fulfillment.",
  writeBoundary:
    "Issue #141 adds a read-only customer entitlement lookup keyed by Bumpgrade checkout intent evidence. Signed downloads, protected content, revocation, subscription access changes, refunds, customer portals, private asset delivery, and direct agent entitlement writes require future authenticated confirmed-write APIs.",
};

async function getRuntime(): Promise<ProductRuntime> {
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

export function customerProductEntitlementRoute(checkoutIntentId: string) {
  return `${customerProductEntitlementRoutePrefix}/${encodeURIComponent(checkoutIntentId)}`;
}

export function normalizeCustomerProductEntitlementLookupId(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > 160) return null;
  if (!/^checkout-intent-[a-zA-Z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}

function baseState(
  lookupStatus: CustomerProductEntitlementLookupStatus,
  source: CustomerProductEntitlementLookupState["source"],
  loadError: string | null,
): CustomerProductEntitlementLookupState {
  return {
    ...customerProductEntitlementLookupContract,
    lookupStatus,
    source,
    loadError,
    checkout: null,
    entitlements: [],
    redaction: {
      privateBuyerDataIncluded: false,
      rawBuyerEmailIncluded: false,
      buyerEmailHashIncluded: false,
      rawStripeIdsIncluded: false,
      sourceStripeEventIdsIncluded: false,
      rawR2KeysIncluded: false,
      signedUrlsIncluded: false,
      metadataJsonIncluded: false,
    },
  };
}

function nextSteps(row: EntitlementLookupRow) {
  if (row.fulfillment_status === "queued") {
    return [
      "Fulfillment evidence is queued.",
      "Private delivery, signed downloads, and protected lesson access are still disabled in this sandbox slice.",
    ];
  }

  if (row.entitlement_status === "active") {
    return [
      "The entitlement row is active.",
      "A later authenticated fulfillment contract will turn this evidence into private asset access.",
    ];
  }

  return [
    "This entitlement is not active.",
    "Customer portal, revocation, refund, and subscription access changes require future authenticated contracts.",
  ];
}

function customerEntitlement(row: EntitlementLookupRow): CustomerProductEntitlement {
  const products = productById();
  const templates = templateById();
  const accessRules = accessRuleById();
  const mappings = mappingByTemplateAndPrice();
  const product = products.get(row.product_id);
  const template = templates.get(row.entitlement_template_id);
  const accessRule = accessRules.get(row.access_rule_id);
  const mapping = mappings.get(`${row.entitlement_template_id}:${row.source_price_id ?? ""}`);

  return {
    id: `${row.product_id}:${row.entitlement_template_id}`,
    productId: row.product_id,
    productTitle: product?.title ?? mapping?.productTitle ?? row.product_id,
    sourceCommerceProductId: row.source_commerce_product_id,
    sourceCommerceProductName: row.source_product_name,
    sourceCommerceProductSlug: row.source_product_slug,
    entitlementTemplateId: row.entitlement_template_id,
    entitlementTemplateTitle: template?.title ?? mapping?.entitlementTemplateTitle ?? row.entitlement_template_id,
    accessRuleId: row.access_rule_id,
    accessRuleTitle: accessRule?.title ?? row.access_rule_id,
    status: row.entitlement_status,
    grantKind: row.grant_kind,
    grants: template?.grants ?? mapping?.grants ?? [],
    sourcePriceId: row.source_price_id,
    sourcePriceLabel: row.source_price_nickname,
    sourcePriceAmount: moneyValue(row.source_price_amount_cents, row.source_price_currency),
    grantedAt: timestampValue(row.granted_at),
    updatedAt: timestampValue(row.updated_at),
    fulfillment: {
      status: row.fulfillment_status,
      kind: row.fulfillment_kind,
      summary: row.fulfillment_summary,
      updatedAt: timestampValue(row.fulfillment_updated_at),
    },
    nextSteps: nextSteps(row),
  };
}

function lookupStatusFor(checkout: CheckoutLookupRow, entitlementCount: number): CustomerProductEntitlementLookupStatus {
  if (entitlementCount > 0) return "ready";
  if (checkout.status === "paid" || checkout.status === "completed") return "waiting_for_entitlements";
  return "waiting_for_checkout";
}

export async function getCustomerProductEntitlementLookup(
  checkoutIntentId: string | null | undefined,
): Promise<CustomerProductEntitlementLookupState> {
  const normalized = normalizeCustomerProductEntitlementLookupId(checkoutIntentId);
  if (!normalized) return baseState("invalid", "unavailable", "A valid checkout intent ID is required.");

  try {
    const { db } = await getRuntime();
    const checkout = await db
      .prepare("SELECT id, status, amount_cents, currency, updated_at FROM checkout_intents WHERE id = ?")
      .bind(normalized)
      .first<CheckoutLookupRow>();

    if (!checkout) return baseState("not_found", "d1", "No checkout intent was found for that lookup evidence.");

    const entitlementRows = await db
      .prepare(
        `SELECT
          e.product_id,
          e.source_commerce_product_id,
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
          source_price.currency AS source_price_currency,
          source_price.unit_amount_cents AS source_price_amount_cents,
          ft.status AS fulfillment_status,
          ft.fulfillment_kind,
          ft.summary AS fulfillment_summary,
          ft.updated_at AS fulfillment_updated_at
        FROM product_entitlements e
        LEFT JOIN commerce_products source_product ON source_product.id = e.source_commerce_product_id
        LEFT JOIN commerce_prices source_price ON source_price.id = e.source_price_id
        LEFT JOIN product_fulfillment_tasks ft ON ft.entitlement_id = e.id
        WHERE e.checkout_intent_id = ?
        ORDER BY e.granted_at DESC`,
      )
      .bind(normalized)
      .all<EntitlementLookupRow>();

    const entitlements = (entitlementRows.results ?? []).map(customerEntitlement);

    return {
      ...baseState(lookupStatusFor(checkout, entitlements.length), "d1", null),
      checkout: {
        checkoutIntentId: checkout.id,
        status: checkout.status,
        amount: moneyValue(checkout.amount_cents, checkout.currency),
        updatedAt: timestampValue(checkout.updated_at),
        entitlementCount: entitlements.length,
        privateDataIncluded: false,
        rawStripeIdsIncluded: false,
      },
      entitlements,
    };
  } catch (error) {
    return baseState(
      "unavailable",
      "unavailable",
      error instanceof Error ? error.message : "Unable to load customer entitlement lookup.",
    );
  }
}
