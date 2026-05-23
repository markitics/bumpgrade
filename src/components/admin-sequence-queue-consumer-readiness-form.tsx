"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceQueueConsumerReadinessApiRoute,
  audienceSequenceQueueConsumerReadinessConfirmationText,
} from "@/lib/audience-sequence-queue-consumer-readiness";

type AdminSequenceQueueConsumerReadinessFormProps = {
  queueProducerReadinessId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceQueueConsumerReadinessResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: {
    id: string;
    dryRunMessageCount: number;
    queueName: string;
    consumerMode: string;
    duplicate: boolean;
  };
};

export function AdminSequenceQueueConsumerReadinessForm({
  queueProducerReadinessId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceQueueConsumerReadinessFormProps) {
  const [response, setResponse] = useState<SequenceQueueConsumerReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const readinessResponse = await fetch(audienceSequenceQueueConsumerReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          queueProducerReadinessId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceQueueConsumerReadinessConfirmationText,
          idempotencyKey: `sequence-queue-consumer-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await readinessResponse.json()) as SequenceQueueConsumerReadinessResponse;
      if (!readinessResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence Queue consumer readiness gate could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence Queue consumer readiness gate could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence Queue consumer readiness for ${queueProducerReadinessId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence Queue consumer</span>
          <strong>Readiness gate</strong>
          <p>
            Records owner-reviewed consumer readiness from the current Queue producer gate while Cloudflare Queue
            consumers, message consumption, acks, retry and dead-letter rows, payload reads, recipient payloads,
            provider sends, provider responses, and message IDs remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence Queue consumer readiness"}
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
            <strong>{response.record.duplicate ? "Consumer readiness replayed" : "Consumer readiness recorded"}</strong>
            <span>
              {response.record.dryRunMessageCount} dry-run messages remain unconsumed for {response.record.queueName}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
