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
  analyticsNotificationProviderDomainReadinessIssue,
  analyticsNotificationProviderDomainReadinessStatus,
} from "@/lib/analytics-notification-provider-domain-readiness";
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

export const analyticsNotificationContentConsentReadinessIssue = 288;
export const analyticsNotificationContentConsentReadinessStatus = "owner-analytics-notification-content-consent-readiness-records-ready";
export const analyticsNotificationContentConsentReadinessApiRoute =
  "/api/admin/analytics/notification-content-consent-readiness";
export const analyticsNotificationContentConsentReadinessOwnerRoute = "/admin/analytics";
export const analyticsNotificationContentConsentReadinessConfirmationText =
  "Record Bumpgrade analytics notification content/consent readiness evidence";

const ownerReviewStatus = "reviewed_with_caveats";
const contentConsentReadinessRecordKind = "owner_notification_content_consent_readiness";
const defaultContentConsentReadinessDisposition = "blocked_pending_content_consent_review";
const supportedContentConsentReadinessDispositions = [
  "blocked_pending_content_consent_review",
  "content_consent_ready_for_owner_review",
  "body_unsubscribe_rate_limit_or_audit_missing",
] as const;

type Runtime = {
  db: D1Database;
};

type ContentConsentReadinessDisposition = (typeof supportedContentConsentReadinessDispositions)[number];

type ProviderDomainReadinessReferenceRow = {
  id: string;
  readiness_id: string;
  channel_id: string;
  inbox_record_id: string;
  dispatch_preflight_id: string;
  time_window_key: string;
  expected_readiness_status: string;
  expected_notification_inbox_status: string;
  expected_notification_dispatch_preflight_status: string;
  expected_owner_review_status: string;
  expected_alert_threshold_count: number;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
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
  created_at: number;
};

