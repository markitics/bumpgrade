import { analyticsConversionReportContract } from "@/lib/analytics-conversion-report";
import {
  analyticsEventCaptureApiRoute,
  analyticsFunnelPageViewBeaconContract,
  analyticsEventCaptureWriteContract,
} from "@/lib/analytics-events";
import {
  analyticsExperimentAssignmentApiRoute,
  analyticsExperimentAssignmentWriteContract,
} from "@/lib/experiment-assignments";

export type AnalyticsStatus = "draft";
export type AnalyticsEventKind =
  | "page_view"
  | "opt_in"
  | "checkout_start"
  | "purchase"
  | "order_bump_accept"
  | "upsell_accept"
  | "refund"
  | "subscription_cancel"
  | "product_access_grant"
  | "sequence_started";

export type MetricFormat = "count" | "rate" | "currency";
export type ExperimentStatus = "draft" | "assignment_ready";

export type AnalyticsEventDefinition = {
  id: string;
  kind: AnalyticsEventKind;
  title: string;
  sourceRoute: string;
  linkedFeatureIds: string[];
  publicProperties: string[];
  privateDataExcluded: string[];
  aggregation: string;
};

export type MetricDefinition = {
  id: string;
  title: string;
  format: MetricFormat;
  formula: string;
  sourceEventIds: string[];
  caveat: string;
};

export type FunnelStepMetric = {
  id: string;
  stepId: string;
  label: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  sourceEventIds: string[];
};

export type ExperimentVariant = {
  id: string;
  label: string;
  trafficWeight: number;
  hypothesis: string;
  linkedBlockId: string;
};

export type ExperimentDefinition = {
  id: string;
  title: string;
  status: ExperimentStatus;
  linkedRoute: string;
  assignmentKey: string;
  assignmentRule: string;
  primaryMetricId: string;
  guardrailMetricIds: string[];
  variants: ExperimentVariant[];
  writeBoundary: string;
};

export type AnalyticsDashboard = {
  id: string;
  slug: string;
  title: string;
  status: AnalyticsStatus;
  issue: number;
  parentIssue: number;
  sourceDataRoute: string;
  previewRoute: string;
  linkedFunnelRoute: string;
  linkedOfferRoute: string;
  linkedAudienceRoute: string;
  linkedProductRoute: string;
  revisionId: string;
  summary: string;
  events: AnalyticsEventDefinition[];
  metrics: MetricDefinition[];
  funnelStepMetrics: FunnelStepMetric[];
  experiments: ExperimentDefinition[];
  writeBoundary: string;
  validation: string[];
};

export const analyticsExperimentsUpdatedAt = "2026-05-21";

