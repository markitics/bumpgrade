import { checkoutOfferStack } from "@/lib/checkout-offers";
import type { AdminIdentity } from "@/lib/admin-roles";
import { parseIntentMetadata, sandboxCheckoutPriceId, type CheckoutIntentRow } from "@/lib/sandbox-checkout";

export const affiliateCommissionLedgerUpdatedAt = "2026-05-19";

export const affiliateCommissionLedgerApiRoute = "/api/affiliates/commission-ledger";
export const affiliateCommissionReviewActionsApiRoute = "/api/admin/affiliates/commission-ledger/actions";

export const affiliateCommissionLedgerConfirmationText =
  "Create review-only commission evidence for Bumpgrade sandbox checkout";
export const affiliateCommissionReviewActionConfirmationText =
  "Apply owner review action to Bumpgrade commission ledger evidence";

export type AffiliateCommissionLedgerStatus = "review_only" | "reversed";
export type AffiliateCommissionReviewStatus = "refund_window_open" | "owner_reviewed" | "owner_hold" | "owner_reversed";
export type AffiliateCommissionPayoutStatus = "not_payable";
export type AffiliateCommissionReviewActionKind = "mark_reviewed" | "hold_for_review" | "reverse_evidence";

const reviewActionTransitions: Record<
  AffiliateCommissionReviewActionKind,
  {
    nextLedgerStatus: AffiliateCommissionLedgerStatus;
    nextReviewStatus: AffiliateCommissionReviewStatus;
    nextPayoutStatus: AffiliateCommissionPayoutStatus;
    summary: string;
  }
> = {
  mark_reviewed: {
    nextLedgerStatus: "review_only",
    nextReviewStatus: "owner_reviewed",
    nextPayoutStatus: "not_payable",
    summary: "Owner marked review-only affiliate commission evidence as reviewed.",
  },
  hold_for_review: {
    nextLedgerStatus: "review_only",
    nextReviewStatus: "owner_hold",
    nextPayoutStatus: "not_payable",
    summary: "Owner held review-only affiliate commission evidence for follow-up.",
  },
  reverse_evidence: {
    nextLedgerStatus: "reversed",
    nextReviewStatus: "owner_reversed",
    nextPayoutStatus: "not_payable",
    summary: "Owner reversed review-only affiliate commission evidence before payout eligibility.",
  },
};

const primaryCommissionRule = {
  id: "commission-rule-launch-pass-30",
  priceId: sandboxCheckoutPriceId,
  rateBps: 3000,
  holdDays: 14,
};

const orderBumpCommissionRule = {
  id: "commission-rule-checklist-bump-10",
  priceId: checkoutOfferStack.orderBumps[0]?.priceId ?? "price-launch-checklist-bump-usd",
  rateBps: 1000,
  holdDays: 14,
};

const seededCommissionRules = [primaryCommissionRule, orderBumpCommissionRule];

export const affiliateCommissionLedgerContract = {
  id: "affiliate-commission-ledger-contract",
  status: "owner-review-actions-ready",
  issue: 115,
  parentIssue: 19,
  relatedIssues: [15, 101, 109, 111, 113],
  apiRoute: affiliateCommissionLedgerApiRoute,
  confirmationText: affiliateCommissionLedgerConfirmationText,
  sourceDataRoutes: ["/affiliates/source-data", "/commerce/source-data"],
  tables: ["affiliate_commission_ledger_entries", "affiliate_commission_ledger_actions"],
  publicSafeFields: [
    "commissionLedgerId",
    "checkoutIntentId",
    "referralAttributionId",
    "referralClickId",
    "referralLinkId",
    "partnerId",
    "grossSaleCents",
    "commissionCents",
    "ledgerStatus",
    "reviewStatus",
    "payoutStatus",
    "reviewActionCounts",
  ],
  serverPrivateFields: [
    "idempotency_key",
    "audit_correlation_id",
    "metadata_json",
    "actor_user_id",
    "actor_email",
    "private action reason",
    "buyer identifiers",
    "raw Stripe identifiers",
    "partner payout accounts",
    "tax forms",
    "private review notes",
  ],
  writeBoundary:
    "Issue #113 can create one review-only, non-payable commission ledger evidence row from a confirmed sandbox checkout intent that already has referral attribution. Issue #115 lets an owner-gated admin session apply idempotent review, hold, or reversal actions with exact confirmation and stale-state checks. Payable commission state, payout mutation, tax collection, fraud enforcement, partner notification, partner payout accounts, buyer attribution finalization, and direct agent affiliate writes require future confirmed-write APIs.",
};

