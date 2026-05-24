import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";

export const productDeliveryGateIssue = 409;
export const productDeliveryGateParentIssue = 16;
export const productDeliveryGateStatus = "owner-product-delivery-gate-ready";
export const productDeliveryGateApiRoute = "/api/admin/products/delivery-gates";
export const productDeliveryGateConfirmationText = "Link owner product to offer and delivery gates";

export const productDeliveryGateOfferStackId = "checkout-stack-indie-launch-sandbox";
export const productDeliveryGateOfferId = "offer-primary-sandbox-launch-pass";
export const productDeliveryGateFunnelId = "funnel-indie-launch-sandbox";
export const productDeliveryGateFunnelRoute = "/funnels/indie-launch-sandbox";
export const productDeliveryGateOfferRoute = "/offers/indie-launch-stack";

type ProductDeliveryGateRuntime = {
  db: D1Database;
};

type ProductDeliveryGateRedaction = {
  actorEmailIncluded: false;
  actorUserIdIncluded: false;
  buyerEmailIncluded: false;
  buyerEmailHashIncluded: false;
  idempotencyKeysIncluded: false;
  checkoutLinkIdsIncluded: false;
  publicCheckoutIntentIdsIncluded: false;
  publicEntitlementIdsIncluded: false;
  rawStripeIdsIncluded: false;
  rawR2KeysIncluded: false;
  signedUrlsIncluded: false;
  liveBillingEnabled: false;
  liveFulfillmentDeliveryEnabled: false;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  status: string;
  fulfillment_kind: string;
  updated_at: number | string;
};

type ProductTestCheckoutLinkRow = {
  id: string;
  product_id: string;
  public_path: string;
  amount_cents: number | string;
  currency: string;
  status: string;
  revision_id: string;
  product_updated_at: number | string;
  test_price_id: string;
};

type ProductDeliveryGateRow = {
  id: string;
  idempotency_key: string;
  product_id: string;
  checkout_link_id: string;
  offer_stack_id: string;
  offer_id: string;
  funnel_id: string;
  funnel_route: string;
  offer_preview_route: string;
  expected_product_updated_at: number | string;
  product_updated_at: number | string;
  expected_link_revision_id: string;
  link_revision_id: string;
  status: string;
  delivery_mode: string;
  billing_mutation_enabled: number | boolean;
  stripe_checkout_session_created: number | boolean;
  live_charge_created: number | boolean;
  live_fulfillment_delivery_enabled: number | boolean;
  raw_buyer_email_included: number | boolean;
  raw_r2_keys_included: number | boolean;
  signed_urls_included: number | boolean;
  created_at: number | string;
  updated_at: number | string;
  product_slug: string;
  product_name: string;
  product_kind: string;
  product_status: string;
  fulfillment_kind: string;
  checkout_public_path: string;
  checkout_link_status: string;
  amount_cents: number | string;
  currency: string;
};

type ProductDeliveryGateAggregateRow = {
  total_links: number | string | null;
  active_links: number | string | null;
  live_billing_enabled: number | string | null;
  live_fulfillment_delivery_enabled: number | string | null;
  latest_created_at: number | string | null;
};

export type ProductDeliveryGateRecord = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productKind: string;
  productStatus: string;
  fulfillmentKind: string;
  checkoutLinkId: string;
  checkoutPublicPath: string;
  checkoutLinkStatus: string;
  amountCents: number;
  currency: string;
  offerStackId: string;
  offerId: string;
  funnelId: string;
  funnelRoute: string;
  offerPreviewRoute: string;
  expectedProductUpdatedAt: string | null;
  productUpdatedAt: string | null;
  expectedLinkRevisionId: string;
  linkRevisionId: string;
  status: string;
  deliveryMode: string;
  createdAt: string | null;
  updatedAt: string | null;
  billingMutationEnabled: false;
  stripeCheckoutSessionCreated: false;
  liveChargeCreated: false;
  liveFulfillmentDeliveryEnabled: false;
  rawBuyerEmailIncluded: false;
  rawR2KeysIncluded: false;
  signedUrlsIncluded: false;
  redaction: ProductDeliveryGateRedaction;
};

export type ProductDeliveryGateInput = {
  productId: string | null | undefined;
  checkoutLinkId: string | null | undefined;
  offerStackId?: string | null;
  offerId?: string | null;
  funnelId?: string | null;
  expectedProductUpdatedAt: string | null | undefined;
  expectedLinkRevisionId: string | null | undefined;
  confirmationText: string | null | undefined;
  idempotencyKey: string | null | undefined;
  actor: AdminIdentity;
};

