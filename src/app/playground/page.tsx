import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers as nextHeaders } from "next/headers";
import { ArrowRight, BadgeCheck, LockKeyhole, RefreshCw, Save, ShieldCheck, Sparkles } from "lucide-react";

import {
  anonymousPlaygroundApiRoute,
  anonymousPlaygroundClaimApiRoute,
  anonymousPlaygroundClaimConfirmationText,
  anonymousPlaygroundCookieName,
  anonymousPlaygroundGoLiveGates,
  anonymousPlaygroundRoute,
  getOptionalAnonymousPlaygroundD1,
  loadAnonymousPlaygroundWorkspace,
} from "@/lib/anonymous-playground";
import { createAuth } from "@/lib/auth";
import { importerPlatforms } from "@/lib/importers";
import { publisherFreeBuildWorkspaceConfirmationText, type PublisherSessionUser } from "@/lib/publisher-tenants";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Launch playground",
  description:
    "Try Bumpgrade before signing up by saving a private launch plan in this browser, then attach it to a Free Build account when you are ready.",
  alternates: {
    canonical: `${site.url}${anonymousPlaygroundRoute}`,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PlaygroundPageProps = {
  searchParams?: Promise<{
    saved?: string;
    claimed?: string;
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

function randomIdempotencyKey(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

export default async function PlaygroundPage({ searchParams }: PlaygroundPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(anonymousPlaygroundCookieName)?.value ?? null;
  const db = await getOptionalAnonymousPlaygroundD1();
  const workspace = await loadAnonymousPlaygroundWorkspace(db, token);
  const user = await getSessionUser();
  const draft = workspace?.draft ?? {
    offerName: "",
    audience: "",
    launchGoal: "",
    productFormat: "",
    pricePoint: "",
    leadMagnet: "",
    checkoutPlan: "",
    deliveryPlan: "",
    followUpPlan: "",
    sourceUrl: "",
    selectedImporterSlug: "clickfunnels",
  };

  return (
    <main className="playground-page account-setup-page">
      <section className="account-setup-hero">
        <div>
          <p className="eyebrow">Launch playground</p>
          <h1>Try Bumpgrade before you sign up.</h1>
          <p className="lede">
            Sketch the launch you want to build, save it in this browser, and come back later. When the idea is ready,
            attach it to a Free Build account without turning on buyer-facing checkout, sends, domains, or fulfillment.
          </p>
          <div className="hero-actions">
            <Link href="#playground-draft" className="primary-action">
              Save progress
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing#go-live-gates" className="secondary-action">
              Go-live gates
              <LockKeyhole aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="account-status-panel">
          <Sparkles aria-hidden="true" />
          <p>Browser recovery</p>
          <strong>{workspace ? (workspace.status === "claimed" ? "Private draft ready" : "Progress saved") : "Ready to try"}</strong>
          <span>
            {workspace
              ? "This browser can recover the playground while the recovery cookie is present."
              : "Your first save creates a private browser-scoped playground."}
          </span>
        </aside>
      </section>

      <section className="content-band alternate" id="playground-draft">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Launch setup</p>
            <h2>Save enough context to keep exploring.</h2>
          </div>
          <p>
            Shape the offer, first opt-in, checkout handoff, delivery promise, follow-up path, and migration starting
            point before you decide whether to create an account.
          </p>
        </div>

        {params?.saved === "1" ? <p className="account-success">Playground progress saved for this browser.</p> : null}
        {params?.claimed === "1" ? (
          <p className="account-success">Playground attached to your Free Build account and private launch draft.</p>
        ) : null}
        {params?.error ? <p className="auth-error">{params.error}</p> : null}

        <form action={anonymousPlaygroundApiRoute} method="post" className="playground-form subdomain-reservation-form">
          <input type="hidden" name="idempotencyKey" value={randomIdempotencyKey("anonymous-playground-save")} />
          <label htmlFor="offer-name">Offer name</label>
          <input id="offer-name" name="offerName" type="text" maxLength={90} defaultValue={draft.offerName} />
          <label htmlFor="audience">Who is it for?</label>
          <textarea id="audience" name="audience" maxLength={180} defaultValue={draft.audience} />
          <label htmlFor="launch-goal">What do you want to build first?</label>
          <textarea id="launch-goal" name="launchGoal" maxLength={260} defaultValue={draft.launchGoal} />
          <label htmlFor="product-format">Product or service format</label>
          <input
            id="product-format"
            name="productFormat"
            type="text"
            maxLength={140}
            defaultValue={draft.productFormat}
          />
          <label htmlFor="price-point">Price or offer structure</label>
          <input id="price-point" name="pricePoint" type="text" maxLength={80} defaultValue={draft.pricePoint} />
          <label htmlFor="lead-magnet">First opt-in idea</label>
          <textarea id="lead-magnet" name="leadMagnet" maxLength={180} defaultValue={draft.leadMagnet} />
          <label htmlFor="checkout-plan">Checkout handoff</label>
          <textarea id="checkout-plan" name="checkoutPlan" maxLength={220} defaultValue={draft.checkoutPlan} />
          <label htmlFor="delivery-plan">Delivery promise</label>
          <textarea id="delivery-plan" name="deliveryPlan" maxLength={220} defaultValue={draft.deliveryPlan} />
          <label htmlFor="follow-up-plan">Follow-up path</label>
          <textarea id="follow-up-plan" name="followUpPlan" maxLength={220} defaultValue={draft.followUpPlan} />
          <label htmlFor="selected-importer">Starting platform</label>
          <select id="selected-importer" name="selectedImporterSlug" defaultValue={draft.selectedImporterSlug ?? "clickfunnels"}>
            {importerPlatforms.map((platform) => (
              <option key={platform.slug} value={platform.slug}>
                {platform.platformName}
              </option>
            ))}
          </select>
          <label htmlFor="source-url">Existing page or checkout URL</label>
          <input id="source-url" name="sourceUrl" type="url" maxLength={260} defaultValue={draft.sourceUrl} />
          <button type="submit" className="primary-action">
            Save playground
            <Save aria-hidden="true" />
          </button>
        </form>
      </section>

      <section className="content-band">
        <div className="account-setup-grid">
          <article className="account-setup-card">
            <RefreshCw aria-hidden="true" />
            <p className="eyebrow">Come back later</p>
            <h3>{workspace?.updatedAt ? "Saved in this browser" : "Save once to recover"}</h3>
            <p>
              {workspace?.updatedAt
                ? "Refresh this page or return from the same browser and Bumpgrade will load the saved playground."
                : "The first save creates browser-scoped recovery so the progress can survive a refresh or return visit."}
            </p>
          </article>
          <article className="account-setup-card">
            <ShieldCheck aria-hidden="true" />
            <p className="eyebrow">Private by default</p>
            <h3>No buyer-facing launch</h3>
            <p>
              Playground saves do not publish routes, collect payments, send subscribers, reserve domains, or fulfill
              protected products.
            </p>
          </article>
          <article className="account-setup-card">
            <BadgeCheck aria-hidden="true" />
            <p className="eyebrow">Claim when ready</p>
            <h3>{user ? (user.emailVerified ? "Attach to Free Build" : "Confirm email first") : "Sign up to keep going"}</h3>
            <p>
              {user
                ? "Attach this playground to your account and continue setup as a private Free Build launch draft."
                : "Create an account when the progress is worth keeping; the same browser can attach the work after signup."}
            </p>
            {workspace && user?.emailVerified && workspace.status !== "claimed" ? (
              <form action={anonymousPlaygroundClaimApiRoute} method="post" className="inline-action-form">
                <input type="hidden" name="confirmationText" value={anonymousPlaygroundClaimConfirmationText} />
                <input type="hidden" name="freeBuildConfirmationText" value={publisherFreeBuildWorkspaceConfirmationText} />
                <button type="submit" className="secondary-action">
                  Attach to account
                  <ArrowRight aria-hidden="true" />
                </button>
              </form>
            ) : !user ? (
              <Link href="/login?callbackURL=/playground" className="secondary-action">
                Log in / sign up
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
          </article>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Go-live boundary</p>
            <h2>Free play stops before public selling.</h2>
          </div>
          <Link href="/playground/source-data" className="text-link">
            Recovery details
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="pricing-gate-grid">
          {anonymousPlaygroundGoLiveGates.map((gate) => (
            <article key={gate} className="pricing-gate-card">
              <div>
                <LockKeyhole aria-hidden="true" />
                <h3>{gate}</h3>
              </div>
              <p>Requires a signed-in account, a Free Build or paid workspace, and the right paid go-live state.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
