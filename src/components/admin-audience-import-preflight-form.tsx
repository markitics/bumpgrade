"use client";

import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  audienceImportPreflightApiRoute,
  audienceImportPreflightConfirmationText,
  type AudienceImportIntentPublic,
} from "@/lib/audience-imports";

type AdminAudienceImportPreflightFormProps = {
  workspaceId: string;
  workspaceTitle: string;
  workspaceRevisionId: string;
  workspaceStatus: string;
  latestIntents: AudienceImportIntentPublic[];
};

type ImportPreflightResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  preflight?: {
    id: string;
    importIntentId: string;
    expectedImportIntentSourceLabel: string;
    totalContactsChecked: number;
    eligibleNewContactCount: number;
    eligibleUpdateCount: number;
    duplicateCount: number;
    suppressedCount: number;
    missingConsentCount: number;
    malformedCount: number;
    lawfulBasisCount: number;
    rawEmailsStored: false;
    subscriberRowsCreated: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
    exportEnabled: false;
  };
};

export function AdminAudienceImportPreflightForm({
  workspaceId,
  workspaceTitle,
  workspaceRevisionId,
  workspaceStatus,
  latestIntents,
}: AdminAudienceImportPreflightFormProps) {
  const [selectedIntentId, setSelectedIntentId] = useState(latestIntents[0]?.id ?? "");
  const selectedIntent = useMemo(
    () => latestIntents.find((intent) => intent.id === selectedIntentId) ?? latestIntents[0] ?? null,
    [latestIntents, selectedIntentId],
  );
  const [totalContactsChecked, setTotalContactsChecked] = useState("10");
  const [eligibleNewContactCount, setEligibleNewContactCount] = useState("6");
  const [eligibleUpdateCount, setEligibleUpdateCount] = useState("2");
  const [duplicateCount, setDuplicateCount] = useState("1");
  const [suppressedCount, setSuppressedCount] = useState("1");
  const [missingConsentCount, setMissingConsentCount] = useState("0");
  const [malformedCount, setMalformedCount] = useState("0");
  const [lawfulBasisCount, setLawfulBasisCount] = useState("8");
  const [privateNote, setPrivateNote] = useState("");
  const [response, setResponse] = useState<ImportPreflightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedIntent) {
      setError("Record an import intent before recording import preflight evidence.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const preflightResponse = await fetch(audienceImportPreflightApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          importIntentId: selectedIntent.id,
          expectedImportIntentSourceLabel: selectedIntent.sourceLabel,
          expectedWorkspaceRevisionId: workspaceRevisionId,
          expectedWorkspaceStatus: workspaceStatus,
          totalContactsChecked: Number(totalContactsChecked),
          eligibleNewContactCount: Number(eligibleNewContactCount),
          eligibleUpdateCount: Number(eligibleUpdateCount),
          duplicateCount: Number(duplicateCount),
          suppressedCount: Number(suppressedCount),
          missingConsentCount: Number(missingConsentCount),
          malformedCount: Number(malformedCount),
          lawfulBasisCount: Number(lawfulBasisCount),
          privateNote,
          confirmationText: audienceImportPreflightConfirmationText,
          idempotencyKey: `audience-import-preflight-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await preflightResponse.json()) as ImportPreflightResponse;
      if (!preflightResponse.ok || !payload.ok) {
        setError(payload.message ?? "The audience import preflight could not be recorded.");
        return;
      }
      setPrivateNote("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The audience import preflight could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-audience-import-intent-form"
      aria-label={`Record import preflight evidence for ${workspaceTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading admin-step-goal-field">
        <div>
          <span>Audience import preflight</span>
          <strong>Aggregate safety check</strong>
          <p>
            Links to an owner-confirmed import intent and records aggregate eligibility, duplicate, suppression,
            consent, and malformed counts without storing rows, emails, subscriber writes, exports, or sends.
          </p>
        </div>
      </div>
      <label className="admin-form-field admin-step-goal-field">
        <span>Import intent</span>
        <select value={selectedIntent?.id ?? ""} onChange={(event) => setSelectedIntentId(event.target.value)}>
          {latestIntents.map((intent) => (
            <option key={intent.id} value={intent.id}>
              {intent.sourceLabel} ({intent.estimatedContactCount} contacts)
            </option>
          ))}
        </select>
      </label>
      <label className="admin-form-field">
        <span>Total checked</span>
        <input
          type="number"
          min="0"
          max={selectedIntent?.estimatedContactCount ?? undefined}
          inputMode="numeric"
          value={totalContactsChecked}
          onChange={(event) => setTotalContactsChecked(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Eligible new</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={eligibleNewContactCount}
          onChange={(event) => setEligibleNewContactCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Eligible updates</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={eligibleUpdateCount}
          onChange={(event) => setEligibleUpdateCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Duplicates</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={duplicateCount}
          onChange={(event) => setDuplicateCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Suppressed</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={suppressedCount}
          onChange={(event) => setSuppressedCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Missing consent</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={missingConsentCount}
          onChange={(event) => setMissingConsentCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Malformed</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={malformedCount}
          onChange={(event) => setMalformedCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field">
        <span>Lawful basis</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={lawfulBasisCount}
          onChange={(event) => setLawfulBasisCount(event.target.value)}
        />
      </label>
      <label className="admin-form-field admin-step-goal-field">
        <span>Private note</span>
        <textarea
          value={privateNote}
          onChange={(event) => setPrivateNote(event.target.value)}
          rows={3}
          placeholder="Private preflight note, hashed before storage"
        />
      </label>
      <button type="submit" className="secondary-action admin-step-goal-field" disabled={isSubmitting || !selectedIntent}>
        {isSubmitting ? "Recording..." : "Record import preflight"}
        <ShieldCheck aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error admin-step-goal-field">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.preflight ? (
        <div className="checkout-alert success admin-step-goal-field">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Import preflight replayed" : "Import preflight recorded"}</strong>
            <span>
              {response.preflight.expectedImportIntentSourceLabel} checked {response.preflight.totalContactsChecked}{" "}
              contacts; subscriber rows created: {String(response.preflight.subscriberRowsCreated)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
