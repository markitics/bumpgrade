import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FileSearch, ShieldCheck } from "lucide-react";

import { comparisonRetrievedAt, competitors, getCompetitorBySlug, getSourcesByIds } from "@/lib/comparison-data";
import { getImporterForCompetitor } from "@/lib/importers";
import { getMarketingFeature } from "@/lib/marketing-features";
import { site } from "@/lib/site";

type CompareAlternativePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return competitors.map((competitor) => ({ slug: competitor.slug }));
}

function statusLabel(status: string) {
  if (status === "live") return "Live";
  if (status === "launch-preview") return "Available now";
  return "Coming soon";
}

function statusClass(status: string) {
  if (status === "live") return "live";
  if (status === "launch-preview") return "active";
  return "pending";
}

function proofRouteForFeature(proofRoutes: string[]) {
  return proofRoutes.find((route) => route.includes("/source-data") || route.startsWith("/agent-docs")) ?? proofRoutes[0] ?? "/features/source-data";
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
      `${competitor.name} alternative page for Bumpgrade, with competitor notes and practical launch-platform positioning.`,
    alternates: {
      canonical: `${site.url}/compare/${competitor.slug}`,
    },
    openGraph: {
      title: competitor.metaTitle ?? `${competitor.name} Alternative`,
      description:
        competitor.metaDescription ??
        `${competitor.name} alternative page for Bumpgrade, with competitor notes and practical launch-platform positioning.`,
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

  const sources = getSourcesByIds(competitor.sourceIds ?? [competitor.sourceId]);
  const importer = getImporterForCompetitor(competitor.id);
  const relatedFeatures = competitor.relatedFeatures.flatMap((relatedFeature) => {
    const feature = getMarketingFeature(relatedFeature.featureSlug);
    return feature ? [{ ...relatedFeature, feature }] : [];
  });
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
    citation: sources.length ? sources.map((source) => source.url) : competitor.sourceUrl,
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
            <Link href="/features" className="primary-action">
              See features
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

      {importer ? (
        <section className="content-band">
          <div className="compare-section-heading">
            <div>
              <p className="eyebrow">Moving from {competitor.name}</p>
              <h2>Bring the useful launch context with you.</h2>
            </div>
            <Link href={importer.route} className="text-link compact-link">
              Open importer
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="seo-intent-panel">
            <p>{importer.summary}</p>
            <Link href={importer.route} className="primary-action">
              Import from {competitor.name}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : null}

      {competitor.seoKeywords?.length || competitor.searchIntent ? (
        <section className="content-band">
          <div className="compare-section-heading">
            <div>
              <p className="eyebrow">Buyer research</p>
              <h2>What buyers usually mean by {competitor.name} alternative</h2>
            </div>
            <Link href="/compare" className="text-link compact-link">
              All comparisons
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
              <p className="eyebrow">Buyer decision map</p>
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
              <div role="columnheader">What {competitor.name} emphasizes</div>
              <div role="columnheader">Bumpgrade approach</div>
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

      {relatedFeatures.length ? (
        <section className="content-band">
          <div className="compare-section-heading">
            <div>
              <p className="eyebrow">Related Bumpgrade features</p>
              <h2>Follow the feature paths behind this comparison.</h2>
            </div>
            <Link href="/features/source-data" className="text-link compact-link">
              Feature evidence
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="related-feature-grid">
            {relatedFeatures.map((relatedFeature) => {
              const proofRoute = proofRouteForFeature(relatedFeature.feature.proofRoutes);

              return (
                <article key={relatedFeature.id} className="related-feature-card">
                  <div className="related-feature-meta">
                    <span>{relatedFeature.feature.category}</span>
                    <span className={`status-badge ${statusClass(relatedFeature.feature.status)}`}>
                      {statusLabel(relatedFeature.feature.status)}
                    </span>
                  </div>
                  <h3>{relatedFeature.feature.title}</h3>
                  <p>{relatedFeature.rationale}</p>
                  <ul className="keyword-list related-feature-criteria" aria-label={`${relatedFeature.feature.title} comparison criteria`}>
                    {relatedFeature.criteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                  <div className="related-feature-actions">
                    <Link href={`/features/${relatedFeature.feature.slug}`} className="text-link">
                      Open {relatedFeature.feature.shortTitle}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                    <Link href={proofRoute} className="text-link">
                      Proof route
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="content-band alternate">
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Competitor notes</p>
            <h2>What {competitor.name} emphasizes</h2>
          </div>
          {sources.length ? (
            <div className="source-link-list" aria-label={`${competitor.name} source evidence`}>
              {sources.map((source) => (
                <a key={source.id} href={source.url} className="text-link compact-link">
                  {source.label}
                  <ExternalLink aria-hidden="true" />
                </a>
              ))}
            </div>
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
            <h2>How the decision compares</h2>
          </div>
        </div>
        <div className="comparison-table" role="table" aria-label={`${competitor.name} alternative matrix`}>
          <div className="comparison-table-row comparison-table-head" role="row">
            <div role="columnheader">Area</div>
            <div role="columnheader">{competitor.name}</div>
            <div role="columnheader">Bumpgrade approach</div>
          </div>
          {competitor.rows.map((row) => (
            <div key={row.id} className="comparison-table-row" role="row">
              <div role="cell">
                <strong>{row.area}</strong>
              </div>
              <div role="cell">{row.incumbent}</div>
              <div role="cell">{row.bumpgradePlan}</div>
            </div>
          ))}
        </div>
      </section>

      {competitor.faqs?.length ? (
        <section className="content-band alternate">
          <div className="compare-section-heading">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2>Questions about choosing Bumpgrade instead of {competitor.name}</h2>
            </div>
          </div>
          <div className="compare-faq-list" aria-label={`${competitor.name} comparison frequently asked questions`}>
            {competitor.faqs.map((faq) => (
              <article key={faq.question} className="compare-faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-band dark-band">
        <div className="compare-section-heading">
          <div>
            <p className="eyebrow">Switching notes</p>
            <h2>What to decide before replacing {competitor.name}</h2>
          </div>
        </div>
        <div className="gap-list">
          {competitor.gapsToAddress.map((gap) => (
            <div key={gap} className="gap-row">
              <span aria-hidden="true">Decide</span>
              <p>{gap}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
