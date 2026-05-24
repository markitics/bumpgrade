import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CreditCard, FileArchive, KeyRound, ShieldCheck } from "lucide-react";

import {
  getProductAccessCatalogBySlug,
  productAccessCatalogs,
  type ProductAccessRecord,
  type ProductPaymentPlan,
} from "@/lib/product-access";
import { site } from "@/lib/site";

type ProductAccessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicProductAccessBoundary =
  "Customer access opens only after trusted payment or subscription evidence, entitlement checks, owner-safe audit records, and private asset delivery controls.";
const productPageDescription =
  "A product access library for downloads, courses, memberships, services, events, and bundles connected to trusted checkout evidence.";

function productStatusLabel(value: string) {
  if (value === "draft") return "Access model";
  return value.replaceAll("_", " ");
}

function productSummary(summary: string) {
  return summary
    .replace("Manual service fulfillment placeholder", "Manual service fulfillment model")
    .replaceAll("implementation", "setup")
    .replaceAll("webhook", "payment confirmation")
    .replaceAll("paid payment confirmation", "payment confirmation");
}

function accessTimingLabel(value: string) {
  if (value === "after_webhook_paid") return "After payment confirmation";
  if (value === "active_subscription") return "Active subscription";
  if (value === "manual_review") return "Manual review";
  return value.replaceAll("_", " ");
}

function billingModelLabel(value: string) {
  if (value === "pay_in_full") return "Pay in full";
  if (value === "installments") return "Installments";
  if (value === "subscription") return "Subscription";
  return value.replaceAll("_", " ");
}

export function generateStaticParams() {
  return productAccessCatalogs.map((catalog) => ({ slug: catalog.slug }));
}

export async function generateMetadata({ params }: ProductAccessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = getProductAccessCatalogBySlug(slug);

  if (!catalog) return {};

  return {
    title: catalog.title,
    description: productPageDescription,
    alternates: {
      canonical: `${site.url}${catalog.previewRoute}`,
    },
    openGraph: {
      title: catalog.title,
      description: productPageDescription,
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
        <span className="admin-pill">{productStatusLabel(product.status)}</span>
      </div>
      <h3>{product.title}</h3>
      <p>{productSummary(product.summary)}</p>
      <div className="feature-detail">
        <strong>Best for</strong>
        <span>{product.kind.replaceAll("_", " ")}</span>
      </div>
      <div className="feature-detail">
        <strong>Access rules</strong>
        <span>{product.accessRuleIds.length}</span>
      </div>
    </article>
  );
}

function PaymentPlanCard({ plan }: { plan: ProductPaymentPlan }) {
  const cadence = plan.installments ? `${plan.installments} payments` : plan.interval ? `Every ${plan.interval}` : "Single checkout";

  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className="status-badge active">{billingModelLabel(plan.billingModel)}</span>
        <span className="admin-pill">{cadence}</span>
      </div>
      <CreditCard aria-hidden="true" />
      <h3>{plan.title}</h3>
      <p>{plan.customerLabel}</p>
      <div className="feature-detail">
        <strong>Products</strong>
        <span>{plan.productIds.length}</span>
      </div>
      <div className="feature-detail">
        <strong>Live billing</strong>
        <span>{plan.liveBillingEnabled ? "Enabled" : "Not enabled"}</span>
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
    name: catalog.title,
    url: `${site.url}${catalog.previewRoute}`,
    description: productPageDescription,
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
          <p className="lede">{productPageDescription}</p>
          <div className="hero-actions">
            <Link href={catalog.checkoutOfferRoute} className="primary-action">
              See checkout offers
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="secondary-action">
              See launch pricing
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Product access status">
          <FileArchive aria-hidden="true" />
          <p>Status</p>
          <strong>{catalog.products.length} product types</strong>
          <span>
            Downloads, courses, memberships, services, events, bundles, and payment plans can share access rules while
            private files, lesson bodies, amounts, and buyer details stay protected.
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
            <p className="eyebrow">Payment plans</p>
            <h2>Pay-in-full, installment, and subscription plan records</h2>
          </div>
          <Link href="/products/source-data" className="text-link compact-link">
            Plan details
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {catalog.productPaymentPlans.map((plan) => (
            <PaymentPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Access rules</p>
            <h2>Entitlements depend on trusted payment or subscription evidence</h2>
          </div>
          <Link href="/products/entitlements" className="text-link compact-link">
            Check product access
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {catalog.accessRules.map((rule) => (
            <article key={rule.id} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className={`status-badge ${rule.timing === "manual_review" ? "blocked" : "active"}`}>
                  {accessTimingLabel(rule.timing)}
                </span>
                <span className="admin-pill">{rule.revocable ? "Revocable" : "Permanent"}</span>
              </div>
              <KeyRound aria-hidden="true" />
              <h3>{productSummary(rule.title)}</h3>
              <p>{productSummary(rule.grants).replace("trusted checkout.session.completed evidence", "verified payment confirmation")}</p>
              <div className="roadmap-detail">
                <strong>Unlocks after</strong>
                <span>{accessTimingLabel(rule.timing)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Privacy and safety</p>
            <h2>Product access can be checked without exposing private assets.</h2>
          </div>
          <Link href="/developers-and-agents" className="text-link compact-link">
            Developer details
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <KeyRound aria-hidden="true" />
            <h3>Access is entitlement-based</h3>
            <p>Each product type maps to rules that can be checked after a trusted checkout or subscription event.</p>
          </div>
          <div>
            <FileArchive aria-hidden="true" />
            <h3>Private assets stay private</h3>
            <p>Object keys, signed URLs, lesson bodies, buyer data, and join links stay out of customer-facing pages.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Delivery stays protected</h3>
            <p>{publicProductAccessBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
