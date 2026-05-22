import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";

import { AuthPanel } from "@/components/auth-panel";
import { getCurrentAdminState } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Log in / sign up",
  description: "Log in or create a Bumpgrade publisher account.",
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
            Sign in or create an account to set up your publisher workspace, connect the paid plan from checkout,
            reserve your Bumpgrade subdomain, and manage your launch.
          </p>
        </div>
        <div className="route-status-panel">
          <LockKeyhole aria-hidden="true" />
          <p>Account status</p>
          <strong>{adminState.identity ? "Signed in" : "Ready for account access"}</strong>
          <span>
            {adminState.identity
              ? "Your publisher workspace can open from this session."
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
