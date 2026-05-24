import { NextResponse } from "next/server";

import { getMobileAdminActionIntentSummary } from "@/lib/mobile-admin-actions";
import { mobileAdminContract } from "@/lib/mobile-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const actionIntentSummary = await getMobileAdminActionIntentSummary({ includeStaleStateTokens: false });

  return NextResponse.json({
    ...mobileAdminContract,
    actionIntentSummary,
    caveat:
      "This is the shared mobile admin contract and scaffold plan. The iOS and Android first slices now have simulator/emulator smoke evidence, /mobile-admin/dashboard/source-data is the live public-safe dashboard bridge, and issue #414 renders the owner-session plus confirmed-action requirements in the app scaffolds. /api/mobile-admin/actions can record owner-gated audit-only action intents, but App Store/Play Store distribution, private mobile rows, push notifications, and production mobile mutations are not live yet.",
  });
}
