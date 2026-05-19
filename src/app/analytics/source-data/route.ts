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

  return {
    status: "available",
    aggregateCounts: result.results ?? [],
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
