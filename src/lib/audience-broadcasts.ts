import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";

export const audienceBroadcastReadinessIssue = 171;
export const audienceBroadcastReadinessStatus = "broadcast-readiness-ready";
export const audienceBroadcastReadinessUpdatedAt = "2026-05-19";
export const audienceBroadcastReadinessDraftId = "broadcast-draft-launch-window";
export const audienceBroadcastReadinessWorkspaceId = "audience-automation-workspace-indie-launch";
export const audienceBroadcastReadinessSegmentId = "segment-indie-launch-waitlist";
export const audienceBroadcastReadinessFormId = "opt-in-form-indie-launch-waitlist";
export const audienceBroadcastScheduleIntentIssue = 173;
export const audienceBroadcastScheduleIntentStatus = "broadcast-schedule-intents-ready";
export const audienceBroadcastScheduleIntentApiRoute = "/api/admin/audience/broadcasts/schedule-intents";
export const audienceBroadcastScheduleIntentConfirmationText = "Create dry-run Bumpgrade broadcast schedule intent";
export const audienceBroadcastPreviewSafetyIssue = 175;
export const audienceBroadcastPreviewSafetyStatus = "broadcast-preview-safety-ready";
export const audienceBroadcastQueueReadinessIssue = 177;
export const audienceBroadcastQueueReadinessStatus = "broadcast-queue-readiness-ready";
export const audienceBroadcastDeliveryBatchIssue = 183;
export const audienceBroadcastDeliveryBatchStatus = "broadcast-delivery-batch-dry-run-ready";
export const audienceBroadcastDeliveryBatchApiRoute = "/api/admin/audience/broadcasts/delivery-batches";
export const audienceBroadcastDeliveryBatchConfirmationText = "Create dry-run Bumpgrade broadcast delivery batch";

type AudienceRuntime = {
  db: D1Database;
};

type BroadcastDraftRow = {
  id: string;
  workspace_id: string;
  title: string;
  status: string;
  subject_intent: string;
  preview_text: string;
  audience_scope: string;
  segment_id: string;
  approval_boundary: string;
  suppression_policy: string;
  updated_at: number | string;
};

type ScheduleIntentRow = {
  id: string;
  draft_id: string;
  status: string;
  schedule_kind: string;
  expected_draft_updated_at: string;
  ready_recipient_count: number | string;
  held_recipient_count: number | string;
  active_suppression_count: number | string;
  requested_send_at: string | null;
  idempotency_key: string;
  created_at: number | string;
};

type PreviewSafetyRow = {
  id: string;
  draft_id: string;
  status: string;
  subject_line: string;
  preview_text: string;
  body_outline_json: string;
  unsubscribe_footer_policy: string;
  sender_domain_status: string;
  safety_notes_json: string;
  updated_at: number | string;
};

type QueueReadinessRow = {
  id: string;
  draft_id: string;
  status: string;
  queue_name: string;
  queue_mode: string;
  retry_policy: string;
  suppression_check_policy: string;
  unsubscribe_footer_check_policy: string;
  sender_domain_gate: string;
  audit_correlation_policy: string;
  provider_send_enabled: number | string;
  recipient_payloads_created: number | string;
  updated_at: number | string;
};

type DeliveryBatchRow = {
  id: string;
  draft_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  queue_mode: string;
  expected_draft_updated_at: string;
  ready_recipient_count: number | string;
  held_recipient_count: number | string;
  active_suppression_count: number | string;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  provider_send_enabled: number | string;
  recipient_payloads_created: number | string;
  provider_message_ids_created: number | string;
  idempotency_key: string;
  created_at: number | string;
};

type ReadinessCountRow = {
  draft_count: number | string | null;
  scoped_subscriber_count: number | string | null;
  consented_subscriber_count: number | string | null;
  ready_recipient_count: number | string | null;
  suppressed_recipient_count: number | string | null;
  unsubscribed_recipient_count: number | string | null;
  missing_consent_count: number | string | null;
  active_suppression_count: number | string | null;
  last_readiness_at: number | string | null;
};

export type AudienceBroadcastDraftReadiness = {
  id: string;
  workspaceId: string;
  title: string;
  status: string;
  subjectIntent: string;
  previewText: string;
  audienceScope: string;
  segmentId: string;
  approvalBoundary: string;
  suppressionPolicy: string;
  readyRecipientCount: number;
  excludedBySuppressionCount: number;
  excludedByUnsubscribeCount: number;
  excludedByMissingConsentCount: number;
  sendQueueRowsCreated: false;
  providerMessageIdsIncluded: false;
  updatedAt: string | null;
};

