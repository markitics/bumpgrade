import type { Metadata } from "next";
import Link from "next/link";
import { headers as nextHeaders } from "next/headers";
import { ArrowRight, BadgeCheck, Database, Globe2, LockKeyhole, ShieldCheck } from "lucide-react";

import { createAuth } from "@/lib/auth";
import {
  getOptionalPublisherTenantD1,
  loadPublisherAccountState,
  publisherDefaultDomain,
  publisherSubdomainConfirmationText,
  type PublisherSessionUser,
} from "@/lib/publisher-tenants";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account setup",
  description: "Set up your Bumpgrade publisher account and reserve your paid Bumpgrade subdomain.",
  alternates: {
    canonical: `${site.url}/account/setup`,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AccountSetupPageProps = {
  searchParams?: Promise<{
    reserved?: string;
    error?: string;
  }>;
};

async function getSessionUser(): Promise<PublisherSessionUser | null> {
  const session = await createAuth()
    .api.getSession({
      headers: new Headers(await nextHeaders()),
    })
    .catch(() => null);
  const user = session?.user;

  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified === true,
  };
}

function randomIdempotencyKey() {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `publisher-subdomain-reservation-${random}`;
}

export default async function AccountSetupPage({ searchParams }: AccountSetupPageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const db = await getOptionalPublisherTenantD1();
  const state = await loadPublisherAccountState(db, user);
  const reservation = state.reservation;

  return (
    <main className="account-setup-page">
      <section className="account-setup-hero">
        <div>
          <p className="eyebrow">Publisher account</p>
          <h1>Choose the Bumpgrade subdomain for your launch workspace.</h1>
          <p className="lede">
            Every paid publisher account starts with a default {publisherDefaultDomain} subdomain. Use it for launch
            previews, customer paths, and agent-readable proof before adding a custom domain.
          </p>
          <div className="hero-actions">
            <Link href="/pricing" className="primary-action">
              Review paid plans
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/account/source-data" className="secondary-action">
              Account source data
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="account-status-panel">
          <Globe2 aria-hidden="true" />
          <p>Current setup state</p>
          <strong>{reservation ? reservation.fullHostname : state.kind === "ready" ? "Ready to reserve" : "Action needed"}</strong>
          <span>{state.message}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Default domain</p>
            <h2>Reserve a unique Bumpgrade hostname.</h2>
          </div>
          <p>
            Subdomain reservations require a signed-in, email-confirmed publisher account with an active paid plan or
            launch-pilot entitlement. Reserved names like admin, api, www, login, pricing, and features stay unavailable.
          </p>
        </div>

        <div className="account-setup-grid">
          <article className="account-setup-card">
            <ShieldCheck aria-hidden="true" />
            <p className="eyebrow">Signed-in account</p>
            <h3>{user?.email ?? "No publisher session"}</h3>
            <p>
              {user
                ? user.emailVerified
                  ? "This email is confirmed for account setup."
                  : "Confirm this email before reserving a subdomain."
                : "Sign in or create an account to continue."}
            </p>
            {!user ? (
              <Link href="/login?callbackURL=/account/setup" className="primary-action">
                Log in / sign up
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
          </article>

          <article className="account-setup-card">
            <BadgeCheck aria-hidden="true" />
            <p className="eyebrow">Paid plan gate</p>
            <h3>{state.entitlement ? state.entitlement.planSlug : "Paid plan required"}</h3>
            <p>
              {state.entitlement
                ? "This account has an active plan or launch-pilot entitlement for subdomain reservation."
                : "Choose a paid plan or activate the launch pilot before selecting a Bumpgrade subdomain."}
            </p>
            {!state.entitlement ? (
              <Link href="/pricing" className="secondary-action">
                See pricing
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
          </article>

          <article className="account-setup-card reservation-card">
            <Globe2 aria-hidden="true" />
            <p className="eyebrow">Subdomain</p>
            <h3>{reservation?.fullHostname ?? "Not reserved yet"}</h3>
            <p>
              {reservation
                ? "This Bumpgrade subdomain is attached to the publisher tenant."
                : "Pick the public name you want customers to see under bumpgrade.com."}
            </p>
            {reservation ? (
              <a href={`https://${reservation.fullHostname}`} className="secondary-action">
                Open hostname
                <ArrowRight aria-hidden="true" />
              </a>
            ) : null}
          </article>
        </div>

        {params?.reserved ? <p className="account-success">Reserved {params.reserved} for this publisher account.</p> : null}
        {params?.error ? <p className="auth-error">{params.error}</p> : null}

        <form action="/api/account/publisher/subdomain" method="post" className="subdomain-reservation-form">
          <input type="hidden" name="idempotencyKey" value={randomIdempotencyKey()} />
          <input type="hidden" name="confirmationText" value={publisherSubdomainConfirmationText} />
          <label htmlFor="publisher-subdomain">Bumpgrade subdomain</label>
          <div className="subdomain-input-row">
            <input
              id="publisher-subdomain"
              name="subdomain"
              type="text"
              placeholder="your-name"
              minLength={3}
              maxLength={63}
              pattern="[A-Za-z0-9-]+"
              disabled={!state.canReserveSubdomain}
              required
            />
            <span>.{publisherDefaultDomain}</span>
          </div>
          <p>
            Use lowercase letters, numbers, and hyphens. Custom domains and domain purchase are separate setup paths
            after the default Bumpgrade hostname is reserved.
          </p>
          <button type="submit" className="primary-action" disabled={!state.canReserveSubdomain}>
            Reserve subdomain
            <LockKeyhole aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
