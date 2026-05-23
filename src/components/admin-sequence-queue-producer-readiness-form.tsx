"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceQueueProducerReadinessApiRoute,
  audienceSequenceQueueProducerReadinessConfirmationText,
} from "@/lib/audience-sequence-queue-producer-readiness";

type AdminSequenceQueueProducerReadinessFormProps = {
  dispatchAttemptId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceQueueProducerReadinessResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    dryRunMessageCount: number;
    queueName: string;
    producerMode: string;
    duplicate: boolean;
  };
};

export function AdminSequenceQueueProducerReadinessForm({
  dispatchAttemptId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceQueueProducerReadinessFormProps) {
  const [response, setResponse] = useState<SequenceQueueProducerReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const readinessResponse = await fetch(audienceSequenceQueueProducerReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dispatchAttemptId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceQueueProducerReadinessConfirmationText,
          idempotencyKey: `sequence-queue-producer-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await readinessResponse.json()) as SequenceQueueProducerReadinessResponse;
      if (!readinessResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence Queue producer readiness gate could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence Queue producer readiness gate could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence Queue producer readiness for ${dispatchAttemptId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence Queue producer</span>
          <strong>Readiness gate</strong>
          <p>
            Records owner-reviewed producer readiness while Cloudflare Queue producers, Queue messages, payload bodies,
            recipient payloads, provider sends, provider responses, and message IDs remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence Queue producer readiness"}
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
            <strong>{response.record.duplicate ? "Producer readiness replayed" : "Producer readiness recorded"}</strong>
            <span>
              {response.record.dryRunMessageCount} dry-run messages held for {response.record.queueName}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
