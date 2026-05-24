import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  getMobileAdminActionIntentSummary,
  mobileAdminActionIntentApiRoute,
  mobileAdminActionIntentIssue,
  mobileAdminActionIntentStatus,
  recordMobileAdminActionIntent,
} from "@/lib/mobile-admin-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MobileAdminActionRequestBody = {
  actionId?: unknown;
  sourceRoute?: unknown;
  targetId?: unknown;
  expectedContractUpdatedAt?: unknown;
  staleStateToken?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
  auditCorrelationId?: unknown;
  privateNote?: unknown;
};

async function parseBody(request: NextRequest): Promise<MobileAdminActionRequestBody> {
  try {
    return (await request.json()) as MobileAdminActionRequestBody;
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
  const summary = await getMobileAdminActionIntentSummary({ includeStaleStateTokens: Boolean(adminState.identity) });

  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: mobileAdminActionIntentStatus,
    issue: mobileAdminActionIntentIssue,
    route: mobileAdminActionIntentApiRoute,
    contract: summary,
    confirmation: summary.confirmation,
    allowedActions: summary.allowedActions,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getMobileAdminActionIntentSummary({ includeStaleStateTokens: false });

  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await recordMobileAdminActionIntent({
    actionId: body.actionId,
    sourceRoute: body.sourceRoute,
    targetId: body.targetId,
    expectedContractUpdatedAt: body.expectedContractUpdatedAt,
    staleStateToken: body.staleStateToken,
    confirmationText: body.confirmationText,
    auditCorrelationId: body.auditCorrelationId,
    privateNote: body.privateNote,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "stale_contract_revision" ||
      result.status === "stale_state_token" ||
      result.status === "idempotency_conflict"
        ? 409
        : result.status === "action_intent_not_created"
          ? 500
          : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentContractUpdatedAt: result.currentContractUpdatedAt,
      allowedSourceRoutes: result.allowedSourceRoutes,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
