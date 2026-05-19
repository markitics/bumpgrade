import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowRight, BarChart3, Database, FlaskConical, ShieldCheck, TrendingUp } from "lucide-react";

import {
  analyticsDashboards,
  getAnalyticsDashboardBySlug,
  type ExperimentDefinition,
  type FunnelStepMetric,
} from "@/lib/analytics-experiments";
import { site } from "@/lib/site";

type AnalyticsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return analyticsDashboards.map((dashboard) => ({ slug: dashboard.slug }));
}

export async function generateMetadata({ params }: AnalyticsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dashboard = getAnalyticsDashboardBySlug(slug);

  if (!dashboard) return {};

  return {
    title: `${dashboard.title} Preview`,
    description: `${dashboard.summary} This Bumpgrade analytics scaffold is tied to issue #${dashboard.issue}.`,
    alternates: {
      canonical: `${site.url}${dashboard.previewRoute}`,
    },
    openGraph: {
      title: `${dashboard.title} preview`,
      description: dashboard.summary,
      url: `${site.url}${dashboard.previewRoute}`,
      type: "article",
    },
  };
}

function formatPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

function MetricCard({ metric }: { metric: FunnelStepMetric }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className="status-badge planned">Fixture</span>
        <span className="admin-pill">{formatPercent(metric.conversionRate)}</span>
      </div>
      <TrendingUp aria-hidden="true" />
      <h3>{metric.label}</h3>
      <p>
        {metric.conversions} conversions from {metric.visitors} fixture visitors.
      </p>
      <div className="feature-detail">
        <strong>Step ID</strong>
        <span>{metric.stepId}</span>
      </div>
    </article>
  );
}

function ExperimentCard({ experiment }: { experiment: ExperimentDefinition }) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge planned">Experiment</span>
        <span className="admin-pill">{experiment.status}</span>
      </div>
      <FlaskConical aria-hidden="true" />
      <h3>{experiment.title}</h3>
      <p>{experiment.assignmentRule}</p>
      <div className="roadmap-detail">
        <strong>Variants</strong>
        <span>{experiment.variants.map((variant) => `${variant.label} ${variant.trafficWeight}%`).join(" / ")}</span>
      </div>
    </article>
  );
}

export default async function AnalyticsDashboardPage({ params }: AnalyticsPageProps) {
  const { slug } = await params;
  const dashboard = getAnalyticsDashboardBySlug(slug);

  if (!dashboard) {
    notFound();
  }

  const primaryExperiment = dashboard.experiments[0];
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${dashboard.title} preview`,
    url: `${site.url}${dashboard.previewRoute}`,
    description: dashboard.summary,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    about: ["analytics", "conversion tracking", "A/B testing", "experiments", "funnel metrics"],
  };

  return (
    <main className="route-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Analytics preview</p>
          <h1>{dashboard.title}</h1>
          <p className="lede">{dashboard.summary}</p>
          <div className="hero-actions">
            <Link href="/analytics/source-data" className="primary-action">
              Analytics JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${dashboard.issue}`} className="secondary-action">
              Issue #{dashboard.issue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Analytics preview status">
          <BarChart3 aria-hidden="true" />
          <p>Status</p>
          <strong>{dashboard.events.length} event definitions</strong>
          <span>
            Seeded event capture and deterministic assignments are live with idempotency and aggregate-only reporting;
            cookies, traffic routing, contact-level analytics, automated winners, and revenue claims stay disabled.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Funnel report</p>
            <h2>Step-level conversion metrics combine fixtures and captured event counts</h2>
          </div>
          <Link href={dashboard.linkedFunnelRoute} className="text-link compact-link">
            Linked funnel
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {dashboard.funnelStepMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Event taxonomy</p>
            <h2>Analytics inputs resolve to stable public-safe event IDs</h2>
          </div>
          <Link href={dashboard.linkedAudienceRoute} className="text-link compact-link">
            Audience automation
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {dashboard.events.slice(0, 4).map((event) => (
            <article key={event.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge planned">{event.kind.replaceAll("_", " ")}</span>
                <span className="admin-pill">Public-safe</span>
              </div>
              <Activity aria-hidden="true" />
              <h3>{event.title}</h3>
              <p>{event.aggregation}</p>
              <div className="feature-detail">
                <strong>Private data excluded</strong>
                <span>{event.privateDataExcluded.length} fields</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Experiment model</p>
            <h2>Deterministic assignment can be audited before traffic writes exist</h2>
          </div>
          <Link href={dashboard.linkedOfferRoute} className="text-link compact-link">
            Checkout offer
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          <ExperimentCard experiment={primaryExperiment} />
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge pending">Guardrails</span>
              <span className="admin-pill">Sample size</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>No automated winners</h3>
            <p>
              Agents may summarize fixture metrics and assignment counts, but future experiment decisions need
              sample-size caveats, retention limits, and owner confirmation before routing live traffic.
            </p>
          </article>
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Write boundary</p>
            <h2>Agents can inspect metrics, capture seeded events, and assign variants, not track visitors.</h2>
          </div>
          <Link href="/agent-docs/source-data" className="text-link compact-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Database aria-hidden="true" />
            <h3>Source data first</h3>
            <p>
              <code>/analytics/source-data</code> exposes public-safe events, metric formulas, fixture reports,
              aggregate event and assignment counts, and experiment definitions.
            </p>
          </div>
          <div>
            <BarChart3 aria-hidden="true" />
            <h3>No raw event feed</h3>
            <p>IP addresses, user agents, cookies, contact IDs, Stripe IDs, and raw event rows stay out of public data.</p>
          </div>
          <div>
            <FlaskConical aria-hidden="true" />
            <h3>Confirmed writes later</h3>
            <p>{dashboard.writeBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
