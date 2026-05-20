import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import {
  affiliateCommissionReviewActionsContract,
  loadAffiliateCommissionLedgerSummary,
} from "@/lib/affiliate-commission-ledger";
import {
  affiliatePrograms,
  affiliateReferralsSourceData,
  type AffiliatePartnerReport,
} from "@/lib/affiliate-referrals";
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

type PartnerReviewActionAggregateRow = {
  referral_link_id: string;
  referral_code: string;
  partner_id: string;
  action_kind: string;
  next_ledger_status: string;
  next_review_status: string;
  next_payout_status: string;
  total_actions: number;
  last_created_at: number | null;
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

async function loadPartnerReviewActionSummary(db: D1Database | null) {
  if (!db) {
    return {
      status: "unavailable",
      aggregateCounts: [] as PartnerReviewActionAggregateRow[],
      rawRowsIncluded: false,
      rawActorIdentityIncluded: false,
      privateReasonsIncluded: false,
      payoutRowsIncluded: false,
    };
  }

  const result = await db
    .prepare(
      `SELECT
        l.referral_link_id,
        l.referral_code,
        l.partner_id,
        a.action_kind,
        a.next_ledger_status,
        a.next_review_status,
        a.next_payout_status,
        COUNT(*) AS total_actions,
        MAX(a.created_at) AS last_created_at
       FROM affiliate_commission_ledger_actions a
       INNER JOIN affiliate_commission_ledger_entries l ON l.id = a.commission_ledger_id
       GROUP BY
        l.referral_link_id,
        l.referral_code,
        l.partner_id,
        a.action_kind,
        a.next_ledger_status,
        a.next_review_status,
        a.next_payout_status
       ORDER BY l.partner_id, a.action_kind`,
    )
    .all<PartnerReviewActionAggregateRow>();

  return {
    status: "available",
    aggregateCounts: result.results ?? [],
    rawRowsIncluded: false,
    rawActorIdentityIncluded: false,
    privateReasonsIncluded: false,
    payoutRowsIncluded: false,
  };
}

function includesReportLink(report: AffiliatePartnerReport, row: { partner_id: string; referral_link_id: string }) {
  return row.partner_id === report.partnerId && report.referralLinkIds.includes(row.referral_link_id);
}

function latestTimestamp(values: Array<number | null | undefined>) {
  const timestamps = values.filter((value): value is number => typeof value === "number" && value > 0);
  return timestamps.length > 0 ? Math.max(...timestamps) : null;
}

function buildPartnerReportSummary(input: {
  clickSummary: Awaited<ReturnType<typeof loadClickSummary>>;
  checkoutAttributionSummary: Awaited<ReturnType<typeof loadCheckoutReferralAttributionSummary>>;
  commissionLedgerSummary: Awaited<ReturnType<typeof loadAffiliateCommissionLedgerSummary>>;
  partnerReviewActionSummary: Awaited<ReturnType<typeof loadPartnerReviewActionSummary>>;
}) {
  const reports = affiliatePrograms.flatMap((program) =>
    program.partnerReports.map((report) => {
      const clickRows = input.clickSummary.aggregateCounts.filter((row) => includesReportLink(report, row));
      const checkoutRows = input.checkoutAttributionSummary.aggregateCounts.filter((row) =>
        includesReportLink(report, row),
      );
      const ledgerRows = input.commissionLedgerSummary.aggregateCounts.filter((row) => includesReportLink(report, row));
      const actionRows = input.partnerReviewActionSummary.aggregateCounts.filter((row) =>
        includesReportLink(report, row),
      );

      const reviewedActions = actionRows
        .filter((row) => row.action_kind === "mark_reviewed")
        .reduce((sum, row) => sum + row.total_actions, 0);
      const heldActions = actionRows
        .filter((row) => row.action_kind === "hold_for_review")
        .reduce((sum, row) => sum + row.total_actions, 0);
      const reversedActions = actionRows
        .filter((row) => row.action_kind === "reverse_evidence")
        .reduce((sum, row) => sum + row.total_actions, 0);

      return {
        affiliatePartnerReportId: report.id,
        affiliatePartnerId: report.partnerId,
        title: report.title,
        status: report.status,
        issue: report.issue,
        reportingWindow: report.reportingWindow,
        referralLinkIds: report.referralLinkIds,
        totals: {
          totalClicks: clickRows.reduce((sum, row) => sum + row.total_clicks, 0),
          attributedCheckouts: checkoutRows.reduce((sum, row) => sum + row.total_checkouts, 0),
          reviewOnlyLedgers: ledgerRows.reduce((sum, row) => sum + row.total_ledgers, 0),
          reviewRequiredLedgers: ledgerRows
            .filter((row) => row.review_status === "refund_window_open" || row.review_status === "owner_hold")
            .reduce((sum, row) => sum + row.total_ledgers, 0),
          reviewedActions,
          heldActions,
          reversedActions,
          totalCommissionCents: ledgerRows.reduce((sum, row) => sum + row.total_commission_cents, 0),
          currency: report.fixtureMetrics.currency,
        },
        fixtureMetrics: report.fixtureMetrics,
        payoutReadiness: report.payoutReadiness,
        lastActivityAt: latestTimestamp([
          ...clickRows.map((row) => row.last_click_at),
          ...checkoutRows.map((row) => row.last_attached_at),
          ...ledgerRows.map((row) => row.last_created_at),
          ...actionRows.map((row) => row.last_created_at),
        ]),
        redaction: report.redaction,
        caveat: report.caveat,
      };
    }),
  );

  return {
    status:
      input.clickSummary.status === "available" ||
      input.checkoutAttributionSummary.status === "available" ||
      input.commissionLedgerSummary.status === "available" ||
      input.partnerReviewActionSummary.status === "available"
        ? "available"
        : "unavailable",
    reports,
    rawRowsIncluded: false,
    privateDataIncluded: false,
    buyerDataIncluded: false,
    rawClickRowsIncluded: false,
    rawCheckoutRowsIncluded: false,
    rawActorIdentityIncluded: false,
    privateReasonsIncluded: false,
    payoutRowsIncluded: false,
    taxRowsIncluded: false,
    stripeIdsIncluded: false,
  };
}

export async function GET() {
  const db = await getDb();
  const [clickSummary, checkoutAttributionSummary, commissionLedgerSummary, partnerReviewActionSummary] =
    await Promise.all([
      loadClickSummary(db),
      loadCheckoutReferralAttributionSummary(db),
      loadAffiliateCommissionLedgerSummary(db),
      loadPartnerReviewActionSummary(db),
    ]);

  return NextResponse.json({
    ...affiliateReferralsSourceData,
    clickSummary,
    checkoutAttributionSummary,
    commissionLedgerSummary,
    commissionReviewActions: {
      contract: affiliateCommissionReviewActionsContract,
    },
    partnerReviewActionSummary,
    partnerReportSummary: buildPartnerReportSummary({
      clickSummary,
      checkoutAttributionSummary,
      commissionLedgerSummary,
      partnerReviewActionSummary,
    }),
  });
}
