import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  createProductEntitlementRevocationIntent,
  getProductEntitlementRevocationIntentSummary,
  productEntitlementRevocationConfirmationText,
  productEntitlementRevocationIntentApiRoute,
  productEntitlementRevocationIntentStatus,
  productEntitlementRevocationIntentWriteIssue,
  productEntitlementRevocationRedaction,
} from "@/lib/product-entitlement-inspection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductRevocationIntentRequestBody = {
  entitlementId?: string;
  expectedEntitlementStatus?: string;
  reasonCode?: string;
  privateReason?: string;
  confirmationText?: string;
  idempotencyKey?: string;
};

async function parseBody(request: NextRequest): Promise<ProductRevocationIntentRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as ProductRevocationIntentRequestBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { ok: false, code, message, redaction: productEntitlementRevocationRedaction, ...(extra ?? {}) },
    { status },
  );
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const summary = await getProductEntitlementRevocationIntentSummary();
  return NextResponse.json({
    ok: true,
    status: productEntitlementRevocationIntentStatus,
    issue: productEntitlementRevocationIntentWriteIssue,
    route: productEntitlementRevocationIntentApiRoute,
    confirmation: {
      required: true,
      text: productEntitlementRevocationConfirmationText,
    },
    contract: summary,
    redaction: productEntitlementRevocationRedaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const idempotencyKey = body.idempotencyKey ?? request.headers.get("idempotency-key")?.trim() ?? null;
  const result = await createProductEntitlementRevocationIntent({
    entitlementId: body.entitlementId,
    expectedEntitlementStatus: body.expectedEntitlementStatus,
    reasonCode: body.reasonCode,
    privateReason: body.privateReason,
    confirmationText: body.confirmationText,
    idempotencyKey,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "invalid_request" || result.status === "confirmation_required"
        ? 400
        : result.status === "entitlement_not_found"
          ? 404
          : result.status === "stale_entitlement_state" || result.status === "idempotency_conflict"
            ? 409
            : 503;
    return jsonError(status, result.status, result.message);
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
