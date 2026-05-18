import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Database, FileSearch, ShieldCheck, Wrench } from "lucide-react";

import { agentMcpPlan, agentReadContracts, agentWriteSafetyRules } from "@/lib/agent-manifest";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bumpgrade MCP roadmap",
  description:
    "Planned MCP resources and tools for Bumpgrade, backed by the same source-data contracts and confirmed-write safety rules.",
  alternates: {
    canonical: `${site.url}/agent-docs/bumpgrade-mcp`,
  },
};

export default function McpRoadmapPage() {
  const readyContracts = agentMcpPlan.filter((item) => item.status === "ready-contract");
  const plannedTools = agentMcpPlan.filter((item) => item.status === "planned");

  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Agent docs</p>
          <h1>MCP should wrap the same contracts the web app already exposes.</h1>
          <p className="lede">
            The first Bumpgrade MCP resources should read feature, roadmap, comparison, commerce, and admin state from
            public-safe routes. Tool writes stay planned until confirmed-write APIs exist.
          </p>
          <Link href="/agent-docs/source-data" className="text-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <Bot aria-hidden="true" />
          <p>Status</p>
          <strong>{readyContracts.length} ready contracts</strong>
          <span>{plannedTools.length} MCP entries remain planned until the write API and MCP server exist.</span>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Resources</p>
            <h2>Read contracts ready for MCP wrapping</h2>
          </div>
          <Link href="/agent-docs/bumpgrade-agent-surface" className="text-link compact-link">
            Agent surface
            <FileSearch aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {readyContracts.map((item) => (
            <article key={item.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">Ready contract</span>
                <Link href={item.backedBy.split(" ")[0]}>Route</Link>
              </div>
              <h3>{item.resourceOrTool}</h3>
              <p>{item.purpose}</p>
              <div className="feature-detail">
                <strong>Backed by</strong>
                <span>{item.backedBy}</span>
              </div>
              <div className="feature-detail">
                <strong>Safety</strong>
                <span>{item.safetyBoundary}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Tools</p>
            <h2>Planned tools need confirmed-write APIs first.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {plannedTools.map((item) => (
            <article key={item.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge pending">Planned</span>
                <span>Issue #12</span>
              </div>
              <Wrench aria-hidden="true" />
              <h3>{item.resourceOrTool}</h3>
              <p>{item.purpose}</p>
              <div className="feature-detail">
                <strong>Backed by</strong>
                <span>{item.backedBy}</span>
              </div>
              <div className="feature-detail">
                <strong>Safety</strong>
                <span>{item.safetyBoundary}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">API base</p>
            <h2>HTTP routes stay canonical before MCP exists.</h2>
          </div>
        </div>
        <div className="check-grid">
          {agentReadContracts.slice(0, 6).map((contract) => (
            <div key={contract.id} className="check-row">
              <span aria-hidden="true">+</span>
              <p>
                {contract.title}: {contract.route}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Write safety</p>
            <h2>MCP tools cannot skip product permissions.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmation</h3>
            <p>{agentWriteSafetyRules[4]}</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Audit correlation</h3>
            <p>Confirmed writes need idempotency keys, stale-state checks, before/after summaries, and redacted output.</p>
          </div>
          <div>
            <FileSearch aria-hidden="true" />
            <h3>Source grounding</h3>
            <p>Tools must cite source IDs, issue/PR evidence, source URLs, and retrieved dates when changing public claims.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
