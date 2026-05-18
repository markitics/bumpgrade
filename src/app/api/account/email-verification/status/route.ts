import { NextResponse } from "next/server";

import { getLatestAccountVerificationEmail } from "@/lib/account-verification-email";
import { createAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = await createAuth().api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Sign in before checking email verification." }, { status: 401 });
  }

  const latest = await getLatestAccountVerificationEmail(session.user.email);

  return NextResponse.json({
    ok: true,
    email: session.user.email.toLowerCase(),
    emailVerified: session.user.emailVerified === true,
    cooldownSeconds: latest?.resendAvailableInSeconds ?? 0,
    lastSent: latest
      ? {
          subject: latest.subject,
          status: latest.status,
          provider: latest.provider,
          source: latest.source,
          sentAt: latest.sentAt,
        }
      : null,
  });
}
