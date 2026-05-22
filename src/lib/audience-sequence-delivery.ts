import { getCloudflareContext } from "@opennextjs/cloudflare";

import { audienceAutomationWorkspace } from "@/lib/audience-automation";

export const audienceSequenceDeliveryReadinessIssue = 351;
export const audienceSequenceDeliveryReadinessStatus = "audience-sequence-delivery-readiness-ready";
export const audienceSequenceDeliveryReadinessOwnerRoute = "/admin/audience";
export const audienceSequenceDeliveryReadinessPublicSourceDataRoute = "/audience/source-data";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceDeliveryReadinessCountRow = {
  sequence_enrollment_count: number | string | null;
  draft_enrollment_count: number | string | null;
  paused_enrollment_count: number | string | null;
  unsubscribed_hold_count: number | string | null;
  suppression_hold_count: number | string | null;
  eligible_draft_enrollment_count: number | string | null;
  next_step_ready_enrollment_count: number | string | null;
};

export type AudienceSequenceDeliveryReadinessSummary = {
  id: "audience-sequence-delivery-readiness-contract";
  status: typeof audienceSequenceDeliveryReadinessStatus;
  issue: typeof audienceSequenceDeliveryReadinessIssue;
  parentIssue: 17;
  ownerRoute: typeof audienceSequenceDeliveryReadinessOwnerRoute;
  publicSourceDataRoute: typeof audienceSequenceDeliveryReadinessPublicSourceDataRoute;
  source: "d1" | "unavailable";
  loadError: string | null;
  deliveryMode: "disabled_sequence_step_readiness";
  deliveryEnabled: false;
  sequenceContracts: Array<{
    sequenceId: string;
    stepCount: number;
    deliveryEnabled: false;
    bodyTemplatesIncluded: false;
    unsubscribeUrlsCreated: false;
  }>;
  counts: {
    sequences: number;
    sequenceSteps: number;
    sequenceEnrollments: number;
    draftSequenceEnrollments: number;
    pausedSequenceEnrollments: number;
    unsubscribedEnrollmentHolds: number;
    suppressionEnrollmentHolds: number;
    eligibleDraftEnrollments: number;
    nextStepReadyEnrollments: number;
    deliveryAttemptsCreatedRecords: 0;
    recipientPayloadsCreatedRecords: 0;
    personalizedBodiesCreatedRecords: 0;
    bodyTemplatesIncludedRecords: 0;
    unsubscribeUrlsCreatedRecords: 0;
    queuePayloadsCreatedRecords: 0;
    providerCallsCreatedRecords: 0;
    providerMessageIdsCreatedRecords: 0;
    sendUrlsCreatedRecords: 0;
    exportUrlsCreatedRecords: 0;
  };
  redaction: {
    privateContactDataIncluded: false;
    rawEmailsIncluded: false;
    subscriberIdsIncluded: false;
    bodyTemplatesIncluded: false;
    unsubscribeUrlsIncluded: false;
    queuePayloadsIncluded: false;
    providerIdsIncluded: false;
    sendUrlsIncluded: false;
    exportUrlsIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodiesIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

async function getRuntime(): Promise<AudienceRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sequenceContracts() {
  return audienceAutomationWorkspace.sequences.map((sequence) => ({
    sequenceId: sequence.id,
    stepCount: sequence.steps.length,
    deliveryEnabled: false as const,
    bodyTemplatesIncluded: false as const,
    unsubscribeUrlsCreated: false as const,
  }));
}

function sequenceStepCount() {
  return audienceAutomationWorkspace.sequences.reduce((total, sequence) => total + sequence.steps.length, 0);
}

function emptySummary(
  source: AudienceSequenceDeliveryReadinessSummary["source"],
  loadError: string | null,
): AudienceSequenceDeliveryReadinessSummary {
  return {
    id: "audience-sequence-delivery-readiness-contract",
    status: audienceSequenceDeliveryReadinessStatus,
    issue: audienceSequenceDeliveryReadinessIssue,
    parentIssue: 17,
    ownerRoute: audienceSequenceDeliveryReadinessOwnerRoute,
    publicSourceDataRoute: audienceSequenceDeliveryReadinessPublicSourceDataRoute,
    source,
    loadError,
    deliveryMode: "disabled_sequence_step_readiness",
    deliveryEnabled: false,
    sequenceContracts: sequenceContracts(),
    counts: {
      sequences: audienceAutomationWorkspace.sequences.length,
      sequenceSteps: sequenceStepCount(),
      sequenceEnrollments: 0,
      draftSequenceEnrollments: 0,
      pausedSequenceEnrollments: 0,
      unsubscribedEnrollmentHolds: 0,
      suppressionEnrollmentHolds: 0,
      eligibleDraftEnrollments: 0,
      nextStepReadyEnrollments: 0,
      deliveryAttemptsCreatedRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      personalizedBodiesCreatedRecords: 0,
      bodyTemplatesIncludedRecords: 0,
      unsubscribeUrlsCreatedRecords: 0,
      queuePayloadsCreatedRecords: 0,
      providerCallsCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
      sendUrlsCreatedRecords: 0,
      exportUrlsCreatedRecords: 0,
    },
    redaction: {
      privateContactDataIncluded: false,
      rawEmailsIncluded: false,
      subscriberIdsIncluded: false,
      bodyTemplatesIncluded: false,
      unsubscribeUrlsIncluded: false,
      queuePayloadsIncluded: false,
      providerIdsIncluded: false,
      sendUrlsIncluded: false,
      exportUrlsIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
    },
    privateFieldsExcluded: [
      "subscriberId",
      "email",
      "firstName",
      "emailHash",
      "bodyTemplate",
      "personalizedBody",
      "unsubscribeUrl",
      "queuePayload",
      "providerMessageId",
      "providerRecipientId",
      "sendUrl",
      "exportUrl",
    ],
    writeBoundary:
      "Issue #351 exposes aggregate sequence-step delivery readiness for draft nurture enrollments without enabling email delivery, creating recipient payloads, generating personalized bodies, storing body templates, creating unsubscribe URLs, dispatching Cloudflare Queue messages, calling providers, storing provider IDs, or creating send/export URLs. Real sequence delivery still requires owner-confirmed sender-domain, provider-event, rate-limit, response, send-payload, Queue producer, Queue consumer, consent, suppression, unsubscribe-footer, idempotency, audit, and redaction checks.",
  };
}

export async function getAudienceSequenceDeliveryReadinessSummary(): Promise<AudienceSequenceDeliveryReadinessSummary> {
  let runtime: AudienceRuntime;
  try {
    runtime = await getRuntime();
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Audience sequence delivery runtime unavailable.");
  }

  try {
    const counts = await runtime.db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM audience_sequence_enrollments) AS sequence_enrollment_count,
          (SELECT COUNT(*) FROM audience_sequence_enrollments WHERE status = 'draft_enrolled') AS draft_enrollment_count,
          (SELECT COUNT(*) FROM audience_sequence_enrollments WHERE status = 'unsubscribe_paused') AS paused_enrollment_count,
          (
            SELECT COUNT(DISTINCT enrollment.subscriber_id)
            FROM audience_sequence_enrollments enrollment
            INNER JOIN audience_subscribers subscriber ON subscriber.id = enrollment.subscriber_id
            WHERE subscriber.status = 'unsubscribed'
          ) AS unsubscribed_hold_count,
          (
            SELECT COUNT(DISTINCT enrollment.subscriber_id)
            FROM audience_sequence_enrollments enrollment
            INNER JOIN audience_suppression_entries suppression ON suppression.subscriber_id = enrollment.subscriber_id
            WHERE suppression.status = 'active'
          ) AS suppression_hold_count,
          (
            SELECT COUNT(*)
            FROM audience_sequence_enrollments enrollment
            INNER JOIN audience_subscribers subscriber ON subscriber.id = enrollment.subscriber_id
            WHERE enrollment.status = 'draft_enrolled'
              AND subscriber.status = 'subscribed'
              AND EXISTS (
                SELECT 1
                FROM audience_consent_events consent
                WHERE consent.subscriber_id = enrollment.subscriber_id
                  AND consent.status = 'consented'
              )
              AND NOT EXISTS (
                SELECT 1
                FROM audience_suppression_entries suppression
                WHERE suppression.subscriber_id = enrollment.subscriber_id
                  AND suppression.status = 'active'
              )
          ) AS eligible_draft_enrollment_count,
          (
            SELECT COUNT(*)
            FROM audience_sequence_enrollments
            WHERE status = 'draft_enrolled'
              AND next_step_id IS NOT NULL
          ) AS next_step_ready_enrollment_count`,
      )
      .first<SequenceDeliveryReadinessCountRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        sequences: audienceAutomationWorkspace.sequences.length,
        sequenceSteps: sequenceStepCount(),
        sequenceEnrollments: numberValue(counts?.sequence_enrollment_count),
        draftSequenceEnrollments: numberValue(counts?.draft_enrollment_count),
        pausedSequenceEnrollments: numberValue(counts?.paused_enrollment_count),
        unsubscribedEnrollmentHolds: numberValue(counts?.unsubscribed_hold_count),
        suppressionEnrollmentHolds: numberValue(counts?.suppression_hold_count),
        eligibleDraftEnrollments: numberValue(counts?.eligible_draft_enrollment_count),
        nextStepReadyEnrollments: numberValue(counts?.next_step_ready_enrollment_count),
        deliveryAttemptsCreatedRecords: 0,
        recipientPayloadsCreatedRecords: 0,
        personalizedBodiesCreatedRecords: 0,
        bodyTemplatesIncludedRecords: 0,
        unsubscribeUrlsCreatedRecords: 0,
        queuePayloadsCreatedRecords: 0,
        providerCallsCreatedRecords: 0,
        providerMessageIdsCreatedRecords: 0,
        sendUrlsCreatedRecords: 0,
        exportUrlsCreatedRecords: 0,
      },
    };
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Audience sequence delivery counts unavailable.");
  }
}
