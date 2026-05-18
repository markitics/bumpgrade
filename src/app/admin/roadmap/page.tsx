import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, GitBranch } from "lucide-react";

import { roadmapCounts, roadmapItems, roadmapUpdatedAt } from "@/lib/roadmap";

export const metadata: Metadata = {
  title: "Admin roadmap",
  description: "Owner-facing Bumpgrade roadmap surface backed by the current public-safe roadmap records.",
};

const counts = roadmapCounts();

export default function AdminRoadmapPage() {
  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin roadmap</p>
          <h1>Roadmap command center for Mark and future agents.</h1>
          <p className="lede">
            Until the D1-backed admin surface ships in issue #8, this page mirrors the public-safe roadmap records
            used by /roadmap and /roadmap/source-data. It keeps active work, blockers, issue links, and next
            milestones visible without exposing private notes.
          </p>
          <div className="hero-actions">
            <Link href="/roadmap" className="primary-action">
              Public roadmap
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/roadmap/source-data" className="secondary-action">
              Roadmap JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Admin roadmap status summary">
          <GitBranch aria-hidden="true" />
          <p>Admin source</p>
          <strong>Static bridge</strong>
          <span>Updated {roadmapUpdatedAt}. D1-backed editing, owner fields, PR evidence, and work-log links are tracked by issue #8.</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-lane-strip" aria-label="Admin roadmap lane counts">
          {counts.map((lane) => (
            <div key={lane.status}>
              <span>{lane.label}</span>
              <strong>{lane.count}</strong>
              <p>{lane.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Current records</p>
            <h2>Issue-backed roadmap state</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/8" className="text-link compact-link">
            Track D1 admin work
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {roadmapItems.map((item) => (
            <article key={item.id} className={`roadmap-card ${item.status}`}>
              <div className="roadmap-card-top">
                <span className={`status-badge ${item.status}`}>{item.status}</span>
                <Link href={`https://github.com/markitics/bumpgrade/issues/${item.issue}`}>Issue #{item.issue}</Link>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="roadmap-detail">
                <strong>Group</strong>
                <span>{item.group}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Next milestone</strong>
                <span>{item.nextMilestone}</span>
              </div>
              {item.markAttention ? (
                <div className="roadmap-attention">
                  <span>{item.markAttention}</span>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
