"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceDeliveryReceiptReadinessApiRoute,
  audienceSequenceDeliveryReceiptReadinessConfirmationText,
} from "@/lib/audience-sequence-delivery-receipt-readiness";

type AdminSequenceDeliveryReceiptReadinessFormProps = {
  receiptPayloadReadinessId: string;
  sequenceId: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceDeliveryReceiptReadinessResponse = {
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

export function AdminSequenceDeliveryReceiptReadinessForm({
  receiptPayloadReadinessId,
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceDeliveryReceiptReadinessFormProps) {
  const [response, setResponse] = useState<SequenceDeliveryReceiptReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const readinessResponse = await fetch(audienceSequenceDeliveryReceiptReadinessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          receiptPayloadReadinessId,
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          confirmationText: audienceSequenceDeliveryReceiptReadinessConfirmationText,
          idempotencyKey: `sequence-delivery-receipt-readiness-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await readinessResponse.json()) as SequenceDeliveryReceiptReadinessResponse;
      if (!readinessResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sequence delivery-receipt readiness gate could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The sequence delivery-receipt readiness gate could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record sequence delivery-receipt readiness for ${receiptPayloadReadinessId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence delivery-receipt</span>
          <strong>Readiness gate</strong>
          <p>
            Records owner-reviewed delivery-receipt readiness from the current receipt-payload gate while
            provider calls, sends, responses, message IDs, delivery attempts, delivery results, status webhooks, webhook
            payloads, receipt payload, polling payloads, polling results, delivery receipts, receipts, Queue
            consumption, acks, retry and dead-letter rows, payload reads, recipient payloads, personalized bodies, and
            unsubscribe URLs remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record sequence delivery-receipt readiness"}
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
              {response.record.duplicate ? "Delivery-receipt readiness replayed" : "Delivery-receipt readiness recorded"}
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
