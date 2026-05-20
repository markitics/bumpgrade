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
export const audienceBroadcastDeliveryQueueMessageIssue = 189;
export const audienceBroadcastDeliveryQueueMessageStatus = "broadcast-delivery-queue-messages-dry-run-ready";
export const audienceBroadcastDeliveryQueueMessageUpdatedAt = "2026-05-20";
export const audienceBroadcastDeliveryQueueMessageApiRoute =
  "/api/admin/audience/broadcasts/delivery-queue-messages";
export const audienceBroadcastDeliveryQueueMessageConfirmationText =
  "Create dry-run Bumpgrade broadcast delivery queue messages";
export const audienceBroadcastDispatchPreflightIssue = 191;
export const audienceBroadcastDispatchPreflightStatus = "broadcast-dispatch-preflight-dry-run-ready";
export const audienceBroadcastDispatchPreflightUpdatedAt = "2026-05-20";
export const audienceBroadcastDispatchPreflightApiRoute =
  "/api/admin/audience/broadcasts/dispatch-preflights";
export const audienceBroadcastDispatchPreflightConfirmationText =
  "Create dry-run Bumpgrade broadcast dispatch preflight";
export const audienceBroadcastDispatchAttemptIssue = 197;
export const audienceBroadcastDispatchAttemptStatus = "broadcast-dispatch-attempts-dry-run-ready";
export const audienceBroadcastDispatchAttemptUpdatedAt = "2026-05-20";
export const audienceBroadcastDispatchAttemptApiRoute =
  "/api/admin/audience/broadcasts/dispatch-attempts";
export const audienceBroadcastDispatchAttemptConfirmationText =
  "Create dry-run Bumpgrade broadcast dispatch attempt";
export const audienceBroadcastSenderDomainReadinessIssue = 199;
export const audienceBroadcastSenderDomainReadinessStatus = "broadcast-sender-domain-readiness-ready";
export const audienceBroadcastSenderDomainReadinessUpdatedAt = "2026-05-20";
export const audienceBroadcastProviderEventReadinessIssue = 201;
export const audienceBroadcastProviderEventReadinessStatus = "broadcast-provider-event-readiness-ready";
export const audienceBroadcastProviderEventReadinessUpdatedAt = "2026-05-20";
export const audienceBroadcastProviderRateLimitReadinessIssue = 203;
export const audienceBroadcastProviderRateLimitReadinessStatus = "broadcast-provider-rate-limit-readiness-ready";
export const audienceBroadcastProviderRateLimitReadinessUpdatedAt = "2026-05-20";
export const audienceBroadcastProviderResponseReadinessIssue = 205;
export const audienceBroadcastProviderResponseReadinessStatus = "broadcast-provider-response-readiness-ready";
export const audienceBroadcastProviderResponseReadinessUpdatedAt = "2026-05-20";
export const audienceBroadcastSendPayloadReadinessIssue = 207;
export const audienceBroadcastSendPayloadReadinessStatus = "broadcast-send-payload-readiness-ready";
export const audienceBroadcastSendPayloadReadinessUpdatedAt = "2026-05-20";

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

type SenderDomainReadinessRow = {
  id: string;
  draft_id: string;
  status: string;
  domain: string;
  intended_from_address: string;
  from_address_policy: string;
  reply_path_policy: string;
  bounce_handling_policy: string;
  spf_alignment_status: string;
  dkim_alignment_status: string;
  dmarc_alignment_status: string;
  sender_domain_gate_status: string;
  verification_evidence_status: string;
  provider_send_enabled: number | string;
  cloudflare_queue_producers_enabled: number | string;
  recipient_payloads_created: number | string;
  provider_responses_created: number | string;
  provider_message_ids_created: number | string;
  updated_at: number | string;
};

type ProviderEventReadinessRow = {
  id: string;
  draft_id: string;
  status: string;
  provider_name: string;
  event_kinds_json: string;
  provider_event_boundary: string;
  bounce_handling_policy: string;
  complaint_handling_policy: string;
  delivery_event_policy: string;
  suppression_update_policy: string;
  audit_correlation_policy: string;
  raw_provider_payload_storage: string;
  provider_secret_status: string;
  sender_domain_gate_status: string;
  provider_send_enabled: number | string;
  cloudflare_queue_producers_enabled: number | string;
  recipient_payloads_created: number | string;
  provider_responses_created: number | string;
  provider_message_ids_created: number | string;
  raw_provider_payloads_stored: number | string;
  updated_at: number | string;
};

type ProviderRateLimitReadinessRow = {
  id: string;
  draft_id: string;
  status: string;
  provider_name: string;
  throttle_window: string;
  daily_limit_policy: string;
  burst_limit_policy: string;
  retry_backoff_policy: string;
  provider_limit_policy: string;
  rate_limit_source: string;
  queue_backpressure_policy: string;
  audit_correlation_policy: string;
  sender_domain_gate_status: string;
  provider_event_gate_status: string;
  provider_send_enabled: number | string;
  cloudflare_queue_producers_enabled: number | string;
  recipient_payloads_created: number | string;
  provider_responses_created: number | string;
  provider_message_ids_created: number | string;
  raw_provider_payloads_stored: number | string;
  updated_at: number | string;
};

type ProviderResponseReadinessRow = {
  id: string;
  draft_id: string;
  status: string;
  provider_name: string;
  response_status_classes_json: string;
  provider_response_boundary: string;
  success_response_policy: string;
  transient_failure_policy: string;
  permanent_failure_policy: string;
  retry_decision_policy: string;
  message_id_storage_policy: string;
  response_body_storage: string;
  audit_correlation_policy: string;
  sender_domain_gate_status: string;
  provider_event_gate_status: string;
  provider_rate_limit_gate_status: string;
  provider_send_enabled: number | string;
  cloudflare_queue_producers_enabled: number | string;
  recipient_payloads_created: number | string;
  provider_responses_created: number | string;
  provider_message_ids_created: number | string;
  raw_provider_response_bodies_stored: number | string;
  updated_at: number | string;
};