export type AudienceBroadcastReadinessSummary = {
  id: string;
  status: typeof audienceBroadcastReadinessStatus;
  issue: typeof audienceBroadcastReadinessIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    broadcastDrafts: number;
    scopedSubscribers: number;
    consentedSubscribers: number;
    readyRecipients: number;
    suppressedRecipients: number;
    unsubscribedRecipients: number;
    missingConsentRecipients: number;
    activeSuppressionEntries: number;
  };
  lastReadinessAt: string | null;
  drafts: AudienceBroadcastDraftReadiness[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    suppressionHashesIncluded: false;
    providerMessageIdsIncluded: false;
    sendQueueRowsCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastScheduleIntentPublic = {
  id: string;
  draftId: string;
  status: string;
  scheduleKind: string;
  expectedDraftUpdatedAt: string;
  readyRecipientCount: number;
  heldRecipientCount: number;
  activeSuppressionCount: number;
  requestedSendAt: string | null;
  duplicate: boolean;
  createdAt: string | null;
  sendQueueRowsCreated: false;
  providerMessageIdsIncluded: false;
};

export type AudienceBroadcastScheduleIntentSummary = {
  id: string;
  status: typeof audienceBroadcastScheduleIntentStatus;
  issue: typeof audienceBroadcastScheduleIntentIssue;
  parentIssue: 17;
  apiRoute: typeof audienceBroadcastScheduleIntentApiRoute;
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceBroadcastScheduleIntentConfirmationText;
  };
  counts: {
    scheduleIntents: number;
    activeDryRunIntents: number;
    readyRecipientsReserved: number;
    heldRecipientsSnapshotted: number;
  };
  latestIntents: AudienceBroadcastScheduleIntentPublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    providerMessageIdsIncluded: false;
    sendQueueRowsCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastPreviewSafety = {
  id: string;
  draftId: string;
  status: string;
  subjectLine: string;
  previewText: string;
  bodyOutline: string[];
  unsubscribeFooterRequired: true;
  unsubscribeFooterPolicy: string;
  senderDomainStatus: string;
  safetyNotes: string[];
  sendQueueRowsCreated: false;
  providerMessageIdsIncluded: false;
  updatedAt: string | null;
};

export type AudienceBroadcastPreviewSafetySummary = {
  id: string;
  status: typeof audienceBroadcastPreviewSafetyStatus;
  issue: typeof audienceBroadcastPreviewSafetyIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    previewSafetyRecords: number;
    unsubscribeFooterRequiredRecords: number;
    senderDomainsReady: number;
  };
  records: AudienceBroadcastPreviewSafety[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    personalizedBodyIncluded: false;
    providerMessageIdsIncluded: false;
    sendQueueRowsCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastQueueReadiness = {
  id: string;
  draftId: string;
  status: string;
  queueName: string;
  queueMode: string;
  retryPolicy: string;
  suppressionCheckPolicy: string;
  unsubscribeFooterCheckPolicy: string;
  senderDomainGate: string;
  auditCorrelationPolicy: string;
  providerSendEnabled: false;
  recipientPayloadsCreated: false;
  sendQueueRowsCreated: false;
  providerMessageIdsIncluded: false;
  updatedAt: string | null;
};

export type AudienceBroadcastQueueReadinessSummary = {
  id: string;
  status: typeof audienceBroadcastQueueReadinessStatus;
  issue: typeof audienceBroadcastQueueReadinessIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    queueReadinessRecords: number;
    dryRunQueues: number;
    providerSendEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
  };
  records: AudienceBroadcastQueueReadiness[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    recipientPayloadsIncluded: false;
    providerMessageIdsIncluded: false;
    sendQueueRowsCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastDeliveryBatch = {
  id: string;
  draftId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  queueMode: string;
  expectedDraftUpdatedAt: string;
  readyRecipientCount: number;
  heldRecipientCount: number;
  activeSuppressionCount: number;
  unsubscribeFooterCheckStatus: string;
  senderDomainGateStatus: string;
  duplicate: boolean;
  providerSendEnabled: false;
  recipientPayloadsCreated: false;
  sendQueueRowsCreated: false;
  providerMessageIdsIncluded: false;
  createdAt: string | null;
};

export type AudienceBroadcastDeliveryBatchSummary = {
  id: string;
  status: typeof audienceBroadcastDeliveryBatchStatus;
  issue: typeof audienceBroadcastDeliveryBatchIssue;
  parentIssue: 17;
  apiRoute: typeof audienceBroadcastDeliveryBatchApiRoute;
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceBroadcastDeliveryBatchConfirmationText;
  };
  counts: {
    deliveryBatches: number;
    dryRunBatches: number;
    readyRecipientsBatched: number;
    heldRecipientsSnapshotted: number;
    activeSuppressionsSnapshotted: number;
    providerSendEnabledBatches: number;
    recipientPayloadsCreatedBatches: number;
    providerMessageIdsCreatedBatches: number;
  };
  latestBatches: AudienceBroadcastDeliveryBatch[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodyIncluded: false;
    providerMessageIdsIncluded: false;
    sendQueueRowsCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateScheduleIntentInput = {
  draftId?: unknown;
  expectedDraftUpdatedAt?: unknown;
  expectedReadyRecipientCount?: unknown;
  requestedSendAt?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateDeliveryBatchInput = {
  scheduleIntentId?: unknown;
  draftId?: unknown;
  expectedDraftUpdatedAt?: unknown;
  expectedReadyRecipientCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateScheduleIntentResult =
  | {
      ok: true;
      status: "broadcast_schedule_intent_recorded" | "broadcast_schedule_intent_replayed";
      duplicate: boolean;
      intent: AudienceBroadcastScheduleIntentPublic;
      redaction: AudienceBroadcastScheduleIntentSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "broadcast_draft_not_found"
        | "readiness_unavailable"
        | "stale_draft_revision"
        | "stale_readiness_count"
        | "intent_not_created";
      message: string;
      redaction: AudienceBroadcastScheduleIntentSummary["redaction"];
      currentDraftUpdatedAt?: string | null;
      currentReadyRecipientCount?: number;
    };

type CreateDeliveryBatchResult =
  | {
      ok: true;
      status: "broadcast_delivery_batch_recorded" | "broadcast_delivery_batch_replayed";
      duplicate: boolean;
      batch: AudienceBroadcastDeliveryBatch;
      redaction: AudienceBroadcastDeliveryBatchSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "schedule_intent_not_found"
        | "broadcast_draft_not_found"
        | "readiness_unavailable"
        | "queue_readiness_unavailable"
        | "preview_safety_unavailable"
        | "stale_draft_revision"
        | "stale_readiness_count"
        | "queue_gate_not_ready"
        | "preview_safety_not_ready"
        | "batch_not_created";
      message: string;
      redaction: AudienceBroadcastDeliveryBatchSummary["redaction"];
      currentDraftUpdatedAt?: string | null;
      currentReadyRecipientCount?: number;
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

function parseJsonStringArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    return [];
  }
}

function emptySummary(
  source: AudienceBroadcastReadinessSummary["source"],
  loadError: string | null,
): AudienceBroadcastReadinessSummary {
  return {
    id: "audience-broadcast-readiness-contract",
    status: audienceBroadcastReadinessStatus,
    issue: audienceBroadcastReadinessIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      broadcastDrafts: 0,
      scopedSubscribers: 0,
      consentedSubscribers: 0,
      readyRecipients: 0,
      suppressedRecipients: 0,
      unsubscribedRecipients: 0,
      missingConsentRecipients: 0,
      activeSuppressionEntries: 0,
    },
    lastReadinessAt: null,
    drafts: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      suppressionHashesIncluded: false,
      providerMessageIdsIncluded: false,
      sendQueueRowsCreated: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "suppressionHash",
      "providerMessageId",
      "sendQueuePayload",
      "personalizedBody",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #171 exposes read-only broadcast draft readiness with suppression-aware aggregate counts. It does not send email, schedule broadcasts, create send queue rows, expose private recipients, or authorize direct agent broadcast writes.",
  };
}

function emptyScheduleIntentSummary(
  source: AudienceBroadcastScheduleIntentSummary["source"],
  loadError: string | null,
): AudienceBroadcastScheduleIntentSummary {
  return {
    id: "audience-broadcast-schedule-intent-contract",
    status: audienceBroadcastScheduleIntentStatus,
    issue: audienceBroadcastScheduleIntentIssue,
    parentIssue: 17,
    apiRoute: audienceBroadcastScheduleIntentApiRoute,
    ownerRoute: "/admin/audience",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceBroadcastScheduleIntentConfirmationText,
    },
    counts: {
      scheduleIntents: 0,
      activeDryRunIntents: 0,
      readyRecipientsReserved: 0,
      heldRecipientsSnapshotted: 0,
    },
    latestIntents: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      providerMessageIdsIncluded: false,
      sendQueueRowsCreated: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "suppressionHash",
      "actorEmail",
      "providerMessageId",
      "sendQueuePayload",
      "personalizedBody",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #173 lets verified owners record a dry-run broadcast schedule intent after exact confirmation, idempotency, expected readiness count, and draft revision checks. It does not send email, create recipient payloads, dispatch queues, create provider message IDs, expose private recipients, or authorize direct public agent broadcast writes.",
  };
}

function emptyPreviewSafetySummary(
  source: AudienceBroadcastPreviewSafetySummary["source"],
  loadError: string | null,
): AudienceBroadcastPreviewSafetySummary {
  return {
    id: "audience-broadcast-preview-safety-contract",
    status: audienceBroadcastPreviewSafetyStatus,
    issue: audienceBroadcastPreviewSafetyIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      previewSafetyRecords: 0,
      unsubscribeFooterRequiredRecords: 0,
      senderDomainsReady: 0,
    },
    records: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      personalizedBodyIncluded: false,
      providerMessageIdsIncluded: false,
      sendQueueRowsCreated: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "personalizedBody",
      "subscriberEmailHash",
      "suppressionHash",
      "providerMessageId",
      "sendQueuePayload",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #175 exposes owner-visible broadcast preview and unsubscribe-footer safety metadata before delivery exists. It does not personalize messages, create recipient payloads, enqueue sends, create provider message IDs, expose private recipients, or authorize public agent broadcast writes.",
  };
}

function emptyQueueReadinessSummary(
  source: AudienceBroadcastQueueReadinessSummary["source"],
  loadError: string | null,
): AudienceBroadcastQueueReadinessSummary {
  return {
    id: "audience-broadcast-queue-readiness-contract",
    status: audienceBroadcastQueueReadinessStatus,
    issue: audienceBroadcastQueueReadinessIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      queueReadinessRecords: 0,
      dryRunQueues: 0,
      providerSendEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
    },
    records: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      recipientPayloadsIncluded: false,
      providerMessageIdsIncluded: false,
      sendQueueRowsCreated: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "suppressionHash",
      "recipientPayload",
      "providerMessageId",
      "sendQueuePayload",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #177 exposes broadcast delivery queue readiness metadata before producer or consumer code exists. It does not create queue rows, recipient payloads, provider message IDs, private exports, or public agent broadcast writes.",
  };
}

function emptyDeliveryBatchSummary(
  source: AudienceBroadcastDeliveryBatchSummary["source"],
  loadError: string | null,
): AudienceBroadcastDeliveryBatchSummary {
  return {
    id: "audience-broadcast-delivery-batch-contract",
    status: audienceBroadcastDeliveryBatchStatus,
    issue: audienceBroadcastDeliveryBatchIssue,
    parentIssue: 17,
    apiRoute: audienceBroadcastDeliveryBatchApiRoute,
    ownerRoute: "/admin/audience",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceBroadcastDeliveryBatchConfirmationText,
    },
    counts: {
      deliveryBatches: 0,
      dryRunBatches: 0,
      readyRecipientsBatched: 0,
      heldRecipientsSnapshotted: 0,
      activeSuppressionsSnapshotted: 0,
      providerSendEnabledBatches: 0,
      recipientPayloadsCreatedBatches: 0,
      providerMessageIdsCreatedBatches: 0,
    },
    latestBatches: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodyIncluded: false,
      providerMessageIdsIncluded: false,
      sendQueueRowsCreated: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "suppressionHash",
      "actorEmail",
      "recipientPayload",
      "providerMessageId",
      "sendQueuePayload",
      "personalizedBody",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #183 lets verified owners record a suppression-checked broadcast delivery-batch dry run after exact confirmation, idempotency, schedule-intent, draft revision, readiness count, preview safety, and queue readiness checks. It does not create recipient payloads, queue messages, provider sends, provider message IDs, private exports, or public agent broadcast writes.",
  };
}

