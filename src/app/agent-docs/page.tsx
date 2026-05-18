import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Database, FileSearch, GitBranch, ShieldCheck } from "lucide-react";

import { agentDocs, agentMcpPlan, agentReadContracts, agentWriteSafetyRules } from "@/lib/agent-manifest";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bumpgrade agent docs",
  description:
    "Public agent-readable Bumpgrade docs, source-data contracts, MCP roadmap, and confirmed-write safety boundaries.",
  alternates: {
    canonical: `${site.url}/agent-docs`,
  },
};

export default function AgentDocsIndexPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Agent docs</p>
          <h1>Bumpgrade is readable by agents without scraping private admin UI.</h1>
          <p className="lede">
            These docs map the public-safe routes, stable IDs, source evidence, MCP direction, and write rules that
            let Codex, ChatGPT, Claude, and other agents work from evidence instead of guesses.
          </p>
          <Link href="/agent-docs/source-data" className="text-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <Bot aria-hidden="true" />
          <p>Status</p>
          <strong>Live read contracts</strong>
          <span>Issue #12 publishes the current read surface and records MCP/write capabilities as planned contracts.</span>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Docs</p>
            <h2>Agent-readable pages</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/12" className="text-link compact-link">
            Track issue #12
            <GitBranch aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {agentDocs.map((doc) => (
            <article key={doc.id} className="feature-card">
              <div className="feature-card-top">
                <span className={`status-badge ${doc.status === "live" ? "live" : "pending"}`}>{doc.status}</span>
                <Link href={doc.route}>Open</Link>
              </div>
              <h3>{doc.title}</h3>
              <p>{doc.purpose}</p>
              <div className="feature-detail">
                <strong>Evidence</strong>
                <span>{doc.evidence.join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Contracts</p>
            <h2>Stable read surfaces</h2>
          </div>
          <Link href="/agent-docs/source-data" className="text-link compact-link">
            Source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {agentReadContracts.map((contract) => (
            <article key={contract.id} className="feature-card">
              <div className="feature-card-top">
                <span className={`status-badge ${contract.auth === "public" ? "live" : "pending"}`}>{contract.auth}</span>
                <Link href={contract.route}>Read</Link>
              </div>
              <h3>{contract.title}</h3>
              <p>{contract.sourceOfTruth}</p>
              <div className="feature-detail">
                <strong>Stable IDs</strong>
                <span>{contract.stableIds.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Write boundary</strong>
                <span>{contract.writeBoundary}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Safety</p>
            <h2>Reads are live; writes remain confirmed or planned.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <FileSearch aria-hidden="true" />
            <h3>Evidence first</h3>
            <p>{agentWriteSafetyRules[1]}</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes</h3>
            <p>{agentWriteSafetyRules[4]}</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>MCP direction</h3>
            <p>{agentMcpPlan.filter((item) => item.status === "ready-contract").length} read contracts are ready for future MCP resources.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
