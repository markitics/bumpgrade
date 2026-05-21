import type { AnalyticsFunnelConversionReport } from "@/lib/analytics-conversion-report";
import type { AnalyticsExperimentDecisionSummary } from "@/lib/analytics-experiment-decisions";
import type { AnalyticsDashboard } from "@/lib/analytics-experiments";
import type { AnalyticsTimeWindow } from "@/lib/analytics-time-windows";

export const analyticsReportExportIssue = 263;
export const analyticsReportExportStatus = "aggregate-report-exports-ready";

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

function conversionSampleSize(report: AnalyticsFunnelConversionReport) {
  return report.rows.reduce((total, row) => total + row.sampleSize, 0);
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
    cohortComparisonFixtures: [
      {
        id: "analytics-cohort-fixture-source-newsletter",
        title: "Newsletter source cohort",
        dimensions: ["utmSource", "utmMedium", "utmCampaign"],
        filters: { utmSource: "newsletter" },
        metricIds: input.dashboard.metrics.map((metric) => metric.id),
        caveat: "Fixture cohort only; live cohort claims require enough captured samples and privacy review.",
      },
      {
        id: "analytics-cohort-fixture-direct-or-referral",
        title: "Direct or referral cohort",
        dimensions: ["referrerHost", "utmSource"],
        filters: { referrerHost: "present_or_direct", utmSource: "missing_or_direct" },
        metricIds: input.dashboard.metrics.map((metric) => metric.id),
        caveat: "Fixture cohort only; it must not be treated as statistically meaningful proof.",
      },
    ],
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
      "Issue #263 exposes aggregate report export metadata only. It does not create downloadable raw analytics exports, expose raw event rows, expose raw assignment rows, expose visitor keys, expose contact analytics, expose raw referrers or query strings, route traffic, choose automated winners, or make revenue claims.",
  };
}
