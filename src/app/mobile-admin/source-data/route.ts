import { NextResponse } from "next/server";

import { getMobileAdminActionIntentSummary } from "@/lib/mobile-admin-actions";
import { mobileAdminContract } from "@/lib/mobile-admin";
import { getMobileAdminPrivateRowActionSummary } from "@/lib/mobile-admin-private-row-actions";
import { getMobileAdminPrivateRowsSummary } from "@/lib/mobile-admin-private-rows";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const actionIntentSummary = await getMobileAdminActionIntentSummary({ includeStaleStateTokens: false });
  const privateRowsSummary = await getMobileAdminPrivateRowsSummary();
  const privateRowActionSummary = await getMobileAdminPrivateRowActionSummary();

  return NextResponse.json({
    ...mobileAdminContract,
    privateRowsSummary,
    privateRowActionSummary,
    actionIntentSummary,
    caveat:
      "This is the shared mobile admin contract and scaffold plan. The iOS and Android first slices now have simulator/emulator smoke evidence, /mobile-admin/dashboard/source-data is the live public-safe dashboard bridge, and issue #414 renders the owner-session, private-row API, action-intent API, and confirmed-action requirements in the app scaffolds. /api/mobile-admin/private-rows is owner-session-only and read-only, /api/mobile-admin/private-rows/actions can mutate only low-risk private-row workflow state after owner confirmation, /api/mobile-admin/actions can record owner-gated audit-only action intents, and App Store/Play Store distribution, push notifications, and high-risk production mobile mutations are not live yet.",
  });
}
