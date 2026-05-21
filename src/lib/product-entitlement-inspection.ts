import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { entitlementGrantMappings } from "@/lib/product-entitlements";
import { productAccessCatalogs } from "@/lib/product-access";

export const productEntitlementInspectionIssue = 139;
export const productEntitlementInspectionStatus = "owner-product-entitlement-inspection-ready";
export const productEntitlementInspectionOwnerRoute = "/admin/products";
export const productEntitlementRevocationIntentIssue = 179;
export const productEntitlementRevocationIntentWriteIssue = 251;
export const productEntitlementRevocationIntentStatus = "owner-product-revocation-intents-ready";
export const productEntitlementRevocationIntentApiRoute = "/api/admin/products/revocation-intents";
export const productEntitlementRevocationConfirmationText = "Record product access removal intent";
export const productEntitlementRevocationReasonCodes = [
  "manual_review",
  "refund_or_chargeback",
  "customer_request",
  "test_cleanup",
] as const;

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

type RevocationIntentRow = {
  id: string;
  product_id: string;
  entitlement_template_id: string;
  access_rule_id: string;
  target_entitlement_id: string | null;
  idempotency_key: string | null;
  actor_user_id: string | null;
  actor_email_hash: string | null;
  actor_role: string | null;
  expected_entitlement_status: string | null;
  reason_code: string | null;
  private_reason_sha256: string | null;
  confirmation_text_sha256: string | null;
  status: string;
  intent_kind: string;
  revocation_policy: string;
  stale_state_policy: string;
  audit_correlation_policy: string;
  destructive_action_enabled: number | string;
  entitlement_mutation_enabled: number | string;
  created_at: number | string;
  updated_at: number | string;
};

type RevocationTargetEntitlementRow = {
  id: string;
  product_id: string;
  entitlement_template_id: string;
  access_rule_id: string;
  status: string;
  checkout_intent_id: string | null;
};

export type ProductEntitlementRevocationReasonCode = (typeof productEntitlementRevocationReasonCodes)[number];

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

