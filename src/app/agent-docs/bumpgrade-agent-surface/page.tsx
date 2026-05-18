import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Database, FileText, LockKeyhole, ShieldCheck } from "lucide-react";

import {
  agentReadContracts,
  agentSourceEvidenceRoutes,
  agentWriteSafetyRules,
  boilerplateBaselineEvidence,
} from "@/lib/agent-manifest";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bumpgrade agent surface",
  description:
    "What agents can read today, which Bumpgrade routes are public-safe, what requires owner credentials, and how confirmed writes stay safe.",
  alternates: {
    canonical: `${site.url}/agent-docs/bumpgrade-agent-surface`,
  },
};

export default function AgentSurfacePage() {
  const publicContracts = agentReadContracts.filter((contract) => contract.auth === "public");

  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Agent docs</p>
          <h1>Agents get public contracts, not hidden browser-only state.</h1>
          <p className="lede">
            Bumpgrade exposes feature, roadmap, comparison, commerce, admin, and agent manifest reads through stable
            source-data routes. Human admin pages remain owner-gated, and write actions require explicit confirmation.
          </p>
          <Link href="/agent-docs/source-data" className="text-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <Bot aria-hidden="true" />
          <p>Status</p>
          <strong>{publicContracts.length} public reads</strong>
          <span>Issue #12 turns the scaffold route into a manifest-backed agent surface with source evidence.</span>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Public reads</p>
            <h2>Agent-readable contracts available today</h2>
          </div>
          <Link href="/agent-docs" className="text-link compact-link">
            Docs index
            <FileText aria-hidden="true" />
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
                <strong>Source of truth</strong>
                <span>{contract.sourceOfTruth}</span>
              </div>
              <div className="feature-detail">
                <strong>Write boundary</strong>
                <span>{contract.writeBoundary}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Evidence</p>
            <h2>Claim resolution starts from stable IDs.</h2>
          </div>
          <Link href="/agent-docs/bumpgrade-source-evidence" className="text-link compact-link">
            Source evidence
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {agentSourceEvidenceRoutes.map((route) => (
            <article key={route.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">Source</span>
                <Link href={route.route}>JSON</Link>
              </div>
              <h3>{route.route}</h3>
              <p>{route.resolves}</p>
              <div className="feature-detail">
                <strong>Stable IDs</strong>
                <span>{route.stableIds.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Caveat</strong>
                <span>{route.volatileClaims}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Baseline</p>
            <h2>The shared agent workflow is adapted from the project boilerplate.</h2>
          </div>
        </div>
        <div className="check-grid">
          {boilerplateBaselineEvidence.adoptedShape.map((item) => (
            <div key={item} className="check-row">
              <span aria-hidden="true">+</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Boundaries</p>
            <h2>Owner and write actions are explicit.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <LockKeyhole aria-hidden="true" />
            <h3>Admin auth</h3>
            <p>Human admin pages require Better Auth owner sessions. Public-safe source-data routes do not bypass that boundary.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes</h3>
            <p>{agentWriteSafetyRules[4]}</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>No secrets</h3>
            <p>{agentWriteSafetyRules[3]}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
