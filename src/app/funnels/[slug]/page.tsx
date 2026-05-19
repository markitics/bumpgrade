import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Database, GitBranch, PanelsTopLeft, ShieldCheck } from "lucide-react";

import { FunnelPageViewBeacon } from "@/components/funnel-page-view-beacon";
import { getPublishedD1FunnelBySlug } from "@/lib/funnel-drafts";
import { getFunnelBySlug, seededFunnels } from "@/lib/funnels";
import { site } from "@/lib/site";

type FunnelPreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return seededFunnels.map((funnel) => ({ slug: funnel.slug }));
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPublicFunnel(slug: string) {
  return getFunnelBySlug(slug) ?? (await getPublishedD1FunnelBySlug(slug));
}

export async function generateMetadata({ params }: FunnelPreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const funnel = await getPublicFunnel(slug);

  if (!funnel) return {};

  return {
    title: funnel.status === "published" ? funnel.title : `${funnel.title} Preview`,
    description: `${funnel.summary} This Bumpgrade funnel/page-builder route is tied to issue #${funnel.issue}.`,
    alternates: {
      canonical: `${site.url}${funnel.previewRoute}`,
    },
    openGraph: {
      title: `${funnel.title} preview`,
      description: funnel.summary,
      url: `${site.url}${funnel.previewRoute}`,
      type: "article",
    },
  };
}

export default async function FunnelPreviewPage({ params }: FunnelPreviewPageProps) {
  const { slug } = await params;
  const funnel = await getPublicFunnel(slug);

  if (!funnel) {
    notFound();
  }

  const published = funnel.status === "published";

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: published ? funnel.title : `${funnel.title} preview`,
    url: `${site.url}${funnel.previewRoute}`,
    description: funnel.summary,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    about: funnel.linkedFeatureIds,
  };

  return (
    <main className="route-page">
      <FunnelPageViewBeacon
        eventDefinitionId="event-funnel-page-view"
        experimentId="experiment-opt-in-hero-promise"
        sourceRoute={funnel.previewRoute}
        funnelId={funnel.id}
        steps={funnel.steps.map((step) => ({ stepId: step.id, routeAnchor: step.routeAnchor }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replaceAll("<", "\\u003c") }}
      />
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Funnel preview</p>
          <h1>{funnel.title}</h1>
          <p className="lede">{funnel.summary}</p>
          <div className="hero-actions">
            <Link href="/funnels/source-data" className="primary-action">
              Funnel JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${funnel.issue}`} className="secondary-action">
              Issue #{funnel.issue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="feature-status-panel" aria-label="Funnel preview status">
          <PanelsTopLeft aria-hidden="true" />
          <p>Status</p>
          <strong>{funnel.steps.length} steps</strong>
          <span>
            {published
              ? `Published D1 funnel. Revision ${funnel.revisionId} is public and readable by agents.`
              : `Draft preview only. Revision ${funnel.revisionId} is readable by agents, but writes stay disabled until confirmed-write contracts exist.`}
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Ordered steps</p>
            <h2>{published ? "Published funnel sequence" : "Three-step launch funnel scaffold"}</h2>
          </div>
          <Link href="/agent-docs/source-data" className="text-link compact-link">
            Agent manifest
            <Database aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid">
          {funnel.steps.map((step) => (
            <article key={step.id} id={step.routeAnchor} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge active">Step {step.order}</span>
                <span className="admin-pill">{step.kind.replaceAll("_", " ")}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.goal}</p>
              <div className="roadmap-detail">
                <strong>Step ID</strong>
                <span>{step.id}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Blocks</strong>
                <span>{step.blocks.map((block) => block.kind).join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Page blocks</p>
            <h2>Previewable blocks before a visual builder exists</h2>
          </div>
        </div>
        <div className="feature-grid">
          {funnel.steps.flatMap((step) =>
            step.blocks.map((block) => (
              <article key={block.id} className="feature-card compact-content-card">
                <div className="feature-card-top">
                  <span className={`status-badge ${block.agentEditable ? "planned" : "pending"}`}>
                    {block.agentEditable ? "Draftable" : "Locked"}
                  </span>
                  <span className="admin-pill">{step.title}</span>
                </div>
                <h3>{block.title}</h3>
                <p>{block.body}</p>
                <div className="feature-detail">
                  <strong>Block ID</strong>
                  <span>{block.id}</span>
                </div>
              </article>
            )),
          )}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Write boundary</p>
            <h2>This is a read contract, not a publishing surface.</h2>
          </div>
          <Link href="/agent-docs/bumpgrade-mcp" className="text-link compact-link">
            MCP roadmap
            <GitBranch aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Database aria-hidden="true" />
            <h3>Source data first</h3>
            <p>
              <code>/funnels/source-data</code> exposes funnel, step, block, revision, and write-boundary records.
            </p>
          </div>
          <div>
            <PanelsTopLeft aria-hidden="true" />
            <h3>Preview semantics</h3>
            <p>The funnel route is crawlable and semantic so browser agents can inspect it without private admin UI.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>{published ? "Published read surface" : "Confirmed writes later"}</h3>
            <p>{funnel.writeBoundary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
