import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceScheduleIntentIssue = 354;
export const audienceSequenceScheduleIntentStatus = "sequence-schedule-intents-ready";
export const audienceSequenceScheduleIntentApiRoute = "/api/admin/audience/sequences/schedule-intents";
export const audienceSequenceScheduleIntentConfirmationText = "Create dry-run Bumpgrade sequence schedule intent";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceScheduleIntentRow = {
  id: string;
  sequence_id: string;
  status: string;
  schedule_kind: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  ready_enrollment_count: number | string | null;
  held_enrollment_count: number | string | null;
  active_suppression_count: number | string | null;
  requested_start_at: string | null;
  idempotency_key: string;
  created_at: number | string | null;
};

export type AudienceSequenceScheduleIntentPublic = {
  id: string;
  sequenceId: string;
  status: string;
  scheduleKind: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  readyEnrollmentCount: number;
  heldEnrollmentCount: number;
  activeSuppressionCount: number;
  requestedStartAt: string | null;
  duplicate: boolean;
  createdAt: string | null;
  deliveryQueueRowsCreated: false;
  recipientPayloadsCreated: false;
  personalizedBodiesCreated: false;
  unsubscribeUrlsCreated: false;
  providerMessageIdsIncluded: false;
};

export type AudienceSequenceScheduleIntentSummary = {
  id: "audience-sequence-schedule-intent-contract";
  status: typeof audienceSequenceScheduleIntentStatus;
  issue: typeof audienceSequenceScheduleIntentIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceScheduleIntentApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceScheduleIntentConfirmationText;
  };
  counts: {
    scheduleIntents: number;
    activeDryRunIntents: number;
    readyEnrollmentsReserved: number;
    heldEnrollmentsSnapshotted: number;
    deliveryQueueRowsCreatedRecords: 0;
    recipientPayloadsCreatedRecords: 0;
    personalizedBodiesCreatedRecords: 0;
    unsubscribeUrlsCreatedRecords: 0;
    providerMessageIdsCreatedRecords: 0;
  };
  latestIntents: AudienceSequenceScheduleIntentPublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    deliveryQueuePayloadsIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodiesIncluded: false;
    unsubscribeUrlsIncluded: false;
    providerMessageIdsIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateSequenceScheduleIntentInput = {
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  requestedStartAt?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceScheduleIntentResult =
  | {
      ok: true;
      status: "sequence_schedule_intent_recorded" | "sequence_schedule_intent_replayed";
      duplicate: boolean;
      intent: AudienceSequenceScheduleIntentPublic;
      redaction: AudienceSequenceScheduleIntentSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "intent_not_created";
      message: string;
      redaction: AudienceSequenceScheduleIntentSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
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

function timestampValue(value: number | string | null | undefined) {
  const seconds = numberValue(value);
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function parseString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function parseInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function heldEnrollmentCount(counts: {
  draftEnrollments: number;
  readyEnrollments: number;
  pausedEnrollments: number;
  unsubscribedEnrollments: number;
  suppressedEnrollments: number;
  missingConsentEnrollments: number;
}) {
  const explicitHeld =
    counts.pausedEnrollments +
    counts.unsubscribedEnrollments +
    counts.suppressedEnrollments +
    counts.missingConsentEnrollments;
  return Math.max(explicitHeld, counts.draftEnrollments - counts.readyEnrollments, 0);
}

function publicSequenceScheduleIntent(
  row: SequenceScheduleIntentRow,
  duplicate: boolean,
): AudienceSequenceScheduleIntentPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    status: row.status,
    scheduleKind: row.schedule_kind,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    readyEnrollmentCount: numberValue(row.ready_enrollment_count),
    heldEnrollmentCount: numberValue(row.held_enrollment_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    requestedStartAt: row.requested_start_at,
    duplicate,
    createdAt: timestampValue(row.created_at),
    deliveryQueueRowsCreated: false,
    recipientPayloadsCreated: false,
    personalizedBodiesCreated: false,
    unsubscribeUrlsCreated: false,
    providerMessageIdsIncluded: false,
  };
}

function emptySummary(
  source: AudienceSequenceScheduleIntentSummary["source"],
  loadError: string | null,
): AudienceSequenceScheduleIntentSummary {
  return {
    id: "audience-sequence-schedule-intent-contract",
    status: audienceSequenceScheduleIntentStatus,
    issue: audienceSequenceScheduleIntentIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceScheduleIntentApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceScheduleIntentConfirmationText,
    },
    counts: {
      scheduleIntents: 0,
      activeDryRunIntents: 0,
      readyEnrollmentsReserved: 0,
      heldEnrollmentsSnapshotted: 0,
      deliveryQueueRowsCreatedRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      personalizedBodiesCreatedRecords: 0,
      unsubscribeUrlsCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
    },
    latestIntents: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      deliveryQueuePayloadsIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
      unsubscribeUrlsIncluded: false,
      providerMessageIdsIncluded: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberId",
      "subscriberEmailHash",
      "suppressionHash",
      "actorEmail",
      "deliveryQueuePayload",
      "recipientPayload",
      "personalizedBody",
      "bodyTemplate",
      "unsubscribeUrl",
      "providerMessageId",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #354 lets verified owners record dry-run sequence schedule intent metadata after exact confirmation, idempotency, workspace revision, sequence status, and expected readiness checks. It does not schedule sequence steps, create delivery queue rows, create recipient payloads, create personalized bodies, expose unsubscribe URLs, send through a provider, create provider message IDs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

async function findIntentByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, status, schedule_kind, expected_workspace_revision_id, expected_sequence_status,
        ready_enrollment_count, held_enrollment_count, active_suppression_count, requested_start_at,
        idempotency_key, created_at
      FROM audience_sequence_schedule_intents
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<SequenceScheduleIntentRow>();
}

export async function getAudienceSequenceScheduleIntentSummary(): Promise<AudienceSequenceScheduleIntentSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS schedule_intent_count,
          SUM(CASE WHEN status = 'dry_run_recorded' THEN 1 ELSE 0 END) AS active_dry_run_intent_count,
          COALESCE(SUM(ready_enrollment_count), 0) AS ready_enrollment_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count
        FROM audience_sequence_schedule_intents`,
      )
      .first<{
        schedule_intent_count: number | string | null;
        active_dry_run_intent_count: number | string | null;
        ready_enrollment_count: number | string | null;
        held_enrollment_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, sequence_id, status, schedule_kind, expected_workspace_revision_id, expected_sequence_status,
          ready_enrollment_count, held_enrollment_count, active_suppression_count, requested_start_at,
          idempotency_key, created_at
        FROM audience_sequence_schedule_intents
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<SequenceScheduleIntentRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        ...emptySummary("d1", null).counts,
        scheduleIntents: numberValue(counts?.schedule_intent_count),
        activeDryRunIntents: numberValue(counts?.active_dry_run_intent_count),
        readyEnrollmentsReserved: numberValue(counts?.ready_enrollment_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
      },
      latestIntents: (latest.results ?? []).map((row) => publicSequenceScheduleIntent(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence schedule intents.",
    );
  }
}

export async function createAudienceSequenceScheduleIntent(
  input: CreateSequenceScheduleIntentInput,
): Promise<CreateSequenceScheduleIntentResult> {
  const redaction = emptySummary("d1", null).redaction;
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const requestedStartAt = parseString(input.requestedStartAt);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !sequenceId ||
    !expectedWorkspaceRevisionId ||
    !expectedSequenceStatus ||
    expectedReadyEnrollmentCount === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "A sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceScheduleIntentConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording a sequence schedule intent.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findIntentByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_schedule_intent_replayed",
      duplicate: true,
      intent: publicSequenceScheduleIntent(existing, true),
      redaction,
    };
  }

  const readiness = await getAudienceSequenceDeliveryReadinessSummary();
  if (readiness.source !== "d1") {
    return {
      ok: false,
      status: "readiness_unavailable",
      message: readiness.loadError ?? "Sequence delivery readiness is unavailable.",
      redaction,
    };
  }

  const sequence = readiness.records.find((record) => record.sequenceId === sequenceId);
  if (!sequence) {
    return {
      ok: false,
      status: "sequence_not_found",
      message: "The sequence could not be found.",
      redaction,
    };
  }

  if (readiness.workspace.revisionId !== expectedWorkspaceRevisionId) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before the sequence schedule intent was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before the schedule intent was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before the schedule intent was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const intentId = `sequence-schedule-intent-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_sequence_schedule_intents (
        id, sequence_id, status, schedule_kind, expected_workspace_revision_id, expected_sequence_status,
        ready_enrollment_count, held_enrollment_count, active_suppression_count, requested_start_at,
        idempotency_key, actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, 'dry_run_recorded', 'owner_confirmed_dry_run', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      intentId,
      sequence.sequenceId,
      readiness.workspace.revisionId,
      sequence.status,
      readiness.counts.readyEnrollments,
      heldEnrollmentCount(readiness.counts),
      readiness.counts.activeSuppressionEntries,
      requestedStartAt,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceScheduleIntentIssue,
        deliveryQueueRowsCreated: false,
        recipientPayloadsCreated: false,
        personalizedBodiesCreated: false,
        unsubscribeUrlsCreated: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const intent = await findIntentByIdempotency(db, idempotencyKey);
  if (!intent) {
    return {
      ok: false,
      status: "intent_not_created",
      message: "The sequence schedule intent could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_schedule_intent_recorded",
    duplicate: false,
    intent: publicSequenceScheduleIntent(intent, false),
    redaction,
  };
}
