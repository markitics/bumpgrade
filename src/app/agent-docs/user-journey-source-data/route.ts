import { NextResponse } from "next/server";

import { getUserJourneySourceDataPayload } from "@/lib/public-admin-source-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(await getUserJourneySourceDataPayload());
}
