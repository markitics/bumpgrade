"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import { audienceOptInApiRoute } from "@/lib/audience-opt-in";

type AudienceOptInFormProps = {
  formId: string;
  consentStatement: string;
};

type OptInResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  normalizedEmail?: string;
  sequenceId?: string;
  tagIds?: string[];
  duplicate?: boolean;
  emailDeliveryEnabled?: boolean;
};

export function AudienceOptInForm({ formId, consentStatement }: AudienceOptInFormProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [consent, setConsent] = useState(false);
  const [response, setResponse] = useState<OptInResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const optInResponse = await fetch(audienceOptInApiRoute, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          consent,
          formId,
          idempotencyKey: `audience-opt-in-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await optInResponse.json()) as OptInResponse;
      if (!optInResponse.ok || !payload.ok) {
        setError(payload.message ?? "The opt-in could not be saved.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The opt-in could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="checkout-start-panel audience-opt-in-panel" onSubmit={handleSubmit}>
      <label className="checkout-field">
        Email address
        <input
          type="email"
          value={email}
          autoComplete="email"
          inputMode="email"
          placeholder="publisher@example.com"
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="checkout-field">
        First name, optional
        <input
          type="text"
          value={firstName}
          autoComplete="given-name"
          placeholder="Mark"
          onChange={(event) => setFirstName(event.target.value)}
        />
      </label>
      <label className="audience-consent-row">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>{consentStatement}</span>
      </label>
      <button type="submit" className="primary-action" disabled={isSubmitting}>
        {isSubmitting ? "Joining..." : "Join waitlist"}
        <Send aria-hidden="true" />
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
            <strong>{response.duplicate ? "Already on the waitlist" : "Waitlist opt-in saved"}</strong>
            <span>{response.normalizedEmail}</span>
            <span>Email delivery remains disabled until the next confirmed-write slice.</span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
