import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import { loadAnalyticsFunnelConversionReport } from "@/lib/analytics-conversion-report";
import { analyticsDashboard, analyticsExperimentsSourceData } from "@/lib/analytics-experiments";

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

async function loadEventSummary(db: D1Database | undefined) {
  if (!db) {
    return {
      status: "unavailable",
      aggregateCounts: [],
      aggregateVariantCounts: [],
      aggregateSourceCounts: [],
      rawRowsIncluded: false,
      privateDataIncluded: false,
    };
  }

  const result = await db
    .prepare(
      `SELECT
        event_definition_id,
        event_kind,
        source_route,
        COUNT(*) AS total_events,
        MAX(occurred_at) AS last_event_at
       FROM analytics_events
       GROUP BY event_definition_id, event_kind, source_route
       ORDER BY event_definition_id`,
    )
    .all<AnalyticsAggregateRow>();
  const variantResult = await db
    .prepare(
      `SELECT
        event_definition_id,
        source_route,
        variant_id,
        COUNT(*) AS total_events,
        MAX(occurred_at) AS last_event_at
       FROM analytics_events
       WHERE variant_id IS NOT NULL
       GROUP BY event_definition_id, source_route, variant_id
       ORDER BY event_definition_id, variant_id`,
    )
    .all<AnalyticsVariantAggregateRow>();
  const sourceResult = await db
    .prepare(
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
    )
    .all<AnalyticsSourceAggregateRow>();

  return {
    status: "available",
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

export async function GET() {
  const db = await getDb();
  return NextResponse.json({
    ...analyticsExperimentsSourceData,
    eventSummary: await loadEventSummary(db),
    assignmentSummary: await loadAssignmentSummary(db),
    funnelConversionReport: await loadAnalyticsFunnelConversionReport(db, analyticsDashboard),
  });
}
