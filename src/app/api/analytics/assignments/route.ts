import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import { analyticsDashboard } from "@/lib/analytics-experiments";
import { assignExperimentVariant } from "@/lib/experiment-assignments";

type AnalyticsAssignmentBody = {
  experimentId?: unknown;
  sourceRoute?: unknown;
  anonymousAssignmentKey?: unknown;
  anonymousId?: unknown;
  idempotencyKey?: unknown;
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

async function parseBody(request: NextRequest): Promise<AnalyticsAssignmentBody> {
  try {
    return (await request.json()) as AnalyticsAssignmentBody;
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
  const result = await assignExperimentVariant(db, analyticsDashboard.experiments, {
    experimentId: typeof body.experimentId === "string" ? body.experimentId : "",
    sourceRoute: typeof body.sourceRoute === "string" ? body.sourceRoute : "",
    anonymousAssignmentKey:
      typeof body.anonymousAssignmentKey === "string"
        ? body.anonymousAssignmentKey
        : typeof body.anonymousId === "string"
          ? body.anonymousId
          : "",
    idempotencyKey: typeof body.idempotencyKey === "string" ? body.idempotencyKey : "",
    requestIp: requestClientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, code: result.code, message: result.message }, { status: result.status });
  }

  return NextResponse.json(result);
}
