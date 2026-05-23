import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { audienceSequenceProviderPollingReadinessStatus } from "@/lib/audience-sequence-provider-polling-readiness";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceReceiptPayloadReadinessIssue = 380;
export const audienceSequenceReceiptPayloadReadinessStatus = "sequence-receipt-payload-readiness-ready";
export const audienceSequenceReceiptPayloadReadinessApiRoute =
  "/api/admin/audience/sequences/receipt-payload-readiness";
export const audienceSequenceReceiptPayloadReadinessConfirmationText =
  "Record Bumpgrade sequence receipt-payload readiness gate";

const providerPollingRecordStatus = "sequence_provider_polling_readiness_recorded";
const receiptPayloadRecordStatus = "sequence_receipt_payload_readiness_recorded";

type AudienceRuntime = {
  db: D1Database;
};

type ProviderPollingReadinessReferenceRow = {
  id: string;
  sequence_id: string;
  delivery_status_webhook_readiness_id: string;
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
  provider_polling_gate_status: string;
  delivery_status_webhook_dependency_status: string;
  provider_response_policy: string;
  provider_message_id_policy: string;
  delivery_attempt_policy: string;
  delivery_result_policy: string;
  delivery_status_webhook_policy: string;
  provider_polling_policy: string;
  idempotency_policy: string;
  audit_correlation_policy: string;
  backpressure_policy: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  expected_delivery_status_webhook_readiness_status: string;
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
  provider_polling_payloads_read: number | string | null;
  provider_polling_payloads_created: number | string | null;
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
  created_at: number | string | null;
};

type ReceiptPayloadReadinessRow = ProviderPollingReadinessReferenceRow & {
  provider_polling_readiness_id: string;
  receipt_payload_gate_status: string;
  provider_polling_dependency_status: string;
  receipt_payload_policy: string;
  expected_provider_polling_readiness_status: string;
  receipt_payload_enabled: number | string | null;
  idempotency_key: string;
};

