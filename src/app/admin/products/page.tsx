import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Database, FileArchive, KeyRound, Link2, ListChecks, PackagePlus, ShieldCheck, ShoppingCart } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { AdminProductCreationForm } from "@/components/admin-product-creation-form";
import { AdminProductOfferAccessGrantForm } from "@/components/admin-product-offer-access-grant-form";
import { AdminProductRevocationIntentForm } from "@/components/admin-product-revocation-intent-form";
import { getCurrentAdminState } from "@/lib/admin-auth";
import {
  getAdminProductEntitlementInspectionState,
  getProductEntitlementRevocationIntentSummary,
  productEntitlementInspectionIssue,
  productEntitlementRevocationIntentIssue,
} from "@/lib/product-entitlement-inspection";
import { getAdminProductCreationState, productCreationIssue } from "@/lib/product-creation";
import { getAdminProductOfferAccessState, productOfferAccessIssue } from "@/lib/product-offer-access";
import { getProductProtectedContentSummary, productProtectedContentIssue } from "@/lib/product-protected-content";

export const metadata: Metadata = {
  title: "Admin products",
  description: "Owner-gated product entitlement and fulfillment inspection for Bumpgrade publishers.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sourceLabel(source: string) {
  if (source === "d1") return "D1 entitlement store";
  return "D1 unavailable";
}

function compactDate(value: string | null) {
  if (!value) return "None recorded";
  return value.replace("T", " ").replace(".000Z", " UTC");
}

function statusClass(status: string | null) {
  if (status === "active" || status === "queued" || status === "paid") return "active";
  if (status === "revoked" || status === "failed") return "blocked";
  return "pending";
}

