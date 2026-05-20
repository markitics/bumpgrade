import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Database,
  FileText,
  ListChecks,
  MailCheck,
  MailX,
  NotebookPen,
  Send,
  ShieldCheck,
  Tags,
  UsersRound,
  Workflow,
} from "lucide-react";

import { AdminLocked } from "@/components/admin-auth-gate";
import { AdminAudienceNoteForm } from "@/components/admin-audience-note-form";
import { AdminBroadcastDeliveryBatchForm } from "@/components/admin-broadcast-delivery-batch-form";
import { AdminBroadcastScheduleIntentForm } from "@/components/admin-broadcast-schedule-intent-form";
import { getCurrentAdminState } from "@/lib/admin-auth";
import {
  audienceBroadcastDeliveryBatchIssue,
  getAudienceBroadcastDeliveryBatchSummary,
  getAudienceBroadcastPreviewSafetySummary,
  getAudienceBroadcastQueueReadinessSummary,
  getAudienceBroadcastReadinessSummary,
  getAudienceBroadcastScheduleIntentSummary,
} from "@/lib/audience-broadcasts";
import { getAdminAudienceInspectionState } from "@/lib/audience-subscribers";

export const metadata: Metadata = {
  title: "Admin audience",
  description: "Owner-gated subscriber and audience inspection for Bumpgrade publishers.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sourceLabel(source: string) {
  if (source === "d1") return "D1 audience store";
  return "D1 unavailable";
}

function compactDate(value: string | null) {
  if (!value) return "None recorded";
  return value.replace("T", " ").replace(".000Z", " UTC");
}

