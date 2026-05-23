import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Database,
  FileDown,
  FileUp,
  FileText,
  Gauge,
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
import { AdminAudienceImportIntentForm } from "@/components/admin-audience-import-intent-form";
import { AdminAudienceImportPreflightForm } from "@/components/admin-audience-import-preflight-form";
import { AdminAudienceNoteForm } from "@/components/admin-audience-note-form";
import { AdminBroadcastDeliveryBatchForm } from "@/components/admin-broadcast-delivery-batch-form";
import { AdminBroadcastDeliveryQueueMessageForm } from "@/components/admin-broadcast-delivery-queue-message-form";
import { AdminBroadcastDispatchAttemptForm } from "@/components/admin-broadcast-dispatch-attempt-form";
import { AdminBroadcastDispatchPreflightForm } from "@/components/admin-broadcast-dispatch-preflight-form";
import { AdminBroadcastScheduleIntentForm } from "@/components/admin-broadcast-schedule-intent-form";
import { AdminSequenceDeliveryBatchForm } from "@/components/admin-sequence-delivery-batch-form";
import { AdminSequenceDeliveryQueueMessageForm } from "@/components/admin-sequence-delivery-queue-message-form";
import { AdminSequenceDispatchAttemptForm } from "@/components/admin-sequence-dispatch-attempt-form";
import { AdminSequenceDispatchPreflightForm } from "@/components/admin-sequence-dispatch-preflight-form";
import { AdminSequenceQueueProducerReadinessForm } from "@/components/admin-sequence-queue-producer-readiness-form";
import { AdminSequenceScheduleIntentForm } from "@/components/admin-sequence-schedule-intent-form";
import { getCurrentAdminState } from "@/lib/admin-auth";
import {
  audienceBroadcastDeliveryBatchIssue,
  audienceBroadcastDeliveryQueueMessageIssue,
  audienceBroadcastDispatchAttemptIssue,
  audienceBroadcastDispatchPreflightIssue,
  audienceBroadcastProviderEventReadinessIssue,
  audienceBroadcastProviderRateLimitReadinessIssue,
  audienceBroadcastProviderResponseReadinessIssue,
  audienceBroadcastQueueConsumerReadinessIssue,
  audienceBroadcastQueueProducerReadinessIssue,
  audienceBroadcastSendPayloadReadinessIssue,
  audienceBroadcastSenderDomainReadinessIssue,
  getAudienceBroadcastDeliveryBatchSummary,
  getAudienceBroadcastDeliveryQueueMessageSummary,
  getAudienceBroadcastDispatchAttemptSummary,
  getAudienceBroadcastDispatchPreflightSummary,
  getAudienceBroadcastPreviewSafetySummary,
  getAudienceBroadcastProviderEventReadinessSummary,
  getAudienceBroadcastProviderRateLimitReadinessSummary,
  getAudienceBroadcastProviderResponseReadinessSummary,
  getAudienceBroadcastQueueConsumerReadinessSummary,
  getAudienceBroadcastQueueProducerReadinessSummary,
  getAudienceBroadcastQueueReadinessSummary,
  getAudienceBroadcastReadinessSummary,
  getAudienceBroadcastScheduleIntentSummary,
  getAudienceBroadcastSendPayloadReadinessSummary,
  getAudienceBroadcastSenderDomainReadinessSummary,
} from "@/lib/audience-broadcasts";
import { audienceExportReadinessIssue, getAudienceExportReadinessSummary } from "@/lib/audience-exports";
import {
  audienceImportIntentIssue,
  audienceImportPreflightIssue,
  getAudienceImportIntentSummary,
  getAudienceImportPreflightSummary,
} from "@/lib/audience-imports";
import {
  audienceSequenceDeliveryReadinessIssue,
  getAudienceSequenceDeliveryReadinessSummary,
} from "@/lib/audience-sequence-readiness";
import {
  audienceSequenceDeliveryBatchIssue,
  getAudienceSequenceDeliveryBatchSummary,
} from "@/lib/audience-sequence-delivery-batches";
import {
  audienceSequenceDeliveryQueueMessageIssue,
  getAudienceSequenceDeliveryQueueMessageSummary,
} from "@/lib/audience-sequence-delivery-queue-messages";
import {
  audienceSequenceDispatchPreflightIssue,
  getAudienceSequenceDispatchPreflightSummary,
} from "@/lib/audience-sequence-dispatch-preflights";
import {
  audienceSequenceDispatchAttemptIssue,
  getAudienceSequenceDispatchAttemptSummary,
} from "@/lib/audience-sequence-dispatch-attempts";
import {
  audienceSequenceQueueProducerReadinessIssue,
  getAudienceSequenceQueueProducerReadinessSummary,
} from "@/lib/audience-sequence-queue-producer-readiness";
import {
  audienceSequenceScheduleIntentIssue,
  getAudienceSequenceScheduleIntentSummary,
} from "@/lib/audience-sequence-schedule-intents";
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
    broadcastDeliveryQueueMessages,
    broadcastDispatchPreflights,
    broadcastDispatchAttempts,
    broadcastSenderDomainReadiness,
    broadcastProviderEventReadiness,
    broadcastProviderRateLimitReadiness,
    broadcastProviderResponseReadiness,
    broadcastSendPayloadReadiness,
    broadcastQueueProducerReadiness,
    broadcastQueueConsumerReadiness,
    audienceSequenceDeliveryReadiness,
    audienceSequenceScheduleIntents,
    audienceSequenceDeliveryBatches,
    audienceSequenceDeliveryQueueMessages,
    audienceSequenceDispatchPreflights,
    audienceSequenceDispatchAttempts,
    audienceSequenceQueueProducerReadiness,
    audienceExportReadiness,
    importIntents,
    importPreflights,
  ] = await Promise.all([
    getAdminAudienceInspectionState(),
    getAudienceBroadcastReadinessSummary(),
    getAudienceBroadcastScheduleIntentSummary(),
    getAudienceBroadcastPreviewSafetySummary(),
    getAudienceBroadcastQueueReadinessSummary(),
    getAudienceBroadcastDeliveryBatchSummary(),
    getAudienceBroadcastDeliveryQueueMessageSummary(),
    getAudienceBroadcastDispatchPreflightSummary(),
    getAudienceBroadcastDispatchAttemptSummary(),
    getAudienceBroadcastSenderDomainReadinessSummary(),
    getAudienceBroadcastProviderEventReadinessSummary(),
    getAudienceBroadcastProviderRateLimitReadinessSummary(),
    getAudienceBroadcastProviderResponseReadinessSummary(),
    getAudienceBroadcastSendPayloadReadinessSummary(),
    getAudienceBroadcastQueueProducerReadinessSummary(),
    getAudienceBroadcastQueueConsumerReadinessSummary(),
    getAudienceSequenceDeliveryReadinessSummary(),
    getAudienceSequenceScheduleIntentSummary(),
    getAudienceSequenceDeliveryBatchSummary(),
    getAudienceSequenceDeliveryQueueMessageSummary(),
    getAudienceSequenceDispatchPreflightSummary(),
    getAudienceSequenceDispatchAttemptSummary(),
    getAudienceSequenceQueueProducerReadinessSummary(),
    getAudienceExportReadinessSummary(),
    getAudienceImportIntentSummary(),
    getAudienceImportPreflightSummary(),
  ]);

  return (
    <main className="roadmap-page admin-roadmap-page admin-audience-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin audience</p>
          <h1>Subscriber inspection without public contact leaks.</h1>
          <p className="lede">
            Owners can inspect the consent-backed waitlist subscribers, active tags, draft sequence enrollments,
            unsubscribe suppression totals, private CRM timeline notes, broadcast readiness, dry-run schedule intents,
            delivery-batch dry runs, and dry-run queue-message evidence created by audience APIs. Preview safety and
            queue readiness stay visible before delivery exists, and dispatch preflight checks stay dry-run before
            Cloudflare Queue dispatch or provider sends are allowed. Dispatch attempt receipts prove the final handoff
            stays receipt-only before producers exist, and sender-domain readiness keeps live delivery blocked until
            SPF/DKIM/DMARC alignment evidence is explicit. Provider-event readiness keeps bounces and complaints
            redacted before provider webhooks exist. Provider rate-limit readiness keeps throttles, retries, and
            backpressure explicit before live sends. Provider response readiness keeps accepted, transient failure, and
            permanent failure handling explicit before response capture exists. Send-payload readiness keeps recipient
            identity, personalization, unsubscribe-footer, and audit boundaries explicit before payload creation exists.
            Queue producer readiness keeps the Cloudflare binding, payload dependency, idempotency, consumer, and audit
            gates explicit before any producer is enabled. Queue consumer readiness keeps ack, retry, dead-letter,
            idempotency, and provider-handoff gates explicit before any consumer is enabled. Import intents stay
            owner-confirmed and aggregate-only before any contact import exists. Import preflights prove aggregate
            eligibility, suppression, consent, and malformed-row checks before subscriber writes, exports, or delivery
            are allowed. Sequence delivery readiness shows aggregate step, ready-enrollment, paused, unsubscribed, and
            suppression counts before sequence scheduling or sends exist. Sequence schedule intents, delivery batches,
            queue-message dry runs, dispatch preflights, and dispatch attempt receipts record owner dry-run gates while
            queues, payloads, unsubscribe URLs, provider sends, responses, and provider IDs stay disabled. Sequence
            Queue producer readiness records the owner-reviewed producer handoff gate while Cloudflare producers and
            Queue messages remain disabled. Export readiness shows aggregate eligible, suppressed, unsubscribed, and
            paused-sequence counts before private CSV exports exist. Public source-data stays aggregate-only.
          </p>
          <div className="hero-actions">
            <Link href="/audience/source-data" className="primary-action">
              Audience JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceImportIntentIssue}`} className="secondary-action">
              Issue #{audienceImportIntentIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceImportPreflightIssue}`} className="secondary-action">
              Issue #{audienceImportPreflightIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceExportReadinessIssue}`} className="secondary-action">
              Issue #{audienceExportReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDeliveryReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{audienceSequenceDeliveryReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceScheduleIntentIssue}`}
              className="secondary-action"
            >
              Issue #{audienceSequenceScheduleIntentIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDeliveryBatchIssue}`}
              className="secondary-action"
            >
              Issue #{audienceSequenceDeliveryBatchIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDeliveryQueueMessageIssue}`}
              className="secondary-action"
            >
              Issue #{audienceSequenceDeliveryQueueMessageIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDispatchPreflightIssue}`}
              className="secondary-action"
            >
              Issue #{audienceSequenceDispatchPreflightIssue}
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
            <ListChecks aria-hidden="true" />
            <h3>Sequence readiness</h3>
            <p>
              {audienceSequenceDeliveryReadiness.counts.readyEnrollments} ready draft enrollments;{" "}
              {audienceSequenceDeliveryReadiness.counts.deliveryQueueRowsCreatedRecords} delivery queues created.
            </p>
          </div>
          <div>
            <CalendarClock aria-hidden="true" />
            <h3>Sequence intents</h3>
            <p>
              {audienceSequenceScheduleIntents.counts.scheduleIntents} dry-run intent
              {audienceSequenceScheduleIntents.counts.scheduleIntents === 1 ? "" : "s"} recorded;{" "}
              {audienceSequenceScheduleIntents.counts.readyEnrollmentsReserved} ready enrollments snapshotted.
            </p>
          </div>
          <div>
            <Send aria-hidden="true" />
            <h3>Sequence batches</h3>
            <p>
              {audienceSequenceDeliveryBatches.counts.deliveryBatches} dry-run batch
              {audienceSequenceDeliveryBatches.counts.deliveryBatches === 1 ? "" : "es"} recorded;{" "}
              {audienceSequenceDeliveryBatches.counts.deliveryQueueRowsCreatedBatches} delivery queue batches created.
            </p>
          </div>
          <div>
            <ListChecks aria-hidden="true" />
            <h3>Sequence queue messages</h3>
            <p>
              {audienceSequenceDeliveryQueueMessages.counts.dryRunRecords} dry-run record
              {audienceSequenceDeliveryQueueMessages.counts.dryRunRecords === 1 ? "" : "s"};{" "}
              {audienceSequenceDeliveryQueueMessages.counts.cloudflareQueueMessagesCreatedRecords} Cloudflare Queue
              dispatches.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Sequence preflights</h3>
            <p>
              {audienceSequenceDispatchPreflights.counts.dryRunPreflights} dry-run preflight
              {audienceSequenceDispatchPreflights.counts.dryRunPreflights === 1 ? "" : "s"};{" "}
              {audienceSequenceDispatchPreflights.counts.providerSendEnabledRecords} provider sends enabled.
            </p>
          </div>
          <div>
            <Send aria-hidden="true" />
            <h3>Sequence attempts</h3>
            <p>
              {audienceSequenceDispatchAttempts.counts.dryRunAttempts} dry-run receipt
              {audienceSequenceDispatchAttempts.counts.dryRunAttempts === 1 ? "" : "s"};{" "}
              {audienceSequenceDispatchAttempts.counts.cloudflareQueueMessagesCreatedRecords} Cloudflare Queue
              dispatches.
            </p>
          </div>
          <div>
            <Send aria-hidden="true" />
            <h3>Sequence producers</h3>
            <p>
              {audienceSequenceQueueProducerReadiness.counts.queueProducerReadinessRecords} producer-readiness record
              {audienceSequenceQueueProducerReadiness.counts.queueProducerReadinessRecords === 1 ? "" : "s"};{" "}
              {audienceSequenceQueueProducerReadiness.counts.cloudflareQueueProducerEnabledRecords} producers enabled.
            </p>
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
            <FileUp aria-hidden="true" />
            <h3>Import intents</h3>
            <p>
              {importIntents.counts.importIntents} intent
              {importIntents.counts.importIntents === 1 ? "" : "s"} recorded;{" "}
              {importIntents.counts.importRowsStoredRecords} raw import rows stored.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Import preflights</h3>
            <p>
              {importPreflights.counts.importPreflights} preflight
              {importPreflights.counts.importPreflights === 1 ? "" : "s"} recorded;{" "}
              {importPreflights.counts.subscriberRowsCreatedRecords} subscriber-write records created.
            </p>
          </div>
          <div>
            <FileDown aria-hidden="true" />
            <h3>Export readiness</h3>
            <p>
              {audienceExportReadiness.counts.exportEligibleSubscribers} export-eligible contacts;{" "}
              {audienceExportReadiness.counts.exportFilesCreatedRecords} export files created.
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
          <div>
            <ListChecks aria-hidden="true" />
            <h3>Queue messages</h3>
            <p>
              {broadcastDeliveryQueueMessages.counts.dryRunRecords} dry-run record
              {broadcastDeliveryQueueMessages.counts.dryRunRecords === 1 ? "" : "s"};{" "}
              {broadcastDeliveryQueueMessages.counts.cloudflareQueueMessagesCreatedRecords} Cloudflare Queue dispatches.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Dispatch preflights</h3>
            <p>
              {broadcastDispatchPreflights.counts.dryRunPreflights} preflight
              {broadcastDispatchPreflights.counts.dryRunPreflights === 1 ? "" : "s"} recorded;{" "}
              {broadcastDispatchPreflights.counts.providerSendEnabledRecords} provider-send records enabled.
            </p>
          </div>
          <div>
            <Send aria-hidden="true" />
            <h3>Dispatch attempts</h3>
            <p>
              {broadcastDispatchAttempts.counts.dryRunAttempts} attempt
              {broadcastDispatchAttempts.counts.dryRunAttempts === 1 ? "" : "s"} recorded;{" "}
              {broadcastDispatchAttempts.counts.providerResponsesCreatedRecords} provider responses created.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Sender domains</h3>
            <p>
              {broadcastSenderDomainReadiness.counts.senderDomainReadinessRecords} readiness record
              {broadcastSenderDomainReadiness.counts.senderDomainReadinessRecords === 1 ? "" : "s"};{" "}
              {broadcastSenderDomainReadiness.counts.providerSendEnabledRecords} provider-send records enabled.
            </p>
          </div>
          <div>
            <MailX aria-hidden="true" />
            <h3>Provider events</h3>
            <p>
              {broadcastProviderEventReadiness.counts.providerEventReadinessRecords} event-readiness record
              {broadcastProviderEventReadiness.counts.providerEventReadinessRecords === 1 ? "" : "s"};{" "}
              {broadcastProviderEventReadiness.counts.rawProviderPayloadsStoredRecords} raw payloads stored.
            </p>
          </div>
          <div>
            <Gauge aria-hidden="true" />
            <h3>Provider limits</h3>
            <p>
              {broadcastProviderRateLimitReadiness.counts.providerRateLimitReadinessRecords} rate-limit contract
              {broadcastProviderRateLimitReadiness.counts.providerRateLimitReadinessRecords === 1 ? "" : "s"};{" "}
              {broadcastProviderRateLimitReadiness.counts.providerSendEnabledRecords} provider-send records enabled.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Provider responses</h3>
            <p>
              {broadcastProviderResponseReadiness.counts.providerResponseReadinessRecords} response-readiness record
              {broadcastProviderResponseReadiness.counts.providerResponseReadinessRecords === 1 ? "" : "s"};{" "}
              {broadcastProviderResponseReadiness.counts.providerResponsesCreatedRecords} provider responses created.
            </p>
          </div>
          <div>
            <FileText aria-hidden="true" />
            <h3>Send payloads</h3>
            <p>
              {broadcastSendPayloadReadiness.counts.sendPayloadReadinessRecords} payload-readiness record
              {broadcastSendPayloadReadiness.counts.sendPayloadReadinessRecords === 1 ? "" : "s"};{" "}
              {broadcastSendPayloadReadiness.counts.recipientPayloadsCreatedRecords} recipient payloads created.
            </p>
          </div>
          <div>
            <Send aria-hidden="true" />
            <h3>Queue producers</h3>
            <p>
              {broadcastQueueProducerReadiness.counts.queueProducerReadinessRecords} producer-readiness record
              {broadcastQueueProducerReadiness.counts.queueProducerReadinessRecords === 1 ? "" : "s"};{" "}
              {broadcastQueueProducerReadiness.counts.cloudflareQueueProducerEnabledRecords} producers enabled.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Queue consumers</h3>
            <p>
              {broadcastQueueConsumerReadiness.counts.queueConsumerReadinessRecords} consumer-readiness record
              {broadcastQueueConsumerReadiness.counts.queueConsumerReadinessRecords === 1 ? "" : "s"};{" "}
              {broadcastQueueConsumerReadiness.counts.cloudflareQueueConsumerEnabledRecords} consumers enabled.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Sequence schedule intents</p>
            <h2>Owner sequence intent is recorded before any queue payload exists</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceScheduleIntentIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceSequenceScheduleIntentIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {audienceSequenceScheduleIntents.latestIntents.length > 0 ? (
            audienceSequenceScheduleIntents.latestIntents.map((intent) => (
              <article key={intent.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{intent.status}</span>
                  <span className="admin-pill">{intent.readyEnrollmentCount} ready</span>
                </div>
                <h3>{intent.scheduleKind.replaceAll("_", " ")}</h3>
                <p>
                  Held enrollments: {intent.heldEnrollmentCount}. Active suppression entries snapshotted:{" "}
                  {intent.activeSuppressionCount}.
                </p>
                <div className="roadmap-detail">
                  <strong>Sequence</strong>
                  <span>{intent.sequenceId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Requested start</strong>
                  <span>{intent.requestedStartAt ?? "Not specified"}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Delivery artifacts</strong>
                  <span>
                    {String(intent.recipientPayloadsCreated)} recipient payloads;{" "}
                    {String(intent.deliveryQueueRowsCreated)} queue rows
                  </span>
                </div>
                <div className="roadmap-detail">
                  <strong>Recorded</strong>
                  <span>{compactDate(intent.createdAt)}</span>
                </div>
                <AdminSequenceDeliveryBatchForm
                  scheduleIntentId={intent.id}
                  sequenceId={intent.sequenceId}
                  expectedWorkspaceRevisionId={intent.expectedWorkspaceRevisionId}
                  expectedSequenceStatus={intent.expectedSequenceStatus}
                  expectedReadyEnrollmentCount={intent.readyEnrollmentCount}
                />
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No dry runs</span>
                <span className="admin-pill">Issue #{audienceSequenceScheduleIntentIssue}</span>
              </div>
              <h3>No sequence schedule intents yet</h3>
              <p>
                Record a dry-run intent from the sequence readiness card after checking the current workspace revision
                and readiness count.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Sequence delivery batches</p>
            <h2>Dry-run sequence batches stay aggregate and unsent</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDeliveryBatchIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceSequenceDeliveryBatchIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {audienceSequenceDeliveryBatches.latestBatches.length > 0 ? (
            audienceSequenceDeliveryBatches.latestBatches.map((batch) => (
              <article key={batch.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{batch.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{batch.readyEnrollmentCount} ready</span>
                </div>
                <h3>{batch.queueName}</h3>
                <p>
                  Held enrollments: {batch.heldEnrollmentCount}. Active suppression entries snapshotted:{" "}
                  {batch.activeSuppressionCount}.
                </p>
                <div className="roadmap-detail">
                  <strong>Sequence</strong>
                  <span>{batch.sequenceId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Schedule intent</strong>
                  <span>{batch.scheduleIntentId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Queue mode</strong>
                  <span>{batch.queueMode}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Delivery artifacts</strong>
                  <span>
                    {String(batch.deliveryQueueRowsCreated)} queue rows; {String(batch.recipientPayloadsCreated)}{" "}
                    recipient payloads; {String(batch.providerMessageIdsIncluded)} provider IDs
                  </span>
                </div>
                <div className="roadmap-detail">
                  <strong>Recorded</strong>
                  <span>{compactDate(batch.createdAt)}</span>
                </div>
                <AdminSequenceDeliveryQueueMessageForm
                  deliveryBatchId={batch.id}
                  sequenceId={batch.sequenceId}
                  expectedWorkspaceRevisionId={batch.expectedWorkspaceRevisionId}
                  expectedSequenceStatus={batch.expectedSequenceStatus}
                  expectedReadyEnrollmentCount={batch.readyEnrollmentCount}
                />
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No dry runs</span>
                <span className="admin-pill">Issue #{audienceSequenceDeliveryBatchIssue}</span>
              </div>
              <h3>No sequence delivery batches yet</h3>
              <p>
                Record one from a sequence schedule-intent card after checking the current workspace revision, sequence
                status, and ready-enrollment count.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Sequence queue-message dry runs</p>
            <h2>Sequence queue evidence is recorded before Cloudflare dispatch</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDeliveryQueueMessageIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceSequenceDeliveryQueueMessageIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {audienceSequenceDeliveryQueueMessages.latestMessages.length > 0 ? (
            audienceSequenceDeliveryQueueMessages.latestMessages.map((message) => (
              <article key={message.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{message.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{message.dryRunMessageCount} messages</span>
                </div>
                <ListChecks aria-hidden="true" />
                <h3>{message.queueName}</h3>
                <p>{message.dispatchPolicy.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Sequence</strong>
                  <span>{message.sequenceId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Delivery batch</strong>
                  <span>{message.deliveryBatchId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Retry policy</strong>
                  <span>{message.retryPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Queue artifacts</strong>
                  <span>
                    {String(message.cloudflareQueueMessagesCreated)} Cloudflare messages;{" "}
                    {String(message.queuePayloadBodiesCreated)} payload bodies
                  </span>
                </div>
                <p className="card-note">
                  Cloudflare Queue dispatch, queue payload bodies, recipient payloads, personalized bodies,
                  unsubscribe URLs, provider sends, and provider message IDs remain disabled.
                </p>
                <AdminSequenceDispatchPreflightForm
                  deliveryQueueMessageId={message.id}
                  sequenceId={message.sequenceId}
                  expectedWorkspaceRevisionId={message.expectedWorkspaceRevisionId}
                  expectedSequenceStatus={message.expectedSequenceStatus}
                  expectedReadyEnrollmentCount={message.expectedReadyEnrollmentCount}
                />
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No queue messages</span>
                <span className="admin-pill">Issue #{audienceSequenceDeliveryQueueMessageIssue}</span>
              </div>
              <h3>No sequence queue-message dry runs yet</h3>
              <p>
                Record one from a current sequence delivery-batch card after dry-run queue gates and the current
                readiness count are checked.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Sequence dispatch preflight dry runs</p>
            <h2>Sequence dispatch gates are checked before Queue handoff</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDispatchPreflightIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceSequenceDispatchPreflightIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {audienceSequenceDispatchPreflights.latestPreflights.length > 0 ? (
            audienceSequenceDispatchPreflights.latestPreflights.map((preflight) => (
              <article key={preflight.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{preflight.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{preflight.dryRunMessageCount} messages</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{preflight.queueName}</h3>
                <p>{preflight.dispatchMode.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Sequence</strong>
                  <span>{preflight.sequenceId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Queue message</strong>
                  <span>{preflight.deliveryQueueMessageId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Provider limit</strong>
                  <span>{preflight.providerLimitPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Queue artifacts</strong>
                  <span>
                    {String(preflight.cloudflareQueueMessagesCreated)} Cloudflare messages;{" "}
                    {String(preflight.queuePayloadBodiesCreated)} payload bodies
                  </span>
                </div>
                <p className="card-note">
                  Provider sends, provider responses, Cloudflare Queue dispatch, queue payload bodies, delivery queue
                  rows, recipient payloads, personalized bodies, unsubscribe URLs, and provider message IDs remain
                  disabled.
                </p>
                <AdminSequenceDispatchAttemptForm
                  dispatchPreflightId={preflight.id}
                  sequenceId={preflight.sequenceId}
                  expectedWorkspaceRevisionId={preflight.expectedWorkspaceRevisionId}
                  expectedSequenceStatus={preflight.expectedSequenceStatus}
                  expectedReadyEnrollmentCount={preflight.expectedReadyEnrollmentCount}
                />
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No preflights</span>
                <span className="admin-pill">Issue #{audienceSequenceDispatchPreflightIssue}</span>
              </div>
              <h3>No sequence dispatch preflights yet</h3>
              <p>
                Record one from a current sequence queue-message card after provider-limit, sender-domain,
                unsubscribe, suppression, audit, and stale-state gates are checked.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Sequence dispatch attempt receipts</p>
            <h2>Sequence handoff stays receipt-only before Queue producers exist</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDispatchAttemptIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceSequenceDispatchAttemptIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {audienceSequenceDispatchAttempts.latestAttempts.length > 0 ? (
            audienceSequenceDispatchAttempts.latestAttempts.map((attempt) => (
              <article key={attempt.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{attempt.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{attempt.dryRunMessageCount} messages</span>
                </div>
                <Send aria-hidden="true" />
                <h3>{attempt.queueName}</h3>
                <p>{attempt.queueProducerMode.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Sequence</strong>
                  <span>{attempt.sequenceId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Dispatch preflight</strong>
                  <span>{attempt.dispatchPreflightId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Dispatch result</strong>
                  <span>{attempt.dispatchResultStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Queue artifacts</strong>
                  <span>No Cloudflare messages; no payload bodies</span>
                </div>
                <p className="card-note">
                  Dispatch attempt receipts are aggregate evidence only. Cloudflare Queue producers, queue payload
                  bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider
                  sends, responses, and message IDs remain disabled.
                </p>
                <AdminSequenceQueueProducerReadinessForm
                  dispatchAttemptId={attempt.id}
                  sequenceId={attempt.sequenceId}
                  expectedWorkspaceRevisionId={attempt.expectedWorkspaceRevisionId}
                  expectedSequenceStatus={attempt.expectedSequenceStatus}
                  expectedReadyEnrollmentCount={attempt.expectedReadyEnrollmentCount}
                />
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No attempts</span>
                <span className="admin-pill">Issue #{audienceSequenceDispatchAttemptIssue}</span>
              </div>
              <h3>No sequence dispatch attempt receipts yet</h3>
              <p>
                Record one from a current sequence dispatch preflight after Queue producer, provider, suppression,
                unsubscribe, sender-domain, audit, and stale-state gates are checked.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Sequence Queue producer readiness</p>
            <h2>Sequence producers stay disabled until payload and consumer gates pass</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceQueueProducerReadinessIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceSequenceQueueProducerReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {audienceSequenceQueueProducerReadiness.latestRecords.length > 0 ? (
            audienceSequenceQueueProducerReadiness.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.dryRunMessageCount} messages</span>
                </div>
                <Send aria-hidden="true" />
                <h3>Sequence producer handoff is readiness-only</h3>
                <p>{record.producerGateStatus.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Binding</strong>
                  <span>{record.producerBinding}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Dispatch attempt</strong>
                  <span>{record.dispatchAttemptId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Payload dependency</strong>
                  <span>{record.payloadDependencyStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Consumer dependency</strong>
                  <span>{record.consumerDependencyStatus.replaceAll("_", " ")}</span>
                </div>
                <p className="card-note">
                  Sequence Queue producer readiness records owner-reviewed handoff evidence only. Cloudflare Queue
                  producers, Queue messages, queue payload bodies, recipient payloads, personalized bodies,
                  unsubscribe URLs, provider sends, provider responses, and provider message IDs remain disabled.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No sequence producer readiness</span>
                <span className="admin-pill">Issue #{audienceSequenceQueueProducerReadinessIssue}</span>
              </div>
              <h3>No sequence Queue producer readiness records yet</h3>
              <p>
                Record one from a current sequence dispatch attempt after payload, consumer, provider, suppression,
                unsubscribe, sender-domain, audit, and stale-state gates are checked.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Audience import intents</p>
            <h2>Imports stay intent-only until contact writes are safe</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceImportIntentIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceImportIntentIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          <article className="roadmap-card active">
            <div className="roadmap-card-top">
              <span className="status-badge active">{importIntents.status.replaceAll("-", " ")}</span>
              <span className="admin-pill">No contact import</span>
            </div>
            <FileUp aria-hidden="true" />
            <h3>Record a non-destructive import request</h3>
            <p>{importIntents.writeBoundary}</p>
            <div className="roadmap-detail">
              <strong>Workspace</strong>
              <span>{importIntents.workspace.title}</span>
            </div>
            <div className="roadmap-detail">
              <strong>Revision</strong>
              <span>{importIntents.workspace.revisionId}</span>
            </div>
            <AdminAudienceImportIntentForm
              workspaceId={importIntents.workspace.id}
              workspaceTitle={importIntents.workspace.title}
              workspaceRevisionId={importIntents.workspace.revisionId}
              workspaceStatus={importIntents.workspace.status}
            />
          </article>
          {importIntents.latestIntents.length > 0 ? (
            importIntents.latestIntents.map((intent) => (
              <article key={intent.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{intent.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{intent.sourceKind.replaceAll("_", " ")}</span>
                </div>
                <h3>{intent.sourceLabel}</h3>
                <p>
                  {intent.estimatedContactCount} contacts estimated; {intent.estimatedNewContactCount} new,{" "}
                  {intent.estimatedUpdateCount} updates, {intent.estimatedSuppressedCount} suppressed.
                </p>
                <div className="roadmap-detail">
                  <strong>Private note</strong>
                  <span>{intent.privateNoteRecorded ? "hash recorded" : "none"}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Import rows</strong>
                  <span>{String(intent.importRowsStored)}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Email delivery</strong>
                  <span>{String(intent.emailDeliveryEnabled)}</span>
                </div>
                <p className="card-note">
                  Raw emails, raw contact rows, sequence enrollments, actor emails, and private notes are excluded from
                  public source-data.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No import intents</span>
                <span className="admin-pill">Issue #{audienceImportIntentIssue}</span>
              </div>
              <h3>No import intent records yet</h3>
              <p>
                Record one from this owner page after checking the current workspace revision and aggregate source
                counts.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Sequence delivery readiness</p>
            <h2>Nurture steps stay aggregate-only until scheduling is safe</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceSequenceDeliveryReadinessIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceSequenceDeliveryReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          <article className="roadmap-card active">
            <div className="roadmap-card-top">
              <span className="status-badge active">
                {audienceSequenceDeliveryReadiness.status.replaceAll("-", " ")}
              </span>
              <span className="admin-pill">No sequence sends</span>
            </div>
            <Workflow aria-hidden="true" />
            <h3>Draft nurture delivery readiness is aggregate-only</h3>
            <p>{audienceSequenceDeliveryReadiness.writeBoundary}</p>
            <div className="roadmap-detail">
              <strong>Steps</strong>
              <span>
                {audienceSequenceDeliveryReadiness.counts.sequenceSteps} total;{" "}
                {audienceSequenceDeliveryReadiness.counts.delayedSteps} delayed
              </span>
            </div>
            <div className="roadmap-detail">
              <strong>Ready enrollments</strong>
              <span>{audienceSequenceDeliveryReadiness.counts.readyEnrollments}</span>
            </div>
            <div className="roadmap-detail">
              <strong>Held enrollments</strong>
              <span>
                {audienceSequenceDeliveryReadiness.counts.pausedEnrollments} paused,{" "}
                {audienceSequenceDeliveryReadiness.counts.suppressedEnrollments} suppressed
              </span>
            </div>
            <div className="roadmap-detail">
              <strong>Delivery artifacts</strong>
              <span>
                {audienceSequenceDeliveryReadiness.counts.recipientPayloadsCreatedRecords} recipient payloads;{" "}
                {audienceSequenceDeliveryReadiness.counts.emailSendEnabledRecords} sends enabled
              </span>
            </div>
            <p className="card-note">
              Raw emails, subscriber IDs, body templates, unsubscribe URLs, queue payloads, recipient payloads,
              personalized bodies, actor emails, and provider message IDs are excluded from public source-data.
            </p>
          </article>
          {audienceSequenceDeliveryReadiness.records.map((record) => (
            <article key={record.id} className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">{record.status}</span>
                <span className="admin-pill">{record.stepCount} steps</span>
              </div>
              <h3>{record.title}</h3>
              <p>
                {record.immediateSteps} immediate step and {record.delayedSteps} delayed steps. Delivery remains
                disabled until confirmed send APIs exist.
              </p>
              <div className="roadmap-detail">
                <strong>Recipient payloads</strong>
                <span>{String(record.recipientPayloadsCreated)}</span>
              </div>
              <div className="roadmap-detail">
                <strong>Provider send</strong>
                <span>{String(record.providerSendEnabled)}</span>
              </div>
              <AdminSequenceScheduleIntentForm
                sequenceId={record.sequenceId}
                expectedWorkspaceRevisionId={audienceSequenceDeliveryReadiness.workspace.revisionId}
                expectedSequenceStatus={record.status}
                expectedReadyEnrollmentCount={audienceSequenceDeliveryReadiness.counts.readyEnrollments}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Audience export readiness</p>
            <h2>Private exports stay disabled until confirmed export APIs exist</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceExportReadinessIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceExportReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          <article className="roadmap-card active">
            <div className="roadmap-card-top">
              <span className="status-badge active">{audienceExportReadiness.status.replaceAll("-", " ")}</span>
              <span className="admin-pill">No export files</span>
            </div>
            <FileDown aria-hidden="true" />
            <h3>CSV export readiness is aggregate-only</h3>
            <p>{audienceExportReadiness.writeBoundary}</p>
            <div className="roadmap-detail">
              <strong>Eligible</strong>
              <span>{audienceExportReadiness.counts.exportEligibleSubscribers} contacts</span>
            </div>
            <div className="roadmap-detail">
              <strong>Held back</strong>
              <span>
                {audienceExportReadiness.counts.suppressedSubscribers} suppressed,{" "}
                {audienceExportReadiness.counts.unsubscribedSubscribers} unsubscribed
              </span>
            </div>
            <div className="roadmap-detail">
              <strong>Paused sequences</strong>
              <span>{audienceExportReadiness.counts.pausedSequenceSubscribers}</span>
            </div>
            <div className="roadmap-detail">
              <strong>Files</strong>
              <span>{audienceExportReadiness.counts.exportFilesCreatedRecords} created</span>
            </div>
            <p className="card-note">
              Raw emails, subscriber IDs, export object keys, export URLs, actor emails, suppression hashes, and private
              notes are excluded from public source-data.
            </p>
          </article>
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Audience import preflights</p>
            <h2>Preflights prove import safety before contact writes</h2>
          </div>
          <Link
            href={`https://github.com/markitics/bumpgrade/issues/${audienceImportPreflightIssue}`}
            className="text-link compact-link"
          >
            Issue #{audienceImportPreflightIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          <article className="roadmap-card active">
            <div className="roadmap-card-top">
              <span className="status-badge active">{importPreflights.status.replaceAll("-", " ")}</span>
              <span className="admin-pill">No subscriber writes</span>
            </div>
            <ShieldCheck aria-hidden="true" />
            <h3>Record an aggregate import preflight</h3>
            <p>{importPreflights.writeBoundary}</p>
            <div className="roadmap-detail">
              <strong>Workspace</strong>
              <span>{importPreflights.workspace.title}</span>
            </div>
            <div className="roadmap-detail">
              <strong>Available intents</strong>
              <span>{importIntents.latestIntents.length}</span>
            </div>
            <AdminAudienceImportPreflightForm
              workspaceId={importPreflights.workspace.id}
              workspaceTitle={importPreflights.workspace.title}
              workspaceRevisionId={importPreflights.workspace.revisionId}
              workspaceStatus={importPreflights.workspace.status}
              latestIntents={importIntents.latestIntents}
            />
            {importIntents.latestIntents.length === 0 ? (
              <p className="card-note">Record an import intent before creating preflight evidence.</p>
            ) : null}
          </article>
          {importPreflights.latestPreflights.length > 0 ? (
            importPreflights.latestPreflights.map((preflight) => (
              <article key={preflight.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{preflight.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{preflight.sourceKind.replaceAll("_", " ")}</span>
                </div>
                <h3>{preflight.expectedImportIntentSourceLabel}</h3>
                <p>
                  {preflight.totalContactsChecked} contacts checked; {preflight.eligibleNewContactCount} new,{" "}
                  {preflight.eligibleUpdateCount} updates, {preflight.duplicateCount} duplicates,{" "}
                  {preflight.suppressedCount} suppressed.
                </p>
                <div className="roadmap-detail">
                  <strong>Missing consent</strong>
                  <span>{preflight.missingConsentCount}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Malformed</strong>
                  <span>{preflight.malformedCount}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Subscriber rows</strong>
                  <span>{String(preflight.subscriberRowsCreated)}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Email delivery</strong>
                  <span>{String(preflight.emailDeliveryEnabled)}</span>
                </div>
                <p className="card-note">
                  Raw emails, import rows, subscriber writes, sequence enrollments, exports, actor emails, and private
                  notes are excluded from public source-data.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No import preflights</span>
                <span className="admin-pill">Issue #{audienceImportPreflightIssue}</span>
              </div>
              <h3>No import preflight records yet</h3>
              <p>
                Record a preflight after choosing an owner-confirmed import intent and checking aggregate eligibility,
                duplicate, suppression, consent, and malformed-row counts.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Send-payload readiness</p>
            <h2>Recipient payloads stay disabled before Queue producers</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastSendPayloadReadinessIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastSendPayloadReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastSendPayloadReadiness.records.length > 0 ? (
            broadcastSendPayloadReadiness.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.payloadScope.length} payload gates</span>
                </div>
                <FileText aria-hidden="true" />
                <h3>Payload body creation is still blocked</h3>
                <p>{record.personalizationBoundary}</p>
                <div className="roadmap-detail">
                  <strong>Recipient identity</strong>
                  <span>{record.recipientIdentityPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Unsubscribe footer</strong>
                  <span>{record.unsubscribeFooterPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Consent/suppression</strong>
                  <span>
                    {record.consentRecheckPolicy} {record.suppressionRecheckPolicy}
                  </span>
                </div>
                <div className="roadmap-detail">
                  <strong>Payload storage</strong>
                  <span>{record.payloadBodyStorage.replaceAll("_", " ")}</span>
                </div>
                <p className="card-note">
                  Recipient payloads, personalized bodies, raw payload bodies, Cloudflare Queue producers, provider
                  sends, provider responses, and provider message IDs remain disabled.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No send payloads</span>
                <span className="admin-pill">Issue #{audienceBroadcastSendPayloadReadinessIssue}</span>
              </div>
              <h3>No send-payload readiness records</h3>
              <p>
                {broadcastSendPayloadReadiness.loadError ??
                  "Run the send-payload readiness migration to seed payload-boundary metadata."}
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Queue producer readiness</p>
            <h2>Queue producers remain disabled until handoff gates pass</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastQueueProducerReadinessIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastQueueProducerReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastQueueProducerReadiness.records.length > 0 ? (
            broadcastQueueProducerReadiness.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">Delivery queue</span>
                </div>
                <Send aria-hidden="true" />
                <h3>Producer binding is readiness-only</h3>
                <p>{record.producerGateStatus.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Binding</strong>
                  <span>{record.producerBinding}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Payload dependency</strong>
                  <span>{record.payloadDependencyStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Consumer dependency</strong>
                  <span>{record.consumerDependencyStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Idempotency</strong>
                  <span>{record.idempotencyPolicy}</span>
                </div>
                <p className="card-note">
                  Cloudflare Queue producers, Queue messages, queue payload bodies, recipient payloads, provider sends,
                  provider responses, and provider message IDs remain disabled.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No producer readiness</span>
                <span className="admin-pill">Issue #{audienceBroadcastQueueProducerReadinessIssue}</span>
              </div>
              <h3>No Queue producer readiness records</h3>
              <p>
                {broadcastQueueProducerReadiness.loadError ??
                  "Run the Queue producer readiness migration to seed producer-boundary metadata."}
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Queue consumer readiness</p>
            <h2>Queue consumers stay disabled until ack and retry gates pass</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastQueueConsumerReadinessIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastQueueConsumerReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastQueueConsumerReadiness.records.length > 0 ? (
            broadcastQueueConsumerReadiness.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">Delivery queue</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>Consumer handoff is readiness-only</h3>
                <p>{record.consumerGateStatus.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Consumer</strong>
                  <span>{record.consumerName}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Producer dependency</strong>
                  <span>{record.producerDependencyStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Ack policy</strong>
                  <span>{record.ackPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Retry and dead letter</strong>
                  <span>
                    {record.retryPolicy} {record.deadLetterPolicy}
                  </span>
                </div>
                <div className="roadmap-detail">
                  <strong>Provider handoff</strong>
                  <span>{record.providerHandoffPolicy}</span>
                </div>
                <p className="card-note">
                  Cloudflare Queue consumers, Queue message consumption, acks, retry and dead-letter rows, queue
                  payload reads, recipient payloads, provider sends, provider responses, and provider message IDs remain
                  disabled.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No consumer readiness</span>
                <span className="admin-pill">Issue #{audienceBroadcastQueueConsumerReadinessIssue}</span>
              </div>
              <h3>No Queue consumer readiness records</h3>
              <p>
                {broadcastQueueConsumerReadiness.loadError ??
                  "Run the Queue consumer readiness migration to seed consumer-boundary metadata."}
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Provider response readiness</p>
            <h2>Provider responses stay redacted before live sends</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastProviderResponseReadinessIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastProviderResponseReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastProviderResponseReadiness.records.length > 0 ? (
            broadcastProviderResponseReadiness.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.providerName.replaceAll("_", " ")}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.responseStatusClasses.join(", ").replaceAll("_", " ")}</h3>
                <p>{record.providerResponseBoundary}</p>
                <div className="roadmap-detail">
                  <strong>Accepted</strong>
                  <span>{record.successResponsePolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Transient failure</strong>
                  <span>{record.transientFailurePolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Permanent failure</strong>
                  <span>{record.permanentFailurePolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Message IDs</strong>
                  <span>{record.messageIdStoragePolicy.replaceAll("_", " ")}</span>
                </div>
                <p className="card-note">
                  Provider responses, raw response bodies, provider message IDs, recipient payloads, Cloudflare Queue
                  producers, and provider sends remain disabled.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No provider responses</span>
                <span className="admin-pill">Issue #{audienceBroadcastProviderResponseReadinessIssue}</span>
              </div>
              <h3>No provider response readiness records</h3>
              <p>
                {broadcastProviderResponseReadiness.loadError ??
                  "Run the provider response readiness migration to seed response-handling metadata."}
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Provider rate-limit readiness</p>
            <h2>Provider throttles stay explicit before live sends</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastProviderRateLimitReadinessIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastProviderRateLimitReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastProviderRateLimitReadiness.records.length > 0 ? (
            broadcastProviderRateLimitReadiness.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.providerName.replaceAll("_", " ")}</span>
                </div>
                <Gauge aria-hidden="true" />
                <h3>{record.throttleWindow.replaceAll("_", " ")}</h3>
                <p>{record.providerLimitPolicy.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Daily limit</strong>
                  <span>{record.dailyLimitPolicy.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Burst limit</strong>
                  <span>{record.burstLimitPolicy.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Retry/backoff</strong>
                  <span>{record.retryBackoffPolicy.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Queue backpressure</strong>
                  <span>{record.queueBackpressurePolicy.replaceAll("_", " ")}</span>
                </div>
                <p className="card-note">
                  Provider sends, provider limit secrets, raw provider payloads, provider responses, provider message IDs,
                  recipient payloads, and Cloudflare Queue producers remain disabled.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No provider limits</span>
                <span className="admin-pill">Issue #{audienceBroadcastProviderRateLimitReadinessIssue}</span>
              </div>
              <h3>No provider rate-limit readiness records</h3>
              <p>
                {broadcastProviderRateLimitReadiness.loadError ??
                  "Run the provider rate-limit readiness migration to seed throttle and backoff metadata."}
              </p>
            </article>
          )}
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
            <p className="eyebrow">Provider-event readiness</p>
            <h2>Provider events stay redacted before live sends</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastProviderEventReadinessIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastProviderEventReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastProviderEventReadiness.records.length > 0 ? (
            broadcastProviderEventReadiness.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">{record.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.providerName.replaceAll("_", " ")}</span>
                </div>
                <MailX aria-hidden="true" />
                <h3>{record.eventKinds.join(", ")}</h3>
                <p>{record.providerEventBoundary}</p>
                <div className="roadmap-detail">
                  <strong>Bounces</strong>
                  <span>{record.bounceHandlingPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Complaints</strong>
                  <span>{record.complaintHandlingPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Suppression updates</strong>
                  <span>{record.suppressionUpdatePolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Payload storage</strong>
                  <span>{record.rawProviderPayloadStorage.replaceAll("_", " ")}</span>
                </div>
                <p className="card-note">
                  Provider sends, provider webhooks, raw provider payloads, provider responses, provider message IDs,
                  recipient payloads, and Cloudflare Queue producers remain disabled.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No provider events</span>
                <span className="admin-pill">Issue #{audienceBroadcastProviderEventReadinessIssue}</span>
              </div>
              <h3>No provider-event readiness records</h3>
              <p>
                {broadcastProviderEventReadiness.loadError ??
                  "Run the provider-event readiness migration to seed bounce and complaint handling metadata."}
              </p>
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

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Sender-domain readiness</p>
            <h2>Sending domains stay blocked before live delivery</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastSenderDomainReadinessIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastSenderDomainReadinessIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastSenderDomainReadiness.records.length > 0 ? (
            broadcastSenderDomainReadiness.records.map((record) => (
              <article key={record.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge pending">{record.status.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.domain}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.intendedFromAddress}</h3>
                <p>{record.fromAddressPolicy}</p>
                <div className="roadmap-detail">
                  <strong>SPF</strong>
                  <span>{record.spfAlignmentStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>DKIM</strong>
                  <span>{record.dkimAlignmentStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>DMARC</strong>
                  <span>{record.dmarcAlignmentStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Reply path</strong>
                  <span>{record.replyPathPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Bounce handling</strong>
                  <span>{record.bounceHandlingPolicy}</span>
                </div>
                <p className="card-note">
                  Provider sends, Cloudflare Queue producers, recipient payloads, provider responses, and provider
                  message IDs remain disabled until aligned sender evidence exists.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No sender domain</span>
                <span className="admin-pill">Issue #{audienceBroadcastSenderDomainReadinessIssue}</span>
              </div>
              <h3>No sender-domain readiness records</h3>
              <p>
                {broadcastSenderDomainReadiness.loadError ??
                  "Run the sender-domain readiness migration to seed delivery-domain gate metadata."}
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
                <AdminBroadcastDeliveryQueueMessageForm
                  deliveryBatchId={batch.id}
                  draftId={batch.draftId}
                  expectedDraftUpdatedAt={batch.expectedDraftUpdatedAt}
                  expectedReadyRecipientCount={batch.readyRecipientCount}
                />
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
            <p className="eyebrow">Queue-message dry runs</p>
            <h2>Queue evidence is recorded before Cloudflare dispatch</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastDeliveryQueueMessageIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastDeliveryQueueMessageIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastDeliveryQueueMessages.latestMessages.length > 0 ? (
            broadcastDeliveryQueueMessages.latestMessages.map((message) => (
              <article key={message.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">dry-run evidence</span>
                  <span className="admin-pill">{message.dryRunMessageCount} messages</span>
                </div>
                <ListChecks aria-hidden="true" />
                <h3>{message.queueName}</h3>
                <p>{message.dispatchPolicy.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Delivery batch</strong>
                  <span>{message.deliveryBatchId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Retry policy</strong>
                  <span>{message.retryPolicy}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Sender gate</strong>
                  <span>{message.senderDomainGateStatus.replaceAll("_", " ")}</span>
                </div>
                <p className="card-note">
                  Cloudflare Queue dispatch, recipient payloads, provider sends, personalized bodies, and provider
                  message IDs remain disabled.
                </p>
                <AdminBroadcastDispatchPreflightForm
                  deliveryQueueMessageId={message.id}
                  draftId={message.draftId}
                  expectedDraftUpdatedAt={message.expectedDraftUpdatedAt}
                  expectedReadyRecipientCount={message.expectedReadyRecipientCount}
                />
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No queue messages</span>
                <span className="admin-pill">Issue #{audienceBroadcastDeliveryQueueMessageIssue}</span>
              </div>
              <h3>No queue-message dry runs yet</h3>
              <p>
                Record one from a current delivery batch after dry-run queue gates and the current readiness count are
                checked.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Dispatch preflights</p>
            <h2>Provider and queue gates are checked before dispatch</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastDispatchPreflightIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastDispatchPreflightIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastDispatchPreflights.latestPreflights.length > 0 ? (
            broadcastDispatchPreflights.latestPreflights.map((preflight) => (
              <article key={preflight.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">dispatch preflight</span>
                  <span className="admin-pill">{preflight.dryRunMessageCount} messages</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{preflight.queueName}</h3>
                <p>{preflight.dispatchMode.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Queue-message record</strong>
                  <span>{preflight.deliveryQueueMessageId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Provider limit</strong>
                  <span>{preflight.providerLimitPolicy.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Rate limit window</strong>
                  <span>{preflight.providerRateLimitWindow.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Audit correlation</strong>
                  <span>{preflight.auditCorrelationPolicy}</span>
                </div>
                <p className="card-note">
                  Cloudflare Queue dispatch, recipient payloads, provider sends, personalized bodies, and provider
                  message IDs remain disabled after this preflight.
                </p>
                <AdminBroadcastDispatchAttemptForm
                  dispatchPreflightId={preflight.id}
                  draftId={preflight.draftId}
                  expectedDraftUpdatedAt={preflight.expectedDraftUpdatedAt}
                  expectedReadyRecipientCount={preflight.expectedReadyRecipientCount}
                />
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No preflight</span>
                <span className="admin-pill">Issue #{audienceBroadcastDispatchPreflightIssue}</span>
              </div>
              <h3>No dispatch preflight dry runs yet</h3>
              <p>
                Record one from a current queue-message dry run after provider-limit, sender-domain, suppression,
                unsubscribe, audit, and queue-dispatch gates are checked.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="roadmap-section-heading">
          <div>
            <p className="eyebrow">Dispatch attempts</p>
            <h2>Final handoff receipts stay dry-run before producers exist</h2>
          </div>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${audienceBroadcastDispatchAttemptIssue}`} className="text-link compact-link">
            Issue #{audienceBroadcastDispatchAttemptIssue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="roadmap-grid admin-record-grid">
          {broadcastDispatchAttempts.latestAttempts.length > 0 ? (
            broadcastDispatchAttempts.latestAttempts.map((attempt) => (
              <article key={attempt.id} className="roadmap-card active">
                <div className="roadmap-card-top">
                  <span className="status-badge active">dispatch attempt</span>
                  <span className="admin-pill">{attempt.dryRunMessageCount} messages</span>
                </div>
                <Send aria-hidden="true" />
                <h3>{attempt.queueName}</h3>
                <p>{attempt.queueProducerMode.replaceAll("_", " ")}</p>
                <div className="roadmap-detail">
                  <strong>Dispatch preflight</strong>
                  <span>{attempt.dispatchPreflightId}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Dispatch result</strong>
                  <span>{attempt.dispatchResultStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="roadmap-detail">
                  <strong>Provider responses</strong>
                  <span>{attempt.providerResponsesIncluded ? "included" : "excluded"}</span>
                </div>
                <p className="card-note">
                  Cloudflare Queue producers, queue payload bodies, recipient payloads, provider sends, provider
                  responses, and provider message IDs remain disabled after this receipt.
                </p>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No attempt receipt</span>
                <span className="admin-pill">Issue #{audienceBroadcastDispatchAttemptIssue}</span>
              </div>
              <h3>No dispatch attempt receipts yet</h3>
              <p>
                Record one from a current dispatch preflight after queue-producer, provider-response, suppression,
                unsubscribe, sender-domain, and audit gates are checked.
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
