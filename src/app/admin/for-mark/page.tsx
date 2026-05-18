import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, ShieldAlert } from "lucide-react";

import { roadmapItems } from "@/lib/roadmap";

export const metadata: Metadata = {
  title: "For Mark",
  description: "Bumpgrade owner attention items that should not block ongoing agent work.",
};

const attentionItems = roadmapItems.filter((item) => item.markAttention);

export default function ForMarkPage() {
  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">For Mark</p>
          <h1>Non-blocking attention items live here.</h1>
          <p className="lede">
            Agents should keep moving when a decision or blocker does not need to stop the current issue slice.
            This bridge page records the current public-safe item until the D1-backed For Mark surface ships.
          </p>
          <div className="hero-actions">
            <Link href="/admin/roadmap" className="primary-action">
              Admin roadmap
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="https://github.com/markitics/bumpgrade/issues/8" className="secondary-action">
              Track D1 surface
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="For Mark status summary">
          <Mail aria-hidden="true" />
          <p>Attention queue</p>
          <strong>{attentionItems.length} open</strong>
          <span>Email escalation through codex@bumpgrade.com is tracked by issue #10 and should be enabled before relying on inbox replies.</span>
        </aside>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Current attention</p>
            <h2>Exact blockers and decisions</h2>
          </div>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {attentionItems.length > 0 ? (
            attentionItems.map((item) => (
              <article key={item.id} className="roadmap-card blocked">
                <div className="roadmap-card-top">
                  <span className="status-badge blocked">Needs Mark</span>
                  <Link href={`https://github.com/markitics/bumpgrade/issues/${item.issue}`}>Issue #{item.issue}</Link>
                </div>
                <ShieldAlert aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.markAttention}</p>
                <div className="roadmap-detail">
                  <strong>Non-blocking next step</strong>
                  <span>{item.nextMilestone}</span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card shipped">
              <div className="roadmap-card-top">
                <span className="status-badge shipped">Clear</span>
              </div>
              <h3>No public-safe attention items are open.</h3>
              <p>The D1-backed issue #8 surface will add read, ok, and resolved state for future items.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
