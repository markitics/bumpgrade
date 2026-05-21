"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  affiliatePartnerNotificationProviderReadinessRecordApiRoute,
  affiliatePartnerNotificationProviderReadinessRecordConfirmationText,
  type AffiliatePartnerNotificationProviderReadinessEvidence,
} from "@/lib/affiliate-partner-notification-provider-readiness-records";

type AdminAffiliateNotificationProviderReadinessRecordFormProps = {
  evidence: AffiliatePartnerNotificationProviderReadinessEvidence;
};

type NotificationProviderReadinessRecordResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    affiliatePartnerReportId: string;
    payoutBatchId: string;
    notificationProviderReadinessDisposition: string;
    ownerPartnerNotificationProviderReadinessRecordCreated: true;
    partnerNotificationSent: false;
    notificationProviderCalled: false;
    notificationProviderConfigured: false;
    providerSecretIncluded: false;
    senderCredentialIncluded: false;
    queueDispatchCreated: false;
    notificationBodyIncluded: false;
    recipientEmailIncluded: false;
  };
};

function readableDisposition(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminAffiliateNotificationProviderReadinessRecordForm({
  evidence,
}: AdminAffiliateNotificationProviderReadinessRecordFormProps) {
  const [privateNote, setPrivateNote] = useState("");
  const [notificationProviderReadinessDisposition, setNotificationProviderReadinessDisposition] = useState(
    evidence.defaultNotificationProviderReadinessDisposition,
  );
  const [response, setResponse] = useState<NotificationProviderReadinessRecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const providerReadinessResponse = await fetch(affiliatePartnerNotificationProviderReadinessRecordApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          programId: evidence.programId,
          affiliatePartnerReportId: evidence.affiliatePartnerReportId,
          affiliatePartnerId: evidence.affiliatePartnerId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          reviewFlagId: evidence.reviewFlagId,
          notificationProviderReadinessDisposition,
          expectedProgramRevisionId: evidence.programRevisionId,
          expectedPartnerReportStatus: evidence.partnerReportStatus,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedPayoutPreparationRecordStatus: evidence.payoutPreparationRecordStatus,
          expectedFraudReviewRecordStatus: evidence.fraudReviewRecordStatus,
          expectedNotificationReadinessRecordStatus: evidence.notificationReadinessRecordStatus,
          expectedNotificationSendPreflightRecordStatus: evidence.notificationSendPreflightRecordStatus,
          expectedReviewFlagSeverity: evidence.reviewFlagSeverity,
          expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
          privateNote,
          confirmationText: affiliatePartnerNotificationProviderReadinessRecordConfirmationText,
          idempotencyKey: `affiliate-partner-notification-provider-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await providerReadinessResponse.json()) as NotificationProviderReadinessRecordResponse;
      if (!providerReadinessResponse.ok || !payload.ok) {
        setError(payload.message ?? "The affiliate partner notification provider readiness record could not be created.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The affiliate partner notification provider readiness record could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label="Record affiliate partner notification provider readiness evidence"
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Partner notification</span>
          <strong>Owner provider readiness evidence</strong>
          <p>
            Records redacted partner notification provider readiness evidence after payout preparation, fraud review,
            notification readiness, and send preflight contracts are present. It does not configure providers, store
            provider secrets, send notifications, enable provider sends, call providers, create payloads or queue rows,
            include recipient emails or message bodies, create payable commissions, or trigger payouts.
          </p>
        </div>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Provider readiness snapshot</span>
        <p>
          Partner report {evidence.affiliatePartnerReportId}; payout batch{" "}
          {evidence.payoutBatchStatus.replaceAll("_", " ")}; notification readiness{" "}
          {evidence.notificationReadinessRecordStatus.replaceAll("-", " ")}; send preflight{" "}
          {evidence.notificationSendPreflightRecordStatus.replaceAll("-", " ")}; fraud review{" "}
          {evidence.reviewFlagSeverity}; linked ledgers: {evidence.linkedLedgerIds.length}.
        </p>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Send boundary</span>
        <p>
          {evidence.notificationChannel} readiness is recorded for a{" "}
          {evidence.notificationAudience.replaceAll("_", " ")}; provider send enabled:{" "}
          {String(evidence.notificationProviderSendEnabled)}; provider called:{" "}
          {String(evidence.notificationProviderCalled)}; provider configured:{" "}
          {String(evidence.notificationProviderConfigured)}; provider secret: {String(evidence.providerSecretIncluded)};
          sender credential: {String(evidence.senderCredentialIncluded)}; send payload:{" "}
          {String(evidence.sendPayloadIncluded)}; queue dispatch: {String(evidence.queueDispatchCreated)}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Provider readiness disposition</span>
        <select
          value={notificationProviderReadinessDisposition}
          onChange={(event) =>
            setNotificationProviderReadinessDisposition(event.target.value as typeof notificationProviderReadinessDisposition)
          }
        >
          {evidence.supportedNotificationProviderReadinessDispositions.map((disposition) => (
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
          placeholder="Private notification provider readiness note, hashed before storage"
        />
      </label>
      <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record notification provider readiness"}
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
              {response.duplicate ? "Notification provider readiness replayed" : "Notification provider readiness recorded"}
            </strong>
            <span>
              {response.record.affiliatePartnerReportId}; disposition{" "}
              {readableDisposition(response.record.notificationProviderReadinessDisposition)}; sent:{" "}
              {String(response.record.partnerNotificationSent)}.
            </span>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
      ) : null}
    </form>
  );
}
