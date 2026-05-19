import { getCloudflareContext } from "@opennextjs/cloudflare";

import { entitlementGrantMappings } from "@/lib/product-entitlements";
import { productAccessCatalogs } from "@/lib/product-access";

export const productEntitlementInspectionIssue = 139;
export const productEntitlementInspectionStatus = "owner-product-entitlement-inspection-ready";
export const productEntitlementInspectionOwnerRoute = "/admin/products";

type ProductRuntime = {
  db: D1Database;
};

type CountRow = {
  entitlement_count: number | string | null;
  active_entitlement_count: number | string | null;
  fulfillment_task_count: number | string | null;
  queued_fulfillment_task_count: number | string | null;
  checkout_intent_count: number | string | null;
  last_granted_at: number | string | null;
  last_fulfillment_at: number | string | null;
};

type DimensionCountRow = {
  id: string | null;
  status: string | null;
  total: number | string | null;
};

type EntitlementRow = {
  entitlement_id: string;
  checkout_intent_id: string | null;
  product_id: string;
  source_commerce_product_id: string | null;
  entitlement_template_id: string;
  access_rule_id: string;
  entitlement_status: string;
  grant_kind: string;
  source_price_id: string | null;
  granted_at: number | string;
  updated_at: number | string;
  checkout_status: string | null;
  checkout_product_id: string | null;
  checkout_price_id: string | null;
  buyer_email: string | null;
  amount_cents: number | string | null;
  currency: string | null;
  source_product_name: string | null;
  source_product_slug: string | null;
  source_price_nickname: string | null;
  source_price_amount_cents: number | string | null;
  source_price_billing_interval: string | null;
  fulfillment_task_id: string | null;
  fulfillment_status: string | null;
  fulfillment_kind: string | null;
  fulfillment_summary: string | null;
  fulfillment_created_at: number | string | null;
  fulfillment_updated_at: number | string | null;
  source_event_available: number | string | null;
  raw_stripe_reference_available: number | string | null;
};

export type ProductEntitlementInspectionCount = {
  id: string;
  status: string;
  total: number;
};

