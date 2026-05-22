import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileArchive, KeyRound, ShieldCheck } from "lucide-react";

import { getProductAccessCatalogBySlug, productAccessCatalogs, type ProductAccessRecord } from "@/lib/product-access";
import { site } from "@/lib/site";

type ProductAccessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicProductAccessBoundary =
  "Customer access opens only after payment or subscription state matches the product access rules.";

export function generateStaticParams() {
  return productAccessCatalogs.map((catalog) => ({ slug: catalog.slug }));
}

export async function generateMetadata({ params }: ProductAccessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = getProductAccessCatalogBySlug(slug);

  if (!catalog) return {};

  return {
    title: catalog.title,
    description: catalog.summary,
    alternates: {
      canonical: `${site.url}${catalog.previewRoute}`,
    },
    openGraph: {
      title: catalog.title,
      description: catalog.summary,
      url: `${site.url}${catalog.previewRoute}`,
      type: "article",
    },
  };
}

function ProductCard({ product }: { product: ProductAccessRecord }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className="status-badge active">{product.kind.replaceAll("_", " ")}</span>
        <span className="admin-pill">Access path</span>
      </div>
      <h3>{product.title}</h3>
      <p>{product.summary}</p>
      <div className="feature-detail">
        <strong>Delivery type</strong>
        <span>{product.kind.replaceAll("_", " ")}</span>
      </div>
      <div className="feature-detail">
        <strong>Access rules</strong>
        <span>{product.accessRuleIds.length}</span>
      </div>
    </article>
  );
}

function sourceEventLabel(sourceEvent: string) {
  if (sourceEvent === "checkout.session.completed") return "Completed checkout";
  if (sourceEvent === "customer.subscription.updated") return "Active subscription";
  if (sourceEvent === "payment_audit_events") return "Payment review";
  return sourceEvent.replaceAll("_", " ");
}

function fulfillmentTimingLabel(timing: string) {
  if (timing === "after_webhook_paid") return "After paid checkout";
  if (timing === "manual_review") return "Manual review";
  if (timing === "active_subscription") return "Active subscription";
  return timing.replaceAll("_", " ");
}

export default async function ProductAccessPage({ params }: ProductAccessPageProps) {
  const { slug } = await params;
  const catalog = getProductAccessCatalogBySlug(slug);

  if (!catalog) {
    notFound();
  }

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: catalog.title,
    url: `${site.url}${catalog.previewRoute}`,
    description: catalog.summary,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    about: ["digital products", "courses", "memberships", "fulfillment", "entitlements"],
  };

  return (
    <main className="route-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Product access</p>
          <h1>{catalog.title}</h1>
          <p className="lede">{catalog.summary}</p>
          <div className="hero-actions">
            <Link href="/features/digital-products" className="primary-action">
              See product feature
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={catalog.checkoutOfferRoute} className="secondary-action">
              Open linked checkout
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Product access status">
          <FileArchive aria-hidden="true" />
          <p>Status</p>
          <strong>{catalog.products.length} product types</strong>
          <span>
            Connect products to checkout, access rules, memberships, downloads, and protected content so customers get
            the right thing after purchase.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Product catalog</p>
            <h2>Downloads, courses, memberships, services, events, and bundles</h2>
          </div>
          <Link href={catalog.checkoutOfferRoute} className="text-link compact-link">
            Checkout offers
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {catalog.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Access rules</p>
            <h2>Customer access depends on trusted payment or subscription state</h2>
          </div>
          <Link href="/features/digital-products" className="text-link compact-link">
            Learn about product delivery
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {catalog.accessRules.map((rule) => (
            <article key={rule.id} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className={`status-badge ${rule.timing === "manual_review" ? "pending" : "planned"}`}>
                  {fulfillmentTimingLabel(rule.timing)}
                </span>
                <span className="admin-pill">{rule.revocable ? "Revocable" : "Permanent"}</span>
              </div>
              <KeyRound aria-hidden="true" />
              <h3>{rule.title}</h3>
              <p>{rule.grants}</p>
              <div className="roadmap-detail">
                <strong>Unlocks after</strong>
                <span>{sourceEventLabel(rule.sourceEvent)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Delivery safety</p>
            <h2>Give customers access only when the purchase state matches.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <KeyRound aria-hidden="true" />
            <h3>Access rules</h3>
            <p>Each product defines what purchase, subscription, or manual review state should unlock it.</p>
          </div>
          <div>
            <FileArchive aria-hidden="true" />
            <h3>Private assets stay private</h3>
            <p>Download files, lesson bodies, buyer data, and join links stay behind customer access checks.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Trusted fulfillment</h3>
            <p>{publicProductAccessBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
