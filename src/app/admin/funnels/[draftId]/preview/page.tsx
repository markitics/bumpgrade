import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Database, Eye, GitBranch, PanelsTopLeft, ShieldCheck } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { getDraftFunnelPreviewState } from "@/lib/funnel-drafts";
import { draftFunnelPreviewIssue } from "@/lib/funnels";

type DraftFunnelPreviewPageProps = {
  params: Promise<{
    draftId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Admin draft funnel preview",
  description: "Owner-gated preview of private D1 draft funnel state.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDraftFunnelPreviewPage({ params }: DraftFunnelPreviewPageProps) {
  const { draftId } = await params;
  const adminState = await getCurrentAdminState();
  const surface = `/admin/funnels/${encodeURIComponent(draftId)}/preview`;

  if (!adminState.identity) return <AdminLocked state={adminState} surface={surface} />;

  const state = await getDraftFunnelPreviewState(draftId);
  if (!state.draft) notFound();

  const draft = state.draft;
  const orderedSteps = [...draft.steps].sort((left, right) => left.order - right.order);

  return (
    <main className="route-page admin-draft-preview-page">
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Owner draft preview</p>
          <h1>{draft.title}</h1>
          <p className="lede">{draft.summary}</p>
          <div className="hero-actions">
            <Link href="/admin/funnels" className="primary-action">
              Back to builder
              <PanelsTopLeft aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${draftFunnelPreviewIssue}`} className="secondary-action">
              Issue #{draftFunnelPreviewIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Owner draft preview status">
          <Eye aria-hidden="true" />
          <p>Private preview</p>
          <strong>{orderedSteps.length} steps</strong>
          <span>
            Owner-gated D1 draft preview. Revision <code>{draft.revisionId}</code> is not a public published page.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Ordered draft</p>
            <h2>Current private funnel sequence</h2>
          </div>
          <Link href="/funnels/source-data" className="text-link compact-link">
            Funnel source
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {orderedSteps.map((step) => (
            <article key={step.id} id={step.routeAnchor} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge active">Step {step.order}</span>
                <span className="admin-pill">{step.kind.replaceAll("_", " ")}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.goal}</p>
              <div className="roadmap-detail">
                <strong>Step ID</strong>
                <span>{step.id}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Blocks</strong>
                <span>{step.blocks.map((block) => block.kind).join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Draft blocks</p>
            <h2>Blocks from the private draft state</h2>
          </div>
        </div>
        <div className="feature-grid">
          {orderedSteps.flatMap((step) =>
            step.blocks.map((block) => (
              <article key={block.id} className="feature-card compact-content-card">
                <div className="feature-card-top">
                  <span className={`status-badge ${block.agentEditable ? "planned" : "pending"}`}>
                    {block.agentEditable ? "Draftable" : "Locked"}
                  </span>
                  <span className="admin-pill">Step {step.order}</span>
                </div>
                <h3>{block.title}</h3>
                <p>{block.body}</p>
                <div className="feature-detail">
                  <strong>Block ID</strong>
                  <span>{block.id}</span>
                </div>
                {block.resourceDeliveryLink ? (
                  <div className="feature-detail">
                    <strong>Resource delivery</strong>
                    <span>
                      {block.resourceDeliveryLink.productTitle} / {block.resourceDeliveryLink.assetTitle}. The preview
                      keeps private R2 keys, signed URLs, and buyer records hidden.
                    </span>
                  </div>
                ) : null}
              </article>
            )),
          )}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Owner session required</h3>
            <p>This preview renders private draft copy only for allowlisted, verified owner sessions.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>{state.source === "d1" ? "D1 preview" : "Fixture fallback"}</h3>
            <p>{state.loadError ?? state.storage}</p>
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
