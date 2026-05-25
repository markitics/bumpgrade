import { NextResponse } from "next/server";

import { importerSourceData } from "@/lib/importers";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(importerSourceData);
}
