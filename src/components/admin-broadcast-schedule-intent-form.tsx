"use client";

import { AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceBroadcastScheduleIntentApiRoute,
  audienceBroadcastScheduleIntentConfirmationText,
} from "@/lib/audience-broadcasts";

type AdminBroadcastScheduleIntentFormProps = {
  draftId: string;
  expectedDraftUpdatedAt: string | null;
  expectedReadyRecipientCount: number;
};

type ScheduleIntentResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  intent?: {
    id: string;
    readyRecipientCount: number;
    heldRecipientCount: number;
    requestedSendAt: string | null;
    duplicate: boolean;
  };
};

export function AdminBroadcastScheduleIntentForm({
  draftId,
  expectedDraftUpdatedAt,
  expectedReadyRecipientCount,
}: AdminBroadcastScheduleIntentFormProps) {
  const [requestedSendAt, setRequestedSendAt] = useState("");
  const [response, setResponse] = useState<ScheduleIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!expectedDraftUpdatedAt) {
      setError("The broadcast draft needs a current revision before a schedule intent can be recorded.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const scheduleResponse = await fetch(audienceBroadcastScheduleIntentApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          draftId,
          expectedDraftUpdatedAt,
          expectedReadyRecipientCount,
          requestedSendAt: requestedSendAt || null,
          confirmationText: audienceBroadcastScheduleIntentConfirmationText,
          idempotencyKey: `broadcast-schedule-intent-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await scheduleResponse.json()) as ScheduleIntentResponse;
      if (!scheduleResponse.ok || !payload.ok) {
        setError(payload.message ?? "The dry-run schedule intent could not be recorded.");
        return;
      }
      setResponse(payload);
      setRequestedSendAt("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The dry-run schedule intent could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor" aria-label={`Record dry-run schedule intent for ${draftId}`} onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>Schedule intent</span>
          <strong>Dry run only</strong>
          <p>Records owner intent with the current draft revision and readiness count. No queue rows are created.</p>
        </div>
      </div>
      <label className="checkout-field">
        Requested send time
        <input
          type="datetime-local"
          value={requestedSendAt}
          onChange={(event) => setRequestedSendAt(event.target.value)}
        />
      </label>
      <button type="submit" className="secondary-action" disabled={isSubmitting || !expectedDraftUpdatedAt}>
        {isSubmitting ? "Recording..." : "Record dry-run schedule intent"}
        <CalendarClock aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.intent ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.intent.duplicate ? "Schedule intent replayed" : "Schedule intent recorded"}</strong>
            <span>
              {response.intent.readyRecipientCount} ready, {response.intent.heldRecipientCount} held.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
