import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, GitCompareArrows, ShieldCheck } from "lucide-react";

import {
  comparisonHubRows,
  comparisonPrinciples,
  comparisonRetrievedAt,
  competitors,
} from "@/lib/comparison-data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compare Bumpgrade Alternatives",
  description:
    "Compare Bumpgrade's planned Cloudflare-first publisher growth OS with ClickFunnels, Kit, Shopify, SamCart, Kajabi, Podia, Systeme.io, Kartra, and ThriveCart.",
  alternates: {
    canonical: `${site.url}/compare`,
  },
};

export default function ComparePage() {
  return (
    <main className="compare-page">
      <section className="compare-hero">
        <div>
          <p className="eyebrow">Bumpgrade comparisons</p>
          <h1>Compare Bumpgrade against indiepreneur platforms.</h1>
          <p className="lede">
            Bumpgrade is being built toward ClickFunnels, SamCart, Kit, Shopify, and knowledge-commerce parity,
            but with one extra constraint: every public claim needs a source, every planned feature needs a
            roadmap trail, and future agents need stable contracts instead of hidden dashboard scraping.
          </p>
          <div className="hero-actions">
            <Link href="/features" className="primary-action">
              See planned features
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/compare/source-data" className="secondary-action">
              Agent JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="compare-scorecard" aria-label="Comparison status">
          <GitCompareArrows aria-hidden="true" />
          <p>Source pass</p>
          <strong>{competitors.length} alternatives</strong>
          <span>Official source pages rechecked {comparisonRetrievedAt}. Bumpgrade capabilities are marked as planned until shipped.</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Compare by platform</p>
            <h2>First-wave alternative pages</h2>
          </div>
          <Link href="/roadmap" className="text-link compact-link">
            Roadmap
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
            <div role="columnheader">Bumpgrade target</div>
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
          <p className="eyebrow">Evidence rules</p>
          <h2>Comparison pages are marketing, but the evidence contract is product.</h2>
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
