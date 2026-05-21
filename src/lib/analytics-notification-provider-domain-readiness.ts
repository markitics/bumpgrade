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
  analyticsNotificationDispatchPreflightIssue,
  analyticsNotificationDispatchPreflightStatus,
} from "@/lib/analytics-notification-dispatch-preflights";
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

export const analyticsNotificationProviderDomainReadinessIssue = 286;
export const analyticsNotificationProviderDomainReadinessStatus = "owner-analytics-notification-provider-domain-readiness-records-ready";
export const analyticsNotificationProviderDomainReadinessApiRoute =
  "/api/admin/analytics/notification-provider-domain-readiness";
export const analyticsNotificationProviderDomainReadinessOwnerRoute = "/admin/analytics";
export const analyticsNotificationProviderDomainReadinessConfirmationText =
  "Record Bumpgrade analytics notification provider/domain readiness evidence";

const ownerReviewStatus = "reviewed_with_caveats";
const providerDomainReadinessRecordKind = "owner_notification_provider_domain_readiness";
const defaultProviderDomainReadinessDisposition = "blocked_pending_provider_and_domain_review";
const supportedProviderDomainReadinessDispositions = [
  "blocked_pending_provider_and_domain_review",
  "provider_domain_ready_for_owner_review",
  "provider_contract_or_dns_missing",
] as const;

type Runtime = {
  db: D1Database;
};

type ProviderDomainReadinessDisposition = (typeof supportedProviderDomainReadinessDispositions)[number];

type DispatchPreflightReferenceRow = {
  id: string;
  readiness_id: string;
  channel_id: string;
  inbox_record_id: string;
  time_window_key: string;
  expected_readiness_status: string;
  expected_notification_inbox_status: string;
  expected_owner_review_status: string;
  expected_alert_threshold_count: number;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
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
  created_at: number;
};

type ProviderDomainReadinessCountRow = {
  notification_provider_domain_readiness_records: number;
  owner_confirmed_records: number;
  owner_provider_domain_readiness_recorded_records: number;
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
  provider_send_enabled_records: number;
  provider_called_records: number;
  provider_configured_records: number;
  provider_secret_included_records: number;
  sender_domain_configured_records: number;
  sender_domain_verified_records: number;
  sender_credential_included_records: number;
  private_dns_credentials_included_records: number;
};

