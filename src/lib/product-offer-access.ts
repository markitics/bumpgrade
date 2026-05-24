import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";

export const productOfferAccessIssue = 405;
export const productOfferAccessParentIssue = 16;
export const productOfferAccessStatus = "owner-product-offer-access-ready";
export const productOfferAccessApiRoute = "/api/admin/products/offer-access-grants";
export const productOfferAccessConfirmationText = "Link product and create test access grant";

type ProductOfferAccessRuntime = {
  db: D1Database;
};

type ProductOfferAccessRedaction = {
  actorEmailIncluded: false;
  actorUserIdIncluded: false;
  buyerEmailIncluded: false;
  buyerEmailHashIncluded: false;
  idempotencyKeysIncluded: false;
  publicCheckoutIntentIdsIncluded: false;
  publicEntitlementIdsIncluded: false;
  rawStripeIdsIncluded: false;
  liveBillingEnabled: false;
  stripeCheckoutSessionCreated: false;
  fulfillmentDeliveryEnabled: false;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  status: string;
  fulfillment_kind: string;
};

type ProductOfferAccessIntentRow = {
  id: string;
  idempotency_key: string;
  product_id: string;
  checkout_intent_id: string;
  entitlement_id: string;
  fulfillment_task_id: string;
  offer_id: string;
  funnel_id: string;
  test_price_id: string;
  buyer_email_hash: string;
  amount_cents: number | string;
  currency: string;
  entitlement_template_id: string;
  access_rule_id: string;
  status: string;
  offer_link_created: number | boolean;
  test_checkout_intent_created: number | boolean;
  entitlement_grant_created: number | boolean;
  billing_mutation_enabled: number | boolean;
  stripe_checkout_session_created: number | boolean;
  live_charge_created: number | boolean;
  raw_buyer_email_included: number | boolean;
  created_at: number | string;
  updated_at: number | string;
  product_slug: string;
  product_name: string;
  product_kind: string;
  product_status: string;
  fulfillment_kind: string;
  checkout_status: string | null;
  entitlement_status: string | null;
  fulfillment_status: string | null;
};

type ProductOfferAccessAggregateRow = {
  total_intents: number | string | null;
  linked_products: number | string | null;
  test_checkout_intents: number | string | null;
  active_test_entitlements: number | string | null;
  latest_created_at: number | string | null;
};

export type ProductOfferAccessRecord = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productKind: string;
  productStatus: string;
  offerId: string;
  funnelId: string;
  testPriceId: string;
  amountCents: number;
  currency: string;
  entitlementTemplateId: string;
  accessRuleId: string;
  checkoutIntentId: string;
  checkoutStatus: string | null;
  entitlementId: string;
  entitlementStatus: string | null;
  fulfillmentTaskId: string;
  fulfillmentStatus: string | null;
  fulfillmentKind: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  offerLinkCreated: boolean;
  testCheckoutIntentCreated: boolean;
  entitlementGrantCreated: boolean;
  billingMutationEnabled: false;
  stripeCheckoutSessionCreated: false;
  liveChargeCreated: false;
  rawBuyerEmailIncluded: false;
  redaction: ProductOfferAccessRedaction;
};

export type ProductOfferAccessInput = {
  productId: string | null | undefined;
  offerId?: string | null;
  funnelId?: string | null;
  buyerEmail?: string | null;
  amountCents?: number | string | null;
  currency?: string | null;
  confirmationText: string | null | undefined;
  idempotencyKey: string | null | undefined;
  actor: AdminIdentity;
};

export type ProductOfferAccessResult =
  | {
      ok: true;
      status: typeof productOfferAccessStatus | "owner-product-offer-access-replayed";
      issue: typeof productOfferAccessIssue;
      duplicate: boolean;
      record: ProductOfferAccessRecord;
    }
  | {
      ok: false;
      status: "invalid_request" | "confirmation_required" | "product_not_found" | "idempotency_conflict" | "unavailable";
      issue: typeof productOfferAccessIssue;
      message: string;
      redaction: ProductOfferAccessRedaction;
    };

export const productOfferAccessRedaction: ProductOfferAccessRedaction = {
  actorEmailIncluded: false,
  actorUserIdIncluded: false,
  buyerEmailIncluded: false,
  buyerEmailHashIncluded: false,
  idempotencyKeysIncluded: false,
  publicCheckoutIntentIdsIncluded: false,
  publicEntitlementIdsIncluded: false,
  rawStripeIdsIncluded: false,
  liveBillingEnabled: false,
  stripeCheckoutSessionCreated: false,
  fulfillmentDeliveryEnabled: false,
};

