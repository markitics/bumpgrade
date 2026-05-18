import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import { parseIntentMetadata, type CheckoutIntentRow } from "@/lib/sandbox-checkout";

type RouteParams = {
  params: Promise<{
    intentId: string;
  }>;
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as Cloudflare.Env).DB;
  if (!db) throw new Error("Cloudflare D1 binding DB is not available.");
  return db;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { intentId } = await params;
  const db = await getDb();
  const intent = await db
    .prepare("SELECT * FROM checkout_intents WHERE id = ?")
    .bind(intentId)
    .first<CheckoutIntentRow>();

  if (!intent || intent.status !== "stripe_session_created") {
    return NextResponse.json({ ok: false, code: "checkout_redirect_not_available" }, { status: 404 });
  }

  const metadata = parseIntentMetadata(intent);
  const stripeCheckoutUrl = typeof metadata.stripe_checkout_url === "string" ? metadata.stripe_checkout_url : null;

  if (!stripeCheckoutUrl) {
    return NextResponse.json({ ok: false, code: "checkout_url_not_available" }, { status: 404 });
  }

  return NextResponse.redirect(stripeCheckoutUrl, 303);
}

