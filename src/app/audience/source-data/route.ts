import { NextResponse } from "next/server";

import { audienceAutomationSourceData } from "@/lib/audience-automation";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(audienceAutomationSourceData);
}