export const productOfferAccessSummaryContract = {
  id: "owner-product-offer-access-grants",
  status: productOfferAccessStatus,
  issue: productOfferAccessIssue,
  parentIssue: productOfferAccessParentIssue,
  apiRoute: productOfferAccessApiRoute,
  sourceDataRoute: "/products/source-data",
  ownerRoute: "/admin/products",
  ownerAuthBoundary: "Better Auth owner session",
  confirmation: {
    required: true,
    text: productOfferAccessConfirmationText,
  },
  idempotencyRequired: true,
  defaultOfferIdPrefix: "offer-owner-product-test",
  defaultFunnelIdPrefix: "funnel-owner-product-test",
  writeBoundary:
    "Owners can link an owner-created draft product to test offer/funnel IDs and create a synthetic test checkout intent, product entitlement, fulfillment task evidence, and payment audit event after exact confirmation and idempotency. This does not create Stripe products, Stripe prices, Checkout Sessions, live charges, published offer copy, customer-facing fulfillment delivery, raw buyer exposure, or direct unauthenticated agent writes.",
  redaction: productOfferAccessRedaction,
};

export type ProductOfferAccessSummary = typeof productOfferAccessSummaryContract & {
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    grantIntents: number;
    linkedProducts: number;
    testCheckoutIntents: number;
    activeTestEntitlements: number;
  };
  latestCreatedAt: string | null;
  recordsIncluded: false;
};

export type AdminProductOfferAccessState = ProductOfferAccessSummary & {
  records: ProductOfferAccessRecord[];
};

function normalizeRequired(value: string | null | undefined, maxLength: number) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeOptional(value: string | null | undefined, maxLength: number) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeCurrency(value: string | null | undefined) {
  const normalized = normalizeOptional(value, 8)?.toLowerCase() ?? "usd";
  return /^[a-z]{3}$/.test(normalized) ? normalized : "usd";
}

