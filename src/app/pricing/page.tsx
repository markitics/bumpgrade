import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleDollarSign, Database, ShieldCheck } from "lucide-react";

import { plannedPricingTracks, pricingPrinciples } from "@/lib/content-surfaces";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing Direction",
  description:
    "Bumpgrade pricing direction for publishers, products, payments, and agent workflows without premature live billing claims.",
  alternates: {
    canonical: `${site.url}/pricing`,
  },
};

function lastIssueNumber(issueNumbers: number[]) {
  return issueNumbers[issueNumbers.length - 1] ?? 20;
}

export default function PricingPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Pricing</p>
          <h1>Pricing direction without premature billing claims.</h1>
          <p className="lede">
            Bumpgrade can explain how pricing will likely map to publishers, growth workflows, and agent-enabled
            operations. It does not publish plan amounts, limits, trials, or live subscription availability until the
            billing rollout has source evidence.
          </p>
          <div className="hero-actions">
            <Link href="/commerce/source-data" className="primary-action">
              Commerce contract
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/content/source-data" className="secondary-action">
              Pricing JSON
              <Database aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel" aria-label="Pricing surface status">
          <CircleDollarSign aria-hidden="true" />
          <p>Status</p>
          <strong>Direction only</strong>
          <span>
            Sandbox commerce architecture is live, but customer billing, plan names, price points, and package limits
            remain unclaimed until a separate rollout ships.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Principles</p>
            <h2>What the pricing page can safely say now</h2>
          </div>
        </div>
        <div className="feature-grid">
          {pricingPrinciples.map((principle) => (
            <article key={principle.id} className="feature-card content-surface-card compact-content-card">
              <div className="feature-card-top">
                <span className={`status-badge ${principle.status}`}>{principle.status}</span>
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.summary}</p>
              <div className="feature-detail">
                <strong>Evidence routes</strong>
                <span>{principle.evidenceRoutes.join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Planned tracks</p>
            <h2>Packaging hypotheses tied to roadmap issues</h2>
          </div>
        </div>
        <div className="feature-grid">
          {plannedPricingTracks.map((track) => (
            <article key={track.id} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className={`status-badge ${track.status}`}>{track.status}</span>
                <Link href={`https://github.com/markitics/bumpgrade/issues/${lastIssueNumber(track.issueNumbers)}`}>
                  Issue #{lastIssueNumber(track.issueNumbers)}
                </Link>
              </div>
              <h3>{track.title}</h3>
              <p>{track.intendedFor}</p>
              <ul>
                {track.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="feature-detail">
                <strong>Not yet claimed</strong>
                <span>{track.notYetClaimed}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Billing safety</p>
            <h2>Agent-started billing stays behind confirmed-write rules.</h2>
          </div>
          <Link href="/agent-docs/bumpgrade-commerce-contract" className="text-link compact-link">
            Commerce docs
            <ShieldCheck aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <CircleDollarSign aria-hidden="true" />
            <h3>No live plan claims</h3>
            <p>The pricing surface describes direction only until plan amounts, limits, and subscriptions are explicitly shipped.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Commerce source data</h3>
            <p>`/commerce/source-data` exposes the redacted sandbox checkout architecture and billing safety rules.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmation required</h3>
            <p>Billing-impacting agent actions need exact confirmation, idempotency, stale-state checks, audit correlation, and redaction.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
