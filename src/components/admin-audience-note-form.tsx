"use client";

import { AlertCircle, CheckCircle2, NotebookPen } from "lucide-react";
import { FormEvent, useState } from "react";

import { audienceCrmTimelineApiRoute, audienceCrmTimelineConfirmationText } from "@/lib/audience-crm";

type AdminAudienceNoteFormProps = {
  subscriberId: string;
  expectedSubscriberStatus: string;
};

type NoteResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  note?: {
    id: string;
    body: string;
    duplicate: boolean;
  };
};

export function AdminAudienceNoteForm({ subscriberId, expectedSubscriberStatus }: AdminAudienceNoteFormProps) {
  const [noteBody, setNoteBody] = useState("");
  const [response, setResponse] = useState<NoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const noteResponse = await fetch(audienceCrmTimelineApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subscriberId,
          expectedSubscriberStatus,
          noteBody,
          confirmationText: audienceCrmTimelineConfirmationText,
          idempotencyKey: `audience-crm-note-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await noteResponse.json()) as NoteResponse;
      if (!noteResponse.ok || !payload.ok) {
        setError(payload.message ?? "The private note could not be saved.");
        return;
      }
      setResponse(payload);
      setNoteBody("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The private note could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor" aria-label={`Add private note for ${subscriberId}`} onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>CRM note</span>
          <strong>Owner private</strong>
          <p>Stores a short private timeline note. Public JSON only sees aggregate counts.</p>
        </div>
      </div>
      <label className="checkout-field">
        Private note
        <textarea
          value={noteBody}
          rows={3}
          maxLength={800}
          placeholder="Add owner-only contact context"
          onChange={(event) => setNoteBody(event.target.value)}
        />
      </label>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save private note"}
        <NotebookPen aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.note ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.note.duplicate ? "Private note replayed" : "Private note saved"}</strong>
            <span>{response.note.body}</span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
