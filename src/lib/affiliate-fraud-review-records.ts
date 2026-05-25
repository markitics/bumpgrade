import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/analytics-events";
import { affiliateProgram } from "@/lib/affiliate-referrals";

export const affiliateFraudReviewRecordIssue = 275;
export const affiliateFraudReviewRecordStatus = "owner-affiliate-fraud-review-records-ready";
export const affiliateFraudReviewRecordApiRoute = "/api/admin/affiliates/fraud-review-records";
export const affiliateFraudReviewRecordOwnerRoute = "/admin/affiliates";
export const affiliateFraudReviewRecordConfirmationText = "Record Bumpgrade affiliate fraud review evidence";
export const affiliateFraudEnforcementRecordIssue = 424;
export const affiliateFraudEnforcementRecordStatus = "owner-affiliate-fraud-enforcement-records-ready";
export const affiliateFraudEnforcementRecordApiRoute = "/api/admin/affiliates/fraud-enforcement-records";
export const affiliateFraudEnforcementRecordOwnerRoute = "/admin/affiliates";
export const affiliateFraudEnforcementRecordConfirmationText =
  "Record Bumpgrade affiliate fraud enforcement decision";

const recordKind = "owner_fraud_review_evidence";
const enforcementRecordKind = "owner_fraud_enforcement_decision";
const defaultReviewDisposition = "needs_more_review";
const supportedReviewDispositions = ["needs_more_review", "cleared_for_future_review", "reject_before_payout"] as const;
const defaultEnforcementDisposition = "hold_partner_payouts";
const supportedEnforcementDispositions = [
  "hold_partner_payouts",
  "clear_for_payout_review",
  "escalate_to_manual_review",
] as const;
const payoutBatch = affiliateProgram.payoutBatches[0];
const reviewFlag = affiliateProgram.reviewFlags[0];

type Runtime = {
  db: D1Database;
};

type ReviewDisposition = (typeof supportedReviewDispositions)[number];
type EnforcementDisposition = (typeof supportedEnforcementDispositions)[number];

type FraudReviewRecordCountRow = {
  fraud_review_records: number;
  owner_confirmed_records: number;
  owner_fraud_review_record_created_records: number;
  fraud_decision_enforced_records: number;
  payable_commission_created_records: number;
  stripe_payout_created_records: number;
  stripe_transfer_created_records: number;
  payout_account_stored_records: number;
  tax_data_collected_records: number;
  partner_notification_sent_records: number;
  buyer_data_included_records: number;
  raw_ledger_rows_exposed_records: number;
  raw_click_rows_exposed_records: number;
  raw_checkout_rows_exposed_records: number;
  raw_actor_identity_included_records: number;
  private_fraud_signals_included_records: number;
};

