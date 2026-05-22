import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  ChartNoAxesCombined,
  CircleDollarSign,
  Gauge,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  pricingV2DecisionQuestions,
  pricingV2Meters,
  pricingV2Models,
  pricingV2SourceReferences,
} from "@/lib/pricing-v2";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Usage-Based Pricing Exploration",
  description:
    "A Bumpgrade pricing-v2 exploration for usage-based pricing across funnels, contacts, sends, products, checkout volume, agents, domains, and support.",
  alternates: {
    canonical: `${site.url}/pricing-v2`,
  },
};

export default function PricingV2Page() {
  return (
    <main className="pricing-v2-page">
      <section className="pricing-hero pricing-v2-hero">
        <div>
          <p className="eyebrow">Pricing v2 exploration</p>
          <h1>Usage-based pricing that scales with publisher growth.</h1>
          <p className="lede">
            This page separates the current launch-pricing path from a usage-based option Mark can evaluate before
            Bumpgrade turns self-serve checkout on.
          </p>
          <div className="hero-actions">
            <Link href="/pricing" className="primary-action">
              Compare launch pricing
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing-v2/source-data" className="secondary-action">
              Read source data
              <Bot aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="pricing-note pricing-v2-note">
          <Gauge aria-hidden="true" />
          <strong>No checkout is attached to this exploration.</strong>
          <p>
            The structure is public so prospects and agents can understand the option, but final prices, entitlements,
            and billing writes still need a separate Stripe-backed rollout.
          </p>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Candidate models</p>
            <h2>Three ways to package a usage-based Bumpgrade plan.</h2>
          </div>
          <p>
            The strongest version keeps the full growth stack understandable while letting larger publishers pay more
            as the work Bumpgrade handles becomes more valuable.
          </p>
        </div>
        <div className="pricing-model-grid">
          {pricingV2Models.map((model) => (
            <article key={model.id} className="pricing-model-card">
              <span>{model.status === "decision-needed" ? "Decision needed" : "Exploration"}</span>
              <h3>{model.title}</h3>
              <p>{model.summary}</p>
              <dl>
                <div>
                  <dt>Best fit</dt>
                  <dd>{model.fit}</dd>
                </div>
                <div>
                  <dt>Watch</dt>
                  <dd>{model.risk}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Usage dimensions</p>
            <h2>The meters map to product areas, not hidden fees.</h2>
          </div>
          <p>
            Each meter has to make sense to a publisher and to an agent reading source data. If a usage dimension cannot
            be explained cleanly, it should stay bundled or custom.
          </p>
        </div>
        <div className="usage-meter-grid">
          {pricingV2Meters.map((meter) => (
            <article key={meter.id} className="usage-meter-card">
              <div>
                <CircleDollarSign aria-hidden="true" />
                <span>{meter.productArea}</span>
              </div>
              <h3>{meter.label}</h3>
              <strong>{meter.unit}</strong>
              <p>{meter.includedStartingPoint}</p>
              <p>{meter.scalingSignal}</p>
              <Link href={meter.evidenceRoutes[0]} className="text-link compact-link">
                Evidence route
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Source patterns</p>
            <h2>Inspired by current pricing structures, not copied rates.</h2>
          </div>
          <p>
            Pricing pages change frequently. These references are source IDs for the structure review and must be
            refreshed before Bumpgrade publishes final claims.
          </p>
        </div>
        <div className="pricing-source-grid">
          {pricingV2SourceReferences.map((source) => (
            <article key={source.id} className="pricing-source-card">
              <BadgeCheck aria-hidden="true" />
              <h3>{source.label}</h3>
              <p>{source.relevantPattern}</p>
              <p>{source.caution}</p>
              <Link href={source.url} className="text-link compact-link">
                Source
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Decision checklist</p>
            <h2>What Mark needs to decide before replacing /pricing.</h2>
          </div>
          <Link href="mailto:m@rkmoriarty.com?subject=Bumpgrade%20pricing-v2%20decision" className="secondary-action">
            Discuss pricing v2
            <Mail aria-hidden="true" />
          </Link>
        </div>
        <div className="pricing-decision-list">
          {pricingV2DecisionQuestions.map((question, index) => (
            <article key={question.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{question.question}</h3>
                <p>{question.whyItMatters}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band pricing-cta-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Safety boundary</p>
            <h2>Pricing exploration is read-only until checkout evidence catches up.</h2>
          </div>
          <p>
            Agents can cite <code>/pricing-v2/source-data</code>, but they must not claim final plan amounts,
            live subscriptions, or billing-impacting writes from this route.
          </p>
        </div>
        <div className="pricing-v2-proof-strip">
          <span>
            <ShieldCheck aria-hidden="true" />
            No live checkout claim
          </span>
          <span>
            <ChartNoAxesCombined aria-hidden="true" />
            Usage model only
          </span>
          <span>
            <Sparkles aria-hidden="true" />
            Source refresh required
          </span>
        </div>
      </section>
    </main>
  );
}
