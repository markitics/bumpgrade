import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/analytics-events";
import { audienceAutomationWorkspace, type EmailSequenceStep } from "@/lib/audience-automation";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";
import {
  audienceSequenceTestSendApiRoute,
  audienceSequenceTestSendConfirmationText,
  audienceSequenceTestSendIssue,
  audienceSequenceTestSendStatus,
} from "@/lib/audience-sequence-test-send-constants";
import { sendTransactionalEmail, simpleEmailHtml, type TransactionalEmailSendResult } from "@/lib/email";

export {
  audienceSequenceTestSendApiRoute,
  audienceSequenceTestSendConfirmationText,
  audienceSequenceTestSendIssue,
  audienceSequenceTestSendStatus,
  audienceSequenceTestSendUpdatedAt,
} from "@/lib/audience-sequence-test-send-constants";

type AudienceRuntime = {
  db: D1Database;
};

type SequenceTestSendRow = {
  id: string;
  sequence_id: string;
  step_id: string;
  status: string;
  recipient_scope: string;
  recipient_email_hash: string;
  subject_line: string;
  preview_text: string;
  expected_workspace_revision_id: string;
  expected_sequence_status: string;
  expected_ready_enrollment_count: number | string | null;
  provider: string;
  provider_ok: number | string | null;
  provider_error: string | null;
  owner_test_email_attempted: number | string | null;
  subscriber_payloads_created: number | string | null;
  public_agent_send_created: number | string | null;
  queue_messages_created: number | string | null;
  provider_message_ids_created: number | string | null;
  raw_recipient_email_stored: number | string | null;
  raw_email_body_stored: number | string | null;
  idempotency_key: string;
  audit_correlation_id: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  confirmation_text_sha256: string;
  created_at: number | string | null;
};

export type AudienceSequenceTestSend = {
  id: string;
  sequenceId: string;
  stepId: string;
  status: string;
  recipientScope: "verified-owner-session-email-only";
  subjectLine: string;
  previewText: string;
  expectedWorkspaceRevisionId: string;
  expectedSequenceStatus: string;
  expectedReadyEnrollmentCount: number;
  provider: string;
  providerOk: boolean;
  ownerTestEmailSent: boolean;
  ownerTestEmailCaptured: boolean;
  developmentNoop: boolean;
  duplicate: boolean;
  auditCorrelationId: string;
  subscriberPayloadsCreated: false;
  publicAgentSendCreated: false;
  queueMessagesCreated: false;
  providerMessageIdsIncluded: false;
  rawRecipientEmailStored: false;
  rawEmailBodyStored: false;
  createdAt: string | null;
};

