import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Database, FileSearch, ShieldCheck } from "lucide-react";

import { agentDocs, agentMcpPlan, agentReadContracts } from "@/lib/agent-manifest";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developers and agents",
  description: "Bumpgrade APIs, manifests, MCP direction, source evidence, webhooks, and agent-safe action contracts.",
  alternates: {
    canonical: `${site.url}/developers-and-agents`,
  },
};

export default function DevelopersAndAgentsPage() {
  const publicContracts = agentReadContracts.filter((contract) => contract.auth === "public");

  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Developers and agents</p>
          <h1>APIs and manifests come before agent browser tricks.</h1>
          <p className="lede">
            Bumpgrade publishes source-data routes, an agent manifest, public docs, and write-safety rules so agents
            can cite evidence and respect permission boundaries while the product grows toward full platform parity.
          </p>
          <div className="hero-actions">
            <Link href="/agent-docs" className="primary-action">
              Agent docs
              <Bot aria-hidden="true" />
            </Link>
            <Link href="/agent-docs/source-data" className="secondary-action">
              Manifest JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="route-status-panel">
          <Database aria-hidden="true" />
          <p>Status</p>
          <strong>{publicContracts.length} public contracts</strong>
          <span>Current write APIs are limited; confirmed-write and MCP tooling remain explicit roadmap work.</span>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Read contracts</p>
            <h2>What developers and agents can read now</h2>
          </div>
          <Link href="/agent-docs/bumpgrade-agent-surface" className="text-link compact-link">
            Surface overview
            <FileSearch aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {publicContracts.map((contract) => (
            <article key={contract.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">Public</span>
                <Link href={contract.route}>Open</Link>
              </div>
              <h3>{contract.title}</h3>
              <p>{contract.safeForAgents.join(", ")}</p>
              <div className="feature-detail">
                <strong>Stable IDs</strong>
                <span>{contract.stableIds.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Boundary</strong>
                <span>{contract.writeBoundary}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Docs</p>
            <h2>Agent documentation map</h2>
          </div>
        </div>
        <div className="feature-grid">
          {agentDocs.slice(0, 6).map((doc) => (
            <article key={doc.id} className="feature-card">
              <div className="feature-card-top">
                <span className={`status-badge ${doc.status === "live" ? "live" : "pending"}`}>{doc.status}</span>
                <Link href={doc.route}>Open</Link>
              </div>
              <h3>{doc.title}</h3>
              <p>{doc.purpose}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">MCP and writes</p>
            <h2>Tooling builds on the same contract, with stronger safety.</h2>
          </div>
          <Link href="/agent-docs/bumpgrade-mcp" className="text-link compact-link">
            MCP roadmap
            <Bot aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Database aria-hidden="true" />
            <h3>Ready contracts</h3>
            <p>{agentMcpPlan.filter((item) => item.status === "ready-contract").length} MCP resource contracts are backed by live JSON routes.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes</h3>
            <p>Public, billing-impacting, admin, and creator-speech writes need confirmation, idempotency, stale-state checks, audit correlation, and redaction.</p>
          </div>
          <div>
            <FileSearch aria-hidden="true" />
            <h3>Source grounding</h3>
            <p>Public claims need source IDs, issue or PR evidence, work-log records, source URLs, and retrieved dates.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
