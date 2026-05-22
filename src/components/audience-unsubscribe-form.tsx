"use client";

import { AlertCircle, CheckCircle2, MailX } from "lucide-react";
import { FormEvent, useState } from "react";

import { audienceUnsubscribeApiRoute } from "@/lib/audience-unsubscribe";

type UnsubscribeResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  normalizedEmail?: string;
  suppressionEntryId?: string;
  duplicate?: boolean;
  emailDeliveryEnabled?: boolean;
  redaction?: {
    subscriberExistenceRevealed?: boolean;
  };
};

export function AudienceUnsubscribeForm() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [response, setResponse] = useState<UnsubscribeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);
    const normalizedEmail = email.trim();
    const normalizedReason = reason.trim();
    setEmail(normalizedEmail);
    setReason(normalizedReason);

    try {
      const unsubscribeResponse = await fetch(audienceUnsubscribeApiRoute, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          reason: normalizedReason,
          idempotencyKey: `audience-unsubscribe-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await unsubscribeResponse.json()) as UnsubscribeResponse;
      if (!unsubscribeResponse.ok || !payload.ok) {
        setError(payload.message ?? "The unsubscribe preference could not be saved.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The unsubscribe preference could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="checkout-start-panel audience-opt-in-panel" aria-label="Audience unsubscribe" onSubmit={handleSubmit} noValidate>
      <div>
        <span className="status-badge active">Preference</span>
        <h3>Record an unsubscribe preference</h3>
        <p>Bumpgrade can save suppression preferences before any campaign is sent.</p>
      </div>
      <label className="checkout-field">
        Email address
        <input
          type="email"
          value={email}
          autoComplete="email"
          inputMode="email"
          placeholder="publisher@example.com"
          onChange={(event) => setEmail(event.target.value)}
          onBlur={(event) => setEmail(event.currentTarget.value.trim())}
        />
      </label>
      <label className="checkout-field">
        Reason, optional
        <input
          type="text"
          value={reason}
          placeholder="No longer interested"
          onChange={(event) => setReason(event.target.value)}
          onBlur={(event) => setReason(event.currentTarget.value.trim())}
        />
      </label>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record unsubscribe"}
        <MailX aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Preference already recorded" : "Unsubscribe preference recorded"}</strong>
            <span>{response.normalizedEmail}</span>
            <span>List membership is not exposed in the public response.</span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
