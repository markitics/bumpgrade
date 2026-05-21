import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/analytics-events";
import { affiliateFraudReviewRecordStatus } from "@/lib/affiliate-fraud-review-records";
import { affiliatePartnerNotificationReadinessRecordStatus } from "@/lib/affiliate-partner-notification-readiness-records";
import { affiliatePayoutPreparationRecordStatus } from "@/lib/affiliate-payout-preparation-records";
import { affiliateProgram } from "@/lib/affiliate-referrals";

export const affiliatePartnerNotificationSendPreflightRecordIssue = 279;
export const affiliatePartnerNotificationSendPreflightRecordStatus =
  "owner-affiliate-partner-notification-send-preflights-ready";
export const affiliatePartnerNotificationSendPreflightRecordApiRoute =
  "/api/admin/affiliates/notification-send-preflights";
export const affiliatePartnerNotificationSendPreflightRecordOwnerRoute = "/admin/affiliates";
export const affiliatePartnerNotificationSendPreflightRecordConfirmationText =
  "Record Bumpgrade affiliate partner notification send preflight evidence";

const recordKind = "owner_partner_notification_send_preflight_evidence";
const defaultNotificationSendPreflightDisposition = "blocked_pending_recipient_review";
const supportedNotificationSendPreflightDispositions = [
  "blocked_pending_recipient_review",
  "draft_ready_for_owner_review",
  "provider_contract_not_ready",
] as const;
const payoutBatch = affiliateProgram.payoutBatches[0];
const reviewFlag = affiliateProgram.reviewFlags[0];
const partnerReport = affiliateProgram.partnerReports[0];

type Runtime = {
  db: D1Database;
};

type NotificationSendPreflightDisposition = (typeof supportedNotificationSendPreflightDispositions)[number];

type NotificationSendPreflightRecordCountRow = {
  notification_send_preflight_records: number;
  owner_confirmed_records: number;
  owner_record_created_records: number;
  partner_notification_sent_records: number;
  notification_provider_called_records: number;
  notification_provider_send_enabled_records: number;
  queue_dispatch_created_records: number;
  send_payload_included_records: number;
  notification_body_included_records: number;
  recipient_email_included_records: number;
  provider_message_id_included_records: number;
  send_queue_rows_included_records: number;
  payable_commission_created_records: number;
  fraud_decision_enforced_records: number;
  stripe_payout_created_records: number;
  stripe_transfer_created_records: number;
  payout_account_stored_records: number;
  tax_data_collected_records: number;
  buyer_data_included_records: number;
  raw_ledger_rows_exposed_records: number;
  raw_click_rows_exposed_records: number;
  raw_checkout_rows_exposed_records: number;
  raw_actor_identity_included_records: number;
  private_fraud_signals_included_records: number;
};