function mapDraft(row: BroadcastDraftRow, counts: ReadinessCountRow | null): AudienceBroadcastDraftReadiness {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    status: row.status,
    subjectIntent: row.subject_intent,
    previewText: row.preview_text,
    audienceScope: row.audience_scope,
    segmentId: row.segment_id,
    approvalBoundary: row.approval_boundary,
    suppressionPolicy: row.suppression_policy,
    readyRecipientCount: numberValue(counts?.ready_recipient_count),
    excludedBySuppressionCount: numberValue(counts?.suppressed_recipient_count),
    excludedByUnsubscribeCount: numberValue(counts?.unsubscribed_recipient_count),
    excludedByMissingConsentCount: numberValue(counts?.missing_consent_count),
    sendQueueRowsCreated: false,
    providerMessageIdsIncluded: false,
    updatedAt: timestampValue(row.updated_at),
  };
}

function heldRecipientCount(draft: AudienceBroadcastDraftReadiness) {
  return (
    draft.excludedBySuppressionCount +
    draft.excludedByUnsubscribeCount +
    draft.excludedByMissingConsentCount
  );
}

function publicScheduleIntent(row: ScheduleIntentRow, duplicate: boolean): AudienceBroadcastScheduleIntentPublic {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    scheduleKind: row.schedule_kind,
    expectedDraftUpdatedAt: row.expected_draft_updated_at,
    readyRecipientCount: numberValue(row.ready_recipient_count),
    heldRecipientCount: numberValue(row.held_recipient_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    requestedSendAt: row.requested_send_at,
    duplicate,
    createdAt: timestampValue(row.created_at),
    sendQueueRowsCreated: false,
    providerMessageIdsIncluded: false,
  };
}

