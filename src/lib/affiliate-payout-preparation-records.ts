import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/analytics-events";
import { affiliatePayoutPreparationContract, affiliateProgram } from "@/lib/affiliate-referrals";

export const affiliatePayoutPreparationRecordIssue = 273;
export const affiliatePayoutPreparationRecordStatus = "owner-affiliate-payout-preparation-records-ready";
export const affiliatePayoutPreparationRecordApiRoute = "/api/admin/affiliates/payout-preparation-records";
export const affiliatePayoutPreparationRecordOwnerRoute = "/admin/affiliates";
export const affiliatePayoutPreparationRecordConfirmationText =
  "Record Bumpgrade affiliate payout preparation evidence";

const recordKind = "owner_payout_preparation_review";
const payoutBatch = affiliateProgram.payoutBatches[0];

type Runtime = {
  db: D1Database;
};

type PayoutRecordCountRow = {
  payout_preparation_records: number;
  owner_confirmed_records: number;
  owner_record_created_records: number;
  payable_commission_created_records: number;
  stripe_payout_created_records: number;
  stripe_transfer_created_records: number;
  payout_account_stored_records: number;
  tax_data_collected_records: number;
  partner_notification_sent_records: number;
  fraud_decision_enforced_records: number;
  buyer_data_included_records: number;
  raw_ledger_rows_exposed_records: number;
  raw_actor_identity_included_records: number;
};

