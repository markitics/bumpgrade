"use client";

import { AlertCircle, CheckCircle2, ListChecks } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceBroadcastDeliveryQueueMessageApiRoute,
  audienceBroadcastDeliveryQueueMessageConfirmationText,
} from "@/lib/audience-broadcasts";

type AdminBroadcastDeliveryQueueMessageFormProps = {
  deliveryBatchId: string;
  draftId: string;
  expectedDraftUpdatedAt: string;
  expectedReadyRecipientCount: number;
};

type DeliveryQueueMessageResponse = {
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

export function AdminBroadcastDeliveryQueueMessageForm({
  deliveryBatchId,
  draftId,
  expectedDraftUpdatedAt,
  expectedReadyRecipientCount,
}: AdminBroadcastDeliveryQueueMessageFormProps) {
  const [response, setResponse] = useState<DeliveryQueueMessageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const queueMessageResponse = await fetch(audienceBroadcastDeliveryQueueMessageApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deliveryBatchId,
          draftId,
          expectedDraftUpdatedAt,
          expectedReadyRecipientCount,
          confirmationText: audienceBroadcastDeliveryQueueMessageConfirmationText,
          idempotencyKey: `broadcast-delivery-queue-messages-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await queueMessageResponse.json()) as DeliveryQueueMessageResponse;
      if (!queueMessageResponse.ok || !payload.ok) {
        setError(payload.message ?? "The queue-message dry run could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The queue-message dry run could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record delivery queue message dry run for ${deliveryBatchId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Queue messages</span>
          <strong>Dry-run evidence only</strong>
          <p>
            Snapshots the messages that would be queued from this delivery batch while Cloudflare Queue dispatch and
            provider sends remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record queue-message dry run"}
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
