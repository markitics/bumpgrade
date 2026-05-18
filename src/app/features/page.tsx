import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, GitBranch, Sparkles } from "lucide-react";

import { featureCatalog, featureCatalogUpdatedAt, featureGroups, featuresByGroup } from "@/lib/feature-catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Bumpgrade feature catalog with live and pending badges across funnels, checkout, products, automations, analytics, admin, and agent-ready workflows.",
  alternates: {
    canonical: `${site.url}/features`,
  },
};

const liveCount = featureCatalog.filter((feature) => feature.status === "live").length;
const pendingCount = featureCatalog.filter((feature) => feature.status === "pending").length;

export default function FeaturesPage() {
  return (
    <main className="features-page">
      <section className="feature-hero">
        <div>
          <p className="eyebrow">bumpgrade.com/features</p>
          <h1>Aspirational feature catalog, with live and pending evidence.</h1>
          <p className="lede">
            Bumpgrade is being built toward a ClickFunnels, SamCart, Kit, Shopify, Kajabi, and
            ThriveCart-shaped operating system for indiepreneurs. This page keeps the promise honest:
            live means deployed, pending means tracked by a roadmap issue.
          </p>
          <div className="hero-actions">
            <Link href="/roadmap" className="primary-action">
              Public roadmap
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/features/source-data" className="secondary-action">
              Feature JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Feature catalog status">
          <Sparkles aria-hidden="true" />
          <p>Status snapshot</p>
          <strong>{liveCount} live</strong>
          <span>
            {pendingCount} pending feature records. Last updated {featureCatalogUpdatedAt}. Pending items link to
            GitHub issues instead of making shipped claims.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Current proof</p>
            <h2>What is actually live today</h2>
          </div>
        </div>
        <div className="live-feature-grid">
          {featureCatalog
            .filter((feature) => feature.status === "live")
            .map((feature) => (
              <article key={feature.id} className="feature-card live-feature-card">
                <div className="feature-card-top">
                  <span className="status-badge live">Live</span>
                  <Link href={`https://github.com/markitics/bumpgrade/issues/${feature.issue}`}>Issue #{feature.issue}</Link>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.summary}</p>
                <ul>
                  {feature.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      </section>

      {featureGroups.map((group) => {
        const groupFeatures = featuresByGroup(group).filter((feature) => feature.status === "pending");

        if (groupFeatures.length === 0) {
          return null;
        }

        return (
          <section key={group} className="content-band">
            <div className="feature-section-heading">
              <div>
                <p className="eyebrow">Pending</p>
                <h2>{group}</h2>
              </div>
            </div>
            <div className="feature-grid">
              {groupFeatures.map((feature) => (
                <article key={feature.id} className="feature-card">
                  <div className="feature-card-top">
                    <span className="status-badge pending">Pending</span>
                    <Link href={`https://github.com/markitics/bumpgrade/issues/${feature.issue}`}>Issue #{feature.issue}</Link>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.summary}</p>
                  <div className="feature-detail">
                    <strong>Audience</strong>
                    <span>{feature.audience}</span>
                  </div>
                  <div className="feature-detail">
                    <strong>Agent contract</strong>
                    <span>{feature.agentContract}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Agent-readable</p>
            <h2>Every feature gets a stable ID and evidence trail.</h2>
          </div>
          <Link href="/features/source-data" className="text-link compact-link">
            Source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <GitBranch aria-hidden="true" />
            <h3>Issue-linked roadmap</h3>
            <p>Each pending feature points to the GitHub issue that owns implementation instead of making vague promises.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>JSON mirror</h3>
            <p>The same feature records are exposed at `/features/source-data` for agents, manifests, and future MCP resources.</p>
          </div>
          <div>
            <Sparkles aria-hidden="true" />
            <h3>Live means deployed</h3>
            <p>Only deployed, validated slices use the live badge. Everything else stays pending until evidence changes.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
