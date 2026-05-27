"use client";

import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  affiliatePayoutPreparationRecordApiRoute,
  affiliatePayoutPreparationRecordConfirmationText,
  type AffiliatePayoutPreparationEvidence,
} from "@/lib/affiliate-payout-preparation-records";

type AdminAffiliatePayoutPreparationRecordFormProps = {
  evidence: AffiliatePayoutPreparationEvidence;
};

type PayoutRecordResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    payoutPreparationId: string;
    payoutBatchId: string;
    expectedTotalCommissionCents: number;
    ownerPayoutPreparationRecordCreated: true;
    payableCommissionCreated: false;
    stripePayoutCreated: false;
    partnerNotificationSent: false;
  };
};

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function AdminAffiliatePayoutPreparationRecordForm({
  evidence,
}: AdminAffiliatePayoutPreparationRecordFormProps) {
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<PayoutRecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const payoutResponse = await fetch(affiliatePayoutPreparationRecordApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          programId: evidence.programId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          expectedProgramRevisionId: evidence.programRevisionId,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedEligibleLedgerCount: evidence.eligibleLedgerCount,
          expectedBlockedLedgerCount: evidence.blockedLedgerCount,
          expectedReversedLedgerCount: evidence.reversedLedgerCount,
          expectedTotalCommissionCents: evidence.totalCommissionCents,
          privateNote,
          confirmationText: affiliatePayoutPreparationRecordConfirmationText,
          idempotencyKey: `affiliate-payout-preparation-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await payoutResponse.json()) as PayoutRecordResponse;
      if (!payoutResponse.ok || !payload.ok) {
        setError(payload.message ?? "The affiliate payout preparation record could not be created.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The affiliate payout preparation record could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label="Record affiliate payout preparation evidence"
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Payout preparation</span>
          <strong>Owner confirmed review record</strong>
          <p>
            Records owner-visible affiliate payout preparation evidence with current batch status, ledger counts, and
            public-safe total. It does not create payable commissions, Stripe payouts, tax records, payout accounts, or
            partner notifications.
          </p>
        </div>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Preparation snapshot</span>
        <p>
          {evidence.payoutBatchStatus.replaceAll("_", " ")}; eligible ledgers: {evidence.eligibleLedgerCount};
          blocked: {evidence.blockedLedgerCount}; reversed: {evidence.reversedLedgerCount}; total:{" "}
          {formatMoney(evidence.totalCommissionCents)}.
        </p>
      </div>
      <div className="admin-form-field admin-step-goal-field">
        <span>Blocked before payout execution</span>
        <p>{evidence.reviewBeforePayout.join(" ")}</p>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Private note</span>
        <textarea
          value={privateNote}
          onChange={(event) => setPrivateNote(event.target.value)}
          rows={3}
        />
      </label>
      <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record payout preparation"}
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
            <strong>{response.duplicate ? "Payout preparation replayed" : "Payout preparation recorded"}</strong>
            <span>
              {response.record.payoutBatchId}; payout created: {String(response.record.stripePayoutCreated)};
              partner notification sent: {String(response.record.partnerNotificationSent)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
