import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Link2, Sparkles } from "lucide-react";

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
      images: [{ url: feature.imageUrl }],
    },
  };
}

function availabilityLabel(status: string) {
  return status === "live" ? "Available now" : "In build";
}

export default async function MarketingFeaturePage({ params }: FeaturePageProps) {
  const { slug } = await params;
  const feature = getMarketingFeature(slug);

  if (!feature) {
    notFound();
  }

  const visibleExampleRoutes = feature.proofRoutes.filter(
    (route) => !route.includes("/source-data") && !route.startsWith("/admin"),
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
      availability: feature.status === "live" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
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
            <span className={`status-badge ${feature.status === "live" ? "live" : "pending"}`}>
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

      <section className="content-band dark-band feature-proof-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">See it in Bumpgrade</p>
            <h2>Open the related examples and decide whether this fits your launch.</h2>
          </div>
          <Link href="/pricing" className="secondary-action">
            Plan launch access
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="linked-record-grid">
          <article>
            <Link2 aria-hidden="true" />
            <h3>Related examples</h3>
            <ul>
              {relatedExampleRoutes.map((route) => (
                <li key={route}>
                  <Link href={route}>{route}</Link>
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
