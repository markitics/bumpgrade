import { NextResponse } from "next/server";

import { funnelSourceData } from "@/lib/funnels";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(funnelSourceData);
}
