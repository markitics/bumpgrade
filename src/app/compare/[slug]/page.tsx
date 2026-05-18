import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FileSearch, ShieldCheck } from "lucide-react";

import { competitors, getCompetitorBySlug, getSourceById } from "@/lib/comparison-data";
import { site } from "@/lib/site";

type CompareAlternativePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return competitors.map((competitor) => ({ slug: competitor.slug }));
}

export async function generateMetadata({ params }: CompareAlternativePageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    return {};
  }

  return {
    title: `${competitor.name} Alternative`,
    description: `${competitor.name} alternative page for Bumpgrade, with sourced competitor notes and explicit planned Bumpgrade feature status.`,
    alternates: {
      canonical: `${site.url}/compare/${competitor.slug}`,
    },
  };
}

export default async function CompareAlternativePage({ params }: CompareAlternativePageProps) {
  const { slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) {
    notFound();
  }

  const source = getSourceById(competitor.sourceId);

  return (
    <main className="compare-page">
      <section className="compare-hero">
        <div>
          <Link href="/compare" className="back-link">
            <ArrowLeft aria-hidden="true" />
            All comparisons
          </Link>
          <p className="eyebrow">{competitor.name} alternative</p>
          <h1>{competitor.headline}</h1>
          <p className="lede">{competitor.alternativePosition}</p>
          <div className="hero-actions">
            <Link href="/roadmap" className="primary-action">
              View roadmap
              <ArrowRight aria-hidden="true" />
            </Link>
            <a href={competitor.sourceUrl} className="secondary-action">
              Official source
              <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </div>
        <aside className="compare-scorecard" aria-label={`${competitor.name} comparison summary`}>
          <FileSearch aria-hidden="true" />
          <p>Best known for</p>
          <strong>{competitor.category}</strong>
          <span>{competitor.bestFor}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Sourced notes</p>
            <h2>What the official source supports</h2>
          </div>
          {source ? (
            <a href={source.url} className="text-link compact-link">
              {source.id}
              <ExternalLink aria-hidden="true" />
            </a>
          ) : null}
        </div>
        <div className="evidence-grid">
          {competitor.evidence.map((item) => (
            <div key={item} className="evidence-card">
              <ShieldCheck aria-hidden="true" />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Comparison matrix</p>
            <h2>Where Bumpgrade has to earn parity</h2>
          </div>
        </div>
        <div className="comparison-table" role="table" aria-label={`${competitor.name} alternative matrix`}>
          <div className="comparison-table-row comparison-table-head" role="row">
            <div role="columnheader">Area</div>
            <div role="columnheader">{competitor.name}</div>
            <div role="columnheader">Bumpgrade target</div>
          </div>
          {competitor.rows.map((row) => (
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
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Not shipped yet</p>
            <h2>Roadmap gaps this comparison creates</h2>
          </div>
        </div>
        <div className="gap-list">
          {competitor.gapsToAddress.map((gap) => (
            <div key={gap} className="gap-row">
              <span aria-hidden="true">Planned</span>
              <p>{gap}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
