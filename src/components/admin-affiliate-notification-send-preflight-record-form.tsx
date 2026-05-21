"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  affiliatePartnerNotificationSendPreflightRecordApiRoute,
  affiliatePartnerNotificationSendPreflightRecordConfirmationText,
  type AffiliatePartnerNotificationSendPreflightEvidence,
} from "@/lib/affiliate-partner-notification-send-preflight-records";

type AdminAffiliateNotificationSendPreflightRecordFormProps = {
  evidence: AffiliatePartnerNotificationSendPreflightEvidence;
};

type NotificationSendPreflightRecordResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    affiliatePartnerReportId: string;
    payoutBatchId: string;
    notificationSendPreflightDisposition: string;
    ownerPartnerNotificationSendPreflightRecordCreated: true;
    partnerNotificationSent: false;
    notificationProviderCalled: false;
    queueDispatchCreated: false;
    notificationBodyIncluded: false;
    recipientEmailIncluded: false;
  };
};

function readableDisposition(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminAffiliateNotificationSendPreflightRecordForm({
  evidence,
}: AdminAffiliateNotificationSendPreflightRecordFormProps) {
  const [privateNote, setPrivateNote] = useState("");
  const [notificationSendPreflightDisposition, setNotificationSendPreflightDisposition] = useState(
    evidence.defaultNotificationSendPreflightDisposition,
  );
  const [response, setResponse] = useState<NotificationSendPreflightRecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const sendPreflightResponse = await fetch(affiliatePartnerNotificationSendPreflightRecordApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          programId: evidence.programId,
          affiliatePartnerReportId: evidence.affiliatePartnerReportId,
          affiliatePartnerId: evidence.affiliatePartnerId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          reviewFlagId: evidence.reviewFlagId,
          notificationSendPreflightDisposition,
          expectedProgramRevisionId: evidence.programRevisionId,
          expectedPartnerReportStatus: evidence.partnerReportStatus,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedPayoutPreparationRecordStatus: evidence.payoutPreparationRecordStatus,
          expectedFraudReviewRecordStatus: evidence.fraudReviewRecordStatus,
          expectedNotificationReadinessRecordStatus: evidence.notificationReadinessRecordStatus,
          expectedReviewFlagSeverity: evidence.reviewFlagSeverity,
          expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
          privateNote,
          confirmationText: affiliatePartnerNotificationSendPreflightRecordConfirmationText,
          idempotencyKey: `affiliate-partner-notification-send-preflight-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await sendPreflightResponse.json()) as NotificationSendPreflightRecordResponse;
      if (!sendPreflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The affiliate partner notification send preflight record could not be created.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The affiliate partner notification send preflight record could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label="Record affiliate partner notification send preflight evidence"
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Partner notification</span>
          <strong>Owner send preflight evidence</strong>
          <p>
            Records redacted partner notification send preflight evidence after payout preparation, fraud review, and
            notification readiness contracts are present. It does not send notifications, enable provider sends, call
            providers, create payloads or queue rows, include recipient emails or message bodies, create payable
            commissions, or trigger payouts.
          </p>
        </div>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Send preflight snapshot</span>
        <p>
          Partner report {evidence.affiliatePartnerReportId}; payout batch{" "}
          {evidence.payoutBatchStatus.replaceAll("_", " ")}; notification readiness{" "}
          {evidence.notificationReadinessRecordStatus.replaceAll("-", " ")}; fraud review {evidence.reviewFlagSeverity};
          linked ledgers: {evidence.linkedLedgerIds.length}.
        </p>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Send boundary</span>
        <p>
          {evidence.notificationChannel} readiness is recorded for a {evidence.notificationAudience.replaceAll("_", " ")}
          ; provider send enabled: {String(evidence.notificationProviderSendEnabled)}; provider called:{" "}
          {String(evidence.notificationProviderCalled)}; send payload: {String(evidence.sendPayloadIncluded)}; queue
          dispatch: {String(evidence.queueDispatchCreated)}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Send preflight disposition</span>
        <select
          value={notificationSendPreflightDisposition}
          onChange={(event) =>
            setNotificationSendPreflightDisposition(event.target.value as typeof notificationSendPreflightDisposition)
          }
        >
          {evidence.supportedNotificationSendPreflightDispositions.map((disposition) => (
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
          placeholder="Private notification send preflight note, hashed before storage"
        />
      </label>
      <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record notification send preflight"}
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
              {response.duplicate ? "Notification send preflight replayed" : "Notification send preflight recorded"}
            </strong>
            <span>
              {response.record.affiliatePartnerReportId}; disposition{" "}
              {readableDisposition(response.record.notificationSendPreflightDisposition)}; sent:{" "}
              {String(response.record.partnerNotificationSent)}.
            </span>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
      ) : null}
    </form>
  );
}
