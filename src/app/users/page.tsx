import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, Route, Users } from "lucide-react";

import { audienceSegments, contentSurfacesUpdatedAt } from "@/lib/content-surfaces";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Users and Use Cases",
  description:
    "Bumpgrade use cases for creators, coaches, newsletter writers, course sellers, agencies, small publishers, and indie hackers.",
  alternates: {
    canonical: `${site.url}/users`,
  },
};

function lastIssueNumber(issueNumbers: number[]) {
  return issueNumbers[issueNumbers.length - 1] ?? 20;
}

export default function UsersPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Users and use cases</p>
          <h1>Use cases for indiepreneurs who sell from an owned audience.</h1>
          <p className="lede">
            Bumpgrade is being shaped for creators, coaches, newsletter writers, course sellers, agencies, small
            publishers, and indie hackers. Each use case names the job, the linked roadmap features, and the agent
            boundary instead of pretending every workflow is already shipped.
          </p>
          <div className="hero-actions">
            <Link href="/features" className="primary-action">
              Feature catalog
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/content/source-data" className="secondary-action">
              Content JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel" aria-label="User surface status">
          <Users aria-hidden="true" />
          <p>Status</p>
          <strong>{audienceSegments.length} use cases</strong>
          <span>
            Last updated {contentSurfacesUpdatedAt}. Use-case cards link to tracked feature IDs and issues before
            making product capability claims.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Segments</p>
            <h2>Who Bumpgrade helps</h2>
          </div>
        </div>
        <div className="feature-grid">
          {audienceSegments.map((segment) => (
            <article key={segment.id} id={segment.id.replace("audience-", "")} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className={`status-badge ${segment.status}`}>{segment.status}</span>
                <Link href={`https://github.com/markitics/bumpgrade/issues/${lastIssueNumber(segment.issueNumbers)}`}>
                  Issue #{lastIssueNumber(segment.issueNumbers)}
                </Link>
              </div>
              <h3>{segment.title}</h3>
              <p>{segment.summary}</p>
              <ul>
                {segment.primaryJobs.map((job) => (
                  <li key={job}>{job}</li>
                ))}
              </ul>
              <div className="feature-detail">
                <strong>Feature IDs</strong>
                <span>{segment.linkedFeatureIds.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Agent boundary</strong>
                <span>{segment.agentBoundary}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Agent-ready</p>
            <h2>Use-case copy is a contract, not just navigation.</h2>
          </div>
          <Link href="/admin/user-journeys" className="text-link compact-link">
            User journeys
            <Route aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Database aria-hidden="true" />
            <h3>Stable segment IDs</h3>
            <p>Each audience record is mirrored at `/content/source-data` with feature IDs, issue numbers, and caveats.</p>
          </div>
          <div>
            <Route aria-hidden="true" />
            <h3>Journey alignment</h3>
            <p>User journeys keep end-to-end paths and validation evidence connected to the feature promises.</p>
          </div>
          <div>
            <Users aria-hidden="true" />
            <h3>Capability honesty</h3>
            <p>Planned workflows stay tied to roadmap issues until deployed evidence moves the feature status.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