export type ProductEntitlementRevocationIntent = {
  id: string;
  productId: string;
  productTitle: string;
  entitlementTemplateId: string;
  entitlementTemplateTitle: string;
  accessRuleId: string;
  accessRuleTitle: string;
  status: string;
  intentKind: string;
  reasonCode: string | null;
  ownerConfirmed: boolean;
  privateReasonRecorded: boolean;
  revocationPolicy: string;
  staleStatePolicy: string;
  auditCorrelationPolicy: string;
  destructiveActionEnabled: boolean;
  entitlementMutationEnabled: boolean;
  targetEntitlementIncluded: false;
  actorIdentityIncluded: false;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductEntitlementRevocationIntentSummary = {
  id: string;
  status: typeof productEntitlementRevocationIntentStatus;
  issue: typeof productEntitlementRevocationIntentIssue;
  parentIssue: 16;
  ownerRoute: typeof productEntitlementInspectionOwnerRoute;
  publicSourceDataRoute: "/products/source-data";
  apiRoute: typeof productEntitlementRevocationIntentApiRoute;
  writeIssue: typeof productEntitlementRevocationIntentWriteIssue;
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof productEntitlementRevocationConfirmationText;
  };
  idempotencyRequired: true;
  staleStateCheck: {
    required: true;
    field: "expectedEntitlementStatus";
  };
  reasonCodes: readonly ProductEntitlementRevocationReasonCode[];
  counts: {
    revocationIntents: number;
    dryRunIntents: number;
    ownerConfirmedIntents: number;
    destructiveActionsEnabled: number;
    entitlementMutationsEnabled: number;
  };
  records: ProductEntitlementRevocationIntent[];
  redaction: {
    privateBuyerDataIncluded: false;
    rawBuyerEmailIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    rawStripeIdsIncluded: false;
    targetEntitlementIdsIncluded: false;
    privateReasonIncluded: false;
    entitlementMutationEnabled: false;
    destructiveActionEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type ProductEntitlementRevocationIntentInput = {
  entitlementId: string | null | undefined;
  expectedEntitlementStatus: string | null | undefined;
  reasonCode: string | null | undefined;
  privateReason?: string | null;
  confirmationText: string | null | undefined;
  idempotencyKey: string | null | undefined;
  actor: AdminIdentity;
};

export type ProductEntitlementRevocationIntentResult =
  | {
      ok: true;
      status: typeof productEntitlementRevocationIntentStatus | "owner-product-revocation-intent-replayed";
      issue: typeof productEntitlementRevocationIntentWriteIssue;
      duplicate: boolean;
      intent: ProductEntitlementRevocationIntent & {
        targetEntitlementId: string;
        targetEntitlementStatus: string;
        destructiveActionEnabled: false;
        entitlementMutationEnabled: false;
      };
      redaction: ProductEntitlementRevocationIntentSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "entitlement_not_found"
        | "stale_entitlement_state"
        | "idempotency_conflict"
        | "unavailable";
      issue: typeof productEntitlementRevocationIntentWriteIssue;
      message: string;
      redaction: ProductEntitlementRevocationIntentSummary["redaction"];
    };

export const productEntitlementRevocationRedaction: ProductEntitlementRevocationIntentSummary["redaction"] = {
  privateBuyerDataIncluded: false,
  rawBuyerEmailIncluded: false,
  actorEmailIncluded: false,
  actorEmailHashIncluded: false,
  rawStripeIdsIncluded: false,
  targetEntitlementIdsIncluded: false,
  privateReasonIncluded: false,
  entitlementMutationEnabled: false,
  destructiveActionEnabled: false,
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

function emptyRevocationIntentSummary(
  source: ProductEntitlementRevocationIntentSummary["source"],
  loadError: string | null,
): ProductEntitlementRevocationIntentSummary {
  return {
    id: "product-entitlement-revocation-intent-contract",
    status: productEntitlementRevocationIntentStatus,
    issue: productEntitlementRevocationIntentIssue,
    parentIssue: 16,
    ownerRoute: productEntitlementInspectionOwnerRoute,
    publicSourceDataRoute: "/products/source-data",
    apiRoute: productEntitlementRevocationIntentApiRoute,
    writeIssue: productEntitlementRevocationIntentWriteIssue,
    source,
    loadError,
    confirmation: {
      required: true,
      text: productEntitlementRevocationConfirmationText,
    },
    idempotencyRequired: true,
    staleStateCheck: {
      required: true,
      field: "expectedEntitlementStatus",
    },
    reasonCodes: productEntitlementRevocationReasonCodes,
    counts: {
      revocationIntents: 0,
      dryRunIntents: 0,
      ownerConfirmedIntents: 0,
      destructiveActionsEnabled: 0,
      entitlementMutationsEnabled: 0,
    },
    records: [],
    redaction: productEntitlementRevocationRedaction,
    privateFieldsExcluded: [
      "buyerEmail",
      "buyerEmailHash",
      "actorEmail",
      "actorEmailHash",
      "targetEntitlementId",
      "stripeCheckoutSessionId",
      "stripePaymentIntentId",
      "stripeSubscriptionId",
      "metadataJson",
      "privateReason",
      "privateReasonNote",
    ],
    writeBoundary:
      "Issue #179 exposes non-destructive product entitlement revocation intent readiness. Issue #251 lets verified owners record non-destructive revocation intents after exact confirmation, idempotency, and a current entitlement status check. It does not revoke access, mutate entitlements, expose buyer data, change billing, issue refunds, notify customers, or authorize direct public agent revocation writes.",
  };
}

function publicRevocationIntent(row: RevocationIntentRow): ProductEntitlementRevocationIntent {
  const products = productById();
  const templates = templateById();
  const accessRules = accessRuleById();
  const product = products.get(row.product_id);
  const template = templates.get(row.entitlement_template_id);
  const accessRule = accessRules.get(row.access_rule_id);

  return {
    id: row.id,
    productId: row.product_id,
    productTitle: product?.title ?? row.product_id,
    entitlementTemplateId: row.entitlement_template_id,
    entitlementTemplateTitle: template?.title ?? row.entitlement_template_id,
    accessRuleId: row.access_rule_id,
    accessRuleTitle: accessRule?.title ?? row.access_rule_id,
    status: row.status,
    intentKind: row.intent_kind,
    reasonCode: row.reason_code,
    ownerConfirmed: Boolean(row.target_entitlement_id),
    privateReasonRecorded: Boolean(row.private_reason_sha256),
    revocationPolicy: row.revocation_policy,
    staleStatePolicy: row.stale_state_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    destructiveActionEnabled: booleanValue(row.destructive_action_enabled),
    entitlementMutationEnabled: booleanValue(row.entitlement_mutation_enabled),
    targetEntitlementIncluded: false,
    actorIdentityIncluded: false,
    createdAt: timestampValue(row.created_at),
    updatedAt: timestampValue(row.updated_at),
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

function normalizeRequired(value: string | null | undefined, maxLength: number) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function actorEmailHash(actor: AdminIdentity) {
  return sha256((actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
}

function resultError(
  status: Extract<ProductEntitlementRevocationIntentResult, { ok: false }>["status"],
  message: string,
): ProductEntitlementRevocationIntentResult {
  return {
    ok: false,
    status,
    issue: productEntitlementRevocationIntentWriteIssue,
    message,
    redaction: productEntitlementRevocationRedaction,
  };
}

function isRevocationReasonCode(value: string): value is ProductEntitlementRevocationReasonCode {
  return (productEntitlementRevocationReasonCodes as readonly string[]).includes(value);
}

function ownerIntentFromRow(
  row: RevocationIntentRow,
  target: RevocationTargetEntitlementRow,
): Extract<ProductEntitlementRevocationIntentResult, { ok: true }>["intent"] {
  return {
    ...publicRevocationIntent(row),
    targetEntitlementId: target.id,
    targetEntitlementStatus: target.status,
    destructiveActionEnabled: false,
    entitlementMutationEnabled: false,
  };
}

export async function createProductEntitlementRevocationIntent(
  input: ProductEntitlementRevocationIntentInput,
): Promise<ProductEntitlementRevocationIntentResult> {
  if (input.confirmationText !== productEntitlementRevocationConfirmationText) {
    return resultError("confirmation_required", "Exact product access removal confirmation text is required.");
  }

  const entitlementId = normalizeRequired(input.entitlementId, 180);
  const expectedEntitlementStatus = normalizeRequired(input.expectedEntitlementStatus, 80);
  const reasonCode = normalizeRequired(input.reasonCode, 80);
  const privateReason = normalizeRequired(input.privateReason, 500);
  const idempotencyKey = normalizeRequired(input.idempotencyKey, 180);

  if (!entitlementId || !expectedEntitlementStatus || !reasonCode || !idempotencyKey) {
    return resultError(
      "invalid_request",
      "entitlementId, expectedEntitlementStatus, reasonCode, and idempotencyKey are required.",
    );
  }

  if (!isRevocationReasonCode(reasonCode)) {
    return resultError("invalid_request", "reasonCode must be one of the supported product revocation reason codes.");
  }

  try {
    const { db } = await getRuntime();
    const target = await db
      .prepare(
        `SELECT id, product_id, entitlement_template_id, access_rule_id, status, checkout_intent_id
        FROM product_entitlements
        WHERE id = ?
        LIMIT 1`,
      )
      .bind(entitlementId)
      .first<RevocationTargetEntitlementRow>();

    if (!target) {
      return resultError("entitlement_not_found", "The requested product entitlement could not be found.");
    }

    const privateReasonSha256 = privateReason ? await sha256(privateReason) : null;
    const confirmationTextSha256 = await sha256(productEntitlementRevocationConfirmationText);
    const existing = await db
      .prepare(
        `SELECT
          id, product_id, entitlement_template_id, access_rule_id, status, intent_kind,
          target_entitlement_id, idempotency_key, actor_user_id, actor_email_hash, actor_role,
          expected_entitlement_status, reason_code, private_reason_sha256, confirmation_text_sha256,
          revocation_policy, stale_state_policy, audit_correlation_policy,
          destructive_action_enabled, entitlement_mutation_enabled, created_at, updated_at
        FROM product_entitlement_revocation_intents
        WHERE idempotency_key = ?
        LIMIT 1`,
      )
      .bind(idempotencyKey)
      .first<RevocationIntentRow>();

    if (existing) {
      const sameRequest =
        existing.target_entitlement_id === target.id &&
        existing.expected_entitlement_status === expectedEntitlementStatus &&
        existing.reason_code === reasonCode &&
        (existing.private_reason_sha256 ?? null) === privateReasonSha256 &&
        existing.confirmation_text_sha256 === confirmationTextSha256;

      if (!sameRequest) {
        return resultError("idempotency_conflict", "That idempotency key already belongs to a different revocation intent.");
      }

      return {
        ok: true,
        status: "owner-product-revocation-intent-replayed",
        issue: productEntitlementRevocationIntentWriteIssue,
        duplicate: true,
        intent: ownerIntentFromRow(existing, target),
        redaction: productEntitlementRevocationRedaction,
      };
    }

    if (target.status !== expectedEntitlementStatus) {
      return resultError(
        "stale_entitlement_state",
        "Product entitlement status changed. Refresh before recording an access-removal intent.",
      );
    }

    const products = productById();
    const templates = templateById();
    const product = products.get(target.product_id);
    const template = templates.get(target.entitlement_template_id);
    const intentId = runtimeId("product-revocation-intent");
    const actorHash = await actorEmailHash(input.actor);
    const productTitle = product?.title ?? target.product_id;
    const templateTitle = template?.title ?? target.entitlement_template_id;

    await db
      .prepare(
        `INSERT INTO product_entitlement_revocation_intents (
          id, product_id, entitlement_template_id, access_rule_id, target_entitlement_id, idempotency_key,
          actor_user_id, actor_email_hash, actor_role, expected_entitlement_status, reason_code,
          private_reason_sha256, confirmation_text_sha256, status, intent_kind, revocation_policy,
          stale_state_policy, audit_correlation_policy, destructive_action_enabled, entitlement_mutation_enabled,
          metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'revocation_intent_recorded',
          'owner_confirmed_dry_run', ?, ?, ?, 0, 0, ?, unixepoch(), unixepoch())`,
      )
      .bind(
        intentId,
        target.product_id,
        target.entitlement_template_id,
        target.access_rule_id,
        target.id,
        idempotencyKey,
        input.actor.userId,
        actorHash,
        input.actor.role,
        expectedEntitlementStatus,
        reasonCode,
        privateReasonSha256,
        confirmationTextSha256,
        `Owner-confirmed non-destructive access-removal intent for ${productTitle}. Access remains ${target.status}; no entitlement, billing, refund, or customer notification mutation was performed.`,
        `Recorded only because the targeted entitlement was still ${expectedEntitlementStatus}. Future destructive revocation must re-check entitlement, checkout, subscription/refund, and customer-notification state.`,
        `Recorded with issue #${productEntitlementRevocationIntentWriteIssue}, idempotency key, owner actor hash, reason code ${reasonCode}, server-private target entitlement id, and no public buyer or actor identity.`,
        JSON.stringify({
          issue: productEntitlementRevocationIntentWriteIssue,
          parentIssue: 16,
          readinessIssue: productEntitlementRevocationIntentIssue,
          productTitle,
          entitlementTemplateTitle: templateTitle,
          checkoutIntentRecorded: Boolean(target.checkout_intent_id),
          privateReasonRecorded: Boolean(privateReasonSha256),
          privateBuyerDataIncluded: false,
          rawBuyerEmailIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          targetEntitlementIdsIncludedInPublicSourceData: false,
          privateReasonIncluded: false,
          destructiveActionEnabled: false,
          entitlementMutationEnabled: false,
        }),
      )
      .run();

    const inserted = await db
      .prepare(
        `SELECT
          id, product_id, entitlement_template_id, access_rule_id, status, intent_kind,
          target_entitlement_id, idempotency_key, actor_user_id, actor_email_hash, actor_role,
          expected_entitlement_status, reason_code, private_reason_sha256, confirmation_text_sha256,
          revocation_policy, stale_state_policy, audit_correlation_policy,
          destructive_action_enabled, entitlement_mutation_enabled, created_at, updated_at
        FROM product_entitlement_revocation_intents
        WHERE id = ?
        LIMIT 1`,
      )
      .bind(intentId)
      .first<RevocationIntentRow>();

    if (!inserted) {
      throw new Error("Product revocation intent could not be read after insert.");
    }

    return {
      ok: true,
      status: productEntitlementRevocationIntentStatus,
      issue: productEntitlementRevocationIntentWriteIssue,
      duplicate: false,
      intent: ownerIntentFromRow(inserted, target),
      redaction: productEntitlementRevocationRedaction,
    };
  } catch (error) {
    return resultError(
      "unavailable",
      error instanceof Error ? error.message : "Unable to create product revocation intent.",
    );
  }
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

export async function getProductEntitlementRevocationIntentSummary(): Promise<ProductEntitlementRevocationIntentSummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, product_id, entitlement_template_id, access_rule_id, status, intent_kind,
          target_entitlement_id, idempotency_key, actor_user_id, actor_email_hash, actor_role,
          expected_entitlement_status, reason_code, private_reason_sha256, confirmation_text_sha256,
          revocation_policy, stale_state_policy, audit_correlation_policy,
          destructive_action_enabled, entitlement_mutation_enabled, created_at, updated_at
        FROM product_entitlement_revocation_intents
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<RevocationIntentRow>();
    const rawRows = rows.results ?? [];
    const records = rawRows.map(publicRevocationIntent);

    return {
      ...emptyRevocationIntentSummary("d1", null),
      counts: {
        revocationIntents: records.length,
        dryRunIntents: records.filter((record) => record.intentKind === "owner_confirmed_dry_run").length,
        ownerConfirmedIntents: records.filter((record) => record.ownerConfirmed).length,
        destructiveActionsEnabled: rawRows.filter((row) => booleanValue(row.destructive_action_enabled)).length,
        entitlementMutationsEnabled: rawRows.filter((row) => booleanValue(row.entitlement_mutation_enabled)).length,
      },
      records,
    };
  } catch (error) {
    return emptyRevocationIntentSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load product entitlement revocation intents.",
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
