"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceDeliveryStatusWebhookReadinessApiRoute,
  audienceSequenceDeliveryStatusWebhookReadinessConfirmationText,
} from "@/lib/audience-sequence-delivery-status-webhook-readiness";

type AdminSequenceDeliveryStatusWebhookReadinessFormProps = {
  deliveryResultReadinessId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceDeliveryStatusWebhookReadinessResponse = {
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

export function AdminSequenceDeliveryStatusWebhookReadinessForm({
  deliveryResultReadinessId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceDeliveryStatusWebhookReadinessFormProps) {
  const [response, setResponse] = useState<SequenceDeliveryStatusWebhookReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const readinessResponse = await fetch(audienceSequenceDeliveryStatusWebhookReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deliveryResultReadinessId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceDeliveryStatusWebhookReadinessConfirmationText,
          idempotencyKey: `sequence-delivery-status-webhook-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await readinessResponse.json()) as SequenceDeliveryStatusWebhookReadinessResponse;
      if (!readinessResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence delivery-status-webhook readiness gate could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence delivery-status-webhook readiness gate could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence delivery-status webhook readiness for ${deliveryResultReadinessId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence delivery-status webhook</span>
          <strong>Readiness gate</strong>
          <p>
            Records owner-reviewed delivery-status webhook readiness from the current delivery-result gate while provider
            calls, sends, responses, message IDs, delivery attempts, delivery results, status webhooks, webhook payloads,
            provider polling, receipts, Queue consumption, acks, retry and dead-letter rows, payload reads, recipient
            payloads, personalized bodies, and unsubscribe URLs remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence delivery-status webhook readiness"}
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
              {response.record.duplicate ? "Delivery-status webhook readiness replayed" : "Delivery-status webhook readiness recorded"}
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
