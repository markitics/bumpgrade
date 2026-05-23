import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";

export const audienceSequenceDeliveryReceiptReadinessIssue = 383;
export const audienceSequenceDeliveryReceiptReadinessStatus = "sequence-delivery-receipt-readiness-ready";
export const audienceSequenceDeliveryReceiptReadinessApiRoute =
  "/api/admin/audience/sequences/delivery-receipt-readiness";
export const audienceSequenceDeliveryReceiptReadinessConfirmationText =
  "Record Bumpgrade sequence delivery-receipt readiness gate";

const receiptPayloadReadinessDependencyStatus = "sequence-receipt-payload-readiness-ready";
const receiptPayloadRecordStatus = "sequence_receipt_payload_readiness_recorded";
const deliveryReceiptRecordStatus = "sequence_delivery_receipt_readiness_recorded";

type AudienceRuntime = {
  db: D1Database;
};

type ReceiptPayloadReadinessReferenceRow = {
  id: string;
  sequence_id: string;
  provider_polling_readiness_id: string;
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
  receipt_payload_gate_status: string;
  provider_polling_dependency_status: string;
  provider_response_policy: string;
  provider_message_id_policy: string;
  delivery_attempt_policy: string;
  delivery_result_policy: string;
  delivery_status_webhook_policy: string;
  receipt_payload_policy: string;
  idempotency_policy: string;
  audit_correlation_policy: string;
  backpressure_policy: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  expected_provider_polling_readiness_status: string;
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
  receipt_payload_enabled: number | string | null;
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

type DeliveryReceiptReadinessRow = ReceiptPayloadReadinessReferenceRow & {
  receipt_payload_readiness_id: string;
  delivery_receipt_gate_status: string;
  receipt_payload_dependency_status: string;
  delivery_receipt_policy: string;
  expected_receipt_payload_readiness_status: string;
  delivery_receipt_enabled: number | string | null;
  idempotency_key: string;
};

export type AudienceSequenceDeliveryReceiptReadinessPublic = {
  id: string;
  sequenceId: string;
  receiptPayloadReadinessId: string;
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
  deliveryReceiptGateStatus: string;
  receiptPayloadDependencyStatus: string;
  receiptPayloadPolicy: string;
  deliveryReceiptPolicy: string;
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
  expectedReceiptPayloadReadinessStatus: string;
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
  receiptPayloadEnabled: false;
  providerPollingPayloadsRead: false;
  providerPollingPayloadsCreated: false;
  providerPollingResultsCreated: false;
  deliveryReceiptEnabled: false;
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

export type AudienceSequenceDeliveryReceiptReadinessSummary = {
  id: "audience-sequence-delivery-receipt-readiness-contract";
  status: typeof audienceSequenceDeliveryReceiptReadinessStatus;
  issue: typeof audienceSequenceDeliveryReceiptReadinessIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceDeliveryReceiptReadinessApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: { required: true; text: typeof audienceSequenceDeliveryReceiptReadinessConfirmationText };
  dependency: {
    receiptPayloadReadinessStatus: typeof receiptPayloadReadinessDependencyStatus;
    receiptPayloadReadinessIssue: 380;
    receiptPayloadReadinessRequired: true;
  };
  counts: {
    deliveryReceiptReadinessRecords: number;
    dryRunDeliveryReceiptContracts: number;
    dryRunMessagesSnapshotted: number;
    heldEnrollmentsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    deliveryStatusWebhookEnabledRecords: number;
    deliveryAttemptsCreatedRecords: number;
    deliveryResultsCreatedRecords: number;
    deliveryStatusWebhooksProcessedRecords: number;
    deliveryStatusWebhookPayloadsReadRecords: number;
    deliveryStatusWebhookPayloadsCreatedRecords: number;
    receiptPayloadEnabledRecords: number;
    providerPollingPayloadsReadRecords: number;
    providerPollingPayloadsCreatedRecords: number;
    providerPollingResultsCreatedRecords: number;
    deliveryReceiptEnabledRecords: number;
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
  latestRecords: AudienceSequenceDeliveryReceiptReadinessPublic[];
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
    receiptPayloadEnabled: false;
    deliveryReceiptEnabled: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateDeliveryReceiptReadinessInput = {
  receiptPayloadReadinessId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateDeliveryReceiptReadinessResult =
  | {
      ok: true;
      status: "sequence_delivery_receipt_readiness_recorded" | "sequence_delivery_receipt_readiness_replayed";
      duplicate: boolean;
      record: AudienceSequenceDeliveryReceiptReadinessPublic;
      redaction: AudienceSequenceDeliveryReceiptReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "receipt_payload_readiness_not_found"
        | "stale_receipt_payload_readiness_status"
        | "stale_receipt_payload_readiness_evidence"
        | "delivery_receipt_gate_not_ready"
        | "readiness_unavailable"
        | "sequence_not_found"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "delivery_receipt_readiness_not_created";
      message: string;
      redaction: AudienceSequenceDeliveryReceiptReadinessSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
      currentReceiptPayloadReadinessStatus?: string | null;
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

function receiptPayloadHasNoLiveArtifacts(row: ReceiptPayloadReadinessReferenceRow) {
  return (
    row.provider_mode === "dry_run_contract_only_no_receipt_payload" &&
    numberValue(row.delivery_status_webhook_enabled) === 0 &&
    numberValue(row.delivery_attempts_created) === 0 &&
    numberValue(row.delivery_results_created) === 0 &&
    numberValue(row.delivery_status_webhooks_processed) === 0 &&
    numberValue(row.delivery_status_webhook_payloads_read) === 0 &&
    numberValue(row.delivery_status_webhook_payloads_created) === 0 &&
    numberValue(row.receipt_payload_enabled) === 0 &&
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

function publicDeliveryReceiptReadiness(
  row: DeliveryReceiptReadinessRow,
  duplicate: boolean,
): AudienceSequenceDeliveryReceiptReadinessPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    receiptPayloadReadinessId: row.receipt_payload_readiness_id,
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
    deliveryReceiptGateStatus: row.delivery_receipt_gate_status,
    receiptPayloadDependencyStatus: row.receipt_payload_dependency_status,
    receiptPayloadPolicy: row.receipt_payload_policy,
    deliveryReceiptPolicy: row.delivery_receipt_policy,
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
    expectedReceiptPayloadReadinessStatus: row.expected_receipt_payload_readiness_status,
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
    receiptPayloadEnabled: false,
    providerPollingPayloadsRead: false,
    providerPollingPayloadsCreated: false,
    providerPollingResultsCreated: false,
    deliveryReceiptEnabled: false,
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
): AudienceSequenceDeliveryReceiptReadinessSummary {
  return {
    id: "audience-sequence-delivery-receipt-readiness-contract",
    status: audienceSequenceDeliveryReceiptReadinessStatus,
    issue: audienceSequenceDeliveryReceiptReadinessIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceDeliveryReceiptReadinessApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: { required: true, text: audienceSequenceDeliveryReceiptReadinessConfirmationText },
    dependency: {
      receiptPayloadReadinessStatus: receiptPayloadReadinessDependencyStatus,
      receiptPayloadReadinessIssue: 380,
      receiptPayloadReadinessRequired: true,
    },
    counts: {
      deliveryReceiptReadinessRecords: 0,
      dryRunDeliveryReceiptContracts: 0,
      dryRunMessagesSnapshotted: 0,
      heldEnrollmentsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      deliveryStatusWebhookEnabledRecords: 0,
      deliveryAttemptsCreatedRecords: 0,
      deliveryResultsCreatedRecords: 0,
      deliveryStatusWebhooksProcessedRecords: 0,
      deliveryStatusWebhookPayloadsReadRecords: 0,
      deliveryStatusWebhookPayloadsCreatedRecords: 0,
      receiptPayloadEnabledRecords: 0,
      providerPollingPayloadsReadRecords: 0,
      providerPollingPayloadsCreatedRecords: 0,
      providerPollingResultsCreatedRecords: 0,
      deliveryReceiptEnabledRecords: 0,
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
      receiptPayloadEnabled: false,
      deliveryReceiptEnabled: false,
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
      "Issue #383 lets verified owners record sequence delivery-receipt readiness gates from a current sequence receipt-payload readiness record after exact confirmation, idempotency, workspace revision, sequence status, readiness, receipt-payload readiness status, delivery-receipt, backpressure, and audit checks. It does not call providers, send messages, create provider responses, create provider message IDs, create delivery attempts or results, process status webhooks, read or create webhook payloads, poll providers, read or create receipt payloads, create polling results, create delivery receipts, create receipts, enable Cloudflare Queue consumers, consume or ack Queue messages, create retry or dead-letter rows, read or create Queue payload bodies, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

function receiptPayloadSelect() {
  return `SELECT
    id, sequence_id, provider_polling_readiness_id, delivery_status_webhook_readiness_id, delivery_result_readiness_id, delivery_attempt_readiness_id,
    provider_call_readiness_id, queue_consumer_readiness_id, queue_producer_readiness_id,
    dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
    schedule_intent_id, status, queue_name, provider_name, provider_mode, receipt_payload_gate_status,
    provider_polling_dependency_status, provider_response_policy, provider_message_id_policy,
    delivery_attempt_policy, delivery_result_policy, delivery_status_webhook_policy, receipt_payload_policy,
    idempotency_policy, audit_correlation_policy, backpressure_policy, expected_workspace_revision_id,
    expected_sequence_status, expected_ready_enrollment_count, expected_provider_polling_readiness_status,
    dry_run_message_count, held_enrollment_count, active_suppression_count, provider_limit_policy,
    provider_rate_limit_window, dispatch_mode, dispatch_result_status, suppression_check_status,
    unsubscribe_footer_check_status, sender_domain_gate_status, delivery_status_webhook_enabled,
    delivery_attempts_created, delivery_results_created, delivery_status_webhooks_processed,
    delivery_status_webhook_payloads_read, delivery_status_webhook_payloads_created, receipt_payload_enabled,
    provider_polling_payloads_read, provider_polling_payloads_created, provider_polling_results_created,
    receipt_payloads_created, delivery_receipts_created, cloudflare_queue_consumer_enabled,
    cloudflare_queue_messages_consumed, cloudflare_queue_messages_acked, queue_retry_records_created,
    queue_dead_letter_records_created, queue_payload_bodies_read, queue_payload_bodies_created,
    recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created, provider_send_enabled,
    provider_responses_created, provider_message_ids_created, created_at
  FROM audience_sequence_receipt_payload_readiness`;
}

function deliveryReceiptSelect() {
  return `SELECT
    id, sequence_id, receipt_payload_readiness_id, provider_polling_readiness_id, delivery_status_webhook_readiness_id,
    delivery_result_readiness_id, delivery_attempt_readiness_id, provider_call_readiness_id,
    queue_consumer_readiness_id, queue_producer_readiness_id, dispatch_attempt_id, dispatch_preflight_id,
    delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status, queue_name, provider_name,
    provider_mode, delivery_receipt_gate_status, receipt_payload_dependency_status, provider_response_policy,
    provider_message_id_policy, delivery_attempt_policy, delivery_result_policy, delivery_status_webhook_policy,
    receipt_payload_policy, delivery_receipt_policy, idempotency_policy, audit_correlation_policy,
    backpressure_policy, expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
    expected_receipt_payload_readiness_status, dry_run_message_count, held_enrollment_count,
    active_suppression_count, provider_limit_policy, provider_rate_limit_window, dispatch_mode,
    dispatch_result_status, suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
    delivery_status_webhook_enabled, delivery_attempts_created, delivery_results_created,
    delivery_status_webhooks_processed, delivery_status_webhook_payloads_read, delivery_status_webhook_payloads_created,
    receipt_payload_enabled, provider_polling_payloads_read, provider_polling_payloads_created,
    provider_polling_results_created, delivery_receipt_enabled, receipt_payloads_created, delivery_receipts_created,
    cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed, cloudflare_queue_messages_acked,
    queue_retry_records_created, queue_dead_letter_records_created, queue_payload_bodies_read,
    queue_payload_bodies_created, recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
    provider_send_enabled, provider_responses_created, provider_message_ids_created, idempotency_key, created_at
  FROM audience_sequence_delivery_receipt_readiness`;
}

async function findReceiptPayloadReadinessById(db: D1Database, id: string) {
  return db.prepare(`${receiptPayloadSelect()} WHERE id = ?`).bind(id).first<ReceiptPayloadReadinessReferenceRow>();
}

async function findLatestReceiptPayloadReadinessForSequence(db: D1Database, sequenceId: string) {
  return db
    .prepare(`${receiptPayloadSelect()} WHERE sequence_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`)
    .bind(sequenceId)
    .first<ReceiptPayloadReadinessReferenceRow>();
}

async function findDeliveryReceiptReadinessByIdempotency(db: D1Database, idempotencyKey: string) {
  return db.prepare(`${deliveryReceiptSelect()} WHERE idempotency_key = ?`).bind(idempotencyKey).first<DeliveryReceiptReadinessRow>();
}

export async function getAudienceSequenceDeliveryReceiptReadinessSummary(): Promise<AudienceSequenceDeliveryReceiptReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS delivery_receipt_readiness_count,
          SUM(CASE WHEN provider_mode LIKE '%dry_run%' THEN 1 ELSE 0 END) AS dry_run_delivery_receipt_contract_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN delivery_status_webhook_enabled > 0 THEN 1 ELSE 0 END) AS delivery_status_webhook_enabled_count,
          SUM(CASE WHEN delivery_attempts_created > 0 THEN 1 ELSE 0 END) AS delivery_attempts_created_count,
          SUM(CASE WHEN delivery_results_created > 0 THEN 1 ELSE 0 END) AS delivery_results_created_count,
          SUM(CASE WHEN delivery_status_webhooks_processed > 0 THEN 1 ELSE 0 END) AS delivery_status_webhooks_processed_count,
          SUM(CASE WHEN delivery_status_webhook_payloads_read > 0 THEN 1 ELSE 0 END) AS delivery_status_webhook_payloads_read_count,
          SUM(CASE WHEN delivery_status_webhook_payloads_created > 0 THEN 1 ELSE 0 END) AS delivery_status_webhook_payloads_created_count,
          SUM(CASE WHEN receipt_payload_enabled > 0 THEN 1 ELSE 0 END) AS receipt_payload_enabled_count,
          SUM(CASE WHEN provider_polling_payloads_read > 0 THEN 1 ELSE 0 END) AS provider_polling_payloads_read_count,
          SUM(CASE WHEN provider_polling_payloads_created > 0 THEN 1 ELSE 0 END) AS provider_polling_payloads_created_count,
          SUM(CASE WHEN provider_polling_results_created > 0 THEN 1 ELSE 0 END) AS provider_polling_results_created_count,
          SUM(CASE WHEN delivery_receipt_enabled > 0 THEN 1 ELSE 0 END) AS delivery_receipt_enabled_count,
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
        FROM audience_sequence_delivery_receipt_readiness`,
      )
      .first<Record<string, number | string | null>>();
    const latest = await db.prepare(`${deliveryReceiptSelect()} ORDER BY created_at DESC LIMIT 10`).all<DeliveryReceiptReadinessRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        deliveryReceiptReadinessRecords: numberValue(counts?.delivery_receipt_readiness_count),
        dryRunDeliveryReceiptContracts: numberValue(counts?.dry_run_delivery_receipt_contract_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        deliveryStatusWebhookEnabledRecords: numberValue(counts?.delivery_status_webhook_enabled_count),
        deliveryAttemptsCreatedRecords: numberValue(counts?.delivery_attempts_created_count),
        deliveryResultsCreatedRecords: numberValue(counts?.delivery_results_created_count),
        deliveryStatusWebhooksProcessedRecords: numberValue(counts?.delivery_status_webhooks_processed_count),
        deliveryStatusWebhookPayloadsReadRecords: numberValue(counts?.delivery_status_webhook_payloads_read_count),
        deliveryStatusWebhookPayloadsCreatedRecords: numberValue(counts?.delivery_status_webhook_payloads_created_count),
        receiptPayloadEnabledRecords: numberValue(counts?.receipt_payload_enabled_count),
        providerPollingPayloadsReadRecords: numberValue(counts?.provider_polling_payloads_read_count),
        providerPollingPayloadsCreatedRecords: numberValue(counts?.provider_polling_payloads_created_count),
        providerPollingResultsCreatedRecords: numberValue(counts?.provider_polling_results_created_count),
        deliveryReceiptEnabledRecords: numberValue(counts?.delivery_receipt_enabled_count),
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
      latestRecords: (latest.results ?? []).map((row) => publicDeliveryReceiptReadiness(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence delivery-receipt readiness.",
    );
  }
}

export async function createAudienceSequenceDeliveryReceiptReadiness(
  input: CreateDeliveryReceiptReadinessInput,
): Promise<CreateDeliveryReceiptReadinessResult> {
  const redaction = emptySummary("d1", null).redaction;
  const receiptPayloadReadinessId = parseString(input.receiptPayloadReadinessId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!receiptPayloadReadinessId || !sequenceId || !expectedWorkspaceRevisionId || !expectedSequenceStatus || expectedReadyEnrollmentCount === null || !idempotencyKey) {
    return { ok: false, status: "invalid_request", message: "A receipt-payload readiness ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.", redaction };
  }

  if (input.confirmationText !== audienceSequenceDeliveryReceiptReadinessConfirmationText) {
    return { ok: false, status: "confirmation_required", message: "Exact confirmation text is required before recording sequence delivery-receipt readiness.", redaction };
  }

  const { db } = await getRuntime();
  const existing = await findDeliveryReceiptReadinessByIdempotency(db, idempotencyKey);
  if (existing) return { ok: true, status: "sequence_delivery_receipt_readiness_replayed", duplicate: true, record: publicDeliveryReceiptReadiness(existing, true), redaction };

  const receiptPayload = await findReceiptPayloadReadinessById(db, receiptPayloadReadinessId);
  if (!receiptPayload) {
    return { ok: false, status: "receipt_payload_readiness_not_found", message: "A current sequence receipt-payload readiness record is required before delivery-receipt readiness can be recorded.", redaction };
  }

  if (receiptPayload.sequence_id !== sequenceId) {
    return { ok: false, status: "stale_receipt_payload_readiness_evidence", message: "The sequence no longer matches the selected receipt-payload readiness record.", redaction };
  }

  if (receiptPayload.status !== receiptPayloadRecordStatus) {
    return { ok: false, status: "stale_receipt_payload_readiness_status", message: "The sequence receipt-payload readiness status changed before delivery-receipt readiness was recorded.", redaction, currentReceiptPayloadReadinessStatus: receiptPayload.status };
  }

  const latestReceiptPayload = await findLatestReceiptPayloadReadinessForSequence(db, sequenceId);
  if (!latestReceiptPayload || latestReceiptPayload.id !== receiptPayload.id) {
    return { ok: false, status: "stale_receipt_payload_readiness_evidence", message: "A newer sequence receipt-payload readiness record exists for this sequence.", redaction };
  }

  if (!receiptPayloadHasNoLiveArtifacts(receiptPayload)) {
    return { ok: false, status: "delivery_receipt_gate_not_ready", message: "Sequence delivery-receipt readiness requires a current dry-run receipt-payload readiness record with no provider calls, Queue consumption, acknowledgements, retry/dead-letter rows, payload reads, webhook payloads, receipt payload, polling results, delivery receipts, receipts, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, provider message IDs, delivery attempts, delivery results, or status webhooks.", redaction };
  }

  const { getAudienceSequenceDeliveryReadinessSummary } = await import("@/lib/audience-sequence-readiness");
  const readiness = await getAudienceSequenceDeliveryReadinessSummary();
  if (readiness.source !== "d1") return { ok: false, status: "readiness_unavailable", message: readiness.loadError ?? "Sequence delivery readiness is unavailable.", redaction };

  const sequence = readiness.records.find((record) => record.sequenceId === sequenceId);
  if (!sequence) return { ok: false, status: "sequence_not_found", message: "The sequence could not be found.", redaction };

  if (readiness.workspace.revisionId !== expectedWorkspaceRevisionId || receiptPayload.expected_workspace_revision_id !== expectedWorkspaceRevisionId) {
    return { ok: false, status: "stale_workspace_revision", message: "The audience workspace changed before sequence delivery-receipt readiness was recorded.", redaction, currentWorkspaceRevisionId: readiness.workspace.revisionId };
  }

  if (sequence.status !== expectedSequenceStatus || receiptPayload.expected_sequence_status !== expectedSequenceStatus) {
    return { ok: false, status: "stale_sequence_status", message: "The sequence status changed before sequence delivery-receipt readiness was recorded.", redaction, currentSequenceStatus: sequence.status };
  }

  if (readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount || numberValue(receiptPayload.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount) {
    return { ok: false, status: "stale_readiness_count", message: "Sequence readiness changed before delivery-receipt readiness was recorded.", redaction, currentReadyEnrollmentCount: readiness.counts.readyEnrollments };
  }

  const recordId = `sequence-delivery-receipt-readiness-${crypto.randomUUID()}`;
  const columns = [
    "id", "sequence_id", "receipt_payload_readiness_id", "provider_polling_readiness_id", "delivery_status_webhook_readiness_id",
    "delivery_result_readiness_id", "delivery_attempt_readiness_id", "provider_call_readiness_id",
    "queue_consumer_readiness_id", "queue_producer_readiness_id", "dispatch_attempt_id", "dispatch_preflight_id",
    "delivery_queue_message_id", "delivery_batch_id", "schedule_intent_id", "status", "queue_name",
    "provider_name", "provider_mode", "delivery_receipt_gate_status", "receipt_payload_dependency_status",
    "provider_response_policy", "provider_message_id_policy", "delivery_attempt_policy", "delivery_result_policy",
    "delivery_status_webhook_policy", "receipt_payload_policy", "delivery_receipt_policy", "idempotency_policy",
    "audit_correlation_policy", "backpressure_policy", "expected_workspace_revision_id", "expected_sequence_status",
    "expected_ready_enrollment_count", "expected_receipt_payload_readiness_status", "dry_run_message_count",
    "held_enrollment_count", "active_suppression_count", "provider_limit_policy", "provider_rate_limit_window",
    "dispatch_mode", "dispatch_result_status", "suppression_check_status", "unsubscribe_footer_check_status",
    "sender_domain_gate_status", "delivery_status_webhook_enabled", "delivery_attempts_created",
    "delivery_results_created", "delivery_status_webhooks_processed", "delivery_status_webhook_payloads_read",
    "delivery_status_webhook_payloads_created", "receipt_payload_enabled", "provider_polling_payloads_read",
    "provider_polling_payloads_created", "provider_polling_results_created", "delivery_receipt_enabled",
    "receipt_payloads_created", "delivery_receipts_created", "cloudflare_queue_consumer_enabled",
    "cloudflare_queue_messages_consumed", "cloudflare_queue_messages_acked", "queue_retry_records_created",
    "queue_dead_letter_records_created", "queue_payload_bodies_read", "queue_payload_bodies_created",
    "recipient_payloads_created", "personalized_bodies_created", "unsubscribe_urls_created", "provider_send_enabled",
    "provider_responses_created", "provider_message_ids_created", "idempotency_key", "actor_user_id",
    "actor_email", "metadata_json",
  ];
  const values = [
    recordId,
    receiptPayload.sequence_id,
    receiptPayload.id,
    receiptPayload.provider_polling_readiness_id,
    receiptPayload.delivery_status_webhook_readiness_id,
    receiptPayload.delivery_result_readiness_id,
    receiptPayload.delivery_attempt_readiness_id,
    receiptPayload.provider_call_readiness_id,
    receiptPayload.queue_consumer_readiness_id,
    receiptPayload.queue_producer_readiness_id,
    receiptPayload.dispatch_attempt_id,
    receiptPayload.dispatch_preflight_id,
    receiptPayload.delivery_queue_message_id,
    receiptPayload.delivery_batch_id,
    receiptPayload.schedule_intent_id,
    deliveryReceiptRecordStatus,
    receiptPayload.queue_name,
    receiptPayload.provider_name,
    "dry_run_contract_only_no_delivery_receipt",
    "blocked_until_delivery_receipt_and_reconciliation_contracts_verified",
    "blocked_until_sequence_receipt_payload_readiness_issue_380_stays_current",
    receiptPayload.provider_response_policy,
    receiptPayload.provider_message_id_policy,
    receiptPayload.delivery_attempt_policy,
    receiptPayload.delivery_result_policy,
    receiptPayload.delivery_status_webhook_policy,
    receiptPayload.receipt_payload_policy,
    "Delivery receipt capture stays disabled until delivery receipt schema, redaction, retention, retry, suppression, and audit contracts exist together.",
    "Future delivery-receipt writes must key idempotency by sequence, receipt-payload readiness, dispatch attempt, provider, provider message ID policy, delivery receipt scope, and reconciliation scope before any payload is captured.",
    "Future delivery-receipt writes must carry redacted audit correlation from schedule intent through delivery batch, queue-message evidence, dispatch preflight, dispatch attempt, Queue readiness, provider-call readiness, delivery-attempt readiness, delivery-result readiness, delivery-status webhook readiness, receipt-payload readiness, and delivery-receipt readiness.",
    "Delivery-receipt backpressure must fail closed when receipt payload, delivery-receipt capture, retry/dead-letter capacity, reconciliation capacity, or suppression capacity are not explicit.",
    readiness.workspace.revisionId,
    sequence.status,
    expectedReadyEnrollmentCount,
    receiptPayloadReadinessDependencyStatus,
    numberValue(receiptPayload.dry_run_message_count),
    numberValue(receiptPayload.held_enrollment_count),
    numberValue(receiptPayload.active_suppression_count),
    receiptPayload.provider_limit_policy,
    receiptPayload.provider_rate_limit_window,
    receiptPayload.dispatch_mode,
    receiptPayload.dispatch_result_status,
    receiptPayload.suppression_check_status,
    receiptPayload.unsubscribe_footer_check_status,
    receiptPayload.sender_domain_gate_status,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    idempotencyKey,
    input.actor.userId,
    input.actor.email,
    JSON.stringify({
      issue: audienceSequenceDeliveryReceiptReadinessIssue,
      receiptPayloadReadinessId: receiptPayload.id,
      providerPollingReadinessId: receiptPayload.provider_polling_readiness_id,
      deliveryStatusWebhookReadinessId: receiptPayload.delivery_status_webhook_readiness_id,
      deliveryResultReadinessId: receiptPayload.delivery_result_readiness_id,
      deliveryAttemptReadinessId: receiptPayload.delivery_attempt_readiness_id,
      providerCallReadinessId: receiptPayload.provider_call_readiness_id,
      queueConsumerReadinessId: receiptPayload.queue_consumer_readiness_id,
      queueProducerReadinessId: receiptPayload.queue_producer_readiness_id,
      dispatchAttemptId: receiptPayload.dispatch_attempt_id,
      dispatchPreflightId: receiptPayload.dispatch_preflight_id,
      deliveryQueueMessageId: receiptPayload.delivery_queue_message_id,
      deliveryBatchId: receiptPayload.delivery_batch_id,
      scheduleIntentId: receiptPayload.schedule_intent_id,
      deliveryReceiptEnabled: false,
      receiptPayloadsCreated: false,
      deliveryReceiptsCreated: false,
      privateContactDataIncluded: false,
    }),
  ];
  await db.prepare(`INSERT INTO audience_sequence_delivery_receipt_readiness (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`).bind(...values).run();

  const record = await findDeliveryReceiptReadinessByIdempotency(db, idempotencyKey);
  if (!record) return { ok: false, status: "delivery_receipt_readiness_not_created", message: "The sequence delivery-receipt readiness record could not be saved.", redaction };

  return { ok: true, status: "sequence_delivery_receipt_readiness_recorded", duplicate: false, record: publicDeliveryReceiptReadiness(record, false), redaction };
}
