import { NextRequest, NextResponse } from "next/server";

import { deliverProductProtectedContent } from "@/lib/product-protected-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const result = await deliverProductProtectedContent({
    checkoutIntentId:
      request.nextUrl.searchParams.get("checkoutIntentId") ?? request.nextUrl.searchParams.get("checkout_intent_id"),
    entitlementId:
      request.nextUrl.searchParams.get("entitlementId") ?? request.nextUrl.searchParams.get("entitlement_id"),
    protectedContentId:
      request.nextUrl.searchParams.get("protectedContentId") ??
      request.nextUrl.searchParams.get("protected_content_id") ??
      request.nextUrl.searchParams.get("sectionId") ??
      request.nextUrl.searchParams.get("section_id"),
  });

  const status = result.ok
    ? 200
    : result.status === "invalid_request"
      ? 400
      : result.status === "not_found"
        ? 404
        : result.status === "not_eligible"
          ? 409
          : 503;

  return NextResponse.json(result, { status });
}
