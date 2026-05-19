export const postPurchaseDecisionsUpdatedAt = "2026-05-19";
export const postPurchaseDecisionApiRoute = "/api/commerce/post-purchase-decisions";
export const postPurchaseDecisionRoutePrefix = "/commerce/post-purchase";
export const postPurchaseDecisionConfirmationText =
  "Record non-billing post-purchase decision for Bumpgrade checkout";
export const postPurchaseOfferStackId = "checkout-stack-indie-launch-sandbox";
export const postPurchaseUpsellOfferId = "offer-upsell-launch-accelerator";
export const postPurchaseDownsellOfferId = "offer-downsell-launch-review";

export type PostPurchaseDecisionKind =
  | "accept_upsell_follow_up"
  | "decline_upsell"
  | "accept_downsell_follow_up"
  | "decline_downsell";

export type CheckoutPostPurchaseDecisionRow = {
  id: string;
  idempotency_key: string;
  checkout_intent_id: string;
  offer_stack_id: string;
  presented_offer_id: string;
  decision_kind: PostPurchaseDecisionKind;
  checkout_status: string;
  checkout_updated_at: number;
  actor_kind: string;
  audit_correlation_id: string | null;
  metadata_json: string | null;
  created_at: number;
};

export type PostPurchaseCheckoutRow = {
  id: string;
  checkout_kind: string;
  status: string;
  product_id: string | null;
  price_id: string | null;
  amount_cents: number;
  currency: string;
  audit_correlation_id: string | null;
  metadata_json: string | null;
  updated_at: number;
};

export type PublicPostPurchaseDecision = {
  decisionId: string;
  checkoutIntentId: string;
  offerStackId: string;
  presentedOfferId: string;
  decisionKind: PostPurchaseDecisionKind;
  checkoutStatus: string;
  checkoutUpdatedAt: number;
  actorKind: string;
  createdAt: number;
  stripeChargeCreated: false;
  paymentIntentCreated: false;
  fulfillmentCreated: false;
  entitlementGranted: false;
  payableCommissionCreated: false;
  payoutCreated: false;
  privateDataIncluded: false;
  rawStripeIdsIncluded: false;
};

export type PostPurchaseDecisionAggregateRow = {
  offer_stack_id: string;
  presented_offer_id: string;
  decision_kind: string;
  total_decisions: number;
  last_created_at: number | null;
};

type PostPurchaseDecisionResult =
  | {
      ok: true;
      duplicate: boolean;
      decision: PublicPostPurchaseDecision;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
      checkout?: PublicPostPurchaseCheckout;
    };

export type PublicPostPurchaseCheckout = {
  checkoutIntentId: string;
  status: string;
  amountCents: number;
  currency: string;
  updatedAt: number;
  eligible: boolean;
  selectedOrderBumpPriceIds: string[];
  privateDataIncluded: false;
  rawStripeIdsIncluded: false;
};

export const postPurchaseDecisionContract = {
  id: "post-purchase-decision-contract",
  status: "non-billing-decision-ready",
  issue: 117,
  parentIssue: 15,
  relatedIssues: [34, 81, 99, 101, 111, 113, 115],
  apiRoute: postPurchaseDecisionApiRoute,
  routePrefix: postPurchaseDecisionRoutePrefix,
  confirmationText: postPurchaseDecisionConfirmationText,
  eligibleCheckoutStatuses: ["paid", "completed"],
  allowedDecisions: [
    {
      decisionKind: "accept_upsell_follow_up" as const,
      presentedOfferId: postPurchaseUpsellOfferId,
      billingMutationCreated: false,
    },
    {
      decisionKind: "decline_upsell" as const,
      presentedOfferId: postPurchaseUpsellOfferId,
      billingMutationCreated: false,
    },
    {
      decisionKind: "accept_downsell_follow_up" as const,
      presentedOfferId: postPurchaseDownsellOfferId,
      billingMutationCreated: false,
    },
    {
      decisionKind: "decline_downsell" as const,
      presentedOfferId: postPurchaseDownsellOfferId,
      billingMutationCreated: false,
    },
  ],
  publicSafeFields: [
    "decisionId",
    "checkoutIntentId",
    "offerStackId",
    "presentedOfferId",
    "decisionKind",
    "checkoutStatus",
    "checkoutUpdatedAt",
    "aggregateDecisionCounts",
  ],
  serverPrivateFields: [
    "idempotency_key",
    "audit_correlation_id",
    "raw Stripe identifiers",
    "buyer email",
    "payment method",
    "private checkout metadata",
  ],
  writeBoundary:
    "Issue #117 can record non-billing post-purchase upsell/downsell decisions for trusted sandbox checkout intents. It cannot create Stripe charges, PaymentIntents, subscriptions, fulfillment, entitlement grants, payable commissions, payout state, tax records, partner notifications, or direct agent billing writes.",
};

