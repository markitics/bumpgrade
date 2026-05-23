import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceDeliveryQueueMessageIssue = 360;
export const audienceSequenceDeliveryQueueMessageStatus = "sequence-delivery-queue-messages-dry-run-ready";
export const audienceSequenceDeliveryQueueMessageApiRoute =
  "/api/admin/audience/sequences/delivery-queue-messages";
export const audienceSequenceDeliveryQueueMessageConfirmationText =
  "Create dry-run Bumpgrade sequence delivery queue messages";

type AudienceRuntime = {
  db: D1Database;
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
};

type SequenceDeliveryQueueMessageRow = {
  id: string;
  sequence_id: string;
  delivery_batch_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  queue_mode: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  dry_run_message_count: number | string | null;
  held_enrollment_count: number | string | null;
  active_suppression_count: number | string | null;
  retry_policy: string;
  dispatch_policy: string;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  provider_send_enabled: number | string | null;
  delivery_queue_rows_created: number | string | null;
  cloudflare_queue_messages_created: number | string | null;
  queue_payload_bodies_created: number | string | null;
  recipient_payloads_created: number | string | null;
  personalized_bodies_created: number | string | null;
  unsubscribe_urls_created: number | string | null;
  provider_message_ids_created: number | string | null;
  idempotency_key: string;
  created_at: number | string | null;
};

export type AudienceSequenceDeliveryQueueMessagePublic = {
  id: string;
  sequenceId: string;
  deliveryBatchId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  queueMode: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
  dryRunMessageCount: number;
  heldEnrollmentCount: number;
  activeSuppressionCount: number;
  retryPolicy: string;
  dispatchPolicy: string;
  unsubscribeFooterCheckStatus: string;
  senderDomainGateStatus: string;
  duplicate: boolean;
  providerSendEnabled: false;
  deliveryQueueRowsCreated: false;
  cloudflareQueueMessagesCreated: false;
  queuePayloadBodiesCreated: false;
  recipientPayloadsCreated: false;
  personalizedBodiesCreated: false;
  unsubscribeUrlsCreated: false;
  providerMessageIdsIncluded: false;
  createdAt: string | null;
};