type SendPayloadReadinessRow = {
  id: string;
  draft_id: string;
  status: string;
  payload_scope_json: string;
  personalization_boundary: string;
  recipient_identity_policy: string;
  unsubscribe_footer_policy: string;
  consent_recheck_policy: string;
  suppression_recheck_policy: string;
  personalization_token_policy: string;
  payload_body_storage: string;
  audit_correlation_policy: string;
  sender_domain_gate_status: string;
  provider_event_gate_status: string;
  provider_rate_limit_gate_status: string;
  provider_response_gate_status: string;
  cloudflare_queue_producers_enabled: number | string;
  recipient_payloads_created: number | string;
  personalized_bodies_created: number | string;
  provider_send_enabled: number | string;
  provider_responses_created: number | string;
  provider_message_ids_created: number | string;
  raw_payload_bodies_stored: number | string;
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

type DeliveryQueueMessageRow = {
  id: string;
  draft_id: string;
  delivery_batch_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  queue_mode: string;
  expected_draft_updated_at: string;
  expected_ready_recipient_count: number | string;
  dry_run_message_count: number | string;
  held_recipient_count: number | string;
  active_suppression_count: number | string;
  retry_policy: string;
  dispatch_policy: string;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  provider_send_enabled: number | string;
  recipient_payloads_created: number | string;
  cloudflare_queue_messages_created: number | string;
  provider_message_ids_created: number | string;
  idempotency_key: string;
  created_at: number | string;
};

type DispatchPreflightRow = {
  id: string;
  draft_id: string;
  delivery_queue_message_id: string;
  delivery_batch_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  queue_mode: string;
  expected_draft_updated_at: string;
  expected_ready_recipient_count: number | string;
  dry_run_message_count: number | string;
  held_recipient_count: number | string;
  active_suppression_count: number | string;
  provider_limit_policy: string;
  provider_rate_limit_window: string;
  dispatch_mode: string;
  suppression_check_status: string;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  audit_correlation_policy: string;
  provider_send_enabled: number | string;
  recipient_payloads_created: number | string;
  cloudflare_queue_messages_created: number | string;
  provider_message_ids_created: number | string;
  idempotency_key: string;
  created_at: number | string;
};

type DispatchAttemptRow = {
  id: string;
  draft_id: string;
  dispatch_preflight_id: string;
  delivery_queue_message_id: string;
  delivery_batch_id: string;
  schedule_intent_id: string;
  status: string;
  queue_name: string;
  queue_mode: string;
  queue_producer_mode: string;
  expected_draft_updated_at: string;
  expected_ready_recipient_count: number | string;
  dry_run_message_count: number | string;
  held_recipient_count: number | string;
  active_suppression_count: number | string;
  provider_limit_policy: string;
  provider_rate_limit_window: string;
  dispatch_mode: string;
  dispatch_result_status: string;
  suppression_check_status: string;
  unsubscribe_footer_check_status: string;
  sender_domain_gate_status: string;
  audit_correlation_policy: string;
  provider_send_enabled: number | string;
  recipient_payloads_created: number | string;
  cloudflare_queue_messages_created: number | string;
  provider_message_ids_created: number | string;
  provider_responses_created: number | string;
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

export type AudienceBroadcastSenderDomainReadiness = {
  id: string;
  draftId: string;
  status: string;
  domain: string;
  intendedFromAddress: string;
  fromAddressPolicy: string;
  replyPathPolicy: string;
  bounceHandlingPolicy: string;
  spfAlignmentStatus: string;
  dkimAlignmentStatus: string;
  dmarcAlignmentStatus: string;
  senderDomainGateStatus: string;
  verificationEvidenceStatus: string;
  providerSendEnabled: false;
  cloudflareQueueProducersEnabled: false;
  recipientPayloadsCreated: false;
  providerResponsesIncluded: false;
  providerMessageIdsIncluded: false;
  updatedAt: string | null;
};

export type AudienceBroadcastSenderDomainReadinessSummary = {
  id: string;
  status: typeof audienceBroadcastSenderDomainReadinessStatus;
  issue: typeof audienceBroadcastSenderDomainReadinessIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    senderDomainReadinessRecords: number;
    domainsPendingVerification: number;
    domainsReady: number;
    providerSendEnabledRecords: number;
    cloudflareQueueProducerEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
    providerResponsesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
  };
  records: AudienceBroadcastSenderDomainReadiness[];
  redaction: {
    privateDnsCredentialsIncluded: false;
    rawDnsRecordsIncluded: false;
    providerSecretsIncluded: false;
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    recipientPayloadsIncluded: false;
    providerResponsesIncluded: false;
    providerMessageIdsIncluded: false;
    providerSendEnabled: false;
    cloudflareQueueProducersEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastProviderEventReadiness = {
  id: string;
  draftId: string;
  status: string;
  providerName: string;
  eventKinds: string[];
  providerEventBoundary: string;
  bounceHandlingPolicy: string;
  complaintHandlingPolicy: string;
  deliveryEventPolicy: string;
  suppressionUpdatePolicy: string;
  auditCorrelationPolicy: string;
  rawProviderPayloadStorage: string;
  providerSecretStatus: string;
  senderDomainGateStatus: string;
  providerSendEnabled: false;
  cloudflareQueueProducersEnabled: false;
  recipientPayloadsCreated: false;
  providerResponsesIncluded: false;
  providerMessageIdsIncluded: false;
  rawProviderPayloadsStored: false;
  updatedAt: string | null;
};

export type AudienceBroadcastProviderEventReadinessSummary = {
  id: string;
  status: typeof audienceBroadcastProviderEventReadinessStatus;
  issue: typeof audienceBroadcastProviderEventReadinessIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    providerEventReadinessRecords: number;
    bounceEventReadinessRecords: number;
    complaintEventReadinessRecords: number;
    deliveryEventReadinessRecords: number;
    providerSendEnabledRecords: number;
    cloudflareQueueProducerEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
    providerResponsesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
    rawProviderPayloadsStoredRecords: number;
  };
  records: AudienceBroadcastProviderEventReadiness[];
  redaction: {
    providerSecretsIncluded: false;
    rawProviderPayloadsIncluded: false;
    providerResponsesIncluded: false;
    providerMessageIdsIncluded: false;
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    recipientPayloadsIncluded: false;
    providerSendEnabled: false;
    cloudflareQueueProducersEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastProviderRateLimitReadiness = {
  id: string;
  draftId: string;
  status: string;
  providerName: string;
  throttleWindow: string;
  dailyLimitPolicy: string;
  burstLimitPolicy: string;
  retryBackoffPolicy: string;
  providerLimitPolicy: string;
  rateLimitSource: string;
  queueBackpressurePolicy: string;
  auditCorrelationPolicy: string;
  senderDomainGateStatus: string;
  providerEventGateStatus: string;
  providerSendEnabled: false;
  cloudflareQueueProducersEnabled: false;
  recipientPayloadsCreated: false;
  providerResponsesIncluded: false;
  providerMessageIdsIncluded: false;
  rawProviderPayloadsStored: false;
  updatedAt: string | null;
};

export type AudienceBroadcastProviderRateLimitReadinessSummary = {
  id: string;
  status: typeof audienceBroadcastProviderRateLimitReadinessStatus;
  issue: typeof audienceBroadcastProviderRateLimitReadinessIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    providerRateLimitReadinessRecords: number;
    throttleWindowRecords: number;
    retryBackoffPolicyRecords: number;
    providerSendEnabledRecords: number;
    cloudflareQueueProducerEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
    providerResponsesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
    rawProviderPayloadsStoredRecords: number;
  };
  records: AudienceBroadcastProviderRateLimitReadiness[];
  redaction: {
    providerSecretsIncluded: false;
    providerLimitSecretsIncluded: false;
    rawProviderPayloadsIncluded: false;
    providerResponsesIncluded: false;
    providerMessageIdsIncluded: false;
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    recipientPayloadsIncluded: false;
    providerSendEnabled: false;
    cloudflareQueueProducersEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastProviderResponseReadiness = {
  id: string;
  draftId: string;
  status: string;
  providerName: string;
  responseStatusClasses: string[];
  providerResponseBoundary: string;
  successResponsePolicy: string;
  transientFailurePolicy: string;
  permanentFailurePolicy: string;
  retryDecisionPolicy: string;
  messageIdStoragePolicy: string;
  responseBodyStorage: string;
  auditCorrelationPolicy: string;
  senderDomainGateStatus: string;
  providerEventGateStatus: string;
  providerRateLimitGateStatus: string;
  providerSendEnabled: false;
  cloudflareQueueProducersEnabled: false;
  recipientPayloadsCreated: false;
  providerResponsesIncluded: false;
  providerMessageIdsIncluded: false;
  rawProviderResponseBodiesStored: false;
  updatedAt: string | null;
};

export type AudienceBroadcastProviderResponseReadinessSummary = {
  id: string;
  status: typeof audienceBroadcastProviderResponseReadinessStatus;
  issue: typeof audienceBroadcastProviderResponseReadinessIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    providerResponseReadinessRecords: number;
    successResponsePolicyRecords: number;
    transientFailurePolicyRecords: number;
    permanentFailurePolicyRecords: number;
    retryDecisionPolicyRecords: number;
    providerSendEnabledRecords: number;
    cloudflareQueueProducerEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
    providerResponsesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
    rawProviderResponseBodiesStoredRecords: number;
  };
  records: AudienceBroadcastProviderResponseReadiness[];
  redaction: {
    providerSecretsIncluded: false;
    rawProviderResponseBodiesIncluded: false;
    providerResponsesIncluded: false;
    providerMessageIdsIncluded: false;
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    recipientPayloadsIncluded: false;
    providerSendEnabled: false;
    cloudflareQueueProducersEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastSendPayloadReadiness = {
  id: string;
  draftId: string;
  status: string;
  payloadScope: string[];
  personalizationBoundary: string;
  recipientIdentityPolicy: string;
  unsubscribeFooterPolicy: string;
  consentRecheckPolicy: string;
  suppressionRecheckPolicy: string;
  personalizationTokenPolicy: string;
  payloadBodyStorage: string;
  auditCorrelationPolicy: string;
  senderDomainGateStatus: string;
  providerEventGateStatus: string;
  providerRateLimitGateStatus: string;
  providerResponseGateStatus: string;
  cloudflareQueueProducersEnabled: false;
  recipientPayloadsCreated: false;
  personalizedBodiesCreated: false;
  providerSendEnabled: false;
  providerResponsesIncluded: false;
  providerMessageIdsIncluded: false;
  rawPayloadBodiesStored: false;
  updatedAt: string | null;
};

export type AudienceBroadcastSendPayloadReadinessSummary = {
  id: string;
  status: typeof audienceBroadcastSendPayloadReadinessStatus;
  issue: typeof audienceBroadcastSendPayloadReadinessIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    sendPayloadReadinessRecords: number;
    unsubscribeFooterPolicyRecords: number;
    consentRecheckPolicyRecords: number;
    suppressionRecheckPolicyRecords: number;
    cloudflareQueueProducerEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
    personalizedBodiesCreatedRecords: number;
    providerSendEnabledRecords: number;
    providerResponsesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
    rawPayloadBodiesStoredRecords: number;
  };
  records: AudienceBroadcastSendPayloadReadiness[];
  redaction: {
    rawRecipientEmailsIncluded: false;
    privateContactDataIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodiesIncluded: false;
    rawPayloadBodiesIncluded: false;
    providerSecretsIncluded: false;
    providerResponsesIncluded: false;
    providerMessageIdsIncluded: false;
    cloudflareQueueProducersEnabled: false;
    providerSendEnabled: false;
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

export type AudienceBroadcastDeliveryQueueMessage = {
  id: string;
  draftId: string;
  deliveryBatchId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  queueMode: string;
  expectedDraftUpdatedAt: string;
  expectedReadyRecipientCount: number;
  dryRunMessageCount: number;
  heldRecipientCount: number;
  activeSuppressionCount: number;
  retryPolicy: string;
  dispatchPolicy: string;
  unsubscribeFooterCheckStatus: string;
  senderDomainGateStatus: string;
  duplicate: boolean;
  providerSendEnabled: false;
  recipientPayloadsCreated: false;
  cloudflareQueueMessagesCreated: false;
  providerMessageIdsIncluded: false;
  createdAt: string | null;
};

export type AudienceBroadcastDeliveryQueueMessageSummary = {
  id: string;
  status: typeof audienceBroadcastDeliveryQueueMessageStatus;
  issue: typeof audienceBroadcastDeliveryQueueMessageIssue;
  parentIssue: 17;
  apiRoute: typeof audienceBroadcastDeliveryQueueMessageApiRoute;
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceBroadcastDeliveryQueueMessageConfirmationText;
  };
  counts: {
    dryRunRecords: number;
    dryRunMessagesSnapshotted: number;
    heldRecipientsSnapshotted: number;
    providerSendEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
    cloudflareQueueMessagesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
  };
  latestMessages: AudienceBroadcastDeliveryQueueMessage[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodyIncluded: false;
    providerMessageIdsIncluded: false;
    cloudflareQueueMessagesCreated: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastDispatchPreflight = {
  id: string;
  draftId: string;
  deliveryQueueMessageId: string;
  deliveryBatchId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  queueMode: string;
  expectedDraftUpdatedAt: string;
  expectedReadyRecipientCount: number;
  dryRunMessageCount: number;
  heldRecipientCount: number;
  activeSuppressionCount: number;
  providerLimitPolicy: string;
  providerRateLimitWindow: string;
  dispatchMode: string;
  suppressionCheckStatus: string;
  unsubscribeFooterCheckStatus: string;
  senderDomainGateStatus: string;
  auditCorrelationPolicy: string;
  duplicate: boolean;
  providerSendEnabled: false;
  recipientPayloadsCreated: false;
  cloudflareQueueMessagesCreated: false;
  providerMessageIdsIncluded: false;
  createdAt: string | null;
};

export type AudienceBroadcastDispatchPreflightSummary = {
  id: string;
  status: typeof audienceBroadcastDispatchPreflightStatus;
  issue: typeof audienceBroadcastDispatchPreflightIssue;
  parentIssue: 17;
  apiRoute: typeof audienceBroadcastDispatchPreflightApiRoute;
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceBroadcastDispatchPreflightConfirmationText;
  };
  counts: {
    dryRunPreflights: number;
    dryRunMessagesSnapshotted: number;
    heldRecipientsSnapshotted: number;
    providerSendEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
    cloudflareQueueMessagesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
  };
  latestPreflights: AudienceBroadcastDispatchPreflight[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodyIncluded: false;
    providerMessageIdsIncluded: false;
    cloudflareQueueMessagesCreated: false;
    providerSendEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceBroadcastDispatchAttempt = {
  id: string;
  draftId: string;
  dispatchPreflightId: string;
  deliveryQueueMessageId: string;
  deliveryBatchId: string;
  scheduleIntentId: string;
  status: string;
  queueName: string;
  queueMode: string;
  queueProducerMode: string;
  expectedDraftUpdatedAt: string;
  expectedReadyRecipientCount: number;
  dryRunMessageCount: number;
  heldRecipientCount: number;
  activeSuppressionCount: number;
  providerLimitPolicy: string;
  providerRateLimitWindow: string;
  dispatchMode: string;
  dispatchResultStatus: string;
  suppressionCheckStatus: string;
  unsubscribeFooterCheckStatus: string;
  senderDomainGateStatus: string;
  auditCorrelationPolicy: string;
  duplicate: boolean;
  providerSendEnabled: false;
  recipientPayloadsCreated: false;
  cloudflareQueueMessagesCreated: false;
  providerMessageIdsIncluded: false;
  providerResponsesIncluded: false;
  createdAt: string | null;
};

export type AudienceBroadcastDispatchAttemptSummary = {
  id: string;
  status: typeof audienceBroadcastDispatchAttemptStatus;
  issue: typeof audienceBroadcastDispatchAttemptIssue;
  parentIssue: 17;
  apiRoute: typeof audienceBroadcastDispatchAttemptApiRoute;
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof audienceBroadcastDispatchAttemptConfirmationText;
  };
  counts: {
    dryRunAttempts: number;
    dryRunMessagesSnapshotted: number;
    heldRecipientsSnapshotted: number;
    providerSendEnabledRecords: number;
    recipientPayloadsCreatedRecords: number;
    cloudflareQueueMessagesCreatedRecords: number;
    providerMessageIdsCreatedRecords: number;
    providerResponsesCreatedRecords: number;
  };
  latestAttempts: AudienceBroadcastDispatchAttempt[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    recipientPayloadsIncluded: false;
    personalizedBodyIncluded: false;
    providerMessageIdsIncluded: false;
    providerResponsesIncluded: false;
    cloudflareQueueMessagesCreated: false;
    providerSendEnabled: false;
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

type CreateDeliveryQueueMessagesInput = {
  deliveryBatchId?: unknown;
  draftId?: unknown;
  expectedDraftUpdatedAt?: unknown;
  expectedReadyRecipientCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateDispatchPreflightInput = {
  deliveryQueueMessageId?: unknown;
  draftId?: unknown;
  expectedDraftUpdatedAt?: unknown;
  expectedReadyRecipientCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateDispatchAttemptInput = {
  dispatchPreflightId?: unknown;
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

type CreateDeliveryQueueMessagesResult =
  | {
      ok: true;
      status: "broadcast_delivery_queue_messages_recorded" | "broadcast_delivery_queue_messages_replayed";
      duplicate: boolean;
      messages: AudienceBroadcastDeliveryQueueMessage;
      redaction: AudienceBroadcastDeliveryQueueMessageSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "delivery_batch_not_found"
        | "broadcast_draft_not_found"
        | "readiness_unavailable"
        | "queue_readiness_unavailable"
        | "stale_draft_revision"
        | "stale_readiness_count"
        | "queue_gate_not_ready"
        | "queue_messages_not_created";
      message: string;
      redaction: AudienceBroadcastDeliveryQueueMessageSummary["redaction"];
      currentDraftUpdatedAt?: string | null;
      currentReadyRecipientCount?: number;
    };

type CreateDispatchPreflightResult =
  | {
      ok: true;
      status: "broadcast_dispatch_preflight_recorded" | "broadcast_dispatch_preflight_replayed";
      duplicate: boolean;
      preflight: AudienceBroadcastDispatchPreflight;
      redaction: AudienceBroadcastDispatchPreflightSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "delivery_queue_message_not_found"
        | "broadcast_draft_not_found"
        | "readiness_unavailable"
        | "queue_readiness_unavailable"
        | "stale_draft_revision"
        | "stale_readiness_count"
        | "queue_gate_not_ready"
        | "dispatch_preflight_not_created";
      message: string;
      redaction: AudienceBroadcastDispatchPreflightSummary["redaction"];
      currentDraftUpdatedAt?: string | null;
      currentReadyRecipientCount?: number;
    };

type CreateDispatchAttemptResult =
  | {
      ok: true;
      status: "broadcast_dispatch_attempt_recorded" | "broadcast_dispatch_attempt_replayed";
      duplicate: boolean;
      attempt: AudienceBroadcastDispatchAttempt;
      redaction: AudienceBroadcastDispatchAttemptSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "dispatch_preflight_not_found"
        | "broadcast_draft_not_found"
        | "readiness_unavailable"
        | "queue_readiness_unavailable"
        | "stale_draft_revision"
        | "stale_readiness_count"
        | "queue_gate_not_ready"
        | "dispatch_attempt_not_created";
      message: string;
      redaction: AudienceBroadcastDispatchAttemptSummary["redaction"];
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

function emptySenderDomainReadinessSummary(
  source: AudienceBroadcastSenderDomainReadinessSummary["source"],
  loadError: string | null,
): AudienceBroadcastSenderDomainReadinessSummary {
  return {
    id: "audience-broadcast-sender-domain-readiness-contract",
    status: audienceBroadcastSenderDomainReadinessStatus,
    issue: audienceBroadcastSenderDomainReadinessIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      senderDomainReadinessRecords: 0,
      domainsPendingVerification: 0,
      domainsReady: 0,
      providerSendEnabledRecords: 0,
      cloudflareQueueProducerEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      providerResponsesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
    },
    records: [],
    redaction: {
      privateDnsCredentialsIncluded: false,
      rawDnsRecordsIncluded: false,
      providerSecretsIncluded: false,
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      recipientPayloadsIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      providerSendEnabled: false,
      cloudflareQueueProducersEnabled: false,
    },
    privateFieldsExcluded: [
      "privateDnsCredential",
      "rawDnsRecordValue",
      "providerSecret",
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "recipientPayload",
      "providerResponse",
      "providerMessageId",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #199 exposes sender-domain readiness metadata for audience broadcasts before any live delivery path exists. It does not verify DNS automatically, expose private DNS credentials, enable Cloudflare Queue producers, create recipient payloads, send through a provider, create provider responses, create provider message IDs, expose private recipients, or authorize public agent broadcast writes.",
  };
}

function emptyProviderEventReadinessSummary(
  source: AudienceBroadcastProviderEventReadinessSummary["source"],
  loadError: string | null,
): AudienceBroadcastProviderEventReadinessSummary {
  return {
    id: "audience-broadcast-provider-event-readiness-contract",
    status: audienceBroadcastProviderEventReadinessStatus,
    issue: audienceBroadcastProviderEventReadinessIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      providerEventReadinessRecords: 0,
      bounceEventReadinessRecords: 0,
      complaintEventReadinessRecords: 0,
      deliveryEventReadinessRecords: 0,
      providerSendEnabledRecords: 0,
      cloudflareQueueProducerEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      providerResponsesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
      rawProviderPayloadsStoredRecords: 0,
    },
    records: [],
    redaction: {
      providerSecretsIncluded: false,
      rawProviderPayloadsIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      recipientPayloadsIncluded: false,
      providerSendEnabled: false,
      cloudflareQueueProducersEnabled: false,
    },
    privateFieldsExcluded: [
      "providerSecret",
      "rawProviderPayload",
      "providerResponse",
      "providerMessageId",
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "recipientPayload",
      "suppressionHash",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #201 exposes provider-event readiness metadata for audience broadcasts before any live provider webhook or send path exists. It does not store raw provider payloads, expose provider secrets, enable Cloudflare Queue producers, create recipient payloads, send through a provider, create provider responses, create provider message IDs, expose private recipients, or authorize public agent broadcast writes.",
  };
}

function emptyProviderRateLimitReadinessSummary(
  source: AudienceBroadcastProviderRateLimitReadinessSummary["source"],
  loadError: string | null,
): AudienceBroadcastProviderRateLimitReadinessSummary {
  return {
    id: "audience-broadcast-provider-rate-limit-readiness-contract",
    status: audienceBroadcastProviderRateLimitReadinessStatus,
    issue: audienceBroadcastProviderRateLimitReadinessIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      providerRateLimitReadinessRecords: 0,
      throttleWindowRecords: 0,
      retryBackoffPolicyRecords: 0,
      providerSendEnabledRecords: 0,
      cloudflareQueueProducerEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      providerResponsesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
      rawProviderPayloadsStoredRecords: 0,
    },
    records: [],
    redaction: {
      providerSecretsIncluded: false,
      providerLimitSecretsIncluded: false,
      rawProviderPayloadsIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      recipientPayloadsIncluded: false,
      providerSendEnabled: false,
      cloudflareQueueProducersEnabled: false,
    },
    privateFieldsExcluded: [
      "providerSecret",
      "providerLimitSecret",
      "rawProviderPayload",
      "providerResponse",
      "providerMessageId",
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "recipientPayload",
      "suppressionHash",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #203 exposes provider rate-limit readiness metadata for audience broadcasts before any live provider send path exists. It does not expose provider secrets or limit secrets, store raw provider payloads, enable Cloudflare Queue producers, create recipient payloads, send through a provider, create provider responses, create provider message IDs, expose private recipients, or authorize public agent broadcast writes.",
  };
}

function emptyProviderResponseReadinessSummary(
  source: AudienceBroadcastProviderResponseReadinessSummary["source"],
  loadError: string | null,
): AudienceBroadcastProviderResponseReadinessSummary {
  return {
    id: "audience-broadcast-provider-response-readiness-contract",
    status: audienceBroadcastProviderResponseReadinessStatus,
    issue: audienceBroadcastProviderResponseReadinessIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      providerResponseReadinessRecords: 0,
      successResponsePolicyRecords: 0,
      transientFailurePolicyRecords: 0,
      permanentFailurePolicyRecords: 0,
      retryDecisionPolicyRecords: 0,
      providerSendEnabledRecords: 0,
      cloudflareQueueProducerEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      providerResponsesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
      rawProviderResponseBodiesStoredRecords: 0,
    },
    records: [],
    redaction: {
      providerSecretsIncluded: false,
      rawProviderResponseBodiesIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      recipientPayloadsIncluded: false,
      providerSendEnabled: false,
      cloudflareQueueProducersEnabled: false,
    },
    privateFieldsExcluded: [
      "providerSecret",
      "providerAccessToken",
      "rawProviderResponseBody",
      "providerResponse",
      "providerMessageId",
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "recipientPayload",
      "requestPayload",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #205 exposes provider response readiness metadata for audience broadcasts before any live provider send path exists. It does not expose provider secrets, store raw provider response bodies, enable Cloudflare Queue producers, create recipient payloads, send through a provider, create provider responses, create provider message IDs, expose private recipients, or authorize public agent broadcast writes.",
  };
}

function emptySendPayloadReadinessSummary(
  source: AudienceBroadcastSendPayloadReadinessSummary["source"],
  loadError: string | null,
): AudienceBroadcastSendPayloadReadinessSummary {
  return {
    id: "audience-broadcast-send-payload-readiness-contract",
    status: audienceBroadcastSendPayloadReadinessStatus,
    issue: audienceBroadcastSendPayloadReadinessIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      sendPayloadReadinessRecords: 0,
      unsubscribeFooterPolicyRecords: 0,
      consentRecheckPolicyRecords: 0,
      suppressionRecheckPolicyRecords: 0,
      cloudflareQueueProducerEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      personalizedBodiesCreatedRecords: 0,
      providerSendEnabledRecords: 0,
      providerResponsesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
      rawPayloadBodiesStoredRecords: 0,
    },
    records: [],
    redaction: {
      rawRecipientEmailsIncluded: false,
      privateContactDataIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodiesIncluded: false,
      rawPayloadBodiesIncluded: false,
      providerSecretsIncluded: false,
      providerResponsesIncluded: false,
      providerMessageIdsIncluded: false,
      cloudflareQueueProducersEnabled: false,
      providerSendEnabled: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "recipientPayload",
      "personalizedBody",
      "rawPayloadBody",
      "unsubscribeToken",
      "providerSecret",
      "providerResponse",
      "providerMessageId",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #207 exposes send-payload readiness metadata for audience broadcasts before any live Queue producer or recipient payload path exists. It does not expose raw recipient identity, create recipient payloads, create personalized bodies, store raw payload bodies, enable Cloudflare Queue producers, send through a provider, create provider responses, create provider message IDs, expose private recipients, or authorize public agent broadcast writes.",
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

function emptyDeliveryQueueMessageSummary(
  source: AudienceBroadcastDeliveryQueueMessageSummary["source"],
  loadError: string | null,
): AudienceBroadcastDeliveryQueueMessageSummary {
  return {
    id: "audience-broadcast-delivery-queue-message-contract",
    status: audienceBroadcastDeliveryQueueMessageStatus,
    issue: audienceBroadcastDeliveryQueueMessageIssue,
    parentIssue: 17,
    apiRoute: audienceBroadcastDeliveryQueueMessageApiRoute,
    ownerRoute: "/admin/audience",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceBroadcastDeliveryQueueMessageConfirmationText,
    },
    counts: {
      dryRunRecords: 0,
      dryRunMessagesSnapshotted: 0,
      heldRecipientsSnapshotted: 0,
      providerSendEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      cloudflareQueueMessagesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
    },
    latestMessages: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodyIncluded: false,
      providerMessageIdsIncluded: false,
      cloudflareQueueMessagesCreated: false,
      providerSendEnabled: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "suppressionHash",
      "actorEmail",
      "recipientPayload",
      "providerMessageId",
      "personalizedBody",
      "cloudflareQueueMessageBody",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #189 lets verified owners record aggregate delivery queue message dry-run evidence from a current delivery batch after exact confirmation, idempotency, draft revision, readiness count, and dry-run queue gates. It does not create Cloudflare Queue messages, recipient payloads, provider sends, provider message IDs, private exports, or public agent broadcast writes.",
  };
}

function emptyDispatchPreflightSummary(
  source: AudienceBroadcastDispatchPreflightSummary["source"],
  loadError: string | null,
): AudienceBroadcastDispatchPreflightSummary {
  return {
    id: "audience-broadcast-dispatch-preflight-contract",
    status: audienceBroadcastDispatchPreflightStatus,
    issue: audienceBroadcastDispatchPreflightIssue,
    parentIssue: 17,
    apiRoute: audienceBroadcastDispatchPreflightApiRoute,
    ownerRoute: "/admin/audience",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceBroadcastDispatchPreflightConfirmationText,
    },
    counts: {
      dryRunPreflights: 0,
      dryRunMessagesSnapshotted: 0,
      heldRecipientsSnapshotted: 0,
      providerSendEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      cloudflareQueueMessagesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
    },
    latestPreflights: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodyIncluded: false,
      providerMessageIdsIncluded: false,
      cloudflareQueueMessagesCreated: false,
      providerSendEnabled: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "suppressionHash",
      "actorEmail",
      "recipientPayload",
      "providerMessageId",
      "personalizedBody",
      "cloudflareQueueMessageBody",
      "providerResponse",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #191 lets verified owners record aggregate dispatch preflight dry-run evidence from a current queue-message record after exact confirmation, idempotency, draft revision, readiness count, provider-limit policy, sender-domain gate, unsubscribe footer, suppression, audit correlation, and dry-run queue checks. It does not dispatch Cloudflare Queue messages, create recipient payloads, send through a provider, create provider message IDs, expose private recipients, or authorize public agent broadcast writes.",
  };
}

function emptyDispatchAttemptSummary(
  source: AudienceBroadcastDispatchAttemptSummary["source"],
  loadError: string | null,
): AudienceBroadcastDispatchAttemptSummary {
  return {
    id: "audience-broadcast-dispatch-attempt-contract",
    status: audienceBroadcastDispatchAttemptStatus,
    issue: audienceBroadcastDispatchAttemptIssue,
    parentIssue: 17,
    apiRoute: audienceBroadcastDispatchAttemptApiRoute,
    ownerRoute: "/admin/audience",
    source,
    loadError,
    confirmation: {
      required: true,
      text: audienceBroadcastDispatchAttemptConfirmationText,
    },
    counts: {
      dryRunAttempts: 0,
      dryRunMessagesSnapshotted: 0,
      heldRecipientsSnapshotted: 0,
      providerSendEnabledRecords: 0,
      recipientPayloadsCreatedRecords: 0,
      cloudflareQueueMessagesCreatedRecords: 0,
      providerMessageIdsCreatedRecords: 0,
      providerResponsesCreatedRecords: 0,
    },
    latestAttempts: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      recipientPayloadsIncluded: false,
      personalizedBodyIncluded: false,
      providerMessageIdsIncluded: false,
      providerResponsesIncluded: false,
      cloudflareQueueMessagesCreated: false,
      providerSendEnabled: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "suppressionHash",
      "actorEmail",
      "recipientPayload",
      "providerMessageId",
      "personalizedBody",
      "cloudflareQueueMessageBody",
      "providerResponse",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #197 lets verified owners record aggregate dispatch attempt receipts from a current dispatch preflight after exact confirmation, idempotency, draft revision, readiness count, queue producer mode, provider-limit policy, sender-domain gate, unsubscribe footer, suppression, audit correlation, and dry-run checks. It does not dispatch Cloudflare Queue messages, create queue payload bodies, create recipient payloads, send through a provider, create provider responses, create provider message IDs, expose private recipients, or authorize public agent broadcast writes.",
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

function publicSenderDomainReadiness(row: SenderDomainReadinessRow): AudienceBroadcastSenderDomainReadiness {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    domain: row.domain,
    intendedFromAddress: row.intended_from_address,
    fromAddressPolicy: row.from_address_policy,
    replyPathPolicy: row.reply_path_policy,
    bounceHandlingPolicy: row.bounce_handling_policy,
    spfAlignmentStatus: row.spf_alignment_status,
    dkimAlignmentStatus: row.dkim_alignment_status,
    dmarcAlignmentStatus: row.dmarc_alignment_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    verificationEvidenceStatus: row.verification_evidence_status,
    providerSendEnabled: false,
    cloudflareQueueProducersEnabled: false,
    recipientPayloadsCreated: false,
    providerResponsesIncluded: false,
    providerMessageIdsIncluded: false,
    updatedAt: timestampValue(row.updated_at),
  };
}

function publicProviderEventReadiness(row: ProviderEventReadinessRow): AudienceBroadcastProviderEventReadiness {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    providerName: row.provider_name,
    eventKinds: parseJsonStringArray(row.event_kinds_json),
    providerEventBoundary: row.provider_event_boundary,
    bounceHandlingPolicy: row.bounce_handling_policy,
    complaintHandlingPolicy: row.complaint_handling_policy,
    deliveryEventPolicy: row.delivery_event_policy,
    suppressionUpdatePolicy: row.suppression_update_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    rawProviderPayloadStorage: row.raw_provider_payload_storage,
    providerSecretStatus: row.provider_secret_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    providerSendEnabled: false,
    cloudflareQueueProducersEnabled: false,
    recipientPayloadsCreated: false,
    providerResponsesIncluded: false,
    providerMessageIdsIncluded: false,
    rawProviderPayloadsStored: false,
    updatedAt: timestampValue(row.updated_at),
  };
}

function publicProviderRateLimitReadiness(
  row: ProviderRateLimitReadinessRow,
): AudienceBroadcastProviderRateLimitReadiness {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    providerName: row.provider_name,
    throttleWindow: row.throttle_window,
    dailyLimitPolicy: row.daily_limit_policy,
    burstLimitPolicy: row.burst_limit_policy,
    retryBackoffPolicy: row.retry_backoff_policy,
    providerLimitPolicy: row.provider_limit_policy,
    rateLimitSource: row.rate_limit_source,
    queueBackpressurePolicy: row.queue_backpressure_policy,
    auditCorrelationPolicy: row.audit_correlation_policy,
    senderDomainGateStatus: row.sender_domain_gate_status,
    providerEventGateStatus: row.provider_event_gate_status,
    providerSendEnabled: false,
    cloudflareQueueProducersEnabled: false,
    recipientPayloadsCreated: false,
    providerResponsesIncluded: false,
    providerMessageIdsIncluded: false,
    rawProviderPayloadsStored: false,
    updatedAt: timestampValue(row.updated_at),
  };
}

function publicProviderResponseReadiness(
  row: ProviderResponseReadinessRow,
): AudienceBroadcastProviderResponseReadiness {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    providerName: row.provider_name,
    responseStatusClasses: parseJsonStringArray(row.response_status_classes_json),
    providerResponseBoundary: row.provider_response_boundary,
    successResponsePolicy: row.success_response_policy,
    transientFailurePolicy: row.transient_failure_policy,
    permanentFailurePolicy: row.permanent_failure_policy,
    retryDecisionPolicy: row.retry_decision_policy,
    messageIdStoragePolicy: row.message_id_storage_policy,
    responseBodyStorage: row.response_body_storage,
    auditCorrelationPolicy: row.audit_correlation_policy,
    senderDomainGateStatus: row.sender_domain_gate_status,
    providerEventGateStatus: row.provider_event_gate_status,
    providerRateLimitGateStatus: row.provider_rate_limit_gate_status,
    providerSendEnabled: false,
    cloudflareQueueProducersEnabled: false,
    recipientPayloadsCreated: false,
    providerResponsesIncluded: false,
    providerMessageIdsIncluded: false,
    rawProviderResponseBodiesStored: false,
    updatedAt: timestampValue(row.updated_at),
  };
}

function publicSendPayloadReadiness(row: SendPayloadReadinessRow): AudienceBroadcastSendPayloadReadiness {
  return {
    id: row.id,
    draftId: row.draft_id,
    status: row.status,
    payloadScope: parseJsonStringArray(row.payload_scope_json),
    personalizationBoundary: row.personalization_boundary,
    recipientIdentityPolicy: row.recipient_identity_policy,
    unsubscribeFooterPolicy: row.unsubscribe_footer_policy,
    consentRecheckPolicy: row.consent_recheck_policy,
    suppressionRecheckPolicy: row.suppression_recheck_policy,
    personalizationTokenPolicy: row.personalization_token_policy,
    payloadBodyStorage: row.payload_body_storage,
    auditCorrelationPolicy: row.audit_correlation_policy,
    senderDomainGateStatus: row.sender_domain_gate_status,
    providerEventGateStatus: row.provider_event_gate_status,
    providerRateLimitGateStatus: row.provider_rate_limit_gate_status,
    providerResponseGateStatus: row.provider_response_gate_status,
    cloudflareQueueProducersEnabled: false,
    recipientPayloadsCreated: false,
    personalizedBodiesCreated: false,
    providerSendEnabled: false,
    providerResponsesIncluded: false,
    providerMessageIdsIncluded: false,
    rawPayloadBodiesStored: false,
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

function publicDeliveryQueueMessage(
  row: DeliveryQueueMessageRow,
  duplicate: boolean,
): AudienceBroadcastDeliveryQueueMessage {
  return {
    id: row.id,
    draftId: row.draft_id,
    deliveryBatchId: row.delivery_batch_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    queueMode: row.queue_mode,
    expectedDraftUpdatedAt: row.expected_draft_updated_at,
    expectedReadyRecipientCount: numberValue(row.expected_ready_recipient_count),
    dryRunMessageCount: numberValue(row.dry_run_message_count),
    heldRecipientCount: numberValue(row.held_recipient_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    retryPolicy: row.retry_policy,
    dispatchPolicy: row.dispatch_policy,
    unsubscribeFooterCheckStatus: row.unsubscribe_footer_check_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    duplicate,
    providerSendEnabled: false,
    recipientPayloadsCreated: false,
    cloudflareQueueMessagesCreated: false,
    providerMessageIdsIncluded: false,
    createdAt: timestampValue(row.created_at),
  };
}

function publicDispatchPreflight(row: DispatchPreflightRow, duplicate: boolean): AudienceBroadcastDispatchPreflight {
  return {
    id: row.id,
    draftId: row.draft_id,
    deliveryQueueMessageId: row.delivery_queue_message_id,
    deliveryBatchId: row.delivery_batch_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    queueMode: row.queue_mode,
    expectedDraftUpdatedAt: row.expected_draft_updated_at,
    expectedReadyRecipientCount: numberValue(row.expected_ready_recipient_count),
    dryRunMessageCount: numberValue(row.dry_run_message_count),
    heldRecipientCount: numberValue(row.held_recipient_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    providerLimitPolicy: row.provider_limit_policy,
    providerRateLimitWindow: row.provider_rate_limit_window,
    dispatchMode: row.dispatch_mode,
    suppressionCheckStatus: row.suppression_check_status,
    unsubscribeFooterCheckStatus: row.unsubscribe_footer_check_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    auditCorrelationPolicy: row.audit_correlation_policy,
    duplicate,
    providerSendEnabled: false,
    recipientPayloadsCreated: false,
    cloudflareQueueMessagesCreated: false,
    providerMessageIdsIncluded: false,
    createdAt: timestampValue(row.created_at),
  };
}

function publicDispatchAttempt(row: DispatchAttemptRow, duplicate: boolean): AudienceBroadcastDispatchAttempt {
  return {
    id: row.id,
    draftId: row.draft_id,
    dispatchPreflightId: row.dispatch_preflight_id,
    deliveryQueueMessageId: row.delivery_queue_message_id,
    deliveryBatchId: row.delivery_batch_id,
    scheduleIntentId: row.schedule_intent_id,
    status: row.status,
    queueName: row.queue_name,
    queueMode: row.queue_mode,
    queueProducerMode: row.queue_producer_mode,
    expectedDraftUpdatedAt: row.expected_draft_updated_at,
    expectedReadyRecipientCount: numberValue(row.expected_ready_recipient_count),
    dryRunMessageCount: numberValue(row.dry_run_message_count),
    heldRecipientCount: numberValue(row.held_recipient_count),
    activeSuppressionCount: numberValue(row.active_suppression_count),
    providerLimitPolicy: row.provider_limit_policy,
    providerRateLimitWindow: row.provider_rate_limit_window,
    dispatchMode: row.dispatch_mode,
    dispatchResultStatus: row.dispatch_result_status,
    suppressionCheckStatus: row.suppression_check_status,
    unsubscribeFooterCheckStatus: row.unsubscribe_footer_check_status,
    senderDomainGateStatus: row.sender_domain_gate_status,
    auditCorrelationPolicy: row.audit_correlation_policy,
    duplicate,
    providerSendEnabled: false,
    recipientPayloadsCreated: false,
    cloudflareQueueMessagesCreated: false,
    providerMessageIdsIncluded: false,
    providerResponsesIncluded: false,
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

async function findDeliveryBatchById(db: D1Database, deliveryBatchId: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, schedule_intent_id, status, queue_name, queue_mode, expected_draft_updated_at,
        ready_recipient_count, held_recipient_count, active_suppression_count,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        recipient_payloads_created, provider_message_ids_created, idempotency_key, created_at
      FROM audience_broadcast_delivery_batches
      WHERE id = ?`,
    )
    .bind(deliveryBatchId)
    .first<DeliveryBatchRow>();
}

async function findDeliveryQueueMessageByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, delivery_batch_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_draft_updated_at, expected_ready_recipient_count, dry_run_message_count,
        held_recipient_count, active_suppression_count, retry_policy, dispatch_policy,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        recipient_payloads_created, cloudflare_queue_messages_created, provider_message_ids_created,
        idempotency_key, created_at
      FROM audience_broadcast_delivery_queue_messages
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<DeliveryQueueMessageRow>();
}

async function findDeliveryQueueMessageById(db: D1Database, deliveryQueueMessageId: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, delivery_batch_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_draft_updated_at, expected_ready_recipient_count, dry_run_message_count,
        held_recipient_count, active_suppression_count, retry_policy, dispatch_policy,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        recipient_payloads_created, cloudflare_queue_messages_created, provider_message_ids_created,
        idempotency_key, created_at
      FROM audience_broadcast_delivery_queue_messages
      WHERE id = ?`,
    )
    .bind(deliveryQueueMessageId)
    .first<DeliveryQueueMessageRow>();
}

async function findDispatchPreflightByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status,
        queue_name, queue_mode, expected_draft_updated_at, expected_ready_recipient_count,
        dry_run_message_count, held_recipient_count, active_suppression_count, provider_limit_policy,
        provider_rate_limit_window, dispatch_mode, suppression_check_status, unsubscribe_footer_check_status,
        sender_domain_gate_status, audit_correlation_policy, provider_send_enabled, recipient_payloads_created,
        cloudflare_queue_messages_created, provider_message_ids_created, idempotency_key, created_at
      FROM audience_broadcast_dispatch_preflights
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<DispatchPreflightRow>();
}

async function findDispatchPreflightById(db: D1Database, dispatchPreflightId: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status,
        queue_name, queue_mode, expected_draft_updated_at, expected_ready_recipient_count,
        dry_run_message_count, held_recipient_count, active_suppression_count, provider_limit_policy,
        provider_rate_limit_window, dispatch_mode, suppression_check_status, unsubscribe_footer_check_status,
        sender_domain_gate_status, audit_correlation_policy, provider_send_enabled, recipient_payloads_created,
        cloudflare_queue_messages_created, provider_message_ids_created, idempotency_key, created_at
      FROM audience_broadcast_dispatch_preflights
      WHERE id = ?`,
    )
    .bind(dispatchPreflightId)
    .first<DispatchPreflightRow>();
}

async function findDispatchAttemptByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, draft_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id,
        status, queue_name, queue_mode, queue_producer_mode, expected_draft_updated_at,
        expected_ready_recipient_count, dry_run_message_count, held_recipient_count, active_suppression_count,
        provider_limit_policy, provider_rate_limit_window, dispatch_mode, dispatch_result_status,
        suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
        audit_correlation_policy, provider_send_enabled, recipient_payloads_created,
        cloudflare_queue_messages_created, provider_message_ids_created, provider_responses_created,
        idempotency_key, created_at
      FROM audience_broadcast_dispatch_attempts
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<DispatchAttemptRow>();
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

export async function getAudienceBroadcastSenderDomainReadinessSummary(): Promise<AudienceBroadcastSenderDomainReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, draft_id, status, domain, intended_from_address, from_address_policy,
          reply_path_policy, bounce_handling_policy, spf_alignment_status, dkim_alignment_status,
          dmarc_alignment_status, sender_domain_gate_status, verification_evidence_status,
          provider_send_enabled, cloudflare_queue_producers_enabled, recipient_payloads_created,
          provider_responses_created, provider_message_ids_created, updated_at
        FROM audience_broadcast_sender_domain_readiness
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<SenderDomainReadinessRow>();
    const rawRows = rows.results ?? [];
    const records = rawRows.map(publicSenderDomainReadiness);

    return {
      ...emptySenderDomainReadinessSummary("d1", null),
      counts: {
        senderDomainReadinessRecords: records.length,
        domainsPendingVerification: records.filter((record) => record.status !== "sender_domain_ready").length,
        domainsReady: records.filter((record) => record.status === "sender_domain_ready").length,
        providerSendEnabledRecords: rawRows.filter((row) => numberValue(row.provider_send_enabled) > 0).length,
        cloudflareQueueProducerEnabledRecords: rawRows.filter(
          (row) => numberValue(row.cloudflare_queue_producers_enabled) > 0,
        ).length,
        recipientPayloadsCreatedRecords: rawRows.filter((row) => numberValue(row.recipient_payloads_created) > 0).length,
        providerResponsesCreatedRecords: rawRows.filter((row) => numberValue(row.provider_responses_created) > 0).length,
        providerMessageIdsCreatedRecords: rawRows.filter((row) => numberValue(row.provider_message_ids_created) > 0).length,
      },
      records,
    };
  } catch (error) {
    return emptySenderDomainReadinessSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast sender-domain readiness.",
    );
  }
}

export async function getAudienceBroadcastProviderEventReadinessSummary(): Promise<AudienceBroadcastProviderEventReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, draft_id, status, provider_name, event_kinds_json, provider_event_boundary,
          bounce_handling_policy, complaint_handling_policy, delivery_event_policy,
          suppression_update_policy, audit_correlation_policy, raw_provider_payload_storage,
          provider_secret_status, sender_domain_gate_status, provider_send_enabled,
          cloudflare_queue_producers_enabled, recipient_payloads_created, provider_responses_created,
          provider_message_ids_created, raw_provider_payloads_stored, updated_at
        FROM audience_broadcast_provider_event_readiness
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<ProviderEventReadinessRow>();
    const rawRows = rows.results ?? [];
    const records = rawRows.map(publicProviderEventReadiness);

    return {
      ...emptyProviderEventReadinessSummary("d1", null),
      counts: {
        providerEventReadinessRecords: records.length,
        bounceEventReadinessRecords: records.filter((record) => record.eventKinds.includes("bounce")).length,
        complaintEventReadinessRecords: records.filter((record) => record.eventKinds.includes("complaint")).length,
        deliveryEventReadinessRecords: records.filter((record) => record.eventKinds.includes("delivered")).length,
        providerSendEnabledRecords: rawRows.filter((row) => numberValue(row.provider_send_enabled) > 0).length,
        cloudflareQueueProducerEnabledRecords: rawRows.filter(
          (row) => numberValue(row.cloudflare_queue_producers_enabled) > 0,
        ).length,
        recipientPayloadsCreatedRecords: rawRows.filter((row) => numberValue(row.recipient_payloads_created) > 0).length,
        providerResponsesCreatedRecords: rawRows.filter((row) => numberValue(row.provider_responses_created) > 0).length,
        providerMessageIdsCreatedRecords: rawRows.filter((row) => numberValue(row.provider_message_ids_created) > 0).length,
        rawProviderPayloadsStoredRecords: rawRows.filter((row) => numberValue(row.raw_provider_payloads_stored) > 0).length,
      },
      records,
    };
  } catch (error) {
    return emptyProviderEventReadinessSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast provider-event readiness.",
    );
  }
}

export async function getAudienceBroadcastProviderRateLimitReadinessSummary(): Promise<AudienceBroadcastProviderRateLimitReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, draft_id, status, provider_name, throttle_window, daily_limit_policy,
          burst_limit_policy, retry_backoff_policy, provider_limit_policy, rate_limit_source,
          queue_backpressure_policy, audit_correlation_policy, sender_domain_gate_status,
          provider_event_gate_status, provider_send_enabled, cloudflare_queue_producers_enabled,
          recipient_payloads_created, provider_responses_created, provider_message_ids_created,
          raw_provider_payloads_stored, updated_at
        FROM audience_broadcast_provider_rate_limit_readiness
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<ProviderRateLimitReadinessRow>();
    const rawRows = rows.results ?? [];
    const records = rawRows.map(publicProviderRateLimitReadiness);

    return {
      ...emptyProviderRateLimitReadinessSummary("d1", null),
      counts: {
        providerRateLimitReadinessRecords: records.length,
        throttleWindowRecords: records.filter((record) => record.throttleWindow.length > 0).length,
        retryBackoffPolicyRecords: records.filter((record) => record.retryBackoffPolicy.length > 0).length,
        providerSendEnabledRecords: rawRows.filter((row) => numberValue(row.provider_send_enabled) > 0).length,
        cloudflareQueueProducerEnabledRecords: rawRows.filter(
          (row) => numberValue(row.cloudflare_queue_producers_enabled) > 0,
        ).length,
        recipientPayloadsCreatedRecords: rawRows.filter((row) => numberValue(row.recipient_payloads_created) > 0).length,
        providerResponsesCreatedRecords: rawRows.filter((row) => numberValue(row.provider_responses_created) > 0).length,
        providerMessageIdsCreatedRecords: rawRows.filter((row) => numberValue(row.provider_message_ids_created) > 0).length,
        rawProviderPayloadsStoredRecords: rawRows.filter((row) => numberValue(row.raw_provider_payloads_stored) > 0).length,
      },
      records,
    };
  } catch (error) {
    return emptyProviderRateLimitReadinessSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast provider rate-limit readiness.",
    );
  }
}

export async function getAudienceBroadcastProviderResponseReadinessSummary(): Promise<AudienceBroadcastProviderResponseReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, draft_id, status, provider_name, response_status_classes_json,
          provider_response_boundary, success_response_policy, transient_failure_policy,
          permanent_failure_policy, retry_decision_policy, message_id_storage_policy,
          response_body_storage, audit_correlation_policy, sender_domain_gate_status,
          provider_event_gate_status, provider_rate_limit_gate_status, provider_send_enabled,
          cloudflare_queue_producers_enabled, recipient_payloads_created, provider_responses_created,
          provider_message_ids_created, raw_provider_response_bodies_stored, updated_at
        FROM audience_broadcast_provider_response_readiness
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<ProviderResponseReadinessRow>();
    const rawRows = rows.results ?? [];
    const records = rawRows.map(publicProviderResponseReadiness);

    return {
      ...emptyProviderResponseReadinessSummary("d1", null),
      counts: {
        providerResponseReadinessRecords: records.length,
        successResponsePolicyRecords: records.filter((record) => record.successResponsePolicy.length > 0).length,
        transientFailurePolicyRecords: records.filter((record) => record.transientFailurePolicy.length > 0).length,
        permanentFailurePolicyRecords: records.filter((record) => record.permanentFailurePolicy.length > 0).length,
        retryDecisionPolicyRecords: records.filter((record) => record.retryDecisionPolicy.length > 0).length,
        providerSendEnabledRecords: rawRows.filter((row) => numberValue(row.provider_send_enabled) > 0).length,
        cloudflareQueueProducerEnabledRecords: rawRows.filter(
          (row) => numberValue(row.cloudflare_queue_producers_enabled) > 0,
        ).length,
        recipientPayloadsCreatedRecords: rawRows.filter((row) => numberValue(row.recipient_payloads_created) > 0).length,
        providerResponsesCreatedRecords: rawRows.filter((row) => numberValue(row.provider_responses_created) > 0).length,
        providerMessageIdsCreatedRecords: rawRows.filter((row) => numberValue(row.provider_message_ids_created) > 0).length,
        rawProviderResponseBodiesStoredRecords: rawRows.filter(
          (row) => numberValue(row.raw_provider_response_bodies_stored) > 0,
        ).length,
      },
      records,
    };
  } catch (error) {
    return emptyProviderResponseReadinessSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast provider response readiness.",
    );
  }
}

export async function getAudienceBroadcastSendPayloadReadinessSummary(): Promise<AudienceBroadcastSendPayloadReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, draft_id, status, payload_scope_json, personalization_boundary,
          recipient_identity_policy, unsubscribe_footer_policy, consent_recheck_policy,
          suppression_recheck_policy, personalization_token_policy, payload_body_storage,
          audit_correlation_policy, sender_domain_gate_status, provider_event_gate_status,
          provider_rate_limit_gate_status, provider_response_gate_status, cloudflare_queue_producers_enabled,
          recipient_payloads_created, personalized_bodies_created, provider_send_enabled,
          provider_responses_created, provider_message_ids_created, raw_payload_bodies_stored, updated_at
        FROM audience_broadcast_send_payload_readiness
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<SendPayloadReadinessRow>();
    const rawRows = rows.results ?? [];
    const records = rawRows.map(publicSendPayloadReadiness);

    return {
      ...emptySendPayloadReadinessSummary("d1", null),
      counts: {
        sendPayloadReadinessRecords: records.length,
        unsubscribeFooterPolicyRecords: records.filter((record) => record.unsubscribeFooterPolicy.length > 0).length,
        consentRecheckPolicyRecords: records.filter((record) => record.consentRecheckPolicy.length > 0).length,
        suppressionRecheckPolicyRecords: records.filter((record) => record.suppressionRecheckPolicy.length > 0).length,
        cloudflareQueueProducerEnabledRecords: rawRows.filter(
          (row) => numberValue(row.cloudflare_queue_producers_enabled) > 0,
        ).length,
        recipientPayloadsCreatedRecords: rawRows.filter((row) => numberValue(row.recipient_payloads_created) > 0).length,
        personalizedBodiesCreatedRecords: rawRows.filter((row) => numberValue(row.personalized_bodies_created) > 0).length,
        providerSendEnabledRecords: rawRows.filter((row) => numberValue(row.provider_send_enabled) > 0).length,
        providerResponsesCreatedRecords: rawRows.filter((row) => numberValue(row.provider_responses_created) > 0).length,
        providerMessageIdsCreatedRecords: rawRows.filter((row) => numberValue(row.provider_message_ids_created) > 0).length,
        rawPayloadBodiesStoredRecords: rawRows.filter((row) => numberValue(row.raw_payload_bodies_stored) > 0).length,
      },
      records,
    };
  } catch (error) {
    return emptySendPayloadReadinessSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast send payload readiness.",
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

export async function getAudienceBroadcastDeliveryQueueMessageSummary(): Promise<AudienceBroadcastDeliveryQueueMessageSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS dry_run_record_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_recipient_count), 0) AS held_recipient_count,
          SUM(CASE WHEN provider_send_enabled > 0 THEN 1 ELSE 0 END) AS provider_send_enabled_count,
          SUM(CASE WHEN recipient_payloads_created > 0 THEN 1 ELSE 0 END) AS recipient_payloads_created_count,
          SUM(CASE WHEN cloudflare_queue_messages_created > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_messages_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count
        FROM audience_broadcast_delivery_queue_messages`,
      )
      .first<{
        dry_run_record_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_recipient_count: number | string | null;
        provider_send_enabled_count: number | string | null;
        recipient_payloads_created_count: number | string | null;
        cloudflare_queue_messages_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, draft_id, delivery_batch_id, schedule_intent_id, status, queue_name, queue_mode,
          expected_draft_updated_at, expected_ready_recipient_count, dry_run_message_count,
          held_recipient_count, active_suppression_count, retry_policy, dispatch_policy,
          unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
          recipient_payloads_created, cloudflare_queue_messages_created, provider_message_ids_created,
          idempotency_key, created_at
        FROM audience_broadcast_delivery_queue_messages
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<DeliveryQueueMessageRow>();

    return {
      ...emptyDeliveryQueueMessageSummary("d1", null),
      counts: {
        dryRunRecords: numberValue(counts?.dry_run_record_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldRecipientsSnapshotted: numberValue(counts?.held_recipient_count),
        providerSendEnabledRecords: numberValue(counts?.provider_send_enabled_count),
        recipientPayloadsCreatedRecords: numberValue(counts?.recipient_payloads_created_count),
        cloudflareQueueMessagesCreatedRecords: numberValue(counts?.cloudflare_queue_messages_created_count),
        providerMessageIdsCreatedRecords: numberValue(counts?.provider_message_ids_created_count),
      },
      latestMessages: (latest.results ?? []).map((row) => publicDeliveryQueueMessage(row, false)),
    };
  } catch (error) {
    return emptyDeliveryQueueMessageSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast delivery queue messages.",
    );
  }
}

export async function getAudienceBroadcastDispatchPreflightSummary(): Promise<AudienceBroadcastDispatchPreflightSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS dry_run_preflight_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_recipient_count), 0) AS held_recipient_count,
          SUM(CASE WHEN provider_send_enabled > 0 THEN 1 ELSE 0 END) AS provider_send_enabled_count,
          SUM(CASE WHEN recipient_payloads_created > 0 THEN 1 ELSE 0 END) AS recipient_payloads_created_count,
          SUM(CASE WHEN cloudflare_queue_messages_created > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_messages_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count
        FROM audience_broadcast_dispatch_preflights`,
      )
      .first<{
        dry_run_preflight_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_recipient_count: number | string | null;
        provider_send_enabled_count: number | string | null;
        recipient_payloads_created_count: number | string | null;
        cloudflare_queue_messages_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, draft_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status,
          queue_name, queue_mode, expected_draft_updated_at, expected_ready_recipient_count,
          dry_run_message_count, held_recipient_count, active_suppression_count, provider_limit_policy,
          provider_rate_limit_window, dispatch_mode, suppression_check_status, unsubscribe_footer_check_status,
          sender_domain_gate_status, audit_correlation_policy, provider_send_enabled, recipient_payloads_created,
          cloudflare_queue_messages_created, provider_message_ids_created, idempotency_key, created_at
        FROM audience_broadcast_dispatch_preflights
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<DispatchPreflightRow>();

    return {
      ...emptyDispatchPreflightSummary("d1", null),
      counts: {
        dryRunPreflights: numberValue(counts?.dry_run_preflight_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldRecipientsSnapshotted: numberValue(counts?.held_recipient_count),
        providerSendEnabledRecords: numberValue(counts?.provider_send_enabled_count),
        recipientPayloadsCreatedRecords: numberValue(counts?.recipient_payloads_created_count),
        cloudflareQueueMessagesCreatedRecords: numberValue(counts?.cloudflare_queue_messages_created_count),
        providerMessageIdsCreatedRecords: numberValue(counts?.provider_message_ids_created_count),
      },
      latestPreflights: (latest.results ?? []).map((row) => publicDispatchPreflight(row, false)),
    };
  } catch (error) {
    return emptyDispatchPreflightSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast dispatch preflights.",
    );
  }
}

export async function getAudienceBroadcastDispatchAttemptSummary(): Promise<AudienceBroadcastDispatchAttemptSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS dry_run_attempt_count,
          COALESCE(SUM(dry_run_message_count), 0) AS dry_run_message_count,
          COALESCE(SUM(held_recipient_count), 0) AS held_recipient_count,
          SUM(CASE WHEN provider_send_enabled > 0 THEN 1 ELSE 0 END) AS provider_send_enabled_count,
          SUM(CASE WHEN recipient_payloads_created > 0 THEN 1 ELSE 0 END) AS recipient_payloads_created_count,
          SUM(CASE WHEN cloudflare_queue_messages_created > 0 THEN 1 ELSE 0 END) AS cloudflare_queue_messages_created_count,
          SUM(CASE WHEN provider_message_ids_created > 0 THEN 1 ELSE 0 END) AS provider_message_ids_created_count,
          SUM(CASE WHEN provider_responses_created > 0 THEN 1 ELSE 0 END) AS provider_responses_created_count
        FROM audience_broadcast_dispatch_attempts`,
      )
      .first<{
        dry_run_attempt_count: number | string | null;
        dry_run_message_count: number | string | null;
        held_recipient_count: number | string | null;
        provider_send_enabled_count: number | string | null;
        recipient_payloads_created_count: number | string | null;
        cloudflare_queue_messages_created_count: number | string | null;
        provider_message_ids_created_count: number | string | null;
        provider_responses_created_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, draft_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id,
          status, queue_name, queue_mode, queue_producer_mode, expected_draft_updated_at,
          expected_ready_recipient_count, dry_run_message_count, held_recipient_count, active_suppression_count,
          provider_limit_policy, provider_rate_limit_window, dispatch_mode, dispatch_result_status,
          suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
          audit_correlation_policy, provider_send_enabled, recipient_payloads_created,
          cloudflare_queue_messages_created, provider_message_ids_created, provider_responses_created,
          idempotency_key, created_at
        FROM audience_broadcast_dispatch_attempts
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<DispatchAttemptRow>();

    return {
      ...emptyDispatchAttemptSummary("d1", null),
      counts: {
        dryRunAttempts: numberValue(counts?.dry_run_attempt_count),
        dryRunMessagesSnapshotted: numberValue(counts?.dry_run_message_count),
        heldRecipientsSnapshotted: numberValue(counts?.held_recipient_count),
        providerSendEnabledRecords: numberValue(counts?.provider_send_enabled_count),
        recipientPayloadsCreatedRecords: numberValue(counts?.recipient_payloads_created_count),
        cloudflareQueueMessagesCreatedRecords: numberValue(counts?.cloudflare_queue_messages_created_count),
        providerMessageIdsCreatedRecords: numberValue(counts?.provider_message_ids_created_count),
        providerResponsesCreatedRecords: numberValue(counts?.provider_responses_created_count),
      },
      latestAttempts: (latest.results ?? []).map((row) => publicDispatchAttempt(row, false)),
    };
  } catch (error) {
    return emptyDispatchAttemptSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience broadcast dispatch attempts.",
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

export async function createAudienceBroadcastDeliveryQueueMessages(
  input: CreateDeliveryQueueMessagesInput,
): Promise<CreateDeliveryQueueMessagesResult> {
  const redaction = emptyDeliveryQueueMessageSummary("d1", null).redaction;
  const deliveryBatchId = parseString(input.deliveryBatchId);
  const draftId = parseString(input.draftId);
  const expectedDraftUpdatedAt = parseString(input.expectedDraftUpdatedAt);
  const expectedReadyRecipientCount = parseInteger(input.expectedReadyRecipientCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!deliveryBatchId || !draftId || !expectedDraftUpdatedAt || expectedReadyRecipientCount === null || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message: "A delivery batch ID, draft ID, expected draft updated time, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceBroadcastDeliveryQueueMessageConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording dry-run broadcast delivery queue messages.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDeliveryQueueMessageByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "broadcast_delivery_queue_messages_replayed",
      duplicate: true,
      messages: publicDeliveryQueueMessage(existing, true),
      redaction,
    };
  }

  const batch = await findDeliveryBatchById(db, deliveryBatchId);
  if (!batch || batch.status !== "delivery_batch_dry_run_recorded" || batch.draft_id !== draftId) {
    return {
      ok: false,
      status: "delivery_batch_not_found",
      message: "A current dry-run delivery batch for this broadcast draft is required before queue message evidence can be recorded.",
      redaction,
    };
  }

  if (
    batch.queue_mode !== "dry_run_contract" ||
    numberValue(batch.provider_send_enabled) > 0 ||
    numberValue(batch.recipient_payloads_created) > 0 ||
    numberValue(batch.provider_message_ids_created) > 0
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message: "Delivery batch queue gates must stay in dry-run mode without provider sends, recipient payloads, or provider message IDs.",
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

  if (draft.updatedAt !== expectedDraftUpdatedAt || batch.expected_draft_updated_at !== expectedDraftUpdatedAt) {
    return {
      ok: false,
      status: "stale_draft_revision",
      message: "The broadcast draft changed before dry-run queue message evidence was recorded.",
      redaction,
      currentDraftUpdatedAt: draft.updatedAt,
    };
  }

  if (draft.readyRecipientCount !== expectedReadyRecipientCount || numberValue(batch.ready_recipient_count) !== expectedReadyRecipientCount) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Broadcast readiness changed before dry-run queue message evidence was recorded.",
      redaction,
      currentReadyRecipientCount: draft.readyRecipientCount,
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
  const queueRecord = queueReadiness.records.find((record) => record.draftId === draftId && record.queueName === batch.queue_name);
  if (
    !queueRecord ||
    queueRecord.queueMode !== "dry_run_contract" ||
    queueRecord.providerSendEnabled ||
    queueRecord.recipientPayloadsCreated
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message: "Queue readiness must stay in dry-run mode without provider sends or recipient payloads before queue message evidence is recorded.",
      redaction,
    };
  }

  const messagesId = `broadcast-delivery-queue-messages-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_broadcast_delivery_queue_messages (
        id, draft_id, delivery_batch_id, schedule_intent_id, status, queue_name, queue_mode,
        expected_draft_updated_at, expected_ready_recipient_count, dry_run_message_count,
        held_recipient_count, active_suppression_count, retry_policy, dispatch_policy,
        unsubscribe_footer_check_status, sender_domain_gate_status, provider_send_enabled,
        recipient_payloads_created, cloudflare_queue_messages_created, provider_message_ids_created,
        idempotency_key, actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'delivery_queue_messages_dry_run_recorded', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      messagesId,
      draft.id,
      batch.id,
      batch.schedule_intent_id,
      queueRecord.queueName,
      queueRecord.queueMode,
      expectedDraftUpdatedAt,
      draft.readyRecipientCount,
      draft.readyRecipientCount,
      heldRecipientCount(draft),
      readiness.counts.activeSuppressionEntries,
      queueRecord.retryPolicy,
      "dry_run_d1_evidence_only_no_cloudflare_queue_dispatch",
      batch.unsubscribe_footer_check_status,
      batch.sender_domain_gate_status,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceBroadcastDeliveryQueueMessageIssue,
        deliveryBatchId: batch.id,
        scheduleIntentId: batch.schedule_intent_id,
        queueReadinessId: queueRecord.id,
        providerSendEnabled: false,
        recipientPayloadsCreated: false,
        cloudflareQueueMessagesCreated: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const messages = await findDeliveryQueueMessageByIdempotency(db, idempotencyKey);
  if (!messages) {
    return {
      ok: false,
      status: "queue_messages_not_created",
      message: "The broadcast delivery queue message dry run could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "broadcast_delivery_queue_messages_recorded",
    duplicate: false,
    messages: publicDeliveryQueueMessage(messages, false),
    redaction,
  };
}

export async function createAudienceBroadcastDispatchPreflight(
  input: CreateDispatchPreflightInput,
): Promise<CreateDispatchPreflightResult> {
  const redaction = emptyDispatchPreflightSummary("d1", null).redaction;
  const deliveryQueueMessageId = parseString(input.deliveryQueueMessageId);
  const draftId = parseString(input.draftId);
  const expectedDraftUpdatedAt = parseString(input.expectedDraftUpdatedAt);
  const expectedReadyRecipientCount = parseInteger(input.expectedReadyRecipientCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!deliveryQueueMessageId || !draftId || !expectedDraftUpdatedAt || expectedReadyRecipientCount === null || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message: "A delivery queue message ID, draft ID, expected draft updated time, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceBroadcastDispatchPreflightConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording dry-run broadcast dispatch preflight evidence.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDispatchPreflightByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "broadcast_dispatch_preflight_replayed",
      duplicate: true,
      preflight: publicDispatchPreflight(existing, true),
      redaction,
    };
  }

  const queueMessages = await findDeliveryQueueMessageById(db, deliveryQueueMessageId);
  if (!queueMessages || queueMessages.status !== "delivery_queue_messages_dry_run_recorded" || queueMessages.draft_id !== draftId) {
    return {
      ok: false,
      status: "delivery_queue_message_not_found",
      message: "A current dry-run queue-message record for this broadcast draft is required before dispatch preflight evidence can be recorded.",
      redaction,
    };
  }

  if (
    queueMessages.queue_mode !== "dry_run_contract" ||
    numberValue(queueMessages.provider_send_enabled) > 0 ||
    numberValue(queueMessages.recipient_payloads_created) > 0 ||
    numberValue(queueMessages.cloudflare_queue_messages_created) > 0 ||
    numberValue(queueMessages.provider_message_ids_created) > 0
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message: "Queue-message gates must stay in dry-run mode without Cloudflare Queue dispatch, provider sends, recipient payloads, or provider message IDs.",
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

  if (draft.updatedAt !== expectedDraftUpdatedAt || queueMessages.expected_draft_updated_at !== expectedDraftUpdatedAt) {
    return {
      ok: false,
      status: "stale_draft_revision",
      message: "The broadcast draft changed before dry-run dispatch preflight evidence was recorded.",
      redaction,
      currentDraftUpdatedAt: draft.updatedAt,
    };
  }

  if (
    draft.readyRecipientCount !== expectedReadyRecipientCount ||
    numberValue(queueMessages.expected_ready_recipient_count) !== expectedReadyRecipientCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Broadcast readiness changed before dry-run dispatch preflight evidence was recorded.",
      redaction,
      currentReadyRecipientCount: draft.readyRecipientCount,
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
  const queueRecord = queueReadiness.records.find(
    (record) => record.draftId === draftId && record.queueName === queueMessages.queue_name,
  );
  if (
    !queueRecord ||
    queueRecord.queueMode !== "dry_run_contract" ||
    queueRecord.providerSendEnabled ||
    queueRecord.recipientPayloadsCreated
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message: "Queue readiness must stay in dry-run mode without provider sends or recipient payloads before dispatch preflight evidence is recorded.",
      redaction,
    };
  }

  const preflightId = `broadcast-dispatch-preflight-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_broadcast_dispatch_preflights (
        id, draft_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id, status,
        queue_name, queue_mode, expected_draft_updated_at, expected_ready_recipient_count,
        dry_run_message_count, held_recipient_count, active_suppression_count, provider_limit_policy,
        provider_rate_limit_window, dispatch_mode, suppression_check_status, unsubscribe_footer_check_status,
        sender_domain_gate_status, audit_correlation_policy, provider_send_enabled, recipient_payloads_created,
        cloudflare_queue_messages_created, provider_message_ids_created, idempotency_key, actor_user_id,
        actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'dispatch_preflight_dry_run_recorded', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      preflightId,
      draft.id,
      queueMessages.id,
      queueMessages.delivery_batch_id,
      queueMessages.schedule_intent_id,
      queueRecord.queueName,
      queueRecord.queueMode,
      expectedDraftUpdatedAt,
      draft.readyRecipientCount,
      numberValue(queueMessages.dry_run_message_count),
      numberValue(queueMessages.held_recipient_count),
      readiness.counts.activeSuppressionEntries,
      "provider_limit_required_before_live_sends",
      "not_configured_real_sends_disabled",
      "dry_run_preflight_no_cloudflare_queue_dispatch",
      queueRecord.suppressionCheckPolicy,
      queueMessages.unsubscribe_footer_check_status,
      queueMessages.sender_domain_gate_status,
      queueRecord.auditCorrelationPolicy,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceBroadcastDispatchPreflightIssue,
        deliveryQueueMessageId: queueMessages.id,
        deliveryBatchId: queueMessages.delivery_batch_id,
        scheduleIntentId: queueMessages.schedule_intent_id,
        queueReadinessId: queueRecord.id,
        providerSendEnabled: false,
        recipientPayloadsCreated: false,
        cloudflareQueueMessagesCreated: false,
        providerMessageIdsIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const preflight = await findDispatchPreflightByIdempotency(db, idempotencyKey);
  if (!preflight) {
    return {
      ok: false,
      status: "dispatch_preflight_not_created",
      message: "The broadcast dispatch preflight dry run could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "broadcast_dispatch_preflight_recorded",
    duplicate: false,
    preflight: publicDispatchPreflight(preflight, false),
    redaction,
  };
}

export async function createAudienceBroadcastDispatchAttempt(
  input: CreateDispatchAttemptInput,
): Promise<CreateDispatchAttemptResult> {
  const redaction = emptyDispatchAttemptSummary("d1", null).redaction;
  const dispatchPreflightId = parseString(input.dispatchPreflightId);
  const draftId = parseString(input.draftId);
  const expectedDraftUpdatedAt = parseString(input.expectedDraftUpdatedAt);
  const expectedReadyRecipientCount = parseInteger(input.expectedReadyRecipientCount);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!dispatchPreflightId || !draftId || !expectedDraftUpdatedAt || expectedReadyRecipientCount === null || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message: "A dispatch preflight ID, draft ID, expected draft updated time, expected readiness count, and idempotency key are required.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceBroadcastDispatchAttemptConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording a dry-run broadcast dispatch attempt receipt.",
      redaction,
    };
  }

  const { db } = await getRuntime();
  const existing = await findDispatchAttemptByIdempotency(db, idempotencyKey);
  if (existing) {
    return {
      ok: true,
      status: "broadcast_dispatch_attempt_replayed",
      duplicate: true,
      attempt: publicDispatchAttempt(existing, true),
      redaction,
    };
  }

  const preflight = await findDispatchPreflightById(db, dispatchPreflightId);
  if (!preflight || preflight.status !== "dispatch_preflight_dry_run_recorded" || preflight.draft_id !== draftId) {
    return {
      ok: false,
      status: "dispatch_preflight_not_found",
      message: "A current dry-run dispatch preflight for this broadcast draft is required before a dispatch attempt receipt can be recorded.",
      redaction,
    };
  }

  if (
    preflight.queue_mode !== "dry_run_contract" ||
    numberValue(preflight.provider_send_enabled) > 0 ||
    numberValue(preflight.recipient_payloads_created) > 0 ||
    numberValue(preflight.cloudflare_queue_messages_created) > 0 ||
    numberValue(preflight.provider_message_ids_created) > 0
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message: "Dispatch preflight gates must stay in dry-run mode without Cloudflare Queue dispatch, provider sends, recipient payloads, or provider message IDs.",
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

  if (draft.updatedAt !== expectedDraftUpdatedAt || preflight.expected_draft_updated_at !== expectedDraftUpdatedAt) {
    return {
      ok: false,
      status: "stale_draft_revision",
      message: "The broadcast draft changed before the dry-run dispatch attempt receipt was recorded.",
      redaction,
      currentDraftUpdatedAt: draft.updatedAt,
    };
  }

  if (
    draft.readyRecipientCount !== expectedReadyRecipientCount ||
    numberValue(preflight.expected_ready_recipient_count) !== expectedReadyRecipientCount
  ) {
    return {
      ok: false,
      status: "stale_readiness_count",
      message: "Broadcast readiness changed before the dry-run dispatch attempt receipt was recorded.",
      redaction,
      currentReadyRecipientCount: draft.readyRecipientCount,
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
  const queueRecord = queueReadiness.records.find(
    (record) => record.draftId === draftId && record.queueName === preflight.queue_name,
  );
  if (
    !queueRecord ||
    queueRecord.queueMode !== "dry_run_contract" ||
    queueRecord.providerSendEnabled ||
    queueRecord.recipientPayloadsCreated
  ) {
    return {
      ok: false,
      status: "queue_gate_not_ready",
      message: "Queue readiness must stay in dry-run mode without provider sends or recipient payloads before a dispatch attempt receipt is recorded.",
      redaction,
    };
  }

  const attemptId = `broadcast-dispatch-attempt-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_broadcast_dispatch_attempts (
        id, draft_id, dispatch_preflight_id, delivery_queue_message_id, delivery_batch_id, schedule_intent_id,
        status, queue_name, queue_mode, queue_producer_mode, expected_draft_updated_at,
        expected_ready_recipient_count, dry_run_message_count, held_recipient_count, active_suppression_count,
        provider_limit_policy, provider_rate_limit_window, dispatch_mode, dispatch_result_status,
        suppression_check_status, unsubscribe_footer_check_status, sender_domain_gate_status,
        audit_correlation_policy, provider_send_enabled, recipient_payloads_created,
        cloudflare_queue_messages_created, provider_message_ids_created, provider_responses_created,
        idempotency_key, actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'dispatch_attempt_dry_run_recorded', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      attemptId,
      draft.id,
      preflight.id,
      preflight.delivery_queue_message_id,
      preflight.delivery_batch_id,
      preflight.schedule_intent_id,
      preflight.queue_name,
      preflight.queue_mode,
      "dry_run_receipt_only_no_cloudflare_queue_producer",
      expectedDraftUpdatedAt,
      draft.readyRecipientCount,
      numberValue(preflight.dry_run_message_count),
      numberValue(preflight.held_recipient_count),
      readiness.counts.activeSuppressionEntries,
      preflight.provider_limit_policy,
      preflight.provider_rate_limit_window,
      preflight.dispatch_mode,
      "not_dispatched_dry_run_receipt_only",
      preflight.suppression_check_status,
      preflight.unsubscribe_footer_check_status,
      preflight.sender_domain_gate_status,
      preflight.audit_correlation_policy,
      idempotencyKey,
      input.actor.userId,
      input.actor.email,
      JSON.stringify({
        issue: audienceBroadcastDispatchAttemptIssue,
        dispatchPreflightId: preflight.id,
        deliveryQueueMessageId: preflight.delivery_queue_message_id,
        deliveryBatchId: preflight.delivery_batch_id,
        scheduleIntentId: preflight.schedule_intent_id,
        queueReadinessId: queueRecord.id,
        providerSendEnabled: false,
        recipientPayloadsCreated: false,
        cloudflareQueueMessagesCreated: false,
        providerMessageIdsIncluded: false,
        providerResponsesIncluded: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const attempt = await findDispatchAttemptByIdempotency(db, idempotencyKey);
  if (!attempt) {
    return {
      ok: false,
      status: "dispatch_attempt_not_created",
      message: "The broadcast dispatch attempt receipt could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "broadcast_dispatch_attempt_recorded",
    duplicate: false,
    attempt: publicDispatchAttempt(attempt, false),
    redaction,
  };
}
