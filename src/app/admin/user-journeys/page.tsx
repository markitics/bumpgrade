import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Database, ExternalLink, Route } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { getAdminSurfaceData, type AdminLink } from "@/lib/admin-surface-data";

export const metadata: Metadata = {
  title: "Admin user journeys",
  description: "Bumpgrade launch journeys with last-tested timestamps, screenshots, CI links, and route proof.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function proofStatusLabel(status: string | undefined) {
  if (status === "passed") return "Tested";
  if (status === "blocked") return "Blocked";
  if (status === "not_run") return "Not run";
  return "Partial";
}

function featureStatusClass(status: string) {
  if (status === "live") return "shipped";
  if (status === "launch-preview") return "active";
  return "planned";
}

function linkList(links: AdminLink[] | undefined, emptyLabel: string) {
  if (!links?.length) return <span>{emptyLabel}</span>;
  return (
    <ul className="journey-proof-links">
      {links.map((link) => (
        <li key={`${link.label ?? link.url}-${link.url}`}>
          <Link href={link.url}>
            {link.label ?? link.title ?? link.url}
            <ExternalLink aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function UserJourneysPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/user-journeys" />;

  const data = await getAdminSurfaceData();
  const testedCount = data.userJourneys.filter((journey) => journey.proof?.status === "passed").length;
  const partialCount = data.userJourneys.filter((journey) => journey.proof?.status === "partial").length;

  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin user journeys</p>
          <h1>Launch proof for the paths people will actually try.</h1>
          <p className="lede">
            Each journey ties a user goal to feature evidence, happy path, edge cases, last-tested timestamps, screenshots, CI links, and source-data proof.
          </p>
          <div className="hero-actions">
            <Link href="/admin/user-journeys/source-data" className="primary-action">
              Journey JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href="/features" className="secondary-action">
              Public features
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="User journeys status summary">
          <Route aria-hidden="true" />
          <p>{data.source === "fixture" ? "Fixture proof" : "Journey proof"}</p>
          <strong>{data.userJourneys.length} journeys</strong>
          <span>
            {testedCount} tested, {partialCount} partial. {data.loadError ?? "Every main feature has linked route, issue, screenshot, or validation evidence."}
          </span>
        </aside>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Journey records</p>
            <h2>Goals, paths, proof, and confidence</h2>
          </div>
        </div>
        <div className="admin-surface-list">
          {data.userJourneys.map((journey) => {
            const proof = journey.proof;
            return (
              <article key={journey.id} className="admin-surface-card journey-proof-card">
                <div className="roadmap-card-top">
                  <span className={`status-badge ${featureStatusClass(journey.featureStatus)}`}>
                    {journey.featureStatus.replaceAll("-", " ")}
                  </span>
                  <span className={`status-badge ${proof?.status === "passed" ? "live" : "pending"}`}>
                    {proofStatusLabel(proof?.status)}
                  </span>
                </div>
                <h3>{journey.title}</h3>
                <p>{journey.userGoal}</p>
                <div className="admin-meta-grid journey-proof-meta">
                  <div>
                    <strong>User</strong>
                    <span>{journey.primaryUser}</span>
                  </div>
                  <div>
                    <strong>Feature</strong>
                    <span>{journey.featureId}</span>
                  </div>
                  <div>
                    <strong>Issues</strong>
                    <span className="inline-link-list">
                      {journey.issueNumbers.map((number) => (
                        <Link key={number} href={`https://github.com/markitics/bumpgrade/issues/${number}`}>
                          #{number}
                        </Link>
                      ))}
                    </span>
                  </div>
                  <div>
                    <strong>Last tested</strong>
                    <span>
                      <Clock3 aria-hidden="true" />
                      {formatDateTime(proof?.lastTestedAt)}
                    </span>
                  </div>
                </div>
                <div className="journey-proof-summary">
                  <BadgeCheck aria-hidden="true" />
                  <div>
                    <strong>{proof?.summary ?? "No proof summary recorded."}</strong>
                    <span>{proof?.method ?? "Validation method is not recorded yet."}</span>
                  </div>
                </div>
                <div className="journey-proof-grid">
                  <div>
                    <strong>CI</strong>
                    {linkList(proof?.ciLinks, "No CI link recorded")}
                  </div>
                  <div>
                    <strong>Screenshots</strong>
                    {linkList(proof?.screenshotLinks, "No screenshot link recorded")}
                  </div>
                  <div>
                    <strong>Validation</strong>
                    {linkList(proof?.validationLinks, "No validation link recorded")}
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
            );
          })}
        </div>
      </section>
    </main>
  );
}
