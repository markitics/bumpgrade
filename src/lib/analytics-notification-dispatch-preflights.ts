import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { loadAnalyticsFunnelConversionReport } from "@/lib/analytics-conversion-report";
import { sha256Hex } from "@/lib/analytics-events";
import { analyticsDashboard } from "@/lib/analytics-experiments";
import {
  analyticsNotificationInboxIssue,
  analyticsNotificationInboxStatus,
} from "@/lib/analytics-notification-inbox";
import {
  analyticsNotificationAdminInboxChannelId,
  analyticsNotificationReadinessId,
  analyticsNotificationReadinessIssue,
  analyticsNotificationReadinessStatus,
  analyticsNotificationThresholdIds,
} from "@/lib/analytics-report-exports";
import {
  analyticsTimeWindows,
  defaultAnalyticsTimeWindow,
  resolveAnalyticsTimeWindow,
  type AnalyticsTimeWindow,
} from "@/lib/analytics-time-windows";

export const analyticsNotificationDispatchPreflightIssue = 284;
export const analyticsNotificationDispatchPreflightStatus = "owner-analytics-notification-dispatch-preflights-ready";
export const analyticsNotificationDispatchPreflightApiRoute =
  "/api/admin/analytics/notification-dispatch-preflights";
export const analyticsNotificationDispatchPreflightOwnerRoute = "/admin/analytics";
export const analyticsNotificationDispatchPreflightConfirmationText =
  "Record Bumpgrade analytics notification dispatch preflight evidence";

const ownerReviewStatus = "reviewed_with_caveats";
const dispatchPreflightRecordKind = "owner_notification_dispatch_preflight";
const defaultDispatchPreflightDisposition = "blocked_pending_provider_review";
const supportedDispatchPreflightDispositions = [
  "blocked_pending_provider_review",
  "draft_ready_for_owner_review",
  "provider_contract_not_ready",
] as const;

type Runtime = {
  db: D1Database;
};

type DispatchPreflightDisposition = (typeof supportedDispatchPreflightDispositions)[number];

type InboxReferenceRow = {
  id: string;
  readiness_id: string;
  channel_id: string;
  time_window_key: string;
  expected_readiness_status: string;
  expected_owner_review_status: string;
  expected_alert_threshold_count: number;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
  admin_inbox_record_created: number;
  email_send_enabled: number;
  queue_dispatch_enabled: number;
  customer_alert_enabled: number;
  traffic_routing_enabled: number;
  automated_winner_enabled: number;
  revenue_claim_enabled: number;
  raw_analytics_rows_exposed: number;
  recipient_identity_included: number;
  email_body_included: number;
  created_at: number;
};

type DispatchPreflightCountRow = {
  notification_dispatch_preflight_records: number;
  owner_confirmed_records: number;
  owner_dispatch_preflight_recorded_records: number;
  email_send_enabled_records: number;
  queue_dispatch_enabled_records: number;
  customer_alert_enabled_records: number;
  traffic_routing_enabled_records: number;
  automated_winner_enabled_records: number;
  revenue_claim_enabled_records: number;
  raw_analytics_rows_exposed_records: number;
  recipient_identity_included_records: number;
  email_body_included_records: number;
  provider_message_id_included_records: number;
  queue_payload_included_records: number;
};

