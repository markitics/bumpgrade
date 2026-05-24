import { NextRequest, NextResponse } from "next/server";

import {
  createProductTestCheckoutPurchase,
  productTestCheckoutApiRoute,
  productTestCheckoutConfirmationText,
  productTestCheckoutIssue,
  productTestCheckoutRedaction,
  productTestCheckoutStatus,
} from "@/lib/product-test-checkout-links";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductTestCheckoutRequestBody = {
  linkId?: string;
  buyerEmail?: string;
  expectedLinkRevisionId?: string;
  confirmationText?: string;
  idempotencyKey?: string;
  agentClientId?: string;
};

async function parseBody(request: NextRequest): Promise<ProductTestCheckoutRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as ProductTestCheckoutRequestBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message, redaction: productTestCheckoutRedaction }, { status });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: productTestCheckoutStatus,
    issue: productTestCheckoutIssue,
    route: productTestCheckoutApiRoute,
    confirmation: {
      required: true,
      text: productTestCheckoutConfirmationText,
    },
    redaction: productTestCheckoutRedaction,
  });
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request);
  const idempotencyKey = body.idempotencyKey ?? request.headers.get("idempotency-key")?.trim() ?? null;
  const result = await createProductTestCheckoutPurchase({
    linkId: body.linkId,
    buyerEmail: body.buyerEmail,
    expectedLinkRevisionId: body.expectedLinkRevisionId,
    confirmationText: body.confirmationText,
    idempotencyKey,
    agentClientId: body.agentClientId,
  });

  if (!result.ok) {
    const status =
      result.status === "invalid_request" || result.status === "confirmation_required" || result.status === "checkout_link_not_found"
        ? 400
        : result.status === "idempotency_conflict" || result.status === "stale_link_state"
          ? 409
          : 503;
    return jsonError(status, result.status, result.message);
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
