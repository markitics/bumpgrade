import { NextRequest, NextResponse } from "next/server";

import { createProductDownloadToken } from "@/lib/product-download-tokens";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DownloadTokenRequestBody = {
  checkoutIntentId?: string;
  checkout_intent_id?: string;
  entitlementId?: string;
  entitlement_id?: string;
};

async function parseBody(request: NextRequest): Promise<DownloadTokenRequestBody> {
  if (!request.body) return {};
  try {
    return (await request.json()) as DownloadTokenRequestBody;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request);
  const result = await createProductDownloadToken({
    checkoutIntentId: body.checkoutIntentId ?? body.checkout_intent_id,
    entitlementId: body.entitlementId ?? body.entitlement_id,
  });

  const status = result.ok
    ? 201
    : result.status === "invalid_request"
      ? 400
      : result.status === "not_found"
        ? 404
        : result.status === "not_eligible"
          ? 409
          : 503;

  return NextResponse.json(result, { status });
}
