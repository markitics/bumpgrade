import { NextRequest, NextResponse } from "next/server";

import { getCustomerProductEntitlementLookup } from "@/lib/customer-product-entitlements";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const checkoutIntentId =
    request.nextUrl.searchParams.get("checkoutIntentId") ?? request.nextUrl.searchParams.get("checkout_intent_id");
  const lookup = await getCustomerProductEntitlementLookup(checkoutIntentId);
  const status = lookup.source === "invalid" ? 400 : 200;

  return NextResponse.json(lookup, { status });
}
