import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeDollarSign,
  Bell,
  ChartNoAxesCombined,
  ClipboardCheck,
  Link2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  affiliatePartnerPortalId,
  affiliatePartnerPortalRoute,
  affiliatePrograms,
  getAffiliateProgramBySlug,
} from "@/lib/affiliate-referrals";
import { site } from "@/lib/site";

type PartnerPortalPageProps = {
  params: Promise<{
    slug: string;
    partnerSlug: string;
  }>;
};

const portalDescription =
  "A public-safe affiliate partner status portal for referral links, aggregate performance, payout readiness, fraud review, and notification readiness.";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function publicStatusLabel(value: string) {
  if (value === "approved") return "Approved";
  if (value === "review") return "In review";
  if (value === "approved_pending_payout") return "Approved for review";
  if (value === "review_required") return "Needs review";
  if (value === "reversed") return "Reversed";
  if (value === "public_safe_report_ready") return "Report ready";
  return value.replaceAll("_", " ");
}

export function generateStaticParams() {
  return affiliatePrograms.flatMap((program) =>
    program.partners.map((partner) => ({ slug: program.slug, partnerSlug: partner.portalSlug })),
  );
}

export async function generateMetadata({ params }: PartnerPortalPageProps): Promise<Metadata> {
  const { slug, partnerSlug } = await params;
  const program = getAffiliateProgramBySlug(slug);
  const partner = program?.partners.find((candidate) => candidate.portalSlug === partnerSlug);

  if (!program || !partner) return {};

  const url = `${site.url}${affiliatePartnerPortalRoute(program.slug, partner.portalSlug)}`;
  return {
    title: `${partner.displayName} portal`,
    description: portalDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${partner.displayName} portal`,
      description: portalDescription,
      url,
      type: "article",
    },
  };
}

export default async function AffiliatePartnerPortalPage({ params }: PartnerPortalPageProps) {
  const { slug, partnerSlug } = await params;
  const program = getAffiliateProgramBySlug(slug);
  const partner = program?.partners.find((candidate) => candidate.portalSlug === partnerSlug);

  if (!program || !partner) {
    notFound();
  }

  const partnerReferralLinkIds = new Set(partner.referralLinkIds);
  const referralLinks = program.referralLinks.filter((link) => partnerReferralLinkIds.has(link.id));
  const partnerReports = program.partnerReports.filter((report) => report.partnerId === partner.id);
  const partnerReportIds = new Set(partnerReports.map((report) => report.id));
  const payoutBatches = program.payoutBatches.filter((batch) =>
    batch.partnerReportIds.some((reportId) => partnerReportIds.has(reportId)),
  );
  const partnerLedgers = program.commissionLedger.filter((ledger) => partnerReferralLinkIds.has(ledger.referralLinkId));
  const partnerLedgerIds = new Set(partnerLedgers.map((ledger) => ledger.id));
  const reviewFlags = program.reviewFlags.filter((flag) =>
    flag.linkedLedgerIds.some((ledgerId) => partnerLedgerIds.has(ledgerId)),
  );
  const totalCommissionCents = partnerLedgers.reduce((sum, ledger) => sum + ledger.commissionCents, 0);
  const blockedChecklistCount = payoutBatches.reduce(
    (sum, batch) => sum + batch.readinessChecklist.filter((item) => item.status !== "passed").length,
    0,
  );
  const portalId = affiliatePartnerPortalId(partner.id);
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${partner.displayName} portal`,
    url: `${site.url}${affiliatePartnerPortalRoute(program.slug, partner.portalSlug)}`,
    description: portalDescription,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    about: ["affiliate partner portal", "referral status", "commission review", "payout readiness"],
  };

  return (
    <main className="route-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Partner portal status</p>
          <h1>{partner.displayName} portal</h1>
          <p className="lede">{portalDescription}</p>
          <div className="hero-actions">
            <Link href="/affiliates/source-data" className="primary-action">
              Source data
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={program.previewRoute} className="secondary-action">
              Program overview
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Partner portal status summary">
          <UserCheck aria-hidden="true" />
          <p>Status</p>
          <strong>{publicStatusLabel(partner.status)}</strong>
          <span>
            Portal ID <code>{portalId}</code> shows aggregate status only. Partner email, payout account, tax, buyer,
            provider, and raw-row data are excluded.
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Performance</p>
            <h2>Referral activity and commission evidence stay aggregate-only</h2>
          </div>
          <Link href={program.linkedAnalyticsRoute} className="text-link compact-link">
            Analytics source
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {referralLinks.map((link) => (
            <article key={link.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge active">{publicStatusLabel(link.status)}</span>
                <span className="admin-pill">{link.code}</span>
              </div>
              <Link2 aria-hidden="true" />
              <h3>{link.publicUrlPattern}</h3>
              <p>Traffic lands on {link.destinationRoute} with source {link.utmSource}.</p>
              <div className="feature-detail">
                <strong>Attribution rule</strong>
                <span>{link.attributionRuleId}</span>
              </div>
            </article>
          ))}
          {partnerReports.map((report) => (
            <article key={report.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge live">Report</span>
                <span className="admin-pill">{report.reportingWindow.label}</span>
              </div>
              <ChartNoAxesCombined aria-hidden="true" />
              <h3>{report.title}</h3>
              <p>{report.caveat}</p>
              <div className="feature-detail">
                <strong>Fixture commission</strong>
                <span>{formatMoney(report.fixtureMetrics.fixtureCommissionCents)} public-safe total</span>
              </div>
            </article>
          ))}
          <article className="feature-card compact-content-card">
            <div className="feature-card-top">
              <span className="status-badge live">Review only</span>
              <span className="admin-pill">{formatMoney(totalCommissionCents)}</span>
            </div>
            <BadgeDollarSign aria-hidden="true" />
            <h3>Commission evidence</h3>
            <p>These rows explain current commission status without making any commission payable.</p>
            <div className="feature-detail">
              <strong>Ledger rows</strong>
              <span>{partnerLedgers.length} public-safe fixture rows</span>
            </div>
          </article>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Payout readiness</p>
            <h2>Payout status is visible without account, tax, or Stripe data</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {payoutBatches.map((batch) => (
            <article key={batch.id} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge planned">{publicStatusLabel(batch.status)}</span>
                <span className="admin-pill">{blockedChecklistCount} blockers</span>
              </div>
              <ClipboardCheck aria-hidden="true" />
              <h3>{batch.preparationId}</h3>
              <p>{batch.caveat}</p>
              <div className="roadmap-detail">
                <strong>Eligible evidence</strong>
                <span>{batch.eligibleLedgerIds.length} ledger before final payout checks</span>
              </div>
              <div className="roadmap-detail">
                <strong>Still required</strong>
                <span>{batch.readinessChecklist.filter((item) => item.status !== "passed").map((item) => item.title).join(", ")}</span>
              </div>
            </article>
          ))}
          {reviewFlags.map((flag) => (
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

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Communication readiness</p>
            <h2>Notification status is visible before any partner send exists</h2>
          </div>
          <Link href="/admin/affiliates" className="text-link compact-link">
            Owner review
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Bell aria-hidden="true" />
            <h3>Partner send disabled</h3>
            <p>No recipient email, message body, send payload, provider message ID, or queue row is exposed or created here.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Fraud status redacted</h3>
            <p>Partners can see that review and enforcement status exists, without private fraud signals or buyer comparisons.</p>
          </div>
          <div>
            <BadgeDollarSign aria-hidden="true" />
            <h3>Payout execution pending</h3>
            <p>Stripe transfers, payout accounts, tax forms, payout receipts, and payable state remain outside this portal.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
