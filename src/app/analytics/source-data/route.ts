import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { loadAnalyticsFunnelConversionReport } from "@/lib/analytics-conversion-report";
import { getAnalyticsExperimentDecisionSummary } from "@/lib/analytics-experiment-decisions";
import { analyticsDashboard, analyticsExperimentsSourceData } from "@/lib/analytics-experiments";
import { getAnalyticsNotificationContentConsentReadinessSummary } from "@/lib/analytics-notification-content-consent-readiness";
import { getAnalyticsNotificationQueueConsumerReadinessSummary } from "@/lib/analytics-notification-queue-consumer-readiness";
import { getAnalyticsNotificationQueueProducerReadinessSummary } from "@/lib/analytics-notification-queue-producer-readiness";
import { getAnalyticsNotificationSendPayloadReadinessSummary } from "@/lib/analytics-notification-send-payload-readiness";
import { getAnalyticsNotificationDispatchPreflightSummary } from "@/lib/analytics-notification-dispatch-preflights";
import { getAnalyticsNotificationInboxSummary } from "@/lib/analytics-notification-inbox";
import { getAnalyticsNotificationProviderDomainReadinessSummary } from "@/lib/analytics-notification-provider-domain-readiness";
import { buildAnalyticsReportExportSummary } from "@/lib/analytics-report-exports";
import {
  analyticsTimeWindowStart,
  analyticsTimeWindows,
  resolveAnalyticsTimeWindow,
  type AnalyticsTimeWindow,
} from "@/lib/analytics-time-windows";

export const dynamic = "force-dynamic";

type AnalyticsAggregateRow = {
  event_definition_id: string;
  event_kind: string;
  source_route: string;
  total_events: number;
  last_event_at: number | null;
};

type AnalyticsVariantAggregateRow = {
  event_definition_id: string;
  source_route: string;
  variant_id: string;
  total_events: number;
  last_event_at: number | null;
};

type AnalyticsSourceAggregateRow = {
  event_definition_id: string;
  source_route: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer_host: string | null;
  total_events: number;
  last_event_at: number | null;
};

type AnalyticsAssignmentAggregateRow = {
  experiment_id: string;
  variant_id: string;
  source_route: string;
  total_assignments: number;
  last_assigned_at: number | null;
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as Cloudflare.Env).DB;
}

async function loadEventSummary(db: D1Database | undefined, timeWindow: AnalyticsTimeWindow) {
  if (!db) {
    return {
      status: "unavailable",
      timeWindow,
      aggregateCounts: [],
      aggregateVariantCounts: [],
      aggregateSourceCounts: [],
      rawRowsIncluded: false,
      privateDataIncluded: false,
    };
  }

  const windowStart = analyticsTimeWindowStart(timeWindow);
  const windowWhere = windowStart === null ? "" : "WHERE occurred_at >= ?";
  const aggregateStatement = db.prepare(
    `SELECT
        event_definition_id,
        event_kind,
        source_route,
        COUNT(*) AS total_events,
        MAX(occurred_at) AS last_event_at
       FROM analytics_events
       ${windowWhere}
       GROUP BY event_definition_id, event_kind, source_route
       ORDER BY event_definition_id`,
  );
  const result =
    windowStart === null
      ? await aggregateStatement.all<AnalyticsAggregateRow>()
      : await aggregateStatement.bind(windowStart).all<AnalyticsAggregateRow>();
  const variantStatement = db.prepare(
    `SELECT
        event_definition_id,
        source_route,
        variant_id,
        COUNT(*) AS total_events,
        MAX(occurred_at) AS last_event_at
       FROM analytics_events
       WHERE variant_id IS NOT NULL
         ${windowStart === null ? "" : "AND occurred_at >= ?"}
       GROUP BY event_definition_id, source_route, variant_id
       ORDER BY event_definition_id, variant_id`,
  );
  const variantResult =
    windowStart === null
      ? await variantStatement.all<AnalyticsVariantAggregateRow>()
      : await variantStatement.bind(windowStart).all<AnalyticsVariantAggregateRow>();
  const sourceStatement = db.prepare(
    `SELECT
        event_definition_id,
        source_route,
        json_extract(public_properties_json, '$.utmSource') AS utm_source,
        json_extract(public_properties_json, '$.utmMedium') AS utm_medium,
        json_extract(public_properties_json, '$.utmCampaign') AS utm_campaign,
        json_extract(public_properties_json, '$.utmContent') AS utm_content,
        json_extract(public_properties_json, '$.utmTerm') AS utm_term,
        json_extract(public_properties_json, '$.referrerHost') AS referrer_host,
        COUNT(*) AS total_events,
        MAX(occurred_at) AS last_event_at
       FROM analytics_events
       WHERE event_definition_id = 'event-funnel-page-view'
         ${windowStart === null ? "" : "AND occurred_at >= ?"}
         AND (
          json_extract(public_properties_json, '$.utmSource') IS NOT NULL OR
          json_extract(public_properties_json, '$.utmMedium') IS NOT NULL OR
          json_extract(public_properties_json, '$.utmCampaign') IS NOT NULL OR
          json_extract(public_properties_json, '$.utmContent') IS NOT NULL OR
          json_extract(public_properties_json, '$.utmTerm') IS NOT NULL OR
          json_extract(public_properties_json, '$.referrerHost') IS NOT NULL
         )
       GROUP BY
        event_definition_id,
        source_route,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        referrer_host
       ORDER BY total_events DESC, utm_source, utm_campaign`,
  );
  const sourceResult =
    windowStart === null
      ? await sourceStatement.all<AnalyticsSourceAggregateRow>()
      : await sourceStatement.bind(windowStart).all<AnalyticsSourceAggregateRow>();

  return {
    status: "available",
    timeWindow,
    aggregateCounts: result.results ?? [],
    aggregateVariantCounts: variantResult.results ?? [],
    aggregateSourceCounts: sourceResult.results ?? [],
    rawRowsIncluded: false,
    privateDataIncluded: false,
  };
}

