"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationQueueProducerReadinessApiRoute,
  analyticsNotificationQueueProducerReadinessConfirmationText,
  type AnalyticsNotificationQueueProducerReadinessEvidence,
} from "@/lib/analytics-notification-queue-producer-readiness";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationQueueProducerReadinessFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  notificationInboxStatus: string;
  notificationDispatchPreflightStatus: string;
  notificationProviderDomainReadinessStatus: string;
  notificationSendPayloadReadinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationQueueProducerReadinessEvidence[];
};

type NotificationQueueProducerReadinessResponse = {
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
    sendPayloadReadinessId: string;
    channelId: string;
    timeWindowKey: string;
    notificationQueueProducerReadinessDisposition: string;
    ownerQueueProducerReadinessRecorded: true;
    queueBindingReviewed: true;
    producerModeReviewed: true;
    idempotencyPolicyReviewed: true;
    retryDeadLetterPolicyReviewed: true;
    consumerDependencyReviewed: true;
    backpressurePolicyReviewed: true;
    auditCorrelationReviewed: true;
    retentionPolicyReviewed: true;
    ownerEmailSendEnabled: false;
    queueDispatchEnabled: false;
    queueProducerEnabled: false;
    queueMessageCreated: false;
    queuePayloadBodyCreated: false;
    providerMessageIdIncluded: false;
    providerConfigured: false;
    senderDomainVerified: false;
  };
};

function readableDisposition(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminAnalyticsNotificationQueueProducerReadinessForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  notificationInboxStatus,
  notificationDispatchPreflightStatus,
  notificationProviderDomainReadinessStatus,
  notificationSendPayloadReadinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationQueueProducerReadinessFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );
  const [notificationQueueProducerReadinessDisposition, setNotificationQueueProducerReadinessDisposition] = useState(
    selectedEvidence?.defaultQueueProducerReadinessDisposition ?? "blocked_pending_queue_producer_review",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationQueueProducerReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence?.latestSendPayloadReadinessRecord) {
      setError("A current analytics notification send-payload readiness is required before queue-producer readiness evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(analyticsNotificationQueueProducerReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          inboxRecordId: selectedEvidence.latestSendPayloadReadinessRecord.inboxRecordId,
          dispatchPreflightId: selectedEvidence.latestSendPayloadReadinessRecord.dispatchPreflightId,
          providerDomainReadinessId: selectedEvidence.latestSendPayloadReadinessRecord.providerDomainReadinessId,
          sendPayloadReadinessId: selectedEvidence.latestSendPayloadReadinessRecord.id,
          timeWindowKey: selectedEvidence.timeWindow.key,
          notificationQueueProducerReadinessDisposition,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedNotificationInboxStatus: notificationInboxStatus,
          expectedNotificationDispatchPreflightStatus: notificationDispatchPreflightStatus,
          expectedNotificationProviderDomainReadinessStatus: notificationProviderDomainReadinessStatus,
          expectedNotificationSendPayloadReadinessStatus: notificationSendPayloadReadinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationQueueProducerReadinessConfirmationText,
          idempotencyKey: `analytics-notification-queue-producer-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as NotificationQueueProducerReadinessResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification queue-producer readiness could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The analytics notification queue-producer readiness could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification queue-producer readiness evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification provider</span>
          <strong>Owner queue-producer readiness</strong>
          <p>
            Records redacted queue-producer readiness evidence only after a current owner send-payload readiness exists. It
            does not configure providers, store provider secrets or sender credentials, verify sender domains, send owner
            email, enable Queue producers, create Queue messages, store queue payload bodies, call providers, create
            customer alerts, include recipients or bodies, expose body templates or unsubscribe URLs, expose provider
            message IDs, route traffic, choose winners, or make revenue claims.
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
        <span>Queue-producer readiness snapshot</span>
        <p>
          Send-payload readiness: {selectedEvidence?.latestSendPayloadReadinessRecord?.id ?? "missing"}; readiness current:{" "}
          {String(selectedEvidence?.sendPayloadReadinessRecordCurrent ?? false)}; inbox:{" "}
          {selectedEvidence?.latestSendPayloadReadinessRecord?.inboxRecordId ?? "missing"}; dispatch preflight:{" "}
          {selectedEvidence?.latestSendPayloadReadinessRecord?.dispatchPreflightId ?? "missing"}; provider/domain:{" "}
          {selectedEvidence?.latestSendPayloadReadinessRecord?.providerDomainReadinessId ?? "missing"}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Queue-producer disposition</span>
        <select
          value={notificationQueueProducerReadinessDisposition}
          onChange={(event) =>
            setNotificationQueueProducerReadinessDisposition(event.target.value as typeof notificationQueueProducerReadinessDisposition)
          }
        >
          {(selectedEvidence?.supportedQueueProducerReadinessDispositions ?? []).map((disposition) => (
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
          placeholder="Private queue-producer readiness note, hashed before storage"
        />
      </label>
      <button
        type="submit"
        className="secondary-action admin-step-goal-field"
        disabled={
          isSubmitting ||
          !selectedEvidence?.latestSendPayloadReadinessRecord ||
          !selectedEvidence.sendPayloadReadinessRecordCurrent
        }
      >
        {isSubmitting ? "Recording..." : "Record queue-producer readiness"}
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
            <strong>{response.duplicate ? "Queue-producer readiness replayed" : "Queue-producer readiness recorded"}</strong>
            <span>
              {response.record.timeWindowKey}; disposition{" "}
              {readableDisposition(response.record.notificationQueueProducerReadinessDisposition)}; email send enabled:{" "}
              {String(response.record.ownerEmailSendEnabled)}; queue dispatch enabled:{" "}
              {String(response.record.queueDispatchEnabled)}; Queue producer enabled:{" "}
              {String(response.record.queueProducerEnabled)}; queue message created:{" "}
              {String(response.record.queueMessageCreated)}; queue payload body created:{" "}
              {String(response.record.queuePayloadBodyCreated)}; binding reviewed:{" "}
              {String(response.record.queueBindingReviewed)}; producer mode reviewed:{" "}
              {String(response.record.producerModeReviewed)}; retry/dead-letter reviewed:{" "}
              {String(response.record.retryDeadLetterPolicyReviewed)}.
            </span>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
      ) : null}
    </form>
  );
}
