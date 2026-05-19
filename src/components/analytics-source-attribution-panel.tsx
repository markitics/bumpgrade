"use client";

import { useEffect, useState } from "react";
import { MapPinned } from "lucide-react";

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

type AnalyticsSourceAttributionPanelProps = {
  fallbackRows?: AnalyticsSourceAggregateRow[];
};

function sourceLabel(row: AnalyticsSourceAggregateRow) {
  return row.utm_source ?? row.referrer_host ?? "Direct / unknown";
}

function campaignLabel(row: AnalyticsSourceAggregateRow) {
  const parts = [row.utm_medium, row.utm_campaign, row.utm_content, row.utm_term].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "No campaign label";
}

export function AnalyticsSourceAttributionPanel({ fallbackRows = [] }: AnalyticsSourceAttributionPanelProps) {
  const [rows, setRows] = useState(fallbackRows);
  const [status, setStatus] = useState<"ready" | "loading" | "unavailable">("loading");

  useEffect(() => {
    let cancelled = false;
    async function loadSources() {
      try {
        const response = await fetch("/analytics/source-data", { headers: { accept: "application/json" } });
        if (!response.ok) {
          if (!cancelled) setStatus("unavailable");
          return;
        }
        const payload = (await response.json()) as {
          eventSummary?: {
            aggregateSourceCounts?: AnalyticsSourceAggregateRow[];
          };
        };
        if (!cancelled) {
          setRows(payload.eventSummary?.aggregateSourceCounts ?? []);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    }
    void loadSources();
    return () => {
      cancelled = true;
    };
  }, []);

  const topRows = rows.slice(0, 6);

  return (
    <div className="source-attribution-panel">
      <div className="source-attribution-summary">
        <MapPinned aria-hidden="true" />
        <div>
          <strong>{rows.length}</strong>
          <span>aggregate source rows</span>
        </div>
        <p>Raw event rows, visitor keys, full referrers, and raw query strings stay excluded.</p>
      </div>

      {topRows.length > 0 ? (
        <div className="source-attribution-table" role="table" aria-label="Aggregate source attribution rows">
          <div className="source-attribution-row heading" role="row">
            <span role="columnheader">Source</span>
            <span role="columnheader">Campaign</span>
            <span role="columnheader">Referrer host</span>
            <span role="columnheader">Views</span>
          </div>
          {topRows.map((row) => (
            <div
              className="source-attribution-row"
              role="row"
              key={`${row.event_definition_id}-${row.utm_source ?? "direct"}-${row.utm_campaign ?? "none"}-${row.referrer_host ?? "none"}`}
            >
              <strong role="cell" data-label="Source">
                {sourceLabel(row)}
              </strong>
              <span role="cell" data-label="Campaign">
                {campaignLabel(row)}
              </span>
              <span role="cell" data-label="Referrer host">
                {row.referrer_host ?? "None captured"}
              </span>
              <span role="cell" data-label="Views">
                {row.total_events}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="source-attribution-empty">
          <strong>{status === "unavailable" ? "Source aggregates unavailable" : "No source rows captured yet"}</strong>
          <span>Future page views with safe UTM or referrer evidence will appear here as aggregate counts.</span>
        </div>
      )}
    </div>
  );
}
