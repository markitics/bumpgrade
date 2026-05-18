import { NextResponse } from "next/server";

import { contentSourceData } from "@/lib/content-surfaces";

export function GET() {
  return NextResponse.json(contentSourceData);
}
