import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react";

import { ProductTestCheckoutPanel } from "@/components/product-test-checkout-panel";
import { getPublicProductTestCheckoutLink } from "@/lib/product-test-checkout-links";

type ProductTestCheckoutPageProps = {
  params: Promise<{ linkId: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Product test checkout | Bumpgrade",
  description: "Buyer-facing test checkout for an owner-created Bumpgrade product.",
};

export default async function ProductTestCheckoutPage({ params }: ProductTestCheckoutPageProps) {
  const { linkId } = await params;
  const link = await getPublicProductTestCheckoutLink(linkId);
  if (!link) notFound();

  return (
    <main>
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Product test checkout</p>
          <h1>{link.productName}</h1>
          <p className="lede">
            Complete a buyer-facing test checkout for this owner-created product. The result is auditable test access
            evidence without live Stripe billing or customer-facing fulfillment delivery.
          </p>
          <div className="hero-actions">
            <a href="#test-checkout" className="primary-action">
              Start test checkout
              <ShoppingCart aria-hidden="true" />
            </a>
            <Link href="/products/source-data" className="secondary-action">
              Product source data
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Product test checkout status">
          <ShieldCheck aria-hidden="true" />
          <p>{link.status}</p>
          <strong>{(link.amountCents / 100).toFixed(2)} {link.currency.toUpperCase()}</strong>
          <span>Test checkout link revision is checked before access evidence is created.</span>
        </aside>
      </section>

      <div id="test-checkout">
        <ProductTestCheckoutPanel link={link} />
      </div>

      <section className="content-band alternate">
        <div className="feature-proof-grid">
          <div>
            <ShoppingCart aria-hidden="true" />
            <h3>Checkout evidence</h3>
            <p>Creates a synthetic paid checkout intent, entitlement row, fulfillment task, and audit event.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Private by default</h3>
            <p>Buyer email, hashes, idempotency keys, raw Stripe IDs, and fulfillment delivery stay out of public source-data.</p>
          </div>
          <div>
            <ArrowRight aria-hidden="true" />
            <h3>Access lookup</h3>
            <p>After checkout, use the returned checkout intent link to inspect customer-safe entitlement status.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