type ProviderDomainReadinessRow = {
  id: string;
  dashboard_id: string;
  readiness_id: string;
  channel_id: string;
  inbox_record_id: string;
  dispatch_preflight_id: string;
  record_kind: typeof providerDomainReadinessRecordKind;
  notification_provider_domain_readiness_disposition: ProviderDomainReadinessDisposition;
  time_window_key: string;
  expected_dashboard_revision_id: string;
  expected_readiness_status: string;
  expected_notification_inbox_status: string;
  expected_notification_dispatch_preflight_status: string;
  expected_owner_review_status: string;
  expected_alert_threshold_count: number;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
  idempotency_key: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  owner_provider_domain_readiness_recorded: number;
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
  provider_send_enabled: number;
  provider_called: number;
  provider_configured: number;
  provider_secret_included: number;
  sender_domain_configured: number;
  sender_domain_verified: number;
  sender_credential_included: number;
  private_dns_credentials_included: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

type ProviderDomainReadinessChecklistItem = {
  id: string;
  title: string;
  status: "passed" | "blocked" | "external_required";
  evidence: string;
};

export type AnalyticsNotificationProviderDomainDispatchReference = {
  id: string;
  readinessId: string;
  channelId: string;
  inboxRecordId: string;
  timeWindowKey: string;
  expectedReadinessStatus: string;
  expectedNotificationInboxStatus: string;
  expectedOwnerReviewStatus: string;
  expectedAlertThresholdCount: number;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
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
};

export type AnalyticsNotificationProviderDomainReadinessEvidence = {
  timeWindow: AnalyticsTimeWindow;
  dashboardId: string;
  dashboardRevisionId: string;
  readinessId: typeof analyticsNotificationReadinessId;
  readinessStatus: typeof analyticsNotificationReadinessStatus;
  notificationInboxStatus: typeof analyticsNotificationInboxStatus;
  notificationDispatchPreflightStatus: typeof analyticsNotificationDispatchPreflightStatus;
  channelId: typeof analyticsNotificationAdminInboxChannelId;
  ownerReviewStatus: typeof ownerReviewStatus;
  alertThresholdCount: number;
  conversionSampleSize: number;
  sampleSizeCaveat: string;
  sampleSizeCaveatAcknowledged: true;
  latestDispatchPreflightRecord: AnalyticsNotificationProviderDomainDispatchReference | null;
  dispatchPreflightRecordRequired: true;
  dispatchPreflightRecordCurrent: boolean;
  supportedProviderDomainReadinessDispositions: readonly ProviderDomainReadinessDisposition[];
  defaultProviderDomainReadinessDisposition: ProviderDomainReadinessDisposition;
  providerDomainReadinessChecklist: ProviderDomainReadinessChecklistItem[];
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
  providerSendEnabled: false;
  providerCalled: false;
  providerConfigured: false;
  providerSecretIncluded: false;
  senderDomainConfigured: false;
  senderDomainVerified: false;
  senderCredentialIncluded: false;
  privateDnsCredentialsIncluded: false;
};

export type AnalyticsNotificationProviderDomainReadinessPublic = {
  id: string;
  dashboardId: string;
  readinessId: string;
  channelId: string;
  inboxRecordId: string;
  dispatchPreflightId: string;
  recordKind: typeof providerDomainReadinessRecordKind;
  notificationProviderDomainReadinessDisposition: ProviderDomainReadinessDisposition;
  timeWindowKey: string;
  expectedReadinessStatus: string;
  expectedNotificationInboxStatus: string;
  expectedNotificationDispatchPreflightStatus: string;
  expectedOwnerReviewStatus: string;
  expectedAlertThresholdCount: number;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
  privateNoteRecorded: boolean;
  ownerProviderDomainReadinessRecorded: true;
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
  providerSendEnabled: false;
  providerCalled: false;
  providerConfigured: false;
  providerSecretIncluded: false;
  senderDomainConfigured: false;
  senderDomainVerified: false;
  senderCredentialIncluded: false;
  privateDnsCredentialsIncluded: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type AnalyticsNotificationProviderDomainReadinessSummary = {
  id: "analytics-notification-provider-domain-readiness-contract";
  status: typeof analyticsNotificationProviderDomainReadinessStatus;
  issue: typeof analyticsNotificationProviderDomainReadinessIssue;
  parentIssue: 18;
  apiRoute: typeof analyticsNotificationProviderDomainReadinessApiRoute;
  ownerRoute: typeof analyticsNotificationProviderDomainReadinessOwnerRoute;
  sourceDataRoute: "/analytics/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  readiness: {
    id: typeof analyticsNotificationReadinessId;
    status: typeof analyticsNotificationReadinessStatus;
    issue: typeof analyticsNotificationReadinessIssue;
    notificationInboxIssue: typeof analyticsNotificationInboxIssue;
    notificationInboxStatus: typeof analyticsNotificationInboxStatus;
    notificationDispatchPreflightIssue: typeof analyticsNotificationDispatchPreflightIssue;
    notificationDispatchPreflightStatus: typeof analyticsNotificationDispatchPreflightStatus;
    channelId: typeof analyticsNotificationAdminInboxChannelId;
    dashboardId: string;
    dashboardRevisionId: string;
    ownerReviewStatus: typeof ownerReviewStatus;
    alertThresholdCount: number;
  };
  confirmation: {
    required: true;
    text: typeof analyticsNotificationProviderDomainReadinessConfirmationText;
  };
  supportedProviderDomainReadinessDispositions: readonly ProviderDomainReadinessDisposition[];
  defaultProviderDomainReadinessDisposition: ProviderDomainReadinessDisposition;
  currentEvidenceByWindow: AnalyticsNotificationProviderDomainReadinessEvidence[];
  counts: {
    notificationProviderDomainReadinessRecords: number;
    ownerConfirmedRecords: number;
    ownerProviderDomainReadinessRecordedRecords: number;
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
    providerSendEnabledRecords: number;
    providerCalledRecords: number;
    providerConfiguredRecords: number;
    providerSecretIncludedRecords: number;
    senderDomainConfiguredRecords: number;
    senderDomainVerifiedRecords: number;
    senderCredentialIncludedRecords: number;
    privateDnsCredentialsIncludedRecords: number;
  };
  latestRecords: AnalyticsNotificationProviderDomainReadinessPublic[];
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
    providerSendEnabled: false;
    providerCalled: false;
    providerConfigured: false;
    providerSecretIncluded: false;
    senderDomainConfigured: false;
    senderDomainVerified: false;
    senderCredentialIncluded: false;
    privateDnsCredentialsIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateProviderDomainReadinessInput = {
  dashboardId?: unknown;
  readinessId?: unknown;
  channelId?: unknown;
  inboxRecordId?: unknown;
  dispatchPreflightId?: unknown;
  timeWindowKey?: unknown;
  notificationProviderDomainReadinessDisposition?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedReadinessStatus?: unknown;
  expectedNotificationInboxStatus?: unknown;
  expectedNotificationDispatchPreflightStatus?: unknown;
  expectedOwnerReviewStatus?: unknown;
  expectedAlertThresholdCount?: unknown;
  expectedConversionSampleSize?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateProviderDomainReadinessResult =
  | {
      ok: true;
      status: "analytics_notification_provider_domain_readiness_recorded" | "analytics_notification_provider_domain_readiness_replayed";
      duplicate: boolean;
      record: AnalyticsNotificationProviderDomainReadinessPublic;
      redaction: AnalyticsNotificationProviderDomainReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_readiness"
        | "unsupported_channel"
        | "unsupported_inbox_record"
        | "unsupported_dispatch_preflight"
        | "unsupported_notification_provider_domain_readiness_disposition"
        | "sample_size_caveat_required"
        | "confirmation_required"
        | "stale_dashboard_revision"
        | "stale_readiness_status"
        | "stale_notification_inbox_status"
        | "stale_notification_dispatch_preflight_status"
        | "stale_owner_review_status"
        | "stale_threshold_count"
        | "stale_analytics_evidence"
        | "stale_notification_inbox_evidence"
        | "stale_notification_dispatch_preflight_evidence"
        | "idempotency_conflict"
        | "notification_provider_domain_readiness_not_recorded";
      message: string;
      redaction: AnalyticsNotificationProviderDomainReadinessSummary["redaction"];
      currentDashboardRevisionId?: string;
      currentReadinessStatus?: string;
      currentNotificationInboxStatus?: string;
      currentNotificationDispatchPreflightStatus?: string;
      currentOwnerReviewStatus?: string;
      currentAlertThresholdCount?: number;
      currentEvidence?: AnalyticsNotificationProviderDomainReadinessEvidence;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function redaction(): AnalyticsNotificationProviderDomainReadinessSummary["redaction"] {
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
    providerSendEnabled: false,
    providerCalled: false,
    providerConfigured: false,
    providerSecretIncluded: false,
    senderDomainConfigured: false,
    senderDomainVerified: false,
    senderCredentialIncluded: false,
    privateDnsCredentialsIncluded: false,
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
  return supportedProviderDomainReadinessDispositions.find((disposition) => disposition === parsed) ?? null;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function emptyCounts(): AnalyticsNotificationProviderDomainReadinessSummary["counts"] {
  return {
    notificationProviderDomainReadinessRecords: 0,
    ownerConfirmedRecords: 0,
    ownerProviderDomainReadinessRecordedRecords: 0,
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
    providerSendEnabledRecords: 0,
    providerCalledRecords: 0,
    providerConfiguredRecords: 0,
    providerSecretIncludedRecords: 0,
    senderDomainConfiguredRecords: 0,
    senderDomainVerifiedRecords: 0,
    senderCredentialIncludedRecords: 0,
    privateDnsCredentialsIncludedRecords: 0,
  };
}

function emptySummary(
  source: AnalyticsNotificationProviderDomainReadinessSummary["source"],
  loadError: string | null,
): AnalyticsNotificationProviderDomainReadinessSummary {
  return {
    id: "analytics-notification-provider-domain-readiness-contract",
    status: analyticsNotificationProviderDomainReadinessStatus,
    issue: analyticsNotificationProviderDomainReadinessIssue,
    parentIssue: 18,
    apiRoute: analyticsNotificationProviderDomainReadinessApiRoute,
    ownerRoute: analyticsNotificationProviderDomainReadinessOwnerRoute,
    sourceDataRoute: "/analytics/source-data",
    source,
    loadError,
    readiness: {
      id: analyticsNotificationReadinessId,
      status: analyticsNotificationReadinessStatus,
      issue: analyticsNotificationReadinessIssue,
      notificationInboxIssue: analyticsNotificationInboxIssue,
      notificationInboxStatus: analyticsNotificationInboxStatus,
      notificationDispatchPreflightIssue: analyticsNotificationDispatchPreflightIssue,
      notificationDispatchPreflightStatus: analyticsNotificationDispatchPreflightStatus,
      channelId: analyticsNotificationAdminInboxChannelId,
      dashboardId: analyticsDashboard.id,
      dashboardRevisionId: analyticsDashboard.revisionId,
      ownerReviewStatus,
      alertThresholdCount: analyticsNotificationThresholdIds.length,
    },
    confirmation: {
      required: true,
      text: analyticsNotificationProviderDomainReadinessConfirmationText,
    },
    supportedProviderDomainReadinessDispositions,
    defaultProviderDomainReadinessDisposition,
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
      "providerSecret",
      "senderCredential",
      "senderDomainDnsRecord",
      "privateDnsCredentials",
      "providerConfiguration",
      "rawAnalyticsEventRows",
      "rawExperimentAssignmentRows",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #286 lets verified owners record redacted analytics notification provider/domain readiness evidence after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible provider/domain readiness evidence only; it does not send email, dispatch queues, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, create customer alerts, expose notification recipients, expose email bodies, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  };
}

function publicDispatchPreflightReference(
  row: DispatchPreflightReferenceRow,
): AnalyticsNotificationProviderDomainDispatchReference {
  return {
    id: row.id,
    readinessId: row.readiness_id,
    channelId: row.channel_id,
    inboxRecordId: row.inbox_record_id,
    timeWindowKey: row.time_window_key,
    expectedReadinessStatus: row.expected_readiness_status,
    expectedNotificationInboxStatus: row.expected_notification_inbox_status,
    expectedOwnerReviewStatus: row.expected_owner_review_status,
    expectedAlertThresholdCount: numberValue(row.expected_alert_threshold_count),
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
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
  };
}

function publicRecord(row: ProviderDomainReadinessRow, duplicate = false): AnalyticsNotificationProviderDomainReadinessPublic {
  return {
    id: row.id,
    dashboardId: row.dashboard_id,
    readinessId: row.readiness_id,
    channelId: row.channel_id,
    inboxRecordId: row.inbox_record_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    recordKind: row.record_kind,
    notificationProviderDomainReadinessDisposition: row.notification_provider_domain_readiness_disposition,
    timeWindowKey: row.time_window_key,
    expectedReadinessStatus: row.expected_readiness_status,
    expectedNotificationInboxStatus: row.expected_notification_inbox_status,
    expectedNotificationDispatchPreflightStatus: row.expected_notification_dispatch_preflight_status,
    expectedOwnerReviewStatus: row.expected_owner_review_status,
    expectedAlertThresholdCount: numberValue(row.expected_alert_threshold_count),
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
    privateNoteRecorded: Boolean(row.private_note_sha256),
    ownerProviderDomainReadinessRecorded: true,
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
    providerSendEnabled: false,
    providerCalled: false,
    providerConfigured: false,
    providerSecretIncluded: false,
    senderDomainConfigured: false,
    senderDomainVerified: false,
    senderCredentialIncluded: false,
    privateDnsCredentialsIncluded: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
}

async function loadLatestDispatchPreflightReference(db: D1Database, timeWindowKey: string) {
  const row = await db
    .prepare(
      `SELECT
        id, readiness_id, channel_id, inbox_record_id, time_window_key, expected_readiness_status,
        expected_notification_inbox_status, expected_owner_review_status, expected_alert_threshold_count,
        expected_conversion_sample_size, sample_size_caveat_acknowledged, owner_dispatch_preflight_recorded, email_send_enabled,
        queue_dispatch_enabled, customer_alert_enabled, traffic_routing_enabled, automated_winner_enabled,
        revenue_claim_enabled, raw_analytics_rows_exposed, recipient_identity_included, email_body_included,
        provider_message_id_included, queue_payload_included, created_at
       FROM analytics_notification_dispatch_preflight_records
       WHERE dashboard_id = ?
         AND readiness_id = ?
         AND channel_id = ?
         AND time_window_key = ?
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(analyticsDashboard.id, analyticsNotificationReadinessId, analyticsNotificationAdminInboxChannelId, timeWindowKey)
    .first<DispatchPreflightReferenceRow>();
  return row ?? null;
}

function isSafeCurrentDispatchPreflightReference(
  row: DispatchPreflightReferenceRow | null,
  evidence: AnalyticsNotificationProviderDomainReadinessEvidence,
) {
  return Boolean(
    row &&
      row.readiness_id === analyticsNotificationReadinessId &&
      row.channel_id === analyticsNotificationAdminInboxChannelId &&
      row.time_window_key === evidence.timeWindow.key &&
      row.expected_readiness_status === analyticsNotificationReadinessStatus &&
      row.expected_notification_inbox_status === analyticsNotificationInboxStatus &&
      row.expected_owner_review_status === ownerReviewStatus &&
      numberValue(row.expected_alert_threshold_count) === analyticsNotificationThresholdIds.length &&
      numberValue(row.expected_conversion_sample_size) === evidence.conversionSampleSize &&
      row.sample_size_caveat_acknowledged === 1 &&
      row.owner_dispatch_preflight_recorded === 1 &&
      row.email_send_enabled === 0 &&
      row.queue_dispatch_enabled === 0 &&
      row.customer_alert_enabled === 0 &&
      row.traffic_routing_enabled === 0 &&
      row.automated_winner_enabled === 0 &&
      row.revenue_claim_enabled === 0 &&
      row.raw_analytics_rows_exposed === 0 &&
      row.recipient_identity_included === 0 &&
      row.email_body_included === 0 &&
      row.provider_message_id_included === 0 &&
      row.queue_payload_included === 0,
  );
}

async function loadProviderDomainReadinessEvidence(
  db: D1Database,
  timeWindow: AnalyticsTimeWindow,
): Promise<AnalyticsNotificationProviderDomainReadinessEvidence> {
  const conversionReport = await loadAnalyticsFunnelConversionReport(db, analyticsDashboard, timeWindow);
  const conversionSampleSize = conversionReport.rows.reduce((total, row) => total + row.sampleSize, 0);
  const latestDispatchPreflightRow = await loadLatestDispatchPreflightReference(db, timeWindow.key);
  const evidenceWithoutDispatchPreflight: AnalyticsNotificationProviderDomainReadinessEvidence = {
    timeWindow,
    dashboardId: analyticsDashboard.id,
    dashboardRevisionId: analyticsDashboard.revisionId,
    readinessId: analyticsNotificationReadinessId,
    readinessStatus: analyticsNotificationReadinessStatus,
    notificationInboxStatus: analyticsNotificationInboxStatus,
    notificationDispatchPreflightStatus: analyticsNotificationDispatchPreflightStatus,
    channelId: analyticsNotificationAdminInboxChannelId,
    ownerReviewStatus,
    alertThresholdCount: analyticsNotificationThresholdIds.length,
    conversionSampleSize,
    sampleSizeCaveat: conversionReport.sampleSizeCaveat,
    sampleSizeCaveatAcknowledged: true,
    latestDispatchPreflightRecord: latestDispatchPreflightRow
      ? publicDispatchPreflightReference(latestDispatchPreflightRow)
      : null,
    dispatchPreflightRecordRequired: true,
    dispatchPreflightRecordCurrent: false,
    supportedProviderDomainReadinessDispositions,
    defaultProviderDomainReadinessDisposition,
    providerDomainReadinessChecklist: [
      {
        id: "analytics-provider-domain-check-readiness",
        title: "Notification readiness contract is current",
        status: "passed",
        evidence: `Issue #${analyticsNotificationReadinessIssue} records delivery readiness without sends, recipients, or email bodies.`,
      },
      {
        id: "analytics-provider-domain-check-dispatch-preflight",
        title: "Owner dispatch preflight exists for the selected window",
        status: latestDispatchPreflightRow ? "passed" : "blocked",
        evidence: latestDispatchPreflightRow
          ? `Latest dispatch preflight ${latestDispatchPreflightRow.id} is available for ${timeWindow.key}.`
          : "Record owner notification dispatch preflight evidence before provider/domain readiness evidence.",
      },
      {
        id: "analytics-provider-domain-check-provider-disabled",
        title: "Provider configuration remains disabled",
        status: "blocked",
        evidence:
          "No owner email provider is configured, no provider secret is stored, and no provider-send call is created.",
      },
      {
        id: "analytics-provider-domain-check-domain-external",
        title: "Sender domain verification remains external",
        status: "external_required",
        evidence:
          "This record tracks owner readiness only; it does not store private DNS credentials or claim live domain verification.",
      },
      {
        id: "analytics-provider-domain-check-recipient-body",
        title: "Recipient and body data stay excluded",
        status: "blocked",
        evidence:
          "Provider/domain readiness records store aggregate evidence only and do not store recipients, email bodies, provider message IDs, or queue payloads.",
      },
      {
        id: "analytics-provider-domain-check-send-disabled",
        title: "Owner email delivery is still disabled",
        status: "external_required",
        evidence: "Live email dispatch still needs future owner-approved body, unsubscribe, audit, and rate-limit evidence.",
      },
    ],
    ownerRecordAllowed: Boolean(latestDispatchPreflightRow),
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
    providerSendEnabled: false,
    providerCalled: false,
    providerConfigured: false,
    providerSecretIncluded: false,
    senderDomainConfigured: false,
    senderDomainVerified: false,
    senderCredentialIncluded: false,
    privateDnsCredentialsIncluded: false,
  };
  return {
    ...evidenceWithoutDispatchPreflight,
    dispatchPreflightRecordCurrent: isSafeCurrentDispatchPreflightReference(
      latestDispatchPreflightRow,
      evidenceWithoutDispatchPreflight,
    ),
    ownerRecordAllowed: isSafeCurrentDispatchPreflightReference(
      latestDispatchPreflightRow,
      evidenceWithoutDispatchPreflight,
    ),
  };
}

async function loadAllProviderDomainReadinessEvidence(db: D1Database) {
  return Promise.all(analyticsTimeWindows.map((window) => loadProviderDomainReadinessEvidence(db, window)));
}

async function findRecordByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_notification_provider_domain_readiness_records
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<ProviderDomainReadinessRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS notification_provider_domain_readiness_records,
        SUM(CASE WHEN confirmation_text_sha256 IS NOT NULL THEN 1 ELSE 0 END) AS owner_confirmed_records,
        SUM(owner_provider_domain_readiness_recorded) AS owner_provider_domain_readiness_recorded_records,
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
        SUM(queue_payload_included) AS queue_payload_included_records,
        SUM(provider_send_enabled) AS provider_send_enabled_records,
        SUM(provider_called) AS provider_called_records,
        SUM(provider_configured) AS provider_configured_records,
        SUM(provider_secret_included) AS provider_secret_included_records,
        SUM(sender_domain_configured) AS sender_domain_configured_records,
        SUM(sender_domain_verified) AS sender_domain_verified_records,
        SUM(sender_credential_included) AS sender_credential_included_records,
        SUM(private_dns_credentials_included) AS private_dns_credentials_included_records
       FROM analytics_notification_provider_domain_readiness_records`,
    )
    .first<ProviderDomainReadinessCountRow>();

  return {
    notificationProviderDomainReadinessRecords: numberValue(row?.notification_provider_domain_readiness_records),
    ownerConfirmedRecords: numberValue(row?.owner_confirmed_records),
    ownerProviderDomainReadinessRecordedRecords: numberValue(row?.owner_provider_domain_readiness_recorded_records),
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
    providerSendEnabledRecords: numberValue(row?.provider_send_enabled_records),
    providerCalledRecords: numberValue(row?.provider_called_records),
    providerConfiguredRecords: numberValue(row?.provider_configured_records),
    providerSecretIncludedRecords: numberValue(row?.provider_secret_included_records),
    senderDomainConfiguredRecords: numberValue(row?.sender_domain_configured_records),
    senderDomainVerifiedRecords: numberValue(row?.sender_domain_verified_records),
    senderCredentialIncludedRecords: numberValue(row?.sender_credential_included_records),
    privateDnsCredentialsIncludedRecords: numberValue(row?.private_dns_credentials_included_records),
  };
}

async function loadLatestRecords(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM analytics_notification_provider_domain_readiness_records
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<ProviderDomainReadinessRow>();
  return (result.results ?? []).map((row) => publicRecord(row, false));
}

export async function getAnalyticsNotificationProviderDomainReadinessSummary(
  dbInput?: D1Database,
): Promise<AnalyticsNotificationProviderDomainReadinessSummary> {
  try {
    const db = dbInput ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null),
      currentEvidenceByWindow: await loadAllProviderDomainReadinessEvidence(db),
      counts: await loadCounts(db),
      latestRecords: await loadLatestRecords(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load analytics notification provider/domain readiness records.",
    );
  }
}

export async function createAnalyticsNotificationProviderDomainReadiness(
  input: CreateProviderDomainReadinessInput,
): Promise<CreateProviderDomainReadinessResult> {
  const summaryRedaction = redaction();
  const dashboardId = parseString(input.dashboardId);
  const readinessId = parseString(input.readinessId);
  const channelId = parseString(input.channelId);
  const inboxRecordId = parseString(input.inboxRecordId);
  const dispatchPreflightId = parseString(input.dispatchPreflightId);
  const timeWindowKey = parseString(input.timeWindowKey, 20) ?? defaultAnalyticsTimeWindow.key;
  const notificationProviderDomainReadinessDisposition = parseDisposition(input.notificationProviderDomainReadinessDisposition);
  const expectedDashboardRevisionId = parseString(input.expectedDashboardRevisionId);
  const expectedReadinessStatus = parseString(input.expectedReadinessStatus);
  const expectedNotificationInboxStatus = parseString(input.expectedNotificationInboxStatus);
  const expectedNotificationDispatchPreflightStatus = parseString(input.expectedNotificationDispatchPreflightStatus);
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
    !dispatchPreflightId ||
    !expectedDashboardRevisionId ||
    !expectedReadinessStatus ||
    !expectedNotificationInboxStatus ||
    !expectedNotificationDispatchPreflightStatus ||
    !expectedOwnerReviewStatus ||
    expectedAlertThresholdCount === null ||
    expectedConversionSampleSize === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Dashboard, readiness, channel, inbox record, dispatch preflight, expected statuses, threshold count, conversion sample size, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (!notificationProviderDomainReadinessDisposition) {
    return {
      ok: false,
      status: "unsupported_notification_provider_domain_readiness_disposition",
      message: "A supported analytics notification provider/domain readiness disposition is required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== analyticsNotificationProviderDomainReadinessConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording analytics notification provider/domain readiness evidence.",
      redaction: summaryRedaction,
    };
  }

  if (!sampleSizeCaveatAcknowledged) {
    return {
      ok: false,
      status: "sample_size_caveat_required",
      message: "The sample-size caveat must be acknowledged before recording analytics notification provider/domain readiness evidence.",
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
      message: "The analytics dashboard revision changed before the provider/domain readiness was recorded.",
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
      message: "The notification readiness status changed before the provider/domain readiness was recorded.",
      redaction: summaryRedaction,
      currentReadinessStatus: analyticsNotificationReadinessStatus,
    };
  }

  if (expectedNotificationInboxStatus !== analyticsNotificationInboxStatus) {
    return {
      ok: false,
      status: "stale_notification_inbox_status",
      message: "The notification inbox contract changed before the provider/domain readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationInboxStatus: analyticsNotificationInboxStatus,
    };
  }

  if (expectedNotificationDispatchPreflightStatus !== analyticsNotificationDispatchPreflightStatus) {
    return {
      ok: false,
      status: "stale_notification_dispatch_preflight_status",
      message: "The notification dispatch preflight contract changed before the provider/domain readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationDispatchPreflightStatus: analyticsNotificationDispatchPreflightStatus,
    };
  }

  if (expectedOwnerReviewStatus !== ownerReviewStatus) {
    return {
      ok: false,
      status: "stale_owner_review_status",
      message: "The owner review status changed before the provider/domain readiness was recorded.",
      redaction: summaryRedaction,
      currentOwnerReviewStatus: ownerReviewStatus,
    };
  }

  if (expectedAlertThresholdCount !== analyticsNotificationThresholdIds.length) {
    return {
      ok: false,
      status: "stale_threshold_count",
      message: "The notification threshold count changed before the provider/domain readiness was recorded.",
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
  const currentEvidence = await loadProviderDomainReadinessEvidence(db, timeWindow);
  if (expectedConversionSampleSize !== currentEvidence.conversionSampleSize) {
    return {
      ok: false,
      status: "stale_analytics_evidence",
      message: "The aggregate analytics evidence changed before the provider/domain readiness was recorded.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (
    !currentEvidence.latestDispatchPreflightRecord ||
    currentEvidence.latestDispatchPreflightRecord.id !== dispatchPreflightId
  ) {
    return {
      ok: false,
      status: currentEvidence.latestDispatchPreflightRecord
        ? "stale_notification_dispatch_preflight_evidence"
        : "unsupported_dispatch_preflight",
      message: currentEvidence.latestDispatchPreflightRecord
        ? "A newer notification dispatch preflight exists for the selected analytics window."
        : "A current notification dispatch preflight is required before recording provider/domain readiness.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (currentEvidence.latestDispatchPreflightRecord.inboxRecordId !== inboxRecordId) {
    return {
      ok: false,
      status: "stale_notification_inbox_evidence",
      message: "The notification inbox record no longer matches the current dispatch preflight evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (!currentEvidence.dispatchPreflightRecordCurrent || !currentEvidence.ownerRecordAllowed) {
    return {
      ok: false,
      status: "stale_notification_dispatch_preflight_evidence",
      message: "The notification dispatch preflight evidence is not safe or current enough for provider/domain readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(analyticsNotificationProviderDomainReadinessConfirmationText);
  const existing = await findRecordByIdempotency(db, idempotencyKey);
  if (existing) {
    const sameRequest =
      existing.dashboard_id === dashboardId &&
      existing.readiness_id === readinessId &&
      existing.channel_id === channelId &&
      existing.inbox_record_id === inboxRecordId &&
      existing.dispatch_preflight_id === dispatchPreflightId &&
      existing.record_kind === providerDomainReadinessRecordKind &&
      existing.notification_provider_domain_readiness_disposition === notificationProviderDomainReadinessDisposition &&
      existing.time_window_key === timeWindow.key &&
      existing.expected_dashboard_revision_id === expectedDashboardRevisionId &&
      existing.expected_readiness_status === expectedReadinessStatus &&
      existing.expected_notification_inbox_status === expectedNotificationInboxStatus &&
      existing.expected_notification_dispatch_preflight_status === expectedNotificationDispatchPreflightStatus &&
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
        message: "The idempotency key is already associated with a different notification provider/domain readiness request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "analytics_notification_provider_domain_readiness_replayed",
      duplicate: true,
      record: publicRecord(existing, true),
      redaction: summaryRedaction,
    };
  }

  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const recordId = `analytics-notification-provider-domain-readiness-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO analytics_notification_provider_domain_readiness_records (
        id, dashboard_id, readiness_id, channel_id, inbox_record_id, dispatch_preflight_id, record_kind,
        notification_provider_domain_readiness_disposition, time_window_key,
        expected_dashboard_revision_id, expected_readiness_status, expected_notification_inbox_status,
        expected_notification_dispatch_preflight_status, expected_owner_review_status,
        expected_alert_threshold_count, expected_conversion_sample_size,
        sample_size_caveat_acknowledged, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, owner_provider_domain_readiness_recorded,
        email_send_enabled, queue_dispatch_enabled, customer_alert_enabled, traffic_routing_enabled,
        automated_winner_enabled, revenue_claim_enabled, raw_analytics_rows_exposed,
        recipient_identity_included, email_body_included, provider_message_id_included,
        queue_payload_included, provider_send_enabled, provider_called, provider_configured,
        provider_secret_included, sender_domain_configured, sender_domain_verified,
        sender_credential_included, private_dns_credentials_included, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      dashboardId,
      readinessId,
      channelId,
      inboxRecordId,
      dispatchPreflightId,
      providerDomainReadinessRecordKind,
      notificationProviderDomainReadinessDisposition,
      timeWindow.key,
      expectedDashboardRevisionId,
      expectedReadinessStatus,
      expectedNotificationInboxStatus,
      expectedNotificationDispatchPreflightStatus,
      expectedOwnerReviewStatus,
      expectedAlertThresholdCount,
      expectedConversionSampleSize,
      idempotencyKey,
      input.actor.userId ?? "unknown-owner",
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      JSON.stringify({
        issue: analyticsNotificationProviderDomainReadinessIssue,
        parentIssue: 18,
        readinessIssue: analyticsNotificationReadinessIssue,
        notificationInboxIssue: analyticsNotificationInboxIssue,
        notificationDispatchPreflightIssue: analyticsNotificationDispatchPreflightIssue,
        inboxRecordId,
        dispatchPreflightId,
        channelId,
        notificationProviderDomainReadinessDisposition,
        sampleSizeCaveatAcknowledged: true,
        ownerProviderDomainReadinessRecorded: true,
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
        providerSendEnabled: false,
        providerCalled: false,
        providerConfigured: false,
        providerSecretIncluded: false,
        senderDomainConfigured: false,
        senderDomainVerified: false,
        senderCredentialIncluded: false,
        privateDnsCredentialsIncluded: false,
        privateDataIncluded: false,
      }),
    )
    .run();

  const record = await findRecordByIdempotency(db, idempotencyKey);
  if (!record) {
    return {
      ok: false,
      status: "notification_provider_domain_readiness_not_recorded",
      message: "The analytics notification provider/domain readiness could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "analytics_notification_provider_domain_readiness_recorded",
    duplicate: false,
    record: publicRecord(record, false),
    redaction: summaryRedaction,
  };
}
