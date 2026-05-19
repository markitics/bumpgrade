import { NextResponse } from "next/server";

import { mobileAdminContract } from "@/lib/mobile-admin";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    ...mobileAdminContract,
    caveat:
      "This is the shared mobile admin contract and scaffold plan. The iOS and Android first slices now have simulator/emulator smoke evidence, and /mobile-admin/dashboard/source-data is the live public-safe dashboard bridge, but App Store/Play Store distribution, private mobile auth, push notifications, and mobile writes are not live yet.",
  });
}
