"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceDeliveryAttemptReadinessApiRoute,
  audienceSequenceDeliveryAttemptReadinessConfirmationText,
} from "@/lib/audience-sequence-delivery-attempt-readiness";

type AdminSequenceDeliveryAttemptReadinessFormProps = {
  providerCallReadinessId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceDeliveryAttemptReadinessResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    dryRunMessageCount: number;
    queueName: string;
    providerMode: string;
    duplicate: boolean;
  };
};

export function AdminSequenceDeliveryAttemptReadinessForm({
  providerCallReadinessId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceDeliveryAttemptReadinessFormProps) {
  const [response, setResponse] = useState<SequenceDeliveryAttemptReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const readinessResponse = await fetch(audienceSequenceDeliveryAttemptReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          providerCallReadinessId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceDeliveryAttemptReadinessConfirmationText,
          idempotencyKey: `sequence-delivery-attempt-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await readinessResponse.json()) as SequenceDeliveryAttemptReadinessResponse;
      if (!readinessResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence delivery-attempt readiness gate could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence delivery-attempt readiness gate could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence delivery-attempt readiness for ${providerCallReadinessId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence delivery-attempt</span>
          <strong>Readiness gate</strong>
          <p>
            Records owner-reviewed delivery-attempt readiness from the current provider-call gate while provider calls,
            sends, responses, message IDs, delivery attempts, delivery results, webhooks, receipts, Queue consumption,
            acks, retry and dead-letter rows, payload reads, recipient payloads, personalized bodies, and unsubscribe
            URLs remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence delivery-attempt readiness"}
        <Send aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.record ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>
              {response.record.duplicate ? "Delivery-attempt readiness replayed" : "Delivery-attempt readiness recorded"}
            </strong>
            <span>
              {response.record.dryRunMessageCount} dry-run messages remain unsent and unattempted for{" "}
              {response.record.queueName}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
