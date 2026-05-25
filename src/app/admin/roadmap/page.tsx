import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, GitBranch } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { adminRoadmapCounts, getAdminSurfaceData } from "@/lib/admin-surface-data";

export const metadata: Metadata = {
  title: "Admin roadmap",
  description: "Owner-facing Bumpgrade roadmap surface backed by D1 admin records.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sourceLabel(source: string) {
  if (source === "d1") return "D1 source";
  if (source === "mixed") return "D1 plus fixture";
  return "Fixture fallback";
}

function roadmapIssueLink(issueNumber: number) {
  if (issueNumber === 8) {
    return {
      href: "/admin/director",
      label: "Director dashboard",
    };
  }

  return {
    href: `https://github.com/markitics/bumpgrade/issues/${issueNumber}`,
    label: `Issue #${issueNumber}`,
  };
}

export default async function AdminRoadmapPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/roadmap" />;

  const data = await getAdminSurfaceData();
  const counts = adminRoadmapCounts(data.roadmapItems);

  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin roadmap</p>
          <h1>Roadmap command center backed by D1.</h1>
          <p className="lede">
            This page reads the durable admin roadmap records that Bumpgrade agents should update when feature
            state changes. Better Auth now gates this human admin view while source-data routes stay public-safe.
          </p>
          <div className="hero-actions">
            <Link href="/admin/source-data" className="primary-action">
              Admin JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href="/admin/director" className="secondary-action">
              Director dashboard
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Admin roadmap status summary">
          <GitBranch aria-hidden="true" />
          <p>{sourceLabel(data.source)}</p>
          <strong>{data.roadmapItems.length} records</strong>
          <span>{data.loadError ?? "D1 admin records loaded. Scripts can append work-log and owner-attention rows without a git change."}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-lane-strip" aria-label="Admin roadmap lane counts">
          {counts.map((lane) => (
            <div key={lane.status}>
              <span>{lane.status}</span>
              <strong>{lane.count}</strong>
              <p>Roadmap records currently marked {lane.status}.</p>
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
          <Link href="/roadmap" className="text-link compact-link">
            Public roadmap
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {data.roadmapItems.map((item) => (
            <article key={item.id} className={`roadmap-card ${item.status === "live" ? "shipped" : item.status}`}>
              <div className="roadmap-card-top">
                <span className={`status-badge ${item.status === "live" ? "shipped" : item.status}`}>{item.status}</span>
                {item.issueNumber ? (
                  <Link href={roadmapIssueLink(item.issueNumber).href}>{roadmapIssueLink(item.issueNumber).label}</Link>
                ) : null}
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="roadmap-detail">
                <strong>Group</strong>
                <span>{item.groupName}</span>
              </div>
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
