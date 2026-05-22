"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationProviderPollingReadinessApiRoute,
  analyticsNotificationProviderPollingReadinessConfirmationText,
  type AnalyticsNotificationProviderPollingReadinessEvidence,
} from "@/lib/analytics-notification-provider-polling-readiness";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationProviderPollingReadinessFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  notificationInboxStatus: string;
  notificationDispatchPreflightStatus: string;
  notificationProviderDomainReadinessStatus: string;
  notificationSendPayloadReadinessStatus: string;
  notificationDeliveryStatusWebhookReadinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationProviderPollingReadinessEvidence[];
};

type NotificationProviderPollingReadinessResponse = {
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
    deliveryResultReadinessId: string;
    deliveryStatusWebhookReadinessId: string;
    channelId: string;
    timeWindowKey: string;
    notificationProviderPollingReadinessDisposition: string;
    ownerProviderPollingReadinessRecorded: true;
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
    providerPollingEnabled: false;
    providerPollingRecorded: false;
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

export function AdminAnalyticsNotificationProviderPollingReadinessForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  notificationInboxStatus,
  notificationDispatchPreflightStatus,
  notificationProviderDomainReadinessStatus,
  notificationSendPayloadReadinessStatus,
  notificationDeliveryStatusWebhookReadinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationProviderPollingReadinessFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );
  const [notificationProviderPollingReadinessDisposition, setNotificationProviderPollingReadinessDisposition] = useState(
    selectedEvidence?.defaultProviderPollingReadinessDisposition ?? "blocked_pending_provider_polling_review",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationProviderPollingReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence?.latestDeliveryStatusWebhookReadinessRecord) {
      setError("A current analytics notification delivery-status-webhook readiness is required before provider-polling readiness evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(analyticsNotificationProviderPollingReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          inboxRecordId: selectedEvidence.latestDeliveryStatusWebhookReadinessRecord.inboxRecordId,
          dispatchPreflightId: selectedEvidence.latestDeliveryStatusWebhookReadinessRecord.dispatchPreflightId,
          providerDomainReadinessId: selectedEvidence.latestDeliveryStatusWebhookReadinessRecord.providerDomainReadinessId,
          sendPayloadReadinessId: selectedEvidence.latestDeliveryStatusWebhookReadinessRecord.sendPayloadReadinessId,
          deliveryStatusWebhookReadinessId: selectedEvidence.latestDeliveryStatusWebhookReadinessRecord.id,
          timeWindowKey: selectedEvidence.timeWindow.key,
          notificationProviderPollingReadinessDisposition,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedNotificationInboxStatus: notificationInboxStatus,
          expectedNotificationDispatchPreflightStatus: notificationDispatchPreflightStatus,
          expectedNotificationProviderDomainReadinessStatus: notificationProviderDomainReadinessStatus,
          expectedNotificationSendPayloadReadinessStatus: notificationSendPayloadReadinessStatus,
          expectedNotificationDeliveryStatusWebhookReadinessStatus: notificationDeliveryStatusWebhookReadinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationProviderPollingReadinessConfirmationText,
          idempotencyKey: `analytics-notification-provider-polling-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as NotificationProviderPollingReadinessResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification provider-polling readiness could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The analytics notification provider-polling readiness could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification provider-polling readiness evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification provider</span>
          <strong>Owner provider-polling readiness</strong>
          <p>
            Records redacted provider-polling readiness evidence only after a current owner delivery-status-webhook readiness exists. It
            does not configure providers, store provider secrets or sender credentials, verify sender domains, send owner
            email, enable provider polling, create Queue messages, store queue payload bodies, call providers, create
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
        <span>Delivery-status-webhook readiness snapshot</span>
        <p>
          Delivery-status-webhook readiness: {selectedEvidence?.latestDeliveryStatusWebhookReadinessRecord?.id ?? "missing"}; readiness current:{" "}
          {String(selectedEvidence?.deliveryStatusWebhookReadinessRecordCurrent ?? false)}; send payload:{" "}
          {selectedEvidence?.latestDeliveryStatusWebhookReadinessRecord?.sendPayloadReadinessId ?? "missing"}; inbox:{" "}
          {selectedEvidence?.latestDeliveryStatusWebhookReadinessRecord?.inboxRecordId ?? "missing"}; dispatch preflight:{" "}
          {selectedEvidence?.latestDeliveryStatusWebhookReadinessRecord?.dispatchPreflightId ?? "missing"}; provider/domain:{" "}
          {selectedEvidence?.latestDeliveryStatusWebhookReadinessRecord?.providerDomainReadinessId ?? "missing"}; delivery result:{" "}
          {selectedEvidence?.latestDeliveryStatusWebhookReadinessRecord?.deliveryResultReadinessId ?? "missing"}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Provider polling disposition</span>
        <select
          value={notificationProviderPollingReadinessDisposition}
          onChange={(event) =>
            setNotificationProviderPollingReadinessDisposition(event.target.value as typeof notificationProviderPollingReadinessDisposition)
          }
        >
          {(selectedEvidence?.supportedProviderPollingReadinessDispositions ?? []).map((disposition) => (
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
          placeholder="Private provider-polling readiness note, hashed before storage"
        />
      </label>
      <button
        type="submit"
        className="secondary-action admin-step-goal-field"
        disabled={
          isSubmitting ||
          !selectedEvidence?.latestDeliveryStatusWebhookReadinessRecord ||
          !selectedEvidence.deliveryStatusWebhookReadinessRecordCurrent
        }
      >
        {isSubmitting ? "Recording..." : "Record provider-polling readiness"}
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
              {response.duplicate ? "Provider-polling readiness replayed" : "Provider-polling readiness recorded"}
            </strong>
            <span>
              {response.record.timeWindowKey}; disposition{" "}
              {readableDisposition(response.record.notificationProviderPollingReadinessDisposition)}; email send enabled:{" "}
              {String(response.record.ownerEmailSendEnabled)}; queue dispatch enabled:{" "}
              {String(response.record.queueDispatchEnabled)}; provider polling enabled:{" "}
              {String(response.record.providerPollingEnabled)}; provider polling recorded:{" "}
              {String(response.record.providerPollingRecorded)}; queue consumer enabled:{" "}
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
