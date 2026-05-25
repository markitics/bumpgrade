import { NextRequest, NextResponse } from "next/server";

import { createAuth } from "@/lib/auth";
import {
  createFreeBuildWorkspace,
  getPublisherTenantD1OrThrow,
  PublisherTenantError,
  publisherFreeBuildParentIssue,
  publisherFreeBuildIssue,
  publisherFreeBuildWorkspaceConfirmationText,
  type PublisherSessionUser,
} from "@/lib/publisher-tenants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestPayload = {
  get: (key: string) => string;
};

function publicTenant(tenant: Awaited<ReturnType<typeof createFreeBuildWorkspace>>["tenant"]) {
  return {
    id: tenant.id,
    displayName: tenant.displayName,
    status: tenant.status,
    planStatus: tenant.planStatus,
    defaultSubdomain: tenant.defaultSubdomain,
    primaryHostname: tenant.primaryHostname,
    sourceIssueNumber: tenant.sourceIssueNumber,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function payloadValue(payload: RequestPayload, key: string) {
  return payload.get(key);
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
    payloadValue(payload, "return") === "json" ||
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

function redirectWithError(request: NextRequest, message: string) {
  const redirect = new URL("/account/setup", request.url);
  redirect.searchParams.set("error", message);
  return NextResponse.redirect(redirect, { status: 303 });
}

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  const json = wantsJson(request, payload);
  const user = await getSessionUser(request.headers);

  if (!user) {
    if (json) return NextResponse.json({ ok: false, error: "Publisher session required." }, { status: 401 });

    const login = new URL("/login", request.url);
    login.searchParams.set("callbackURL", "/account/setup");
    return NextResponse.redirect(login, { status: 303 });
  }

  try {
    const confirmationText = payloadValue(payload, "confirmationText").trim();
    if (confirmationText !== publisherFreeBuildWorkspaceConfirmationText) {
      throw new PublisherTenantError("Confirm the Free Build workspace action before continuing.", 400, "CONFIRMATION_REQUIRED");
    }

    const db = await getPublisherTenantD1OrThrow();
    const result = await createFreeBuildWorkspace(db, user, {
      confirmationText,
      idempotencyKey: payloadValue(payload, "idempotencyKey"),
    });

    if (json) {
      return NextResponse.json({
        ok: true,
        issue: publisherFreeBuildIssue,
        parentIssue: publisherFreeBuildParentIssue,
        tenant: publicTenant(result.tenant),
        planStatus: result.planStatus,
        idempotent: result.idempotent,
        paidGoLiveRequired: result.paidGoLiveRequired,
        redaction: {
          rawOwnerDataIncluded: false,
          publicPublishingEnabled: !result.paidGoLiveRequired,
        },
      });
    }

    const redirect = new URL("/account/setup", request.url);
    redirect.searchParams.set("freeBuild", "created");
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const status = error instanceof PublisherTenantError ? error.status : 503;
    const message = error instanceof Error ? error.message : "Unable to create that Free Build workspace.";
    const code = error instanceof PublisherTenantError ? error.code : "FREE_BUILD_WORKSPACE_FAILED";

    if (json) {
      return NextResponse.json(
        { ok: false, error: message, code, issue: publisherFreeBuildIssue, parentIssue: publisherFreeBuildParentIssue },
        { status },
      );
    }

    return redirectWithError(request, message);
  }
}
