import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Database, ExternalLink, GitBranch, Images, Route } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import { getAdminSurfaceData, summarizeUserJourneyProof, type AdminLink } from "@/lib/admin-surface-data";

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

function screenshotSrc(url: string) {
  if (url.startsWith("/")) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "bumpgrade.com" && parsed.pathname.startsWith("/pr-screenshots/")) {
      return parsed.pathname;
    }
  } catch {
    return null;
  }

  return null;
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

function ScreenshotStrip({ links }: { links: AdminLink[] | undefined }) {
  const screenshotLinks = links?.filter((link) => screenshotSrc(link.url)) ?? [];

  if (!screenshotLinks.length) return <span className="journey-proof-empty">No screenshot thumbnail recorded</span>;

  return (
    <div className="journey-screenshot-strip">
      {screenshotLinks.slice(0, 4).map((link) => {
        const src = screenshotSrc(link.url);
        if (!src) return null;

        return (
          <Link key={link.url} href={link.url} className="journey-screenshot-thumb">
            <Image src={src} alt={`${link.label ?? "Journey proof"} screenshot`} width={220} height={132} unoptimized />
            <span>{link.label ?? "Screenshot"}</span>
          </Link>
        );
      })}
      {screenshotLinks.length > 4 ? <span className="journey-screenshot-more">+{screenshotLinks.length - 4}</span> : null}
    </div>
  );
}

export default async function UserJourneysPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/user-journeys" />;

  const data = await getAdminSurfaceData();
  const proofSummary = summarizeUserJourneyProof(data.userJourneys);

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
            {proofSummary.testedJourneys} tested, {proofSummary.partialJourneys} partial. Latest proof{" "}
            {formatDateTime(proofSummary.latestTestedAt)}.
          </span>
        </aside>
      </section>

      <section className="content-band journey-proof-overview-band">
        <div className="journey-proof-stat-grid">
          <div className="journey-proof-stat-card">
            <BadgeCheck aria-hidden="true" />
            <span>Tested journeys</span>
            <strong>{proofSummary.testedJourneys}</strong>
          </div>
          <div className="journey-proof-stat-card">
            <Clock3 aria-hidden="true" />
            <span>Latest proof</span>
            <strong>{formatDateTime(proofSummary.latestTestedAt)}</strong>
          </div>
          <div className="journey-proof-stat-card">
            <Images aria-hidden="true" />
            <span>Screenshots</span>
            <strong>{proofSummary.screenshotLinks}</strong>
          </div>
          <div className="journey-proof-stat-card">
            <GitBranch aria-hidden="true" />
            <span>CI links</span>
            <strong>{proofSummary.ciLinks}</strong>
          </div>
        </div>
      </section>

      <section className="content-band journey-proof-matrix-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Evidence matrix</p>
            <h2>Last test, screenshots, and CI in one scan</h2>
          </div>
        </div>
        <div className="journey-proof-matrix-shell">
          <table className="journey-proof-matrix">
            <thead>
              <tr>
                <th>Journey</th>
                <th>Status</th>
                <th>Last tested</th>
                <th>Screenshots</th>
                <th>CI and validation</th>
              </tr>
            </thead>
            <tbody>
              {data.userJourneys.map((journey) => {
                const proof = journey.proof;
                return (
                  <tr key={journey.id}>
                    <th scope="row">
                      <span>{journey.title}</span>
                      <small>{journey.featureId}</small>
                    </th>
                    <td>
                      <span className={`status-badge ${proof?.status === "passed" ? "live" : "pending"}`}>
                        {proofStatusLabel(proof?.status)}
                      </span>
                    </td>
                    <td>{formatDateTime(proof?.lastTestedAt)}</td>
                    <td>
                      <ScreenshotStrip links={proof?.screenshotLinks} />
                    </td>
                    <td>
                      <div className="journey-proof-matrix-links">
                        {linkList([...(proof?.ciLinks ?? []), ...(proof?.validationLinks ?? [])].slice(0, 5), "No CI or validation link recorded")}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.loadError ? <p className="journey-proof-warning">{data.loadError}</p> : null}
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
                    <ScreenshotStrip links={proof?.screenshotLinks} />
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