export type AudienceSequenceTestSendSummary = {
  id: "audience-sequence-owner-test-send-contract";
  status: typeof audienceSequenceTestSendStatus;
  issue: typeof audienceSequenceTestSendIssue;
  parentIssue: 420;
  apiRoute: typeof audienceSequenceTestSendApiRoute;
  ownerRoute: "/admin/audience";
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceSequenceTestSendConfirmationText;
  };
  auth: {
    required: true;
    boundary: "owner-session";
    acceptedRoles: ["owner"];
  };
  allowedRecipientScope: "verified-owner-session-email-only";
  counts: {
    testSends: number;
    providerOkRows: number;
    providerFailedRows: number;
    cloudflareBindingSends: number;
    testCaptures: number;
    developmentNoops: number;
    subscriberPayloadsCreatedRecords: number;
    publicAgentSendCreatedRecords: number;
    queueMessagesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
    rawRecipientEmailStoredRecords: number;
    rawEmailBodyStoredRecords: number;
  };
  latestTestSends: AudienceSequenceTestSend[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientEmailHashesIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    actorUserIdIncluded: false;
    idempotencyKeysIncluded: false;
    confirmationTextHashesIncluded: false;
    providerErrorIncluded: false;
    providerMessageIdsIncluded: false;
    rawEmailBodyIncluded: false;
    subscriberPayloadsIncluded: false;
    queuePayloadsIncluded: false;
    publicAgentSendCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateSequenceTestSendInput = {
  sequenceId?: unknown;
  stepId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  auditCorrelationId?: unknown;
  actor: AdminIdentity;
};

type CreateSequenceTestSendResult =
  | {
      ok: true;
      status: "sequence_owner_test_send_recorded" | "sequence_owner_test_send_replayed";
      duplicate: boolean;
      testSend: AudienceSequenceTestSend;
      redaction: AudienceSequenceTestSendSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "owner_email_required"
        | "confirmation_required"
        | "readiness_unavailable"
        | "sequence_not_found"
        | "sequence_step_not_found"
        | "stale_workspace_revision"
        | "stale_sequence_status"
        | "stale_readiness_count"
        | "email_send_failed"
        | "test_send_not_created";
      message: string;
      redaction: AudienceSequenceTestSendSummary["redaction"];
      currentWorkspaceRevisionId?: string | null;
      currentSequenceStatus?: string | null;
      currentReadyEnrollmentCount?: number;
      testSend?: AudienceSequenceTestSend;
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

function booleanValue(value: number | string | null | undefined) {
  return numberValue(value) === 1;
}

function timestampValue(value: number | string | null | undefined) {
  const seconds = numberValue(value);
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function parseString(value: unknown, maxLength = 240) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

function parseInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeOwnerEmail(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized.includes("@") ? normalized : null;
}

function providerStatus(result: TransactionalEmailSendResult) {
  if (!result.ok) return "owner_sequence_test_send_failed";
  if (result.provider === "cloudflare-binding") return "owner_sequence_test_send_sent";
  if (result.provider === "test") return "owner_sequence_test_send_captured";
  return "owner_sequence_test_send_development_noop";
}

function providerErrorCode(result: TransactionalEmailSendResult) {
  if (result.ok) return null;
  return result.provider === "not-configured" ? "email_binding_not_configured" : "email_provider_send_failed";
}

function sequenceStep(sequenceId: string, stepId: string) {
  const sequence = audienceAutomationWorkspace.sequences.find((candidate) => candidate.id === sequenceId) ?? null;
  if (!sequence) return { sequence: null, step: null };
  return {
    sequence,
    step: sequence.steps.find((candidate) => candidate.id === stepId) ?? null,
  };
}

function emptySummary(
  source: AudienceSequenceTestSendSummary["source"],
  loadError: string | null,
): AudienceSequenceTestSendSummary {
  return {
    id: "audience-sequence-owner-test-send-contract",
    status: audienceSequenceTestSendStatus,
    issue: audienceSequenceTestSendIssue,
    parentIssue: 420,
    apiRoute: audienceSequenceTestSendApiRoute,
    ownerRoute: "/admin/audience",
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceSequenceTestSendConfirmationText,
    },
    auth: {
      required: true,
      boundary: "owner-session",
      acceptedRoles: ["owner"],
    },
    allowedRecipientScope: "verified-owner-session-email-only",
    counts: {
      testSends: 0,
      providerOkRows: 0,
      providerFailedRows: 0,
      cloudflareBindingSends: 0,
      testCaptures: 0,
      developmentNoops: 0,
      subscriberPayloadsCreatedRecords: 0,
      publicAgentSendCreatedRecords: 0,
      queueMessagesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
      rawRecipientEmailStoredRecords: 0,
      rawEmailBodyStoredRecords: 0,
    },
    latestTestSends: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientEmailHashesIncluded: false,
      actorEmailIncluded: false,
      actorEmailHashIncluded: false,
      actorUserIdIncluded: false,
      idempotencyKeysIncluded: false,
      confirmationTextHashesIncluded: false,
      providerErrorIncluded: false,
      providerMessageIdsIncluded: false,
      rawEmailBodyIncluded: false,
      subscriberPayloadsIncluded: false,
      queuePayloadsIncluded: false,
      publicAgentSendCreated: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientEmailHash",
      "actorEmail",
      "actorEmailHash",
      "actorUserId",
      "idempotencyKey",
      "confirmationTextSha256",
      "providerError",
      "providerMessageId",
      "rawEmailBody",
      "subscriberPayload",
      "queuePayload",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #420 lets verified owners send one controlled sequence-step test email only to the verified owner-session email after exact confirmation, idempotency, audit correlation, workspace revision checks, sequence status checks, readiness-count checks, and D1 evidence. It does not send to subscribers, create recipient payloads, dispatch or consume Cloudflare Queue messages, expose raw recipient email, expose email bodies in source-data, create provider message IDs, or authorize public agent sequence sends.",
  };
}

function publicTestSend(row: SequenceTestSendRow, duplicate: boolean): AudienceSequenceTestSend {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    stepId: row.step_id,
    status: row.status,
    recipientScope: "verified-owner-session-email-only",
    subjectLine: row.subject_line,
    previewText: row.preview_text,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedSequenceStatus: row.expected_sequence_status,
    expectedReadyEnrollmentCount: numberValue(row.expected_ready_enrollment_count),
    provider: row.provider,
    providerOk: booleanValue(row.provider_ok),
    ownerTestEmailSent: row.provider === "cloudflare-binding" && booleanValue(row.provider_ok),
    ownerTestEmailCaptured: row.provider === "test" && booleanValue(row.provider_ok),
    developmentNoop: row.provider === "development" && booleanValue(row.provider_ok),
    duplicate,
    auditCorrelationId: row.audit_correlation_id,
    subscriberPayloadsCreated: false,
    publicAgentSendCreated: false,
    queueMessagesCreated: false,
    providerMessageIdsIncluded: false,
    rawRecipientEmailStored: false,
    rawEmailBodyStored: false,
    createdAt: timestampValue(row.created_at),
  };
}

async function findTestSendByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, sequence_id, step_id, status, recipient_scope, recipient_email_hash, subject_line, preview_text,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        provider, provider_ok, provider_error, owner_test_email_attempted, subscriber_payloads_created,
        public_agent_send_created, queue_messages_created, provider_message_ids_created,
        raw_recipient_email_stored, raw_email_body_stored, idempotency_key, audit_correlation_id,
        actor_user_id, actor_email_hash, confirmation_text_sha256, created_at
      FROM audience_sequence_test_sends
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<SequenceTestSendRow>();
}

