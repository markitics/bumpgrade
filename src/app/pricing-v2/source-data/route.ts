import { NextResponse } from "next/server";

import { pricingV2SourceData } from "@/lib/pricing-v2";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(pricingV2SourceData);
}
