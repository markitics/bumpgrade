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
  analyticsNotificationQueueProducerReadinessIssue,
  analyticsNotificationQueueProducerReadinessStatus,
} from "@/lib/analytics-notification-queue-producer-readiness";
import {
  analyticsNotificationQueueConsumerReadinessIssue,
  analyticsNotificationQueueConsumerReadinessStatus,
} from "@/lib/analytics-notification-queue-consumer-readiness";
import {
  analyticsNotificationProviderCallReadinessIssue,
  analyticsNotificationProviderCallReadinessStatus,
} from "@/lib/analytics-notification-provider-call-readiness";
import {
  analyticsNotificationDeliveryAttemptReadinessIssue,
  analyticsNotificationDeliveryAttemptReadinessStatus,
} from "@/lib/analytics-notification-delivery-attempt-readiness";
import {
  analyticsNotificationDeliveryStatusWebhookReadinessIssue,
  analyticsNotificationDeliveryStatusWebhookReadinessStatus,
} from "@/lib/analytics-notification-delivery-status-webhook-readiness";
import { analyticsNotificationProviderPollingReadinessStatus } from "@/lib/analytics-notification-provider-polling-readiness";
import {
  analyticsNotificationReceiptPayloadReadinessIssue,
  analyticsNotificationReceiptPayloadReadinessStatus,
} from "@/lib/analytics-notification-receipt-payload-readiness";
import {
  analyticsNotificationSendPayloadReadinessIssue,
  analyticsNotificationSendPayloadReadinessStatus,
} from "@/lib/analytics-notification-send-payload-readiness";
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

export const analyticsNotificationDeliveryReceiptReadinessIssue = 309;
export const analyticsNotificationDeliveryReceiptReadinessStatus = "owner-analytics-notification-delivery-receipt-readiness-records-ready";
export const analyticsNotificationDeliveryReceiptReadinessApiRoute =
  "/api/admin/analytics/notification-delivery-receipt-readiness";
export const analyticsNotificationDeliveryReceiptReadinessOwnerRoute = "/admin/analytics";
export const analyticsNotificationDeliveryReceiptReadinessConfirmationText =
  "Record Bumpgrade analytics notification delivery-receipt readiness evidence";

const ownerReviewStatus = "reviewed_with_caveats";
const deliveryReceiptReadinessRecordKind = "owner_notification_delivery_receipt_readiness";
const defaultDeliveryReceiptReadinessDisposition = "blocked_pending_delivery_receipt_review";
const supportedDeliveryReceiptReadinessDispositions = [
  "blocked_pending_delivery_receipt_review",
  "delivery_receipt_ready_for_owner_review",
  "delivery_receipt_dependency_or_payload_boundary_missing",
] as const;

type Runtime = {
  db: D1Database;
};

type DeliveryReceiptReadinessDisposition = (typeof supportedDeliveryReceiptReadinessDispositions)[number];

type ReceiptPayloadReadinessReferenceRow = {
  id: string;
  readiness_id: string;
  channel_id: string;
  inbox_record_id: string;
  dispatch_preflight_id: string;
  provider_domain_readiness_id: string;
  send_payload_readiness_id: string;
  provider_polling_readiness_id: string;
  time_window_key: string;
  expected_readiness_status: string;
  expected_notification_inbox_status: string;
  expected_notification_dispatch_preflight_status: string;
  expected_notification_provider_domain_readiness_status: string;
  expected_notification_send_payload_readiness_status: string;
  expected_notification_provider_polling_readiness_status: string;
  expected_owner_review_status: string;
  expected_alert_threshold_count: number;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
  owner_receipt_payload_readiness_recorded: number;
  queue_binding_reviewed: number;
  consumer_mode_reviewed: number;
  producer_dependency_reviewed: number;
  payload_read_policy_reviewed: number;
  ack_policy_reviewed: number;
  idempotency_policy_reviewed: number;
  retry_dead_letter_policy_reviewed: number;
  provider_handoff_dependency_reviewed: number;
  backpressure_policy_reviewed: number;
  audit_correlation_reviewed: number;
  retention_policy_reviewed: number;
  email_send_enabled: number;
  queue_dispatch_enabled: number;
  queue_producer_enabled: number;
  queue_consumer_enabled: number;
  receipt_payload_enabled: number;
  queue_message_created: number;
  queue_message_consumed: number;
  queue_message_acknowledged: number;
  retry_dead_letter_row_created: number;
  queue_payload_body_read: number;
  queue_payload_body_created: number;
  customer_alert_enabled: number;
  traffic_routing_enabled: number;
  automated_winner_enabled: number;
  revenue_claim_enabled: number;
  raw_analytics_rows_exposed: number;
  recipient_identity_included: number;
  recipient_payload_created: number;
  personalized_body_created: number;
  raw_payload_body_stored: number;
  email_body_included: number;
  provider_message_id_included: number;
  queue_payload_included: number;
  provider_send_enabled: number;
  receipt_payload_recorded: number;
  provider_configured: number;
  provider_response_created: number;
  provider_secret_included: number;
  sender_domain_configured: number;
  sender_domain_verified: number;
  sender_credential_included: number;
  private_dns_credentials_included: number;
  created_at: number;
};

type DeliveryReceiptReadinessCountRow = {
  notification_delivery_receipt_readiness_records: number;
  owner_confirmed_records: number;
  owner_delivery_receipt_readiness_recorded_records: number;
  queue_binding_reviewed_records: number;
  consumer_mode_reviewed_records: number;
  producer_dependency_reviewed_records: number;
  payload_read_policy_reviewed_records: number;
  ack_policy_reviewed_records: number;
  idempotency_policy_reviewed_records: number;
  retry_dead_letter_policy_reviewed_records: number;
  provider_handoff_dependency_reviewed_records: number;
  backpressure_policy_reviewed_records: number;
  audit_correlation_reviewed_records: number;
  retention_policy_reviewed_records: number;
  email_send_enabled_records: number;
  queue_dispatch_enabled_records: number;
  queue_producer_enabled_records: number;
  queue_consumer_enabled_records: number;
  delivery_receipt_enabled_records: number;
  queue_message_created_records: number;
  queue_message_consumed_records: number;
  queue_message_acknowledged_records: number;
  retry_dead_letter_row_created_records: number;
  queue_payload_body_read_records: number;
  queue_payload_body_created_records: number;
  customer_alert_enabled_records: number;
  traffic_routing_enabled_records: number;
  automated_winner_enabled_records: number;
  revenue_claim_enabled_records: number;
  raw_analytics_rows_exposed_records: number;
  recipient_identity_included_records: number;
  recipient_payload_created_records: number;
  personalized_body_created_records: number;
  raw_payload_body_stored_records: number;
  email_body_included_records: number;
  provider_message_id_included_records: number;
  queue_payload_included_records: number;
  provider_send_enabled_records: number;
  delivery_receipt_recorded_records: number;
  provider_configured_records: number;
  provider_response_created_records: number;
  provider_secret_included_records: number;
  sender_domain_configured_records: number;
  sender_domain_verified_records: number;
  sender_credential_included_records: number;
  private_dns_credentials_included_records: number;
};

