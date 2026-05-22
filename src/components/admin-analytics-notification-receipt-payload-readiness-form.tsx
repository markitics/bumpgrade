"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationReceiptPayloadReadinessApiRoute,
  analyticsNotificationReceiptPayloadReadinessConfirmationText,
  type AnalyticsNotificationReceiptPayloadReadinessEvidence,
} from "@/lib/analytics-notification-receipt-payload-readiness";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationReceiptPayloadReadinessFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  notificationInboxStatus: string;
  notificationDispatchPreflightStatus: string;
  notificationProviderDomainReadinessStatus: string;
  notificationSendPayloadReadinessStatus: string;
  notificationProviderPollingReadinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationReceiptPayloadReadinessEvidence[];
};

type NotificationReceiptPayloadReadinessResponse = {
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
    deliveryStatusWebhookReadinessId: string;
    providerPollingReadinessId: string;
    channelId: string;
    timeWindowKey: string;
    notificationReceiptPayloadReadinessDisposition: string;
    ownerReceiptPayloadReadinessRecorded: true;
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
    receiptPayloadEnabled: false;
    receiptPayloadRecorded: false;
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

export function AdminAnalyticsNotificationReceiptPayloadReadinessForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  notificationInboxStatus,
  notificationDispatchPreflightStatus,
  notificationProviderDomainReadinessStatus,
  notificationSendPayloadReadinessStatus,
  notificationProviderPollingReadinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationReceiptPayloadReadinessFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );
  const [notificationReceiptPayloadReadinessDisposition, setNotificationReceiptPayloadReadinessDisposition] = useState(
    selectedEvidence?.defaultReceiptPayloadReadinessDisposition ?? "blocked_pending_receipt_payload_review",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationReceiptPayloadReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence?.latestProviderPollingReadinessRecord) {
      setError("A current analytics notification provider-polling readiness is required before receipt-payload readiness evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(analyticsNotificationReceiptPayloadReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          inboxRecordId: selectedEvidence.latestProviderPollingReadinessRecord.inboxRecordId,
          dispatchPreflightId: selectedEvidence.latestProviderPollingReadinessRecord.dispatchPreflightId,
          providerDomainReadinessId: selectedEvidence.latestProviderPollingReadinessRecord.providerDomainReadinessId,
          sendPayloadReadinessId: selectedEvidence.latestProviderPollingReadinessRecord.sendPayloadReadinessId,
          providerPollingReadinessId: selectedEvidence.latestProviderPollingReadinessRecord.id,
          timeWindowKey: selectedEvidence.timeWindow.key,
          notificationReceiptPayloadReadinessDisposition,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedNotificationInboxStatus: notificationInboxStatus,
          expectedNotificationDispatchPreflightStatus: notificationDispatchPreflightStatus,
          expectedNotificationProviderDomainReadinessStatus: notificationProviderDomainReadinessStatus,
          expectedNotificationSendPayloadReadinessStatus: notificationSendPayloadReadinessStatus,
          expectedNotificationProviderPollingReadinessStatus: notificationProviderPollingReadinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationReceiptPayloadReadinessConfirmationText,
          idempotencyKey: `analytics-notification-receipt-payload-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as NotificationReceiptPayloadReadinessResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification receipt-payload readiness could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The analytics notification receipt-payload readiness could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification receipt-payload readiness evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification provider</span>
          <strong>Owner receipt-payload readiness</strong>
          <p>
            Records redacted receipt-payload readiness evidence only after a current owner provider-polling readiness exists. It
            does not configure providers, store provider secrets or sender credentials, verify sender domains, send owner
            email, enable receipt payload, create Queue messages, store queue payload bodies, call providers, create
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
        <span>Provider-polling readiness snapshot</span>
        <p>
          Provider-polling readiness: {selectedEvidence?.latestProviderPollingReadinessRecord?.id ?? "missing"}; readiness current:{" "}
          {String(selectedEvidence?.providerPollingReadinessRecordCurrent ?? false)}; send payload:{" "}
          {selectedEvidence?.latestProviderPollingReadinessRecord?.sendPayloadReadinessId ?? "missing"}; inbox:{" "}
          {selectedEvidence?.latestProviderPollingReadinessRecord?.inboxRecordId ?? "missing"}; dispatch preflight:{" "}
          {selectedEvidence?.latestProviderPollingReadinessRecord?.dispatchPreflightId ?? "missing"}; provider/domain:{" "}
          {selectedEvidence?.latestProviderPollingReadinessRecord?.providerDomainReadinessId ?? "missing"}; status webhook:{" "}
          {selectedEvidence?.latestProviderPollingReadinessRecord?.deliveryStatusWebhookReadinessId ?? "missing"}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Receipt payload disposition</span>
        <select
          value={notificationReceiptPayloadReadinessDisposition}
          onChange={(event) =>
            setNotificationReceiptPayloadReadinessDisposition(event.target.value as typeof notificationReceiptPayloadReadinessDisposition)
          }
        >
          {(selectedEvidence?.supportedReceiptPayloadReadinessDispositions ?? []).map((disposition) => (
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
          placeholder="Private receipt-payload readiness note, hashed before storage"
        />
      </label>
      <button
        type="submit"
        className="secondary-action admin-step-goal-field"
        disabled={
          isSubmitting ||
          !selectedEvidence?.latestProviderPollingReadinessRecord ||
          !selectedEvidence.providerPollingReadinessRecordCurrent
        }
      >
        {isSubmitting ? "Recording..." : "Record receipt-payload readiness"}
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
              {response.duplicate ? "Receipt-payload readiness replayed" : "Receipt-payload readiness recorded"}
            </strong>
            <span>
              {response.record.timeWindowKey}; disposition{" "}
              {readableDisposition(response.record.notificationReceiptPayloadReadinessDisposition)}; email send enabled:{" "}
              {String(response.record.ownerEmailSendEnabled)}; queue dispatch enabled:{" "}
              {String(response.record.queueDispatchEnabled)}; receipt payload enabled:{" "}
              {String(response.record.receiptPayloadEnabled)}; receipt payload recorded:{" "}
              {String(response.record.receiptPayloadRecorded)}; queue consumer enabled:{" "}
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
