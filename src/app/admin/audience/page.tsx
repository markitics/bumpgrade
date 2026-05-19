import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, MailCheck, MailX, ShieldCheck, Tags, UsersRound, Workflow } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { getAdminAudienceInspectionState } from "@/lib/audience-subscribers";

export const metadata: Metadata = {
  title: "Admin audience",
  description: "Owner-gated subscriber and audience inspection for Bumpgrade publishers.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sourceLabel(source: string) {
  if (source === "d1") return "D1 audience store";
  return "D1 unavailable";
}

function compactDate(value: string | null) {
  if (!value) return "None recorded";
  return value.replace("T", " ").replace(".000Z", " UTC");
}

export default async function AdminAudiencePage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/audience" />;

  const state = await getAdminAudienceInspectionState();

  return (
    <main className="roadmap-page admin-roadmap-page admin-audience-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin audience</p>
          <h1>Subscriber inspection without public contact leaks.</h1>
          <p className="lede">
            Owners can inspect the consent-backed waitlist subscribers, active tags, draft sequence enrollments, and
            unsubscribe suppression totals created by the public audience APIs. Public source-data stays aggregate-only.
          </p>
          <div className="hero-actions">
            <Link href="/audience/source-data" className="primary-action">
              Audience JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href="https://github.com/markitics/bumpgrade/issues/137" className="secondary-action">
              Issue #137
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Audience subscriber status summary">
          <UsersRound aria-hidden="true" />
          <p>{sourceLabel(state.source)}</p>
          <strong>{state.counts.subscribers} subscribers</strong>
          <span>{state.loadError ?? "Owner-gated subscriber rows loaded from the audience opt-in tables."}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-proof-grid">
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Consent events</h3>
            <p>{state.counts.consentEvents} records, last consent {compactDate(state.lastConsentAt)}.</p>
          </div>
          <div>
            <Tags aria-hidden="true" />
            <h3>Tag assignments</h3>
            <p>{state.counts.tagAssignments} active or historical tag rows across the seeded waitlist model.</p>
          </div>
          <div>
            <Workflow aria-hidden="true" />
            <h3>Draft enrollments</h3>
            <p>{state.counts.sequenceEnrollments} sequence enrollment rows. Email delivery remains disabled.</p>
          </div>
          <div>
            <MailX aria-hidden="true" />
            <h3>Suppressions</h3>
            <p>
              {state.counts.activeSuppressionEntries} active suppression entries, last recorded{" "}
              {compactDate(state.lastSuppressionAt)}.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Recent subscribers</p>
            <h2>Private owner-only contact rows</h2>
          </div>
          <Link href="/audience/indie-launch-waitlist" className="text-link compact-link">
            Public opt-in
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {state.subscribers.length > 0 ? (
            state.subscribers.map((subscriber) => (
              <article key={subscriber.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{subscriber.status}</span>
                  <span className="admin-pill">{subscriber.consentCount} consent event{subscriber.consentCount === 1 ? "" : "s"}</span>
                </div>
                <h3>{subscriber.email}</h3>
                <p>{subscriber.firstName ? `First name: ${subscriber.firstName}` : "No first name captured."}</p>
                <div className="roadmap-detail">
                  <strong>Subscriber ID</strong>
                  <span>{subscriber.id}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Source form</strong>
                  <span>{subscriber.sourceFormId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Last consent</strong>
                  <span>{compactDate(subscriber.lastConsentedAt)}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Updated</strong>
                  <span>{compactDate(subscriber.updatedAt)}</span>
                </div>
                <div className="admin-step-list" aria-label={`${subscriber.email} audience state`}>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Tags</span>
                        <strong>{subscriber.tags.length || "None"}</strong>
                        <p>{subscriber.tags.map((tag) => tag.label).join(", ") || "No active tags recorded."}</p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Sequences</span>
                        <strong>{subscriber.sequences.length || "None"}</strong>
                        <p>
                          {subscriber.sequences
                            .map((sequence) => `${sequence.title} (${sequence.status})`)
                            .join(", ") || "No draft sequence enrollment recorded."}
                        </p>
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
                <span className="admin-pill">Issue #137</span>
              </div>
              <h3>No subscribers yet</h3>
              <p>Submit the public waitlist opt-in with consent, then refresh this owner page.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Owner gated</h3>
            <p>Contact identity appears only on this verified owner page. Public JSON keeps counts and redaction flags.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Public-safe contract</h3>
            <p>{state.writeBoundary}</p>
          </div>
          <div>
            <UsersRound aria-hidden="true" />
            <h3>Excluded publicly</h3>
            <p>{state.privateFieldsExcluded.join(", ")}.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