export type AudienceSequenceDeliveryQueueMessageSummary = {
  id: "audience-sequence-delivery-queue-message-contract";
  status: typeof audienceSequenceDeliveryQueueMessageStatus;
  issue: typeof audienceSequenceDeliveryQueueMessageIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceDeliveryQueueMessageApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceDeliveryQueueMessageConfirmationText;
  };
  counts: {
    dryRunRecords: number;
    dryRunMessagesSnapshotted: number;
    heldEnrollmentsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    providerSendEnabledRecords: number;
    deliveryQueueRowsCreatedRecords: number;
    cloudflareQueueMessagesCreatedRecords: number;
    queuePayloadBodiesCreatedRecords: number;
    recipientPayloadsCreatedRecords: number;
    personalizedBodiesCreatedRecords: number;
    unsubscribeUrlsCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
  };
  latestMessages: AudienceSequenceDeliveryQueueMessagePublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    deliveryQueuePayloadsIncluded: false;
    cloudflareQueuePayloadsIncluded: false;
    queuePayloadBodiesIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodiesIncluded: false;
    bodyTemplatesIncluded: false;
    unsubscribeUrlsIncluded: false;
    providerResponsesIncluded: false;
    providerMessageIdsIncluded: false;
    cloudflareQueueMessagesCreated: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateSequenceDeliveryQueueMessagesInput = {
  deliveryBatchId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceDeliveryQueueMessagesResult =
  | {
      ok: true;
      status: "sequence_delivery_queue_messages_recorded" | "sequence_delivery_queue_messages_replayed";
      duplicate: boolean;
      messages: AudienceSequenceDeliveryQueueMessagePublic;
      redaction: AudienceSequenceDeliveryQueueMessageSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "delivery_batch_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "queue_gate_not_ready"
        | "queue_messages_not_created";
      message: string;
      redaction: AudienceSequenceDeliveryQueueMessageSummary["redaction"];
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

function publicSequenceDeliveryQueueMessage(
  row: SequenceDeliveryQueueMessageRow,
  duplicate: boolean,
): AudienceSequenceDeliveryQueueMessagePublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    deliveryBatchId: row.delivery_batch_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    queueMode: row.queue_mode,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
    dryRunMessageCount: numberValue(row.dry_run_message_count),
    heldEnrollmentCount: numberValue(row.held_enrollment_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    retryPolicy: row.retry_policy,
    dispatchPolicy: row.dispatch_policy,
    unsubscribeFooterCheckStatus: row.unsubscribe_footer_check_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    duplicate,
    providerSendEnabled: false,
    deliveryQueueRowsCreated: false,
    cloudflareQueueMessagesCreated: false,
    queuePayloadBodiesCreated: false,
    recipientPayloadsCreated: false,
    personalizedBodiesCreated: false,
    unsubscribeUrlsCreated: false,
    providerMessageIdsIncluded: false,
    createdAt: timestampValue(row.created_at),
  };
}

function emptySummary(
  source: AudienceSequenceDeliveryQueueMessageSummary["source"],
  loadError: string | null,
): AudienceSequenceDeliveryQueueMessageSummary {
  return {
    id: "audience-sequence-delivery-queue-message-contract",
    status: audienceSequenceDeliveryQueueMessageStatus,
    issue: audienceSequenceDeliveryQueueMessageIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceDeliveryQueueMessageApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceDeliveryQueueMessageConfirmationText,
    },
    counts: {
      dryRunRecords: 0,
      dryRunMessagesSnapshotted: 0,
      heldEnrollmentsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      providerSendEnabledRecords: 0,
      deliveryQueueRowsCreatedRecords: 0,
      cloudflareQueueMessagesCreatedRecords: 0,
      queuePayloadBodiesCreatedRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      personalizedBodiesCreatedRecords: 0,
      unsubscribeUrlsCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
    },
    latestMessages: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      deliveryQueuePayloadsIncluded: false,
      cloudflareQueuePayloadsIncluded: false,
      queuePayloadBodiesIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
      bodyTemplatesIncluded: false,
      unsubscribeUrlsIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      cloudflareQueueMessagesCreated: false,
      providerSendEnabled: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberId",
      "subscriberEmailHash",
      "suppressionHash",
      "actorEmail",
      "deliveryQueuePayload",
      "cloudflareQueuePayload",
      "queuePayloadBody",
      "recipientPayload",
      "personalizedBody",
      "bodyTemplate",
      "unsubscribeUrl",
      "providerResponse",
      "providerMessageId",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #360 lets verified owners record aggregate sequence delivery queue-message dry-run evidence from a current sequence delivery batch after exact confirmation, idempotency, workspace revision, sequence status, readiness, and dry-run queue gates. It does not create Cloudflare Queue messages, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, body templates, unsubscribe URLs, provider responses, provider message IDs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

async function findDeliveryBatchById(db: D1Database, deliveryBatchId: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        ready_enrollment_count, held_enrollment_count, active_suppression_count,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        delivery_queue_rows_created, recipient_payloads_created, personalized_bodies_created,
        unsubscribe_urls_created, provider_message_ids_created
      FROM audience_sequence_delivery_batches
      WHERE id = ?`,
    )
    .bind(deliveryBatchId)
    .first<SequenceDeliveryBatchRow>();
}

async function findDeliveryQueueMessagesByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, delivery_batch_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        dry_run_message_count, held_enrollment_count, active_suppression_count, retry_policy, dispatch_policy,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        delivery_queue_rows_created, cloudflare_queue_messages_created, queue_payload_bodies_created,
        recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
        provider_message_ids_created, idempotency_key, created_at
      FROM audience_sequence_delivery_queue_messages
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<SequenceDeliveryQueueMessageRow>();
}

export async function getAudienceSequenceDeliveryQueueMessageSummary(): Promise<AudienceSequenceDeliveryQueueMessageSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS dry_run_record_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN provider_send_enabled > 0 THEN 1 ELSE 0 END) AS provider_send_enabled_count,
          SUM(CASE WHEN delivery_queue_rows_created > 0 THEN 1 ELSE 0 END) AS delivery_queue_rows_created_count,
          SUM(CASE WHEN cloudflare_queue_messages_created > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_messages_created_count,
          SUM(CASE WHEN queue_payload_bodies_created > 0 THEN 1 ELSE 0 END) AS queue_payload_bodies_created_count,
          SUM(CASE WHEN recipient_payloads_created > 0 THEN 1 ELSE 0 END) AS recipient_payloads_created_count,
          SUM(CASE WHEN personalized_bodies_created > 0 THEN 1 ELSE 0 END) AS personalized_bodies_created_count,
          SUM(CASE WHEN unsubscribe_urls_created > 0 THEN 1 ELSE 0 END) AS unsubscribe_urls_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count
        FROM audience_sequence_delivery_queue_messages`,
      )
      .first<{
        dry_run_record_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_enrollment_count: number | string | null;
        active_suppression_count: number | string | null;
        provider_send_enabled_count: number | string | null;
        delivery_queue_rows_created_count: number | string | null;
        cloudflare_queue_messages_created_count: number | string | null;
        queue_payload_bodies_created_count: number | string | null;
        recipient_payloads_created_count: number | string | null;
        personalized_bodies_created_count: number | string | null;
        unsubscribe_urls_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, sequence_id, delivery_batch_id, schedule_intent_id, status, queue_name, queue_mode,
          expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
          dry_run_message_count, held_enrollment_count, active_suppression_count, retry_policy, dispatch_policy,
          unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
          delivery_queue_rows_created, cloudflare_queue_messages_created, queue_payload_bodies_created,
          recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
          provider_message_ids_created, idempotency_key, created_at
        FROM audience_sequence_delivery_queue_messages
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<SequenceDeliveryQueueMessageRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        dryRunRecords: numberValue(counts?.dry_run_record_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        providerSendEnabledRecords: numberValue(counts?.provider_send_enabled_count),
        deliveryQueueRowsCreatedRecords: numberValue(counts?.delivery_queue_rows_created_count),
        cloudflareQueueMessagesCreatedRecords: numberValue(counts?.cloudflare_queue_messages_created_count),
        queuePayloadBodiesCreatedRecords: numberValue(counts?.queue_payload_bodies_created_count),
        recipientPayloadsCreatedRecords: numberValue(counts?.recipient_payloads_created_count),
        personalizedBodiesCreatedRecords: numberValue(counts?.personalized_bodies_created_count),
        unsubscribeUrlsCreatedRecords: numberValue(counts?.unsubscribe_urls_created_count),
        providerMessageIdsCreatedRecords: numberValue(counts?.provider_message_ids_created_count),
      },
      latestMessages: (latest.results ?? []).map((row) => publicSequenceDeliveryQueueMessage(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence delivery queue messages.",
    );
  }
}

export async function createAudienceSequenceDeliveryQueueMessages(
  input: CreateSequenceDeliveryQueueMessagesInput,
): Promise<CreateSequenceDeliveryQueueMessagesResult> {
  const redaction = emptySummary("d1", null).redaction;
  const deliveryBatchId = parseString(input.deliveryBatchId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !deliveryBatchId ||
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
        "A delivery batch ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceDeliveryQueueMessageConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording sequence delivery queue-message dry runs.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDeliveryQueueMessagesByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_delivery_queue_messages_replayed",
      duplicate: true,
      messages: publicSequenceDeliveryQueueMessage(existing, true),
      redaction,
    };
  }

  const batch = await findDeliveryBatchById(db, deliveryBatchId);
  if (!batch || batch.status !== "delivery_batch_dry_run_recorded" || batch.sequence_id !== sequenceId) {
    return {
      ok: false,
      status: "delivery_batch_not_found",
      message: "A current dry-run sequence delivery batch is required before queue-message evidence can be recorded.",
      redaction,
    };
  }

  if (
    batch.queue_mode !== "dry_run_contract" ||
    numberValue(batch.provider_send_enabled) > 0 ||
    numberValue(batch.delivery_queue_rows_created) > 0 ||
    numberValue(batch.recipient_payloads_created) > 0 ||
    numberValue(batch.personalized_bodies_created) > 0 ||
    numberValue(batch.unsubscribe_urls_created) > 0 ||
    numberValue(batch.provider_message_ids_created) > 0
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message:
        "Sequence delivery batch queue gates must stay dry-run without queue rows, payloads, unsubscribe URLs, provider sends, or provider message IDs.",
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
    batch.expected_workspace_revision_id !== expectedWorkspaceRevisionId
  ) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before sequence queue-message dry-run evidence was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus || batch.expected_sequence_status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before queue-message dry-run evidence was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (
    readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount ||
    numberValue(batch.ready_enrollment_count) !== expectedReadyEnrollmentCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before queue-message dry-run evidence was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const messagesId = `sequence-delivery-queue-messages-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_sequence_delivery_queue_messages (
        id, sequence_id, delivery_batch_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        dry_run_message_count, held_enrollment_count, active_suppression_count, retry_policy, dispatch_policy,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        delivery_queue_rows_created, cloudflare_queue_messages_created, queue_payload_bodies_created,
        recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
        provider_message_ids_created, idempotency_key, actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'delivery_queue_messages_dry_run_recorded', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        0, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      messagesId,
      sequence.sequenceId,
      batch.id,
      batch.schedule_intent_id,
      batch.queue_name,
      batch.queue_mode,
      readiness.workspace.revisionId,
      sequence.status,
      expectedReadyEnrollmentCount,
      readiness.counts.readyEnrollments,
      numberValue(batch.held_enrollment_count),
      readiness.counts.activeSuppressionEntries,
      "retry_policy_required_before_live_sequence_queue",
      "dry_run_d1_evidence_only_no_cloudflare_queue_dispatch",
      batch.unsubscribe_footer_check_status,
      batch.sender_domain_gate_status,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceDeliveryQueueMessageIssue,
        deliveryBatchId: batch.id,
        scheduleIntentId: batch.schedule_intent_id,
        providerSendEnabled: false,
        deliveryQueueRowsCreated: false,
        cloudflareQueueMessagesCreated: false,
        queuePayloadBodiesCreated: false,
        recipientPayloadsCreated: false,
        personalizedBodiesCreated: false,
        unsubscribeUrlsCreated: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const messages = await findDeliveryQueueMessagesByIdempotency(db, idempotencyKey);
  if (!messages) {
    return {
      ok: false,
      status: "queue_messages_not_created",
      message: "The sequence delivery queue-message dry run could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_delivery_queue_messages_recorded",
    duplicate: false,
    messages: publicSequenceDeliveryQueueMessage(messages, false),
    redaction,
  };
}
