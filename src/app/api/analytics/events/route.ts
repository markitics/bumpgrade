import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import { analyticsDashboard } from "@/lib/analytics-experiments";
import { recordAnalyticsEvent } from "@/lib/analytics-events";

type AnalyticsEventBody = {
  eventDefinitionId?: unknown;
  eventId?: unknown;
  sourceRoute?: unknown;
  idempotencyKey?: unknown;
  anonymousId?: unknown;
  publicProperties?: unknown;
};

type AnalyticsRuntime = {
  db: D1Database;
};

async function getRuntime(): Promise<AnalyticsRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

async function parseBody(request: NextRequest): Promise<AnalyticsEventBody> {
  try {
    return (await request.json()) as AnalyticsEventBody;
  } catch {
    return {};
  }
}

function requestClientIp(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

function publicProperties(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

export async function POST(request: NextRequest) {
  const { db } = await getRuntime();
  const body = await parseBody(request);
  const result = await recordAnalyticsEvent(db, analyticsDashboard.events, {
    eventDefinitionId:
      typeof body.eventDefinitionId === "string"
        ? body.eventDefinitionId
        : typeof body.eventId === "string"
          ? body.eventId
          : "",
    sourceRoute: typeof body.sourceRoute === "string" ? body.sourceRoute : "",
    idempotencyKey: typeof body.idempotencyKey === "string" ? body.idempotencyKey : "",
    anonymousId: typeof body.anonymousId === "string" ? body.anonymousId : null,
    publicProperties: publicProperties(body.publicProperties),
    requestIp: requestClientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, code: result.code, message: result.message }, { status: result.status });
  }

  return NextResponse.json(result);
}
