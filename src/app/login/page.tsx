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
    email?: string;
    next?: string;
    mode?: string;
  }>;
};

const publisherAccountSetupPath = "/account/setup";

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return publisherAccountSetupPath;
  return value;
}

function safeInitialEmail(value: string | undefined) {
  const trimmed = value?.trim().toLowerCase() ?? "";
  if (!trimmed || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return "";
  return trimmed;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const adminState = await getCurrentAdminState();
  const nextPath = safeNextPath(params?.callbackURL ?? params?.next);
  const initialEmail = safeInitialEmail(params?.email);
  const initialMode = params?.mode === "sign-up" ? "sign-up" : "sign-in";

  return (
    <main className="route-page auth-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Account access</p>
          <h1>Publisher account access for Bumpgrade.</h1>
          <p className="lede">
            Sign in or create an account to set up your publisher workspace, reserve your Bumpgrade subdomain, and
            connect the paid plan from checkout.
          </p>
        </div>
        <div className="route-status-panel">
          <LockKeyhole aria-hidden="true" />
          <p>Auth status</p>
          <strong>{adminState.identity ? "Owner session" : "Publisher account"}</strong>
          <span>
            {adminState.identity
              ? "Owner routes will open for this session."
              : "Sign in or create a publisher account to continue setup."}
          </span>
        </div>
      </section>
      <section className="content-band">
        <AuthPanel initialState={adminState} initialMode={initialMode} initialEmail={initialEmail} nextPath={nextPath} />
      </section>
    </main>
  );
}
