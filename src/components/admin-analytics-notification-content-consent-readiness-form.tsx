"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  analyticsNotificationContentConsentReadinessApiRoute,
  analyticsNotificationContentConsentReadinessConfirmationText,
  type AnalyticsNotificationContentConsentReadinessEvidence,
} from "@/lib/analytics-notification-content-consent-readiness";
import type { AnalyticsTimeWindowKey } from "@/lib/analytics-time-windows";

type AdminAnalyticsNotificationContentConsentReadinessFormProps = {
  dashboardId: string;
  dashboardTitle: string;
  dashboardRevisionId: string;
  readinessId: string;
  readinessStatus: string;
  notificationInboxStatus: string;
  notificationDispatchPreflightStatus: string;
  notificationProviderDomainReadinessStatus: string;
  channelId: string;
  ownerReviewStatus: string;
  alertThresholdCount: number;
  currentEvidenceByWindow: AnalyticsNotificationContentConsentReadinessEvidence[];
};

type NotificationContentConsentReadinessResponse = {
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
    channelId: string;
    timeWindowKey: string;
    notificationContentConsentReadinessDisposition: string;
    ownerContentConsentReadinessRecorded: true;
    bodyTemplateReviewed: true;
    unsubscribeLinkReviewed: true;
    rateLimitReviewed: true;
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

export function AdminAnalyticsNotificationContentConsentReadinessForm({
  dashboardId,
  dashboardTitle,
  dashboardRevisionId,
  readinessId,
  readinessStatus,
  notificationInboxStatus,
  notificationDispatchPreflightStatus,
  notificationProviderDomainReadinessStatus,
  channelId,
  ownerReviewStatus,
  alertThresholdCount,
  currentEvidenceByWindow,
}: AdminAnalyticsNotificationContentConsentReadinessFormProps) {
  const [timeWindowKey, setTimeWindowKey] = useState<AnalyticsTimeWindowKey>(
    currentEvidenceByWindow[0]?.timeWindow.key ?? "all",
  );
  const selectedEvidence = useMemo(
    () => currentEvidenceByWindow.find((candidate) => candidate.timeWindow.key === timeWindowKey) ?? currentEvidenceByWindow[0],
    [currentEvidenceByWindow, timeWindowKey],
  );
  const [notificationContentConsentReadinessDisposition, setNotificationContentConsentReadinessDisposition] = useState(
    selectedEvidence?.defaultContentConsentReadinessDisposition ?? "blocked_pending_content_consent_review",
  );
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<NotificationContentConsentReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence?.latestProviderDomainReadinessRecord) {
      setError("A current analytics notification provider/domain readiness is required before content/consent readiness evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(analyticsNotificationContentConsentReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dashboardId,
          readinessId,
          channelId,
          inboxRecordId: selectedEvidence.latestProviderDomainReadinessRecord.inboxRecordId,
          dispatchPreflightId: selectedEvidence.latestProviderDomainReadinessRecord.dispatchPreflightId,
          providerDomainReadinessId: selectedEvidence.latestProviderDomainReadinessRecord.id,
          timeWindowKey: selectedEvidence.timeWindow.key,
          notificationContentConsentReadinessDisposition,
          expectedDashboardRevisionId: dashboardRevisionId,
          expectedReadinessStatus: readinessStatus,
          expectedNotificationInboxStatus: notificationInboxStatus,
          expectedNotificationDispatchPreflightStatus: notificationDispatchPreflightStatus,
          expectedNotificationProviderDomainReadinessStatus: notificationProviderDomainReadinessStatus,
          expectedOwnerReviewStatus: ownerReviewStatus,
          expectedAlertThresholdCount: alertThresholdCount,
          expectedConversionSampleSize: selectedEvidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNote,
          confirmationText: analyticsNotificationContentConsentReadinessConfirmationText,
          idempotencyKey: `analytics-notification-content-consent-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as NotificationContentConsentReadinessResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The analytics notification content/consent readiness could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The analytics notification content/consent readiness could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record analytics notification content/consent readiness evidence for ${dashboardTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Notification provider</span>
          <strong>Owner content/consent readiness</strong>
          <p>
            Records redacted content/consent readiness evidence only after a current owner provider/domain readiness exists. It
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
        <span>Content/consent readiness snapshot</span>
        <p>
          Provider/domain readiness: {selectedEvidence?.latestProviderDomainReadinessRecord?.id ?? "missing"}; readiness current:{" "}
          {String(selectedEvidence?.providerDomainReadinessRecordCurrent ?? false)}; inbox:{" "}
          {selectedEvidence?.latestProviderDomainReadinessRecord?.inboxRecordId ?? "missing"}; dispatch preflight:{" "}
          {selectedEvidence?.latestProviderDomainReadinessRecord?.dispatchPreflightId ?? "missing"}; sample size:{" "}
          {selectedEvidence?.conversionSampleSize ?? 0}; channel: {channelId}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Content/consent disposition</span>
        <select
          value={notificationContentConsentReadinessDisposition}
          onChange={(event) =>
            setNotificationContentConsentReadinessDisposition(event.target.value as typeof notificationContentConsentReadinessDisposition)
          }
        >
          {(selectedEvidence?.supportedContentConsentReadinessDispositions ?? []).map((disposition) => (
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
          !selectedEvidence?.latestProviderDomainReadinessRecord ||
          !selectedEvidence.providerDomainReadinessRecordCurrent
        }
      >
        {isSubmitting ? "Recording..." : "Record content/consent readiness"}
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
            <strong>{response.duplicate ? "Content/consent readiness replayed" : "Content/consent readiness recorded"}</strong>
            <span>
              {response.record.timeWindowKey}; disposition{" "}
              {readableDisposition(response.record.notificationContentConsentReadinessDisposition)}; email send enabled:{" "}
              {String(response.record.ownerEmailSendEnabled)}; queue dispatch enabled:{" "}
              {String(response.record.queueDispatchEnabled)}; body template reviewed:{" "}
              {String(response.record.bodyTemplateReviewed)}; unsubscribe reviewed:{" "}
              {String(response.record.unsubscribeLinkReviewed)}; rate limit reviewed:{" "}
              {String(response.record.rateLimitReviewed)}.
            </span>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
      ) : null}
    </form>
  );
}
