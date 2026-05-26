import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, FileUp, ShieldCheck } from "lucide-react";

import { ImporterDraftForm } from "@/components/importer-draft-form";
import {
  getImporterBySlug,
  importerDraftImportApiRoute,
  importerDraftImportConfirmationText,
  importerDraftPreviewApiRoute,
  importerDraftRollbackApiRoute,
  importerDraftRollbackConfirmationText,
  importerPlatforms,
} from "@/lib/importers";
import { site } from "@/lib/site";

type ImporterPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return importerPlatforms.map((platform) => ({ slug: platform.slug }));
}

export async function generateMetadata({ params }: ImporterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const platform = getImporterBySlug(slug);

  if (!platform) return {};

  return {
    title: `Import From ${platform.platformName}`,
    description: platform.summary,
    alternates: {
      canonical: `${site.url}${platform.route}`,
    },
    openGraph: {
      title: `Import from ${platform.platformName} | Bumpgrade`,
      description: platform.summary,
      url: `${site.url}${platform.route}`,
    },
  };
}

function statusLabel(status: string) {
  return status === "private-draft-live" ? "Private import ready" : "Dedicated path";
}

function publicEntityLabel(entity: string) {
  return entity.replace(/^draft_/, "").replaceAll("_", " ");
}

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ImporterPage({ params, searchParams }: ImporterPageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : {};
  const platform = getImporterBySlug(slug);

  if (!platform) {
    notFound();
  }

  const importDraftId = firstSearchValue(search.importDraft);
  const importRevision = firstSearchValue(search.importRevision);
  const rollbackConfirmationText = importerDraftRollbackConfirmationText(platform.platformName);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Bumpgrade ${platform.platformName} importer`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${site.url}${platform.route}`,
    description: platform.summary,
  };

  return (
    <main className="route-page importer-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="route-hero">
        <div>
          <Link href="/imports" className="back-link">
            <ArrowLeft aria-hidden="true" />
            Import center
          </Link>
          <p className="eyebrow">{platform.platformName} importer</p>
          <h1>{platform.headline}</h1>
          <p className="lede">{platform.summary}</p>
          <div className="hero-actions">
            <Link href="#start" className="primary-action">
              Start import map
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={platform.compareRoute} className="secondary-action">
              Compare {platform.platformName}
              <BadgeCheck aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel" aria-label={`${platform.platformName} importer status`}>
          <FileUp aria-hidden="true" />
          <p>{statusLabel(platform.status)}</p>
          <strong>{platform.platformName}</strong>
          <span>Import the useful context into a private workspace, then approve the launch when the pieces are ready.</span>
        </aside>
      </section>

      <section className="content-band alternate" id="start">
        <div className="split-heading">
          <div>
            <p className="eyebrow">What Bumpgrade looks for</p>
            <h2>Bring over the parts that shape the launch.</h2>
          </div>
          <p>{platform.bestFor}</p>
        </div>
        <div className="feature-grid">
          {platform.importableAreas.map((area) => (
            <article key={area.id} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge active">Review step</span>
              </div>
              <h3>{area.label}</h3>
              <p>{area.description}</p>
              <div className="feature-detail">
                <strong>Bumpgrade creates</strong>
                <span>{area.draftEntities.map(publicEntityLabel).join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">{platform.platformName} source guide</p>
            <h2>Bring the pieces Bumpgrade can actually use.</h2>
          </div>
          <p>Each item stays private until you approve a go-live step.</p>
        </div>
        <div className="feature-grid">
          {platform.sourceChecklist.map((item) => (
            <article key={item.id} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge active">Source item</span>
              </div>
              <h3>{item.label}</h3>
              <p>{item.bring}</p>
              <div className="feature-detail">
                <strong>Bumpgrade uses it for</strong>
                <span>{item.bumpgradeUsesItFor}</span>
              </div>
              <div className="feature-detail">
                <strong>Review before saving</strong>
                <span>{item.reviewBeforePrivatePlan}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Starting material</p>
            <h2>Use whichever path your old platform gives you.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          {platform.inputs.map((input) => (
            <div key={input.kind}>
              <FileUp aria-hidden="true" />
              <h3>{input.label}</h3>
              <p>{input.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Import review</p>
            <h2>Confirm the move before Bumpgrade creates private workspace records.</h2>
          </div>
        </div>
        <div className="feature-proof-grid">
          {platform.firstReviewSteps.map((step) => (
            <div key={step}>
              <ShieldCheck aria-hidden="true" />
              <h3>{step}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="content-band" id="private-draft">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Create a private import plan</p>
            <h2>Start the import without paying or going live.</h2>
          </div>
          <p>
            Paste the strongest page, offer, or follow-up material from {platform.platformName}. Bumpgrade saves it as a
            private Free Build plan so you can keep editing before any buyer-facing change.
          </p>
        </div>
        {firstSearchValue(search.importRollback) === "archived" ? (
          <p className="account-success">Private {platform.platformName} import plan archived. You can start a fresh import map now.</p>
        ) : null}
        {importDraftId && firstSearchValue(search.importRollback) !== "archived" ? (
          <p className="account-success">Private {platform.platformName} import plan created in your Free Build workspace.</p>
        ) : null}
        {firstSearchValue(search.importReview) === "saved" && firstSearchValue(search.importRollback) !== "archived" ? (
          <p className="account-success">Safe export review saved with the private import plan.</p>
        ) : null}
        {firstSearchValue(search.importRecords) === "saved" && firstSearchValue(search.importRollback) !== "archived" ? (
          <p className="account-success">Structured private import records are ready for review.</p>
        ) : null}
        {firstSearchValue(search.importError) ? (
          <p className="account-error">{firstSearchValue(search.importError)}</p>
        ) : null}
        {importDraftId && importRevision && firstSearchValue(search.importRollback) !== "archived" ? (
          <form action={importerDraftRollbackApiRoute(platform.slug)} method="post" className="importer-rollback-form">
            <input type="hidden" name="draftId" value={importDraftId} />
            <input type="hidden" name="expectedRevisionId" value={importRevision} />
            <input
              type="hidden"
              name="idempotencyKey"
              value={`${platform.slug}-rollback-${importDraftId}-${importRevision}`}
            />
            <label>
              Type this to archive the private import plan and start again: <strong>{rollbackConfirmationText}</strong>
              <input name="confirmationText" type="text" maxLength={80} required />
            </label>
            <button type="submit" className="secondary-action">
              Archive private import plan
            </button>
          </form>
        ) : null}
        <ImporterDraftForm
          action={importerDraftImportApiRoute(platform.slug)}
          confirmationText={importerDraftImportConfirmationText(platform.platformName)}
          platformName={platform.platformName}
          previewAction={importerDraftPreviewApiRoute(platform.slug)}
        />
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Not part of import</p>
            <h2>Some things stay separate on purpose.</h2>
          </div>
          <Link href="/pricing" className="text-link compact-link">
            Go-live pricing
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-use-case-grid">
          {platform.unsupportedNow.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
