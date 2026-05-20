import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, FileArchive, KeyRound, ListChecks, ShieldCheck, ShoppingCart } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import {
  getAdminProductEntitlementInspectionState,
  getProductEntitlementRevocationIntentSummary,
  productEntitlementInspectionIssue,
  productEntitlementRevocationIntentIssue,
} from "@/lib/product-entitlement-inspection";

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

  const [state, revocationIntents] = await Promise.all([
    getAdminProductEntitlementInspectionState(),
    getProductEntitlementRevocationIntentSummary(),
  ]);

  return (
    <main className="roadmap-page admin-roadmap-page admin-products-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin products</p>
          <h1>Product entitlement inspection without public buyer leaks.</h1>
          <p className="lede">
            Owners can inspect paid sandbox entitlement grants, checkout state, product and price context, and queued
            fulfillment evidence. Revocation intent readiness is visible before destructive access removal exists. Public
            product source-data stays aggregate-only and excludes buyer, Stripe, and private asset fields.
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
            <ShieldCheck aria-hidden="true" />
            <h3>Revocation intents</h3>
            <p>
              {revocationIntents.counts.revocationIntents} dry-run contract
              {revocationIntents.counts.revocationIntents === 1 ? "" : "s"};{" "}
              {revocationIntents.counts.entitlementMutationsEnabled} entitlement mutations enabled.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Revocation readiness</p>
            <h2>Access removal stays blocked until revocation checks are explicit</h2>
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
