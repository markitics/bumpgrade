import type { AnalyticsDashboard } from "@/lib/analytics-experiments";

export const analyticsConversionReportUpdatedAt = "2026-05-19";

export const analyticsConversionReportContract = {
  id: "analytics-funnel-conversion-report-contract",
  status: "conversion-report-ready",
  issue: 119,
  parentIssue: 18,
  sourceDataRoute: "/analytics/source-data",
  tables: ["analytics_events"],
  publicSafeFields: [
    "metricId",
    "stepId",
    "label",
    "visitorEventId",
    "conversionEventId",
    "visitorCount",
    "conversionCount",
    "conversionRate",
    "sampleSize",
    "reportMode",
  ],
  serverPrivateFields: [
    "raw analytics event rows",
    "client_correlation_hash",
    "ip_hash",
    "user_agent_hash",
    "request_hash",
    "metadata_json",
    "raw cookies",
    "raw contact identifiers",
    "raw visitor keys",
    "raw Stripe identifiers",
  ],
  writeBoundary:
    "Issue #119 can report aggregate funnel conversion rows from captured seeded analytics events. It does not expose raw rows, contact-level analytics, visitor timelines, bot filtering decisions, attribution mutation, experiment traffic routing, automated winners, or direct agent analytics writes.",
};

type AnalyticsEventAggregateRow = {
  event_definition_id: string;
  funnel_step_id: string | null;
  total_events: number;
  last_event_at: number | null;
};

type FunnelReportDefinition = {
  metricId: string;
  stepId: string;
  label: string;
  visitorEventId: string;
  visitorStepId?: string;
  conversionEventId: string;
};

export type AnalyticsFunnelConversionRow = {
  metricId: string;
  stepId: string;
  label: string;
  visitorEventId: string;
  conversionEventId: string;
  visitorCount: number;
  conversionCount: number;
  conversionRate: number | null;
  sampleSize: number;
  reportMode: "captured_events" | "fixture_fallback";
  fixtureVisitors: number;
  fixtureConversions: number;
  lastEventAt: number | null;
};

export type AnalyticsFunnelConversionReport = {
  id: string;
  status: "available" | "unavailable";
  issue: number;
  parentIssue: number;
  dashboardId: string;
  sourceTable: "analytics_events";
  rows: AnalyticsFunnelConversionRow[];
  rawRowsIncluded: false;
  privateDataIncluded: false;
  sampleSizeCaveat: string;
};

const sampleSizeCaveat =
  "Captured test events are enough to verify reporting semantics, not enough to claim statistical significance. Agents must include sample-size caveats before summarizing conversion rates.";

const reportDefinitions: FunnelReportDefinition[] = [
  {
    metricId: "funnel-metric-waitlist-opt-in",
    stepId: "funnel-step-indie-launch-opt-in",
    label: "Warm list opt-in",
    visitorEventId: "event-funnel-page-view",
    visitorStepId: "funnel-step-indie-launch-opt-in",
    conversionEventId: "event-audience-opt-in-created",
  },
  {
    metricId: "funnel-metric-sales-to-checkout",
    stepId: "funnel-step-indie-launch-sales",
    label: "Sales page to checkout",
    visitorEventId: "event-funnel-page-view",
    visitorStepId: "funnel-step-indie-launch-sales",
    conversionEventId: "event-checkout-started",
  },
  {
    metricId: "funnel-metric-checkout-to-purchase",
    stepId: "checkout-stack-indie-launch-sandbox",
    label: "Checkout start to purchase",
    visitorEventId: "event-checkout-started",
    conversionEventId: "event-purchase-completed",
  },
];

function fixtureMetric(dashboard: AnalyticsDashboard, metricId: string) {
  return dashboard.funnelStepMetrics.find((metric) => metric.id === metricId);
}

function countFor(
  rows: AnalyticsEventAggregateRow[],
  eventDefinitionId: string,
  funnelStepId: string | undefined,
) {
  return rows
    .filter((row) => {
      if (row.event_definition_id !== eventDefinitionId) return false;
      if (funnelStepId === undefined) return true;
      return row.funnel_step_id === funnelStepId;
    })
    .reduce(
      (aggregate, row) => ({
        total: aggregate.total + Number(row.total_events ?? 0),
        lastEventAt: Math.max(aggregate.lastEventAt ?? 0, Number(row.last_event_at ?? 0)) || null,
      }),
      { total: 0, lastEventAt: null as number | null },
    );
}

function conversionRate(conversions: number, visitors: number) {
  if (visitors <= 0) return null;
  return Math.round((conversions / visitors) * 1000) / 1000;
}

function buildRows(dashboard: AnalyticsDashboard, eventRows: AnalyticsEventAggregateRow[]) {
  return reportDefinitions.map((definition) => {
    const fixture = fixtureMetric(dashboard, definition.metricId);
    const visitors = countFor(eventRows, definition.visitorEventId, definition.visitorStepId);
    const conversions = countFor(eventRows, definition.conversionEventId, undefined);
    const hasCapturedEvents = visitors.total > 0 || conversions.total > 0;
    const visitorCount = hasCapturedEvents ? visitors.total : (fixture?.visitors ?? 0);
    const conversionCount = hasCapturedEvents ? conversions.total : (fixture?.conversions ?? 0);

    return {
      metricId: definition.metricId,
      stepId: definition.stepId,
      label: definition.label,
      visitorEventId: definition.visitorEventId,
      conversionEventId: definition.conversionEventId,
      visitorCount,
      conversionCount,
      conversionRate: conversionRate(conversionCount, visitorCount),
      sampleSize: visitorCount + conversionCount,
      reportMode: hasCapturedEvents ? "captured_events" : "fixture_fallback",
      fixtureVisitors: fixture?.visitors ?? 0,
      fixtureConversions: fixture?.conversions ?? 0,
      lastEventAt: Math.max(visitors.lastEventAt ?? 0, conversions.lastEventAt ?? 0) || null,
    } satisfies AnalyticsFunnelConversionRow;
  });
}

async function loadEventRows(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT
        event_definition_id,
        funnel_step_id,
        COUNT(*) AS total_events,
        MAX(occurred_at) AS last_event_at
       FROM analytics_events
       GROUP BY event_definition_id, funnel_step_id
       ORDER BY event_definition_id, funnel_step_id`,
    )
    .all<AnalyticsEventAggregateRow>();

  return result.results ?? [];
}

export async function loadAnalyticsFunnelConversionReport(
  db: D1Database | undefined,
  dashboard: AnalyticsDashboard,
): Promise<AnalyticsFunnelConversionReport> {
  const eventRows = db ? await loadEventRows(db) : [];

  return analyticsFunnelConversionReportFromRows(dashboard, eventRows, db ? "available" : "unavailable");
}

export function analyticsFunnelConversionFallbackReport(dashboard: AnalyticsDashboard) {
  return analyticsFunnelConversionReportFromRows(dashboard, [], "unavailable");
}

function analyticsFunnelConversionReportFromRows(
  dashboard: AnalyticsDashboard,
  eventRows: AnalyticsEventAggregateRow[],
  status: AnalyticsFunnelConversionReport["status"],
): AnalyticsFunnelConversionReport {
  return {
    id: "analytics-funnel-conversion-report-indie-launch",
    status,
    issue: 119,
    parentIssue: 18,
    dashboardId: dashboard.id,
    sourceTable: "analytics_events",
    rows: buildRows(dashboard, eventRows),
    rawRowsIncluded: false,
    privateDataIncluded: false,
    sampleSizeCaveat,
  };
}