export type ProductDeliveryGateResult =
  | {
      ok: true;
      status: typeof productDeliveryGateStatus | "owner-product-delivery-gate-replayed";
      issue: typeof productDeliveryGateIssue;
      duplicate: boolean;
      record: ProductDeliveryGateRecord;
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "product_not_found"
        | "checkout_link_not_found"
        | "unsupported_offer_gate"
        | "stale_product_state"
        | "stale_link_state"
        | "idempotency_conflict"
        | "unavailable";
      issue: typeof productDeliveryGateIssue;
      message: string;
      redaction: ProductDeliveryGateRedaction;
    };

export const productDeliveryGateRedaction: ProductDeliveryGateRedaction = {
  actorEmailIncluded: false,
  actorUserIdIncluded: false,
  buyerEmailIncluded: false,
  buyerEmailHashIncluded: false,
  idempotencyKeysIncluded: false,
  checkoutLinkIdsIncluded: false,
  publicCheckoutIntentIdsIncluded: false,
  publicEntitlementIdsIncluded: false,
  rawStripeIdsIncluded: false,
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  liveBillingEnabled: false,
  liveFulfillmentDeliveryEnabled: false,
};

export const productDeliveryGateSummaryContract = {
  id: "owner-product-delivery-gates",
  status: productDeliveryGateStatus,
  issue: productDeliveryGateIssue,
  parentIssue: productDeliveryGateParentIssue,
  apiRoute: productDeliveryGateApiRoute,
  ownerRoute: "/admin/products",
  sourceDataRoute: "/products/source-data",
  offerSourceDataRoute: "/offers/source-data",
  funnelSourceDataRoute: "/funnels/source-data",
  offerStackId: productDeliveryGateOfferStackId,
  offerId: productDeliveryGateOfferId,
  offerPreviewRoute: productDeliveryGateOfferRoute,
  funnelId: productDeliveryGateFunnelId,
  funnelRoute: productDeliveryGateFunnelRoute,
  auth: "Better Auth owner session",
  confirmation: {
    required: true,
    text: productDeliveryGateConfirmationText,
  },
  idempotencyRequired: true,
  staleStateChecks: ["expectedProductUpdatedAt", "expectedLinkRevisionId"],
  recordsIncluded: false,
  writeBoundary:
    "Owners can link an owner-created product test checkout link to the seeded offer/funnel delivery gates after exact confirmation, idempotency, a current product updatedAt check, and a current checkout-link revision check. The link records offer/funnel/product delivery intent only; it does not create Stripe products, Stripe prices, Checkout Sessions, live charges, live offer/funnel publishing, arbitrary customer delivery, signed URLs, private R2 keys, or direct unconfirmed agent writes.",
  deliveryBoundary:
    "Customer delivery remains gated by the test checkout entitlement and fulfillment task. Seeded fixture delivery can be inspected through existing checkout-intent scoped product routes; arbitrary uploaded asset delivery, live protected course/member delivery, signed URLs, and live fulfillment automation remain blocked.",
  redaction: productDeliveryGateRedaction,
};

export type ProductDeliveryGateSummary = typeof productDeliveryGateSummaryContract & {
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    deliveryGateLinks: number;
    activeDeliveryGateLinks: number;
    liveBillingEnabled: number;
    liveFulfillmentDeliveryEnabled: number;
  };
  latestLinkedAt: string | null;
};

export type AdminProductDeliveryGateState = ProductDeliveryGateSummary & {
  records: ProductDeliveryGateRecord[];
};

function normalizeRequired(value: string | null | undefined, maxLength: number) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, maxLength) : null;
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

async function getRuntime(): Promise<ProductDeliveryGateRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) throw new Error("Cloudflare D1 binding DB is not available.");
  return { db: cloudflareEnv.DB };
}

function resultError(status: Extract<ProductDeliveryGateResult, { ok: false }>["status"], message: string) {
  return {
    ok: false,
    status,
    issue: productDeliveryGateIssue,
    message,
    redaction: productDeliveryGateRedaction,
  } satisfies ProductDeliveryGateResult;
}

