"use client";

import { useRef } from "react";

type ImporterDraftFormProps = {
  action: string;
  confirmationText: string;
  platformName: string;
};

export function ImporterDraftForm({ action, confirmationText, platformName }: ImporterDraftFormProps) {
  const idempotencyRef = useRef<HTMLInputElement>(null);

  function ensureIdempotencyKey() {
    if (!idempotencyRef.current || idempotencyRef.current.value) return;

    const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    idempotencyRef.current.value = `${platformName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-import-${random}`;
  }

  return (
    <form action={action} method="post" className="importer-draft-form" onSubmit={ensureIdempotencyKey}>
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

      <button type="submit" className="primary-action">
        Create private import plan
      </button>
    </form>
  );
}
