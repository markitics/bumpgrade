import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  createDraftProduct,
  getProductCreationSummary,
  productCreationApiRoute,
  productCreationConfirmationText,
  productCreationIssue,
  productCreationRedaction,
  productCreationStatus,
} from "@/lib/product-creation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductCreationRequestBody = {
  name?: string;
  slug?: string;
  kind?: string;
  description?: string;
  confirmationText?: string;
  idempotencyKey?: string;
};

async function parseBody(request: NextRequest): Promise<ProductCreationRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as ProductCreationRequestBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction: productCreationRedaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const summary = await getProductCreationSummary();
  return NextResponse.json({
    ok: true,
    status: productCreationStatus,
    issue: productCreationIssue,
    route: productCreationApiRoute,
    confirmation: {
      required: true,
      text: productCreationConfirmationText,
    },
    contract: summary,
    redaction: productCreationRedaction,
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
  const result = await createDraftProduct({
    name: body.name,
    slug: body.slug,
    kind: body.kind,
    description: body.description,
    confirmationText: body.confirmationText,
    idempotencyKey,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "invalid_request" || result.status === "confirmation_required" || result.status === "unsupported_product_kind"
        ? 400
        : result.status === "duplicate_slug" || result.status === "idempotency_conflict"
          ? 409
          : 503;
    return jsonError(status, result.status, result.message);
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
