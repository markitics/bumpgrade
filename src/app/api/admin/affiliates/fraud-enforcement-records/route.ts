import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  affiliateFraudEnforcementRecordApiRoute,
  affiliateFraudEnforcementRecordConfirmationText,
  affiliateFraudEnforcementRecordIssue,
  affiliateFraudEnforcementRecordStatus,
  createAffiliateFraudEnforcementRecord,
  getAffiliateFraudEnforcementRecordSummary,
} from "@/lib/affiliate-fraud-review-records";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FraudEnforcementRecordRequestBody = {
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
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<FraudEnforcementRecordRequestBody> {
  try {
    return (await request.json()) as FraudEnforcementRecordRequestBody;
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
  const summary = await getAffiliateFraudEnforcementRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: affiliateFraudEnforcementRecordStatus,
    issue: affiliateFraudEnforcementRecordIssue,
    route: affiliateFraudEnforcementRecordApiRoute,
    confirmation: { required: true, text: affiliateFraudEnforcementRecordConfirmationText },
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAffiliateFraudEnforcementRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAffiliateFraudEnforcementRecord({
    programId: body.programId,
    reviewFlagId: body.reviewFlagId,
    payoutPreparationId: body.payoutPreparationId,
    payoutBatchId: body.payoutBatchId,
    enforcementDisposition: body.enforcementDisposition,
    expectedProgramRevisionId: body.expectedProgramRevisionId,
    expectedPayoutBatchStatus: body.expectedPayoutBatchStatus,
    expectedFraudReviewRecordStatus: body.expectedFraudReviewRecordStatus,
    expectedFlagSeverity: body.expectedFlagSeverity,
    expectedLinkedLedgerCount: body.expectedLinkedLedgerCount,
    privateNote: body.privateNote,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "stale_program_revision" ||
      result.status === "stale_payout_batch_status" ||
      result.status === "stale_fraud_review_record_status" ||
      result.status === "stale_fraud_enforcement_evidence" ||
      result.status === "idempotency_conflict"
        ? 409
        : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentProgramRevisionId: result.currentProgramRevisionId,
      currentPayoutBatchStatus: result.currentPayoutBatchStatus,
      currentFraudReviewRecordStatus: result.currentFraudReviewRecordStatus,
      currentEvidence: result.currentEvidence,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
