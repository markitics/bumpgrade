import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { audienceSequenceQueueConsumerReadinessStatus } from "@/lib/audience-sequence-queue-consumer-readiness";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceProviderCallReadinessIssue = 370;
export const audienceSequenceProviderCallReadinessStatus = "sequence-provider-call-readiness-ready";
export const audienceSequenceProviderCallReadinessApiRoute =
  "/api/admin/audience/sequences/provider-call-readiness";
export const audienceSequenceProviderCallReadinessConfirmationText =
  "Record Bumpgrade sequence provider-call readiness gate";
const sequenceQueueConsumerReadinessRecordStatus = "sequence_queue_consumer_readiness_recorded";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceQueueConsumerReadinessReferenceRow = {
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
  created_at: number | string | null;
};

type SequenceProviderCallReadinessRow = {
  id: string;
  sequence_id: string;
  queue_consumer_readiness_id: string;
  queue_producer_readiness_id: string;
  dispatch_attempt_id: string;
  dispatch_preflight_id: string;
  delivery_queue_message_id: string;
  delivery_batch_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  provider_name: string;
  provider_mode: string;
  provider_call_gate_status: string;
  queue_consumer_dependency_status: string;
  provider_response_policy: string;
  provider_message_id_policy: string;
  delivery_attempt_policy: string;
  idempotency_policy: string;
  audit_correlation_policy: string;
  backpressure_policy: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  expected_queue_consumer_readiness_status: string;
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
  provider_call_enabled: number | string | null;
  delivery_attempts_created: number | string | null;
  delivery_results_created: number | string | null;
  delivery_status_webhooks_processed: number | string | null;
  delivery_receipts_created: number | string | null;
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

export type AudienceSequenceProviderCallReadinessPublic = {
  id: string;
  sequenceId: string;
  queueConsumerReadinessId: string;
  queueProducerReadinessId: string;
  dispatchAttemptId: string;
  dispatchPreflightId: string;
  deliveryQueueMessageId: string;
  deliveryBatchId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  providerName: string;
  providerMode: string;
  providerCallGateStatus: string;
  queueConsumerDependencyStatus: string;
  providerResponsePolicy: string;
  providerMessageIdPolicy: string;
  deliveryAttemptPolicy: string;
  idempotencyPolicy: string;
  auditCorrelationPolicy: string;
  backpressurePolicy: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
  expectedQueueConsumerReadinessStatus: string;
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
  providerCallEnabled: false;
  deliveryAttemptsCreated: false;
  deliveryResultsCreated: false;
  deliveryStatusWebhooksProcessed: false;
  deliveryReceiptsCreated: false;
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

export type AudienceSequenceProviderCallReadinessSummary = {
  id: "audience-sequence-provider-call-readiness-contract";
  status: typeof audienceSequenceProviderCallReadinessStatus;
  issue: typeof audienceSequenceProviderCallReadinessIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceProviderCallReadinessApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceProviderCallReadinessConfirmationText;
  };
  dependency: {
    queueConsumerReadinessStatus: typeof audienceSequenceQueueConsumerReadinessStatus;
    queueConsumerReadinessIssue: 368;
    queueConsumerReadinessRequired: true;
  };
  counts: {
    providerCallReadinessRecords: number;
    dryRunProviderCallContracts: number;
    dryRunMessagesSnapshotted: number;
    heldEnrollmentsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    providerCallEnabledRecords: number;
    deliveryAttemptsCreatedRecords: number;
    deliveryResultsCreatedRecords: number;
    deliveryStatusWebhooksProcessedRecords: number;
    deliveryReceiptsCreatedRecords: number;
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
  latestRecords: AudienceSequenceProviderCallReadinessPublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    deliveryQueuePayloadsIncluded: false;
    cloudflareQueuePayloadsIncluded: false;
    queuePayloadBodiesIncluded: false;
    providerCallBodiesIncluded: false;
    deliveryAttemptsIncluded: false;
    deliveryResultsIncluded: false;
    deliveryStatusWebhooksIncluded: false;
    deliveryReceiptsIncluded: false;
    queueConsumerAckRowsIncluded: false;
    queueRetryRowsIncluded: false;
    queueDeadLetterRowsIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodiesIncluded: false;
    bodyTemplatesIncluded: false;
    unsubscribeUrlsIncluded: false;
    providerResponsesIncluded: false;
    providerMessageIdsIncluded: false;
    providerCallsEnabled: false;
    deliveryAttemptsCreated: false;
    deliveryResultsCreated: false;
    deliveryStatusWebhooksProcessed: false;
    deliveryReceiptsCreated: false;
    cloudflareQueueConsumersEnabled: false;
    cloudflareQueueMessagesConsumed: false;
    cloudflareQueueMessagesAcked: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateSequenceProviderCallReadinessInput = {
  queueConsumerReadinessId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceProviderCallReadinessResult =
  | {
      ok: true;
      status: "sequence_provider_call_readiness_recorded" | "sequence_provider_call_readiness_replayed";
      duplicate: boolean;
      record: AudienceSequenceProviderCallReadinessPublic;
      redaction: AudienceSequenceProviderCallReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "queue_consumer_readiness_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "stale_queue_consumer_readiness_status"
        | "stale_queue_consumer_readiness_evidence"
        | "provider_call_gate_not_ready"
        | "provider_call_readiness_not_created";
      message: string;
      redaction: AudienceSequenceProviderCallReadinessSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
      currentQueueConsumerReadinessStatus?: string | null;
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

function queueConsumerHasNoLiveArtifacts(row: SequenceQueueConsumerReadinessReferenceRow) {
  return (
    row.consumer_mode === "dry_run_contract_only_no_cloudflare_queue_consumer" &&
    numberValue(row.cloudflare_queue_consumer_enabled) === 0 &&
    numberValue(row.cloudflare_queue_messages_consumed) === 0 &&
    numberValue(row.cloudflare_queue_messages_acked) === 0 &&
    numberValue(row.queue_retry_records_created) === 0 &&
    numberValue(row.queue_dead_letter_records_created) === 0 &&
    numberValue(row.queue_payload_bodies_read) === 0 &&
    numberValue(row.queue_payload_bodies_created) === 0 &&
    numberValue(row.recipient_payloads_created) === 0 &&
    numberValue(row.personalized_bodies_created) === 0 &&
    numberValue(row.unsubscribe_urls_created) === 0 &&
    numberValue(row.provider_send_enabled) === 0 &&
    numberValue(row.provider_responses_created) === 0 &&
    numberValue(row.provider_message_ids_created) === 0
  );
}

function publicSequenceProviderCallReadiness(
  row: SequenceProviderCallReadinessRow,
  duplicate: boolean,
): AudienceSequenceProviderCallReadinessPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    queueConsumerReadinessId: row.queue_consumer_readiness_id,
    queueProducerReadinessId: row.queue_producer_readiness_id,
    dispatchAttemptId: row.dispatch_attempt_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    deliveryQueueMessageId: row.delivery_queue_message_id,
    deliveryBatchId: row.delivery_batch_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    providerName: row.provider_name,
    providerMode: row.provider_mode,
    providerCallGateStatus: row.provider_call_gate_status,
    queueConsumerDependencyStatus: row.queue_consumer_dependency_status,
    providerResponsePolicy: row.provider_response_policy,
    providerMessageIdPolicy: row.provider_message_id_policy,
    deliveryAttemptPolicy: row.delivery_attempt_policy,
    idempotencyPolicy: row.idempotency_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    backpressurePolicy: row.backpressure_policy,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
    expectedQueueConsumerReadinessStatus: row.expected_queue_consumer_readiness_status,
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
    providerCallEnabled: false,
    deliveryAttemptsCreated: false,
    deliveryResultsCreated: false,
    deliveryStatusWebhooksProcessed: false,
    deliveryReceiptsCreated: false,
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
  source: AudienceSequenceProviderCallReadinessSummary["source"],
  loadError: string | null,
): AudienceSequenceProviderCallReadinessSummary {
  return {
    id: "audience-sequence-provider-call-readiness-contract",
    status: audienceSequenceProviderCallReadinessStatus,
    issue: audienceSequenceProviderCallReadinessIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceProviderCallReadinessApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceProviderCallReadinessConfirmationText,
    },
    dependency: {
      queueConsumerReadinessStatus: audienceSequenceQueueConsumerReadinessStatus,
      queueConsumerReadinessIssue: 368,
      queueConsumerReadinessRequired: true,
    },
    counts: {
      providerCallReadinessRecords: 0,
      dryRunProviderCallContracts: 0,
      dryRunMessagesSnapshotted: 0,
      heldEnrollmentsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      providerCallEnabledRecords: 0,
      deliveryAttemptsCreatedRecords: 0,
      deliveryResultsCreatedRecords: 0,
      deliveryStatusWebhooksProcessedRecords: 0,
      deliveryReceiptsCreatedRecords: 0,
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
      providerCallBodiesIncluded: false,
      deliveryAttemptsIncluded: false,
      deliveryResultsIncluded: false,
      deliveryStatusWebhooksIncluded: false,
      deliveryReceiptsIncluded: false,
      queueConsumerAckRowsIncluded: false,
      queueRetryRowsIncluded: false,
      queueDeadLetterRowsIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
      bodyTemplatesIncluded: false,
      unsubscribeUrlsIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      providerCallsEnabled: false,
      deliveryAttemptsCreated: false,
      deliveryResultsCreated: false,
      deliveryStatusWebhooksProcessed: false,
      deliveryReceiptsCreated: false,
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
      "providerCallBody",
      "deliveryAttempt",
      "deliveryResult",
      "deliveryStatusWebhook",
      "deliveryReceipt",
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
      "Issue #370 lets verified owners record sequence provider-call readiness gates from a current sequence Queue consumer readiness record after exact confirmation, idempotency, workspace revision, sequence status, readiness, Queue consumer status, provider-response, message-id, delivery-attempt, backpressure, and audit checks. It does not call providers, send messages, create provider responses, create provider message IDs, create delivery attempts or results, process webhooks, create receipts, enable Cloudflare Queue consumers, consume or ack Queue messages, create retry or dead-letter rows, read or create Queue payload bodies, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

function providerCallSelect() {
  return `SELECT
    id, sequence_id, queue_consumer_readiness_id, queue_producer_readiness_id,
    dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
    schedule_intent_id, status, queue_name, provider_name, provider_mode,
    provider_call_gate_status, queue_consumer_dependency_status, provider_response_policy,
    provider_message_id_policy, delivery_attempt_policy, idempotency_policy,
    audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
    expected_sequence_status, expected_ready_enrollment_count,
    expected_queue_consumer_readiness_status, dry_run_message_count, held_enrollment_count,
    active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
    dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
    sender_domain_gate_status, provider_call_enabled, delivery_attempts_created,
    delivery_results_created, delivery_status_webhooks_processed, delivery_receipts_created,
    cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed,
    cloudflare_queue_messages_acked, queue_retry_records_created, queue_dead_letter_records_created,
    queue_payload_bodies_read, queue_payload_bodies_created, recipient_payloads_created,
    personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
    provider_responses_created, provider_message_ids_created, idempotency_key, created_at
  FROM audience_sequence_provider_call_readiness`;
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
    provider_responses_created, provider_message_ids_created, created_at
  FROM audience_sequence_queue_consumer_readiness`;
}

async function findQueueConsumerReadinessById(db: D1Database, id: string) {
  return db
    .prepare(`${queueConsumerSelect()} WHERE id = ?`)
    .bind(id)
    .first<SequenceQueueConsumerReadinessReferenceRow>();
}

async function findLatestQueueConsumerReadinessForSequence(db: D1Database, sequenceId: string) {
  return db
    .prepare(`${queueConsumerSelect()} WHERE sequence_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`)
    .bind(sequenceId)
    .first<SequenceQueueConsumerReadinessReferenceRow>();
}

async function findProviderCallReadinessByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(`${providerCallSelect()} WHERE idempotency_key = ?`)
    .bind(idempotencyKey)
    .first<SequenceProviderCallReadinessRow>();
}

export async function getAudienceSequenceProviderCallReadinessSummary(): Promise<AudienceSequenceProviderCallReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS provider_call_readiness_count,
          SUM(CASE WHEN provider_mode LIKE '%dry_run%' THEN 1 ELSE 0 END) AS dry_run_provider_call_contract_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN provider_call_enabled > 0 THEN 1 ELSE 0 END) AS provider_call_enabled_count,
          SUM(CASE WHEN delivery_attempts_created > 0 THEN 1 ELSE 0 END) AS delivery_attempts_created_count,
          SUM(CASE WHEN delivery_results_created > 0 THEN 1 ELSE 0 END) AS delivery_results_created_count,
          SUM(CASE WHEN delivery_status_webhooks_processed > 0 THEN 1 ELSE 0 END) AS delivery_status_webhooks_processed_count,
          SUM(CASE WHEN delivery_receipts_created > 0 THEN 1 ELSE 0 END) AS delivery_receipts_created_count,
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
        FROM audience_sequence_provider_call_readiness`,
      )
      .first<{
        provider_call_readiness_count: number | string | null;
        dry_run_provider_call_contract_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_enrollment_count: number | string | null;
        active_suppression_count: number | string | null;
        provider_call_enabled_count: number | string | null;
        delivery_attempts_created_count: number | string | null;
        delivery_results_created_count: number | string | null;
        delivery_status_webhooks_processed_count: number | string | null;
        delivery_receipts_created_count: number | string | null;
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
      .prepare(`${providerCallSelect()} ORDER BY created_at DESC LIMIT 10`)
      .all<SequenceProviderCallReadinessRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        providerCallReadinessRecords: numberValue(counts?.provider_call_readiness_count),
        dryRunProviderCallContracts: numberValue(counts?.dry_run_provider_call_contract_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        providerCallEnabledRecords: numberValue(counts?.provider_call_enabled_count),
        deliveryAttemptsCreatedRecords: numberValue(counts?.delivery_attempts_created_count),
        deliveryResultsCreatedRecords: numberValue(counts?.delivery_results_created_count),
        deliveryStatusWebhooksProcessedRecords: numberValue(counts?.delivery_status_webhooks_processed_count),
        deliveryReceiptsCreatedRecords: numberValue(counts?.delivery_receipts_created_count),
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
      latestRecords: (latest.results ?? []).map((row) => publicSequenceProviderCallReadiness(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence provider-call readiness.",
    );
  }
}

export async function createAudienceSequenceProviderCallReadiness(
  input: CreateSequenceProviderCallReadinessInput,
): Promise<CreateSequenceProviderCallReadinessResult> {
  const redaction = emptySummary("d1", null).redaction;
  const queueConsumerReadinessId = parseString(input.queueConsumerReadinessId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !queueConsumerReadinessId ||
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
        "A Queue consumer readiness ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceProviderCallReadinessConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording sequence provider-call readiness.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findProviderCallReadinessByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_provider_call_readiness_replayed",
      duplicate: true,
      record: publicSequenceProviderCallReadiness(existing, true),
      redaction,
    };
  }

  const consumer = await findQueueConsumerReadinessById(db, queueConsumerReadinessId);
  if (!consumer) {
    return {
      ok: false,
      status: "queue_consumer_readiness_not_found",
      message: "A current sequence Queue consumer readiness record is required before provider-call readiness can be recorded.",
      redaction,
    };
  }

  if (consumer.sequence_id !== sequenceId) {
    return {
      ok: false,
      status: "stale_queue_consumer_readiness_evidence",
      message: "The sequence no longer matches the selected Queue consumer readiness record.",
      redaction,
    };
  }

  if (consumer.status !== sequenceQueueConsumerReadinessRecordStatus) {
    return {
      ok: false,
      status: "stale_queue_consumer_readiness_status",
      message: "The sequence Queue consumer readiness status changed before provider-call readiness was recorded.",
      redaction,
      currentQueueConsumerReadinessStatus: consumer.status,
    };
  }

  const latestConsumer = await findLatestQueueConsumerReadinessForSequence(db, sequenceId);
  if (!latestConsumer || latestConsumer.id !== consumer.id) {
    return {
      ok: false,
      status: "stale_queue_consumer_readiness_evidence",
      message: "A newer sequence Queue consumer readiness record exists for this sequence.",
      redaction,
    };
  }

  if (!queueConsumerHasNoLiveArtifacts(consumer)) {
    return {
      ok: false,
      status: "provider_call_gate_not_ready",
      message:
        "Sequence provider-call readiness requires a current dry-run Queue consumer readiness record with no Queue consumption, acknowledgements, retry/dead-letter rows, payload reads, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
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
    consumer.expected_workspace_revision_id !== expectedWorkspaceRevisionId
  ) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before sequence provider-call readiness was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus || consumer.expected_sequence_status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before sequence provider-call readiness was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (
    readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount ||
    numberValue(consumer.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before provider-call readiness was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const recordId = `sequence-provider-call-readiness-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_sequence_provider_call_readiness (
        id, sequence_id, queue_consumer_readiness_id, queue_producer_readiness_id,
        dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
        schedule_intent_id, status, queue_name, provider_name, provider_mode,
        provider_call_gate_status, queue_consumer_dependency_status, provider_response_policy,
        provider_message_id_policy, delivery_attempt_policy, idempotency_policy,
        audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
        expected_sequence_status, expected_ready_enrollment_count,
        expected_queue_consumer_readiness_status, dry_run_message_count, held_enrollment_count,
        active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
        dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
        sender_domain_gate_status, provider_call_enabled, delivery_attempts_created,
        delivery_results_created, delivery_status_webhooks_processed, delivery_receipts_created,
        cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed,
        cloudflare_queue_messages_acked, queue_retry_records_created, queue_dead_letter_records_created,
        queue_payload_bodies_read, queue_payload_bodies_created, recipient_payloads_created,
        personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
        provider_responses_created, provider_message_ids_created, idempotency_key, actor_user_id,
        actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      consumer.sequence_id,
      consumer.id,
      consumer.queue_producer_readiness_id,
      consumer.dispatch_attempt_id,
      consumer.dispatch_preflight_id,
      consumer.delivery_queue_message_id,
      consumer.delivery_batch_id,
      consumer.schedule_intent_id,
      "sequence_provider_call_readiness_recorded",
      consumer.queue_name,
      "resend_or_cloudflare_email_provider_pending",
      "dry_run_contract_only_no_provider_call",
      "blocked_until_provider_response_message_id_delivery_attempt_and_receipt_contracts_verified",
      "blocked_until_sequence_queue_consumer_readiness_issue_368_stays_current",
      "Future provider responses must store redacted aggregate status only after idempotent provider-call evidence exists; response bodies stay excluded from this contract.",
      "Future provider message IDs must stay out of source-data until delivery attempt, result, webhook, receipt, redaction, and audit contracts exist together.",
      "Delivery attempts stay disabled until provider-call, provider-response, message-ID, retry, webhook, receipt, unsubscribe, suppression, and audit checks pass together.",
      "Future provider-call writes must key idempotency by sequence, Queue consumer readiness, dispatch attempt, Queue message, provider, recipient scope, and delivery attempt before any send leaves Bumpgrade.",
      "Future provider-call writes must carry redacted audit correlation from schedule intent through delivery batch, queue-message evidence, dispatch preflight, dispatch attempt, Queue producer readiness, Queue consumer readiness, and provider-call readiness.",
      "Provider-call backpressure must fail closed when provider limits, delivery attempts, receipts, retry/dead-letter capacity, or suppression capacity are not explicit.",
      readiness.workspace.revisionId,
      sequence.status,
      expectedReadyEnrollmentCount,
      audienceSequenceQueueConsumerReadinessStatus,
      numberValue(consumer.dry_run_message_count),
      numberValue(consumer.held_enrollment_count),
      numberValue(consumer.active_suppression_count),
      consumer.provider_limit_policy,
      consumer.provider_rate_limit_window,
      consumer.dispatch_mode,
      consumer.dispatch_result_status,
      consumer.suppression_check_status,
      consumer.unsubscribe_footer_check_status,
      consumer.sender_domain_gate_status,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceProviderCallReadinessIssue,
        queueConsumerReadinessId: consumer.id,
        queueProducerReadinessId: consumer.queue_producer_readiness_id,
        dispatchAttemptId: consumer.dispatch_attempt_id,
        dispatchPreflightId: consumer.dispatch_preflight_id,
        deliveryQueueMessageId: consumer.delivery_queue_message_id,
        deliveryBatchId: consumer.delivery_batch_id,
        scheduleIntentId: consumer.schedule_intent_id,
        providerCallEnabled: false,
        deliveryAttemptsCreated: false,
        deliveryResultsCreated: false,
        deliveryStatusWebhooksProcessed: false,
        deliveryReceiptsCreated: false,
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

  const record = await findProviderCallReadinessByIdempotency(db, idempotencyKey);
  if (!record) {
    return {
      ok: false,
      status: "provider_call_readiness_not_created",
      message: "The sequence provider-call readiness record could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_provider_call_readiness_recorded",
    duplicate: false,
    record: publicSequenceProviderCallReadiness(record, false),
    redaction,
  };
}
