import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceDeliveryBatchIssue = 358;
export const audienceSequenceDeliveryBatchStatus = "sequence-delivery-batch-dry-run-ready";
export const audienceSequenceDeliveryBatchApiRoute = "/api/admin/audience/sequences/delivery-batches";
export const audienceSequenceDeliveryBatchConfirmationText = "Create dry-run Bumpgrade sequence delivery batch";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceScheduleIntentRow = {
  id: string;
  sequence_id: string;
  status: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  ready_enrollment_count: number | string | null;
  held_enrollment_count: number | string | null;
  active_suppression_count: number | string | null;
};

type SequenceDeliveryBatchRow = {
  id: string;
  sequence_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  queue_mode: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  ready_enrollment_count: number | string | null;
  held_enrollment_count: number | string | null;
  active_suppression_count: number | string | null;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  provider_send_enabled: number | string | null;
  delivery_queue_rows_created: number | string | null;
  recipient_payloads_created: number | string | null;
  personalized_bodies_created: number | string | null;
  unsubscribe_urls_created: number | string | null;
  provider_message_ids_created: number | string | null;
  idempotency_key: string;
  created_at: number | string | null;
};

export type AudienceSequenceDeliveryBatchPublic = {
  id: string;
  sequenceId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  queueMode: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
  readyEnrollmentCount: number;
  heldEnrollmentCount: number;
  activeSuppressionCount: number;
  unsubscribeFooterCheckStatus: string;
  senderDomainGateStatus: string;
  duplicate: boolean;
  providerSendEnabled: false;
  deliveryQueueRowsCreated: false;
  recipientPayloadsCreated: false;
  personalizedBodiesCreated: false;
  unsubscribeUrlsCreated: false;
  providerMessageIdsIncluded: false;
  createdAt: string | null;
};

