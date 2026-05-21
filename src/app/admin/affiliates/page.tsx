import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Database, Handshake, ShieldCheck } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { AdminAffiliatePayoutPreparationRecordForm } from "@/components/admin-affiliate-payout-preparation-record-form";
import { getCurrentAdminState } from "@/lib/admin-auth";
import {
  affiliatePayoutPreparationRecordIssue,
  getAffiliatePayoutPreparationRecordSummary,
} from "@/lib/affiliate-payout-preparation-records";
import { affiliateProgram } from "@/lib/affiliate-referrals";

export const metadata: Metadata = {
  title: "Admin affiliates",
  description: "Owner-gated affiliate payout preparation review records for Bumpgrade publishers.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function compactDate(value: string | null) {
  if (!value) return "None recorded";
  return value.replace("T", " ").replace(".000Z", " UTC");
}

export default async function AdminAffiliatesPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/affiliates" />;

  const summary = await getAffiliatePayoutPreparationRecordSummary();
  const evidence = summary.currentEvidence;

  return (
    <main className="roadmap-page admin-roadmap-page admin-audience-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin affiliates</p>
          <h1>Affiliate payout preparation stays owner-confirmed before payouts exist.</h1>
          <p className="lede">
            Owners can inspect the current affiliate payout preparation snapshot and record a redacted preparation
            review. The record keeps Stripe payouts, payable commission mutation, payout accounts, tax data, partner
            notifications, buyer data, raw ledger rows, and fraud enforcement disabled.
          </p>
          <div className="hero-actions">
            <Link href="/affiliates/source-data" className="primary-action">
              Affiliate JSON
              <Database aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${affiliatePayoutPreparationRecordIssue}`}
              className="secondary-action"
            >
              Issue #{affiliatePayoutPreparationRecordIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Affiliate payout preparation status summary">
          <Handshake aria-hidden="true" />
          <p>{summary.source === "d1" ? "D1 affiliate evidence" : "D1 unavailable"}</p>
          <strong>{summary.counts.payoutPreparationRecords} payout prep records</strong>
          <span>{summary.loadError ?? "Owner-confirmed payout preparation records load from D1."}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-proof-grid">
          <div>
            <BadgeDollarSign aria-hidden="true" />
            <h3>Fixture total</h3>
            <p>{formatMoney(evidence.totalCommissionCents)} public-safe commission evidence.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Eligible ledgers</h3>
            <p>
              {evidence.eligibleLedgerCount} eligible, {evidence.blockedLedgerCount} blocked,{" "}
              {evidence.reversedLedgerCount} reversed.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Execution boundary</h3>
            <p>
              {summary.counts.stripePayoutCreatedRecords} Stripe payouts;{" "}
              {summary.counts.partnerNotificationSentRecords} partner notifications.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Owner record</p>
            <h2>Record affiliate payout preparation evidence without creating payouts.</h2>
          </div>
          <Link href={summary.apiRoute} className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAffiliatePayoutPreparationRecordForm evidence={evidence} />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest payout records</p>
            <h2>Payout preparation records hide payout accounts, tax data, and buyer rows.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {summary.latestRecords.length > 0 ? (
            summary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">{record.recordKind.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{formatMoney(record.expectedTotalCommissionCents)}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.payoutBatchId}</h3>
                <p>
                  {record.expectedEligibleLedgerCount} eligible, {record.expectedBlockedLedgerCount} blocked,{" "}
                  {record.expectedReversedLedgerCount} reversed at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No payout execution</strong>
                  <span>
                    Stripe payout {String(record.stripePayoutCreated)}, partner notification{" "}
                    {String(record.partnerNotificationSent)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">{affiliateProgram.slug}</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>Payout preparation evidence is ready</h3>
              <p>Use the confirmed-write form after the owner has reviewed the payout preparation snapshot.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
