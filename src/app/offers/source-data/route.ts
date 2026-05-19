import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import { checkoutOfferSourceDataWithRuntime } from "@/lib/checkout-offers";

export const dynamic = "force-dynamic";

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as Cloudflare.Env).DB ?? null;
}

export async function GET() {
  return NextResponse.json(await checkoutOfferSourceDataWithRuntime(await getDb()));
}
