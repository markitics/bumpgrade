import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, CreditCard, Mail, Sparkles } from "lucide-react";

import { formatUsd, whiteGloveSetupAddon } from "@/lib/pricing-plans";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Usage-based pricing draft",
  description:
    "A usage-based Bumpgrade pricing draft for publishers who want the platform to scale with launch volume, audience size, and payment throughput.",
  alternates: {
    canonical: `${site.url}/pricing-v2`,
  },
};

const usageProducts = [
  {
    name: "Workspace",
    meter: "Included base",
    price: "$49/mo",
    summary: "Publisher account, Bumpgrade subdomain, core launch workspace, agent-readable context, and AI coach context.",
  },
  {
    name: "Funnels and pages",
    meter: "Published launch paths",
    price: "$15 per active path/mo",
    summary: "Opt-in, sales, webinar, resource, checkout handoff, thank-you, and product delivery paths.",
  },
  {
    name: "Audience",
    meter: "Contacts",
    price: "$12 per 1,000 contacts/mo",
    summary: "Subscribers, consent state, tags, CRM notes, suppression state, and broadcast readiness records.",
  },
  {
    name: "Commerce",
    meter: "Processed order value",
    price: "1.0% platform fee",
    summary: "Checkout starts, order bumps, product access, subscriptions, customer access state, and audit evidence.",
  },
  {
    name: "Automation and analytics",
    meter: "Events and workflow records",
    price: "$8 per 10,000 events",
    summary: "Attribution, experiments, alerts, source reports, agent-readable context, and workflow evidence.",
  },
  {
    name: "Human setup",
    meter: "One time",
    price: formatUsd(whiteGloveSetupAddon.unitAmountCents),
    summary: whiteGloveSetupAddon.description,
  },
];

const exampleBills = [
  {
    title: "Tiny launch",
    price: "$97-$140/mo",
    notes: ["1 workspace", "2 active funnels", "1,500 contacts", "Low checkout volume"],
  },
  {
    title: "Growing publisher",
    price: "$190-$390/mo",
    notes: ["1 workspace", "5-8 active paths", "8,000-15,000 contacts", "Regular product sales"],
  },
  {
    title: "Launch operator",
    price: "Custom cap",
    notes: ["Multiple offers", "Higher commerce volume", "Affiliate and analytics-heavy workflow", "Optional usage cap"],
  },
];

export default function PricingV2Page() {
  return (
    <main className="pricing-page">
      <section className="pricing-hero">
        <div>
          <p className="eyebrow">Pricing v2 draft</p>
          <h1>Usage-based pricing that grows with the launch.</h1>
          <p className="lede">
            This alternate model keeps a smaller base subscription and lets usage scale with the parts that cost more
            to operate: published paths, contacts, commerce, automation, analytics, and implementation help.
          </p>
          <div className="hero-actions">
            <Link href="/pricing" className="primary-action">
              Use simple plans
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="mailto:m@rkmoriarty.com?subject=Bumpgrade%20usage%20pricing" className="secondary-action">
              Discuss usage pricing
              <Mail aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="pricing-note">
          <BarChart3 aria-hidden="true" />
          <strong>Not the default yet</strong>
          <p>
            Bumpgrade can run the simple plan grid now. This page gives the team a public draft for a usage-based model
            before deciding which pricing page becomes the default.
          </p>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Meters</p>
            <h2>Charge around the product surface customers actually use.</h2>
          </div>
          <p>
            The units mirror the jobs Bumpgrade performs for publishers instead of charging only by seats or vague plan
            labels.
          </p>
        </div>
        <div className="usage-pricing-grid">
          {usageProducts.map((product) => (
            <article key={product.name} className="payment-option-card">
              <CreditCard aria-hidden="true" />
              <span>{product.meter}</span>
              <h3>{product.name}</h3>
              <strong>{product.price}</strong>
              <p>{product.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Example bills</p>
            <h2>Make the scale-up path visible before choosing a default.</h2>
          </div>
          <p>
            The exact rates are draft values. The useful part is the framework: small launches stay simple, successful
            launches scale with usage, and operators can negotiate caps.
          </p>
        </div>
        <div className="pricing-card-grid">
          {exampleBills.map((bill) => (
            <article key={bill.title} className="pricing-card">
              <span>Example</span>
              <h3>{bill.title}</h3>
              <strong>{bill.price}</strong>
              <ul>
                {bill.notes.map((note) => (
                  <li key={note}>
                    <BadgeCheck aria-hidden="true" />
                    {note}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band pricing-cta-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Decision point</p>
            <h2>Simple plans are live; usage pricing is the alternate model.</h2>
          </div>
          <Link href="/pricing" className="secondary-action">
            Start from the simple plan grid
            <Sparkles aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
