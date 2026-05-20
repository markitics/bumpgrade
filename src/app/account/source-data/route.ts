import { NextResponse } from "next/server";

import { publisherTenantSourceData } from "@/lib/publisher-tenants";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(publisherTenantSourceData);
}
