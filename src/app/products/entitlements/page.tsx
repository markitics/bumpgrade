import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, FileArchive, KeyRound, ReceiptText, Search, ShieldCheck } from "lucide-react";

import { CustomerDownloadTokenButton } from "@/components/customer-download-token-button";
import {
  customerProductEntitlementLookupApiRoute,
  customerProductEntitlementLookupIssue,
  getCustomerProductEntitlementLookup,
} from "@/lib/customer-product-entitlements";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Customer product access lookup | Bumpgrade",
  description:
    "Customer-safe Bumpgrade entitlement lookup for checkout product access without exposing private buyer, Stripe, R2, or signed URL data.",
  alternates: {
    canonical: `${site.url}/products/entitlements`,
  },
  openGraph: {
    title: "Customer product access lookup",
    description: "Inspect product entitlements and fulfillment state from a checkout intent without private data leaks.",
    url: `${site.url}/products/entitlements`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CustomerProductEntitlementsPageProps = {
  searchParams: Promise<{
    checkout_intent_id?: string;
    checkoutIntentId?: string;
  }>;
};

function compactDate(value: string | null) {
  if (!value) return "None recorded";
  return value.replace("T", " ").replace(".000Z", " UTC");
}

function statusClass(status: string | null) {
  if (status === "active" || status === "queued" || status === "paid") return "active";
  if (status === "revoked" || status === "failed") return "blocked";
  return "pending";
}

function sourceLabel(source: string) {
  if (source === "d1") return "Entitlement store";
  if (source === "invalid") return "Invalid checkout intent";
  if (source === "missing") return "Checkout intent needed";
  return "D1 unavailable";
}

export default async function CustomerProductEntitlementsPage({ searchParams }: CustomerProductEntitlementsPageProps) {
  const params = await searchParams;
  const checkoutIntentId = params.checkout_intent_id ?? params.checkoutIntentId ?? null;
  const lookup = await getCustomerProductEntitlementLookup(checkoutIntentId);
  const encodedIntent = lookup.checkoutIntentId ? encodeURIComponent(lookup.checkoutIntentId) : null;

  return (
    <main className="route-page customer-entitlements-page">
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Customer product access</p>
          <h1>Customer product access lookup</h1>
          <p className="lede">
            Check which products a completed checkout unlocked. This lookup shows entitlement and fulfillment
            status only; buyer email, hashes, raw Stripe identifiers, private object keys, metadata JSON, and signed URLs
            stay excluded.
          </p>
          <form className="checkout-field" action="/products/entitlements">
            <label htmlFor="checkout-intent-id">Checkout intent ID</label>
            <input
              id="checkout-intent-id"
              name="checkout_intent_id"
              type="text"
              defaultValue={checkoutIntentId ?? ""}
              placeholder="checkout-intent-..."
              autoComplete="off"
            />
            <div className="hero-actions">
              <button className="primary-action" type="submit">
                Look up access
                <Search aria-hidden="true" />
              </button>
              <Link href="/products/source-data" className="secondary-action">
                Product JSON
                <Database aria-hidden="true" />
              </Link>
            </div>
          </form>
        </div>
        <aside className={`feature-status-panel ${statusClass(lookup.checkout?.status ?? lookup.source)}`} aria-label="Customer entitlement lookup status">
          <FileArchive aria-hidden="true" />
          <p>{sourceLabel(lookup.source)}</p>
          <strong>
            {lookup.counts.entitlements} entitlement{lookup.counts.entitlements === 1 ? "" : "s"}
          </strong>
          <span>{lookup.loadError ?? lookup.checkout?.status ?? "Paste the checkout intent returned by the checkout success page."}</span>
        </aside>
      </section>

      {lookup.checkout ? (
        <section className="content-band alternate">
          <div className="feature-proof-grid">
            <div>
              <ReceiptText aria-hidden="true" />
              <h3>Checkout state</h3>
              <p>
                {lookup.checkout.status} · {lookup.checkout.amount ?? "No amount"} · updated{" "}
                {compactDate(lookup.checkout.updatedAt)}.
              </p>
            </div>
            <div>
              <KeyRound aria-hidden="true" />
              <h3>Active grants</h3>
              <p>
                {lookup.counts.activeEntitlements} active grant{lookup.counts.activeEntitlements === 1 ? "" : "s"} from
                trusted webhook evidence.
              </p>
            </div>
            <div>
              <ShieldCheck aria-hidden="true" />
              <h3>Private fields excluded</h3>
              <p>{lookup.privateFieldsExcluded.join(", ")}.</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Entitlements</p>
            <h2>Product access and fulfillment state</h2>
          </div>
          {encodedIntent ? (
            <Link href={`/commerce/checkout/success?checkout_intent_id=${encodedIntent}`} className="text-link compact-link">
              Checkout success
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : (
            <Link href={`https://github.com/markitics/bumpgrade/issues/${customerProductEntitlementLookupIssue}`} className="text-link compact-link">
              Issue #{customerProductEntitlementLookupIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className="roadmap-grid">
          {lookup.entitlements.length > 0 ? (
            lookup.entitlements.map((entitlement) => (
              <article key={entitlement.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className={`status-badge ${statusClass(entitlement.status)}`}>{entitlement.status}</span>
                  <span className="admin-pill">{entitlement.grantKind.replaceAll("_", " ")}</span>
                </div>
                <h3>{entitlement.productTitle}</h3>
                <p>{entitlement.grantSummary}</p>
                <div className="roadmap-detail">
                  <strong>Template</strong>
                  <span>{entitlement.entitlementTemplateTitle}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Access rule</strong>
                  <span>{entitlement.accessRuleTitle}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Granted</strong>
                  <span>{compactDate(entitlement.grantedAt)}</span>
                </div>
                <div className="admin-step-list" aria-label={`${entitlement.productTitle} fulfillment state`}>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Fulfillment</span>
                        <strong>{entitlement.fulfillment.status ?? "No task"}</strong>
                        <p>{entitlement.fulfillment.summary ?? "No fulfillment task recorded yet."}</p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Source product</span>
                        <strong>{entitlement.sourceProductName ?? entitlement.sourceProductSlug ?? "Unknown"}</strong>
                        <p>{entitlement.sourcePriceLabel ?? entitlement.sourcePriceAmount ?? "No public price context"}</p>
                      </div>
                    </div>
                  </div>
                  {lookup.checkoutIntentId && entitlement.downloadDelivery.available ? (
                    <div className="admin-step-editor">
                      <div className="admin-step-editor-heading">
                        <div>
                          <span>Private delivery</span>
                          <strong>{entitlement.downloadDelivery.assetTitle}</strong>
                          <p>Streams a private R2-backed fixture without exposing object keys or signed URLs.</p>
                        </div>
                      </div>
                      <CustomerDownloadTokenButton checkoutIntentId={lookup.checkoutIntentId} entitlementId={entitlement.id} />
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className={`status-badge ${statusClass(lookup.source)}`}>{lookup.source}</span>
                <span className="admin-pill">Issue #{customerProductEntitlementLookupIssue}</span>
              </div>
              <h3>No customer entitlement rows shown</h3>
              <p>
                {lookup.checkout
                  ? "This checkout is recorded, but no product entitlement rows are available yet. The webhook may still be pending."
                  : "Enter a checkout intent ID from the checkout success page to inspect customer-safe product access."}
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Customer safe</h3>
            <p>Possession of the checkout intent reference can reveal product access state, but not private buyer data.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>API contract</h3>
            <p>
              <code>{customerProductEntitlementLookupApiRoute}</code> returns the same redacted lookup contract.
            </p>
          </div>
          <div>
            <FileArchive aria-hidden="true" />
            <h3>Delivery boundary</h3>
            <p>{lookup.writeBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
