import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  getMobileAdminPrivateRowsOwnerResponse,
  mobileAdminPrivateRowsRedaction,
  mobileAdminPrivateRowsApiRoute,
  mobileAdminPrivateRowsIssue,
  mobileAdminPrivateRowsStatus,
} from "@/lib/mobile-admin-private-rows";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonError(status: number, code: string, message: string, redaction: Record<string, unknown>, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);

  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", mobileAdminPrivateRowsRedaction(), {
      denialReason: adminState.denialReason,
    });
  }

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.", mobileAdminPrivateRowsRedaction());
  }

  const ownerRows = await getMobileAdminPrivateRowsOwnerResponse();

  return NextResponse.json({
    ok: true,
    status: mobileAdminPrivateRowsStatus,
    issue: mobileAdminPrivateRowsIssue,
    route: mobileAdminPrivateRowsApiRoute,
    contract: ownerRows,
    rows: ownerRows.rows,
    redaction: ownerRows.redaction,
  });
}
