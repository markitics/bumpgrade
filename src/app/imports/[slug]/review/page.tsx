import type { Metadata } from "next";
import Link from "next/link";
import { headers as nextHeaders } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, ListChecks, LockKeyhole, Save, ShieldCheck } from "lucide-react";

import { createAuth } from "@/lib/auth";
import { loadCompetitorImportedDraftReview, type CompetitorImportPrivateRecord } from "@/lib/funnel-drafts";
import {
  getImporterBySlug,
  importerPrivateRecordExtractedFieldEditConfirmationText,
  importerPrivateRecordReviewActionApiRoute,
  importerPrivateRecordReviewConfirmationText,
  importerPrivateRecordReviewRoute,
  importerPlatforms,
} from "@/lib/importers";
import { getPublisherTenantD1OrThrow, type PublisherSessionUser } from "@/lib/publisher-tenants";
import { site } from "@/lib/site";

type ImporterReviewPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return importerPlatforms.map((platform) => ({ slug: platform.slug }));
}

export async function generateMetadata({ params }: ImporterReviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const platform = getImporterBySlug(slug);

  if (!platform) return {};

  return {
    title: `${platform.platformName} Import Review`,
    description: `Review private ${platform.platformName} import records before any buyer-facing go-live step.`,
    alternates: {
      canonical: `${site.url}${importerPrivateRecordReviewRoute(platform.slug)}`,
    },
  };
}

async function getSessionUser(): Promise<PublisherSessionUser | null> {
  const session = await createAuth()
    .api.getSession({
      headers: new Headers(await nextHeaders()),
    })
    .catch(() => null);
  const user = session?.user;

  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified === true,
  };
}

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function recordKindLabel(value: string) {
  return value.replace(/^draft_/, "").replaceAll("_", " ");
}

function confidenceLabel(record: CompetitorImportPrivateRecord) {
  if (record.recordConfidence === "recognized_export_match") return "Recognized export match";
  if (record.recordConfidence === "needs_more_context") return "Needs more context";
  return "Source guide";
}

function decisionLabel(record: CompetitorImportPrivateRecord) {
  if (record.reviewDecision === "ready") return "Ready for cleanup";
  if (record.reviewDecision === "needs_cleanup") return "Needs cleanup";
  return "Not reviewed yet";
}

function countSummary(record: CompetitorImportPrivateRecord) {
  return [
    `${record.sourceUrlCount} source ${record.sourceUrlCount === 1 ? "URL" : "URLs"}`,
    `${record.sourceFileNameCount} source ${record.sourceFileNameCount === 1 ? "file" : "files"}`,
    `${record.parsedExportFileCount} parsed ${record.parsedExportFileCount === 1 ? "export" : "exports"}`,
  ].join(" / ");
}

function extractedFieldStatusLabel(status: CompetitorImportPrivateRecord["extractedFields"][number]["status"]) {
  if (status === "ready_for_review") return "Ready for review";
  return "Needs context";
}

