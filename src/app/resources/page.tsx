import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, FileText, FileSearch, GitBranch } from "lucide-react";

import { resourceHubItems } from "@/lib/content-surfaces";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Bumpgrade resources, comparison guides, migration guides, launch playbooks, product notes, blog index, and agent contract maps.",
  alternates: {
    canonical: `${site.url}/resources`,
  },
};

export default function ResourcesPage() {
  const liveResources = resourceHubItems.filter((item) => item.status === "live");
  const plannedResources = resourceHubItems.filter((item) => item.status === "planned");

  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Resources</p>
          <h1>Guides, comparisons, migrations, and launch notes with evidence trails.</h1>
          <p className="lede">
            The resource hub starts with the comparison system, commerce notes, product notes, blog index, and agent
            docs that already have source-data contracts. Migration guides and launch playbooks stay labeled as planned
            until the underlying funnel, checkout, automation, and analytics slices ship.
          </p>
          <div className="hero-actions">
            <Link href="/compare" className="primary-action">
              Compare platforms
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/content/source-data" className="secondary-action">
              Resource JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel" aria-label="Resource surface status">
          <FileText aria-hidden="true" />
          <p>Status</p>
          <strong>{liveResources.length} live</strong>
          <span>
            {plannedResources.length} planned resources. Every resource card links back to source-data routes or roadmap
            issues before making public claims.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Resource hub</p>
            <h2>Public resources agents can reason about</h2>
          </div>
        </div>
        <div className="feature-grid">
          {resourceHubItems.map((item) => (
            <article key={item.id} id={item.id.replace("resource-", "")} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className={`status-badge ${item.status}`}>{item.status}</span>
                <Link href={item.route}>Open</Link>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="feature-detail">
                <strong>Type</strong>
                <span>{item.type}</span>
              </div>
              <div className="feature-detail">
                <strong>Evidence routes</strong>
                <span>{item.evidenceRoutes.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Agent boundary</strong>
                <span>{item.agentBoundary}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Publishing rules</p>
            <h2>Resources inherit the same source-grounding rules as the product.</h2>
          </div>
          <Link href="/agent-docs/bumpgrade-source-evidence" className="text-link compact-link">
            Source evidence
            <FileSearch aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Database aria-hidden="true" />
            <h3>JSON mirror</h3>
            <p>`/content/source-data` exposes resource IDs, routes, issue numbers, evidence routes, and caveats.</p>
          </div>
          <div>
            <FileSearch aria-hidden="true" />
            <h3>Source checks</h3>
            <p>Comparison claims route through `/compare/source-data`; volatile pricing and packaging need fresh source checks.</p>
          </div>
          <div>
            <GitBranch aria-hidden="true" />
            <h3>Roadmap caveats</h3>
            <p>Migration and launch playbooks stay planned until the related roadmap issues have shipped evidence.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
