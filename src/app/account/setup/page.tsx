import type { Metadata } from "next";
import Link from "next/link";
import { headers as nextHeaders } from "next/headers";
import { ArrowRight, BadgeCheck, Globe2, LockKeyhole, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

import { createAuth } from "@/lib/auth";
import {
  getOptionalPublisherTenantD1,
  loadPublisherAccountState,
  publisherDefaultDomain,
  publisherCustomDomainConfirmationText,
  publisherFreeBuildWorkspaceConfirmationText,
  publisherSubdomainConfirmationText,
  type PublisherSessionUser,
} from "@/lib/publisher-tenants";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account setup",
  description: "Set up your Bumpgrade publisher account, create a private Free Build workspace, and reserve your paid Bumpgrade subdomain when you are ready to go live.",
  alternates: {
    canonical: `${site.url}/account/setup`,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AccountSetupPageProps = {
  searchParams?: Promise<{
    reserved?: string;
    customDomain?: string;
    customDomainPending?: string;
    customDomainVerified?: string;
    freeBuild?: string;
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

function randomCustomDomainIdempotencyKey() {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `publisher-custom-domain-${random}`;
}

function randomFreeBuildIdempotencyKey() {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `publisher-free-build-workspace-${random}`;
}

export default async function AccountSetupPage({ searchParams }: AccountSetupPageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const db = await getOptionalPublisherTenantD1();
  const state = await loadPublisherAccountState(db, user);
  const reservation = state.reservation;
  const customDomains = state.customDomains;

  return (
    <main className="account-setup-page">
      <section className="account-setup-hero">
        <div>
          <p className="eyebrow">Publisher account</p>
          <h1>Create the private workspace for your publisher launch.</h1>
          <p className="lede">
            Free Build lets you start private setup before payment. Public domains, live checkout, subscriber sends,
            and fulfillment stay behind the paid go-live step.
          </p>
          <div className="hero-actions">
            <Link href="#free-build" className="primary-action">
              Start Free Build
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="#go-live-domains" className="secondary-action">
              Go-live domains
              <Globe2 aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="account-status-panel">
          <Globe2 aria-hidden="true" />
          <p>Current setup state</p>
          <strong>
            {reservation
              ? reservation.fullHostname
              : state.kind === "ready"
                ? "Ready to reserve"
                : state.kind === "free_build"
                  ? "Free Build active"
                  : "Action needed"}
          </strong>
          <span>{state.message}</span>
        </aside>
      </section>

      <section className="content-band alternate" id="free-build">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Free Build</p>
            <h2>Start private setup before paying.</h2>
          </div>
          <p>
            A private workspace gives Bumpgrade something durable to attach drafts, launch context, and future imports
            to. It does not publish routes, collect buyer payments, send subscribers, reserve domains, or fulfill access.
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
            <Sparkles aria-hidden="true" />
            <p className="eyebrow">Private workspace</p>
            <h3>{state.tenant ? (state.entitlement ? "Paid workspace active" : "Free Build active") : "Not created yet"}</h3>
            <p>
              {state.tenant
                ? state.entitlement
                  ? "This account has a workspace attached to an active go-live plan."
                  : "This account has a private workspace for draft launch setup before go-live."
                : "Create the private workspace now, then add a paid go-live plan when you are ready for public buyer paths."}
            </p>
          </article>

          <article className="account-setup-card">
            <BadgeCheck aria-hidden="true" />
            <p className="eyebrow">Go-live plan</p>
            <h3>{state.entitlement ? state.entitlement.planSlug : "Paid plan required"}</h3>
            <p>
              {state.entitlement
                ? "This account has an active paid plan for public domains and go-live setup."
                : "Pay when you are ready to reserve domains, publish public buyer paths, collect live payments, send subscribers, or fulfill access."}
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
                : "Pick the public name customers will see under bumpgrade.com after a paid go-live plan is active."}
            </p>
            {reservation ? (
              <a href={`https://${reservation.fullHostname}`} className="secondary-action">
                Open hostname
                <ArrowRight aria-hidden="true" />
              </a>
            ) : null}
          </article>
        </div>

        {params?.freeBuild === "created" ? <p className="account-success">Private Free Build workspace is ready.</p> : null}
        {params?.reserved ? <p className="account-success">Reserved {params.reserved} for this publisher account.</p> : null}
        {params?.error ? <p className="auth-error">{params.error}</p> : null}

        {!state.tenant ? (
          <form action="/api/account/publisher/free-build-workspace" method="post" className="subdomain-reservation-form">
            <input type="hidden" name="idempotencyKey" value={randomFreeBuildIdempotencyKey()} />
            <input type="hidden" name="confirmationText" value={publisherFreeBuildWorkspaceConfirmationText} />
            <label htmlFor="free-build-workspace">Private Free Build workspace</label>
            <p id="free-build-workspace">
              Create a private launch workspace for drafts, offer context, and future agent-readable setup state. This
              is not public publishing, live checkout, subscriber sending, custom domains, or fulfillment.
            </p>
            <button type="submit" className="primary-action" disabled={!state.canCreateFreeBuildWorkspace}>
              Create Free Build workspace
              <Sparkles aria-hidden="true" />
            </button>
          </form>
        ) : null}
      </section>

      <section className="content-band" id="go-live-domains">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Go-live domain</p>
            <h2>Reserve a unique Bumpgrade hostname when paid.</h2>
          </div>
          <p>
            Subdomain reservations require a signed-in, email-confirmed publisher account with an active paid plan
            on the account. System names like api, www, login, pricing, and features stay unavailable.
          </p>
        </div>

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
            after the default Bumpgrade hostname is reserved; Bumpgrade does not sell or register domains today.
          </p>
          <button type="submit" className="primary-action" disabled={!state.canReserveSubdomain}>
            Reserve subdomain
            <LockKeyhole aria-hidden="true" />
          </button>
        </form>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Customer login</p>
            <h2>One account across Bumpgrade-hosted sites.</h2>
          </div>
          <p>
            Customers who sign in on Bumpgrade can move between paid publisher sites on {publisherDefaultDomain}{" "}
            without creating a separate login for every publisher subdomain. Private products, memberships, and
            customer records still stay scoped to the publisher site that sold them.
          </p>
        </div>

        <div className="account-setup-grid">
          <article className="account-setup-card">
            <LockKeyhole aria-hidden="true" />
            <p className="eyebrow">Bumpgrade subdomains</p>
            <h3>Shared login</h3>
            <p>
              A customer can use the same Bumpgrade account across hostnames like studio.{publisherDefaultDomain} and
              courses.{publisherDefaultDomain}, while each site keeps its own access rules.
            </p>
          </article>
          <article className="account-setup-card">
            <Globe2 aria-hidden="true" />
            <p className="eyebrow">Custom domains</p>
            <h3>Central sign-in handoff</h3>
            <p>
              Domains you already own use the Bumpgrade account handoff for identity, then return customers to the
              custom domain with tenant-specific access checks.
            </p>
          </article>
        </div>
      </section>

      <section className="content-band" id="custom-domain">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Custom domain</p>
            <h2>Bring an existing domain when you are ready.</h2>
          </div>
          <p>
            Add a domain you already own, copy the DNS record Bumpgrade gives you, and re-check verification from this
            page. Bumpgrade does not sell, register, renew, or transfer domains today.
          </p>
        </div>

        {params?.customDomain ? <p className="account-success">Added DNS instructions for {params.customDomain}.</p> : null}
        {params?.customDomainPending ? (
          <p className="auth-error">DNS is still pending for {params.customDomainPending}. Check the CNAME record and try again.</p>
        ) : null}
        {params?.customDomainVerified ? (
          <p className="account-success">Verified DNS for {params.customDomainVerified}. SSL activation is the next tracked state.</p>
        ) : null}

        <div className="custom-domain-list">
          {customDomains.length ? (
            customDomains.map((customDomain) => (
              <article className="account-setup-card custom-domain-card" key={customDomain.id}>
                <Globe2 aria-hidden="true" />
                <p className="eyebrow">Existing domain</p>
                <h3>{customDomain.domainName}</h3>
                <p>
                  Status: <strong>{customDomain.status.replaceAll("_", " ")}</strong>. SSL:{" "}
                  <strong>{customDomain.sslStatus.replaceAll("_", " ")}</strong>.
                </p>
                <dl className="dns-record-list">
                  <div>
                    <dt>Type</dt>
                    <dd>{customDomain.dnsInstruction.recordType}</dd>
                  </div>
                  <div>
                    <dt>Name</dt>
                    <dd>{customDomain.dnsInstruction.recordName}</dd>
                  </div>
                  <div>
                    <dt>Value</dt>
                    <dd>{customDomain.dnsInstruction.recordValue}</dd>
                  </div>
                </dl>
                <p>{customDomain.failureReason ?? customDomain.dnsInstruction.propagation}</p>
                <form action="/api/account/publisher/custom-domain" method="post" className="inline-domain-form">
                  <input type="hidden" name="return" value="form" />
                  <input type="hidden" name="mode" value="verify" />
                  <input type="hidden" name="customDomainId" value={customDomain.id} />
                  <button type="submit" className="secondary-action">
                    Re-check DNS
                    <RefreshCw aria-hidden="true" />
                  </button>
                </form>
              </article>
            ))
          ) : (
            <article className="account-setup-card custom-domain-card">
              <Globe2 aria-hidden="true" />
              <p className="eyebrow">Existing domain</p>
              <h3>No custom domain yet</h3>
              <p>{state.customDomainMessage}</p>
            </article>
          )}
        </div>

        <form action="/api/account/publisher/custom-domain" method="post" className="subdomain-reservation-form">
          <input type="hidden" name="idempotencyKey" value={randomCustomDomainIdempotencyKey()} />
          <input type="hidden" name="confirmationText" value={publisherCustomDomainConfirmationText} />
          <label htmlFor="publisher-custom-domain">Existing domain</label>
          <div className="subdomain-input-row">
            <input
              id="publisher-custom-domain"
              name="domainName"
              type="text"
              placeholder="www.example.com"
              disabled={!state.canAddCustomDomain}
              required
            />
            <span>CNAME</span>
          </div>
          <p>
            Bumpgrade will show a CNAME target and verification state. You keep control of DNS at your domain host.
          </p>
          <button type="submit" className="primary-action" disabled={!state.canAddCustomDomain}>
            Add custom domain
            <LockKeyhole aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