export const affiliateCommissionReviewActionsContract = {
  id: "affiliate-commission-review-actions-contract",
  status: "owner-review-actions-ready",
  issue: 115,
  parentIssue: 19,
  relatedIssues: [15, 111, 113],
  apiRoute: affiliateCommissionReviewActionsApiRoute,
  auth: "Better Auth owner session required",
  confirmationText: affiliateCommissionReviewActionConfirmationText,
  allowedActions: [
    {
      actionKind: "mark_reviewed" as const,
      nextLedgerStatus: "review_only" as const,
      nextReviewStatus: "owner_reviewed" as const,
      nextPayoutStatus: "not_payable" as const,
    },
    {
      actionKind: "hold_for_review" as const,
      nextLedgerStatus: "review_only" as const,
      nextReviewStatus: "owner_hold" as const,
      nextPayoutStatus: "not_payable" as const,
    },
    {
      actionKind: "reverse_evidence" as const,
      nextLedgerStatus: "reversed" as const,
      nextReviewStatus: "owner_reversed" as const,
      nextPayoutStatus: "not_payable" as const,
    },
  ],
  writeSafety: [
    "owner session",
    "exact confirmation text",
    "idempotency key",
    "expectedUpdatedAt stale-state check",
    "audit correlation",
    "public-safe redaction",
  ],
  writeBoundary:
    "Owner review actions may update only review-only commission ledger evidence status. They cannot create payable commission state, payout batches, Stripe payouts, tax records, partner notifications, fraud decisions, buyer attribution finalization, or direct agent writes.",
};

type CheckoutReferralAttributionSourceRow = CheckoutIntentRow & {
  confirmed_at: number | null;
  referral_attribution_id: string | null;
  referral_click_id: string | null;
  referral_link_id: string | null;
  referral_code: string | null;
  partner_id: string | null;
  destination_route: string | null;
  attribution_status: string | null;
};

export type AffiliateCommissionLedgerRow = {
  id: string;
  checkout_intent_id: string;
  referral_attribution_id: string;
  referral_click_id: string;
  referral_link_id: string;
  referral_code: string;
  partner_id: string;
  commission_rule_ids_json: string;
  source_checkout_status: string;
  source_checkout_amount_cents: number;
  commission_cents: number;
  currency: string;
  ledger_status: AffiliateCommissionLedgerStatus;
  review_status: AffiliateCommissionReviewStatus;
  payout_status: AffiliateCommissionPayoutStatus;
  refund_window_days: number;
  reversible_until: number | null;
  created_at: number;
  updated_at: number;
};

export type PublicAffiliateCommissionLedger = {
  commissionLedgerId: string;
  checkoutIntentId: string;
  referralAttributionId: string;
  referralClickId: string;
  referralLinkId: string;
  referralCode: string;
  partnerId: string;
  commissionRuleIds: string[];
  sourceCheckoutStatus: string;
  grossSaleCents: number;
  commissionCents: number;
  currency: string;
  ledgerStatus: AffiliateCommissionLedgerStatus;
  reviewStatus: AffiliateCommissionReviewStatus;
  payoutStatus: AffiliateCommissionPayoutStatus;
  refundWindowDays: number;
  reversibleUntil: number | null;
  updatedAt: number;
  payableCommissionCreated: false;
  payoutCreated: false;
  taxDataIncluded: false;
  partnerNotificationSent: false;
  privateDataIncluded: false;
  rawStripeIdsIncluded: false;
};

