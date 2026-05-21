"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationSendPayloadReadinessApiRoute,
  analyticsNotificationSendPayloadReadinessConfirmationText,
  type AnalyticsNotificationSendPayloadReadinessEvidence,
} from "@/lib/analytics-notification-send-payload-readiness";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationSendPayloadReadinessFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  notificationInboxStatus: string;
  notificationDispatchPreflightStatus: string;
  notificationProviderDomainReadinessStatus: string;
  notificationContentConsentReadinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationSendPayloadReadinessEvidence[];
};

type NotificationSendPayloadReadinessResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    inboxRecordId: string;
    dispatchPreflightId: string;
    providerDomainReadinessId: string;
    contentConsentReadinessId: string;
    channelId: string;
    timeWindowKey: string;
    notificationSendPayloadReadinessDisposition: string;
    ownerSendPayloadReadinessRecorded: true;
    payloadShapeReviewed: true;
    unsubscribeFooterReviewed: true;
    consentSuppressionRecheckReviewed: true;
    recipientScopeReviewed: true;
    auditCorrelationReviewed: true;
    retentionPolicyReviewed: true;
    ownerEmailSendEnabled: false;
    queueDispatchEnabled: false;
    providerMessageIdIncluded: false;
    providerConfigured: false;
    senderDomainVerified: false;
  };
};

function readableDisposition(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminAnalyticsNotificationSendPayloadReadinessForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  notificationInboxStatus,
  notificationDispatchPreflightStatus,
  notificationProviderDomainReadinessStatus,
  notificationContentConsentReadinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationSendPayloadReadinessFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );
  const [notificationSendPayloadReadinessDisposition, setNotificationSendPayloadReadinessDisposition] = useState(
    selectedEvidence?.defaultSendPayloadReadinessDisposition ?? "blocked_pending_send_payload_review",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationSendPayloadReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence?.latestContentConsentReadinessRecord) {
      setError("A current analytics notification content/consent readiness is required before send-payload readiness evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(analyticsNotificationSendPayloadReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          inboxRecordId: selectedEvidence.latestContentConsentReadinessRecord.inboxRecordId,
          dispatchPreflightId: selectedEvidence.latestContentConsentReadinessRecord.dispatchPreflightId,
          providerDomainReadinessId: selectedEvidence.latestContentConsentReadinessRecord.providerDomainReadinessId,
          contentConsentReadinessId: selectedEvidence.latestContentConsentReadinessRecord.id,
          timeWindowKey: selectedEvidence.timeWindow.key,
          notificationSendPayloadReadinessDisposition,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedNotificationInboxStatus: notificationInboxStatus,
          expectedNotificationDispatchPreflightStatus: notificationDispatchPreflightStatus,
          expectedNotificationProviderDomainReadinessStatus: notificationProviderDomainReadinessStatus,
          expectedNotificationContentConsentReadinessStatus: notificationContentConsentReadinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationSendPayloadReadinessConfirmationText,
          idempotencyKey: `analytics-notification-send-payload-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as NotificationSendPayloadReadinessResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification send-payload readiness could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The analytics notification send-payload readiness could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification send-payload readiness evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification provider</span>
          <strong>Owner send-payload readiness</strong>
          <p>
            Records redacted send-payload readiness evidence only after a current owner content/consent readiness exists. It
            does not configure providers, store provider secrets or sender credentials, verify sender domains, send owner
            email, dispatch queues, call providers, create customer alerts, include recipients or bodies, expose body
            templates or unsubscribe URLs, expose provider message IDs, route traffic, choose winners, or make revenue claims.
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
        <span>Send-payload readiness snapshot</span>
        <p>
          Content/consent readiness: {selectedEvidence?.latestContentConsentReadinessRecord?.id ?? "missing"}; readiness current:{" "}
          {String(selectedEvidence?.contentConsentReadinessRecordCurrent ?? false)}; inbox:{" "}
          {selectedEvidence?.latestContentConsentReadinessRecord?.inboxRecordId ?? "missing"}; dispatch preflight:{" "}
          {selectedEvidence?.latestContentConsentReadinessRecord?.dispatchPreflightId ?? "missing"}; provider/domain:{" "}
          {selectedEvidence?.latestContentConsentReadinessRecord?.providerDomainReadinessId ?? "missing"}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Send-payload disposition</span>
        <select
          value={notificationSendPayloadReadinessDisposition}
          onChange={(event) =>
            setNotificationSendPayloadReadinessDisposition(event.target.value as typeof notificationSendPayloadReadinessDisposition)
          }
        >
          {(selectedEvidence?.supportedSendPayloadReadinessDispositions ?? []).map((disposition) => (
            <option key={disposition} value={disposition}>
              {readableDisposition(disposition)}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-form-field admin-step-goal-field">
        <span>Private note</span>
        <textarea
          value={privateNote}
          onChange={(event) => setPrivateNote(event.target.value)}
          rows={3}
          placeholder="Private send-payload readiness note, hashed before storage"
        />
      </label>
      <button
        type="submit"
        className="secondary-action admin-step-goal-field"
        disabled={
          isSubmitting ||
          !selectedEvidence?.latestContentConsentReadinessRecord ||
          !selectedEvidence.contentConsentReadinessRecordCurrent
        }
      >
        {isSubmitting ? "Recording..." : "Record send-payload readiness"}
        <MailCheck aria-hidden="true" />
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
            <strong>{response.duplicate ? "Send-payload readiness replayed" : "Send-payload readiness recorded"}</strong>
            <span>
              {response.record.timeWindowKey}; disposition{" "}
              {readableDisposition(response.record.notificationSendPayloadReadinessDisposition)}; email send enabled:{" "}
              {String(response.record.ownerEmailSendEnabled)}; queue dispatch enabled:{" "}
              {String(response.record.queueDispatchEnabled)}; payload shape reviewed:{" "}
              {String(response.record.payloadShapeReviewed)}; unsubscribe reviewed:{" "}
              {String(response.record.unsubscribeFooterReviewed)}; consent and suppression recheck reviewed:{" "}
              {String(response.record.consentSuppressionRecheckReviewed)}; recipient scope reviewed:{" "}
              {String(response.record.recipientScopeReviewed)}.
            </span>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
      ) : null}
    </form>
  );
}
