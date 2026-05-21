import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Database, Handshake, MailCheck, ShieldAlert, ShieldCheck } from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { AdminAffiliateFraudReviewRecordForm } from "@/components/admin-affiliate-fraud-review-record-form";
import { AdminAffiliateNotificationReadinessRecordForm } from "@/components/admin-affiliate-notification-readiness-record-form";
import { AdminAffiliatePayoutPreparationRecordForm } from "@/components/admin-affiliate-payout-preparation-record-form";
import { getCurrentAdminState } from "@/lib/admin-auth";
import {
  affiliateFraudReviewRecordIssue,
  getAffiliateFraudReviewRecordSummary,
} from "@/lib/affiliate-fraud-review-records";
import {
  affiliatePartnerNotificationReadinessRecordIssue,
  getAffiliatePartnerNotificationReadinessRecordSummary,
} from "@/lib/affiliate-partner-notification-readiness-records";
import {
  affiliatePayoutPreparationRecordIssue,
  getAffiliatePayoutPreparationRecordSummary,
} from "@/lib/affiliate-payout-preparation-records";
import { affiliateProgram } from "@/lib/affiliate-referrals";

export const metadata: Metadata = {
  title: "Admin affiliates",
  description:
    "Owner-gated affiliate payout preparation, fraud review, and partner notification readiness records for Bumpgrade publishers.",
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

  const [payoutSummary, fraudSummary, notificationSummary] = await Promise.all([
    getAffiliatePayoutPreparationRecordSummary(),
    getAffiliateFraudReviewRecordSummary(),
    getAffiliatePartnerNotificationReadinessRecordSummary(),
  ]);
  const evidence = payoutSummary.currentEvidence;
  const fraudEvidence = fraudSummary.currentEvidence;
  const notificationEvidence = notificationSummary.currentEvidence;

  return (
    <main className="roadmap-page admin-roadmap-page admin-audience-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin affiliates</p>
          <h1>Affiliate payout, fraud review, and partner notification readiness stays owner-confirmed.</h1>
          <p className="lede">
            Owners can inspect the current affiliate payout preparation snapshot, record a redacted preparation review,
            capture fraud review evidence, and record partner notification readiness. These records keep Stripe payouts,
            payable commission mutation, payout accounts, tax data, partner sends, provider calls, queue rows, recipient
            emails, message bodies, buyer data, raw rows, private fraud signals, and fraud enforcement disabled.
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
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${affiliateFraudReviewRecordIssue}`}
              className="secondary-action"
            >
              Issue #{affiliateFraudReviewRecordIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${affiliatePartnerNotificationReadinessRecordIssue}`}
              className="secondary-action"
            >
              Issue #{affiliatePartnerNotificationReadinessRecordIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Affiliate review status summary">
          <Handshake aria-hidden="true" />
          <p>
            {payoutSummary.source === "d1" || fraudSummary.source === "d1" || notificationSummary.source === "d1"
              ? "D1 affiliate evidence"
              : "D1 unavailable"}
          </p>
          <strong>
            {payoutSummary.counts.payoutPreparationRecords} payout prep,{" "}
            {fraudSummary.counts.fraudReviewRecords} fraud review,{" "}
            {notificationSummary.counts.notificationReadinessRecords} notification readiness
          </strong>
          <span>
            {payoutSummary.loadError ??
              fraudSummary.loadError ??
              notificationSummary.loadError ??
              "Owner-confirmed affiliate review records load from D1."}
          </span>
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
            <ShieldAlert aria-hidden="true" />
            <h3>Fraud review</h3>
            <p>
              {fraudEvidence.reviewFlagSeverity} severity, {fraudEvidence.linkedLedgerIds.length} linked ledger,{" "}
              {fraudSummary.counts.fraudDecisionEnforcedRecords} enforced decisions.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Payout boundary</h3>
            <p>
              {payoutSummary.counts.stripePayoutCreatedRecords} Stripe payouts;{" "}
              {payoutSummary.counts.partnerNotificationSentRecords} partner notifications.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Send boundary</h3>
            <p>
              {notificationSummary.counts.partnerNotificationSentRecords} sent,{" "}
              {notificationSummary.counts.queueDispatchCreatedRecords} queue dispatches,{" "}
              {notificationSummary.counts.recipientEmailIncludedRecords} recipient emails.
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
          <Link href={payoutSummary.apiRoute} className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAffiliatePayoutPreparationRecordForm evidence={evidence} />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Owner fraud review</p>
            <h2>Record affiliate fraud review evidence without enforcing fraud decisions.</h2>
          </div>
          <Link href={fraudSummary.apiRoute} className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAffiliateFraudReviewRecordForm evidence={fraudEvidence} />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Owner partner notification readiness</p>
            <h2>Record affiliate partner notification readiness without sending notifications.</h2>
          </div>
          <Link href={notificationSummary.apiRoute} className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAffiliateNotificationReadinessRecordForm evidence={notificationEvidence} />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest payout records</p>
            <h2>Payout preparation records hide payout accounts, tax data, and buyer rows.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {payoutSummary.latestRecords.length > 0 ? (
            payoutSummary.latestRecords.map((record) => (
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

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest fraud records</p>
            <h2>Fraud review records hide private fraud signals, raw rows, and actor identity.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {fraudSummary.latestRecords.length > 0 ? (
            fraudSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">{record.recordKind.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.reviewDisposition.replaceAll("_", " ")}</span>
                </div>
                <ShieldAlert aria-hidden="true" />
                <h3>{record.reviewFlagId}</h3>
                <p>
                  {record.expectedLinkedLedgerCount} linked ledger, severity {record.expectedFlagSeverity}, recorded at{" "}
                  {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No fraud enforcement</strong>
                  <span>
                    Fraud enforced {String(record.fraudDecisionEnforced)}, payout created{" "}
                    {String(record.stripePayoutCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">{fraudEvidence.reviewFlagId}</span>
              </div>
              <ShieldAlert aria-hidden="true" />
              <h3>Fraud review evidence is ready</h3>
              <p>Use the confirmed-write form after the owner has reviewed the seeded affiliate review flag.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest notification readiness records</p>
            <h2>Notification readiness records hide recipients, payloads, provider IDs, and queue rows.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {notificationSummary.latestRecords.length > 0 ? (
            notificationSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">{record.recordKind.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.notificationReadinessDisposition.replaceAll("_", " ")}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.affiliatePartnerReportId}</h3>
                <p>
                  {record.expectedLinkedLedgerCount} linked ledger, fraud status{" "}
                  {record.expectedFraudReviewRecordStatus.replaceAll("-", " ")}, recorded at{" "}
                  {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No partner send</strong>
                  <span>
                    Sent {String(record.partnerNotificationSent)}, provider called{" "}
                    {String(record.notificationProviderCalled)}, queue dispatch{" "}
                    {String(record.queueDispatchCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">{notificationEvidence.affiliatePartnerReportId}</span>
              </div>
              <MailCheck aria-hidden="true" />
              <h3>Notification readiness evidence is ready</h3>
              <p>Use the confirmed-write form after the owner has reviewed payout and fraud evidence.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
