import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Database, FileSearch, FileText, ServerCog, ShieldCheck } from "lucide-react";

import { agentDocs, agentMcpPlan, agentReadContracts } from "@/lib/agent-manifest";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developers and agents",
  description:
    "Start a coding agent with Bumpgrade's public docs, source-data routes, manifest, MCP direction, and confirmed-write boundaries.",
  alternates: {
    canonical: `${site.url}/developers-and-agents`,
  },
};

const agentSetupPrompt = `You are helping with Bumpgrade.

Start with these public resources:
- https://bumpgrade.com/llms.txt
- https://bumpgrade.com/agent-docs
- https://bumpgrade.com/agent-docs/source-data
- https://bumpgrade.com/features/source-data

Use source-data routes and stable IDs for claims. Treat public routes as read-only. Do not perform customer-facing, billing, email, product-access, admin, or creator-speech writes unless an owner-confirmed API and exact instructions exist.`;

const agentStartResources = [
  {
    title: "Agent docs",
    body: "Start with the public index for Bumpgrade read contracts, source evidence, MCP direction, and write boundaries.",
    href: "/agent-docs",
    icon: Bot,
  },
  {
    title: "Manifest JSON",
    body: "Read stable IDs, source-of-truth files, public routes, auth requirements, and future MCP resource boundaries.",
    href: "/agent-docs/source-data",
    icon: Database,
  },
  {
    title: "llms.txt",
    body: "Use the public machine-readable index before scraping pages or guessing what Bumpgrade exposes.",
    href: "/llms.txt",
    icon: FileText,
  },
  {
    title: "Source evidence",
    body: "Resolve public product claims to feature IDs, roadmap items, issue evidence, and caveats.",
    href: "/agent-docs/bumpgrade-source-evidence",
    icon: FileSearch,
  },
  {
    title: "MCP roadmap",
    body: "See which read contracts are ready to wrap and which tools wait for confirmed-write APIs.",
    href: "/agent-docs/bumpgrade-mcp",
    icon: ServerCog,
  },
];

export default function DevelopersAndAgentsPage() {
  const publicContracts = agentReadContracts.filter((contract) => contract.auth === "public");
  const contractHighlights = publicContracts.slice(0, 6);

  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Developers and agents</p>
          <h1>Give your coding agent the Bumpgrade public contracts first.</h1>
          <p className="lede">
            Bumpgrade publishes source-data routes, an agent manifest, public docs, llms.txt, and write-safety rules
            so agents can cite evidence, follow stable IDs, and respect permission boundaries before they suggest
            changes.
          </p>
          <div className="hero-actions">
            <Link href="/agent-docs" className="primary-action">
              Start with agent docs
              <Bot aria-hidden="true" />
            </Link>
            <Link href="/agent-docs/source-data" className="secondary-action">
              Manifest JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="agent-setup-panel" aria-label="Copy-paste agent setup prompt">
          <div>
            <span>Already have an agent?</span>
            <strong>Paste this prompt first.</strong>
          </div>
          <pre>{agentSetupPrompt}</pre>
        </aside>
      </section>

      <section className="content-band agent-start-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Start here</p>
            <h2>What agents can read and where to begin</h2>
          </div>
          <p>
            Public resources are safe to read. Writes remain owner-gated until a route names the confirmation,
            idempotency, stale-state, audit, and redaction rules.
          </p>
        </div>
        <div className="agent-resource-grid">
          {agentStartResources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Link key={resource.href} href={resource.href} className="agent-resource-card">
                <Icon aria-hidden="true" />
                <span>{resource.title}</span>
                <p>{resource.body}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Read contracts</p>
            <h2>Core public contracts</h2>
            <p>
              The full manifest lists {publicContracts.length} public contracts. Start with these high-signal routes,
              then use the manifest when an agent needs exact stable IDs or boundaries.
            </p>
          </div>
          <Link href="/agent-docs/bumpgrade-agent-surface" className="text-link compact-link">
            Surface overview
            <FileSearch aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {contractHighlights.map((contract) => (
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
