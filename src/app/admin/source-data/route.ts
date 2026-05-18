import { NextResponse } from "next/server";

import { getAdminSurfaceData } from "@/lib/admin-surface-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getAdminSurfaceData();

  return NextResponse.json({
    id: "bumpgrade-admin-source-data",
    caveat:
      "Admin source data is public-safe until Better Auth protection ships. Do not store private notes, secrets, private user data, or raw provider identifiers here.",
    ...data,
  });
}
