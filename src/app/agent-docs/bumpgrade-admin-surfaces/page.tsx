import type { Metadata } from "next";
import Link from "next/link";
import { Database, KeyRound, LayoutDashboard, LockKeyhole, Route } from "lucide-react";

import { agentReadContracts } from "@/lib/agent-manifest";
import { adminNavItems, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bumpgrade admin surfaces for agents",
  description:
    "Owner-gated Bumpgrade admin pages, public-safe admin source-data routes, and the boundaries agents must follow.",
  alternates: {
    canonical: `${site.url}/agent-docs/bumpgrade-admin-surfaces`,
  },
};

const adminSourceRoutes = [
  "/admin/director/source-data",
  "/admin/source-data",
  "/admin/roadmap/source-data",
  "/admin/work-log/source-data",
  "/admin/user-journeys/source-data",
  "/admin/for-mark/source-data",
];

export default function AdminSurfacesAgentDocPage() {
  const adminContract = agentReadContracts.find((contract) => contract.id === "read-admin-source");

  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Agent docs</p>
          <h1>Admin pages are owner-gated; admin source data is public-safe.</h1>
          <p className="lede">
            Agents should read the director dashboard, admin roadmap, work-log, journey, Mark-attention, draft-funnel, and product-entitlement
            capability state from source-data contracts. Browser-rendered admin pages require Better Auth owner sessions
            and are not a shortcut around permissions. The director contract includes due-now, in-flight,
            pending-next, and watchlist queue lanes with workstream provenance for executive summaries.
          </p>
          <Link href="/admin/source-data" className="text-link">
            Admin source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <LayoutDashboard aria-hidden="true" />
          <p>Status</p>
          <strong>Auth boundary live</strong>
          <span>Better Auth protects human admin pages while source-data routes expose public-safe coordination state.</span>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Human pages</p>
            <h2>Owner-session admin surfaces</h2>
          </div>
          <Link href="/login" className="text-link compact-link">
            Login
            <KeyRound aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {adminNavItems.map((item) => (
            <article key={item.href} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge pending">Owner auth</span>
                <Link href={item.href}>Open</Link>
              </div>
              <item.icon aria-hidden="true" />
              <h3>{item.label}</h3>
              <p>{item.description}</p>
              <div className="feature-detail">
                <strong>Boundary</strong>
                <span>Rendered page requires an allowlisted, verified owner session.</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Agent reads</p>
            <h2>Public-safe source-data routes</h2>
          </div>
          <Link href="/agent-docs/source-data" className="text-link compact-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {adminSourceRoutes.map((route) => (
            <article key={route} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">JSON</span>
                <Link href={route}>Read</Link>
              </div>
              <h3>{route}</h3>
              <p>Public-safe admin state for agents and future MCP resources.</p>
              <div className="feature-detail">
                <strong>Must not include</strong>
                <span>Secrets, private inbox bodies, raw provider IDs, raw MIME, or private customer data.</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Read contract</p>
            <h2>How agents should use admin state</h2>
          </div>
        </div>
        <div className="check-grid">
          {(adminContract?.safeForAgents ?? []).map((item) => (
            <div key={item} className="check-row">
              <span aria-hidden="true">+</span>
              <p>{item}</p>
            </div>
          ))}
          <div className="check-row">
            <span aria-hidden="true">+</span>
            <p>{adminContract?.writeBoundary}</p>
          </div>
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Permission</p>
            <h2>Do not confuse readability with authority.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <LockKeyhole aria-hidden="true" />
            <h3>Private UI</h3>
            <p>Owner pages are for Mark and authenticated admins, not anonymous agent scraping.</p>
          </div>
          <div>
            <Route aria-hidden="true" />
            <h3>Public state</h3>
            <p>Source-data routes exist so agents can resume, cite, and coordinate without exposing private notes.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Future writes</h3>
            <p>Admin updates should move through approved scripts now and confirmed-write APIs later.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
