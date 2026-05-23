import { NextResponse } from "next/server";

import { getAdminSurfaceData } from "@/lib/admin-surface-data";
import { buildDirectorStatusData } from "@/lib/director-status";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getAdminSurfaceData();
  return NextResponse.json(buildDirectorStatusData(data));
}