function recordFromRow(row: ProductDeliveryGateRow): ProductDeliveryGateRecord {
  return {
    id: row.id,
    productId: row.product_id,
    productSlug: row.product_slug,
    productName: row.product_name,
    productKind: row.product_kind,
    productStatus: row.product_status,
    fulfillmentKind: row.fulfillment_kind,
    checkoutLinkId: row.checkout_link_id,
    checkoutPublicPath: row.checkout_public_path,
    checkoutLinkStatus: row.checkout_link_status,
    amountCents: Number(row.amount_cents ?? 0),
    currency: row.currency,
    offerStackId: row.offer_stack_id,
    offerId: row.offer_id,
    funnelId: row.funnel_id,
    funnelRoute: row.funnel_route,
    offerPreviewRoute: row.offer_preview_route,
    expectedProductUpdatedAt: isoFromSeconds(row.expected_product_updated_at),
    productUpdatedAt: isoFromSeconds(row.product_updated_at),
    expectedLinkRevisionId: row.expected_link_revision_id,
    linkRevisionId: row.link_revision_id,
    status: row.status,
    deliveryMode: row.delivery_mode,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
    billingMutationEnabled: false,
    stripeCheckoutSessionCreated: false,
    liveChargeCreated: false,
    liveFulfillmentDeliveryEnabled: false,
    rawBuyerEmailIncluded: false,
    rawR2KeysIncluded: false,
    signedUrlsIncluded: false,
    redaction: productDeliveryGateRedaction,
  };
}

async function loadOwnerCreatedProduct(db: D1Database, productId: string) {
  return db
    .prepare(
      `SELECT product.id, product.slug, product.name, product.kind, product.status,
        product.fulfillment_kind, product.updated_at
      FROM commerce_products product
      JOIN product_creation_intents creation_intent ON creation_intent.product_id = product.id
      WHERE product.id = ?
      LIMIT 1`,
    )
    .bind(productId)
    .first<ProductRow>();
}

async function loadCheckoutLink(db: D1Database, checkoutLinkId: string, productId: string) {
  return db
    .prepare(
      `SELECT id, product_id, public_path, amount_cents, currency, status, revision_id,
        product_updated_at, test_price_id
      FROM product_test_checkout_links
      WHERE id = ? AND product_id = ?
      LIMIT 1`,
    )
    .bind(checkoutLinkId, productId)
    .first<ProductTestCheckoutLinkRow>();
}

async function gateWithRecord(db: D1Database, field: "id" | "idempotency_key", value: string) {
  return db
    .prepare(
      `SELECT
        gate.id,
        gate.idempotency_key,
        gate.product_id,
        gate.checkout_link_id,
        gate.offer_stack_id,
        gate.offer_id,
        gate.funnel_id,
        gate.funnel_route,
        gate.offer_preview_route,
        gate.expected_product_updated_at,
        gate.product_updated_at,
        gate.expected_link_revision_id,
        gate.link_revision_id,
        gate.status,
        gate.delivery_mode,
        gate.billing_mutation_enabled,
        gate.stripe_checkout_session_created,
        gate.live_charge_created,
        gate.live_fulfillment_delivery_enabled,
        gate.raw_buyer_email_included,
        gate.raw_r2_keys_included,
        gate.signed_urls_included,
        gate.created_at,
        gate.updated_at,
        product.slug AS product_slug,
        product.name AS product_name,
        product.kind AS product_kind,
        product.status AS product_status,
        product.fulfillment_kind,
        link.public_path AS checkout_public_path,
        link.status AS checkout_link_status,
        link.amount_cents,
        link.currency
      FROM product_delivery_gate_links gate
      JOIN commerce_products product ON product.id = gate.product_id
      JOIN product_test_checkout_links link ON link.id = gate.checkout_link_id
      WHERE gate.${field} = ?
      LIMIT 1`,
    )
    .bind(value)
    .first<ProductDeliveryGateRow>();
}

