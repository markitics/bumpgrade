import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";

export const audienceSequenceQueueProducerReadinessIssue = 366;
export const audienceSequenceQueueProducerReadinessStatus = "sequence-queue-producer-readiness-ready";
export const audienceSequenceQueueProducerReadinessApiRoute =
  "/api/admin/audience/sequences/queue-producer-readiness";
export const audienceSequenceQueueProducerReadinessConfirmationText =
  "Record Bumpgrade sequence Queue producer readiness gate";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceDispatchAttemptRow = {
  id: string;
  sequence_id: string;
  dispatch_preflight_id: string;
  delivery_queue_message_id: string;
  delivery_batch_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  queue_mode: string;
  queue_producer_mode: string;
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
  idempotency_key: string;
  created_at: number | string | null;
};

export type AudienceSequenceQueueProducerReadinessPublic = {
  id: string;
  sequenceId: string;
  dispatchAttemptId: string;
  dispatchPreflightId: string;
  deliveryQueueMessageId: string;
  deliveryBatchId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  producerBinding: string;
  producerMode: string;
  producerGateStatus: string;
  payloadDependencyStatus: string;
  consumerDependencyStatus: string;
  idempotencyPolicy: string;
  auditCorrelationPolicy: string;
  retryBackpressurePolicy: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
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
  cloudflareQueueProducerEnabled: false;
  cloudflareQueueMessagesCreated: false;
  queuePayloadBodiesCreated: false;
  recipientPayloadsCreated: false;
  personalizedBodiesCreated: false;
  unsubscribeUrlsCreated: false;
  providerSendEnabled: false;
  providerResponsesIncluded: false;
  providerMessageIdsIncluded: false;
  createdAt: string | null;
};