export type AudienceSequenceReceiptPayloadReadinessPublic = {
  id: string;
  sequenceId: string;
  providerPollingReadinessId: string;
  deliveryStatusWebhookReadinessId: string;
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
  receiptPayloadGateStatus: string;
  providerPollingDependencyStatus: string;
  providerPollingPolicy: string;
  receiptPayloadPolicy: string;
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
  expectedProviderPollingReadinessStatus: string;
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
  providerPollingPayloadsRead: false;
  providerPollingPayloadsCreated: false;
  providerPollingResultsCreated: false;
  receiptPayloadEnabled: false;
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

export type AudienceSequenceReceiptPayloadReadinessSummary = {
  id: "audience-sequence-receipt-payload-readiness-contract";
  status: typeof audienceSequenceReceiptPayloadReadinessStatus;
  issue: typeof audienceSequenceReceiptPayloadReadinessIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceReceiptPayloadReadinessApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: { required: true; text: typeof audienceSequenceReceiptPayloadReadinessConfirmationText };
  dependency: {
    providerPollingReadinessStatus: typeof audienceSequenceProviderPollingReadinessStatus;
    providerPollingReadinessIssue: 378;
    providerPollingReadinessRequired: true;
  };
  counts: {
    receiptPayloadReadinessRecords: number;
    dryRunReceiptPayloadContracts: number;
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
    providerPollingPayloadsReadRecords: number;
    providerPollingPayloadsCreatedRecords: number;
    providerPollingResultsCreatedRecords: number;
    receiptPayloadEnabledRecords: number;
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
  latestRecords: AudienceSequenceReceiptPayloadReadinessPublic[];
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
    receiptPayloadEnabled: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateReceiptPayloadReadinessInput = {
  providerPollingReadinessId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateReceiptPayloadReadinessResult =
  | {
      ok: true;
      status: "sequence_receipt_payload_readiness_recorded" | "sequence_receipt_payload_readiness_replayed";
      duplicate: boolean;
      record: AudienceSequenceReceiptPayloadReadinessPublic;
      redaction: AudienceSequenceReceiptPayloadReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "provider_polling_readiness_not_found"
        | "stale_provider_polling_readiness_status"
        | "stale_provider_polling_readiness_evidence"
        | "receipt_payload_gate_not_ready"
        | "readiness_unavailable"
        | "sequence_not_found"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "receipt_payload_readiness_not_created";
      message: string;
      redaction: AudienceSequenceReceiptPayloadReadinessSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
      currentProviderPollingReadinessStatus?: string | null;
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
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isoFromSeconds(value: number | string | null | undefined) {
  const seconds = numberValue(value);
  return seconds > 0 ? new Date(seconds * 1000).toISOString() : null;
}

function parseString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= 0) return parsed;
  }
  return null;
}

function providerPollingHasNoLiveArtifacts(row: ProviderPollingReadinessReferenceRow) {
  return (
    row.provider_mode === "dry_run_contract_only_no_provider_polling" &&
    numberValue(row.delivery_status_webhook_enabled) === 0 &&
    numberValue(row.delivery_attempts_created) === 0 &&
    numberValue(row.delivery_results_created) === 0 &&
    numberValue(row.delivery_status_webhooks_processed) === 0 &&
    numberValue(row.delivery_status_webhook_payloads_read) === 0 &&
    numberValue(row.delivery_status_webhook_payloads_created) === 0 &&
    numberValue(row.provider_polling_enabled) === 0 &&
    numberValue(row.provider_polling_payloads_read) === 0 &&
    numberValue(row.provider_polling_payloads_created) === 0 &&
    numberValue(row.provider_polling_results_created) === 0 &&
    numberValue(row.receipt_payloads_created) === 0 &&
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

function publicReceiptPayloadReadiness(
  row: ReceiptPayloadReadinessRow,
  duplicate: boolean,
): AudienceSequenceReceiptPayloadReadinessPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    providerPollingReadinessId: row.provider_polling_readiness_id,
    deliveryStatusWebhookReadinessId: row.delivery_status_webhook_readiness_id,
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
    receiptPayloadGateStatus: row.receipt_payload_gate_status,
    providerPollingDependencyStatus: row.provider_polling_dependency_status,
    providerPollingPolicy: row.provider_polling_policy,
    receiptPayloadPolicy: row.receipt_payload_policy,
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
    expectedProviderPollingReadinessStatus: row.expected_provider_polling_readiness_status,
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
    providerPollingPayloadsRead: false,
    providerPollingPayloadsCreated: false,
    providerPollingResultsCreated: false,
    receiptPayloadEnabled: false,
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
    createdAt: isoFromSeconds(row.created_at),
  };
}

function emptySummary(
  source: "d1" | "unavailable",
  loadError: string | null,
): AudienceSequenceReceiptPayloadReadinessSummary {
  return {
    id: "audience-sequence-receipt-payload-readiness-contract",
    status: audienceSequenceReceiptPayloadReadinessStatus,
    issue: audienceSequenceReceiptPayloadReadinessIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceReceiptPayloadReadinessApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: { required: true, text: audienceSequenceReceiptPayloadReadinessConfirmationText },
    dependency: {
      providerPollingReadinessStatus: audienceSequenceProviderPollingReadinessStatus,
      providerPollingReadinessIssue: 378,
      providerPollingReadinessRequired: true,
    },
    counts: {
      receiptPayloadReadinessRecords: 0,
      dryRunReceiptPayloadContracts: 0,
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
      providerPollingPayloadsReadRecords: 0,
      providerPollingPayloadsCreatedRecords: 0,
      providerPollingResultsCreatedRecords: 0,
      receiptPayloadEnabledRecords: 0,
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
      receiptPayloadEnabled: false,
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
      "Issue #380 lets verified owners record sequence receipt-payload readiness gates from a current sequence provider-polling readiness record after exact confirmation, idempotency, workspace revision, sequence status, readiness, provider-polling readiness status, receipt-payload, delivery-receipt, backpressure, and audit checks. It does not call providers, send messages, create provider responses, create provider message IDs, create delivery attempts or results, process status webhooks, read or create webhook payloads, poll providers, read or create provider polling payloads, create polling results, create receipt payloads, create receipts, enable Cloudflare Queue consumers, consume or ack Queue messages, create retry or dead-letter rows, read or create Queue payload bodies, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

function providerPollingSelect() {
  return `SELECT
    id, sequence_id, delivery_status_webhook_readiness_id, delivery_result_readiness_id, delivery_attempt_readiness_id,
    provider_call_readiness_id, queue_consumer_readiness_id, queue_producer_readiness_id,
    dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
    schedule_intent_id, status, queue_name, provider_name, provider_mode, provider_polling_gate_status,
    delivery_status_webhook_dependency_status, provider_response_policy, provider_message_id_policy,
    delivery_attempt_policy, delivery_result_policy, delivery_status_webhook_policy, provider_polling_policy,
    idempotency_policy, audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
    expected_sequence_status, expected_ready_enrollment_count, expected_delivery_status_webhook_readiness_status,
    dry_run_message_count, held_enrollment_count, active_suppression_count, provider_limit_policy,
    provider_rate_limit_window, dispatch_mode, dispatch_result_status, suppression_check_status,
    unsubscribe_footer_check_status, sender_domain_gate_status, delivery_status_webhook_enabled,
    delivery_attempts_created, delivery_results_created, delivery_status_webhooks_processed,
    delivery_status_webhook_payloads_read, delivery_status_webhook_payloads_created, provider_polling_enabled,
    provider_polling_payloads_read, provider_polling_payloads_created, provider_polling_results_created,
    receipt_payloads_created, delivery_receipts_created, cloudflare_queue_consumer_enabled,
    cloudflare_queue_messages_consumed, cloudflare_queue_messages_acked, queue_retry_records_created,
    queue_dead_letter_records_created, queue_payload_bodies_read, queue_payload_bodies_created,
    recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
    provider_responses_created, provider_message_ids_created, created_at
  FROM audience_sequence_provider_polling_readiness`;
}

function receiptPayloadSelect() {
  return `SELECT
    id, sequence_id, provider_polling_readiness_id, delivery_status_webhook_readiness_id,
    delivery_result_readiness_id, delivery_attempt_readiness_id, provider_call_readiness_id,
    queue_consumer_readiness_id, queue_producer_readiness_id, dispatch_attempt_id, dispatch_preflight_id,
    delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status, queue_name, provider_name,
    provider_mode, receipt_payload_gate_status, provider_polling_dependency_status, provider_response_policy,
    provider_message_id_policy, delivery_attempt_policy, delivery_result_policy, delivery_status_webhook_policy,
    provider_polling_policy, receipt_payload_policy, idempotency_policy, audit_correlation_policy,
    backpressure_policy, expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
    expected_provider_polling_readiness_status, dry_run_message_count, held_enrollment_count,
    active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
    dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
    delivery_status_webhook_enabled, delivery_attempts_created, delivery_results_created,
    delivery_status_webhooks_processed, delivery_status_webhook_payloads_read, delivery_status_webhook_payloads_created,
    provider_polling_enabled, provider_polling_payloads_read, provider_polling_payloads_created,
    provider_polling_results_created, receipt_payload_enabled, receipt_payloads_created, delivery_receipts_created,
    cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed, cloudflare_queue_messages_acked,
    queue_retry_records_created, queue_dead_letter_records_created, queue_payload_bodies_read,
    queue_payload_bodies_created, recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
    provider_send_enabled, provider_responses_created, provider_message_ids_created, idempotency_key, created_at
  FROM audience_sequence_receipt_payload_readiness`;
}

async function findProviderPollingReadinessById(db: D1Database, id: string) {
  return db.prepare(`${providerPollingSelect()} WHERE id = ?`).bind(id).first<ProviderPollingReadinessReferenceRow>();
}

async function findLatestProviderPollingReadinessForSequence(db: D1Database, sequenceId: string) {
  return db
    .prepare(`${providerPollingSelect()} WHERE sequence_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`)
    .bind(sequenceId)
    .first<ProviderPollingReadinessReferenceRow>();
}

async function findReceiptPayloadReadinessByIdempotency(db: D1Database, idempotencyKey: string) {
  return db.prepare(`${receiptPayloadSelect()} WHERE idempotency_key = ?`).bind(idempotencyKey).first<ReceiptPayloadReadinessRow>();
}

export async function getAudienceSequenceReceiptPayloadReadinessSummary(): Promise<AudienceSequenceReceiptPayloadReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS receipt_payload_readiness_count,
          SUM(CASE WHEN provider_mode LIKE '%dry_run%' THEN 1 ELSE 0 END) AS dry_run_receipt_payload_contract_count,
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
          SUM(CASE WHEN provider_polling_payloads_read > 0 THEN 1 ELSE 0 END) AS provider_polling_payloads_read_count,
          SUM(CASE WHEN provider_polling_payloads_created > 0 THEN 1 ELSE 0 END) AS provider_polling_payloads_created_count,
          SUM(CASE WHEN provider_polling_results_created > 0 THEN 1 ELSE 0 END) AS provider_polling_results_created_count,
          SUM(CASE WHEN receipt_payload_enabled > 0 THEN 1 ELSE 0 END) AS receipt_payload_enabled_count,
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
        FROM audience_sequence_receipt_payload_readiness`,
      )
      .first<Record<string, number | string | null>>();
    const latest = await db.prepare(`${receiptPayloadSelect()} ORDER BY created_at DESC LIMIT 10`).all<ReceiptPayloadReadinessRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        receiptPayloadReadinessRecords: numberValue(counts?.receipt_payload_readiness_count),
        dryRunReceiptPayloadContracts: numberValue(counts?.dry_run_receipt_payload_contract_count),
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
        providerPollingPayloadsReadRecords: numberValue(counts?.provider_polling_payloads_read_count),
        providerPollingPayloadsCreatedRecords: numberValue(counts?.provider_polling_payloads_created_count),
        providerPollingResultsCreatedRecords: numberValue(counts?.provider_polling_results_created_count),
        receiptPayloadEnabledRecords: numberValue(counts?.receipt_payload_enabled_count),
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
      latestRecords: (latest.results ?? []).map((row) => publicReceiptPayloadReadiness(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence receipt-payload readiness.",
    );
  }
}

export async function createAudienceSequenceReceiptPayloadReadiness(
  input: CreateReceiptPayloadReadinessInput,
): Promise<CreateReceiptPayloadReadinessResult> {
  const redaction = emptySummary("d1", null).redaction;
  const providerPollingReadinessId = parseString(input.providerPollingReadinessId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!providerPollingReadinessId || !sequenceId || !expectedWorkspaceRevisionId || !expectedSequenceStatus || expectedReadyEnrollmentCount === null || !idempotencyKey) {
    return { ok: false, status: "invalid_request", message: "A provider-polling readiness ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.", redaction };
  }

  if (input.confirmationText !== audienceSequenceReceiptPayloadReadinessConfirmationText) {
    return { ok: false, status: "confirmation_required", message: "Exact confirmation text is required before recording sequence receipt-payload readiness.", redaction };
  }

  const { db } = await getRuntime();
  const existing = await findReceiptPayloadReadinessByIdempotency(db, idempotencyKey);
  if (existing) return { ok: true, status: "sequence_receipt_payload_readiness_replayed", duplicate: true, record: publicReceiptPayloadReadiness(existing, true), redaction };

  const providerPolling = await findProviderPollingReadinessById(db, providerPollingReadinessId);
  if (!providerPolling) {
    return { ok: false, status: "provider_polling_readiness_not_found", message: "A current sequence provider-polling readiness record is required before receipt-payload readiness can be recorded.", redaction };
  }

  if (providerPolling.sequence_id !== sequenceId) {
    return { ok: false, status: "stale_provider_polling_readiness_evidence", message: "The sequence no longer matches the selected provider-polling readiness record.", redaction };
  }

  if (providerPolling.status !== providerPollingRecordStatus) {
    return { ok: false, status: "stale_provider_polling_readiness_status", message: "The sequence provider-polling readiness status changed before receipt-payload readiness was recorded.", redaction, currentProviderPollingReadinessStatus: providerPolling.status };
  }

  const latestProviderPolling = await findLatestProviderPollingReadinessForSequence(db, sequenceId);
  if (!latestProviderPolling || latestProviderPolling.id !== providerPolling.id) {
    return { ok: false, status: "stale_provider_polling_readiness_evidence", message: "A newer sequence provider-polling readiness record exists for this sequence.", redaction };
  }

  if (!providerPollingHasNoLiveArtifacts(providerPolling)) {
    return { ok: false, status: "receipt_payload_gate_not_ready", message: "Sequence receipt-payload readiness requires a current dry-run provider-polling readiness record with no provider calls, Queue consumption, acknowledgements, retry/dead-letter rows, payload reads, webhook payloads, provider polling, polling results, receipt payloads, receipts, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, provider message IDs, delivery attempts, delivery results, or status webhooks.", redaction };
  }

  const readiness = await getAudienceSequenceDeliveryReadinessSummary();
  if (readiness.source !== "d1") return { ok: false, status: "readiness_unavailable", message: readiness.loadError ?? "Sequence delivery readiness is unavailable.", redaction };

  const sequence = readiness.records.find((record) => record.sequenceId === sequenceId);
  if (!sequence) return { ok: false, status: "sequence_not_found", message: "The sequence could not be found.", redaction };

  if (readiness.workspace.revisionId !== expectedWorkspaceRevisionId || providerPolling.expected_workspace_revision_id !== expectedWorkspaceRevisionId) {
    return { ok: false, status: "stale_workspace_revision", message: "The audience workspace changed before sequence receipt-payload readiness was recorded.", redaction, currentWorkspaceRevisionId: readiness.workspace.revisionId };
  }

  if (sequence.status !== expectedSequenceStatus || providerPolling.expected_sequence_status !== expectedSequenceStatus) {
    return { ok: false, status: "stale_sequence_status", message: "The sequence status changed before sequence receipt-payload readiness was recorded.", redaction, currentSequenceStatus: sequence.status };
  }

  if (readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount || numberValue(providerPolling.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount) {
    return { ok: false, status: "stale_readiness_count", message: "Sequence readiness changed before receipt-payload readiness was recorded.", redaction, currentReadyEnrollmentCount: readiness.counts.readyEnrollments };
  }

  const recordId = `sequence-receipt-payload-readiness-${crypto.randomUUID()}`;
  const columns = [
    "id", "sequence_id", "provider_polling_readiness_id", "delivery_status_webhook_readiness_id",
    "delivery_result_readiness_id", "delivery_attempt_readiness_id", "provider_call_readiness_id",
    "queue_consumer_readiness_id", "queue_producer_readiness_id", "dispatch_attempt_id", "dispatch_preflight_id",
    "delivery_queue_message_id", "delivery_batch_id", "schedule_intent_id", "status", "queue_name",
    "provider_name", "provider_mode", "receipt_payload_gate_status", "provider_polling_dependency_status",
    "provider_response_policy", "provider_message_id_policy", "delivery_attempt_policy", "delivery_result_policy",
    "delivery_status_webhook_policy", "provider_polling_policy", "receipt_payload_policy", "idempotency_policy",
    "audit_correlation_policy", "backpressure_policy", "expected_workspace_revision_id", "expected_sequence_status",
    "expected_ready_enrollment_count", "expected_provider_polling_readiness_status", "dry_run_message_count",
    "held_enrollment_count", "active_suppression_count", "provider_limit_policy", "provider_rate_limit_window",
    "dispatch_mode", "dispatch_result_status", "suppression_check_status", "unsubscribe_footer_check_status",
    "sender_domain_gate_status", "delivery_status_webhook_enabled", "delivery_attempts_created",
    "delivery_results_created", "delivery_status_webhooks_processed", "delivery_status_webhook_payloads_read",
    "delivery_status_webhook_payloads_created", "provider_polling_enabled", "provider_polling_payloads_read",
    "provider_polling_payloads_created", "provider_polling_results_created", "receipt_payload_enabled",
    "receipt_payloads_created", "delivery_receipts_created", "cloudflare_queue_consumer_enabled",
    "cloudflare_queue_messages_consumed", "cloudflare_queue_messages_acked", "queue_retry_records_created",
    "queue_dead_letter_records_created", "queue_payload_bodies_read", "queue_payload_bodies_created",
    "recipient_payloads_created", "personalized_bodies_created", "unsubscribe_urls_created", "provider_send_enabled",
    "provider_responses_created", "provider_message_ids_created", "idempotency_key", "actor_user_id",
    "actor_email", "metadata_json",
  ];
  const values = [
    recordId,
    providerPolling.sequence_id,
    providerPolling.id,
    providerPolling.delivery_status_webhook_readiness_id,
    providerPolling.delivery_result_readiness_id,
    providerPolling.delivery_attempt_readiness_id,
    providerPolling.provider_call_readiness_id,
    providerPolling.queue_consumer_readiness_id,
    providerPolling.queue_producer_readiness_id,
    providerPolling.dispatch_attempt_id,
    providerPolling.dispatch_preflight_id,
    providerPolling.delivery_queue_message_id,
    providerPolling.delivery_batch_id,
    providerPolling.schedule_intent_id,
    receiptPayloadRecordStatus,
    providerPolling.queue_name,
    providerPolling.provider_name,
    "dry_run_contract_only_no_receipt_payload",
    "blocked_until_receipt_payload_delivery_receipt_and_reconciliation_contracts_verified",
    "blocked_until_sequence_provider_polling_readiness_issue_378_stays_current",
    providerPolling.provider_response_policy,
    providerPolling.provider_message_id_policy,
    providerPolling.delivery_attempt_policy,
    providerPolling.delivery_result_policy,
    providerPolling.delivery_status_webhook_policy,
    providerPolling.provider_polling_policy,
    "Receipt payload capture stays disabled until receipt payload schema, redaction, retention, delivery-receipt, retry, suppression, and audit contracts exist together.",
    "Future receipt-payload writes must key idempotency by sequence, provider-polling readiness, dispatch attempt, provider, provider message ID policy, receipt payload scope, and delivery-receipt scope before any payload is captured.",
    "Future receipt-payload writes must carry redacted audit correlation from schedule intent through delivery batch, queue-message evidence, dispatch preflight, dispatch attempt, Queue readiness, provider-call readiness, delivery-attempt readiness, delivery-result readiness, delivery-status webhook readiness, provider-polling readiness, and receipt-payload readiness.",
    "Receipt-payload backpressure must fail closed when provider polling, receipt-payload capture, retry/dead-letter capacity, delivery-receipt capacity, or suppression capacity are not explicit.",
    readiness.workspace.revisionId,
    sequence.status,
    expectedReadyEnrollmentCount,
    audienceSequenceProviderPollingReadinessStatus,
    numberValue(providerPolling.dry_run_message_count),
    numberValue(providerPolling.held_enrollment_count),
    numberValue(providerPolling.active_suppression_count),
    providerPolling.provider_limit_policy,
    providerPolling.provider_rate_limit_window,
    providerPolling.dispatch_mode,
    providerPolling.dispatch_result_status,
    providerPolling.suppression_check_status,
    providerPolling.unsubscribe_footer_check_status,
    providerPolling.sender_domain_gate_status,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    idempotencyKey,
    input.actor.userId,
    input.actor.email,
    JSON.stringify({
      issue: audienceSequenceReceiptPayloadReadinessIssue,
      providerPollingReadinessId: providerPolling.id,
      deliveryStatusWebhookReadinessId: providerPolling.delivery_status_webhook_readiness_id,
      deliveryResultReadinessId: providerPolling.delivery_result_readiness_id,
      deliveryAttemptReadinessId: providerPolling.delivery_attempt_readiness_id,
      providerCallReadinessId: providerPolling.provider_call_readiness_id,
      queueConsumerReadinessId: providerPolling.queue_consumer_readiness_id,
      queueProducerReadinessId: providerPolling.queue_producer_readiness_id,
      dispatchAttemptId: providerPolling.dispatch_attempt_id,
      dispatchPreflightId: providerPolling.dispatch_preflight_id,
      deliveryQueueMessageId: providerPolling.delivery_queue_message_id,
      deliveryBatchId: providerPolling.delivery_batch_id,
      scheduleIntentId: providerPolling.schedule_intent_id,
      receiptPayloadEnabled: false,
      receiptPayloadsCreated: false,
      deliveryReceiptsCreated: false,
      privateContactDataIncluded: false,
    }),
  ];
  await db.prepare(`INSERT INTO audience_sequence_receipt_payload_readiness (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`).bind(...values).run();

  const record = await findReceiptPayloadReadinessByIdempotency(db, idempotencyKey);
  if (!record) return { ok: false, status: "receipt_payload_readiness_not_created", message: "The sequence receipt-payload readiness record could not be saved.", redaction };

  return { ok: true, status: "sequence_receipt_payload_readiness_recorded", duplicate: false, record: publicReceiptPayloadReadiness(record, false), redaction };
}
