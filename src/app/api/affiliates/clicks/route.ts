import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import { affiliateProgram } from "@/lib/affiliate-referrals";
import { recordReferralClick } from "@/lib/referral-clicks";

type ReferralClickBody = {
  referralLinkId?: unknown;
  code?: unknown;
  destinationRoute?: unknown;
  idempotencyKey?: unknown;
  anonymousVisitorKey?: unknown;
};

type AffiliateRuntime = {
  db: D1Database;
};

async function getRuntime(): Promise<AffiliateRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

async function parseBody(request: NextRequest): Promise<ReferralClickBody> {
  try {
    return (await request.json()) as ReferralClickBody;
  } catch {
    return {};
  }
}

function requestClientIp(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function POST(request: NextRequest) {
  const { db } = await getRuntime();
  const body = await parseBody(request);
  const result = await recordReferralClick(db, affiliateProgram.referralLinks, {
    referralLinkId: typeof body.referralLinkId === "string" ? body.referralLinkId : undefined,
    code: typeof body.code === "string" ? body.code : undefined,
    destinationRoute: typeof body.destinationRoute === "string" ? body.destinationRoute : "",
    idempotencyKey: typeof body.idempotencyKey === "string" ? body.idempotencyKey : "",
    anonymousVisitorKey: typeof body.anonymousVisitorKey === "string" ? body.anonymousVisitorKey : null,
    referrer: request.headers.get("referer"),
    requestIp: requestClientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, code: result.code, message: result.message }, { status: result.status });
  }

  return NextResponse.json(result);
}
