"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationDeliveryStatusWebhookReadinessApiRoute,
  analyticsNotificationDeliveryStatusWebhookReadinessConfirmationText,
  type AnalyticsNotificationDeliveryStatusWebhookReadinessEvidence,
} from "@/lib/analytics-notification-delivery-status-webhook-readiness";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationDeliveryStatusWebhookReadinessFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  notificationInboxStatus: string;
  notificationDispatchPreflightStatus: string;
  notificationProviderDomainReadinessStatus: string;
  notificationSendPayloadReadinessStatus: string;
  notificationDeliveryResultReadinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationDeliveryStatusWebhookReadinessEvidence[];
};

type NotificationDeliveryStatusWebhookReadinessResponse = {
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
    deliveryAttemptReadinessId: string;
    deliveryResultReadinessId: string;
    channelId: string;
    timeWindowKey: string;
    notificationDeliveryStatusWebhookReadinessDisposition: string;
    ownerDeliveryStatusWebhookReadinessRecorded: true;
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
    deliveryStatusWebhookEnabled: false;
    deliveryStatusWebhookRecorded: false;
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

export function AdminAnalyticsNotificationDeliveryStatusWebhookReadinessForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  notificationInboxStatus,
  notificationDispatchPreflightStatus,
  notificationProviderDomainReadinessStatus,
  notificationSendPayloadReadinessStatus,
  notificationDeliveryResultReadinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationDeliveryStatusWebhookReadinessFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );
  const [notificationDeliveryStatusWebhookReadinessDisposition, setNotificationDeliveryStatusWebhookReadinessDisposition] = useState(
    selectedEvidence?.defaultDeliveryStatusWebhookReadinessDisposition ?? "blocked_pending_delivery_status_webhook_review",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationDeliveryStatusWebhookReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence?.latestDeliveryResultReadinessRecord) {
      setError("A current analytics notification delivery-result readiness is required before delivery-status-webhook readiness evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(analyticsNotificationDeliveryStatusWebhookReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          inboxRecordId: selectedEvidence.latestDeliveryResultReadinessRecord.inboxRecordId,
          dispatchPreflightId: selectedEvidence.latestDeliveryResultReadinessRecord.dispatchPreflightId,
          providerDomainReadinessId: selectedEvidence.latestDeliveryResultReadinessRecord.providerDomainReadinessId,
          sendPayloadReadinessId: selectedEvidence.latestDeliveryResultReadinessRecord.sendPayloadReadinessId,
          deliveryResultReadinessId: selectedEvidence.latestDeliveryResultReadinessRecord.id,
          timeWindowKey: selectedEvidence.timeWindow.key,
          notificationDeliveryStatusWebhookReadinessDisposition,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedNotificationInboxStatus: notificationInboxStatus,
          expectedNotificationDispatchPreflightStatus: notificationDispatchPreflightStatus,
          expectedNotificationProviderDomainReadinessStatus: notificationProviderDomainReadinessStatus,
          expectedNotificationSendPayloadReadinessStatus: notificationSendPayloadReadinessStatus,
          expectedNotificationDeliveryResultReadinessStatus: notificationDeliveryResultReadinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationDeliveryStatusWebhookReadinessConfirmationText,
          idempotencyKey: `analytics-notification-delivery-status-webhook-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as NotificationDeliveryStatusWebhookReadinessResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification delivery-status-webhook readiness could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The analytics notification delivery-status-webhook readiness could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification delivery-status-webhook readiness evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification provider</span>
          <strong>Owner delivery-status-webhook readiness</strong>
          <p>
            Records redacted delivery-status-webhook readiness evidence only after a current owner delivery-result readiness exists. It
            does not configure providers, store provider secrets or sender credentials, verify sender domains, send owner
            email, enable delivery status webhooks, create Queue messages, store queue payload bodies, call providers, create
            customer alerts, include recipients or bodies, expose body templates or unsubscribe URLs, create provider
            responses, expose provider message IDs, create delivery receipts, process status webhooks, poll providers, route
            traffic, choose winners, or make revenue claims.
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
        <span>Delivery-result readiness snapshot</span>
        <p>
          Delivery-result readiness: {selectedEvidence?.latestDeliveryResultReadinessRecord?.id ?? "missing"}; readiness current:{" "}
          {String(selectedEvidence?.deliveryResultReadinessRecordCurrent ?? false)}; send payload:{" "}
          {selectedEvidence?.latestDeliveryResultReadinessRecord?.sendPayloadReadinessId ?? "missing"}; inbox:{" "}
          {selectedEvidence?.latestDeliveryResultReadinessRecord?.inboxRecordId ?? "missing"}; dispatch preflight:{" "}
          {selectedEvidence?.latestDeliveryResultReadinessRecord?.dispatchPreflightId ?? "missing"}; provider/domain:{" "}
          {selectedEvidence?.latestDeliveryResultReadinessRecord?.providerDomainReadinessId ?? "missing"}; delivery attempt:{" "}
          {selectedEvidence?.latestDeliveryResultReadinessRecord?.deliveryAttemptReadinessId ?? "missing"}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Delivery-status webhook disposition</span>
        <select
          value={notificationDeliveryStatusWebhookReadinessDisposition}
          onChange={(event) =>
            setNotificationDeliveryStatusWebhookReadinessDisposition(event.target.value as typeof notificationDeliveryStatusWebhookReadinessDisposition)
          }
        >
          {(selectedEvidence?.supportedDeliveryStatusWebhookReadinessDispositions ?? []).map((disposition) => (
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
        />
      </label>
      <button
        type="submit"
        className="secondary-action admin-step-goal-field"
        disabled={
          isSubmitting ||
          !selectedEvidence?.latestDeliveryResultReadinessRecord ||
          !selectedEvidence.deliveryResultReadinessRecordCurrent
        }
      >
        {isSubmitting ? "Recording..." : "Record delivery-status-webhook readiness"}
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
            <strong>
              {response.duplicate ? "Delivery-status webhook readiness replayed" : "Delivery-status webhook readiness recorded"}
            </strong>
            <span>
              {response.record.timeWindowKey}; disposition{" "}
              {readableDisposition(response.record.notificationDeliveryStatusWebhookReadinessDisposition)}; email send enabled:{" "}
              {String(response.record.ownerEmailSendEnabled)}; queue dispatch enabled:{" "}
              {String(response.record.queueDispatchEnabled)}; Delivery status webhook enabled:{" "}
              {String(response.record.deliveryStatusWebhookEnabled)}; delivery status webhook recorded:{" "}
              {String(response.record.deliveryStatusWebhookRecorded)}; queue consumer enabled:{" "}
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
