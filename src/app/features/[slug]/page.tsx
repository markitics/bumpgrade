import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Link2, Sparkles } from "lucide-react";

import { CustomerProofPanel } from "@/components/customer-proof-panel";
import { getMarketingFeature, marketingFeatures, marketingFeatureUrl } from "@/lib/marketing-features";
import { site } from "@/lib/site";

type FeaturePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return marketingFeatures.map((feature) => ({ slug: feature.slug }));
}

export async function generateMetadata({ params }: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getMarketingFeature(slug);

  if (!feature) {
    return {};
  }

  return {
    title: feature.title,
    description: feature.summary,
    alternates: {
      canonical: marketingFeatureUrl(feature.slug),
    },
    openGraph: {
      title: `${feature.title} | Bumpgrade`,
      description: feature.summary,
      url: marketingFeatureUrl(feature.slug),
      images: [
        {
          url: `/features/${feature.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${feature.title} social image`,
        },
      ],
    },
  };
}

function availabilityLabel(status: string) {
  if (status === "live" || status === "launch-preview") return "Available now";
  return "Next release";
}

function availabilityClass(status: string) {
  return status === "live" ? "live" : status === "launch-preview" ? "active" : "pending";
}

function exampleRouteLabel(route: string) {
  if (route.startsWith("/funnels/")) return "Open funnel example";
  if (route.startsWith("/offers/")) return "Open offer stack";
  if (route.startsWith("/products/")) return "Open product access";
  if (route.startsWith("/audience/")) return "Open waitlist";
  if (route.startsWith("/analytics/")) return "Open analytics dashboard";
  if (route.startsWith("/affiliates/")) return "Open partner program";
  if (route === "/imports") return "Open import center";
  if (route.startsWith("/imports/clickfunnels")) return "Open ClickFunnels importer";
  if (route.startsWith("/imports/samcart")) return "Open SamCart importer";
  if (route.startsWith("/imports/kit")) return "Open Kit importer";
  if (route.startsWith("/imports/")) return "Open importer";
  if (route.startsWith("/agent-docs")) return "Open AI helper notes";
  if (route.startsWith("/pricing")) return "Open pricing";
  if (route.startsWith("/compare")) return "Open comparison hub";
  return "Open example";
}

export default async function MarketingFeaturePage({ params }: FeaturePageProps) {
  const { slug } = await params;
  const feature = getMarketingFeature(slug);

  if (!feature) {
    notFound();
  }

  const visibleExampleRoutes = feature.proofRoutes.filter(
    (route) => !route.includes("/source-data") && !route.startsWith("/admin") && !route.startsWith("/agent-docs"),
  );
  const relatedExampleRoutes = visibleExampleRoutes.length ? visibleExampleRoutes : [feature.nextStep.href];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Bumpgrade ${feature.title}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: marketingFeatureUrl(feature.slug),
    description: feature.summary,
    offers: {
      "@type": "Offer",
      url: `${site.url}/pricing`,
      availability: feature.status === "pending" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
    },
  };

  return (
    <main className="marketing-feature-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="feature-detail-hero">
        <div>
          <p className="eyebrow">{feature.category}</p>
          <h1>{feature.hero}</h1>
          <p className="lede">{feature.summary}</p>
          <div className="hero-actions">
            <Link href={feature.nextStep.href} className="primary-action">
              {feature.nextStep.label}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/features" className="secondary-action">
              All features
              <Sparkles aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-detail-media">
          <Image src={feature.imageUrl} alt={feature.imageAlt} width={1200} height={650} priority unoptimized />
          <div>
            <span className={`status-badge ${availabilityClass(feature.status)}`}>
              {availabilityLabel(feature.status)}
            </span>
            <strong>{feature.title}</strong>
            <p>{feature.availability}</p>
          </div>
        </aside>
      </section>

      <section className="content-band feature-story-band">
        <div className="feature-story-grid">
          <article>
            <p className="eyebrow">Problem</p>
            <h2>{feature.problem}</h2>
          </article>
          <article>
            <p className="eyebrow">Outcome</p>
            <h2>{feature.outcome}</h2>
          </article>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Benefits</p>
            <h2>What this helps you do</h2>
          </div>
          <p>{feature.audience}</p>
        </div>
        <div className="feature-benefit-grid">
          {feature.benefits.map((benefit) => (
            <article key={benefit}>
              <BadgeCheck aria-hidden="true" />
              <p>{benefit}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Use cases</p>
            <h2>Common launch jobs</h2>
          </div>
        </div>
        <div className="feature-use-case-grid">
          {feature.useCases.map((useCase) => (
            <span key={useCase}>{useCase}</span>
          ))}
        </div>
      </section>

      {feature.examples?.length ? (
        <section className="content-band alternate">
          <div className="split-heading">
            <div>
              <p className="eyebrow">Examples</p>
              <h2>Concrete prompts the coach can help with</h2>
            </div>
            <p>
              Use these prompts to turn the current launch state into concrete planning, copy, checkout, email, and analytics
              next steps.
            </p>
          </div>
          <div className="feature-example-grid">
            {feature.examples.map((example) => (
              <article key={example.title}>
                <span>Example prompt</span>
                <h3>{example.title}</h3>
                <p>{example.body}</p>
                <blockquote>{example.request}</blockquote>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-band dark-band feature-proof-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">See it in Bumpgrade</p>
            <h2>Open the related examples and decide whether this fits your launch.</h2>
          </div>
          <Link href="/pricing" className="secondary-action">
            Start with Bumpgrade
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <CustomerProofPanel placement="feature-detail" linkedFeatureIds={feature.featureIds} />
        <div className="linked-record-grid">
          <article>
            <Link2 aria-hidden="true" />
            <h3>Related examples</h3>
            <ul>
              {relatedExampleRoutes.map((route) => (
                <li key={route}>
                  <Link href={route}>{exampleRouteLabel(route)}</Link>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <BadgeCheck aria-hidden="true" />
            <h3>Availability</h3>
            <p>{feature.availability}</p>
          </article>
          <article>
            <Sparkles aria-hidden="true" />
            <h3>Replaces</h3>
            <p>{feature.replaces.join(", ")}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
