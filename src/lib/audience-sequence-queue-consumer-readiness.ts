import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { audienceSequenceQueueProducerReadinessStatus } from "@/lib/audience-sequence-queue-producer-readiness";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceQueueConsumerReadinessIssue = 368;
export const audienceSequenceQueueConsumerReadinessStatus = "sequence-queue-consumer-readiness-ready";
export const audienceSequenceQueueConsumerReadinessApiRoute =
  "/api/admin/audience/sequences/queue-consumer-readiness";
export const audienceSequenceQueueConsumerReadinessConfirmationText =
  "Record Bumpgrade sequence Queue consumer readiness gate";
const sequenceQueueProducerReadinessRecordStatus = "sequence_queue_producer_readiness_recorded";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceQueueProducerReadinessRow = {
  id: string;
  sequence_id: string;
  dispatch_attempt_id: string;
  dispatch_preflight_id: string;
  delivery_queue_message_id: string;
  delivery_batch_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  producer_binding: string;
  producer_mode: string;
  producer_gate_status: string;
  payload_dependency_status: string;
  consumer_dependency_status: string;
  idempotency_policy: string;
  audit_correlation_policy: string;
  retry_backpressure_policy: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  dry_run_message_count: number | string | null;
  held_enrollment_count: number | string | null;
  active_suppression_count: number | string | null;
  provider_limit_policy: string;
  provider_rate_limit_window: string;
  dispatch_mode: string;
  dispatch_result_status: string;
  suppression_check_status: string;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  cloudflare_queue_producer_enabled: number | string | null;
  cloudflare_queue_messages_created: number | string | null;
  queue_payload_bodies_created: number | string | null;
  recipient_payloads_created: number | string | null;
  personalized_bodies_created: number | string | null;
  unsubscribe_urls_created: number | string | null;
  provider_send_enabled: number | string | null;
  provider_responses_created: number | string | null;
  provider_message_ids_created: number | string | null;
  created_at: number | string | null;
};

type SequenceQueueConsumerReadinessRow = {
  id: string;
  sequence_id: string;
  queue_producer_readiness_id: string;
  dispatch_attempt_id: string;
  dispatch_preflight_id: string;
  delivery_queue_message_id: string;
  delivery_batch_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  consumer_binding: string;
  consumer_mode: string;
  consumer_gate_status: string;
  producer_dependency_status: string;
  payload_read_policy: string;
  ack_policy: string;
  retry_policy: string;
  dead_letter_policy: string;
  idempotency_policy: string;
  audit_correlation_policy: string;
  provider_handoff_policy: string;
  backpressure_policy: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  expected_queue_producer_readiness_status: string;
  dry_run_message_count: number | string | null;
  held_enrollment_count: number | string | null;
  active_suppression_count: number | string | null;
  provider_limit_policy: string;
  provider_rate_limit_window: string;
  dispatch_mode: string;
  dispatch_result_status: string;
  suppression_check_status: string;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  cloudflare_queue_consumer_enabled: number | string | null;
  cloudflare_queue_messages_consumed: number | string | null;
  cloudflare_queue_messages_acked: number | string | null;
  queue_retry_records_created: number | string | null;
  queue_dead_letter_records_created: number | string | null;
  queue_payload_bodies_read: number | string | null;
  queue_payload_bodies_created: number | string | null;
  recipient_payloads_created: number | string | null;
  personalized_bodies_created: number | string | null;
  unsubscribe_urls_created: number | string | null;
  provider_send_enabled: number | string | null;
  provider_responses_created: number | string | null;
  provider_message_ids_created: number | string | null;
  idempotency_key: string;
  created_at: number | string | null;
};