type ContentConsentReadinessCountRow = {
  notification_content_consent_readiness_records: number;
  owner_confirmed_records: number;
  owner_content_consent_readiness_recorded_records: number;
  body_template_reviewed_records: number;
  unsubscribe_link_reviewed_records: number;
  rate_limit_reviewed_records: number;
  audit_correlation_reviewed_records: number;
  retention_policy_reviewed_records: number;
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

type ContentConsentReadinessRow = {
  id: string;
  dashboard_id: string;
  readiness_id: string;
  channel_id: string;
  inbox_record_id: string;
  dispatch_preflight_id: string;
  provider_domain_readiness_id: string;
  record_kind: typeof contentConsentReadinessRecordKind;
  notification_content_consent_readiness_disposition: ContentConsentReadinessDisposition;
  time_window_key: string;
  expected_dashboard_revision_id: string;
  expected_readiness_status: string;
  expected_notification_inbox_status: string;
  expected_notification_dispatch_preflight_status: string;
  expected_notification_provider_domain_readiness_status: string;
  expected_owner_review_status: string;
  expected_alert_threshold_count: number;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
  idempotency_key: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  owner_content_consent_readiness_recorded: number;
  body_template_reviewed: number;
  unsubscribe_link_reviewed: number;
  rate_limit_reviewed: number;
  audit_correlation_reviewed: number;
  retention_policy_reviewed: number;
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

type ContentConsentReadinessChecklistItem = {
  id: string;
  title: string;
  status: "passed" | "blocked" | "external_required";
  evidence: string;
};

export type AnalyticsNotificationContentConsentProviderDomainReadinessReference = {
  id: string;
  readinessId: string;
  channelId: string;
  inboxRecordId: string;
  dispatchPreflightId: string;
  timeWindowKey: string;
  expectedReadinessStatus: string;
  expectedNotificationInboxStatus: string;
  expectedNotificationDispatchPreflightStatus: string;
  expectedNotificationProviderDomainReadinessStatus: string;
  expectedOwnerReviewStatus: string;
  expectedAlertThresholdCount: number;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
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
};

export type AnalyticsNotificationContentConsentReadinessEvidence = {
  timeWindow: AnalyticsTimeWindow;
  dashboardId: string;
  dashboardRevisionId: string;
  readinessId: typeof analyticsNotificationReadinessId;
  readinessStatus: typeof analyticsNotificationReadinessStatus;
  notificationInboxStatus: typeof analyticsNotificationInboxStatus;
  notificationDispatchPreflightStatus: typeof analyticsNotificationDispatchPreflightStatus;
  notificationProviderDomainReadinessStatus: typeof analyticsNotificationProviderDomainReadinessStatus;
  channelId: typeof analyticsNotificationAdminInboxChannelId;
  ownerReviewStatus: typeof ownerReviewStatus;
  alertThresholdCount: number;
  conversionSampleSize: number;
  sampleSizeCaveat: string;
  sampleSizeCaveatAcknowledged: true;
  latestProviderDomainReadinessRecord: AnalyticsNotificationContentConsentProviderDomainReadinessReference | null;
  providerDomainReadinessRecordRequired: true;
  providerDomainReadinessRecordCurrent: boolean;
  supportedContentConsentReadinessDispositions: readonly ContentConsentReadinessDisposition[];
  defaultContentConsentReadinessDisposition: ContentConsentReadinessDisposition;
  contentConsentReadinessChecklist: ContentConsentReadinessChecklistItem[];
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
  bodyTemplateReviewed: true;
  unsubscribeLinkReviewed: true;
  rateLimitReviewed: true;
  auditCorrelationReviewed: true;
  retentionPolicyReviewed: true;
  providerSendEnabled: false;
  providerCalled: false;
  providerConfigured: false;
  providerSecretIncluded: false;
  senderDomainConfigured: false;
  senderDomainVerified: false;
  senderCredentialIncluded: false;
  privateDnsCredentialsIncluded: false;
};

export type AnalyticsNotificationContentConsentReadinessPublic = {
  id: string;
  dashboardId: string;
  readinessId: string;
  channelId: string;
  inboxRecordId: string;
  dispatchPreflightId: string;
  providerDomainReadinessId: string;
  recordKind: typeof contentConsentReadinessRecordKind;
  notificationContentConsentReadinessDisposition: ContentConsentReadinessDisposition;
  timeWindowKey: string;
  expectedReadinessStatus: string;
  expectedNotificationInboxStatus: string;
  expectedNotificationDispatchPreflightStatus: string;
  expectedNotificationProviderDomainReadinessStatus: string;
  expectedOwnerReviewStatus: string;
  expectedAlertThresholdCount: number;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
  privateNoteRecorded: boolean;
  ownerContentConsentReadinessRecorded: true;
  bodyTemplateReviewed: true;
  unsubscribeLinkReviewed: true;
  rateLimitReviewed: true;
  auditCorrelationReviewed: true;
  retentionPolicyReviewed: true;
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

export type AnalyticsNotificationContentConsentReadinessSummary = {
  id: "analytics-notification-content-consent-readiness-contract";
  status: typeof analyticsNotificationContentConsentReadinessStatus;
  issue: typeof analyticsNotificationContentConsentReadinessIssue;
  parentIssue: 18;
  apiRoute: typeof analyticsNotificationContentConsentReadinessApiRoute;
  ownerRoute: typeof analyticsNotificationContentConsentReadinessOwnerRoute;
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
    notificationProviderDomainReadinessIssue: typeof analyticsNotificationProviderDomainReadinessIssue;
    notificationProviderDomainReadinessStatus: typeof analyticsNotificationProviderDomainReadinessStatus;
    channelId: typeof analyticsNotificationAdminInboxChannelId;
    dashboardId: string;
    dashboardRevisionId: string;
    ownerReviewStatus: typeof ownerReviewStatus;
    alertThresholdCount: number;
  };
  confirmation: {
    required: true;
    text: typeof analyticsNotificationContentConsentReadinessConfirmationText;
  };
  supportedContentConsentReadinessDispositions: readonly ContentConsentReadinessDisposition[];
  defaultContentConsentReadinessDisposition: ContentConsentReadinessDisposition;
  currentEvidenceByWindow: AnalyticsNotificationContentConsentReadinessEvidence[];
  counts: {
    notificationContentConsentReadinessRecords: number;
    ownerConfirmedRecords: number;
    ownerContentConsentReadinessRecordedRecords: number;
    bodyTemplateReviewedRecords: number;
    unsubscribeLinkReviewedRecords: number;
    rateLimitReviewedRecords: number;
    auditCorrelationReviewedRecords: number;
    retentionPolicyReviewedRecords: number;
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
  latestRecords: AnalyticsNotificationContentConsentReadinessPublic[];
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
    bodyTemplateIncluded: false;
    unsubscribeUrlIncluded: false;
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

type CreateContentConsentReadinessInput = {
  dashboardId?: unknown;
  readinessId?: unknown;
  channelId?: unknown;
  inboxRecordId?: unknown;
  dispatchPreflightId?: unknown;
  providerDomainReadinessId?: unknown;
  timeWindowKey?: unknown;
  notificationContentConsentReadinessDisposition?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedReadinessStatus?: unknown;
  expectedNotificationInboxStatus?: unknown;
  expectedNotificationDispatchPreflightStatus?: unknown;
  expectedNotificationProviderDomainReadinessStatus?: unknown;
  expectedOwnerReviewStatus?: unknown;
  expectedAlertThresholdCount?: unknown;
  expectedConversionSampleSize?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateContentConsentReadinessResult =
  | {
      ok: true;
      status: "analytics_notification_content_consent_readiness_recorded" | "analytics_notification_content_consent_readiness_replayed";
      duplicate: boolean;
      record: AnalyticsNotificationContentConsentReadinessPublic;
      redaction: AnalyticsNotificationContentConsentReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_readiness"
        | "unsupported_channel"
        | "unsupported_provider_domain_readiness"
        | "unsupported_notification_content_consent_readiness_disposition"
        | "sample_size_caveat_required"
        | "confirmation_required"
        | "stale_dashboard_revision"
        | "stale_readiness_status"
        | "stale_notification_inbox_status"
        | "stale_notification_dispatch_preflight_status"
        | "stale_notification_provider_domain_readiness_status"
        | "stale_owner_review_status"
        | "stale_threshold_count"
        | "stale_analytics_evidence"
        | "stale_notification_inbox_evidence"
        | "stale_notification_dispatch_preflight_evidence"
        | "stale_notification_provider_domain_readiness_evidence"
        | "idempotency_conflict"
        | "notification_content_consent_readiness_not_recorded";
      message: string;
      redaction: AnalyticsNotificationContentConsentReadinessSummary["redaction"];
      currentDashboardRevisionId?: string;
      currentReadinessStatus?: string;
      currentNotificationInboxStatus?: string;
      currentNotificationDispatchPreflightStatus?: string;
      currentNotificationProviderDomainReadinessStatus?: string;
      currentOwnerReviewStatus?: string;
      currentAlertThresholdCount?: number;
      currentEvidence?: AnalyticsNotificationContentConsentReadinessEvidence;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function redaction(): AnalyticsNotificationContentConsentReadinessSummary["redaction"] {
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
    bodyTemplateIncluded: false,
    unsubscribeUrlIncluded: false,
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
  return supportedContentConsentReadinessDispositions.find((disposition) => disposition === parsed) ?? null;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function emptyCounts(): AnalyticsNotificationContentConsentReadinessSummary["counts"] {
  return {
    notificationContentConsentReadinessRecords: 0,
    ownerConfirmedRecords: 0,
    ownerContentConsentReadinessRecordedRecords: 0,
    bodyTemplateReviewedRecords: 0,
    unsubscribeLinkReviewedRecords: 0,
    rateLimitReviewedRecords: 0,
    auditCorrelationReviewedRecords: 0,
    retentionPolicyReviewedRecords: 0,
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
  source: AnalyticsNotificationContentConsentReadinessSummary["source"],
  loadError: string | null,
): AnalyticsNotificationContentConsentReadinessSummary {
  return {
    id: "analytics-notification-content-consent-readiness-contract",
    status: analyticsNotificationContentConsentReadinessStatus,
    issue: analyticsNotificationContentConsentReadinessIssue,
    parentIssue: 18,
    apiRoute: analyticsNotificationContentConsentReadinessApiRoute,
    ownerRoute: analyticsNotificationContentConsentReadinessOwnerRoute,
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
      notificationProviderDomainReadinessIssue: analyticsNotificationProviderDomainReadinessIssue,
      notificationProviderDomainReadinessStatus: analyticsNotificationProviderDomainReadinessStatus,
      channelId: analyticsNotificationAdminInboxChannelId,
      dashboardId: analyticsDashboard.id,
      dashboardRevisionId: analyticsDashboard.revisionId,
      ownerReviewStatus,
      alertThresholdCount: analyticsNotificationThresholdIds.length,
    },
    confirmation: {
      required: true,
      text: analyticsNotificationContentConsentReadinessConfirmationText,
    },
    supportedContentConsentReadinessDispositions,
    defaultContentConsentReadinessDisposition,
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
      "bodyTemplate",
      "unsubscribeUrl",
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
      "Issue #288 lets verified owners record redacted analytics notification content/consent readiness evidence after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, current provider/domain readiness checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible content, unsubscribe, rate-limit, audit-correlation, and retention readiness evidence only; it does not send email, dispatch queues, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, create customer alerts, expose notification recipients, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  };
}

function publicProviderDomainReadinessReference(
  row: ProviderDomainReadinessReferenceRow,
): AnalyticsNotificationContentConsentProviderDomainReadinessReference {
  return {
    id: row.id,
    readinessId: row.readiness_id,
    channelId: row.channel_id,
    inboxRecordId: row.inbox_record_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    timeWindowKey: row.time_window_key,
    expectedReadinessStatus: row.expected_readiness_status,
    expectedNotificationInboxStatus: row.expected_notification_inbox_status,
    expectedNotificationDispatchPreflightStatus: row.expected_notification_dispatch_preflight_status,
    expectedNotificationProviderDomainReadinessStatus: analyticsNotificationProviderDomainReadinessStatus,
    expectedOwnerReviewStatus: row.expected_owner_review_status,
    expectedAlertThresholdCount: numberValue(row.expected_alert_threshold_count),
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
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
  };
}

function publicRecord(row: ContentConsentReadinessRow, duplicate = false): AnalyticsNotificationContentConsentReadinessPublic {
  return {
    id: row.id,
    dashboardId: row.dashboard_id,
    readinessId: row.readiness_id,
    channelId: row.channel_id,
    inboxRecordId: row.inbox_record_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    providerDomainReadinessId: row.provider_domain_readiness_id,
    recordKind: row.record_kind,
    notificationContentConsentReadinessDisposition: row.notification_content_consent_readiness_disposition,
    timeWindowKey: row.time_window_key,
    expectedReadinessStatus: row.expected_readiness_status,
    expectedNotificationInboxStatus: row.expected_notification_inbox_status,
    expectedNotificationDispatchPreflightStatus: row.expected_notification_dispatch_preflight_status,
    expectedNotificationProviderDomainReadinessStatus: row.expected_notification_provider_domain_readiness_status,
    expectedOwnerReviewStatus: row.expected_owner_review_status,
    expectedAlertThresholdCount: numberValue(row.expected_alert_threshold_count),
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
    privateNoteRecorded: Boolean(row.private_note_sha256),
    ownerContentConsentReadinessRecorded: true,
    bodyTemplateReviewed: true,
    unsubscribeLinkReviewed: true,
    rateLimitReviewed: true,
    auditCorrelationReviewed: true,
    retentionPolicyReviewed: true,
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

async function loadLatestProviderDomainReadinessReference(db: D1Database, timeWindowKey: string) {
  const row = await db
    .prepare(
      `SELECT
        id, readiness_id, channel_id, inbox_record_id, dispatch_preflight_id, time_window_key, expected_readiness_status,
        expected_notification_inbox_status, expected_notification_dispatch_preflight_status,
        expected_owner_review_status, expected_alert_threshold_count,
        expected_conversion_sample_size, sample_size_caveat_acknowledged, owner_provider_domain_readiness_recorded, email_send_enabled,
        queue_dispatch_enabled, customer_alert_enabled, traffic_routing_enabled, automated_winner_enabled,
        revenue_claim_enabled, raw_analytics_rows_exposed, recipient_identity_included, email_body_included,
        provider_message_id_included, queue_payload_included, provider_send_enabled, provider_called,
        provider_configured, provider_secret_included, sender_domain_configured, sender_domain_verified,
        sender_credential_included, private_dns_credentials_included, created_at
       FROM analytics_notification_provider_domain_readiness_records
       WHERE dashboard_id = ?
         AND readiness_id = ?
         AND channel_id = ?
         AND time_window_key = ?
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(analyticsDashboard.id, analyticsNotificationReadinessId, analyticsNotificationAdminInboxChannelId, timeWindowKey)
    .first<ProviderDomainReadinessReferenceRow>();
  return row ?? null;
}

function isSafeCurrentProviderDomainReadinessReference(
  row: ProviderDomainReadinessReferenceRow | null,
  evidence: AnalyticsNotificationContentConsentReadinessEvidence,
) {
  return Boolean(
    row &&
      row.readiness_id === analyticsNotificationReadinessId &&
      row.channel_id === analyticsNotificationAdminInboxChannelId &&
      row.time_window_key === evidence.timeWindow.key &&
      row.expected_readiness_status === analyticsNotificationReadinessStatus &&
      row.expected_notification_inbox_status === analyticsNotificationInboxStatus &&
      row.expected_notification_dispatch_preflight_status === analyticsNotificationDispatchPreflightStatus &&
      row.expected_owner_review_status === ownerReviewStatus &&
      numberValue(row.expected_alert_threshold_count) === analyticsNotificationThresholdIds.length &&
      numberValue(row.expected_conversion_sample_size) === evidence.conversionSampleSize &&
      row.sample_size_caveat_acknowledged === 1 &&
      row.owner_provider_domain_readiness_recorded === 1 &&
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
      row.queue_payload_included === 0 &&
      row.provider_send_enabled === 0 &&
      row.provider_called === 0 &&
      row.provider_configured === 0 &&
      row.provider_secret_included === 0 &&
      row.sender_domain_configured === 0 &&
      row.sender_domain_verified === 0 &&
      row.sender_credential_included === 0 &&
      row.private_dns_credentials_included === 0,
  );
}

async function loadContentConsentReadinessEvidence(
  db: D1Database,
  timeWindow: AnalyticsTimeWindow,
): Promise<AnalyticsNotificationContentConsentReadinessEvidence> {
  const conversionReport = await loadAnalyticsFunnelConversionReport(db, analyticsDashboard, timeWindow);
  const conversionSampleSize = conversionReport.rows.reduce((total, row) => total + row.sampleSize, 0);
  const latestProviderDomainReadinessRow = await loadLatestProviderDomainReadinessReference(db, timeWindow.key);
  const evidenceWithoutProviderDomainReadiness: AnalyticsNotificationContentConsentReadinessEvidence = {
    timeWindow,
    dashboardId: analyticsDashboard.id,
    dashboardRevisionId: analyticsDashboard.revisionId,
    readinessId: analyticsNotificationReadinessId,
    readinessStatus: analyticsNotificationReadinessStatus,
    notificationInboxStatus: analyticsNotificationInboxStatus,
    notificationDispatchPreflightStatus: analyticsNotificationDispatchPreflightStatus,
    notificationProviderDomainReadinessStatus: analyticsNotificationProviderDomainReadinessStatus,
    channelId: analyticsNotificationAdminInboxChannelId,
    ownerReviewStatus,
    alertThresholdCount: analyticsNotificationThresholdIds.length,
    conversionSampleSize,
    sampleSizeCaveat: conversionReport.sampleSizeCaveat,
    sampleSizeCaveatAcknowledged: true,
    latestProviderDomainReadinessRecord: latestProviderDomainReadinessRow
      ? publicProviderDomainReadinessReference(latestProviderDomainReadinessRow)
      : null,
    providerDomainReadinessRecordRequired: true,
    providerDomainReadinessRecordCurrent: false,
    supportedContentConsentReadinessDispositions,
    defaultContentConsentReadinessDisposition,
    contentConsentReadinessChecklist: [
      {
        id: "analytics-content-consent-check-readiness",
        title: "Notification readiness contract is current",
        status: "passed",
        evidence: `Issue #${analyticsNotificationReadinessIssue} records delivery readiness without sends, recipients, or email bodies.`,
      },
      {
        id: "analytics-content-consent-check-provider-domain-readiness",
        title: "Owner provider/domain readiness exists for the selected window",
        status: latestProviderDomainReadinessRow ? "passed" : "blocked",
        evidence: latestProviderDomainReadinessRow
          ? `Latest provider/domain readiness ${latestProviderDomainReadinessRow.id} is available for ${timeWindow.key}.`
          : "Record owner notification provider/domain readiness evidence before content/consent readiness evidence.",
      },
      {
        id: "analytics-content-consent-check-template-boundary",
        title: "Body template readiness is reviewed without storing body copy",
        status: "passed",
        evidence:
          "This record tracks body-template readiness metadata only and does not store email body text or recipient payloads.",
      },
      {
        id: "analytics-content-consent-check-unsubscribe-rate-limit",
        title: "Unsubscribe and rate-limit readiness are reviewed",
        status: "passed",
        evidence:
          "This record tracks unsubscribe-link and rate-limit readiness metadata only; it does not send email or expose unsubscribe URLs.",
      },
      {
        id: "analytics-content-consent-check-audit-retention",
        title: "Audit and retention readiness are reviewed",
        status: "passed",
        evidence:
          "This record tracks audit-correlation and retention readiness metadata without exposing actor email, private notes, or raw analytics rows.",
      },
      {
        id: "analytics-content-consent-check-send-disabled",
        title: "Owner email delivery is still disabled",
        status: "external_required",
        evidence: "Live email dispatch still needs future owner-approved send payload, queue, provider-call, and delivery-attempt evidence.",
      },
    ],
    ownerRecordAllowed: Boolean(latestProviderDomainReadinessRow),
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
    bodyTemplateReviewed: true,
    unsubscribeLinkReviewed: true,
    rateLimitReviewed: true,
    auditCorrelationReviewed: true,
    retentionPolicyReviewed: true,
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
    ...evidenceWithoutProviderDomainReadiness,
    providerDomainReadinessRecordCurrent: isSafeCurrentProviderDomainReadinessReference(
      latestProviderDomainReadinessRow,
      evidenceWithoutProviderDomainReadiness,
    ),
    ownerRecordAllowed: isSafeCurrentProviderDomainReadinessReference(
      latestProviderDomainReadinessRow,
      evidenceWithoutProviderDomainReadiness,
    ),
  };
}

async function loadAllContentConsentReadinessEvidence(db: D1Database) {
  return Promise.all(analyticsTimeWindows.map((window) => loadContentConsentReadinessEvidence(db, window)));
}

async function findRecordByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_notification_content_consent_readiness_records
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<ContentConsentReadinessRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS notification_content_consent_readiness_records,
        SUM(CASE WHEN confirmation_text_sha256 IS NOT NULL THEN 1 ELSE 0 END) AS owner_confirmed_records,
        SUM(owner_content_consent_readiness_recorded) AS owner_content_consent_readiness_recorded_records,
        SUM(body_template_reviewed) AS body_template_reviewed_records,
        SUM(unsubscribe_link_reviewed) AS unsubscribe_link_reviewed_records,
        SUM(rate_limit_reviewed) AS rate_limit_reviewed_records,
        SUM(audit_correlation_reviewed) AS audit_correlation_reviewed_records,
        SUM(retention_policy_reviewed) AS retention_policy_reviewed_records,
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
       FROM analytics_notification_content_consent_readiness_records`,
    )
    .first<ContentConsentReadinessCountRow>();

  return {
    notificationContentConsentReadinessRecords: numberValue(row?.notification_content_consent_readiness_records),
    ownerConfirmedRecords: numberValue(row?.owner_confirmed_records),
    ownerContentConsentReadinessRecordedRecords: numberValue(row?.owner_content_consent_readiness_recorded_records),
    bodyTemplateReviewedRecords: numberValue(row?.body_template_reviewed_records),
    unsubscribeLinkReviewedRecords: numberValue(row?.unsubscribe_link_reviewed_records),
    rateLimitReviewedRecords: numberValue(row?.rate_limit_reviewed_records),
    auditCorrelationReviewedRecords: numberValue(row?.audit_correlation_reviewed_records),
    retentionPolicyReviewedRecords: numberValue(row?.retention_policy_reviewed_records),
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
       FROM analytics_notification_content_consent_readiness_records
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<ContentConsentReadinessRow>();
  return (result.results ?? []).map((row) => publicRecord(row, false));
}

export async function getAnalyticsNotificationContentConsentReadinessSummary(
  dbInput?: D1Database,
): Promise<AnalyticsNotificationContentConsentReadinessSummary> {
  try {
    const db = dbInput ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null),
      currentEvidenceByWindow: await loadAllContentConsentReadinessEvidence(db),
      counts: await loadCounts(db),
      latestRecords: await loadLatestRecords(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load analytics notification content/consent readiness records.",
    );
  }
}

export async function createAnalyticsNotificationContentConsentReadiness(
  input: CreateContentConsentReadinessInput,
): Promise<CreateContentConsentReadinessResult> {
  const summaryRedaction = redaction();
  const dashboardId = parseString(input.dashboardId);
  const readinessId = parseString(input.readinessId);
  const channelId = parseString(input.channelId);
  const inboxRecordId = parseString(input.inboxRecordId);
  const dispatchPreflightId = parseString(input.dispatchPreflightId);
  const providerDomainReadinessId = parseString(input.providerDomainReadinessId);
  const timeWindowKey = parseString(input.timeWindowKey, 20) ?? defaultAnalyticsTimeWindow.key;
  const notificationContentConsentReadinessDisposition = parseDisposition(input.notificationContentConsentReadinessDisposition);
  const expectedDashboardRevisionId = parseString(input.expectedDashboardRevisionId);
  const expectedReadinessStatus = parseString(input.expectedReadinessStatus);
  const expectedNotificationInboxStatus = parseString(input.expectedNotificationInboxStatus);
  const expectedNotificationDispatchPreflightStatus = parseString(input.expectedNotificationDispatchPreflightStatus);
  const expectedNotificationProviderDomainReadinessStatus = parseString(
    input.expectedNotificationProviderDomainReadinessStatus,
  );
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
    !providerDomainReadinessId ||
    !expectedDashboardRevisionId ||
    !expectedReadinessStatus ||
    !expectedNotificationInboxStatus ||
    !expectedNotificationDispatchPreflightStatus ||
    !expectedNotificationProviderDomainReadinessStatus ||
    !expectedOwnerReviewStatus ||
    expectedAlertThresholdCount === null ||
    expectedConversionSampleSize === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Dashboard, readiness, channel, inbox record, dispatch preflight, provider/domain readiness, expected statuses, threshold count, conversion sample size, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (!notificationContentConsentReadinessDisposition) {
    return {
      ok: false,
      status: "unsupported_notification_content_consent_readiness_disposition",
      message: "A supported analytics notification content/consent readiness disposition is required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== analyticsNotificationContentConsentReadinessConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording analytics notification content/consent readiness evidence.",
      redaction: summaryRedaction,
    };
  }

  if (!sampleSizeCaveatAcknowledged) {
    return {
      ok: false,
      status: "sample_size_caveat_required",
      message: "The sample-size caveat must be acknowledged before recording analytics notification content/consent readiness evidence.",
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
      message: "The analytics dashboard revision changed before the content/consent readiness was recorded.",
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
      message: "The notification readiness status changed before the content/consent readiness was recorded.",
      redaction: summaryRedaction,
      currentReadinessStatus: analyticsNotificationReadinessStatus,
    };
  }

  if (expectedNotificationInboxStatus !== analyticsNotificationInboxStatus) {
    return {
      ok: false,
      status: "stale_notification_inbox_status",
      message: "The notification inbox contract changed before the content/consent readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationInboxStatus: analyticsNotificationInboxStatus,
    };
  }

  if (expectedNotificationDispatchPreflightStatus !== analyticsNotificationDispatchPreflightStatus) {
    return {
      ok: false,
      status: "stale_notification_dispatch_preflight_status",
      message: "The notification dispatch preflight contract changed before the content/consent readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationDispatchPreflightStatus: analyticsNotificationDispatchPreflightStatus,
    };
  }

  if (expectedNotificationProviderDomainReadinessStatus !== analyticsNotificationProviderDomainReadinessStatus) {
    return {
      ok: false,
      status: "stale_notification_provider_domain_readiness_status",
      message: "The notification provider/domain readiness contract changed before the content/consent readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationProviderDomainReadinessStatus: analyticsNotificationProviderDomainReadinessStatus,
    };
  }

  if (expectedOwnerReviewStatus !== ownerReviewStatus) {
    return {
      ok: false,
      status: "stale_owner_review_status",
      message: "The owner review status changed before the content/consent readiness was recorded.",
      redaction: summaryRedaction,
      currentOwnerReviewStatus: ownerReviewStatus,
    };
  }

  if (expectedAlertThresholdCount !== analyticsNotificationThresholdIds.length) {
    return {
      ok: false,
      status: "stale_threshold_count",
      message: "The notification threshold count changed before the content/consent readiness was recorded.",
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
  const currentEvidence = await loadContentConsentReadinessEvidence(db, timeWindow);
  if (expectedConversionSampleSize !== currentEvidence.conversionSampleSize) {
    return {
      ok: false,
      status: "stale_analytics_evidence",
      message: "The aggregate analytics evidence changed before the content/consent readiness was recorded.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (
    !currentEvidence.latestProviderDomainReadinessRecord ||
    currentEvidence.latestProviderDomainReadinessRecord.id !== providerDomainReadinessId
  ) {
    return {
      ok: false,
      status: currentEvidence.latestProviderDomainReadinessRecord
        ? "stale_notification_provider_domain_readiness_evidence"
        : "unsupported_provider_domain_readiness",
      message: currentEvidence.latestProviderDomainReadinessRecord
        ? "A newer notification provider/domain readiness exists for the selected analytics window."
        : "A current notification provider/domain readiness is required before recording content/consent readiness.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (currentEvidence.latestProviderDomainReadinessRecord.dispatchPreflightId !== dispatchPreflightId) {
    return {
      ok: false,
      status: "stale_notification_dispatch_preflight_evidence",
      message: "The notification dispatch preflight no longer matches the current provider/domain readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (currentEvidence.latestProviderDomainReadinessRecord.inboxRecordId !== inboxRecordId) {
    return {
      ok: false,
      status: "stale_notification_inbox_evidence",
      message: "The notification inbox record no longer matches the current provider/domain readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (!currentEvidence.providerDomainReadinessRecordCurrent || !currentEvidence.ownerRecordAllowed) {
    return {
      ok: false,
      status: "stale_notification_provider_domain_readiness_evidence",
      message: "The notification provider/domain readiness evidence is not safe or current enough for content/consent readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(analyticsNotificationContentConsentReadinessConfirmationText);
  const existing = await findRecordByIdempotency(db, idempotencyKey);
  if (existing) {
    const sameRequest =
      existing.dashboard_id === dashboardId &&
      existing.readiness_id === readinessId &&
      existing.channel_id === channelId &&
      existing.inbox_record_id === inboxRecordId &&
      existing.dispatch_preflight_id === dispatchPreflightId &&
      existing.provider_domain_readiness_id === providerDomainReadinessId &&
      existing.record_kind === contentConsentReadinessRecordKind &&
      existing.notification_content_consent_readiness_disposition === notificationContentConsentReadinessDisposition &&
      existing.time_window_key === timeWindow.key &&
      existing.expected_dashboard_revision_id === expectedDashboardRevisionId &&
      existing.expected_readiness_status === expectedReadinessStatus &&
      existing.expected_notification_inbox_status === expectedNotificationInboxStatus &&
      existing.expected_notification_dispatch_preflight_status === expectedNotificationDispatchPreflightStatus &&
      existing.expected_notification_provider_domain_readiness_status === expectedNotificationProviderDomainReadinessStatus &&
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
        message: "The idempotency key is already associated with a different notification content/consent readiness request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "analytics_notification_content_consent_readiness_replayed",
      duplicate: true,
      record: publicRecord(existing, true),
      redaction: summaryRedaction,
    };
  }

  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const recordId = `analytics-notification-content-consent-readiness-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO analytics_notification_content_consent_readiness_records (
        id, dashboard_id, readiness_id, channel_id, inbox_record_id, dispatch_preflight_id, provider_domain_readiness_id, record_kind,
        notification_content_consent_readiness_disposition, time_window_key,
        expected_dashboard_revision_id, expected_readiness_status, expected_notification_inbox_status,
        expected_notification_dispatch_preflight_status, expected_notification_provider_domain_readiness_status,
        expected_owner_review_status,
        expected_alert_threshold_count, expected_conversion_sample_size,
        sample_size_caveat_acknowledged, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, owner_content_consent_readiness_recorded,
        body_template_reviewed, unsubscribe_link_reviewed, rate_limit_reviewed, audit_correlation_reviewed, retention_policy_reviewed,
        email_send_enabled, queue_dispatch_enabled, customer_alert_enabled, traffic_routing_enabled,
        automated_winner_enabled, revenue_claim_enabled, raw_analytics_rows_exposed,
        recipient_identity_included, email_body_included, provider_message_id_included,
        queue_payload_included, provider_send_enabled, provider_called, provider_configured,
        provider_secret_included, sender_domain_configured, sender_domain_verified,
        sender_credential_included, private_dns_credentials_included, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      dashboardId,
      readinessId,
      channelId,
      inboxRecordId,
      dispatchPreflightId,
      providerDomainReadinessId,
      contentConsentReadinessRecordKind,
      notificationContentConsentReadinessDisposition,
      timeWindow.key,
      expectedDashboardRevisionId,
      expectedReadinessStatus,
      expectedNotificationInboxStatus,
      expectedNotificationDispatchPreflightStatus,
      expectedNotificationProviderDomainReadinessStatus,
      expectedOwnerReviewStatus,
      expectedAlertThresholdCount,
      expectedConversionSampleSize,
      idempotencyKey,
      input.actor.userId ?? "unknown-owner",
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      JSON.stringify({
        issue: analyticsNotificationContentConsentReadinessIssue,
        parentIssue: 18,
        readinessIssue: analyticsNotificationReadinessIssue,
        notificationInboxIssue: analyticsNotificationInboxIssue,
        notificationDispatchPreflightIssue: analyticsNotificationDispatchPreflightIssue,
        notificationProviderDomainReadinessIssue: analyticsNotificationProviderDomainReadinessIssue,
        inboxRecordId,
        dispatchPreflightId,
        providerDomainReadinessId,
        channelId,
        notificationContentConsentReadinessDisposition,
        sampleSizeCaveatAcknowledged: true,
        ownerContentConsentReadinessRecorded: true,
        bodyTemplateReviewed: true,
        unsubscribeLinkReviewed: true,
        rateLimitReviewed: true,
        auditCorrelationReviewed: true,
        retentionPolicyReviewed: true,
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
      status: "notification_content_consent_readiness_not_recorded",
      message: "The analytics notification content/consent readiness could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "analytics_notification_content_consent_readiness_recorded",
    duplicate: false,
    record: publicRecord(record, false),
    redaction: summaryRedaction,
  };
}