type FraudReviewRecordRow = {
  id: string;
  program_id: string;
  review_flag_id: string;
  payout_preparation_id: string;
  payout_batch_id: string;
  record_kind: string;
  review_disposition: string;
  expected_program_revision_id: string;
  expected_payout_batch_status: string;
  expected_flag_severity: typeof reviewFlag.severity;
  expected_linked_ledger_count: number;
  idempotency_key: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  owner_fraud_review_record_created: number;
  fraud_decision_enforced: number;
  payable_commission_created: number;
  stripe_payout_created: number;
  stripe_transfer_created: number;
  payout_account_stored: number;
  tax_data_collected: number;
  partner_notification_sent: number;
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

export type AffiliateFraudReviewEvidence = {
  programId: string;
  programRevisionId: string;
  reviewFlagId: string;
  reviewFlagTitle: string;
  reviewFlagSeverity: typeof reviewFlag.severity;
  requiredAction: string;
  linkedLedgerIds: string[];
  payoutPreparationId: string;
  payoutBatchId: string;
  payoutBatchStatus: string;
  supportedReviewDispositions: readonly ReviewDisposition[];
  defaultReviewDisposition: ReviewDisposition;
  ownerRecordAllowed: true;
  fraudDecisionEnforced: false;
  payableCommissionCreated: false;
  stripePayoutCreated: false;
  stripeTransferCreated: false;
  payoutAccountStored: false;
  taxDataCollected: false;
  partnerNotificationSent: false;
  buyerDataIncluded: false;
  rawLedgerRowsExposed: false;
  rawClickRowsExposed: false;
  rawCheckoutRowsExposed: false;
  rawActorIdentityIncluded: false;
  privateFraudSignalsIncluded: false;
};

export type AffiliateFraudReviewRecordPublic = {
  id: string;
  programId: string;
  reviewFlagId: string;
  payoutPreparationId: string;
  payoutBatchId: string;
  recordKind: typeof recordKind;
  reviewDisposition: ReviewDisposition;
  expectedPayoutBatchStatus: string;
  expectedFlagSeverity: typeof reviewFlag.severity;
  expectedLinkedLedgerCount: number;
  privateNoteRecorded: boolean;
  ownerFraudReviewRecordCreated: true;
  fraudDecisionEnforced: false;
  payableCommissionCreated: false;
  stripePayoutCreated: false;
  stripeTransferCreated: false;
  payoutAccountStored: false;
  taxDataCollected: false;
  partnerNotificationSent: false;
  buyerDataIncluded: false;
  rawLedgerRowsExposed: false;
  rawClickRowsExposed: false;
  rawCheckoutRowsExposed: false;
  rawActorIdentityIncluded: false;
  privateFraudSignalsIncluded: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type AffiliateFraudReviewRecordSummary = {
  id: "affiliate-fraud-review-record-contract";
  status: typeof affiliateFraudReviewRecordStatus;
  issue: typeof affiliateFraudReviewRecordIssue;
  parentIssue: 19;
  apiRoute: typeof affiliateFraudReviewRecordApiRoute;
  ownerRoute: typeof affiliateFraudReviewRecordOwnerRoute;
  sourceDataRoute: "/affiliates/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof affiliateFraudReviewRecordConfirmationText;
  };
  currentEvidence: AffiliateFraudReviewEvidence;
  counts: {
    fraudReviewRecords: number;
    ownerConfirmedRecords: number;
    ownerFraudReviewRecordCreatedRecords: number;
    fraudDecisionEnforcedRecords: number;
    payableCommissionCreatedRecords: number;
    stripePayoutCreatedRecords: number;
    stripeTransferCreatedRecords: number;
    payoutAccountStoredRecords: number;
    taxDataCollectedRecords: number;
    partnerNotificationSentRecords: number;
    buyerDataIncludedRecords: number;
    rawLedgerRowsExposedRecords: number;
    rawClickRowsExposedRecords: number;
    rawCheckoutRowsExposedRecords: number;
    rawActorIdentityIncludedRecords: number;
    privateFraudSignalsIncludedRecords: number;
  };
  latestRecords: AffiliateFraudReviewRecordPublic[];
  redaction: {
    privateDataIncluded: false;
    buyerDataIncluded: false;
    rawLedgerRowsIncluded: false;
    rawClickRowsIncluded: false;
    rawCheckoutRowsIncluded: false;
    rawActorIdentityIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    privateFraudSignalsIncluded: false;
    payoutAccountIncluded: false;
    taxDataIncluded: false;
    stripeIdsIncluded: false;
    partnerNotificationIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AffiliateFraudEnforcementEvidence = {
  programId: string;
  programRevisionId: string;
  reviewFlagId: string;
  reviewFlagTitle: string;
  reviewFlagSeverity: typeof reviewFlag.severity;
  requiredAction: string;
  linkedLedgerIds: string[];
  payoutPreparationId: string;
  payoutBatchId: string;
  payoutBatchStatus: typeof payoutBatch.status;
  fraudReviewRecordStatus: typeof affiliateFraudReviewRecordStatus;
  supportedEnforcementDispositions: readonly EnforcementDisposition[];
  defaultEnforcementDisposition: EnforcementDisposition;
  ownerRecordAllowed: true;
  fraudDecisionEnforced: true;
  payableCommissionCreated: false;
  stripePayoutCreated: false;
  stripeTransferCreated: false;
  payoutAccountStored: false;
  taxDataCollected: false;
  partnerNotificationSent: false;
  buyerDataIncluded: false;
  rawLedgerRowsExposed: false;
  rawClickRowsExposed: false;
  rawCheckoutRowsExposed: false;
  rawActorIdentityIncluded: false;
  privateFraudSignalsIncluded: false;
};

export type AffiliateFraudEnforcementRecordPublic = {
  id: string;
  programId: string;
  reviewFlagId: string;
  payoutPreparationId: string;
  payoutBatchId: string;
  recordKind: typeof enforcementRecordKind;
  enforcementDisposition: EnforcementDisposition;
  expectedPayoutBatchStatus: string;
  expectedFraudReviewRecordStatus: typeof affiliateFraudReviewRecordStatus;
  expectedFlagSeverity: typeof reviewFlag.severity;
  expectedLinkedLedgerCount: number;
  privateNoteRecorded: boolean;
  ownerFraudEnforcementRecordCreated: true;
  fraudDecisionEnforced: true;
  payableCommissionCreated: false;
  stripePayoutCreated: false;
  stripeTransferCreated: false;
  payoutAccountStored: false;
  taxDataCollected: false;
  partnerNotificationSent: false;
  buyerDataIncluded: false;
  rawLedgerRowsExposed: false;
  rawClickRowsExposed: false;
  rawCheckoutRowsExposed: false;
  rawActorIdentityIncluded: false;
  privateFraudSignalsIncluded: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type AffiliateFraudEnforcementRecordSummary = {
  id: "affiliate-fraud-enforcement-record-contract";
  status: typeof affiliateFraudEnforcementRecordStatus;
  issue: typeof affiliateFraudEnforcementRecordIssue;
  parentIssue: 424;
  apiRoute: typeof affiliateFraudEnforcementRecordApiRoute;
  ownerRoute: typeof affiliateFraudEnforcementRecordOwnerRoute;
  sourceDataRoute: "/affiliates/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof affiliateFraudEnforcementRecordConfirmationText;
  };
  currentEvidence: AffiliateFraudEnforcementEvidence;
  counts: {
    fraudEnforcementRecords: number;
    ownerConfirmedRecords: number;
    ownerFraudEnforcementRecordCreatedRecords: number;
    fraudDecisionEnforcedRecords: number;
    payableCommissionCreatedRecords: number;
    stripePayoutCreatedRecords: number;
    stripeTransferCreatedRecords: number;
    payoutAccountStoredRecords: number;
    taxDataCollectedRecords: number;
    partnerNotificationSentRecords: number;
    buyerDataIncludedRecords: number;
    rawLedgerRowsExposedRecords: number;
    rawClickRowsExposedRecords: number;
    rawCheckoutRowsExposedRecords: number;
    rawActorIdentityIncludedRecords: number;
    privateFraudSignalsIncludedRecords: number;
  };
  latestRecords: AffiliateFraudEnforcementRecordPublic[];
  redaction: AffiliateFraudReviewRecordSummary["redaction"];
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateFraudReviewRecordInput = {
  programId?: unknown;
  reviewFlagId?: unknown;
  payoutPreparationId?: unknown;
  payoutBatchId?: unknown;
  reviewDisposition?: unknown;
  expectedProgramRevisionId?: unknown;
  expectedPayoutBatchStatus?: unknown;
  expectedFlagSeverity?: unknown;
  expectedLinkedLedgerCount?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateFraudEnforcementRecordInput = {
  programId?: unknown;
  reviewFlagId?: unknown;
  payoutPreparationId?: unknown;
  payoutBatchId?: unknown;
  enforcementDisposition?: unknown;
  expectedProgramRevisionId?: unknown;
  expectedPayoutBatchStatus?: unknown;
  expectedFraudReviewRecordStatus?: unknown;
  expectedFlagSeverity?: unknown;
  expectedLinkedLedgerCount?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateFraudReviewRecordResult =
  | {
      ok: true;
      status: "affiliate_fraud_review_recorded" | "affiliate_fraud_review_replayed";
      duplicate: boolean;
      record: AffiliateFraudReviewRecordPublic;
      redaction: AffiliateFraudReviewRecordSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_review_flag"
        | "unsupported_payout_preparation"
        | "unsupported_payout_batch"
        | "unsupported_review_disposition"
        | "confirmation_required"
        | "stale_program_revision"
        | "stale_payout_batch_status"
        | "stale_fraud_review_evidence"
        | "idempotency_conflict"
        | "fraud_review_record_not_created";
      message: string;
      redaction: AffiliateFraudReviewRecordSummary["redaction"];
      currentProgramRevisionId?: string;
      currentPayoutBatchStatus?: string;
      currentEvidence?: AffiliateFraudReviewEvidence;
    };

type CreateFraudEnforcementRecordResult =
  | {
      ok: true;
      status: "affiliate_fraud_enforcement_recorded" | "affiliate_fraud_enforcement_replayed";
      duplicate: boolean;
      record: AffiliateFraudEnforcementRecordPublic;
      redaction: AffiliateFraudEnforcementRecordSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_review_flag"
        | "unsupported_payout_preparation"
        | "unsupported_payout_batch"
        | "unsupported_enforcement_disposition"
        | "confirmation_required"
        | "stale_program_revision"
        | "stale_payout_batch_status"
        | "stale_fraud_review_record_status"
        | "stale_fraud_enforcement_evidence"
        | "idempotency_conflict"
        | "fraud_enforcement_record_not_created";
      message: string;
      redaction: AffiliateFraudEnforcementRecordSummary["redaction"];
      currentProgramRevisionId?: string;
      currentPayoutBatchStatus?: string;
      currentFraudReviewRecordStatus?: string;
      currentEvidence?: AffiliateFraudEnforcementEvidence;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function redaction(): AffiliateFraudReviewRecordSummary["redaction"] {
  return {
    privateDataIncluded: false,
    buyerDataIncluded: false,
    rawLedgerRowsIncluded: false,
    rawClickRowsIncluded: false,
    rawCheckoutRowsIncluded: false,
    rawActorIdentityIncluded: false,
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    privateNoteIncluded: false,
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

function parseReviewDisposition(value: unknown) {
  const parsed = parseString(value, 80);
  return supportedReviewDispositions.find((disposition) => disposition === parsed) ?? null;
}

function parseEnforcementDisposition(value: unknown) {
  const parsed = parseString(value, 80);
  return supportedEnforcementDispositions.find((disposition) => disposition === parsed) ?? null;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function currentEvidence(): AffiliateFraudReviewEvidence {
  return {
    programId: affiliateProgram.id,
    programRevisionId: affiliateProgram.revisionId,
    reviewFlagId: reviewFlag.id,
    reviewFlagTitle: reviewFlag.title,
    reviewFlagSeverity: reviewFlag.severity,
    requiredAction: reviewFlag.requiredAction,
    linkedLedgerIds: reviewFlag.linkedLedgerIds,
    payoutPreparationId: payoutBatch.preparationId,
    payoutBatchId: payoutBatch.id,
    payoutBatchStatus: payoutBatch.status,
    supportedReviewDispositions,
    defaultReviewDisposition,
    ownerRecordAllowed: true,
    fraudDecisionEnforced: false,
    payableCommissionCreated: false,
    stripePayoutCreated: false,
    stripeTransferCreated: false,
    payoutAccountStored: false,
    taxDataCollected: false,
    partnerNotificationSent: false,
    buyerDataIncluded: false,
    rawLedgerRowsExposed: false,
    rawClickRowsExposed: false,
    rawCheckoutRowsExposed: false,
    rawActorIdentityIncluded: false,
    privateFraudSignalsIncluded: false,
  };
}

function currentEnforcementEvidence(): AffiliateFraudEnforcementEvidence {
  return {
    programId: affiliateProgram.id,
    programRevisionId: affiliateProgram.revisionId,
    reviewFlagId: reviewFlag.id,
    reviewFlagTitle: reviewFlag.title,
    reviewFlagSeverity: reviewFlag.severity,
    requiredAction: reviewFlag.requiredAction,
    linkedLedgerIds: reviewFlag.linkedLedgerIds,
    payoutPreparationId: payoutBatch.preparationId,
    payoutBatchId: payoutBatch.id,
    payoutBatchStatus: payoutBatch.status,
    fraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
    supportedEnforcementDispositions,
    defaultEnforcementDisposition,
    ownerRecordAllowed: true,
    fraudDecisionEnforced: true,
    payableCommissionCreated: false,
    stripePayoutCreated: false,
    stripeTransferCreated: false,
    payoutAccountStored: false,
    taxDataCollected: false,
    partnerNotificationSent: false,
    buyerDataIncluded: false,
    rawLedgerRowsExposed: false,
    rawClickRowsExposed: false,
    rawCheckoutRowsExposed: false,
    rawActorIdentityIncluded: false,
    privateFraudSignalsIncluded: false,
  };
}

function emptyCounts(): AffiliateFraudReviewRecordSummary["counts"] {
  return {
    fraudReviewRecords: 0,
    ownerConfirmedRecords: 0,
    ownerFraudReviewRecordCreatedRecords: 0,
    fraudDecisionEnforcedRecords: 0,
    payableCommissionCreatedRecords: 0,
    stripePayoutCreatedRecords: 0,
    stripeTransferCreatedRecords: 0,
    payoutAccountStoredRecords: 0,
    taxDataCollectedRecords: 0,
    partnerNotificationSentRecords: 0,
    buyerDataIncludedRecords: 0,
    rawLedgerRowsExposedRecords: 0,
    rawClickRowsExposedRecords: 0,
    rawCheckoutRowsExposedRecords: 0,
    rawActorIdentityIncludedRecords: 0,
    privateFraudSignalsIncludedRecords: 0,
  };
}

function emptyEnforcementCounts(): AffiliateFraudEnforcementRecordSummary["counts"] {
  return {
    fraudEnforcementRecords: 0,
    ownerConfirmedRecords: 0,
    ownerFraudEnforcementRecordCreatedRecords: 0,
    fraudDecisionEnforcedRecords: 0,
    payableCommissionCreatedRecords: 0,
    stripePayoutCreatedRecords: 0,
    stripeTransferCreatedRecords: 0,
    payoutAccountStoredRecords: 0,
    taxDataCollectedRecords: 0,
    partnerNotificationSentRecords: 0,
    buyerDataIncludedRecords: 0,
    rawLedgerRowsExposedRecords: 0,
    rawClickRowsExposedRecords: 0,
    rawCheckoutRowsExposedRecords: 0,
    rawActorIdentityIncludedRecords: 0,
    privateFraudSignalsIncludedRecords: 0,
  };
}

function emptySummary(
  source: AffiliateFraudReviewRecordSummary["source"],
  loadError: string | null,
): AffiliateFraudReviewRecordSummary {
  return {
    id: "affiliate-fraud-review-record-contract",
    status: affiliateFraudReviewRecordStatus,
    issue: affiliateFraudReviewRecordIssue,
    parentIssue: 19,
    apiRoute: affiliateFraudReviewRecordApiRoute,
    ownerRoute: affiliateFraudReviewRecordOwnerRoute,
    sourceDataRoute: "/affiliates/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: affiliateFraudReviewRecordConfirmationText,
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
      "buyerData",
      "rawLedgerRows",
      "rawClickRows",
      "rawCheckoutRows",
      "privateFraudSignals",
      "payoutAccount",
      "taxData",
      "stripePayoutId",
      "stripeTransferId",
      "partnerNotificationBody",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #275 lets verified owners record redacted affiliate fraud-review evidence after exact confirmation, idempotency, program revision checks, payout batch status checks, and review-flag evidence checks. It creates owner-visible fraud review evidence only; it does not enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, or accept direct public agent affiliate writes.",
  };
}

function emptyEnforcementSummary(
  source: AffiliateFraudEnforcementRecordSummary["source"],
  loadError: string | null,
): AffiliateFraudEnforcementRecordSummary {
  return {
    id: "affiliate-fraud-enforcement-record-contract",
    status: affiliateFraudEnforcementRecordStatus,
    issue: affiliateFraudEnforcementRecordIssue,
    parentIssue: 424,
    apiRoute: affiliateFraudEnforcementRecordApiRoute,
    ownerRoute: affiliateFraudEnforcementRecordOwnerRoute,
    sourceDataRoute: "/affiliates/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: affiliateFraudEnforcementRecordConfirmationText,
    },
    currentEvidence: currentEnforcementEvidence(),
    counts: emptyEnforcementCounts(),
    latestRecords: [],
    redaction: redaction(),
    privateFieldsExcluded: [
      "actorEmail",
      "actorEmailHash",
      "privateNote",
      "privateNoteSha256",
      "buyerData",
      "rawLedgerRows",
      "rawClickRows",
      "rawCheckoutRows",
      "privateFraudSignals",
      "payoutAccount",
      "taxData",
      "stripePayoutId",
      "stripeTransferId",
      "partnerNotificationBody",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #424 lets verified owners record redacted affiliate fraud enforcement decisions after exact confirmation, idempotency, program revision checks, payout batch status checks, fraud review record status checks, and review-flag evidence checks. It creates owner-visible fraud enforcement evidence only; it does not create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or allow direct public agent affiliate writes.",
  };
}

function publicRecord(row: FraudReviewRecordRow, duplicate = false): AffiliateFraudReviewRecordPublic {
  return {
    id: row.id,
    programId: row.program_id,
    reviewFlagId: row.review_flag_id,
    payoutPreparationId: row.payout_preparation_id,
    payoutBatchId: row.payout_batch_id,
    recordKind,
    reviewDisposition: row.review_disposition as ReviewDisposition,
    expectedPayoutBatchStatus: row.expected_payout_batch_status,
    expectedFlagSeverity: row.expected_flag_severity,
    expectedLinkedLedgerCount: numberValue(row.expected_linked_ledger_count),
    privateNoteRecorded: Boolean(row.private_note_sha256),
    ownerFraudReviewRecordCreated: true,
    fraudDecisionEnforced: false,
    payableCommissionCreated: false,
    stripePayoutCreated: false,
    stripeTransferCreated: false,
    payoutAccountStored: false,
    taxDataCollected: false,
    partnerNotificationSent: false,
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

function publicEnforcementRecord(row: FraudReviewRecordRow, duplicate = false): AffiliateFraudEnforcementRecordPublic {
  return {
    id: row.id,
    programId: row.program_id,
    reviewFlagId: row.review_flag_id,
    payoutPreparationId: row.payout_preparation_id,
    payoutBatchId: row.payout_batch_id,
    recordKind: enforcementRecordKind,
    enforcementDisposition: row.review_disposition as EnforcementDisposition,
    expectedPayoutBatchStatus: row.expected_payout_batch_status,
    expectedFraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
    expectedFlagSeverity: row.expected_flag_severity,
    expectedLinkedLedgerCount: numberValue(row.expected_linked_ledger_count),
    privateNoteRecorded: Boolean(row.private_note_sha256),
    ownerFraudEnforcementRecordCreated: true,
    fraudDecisionEnforced: true,
    payableCommissionCreated: false,
    stripePayoutCreated: false,
    stripeTransferCreated: false,
    payoutAccountStored: false,
    taxDataCollected: false,
    partnerNotificationSent: false,
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
       FROM affiliate_fraud_review_records
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<FraudReviewRecordRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS fraud_review_records,
        SUM(CASE WHEN confirmation_text_sha256 IS NOT NULL THEN 1 ELSE 0 END) AS owner_confirmed_records,
        SUM(owner_fraud_review_record_created) AS owner_fraud_review_record_created_records,
        SUM(fraud_decision_enforced) AS fraud_decision_enforced_records,
        SUM(payable_commission_created) AS payable_commission_created_records,
        SUM(stripe_payout_created) AS stripe_payout_created_records,
        SUM(stripe_transfer_created) AS stripe_transfer_created_records,
        SUM(payout_account_stored) AS payout_account_stored_records,
        SUM(tax_data_collected) AS tax_data_collected_records,
        SUM(partner_notification_sent) AS partner_notification_sent_records,
        SUM(buyer_data_included) AS buyer_data_included_records,
        SUM(raw_ledger_rows_exposed) AS raw_ledger_rows_exposed_records,
        SUM(raw_click_rows_exposed) AS raw_click_rows_exposed_records,
       SUM(raw_checkout_rows_exposed) AS raw_checkout_rows_exposed_records,
       SUM(raw_actor_identity_included) AS raw_actor_identity_included_records,
       SUM(private_fraud_signals_included) AS private_fraud_signals_included_records
       FROM affiliate_fraud_review_records
       WHERE record_kind = ?`,
    )
    .bind(recordKind)
    .first<FraudReviewRecordCountRow>();

  return {
    fraudReviewRecords: numberValue(row?.fraud_review_records),
    ownerConfirmedRecords: numberValue(row?.owner_confirmed_records),
    ownerFraudReviewRecordCreatedRecords: numberValue(row?.owner_fraud_review_record_created_records),
    fraudDecisionEnforcedRecords: numberValue(row?.fraud_decision_enforced_records),
    payableCommissionCreatedRecords: numberValue(row?.payable_commission_created_records),
    stripePayoutCreatedRecords: numberValue(row?.stripe_payout_created_records),
    stripeTransferCreatedRecords: numberValue(row?.stripe_transfer_created_records),
    payoutAccountStoredRecords: numberValue(row?.payout_account_stored_records),
    taxDataCollectedRecords: numberValue(row?.tax_data_collected_records),
    partnerNotificationSentRecords: numberValue(row?.partner_notification_sent_records),
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
       FROM affiliate_fraud_review_records
       WHERE record_kind = ?
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .bind(recordKind)
    .all<FraudReviewRecordRow>();
  return (result.results ?? []).map((row) => publicRecord(row, false));
}

async function loadEnforcementCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS fraud_review_records,
        SUM(CASE WHEN confirmation_text_sha256 IS NOT NULL THEN 1 ELSE 0 END) AS owner_confirmed_records,
        SUM(owner_fraud_review_record_created) AS owner_fraud_review_record_created_records,
        SUM(fraud_decision_enforced) AS fraud_decision_enforced_records,
        SUM(payable_commission_created) AS payable_commission_created_records,
        SUM(stripe_payout_created) AS stripe_payout_created_records,
        SUM(stripe_transfer_created) AS stripe_transfer_created_records,
        SUM(payout_account_stored) AS payout_account_stored_records,
        SUM(tax_data_collected) AS tax_data_collected_records,
        SUM(partner_notification_sent) AS partner_notification_sent_records,
        SUM(buyer_data_included) AS buyer_data_included_records,
        SUM(raw_ledger_rows_exposed) AS raw_ledger_rows_exposed_records,
        SUM(raw_click_rows_exposed) AS raw_click_rows_exposed_records,
        SUM(raw_checkout_rows_exposed) AS raw_checkout_rows_exposed_records,
        SUM(raw_actor_identity_included) AS raw_actor_identity_included_records,
        SUM(private_fraud_signals_included) AS private_fraud_signals_included_records
       FROM affiliate_fraud_review_records
       WHERE record_kind = ?`,
    )
    .bind(enforcementRecordKind)
    .first<FraudReviewRecordCountRow>();

  return {
    fraudEnforcementRecords: numberValue(row?.fraud_review_records),
    ownerConfirmedRecords: numberValue(row?.owner_confirmed_records),
    ownerFraudEnforcementRecordCreatedRecords: numberValue(row?.fraud_decision_enforced_records),
    fraudDecisionEnforcedRecords: numberValue(row?.fraud_decision_enforced_records),
    payableCommissionCreatedRecords: numberValue(row?.payable_commission_created_records),
    stripePayoutCreatedRecords: numberValue(row?.stripe_payout_created_records),
    stripeTransferCreatedRecords: numberValue(row?.stripe_transfer_created_records),
    payoutAccountStoredRecords: numberValue(row?.payout_account_stored_records),
    taxDataCollectedRecords: numberValue(row?.tax_data_collected_records),
    partnerNotificationSentRecords: numberValue(row?.partner_notification_sent_records),
    buyerDataIncludedRecords: numberValue(row?.buyer_data_included_records),
    rawLedgerRowsExposedRecords: numberValue(row?.raw_ledger_rows_exposed_records),
    rawClickRowsExposedRecords: numberValue(row?.raw_click_rows_exposed_records),
    rawCheckoutRowsExposedRecords: numberValue(row?.raw_checkout_rows_exposed_records),
    rawActorIdentityIncludedRecords: numberValue(row?.raw_actor_identity_included_records),
    privateFraudSignalsIncludedRecords: numberValue(row?.private_fraud_signals_included_records),
  };
}

async function loadLatestEnforcementRecords(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM affiliate_fraud_review_records
       WHERE record_kind = ?
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .bind(enforcementRecordKind)
    .all<FraudReviewRecordRow>();
  return (result.results ?? []).map((row) => publicEnforcementRecord(row, false));
}

export async function getAffiliateFraudReviewRecordSummary(
  dbInput?: D1Database,
): Promise<AffiliateFraudReviewRecordSummary> {
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
      error instanceof Error ? error.message : "Unable to load affiliate fraud review records.",
    );
  }
}

export async function getAffiliateFraudEnforcementRecordSummary(
  dbInput?: D1Database,
): Promise<AffiliateFraudEnforcementRecordSummary> {
  try {
    const db = dbInput ?? (await getRuntime()).db;
    return {
      ...emptyEnforcementSummary("d1", null),
      counts: await loadEnforcementCounts(db),
      latestRecords: await loadLatestEnforcementRecords(db),
    };
  } catch (error) {
    return emptyEnforcementSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load affiliate fraud enforcement records.",
    );
  }
}

export async function createAffiliateFraudReviewRecord(
  input: CreateFraudReviewRecordInput,
): Promise<CreateFraudReviewRecordResult> {
  const summaryRedaction = redaction();
  const programId = parseString(input.programId);
  const reviewFlagId = parseString(input.reviewFlagId);
  const payoutPreparationId = parseString(input.payoutPreparationId);
  const payoutBatchId = parseString(input.payoutBatchId);
  const reviewDisposition = parseReviewDisposition(input.reviewDisposition);
  const expectedProgramRevisionId = parseString(input.expectedProgramRevisionId);
  const expectedPayoutBatchStatus = parseString(input.expectedPayoutBatchStatus);
  const expectedFlagSeverity = parseString(input.expectedFlagSeverity);
  const expectedLinkedLedgerCount = parseInteger(input.expectedLinkedLedgerCount);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;
  const evidence = currentEvidence();

  if (
    !programId ||
    !reviewFlagId ||
    !payoutPreparationId ||
    !payoutBatchId ||
    !expectedProgramRevisionId ||
    !expectedPayoutBatchStatus ||
    !expectedFlagSeverity ||
    expectedLinkedLedgerCount === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Program, review flag, payout preparation, payout batch, expected revision/status/severity, linked ledger count, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (!reviewDisposition) {
    return {
      ok: false,
      status: "unsupported_review_disposition",
      message: "A supported affiliate fraud review disposition is required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== affiliateFraudReviewRecordConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording affiliate fraud review evidence.",
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
      message: "The affiliate program revision changed before the fraud review record was created.",
      redaction: summaryRedaction,
      currentProgramRevisionId: affiliateProgram.revisionId,
    };
  }

  if (reviewFlagId !== reviewFlag.id) {
    return {
      ok: false,
      status: "unsupported_review_flag",
      message: "The affiliate review flag is not supported by this affiliate program.",
      redaction: summaryRedaction,
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
      message: "The payout batch status changed before the fraud review record was created.",
      redaction: summaryRedaction,
      currentPayoutBatchStatus: payoutBatch.status,
    };
  }

  if (
    expectedFlagSeverity !== evidence.reviewFlagSeverity ||
    expectedLinkedLedgerCount !== evidence.linkedLedgerIds.length
  ) {
    return {
      ok: false,
      status: "stale_fraud_review_evidence",
      message: "The affiliate fraud review evidence changed before the record was created.",
      redaction: summaryRedaction,
      currentEvidence: evidence,
    };
  }

  const { db } = await getRuntime();
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(affiliateFraudReviewRecordConfirmationText);
  const metadata = JSON.stringify({
    sourceIssue: affiliateFraudReviewRecordIssue,
    reviewFlagTitle: reviewFlag.title,
    requiredAction: reviewFlag.requiredAction,
    linkedLedgerIds: reviewFlag.linkedLedgerIds,
  });

  const existing = await findRecordByIdempotency(db, idempotencyKey);
  if (existing) {
    const isReplay =
      existing.record_kind === recordKind &&
      existing.program_id === programId &&
      existing.review_flag_id === reviewFlagId &&
      existing.payout_preparation_id === payoutPreparationId &&
      existing.payout_batch_id === payoutBatchId &&
      existing.review_disposition === reviewDisposition &&
      existing.expected_program_revision_id === expectedProgramRevisionId &&
      existing.expected_payout_batch_status === expectedPayoutBatchStatus &&
      existing.expected_flag_severity === expectedFlagSeverity &&
      numberValue(existing.expected_linked_ledger_count) === expectedLinkedLedgerCount &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256;
    if (!isReplay) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "A different affiliate fraud review record already used this idempotency key.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "affiliate_fraud_review_replayed",
      duplicate: true,
      record: publicRecord(existing, true),
      redaction: summaryRedaction,
    };
  }

  const id = `affiliate-fraud-review-record-${Date.now()}-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO affiliate_fraud_review_records (
        id, program_id, review_flag_id, payout_preparation_id, payout_batch_id, record_kind,
        review_disposition, expected_program_revision_id, expected_payout_batch_status,
        expected_flag_severity, expected_linked_ledger_count, idempotency_key, actor_user_id,
        actor_email_hash, private_note_sha256, confirmation_text_sha256,
        owner_fraud_review_record_created, fraud_decision_enforced, payable_commission_created,
        stripe_payout_created, stripe_transfer_created, payout_account_stored, tax_data_collected,
        partner_notification_sent, buyer_data_included, raw_ledger_rows_exposed, raw_click_rows_exposed,
        raw_checkout_rows_exposed, raw_actor_identity_included, private_fraud_signals_included,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      programId,
      reviewFlagId,
      payoutPreparationId,
      payoutBatchId,
      recordKind,
      reviewDisposition,
      expectedProgramRevisionId,
      expectedPayoutBatchStatus,
      expectedFlagSeverity,
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
      status: "fraud_review_record_not_created",
      message: "The affiliate fraud review record could not be loaded after creation.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "affiliate_fraud_review_recorded",
    duplicate: false,
    record: publicRecord(created, false),
    redaction: summaryRedaction,
  };
}

export async function createAffiliateFraudEnforcementRecord(
  input: CreateFraudEnforcementRecordInput,
): Promise<CreateFraudEnforcementRecordResult> {
  const summaryRedaction = redaction();
  const programId = parseString(input.programId);
  const reviewFlagId = parseString(input.reviewFlagId);
  const payoutPreparationId = parseString(input.payoutPreparationId);
  const payoutBatchId = parseString(input.payoutBatchId);
  const enforcementDisposition = parseEnforcementDisposition(input.enforcementDisposition);
  const expectedProgramRevisionId = parseString(input.expectedProgramRevisionId);
  const expectedPayoutBatchStatus = parseString(input.expectedPayoutBatchStatus);
  const expectedFraudReviewRecordStatus = parseString(input.expectedFraudReviewRecordStatus);
  const expectedFlagSeverity = parseString(input.expectedFlagSeverity);
  const expectedLinkedLedgerCount = parseInteger(input.expectedLinkedLedgerCount);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;
  const evidence = currentEnforcementEvidence();

  if (
    !programId ||
    !reviewFlagId ||
    !payoutPreparationId ||
    !payoutBatchId ||
    !expectedProgramRevisionId ||
    !expectedPayoutBatchStatus ||
    !expectedFraudReviewRecordStatus ||
    !expectedFlagSeverity ||
    expectedLinkedLedgerCount === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Program, review flag, payout preparation, payout batch, expected revision/status/fraud-review status/severity, linked ledger count, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (!enforcementDisposition) {
    return {
      ok: false,
      status: "unsupported_enforcement_disposition",
      message: "A supported affiliate fraud enforcement disposition is required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== affiliateFraudEnforcementRecordConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording affiliate fraud enforcement.",
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
      message: "The affiliate program revision changed before the fraud enforcement record was created.",
      redaction: summaryRedaction,
      currentProgramRevisionId: affiliateProgram.revisionId,
    };
  }

  if (reviewFlagId !== reviewFlag.id) {
    return {
      ok: false,
      status: "unsupported_review_flag",
      message: "The affiliate review flag is not supported by this affiliate program.",
      redaction: summaryRedaction,
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
      message: "The payout batch status changed before the fraud enforcement record was created.",
      redaction: summaryRedaction,
      currentPayoutBatchStatus: payoutBatch.status,
    };
  }

  if (expectedFraudReviewRecordStatus !== affiliateFraudReviewRecordStatus) {
    return {
      ok: false,
      status: "stale_fraud_review_record_status",
      message: "The affiliate fraud review contract changed before enforcement was recorded.",
      redaction: summaryRedaction,
      currentFraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
    };
  }

  if (
    expectedFlagSeverity !== evidence.reviewFlagSeverity ||
    expectedLinkedLedgerCount !== evidence.linkedLedgerIds.length
  ) {
    return {
      ok: false,
      status: "stale_fraud_enforcement_evidence",
      message: "The affiliate fraud enforcement evidence changed before the record was created.",
      redaction: summaryRedaction,
      currentEvidence: evidence,
    };
  }

  const { db } = await getRuntime();
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(affiliateFraudEnforcementRecordConfirmationText);
  const metadata = JSON.stringify({
    sourceIssue: affiliateFraudEnforcementRecordIssue,
    reviewFlagTitle: reviewFlag.title,
    requiredAction: reviewFlag.requiredAction,
    linkedLedgerIds: reviewFlag.linkedLedgerIds,
    fraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
  });

  const existing = await findRecordByIdempotency(db, idempotencyKey);
  if (existing) {
    const isReplay =
      existing.record_kind === enforcementRecordKind &&
      existing.program_id === programId &&
      existing.review_flag_id === reviewFlagId &&
      existing.payout_preparation_id === payoutPreparationId &&
      existing.payout_batch_id === payoutBatchId &&
      existing.review_disposition === enforcementDisposition &&
      existing.expected_program_revision_id === expectedProgramRevisionId &&
      existing.expected_payout_batch_status === expectedPayoutBatchStatus &&
      existing.expected_flag_severity === expectedFlagSeverity &&
      numberValue(existing.expected_linked_ledger_count) === expectedLinkedLedgerCount &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256 &&
      Boolean(existing.fraud_decision_enforced);
    if (!isReplay) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "A different affiliate fraud enforcement record already used this idempotency key.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "affiliate_fraud_enforcement_replayed",
      duplicate: true,
      record: publicEnforcementRecord(existing, true),
      redaction: summaryRedaction,
    };
  }

  const id = `affiliate-fraud-enforcement-record-${Date.now()}-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO affiliate_fraud_review_records (
        id, program_id, review_flag_id, payout_preparation_id, payout_batch_id, record_kind,
        review_disposition, expected_program_revision_id, expected_payout_batch_status,
        expected_flag_severity, expected_linked_ledger_count, idempotency_key, actor_user_id,
        actor_email_hash, private_note_sha256, confirmation_text_sha256,
        owner_fraud_review_record_created, fraud_decision_enforced, payable_commission_created,
        stripe_payout_created, stripe_transfer_created, payout_account_stored, tax_data_collected,
        partner_notification_sent, buyer_data_included, raw_ledger_rows_exposed, raw_click_rows_exposed,
        raw_checkout_rows_exposed, raw_actor_identity_included, private_fraud_signals_included,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      programId,
      reviewFlagId,
      payoutPreparationId,
      payoutBatchId,
      enforcementRecordKind,
      enforcementDisposition,
      expectedProgramRevisionId,
      expectedPayoutBatchStatus,
      expectedFlagSeverity,
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
      status: "fraud_enforcement_record_not_created",
      message: "The affiliate fraud enforcement record could not be loaded after creation.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "affiliate_fraud_enforcement_recorded",
    duplicate: false,
    record: publicEnforcementRecord(created, false),
    redaction: summaryRedaction,
  };
}
