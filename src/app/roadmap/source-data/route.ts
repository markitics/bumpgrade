import { NextResponse } from "next/server";

import { roadmapItems, roadmapLanes, roadmapUpdatedAt } from "@/lib/roadmap";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    id: "bumpgrade-roadmap-source-data",
    generatedFrom: "src/lib/roadmap.ts",
    updatedAt: roadmapUpdatedAt,
    caveat:
      "Public roadmap state is safe to show, but it is not a substitute for private admin records. Shipped means merged and deployed; planned means not live.",
    lanes: roadmapLanes,
    items: roadmapItems,
  });
}
