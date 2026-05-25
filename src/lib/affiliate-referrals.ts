import {
  affiliateCommissionLedgerApiRoute,
  affiliateCommissionLedgerContract,
  affiliateCommissionReviewActionsApiRoute,
  affiliateCommissionReviewActionsContract,
} from "@/lib/affiliate-commission-ledger";
import {
  referralClickCaptureApiRoute,
  referralClickCaptureWriteContract,
} from "@/lib/referral-clicks";
import { checkoutReferralAttributionContract } from "@/lib/referral-checkout-attribution";

export type AffiliateProgramStatus = "draft";
export type AffiliatePartnerStatus = "approved" | "review";
export type ReferralLinkStatus = "draft" | "review";
export type AffiliatePartnerReportStatus = "public_safe_report_ready";
export type AttributionModel = "first_click" | "last_click" | "manual_review";
export type CommissionKind = "percentage" | "fixed" | "holdback";
export type CommissionLedgerStatus = "approved_pending_payout" | "review_required" | "reversed";
export type PayoutBatchStatus = "review_required";
export type PayoutPreparationChecklistStatus = "passed" | "blocked" | "external_required";
export type ReviewFlagSeverity = "low" | "medium" | "high";

export type AttributionRule = {
  id: string;
  model: AttributionModel;
  title: string;
  windowDays: number;
  priority: number;
  appliesTo: string[];
  caveat: string;
};

export type CommissionRule = {
  id: string;
  kind: CommissionKind;
  title: string;
  appliesToOfferIds: string[];
  rateBps?: number;
  amountCents?: number;
  holdDays: number;
  currency: "USD";
  caveat: string;
};

export type AffiliatePartner = {
  id: string;
  portalSlug: string;
  displayName: string;
  status: AffiliatePartnerStatus;
  publicProfile: string;
  approvedProgramIds: string[];
  referralLinkIds: string[];
  privateDataExcluded: string[];
};

export type ReferralLink = {
  id: string;
  code: string;
  status: ReferralLinkStatus;
  partnerId: string;
  destinationRoute: string;
  attributionRuleId: string;
  linkedOfferIds: string[];
  utmSource: string;
  publicUrlPattern: string;
};

export type CommissionLedgerFixture = {
  id: string;
  status: CommissionLedgerStatus;
  referralLinkId: string;
  commissionRuleId: string;
  sourceEventId: string;
  linkedCheckoutIntentId: string;
  grossSaleCents: number;
  commissionCents: number;
  currency: "USD";
  reason: string;
};

export type PayoutBatchFixture = {
  id: string;
  preparationId: string;
  status: PayoutBatchStatus;
  issue: number;
  ledgerIds: string[];
  eligibleLedgerIds: string[];
  blockedLedgerIds: string[];
  reversedLedgerIds: string[];
  partnerReportIds: string[];
  totalCommissionCents: number;
  currency: "USD";
  reviewBeforePayout: string[];
  readinessChecklist: {
    id: string;
    title: string;
    status: PayoutPreparationChecklistStatus;
    evidence: string;
  }[];
  sourceRoutes: string[];
  redaction: {
    buyerDataIncluded: false;
    rawLedgerRowsIncluded: false;
    rawActorIdentityIncluded: false;
    privateReasonsIncluded: false;
    payoutAccountIncluded: false;
    taxDataIncluded: false;
    stripeIdsIncluded: false;
    partnerNotificationIncluded: false;
  };
  caveat: string;
};

export type ReviewFlag = {
  id: string;
  severity: ReviewFlagSeverity;
  title: string;
  linkedLedgerIds: string[];
  reason: string;
  requiredAction: string;
};

export type AffiliateAuditEvent = {
  id: string;
  actor: "system" | "agent" | "owner";
  action: string;
  targetId: string;
  evidence: string;
  redaction: string;
};

export type AffiliatePartnerReport = {
  id: string;
  partnerId: string;
  title: string;
  status: AffiliatePartnerReportStatus;
  issue: number;
  reportingWindow: {
    id: string;
    label: string;
    source: string;
  };
  referralLinkIds: string[];
  sourceRoutes: string[];
  fixtureMetrics: {
    fixtureLedgerCount: number;
    fixtureReviewRequiredCount: number;
    fixtureReversedCount: number;
    fixtureCommissionCents: number;
    currency: "USD";
    runtimeAggregateFields: string[];
  };
  payoutReadiness: {
    status: "review_required" | "not_payable";
    caveats: string[];
  };
  redaction: {
    buyerDataIncluded: false;
    rawClickRowsIncluded: false;
    rawCheckoutRowsIncluded: false;
    rawActorIdentityIncluded: false;
    privateReasonsIncluded: false;
    payoutAccountIncluded: false;
    taxDataIncluded: false;
    stripeIdsIncluded: false;
  };
  caveat: string;
};

export type AffiliateProgram = {
  id: string;
  slug: string;
  title: string;
  status: AffiliateProgramStatus;
  issue: number;
  parentIssue: number;
  sourceDataRoute: string;
  previewRoute: string;
  linkedFunnelRoute: string;
  linkedOfferRoute: string;
  linkedAnalyticsRoute: string;
  revisionId: string;
  summary: string;
  attributionRules: AttributionRule[];
  commissionRules: CommissionRule[];
  partners: AffiliatePartner[];
  referralLinks: ReferralLink[];
  partnerReports: AffiliatePartnerReport[];
  commissionLedger: CommissionLedgerFixture[];
  payoutBatches: PayoutBatchFixture[];
  reviewFlags: ReviewFlag[];
  auditEvents: AffiliateAuditEvent[];
  writeBoundary: string;
  validation: string[];
};