export type AudienceSequenceQueueProducerReadinessSummary = {
  id: "audience-sequence-queue-producer-readiness-contract";
  status: typeof audienceSequenceQueueProducerReadinessStatus;
  issue: typeof audienceSequenceQueueProducerReadinessIssue;
  parentIssue: 17;
  apiRoute: typeof audienceSequenceQueueProducerReadinessApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceQueueProducerReadinessConfirmationText;
  };
  counts: {
    queueProducerReadinessRecords: number;
    dryRunProducerContracts: number;
    dryRunMessagesSnapshotted: number;
    heldEnrollmentsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    cloudflareQueueProducerEnabledRecords: number;
    cloudflareQueueMessagesCreatedRecords: number;
    queuePayloadBodiesCreatedRecords: number;
    recipientPayloadsCreatedRecords: number;
    personalizedBodiesCreatedRecords: number;
    unsubscribeUrlsCreatedRecords: number;
    providerSendEnabledRecords: number;
    providerResponsesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
  };
  latestRecords: AudienceSequenceQueueProducerReadinessPublic[];
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
    cloudflareQueueProducersEnabled: false;
    cloudflareQueueMessagesCreated: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateSequenceQueueProducerReadinessInput = {
  dispatchAttemptId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateSequenceQueueProducerReadinessResult =
  | {
      ok: true;
      status: "sequence_queue_producer_readiness_recorded" | "sequence_queue_producer_readiness_replayed";
      duplicate: boolean;
      record: AudienceSequenceQueueProducerReadinessPublic;
      redaction: AudienceSequenceQueueProducerReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "dispatch_attempt_not_found"
        | "sequence_not_found"
        | "readiness_unavailable"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "producer_gate_not_ready"
        | "queue_producer_readiness_not_created";
      message: string;
      redaction: AudienceSequenceQueueProducerReadinessSummary["redaction"];
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

function publicSequenceQueueProducerReadiness(
  row: SequenceQueueProducerReadinessRow,
  duplicate: boolean,
): AudienceSequenceQueueProducerReadinessPublic {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    dispatchAttemptId: row.dispatch_attempt_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    deliveryQueueMessageId: row.delivery_queue_message_id,
    deliveryBatchId: row.delivery_batch_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    producerBinding: row.producer_binding,
    producerMode: row.producer_mode,
    producerGateStatus: row.producer_gate_status,
    payloadDependencyStatus: row.payload_dependency_status,
    consumerDependencyStatus: row.consumer_dependency_status,
    idempotencyPolicy: row.idempotency_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    retryBackpressurePolicy: row.retry_backpressure_policy,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
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
    cloudflareQueueProducerEnabled: false,
    cloudflareQueueMessagesCreated: false,
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
  source: AudienceSequenceQueueProducerReadinessSummary["source"],
  loadError: string | null,
): AudienceSequenceQueueProducerReadinessSummary {
  return {
    id: "audience-sequence-queue-producer-readiness-contract",
    status: audienceSequenceQueueProducerReadinessStatus,
    issue: audienceSequenceQueueProducerReadinessIssue,
    parentIssue: 17,
    apiRoute: audienceSequenceQueueProducerReadinessApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceQueueProducerReadinessConfirmationText,
    },
    counts: {
      queueProducerReadinessRecords: 0,
      dryRunProducerContracts: 0,
      dryRunMessagesSnapshotted: 0,
      heldEnrollmentsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      cloudflareQueueProducerEnabledRecords: 0,
      cloudflareQueueMessagesCreatedRecords: 0,
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
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
      bodyTemplatesIncluded: false,
      unsubscribeUrlsIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      cloudflareQueueProducersEnabled: false,
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
      "Issue #366 lets verified owners record sequence Queue producer readiness gates from a current sequence dispatch attempt after exact confirmation, idempotency, workspace revision, sequence status, readiness, dry-run dispatch, suppression, unsubscribe-footer, sender-domain, provider-limit, payload, consumer, and audit checks. It does not enable Cloudflare Queue producers, create Queue messages, create queue payload bodies, create delivery queue rows, create recipient payloads, create personalized bodies, expose body templates or unsubscribe URLs, call providers, create provider responses, create provider message IDs, expose private recipients, or authorize direct public agent sequence writes.",
  };
}

async function findDispatchAttemptById(db: D1Database, dispatchAttemptId: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id,
        schedule_intent_id, status, queue_name, queue_mode, queue_producer_mode,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        dry_run_message_count, held_enrollment_count, active_suppression_count,
        provider_limit_policy, provider_rate_limit_window, dispatch_mode, dispatch_result_status,
        suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
        audit_correlation_policy, provider_send_enabled, delivery_queue_rows_created,
        cloudflare_queue_messages_created, queue_payload_bodies_created, recipient_payloads_created,
        personalized_bodies_created, unsubscribe_urls_created, provider_responses_created,
        provider_message_ids_created
      FROM audience_sequence_dispatch_attempts
      WHERE id = ?`,
    )
    .bind(dispatchAttemptId)
    .first<SequenceDispatchAttemptRow>();
}

async function findQueueProducerReadinessByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
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
        provider_message_ids_created, idempotency_key, created_at
      FROM audience_sequence_queue_producer_readiness
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<SequenceQueueProducerReadinessRow>();
}

export async function getAudienceSequenceQueueProducerReadinessSummary(): Promise<AudienceSequenceQueueProducerReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS queue_producer_readiness_count,
          SUM(CASE WHEN producer_mode LIKE '%dry_run%' THEN 1 ELSE 0 END) AS dry_run_producer_contract_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_enrollment_count), 0) AS held_enrollment_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN cloudflare_queue_producer_enabled > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_producer_enabled_count,
          SUM(CASE WHEN cloudflare_queue_messages_created > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_messages_created_count,
          SUM(CASE WHEN queue_payload_bodies_created > 0 THEN 1 ELSE 0 END) AS queue_payload_bodies_created_count,
          SUM(CASE WHEN recipient_payloads_created > 0 THEN 1 ELSE 0 END) AS recipient_payloads_created_count,
          SUM(CASE WHEN personalized_bodies_created > 0 THEN 1 ELSE 0 END) AS personalized_bodies_created_count,
          SUM(CASE WHEN unsubscribe_urls_created > 0 THEN 1 ELSE 0 END) AS unsubscribe_urls_created_count,
          SUM(CASE WHEN provider_send_enabled > 0 THEN 1 ELSE 0 END) AS provider_send_enabled_count,
          SUM(CASE WHEN provider_responses_created > 0 THEN 1 ELSE 0 END) AS provider_responses_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count
        FROM audience_sequence_queue_producer_readiness`,
      )
      .first<{
        queue_producer_readiness_count: number | string | null;
        dry_run_producer_contract_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_enrollment_count: number | string | null;
        active_suppression_count: number | string | null;
        cloudflare_queue_producer_enabled_count: number | string | null;
        cloudflare_queue_messages_created_count: number | string | null;
        queue_payload_bodies_created_count: number | string | null;
        recipient_payloads_created_count: number | string | null;
        personalized_bodies_created_count: number | string | null;
        unsubscribe_urls_created_count: number | string | null;
        provider_send_enabled_count: number | string | null;
        provider_responses_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
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
          provider_message_ids_created, idempotency_key, created_at
        FROM audience_sequence_queue_producer_readiness
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<SequenceQueueProducerReadinessRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        queueProducerReadinessRecords: numberValue(counts?.queue_producer_readiness_count),
        dryRunProducerContracts: numberValue(counts?.dry_run_producer_contract_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldEnrollmentsSnapshotted: numberValue(counts?.held_enrollment_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        cloudflareQueueProducerEnabledRecords: numberValue(counts?.cloudflare_queue_producer_enabled_count),
        cloudflareQueueMessagesCreatedRecords: numberValue(counts?.cloudflare_queue_messages_created_count),
        queuePayloadBodiesCreatedRecords: numberValue(counts?.queue_payload_bodies_created_count),
        recipientPayloadsCreatedRecords: numberValue(counts?.recipient_payloads_created_count),
        personalizedBodiesCreatedRecords: numberValue(counts?.personalized_bodies_created_count),
        unsubscribeUrlsCreatedRecords: numberValue(counts?.unsubscribe_urls_created_count),
        providerSendEnabledRecords: numberValue(counts?.provider_send_enabled_count),
        providerResponsesCreatedRecords: numberValue(counts?.provider_responses_created_count),
        providerMessageIdsCreatedRecords: numberValue(counts?.provider_message_ids_created_count),
      },
      latestRecords: (latest.results ?? []).map((row) => publicSequenceQueueProducerReadiness(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence Queue producer readiness.",
    );
  }
}

export async function createAudienceSequenceQueueProducerReadiness(
  input: CreateSequenceQueueProducerReadinessInput,
): Promise<CreateSequenceQueueProducerReadinessResult> {
  const redaction = emptySummary("d1", null).redaction;
  const dispatchAttemptId = parseString(input.dispatchAttemptId);
  const sequenceId = parseString(input.sequenceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !dispatchAttemptId ||
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
        "A dispatch attempt ID, sequence ID, expected workspace revision, expected sequence status, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceQueueProducerReadinessConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording sequence Queue producer readiness.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findQueueProducerReadinessByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_queue_producer_readiness_replayed",
      duplicate: true,
      record: publicSequenceQueueProducerReadiness(existing, true),
      redaction,
    };
  }

  const attempt = await findDispatchAttemptById(db, dispatchAttemptId);
  if (
    !attempt ||
    attempt.status !== "dispatch_attempt_dry_run_recorded" ||
    attempt.sequence_id !== sequenceId
  ) {
    return {
      ok: false,
      status: "dispatch_attempt_not_found",
      message:
        "A current dry-run sequence dispatch attempt receipt is required before Queue producer readiness can be recorded.",
      redaction,
    };
  }

  if (
    attempt.queue_mode !== "dry_run_contract" ||
    attempt.queue_producer_mode !== "dry_run_receipt_only_no_cloudflare_queue_producer" ||
    numberValue(attempt.provider_send_enabled) > 0 ||
    numberValue(attempt.delivery_queue_rows_created) > 0 ||
    numberValue(attempt.cloudflare_queue_messages_created) > 0 ||
    numberValue(attempt.queue_payload_bodies_created) > 0 ||
    numberValue(attempt.recipient_payloads_created) > 0 ||
    numberValue(attempt.personalized_bodies_created) > 0 ||
    numberValue(attempt.unsubscribe_urls_created) > 0 ||
    numberValue(attempt.provider_responses_created) > 0 ||
    numberValue(attempt.provider_message_ids_created) > 0
  ) {
    return {
      ok: false,
      status: "producer_gate_not_ready",
      message:
        "Sequence Queue producer readiness requires a dry-run dispatch attempt with no Queue messages, payload bodies, recipient payloads, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
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
    attempt.expected_workspace_revision_id !== expectedWorkspaceRevisionId
  ) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before sequence Queue producer readiness was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequence.status !== expectedSequenceStatus || attempt.expected_sequence_status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The sequence status changed before sequence Queue producer readiness was recorded.",
      redaction,
      currentSequenceStatus: sequence.status,
    };
  }

  if (
    readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount ||
    numberValue(attempt.expected_ready_enrollment_count) !== expectedReadyEnrollmentCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before Queue producer readiness was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const recordId = `sequence-queue-producer-readiness-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_sequence_queue_producer_readiness (
        id, sequence_id, dispatch_attempt_id, dispatch_preflight_id, delivery_queue_message_id,
        delivery_batch_id, schedule_intent_id, status, queue_name, producer_binding, producer_mode,
        producer_gate_status, payload_dependency_status, consumer_dependency_status,
        idempotency_policy, audit_correlation_policy, retry_backpressure_policy,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        dry_run_message_count, held_enrollment_count, active_suppression_count,
        provider_limit_policy, provider_rate_limit_window, dispatch_mode, dispatch_result_status,
        suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
        cloudflare_queue_producer_enabled, cloudflare_queue_messages_created, queue_payload_bodies_created,
        recipient_payloads_created, personalized_bodies_created, unsubscribe_urls_created,
        provider_send_enabled, provider_responses_created, provider_message_ids_created,
        idempotency_key, actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'sequence_queue_producer_readiness_recorded', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      attempt.sequence_id,
      attempt.id,
      attempt.dispatch_preflight_id,
      attempt.delivery_queue_message_id,
      attempt.delivery_batch_id,
      attempt.schedule_intent_id,
      attempt.queue_name,
      "AUDIENCE_SEQUENCE_DELIVERY_QUEUE",
      "dry_run_contract_only_no_cloudflare_queue_producer",
      "blocked_until_sequence_payload_and_consumer_contracts_verified",
      "blocked_until_sequence_send_payload_readiness_can_create_recipient_payloads_without_public_identity_leak",
      "blocked_until_sequence_queue_consumer_idempotency_retry_and_dead_letter_contracts_exist",
      "Future producer writes must use sequence id, dispatch attempt id, delivery queue message id, recipient scope, and idempotency key before any Queue message is created.",
      "Future producer writes must carry redacted audit correlation from schedule intent through delivery batch, queue-message evidence, dispatch preflight, dispatch attempt, and Queue producer readiness.",
      "Producer backpressure must fail closed when provider rate-limit, Queue consumer, retry, or dead-letter capacity is not explicit.",
      readiness.workspace.revisionId,
      sequence.status,
      expectedReadyEnrollmentCount,
      numberValue(attempt.dry_run_message_count),
      numberValue(attempt.held_enrollment_count),
      readiness.counts.activeSuppressionEntries,
      attempt.provider_limit_policy,
      attempt.provider_rate_limit_window,
      attempt.dispatch_mode,
      attempt.dispatch_result_status,
      attempt.suppression_check_status,
      attempt.unsubscribe_footer_check_status,
      attempt.sender_domain_gate_status,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceSequenceQueueProducerReadinessIssue,
        dispatchAttemptId: attempt.id,
        dispatchPreflightId: attempt.dispatch_preflight_id,
        deliveryQueueMessageId: attempt.delivery_queue_message_id,
        deliveryBatchId: attempt.delivery_batch_id,
        scheduleIntentId: attempt.schedule_intent_id,
        cloudflareQueueProducerEnabled: false,
        cloudflareQueueMessagesCreated: false,
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

  const record = await findQueueProducerReadinessByIdempotency(db, idempotencyKey);
  if (!record) {
    return {
      ok: false,
      status: "queue_producer_readiness_not_created",
      message: "The sequence Queue producer readiness record could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "sequence_queue_producer_readiness_recorded",
    duplicate: false,
    record: publicSequenceQueueProducerReadiness(record, false),
    redaction,
  };
}
