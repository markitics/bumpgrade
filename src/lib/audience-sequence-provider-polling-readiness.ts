import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import {
  audienceSequenceDeliveryStatusWebhookReadinessStatus,
} from "@/lib/audience-sequence-delivery-status-webhook-readiness";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceProviderPollingReadinessIssue = 378;
export const audienceSequenceProviderPollingReadinessStatus = "sequence-provider-polling-readiness-ready";
export const audienceSequenceProviderPollingReadinessApiRoute =
  "/api/admin/audience/sequences/provider-polling-readiness";
export const audienceSequenceProviderPollingReadinessConfirmationText =
  "Record Bumpgrade sequence provider-polling readiness gate";

const deliveryStatusWebhookRecordStatus = "sequence_delivery_status_webhook_readiness_recorded";
const providerPollingRecordStatus = "sequence_provider_polling_readiness_recorded";

type AudienceRuntime = {
  db: D1Database;
};

type DeliveryStatusWebhookReadinessReferenceRow = {
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
  created_at: number | string | null;
};

type ProviderPollingReadinessRow = DeliveryStatusWebhookReadinessReferenceRow & {
  delivery_status_webhook_readiness_id: string;
  provider_polling_gate_status: string;
  delivery_status_webhook_dependency_status: string;
  provider_polling_policy: string;
  expected_delivery_status_webhook_readiness_status: string;
  provider_polling_payloads_read: number | string | null;
  provider_polling_payloads_created: number | string | null;
  idempotency_key: string;
};