type PayoutRecordRow = {
  id: string;
  program_id: string;
  payout_preparation_id: string;
  payout_batch_id: string;
  record_kind: typeof recordKind;
  expected_program_revision_id: string;
  expected_payout_batch_status: string;
  expected_eligible_ledger_count: number;
  expected_blocked_ledger_count: number;
  expected_reversed_ledger_count: number;
  expected_total_commission_cents: number;
  currency: "USD";
  idempotency_key: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  owner_payout_preparation_record_created: number;
  payable_commission_created: number;
  stripe_payout_created: number;
  stripe_transfer_created: number;
  payout_account_stored: number;
  tax_data_collected: number;
  partner_notification_sent: number;
  fraud_decision_enforced: number;
  buyer_data_included: number;
  raw_ledger_rows_exposed: number;
  raw_actor_identity_included: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

export type AffiliatePayoutPreparationEvidence = {
  programId: string;
  programRevisionId: string;
  payoutPreparationId: string;
  payoutBatchId: string;
  payoutBatchStatus: string;
  eligibleLedgerCount: number;
  blockedLedgerCount: number;
  reversedLedgerCount: number;
  totalCommissionCents: number;
  currency: "USD";
  readinessChecklist: typeof payoutBatch.readinessChecklist;
  reviewBeforePayout: string[];
  ownerRecordAllowed: true;
  payableCommissionCreated: false;
  stripePayoutCreated: false;
  stripeTransferCreated: false;
  payoutAccountStored: false;
  taxDataCollected: false;
  partnerNotificationSent: false;
  fraudDecisionEnforced: false;
  buyerDataIncluded: false;
  rawLedgerRowsExposed: false;
  rawActorIdentityIncluded: false;
};

export type AffiliatePayoutPreparationRecordPublic = {
  id: string;
  programId: string;
  payoutPreparationId: string;
  payoutBatchId: string;
  recordKind: typeof recordKind;
  expectedPayoutBatchStatus: string;
  expectedEligibleLedgerCount: number;
  expectedBlockedLedgerCount: number;
  expectedReversedLedgerCount: number;
  expectedTotalCommissionCents: number;
  currency: "USD";
  privateNoteRecorded: boolean;
  ownerPayoutPreparationRecordCreated: true;
  payableCommissionCreated: false;
  stripePayoutCreated: false;
  stripeTransferCreated: false;
  payoutAccountStored: false;
  taxDataCollected: false;
  partnerNotificationSent: false;
  fraudDecisionEnforced: false;
  buyerDataIncluded: false;
  rawLedgerRowsExposed: false;
  rawActorIdentityIncluded: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type AffiliatePayoutPreparationRecordSummary = {
  id: "affiliate-payout-preparation-record-contract";
  status: typeof affiliatePayoutPreparationRecordStatus;
  issue: typeof affiliatePayoutPreparationRecordIssue;
  parentIssue: 19;
  apiRoute: typeof affiliatePayoutPreparationRecordApiRoute;
  ownerRoute: typeof affiliatePayoutPreparationRecordOwnerRoute;
  sourceDataRoute: "/affiliates/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  confirmation: {
    required: true;
    text: typeof affiliatePayoutPreparationRecordConfirmationText;
  };
  currentEvidence: AffiliatePayoutPreparationEvidence;
  counts: {
    payoutPreparationRecords: number;
    ownerConfirmedRecords: number;
    ownerRecordCreatedRecords: number;
    payableCommissionCreatedRecords: number;
    stripePayoutCreatedRecords: number;
    stripeTransferCreatedRecords: number;
    payoutAccountStoredRecords: number;
    taxDataCollectedRecords: number;
    partnerNotificationSentRecords: number;
    fraudDecisionEnforcedRecords: number;
    buyerDataIncludedRecords: number;
    rawLedgerRowsExposedRecords: number;
    rawActorIdentityIncludedRecords: number;
  };
  latestRecords: AffiliatePayoutPreparationRecordPublic[];
  redaction: {
    privateDataIncluded: false;
    buyerDataIncluded: false;
    rawLedgerRowsIncluded: false;
    rawActorIdentityIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    payoutAccountIncluded: false;
    taxDataIncluded: false;
    stripeIdsIncluded: false;
    partnerNotificationIncluded: false;
    fraudPrivateSignalsIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreatePayoutRecordInput = {
  programId?: unknown;
  payoutPreparationId?: unknown;
  payoutBatchId?: unknown;
  expectedProgramRevisionId?: unknown;
  expectedPayoutBatchStatus?: unknown;
  expectedEligibleLedgerCount?: unknown;
  expectedBlockedLedgerCount?: unknown;
  expectedReversedLedgerCount?: unknown;
  expectedTotalCommissionCents?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreatePayoutRecordResult =
  | {
      ok: true;
      status: "affiliate_payout_preparation_recorded" | "affiliate_payout_preparation_replayed";
      duplicate: boolean;
      record: AffiliatePayoutPreparationRecordPublic;
      redaction: AffiliatePayoutPreparationRecordSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_payout_preparation"
        | "unsupported_payout_batch"
        | "confirmation_required"
        | "stale_program_revision"
        | "stale_payout_batch_status"
        | "stale_payout_preparation_evidence"
        | "idempotency_conflict"
        | "payout_preparation_record_not_created";
      message: string;
      redaction: AffiliatePayoutPreparationRecordSummary["redaction"];
      currentProgramRevisionId?: string;
      currentPayoutBatchStatus?: string;
      currentEvidence?: AffiliatePayoutPreparationEvidence;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function redaction(): AffiliatePayoutPreparationRecordSummary["redaction"] {
  return {
    privateDataIncluded: false,
    buyerDataIncluded: false,
    rawLedgerRowsIncluded: false,
    rawActorIdentityIncluded: false,
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    privateNoteIncluded: false,
    payoutAccountIncluded: false,
    taxDataIncluded: false,
    stripeIdsIncluded: false,
    partnerNotificationIncluded: false,
    fraudPrivateSignalsIncluded: false,
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

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function currentEvidence(): AffiliatePayoutPreparationEvidence {
  return {
    programId: affiliateProgram.id,
    programRevisionId: affiliateProgram.revisionId,
    payoutPreparationId: payoutBatch.preparationId,
    payoutBatchId: payoutBatch.id,
    payoutBatchStatus: payoutBatch.status,
    eligibleLedgerCount: payoutBatch.eligibleLedgerIds.length,
    blockedLedgerCount: payoutBatch.blockedLedgerIds.length,
    reversedLedgerCount: payoutBatch.reversedLedgerIds.length,
    totalCommissionCents: payoutBatch.totalCommissionCents,
    currency: payoutBatch.currency,
    readinessChecklist: payoutBatch.readinessChecklist,
    reviewBeforePayout: payoutBatch.reviewBeforePayout,
    ownerRecordAllowed: true,
    payableCommissionCreated: false,
    stripePayoutCreated: false,
    stripeTransferCreated: false,
    payoutAccountStored: false,
    taxDataCollected: false,
    partnerNotificationSent: false,
    fraudDecisionEnforced: false,
    buyerDataIncluded: false,
    rawLedgerRowsExposed: false,
    rawActorIdentityIncluded: false,
  };
}

function emptyCounts(): AffiliatePayoutPreparationRecordSummary["counts"] {
  return {
    payoutPreparationRecords: 0,
    ownerConfirmedRecords: 0,
    ownerRecordCreatedRecords: 0,
    payableCommissionCreatedRecords: 0,
    stripePayoutCreatedRecords: 0,
    stripeTransferCreatedRecords: 0,
    payoutAccountStoredRecords: 0,
    taxDataCollectedRecords: 0,
    partnerNotificationSentRecords: 0,
    fraudDecisionEnforcedRecords: 0,
    buyerDataIncludedRecords: 0,
    rawLedgerRowsExposedRecords: 0,
    rawActorIdentityIncludedRecords: 0,
  };
}

function emptySummary(
  source: AffiliatePayoutPreparationRecordSummary["source"],
  loadError: string | null,
): AffiliatePayoutPreparationRecordSummary {
  return {
    id: "affiliate-payout-preparation-record-contract",
    status: affiliatePayoutPreparationRecordStatus,
    issue: affiliatePayoutPreparationRecordIssue,
    parentIssue: 19,
    apiRoute: affiliatePayoutPreparationRecordApiRoute,
    ownerRoute: affiliatePayoutPreparationRecordOwnerRoute,
    sourceDataRoute: "/affiliates/source-data",
    source,
    loadError,
    confirmation: {
      required: true,
      text: affiliatePayoutPreparationRecordConfirmationText,
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
      "payoutAccount",
      "taxData",
      "stripePayoutId",
      "stripeTransferId",
      "partnerNotificationBody",
      "buyerData",
      "rawLedgerRows",
      "privateFraudSignals",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #273 lets verified owners record redacted affiliate payout-preparation evidence after exact confirmation, idempotency, program revision checks, payout batch status checks, and payout-preparation evidence checks. It creates owner-visible preparation evidence only; it does not create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, enforce fraud decisions, expose buyer data, expose raw ledger rows, or accept direct agent payout writes.",
  };
}

function publicRecord(row: PayoutRecordRow, duplicate = false): AffiliatePayoutPreparationRecordPublic {
  return {
    id: row.id,
    programId: row.program_id,
    payoutPreparationId: row.payout_preparation_id,
    payoutBatchId: row.payout_batch_id,
    recordKind: row.record_kind,
    expectedPayoutBatchStatus: row.expected_payout_batch_status,
    expectedEligibleLedgerCount: numberValue(row.expected_eligible_ledger_count),
    expectedBlockedLedgerCount: numberValue(row.expected_blocked_ledger_count),
    expectedReversedLedgerCount: numberValue(row.expected_reversed_ledger_count),
    expectedTotalCommissionCents: numberValue(row.expected_total_commission_cents),
    currency: row.currency,
    privateNoteRecorded: Boolean(row.private_note_sha256),
    ownerPayoutPreparationRecordCreated: true,
    payableCommissionCreated: false,
    stripePayoutCreated: false,
    stripeTransferCreated: false,
    payoutAccountStored: false,
    taxDataCollected: false,
    partnerNotificationSent: false,
    fraudDecisionEnforced: false,
    buyerDataIncluded: false,
    rawLedgerRowsExposed: false,
    rawActorIdentityIncluded: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
}

async function findRecordByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM affiliate_payout_preparation_records
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<PayoutRecordRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS payout_preparation_records,
        SUM(CASE WHEN confirmation_text_sha256 IS NOT NULL THEN 1 ELSE 0 END) AS owner_confirmed_records,
        SUM(owner_payout_preparation_record_created) AS owner_record_created_records,
        SUM(payable_commission_created) AS payable_commission_created_records,
        SUM(stripe_payout_created) AS stripe_payout_created_records,
        SUM(stripe_transfer_created) AS stripe_transfer_created_records,
        SUM(payout_account_stored) AS payout_account_stored_records,
        SUM(tax_data_collected) AS tax_data_collected_records,
        SUM(partner_notification_sent) AS partner_notification_sent_records,
        SUM(fraud_decision_enforced) AS fraud_decision_enforced_records,
        SUM(buyer_data_included) AS buyer_data_included_records,
        SUM(raw_ledger_rows_exposed) AS raw_ledger_rows_exposed_records,
        SUM(raw_actor_identity_included) AS raw_actor_identity_included_records
       FROM affiliate_payout_preparation_records`,
    )
    .first<PayoutRecordCountRow>();

  return {
    payoutPreparationRecords: numberValue(row?.payout_preparation_records),
    ownerConfirmedRecords: numberValue(row?.owner_confirmed_records),
    ownerRecordCreatedRecords: numberValue(row?.owner_record_created_records),
    payableCommissionCreatedRecords: numberValue(row?.payable_commission_created_records),
    stripePayoutCreatedRecords: numberValue(row?.stripe_payout_created_records),
    stripeTransferCreatedRecords: numberValue(row?.stripe_transfer_created_records),
    payoutAccountStoredRecords: numberValue(row?.payout_account_stored_records),
    taxDataCollectedRecords: numberValue(row?.tax_data_collected_records),
    partnerNotificationSentRecords: numberValue(row?.partner_notification_sent_records),
    fraudDecisionEnforcedRecords: numberValue(row?.fraud_decision_enforced_records),
    buyerDataIncludedRecords: numberValue(row?.buyer_data_included_records),
    rawLedgerRowsExposedRecords: numberValue(row?.raw_ledger_rows_exposed_records),
    rawActorIdentityIncludedRecords: numberValue(row?.raw_actor_identity_included_records),
  };
}

async function loadLatestRecords(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM affiliate_payout_preparation_records
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<PayoutRecordRow>();
  return (result.results ?? []).map((row) => publicRecord(row, false));
}

export async function getAffiliatePayoutPreparationRecordSummary(
  dbInput?: D1Database,
): Promise<AffiliatePayoutPreparationRecordSummary> {
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
      error instanceof Error ? error.message : "Unable to load affiliate payout preparation records.",
    );
  }
}

export async function createAffiliatePayoutPreparationRecord(
  input: CreatePayoutRecordInput,
): Promise<CreatePayoutRecordResult> {
  const summaryRedaction = redaction();
  const programId = parseString(input.programId);
  const payoutPreparationId = parseString(input.payoutPreparationId);
  const payoutBatchId = parseString(input.payoutBatchId);
  const expectedProgramRevisionId = parseString(input.expectedProgramRevisionId);
  const expectedPayoutBatchStatus = parseString(input.expectedPayoutBatchStatus);
  const expectedEligibleLedgerCount = parseInteger(input.expectedEligibleLedgerCount);
  const expectedBlockedLedgerCount = parseInteger(input.expectedBlockedLedgerCount);
  const expectedReversedLedgerCount = parseInteger(input.expectedReversedLedgerCount);
  const expectedTotalCommissionCents = parseInteger(input.expectedTotalCommissionCents);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;
  const evidence = currentEvidence();

  if (
    !programId ||
    !payoutPreparationId ||
    !payoutBatchId ||
    !expectedProgramRevisionId ||
    !expectedPayoutBatchStatus ||
    expectedEligibleLedgerCount === null ||
    expectedBlockedLedgerCount === null ||
    expectedReversedLedgerCount === null ||
    expectedTotalCommissionCents === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Program, payout preparation, payout batch, expected revision/status, ledger counts, total commission, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== affiliatePayoutPreparationRecordConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording affiliate payout preparation evidence.",
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
      message: "The affiliate program revision changed before the payout preparation record was created.",
      redaction: summaryRedaction,
      currentProgramRevisionId: affiliateProgram.revisionId,
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
      message: "The payout batch status changed before the payout preparation record was created.",
      redaction: summaryRedaction,
      currentPayoutBatchStatus: payoutBatch.status,
    };
  }

  if (
    expectedEligibleLedgerCount !== evidence.eligibleLedgerCount ||
    expectedBlockedLedgerCount !== evidence.blockedLedgerCount ||
    expectedReversedLedgerCount !== evidence.reversedLedgerCount ||
    expectedTotalCommissionCents !== evidence.totalCommissionCents
  ) {
    return {
      ok: false,
      status: "stale_payout_preparation_evidence",
      message: "The payout preparation evidence changed before the record was created.",
      redaction: summaryRedaction,
      currentEvidence: evidence,
    };
  }

  const { db } = await getRuntime();
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(affiliatePayoutPreparationRecordConfirmationText);
  const metadata = JSON.stringify({
    affiliatePayoutPreparationContract: affiliatePayoutPreparationContract.id,
    readinessChecklistIds: payoutBatch.readinessChecklist.map((item) => item.id),
    reviewBeforePayoutCount: payoutBatch.reviewBeforePayout.length,
    sourceIssue: affiliatePayoutPreparationRecordIssue,
  });

  const existing = await findRecordByIdempotency(db, idempotencyKey);
  if (existing) {
    const isReplay =
      existing.program_id === programId &&
      existing.payout_preparation_id === payoutPreparationId &&
      existing.payout_batch_id === payoutBatchId &&
      existing.expected_program_revision_id === expectedProgramRevisionId &&
      existing.expected_payout_batch_status === expectedPayoutBatchStatus &&
      numberValue(existing.expected_eligible_ledger_count) === expectedEligibleLedgerCount &&
      numberValue(existing.expected_blocked_ledger_count) === expectedBlockedLedgerCount &&
      numberValue(existing.expected_reversed_ledger_count) === expectedReversedLedgerCount &&
      numberValue(existing.expected_total_commission_cents) === expectedTotalCommissionCents &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256;
    if (!isReplay) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "A different affiliate payout preparation record already used this idempotency key.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "affiliate_payout_preparation_replayed",
      duplicate: true,
      record: publicRecord(existing, true),
      redaction: summaryRedaction,
    };
  }

  const id = `affiliate-payout-preparation-record-${Date.now()}-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO affiliate_payout_preparation_records (
        id, program_id, payout_preparation_id, payout_batch_id, record_kind,
        expected_program_revision_id, expected_payout_batch_status,
        expected_eligible_ledger_count, expected_blocked_ledger_count, expected_reversed_ledger_count,
        expected_total_commission_cents, currency, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, owner_payout_preparation_record_created,
        payable_commission_created, stripe_payout_created, stripe_transfer_created, payout_account_stored,
        tax_data_collected, partner_notification_sent, fraud_decision_enforced, buyer_data_included,
        raw_ledger_rows_exposed, raw_actor_identity_included, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      programId,
      payoutPreparationId,
      payoutBatchId,
      recordKind,
      expectedProgramRevisionId,
      expectedPayoutBatchStatus,
      expectedEligibleLedgerCount,
      expectedBlockedLedgerCount,
      expectedReversedLedgerCount,
      expectedTotalCommissionCents,
      evidence.currency,
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
      status: "payout_preparation_record_not_created",
      message: "The affiliate payout preparation record could not be loaded after creation.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "affiliate_payout_preparation_recorded",
    duplicate: false,
    record: publicRecord(created, false),
    redaction: summaryRedaction,
  };
}
