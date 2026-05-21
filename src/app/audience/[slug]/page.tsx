import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Database, MailCheck, Send, ShieldCheck, Tags, Workflow } from "lucide-react";

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
  "Audience sends open only after verified consent, suppression checks, sender-domain readiness, provider safety, queue controls, and owner-confirmed audit evidence.";

export function generateStaticParams() {
  return audienceAutomationWorkspaces.map((workspace) => ({ slug: workspace.slug }));
}

export async function generateMetadata({ params }: AudienceAutomationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workspace = getAudienceAutomationWorkspaceBySlug(slug);

  if (!workspace) return {};

  return {
    title: workspace.title,
    description: `${workspace.summary} This Bumpgrade audience automation scaffold is tied to issue #${workspace.issue}.`,
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
        <span className="admin-pill">{sequence.status}</span>
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
        <span className="admin-pill">{automation.status}</span>
      </div>
      <Workflow aria-hidden="true" />
      <h3>{automation.title}</h3>
      <p>{automation.triggerEvent}</p>
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
            <Link href="/audience/source-data" className="primary-action">
              Audience JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${workspace.issue}`} className="secondary-action">
              Issue #{workspace.issue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Audience automation status">
          <Send aria-hidden="true" />
          <p>Status</p>
          <strong>{workspace.sequences.length} nurture sequence</strong>
          <span>
            Consent-backed opt-in capture, unsubscribe suppression evidence, CRM notes, broadcast readiness, footer safety,
            dry-run schedule intents, and queue readiness are live for the seeded waitlist; email sending stays disabled
            until confirmed-write APIs exist.
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
              <span className="admin-pill">{form.status}</span>
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
            <h2>Unsubscribe evidence is captured before any sends exist</h2>
          </div>
          <Link href={workspace.sourceDataRoute} className="text-link compact-link">
            Public contract
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid two-column-grid">
          <article className="feature-card compact-content-card">
            <div className="feature-card-top">
              <span className="status-badge planned">Unsubscribe</span>
              <span className="admin-pill">Issue #{workspace.unsubscribeManagement.issue}</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>No list-membership leak</h3>
            <p>{workspace.unsubscribeManagement.writeBoundary}</p>
            <div className="feature-detail">
              <strong>API route</strong>
              <span>{workspace.unsubscribeManagement.apiRoute}</span>
            </div>
            <div className="feature-detail">
              <strong>Public-safe fields</strong>
              <span>{workspace.unsubscribeManagement.publicSafeFields.length} fields</span>
            </div>
          </article>
          <AudienceUnsubscribeForm />
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Tags and segments</p>
            <h2>Subscribers are grouped only after consent and safe writes exist</h2>
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
                <span className="admin-pill">{segment.status}</span>
              </div>
              <Tags aria-hidden="true" />
              <h3>{segment.title}</h3>
              <p>{segment.definition}</p>
              <div className="feature-detail">
                <strong>Private data excluded</strong>
                <span>{segment.privateDataExcluded.length} fields</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Nurture path</p>
            <h2>Email sequences and automations are draft records, not sends</h2>
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
            <p className="eyebrow">Write boundary</p>
            <h2>Agents can inspect audience plans, not email subscribers.</h2>
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
              <code>/audience/source-data</code> exposes public-safe segment, opt-in form, tag, sequence, broadcast,
              automation, subscriber capture, suppression, CRM timeline, broadcast readiness, footer safety, and schedule intent records.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>No email send path</h3>
            <p>Consent, suppression, and readiness evidence are stored server-side, but provider IDs and private contact timelines stay out of public data.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Confirmed writes later</h3>
            <p>{publicAudienceAutomationBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