function publicPreviewSafety(row: PreviewSafetyRow): AudienceBroadcastPreviewSafety {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    subjectLine: row.subject_line,
    previewText: row.preview_text,
    bodyOutline: parseJsonStringArray(row.body_outline_json),
    unsubscribeFooterRequired: true,
    unsubscribeFooterPolicy: row.unsubscribe_footer_policy,
    senderDomainStatus: row.sender_domain_status,
    safetyNotes: parseJsonStringArray(row.safety_notes_json),
    sendQueueRowsCreated: false,
    providerMessageIdsIncluded: false,
    updatedAt: timestampValue(row.updated_at),
  };
}

function publicQueueReadiness(row: QueueReadinessRow): AudienceBroadcastQueueReadiness {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    queueName: row.queue_name,
    queueMode: row.queue_mode,
    retryPolicy: row.retry_policy,
    suppressionCheckPolicy: row.suppression_check_policy,
    unsubscribeFooterCheckPolicy: row.unsubscribe_footer_check_policy,
    senderDomainGate: row.sender_domain_gate,
    auditCorrelationPolicy: row.audit_correlation_policy,
    providerSendEnabled: false,
    recipientPayloadsCreated: false,
    sendQueueRowsCreated: false,
    providerMessageIdsIncluded: false,
    updatedAt: timestampValue(row.updated_at),
  };
}

