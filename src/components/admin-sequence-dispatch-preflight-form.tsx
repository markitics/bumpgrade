"use client";

import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceDispatchPreflightApiRoute,
  audienceSequenceDispatchPreflightConfirmationText,
} from "@/lib/audience-sequence-dispatch-preflights";

type AdminSequenceDispatchPreflightFormProps = {
  deliveryQueueMessageId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceDispatchPreflightResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  preflight?: {
    id: string;
    dryRunMessageCount: number;
    queueName: string;
    duplicate: boolean;
  };
};

export function AdminSequenceDispatchPreflightForm({
  deliveryQueueMessageId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceDispatchPreflightFormProps) {
  const [response, setResponse] = useState<SequenceDispatchPreflightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(audienceSequenceDispatchPreflightApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deliveryQueueMessageId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceDispatchPreflightConfirmationText,
          idempotencyKey: `sequence-dispatch-preflight-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as SequenceDispatchPreflightResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence dispatch preflight dry run could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence dispatch preflight dry run could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence dispatch preflight dry run for ${deliveryQueueMessageId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence dispatch preflight</span>
          <strong>Provider and queue gates only</strong>
          <p>
            Snapshots provider-limit, sender-domain, suppression, unsubscribe, audit, and queue dispatch gates while
            Cloudflare Queue dispatch, queue payload bodies, and provider sends remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence dispatch preflight"}
        <ShieldCheck aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.preflight ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.preflight.duplicate ? "Dispatch preflight replayed" : "Dispatch preflight recorded"}</strong>
            <span>
              {response.preflight.dryRunMessageCount} dry-run messages checked for {response.preflight.queueName}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
