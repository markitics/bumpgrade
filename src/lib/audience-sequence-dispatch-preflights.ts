import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceDispatchPreflightIssue = 362;
export const audienceSequenceDispatchPreflightStatus = "sequence-dispatch-preflight-dry-run-ready";
export const audienceSequenceDispatchPreflightApiRoute =
  "/api/admin/audience/sequences/dispatch-preflights";
export const audienceSequenceDispatchPreflightConfirmationText =
  "Create dry-run Bumpgrade sequence dispatch preflight";

type AudienceRuntime = {
  db: D1Database;
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
};

type SequenceDispatchPreflightRow = {
  id: string;
  sequence_id: string;
  delivery_queue_message_id: string;
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
  provider_limit_policy: string;
  provider_rate_limit_window: string;
  dispatch_mode: string;
  suppression_check_status: string;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  audit_correlation_policy: string;
  provider_send_enabled: number | string | null;
  delivery_queue_rows_created: number | string | null;
  cloudflare_queue_messages_created: number | string | null;
  queue_payload_bodies_created: number | string | null;
  recipient_payloads_created: number | string | null;
  personalized_bodies_created: number | string | null;
  unsubscribe_urls_created: number | string | null;
  provider_responses_created: number | string | null;
  provider_message_ids_created: number | string | null;
  idempotency_key: string;
  created_at: number | string | null;
};

export type AudienceSequenceDispatchPreflightPublic = {
  id: string;
  sequenceId: string;
  deliveryQueueMessageId: string;
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
  providerLimitPolicy: string;
  providerRateLimitWindow: string;
  dispatchMode: string;
  suppressionCheckStatus: string;
  unsubscribeFooterCheckStatus: string;
  senderDomainGateStatus: string;
  auditCorrelationPolicy: string;
  duplicate: boolean;
  providerSendEnabled: false;
  deliveryQueueRowsCreated: false;
  cloudflareQueueMessagesCreated: false;
  queuePayloadBodiesCreated: false;
  recipientPayloadsCreated: false;
  personalizedBodiesCreated: false;
  unsubscribeUrlsCreated: false;
  providerResponsesIncluded: false;
  providerMessageIdsIncluded: false;
  createdAt: string | null;
};

export type AudienceSequenceDispatchPreflightSummary = {
  id: "audience-sequence-dispatch-preflight-contract";
  status: typeof audienceSequenceDispatchPreflightStatus;
  issue: typeof audienceSequenceDispatchPreflightIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceDispatchPreflightApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceDispatchPreflightConfirmationText;
  };
  counts: {
    dryRunPreflights: number;
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
    providerResponsesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
  };
  latestPreflights: AudienceSequenceDispatchPreflightPublic[];
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

type CreateSequenceDispatchPreflightInput = {
  deliveryQueueMessageId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceDispatchPreflightResult =
  | {
      ok: true;
      status: "sequence_dispatch_preflight_recorded" | "sequence_dispatch_preflight_replayed";
      duplicate: boolean;
      preflight: AudienceSequenceDispatchPreflightPublic;
      redaction: AudienceSequenceDispatchPreflightSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "delivery_queue_message_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "queue_gate_not_ready"
        | "dispatch_preflight_not_created";
      message: string;
      redaction: AudienceSequenceDispatchPreflightSummary["redaction"];
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

function publicSequenceDispatchPreflight(
  row: SequenceDispatchPreflightRow,
  duplicate: boolean,
): AudienceSequenceDispatchPreflightPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    deliveryQueueMessageId: row.delivery_queue_message_id,
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
    providerLimitPolicy: row.provider_limit_policy,
    providerRateLimitWindow: row.provider_rate_limit_window,
    dispatchMode: row.dispatch_mode,
    suppressionCheckStatus: row.suppression_check_status,
    unsubscribeFooterCheckStatus: row.unsubscribe_footer_check_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    auditCorrelationPolicy: row.audit_correlation_policy,
    duplicate,
    providerSendEnabled: false,
    deliveryQueueRowsCreated: false,
    cloudflareQueueMessagesCreated: false,
    queuePayloadBodiesCreated: false,
    recipientPayloadsCreated: false,
    personalizedBodiesCreated: false,
    unsubscribeUrlsCreated: false,
    providerResponsesIncluded: false,
    providerMessageIdsIncluded: false,
    createdAt: timestampValue(row.created_at),
  };
}

