import { NextResponse } from "next/server";

import { agentManifest } from "@/lib/agent-manifest";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(agentManifest);
}
