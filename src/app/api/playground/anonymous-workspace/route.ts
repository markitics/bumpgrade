import { NextRequest, NextResponse } from "next/server";

import {
  anonymousPlaygroundApiRoute,
  anonymousPlaygroundCookieMaxAgeSeconds,
  anonymousPlaygroundCookieName,
  anonymousPlaygroundIssue,
  anonymousPlaygroundRoute,
  anonymousPlaygroundSourceDataRoute,
  anonymousPlaygroundUpdatedAt,
  anonymousPlaygroundRedaction,
  createAnonymousPlaygroundRecoveryToken,
  getOptionalAnonymousPlaygroundD1,
  isLikelyAnonymousPlaygroundToken,
  publicAnonymousPlaygroundWorkspace,
  saveAnonymousPlaygroundWorkspace,
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

function wantsJson(request: NextRequest, payload: RequestPayload) {
  return (
    payload.get("return") === "json" ||
    (request.headers.get("accept") ?? "").includes("application/json") ||
    (request.headers.get("content-type") ?? "").includes("application/json")
  );
}

function jsonError(status: number, code: string, error: string) {
  return NextResponse.json(
    {
      ok: false,
      code,
      error,
      issue: anonymousPlaygroundIssue,
      route: anonymousPlaygroundApiRoute,
      sourceDataRoute: anonymousPlaygroundSourceDataRoute,
      redaction: anonymousPlaygroundRedaction(),
    },
    { status },
  );
}

function setRecoveryCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: anonymousPlaygroundCookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: anonymousPlaygroundCookieMaxAgeSeconds,
  });
}

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  const json = wantsJson(request, payload);
  const db = await getOptionalAnonymousPlaygroundD1();

  if (!db) {
    if (json) return jsonError(503, "DB_UNAVAILABLE", "Playground storage is unavailable in this runtime.");
    const redirect = new URL(anonymousPlaygroundRoute, request.url);
    redirect.searchParams.set("error", "Playground storage is unavailable in this runtime.");
    return NextResponse.redirect(redirect, { status: 303 });
  }

  const existingToken = request.cookies.get(anonymousPlaygroundCookieName)?.value;
  const token = isLikelyAnonymousPlaygroundToken(existingToken)
    ? existingToken
    : createAnonymousPlaygroundRecoveryToken();

  try {
    const result = await saveAnonymousPlaygroundWorkspace(db, token, {
      offerName: payload.get("offerName"),
      audience: payload.get("audience"),
      launchGoal: payload.get("launchGoal"),
      productFormat: payload.get("productFormat"),
      pricePoint: payload.get("pricePoint"),
      leadMagnet: payload.get("leadMagnet"),
      checkoutPlan: payload.get("checkoutPlan"),
      deliveryPlan: payload.get("deliveryPlan"),
      followUpPlan: payload.get("followUpPlan"),
      sourceUrl: payload.get("sourceUrl"),
      selectedImporterSlug: payload.get("selectedImporterSlug"),
      idempotencyKey: payload.get("idempotencyKey"),
    });

    if (json) {
      const response = NextResponse.json({
        ok: true,
        issue: anonymousPlaygroundIssue,
        route: anonymousPlaygroundApiRoute,
        sourceDataRoute: anonymousPlaygroundSourceDataRoute,
        updatedAt: anonymousPlaygroundUpdatedAt,
        idempotent: result.idempotent,
        workspace: publicAnonymousPlaygroundWorkspace(result.workspace),
        rateLimit: result.rateLimit,
        paidGoLiveRequired: true,
        redaction: anonymousPlaygroundRedaction({ workspaceIncluded: true }),
      });
      setRecoveryCookie(response, token);
      return response;
    }

    const redirect = new URL(anonymousPlaygroundRoute, request.url);
    redirect.searchParams.set("saved", "1");
    const response = NextResponse.redirect(redirect, { status: 303 });
    setRecoveryCookie(response, token);
    return response;
  } catch (error) {
    const status = error instanceof AnonymousPlaygroundError ? error.status : 503;
    const code = error instanceof AnonymousPlaygroundError ? error.code : "ANONYMOUS_PLAYGROUND_SAVE_FAILED";
    const message = error instanceof Error ? error.message : "Unable to save that playground.";

    if (json) return jsonError(status, code, message);

    const redirect = new URL(anonymousPlaygroundRoute, request.url);
    redirect.searchParams.set("error", message);
    const response = NextResponse.redirect(redirect, { status: 303 });
    if (isLikelyAnonymousPlaygroundToken(token)) setRecoveryCookie(response, token);
    return response;
  }
}
