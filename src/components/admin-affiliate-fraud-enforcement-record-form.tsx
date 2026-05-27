"use client";

import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  affiliateFraudEnforcementRecordApiRoute,
  affiliateFraudEnforcementRecordConfirmationText,
  type AffiliateFraudEnforcementEvidence,
} from "@/lib/affiliate-fraud-review-records";

type AdminAffiliateFraudEnforcementRecordFormProps = {
  evidence: AffiliateFraudEnforcementEvidence;
};

type FraudEnforcementRecordResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    reviewFlagId: string;
    payoutBatchId: string;
    enforcementDisposition: string;
    ownerFraudEnforcementRecordCreated: true;
    fraudDecisionEnforced: true;
    payableCommissionCreated: false;
    stripePayoutCreated: false;
    partnerNotificationSent: false;
  };
};

function readableDisposition(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminAffiliateFraudEnforcementRecordForm({
  evidence,
}: AdminAffiliateFraudEnforcementRecordFormProps) {
  const [privateNote, setPrivateNote] = useState("");
  const [enforcementDisposition, setEnforcementDisposition] = useState(evidence.defaultEnforcementDisposition);
  const [response, setResponse] = useState<FraudEnforcementRecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const enforcementResponse = await fetch(affiliateFraudEnforcementRecordApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          programId: evidence.programId,
          reviewFlagId: evidence.reviewFlagId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          enforcementDisposition,
          expectedProgramRevisionId: evidence.programRevisionId,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedFraudReviewRecordStatus: evidence.fraudReviewRecordStatus,
          expectedFlagSeverity: evidence.reviewFlagSeverity,
          expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
          privateNote,
          confirmationText: affiliateFraudEnforcementRecordConfirmationText,
          idempotencyKey: `affiliate-fraud-enforcement-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await enforcementResponse.json()) as FraudEnforcementRecordResponse;
      if (!enforcementResponse.ok || !payload.ok) {
        setError(payload.message ?? "The affiliate fraud enforcement record could not be created.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The affiliate fraud enforcement record could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label="Record affiliate fraud enforcement decision"
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Fraud enforcement</span>
          <strong>Owner enforced review decision</strong>
          <p>
            Records redacted owner-visible affiliate fraud enforcement for the seeded review flag. It does not create
            payable commissions, trigger payouts, store payout accounts, collect tax data, or notify partners.
          </p>
        </div>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Review flag</span>
        <p>
          {evidence.reviewFlagTitle}; severity {evidence.reviewFlagSeverity}; linked ledgers:{" "}
          {evidence.linkedLedgerIds.length}; fraud review contract{" "}
          {evidence.fraudReviewRecordStatus.replaceAll("-", " ")}.
        </p>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Required action</span>
        <p>{evidence.requiredAction}</p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Enforcement disposition</span>
        <select
          value={enforcementDisposition}
          onChange={(event) => setEnforcementDisposition(event.target.value as typeof enforcementDisposition)}
        >
          {evidence.supportedEnforcementDispositions.map((disposition) => (
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
        {isSubmitting ? "Recording..." : "Record fraud enforcement"}
        <ShieldAlert aria-hidden="true" />
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
            <strong>{response.duplicate ? "Fraud enforcement replayed" : "Fraud enforcement recorded"}</strong>
            <span>
              {response.record.reviewFlagId}; disposition{" "}
              {readableDisposition(response.record.enforcementDisposition)}; payout created:{" "}
              {String(response.record.stripePayoutCreated)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
