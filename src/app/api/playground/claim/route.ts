import { NextRequest, NextResponse } from "next/server";

import {
  anonymousPlaygroundClaimConfirmationText,
  anonymousPlaygroundCookieName,
  anonymousPlaygroundIssue,
  anonymousPlaygroundRoute,
  anonymousPlaygroundSourceDataRoute,
  anonymousPlaygroundRedaction,
  claimAnonymousPlaygroundWorkspace,
  getOptionalAnonymousPlaygroundD1,
  isLikelyAnonymousPlaygroundToken,
  publicAnonymousPlaygroundClaimedDraft,
  publicAnonymousPlaygroundWorkspace,
  AnonymousPlaygroundError,
} from "@/lib/anonymous-playground";
import { createAuth } from "@/lib/auth";
import { PublisherTenantError, type PublisherSessionUser } from "@/lib/publisher-tenants";

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

async function getSessionUser(headers: Headers): Promise<PublisherSessionUser | null> {
  const session = await createAuth().api.getSession({ headers }).catch(() => null);
  const user = session?.user;

  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified === true,
  };
}

function jsonError(status: number, code: string, error: string) {
  return NextResponse.json(
    {
      ok: false,
      code,
      error,
      issue: anonymousPlaygroundIssue,
      sourceDataRoute: anonymousPlaygroundSourceDataRoute,
      redaction: anonymousPlaygroundRedaction(),
    },
    { status },
  );
}

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  const json = wantsJson(request, payload);
  const token = request.cookies.get(anonymousPlaygroundCookieName)?.value;
  const user = await getSessionUser(request.headers);

  if (!user) {
    if (json) return jsonError(401, "PUBLISHER_SESSION_REQUIRED", "Sign in before attaching this playground.");
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackURL", anonymousPlaygroundRoute);
    return NextResponse.redirect(login, { status: 303 });
  }

  if (payload.get("confirmationText").trim() !== anonymousPlaygroundClaimConfirmationText) {
    if (json) return jsonError(400, "CONFIRMATION_REQUIRED", "Confirm the playground attachment before continuing.");
    const redirect = new URL(anonymousPlaygroundRoute, request.url);
    redirect.searchParams.set("error", "Confirm the playground attachment before continuing.");
    return NextResponse.redirect(redirect, { status: 303 });
  }

  if (!isLikelyAnonymousPlaygroundToken(token)) {
    if (json) return jsonError(404, "PLAYGROUND_NOT_FOUND", "No saved playground was found for this browser.");
    const redirect = new URL(anonymousPlaygroundRoute, request.url);
    redirect.searchParams.set("error", "No saved playground was found for this browser.");
    return NextResponse.redirect(redirect, { status: 303 });
  }

  const db = await getOptionalAnonymousPlaygroundD1();
  if (!db) {
    if (json) return jsonError(503, "DB_UNAVAILABLE", "Playground storage is unavailable in this runtime.");
    const redirect = new URL(anonymousPlaygroundRoute, request.url);
    redirect.searchParams.set("error", "Playground storage is unavailable in this runtime.");
    return NextResponse.redirect(redirect, { status: 303 });
  }

  try {
    const result = await claimAnonymousPlaygroundWorkspace(db, token, user);

    if (json) {
      return NextResponse.json({
        ok: true,
        issue: anonymousPlaygroundIssue,
        sourceDataRoute: anonymousPlaygroundSourceDataRoute,
        workspace: publicAnonymousPlaygroundWorkspace(result.workspace),
        draft: publicAnonymousPlaygroundClaimedDraft(result.draft),
        tenant: {
          id: result.tenant.id,
          status: result.tenant.status,
          planStatus: result.tenant.planStatus,
          defaultSubdomain: result.tenant.defaultSubdomain,
          primaryHostname: result.tenant.primaryHostname,
          sourceIssueNumber: result.tenant.sourceIssueNumber,
        },
        idempotent: result.idempotent,
        paidGoLiveRequired: result.paidGoLiveRequired,
        redaction: anonymousPlaygroundRedaction({ workspaceIncluded: true }),
      });
    }

    const redirect = new URL(anonymousPlaygroundRoute, request.url);
    redirect.searchParams.set("claimed", "1");
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const status =
      error instanceof AnonymousPlaygroundError || error instanceof PublisherTenantError ? error.status : 503;
    const code =
      error instanceof AnonymousPlaygroundError || error instanceof PublisherTenantError
        ? error.code
        : "ANONYMOUS_PLAYGROUND_CLAIM_FAILED";
    const message = error instanceof Error ? error.message : "Unable to attach that playground.";

    if (json) return jsonError(status, code, message);

    const redirect = new URL(anonymousPlaygroundRoute, request.url);
    redirect.searchParams.set("error", message);
    return NextResponse.redirect(redirect, { status: 303 });
  }
}
