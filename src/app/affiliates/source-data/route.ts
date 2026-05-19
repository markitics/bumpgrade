import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import {
  affiliateCommissionReviewActionsContract,
  loadAffiliateCommissionLedgerSummary,
} from "@/lib/affiliate-commission-ledger";
import { affiliateReferralsSourceData } from "@/lib/affiliate-referrals";
import { loadCheckoutReferralAttributionSummary } from "@/lib/referral-checkout-attribution";

export const dynamic = "force-dynamic";

type ReferralClickAggregateRow = {
  referral_link_id: string;
  referral_code: string;
  partner_id: string;
  destination_route: string;
  total_clicks: number;
  last_click_at: number | null;
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as Cloudflare.Env).DB ?? null;
}

async function loadClickSummary(db: D1Database | null) {
  if (!db) {
    return {
      status: "unavailable",
      aggregateCounts: [],
      rawRowsIncluded: false,
      privateDataIncluded: false,
    };
  }

  const result = await db
    .prepare(
      `SELECT
        referral_link_id,
        referral_code,
        partner_id,
        destination_route,
        COUNT(*) AS total_clicks,
        MAX(clicked_at) AS last_click_at
       FROM affiliate_referral_clicks
       GROUP BY referral_link_id, referral_code, partner_id, destination_route
       ORDER BY referral_link_id`,
    )
    .all<ReferralClickAggregateRow>();

  return {
    status: "available",
    aggregateCounts: result.results ?? [],
    rawRowsIncluded: false,
    privateDataIncluded: false,
  };
}

export async function GET() {
  const db = await getDb();

  return NextResponse.json({
    ...affiliateReferralsSourceData,
    clickSummary: await loadClickSummary(db),
    checkoutAttributionSummary: await loadCheckoutReferralAttributionSummary(db),
    commissionLedgerSummary: await loadAffiliateCommissionLedgerSummary(db),
    commissionReviewActions: {
      contract: affiliateCommissionReviewActionsContract,
    },
  });
}
