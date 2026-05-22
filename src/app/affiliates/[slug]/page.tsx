import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeDollarSign,
  ChartNoAxesCombined,
  Handshake,
  Link2,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  affiliatePrograms,
  getAffiliateProgramBySlug,
  type AffiliatePartnerReport,
  type CommissionLedgerFixture,
  type PayoutBatchFixture,
  type ReferralLink,
} from "@/lib/affiliate-referrals";
import { site } from "@/lib/site";

type AffiliatePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicAffiliateBoundary =
  "Payouts should wait for trusted checkout attribution, refund-window checks, fraud review, payout account verification, and tax details.";

export function generateStaticParams() {
  return affiliatePrograms.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: AffiliatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = getAffiliateProgramBySlug(slug);

  if (!program) return {};

  return {
    title: program.title,
    description: program.summary,
    alternates: {
      canonical: `${site.url}${program.previewRoute}`,
    },
    openGraph: {
      title: program.title,
      description: program.summary,
      url: `${site.url}${program.previewRoute}`,
      type: "article",
    },
  };
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function referralLinkStatusLabel(status: ReferralLink["status"]) {
  if (status === "draft") return "Ready to review";
  return "In review";
}

function partnerStatusLabel(status: string) {
  if (status === "approved") return "Approved";
  return "In review";
}

function commissionKindLabel(kind: string) {
  if (kind === "percentage") return "Percentage";
  if (kind === "fixed") return "Fixed";
  if (kind === "holdback") return "Holdback";
  return kind.replaceAll("_", " ");
}

function ledgerTitle(ledger: CommissionLedgerFixture) {
  if (ledger.referralLinkId.includes("launch-circle")) return "Launch Circle commission";
  if (ledger.referralLinkId.includes("template-partner")) return "Template Studio commission review";
  return "Commission review";
}

function ReferralLinkCard({ link }: { link: ReferralLink }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className="status-badge planned">{referralLinkStatusLabel(link.status)}</span>
        <span className="admin-pill">{link.code}</span>
      </div>
      <Link2 aria-hidden="true" />
      <h3>{link.code} partner link</h3>
      <p>
        Sends partner traffic to the linked funnel or offer with source <code>{link.utmSource}</code>.
      </p>
      <div className="feature-detail">
        <strong>Attribution rule</strong>
        <span>{link.destinationRoute.startsWith("/offers") ? "Offer attribution review" : "30-day first-click window"}</span>
      </div>
    </article>
  );
}

function LedgerCard({ ledger }: { ledger: CommissionLedgerFixture }) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge active">Commission</span>
        <span className="admin-pill">{formatMoney(ledger.commissionCents)}</span>
      </div>
      <BadgeDollarSign aria-hidden="true" />
      <h3>{ledgerTitle(ledger)}</h3>
      <p>{ledger.reason}</p>
      <div className="roadmap-detail">
        <strong>Gross sale</strong>
        <span>{formatMoney(ledger.grossSaleCents)} sale</span>
      </div>
    </article>
  );
}

function PartnerReportCard({ report }: { report: AffiliatePartnerReport }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className="status-badge live">Report</span>
        <span className="admin-pill">{report.fixtureMetrics.fixtureLedgerCount} commission rows</span>
      </div>
      <ChartNoAxesCombined aria-hidden="true" />
      <h3>{report.title}</h3>
      <p>{report.payoutReadiness.caveats.join(" ")}</p>
      <div className="feature-detail">
        <strong>Commission total</strong>
        <span>{formatMoney(report.fixtureMetrics.fixtureCommissionCents)}</span>
      </div>
      <div className="feature-detail">
        <strong>Report fields</strong>
        <span>{report.fixtureMetrics.runtimeAggregateFields.slice(0, 4).join(", ")}</span>
      </div>
    </article>
  );
}

function PayoutPreparationCard({ batch }: { batch: PayoutBatchFixture }) {
  const blockedCount = batch.readinessChecklist.filter((item) => item.status !== "passed").length;

  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge active">Preparation</span>
        <span className="admin-pill">{blockedCount} blockers</span>
      </div>
      <ShieldCheck aria-hidden="true" />
      <h3>Payout preparation</h3>
      <p>{batch.caveat}</p>
      <div className="roadmap-detail">
        <strong>Eligible commission</strong>
        <span>
          {batch.eligibleLedgerIds.length} commission row, {formatMoney(batch.totalCommissionCents)} total
        </span>
      </div>
      <div className="roadmap-detail">
        <strong>Blocked before payout prep</strong>
        <span>{batch.reviewBeforePayout.join(" ")}</span>
      </div>
    </article>
  );
}

