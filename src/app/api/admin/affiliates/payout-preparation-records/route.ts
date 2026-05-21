import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  affiliatePayoutPreparationRecordApiRoute,
  affiliatePayoutPreparationRecordConfirmationText,
  affiliatePayoutPreparationRecordIssue,
  affiliatePayoutPreparationRecordStatus,
  createAffiliatePayoutPreparationRecord,
  getAffiliatePayoutPreparationRecordSummary,
} from "@/lib/affiliate-payout-preparation-records";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PayoutPreparationRecordRequestBody = {
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
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<PayoutPreparationRecordRequestBody> {
  try {
    return (await request.json()) as PayoutPreparationRecordRequestBody;
  } catch {
    return {};
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function jsonError(
  status: number,
  code: string,
  message: string,
  redaction: Record<string, unknown>,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ ok: false, code, message, redaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAffiliatePayoutPreparationRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: affiliatePayoutPreparationRecordStatus,
    issue: affiliatePayoutPreparationRecordIssue,
    route: affiliatePayoutPreparationRecordApiRoute,
    confirmation: { required: true, text: affiliatePayoutPreparationRecordConfirmationText },
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAffiliatePayoutPreparationRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAffiliatePayoutPreparationRecord({
    programId: body.programId,
    payoutPreparationId: body.payoutPreparationId,
    payoutBatchId: body.payoutBatchId,
    expectedProgramRevisionId: body.expectedProgramRevisionId,
    expectedPayoutBatchStatus: body.expectedPayoutBatchStatus,
    expectedEligibleLedgerCount: body.expectedEligibleLedgerCount,
    expectedBlockedLedgerCount: body.expectedBlockedLedgerCount,
    expectedReversedLedgerCount: body.expectedReversedLedgerCount,
    expectedTotalCommissionCents: body.expectedTotalCommissionCents,
    privateNote: body.privateNote,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "stale_program_revision" ||
      result.status === "stale_payout_batch_status" ||
      result.status === "stale_payout_preparation_evidence" ||
      result.status === "idempotency_conflict"
        ? 409
        : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentProgramRevisionId: result.currentProgramRevisionId,
      currentPayoutBatchStatus: result.currentPayoutBatchStatus,
      currentEvidence: result.currentEvidence,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