export function publicPostPurchaseCheckout(row: PostPurchaseCheckoutRow): PublicPostPurchaseCheckout {
  const metadata = safeMetadata(row.metadata_json);
  return {
    checkoutIntentId: row.id,
    status: row.status,
    amountCents: row.amount_cents,
    currency: row.currency,
    updatedAt: row.updated_at,
    eligible: isEligiblePostPurchaseCheckout(row),
    selectedOrderBumpPriceIds: safeStringArray(metadata.selected_order_bump_price_ids),
    privateDataIncluded: false,
    rawStripeIdsIncluded: false,
  };
}

function publicDecision(row: CheckoutPostPurchaseDecisionRow): PublicPostPurchaseDecision {
  return {
    decisionId: row.id,
    checkoutIntentId: row.checkout_intent_id,
    offerStackId: row.offer_stack_id,
    presentedOfferId: row.presented_offer_id,
    decisionKind: row.decision_kind,
    checkoutStatus: row.checkout_status,
    checkoutUpdatedAt: row.checkout_updated_at,
    actorKind: row.actor_kind,
    createdAt: row.created_at,
    stripeChargeCreated: false,
    paymentIntentCreated: false,
    fulfillmentCreated: false,
    entitlementGranted: false,
    payableCommissionCreated: false,
    payoutCreated: false,
    privateDataIncluded: false,
    rawStripeIdsIncluded: false,
  };
}

