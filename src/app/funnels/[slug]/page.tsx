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

const funnelPageDescription =
  "A three-step product-launch funnel that shows how a publisher can capture interest, present an offer, and connect buyers to product access.";

function customerFacingCopy(value: string) {
  return value
    .replaceAll("Future slices", "Future updates")
    .replaceAll("future confirmed-write", "future protected")
    .replaceAll("confirmed-write", "protected")
    .replaceAll("commerce contract", "checkout rules")
    .replaceAll("checkout contract", "checkout rules")
    .replaceAll("product/access contracts", "product access rules")
    .replaceAll("source IDs", "verified sources")
    .replaceAll("shipped-product evidence", "approved product evidence")
    .replaceAll("R2 object", "private storage")
    .replaceAll("R2 keys", "private storage keys")
    .replaceAll("R2 key", "private storage key")
    .replaceAll("draft until", "ready after")
    .replaceAll("draft", "working")
    .replaceAll("contract", "rules");
}

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
    description: funnelPageDescription,
    alternates: {
      canonical: `${site.url}${funnel.previewRoute}`,
    },
    openGraph: {
      title: funnel.title,
      description: funnelPageDescription,
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
    description: funnelPageDescription,
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
          <p className="lede">{funnelPageDescription}</p>
          <div className="hero-actions">
            <Link href="/offers/indie-launch-stack" className="primary-action">
              View checkout offer
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="secondary-action">
              See launch pricing
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Funnel example status">
          <PanelsTopLeft aria-hidden="true" />
          <p>Status</p>
          <strong>{funnel.steps.length} steps</strong>
          <span>{published ? "A published funnel path is ready to inspect." : "A working funnel shape for a publisher launch."}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Ordered steps</p>
            <h2>{published ? "Published funnel sequence" : "Three-step launch funnel"}</h2>
          </div>
          <Link href="/offers/indie-launch-stack" className="text-link compact-link">
            Connected offer
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
              <p>{customerFacingCopy(step.goal)}</p>
              <div className="roadmap-detail">
                <strong>Role</strong>
                <span>{step.kind.replaceAll("_", " ")}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Sections</strong>
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
            <h2>Reusable page sections for launch funnels</h2>
          </div>
        </div>
        <div className="feature-grid">
          {funnel.steps.flatMap((step) =>
            step.blocks.map((block) => (
              <article key={block.id} className="feature-card compact-content-card">
                <div className="feature-card-top">
                  <span className={`status-badge ${block.agentEditable ? "active" : "blocked"}`}>
                    {block.agentEditable ? "Reusable" : "Protected"}
                  </span>
                  <span className="admin-pill">{step.title}</span>
                </div>
                <h3>{block.title}</h3>
                <p>{customerFacingCopy(block.body)}</p>
                <div className="feature-detail">
                  <strong>Purpose</strong>
                  <span>{block.kind.replaceAll("_", " ")}</span>
                </div>
                {block.resourceDeliveryLink ? (
                  <div className="feature-detail">
                    <strong>Resource access</strong>
                    <span>
                      {block.resourceDeliveryLink.productTitle} / {block.resourceDeliveryLink.assetTitle}. Access stays
                      entitlement-gated; private files and signed URLs are not exposed on this page.
                    </span>
                  </div>
                ) : null}
                {block.webinarEventLink ? (
                  <div className="feature-detail">
                    <strong>Webinar access</strong>
                    <span>
                      {block.webinarEventLink.eventTitle} via {block.webinarEventLink.providerLabel}.{" "}
                      <a href={block.webinarEventLink.registrationUrl} rel="noreferrer" target="_blank">
                        Registration
                      </a>
                      {block.webinarEventLink.replayUrl ? (
                        <>
                          {" "}
                          and{" "}
                          <a href={block.webinarEventLink.replayUrl} rel="noreferrer" target="_blank">
                            replay
                          </a>
                        </>
                      ) : null}{" "}
                      stay external; Bumpgrade does not expose provider secrets or attendee records.
                    </span>
                  </div>
                ) : null}
              </article>
            )),
          )}
        </div>
      </section>

      {canStartLinkedCheckout ? (
        <CheckoutStartPanel
          stack={{
            ...checkoutOfferStack,
            writeBoundary:
              "Checkout starts require exact confirmation, payment setup checks, and private fulfillment safeguards.",
          }}
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
            <h2>Reusable funnel shapes for private workspace starts</h2>
          </div>
          <Link href="/resources" className="text-link compact-link">
            Browse resources
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
              <p>{customerFacingCopy(template.goal)}</p>
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
            <h2>Reusable page blocks with safety rules</h2>
          </div>
        </div>
        <div className="feature-grid">
          {funnelBlockLibrary.map((block) => (
            <article key={block.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className={`status-badge ${block.agentEditable ? "active" : "blocked"}`}>
                  {block.agentEditable ? "Reusable" : "Protected"}
                </span>
                <span className="admin-pill">{block.kind}</span>
              </div>
              <h3>{block.title}</h3>
              <p>{customerFacingCopy(block.purpose)}</p>
              <div className="feature-detail">
                <strong>Safety rule</strong>
                <span>{customerFacingCopy(block.writeBoundary)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Privacy and safety</p>
            <h2>Built for real launch pages without exposing private records.</h2>
          </div>
          <Link href="/developers-and-agents" className="text-link compact-link">
            Developer details
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <PanelsTopLeft aria-hidden="true" />
            <h3>Structured pages</h3>
            <p>Every launch step has a clear role, page sections, and a connected offer path.</p>
          </div>
          <div>
            <PanelsTopLeft aria-hidden="true" />
            <h3>Readable in a browser</h3>
            <p>The funnel is crawlable and structured so visitors can understand the path without internal tooling.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>{canStartLinkedCheckout ? "Checkout is gated" : published ? "Published safely" : "Protected changes"}</h3>
            <p>
              Checkout, publishing, and private delivery changes stay behind account access, confirmation, and audit
              checks.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
