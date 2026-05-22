import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Sparkles } from "lucide-react";

import {
  featuredMarketingFeatureSlugs,
  getMarketingFeature,
  marketingFeatureCategories,
  marketingFeatures,
  type MarketingFeature,
} from "@/lib/marketing-features";
import { MarketingProductVisual } from "@/components/marketing-product-visual";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Bumpgrade feature overview for publishers: funnels, checkout, email campaigns, products, analytics, affiliates, and AI-assisted launch planning.",
  alternates: {
    canonical: `${site.url}/features`,
  },
};

const featuredFeatures = featuredMarketingFeatureSlugs
  .map((slug) => getMarketingFeature(slug))
  .filter((feature): feature is MarketingFeature => Boolean(feature));

function availabilityLabel(feature: MarketingFeature) {
  if (feature.status === "live" || feature.status === "launch-preview") return "Available now";
  return "Next release";
}

function availabilityClass(feature: MarketingFeature) {
  return feature.status === "live" ? "live" : feature.status === "launch-preview" ? "active" : "pending";
}

export default function FeaturesPage() {
  return (
    <main className="marketing-features-page">
      <section className="marketing-features-hero">
        <div>
          <p className="eyebrow">Bumpgrade features</p>
          <h1>Everything a publisher needs to launch, sell, deliver, and improve an offer.</h1>
          <p className="lede">
            Bumpgrade brings together the core jobs people usually split across ClickFunnels, SamCart, Kit, Kajabi, Shopify, ThriveCart, and analytics tools. Start with the launch workflow, then dig into the feature pages that match your offer.
          </p>
          <div className="hero-actions">
            <Link href="/pricing" className="primary-action">
              See launch pricing
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/compare" className="secondary-action">
              Compare alternatives
              <BadgeCheck aria-hidden="true" />
            </Link>
          </div>
        </div>
        <MarketingProductVisual />
      </section>

      <section className="content-band marketing-outcome-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Featured workflows</p>
            <h2>The main things Bumpgrade can do for a launch.</h2>
          </div>
          <p>
            Use these paths to plan the first page, collect the buyer, deliver the product, measure the result, and choose
            what to improve next.
          </p>
        </div>
        <div className="spotlight-feature-grid">
          {featuredFeatures.map((feature) => (
            <article key={feature.slug} className="spotlight-feature-card">
              <Image
                src={feature.cardImageUrl ?? feature.imageUrl}
                alt={feature.cardImageAlt ?? feature.imageAlt}
                width={1200}
                height={650}
                unoptimized
              />
              <div>
                <span className={`status-badge ${availabilityClass(feature)}`}>
                  {availabilityLabel(feature)}
                </span>
                <p className="eyebrow">{feature.eyebrow}</p>
                <h3>{feature.title}</h3>
                <p>{feature.outcome}</p>
                <Link href={`/features/${feature.slug}`} className="text-link">
                  Learn more
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {marketingFeatureCategories.map((category) => {
        const categoryFeatures = marketingFeatures.filter((feature) => feature.category === category);
        return (
          <section key={category} className="content-band">
            <div className="feature-section-heading">
              <div>
                <p className="eyebrow">Feature group</p>
                <h2>{category}</h2>
              </div>
            </div>
            <div className="marketing-feature-grid">
              {categoryFeatures.map((feature) => (
                <article key={feature.slug} className="marketing-feature-card">
                  <div className="feature-card-top">
                    <span className={`status-badge ${availabilityClass(feature)}`}>
                      {availabilityLabel(feature)}
                    </span>
                    <span>{feature.availability}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.summary}</p>
                  <div className="feature-detail">
                    <strong>Best for</strong>
                    <span>{feature.audience}</span>
                  </div>
                  <Link href={`/features/${feature.slug}`} className="text-link compact-link">
                    Learn more
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="content-band dark-band marketing-trust-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Why it feels different</p>
            <h2>One launch workflow instead of a stack of disconnected tools.</h2>
          </div>
          <Link href="/compare" className="secondary-action">
            Compare alternatives
            <BadgeCheck aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <HeartHandshake aria-hidden="true" />
            <h3>Built around the launch</h3>
            <p>Plan the page, offer, checkout, email, delivery, and measurement path together.</p>
          </div>
          <div>
            <BadgeCheck aria-hidden="true" />
            <h3>Clear next steps</h3>
            <p>Each feature page explains what it does, when to use it, and where it fits in the launch.</p>
          </div>
          <div>
            <Sparkles aria-hidden="true" />
            <h3>Dedicated feature pages</h3>
            <p>Each main capability has a deeper page for email campaigns, order bumps, landing pages, analytics, and AI help.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
