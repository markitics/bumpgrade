import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, GitCompareArrows, ShieldCheck } from "lucide-react";

import {
  ComparisonTable,
  ContentBand,
  MarketingCard,
  MarketingHero,
  SplitHeading,
} from "@/components/marketing-primitives";
import {
  comparisonHubRows,
  comparisonPrinciples,
  comparisonRetrievedAt,
  comparisonSeoTargets,
  competitors,
  nonCanonicalComparisonExamples,
} from "@/lib/comparison-data";
import { marketingDesignTokens } from "@/lib/marketing-design-tokens";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "ClickFunnels Alternatives and Competitors for Indiepreneurs",
  description:
    "Compare ClickFunnels alternatives and competitors for indiepreneurs, including Bumpgrade's funnel, checkout, email, commerce, and AI-assisted launch platform.",
  alternates: {
    canonical: `${site.url}/compare`,
  },
  openGraph: {
    title: "ClickFunnels alternatives and indiepreneur platform comparisons",
    description:
      "A practical comparison hub for ClickFunnels, Kit, Shopify, SamCart, Kajabi, Podia, Systeme.io, Kartra, ThriveCart, and Bumpgrade.",
    url: `${site.url}/compare`,
    type: "website",
  },
};

export default function ComparePage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ClickFunnels alternatives and competitors for indiepreneurs",
    url: `${site.url}/compare`,
    description: metadata.description,
    dateModified: comparisonRetrievedAt,
    about: comparisonSeoTargets.map((target) => target.primaryKeyword),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: competitors.map((competitor, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${competitor.name} alternative`,
        url: `${site.url}/compare/${competitor.slug}`,
      })),
    },
  };

  return (
    <main className="compare-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <MarketingHero
        className="compare-hero"
        eyebrow="ClickFunnels alternatives"
        title="Compare ClickFunnels competitors and indiepreneur platforms."
        lede="Bumpgrade is the launch system for publishers who want funnel, checkout, email, product, analytics, and AI-assist workflows to connect. Use this hub to see where Bumpgrade can replace a stack of specialist tools and where a dedicated platform still makes sense."
        actions={
          <>
            <Link href="/features" className={marketingDesignTokens.actionClasses.primary}>
              See features
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/compare/clickfunnels-alternative" className={marketingDesignTokens.actionClasses.secondary}>
              Compare ClickFunnels
              <BookOpen aria-hidden="true" />
            </Link>
          </>
        }
        visual={
          <aside className="compare-scorecard" aria-label="Comparison status">
            <GitCompareArrows aria-hidden="true" />
            <p>Comparison set</p>
            <strong>{competitors.length} alternatives</strong>
            <span>Alternative pages reviewed {comparisonRetrievedAt}. Start with the platform you already know.</span>
          </aside>
        }
      />

      <ContentBand>
        <SplitHeading
          eyebrow="Buyer research"
          title="Start with the question your current tool raises."
          className="compare-section-heading"
        >
          <Link
            href="/compare/clickfunnels-alternative"
            className={`${marketingDesignTokens.actionClasses.text} ${marketingDesignTokens.actionClasses.compact}`}
          >
            ClickFunnels page
            <ArrowRight aria-hidden="true" />
          </Link>
        </SplitHeading>
        <div className="seo-target-grid">
          {comparisonSeoTargets.map((target) => (
            <MarketingCard key={target.id} className="seo-target-card">
              <span>{target.primaryKeyword}</span>
              <h3>{target.intent}</h3>
              <p>{target.caveat}</p>
              <ul>
                {target.supportingKeywords.map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
            </MarketingCard>
          ))}
        </div>
      </ContentBand>

      <ContentBand tone="alternate">
        <SplitHeading eyebrow="Compare by platform" title="First-wave alternative pages" className="compare-section-heading">
          <Link
            href="/features"
            className={`${marketingDesignTokens.actionClasses.text} ${marketingDesignTokens.actionClasses.compact}`}
          >
            Feature overview
            <ArrowRight aria-hidden="true" />
          </Link>
        </SplitHeading>
        <div className="alternative-grid">
          {competitors.map((competitor) => (
            <MarketingCard key={competitor.id} href={`/compare/${competitor.slug}`} className="alternative-card">
              <span>{competitor.category}</span>
              <h3>{competitor.name} alternative</h3>
              <p>{competitor.summary}</p>
              <strong>
                Open comparison
                <ArrowRight aria-hidden="true" />
              </strong>
            </MarketingCard>
          ))}
        </div>
      </ContentBand>

      <ContentBand>
        <SplitHeading
          eyebrow="Platform decision"
          title="What Bumpgrade is trying to combine"
          className="compare-section-heading"
        />
        <ComparisonTable
          ariaLabel="Bumpgrade comparison strategy"
          rows={comparisonHubRows}
          rowKey={(row) => row.area}
          columns={[
            {
              key: "area",
              header: "Area",
              render: (row) => <strong>{row.area}</strong>,
            },
            {
              key: "incumbent",
              header: "What incumbents cover",
              render: (row) => row.incumbent,
            },
            {
              key: "bumpgrade",
              header: "Bumpgrade approach",
              render: (row) => row.bumpgradePlan,
            },
          ]}
        />
      </ContentBand>

      <ContentBand tone="alternate">
        <SplitHeading
          eyebrow="Comparison boundary"
          title="Some adjacent platforms are examples, not first-wave comparison targets."
          className="compare-section-heading"
        >
          <Link
            href="/compare/source-data"
            className={`${marketingDesignTokens.actionClasses.text} ${marketingDesignTokens.actionClasses.compact}`}
          >
            View comparison records
            <ArrowRight aria-hidden="true" />
          </Link>
        </SplitHeading>
        <div className="feature-grid">
          {nonCanonicalComparisonExamples.map((example) => (
            <MarketingCard key={example.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge pending">Not canonical</span>
                <span>{example.adjacentCategory}</span>
              </div>
              <h3>{example.name}</h3>
              <p>{example.boundary}</p>
              <div className="feature-detail">
                <strong>Would need</strong>
                <span>{example.promotionCriteria[0]}</span>
              </div>
            </MarketingCard>
          ))}
        </div>
      </ContentBand>

      <ContentBand tone="dark">
        <SplitHeading
          eyebrow="How to choose"
          title="Compare the job you need done, not just the logo on the tool."
          className="section-heading"
        />
        <div className="principle-grid">
          {comparisonPrinciples.map((principle) => (
            <div key={principle.title} className="principle-card">
              <ShieldCheck aria-hidden="true" />
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </div>
          ))}
        </div>
      </ContentBand>
    </main>
  );
}
