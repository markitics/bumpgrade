"use client";

import { AlertCircle, CheckCircle2, FlaskConical } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsExperimentDecisionApiRoute,
  analyticsExperimentDecisionConfirmationText,
  type AnalyticsExperimentDecisionEvidence,
  type AnalyticsExperimentDecisionKind,
} from "@/lib/analytics-experiment-decisions";
import type { ExperimentVariant } from "@/lib/analytics-experiments";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsExperimentDecisionFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  experimentId: string;
  experimentTitle: string;
  experimentStatus: string;
  variants: ExperimentVariant[];
  currentEvidenceByWindow: AnalyticsExperimentDecisionEvidence[];
};

type DecisionResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  decision?: {
    id: string;
    decisionKind: AnalyticsExperimentDecisionKind;
    selectedVariantLabel: string | null;
    timeWindowKey: string;
    expectedAssignmentCount: number;
    expectedConversionSampleSize: number;
    trafficRoutingEnabled: false;
    automatedWinnerEnabled: false;
  };
};

const decisionOptions: Array<{ value: AnalyticsExperimentDecisionKind; label: string }> = [
  { value: "continue_observing", label: "Continue observing" },
  { value: "prefer_variant", label: "Prefer variant" },
  { value: "pause_experiment", label: "Pause experiment" },
  { value: "needs_more_data", label: "Needs more data" },
];

function variantCountRecord(evidence: AnalyticsExperimentDecisionEvidence) {
  return Object.fromEntries(evidence.variantCounts.map((variant) => [variant.variantId, variant.totalAssignments]));
}

export function AdminAnalyticsExperimentDecisionForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  experimentId,
  experimentTitle,
  experimentStatus,
  variants,
  currentEvidenceByWindow,
}: AdminAnalyticsExperimentDecisionFormProps) {
  const [decisionKind, setDecisionKind] = useState<AnalyticsExperimentDecisionKind>("continue_observing");
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<DecisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence) {
      setError("Analytics evidence is not available for experiment decisions.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const decisionResponse = await fetch(analyticsExperimentDecisionApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          experimentId,
          decisionKind,
          selectedVariantId: decisionKind === "prefer_variant" ? selectedVariantId : null,
          timeWindowKey: selectedEvidence.timeWindow.key,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedExperimentStatus: experimentStatus,
          expectedAssignmentCount: selectedEvidence.assignmentCount,
          expectedVariantCounts: variantCountRecord(selectedEvidence),
          expectedPrimaryMetricId: selectedEvidence.primaryMetricId,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsExperimentDecisionConfirmationText,
          idempotencyKey: `analytics-experiment-decision-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await decisionResponse.json()) as DecisionResponse;
      if (!decisionResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics experiment decision could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The analytics experiment decision could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record experiment decision evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Experiment decision</span>
          <strong>{experimentTitle}</strong>
          <p>
            Records owner-reviewed decision evidence with aggregate assignment counts, fixed-window conversion sample
            size, and sample-size caveat acknowledgement. It does not route traffic or choose an automated winner.
          </p>
        </div>
      </div>
      <label className="admin-form-field">
        <span>Decision</span>
        <select value={decisionKind} onChange={(event) => setDecisionKind(event.target.value as AnalyticsExperimentDecisionKind)}>
          {decisionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-form-field">
        <span>Window</span>
        <select value={timeWindowKey} onChange={(event) => setTimeWindowKey(event.target.value as AnalyticsTimeWindowKey)}>
          {currentEvidenceByWindow.map((evidence) => (
            <option key={evidence.timeWindow.key} value={evidence.timeWindow.key}>
              {evidence.timeWindow.label}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-form-field">
        <span>Selected variant</span>
        <select
          value={selectedVariantId}
          disabled={decisionKind !== "prefer_variant"}
          onChange={(event) => setSelectedVariantId(event.target.value)}
        >
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.label}
            </option>
          ))}
        </select>
      </label>
      <div className="admin-form-field admin-step-goal-field">
        <span>Evidence snapshot</span>
        <p>
          Assignments: {selectedEvidence?.assignmentCount ?? 0}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; report mode:{" "}
          {selectedEvidence?.conversionReportMode?.replaceAll("_", " ") ?? "unavailable"}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Private note</span>
        <textarea
          value={privateNote}
          onChange={(event) => setPrivateNote(event.target.value)}
          rows={3}
        />
      </label>
      <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting || !selectedEvidence}>
        {isSubmitting ? "Recording..." : "Record experiment decision"}
        <FlaskConical aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error admin-step-goal-field">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.decision ? (
        <div className="checkout-alert success admin-step-goal-field">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Experiment decision replayed" : "Experiment decision recorded"}</strong>
            <span>
              {response.decision.decisionKind.replaceAll("_", " ")} for {response.decision.timeWindowKey}; traffic
              routing enabled: {String(response.decision.trafficRoutingEnabled)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
