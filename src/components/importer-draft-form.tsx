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
    uploadedExportFileCount: number;
    parsedExportFileCount: number;
    exportHeaderMatchCount: number;
    exportManifestProvided: boolean;
    pageCopyProvided: boolean;
    followUpNotesProvided: boolean;
    launchGoalProvided: boolean;
    audienceProvided: boolean;
    rawSourceEchoed: false;
  };
  exportFileAnalysis: {
    fileCount: number;
    uploadedFileCount: number;
    pastedManifestCount: number;
    parsedFileCount: number;
    skippedFileCount: number;
    detectedSignalLabels: string[];
    detectedHeaderLabels: string[];
    files: Array<{
      id: string;
      label: string;
      kind: string;
      parseStatus: string;
      sizeBucket: string;
      rowCount: number | null;
      objectCount: number | null;
      detectedHeaderLabels: string[];
      detectedSignalLabels: string[];
      rawFileNameEchoed: false;
      rawRowsEchoed: false;
      rawTextEchoed: false;
    }>;
    rawExportFilesIncluded: false;
    rawFileNamesEchoed: false;
    rawRowsEchoed: false;
    rawTextEchoed: false;
  };
  platformExportMatches: Array<{
    id: string;
    label: string;
    status: string;
    matchedFileKinds: string[];
    matchedRequiredHeaders: string[];
    missingRequiredHeaders: string[];
    matchedHelpfulHeaders: string[];
    matchedSignalLabels: string[];
    sourceChecklistItemIds: string[];
    draftEntities: string[];
    usesItFor: string;
    reviewPrompt: string;
    rawSourceEchoed: false;
  }>;
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

function parseStatusLabel(status: string) {
  if (status === "parsed") return "Parsed";
  if (status === "parsed_truncated") return "Parsed preview";
  if (status === "name_only") return "Name only";
  if (status === "empty") return "Empty";
  return "Needs another export";
}

function exportMatchStatusLabel(status: string) {
  if (status === "recognized") return "Recognized export";
  if (status === "needs_more_context") return "Needs more context";
  return "Not detected yet";
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
      <form
        ref={formRef}
        action={action}
        method="post"
        encType="multipart/form-data"
        className="importer-draft-form"
        onSubmit={ensureIdempotencyKey}
      >
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
          Export files for review map
          <input name="exportFiles" type="file" multiple accept=".csv,.json,.html,.htm,.txt,.xml" />
        </label>

        <label>
          Export manifest or CSV sample
          <textarea name="exportManifest" maxLength={6000} rows={5} />
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
            <span>{preview.inputSummary.uploadedExportFileCount} uploaded export files</span>
            <span>{preview.inputSummary.parsedExportFileCount} parsed export files</span>
            <span>{preview.inputSummary.exportHeaderMatchCount} detected header groups</span>
            <span>Page copy {preview.inputSummary.pageCopyProvided ? "included" : "not included"}</span>
            <span>Follow-up notes {preview.inputSummary.followUpNotesProvided ? "included" : "not included"}</span>
            <span>Launch goal {preview.inputSummary.launchGoalProvided ? "included" : "not included"}</span>
            <span>Audience {preview.inputSummary.audienceProvided ? "included" : "not included"}</span>
          </div>
          {preview.exportFileAnalysis.fileCount > 0 ? (
            <div className="importer-preview-exports">
              <div>
                <h4>Parsed export files</h4>
                <p>
                  {preview.exportFileAnalysis.parsedFileCount} parsed, {preview.exportFileAnalysis.skippedFileCount} reviewed by
                  type, with raw rows and file names kept out of the response.
                </p>
              </div>
              <div className="importer-preview-summary">
                <span>{signalSummary(preview.exportFileAnalysis.detectedSignalLabels, "No structural matches yet")}</span>
                <span>{signalSummary(preview.exportFileAnalysis.detectedHeaderLabels, "No header groups yet")}</span>
              </div>
              <div className="importer-preview-grid">
                {preview.exportFileAnalysis.files.map((file) => (
                  <article key={file.id}>
                    <span>{parseStatusLabel(file.parseStatus)}</span>
                    <h4>{file.label}</h4>
                    <p>
                      {file.kind}; {file.sizeBucket}
                      {file.rowCount !== null ? `; ${file.rowCount} rows` : ""}
                      {file.objectCount !== null ? `; ${file.objectCount} objects` : ""}
                    </p>
                    <p>{signalSummary(file.detectedHeaderLabels, "No safe header groups detected")}</p>
                  </article>
                ))}
              </div>
              <div className="importer-preview-grid">
                {preview.platformExportMatches.map((match) => (
                  <article key={match.id}>
                    <span>{exportMatchStatusLabel(match.status)}</span>
                    <h4>{match.label}</h4>
                    <p>{match.usesItFor}</p>
                    <p>
                      Matched:{" "}
                      {signalSummary([...match.matchedRequiredHeaders, ...match.matchedHelpfulHeaders], "Add matching export columns")}
                    </p>
                    <p>Prepares: {match.draftEntities.map((entity) => entity.replace(/^draft_/, "").replaceAll("_", " ")).join(", ")}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
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
