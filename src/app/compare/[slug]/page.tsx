import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FileSearch, ShieldCheck } from "lucide-react";

import { comparisonRetrievedAt, competitors, getCompetitorBySlug, getSourceById } from "@/lib/comparison-data";
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
    title: competitor.metaTitle ?? `${competitor.name} Alternative`,
    description:
      competitor.metaDescription ??
      `${competitor.name} alternative page for Bumpgrade, with sourced competitor notes and explicit planned Bumpgrade feature status.`,
    alternates: {
      canonical: `${site.url}/compare/${competitor.slug}`,
    },
    openGraph: {
      title: competitor.metaTitle ?? `${competitor.name} Alternative`,
      description:
        competitor.metaDescription ??
        `${competitor.name} alternative page for Bumpgrade, with sourced competitor notes and explicit planned Bumpgrade feature status.`,
      url: `${site.url}/compare/${competitor.slug}`,
      type: "article",
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
  const pageUrl = `${site.url}/compare/${competitor.slug}`;
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: competitor.metaTitle ?? `${competitor.name} Alternative`,
    url: pageUrl,
    description: competitor.metaDescription ?? competitor.alternativePosition,
    dateModified: comparisonRetrievedAt,
    about: [competitor.name, ...(competitor.seoKeywords ?? [])],
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    citation: competitor.sourceUrl,
  };
  const faqJsonLd = competitor.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: competitor.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <main className="compare-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replaceAll("<", "\\u003c") }}
        />
      ) : null}
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

      {competitor.seoKeywords?.length || competitor.searchIntent ? (
        <section className="content-band">
          <div className="compare-section-heading">
            <div>
              <p className="eyebrow">Search intent</p>
              <h2>{competitor.name} alternative keywords this page covers</h2>
            </div>
            <Link href="/compare/source-data" className="text-link compact-link">
              Source data
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="seo-intent-panel">
            {competitor.searchIntent ? <p>{competitor.searchIntent}</p> : null}
            {competitor.seoKeywords?.length ? (
              <ul className="keyword-list" aria-label={`${competitor.name} SEO target keywords`}>
                {competitor.seoKeywords.map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {competitor.deepDive ? (
        <section className="content-band alternate">
          <div className="compare-section-heading">
            <div>
              <p className="eyebrow">ClickFunnels competitors map</p>
              <h2>{competitor.deepDive.title}</h2>
            </div>
          </div>
          <div className="compare-copy-stack">
            {competitor.deepDive.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="comparison-table deep-dive-table" role="table" aria-label={`${competitor.name} SEO capability checklist`}>
            <div className="comparison-table-row comparison-table-head" role="row">
              <div role="columnheader">Capability cluster</div>
              <div role="columnheader">Official-source ClickFunnels surface</div>
              <div role="columnheader">Bumpgrade roadmap link</div>
            </div>
            {competitor.deepDive.checklist.map((row) => (
              <div key={row.area} className="comparison-table-row" role="row">
                <div role="cell">
                  <strong>{row.area}</strong>
                </div>
                <div role="cell">{row.incumbent}</div>
                <div role="cell">{row.bumpgradePlan}</div>
              </div>
            ))}
          </div>
          <div className="related-link-grid">
            {competitor.deepDive.relatedLinks.map((item) => (
              <Link key={item.href} href={item.href} className="related-link-card">
                <span>{item.label}</span>
                <p>{item.description}</p>
                <strong>
                  Open
                  <ArrowRight aria-hidden="true" />
                </strong>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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
