import { NextRequest, NextResponse } from "next/server";

import { createAuth, getAppEnv } from "@/lib/auth";
import {
  getPublisherTenantD1OrThrow,
  PublisherTenantError,
  reservePublisherSubdomain,
  type PublisherSessionUser,
} from "@/lib/publisher-tenants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function wantsJson(request: NextRequest, formData: FormData) {
  return formValue(formData, "return") === "json" || (request.headers.get("accept") ?? "").includes("application/json");
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

async function maybeGrantTestPlanEntitlement(db: D1Database, user: PublisherSessionUser, request: NextRequest) {
  if (getAppEnv() !== "test" || request.headers.get("x-bumpgrade-test-plan") !== "allow") return;

  await db
    .prepare(
      `INSERT INTO publisher_plan_entitlements (
        id, owner_user_id, owner_email, status, source, plan_slug, starts_at, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, 'active', 'playwright_test_plan', 'publisher-test-plan', unixepoch(), ?, unixepoch(), unixepoch())
      ON CONFLICT(id) DO UPDATE SET
        owner_user_id = excluded.owner_user_id,
        owner_email = excluded.owner_email,
        status = excluded.status,
        updated_at = unixepoch()`,
    )
    .bind(
      `publisher-plan-entitlement-playwright-${user.id}`,
      user.id,
      user.email.trim().toLowerCase(),
      JSON.stringify({ sourceIssueNumber: 222, testOnly: true }),
    )
    .run();
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const json = wantsJson(request, formData);
  const user = await getSessionUser(request.headers);

  if (!user) {
    if (json) return NextResponse.json({ ok: false, error: "Publisher session required." }, { status: 401 });

    const login = new URL("/login", request.url);
    login.searchParams.set("callbackURL", "/account/setup");
    return NextResponse.redirect(login, { status: 303 });
  }

  try {
    const db = await getPublisherTenantD1OrThrow();
    await maybeGrantTestPlanEntitlement(db, user, request);
    const result = await reservePublisherSubdomain(db, user, {
      subdomain: formValue(formData, "subdomain"),
      idempotencyKey: formValue(formData, "idempotencyKey"),
    });

    if (json) {
      return NextResponse.json({
        ok: true,
        issue: 222,
        tenant: result.tenant,
        reservation: result.reservation,
        idempotent: result.idempotent,
      });
    }

    const redirect = new URL("/account/setup", request.url);
    redirect.searchParams.set("reserved", result.reservation.fullHostname);
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const status = error instanceof PublisherTenantError ? error.status : 503;
    const message = error instanceof Error ? error.message : "Unable to reserve that Bumpgrade subdomain.";
    const code = error instanceof PublisherTenantError ? error.code : "SUBDOMAIN_RESERVATION_FAILED";

    if (json) {
      return NextResponse.json({ ok: false, error: message, code, issue: 222 }, { status });
    }

    return redirectWithError(request, message);
  }
}