function normalizeAmountCents(value: number | string | null | undefined) {
  const amount = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(amount)) return 900;
  return Math.max(100, Math.min(999_900, Math.round(amount)));
}

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function safeId(prefix: string, value: string) {
  return `${prefix}-${value}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function isoFromSeconds(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function boolValue(value: number | boolean | null | undefined) {
  return value === true || value === 1;
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data.buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashNullable(value: string | null | undefined) {
  const normalized = normalizeOptional(value, 180)?.toLowerCase();
  return normalized ? sha256(normalized) : null;
}

async function actorEmailHash(actor: AdminIdentity) {
  return sha256((actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
}

async function getRuntime(): Promise<ProductOfferAccessRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function resultError(
  status: Extract<ProductOfferAccessResult, { ok: false }>["status"],
  message: string,
): ProductOfferAccessResult {
  return {
    ok: false,
    status,
    issue: productOfferAccessIssue,
    message,
    redaction: productOfferAccessRedaction,
  };
}

function publicRecord(row: ProductOfferAccessIntentRow): ProductOfferAccessRecord {
  return {
    id: row.id,
    productId: row.product_id,
    productSlug: row.product_slug,
    productName: row.product_name,
    productKind: row.product_kind,
    productStatus: row.product_status,
    offerId: row.offer_id,
    funnelId: row.funnel_id,
    testPriceId: row.test_price_id,
    amountCents: Number(row.amount_cents ?? 0),
    currency: row.currency,
    entitlementTemplateId: row.entitlement_template_id,
    accessRuleId: row.access_rule_id,
    checkoutIntentId: row.checkout_intent_id,
    checkoutStatus: row.checkout_status,
    entitlementId: row.entitlement_id,
    entitlementStatus: row.entitlement_status,
    fulfillmentTaskId: row.fulfillment_task_id,
    fulfillmentStatus: row.fulfillment_status,
    fulfillmentKind: row.fulfillment_kind,
    status: row.status,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
    offerLinkCreated: boolValue(row.offer_link_created),
    testCheckoutIntentCreated: boolValue(row.test_checkout_intent_created),
    entitlementGrantCreated: boolValue(row.entitlement_grant_created),
    billingMutationEnabled: false,
    stripeCheckoutSessionCreated: false,
    liveChargeCreated: false,
    rawBuyerEmailIncluded: false,
    redaction: productOfferAccessRedaction,
  };
}

async function intentWithRecord(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        intent.id,
        intent.idempotency_key,
        intent.product_id,
        intent.checkout_intent_id,
        intent.entitlement_id,
        intent.fulfillment_task_id,
        intent.offer_id,
        intent.funnel_id,
        intent.test_price_id,
        intent.buyer_email_hash,
        intent.amount_cents,
        intent.currency,
        intent.entitlement_template_id,
        intent.access_rule_id,
        intent.status,
        intent.offer_link_created,
        intent.test_checkout_intent_created,
        intent.entitlement_grant_created,
        intent.billing_mutation_enabled,
        intent.stripe_checkout_session_created,
        intent.live_charge_created,
        intent.raw_buyer_email_included,
        intent.created_at,
        intent.updated_at,
        product.slug AS product_slug,
        product.name AS product_name,
        product.kind AS product_kind,
        product.status AS product_status,
        product.fulfillment_kind,
        checkout.status AS checkout_status,
        entitlement.status AS entitlement_status,
        task.status AS fulfillment_status
      FROM product_offer_access_grant_intents intent
      JOIN commerce_products product ON product.id = intent.product_id
      LEFT JOIN checkout_intents checkout ON checkout.id = intent.checkout_intent_id
      LEFT JOIN product_entitlements entitlement ON entitlement.id = intent.entitlement_id
      LEFT JOIN product_fulfillment_tasks task ON task.id = intent.fulfillment_task_id
      WHERE intent.idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<ProductOfferAccessIntentRow>();
}

export async function createProductOfferAccessGrant(
  input: ProductOfferAccessInput,
): Promise<ProductOfferAccessResult> {
  if (input.confirmationText !== productOfferAccessConfirmationText) {
    return resultError("confirmation_required", "Exact product offer/access confirmation text is required.");
  }

  const productId = normalizeRequired(input.productId, 160);
  const idempotencyKey = normalizeRequired(input.idempotencyKey, 220);
  const currency = normalizeCurrency(input.currency);
  const amountCents = normalizeAmountCents(input.amountCents);

  if (!productId || !idempotencyKey) {
    return resultError("invalid_request", "productId, confirmationText, and idempotencyKey are required.");
  }

  try {
    const { db } = await getRuntime();
    const existingIntent = await intentWithRecord(db, idempotencyKey);
    const buyerHash = await hashNullable(input.buyerEmail);

    if (existingIntent) {
      const requestedBuyerHash = buyerHash ?? (await sha256(`test-buyer+${existingIntent.product_slug}@bumpgrade.local`));
      const sameRequest =
        existingIntent.product_id === productId &&
        existingIntent.offer_id === (normalizeOptional(input.offerId, 120) ?? safeId("offer-owner-product-test", existingIntent.product_slug)) &&
        existingIntent.funnel_id === (normalizeOptional(input.funnelId, 120) ?? safeId("funnel-owner-product-test", existingIntent.product_slug)) &&
        Number(existingIntent.amount_cents) === amountCents &&
        existingIntent.currency === currency &&
        existingIntent.buyer_email_hash === requestedBuyerHash;

      if (!sameRequest) {
        return resultError(
          "idempotency_conflict",
          "That idempotency key already belongs to a different product offer/access request.",
        );
      }

      return {
        ok: true,
        status: "owner-product-offer-access-replayed",
        issue: productOfferAccessIssue,
        duplicate: true,
        record: publicRecord(existingIntent),
      };
    }

    const product = await db
      .prepare(
        `SELECT product.id, product.slug, product.name, product.kind, product.status, product.fulfillment_kind
        FROM commerce_products product
        JOIN product_creation_intents creation_intent ON creation_intent.product_id = product.id
        WHERE product.id = ?
        LIMIT 1`,
      )
      .bind(productId)
      .first<ProductRow>();
    if (!product) {
      return resultError("product_not_found", "That owner-created product could not be found.");
    }

    const offerId = normalizeOptional(input.offerId, 120) ?? safeId("offer-owner-product-test", product.slug);
    const funnelId = normalizeOptional(input.funnelId, 120) ?? safeId("funnel-owner-product-test", product.slug);
    const testPriceId = safeId(`price-owner-${currency}-${amountCents}`, product.slug);
    const checkoutIntentId = runtimeId("checkout-intent");
    const entitlementTemplateId = safeId("entitlement-template-owner-created", product.slug);
    const accessRuleId = safeId("access-rule-owner-created-test-grant", product.slug);
    const entitlementId = `entitlement-${checkoutIntentId}-${entitlementTemplateId}`;
    const fulfillmentTaskId = `fulfillment-${checkoutIntentId}-${entitlementTemplateId}`;
    const intentId = runtimeId("product-offer-access-grant");
    const auditId = runtimeId("audit-owner-product-test-grant");
    const actorHash = await actorEmailHash(input.actor);
    const confirmationTextSha256 = await sha256(productOfferAccessConfirmationText);
    const normalizedBuyerEmail =
      normalizeOptional(input.buyerEmail, 180)?.toLowerCase() ?? `test-buyer+${product.slug}@bumpgrade.local`;
    const resolvedBuyerHash = buyerHash ?? (await sha256(normalizedBuyerEmail));
    const metadataJson = JSON.stringify({
      issue: productOfferAccessIssue,
      parentIssue: productOfferAccessParentIssue,
      offerId,
      funnelId,
      productSlug: product.slug,
      productKind: product.kind,
      testMode: true,
      billingMutationEnabled: false,
      stripeCheckoutSessionCreated: false,
      liveChargeCreated: false,
      fulfillmentDeliveryEnabled: false,
      rawBuyerEmailIncluded: false,
      rawOwnerEmailIncluded: false,
      directAgentWriteEnabled: false,
    });

    await db.batch([
      db
        .prepare(
          `INSERT OR IGNORE INTO commerce_prices (
            id, product_id, nickname, currency, unit_amount_cents, billing_interval, stripe_price_id,
            active, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'one_time', NULL, 0, ?, unixepoch(), unixepoch())`,
        )
        .bind(testPriceId, product.id, `Test price for ${product.name}`, currency, amountCents, metadataJson),
      db
        .prepare(
          `INSERT INTO checkout_intents (
            id, idempotency_key, checkout_kind, status, product_id, price_id, owner_user_id,
            buyer_email, amount_cents, currency, stripe_mode, confirmation_required, confirmed_at,
            audit_correlation_id, metadata_json, created_at, updated_at
          ) VALUES (?, ?, 'owner_product_test_purchase', 'paid', ?, ?, ?, ?, ?, ?, 'test', 1, unixepoch(), ?, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          checkoutIntentId,
          `checkout-${idempotencyKey}`,
          product.id,
          testPriceId,
          input.actor.userId,
          normalizedBuyerEmail,
          amountCents,
          currency,
          auditId,
          metadataJson,
        ),
      db
        .prepare(
          `INSERT INTO product_entitlements (
            id, checkout_intent_id, source_stripe_event_id, product_id, source_commerce_product_id,
            entitlement_template_id, access_rule_id, status, grant_kind, buyer_email_hash, source_price_id,
            metadata_json, granted_at, updated_at
          ) VALUES (?, ?, NULL, ?, ?, ?, ?, 'active', 'owner_created_product_test_purchase', ?, ?, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          entitlementId,
          checkoutIntentId,
          product.id,
          product.id,
          entitlementTemplateId,
          accessRuleId,
          resolvedBuyerHash,
          testPriceId,
          metadataJson,
        ),
      db
        .prepare(
          `INSERT INTO product_fulfillment_tasks (
            id, entitlement_id, checkout_intent_id, product_id, status, fulfillment_kind, summary,
            metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'queued', ?, ?, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          fulfillmentTaskId,
          entitlementId,
          checkoutIntentId,
          product.id,
          product.fulfillment_kind,
          `Queued test fulfillment evidence for owner-created product ${product.name}.`,
          metadataJson,
        ),
      db
        .prepare(
          `INSERT INTO payment_audit_events (
            id, checkout_intent_id, stripe_event_id, event_kind, actor_kind, actor_id, summary, metadata_json, created_at
          ) VALUES (?, ?, NULL, 'owner_created_product_test_access_granted', 'owner_admin', ?, ?, ?, unixepoch())`,
        )
        .bind(
          auditId,
          checkoutIntentId,
          input.actor.userId,
          `Owner-created product ${product.name} linked to a test offer/funnel and granted test access.`,
          metadataJson,
        ),
      db
        .prepare(
          `INSERT INTO product_offer_access_grant_intents (
            id, idempotency_key, product_id, checkout_intent_id, entitlement_id, fulfillment_task_id,
            actor_user_id, actor_email_hash, actor_role, offer_id, funnel_id, test_price_id, buyer_email_hash,
            amount_cents, currency, entitlement_template_id, access_rule_id, status, confirmation_text_sha256,
            offer_link_created, test_checkout_intent_created, entitlement_grant_created, billing_mutation_enabled,
            stripe_checkout_session_created, live_charge_created, raw_buyer_email_included, metadata_json,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'test_access_grant_recorded', ?, 1, 1, 1, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          intentId,
          idempotencyKey,
          product.id,
          checkoutIntentId,
          entitlementId,
          fulfillmentTaskId,
          input.actor.userId,
          actorHash,
          input.actor.role,
          offerId,
          funnelId,
          testPriceId,
          resolvedBuyerHash,
          amountCents,
          currency,
          entitlementTemplateId,
          accessRuleId,
          confirmationTextSha256,
          metadataJson,
        ),
    ]);

    const inserted = await intentWithRecord(db, idempotencyKey);
    if (!inserted) {
      throw new Error("Product offer/access grant could not be read after insert.");
    }

    return {
      ok: true,
      status: productOfferAccessStatus,
      issue: productOfferAccessIssue,
      duplicate: false,
      record: publicRecord(inserted),
    };
  } catch (error) {
    return resultError("unavailable", error instanceof Error ? error.message : "Unable to create product offer/access grant.");
  }
}

export async function getProductOfferAccessSummary(): Promise<ProductOfferAccessSummary> {
  try {
    const { db } = await getRuntime();
    const aggregate = await db
      .prepare(
        `SELECT
          COUNT(*) AS total_intents,
          COUNT(DISTINCT product_id) AS linked_products,
          COUNT(DISTINCT checkout_intent_id) AS test_checkout_intents,
          SUM(CASE WHEN entitlement_grant_created = 1 THEN 1 ELSE 0 END) AS active_test_entitlements,
          MAX(created_at) AS latest_created_at
        FROM product_offer_access_grant_intents`,
      )
      .first<ProductOfferAccessAggregateRow>();

    return {
      ...productOfferAccessSummaryContract,
      source: "d1",
      loadError: null,
      counts: {
        grantIntents: Number(aggregate?.total_intents ?? 0),
        linkedProducts: Number(aggregate?.linked_products ?? 0),
        testCheckoutIntents: Number(aggregate?.test_checkout_intents ?? 0),
        activeTestEntitlements: Number(aggregate?.active_test_entitlements ?? 0),
      },
      latestCreatedAt: isoFromSeconds(aggregate?.latest_created_at),
      recordsIncluded: false,
    };
  } catch (error) {
    return {
      ...productOfferAccessSummaryContract,
      source: "unavailable",
      loadError: error instanceof Error ? error.message : "Unable to load product offer/access summary.",
      counts: {
        grantIntents: 0,
        linkedProducts: 0,
        testCheckoutIntents: 0,
        activeTestEntitlements: 0,
      },
      latestCreatedAt: null,
      recordsIncluded: false,
    };
  }
}

export async function getAdminProductOfferAccessState(): Promise<AdminProductOfferAccessState> {
  const summary = await getProductOfferAccessSummary();
  if (summary.source !== "d1") return { ...summary, records: [] };

  try {
    const { db } = await getRuntime();
    const records = await db
      .prepare(
        `SELECT
          intent.id,
          intent.idempotency_key,
          intent.product_id,
          intent.checkout_intent_id,
          intent.entitlement_id,
          intent.fulfillment_task_id,
          intent.offer_id,
          intent.funnel_id,
          intent.test_price_id,
          intent.buyer_email_hash,
          intent.amount_cents,
          intent.currency,
          intent.entitlement_template_id,
          intent.access_rule_id,
          intent.status,
          intent.offer_link_created,
          intent.test_checkout_intent_created,
          intent.entitlement_grant_created,
          intent.billing_mutation_enabled,
          intent.stripe_checkout_session_created,
          intent.live_charge_created,
          intent.raw_buyer_email_included,
          intent.created_at,
          intent.updated_at,
          product.slug AS product_slug,
          product.name AS product_name,
          product.kind AS product_kind,
          product.status AS product_status,
          product.fulfillment_kind,
          checkout.status AS checkout_status,
          entitlement.status AS entitlement_status,
          task.status AS fulfillment_status
        FROM product_offer_access_grant_intents intent
        JOIN commerce_products product ON product.id = intent.product_id
        LEFT JOIN checkout_intents checkout ON checkout.id = intent.checkout_intent_id
        LEFT JOIN product_entitlements entitlement ON entitlement.id = intent.entitlement_id
        LEFT JOIN product_fulfillment_tasks task ON task.id = intent.fulfillment_task_id
        ORDER BY intent.created_at DESC
        LIMIT 8`,
      )
      .all<ProductOfferAccessIntentRow>();

    return {
      ...summary,
      records: (records.results ?? []).map(publicRecord),
    };
  } catch {
    return { ...summary, records: [] };
  }
}
