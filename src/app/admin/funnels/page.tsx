import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  CreditCard,
  Database,
  Eye,
  GitBranch,
  PanelsTopLeft,
  PencilLine,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { checkoutOfferStack } from "@/lib/checkout-offers";
import {
  draftFunnelCheckoutLinkConfirmationText,
  draftFunnelArchiveConfirmationText,
  draftFunnelDuplicationConfirmationText,
  draftFunnelPreviewPath,
  draftFunnelPublishConfirmationText,
  draftFunnelTemplateCreationConfirmationText,
  getDraftFunnelAdminState,
} from "@/lib/funnel-drafts";
import { draftFunnelBlockStructureIssue, funnelBlockLibrary, funnelTemplateLibrary } from "@/lib/funnels";

export const metadata: Metadata = {
  title: "Admin draft funnels",
  description: "Owner-gated draft funnel builder for Bumpgrade publishers.",
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
  const templateIdempotencySeed = state.drafts.length;

  return (
    <main className="roadmap-page admin-roadmap-page admin-funnels-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin funnels</p>
          <h1>Draft funnel builder for launch work.</h1>
          <p className="lede">
            Owners can seed, create, edit, and reorder private draft funnels with ordered opt-in, sales, and thank-you
            steps. Exact-confirmed publishing is live for public funnel routes, and owner-confirmed template-to-draft
            creation is live for the reusable template library, including webinar and resource page shapes. Owners can
            duplicate private drafts after a revision check and attach the seeded sandbox checkout offer to private draft
            checkout blocks. Granular block title/body editing and reusable block add/remove controls are live while
            preserving checkout-linked block safety. Owners can also archive private drafts or unpublish public D1 draft
            routes without deleting audit evidence. Destructive deletion, drag-and-drop layout editing, live webinar
            integrations, private resource delivery, checkout unlinking, and direct agent edits still need confirmed-write
            slices.
          </p>
          <div className="hero-actions">
            <Link href="/funnels/source-data" className="primary-action">
              Funnel JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${draftFunnelBlockStructureIssue}`} className="secondary-action">
              Issue #{draftFunnelBlockStructureIssue}
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
            <p>Creates a private three-step template draft. Step editing plus block copy and block structure controls are live.</p>
            <button type="submit" className="primary-action" disabled={!state.canWrite}>
              Create draft
              <ArrowRight aria-hidden="true" />
            </button>
          </form>
        </div>
        <div className="feature-section-heading compact-section-heading">
          <div>
            <p className="eyebrow">Template drafts</p>
            <h2>Create private drafts from reusable templates</h2>
          </div>
        </div>
        <div className="admin-action-grid">
          {funnelTemplateLibrary.map((template, index) => (
            <form action="/api/admin/funnels/drafts" method="post" className="admin-action-panel" key={template.id}>
              <input type="hidden" name="mode" value="create-from-template" />
              <input type="hidden" name="templateId" value={template.id} />
              <input
                type="hidden"
                name="idempotencyKey"
                value={`template-draft-${template.id}-${templateIdempotencySeed}-${index}`}
              />
              <div>
                <p className="eyebrow">Template</p>
                <h3>{template.title}</h3>
                <p>{template.goal}</p>
              </div>
              <label>
                Draft title
                <input
                  name="title"
                  type="text"
                  defaultValue={`${template.title} draft`}
                  minLength={3}
                  maxLength={120}
                  disabled={!state.canWrite}
                />
              </label>
              <label>
                Confirmation
                <input
                  name="confirmationText"
                  type="text"
                  placeholder={draftFunnelTemplateCreationConfirmationText}
                  disabled={!state.canWrite}
                />
              </label>
              <button type="submit" className="primary-action" disabled={!state.canWrite}>
                Create from template
                <GitBranch aria-hidden="true" />
              </button>
            </form>
          ))}
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
          {state.drafts.map((draft) => {
            const isArchived = draft.status === "archived";
            const canMutateDraft = state.canWrite && !isArchived;

            return (
            <article key={draft.id} className="roadmap-card active">
              <div className="roadmap-card-top">
                <span className={`status-badge ${isArchived ? "blocked" : "active"}`}>{draft.status}</span>
                <span className="admin-pill">Issue #{draft.sourceIssueNumber}</span>
              </div>
              <h3>{draft.title}</h3>
              <p>{draft.summary}</p>
              <div className="admin-draft-actions">
                <Link href={draftFunnelPreviewPath(draft.id)} className="secondary-action compact-action">
                  Preview draft
                  <Eye aria-hidden="true" />
                </Link>
                {draft.status === "published" && draft.previewRoute ? (
                  <Link href={draft.previewRoute} className="primary-action compact-action">
                    Public route
                    <ArrowRight aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
              {!isArchived ? (
                <form action="/api/admin/funnels/drafts" method="post" className="admin-step-edit-form admin-duplicate-form">
                  <input type="hidden" name="mode" value="duplicate" />
                  <input type="hidden" name="draftId" value={draft.id} />
                  <input type="hidden" name="expectedRevisionId" value={draft.revisionId} />
                  <input
                    type="hidden"
                    name="idempotencyKey"
                    value={`duplicate-${draft.id}-${draft.revisionId}-${state.drafts.length}`}
                  />
                  <label>
                    Duplicate title
                    <input
                      name="title"
                      type="text"
                      defaultValue={`Copy of ${draft.title}`}
                      maxLength={120}
                      disabled={!canMutateDraft}
                    />
                  </label>
                  <label className="admin-step-goal-field">
                    Duplicate confirmation
                    <input
                      name="confirmationText"
                      type="text"
                      placeholder={draftFunnelDuplicationConfirmationText}
                      disabled={!canMutateDraft}
                    />
                  </label>
                  <p>Creates a new private draft with copied ordered steps and blocks. Checkout links are not copied.</p>
                  <button type="submit" className="secondary-action" disabled={!canMutateDraft}>
                    Duplicate draft
                    <GitBranch aria-hidden="true" />
                  </button>
                </form>
              ) : null}
              {isArchived ? (
                <div className="admin-checkout-link-summary">
                  <Archive aria-hidden="true" />
                  <p>Archived. Public route is cleared; draft steps and audit evidence remain available to the owner.</p>
                </div>
              ) : (
                <form action="/api/admin/funnels/drafts" method="post" className="admin-step-edit-form admin-duplicate-form">
                  <input type="hidden" name="mode" value="archive" />
                  <input type="hidden" name="draftId" value={draft.id} />
                  <input type="hidden" name="expectedRevisionId" value={draft.revisionId} />
                  <input type="hidden" name="idempotencyKey" value={`archive-${draft.id}-${draft.revisionId}`} />
                  <label className="admin-step-goal-field">
                    {draft.status === "published" ? "Archive and unpublish confirmation" : "Archive confirmation"}
                    <input
                      name="confirmationText"
                      type="text"
                      placeholder={draftFunnelArchiveConfirmationText}
                      disabled={!canMutateDraft}
                    />
                  </label>
                  <p>
                    {draft.status === "published"
                      ? "Archives this draft and removes its public route without deleting steps or audit events."
                      : "Archives this private draft without deleting steps or audit events."}
                  </p>
                  <button type="submit" className="secondary-action" disabled={!canMutateDraft}>
                    {draft.status === "published" ? "Archive and unpublish" : "Archive draft"}
                    <Archive aria-hidden="true" />
                  </button>
                </form>
              )}
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
                {draft.steps.map((step, index) => {
                  const checkoutBlock = step.blocks.find((block) => block.kind === "checkout");
                  const checkoutLink = checkoutBlock?.checkoutLink;
                  if (isArchived) {
                    return (
                      <div key={step.id} className="admin-step-editor">
                        <div className="admin-step-editor-heading">
                          <div>
                            <span>Step {step.order}</span>
                            <strong>{step.title}</strong>
                            <p>{step.kind.replaceAll("_", " ")} · {step.blocks.length} blocks</p>
                          </div>
                        </div>
                        <p>{step.goal}</p>
                        {checkoutLink ? (
                          <div className="admin-checkout-link-summary">
                            <CreditCard aria-hidden="true" />
                            <p>Linked to {checkoutLink.offerTitle} ({checkoutLink.mode}, no live billing).</p>
                          </div>
                        ) : null}
                      </div>
                    );
                  }

                  return (
                    <div key={step.id} className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Step {step.order}</span>
                        <strong>{step.title}</strong>
                        <p>{step.kind.replaceAll("_", " ")} · {step.blocks.length} blocks</p>
                      </div>
                      <div className="admin-step-move-row" aria-label={`Move ${step.title}`}>
                        <form action="/api/admin/funnels/drafts" method="post">
                          <input type="hidden" name="mode" value="move-step" />
                          <input type="hidden" name="draftId" value={draft.id} />
                          <input type="hidden" name="stepId" value={step.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button type="submit" className="secondary-action compact-action" disabled={!canMutateDraft || index === 0}>
                            Up
                          </button>
                        </form>
                        <form action="/api/admin/funnels/drafts" method="post">
                          <input type="hidden" name="mode" value="move-step" />
                          <input type="hidden" name="draftId" value={draft.id} />
                          <input type="hidden" name="stepId" value={step.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button
                            type="submit"
                            className="secondary-action compact-action"
                            disabled={!canMutateDraft || index === draft.steps.length - 1}
                          >
                            Down
                          </button>
                        </form>
                      </div>
                    </div>
                    <form action="/api/admin/funnels/drafts" method="post" className="admin-step-edit-form">
                      <input type="hidden" name="mode" value="update-step" />
                      <input type="hidden" name="draftId" value={draft.id} />
                      <input type="hidden" name="stepId" value={step.id} />
                      <label>
                        Title
                        <input name="title" type="text" defaultValue={step.title} maxLength={120} disabled={!canMutateDraft} />
                      </label>
                      <label>
                        Kind
                        <select name="kind" defaultValue={step.kind} disabled={!canMutateDraft}>
                          <option value="opt_in">Opt-in</option>
                          <option value="sales">Sales</option>
                          <option value="checkout">Checkout</option>
                          <option value="upsell">Upsell</option>
                          <option value="webinar">Webinar</option>
                          <option value="resource">Resource</option>
                          <option value="thank_you">Thank-you</option>
                        </select>
                      </label>
                      <label className="admin-step-goal-field">
                        Goal
                        <textarea name="goal" defaultValue={step.goal} maxLength={500} rows={3} disabled={!canMutateDraft} />
                      </label>
                      <button type="submit" className="primary-action" disabled={!canMutateDraft}>
                        Save step
                        <ArrowRight aria-hidden="true" />
                      </button>
                    </form>
                    <form action="/api/admin/funnels/drafts" method="post" className="admin-step-edit-form admin-block-add-form">
                      <input type="hidden" name="mode" value="add-block" />
                      <input type="hidden" name="draftId" value={draft.id} />
                      <input type="hidden" name="stepId" value={step.id} />
                      <input type="hidden" name="expectedRevisionId" value={draft.revisionId} />
                      <input type="hidden" name="idempotencyKey" value={`block-add-${draft.id}-${step.id}-${draft.revisionId}`} />
                      <div className="admin-block-edit-heading admin-block-add-heading">
                        <span className="admin-pill">Reusable block</span>
                        <strong>Add a block to this step</strong>
                      </div>
                      <label>
                        Block type
                        <select name="blockKind" defaultValue="cta" disabled={!canMutateDraft}>
                          {funnelBlockLibrary.map((block) => (
                            <option value={block.kind} key={block.id}>
                              {block.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Block title
                        <input name="title" type="text" placeholder="Use library title" maxLength={120} disabled={!canMutateDraft} />
                      </label>
                      <label className="admin-step-goal-field">
                        Block body
                        <textarea name="body" placeholder="Use library purpose" maxLength={1200} rows={3} disabled={!canMutateDraft} />
                      </label>
                      <button type="submit" className="secondary-action" disabled={!canMutateDraft}>
                        Add block
                        <Plus aria-hidden="true" />
                      </button>
                    </form>
                    <div className="admin-block-edit-list" aria-label={`${step.title} blocks`}>
                      {step.blocks.map((block) => (
                        <div className="admin-block-editor-shell" key={block.id}>
                          <form
                            action="/api/admin/funnels/drafts"
                            method="post"
                            className="admin-step-edit-form admin-block-edit-form"
                          >
                            <input type="hidden" name="mode" value="update-block" />
                            <input type="hidden" name="draftId" value={draft.id} />
                            <input type="hidden" name="stepId" value={step.id} />
                            <input type="hidden" name="blockId" value={block.id} />
                            <input type="hidden" name="expectedRevisionId" value={draft.revisionId} />
                            <input type="hidden" name="idempotencyKey" value={`block-edit-${draft.id}-${block.id}-${draft.revisionId}`} />
                            <div className="admin-block-edit-heading">
                              <span className="admin-pill">{block.kind.replaceAll("_", " ")}</span>
                              <strong>{block.id}</strong>
                              {block.checkoutLink ? <span className="status-badge pending">checkout link preserved</span> : null}
                            </div>
                            <label>
                              Block title
                              <input name="title" type="text" defaultValue={block.title} maxLength={120} disabled={!canMutateDraft} />
                            </label>
                            <label className="admin-step-goal-field">
                              Block body
                              <textarea name="body" defaultValue={block.body} maxLength={1200} rows={3} disabled={!canMutateDraft} />
                            </label>
                            <button type="submit" className="secondary-action" disabled={!canMutateDraft}>
                              Save block
                              <PencilLine aria-hidden="true" />
                            </button>
                          </form>
                          <form action="/api/admin/funnels/drafts" method="post" className="admin-block-remove-form">
                            <input type="hidden" name="mode" value="remove-block" />
                            <input type="hidden" name="draftId" value={draft.id} />
                            <input type="hidden" name="stepId" value={step.id} />
                            <input type="hidden" name="blockId" value={block.id} />
                            <input type="hidden" name="expectedRevisionId" value={draft.revisionId} />
                            <input type="hidden" name="idempotencyKey" value={`block-remove-${draft.id}-${block.id}-${draft.revisionId}`} />
                            <p>
                              {block.checkoutLink
                                ? "Checkout-linked blocks are protected in this slice."
                                : step.blocks.length <= 1
                                  ? "A step must keep at least one block."
                                  : "Remove this unlinked block from the draft step."}
                            </p>
                            <button
                              type="submit"
                              className="secondary-action compact-action danger-action"
                              disabled={!canMutateDraft || Boolean(block.checkoutLink) || step.blocks.length <= 1}
                            >
                              Remove block
                              <Trash2 aria-hidden="true" />
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                    {checkoutBlock ? (
                      <form action="/api/admin/funnels/drafts" method="post" className="admin-step-edit-form admin-checkout-link-form">
                        <input type="hidden" name="mode" value="link-checkout" />
                        <input type="hidden" name="draftId" value={draft.id} />
                        <input type="hidden" name="stepId" value={step.id} />
                        <input type="hidden" name="offerId" value={checkoutOfferStack.primaryOffer.id} />
                        <input type="hidden" name="expectedRevisionId" value={draft.revisionId} />
                        <input type="hidden" name="idempotencyKey" value={`checkout-link-${draft.id}-${step.id}-${draft.revisionId}`} />
                        <div className="admin-checkout-link-summary">
                          <CreditCard aria-hidden="true" />
                          <p>
                            {checkoutLink
                              ? `Linked to ${checkoutLink.offerTitle} (${checkoutLink.mode}, no live billing).`
                              : `Attach ${checkoutOfferStack.primaryOffer.title} to this checkout block.`}
                          </p>
                        </div>
                        <label className="admin-step-goal-field">
                          Checkout link confirmation
                          <textarea
                            name="confirmationText"
                            placeholder={draftFunnelCheckoutLinkConfirmationText}
                            rows={2}
                            disabled={!canMutateDraft}
                          />
                        </label>
                        <button type="submit" className="secondary-action" disabled={!canMutateDraft}>
                          Link checkout offer
                          <CreditCard aria-hidden="true" />
                        </button>
                      </form>
                    ) : null}
                  </div>
                  );
                })}
              </div>
              {draft.status === "published" || isArchived ? null : (
                <form action="/api/admin/funnels/drafts" method="post" className="admin-step-edit-form admin-publish-form">
                  <input type="hidden" name="mode" value="publish" />
                  <input type="hidden" name="draftId" value={draft.id} />
                  <input type="hidden" name="expectedRevisionId" value={draft.revisionId} />
                  <input type="hidden" name="idempotencyKey" value={`publish-${draft.id}-${draft.revisionId}`} />
                  <label className="admin-step-goal-field">
                    Publish confirmation
                    <input
                      name="confirmationText"
                      type="text"
                      placeholder={draftFunnelPublishConfirmationText}
                      disabled={!canMutateDraft}
                    />
                  </label>
                  <button type="submit" className="primary-action" disabled={!canMutateDraft || draft.steps.length < 3}>
                    Publish funnel
                    <ArrowRight aria-hidden="true" />
                  </button>
                </form>
              )}
            </article>
            );
          })}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Owner gated</h3>
            <p>Only allowlisted, verified owner sessions can create, seed, edit, or reorder D1 draft funnel records.</p>
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
