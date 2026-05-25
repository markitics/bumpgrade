import { NextRequest, NextResponse } from "next/server";

import { createFunnelResourceDeliveryToken } from "@/lib/funnel-resource-delivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FunnelResourceDeliveryBody = {
  funnelSlug?: unknown;
  funnel_slug?: unknown;
  blockId?: unknown;
  block_id?: unknown;
  checkoutIntentId?: unknown;
  checkout_intent_id?: unknown;
  entitlementId?: unknown;
  entitlement_id?: unknown;
};

async function parseBody(request: NextRequest): Promise<FunnelResourceDeliveryBody> {
  try {
    return (await request.json()) as FunnelResourceDeliveryBody;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request);
  const result = await createFunnelResourceDeliveryToken({
    funnelSlug: body.funnelSlug ?? body.funnel_slug,
    blockId: body.blockId ?? body.block_id,
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
