import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import { analyticsExperimentsSourceData } from "@/lib/analytics-experiments";

export const dynamic = "force-dynamic";

type AnalyticsAggregateRow = {
  event_definition_id: string;
  event_kind: string;
  source_route: string;
  total_events: number;
  last_event_at: number | null;
};

async function loadEventSummary() {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as Cloudflare.Env).DB;
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

export async function GET() {
  return NextResponse.json({
    ...analyticsExperimentsSourceData,
    eventSummary: await loadEventSummary(),
  });
}
