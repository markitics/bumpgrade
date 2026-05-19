export const checkoutReferralAttributionUpdatedAt = "2026-05-19";

export const checkoutReferralAttributionContract = {
  id: "checkout-referral-attribution-contract",
  status: "checkout-attribution-evidence-ready",
  issue: 111,
  parentIssue: 19,
  relatedIssues: [15, 109],
  checkoutApiRoute: "/api/commerce/checkout",
  sourceDataRoutes: ["/commerce/source-data", "/affiliates/source-data"],
  tables: ["checkout_referral_attributions"],
  publicSafeFields: [
    "checkoutIntentId",
    "referralClickId",
    "referralLinkId",
    "referralCode",
    "partnerId",
    "destinationRoute",
    "attributionStatus",
  ],
  serverPrivateFields: [
    "audit_correlation_id",
    "metadata_json",
    "raw click rows",
    "raw cookies",
    "buyer identifiers",
    "raw Stripe identifiers",
    "payout or tax data",
  ],
  writeBoundary:
    "Issue #111 can attach a validated seeded referral click to a sandbox checkout intent as public-safe attribution evidence. Cookie assignment, buyer attribution finalization, commission writes, fraud enforcement, payout mutation, tax handling, partner notification, and direct agent affiliate writes require future confirmed-write APIs.",
};

export type ReferralClickEvidenceRow = {
  id: string;
  referral_link_id: string;
  referral_code: string;
  partner_id: string;
  destination_route: string;
};

export type CheckoutReferralAttributionRow = {
  id: string;
  checkout_intent_id: string;
  referral_click_id: string;
  referral_link_id: string;
  referral_code: string;
  partner_id: string;
  destination_route: string;
  attribution_status: "checkout_intent_attached";
};

export type PublicCheckoutReferralAttribution = {
  checkoutIntentId: string;
  referralClickId: string;
  referralLinkId: string;
  referralCode: string;
  partnerId: string;
  destinationRoute: string;
  attributionStatus: "checkout_intent_attached";
  commissionCreated: false;
  payableCommissionCreated: false;
  privateDataIncluded: false;
  rawRequestDataIncluded: false;
};

type ReferralClickValidationResult =
  | {
      ok: true;
      referralClick: ReferralClickEvidenceRow;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
    };

type CheckoutReferralAttributionResult =
  | {
      ok: true;
      created: boolean;
      attribution: PublicCheckoutReferralAttribution;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
    };

export function publicCheckoutReferralAttribution(
  row: CheckoutReferralAttributionRow,
): PublicCheckoutReferralAttribution {
  return {
    checkoutIntentId: row.checkout_intent_id,
    referralClickId: row.referral_click_id,
    referralLinkId: row.referral_link_id,
    referralCode: row.referral_code,
    partnerId: row.partner_id,
    destinationRoute: row.destination_route,
    attributionStatus: row.attribution_status,
    commissionCreated: false,
    payableCommissionCreated: false,
    privateDataIncluded: false,
    rawRequestDataIncluded: false,
  };
}

export async function validateReferralClickForCheckout(input: {
  db: D1Database;
  referralClickId: string;
  expectedDestinationRoute: string;
}): Promise<ReferralClickValidationResult> {
  const referralClick = await input.db
    .prepare(
      `SELECT id, referral_link_id, referral_code, partner_id, destination_route
       FROM affiliate_referral_clicks
       WHERE id = ?`,
    )
    .bind(input.referralClickId)
    .first<ReferralClickEvidenceRow>();

  if (!referralClick) {
    return {
      ok: false,
      status: 400,
      code: "referral_click_not_found",
      message: "Only recorded seeded referral clicks can be attached to sandbox checkout intents.",
    };
  }

  if (referralClick.destination_route !== input.expectedDestinationRoute) {
    return {
      ok: false,
      status: 400,
      code: "referral_click_route_mismatch",
      message: "The referral click destination is not eligible for this sandbox checkout intent.",
    };
  }

  return { ok: true, referralClick };
}