export const analyticsDashboard: AnalyticsDashboard = {
  id: "analytics-dashboard-indie-launch",
  slug: "indie-launch-dashboard",
  title: "Indie launch analytics and experiments",
  status: "draft",
  issue: 129,
  parentIssue: 18,
  sourceDataRoute: "/analytics/source-data",
  previewRoute: "/analytics/indie-launch-dashboard",
  linkedFunnelRoute: "/funnels/indie-launch-sandbox",
  linkedOfferRoute: "/offers/indie-launch-stack",
  linkedAudienceRoute: "/audience/indie-launch-waitlist",
  linkedProductRoute: "/products/indie-launch-library",
  revisionId: "analytics-experiment-revision-indie-launch-2026-05-21-queue-producer-readiness",
  summary:
    "A privacy-safe analytics and experiment dashboard for time-windowed aggregate funnel conversion reporting, exportable aggregate report snapshots, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold and anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflights, owner-reviewed provider/domain readiness, owner-reviewed content/consent readiness, owner-reviewed send-payload readiness, owner-reviewed queue-producer readiness, checkout revenue, audience opt-ins, seeded live event capture, dashboard-visible source attribution, browser-side funnel page-view beacons with deterministic variant and source attribution evidence, deterministic A/B assignment, and owner-confirmed experiment decision evidence before cookies, alert delivery, traffic routing, Queue producers, queue messages, recipient payloads, provider sends, or automated winners exist.",
  events: [
    {
      id: "event-funnel-page-view",
      kind: "page_view",
      title: "Funnel page viewed",
      sourceRoute: "/funnels/indie-launch-sandbox",
      linkedFeatureIds: ["feature-funnel-builder", "feature-analytics-testing"],
      publicProperties: [
        "route",
        "funnelId",
        "stepId",
        "variantId",
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "utmContent",
        "utmTerm",
        "referrerHost",
      ],
      privateDataExcluded: [
        "IP address",
        "user agent",
        "cookie id",
        "contact id",
        "full referrer",
        "raw URL query string",
        "raw UTM payload",
      ],
      aggregation:
        "Count by route, step, variant, normalized UTM fields, and coarse referrer host after browser-side session idempotency plus server-side bot filtering.",
    },
    {
      id: "event-audience-opt-in-created",
      kind: "opt_in",
      title: "Opt-in created",
      sourceRoute: "/audience/indie-launch-waitlist",
      linkedFeatureIds: ["feature-email-automation-crm", "feature-analytics-testing"],
      publicProperties: ["formId", "segmentId", "leadMagnetId", "consentVersion"],
      privateDataExcluded: ["Email address", "name", "IP address", "consent timestamp", "subscriber id"],
      aggregation: "Count consenting opt-ins by form, segment, and lead magnet.",
    },
    {
      id: "event-checkout-started",
      kind: "checkout_start",
      title: "Checkout started",
      sourceRoute: "/api/commerce/checkout",
      linkedFeatureIds: ["feature-checkout-offers", "feature-stripe-commerce", "feature-analytics-testing"],
      publicProperties: ["checkoutKind", "productId", "priceId", "currency"],
      privateDataExcluded: ["Buyer email", "Stripe Checkout Session id", "payment intent id", "customer id"],
      aggregation: "Count checkout attempts by product, price, and checkout kind.",
    },
    {
      id: "event-purchase-completed",
      kind: "purchase",
      title: "Purchase completed",
      sourceRoute: "/api/stripe/webhook",
      linkedFeatureIds: ["feature-checkout-offers", "feature-products-access", "feature-analytics-testing"],
      publicProperties: ["productId", "priceId", "amountCents", "currency", "livemode"],
      privateDataExcluded: ["Stripe event id", "checkout session id", "buyer email", "customer id", "raw webhook payload"],
      aggregation: "Sum revenue and count paid checkouts from trusted webhook evidence.",
    },
    {
      id: "event-upsell-accepted",
      kind: "upsell_accept",
      title: "Upsell accepted",
      sourceRoute: "/offers/indie-launch-stack",
      linkedFeatureIds: ["feature-checkout-offers", "feature-analytics-testing"],
      publicProperties: ["offerId", "pathId", "expiresAfterMinutes"],
      privateDataExcluded: ["Buyer identity", "payment method", "raw session state"],
      aggregation: "Count accepted upsells by offer path after confirmed billing evidence exists.",
    },
    {
      id: "event-product-access-granted",
      kind: "product_access_grant",
      title: "Product access granted",
      sourceRoute: "/products/indie-launch-library",
      linkedFeatureIds: ["feature-products-access", "feature-analytics-testing"],
      publicProperties: ["productId", "accessRuleId", "entitlementTemplateId"],
      privateDataExcluded: ["Entitlement row id", "buyer id", "R2 object key", "signed URL"],
      aggregation: "Count access grants by product and access rule after entitlement writes exist.",
    },
  ],
  metrics: [
    {
      id: "metric-funnel-opt-in-rate",
      title: "Funnel opt-in rate",
      format: "rate",
      formula: "event-audience-opt-in-created / event-funnel-page-view for the opt-in step",
      sourceEventIds: ["event-funnel-page-view", "event-audience-opt-in-created"],
      caveat: "Aggregate report values now come from captured test events when available; sparse samples still require caveats.",
    },
    {
      id: "metric-checkout-start-rate",
      title: "Checkout start rate",
      format: "rate",
      formula: "event-checkout-started / sales-page event-funnel-page-view",
      sourceEventIds: ["event-funnel-page-view", "event-checkout-started"],
      caveat: "Checkout starts can be reported from captured test events; production claims still require bot filtering and attribution review.",
    },
    {
      id: "metric-gross-revenue",
      title: "Gross revenue",
      format: "currency",
      formula: "sum event-purchase-completed amountCents by currency",
      sourceEventIds: ["event-purchase-completed"],
      caveat: "Refunds, disputes, fees, and taxes require later billing reports before net revenue claims.",
    },
    {
      id: "metric-upsell-accept-rate",
      title: "Upsell accept rate",
      format: "rate",
      formula: "event-upsell-accepted / eligible post-purchase offer views",
      sourceEventIds: ["event-upsell-accepted"],
      caveat: "One-click upsell charging is not live, so this metric remains a draft definition.",
    },
  ],
  funnelStepMetrics: [
    {
      id: "funnel-metric-waitlist-opt-in",
      stepId: "funnel-step-indie-launch-opt-in",
      label: "Warm list opt-in",
      visitors: 1000,
      conversions: 180,
      conversionRate: 0.18,
      sourceEventIds: ["event-funnel-page-view", "event-audience-opt-in-created"],
    },
    {
      id: "funnel-metric-sales-to-checkout",
      stepId: "funnel-step-indie-launch-sales",
      label: "Sales page to checkout",
      visitors: 620,
      conversions: 74,
      conversionRate: 0.119,
      sourceEventIds: ["event-funnel-page-view", "event-checkout-started"],
    },
    {
      id: "funnel-metric-checkout-to-purchase",
      stepId: "checkout-stack-indie-launch-sandbox",
      label: "Checkout start to purchase",
      visitors: 74,
      conversions: 51,
      conversionRate: 0.689,
      sourceEventIds: ["event-checkout-started", "event-purchase-completed"],
    },
  ],
  experiments: [
    {
      id: "experiment-opt-in-hero-promise",
      title: "Opt-in hero promise test",
      status: "assignment_ready",
      linkedRoute: "/funnels/indie-launch-sandbox#warm-list-opt-in",
      assignmentKey: "anonymousStableVisitorKey",
      assignmentRule:
        "Hash experiment id plus a caller-provided anonymous assignment key, then map 0-49 to A and 50-99 to B.",
      primaryMetricId: "metric-funnel-opt-in-rate",
      guardrailMetricIds: ["metric-checkout-start-rate"],
      variants: [
        {
          id: "variant-opt-in-outcome-first",
          label: "Outcome-first promise",
          trafficWeight: 50,
          hypothesis: "A concrete launch outcome will increase checklist opt-ins.",
          linkedBlockId: "block-opt-in-hero",
        },
        {
          id: "variant-opt-in-speed-first",
          label: "Speed-first promise",
          trafficWeight: 50,
          hypothesis: "A faster setup promise will increase checklist opt-ins without reducing checkout starts.",
          linkedBlockId: "block-opt-in-hero",
        },
      ],
      writeBoundary:
        "Issue #107 can assign this seeded experiment deterministically through /api/analytics/assignments. Issues #121, #123, and #125 can capture page-view events with the assigned variant ID and normalized source attribution when available. Issue #261 can record owner-confirmed decision evidence with aggregate counts and sample-size caveats, but cookie creation, traffic routing, automated winner execution, and direct public agent experiment writes require future confirmed-write APIs.",
    },
  ],
  writeBoundary:
    "Issues #105, #107, #119, #121, #123, #125, #127, #129, #261, #263, #265, #267, #269, #271, #284, #286, #288, #290, and #292 can capture seeded analytics events, assign seeded experiment variants, report aggregate funnel conversion rows, render dashboard-visible aggregate source attribution rows, filter aggregate source and conversion summaries by fixed time windows, record browser-side seeded funnel page-view beacons with deterministic variant evidence, normalized source attribution, session-scoped idempotency, source-route validation, bot/preview suppression, hashed request evidence, aggregate-only public reporting, record owner-confirmed experiment decision evidence, expose aggregate report export metadata, expose owner-reviewed cohort comparison evidence with sample-size caveats, expose owner-reviewed alert threshold/anomaly-review evidence, expose owner-reviewed notification delivery readiness evidence, record owner-confirmed notification inbox evidence, record owner-confirmed notification dispatch preflight evidence, record owner-reviewed provider/domain readiness evidence, record owner-reviewed content/consent readiness evidence, record owner-reviewed send-payload readiness evidence, and record owner-reviewed queue-producer readiness evidence. Cookie creation, contact-level analytics, raw campaign/referrer reporting, arbitrary custom events, raw analytics exports, automated alert sends, owner email sends, queue dispatch, Queue producers, queue messages, queue payload bodies, recipient payloads, personalized bodies, raw payload bodies, provider sends, body templates, unsubscribe URLs, provider configuration, provider secrets, private DNS credentials, provider message IDs, customer alerts, experiment traffic routing, automated winners, and revenue claims require actor identity, privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.",
  validation: [
    "/analytics/source-data returns seeded events, metrics, aggregate funnel conversion report rows, and experiment definitions.",
    "/analytics/indie-launch-dashboard renders the analytics and experiment preview.",
    "/analytics/source-data supports fixed all-time, 24-hour, 7-day, and 30-day aggregate windows.",
    "/analytics/indie-launch-dashboard renders fixed-window source and conversion controls.",
    "/analytics/indie-launch-dashboard renders aggregate source attribution rows when captured source evidence exists.",
    `${analyticsEventCaptureApiRoute} stores seeded analytics event capture evidence with idempotency.`,
    `${analyticsFunnelPageViewBeaconContract.sourceRoute} emits a session-idempotent seeded page-view beacon through ${analyticsFunnelPageViewBeaconContract.apiRoute} with deterministic variant evidence from ${analyticsFunnelPageViewBeaconContract.assignmentApiRoute} and normalized source attribution when URL/referrer evidence is present.`,
    `${analyticsExperimentAssignmentApiRoute} stores seeded experiment assignment evidence with idempotency.`,
    "/api/admin/analytics/experiment-decisions stores owner-confirmed experiment decision evidence with aggregate counts, sample-size caveats, idempotency, and redaction.",
    "/api/admin/analytics/notification-inbox-records stores owner-confirmed analytics notification inbox records with readiness checks, fixed-window evidence, idempotency, and redaction.",
    "/api/admin/analytics/notification-dispatch-preflights stores owner-confirmed analytics notification dispatch preflights with inbox-record checks, fixed-window evidence, idempotency, and redaction.",
    "/api/admin/analytics/notification-provider-domain-readiness stores owner-reviewed analytics notification provider/domain readiness records with dispatch-preflight checks, fixed-window evidence, idempotency, and redaction.",
    "/api/admin/analytics/notification-content-consent-readiness stores owner-reviewed analytics notification content/consent readiness records with provider/domain readiness checks, fixed-window evidence, idempotency, and redaction.",
    "/api/admin/analytics/notification-send-payload-readiness stores owner-reviewed analytics notification send-payload readiness records with content/consent readiness checks, fixed-window evidence, idempotency, and redaction.",
    "/api/admin/analytics/notification-queue-producer-readiness stores owner-reviewed analytics notification queue-producer readiness records with send-payload readiness checks, fixed-window evidence, idempotency, and redaction.",
    "/analytics/source-data exposes aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox record evidence, owner-confirmed dispatch preflight evidence, owner-reviewed provider/domain readiness evidence, owner-reviewed content/consent readiness evidence, owner-reviewed send-payload readiness evidence, and owner-reviewed queue-producer readiness evidence without raw event rows, raw assignment rows, visitor keys, contact analytics, recipient identity, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, provider message IDs, provider secrets, private DNS credentials, Queue producer execution, queue messages, queue payload bodies, or queue payloads.",
    `${analyticsConversionReportContract.sourceDataRoute} reports captured test-event conversion rows without exposing raw events.`,
    "/agent-docs/source-data lists the analytics read contract for future MCP resources.",
  ],
};

