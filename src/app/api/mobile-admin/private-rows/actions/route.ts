import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  getMobileAdminPrivateRowActionSummary,
  mobileAdminPrivateRowActionApiRoute,
  mobileAdminPrivateRowActionIssue,
  mobileAdminPrivateRowActionRedaction,
  mobileAdminPrivateRowActionStatus,
  recordMobileAdminPrivateRowAction,
} from "@/lib/mobile-admin-private-row-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MobileAdminPrivateRowActionRequestBody = {
  rowId?: unknown;
  actionId?: unknown;
  expectedRowUpdatedAt?: unknown;
  staleStateToken?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
  auditCorrelationId?: unknown;
  privateNote?: unknown;
};

async function parseBody(request: NextRequest): Promise<MobileAdminPrivateRowActionRequestBody> {
  try {
    return (await request.json()) as MobileAdminPrivateRowActionRequestBody;
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
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", mobileAdminPrivateRowActionRedaction(), {
      denialReason: adminState.denialReason,
    });
  }

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.", mobileAdminPrivateRowActionRedaction());
  }

  const rowId = request.nextUrl.searchParams.get("rowId");
  const summary = await getMobileAdminPrivateRowActionSummary({
    includeStaleStateTokens: Boolean(rowId),
    rowId,
  });

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: mobileAdminPrivateRowActionStatus,
    issue: mobileAdminPrivateRowActionIssue,
    route: mobileAdminPrivateRowActionApiRoute,
    contract: summary,
    selectedRow: summary.selectedRow,
    confirmation: summary.confirmation,
    allowedActions: summary.allowedActions,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", mobileAdminPrivateRowActionRedaction(), {
      denialReason: adminState.denialReason,
    });
  }

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.", mobileAdminPrivateRowActionRedaction());
  }

  const body = await parseBody(request);
  const result = await recordMobileAdminPrivateRowAction({
    rowId: body.rowId,
    actionId: body.actionId,
    expectedRowUpdatedAt: body.expectedRowUpdatedAt,
    staleStateToken: body.staleStateToken,
    confirmationText: body.confirmationText,
    auditCorrelationId: body.auditCorrelationId,
    privateNote: body.privateNote,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "stale_private_row" ||
      result.status === "stale_state_token" ||
      result.status === "idempotency_conflict"
        ? 409
        : result.status === "row_not_found"
          ? 404
          : result.status === "private_row_action_not_created"
            ? 500
            : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentRowUpdatedAt: result.currentRowUpdatedAt,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
