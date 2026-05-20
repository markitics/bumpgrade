import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleDollarSign, CreditCard, Globe2, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Bumpgrade launch pricing for publishers who want funnels, checkout, email, products, analytics, and AI-assisted growth in one launch system.",
  alternates: {
    canonical: `${site.url}/pricing`,
  },
};

const launchPlans = [
  {
    name: "Launch access",
    label: "For the first invite wave",
    price: "Start with an invite",
    description: "Use Bumpgrade to plan, shape, and review the first funnel, offer stack, audience path, and product access for a real launch.",
    cta: "Request launch access",
    href: "mailto:m@rkmoriarty.com?subject=Bumpgrade%20launch%20access",
    features: [
      "Feature, funnel, offer, product, audience, analytics, and affiliate planning",
      "Launch review links for your team and AI helpers",
      "Bumpgrade subdomain reservation after the paid launch-pilot gate is active",
      "Existing-domain DNS instructions after the default hostname is reserved",
      "Reviewed setup before customer-facing payments are enabled",
    ],
  },
  {
    name: "Publisher pilot",
    label: "For active sellers",
    price: "Paid pilot",
    description: "For publishers bringing a live offer, list, product, or paid workshop into Bumpgrade with checkout and fulfillment review.",
    cta: "Plan a pilot",
    href: "mailto:m@rkmoriarty.com?subject=Bumpgrade%20publisher%20pilot",
    features: [
      "Funnel and checkout path mapped to your launch",
      "Default Bumpgrade subdomain for your publisher workspace",
      "Bring-your-own-domain setup with CNAME verification state",
      "Connect a domain you already own; domain purchase is not sold by Bumpgrade yet",
      "Email, CRM, and follow-up readiness review",
      "Stripe payment setup reviewed before live charges",
    ],
  },
  {
    name: "Operator stack",
    label: "For teams and agencies",
    price: "Concierge setup",
    description: "For operators who want repeatable launch systems, partner tracking, reporting, and AI-assisted review across multiple offers.",
    cta: "Discuss operator setup",
    href: "mailto:m@rkmoriarty.com?subject=Bumpgrade%20operator%20setup",
    features: [
      "Reusable funnel and offer structures",
      "Affiliate and attribution review surfaces",
      "Launch journey review links, screenshots, and validation notes",
    ],
  },
];

const paymentOptions = [
  {
    title: "Bumpgrade subdomain",
    body: "Paid publishers can reserve a default hostname such as your-name.bumpgrade.com from account setup before adding a custom domain.",
    icon: Globe2,
  },
  {
    title: "Existing domain",
    body: "Paid publishers can add a domain they already own, copy Bumpgrade's CNAME target, and re-check DNS before activation.",
    icon: Globe2,
  },
  {
    title: "Domain purchase",
    body: "Bumpgrade does not sell or register domains today. Use your paid Bumpgrade subdomain, or connect a domain you already own.",
    icon: Globe2,
  },
  {
    title: "Pilot payments",
    body: "Bumpgrade pilot fees can be handled through a confirmed payment path while customer-facing checkout is verified separately for each offer.",
    icon: CreditCard,
  },
  {
    title: "Stripe invoices",
    body: "Paid pilots can use a Stripe invoice when that is the cleanest way to confirm package, scope, and account entitlement before a larger rollout.",
    icon: CircleDollarSign,
  },
  {
    title: "Manual approval for launch offers",
    body: "Billing-impacting actions stay reviewed and confirmed. That keeps early customers from seeing an unverified payment path.",
    icon: ShieldCheck,
  },
];

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <section className="pricing-hero">
        <div>
          <p className="eyebrow">Bumpgrade pricing</p>
          <h1>Launch pricing for publishers ready to try the whole growth stack.</h1>
          <p className="lede">
            Bumpgrade is opening with invite-based access so each early publisher gets the right funnel, checkout, email, product, analytics, subdomain, and domain plan before inviting buyers.
          </p>
          <div className="hero-actions">
            <Link href="mailto:m@rkmoriarty.com?subject=Bumpgrade%20launch%20access" className="primary-action">
              Request access
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/features" className="secondary-action">
              Review features
              <Sparkles aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="pricing-note">
          <BadgeCheck aria-hidden="true" />
          <strong>Ready for invite conversations</strong>
          <p>
            The launch site shows the feature set, paid account setup, and domain path. Customer-facing checkout for a publisher offer opens after the live Stripe path is verified for that offer.
          </p>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Launch packages</p>
            <h2>Choose the level of help around your first offer.</h2>
          </div>
          <p>Exact pricing is confirmed during the invite or pilot conversation so the first wave gets the right package instead of a generic plan grid.</p>
        </div>
        <div className="pricing-card-grid">
          {launchPlans.map((plan) => (
            <article key={plan.name} className="pricing-card">
              <span>{plan.label}</span>
              <h3>{plan.name}</h3>
              <strong>{plan.price}</strong>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <BadgeCheck aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="primary-action">
                {plan.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Payment options</p>
            <h2>How account setup and live payments should be handled during launch.</h2>
          </div>
          <p>
            The customer-facing promise is simple: no surprise charges, no unverified checkout path, a paid account gate before subdomain reservation, and clear confirmation before payment.
          </p>
        </div>
        <div className="payment-option-grid">
          {paymentOptions.map((option) => (
            <article key={option.title} className="payment-option-card">
              <option.icon aria-hidden="true" />
              <h3>{option.title}</h3>
              <p>{option.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band pricing-cta-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">First wave</p>
            <h2>Bring the offer. Bumpgrade helps shape the path.</h2>
          </div>
          <Link href="mailto:m@rkmoriarty.com?subject=Bumpgrade%20launch%20access" className="secondary-action">
            Contact Bumpgrade
            <Mail aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
