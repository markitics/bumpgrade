import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowRight, BarChart3, FlaskConical, MapPinned, ShieldCheck } from "lucide-react";

import { AnalyticsConversionReportPanel } from "@/components/analytics-conversion-report-panel";
import { AnalyticsSourceAttributionPanel } from "@/components/analytics-source-attribution-panel";
import { analyticsFunnelConversionFallbackReport } from "@/lib/analytics-conversion-report";
import { analyticsTimeWindows, defaultAnalyticsTimeWindow } from "@/lib/analytics-time-windows";
import {
  analyticsDashboards,
  getAnalyticsDashboardBySlug,
  type ExperimentDefinition,
} from "@/lib/analytics-experiments";
import { site } from "@/lib/site";

type AnalyticsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicAnalyticsBoundary =
  "Bumpgrade keeps launch reports aggregate by default and separates performance signals from private visitor details.";

export function generateStaticParams() {
  return analyticsDashboards.map((dashboard) => ({ slug: dashboard.slug }));
}

export async function generateMetadata({ params }: AnalyticsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dashboard = getAnalyticsDashboardBySlug(slug);

  if (!dashboard) return {};

  return {
    title: dashboard.title,
    description: dashboard.summary,
    alternates: {
      canonical: `${site.url}${dashboard.previewRoute}`,
    },
    openGraph: {
      title: dashboard.title,
      description: dashboard.summary,
      url: `${site.url}${dashboard.previewRoute}`,
      type: "article",
    },
  };
}

function ExperimentCard({ experiment }: { experiment: ExperimentDefinition }) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge planned">Experiment</span>
        <span className="admin-pill">Traffic split</span>
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

  const conversionReport = analyticsFunnelConversionFallbackReport(dashboard);
  const primaryExperiment = dashboard.experiments[0];
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: dashboard.title,
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
          <p className="eyebrow">Analytics dashboard</p>
          <h1>{dashboard.title}</h1>
          <p className="lede">{dashboard.summary}</p>
          <div className="hero-actions">
            <Link href="/features/ad-tracking" className="primary-action">
              See analytics feature
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={dashboard.linkedFunnelRoute} className="secondary-action">
              Open linked funnel
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Analytics dashboard status">
          <BarChart3 aria-hidden="true" />
          <p>Status</p>
          <strong>{dashboard.events.length} event definitions</strong>
          <span>
            Review source attribution, conversion steps, time windows, and experiment results without exposing private
            visitor details.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Funnel report</p>
            <h2>Step-level conversion metrics show where the launch path improves.</h2>
          </div>
          <Link href={dashboard.linkedFunnelRoute} className="text-link compact-link">
            Linked funnel
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AnalyticsConversionReportPanel fallbackReport={conversionReport} timeWindows={analyticsTimeWindows} />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Event taxonomy</p>
            <h2>Track the moments that matter in the launch.</h2>
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
                <span className="admin-pill">Aggregate</span>
              </div>
              <Activity aria-hidden="true" />
              <h3>{event.title}</h3>
              <p>{event.aggregation}</p>
              <div className="feature-detail">
                <strong>Privacy</strong>
                <span>Private visitor fields stay out of launch reports.</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Source attribution</p>
            <h2>Source attribution stays aggregate-only</h2>
          </div>
          <Link href="/features/ad-tracking" className="text-link compact-link">
            Learn about attribution
            <MapPinned aria-hidden="true" />
          </Link>
        </div>
        <AnalyticsSourceAttributionPanel
          selectedWindow={defaultAnalyticsTimeWindow.key}
          timeWindows={analyticsTimeWindows}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Experiment model</p>
            <h2>Compare variants without jumping to false winners.</h2>
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
              <span className="status-badge active">Guardrails</span>
              <span className="admin-pill">Sample size</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>No automated winners</h3>
            <p>
              Bumpgrade can summarize metrics and assignments, but changing traffic should wait for enough data and a
              deliberate decision.
            </p>
          </article>
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Analytics safety</p>
            <h2>Use launch signals without exposing raw visitor data.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <BarChart3 aria-hidden="true" />
            <h3>Aggregate reports</h3>
            <p>Reports focus on source, step, variant, and time-window performance.</p>
          </div>
          <div>
            <BarChart3 aria-hidden="true" />
            <h3>No raw event feed</h3>
            <p>IP addresses, user agents, cookies, contact IDs, Stripe IDs, and raw event rows stay out of public data.</p>
          </div>
          <div>
            <FlaskConical aria-hidden="true" />
            <h3>Deliberate decisions</h3>
            <p>{publicAnalyticsBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
