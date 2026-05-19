import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Database, FileArchive, KeyRound, ShieldCheck } from "lucide-react";

import { getProductAccessCatalogBySlug, productAccessCatalogs, type ProductAccessRecord } from "@/lib/product-access";
import { site } from "@/lib/site";

type ProductAccessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return productAccessCatalogs.map((catalog) => ({ slug: catalog.slug }));
}

export async function generateMetadata({ params }: ProductAccessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = getProductAccessCatalogBySlug(slug);

  if (!catalog) return {};

  return {
    title: `${catalog.title} Preview`,
    description: `${catalog.summary} This Bumpgrade product/access scaffold is tied to issue #${catalog.issue}.`,
    alternates: {
      canonical: `${site.url}${catalog.previewRoute}`,
    },
    openGraph: {
      title: `${catalog.title} preview`,
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
        <span className="status-badge planned">{product.kind.replaceAll("_", " ")}</span>
        <span className="admin-pill">{product.status}</span>
      </div>
      <h3>{product.title}</h3>
      <p>{product.summary}</p>
      <div className="feature-detail">
        <strong>Product ID</strong>
        <span>{product.id}</span>
      </div>
      <div className="feature-detail">
        <strong>Access rules</strong>
        <span>{product.accessRuleIds.length}</span>
      </div>
    </article>
  );
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
    name: `${catalog.title} preview`,
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
          <p className="eyebrow">Product access preview</p>
          <h1>{catalog.title}</h1>
          <p className="lede">{catalog.summary}</p>
          <div className="hero-actions">
            <Link href="/products/source-data" className="primary-action">
              Product JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${catalog.issue}`} className="secondary-action">
              Issue #{catalog.issue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Product access preview status">
          <FileArchive aria-hidden="true" />
          <p>Status</p>
          <strong>{catalog.products.length} product types</strong>
          <span>
            Assets, access rules, entitlement templates, and sandbox grant mappings are public-safe records; private
            downloads, protected content, and live fulfillment stay disabled until confirmed-write APIs exist.
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
            <h2>Entitlements depend on trusted payment or subscription evidence</h2>
          </div>
          <Link href={catalog.commerceContractRoute} className="text-link compact-link">
            Commerce contract
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {catalog.accessRules.map((rule) => (
            <article key={rule.id} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className={`status-badge ${rule.timing === "manual_review" ? "pending" : "planned"}`}>
                  {rule.timing.replaceAll("_", " ")}
                </span>
                <span className="admin-pill">{rule.revocable ? "Revocable" : "Permanent"}</span>
              </div>
              <KeyRound aria-hidden="true" />
              <h3>{rule.title}</h3>
              <p>{rule.grants}</p>
              <div className="roadmap-detail">
                <strong>Source event</strong>
                <span>{rule.sourceEvent}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Write boundary</p>
            <h2>Agents can inspect entitlement grants, not deliver private assets.</h2>
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
              <code>/products/source-data</code> exposes public-safe product, asset, access-rule, entitlement
              template, and sandbox grant mapping records.
            </p>
          </div>
          <div>
            <FileArchive aria-hidden="true" />
            <h3>Private assets stay private</h3>
            <p>R2 object keys, signed URLs, lesson bodies, buyer data, and join links are excluded from public data.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes later</h3>
            <p>{catalog.writeBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
