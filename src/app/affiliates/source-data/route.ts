import { NextResponse } from "next/server";

import { affiliateReferralsSourceData } from "@/lib/affiliate-referrals";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(affiliateReferralsSourceData);
}
