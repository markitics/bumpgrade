import { NextResponse } from "next/server";

import { pricingSourceData } from "@/lib/pricing-plans";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(pricingSourceData);
}
