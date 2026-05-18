import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import type { SessionAdminState } from "@/lib/admin-auth";

type AdminLockedProps = {
  state: SessionAdminState;
  surface: string;
};

function denialCopy(reason: SessionAdminState["denialReason"]) {
  if (reason === "not_allowlisted") {
    return "This account is signed in, but it is not on the Bumpgrade owner allowlist.";
  }

  if (reason === "email_unverified") {
    return "This owner email is signed in, but production admin access requires a verified email address.";
  }

  if (reason === "session_unavailable") {
    return "The admin session check could not reach Better Auth or D1.";
  }

  return "Sign in with an allowlisted Bumpgrade owner account to open this admin surface.";
}

export function AdminLocked({ state, surface }: AdminLockedProps) {
  const callbackURL = `/login?callbackURL=${encodeURIComponent(surface)}`;

  return (
    <main className="route-page admin-lock-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Protected admin</p>
          <h1>Owner access is required.</h1>
          <p className="lede">{denialCopy(state.denialReason)}</p>
          <div className="hero-actions">
            <Link href={callbackURL} className="primary-action">
              Log in / sign up
              <LockKeyhole aria-hidden="true" />
            </Link>
            <Link href="/admin/source-data" className="secondary-action">
              Public-safe JSON
              <ShieldCheck aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel">
          <ShieldCheck aria-hidden="true" />
          <p>Session state</p>
          <strong>{state.userEmail ?? "Signed out"}</strong>
          <span>{state.denialReason ?? "Owner session accepted."}</span>
        </aside>
      </section>
    </main>
  );
}
