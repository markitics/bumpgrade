import { NextResponse } from "next/server";

import { mobileAdminContract } from "@/lib/mobile-admin";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    ...mobileAdminContract,
    caveat:
      "This is the shared mobile admin contract and scaffold plan. It does not mean an iOS or Android app is installable yet; those app slices are tracked separately by issues #67 and #68.",
  });
}
