import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  getMobileAdminCommerceReviewSummary,
  mobileAdminCommerceReviewApiRoute,
  mobileAdminCommerceReviewIssue,
  mobileAdminCommerceReviewStatus,
  recordMobileAdminCommerceReview,
} from "@/lib/mobile-admin-commerce-reviews";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MobileAdminCommerceReviewRequestBody = {
  reviewTargetId?: unknown;
  expectedCommerceGeneratedAt?: unknown;
  staleStateToken?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
  auditCorrelationId?: unknown;
  reviewNote?: unknown;
};

async function parseBody(request: NextRequest): Promise<MobileAdminCommerceReviewRequestBody> {
  try {
    return (await request.json()) as MobileAdminCommerceReviewRequestBody;
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
  const summary = await getMobileAdminCommerceReviewSummary({
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
    status: mobileAdminCommerceReviewStatus,
    issue: mobileAdminCommerceReviewIssue,
    route: mobileAdminCommerceReviewApiRoute,
    contract: summary,
    confirmation: summary.confirmation,
    allowedReviewTargets: summary.allowedReviewTargets,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getMobileAdminCommerceReviewSummary({ includeStaleStateTokens: false });

  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.", summary.redaction);
  }

  const body = await parseBody(request);
  const result = await recordMobileAdminCommerceReview({
    reviewTargetId: body.reviewTargetId,
    expectedCommerceGeneratedAt: body.expectedCommerceGeneratedAt,
    staleStateToken: body.staleStateToken,
    confirmationText: body.confirmationText,
    auditCorrelationId: body.auditCorrelationId,
    reviewNote: body.reviewNote,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "stale_commerce_status" ||
      result.status === "stale_state_token" ||
      result.status === "idempotency_conflict"
        ? 409
        : result.status === "unsupported_review_target"
          ? 404
          : result.status === "commerce_review_not_created"
            ? 500
            : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentCommerceGeneratedAt: result.currentCommerceGeneratedAt,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
