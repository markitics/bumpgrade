import { ArrowRight, CheckCircle2, Clock3, FileArchive, LockKeyhole, PackageCheck, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  customerProductEntitlementApiRoute,
  customerProductEntitlementLookupIssue,
  customerProductEntitlementRoute,
  getCustomerProductEntitlementLookup,
} from "@/lib/customer-product-entitlements";
import { site } from "@/lib/site";

type ProductEntitlementsPageProps = {
  params: Promise<{
    intentId: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Product access lookup | Bumpgrade",
  description: "Customer-safe product entitlement and fulfillment lookup for Bumpgrade sandbox checkout evidence.",
};

function compactDate(value: string | null) {
  if (!value) return "None recorded";
  return value.replace("T", " ").replace(".000Z", " UTC");
}

function statusClass(status: string | null) {
  if (status === "ready" || status === "active" || status === "queued" || status === "paid") return "active";
  if (status === "not_found" || status === "invalid" || status === "unavailable" || status === "revoked") return "blocked";
  return "pending";
}

function statusTitle(status: string) {
  if (status === "ready") return "Access evidence ready";
  if (status === "waiting_for_entitlements") return "Waiting for entitlement rows";
  if (status === "waiting_for_checkout") return "Waiting for paid checkout";
  if (status === "not_found") return "Checkout not found";
  if (status === "invalid") return "Lookup evidence needed";
  return "Lookup unavailable";
}

function statusBody(status: string) {
  if (status === "ready") return "Product entitlements and queued fulfillment evidence are available for this checkout.";
  if (status === "waiting_for_entitlements") return "The checkout is paid, but the entitlement grant worker has not recorded product rows yet.";
  if (status === "waiting_for_checkout") return "The checkout exists, but trusted paid webhook evidence has not arrived yet.";
  if (status === "not_found") return "No checkout intent exists for this lookup evidence.";
  if (status === "invalid") return "Use a Bumpgrade checkout intent ID from a sandbox checkout success page.";
  return "The entitlement lookup could not read the product access store.";
}

export default async function ProductEntitlementsPage({ params }: ProductEntitlementsPageProps) {
  const { intentId } = await params;
  const lookup = await getCustomerProductEntitlementLookup(intentId);
  const pageUrl = `${site.url}${customerProductEntitlementRoute(intentId)}`;
  const apiUrl = `${customerProductEntitlementApiRoute}?checkoutIntentId=${encodeURIComponent(intentId)}`;

  return (
    <main className="route-page product-entitlements-page">
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Product access lookup</p>
          <h1>Product entitlement status for this checkout.</h1>
          <p className="lede">
            This customer-safe receipt view shows product access and queued fulfillment evidence for a Bumpgrade
            checkout intent. Buyer identity, Stripe references, private asset keys, metadata, and signed URLs stay out of
            the response.
          </p>
          <div className="hero-actions">
            <Link href="/products/source-data" className="primary-action">
              Product JSON
              <FileArchive aria-hidden="true" />
            </Link>
            <Link href={apiUrl} className="secondary-action">
              Lookup JSON
              <ReceiptText aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${customerProductEntitlementLookupIssue}`} className="secondary-action">
              Issue #{customerProductEntitlementLookupIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className={`feature-status-panel ${statusClass(lookup.lookupStatus)}`} aria-label="Product entitlement lookup status">
          {lookup.lookupStatus === "ready" ? <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
          <p>Status</p>
          <strong>{statusTitle(lookup.lookupStatus)}</strong>
          <span>{statusBody(lookup.lookupStatus)}</span>
          {lookup.checkout ? <code>{lookup.checkout.checkoutIntentId}</code> : null}
        </aside>
      </section>

      {lookup.checkout ? (
        <section className="content-band alternate">
          <div className="feature-proof-grid">
            <div>
              <ReceiptText aria-hidden="true" />
              <h3>Checkout status</h3>
              <p>
                {lookup.checkout.status}
                {lookup.checkout.amount ? ` · ${lookup.checkout.amount}` : ""}, updated {compactDate(lookup.checkout.updatedAt)}.
              </p>
            </div>
            <div>
              <PackageCheck aria-hidden="true" />
              <h3>Entitlements</h3>
              <p>
                {lookup.checkout.entitlementCount} product entitlement{lookup.checkout.entitlementCount === 1 ? "" : "s"} found for this checkout.
              </p>
            </div>
            <div>
              <LockKeyhole aria-hidden="true" />
              <h3>Redaction</h3>
              <p>Buyer identity, Stripe IDs, private keys, metadata, and signed URLs are excluded.</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Customer access</p>
            <h2>Products unlocked by checkout evidence</h2>
          </div>
          <Link href="/products/indie-launch-library" className="text-link compact-link">
            Product preview
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {lookup.entitlements.length > 0 ? (
            lookup.entitlements.map((entitlement) => (
              <article key={entitlement.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className={`status-badge ${statusClass(entitlement.status)}`}>{entitlement.status}</span>
                  <span className="admin-pill">{entitlement.grantKind.replaceAll("_", " ")}</span>
                </div>
                <h3>{entitlement.productTitle}</h3>
                <p>{entitlement.entitlementTemplateTitle}</p>
                <div className="roadmap-detail">
                  <strong>Access rule</strong>
                  <span>{entitlement.accessRuleTitle}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Fulfillment</strong>
                  <span>{entitlement.fulfillment.status ?? "No task"} · {entitlement.fulfillment.summary ?? "No fulfillment summary"}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Granted</strong>
                  <span>{compactDate(entitlement.grantedAt)}</span>
                </div>
                <div className="admin-step-list" aria-label={`${entitlement.productTitle} next steps`}>
                  {entitlement.nextSteps.map((step) => (
                    <div key={step} className="admin-step-editor">
                      <div className="admin-step-editor-heading">
                        <div>
                          <span>Next step</span>
                          <strong>{step}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className={`status-badge ${statusClass(lookup.lookupStatus)}`}>{lookup.lookupStatus.replaceAll("_", " ")}</span>
                <span className="admin-pill">Issue #{customerProductEntitlementLookupIssue}</span>
              </div>
              <h3>No product entitlements yet</h3>
              <p>{lookup.loadError ?? statusBody(lookup.lookupStatus)}</p>
              <Link href="/commerce/source-data" className="text-link compact-link">
                Commerce source data
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          )}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-proof-grid">
          <div>
            <LockKeyhole aria-hidden="true" />
            <h3>Private fields excluded</h3>
            <p>{lookup.privateFieldsExcluded.join(", ")}.</p>
          </div>
          <div>
            <ReceiptText aria-hidden="true" />
            <h3>Safe fields</h3>
            <p>{lookup.safeFields.join(", ")}.</p>
          </div>
          <div>
            <FileArchive aria-hidden="true" />
            <h3>Boundary</h3>
            <p>{lookup.writeBoundary}</p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Bumpgrade product entitlement lookup",
            url: pageUrl,
            about: ["product access", "customer entitlement status", "sandbox checkout", "fulfillment evidence"],
          }).replaceAll("<", "\\u003c"),
        }}
      />
    </main>
  );
}
