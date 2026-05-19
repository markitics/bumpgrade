import { NextResponse } from "next/server";

import { productAccessSourceData } from "@/lib/product-access";
import { getProductEntitlementInspectionSummary } from "@/lib/product-entitlement-inspection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const entitlementInspection = await getProductEntitlementInspectionSummary();

  return NextResponse.json({
    ...productAccessSourceData,
    entitlementInspection,
  });
}
