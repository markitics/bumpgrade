"use client";

import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  affiliatePartnerNotificationReadinessRecordApiRoute,
  affiliatePartnerNotificationReadinessRecordConfirmationText,
  type AffiliatePartnerNotificationReadinessEvidence,
} from "@/lib/affiliate-partner-notification-readiness-records";

type AdminAffiliateNotificationReadinessRecordFormProps = {
  evidence: AffiliatePartnerNotificationReadinessEvidence;
};

type NotificationReadinessRecordResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    affiliatePartnerReportId: string;
    payoutBatchId: string;
    notificationReadinessDisposition: string;
    ownerPartnerNotificationReadinessRecordCreated: true;
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

export function AdminAffiliateNotificationReadinessRecordForm({
  evidence,
}: AdminAffiliateNotificationReadinessRecordFormProps) {
  const [privateNote, setPrivateNote] = useState("");
  const [notificationReadinessDisposition, setNotificationReadinessDisposition] = useState(
    evidence.defaultNotificationReadinessDisposition,
  );
  const [response, setResponse] = useState<NotificationReadinessRecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const readinessResponse = await fetch(affiliatePartnerNotificationReadinessRecordApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          programId: evidence.programId,
          affiliatePartnerReportId: evidence.affiliatePartnerReportId,
          affiliatePartnerId: evidence.affiliatePartnerId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          reviewFlagId: evidence.reviewFlagId,
          notificationReadinessDisposition,
          expectedProgramRevisionId: evidence.programRevisionId,
          expectedPartnerReportStatus: evidence.partnerReportStatus,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedPayoutPreparationRecordStatus: evidence.payoutPreparationRecordStatus,
          expectedFraudReviewRecordStatus: evidence.fraudReviewRecordStatus,
          expectedReviewFlagSeverity: evidence.reviewFlagSeverity,
          expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
          privateNote,
          confirmationText: affiliatePartnerNotificationReadinessRecordConfirmationText,
          idempotencyKey: `affiliate-partner-notification-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await readinessResponse.json()) as NotificationReadinessRecordResponse;
      if (!readinessResponse.ok || !payload.ok) {
        setError(payload.message ?? "The affiliate partner notification readiness record could not be created.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The affiliate partner notification readiness record could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label="Record affiliate partner notification readiness evidence"
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Partner notification</span>
          <strong>Owner readiness evidence</strong>
          <p>
            Records redacted partner notification readiness evidence after payout preparation and fraud review contracts
            are present. It does not send notifications, call providers, create queue rows, include recipient emails or
            message bodies, create payable commissions, or trigger payouts.
          </p>
        </div>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Readiness snapshot</span>
        <p>
          Partner report {evidence.affiliatePartnerReportId}; payout batch{" "}
          {evidence.payoutBatchStatus.replaceAll("_", " ")}; fraud review {evidence.reviewFlagSeverity}; linked
          ledgers: {evidence.linkedLedgerIds.length}.
        </p>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Send boundary</span>
        <p>
          {evidence.notificationChannel} readiness is recorded for a {evidence.notificationAudience.replaceAll("_", " ")}
          ; provider called: {String(evidence.notificationProviderCalled)}; queue dispatch:{" "}
          {String(evidence.queueDispatchCreated)}.
        </p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Readiness disposition</span>
        <select
          value={notificationReadinessDisposition}
          onChange={(event) =>
            setNotificationReadinessDisposition(event.target.value as typeof notificationReadinessDisposition)
          }
        >
          {evidence.supportedNotificationReadinessDispositions.map((disposition) => (
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
      <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record notification readiness"}
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
              {response.duplicate ? "Notification readiness replayed" : "Notification readiness recorded"}
            </strong>
            <span>
              {response.record.affiliatePartnerReportId}; disposition{" "}
              {readableDisposition(response.record.notificationReadinessDisposition)}; sent:{" "}
              {String(response.record.partnerNotificationSent)}.
            </span>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
      ) : null}
    </form>
  );
}