export default async function AdminAudiencePage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/audience" />;

  const [
    state,
    broadcastReadiness,
    broadcastScheduleIntents,
    broadcastPreviewSafety,
    broadcastQueueReadiness,
    broadcastDeliveryBatches,
  ] = await Promise.all([
      getAdminAudienceInspectionState(),
      getAudienceBroadcastReadinessSummary(),
      getAudienceBroadcastScheduleIntentSummary(),
      getAudienceBroadcastPreviewSafetySummary(),
      getAudienceBroadcastQueueReadinessSummary(),
      getAudienceBroadcastDeliveryBatchSummary(),
    ]);

  return (
    <main className="roadmap-page admin-roadmap-page admin-audience-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin audience</p>
          <h1>Subscriber inspection without public contact leaks.</h1>
          <p className="lede">
            Owners can inspect the consent-backed waitlist subscribers, active tags, draft sequence enrollments,
            unsubscribe suppression totals, private CRM timeline notes, broadcast readiness, and dry-run schedule intents
            created by audience APIs. Preview safety, queue readiness, and delivery-batch dry runs are visible before
            delivery exists. Public source-data stays aggregate-only.
          </p>
          <div className="hero-actions">
            <Link href="/audience/source-data" className="primary-action">
              Audience JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href="https://github.com/markitics/bumpgrade/issues/137" className="secondary-action">
              Issue #137
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Audience subscriber status summary">
          <UsersRound aria-hidden="true" />
          <p>{sourceLabel(state.source)}</p>
          <strong>{state.counts.subscribers} subscribers</strong>
          <span>{state.loadError ?? "Owner-gated subscriber rows loaded from the audience opt-in tables."}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-proof-grid">
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Consent events</h3>
            <p>{state.counts.consentEvents} records, last consent {compactDate(state.lastConsentAt)}.</p>
          </div>
          <div>
            <Tags aria-hidden="true" />
            <h3>Tag assignments</h3>
            <p>{state.counts.tagAssignments} active or historical tag rows across the seeded waitlist model.</p>
          </div>
          <div>
            <Workflow aria-hidden="true" />
            <h3>Draft enrollments</h3>
            <p>{state.counts.sequenceEnrollments} sequence enrollment rows. Email delivery remains disabled.</p>
          </div>
          <div>
            <MailX aria-hidden="true" />
            <h3>Suppressions</h3>
            <p>
              {state.counts.activeSuppressionEntries} active suppression entries, last recorded{" "}
              {compactDate(state.lastSuppressionAt)}.
            </p>
          </div>
          <div>
            <NotebookPen aria-hidden="true" />
            <h3>CRM notes</h3>
            <p>
              {state.counts.activeTimelineEntries} active private timeline notes, last recorded{" "}
              {compactDate(state.lastTimelineAt)}.
            </p>
          </div>
          <div>
            <Send aria-hidden="true" />
            <h3>Broadcast readiness</h3>
            <p>
              {broadcastReadiness.counts.readyRecipients} ready recipients;{" "}
              {broadcastReadiness.counts.suppressedRecipients +
                broadcastReadiness.counts.unsubscribedRecipients +
                broadcastReadiness.counts.missingConsentRecipients}{" "}
              held before any send queue exists.
            </p>
          </div>
          <div>
            <CalendarClock aria-hidden="true" />
            <h3>Schedule intents</h3>
            <p>
              {broadcastScheduleIntents.counts.scheduleIntents} dry-run intent
              {broadcastScheduleIntents.counts.scheduleIntents === 1 ? "" : "s"} recorded;{" "}
              {broadcastScheduleIntents.counts.readyRecipientsReserved} ready recipients snapshotted.
            </p>
          </div>
          <div>
            <FileText aria-hidden="true" />
            <h3>Preview safety</h3>
            <p>
              {broadcastPreviewSafety.counts.previewSafetyRecords} preview record
              {broadcastPreviewSafety.counts.previewSafetyRecords === 1 ? "" : "s"};{" "}
              {broadcastPreviewSafety.counts.unsubscribeFooterRequiredRecords} require unsubscribe footer checks.
            </p>
          </div>
          <div>
            <ListChecks aria-hidden="true" />
            <h3>Queue readiness</h3>
            <p>
              {broadcastQueueReadiness.counts.queueReadinessRecords} queue contract
              {broadcastQueueReadiness.counts.queueReadinessRecords === 1 ? "" : "s"};{" "}
              {broadcastQueueReadiness.counts.providerSendEnabledRecords} provider-send records enabled.
            </p>
          </div>
          <div>
            <Send aria-hidden="true" />
            <h3>Delivery batches</h3>
            <p>
              {broadcastDeliveryBatches.counts.deliveryBatches} dry-run batch
              {broadcastDeliveryBatches.counts.deliveryBatches === 1 ? "" : "es"} recorded;{" "}
              {broadcastDeliveryBatches.counts.providerSendEnabledBatches} provider-send batches enabled.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Broadcast readiness</p>
            <h2>Draft sends stay blocked until readiness is explicit</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/171" className="text-link compact-link">
            Issue #171
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastReadiness.drafts.length > 0 ? (
            broadcastReadiness.drafts.map((draft) => (
              <article key={draft.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge pending">{draft.status}</span>
                  <span className="admin-pill">{draft.readyRecipientCount} ready</span>
                </div>
                <h3>{draft.title}</h3>
                <p>{draft.subjectIntent}</p>
                <div className="roadmap-detail">
                  <strong>Audience scope</strong>
                  <span>{draft.audienceScope}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Suppression policy</strong>
                  <span>{draft.suppressionPolicy}</span>
                </div>
                <div className="admin-step-list" aria-label={`${draft.title} broadcast readiness`}>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Readiness</span>
                        <strong>{draft.readyRecipientCount} eligible</strong>
                        <p>
                          {draft.excludedBySuppressionCount} suppressed, {draft.excludedByUnsubscribeCount} unsubscribed,{" "}
                          {draft.excludedByMissingConsentCount} missing consent. No send queue rows or provider message IDs
                          are created in this slice.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Approval</span>
                        <strong>Owner dry-run confirmation now available</strong>
                        <p>{draft.approvalBoundary}</p>
                      </div>
                    </div>
                  </div>
                  <AdminBroadcastScheduleIntentForm
                    draftId={draft.id}
                    expectedDraftUpdatedAt={draft.updatedAt}
                    expectedReadyRecipientCount={draft.readyRecipientCount}
                  />
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No draft</span>
                <span className="admin-pill">Issue #171</span>
              </div>
              <h3>No broadcast readiness rows</h3>
              <p>{broadcastReadiness.loadError ?? "Run the audience broadcast readiness migration to seed the draft."}</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Broadcast preview safety</p>
            <h2>Preview copy stays separate from delivery</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/175" className="text-link compact-link">
            Issue #175
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastPreviewSafety.records.length > 0 ? (
            broadcastPreviewSafety.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status}</span>
                  <span className="admin-pill">{record.senderDomainStatus.replaceAll("_", " ")}</span>
                </div>
                <h3>{record.subjectLine}</h3>
                <p>{record.previewText}</p>
                <div className="roadmap-detail">
                  <strong>Unsubscribe footer</strong>
                  <span>{record.unsubscribeFooterPolicy}</span>
                </div>
                <div className="admin-step-list" aria-label={`${record.subjectLine} preview safety`}>
                  {record.bodyOutline.map((item) => (
                    <div key={item} className="admin-step-editor">
                      <div className="admin-step-editor-heading">
                        <div>
                          <span>Preview section</span>
                          <strong>{item}</strong>
                          <p>No personalized body, recipient payload, queue row, or provider ID is created here.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No preview</span>
                <span className="admin-pill">Issue #175</span>
              </div>
              <h3>No preview safety records</h3>
              <p>{broadcastPreviewSafety.loadError ?? "Run the preview safety migration to seed the broadcast preview."}</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Delivery queue readiness</p>
            <h2>Queue gates are visible before producers exist</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/177" className="text-link compact-link">
            Issue #177
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastQueueReadiness.records.length > 0 ? (
            broadcastQueueReadiness.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status}</span>
                  <span className="admin-pill">{record.queueMode.replaceAll("_", " ")}</span>
                </div>
                <ListChecks aria-hidden="true" />
                <h3>{record.queueName}</h3>
                <p>{record.retryPolicy}</p>
                <div className="roadmap-detail">
                  <strong>Suppression check</strong>
                  <span>{record.suppressionCheckPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Unsubscribe footer</strong>
                  <span>{record.unsubscribeFooterCheckPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Sender gate</strong>
                  <span>{record.senderDomainGate.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Audit correlation</strong>
                  <span>{record.auditCorrelationPolicy}</span>
                </div>
                <p className="card-note">
                  Provider sends, recipient payloads, queue rows, and provider message IDs remain disabled in this slice.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No queue contract</span>
                <span className="admin-pill">Issue #177</span>
              </div>
              <h3>No queue readiness records</h3>
              <p>
                {broadcastQueueReadiness.loadError ??
                  "Run the queue readiness migration to seed delivery queue safety metadata."}
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Dry-run schedule intents</p>
            <h2>Owner intent is recorded before any delivery queue exists</h2>
          </div>
          <Link href="https://github.com/markitics/bumpgrade/issues/173" className="text-link compact-link">
            Issue #173
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastScheduleIntents.latestIntents.length > 0 ? (
            broadcastScheduleIntents.latestIntents.map((intent) => (
              <article key={intent.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{intent.status}</span>
                  <span className="admin-pill">{intent.readyRecipientCount} ready</span>
                </div>
                <h3>{intent.scheduleKind.replaceAll("_", " ")}</h3>
                <p>
                  Held recipients: {intent.heldRecipientCount}. Active suppression entries snapshotted:{" "}
                  {intent.activeSuppressionCount}.
                </p>
                <div className="roadmap-detail">
                  <strong>Draft</strong>
                  <span>{intent.draftId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Requested send</strong>
                  <span>{intent.requestedSendAt ?? "Not specified"}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Recorded</strong>
                  <span>{compactDate(intent.createdAt)}</span>
                </div>
                <AdminBroadcastDeliveryBatchForm
                  scheduleIntentId={intent.id}
                  draftId={intent.draftId}
                  expectedDraftUpdatedAt={intent.expectedDraftUpdatedAt}
                  expectedReadyRecipientCount={intent.readyRecipientCount}
                />
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No dry runs</span>
                <span className="admin-pill">Issue #173</span>
              </div>
              <h3>No schedule intents yet</h3>
              <p>
                Record a dry-run intent from the broadcast readiness card after checking the current readiness count.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Delivery-batch dry runs</p>
            <h2>Batch evidence is recorded before provider sends exist</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastDeliveryBatchIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastDeliveryBatchIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastDeliveryBatches.latestBatches.length > 0 ? (
            broadcastDeliveryBatches.latestBatches.map((batch) => (
              <article key={batch.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{batch.status}</span>
                  <span className="admin-pill">{batch.queueMode.replaceAll("_", " ")}</span>
                </div>
                <Send aria-hidden="true" />
                <h3>{batch.queueName}</h3>
                <p>
                  {batch.readyRecipientCount} ready recipients and {batch.heldRecipientCount} held recipients were
                  snapshotted after suppression and queue checks.
                </p>
                <div className="roadmap-detail">
                  <strong>Schedule intent</strong>
                  <span>{batch.scheduleIntentId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Unsubscribe footer</strong>
                  <span>{batch.unsubscribeFooterCheckStatus}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Sender gate</strong>
                  <span>{batch.senderDomainGateStatus.replaceAll("_", " ")}</span>
                </div>
                <p className="card-note">
                  Provider sends, recipient payloads, queue messages, personalized bodies, and provider message IDs
                  remain disabled.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No batches</span>
                <span className="admin-pill">Issue #{audienceBroadcastDeliveryBatchIssue}</span>
              </div>
              <h3>No delivery-batch dry runs yet</h3>
              <p>
                Record one from a current schedule intent after queue readiness and preview safety are present.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Recent subscribers</p>
            <h2>Private owner-only contact rows</h2>
          </div>
          <Link href="/audience/indie-launch-waitlist" className="text-link compact-link">
            Public opt-in
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {state.subscribers.length > 0 ? (
            state.subscribers.map((subscriber) => (
              <article key={subscriber.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{subscriber.status}</span>
                  <span className="admin-pill">{subscriber.consentCount} consent event{subscriber.consentCount === 1 ? "" : "s"}</span>
                </div>
                <h3>{subscriber.email}</h3>
                <p>{subscriber.firstName ? `First name: ${subscriber.firstName}` : "No first name captured."}</p>
                <div className="roadmap-detail">
                  <strong>Subscriber ID</strong>
                  <span>{subscriber.id}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Source form</strong>
                  <span>{subscriber.sourceFormId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Last consent</strong>
                  <span>{compactDate(subscriber.lastConsentedAt)}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Updated</strong>
                  <span>{compactDate(subscriber.updatedAt)}</span>
                </div>
                <div className="admin-step-list" aria-label={`${subscriber.email} audience state`}>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Tags</span>
                        <strong>{subscriber.tags.length || "None"}</strong>
                        <p>{subscriber.tags.map((tag) => tag.label).join(", ") || "No active tags recorded."}</p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Sequences</span>
                        <strong>{subscriber.sequences.length || "None"}</strong>
                        <p>
                          {subscriber.sequences
                            .map((sequence) => `${sequence.title} (${sequence.status})`)
                            .join(", ") || "No draft sequence enrollment recorded."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-step-editor">
                    <div className="admin-step-editor-heading">
                      <div>
                        <span>Timeline</span>
                        <strong>{subscriber.timelineNoteCount || "None"}</strong>
                        <p>
                          {subscriber.timelineEntries
                            .map((entry) => `${entry.body} (${compactDate(entry.createdAt)})`)
                            .join(" | ") || "No private CRM notes recorded."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <AdminAudienceNoteForm
                    subscriberId={subscriber.id}
                    expectedSubscriberStatus={subscriber.status}
                  />
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No rows</span>
                <span className="admin-pill">Issue #137</span>
              </div>
              <h3>No subscribers yet</h3>
              <p>Submit the public waitlist opt-in with consent, then refresh this owner page.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-proof-grid">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Owner gated</h3>
            <p>Contact identity appears only on this verified owner page. Public JSON keeps counts and redaction flags.</p>
          </div>
          <div>
            <Database aria-hidden="true" />
            <h3>Public-safe contract</h3>
            <p>{state.writeBoundary}</p>
          </div>
          <div>
            <UsersRound aria-hidden="true" />
            <h3>Excluded publicly</h3>
            <p>{state.privateFieldsExcluded.join(", ")}.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
