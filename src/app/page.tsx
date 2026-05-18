import Link from "next/link";
import { ArrowRight, CheckCircle2, Cloud, FileText, GitBranch, ShieldCheck } from "lucide-react";

import { adminNavItems, featurePillars, firstWaveCompetitors, scaffoldRoutes } from "@/lib/site";

const launchLanes = [
  { label: "Compare", href: "/compare", status: "Issue #5", body: "Hub and nine alternative pages with source-linked claims." },
  { label: "Features", href: "/features", status: "Issue #6", body: "Aspirational feature catalog with pending badges and issue links." },
  { label: "Roadmap", href: "/roadmap", status: "Issue #7", body: "Public view of the main launch roadmap." },
  { label: "Admin", href: "/admin/roadmap", status: "Issue #8", body: "D1-backed roadmap, work log, journeys, and for-Mark surface." },
];

export default function HomePage() {
  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Bumpgrade launch foundation</p>
          <h1>Funnels, checkout, commerce, and agents in one Cloudflare-native system.</h1>
          <p className="lede">
            Bumpgrade is being built for indiepreneurs and small publishers who want ClickFunnels, SamCart, Kit, and Shopify-style selling power without stitching the whole stack together.
          </p>
          <div className="hero-actions">
            <Link href="/compare" className="primary-action">
              Compare the stack
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/roadmap" className="secondary-action">
              View roadmap
              <GitBranch aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="product-preview" aria-label="Bumpgrade launch board preview">
          <div className="preview-toolbar">
            <span>Launch board</span>
            <strong>Planned</strong>
          </div>
          <div className="preview-grid">
            {launchLanes.map((lane) => (
              <Link key={lane.href} href={lane.href} className="preview-card">
                <span>{lane.status}</span>
                <h2>{lane.label}</h2>
                <p>{lane.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">First-wave parity map</p>
          <h2>Built around the tools publishers already compare.</h2>
        </div>
        <div className="competitor-strip">
          {firstWaveCompetitors.map((competitor) => (
            <span key={competitor}>{competitor}</span>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="section-heading">
          <p className="eyebrow">Core pillars</p>
          <h2>Feature groups become issue-backed slices.</h2>
        </div>
        <div className="pillar-grid">
          {featurePillars.map((pillar) => (
            <article key={pillar.title} className="pillar-card">
              <pillar.icon aria-hidden="true" />
              <p>{pillar.issue}</p>
              <h3>{pillar.title}</h3>
              <span>{pillar.body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Admin and agent-ready by default</p>
          <h2>The project state is a product surface, not private chat state.</h2>
        </div>
        <div className="admin-grid">
          {adminNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="admin-link-card">
              <item.icon aria-hidden="true" />
              <h3>{item.label}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="section-heading">
          <p className="eyebrow">Cloudflare foundation</p>
          <h2>Route shell is live in source, persistence and auth are next.</h2>
        </div>
        <div className="status-list">
          <div>
            <Cloud aria-hidden="true" />
            <p>D1 `bumpgrade-prod` and R2 `bumpgrade-opennext-cache` are configured for the Worker.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <p>Better Auth, Codex email, and Stripe are tracked in dedicated follow-up issues.</p>
          </div>
          <div>
            <FileText aria-hidden="true" />
            <p>Public `llms.txt`, docs, and route placeholders keep future agents oriented.</p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Routes scaffolded</p>
          <h2>Enough structure to let feature branches stay small.</h2>
        </div>
        <div className="route-list">
          {scaffoldRoutes.map((route) => (
            <span key={route}>
              <CheckCircle2 aria-hidden="true" />
              {route}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
