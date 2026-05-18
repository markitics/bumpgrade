import type { Metadata } from "next";
import Link from "next/link";
import { Database, FileSearch, GitBranch, ShieldCheck } from "lucide-react";

import { agentSourceEvidenceRoutes } from "@/lib/agent-manifest";
import { comparisonSeoTargets, competitorSources } from "@/lib/comparison-data";
import { featureCatalog } from "@/lib/feature-catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bumpgrade source evidence",
  description:
    "How Bumpgrade agents resolve public claims to feature IDs, roadmap items, competitor source URLs, retrieved dates, issues, PRs, and work-log evidence.",
  alternates: {
    canonical: `${site.url}/agent-docs/bumpgrade-source-evidence`,
  },
};

export default function SourceEvidencePage() {
  const liveFeatureCount = featureCatalog.filter((feature) => feature.status === "live").length;

  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Agent docs</p>
          <h1>Public claims must resolve to source data or issue evidence.</h1>
          <p className="lede">
            Agents can answer Bumpgrade questions from stable IDs, official competitor source URLs, retrieval dates,
            GitHub issue evidence, PR evidence, and work-log records. Planned features stay labeled as planned.
          </p>
          <Link href="/compare/source-data" className="text-link">
            Comparison source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <FileSearch aria-hidden="true" />
          <p>Status</p>
          <strong>{competitorSources.length} competitor sources</strong>
          <span>{liveFeatureCount} Bumpgrade feature records are currently marked live in the public feature catalog.</span>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Routes</p>
            <h2>Where an agent should look first</h2>
          </div>
          <Link href="/agent-docs/source-data" className="text-link compact-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {agentSourceEvidenceRoutes.map((route) => (
            <article key={route.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">Readable</span>
                <Link href={route.route}>Open</Link>
              </div>
              <h3>{route.route}</h3>
              <p>{route.resolves}</p>
              <div className="feature-detail">
                <strong>Stable IDs</strong>
                <span>{route.stableIds.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Volatile claims</strong>
                <span>{route.volatileClaims}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Competitors</p>
            <h2>Comparison evidence is source-linked and dated.</h2>
          </div>
          <Link href="/compare" className="text-link compact-link">
            Compare hub
            <GitBranch aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {competitorSources.slice(0, 6).map((source) => (
            <article key={source.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">{source.confidence}</span>
                <Link href={source.url}>Source</Link>
              </div>
              <h3>{source.label}</h3>
              <p>{source.notes[0]}</p>
              <div className="feature-detail">
                <strong>Retrieved</strong>
                <span>{source.retrievedAt}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">SEO evidence</p>
            <h2>Search targets carry explicit caveats.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {comparisonSeoTargets.map((target) => (
            <article key={target.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">SEO</span>
                <Link href={target.route}>Route</Link>
              </div>
              <h3>{target.primaryKeyword}</h3>
              <p>{target.intent}</p>
              <div className="feature-detail">
                <strong>Source IDs</strong>
                <span>{target.evidenceSourceIds.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Caveat</strong>
                <span>{target.caveat}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Rule</p>
            <h2>No source, no claim.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <FileSearch aria-hidden="true" />
            <h3>Resolve first</h3>
            <p>Use stable IDs, source URLs, issue links, PRs, work-log entries, and retrieved dates before answering.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Caveat planned work</h3>
            <p>Pending roadmap items are useful direction, not proof of live product behavior.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Refresh volatile facts</h3>
            <p>Pricing, packaging, integrations, and competitor capability claims need current source checks.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
