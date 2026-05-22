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
  "Visitor tracking and experiment decisions open only after privacy review, sample-size checks, retention limits, owner confirmation, and redacted audit evidence.";
const analyticsPageDescription =
  "A launch analytics dashboard that summarizes funnel conversion, source attribution, and experiment results without publishing visitor-level data.";

export function generateStaticParams() {
  return analyticsDashboards.map((dashboard) => ({ slug: dashboard.slug }));
}

export async function generateMetadata({ params }: AnalyticsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dashboard = getAnalyticsDashboardBySlug(slug);

  if (!dashboard) return {};

  return {
    title: dashboard.title,
    description: analyticsPageDescription,
    alternates: {
      canonical: `${site.url}${dashboard.previewRoute}`,
    },
    openGraph: {
      title: dashboard.title,
      description: analyticsPageDescription,
      url: `${site.url}${dashboard.previewRoute}`,
      type: "article",
    },
  };
}

function ExperimentCard({ experiment }: { experiment: ExperimentDefinition }) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge active">Experiment</span>
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

  const conversionReport = analyticsFunnelConversionFallbackReport(dashboard);
  const primaryExperiment = dashboard.experiments[0];
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: dashboard.title,
    url: `${site.url}${dashboard.previewRoute}`,
    description: analyticsPageDescription,
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
          <p className="lede">{analyticsPageDescription}</p>
          <div className="hero-actions">
            <Link href={dashboard.linkedFunnelRoute} className="primary-action">
              See the funnel
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={dashboard.linkedOfferRoute} className="secondary-action">
              See the checkout offer
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Analytics dashboard status">
          <BarChart3 aria-hidden="true" />
          <p>Status</p>
          <strong>{dashboard.events.length} event definitions</strong>
          <span>
            Event capture, variant assignment, and conversion summaries stay aggregate-only, with visitor privacy and
            revenue claims kept out of public reporting.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Funnel report</p>
            <h2>Step-level conversion metrics come from aggregate captured events</h2>
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
                <span className="status-badge live">{event.kind.replaceAll("_", " ")}</span>
                <span className="admin-pill">Private fields excluded</span>
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
            <p className="eyebrow">Source attribution</p>
            <h2>Source attribution stays aggregate-only</h2>
          </div>
          <Link href={dashboard.linkedAudienceRoute} className="text-link compact-link">
            Audience automation
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
              <span className="status-badge blocked">Safeguards</span>
              <span className="admin-pill">Sample size</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>No automated winners</h3>
            <p>
              Bumpgrade can summarize assignment counts and decision evidence, but traffic routing waits for sample-size
              checks and owner confirmation.
            </p>
          </article>
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Privacy and safety</p>
            <h2>Metrics are useful without exposing visitor-level data.</h2>
          </div>
          <Link href="/developers-and-agents" className="text-link compact-link">
            Developer details
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <BarChart3 aria-hidden="true" />
            <h3>Aggregate reporting</h3>
            <p>Conversion and source views summarize patterns without publishing raw event rows.</p>
          </div>
          <div>
            <BarChart3 aria-hidden="true" />
            <h3>No raw event feed</h3>
            <p>IP addresses, user agents, cookies, contact IDs, Stripe IDs, and raw event rows stay out of public data.</p>
          </div>
          <div>
            <FlaskConical aria-hidden="true" />
            <h3>Experiment changes are protected</h3>
            <p>{publicAnalyticsBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