export const affiliateReferralsUpdatedAt = "2026-05-25";

export function affiliatePartnerPortalRoute(programSlug: string, partnerSlug: string) {
  return `/affiliates/${programSlug}/partners/${partnerSlug}`;
}

export function affiliatePartnerPortalId(partnerId: string) {
  return `affiliate-partner-portal-${partnerId.replace(/^affiliate-partner-/, "")}`;
}

export const affiliatePartnerReportContract = {
  id: "affiliate-partner-report-contract",
  status: "partner-reports-ready",
  issue: 193,
  parentIssue: 19,
  relatedIssues: [89, 109, 111, 113, 115],
  sourceDataRoute: "/affiliates/source-data",
  previewRoute: "/affiliates/indie-launch-partners",
  stableIds: [
    "affiliatePartnerReportId",
    "affiliatePartnerId",
    "referralLinkId",
    "referralClickId",
    "checkoutIntentId",
    "reviewOnlyCommissionLedgerId",
    "commissionReviewActionId",
  ],
  publicSafeFields: [
    "affiliatePartnerReportId",
    "affiliatePartnerId",
    "referralLinkIds",
    "totalClicks",
    "attributedCheckouts",
    "reviewOnlyLedgers",
    "reviewedActions",
    "heldActions",
    "reversedActions",
    "totalCommissionCents",
    "payoutReadinessStatus",
    "redactionFlags",
  ],
  serverPrivateFields: [
    "buyer emails",
    "buyer hashes",
    "raw click rows",
    "raw checkout rows",
    "raw owner actor identity",
    "private review reasons",
    "Stripe customer/session identifiers",
    "partner payout accounts",
    "tax forms",
  ],
  writeBoundary:
    "Issue #193 exposes public-safe partner report definitions and aggregate report rows. Reports are read-only and cannot finalize buyer attribution, create payable commission state, trigger payouts, notify partners, store payout accounts, collect tax data, enforce fraud decisions, or accept direct agent writes.",
};

export const affiliatePartnerPortalContract = {
  id: "affiliate-partner-portal-contract",
  status: "partner-portal-status-ready",
  issue: 424,
  parentIssue: 424,
  routePattern: "/affiliates/{programSlug}/partners/{partnerSlug}",
  sourceDataRoute: "/affiliates/source-data",
  auth: "public-preview-redacted",
  stableIds: [
    "affiliatePartnerPortalId",
    "affiliatePartnerId",
    "affiliateProgramId",
    "affiliatePartnerReportId",
    "payoutPreparationId",
    "payoutBatchId",
    "referralLinkId",
    "reviewFlagId",
    "fraudReviewRecordId",
    "fraudEnforcementRecordId",
    "partnerNotificationReadinessRecordId",
    "partnerNotificationSendPreflightRecordId",
    "partnerNotificationProviderReadinessRecordId",
  ],
  publicSafeFields: [
    "partner display name",
    "partner status",
    "referral link IDs and public URL patterns",
    "aggregate click and checkout counts",
    "review-only commission totals",
    "payout readiness blockers",
    "fraud and notification readiness status",
    "redaction flags",
  ],
  serverPrivateFields: [
    "partner email address",
    "payout account",
    "tax form",
    "bank account",
    "buyer identity",
    "raw click rows",
    "raw checkout rows",
    "raw ledger rows",
    "private fraud signals",
    "notification recipient email",
    "notification body",
    "send payload",
    "provider secrets",
    "Stripe payout or transfer IDs",
  ],
  writeBoundary:
    "Issue #424 exposes a partner-facing status portal for public-safe report, payout-readiness, fraud, and notification evidence. It is not private partner authentication, payable commission state, Stripe payout execution, payout account or tax storage, partner notification sending, provider configuration, provider calls, queue dispatch, buyer attribution finalization, or direct public agent writes.",
};

export const affiliatePayoutPreparationContract = {
  id: "affiliate-payout-preparation-contract",
  status: "payout-preparation-ready",
  issue: 195,
  parentIssue: 19,
  relatedIssues: [89, 109, 111, 113, 115, 193],
  sourceDataRoute: "/affiliates/source-data",
  previewRoute: "/affiliates/indie-launch-partners",
  stableIds: [
    "payoutPreparationId",
    "payoutBatchId",
    "affiliatePartnerReportId",
    "affiliatePartnerId",
    "referralLinkId",
    "reviewOnlyCommissionLedgerId",
    "commissionReviewActionId",
  ],
  publicSafeFields: [
    "payoutPreparationId",
    "payoutBatchId",
    "partnerReportIds",
    "eligibleLedgerIds",
    "blockedLedgerIds",
    "reversedLedgerIds",
    "readinessChecklist",
    "aggregateLedgerCounts",
    "aggregateReviewActionCounts",
    "totalCommissionCents",
    "redactionFlags",
  ],
  serverPrivateFields: [
    "buyer emails",
    "buyer hashes",
    "raw ledger rows",
    "raw owner actor identity",
    "private review reasons",
    "Stripe payout and transfer identifiers",
    "partner payout accounts",
    "tax forms",
    "partner notification payloads",
  ],
  writeBoundary:
    "Issue #195 exposes read-only payout preparation rows and readiness checklists. Preparation rows cannot create payable commission state, store payout accounts, collect tax forms, trigger Stripe payouts or transfers, notify partners, override fraud/review decisions, or accept direct agent writes.",
};

