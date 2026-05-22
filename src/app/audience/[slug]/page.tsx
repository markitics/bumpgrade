import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MailCheck, Send, ShieldCheck, Tags, Workflow } from "lucide-react";

import { AudienceOptInForm } from "@/components/audience-opt-in-form";
import { AudienceUnsubscribeForm } from "@/components/audience-unsubscribe-form";
import {
  audienceAutomationWorkspaces,
  getAudienceAutomationWorkspaceBySlug,
  type AutomationRule,
  type EmailSequence,
} from "@/lib/audience-automation";
import { site } from "@/lib/site";

type AudienceAutomationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const publicAudienceAutomationBoundary =
  "Audience sends should only go to people with consent, clean suppression status, and a message that has been checked.";

export function generateStaticParams() {
  return audienceAutomationWorkspaces.map((workspace) => ({ slug: workspace.slug }));
}

export async function generateMetadata({ params }: AudienceAutomationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workspace = getAudienceAutomationWorkspaceBySlug(slug);

  if (!workspace) return {};

  return {
    title: workspace.title,
    description: workspace.summary,
    alternates: {
      canonical: `${site.url}${workspace.previewRoute}`,
    },
    openGraph: {
      title: workspace.title,
      description: workspace.summary,
      url: `${site.url}${workspace.previewRoute}`,
      type: "article",
    },
  };
}

function SequenceCard({ sequence }: { sequence: EmailSequence }) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge planned">Sequence</span>
        <span className="admin-pill">Prepared</span>
      </div>
      <MailCheck aria-hidden="true" />
      <h3>{sequence.title}</h3>
      <p>{sequence.trigger}</p>
      <div className="roadmap-detail">
        <strong>Steps</strong>
        <span>{sequence.steps.length}</span>
      </div>
    </article>
  );
}

function AutomationCard({ automation }: { automation: AutomationRule }) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge planned">Automation</span>
        <span className="admin-pill">Prepared</span>
      </div>
      <Workflow aria-hidden="true" />
      <h3>{automation.title}</h3>
      <p>Runs when a consented opt-in is recorded.</p>
      <div className="roadmap-detail">
        <strong>Actions</strong>
        <span>{automation.actions.length}</span>
      </div>
    </article>
  );
}

export default async function AudienceAutomationPage({ params }: AudienceAutomationPageProps) {
  const { slug } = await params;
  const workspace = getAudienceAutomationWorkspaceBySlug(slug);

  if (!workspace) {
    notFound();
  }

  const form = workspace.forms[0];
  const leadMagnet = workspace.leadMagnets.find((item) => item.id === form.leadMagnetId);
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: workspace.title,
    url: `${site.url}${workspace.previewRoute}`,
    description: workspace.summary,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    about: ["email marketing", "lead magnets", "subscriber tags", "automations", "CRM"],
  };

  return (
    <main className="route-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Audience automation</p>
          <h1>{workspace.title}</h1>
          <p className="lede">{workspace.summary}</p>
          <div className="hero-actions">
            <Link href="/features/email-campaigns" className="primary-action">
              See email feature
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={workspace.linkedFunnelRoute} className="secondary-action">
              Open linked funnel
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Audience automation status">
          <Send aria-hidden="true" />
          <p>Status</p>
          <strong>{workspace.sequences.length} nurture sequence</strong>
          <span>
            Capture subscribers, store consent, manage suppression, prepare follow-up, and keep CRM context close to the
            launch.
          </span>
        </aside>
      </section>

      <section id={form.routeAnchor} className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Opt-in model</p>
            <h2>{form.title}</h2>
          </div>
          <Link href={workspace.linkedFunnelRoute} className="text-link compact-link">
            Linked funnel
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid two-column-grid">
          <article className="feature-card compact-content-card">
            <div className="feature-card-top">
              <span className="status-badge planned">Lead magnet</span>
              <span className="admin-pill">Opt-in</span>
            </div>
            <h3>{leadMagnet?.title ?? "Lead magnet"}</h3>
            <p>{leadMagnet?.deliveryPromise}</p>
            <div className="feature-detail">
              <strong>Form ID</strong>
              <span>{form.id}</span>
            </div>
            <div className="feature-detail">
              <strong>Consent</strong>
              <span>{form.consentStatement}</span>
            </div>
          </article>
          <AudienceOptInForm formId={form.id} consentStatement={form.consentStatement} />
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Suppression model</p>
            <h2>Honor unsubscribes before follow-up starts.</h2>
          </div>
          <Link href="/features/email-campaigns" className="text-link compact-link">
            Learn about campaigns
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid two-column-grid">
          <article className="feature-card compact-content-card">
            <div className="feature-card-top">
              <span className="status-badge planned">Unsubscribe</span>
              <span className="admin-pill">Suppression</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>Keep list membership private</h3>
            <p>People can unsubscribe without exposing whether an address is on a launch list.</p>
            <div className="feature-detail">
              <strong>Suppression type</strong>
              <span>Launch email follow-up</span>
            </div>
            <div className="feature-detail">
              <strong>Privacy</strong>
              <span>No public list membership lookup</span>
            </div>
          </article>
          <AudienceUnsubscribeForm />
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Tags and segments</p>
            <h2>Group subscribers by launch intent and consent.</h2>
          </div>
          <Link href={workspace.linkedOfferRoute} className="text-link compact-link">
            Checkout offer
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid">
          {workspace.segments.map((segment) => (
            <article key={segment.id} className="feature-card compact-content-card">
              <div className="feature-card-top">
                <span className="status-badge planned">Segment</span>
                <span className="admin-pill">Audience</span>
              </div>
              <Tags aria-hidden="true" />
              <h3>{segment.title}</h3>
              <p>{segment.definition}</p>
              <div className="feature-detail">
                <strong>Segment privacy</strong>
                <span>Private customer fields stay out of this public example.</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Nurture path</p>
            <h2>Email sequences and automations stay tied to the offer.</h2>
          </div>
          <Link href={workspace.linkedProductRoute} className="text-link compact-link">
            Product access
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {workspace.sequences.map((sequence) => (
            <SequenceCard key={sequence.id} sequence={sequence} />
          ))}
          {workspace.automations.map((automation) => (
            <AutomationCard key={automation.id} automation={automation} />
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Audience safety</p>
            <h2>Prepare campaigns without exposing private subscriber data.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Consent first</h3>
            <p>Opt-ins record consent and keep the follow-up path connected to the lead magnet and offer.</p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>No email send path</h3>
            <p>Consent, suppression, and campaign checks are visible; delivery credentials and private contact timelines stay private.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Checked sending</h3>
            <p>{publicAudienceAutomationBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
