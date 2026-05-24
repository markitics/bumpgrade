import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  createProductTestCheckoutLink,
  getProductTestCheckoutSummary,
  productTestCheckoutIssue,
  productTestCheckoutLinkApiRoute,
  productTestCheckoutLinkConfirmationText,
  productTestCheckoutRedaction,
  productTestCheckoutStatus,
} from "@/lib/product-test-checkout-links";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductTestCheckoutLinkRequestBody = {
  productId?: string;
  amountCents?: number | string;
  currency?: string;
  expectedProductUpdatedAt?: string;
  confirmationText?: string;
  idempotencyKey?: string;
};

async function parseBody(request: NextRequest): Promise<ProductTestCheckoutLinkRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as ProductTestCheckoutLinkRequestBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction: productTestCheckoutRedaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const summary = await getProductTestCheckoutSummary();
  return NextResponse.json({
    ok: true,
    status: productTestCheckoutStatus,
    issue: productTestCheckoutIssue,
    route: productTestCheckoutLinkApiRoute,
    confirmation: {
      required: true,
      text: productTestCheckoutLinkConfirmationText,
    },
    contract: summary,
    redaction: productTestCheckoutRedaction,
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
  const result = await createProductTestCheckoutLink({
    productId: body.productId,
    amountCents: body.amountCents,
    currency: body.currency,
    expectedProductUpdatedAt: body.expectedProductUpdatedAt,
    confirmationText: body.confirmationText,
    idempotencyKey,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "invalid_request" || result.status === "confirmation_required" || result.status === "product_not_found"
        ? 400
        : result.status === "idempotency_conflict" || result.status === "stale_product_state"
          ? 409
          : 503;
    return jsonError(status, result.status, result.message);
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