type NotificationSendPreflightRecordRow = {
  id: string;
  program_id: string;
  affiliate_partner_report_id: string;
  affiliate_partner_id: string;
  payout_preparation_id: string;
  payout_batch_id: string;
  review_flag_id: string;
  record_kind: typeof recordKind;
  notification_send_preflight_disposition: NotificationSendPreflightDisposition;
  expected_program_revision_id: string;
  expected_partner_report_status: typeof partnerReport.status;
  expected_payout_batch_status: typeof payoutBatch.status;
  expected_payout_preparation_record_status: typeof affiliatePayoutPreparationRecordStatus;
  expected_fraud_review_record_status: typeof affiliateFraudReviewRecordStatus;
  expected_notification_readiness_record_status: typeof affiliatePartnerNotificationReadinessRecordStatus;
  expected_review_flag_severity: typeof reviewFlag.severity;
  expected_linked_ledger_count: number;
  idempotency_key: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  owner_partner_notification_send_preflight_record_created: number;
  partner_notification_sent: number;
  notification_provider_called: number;
  notification_provider_send_enabled: number;
  queue_dispatch_created: number;
  send_payload_included: number;
  notification_body_included: number;
  recipient_email_included: number;
  provider_message_id_included: number;
  send_queue_rows_included: number;
  payable_commission_created: number;
  fraud_decision_enforced: number;
  stripe_payout_created: number;
  stripe_transfer_created: number;
  payout_account_stored: number;
  tax_data_collected: number;
  buyer_data_included: number;
  raw_ledger_rows_exposed: number;
  raw_click_rows_exposed: number;
  raw_checkout_rows_exposed: number;
  raw_actor_identity_included: number;
  private_fraud_signals_included: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

type NotificationSendPreflightChecklistItem = {
  id: string;
  title: string;
  status: "passed" | "blocked" | "external_required";
  evidence: string;
};

export type AffiliatePartnerNotificationSendPreflightEvidence = {
  programId: string;
  programRevisionId: string;
  affiliatePartnerReportId: string;
  affiliatePartnerId: string;
  partnerReportStatus: typeof partnerReport.status;
  payoutPreparationId: string;
  payoutBatchId: string;
  payoutBatchStatus: typeof payoutBatch.status;
  payoutPreparationRecordStatus: typeof affiliatePayoutPreparationRecordStatus;
  fraudReviewRecordStatus: typeof affiliateFraudReviewRecordStatus;
  notificationReadinessRecordStatus: typeof affiliatePartnerNotificationReadinessRecordStatus;
  reviewFlagId: string;
  reviewFlagSeverity: typeof reviewFlag.severity;
  linkedLedgerIds: string[];
  notificationChannel: "email";
  notificationAudience: "redacted_affiliate_partner_summary";
  supportedNotificationSendPreflightDispositions: readonly NotificationSendPreflightDisposition[];
  defaultNotificationSendPreflightDisposition: NotificationSendPreflightDisposition;
  sendPreflightChecklist: NotificationSendPreflightChecklistItem[];
  ownerRecordAllowed: true;
  partnerNotificationSent: false;
  notificationProviderCalled: false;
  notificationProviderSendEnabled: false;
  queueDispatchCreated: false;
  sendPayloadIncluded: false;
  notificationBodyIncluded: false;
  recipientEmailIncluded: false;
  providerMessageIdIncluded: false;
  sendQueueRowsIncluded: false;
  payableCommissionCreated: false;
  fraudDecisionEnforced: false;
  stripePayoutCreated: false;
  stripeTransferCreated: false;
  payoutAccountStored: false;
  taxDataCollected: false;
  buyerDataIncluded: false;
  rawLedgerRowsExposed: false;
  rawClickRowsExposed: false;
  rawCheckoutRowsExposed: false;
  rawActorIdentityIncluded: false;
  privateFraudSignalsIncluded: false;
};

export type AffiliatePartnerNotificationSendPreflightRecordPublic = {
  id: string;
  programId: string;
  affiliatePartnerReportId: string;
  affiliatePartnerId: string;
  payoutPreparationId: string;
  payoutBatchId: string;
  reviewFlagId: string;
  recordKind: typeof recordKind;
  notificationSendPreflightDisposition: NotificationSendPreflightDisposition;
  expectedPartnerReportStatus: typeof partnerReport.status;
  expectedPayoutBatchStatus: typeof payoutBatch.status;
  expectedPayoutPreparationRecordStatus: typeof affiliatePayoutPreparationRecordStatus;
  expectedFraudReviewRecordStatus: typeof affiliateFraudReviewRecordStatus;
  expectedNotificationReadinessRecordStatus: typeof affiliatePartnerNotificationReadinessRecordStatus;
  expectedReviewFlagSeverity: typeof reviewFlag.severity;
  expectedLinkedLedgerCount: number;
  privateNoteRecorded: boolean;
  ownerPartnerNotificationSendPreflightRecordCreated: true;
  partnerNotificationSent: false;
  notificationProviderCalled: false;
  notificationProviderSendEnabled: false;
  queueDispatchCreated: false;
  sendPayloadIncluded: false;
  notificationBodyIncluded: false;
  recipientEmailIncluded: false;
  providerMessageIdIncluded: false;
  sendQueueRowsIncluded: false;
  payableCommissionCreated: false;
  fraudDecisionEnforced: false;
  stripePayoutCreated: false;
  stripeTransferCreated: false;
  payoutAccountStored: false;
  taxDataCollected: false;
  buyerDataIncluded: false;
  rawLedgerRowsExposed: false;
  rawClickRowsExposed: false;
  rawCheckoutRowsExposed: false;
  rawActorIdentityIncluded: false;
  privateFraudSignalsIncluded: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type AffiliatePartnerNotificationSendPreflightRecordSummary = {
  id: "affiliate-partner-notification-send-preflight-record-contract";
  status: typeof affiliatePartnerNotificationSendPreflightRecordStatus;
  issue: typeof affiliatePartnerNotificationSendPreflightRecordIssue;
  parentIssue: 19;
  apiRoute: typeof affiliatePartnerNotificationSendPreflightRecordApiRoute;
  ownerRoute: typeof affiliatePartnerNotificationSendPreflightRecordOwnerRoute;
  sourceDataRoute: "/affiliates/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof affiliatePartnerNotificationSendPreflightRecordConfirmationText;
  };
  currentEvidence: AffiliatePartnerNotificationSendPreflightEvidence;
  counts: {
    notificationSendPreflightRecords: number;
    ownerConfirmedRecords: number;
    ownerRecordCreatedRecords: number;
    partnerNotificationSentRecords: number;
    notificationProviderCalledRecords: number;
    notificationProviderSendEnabledRecords: number;
    queueDispatchCreatedRecords: number;
    sendPayloadIncludedRecords: number;
    notificationBodyIncludedRecords: number;
    recipientEmailIncludedRecords: number;
    providerMessageIdIncludedRecords: number;
    sendQueueRowsIncludedRecords: number;
    payableCommissionCreatedRecords: number;
    fraudDecisionEnforcedRecords: number;
    stripePayoutCreatedRecords: number;
    stripeTransferCreatedRecords: number;
    payoutAccountStoredRecords: number;
    taxDataCollectedRecords: number;
    buyerDataIncludedRecords: number;
    rawLedgerRowsExposedRecords: number;
    rawClickRowsExposedRecords: number;
    rawCheckoutRowsExposedRecords: number;
    rawActorIdentityIncludedRecords: number;
    privateFraudSignalsIncludedRecords: number;
  };
  latestRecords: AffiliatePartnerNotificationSendPreflightRecordPublic[];
  redaction: {
    privateDataIncluded: false;
    recipientEmailIncluded: false;
    notificationBodyIncluded: false;
    providerMessageIdIncluded: false;
    sendQueueRowsIncluded: false;
    sendPayloadIncluded: false;
    providerSendEnabled: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    buyerDataIncluded: false;
    rawLedgerRowsIncluded: false;
    rawClickRowsIncluded: false;
    rawCheckoutRowsIncluded: false;
    rawActorIdentityIncluded: false;
    privateFraudSignalsIncluded: false;
    payoutAccountIncluded: false;
    taxDataIncluded: false;
    stripeIdsIncluded: false;
    partnerNotificationIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateNotificationSendPreflightRecordInput = {
  programId?: unknown;
  affiliatePartnerReportId?: unknown;
  affiliatePartnerId?: unknown;
  payoutPreparationId?: unknown;
  payoutBatchId?: unknown;
  reviewFlagId?: unknown;
  notificationSendPreflightDisposition?: unknown;
  expectedProgramRevisionId?: unknown;
  expectedPartnerReportStatus?: unknown;
  expectedPayoutBatchStatus?: unknown;
  expectedPayoutPreparationRecordStatus?: unknown;
  expectedFraudReviewRecordStatus?: unknown;
  expectedNotificationReadinessRecordStatus?: unknown;
  expectedReviewFlagSeverity?: unknown;
  expectedLinkedLedgerCount?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateNotificationSendPreflightRecordResult =
  | {
      ok: true;
      status:
        | "affiliate_partner_notification_send_preflight_recorded"
        | "affiliate_partner_notification_send_preflight_replayed";
      duplicate: boolean;
      record: AffiliatePartnerNotificationSendPreflightRecordPublic;
      redaction: AffiliatePartnerNotificationSendPreflightRecordSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_partner_report"
        | "unsupported_affiliate_partner"
        | "unsupported_payout_preparation"
        | "unsupported_payout_batch"
        | "unsupported_review_flag"
        | "unsupported_notification_send_preflight_disposition"
        | "confirmation_required"
        | "stale_program_revision"
        | "stale_partner_report_status"
        | "stale_payout_batch_status"
        | "stale_payout_preparation_record_status"
        | "stale_fraud_review_record_status"
        | "stale_notification_readiness_record_status"
        | "stale_fraud_review_evidence"
        | "idempotency_conflict"
        | "notification_send_preflight_record_not_created";
      message: string;
      redaction: AffiliatePartnerNotificationSendPreflightRecordSummary["redaction"];
      currentProgramRevisionId?: string;
      currentPartnerReportStatus?: string;
      currentPayoutBatchStatus?: string;
      currentPayoutPreparationRecordStatus?: string;
      currentFraudReviewRecordStatus?: string;
      currentNotificationReadinessRecordStatus?: string;
      currentEvidence?: AffiliatePartnerNotificationSendPreflightEvidence;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function redaction(): AffiliatePartnerNotificationSendPreflightRecordSummary["redaction"] {
  return {
    privateDataIncluded: false,
    recipientEmailIncluded: false,
    notificationBodyIncluded: false,
    providerMessageIdIncluded: false,
    sendQueueRowsIncluded: false,
    sendPayloadIncluded: false,
    providerSendEnabled: false,
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    privateNoteIncluded: false,
    buyerDataIncluded: false,
    rawLedgerRowsIncluded: false,
    rawClickRowsIncluded: false,
    rawCheckoutRowsIncluded: false,
    rawActorIdentityIncluded: false,
    privateFraudSignalsIncluded: false,
    payoutAccountIncluded: false,
    taxDataIncluded: false,
    stripeIdsIncluded: false,
    partnerNotificationIncluded: false,
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

function parseNotificationSendPreflightDisposition(value: unknown) {
  const parsed = parseString(value, 120);
  return supportedNotificationSendPreflightDispositions.find((disposition) => disposition === parsed) ?? null;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function currentEvidence(): AffiliatePartnerNotificationSendPreflightEvidence {
  return {
    programId: affiliateProgram.id,
    programRevisionId: affiliateProgram.revisionId,
    affiliatePartnerReportId: partnerReport.id,
    affiliatePartnerId: partnerReport.partnerId,
    partnerReportStatus: partnerReport.status,
    payoutPreparationId: payoutBatch.preparationId,
    payoutBatchId: payoutBatch.id,
    payoutBatchStatus: payoutBatch.status,
    payoutPreparationRecordStatus: affiliatePayoutPreparationRecordStatus,
    fraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
    notificationReadinessRecordStatus: affiliatePartnerNotificationReadinessRecordStatus,
    reviewFlagId: reviewFlag.id,
    reviewFlagSeverity: reviewFlag.severity,
    linkedLedgerIds: reviewFlag.linkedLedgerIds,
    notificationChannel: "email",
    notificationAudience: "redacted_affiliate_partner_summary",
    supportedNotificationSendPreflightDispositions,
    defaultNotificationSendPreflightDisposition,
    sendPreflightChecklist: [
      {
        id: "partner-notification-check-payout-preparation-records",
        title: "Payout preparation evidence contract is available",
        status: "passed",
        evidence: "Issue #273 records owner-confirmed payout preparation evidence without payout execution.",
      },
      {
        id: "partner-notification-check-fraud-review-records",
        title: "Fraud review evidence contract is available",
        status: "passed",
        evidence: "Issue #275 records owner-reviewed fraud evidence without fraud enforcement.",
      },
      {
        id: "partner-notification-check-notification-readiness-records",
        title: "Notification readiness evidence contract is available",
        status: "passed",
        evidence: "Issue #277 records owner-reviewed notification readiness evidence without sending partner notifications.",
      },
      {
        id: "partner-notification-check-private-recipient-data",
        title: "Private partner recipient data remains external",
        status: "external_required",
        evidence: "Recipient addresses, message bodies, payout accounts, and tax records are excluded.",
      },
      {
        id: "partner-notification-check-send-path-disabled",
        title: "Notification send path remains disabled",
        status: "blocked",
        evidence: "This send preflight record keeps provider sends disabled, creates no queue rows, and sends no partner notifications.",
      },
      {
        id: "partner-notification-check-send-payload-disabled",
        title: "Send payload remains unbuilt",
        status: "blocked",
        evidence: "No recipient payload, personalized body, provider message ID, or send payload is created.",
      },
    ],
    ownerRecordAllowed: true,
    partnerNotificationSent: false,
    notificationProviderCalled: false,
    notificationProviderSendEnabled: false,
    queueDispatchCreated: false,
    sendPayloadIncluded: false,
    notificationBodyIncluded: false,
    recipientEmailIncluded: false,
    providerMessageIdIncluded: false,
    sendQueueRowsIncluded: false,
    payableCommissionCreated: false,
    fraudDecisionEnforced: false,
    stripePayoutCreated: false,
    stripeTransferCreated: false,
    payoutAccountStored: false,
    taxDataCollected: false,
    buyerDataIncluded: false,
    rawLedgerRowsExposed: false,
    rawClickRowsExposed: false,
    rawCheckoutRowsExposed: false,
    rawActorIdentityIncluded: false,
    privateFraudSignalsIncluded: false,
  };
}

function emptyCounts(): AffiliatePartnerNotificationSendPreflightRecordSummary["counts"] {
  return {
    notificationSendPreflightRecords: 0,
    ownerConfirmedRecords: 0,
    ownerRecordCreatedRecords: 0,
    partnerNotificationSentRecords: 0,
    notificationProviderCalledRecords: 0,
    notificationProviderSendEnabledRecords: 0,
    queueDispatchCreatedRecords: 0,
    sendPayloadIncludedRecords: 0,
    notificationBodyIncludedRecords: 0,
    recipientEmailIncludedRecords: 0,
    providerMessageIdIncludedRecords: 0,
    sendQueueRowsIncludedRecords: 0,
    payableCommissionCreatedRecords: 0,
    fraudDecisionEnforcedRecords: 0,
    stripePayoutCreatedRecords: 0,
    stripeTransferCreatedRecords: 0,
    payoutAccountStoredRecords: 0,
    taxDataCollectedRecords: 0,
    buyerDataIncludedRecords: 0,
    rawLedgerRowsExposedRecords: 0,
    rawClickRowsExposedRecords: 0,
    rawCheckoutRowsExposedRecords: 0,
    rawActorIdentityIncludedRecords: 0,
    privateFraudSignalsIncludedRecords: 0,
  };
}

function emptySummary(
  source: AffiliatePartnerNotificationSendPreflightRecordSummary["source"],
  loadError: string | null,
): AffiliatePartnerNotificationSendPreflightRecordSummary {
  return {
    id: "affiliate-partner-notification-send-preflight-record-contract",
    status: affiliatePartnerNotificationSendPreflightRecordStatus,
    issue: affiliatePartnerNotificationSendPreflightRecordIssue,
    parentIssue: 19,
    apiRoute: affiliatePartnerNotificationSendPreflightRecordApiRoute,
    ownerRoute: affiliatePartnerNotificationSendPreflightRecordOwnerRoute,
    sourceDataRoute: "/affiliates/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: affiliatePartnerNotificationSendPreflightRecordConfirmationText,
    },
    currentEvidence: currentEvidence(),
    counts: emptyCounts(),
    latestRecords: [],
    redaction: redaction(),
    privateFieldsExcluded: [
      "actorEmail",
      "actorEmailHash",
      "privateNote",
      "privateNoteSha256",
      "recipientEmail",
      "notificationBody",
      "sendPayload",
      "providerMessageId",
      "sendQueueRows",
      "buyerData",
      "rawLedgerRows",
      "rawClickRows",
      "rawCheckoutRows",
      "privateFraudSignals",
      "payoutAccount",
      "taxData",
      "stripePayoutId",
      "stripeTransferId",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #279 lets verified owners record redacted affiliate partner notification-send-preflight evidence after exact confirmation, idempotency, program revision checks, partner report checks, payout preparation checks, payout batch status checks, fraud review evidence checks, notification readiness contract checks, and provider-send-disabled checks. It creates owner-visible send preflight evidence only; it does not send partner notifications, call notification providers, enable provider sends, create send payloads, create queue dispatch rows, include recipient addresses or message bodies, create payable commission state, enforce fraud decisions, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, or accept direct public agent affiliate writes.",
  };
}

function publicRecord(
  row: NotificationSendPreflightRecordRow,
  duplicate = false,
): AffiliatePartnerNotificationSendPreflightRecordPublic {
  return {
    id: row.id,
    programId: row.program_id,
    affiliatePartnerReportId: row.affiliate_partner_report_id,
    affiliatePartnerId: row.affiliate_partner_id,
    payoutPreparationId: row.payout_preparation_id,
    payoutBatchId: row.payout_batch_id,
    reviewFlagId: row.review_flag_id,
    recordKind: row.record_kind,
    notificationSendPreflightDisposition: row.notification_send_preflight_disposition,
    expectedPartnerReportStatus: row.expected_partner_report_status,
    expectedPayoutBatchStatus: row.expected_payout_batch_status,
    expectedPayoutPreparationRecordStatus: row.expected_payout_preparation_record_status,
    expectedFraudReviewRecordStatus: row.expected_fraud_review_record_status,
    expectedNotificationReadinessRecordStatus: row.expected_notification_readiness_record_status,
    expectedReviewFlagSeverity: row.expected_review_flag_severity,
    expectedLinkedLedgerCount: numberValue(row.expected_linked_ledger_count),
    privateNoteRecorded: Boolean(row.private_note_sha256),
    ownerPartnerNotificationSendPreflightRecordCreated: true,
    partnerNotificationSent: false,
    notificationProviderCalled: false,
    notificationProviderSendEnabled: false,
    queueDispatchCreated: false,
    sendPayloadIncluded: false,
    notificationBodyIncluded: false,
    recipientEmailIncluded: false,
    providerMessageIdIncluded: false,
    sendQueueRowsIncluded: false,
    payableCommissionCreated: false,
    fraudDecisionEnforced: false,
    stripePayoutCreated: false,
    stripeTransferCreated: false,
    payoutAccountStored: false,
    taxDataCollected: false,
    buyerDataIncluded: false,
    rawLedgerRowsExposed: false,
    rawClickRowsExposed: false,
    rawCheckoutRowsExposed: false,
    rawActorIdentityIncluded: false,
    privateFraudSignalsIncluded: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
}

async function findRecordByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM affiliate_partner_notification_send_preflight_records
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<NotificationSendPreflightRecordRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS notification_send_preflight_records,
        SUM(CASE WHEN confirmation_text_sha256 IS NOT NULL THEN 1 ELSE 0 END) AS owner_confirmed_records,
        SUM(owner_partner_notification_send_preflight_record_created) AS owner_record_created_records,
        SUM(partner_notification_sent) AS partner_notification_sent_records,
        SUM(notification_provider_called) AS notification_provider_called_records,
        SUM(notification_provider_send_enabled) AS notification_provider_send_enabled_records,
        SUM(queue_dispatch_created) AS queue_dispatch_created_records,
        SUM(send_payload_included) AS send_payload_included_records,
        SUM(notification_body_included) AS notification_body_included_records,
        SUM(recipient_email_included) AS recipient_email_included_records,
        SUM(provider_message_id_included) AS provider_message_id_included_records,
        SUM(send_queue_rows_included) AS send_queue_rows_included_records,
        SUM(payable_commission_created) AS payable_commission_created_records,
        SUM(fraud_decision_enforced) AS fraud_decision_enforced_records,
        SUM(stripe_payout_created) AS stripe_payout_created_records,
        SUM(stripe_transfer_created) AS stripe_transfer_created_records,
        SUM(payout_account_stored) AS payout_account_stored_records,
        SUM(tax_data_collected) AS tax_data_collected_records,
        SUM(buyer_data_included) AS buyer_data_included_records,
        SUM(raw_ledger_rows_exposed) AS raw_ledger_rows_exposed_records,
        SUM(raw_click_rows_exposed) AS raw_click_rows_exposed_records,
        SUM(raw_checkout_rows_exposed) AS raw_checkout_rows_exposed_records,
        SUM(raw_actor_identity_included) AS raw_actor_identity_included_records,
        SUM(private_fraud_signals_included) AS private_fraud_signals_included_records
       FROM affiliate_partner_notification_send_preflight_records`,
    )
    .first<NotificationSendPreflightRecordCountRow>();

  return {
    notificationSendPreflightRecords: numberValue(row?.notification_send_preflight_records),
    ownerConfirmedRecords: numberValue(row?.owner_confirmed_records),
    ownerRecordCreatedRecords: numberValue(row?.owner_record_created_records),
    partnerNotificationSentRecords: numberValue(row?.partner_notification_sent_records),
    notificationProviderCalledRecords: numberValue(row?.notification_provider_called_records),
    notificationProviderSendEnabledRecords: numberValue(row?.notification_provider_send_enabled_records),
    queueDispatchCreatedRecords: numberValue(row?.queue_dispatch_created_records),
    sendPayloadIncludedRecords: numberValue(row?.send_payload_included_records),
    notificationBodyIncludedRecords: numberValue(row?.notification_body_included_records),
    recipientEmailIncludedRecords: numberValue(row?.recipient_email_included_records),
    providerMessageIdIncludedRecords: numberValue(row?.provider_message_id_included_records),
    sendQueueRowsIncludedRecords: numberValue(row?.send_queue_rows_included_records),
    payableCommissionCreatedRecords: numberValue(row?.payable_commission_created_records),
    fraudDecisionEnforcedRecords: numberValue(row?.fraud_decision_enforced_records),
    stripePayoutCreatedRecords: numberValue(row?.stripe_payout_created_records),
    stripeTransferCreatedRecords: numberValue(row?.stripe_transfer_created_records),
    payoutAccountStoredRecords: numberValue(row?.payout_account_stored_records),
    taxDataCollectedRecords: numberValue(row?.tax_data_collected_records),
    buyerDataIncludedRecords: numberValue(row?.buyer_data_included_records),
    rawLedgerRowsExposedRecords: numberValue(row?.raw_ledger_rows_exposed_records),
    rawClickRowsExposedRecords: numberValue(row?.raw_click_rows_exposed_records),
    rawCheckoutRowsExposedRecords: numberValue(row?.raw_checkout_rows_exposed_records),
    rawActorIdentityIncludedRecords: numberValue(row?.raw_actor_identity_included_records),
    privateFraudSignalsIncludedRecords: numberValue(row?.private_fraud_signals_included_records),
  };
}

async function loadLatestRecords(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM affiliate_partner_notification_send_preflight_records
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<NotificationSendPreflightRecordRow>();
  return (result.results ?? []).map((row) => publicRecord(row, false));
}

export async function getAffiliatePartnerNotificationSendPreflightRecordSummary(
  dbInput?: D1Database,
): Promise<AffiliatePartnerNotificationSendPreflightRecordSummary> {
  try {
    const db = dbInput ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null),
      counts: await loadCounts(db),
      latestRecords: await loadLatestRecords(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load affiliate partner notification send preflight records.",
    );
  }
}

export async function createAffiliatePartnerNotificationSendPreflightRecord(
  input: CreateNotificationSendPreflightRecordInput,
): Promise<CreateNotificationSendPreflightRecordResult> {
  const summaryRedaction = redaction();
  const programId = parseString(input.programId);
  const affiliatePartnerReportId = parseString(input.affiliatePartnerReportId);
  const affiliatePartnerId = parseString(input.affiliatePartnerId);
  const payoutPreparationId = parseString(input.payoutPreparationId);
  const payoutBatchId = parseString(input.payoutBatchId);
  const reviewFlagId = parseString(input.reviewFlagId);
  const notificationSendPreflightDisposition = parseNotificationSendPreflightDisposition(
    input.notificationSendPreflightDisposition,
  );
  const expectedProgramRevisionId = parseString(input.expectedProgramRevisionId);
  const expectedPartnerReportStatus = parseString(input.expectedPartnerReportStatus);
  const expectedPayoutBatchStatus = parseString(input.expectedPayoutBatchStatus);
  const expectedPayoutPreparationRecordStatus = parseString(input.expectedPayoutPreparationRecordStatus);
  const expectedFraudReviewRecordStatus = parseString(input.expectedFraudReviewRecordStatus);
  const expectedNotificationReadinessRecordStatus = parseString(input.expectedNotificationReadinessRecordStatus);
  const expectedReviewFlagSeverity = parseString(input.expectedReviewFlagSeverity);
  const expectedLinkedLedgerCount = parseInteger(input.expectedLinkedLedgerCount);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;
  const evidence = currentEvidence();

  if (
    !programId ||
    !affiliatePartnerReportId ||
    !affiliatePartnerId ||
    !payoutPreparationId ||
    !payoutBatchId ||
    !reviewFlagId ||
    !expectedProgramRevisionId ||
    !expectedPartnerReportStatus ||
    !expectedPayoutBatchStatus ||
    !expectedPayoutPreparationRecordStatus ||
    !expectedFraudReviewRecordStatus ||
    !expectedNotificationReadinessRecordStatus ||
    !expectedReviewFlagSeverity ||
    expectedLinkedLedgerCount === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Program, partner report, partner, payout preparation, payout batch, review flag, expected statuses, notification readiness status, linked ledger count, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (!notificationSendPreflightDisposition) {
    return {
      ok: false,
      status: "unsupported_notification_send_preflight_disposition",
      message: "A supported affiliate partner notification send preflight disposition is required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== affiliatePartnerNotificationSendPreflightRecordConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording affiliate partner notification send preflight evidence.",
      redaction: summaryRedaction,
    };
  }

  if (programId !== affiliateProgram.id) {
    return {
      ok: false,
      status: "invalid_request",
      message: "The affiliate program could not be found.",
      redaction: summaryRedaction,
    };
  }

  if (expectedProgramRevisionId !== affiliateProgram.revisionId) {
    return {
      ok: false,
      status: "stale_program_revision",
      message: "The affiliate program revision changed before the notification send preflight record was created.",
      redaction: summaryRedaction,
      currentProgramRevisionId: affiliateProgram.revisionId,
    };
  }

  if (affiliatePartnerReportId !== partnerReport.id) {
    return {
      ok: false,
      status: "unsupported_partner_report",
      message: "The affiliate partner report is not supported by this notification send preflight record.",
      redaction: summaryRedaction,
    };
  }

  if (affiliatePartnerId !== partnerReport.partnerId) {
    return {
      ok: false,
      status: "unsupported_affiliate_partner",
      message: "The affiliate partner is not supported by this notification send preflight record.",
      redaction: summaryRedaction,
    };
  }

  if (expectedPartnerReportStatus !== partnerReport.status) {
    return {
      ok: false,
      status: "stale_partner_report_status",
      message: "The affiliate partner report status changed before the notification send preflight record was created.",
      redaction: summaryRedaction,
      currentPartnerReportStatus: partnerReport.status,
    };
  }

  if (payoutPreparationId !== payoutBatch.preparationId) {
    return {
      ok: false,
      status: "unsupported_payout_preparation",
      message: "The payout preparation record is not supported by this affiliate program.",
      redaction: summaryRedaction,
    };
  }

  if (payoutBatchId !== payoutBatch.id) {
    return {
      ok: false,
      status: "unsupported_payout_batch",
      message: "The payout batch record is not supported by this affiliate program.",
      redaction: summaryRedaction,
    };
  }

  if (expectedPayoutBatchStatus !== payoutBatch.status) {
    return {
      ok: false,
      status: "stale_payout_batch_status",
      message: "The payout batch status changed before the notification send preflight record was created.",
      redaction: summaryRedaction,
      currentPayoutBatchStatus: payoutBatch.status,
    };
  }

  if (expectedPayoutPreparationRecordStatus !== affiliatePayoutPreparationRecordStatus) {
    return {
      ok: false,
      status: "stale_payout_preparation_record_status",
      message: "The payout preparation record contract changed before the notification send preflight record was created.",
      redaction: summaryRedaction,
      currentPayoutPreparationRecordStatus: affiliatePayoutPreparationRecordStatus,
    };
  }

  if (expectedFraudReviewRecordStatus !== affiliateFraudReviewRecordStatus) {
    return {
      ok: false,
      status: "stale_fraud_review_record_status",
      message: "The fraud review record contract changed before the notification send preflight record was created.",
      redaction: summaryRedaction,
      currentFraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
    };
  }

  if (expectedNotificationReadinessRecordStatus !== affiliatePartnerNotificationReadinessRecordStatus) {
    return {
      ok: false,
      status: "stale_notification_readiness_record_status",
      message: "The partner notification readiness record contract changed before the notification send preflight record was created.",
      redaction: summaryRedaction,
      currentNotificationReadinessRecordStatus: affiliatePartnerNotificationReadinessRecordStatus,
    };
  }

  if (reviewFlagId !== reviewFlag.id) {
    return {
      ok: false,
      status: "unsupported_review_flag",
      message: "The affiliate review flag is not supported by this notification send preflight record.",
      redaction: summaryRedaction,
    };
  }

  if (
    expectedReviewFlagSeverity !== evidence.reviewFlagSeverity ||
    expectedLinkedLedgerCount !== evidence.linkedLedgerIds.length
  ) {
    return {
      ok: false,
      status: "stale_fraud_review_evidence",
      message: "The affiliate fraud review evidence changed before the notification send preflight record was created.",
      redaction: summaryRedaction,
      currentEvidence: evidence,
    };
  }

  const { db } = await getRuntime();
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(affiliatePartnerNotificationSendPreflightRecordConfirmationText);
  const metadata = JSON.stringify({
    sourceIssue: affiliatePartnerNotificationSendPreflightRecordIssue,
    partnerReportTitle: partnerReport.title,
    payoutPreparationRecordStatus: affiliatePayoutPreparationRecordStatus,
    fraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
    notificationReadinessRecordStatus: affiliatePartnerNotificationReadinessRecordStatus,
    reviewFlagTitle: reviewFlag.title,
    linkedLedgerIds: reviewFlag.linkedLedgerIds,
    sendPreflightChecklistIds: evidence.sendPreflightChecklist.map((item) => item.id),
  });

  const existing = await findRecordByIdempotency(db, idempotencyKey);
  if (existing) {
    const isReplay =
      existing.program_id === programId &&
      existing.affiliate_partner_report_id === affiliatePartnerReportId &&
      existing.affiliate_partner_id === affiliatePartnerId &&
      existing.payout_preparation_id === payoutPreparationId &&
      existing.payout_batch_id === payoutBatchId &&
      existing.review_flag_id === reviewFlagId &&
      existing.notification_send_preflight_disposition === notificationSendPreflightDisposition &&
      existing.expected_program_revision_id === expectedProgramRevisionId &&
      existing.expected_partner_report_status === expectedPartnerReportStatus &&
      existing.expected_payout_batch_status === expectedPayoutBatchStatus &&
      existing.expected_payout_preparation_record_status === expectedPayoutPreparationRecordStatus &&
      existing.expected_fraud_review_record_status === expectedFraudReviewRecordStatus &&
      existing.expected_notification_readiness_record_status === expectedNotificationReadinessRecordStatus &&
      existing.expected_review_flag_severity === expectedReviewFlagSeverity &&
      numberValue(existing.expected_linked_ledger_count) === expectedLinkedLedgerCount &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256;
    if (!isReplay) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "A different affiliate partner notification send preflight record already used this idempotency key.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "affiliate_partner_notification_send_preflight_replayed",
      duplicate: true,
      record: publicRecord(existing, true),
      redaction: summaryRedaction,
    };
  }

  const id = `affiliate-partner-notification-send-preflight-record-${Date.now()}-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO affiliate_partner_notification_send_preflight_records (
        id, program_id, affiliate_partner_report_id, affiliate_partner_id,
        payout_preparation_id, payout_batch_id, review_flag_id, record_kind,
        notification_send_preflight_disposition, expected_program_revision_id,
        expected_partner_report_status, expected_payout_batch_status,
        expected_payout_preparation_record_status, expected_fraud_review_record_status,
        expected_notification_readiness_record_status, expected_review_flag_severity,
        expected_linked_ledger_count, idempotency_key,
        actor_user_id, actor_email_hash, private_note_sha256, confirmation_text_sha256,
        owner_partner_notification_send_preflight_record_created, partner_notification_sent,
        notification_provider_called, notification_provider_send_enabled, queue_dispatch_created,
        send_payload_included, notification_body_included, recipient_email_included,
        provider_message_id_included, send_queue_rows_included,
        payable_commission_created, fraud_decision_enforced, stripe_payout_created,
        stripe_transfer_created, payout_account_stored, tax_data_collected, buyer_data_included,
        raw_ledger_rows_exposed, raw_click_rows_exposed, raw_checkout_rows_exposed,
        raw_actor_identity_included, private_fraud_signals_included,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      programId,
      affiliatePartnerReportId,
      affiliatePartnerId,
      payoutPreparationId,
      payoutBatchId,
      reviewFlagId,
      recordKind,
      notificationSendPreflightDisposition,
      expectedProgramRevisionId,
      expectedPartnerReportStatus,
      expectedPayoutBatchStatus,
      expectedPayoutPreparationRecordStatus,
      expectedFraudReviewRecordStatus,
      expectedNotificationReadinessRecordStatus,
      expectedReviewFlagSeverity,
      expectedLinkedLedgerCount,
      idempotencyKey,
      input.actor.userId,
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      metadata,
    )
    .run();

  const created = await findRecordByIdempotency(db, idempotencyKey);
  if (!created) {
    return {
      ok: false,
      status: "notification_send_preflight_record_not_created",
      message: "The affiliate partner notification send preflight record could not be loaded after creation.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "affiliate_partner_notification_send_preflight_recorded",
    duplicate: false,
    record: publicRecord(created, false),
    redaction: summaryRedaction,
  };
}
