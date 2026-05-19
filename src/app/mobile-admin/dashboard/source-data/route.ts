import { NextResponse } from "next/server";

import { getMobileAdminDashboardSourceData } from "@/lib/mobile-admin-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(await getMobileAdminDashboardSourceData());
}
