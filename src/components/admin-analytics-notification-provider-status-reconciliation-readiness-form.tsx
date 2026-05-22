"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationProviderStatusReconciliationReadinessApiRoute,
  analyticsNotificationProviderStatusReconciliationReadinessConfirmationText,
  type AnalyticsNotificationProviderStatusReconciliationReadinessEvidence,
} from "@/lib/analytics-notification-provider-status-reconciliation-readiness";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationProviderStatusReconciliationReadinessFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  notificationInboxStatus: string;
  notificationDispatchPreflightStatus: string;
  notificationProviderDomainReadinessStatus: string;
  notificationSendPayloadReadinessStatus: string;
  notificationDeliveryReceiptReadinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationProviderStatusReconciliationReadinessEvidence[];
};

type NotificationProviderStatusReconciliationReadinessResponse = {
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
    receiptPayloadReadinessId: string;
    deliveryReceiptReadinessId: string;
    channelId: string;
    timeWindowKey: string;
    notificationProviderStatusReconciliationReadinessDisposition: string;
    ownerProviderStatusReconciliationReadinessRecorded: true;
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
    providerStatusReconciliationEnabled: false;
    providerStatusReconciliationRecorded: false;
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

export function AdminAnalyticsNotificationProviderStatusReconciliationReadinessForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  notificationInboxStatus,
  notificationDispatchPreflightStatus,
  notificationProviderDomainReadinessStatus,
  notificationSendPayloadReadinessStatus,
  notificationDeliveryReceiptReadinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationProviderStatusReconciliationReadinessFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );
  const [notificationProviderStatusReconciliationReadinessDisposition, setNotificationProviderStatusReconciliationReadinessDisposition] = useState(
    selectedEvidence?.defaultProviderStatusReconciliationReadinessDisposition ?? "blocked_pending_provider_status_reconciliation_review",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationProviderStatusReconciliationReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence?.latestDeliveryReceiptReadinessRecord) {
      setError("A current analytics notification delivery-receipt readiness is required before provider-status-reconciliation readiness evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(analyticsNotificationProviderStatusReconciliationReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          inboxRecordId: selectedEvidence.latestDeliveryReceiptReadinessRecord.inboxRecordId,
          dispatchPreflightId: selectedEvidence.latestDeliveryReceiptReadinessRecord.dispatchPreflightId,
          providerDomainReadinessId: selectedEvidence.latestDeliveryReceiptReadinessRecord.providerDomainReadinessId,
          sendPayloadReadinessId: selectedEvidence.latestDeliveryReceiptReadinessRecord.sendPayloadReadinessId,
          deliveryReceiptReadinessId: selectedEvidence.latestDeliveryReceiptReadinessRecord.id,
          timeWindowKey: selectedEvidence.timeWindow.key,
          notificationProviderStatusReconciliationReadinessDisposition,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedNotificationInboxStatus: notificationInboxStatus,
          expectedNotificationDispatchPreflightStatus: notificationDispatchPreflightStatus,
          expectedNotificationProviderDomainReadinessStatus: notificationProviderDomainReadinessStatus,
          expectedNotificationSendPayloadReadinessStatus: notificationSendPayloadReadinessStatus,
          expectedNotificationDeliveryReceiptReadinessStatus: notificationDeliveryReceiptReadinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationProviderStatusReconciliationReadinessConfirmationText,
          idempotencyKey: `analytics-notification-provider-status-reconciliation-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as NotificationProviderStatusReconciliationReadinessResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification provider-status-reconciliation readiness could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The analytics notification provider-status-reconciliation readiness could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification provider-status-reconciliation readiness evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification provider</span>
          <strong>Owner provider-status-reconciliation readiness</strong>
          <p>
            Records redacted provider-status-reconciliation readiness evidence only after a current owner delivery-receipt readiness exists. It
            does not configure providers, store provider secrets or sender credentials, verify sender domains, send owner
            email, enable provider status reconciliation, create Queue messages, store queue payload bodies, call providers, create
            customer alerts, include recipients or bodies, expose body templates or unsubscribe URLs, create provider
            responses, expose provider message IDs, create provider status reconciliations, process status webhooks, poll providers, route
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
        <span>Delivery-receipt readiness snapshot</span>
        <p>
          Delivery-receipt readiness: {selectedEvidence?.latestDeliveryReceiptReadinessRecord?.id ?? "missing"}; readiness current:{" "}
          {String(selectedEvidence?.deliveryReceiptReadinessRecordCurrent ?? false)}; send payload:{" "}
          {selectedEvidence?.latestDeliveryReceiptReadinessRecord?.sendPayloadReadinessId ?? "missing"}; inbox:{" "}
          {selectedEvidence?.latestDeliveryReceiptReadinessRecord?.inboxRecordId ?? "missing"}; dispatch preflight:{" "}
          {selectedEvidence?.latestDeliveryReceiptReadinessRecord?.dispatchPreflightId ?? "missing"}; provider/domain:{" "}
          {selectedEvidence?.latestDeliveryReceiptReadinessRecord?.providerDomainReadinessId ?? "missing"}; receipt payload:{" "}
          {selectedEvidence?.latestDeliveryReceiptReadinessRecord?.receiptPayloadReadinessId ?? "missing"}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Provider status reconciliation disposition</span>
        <select
          value={notificationProviderStatusReconciliationReadinessDisposition}
          onChange={(event) =>
            setNotificationProviderStatusReconciliationReadinessDisposition(event.target.value as typeof notificationProviderStatusReconciliationReadinessDisposition)
          }
        >
          {(selectedEvidence?.supportedProviderStatusReconciliationReadinessDispositions ?? []).map((disposition) => (
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
          placeholder="Private provider-status-reconciliation readiness note, hashed before storage"
        />
      </label>
      <button
        type="submit"
        className="secondary-action admin-step-goal-field"
        disabled={
          isSubmitting ||
          !selectedEvidence?.latestDeliveryReceiptReadinessRecord ||
          !selectedEvidence.deliveryReceiptReadinessRecordCurrent
        }
      >
        {isSubmitting ? "Recording..." : "Record provider-status-reconciliation readiness"}
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
              {response.duplicate ? "Provider-status-reconciliation readiness replayed" : "Provider-status-reconciliation readiness recorded"}
            </strong>
            <span>
              {response.record.timeWindowKey}; disposition{" "}
              {readableDisposition(response.record.notificationProviderStatusReconciliationReadinessDisposition)}; email send enabled:{" "}
              {String(response.record.ownerEmailSendEnabled)}; queue dispatch enabled:{" "}
              {String(response.record.queueDispatchEnabled)}; provider status reconciliation enabled:{" "}
              {String(response.record.providerStatusReconciliationEnabled)}; provider status reconciliation recorded:{" "}
              {String(response.record.providerStatusReconciliationRecorded)}; queue consumer enabled:{" "}
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
