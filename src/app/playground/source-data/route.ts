import { NextResponse } from "next/server";

import { anonymousPlaygroundSourceData } from "@/lib/anonymous-playground";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(anonymousPlaygroundSourceData);
}
