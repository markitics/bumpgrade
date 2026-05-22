import { getCloudflareContext } from "@opennextjs/cloudflare";

import { audienceAutomationWorkspace } from "@/lib/audience-automation";

export const audienceSequenceDeliveryReadinessIssue = 351;
export const audienceSequenceDeliveryReadinessStatus = "audience-sequence-delivery-readiness-ready";
export const audienceSequenceDeliveryReadinessOwnerRoute = "/admin/audience";
export const audienceSequenceDeliveryReadinessPublicSourceDataRoute = "/audience/source-data";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceReadinessCountRow = {
  draft_enrollment_count: number | string | null;
  ready_enrollment_count: number | string | null;
  paused_enrollment_count: number | string | null;
  unsubscribed_enrollment_count: number | string | null;
  suppressed_enrollment_count: number | string | null;
  missing_consent_enrollment_count: number | string | null;
  subscribed_subscriber_count: number | string | null;
  consented_subscriber_count: number | string | null;
  active_suppression_entry_count: number | string | null;
};

type SequenceReadinessRecord = {
  id: string;
  sequenceId: string;
  title: string;
  linkedFormId: string;
  status: string;
  stepCount: number;
  immediateSteps: number;
  delayedSteps: number;
  agentEditableSteps: number;
  deliveryEnabled: false;
  recipientPayloadsCreated: false;
  personalizedBodiesCreated: false;
  queueMessagesCreated: false;
  providerSendEnabled: false;
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
  workspace: {
    id: string;
    title: string;
    revisionId: string;
    status: string;
  };
  scheduleMode: "readiness_only";
  deliveryEnabled: false;
  counts: {
    sequences: number;
    sequenceSteps: number;
    immediateSteps: number;
    delayedSteps: number;
    draftEnrollments: number;
    readyEnrollments: number;
    pausedEnrollments: number;
    unsubscribedEnrollments: number;
    suppressedEnrollments: number;
    missingConsentEnrollments: number;
    subscribedSubscribers: number;
    consentedSubscribers: number;
    activeSuppressionEntries: number;
    deliveryQueueRowsCreatedRecords: 0;
    recipientPayloadsCreatedRecords: 0;
    personalizedBodiesCreatedRecords: 0;
    emailSendEnabledRecords: 0;
    providerMessageIdsCreatedRecords: 0;
    unsubscribeUrlsCreatedRecords: 0;
  };
  redaction: {
    privateContactDataIncluded: false;
    rawEmailsIncluded: false;
    subscriberIdsIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodiesIncluded: false;
    bodyTemplatesIncluded: false;
    unsubscribeUrlsIncluded: false;
    providerMessageIdsIncluded: false;
    queuePayloadsIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
  };
  records: SequenceReadinessRecord[];
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

function staticRecords(): SequenceReadinessRecord[] {
  return audienceAutomationWorkspace.sequences.map((sequence) => {
    const immediateSteps = sequence.steps.filter((step) => step.timing === "immediate").length;
    const delayedSteps = sequence.steps.length - immediateSteps;
    return {
      id: `${sequence.id}-delivery-readiness`,
      sequenceId: sequence.id,
      title: sequence.title,
      linkedFormId: sequence.linkedFormId,
      status: sequence.status,
      stepCount: sequence.steps.length,
      immediateSteps,
      delayedSteps,
      agentEditableSteps: sequence.steps.filter((step) => step.agentEditable).length,
      deliveryEnabled: false,
      recipientPayloadsCreated: false,
      personalizedBodiesCreated: false,
      queueMessagesCreated: false,
      providerSendEnabled: false,
    };
  });
}

function staticCounts() {
  const records = staticRecords();
  return {
    sequences: records.length,
    sequenceSteps: records.reduce((total, record) => total + record.stepCount, 0),
    immediateSteps: records.reduce((total, record) => total + record.immediateSteps, 0),
    delayedSteps: records.reduce((total, record) => total + record.delayedSteps, 0),
  };
}

function emptySummary(
  source: AudienceSequenceDeliveryReadinessSummary["source"],
  loadError: string | null,
): AudienceSequenceDeliveryReadinessSummary {
  const counts = staticCounts();
  return {
    id: "audience-sequence-delivery-readiness-contract",
    status: audienceSequenceDeliveryReadinessStatus,
    issue: audienceSequenceDeliveryReadinessIssue,
    parentIssue: 17,
    ownerRoute: audienceSequenceDeliveryReadinessOwnerRoute,
    publicSourceDataRoute: audienceSequenceDeliveryReadinessPublicSourceDataRoute,
    source,
    loadError,
    workspace: {
      id: audienceAutomationWorkspace.id,
      title: audienceAutomationWorkspace.title,
      revisionId: audienceAutomationWorkspace.revisionId,
      status: audienceAutomationWorkspace.status,
    },
    scheduleMode: "readiness_only",
    deliveryEnabled: false,
    counts: {
      ...counts,
      draftEnrollments: 0,
      readyEnrollments: 0,
      pausedEnrollments: 0,
      unsubscribedEnrollments: 0,
      suppressedEnrollments: 0,
      missingConsentEnrollments: 0,
      subscribedSubscribers: 0,
      consentedSubscribers: 0,
      activeSuppressionEntries: 0,
      deliveryQueueRowsCreatedRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      personalizedBodiesCreatedRecords: 0,
      emailSendEnabledRecords: 0,
      providerMessageIdsCreatedRecords: 0,
      unsubscribeUrlsCreatedRecords: 0,
    },
    redaction: {
      privateContactDataIncluded: false,
      rawEmailsIncluded: false,
      subscriberIdsIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
      bodyTemplatesIncluded: false,
      unsubscribeUrlsIncluded: false,
      providerMessageIdsIncluded: false,
      queuePayloadsIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
    },
    records: staticRecords(),
    privateFieldsExcluded: [
      "subscriberId",
      "email",
      "firstName",
      "emailHash",
      "suppressionHash",
      "recipientPayload",
      "personalizedBody",
      "bodyTemplate",
      "unsubscribeUrl",
      "queuePayload",
      "providerMessageId",
      "actorEmail",
    ],
    writeBoundary:
      "Issue #351 exposes aggregate audience sequence delivery readiness for draft nurture sequences without creating delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider message IDs, queue payloads, or direct public agent sequence writes. Real sequence scheduling and sending still require future owner-confirmed APIs with actor identity, exact confirmation, consent and suppression rechecks, unsubscribe footer safety, sender-domain and provider readiness, idempotency, audit correlation, rate limits, and redaction.",
  };
}

export async function getAudienceSequenceDeliveryReadinessSummary(): Promise<AudienceSequenceDeliveryReadinessSummary> {
  let runtime: AudienceRuntime;
  try {
    runtime = await getRuntime();
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Audience sequence runtime unavailable.");
  }

  try {
    const counts = await runtime.db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM audience_sequence_enrollments WHERE status = 'draft_enrolled') AS draft_enrollment_count,
          (
            SELECT COUNT(*)
            FROM audience_sequence_enrollments enrollments
            JOIN audience_subscribers subscribers ON subscribers.id = enrollments.subscriber_id
            WHERE enrollments.status = 'draft_enrolled'
              AND subscribers.status = 'subscribed'
              AND EXISTS (
                SELECT 1
                FROM audience_consent_events consent
                WHERE consent.subscriber_id = enrollments.subscriber_id
                  AND consent.status = 'consented'
              )
              AND NOT EXISTS (
                SELECT 1
                FROM audience_suppression_entries suppression
                WHERE suppression.subscriber_id = enrollments.subscriber_id
                  AND suppression.status = 'active'
              )
          ) AS ready_enrollment_count,
          (SELECT COUNT(*) FROM audience_sequence_enrollments WHERE status = 'unsubscribe_paused') AS paused_enrollment_count,
          (
            SELECT COUNT(*)
            FROM audience_sequence_enrollments enrollments
            JOIN audience_subscribers subscribers ON subscribers.id = enrollments.subscriber_id
            WHERE subscribers.status = 'unsubscribed'
          ) AS unsubscribed_enrollment_count,
          (
            SELECT COUNT(DISTINCT enrollments.id)
            FROM audience_sequence_enrollments enrollments
            JOIN audience_suppression_entries suppression ON suppression.subscriber_id = enrollments.subscriber_id
            WHERE suppression.status = 'active'
          ) AS suppressed_enrollment_count,
          (
            SELECT COUNT(*)
            FROM audience_sequence_enrollments enrollments
            WHERE NOT EXISTS (
              SELECT 1
              FROM audience_consent_events consent
              WHERE consent.subscriber_id = enrollments.subscriber_id
                AND consent.status = 'consented'
            )
          ) AS missing_consent_enrollment_count,
          (SELECT COUNT(*) FROM audience_subscribers WHERE status = 'subscribed') AS subscribed_subscriber_count,
          (SELECT COUNT(DISTINCT subscriber_id) FROM audience_consent_events WHERE status = 'consented') AS consented_subscriber_count,
          (SELECT COUNT(*) FROM audience_suppression_entries WHERE status = 'active') AS active_suppression_entry_count`,
      )
      .first<SequenceReadinessCountRow>();
    const summary = emptySummary("d1", null);

    return {
      ...summary,
      counts: {
        ...summary.counts,
        draftEnrollments: numberValue(counts?.draft_enrollment_count),
        readyEnrollments: numberValue(counts?.ready_enrollment_count),
        pausedEnrollments: numberValue(counts?.paused_enrollment_count),
        unsubscribedEnrollments: numberValue(counts?.unsubscribed_enrollment_count),
        suppressedEnrollments: numberValue(counts?.suppressed_enrollment_count),
        missingConsentEnrollments: numberValue(counts?.missing_consent_enrollment_count),
        subscribedSubscribers: numberValue(counts?.subscribed_subscriber_count),
        consentedSubscribers: numberValue(counts?.consented_subscriber_count),
        activeSuppressionEntries: numberValue(counts?.active_suppression_entry_count),
        deliveryQueueRowsCreatedRecords: 0,
        recipientPayloadsCreatedRecords: 0,
        personalizedBodiesCreatedRecords: 0,
        emailSendEnabledRecords: 0,
        providerMessageIdsCreatedRecords: 0,
        unsubscribeUrlsCreatedRecords: 0,
      },
    };
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Audience sequence counts unavailable.");
  }
}