export type AudienceSequenceQueueConsumerReadinessPublic = {
  id: string;
  sequenceId: string;
  queueProducerReadinessId: string;
  dispatchAttemptId: string;
  dispatchPreflightId: string;
  deliveryQueueMessageId: string;
  deliveryBatchId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  consumerBinding: string;
  consumerMode: string;
  consumerGateStatus: string;
  producerDependencyStatus: string;
  payloadReadPolicy: string;
  ackPolicy: string;
  retryPolicy: string;
  deadLetterPolicy: string;
  idempotencyPolicy: string;
  auditCorrelationPolicy: string;
  providerHandoffPolicy: string;
  backpressurePolicy: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
  expectedQueueProducerReadinessStatus: string;
  dryRunMessageCount: number;
  heldEnrollmentCount: number;
  activeSuppressionCount: number;
  providerLimitPolicy: string;
  providerRateLimitWindow: string;
  dispatchMode: string;
  dispatchResultStatus: string;
  suppressionCheckStatus: string;
  unsubscribeFooterCheckStatus: string;
  senderDomainGateStatus: string;
  duplicate: boolean;
  cloudflareQueueConsumerEnabled: false;
  cloudflareQueueMessagesConsumed: false;
  cloudflareQueueMessagesAcked: false;
  queueRetryRecordsCreated: false;
  queueDeadLetterRecordsCreated: false;
  queuePayloadBodiesRead: false;
  queuePayloadBodiesCreated: false;
  recipientPayloadsCreated: false;
  personalizedBodiesCreated: false;
  unsubscribeUrlsCreated: false;
  providerSendEnabled: false;
  providerResponsesIncluded: false;
  providerMessageIdsIncluded: false;
  createdAt: string | null;
};

