import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, ShieldAlert } from "lucide-react";

import { getAdminSurfaceData } from "@/lib/admin-surface-data";

export const metadata: Metadata = {
  title: "For Mark",
  description: "Bumpgrade owner attention items stored in D1 admin records.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ForMarkPage() {
  const data = await getAdminSurfaceData();
  const openItems = data.attentionItems.filter((item) => item.state === "open" || item.state === "read");

  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">For Mark</p>
          <h1>Non-blocking attention items live in D1.</h1>
          <p className="lede">
            Agents should keep moving when a decision or blocker does not need to stop the current issue slice.
            This page surfaces public-safe D1 records for Mark until Better Auth gates the private version.
          </p>
          <div className="hero-actions">
            <Link href="/admin/roadmap" className="primary-action">
              Admin roadmap
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/admin/source-data" className="secondary-action">
              Admin JSON
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="For Mark status summary">
          <Mail aria-hidden="true" />
          <p>{data.source === "fixture" ? "Fixture fallback" : "D1 attention queue"}</p>
          <strong>{openItems.length} open</strong>
          <span>{data.loadError ?? "Use npm run for-mark:add to add public-safe attention items without blocking feature work."}</span>
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
          {openItems.length > 0 ? (
            openItems.map((item) => (
              <article key={item.id} className="roadmap-card blocked">
                <div className="roadmap-card-top">
                  <span className="status-badge blocked">{item.category}</span>
                  <span className="admin-pill">{item.urgency}</span>
                </div>
                <ShieldAlert aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                {item.requiredAction ? (
                  <div className="roadmap-detail">
                    <strong>Action</strong>
                    <span>{item.requiredAction}</span>
                  </div>
                ) : null}
                {item.responseInstructions ? (
                  <div className="roadmap-detail">
                    <strong>Response</strong>
                    <span>{item.responseInstructions}</span>
                  </div>
                ) : null}
                <div className="admin-link-list">
                  {item.links.map((link) => (
                    <Link key={`${item.id}-${link.url}`} href={link.url}>
                      {link.label ?? link.url}
                    </Link>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card shipped">
              <div className="roadmap-card-top">
                <span className="status-badge shipped">Clear</span>
              </div>
              <h3>No public-safe attention items are open.</h3>
              <p>Resolved D1 records stay available to future admin tooling without cluttering the active queue.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
