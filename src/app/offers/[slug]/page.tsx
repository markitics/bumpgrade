import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeDollarSign, Database, ShieldCheck, ShoppingCart, TimerReset } from "lucide-react";

import { CheckoutStartPanel } from "@/components/checkout-start-panel";
import { checkoutOfferStacks, getCheckoutOfferStackBySlug, type CheckoutOffer } from "@/lib/checkout-offers";
import { site } from "@/lib/site";

type OfferPreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return checkoutOfferStacks.map((stack) => ({ slug: stack.slug }));
}

export async function generateMetadata({ params }: OfferPreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stack = getCheckoutOfferStackBySlug(slug);

  if (!stack) return {};

  return {
    title: `${stack.title} Preview`,
    description: `${stack.summary} This is a sandbox Bumpgrade checkout-offer scaffold tied to issue #${stack.issue}.`,
    alternates: {
      canonical: `${site.url}${stack.previewRoute}`,
    },
    openGraph: {
      title: `${stack.title} preview`,
      description: stack.summary,
      url: `${site.url}${stack.previewRoute}`,
      type: "article",
    },
  };
}

function OfferCard({ offer }: { offer: CheckoutOffer }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className={`status-badge ${offer.kind === "primary" ? "active" : "planned"}`}>
          {offer.kind.replaceAll("_", " ")}
        </span>
        <span className="admin-pill">{offer.priceLabel}</span>
      </div>
      <h3>{offer.title}</h3>
      <p>{offer.customerPromise}</p>
      <div className="feature-detail">
        <strong>Placement</strong>
        <span>{offer.placement}</span>
      </div>
      <div className="feature-detail">
        <strong>Offer ID</strong>
        <span>{offer.id}</span>
      </div>
    </article>
  );
}

export default async function OfferPreviewPage({ params }: OfferPreviewPageProps) {
  const { slug } = await params;
  const stack = getCheckoutOfferStackBySlug(slug);

  if (!stack) {
    notFound();
  }

  const sequence = [stack.primaryOffer, ...stack.orderBumps, ...stack.postPurchasePath.offers];
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${stack.title} preview`,
    url: `${site.url}${stack.previewRoute}`,
    description: stack.summary,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    about: ["checkout", "order bump", "upsell", "downsell", "Stripe Checkout"],
  };

  return (
    <main className="route-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Checkout offer preview</p>
          <h1>{stack.title}</h1>
          <p className="lede">{stack.summary}</p>
          <div className="hero-actions">
            <Link href="/offers/source-data" className="primary-action">
              Offer JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${stack.issue}`} className="secondary-action">
              Issue #{stack.issue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Checkout offer preview status">
          <ShoppingCart aria-hidden="true" />
          <p>Status</p>
          <strong>{sequence.length} offer decisions</strong>
          <span>
            Sandbox checkout start is available for the primary offer and seeded order bump. Upsells, downsells,
            fulfillment, and live billing stay disabled until confirmed-write contracts exist.
          </span>
        </aside>
      </section>

      <CheckoutStartPanel stack={stack} />

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Offer sequence</p>
            <h2>Primary offer, order bump, upsell, and downsell</h2>
          </div>
          <Link href={stack.linkedFunnelRoute} className="text-link compact-link">
            Linked funnel
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {sequence.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Checkout mechanics</p>
            <h2>Read contract before billing writes</h2>
          </div>
          <Link href="/commerce/source-data" className="text-link compact-link">
            Commerce contract
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge active">Sandbox</span>
              <span className="admin-pill">Primary offer</span>
            </div>
            <BadgeDollarSign aria-hidden="true" />
            <h3>Hosted Checkout stays first</h3>
            <p>
              The seeded primary offer and launch checklist bump link to <code>{stack.checkoutEndpoint}</code> and
              require exact confirmation text before a sandbox Checkout Session is attempted.
            </p>
          </article>
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge planned">Planned</span>
              <span className="admin-pill">Post purchase</span>
            </div>
            <TimerReset aria-hidden="true" />
            <h3>{stack.postPurchasePath.expiresAfterMinutes}-minute upsell window</h3>
            <p>
              The preview models a limited upsell and downsell after {stack.postPurchasePath.trigger}, but no one-click
              charge or entitlement write is live in this slice.
            </p>
          </article>
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge pending">Locked</span>
              <span className="admin-pill">Billing safety</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes later</h3>
            <p>{stack.writeBoundary}</p>
          </article>
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Agent boundary</p>
            <h2>Agents can inspect offer structure, not mutate billing.</h2>
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
              <code>/offers/source-data</code> exposes public-safe offer, bump, upsell, downsell, revision, and
              confirmation records.
            </p>
          </div>
          <div>
            <ShoppingCart aria-hidden="true" />
            <h3>Raw Stripe IDs stay private</h3>
            <p>Model-visible offer records use stable Bumpgrade IDs and never expose raw Checkout Session data.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Webhook evidence required</h3>
            <p>Fulfillment, access, and post-purchase billing depend on trusted webhook state in a later slice.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
