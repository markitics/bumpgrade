import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, GitBranch, ShieldAlert } from "lucide-react";

import { roadmapCounts, roadmapItemsByStatus, roadmapLanes, roadmapUpdatedAt } from "@/lib/roadmap";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Public Bumpgrade roadmap with shipped, active, blocked, next, and planned work tied to feature IDs, GitHub issues, and deployment evidence.",
  alternates: {
    canonical: `${site.url}/roadmap`,
  },
};

const counts = roadmapCounts();
const totalItems = counts.reduce((total, lane) => total + lane.count, 0);

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function RoadmapPage() {
  return (
    <main className="roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">bumpgrade.com/roadmap</p>
          <h1>Public roadmap from feature evidence.</h1>
          <p className="lede">
            This roadmap turns the feature catalog into public execution state. Shipped means merged and
            deployed. Active means the work is underway. Blocked means the next unblock condition is explicit.
            Everything else stays honest as next or planned.
          </p>
          <div className="hero-actions">
            <Link href="/features" className="primary-action">
              Feature catalog
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/roadmap/source-data" className="secondary-action">
              Roadmap JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Roadmap status summary">
          <GitBranch aria-hidden="true" />
          <p>Status snapshot</p>
          <strong>{totalItems} items</strong>
          <span>Updated {roadmapUpdatedAt}. Public entries link to safe GitHub evidence and avoid private admin notes.</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-lane-strip" aria-label="Roadmap lane counts">
          {counts.map((lane) => (
            <div key={lane.status}>
              <span>{lane.label}</span>
              <strong>{lane.count}</strong>
              <p>{lane.description}</p>
            </div>
          ))}
        </div>
      </section>

      {roadmapLanes.map((lane) => {
        const items = roadmapItemsByStatus(lane.status);

        return (
          <section key={lane.status} className="content-band">
            <div className="roadmap-section-heading">
              <div>
                <p className="eyebrow">{statusLabel(lane.status)}</p>
                <h2>{lane.label}</h2>
              </div>
              <p>{lane.description}</p>
            </div>
            <div className="roadmap-grid">
              {items.map((item) => (
                <article key={item.id} className={`roadmap-card ${item.status}`}>
                  <div className="roadmap-card-top">
                    <span className={`status-badge ${item.status}`}>{lane.label}</span>
                    <Link href={`https://github.com/markitics/bumpgrade/issues/${item.issue}`}>Issue #{item.issue}</Link>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {item.featureId ? (
                    <div className="roadmap-detail">
                      <strong>Feature ID</strong>
                      <span>{item.featureId}</span>
                    </div>
                  ) : null}
                  <div className="roadmap-detail">
                    <strong>Next milestone</strong>
                    <span>{item.nextMilestone}</span>
                  </div>
                  <ul>
                    {item.publicEvidence.map((evidence) => (
                      <li key={evidence}>{evidence}</li>
                    ))}
                  </ul>
                  {item.markAttention ? (
                    <div className="roadmap-attention">
                      <ShieldAlert aria-hidden="true" />
                      <span>{item.markAttention}</span>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="content-band dark-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Public contract</p>
            <h2>Roadmap state is useful only when it stays falsifiable.</h2>
          </div>
          <Link href="/roadmap/source-data" className="text-link compact-link">
            Source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-proof-grid">
          <div>
            <GitBranch aria-hidden="true" />
            <h3>Issue backed</h3>
            <p>Every item has a GitHub issue. Admin data should update these records rather than forking the story.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Agent readable</h3>
            <p>/roadmap/source-data exposes the same IDs, status, evidence, and owner-attention caveats for agents.</p>
          </div>
          <div>
            <ShieldAlert aria-hidden="true" />
            <h3>No private leakage</h3>
            <p>Public roadmap notes summarize blockers without exposing secrets, raw provider data, or private inbox content.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
