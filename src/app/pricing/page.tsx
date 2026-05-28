import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Globe2, ShieldCheck, Sparkles } from "lucide-react";

import {
  billingCheckoutRoute,
  canonicalPricingRoute,
  formatUsd,
  freeBuildModeContract,
  planIncludesFeature,
  pricingFeatureMatrix,
  pricingPlans,
  whiteGloveSetupAddon,
  type PricingPlan,
} from "@/lib/pricing-plans";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Bumpgrade pricing for publishers who want self-serve funnels, checkout, email, products, analytics, and AI-assisted launch growth.",
  alternates: {
    canonical: `${site.url}${canonicalPricingRoute}`,
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

function buildCapabilityLabel(status: string) {
  return status === "before-payment" ? "Before payment" : "Designed next";
}

function PlanCheckoutForm({ plan }: { plan: PricingPlan }) {
  if (plan.status === "contact") {
    const subject = encodeURIComponent(`Bumpgrade ${plan.name}`);
    return (
      <Link href={`mailto:${site.contactEmail}?subject=${subject}`} className="primary-action">
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
        <input name="buyerEmail" type="email" autoComplete="email" />
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
            No need to pay while you are still getting the launch ready. Free Build separates private setup from
            the public, buyer-facing actions that need a paid go-live state.
          </p>
          <div className="hero-actions">
            <Link href="/playground" className="primary-action">
              Try playground
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="#plans" className="secondary-action">
              Choose paid plan
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
          <ShieldCheck aria-hidden="true" />
          <strong>Pay when it is time to go live</strong>
          <p>
            Private building keeps setup work moving before payment. The playground saves structured launch context before
            signup; the paid plan unlocks public publishing, live checkout, subscriber sends, custom domains, and
            fulfillment.
          </p>
        </aside>
      </section>

      <section className="content-band alternate" id="build-first">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Build first</p>
            <h2>{freeBuildModeContract.headline}</h2>
          </div>
          <p>{freeBuildModeContract.summary}</p>
        </div>
        <div className="payment-option-grid free-build-grid">
          {freeBuildModeContract.freeBuildCapabilities
            .filter((capability) => capability.allowedBeforePayment)
            .map((capability) => (
              <article key={capability.id} className="payment-option-card">
                <ShieldCheck aria-hidden="true" />
                <span>{buildCapabilityLabel(capability.status)}</span>
                <h3>{capability.title}</h3>
                <p>{capability.summary}</p>
              </article>
            ))}
        </div>
      </section>

      <section className="content-band" id="go-live-gates">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Go live</p>
            <h2>The paid plan unlocks the buyer-facing switch.</h2>
          </div>
          <Link href="/pricing/source-data" className="text-link">
            Policy JSON
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="pricing-gate-grid">
          {freeBuildModeContract.paidGoLiveGates.map((gate) => (
            <article key={gate.id} className="pricing-gate-card">
              <div>
                <Globe2 aria-hidden="true" />
                <h3>{gate.title}</h3>
              </div>
              <p>{gate.summary}</p>
              <ul>
                {gate.requires.map((requirement) => (
                  <li key={requirement}>
                    <CheckCircle2 aria-hidden="true" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate" id="plans">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Plans</p>
            <h2>Pick the paid launch surface when you are ready.</h2>
          </div>
          <p>
            Start with the plan that matches the launch you want to put in front of buyers. Bumpgrade keeps the plan
            structure flexible, so your account can grow as you add more offers, domains, partners, and reporting needs.
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
            <h3>Paid plan access</h3>
            <p>Stripe success activates the paid publisher account that setup uses for subdomain access.</p>
          </article>
          <article className="payment-option-card">
            <Globe2 aria-hidden="true" />
            <h3>Publisher domain path</h3>
            <p>Every paid account starts with a Bumpgrade subdomain. Grow and Enterprise add existing-domain setup.</p>
          </article>
          <article className="payment-option-card">
            <CreditCard aria-hidden="true" />
            <h3>Private billing details</h3>
            <p>Stripe handles card and payment details. Bumpgrade uses the checkout result to open the right plan.</p>
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
            These boundaries are intentionally conservative for the first self-serve rollout. The plan access framework
            keeps future plan changes adjustable without a custom rebuild.
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
              {pricingPlans.map((plan) => {
                const included = planIncludesFeature(plan.slug, feature);

                return (
                  <span role="cell" key={plan.slug} className={included ? "included" : "limited"}>
                    <strong className="pricing-feature-mobile-plan-label">{plan.name}</strong>
                    <span className="pricing-feature-availability">
                      {included ? <CheckCircle2 aria-hidden="true" /> : null}
                      {feature.availability[plan.slug]}
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="content-band dark-band pricing-cta-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Start today</p>
            <h2>Experiment and Grow are ready for self-serve checkout.</h2>
          </div>
          <p>
            Choose a plan, complete checkout, then set up your Bumpgrade workspace, subdomain, funnel, checkout, audience,
            products, analytics, and AI launch context.
          </p>
        </div>
      </section>
    </main>
  );
}
