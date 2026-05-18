import { NextResponse } from "next/server";

import { androidMobileAdminSourceData } from "@/lib/mobile-admin-android";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(androidMobileAdminSourceData);
}
