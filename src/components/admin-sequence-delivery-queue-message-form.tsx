"use client";

import { AlertCircle, CheckCircle2, ListChecks } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceDeliveryQueueMessageApiRoute,
  audienceSequenceDeliveryQueueMessageConfirmationText,
} from "@/lib/audience-sequence-delivery-queue-messages";

type AdminSequenceDeliveryQueueMessageFormProps = {
  deliveryBatchId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceDeliveryQueueMessageResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  messages?: {
    id: string;
    dryRunMessageCount: number;
    queueName: string;
    duplicate: boolean;
  };
};

export function AdminSequenceDeliveryQueueMessageForm({
  deliveryBatchId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceDeliveryQueueMessageFormProps) {
  const [response, setResponse] = useState<SequenceDeliveryQueueMessageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const queueMessageResponse = await fetch(audienceSequenceDeliveryQueueMessageApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deliveryBatchId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceDeliveryQueueMessageConfirmationText,
          idempotencyKey: `sequence-delivery-queue-messages-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await queueMessageResponse.json()) as SequenceDeliveryQueueMessageResponse;
      if (!queueMessageResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence queue-message dry run could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence queue-message dry run could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence delivery queue message dry run for ${deliveryBatchId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence queue messages</span>
          <strong>Dry-run evidence only</strong>
          <p>
            Snapshots the messages that would be queued from this sequence delivery batch while Cloudflare Queue
            dispatch, payload bodies, and provider sends remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence queue-message dry run"}
        <ListChecks aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.messages ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.messages.duplicate ? "Queue messages replayed" : "Queue messages recorded"}</strong>
            <span>
              {response.messages.dryRunMessageCount} dry-run messages for {response.messages.queueName}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
