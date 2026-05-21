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

export const affiliateReferralsUpdatedAt = "2026-05-21";

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
  revisionId: "affiliate-program-revision-indie-launch-2026-05-20-payout-prep",
  summary:
    "An affiliate and referral scaffold for partner links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal actions, public-safe partner reports, read-only payout preparation, and audit-safe agent access before payable commissions exist.",
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
      caveat: "Percentage is fixture data, not a live payable promise or published affiliate term.",
    },
    {
      id: "commission-rule-checklist-bump-10",
      kind: "percentage",
      title: "Checklist order-bump commission",
      appliesToOfferIds: ["offer-bump-launch-checklist"],
      rateBps: 1000,
      holdDays: 14,
      currency: "USD",
      caveat: "Order-bump commission is draft until checkout, refund, and tax behavior are finalized.",
    },
    {
      id: "commission-rule-refund-holdback",
      kind: "holdback",
      title: "Refund and dispute holdback",
      appliesToOfferIds: ["offer-primary-sandbox-launch-pass", "offer-bump-launch-checklist"],
      amountCents: 0,
      holdDays: 30,
      currency: "USD",
      caveat: "Holdback records are fixture controls only; payout-impacting holds require owner confirmation later.",
    },
  ],
  partners: [
    {
      id: "affiliate-partner-launch-circle",
      displayName: "Launch Circle partner",
      status: "approved",
      publicProfile: "Newsletter partner with an aligned creator and indie-launch audience.",
      approvedProgramIds: ["affiliate-program-indie-launch-partners"],
      referralLinkIds: ["ref-link-launch-circle-waitlist"],
      privateDataExcluded: ["email address", "tax form", "bank account", "payout account", "private notes"],
    },
    {
      id: "affiliate-partner-template-studio",
      displayName: "Template Studio partner",
      status: "review",
      publicProfile: "Template seller pending affiliate approval before public links or payout eligibility.",
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
      title: "Launch Circle public-safe performance report",
      status: "public_safe_report_ready",
      issue: 193,
      reportingWindow: {
        id: "affiliate-report-window-public-safe-all-time",
        label: "All-time public-safe aggregate",
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
          "Partner payout account, tax form, and private notification data are not in public source data.",
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
      caveat: "Report totals are public-safe evidence for product semantics, not a payable statement or partner portal.",
    },
    {
      id: "affiliate-partner-report-template-studio",
      partnerId: "affiliate-partner-template-studio",
      title: "Template Studio public-safe performance report",
      status: "public_safe_report_ready",
      issue: 193,
      reportingWindow: {
        id: "affiliate-report-window-public-safe-all-time",
        label: "All-time public-safe aggregate",
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
      caveat: "Report totals are public-safe evidence for product semantics, not a payable statement or partner portal.",
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
      reason: "Fixture paid checkout attributed to the Launch Circle partner inside the 30-day window.",
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
      reason: "Fixture self-referral pattern requires owner review before payout eligibility.",
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
      reason: "Fixture refund reversed commission before payout batch creation.",
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
        "Confirm partner payout account outside public source data.",
      ],
      readinessChecklist: [
        {
          id: "payout-prep-check-owner-reviewed",
          title: "Owner review evidence captured",
          status: "passed",
          evidence: "Issue #115 owner review/reversal actions can mark, hold, or reverse review-only ledger evidence.",
        },
        {
          id: "payout-prep-check-refund-window",
          title: "Refund and reversal window cleared",
          status: "blocked",
          evidence: "Fixture review flag keeps refund-window evidence open before any payout preparation can become payable.",
        },
        {
          id: "payout-prep-check-private-payout-data",
          title: "Private payout and tax data available",
          status: "external_required",
          evidence: "Partner payout account and tax form checks are intentionally excluded from public source data.",
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
        "This preparation row is a public-safe readiness checklist, not a payable batch, partner statement, tax workflow, Stripe payout, transfer, or notification.",
    },
  ],
  reviewFlags: [
    {
      id: "review-flag-self-referral",
      severity: "high",
      title: "Possible self-referral",
      linkedLedgerIds: ["commission-ledger-self-referral-review"],
      reason: "Fixture buyer and partner signals would need private, redacted comparison before payout.",
      requiredAction: "Owner must approve or reject the commission with an audit note before payout.",
    },
    {
      id: "review-flag-refund-window",
      severity: "medium",
      title: "Refund window still open",
      linkedLedgerIds: ["commission-ledger-launch-pass-fixture"],
      reason: "Approved commission remains pending while the refund/dispute window is still open.",
      requiredAction: "Hold payout until webhook evidence proves the window has elapsed.",
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
    "Issue #109 can capture seeded referral clicks with idempotency, destination-route validation, hashed request evidence, and aggregate-only public reporting. Issue #111 can attach validated referral click evidence to sandbox checkout intents. Issue #113 can create review-only, non-payable commission ledger evidence from trusted checkout attribution. Issue #115 can apply owner-gated review, hold, or reversal actions to review-only ledger evidence with exact confirmation, idempotency, actor identity, stale-state checks, and audit correlation. Issue #193 exposes public-safe partner reports from aggregate click, checkout attribution, ledger, and review-action evidence. Issue #195 exposes read-only payout preparation rows and readiness checklists. Issue #273 lets verified owners record payout preparation evidence with exact confirmation, idempotency, revision checks, and public-safe redaction while keeping payout execution disabled. Cookie assignment, buyer attribution finalization, payable commission writes, fraud enforcement, Stripe payout actions, tax collection, payout account storage, partner notifications, private partner portals, and direct agent review writes require future confirmed-write APIs.",
  validation: [
    "/affiliates/source-data returns seeded programs, partners, links, attribution rules, commission rules, ledger fixtures, payout batches, read-only payout preparation rows, and review flags.",
    "/affiliates/source-data exposes public-safe partner report definitions and aggregate report rows without buyer, payout, tax, Stripe, raw click, raw checkout, or private actor data.",
    "/affiliates/source-data exposes read-only payout preparation and owner-confirmed payout preparation records without payout accounts, tax forms, Stripe payout identifiers, private actor identity, raw ledger rows, buyer data, or partner notification payloads.",
    "/affiliates/indie-launch-partners renders the affiliate/referral preview.",
    `${referralClickCaptureApiRoute} stores seeded referral click evidence with idempotency.`,
    "/api/commerce/checkout can attach eligible referral click IDs to sandbox checkout intents as public-safe attribution evidence.",
    `${affiliateCommissionLedgerApiRoute} can create review-only commission ledger evidence from trusted checkout attribution.`,
    `${affiliateCommissionReviewActionsApiRoute} can apply owner-gated review, hold, or reversal actions without creating payable commissions.`,
    "/api/admin/affiliates/payout-preparation-records can create owner-confirmed payout preparation records without creating payout state.",
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
  status: "owner-payout-preparation-records-ready",
  issue: 273,
  parentIssue: 19,
  generatedFrom: "src/lib/affiliate-referrals.ts",
  routes: [
    "/affiliates/source-data",
    referralClickCaptureApiRoute,
    "/api/commerce/checkout",
    affiliateCommissionLedgerApiRoute,
    affiliateCommissionReviewActionsApiRoute,
    "/api/admin/affiliates/payout-preparation-records",
    "/admin/affiliates",
    ...affiliatePrograms.map((program) => program.previewRoute),
  ],
  stableIds: [
    "affiliateProgramId",
    "affiliatePartnerId",
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
    "reviewFlagId",
    "auditEventId",
    "agentActionId",
  ],
  clickWrites: referralClickCaptureWriteContract,
  checkoutAttribution: checkoutReferralAttributionContract,
  commissionLedgerWrites: affiliateCommissionLedgerContract,
  commissionReviewActions: affiliateCommissionReviewActionsContract,
  partnerReportContract: affiliatePartnerReportContract,
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
  writeBoundary: affiliateProgram.writeBoundary,
  programs: affiliatePrograms,
  caveat:
    "This contract proves affiliate and referral read/preview semantics, privacy-safe seeded click capture, checkout attribution evidence, review-only commission ledger evidence, owner-gated review/reversal actions, public-safe partner reports, read-only payout preparation, and owner-confirmed payout preparation records. Public source-data may expose aggregate click, checkout attribution, commission ledger, owner action, partner report, payout preparation, and payout preparation record counts, but it does not expose raw rows, actor identity, private review reasons, assign cookies, finalize buyer attribution, create payable commissions, store payout accounts, collect tax forms, trigger Stripe payouts, enforce fraud decisions, notify partners, or provide direct confirmed-write agent APIs.",
};