type AffiliateCommissionLedgerActionRow = {
  id: string;
  idempotency_key: string;
  commission_ledger_id: string;
  checkout_intent_id: string;
  action_kind: AffiliateCommissionReviewActionKind;
  previous_ledger_status: AffiliateCommissionLedgerStatus;
  previous_review_status: AffiliateCommissionReviewStatus;
  previous_payout_status: AffiliateCommissionPayoutStatus;
  next_ledger_status: AffiliateCommissionLedgerStatus;
  next_review_status: AffiliateCommissionReviewStatus;
  next_payout_status: AffiliateCommissionPayoutStatus;
  actor_role: string;
  reason_public: string | null;
  created_at: number;
};

export type PublicAffiliateCommissionLedgerAction = {
  actionId: string;
  commissionLedgerId: string;
  checkoutIntentId: string;
  actionKind: AffiliateCommissionReviewActionKind;
  previousLedgerStatus: AffiliateCommissionLedgerStatus;
  previousReviewStatus: AffiliateCommissionReviewStatus;
  previousPayoutStatus: AffiliateCommissionPayoutStatus;
  nextLedgerStatus: AffiliateCommissionLedgerStatus;
  nextReviewStatus: AffiliateCommissionReviewStatus;
  nextPayoutStatus: AffiliateCommissionPayoutStatus;
  actorRole: string;
  reasonPublic: string | null;
  createdAt: number;
  payableCommissionCreated: false;
  payoutCreated: false;
  taxDataIncluded: false;
  partnerNotificationSent: false;
  privateDataIncluded: false;
  rawStripeIdsIncluded: false;
};

type CommissionLedgerResult =
  | {
      ok: true;
      duplicate: boolean;
      ledger: PublicAffiliateCommissionLedger;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
    };

type CommissionLedgerActionResult =
  | {
      ok: true;
      duplicate: boolean;
      action: PublicAffiliateCommissionLedgerAction;
      ledger: PublicAffiliateCommissionLedger;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
      ledger?: PublicAffiliateCommissionLedger;
    };

type CheckoutLineItemMetadata = {
  priceId?: string;
  unitAmountCents?: number;
};

export function publicAffiliateCommissionLedger(row: AffiliateCommissionLedgerRow): PublicAffiliateCommissionLedger {
  return {
    commissionLedgerId: row.id,
    checkoutIntentId: row.checkout_intent_id,
    referralAttributionId: row.referral_attribution_id,
    referralClickId: row.referral_click_id,
    referralLinkId: row.referral_link_id,
    referralCode: row.referral_code,
    partnerId: row.partner_id,
    commissionRuleIds: safeJsonArray(row.commission_rule_ids_json),
    sourceCheckoutStatus: row.source_checkout_status,
    grossSaleCents: row.source_checkout_amount_cents,
    commissionCents: row.commission_cents,
    currency: row.currency,
    ledgerStatus: row.ledger_status,
    reviewStatus: row.review_status,
    payoutStatus: row.payout_status,
    refundWindowDays: row.refund_window_days,
    reversibleUntil: row.reversible_until,
    updatedAt: row.updated_at,
    payableCommissionCreated: false,
    payoutCreated: false,
    taxDataIncluded: false,
    partnerNotificationSent: false,
    privateDataIncluded: false,
    rawStripeIdsIncluded: false,
  };
}

function publicAffiliateCommissionLedgerAction(
  row: AffiliateCommissionLedgerActionRow,
): PublicAffiliateCommissionLedgerAction {
  return {
    actionId: row.id,
    commissionLedgerId: row.commission_ledger_id,
    checkoutIntentId: row.checkout_intent_id,
    actionKind: row.action_kind,
    previousLedgerStatus: row.previous_ledger_status,
    previousReviewStatus: row.previous_review_status,
    previousPayoutStatus: row.previous_payout_status,
    nextLedgerStatus: row.next_ledger_status,
    nextReviewStatus: row.next_review_status,
    nextPayoutStatus: row.next_payout_status,
    actorRole: row.actor_role,
    reasonPublic: row.reason_public,
    createdAt: row.created_at,
    payableCommissionCreated: false,
    payoutCreated: false,
    taxDataIncluded: false,
    partnerNotificationSent: false,
    privateDataIncluded: false,
    rawStripeIdsIncluded: false,
  };
}

function safeJsonArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function checkoutLineItems(intent: CheckoutIntentRow): CheckoutLineItemMetadata[] {
  const metadata = parseIntentMetadata(intent);
  const lineItems = metadata.line_items;
  if (!Array.isArray(lineItems)) return [];
  return lineItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as CheckoutLineItemMetadata;
      return typeof candidate.priceId === "string" && typeof candidate.unitAmountCents === "number" ? candidate : null;
    })
    .filter((item): item is CheckoutLineItemMetadata => Boolean(item));
}

function calculateCommission(input: { intent: CheckoutIntentRow }) {
  const lineItems = checkoutLineItems(input.intent);
  const items =
    lineItems.length > 0
      ? lineItems
      : [{ priceId: input.intent.price_id ?? sandboxCheckoutPriceId, unitAmountCents: input.intent.amount_cents }];

  const ruleMatches = items
    .map((item) => {
      const rule = seededCommissionRules.find((candidate) => candidate.priceId === item.priceId);
      if (!rule || typeof item.unitAmountCents !== "number") return null;
      return {
        ruleId: rule.id,
        commissionCents: Math.round((item.unitAmountCents * rule.rateBps) / 10_000),
        holdDays: rule.holdDays,
      };
    })
    .filter((item): item is { ruleId: string; commissionCents: number; holdDays: number } => Boolean(item));

  return {
    commissionRuleIds: Array.from(new Set(ruleMatches.map((item) => item.ruleId))),
    commissionCents: ruleMatches.reduce((sum, item) => sum + item.commissionCents, 0),
    refundWindowDays: Math.max(...ruleMatches.map((item) => item.holdDays), 14),
  };
}

async function loadCommissionSource(db: D1Database, checkoutIntentId: string) {
  return db
    .prepare(
      `SELECT
        ci.id, ci.idempotency_key, ci.checkout_kind, ci.status, ci.product_id, ci.price_id, ci.buyer_email,
        ci.amount_cents, ci.currency, ci.stripe_mode, ci.stripe_checkout_session_id, ci.success_url, ci.cancel_url,
        ci.audit_correlation_id, ci.agent_client_id, ci.metadata_json, ci.confirmed_at,
        cra.id AS referral_attribution_id, cra.referral_click_id, cra.referral_link_id, cra.referral_code,
        cra.partner_id, cra.destination_route, cra.attribution_status
       FROM checkout_intents ci
       LEFT JOIN checkout_referral_attributions cra ON cra.checkout_intent_id = ci.id
       WHERE ci.id = ?`,
    )
    .bind(checkoutIntentId)
    .first<CheckoutReferralAttributionSourceRow>();
}

