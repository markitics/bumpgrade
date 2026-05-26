"use client";

import { useRef, useState } from "react";

type ImporterDraftFormProps = {
  action: string;
  confirmationText: string;
  platformName: string;
  previewAction: string;
};

type ImporterPreview = {
  title: string;
  status: string;
  inputSummary: {
    sourceUrlProvided: boolean;
    sourceFileNameCount: number;
    pageCopyProvided: boolean;
    followUpNotesProvided: boolean;
    launchGoalProvided: boolean;
    audienceProvided: boolean;
    rawSourceEchoed: false;
  };
  sourceChecklistReview: Array<{
    id: string;
    label: string;
    status: string;
    matchedSignals: string[];
    missingSignals: string[];
    usesItFor: string;
    reviewPrompt: string;
    rawSourceEchoed: false;
  }>;
  detectedAreas: Array<{
    id: string;
    label: string;
    status: string;
    draftEntities: string[];
  }>;
  draftStepPreview: Array<{
    id: string;
    label: string;
    prepares: string[];
  }>;
  safetyGates: string[];
};

type ImporterPreviewResponse = {
  ok?: boolean;
  error?: string;
  preview?: ImporterPreview;
};

function areaStatusLabel(status: string) {
  if (status === "ready_to_review") return "Ready to review";
  if (status === "needs_more_context") return "Needs more context";
  return "Needs source material";
}

function signalSummary(signals: string[], emptyText: string) {
  return signals.length > 0 ? signals.join(", ") : emptyText;
}

export function ImporterDraftForm({ action, confirmationText, platformName, previewAction }: ImporterDraftFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const idempotencyRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImporterPreview | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  function ensureIdempotencyKey() {
    if (!idempotencyRef.current || idempotencyRef.current.value) return;

    const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    idempotencyRef.current.value = `${platformName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-import-${random}`;
  }

  async function reviewImportMap() {
    if (!formRef.current) return;

    setIsReviewing(true);
    setPreviewError("");

    const body = new FormData(formRef.current);
    body.set("return", "json");

    try {
      const response = await fetch(previewAction, {
        method: "POST",
        headers: { accept: "application/json" },
        body,
      });
      const payload = (await response.json().catch(() => null)) as ImporterPreviewResponse | null;

      if (!response.ok || !payload?.ok || !payload.preview) {
        setPreview(null);
        setPreviewError(payload?.error ?? "Unable to review that import map.");
        return;
      }

      setPreview(payload.preview);
    } catch {
      setPreview(null);
      setPreviewError("Unable to review that import map.");
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <>
      <form ref={formRef} action={action} method="post" className="importer-draft-form" onSubmit={ensureIdempotencyKey}>
        <input ref={idempotencyRef} type="hidden" name="idempotencyKey" />

        <div className="importer-form-grid">
          <label>
            Offer or funnel name
            <input name="offerTitle" type="text" minLength={3} maxLength={120} required />
          </label>
          <label>
            Audience
            <input name="audience" type="text" maxLength={180} />
          </label>
        </div>

        <label>
          Source URL
          <input name="sourceUrl" type="url" maxLength={500} inputMode="url" />
        </label>

        <label>
          Export file names
          <textarea name="sourceFileNames" maxLength={1000} rows={3} />
        </label>

        <label>
          Launch goal
          <textarea name="launchGoal" maxLength={300} rows={3} />
        </label>

        <label>
          Page or offer copy
          <textarea name="pageCopy" maxLength={2000} rows={6} />
        </label>

        <label>
          Follow-up notes
          <textarea name="followUpNotes" maxLength={1000} rows={4} />
        </label>

        <label>
          Type this to create the private import plan: <strong>{confirmationText}</strong>
          <input name="confirmationText" type="text" maxLength={80} required />
        </label>

        <div className="importer-form-actions">
          <button type="button" className="secondary-action" onClick={reviewImportMap} disabled={isReviewing}>
            {isReviewing ? "Reviewing import map" : "Review import map"}
          </button>
          <button type="submit" className="primary-action">
            Create private import plan
          </button>
        </div>
      </form>

      {previewError ? <p className="account-error">{previewError}</p> : null}

      {preview ? (
        <section className="importer-preview-panel" aria-live="polite">
          <div>
            <p className="eyebrow">Import review map</p>
            <h3>{preview.title}</h3>
            <p>
              Bumpgrade can prepare {preview.detectedAreas.length} review areas, {preview.sourceChecklistReview.length} source
              guide items, and {preview.draftStepPreview.length} draft steps before anything goes live.
            </p>
          </div>
          <div className="importer-preview-summary">
            <span>Source URL {preview.inputSummary.sourceUrlProvided ? "included" : "not included"}</span>
            <span>{preview.inputSummary.sourceFileNameCount} export file names</span>
            <span>Page copy {preview.inputSummary.pageCopyProvided ? "included" : "not included"}</span>
            <span>Follow-up notes {preview.inputSummary.followUpNotesProvided ? "included" : "not included"}</span>
            <span>Launch goal {preview.inputSummary.launchGoalProvided ? "included" : "not included"}</span>
            <span>Audience {preview.inputSummary.audienceProvided ? "included" : "not included"}</span>
          </div>
          <div className="importer-preview-grid">
            {preview.sourceChecklistReview.map((item) => (
              <article key={item.id}>
                <span>{areaStatusLabel(item.status)}</span>
                <h4>{item.label}</h4>
                <p>{item.usesItFor}</p>
                <p>Matched: {signalSummary(item.matchedSignals, "Add matching source material")}</p>
              </article>
            ))}
          </div>
          <div className="importer-preview-grid">
            {preview.detectedAreas.map((area) => (
              <article key={area.id}>
                <span>{areaStatusLabel(area.status)}</span>
                <h4>{area.label}</h4>
                <p>{area.draftEntities.map((entity) => entity.replace(/^draft_/, "").replaceAll("_", " ")).join(", ")}</p>
              </article>
            ))}
          </div>
          <div className="importer-preview-steps">
            {preview.draftStepPreview.map((step) => (
              <article key={step.id}>
                <h4>{step.label}</h4>
                <p>{step.prepares.join(", ")}</p>
              </article>
            ))}
          </div>
          <ul className="importer-preview-gates">
            {preview.safetyGates.map((gate) => (
              <li key={gate}>{gate}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