function emptySummary(
  source: AudienceSequenceDispatchPreflightSummary["source"],
  loadError: string | null,
): AudienceSequenceDispatchPreflightSummary {
  return {
    id: "audience-sequence-dispatch-preflight-contract",
    status: audienceSequenceDispatchPreflightStatus,
    issue: audienceSequenceDispatchPreflightIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceDispatchPreflightApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceDispatchPreflightConfirmationText,
    },
    counts: {
      dryRunPreflights: 0,
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
      providerResponsesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
    },
    latestPreflights: [],
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
      "Issue #362 lets verified owners record aggregate sequence dispatch preflight evidence from a current sequence queue-message dry run after exact confirmation, idempotency, workspace revision, sequence status, readiness, dry-run queue, suppression, unsubscribe-footer, sender-domain, provider-limit, and audit gates. It does not dispatch Cloudflare Queue messages, create queue payload bodies, create delivery queue rows, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, call providers, create provider responses, create provider message IDs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

async function findDeliveryQueueMessageById(db: D1Database, deliveryQueueMessageId: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, delivery_batch_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        dry_run_message_count, held_enrollment_count, active_suppression_count, retry_policy, dispatch_policy,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        delivery_queue_rows_created, cloudflare_queue_messages_created, queue_payload_bodies_created,
        recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
        provider_message_ids_created
      FROM audience_sequence_delivery_queue_messages
      WHERE id = ?`,
    )
    .bind(deliveryQueueMessageId)
    .first<SequenceDeliveryQueueMessageRow>();
}

async function findDispatchPreflightByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status,
        queue_name, queue_mode, expected_workspace_revision_id, expected_sequence_status,
        expected_ready_enrollment_count, dry_run_message_count, held_enrollment_count,
        active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
        suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
        audit_correlation_policy, provider_send_enabled, delivery_queue_rows_created,
        cloudflare_queue_messages_created, queue_payload_bodies_created, recipient_payloads_created,
        personalized_bodies_created, unsubscribe_urls_created, provider_responses_created,
        provider_message_ids_created, idempotency_key, created_at
      FROM audience_sequence_dispatch_preflights
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<SequenceDispatchPreflightRow>();
}

export async function getAudienceSequenceDispatchPreflightSummary(): Promise<AudienceSequenceDispatchPreflightSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS dry_run_preflight_count,
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
          SUM(CASE WHEN provider_responses_created > 0 THEN 1 ELSE 0 END) AS provider_responses_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count
        FROM audience_sequence_dispatch_preflights`,
      )
      .first<{
        dry_run_preflight_count: number | string | null;
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
        provider_responses_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, sequence_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status,
          queue_name, queue_mode, expected_workspace_revision_id, expected_sequence_status,
          expected_ready_enrollment_count, dry_run_message_count, held_enrollment_count,
          active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
          suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
          audit_correlation_policy, provider_send_enabled, delivery_queue_rows_created,
          cloudflare_queue_messages_created, queue_payload_bodies_created, recipient_payloads_created,
          personalized_bodies_created, unsubscribe_urls_created, provider_responses_created,
          provider_message_ids_created, idempotency_key, created_at
        FROM audience_sequence_dispatch_preflights
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<SequenceDispatchPreflightRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        dryRunPreflights: numberValue(counts?.dry_run_preflight_count),
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
        providerResponsesCreatedRecords: numberValue(counts?.provider_responses_created_count),
        providerMessageIdsCreatedRecords: numberValue(counts?.provider_message_ids_created_count),
      },
      latestPreflights: (latest.results ?? []).map((row) => publicSequenceDispatchPreflight(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence dispatch preflights.",
    );
  }
}

