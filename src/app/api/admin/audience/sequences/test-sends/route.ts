import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  audienceSequenceTestSendApiRoute,
  audienceSequenceTestSendIssue,
  audienceSequenceTestSendStatus,
  createAudienceSequenceTestSend,
  getAudienceSequenceTestSendSummary,
} from "@/lib/audience-sequence-test-sends";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TestSendRequestBody = {
  sequenceId?: unknown;
  stepId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
  auditCorrelationId?: unknown;
};

async function parseBody(request: NextRequest): Promise<TestSendRequestBody> {
  try {
    return (await request.json()) as TestSendRequestBody;
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
  const summary = await getAudienceSequenceTestSendSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: audienceSequenceTestSendStatus,
    issue: audienceSequenceTestSendIssue,
    route: audienceSequenceTestSendApiRoute,
    confirmation: summary.confirmation,
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAudienceSequenceTestSendSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAudienceSequenceTestSend({
    sequenceId: body.sequenceId,
    stepId: body.stepId,
    expectedWorkspaceRevisionId: body.expectedWorkspaceRevisionId,
    expectedSequenceStatus: body.expectedSequenceStatus,
    expectedReadyEnrollmentCount: body.expectedReadyEnrollmentCount,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    auditCorrelationId: body.auditCorrelationId,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "sequence_not_found" || result.status === "sequence_step_not_found"
        ? 404
        : result.status === "readiness_unavailable"
          ? 503
          : result.status === "stale_workspace_revision" ||
              result.status === "stale_sequence_status" ||
              result.status === "stale_readiness_count"
            ? 409
            : result.status === "email_send_failed"
              ? 502
              : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentWorkspaceRevisionId: result.currentWorkspaceRevisionId,
      currentSequenceStatus: result.currentSequenceStatus,
      currentReadyEnrollmentCount: result.currentReadyEnrollmentCount,
      testSend: result.testSend,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
