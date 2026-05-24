import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";

export const productTestCheckoutIssue = 407;
export const productTestCheckoutParentIssue = 16;
export const productTestCheckoutStatus = "owner-product-test-checkout-ready";
export const productTestCheckoutLinkApiRoute = "/api/admin/products/test-checkout-links";
export const productTestCheckoutApiRoute = "/api/products/test-checkout";
export const productTestCheckoutRoutePrefix = "/products/test-checkout";
export const productTestCheckoutLinkConfirmationText = "Create test checkout link for owner product";
export const productTestCheckoutConfirmationText = "Complete test checkout for owner product";

type ProductTestCheckoutRuntime = {
  db: D1Database;
};

type ProductTestCheckoutRedaction = {
  actorEmailIncluded: false;
  actorUserIdIncluded: false;
  buyerEmailIncluded: false;
  buyerEmailHashIncluded: false;
  idempotencyKeysIncluded: false;
  publicCheckoutLinkIdsIncluded: false;
  publicCheckoutIntentIdsIncluded: false;
  publicEntitlementIdsIncluded: false;
  rawStripeIdsIncluded: false;
  liveBillingEnabled: false;
  stripeCheckoutSessionCreated: false;
  liveChargeCreated: false;
  fulfillmentDeliveryEnabled: false;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  status: string;
  description: string | null;
  fulfillment_kind: string;
  updated_at: number | string;
};

type ProductTestCheckoutLinkRow = {
  id: string;
  idempotency_key: string;
  product_id: string;
  test_price_id: string;
  public_path: string;
  amount_cents: number | string;
  currency: string;
  status: string;
  revision_id: string;
  product_updated_at: number | string;
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
};

type ProductTestCheckoutPurchaseRow = {
  id: string;
  idempotency_key: string;
  checkout_link_id: string;
  product_id: string;
  checkout_intent_id: string;
  entitlement_id: string;
  fulfillment_task_id: string;
  buyer_email_hash: string;
  amount_cents: number | string;
  currency: string;
  test_price_id: string;
  entitlement_template_id: string;
  access_rule_id: string;
  expected_link_revision_id: string;
  link_revision_id: string;
  status: string;
  billing_mutation_enabled: number | boolean;
  stripe_checkout_session_created: number | boolean;
  live_charge_created: number | boolean;
  raw_buyer_email_included: number | boolean;
  created_at: number | string;
  updated_at: number | string;
  public_path: string;
  product_slug: string;
  product_name: string;
  product_kind: string;
  product_status: string;
  fulfillment_kind: string;
  checkout_status: string | null;
  entitlement_status: string | null;
  fulfillment_status: string | null;
};

type ProductTestCheckoutAggregateRow = {
  total_links: number | string | null;
  active_links: number | string | null;
  total_purchases: number | string | null;
  active_test_entitlements: number | string | null;
  latest_link_created_at: number | string | null;
  latest_purchase_created_at: number | string | null;
};

export type ProductTestCheckoutLinkRecord = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productKind: string;
  productStatus: string;
  fulfillmentKind: string;
  testPriceId: string;
  publicPath: string;
  amountCents: number;
  currency: string;
  status: string;
  revisionId: string;
  productUpdatedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  billingMutationEnabled: false;
  stripeCheckoutSessionCreated: false;
  liveChargeCreated: false;
  rawBuyerEmailIncluded: false;
  redaction: ProductTestCheckoutRedaction;
};

export type ProductTestCheckoutPurchaseRecord = {
  id: string;
  checkoutLinkId: string;
  productId: string;
  productSlug: string;
  productName: string;
  productKind: string;
  productStatus: string;
  fulfillmentKind: string;
  publicPath: string;
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
  status: string;
  linkRevisionId: string;
  expectedLinkRevisionId: string;
  createdAt: string | null;
  updatedAt: string | null;
  billingMutationEnabled: false;
  stripeCheckoutSessionCreated: false;
  liveChargeCreated: false;
  rawBuyerEmailIncluded: false;
  redaction: ProductTestCheckoutRedaction;
};

