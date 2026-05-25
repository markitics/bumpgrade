"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import type { EmailSequence } from "@/lib/audience-automation";
import type { AudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";
import {
  audienceSequenceTestSendApiRoute,
  audienceSequenceTestSendConfirmationText,
} from "@/lib/audience-sequence-test-sends";

type AdminSequenceTestSendFormProps = {
  sequences: EmailSequence[];
  readiness: AudienceSequenceDeliveryReadinessSummary;
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
    sequenceId: string;
    stepId: string;
    provider: string;
    providerOk: boolean;
    ownerTestEmailSent: boolean;
    ownerTestEmailCaptured: boolean;
    developmentNoop: boolean;
    subscriberPayloadsCreated: false;
    publicAgentSendCreated: false;
    queueMessagesCreated: false;
    providerMessageIdsIncluded: false;
  };
};

export function AdminSequenceTestSendForm({
  sequences,
  readiness,
  latestTestSendId,
}: AdminSequenceTestSendFormProps) {
  const [response, setResponse] = useState<TestSendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedSequence = useMemo(() => sequences[0] ?? null, [sequences]);
  const selectedStep = selectedSequence?.steps[0] ?? null;
  const selectedReadinessRecord = readiness.records.find(
    (record) => record.sequenceId === selectedSequence?.id,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSequence || !selectedStep || !selectedReadinessRecord) {
      setError("The sequence needs a current readiness record before an owner test send can be recorded.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const testSendResponse = await fetch(audienceSequenceTestSendApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sequenceId: selectedSequence.id,
          stepId: selectedStep.id,
          expectedWorkspaceRevisionId: readiness.workspace.revisionId,
          expectedSequenceStatus: selectedReadinessRecord.status,
          expectedReadyEnrollmentCount: readiness.counts.readyEnrollments,
          confirmationText: audienceSequenceTestSendConfirmationText,
          idempotencyKey: `sequence-owner-test-send-${crypto.randomUUID()}`,
          auditCorrelationId: `admin-audience-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await testSendResponse.json()) as TestSendResponse;
      if (!testSendResponse.ok || !payload.ok) {
        setError(payload.message ?? "The owner-only sequence test send could not be recorded.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "The owner-only sequence test send could not be recorded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor" aria-label="Send owner-only sequence test email" onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>Sequence owner test</span>
          <strong>{selectedSequence?.id ?? "No sequence"}</strong>
          <p>
            Sends the first seeded sequence step only to the verified owner session email. Subscriber payloads, Queue
            messages, public agent sends, raw recipient emails, and provider message IDs stay disabled.
          </p>
        </div>
      </div>
      <div className="roadmap-detail">
        <strong>Step</strong>
        <span>{selectedStep?.id ?? "missing"}</span>
      </div>
      <div className="roadmap-detail">
        <strong>Expected revision</strong>
        <span>{readiness.workspace.revisionId}</span>
      </div>
      <div className="roadmap-detail">
        <strong>Ready enrollments checked</strong>
        <span>{readiness.counts.readyEnrollments}</span>
      </div>
      {latestTestSendId ? (
        <div className="roadmap-detail">
          <strong>Latest sequence test</strong>
          <span>{latestTestSendId}</span>
        </div>
      ) : null}
      <button type="submit" className="secondary-action" disabled={isSubmitting || !selectedReadinessRecord}>
        {isSubmitting ? "Sending..." : "Send sequence test"}
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
            <strong>{response.duplicate ? "Sequence test replayed" : "Sequence test recorded"}</strong>
            <span>
              {response.testSend.provider} {response.testSend.ownerTestEmailCaptured ? "captured" : "accepted"} for{" "}
              {response.testSend.stepId}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
