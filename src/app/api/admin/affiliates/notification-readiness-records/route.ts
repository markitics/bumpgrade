import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  affiliatePartnerNotificationReadinessRecordApiRoute,
  affiliatePartnerNotificationReadinessRecordConfirmationText,
  affiliatePartnerNotificationReadinessRecordIssue,
  affiliatePartnerNotificationReadinessRecordStatus,
  createAffiliatePartnerNotificationReadinessRecord,
  getAffiliatePartnerNotificationReadinessRecordSummary,
} from "@/lib/affiliate-partner-notification-readiness-records";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NotificationReadinessRecordRequestBody = {
  programId?: unknown;
  affiliatePartnerReportId?: unknown;
  affiliatePartnerId?: unknown;
  payoutPreparationId?: unknown;
  payoutBatchId?: unknown;
  reviewFlagId?: unknown;
  notificationReadinessDisposition?: unknown;
  expectedProgramRevisionId?: unknown;
  expectedPartnerReportStatus?: unknown;
  expectedPayoutBatchStatus?: unknown;
  expectedPayoutPreparationRecordStatus?: unknown;
  expectedFraudReviewRecordStatus?: unknown;
  expectedReviewFlagSeverity?: unknown;
  expectedLinkedLedgerCount?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<NotificationReadinessRecordRequestBody> {
  try {
    return (await request.json()) as NotificationReadinessRecordRequestBody;
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
  const summary = await getAffiliatePartnerNotificationReadinessRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: affiliatePartnerNotificationReadinessRecordStatus,
    issue: affiliatePartnerNotificationReadinessRecordIssue,
    route: affiliatePartnerNotificationReadinessRecordApiRoute,
    confirmation: { required: true, text: affiliatePartnerNotificationReadinessRecordConfirmationText },
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAffiliatePartnerNotificationReadinessRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAffiliatePartnerNotificationReadinessRecord({
    programId: body.programId,
    affiliatePartnerReportId: body.affiliatePartnerReportId,
    affiliatePartnerId: body.affiliatePartnerId,
    payoutPreparationId: body.payoutPreparationId,
    payoutBatchId: body.payoutBatchId,
    reviewFlagId: body.reviewFlagId,
    notificationReadinessDisposition: body.notificationReadinessDisposition,
    expectedProgramRevisionId: body.expectedProgramRevisionId,
    expectedPartnerReportStatus: body.expectedPartnerReportStatus,
    expectedPayoutBatchStatus: body.expectedPayoutBatchStatus,
    expectedPayoutPreparationRecordStatus: body.expectedPayoutPreparationRecordStatus,
    expectedFraudReviewRecordStatus: body.expectedFraudReviewRecordStatus,
    expectedReviewFlagSeverity: body.expectedReviewFlagSeverity,
    expectedLinkedLedgerCount: body.expectedLinkedLedgerCount,
    privateNote: body.privateNote,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "stale_program_revision" ||
      result.status === "stale_partner_report_status" ||
      result.status === "stale_payout_batch_status" ||
      result.status === "stale_payout_preparation_record_status" ||
      result.status === "stale_fraud_review_record_status" ||
      result.status === "stale_fraud_review_evidence" ||
      result.status === "idempotency_conflict"
        ? 409
        : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentProgramRevisionId: result.currentProgramRevisionId,
      currentPartnerReportStatus: result.currentPartnerReportStatus,
      currentPayoutBatchStatus: result.currentPayoutBatchStatus,
      currentPayoutPreparationRecordStatus: result.currentPayoutPreparationRecordStatus,
      currentFraudReviewRecordStatus: result.currentFraudReviewRecordStatus,
      currentEvidence: result.currentEvidence,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
