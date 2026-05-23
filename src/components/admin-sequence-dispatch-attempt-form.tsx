"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceDispatchAttemptApiRoute,
  audienceSequenceDispatchAttemptConfirmationText,
} from "@/lib/audience-sequence-dispatch-attempts";

type AdminSequenceDispatchAttemptFormProps = {
  dispatchPreflightId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceDispatchAttemptResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  attempt?: {
    id: string;
    dryRunMessageCount: number;
    queueName: string;
    queueProducerMode: string;
    duplicate: boolean;
  };
};

export function AdminSequenceDispatchAttemptForm({
  dispatchPreflightId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceDispatchAttemptFormProps) {
  const [response, setResponse] = useState<SequenceDispatchAttemptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const attemptResponse = await fetch(audienceSequenceDispatchAttemptApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dispatchPreflightId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceDispatchAttemptConfirmationText,
          idempotencyKey: `sequence-dispatch-attempt-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await attemptResponse.json()) as SequenceDispatchAttemptResponse;
      if (!attemptResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence dispatch attempt receipt could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence dispatch attempt receipt could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence dispatch attempt receipt for ${dispatchPreflightId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence dispatch attempt</span>
          <strong>Receipt only</strong>
          <p>
            Records the final dry-run sequence handoff receipt while Cloudflare Queue producers, queue payload bodies,
            provider sends, provider responses, and message IDs remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence dispatch attempt"}
        <Send aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.attempt ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.attempt.duplicate ? "Dispatch attempt replayed" : "Dispatch attempt recorded"}</strong>
            <span>
              {response.attempt.dryRunMessageCount} dry-run messages held for {response.attempt.queueName}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
