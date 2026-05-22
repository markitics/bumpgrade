"use client";

import { AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceSequenceScheduleIntentApiRoute,
  audienceSequenceScheduleIntentConfirmationText,
} from "@/lib/audience-sequence-schedule-intents";

type AdminSequenceScheduleIntentFormProps = {
  sequenceId: string;
  expectedWorkspaceRevisionId: string | null;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
};

type SequenceScheduleIntentResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  intent?: {
    id: string;
    readyEnrollmentCount: number;
    heldEnrollmentCount: number;
    requestedStartAt: string | null;
    duplicate: boolean;
  };
};

export function AdminSequenceScheduleIntentForm({
  sequenceId,
  expectedWorkspaceRevisionId,
  expectedSequenceStatus,
  expectedReadyEnrollmentCount,
}: AdminSequenceScheduleIntentFormProps) {
  const [requestedStartAt, setRequestedStartAt] = useState("");
  const [response, setResponse] = useState<SequenceScheduleIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!expectedWorkspaceRevisionId) {
      setError("The audience workspace needs a current revision before a sequence schedule intent can be recorded.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const scheduleResponse = await fetch(audienceSequenceScheduleIntentApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sequenceId,
          expectedWorkspaceRevisionId,
          expectedSequenceStatus,
          expectedReadyEnrollmentCount,
          requestedStartAt: requestedStartAt || null,
          confirmationText: audienceSequenceScheduleIntentConfirmationText,
          idempotencyKey: `sequence-schedule-intent-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await scheduleResponse.json()) as SequenceScheduleIntentResponse;
      if (!scheduleResponse.ok || !payload.ok) {
        setError(payload.message ?? "The dry-run sequence schedule intent could not be recorded.");
        return;
      }
      setResponse(payload);
      setRequestedStartAt("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The dry-run sequence schedule intent could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor"
      aria-label={`Record dry-run sequence schedule intent for ${sequenceId}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence schedule intent</span>
          <strong>Dry run only</strong>
          <p>Records owner intent with the current workspace revision and readiness count. No delivery rows are created.</p>
        </div>
      </div>
      <label className="checkout-field">
        Requested start time
        <input
          type="datetime-local"
          value={requestedStartAt}
          onChange={(event) => setRequestedStartAt(event.target.value)}
        />
      </label>
      <button type="submit" className="secondary-action" disabled={isSubmitting || !expectedWorkspaceRevisionId}>
        {isSubmitting ? "Recording..." : "Record dry-run sequence schedule intent"}
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
            <strong>
              {response.intent.duplicate ? "Sequence schedule intent replayed" : "Sequence schedule intent recorded"}
            </strong>
            <span>
              {response.intent.readyEnrollmentCount} ready, {response.intent.heldEnrollmentCount} held.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
