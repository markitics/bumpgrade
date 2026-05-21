import type { AnalyticsFunnelConversionReport } from "@/lib/analytics-conversion-report";
import type { AnalyticsExperimentDecisionSummary } from "@/lib/analytics-experiment-decisions";
import type { AnalyticsDashboard } from "@/lib/analytics-experiments";
import type { AnalyticsTimeWindow } from "@/lib/analytics-time-windows";

export const analyticsReportExportIssue = 263;
export const analyticsReportExportStatus = "aggregate-report-exports-ready";
export const analyticsCohortComparisonIssue = 265;
export const analyticsCohortComparisonStatus = "owner-reviewed-cohort-comparisons-ready";
export const analyticsAlertAnomalyIssue = 267;
export const analyticsAlertAnomalyStatus = "owner-reviewed-alert-thresholds-ready";
export const analyticsNotificationReadinessIssue = 269;
export const analyticsNotificationReadinessStatus = "owner-reviewed-notification-readiness-ready";
export const analyticsNotificationReadinessId = "analytics-notification-readiness-indie-launch-threshold-review";
export const analyticsNotificationOwnerEmailChannelId = "analytics-notification-channel-owner-email-digest";
export const analyticsNotificationAdminInboxChannelId = "analytics-notification-channel-admin-inbox";
export const analyticsNotificationThresholdIds = [
  "analytics-alert-threshold-sales-to-checkout-rate",
  "analytics-alert-threshold-waitlist-opt-in-rate",
] as const;

type AggregateSummary = {
  aggregateCounts?: unknown[];
  aggregateVariantCounts?: unknown[];
  aggregateSourceCounts?: unknown[];
  rawRowsIncluded: boolean;
  privateDataIncluded: boolean;
};

type AssignmentSummary = {
  aggregateCounts?: unknown[];
  rawRowsIncluded: boolean;
  privateDataIncluded: boolean;
};

type ReportSection = {
  id: string;
  title: string;
  source: string;
  rowCount: number;
  stableIds: string[];
};

type AnalyticsReportExportInput = {
  dashboard: AnalyticsDashboard;
  timeWindow: AnalyticsTimeWindow;
  eventSummary: AggregateSummary;
  assignmentSummary: AssignmentSummary;
  conversionReport: AnalyticsFunnelConversionReport;
  experimentDecisionSummary: AnalyticsExperimentDecisionSummary;
};

function countRows(value: unknown[] | undefined) {
  return Array.isArray(value) ? value.length : 0;
}

