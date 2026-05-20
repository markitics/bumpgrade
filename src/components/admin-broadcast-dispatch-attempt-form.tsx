"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceBroadcastDispatchAttemptApiRoute,
  audienceBroadcastDispatchAttemptConfirmationText,
} from "@/lib/audience-broadcasts";

type AdminBroadcastDispatchAttemptFormProps = {
  dispatchPreflightId: string;
  draftId: string;
  expectedDraftUpdatedAt: string;
  expectedReadyRecipientCount: number;
};

type DispatchAttemptResponse = {
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

export function AdminBroadcastDispatchAttemptForm({
  dispatchPreflightId,
  draftId,
  expectedDraftUpdatedAt,
  expectedReadyRecipientCount,
}: AdminBroadcastDispatchAttemptFormProps) {
  const [response, setResponse] = useState<DispatchAttemptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const attemptResponse = await fetch(audienceBroadcastDispatchAttemptApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dispatchPreflightId,
          draftId,
          expectedDraftUpdatedAt,
          expectedReadyRecipientCount,
          confirmationText: audienceBroadcastDispatchAttemptConfirmationText,
          idempotencyKey: `broadcast-dispatch-attempt-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await attemptResponse.json()) as DispatchAttemptResponse;
      if (!attemptResponse.ok || !payload.ok) {
        setError(payload.message ?? "The dispatch attempt receipt could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The dispatch attempt receipt could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record dispatch attempt receipt for ${dispatchPreflightId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Dispatch attempt</span>
          <strong>Receipt only</strong>
          <p>
            Records the final dry-run handoff receipt while Cloudflare Queue producers, queue payloads, provider sends,
            provider responses, and message IDs remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record dispatch attempt"}
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
