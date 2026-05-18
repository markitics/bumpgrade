import type { Metadata } from "next";
import Link from "next/link";
import { Database, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";

import {
  commerceAgentWriteRules,
  commerceDecisions,
  commerceTables,
  stripeApiVersion,
  stripeCommerceContract,
  stripeNodeVersion,
} from "@/lib/commerce";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bumpgrade commerce contract",
  description:
    "Agent-readable Stripe commerce architecture for Bumpgrade payments, products, offers, checkout sessions, webhooks, subscriptions, and billing audit safety.",
  alternates: {
    canonical: `${site.url}/agent-docs/bumpgrade-commerce-contract`,
  },
};

export default function CommerceContractPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Agent docs</p>
          <h1>Stripe commerce is architecture-live, checkout is not live yet.</h1>
          <p className="lede">{stripeCommerceContract.summary}</p>
          <Link href="/commerce/source-data" className="text-link">
            Commerce source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <ReceiptText aria-hidden="true" />
          <p>Status</p>
          <strong>Architecture live</strong>
          <span>Issue #11 defines the contract. Issue #{stripeCommerceContract.firstCheckoutIssue} owns the first sandbox checkout path.</span>
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Expected shape</p>
          <h2>What this contract enables next</h2>
        </div>
        <div className="check-grid">
          {[
            `Stripe node ${stripeNodeVersion} is installed and pinned to API version ${stripeApiVersion}.`,
            "Checkout Sessions are the first payment surface for on-session purchases and subscriptions.",
            "Subscriptions use Stripe Billing patterns; future self-service changes should use Customer Portal before custom billing state.",
            "Future publisher payout work uses Connect Accounts v2, not legacy account-type shortcuts.",
            "Raw Stripe customer, checkout, payment, subscription, connected-account, webhook, and secret values stay server-private.",
          ].map((bullet) => (
            <div key={bullet} className="check-row">
              <span aria-hidden="true">✓</span>
              <p>{bullet}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Decisions</p>
            <h2>Payment architecture choices</h2>
          </div>
          <Link href="/commerce/source-data" className="text-link compact-link">
            Source data
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {commerceDecisions.map((decision) => (
            <article key={decision.id} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">Accepted</span>
                <span>{decision.id}</span>
              </div>
              <h3>{decision.title}</h3>
              <p>{decision.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">D1 contract</p>
            <h2>Commerce tables are ready before checkout code ships.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {commerceTables.map((table) => (
            <article key={table.table} className="feature-card">
              <div className="feature-card-top">
                <span className="status-badge live">Schema</span>
                <span>{table.status}</span>
              </div>
              <h3>{table.table}</h3>
              <p>{table.purpose}</p>
              <div className="feature-detail">
                <strong>Public-safe</strong>
                <span>{table.publicSafeFields.join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Server-private</strong>
                <span>{table.serverPrivateFields.join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Billing safety</p>
            <h2>Agents can read contracts; writes need confirmation.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes</h3>
            <p>{commerceAgentWriteRules[1]}</p>
          </div>
          <div>
            <LockKeyhole aria-hidden="true" />
            <h3>Redacted output</h3>
            <p>{commerceAgentWriteRules[3]}</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Auditable events</h3>
            <p>{commerceAgentWriteRules[2]}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
