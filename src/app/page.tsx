import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  CheckCircle2,
  Mail,
  PanelsTopLeft,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import { MarketingProductVisual } from "@/components/marketing-product-visual";
import { featuredMarketingFeatureSlugs, getMarketingFeature, marketingFeatures } from "@/lib/marketing-features";

const featuredFeatures = featuredMarketingFeatureSlugs.map((slug) => getMarketingFeature(slug)).filter(Boolean);

const launchOutcomes = [
  {
    label: "Build the path",
    title: "Landing pages and funnels",
    body: "Start with page and funnel shapes for lead magnets, sales pages, webinars, resources, checkout handoffs, and thank-you steps.",
    icon: PanelsTopLeft,
  },
  {
    label: "Sell the offer",
    title: "Checkout, bumps, and products",
    body: "Shape the offer ladder, add checkout bumps, and connect purchases to product access and follow-up decisions.",
    icon: ShoppingCart,
  },
  {
    label: "Grow the audience",
    title: "Email, CRM, and partners",
    body: "Capture subscribers, inspect consent, prepare campaigns, record CRM notes, and track referral partner evidence.",
    icon: Mail,
  },
  {
    label: "Improve the launch",
    title: "Analytics and AI assistance",
    body: "Use source attribution, experiment results, and guided launch context to understand what worked and what to do next.",
    icon: Bot,
  },
];

const proofPoints = [
  "Feature examples and pricing are ready for first invite conversations.",
  "Funnels, checkout paths, products, audience, analytics, and partner tracking are connected.",
  "Customer payments and sends stay reviewed until each live path is verified.",
];

function availabilityLabel(status: string) {
  if (status === "live" || status === "launch-preview") return "Available now";
  return "In build";
}

function availabilityClass(status: string) {
  return status === "live" ? "live" : status === "launch-preview" ? "active" : "pending";
}

export default function HomePage() {
  return (
    <main className="launch-home">
      <section className="launch-hero">
        <div className="launch-hero-copy">
          <p className="eyebrow">Bumpgrade for publisher launches</p>
          <h1>Launch offers with funnels, checkout, email, products, analytics, and AI help in one place.</h1>
          <p className="lede">
            Bumpgrade helps publishers turn expertise into paid offers: capture demand, present the right product, add a checkout bump, deliver access, follow up with the audience, and learn what moved buyers.
          </p>
          <div className="hero-actions">
            <Link href="/features" className="primary-action">
              Explore features
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="secondary-action">
              See launch pricing
              <BadgeCheck aria-hidden="true" />
            </Link>
          </div>
          <div className="hero-proof-strip" aria-label="Launch readiness proof">
            {proofPoints.map((point) => (
              <span key={point}>
                <CheckCircle2 aria-hidden="true" />
                {point}
              </span>
            ))}
          </div>
        </div>
        <MarketingProductVisual />
      </section>

      <section className="content-band launch-outcome-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">What it does</p>
            <h2>One launch path from first click to follow-up.</h2>
          </div>
          <p>
            Bumpgrade gives publishers a concrete path to present an offer, collect demand, take payment safely, deliver access, and learn what moved buyers.
          </p>
        </div>
        <div className="launch-outcome-grid">
          {launchOutcomes.map((item) => (
            <article key={item.title} className="launch-outcome-card">
              <item.icon aria-hidden="true" />
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Feature highlights</p>
            <h2>Built around the jobs publishers actually need done.</h2>
          </div>
          <Link href="/features" className="text-link compact-link">
            View all features
            <Sparkles aria-hidden="true" />
          </Link>
        </div>
        <div className="launch-feature-grid">
          {featuredFeatures.map((feature) => {
            if (!feature) return null;
            return (
              <article key={feature.slug} className="launch-feature-card">
                <Image src={feature.imageUrl} alt={feature.imageAlt} width={1200} height={650} unoptimized />
                <div>
                  <span className={`status-badge ${availabilityClass(feature.status)}`}>
                    {availabilityLabel(feature.status)}
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.summary}</p>
                  <Link href={`/features/${feature.slug}`} className="text-link">
                    Learn more
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="content-band launch-workflow-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Launch workflow</p>
            <h2>Replace the glued-together stack.</h2>
          </div>
          <p>
            Bumpgrade pulls the ClickFunnels, SamCart, Kit, Kajabi, Shopify, ThriveCart, and analytics jobs into one launch workflow.
          </p>
        </div>
        <div className="workflow-step-strip">
          {["Plan", "Page", "Checkout", "Deliver", "Follow up", "Optimize"].map((step, index) => (
            <div key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band dark-band launch-proof-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Ready for the first invite wave</p>
            <h2>Follow working launch paths from the first page to customer follow-up.</h2>
          </div>
          <Link href="/pricing" className="secondary-action">
            Request access
            <BarChart3 aria-hidden="true" />
          </Link>
        </div>
        <div className="launch-proof-grid">
          <div>
            <strong>Feature pages</strong>
            <span>{marketingFeatures.length} launch features with dedicated pages, examples, and setup notes.</span>
          </div>
          <div>
            <strong>Customer paths</strong>
            <span>Funnels, offers, products, audience, analytics, and affiliates route to visible launch examples.</span>
          </div>
          <div>
            <strong>Safety boundaries</strong>
            <span>Live billing and provider sends are only claimed once their production evidence is verified.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