export const affiliateProgram: AffiliateProgram = {
  id: "affiliate-program-indie-launch-partners",
  slug: "indie-launch-partners",
  title: "Indie launch partner program",
  status: "draft",
  issue: 195,
  parentIssue: 19,
  sourceDataRoute: "/affiliates/source-data",
  previewRoute: "/affiliates/indie-launch-partners",
  linkedFunnelRoute: "/funnels/indie-launch-sandbox",
  linkedOfferRoute: "/offers/indie-launch-stack",
  linkedAnalyticsRoute: "/analytics/indie-launch-dashboard",
  revisionId: "affiliate-program-revision-indie-launch-2026-05-25-partner-portal-status",
  summary:
    "A partner program example for referral links, checkout attribution, commission review, partner reports, payout preparation, review flags, and careful partner communication.",
  attributionRules: [
    {
      id: "attribution-rule-first-click-30",
      model: "first_click",
      title: "First click, 30-day window",
      windowDays: 30,
      priority: 1,
      appliesTo: ["ref-link-launch-circle-waitlist", "ref-link-template-partner-sales"],
      caveat: "Future live use requires consent-safe click capture, bot filtering, and replay-safe attribution writes.",
    },
    {
      id: "attribution-rule-manual-review",
      model: "manual_review",
      title: "Manual review for self-referral or refund edge cases",
      windowDays: 0,
      priority: 99,
      appliesTo: ["commission-ledger-refund-reversal", "commission-ledger-self-referral-review"],
      caveat: "Review flags block payout until an owner confirms the decision and audit note.",
    },
  ],
  commissionRules: [
    {
      id: "commission-rule-launch-pass-30",
      kind: "percentage",
      title: "Launch pass partner commission",
      appliesToOfferIds: ["offer-primary-sandbox-launch-pass"],
      rateBps: 3000,
      holdDays: 14,
      currency: "USD",
      caveat: "Use this as an example partner commission before publishing final affiliate terms.",
    },
    {
      id: "commission-rule-checklist-bump-10",
      kind: "percentage",
      title: "Checklist order-bump commission",
      appliesToOfferIds: ["offer-bump-launch-checklist"],
      rateBps: 1000,
      holdDays: 14,
      currency: "USD",
      caveat: "Order-bump commission waits for checkout, refund, and tax rules to be finalized.",
    },
    {
      id: "commission-rule-refund-holdback",
      kind: "holdback",
      title: "Refund and dispute holdback",
      appliesToOfferIds: ["offer-primary-sandbox-launch-pass", "offer-bump-launch-checklist"],
      amountCents: 0,
      holdDays: 30,
      currency: "USD",
      caveat: "Holdback rules keep refund and dispute risk visible before payout.",
    },
  ],
  partners: [
    {
      id: "affiliate-partner-launch-circle",
      portalSlug: "launch-circle",
      displayName: "Launch Circle partner",
      status: "approved",
      publicProfile: "Newsletter partner with an aligned creator and indie-launch audience.",
      approvedProgramIds: ["affiliate-program-indie-launch-partners"],
      referralLinkIds: ["ref-link-launch-circle-waitlist"],
      privateDataExcluded: ["email address", "tax form", "bank account", "payout account", "private notes"],
    },
    {
      id: "affiliate-partner-template-studio",
      portalSlug: "template-studio",
      displayName: "Template Studio partner",
      status: "review",
      publicProfile: "Template seller awaiting affiliate approval before public links or payout eligibility.",
      approvedProgramIds: [],
      referralLinkIds: ["ref-link-template-partner-sales"],
      privateDataExcluded: ["email address", "W-9/W-8 details", "payment rail", "private fraud notes"],
    },
  ],
  referralLinks: [
    {
      id: "ref-link-launch-circle-waitlist",
      code: "LAUNCHCIRCLE",
      status: "draft",
      partnerId: "affiliate-partner-launch-circle",
      destinationRoute: "/funnels/indie-launch-sandbox",
      attributionRuleId: "attribution-rule-first-click-30",
      linkedOfferIds: ["offer-primary-sandbox-launch-pass", "offer-bump-launch-checklist"],
      utmSource: "affiliate-launch-circle",
      publicUrlPattern: "https://bumpgrade.com/r/LAUNCHCIRCLE",
    },
    {
      id: "ref-link-template-partner-sales",
      code: "TEMPLATESTUDIO",
      status: "review",
      partnerId: "affiliate-partner-template-studio",
      destinationRoute: "/offers/indie-launch-stack",
      attributionRuleId: "attribution-rule-manual-review",
      linkedOfferIds: ["offer-primary-sandbox-launch-pass"],
      utmSource: "affiliate-template-studio",
      publicUrlPattern: "https://bumpgrade.com/r/TEMPLATESTUDIO",
    },
  ],
  partnerReports: [
    {
      id: "affiliate-partner-report-launch-circle",
      partnerId: "affiliate-partner-launch-circle",
      title: "Launch Circle performance report",
      status: "public_safe_report_ready",
      issue: 193,
      reportingWindow: {
        id: "affiliate-report-window-public-safe-all-time",
        label: "All-time aggregate",
        source: "Seeded fixture plus D1 aggregate summaries from click, checkout attribution, ledger, and review-action tables.",
      },
      referralLinkIds: ["ref-link-launch-circle-waitlist"],
      sourceRoutes: [
        "/affiliates/source-data",
        referralClickCaptureApiRoute,
        "/api/commerce/checkout",
        affiliateCommissionLedgerApiRoute,
        affiliateCommissionReviewActionsApiRoute,
      ],
      fixtureMetrics: {
        fixtureLedgerCount: 2,
        fixtureReviewRequiredCount: 0,
        fixtureReversedCount: 1,
        fixtureCommissionCents: 2700,
        currency: "USD",
        runtimeAggregateFields: [
          "totalClicks",
          "attributedCheckouts",
          "reviewOnlyLedgers",
          "reviewedActions",
          "heldActions",
          "reversedActions",
        ],
      },
      payoutReadiness: {
        status: "review_required",
        caveats: [
          "Refund window and reversal evidence must remain reviewable before payout preparation.",
          "Partner payout account, tax form, and private notification data stay private.",
        ],
      },
      redaction: {
        buyerDataIncluded: false,
        rawClickRowsIncluded: false,
        rawCheckoutRowsIncluded: false,
        rawActorIdentityIncluded: false,
        privateReasonsIncluded: false,
        payoutAccountIncluded: false,
        taxDataIncluded: false,
        stripeIdsIncluded: false,
      },
      caveat: "Report totals help review partner performance before a payable statement is issued.",
    },
    {
      id: "affiliate-partner-report-template-studio",
      partnerId: "affiliate-partner-template-studio",
      title: "Template Studio performance report",
      status: "public_safe_report_ready",
      issue: 193,
      reportingWindow: {
        id: "affiliate-report-window-public-safe-all-time",
        label: "All-time aggregate",
        source: "Seeded fixture plus D1 aggregate summaries from click, checkout attribution, ledger, and review-action tables.",
      },
      referralLinkIds: ["ref-link-template-partner-sales"],
      sourceRoutes: [
        "/affiliates/source-data",
        referralClickCaptureApiRoute,
        "/api/commerce/checkout",
        affiliateCommissionLedgerApiRoute,
        affiliateCommissionReviewActionsApiRoute,
      ],
      fixtureMetrics: {
        fixtureLedgerCount: 1,
        fixtureReviewRequiredCount: 1,
        fixtureReversedCount: 0,
        fixtureCommissionCents: 2700,
        currency: "USD",
        runtimeAggregateFields: [
          "totalClicks",
          "attributedCheckouts",
          "reviewOnlyLedgers",
          "reviewedActions",
          "heldActions",
          "reversedActions",
        ],
      },
      payoutReadiness: {
        status: "not_payable",
        caveats: [
          "Partner approval is still in review before reporting can become a partner-facing portal.",
          "Self-referral review remains a blocker before any payout preparation.",
        ],
      },
      redaction: {
        buyerDataIncluded: false,
        rawClickRowsIncluded: false,
        rawCheckoutRowsIncluded: false,
        rawActorIdentityIncluded: false,
        privateReasonsIncluded: false,
        payoutAccountIncluded: false,
        taxDataIncluded: false,
        stripeIdsIncluded: false,
      },
      caveat: "Report totals help review partner performance before a payable statement is issued.",
    },
  ],
  commissionLedger: [
    {
      id: "commission-ledger-launch-pass-fixture",
      status: "approved_pending_payout",
      referralLinkId: "ref-link-launch-circle-waitlist",
      commissionRuleId: "commission-rule-launch-pass-30",
      sourceEventId: "event-purchase-completed",
      linkedCheckoutIntentId: "checkout-intent-fixture-affiliate-launch-pass",
      grossSaleCents: 9000,
      commissionCents: 2700,
      currency: "USD",
      reason: "Paid checkout attributed to the Launch Circle partner inside the 30-day window.",
    },
    {
      id: "commission-ledger-self-referral-review",
      status: "review_required",
      referralLinkId: "ref-link-template-partner-sales",
      commissionRuleId: "commission-rule-launch-pass-30",
      sourceEventId: "event-purchase-completed",
      linkedCheckoutIntentId: "checkout-intent-fixture-self-referral",
      grossSaleCents: 9000,
      commissionCents: 2700,
      currency: "USD",
      reason: "Possible self-referral pattern needs review before payout eligibility.",
    },
    {
      id: "commission-ledger-refund-reversal",
      status: "reversed",
      referralLinkId: "ref-link-launch-circle-waitlist",
      commissionRuleId: "commission-rule-refund-holdback",
      sourceEventId: "event-refund-fixture",
      linkedCheckoutIntentId: "checkout-intent-fixture-refund",
      grossSaleCents: 9000,
      commissionCents: 0,
      currency: "USD",
      reason: "Refund reversed commission before payout batch creation.",
    },
  ],
  payoutBatches: [
    {
      id: "payout-batch-indie-launch-may-preview",
      preparationId: "payout-preparation-indie-launch-may-preview",
      status: "review_required",
      issue: 195,
      ledgerIds: ["commission-ledger-launch-pass-fixture", "commission-ledger-self-referral-review"],
      eligibleLedgerIds: ["commission-ledger-launch-pass-fixture"],
      blockedLedgerIds: ["commission-ledger-self-referral-review"],
      reversedLedgerIds: ["commission-ledger-refund-reversal"],
      partnerReportIds: [
        "affiliate-partner-report-launch-circle",
        "affiliate-partner-report-template-studio",
      ],
      totalCommissionCents: 2700,
      currency: "USD",
      reviewBeforePayout: [
        "Confirm refund window has elapsed.",
        "Resolve self-referral review flag.",
        "Confirm partner payout account privately.",
      ],
      readinessChecklist: [
        {
          id: "payout-prep-check-owner-reviewed",
          title: "Review decision captured",
          status: "passed",
          evidence: "Commission rows can be marked, held, or reversed before payout.",
        },
        {
          id: "payout-prep-check-refund-window",
          title: "Refund and reversal window cleared",
          status: "blocked",
          evidence: "Refund-window checks must clear before payout preparation becomes payable.",
        },
        {
          id: "payout-prep-check-private-payout-data",
          title: "Private payout and tax data available",
          status: "external_required",
          evidence: "Partner payout account and tax form checks stay private.",
        },
      ],
      sourceRoutes: [
        "/affiliates/source-data",
        "/affiliates/indie-launch-partners",
        affiliateCommissionLedgerApiRoute,
        affiliateCommissionReviewActionsApiRoute,
      ],
      redaction: {
        buyerDataIncluded: false,
        rawLedgerRowsIncluded: false,
        rawActorIdentityIncluded: false,
        privateReasonsIncluded: false,
        payoutAccountIncluded: false,
        taxDataIncluded: false,
        stripeIdsIncluded: false,
        partnerNotificationIncluded: false,
      },
      caveat:
        "This preparation view shows what must be reviewed before a payable partner statement or payout is created.",
    },
  ],
  reviewFlags: [
    {
      id: "review-flag-self-referral",
      severity: "high",
      title: "Possible self-referral",
      linkedLedgerIds: ["commission-ledger-self-referral-review"],
      reason: "Buyer and partner signals need private comparison before payout.",
      requiredAction: "Approve or reject the commission with a short review note before payout.",
    },
    {
      id: "review-flag-refund-window",
      severity: "medium",
      title: "Refund window still open",
      linkedLedgerIds: ["commission-ledger-launch-pass-fixture"],
      reason: "Approved commission remains pending while the refund/dispute window is still open.",
      requiredAction: "Hold payout until the refund and dispute window has elapsed.",
    },
  ],
  auditEvents: [
    {
      id: "affiliate-audit-referral-link-created",
      actor: "agent",
      action: "proposed_referral_link",
      targetId: "ref-link-launch-circle-waitlist",
      evidence: "Draft source-data fixture created from issue #89.",
      redaction: "No real partner email, tax, bank, IP, cookie, buyer, or Stripe customer data included.",
    },
    {
      id: "affiliate-audit-commission-reviewed",
      actor: "system",
      action: "flagged_commission_for_review",
      targetId: "commission-ledger-self-referral-review",
      evidence: "Fixture review rule matched self-referral pattern.",
      redaction: "Private comparison inputs are not present in public source data.",
    },
  ],
  writeBoundary:
    "Issue #109 can capture seeded referral clicks with idempotency, destination-route validation, hashed request evidence, and aggregate-only public reporting. Issue #111 can attach validated referral click evidence to sandbox checkout intents. Issue #113 can create review-only, non-payable commission ledger evidence from trusted checkout attribution. Issue #115 can apply owner-gated review, hold, or reversal actions to review-only ledger evidence with exact confirmation, idempotency, actor identity, stale-state checks, and audit correlation. Issue #193 exposes public-safe partner reports from aggregate click, checkout attribution, ledger, and review-action evidence. Issue #195 exposes read-only payout preparation rows and readiness checklists. Issue #273 lets verified owners record payout preparation evidence with exact confirmation, idempotency, revision checks, and public-safe redaction while keeping payout execution disabled. Issue #275 lets verified owners record fraud review evidence with exact confirmation, idempotency, review-flag checks, payout batch status checks, and public-safe redaction while keeping fraud enforcement and payout execution disabled. Issue #277 lets verified owners record partner notification readiness evidence with exact confirmation, idempotency, partner report checks, payout preparation status checks, fraud review status checks, and public-safe redaction while keeping partner sends, provider calls, and queue dispatch disabled. Issue #279 lets verified owners record partner notification send preflight evidence with exact confirmation, idempotency, notification readiness status checks, provider-send-disabled checks, and public-safe redaction while keeping partner sends, provider-send enablement, provider calls, send payloads, and queue dispatch disabled. Issue #281 lets verified owners record notification provider readiness evidence with exact confirmation, idempotency, send preflight status checks, provider-configuration-disabled checks, provider-secret-redaction checks, and public-safe redaction while keeping provider configuration, provider secrets, sender credentials, partner sends, provider calls, send payloads, and queue dispatch disabled. Issue #424 lets verified owners record fraud enforcement decisions with exact confirmation, idempotency, fraud review status checks, review-flag checks, and public-safe redaction while keeping payable commission writes, Stripe payout actions, tax collection, payout account storage, partner notification sends, provider-send configuration, provider secret storage, private partner auth, and direct agent review writes disabled. Issue #424 also exposes public-safe partner portal status pages so partners can inspect aggregate referral, commission, payout-readiness, fraud, and notification status without private payout, tax, buyer, provider, or raw-row data.",
  validation: [
    "/affiliates/source-data returns seeded programs, partners, links, attribution rules, commission rules, ledger fixtures, payout batches, read-only payout preparation rows, and review flags.",
    "/affiliates/source-data exposes public-safe partner report definitions and aggregate report rows without buyer, payout, tax, Stripe, raw click, raw checkout, or private actor data.",
    "/affiliates/source-data exposes read-only payout preparation and owner-confirmed payout preparation records without payout accounts, tax forms, Stripe payout identifiers, private actor identity, raw ledger rows, buyer data, or partner notification payloads.",
    "/affiliates/source-data exposes owner-reviewed affiliate fraud review records without fraud enforcement, buyer data, raw ledger/click/checkout rows, private fraud signals, actor identity, payout accounts, tax forms, Stripe payout identifiers, or partner notifications.",
    "/affiliates/source-data exposes owner-reviewed partner notification readiness records without recipient emails, message bodies, provider message IDs, queue rows, fraud enforcement, buyer data, raw rows, private fraud signals, actor identity, payout accounts, tax forms, Stripe payout identifiers, or partner sends.",
    "/affiliates/source-data exposes owner-reviewed partner notification send preflight records without recipient emails, message bodies, send payloads, provider message IDs, queue rows, provider-send enablement, fraud enforcement, buyer data, raw rows, private fraud signals, actor identity, payout accounts, tax forms, Stripe payout identifiers, or partner sends.",
    "/affiliates/source-data exposes owner-reviewed notification provider readiness records without provider configuration, provider secrets, sender credentials, recipient emails, message bodies, send payloads, provider message IDs, queue rows, provider calls, provider-send enablement, fraud enforcement, buyer data, raw rows, private fraud signals, actor identity, payout accounts, tax forms, Stripe payout identifiers, or partner sends.",
    "/affiliates/source-data exposes owner-confirmed fraud enforcement records without payable commission state, payout accounts, tax data, Stripe payout identifiers, partner notifications, buyer data, raw rows, private fraud signals, or actor identity.",
    "/affiliates/indie-launch-partners renders the affiliate/referral preview.",
    `${referralClickCaptureApiRoute} stores seeded referral click evidence with idempotency.`,
    "/api/commerce/checkout can attach eligible referral click IDs to sandbox checkout intents as public-safe attribution evidence.",
    `${affiliateCommissionLedgerApiRoute} can create review-only commission ledger evidence from trusted checkout attribution.`,
    `${affiliateCommissionReviewActionsApiRoute} can apply owner-gated review, hold, or reversal actions without creating payable commissions.`,
    "/api/admin/affiliates/payout-preparation-records can create owner-confirmed payout preparation records without creating payout state.",
    "/api/admin/affiliates/fraud-review-records can create owner-confirmed fraud review evidence without enforcing a fraud decision or creating payout state.",
    "/api/admin/affiliates/notification-readiness-records can create owner-confirmed partner notification readiness evidence without sending notifications, calling providers, creating queue rows, or creating payout state.",
    "/api/admin/affiliates/notification-send-preflights can create owner-confirmed partner notification send preflight evidence without enabling provider sends, creating send payloads, sending notifications, calling providers, creating queue rows, or creating payout state.",
    "/api/admin/affiliates/fraud-enforcement-records can create owner-confirmed fraud enforcement decisions without creating payable commission state, triggering payouts, or notifying partners.",
    "/affiliates/indie-launch-partners/partners/launch-circle renders a public-safe partner portal status page without payout account, tax, buyer, provider, or raw-row data.",
    "/agent-docs/source-data lists the affiliate/referral read contract for future MCP resources.",
  ],
};

