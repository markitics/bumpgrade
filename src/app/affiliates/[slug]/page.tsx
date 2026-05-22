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
  "Payable commissions and payouts open only after trusted checkout attribution, fraud review, refund-window checks, payout account verification, tax readiness, owner confirmation, and redacted audit evidence.";
const affiliatePageDescription =
  "An affiliate workspace for partner links, commission rules, performance reports, and payout review without exposing buyer or payout data.";

function publicStatusLabel(value: string) {
  if (value === "approved_pending_payout") return "Approved for review";
  if (value === "review_required") return "Needs review";
  if (value === "not_payable") return "Not payable";
  if (value === "public_safe_report_ready") return "Report ready";
  if (value === "draft") return "In review";
  return value.replaceAll("_", " ");
}

function commissionRuleSummary(kind: string) {
  if (kind === "holdback") return "A holdback rule keeps commissions reviewable while refunds and disputes can still happen.";
  return "Commission terms stay visible for review before payout setup, taxes, and partner account checks are complete.";
}

function ledgerReason(status: string) {
  if (status === "approved_pending_payout") return "A paid checkout was attributed inside the partner window.";
  if (status === "review_required") return "This commission needs owner review before it can become payable.";
  return "This commission was reversed after refund or dispute review.";
}

function ledgerTitle(status: string) {
  if (status === "approved_pending_payout") return "Launch pass commission";
  if (status === "review_required") return "Self-referral review";
  return "Refund reversal";
}

function partnerProfileCopy(value: string) {
  return value.replaceAll("pending", "awaiting");
}

export function generateStaticParams() {
  return affiliatePrograms.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: AffiliatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = getAffiliateProgramBySlug(slug);

  if (!program) return {};

  return {
    title: program.title,
    description: affiliatePageDescription,
    alternates: {
      canonical: `${site.url}${program.previewRoute}`,
    },
    openGraph: {
      title: program.title,
      description: affiliatePageDescription,
      url: `${site.url}${program.previewRoute}`,
      type: "article",
    },
  };
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function ReferralLinkCard({ link }: { link: ReferralLink }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className="status-badge active">{publicStatusLabel(link.status)}</span>
        <span className="admin-pill">{link.code}</span>
      </div>
      <Link2 aria-hidden="true" />
      <h3>{link.publicUrlPattern}</h3>
      <p>
        Sends partner traffic to the linked funnel or offer with source <code>{link.utmSource}</code>.
      </p>
      <div className="feature-detail">
        <strong>Attribution rule</strong>
        <span>{link.attributionRuleId}</span>
      </div>
    </article>
  );
}

function LedgerCard({ ledger }: { ledger: CommissionLedgerFixture }) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge live">{publicStatusLabel(ledger.status)}</span>
        <span className="admin-pill">{formatMoney(ledger.commissionCents)}</span>
      </div>
      <BadgeDollarSign aria-hidden="true" />
      <h3>{ledgerTitle(ledger.status)}</h3>
      <p>{ledgerReason(ledger.status)}</p>
      <div className="roadmap-detail">
        <strong>Gross sale</strong>
        <span>{formatMoney(ledger.grossSaleCents)} example sale</span>
      </div>
    </article>
  );
}

function PartnerReportCard({ report }: { report: AffiliatePartnerReport }) {
  return (
    <article className="feature-card compact-content-card">
      <div className="feature-card-top">
        <span className="status-badge live">Report</span>
        <span className="admin-pill">{report.fixtureMetrics.fixtureLedgerCount} ledger rows</span>
      </div>
      <ChartNoAxesCombined aria-hidden="true" />
      <h3>{report.title}</h3>
      <p>Shows aggregate clicks, attributed checkouts, commission review, and reversal activity without buyer or payout data.</p>
      <div className="feature-detail">
        <strong>Commission total</strong>
        <span>{formatMoney(report.fixtureMetrics.fixtureCommissionCents)} public-safe total</span>
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
        <span className="status-badge live">Review</span>
        <span className="admin-pill">{blockedCount} blockers</span>
      </div>
      <ShieldCheck aria-hidden="true" />
      <h3>Payout preparation</h3>
      <p>Use this checklist to review commissions before any partner payout is prepared.</p>
      <div className="roadmap-detail">
        <strong>Eligible commission evidence</strong>
        <span>
          {batch.eligibleLedgerIds.length} ledger, {formatMoney(batch.totalCommissionCents)} public-safe total
        </span>
      </div>
      <div className="roadmap-detail">
        <strong>Blocked before payout prep</strong>
        <span>Confirm the refund window, resolve review flags, and verify the partner payout account privately.</span>
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
    description: affiliatePageDescription,
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
          <p className="lede">{affiliatePageDescription}</p>
          <div className="hero-actions">
            <Link href={program.linkedFunnelRoute} className="primary-action">
              See the funnel
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={program.linkedOfferRoute} className="secondary-action">
              See the checkout offer
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Affiliate program status">
          <Handshake aria-hidden="true" />
          <p>Status</p>
          <strong>{program.partners.length} partner records</strong>
          <span>
            Referral links, click summaries, checkout attribution, commission review, partner reports, and payout checks
            are visible without exposing buyers, tax forms, payout accounts, or private partner data.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Referral links</p>
            <h2>Partner links can connect privacy-safe clicks to checkout evidence</h2>
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
                <span className="status-badge active">{publicStatusLabel(partner.status)}</span>
                <span className="admin-pill">{partner.referralLinkIds.length} links</span>
              </div>
              <UserCheck aria-hidden="true" />
              <h3>{partner.displayName}</h3>
              <p>{partnerProfileCopy(partner.publicProfile)}</p>
              <div className="feature-detail">
                <strong>Private data excluded</strong>
                <span>{partner.privateDataExcluded.length} fields</span>
              </div>
            </article>
          ))}
          {program.commissionRules.slice(0, 2).map((rule) => (
            <article key={rule.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge live">{rule.kind}</span>
                <span className="admin-pill">{rule.rateBps ? `${rule.rateBps / 100}%` : `${rule.holdDays}d hold`}</span>
              </div>
              <Scale aria-hidden="true" />
              <h3>{rule.title}</h3>
              <p>{commissionRuleSummary(rule.kind)}</p>
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
            <h2>Partner performance reporting stays aggregate-only before payout prep</h2>
          </div>
          <Link href={program.linkedAnalyticsRoute} className="text-link compact-link">
            Analytics dashboard
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
            <h2>Commission evidence stays reversible before payout</h2>
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
            <h2>Payout preparation waits until refund windows and review flags are resolved</h2>
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
              <p>Review this flag before preparing a partner payout.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Privacy and safety</p>
            <h2>Partner performance is visible without exposing payout data.</h2>
          </div>
          <Link href="/developers-and-agents" className="text-link compact-link">
            Developer details
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Handshake aria-hidden="true" />
            <h3>Partner-ready structure</h3>
            <p>Links, partner profiles, commission rules, and review checks are grouped in one place.</p>
          </div>
          <div>
            <BadgeDollarSign aria-hidden="true" />
            <h3>No payout data</h3>
            <p>Tax forms, bank accounts, payout accounts, real buyer identities, Stripe customers, cookies, and IPs stay out of public data.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Payout changes are protected</h3>
            <p>{publicAffiliateBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
