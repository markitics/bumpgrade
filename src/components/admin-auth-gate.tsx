import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { EmailVerificationActions } from "@/components/email-verification-actions";
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

function denialTitle(reason: SessionAdminState["denialReason"]) {
  if (reason === "email_unverified") return "Email not yet verified.";
  return "Owner access is required.";
}

function denialLabel(reason: SessionAdminState["denialReason"]) {
  if (reason === "not_allowlisted") return "Not on owner allowlist";
  if (reason === "email_unverified") return "Email not yet verified";
  if (reason === "session_unavailable") return "Session unavailable";
  if (reason === "signed_out") return "Signed out";
  return "Owner session accepted";
}

export function AdminLocked({ state, surface }: AdminLockedProps) {
  const callbackURL = `/login?callbackURL=${encodeURIComponent(surface)}`;
  const shouldShowVerificationActions = state.denialReason === "email_unverified" && Boolean(state.userEmail);

  return (
    <main className="route-page admin-lock-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Protected admin</p>
          <h1>{denialTitle(state.denialReason)}</h1>
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
          {shouldShowVerificationActions ? (
            <EmailVerificationActions email={state.userEmail ?? ""} callbackPath={surface} />
          ) : null}
        </div>
        <aside className="route-status-panel">
          <ShieldCheck aria-hidden="true" />
          <p>Session state</p>
          <strong>{state.userEmail ?? "Signed out"}</strong>
          <span>{denialLabel(state.denialReason)}</span>
        </aside>
      </section>
    </main>
  );
}