export const affiliatePrograms = [affiliateProgram];

export function getAffiliateProgramBySlug(slug: string) {
  return affiliatePrograms.find((program) => program.slug === slug) ?? null;
}

export const affiliateReferralsSourceData = {
  id: "bumpgrade-affiliate-referrals-source-data",
  updatedAt: affiliateReferralsUpdatedAt,
  status: "partner-portal-status-ready",
  issue: 424,
  parentIssue: 19,
  generatedFrom: "src/lib/affiliate-referrals.ts",
  routes: [
    "/affiliates/source-data",
    referralClickCaptureApiRoute,
    "/api/commerce/checkout",
    affiliateCommissionLedgerApiRoute,
    affiliateCommissionReviewActionsApiRoute,
    "/api/admin/affiliates/payout-preparation-records",
    "/api/admin/affiliates/fraud-review-records",
    "/api/admin/affiliates/fraud-enforcement-records",
    "/api/admin/affiliates/notification-readiness-records",
    "/api/admin/affiliates/notification-send-preflights",
    "/api/admin/affiliates/notification-provider-readiness",
    "/admin/affiliates",
    ...affiliatePrograms.map((program) => program.previewRoute),
    ...affiliatePrograms.flatMap((program) =>
      program.partners.map((partner) => affiliatePartnerPortalRoute(program.slug, partner.portalSlug)),
    ),
  ],
  stableIds: [
    "affiliateProgramId",
    "affiliatePartnerId",
    "affiliatePartnerPortalId",
    "affiliatePartnerPortalRoute",
    "affiliatePartnerPortalStatus",
    "referralLinkId",
    "affiliatePartnerReportId",
    "payoutPreparationId",
    "referralClickId",
    "checkoutIntentId",
    "attributionRuleId",
    "commissionRuleId",
    "commissionLedgerId",
    "reviewOnlyCommissionLedgerId",
    "commissionReviewActionId",
    "payoutBatchId",
    "payoutPreparationRecordId",
    "payoutPreparationRecordStatus",
    "fraudReviewRecordId",
    "fraudReviewRecordStatus",
    "fraudEnforcementRecordId",
    "fraudEnforcementRecordStatus",
    "partnerNotificationReadinessRecordId",
    "partnerNotificationReadinessRecordStatus",
    "partnerNotificationSendPreflightRecordId",
    "partnerNotificationSendPreflightRecordStatus",
    "partnerNotificationProviderReadinessRecordId",
    "partnerNotificationProviderReadinessRecordStatus",
    "reviewFlagId",
    "auditEventId",
    "agentActionId",
  ],
  clickWrites: referralClickCaptureWriteContract,
  checkoutAttribution: checkoutReferralAttributionContract,
  commissionLedgerWrites: affiliateCommissionLedgerContract,
  commissionReviewActions: affiliateCommissionReviewActionsContract,
  partnerReportContract: affiliatePartnerReportContract,
  partnerPortalContract: affiliatePartnerPortalContract,
  payoutPreparationContract: affiliatePayoutPreparationContract,
  payoutPreparationRecordWrites: {
    id: "affiliate-payout-preparation-record-contract",
    status: "owner-affiliate-payout-preparation-records-ready",
    issue: 273,
    parentIssue: 19,
    apiRoute: "/api/admin/affiliates/payout-preparation-records",
    auth: "owner-session",
    tables: ["affiliate_payout_preparation_records"],
    confirmationText: "Record Bumpgrade affiliate payout preparation evidence",
    publicSafeFields: [
      "payoutPreparationRecordId",
      "affiliateProgramId",
      "payoutPreparationId",
      "payoutBatchId",
      "expectedPayoutBatchStatus",
      "expectedLedgerCounts",
      "expectedTotalCommissionCents",
      "ownerPayoutPreparationRecordCreated",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "payout account",
      "tax data",
      "Stripe payout IDs",
      "partner notification payloads",
      "buyer data",
      "raw ledger rows",
      "private fraud signals",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #273 records owner-confirmed affiliate payout preparation evidence after exact confirmation, idempotency, program revision checks, payout batch status checks, and payout-preparation evidence checks. It creates owner-visible preparation evidence only; it does not create payable commission state, Stripe payouts or transfers, payout accounts, tax records, partner notifications, fraud decisions, buyer data, raw ledger rows, or direct agent payout writes.",
  },
  fraudReviewRecordWrites: {
    id: "affiliate-fraud-review-record-contract",
    status: "owner-affiliate-fraud-review-records-ready",
    issue: 275,
    parentIssue: 19,
    apiRoute: "/api/admin/affiliates/fraud-review-records",
    auth: "owner-session",
    tables: ["affiliate_fraud_review_records"],
    confirmationText: "Record Bumpgrade affiliate fraud review evidence",
    publicSafeFields: [
      "fraudReviewRecordId",
      "affiliateProgramId",
      "reviewFlagId",
      "payoutPreparationId",
      "payoutBatchId",
      "reviewDisposition",
      "expectedPayoutBatchStatus",
      "expectedFlagSeverity",
      "expectedLinkedLedgerCount",
      "ownerFraudReviewRecordCreated",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "private fraud signals",
      "buyer data",
      "raw ledger rows",
      "raw click rows",
      "raw checkout rows",
      "payout account",
      "tax data",
      "Stripe payout IDs",
      "partner notification payloads",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #275 records owner-reviewed affiliate fraud review evidence after exact confirmation, idempotency, program revision checks, payout batch status checks, review-flag checks, and public-safe redaction. It creates owner-visible fraud review evidence only; it does not enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or accept direct public agent affiliate writes.",
  },
  fraudEnforcementRecordWrites: {
    id: "affiliate-fraud-enforcement-record-contract",
    status: "owner-affiliate-fraud-enforcement-records-ready",
    issue: 424,
    parentIssue: 424,
    apiRoute: "/api/admin/affiliates/fraud-enforcement-records",
    auth: "owner-session",
    tables: ["affiliate_fraud_review_records"],
    recordKind: "owner_fraud_enforcement_decision",
    confirmationText: "Record Bumpgrade affiliate fraud enforcement decision",
    publicSafeFields: [
      "fraudEnforcementRecordId",
      "affiliateProgramId",
      "reviewFlagId",
      "payoutPreparationId",
      "payoutBatchId",
      "enforcementDisposition",
      "expectedPayoutBatchStatus",
      "expectedFraudReviewRecordStatus",
      "expectedFlagSeverity",
      "expectedLinkedLedgerCount",
      "ownerFraudEnforcementRecordCreated",
      "fraudDecisionEnforced",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "private fraud signals",
      "buyer data",
      "raw ledger rows",
      "raw click rows",
      "raw checkout rows",
      "payout account",
      "tax data",
      "Stripe payout IDs",
      "partner notification payloads",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #424 records owner-confirmed affiliate fraud enforcement decisions after exact confirmation, idempotency, program revision checks, payout batch status checks, fraud review record status checks, review-flag checks, and public-safe redaction. It records owner-visible fraud enforcement only; it does not create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, send partner notifications, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or accept direct public agent affiliate writes.",
  },
  partnerNotificationReadinessRecordWrites: {
    id: "affiliate-partner-notification-readiness-record-contract",
    status: "owner-affiliate-partner-notification-readiness-records-ready",
    issue: 277,
    parentIssue: 19,
    apiRoute: "/api/admin/affiliates/notification-readiness-records",
    auth: "owner-session",
    tables: ["affiliate_partner_notification_readiness_records"],
    confirmationText: "Record Bumpgrade affiliate partner notification readiness evidence",
    publicSafeFields: [
      "partnerNotificationReadinessRecordId",
      "affiliateProgramId",
      "affiliatePartnerReportId",
      "affiliatePartnerId",
      "payoutPreparationId",
      "payoutBatchId",
      "reviewFlagId",
      "notificationReadinessDisposition",
      "expectedPartnerReportStatus",
      "expectedPayoutBatchStatus",
      "expectedPayoutPreparationRecordStatus",
      "expectedFraudReviewRecordStatus",
      "expectedReviewFlagSeverity",
      "expectedLinkedLedgerCount",
      "ownerPartnerNotificationReadinessRecordCreated",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "recipient email",
      "notification body",
      "provider message ID",
      "send queue rows",
      "private fraud signals",
      "buyer data",
      "raw ledger rows",
      "raw click rows",
      "raw checkout rows",
      "payout account",
      "tax data",
      "Stripe payout IDs",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #277 records owner-reviewed affiliate partner notification readiness evidence after exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, review-flag checks, and public-safe redaction. It creates owner-visible notification readiness evidence only; it does not send partner notifications, call providers, create queue rows, expose recipient emails, expose message bodies, expose provider message IDs, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or accept direct public agent affiliate writes.",
  },
  partnerNotificationSendPreflightRecordWrites: {
    id: "affiliate-partner-notification-send-preflight-record-contract",
    status: "owner-affiliate-partner-notification-send-preflights-ready",
    issue: 279,
    parentIssue: 19,
    apiRoute: "/api/admin/affiliates/notification-send-preflights",
    auth: "owner-session",
    tables: ["affiliate_partner_notification_send_preflight_records"],
    confirmationText: "Record Bumpgrade affiliate partner notification send preflight evidence",
    publicSafeFields: [
      "partnerNotificationSendPreflightRecordId",
      "affiliateProgramId",
      "affiliatePartnerReportId",
      "affiliatePartnerId",
      "payoutPreparationId",
      "payoutBatchId",
      "reviewFlagId",
      "notificationSendPreflightDisposition",
      "expectedPartnerReportStatus",
      "expectedPayoutBatchStatus",
      "expectedPayoutPreparationRecordStatus",
      "expectedFraudReviewRecordStatus",
      "expectedNotificationReadinessRecordStatus",
      "expectedReviewFlagSeverity",
      "expectedLinkedLedgerCount",
      "ownerPartnerNotificationSendPreflightRecordCreated",
      "notificationProviderSendEnabled",
      "sendPayloadIncluded",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "recipient email",
      "notification body",
      "send payload",
      "provider message ID",
      "send queue rows",
      "private fraud signals",
      "buyer data",
      "raw ledger rows",
      "raw click rows",
      "raw checkout rows",
      "payout account",
      "tax data",
      "Stripe payout IDs",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #279 records owner-reviewed affiliate partner notification send preflight evidence after exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, notification readiness record status checks, review-flag checks, provider-send-disabled checks, and public-safe redaction. It creates owner-visible send preflight evidence only; it does not send partner notifications, enable provider sends, call providers, create send payloads, create queue rows, expose recipient emails, expose message bodies, expose provider message IDs, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or accept direct public agent affiliate writes.",
  },
  partnerNotificationProviderReadinessRecordWrites: {
    id: "affiliate-partner-notification-provider-readiness-record-contract",
    status: "owner-affiliate-partner-notification-provider-readiness-records-ready",
    issue: 281,
    parentIssue: 19,
    apiRoute: "/api/admin/affiliates/notification-provider-readiness",
    auth: "owner-session",
    tables: ["affiliate_partner_notification_provider_readiness_records"],
    confirmationText: "Record Bumpgrade affiliate partner notification provider readiness evidence",
    publicSafeFields: [
      "partnerNotificationProviderReadinessRecordId",
      "affiliateProgramId",
      "affiliatePartnerReportId",
      "affiliatePartnerId",
      "payoutPreparationId",
      "payoutBatchId",
      "reviewFlagId",
      "notificationProviderReadinessDisposition",
      "expectedPartnerReportStatus",
      "expectedPayoutBatchStatus",
      "expectedPayoutPreparationRecordStatus",
      "expectedFraudReviewRecordStatus",
      "expectedNotificationReadinessRecordStatus",
      "expectedNotificationSendPreflightRecordStatus",
      "expectedReviewFlagSeverity",
      "expectedLinkedLedgerCount",
      "ownerPartnerNotificationProviderReadinessRecordCreated",
      "notificationProviderConfigured",
      "providerSecretIncluded",
      "senderCredentialIncluded",
      "notificationProviderSendEnabled",
      "sendPayloadIncluded",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "notification provider configuration",
      "provider secret",
      "sender credential",
      "recipient email",
      "notification body",
      "send payload",
      "provider message ID",
      "send queue rows",
      "private fraud signals",
      "buyer data",
      "raw ledger rows",
      "raw click rows",
      "raw checkout rows",
      "payout account",
      "tax data",
      "Stripe payout IDs",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #281 records owner-reviewed affiliate partner notification provider readiness evidence after exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, notification readiness record status checks, send preflight record status checks, review-flag checks, provider-configuration-disabled checks, provider-secret-redaction checks, sender-credential-redaction checks, provider-send-disabled checks, and public-safe redaction. It creates owner-visible provider readiness evidence only; it does not configure notification providers, store provider secrets, store sender credentials, send partner notifications, enable provider sends, call providers, create send payloads, create queue rows, expose recipient emails, expose message bodies, expose provider message IDs, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or accept direct public agent affiliate writes.",
  },
  writeBoundary: affiliateProgram.writeBoundary,
  programs: affiliatePrograms,
  caveat:
    "This contract proves affiliate and referral read/preview semantics, privacy-safe seeded click capture, checkout attribution evidence, review-only commission ledger evidence, owner-gated review/reversal actions, public-safe partner reports, public-safe partner portal status pages, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review evidence, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness evidence, owner-reviewed partner notification send preflight evidence, and owner-reviewed notification provider readiness evidence. Public source-data may expose aggregate click, checkout attribution, commission ledger, owner action, partner report, partner portal, payout preparation, payout preparation record, fraud review record, fraud enforcement record, notification readiness record, notification send preflight record, and notification provider readiness record counts, but it does not expose raw rows, actor identity, private review reasons, private fraud signals, recipient emails, message bodies, send payloads, provider configuration, provider secrets, sender credentials, provider message IDs, send queue rows, assign cookies, finalize buyer attribution, create payable commissions, store payout accounts, collect tax forms, trigger Stripe payouts, send partner notifications, enable provider sends, or provide direct public agent write APIs.",
};
