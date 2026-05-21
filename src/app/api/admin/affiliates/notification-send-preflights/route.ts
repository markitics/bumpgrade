import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  affiliatePartnerNotificationSendPreflightRecordApiRoute,
  affiliatePartnerNotificationSendPreflightRecordConfirmationText,
  affiliatePartnerNotificationSendPreflightRecordIssue,
  affiliatePartnerNotificationSendPreflightRecordStatus,
  createAffiliatePartnerNotificationSendPreflightRecord,
  getAffiliatePartnerNotificationSendPreflightRecordSummary,
} from "@/lib/affiliate-partner-notification-send-preflight-records";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NotificationSendPreflightRecordRequestBody = {
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
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<NotificationSendPreflightRecordRequestBody> {
  try {
    return (await request.json()) as NotificationSendPreflightRecordRequestBody;
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
  const summary = await getAffiliatePartnerNotificationSendPreflightRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: affiliatePartnerNotificationSendPreflightRecordStatus,
    issue: affiliatePartnerNotificationSendPreflightRecordIssue,
    route: affiliatePartnerNotificationSendPreflightRecordApiRoute,
    confirmation: { required: true, text: affiliatePartnerNotificationSendPreflightRecordConfirmationText },
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAffiliatePartnerNotificationSendPreflightRecordSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAffiliatePartnerNotificationSendPreflightRecord({
    programId: body.programId,
    affiliatePartnerReportId: body.affiliatePartnerReportId,
    affiliatePartnerId: body.affiliatePartnerId,
    payoutPreparationId: body.payoutPreparationId,
    payoutBatchId: body.payoutBatchId,
    reviewFlagId: body.reviewFlagId,
    notificationSendPreflightDisposition: body.notificationSendPreflightDisposition,
    expectedProgramRevisionId: body.expectedProgramRevisionId,
    expectedPartnerReportStatus: body.expectedPartnerReportStatus,
    expectedPayoutBatchStatus: body.expectedPayoutBatchStatus,
    expectedPayoutPreparationRecordStatus: body.expectedPayoutPreparationRecordStatus,
    expectedFraudReviewRecordStatus: body.expectedFraudReviewRecordStatus,
    expectedNotificationReadinessRecordStatus: body.expectedNotificationReadinessRecordStatus,
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
      result.status === "stale_notification_readiness_record_status" ||
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
      currentNotificationReadinessRecordStatus: result.currentNotificationReadinessRecordStatus,
      currentEvidence: result.currentEvidence,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
