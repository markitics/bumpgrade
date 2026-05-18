import { NextResponse } from "next/server";

import { analyticsExperimentsSourceData } from "@/lib/analytics-experiments";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(analyticsExperimentsSourceData);
}
