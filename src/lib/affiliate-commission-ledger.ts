import { checkoutOfferStack } from "@/lib/checkout-offers";
import { parseIntentMetadata, sandboxCheckoutPriceId, type CheckoutIntentRow } from "@/lib/sandbox-checkout";

export const affiliateCommissionLedgerUpdatedAt = "2026-05-19";

export const affiliateCommissionLedgerApiRoute = "/api/affiliates/commission-ledger";

export const affiliateCommissionLedgerConfirmationText =
  "Create review-only commission evidence for Bumpgrade sandbox checkout";

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
  status: "review-only-ledger-ready",
  issue: 113,
  parentIssue: 19,
  relatedIssues: [15, 101, 109, 111],
  apiRoute: affiliateCommissionLedgerApiRoute,
  confirmationText: affiliateCommissionLedgerConfirmationText,
  sourceDataRoutes: ["/affiliates/source-data", "/commerce/source-data"],
  tables: ["affiliate_commission_ledger_entries"],
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
  ],
  serverPrivateFields: [
    "idempotency_key",
    "audit_correlation_id",
    "metadata_json",
    "buyer identifiers",
    "raw Stripe identifiers",
    "partner payout accounts",
    "tax forms",
    "private review notes",
  ],
  writeBoundary:
    "Issue #113 can create one review-only, non-payable commission ledger evidence row from a confirmed sandbox checkout intent that already has referral attribution. Payable commission state, payout mutation, tax collection, fraud enforcement, partner notification, owner review actions, reversal execution, and direct agent affiliate writes require future confirmed-write APIs.",
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
  ledger_status: "review_only";
  review_status: "refund_window_open";
  payout_status: "not_payable";
  refund_window_days: number;
  reversible_until: number | null;
  created_at: number;
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
  ledgerStatus: "review_only";
  reviewStatus: "refund_window_open";
  payoutStatus: "not_payable";
  refundWindowDays: number;
  reversibleUntil: number | null;
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
        reversible_until, created_at
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
        reversible_until, created_at
       FROM affiliate_commission_ledger_entries
       WHERE checkout_intent_id = ?`,
    )
    .bind(checkoutIntentId)
    .first<AffiliateCommissionLedgerRow>();

  return row ? publicAffiliateCommissionLedger(row) : null;
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

export async function loadAffiliateCommissionLedgerSummary(db: D1Database | null | undefined) {
  if (!db) {
    return {
      status: "unavailable",
      aggregateCounts: [] as AffiliateCommissionLedgerAggregateRow[],
      rawRowsIncluded: false,
      privateDataIncluded: false,
      payableRowsIncluded: false,
      payoutRowsIncluded: false,
      taxRowsIncluded: false,
    };
  }

  const result = await db
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
    .all<AffiliateCommissionLedgerAggregateRow>();

  return {
    status: "available",
    aggregateCounts: result.results ?? [],
    rawRowsIncluded: false,
    privateDataIncluded: false,
    payableRowsIncluded: false,
    payoutRowsIncluded: false,
    taxRowsIncluded: false,
  };
}
