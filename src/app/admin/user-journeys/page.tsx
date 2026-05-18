import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, Route } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { getAdminSurfaceData } from "@/lib/admin-surface-data";

export const metadata: Metadata = {
  title: "Admin user journeys",
  description: "Bumpgrade user journeys backed by D1 admin records.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserJourneysPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/user-journeys" />;

  const data = await getAdminSurfaceData();

  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin user journeys</p>
          <h1>Journeys connect features to real paths.</h1>
          <p className="lede">
            D1 journey records describe who the feature is for, what they are trying to do, the happy path,
            edge cases, agent access, and validation evidence.
          </p>
          <div className="hero-actions">
            <Link href="/admin/source-data" className="primary-action">
              Admin JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href="/features" className="secondary-action">
              Feature catalog
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="User journeys status summary">
          <Route aria-hidden="true" />
          <p>{data.source === "fixture" ? "Fixture fallback" : "D1 journeys"}</p>
          <strong>{data.userJourneys.length} journeys</strong>
          <span>{data.loadError ?? "Every main feature should gain at least one journey as it becomes more than scaffolding."}</span>
        </aside>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Journey records</p>
            <h2>Goals, paths, and edge cases</h2>
          </div>
        </div>
        <div className="admin-surface-list">
          {data.userJourneys.map((journey) => (
            <article key={journey.id} className="admin-surface-card">
              <div className="roadmap-card-top">
                <span className={`status-badge ${journey.featureStatus === "live" ? "shipped" : "planned"}`}>{journey.featureStatus}</span>
                <span className="admin-pill">{journey.featureId}</span>
              </div>
              <h3>{journey.title}</h3>
              <p>{journey.userGoal}</p>
              <div className="admin-meta-grid">
                <div>
                  <strong>User</strong>
                  <span>{journey.primaryUser}</span>
                </div>
                <div>
                  <strong>Issues</strong>
                  <span>{journey.issueNumbers.map((number) => `#${number}`).join(", ")}</span>
                </div>
              </div>
              <div className="roadmap-detail">
                <strong>Happy path</strong>
                <ol>
                  {journey.happyPath.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="roadmap-detail">
                <strong>Agent access</strong>
                <span>{journey.agentAccess}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