export async function getAudienceSequenceTestSendSummary(): Promise<AudienceSequenceTestSendSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS test_sends,
          COALESCE(SUM(CASE WHEN provider_ok = 1 THEN 1 ELSE 0 END), 0) AS provider_ok_rows,
          COALESCE(SUM(CASE WHEN provider_ok = 0 THEN 1 ELSE 0 END), 0) AS provider_failed_rows,
          COALESCE(SUM(CASE WHEN provider = 'cloudflare-binding' AND provider_ok = 1 THEN 1 ELSE 0 END), 0) AS cloudflare_binding_sends,
          COALESCE(SUM(CASE WHEN provider = 'test' AND provider_ok = 1 THEN 1 ELSE 0 END), 0) AS test_captures,
          COALESCE(SUM(CASE WHEN provider = 'development' AND provider_ok = 1 THEN 1 ELSE 0 END), 0) AS development_noops,
          COALESCE(SUM(subscriber_payloads_created), 0) AS subscriber_payloads_created_records,
          COALESCE(SUM(public_agent_send_created), 0) AS public_agent_send_created_records,
          COALESCE(SUM(queue_messages_created), 0) AS queue_messages_created_records,
          COALESCE(SUM(provider_message_ids_created), 0) AS provider_message_ids_created_records,
          COALESCE(SUM(raw_recipient_email_stored), 0) AS raw_recipient_email_stored_records,
          COALESCE(SUM(raw_email_body_stored), 0) AS raw_email_body_stored_records
        FROM audience_sequence_test_sends`,
      )
      .first<Record<string, number | string | null>>();
    const rows = await db
      .prepare(
        `SELECT
          id, sequence_id, step_id, status, recipient_scope, recipient_email_hash, subject_line, preview_text,
          expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
          provider, provider_ok, provider_error, owner_test_email_attempted, subscriber_payloads_created,
          public_agent_send_created, queue_messages_created, provider_message_ids_created,
          raw_recipient_email_stored, raw_email_body_stored, idempotency_key, audit_correlation_id,
          actor_user_id, actor_email_hash, confirmation_text_sha256, created_at
        FROM audience_sequence_test_sends
        ORDER BY created_at DESC, id DESC
        LIMIT 5`,
      )
      .all<SequenceTestSendRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        testSends: numberValue(counts?.test_sends),
        providerOkRows: numberValue(counts?.provider_ok_rows),
        providerFailedRows: numberValue(counts?.provider_failed_rows),
        cloudflareBindingSends: numberValue(counts?.cloudflare_binding_sends),
        testCaptures: numberValue(counts?.test_captures),
        developmentNoops: numberValue(counts?.development_noops),
        subscriberPayloadsCreatedRecords: numberValue(counts?.subscriber_payloads_created_records),
        publicAgentSendCreatedRecords: numberValue(counts?.public_agent_send_created_records),
        queueMessagesCreatedRecords: numberValue(counts?.queue_messages_created_records),
        providerMessageIdsCreatedRecords: numberValue(counts?.provider_message_ids_created_records),
        rawRecipientEmailStoredRecords: numberValue(counts?.raw_recipient_email_stored_records),
        rawEmailBodyStoredRecords: numberValue(counts?.raw_email_body_stored_records),
      },
      latestTestSends: (rows.results ?? []).map((row) => publicTestSend(row, false)),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience sequence test sends.",
    );
  }
}

function buildOwnerSequenceTestSendEmail(input: {
  to: string;
  sequenceTitle: string;
  sequenceId: string;
  step: EmailSequenceStep;
  expectedReadyEnrollmentCount: number;
  auditCorrelationId: string;
}) {
  const subject = `[Bumpgrade sequence test] ${input.step.subjectIntent}`;
  const preview = `${input.sequenceTitle}: ${input.step.goal}`;
  const text = [
    `Bumpgrade owner sequence test send for ${input.sequenceTitle}.`,
    "",
    `Sequence ID: ${input.sequenceId}`,
    `Step ID: ${input.step.id}`,
    `Subject intent: ${input.step.subjectIntent}`,
    `Step timing: ${input.step.timing}${input.step.delayValue ? ` ${input.step.delayValue}` : ""}`,
    `Goal: ${input.step.goal}`,
    `Ready enrollments checked: ${input.expectedReadyEnrollmentCount}`,
    `Audit correlation: ${input.auditCorrelationId}`,
    "",
    "This test was sent only to the verified owner session email.",
    "It did not create subscriber payloads, dispatch or consume Cloudflare Queue messages, or create provider message IDs.",
  ].join("\n");

  return {
    to: input.to,
    subject,
    text,
    html: simpleEmailHtml(subject, text, "Open admin audience", "https://bumpgrade.com/admin/audience"),
    headers: {
      "X-Bumpgrade-Audit-Correlation-Id": input.auditCorrelationId,
      "X-Bumpgrade-Sequence-Id": input.sequenceId,
      "X-Bumpgrade-Sequence-Step-Id": input.step.id,
      "X-Bumpgrade-Test-Send": "owner-only-sequence",
    },
    preview,
  };
}

export async function createAudienceSequenceTestSend(
  input: CreateSequenceTestSendInput,
): Promise<CreateSequenceTestSendResult> {
  const redaction = emptySummary("d1", null).redaction;
  const sequenceId = parseString(input.sequenceId);
  const stepId = parseString(input.stepId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedSequenceStatus = parseString(input.expectedSequenceStatus);
  const expectedReadyEnrollmentCount = parseInteger(input.expectedReadyEnrollmentCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;
  const auditCorrelationId = parseString(input.auditCorrelationId, 160);
  const ownerEmail = normalizeOwnerEmail(input.actor.email);

  if (
    !sequenceId ||
    !stepId ||
    !expectedWorkspaceRevisionId ||
    !expectedSequenceStatus ||
    expectedReadyEnrollmentCount === null ||
    !idempotencyKey ||
    !auditCorrelationId
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "A sequence ID, step ID, expected workspace revision, expected sequence status, expected readiness count, idempotency key, and audit correlation ID are required.",
      redaction,
    };
  }

  if (!ownerEmail) {
    return {
      ok: false,
      status: "owner_email_required",
      message: "A verified owner session email is required before sending an owner-only sequence test.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceSequenceTestSendConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before sending an owner-only sequence test.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findTestSendByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "sequence_owner_test_send_replayed",
      duplicate: true,
      testSend: publicTestSend(existing, true),
      redaction,
    };
  }

  const readiness = await getAudienceSequenceDeliveryReadinessSummary();
  if (readiness.source !== "d1") {
    return {
      ok: false,
      status: "readiness_unavailable",
      message: readiness.loadError ?? "Sequence readiness is unavailable.",
      redaction,
    };
  }

  const sequenceRecord = readiness.records.find((candidate) => candidate.sequenceId === sequenceId);
  if (!sequenceRecord) {
    return {
      ok: false,
      status: "sequence_not_found",
      message: "The audience sequence could not be found.",
      redaction,
    };
  }

  const { sequence, step } = sequenceStep(sequenceId, stepId);
  if (!sequence || !step) {
    return {
      ok: false,
      status: "sequence_step_not_found",
      message: "The audience sequence step could not be found.",
      redaction,
    };
  }

  if (readiness.workspace.revisionId !== expectedWorkspaceRevisionId) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace changed before the owner sequence test send was recorded.",
      redaction,
      currentWorkspaceRevisionId: readiness.workspace.revisionId,
    };
  }

  if (sequenceRecord.status !== expectedSequenceStatus) {
    return {
      ok: false,
      status: "stale_sequence_status",
      message: "The audience sequence status changed before the owner sequence test send was recorded.",
      redaction,
      currentSequenceStatus: sequenceRecord.status,
    };
  }

  if (readiness.counts.readyEnrollments !== expectedReadyEnrollmentCount) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Sequence readiness changed before the owner sequence test send was recorded.",
      redaction,
      currentReadyEnrollmentCount: readiness.counts.readyEnrollments,
    };
  }

  const email = buildOwnerSequenceTestSendEmail({
    to: ownerEmail,
    sequenceTitle: sequence.title,
    sequenceId,
    step,
    expectedReadyEnrollmentCount,
    auditCorrelationId,
  });
  const sendResult = await sendTransactionalEmail(email);
  const recipientEmailHash = await sha256Hex(ownerEmail);
  const actorEmailHash = await sha256Hex(ownerEmail);
  const confirmationTextSha256 = await sha256Hex(audienceSequenceTestSendConfirmationText);
  const testSendId = `sequence-owner-test-send-${crypto.randomUUID()}`;
  const providerOk = sendResult.ok ? 1 : 0;

  await db
    .prepare(
      `INSERT INTO audience_sequence_test_sends (
        id, sequence_id, step_id, status, recipient_scope, recipient_email_hash, subject_line, preview_text,
        expected_workspace_revision_id, expected_sequence_status, expected_ready_enrollment_count,
        provider, provider_ok, provider_error, owner_test_email_attempted, subscriber_payloads_created,
        public_agent_send_created, queue_messages_created, provider_message_ids_created,
        raw_recipient_email_stored, raw_email_body_stored, idempotency_key, audit_correlation_id,
        actor_user_id, actor_email_hash, confirmation_text_sha256, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'verified-owner-session-email-only', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      testSendId,
      sequenceId,
      step.id,
      providerStatus(sendResult),
      recipientEmailHash,
      email.subject,
      email.preview,
      expectedWorkspaceRevisionId,
      expectedSequenceStatus,
      expectedReadyEnrollmentCount,
      sendResult.provider,
      providerOk,
      providerErrorCode(sendResult),
      idempotencyKey,
      auditCorrelationId,
      input.actor.userId,
      actorEmailHash,
      confirmationTextSha256,
      JSON.stringify({
        issue: audienceSequenceTestSendIssue,
        ownerRecipientOnly: true,
        subscriberPayloadsCreated: false,
        publicAgentSendCreated: false,
        queueMessagesCreated: false,
        providerMessageIdsIncluded: false,
        rawRecipientEmailStored: false,
        rawEmailBodyStored: false,
      }),
    )
    .run();

  const row = await findTestSendByIdempotency(db, idempotencyKey);
  if (!row) {
    return {
      ok: false,
      status: "test_send_not_created",
      message: "The owner-only sequence test send could not be saved.",
      redaction,
    };
  }

  const testSend = publicTestSend(row, false);
  if (!sendResult.ok) {
    return {
      ok: false,
      status: "email_send_failed",
      message: "The owner-only sequence test send was recorded, but the email provider did not accept it.",
      redaction,
      testSend,
    };
  }

  return {
    ok: true,
    status: "sequence_owner_test_send_recorded",
    duplicate: false,
    testSend,
    redaction,
  };
}
