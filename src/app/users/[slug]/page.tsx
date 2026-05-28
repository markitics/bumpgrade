import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Link2, Sparkles, Users } from "lucide-react";

import {
  audienceSegmentUrl,
  audienceSegments,
  getAudienceSegment,
  type AudienceSegmentRelatedRoute,
} from "@/lib/content-surfaces";
import { getMarketingFeature } from "@/lib/marketing-features";

type AudienceUseCasePageProps = {
  params: Promise<{ slug: string }>;
};

const evidenceRouteLabels: Record<string, string> = {
  "/content/source-data": "Audience record",
  "/features/source-data": "Feature catalog",
  "/funnels/source-data": "Funnel records",
  "/offers/source-data": "Offer records",
  "/products/source-data": "Product records",
  "/audience/source-data": "Audience workflow",
  "/analytics/source-data": "Analytics records",
  "/affiliates/source-data": "Partner records",
  "/imports/source-data": "Import records",
  "/compare/source-data": "Comparison records",
  "/agent-docs/source-data": "AI guide",
  "/pricing/source-data": "Pricing records",
};

export function generateStaticParams() {
  return audienceSegments.map((segment) => ({ slug: segment.slug }));
}

export async function generateMetadata({ params }: AudienceUseCasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const segment = getAudienceSegment(slug);

  if (!segment) return {};

  const primaryFeature = primaryMarketingFeature(segment.relatedRoutes);
  const canonical = audienceSegmentUrl(segment);

  return {
    title: segment.seoTitle,
    description: segment.seoDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${segment.seoTitle} | Bumpgrade`,
      description: segment.seoDescription,
      url: canonical,
      images: primaryFeature ? [{ url: primaryFeature.imageUrl }] : undefined,
    },
  };
}

function routeStatusLabel(status: AudienceSegmentRelatedRoute["status"]) {
  return status === "live" ? "Available now" : "Coming later";
}

function routeStatusClass(status: AudienceSegmentRelatedRoute["status"]) {
  return status === "live" ? "live" : "pending";
}

function kindLabel(kind: AudienceSegmentRelatedRoute["kind"]) {
  if (kind === "feature") return "Feature";
  if (kind === "comparison") return "Comparison";
  if (kind === "importer") return "Importer";
  if (kind === "pricing") return "Pricing";
  if (kind === "agent") return "AI helper";
  return "Resource";
}

function featureSlugFromRoute(route: string) {
  return route.startsWith("/features/") ? route.replace("/features/", "") : null;
}

function primaryMarketingFeature(routes: AudienceSegmentRelatedRoute[]) {
  for (const route of routes) {
    const slug = featureSlugFromRoute(route.route);
    if (!slug) continue;
    const feature = getMarketingFeature(slug);
    if (feature) return feature;
  }

  return null;
}

function evidenceLabel(route: string) {
  return evidenceRouteLabels[route] ?? "Readable record";
}

function publicBoundaryText(boundary: string) {
  return boundary
    .replace(/\bdraft\b/gi, "prepare")
    .replaceAll("source-data routes", "readable records")
    .replaceAll("source-data", "readable data")
    .replaceAll("confirmed-write", "owner-confirmed")
    .replaceAll("admin UI", "private owner pages");
}

function publicJourneyLabel(journeyId: string) {
  return journeyId
    .replace(/^journey-/, "")
    .replace(/\bpreviews?\b/g, "opens")
    .replace(/\bsandbox\b/g, "test")
    .replace(/\badmin\b/g, "owner")
    .replaceAll("-", " ");
}

export default async function AudienceUseCasePage({ params }: AudienceUseCasePageProps) {
  const { slug } = await params;
  const segment = getAudienceSegment(slug);

  if (!segment) {
    notFound();
  }

  const primaryFeature = primaryMarketingFeature(segment.relatedRoutes);
  const heroImage = primaryFeature?.imageUrl ?? "/marketing/launch-funnel-card.png";
  const heroImageAlt = primaryFeature?.imageAlt ?? "Bumpgrade launch workspace with page, offer, checkout, and follow-up steps.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: segment.seoTitle,
    url: audienceSegmentUrl(segment),
    description: segment.seoDescription,
    audience: {
      "@type": "Audience",
      audienceType: segment.title,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Bumpgrade",
      url: "https://bumpgrade.com",
    },
  };

  return (
    <main className="marketing-feature-detail-page audience-use-case-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="feature-detail-hero">
        <div>
          <Link href="/users" className="back-link">
            <ArrowLeft aria-hidden="true" />
            All users
          </Link>
          <p className="eyebrow">Bumpgrade for {segment.title.toLowerCase()}</p>
          <h1>{segment.headline}</h1>
          <p className="lede">{segment.seoDescription}</p>
          <div className="hero-actions">
            <Link href={segment.primaryCta.route} className="primary-action">
              {segment.primaryCta.label}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={segment.secondaryCta.route} className="secondary-action">
              {segment.secondaryCta.label}
              <Sparkles aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-detail-media">
          <Image src={heroImage} alt={heroImageAlt} width={1200} height={650} priority unoptimized />
          <div>
            <span className="status-badge live">Dedicated use case</span>
            <strong>{segment.title}</strong>
            <p>{segment.summary}</p>
          </div>
        </aside>
      </section>

      <section className="content-band feature-story-band">
        <div className="feature-story-grid">
          <article>
            <p className="eyebrow">Best for</p>
            <h2>{segment.bestFor}</h2>
          </article>
          <article>
            <p className="eyebrow">Outcome</p>
            <h2>{segment.outcome}</h2>
          </article>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Launch jobs</p>
            <h2>Start with the jobs this audience needs to finish.</h2>
          </div>
          <p>Each path links into the Bumpgrade feature or migration surface that already carries the current boundary.</p>
        </div>
        <div className="feature-benefit-grid">
          {segment.primaryJobs.map((job) => (
            <article key={job}>
              <BadgeCheck aria-hidden="true" />
              <p>{job}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Related paths</p>
            <h2>Open the Bumpgrade surfaces that match this use case.</h2>
          </div>
        </div>
        <div className="linked-record-grid">
          {segment.relatedRoutes.map((route) => (
            <article key={route.route}>
              <Link2 aria-hidden="true" />
              <span className={`status-badge ${routeStatusClass(route.status)}`}>{routeStatusLabel(route.status)}</span>
              <h3>{route.label}</h3>
              <p>{route.summary}</p>
              <div className="feature-detail">
                <strong>{kindLabel(route.kind)}</strong>
                <Link href={route.route}>Open path</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band feature-proof-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">AI-readable references</p>
            <h2>Use these records when an AI helper needs grounded context.</h2>
          </div>
          <Link href="/developers-and-agents" className="secondary-action">
            Agent guide
            <Users aria-hidden="true" />
          </Link>
        </div>
        <div className="linked-record-grid">
          <article>
            <Link2 aria-hidden="true" />
            <h3>Readable records</h3>
            <ul>
              {segment.evidenceRoutes.map((route) => (
                <li key={route}>
                  <Link href={route}>{evidenceLabel(route)}</Link>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <BadgeCheck aria-hidden="true" />
            <h3>Journey references</h3>
            <ul>
              {segment.journeyIds.map((journeyId) => (
                <li key={journeyId}>{publicJourneyLabel(journeyId)}</li>
              ))}
            </ul>
          </article>
          <article>
            <Sparkles aria-hidden="true" />
            <h3>Safety boundary</h3>
            <p>{publicBoundaryText(segment.agentBoundary)}</p>
            <Link href="/agent-docs/source-data" className="text-link compact-link">
              Agent records
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
