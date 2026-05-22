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
  "Audience sends open only after verified consent, suppression checks, sender-domain readiness, provider safety, queue controls, and owner-confirmed audit evidence.";
const audiencePageDescription =
  "An audience workspace for opt-ins, lead magnets, segments, sequences, automations, and unsubscribe handling with consent first.";

function audienceStatusLabel(value: string) {
  if (value === "draft") return "Ready to review";
  return value.replaceAll("_", " ");
}

export function generateStaticParams() {
  return audienceAutomationWorkspaces.map((workspace) => ({ slug: workspace.slug }));
}

export async function generateMetadata({ params }: AudienceAutomationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workspace = getAudienceAutomationWorkspaceBySlug(slug);

  if (!workspace) return {};

  return {
    title: workspace.title,
    description: audiencePageDescription,
    alternates: {
      canonical: `${site.url}${workspace.previewRoute}`,
    },
    openGraph: {
      title: workspace.title,
      description: audiencePageDescription,
      url: `${site.url}${workspace.previewRoute}`,
      type: "article",
    },
  };
}

function SequenceCard({ sequence }: { sequence: EmailSequence }) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <span className="status-badge active">Sequence</span>
        <span className="admin-pill">{audienceStatusLabel(sequence.status)}</span>
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
        <span className="status-badge active">Automation</span>
        <span className="admin-pill">{audienceStatusLabel(automation.status)}</span>
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
    description: audiencePageDescription,
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
          <p className="lede">{audiencePageDescription}</p>
          <div className="hero-actions">
            <Link href={workspace.linkedFunnelRoute} className="primary-action">
              See the funnel
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={workspace.linkedProductRoute} className="secondary-action">
              View product access
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Audience automation status">
          <Send aria-hidden="true" />
          <p>Status</p>
          <strong>{workspace.sequences.length} nurture sequence</strong>
          <span>
            Consent-backed signup, unsubscribe handling, contact notes, broadcast checks, and message safety are grouped
            before any real subscriber sends.
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
              <span className="status-badge active">Lead magnet</span>
              <span className="admin-pill">{audienceStatusLabel(form.status)}</span>
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
          <Link href={workspace.linkedOfferRoute} className="text-link compact-link">
            Checkout offer
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-grid two-column-grid">
          <article className="feature-card compact-content-card">
            <div className="feature-card-top">
              <span className="status-badge active">Unsubscribe</span>
              <span className="admin-pill">Privacy-safe</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>No list-membership leak</h3>
            <p>Unsubscribe requests return a neutral response so no one can use the form to discover who is on a list.</p>
            <div className="feature-detail">
              <strong>Preference path</strong>
              <span>Unsubscribe preferences can be saved without revealing list membership.</span>
            </div>
            <div className="feature-detail">
              <strong>Private fields excluded</strong>
              <span>{workspace.unsubscribeManagement.publicSafeFields.length} public-safe fields shown</span>
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
                <span className="status-badge active">Segment</span>
                <span className="admin-pill">{audienceStatusLabel(segment.status)}</span>
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
            <h2>Email sequences and automations wait for readiness checks</h2>
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
            <p className="eyebrow">Privacy and safety</p>
            <h2>Audience planning stays useful without exposing subscriber data.</h2>
          </div>
          <Link href="/developers-and-agents" className="text-link compact-link">
            Developer details
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Tags aria-hidden="true" />
            <h3>Consent comes first</h3>
            <p>Segments, tags, sequences, and automations depend on explicit signup consent.</p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Email delivery checks</h3>
            <p>Consent, suppression, and readiness evidence are stored server-side, but provider IDs and private contact timelines stay out of public data.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Sends are protected</h3>
            <p>{publicAudienceAutomationBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
