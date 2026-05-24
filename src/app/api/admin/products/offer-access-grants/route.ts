import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  createProductOfferAccessGrant,
  getProductOfferAccessSummary,
  productOfferAccessApiRoute,
  productOfferAccessConfirmationText,
  productOfferAccessIssue,
  productOfferAccessRedaction,
  productOfferAccessStatus,
} from "@/lib/product-offer-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductOfferAccessRequestBody = {
  productId?: string;
  offerId?: string;
  funnelId?: string;
  buyerEmail?: string;
  amountCents?: number | string;
  currency?: string;
  confirmationText?: string;
  idempotencyKey?: string;
};

async function parseBody(request: NextRequest): Promise<ProductOfferAccessRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as ProductOfferAccessRequestBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction: productOfferAccessRedaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const summary = await getProductOfferAccessSummary();
  return NextResponse.json({
    ok: true,
    status: productOfferAccessStatus,
    issue: productOfferAccessIssue,
    route: productOfferAccessApiRoute,
    confirmation: {
      required: true,
      text: productOfferAccessConfirmationText,
    },
    contract: summary,
    redaction: productOfferAccessRedaction,
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
  const result = await createProductOfferAccessGrant({
    productId: body.productId,
    offerId: body.offerId,
    funnelId: body.funnelId,
    buyerEmail: body.buyerEmail,
    amountCents: body.amountCents,
    currency: body.currency,
    confirmationText: body.confirmationText,
    idempotencyKey,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "invalid_request" || result.status === "confirmation_required" || result.status === "product_not_found"
        ? 400
        : result.status === "idempotency_conflict"
          ? 409
          : 503;
    return jsonError(status, result.status, result.message);
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