export type AudienceSequenceProviderPollingReadinessPublic = {
  id: string;
  sequenceId: string;
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
  providerPollingGateStatus: string;
  deliveryStatusWebhookDependencyStatus: string;
  providerResponsePolicy: string;
  providerMessageIdPolicy: string;
  deliveryAttemptPolicy: string;
  deliveryResultPolicy: string;
  deliveryStatusWebhookPolicy: string;
  providerPollingPolicy: string;
  idempotencyPolicy: string;
  auditCorrelationPolicy: string;
  backpressurePolicy: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
  expectedDeliveryStatusWebhookReadinessStatus: string;
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

export type AudienceSequenceProviderPollingReadinessSummary = {
  id: "audience-sequence-provider-polling-readiness-contract";
  status: typeof audienceSequenceProviderPollingReadinessStatus;
  issue: typeof audienceSequenceProviderPollingReadinessIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceProviderPollingReadinessApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: { required: true; text: typeof audienceSequenceProviderPollingReadinessConfirmationText };
  dependency: {
    deliveryStatusWebhookReadinessStatus: typeof audienceSequenceDeliveryStatusWebhookReadinessStatus;
    deliveryStatusWebhookReadinessIssue: 376;
    deliveryStatusWebhookReadinessRequired: true;
  };
  counts: {
    providerPollingReadinessRecords: number;
    dryRunProviderPollingContracts: number;
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
  latestRecords: AudienceSequenceProviderPollingReadinessPublic[];
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

type CreateProviderPollingReadinessInput = {
  deliveryStatusWebhookReadinessId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateProviderPollingReadinessResult =
  | {
      ok: true;
      status: "sequence_provider_polling_readiness_recorded" | "sequence_provider_polling_readiness_replayed";
      duplicate: boolean;
      record: AudienceSequenceProviderPollingReadinessPublic;
      redaction: AudienceSequenceProviderPollingReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "delivery_status_webhook_readiness_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "stale_delivery_status_webhook_readiness_status"
        | "stale_delivery_status_webhook_readiness_evidence"
        | "provider_polling_gate_not_ready"
        | "provider_polling_readiness_not_created";
      message: string;
      redaction: AudienceSequenceProviderPollingReadinessSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
      currentDeliveryStatusWebhookReadinessStatus?: string | null;
    };

async function getRuntime(): Promise<AudienceRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) throw new Error("Cloudflare D1 binding DB is not available.");
  return { db: cloudflareEnv.DB };
}

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function timestampValue(value: number | string | null | undefined) {
  const seconds = numberValue(value);
  return seconds ? new Date(seconds * 1000).toISOString() : null;
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

function deliveryStatusWebhookHasNoLiveArtifacts(row: DeliveryStatusWebhookReadinessReferenceRow) {
  return (
    row.provider_mode === "dry_run_contract_only_no_delivery_status_webhook" &&
    numberValue(row.delivery_status_webhook_enabled) === 0 &&
    numberValue(row.delivery_attempts_created) === 0 &&
    numberValue(row.delivery_results_created) === 0 &&
    numberValue(row.delivery_status_webhooks_processed) === 0 &&
    numberValue(row.delivery_status_webhook_payloads_read) === 0 &&
    numberValue(row.delivery_status_webhook_payloads_created) === 0 &&
    numberValue(row.provider_polling_enabled) === 0 &&
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

function publicProviderPollingReadiness(row: ProviderPollingReadinessRow, duplicate: boolean): AudienceSequenceProviderPollingReadinessPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
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
    providerPollingGateStatus: row.provider_polling_gate_status,
    deliveryStatusWebhookDependencyStatus: row.delivery_status_webhook_dependency_status,
    providerResponsePolicy: row.provider_response_policy,
    providerMessageIdPolicy: row.provider_message_id_policy,
    deliveryAttemptPolicy: row.delivery_attempt_policy,
    deliveryResultPolicy: row.delivery_result_policy,
    deliveryStatusWebhookPolicy: row.delivery_status_webhook_policy,
    providerPollingPolicy: row.provider_polling_policy,
    idempotencyPolicy: row.idempotency_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    backpressurePolicy: row.backpressure_policy,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
    expectedDeliveryStatusWebhookReadinessStatus: row.expected_delivery_status_webhook_readiness_status,
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

function emptySummary(source: AudienceSequenceProviderPollingReadinessSummary["source"], loadError: string | null): AudienceSequenceProviderPollingReadinessSummary {
  return {
    id: "audience-sequence-provider-polling-readiness-contract",
    status: audienceSequenceProviderPollingReadinessStatus,
    issue: audienceSequenceProviderPollingReadinessIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceProviderPollingReadinessApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: { required: true, text: audienceSequenceProviderPollingReadinessConfirmationText },
    dependency: {
      deliveryStatusWebhookReadinessStatus: audienceSequenceDeliveryStatusWebhookReadinessStatus,
      deliveryStatusWebhookReadinessIssue: 376,
      deliveryStatusWebhookReadinessRequired: true,
    },
    counts: {
      providerPollingReadinessRecords: 0,
      dryRunProviderPollingContracts: 0,
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
      "Issue #378 lets verified owners record sequence provider-polling readiness gates from a current sequence delivery-status webhook readiness record after exact confirmation, idempotency, workspace revision, sequence status, readiness, delivery-status webhook readiness status, provider polling, receipt, backpressure, and audit checks. It does not call providers, send messages, create provider responses, create provider message IDs, create delivery attempts or results, process status webhooks, read or create webhook payloads, poll providers, create polling results, create receipt payloads, create receipts, enable Cloudflare Queue consumers, consume or ack Queue messages, create retry or dead-letter rows, read or create Queue payload bodies, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, expose private recipients, or authorize direct public agent sequence writes.",
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
    provider_responses_created, provider_message_ids_created, idempotency_key, created_at
  FROM audience_sequence_provider_polling_readiness`;
}

function deliveryStatusWebhookSelect() {
  return `SELECT
    id, sequence_id, delivery_result_readiness_id, delivery_attempt_readiness_id,
    provider_call_readiness_id, queue_consumer_readiness_id, queue_producer_readiness_id,
    dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
    schedule_intent_id, status, queue_name, provider_name, provider_mode, delivery_status_webhook_gate_status,
    delivery_result_dependency_status, provider_response_policy, provider_message_id_policy, delivery_attempt_policy,
    delivery_result_policy, delivery_status_webhook_policy, idempotency_policy, audit_correlation_policy,
    backpressure_policy, expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
    expected_delivery_result_readiness_status, dry_run_message_count, held_enrollment_count, active_suppression_count,
    provider_limit_policy, provider_rate_limit_window, dispatch_mode, dispatch_result_status,
    suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status, delivery_status_webhook_enabled,
    delivery_attempts_created, delivery_results_created, delivery_status_webhooks_processed,
    delivery_status_webhook_payloads_read, delivery_status_webhook_payloads_created, provider_polling_enabled,
    provider_polling_results_created, receipt_payloads_created, delivery_receipts_created,
    cloudflare_queue_consumer_enabled, cloudflare_queue_messages_consumed, cloudflare_queue_messages_acked,
    queue_retry_records_created, queue_dead_letter_records_created, queue_payload_bodies_read,
    queue_payload_bodies_created, recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
    provider_send_enabled, provider_responses_created, provider_message_ids_created, created_at
  FROM audience_sequence_delivery_status_webhook_readiness`;
}

async function findDeliveryStatusWebhookReadinessById(db: D1Database, id: string) {
  return db.prepare(`${deliveryStatusWebhookSelect()} WHERE id = ?`).bind(id).first<DeliveryStatusWebhookReadinessReferenceRow>();
}

async function findLatestDeliveryStatusWebhookReadinessForSequence(db: D1Database, sequenceId: string) {
  return db
    .prepare(`${deliveryStatusWebhookSelect()} WHERE sequence_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`)
    .bind(sequenceId)
    .first<DeliveryStatusWebhookReadinessReferenceRow>();
}

async function findProviderPollingReadinessByIdempotency(db: D1Database, idempotencyKey: string) {
  return db.prepare(`${providerPollingSelect()} WHERE idempotency_key = ?`).bind(idempotencyKey).first<ProviderPollingReadinessRow>();
}

export async function getAudienceSequenceProviderPollingReadinessSummary(): Promise<AudienceSequenceProviderPollingReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS provider_polling_readiness_count,
          SUM(CASE WHEN provider_mode LIKE '%dry_run%' THEN 1 ELSE 0 END) AS dry_run_provider_polling_contract_count,
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
        FROM audience_sequence_provider_polling_readiness`,
      )
      .first<Record<string, number | string | null>>();
    const latest = await db.prepare(`${providerPollingSelect()} ORDER BY created_at DESC LIMIT 10`).all<ProviderPollingReadinessRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        providerPollingReadinessRecords: numberValue(counts?.provider_polling_readiness_count),
        dryRunProviderPollingContracts: numberValue(counts?.dry_run_provider_polling_contract_count),
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
      latestRecords: (latest.results ?? []).map((row) => publicProviderPollingReadiness(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence provider-polling readiness.",
    );
  }
}

export async function createAudienceSequenceProviderPollingReadiness(
  input: CreateProviderPollingReadinessInput,
): Promise<CreateProviderPollingReadinessResult> {
  const redaction = emptySummary("d1", null).redaction;
  const deliveryStatusWebhookReadinessId = parseString(input.deliveryStatusWebhookReadinessId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!deliveryStatusWebhookReadinessId || !sequenceId || !expectedWorkspaceRevisionId || !expectedSequenceStatus || expectedReadyEnrollmentCount === null || !idempotencyKey) {
    return { ok: false, status: "invalid_request", message: "A delivery-status webhook readiness ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.", redaction };
  }

  if (input.confirmationText !== audienceSequenceProviderPollingReadinessConfirmationText) {
    return { ok: false, status: "confirmation_required", message: "Exact confirmation text is required before recording sequence provider-polling readiness.", redaction };
  }

  const { db } = await getRuntime();
  const existing = await findProviderPollingReadinessByIdempotency(db, idempotencyKey);
  if (existing) return { ok: true, status: "sequence_provider_polling_readiness_replayed", duplicate: true, record: publicProviderPollingReadiness(existing, true), redaction };

  const deliveryStatusWebhook = await findDeliveryStatusWebhookReadinessById(db, deliveryStatusWebhookReadinessId);
  if (!deliveryStatusWebhook) {
    return { ok: false, status: "delivery_status_webhook_readiness_not_found", message: "A current sequence delivery-status webhook readiness record is required before provider-polling readiness can be recorded.", redaction };
  }

  if (deliveryStatusWebhook.sequence_id !== sequenceId) {
    return { ok: false, status: "stale_delivery_status_webhook_readiness_evidence", message: "The sequence no longer matches the selected delivery-status webhook readiness record.", redaction };
  }

  if (deliveryStatusWebhook.status !== deliveryStatusWebhookRecordStatus) {
    return { ok: false, status: "stale_delivery_status_webhook_readiness_status", message: "The sequence delivery-status webhook readiness status changed before provider-polling readiness was recorded.", redaction, currentDeliveryStatusWebhookReadinessStatus: deliveryStatusWebhook.status };
  }

  const latestDeliveryStatusWebhook = await findLatestDeliveryStatusWebhookReadinessForSequence(db, sequenceId);
  if (!latestDeliveryStatusWebhook || latestDeliveryStatusWebhook.id !== deliveryStatusWebhook.id) {
    return { ok: false, status: "stale_delivery_status_webhook_readiness_evidence", message: "A newer sequence delivery-status webhook readiness record exists for this sequence.", redaction };
  }

  if (!deliveryStatusWebhookHasNoLiveArtifacts(deliveryStatusWebhook)) {
    return { ok: false, status: "provider_polling_gate_not_ready", message: "Sequence provider-polling readiness requires a current dry-run delivery-status webhook readiness record with no provider calls, Queue consumption, acknowledgements, retry/dead-letter rows, payload reads, webhook payloads, provider polling, polling results, receipt payloads, receipts, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, provider message IDs, delivery attempts, delivery results, or status webhooks.", redaction };
  }

  const readiness = await getAudienceSequenceDeliveryReadinessSummary();
  if (readiness.source !== "d1") return { ok: false, status: "readiness_unavailable", message: readiness.loadError ?? "Sequence delivery readiness is unavailable.", redaction };

  const sequence = readiness.records.find((record) => record.sequenceId === sequenceId);
  if (!sequence) return { ok: false, status: "sequence_not_found", message: "The sequence could not be found.", redaction };

  if (readiness.workspace.revisionId !== expectedWorkspaceRevisionId || deliveryStatusWebhook.expected_workspace_revision_id !== expectedWorkspaceRevisionId) {
    return { ok: false, status: "stale_workspace_revision", message: "The audience workspace changed before sequence provider-polling readiness was recorded.", redaction, currentWorkspaceRevisionId: readiness.workspace.revisionId };
  }

  if (sequence.status !== expectedSequenceStatus || deliveryStatusWebhook.expected_sequence_status !== expectedSequenceStatus) {
    return { ok: false, status: "stale_sequence_status", message: "The sequence status changed before sequence provider-polling readiness was recorded.", redaction, currentSequenceStatus: sequence.status };
  }

  if (readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount || numberValue(deliveryStatusWebhook.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount) {
    return { ok: false, status: "stale_readiness_count", message: "Sequence readiness changed before provider-polling readiness was recorded.", redaction, currentReadyEnrollmentCount: readiness.counts.readyEnrollments };
  }

  const recordId = `sequence-provider-polling-readiness-${crypto.randomUUID()}`;
  const columns = [
    "id", "sequence_id", "delivery_status_webhook_readiness_id", "delivery_result_readiness_id",
    "delivery_attempt_readiness_id", "provider_call_readiness_id", "queue_consumer_readiness_id",
    "queue_producer_readiness_id", "dispatch_attempt_id", "dispatch_preflight_id", "delivery_queue_message_id",
    "delivery_batch_id", "schedule_intent_id", "status", "queue_name", "provider_name", "provider_mode",
    "provider_polling_gate_status", "delivery_status_webhook_dependency_status", "provider_response_policy",
    "provider_message_id_policy", "delivery_attempt_policy", "delivery_result_policy", "delivery_status_webhook_policy",
    "provider_polling_policy", "idempotency_policy", "audit_correlation_policy", "backpressure_policy",
    "expected_workspace_revision_id", "expected_sequence_status", "expected_ready_enrollment_count",
    "expected_delivery_status_webhook_readiness_status", "dry_run_message_count", "held_enrollment_count",
    "active_suppression_count", "provider_limit_policy", "provider_rate_limit_window", "dispatch_mode",
    "dispatch_result_status", "suppression_check_status", "unsubscribe_footer_check_status", "sender_domain_gate_status",
    "delivery_status_webhook_enabled", "delivery_attempts_created", "delivery_results_created",
    "delivery_status_webhooks_processed", "delivery_status_webhook_payloads_read", "delivery_status_webhook_payloads_created",
    "provider_polling_enabled", "provider_polling_payloads_read", "provider_polling_payloads_created",
    "provider_polling_results_created", "receipt_payloads_created", "delivery_receipts_created",
    "cloudflare_queue_consumer_enabled", "cloudflare_queue_messages_consumed", "cloudflare_queue_messages_acked",
    "queue_retry_records_created", "queue_dead_letter_records_created", "queue_payload_bodies_read",
    "queue_payload_bodies_created", "recipient_payloads_created", "personalized_bodies_created", "unsubscribe_urls_created",
    "provider_send_enabled", "provider_responses_created", "provider_message_ids_created", "idempotency_key",
    "actor_user_id", "actor_email", "metadata_json",
  ];
  const values = [
    recordId,
    deliveryStatusWebhook.sequence_id,
    deliveryStatusWebhook.id,
    deliveryStatusWebhook.delivery_result_readiness_id,
    deliveryStatusWebhook.delivery_attempt_readiness_id,
    deliveryStatusWebhook.provider_call_readiness_id,
    deliveryStatusWebhook.queue_consumer_readiness_id,
    deliveryStatusWebhook.queue_producer_readiness_id,
    deliveryStatusWebhook.dispatch_attempt_id,
    deliveryStatusWebhook.dispatch_preflight_id,
    deliveryStatusWebhook.delivery_queue_message_id,
    deliveryStatusWebhook.delivery_batch_id,
    deliveryStatusWebhook.schedule_intent_id,
    providerPollingRecordStatus,
    deliveryStatusWebhook.queue_name,
    deliveryStatusWebhook.provider_name,
    "dry_run_contract_only_no_provider_polling",
    "blocked_until_provider_polling_receipt_and_reconciliation_contracts_verified",
    "blocked_until_sequence_delivery_status_webhook_readiness_issue_376_stays_current",
    deliveryStatusWebhook.provider_response_policy,
    deliveryStatusWebhook.provider_message_id_policy,
    deliveryStatusWebhook.delivery_attempt_policy,
    deliveryStatusWebhook.delivery_result_policy,
    deliveryStatusWebhook.delivery_status_webhook_policy,
    "Provider polling stays disabled until provider polling cadence, webhook fallback, receipt payload, retry, suppression, redaction, retention, and audit contracts exist together.",
    "Future provider polling writes must key idempotency by sequence, delivery-status webhook readiness, dispatch attempt, provider, provider message ID policy, poll window, and receipt scope before any provider is polled.",
    "Future provider polling writes must carry redacted audit correlation from schedule intent through delivery batch, queue-message evidence, dispatch preflight, dispatch attempt, Queue readiness, provider-call readiness, delivery-attempt readiness, delivery-result readiness, delivery-status webhook readiness, and provider-polling readiness.",
    "Provider polling backpressure must fail closed when provider polling cadence, webhook fallback, retry/dead-letter capacity, receipt capacity, or suppression capacity are not explicit.",
    readiness.workspace.revisionId,
    sequence.status,
    expectedReadyEnrollmentCount,
    audienceSequenceDeliveryStatusWebhookReadinessStatus,
    numberValue(deliveryStatusWebhook.dry_run_message_count),
    numberValue(deliveryStatusWebhook.held_enrollment_count),
    numberValue(deliveryStatusWebhook.active_suppression_count),
    deliveryStatusWebhook.provider_limit_policy,
    deliveryStatusWebhook.provider_rate_limit_window,
    deliveryStatusWebhook.dispatch_mode,
    deliveryStatusWebhook.dispatch_result_status,
    deliveryStatusWebhook.suppression_check_status,
    deliveryStatusWebhook.unsubscribe_footer_check_status,
    deliveryStatusWebhook.sender_domain_gate_status,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    idempotencyKey,
    input.actor.userId,
    input.actor.email,
    JSON.stringify({
      issue: audienceSequenceProviderPollingReadinessIssue,
      deliveryStatusWebhookReadinessId: deliveryStatusWebhook.id,
      deliveryResultReadinessId: deliveryStatusWebhook.delivery_result_readiness_id,
      deliveryAttemptReadinessId: deliveryStatusWebhook.delivery_attempt_readiness_id,
      providerCallReadinessId: deliveryStatusWebhook.provider_call_readiness_id,
      queueConsumerReadinessId: deliveryStatusWebhook.queue_consumer_readiness_id,
      queueProducerReadinessId: deliveryStatusWebhook.queue_producer_readiness_id,
      dispatchAttemptId: deliveryStatusWebhook.dispatch_attempt_id,
      dispatchPreflightId: deliveryStatusWebhook.dispatch_preflight_id,
      deliveryQueueMessageId: deliveryStatusWebhook.delivery_queue_message_id,
      deliveryBatchId: deliveryStatusWebhook.delivery_batch_id,
      scheduleIntentId: deliveryStatusWebhook.schedule_intent_id,
      providerPollingEnabled: false,
      providerPollingPayloadsRead: false,
      providerPollingPayloadsCreated: false,
      providerPollingResultsCreated: false,
      privateContactDataIncluded: false,
    }),
  ];
  await db.prepare(`INSERT INTO audience_sequence_provider_polling_readiness (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`).bind(...values).run();

  const record = await findProviderPollingReadinessByIdempotency(db, idempotencyKey);
  if (!record) return { ok: false, status: "provider_polling_readiness_not_created", message: "The sequence provider-polling readiness record could not be saved.", redaction };

  return { ok: true, status: "sequence_provider_polling_readiness_recorded", duplicate: false, record: publicProviderPollingReadiness(record, false), redaction };
}
