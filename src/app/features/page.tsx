import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Sparkles } from "lucide-react";

import {
  ContentBand,
  MarketingCard,
  MarketingHero,
  SplitHeading,
} from "@/components/marketing-primitives";
import {
  featuredMarketingFeatureSlugs,
  getMarketingFeature,
  marketingFeatureCategories,
  marketingFeatures,
  type MarketingFeature,
} from "@/lib/marketing-features";
import { MarketingProductVisual } from "@/components/marketing-product-visual";
import { marketingDesignTokens, type MarketingBadgeTone } from "@/lib/marketing-design-tokens";
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

function availabilityTone(feature: MarketingFeature): MarketingBadgeTone {
  return feature.status === "live" ? "live" : feature.status === "launch-preview" ? "active" : "pending";
}

function statusBadgeClass(feature: MarketingFeature) {
  return `${marketingDesignTokens.badgeClasses.base} ${availabilityTone(feature)}`;
}

export default function FeaturesPage() {
  return (
    <main className="marketing-features-page">
      <MarketingHero
        className="marketing-features-hero"
        eyebrow="Bumpgrade features"
        title="Everything a publisher needs to launch, sell, deliver, and improve an offer."
        lede="Bumpgrade brings together the core jobs people usually split across ClickFunnels, SamCart, Kit, Kajabi, Shopify, ThriveCart, and analytics tools. Start with the launch workflow, then dig into the feature pages that match your offer."
        actions={
          <>
            <Link href="/pricing" className={marketingDesignTokens.actionClasses.primary}>
              See launch pricing
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/compare" className={marketingDesignTokens.actionClasses.secondary}>
              Compare alternatives
              <BadgeCheck aria-hidden="true" />
            </Link>
          </>
        }
        visual={<MarketingProductVisual />}
      />

      <ContentBand className="marketing-outcome-band">
        <SplitHeading eyebrow="Featured workflows" title="The main things Bumpgrade can do for a launch.">
          <p>
            Use these paths to plan the first page, collect the buyer, deliver the product, measure the result, and choose
            what to improve next.
          </p>
        </SplitHeading>
        <div className="spotlight-feature-grid">
          {featuredFeatures.map((feature) => (
            <MarketingCard key={feature.slug} className="spotlight-feature-card">
              <Image
                src={feature.cardImageUrl ?? feature.imageUrl}
                alt={feature.cardImageAlt ?? feature.imageAlt}
                width={1200}
                height={650}
                unoptimized
              />
              <div>
                <span className={statusBadgeClass(feature)}>{availabilityLabel(feature)}</span>
                <p className="eyebrow">{feature.eyebrow}</p>
                <h3>{feature.title}</h3>
                <p>{feature.outcome}</p>
                <Link href={`/features/${feature.slug}`} className={marketingDesignTokens.actionClasses.text}>
                  Learn more
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </MarketingCard>
          ))}
        </div>
      </ContentBand>

      {marketingFeatureCategories.map((category) => {
        const categoryFeatures = marketingFeatures.filter((feature) => feature.category === category);
        return (
          <ContentBand key={category}>
            <SplitHeading eyebrow="Feature group" title={category} className="feature-section-heading" />
            <div className="marketing-feature-grid">
              {categoryFeatures.map((feature) => (
                <MarketingCard key={feature.slug} className="marketing-feature-card">
                  <div className="feature-card-top">
                    <span className={statusBadgeClass(feature)}>{availabilityLabel(feature)}</span>
                    <span>{feature.availability}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.summary}</p>
                  <div className="feature-detail">
                    <strong>Best for</strong>
                    <span>{feature.audience}</span>
                  </div>
                  <Link
                    href={`/features/${feature.slug}`}
                    className={`${marketingDesignTokens.actionClasses.text} ${marketingDesignTokens.actionClasses.compact}`}
                  >
                    Learn more
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </MarketingCard>
              ))}
            </div>
          </ContentBand>
        );
      })}

      <ContentBand className="marketing-trust-band" tone="dark">
        <SplitHeading eyebrow="Why it feels different" title="One launch workflow instead of a stack of disconnected tools.">
          <Link href="/compare" className={marketingDesignTokens.actionClasses.secondary}>
            Compare alternatives
            <BadgeCheck aria-hidden="true" />
          </Link>
        </SplitHeading>
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
      </ContentBand>
    </main>
  );
}
