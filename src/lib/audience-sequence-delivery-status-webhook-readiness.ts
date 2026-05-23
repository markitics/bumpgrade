import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import {
  audienceSequenceDeliveryResultReadinessStatus,
} from "@/lib/audience-sequence-delivery-result-readiness";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceDeliveryStatusWebhookReadinessIssue = 376;
export const audienceSequenceDeliveryStatusWebhookReadinessStatus = "sequence-delivery-status-webhook-readiness-ready";
export const audienceSequenceDeliveryStatusWebhookReadinessApiRoute =
  "/api/admin/audience/sequences/delivery-status-webhook-readiness";
export const audienceSequenceDeliveryStatusWebhookReadinessConfirmationText =
  "Record Bumpgrade sequence delivery-status webhook readiness gate";
const sequenceDeliveryResultReadinessRecordStatus = "sequence_delivery_result_readiness_recorded";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceDeliveryResultReadinessReferenceRow = {
  id: string;
  sequence_id: string;
  delivery_attempt_readiness_id: string;
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
  delivery_result_gate_status: string;
  delivery_attempt_dependency_status: string;
  provider_response_policy: string;
  provider_message_id_policy: string;
  delivery_attempt_policy: string;
  delivery_result_policy: string;
  idempotency_policy: string;
  audit_correlation_policy: string;
  backpressure_policy: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  expected_delivery_attempt_readiness_status: string;
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
  delivery_result_enabled: number | string | null;
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

type SequenceDeliveryStatusWebhookReadinessRow = {
  id: string;
  sequence_id: string;
  delivery_result_readiness_id: string;
  delivery_attempt_readiness_id: string;
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
  delivery_status_webhook_gate_status: string;
  delivery_result_dependency_status: string;
  provider_response_policy: string;
  provider_message_id_policy: string;
  delivery_attempt_policy: string;
  delivery_result_policy: string;
  delivery_status_webhook_policy: string;
  idempotency_policy: string;
  audit_correlation_policy: string;
  backpressure_policy: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  expected_delivery_result_readiness_status: string;
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
  delivery_status_webhook_enabled: number | string | null;
  delivery_attempts_created: number | string | null;
  delivery_results_created: number | string | null;
  delivery_status_webhooks_processed: number | string | null;
  delivery_status_webhook_payloads_read: number | string | null;
  delivery_status_webhook_payloads_created: number | string | null;
  provider_polling_enabled: number | string | null;
  provider_polling_results_created: number | string | null;
  receipt_payloads_created: number | string | null;
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

export type AudienceSequenceDeliveryStatusWebhookReadinessPublic = {
  id: string;
  sequenceId: string;
  deliveryResultReadinessId: string;
  deliveryAttemptReadinessId: string;
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
  deliveryStatusWebhookGateStatus: string;
  deliveryResultDependencyStatus: string;
  providerResponsePolicy: string;
  providerMessageIdPolicy: string;
  deliveryAttemptPolicy: string;
  deliveryResultPolicy: string;
  deliveryStatusWebhookPolicy: string;
  idempotencyPolicy: string;
  auditCorrelationPolicy: string;
  backpressurePolicy: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
  expectedDeliveryResultReadinessStatus: string;
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
  deliveryStatusWebhookEnabled: false;
  deliveryAttemptsCreated: false;
  deliveryResultsCreated: false;
  deliveryStatusWebhooksProcessed: false;
  deliveryStatusWebhookPayloadsRead: false;
  deliveryStatusWebhookPayloadsCreated: false;
  providerPollingEnabled: false;
  providerPollingResultsCreated: false;
  receiptPayloadsCreated: false;
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

export type AudienceSequenceDeliveryStatusWebhookReadinessSummary = {
  id: "audience-sequence-delivery-status-webhook-readiness-contract";
  status: typeof audienceSequenceDeliveryStatusWebhookReadinessStatus;
  issue: typeof audienceSequenceDeliveryStatusWebhookReadinessIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceDeliveryStatusWebhookReadinessApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceDeliveryStatusWebhookReadinessConfirmationText;
  };
  dependency: {
    deliveryResultReadinessStatus: typeof audienceSequenceDeliveryResultReadinessStatus;
    deliveryResultReadinessIssue: 374;
    deliveryResultReadinessRequired: true;
  };
  counts: {
    deliveryStatusWebhookReadinessRecords: number;
    dryRunDeliveryStatusWebhookContracts: number;
    dryRunMessagesSnapshotted: number;
    heldEnrollmentsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    deliveryStatusWebhookEnabledRecords: number;
    deliveryAttemptsCreatedRecords: number;
    deliveryResultsCreatedRecords: number;
    deliveryStatusWebhooksProcessedRecords: number;
    deliveryStatusWebhookPayloadsReadRecords: number;
    deliveryStatusWebhookPayloadsCreatedRecords: number;
    providerPollingEnabledRecords: number;
    providerPollingResultsCreatedRecords: number;
    receiptPayloadsCreatedRecords: number;
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
  latestRecords: AudienceSequenceDeliveryStatusWebhookReadinessPublic[];
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
    deliveryResultBodiesIncluded: false;
    deliveryStatusWebhookPayloadsIncluded: false;
    providerPollingPayloadsIncluded: false;
    receiptPayloadsIncluded: false;
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
    deliveryStatusWebhookEnabled: false;
    deliveryAttemptsCreated: false;
    deliveryResultsCreated: false;
    deliveryStatusWebhooksProcessed: false;
    deliveryReceiptsCreated: false;
    cloudflareQueueConsumersEnabled: false;
    cloudflareQueueMessagesConsumed: false;
    cloudflareQueueMessagesAcked: false;
    providerPollingEnabled: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateSequenceDeliveryStatusWebhookReadinessInput = {
  deliveryResultReadinessId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceDeliveryStatusWebhookReadinessResult =
  | {
      ok: true;
      status: "sequence_delivery_status_webhook_readiness_recorded" | "sequence_delivery_status_webhook_readiness_replayed";
      duplicate: boolean;
      record: AudienceSequenceDeliveryStatusWebhookReadinessPublic;
      redaction: AudienceSequenceDeliveryStatusWebhookReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "delivery_result_readiness_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "stale_delivery_result_readiness_status"
        | "stale_delivery_result_readiness_evidence"
        | "delivery_status_webhook_gate_not_ready"
        | "delivery_status_webhook_readiness_not_created";
      message: string;
      redaction: AudienceSequenceDeliveryStatusWebhookReadinessSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
      currentDeliveryResultReadinessStatus?: string | null;
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

function deliveryResultHasNoLiveArtifacts(row: SequenceDeliveryResultReadinessReferenceRow) {
  return (
    row.provider_mode === "dry_run_contract_only_no_delivery_result" &&
    numberValue(row.delivery_result_enabled) === 0 &&
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

function publicSequenceDeliveryStatusWebhookReadiness(
  row: SequenceDeliveryStatusWebhookReadinessRow,
  duplicate: boolean,
): AudienceSequenceDeliveryStatusWebhookReadinessPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    deliveryResultReadinessId: row.delivery_result_readiness_id,
    deliveryAttemptReadinessId: row.delivery_attempt_readiness_id,
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
    deliveryStatusWebhookGateStatus: row.delivery_status_webhook_gate_status,
    deliveryResultDependencyStatus: row.delivery_result_dependency_status,
    providerResponsePolicy: row.provider_response_policy,
    providerMessageIdPolicy: row.provider_message_id_policy,
    deliveryAttemptPolicy: row.delivery_attempt_policy,
    deliveryResultPolicy: row.delivery_result_policy,
    deliveryStatusWebhookPolicy: row.delivery_status_webhook_policy,
    idempotencyPolicy: row.idempotency_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    backpressurePolicy: row.backpressure_policy,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
    expectedDeliveryResultReadinessStatus: row.expected_delivery_result_readiness_status,
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
    deliveryStatusWebhookEnabled: false,
    deliveryAttemptsCreated: false,
    deliveryResultsCreated: false,
    deliveryStatusWebhooksProcessed: false,
    deliveryStatusWebhookPayloadsRead: false,
    deliveryStatusWebhookPayloadsCreated: false,
    providerPollingEnabled: false,
    providerPollingResultsCreated: false,
    receiptPayloadsCreated: false,
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
  source: AudienceSequenceDeliveryStatusWebhookReadinessSummary["source"],
  loadError: string | null,
): AudienceSequenceDeliveryStatusWebhookReadinessSummary {
  return {
    id: "audience-sequence-delivery-status-webhook-readiness-contract",
    status: audienceSequenceDeliveryStatusWebhookReadinessStatus,
    issue: audienceSequenceDeliveryStatusWebhookReadinessIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceDeliveryStatusWebhookReadinessApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceDeliveryStatusWebhookReadinessConfirmationText,
    },
    dependency: {
      deliveryResultReadinessStatus: audienceSequenceDeliveryResultReadinessStatus,
      deliveryResultReadinessIssue: 374,
      deliveryResultReadinessRequired: true,
    },
    counts: {
      deliveryStatusWebhookReadinessRecords: 0,
      dryRunDeliveryStatusWebhookContracts: 0,
      dryRunMessagesSnapshotted: 0,
      heldEnrollmentsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      deliveryStatusWebhookEnabledRecords: 0,
      deliveryAttemptsCreatedRecords: 0,
      deliveryResultsCreatedRecords: 0,
      deliveryStatusWebhooksProcessedRecords: 0,
      deliveryStatusWebhookPayloadsReadRecords: 0,
      deliveryStatusWebhookPayloadsCreatedRecords: 0,
      providerPollingEnabledRecords: 0,
      providerPollingResultsCreatedRecords: 0,
      receiptPayloadsCreatedRecords: 0,
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
      deliveryResultBodiesIncluded: false,
      deliveryStatusWebhookPayloadsIncluded: false,
      providerPollingPayloadsIncluded: false,
      receiptPayloadsIncluded: false,
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
      deliveryStatusWebhookEnabled: false,
      deliveryAttemptsCreated: false,
      deliveryResultsCreated: false,
      deliveryStatusWebhooksProcessed: false,
      deliveryReceiptsCreated: false,
      cloudflareQueueConsumersEnabled: false,
      cloudflareQueueMessagesConsumed: false,
      cloudflareQueueMessagesAcked: false,
      providerPollingEnabled: false,
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
      "deliveryResultBody",
      "deliveryStatusWebhookPayload",
      "providerPollingPayload",
      "receiptPayload",
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
      "Issue #376 lets verified owners record sequence delivery-status webhook readiness gates from a current sequence delivery-result readiness record after exact confirmation, idempotency, workspace revision, sequence status, readiness, delivery-result readiness status, webhook, polling, receipt, backpressure, and audit checks. It does not call providers, send messages, create provider responses, create provider message IDs, create delivery attempts or results, process webhooks, read or create webhook payloads, poll providers, create polling results, create receipt payloads, create receipts, enable Cloudflare Queue consumers, consume or ack Queue messages, create retry or dead-letter rows, read or create Queue payload bodies, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

function deliveryStatusWebhookSelect() {
  return `SELECT
    id, sequence_id, delivery_result_readiness_id, delivery_attempt_readiness_id, provider_call_readiness_id,
    queue_consumer_readiness_id, queue_producer_readiness_id,
    dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
    schedule_intent_id, status, queue_name, provider_name, provider_mode,
    delivery_status_webhook_gate_status, delivery_result_dependency_status, provider_response_policy,
    provider_message_id_policy, delivery_attempt_policy, delivery_result_policy, delivery_status_webhook_policy,
    idempotency_policy, audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
    expected_sequence_status, expected_ready_enrollment_count,
    expected_delivery_result_readiness_status, dry_run_message_count, held_enrollment_count,
    active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
    dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
    sender_domain_gate_status, delivery_status_webhook_enabled, delivery_attempts_created,
    delivery_results_created, delivery_status_webhooks_processed, delivery_status_webhook_payloads_read,
    delivery_status_webhook_payloads_created, provider_polling_enabled, provider_polling_results_created,
    receipt_payloads_created, delivery_receipts_created, cloudflare_queue_consumer_enabled,
    cloudflare_queue_messages_consumed, cloudflare_queue_messages_acked, queue_retry_records_created,
    queue_dead_letter_records_created, queue_payload_bodies_read, queue_payload_bodies_created,
    recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
    provider_send_enabled, provider_responses_created, provider_message_ids_created, idempotency_key, created_at
  FROM audience_sequence_delivery_status_webhook_readiness`;
}

function deliveryResultReadinessSelect() {
  return `SELECT
    id, sequence_id, delivery_attempt_readiness_id, provider_call_readiness_id,
    queue_consumer_readiness_id, queue_producer_readiness_id,
    dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
    schedule_intent_id, status, queue_name, provider_name, provider_mode,
    delivery_result_gate_status, delivery_attempt_dependency_status, provider_response_policy,
    provider_message_id_policy, delivery_attempt_policy, delivery_result_policy, idempotency_policy,
    audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
    expected_sequence_status, expected_ready_enrollment_count,
    expected_delivery_attempt_readiness_status, dry_run_message_count, held_enrollment_count,
    active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
    dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
    sender_domain_gate_status, delivery_result_enabled, delivery_attempts_created,
    delivery_results_created, delivery_status_webhooks_processed, delivery_receipts_created,
    cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed,
    cloudflare_queue_messages_acked, queue_retry_records_created, queue_dead_letter_records_created,
    queue_payload_bodies_read, queue_payload_bodies_created, recipient_payloads_created,
    personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
    provider_responses_created, provider_message_ids_created, created_at
  FROM audience_sequence_delivery_result_readiness`;
}

async function findDeliveryResultReadinessById(db: D1Database, id: string) {
  return db
    .prepare(`${deliveryResultReadinessSelect()} WHERE id = ?`)
    .bind(id)
    .first<SequenceDeliveryResultReadinessReferenceRow>();
}

async function findLatestDeliveryResultReadinessForSequence(db: D1Database, sequenceId: string) {
  return db
    .prepare(`${deliveryResultReadinessSelect()} WHERE sequence_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`)
    .bind(sequenceId)
    .first<SequenceDeliveryResultReadinessReferenceRow>();
}

async function findDeliveryStatusWebhookReadinessByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(`${deliveryStatusWebhookSelect()} WHERE idempotency_key = ?`)
    .bind(idempotencyKey)
    .first<SequenceDeliveryStatusWebhookReadinessRow>();
}

export async function getAudienceSequenceDeliveryStatusWebhookReadinessSummary(): Promise<AudienceSequenceDeliveryStatusWebhookReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS delivery_status_webhook_readiness_count,
          SUM(CASE WHEN provider_mode LIKE '%dry_run%' THEN 1 ELSE 0 END) AS dry_run_delivery_status_webhook_contract_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN delivery_status_webhook_enabled > 0 THEN 1 ELSE 0 END) AS delivery_status_webhook_enabled_count,
          SUM(CASE WHEN delivery_attempts_created > 0 THEN 1 ELSE 0 END) AS delivery_attempts_created_count,
          SUM(CASE WHEN delivery_results_created > 0 THEN 1 ELSE 0 END) AS delivery_results_created_count,
          SUM(CASE WHEN delivery_status_webhooks_processed > 0 THEN 1 ELSE 0 END) AS delivery_status_webhooks_processed_count,
          SUM(CASE WHEN delivery_status_webhook_payloads_read > 0 THEN 1 ELSE 0 END) AS delivery_status_webhook_payloads_read_count,
          SUM(CASE WHEN delivery_status_webhook_payloads_created > 0 THEN 1 ELSE 0 END) AS delivery_status_webhook_payloads_created_count,
          SUM(CASE WHEN provider_polling_enabled > 0 THEN 1 ELSE 0 END) AS provider_polling_enabled_count,
          SUM(CASE WHEN provider_polling_results_created > 0 THEN 1 ELSE 0 END) AS provider_polling_results_created_count,
          SUM(CASE WHEN receipt_payloads_created > 0 THEN 1 ELSE 0 END) AS receipt_payloads_created_count,
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
        FROM audience_sequence_delivery_status_webhook_readiness`,
      )
      .first<{
        delivery_status_webhook_readiness_count: number | string | null;
        dry_run_delivery_status_webhook_contract_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_enrollment_count: number | string | null;
        active_suppression_count: number | string | null;
        delivery_status_webhook_enabled_count: number | string | null;
        delivery_attempts_created_count: number | string | null;
        delivery_results_created_count: number | string | null;
        delivery_status_webhooks_processed_count: number | string | null;
        delivery_status_webhook_payloads_read_count: number | string | null;
        delivery_status_webhook_payloads_created_count: number | string | null;
        provider_polling_enabled_count: number | string | null;
        provider_polling_results_created_count: number | string | null;
        receipt_payloads_created_count: number | string | null;
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
      .prepare(`${deliveryStatusWebhookSelect()} ORDER BY created_at DESC LIMIT 10`)
      .all<SequenceDeliveryStatusWebhookReadinessRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        deliveryStatusWebhookReadinessRecords: numberValue(counts?.delivery_status_webhook_readiness_count),
        dryRunDeliveryStatusWebhookContracts: numberValue(counts?.dry_run_delivery_status_webhook_contract_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        deliveryStatusWebhookEnabledRecords: numberValue(counts?.delivery_status_webhook_enabled_count),
        deliveryAttemptsCreatedRecords: numberValue(counts?.delivery_attempts_created_count),
        deliveryResultsCreatedRecords: numberValue(counts?.delivery_results_created_count),
        deliveryStatusWebhooksProcessedRecords: numberValue(counts?.delivery_status_webhooks_processed_count),
        deliveryStatusWebhookPayloadsReadRecords: numberValue(counts?.delivery_status_webhook_payloads_read_count),
        deliveryStatusWebhookPayloadsCreatedRecords: numberValue(counts?.delivery_status_webhook_payloads_created_count),
        providerPollingEnabledRecords: numberValue(counts?.provider_polling_enabled_count),
        providerPollingResultsCreatedRecords: numberValue(counts?.provider_polling_results_created_count),
        receiptPayloadsCreatedRecords: numberValue(counts?.receipt_payloads_created_count),
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
      latestRecords: (latest.results ?? []).map((row) => publicSequenceDeliveryStatusWebhookReadiness(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence delivery-status webhook readiness.",
    );
  }
}

export async function createAudienceSequenceDeliveryStatusWebhookReadiness(
  input: CreateSequenceDeliveryStatusWebhookReadinessInput,
): Promise<CreateSequenceDeliveryStatusWebhookReadinessResult> {
  const redaction = emptySummary("d1", null).redaction;
  const deliveryResultReadinessId = parseString(input.deliveryResultReadinessId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !deliveryResultReadinessId ||
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
        "A delivery-result readiness ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceDeliveryStatusWebhookReadinessConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording sequence delivery-status webhook readiness.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDeliveryStatusWebhookReadinessByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_delivery_status_webhook_readiness_replayed",
      duplicate: true,
      record: publicSequenceDeliveryStatusWebhookReadiness(existing, true),
      redaction,
    };
  }

  const deliveryResult = await findDeliveryResultReadinessById(db, deliveryResultReadinessId);
  if (!deliveryResult) {
    return {
      ok: false,
      status: "delivery_result_readiness_not_found",
      message: "A current sequence delivery-result readiness record is required before delivery-status webhook readiness can be recorded.",
      redaction,
    };
  }

  if (deliveryResult.sequence_id !== sequenceId) {
    return {
      ok: false,
      status: "stale_delivery_result_readiness_evidence",
      message: "The sequence no longer matches the selected delivery-result readiness record.",
      redaction,
    };
  }

  if (deliveryResult.status !== sequenceDeliveryResultReadinessRecordStatus) {
    return {
      ok: false,
      status: "stale_delivery_result_readiness_status",
      message: "The sequence delivery-result readiness status changed before delivery-status webhook readiness was recorded.",
      redaction,
      currentDeliveryResultReadinessStatus: deliveryResult.status,
    };
  }

  const latestDeliveryResult = await findLatestDeliveryResultReadinessForSequence(db, sequenceId);
  if (!latestDeliveryResult || latestDeliveryResult.id !== deliveryResult.id) {
    return {
      ok: false,
      status: "stale_delivery_result_readiness_evidence",
      message: "A newer sequence delivery-result readiness record exists for this sequence.",
      redaction,
    };
  }

  if (!deliveryResultHasNoLiveArtifacts(deliveryResult)) {
    return {
      ok: false,
      status: "delivery_status_webhook_gate_not_ready",
      message:
        "Sequence delivery-status webhook readiness requires a current dry-run delivery-result readiness record with no provider calls, Queue consumption, acknowledgements, retry/dead-letter rows, payload reads, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, provider message IDs, delivery attempts, delivery results, webhooks, polling, or receipts.",
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
    deliveryResult.expected_workspace_revision_id !== expectedWorkspaceRevisionId
  ) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before sequence delivery-status webhook readiness was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus || deliveryResult.expected_sequence_status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before sequence delivery-status webhook readiness was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (
    readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount ||
    numberValue(deliveryResult.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before delivery-status webhook readiness was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const recordId = `sequence-delivery-status-webhook-readiness-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_sequence_delivery_status_webhook_readiness (
        id, sequence_id, delivery_result_readiness_id, delivery_attempt_readiness_id,
        provider_call_readiness_id, queue_consumer_readiness_id, queue_producer_readiness_id,
        dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
        schedule_intent_id, status, queue_name, provider_name, provider_mode,
        delivery_status_webhook_gate_status, delivery_result_dependency_status, provider_response_policy,
        provider_message_id_policy, delivery_attempt_policy, delivery_result_policy, delivery_status_webhook_policy,
        idempotency_policy, audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
        expected_sequence_status, expected_ready_enrollment_count,
        expected_delivery_result_readiness_status, dry_run_message_count, held_enrollment_count,
        active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
        dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status,
        sender_domain_gate_status, delivery_status_webhook_enabled, delivery_attempts_created,
        delivery_results_created, delivery_status_webhooks_processed, delivery_status_webhook_payloads_read,
        delivery_status_webhook_payloads_created, provider_polling_enabled, provider_polling_results_created,
        receipt_payloads_created, delivery_receipts_created, cloudflare_queue_consumer_enabled,
        cloudflare_queue_messages_consumed, cloudflare_queue_messages_acked,
        queue_retry_records_created, queue_dead_letter_records_created, queue_payload_bodies_read,
        queue_payload_bodies_created, recipient_payloads_created, personalized_bodies_created,
        unsubscribe_urls_created, provider_send_enabled, provider_responses_created, provider_message_ids_created,
        idempotency_key, actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      deliveryResult.sequence_id,
      deliveryResult.id,
      deliveryResult.delivery_attempt_readiness_id,
      deliveryResult.provider_call_readiness_id,
      deliveryResult.queue_consumer_readiness_id,
      deliveryResult.queue_producer_readiness_id,
      deliveryResult.dispatch_attempt_id,
      deliveryResult.dispatch_preflight_id,
      deliveryResult.delivery_queue_message_id,
      deliveryResult.delivery_batch_id,
      deliveryResult.schedule_intent_id,
      "sequence_delivery_status_webhook_readiness_recorded",
      deliveryResult.queue_name,
      deliveryResult.provider_name,
      "dry_run_contract_only_no_delivery_status_webhook",
      "blocked_until_status_webhook_polling_receipt_and_reconciliation_contracts_verified",
      "blocked_until_sequence_delivery_result_readiness_issue_374_stays_current",
      deliveryResult.provider_response_policy,
      deliveryResult.provider_message_id_policy,
      deliveryResult.delivery_attempt_policy,
      deliveryResult.delivery_result_policy,
      "Delivery-status webhooks stay disabled until provider event normalization, webhook signature, receipt payload, delivery receipt, provider polling, retry, suppression, redaction, and audit contracts exist together.",
      "Future delivery-status webhook writes must key idempotency by sequence, delivery-result readiness, dispatch attempt, Queue message, provider, event class, provider message ID policy, and receipt scope before any webhook is processed.",
      "Future status webhook writes must carry redacted audit correlation from schedule intent through delivery batch, queue-message evidence, dispatch preflight, dispatch attempt, Queue readiness, provider-call readiness, delivery-attempt readiness, delivery-result readiness, and delivery-status webhook readiness.",
      "Delivery-status webhook backpressure must fail closed when webhook validation, provider polling, retry/dead-letter capacity, receipt capacity, or suppression capacity are not explicit.",
      readiness.workspace.revisionId,
      sequence.status,
      expectedReadyEnrollmentCount,
      audienceSequenceDeliveryResultReadinessStatus,
      numberValue(deliveryResult.dry_run_message_count),
      numberValue(deliveryResult.held_enrollment_count),
      numberValue(deliveryResult.active_suppression_count),
      deliveryResult.provider_limit_policy,
      deliveryResult.provider_rate_limit_window,
      deliveryResult.dispatch_mode,
      deliveryResult.dispatch_result_status,
      deliveryResult.suppression_check_status,
      deliveryResult.unsubscribe_footer_check_status,
      deliveryResult.sender_domain_gate_status,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceDeliveryStatusWebhookReadinessIssue,
        deliveryResultReadinessId: deliveryResult.id,
        deliveryAttemptReadinessId: deliveryResult.delivery_attempt_readiness_id,
        providerCallReadinessId: deliveryResult.provider_call_readiness_id,
        queueConsumerReadinessId: deliveryResult.queue_consumer_readiness_id,
        queueProducerReadinessId: deliveryResult.queue_producer_readiness_id,
        dispatchAttemptId: deliveryResult.dispatch_attempt_id,
        dispatchPreflightId: deliveryResult.dispatch_preflight_id,
        deliveryQueueMessageId: deliveryResult.delivery_queue_message_id,
        deliveryBatchId: deliveryResult.delivery_batch_id,
        scheduleIntentId: deliveryResult.schedule_intent_id,
        deliveryStatusWebhookEnabled: false,
        deliveryAttemptsCreated: false,
        deliveryResultsCreated: false,
        deliveryStatusWebhooksProcessed: false,
        deliveryStatusWebhookPayloadsRead: false,
        deliveryStatusWebhookPayloadsCreated: false,
        providerPollingEnabled: false,
        providerPollingResultsCreated: false,
        receiptPayloadsCreated: false,
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

  const record = await findDeliveryStatusWebhookReadinessByIdempotency(db, idempotencyKey);
  if (!record) {
    return {
      ok: false,
      status: "delivery_status_webhook_readiness_not_created",
      message: "The sequence delivery-status webhook readiness record could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_delivery_status_webhook_readiness_recorded",
    duplicate: false,
    record: publicSequenceDeliveryStatusWebhookReadiness(record, false),
    redaction,
  };
}
