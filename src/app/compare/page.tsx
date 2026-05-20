import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, GitCompareArrows, ShieldCheck } from "lucide-react";

import {
  comparisonHubRows,
  comparisonPrinciples,
  comparisonRetrievedAt,
  comparisonSeoTargets,
  competitors,
} from "@/lib/comparison-data";
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
      <section className="compare-hero">
        <div>
          <p className="eyebrow">ClickFunnels alternatives</p>
          <h1>Compare ClickFunnels competitors and indiepreneur platforms.</h1>
          <p className="lede">
            Bumpgrade is the launch system for publishers who want funnel, checkout, email, product, analytics,
            and AI-assist workflows to connect. Use this hub to see where Bumpgrade can replace a stack of specialist
            tools and where a dedicated platform still makes sense.
          </p>
          <div className="hero-actions">
            <Link href="/features" className="primary-action">
              See features
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/compare/clickfunnels-alternative" className="secondary-action">
              Compare ClickFunnels
              <BookOpen aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="compare-scorecard" aria-label="Comparison status">
          <GitCompareArrows aria-hidden="true" />
          <p>Comparison set</p>
          <strong>{competitors.length} alternatives</strong>
          <span>Alternative pages reviewed {comparisonRetrievedAt}. Start with the platform you already know.</span>
        </aside>
      </section>

      <section className="content-band">
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Buyer research</p>
            <h2>Start with the question your current tool raises.</h2>
          </div>
          <Link href="/compare/clickfunnels-alternative" className="text-link compact-link">
            ClickFunnels page
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="seo-target-grid">
          {comparisonSeoTargets.map((target) => (
            <article key={target.id} className="seo-target-card">
              <span>{target.primaryKeyword}</span>
              <h3>{target.intent}</h3>
              <p>{target.caveat}</p>
              <ul>
                {target.supportingKeywords.map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Compare by platform</p>
            <h2>First-wave alternative pages</h2>
          </div>
          <Link href="/features" className="text-link compact-link">
            Feature overview
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="alternative-grid">
          {competitors.map((competitor) => (
            <Link key={competitor.id} href={`/compare/${competitor.slug}`} className="alternative-card">
              <span>{competitor.category}</span>
              <h3>{competitor.name} alternative</h3>
              <p>{competitor.summary}</p>
              <strong>
                Open comparison
                <ArrowRight aria-hidden="true" />
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Platform decision</p>
            <h2>What Bumpgrade is trying to combine</h2>
          </div>
        </div>
        <div className="comparison-table" role="table" aria-label="Bumpgrade comparison strategy">
          <div className="comparison-table-row comparison-table-head" role="row">
            <div role="columnheader">Area</div>
            <div role="columnheader">What incumbents cover</div>
            <div role="columnheader">Bumpgrade approach</div>
          </div>
          {comparisonHubRows.map((row) => (
            <div key={row.area} className="comparison-table-row" role="row">
              <div role="cell">
                <strong>{row.area}</strong>
              </div>
              <div role="cell">{row.incumbent}</div>
              <div role="cell">{row.bumpgradePlan}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="section-heading">
          <p className="eyebrow">How to choose</p>
          <h2>Compare the job you need done, not just the logo on the tool.</h2>
        </div>
        <div className="principle-grid">
          {comparisonPrinciples.map((principle) => (
            <div key={principle.title} className="principle-card">
              <ShieldCheck aria-hidden="true" />
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
