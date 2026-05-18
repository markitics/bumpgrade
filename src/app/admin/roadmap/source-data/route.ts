import { NextResponse } from "next/server";

import { adminRoadmapCounts, getAdminSurfaceData } from "@/lib/admin-surface-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getAdminSurfaceData();
  return NextResponse.json({
    id: "bumpgrade-admin-roadmap-source-data",
    source: data.source,
    loadError: data.loadError,
    counts: adminRoadmapCounts(data.roadmapItems),
    records: data.roadmapItems,
  });
}