function safeMetadata(value: string | null) {
  if (!value) return {} as Record<string, unknown>;
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function safeStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function decisionOfferId(decisionKind: PostPurchaseDecisionKind) {
  if (decisionKind === "accept_upsell_follow_up" || decisionKind === "decline_upsell") {
    return postPurchaseUpsellOfferId;
  }
  return postPurchaseDownsellOfferId;
}

function parseDecisionKind(value: string | null | undefined): PostPurchaseDecisionKind | null {
  if (
    value === "accept_upsell_follow_up" ||
    value === "decline_upsell" ||
    value === "accept_downsell_follow_up" ||
    value === "decline_downsell"
  ) {
    return value;
  }
  return null;
}

export function isEligiblePostPurchaseCheckout(row: PostPurchaseCheckoutRow) {
  return row.checkout_kind === "sandbox_checkout" && (row.status === "paid" || row.status === "completed");
}

export async function loadPostPurchaseCheckout(db: D1Database, checkoutIntentId: string) {
  const row = await db
    .prepare(
      `SELECT id, checkout_kind, status, product_id, price_id, amount_cents, currency,
        audit_correlation_id, metadata_json, updated_at
       FROM checkout_intents
       WHERE id = ?`,
    )
    .bind(checkoutIntentId)
    .first<PostPurchaseCheckoutRow>();

  return row;
}

async function loadDecisionByIdempotencyKey(db: D1Database, idempotencyKey: string) {
  const row = await db
    .prepare(
      `SELECT id, idempotency_key, checkout_intent_id, offer_stack_id, presented_offer_id,
        decision_kind, checkout_status, checkout_updated_at, actor_kind, audit_correlation_id,
        metadata_json, created_at
       FROM checkout_post_purchase_decisions
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<CheckoutPostPurchaseDecisionRow>();

  return row ? publicDecision(row) : null;
}

export async function recordPostPurchaseDecision(input: {
  db: D1Database;
  checkoutIntentId: string;
  decisionKind: string;
  idempotencyKey: string;
  expectedCheckoutUpdatedAt: number;
  actorKind?: string | null;
}): Promise<PostPurchaseDecisionResult> {
  const decisionKind = parseDecisionKind(input.decisionKind);
  if (!decisionKind) {
    return {
      ok: false,
      status: 400,
      code: "post_purchase_decision_unsupported",
      message: "Unsupported post-purchase decision.",
    };
  }

  const presentedOfferId = decisionOfferId(decisionKind);
  if (!presentedOfferId) {
    return {
      ok: false,
      status: 500,
      code: "post_purchase_offer_not_seeded",
      message: "The seeded post-purchase offer is not available.",
    };
  }

  const duplicate = await loadDecisionByIdempotencyKey(input.db, input.idempotencyKey);
  if (duplicate) {
    if (duplicate.checkoutIntentId !== input.checkoutIntentId || duplicate.decisionKind !== decisionKind) {
      return {
        ok: false,
        status: 409,
        code: "post_purchase_decision_idempotency_conflict",
        message: "This post-purchase decision idempotency key is already attached to a different decision.",
      };
    }
    return { ok: true, duplicate: true, decision: duplicate };
  }

  const checkout = await loadPostPurchaseCheckout(input.db, input.checkoutIntentId);
  if (!checkout) {
    return {
      ok: false,
      status: 400,
      code: "checkout_intent_not_found",
      message: "A recorded checkout intent is required before post-purchase decisions.",
    };
  }

  const publicCheckoutState = publicPostPurchaseCheckout(checkout);
  if (!isEligiblePostPurchaseCheckout(checkout)) {
    return {
      ok: false,
      status: 409,
      code: "post_purchase_checkout_not_eligible",
      message: "Post-purchase decisions require a paid or completed sandbox checkout intent.",
      checkout: publicCheckoutState,
    };
  }

  if (checkout.updated_at !== input.expectedCheckoutUpdatedAt) {
    return {
      ok: false,
      status: 409,
      code: "post_purchase_checkout_stale_state",
      message: "Checkout state changed before this post-purchase decision was recorded.",
      checkout: publicCheckoutState,
    };
  }

  const decisionId = `post-purchase-decision-${crypto.randomUUID()}`;
  await input.db
    .prepare(
      `INSERT INTO checkout_post_purchase_decisions (
        id, idempotency_key, checkout_intent_id, offer_stack_id, presented_offer_id,
        decision_kind, checkout_status, checkout_updated_at, actor_kind, audit_correlation_id,
        metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      decisionId,
      input.idempotencyKey,
      input.checkoutIntentId,
      postPurchaseOfferStackId,
      presentedOfferId,
      decisionKind,
      checkout.status,
      checkout.updated_at,
      input.actorKind?.trim() || "buyer_post_purchase_page",
      checkout.audit_correlation_id,
      JSON.stringify({
        issue: 117,
        routePrefix: postPurchaseDecisionRoutePrefix,
        billingMutationCreated: false,
        stripeChargeCreated: false,
        paymentIntentCreated: false,
        fulfillmentCreated: false,
        entitlementGranted: false,
        payableCommissionCreated: false,
        payoutCreated: false,
        privateDataIncluded: false,
        rawStripeIdsIncluded: false,
      }),
    )
    .run();

  await input.db
    .prepare(
      `INSERT INTO payment_audit_events (
        id, checkout_intent_id, event_kind, actor_kind, actor_id, summary, metadata_json, created_at
      ) VALUES (?, ?, 'post_purchase_non_billing_decision_recorded', ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      `audit-${crypto.randomUUID()}`,
      input.checkoutIntentId,
      input.actorKind?.trim() || "buyer_post_purchase_page",
      null,
      "Recorded non-billing post-purchase upsell/downsell decision evidence.",
      JSON.stringify({
        decisionId,
        decisionKind,
        presentedOfferId,
        billingMutationCreated: false,
        rawPrivateDataRedacted: true,
      }),
    )
    .run();

  const decision = await loadDecisionByIdempotencyKey(input.db, input.idempotencyKey);
  if (!decision) {
    return {
      ok: false,
      status: 500,
      code: "post_purchase_decision_not_recorded",
      message: "The post-purchase decision could not be recorded.",
      checkout: publicCheckoutState,
    };
  }

  return { ok: true, duplicate: false, decision };
}

export async function loadPostPurchaseDecisionSummary(db: D1Database | null | undefined) {
  if (!db) {
    return {
      status: "unavailable",
      aggregateCounts: [] as PostPurchaseDecisionAggregateRow[],
      rawRowsIncluded: false,
      privateDataIncluded: false,
      billingMutationsIncluded: false,
      fulfillmentRowsIncluded: false,
      entitlementRowsIncluded: false,
    };
  }

  const result = await db
    .prepare(
      `SELECT
        offer_stack_id,
        presented_offer_id,
        decision_kind,
        COUNT(*) AS total_decisions,
        MAX(created_at) AS last_created_at
       FROM checkout_post_purchase_decisions
       GROUP BY offer_stack_id, presented_offer_id, decision_kind
       ORDER BY offer_stack_id, presented_offer_id, decision_kind`,
    )
    .all<PostPurchaseDecisionAggregateRow>();

  return {
    status: "available",
    aggregateCounts: result.results ?? [],
    rawRowsIncluded: false,
    privateDataIncluded: false,
    billingMutationsIncluded: false,
    fulfillmentRowsIncluded: false,
    entitlementRowsIncluded: false,
  };
}