function publicDeliveryBatch(row: DeliveryBatchRow, duplicate: boolean): AudienceBroadcastDeliveryBatch {
  return {
    id: row.id,
    draftId: row.draft_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    queueMode: row.queue_mode,
    expectedDraftUpdatedAt: row.expected_draft_updated_at,
    readyRecipientCount: numberValue(row.ready_recipient_count),
    heldRecipientCount: numberValue(row.held_recipient_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    unsubscribeFooterCheckStatus: row.unsubscribe_footer_check_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    duplicate,
    providerSendEnabled: false,
    recipientPayloadsCreated: false,
    sendQueueRowsCreated: false,
    providerMessageIdsIncluded: false,
    createdAt: timestampValue(row.created_at),
  };
}

async function findScheduleIntentByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, status, schedule_kind, expected_draft_updated_at, ready_recipient_count,
        held_recipient_count, active_suppression_count, requested_send_at, idempotency_key, created_at
      FROM audience_broadcast_schedule_intents
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<ScheduleIntentRow>();
}

async function findScheduleIntentById(db: D1Database, scheduleIntentId: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, status, schedule_kind, expected_draft_updated_at, ready_recipient_count,
        held_recipient_count, active_suppression_count, requested_send_at, idempotency_key, created_at
      FROM audience_broadcast_schedule_intents
      WHERE id = ?`,
    )
    .bind(scheduleIntentId)
    .first<ScheduleIntentRow>();
}

async function findDeliveryBatchByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, schedule_intent_id, status, queue_name, queue_mode, expected_draft_updated_at,
        ready_recipient_count, held_recipient_count, active_suppression_count,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        recipient_payloads_created, provider_message_ids_created, idempotency_key, created_at
      FROM audience_broadcast_delivery_batches
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<DeliveryBatchRow>();
}

export async function getAudienceBroadcastReadinessSummary(): Promise<AudienceBroadcastReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `WITH scoped AS (
          SELECT *
          FROM audience_subscribers
          WHERE source_segment_id = ? OR source_form_id = ?
        )
        SELECT
          (SELECT COUNT(*) FROM audience_broadcast_drafts) AS draft_count,
          (SELECT COUNT(*) FROM scoped) AS scoped_subscriber_count,
          (
            SELECT COUNT(*)
            FROM scoped s
            WHERE EXISTS (
              SELECT 1 FROM audience_consent_events c
              WHERE c.subscriber_id = s.id AND c.status = 'consented'
            )
          ) AS consented_subscriber_count,
          (
            SELECT COUNT(*)
            FROM scoped s
            WHERE s.status = 'subscribed'
              AND EXISTS (
                SELECT 1 FROM audience_consent_events c
                WHERE c.subscriber_id = s.id AND c.status = 'consented'
              )
              AND NOT EXISTS (
                SELECT 1 FROM audience_suppression_entries se
                WHERE se.email_hash = s.email_hash AND se.status = 'active'
              )
          ) AS ready_recipient_count,
          (
            SELECT COUNT(*)
            FROM scoped s
            WHERE s.status = 'subscribed'
              AND EXISTS (
                SELECT 1 FROM audience_suppression_entries se
                WHERE se.email_hash = s.email_hash AND se.status = 'active'
              )
          ) AS suppressed_recipient_count,
          (SELECT COUNT(*) FROM scoped WHERE status = 'unsubscribed') AS unsubscribed_recipient_count,
          (
            SELECT COUNT(*)
            FROM scoped s
            WHERE s.status = 'subscribed'
              AND NOT EXISTS (
                SELECT 1 FROM audience_consent_events c
                WHERE c.subscriber_id = s.id AND c.status = 'consented'
              )
          ) AS missing_consent_count,
          (SELECT COUNT(*) FROM audience_suppression_entries WHERE status = 'active') AS active_suppression_count,
          (SELECT MAX(updated_at) FROM audience_broadcast_drafts) AS last_readiness_at`,
      )
      .bind(audienceBroadcastReadinessSegmentId, audienceBroadcastReadinessFormId)
      .first<ReadinessCountRow>();

    const drafts = await db
      .prepare(
        `SELECT
          id, workspace_id, title, status, subject_intent, preview_text, audience_scope, segment_id,
          approval_boundary, suppression_policy, updated_at
        FROM audience_broadcast_drafts
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<BroadcastDraftRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        broadcastDrafts: numberValue(counts?.draft_count),
        scopedSubscribers: numberValue(counts?.scoped_subscriber_count),
        consentedSubscribers: numberValue(counts?.consented_subscriber_count),
        readyRecipients: numberValue(counts?.ready_recipient_count),
        suppressedRecipients: numberValue(counts?.suppressed_recipient_count),
        unsubscribedRecipients: numberValue(counts?.unsubscribed_recipient_count),
        missingConsentRecipients: numberValue(counts?.missing_consent_count),
        activeSuppressionEntries: numberValue(counts?.active_suppression_count),
      },
      lastReadinessAt: timestampValue(counts?.last_readiness_at),
      drafts: (drafts.results ?? []).map((row) => mapDraft(row, counts ?? null)),
    };
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Unable to load audience broadcast readiness.");
  }
}

