import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  affiliateFraudReviewRecordApiRoute,
  affiliateFraudReviewRecordConfirmationText,
  affiliateFraudReviewRecordIssue,
  affiliateFraudReviewRecordStatus,
  createAffiliateFraudReviewRecord,
  getAffiliateFraudReviewRecordSummary,
} from "@/lib/affiliate-fraud-review-records";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FraudReviewRecordRequestBody = {
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
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<FraudReviewRecordRequestBody> {
  try {
    return (await request.json()) as FraudReviewRecordRequestBody;
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
  const summary = await getAffiliateFraudReviewRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: affiliateFraudReviewRecordStatus,
    issue: affiliateFraudReviewRecordIssue,
    route: affiliateFraudReviewRecordApiRoute,
    confirmation: { required: true, text: affiliateFraudReviewRecordConfirmationText },
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAffiliateFraudReviewRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAffiliateFraudReviewRecord({
    programId: body.programId,
    reviewFlagId: body.reviewFlagId,
    payoutPreparationId: body.payoutPreparationId,
    payoutBatchId: body.payoutBatchId,
    reviewDisposition: body.reviewDisposition,
    expectedProgramRevisionId: body.expectedProgramRevisionId,
    expectedPayoutBatchStatus: body.expectedPayoutBatchStatus,
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
      result.status === "stale_fraud_review_evidence" ||
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
