import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ArrowRight, ReceiptText, ShieldCheck, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PostPurchaseDecisionPanel } from "@/components/post-purchase-decision-panel";
import { checkoutOfferStack } from "@/lib/checkout-offers";
import {
  isEligiblePostPurchaseCheckout,
  loadPostPurchaseCheckout,
  postPurchaseDecisionContract,
  publicPostPurchaseCheckout,
} from "@/lib/post-purchase-decisions";
import { site } from "@/lib/site";

type PostPurchasePageProps = {
  params: Promise<{
    intentId: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Post-purchase offer path | Bumpgrade",
  description: "Non-billing post-purchase upsell and downsell decision path for trusted Bumpgrade checkout evidence.",
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as Cloudflare.Env).DB ?? null;
}

export default async function PostPurchasePage({ params }: PostPurchasePageProps) {
  const { intentId } = await params;
  const db = await getDb();
  const checkout = db ? await loadPostPurchaseCheckout(db, intentId) : null;
  const publicCheckout = checkout ? publicPostPurchaseCheckout(checkout) : null;
  const eligible = checkout ? isEligiblePostPurchaseCheckout(checkout) : false;
  const pageUrl = `${site.url}/commerce/post-purchase/${intentId}`;

  return (
    <main className="route-page">
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Post-purchase offer path</p>
          <h1>Choose the next Bumpgrade launch offer.</h1>
          <p className="lede">
            The launch accelerator upsell and launch review downsell can record follow-up decisions after trusted
            checkout evidence. This path keeps billing mutation locked behind future contracts.
          </p>
          <div className="hero-actions">
            <Link href="/offers/source-data" className="primary-action">
              Offer JSON
              <ReceiptText aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${postPurchaseDecisionContract.issue}`} className="secondary-action">
              Issue #{postPurchaseDecisionContract.issue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Post-purchase checkout status">
          <ShoppingCart aria-hidden="true" />
          <p>Status</p>
          <strong>{eligible ? "Offer window open" : "Checkout evidence needed"}</strong>
          <span>
            {eligible
              ? `${checkoutOfferStack.postPurchasePath.expiresAfterMinutes}-minute follow-up path for ${checkoutOfferStack.postPurchasePath.id}.`
              : "A paid or completed checkout intent is required before decisions can be recorded."}
          </span>
        </aside>
      </section>

      {publicCheckout && eligible ? (
        <PostPurchaseDecisionPanel checkout={publicCheckout} stack={checkoutOfferStack} />
      ) : (
        <section className="content-band">
          <div className="roadmap-grid">
            <article className="roadmap-card">
              <ShieldCheck aria-hidden="true" />
              <h2>Checkout not eligible yet</h2>
              <p>
                This route found <code>{intentId}</code>, but post-purchase decisions require trusted paid or completed
                checkout state before the upsell/downsell path opens.
              </p>
              <Link href="/commerce/source-data" className="text-link compact-link">
                Commerce source data
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article className="roadmap-card">
              <ReceiptText aria-hidden="true" />
              <h2>Decision contract</h2>
              <p>{postPurchaseDecisionContract.writeBoundary}</p>
            </article>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Bumpgrade post-purchase offer path",
            url: pageUrl,
            about: ["post-purchase upsell", "downsell", "checkout", "non-billing decision evidence"],
          }).replaceAll("<", "\\u003c"),
        }}
      />
    </main>
  );
}
