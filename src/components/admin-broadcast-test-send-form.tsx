"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  audienceBroadcastTestSendApiRoute,
  audienceBroadcastTestSendConfirmationText,
  type AudienceBroadcastDraftReadiness,
} from "@/lib/audience-broadcasts";

type AdminBroadcastTestSendFormProps = {
  drafts: AudienceBroadcastDraftReadiness[];
  latestTestSendId: string | null;
};

type TestSendResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  testSend?: {
    id: string;
    draftId: string;
    provider: string;
    providerOk: boolean;
    ownerTestEmailSent: boolean;
    ownerTestEmailCaptured: boolean;
    developmentNoop: boolean;
    subscriberPayloadsCreated: false;
    publicAgentSendCreated: false;
    providerMessageIdsIncluded: false;
  };
};

export function AdminBroadcastTestSendForm({ drafts, latestTestSendId }: AdminBroadcastTestSendFormProps) {
  const [response, setResponse] = useState<TestSendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedDraft = useMemo(() => drafts[0] ?? null, [drafts]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDraft?.updatedAt) {
      setError("The broadcast draft needs a current revision before an owner test send can be recorded.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const testSendResponse = await fetch(audienceBroadcastTestSendApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          draftId: selectedDraft.id,
          expectedDraftUpdatedAt: selectedDraft.updatedAt,
          expectedReadyRecipientCount: selectedDraft.readyRecipientCount,
          confirmationText: audienceBroadcastTestSendConfirmationText,
          idempotencyKey: `broadcast-owner-test-send-${crypto.randomUUID()}`,
          auditCorrelationId: `admin-audience-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await testSendResponse.json()) as TestSendResponse;
      if (!testSendResponse.ok || !payload.ok) {
        setError(payload.message ?? "The owner-only broadcast test send could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "The owner-only broadcast test send could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor" aria-label="Send owner-only broadcast test email" onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>Owner test send</span>
          <strong>{selectedDraft?.id ?? "No broadcast draft"}</strong>
          <p>
            Sends only to the verified owner session email. Subscriber payloads, Queue messages, public agent sends, raw
            recipient emails, and provider message IDs stay disabled.
          </p>
        </div>
      </div>
      <div className="roadmap-detail">
        <strong>Expected revision</strong>
        <span>{selectedDraft?.updatedAt ?? "missing"}</span>
      </div>
      <div className="roadmap-detail">
        <strong>Ready recipients checked</strong>
        <span>{selectedDraft?.readyRecipientCount ?? 0}</span>
      </div>
      {latestTestSendId ? (
        <div className="roadmap-detail">
          <strong>Latest test send</strong>
          <span>{latestTestSendId}</span>
        </div>
      ) : null}
      <button type="submit" className="secondary-action" disabled={isSubmitting || !selectedDraft?.updatedAt}>
        {isSubmitting ? "Sending..." : "Send owner test"}
        <Send aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.testSend ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Owner test replayed" : "Owner test recorded"}</strong>
            <span>
              {response.testSend.provider} {response.testSend.ownerTestEmailCaptured ? "captured" : "accepted"} for{" "}
              {response.testSend.draftId}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
