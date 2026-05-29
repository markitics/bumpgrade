import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeDollarSign, ShieldCheck, ShoppingCart, TimerReset } from "lucide-react";

import { BeforeAfterVisualPanel } from "@/components/before-after-marketing-visual";
import { CheckoutStartPanel } from "@/components/checkout-start-panel";
import {
  checkoutOfferStacks,
  getCheckoutOfferStackBySlug,
  offerStackBeforeAfterVisual,
  type CheckoutOffer,
} from "@/lib/checkout-offers";
import { site } from "@/lib/site";

type OfferPreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicCheckoutBoundary =
  "Customer-facing billing opens only after the offer has verified payment setup, trusted webhook handling, owner confirmation, and redacted audit evidence.";
const offerPageDescription =
  "A checkout offer sequence with a primary launch product, order bump, and follow-up offers that keeps payment and fulfillment safeguards visible.";

function customerOfferCopy(value: string) {
  return value
    .replaceAll("implementation checklist", "launch checklist")
    .replaceAll("implementation package", "launch support package")
    .replaceAll("implementation", "setup")
    .replaceAll("webhook-confirmed checkout", "verified checkout")
    .replaceAll("webhook", "payment confirmation");
}

export function generateStaticParams() {
  return checkoutOfferStacks.map((stack) => ({ slug: stack.slug }));
}

export async function generateMetadata({ params }: OfferPreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stack = getCheckoutOfferStackBySlug(slug);

  if (!stack) return {};

  return {
    title: stack.title,
    description: offerPageDescription,
    alternates: {
      canonical: `${site.url}${stack.previewRoute}`,
    },
    openGraph: {
      title: stack.title,
      description: offerPageDescription,
      url: `${site.url}${stack.previewRoute}`,
      type: "article",
    },
  };
}

function OfferCard({ offer }: { offer: CheckoutOffer }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className={`status-badge ${offer.kind === "primary" ? "active" : "live"}`}>
          {offer.kind.replaceAll("_", " ")}
        </span>
        <span className="admin-pill">{offer.priceLabel.replace(/\bdraft\s+/i, "")}</span>
      </div>
      <h3>{offer.title}</h3>
      <p>{customerOfferCopy(offer.customerPromise)}</p>
      <div className="feature-detail">
        <strong>Placement</strong>
        <span>{customerOfferCopy(offer.placement)}</span>
      </div>
      <div className="feature-detail">
        <strong>Offer type</strong>
        <span>{offer.kind.replaceAll("_", " ")}</span>
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
  const beforeAfterVisual = offerStackBeforeAfterVisual(stack);
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: stack.title,
    url: `${site.url}${stack.previewRoute}`,
    description: offerPageDescription,
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
          <p className="eyebrow">Checkout offer</p>
          <h1>{stack.title}</h1>
          <p className="lede">{offerPageDescription}</p>
          <div className="hero-actions">
            <Link href={stack.linkedFunnelRoute} className="primary-action">
              See the funnel
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="secondary-action">
              See launch pricing
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Checkout offer status">
          <ShoppingCart aria-hidden="true" />
          <p>Status</p>
          <strong>{sequence.length} offer decisions</strong>
          <span>
            The checkout path shows a primary offer, order bump, and follow-up offer sequence with payment, fulfillment,
            commission, and notification safeguards kept separate.
          </span>
        </aside>
      </section>

      <CheckoutStartPanel
        stack={{ ...stack, writeBoundary: publicCheckoutBoundary }}
        context={{
          eyebrow: "Checkout path",
          heading: "Choose the bump and review the checkout path.",
          agentClientId: "offer-ui",
        }}
      />

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Before and after</p>
            <h2>See how offer notes become a protected checkout path.</h2>
          </div>
          <p>
            The visual keeps buyer, billing, and fulfillment details out of public view while showing how the offer
            sequence is reviewed before launch.
          </p>
        </div>
        <BeforeAfterVisualPanel visual={beforeAfterVisual} />
      </section>

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
            <h2>Payment steps stay clear before money moves</h2>
          </div>
          <Link href="/products/indie-launch-library" className="text-link compact-link">
            Product access
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge active">Checked path</span>
              <span className="admin-pill">Primary offer</span>
            </div>
            <BadgeDollarSign aria-hidden="true" />
            <h3>Hosted Checkout stays first</h3>
            <p>
              The primary offer and launch checklist bump require exact confirmation before Bumpgrade checks payment
              setup.
            </p>
          </article>
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge live">Follow-up</span>
              <span className="admin-pill">Post purchase</span>
            </div>
            <TimerReset aria-hidden="true" />
            <h3>{stack.postPurchasePath.expiresAfterMinutes}-minute upsell window</h3>
            <p>
              Bumpgrade can record a follow-up decision after a verified checkout, while one-click charging and access
              changes stay protected.
            </p>
          </article>
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge blocked">Protected</span>
              <span className="admin-pill">Billing safety</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>Charging stays protected</h3>
            <p>{publicCheckoutBoundary}</p>
          </article>
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Privacy and safety</p>
            <h2>Offer structure is visible; payment data stays private.</h2>
          </div>
          <Link href="/developers-and-agents" className="text-link compact-link">
            Developer details
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <ShoppingCart aria-hidden="true" />
            <h3>Clear offer sequence</h3>
            <p>The primary offer, bump, upsell, and downsell are separated so the buyer path is easy to review.</p>
          </div>
          <div>
            <ShoppingCart aria-hidden="true" />
            <h3>Raw Stripe IDs stay private</h3>
            <p>Model-visible offer records use stable Bumpgrade IDs and never expose raw Checkout Session data.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Fulfillment waits for proof</h3>
            <p>
              Fulfillment, access, payable commissions, and post-purchase billing depend on trusted payment and owner
              review state.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
