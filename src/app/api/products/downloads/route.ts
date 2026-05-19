import { NextRequest, NextResponse } from "next/server";

import { consumeProductDownloadToken } from "@/lib/product-download-tokens";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const result = await consumeProductDownloadToken(token);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
        redaction: {
          buyerEmailIncluded: false,
          buyerEmailHashIncluded: false,
          rawStripeIdsIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          metadataJsonIncluded: false,
        },
      },
      { status: result.status },
    );
  }

  const body = [
    "Bumpgrade sandbox download",
    `Product: ${result.asset.productTitle}`,
    `Asset: ${result.asset.assetTitle}`,
    `Checkout intent: ${result.checkoutIntentId}`,
    `Entitlement: ${result.entitlementId}`,
    "",
    "This is a sandbox placeholder file. No private R2 object key or signed object URL is exposed.",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${result.asset.assetId}.txt"`,
      "cache-control": "no-store",
      "x-bumpgrade-redaction": "private-r2-keys=false; signed-urls=false; buyer-email=false",
    },
  });
}
