import { NextResponse } from "next/server";

import { customerProofSourceData } from "@/lib/customer-proof";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(customerProofSourceData);
}