export async function createProductDeliveryGateLink(
  input: ProductDeliveryGateInput,
): Promise<ProductDeliveryGateResult> {
  if (input.confirmationText !== productDeliveryGateConfirmationText) {
    return resultError("confirmation_required", "Exact product delivery-gate confirmation text is required.");
  }

  const productId = normalizeRequired(input.productId, 160);
  const checkoutLinkId = normalizeRequired(input.checkoutLinkId, 180);
  const idempotencyKey = normalizeRequired(input.idempotencyKey, 220);
  const expectedProductUpdatedAtSeconds = secondsFromIso(input.expectedProductUpdatedAt);
  const expectedLinkRevisionId = normalizeRequired(input.expectedLinkRevisionId, 180);
  const offerStackId = normalizeRequired(input.offerStackId, 160) ?? productDeliveryGateOfferStackId;
  const offerId = normalizeRequired(input.offerId, 160) ?? productDeliveryGateOfferId;
  const funnelId = normalizeRequired(input.funnelId, 160) ?? productDeliveryGateFunnelId;

  if (!productId || !checkoutLinkId || !idempotencyKey || !expectedProductUpdatedAtSeconds || !expectedLinkRevisionId) {
    return resultError(
      "invalid_request",
      "productId, checkoutLinkId, expectedProductUpdatedAt, expectedLinkRevisionId, confirmationText, and idempotencyKey are required.",
    );
  }

  if (
    offerStackId !== productDeliveryGateOfferStackId ||
    offerId !== productDeliveryGateOfferId ||
    funnelId !== productDeliveryGateFunnelId
  ) {
    return resultError("unsupported_offer_gate", "Only the seeded offer/funnel delivery gate is supported in this slice.");
  }

  try {
    const { db } = await getRuntime();
    const existing = await gateWithRecord(db, "idempotency_key", idempotencyKey);
    if (existing) {
      const sameRequest =
        existing.product_id === productId &&
        existing.checkout_link_id === checkoutLinkId &&
        existing.offer_stack_id === offerStackId &&
        existing.offer_id === offerId &&
        existing.funnel_id === funnelId &&
        Number(existing.expected_product_updated_at) === expectedProductUpdatedAtSeconds &&
        existing.expected_link_revision_id === expectedLinkRevisionId;

      if (!sameRequest) {
        return resultError(
          "idempotency_conflict",
          "That idempotency key already belongs to a different product delivery-gate link request.",
        );
      }

      return {
        ok: true,
        status: "owner-product-delivery-gate-replayed",
        issue: productDeliveryGateIssue,
        duplicate: true,
        record: recordFromRow(existing),
      };
    }

    const product = await loadOwnerCreatedProduct(db, productId);
    if (!product) return resultError("product_not_found", "That owner-created product could not be found.");
    if (Number(product.updated_at) !== expectedProductUpdatedAtSeconds) {
      return resultError("stale_product_state", "Refresh the product row before linking delivery gates.");
    }

    const checkoutLink = await loadCheckoutLink(db, checkoutLinkId, productId);
    if (!checkoutLink || checkoutLink.status !== "test_checkout_link_active") {
      return resultError("checkout_link_not_found", "That active owner-created product test checkout link could not be found.");
    }
    if (checkoutLink.revision_id !== expectedLinkRevisionId) {
      return resultError("stale_link_state", "Refresh the test checkout link before linking delivery gates.");
    }

    const recordId = runtimeId(safeId("product-delivery-gate", product.slug));
    const actorHash = await actorEmailHash(input.actor);
    const confirmationTextSha256 = await sha256(productDeliveryGateConfirmationText);
    const metadataJson = JSON.stringify({
      issue: productDeliveryGateIssue,
      parentIssue: productDeliveryGateParentIssue,
      productSlug: product.slug,
      productKind: product.kind,
      checkoutPublicPath: checkoutLink.public_path,
      offerStackId,
      offerId,
      funnelId,
      funnelRoute: productDeliveryGateFunnelRoute,
      offerPreviewRoute: productDeliveryGateOfferRoute,
      deliveryMode: "owner_created_product_test_checkout",
      billingMutationEnabled: false,
      stripeCheckoutSessionCreated: false,
      liveChargeCreated: false,
      liveFulfillmentDeliveryEnabled: false,
      rawBuyerEmailIncluded: false,
      rawR2KeysIncluded: false,
      signedUrlsIncluded: false,
      directAgentWriteEnabled: false,
    });

    await db
      .prepare(
        `INSERT INTO product_delivery_gate_links (
          id, idempotency_key, product_id, checkout_link_id, actor_user_id, actor_email_hash, actor_role,
          offer_stack_id, offer_id, funnel_id, funnel_route, offer_preview_route,
          expected_product_updated_at, product_updated_at, expected_link_revision_id, link_revision_id,
          status, delivery_mode, confirmation_text_sha256, billing_mutation_enabled,
          stripe_checkout_session_created, live_charge_created, live_fulfillment_delivery_enabled,
          raw_buyer_email_included, raw_r2_keys_included, signed_urls_included,
          metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'delivery_gate_link_active',
          'owner_created_product_test_checkout', ?, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
      )
      .bind(
        recordId,
        idempotencyKey,
        product.id,
        checkoutLink.id,
        input.actor.userId,
        actorHash,
        input.actor.role,
        offerStackId,
        offerId,
        funnelId,
        productDeliveryGateFunnelRoute,
        productDeliveryGateOfferRoute,
        expectedProductUpdatedAtSeconds,
        Number(product.updated_at),
        expectedLinkRevisionId,
        checkoutLink.revision_id,
        confirmationTextSha256,
        metadataJson,
      )
      .run();

    const inserted = await gateWithRecord(db, "id", recordId);
    if (!inserted) throw new Error("Product delivery-gate link could not be read after insert.");

    return {
      ok: true,
      status: productDeliveryGateStatus,
      issue: productDeliveryGateIssue,
      duplicate: false,
      record: recordFromRow(inserted),
    };
  } catch (error) {
    return resultError(
      "unavailable",
      error instanceof Error ? error.message : "Unable to link owner-created product delivery gates.",
    );
  }
}

export async function getProductDeliveryGateSummary(
  dbOverride?: D1Database | null,
): Promise<ProductDeliveryGateSummary> {
  try {
    const db = dbOverride ?? (await getRuntime()).db;
    const aggregate = await db
      .prepare(
        `SELECT
          COUNT(*) AS total_links,
          SUM(CASE WHEN status = 'delivery_gate_link_active' THEN 1 ELSE 0 END) AS active_links,
          SUM(CASE WHEN billing_mutation_enabled = 1 OR stripe_checkout_session_created = 1 OR live_charge_created = 1 THEN 1 ELSE 0 END) AS live_billing_enabled,
          SUM(CASE WHEN live_fulfillment_delivery_enabled = 1 THEN 1 ELSE 0 END) AS live_fulfillment_delivery_enabled,
          MAX(created_at) AS latest_created_at
        FROM product_delivery_gate_links`,
      )
      .first<ProductDeliveryGateAggregateRow>();

    return {
      ...productDeliveryGateSummaryContract,
      source: "d1",
      loadError: null,
      counts: {
        deliveryGateLinks: Number(aggregate?.total_links ?? 0),
        activeDeliveryGateLinks: Number(aggregate?.active_links ?? 0),
        liveBillingEnabled: Number(aggregate?.live_billing_enabled ?? 0),
        liveFulfillmentDeliveryEnabled: Number(aggregate?.live_fulfillment_delivery_enabled ?? 0),
      },
      latestLinkedAt: isoFromSeconds(aggregate?.latest_created_at),
    };
  } catch (error) {
    return {
      ...productDeliveryGateSummaryContract,
      source: "unavailable",
      loadError: error instanceof Error ? error.message : "Unable to load product delivery-gate summary.",
      counts: {
        deliveryGateLinks: 0,
        activeDeliveryGateLinks: 0,
        liveBillingEnabled: 0,
        liveFulfillmentDeliveryEnabled: 0,
      },
      latestLinkedAt: null,
    };
  }
}

export async function getAdminProductDeliveryGateState(): Promise<AdminProductDeliveryGateState> {
  const summary = await getProductDeliveryGateSummary();
  if (summary.source !== "d1") return { ...summary, records: [] };

  try {
    const { db } = await getRuntime();
    const records = await db
      .prepare(
        `SELECT
          gate.id,
          gate.idempotency_key,
          gate.product_id,
          gate.checkout_link_id,
          gate.offer_stack_id,
          gate.offer_id,
          gate.funnel_id,
          gate.funnel_route,
          gate.offer_preview_route,
          gate.expected_product_updated_at,
          gate.product_updated_at,
          gate.expected_link_revision_id,
          gate.link_revision_id,
          gate.status,
          gate.delivery_mode,
          gate.billing_mutation_enabled,
          gate.stripe_checkout_session_created,
          gate.live_charge_created,
          gate.live_fulfillment_delivery_enabled,
          gate.raw_buyer_email_included,
          gate.raw_r2_keys_included,
          gate.signed_urls_included,
          gate.created_at,
          gate.updated_at,
          product.slug AS product_slug,
          product.name AS product_name,
          product.kind AS product_kind,
          product.status AS product_status,
          product.fulfillment_kind,
          link.public_path AS checkout_public_path,
          link.status AS checkout_link_status,
          link.amount_cents,
          link.currency
        FROM product_delivery_gate_links gate
        JOIN commerce_products product ON product.id = gate.product_id
        JOIN product_test_checkout_links link ON link.id = gate.checkout_link_id
        ORDER BY gate.created_at DESC
        LIMIT 8`,
      )
      .all<ProductDeliveryGateRow>();

    return { ...summary, records: (records.results ?? []).map(recordFromRow) };
  } catch {
    return { ...summary, records: [] };
  }
}
