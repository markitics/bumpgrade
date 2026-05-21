"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationDeliveryAttemptReadinessApiRoute,
  analyticsNotificationDeliveryAttemptReadinessConfirmationText,
  type AnalyticsNotificationDeliveryAttemptReadinessEvidence,
} from "@/lib/analytics-notification-delivery-attempt-readiness";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationDeliveryAttemptReadinessFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  notificationInboxStatus: string;
  notificationDispatchPreflightStatus: string;
  notificationProviderDomainReadinessStatus: string;
  notificationSendPayloadReadinessStatus: string;
  notificationProviderCallReadinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationDeliveryAttemptReadinessEvidence[];
};

type NotificationDeliveryAttemptReadinessResponse = {
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
    providerCallReadinessId: string;
    channelId: string;
    timeWindowKey: string;
    notificationDeliveryAttemptReadinessDisposition: string;
    ownerDeliveryAttemptReadinessRecorded: true;
    queueBindingReviewed: true;
    consumerModeReviewed: true;
    producerDependencyReviewed: true;
    payloadReadPolicyReviewed: true;
    ackPolicyReviewed: true;
    idempotencyPolicyReviewed: true;
    retryDeadLetterPolicyReviewed: true;
    providerHandoffDependencyReviewed: true;
    backpressurePolicyReviewed: true;
    auditCorrelationReviewed: true;
    retentionPolicyReviewed: true;
    ownerEmailSendEnabled: false;
    queueDispatchEnabled: false;
    queueProducerEnabled: false;
    queueConsumerEnabled: false;
    deliveryAttemptEnabled: false;
    deliveryAttempted: false;
    queueMessageCreated: false;
    queueMessageConsumed: false;
    queueMessageAcknowledged: false;
    retryDeadLetterRowCreated: false;
    queuePayloadBodyRead: false;
    queuePayloadBodyCreated: false;
    providerMessageIdIncluded: false;
    providerConfigured: false;
    senderDomainVerified: false;
  };
};

function readableDisposition(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminAnalyticsNotificationDeliveryAttemptReadinessForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  notificationInboxStatus,
  notificationDispatchPreflightStatus,
  notificationProviderDomainReadinessStatus,
  notificationSendPayloadReadinessStatus,
  notificationProviderCallReadinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationDeliveryAttemptReadinessFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );
  const [notificationDeliveryAttemptReadinessDisposition, setNotificationDeliveryAttemptReadinessDisposition] = useState(
    selectedEvidence?.defaultDeliveryAttemptReadinessDisposition ?? "blocked_pending_delivery_attempt_review",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationDeliveryAttemptReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence?.latestProviderCallReadinessRecord) {
      setError("A current analytics notification provider-call readiness is required before delivery-attempt readiness evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(analyticsNotificationDeliveryAttemptReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          inboxRecordId: selectedEvidence.latestProviderCallReadinessRecord.inboxRecordId,
          dispatchPreflightId: selectedEvidence.latestProviderCallReadinessRecord.dispatchPreflightId,
          providerDomainReadinessId: selectedEvidence.latestProviderCallReadinessRecord.providerDomainReadinessId,
          sendPayloadReadinessId: selectedEvidence.latestProviderCallReadinessRecord.sendPayloadReadinessId,
          providerCallReadinessId: selectedEvidence.latestProviderCallReadinessRecord.id,
          timeWindowKey: selectedEvidence.timeWindow.key,
          notificationDeliveryAttemptReadinessDisposition,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedNotificationInboxStatus: notificationInboxStatus,
          expectedNotificationDispatchPreflightStatus: notificationDispatchPreflightStatus,
          expectedNotificationProviderDomainReadinessStatus: notificationProviderDomainReadinessStatus,
          expectedNotificationSendPayloadReadinessStatus: notificationSendPayloadReadinessStatus,
          expectedNotificationProviderCallReadinessStatus: notificationProviderCallReadinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationDeliveryAttemptReadinessConfirmationText,
          idempotencyKey: `analytics-notification-delivery-attempt-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as NotificationDeliveryAttemptReadinessResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification delivery-attempt readiness could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The analytics notification delivery-attempt readiness could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification delivery-attempt readiness evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification provider</span>
          <strong>Owner delivery-attempt readiness</strong>
          <p>
            Records redacted delivery-attempt readiness evidence only after a current owner provider-call readiness exists. It
            does not configure providers, store provider secrets or sender credentials, verify sender domains, send owner
            email, enable delivery attempts, create Queue messages, store queue payload bodies, call providers, create
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
        <span>Provider-call readiness snapshot</span>
        <p>
          Provider-call readiness: {selectedEvidence?.latestProviderCallReadinessRecord?.id ?? "missing"}; readiness current:{" "}
          {String(selectedEvidence?.providerCallReadinessRecordCurrent ?? false)}; send payload:{" "}
          {selectedEvidence?.latestProviderCallReadinessRecord?.sendPayloadReadinessId ?? "missing"}; inbox:{" "}
          {selectedEvidence?.latestProviderCallReadinessRecord?.inboxRecordId ?? "missing"}; dispatch preflight:{" "}
          {selectedEvidence?.latestProviderCallReadinessRecord?.dispatchPreflightId ?? "missing"}; provider/domain:{" "}
          {selectedEvidence?.latestProviderCallReadinessRecord?.providerDomainReadinessId ?? "missing"}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Delivery-attempt disposition</span>
        <select
          value={notificationDeliveryAttemptReadinessDisposition}
          onChange={(event) =>
            setNotificationDeliveryAttemptReadinessDisposition(event.target.value as typeof notificationDeliveryAttemptReadinessDisposition)
          }
        >
          {(selectedEvidence?.supportedDeliveryAttemptReadinessDispositions ?? []).map((disposition) => (
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
          placeholder="Private delivery-attempt readiness note, hashed before storage"
        />
      </label>
      <button
        type="submit"
        className="secondary-action admin-step-goal-field"
        disabled={
          isSubmitting ||
          !selectedEvidence?.latestProviderCallReadinessRecord ||
          !selectedEvidence.providerCallReadinessRecordCurrent
        }
      >
        {isSubmitting ? "Recording..." : "Record delivery-attempt readiness"}
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
            <strong>{response.duplicate ? "Delivery-attempt readiness replayed" : "Delivery-attempt readiness recorded"}</strong>
            <span>
              {response.record.timeWindowKey}; disposition{" "}
              {readableDisposition(response.record.notificationDeliveryAttemptReadinessDisposition)}; email send enabled:{" "}
              {String(response.record.ownerEmailSendEnabled)}; queue dispatch enabled:{" "}
              {String(response.record.queueDispatchEnabled)}; Delivery attempt enabled:{" "}
              {String(response.record.deliveryAttemptEnabled)}; delivery attempted:{" "}
              {String(response.record.deliveryAttempted)}; queue consumer enabled:{" "}
              {String(response.record.queueConsumerEnabled)}; queue message created:{" "}
              {String(response.record.queueMessageCreated)}; queue payload body created:{" "}
              {String(response.record.queuePayloadBodyCreated)}; message consumed:{" "}
              {String(response.record.queueMessageConsumed)}; message acknowledged:{" "}
              {String(response.record.queueMessageAcknowledged)}; payload body read:{" "}
              {String(response.record.queuePayloadBodyRead)}; binding reviewed:{" "}
              {String(response.record.queueBindingReviewed)}; consumer mode reviewed:{" "}
              {String(response.record.consumerModeReviewed)}; retry/dead-letter reviewed:{" "}
              {String(response.record.retryDeadLetterPolicyReviewed)}.
            </span>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
      ) : null}
    </form>
  );
}
