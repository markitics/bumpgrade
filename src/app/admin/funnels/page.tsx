import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, GitBranch, PanelsTopLeft, ShieldCheck } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { getDraftFunnelAdminState } from "@/lib/funnel-drafts";
import { draftFunnelBuilderIssue } from "@/lib/funnels";

export const metadata: Metadata = {
  title: "Admin draft funnels",
  description: "Owner-gated D1 draft funnel builder scaffold for Bumpgrade publishers.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sourceLabel(source: string) {
  if (source === "d1") return "D1 draft store";
  return "Fixture fallback";
}

export default async function AdminFunnelsPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/funnels" />;

  const state = await getDraftFunnelAdminState();
  const seedIdempotencyKey = "funnel-draft-seed-indie-launch-working-copy-v1";

  return (
    <main className="roadmap-page admin-roadmap-page admin-funnels-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin funnels</p>
          <h1>Draft funnel builder backed by D1.</h1>
          <p className="lede">
            Owners can seed or create private draft funnels with ordered opt-in, sales, and thank-you steps. This is
            draft creation only; publishing, checkout linking, deletion, and agent edits still need confirmed-write
            slices.
          </p>
          <div className="hero-actions">
            <Link href="/funnels/source-data" className="primary-action">
              Funnel JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${draftFunnelBuilderIssue}`} className="secondary-action">
              Issue #{draftFunnelBuilderIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Draft funnel status summary">
          <PanelsTopLeft aria-hidden="true" />
          <p>{sourceLabel(state.source)}</p>
          <strong>{state.drafts.length} draft{state.drafts.length === 1 ? "" : "s"}</strong>
          <span>{state.loadError ?? state.storage}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Create</p>
            <h2>Seed or create a three-step draft</h2>
          </div>
          <span className={`status-badge ${state.canWrite ? "active" : "pending"}`}>
            {state.canWrite ? "Writes enabled" : "Read-only fallback"}
          </span>
        </div>
        <div className="admin-action-grid">
          <form action="/api/admin/funnels/drafts" method="post" className="admin-action-panel">
            <input type="hidden" name="mode" value="seed" />
            <input type="hidden" name="idempotencyKey" value={seedIdempotencyKey} />
            <div>
              <p className="eyebrow">Seed</p>
              <h3>Indie launch working draft</h3>
              <p>Creates or refreshes the canonical owner working copy from the shipped read-only funnel contract.</p>
            </div>
            <button type="submit" className="primary-action" disabled={!state.canWrite}>
              Seed draft
              <GitBranch aria-hidden="true" />
            </button>
          </form>

          <form action="/api/admin/funnels/drafts" method="post" className="admin-action-panel">
            <input type="hidden" name="mode" value="create" />
            <label htmlFor="draft-funnel-title">Draft title</label>
            <input
              id="draft-funnel-title"
              name="title"
              type="text"
              defaultValue="New launch funnel"
              minLength={3}
              maxLength={120}
              disabled={!state.canWrite}
            />
            <p>Creates a private three-step template draft. Granular block editing ships later.</p>
            <button type="submit" className="primary-action" disabled={!state.canWrite}>
              Create draft
              <ArrowRight aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Drafts</p>
            <h2>Owner-session draft state</h2>
          </div>
          <Link href="/admin/source-data" className="text-link compact-link">
            Admin source
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {state.drafts.map((draft) => (
            <article key={draft.id} className="roadmap-card active">
              <div className="roadmap-card-top">
                <span className="status-badge active">{draft.status}</span>
                <span className="admin-pill">Issue #{draft.sourceIssueNumber}</span>
              </div>
              <h3>{draft.title}</h3>
              <p>{draft.summary}</p>
              <div className="roadmap-detail">
                <strong>Draft ID</strong>
                <span>{draft.id}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Revision</strong>
                <span>{draft.revisionId}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Created by</strong>
                <span>{draft.createdByEmail}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Updated</strong>
                <span>{draft.updatedAt ?? "Fixture only"}</span>
              </div>
              <div className="admin-step-list" aria-label={`${draft.title} steps`}>
                {draft.steps.map((step) => (
                  <div key={step.id}>
                    <span>Step {step.order}</span>
                    <strong>{step.title}</strong>
                    <p>{step.kind.replaceAll("_", " ")} · {step.blocks.length} blocks</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Owner gated</h3>
            <p>Only allowlisted, verified owner sessions can create or seed D1 draft funnel records.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>D1 records</h3>
            <p>{state.storage}</p>
          </div>
          <div>
            <GitBranch aria-hidden="true" />
            <h3>Boundary</h3>
            <p>{state.writeBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
