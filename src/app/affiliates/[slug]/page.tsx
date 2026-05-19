import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeDollarSign, Database, Handshake, Link2, Scale, ShieldCheck, UserCheck } from "lucide-react";

import {
  affiliatePrograms,
  getAffiliateProgramBySlug,
  type CommissionLedgerFixture,
  type ReferralLink,
} from "@/lib/affiliate-referrals";
import { site } from "@/lib/site";

type AffiliatePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return affiliatePrograms.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: AffiliatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = getAffiliateProgramBySlug(slug);

  if (!program) return {};

  return {
    title: `${program.title} Preview`,
    description: `${program.summary} This is a read-only Bumpgrade affiliate/referral scaffold tied to issue #${program.issue}.`,
    alternates: {
      canonical: `${site.url}${program.previewRoute}`,
    },
    openGraph: {
      title: `${program.title} preview`,
      description: program.summary,
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
        <span className="status-badge planned">{link.status}</span>
        <span className="admin-pill">{link.code}</span>
      </div>
      <Link2 aria-hidden="true" />
      <h3>{link.publicUrlPattern}</h3>
      <p>
        Sends partner traffic to <code>{link.destinationRoute}</code> with source <code>{link.utmSource}</code>.
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
        <span className="status-badge pending">{ledger.status.replaceAll("_", " ")}</span>
        <span className="admin-pill">{formatMoney(ledger.commissionCents)}</span>
      </div>
      <BadgeDollarSign aria-hidden="true" />
      <h3>{ledger.id}</h3>
      <p>{ledger.reason}</p>
      <div className="roadmap-detail">
        <strong>Gross sale</strong>
        <span>{formatMoney(ledger.grossSaleCents)} fixture sale</span>
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
    name: `${program.title} preview`,
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
          <p className="eyebrow">Affiliate preview</p>
          <h1>{program.title}</h1>
          <p className="lede">{program.summary}</p>
          <div className="hero-actions">
            <Link href="/affiliates/source-data" className="primary-action">
              Affiliate JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${program.issue}`} className="secondary-action">
              Issue #{program.issue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Affiliate preview status">
          <Handshake aria-hidden="true" />
          <p>Status</p>
          <strong>{program.partners.length} partner records</strong>
          <span>
            Referral links, privacy-safe click capture, checkout attribution evidence, commission ledger fixtures, and
            payout review states are public-safe records; cookies, buyers, tax forms, and payout accounts stay disabled.
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
                <span className="status-badge planned">{partner.status}</span>
                <span className="admin-pill">{partner.referralLinkIds.length} links</span>
              </div>
              <UserCheck aria-hidden="true" />
              <h3>{partner.displayName}</h3>
              <p>{partner.publicProfile}</p>
              <div className="feature-detail">
                <strong>Private data excluded</strong>
                <span>{partner.privateDataExcluded.length} fields</span>
              </div>
            </article>
          ))}
          {program.commissionRules.slice(0, 2).map((rule) => (
            <article key={rule.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge pending">{rule.kind}</span>
                <span className="admin-pill">{rule.rateBps ? `${rule.rateBps / 100}%` : `${rule.holdDays}d hold`}</span>
              </div>
              <Scale aria-hidden="true" />
              <h3>{rule.title}</h3>
              <p>{rule.caveat}</p>
              <div className="feature-detail">
                <strong>Applies to</strong>
                <span>{rule.appliesToOfferIds.join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Commission ledger</p>
            <h2>Fixture commissions show approval, review, and reversal states</h2>
          </div>
          <Link href={program.linkedAnalyticsRoute} className="text-link compact-link">
            Analytics preview
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {program.commissionLedger.map((ledger) => (
            <LedgerCard key={ledger.id} ledger={ledger} />
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Payout review</p>
            <h2>Nothing pays out until refund windows and review flags are resolved</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          <article className="roadmap-card">
            <div className="roadmap-card-top">
              <span className="status-badge pending">{payoutBatch.status.replaceAll("_", " ")}</span>
              <span className="admin-pill">{formatMoney(payoutBatch.totalCommissionCents)}</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>{payoutBatch.id}</h3>
            <p>{payoutBatch.reviewBeforePayout.join(" ")}</p>
          </article>
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
            <p className="eyebrow">Write boundary</p>
            <h2>Agents can inspect partner fixtures and capture clicks, not create payable commissions.</h2>
          </div>
          <Link href="/agent-docs/source-data" className="text-link compact-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Database aria-hidden="true" />
            <h3>Source data first</h3>
            <p>
              <code>/affiliates/source-data</code> exposes public-safe partners, links, aggregate click and checkout
              attribution counts, rules, ledger fixtures, payout batches, review flags, and audit events.
            </p>
          </div>
          <div>
            <BadgeDollarSign aria-hidden="true" />
            <h3>No payout data</h3>
            <p>Tax forms, bank accounts, payout accounts, real buyer identities, Stripe customers, cookies, and IPs stay out of public data.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes later</h3>
            <p>{program.writeBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