export async function getAudienceBroadcastScheduleIntentSummary(): Promise<AudienceBroadcastScheduleIntentSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS schedule_intent_count,
          SUM(CASE WHEN status = 'dry_run_recorded' THEN 1 ELSE 0 END) AS active_dry_run_intent_count,
          COALESCE(SUM(ready_recipient_count), 0) AS ready_recipient_count,
          COALESCE(SUM(held_recipient_count), 0) AS held_recipient_count
        FROM audience_broadcast_schedule_intents`,
      )
      .first<{
        schedule_intent_count: number | string | null;
        active_dry_run_intent_count: number | string | null;
        ready_recipient_count: number | string | null;
        held_recipient_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, draft_id, status, schedule_kind, expected_draft_updated_at, ready_recipient_count,
          held_recipient_count, active_suppression_count, requested_send_at, idempotency_key, created_at
        FROM audience_broadcast_schedule_intents
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<ScheduleIntentRow>();

    return {
      ...emptyScheduleIntentSummary("d1", null),
      counts: {
        scheduleIntents: numberValue(counts?.schedule_intent_count),
        activeDryRunIntents: numberValue(counts?.active_dry_run_intent_count),
        readyRecipientsReserved: numberValue(counts?.ready_recipient_count),
        heldRecipientsSnapshotted: numberValue(counts?.held_recipient_count),
      },
      latestIntents: (latest.results ?? []).map((row) => publicScheduleIntent(row, false)),
    };
  } catch (error) {
    return emptyScheduleIntentSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast schedule intents.",
    );
  }
}

export async function getAudienceBroadcastPreviewSafetySummary(): Promise<AudienceBroadcastPreviewSafetySummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, draft_id, status, subject_line, preview_text, body_outline_json,
          unsubscribe_footer_policy, sender_domain_status, safety_notes_json, updated_at
        FROM audience_broadcast_preview_safety
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<PreviewSafetyRow>();
    const records = (rows.results ?? []).map(publicPreviewSafety);

    return {
      ...emptyPreviewSafetySummary("d1", null),
      counts: {
        previewSafetyRecords: records.length,
        unsubscribeFooterRequiredRecords: records.filter((record) => record.unsubscribeFooterRequired).length,
        senderDomainsReady: records.filter((record) => record.senderDomainStatus === "ready").length,
      },
      records,
    };
  } catch (error) {
    return emptyPreviewSafetySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast preview safety.",
    );
  }
}

export async function getAudienceBroadcastQueueReadinessSummary(): Promise<AudienceBroadcastQueueReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, draft_id, status, queue_name, queue_mode, retry_policy, suppression_check_policy,
          unsubscribe_footer_check_policy, sender_domain_gate, audit_correlation_policy,
          provider_send_enabled, recipient_payloads_created, updated_at
        FROM audience_broadcast_queue_readiness
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<QueueReadinessRow>();
    const rawRows = rows.results ?? [];
    const records = rawRows.map(publicQueueReadiness);

    return {
      ...emptyQueueReadinessSummary("d1", null),
      counts: {
        queueReadinessRecords: records.length,
        dryRunQueues: records.filter((record) => record.queueMode === "dry_run_contract").length,
        providerSendEnabledRecords: rawRows.filter((row) => numberValue(row.provider_send_enabled) > 0).length,
        recipientPayloadsCreatedRecords: rawRows.filter((row) => numberValue(row.recipient_payloads_created) > 0).length,
      },
      records,
    };
  } catch (error) {
    return emptyQueueReadinessSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast queue readiness.",
    );
  }
}

export async function getAudienceBroadcastDeliveryBatchSummary(): Promise<AudienceBroadcastDeliveryBatchSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS delivery_batch_count,
          SUM(CASE WHEN queue_mode = 'dry_run_contract' THEN 1 ELSE 0 END) AS dry_run_batch_count,
          COALESCE(SUM(ready_recipient_count), 0) AS ready_recipient_count,
          COALESCE(SUM(held_recipient_count), 0) AS held_recipient_count,
          COALESCE(SUM(active_suppression_count), 0) AS active_suppression_count,
          SUM(CASE WHEN provider_send_enabled > 0 THEN 1 ELSE 0 END) AS provider_send_enabled_count,
          SUM(CASE WHEN recipient_payloads_created > 0 THEN 1 ELSE 0 END) AS recipient_payloads_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count
        FROM audience_broadcast_delivery_batches`,
      )
      .first<{
        delivery_batch_count: number | string | null;
        dry_run_batch_count: number | string | null;
        ready_recipient_count: number | string | null;
        held_recipient_count: number | string | null;
        active_suppression_count: number | string | null;
        provider_send_enabled_count: number | string | null;
        recipient_payloads_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, draft_id, schedule_intent_id, status, queue_name, queue_mode, expected_draft_updated_at,
          ready_recipient_count, held_recipient_count, active_suppression_count,
          unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
          recipient_payloads_created, provider_message_ids_created, idempotency_key, created_at
        FROM audience_broadcast_delivery_batches
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<DeliveryBatchRow>();

    return {
      ...emptyDeliveryBatchSummary("d1", null),
      counts: {
        deliveryBatches: numberValue(counts?.delivery_batch_count),
        dryRunBatches: numberValue(counts?.dry_run_batch_count),
        readyRecipientsBatched: numberValue(counts?.ready_recipient_count),
        heldRecipientsSnapshotted: numberValue(counts?.held_recipient_count),
        activeSuppressionsSnapshotted: numberValue(counts?.active_suppression_count),
        providerSendEnabledBatches: numberValue(counts?.provider_send_enabled_count),
        recipientPayloadsCreatedBatches: numberValue(counts?.recipient_payloads_created_count),
        providerMessageIdsCreatedBatches: numberValue(counts?.provider_message_ids_created_count),
      },
      latestBatches: (latest.results ?? []).map((row) => publicDeliveryBatch(row, false)),
    };
  } catch (error) {
    return emptyDeliveryBatchSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast delivery batches.",
    );
  }
}

