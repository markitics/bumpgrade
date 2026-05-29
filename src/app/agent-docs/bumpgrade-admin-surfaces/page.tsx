import type { Metadata } from "next";
import Link from "next/link";
import { Database, KeyRound, LayoutDashboard, LockKeyhole, Route } from "lucide-react";

import { agentReadContracts } from "@/lib/agent-manifest";
import { publicAdminSourceDataAliases } from "@/lib/discovery-policy";
import { adminNavItems, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bumpgrade admin surfaces for agents",
  description:
    "Owner-gated Bumpgrade admin pages, public-safe source-data aliases, and the boundaries agents must follow.",
  alternates: {
    canonical: `${site.url}/agent-docs/bumpgrade-admin-surfaces`,
  },
};

export default function AdminSurfacesAgentDocPage() {
  const adminContract = agentReadContracts.find((contract) => contract.id === "read-admin-source");

  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Agent docs</p>
          <h1>Admin pages are owner-gated; admin source data is public-safe.</h1>
          <p className="lede">
            Agents should read the director dashboard, admin roadmap, work-log, journey, owner-attention, draft-funnel, and product-entitlement
            capability state from non-admin source-data aliases. Browser-rendered admin pages require Better Auth
            owner sessions and are not a shortcut around permissions. The director contract includes due-now, in-flight,
            pending-next, and watchlist queue lanes plus recent-change digests with workstream provenance for
            executive summaries, along with stable briefing controls for past-day, past-week, queue, and
            workstream-map reads.
          </p>
          <Link href="/agent-docs/project-source-data" className="text-link">
            Project source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <LayoutDashboard aria-hidden="true" />
          <p>Status</p>
          <strong>Auth boundary live</strong>
          <span>Better Auth protects human admin pages while agent-docs aliases expose public-safe coordination state.</span>
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
            <h2>Preferred source-data aliases</h2>
          </div>
          <Link href="/agent-docs/source-data" className="text-link compact-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {publicAdminSourceDataAliases.map((alias) => (
            <article key={alias.route} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">JSON</span>
                <Link href={alias.route}>Read</Link>
              </div>
              <h3>{alias.title}</h3>
              <p>{alias.route}</p>
              <div className="feature-detail">
                <strong>Legacy route</strong>
                <span>{alias.sourceRoute}</span>
              </div>
              <div className="feature-detail">
                <strong>Must not include</strong>
                <span>Secrets, private inbox bodies, raw provider IDs, raw mail content, or private customer data.</span>
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
            <p>Owner pages are for authenticated admins, not anonymous agent scraping.</p>
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
