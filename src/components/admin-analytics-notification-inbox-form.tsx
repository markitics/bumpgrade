"use client";

import { AlertCircle, Bell, CheckCircle2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationInboxApiRoute,
  analyticsNotificationInboxConfirmationText,
  type AnalyticsNotificationInboxEvidence,
} from "@/lib/analytics-notification-inbox";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationInboxFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationInboxEvidence[];
};

type NotificationInboxResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    channelId: string;
    timeWindowKey: string;
    expectedAlertThresholdCount: number;
    expectedConversionSampleSize: number;
    adminInboxRecordCreated: true;
    ownerEmailSendEnabled: false;
    queueDispatchEnabled: false;
  };
};

export function AdminAnalyticsNotificationInboxForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationInboxFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationInboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence) {
      setError("Analytics notification readiness evidence is not available.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const inboxResponse = await fetch(analyticsNotificationInboxApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          timeWindowKey: selectedEvidence.timeWindow.key,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationInboxConfirmationText,
          idempotencyKey: `analytics-notification-inbox-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await inboxResponse.json()) as NotificationInboxResponse;
      if (!inboxResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification inbox record could not be created.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The analytics notification inbox record could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification inbox evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification inbox</span>
          <strong>Owner inbox record</strong>
          <p>
            Records owner-visible analytics notification evidence with the selected fixed window, threshold review, and
            sample-size caveat. It does not send email, dispatch queues, create customer alerts, or route traffic.
          </p>
        </div>
      </div>
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
      <div className="admin-form-field admin-step-goal-field">
        <span>Readiness snapshot</span>
        <p>
          {readinessStatus.replaceAll("_", " ")}; thresholds: {alertThresholdCount}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
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
        {isSubmitting ? "Recording..." : "Record notification inbox"}
        <Bell aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error admin-step-goal-field">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.record ? (
        <div className="checkout-alert success admin-step-goal-field">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Notification inbox replayed" : "Notification inbox recorded"}</strong>
            <span>
              {response.record.timeWindowKey}; email send enabled: {String(response.record.ownerEmailSendEnabled)};
              queue dispatch enabled: {String(response.record.queueDispatchEnabled)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