export type ProductTestCheckoutLinkInput = {
  productId: string | null | undefined;
  amountCents?: number | string | null;
  currency?: string | null;
  expectedProductUpdatedAt: string | null | undefined;
  confirmationText: string | null | undefined;
  idempotencyKey: string | null | undefined;
  actor: AdminIdentity;
};

export type ProductTestCheckoutPurchaseInput = {
  linkId: string | null | undefined;
  buyerEmail: string | null | undefined;
  expectedLinkRevisionId: string | null | undefined;
  confirmationText: string | null | undefined;
  idempotencyKey: string | null | undefined;
  agentClientId?: string | null;
};

export type ProductTestCheckoutLinkResult =
  | {
      ok: true;
      status: typeof productTestCheckoutStatus | "owner-product-test-checkout-link-replayed";
      issue: typeof productTestCheckoutIssue;
      duplicate: boolean;
      link: ProductTestCheckoutLinkRecord;
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "product_not_found"
        | "stale_product_state"
        | "idempotency_conflict"
        | "unavailable";
      issue: typeof productTestCheckoutIssue;
      message: string;
      redaction: ProductTestCheckoutRedaction;
    };

export type ProductTestCheckoutPurchaseResult =
  | {
      ok: true;
      status: typeof productTestCheckoutStatus | "owner-product-test-checkout-replayed";
      issue: typeof productTestCheckoutIssue;
      duplicate: boolean;
      checkout: ProductTestCheckoutPurchaseRecord & {
        entitlementLookupUrl: string;
      };
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "checkout_link_not_found"
        | "stale_link_state"
        | "idempotency_conflict"
        | "unavailable";
      issue: typeof productTestCheckoutIssue;
      message: string;
      redaction: ProductTestCheckoutRedaction;
    };

export const productTestCheckoutRedaction: ProductTestCheckoutRedaction = {
  actorEmailIncluded: false,
  actorUserIdIncluded: false,
  buyerEmailIncluded: false,
  buyerEmailHashIncluded: false,
  idempotencyKeysIncluded: false,
  publicCheckoutLinkIdsIncluded: false,
  publicCheckoutIntentIdsIncluded: false,
  publicEntitlementIdsIncluded: false,
  rawStripeIdsIncluded: false,
  liveBillingEnabled: false,
  stripeCheckoutSessionCreated: false,
  liveChargeCreated: false,
  fulfillmentDeliveryEnabled: false,
};

export const productTestCheckoutSummaryContract = {
  id: "owner-product-test-checkout-links",
  status: productTestCheckoutStatus,
  issue: productTestCheckoutIssue,
  parentIssue: productTestCheckoutParentIssue,
  ownerApiRoute: productTestCheckoutLinkApiRoute,
  checkoutApiRoute: productTestCheckoutApiRoute,
  publicRoutePattern: `${productTestCheckoutRoutePrefix}/:linkId`,
  sourceDataRoute: "/products/source-data",
  ownerRoute: "/admin/products",
  ownerAuthBoundary: "Better Auth owner session",
  publicCheckoutBoundary: "public test checkout link plus exact confirmation, idempotency, and link revision check",
  ownerConfirmation: {
    required: true,
    text: productTestCheckoutLinkConfirmationText,
  },
  buyerConfirmation: {
    required: true,
    text: productTestCheckoutConfirmationText,
  },
  idempotencyRequired: true,
  staleStateChecks: ["expectedProductUpdatedAt", "expectedLinkRevisionId"],
  writeBoundary:
    "Owners can create stable buyer-facing test checkout links for owner-created draft products after exact confirmation, idempotency, and a current product updatedAt check. Buyers can use those links to create synthetic paid test checkout, entitlement, fulfillment task, and audit evidence after exact confirmation, idempotency, and a current link revision check. This does not create Stripe products, Stripe prices, Stripe Checkout Sessions, live charges, live offer/funnel publishing, arbitrary fulfillment delivery, raw buyer exposure, or direct unconfirmed agent writes.",
  redaction: productTestCheckoutRedaction,
};