function stringField(row: unknown, field: string) {
  if (!row || typeof row !== "object") return null;
  const value = (row as Record<string, unknown>)[field];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberField(row: unknown, field: string) {
  if (!row || typeof row !== "object") return 0;
  const value = (row as Record<string, unknown>)[field];
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
  return Number.isFinite(numeric) ? numeric : 0;
}

function conversionSampleSize(report: AnalyticsFunnelConversionReport) {
  return report.rows.reduce((total, row) => total + row.sampleSize, 0);
}

function cohortFixtures(dashboard: AnalyticsDashboard) {
  return [
    {
      id: "analytics-cohort-fixture-source-newsletter",
      title: "Newsletter source cohort",
      dimensions: ["utmSource", "utmMedium", "utmCampaign"],
      filters: { utmSource: "newsletter" },
      metricIds: dashboard.metrics.map((metric) => metric.id),
      caveat: "Fixture cohort only; live cohort claims require enough captured samples and privacy review.",
    },
    {
      id: "analytics-cohort-fixture-direct-or-referral",
      title: "Direct or referral cohort",
      dimensions: ["referrerHost", "utmSource"],
      filters: { referrerHost: "present_or_direct", utmSource: "missing_or_direct" },
      metricIds: dashboard.metrics.map((metric) => metric.id),
      caveat: "Fixture cohort only; it must not be treated as statistically meaningful proof.",
    },
  ];
}

function rowsForCohort(rows: unknown[] | undefined, fixtureId: string) {
  const sourceRows = Array.isArray(rows) ? rows : [];
  if (fixtureId === "analytics-cohort-fixture-source-newsletter") {
    return sourceRows.filter((row) => stringField(row, "utm_source") === "newsletter");
  }
  if (fixtureId === "analytics-cohort-fixture-direct-or-referral") {
    return sourceRows.filter((row) => {
      const source = stringField(row, "utm_source");
      const referrerHost = stringField(row, "referrer_host");
      return !source || source === "direct" || source === "referral" || Boolean(referrerHost);
    });
  }
  return [];
}

function buildCohortEvidence(input: AnalyticsReportExportInput) {
  const fixtures = cohortFixtures(input.dashboard);
  const assignmentRows = Array.isArray(input.assignmentSummary.aggregateCounts) ? input.assignmentSummary.aggregateCounts : [];
  const totalAssignments = assignmentRows.reduce<number>((total, row) => total + numberField(row, "total_assignments"), 0);
  const totalConversionSampleSize = conversionSampleSize(input.conversionReport);
  const cohorts = fixtures.map((fixture) => {
    const sourceRows = rowsForCohort(input.eventSummary.aggregateSourceCounts, fixture.id);
    const eventCount = sourceRows.reduce<number>((total, row) => total + numberField(row, "total_events"), 0);
    return {
      id: fixture.id,
      title: fixture.title,
      filters: fixture.filters,
      metricIds: fixture.metricIds,
      sourceAggregateRowCount: sourceRows.length,
      eventCount,
      assignmentCount: totalAssignments,
      conversionSampleSize: totalConversionSampleSize,
      sampleSizeCaveat: input.conversionReport.sampleSizeCaveat,
    };
  });

  return [
    {
      id: "analytics-cohort-comparison-newsletter-vs-direct-referral",
      status: analyticsCohortComparisonStatus,
      issue: analyticsCohortComparisonIssue,
      parentIssue: 18,
      title: "Newsletter versus direct/referral cohort comparison",
      sourceDataRoute: "/analytics/source-data",
      selectedTimeWindowKey: input.timeWindow.key,
      dashboardId: input.dashboard.id,
      cohortFixtureIds: fixtures.map((fixture) => fixture.id),
      evidenceSectionIds: [
        "analytics-report-section-source-attribution",
        "analytics-report-section-assignment-aggregates",
        "analytics-report-section-funnel-conversion",
        "analytics-report-section-experiment-decisions",
      ],
      ownerReview: {
        id: "analytics-cohort-review-indie-launch-source-mix",
        status: "reviewed_with_caveats",
        mode: "fixture_owner_review",
        issue: analyticsCohortComparisonIssue,
        reviewedAt: "2026-05-21",
        caveatAcknowledged: true,
        requiredBeforeAgentClaims: true,
      },
      cohorts,
      comparisonSummary: {
        direction: "insufficient_sample_for_winner",
        winnerSelected: false,
        statisticallyMeaningful: false,
        publicClaimAllowed: false,
        trafficRoutingEnabled: false,
        automatedWinnerEnabled: false,
        revenueClaimEnabled: false,
        agentInstruction:
          "Use this as owner-reviewed directional cohort evidence with sample-size caveats only; do not name a winner or make revenue claims.",
      },
      redaction: {
        rawEventRowsIncluded: false,
        rawAssignmentRowsIncluded: false,
        rawVisitorKeysIncluded: false,
        rawReferrersIncluded: false,
        rawQueryStringsIncluded: false,
        contactAnalyticsIncluded: false,
        actorEmailIncluded: false,
        privateNotesIncluded: false,
      },
    },
  ];
}

function conversionRow(input: AnalyticsReportExportInput, metricId: string) {
  return input.conversionReport.rows.find((row) => row.metricId === metricId) ?? null;
}

function buildAlertAnomalyEvidence(input: AnalyticsReportExportInput) {
  const salesToCheckout = conversionRow(input, "funnel-metric-sales-to-checkout");
  const waitlistOptIn = conversionRow(input, "funnel-metric-waitlist-opt-in");
  const conversionRows = [salesToCheckout, waitlistOptIn].filter((row): row is NonNullable<typeof row> =>
    Boolean(row),
  );
  const observedSampleSize = conversionRows.reduce((total, row) => total + row.sampleSize, 0);
  const observedAnomalyCount = conversionRows.filter((row) => row.conversionRate !== null && row.conversionRate < 0.1).length;

  return [
    {
      id: "analytics-alert-threshold-review-indie-launch-funnel-health",
      status: analyticsAlertAnomalyStatus,
      issue: analyticsAlertAnomalyIssue,
      parentIssue: 18,
      title: "Indie launch funnel health threshold review",
      sourceDataRoute: "/analytics/source-data",
      selectedTimeWindowKey: input.timeWindow.key,
      dashboardId: input.dashboard.id,
      alertThresholds: [
        {
          id: "analytics-alert-threshold-sales-to-checkout-rate",
          metricId: "funnel-metric-sales-to-checkout",
          label: "Sales page to checkout minimum review threshold",
          operator: "below",
          thresholdValue: 0.1,
          observedValue: salesToCheckout?.conversionRate ?? null,
          observedSampleSize: salesToCheckout?.sampleSize ?? 0,
          action: "owner_review_only",
          caveat: "Thresholds flag review evidence only; sparse captured samples do not prove a launch problem.",
        },
        {
          id: "analytics-alert-threshold-waitlist-opt-in-rate",
          metricId: "funnel-metric-waitlist-opt-in",
          label: "Warm list opt-in minimum review threshold",
          operator: "below",
          thresholdValue: 0.12,
          observedValue: waitlistOptIn?.conversionRate ?? null,
          observedSampleSize: waitlistOptIn?.sampleSize ?? 0,
          action: "owner_review_only",
          caveat: "Thresholds must stay paired with the source rows, selected window, and sample-size caveat.",
        },
      ],
      anomalyReview: {
        id: "analytics-anomaly-review-indie-launch-funnel-health",
        status: "reviewed_with_caveats",
        mode: "fixture_owner_review",
        issue: analyticsAlertAnomalyIssue,
        reviewedAt: "2026-05-21",
        caveatAcknowledged: true,
        requiredBeforeAgentAction: true,
        anomalyCount: observedAnomalyCount,
        sampleSize: observedSampleSize,
        sampleSizeCaveat: input.conversionReport.sampleSizeCaveat,
      },
      automationBoundary: {
        notificationSent: false,
        trafficRoutingEnabled: false,
        automatedWinnerEnabled: false,
        revenueClaimEnabled: false,
        agentActionAllowed: false,
        ownerReviewRequired: true,
        agentInstruction:
          "Use threshold and anomaly evidence as owner-reviewed review prompts only; do not alert customers, route traffic, name winners, or make revenue claims.",
      },
      redaction: {
        rawEventRowsIncluded: false,
        rawAssignmentRowsIncluded: false,
        rawVisitorKeysIncluded: false,
        rawReferrersIncluded: false,
        rawQueryStringsIncluded: false,
        contactAnalyticsIncluded: false,
        actorEmailIncluded: false,
        privateNotesIncluded: false,
      },
    },
  ];
}

function buildNotificationReadinessEvidence(input: AnalyticsReportExportInput) {
  const alertReview = buildAlertAnomalyEvidence(input)[0];
  const thresholdIds = alertReview.alertThresholds.map((threshold) => threshold.id);

  return [
    {
      id: analyticsNotificationReadinessId,
      status: analyticsNotificationReadinessStatus,
      issue: analyticsNotificationReadinessIssue,
      parentIssue: 18,
      title: "Indie launch analytics threshold notification readiness",
      sourceDataRoute: "/analytics/source-data",
      selectedTimeWindowKey: input.timeWindow.key,
      dashboardId: input.dashboard.id,
      dependsOnAlertReviewIds: [alertReview.id, alertReview.anomalyReview.id],
      dependsOnThresholdIds: thresholdIds,
      deliveryChannels: [
        {
          id: analyticsNotificationOwnerEmailChannelId,
          label: "Future owner email digest",
          audience: "owner_only",
          channel: "email",
          readiness: "contract_ready_only",
          enabled: false,
          deliveryConfigured: false,
          customerVisible: false,
          caveat: "This records the future owner-notification contract only; it does not send email.",
        },
        {
          id: analyticsNotificationAdminInboxChannelId,
          label: "Future admin inbox notice",
          audience: "owner_only",
          channel: "admin",
          readiness: "contract_ready_only",
          enabled: false,
          deliveryConfigured: false,
          customerVisible: false,
          caveat: "This records the future owner admin-notification contract only; it does not create inbox rows.",
        },
      ],
      readinessGates: {
        ownerReviewRequired: true,
        ownerReviewStatus: alertReview.anomalyReview.status,
        sampleSizeCaveatAcknowledged: alertReview.anomalyReview.caveatAcknowledged,
        selectedWindowRequired: true,
        alertThresholdsReviewed: thresholdIds.length,
        customerNotificationEnabled: false,
        queueProducerEnabled: false,
        emailSendEnabled: false,
        retryPolicyEnabled: false,
        directAgentSendAllowed: false,
      },
      deliveryBoundary: {
        notificationSent: false,
        persistedNotificationRows: false,
        customerAlertEnabled: false,
        ownerEmailSendEnabled: false,
        adminInboxWriteEnabled: false,
        trafficRoutingEnabled: false,
        automatedWinnerEnabled: false,
        revenueClaimEnabled: false,
        agentInstruction:
          "Use notification readiness as a future owner-delivery contract only; do not send alerts, write inbox rows, route traffic, name winners, or make revenue claims.",
      },
      redaction: {
        rawEventRowsIncluded: false,
        rawAssignmentRowsIncluded: false,
        rawVisitorKeysIncluded: false,
        rawReferrersIncluded: false,
        rawQueryStringsIncluded: false,
        contactAnalyticsIncluded: false,
        actorEmailIncluded: false,
        privateNotesIncluded: false,
        notificationRecipientIncluded: false,
        emailBodyIncluded: false,
      },
    },
  ];
}

export function buildAnalyticsReportExportSummary(input: AnalyticsReportExportInput) {
  const sections: ReportSection[] = [
    {
      id: "analytics-report-section-event-aggregates",
      title: "Event aggregates",
      source: "eventSummary.aggregateCounts",
      rowCount: countRows(input.eventSummary.aggregateCounts),
      stableIds: ["analyticsEventId", "analyticsEventIngestionId"],
    },
    {
      id: "analytics-report-section-source-attribution",
      title: "Source attribution aggregates",
      source: "eventSummary.aggregateSourceCounts",
      rowCount: countRows(input.eventSummary.aggregateSourceCounts),
      stableIds: ["analyticsEventSourceAggregateId", "utmSource", "utmMedium", "utmCampaign", "referrerHost"],
    },
    {
      id: "analytics-report-section-variant-aggregates",
      title: "Variant aggregates",
      source: "eventSummary.aggregateVariantCounts",
      rowCount: countRows(input.eventSummary.aggregateVariantCounts),
      stableIds: ["analyticsEventVariantAggregateId", "variantId"],
    },
    {
      id: "analytics-report-section-assignment-aggregates",
      title: "Assignment aggregates",
      source: "assignmentSummary.aggregateCounts",
      rowCount: countRows(input.assignmentSummary.aggregateCounts),
      stableIds: ["experimentAssignmentId", "experimentId", "variantId"],
    },
    {
      id: "analytics-report-section-funnel-conversion",
      title: "Funnel conversion rows",
      source: "funnelConversionReport.rows",
      rowCount: input.conversionReport.rows.length,
      stableIds: ["analyticsFunnelConversionReportId", "metricId", "funnelStepMetricId"],
    },
    {
      id: "analytics-report-section-experiment-decisions",
      title: "Experiment decision evidence",
      source: "experimentDecisions.latestDecisions and experimentDecisions.counts",
      rowCount: input.experimentDecisionSummary.latestDecisions.length,
      stableIds: ["analyticsExperimentDecisionId", "analyticsExperimentDecisionKind"],
    },
  ];

  return {
    id: "analytics-report-export-contract",
    status: analyticsReportExportStatus,
    issue: analyticsReportExportIssue,
    parentIssue: 18,
    sourceDataRoute: "/analytics/source-data",
    dashboardId: input.dashboard.id,
    selectedTimeWindow: input.timeWindow,
    exports: [
      {
        id: "analytics-report-export-indie-launch-aggregate-summary",
        title: "Indie launch aggregate analytics report",
        format: "json",
        mediaType: "application/json",
        exportMode: "aggregate_snapshot",
        route: "/analytics/source-data",
        selectedTimeWindowKey: input.timeWindow.key,
        sections,
        totalSectionRows: sections.reduce((total, section) => total + section.rowCount, 0),
        conversionSampleSize: conversionSampleSize(input.conversionReport),
        sampleSizeCaveat: input.conversionReport.sampleSizeCaveat,
      },
    ],
    cohortComparisonFixtures: cohortFixtures(input.dashboard),
    ownerReviewedCohortComparisons: buildCohortEvidence(input),
    ownerReviewedAlertThresholds: buildAlertAnomalyEvidence(input),
    ownerReviewedNotificationReadiness: buildNotificationReadinessEvidence(input),
    redaction: {
      rawEventRowsIncluded: false,
      rawAssignmentRowsIncluded: false,
      rawVisitorKeysIncluded: false,
      rawReferrersIncluded: false,
      rawQueryStringsIncluded: false,
      contactAnalyticsIncluded: false,
      actorEmailIncluded: false,
      privateNotesIncluded: false,
    },
    excludedFields: [
      "rawAnalyticsEventRows",
      "rawExperimentAssignmentRows",
      "rawVisitorKeys",
      "rawReferrerUrls",
      "rawQueryStrings",
      "contactIds",
      "actorEmail",
      "privateNotes",
      "ipHash",
      "userAgentHash",
      "requestHash",
    ],
    writeBoundary:
      "Issue #263 exposes aggregate report export metadata only. Issue #265 adds owner-reviewed cohort comparison evidence with sample-size caveats. Issue #267 adds owner-reviewed alert threshold and anomaly-review evidence. Issue #269 adds owner-reviewed notification delivery readiness evidence. Issue #271 adds owner-confirmed notification inbox record evidence. Issue #284 adds owner-confirmed notification dispatch preflight evidence. These contracts do not create downloadable raw analytics exports, expose raw event rows, expose raw assignment rows, expose visitor keys, expose contact analytics, expose raw referrers or query strings, send alerts, send owner email, call providers, dispatch queues, route traffic, choose automated winners, or make revenue claims.",
  };
}