type DispatchPreflightRow = {
  id: string;
  dashboard_id: string;
  readiness_id: string;
  channel_id: string;
  inbox_record_id: string;
  record_kind: typeof dispatchPreflightRecordKind;
  notification_dispatch_preflight_disposition: DispatchPreflightDisposition;
  time_window_key: string;
  expected_dashboard_revision_id: string;
  expected_readiness_status: string;
  expected_notification_inbox_status: string;
  expected_owner_review_status: string;
  expected_alert_threshold_count: number;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
  idempotency_key: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  owner_dispatch_preflight_recorded: number;
  email_send_enabled: number;
  queue_dispatch_enabled: number;
  customer_alert_enabled: number;
  traffic_routing_enabled: number;
  automated_winner_enabled: number;
  revenue_claim_enabled: number;
  raw_analytics_rows_exposed: number;
  recipient_identity_included: number;
  email_body_included: number;
  provider_message_id_included: number;
  queue_payload_included: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

type DispatchPreflightChecklistItem = {
  id: string;
  title: string;
  status: "passed" | "blocked" | "external_required";
  evidence: string;
};

export type AnalyticsNotificationDispatchInboxReference = {
  id: string;
  readinessId: string;
  channelId: string;
  timeWindowKey: string;
  expectedReadinessStatus: string;
  expectedOwnerReviewStatus: string;
  expectedAlertThresholdCount: number;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
  adminInboxRecordCreated: true;
  ownerEmailSendEnabled: false;
  queueDispatchEnabled: false;
  customerAlertEnabled: false;
  trafficRoutingEnabled: false;
  automatedWinnerEnabled: false;
  revenueClaimEnabled: false;
  rawAnalyticsRowsExposed: false;
  recipientIdentityIncluded: false;
  emailBodyIncluded: false;
  createdAt: string | null;
};

export type AnalyticsNotificationDispatchPreflightEvidence = {
  timeWindow: AnalyticsTimeWindow;
  dashboardId: string;
  dashboardRevisionId: string;
  readinessId: typeof analyticsNotificationReadinessId;
  readinessStatus: typeof analyticsNotificationReadinessStatus;
  notificationInboxStatus: typeof analyticsNotificationInboxStatus;
  channelId: typeof analyticsNotificationAdminInboxChannelId;
  ownerReviewStatus: typeof ownerReviewStatus;
  alertThresholdCount: number;
  conversionSampleSize: number;
  sampleSizeCaveat: string;
  sampleSizeCaveatAcknowledged: true;
  latestInboxRecord: AnalyticsNotificationDispatchInboxReference | null;
  inboxRecordRequired: true;
  inboxRecordCurrent: boolean;
  supportedDispatchPreflightDispositions: readonly DispatchPreflightDisposition[];
  defaultDispatchPreflightDisposition: DispatchPreflightDisposition;
  dispatchPreflightChecklist: DispatchPreflightChecklistItem[];
  ownerRecordAllowed: boolean;
  ownerEmailSendEnabled: false;
  queueDispatchEnabled: false;
  customerAlertEnabled: false;
  trafficRoutingEnabled: false;
  automatedWinnerEnabled: false;
  revenueClaimEnabled: false;
  rawRowsIncluded: false;
  privateDataIncluded: false;
  recipientIdentityIncluded: false;
  emailBodyIncluded: false;
  providerMessageIdIncluded: false;
  queuePayloadIncluded: false;
};

export type AnalyticsNotificationDispatchPreflightPublic = {
  id: string;
  dashboardId: string;
  readinessId: string;
  channelId: string;
  inboxRecordId: string;
  recordKind: typeof dispatchPreflightRecordKind;
  notificationDispatchPreflightDisposition: DispatchPreflightDisposition;
  timeWindowKey: string;
  expectedReadinessStatus: string;
  expectedNotificationInboxStatus: string;
  expectedOwnerReviewStatus: string;
  expectedAlertThresholdCount: number;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
  privateNoteRecorded: boolean;
  ownerDispatchPreflightRecorded: true;
  ownerEmailSendEnabled: false;
  queueDispatchEnabled: false;
  customerAlertEnabled: false;
  trafficRoutingEnabled: false;
  automatedWinnerEnabled: false;
  revenueClaimEnabled: false;
  rawAnalyticsRowsExposed: false;
  recipientIdentityIncluded: false;
  emailBodyIncluded: false;
  providerMessageIdIncluded: false;
  queuePayloadIncluded: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type AnalyticsNotificationDispatchPreflightSummary = {
  id: "analytics-notification-dispatch-preflight-contract";
  status: typeof analyticsNotificationDispatchPreflightStatus;
  issue: typeof analyticsNotificationDispatchPreflightIssue;
  parentIssue: 18;
  apiRoute: typeof analyticsNotificationDispatchPreflightApiRoute;
  ownerRoute: typeof analyticsNotificationDispatchPreflightOwnerRoute;
  sourceDataRoute: "/analytics/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  readiness: {
    id: typeof analyticsNotificationReadinessId;
    status: typeof analyticsNotificationReadinessStatus;
    issue: typeof analyticsNotificationReadinessIssue;
    notificationInboxIssue: typeof analyticsNotificationInboxIssue;
    notificationInboxStatus: typeof analyticsNotificationInboxStatus;
    channelId: typeof analyticsNotificationAdminInboxChannelId;
    dashboardId: string;
    dashboardRevisionId: string;
    ownerReviewStatus: typeof ownerReviewStatus;
    alertThresholdCount: number;
  };
  confirmation: {
    required: true;
    text: typeof analyticsNotificationDispatchPreflightConfirmationText;
  };
  supportedDispatchPreflightDispositions: readonly DispatchPreflightDisposition[];
  defaultDispatchPreflightDisposition: DispatchPreflightDisposition;
  currentEvidenceByWindow: AnalyticsNotificationDispatchPreflightEvidence[];
  counts: {
    notificationDispatchPreflightRecords: number;
    ownerConfirmedRecords: number;
    ownerDispatchPreflightRecordedRecords: number;
    emailSendEnabledRecords: number;
    queueDispatchEnabledRecords: number;
    customerAlertEnabledRecords: number;
    trafficRoutingEnabledRecords: number;
    automatedWinnerEnabledRecords: number;
    revenueClaimEnabledRecords: number;
    rawAnalyticsRowsExposedRecords: number;
    recipientIdentityIncludedRecords: number;
    emailBodyIncludedRecords: number;
    providerMessageIdIncludedRecords: number;
    queuePayloadIncludedRecords: number;
  };
  latestRecords: AnalyticsNotificationDispatchPreflightPublic[];
  redaction: {
    privateDataIncluded: false;
    rawEventRowsIncluded: false;
    rawAssignmentRowsIncluded: false;
    contactAnalyticsIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    notificationRecipientIncluded: false;
    emailBodyIncluded: false;
    providerMessageIdIncluded: false;
    queuePayloadIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateDispatchPreflightInput = {
  dashboardId?: unknown;
  readinessId?: unknown;
  channelId?: unknown;
  inboxRecordId?: unknown;
  timeWindowKey?: unknown;
  notificationDispatchPreflightDisposition?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedReadinessStatus?: unknown;
  expectedNotificationInboxStatus?: unknown;
  expectedOwnerReviewStatus?: unknown;
  expectedAlertThresholdCount?: unknown;
  expectedConversionSampleSize?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateDispatchPreflightResult =
  | {
      ok: true;
      status: "analytics_notification_dispatch_preflight_recorded" | "analytics_notification_dispatch_preflight_replayed";
      duplicate: boolean;
      record: AnalyticsNotificationDispatchPreflightPublic;
      redaction: AnalyticsNotificationDispatchPreflightSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_readiness"
        | "unsupported_channel"
        | "unsupported_inbox_record"
        | "unsupported_notification_dispatch_preflight_disposition"
        | "sample_size_caveat_required"
        | "confirmation_required"
        | "stale_dashboard_revision"
        | "stale_readiness_status"
        | "stale_notification_inbox_status"
        | "stale_owner_review_status"
        | "stale_threshold_count"
        | "stale_analytics_evidence"
        | "stale_notification_inbox_evidence"
        | "idempotency_conflict"
        | "notification_dispatch_preflight_not_recorded";
      message: string;
      redaction: AnalyticsNotificationDispatchPreflightSummary["redaction"];
      currentDashboardRevisionId?: string;
      currentReadinessStatus?: string;
      currentNotificationInboxStatus?: string;
      currentOwnerReviewStatus?: string;
      currentAlertThresholdCount?: number;
      currentEvidence?: AnalyticsNotificationDispatchPreflightEvidence;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function redaction(): AnalyticsNotificationDispatchPreflightSummary["redaction"] {
  return {
    privateDataIncluded: false,
    rawEventRowsIncluded: false,
    rawAssignmentRowsIncluded: false,
    contactAnalyticsIncluded: false,
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    privateNoteIncluded: false,
    notificationRecipientIncluded: false,
    emailBodyIncluded: false,
    providerMessageIdIncluded: false,
    queuePayloadIncluded: false,
  };
}

function numberValue(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseString(value: unknown, maxLength = 220) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function parseInteger(value: unknown) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;
  if (!Number.isInteger(numeric) || numeric < 0) return null;
  return numeric;
}

function parseBoolean(value: unknown) {
  return value === true || value === "true";
}

function parseDisposition(value: unknown) {
  const parsed = parseString(value, 120);
  return supportedDispatchPreflightDispositions.find((disposition) => disposition === parsed) ?? null;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function emptyCounts(): AnalyticsNotificationDispatchPreflightSummary["counts"] {
  return {
    notificationDispatchPreflightRecords: 0,
    ownerConfirmedRecords: 0,
    ownerDispatchPreflightRecordedRecords: 0,
    emailSendEnabledRecords: 0,
    queueDispatchEnabledRecords: 0,
    customerAlertEnabledRecords: 0,
    trafficRoutingEnabledRecords: 0,
    automatedWinnerEnabledRecords: 0,
    revenueClaimEnabledRecords: 0,
    rawAnalyticsRowsExposedRecords: 0,
    recipientIdentityIncludedRecords: 0,
    emailBodyIncludedRecords: 0,
    providerMessageIdIncludedRecords: 0,
    queuePayloadIncludedRecords: 0,
  };
}

function emptySummary(
  source: AnalyticsNotificationDispatchPreflightSummary["source"],
  loadError: string | null,
): AnalyticsNotificationDispatchPreflightSummary {
  return {
    id: "analytics-notification-dispatch-preflight-contract",
    status: analyticsNotificationDispatchPreflightStatus,
    issue: analyticsNotificationDispatchPreflightIssue,
    parentIssue: 18,
    apiRoute: analyticsNotificationDispatchPreflightApiRoute,
    ownerRoute: analyticsNotificationDispatchPreflightOwnerRoute,
    sourceDataRoute: "/analytics/source-data",
    source,
    loadError,
    readiness: {
      id: analyticsNotificationReadinessId,
      status: analyticsNotificationReadinessStatus,
      issue: analyticsNotificationReadinessIssue,
      notificationInboxIssue: analyticsNotificationInboxIssue,
      notificationInboxStatus: analyticsNotificationInboxStatus,
      channelId: analyticsNotificationAdminInboxChannelId,
      dashboardId: analyticsDashboard.id,
      dashboardRevisionId: analyticsDashboard.revisionId,
      ownerReviewStatus,
      alertThresholdCount: analyticsNotificationThresholdIds.length,
    },
    confirmation: {
      required: true,
      text: analyticsNotificationDispatchPreflightConfirmationText,
    },
    supportedDispatchPreflightDispositions,
    defaultDispatchPreflightDisposition,
    currentEvidenceByWindow: [],
    counts: emptyCounts(),
    latestRecords: [],
    redaction: redaction(),
    privateFieldsExcluded: [
      "actorEmail",
      "actorEmailHash",
      "privateNote",
      "privateNoteSha256",
      "notificationRecipient",
      "emailBody",
      "providerMessageId",
      "queuePayload",
      "rawAnalyticsEventRows",
      "rawExperimentAssignmentRows",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #284 lets verified owners record redacted analytics notification dispatch preflight evidence after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox record checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible dispatch preflight evidence only; it does not send email, dispatch queues, call providers, create customer alerts, expose notification recipients, expose email bodies, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  };
}

function publicInboxReference(row: InboxReferenceRow): AnalyticsNotificationDispatchInboxReference {
  return {
    id: row.id,
    readinessId: row.readiness_id,
    channelId: row.channel_id,
    timeWindowKey: row.time_window_key,
    expectedReadinessStatus: row.expected_readiness_status,
    expectedOwnerReviewStatus: row.expected_owner_review_status,
    expectedAlertThresholdCount: numberValue(row.expected_alert_threshold_count),
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
    adminInboxRecordCreated: true,
    ownerEmailSendEnabled: false,
    queueDispatchEnabled: false,
    customerAlertEnabled: false,
    trafficRoutingEnabled: false,
    automatedWinnerEnabled: false,
    revenueClaimEnabled: false,
    rawAnalyticsRowsExposed: false,
    recipientIdentityIncluded: false,
    emailBodyIncluded: false,
    createdAt: createdAtIso(row.created_at),
  };
}

function publicRecord(row: DispatchPreflightRow, duplicate = false): AnalyticsNotificationDispatchPreflightPublic {
  return {
    id: row.id,
    dashboardId: row.dashboard_id,
    readinessId: row.readiness_id,
    channelId: row.channel_id,
    inboxRecordId: row.inbox_record_id,
    recordKind: row.record_kind,
    notificationDispatchPreflightDisposition: row.notification_dispatch_preflight_disposition,
    timeWindowKey: row.time_window_key,
    expectedReadinessStatus: row.expected_readiness_status,
    expectedNotificationInboxStatus: row.expected_notification_inbox_status,
    expectedOwnerReviewStatus: row.expected_owner_review_status,
    expectedAlertThresholdCount: numberValue(row.expected_alert_threshold_count),
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
    privateNoteRecorded: Boolean(row.private_note_sha256),
    ownerDispatchPreflightRecorded: true,
    ownerEmailSendEnabled: false,
    queueDispatchEnabled: false,
    customerAlertEnabled: false,
    trafficRoutingEnabled: false,
    automatedWinnerEnabled: false,
    revenueClaimEnabled: false,
    rawAnalyticsRowsExposed: false,
    recipientIdentityIncluded: false,
    emailBodyIncluded: false,
    providerMessageIdIncluded: false,
    queuePayloadIncluded: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
}

async function loadLatestInboxReference(db: D1Database, timeWindowKey: string) {
  const row = await db
    .prepare(
      `SELECT
        id, readiness_id, channel_id, time_window_key, expected_readiness_status,
        expected_owner_review_status, expected_alert_threshold_count, expected_conversion_sample_size,
        sample_size_caveat_acknowledged, admin_inbox_record_created, email_send_enabled,
        queue_dispatch_enabled, customer_alert_enabled, traffic_routing_enabled, automated_winner_enabled,
        revenue_claim_enabled, raw_analytics_rows_exposed, recipient_identity_included, email_body_included,
        created_at
       FROM analytics_notification_inbox_records
       WHERE dashboard_id = ?
         AND readiness_id = ?
         AND channel_id = ?
         AND time_window_key = ?
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(analyticsDashboard.id, analyticsNotificationReadinessId, analyticsNotificationAdminInboxChannelId, timeWindowKey)
    .first<InboxReferenceRow>();
  return row ?? null;
}

function isSafeCurrentInboxReference(row: InboxReferenceRow | null, evidence: AnalyticsNotificationDispatchPreflightEvidence) {
  return Boolean(
    row &&
      row.readiness_id === analyticsNotificationReadinessId &&
      row.channel_id === analyticsNotificationAdminInboxChannelId &&
      row.time_window_key === evidence.timeWindow.key &&
      row.expected_readiness_status === analyticsNotificationReadinessStatus &&
      row.expected_owner_review_status === ownerReviewStatus &&
      numberValue(row.expected_alert_threshold_count) === analyticsNotificationThresholdIds.length &&
      numberValue(row.expected_conversion_sample_size) === evidence.conversionSampleSize &&
      row.sample_size_caveat_acknowledged === 1 &&
      row.admin_inbox_record_created === 1 &&
      row.email_send_enabled === 0 &&
      row.queue_dispatch_enabled === 0 &&
      row.customer_alert_enabled === 0 &&
      row.traffic_routing_enabled === 0 &&
      row.automated_winner_enabled === 0 &&
      row.revenue_claim_enabled === 0 &&
      row.raw_analytics_rows_exposed === 0 &&
      row.recipient_identity_included === 0 &&
      row.email_body_included === 0,
  );
}

async function loadDispatchPreflightEvidence(
  db: D1Database,
  timeWindow: AnalyticsTimeWindow,
): Promise<AnalyticsNotificationDispatchPreflightEvidence> {
  const conversionReport = await loadAnalyticsFunnelConversionReport(db, analyticsDashboard, timeWindow);
  const conversionSampleSize = conversionReport.rows.reduce((total, row) => total + row.sampleSize, 0);
  const latestInboxRow = await loadLatestInboxReference(db, timeWindow.key);
  const evidenceWithoutInbox: AnalyticsNotificationDispatchPreflightEvidence = {
    timeWindow,
    dashboardId: analyticsDashboard.id,
    dashboardRevisionId: analyticsDashboard.revisionId,
    readinessId: analyticsNotificationReadinessId,
    readinessStatus: analyticsNotificationReadinessStatus,
    notificationInboxStatus: analyticsNotificationInboxStatus,
    channelId: analyticsNotificationAdminInboxChannelId,
    ownerReviewStatus,
    alertThresholdCount: analyticsNotificationThresholdIds.length,
    conversionSampleSize,
    sampleSizeCaveat: conversionReport.sampleSizeCaveat,
    sampleSizeCaveatAcknowledged: true,
    latestInboxRecord: latestInboxRow ? publicInboxReference(latestInboxRow) : null,
    inboxRecordRequired: true,
    inboxRecordCurrent: false,
    supportedDispatchPreflightDispositions,
    defaultDispatchPreflightDisposition,
    dispatchPreflightChecklist: [
      {
        id: "analytics-dispatch-check-readiness",
        title: "Notification readiness contract is current",
        status: "passed",
        evidence: `Issue #${analyticsNotificationReadinessIssue} records delivery readiness without sends, recipients, or email bodies.`,
      },
      {
        id: "analytics-dispatch-check-inbox-record",
        title: "Owner inbox record exists for the selected window",
        status: latestInboxRow ? "passed" : "blocked",
        evidence: latestInboxRow
          ? `Latest inbox record ${latestInboxRow.id} is available for ${timeWindow.key}.`
          : "Record owner notification inbox evidence before dispatch preflight evidence.",
      },
      {
        id: "analytics-dispatch-check-provider",
        title: "Provider send path remains disabled",
        status: "blocked",
        evidence: "No owner email provider, provider message ID, queue payload, or provider-send call is created in this slice.",
      },
      {
        id: "analytics-dispatch-check-recipient-body",
        title: "Recipient and body data stay excluded",
        status: "blocked",
        evidence: "Dispatch preflights record aggregate evidence only and do not store recipients, email bodies, or queue payloads.",
      },
      {
        id: "analytics-dispatch-check-owner-provider-review",
        title: "Owner provider review is still required",
        status: "external_required",
        evidence: "Live email dispatch needs future owner-approved provider, domain, body, unsubscribe, audit, and rate-limit evidence.",
      },
    ],
    ownerRecordAllowed: Boolean(latestInboxRow),
    ownerEmailSendEnabled: false,
    queueDispatchEnabled: false,
    customerAlertEnabled: false,
    trafficRoutingEnabled: false,
    automatedWinnerEnabled: false,
    revenueClaimEnabled: false,
    rawRowsIncluded: false,
    privateDataIncluded: false,
    recipientIdentityIncluded: false,
    emailBodyIncluded: false,
    providerMessageIdIncluded: false,
    queuePayloadIncluded: false,
  };
  return {
    ...evidenceWithoutInbox,
    inboxRecordCurrent: isSafeCurrentInboxReference(latestInboxRow, evidenceWithoutInbox),
    ownerRecordAllowed: isSafeCurrentInboxReference(latestInboxRow, evidenceWithoutInbox),
  };
}

async function loadAllDispatchPreflightEvidence(db: D1Database) {
  return Promise.all(analyticsTimeWindows.map((window) => loadDispatchPreflightEvidence(db, window)));
}

async function findRecordByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_notification_dispatch_preflight_records
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<DispatchPreflightRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS notification_dispatch_preflight_records,
        SUM(CASE WHEN confirmation_text_sha256 IS NOT NULL THEN 1 ELSE 0 END) AS owner_confirmed_records,
        SUM(owner_dispatch_preflight_recorded) AS owner_dispatch_preflight_recorded_records,
        SUM(email_send_enabled) AS email_send_enabled_records,
        SUM(queue_dispatch_enabled) AS queue_dispatch_enabled_records,
        SUM(customer_alert_enabled) AS customer_alert_enabled_records,
        SUM(traffic_routing_enabled) AS traffic_routing_enabled_records,
        SUM(automated_winner_enabled) AS automated_winner_enabled_records,
        SUM(revenue_claim_enabled) AS revenue_claim_enabled_records,
        SUM(raw_analytics_rows_exposed) AS raw_analytics_rows_exposed_records,
        SUM(recipient_identity_included) AS recipient_identity_included_records,
        SUM(email_body_included) AS email_body_included_records,
        SUM(provider_message_id_included) AS provider_message_id_included_records,
        SUM(queue_payload_included) AS queue_payload_included_records
       FROM analytics_notification_dispatch_preflight_records`,
    )
    .first<DispatchPreflightCountRow>();

  return {
    notificationDispatchPreflightRecords: numberValue(row?.notification_dispatch_preflight_records),
    ownerConfirmedRecords: numberValue(row?.owner_confirmed_records),
    ownerDispatchPreflightRecordedRecords: numberValue(row?.owner_dispatch_preflight_recorded_records),
    emailSendEnabledRecords: numberValue(row?.email_send_enabled_records),
    queueDispatchEnabledRecords: numberValue(row?.queue_dispatch_enabled_records),
    customerAlertEnabledRecords: numberValue(row?.customer_alert_enabled_records),
    trafficRoutingEnabledRecords: numberValue(row?.traffic_routing_enabled_records),
    automatedWinnerEnabledRecords: numberValue(row?.automated_winner_enabled_records),
    revenueClaimEnabledRecords: numberValue(row?.revenue_claim_enabled_records),
    rawAnalyticsRowsExposedRecords: numberValue(row?.raw_analytics_rows_exposed_records),
    recipientIdentityIncludedRecords: numberValue(row?.recipient_identity_included_records),
    emailBodyIncludedRecords: numberValue(row?.email_body_included_records),
    providerMessageIdIncludedRecords: numberValue(row?.provider_message_id_included_records),
    queuePayloadIncludedRecords: numberValue(row?.queue_payload_included_records),
  };
}

async function loadLatestRecords(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM analytics_notification_dispatch_preflight_records
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<DispatchPreflightRow>();
  return (result.results ?? []).map((row) => publicRecord(row, false));
}

export async function getAnalyticsNotificationDispatchPreflightSummary(
  dbInput?: D1Database,
): Promise<AnalyticsNotificationDispatchPreflightSummary> {
  try {
    const db = dbInput ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null),
      currentEvidenceByWindow: await loadAllDispatchPreflightEvidence(db),
      counts: await loadCounts(db),
      latestRecords: await loadLatestRecords(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load analytics notification dispatch preflights.",
    );
  }
}

export async function createAnalyticsNotificationDispatchPreflight(
  input: CreateDispatchPreflightInput,
): Promise<CreateDispatchPreflightResult> {
  const summaryRedaction = redaction();
  const dashboardId = parseString(input.dashboardId);
  const readinessId = parseString(input.readinessId);
  const channelId = parseString(input.channelId);
  const inboxRecordId = parseString(input.inboxRecordId);
  const timeWindowKey = parseString(input.timeWindowKey, 20) ?? defaultAnalyticsTimeWindow.key;
  const notificationDispatchPreflightDisposition = parseDisposition(input.notificationDispatchPreflightDisposition);
  const expectedDashboardRevisionId = parseString(input.expectedDashboardRevisionId);
  const expectedReadinessStatus = parseString(input.expectedReadinessStatus);
  const expectedNotificationInboxStatus = parseString(input.expectedNotificationInboxStatus);
  const expectedOwnerReviewStatus = parseString(input.expectedOwnerReviewStatus);
  const expectedAlertThresholdCount = parseInteger(input.expectedAlertThresholdCount);
  const expectedConversionSampleSize = parseInteger(input.expectedConversionSampleSize);
  const sampleSizeCaveatAcknowledged = parseBoolean(input.sampleSizeCaveatAcknowledged);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !dashboardId ||
    !readinessId ||
    !channelId ||
    !inboxRecordId ||
    !expectedDashboardRevisionId ||
    !expectedReadinessStatus ||
    !expectedNotificationInboxStatus ||
    !expectedOwnerReviewStatus ||
    expectedAlertThresholdCount === null ||
    expectedConversionSampleSize === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Dashboard, readiness, channel, inbox record, expected statuses, threshold count, conversion sample size, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (!notificationDispatchPreflightDisposition) {
    return {
      ok: false,
      status: "unsupported_notification_dispatch_preflight_disposition",
      message: "A supported analytics notification dispatch preflight disposition is required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== analyticsNotificationDispatchPreflightConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording analytics notification dispatch preflight evidence.",
      redaction: summaryRedaction,
    };
  }

  if (!sampleSizeCaveatAcknowledged) {
    return {
      ok: false,
      status: "sample_size_caveat_required",
      message: "The sample-size caveat must be acknowledged before recording analytics notification dispatch preflight evidence.",
      redaction: summaryRedaction,
    };
  }

  if (dashboardId !== analyticsDashboard.id) {
    return {
      ok: false,
      status: "invalid_request",
      message: "The analytics dashboard could not be found.",
      redaction: summaryRedaction,
    };
  }

  if (expectedDashboardRevisionId !== analyticsDashboard.revisionId) {
    return {
      ok: false,
      status: "stale_dashboard_revision",
      message: "The analytics dashboard revision changed before the dispatch preflight was recorded.",
      redaction: summaryRedaction,
      currentDashboardRevisionId: analyticsDashboard.revisionId,
    };
  }

  if (readinessId !== analyticsNotificationReadinessId) {
    return {
      ok: false,
      status: "unsupported_readiness",
      message: "The selected analytics notification readiness record is not supported.",
      redaction: summaryRedaction,
    };
  }

  if (channelId !== analyticsNotificationAdminInboxChannelId) {
    return {
      ok: false,
      status: "unsupported_channel",
      message: "Only the owner admin inbox notification channel can be recorded in this slice.",
      redaction: summaryRedaction,
    };
  }

  if (expectedReadinessStatus !== analyticsNotificationReadinessStatus) {
    return {
      ok: false,
      status: "stale_readiness_status",
      message: "The notification readiness status changed before the dispatch preflight was recorded.",
      redaction: summaryRedaction,
      currentReadinessStatus: analyticsNotificationReadinessStatus,
    };
  }

  if (expectedNotificationInboxStatus !== analyticsNotificationInboxStatus) {
    return {
      ok: false,
      status: "stale_notification_inbox_status",
      message: "The notification inbox contract changed before the dispatch preflight was recorded.",
      redaction: summaryRedaction,
      currentNotificationInboxStatus: analyticsNotificationInboxStatus,
    };
  }

  if (expectedOwnerReviewStatus !== ownerReviewStatus) {
    return {
      ok: false,
      status: "stale_owner_review_status",
      message: "The owner review status changed before the dispatch preflight was recorded.",
      redaction: summaryRedaction,
      currentOwnerReviewStatus: ownerReviewStatus,
    };
  }

  if (expectedAlertThresholdCount !== analyticsNotificationThresholdIds.length) {
    return {
      ok: false,
      status: "stale_threshold_count",
      message: "The notification threshold count changed before the dispatch preflight was recorded.",
      redaction: summaryRedaction,
      currentAlertThresholdCount: analyticsNotificationThresholdIds.length,
    };
  }

  const timeWindow = resolveAnalyticsTimeWindow(timeWindowKey);
  if (timeWindow.key !== timeWindowKey) {
    return {
      ok: false,
      status: "invalid_request",
      message: "The selected analytics time window is not supported.",
      redaction: summaryRedaction,
    };
  }

  const { db } = await getRuntime();
  const currentEvidence = await loadDispatchPreflightEvidence(db, timeWindow);
  if (expectedConversionSampleSize !== currentEvidence.conversionSampleSize) {
    return {
      ok: false,
      status: "stale_analytics_evidence",
      message: "The aggregate analytics evidence changed before the dispatch preflight was recorded.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (!currentEvidence.latestInboxRecord || currentEvidence.latestInboxRecord.id !== inboxRecordId) {
    return {
      ok: false,
      status: currentEvidence.latestInboxRecord ? "stale_notification_inbox_evidence" : "unsupported_inbox_record",
      message: currentEvidence.latestInboxRecord
        ? "A newer notification inbox record exists for the selected analytics window."
        : "A current notification inbox record is required before recording a dispatch preflight.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (!currentEvidence.inboxRecordCurrent || !currentEvidence.ownerRecordAllowed) {
    return {
      ok: false,
      status: "stale_notification_inbox_evidence",
      message: "The notification inbox evidence is not safe or current enough for dispatch preflight evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(analyticsNotificationDispatchPreflightConfirmationText);
  const existing = await findRecordByIdempotency(db, idempotencyKey);
  if (existing) {
    const sameRequest =
      existing.dashboard_id === dashboardId &&
      existing.readiness_id === readinessId &&
      existing.channel_id === channelId &&
      existing.inbox_record_id === inboxRecordId &&
      existing.record_kind === dispatchPreflightRecordKind &&
      existing.notification_dispatch_preflight_disposition === notificationDispatchPreflightDisposition &&
      existing.time_window_key === timeWindow.key &&
      existing.expected_dashboard_revision_id === expectedDashboardRevisionId &&
      existing.expected_readiness_status === expectedReadinessStatus &&
      existing.expected_notification_inbox_status === expectedNotificationInboxStatus &&
      existing.expected_owner_review_status === expectedOwnerReviewStatus &&
      numberValue(existing.expected_alert_threshold_count) === expectedAlertThresholdCount &&
      numberValue(existing.expected_conversion_sample_size) === expectedConversionSampleSize &&
      existing.sample_size_caveat_acknowledged === 1 &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256;
    if (!sameRequest) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "The idempotency key is already associated with a different notification dispatch preflight request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "analytics_notification_dispatch_preflight_replayed",
      duplicate: true,
      record: publicRecord(existing, true),
      redaction: summaryRedaction,
    };
  }

  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const recordId = `analytics-notification-dispatch-preflight-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO analytics_notification_dispatch_preflight_records (
        id, dashboard_id, readiness_id, channel_id, inbox_record_id, record_kind,
        notification_dispatch_preflight_disposition, time_window_key,
        expected_dashboard_revision_id, expected_readiness_status, expected_notification_inbox_status,
        expected_owner_review_status, expected_alert_threshold_count, expected_conversion_sample_size,
        sample_size_caveat_acknowledged, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, owner_dispatch_preflight_recorded,
        email_send_enabled, queue_dispatch_enabled, customer_alert_enabled, traffic_routing_enabled,
        automated_winner_enabled, revenue_claim_enabled, raw_analytics_rows_exposed,
        recipient_identity_included, email_body_included, provider_message_id_included,
        queue_payload_included, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      dashboardId,
      readinessId,
      channelId,
      inboxRecordId,
      dispatchPreflightRecordKind,
      notificationDispatchPreflightDisposition,
      timeWindow.key,
      expectedDashboardRevisionId,
      expectedReadinessStatus,
      expectedNotificationInboxStatus,
      expectedOwnerReviewStatus,
      expectedAlertThresholdCount,
      expectedConversionSampleSize,
      idempotencyKey,
      input.actor.userId ?? "unknown-owner",
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      JSON.stringify({
        issue: analyticsNotificationDispatchPreflightIssue,
        parentIssue: 18,
        readinessIssue: analyticsNotificationReadinessIssue,
        notificationInboxIssue: analyticsNotificationInboxIssue,
        inboxRecordId,
        channelId,
        notificationDispatchPreflightDisposition,
        sampleSizeCaveatAcknowledged: true,
        ownerDispatchPreflightRecorded: true,
        emailSendEnabled: false,
        queueDispatchEnabled: false,
        customerAlertEnabled: false,
        trafficRoutingEnabled: false,
        automatedWinnerEnabled: false,
        revenueClaimEnabled: false,
        rawAnalyticsRowsExposed: false,
        recipientIdentityIncluded: false,
        emailBodyIncluded: false,
        providerMessageIdIncluded: false,
        queuePayloadIncluded: false,
        privateDataIncluded: false,
      }),
    )
    .run();

  const record = await findRecordByIdempotency(db, idempotencyKey);
  if (!record) {
    return {
      ok: false,
      status: "notification_dispatch_preflight_not_recorded",
      message: "The analytics notification dispatch preflight could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "analytics_notification_dispatch_preflight_recorded",
    duplicate: false,
    record: publicRecord(record, false),
    redaction: summaryRedaction,
  };
}
