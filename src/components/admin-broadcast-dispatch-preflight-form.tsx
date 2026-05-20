"use client";

import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceBroadcastDispatchPreflightApiRoute,
  audienceBroadcastDispatchPreflightConfirmationText,
} from "@/lib/audience-broadcasts";

type AdminBroadcastDispatchPreflightFormProps = {
  deliveryQueueMessageId: string;
  draftId: string;
  expectedDraftUpdatedAt: string;
  expectedReadyRecipientCount: number;
};

type DispatchPreflightResponse = {
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

export function AdminBroadcastDispatchPreflightForm({
  deliveryQueueMessageId,
  draftId,
  expectedDraftUpdatedAt,
  expectedReadyRecipientCount,
}: AdminBroadcastDispatchPreflightFormProps) {
  const [response, setResponse] = useState<DispatchPreflightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(audienceBroadcastDispatchPreflightApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deliveryQueueMessageId,
          draftId,
          expectedDraftUpdatedAt,
          expectedReadyRecipientCount,
          confirmationText: audienceBroadcastDispatchPreflightConfirmationText,
          idempotencyKey: `broadcast-dispatch-preflight-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as DispatchPreflightResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The dispatch preflight dry run could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The dispatch preflight dry run could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record dispatch preflight dry run for ${deliveryQueueMessageId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Dispatch preflight</span>
          <strong>Provider and queue gates only</strong>
          <p>
            Snapshots provider-limit, sender-domain, suppression, unsubscribe, audit, and queue dispatch gates while
            Cloudflare Queue dispatch and provider sends remain disabled.
          </p>
        </div>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record dispatch preflight"}
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
