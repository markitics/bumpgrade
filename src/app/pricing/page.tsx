import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Globe2, ShieldCheck, Sparkles } from "lucide-react";

import {
  billingCheckoutRoute,
  formatUsd,
  planIncludesFeature,
  pricingFeatureMatrix,
  pricingPlans,
  selfServePricingContract,
  whiteGloveSetupAddon,
  type PricingPlan,
} from "@/lib/pricing-plans";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Bumpgrade pricing for publishers who want self-serve funnels, checkout, email, products, analytics, and AI-assisted launch growth.",
  alternates: {
    canonical: `${site.url}/pricing`,
  },
};

type PricingPageProps = {
  searchParams?: Promise<{
    checkout?: string;
  }>;
};

function planPrice(plan: PricingPlan) {
  if (plan.monthlyAmountCents === null) return "Contact us";
  return `${formatUsd(plan.monthlyAmountCents)}/mo`;
}

function PlanCheckoutForm({ plan }: { plan: PricingPlan }) {
  if (plan.status === "contact") {
    return (
      <Link href="mailto:m@rkmoriarty.com?subject=Bumpgrade%20Enterprise" className="primary-action">
        {plan.cta}
        <ArrowRight aria-hidden="true" />
      </Link>
    );
  }

  return (
    <form action={billingCheckoutRoute} method="post" className="plan-checkout-form">
      <input type="hidden" name="planSlug" value={plan.slug} />
      <label>
        Email
        <input name="buyerEmail" type="email" autoComplete="email" placeholder="you@example.com" />
      </label>
      <label className="setup-addon-choice">
        <input name="whiteGloveSetup" type="checkbox" />
        <span>
          Add {whiteGloveSetupAddon.name} setup for {formatUsd(whiteGloveSetupAddon.unitAmountCents)}
        </span>
      </label>
      <button type="submit" className="primary-action">
        {plan.cta}
        <ArrowRight aria-hidden="true" />
      </button>
    </form>
  );
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams;

  return (
    <main className="pricing-page">
      <section className="pricing-hero">
        <div>
          <p className="eyebrow">Bumpgrade pricing</p>
          <h1>Start building your publisher launch system today.</h1>
          <p className="lede">
            Choose a self-serve plan, go through Stripe Checkout, then set up your Bumpgrade publisher workspace with
            funnels, checkout, products, audience workflows, analytics, and AI launch context.
          </p>
          <div className="hero-actions">
            <Link href="#plans" className="primary-action">
              Choose a plan
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing-v2" className="secondary-action">
              Usage-based draft
              <Sparkles aria-hidden="true" />
            </Link>
          </div>
          {params?.checkout === "cancelled" ? (
            <p className="checkout-return-note">Stripe checkout was canceled. Choose a plan when you are ready.</p>
          ) : null}
          {params?.checkout === "preview" ? (
            <p className="checkout-return-note">Checkout preview is available in this runtime; live Stripe checkout runs in production.</p>
          ) : null}
        </div>
        <aside className="pricing-note">
          <CreditCard aria-hidden="true" />
          <strong>Self-serve Stripe checkout</strong>
          <p>
            Experiment and Grow start through live Stripe Checkout. Successful checkout activates a publisher plan
            entitlement by email so account setup can unlock the workspace.
          </p>
        </aside>
      </section>

      <section className="content-band alternate" id="plans">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Plans</p>
            <h2>Pick the amount of launch surface you need now.</h2>
          </div>
          <p>
            Plan features are data-driven, so Bumpgrade can move capabilities between plans later without rewriting the
            page or checkout contract.
          </p>
        </div>
        <div className="pricing-card-grid">
          {pricingPlans.map((plan) => (
            <article key={plan.slug} className={`pricing-card plan-${plan.slug}`}>
              <span>{plan.label}</span>
              <h3>{plan.name}</h3>
              <strong>{planPrice(plan)}</strong>
              <p>{plan.headline}</p>
              <p>{plan.description}</p>
              <ul>
                {plan.included.map((feature) => (
                  <li key={feature}>
                    <BadgeCheck aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <PlanCheckoutForm plan={plan} />
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Setup</p>
            <h2>Add humans for the first setup push.</h2>
          </div>
          <p>
            {whiteGloveSetupAddon.name} is a one-time {formatUsd(whiteGloveSetupAddon.unitAmountCents)} option paired
            with Experiment or Grow. It helps you set up the launch workspace and scale with confidence.
          </p>
        </div>
        <div className="payment-option-grid">
          <article className="payment-option-card">
            <ShieldCheck aria-hidden="true" />
            <h3>Plan entitlement</h3>
            <p>Stripe success activates the paid publisher entitlement that account setup uses for subdomain access.</p>
          </article>
          <article className="payment-option-card">
            <Globe2 aria-hidden="true" />
            <h3>Publisher domain path</h3>
            <p>Every paid account starts with a Bumpgrade subdomain. Grow and Enterprise add existing-domain setup.</p>
          </article>
          <article className="payment-option-card">
            <CreditCard aria-hidden="true" />
            <h3>Billing boundary</h3>
            <p>Provider identifiers stay private; public contract notes expose plan IDs, status, and safe billing boundaries.</p>
          </article>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Feature access</p>
            <h2>Current plan boundaries are explicit and adjustable.</h2>
          </div>
          <p>
            These boundaries are intentionally conservative for the first self-serve rollout. The entitlement framework
            keeps future plan changes as configuration changes.
          </p>
        </div>
        <div className="pricing-feature-table" role="table" aria-label="Bumpgrade plan feature matrix">
          <div role="row" className="pricing-feature-row pricing-feature-head">
            <span role="columnheader">Capability</span>
            {pricingPlans.map((plan) => (
              <span role="columnheader" key={plan.slug}>
                {plan.name}
              </span>
            ))}
          </div>
          {pricingFeatureMatrix.map((feature) => (
            <div role="row" className="pricing-feature-row" key={feature.id}>
              <span role="cell">
                <strong>{feature.label}</strong>
                <em>{feature.summary}</em>
              </span>
              {pricingPlans.map((plan) => (
                <span role="cell" key={plan.slug} className={planIncludesFeature(plan.slug, feature) ? "included" : "limited"}>
                  {planIncludesFeature(plan.slug, feature) ? <CheckCircle2 aria-hidden="true" /> : null}
                  {feature.availability[plan.slug]}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="content-band dark-band pricing-cta-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Checkout contract</p>
            <h2>Self-serve plans now have a live billing path.</h2>
          </div>
          <p>
            Contract {selfServePricingContract.id} uses {selfServePricingContract.checkoutRoute} and verifies successful
            sessions on {selfServePricingContract.successRoute}.
          </p>
        </div>
      </section>
    </main>
  );
}
