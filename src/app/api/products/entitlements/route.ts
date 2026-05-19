import { NextRequest, NextResponse } from "next/server";

import {
  customerProductEntitlementApiRoute,
  customerProductEntitlementLookupContract,
  getCustomerProductEntitlementLookup,
} from "@/lib/customer-product-entitlements";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusCodeFor(lookupStatus: string) {
  if (lookupStatus === "invalid") return 400;
  if (lookupStatus === "not_found") return 404;
  return 200;
}

export async function GET(request: NextRequest) {
  const checkoutIntentId = request.nextUrl.searchParams.get("checkoutIntentId");
  const lookup = await getCustomerProductEntitlementLookup(checkoutIntentId);

  return NextResponse.json(
    {
      ok: lookup.lookupStatus !== "invalid" && lookup.lookupStatus !== "not_found" && lookup.lookupStatus !== "unavailable",
      route: customerProductEntitlementApiRoute,
      contract: customerProductEntitlementLookupContract,
      lookup,
    },
    { status: statusCodeFor(lookup.lookupStatus) },
  );
}
