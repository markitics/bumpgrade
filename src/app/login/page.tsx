import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";

import { AuthPanel } from "@/components/auth-panel";
import { getCurrentAdminState } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Log in / sign up",
  description: "Bumpgrade publisher and owner authentication.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LoginPageProps = {
  searchParams?: Promise<{
    callbackURL?: string;
    next?: string;
    mode?: string;
  }>;
};

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin/roadmap";
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const adminState = await getCurrentAdminState();
  const nextPath = safeNextPath(params?.callbackURL ?? params?.next);
  const initialMode = params?.mode === "sign-up" ? "sign-up" : "sign-in";

  return (
    <main className="route-page auth-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Account access</p>
          <h1>Publisher login is backed by Better Auth.</h1>
          <p className="lede">
            Bumpgrade now stores accounts and sessions in Cloudflare D1. Owner-only admin access uses the
            allowlist gate while publisher features are built out.
          </p>
        </div>
        <div className="route-status-panel">
          <LockKeyhole aria-hidden="true" />
          <p>Auth status</p>
          <strong>{adminState.identity ? "Owner session" : "Better Auth"}</strong>
          <span>{adminState.identity ? "Admin routes will open for this session." : "Sign in or create a publisher account."}</span>
        </div>
      </section>
      <section className="content-band">
        <AuthPanel initialState={adminState} initialMode={initialMode} nextPath={nextPath} />
      </section>
    </main>
  );
}
