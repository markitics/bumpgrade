"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

import { AnalyticsTimeWindowSelector } from "@/components/analytics-time-window-selector";
import type {
  AnalyticsFunnelConversionReport,
  AnalyticsFunnelConversionRow,
} from "@/lib/analytics-conversion-report";
import type { AnalyticsTimeWindow, AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AnalyticsConversionReportPanelProps = {
  fallbackReport: AnalyticsFunnelConversionReport;
  timeWindows: AnalyticsTimeWindow[];
};

function formatPercent(value: number | null) {
  if (value === null) return "No sample";
  return `${Math.round(value * 1000) / 10}%`;
}

function reportModeLabel(mode: AnalyticsFunnelConversionRow["reportMode"]) {
  return mode === "captured_events" ? "Captured" : "Modeled";
}

function MetricCard({ metric }: { metric: AnalyticsFunnelConversionRow }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className={`status-badge ${metric.reportMode === "captured_events" ? "live" : "planned"}`}>
          {reportModeLabel(metric.reportMode)}
        </span>
        <span className="admin-pill">{formatPercent(metric.conversionRate)}</span>
      </div>
      <TrendingUp aria-hidden="true" />
      <h3>{metric.label}</h3>
      <p>
        {metric.conversionCount} conversions from {metric.visitorCount} visitors.
      </p>
      <div className="feature-detail">
        <strong>Stage</strong>
        <span>{metric.label}</span>
      </div>
      <div className="feature-detail">
        <strong>Signals</strong>
        <span>Visitor activity to conversion activity</span>
      </div>
    </article>
  );
}

export function AnalyticsConversionReportPanel({ fallbackReport, timeWindows }: AnalyticsConversionReportPanelProps) {
  const [report, setReport] = useState(fallbackReport);
  const [selectedWindow, setSelectedWindow] = useState<AnalyticsTimeWindowKey>(fallbackReport.timeWindow.key);

  useEffect(() => {
    let cancelled = false;
    async function loadReport() {
      try {
        const response = await fetch(`/analytics/source-data?window=${encodeURIComponent(selectedWindow)}`, {
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { funnelConversionReport?: AnalyticsFunnelConversionReport };
        if (!cancelled && payload.funnelConversionReport) {
          setReport(payload.funnelConversionReport);
        }
      } catch {
        // Fallback rows are already rendered server-side for crawlers and no-JS clients.
      }
    }
    void loadReport();
    return () => {
      cancelled = true;
    };
  }, [selectedWindow]);

  return (
    <>
      <AnalyticsTimeWindowSelector
        label="Conversion window"
        options={timeWindows}
        selected={selectedWindow}
        onSelect={setSelectedWindow}
      />
      <div className="feature-grid">
        {report.rows.map((metric) => (
          <MetricCard key={metric.metricId} metric={metric} />
        ))}
      </div>
      <p className="section-note">Use these rates directionally until more traffic accumulates.</p>
    </>
  );
}