async function loadAssignmentSummary(db: D1Database | undefined) {
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
        experiment_id,
        variant_id,
        source_route,
        COUNT(*) AS total_assignments,
        MAX(assigned_at) AS last_assigned_at
       FROM analytics_experiment_assignments
       GROUP BY experiment_id, variant_id, source_route
       ORDER BY experiment_id, variant_id`,
    )
    .all<AnalyticsAssignmentAggregateRow>();

  return {
    status: "available",
    aggregateCounts: result.results ?? [],
    rawRowsIncluded: false,
    privateDataIncluded: false,
  };
}

export async function GET(request: NextRequest) {
  const db = await getDb();
  const timeWindow = resolveAnalyticsTimeWindow(request.nextUrl.searchParams.get("window"));
  const eventSummary = await loadEventSummary(db, timeWindow);
  const assignmentSummary = await loadAssignmentSummary(db);
  const funnelConversionReport = await loadAnalyticsFunnelConversionReport(db, analyticsDashboard, timeWindow);
  const experimentDecisions = await getAnalyticsExperimentDecisionSummary(db);
  const notificationInboxRecords = await getAnalyticsNotificationInboxSummary(db);
  const notificationDispatchPreflights = await getAnalyticsNotificationDispatchPreflightSummary(db);
  const notificationProviderDomainReadiness = await getAnalyticsNotificationProviderDomainReadinessSummary(db);
  const notificationContentConsentReadiness = await getAnalyticsNotificationContentConsentReadinessSummary(db);
  const notificationSendPayloadReadiness = await getAnalyticsNotificationSendPayloadReadinessSummary(db);
  const notificationQueueProducerReadiness = await getAnalyticsNotificationQueueProducerReadinessSummary(db);
  const notificationQueueConsumerReadiness = await getAnalyticsNotificationQueueConsumerReadinessSummary(db);
  return NextResponse.json({
    ...analyticsExperimentsSourceData,
    timeWindows: {
      default: analyticsTimeWindows[0].key,
      selected: timeWindow.key,
      supported: analyticsTimeWindows,
    },
    eventSummary,
    assignmentSummary,
    funnelConversionReport,
    experimentDecisions,
    notificationInboxRecords,
    notificationDispatchPreflights,
    notificationProviderDomainReadiness,
    notificationContentConsentReadiness,
    notificationSendPayloadReadiness,
    notificationQueueProducerReadiness,
    notificationQueueConsumerReadiness,
    reportExports: buildAnalyticsReportExportSummary({
      dashboard: analyticsDashboard,
      timeWindow,
      eventSummary,
      assignmentSummary,
      conversionReport: funnelConversionReport,
      experimentDecisionSummary: experimentDecisions,
    }),
  });
}