export type AudienceSequenceDeliveryBatchSummary = {
  id: "audience-sequence-delivery-batch-contract";
  status: typeof audienceSequenceDeliveryBatchStatus;
  issue: typeof audienceSequenceDeliveryBatchIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceDeliveryBatchApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceDeliveryBatchConfirmationText;
  };
  counts: {
    deliveryBatches: number;
    dryRunBatches: number;
    readyEnrollmentsBatched: number;
    heldEnrollmentsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    providerSendEnabledBatches: number;
    deliveryQueueRowsCreatedBatches: number;
    recipientPayloadsCreatedBatches: number;
    personalizedBodiesCreatedBatches: number;
    unsubscribeUrlsCreatedBatches: number;
    providerMessageIdsCreatedBatches: number;
  };
  latestBatches: AudienceSequenceDeliveryBatchPublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    deliveryQueuePayloadsIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodiesIncluded: false;
    bodyTemplatesIncluded: false;
    unsubscribeUrlsIncluded: false;
    providerMessageIdsIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateSequenceDeliveryBatchInput = {
  scheduleIntentId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceDeliveryBatchResult =
  | {
      ok: true;
      status: "sequence_delivery_batch_recorded" | "sequence_delivery_batch_replayed";
      duplicate: boolean;
      batch: AudienceSequenceDeliveryBatchPublic;
      redaction: AudienceSequenceDeliveryBatchSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "schedule_intent_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "batch_not_created";
      message: string;
      redaction: AudienceSequenceDeliveryBatchSummary["redaction"];
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

function publicSequenceDeliveryBatch(
  row: SequenceDeliveryBatchRow,
  duplicate: boolean,
): AudienceSequenceDeliveryBatchPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    queueMode: row.queue_mode,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
    readyEnrollmentCount: numberValue(row.ready_enrollment_count),
    heldEnrollmentCount: numberValue(row.held_enrollment_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    unsubscribeFooterCheckStatus: row.unsubscribe_footer_check_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    duplicate,
    providerSendEnabled: false,
    deliveryQueueRowsCreated: false,
    recipientPayloadsCreated: false,
    personalizedBodiesCreated: false,
    unsubscribeUrlsCreated: false,
    providerMessageIdsIncluded: false,
    createdAt: timestampValue(row.created_at),
  };
}

function emptySummary(
  source: AudienceSequenceDeliveryBatchSummary["source"],
  loadError: string | null,
): AudienceSequenceDeliveryBatchSummary {
  return {
    id: "audience-sequence-delivery-batch-contract",
    status: audienceSequenceDeliveryBatchStatus,
    issue: audienceSequenceDeliveryBatchIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceDeliveryBatchApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceDeliveryBatchConfirmationText,
    },
    counts: {
      deliveryBatches: 0,
      dryRunBatches: 0,
      readyEnrollmentsBatched: 0,
      heldEnrollmentsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      providerSendEnabledBatches: 0,
      deliveryQueueRowsCreatedBatches: 0,
      recipientPayloadsCreatedBatches: 0,
      personalizedBodiesCreatedBatches: 0,
      unsubscribeUrlsCreatedBatches: 0,
      providerMessageIdsCreatedBatches: 0,
    },
    latestBatches: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      deliveryQueuePayloadsIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
      bodyTemplatesIncluded: false,
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
      "Issue #358 lets verified owners record dry-run sequence delivery-batch metadata after exact confirmation, idempotency, a current sequence schedule intent, workspace revision, sequence status, and readiness checks. It does not create delivery queue rows, create recipient payloads, create personalized bodies, expose body templates, create unsubscribe URLs, send through a provider, create provider message IDs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

async function findScheduleIntentById(db: D1Database, scheduleIntentId: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, status, expected_workspace_revision_id, expected_sequence_status,
        ready_enrollment_count, held_enrollment_count, active_suppression_count
      FROM audience_sequence_schedule_intents
      WHERE id = ?`,
    )
    .bind(scheduleIntentId)
    .first<SequenceScheduleIntentRow>();
}

async function findDeliveryBatchByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        ready_enrollment_count, held_enrollment_count, active_suppression_count,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        delivery_queue_rows_created, recipient_payloads_created, personalized_bodies_created,
        unsubscribe_urls_created, provider_message_ids_created, idempotency_key, created_at
      FROM audience_sequence_delivery_batches
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<SequenceDeliveryBatchRow>();
}

export async function getAudienceSequenceDeliveryBatchSummary(): Promise<AudienceSequenceDeliveryBatchSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS delivery_batch_count,
          SUM(CASE WHEN queue_mode = 'dry_run_contract' THEN 1 ELSE 0 END) AS dry_run_batch_count,
          COALESCE(SUM(ready_enrollment_count), 0) AS ready_enrollment_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN provider_send_enabled > 0 THEN 1 ELSE 0 END) AS provider_send_enabled_count,
          SUM(CASE WHEN delivery_queue_rows_created > 0 THEN 1 ELSE 0 END) AS delivery_queue_rows_created_count,
          SUM(CASE WHEN recipient_payloads_created > 0 THEN 1 ELSE 0 END) AS recipient_payloads_created_count,
          SUM(CASE WHEN personalized_bodies_created > 0 THEN 1 ELSE 0 END) AS personalized_bodies_created_count,
          SUM(CASE WHEN unsubscribe_urls_created > 0 THEN 1 ELSE 0 END) AS unsubscribe_urls_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count
        FROM audience_sequence_delivery_batches`,
      )
      .first<{
        delivery_batch_count: number | string | null;
        dry_run_batch_count: number | string | null;
        ready_enrollment_count: number | string | null;
        held_enrollment_count: number | string | null;
        active_suppression_count: number | string | null;
        provider_send_enabled_count: number | string | null;
        delivery_queue_rows_created_count: number | string | null;
        recipient_payloads_created_count: number | string | null;
        personalized_bodies_created_count: number | string | null;
        unsubscribe_urls_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, sequence_id, schedule_intent_id, status, queue_name, queue_mode,
          expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
          ready_enrollment_count, held_enrollment_count, active_suppression_count,
          unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
          delivery_queue_rows_created, recipient_payloads_created, personalized_bodies_created,
          unsubscribe_urls_created, provider_message_ids_created, idempotency_key, created_at
        FROM audience_sequence_delivery_batches
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<SequenceDeliveryBatchRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        deliveryBatches: numberValue(counts?.delivery_batch_count),
        dryRunBatches: numberValue(counts?.dry_run_batch_count),
        readyEnrollmentsBatched: numberValue(counts?.ready_enrollment_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        providerSendEnabledBatches: numberValue(counts?.provider_send_enabled_count),
        deliveryQueueRowsCreatedBatches: numberValue(counts?.delivery_queue_rows_created_count),
        recipientPayloadsCreatedBatches: numberValue(counts?.recipient_payloads_created_count),
        personalizedBodiesCreatedBatches: numberValue(counts?.personalized_bodies_created_count),
        unsubscribeUrlsCreatedBatches: numberValue(counts?.unsubscribe_urls_created_count),
        providerMessageIdsCreatedBatches: numberValue(counts?.provider_message_ids_created_count),
      },
      latestBatches: (latest.results ?? []).map((row) => publicSequenceDeliveryBatch(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence delivery batches.",
    );
  }
}

export async function createAudienceSequenceDeliveryBatch(
  input: CreateSequenceDeliveryBatchInput,
): Promise<CreateSequenceDeliveryBatchResult> {
  const redaction = emptySummary("d1", null).redaction;
  const scheduleIntentId = parseString(input.scheduleIntentId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !scheduleIntentId ||
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
        "A schedule intent ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceDeliveryBatchConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording a sequence delivery-batch dry run.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDeliveryBatchByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_delivery_batch_replayed",
      duplicate: true,
      batch: publicSequenceDeliveryBatch(existing, true),
      redaction,
    };
  }

  const scheduleIntent = await findScheduleIntentById(db, scheduleIntentId);
  if (!scheduleIntent || scheduleIntent.status !== "dry_run_recorded" || scheduleIntent.sequence_id !== sequenceId) {
    return {
      ok: false,
      status: "schedule_intent_not_found",
      message: "A current dry-run sequence schedule intent is required before a delivery batch can be recorded.",
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

  if (
    readiness.workspace.revisionId !== expectedWorkspaceRevisionId ||
    scheduleIntent.expected_workspace_revision_id !== expectedWorkspaceRevisionId
  ) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before the sequence delivery-batch dry run was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus || scheduleIntent.expected_sequence_status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before the delivery-batch dry run was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (
    readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount ||
    numberValue(scheduleIntent.ready_enrollment_count) !== expectedReadyEnrollmentCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before the delivery-batch dry run was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const batchId = `sequence-delivery-batch-${crypto.randomUUID()}`;
  const heldEnrollments = heldEnrollmentCount(readiness.counts);
  await db
    .prepare(
      `INSERT INTO audience_sequence_delivery_batches (
        id, sequence_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        ready_enrollment_count, held_enrollment_count, active_suppression_count,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        delivery_queue_rows_created, recipient_payloads_created, personalized_bodies_created,
        unsubscribe_urls_created, provider_message_ids_created, idempotency_key,
        actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, 'delivery_batch_dry_run_recorded', 'audience-sequence-delivery-dry-run', 'dry_run_contract',
        ?, ?, ?, ?, ?, ?, 'unsubscribe_footer_required_before_send_payload', 'sender_domain_readiness_required',
        0, 0, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      batchId,
      sequence.sequenceId,
      scheduleIntent.id,
      readiness.workspace.revisionId,
      sequence.status,
      expectedReadyEnrollmentCount,
      readiness.counts.readyEnrollments,
      heldEnrollments,
      readiness.counts.activeSuppressionEntries,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceDeliveryBatchIssue,
        scheduleIntentId: scheduleIntent.id,
        providerSendEnabled: false,
        deliveryQueueRowsCreated: false,
        recipientPayloadsCreated: false,
        personalizedBodiesCreated: false,
        unsubscribeUrlsCreated: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const batch = await findDeliveryBatchByIdempotency(db, idempotencyKey);
  if (!batch) {
    return {
      ok: false,
      status: "batch_not_created",
      message: "The sequence delivery-batch dry run could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_delivery_batch_recorded",
    duplicate: false,
    batch: publicSequenceDeliveryBatch(batch, false),
    redaction,
  };
}