type DeliveryReceiptReadinessRow = {
  id: string;
  dashboard_id: string;
  readiness_id: string;
  channel_id: string;
  inbox_record_id: string;
  dispatch_preflight_id: string;
  provider_domain_readiness_id: string;
  send_payload_readiness_id: string;
  receipt_payload_readiness_id: string;
  record_kind: typeof deliveryReceiptReadinessRecordKind;
  notification_delivery_receipt_readiness_disposition: DeliveryReceiptReadinessDisposition;
  time_window_key: string;
  expected_dashboard_revision_id: string;
  expected_readiness_status: string;
  expected_notification_inbox_status: string;
  expected_notification_dispatch_preflight_status: string;
  expected_notification_provider_domain_readiness_status: string;
  expected_notification_send_payload_readiness_status: string;
  expected_notification_receipt_payload_readiness_status: string;
  expected_owner_review_status: string;
  expected_alert_threshold_count: number;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
  idempotency_key: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  owner_delivery_receipt_readiness_recorded: number;
  queue_binding_reviewed: number;
  consumer_mode_reviewed: number;
  producer_dependency_reviewed: number;
  payload_read_policy_reviewed: number;
  ack_policy_reviewed: number;
  idempotency_policy_reviewed: number;
  retry_dead_letter_policy_reviewed: number;
  provider_handoff_dependency_reviewed: number;
  backpressure_policy_reviewed: number;
  audit_correlation_reviewed: number;
  retention_policy_reviewed: number;
  email_send_enabled: number;
  queue_dispatch_enabled: number;
  queue_producer_enabled: number;
  queue_consumer_enabled: number;
  delivery_receipt_enabled: number;
  queue_message_created: number;
  queue_message_consumed: number;
  queue_message_acknowledged: number;
  retry_dead_letter_row_created: number;
  queue_payload_body_read: number;
  queue_payload_body_created: number;
  customer_alert_enabled: number;
  traffic_routing_enabled: number;
  automated_winner_enabled: number;
  revenue_claim_enabled: number;
  raw_analytics_rows_exposed: number;
  recipient_identity_included: number;
  recipient_payload_created: number;
  personalized_body_created: number;
  raw_payload_body_stored: number;
  email_body_included: number;
  provider_message_id_included: number;
  queue_payload_included: number;
  provider_send_enabled: number;
  delivery_receipt_recorded: number;
  provider_configured: number;
  provider_response_created: number;
  provider_secret_included: number;
  sender_domain_configured: number;
  sender_domain_verified: number;
  sender_credential_included: number;
  private_dns_credentials_included: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

type DeliveryReceiptReadinessChecklistItem = {
  id: string;
  title: string;
  status: "passed" | "blocked" | "external_required";
  evidence: string;
};

export type AnalyticsNotificationDeliveryReceiptReceiptPayloadReadinessReference = {
  id: string;
  readinessId: string;
  channelId: string;
  inboxRecordId: string;
  dispatchPreflightId: string;
  providerDomainReadinessId: string;
  sendPayloadReadinessId: string;
  providerPollingReadinessId: string;
  timeWindowKey: string;
  expectedReadinessStatus: string;
  expectedNotificationInboxStatus: string;
  expectedNotificationDispatchPreflightStatus: string;
  expectedNotificationProviderDomainReadinessStatus: string;
  expectedNotificationSendPayloadReadinessStatus: string;
  expectedNotificationProviderPollingReadinessStatus: string;
  expectedNotificationReceiptPayloadReadinessStatus: string;
  expectedOwnerReviewStatus: string;
  expectedAlertThresholdCount: number;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
  ownerReceiptPayloadReadinessRecorded: true;
  queueBindingReviewed: true;
  consumerModeReviewed: true;
  producerDependencyReviewed: true;
  payloadReadPolicyReviewed: true;
  ackPolicyReviewed: true;
  idempotencyPolicyReviewed: true;
  retryDeadLetterPolicyReviewed: true;
  providerHandoffDependencyReviewed: true;
  backpressurePolicyReviewed: true;
  auditCorrelationReviewed: true;
  retentionPolicyReviewed: true;
  ownerEmailSendEnabled: false;
  queueDispatchEnabled: false;
  queueProducerEnabled: false;
  queueConsumerEnabled: false;
  receiptPayloadEnabled: false;
  deliveryReceiptEnabled: false;
  queueMessageCreated: false;
  queueMessageConsumed: false;
  queueMessageAcknowledged: false;
  retryDeadLetterRowCreated: false;
  queuePayloadBodyRead: false;
  queuePayloadBodyCreated: false;
  customerAlertEnabled: false;
  trafficRoutingEnabled: false;
  automatedWinnerEnabled: false;
  revenueClaimEnabled: false;
  rawAnalyticsRowsExposed: false;
  recipientIdentityIncluded: false;
  recipientPayloadCreated: false;
  personalizedBodyCreated: false;
  rawPayloadBodyStored: false;
  emailBodyIncluded: false;
  providerMessageIdIncluded: false;
  queuePayloadIncluded: false;
  providerSendEnabled: false;
  receiptPayloadRecorded: false;
  deliveryReceiptRecorded: false;
  providerConfigured: false;
  providerResponseCreated: false;
  providerSecretIncluded: false;
  senderDomainConfigured: false;
  senderDomainVerified: false;
  senderCredentialIncluded: false;
  privateDnsCredentialsIncluded: false;
  createdAt: string | null;
};

export type AnalyticsNotificationDeliveryReceiptReadinessEvidence = {
  timeWindow: AnalyticsTimeWindow;
  dashboardId: string;
  dashboardRevisionId: string;
  readinessId: typeof analyticsNotificationReadinessId;
  readinessStatus: typeof analyticsNotificationReadinessStatus;
  notificationInboxStatus: typeof analyticsNotificationInboxStatus;
  notificationDispatchPreflightStatus: typeof analyticsNotificationDispatchPreflightStatus;
  notificationProviderDomainReadinessStatus: typeof analyticsNotificationProviderDomainReadinessStatus;
  notificationSendPayloadReadinessStatus: typeof analyticsNotificationSendPayloadReadinessStatus;
  notificationReceiptPayloadReadinessStatus: typeof analyticsNotificationReceiptPayloadReadinessStatus;
  channelId: typeof analyticsNotificationAdminInboxChannelId;
  ownerReviewStatus: typeof ownerReviewStatus;
  alertThresholdCount: number;
  conversionSampleSize: number;
  sampleSizeCaveat: string;
  sampleSizeCaveatAcknowledged: true;
  latestReceiptPayloadReadinessRecord: AnalyticsNotificationDeliveryReceiptReceiptPayloadReadinessReference | null;
  receiptPayloadReadinessRecordRequired: true;
  receiptPayloadReadinessRecordCurrent: boolean;
  supportedDeliveryReceiptReadinessDispositions: readonly DeliveryReceiptReadinessDisposition[];
  defaultDeliveryReceiptReadinessDisposition: DeliveryReceiptReadinessDisposition;
  deliveryReceiptReadinessChecklist: DeliveryReceiptReadinessChecklistItem[];
  ownerRecordAllowed: boolean;
  ownerEmailSendEnabled: false;
  queueDispatchEnabled: false;
  queueProducerEnabled: false;
  queueConsumerEnabled: false;
  deliveryReceiptEnabled: false;
  queueMessageCreated: false;
  queueMessageConsumed: false;
  queueMessageAcknowledged: false;
  retryDeadLetterRowCreated: false;
  queuePayloadBodyRead: false;
  queuePayloadBodyCreated: false;
  customerAlertEnabled: false;
  trafficRoutingEnabled: false;
  automatedWinnerEnabled: false;
  revenueClaimEnabled: false;
  rawRowsIncluded: false;
  privateDataIncluded: false;
  recipientIdentityIncluded: false;
  recipientPayloadCreated: false;
  personalizedBodyCreated: false;
  rawPayloadBodyStored: false;
  emailBodyIncluded: false;
  providerMessageIdIncluded: false;
  queuePayloadIncluded: false;
  queueBindingReviewed: true;
  consumerModeReviewed: true;
  producerDependencyReviewed: true;
  payloadReadPolicyReviewed: true;
  ackPolicyReviewed: true;
  idempotencyPolicyReviewed: true;
  retryDeadLetterPolicyReviewed: true;
  providerHandoffDependencyReviewed: true;
  backpressurePolicyReviewed: true;
  auditCorrelationReviewed: true;
  retentionPolicyReviewed: true;
  providerSendEnabled: false;
  deliveryReceiptRecorded: false;
  providerConfigured: false;
  providerResponseCreated: false;
  providerSecretIncluded: false;
  senderDomainConfigured: false;
  senderDomainVerified: false;
  senderCredentialIncluded: false;
  privateDnsCredentialsIncluded: false;
};

export type AnalyticsNotificationDeliveryReceiptReadinessPublic = {
  id: string;
  dashboardId: string;
  readinessId: string;
  channelId: string;
  inboxRecordId: string;
  dispatchPreflightId: string;
  providerDomainReadinessId: string;
  sendPayloadReadinessId: string;
  receiptPayloadReadinessId: string;
  recordKind: typeof deliveryReceiptReadinessRecordKind;
  notificationDeliveryReceiptReadinessDisposition: DeliveryReceiptReadinessDisposition;
  timeWindowKey: string;
  expectedReadinessStatus: string;
  expectedNotificationInboxStatus: string;
  expectedNotificationDispatchPreflightStatus: string;
  expectedNotificationProviderDomainReadinessStatus: string;
  expectedNotificationSendPayloadReadinessStatus: string;
  expectedNotificationReceiptPayloadReadinessStatus: string;
  expectedOwnerReviewStatus: string;
  expectedAlertThresholdCount: number;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
  privateNoteRecorded: boolean;
  ownerDeliveryReceiptReadinessRecorded: true;
  queueBindingReviewed: true;
  consumerModeReviewed: true;
  producerDependencyReviewed: true;
  payloadReadPolicyReviewed: true;
  ackPolicyReviewed: true;
  idempotencyPolicyReviewed: true;
  retryDeadLetterPolicyReviewed: true;
  providerHandoffDependencyReviewed: true;
  backpressurePolicyReviewed: true;
  auditCorrelationReviewed: true;
  retentionPolicyReviewed: true;
  ownerEmailSendEnabled: false;
  queueDispatchEnabled: false;
  queueProducerEnabled: false;
  queueConsumerEnabled: false;
  deliveryReceiptEnabled: false;
  queueMessageCreated: false;
  queueMessageConsumed: false;
  queueMessageAcknowledged: false;
  retryDeadLetterRowCreated: false;
  queuePayloadBodyRead: false;
  queuePayloadBodyCreated: false;
  customerAlertEnabled: false;
  trafficRoutingEnabled: false;
  automatedWinnerEnabled: false;
  revenueClaimEnabled: false;
  rawAnalyticsRowsExposed: false;
  recipientIdentityIncluded: false;
  recipientPayloadCreated: false;
  personalizedBodyCreated: false;
  rawPayloadBodyStored: false;
  emailBodyIncluded: false;
  providerMessageIdIncluded: false;
  queuePayloadIncluded: false;
  providerSendEnabled: false;
  deliveryReceiptRecorded: false;
  providerConfigured: false;
  providerResponseCreated: false;
  providerSecretIncluded: false;
  senderDomainConfigured: false;
  senderDomainVerified: false;
  senderCredentialIncluded: false;
  privateDnsCredentialsIncluded: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type AnalyticsNotificationDeliveryReceiptReadinessSummary = {
  id: "analytics-notification-delivery-receipt-readiness-contract";
  status: typeof analyticsNotificationDeliveryReceiptReadinessStatus;
  issue: typeof analyticsNotificationDeliveryReceiptReadinessIssue;
  parentIssue: 18;
  apiRoute: typeof analyticsNotificationDeliveryReceiptReadinessApiRoute;
  ownerRoute: typeof analyticsNotificationDeliveryReceiptReadinessOwnerRoute;
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
    notificationSendPayloadReadinessIssue: typeof analyticsNotificationSendPayloadReadinessIssue;
    notificationSendPayloadReadinessStatus: typeof analyticsNotificationSendPayloadReadinessStatus;
    notificationQueueProducerReadinessIssue: typeof analyticsNotificationQueueProducerReadinessIssue;
    notificationQueueProducerReadinessStatus: typeof analyticsNotificationQueueProducerReadinessStatus;
    notificationQueueConsumerReadinessIssue: typeof analyticsNotificationQueueConsumerReadinessIssue;
    notificationQueueConsumerReadinessStatus: typeof analyticsNotificationQueueConsumerReadinessStatus;
    notificationProviderCallReadinessIssue: typeof analyticsNotificationProviderCallReadinessIssue;
    notificationProviderCallReadinessStatus: typeof analyticsNotificationProviderCallReadinessStatus;
  notificationDeliveryAttemptReadinessIssue: typeof analyticsNotificationDeliveryAttemptReadinessIssue;
  notificationDeliveryAttemptReadinessStatus: typeof analyticsNotificationDeliveryAttemptReadinessStatus;
  notificationDeliveryStatusWebhookReadinessIssue: typeof analyticsNotificationDeliveryStatusWebhookReadinessIssue;
  notificationDeliveryStatusWebhookReadinessStatus: typeof analyticsNotificationDeliveryStatusWebhookReadinessStatus;
  notificationReceiptPayloadReadinessIssue: typeof analyticsNotificationReceiptPayloadReadinessIssue;
  notificationReceiptPayloadReadinessStatus: typeof analyticsNotificationReceiptPayloadReadinessStatus;
    channelId: typeof analyticsNotificationAdminInboxChannelId;
    dashboardId: string;
    dashboardRevisionId: string;
    ownerReviewStatus: typeof ownerReviewStatus;
    alertThresholdCount: number;
  };
  confirmation: {
    required: true;
    text: typeof analyticsNotificationDeliveryReceiptReadinessConfirmationText;
  };
  supportedDeliveryReceiptReadinessDispositions: readonly DeliveryReceiptReadinessDisposition[];
  defaultDeliveryReceiptReadinessDisposition: DeliveryReceiptReadinessDisposition;
  currentEvidenceByWindow: AnalyticsNotificationDeliveryReceiptReadinessEvidence[];
  counts: {
    notificationDeliveryReceiptReadinessRecords: number;
    ownerConfirmedRecords: number;
    ownerDeliveryReceiptReadinessRecordedRecords: number;
    queueBindingReviewedRecords: number;
    consumerModeReviewedRecords: number;
    producerDependencyReviewedRecords: number;
    payloadReadPolicyReviewedRecords: number;
    ackPolicyReviewedRecords: number;
    idempotencyPolicyReviewedRecords: number;
    retryDeadLetterPolicyReviewedRecords: number;
    providerHandoffDependencyReviewedRecords: number;
    backpressurePolicyReviewedRecords: number;
    auditCorrelationReviewedRecords: number;
    retentionPolicyReviewedRecords: number;
    emailSendEnabledRecords: number;
    queueDispatchEnabledRecords: number;
    queueProducerEnabledRecords: number;
    queueConsumerEnabledRecords: number;
    deliveryReceiptEnabledRecords: number;
    queueMessageCreatedRecords: number;
    queueMessageConsumedRecords: number;
    queueMessageAcknowledgedRecords: number;
    retryDeadLetterRowCreatedRecords: number;
    queuePayloadBodyReadRecords: number;
    queuePayloadBodyCreatedRecords: number;
    customerAlertEnabledRecords: number;
    trafficRoutingEnabledRecords: number;
    automatedWinnerEnabledRecords: number;
    revenueClaimEnabledRecords: number;
    rawAnalyticsRowsExposedRecords: number;
    recipientIdentityIncludedRecords: number;
    recipientPayloadCreatedRecords: number;
    personalizedBodyCreatedRecords: number;
    rawPayloadBodyStoredRecords: number;
    emailBodyIncludedRecords: number;
    providerMessageIdIncludedRecords: number;
    queuePayloadIncludedRecords: number;
    providerSendEnabledRecords: number;
    deliveryReceiptRecordedRecords: number;
    providerConfiguredRecords: number;
    providerResponseCreatedRecords: number;
    providerSecretIncludedRecords: number;
    senderDomainConfiguredRecords: number;
    senderDomainVerifiedRecords: number;
    senderCredentialIncludedRecords: number;
    privateDnsCredentialsIncludedRecords: number;
  };
  latestRecords: AnalyticsNotificationDeliveryReceiptReadinessPublic[];
  redaction: {
    privateDataIncluded: false;
    rawEventRowsIncluded: false;
    rawAssignmentRowsIncluded: false;
    contactAnalyticsIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    notificationRecipientIncluded: false;
    recipientPayloadIncluded: false;
    personalizedBodyIncluded: false;
    rawPayloadBodyIncluded: false;
    emailBodyIncluded: false;
    payloadShapeIncluded: false;
    bodyTemplateIncluded: false;
    unsubscribeUrlIncluded: false;
    providerMessageIdIncluded: false;
    queuePayloadIncluded: false;
    queuePayloadBodyIncluded: false;
    queueProducerEnabled: false;
    queueConsumerEnabled: false;
    providerCallEnabled: false;
    providerPollingEnabled: false;
    receiptPayloadEnabled: false;
    deliveryReceiptEnabled: false;
    queueMessageCreated: false;
    queueMessageConsumed: false;
    queueMessageAcknowledged: false;
    retryDeadLetterRowCreated: false;
    queuePayloadBodyRead: false;
    queuePayloadBodyCreated: false;
    providerSendEnabled: false;
    providerCalled: false;
    deliveryReceiptRecorded: false;
    providerConfigured: false;
    providerResponseCreated: false;
    providerResponseIncluded: false;
    deliveryReceiptCreated: false;
    deliveryReceiptPayloadIncluded: false;
    statusWebhookEnabled: false;
    statusWebhookReceived: false;
    providerSecretIncluded: false;
    senderDomainConfigured: false;
    senderDomainVerified: false;
    senderCredentialIncluded: false;
    privateDnsCredentialsIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateDeliveryReceiptReadinessInput = {
  dashboardId?: unknown;
  readinessId?: unknown;
  channelId?: unknown;
  inboxRecordId?: unknown;
  dispatchPreflightId?: unknown;
  providerDomainReadinessId?: unknown;
  sendPayloadReadinessId?: unknown;
  receiptPayloadReadinessId?: unknown;
  timeWindowKey?: unknown;
  notificationDeliveryReceiptReadinessDisposition?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedReadinessStatus?: unknown;
  expectedNotificationInboxStatus?: unknown;
  expectedNotificationDispatchPreflightStatus?: unknown;
  expectedNotificationProviderDomainReadinessStatus?: unknown;
  expectedNotificationSendPayloadReadinessStatus?: unknown;
  expectedNotificationReceiptPayloadReadinessStatus?: unknown;
  expectedOwnerReviewStatus?: unknown;
  expectedAlertThresholdCount?: unknown;
  expectedConversionSampleSize?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateDeliveryReceiptReadinessResult =
  | {
      ok: true;
      status: "analytics_notification_delivery_receipt_readiness_recorded" | "analytics_notification_delivery_receipt_readiness_replayed";
      duplicate: boolean;
      record: AnalyticsNotificationDeliveryReceiptReadinessPublic;
      redaction: AnalyticsNotificationDeliveryReceiptReadinessSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_readiness"
        | "unsupported_channel"
        | "unsupported_provider_domain_readiness"
        | "unsupported_send_payload_readiness"
        | "unsupported_receipt_payload_readiness"
        | "unsupported_notification_delivery_receipt_readiness_disposition"
        | "sample_size_caveat_required"
        | "confirmation_required"
        | "stale_dashboard_revision"
        | "stale_readiness_status"
        | "stale_notification_inbox_status"
        | "stale_notification_dispatch_preflight_status"
        | "stale_notification_provider_domain_readiness_status"
        | "stale_notification_send_payload_readiness_status"
        | "stale_notification_receipt_payload_readiness_status"
        | "stale_owner_review_status"
        | "stale_threshold_count"
        | "stale_analytics_evidence"
        | "stale_notification_inbox_evidence"
        | "stale_notification_dispatch_preflight_evidence"
        | "stale_notification_provider_domain_readiness_evidence"
        | "stale_notification_send_payload_readiness_evidence"
        | "stale_notification_receipt_payload_readiness_evidence"
        | "idempotency_conflict"
        | "notification_delivery_receipt_readiness_not_recorded";
      message: string;
      redaction: AnalyticsNotificationDeliveryReceiptReadinessSummary["redaction"];
      currentDashboardRevisionId?: string;
      currentReadinessStatus?: string;
      currentNotificationInboxStatus?: string;
      currentNotificationDispatchPreflightStatus?: string;
      currentNotificationProviderDomainReadinessStatus?: string;
      currentNotificationSendPayloadReadinessStatus?: string;
      currentNotificationReceiptPayloadReadinessStatus?: string;
      currentOwnerReviewStatus?: string;
      currentAlertThresholdCount?: number;
      currentEvidence?: AnalyticsNotificationDeliveryReceiptReadinessEvidence;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function redaction(): AnalyticsNotificationDeliveryReceiptReadinessSummary["redaction"] {
  return {
    privateDataIncluded: false,
    rawEventRowsIncluded: false,
    rawAssignmentRowsIncluded: false,
    contactAnalyticsIncluded: false,
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    privateNoteIncluded: false,
    notificationRecipientIncluded: false,
    recipientPayloadIncluded: false,
    personalizedBodyIncluded: false,
    rawPayloadBodyIncluded: false,
    emailBodyIncluded: false,
    payloadShapeIncluded: false,
    bodyTemplateIncluded: false,
    unsubscribeUrlIncluded: false,
    providerMessageIdIncluded: false,
    queuePayloadIncluded: false,
    queuePayloadBodyIncluded: false,
    queueProducerEnabled: false,
    queueConsumerEnabled: false,
    providerCallEnabled: false,
    providerPollingEnabled: false,
    receiptPayloadEnabled: false,
    deliveryReceiptEnabled: false,
    queueMessageCreated: false,
    queueMessageConsumed: false,
    queueMessageAcknowledged: false,
    retryDeadLetterRowCreated: false,
    queuePayloadBodyRead: false,
    queuePayloadBodyCreated: false,
    providerSendEnabled: false,
    providerCalled: false,
    deliveryReceiptRecorded: false,
    providerConfigured: false,
    providerResponseCreated: false,
    providerResponseIncluded: false,
    deliveryReceiptCreated: false,
    deliveryReceiptPayloadIncluded: false,
    statusWebhookEnabled: false,
    statusWebhookReceived: false,
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
  return supportedDeliveryReceiptReadinessDispositions.find((disposition) => disposition === parsed) ?? null;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function emptyCounts(): AnalyticsNotificationDeliveryReceiptReadinessSummary["counts"] {
  return {
    notificationDeliveryReceiptReadinessRecords: 0,
    ownerConfirmedRecords: 0,
    ownerDeliveryReceiptReadinessRecordedRecords: 0,
    queueBindingReviewedRecords: 0,
    consumerModeReviewedRecords: 0,
    producerDependencyReviewedRecords: 0,
    payloadReadPolicyReviewedRecords: 0,
    ackPolicyReviewedRecords: 0,
    idempotencyPolicyReviewedRecords: 0,
    retryDeadLetterPolicyReviewedRecords: 0,
    providerHandoffDependencyReviewedRecords: 0,
    backpressurePolicyReviewedRecords: 0,
    auditCorrelationReviewedRecords: 0,
    retentionPolicyReviewedRecords: 0,
    emailSendEnabledRecords: 0,
    queueDispatchEnabledRecords: 0,
    queueProducerEnabledRecords: 0,
    queueConsumerEnabledRecords: 0,
    deliveryReceiptEnabledRecords: 0,
    queueMessageCreatedRecords: 0,
    queueMessageConsumedRecords: 0,
    queueMessageAcknowledgedRecords: 0,
    retryDeadLetterRowCreatedRecords: 0,
    queuePayloadBodyReadRecords: 0,
    queuePayloadBodyCreatedRecords: 0,
    customerAlertEnabledRecords: 0,
    trafficRoutingEnabledRecords: 0,
    automatedWinnerEnabledRecords: 0,
    revenueClaimEnabledRecords: 0,
    rawAnalyticsRowsExposedRecords: 0,
    recipientIdentityIncludedRecords: 0,
    recipientPayloadCreatedRecords: 0,
    personalizedBodyCreatedRecords: 0,
    rawPayloadBodyStoredRecords: 0,
    emailBodyIncludedRecords: 0,
    providerMessageIdIncludedRecords: 0,
    queuePayloadIncludedRecords: 0,
    providerSendEnabledRecords: 0,
    deliveryReceiptRecordedRecords: 0,
    providerConfiguredRecords: 0,
    providerResponseCreatedRecords: 0,
    providerSecretIncludedRecords: 0,
    senderDomainConfiguredRecords: 0,
    senderDomainVerifiedRecords: 0,
    senderCredentialIncludedRecords: 0,
    privateDnsCredentialsIncludedRecords: 0,
  };
}

function emptySummary(
  source: AnalyticsNotificationDeliveryReceiptReadinessSummary["source"],
  loadError: string | null,
): AnalyticsNotificationDeliveryReceiptReadinessSummary {
  return {
    id: "analytics-notification-delivery-receipt-readiness-contract",
    status: analyticsNotificationDeliveryReceiptReadinessStatus,
    issue: analyticsNotificationDeliveryReceiptReadinessIssue,
    parentIssue: 18,
    apiRoute: analyticsNotificationDeliveryReceiptReadinessApiRoute,
    ownerRoute: analyticsNotificationDeliveryReceiptReadinessOwnerRoute,
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
      notificationSendPayloadReadinessIssue: analyticsNotificationSendPayloadReadinessIssue,
      notificationSendPayloadReadinessStatus: analyticsNotificationSendPayloadReadinessStatus,
      notificationQueueProducerReadinessIssue: analyticsNotificationQueueProducerReadinessIssue,
      notificationQueueProducerReadinessStatus: analyticsNotificationQueueProducerReadinessStatus,
      notificationQueueConsumerReadinessIssue: analyticsNotificationQueueConsumerReadinessIssue,
      notificationQueueConsumerReadinessStatus: analyticsNotificationQueueConsumerReadinessStatus,
      notificationProviderCallReadinessIssue: analyticsNotificationProviderCallReadinessIssue,
      notificationProviderCallReadinessStatus: analyticsNotificationProviderCallReadinessStatus,
      notificationDeliveryAttemptReadinessIssue: analyticsNotificationDeliveryAttemptReadinessIssue,
      notificationDeliveryAttemptReadinessStatus: analyticsNotificationDeliveryAttemptReadinessStatus,
      notificationDeliveryStatusWebhookReadinessIssue: analyticsNotificationDeliveryStatusWebhookReadinessIssue,
      notificationDeliveryStatusWebhookReadinessStatus: analyticsNotificationDeliveryStatusWebhookReadinessStatus,
      notificationReceiptPayloadReadinessIssue: analyticsNotificationReceiptPayloadReadinessIssue,
      notificationReceiptPayloadReadinessStatus: analyticsNotificationReceiptPayloadReadinessStatus,
      channelId: analyticsNotificationAdminInboxChannelId,
      dashboardId: analyticsDashboard.id,
      dashboardRevisionId: analyticsDashboard.revisionId,
      ownerReviewStatus,
      alertThresholdCount: analyticsNotificationThresholdIds.length,
    },
    confirmation: {
      required: true,
      text: analyticsNotificationDeliveryReceiptReadinessConfirmationText,
    },
    supportedDeliveryReceiptReadinessDispositions,
    defaultDeliveryReceiptReadinessDisposition,
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
      "recipientPayload",
      "personalizedBody",
      "rawPayloadBody",
      "emailBody",
      "bodyTemplate",
      "payloadShape",
      "unsubscribeUrl",
      "providerMessageId",
      "providerResponse",
      "deliveryReceipt",
      "deliveryReceiptPayload",
      "statusWebhook",
      "deliveryReceiptResult",
      "queuePayload",
      "queuePayloadBody",
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
      "Issue #309 lets verified owners record redacted analytics notification delivery-receipt readiness evidence after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, current receipt-payload readiness checks, fixed-window evidence checks, and sample-size caveat acknowledgement. It records owner-visible delivery-receipt boundary readiness only; it does not enable provider sends or calls, attempt delivery, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, send email, enable Cloudflare Queue producers or consumers, dispatch queues, create queue messages, consume queue messages, acknowledge queue messages, create retry/dead-letter rows, read queue payload bodies, create queue payload bodies, create customer alerts, expose notification recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, create or expose provider responses, expose provider message IDs, create delivery receipts, expose delivery receipts, process status webhooks, poll providers, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, or make revenue claims.",
  };
}

function publicReceiptPayloadReadinessReference(
  row: ReceiptPayloadReadinessReferenceRow,
): AnalyticsNotificationDeliveryReceiptReceiptPayloadReadinessReference {
  return {
    id: row.id,
    readinessId: row.readiness_id,
    channelId: row.channel_id,
    inboxRecordId: row.inbox_record_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    providerDomainReadinessId: row.provider_domain_readiness_id,
    sendPayloadReadinessId: row.send_payload_readiness_id,
    providerPollingReadinessId: row.provider_polling_readiness_id,
    timeWindowKey: row.time_window_key,
    expectedReadinessStatus: row.expected_readiness_status,
    expectedNotificationInboxStatus: row.expected_notification_inbox_status,
    expectedNotificationDispatchPreflightStatus: row.expected_notification_dispatch_preflight_status,
    expectedNotificationProviderDomainReadinessStatus: row.expected_notification_provider_domain_readiness_status,
    expectedNotificationSendPayloadReadinessStatus: row.expected_notification_send_payload_readiness_status,
    expectedNotificationProviderPollingReadinessStatus: row.expected_notification_provider_polling_readiness_status,
    expectedNotificationReceiptPayloadReadinessStatus: analyticsNotificationReceiptPayloadReadinessStatus,
    expectedOwnerReviewStatus: row.expected_owner_review_status,
    expectedAlertThresholdCount: numberValue(row.expected_alert_threshold_count),
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
    ownerReceiptPayloadReadinessRecorded: true,
    queueBindingReviewed: true,
    consumerModeReviewed: true,
    producerDependencyReviewed: true,
    payloadReadPolicyReviewed: true,
    ackPolicyReviewed: true,
    idempotencyPolicyReviewed: true,
    retryDeadLetterPolicyReviewed: true,
    providerHandoffDependencyReviewed: true,
    backpressurePolicyReviewed: true,
    auditCorrelationReviewed: true,
    retentionPolicyReviewed: true,
    ownerEmailSendEnabled: false,
    queueDispatchEnabled: false,
    queueProducerEnabled: false,
    queueConsumerEnabled: false,
    receiptPayloadEnabled: false,
    deliveryReceiptEnabled: false,
    queueMessageCreated: false,
    queueMessageConsumed: false,
    queueMessageAcknowledged: false,
    retryDeadLetterRowCreated: false,
    queuePayloadBodyRead: false,
    queuePayloadBodyCreated: false,
    customerAlertEnabled: false,
    trafficRoutingEnabled: false,
    automatedWinnerEnabled: false,
    revenueClaimEnabled: false,
    rawAnalyticsRowsExposed: false,
    recipientIdentityIncluded: false,
    recipientPayloadCreated: false,
    personalizedBodyCreated: false,
    rawPayloadBodyStored: false,
    emailBodyIncluded: false,
    providerMessageIdIncluded: false,
    queuePayloadIncluded: false,
    providerSendEnabled: false,
    receiptPayloadRecorded: false,
    deliveryReceiptRecorded: false,
    providerConfigured: false,
    providerResponseCreated: false,
    providerSecretIncluded: false,
    senderDomainConfigured: false,
    senderDomainVerified: false,
    senderCredentialIncluded: false,
    privateDnsCredentialsIncluded: false,
    createdAt: createdAtIso(row.created_at),
  };
}

function publicRecord(row: DeliveryReceiptReadinessRow, duplicate = false): AnalyticsNotificationDeliveryReceiptReadinessPublic {
  return {
    id: row.id,
    dashboardId: row.dashboard_id,
    readinessId: row.readiness_id,
    channelId: row.channel_id,
    inboxRecordId: row.inbox_record_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    providerDomainReadinessId: row.provider_domain_readiness_id,
    sendPayloadReadinessId: row.send_payload_readiness_id,
    receiptPayloadReadinessId: row.receipt_payload_readiness_id,
    recordKind: row.record_kind,
    notificationDeliveryReceiptReadinessDisposition: row.notification_delivery_receipt_readiness_disposition,
    timeWindowKey: row.time_window_key,
    expectedReadinessStatus: row.expected_readiness_status,
    expectedNotificationInboxStatus: row.expected_notification_inbox_status,
    expectedNotificationDispatchPreflightStatus: row.expected_notification_dispatch_preflight_status,
    expectedNotificationProviderDomainReadinessStatus: row.expected_notification_provider_domain_readiness_status,
    expectedNotificationSendPayloadReadinessStatus: row.expected_notification_send_payload_readiness_status,
    expectedNotificationReceiptPayloadReadinessStatus: row.expected_notification_receipt_payload_readiness_status,
    expectedOwnerReviewStatus: row.expected_owner_review_status,
    expectedAlertThresholdCount: numberValue(row.expected_alert_threshold_count),
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
    privateNoteRecorded: Boolean(row.private_note_sha256),
    ownerDeliveryReceiptReadinessRecorded: true,
    queueBindingReviewed: true,
    consumerModeReviewed: true,
    producerDependencyReviewed: true,
    payloadReadPolicyReviewed: true,
    ackPolicyReviewed: true,
    idempotencyPolicyReviewed: true,
    retryDeadLetterPolicyReviewed: true,
    providerHandoffDependencyReviewed: true,
    backpressurePolicyReviewed: true,
    auditCorrelationReviewed: true,
    retentionPolicyReviewed: true,
    ownerEmailSendEnabled: false,
    queueDispatchEnabled: false,
    queueProducerEnabled: false,
    queueConsumerEnabled: false,
    deliveryReceiptEnabled: false,
    queueMessageCreated: false,
    queueMessageConsumed: false,
    queueMessageAcknowledged: false,
    retryDeadLetterRowCreated: false,
    queuePayloadBodyRead: false,
    queuePayloadBodyCreated: false,
    customerAlertEnabled: false,
    trafficRoutingEnabled: false,
    automatedWinnerEnabled: false,
    revenueClaimEnabled: false,
    rawAnalyticsRowsExposed: false,
    recipientIdentityIncluded: false,
    recipientPayloadCreated: false,
    personalizedBodyCreated: false,
    rawPayloadBodyStored: false,
    emailBodyIncluded: false,
    providerMessageIdIncluded: false,
    queuePayloadIncluded: false,
    providerSendEnabled: false,
    deliveryReceiptRecorded: false,
    providerConfigured: false,
    providerResponseCreated: false,
    providerSecretIncluded: false,
    senderDomainConfigured: false,
    senderDomainVerified: false,
    senderCredentialIncluded: false,
    privateDnsCredentialsIncluded: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
}

async function loadLatestReceiptPayloadReadinessReference(db: D1Database, timeWindowKey: string) {
  const row = await db
    .prepare(
      `SELECT
        id, readiness_id, channel_id, inbox_record_id, dispatch_preflight_id, provider_domain_readiness_id,
        send_payload_readiness_id, provider_polling_readiness_id, time_window_key, expected_readiness_status, expected_notification_inbox_status,
        expected_notification_dispatch_preflight_status, expected_notification_provider_domain_readiness_status,
        expected_notification_send_payload_readiness_status, expected_notification_provider_polling_readiness_status,
        expected_owner_review_status, expected_alert_threshold_count, expected_conversion_sample_size,
        sample_size_caveat_acknowledged, owner_receipt_payload_readiness_recorded, queue_binding_reviewed,
        consumer_mode_reviewed, producer_dependency_reviewed, payload_read_policy_reviewed, ack_policy_reviewed,
        idempotency_policy_reviewed, retry_dead_letter_policy_reviewed, provider_handoff_dependency_reviewed,
        backpressure_policy_reviewed, audit_correlation_reviewed, retention_policy_reviewed,
        email_send_enabled, queue_dispatch_enabled, queue_producer_enabled, queue_consumer_enabled, receipt_payload_enabled,
        queue_message_created,
        queue_message_consumed, queue_message_acknowledged, retry_dead_letter_row_created, queue_payload_body_read,
        queue_payload_body_created, customer_alert_enabled,
        traffic_routing_enabled, automated_winner_enabled, revenue_claim_enabled, raw_analytics_rows_exposed,
        recipient_identity_included, recipient_payload_created, personalized_body_created, raw_payload_body_stored,
        email_body_included, provider_message_id_included, queue_payload_included, provider_send_enabled, receipt_payload_recorded,
        provider_configured, provider_response_created, provider_secret_included, sender_domain_configured, sender_domain_verified,
        sender_credential_included, private_dns_credentials_included, created_at
       FROM analytics_notification_receipt_payload_readiness_records
       WHERE dashboard_id = ?
         AND readiness_id = ?
         AND channel_id = ?
         AND time_window_key = ?
       ORDER BY created_at DESC, rowid DESC
       LIMIT 1`,
    )
    .bind(analyticsDashboard.id, analyticsNotificationReadinessId, analyticsNotificationAdminInboxChannelId, timeWindowKey)
    .first<ReceiptPayloadReadinessReferenceRow>();
  return row ?? null;
}

function isSafeCurrentReceiptPayloadReadinessReference(
  row: ReceiptPayloadReadinessReferenceRow | null,
  evidence: AnalyticsNotificationDeliveryReceiptReadinessEvidence,
) {
  return Boolean(
    row &&
      row.readiness_id === analyticsNotificationReadinessId &&
      row.channel_id === analyticsNotificationAdminInboxChannelId &&
      row.time_window_key === evidence.timeWindow.key &&
      row.expected_readiness_status === analyticsNotificationReadinessStatus &&
      row.expected_notification_inbox_status === analyticsNotificationInboxStatus &&
      row.expected_notification_dispatch_preflight_status === analyticsNotificationDispatchPreflightStatus &&
      row.expected_notification_provider_domain_readiness_status === analyticsNotificationProviderDomainReadinessStatus &&
      row.expected_notification_send_payload_readiness_status === analyticsNotificationSendPayloadReadinessStatus &&
      row.expected_notification_provider_polling_readiness_status === analyticsNotificationProviderPollingReadinessStatus &&
      row.expected_owner_review_status === ownerReviewStatus &&
      numberValue(row.expected_alert_threshold_count) === analyticsNotificationThresholdIds.length &&
      numberValue(row.expected_conversion_sample_size) === evidence.conversionSampleSize &&
      row.sample_size_caveat_acknowledged === 1 &&
      row.owner_receipt_payload_readiness_recorded === 1 &&
      row.queue_binding_reviewed === 1 &&
      row.consumer_mode_reviewed === 1 &&
      row.producer_dependency_reviewed === 1 &&
      row.payload_read_policy_reviewed === 1 &&
      row.ack_policy_reviewed === 1 &&
      row.idempotency_policy_reviewed === 1 &&
      row.retry_dead_letter_policy_reviewed === 1 &&
      row.provider_handoff_dependency_reviewed === 1 &&
      row.backpressure_policy_reviewed === 1 &&
      row.audit_correlation_reviewed === 1 &&
      row.retention_policy_reviewed === 1 &&
      row.email_send_enabled === 0 &&
      row.queue_dispatch_enabled === 0 &&
      row.queue_producer_enabled === 0 &&
      row.queue_consumer_enabled === 0 &&
      row.receipt_payload_enabled === 0 &&
      row.queue_message_created === 0 &&
      row.queue_message_consumed === 0 &&
      row.queue_message_acknowledged === 0 &&
      row.retry_dead_letter_row_created === 0 &&
      row.queue_payload_body_read === 0 &&
      row.queue_payload_body_created === 0 &&
      row.customer_alert_enabled === 0 &&
      row.traffic_routing_enabled === 0 &&
      row.automated_winner_enabled === 0 &&
      row.revenue_claim_enabled === 0 &&
      row.raw_analytics_rows_exposed === 0 &&
      row.recipient_identity_included === 0 &&
      row.recipient_payload_created === 0 &&
      row.personalized_body_created === 0 &&
      row.raw_payload_body_stored === 0 &&
      row.email_body_included === 0 &&
      row.provider_message_id_included === 0 &&
      row.queue_payload_included === 0 &&
      row.provider_send_enabled === 0 &&
      row.receipt_payload_recorded === 0 &&
      row.provider_configured === 0 &&
      row.provider_response_created === 0 &&
      row.provider_secret_included === 0 &&
      row.sender_domain_configured === 0 &&
      row.sender_domain_verified === 0 &&
      row.sender_credential_included === 0 &&
      row.private_dns_credentials_included === 0,
  );
}

async function loadDeliveryReceiptReadinessEvidence(
  db: D1Database,
  timeWindow: AnalyticsTimeWindow,
): Promise<AnalyticsNotificationDeliveryReceiptReadinessEvidence> {
  const conversionReport = await loadAnalyticsFunnelConversionReport(db, analyticsDashboard, timeWindow);
  const conversionSampleSize = conversionReport.rows.reduce((total, row) => total + row.sampleSize, 0);
  const latestReceiptPayloadReadinessRow = await loadLatestReceiptPayloadReadinessReference(db, timeWindow.key);
  const evidenceWithoutReceiptPayloadReadiness: AnalyticsNotificationDeliveryReceiptReadinessEvidence = {
    timeWindow,
    dashboardId: analyticsDashboard.id,
    dashboardRevisionId: analyticsDashboard.revisionId,
    readinessId: analyticsNotificationReadinessId,
    readinessStatus: analyticsNotificationReadinessStatus,
    notificationInboxStatus: analyticsNotificationInboxStatus,
    notificationDispatchPreflightStatus: analyticsNotificationDispatchPreflightStatus,
    notificationProviderDomainReadinessStatus: analyticsNotificationProviderDomainReadinessStatus,
    notificationSendPayloadReadinessStatus: analyticsNotificationSendPayloadReadinessStatus,
    notificationReceiptPayloadReadinessStatus: analyticsNotificationReceiptPayloadReadinessStatus,
    channelId: analyticsNotificationAdminInboxChannelId,
    ownerReviewStatus,
    alertThresholdCount: analyticsNotificationThresholdIds.length,
    conversionSampleSize,
    sampleSizeCaveat: conversionReport.sampleSizeCaveat,
    sampleSizeCaveatAcknowledged: true,
    latestReceiptPayloadReadinessRecord: latestReceiptPayloadReadinessRow
      ? publicReceiptPayloadReadinessReference(latestReceiptPayloadReadinessRow)
      : null,
    receiptPayloadReadinessRecordRequired: true,
    receiptPayloadReadinessRecordCurrent: false,
    supportedDeliveryReceiptReadinessDispositions,
    defaultDeliveryReceiptReadinessDisposition,
    deliveryReceiptReadinessChecklist: [
      {
        id: "analytics-delivery-receipt-check-readiness",
        title: "Notification readiness contract is current",
        status: "passed",
        evidence: `Issue #${analyticsNotificationReadinessIssue} records delivery readiness without sends, recipients, or email bodies.`,
      },
      {
        id: "analytics-delivery-receipt-check-receipt-payload-readiness",
        title: "Owner receipt-payload readiness exists for the selected window",
        status: latestReceiptPayloadReadinessRow ? "passed" : "blocked",
        evidence: latestReceiptPayloadReadinessRow
          ? `Latest receipt-payload readiness ${latestReceiptPayloadReadinessRow.id} is available for ${timeWindow.key}.`
          : "Record owner notification receipt-payload readiness evidence before delivery-receipt readiness evidence.",
      },
      {
        id: "analytics-delivery-receipt-check-provider-disabled",
        title: "Delivery receipt stays reviewed without enabling provider sends",
        status: "passed",
        evidence:
          "This record tracks delivery-receipt readiness only; it does not call, configure, or enable a provider.",
      },
      {
        id: "analytics-delivery-receipt-check-redaction",
        title: "Payload handoff and provider response redaction are reviewed",
        status: "passed",
        evidence:
          "This record keeps provider payloads, responses, message IDs, bodies, secrets, sender credentials, and DNS details out of public output.",
      },
      {
        id: "analytics-delivery-receipt-check-runtime-dependencies",
        title: "Provider runtime dependencies stay explicit",
        status: "passed",
        evidence:
          "Delivery receipts stay blocked until future receipt-ingestion and provider-status contracts can prove result handling safely.",
      },
      {
        id: "analytics-delivery-receipt-check-audit-retention",
        title: "Audit and retention readiness are reviewed",
        status: "passed",
        evidence:
          "This record tracks audit-correlation and retention readiness metadata without exposing actor email, private notes, or raw analytics rows.",
      },
      {
        id: "analytics-delivery-receipt-check-send-disabled",
        title: "Delivery receipts are still disabled",
        status: "external_required",
        evidence:
          "Live owner alert sending still needs future owner-approved provider execution and delivery-receipt evidence.",
      },
    ],
    ownerRecordAllowed: Boolean(latestReceiptPayloadReadinessRow),
    ownerEmailSendEnabled: false,
    queueDispatchEnabled: false,
    queueProducerEnabled: false,
    queueConsumerEnabled: false,
    deliveryReceiptEnabled: false,
    queueMessageCreated: false,
    queueMessageConsumed: false,
    queueMessageAcknowledged: false,
    retryDeadLetterRowCreated: false,
    queuePayloadBodyRead: false,
    queuePayloadBodyCreated: false,
    customerAlertEnabled: false,
    trafficRoutingEnabled: false,
    automatedWinnerEnabled: false,
    revenueClaimEnabled: false,
    rawRowsIncluded: false,
    privateDataIncluded: false,
    recipientIdentityIncluded: false,
    recipientPayloadCreated: false,
    personalizedBodyCreated: false,
    rawPayloadBodyStored: false,
    emailBodyIncluded: false,
    providerMessageIdIncluded: false,
    queuePayloadIncluded: false,
    queueBindingReviewed: true,
    consumerModeReviewed: true,
    producerDependencyReviewed: true,
    payloadReadPolicyReviewed: true,
    ackPolicyReviewed: true,
    idempotencyPolicyReviewed: true,
    retryDeadLetterPolicyReviewed: true,
    providerHandoffDependencyReviewed: true,
    backpressurePolicyReviewed: true,
    auditCorrelationReviewed: true,
    retentionPolicyReviewed: true,
    providerSendEnabled: false,
    deliveryReceiptRecorded: false,
    providerConfigured: false,
    providerResponseCreated: false,
    providerSecretIncluded: false,
    senderDomainConfigured: false,
    senderDomainVerified: false,
    senderCredentialIncluded: false,
    privateDnsCredentialsIncluded: false,
  };
  return {
    ...evidenceWithoutReceiptPayloadReadiness,
    receiptPayloadReadinessRecordCurrent: isSafeCurrentReceiptPayloadReadinessReference(
      latestReceiptPayloadReadinessRow,
      evidenceWithoutReceiptPayloadReadiness,
    ),
    ownerRecordAllowed: isSafeCurrentReceiptPayloadReadinessReference(
      latestReceiptPayloadReadinessRow,
      evidenceWithoutReceiptPayloadReadiness,
    ),
  };
}

async function loadAllDeliveryReceiptReadinessEvidence(db: D1Database) {
  return Promise.all(analyticsTimeWindows.map((window) => loadDeliveryReceiptReadinessEvidence(db, window)));
}

async function findRecordByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_notification_delivery_receipt_readiness_records
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<DeliveryReceiptReadinessRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS notification_delivery_receipt_readiness_records,
        SUM(CASE WHEN confirmation_text_sha256 IS NOT NULL THEN 1 ELSE 0 END) AS owner_confirmed_records,
        SUM(owner_delivery_receipt_readiness_recorded) AS owner_delivery_receipt_readiness_recorded_records,
        SUM(queue_binding_reviewed) AS queue_binding_reviewed_records,
        SUM(consumer_mode_reviewed) AS consumer_mode_reviewed_records,
        SUM(producer_dependency_reviewed) AS producer_dependency_reviewed_records,
        SUM(payload_read_policy_reviewed) AS payload_read_policy_reviewed_records,
        SUM(ack_policy_reviewed) AS ack_policy_reviewed_records,
        SUM(idempotency_policy_reviewed) AS idempotency_policy_reviewed_records,
        SUM(retry_dead_letter_policy_reviewed) AS retry_dead_letter_policy_reviewed_records,
        SUM(provider_handoff_dependency_reviewed) AS provider_handoff_dependency_reviewed_records,
        SUM(backpressure_policy_reviewed) AS backpressure_policy_reviewed_records,
        SUM(audit_correlation_reviewed) AS audit_correlation_reviewed_records,
        SUM(retention_policy_reviewed) AS retention_policy_reviewed_records,
        SUM(email_send_enabled) AS email_send_enabled_records,
        SUM(queue_dispatch_enabled) AS queue_dispatch_enabled_records,
        SUM(queue_producer_enabled) AS queue_producer_enabled_records,
        SUM(queue_consumer_enabled) AS queue_consumer_enabled_records,
        SUM(delivery_receipt_enabled) AS delivery_receipt_enabled_records,
        SUM(queue_message_created) AS queue_message_created_records,
        SUM(queue_message_consumed) AS queue_message_consumed_records,
        SUM(queue_message_acknowledged) AS queue_message_acknowledged_records,
        SUM(retry_dead_letter_row_created) AS retry_dead_letter_row_created_records,
        SUM(queue_payload_body_read) AS queue_payload_body_read_records,
        SUM(queue_payload_body_created) AS queue_payload_body_created_records,
        SUM(customer_alert_enabled) AS customer_alert_enabled_records,
        SUM(traffic_routing_enabled) AS traffic_routing_enabled_records,
        SUM(automated_winner_enabled) AS automated_winner_enabled_records,
        SUM(revenue_claim_enabled) AS revenue_claim_enabled_records,
        SUM(raw_analytics_rows_exposed) AS raw_analytics_rows_exposed_records,
        SUM(recipient_identity_included) AS recipient_identity_included_records,
        SUM(recipient_payload_created) AS recipient_payload_created_records,
        SUM(personalized_body_created) AS personalized_body_created_records,
        SUM(raw_payload_body_stored) AS raw_payload_body_stored_records,
        SUM(email_body_included) AS email_body_included_records,
        SUM(provider_message_id_included) AS provider_message_id_included_records,
        SUM(queue_payload_included) AS queue_payload_included_records,
        SUM(provider_send_enabled) AS provider_send_enabled_records,
        SUM(delivery_receipt_recorded) AS delivery_receipt_recorded_records,
        SUM(provider_configured) AS provider_configured_records,
        SUM(provider_response_created) AS provider_response_created_records,
        SUM(provider_secret_included) AS provider_secret_included_records,
        SUM(sender_domain_configured) AS sender_domain_configured_records,
        SUM(sender_domain_verified) AS sender_domain_verified_records,
        SUM(sender_credential_included) AS sender_credential_included_records,
        SUM(private_dns_credentials_included) AS private_dns_credentials_included_records
       FROM analytics_notification_delivery_receipt_readiness_records`,
    )
    .first<DeliveryReceiptReadinessCountRow>();

  return {
    notificationDeliveryReceiptReadinessRecords: numberValue(row?.notification_delivery_receipt_readiness_records),
    ownerConfirmedRecords: numberValue(row?.owner_confirmed_records),
    ownerDeliveryReceiptReadinessRecordedRecords: numberValue(row?.owner_delivery_receipt_readiness_recorded_records),
    queueBindingReviewedRecords: numberValue(row?.queue_binding_reviewed_records),
    consumerModeReviewedRecords: numberValue(row?.consumer_mode_reviewed_records),
    producerDependencyReviewedRecords: numberValue(row?.producer_dependency_reviewed_records),
    payloadReadPolicyReviewedRecords: numberValue(row?.payload_read_policy_reviewed_records),
    ackPolicyReviewedRecords: numberValue(row?.ack_policy_reviewed_records),
    idempotencyPolicyReviewedRecords: numberValue(row?.idempotency_policy_reviewed_records),
    retryDeadLetterPolicyReviewedRecords: numberValue(row?.retry_dead_letter_policy_reviewed_records),
    providerHandoffDependencyReviewedRecords: numberValue(row?.provider_handoff_dependency_reviewed_records),
    backpressurePolicyReviewedRecords: numberValue(row?.backpressure_policy_reviewed_records),
    auditCorrelationReviewedRecords: numberValue(row?.audit_correlation_reviewed_records),
    retentionPolicyReviewedRecords: numberValue(row?.retention_policy_reviewed_records),
    emailSendEnabledRecords: numberValue(row?.email_send_enabled_records),
    queueDispatchEnabledRecords: numberValue(row?.queue_dispatch_enabled_records),
    queueProducerEnabledRecords: numberValue(row?.queue_producer_enabled_records),
    queueConsumerEnabledRecords: numberValue(row?.queue_consumer_enabled_records),
    deliveryReceiptEnabledRecords: numberValue(row?.delivery_receipt_enabled_records),
    queueMessageCreatedRecords: numberValue(row?.queue_message_created_records),
    queueMessageConsumedRecords: numberValue(row?.queue_message_consumed_records),
    queueMessageAcknowledgedRecords: numberValue(row?.queue_message_acknowledged_records),
    retryDeadLetterRowCreatedRecords: numberValue(row?.retry_dead_letter_row_created_records),
    queuePayloadBodyReadRecords: numberValue(row?.queue_payload_body_read_records),
    queuePayloadBodyCreatedRecords: numberValue(row?.queue_payload_body_created_records),
    customerAlertEnabledRecords: numberValue(row?.customer_alert_enabled_records),
    trafficRoutingEnabledRecords: numberValue(row?.traffic_routing_enabled_records),
    automatedWinnerEnabledRecords: numberValue(row?.automated_winner_enabled_records),
    revenueClaimEnabledRecords: numberValue(row?.revenue_claim_enabled_records),
    rawAnalyticsRowsExposedRecords: numberValue(row?.raw_analytics_rows_exposed_records),
    recipientIdentityIncludedRecords: numberValue(row?.recipient_identity_included_records),
    recipientPayloadCreatedRecords: numberValue(row?.recipient_payload_created_records),
    personalizedBodyCreatedRecords: numberValue(row?.personalized_body_created_records),
    rawPayloadBodyStoredRecords: numberValue(row?.raw_payload_body_stored_records),
    emailBodyIncludedRecords: numberValue(row?.email_body_included_records),
    providerMessageIdIncludedRecords: numberValue(row?.provider_message_id_included_records),
    queuePayloadIncludedRecords: numberValue(row?.queue_payload_included_records),
    providerSendEnabledRecords: numberValue(row?.provider_send_enabled_records),
    deliveryReceiptRecordedRecords: numberValue(row?.delivery_receipt_recorded_records),
    providerConfiguredRecords: numberValue(row?.provider_configured_records),
    providerResponseCreatedRecords: numberValue(row?.provider_response_created_records),
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
       FROM analytics_notification_delivery_receipt_readiness_records
       ORDER BY created_at DESC, rowid DESC
       LIMIT 5`,
    )
    .all<DeliveryReceiptReadinessRow>();
  return (result.results ?? []).map((row) => publicRecord(row, false));
}

export async function getAnalyticsNotificationDeliveryReceiptReadinessSummary(
  dbInput?: D1Database,
): Promise<AnalyticsNotificationDeliveryReceiptReadinessSummary> {
  try {
    const db = dbInput ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null),
      currentEvidenceByWindow: await loadAllDeliveryReceiptReadinessEvidence(db),
      counts: await loadCounts(db),
      latestRecords: await loadLatestRecords(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load analytics notification delivery-receipt readiness records.",
    );
  }
}

export async function createAnalyticsNotificationDeliveryReceiptReadiness(
  input: CreateDeliveryReceiptReadinessInput,
): Promise<CreateDeliveryReceiptReadinessResult> {
  const summaryRedaction = redaction();
  const dashboardId = parseString(input.dashboardId);
  const readinessId = parseString(input.readinessId);
  const channelId = parseString(input.channelId);
  const inboxRecordId = parseString(input.inboxRecordId);
  const dispatchPreflightId = parseString(input.dispatchPreflightId);
  const providerDomainReadinessId = parseString(input.providerDomainReadinessId);
  const sendPayloadReadinessId = parseString(input.sendPayloadReadinessId);
  const receiptPayloadReadinessId = parseString(input.receiptPayloadReadinessId);
  const timeWindowKey = parseString(input.timeWindowKey, 20) ?? defaultAnalyticsTimeWindow.key;
  const notificationDeliveryReceiptReadinessDisposition = parseDisposition(input.notificationDeliveryReceiptReadinessDisposition);
  const expectedDashboardRevisionId = parseString(input.expectedDashboardRevisionId);
  const expectedReadinessStatus = parseString(input.expectedReadinessStatus);
  const expectedNotificationInboxStatus = parseString(input.expectedNotificationInboxStatus);
  const expectedNotificationDispatchPreflightStatus = parseString(input.expectedNotificationDispatchPreflightStatus);
  const expectedNotificationProviderDomainReadinessStatus = parseString(
    input.expectedNotificationProviderDomainReadinessStatus,
  );
  const expectedNotificationSendPayloadReadinessStatus = parseString(
    input.expectedNotificationSendPayloadReadinessStatus,
  );
  const expectedNotificationReceiptPayloadReadinessStatus = parseString(
    input.expectedNotificationReceiptPayloadReadinessStatus,
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
    !sendPayloadReadinessId ||
    !receiptPayloadReadinessId ||
    !expectedDashboardRevisionId ||
    !expectedReadinessStatus ||
    !expectedNotificationInboxStatus ||
    !expectedNotificationDispatchPreflightStatus ||
    !expectedNotificationProviderDomainReadinessStatus ||
    !expectedNotificationSendPayloadReadinessStatus ||
    !expectedNotificationReceiptPayloadReadinessStatus ||
    !expectedOwnerReviewStatus ||
    expectedAlertThresholdCount === null ||
    expectedConversionSampleSize === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Dashboard, readiness, channel, inbox record, dispatch preflight, provider/domain readiness, send-payload readiness, receipt-payload readiness, expected statuses, threshold count, conversion sample size, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (!notificationDeliveryReceiptReadinessDisposition) {
    return {
      ok: false,
      status: "unsupported_notification_delivery_receipt_readiness_disposition",
      message: "A supported analytics notification delivery-receipt readiness disposition is required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== analyticsNotificationDeliveryReceiptReadinessConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording analytics notification delivery-receipt readiness evidence.",
      redaction: summaryRedaction,
    };
  }

  if (!sampleSizeCaveatAcknowledged) {
    return {
      ok: false,
      status: "sample_size_caveat_required",
      message: "The sample-size caveat must be acknowledged before recording analytics notification delivery-receipt readiness evidence.",
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
      message: "The analytics dashboard revision changed before the delivery-receipt readiness was recorded.",
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
      message: "The notification readiness status changed before the delivery-receipt readiness was recorded.",
      redaction: summaryRedaction,
      currentReadinessStatus: analyticsNotificationReadinessStatus,
    };
  }

  if (expectedNotificationInboxStatus !== analyticsNotificationInboxStatus) {
    return {
      ok: false,
      status: "stale_notification_inbox_status",
      message: "The notification inbox contract changed before the delivery-receipt readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationInboxStatus: analyticsNotificationInboxStatus,
    };
  }

  if (expectedNotificationDispatchPreflightStatus !== analyticsNotificationDispatchPreflightStatus) {
    return {
      ok: false,
      status: "stale_notification_dispatch_preflight_status",
      message: "The notification dispatch preflight contract changed before the delivery-receipt readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationDispatchPreflightStatus: analyticsNotificationDispatchPreflightStatus,
    };
  }

  if (expectedNotificationProviderDomainReadinessStatus !== analyticsNotificationProviderDomainReadinessStatus) {
    return {
      ok: false,
      status: "stale_notification_provider_domain_readiness_status",
      message: "The notification provider/domain readiness contract changed before the delivery-receipt readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationProviderDomainReadinessStatus: analyticsNotificationProviderDomainReadinessStatus,
    };
  }

  if (expectedNotificationSendPayloadReadinessStatus !== analyticsNotificationSendPayloadReadinessStatus) {
    return {
      ok: false,
      status: "stale_notification_send_payload_readiness_status",
      message: "The notification send-payload readiness contract changed before the delivery-receipt readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationSendPayloadReadinessStatus: analyticsNotificationSendPayloadReadinessStatus,
    };
  }

  if (expectedNotificationReceiptPayloadReadinessStatus !== analyticsNotificationReceiptPayloadReadinessStatus) {
    return {
      ok: false,
      status: "stale_notification_receipt_payload_readiness_status",
      message: "The notification receipt-payload readiness contract changed before the delivery-receipt readiness was recorded.",
      redaction: summaryRedaction,
      currentNotificationReceiptPayloadReadinessStatus: analyticsNotificationReceiptPayloadReadinessStatus,
    };
  }

  if (expectedOwnerReviewStatus !== ownerReviewStatus) {
    return {
      ok: false,
      status: "stale_owner_review_status",
      message: "The owner review status changed before the delivery-receipt readiness was recorded.",
      redaction: summaryRedaction,
      currentOwnerReviewStatus: ownerReviewStatus,
    };
  }

  if (expectedAlertThresholdCount !== analyticsNotificationThresholdIds.length) {
    return {
      ok: false,
      status: "stale_threshold_count",
      message: "The notification threshold count changed before the delivery-receipt readiness was recorded.",
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
  const currentEvidence = await loadDeliveryReceiptReadinessEvidence(db, timeWindow);
  if (expectedConversionSampleSize !== currentEvidence.conversionSampleSize) {
    return {
      ok: false,
      status: "stale_analytics_evidence",
      message: "The aggregate analytics evidence changed before the delivery-receipt readiness was recorded.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (
    !currentEvidence.latestReceiptPayloadReadinessRecord ||
    currentEvidence.latestReceiptPayloadReadinessRecord.id !== receiptPayloadReadinessId
  ) {
    return {
      ok: false,
      status: currentEvidence.latestReceiptPayloadReadinessRecord
        ? "stale_notification_receipt_payload_readiness_evidence"
        : "unsupported_receipt_payload_readiness",
      message: currentEvidence.latestReceiptPayloadReadinessRecord
        ? "A newer notification receipt-payload readiness exists for the selected analytics window."
        : "A current notification receipt-payload readiness is required before recording delivery-receipt readiness.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (currentEvidence.latestReceiptPayloadReadinessRecord.sendPayloadReadinessId !== sendPayloadReadinessId) {
    return {
      ok: false,
      status: "stale_notification_send_payload_readiness_evidence",
      message: "The notification send-payload readiness no longer matches the current receipt-payload readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (currentEvidence.latestReceiptPayloadReadinessRecord.providerDomainReadinessId !== providerDomainReadinessId) {
    return {
      ok: false,
      status: "stale_notification_provider_domain_readiness_evidence",
      message: "The notification provider/domain readiness no longer matches the current send-payload readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (currentEvidence.latestReceiptPayloadReadinessRecord.dispatchPreflightId !== dispatchPreflightId) {
    return {
      ok: false,
      status: "stale_notification_dispatch_preflight_evidence",
      message: "The notification dispatch preflight no longer matches the current send-payload readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (currentEvidence.latestReceiptPayloadReadinessRecord.inboxRecordId !== inboxRecordId) {
    return {
      ok: false,
      status: "stale_notification_inbox_evidence",
      message: "The notification inbox record no longer matches the current send-payload readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  if (!currentEvidence.receiptPayloadReadinessRecordCurrent || !currentEvidence.ownerRecordAllowed) {
    return {
      ok: false,
      status: "stale_notification_receipt_payload_readiness_evidence",
      message: "The notification receipt-payload readiness evidence is not safe or current enough for delivery-receipt readiness evidence.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(analyticsNotificationDeliveryReceiptReadinessConfirmationText);
  const existing = await findRecordByIdempotency(db, idempotencyKey);
  if (existing) {
    const sameRequest =
      existing.dashboard_id === dashboardId &&
      existing.readiness_id === readinessId &&
      existing.channel_id === channelId &&
      existing.inbox_record_id === inboxRecordId &&
      existing.dispatch_preflight_id === dispatchPreflightId &&
      existing.provider_domain_readiness_id === providerDomainReadinessId &&
      existing.send_payload_readiness_id === sendPayloadReadinessId &&
      existing.receipt_payload_readiness_id === receiptPayloadReadinessId &&
      existing.record_kind === deliveryReceiptReadinessRecordKind &&
      existing.notification_delivery_receipt_readiness_disposition === notificationDeliveryReceiptReadinessDisposition &&
      existing.time_window_key === timeWindow.key &&
      existing.expected_dashboard_revision_id === expectedDashboardRevisionId &&
      existing.expected_readiness_status === expectedReadinessStatus &&
      existing.expected_notification_inbox_status === expectedNotificationInboxStatus &&
      existing.expected_notification_dispatch_preflight_status === expectedNotificationDispatchPreflightStatus &&
      existing.expected_notification_provider_domain_readiness_status === expectedNotificationProviderDomainReadinessStatus &&
      existing.expected_notification_send_payload_readiness_status === expectedNotificationSendPayloadReadinessStatus &&
      existing.expected_notification_receipt_payload_readiness_status === expectedNotificationReceiptPayloadReadinessStatus &&
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
        message: "The idempotency key is already associated with a different notification delivery-receipt readiness request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "analytics_notification_delivery_receipt_readiness_replayed",
      duplicate: true,
      record: publicRecord(existing, true),
      redaction: summaryRedaction,
    };
  }

  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const recordId = `analytics-notification-delivery-receipt-readiness-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO analytics_notification_delivery_receipt_readiness_records (
        id, dashboard_id, readiness_id, channel_id, inbox_record_id, dispatch_preflight_id, provider_domain_readiness_id,
        send_payload_readiness_id, receipt_payload_readiness_id, record_kind,
        notification_delivery_receipt_readiness_disposition, time_window_key,
        expected_dashboard_revision_id, expected_readiness_status, expected_notification_inbox_status,
        expected_notification_dispatch_preflight_status, expected_notification_provider_domain_readiness_status,
        expected_notification_send_payload_readiness_status, expected_notification_receipt_payload_readiness_status,
        expected_owner_review_status,
        expected_alert_threshold_count, expected_conversion_sample_size,
        sample_size_caveat_acknowledged, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, owner_delivery_receipt_readiness_recorded,
        queue_binding_reviewed, consumer_mode_reviewed, producer_dependency_reviewed, payload_read_policy_reviewed,
        ack_policy_reviewed, retry_dead_letter_policy_reviewed, provider_handoff_dependency_reviewed,
        idempotency_policy_reviewed, backpressure_policy_reviewed, audit_correlation_reviewed, retention_policy_reviewed,
        email_send_enabled, queue_dispatch_enabled, queue_producer_enabled, queue_consumer_enabled, delivery_receipt_enabled, queue_message_created,
        queue_message_consumed, queue_message_acknowledged, retry_dead_letter_row_created, queue_payload_body_read,
        queue_payload_body_created,
        customer_alert_enabled, traffic_routing_enabled,
        automated_winner_enabled, revenue_claim_enabled, raw_analytics_rows_exposed,
        recipient_identity_included, recipient_payload_created, personalized_body_created, raw_payload_body_stored,
        email_body_included, provider_message_id_included,
        queue_payload_included, provider_send_enabled, delivery_receipt_recorded, provider_configured,
        provider_response_created, provider_secret_included, sender_domain_configured, sender_domain_verified,
        sender_credential_included, private_dns_credentials_included, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      recordId,
      dashboardId,
      readinessId,
      channelId,
      inboxRecordId,
      dispatchPreflightId,
      providerDomainReadinessId,
      sendPayloadReadinessId,
      receiptPayloadReadinessId,
      deliveryReceiptReadinessRecordKind,
      notificationDeliveryReceiptReadinessDisposition,
      timeWindow.key,
      expectedDashboardRevisionId,
      expectedReadinessStatus,
      expectedNotificationInboxStatus,
      expectedNotificationDispatchPreflightStatus,
      expectedNotificationProviderDomainReadinessStatus,
      expectedNotificationSendPayloadReadinessStatus,
      expectedNotificationReceiptPayloadReadinessStatus,
      expectedOwnerReviewStatus,
      expectedAlertThresholdCount,
      expectedConversionSampleSize,
      idempotencyKey,
      input.actor.userId ?? "unknown-owner",
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      JSON.stringify({
        issue: analyticsNotificationDeliveryReceiptReadinessIssue,
        parentIssue: 18,
        readinessIssue: analyticsNotificationReadinessIssue,
        notificationInboxIssue: analyticsNotificationInboxIssue,
        notificationDispatchPreflightIssue: analyticsNotificationDispatchPreflightIssue,
        notificationProviderDomainReadinessIssue: analyticsNotificationProviderDomainReadinessIssue,
        notificationSendPayloadReadinessIssue: analyticsNotificationSendPayloadReadinessIssue,
        notificationQueueProducerReadinessIssue: analyticsNotificationQueueProducerReadinessIssue,
        notificationQueueConsumerReadinessIssue: analyticsNotificationQueueConsumerReadinessIssue,
        notificationProviderCallReadinessIssue: analyticsNotificationProviderCallReadinessIssue,
        notificationDeliveryAttemptReadinessIssue: analyticsNotificationDeliveryAttemptReadinessIssue,
        notificationReceiptPayloadReadinessIssue: analyticsNotificationReceiptPayloadReadinessIssue,
        inboxRecordId,
        dispatchPreflightId,
        providerDomainReadinessId,
        sendPayloadReadinessId,
        receiptPayloadReadinessId,
        channelId,
        notificationDeliveryReceiptReadinessDisposition,
        sampleSizeCaveatAcknowledged: true,
        ownerDeliveryReceiptReadinessRecorded: true,
        queueBindingReviewed: true,
        consumerModeReviewed: true,
        producerDependencyReviewed: true,
        payloadReadPolicyReviewed: true,
        ackPolicyReviewed: true,
        idempotencyPolicyReviewed: true,
        retryDeadLetterPolicyReviewed: true,
        providerHandoffDependencyReviewed: true,
        backpressurePolicyReviewed: true,
        auditCorrelationReviewed: true,
        retentionPolicyReviewed: true,
        emailSendEnabled: false,
        queueDispatchEnabled: false,
        queueProducerEnabled: false,
        queueConsumerEnabled: false,
        deliveryReceiptEnabled: false,
        queueMessageCreated: false,
        queueMessageConsumed: false,
        queueMessageAcknowledged: false,
        retryDeadLetterRowCreated: false,
        queuePayloadBodyRead: false,
        queuePayloadBodyCreated: false,
        customerAlertEnabled: false,
        trafficRoutingEnabled: false,
        automatedWinnerEnabled: false,
        revenueClaimEnabled: false,
        rawAnalyticsRowsExposed: false,
        recipientIdentityIncluded: false,
        recipientPayloadCreated: false,
        personalizedBodyCreated: false,
        rawPayloadBodyStored: false,
        emailBodyIncluded: false,
        providerMessageIdIncluded: false,
        queuePayloadIncluded: false,
        providerSendEnabled: false,
        deliveryReceiptRecorded: false,
        providerConfigured: false,
        providerResponseCreated: false,
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
      status: "notification_delivery_receipt_readiness_not_recorded",
      message: "The analytics notification delivery-receipt readiness could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "analytics_notification_delivery_receipt_readiness_recorded",
    duplicate: false,
    record: publicRecord(record, false),
    redaction: summaryRedaction,
  };
}
