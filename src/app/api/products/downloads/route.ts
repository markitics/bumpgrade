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

  return new NextResponse(result.file.body, {
    status: 200,
    headers: {
      "content-type": result.file.contentType,
      "content-disposition": `attachment; filename="${result.file.fileName}"`,
      "cache-control": "no-store",
      "content-length": String(result.file.byteLength),
      "x-bumpgrade-delivery": "private-r2-fixture",
      "x-bumpgrade-redaction": "private-r2-keys=false; signed-urls=false; buyer-email=false",
    },
  });
}
