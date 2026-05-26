import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  anonymousPlaygroundCleanupApiRoute,
  anonymousPlaygroundCleanupConfirmationText,
  anonymousPlaygroundIssue,
  anonymousPlaygroundSourceData,
  anonymousPlaygroundSourceDataRoute,
  anonymousPlaygroundRedaction,
  cleanupExpiredAnonymousPlaygroundWorkspaces,
  getOptionalAnonymousPlaygroundD1,
  AnonymousPlaygroundError,
} from "@/lib/anonymous-playground";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestPayload = {
  get: (key: string) => string;
};

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

async function readPayload(request: NextRequest): Promise<RequestPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    const values = new Map<string, string>();

    if (body && typeof body === "object" && !Array.isArray(body)) {
      for (const [key, value] of Object.entries(body)) {
        const stringified = stringValue(value);
        if (stringified) values.set(key, stringified);
      }
    }

    return { get: (key) => values.get(key) ?? "" };
  }

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return {
      get: (key) => {
        const value = formData.get(key);
        return typeof value === "string" ? value : "";
      },
    };
  }

  return { get: () => "" };
}

function optionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function jsonError(status: number, code: string, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ok: false,
      code,
      error,
      issue: anonymousPlaygroundIssue,
      route: anonymousPlaygroundCleanupApiRoute,
      sourceDataRoute: anonymousPlaygroundSourceDataRoute,
      redaction: anonymousPlaygroundRedaction(),
      ...(extra ?? {}),
    },
    { status },
  );
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "OWNER_SESSION_REQUIRED", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    issue: anonymousPlaygroundIssue,
    route: anonymousPlaygroundCleanupApiRoute,
    sourceDataRoute: anonymousPlaygroundSourceDataRoute,
    confirmation: { required: true, text: anonymousPlaygroundCleanupConfirmationText },
    retentionPolicy: anonymousPlaygroundSourceData.retentionPolicy,
    cleanupResult: anonymousPlaygroundSourceData.cleanupResult,
    redaction: anonymousPlaygroundRedaction(),
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "OWNER_SESSION_REQUIRED", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const db = await getOptionalAnonymousPlaygroundD1();
  if (!db) return jsonError(503, "DB_UNAVAILABLE", "Playground storage is unavailable in this runtime.");

  const payload = await readPayload(request);

  try {
    const result = await cleanupExpiredAnonymousPlaygroundWorkspaces(db, {
      confirmationText: payload.get("confirmationText"),
      idempotencyKey: payload.get("idempotencyKey") || request.headers.get("idempotency-key")?.trim() || "",
      batchLimit: optionalNumber(payload.get("batchLimit")),
      actor: adminState.identity,
    });

    return NextResponse.json({
      ok: true,
      issue: anonymousPlaygroundIssue,
      route: anonymousPlaygroundCleanupApiRoute,
      sourceDataRoute: anonymousPlaygroundSourceDataRoute,
      result,
      redaction: anonymousPlaygroundRedaction(),
    });
  } catch (error) {
    const status = error instanceof AnonymousPlaygroundError ? error.status : 503;
    const code = error instanceof AnonymousPlaygroundError ? error.code : "ANONYMOUS_PLAYGROUND_CLEANUP_FAILED";
    const message = error instanceof Error ? error.message : "Unable to clean up anonymous playgrounds.";
    return jsonError(status, code, message);
  }
}