export type ProductTestCheckoutSummary = typeof productTestCheckoutSummaryContract & {
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    checkoutLinks: number;
    activeCheckoutLinks: number;
    testPurchases: number;
    activeTestEntitlements: number;
  };
  latestLinkCreatedAt: string | null;
  latestPurchaseCreatedAt: string | null;
  recordsIncluded: false;
};

export type AdminProductTestCheckoutState = ProductTestCheckoutSummary & {
  links: ProductTestCheckoutLinkRecord[];
  purchases: ProductTestCheckoutPurchaseRecord[];
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
    .slice(0, 140);
}

function isoFromSeconds(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function secondsFromIso(value: string | null | undefined) {
  const timestamp = Date.parse(value ?? "");
  if (!Number.isFinite(timestamp)) return null;
  return Math.floor(timestamp / 1000);
}

function parseEmail(value: string | null | undefined) {
  const trimmed = normalizeRequired(value, 180);
  if (!trimmed) return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data.buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function actorEmailHash(actor: AdminIdentity) {
  return sha256((actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
}

async function getRuntime(): Promise<ProductTestCheckoutRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function linkResultError(
  status: Extract<ProductTestCheckoutLinkResult, { ok: false }>["status"],
  message: string,
): ProductTestCheckoutLinkResult {
  return {
    ok: false,
    status,
    issue: productTestCheckoutIssue,
    message,
    redaction: productTestCheckoutRedaction,
  };
}

function purchaseResultError(
  status: Extract<ProductTestCheckoutPurchaseResult, { ok: false }>["status"],
  message: string,
): ProductTestCheckoutPurchaseResult {
  return {
    ok: false,
    status,
    issue: productTestCheckoutIssue,
    message,
    redaction: productTestCheckoutRedaction,
  };
}

function publicLink(row: ProductTestCheckoutLinkRow): ProductTestCheckoutLinkRecord {
  return {
    id: row.id,
    productId: row.product_id,
    productSlug: row.product_slug,
    productName: row.product_name,
    productKind: row.product_kind,
    productStatus: row.product_status,
    fulfillmentKind: row.fulfillment_kind,
    testPriceId: row.test_price_id,
    publicPath: row.public_path,
    amountCents: Number(row.amount_cents ?? 0),
    currency: row.currency,
    status: row.status,
    revisionId: row.revision_id,
    productUpdatedAt: isoFromSeconds(row.product_updated_at),
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
    billingMutationEnabled: false,
    stripeCheckoutSessionCreated: false,
    liveChargeCreated: false,
    rawBuyerEmailIncluded: false,
    redaction: productTestCheckoutRedaction,
  };
}

function publicPurchase(row: ProductTestCheckoutPurchaseRow): ProductTestCheckoutPurchaseRecord {
  return {
    id: row.id,
    checkoutLinkId: row.checkout_link_id,
    productId: row.product_id,
    productSlug: row.product_slug,
    productName: row.product_name,
    productKind: row.product_kind,
    productStatus: row.product_status,
    fulfillmentKind: row.fulfillment_kind,
    publicPath: row.public_path,
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
    status: row.status,
    linkRevisionId: row.link_revision_id,
    expectedLinkRevisionId: row.expected_link_revision_id,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
    billingMutationEnabled: false,
    stripeCheckoutSessionCreated: false,
    liveChargeCreated: false,
    rawBuyerEmailIncluded: false,
    redaction: productTestCheckoutRedaction,
  };
}

function purchaseWithLookup(row: ProductTestCheckoutPurchaseRow) {
  const record = publicPurchase(row);
  return {
    ...record,
    entitlementLookupUrl: `/products/entitlements?checkout_intent_id=${encodeURIComponent(record.checkoutIntentId)}`,
  };
}

async function linkWithProduct(db: D1Database, field: "id" | "idempotency_key", value: string) {
  return db
    .prepare(
      `SELECT
        link.id,
        link.idempotency_key,
        link.product_id,
        link.test_price_id,
        link.public_path,
        link.amount_cents,
        link.currency,
        link.status,
        link.revision_id,
        link.product_updated_at,
        link.billing_mutation_enabled,
        link.stripe_checkout_session_created,
        link.live_charge_created,
        link.raw_buyer_email_included,
        link.created_at,
        link.updated_at,
        product.slug AS product_slug,
        product.name AS product_name,
        product.kind AS product_kind,
        product.status AS product_status,
        product.fulfillment_kind
      FROM product_test_checkout_links link
      JOIN commerce_products product ON product.id = link.product_id
      WHERE link.${field} = ?
      LIMIT 1`,
    )
    .bind(value)
    .first<ProductTestCheckoutLinkRow>();
}

async function purchaseWithRecord(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        purchase.id,
        purchase.idempotency_key,
        purchase.checkout_link_id,
        purchase.product_id,
        purchase.checkout_intent_id,
        purchase.entitlement_id,
        purchase.fulfillment_task_id,
        purchase.buyer_email_hash,
        purchase.amount_cents,
        purchase.currency,
        purchase.test_price_id,
        purchase.entitlement_template_id,
        purchase.access_rule_id,
        purchase.expected_link_revision_id,
        purchase.link_revision_id,
        purchase.status,
        purchase.billing_mutation_enabled,
        purchase.stripe_checkout_session_created,
        purchase.live_charge_created,
        purchase.raw_buyer_email_included,
        purchase.created_at,
        purchase.updated_at,
        link.public_path,
        product.slug AS product_slug,
        product.name AS product_name,
        product.kind AS product_kind,
        product.status AS product_status,
        product.fulfillment_kind,
        checkout.status AS checkout_status,
        entitlement.status AS entitlement_status,
        task.status AS fulfillment_status
      FROM product_test_checkout_purchases purchase
      JOIN product_test_checkout_links link ON link.id = purchase.checkout_link_id
      JOIN commerce_products product ON product.id = purchase.product_id
      LEFT JOIN checkout_intents checkout ON checkout.id = purchase.checkout_intent_id
      LEFT JOIN product_entitlements entitlement ON entitlement.id = purchase.entitlement_id
      LEFT JOIN product_fulfillment_tasks task ON task.id = purchase.fulfillment_task_id
      WHERE purchase.idempotency_key = ?
      LIMIT 1`,
    )
    .bind(idempotencyKey)
    .first<ProductTestCheckoutPurchaseRow>();
}

async function loadOwnerCreatedProduct(db: D1Database, productId: string) {
  return db
    .prepare(
      `SELECT product.id, product.slug, product.name, product.kind, product.status, product.description,
        product.fulfillment_kind, product.updated_at
      FROM commerce_products product
      JOIN product_creation_intents creation_intent ON creation_intent.product_id = product.id
      WHERE product.id = ?
      LIMIT 1`,
    )
    .bind(productId)
    .first<ProductRow>();
}

export async function createProductTestCheckoutLink(
  input: ProductTestCheckoutLinkInput,
): Promise<ProductTestCheckoutLinkResult> {
  if (input.confirmationText !== productTestCheckoutLinkConfirmationText) {
    return linkResultError("confirmation_required", "Exact product test checkout link confirmation text is required.");
  }

  const productId = normalizeRequired(input.productId, 160);
  const idempotencyKey = normalizeRequired(input.idempotencyKey, 220);
  const expectedProductUpdatedAtSeconds = secondsFromIso(input.expectedProductUpdatedAt);
  const amountCents = normalizeAmountCents(input.amountCents);
  const currency = normalizeCurrency(input.currency);

  if (!productId || !idempotencyKey || !expectedProductUpdatedAtSeconds) {
    return linkResultError(
      "invalid_request",
      "productId, expectedProductUpdatedAt, confirmationText, and idempotencyKey are required.",
    );
  }

  try {
    const { db } = await getRuntime();
    const existingLink = await linkWithProduct(db, "idempotency_key", idempotencyKey);

    if (existingLink) {
      const sameRequest =
        existingLink.product_id === productId &&
        Number(existingLink.amount_cents) === amountCents &&
        existingLink.currency === currency &&
        Number(existingLink.product_updated_at) === expectedProductUpdatedAtSeconds;

      if (!sameRequest) {
        return linkResultError(
          "idempotency_conflict",
          "That idempotency key already belongs to a different product test checkout link request.",
        );
      }

      return {
        ok: true,
        status: "owner-product-test-checkout-link-replayed",
        issue: productTestCheckoutIssue,
        duplicate: true,
        link: publicLink(existingLink),
      };
    }

    const product = await loadOwnerCreatedProduct(db, productId);
    if (!product) {
      return linkResultError("product_not_found", "That owner-created product could not be found.");
    }

    if (Number(product.updated_at) !== expectedProductUpdatedAtSeconds) {
      return linkResultError("stale_product_state", "Refresh the product row before creating its test checkout link.");
    }

    const linkId = runtimeId(safeId("product-test-checkout-link", product.slug));
    const publicPath = `${productTestCheckoutRoutePrefix}/${encodeURIComponent(linkId)}`;
    const testPriceId = safeId(`price-owner-test-checkout-${currency}-${amountCents}`, product.slug);
    const revisionId = runtimeId(safeId("product-test-checkout-revision", product.slug));
    const actorHash = await actorEmailHash(input.actor);
    const confirmationTextSha256 = await sha256(productTestCheckoutLinkConfirmationText);
    const metadataJson = JSON.stringify({
      issue: productTestCheckoutIssue,
      parentIssue: productTestCheckoutParentIssue,
      productSlug: product.slug,
      productKind: product.kind,
      testMode: true,
      publicPath,
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
        .bind(testPriceId, product.id, `Test checkout price for ${product.name}`, currency, amountCents, metadataJson),
      db
        .prepare(
          `INSERT INTO product_test_checkout_links (
            id, idempotency_key, product_id, actor_user_id, actor_email_hash, actor_role,
            test_price_id, public_path, amount_cents, currency, status, revision_id, product_updated_at,
            confirmation_text_sha256, billing_mutation_enabled, stripe_checkout_session_created,
            live_charge_created, raw_buyer_email_included, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'test_checkout_link_active', ?, ?, ?, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          linkId,
          idempotencyKey,
          product.id,
          input.actor.userId,
          actorHash,
          input.actor.role,
          testPriceId,
          publicPath,
          amountCents,
          currency,
          revisionId,
          expectedProductUpdatedAtSeconds,
          confirmationTextSha256,
          metadataJson,
        ),
    ]);

    const inserted = await linkWithProduct(db, "id", linkId);
    if (!inserted) {
      throw new Error("Product test checkout link could not be read after insert.");
    }

    return {
      ok: true,
      status: productTestCheckoutStatus,
      issue: productTestCheckoutIssue,
      duplicate: false,
      link: publicLink(inserted),
    };
  } catch (error) {
    return linkResultError(
      "unavailable",
      error instanceof Error ? error.message : "Unable to create product test checkout link.",
    );
  }
}

export async function getPublicProductTestCheckoutLink(linkIdInput: string | null | undefined) {
  const linkId = normalizeRequired(linkIdInput, 180);
  if (!linkId) return null;

  try {
    const { db } = await getRuntime();
    const link = await linkWithProduct(db, "id", linkId);
    if (!link || link.status !== "test_checkout_link_active") return null;
    return publicLink(link);
  } catch {
    return null;
  }
}

export async function createProductTestCheckoutPurchase(
  input: ProductTestCheckoutPurchaseInput,
): Promise<ProductTestCheckoutPurchaseResult> {
  if (input.confirmationText !== productTestCheckoutConfirmationText) {
    return purchaseResultError("confirmation_required", "Exact product test checkout confirmation text is required.");
  }

  const linkId = normalizeRequired(input.linkId, 180);
  const idempotencyKey = normalizeRequired(input.idempotencyKey, 220);
  const expectedLinkRevisionId = normalizeRequired(input.expectedLinkRevisionId, 180);
  const buyerEmail = parseEmail(input.buyerEmail);

  if (!linkId || !idempotencyKey || !expectedLinkRevisionId || !buyerEmail) {
    return purchaseResultError(
      "invalid_request",
      "linkId, buyerEmail, expectedLinkRevisionId, confirmationText, and idempotencyKey are required.",
    );
  }

  try {
    const { db } = await getRuntime();
    const existingPurchase = await purchaseWithRecord(db, idempotencyKey);
    const buyerEmailHash = await sha256(buyerEmail);

    if (existingPurchase) {
      const sameRequest =
        existingPurchase.checkout_link_id === linkId &&
        existingPurchase.expected_link_revision_id === expectedLinkRevisionId &&
        existingPurchase.buyer_email_hash === buyerEmailHash;

      if (!sameRequest) {
        return purchaseResultError(
          "idempotency_conflict",
          "That idempotency key already belongs to a different product test checkout request.",
        );
      }

      return {
        ok: true,
        status: "owner-product-test-checkout-replayed",
        issue: productTestCheckoutIssue,
        duplicate: true,
        checkout: purchaseWithLookup(existingPurchase),
      };
    }

    const link = await linkWithProduct(db, "id", linkId);
    if (!link || link.status !== "test_checkout_link_active") {
      return purchaseResultError("checkout_link_not_found", "That product test checkout link could not be found.");
    }

    if (link.revision_id !== expectedLinkRevisionId) {
      return purchaseResultError("stale_link_state", "Refresh the test checkout link before completing checkout.");
    }

    const checkoutIntentId = runtimeId("checkout-intent");
    const entitlementTemplateId = safeId("entitlement-template-owner-test-checkout", link.product_slug);
    const accessRuleId = safeId("access-rule-owner-created-test-checkout", link.product_slug);
    const entitlementId = `entitlement-${checkoutIntentId}-${entitlementTemplateId}`;
    const fulfillmentTaskId = `fulfillment-${checkoutIntentId}-${entitlementTemplateId}`;
    const purchaseId = runtimeId("product-test-checkout-purchase");
    const auditId = runtimeId("audit-owner-product-test-checkout");
    const confirmationTextSha256 = await sha256(productTestCheckoutConfirmationText);
    const agentClientId = normalizeOptional(input.agentClientId, 120);
    const metadataJson = JSON.stringify({
      issue: productTestCheckoutIssue,
      parentIssue: productTestCheckoutParentIssue,
      checkoutLinkId: link.id,
      publicPath: link.public_path,
      productSlug: link.product_slug,
      productKind: link.product_kind,
      testMode: true,
      billingMutationEnabled: false,
      stripeCheckoutSessionCreated: false,
      liveChargeCreated: false,
      fulfillmentDeliveryEnabled: false,
      rawBuyerEmailIncluded: false,
      directAgentWriteEnabled: false,
    });

    await db.batch([
      db
        .prepare(
          `INSERT INTO checkout_intents (
            id, idempotency_key, checkout_kind, status, product_id, price_id, buyer_email,
            amount_cents, currency, stripe_mode, confirmation_required, confirmed_at,
            audit_correlation_id, agent_client_id, metadata_json, created_at, updated_at
          ) VALUES (?, ?, 'owner_product_test_checkout', 'paid', ?, ?, ?, ?, ?, 'test', 1, unixepoch(), ?, ?, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          checkoutIntentId,
          `product-test-checkout-${idempotencyKey}`,
          link.product_id,
          link.test_price_id,
          buyerEmail,
          Number(link.amount_cents),
          link.currency,
          auditId,
          agentClientId,
          metadataJson,
        ),
      db
        .prepare(
          `INSERT INTO product_entitlements (
            id, checkout_intent_id, source_stripe_event_id, product_id, source_commerce_product_id,
            entitlement_template_id, access_rule_id, status, grant_kind, buyer_email_hash, source_price_id,
            metadata_json, granted_at, updated_at
          ) VALUES (?, ?, NULL, ?, ?, ?, ?, 'active', 'owner_created_product_test_checkout', ?, ?, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          entitlementId,
          checkoutIntentId,
          link.product_id,
          link.product_id,
          entitlementTemplateId,
          accessRuleId,
          buyerEmailHash,
          link.test_price_id,
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
          link.product_id,
          link.fulfillment_kind,
          `Queued buyer-facing test checkout fulfillment evidence for owner-created product ${link.product_name}.`,
          metadataJson,
        ),
      db
        .prepare(
          `INSERT INTO payment_audit_events (
            id, checkout_intent_id, stripe_event_id, event_kind, actor_kind, actor_id, summary, metadata_json, created_at
          ) VALUES (?, ?, NULL, 'owner_product_test_checkout_completed', 'public_test_checkout', ?, ?, ?, unixepoch())`,
        )
        .bind(
          auditId,
          checkoutIntentId,
          agentClientId,
          `Buyer-facing test checkout completed for owner-created product ${link.product_name}.`,
          metadataJson,
        ),
      db
        .prepare(
          `INSERT INTO product_test_checkout_purchases (
            id, idempotency_key, checkout_link_id, product_id, checkout_intent_id, entitlement_id,
            fulfillment_task_id, buyer_email_hash, amount_cents, currency, test_price_id,
            entitlement_template_id, access_rule_id, expected_link_revision_id, link_revision_id,
            status, confirmation_text_sha256, billing_mutation_enabled, stripe_checkout_session_created,
            live_charge_created, raw_buyer_email_included, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'test_checkout_paid', ?, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          purchaseId,
          idempotencyKey,
          link.id,
          link.product_id,
          checkoutIntentId,
          entitlementId,
          fulfillmentTaskId,
          buyerEmailHash,
          Number(link.amount_cents),
          link.currency,
          link.test_price_id,
          entitlementTemplateId,
          accessRuleId,
          expectedLinkRevisionId,
          link.revision_id,
          confirmationTextSha256,
          metadataJson,
        ),
    ]);

    const inserted = await purchaseWithRecord(db, idempotencyKey);
    if (!inserted) {
      throw new Error("Product test checkout purchase could not be read after insert.");
    }

    return {
      ok: true,
      status: productTestCheckoutStatus,
      issue: productTestCheckoutIssue,
      duplicate: false,
      checkout: purchaseWithLookup(inserted),
    };
  } catch (error) {
    return purchaseResultError(
      "unavailable",
      error instanceof Error ? error.message : "Unable to complete product test checkout.",
    );
  }
}

export async function getProductTestCheckoutSummary(): Promise<ProductTestCheckoutSummary> {
  try {
    const { db } = await getRuntime();
    const aggregate = await db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM product_test_checkout_links) AS total_links,
          (SELECT COUNT(*) FROM product_test_checkout_links WHERE status = 'test_checkout_link_active') AS active_links,
          (SELECT COUNT(*) FROM product_test_checkout_purchases) AS total_purchases,
          (SELECT COUNT(*) FROM product_test_checkout_purchases WHERE status = 'test_checkout_paid') AS active_test_entitlements,
          (SELECT MAX(created_at) FROM product_test_checkout_links) AS latest_link_created_at,
          (SELECT MAX(created_at) FROM product_test_checkout_purchases) AS latest_purchase_created_at`,
      )
      .first<ProductTestCheckoutAggregateRow>();

    return {
      ...productTestCheckoutSummaryContract,
      source: "d1",
      loadError: null,
      counts: {
        checkoutLinks: Number(aggregate?.total_links ?? 0),
        activeCheckoutLinks: Number(aggregate?.active_links ?? 0),
        testPurchases: Number(aggregate?.total_purchases ?? 0),
        activeTestEntitlements: Number(aggregate?.active_test_entitlements ?? 0),
      },
      latestLinkCreatedAt: isoFromSeconds(aggregate?.latest_link_created_at),
      latestPurchaseCreatedAt: isoFromSeconds(aggregate?.latest_purchase_created_at),
      recordsIncluded: false,
    };
  } catch (error) {
    return {
      ...productTestCheckoutSummaryContract,
      source: "unavailable",
      loadError: error instanceof Error ? error.message : "Unable to load product test checkout summary.",
      counts: {
        checkoutLinks: 0,
        activeCheckoutLinks: 0,
        testPurchases: 0,
        activeTestEntitlements: 0,
      },
      latestLinkCreatedAt: null,
      latestPurchaseCreatedAt: null,
      recordsIncluded: false,
    };
  }
}

export async function getAdminProductTestCheckoutState(): Promise<AdminProductTestCheckoutState> {
  const summary = await getProductTestCheckoutSummary();
  if (summary.source !== "d1") return { ...summary, links: [], purchases: [] };

  try {
    const { db } = await getRuntime();
    const [links, purchases] = await Promise.all([
      db
        .prepare(
          `SELECT
            link.id,
            link.idempotency_key,
            link.product_id,
            link.test_price_id,
            link.public_path,
            link.amount_cents,
            link.currency,
            link.status,
            link.revision_id,
            link.product_updated_at,
            link.billing_mutation_enabled,
            link.stripe_checkout_session_created,
            link.live_charge_created,
            link.raw_buyer_email_included,
            link.created_at,
            link.updated_at,
            product.slug AS product_slug,
            product.name AS product_name,
            product.kind AS product_kind,
            product.status AS product_status,
            product.fulfillment_kind
          FROM product_test_checkout_links link
          JOIN commerce_products product ON product.id = link.product_id
          ORDER BY link.created_at DESC
          LIMIT 8`,
        )
        .all<ProductTestCheckoutLinkRow>(),
      db
        .prepare(
          `SELECT
            purchase.id,
            purchase.idempotency_key,
            purchase.checkout_link_id,
            purchase.product_id,
            purchase.checkout_intent_id,
            purchase.entitlement_id,
            purchase.fulfillment_task_id,
            purchase.buyer_email_hash,
            purchase.amount_cents,
            purchase.currency,
            purchase.test_price_id,
            purchase.entitlement_template_id,
            purchase.access_rule_id,
            purchase.expected_link_revision_id,
            purchase.link_revision_id,
            purchase.status,
            purchase.billing_mutation_enabled,
            purchase.stripe_checkout_session_created,
            purchase.live_charge_created,
            purchase.raw_buyer_email_included,
            purchase.created_at,
            purchase.updated_at,
            link.public_path,
            product.slug AS product_slug,
            product.name AS product_name,
            product.kind AS product_kind,
            product.status AS product_status,
            product.fulfillment_kind,
            checkout.status AS checkout_status,
            entitlement.status AS entitlement_status,
            task.status AS fulfillment_status
          FROM product_test_checkout_purchases purchase
          JOIN product_test_checkout_links link ON link.id = purchase.checkout_link_id
          JOIN commerce_products product ON product.id = purchase.product_id
          LEFT JOIN checkout_intents checkout ON checkout.id = purchase.checkout_intent_id
          LEFT JOIN product_entitlements entitlement ON entitlement.id = purchase.entitlement_id
          LEFT JOIN product_fulfillment_tasks task ON task.id = purchase.fulfillment_task_id
          ORDER BY purchase.created_at DESC
          LIMIT 8`,
        )
        .all<ProductTestCheckoutPurchaseRow>(),
    ]);

    return {
      ...summary,
      links: (links.results ?? []).map(publicLink),
      purchases: (purchases.results ?? []).map(publicPurchase),
    };
  } catch {
    return { ...summary, links: [], purchases: [] };
  }
}
