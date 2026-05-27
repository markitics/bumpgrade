"use client";

import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  affiliateFraudReviewRecordApiRoute,
  affiliateFraudReviewRecordConfirmationText,
  type AffiliateFraudReviewEvidence,
} from "@/lib/affiliate-fraud-review-records";

type AdminAffiliateFraudReviewRecordFormProps = {
  evidence: AffiliateFraudReviewEvidence;
};

type FraudReviewRecordResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    reviewFlagId: string;
    payoutBatchId: string;
    reviewDisposition: string;
    ownerFraudReviewRecordCreated: true;
    fraudDecisionEnforced: false;
    payableCommissionCreated: false;
    stripePayoutCreated: false;
    partnerNotificationSent: false;
  };
};

function readableDisposition(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminAffiliateFraudReviewRecordForm({ evidence }: AdminAffiliateFraudReviewRecordFormProps) {
  const [privateNote, setPrivateNote] = useState("");
  const [reviewDisposition, setReviewDisposition] = useState(evidence.defaultReviewDisposition);
  const [response, setResponse] = useState<FraudReviewRecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const fraudResponse = await fetch(affiliateFraudReviewRecordApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          programId: evidence.programId,
          reviewFlagId: evidence.reviewFlagId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          reviewDisposition,
          expectedProgramRevisionId: evidence.programRevisionId,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedFlagSeverity: evidence.reviewFlagSeverity,
          expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
          privateNote,
          confirmationText: affiliateFraudReviewRecordConfirmationText,
          idempotencyKey: `affiliate-fraud-review-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await fraudResponse.json()) as FraudReviewRecordResponse;
      if (!fraudResponse.ok || !payload.ok) {
        setError(payload.message ?? "The affiliate fraud review record could not be created.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "The affiliate fraud review record could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label="Record affiliate fraud review evidence"
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Fraud review</span>
          <strong>Owner reviewed flag evidence</strong>
          <p>
            Records redacted owner-visible affiliate fraud review evidence for a seeded review flag. It does not enforce
            a fraud decision, create payable commissions, trigger payouts, store payout accounts, collect tax data, or
            notify partners.
          </p>
        </div>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Review flag</span>
        <p>
          {evidence.reviewFlagTitle}; severity {evidence.reviewFlagSeverity}; linked ledgers:{" "}
          {evidence.linkedLedgerIds.length}; payout batch {evidence.payoutBatchStatus.replaceAll("_", " ")}.
        </p>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Required action</span>
        <p>{evidence.requiredAction}</p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Review disposition</span>
        <select value={reviewDisposition} onChange={(event) => setReviewDisposition(event.target.value as typeof reviewDisposition)}>
          {evidence.supportedReviewDispositions.map((disposition) => (
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
        {isSubmitting ? "Recording..." : "Record fraud review"}
        <ShieldCheck aria-hidden="true" />
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
            <strong>{response.duplicate ? "Fraud review replayed" : "Fraud review recorded"}</strong>
            <span>
              {response.record.reviewFlagId}; disposition {readableDisposition(response.record.reviewDisposition)};
              fraud enforced: {String(response.record.fraudDecisionEnforced)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
