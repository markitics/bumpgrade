import { NextResponse } from "next/server";

import { productAccessSourceData } from "@/lib/product-access";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(productAccessSourceData);
}
