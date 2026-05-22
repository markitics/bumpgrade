import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeDollarSign, ShieldCheck, ShoppingCart, TimerReset } from "lucide-react";

import { CheckoutStartPanel } from "@/components/checkout-start-panel";
import { checkoutOfferStacks, getCheckoutOfferStackBySlug, type CheckoutOffer } from "@/lib/checkout-offers";
import { site } from "@/lib/site";

type OfferPreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicCheckoutBoundary =
  "Bumpgrade keeps payment details private and only moves buyers forward after the checkout result is trusted.";

export function generateStaticParams() {
  return checkoutOfferStacks.map((stack) => ({ slug: stack.slug }));
}

export async function generateMetadata({ params }: OfferPreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stack = getCheckoutOfferStackBySlug(slug);

  if (!stack) return {};

  return {
    title: stack.title,
    description: stack.summary,
    alternates: {
      canonical: `${site.url}${stack.previewRoute}`,
    },
    openGraph: {
      title: stack.title,
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
        <strong>Offer type</strong>
        <span>{offer.kind.replaceAll("_", " ")}</span>
      </div>
    </article>
  );
}

function postPurchaseTriggerLabel(trigger: string) {
  if (trigger === "checkout.session.completed") return "checkout completion";
  return trigger.replaceAll("_", " ");
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
    name: stack.title,
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
          <p className="eyebrow">Checkout offer</p>
          <h1>{stack.title}</h1>
          <p className="lede">{stack.summary}</p>
          <div className="hero-actions">
            <Link href="/features/order-bump" className="primary-action">
              See checkout feature
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={stack.linkedFunnelRoute} className="secondary-action">
              Open linked funnel
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Checkout offer status">
          <ShoppingCart aria-hidden="true" />
          <p>Status</p>
          <strong>{sequence.length} offer decisions</strong>
          <span>
            Review the primary offer, optional bump, post-purchase path, referral attribution, and buyer handoff before
            sending traffic to checkout.
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
            <h2>Keep the buyer path clear before money moves.</h2>
          </div>
          <Link href="/features/order-bump" className="text-link compact-link">
            Learn about order bumps
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
            <h3>Hosted checkout stays first</h3>
            <p>
              The primary offer and launch checklist bump stay together so buyers can review the full order before
              payment.
            </p>
          </article>
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge active">Next offer</span>
              <span className="admin-pill">Post purchase</span>
            </div>
            <TimerReset aria-hidden="true" />
            <h3>{stack.postPurchasePath.expiresAfterMinutes}-minute upsell window</h3>
            <p>
              After {postPurchaseTriggerLabel(stack.postPurchasePath.trigger)}, Bumpgrade can present the next offer decision without confusing the
              buyer’s original purchase.
            </p>
          </article>
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge active">Protected</span>
              <span className="admin-pill">Billing safety</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>Payment details stay private</h3>
            <p>{publicCheckoutBoundary}</p>
          </article>
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Buyer safety</p>
            <h2>Show the offer clearly and keep payment state trusted.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <ShoppingCart aria-hidden="true" />
            <h3>Clear order review</h3>
            <p>Buyers can see the main offer, optional bump, and total before checkout starts.</p>
          </div>
          <div>
            <ShoppingCart aria-hidden="true" />
            <h3>Private payment handling</h3>
            <p>Payment details stay server-side while the page shows only the buyer-facing offer state.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Trusted purchase handoff</h3>
            <p>Fulfillment, partner attribution, and product access depend on a completed checkout result.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
