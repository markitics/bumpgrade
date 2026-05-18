import { NextResponse } from "next/server";

import { getAdminSurfaceData } from "@/lib/admin-surface-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getAdminSurfaceData();
  return NextResponse.json({
    id: "bumpgrade-admin-user-journeys-source-data",
    source: data.source,
    loadError: data.loadError,
    journeys: data.userJourneys,
  });
}
