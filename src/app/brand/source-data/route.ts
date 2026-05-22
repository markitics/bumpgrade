import { NextResponse } from "next/server";

import { brandSourceData } from "@/lib/brand";

export function GET() {
  return NextResponse.json(brandSourceData);
}
