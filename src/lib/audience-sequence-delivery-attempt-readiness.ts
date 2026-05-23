import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { audienceSequenceProviderCallReadinessStatus } from "@/lib/audience-sequence-provider-call-readiness";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceDeliveryAttemptReadinessIssue = 372;
export const audienceSequenceDeliveryAttemptReadinessStatus = "sequence-delivery-attempt-readiness-ready";
export const audienceSequenceDeliveryAttemptReadinessApiRoute =
  "/api/admin/audience/sequences/delivery-attempt-readiness";
export const audienceSequenceDeliveryAttemptReadinessConfirmationText =
  "Record Bumpgrade sequence delivery-attempt readiness gate";
const sequenceProviderCallReadinessRecordStatus = "sequence_provider_call_readiness_recorded";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceProviderCallReadinessReferenceRow = {
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
  created_at: number | string | null;
};

type SequenceDeliveryAttemptReadinessRow = {
  id: string;
  sequence_id: string;
  provider_call_readiness_id: string;
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
  delivery_attempt_gate_status: string;
  provider_call_dependency_status: string;
  provider_response_policy: string;
  provider_message_id_policy: string;
  delivery_attempt_policy: string;
  idempotency_policy: string;
  audit_correlation_policy: string;
  backpressure_policy: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  expected_provider_call_readiness_status: string;
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
  delivery_attempt_enabled: number | string | null;
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

export type AudienceSequenceDeliveryAttemptReadinessPublic = {
  id: string;
  sequenceId: string;
  providerCallReadinessId: string;
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
  deliveryAttemptGateStatus: string;
  providerCallDependencyStatus: string;
  providerResponsePolicy: string;
  providerMessageIdPolicy: string;
  deliveryAttemptPolicy: string;
  idempotencyPolicy: string;
  auditCorrelationPolicy: string;
  backpressurePolicy: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
  expectedProviderCallReadinessStatus: string;
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
  deliveryAttemptEnabled: false;
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

export type AudienceSequenceDeliveryAttemptReadinessSummary = {
  id: "audience-sequence-delivery-attempt-readiness-contract";
  status: typeof audienceSequenceDeliveryAttemptReadinessStatus;
  issue: typeof audienceSequenceDeliveryAttemptReadinessIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceDeliveryAttemptReadinessApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceDeliveryAttemptReadinessConfirmationText;
  };
  dependency: {
    providerCallReadinessStatus: typeof audienceSequenceProviderCallReadinessStatus;
    providerCallReadinessIssue: 370;
    providerCallReadinessRequired: true;
  };
  counts: {
    deliveryAttemptReadinessRecords: number;
    dryRunDeliveryAttemptContracts: number;
    dryRunMessagesSnapshotted: number;
    heldEnrollmentsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    deliveryAttemptEnabledRecords: number;
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
  latestRecords: AudienceSequenceDeliveryAttemptReadinessPublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    deliveryQueuePayloadsIncluded: false;
    cloudflareQueuePayloadsIncluded: false;
    queuePayloadBodiesIncluded: false;
    deliveryAttemptBodiesIncluded: false;
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
    deliveryAttemptsEnabled: false;
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

type CreateSequenceDeliveryAttemptReadinessInput = {
  providerCallReadinessId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceDeliveryAttemptReadinessResult =
  | {
      ok: true;
      status: "sequence_delivery_attempt_readiness_recorded" | "sequence_delivery_attempt_readiness_replayed";
      duplicate: boolean;
      record: AudienceSequenceDeliveryAttemptReadinessPublic;
      redaction: AudienceSequenceDeliveryAttemptReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "provider_call_readiness_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "stale_provider_call_readiness_status"
        | "stale_provider_call_readiness_evidence"
        | "delivery_attempt_gate_not_ready"
        | "delivery_attempt_readiness_not_created";
      message: string;
      redaction: AudienceSequenceDeliveryAttemptReadinessSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
      currentProviderCallReadinessStatus?: string | null;
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

function providerCallHasNoLiveArtifacts(row: SequenceProviderCallReadinessReferenceRow) {
  return (
    row.provider_mode === "dry_run_contract_only_no_provider_call" &&
    numberValue(row.provider_call_enabled) === 0 &&
    numberValue(row.delivery_attempts_created) === 0 &&
    numberValue(row.delivery_results_created) === 0 &&
    numberValue(row.delivery_status_webhooks_processed) === 0 &&
    numberValue(row.delivery_receipts_created) === 0 &&
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

function publicSequenceDeliveryAttemptReadiness(
  row: SequenceDeliveryAttemptReadinessRow,
  duplicate: boolean,
): AudienceSequenceDeliveryAttemptReadinessPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    providerCallReadinessId: row.provider_call_readiness_id,
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
    deliveryAttemptGateStatus: row.delivery_attempt_gate_status,
    providerCallDependencyStatus: row.provider_call_dependency_status,
    providerResponsePolicy: row.provider_response_policy,
    providerMessageIdPolicy: row.provider_message_id_policy,
    deliveryAttemptPolicy: row.delivery_attempt_policy,
    idempotencyPolicy: row.idempotency_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    backpressurePolicy: row.backpressure_policy,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
    expectedProviderCallReadinessStatus: row.expected_provider_call_readiness_status,
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
    deliveryAttemptEnabled: false,
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
  source: AudienceSequenceDeliveryAttemptReadinessSummary["source"],
  loadError: string | null,
): AudienceSequenceDeliveryAttemptReadinessSummary {
  return {
    id: "audience-sequence-delivery-attempt-readiness-contract",
    status: audienceSequenceDeliveryAttemptReadinessStatus,
    issue: audienceSequenceDeliveryAttemptReadinessIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceDeliveryAttemptReadinessApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceDeliveryAttemptReadinessConfirmationText,
    },
    dependency: {
      providerCallReadinessStatus: audienceSequenceProviderCallReadinessStatus,
      providerCallReadinessIssue: 370,
      providerCallReadinessRequired: true,
    },
    counts: {
      deliveryAttemptReadinessRecords: 0,
      dryRunDeliveryAttemptContracts: 0,
      dryRunMessagesSnapshotted: 0,
      heldEnrollmentsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      deliveryAttemptEnabledRecords: 0,
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
      deliveryAttemptBodiesIncluded: false,
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
      deliveryAttemptsEnabled: false,
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
      "deliveryAttemptBody",
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
      "Issue #372 lets verified owners record sequence delivery-attempt readiness gates from a current sequence provider-call readiness record after exact confirmation, idempotency, workspace revision, sequence status, readiness, provider-call status, provider-response, message-id, delivery-attempt, backpressure, and audit checks. It does not call providers, send messages, create provider responses, create provider message IDs, create delivery attempts or results, process webhooks, create receipts, enable Cloudflare Queue consumers, consume or ack Queue messages, create retry or dead-letter rows, read or create Queue payload bodies, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

function deliveryAttemptSelect() {
  return `SELECT
    id, sequence_id, provider_call_readiness_id, queue_consumer_readiness_id, queue_producer_readiness_id,
    dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
    schedule_intent_id, status, queue_name, provider_name, provider_mode,
    delivery_attempt_gate_status, provider_call_dependency_status, provider_response_policy,
    provider_message_id_policy, delivery_attempt_policy, idempotency_policy,
    audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
    expected_sequence_status, expected_ready_enrollment_count,
    expected_provider_call_readiness_status, dry_run_message_count, held_enrollment_count,
    active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
    dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
    sender_domain_gate_status, delivery_attempt_enabled, delivery_attempts_created,
    delivery_results_created, delivery_status_webhooks_processed, delivery_receipts_created,
    cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed,
    cloudflare_queue_messages_acked, queue_retry_records_created, queue_dead_letter_records_created,
    queue_payload_bodies_read, queue_payload_bodies_created, recipient_payloads_created,
    personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
    provider_responses_created, provider_message_ids_created, idempotency_key, created_at
  FROM audience_sequence_delivery_attempt_readiness`;
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
    provider_responses_created, provider_message_ids_created, created_at
  FROM audience_sequence_provider_call_readiness`;
}

async function findProviderCallReadinessById(db: D1Database, id: string) {
  return db
    .prepare(`${providerCallSelect()} WHERE id = ?`)
    .bind(id)
    .first<SequenceProviderCallReadinessReferenceRow>();
}

async function findLatestProviderCallReadinessForSequence(db: D1Database, sequenceId: string) {
  return db
    .prepare(`${providerCallSelect()} WHERE sequence_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`)
    .bind(sequenceId)
    .first<SequenceProviderCallReadinessReferenceRow>();
}

async function findDeliveryAttemptReadinessByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(`${deliveryAttemptSelect()} WHERE idempotency_key = ?`)
    .bind(idempotencyKey)
    .first<SequenceDeliveryAttemptReadinessRow>();
}

export async function getAudienceSequenceDeliveryAttemptReadinessSummary(): Promise<AudienceSequenceDeliveryAttemptReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS delivery_attempt_readiness_count,
          SUM(CASE WHEN provider_mode LIKE '%dry_run%' THEN 1 ELSE 0 END) AS dry_run_delivery_attempt_contract_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN delivery_attempt_enabled > 0 THEN 1 ELSE 0 END) AS delivery_attempt_enabled_count,
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
        FROM audience_sequence_delivery_attempt_readiness`,
      )
      .first<{
        delivery_attempt_readiness_count: number | string | null;
        dry_run_delivery_attempt_contract_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_enrollment_count: number | string | null;
        active_suppression_count: number | string | null;
        delivery_attempt_enabled_count: number | string | null;
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
      .prepare(`${deliveryAttemptSelect()} ORDER BY created_at DESC LIMIT 10`)
      .all<SequenceDeliveryAttemptReadinessRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        deliveryAttemptReadinessRecords: numberValue(counts?.delivery_attempt_readiness_count),
        dryRunDeliveryAttemptContracts: numberValue(counts?.dry_run_delivery_attempt_contract_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        deliveryAttemptEnabledRecords: numberValue(counts?.delivery_attempt_enabled_count),
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
      latestRecords: (latest.results ?? []).map((row) => publicSequenceDeliveryAttemptReadiness(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence delivery-attempt readiness.",
    );
  }
}

export async function createAudienceSequenceDeliveryAttemptReadiness(
  input: CreateSequenceDeliveryAttemptReadinessInput,
): Promise<CreateSequenceDeliveryAttemptReadinessResult> {
  const redaction = emptySummary("d1", null).redaction;
  const providerCallReadinessId = parseString(input.providerCallReadinessId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !providerCallReadinessId ||
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
        "A provider-call readiness ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceDeliveryAttemptReadinessConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording sequence delivery-attempt readiness.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDeliveryAttemptReadinessByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_delivery_attempt_readiness_replayed",
      duplicate: true,
      record: publicSequenceDeliveryAttemptReadiness(existing, true),
      redaction,
    };
  }

  const providerCall = await findProviderCallReadinessById(db, providerCallReadinessId);
  if (!providerCall) {
    return {
      ok: false,
      status: "provider_call_readiness_not_found",
      message: "A current sequence provider-call readiness record is required before delivery-attempt readiness can be recorded.",
      redaction,
    };
  }

  if (providerCall.sequence_id !== sequenceId) {
    return {
      ok: false,
      status: "stale_provider_call_readiness_evidence",
      message: "The sequence no longer matches the selected provider-call readiness record.",
      redaction,
    };
  }

  if (providerCall.status !== sequenceProviderCallReadinessRecordStatus) {
    return {
      ok: false,
      status: "stale_provider_call_readiness_status",
      message: "The sequence provider-call readiness status changed before delivery-attempt readiness was recorded.",
      redaction,
      currentProviderCallReadinessStatus: providerCall.status,
    };
  }

  const latestProviderCall = await findLatestProviderCallReadinessForSequence(db, sequenceId);
  if (!latestProviderCall || latestProviderCall.id !== providerCall.id) {
    return {
      ok: false,
      status: "stale_provider_call_readiness_evidence",
      message: "A newer sequence provider-call readiness record exists for this sequence.",
      redaction,
    };
  }

  if (!providerCallHasNoLiveArtifacts(providerCall)) {
    return {
      ok: false,
      status: "delivery_attempt_gate_not_ready",
      message:
        "Sequence delivery-attempt readiness requires a current dry-run provider-call readiness record with no provider calls, Queue consumption, acknowledgements, retry/dead-letter rows, payload reads, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, provider message IDs, delivery attempts, delivery results, webhooks, or receipts.",
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
    providerCall.expected_workspace_revision_id !== expectedWorkspaceRevisionId
  ) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before sequence delivery-attempt readiness was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus || providerCall.expected_sequence_status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before sequence delivery-attempt readiness was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (
    readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount ||
    numberValue(providerCall.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before delivery-attempt readiness was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const recordId = `sequence-delivery-attempt-readiness-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_sequence_delivery_attempt_readiness (
        id, sequence_id, provider_call_readiness_id, queue_consumer_readiness_id, queue_producer_readiness_id,
        dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
        schedule_intent_id, status, queue_name, provider_name, provider_mode,
        delivery_attempt_gate_status, provider_call_dependency_status, provider_response_policy,
        provider_message_id_policy, delivery_attempt_policy, idempotency_policy,
        audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
        expected_sequence_status, expected_ready_enrollment_count,
        expected_provider_call_readiness_status, dry_run_message_count, held_enrollment_count,
        active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
        dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
        sender_domain_gate_status, delivery_attempt_enabled, delivery_attempts_created,
        delivery_results_created, delivery_status_webhooks_processed, delivery_receipts_created,
        cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed,
        cloudflare_queue_messages_acked, queue_retry_records_created, queue_dead_letter_records_created,
        queue_payload_bodies_read, queue_payload_bodies_created, recipient_payloads_created,
        personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
        provider_responses_created, provider_message_ids_created, idempotency_key, actor_user_id,
        actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      providerCall.sequence_id,
      providerCall.id,
      providerCall.queue_consumer_readiness_id,
      providerCall.queue_producer_readiness_id,
      providerCall.dispatch_attempt_id,
      providerCall.dispatch_preflight_id,
      providerCall.delivery_queue_message_id,
      providerCall.delivery_batch_id,
      providerCall.schedule_intent_id,
      "sequence_delivery_attempt_readiness_recorded",
      providerCall.queue_name,
      providerCall.provider_name,
      "dry_run_contract_only_no_delivery_attempt",
      "blocked_until_delivery_result_webhook_receipt_and_message_id_contracts_verified",
      "blocked_until_sequence_provider_call_readiness_issue_370_stays_current",
      "Future provider responses must store redacted aggregate status only after idempotent delivery-attempt evidence exists; response bodies stay excluded from this contract.",
      "Future provider message IDs must stay out of source-data until delivery attempt, result, webhook, receipt, redaction, and audit contracts exist together.",
      "Delivery attempts stay disabled until provider-call, provider-response, message-ID, retry, webhook, receipt, unsubscribe, suppression, and audit checks pass together.",
      "Future delivery-attempt writes must key idempotency by sequence, provider-call readiness, dispatch attempt, Queue message, provider, recipient scope, delivery attempt, and result receipt before any send leaves Bumpgrade.",
      "Future delivery-attempt writes must carry redacted audit correlation from schedule intent through delivery batch, queue-message evidence, dispatch preflight, dispatch attempt, Queue producer readiness, Queue consumer readiness, provider-call readiness, and delivery-attempt readiness.",
      "Delivery-attempt backpressure must fail closed when provider limits, delivery attempts, receipts, retry/dead-letter capacity, or suppression capacity are not explicit.",
      readiness.workspace.revisionId,
      sequence.status,
      expectedReadyEnrollmentCount,
      audienceSequenceProviderCallReadinessStatus,
      numberValue(providerCall.dry_run_message_count),
      numberValue(providerCall.held_enrollment_count),
      numberValue(providerCall.active_suppression_count),
      providerCall.provider_limit_policy,
      providerCall.provider_rate_limit_window,
      providerCall.dispatch_mode,
      providerCall.dispatch_result_status,
      providerCall.suppression_check_status,
      providerCall.unsubscribe_footer_check_status,
      providerCall.sender_domain_gate_status,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceDeliveryAttemptReadinessIssue,
        providerCallReadinessId: providerCall.id,
        queueConsumerReadinessId: providerCall.queue_consumer_readiness_id,
        queueProducerReadinessId: providerCall.queue_producer_readiness_id,
        dispatchAttemptId: providerCall.dispatch_attempt_id,
        dispatchPreflightId: providerCall.dispatch_preflight_id,
        deliveryQueueMessageId: providerCall.delivery_queue_message_id,
        deliveryBatchId: providerCall.delivery_batch_id,
        scheduleIntentId: providerCall.schedule_intent_id,
        providerCallEnabled: false,
        deliveryAttemptEnabled: false,
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

  const record = await findDeliveryAttemptReadinessByIdempotency(db, idempotencyKey);
  if (!record) {
    return {
      ok: false,
      status: "delivery_attempt_readiness_not_created",
      message: "The sequence delivery-attempt readiness record could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_delivery_attempt_readiness_recorded",
    duplicate: false,
    record: publicSequenceDeliveryAttemptReadiness(record, false),
    redaction,
  };
}
