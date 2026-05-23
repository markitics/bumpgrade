"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceDeliveryBatchApiRoute,
  audienceSequenceDeliveryBatchConfirmationText,
} from "@/lib/audience-sequence-delivery-batches";

type AdminSequenceDeliveryBatchFormProps = {
  scheduleIntentId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceDeliveryBatchResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  batch?: {
    id: string;
    readyEnrollmentCount: number;
    heldEnrollmentCount: number;
    queueName: string;
    duplicate: boolean;
  };
};

export function AdminSequenceDeliveryBatchForm({
  scheduleIntentId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceDeliveryBatchFormProps) {
  const [response, setResponse] = useState<SequenceDeliveryBatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const batchResponse = await fetch(audienceSequenceDeliveryBatchApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scheduleIntentId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceDeliveryBatchConfirmationText,
          idempotencyKey: `sequence-delivery-batch-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await batchResponse.json()) as SequenceDeliveryBatchResponse;
      if (!batchResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence delivery-batch dry run could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence delivery-batch dry run could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence delivery batch dry run for ${scheduleIntentId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence delivery batch</span>
          <strong>Dry-run gate</strong>
          <p>Checks the schedule intent, workspace revision, sequence status, and current readiness before recording batch evidence.</p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence delivery-batch dry run"}
        <Send aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.batch ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.batch.duplicate ? "Sequence delivery batch replayed" : "Sequence delivery batch recorded"}</strong>
            <span>
              {response.batch.readyEnrollmentCount} ready, {response.batch.heldEnrollmentCount} held for{" "}
              {response.batch.queueName}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
