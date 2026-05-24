import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  createProductDeliveryGateLink,
  getProductDeliveryGateSummary,
  productDeliveryGateApiRoute,
  productDeliveryGateConfirmationText,
  productDeliveryGateIssue,
  productDeliveryGateRedaction,
  productDeliveryGateStatus,
} from "@/lib/product-delivery-gates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductDeliveryGateRequestBody = {
  productId?: string;
  checkoutLinkId?: string;
  offerStackId?: string;
  offerId?: string;
  funnelId?: string;
  expectedProductUpdatedAt?: string;
  expectedLinkRevisionId?: string;
  confirmationText?: string;
  idempotencyKey?: string;
};

async function parseBody(request: NextRequest): Promise<ProductDeliveryGateRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as ProductDeliveryGateRequestBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction: productDeliveryGateRedaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const summary = await getProductDeliveryGateSummary();
  return NextResponse.json({
    ok: true,
    status: productDeliveryGateStatus,
    issue: productDeliveryGateIssue,
    route: productDeliveryGateApiRoute,
    confirmation: {
      required: true,
      text: productDeliveryGateConfirmationText,
    },
    contract: summary,
    redaction: productDeliveryGateRedaction,
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
  const result = await createProductDeliveryGateLink({
    productId: body.productId,
    checkoutLinkId: body.checkoutLinkId,
    offerStackId: body.offerStackId,
    offerId: body.offerId,
    funnelId: body.funnelId,
    expectedProductUpdatedAt: body.expectedProductUpdatedAt,
    expectedLinkRevisionId: body.expectedLinkRevisionId,
    confirmationText: body.confirmationText,
    idempotencyKey,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "invalid_request" ||
      result.status === "confirmation_required" ||
      result.status === "product_not_found" ||
      result.status === "checkout_link_not_found" ||
      result.status === "unsupported_offer_gate"
        ? 400
        : result.status === "idempotency_conflict" ||
            result.status === "stale_product_state" ||
            result.status === "stale_link_state"
          ? 409
          : 503;
    return jsonError(status, result.status, result.message);
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