function inputId(recordId: string, fieldId: string, key: string) {
  return `${recordId}-${fieldId}-${key}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export default async function ImporterReviewPage({ params, searchParams }: ImporterReviewPageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : {};
  const platform = getImporterBySlug(slug);

  if (!platform) {
    notFound();
  }

  const draftId = firstSearchValue(search.draft) ?? firstSearchValue(search.importDraft) ?? "";
  const user = await getSessionUser();
  const callbackURL = `${importerPrivateRecordReviewRoute(platform.slug)}${draftId ? `?draft=${encodeURIComponent(draftId)}` : ""}`;

  if (!user) {
    redirect(`/login?callbackURL=${encodeURIComponent(callbackURL)}`);
  }

  let review: Awaited<ReturnType<typeof loadCompetitorImportedDraftReview>> | null = null;
  let reviewError = "";

  if (draftId && user.emailVerified) {
    try {
      const db = await getPublisherTenantD1OrThrow();
      review = await loadCompetitorImportedDraftReview(db, { userId: user.id, email: user.email }, {
        importerSlug: platform.slug,
        platformName: platform.platformName,
        draftId,
      });
    } catch (error) {
      reviewError = error instanceof Error ? error.message : "Unable to load that private import review.";
    }
  }

  const recognizedMatchIds = review?.importReview?.recognizedPlatformExportMatchIds ?? [];
  const recordReview = firstSearchValue(search.recordReview);
  const recordReviewError = firstSearchValue(search.recordReviewError);

  return (
    <main className="route-page importer-detail-page">
      <section className="route-hero">
        <div>
          <Link href={platform.route} className="back-link">
            <ArrowLeft aria-hidden="true" />
            {platform.platformName} importer
          </Link>
          <p className="eyebrow">Private importer review</p>
          <h1>Review the private records from your {platform.platformName} import.</h1>
          <p className="lede">
            Use these records to decide what needs cleanup before publishing, charging buyers, sending subscribers, connecting
            domains, or fulfilling access.
          </p>
          <div className="hero-actions">
            <Link href={platform.route} className="secondary-action">
              Back to importer
              <ArrowLeft aria-hidden="true" />
            </Link>
            <Link href="/pricing#go-live-gates" className="primary-action">
              Go-live gates
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel" aria-label={`${platform.platformName} private import review status`}>
          <LockKeyhole aria-hidden="true" />
          <p>Owner-only review</p>
          <strong>{review ? `${review.importRecords.length} records` : "Private records"}</strong>
          <span>Only the verified publisher who created the private import plan can inspect these records.</span>
        </aside>
      </section>

      <section className="content-band">
        {!draftId ? (
          <p className="account-error">Create a private import plan first, then open the review link from the importer success state.</p>
        ) : null}
        {!user.emailVerified ? (
          <p className="account-error">Confirm your email before reviewing private importer records.</p>
        ) : null}
        {reviewError ? <p className="account-error">{reviewError}</p> : null}
        {recordReviewError ? <p className="account-error">{recordReviewError}</p> : null}
        {recordReview === "ready" ? <p className="account-success">Private import record marked ready.</p> : null}
        {recordReview === "needs_cleanup" ? <p className="account-success">Private import record marked for cleanup.</p> : null}
        {recordReview === "field_saved" ? <p className="account-success">Private field edit saved.</p> : null}
        {review ? (
          <div className="feature-section-heading">
            <div>
              <p className="eyebrow">Private plan</p>
              <h2>{review.draft.title}</h2>
              <p>
                Draft status: <strong>{review.draft.status}</strong>. This review reads private import records only; it does not
                publish pages, run checkout, send subscribers, connect domains, or fulfill access.
              </p>
            </div>
            <Link href={platform.route} className="text-link compact-link">
              Start another import
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </section>

      {review ? (
        <section className="content-band alternate">
          <div className="split-heading">
            <div>
              <p className="eyebrow">Structured records</p>
              <h2>Check each area before the launch becomes buyer-facing.</h2>
            </div>
            <p>
              Recognized export matches: {recognizedMatchIds.length ? recognizedMatchIds.join(", ") : "none required for this plan"}.
            </p>
          </div>
          <div className="feature-grid">
            {review.importRecords.map((record) => (
              <article key={record.id} className="feature-card content-surface-card">
                <div className="feature-card-top">
                  <span className="status-badge active">{recordKindLabel(record.kind)}</span>
                </div>
                <FileText aria-hidden="true" />
                <h3>{record.title}</h3>
                <p>{record.summary}</p>
                <div className="feature-detail">
                  <strong>Review confidence</strong>
                  <span>{confidenceLabel(record)}</span>
                </div>
                <div className="feature-detail">
                  <strong>Owner decision</strong>
                  <span>{decisionLabel(record)}</span>
                </div>
                <div className="feature-detail">
                  <strong>Safe source counts</strong>
                  <span>{countSummary(record)}</span>
                </div>
                <div className="feature-detail">
                  <strong>Matched signals</strong>
                  <span>{record.matchedSignalLabels.length ? record.matchedSignalLabels.join(", ") : "No matched signals required."}</span>
                </div>
                <div className="feature-detail">
                  <strong>Prepared fields</strong>
                  <span>
                    {record.extractedFields.length
                      ? `${record.extractedFields.length} safe field ${record.extractedFields.length === 1 ? "target" : "targets"}`
                      : "No field targets prepared yet."}
                  </span>
                </div>
                {record.extractedFields.length ? (
                  <div className="importer-extracted-fields">
                    {record.extractedFields.map((field) => (
                      <div key={field.id} className="importer-extracted-field">
                        <ListChecks aria-hidden="true" />
                        <div>
                          <strong>{field.label}</strong>
                          <span>{extractedFieldStatusLabel(field.status)}</span>
                          <p>{field.reviewPrompt}</p>
                          <form className="importer-extracted-field-edit" action={importerPrivateRecordReviewActionApiRoute(platform.slug)} method="post">
                            <input type="hidden" name="action" value="edit_extracted_field" />
                            <input type="hidden" name="draftId" value={review.draft.id} />
                            <input type="hidden" name="recordId" value={record.id} />
                            <input type="hidden" name="fieldId" value={field.id} />
                            <input type="hidden" name="idempotencyKey" value={`field-${record.id}-${field.id}-${field.editedAt ?? record.updatedAt ?? "new"}`} />
                            <label htmlFor={inputId(record.id, field.id, "label")}>Field label</label>
                            <input
                              id={inputId(record.id, field.id, "label")}
                              name="fieldLabel"
                              type="text"
                              defaultValue={field.label}
                              maxLength={80}
                            />
                            <label htmlFor={inputId(record.id, field.id, "status")}>Review status</label>
                            <select id={inputId(record.id, field.id, "status")} name="fieldStatus" defaultValue={field.status}>
                              <option value="ready_for_review">Ready for review</option>
                              <option value="needs_context">Needs context</option>
                            </select>
                            <label htmlFor={inputId(record.id, field.id, "prompt")}>Review prompt</label>
                            <textarea
                              id={inputId(record.id, field.id, "prompt")}
                              name="fieldReviewPrompt"
                              defaultValue={field.reviewPrompt}
                              maxLength={220}
                              rows={3}
                            />
                            <button
                              type="submit"
                              className="secondary-action compact-action"
                              name="confirmationText"
                              value={importerPrivateRecordExtractedFieldEditConfirmationText(platform.platformName)}
                            >
                              <Save aria-hidden="true" />
                              Save field
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="feature-detail">
                  <strong>Go-live state</strong>
                  <span>Private review only; buyer-facing actions are still gated.</span>
                </div>
                <form className="importer-record-actions" action={importerPrivateRecordReviewActionApiRoute(platform.slug)} method="post">
                  <input type="hidden" name="draftId" value={review.draft.id} />
                  <input type="hidden" name="recordId" value={record.id} />
                  <input type="hidden" name="idempotencyKey" value={`ready-${record.id}-${record.updatedAt ?? "new"}`} />
                  <input type="hidden" name="decision" value="ready" />
                  <button
                    type="submit"
                    className="secondary-action compact-action"
                    name="confirmationText"
                    value={importerPrivateRecordReviewConfirmationText(platform.platformName, "ready")}
                  >
                    Mark ready
                  </button>
                </form>
                <form className="importer-record-actions" action={importerPrivateRecordReviewActionApiRoute(platform.slug)} method="post">
                  <input type="hidden" name="draftId" value={review.draft.id} />
                  <input type="hidden" name="recordId" value={record.id} />
                  <input type="hidden" name="idempotencyKey" value={`needs-cleanup-${record.id}-${record.updatedAt ?? "new"}`} />
                  <input type="hidden" name="decision" value="needs_cleanup" />
                  <button
                    type="submit"
                    className="secondary-action compact-action"
                    name="confirmationText"
                    value={importerPrivateRecordReviewConfirmationText(platform.platformName, "needs_cleanup")}
                  >
                    Needs cleanup
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Privacy boundary</p>
            <h2>The review shows safe structure, not private source material.</h2>
          </div>
        </div>
        <div className="feature-use-case-grid">
          <span>Raw export rows are not shown.</span>
          <span>Raw file text and file names are not shown.</span>
          <span>Private emails and customer values are not shown.</span>
          <span>Payment credentials and sessions are not imported.</span>
          <span>Publishing and checkout stay off until go-live approval.</span>
          <span>Subscriber sends, domains, and fulfillment stay gated.</span>
        </div>
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Same owner only</h3>
            <p>Review access is scoped to the verified publisher who created the private import plan.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Private checkpoint</h3>
            <p>This page saves private review metadata without creating buyer-facing state.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
