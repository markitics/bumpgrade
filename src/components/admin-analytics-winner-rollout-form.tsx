"use client";

import { AlertCircle, CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsExperimentWinnerRollbackConfirmationText,
  analyticsExperimentWinnerRolloutApiRoute,
  analyticsExperimentWinnerRolloutConfirmationText,
  type AnalyticsExperimentWinnerRolloutPublic,
} from "@/lib/analytics-experiment-winner-rollouts";
import type { AnalyticsExperimentDecisionEvidence } from "@/lib/analytics-experiment-decisions";
import type { ExperimentVariant } from "@/lib/analytics-experiments";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsWinnerRolloutFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  experimentId: string;
  experimentTitle: string;
  experimentStatus: string;
  variants: ExperimentVariant[];
  currentEvidenceByWindow: AnalyticsExperimentDecisionEvidence[];
  activeRollout: AnalyticsExperimentWinnerRolloutPublic | null;
};

type RolloutResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  rollout?: AnalyticsExperimentWinnerRolloutPublic;
};

function variantCountRecord(evidence: AnalyticsExperimentDecisionEvidence) {
  return Object.fromEntries(evidence.variantCounts.map((variant) => [variant.variantId, variant.totalAssignments]));
}

export function AdminAnalyticsWinnerRolloutForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  experimentId,
  experimentTitle,
  experimentStatus,
  variants,
  currentEvidenceByWindow,
  activeRollout,
}: AdminAnalyticsWinnerRolloutFormProps) {
  const rolloutVariants = variants.filter((variant) => variant.routingRole !== "holdout");
  const [selectedVariantId, setSelectedVariantId] = useState(rolloutVariants[0]?.id ?? "");
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<RolloutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );

  async function submitRollout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence) {
      setError("Analytics evidence is not available for winner rollout.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const rolloutResponse = await fetch(analyticsExperimentWinnerRolloutApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "rollout_winner",
          dashboardId,
          experimentId,
          selectedVariantId,
          timeWindowKey: selectedEvidence.timeWindow.key,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedExperimentStatus: experimentStatus,
          expectedAssignmentCount: selectedEvidence.assignmentCount,
          expectedVariantCounts: variantCountRecord(selectedEvidence),
          expectedPrimaryMetricId: selectedEvidence.primaryMetricId,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsExperimentWinnerRolloutConfirmationText,
          idempotencyKey: `analytics-experiment-winner-rollout-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await rolloutResponse.json()) as RolloutResponse;
      if (!rolloutResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics winner rollout could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The analytics winner rollout could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitRollback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRollout) {
      setError("There is no active winner rollout to roll back.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const rollbackResponse = await fetch(analyticsExperimentWinnerRolloutApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "rollback_winner_rollout",
          dashboardId,
          experimentId,
          rolloutId: activeRollout.id,
          expectedActiveRolloutRevision: activeRollout.rolloutRevision,
          privateNote,
          confirmationText: analyticsExperimentWinnerRollbackConfirmationText,
          idempotencyKey: `analytics-experiment-winner-rollback-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await rollbackResponse.json()) as RolloutResponse;
      if (!rollbackResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics winner rollout could not be rolled back.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The analytics winner rollout could not be rolled back.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form">
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Winner rollout</span>
          <strong>{experimentTitle}</strong>
          <p>
            Routes unmatched future assignment traffic to a chosen treatment variant after owner confirmation. Custom
            source and campaign routing rules still run first, and rollback keeps an audit trail.
          </p>
        </div>
      </div>
      {activeRollout ? (
        <form aria-label={`Rollback winner rollout for ${dashboardTitle}`} onSubmit={submitRollback}>
          <div className="admin-form-field admin-step-goal-field">
            <span>Active rollout</span>
            <p>
              {activeRollout.selectedVariantLabel ?? activeRollout.selectedVariantId} is routing unmatched traffic.
              Revision {activeRollout.rolloutRevision}.
            </p>
          </div>
          <label className="admin-form-field admin-step-goal-field">
            <span>Rollback note</span>
            <textarea
              value={privateNote}
              onChange={(event) => setPrivateNote(event.target.value)}
              rows={3}
              aria-label="Private rollback note"
            />
          </label>
          <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting}>
            {isSubmitting ? "Rolling back..." : "Rollback winner rollout"}
            <RotateCcw aria-hidden="true" />
          </button>
        </form>
      ) : (
        <form aria-label={`Route winner rollout for ${dashboardTitle}`} onSubmit={submitRollout}>
          <label className="admin-form-field">
            <span>Winner variant</span>
            <select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)}>
              {rolloutVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-form-field">
            <span>Evidence window</span>
            <select value={timeWindowKey} onChange={(event) => setTimeWindowKey(event.target.value as AnalyticsTimeWindowKey)}>
              {currentEvidenceByWindow.map((evidence) => (
                <option key={evidence.timeWindow.key} value={evidence.timeWindow.key}>
                  {evidence.timeWindow.label}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-form-field admin-step-goal-field">
            <span>Evidence snapshot</span>
            <p>
              Assignments: {selectedEvidence?.assignmentCount ?? 0}; sample size:{" "}
              {selectedEvidence?.conversionSampleSize ?? 0}; custom rules preserved: true.
            </p>
          </div>
          <label className="admin-form-field admin-step-goal-field">
            <span>Private note</span>
            <textarea
              value={privateNote}
              onChange={(event) => setPrivateNote(event.target.value)}
              rows={3}
              aria-label="Private rollout note"
            />
          </label>
          <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting || !selectedEvidence}>
            {isSubmitting ? "Routing..." : "Route winner rollout"}
            <Trophy aria-hidden="true" />
          </button>
        </form>
      )}
      {error ? (
        <div className="checkout-alert error admin-step-goal-field">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.rollout ? (
        <div className="checkout-alert success admin-step-goal-field">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Winner rollout replayed" : response.rollout.rolloutStatus.replaceAll("_", " ")}</strong>
            <span>
              {response.rollout.selectedVariantLabel ?? response.rollout.selectedVariantId}; traffic routing{" "}
              {String(response.rollout.trafficRoutingEnabled)}.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
