import { NextResponse } from "next/server";

import { checkoutOfferSourceData } from "@/lib/checkout-offers";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(checkoutOfferSourceData);
}
