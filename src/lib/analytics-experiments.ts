import {
  analyticsEventCaptureApiRoute,
  analyticsEventCaptureUpdatedAt,
  analyticsEventCaptureWriteContract,
} from "@/lib/analytics-events";

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
export type ExperimentStatus = "draft";

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

export const analyticsExperimentsUpdatedAt = analyticsEventCaptureUpdatedAt;

export const analyticsDashboard: AnalyticsDashboard = {
  id: "analytics-dashboard-indie-launch",
  slug: "indie-launch-dashboard",
  title: "Indie launch analytics and experiment preview",
  status: "draft",
  issue: 105,
  parentIssue: 18,
  sourceDataRoute: "/analytics/source-data",
  previewRoute: "/analytics/indie-launch-dashboard",
  linkedFunnelRoute: "/funnels/indie-launch-sandbox",
  linkedOfferRoute: "/offers/indie-launch-stack",
  linkedAudienceRoute: "/audience/indie-launch-waitlist",
  linkedProductRoute: "/products/indie-launch-library",
  revisionId: "analytics-experiment-revision-indie-launch-2026-05-19",
  summary:
    "A privacy-safe analytics and experiment scaffold for funnel conversion, checkout revenue, audience opt-ins, and deterministic A/B assignment with seeded live event capture before cookies or automated decisions exist.",
  events: [
    {
      id: "event-funnel-page-view",
      kind: "page_view",
      title: "Funnel page viewed",
      sourceRoute: "/funnels/indie-launch-sandbox",
      linkedFeatureIds: ["feature-funnel-builder", "feature-analytics-testing"],
      publicProperties: ["route", "funnelId", "stepId", "variantId"],
      privateDataExcluded: ["IP address", "user agent", "cookie id", "contact id", "full referrer"],
      aggregation: "Count by route, step, and variant after bot and preview traffic filtering.",
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
      caveat: "Preview values are fixtures until live event capture and bot filtering ship.",
    },
    {
      id: "metric-checkout-start-rate",
      title: "Checkout start rate",
      format: "rate",
      formula: "event-checkout-started / sales-page event-funnel-page-view",
      sourceEventIds: ["event-funnel-page-view", "event-checkout-started"],
      caveat: "Checkout starts require confirmed audit records before reporting live values.",
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
      status: "draft",
      linkedRoute: "/funnels/indie-launch-sandbox#warm-list-opt-in",
      assignmentKey: "anonymousStableVisitorKey",
      assignmentRule:
        "Hash experiment id plus a future first-party anonymous visitor key, then map 0-49 to A and 50-99 to B.",
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
        "Experiment assignment is preview-only. Future assignment writes require consent-safe visitor keys, bot filtering, idempotency, stale-state checks, audit correlation, and a rollback plan before traffic changes.",
    },
  ],
  writeBoundary:
    "Issue #105 can capture seeded analytics events with idempotency, source-route validation, hashed request evidence, and aggregate-only public reporting. Cookie assignment, contact-level analytics, arbitrary custom events, experiment traffic changes, dashboard decisions, and revenue claims require actor identity, privacy review, idempotency, bot filtering, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.",
  validation: [
    "/analytics/source-data returns seeded events, metrics, funnel-step fixtures, and experiment definitions.",
    "/analytics/indie-launch-dashboard renders the analytics and experiment preview.",
    `${analyticsEventCaptureApiRoute} stores seeded analytics event capture evidence with idempotency.`,
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
  status: "event-capture-ready",
  issue: 105,
  parentIssue: 18,
  generatedFrom: "src/lib/analytics-experiments.ts",
  routes: ["/analytics/source-data", analyticsEventCaptureApiRoute, ...analyticsDashboards.map((dashboard) => dashboard.previewRoute)],
  stableIds: [
    "analyticsEventId",
    "analyticsEventIngestionId",
    "metricId",
    "funnelStepMetricId",
    "experimentId",
    "variantId",
    "assignmentRuleId",
    "reportId",
    "agentActionId",
  ],
  eventWrites: analyticsEventCaptureWriteContract,
  writeBoundary: analyticsDashboard.writeBoundary,
  dashboards: analyticsDashboards,
  caveat:
    "This contract proves analytics, reporting, experiment read/preview semantics, and privacy-safe seeded event capture. Public source-data may expose aggregate event counts, but it does not expose raw event rows, assign cookies, expose contact-level analytics, make automated decisions, or provide direct confirmed-write agent APIs.",
};