export const analyticsDashboards = [analyticsDashboard];

export function getAnalyticsDashboardBySlug(slug: string) {
  return analyticsDashboards.find((dashboard) => dashboard.slug === slug) ?? null;
}

export const analyticsExperimentsSourceData = {
  id: "bumpgrade-analytics-experiments-source-data",
  updatedAt: analyticsExperimentsUpdatedAt,
  status: "time-windowed-dashboard-ready",
  issue: 129,
  parentIssue: 18,
  generatedFrom: "src/lib/analytics-experiments.ts",
  routes: [
    "/analytics/source-data",
    analyticsEventCaptureApiRoute,
    analyticsExperimentAssignmentApiRoute,
    "/api/admin/analytics/experiment-decisions",
    "/api/admin/analytics/notification-inbox-records",
    "/api/admin/analytics/notification-dispatch-preflights",
    "/api/admin/analytics/notification-provider-domain-readiness",
    "/api/admin/analytics/notification-content-consent-readiness",
    "/api/admin/analytics/notification-send-payload-readiness",
    "/api/admin/analytics/notification-queue-producer-readiness",
    "/admin/analytics",
    analyticsFunnelPageViewBeaconContract.sourceRoute,
    ...analyticsDashboards.map((dashboard) => dashboard.previewRoute),
  ],
  stableIds: [
    "analyticsEventId",
    "analyticsEventIngestionId",
    "analyticsEventVariantAggregateId",
    "analyticsEventSourceAggregateId",
    "analyticsTimeWindow",
    "experimentAssignmentId",
    "analyticsExperimentDecisionId",
    "analyticsExperimentDecisionKind",
    "analyticsReportExportId",
    "analyticsReportExportSectionId",
    "analyticsCohortFixtureId",
    "analyticsCohortComparisonId",
    "analyticsCohortReviewId",
    "analyticsCohortReviewStatus",
    "analyticsAlertThresholdId",
    "analyticsAnomalyReviewId",
    "analyticsAnomalyReviewStatus",
    "analyticsNotificationReadinessId",
    "analyticsNotificationChannelId",
    "analyticsNotificationReadinessStatus",
    "analyticsNotificationInboxRecordId",
    "analyticsNotificationInboxStatus",
    "analyticsNotificationDispatchPreflightId",
    "analyticsNotificationDispatchPreflightStatus",
    "analyticsNotificationProviderDomainReadinessId",
    "analyticsNotificationProviderDomainReadinessStatus",
    "analyticsNotificationProviderDomainReadinessDisposition",
    "analyticsNotificationContentConsentReadinessId",
    "analyticsNotificationContentConsentReadinessStatus",
    "analyticsNotificationContentConsentReadinessDisposition",
    "analyticsNotificationSendPayloadReadinessId",
    "analyticsNotificationSendPayloadReadinessStatus",
    "analyticsNotificationSendPayloadReadinessDisposition",
    "analyticsNotificationQueueProducerReadinessId",
    "analyticsNotificationQueueProducerReadinessStatus",
    "analyticsNotificationQueueProducerReadinessDisposition",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "referrerHost",
    "analyticsFunnelConversionReportId",
    "metricId",
    "funnelStepMetricId",
    "experimentId",
    "variantId",
    "assignmentRuleId",
    "reportId",
    "agentActionId",
  ],
  eventWrites: analyticsEventCaptureWriteContract,
  pageViewBeacon: analyticsFunnelPageViewBeaconContract,
  assignmentWrites: analyticsExperimentAssignmentWriteContract,
  experimentDecisionWrites: {
    id: "analytics-experiment-decision-contract",
    status: "owner-experiment-decision-evidence-ready",
    issue: 261,
    parentIssue: 18,
    apiRoute: "/api/admin/analytics/experiment-decisions",
    auth: "owner-session",
    tables: ["analytics_experiment_decisions"],
    publicSafeFields: [
      "analyticsExperimentDecisionId",
      "experimentId",
      "decisionKind",
      "selectedVariantId",
      "timeWindowKey",
      "expectedAssignmentCount",
      "expectedVariantCounts",
      "expectedConversionSampleSize",
      "sampleSizeCaveatAcknowledged",
      "trafficRoutingEnabled",
      "automatedWinnerEnabled",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "metadata_json",
      "raw analytics event rows",
      "raw experiment assignment rows",
      "raw visitor keys",
    ],
    writeBoundary:
      "Issue #261 can record owner-confirmed experiment decision evidence after exact confirmation, idempotency, dashboard revision checks, experiment status checks, aggregate count checks, and sample-size caveat acknowledgement. It does not route traffic, assign cookies, select automated winners, expose raw event rows, expose raw assignment rows, expose contact analytics, or make revenue claims.",
  },
  notificationInboxWrites: {
    id: "analytics-notification-inbox-contract",
    status: "owner-analytics-notification-inbox-records-ready",
    issue: 271,
    parentIssue: 18,
    apiRoute: "/api/admin/analytics/notification-inbox-records",
    auth: "owner-session",
    tables: ["analytics_notification_inbox_records"],
    confirmationText: "Record Bumpgrade analytics notification inbox evidence",
    publicSafeFields: [
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsTimeWindow",
      "expectedReadinessStatus",
      "expectedOwnerReviewStatus",
      "expectedAlertThresholdCount",
      "expectedConversionSampleSize",
      "sampleSizeCaveatAcknowledged",
      "adminInboxRecordCreated",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "notification recipient",
      "email body",
      "queue payload",
      "raw analytics event rows",
      "raw experiment assignment rows",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #271 can record owner-confirmed analytics notification inbox evidence after exact confirmation, idempotency, dashboard revision checks, readiness status checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It creates owner-visible inbox records only; it does not send email, create customer alerts, dispatch queues, expose recipients, expose email bodies, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  },
  notificationDispatchPreflightWrites: {
    id: "analytics-notification-dispatch-preflight-contract",
    status: "owner-analytics-notification-dispatch-preflights-ready",
    issue: 284,
    parentIssue: 18,
    apiRoute: "/api/admin/analytics/notification-dispatch-preflights",
    auth: "owner-session",
    tables: ["analytics_notification_dispatch_preflight_records"],
    confirmationText: "Record Bumpgrade analytics notification dispatch preflight evidence",
    publicSafeFields: [
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsTimeWindow",
      "notificationDispatchPreflightDisposition",
      "expectedNotificationInboxStatus",
      "expectedReadinessStatus",
      "expectedOwnerReviewStatus",
      "expectedAlertThresholdCount",
      "expectedConversionSampleSize",
      "sampleSizeCaveatAcknowledged",
      "ownerDispatchPreflightRecorded",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "notification recipient",
      "email body",
      "provider message id",
      "queue payload",
      "raw analytics event rows",
      "raw experiment assignment rows",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #284 can record owner-confirmed analytics notification dispatch preflight evidence after exact confirmation, idempotency, dashboard revision checks, readiness status checks, notification inbox record checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible dispatch preflight evidence only; it does not send email, call providers, create customer alerts, dispatch queues, expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  },
  notificationProviderDomainReadinessWrites: {
    id: "analytics-notification-provider-domain-readiness-contract",
    status: "owner-analytics-notification-provider-domain-readiness-records-ready",
    issue: 286,
    parentIssue: 18,
    apiRoute: "/api/admin/analytics/notification-provider-domain-readiness",
    auth: "owner-session",
    tables: ["analytics_notification_provider_domain_readiness_records"],
    confirmationText: "Record Bumpgrade analytics notification provider/domain readiness evidence",
    publicSafeFields: [
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsTimeWindow",
      "notificationProviderDomainReadinessDisposition",
      "expectedNotificationDispatchPreflightStatus",
      "expectedNotificationInboxStatus",
      "expectedReadinessStatus",
      "expectedOwnerReviewStatus",
      "expectedAlertThresholdCount",
      "expectedConversionSampleSize",
      "sampleSizeCaveatAcknowledged",
      "ownerProviderDomainReadinessRecorded",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "provider secret",
      "sender credential",
      "private DNS credentials",
      "notification recipient",
      "email body",
      "provider message id",
      "queue payload",
      "raw analytics event rows",
      "raw experiment assignment rows",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #286 can record owner-reviewed analytics notification provider/domain readiness evidence after exact confirmation, idempotency, dashboard revision checks, readiness status checks, notification inbox checks, notification dispatch preflight checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible provider/domain readiness evidence only; it does not send email, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, create customer alerts, dispatch queues, expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  },
  notificationContentConsentReadinessWrites: {
    id: "analytics-notification-content-consent-readiness-contract",
    status: "owner-analytics-notification-content-consent-readiness-records-ready",
    issue: 288,
    parentIssue: 18,
    apiRoute: "/api/admin/analytics/notification-content-consent-readiness",
    auth: "owner-session",
    tables: ["analytics_notification_content_consent_readiness_records"],
    confirmationText: "Record Bumpgrade analytics notification content/consent readiness evidence",
    publicSafeFields: [
      "analyticsNotificationContentConsentReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsTimeWindow",
      "notificationContentConsentReadinessDisposition",
      "expectedNotificationProviderDomainReadinessStatus",
      "expectedNotificationDispatchPreflightStatus",
      "expectedNotificationInboxStatus",
      "expectedReadinessStatus",
      "expectedOwnerReviewStatus",
      "expectedAlertThresholdCount",
      "expectedConversionSampleSize",
      "sampleSizeCaveatAcknowledged",
      "ownerContentConsentReadinessRecorded",
      "bodyTemplateReviewed",
      "unsubscribeLinkReviewed",
      "rateLimitReviewed",
      "auditCorrelationReviewed",
      "retentionPolicyReviewed",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "notification recipient",
      "email body",
      "body template",
      "unsubscribe URL",
      "provider message id",
      "queue payload",
      "raw analytics event rows",
      "raw experiment assignment rows",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #288 can record owner-reviewed analytics notification content/consent readiness evidence after exact confirmation, idempotency, dashboard revision checks, readiness status checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible content, unsubscribe, rate-limit, audit-correlation, and retention readiness evidence only; it does not send email, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, create customer alerts, dispatch queues, expose recipients, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  },
  notificationSendPayloadReadinessWrites: {
    id: "analytics-notification-send-payload-readiness-contract",
    status: "owner-analytics-notification-send-payload-readiness-records-ready",
    issue: 290,
    parentIssue: 18,
    apiRoute: "/api/admin/analytics/notification-send-payload-readiness",
    auth: "owner-session",
    tables: ["analytics_notification_send_payload_readiness_records"],
    confirmationText: "Record Bumpgrade analytics notification send-payload readiness evidence",
    publicSafeFields: [
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationContentConsentReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsTimeWindow",
      "notificationSendPayloadReadinessDisposition",
      "expectedNotificationContentConsentReadinessStatus",
      "expectedNotificationProviderDomainReadinessStatus",
      "expectedNotificationDispatchPreflightStatus",
      "expectedNotificationInboxStatus",
      "expectedReadinessStatus",
      "expectedOwnerReviewStatus",
      "expectedAlertThresholdCount",
      "expectedConversionSampleSize",
      "sampleSizeCaveatAcknowledged",
      "ownerSendPayloadReadinessRecorded",
      "payloadShapeReviewed",
      "unsubscribeFooterReviewed",
      "consentSuppressionRecheckReviewed",
      "recipientScopeReviewed",
      "auditCorrelationReviewed",
      "retentionPolicyReviewed",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "notification recipient",
      "recipient payload",
      "personalized body",
      "raw payload body",
      "email body",
      "body template",
      "unsubscribe URL",
      "provider response",
      "provider message id",
      "queue message",
      "queue payload",
      "raw analytics event rows",
      "raw experiment assignment rows",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #290 can record owner-reviewed analytics notification send-payload readiness evidence after exact confirmation, idempotency, dashboard revision checks, readiness status checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current content/consent readiness checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible payload-shape, unsubscribe-footer, consent/suppression recheck, recipient-scope, audit-correlation, and retention readiness evidence only; it does not send email, dispatch queues, create queue messages, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, create customer alerts, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  },
  notificationQueueProducerReadinessWrites: {
    id: "analytics-notification-queue-producer-readiness-contract",
    status: "owner-analytics-notification-queue-producer-readiness-records-ready",
    issue: 292,
    parentIssue: 18,
    apiRoute: "/api/admin/analytics/notification-queue-producer-readiness",
    auth: "owner-session",
    tables: ["analytics_notification_queue_producer_readiness_records"],
    confirmationText: "Record Bumpgrade analytics notification queue-producer readiness evidence",
    publicSafeFields: [
      "analyticsNotificationQueueProducerReadinessId",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsTimeWindow",
      "notificationQueueProducerReadinessDisposition",
      "expectedNotificationSendPayloadReadinessStatus",
      "expectedNotificationProviderDomainReadinessStatus",
      "expectedNotificationDispatchPreflightStatus",
      "expectedNotificationInboxStatus",
      "expectedReadinessStatus",
      "expectedOwnerReviewStatus",
      "expectedAlertThresholdCount",
      "expectedConversionSampleSize",
      "sampleSizeCaveatAcknowledged",
      "ownerQueueProducerReadinessRecorded",
      "queueBindingReviewed",
      "producerModeReviewed",
      "idempotencyPolicyReviewed",
      "retryDeadLetterPolicyReviewed",
      "consumerDependencyReviewed",
      "backpressurePolicyReviewed",
      "auditCorrelationReviewed",
      "retentionPolicyReviewed",
    ],
    serverPrivateFields: [
      "actor_user_id",
      "actor_email_hash",
      "private_note_sha256",
      "confirmation_text_sha256",
      "notification recipient",
      "recipient payload",
      "personalized body",
      "raw payload body",
      "email body",
      "body template",
      "unsubscribe URL",
      "provider response",
      "provider message id",
      "queue message",
      "queue payload",
      "queue payload body",
      "raw analytics event rows",
      "raw experiment assignment rows",
      "metadata_json",
    ],
    writeBoundary:
      "Issue #292 can record owner-reviewed analytics notification queue-producer readiness evidence after exact confirmation, idempotency, dashboard revision checks, readiness status checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible Queue binding, producer-mode, idempotency-policy, retry/dead-letter-policy, consumer-dependency, backpressure, audit-correlation, and retention readiness evidence only; it does not send email, enable Queue producers, dispatch queues, create queue messages, create queue payload bodies, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, create customer alerts, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  },
  conversionReport: analyticsConversionReportContract,
  writeBoundary: analyticsDashboard.writeBoundary,
  dashboards: analyticsDashboards,
  caveat:
    "This contract proves analytics, reporting, experiment read/preview semantics, dashboard-visible aggregate source attribution, fixed-window aggregate source and conversion filters, privacy-safe seeded event capture, browser-side seeded funnel page-view beacons with deterministic variant evidence and normalized source attribution, deterministic seeded assignment, aggregate funnel conversion reporting, owner-confirmed experiment decision evidence, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox record evidence, owner-confirmed dispatch preflight evidence, owner-reviewed provider/domain readiness evidence, owner-reviewed content/consent readiness evidence, owner-reviewed send-payload readiness evidence, and owner-reviewed queue-producer readiness evidence. Public source-data may expose aggregate event, source, variant, assignment, decision, notification-inbox, notification-dispatch-preflight, notification-provider-domain-readiness, notification-content-consent-readiness, notification-send-payload-readiness, notification-queue-producer-readiness, report-export, cohort-comparison, threshold-review, anomaly-review, notification-readiness, and conversion-report counts by fixed window, but it does not expose raw event rows, raw assignment rows, raw visitor keys, full referrer URLs, raw query strings, raw analytics exports, assign cookies, expose contact-level analytics, send automated alerts, send owner email, call providers, configure providers, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, dispatch queues, create queue messages, create queue payload bodies, create recipient payloads, create personalized bodies, store raw payload bodies, create customer alerts, route traffic, make automated decisions, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, expose queue payloads, or provide direct public agent write APIs.",
};
