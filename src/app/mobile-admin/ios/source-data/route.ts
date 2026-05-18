import { NextResponse } from "next/server";

import { iosMobileAdminSourceData } from "@/lib/mobile-admin-ios";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(iosMobileAdminSourceData);
}