export default async function AdminProductsPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/products" />;

  const [state, productCreation, productOfferAccess, revocationIntents, protectedContent] = await Promise.all([
    getAdminProductEntitlementInspectionState(),
    getAdminProductCreationState(),
    getAdminProductOfferAccessState(),
    getProductEntitlementRevocationIntentSummary(),
    getProductProtectedContentSummary(),
  ]);

  return (
    <main className="roadmap-page admin-roadmap-page admin-products-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin products</p>
          <h1>Product entitlement inspection without public buyer leaks.</h1>
          <p className="lede">
            Owners can inspect paid sandbox entitlement grants, checkout state, product and price context, and queued
            fulfillment evidence. Revocation intent records are visible before destructive access removal exists. Public
            protected-content readiness is visible before lesson or member-area delivery exists. Public product source-data
            stays aggregate-only and excludes buyer, Stripe, and private asset fields.
          </p>
          <div className="hero-actions">
            <Link href="/products/source-data" className="primary-action">
              Product JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${productEntitlementInspectionIssue}`} className="secondary-action">
              Issue #{productEntitlementInspectionIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Product entitlement status summary">
          <FileArchive aria-hidden="true" />
          <p>{sourceLabel(state.source)}</p>
          <strong>{state.counts.entitlements} entitlement{state.counts.entitlements === 1 ? "" : "s"}</strong>
          <span>{state.loadError ?? "Owner-gated entitlement rows loaded from sandbox checkout webhook grants."}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-proof-grid">
          <div>
            <KeyRound aria-hidden="true" />
            <h3>Active grants</h3>
            <p>
              {state.counts.activeEntitlements} active entitlement{state.counts.activeEntitlements === 1 ? "" : "s"},
              last granted {compactDate(state.lastGrantedAt)}.
            </p>
          </div>
          <div>
            <ListChecks aria-hidden="true" />
            <h3>Fulfillment tasks</h3>
            <p>
              {state.counts.fulfillmentTasks} task{state.counts.fulfillmentTasks === 1 ? "" : "s"},
              {` ${state.counts.queuedFulfillmentTasks}`} queued for private delivery work.
            </p>
          </div>
          <div>
            <ShoppingCart aria-hidden="true" />
            <h3>Checkout coverage</h3>
            <p>{state.counts.checkoutIntentsWithEntitlements} checkout intent{state.counts.checkoutIntentsWithEntitlements === 1 ? "" : "s"} have entitlement evidence.</p>
          </div>
          <div>
            <PackagePlus aria-hidden="true" />
            <h3>Draft products</h3>
            <p>
              {productCreation.counts.draftProducts} owner-created draft product
              {productCreation.counts.draftProducts === 1 ? "" : "s"}.
            </p>
          </div>
          <div>
            <Link2 aria-hidden="true" />
            <h3>Test grants</h3>
            <p>
              {productOfferAccess.counts.activeTestEntitlements} owner-created product test access grant
              {productOfferAccess.counts.activeTestEntitlements === 1 ? "" : "s"}.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Revocation intents</h3>
            <p>
              {revocationIntents.counts.revocationIntents} dry-run contract
              {revocationIntents.counts.revocationIntents === 1 ? "" : "s"};{" "}
              {revocationIntents.counts.entitlementMutationsEnabled} entitlement mutations enabled.
            </p>
          </div>
          <div>
            <BookOpen aria-hidden="true" />
            <h3>Protected content</h3>
            <p>
              {protectedContent.counts.protectedContentItems} readiness record
              {protectedContent.counts.protectedContentItems === 1 ? "" : "s"};{" "}
              {protectedContent.counts.deliveryEnabled} delivery paths enabled.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Product creation and test access</p>
            <h2>Owners can create products and prove a test grant path</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${productCreationIssue}`} className="text-link compact-link">
            Issue #{productCreationIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          <article className="roadmap-card active">
            <div className="roadmap-card-top">
              <span className="status-badge active">{productCreation.status}</span>
              <span className="admin-pill">{productCreation.source}</span>
            </div>
            <PackagePlus aria-hidden="true" />
            <h3>Draft product creation</h3>
            <p>{productCreation.writeBoundary}</p>
            <div className="roadmap-detail">
              <strong>Created drafts</strong>
              <span>{productCreation.counts.draftProducts}</span>
            </div>
            <div className="roadmap-detail">
              <strong>Latest draft</strong>
              <span>{compactDate(productCreation.latestCreatedAt)}</span>
            </div>
            <AdminProductCreationForm />
          </article>
          <article className="roadmap-card active">
            <div className="roadmap-card-top">
              <span className="status-badge active">{productOfferAccess.status}</span>
              <span className="admin-pill">{productOfferAccess.source}</span>
            </div>
            <Link2 aria-hidden="true" />
            <h3>Test offer/access grant</h3>
            <p>{productOfferAccess.writeBoundary}</p>
            <div className="roadmap-detail">
              <strong>Linked products</strong>
              <span>{productOfferAccess.counts.linkedProducts}</span>
            </div>
            <div className="roadmap-detail">
              <strong>Test checkout intents</strong>
              <span>{productOfferAccess.counts.testCheckoutIntents}</span>
            </div>
            <div className="roadmap-detail">
              <strong>Latest test grant</strong>
              <span>{compactDate(productOfferAccess.latestCreatedAt)}</span>
            </div>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${productOfferAccessIssue}`} className="text-link compact-link">
              Issue #{productOfferAccessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <AdminProductOfferAccessGrantForm products={productCreation.records} />
          </article>
          {productCreation.records.length > 0 ? (
            productCreation.records.map((product) => (
              <article key={product.productId} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className={`status-badge ${statusClass(product.status)}`}>{product.status}</span>
                  <span className="admin-pill">{product.kind.replaceAll("_", " ")}</span>
                </div>
                <PackagePlus aria-hidden="true" />
                <h3>{product.name}</h3>
                <p>{product.description ?? "No description recorded."}</p>
                <div className="roadmap-detail">
                  <strong>Slug</strong>
                  <span>{product.slug}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Fulfillment</strong>
                  <span>{product.fulfillmentKind.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Product ID</strong>
                  <span>{product.productId}</span>
                </div>
                <p>
                  Billing mutation enabled: {String(product.billingMutationEnabled)}. Fulfillment mutation enabled:{" "}
                  {String(product.fulfillmentMutationEnabled)}.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No draft products</span>
                <span className="admin-pill">Issue #{productCreationIssue}</span>
              </div>
              <h3>No owner-created draft products</h3>
              <p>{productCreation.loadError ?? "Create the first draft catalog record from this owner page."}</p>
            </article>
          )}
          {productOfferAccess.records.map((record) => (
            <article key={record.id} className="roadmap-card active">
              <div className="roadmap-card-top">
                <span className={`status-badge ${statusClass(record.entitlementStatus)}`}>{record.entitlementStatus ?? record.status}</span>
                <span className="admin-pill">test purchase</span>
              </div>
              <Link2 aria-hidden="true" />
              <h3>{record.productName}</h3>
              <p>
                Linked to {record.offerId} and {record.funnelId}; queued {record.fulfillmentKind.replaceAll("_", " ")} fulfillment evidence without a live Stripe session.
              </p>
              <div className="roadmap-detail">
                <strong>Checkout</strong>
                <span>{record.checkoutStatus ?? "No checkout state"}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Entitlement</strong>
                <span>{record.entitlementStatus ?? "No entitlement state"}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Fulfillment</strong>
                <span>{record.fulfillmentStatus ?? "No fulfillment task"}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Amount</strong>
                <span>
                  {record.currency.toUpperCase()} {(record.amountCents / 100).toFixed(2)}
                </span>
              </div>
              <p>
                Stripe Checkout Session created: {String(record.stripeCheckoutSessionCreated)}. Live charge created:{" "}
                {String(record.liveChargeCreated)}. Raw buyer email included: {String(record.rawBuyerEmailIncluded)}.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Revocation readiness</p>
            <h2>Access removal intents stay non-destructive</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${productEntitlementRevocationIntentIssue}`} className="text-link compact-link">
            Issue #{productEntitlementRevocationIntentIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {revocationIntents.records.length > 0 ? (
            revocationIntents.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status}</span>
                  <span className="admin-pill">{record.intentKind.replaceAll("_", " ")}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.productTitle}</h3>
                <p>{record.revocationPolicy}</p>
                <div className="roadmap-detail">
                  <strong>Template</strong>
                  <span>{record.entitlementTemplateTitle}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Access rule</strong>
                  <span>{record.accessRuleTitle}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Stale-state check</strong>
                  <span>{record.staleStatePolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Audit correlation</strong>
                  <span>{record.auditCorrelationPolicy}</span>
                </div>
                <p>
                  Destructive access removal, entitlement mutation, billing changes, refunds, and private buyer exposure
                  remain disabled in this slice.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No revocation intent</span>
                <span className="admin-pill">Issue #{productEntitlementRevocationIntentIssue}</span>
              </div>
              <h3>No revocation readiness records</h3>
              <p>{revocationIntents.loadError ?? "Run the revocation-intent migration to seed access-removal safety metadata."}</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Protected content readiness</p>
            <h2>Lesson and member delivery stays blocked until entitlement checks are live</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${productProtectedContentIssue}`} className="text-link compact-link">
            Issue #{productProtectedContentIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {protectedContent.records.length > 0 ? (
            protectedContent.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status}</span>
                  <span className="admin-pill">{record.contentKind.replaceAll("_", " ")}</span>
                </div>
                <BookOpen aria-hidden="true" />
                <h3>{record.title}</h3>
                <p>{record.publicSummary}</p>
                <div className="roadmap-detail">
                  <strong>Product</strong>
                  <span>{record.productTitle}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Asset</strong>
                  <span>{record.assetTitle}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Access policy</strong>
                  <span>{record.accessPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Private boundary</strong>
                  <span>{record.privateContentBoundary}</span>
                </div>
                <p>
                  Protected body delivery, progress writes, private R2 keys, signed URLs, and customer delivery remain
                  disabled in this slice.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No protected content</span>
                <span className="admin-pill">Issue #{productProtectedContentIssue}</span>
              </div>
              <h3>No protected content readiness records</h3>
              <p>{protectedContent.loadError ?? "Run the protected-content migration to seed course and member-area readiness metadata."}</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Recent grants</p>
            <h2>Private owner-only entitlement rows</h2>
          </div>
          <Link href="/products/indie-launch-library" className="text-link compact-link">
            Product preview
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {state.entitlements.length > 0 ? (
            state.entitlements.map((entitlement) => (
              <article key={entitlement.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className={`status-badge ${statusClass(entitlement.status)}`}>{entitlement.status}</span>
                  <span className="admin-pill">{entitlement.grantKind.replaceAll("_", " ")}</span>
                </div>
                <h3>{entitlement.productTitle}</h3>
                <p>{entitlement.grantSummary}</p>
                <div className="roadmap-detail">
                  <strong>Buyer</strong>
                  <span>{entitlement.buyerEmail ?? "No buyer email recorded"}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Checkout</strong>
                  <span>
                    {entitlement.checkoutStatus ?? "Unknown"} · {entitlement.checkoutAmount ?? "No amount"}
                  </span>
                </div>
                <div className="roadmap-detail">
                  <strong>Entitlement ID</strong>
                  <span>{entitlement.id}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Checkout intent</strong>
                  <span>{entitlement.checkoutIntentId ?? "No checkout intent"}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Granted</strong>
                  <span>{compactDate(entitlement.grantedAt)}</span>
                </div>
                <div className="admin-step-list" aria-label={`${entitlement.productTitle} entitlement state`}>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Template</span>
                        <strong>{entitlement.entitlementTemplateTitle}</strong>
                        <p>{entitlement.accessRuleTitle}</p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Fulfillment</span>
                        <strong>{entitlement.fulfillment.status ?? "No task"}</strong>
                        <p>{entitlement.fulfillment.summary ?? "No fulfillment task recorded."}</p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Source product</span>
                        <strong>{entitlement.sourceCommerceProductName ?? entitlement.sourceCommerceProductId ?? "Unknown"}</strong>
                        <p>{entitlement.sourcePriceLabel ?? entitlement.sourcePriceId ?? "No price context"} · {entitlement.sourcePriceAmount ?? "No price amount"}</p>
                      </div>
                    </div>
                  </div>
                  <AdminProductRevocationIntentForm
                    entitlementId={entitlement.id}
                    productTitle={entitlement.productTitle}
                    currentStatus={entitlement.status}
                  />
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No rows</span>
                <span className="admin-pill">Issue #{productEntitlementInspectionIssue}</span>
              </div>
              <h3>No entitlements yet</h3>
              <p>Complete a trusted sandbox checkout webhook smoke, then refresh this owner page.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Owner gated</h3>
            <p>Buyer identity appears only on this verified owner page. Public JSON keeps counts and redaction flags.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Public-safe contract</h3>
            <p>{state.writeBoundary}</p>
          </div>
          <div>
            <FileArchive aria-hidden="true" />
            <h3>Excluded publicly</h3>
            <p>{state.privateFieldsExcluded.join(", ")}.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