async function loadLedgerByIdempotencyKey(db: D1Database, idempotencyKey: string) {
  const row = await db
    .prepare(
      `SELECT
        id, checkout_intent_id, referral_attribution_id, referral_click_id, referral_link_id, referral_code,
        partner_id, commission_rule_ids_json, source_checkout_status, source_checkout_amount_cents,
        commission_cents, currency, ledger_status, review_status, payout_status, refund_window_days,
        reversible_until, created_at, updated_at
       FROM affiliate_commission_ledger_entries
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<AffiliateCommissionLedgerRow>();

  return row ? publicAffiliateCommissionLedger(row) : null;
}

async function loadLedgerByCheckoutIntent(db: D1Database, checkoutIntentId: string) {
  const row = await db
    .prepare(
      `SELECT
        id, checkout_intent_id, referral_attribution_id, referral_click_id, referral_link_id, referral_code,
        partner_id, commission_rule_ids_json, source_checkout_status, source_checkout_amount_cents,
        commission_cents, currency, ledger_status, review_status, payout_status, refund_window_days,
        reversible_until, created_at, updated_at
       FROM affiliate_commission_ledger_entries
       WHERE checkout_intent_id = ?`,
    )
    .bind(checkoutIntentId)
    .first<AffiliateCommissionLedgerRow>();

  return row ? publicAffiliateCommissionLedger(row) : null;
}

async function loadLedgerById(db: D1Database, commissionLedgerId: string) {
  const row = await db
    .prepare(
      `SELECT
        id, checkout_intent_id, referral_attribution_id, referral_click_id, referral_link_id, referral_code,
        partner_id, commission_rule_ids_json, source_checkout_status, source_checkout_amount_cents,
        commission_cents, currency, ledger_status, review_status, payout_status, refund_window_days,
        reversible_until, created_at, updated_at
       FROM affiliate_commission_ledger_entries
       WHERE id = ?`,
    )
    .bind(commissionLedgerId)
    .first<AffiliateCommissionLedgerRow>();

  return row ? publicAffiliateCommissionLedger(row) : null;
}

async function loadLedgerActionByIdempotencyKey(db: D1Database, idempotencyKey: string) {
  const row = await db
    .prepare(
      `SELECT
        id, idempotency_key, commission_ledger_id, checkout_intent_id, action_kind,
        previous_ledger_status, previous_review_status, previous_payout_status,
        next_ledger_status, next_review_status, next_payout_status,
        actor_role, reason_public, created_at
       FROM affiliate_commission_ledger_actions
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<AffiliateCommissionLedgerActionRow>();

  return row ? publicAffiliateCommissionLedgerAction(row) : null;
}

export async function createReviewOnlyCommissionLedger(input: {
  db: D1Database;
  checkoutIntentId: string;
  idempotencyKey: string;
  actorId?: string | null;
}): Promise<CommissionLedgerResult> {
  const duplicate = await loadLedgerByIdempotencyKey(input.db, input.idempotencyKey);
  if (duplicate) {
    if (duplicate.checkoutIntentId !== input.checkoutIntentId) {
      return {
        ok: false,
        status: 409,
        code: "commission_ledger_idempotency_conflict",
        message: "This commission ledger idempotency key is already attached to a different checkout intent.",
      };
    }
    return { ok: true, duplicate: true, ledger: duplicate };
  }

  const existingForCheckout = await loadLedgerByCheckoutIntent(input.db, input.checkoutIntentId);
  if (existingForCheckout) {
    return {
      ok: false,
      status: 409,
      code: "commission_ledger_checkout_conflict",
      message: "This checkout intent already has review-only commission ledger evidence.",
    };
  }

  const source = await loadCommissionSource(input.db, input.checkoutIntentId);
  if (!source) {
    return {
      ok: false,
      status: 400,
      code: "checkout_intent_not_found",
      message: "Only recorded sandbox checkout intents can create review-only commission ledger evidence.",
    };
  }

  if (source.checkout_kind !== "sandbox_checkout" || source.amount_cents <= 0 || !source.confirmed_at) {
    return {
      ok: false,
      status: 400,
      code: "checkout_intent_not_trusted",
      message: "The checkout intent is not a confirmed sandbox checkout intent.",
    };
  }

  if (
    !source.referral_attribution_id ||
    !source.referral_click_id ||
    !source.referral_link_id ||
    !source.referral_code ||
    !source.partner_id
  ) {
    return {
      ok: false,
      status: 400,
      code: "checkout_referral_attribution_required",
      message: "Review-only commission ledger evidence requires checkout referral attribution first.",
    };
  }

  const calculation = calculateCommission({ intent: source });
  if (calculation.commissionRuleIds.length === 0 || calculation.commissionCents <= 0) {
    return {
      ok: false,
      status: 400,
      code: "commission_rule_not_seeded",
      message: "No seeded commission rule applies to this sandbox checkout intent.",
    };
  }

  const ledgerId = `commission-ledger-${crypto.randomUUID()}`;
  const reversibleUntil = Math.floor(Date.now() / 1000) + calculation.refundWindowDays * 24 * 60 * 60;

  await input.db
    .prepare(
      `INSERT OR IGNORE INTO affiliate_commission_ledger_entries (
        id, idempotency_key, checkout_intent_id, referral_attribution_id, referral_click_id, referral_link_id,
        referral_code, partner_id, commission_rule_ids_json, source_checkout_status, source_checkout_amount_cents,
        commission_cents, currency, ledger_status, review_status, payout_status, refund_window_days,
        reversible_until, audit_correlation_id, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'review_only', 'refund_window_open', 'not_payable', ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      ledgerId,
      input.idempotencyKey,
      source.id,
      source.referral_attribution_id,
      source.referral_click_id,
      source.referral_link_id,
      source.referral_code,
      source.partner_id,
      JSON.stringify(calculation.commissionRuleIds),
      source.status,
      source.amount_cents,
      calculation.commissionCents,
      source.currency,
      calculation.refundWindowDays,
      reversibleUntil,
      source.audit_correlation_id,
      JSON.stringify({
        issue: 113,
        source: "checkout_referral_attribution",
        actorId: input.actorId ?? null,
        payableCommissionCreated: false,
        payoutCreated: false,
        taxDataIncluded: false,
        partnerNotificationSent: false,
        privateDataIncluded: false,
        rawStripeIdsIncluded: false,
      }),
    )
    .run();

  const ledger = await loadLedgerByCheckoutIntent(input.db, source.id);
  if (!ledger) {
    return {
      ok: false,
      status: 500,
      code: "commission_ledger_not_recorded",
      message: "The review-only commission ledger evidence could not be recorded.",
    };
  }

  await input.db
    .prepare(
      `INSERT INTO payment_audit_events (
        id, checkout_intent_id, event_kind, actor_kind, actor_id, summary, metadata_json, created_at
      ) VALUES (?, ?, 'affiliate_commission_ledger_review_only_created', 'affiliate_commission_api', ?, ?, ?, unixepoch())`,
    )
    .bind(
      `audit-${crypto.randomUUID()}`,
      source.id,
      input.actorId ?? null,
      "Created review-only affiliate commission ledger evidence from checkout referral attribution.",
      JSON.stringify({
        commissionLedgerId: ledger.commissionLedgerId,
        referralAttributionId: ledger.referralAttributionId,
        commissionRuleIds: ledger.commissionRuleIds,
        grossSaleCents: ledger.grossSaleCents,
        commissionCents: ledger.commissionCents,
        payableCommissionCreated: false,
        payoutCreated: false,
        rawPrivateDataRedacted: true,
      }),
    )
    .run();

  return { ok: true, duplicate: false, ledger };
}

function reviewTransitionFor(actionKind: string | null | undefined) {
  if (!actionKind) return null;
  return reviewActionTransitions[actionKind as AffiliateCommissionReviewActionKind] ?? null;
}

function publicReason(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, 180);
}

export async function applyOwnerCommissionLedgerAction(input: {
  db: D1Database;
  commissionLedgerId: string;
  actionKind: AffiliateCommissionReviewActionKind;
  idempotencyKey: string;
  expectedUpdatedAt: number;
  actor: AdminIdentity;
  reason?: string | null;
}): Promise<CommissionLedgerActionResult> {
  const duplicate = await loadLedgerActionByIdempotencyKey(input.db, input.idempotencyKey);
  if (duplicate) {
    if (duplicate.commissionLedgerId !== input.commissionLedgerId || duplicate.actionKind !== input.actionKind) {
      return {
        ok: false,
        status: 409,
        code: "commission_review_idempotency_conflict",
        message: "This commission review idempotency key is already attached to a different action.",
      };
    }

    const ledger = await loadLedgerById(input.db, duplicate.commissionLedgerId);
    if (!ledger) {
      return {
        ok: false,
        status: 500,
        code: "commission_review_ledger_missing",
        message: "The original commission ledger row for this review action is missing.",
      };
    }
    return { ok: true, duplicate: true, action: duplicate, ledger };
  }

  const ledger = await loadLedgerById(input.db, input.commissionLedgerId);
  if (!ledger) {
    return {
      ok: false,
      status: 400,
      code: "commission_ledger_not_found",
      message: "A recorded commission ledger row is required before owner review actions.",
    };
  }

  const transition = reviewTransitionFor(input.actionKind);
  if (!transition) {
    return {
      ok: false,
      status: 400,
      code: "commission_review_action_unsupported",
      message: "Unsupported commission review action.",
      ledger,
    };
  }

  if (ledger.updatedAt !== input.expectedUpdatedAt) {
    return {
      ok: false,
      status: 409,
      code: "commission_review_stale_state",
      message: "Commission ledger state changed before this owner review action was applied.",
      ledger,
    };
  }

  if (ledger.payoutStatus !== "not_payable") {
    return {
      ok: false,
      status: 409,
      code: "commission_review_payable_state_blocked",
      message: "Owner review actions in this slice can only touch non-payable commission evidence.",
      ledger,
    };
  }

  if (ledger.ledgerStatus === "reversed") {
    return {
      ok: false,
      status: 409,
      code: "commission_review_already_reversed",
      message: "Reversed commission evidence cannot receive another non-duplicate review action.",
      ledger,
    };
  }

  const actionId = `commission-review-action-${crypto.randomUUID()}`;
  const reasonPublic = publicReason(input.reason);
  const nowMetadata = {
    issue: 115,
    actorRole: input.actor.role,
    actorUserId: input.actor.userId,
    actorEmail: input.actor.email,
    actorName: input.actor.name,
    privateReason: input.reason ?? null,
    payableCommissionCreated: false,
    payoutCreated: false,
    taxDataIncluded: false,
    partnerNotificationSent: false,
    privateDataIncludedInPublicResponse: false,
    rawStripeIdsIncluded: false,
  };

  await input.db
    .prepare(
      `UPDATE affiliate_commission_ledger_entries
       SET ledger_status = ?,
           review_status = ?,
           payout_status = ?,
           metadata_json = ?,
           updated_at = CASE WHEN unixepoch() <= updated_at THEN updated_at + 1 ELSE unixepoch() END
       WHERE id = ?
         AND updated_at = ?
         AND payout_status = 'not_payable'
         AND ledger_status = 'review_only'`,
    )
    .bind(
      transition.nextLedgerStatus,
      transition.nextReviewStatus,
      transition.nextPayoutStatus,
      JSON.stringify({
        issue: 115,
        latestReviewActionId: actionId,
        latestReviewActionKind: input.actionKind,
        reasonPublic,
        payableCommissionCreated: false,
        payoutCreated: false,
        taxDataIncluded: false,
        partnerNotificationSent: false,
        privateDataIncluded: false,
        rawStripeIdsIncluded: false,
      }),
      input.commissionLedgerId,
      input.expectedUpdatedAt,
    )
    .run();

  const updatedLedger = await loadLedgerById(input.db, input.commissionLedgerId);
  if (!updatedLedger || updatedLedger.updatedAt === ledger.updatedAt) {
    return {
      ok: false,
      status: 409,
      code: "commission_review_stale_state",
      message: "Commission ledger state changed before this owner review action was applied.",
      ledger,
    };
  }

  await input.db
    .prepare(
      `INSERT INTO affiliate_commission_ledger_actions (
        id, idempotency_key, commission_ledger_id, checkout_intent_id, action_kind,
        previous_ledger_status, previous_review_status, previous_payout_status,
        next_ledger_status, next_review_status, next_payout_status,
        actor_user_id, actor_email, actor_role, reason_public, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      actionId,
      input.idempotencyKey,
      input.commissionLedgerId,
      ledger.checkoutIntentId,
      input.actionKind,
      ledger.ledgerStatus,
      ledger.reviewStatus,
      ledger.payoutStatus,
      transition.nextLedgerStatus,
      transition.nextReviewStatus,
      transition.nextPayoutStatus,
      input.actor.userId,
      input.actor.email,
      input.actor.role,
      reasonPublic,
      JSON.stringify(nowMetadata),
    )
    .run();

  await input.db
    .prepare(
      `INSERT INTO payment_audit_events (
        id, checkout_intent_id, event_kind, actor_kind, actor_id, summary, metadata_json, created_at
      ) VALUES (?, ?, 'affiliate_commission_ledger_owner_review_action', 'owner_admin_api', ?, ?, ?, unixepoch())`,
    )
    .bind(
      `audit-${crypto.randomUUID()}`,
      ledger.checkoutIntentId,
      input.actor.userId ?? input.actor.email,
      transition.summary,
      JSON.stringify({
        commissionLedgerId: input.commissionLedgerId,
        reviewActionId: actionId,
        actionKind: input.actionKind,
        nextLedgerStatus: transition.nextLedgerStatus,
        nextReviewStatus: transition.nextReviewStatus,
        nextPayoutStatus: transition.nextPayoutStatus,
        payableCommissionCreated: false,
        payoutCreated: false,
        taxDataIncluded: false,
        partnerNotificationSent: false,
        rawPrivateDataRedacted: true,
      }),
    )
    .run();

  const action = await loadLedgerActionByIdempotencyKey(input.db, input.idempotencyKey);
  if (!action) {
    return {
      ok: false,
      status: 500,
      code: "commission_review_action_not_recorded",
      message: "The owner review action could not be recorded.",
      ledger: updatedLedger,
    };
  }

  return { ok: true, duplicate: false, action, ledger: updatedLedger };
}

export type AffiliateCommissionLedgerAggregateRow = {
  referral_link_id: string;
  referral_code: string;
  partner_id: string;
  ledger_status: string;
  review_status: string;
  payout_status: string;
  total_ledgers: number;
  total_source_checkout_amount_cents: number;
  total_commission_cents: number;
  last_created_at: number | null;
};

export type AffiliateCommissionLedgerActionAggregateRow = {
  action_kind: string;
  next_ledger_status: string;
  next_review_status: string;
  next_payout_status: string;
  total_actions: number;
  last_created_at: number | null;
};

export async function loadAffiliateCommissionLedgerSummary(db: D1Database | null | undefined) {
  if (!db) {
    return {
      status: "unavailable",
      aggregateCounts: [] as AffiliateCommissionLedgerAggregateRow[],
      reviewActionCounts: [] as AffiliateCommissionLedgerActionAggregateRow[],
      rawRowsIncluded: false,
      privateDataIncluded: false,
      payableRowsIncluded: false,
      payoutRowsIncluded: false,
      taxRowsIncluded: false,
      partnerNotificationsIncluded: false,
    };
  }

  const [ledgerResult, actionResult] = await Promise.all([
    db
    .prepare(
      `SELECT
        referral_link_id,
        referral_code,
        partner_id,
        ledger_status,
        review_status,
        payout_status,
        COUNT(*) AS total_ledgers,
        COALESCE(SUM(source_checkout_amount_cents), 0) AS total_source_checkout_amount_cents,
        COALESCE(SUM(commission_cents), 0) AS total_commission_cents,
        MAX(created_at) AS last_created_at
       FROM affiliate_commission_ledger_entries
       GROUP BY referral_link_id, referral_code, partner_id, ledger_status, review_status, payout_status
       ORDER BY referral_link_id`,
    )
      .all<AffiliateCommissionLedgerAggregateRow>(),
    db
      .prepare(
        `SELECT
          action_kind,
          next_ledger_status,
          next_review_status,
          next_payout_status,
          COUNT(*) AS total_actions,
          MAX(created_at) AS last_created_at
         FROM affiliate_commission_ledger_actions
         GROUP BY action_kind, next_ledger_status, next_review_status, next_payout_status
         ORDER BY action_kind`,
      )
      .all<AffiliateCommissionLedgerActionAggregateRow>(),
  ]);

  return {
    status: "available",
    aggregateCounts: ledgerResult.results ?? [],
    reviewActionCounts: actionResult.results ?? [],
    rawRowsIncluded: false,
    privateDataIncluded: false,
    payableRowsIncluded: false,
    payoutRowsIncluded: false,
    taxRowsIncluded: false,
    partnerNotificationsIncluded: false,
  };
}