export async function loadCheckoutReferralAttribution(db: D1Database, checkoutIntentId: string) {
  const row = await db
    .prepare(
      `SELECT
        id, checkout_intent_id, referral_click_id, referral_link_id, referral_code,
        partner_id, destination_route, attribution_status
       FROM checkout_referral_attributions
       WHERE checkout_intent_id = ?`,
    )
    .bind(checkoutIntentId)
    .first<CheckoutReferralAttributionRow>();

  return row ? publicCheckoutReferralAttribution(row) : null;
}

export async function attachCheckoutReferralAttribution(input: {
  db: D1Database;
  checkoutIntentId: string;
  referralClick: ReferralClickEvidenceRow;
  checkoutProductId: string;
  checkoutPriceId: string;
  auditCorrelationId: string;
}): Promise<CheckoutReferralAttributionResult> {
  const existing = await loadCheckoutReferralAttribution(input.db, input.checkoutIntentId);
  if (existing) {
    if (existing.referralClickId !== input.referralClick.id) {
      return {
        ok: false,
        status: 409,
        code: "checkout_referral_attribution_conflict",
        message: "This checkout intent is already linked to a different referral click.",
      };
    }
    return { ok: true, created: false, attribution: existing };
  }

  await input.db
    .prepare(
      `INSERT OR IGNORE INTO checkout_referral_attributions (
        id, checkout_intent_id, referral_click_id, referral_link_id, referral_code,
        partner_id, destination_route, attribution_status, checkout_product_id,
        checkout_price_id, audit_correlation_id, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'checkout_intent_attached', ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      `checkout-referral-${crypto.randomUUID()}`,
      input.checkoutIntentId,
      input.referralClick.id,
      input.referralClick.referral_link_id,
      input.referralClick.referral_code,
      input.referralClick.partner_id,
      input.referralClick.destination_route,
      input.checkoutProductId,
      input.checkoutPriceId,
      input.auditCorrelationId,
      JSON.stringify({
        issue: 111,
        commissionCreated: false,
        payableCommissionCreated: false,
        privateDataIncluded: false,
        rawRequestDataIncluded: false,
      }),
    )
    .run();

  const inserted = await loadCheckoutReferralAttribution(input.db, input.checkoutIntentId);
  if (!inserted) {
    return {
      ok: false,
      status: 500,
      code: "checkout_referral_attribution_not_recorded",
      message: "The checkout referral attribution evidence could not be recorded.",
    };
  }

  if (inserted.referralClickId !== input.referralClick.id) {
    return {
      ok: false,
      status: 409,
      code: "checkout_referral_attribution_conflict",
      message: "This checkout intent is already linked to a different referral click.",
    };
  }

  return { ok: true, created: true, attribution: inserted };
}

export type CheckoutReferralAggregateRow = {
  referral_link_id: string;
  referral_code: string;
  partner_id: string;
  destination_route: string;
  attribution_status: string;
  total_checkouts: number;
  last_attached_at: number | null;
};

export async function loadCheckoutReferralAttributionSummary(db: D1Database | null | undefined) {
  if (!db) {
    return {
      status: "unavailable",
      aggregateCounts: [] as CheckoutReferralAggregateRow[],
      rawRowsIncluded: false,
      privateDataIncluded: false,
      commissionRowsIncluded: false,
    };
  }

  const result = await db
    .prepare(
      `SELECT
        referral_link_id,
        referral_code,
        partner_id,
        destination_route,
        attribution_status,
        COUNT(*) AS total_checkouts,
        MAX(created_at) AS last_attached_at
       FROM checkout_referral_attributions
       GROUP BY referral_link_id, referral_code, partner_id, destination_route, attribution_status
       ORDER BY referral_link_id`,
    )
    .all<CheckoutReferralAggregateRow>();

  return {
    status: "available",
    aggregateCounts: result.results ?? [],
    rawRowsIncluded: false,
    privateDataIncluded: false,
    commissionRowsIncluded: false,
  };
}
