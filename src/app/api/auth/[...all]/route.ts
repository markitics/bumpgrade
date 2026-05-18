import { toNextJsHandler } from "better-auth/next-js";
import { createEmailVerificationToken } from "better-auth/api";

import {
  ACCOUNT_VERIFICATION_EMAIL_FAILURE_MESSAGE,
  logAccountVerificationEmailFailure,
  sendAccountVerificationEmail,
} from "@/lib/account-verification-email";
import { createAuth, getBetterAuthSecret, getRuntimeEnvValue } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_VERIFICATION_EXPIRES_IN_SECONDS = 60 * 60;

function handlers() {
  return toNextJsHandler(createAuth());
}

function authEndpointBaseURL() {
  const configuredURL =
    getRuntimeEnvValue("BETTER_AUTH_URL") ?? getRuntimeEnvValue("PUBLIC_SITE_URL") ?? "http://localhost:3000";
  const url = new URL(configuredURL);
  const pathname = url.pathname.replace(/\/$/, "");

  if (pathname !== "/api/auth") {
    url.pathname = `${pathname === "" ? "" : pathname}/api/auth`;
  }

  return url.toString().replace(/\/$/, "");
}

function isSendVerificationEmailRequest(request: Request) {
  return new URL(request.url).pathname.endsWith("/api/auth/send-verification-email");
}

function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function parseSendVerificationPayload(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    email?: unknown;
    callbackURL?: unknown;
  } | null;

  if (!payload || !validEmail(payload.email)) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  return {
    ok: true as const,
    email: payload.email.trim().toLowerCase(),
    callbackURL: typeof payload.callbackURL === "string" ? payload.callbackURL : "/",
  };
}

async function handleSignedInVerificationEmailResend(request: Request): Promise<Response | null> {
  const payload = await parseSendVerificationPayload(request);
  if (!payload.ok) {
    return Response.json({ ok: false, status: false, error: payload.error }, { status: 400 });
  }

  const auth = createAuth();
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
  const user = session?.user;

  if (!user?.email) return null;

  if (user.email.trim().toLowerCase() !== payload.email) {
    return Response.json(
      {
        ok: false,
        status: false,
        code: "EMAIL_MISMATCH",
        error: "Signed-in email does not match the requested confirmation email.",
      },
      { status: 400 },
    );
  }

  if (user.emailVerified === true) {
    return Response.json(
      {
        ok: false,
        status: false,
        code: "EMAIL_ALREADY_VERIFIED",
        error: "Email is already verified.",
      },
      { status: 400 },
    );
  }

  const token = await createEmailVerificationToken(
    getBetterAuthSecret(),
    user.email,
    undefined,
    DEFAULT_VERIFICATION_EXPIRES_IN_SECONDS,
  );
  const callbackURL = encodeURIComponent(payload.callbackURL);
  const url = `${authEndpointBaseURL()}/verify-email?token=${encodeURIComponent(token)}&callbackURL=${callbackURL}`;
  const result = await sendAccountVerificationEmail({ user, url, source: "signed-in-resend" });

  if (!result.ok) {
    logAccountVerificationEmailFailure({ user, url, source: "signed-in-resend", result });

    return Response.json(
      {
        ok: false,
        status: false,
        error: ACCOUNT_VERIFICATION_EMAIL_FAILURE_MESSAGE,
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, status: true, provider: result.provider });
}

function authUnavailable(error: unknown) {
  console.error("better auth request failed", error);

  return Response.json(
    {
      ok: false,
      error: "Bumpgrade authentication is not configured.",
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  try {
    return await handlers().GET(request);
  } catch (error) {
    return authUnavailable(error);
  }
}

export async function POST(request: Request) {
  try {
    if (isSendVerificationEmailRequest(request)) {
      const response = await handleSignedInVerificationEmailResend(request.clone() as unknown as Request);
      if (response) return response;
    }

    return await handlers().POST(request);
  } catch (error) {
    return authUnavailable(error);
  }
}
