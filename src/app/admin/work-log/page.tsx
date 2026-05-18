import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Database } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { getAdminSurfaceData } from "@/lib/admin-surface-data";

export const metadata: Metadata = {
  title: "Admin work log",
  description: "Durable Bumpgrade work log backed by D1 admin records.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorkLogPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/work-log" />;

  const data = await getAdminSurfaceData();

  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin work log</p>
          <h1>Durable diary of shipped agent work.</h1>
          <p className="lede">
            Work-log entries live in D1 so future agents can recover what shipped, why it changed, where it
            was validated, and what still needs Mark attention without reading chat history.
          </p>
          <div className="hero-actions">
            <Link href="/admin/source-data" className="primary-action">
              Admin JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href="https://github.com/markitics/bumpgrade/issues/8" className="secondary-action">
              Track issue #8
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Work log status summary">
          <Clock3 aria-hidden="true" />
          <p>{data.source === "fixture" ? "Fixture fallback" : "D1 work log"}</p>
          <strong>{data.workLogEntries.length} entries</strong>
          <span>{data.loadError ?? "Use npm run work-log:add to append entries and optionally cross-post a PR comment."}</span>
        </aside>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Recent work</p>
            <h2>What changed and how it was verified</h2>
          </div>
        </div>
        <div className="admin-surface-list">
          {data.workLogEntries.map((entry) => (
            <article key={entry.id} className="admin-surface-card">
              <div className="roadmap-card-top">
                <span className="admin-pill">{entry.agentName}</span>
                <time dateTime={entry.completedAt}>{new Date(entry.completedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</time>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.promptFromMark}</p>
              {entry.flagsAttention ? <div className="roadmap-attention"><span>{entry.flagsAttention}</span></div> : null}
              <div className="admin-meta-grid">
                <div>
                  <strong>Issues</strong>
                  <span>{entry.githubIssues.map((issue) => issue.number ? `#${issue.number}` : issue.url).join(", ") || "None"}</span>
                </div>
                <div>
                  <strong>PRs</strong>
                  <span>{entry.closedPrs.map((pr) => pr.number ? `#${pr.number}` : pr.url).join(", ") || "None"}</span>
                </div>
              </div>
              <ul>
                {entry.validation.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="admin-link-list">
                {entry.relevantUrls.slice(0, 5).map((url) => (
                  <Link key={url} href={url}>
                    {url.replace("https://bumpgrade.com", "") || "bumpgrade.com"}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
