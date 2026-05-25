import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  getMobileAdminDirectorReviewSummary,
  mobileAdminDirectorReviewApiRoute,
  mobileAdminDirectorReviewIssue,
  mobileAdminDirectorReviewStatus,
  recordMobileAdminDirectorReview,
} from "@/lib/mobile-admin-director-reviews";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MobileAdminDirectorReviewRequestBody = {
  workstreamId?: unknown;
  expectedDirectorGeneratedAt?: unknown;
  staleStateToken?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
  auditCorrelationId?: unknown;
  reviewNote?: unknown;
};

async function parseBody(request: NextRequest): Promise<MobileAdminDirectorReviewRequestBody> {
  try {
    return (await request.json()) as MobileAdminDirectorReviewRequestBody;
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
  const summary = await getMobileAdminDirectorReviewSummary({
    includeStaleStateTokens: adminState.identity?.role === "owner",
  });

  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.", summary.redaction);
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: mobileAdminDirectorReviewStatus,
    issue: mobileAdminDirectorReviewIssue,
    route: mobileAdminDirectorReviewApiRoute,
    contract: summary,
    confirmation: summary.confirmation,
    allowedWorkstreams: summary.allowedWorkstreams,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getMobileAdminDirectorReviewSummary({ includeStaleStateTokens: false });

  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.", summary.redaction);
  }

  const body = await parseBody(request);
  const result = await recordMobileAdminDirectorReview({
    workstreamId: body.workstreamId,
    expectedDirectorGeneratedAt: body.expectedDirectorGeneratedAt,
    staleStateToken: body.staleStateToken,
    confirmationText: body.confirmationText,
    auditCorrelationId: body.auditCorrelationId,
    reviewNote: body.reviewNote,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "stale_director_status" ||
      result.status === "stale_state_token" ||
      result.status === "idempotency_conflict"
        ? 409
        : result.status === "unsupported_workstream"
          ? 404
          : result.status === "director_review_not_created"
            ? 500
            : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentDirectorGeneratedAt: result.currentDirectorGeneratedAt,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
