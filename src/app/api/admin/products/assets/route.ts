import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  createProductAssetUploadIntent,
  getProductAssetUploadIntentSummary,
  productAssetUploadConfirmationText,
  productAssetUploadIntentApiRoute,
  productAssetUploadIntentIssue,
  productAssetUploadIntentStatus,
  productAssetUploadRedaction,
} from "@/lib/product-asset-uploads";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductAssetUploadRequestBody = {
  productId?: string;
  assetId?: string;
  fileName?: string;
  contentType?: string;
  bodyText?: string;
  bodyBase64?: string;
  confirmationText?: string;
  idempotencyKey?: string;
  expectedCatalogRevisionId?: string;
};

async function parseBody(request: NextRequest): Promise<ProductAssetUploadRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as ProductAssetUploadRequestBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction: productAssetUploadRedaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const summary = await getProductAssetUploadIntentSummary();
  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: productAssetUploadIntentStatus,
    issue: productAssetUploadIntentIssue,
    route: productAssetUploadIntentApiRoute,
    confirmation: {
      required: true,
      text: productAssetUploadConfirmationText,
    },
    contract: summary,
    redaction: productAssetUploadRedaction,
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
  const result = await createProductAssetUploadIntent({
    productId: body.productId,
    assetId: body.assetId,
    fileName: body.fileName,
    contentType: body.contentType,
    bodyText: body.bodyText,
    bodyBase64: body.bodyBase64,
    confirmationText: body.confirmationText,
    idempotencyKey,
    expectedCatalogRevisionId: body.expectedCatalogRevisionId,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "invalid_request" || result.status === "confirmation_required"
        ? 400
        : result.status === "unsupported_asset"
          ? 404
          : result.status === "stale_catalog_revision" || result.status === "idempotency_conflict"
            ? 409
            : 503;
    return jsonError(status, result.status, result.message);
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
