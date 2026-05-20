"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceBroadcastDeliveryBatchApiRoute,
  audienceBroadcastDeliveryBatchConfirmationText,
} from "@/lib/audience-broadcasts";

type AdminBroadcastDeliveryBatchFormProps = {
  scheduleIntentId: string;
  draftId: string;
  expectedDraftUpdatedAt: string;
  expectedReadyRecipientCount: number;
};

type DeliveryBatchResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  batch?: {
    id: string;
    readyRecipientCount: number;
    heldRecipientCount: number;
    queueName: string;
    duplicate: boolean;
  };
};

export function AdminBroadcastDeliveryBatchForm({
  scheduleIntentId,
  draftId,
  expectedDraftUpdatedAt,
  expectedReadyRecipientCount,
}: AdminBroadcastDeliveryBatchFormProps) {
  const [response, setResponse] = useState<DeliveryBatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const batchResponse = await fetch(audienceBroadcastDeliveryBatchApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scheduleIntentId,
          draftId,
          expectedDraftUpdatedAt,
          expectedReadyRecipientCount,
          confirmationText: audienceBroadcastDeliveryBatchConfirmationText,
          idempotencyKey: `broadcast-delivery-batch-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await batchResponse.json()) as DeliveryBatchResponse;
      if (!batchResponse.ok || !payload.ok) {
        setError(payload.message ?? "The delivery-batch dry run could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The delivery-batch dry run could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor" aria-label={`Record delivery batch dry run for ${scheduleIntentId}`} onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>Delivery batch</span>
          <strong>Suppression-checked dry run</strong>
          <p>Checks the schedule intent, queue gate, preview safety, and current readiness before recording aggregate batch evidence.</p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record delivery-batch dry run"}
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
            <strong>{response.batch.duplicate ? "Delivery batch replayed" : "Delivery batch recorded"}</strong>
            <span>
              {response.batch.readyRecipientCount} ready, {response.batch.heldRecipientCount} held for {response.batch.queueName}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
