"use client";

import { AlertCircle, CheckCircle2, FileUp } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  audienceImportIntentApiRoute,
  audienceImportIntentConfirmationText,
  audienceImportSourceKinds,
  audienceImportSourceLabels,
  type AudienceImportSourceKind,
} from "@/lib/audience-imports";

type AdminAudienceImportIntentFormProps = {
  workspaceId: string;
  workspaceTitle: string;
  workspaceRevisionId: string;
  workspaceStatus: string;
};

type ImportIntentResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  intent?: {
    id: string;
    sourceLabel: string;
    estimatedContactCount: number;
    estimatedNewContactCount: number;
    estimatedUpdateCount: number;
    estimatedSuppressedCount: number;
    importRowsStored: false;
    rawEmailsStored: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
  };
};

export function AdminAudienceImportIntentForm({
  workspaceId,
  workspaceTitle,
  workspaceRevisionId,
  workspaceStatus,
}: AdminAudienceImportIntentFormProps) {
  const [sourceKind, setSourceKind] = useState<AudienceImportSourceKind>("csv_upload");
  const [sourceLabel, setSourceLabel] = useState("Launch waitlist import");
  const [estimatedContactCount, setEstimatedContactCount] = useState("25");
  const [estimatedNewContactCount, setEstimatedNewContactCount] = useState("20");
  const [estimatedUpdateCount, setEstimatedUpdateCount] = useState("5");
  const [estimatedSuppressedCount, setEstimatedSuppressedCount] = useState("0");
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<ImportIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const importResponse = await fetch(audienceImportIntentApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          expectedWorkspaceRevisionId: workspaceRevisionId,
          expectedWorkspaceStatus: workspaceStatus,
          sourceKind,
          sourceLabel,
          estimatedContactCount: Number(estimatedContactCount),
          estimatedNewContactCount: Number(estimatedNewContactCount),
          estimatedUpdateCount: Number(estimatedUpdateCount),
          estimatedSuppressedCount: Number(estimatedSuppressedCount),
          privateNote,
          confirmationText: audienceImportIntentConfirmationText,
          idempotencyKey: `audience-import-intent-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await importResponse.json()) as ImportIntentResponse;
      if (!importResponse.ok || !payload.ok) {
        setError(payload.message ?? "The audience import intent could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The audience import intent could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record non-destructive import intent for ${workspaceTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Audience import intent</span>
          <strong>No contact import</strong>
          <p>
            Records owner intent with aggregate counts, idempotency, and workspace revision checks while contacts,
            sequences, exports, and email delivery stay unchanged.
          </p>
        </div>
      </div>
      <label className="admin-form-field">
        <span>Source</span>
        <select value={sourceKind} onChange={(event) => setSourceKind(event.target.value as AudienceImportSourceKind)}>
          {audienceImportSourceKinds.map((kind) => (
            <option key={kind} value={kind}>
              {audienceImportSourceLabels[kind]}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-form-field">
        <span>Source label</span>
        <input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} maxLength={120} />
      </label>
      <label className="admin-form-field">
        <span>Total contacts</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={estimatedContactCount}
          onChange={(event) => setEstimatedContactCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>New contacts</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={estimatedNewContactCount}
          onChange={(event) => setEstimatedNewContactCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Updates</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={estimatedUpdateCount}
          onChange={(event) => setEstimatedUpdateCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Suppressed</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={estimatedSuppressedCount}
          onChange={(event) => setEstimatedSuppressedCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field admin-step-goal-field">
        <span>Private note</span>
        <textarea
          value={privateNote}
          onChange={(event) => setPrivateNote(event.target.value)}
          rows={3}
        />
      </label>
      <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record import intent"}
        <FileUp aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error admin-step-goal-field">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.intent ? (
        <div className="checkout-alert success admin-step-goal-field">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Audience import intent replayed" : "Audience import intent recorded"}</strong>
            <span>
              {response.intent.sourceLabel} stays intent-only; raw emails stored:{" "}
              {String(response.intent.rawEmailsStored)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