export async function createAudienceBroadcastScheduleIntent(input: CreateScheduleIntentInput): Promise<CreateScheduleIntentResult> {
  const redaction = emptyScheduleIntentSummary("d1", null).redaction;
  const draftId = parseString(input.draftId);
  const expectedDraftUpdatedAt = parseString(input.expectedDraftUpdatedAt);
  const expectedReadyRecipientCount = parseInteger(input.expectedReadyRecipientCount);
  const requestedSendAt = parseString(input.requestedSendAt);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!draftId || !expectedDraftUpdatedAt || expectedReadyRecipientCount === null || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message: "A draft ID, expected draft updated time, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceBroadcastScheduleIntentConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording a broadcast schedule intent.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findScheduleIntentByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "broadcast_schedule_intent_replayed",
      duplicate: true,
      intent: publicScheduleIntent(existing, true),
      redaction,
    };
  }

  const readiness = await getAudienceBroadcastReadinessSummary();
  if (readiness.source !== "d1") {
    return {
      ok: false,
      status: "readiness_unavailable",
      message: readiness.loadError ?? "Broadcast readiness is unavailable.",
      redaction,
    };
  }

  const draft = readiness.drafts.find((candidate) => candidate.id === draftId);
  if (!draft) {
    return {
      ok: false,
      status: "broadcast_draft_not_found",
      message: "The broadcast draft could not be found.",
      redaction,
    };
  }

  if (draft.updatedAt !== expectedDraftUpdatedAt) {
    return {
      ok: false,
      status: "stale_draft_revision",
      message: "The broadcast draft changed before the schedule intent was recorded.",
      redaction,
      currentDraftUpdatedAt: draft.updatedAt,
    };
  }

  if (draft.readyRecipientCount !== expectedReadyRecipientCount) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Broadcast readiness changed before the schedule intent was recorded.",
      redaction,
      currentReadyRecipientCount: draft.readyRecipientCount,
    };
  }

  const intentId = `broadcast-schedule-intent-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_broadcast_schedule_intents (
        id, draft_id, status, schedule_kind, expected_draft_updated_at, ready_recipient_count,
        held_recipient_count, active_suppression_count, requested_send_at, idempotency_key,
        actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, 'dry_run_recorded', 'owner_confirmed_dry_run', ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      intentId,
      draft.id,
      expectedDraftUpdatedAt,
      draft.readyRecipientCount,
      heldRecipientCount(draft),
      readiness.counts.activeSuppressionEntries,
      requestedSendAt,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceBroadcastScheduleIntentIssue,
        sendQueueRowsCreated: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const intent = await findScheduleIntentByIdempotency(db, idempotencyKey);
  if (!intent) {
    return {
      ok: false,
      status: "intent_not_created",
      message: "The broadcast schedule intent could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "broadcast_schedule_intent_recorded",
    duplicate: false,
    intent: publicScheduleIntent(intent, false),
    redaction,
  };
}

export async function createAudienceBroadcastDeliveryBatch(input: CreateDeliveryBatchInput): Promise<CreateDeliveryBatchResult> {
  const redaction = emptyDeliveryBatchSummary("d1", null).redaction;
  const scheduleIntentId = parseString(input.scheduleIntentId);
  const draftId = parseString(input.draftId);
  const expectedDraftUpdatedAt = parseString(input.expectedDraftUpdatedAt);
  const expectedReadyRecipientCount = parseInteger(input.expectedReadyRecipientCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!scheduleIntentId || !draftId || !expectedDraftUpdatedAt || expectedReadyRecipientCount === null || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message: "A schedule intent ID, draft ID, expected draft updated time, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceBroadcastDeliveryBatchConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording a broadcast delivery batch dry run.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDeliveryBatchByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "broadcast_delivery_batch_replayed",
      duplicate: true,
      batch: publicDeliveryBatch(existing, true),
      redaction,
    };
  }

  const scheduleIntent = await findScheduleIntentById(db, scheduleIntentId);
  if (!scheduleIntent || scheduleIntent.status !== "dry_run_recorded" || scheduleIntent.draft_id !== draftId) {
    return {
      ok: false,
      status: "schedule_intent_not_found",
      message: "A current dry-run schedule intent for this broadcast draft is required before a delivery batch can be recorded.",
      redaction,
    };
  }

  const readiness = await getAudienceBroadcastReadinessSummary();
  if (readiness.source !== "d1") {
    return {
      ok: false,
      status: "readiness_unavailable",
      message: readiness.loadError ?? "Broadcast readiness is unavailable.",
      redaction,
    };
  }

  const draft = readiness.drafts.find((candidate) => candidate.id === draftId);
  if (!draft) {
    return {
      ok: false,
      status: "broadcast_draft_not_found",
      message: "The broadcast draft could not be found.",
      redaction,
    };
  }

  if (draft.updatedAt !== expectedDraftUpdatedAt || scheduleIntent.expected_draft_updated_at !== expectedDraftUpdatedAt) {
    return {
      ok: false,
      status: "stale_draft_revision",
      message: "The broadcast draft changed before the delivery batch dry run was recorded.",
      redaction,
      currentDraftUpdatedAt: draft.updatedAt,
    };
  }

  if (
    draft.readyRecipientCount !== expectedReadyRecipientCount ||
    numberValue(scheduleIntent.ready_recipient_count) !== expectedReadyRecipientCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Broadcast readiness changed before the delivery batch dry run was recorded.",
      redaction,
      currentReadyRecipientCount: draft.readyRecipientCount,
    };
  }

  const previewSafety = await getAudienceBroadcastPreviewSafetySummary();
  if (previewSafety.source !== "d1") {
    return {
      ok: false,
      status: "preview_safety_unavailable",
      message: previewSafety.loadError ?? "Broadcast preview safety is unavailable.",
      redaction,
    };
  }
  const previewRecord = previewSafety.records.find((record) => record.draftId === draftId);
  if (!previewRecord || !previewRecord.unsubscribeFooterRequired) {
    return {
      ok: false,
      status: "preview_safety_not_ready",
      message: "Preview safety and unsubscribe footer checks must exist before a delivery batch dry run.",
      redaction,
    };
  }

  const queueReadiness = await getAudienceBroadcastQueueReadinessSummary();
  if (queueReadiness.source !== "d1") {
    return {
      ok: false,
      status: "queue_readiness_unavailable",
      message: queueReadiness.loadError ?? "Broadcast queue readiness is unavailable.",
      redaction,
    };
  }
  const queueRecord = queueReadiness.records.find((record) => record.draftId === draftId);
  if (
    !queueRecord ||
    queueRecord.queueMode !== "dry_run_contract" ||
    queueRecord.providerSendEnabled ||
    queueRecord.recipientPayloadsCreated
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message: "Queue readiness must stay in dry-run mode without provider sends or recipient payloads before batch recording.",
      redaction,
    };
  }

  const batchId = `broadcast-delivery-batch-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_broadcast_delivery_batches (
        id, draft_id, schedule_intent_id, status, queue_name, queue_mode, expected_draft_updated_at,
        ready_recipient_count, held_recipient_count, active_suppression_count,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        recipient_payloads_created, provider_message_ids_created, idempotency_key,
        actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, 'delivery_batch_dry_run_recorded', ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      batchId,
      draft.id,
      scheduleIntent.id,
      queueRecord.queueName,
      queueRecord.queueMode,
      expectedDraftUpdatedAt,
      draft.readyRecipientCount,
      heldRecipientCount(draft),
      readiness.counts.activeSuppressionEntries,
      previewRecord.unsubscribeFooterPolicy,
      queueRecord.senderDomainGate,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceBroadcastDeliveryBatchIssue,
        scheduleIntentId: scheduleIntent.id,
        previewSafetyId: previewRecord.id,
        queueReadinessId: queueRecord.id,
        providerSendEnabled: false,
        recipientPayloadsCreated: false,
        sendQueueRowsCreated: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const batch = await findDeliveryBatchByIdempotency(db, idempotencyKey);
  if (!batch) {
    return {
      ok: false,
      status: "batch_not_created",
      message: "The broadcast delivery batch dry run could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "broadcast_delivery_batch_recorded",
    duplicate: false,
    batch: publicDeliveryBatch(batch, false),
    redaction,
  };
}