export async function createAudienceSequenceDispatchPreflight(
  input: CreateSequenceDispatchPreflightInput,
): Promise<CreateSequenceDispatchPreflightResult> {
  const redaction = emptySummary("d1", null).redaction;
  const deliveryQueueMessageId = parseString(input.deliveryQueueMessageId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !deliveryQueueMessageId ||
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
        "A delivery queue message ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceDispatchPreflightConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording sequence dispatch preflight dry runs.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDispatchPreflightByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_dispatch_preflight_replayed",
      duplicate: true,
      preflight: publicSequenceDispatchPreflight(existing, true),
      redaction,
    };
  }

  const queueMessage = await findDeliveryQueueMessageById(db, deliveryQueueMessageId);
  if (
    !queueMessage ||
    queueMessage.status !== "delivery_queue_messages_dry_run_recorded" ||
    queueMessage.sequence_id !== sequenceId
  ) {
    return {
      ok: false,
      status: "delivery_queue_message_not_found",
      message:
        "A current dry-run sequence queue-message record is required before dispatch preflight evidence can be recorded.",
      redaction,
    };
  }

  if (
    queueMessage.queue_mode !== "dry_run_contract" ||
    numberValue(queueMessage.provider_send_enabled) > 0 ||
    numberValue(queueMessage.delivery_queue_rows_created) > 0 ||
    numberValue(queueMessage.cloudflare_queue_messages_created) > 0 ||
    numberValue(queueMessage.queue_payload_bodies_created) > 0 ||
    numberValue(queueMessage.recipient_payloads_created) > 0 ||
    numberValue(queueMessage.personalized_bodies_created) > 0 ||
    numberValue(queueMessage.unsubscribe_urls_created) > 0 ||
    numberValue(queueMessage.provider_message_ids_created) > 0
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message:
        "Sequence queue-message gates must stay dry-run without Queue dispatch, queue payload bodies, recipient payloads, unsubscribe URLs, provider sends, or provider message IDs.",
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
    queueMessage.expected_workspace_revision_id !== expectedWorkspaceRevisionId
  ) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before sequence dispatch preflight evidence was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus || queueMessage.expected_sequence_status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before sequence dispatch preflight evidence was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (
    readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount ||
    numberValue(queueMessage.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before sequence dispatch preflight evidence was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const preflightId = `sequence-dispatch-preflight-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_sequence_dispatch_preflights (
        id, sequence_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status,
        queue_name, queue_mode, expected_workspace_revision_id, expected_sequence_status,
        expected_ready_enrollment_count, dry_run_message_count, held_enrollment_count,
        active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
        suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
        audit_correlation_policy, provider_send_enabled, delivery_queue_rows_created,
        cloudflare_queue_messages_created, queue_payload_bodies_created, recipient_payloads_created,
        personalized_bodies_created, unsubscribe_urls_created, provider_responses_created,
        provider_message_ids_created, idempotency_key, actor_user_id, actor_email, metadata_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'dispatch_preflight_dry_run_recorded', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      preflightId,
      sequence.sequenceId,
      queueMessage.id,
      queueMessage.delivery_batch_id,
      queueMessage.schedule_intent_id,
      queueMessage.queue_name,
      queueMessage.queue_mode,
      readiness.workspace.revisionId,
      sequence.status,
      expectedReadyEnrollmentCount,
      numberValue(queueMessage.dry_run_message_count),
      numberValue(queueMessage.held_enrollment_count),
      readiness.counts.activeSuppressionEntries,
      "provider_limit_required_before_live_sequence_sends",
      "not_configured_real_sequence_sends_disabled",
      "dry_run_preflight_no_cloudflare_queue_dispatch",
      "active_suppression_recheck_required_before_sequence_dispatch",
      queueMessage.unsubscribe_footer_check_status,
      queueMessage.sender_domain_gate_status,
      "audit_correlation_required_before_live_sequence_dispatch",
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceDispatchPreflightIssue,
        deliveryQueueMessageId: queueMessage.id,
        deliveryBatchId: queueMessage.delivery_batch_id,
        scheduleIntentId: queueMessage.schedule_intent_id,
        providerSendEnabled: false,
        deliveryQueueRowsCreated: false,
        cloudflareQueueMessagesCreated: false,
        queuePayloadBodiesCreated: false,
        recipientPayloadsCreated: false,
        personalizedBodiesCreated: false,
        unsubscribeUrlsCreated: false,
        providerResponsesIncluded: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const preflight = await findDispatchPreflightByIdempotency(db, idempotencyKey);
  if (!preflight) {
    return {
      ok: false,
      status: "dispatch_preflight_not_created",
      message: "The sequence dispatch preflight dry run could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_dispatch_preflight_recorded",
    duplicate: false,
    preflight: publicSequenceDispatchPreflight(preflight, false),
    redaction,
  };
}