export type ProductEntitlementInspectionSummary = {
  id: string;
  status: typeof productEntitlementInspectionStatus;
  issue: typeof productEntitlementInspectionIssue;
  parentIssue: 16;
  ownerRoute: typeof productEntitlementInspectionOwnerRoute;
  publicSourceDataRoute: "/products/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    entitlements: number;
    activeEntitlements: number;
    fulfillmentTasks: number;
    queuedFulfillmentTasks: number;
    checkoutIntentsWithEntitlements: number;
  };
  lastGrantedAt: string | null;
  lastFulfillmentAt: string | null;
  productCounts: ProductEntitlementInspectionCount[];
  templateCounts: ProductEntitlementInspectionCount[];
  fulfillmentCounts: ProductEntitlementInspectionCount[];
  redaction: {
    privateBuyerDataIncluded: false;
    rawBuyerEmailIncluded: false;
    buyerEmailHashIncluded: false;
    rawStripeIdsIncluded: false;
    rawR2KeysIncluded: false;
    signedUrlsIncluded: false;
    metadataJsonIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AdminProductEntitlement = {
  id: string;
  checkoutIntentId: string | null;
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
  grantSummary: string;
  sourcePriceId: string | null;
  sourcePriceLabel: string | null;
  sourcePriceAmount: string | null;
  checkoutStatus: string | null;
  checkoutProductId: string | null;
  checkoutPriceId: string | null;
  buyerEmail: string | null;
  checkoutAmount: string | null;
  grantedAt: string;
  updatedAt: string;
  fulfillment: {
    id: string | null;
    status: string | null;
    kind: string | null;
    summary: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  sourceEventAvailable: boolean;
  rawStripeReferenceAvailable: boolean;
};

export type AdminProductEntitlementInspectionState = ProductEntitlementInspectionSummary & {
  privateBuyerDataIncluded: true;
  rawStripeIdsIncluded: false;
  rawHashesIncluded: false;
  entitlements: AdminProductEntitlement[];
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

function booleanValue(value: number | string | null | undefined) {
  return numberValue(value) > 0;
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

function dimensionCounts(rows: DimensionCountRow[]): ProductEntitlementInspectionCount[] {
  return rows
    .filter((row) => row.id)
    .map((row) => ({
      id: row.id ?? "unknown",
      status: row.status ?? "unknown",
      total: numberValue(row.total),
    }));
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

function emptySummary(
  source: ProductEntitlementInspectionSummary["source"],
  loadError: string | null,
): ProductEntitlementInspectionSummary {
  return {
    id: "product-entitlement-inspection-contract",
    status: productEntitlementInspectionStatus,
    issue: productEntitlementInspectionIssue,
    parentIssue: 16,
    ownerRoute: productEntitlementInspectionOwnerRoute,
    publicSourceDataRoute: "/products/source-data",
    source,
    loadError,
    counts: {
      entitlements: 0,
      activeEntitlements: 0,
      fulfillmentTasks: 0,
      queuedFulfillmentTasks: 0,
      checkoutIntentsWithEntitlements: 0,
    },
    lastGrantedAt: null,
    lastFulfillmentAt: null,
    productCounts: [],
    templateCounts: [],
    fulfillmentCounts: [],
    redaction: {
      privateBuyerDataIncluded: false,
      rawBuyerEmailIncluded: false,
      buyerEmailHashIncluded: false,
      rawStripeIdsIncluded: false,
      rawR2KeysIncluded: false,
      signedUrlsIncluded: false,
      metadataJsonIncluded: false,
    },
    privateFieldsExcluded: [
      "buyerEmail",
      "buyerEmailHash",
      "sourceStripeEventId",
      "stripeCheckoutSessionId",
      "stripePaymentIntentId",
      "stripeSubscriptionId",
      "metadataJson",
      "privateR2ObjectKeys",
      "signedUrls",
    ],
    writeBoundary:
      "Issue #139 exposes owner-gated product entitlement and fulfillment inspection plus public aggregate source-data. Signed downloads, protected lessons, revocations, subscription access changes, refunds, customer portals, private asset delivery, and direct agent entitlement writes still require future confirmed-write APIs.",
  };
}

function adminEntitlement(row: EntitlementRow): AdminProductEntitlement {
  const products = productById();
  const templates = templateById();
  const accessRules = accessRuleById();
  const mappings = mappingByTemplateAndPrice();
  const product = products.get(row.product_id);
  const template = templates.get(row.entitlement_template_id);
  const accessRule = accessRules.get(row.access_rule_id);
  const mapping = mappings.get(`${row.entitlement_template_id}:${row.source_price_id ?? row.checkout_price_id ?? ""}`);

  return {
    id: row.entitlement_id,
    checkoutIntentId: row.checkout_intent_id,
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
    grantSummary: mapping?.grantSummary ?? "Granted from trusted checkout evidence.",
    sourcePriceId: row.source_price_id,
    sourcePriceLabel: row.source_price_nickname,
    sourcePriceAmount: moneyValue(row.source_price_amount_cents, row.currency),
    checkoutStatus: row.checkout_status,
    checkoutProductId: row.checkout_product_id,
    checkoutPriceId: row.checkout_price_id,
    buyerEmail: row.buyer_email,
    checkoutAmount: moneyValue(row.amount_cents, row.currency),
    grantedAt: timestampValue(row.granted_at) ?? "Unknown",
    updatedAt: timestampValue(row.updated_at) ?? "Unknown",
    fulfillment: {
      id: row.fulfillment_task_id,
      status: row.fulfillment_status,
      kind: row.fulfillment_kind,
      summary: row.fulfillment_summary,
      createdAt: timestampValue(row.fulfillment_created_at),
      updatedAt: timestampValue(row.fulfillment_updated_at),
    },
    sourceEventAvailable: booleanValue(row.source_event_available),
    rawStripeReferenceAvailable: booleanValue(row.raw_stripe_reference_available),
  };
}

export async function getProductEntitlementInspectionSummary(): Promise<ProductEntitlementInspectionSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM product_entitlements) AS entitlement_count,
          (SELECT COUNT(*) FROM product_entitlements WHERE status = 'active') AS active_entitlement_count,
          (SELECT COUNT(*) FROM product_fulfillment_tasks) AS fulfillment_task_count,
          (SELECT COUNT(*) FROM product_fulfillment_tasks WHERE status = 'queued') AS queued_fulfillment_task_count,
          (SELECT COUNT(DISTINCT checkout_intent_id) FROM product_entitlements WHERE checkout_intent_id IS NOT NULL) AS checkout_intent_count,
          (SELECT MAX(granted_at) FROM product_entitlements) AS last_granted_at,
          (SELECT MAX(updated_at) FROM product_fulfillment_tasks) AS last_fulfillment_at`,
      )
      .first<CountRow>();

    const productCounts = await db
      .prepare(
        `SELECT product_id AS id, status, COUNT(*) AS total
        FROM product_entitlements
        GROUP BY product_id, status
        ORDER BY total DESC, product_id ASC`,
      )
      .all<DimensionCountRow>();
    const templateCounts = await db
      .prepare(
        `SELECT entitlement_template_id AS id, status, COUNT(*) AS total
        FROM product_entitlements
        GROUP BY entitlement_template_id, status
        ORDER BY total DESC, entitlement_template_id ASC`,
      )
      .all<DimensionCountRow>();
    const fulfillmentCounts = await db
      .prepare(
        `SELECT fulfillment_kind AS id, status, COUNT(*) AS total
        FROM product_fulfillment_tasks
        GROUP BY fulfillment_kind, status
        ORDER BY total DESC, fulfillment_kind ASC`,
      )
      .all<DimensionCountRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        entitlements: numberValue(counts?.entitlement_count),
        activeEntitlements: numberValue(counts?.active_entitlement_count),
        fulfillmentTasks: numberValue(counts?.fulfillment_task_count),
        queuedFulfillmentTasks: numberValue(counts?.queued_fulfillment_task_count),
        checkoutIntentsWithEntitlements: numberValue(counts?.checkout_intent_count),
      },
      lastGrantedAt: timestampValue(counts?.last_granted_at),
      lastFulfillmentAt: timestampValue(counts?.last_fulfillment_at),
      productCounts: dimensionCounts(productCounts.results ?? []),
      templateCounts: dimensionCounts(templateCounts.results ?? []),
      fulfillmentCounts: dimensionCounts(fulfillmentCounts.results ?? []),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load product entitlement inspection.",
    );
  }
}

export async function getAdminProductEntitlementInspectionState(): Promise<AdminProductEntitlementInspectionState> {
  const summary = await getProductEntitlementInspectionSummary();

  try {
    const { db } = await getRuntime();
    const entitlements = await db
      .prepare(
        `SELECT
          e.id AS entitlement_id,
          e.checkout_intent_id,
          e.product_id,
          e.source_commerce_product_id,
          e.entitlement_template_id,
          e.access_rule_id,
          e.status AS entitlement_status,
          e.grant_kind,
          e.source_price_id,
          e.granted_at,
          e.updated_at,
          ci.status AS checkout_status,
          ci.product_id AS checkout_product_id,
          ci.price_id AS checkout_price_id,
          ci.buyer_email,
          ci.amount_cents,
          ci.currency,
          source_product.name AS source_product_name,
          source_product.slug AS source_product_slug,
          source_price.nickname AS source_price_nickname,
          source_price.unit_amount_cents AS source_price_amount_cents,
          source_price.billing_interval AS source_price_billing_interval,
          ft.id AS fulfillment_task_id,
          ft.status AS fulfillment_status,
          ft.fulfillment_kind,
          ft.summary AS fulfillment_summary,
          ft.created_at AS fulfillment_created_at,
          ft.updated_at AS fulfillment_updated_at,
          CASE WHEN e.source_stripe_event_id IS NULL THEN 0 ELSE 1 END AS source_event_available,
          CASE
            WHEN ci.stripe_checkout_session_id IS NULL
              AND ci.stripe_payment_intent_id IS NULL
              AND ci.stripe_subscription_id IS NULL
            THEN 0
            ELSE 1
          END AS raw_stripe_reference_available
        FROM product_entitlements e
        LEFT JOIN checkout_intents ci ON ci.id = e.checkout_intent_id
        LEFT JOIN commerce_products source_product ON source_product.id = e.source_commerce_product_id
        LEFT JOIN commerce_prices source_price ON source_price.id = COALESCE(e.source_price_id, ci.price_id)
        LEFT JOIN product_fulfillment_tasks ft ON ft.entitlement_id = e.id
        ORDER BY e.granted_at DESC
        LIMIT 25`,
      )
      .all<EntitlementRow>();

    return {
      ...summary,
      privateBuyerDataIncluded: true,
      rawStripeIdsIncluded: false,
      rawHashesIncluded: false,
      entitlements: (entitlements.results ?? []).map(adminEntitlement),
    };
  } catch (error) {
    return {
      ...summary,
      source: "unavailable",
      loadError: error instanceof Error ? error.message : "Unable to load product entitlement rows.",
      privateBuyerDataIncluded: true,
      rawStripeIdsIncluded: false,
      rawHashesIncluded: false,
      entitlements: [],
    };
  }
}