export type AudienceSequenceQueueConsumerReadinessSummary = {
  id: "audience-sequence-queue-consumer-readiness-contract";
  status: typeof audienceSequenceQueueConsumerReadinessStatus;
  issue: typeof audienceSequenceQueueConsumerReadinessIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceQueueConsumerReadinessApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceQueueConsumerReadinessConfirmationText;
  };
  dependency: {
    queueProducerReadinessStatus: typeof audienceSequenceQueueProducerReadinessStatus;
    queueProducerReadinessIssue: 366;
    queueProducerReadinessRequired: true;
  };
  counts: {
    queueConsumerReadinessRecords: number;
    dryRunConsumerContracts: number;
    dryRunMessagesSnapshotted: number;
    heldEnrollmentsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    cloudflareQueueConsumerEnabledRecords: number;
    cloudflareQueueMessagesConsumedRecords: number;
    cloudflareQueueMessagesAckedRecords: number;
    queueRetryRecordsCreatedRecords: number;
    queueDeadLetterRecordsCreatedRecords: number;
    queuePayloadBodiesReadRecords: number;
    queuePayloadBodiesCreatedRecords: number;
    recipientPayloadsCreatedRecords: number;
    personalizedBodiesCreatedRecords: number;
    unsubscribeUrlsCreatedRecords: number;
    providerSendEnabledRecords: number;
    providerResponsesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
  };
  latestRecords: AudienceSequenceQueueConsumerReadinessPublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    deliveryQueuePayloadsIncluded: false;
    cloudflareQueuePayloadsIncluded: false;
    queuePayloadBodiesIncluded: false;
    queueConsumerAckRowsIncluded: false;
    queueRetryRowsIncluded: false;
    queueDeadLetterRowsIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodiesIncluded: false;
    bodyTemplatesIncluded: false;
    unsubscribeUrlsIncluded: false;
    providerResponsesIncluded: false;
    providerMessageIdsIncluded: false;
    cloudflareQueueConsumersEnabled: false;
    cloudflareQueueMessagesConsumed: false;
    cloudflareQueueMessagesAcked: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateSequenceQueueConsumerReadinessInput = {
  queueProducerReadinessId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceQueueConsumerReadinessResult =
  | {
      ok: true;
      status: "sequence_queue_consumer_readiness_recorded" | "sequence_queue_consumer_readiness_replayed";
      duplicate: boolean;
      record: AudienceSequenceQueueConsumerReadinessPublic;
      redaction: AudienceSequenceQueueConsumerReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "queue_producer_readiness_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "stale_queue_producer_readiness_status"
        | "stale_queue_producer_readiness_evidence"
        | "consumer_gate_not_ready"
        | "queue_consumer_readiness_not_created";
      message: string;
      redaction: AudienceSequenceQueueConsumerReadinessSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
      currentQueueProducerReadinessStatus?: string | null;
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

function producerHasNoLiveArtifacts(row: SequenceQueueProducerReadinessRow) {
  return (
    row.producer_mode === "dry_run_contract_only_no_cloudflare_queue_producer" &&
    numberValue(row.cloudflare_queue_producer_enabled) === 0 &&
    numberValue(row.cloudflare_queue_messages_created) === 0 &&
    numberValue(row.queue_payload_bodies_created) === 0 &&
    numberValue(row.recipient_payloads_created) === 0 &&
    numberValue(row.personalized_bodies_created) === 0 &&
    numberValue(row.unsubscribe_urls_created) === 0 &&
    numberValue(row.provider_send_enabled) === 0 &&
    numberValue(row.provider_responses_created) === 0 &&
    numberValue(row.provider_message_ids_created) === 0
  );
}

function publicSequenceQueueConsumerReadiness(
  row: SequenceQueueConsumerReadinessRow,
  duplicate: boolean,
): AudienceSequenceQueueConsumerReadinessPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    queueProducerReadinessId: row.queue_producer_readiness_id,
    dispatchAttemptId: row.dispatch_attempt_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    deliveryQueueMessageId: row.delivery_queue_message_id,
    deliveryBatchId: row.delivery_batch_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    consumerBinding: row.consumer_binding,
    consumerMode: row.consumer_mode,
    consumerGateStatus: row.consumer_gate_status,
    producerDependencyStatus: row.producer_dependency_status,
    payloadReadPolicy: row.payload_read_policy,
    ackPolicy: row.ack_policy,
    retryPolicy: row.retry_policy,
    deadLetterPolicy: row.dead_letter_policy,
    idempotencyPolicy: row.idempotency_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    providerHandoffPolicy: row.provider_handoff_policy,
    backpressurePolicy: row.backpressure_policy,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
    expectedQueueProducerReadinessStatus: row.expected_queue_producer_readiness_status,
    dryRunMessageCount: numberValue(row.dry_run_message_count),
    heldEnrollmentCount: numberValue(row.held_enrollment_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    providerLimitPolicy: row.provider_limit_policy,
    providerRateLimitWindow: row.provider_rate_limit_window,
    dispatchMode: row.dispatch_mode,
    dispatchResultStatus: row.dispatch_result_status,
    suppressionCheckStatus: row.suppression_check_status,
    unsubscribeFooterCheckStatus: row.unsubscribe_footer_check_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    duplicate,
    cloudflareQueueConsumerEnabled: false,
    cloudflareQueueMessagesConsumed: false,
    cloudflareQueueMessagesAcked: false,
    queueRetryRecordsCreated: false,
    queueDeadLetterRecordsCreated: false,
    queuePayloadBodiesRead: false,
    queuePayloadBodiesCreated: false,
    recipientPayloadsCreated: false,
    personalizedBodiesCreated: false,
    unsubscribeUrlsCreated: false,
    providerSendEnabled: false,
    providerResponsesIncluded: false,
    providerMessageIdsIncluded: false,
    createdAt: timestampValue(row.created_at),
  };
}

function emptySummary(
  source: AudienceSequenceQueueConsumerReadinessSummary["source"],
  loadError: string | null,
): AudienceSequenceQueueConsumerReadinessSummary {
  return {
    id: "audience-sequence-queue-consumer-readiness-contract",
    status: audienceSequenceQueueConsumerReadinessStatus,
    issue: audienceSequenceQueueConsumerReadinessIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceQueueConsumerReadinessApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceQueueConsumerReadinessConfirmationText,
    },
    dependency: {
      queueProducerReadinessStatus: audienceSequenceQueueProducerReadinessStatus,
      queueProducerReadinessIssue: 366,
      queueProducerReadinessRequired: true,
    },
    counts: {
      queueConsumerReadinessRecords: 0,
      dryRunConsumerContracts: 0,
      dryRunMessagesSnapshotted: 0,
      heldEnrollmentsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      cloudflareQueueConsumerEnabledRecords: 0,
      cloudflareQueueMessagesConsumedRecords: 0,
      cloudflareQueueMessagesAckedRecords: 0,
      queueRetryRecordsCreatedRecords: 0,
      queueDeadLetterRecordsCreatedRecords: 0,
      queuePayloadBodiesReadRecords: 0,
      queuePayloadBodiesCreatedRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      personalizedBodiesCreatedRecords: 0,
      unsubscribeUrlsCreatedRecords: 0,
      providerSendEnabledRecords: 0,
      providerResponsesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
    },
    latestRecords: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      deliveryQueuePayloadsIncluded: false,
      cloudflareQueuePayloadsIncluded: false,
      queuePayloadBodiesIncluded: false,
      queueConsumerAckRowsIncluded: false,
      queueRetryRowsIncluded: false,
      queueDeadLetterRowsIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
      bodyTemplatesIncluded: false,
      unsubscribeUrlsIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      cloudflareQueueConsumersEnabled: false,
      cloudflareQueueMessagesConsumed: false,
      cloudflareQueueMessagesAcked: false,
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
      "queueConsumerAckRow",
      "queueRetryRow",
      "queueDeadLetterRow",
      "recipientPayload",
      "personalizedBody",
      "bodyTemplate",
      "unsubscribeUrl",
      "providerResponse",
      "providerMessageId",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #368 lets verified owners record sequence Queue consumer readiness gates from a current sequence Queue producer readiness record after exact confirmation, idempotency, workspace revision, sequence status, readiness, producer-readiness, payload-read, ack, retry, dead-letter, provider-handoff, backpressure, and audit checks. It does not enable Cloudflare Queue consumers, consume Queue messages, ack Queue messages, create retry rows, create dead-letter rows, read Queue payload bodies, create Queue payload bodies, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, call providers, create provider responses, create provider message IDs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

function queueConsumerSelect() {
  return `SELECT
    id, sequence_id, queue_producer_readiness_id, dispatch_attempt_id, dispatch_preflight_id,
    delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status, queue_name,
    consumer_binding, consumer_mode, consumer_gate_status, producer_dependency_status,
    payload_read_policy, ack_policy, retry_policy, dead_letter_policy, idempotency_policy,
    audit_correlation_policy, provider_handoff_policy, backpressure_policy,
    expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
    expected_queue_producer_readiness_status, dry_run_message_count, held_enrollment_count,
    active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
    dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
    sender_domain_gate_status, cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed,
    cloudflare_queue_messages_acked, queue_retry_records_created, queue_dead_letter_records_created,
    queue_payload_bodies_read, queue_payload_bodies_created, recipient_payloads_created,
    personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
    provider_responses_created, provider_message_ids_created, idempotency_key, created_at
  FROM audience_sequence_queue_consumer_readiness`;
}

function queueProducerSelect() {
  return `SELECT
    id, sequence_id, dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id,
    delivery_batch_id, schedule_intent_id, status, queue_name, producer_binding, producer_mode,
    producer_gate_status, payload_dependency_status, consumer_dependency_status,
    idempotency_policy, audit_correlation_policy, retry_backpressure_policy,
    expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
    dry_run_message_count, held_enrollment_count, active_suppression_count,
    provider_limit_policy, provider_rate_limit_window, dispatch_mode, dispatch_result_status,
    suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
    cloudflare_queue_producer_enabled, cloudflare_queue_messages_created,
    queue_payload_bodies_created, recipient_payloads_created, personalized_bodies_created,
    unsubscribe_urls_created, provider_send_enabled, provider_responses_created,
    provider_message_ids_created, created_at
  FROM audience_sequence_queue_producer_readiness`;
}

async function findQueueProducerReadinessById(db: D1Database, id: string) {
  return db
    .prepare(`${queueProducerSelect()} WHERE id = ?`)
    .bind(id)
    .first<SequenceQueueProducerReadinessRow>();
}

async function findLatestQueueProducerReadinessForSequence(db: D1Database, sequenceId: string) {
  return db
    .prepare(`${queueProducerSelect()} WHERE sequence_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`)
    .bind(sequenceId)
    .first<SequenceQueueProducerReadinessRow>();
}

async function findQueueConsumerReadinessByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(`${queueConsumerSelect()} WHERE idempotency_key = ?`)
    .bind(idempotencyKey)
    .first<SequenceQueueConsumerReadinessRow>();
}

export async function getAudienceSequenceQueueConsumerReadinessSummary(): Promise<AudienceSequenceQueueConsumerReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS queue_consumer_readiness_count,
          SUM(CASE WHEN consumer_mode LIKE '%dry_run%' THEN 1 ELSE 0 END) AS dry_run_consumer_contract_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN cloudflare_queue_consumer_enabled > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_consumer_enabled_count,
          SUM(CASE WHEN cloudflare_queue_messages_consumed > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_messages_consumed_count,
          SUM(CASE WHEN cloudflare_queue_messages_acked > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_messages_acked_count,
          SUM(CASE WHEN queue_retry_records_created > 0 THEN 1 ELSE 0 END) AS queue_retry_records_created_count,
          SUM(CASE WHEN queue_dead_letter_records_created > 0 THEN 1 ELSE 0 END) AS queue_dead_letter_records_created_count,
          SUM(CASE WHEN queue_payload_bodies_read > 0 THEN 1 ELSE 0 END) AS queue_payload_bodies_read_count,
          SUM(CASE WHEN queue_payload_bodies_created > 0 THEN 1 ELSE 0 END) AS queue_payload_bodies_created_count,
          SUM(CASE WHEN recipient_payloads_created > 0 THEN 1 ELSE 0 END) AS recipient_payloads_created_count,
          SUM(CASE WHEN personalized_bodies_created > 0 THEN 1 ELSE 0 END) AS personalized_bodies_created_count,
          SUM(CASE WHEN unsubscribe_urls_created > 0 THEN 1 ELSE 0 END) AS unsubscribe_urls_created_count,
          SUM(CASE WHEN provider_send_enabled > 0 THEN 1 ELSE 0 END) AS provider_send_enabled_count,
          SUM(CASE WHEN provider_responses_created > 0 THEN 1 ELSE 0 END) AS provider_responses_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count
        FROM audience_sequence_queue_consumer_readiness`,
      )
      .first<{
        queue_consumer_readiness_count: number | string | null;
        dry_run_consumer_contract_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_enrollment_count: number | string | null;
        active_suppression_count: number | string | null;
        cloudflare_queue_consumer_enabled_count: number | string | null;
        cloudflare_queue_messages_consumed_count: number | string | null;
        cloudflare_queue_messages_acked_count: number | string | null;
        queue_retry_records_created_count: number | string | null;
        queue_dead_letter_records_created_count: number | string | null;
        queue_payload_bodies_read_count: number | string | null;
        queue_payload_bodies_created_count: number | string | null;
        recipient_payloads_created_count: number | string | null;
        personalized_bodies_created_count: number | string | null;
        unsubscribe_urls_created_count: number | string | null;
        provider_send_enabled_count: number | string | null;
        provider_responses_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(`${queueConsumerSelect()} ORDER BY created_at DESC LIMIT 10`)
      .all<SequenceQueueConsumerReadinessRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        queueConsumerReadinessRecords: numberValue(counts?.queue_consumer_readiness_count),
        dryRunConsumerContracts: numberValue(counts?.dry_run_consumer_contract_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        cloudflareQueueConsumerEnabledRecords: numberValue(counts?.cloudflare_queue_consumer_enabled_count),
        cloudflareQueueMessagesConsumedRecords: numberValue(counts?.cloudflare_queue_messages_consumed_count),
        cloudflareQueueMessagesAckedRecords: numberValue(counts?.cloudflare_queue_messages_acked_count),
        queueRetryRecordsCreatedRecords: numberValue(counts?.queue_retry_records_created_count),
        queueDeadLetterRecordsCreatedRecords: numberValue(counts?.queue_dead_letter_records_created_count),
        queuePayloadBodiesReadRecords: numberValue(counts?.queue_payload_bodies_read_count),
        queuePayloadBodiesCreatedRecords: numberValue(counts?.queue_payload_bodies_created_count),
        recipientPayloadsCreatedRecords: numberValue(counts?.recipient_payloads_created_count),
        personalizedBodiesCreatedRecords: numberValue(counts?.personalized_bodies_created_count),
        unsubscribeUrlsCreatedRecords: numberValue(counts?.unsubscribe_urls_created_count),
        providerSendEnabledRecords: numberValue(counts?.provider_send_enabled_count),
        providerResponsesCreatedRecords: numberValue(counts?.provider_responses_created_count),
        providerMessageIdsCreatedRecords: numberValue(counts?.provider_message_ids_created_count),
      },
      latestRecords: (latest.results ?? []).map((row) => publicSequenceQueueConsumerReadiness(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence Queue consumer readiness.",
    );
  }
}

export async function createAudienceSequenceQueueConsumerReadiness(
  input: CreateSequenceQueueConsumerReadinessInput,
): Promise<CreateSequenceQueueConsumerReadinessResult> {
  const redaction = emptySummary("d1", null).redaction;
  const queueProducerReadinessId = parseString(input.queueProducerReadinessId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !queueProducerReadinessId ||
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
        "A Queue producer readiness ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceQueueConsumerReadinessConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording sequence Queue consumer readiness.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findQueueConsumerReadinessByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_queue_consumer_readiness_replayed",
      duplicate: true,
      record: publicSequenceQueueConsumerReadiness(existing, true),
      redaction,
    };
  }

  const producer = await findQueueProducerReadinessById(db, queueProducerReadinessId);
  if (!producer) {
    return {
      ok: false,
      status: "queue_producer_readiness_not_found",
      message: "A current sequence Queue producer readiness record is required before consumer readiness can be recorded.",
      redaction,
    };
  }

  if (producer.sequence_id !== sequenceId) {
    return {
      ok: false,
      status: "stale_queue_producer_readiness_evidence",
      message: "The sequence no longer matches the selected Queue producer readiness record.",
      redaction,
    };
  }

  if (producer.status !== sequenceQueueProducerReadinessRecordStatus) {
    return {
      ok: false,
      status: "stale_queue_producer_readiness_status",
      message: "The sequence Queue producer readiness status changed before consumer readiness was recorded.",
      redaction,
      currentQueueProducerReadinessStatus: producer.status,
    };
  }

  const latestProducer = await findLatestQueueProducerReadinessForSequence(db, sequenceId);
  if (!latestProducer || latestProducer.id !== producer.id) {
    return {
      ok: false,
      status: "stale_queue_producer_readiness_evidence",
      message: "A newer sequence Queue producer readiness record exists for this sequence.",
      redaction,
    };
  }

  if (!producerHasNoLiveArtifacts(producer)) {
    return {
      ok: false,
      status: "consumer_gate_not_ready",
      message:
        "Sequence Queue consumer readiness requires a current dry-run producer readiness record with no producers, Queue messages, payload bodies, recipient payloads, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
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
    producer.expected_workspace_revision_id !== expectedWorkspaceRevisionId
  ) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before sequence Queue consumer readiness was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus || producer.expected_sequence_status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before sequence Queue consumer readiness was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (
    readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount ||
    numberValue(producer.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before Queue consumer readiness was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const recordId = `sequence-queue-consumer-readiness-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_sequence_queue_consumer_readiness (
        id, sequence_id, queue_producer_readiness_id, dispatch_attempt_id, dispatch_preflight_id,
        delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status, queue_name,
        consumer_binding, consumer_mode, consumer_gate_status, producer_dependency_status,
        payload_read_policy, ack_policy, retry_policy, dead_letter_policy, idempotency_policy,
        audit_correlation_policy, provider_handoff_policy, backpressure_policy,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        expected_queue_producer_readiness_status, dry_run_message_count, held_enrollment_count,
        active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
        dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
        sender_domain_gate_status, cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed,
        cloudflare_queue_messages_acked, queue_retry_records_created, queue_dead_letter_records_created,
        queue_payload_bodies_read, queue_payload_bodies_created, recipient_payloads_created,
        personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
        provider_responses_created, provider_message_ids_created, idempotency_key, actor_user_id,
        actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sequence_queue_consumer_readiness_recorded', ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      producer.sequence_id,
      producer.id,
      producer.dispatch_attempt_id,
      producer.dispatch_preflight_id,
      producer.delivery_queue_message_id,
      producer.delivery_batch_id,
      producer.schedule_intent_id,
      producer.queue_name,
      "AUDIENCE_SEQUENCE_DELIVERY_QUEUE",
      "dry_run_contract_only_no_cloudflare_queue_consumer",
      "blocked_until_sequence_queue_ack_retry_dead_letter_and_provider_handoff_contracts_verified",
      "blocked_until_sequence_queue_producer_readiness_issue_366_stays_current",
      "Future consumers must read payload bodies only after recipient redaction, unsubscribe-footer, suppression, and payload-shape checks pass together.",
      "Future consumers must ack only after idempotent provider handoff and redacted audit correlation are recorded; no ack path exists in this contract.",
      "Retries must preserve the original sequence, Queue message, dispatch attempt, and idempotency basis and fail closed when provider limits or stale readiness are detected.",
      "Dead-letter handling must store aggregate failure evidence only; raw Queue payload bodies and private recipient identity stay excluded.",
      "Future consumer writes must key idempotency by sequence, Queue producer readiness, dispatch attempt, Queue message, recipient scope, and provider handoff before any provider send is attempted.",
      "Future consumer writes must carry redacted audit correlation from schedule intent through delivery batch, queue-message evidence, dispatch preflight, dispatch attempt, Queue producer readiness, and Queue consumer readiness.",
      "Provider handoff stays blocked until Queue consumer, producer, sender-domain, provider-limit, provider-response, send-payload, suppression, unsubscribe, and audit gates pass together.",
      "Consumer backpressure must fail closed when provider rate-limit, Queue consumer, retry, dead-letter, or suppression capacity is not explicit.",
      readiness.workspace.revisionId,
      sequence.status,
      expectedReadyEnrollmentCount,
      audienceSequenceQueueProducerReadinessStatus,
      numberValue(producer.dry_run_message_count),
      numberValue(producer.held_enrollment_count),
      readiness.counts.activeSuppressionEntries,
      producer.provider_limit_policy,
      producer.provider_rate_limit_window,
      producer.dispatch_mode,
      producer.dispatch_result_status,
      producer.suppression_check_status,
      producer.unsubscribe_footer_check_status,
      producer.sender_domain_gate_status,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceQueueConsumerReadinessIssue,
        queueProducerReadinessId: producer.id,
        dispatchAttemptId: producer.dispatch_attempt_id,
        dispatchPreflightId: producer.dispatch_preflight_id,
        deliveryQueueMessageId: producer.delivery_queue_message_id,
        deliveryBatchId: producer.delivery_batch_id,
        scheduleIntentId: producer.schedule_intent_id,
        cloudflareQueueConsumerEnabled: false,
        cloudflareQueueMessagesConsumed: false,
        cloudflareQueueMessagesAcked: false,
        queueRetryRecordsCreated: false,
        queueDeadLetterRecordsCreated: false,
        queuePayloadBodiesRead: false,
        queuePayloadBodiesCreated: false,
        recipientPayloadsCreated: false,
        personalizedBodiesCreated: false,
        unsubscribeUrlsCreated: false,
        providerSendEnabled: false,
        providerResponsesIncluded: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const record = await findQueueConsumerReadinessByIdempotency(db, idempotencyKey);
  if (!record) {
    return {
      ok: false,
      status: "queue_consumer_readiness_not_created",
      message: "The sequence Queue consumer readiness record could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_queue_consumer_readiness_recorded",
    duplicate: false,
    record: publicSequenceQueueConsumerReadiness(record, false),
    redaction,
  };
}
