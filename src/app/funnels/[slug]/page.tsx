import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, PanelsTopLeft, ShieldCheck } from "lucide-react";

import { CheckoutStartPanel } from "@/components/checkout-start-panel";
import { FunnelPageViewBeacon } from "@/components/funnel-page-view-beacon";
import { checkoutOfferStack } from "@/lib/checkout-offers";
import { getPublishedD1FunnelBySlug } from "@/lib/funnel-drafts";
import {
  funnelBlockLibrary,
  funnelTemplateLibrary,
  getFunnelBySlug,
  seededFunnels,
} from "@/lib/funnels";
import { site } from "@/lib/site";

type FunnelPreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return seededFunnels.map((funnel) => ({ slug: funnel.slug }));
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPublicFunnel(slug: string) {
  return getFunnelBySlug(slug) ?? (await getPublishedD1FunnelBySlug(slug));
}

export async function generateMetadata({ params }: FunnelPreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const funnel = await getPublicFunnel(slug);

  if (!funnel) return {};

  return {
    title: funnel.title,
    description: funnel.summary,
    alternates: {
      canonical: `${site.url}${funnel.previewRoute}`,
    },
    openGraph: {
      title: funnel.title,
      description: funnel.summary,
      url: `${site.url}${funnel.previewRoute}`,
      type: "article",
    },
  };
}

export default async function FunnelPreviewPage({ params }: FunnelPreviewPageProps) {
  const { slug } = await params;
  const funnel = await getPublicFunnel(slug);

  if (!funnel) {
    notFound();
  }

  const published = funnel.status === "published";
  const hasLinkedCheckoutBlock = funnel.steps.some((step) =>
    step.blocks.some((block) => block.kind === "checkout" && block.checkoutLink?.offerStackId === checkoutOfferStack.id),
  );
  const canStartLinkedCheckout = published && hasLinkedCheckoutBlock;

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: funnel.title,
    url: `${site.url}${funnel.previewRoute}`,
    description: funnel.summary,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    about: funnel.linkedFeatureIds,
  };

  return (
    <main className="route-page">
      <FunnelPageViewBeacon
        eventDefinitionId="event-funnel-page-view"
        experimentId="experiment-opt-in-hero-promise"
        sourceRoute={funnel.previewRoute}
        funnelId={funnel.id}
        steps={funnel.steps.map((step) => ({ stepId: step.id, routeAnchor: step.routeAnchor }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Funnel example</p>
          <h1>{funnel.title}</h1>
          <p className="lede">{funnel.summary}</p>
          <div className="hero-actions">
            <Link href="/features/sales-funnels" className="primary-action">
              See funnel feature
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={checkoutOfferStack.previewRoute} className="secondary-action">
              Open linked checkout
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Funnel example status">
          <PanelsTopLeft aria-hidden="true" />
          <p>Status</p>
          <strong>{funnel.steps.length} steps</strong>
          <span>
            {published
              ? "Published launch path with ordered pages, reusable sections, and a connected checkout."
              : "Example launch path you can review before building your own offer flow."}
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Ordered steps</p>
            <h2>{published ? "Published funnel sequence" : "Three-step launch funnel"}</h2>
          </div>
          <Link href="/features/sales-funnels" className="text-link compact-link">
            Learn how funnels work
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {funnel.steps.map((step) => (
            <article key={step.id} id={step.routeAnchor} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge active">Step {step.order}</span>
                <span className="admin-pill">{step.kind.replaceAll("_", " ")}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.goal}</p>
              <div className="roadmap-detail">
                <strong>Page type</strong>
                <span>{step.kind.replaceAll("_", " ")}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Blocks</strong>
                <span>{step.blocks.map((block) => block.kind).join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Page blocks</p>
            <h2>Reusable page sections for this launch path</h2>
          </div>
        </div>
        <div className="feature-grid">
          {funnel.steps.flatMap((step) =>
            step.blocks.map((block) => (
              <article key={block.id} className="feature-card compact-content-card">
                <div className="feature-card-top">
                  <span className={`status-badge ${block.agentEditable ? "active" : "pending"}`}>
                    {block.agentEditable ? "Customizable" : "Fixed"}
                  </span>
                  <span className="admin-pill">{step.title}</span>
                </div>
                <h3>{block.title}</h3>
                <p>{block.body}</p>
                <div className="feature-detail">
                  <strong>Section type</strong>
                  <span>{block.kind.replaceAll("_", " ")}</span>
                </div>
              </article>
            )),
          )}
        </div>
      </section>

      {canStartLinkedCheckout ? (
        <CheckoutStartPanel
          stack={checkoutOfferStack}
          context={{
            eyebrow: "Linked funnel checkout",
            heading: "Review the checkout path from this funnel.",
            agentClientId: "public-funnel-ui",
            idempotencyPrefix: `bumpgrade-funnel-${funnel.slug}`,
          }}
        />
      ) : null}

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Template library</p>
            <h2>Reusable funnel shapes for future launches</h2>
          </div>
          <Link href="/features/simple-landing-page" className="text-link compact-link">
            See landing pages
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {funnelTemplateLibrary.map((template) => (
            <article key={template.id} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge active">Template</span>
                <span className="admin-pill">{template.audience}</span>
              </div>
              <h3>{template.title}</h3>
              <p>{template.goal}</p>
              <div className="roadmap-detail">
                <strong>Audience</strong>
                <span>{template.audience}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Steps</strong>
                <span>{template.steps.map((step) => `${step.order}. ${step.kind.replaceAll("_", " ")}`).join(" / ")}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="feature-section-heading compact-section-heading">
          <div>
            <p className="eyebrow">Block library</p>
            <h2>Reusable page sections for opt-ins, offers, resources, and checkout handoffs</h2>
          </div>
        </div>
        <div className="feature-grid">
          {funnelBlockLibrary.map((block) => (
            <article key={block.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className={`status-badge ${block.agentEditable ? "active" : "pending"}`}>
                  {block.agentEditable ? "Customizable" : "Fixed"}
                </span>
                <span className="admin-pill">{block.kind}</span>
              </div>
              <h3>{block.title}</h3>
              <p>{block.purpose}</p>
              <div className="feature-detail">
                <strong>Use it for</strong>
                <span>{block.purpose}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Launch safety</p>
            <h2>Review the funnel path before sending visitors through it.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <PanelsTopLeft aria-hidden="true" />
            <h3>Structured steps</h3>
            <p>Each page has a goal, order, and reusable sections so the launch path is easy to review.</p>
          </div>
          <div>
            <PanelsTopLeft aria-hidden="true" />
            <h3>Shareable route</h3>
            <p>The launch path can be opened, reviewed, and improved without digging through private builder screens.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>{canStartLinkedCheckout ? "Checkout connection" : "Deliberate publishing"}</h3>
            <p>
              {canStartLinkedCheckout
                ? "The funnel can pass buyers into the linked checkout review."
                : "Connect checkout only when the offer path is ready for visitors."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