export default async function AffiliateProgramPage({ params }: AffiliatePageProps) {
  const { slug } = await params;
  const program = getAffiliateProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const payoutBatch = program.payoutBatches[0];
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: program.title,
    url: `${site.url}${program.previewRoute}`,
    description: program.summary,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    about: ["affiliate management", "referral links", "commission rules", "payout review", "partner reporting"],
  };

  return (
    <main className="route-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Affiliate program</p>
          <h1>{program.title}</h1>
          <p className="lede">{program.summary}</p>
          <div className="hero-actions">
            <Link href="/features/affiliate-referrals" className="primary-action">
              See affiliate feature
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={program.linkedOfferRoute} className="secondary-action">
              Open linked offer
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Affiliate program status">
          <Handshake aria-hidden="true" />
          <p>Status</p>
          <strong>{program.partners.length} partner records</strong>
          <span>
            Track partner links, checkout attribution, commission review, partner reports, payout preparation, and review
            flags without exposing buyer or payout account details.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Referral links</p>
            <h2>Partner links connect traffic to checkout attribution.</h2>
          </div>
          <Link href={program.linkedFunnelRoute} className="text-link compact-link">
            Linked funnel
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {program.referralLinks.map((link) => (
            <ReferralLinkCard key={link.id} link={link} />
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Partners and rules</p>
            <h2>Commission terms and partner approvals stay separate from private payout data</h2>
          </div>
          <Link href={program.linkedOfferRoute} className="text-link compact-link">
            Checkout offer
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {program.partners.map((partner) => (
            <article key={partner.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge planned">{partnerStatusLabel(partner.status)}</span>
                <span className="admin-pill">{partner.referralLinkIds.length} links</span>
              </div>
              <UserCheck aria-hidden="true" />
              <h3>{partner.displayName}</h3>
              <p>{partner.publicProfile}</p>
              <div className="feature-detail">
                <strong>Privacy</strong>
                <span>Private partner fields stay out of this public example.</span>
              </div>
            </article>
          ))}
          {program.commissionRules.slice(0, 2).map((rule) => (
            <article key={rule.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge pending">{commissionKindLabel(rule.kind)}</span>
                <span className="admin-pill">{rule.rateBps ? `${rule.rateBps / 100}%` : `${rule.holdDays}d hold`}</span>
              </div>
              <Scale aria-hidden="true" />
              <h3>{rule.title}</h3>
              <p>{rule.caveat}</p>
              <div className="feature-detail">
                <strong>Applies to</strong>
                <span>
                  {rule.appliesToOfferIds.length} offer{rule.appliesToOfferIds.length === 1 ? "" : "s"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Partner reports</p>
            <h2>Partner performance reporting stays separate from payout details.</h2>
          </div>
          <Link href="/features/affiliate-referrals" className="text-link compact-link">
            Learn about referrals
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {program.partnerReports.map((report) => (
            <PartnerReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Commission ledger</p>
            <h2>Commission rows stay reviewable before payout.</h2>
          </div>
          <Link href={program.linkedAnalyticsRoute} className="text-link compact-link">
            Analytics dashboard
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {program.commissionLedger.map((ledger) => (
            <LedgerCard key={ledger.id} ledger={ledger} />
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Payout review</p>
            <h2>Payout preparation waits for refund windows and review flags.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          <PayoutPreparationCard batch={payoutBatch} />
          {program.reviewFlags.map((flag) => (
            <article key={flag.id} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge blocked">{flag.severity}</span>
                <span className="admin-pill">Review</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>{flag.title}</h3>
              <p>{flag.requiredAction}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Partner safety</p>
            <h2>Track growth partners without exposing payout data.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Handshake aria-hidden="true" />
            <h3>Partner attribution</h3>
            <p>Referral links and checkout attribution show which partners helped create sales.</p>
          </div>
          <div>
            <BadgeDollarSign aria-hidden="true" />
            <h3>No payout data</h3>
            <p>Tax forms, bank accounts, payout accounts, real buyer identities, Stripe customers, cookies, and IPs stay out of public data.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Careful payouts</h3>
            <p>{publicAffiliateBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
