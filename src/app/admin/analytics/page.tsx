import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Bell, Database, FlaskConical, MailCheck, ShieldCheck, Trophy } from "lucide-react";

import { AdminAnalyticsExperimentDecisionForm } from "@/components/admin-analytics-experiment-decision-form";
import { AdminAnalyticsWinnerRolloutForm } from "@/components/admin-analytics-winner-rollout-form";
import { AdminAnalyticsNotificationDispatchPreflightForm } from "@/components/admin-analytics-notification-dispatch-preflight-form";
import { AdminAnalyticsNotificationInboxForm } from "@/components/admin-analytics-notification-inbox-form";
import { AdminAnalyticsNotificationContentConsentReadinessForm } from "@/components/admin-analytics-notification-content-consent-readiness-form";
import { AdminAnalyticsNotificationDeliveryAttemptReadinessForm } from "@/components/admin-analytics-notification-delivery-attempt-readiness-form";
import { AdminAnalyticsNotificationDeliveryResultReadinessForm } from "@/components/admin-analytics-notification-delivery-result-readiness-form";
import { AdminAnalyticsNotificationDeliveryStatusWebhookReadinessForm } from "@/components/admin-analytics-notification-delivery-status-webhook-readiness-form";
import { AdminAnalyticsNotificationProviderPollingReadinessForm } from "@/components/admin-analytics-notification-provider-polling-readiness-form";
import { AdminAnalyticsNotificationReceiptPayloadReadinessForm } from "@/components/admin-analytics-notification-receipt-payload-readiness-form";
import { AdminAnalyticsNotificationDeliveryReceiptReadinessForm } from "@/components/admin-analytics-notification-delivery-receipt-readiness-form";
import { AdminAnalyticsNotificationProviderStatusReconciliationReadinessForm } from "@/components/admin-analytics-notification-provider-status-reconciliation-readiness-form";
import { AdminAnalyticsNotificationProviderCallReadinessForm } from "@/components/admin-analytics-notification-provider-call-readiness-form";
import { AdminAnalyticsNotificationQueueConsumerReadinessForm } from "@/components/admin-analytics-notification-queue-consumer-readiness-form";
import { AdminAnalyticsNotificationQueueProducerReadinessForm } from "@/components/admin-analytics-notification-queue-producer-readiness-form";
import { AdminAnalyticsNotificationSendPayloadReadinessForm } from "@/components/admin-analytics-notification-send-payload-readiness-form";
import { AdminAnalyticsNotificationProviderDomainReadinessForm } from "@/components/admin-analytics-notification-provider-domain-readiness-form";
import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import {
  analyticsExperimentDecisionIssue,
  getAnalyticsExperimentDecisionSummary,
} from "@/lib/analytics-experiment-decisions";
import {
  analyticsExperimentWinnerRolloutIssue,
  getAnalyticsExperimentWinnerRolloutSummary,
} from "@/lib/analytics-experiment-winner-rollouts";
import {
  analyticsNotificationInboxIssue,
  getAnalyticsNotificationInboxSummary,
} from "@/lib/analytics-notification-inbox";
import {
  analyticsNotificationDispatchPreflightIssue,
  getAnalyticsNotificationDispatchPreflightSummary,
} from "@/lib/analytics-notification-dispatch-preflights";
import {
  analyticsNotificationProviderDomainReadinessIssue,
  getAnalyticsNotificationProviderDomainReadinessSummary,
} from "@/lib/analytics-notification-provider-domain-readiness";
import {
  analyticsNotificationContentConsentReadinessIssue,
  getAnalyticsNotificationContentConsentReadinessSummary,
} from "@/lib/analytics-notification-content-consent-readiness";
import {
  analyticsNotificationSendPayloadReadinessIssue,
  getAnalyticsNotificationSendPayloadReadinessSummary,
} from "@/lib/analytics-notification-send-payload-readiness";
import {
  analyticsNotificationQueueProducerReadinessIssue,
  getAnalyticsNotificationQueueProducerReadinessSummary,
} from "@/lib/analytics-notification-queue-producer-readiness";
import {
  analyticsNotificationQueueConsumerReadinessIssue,
  getAnalyticsNotificationQueueConsumerReadinessSummary,
} from "@/lib/analytics-notification-queue-consumer-readiness";
import {
  analyticsNotificationProviderCallReadinessIssue,
  getAnalyticsNotificationProviderCallReadinessSummary,
} from "@/lib/analytics-notification-provider-call-readiness";
import {
  analyticsNotificationDeliveryAttemptReadinessIssue,
  getAnalyticsNotificationDeliveryAttemptReadinessSummary,
} from "@/lib/analytics-notification-delivery-attempt-readiness";
import {
  analyticsNotificationDeliveryResultReadinessIssue,
  getAnalyticsNotificationDeliveryResultReadinessSummary,
} from "@/lib/analytics-notification-delivery-result-readiness";
import {
  analyticsNotificationDeliveryStatusWebhookReadinessIssue,
  getAnalyticsNotificationDeliveryStatusWebhookReadinessSummary,
} from "@/lib/analytics-notification-delivery-status-webhook-readiness";
import {
  analyticsNotificationProviderPollingReadinessIssue,
  getAnalyticsNotificationProviderPollingReadinessSummary,
} from "@/lib/analytics-notification-provider-polling-readiness";
import {
  analyticsNotificationReceiptPayloadReadinessIssue,
  getAnalyticsNotificationReceiptPayloadReadinessSummary,
} from "@/lib/analytics-notification-receipt-payload-readiness";
import {
  analyticsNotificationDeliveryReceiptReadinessIssue,
  getAnalyticsNotificationDeliveryReceiptReadinessSummary,
} from "@/lib/analytics-notification-delivery-receipt-readiness";
import {
  analyticsNotificationProviderStatusReconciliationReadinessIssue,
  getAnalyticsNotificationProviderStatusReconciliationReadinessSummary,
} from "@/lib/analytics-notification-provider-status-reconciliation-readiness";

export const metadata: Metadata = {
  title: "Admin analytics",
  description: "Owner-gated analytics and experiment decision evidence for Bumpgrade publishers.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function compactDate(value: string | null) {
  if (!value) return "None recorded";
  return value.replace("T", " ").replace(".000Z", " UTC");
}

export default async function AdminAnalyticsPage() {
  const adminState = await getCurrentAdminState();
  if (!adminState.identity) return <AdminLocked state={adminState} surface="/admin/analytics" />;

  const summary = await getAnalyticsExperimentDecisionSummary();
  const winnerRolloutSummary = await getAnalyticsExperimentWinnerRolloutSummary();
  const notificationSummary = await getAnalyticsNotificationInboxSummary();
  const dispatchPreflightSummary = await getAnalyticsNotificationDispatchPreflightSummary();
  const providerDomainReadinessSummary = await getAnalyticsNotificationProviderDomainReadinessSummary();
  const contentConsentReadinessSummary = await getAnalyticsNotificationContentConsentReadinessSummary();
  const sendPayloadReadinessSummary = await getAnalyticsNotificationSendPayloadReadinessSummary();
  const queueProducerReadinessSummary = await getAnalyticsNotificationQueueProducerReadinessSummary();
  const queueConsumerReadinessSummary = await getAnalyticsNotificationQueueConsumerReadinessSummary();
  const providerCallReadinessSummary = await getAnalyticsNotificationProviderCallReadinessSummary();
  const deliveryAttemptReadinessSummary = await getAnalyticsNotificationDeliveryAttemptReadinessSummary();
  const deliveryResultReadinessSummary = await getAnalyticsNotificationDeliveryResultReadinessSummary();
  const deliveryStatusWebhookReadinessSummary = await getAnalyticsNotificationDeliveryStatusWebhookReadinessSummary();
  const providerPollingReadinessSummary = await getAnalyticsNotificationProviderPollingReadinessSummary();
  const receiptPayloadReadinessSummary = await getAnalyticsNotificationReceiptPayloadReadinessSummary();
  const deliveryReceiptReadinessSummary = await getAnalyticsNotificationDeliveryReceiptReadinessSummary();
  const providerStatusReconciliationReadinessSummary =
    await getAnalyticsNotificationProviderStatusReconciliationReadinessSummary();
  const latestDecision = summary.latestDecisions[0];
  const latestWinnerRollout = winnerRolloutSummary.latestRollouts[0];
  const latestNotification = notificationSummary.latestRecords[0];
  const latestDispatchPreflight = dispatchPreflightSummary.latestRecords[0];
  const latestProviderDomainReadiness = providerDomainReadinessSummary.latestRecords[0];
  const latestContentConsentReadiness = contentConsentReadinessSummary.latestRecords[0];
  const latestSendPayloadReadiness = sendPayloadReadinessSummary.latestRecords[0];
  const latestQueueProducerReadiness = queueProducerReadinessSummary.latestRecords[0];
  const latestQueueConsumerReadiness = queueConsumerReadinessSummary.latestRecords[0];
  const latestProviderCallReadiness = providerCallReadinessSummary.latestRecords[0];
  const latestDeliveryAttemptReadiness = deliveryAttemptReadinessSummary.latestRecords[0];
  const latestDeliveryResultReadiness = deliveryResultReadinessSummary.latestRecords[0];
  const latestDeliveryStatusWebhookReadiness = deliveryStatusWebhookReadinessSummary.latestRecords[0];
  const latestProviderPollingReadiness = providerPollingReadinessSummary.latestRecords[0];
  const latestReceiptPayloadReadiness = receiptPayloadReadinessSummary.latestRecords[0];
  const latestDeliveryReceiptReadiness = deliveryReceiptReadinessSummary.latestRecords[0];
  const latestProviderStatusReconciliationReadiness =
    providerStatusReconciliationReadinessSummary.latestRecords[0];

  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin analytics</p>
            <h1>Experiment winners need evidence and rollback.</h1>
          <p className="lede">
            Owners can inspect aggregate assignment counts, fixed-window conversion sample sizes, and sample-size
            caveats before recording experiment decisions, routing unmatched traffic to a winner, or rolling that route
            back. The evidence rows stay redacted and do not send email, enable Queue producers, create Queue messages,
            assign cookies, expose raw events, expose raw assignments, or make revenue claims.
          </p>
          <div className="hero-actions">
            <Link href="/analytics/source-data" className="primary-action">
              Analytics JSON
              <Database aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${analyticsExperimentDecisionIssue}`} className="secondary-action">
              Issue #{analyticsExperimentDecisionIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsExperimentWinnerRolloutIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsExperimentWinnerRolloutIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationInboxIssue}`} className="secondary-action">
              Issue #{analyticsNotificationInboxIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationDispatchPreflightIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationDispatchPreflightIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationProviderDomainReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationProviderDomainReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationContentConsentReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationContentConsentReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationSendPayloadReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationSendPayloadReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationQueueProducerReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationQueueProducerReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationQueueConsumerReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationQueueConsumerReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationProviderCallReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationProviderCallReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationDeliveryAttemptReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationDeliveryAttemptReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationDeliveryResultReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationDeliveryResultReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationDeliveryStatusWebhookReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationDeliveryStatusWebhookReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationProviderPollingReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationProviderPollingReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationReceiptPayloadReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationReceiptPayloadReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationDeliveryReceiptReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationDeliveryReceiptReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationProviderStatusReconciliationReadinessIssue}`}
              className="secondary-action"
            >
              Issue #{analyticsNotificationProviderStatusReconciliationReadinessIssue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="roadmap-status-panel" aria-label="Analytics decision status summary">
          <FlaskConical aria-hidden="true" />
          <p>{summary.source === "d1" ? "D1 decision evidence" : "D1 unavailable"}</p>
          <strong>{summary.counts.experimentDecisions} decisions</strong>
          <span>
            {summary.loadError ??
              notificationSummary.loadError ??
              dispatchPreflightSummary.loadError ??
              providerDomainReadinessSummary.loadError ??
              contentConsentReadinessSummary.loadError ??
              sendPayloadReadinessSummary.loadError ??
              queueProducerReadinessSummary.loadError ??
              queueConsumerReadinessSummary.loadError ??
              providerCallReadinessSummary.loadError ??
              deliveryAttemptReadinessSummary.loadError ??
              deliveryResultReadinessSummary.loadError ??
              deliveryStatusWebhookReadinessSummary.loadError ??
              providerPollingReadinessSummary.loadError ??
              receiptPayloadReadinessSummary.loadError ??
              deliveryReceiptReadinessSummary.loadError ??
              providerStatusReconciliationReadinessSummary.loadError ??
              winnerRolloutSummary.loadError ??
              "Owner-confirmed experiment and notification evidence loads from aggregate analytics."}
          </span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-proof-grid">
          <div>
            <BarChart3 aria-hidden="true" />
            <h3>Assignments</h3>
            <p>{summary.currentEvidenceByWindow[0]?.assignmentCount ?? 0} assignments in the default window.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Sample caveat</h3>
            <p>{summary.currentEvidenceByWindow[0]?.sampleSizeCaveat ?? "Sample-size caveat unavailable."}</p>
          </div>
          <div>
            <Trophy aria-hidden="true" />
            <h3>Winner rollout</h3>
            <p>
              {winnerRolloutSummary.counts.activeRollouts} active rollout;{" "}
              {winnerRolloutSummary.counts.rolledBackRollouts} rolled back.
            </p>
          </div>
          <div>
            <Bell aria-hidden="true" />
            <h3>Notification inbox</h3>
            <p>
              {notificationSummary.counts.notificationInboxRecords} owner inbox records;{" "}
              {notificationSummary.counts.emailSendEnabledRecords} email-send records.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Dispatch preflight</h3>
            <p>
              {dispatchPreflightSummary.counts.notificationDispatchPreflightRecords} dispatch preflights;{" "}
              {dispatchPreflightSummary.counts.queueDispatchEnabledRecords} queue-dispatch records.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Provider/domain</h3>
            <p>
              {providerDomainReadinessSummary.counts.notificationProviderDomainReadinessRecords} readiness records;{" "}
              {providerDomainReadinessSummary.counts.providerConfiguredRecords} provider-configured records.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Content/consent</h3>
            <p>
              {contentConsentReadinessSummary.counts.notificationContentConsentReadinessRecords} readiness records;{" "}
              {contentConsentReadinessSummary.counts.emailBodyIncludedRecords} email-body records.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Send payload</h3>
            <p>
              {sendPayloadReadinessSummary.counts.notificationSendPayloadReadinessRecords} readiness records;{" "}
              {sendPayloadReadinessSummary.counts.recipientPayloadCreatedRecords} recipient-payload records.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Queue producer</h3>
            <p>
              {queueProducerReadinessSummary.counts.notificationQueueProducerReadinessRecords} readiness records;{" "}
              {queueProducerReadinessSummary.counts.queueMessageCreatedRecords} queue-message records.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Queue consumer</h3>
            <p>
              {queueConsumerReadinessSummary.counts.notificationQueueConsumerReadinessRecords} readiness records;{" "}
              {queueConsumerReadinessSummary.counts.queueMessageConsumedRecords} consumed-message records.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Provider call</h3>
            <p>
              {providerCallReadinessSummary.counts.notificationProviderCallReadinessRecords} readiness records;{" "}
              {providerCallReadinessSummary.counts.providerCalledRecords} provider-called records.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Delivery attempt</h3>
            <p>
              {deliveryAttemptReadinessSummary.counts.notificationDeliveryAttemptReadinessRecords} readiness records;{" "}
              {deliveryAttemptReadinessSummary.counts.deliveryAttemptedRecords} delivery-attempt records.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Delivery result</h3>
            <p>
              {deliveryResultReadinessSummary.counts.notificationDeliveryResultReadinessRecords} readiness records;{" "}
              {deliveryResultReadinessSummary.counts.deliveryResultRecordedRecords} delivery-result records.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Status webhook</h3>
            <p>
              {deliveryStatusWebhookReadinessSummary.counts.notificationDeliveryStatusWebhookReadinessRecords} readiness
              records; {deliveryStatusWebhookReadinessSummary.counts.deliveryStatusWebhookRecordedRecords} webhook records.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Provider polling</h3>
            <p>
              {providerPollingReadinessSummary.counts.notificationProviderPollingReadinessRecords} readiness records;{" "}
              {providerPollingReadinessSummary.counts.providerPollingRecordedRecords} polling records.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Receipt payload</h3>
            <p>
              {receiptPayloadReadinessSummary.counts.notificationReceiptPayloadReadinessRecords} readiness records;{" "}
              {receiptPayloadReadinessSummary.counts.receiptPayloadRecordedRecords} payload records.
            </p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Delivery receipt</h3>
            <p>
              {deliveryReceiptReadinessSummary.counts.notificationDeliveryReceiptReadinessRecords} readiness records;{" "}
              {deliveryReceiptReadinessSummary.counts.deliveryReceiptRecordedRecords} receipt records.
            </p>
          </div>
          <div>
            <MailCheck aria-hidden="true" />
            <h3>Provider status</h3>
            <p>
              {
                providerStatusReconciliationReadinessSummary.counts
                  .notificationProviderStatusReconciliationReadinessRecords
              }{" "}
              readiness records;{" "}
              {
                providerStatusReconciliationReadinessSummary.counts
                  .providerStatusReconciliationRecordedRecords
              }{" "}
              reconciliation records.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Owner inbox</p>
            <h2>Record analytics notification evidence without sending email.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationInboxForm
          dashboardId={notificationSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={notificationSummary.readiness.dashboardRevisionId}
          readinessId={notificationSummary.readiness.id}
          readinessStatus={notificationSummary.readiness.status}
          channelId={notificationSummary.readiness.channelId}
          ownerReviewStatus={notificationSummary.readiness.ownerReviewStatus}
          alertThresholdCount={notificationSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={notificationSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Owner dispatch preflight</p>
            <h2>Record notification dispatch preflight without enabling delivery.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationDispatchPreflightForm
          dashboardId={dispatchPreflightSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={dispatchPreflightSummary.readiness.dashboardRevisionId}
          readinessId={dispatchPreflightSummary.readiness.id}
          readinessStatus={dispatchPreflightSummary.readiness.status}
          notificationInboxStatus={dispatchPreflightSummary.readiness.notificationInboxStatus}
          channelId={dispatchPreflightSummary.readiness.channelId}
          ownerReviewStatus={dispatchPreflightSummary.readiness.ownerReviewStatus}
          alertThresholdCount={dispatchPreflightSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={dispatchPreflightSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Provider and domain readiness</p>
            <h2>Record provider/domain readiness without configuring delivery.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationProviderDomainReadinessForm
          dashboardId={providerDomainReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={providerDomainReadinessSummary.readiness.dashboardRevisionId}
          readinessId={providerDomainReadinessSummary.readiness.id}
          readinessStatus={providerDomainReadinessSummary.readiness.status}
          notificationInboxStatus={providerDomainReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={
            providerDomainReadinessSummary.readiness.notificationDispatchPreflightStatus
          }
          channelId={providerDomainReadinessSummary.readiness.channelId}
          ownerReviewStatus={providerDomainReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={providerDomainReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={providerDomainReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Content and consent readiness</p>
            <h2>Record content/consent readiness without storing bodies or unsubscribe URLs.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationContentConsentReadinessForm
          dashboardId={contentConsentReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={contentConsentReadinessSummary.readiness.dashboardRevisionId}
          readinessId={contentConsentReadinessSummary.readiness.id}
          readinessStatus={contentConsentReadinessSummary.readiness.status}
          notificationInboxStatus={contentConsentReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={contentConsentReadinessSummary.readiness.notificationDispatchPreflightStatus}
          notificationProviderDomainReadinessStatus={
            contentConsentReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          channelId={contentConsentReadinessSummary.readiness.channelId}
          ownerReviewStatus={contentConsentReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={contentConsentReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={contentConsentReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Send-payload readiness</p>
            <h2>Record send-payload readiness without creating recipient payloads.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationSendPayloadReadinessForm
          dashboardId={sendPayloadReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={sendPayloadReadinessSummary.readiness.dashboardRevisionId}
          readinessId={sendPayloadReadinessSummary.readiness.id}
          readinessStatus={sendPayloadReadinessSummary.readiness.status}
          notificationInboxStatus={sendPayloadReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={sendPayloadReadinessSummary.readiness.notificationDispatchPreflightStatus}
          notificationProviderDomainReadinessStatus={
            sendPayloadReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationContentConsentReadinessStatus={
            sendPayloadReadinessSummary.readiness.notificationContentConsentReadinessStatus
          }
          channelId={sendPayloadReadinessSummary.readiness.channelId}
          ownerReviewStatus={sendPayloadReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={sendPayloadReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={sendPayloadReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Queue-producer readiness</p>
            <h2>Record queue-producer readiness without enabling Queue producers.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationQueueProducerReadinessForm
          dashboardId={queueProducerReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={queueProducerReadinessSummary.readiness.dashboardRevisionId}
          readinessId={queueProducerReadinessSummary.readiness.id}
          readinessStatus={queueProducerReadinessSummary.readiness.status}
          notificationInboxStatus={queueProducerReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={queueProducerReadinessSummary.readiness.notificationDispatchPreflightStatus}
          notificationProviderDomainReadinessStatus={
            queueProducerReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            queueProducerReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          channelId={queueProducerReadinessSummary.readiness.channelId}
          ownerReviewStatus={queueProducerReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={queueProducerReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={queueProducerReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Queue-consumer readiness</p>
            <h2>Record queue-consumer readiness without consuming Queue messages.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationQueueConsumerReadinessForm
          dashboardId={queueConsumerReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={queueConsumerReadinessSummary.readiness.dashboardRevisionId}
          readinessId={queueConsumerReadinessSummary.readiness.id}
          readinessStatus={queueConsumerReadinessSummary.readiness.status}
          notificationInboxStatus={queueConsumerReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={queueConsumerReadinessSummary.readiness.notificationDispatchPreflightStatus}
          notificationProviderDomainReadinessStatus={
            queueConsumerReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            queueConsumerReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationQueueProducerReadinessStatus={
            queueConsumerReadinessSummary.readiness.notificationQueueProducerReadinessStatus
          }
          channelId={queueConsumerReadinessSummary.readiness.channelId}
          ownerReviewStatus={queueConsumerReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={queueConsumerReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={queueConsumerReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Provider-call readiness</p>
            <h2>Record provider-call readiness without calling a provider.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationProviderCallReadinessForm
          dashboardId={providerCallReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={providerCallReadinessSummary.readiness.dashboardRevisionId}
          readinessId={providerCallReadinessSummary.readiness.id}
          readinessStatus={providerCallReadinessSummary.readiness.status}
          notificationInboxStatus={providerCallReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={providerCallReadinessSummary.readiness.notificationDispatchPreflightStatus}
          notificationProviderDomainReadinessStatus={
            providerCallReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            providerCallReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationQueueConsumerReadinessStatus={
            providerCallReadinessSummary.readiness.notificationQueueConsumerReadinessStatus
          }
          channelId={providerCallReadinessSummary.readiness.channelId}
          ownerReviewStatus={providerCallReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={providerCallReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={providerCallReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Delivery-attempt readiness</p>
            <h2>Record delivery-attempt readiness without attempting delivery.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationDeliveryAttemptReadinessForm
          dashboardId={deliveryAttemptReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={deliveryAttemptReadinessSummary.readiness.dashboardRevisionId}
          readinessId={deliveryAttemptReadinessSummary.readiness.id}
          readinessStatus={deliveryAttemptReadinessSummary.readiness.status}
          notificationInboxStatus={deliveryAttemptReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={deliveryAttemptReadinessSummary.readiness.notificationDispatchPreflightStatus}
          notificationProviderDomainReadinessStatus={
            deliveryAttemptReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            deliveryAttemptReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationProviderCallReadinessStatus={
            deliveryAttemptReadinessSummary.readiness.notificationProviderCallReadinessStatus
          }
          channelId={deliveryAttemptReadinessSummary.readiness.channelId}
          ownerReviewStatus={deliveryAttemptReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={deliveryAttemptReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={deliveryAttemptReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Delivery-result readiness</p>
            <h2>Record delivery-result readiness without creating provider results.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationDeliveryResultReadinessForm
          dashboardId={deliveryResultReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={deliveryResultReadinessSummary.readiness.dashboardRevisionId}
          readinessId={deliveryResultReadinessSummary.readiness.id}
          readinessStatus={deliveryResultReadinessSummary.readiness.status}
          notificationInboxStatus={deliveryResultReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={deliveryResultReadinessSummary.readiness.notificationDispatchPreflightStatus}
          notificationProviderDomainReadinessStatus={
            deliveryResultReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            deliveryResultReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationDeliveryAttemptReadinessStatus={
            deliveryResultReadinessSummary.readiness.notificationDeliveryAttemptReadinessStatus
          }
          channelId={deliveryResultReadinessSummary.readiness.channelId}
          ownerReviewStatus={deliveryResultReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={deliveryResultReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={deliveryResultReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Delivery-status webhook readiness</p>
            <h2>Record webhook readiness without processing status webhooks.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationDeliveryStatusWebhookReadinessForm
          dashboardId={deliveryStatusWebhookReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={deliveryStatusWebhookReadinessSummary.readiness.dashboardRevisionId}
          readinessId={deliveryStatusWebhookReadinessSummary.readiness.id}
          readinessStatus={deliveryStatusWebhookReadinessSummary.readiness.status}
          notificationInboxStatus={deliveryStatusWebhookReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={
            deliveryStatusWebhookReadinessSummary.readiness.notificationDispatchPreflightStatus
          }
          notificationProviderDomainReadinessStatus={
            deliveryStatusWebhookReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            deliveryStatusWebhookReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationDeliveryResultReadinessStatus={
            deliveryStatusWebhookReadinessSummary.readiness.notificationDeliveryResultReadinessStatus
          }
          channelId={deliveryStatusWebhookReadinessSummary.readiness.channelId}
          ownerReviewStatus={deliveryStatusWebhookReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={deliveryStatusWebhookReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={deliveryStatusWebhookReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Provider polling readiness</p>
            <h2>Record provider-polling readiness without polling providers.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationProviderPollingReadinessForm
          dashboardId={providerPollingReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={providerPollingReadinessSummary.readiness.dashboardRevisionId}
          readinessId={providerPollingReadinessSummary.readiness.id}
          readinessStatus={providerPollingReadinessSummary.readiness.status}
          notificationInboxStatus={providerPollingReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={
            providerPollingReadinessSummary.readiness.notificationDispatchPreflightStatus
          }
          notificationProviderDomainReadinessStatus={
            providerPollingReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            providerPollingReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationDeliveryStatusWebhookReadinessStatus={
            providerPollingReadinessSummary.readiness.notificationDeliveryStatusWebhookReadinessStatus
          }
          channelId={providerPollingReadinessSummary.readiness.channelId}
          ownerReviewStatus={providerPollingReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={providerPollingReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={providerPollingReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Receipt-payload readiness</p>
            <h2>Record receipt-payload readiness without storing provider payloads.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationReceiptPayloadReadinessForm
          dashboardId={receiptPayloadReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={receiptPayloadReadinessSummary.readiness.dashboardRevisionId}
          readinessId={receiptPayloadReadinessSummary.readiness.id}
          readinessStatus={receiptPayloadReadinessSummary.readiness.status}
          notificationInboxStatus={receiptPayloadReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={
            receiptPayloadReadinessSummary.readiness.notificationDispatchPreflightStatus
          }
          notificationProviderDomainReadinessStatus={
            receiptPayloadReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            receiptPayloadReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationProviderPollingReadinessStatus={
            receiptPayloadReadinessSummary.readiness.notificationProviderPollingReadinessStatus
          }
          channelId={receiptPayloadReadinessSummary.readiness.channelId}
          ownerReviewStatus={receiptPayloadReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={receiptPayloadReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={receiptPayloadReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Delivery-receipt readiness</p>
            <h2>Record delivery-receipt readiness without creating receipts.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationDeliveryReceiptReadinessForm
          dashboardId={deliveryReceiptReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={deliveryReceiptReadinessSummary.readiness.dashboardRevisionId}
          readinessId={deliveryReceiptReadinessSummary.readiness.id}
          readinessStatus={deliveryReceiptReadinessSummary.readiness.status}
          notificationInboxStatus={deliveryReceiptReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={
            deliveryReceiptReadinessSummary.readiness.notificationDispatchPreflightStatus
          }
          notificationProviderDomainReadinessStatus={
            deliveryReceiptReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            deliveryReceiptReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationReceiptPayloadReadinessStatus={
            deliveryReceiptReadinessSummary.readiness.notificationReceiptPayloadReadinessStatus
          }
          channelId={deliveryReceiptReadinessSummary.readiness.channelId}
          ownerReviewStatus={deliveryReceiptReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={deliveryReceiptReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={deliveryReceiptReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Provider-status reconciliation readiness</p>
            <h2>Record provider-status reconciliation readiness without reconciling provider statuses.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsNotificationProviderStatusReconciliationReadinessForm
          dashboardId={providerStatusReconciliationReadinessSummary.readiness.dashboardId}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={providerStatusReconciliationReadinessSummary.readiness.dashboardRevisionId}
          readinessId={providerStatusReconciliationReadinessSummary.readiness.id}
          readinessStatus={providerStatusReconciliationReadinessSummary.readiness.status}
          notificationInboxStatus={providerStatusReconciliationReadinessSummary.readiness.notificationInboxStatus}
          notificationDispatchPreflightStatus={
            providerStatusReconciliationReadinessSummary.readiness.notificationDispatchPreflightStatus
          }
          notificationProviderDomainReadinessStatus={
            providerStatusReconciliationReadinessSummary.readiness.notificationProviderDomainReadinessStatus
          }
          notificationSendPayloadReadinessStatus={
            providerStatusReconciliationReadinessSummary.readiness.notificationSendPayloadReadinessStatus
          }
          notificationDeliveryReceiptReadinessStatus={
            providerStatusReconciliationReadinessSummary.readiness.notificationDeliveryReceiptReadinessStatus
          }
          channelId={providerStatusReconciliationReadinessSummary.readiness.channelId}
          ownerReviewStatus={providerStatusReconciliationReadinessSummary.readiness.ownerReviewStatus}
          alertThresholdCount={providerStatusReconciliationReadinessSummary.readiness.alertThresholdCount}
          currentEvidenceByWindow={providerStatusReconciliationReadinessSummary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Confirmed write</p>
            <h2>Record experiment decision evidence with aggregate counts.</h2>
          </div>
          <Link href="/analytics/indie-launch-dashboard" className="text-link compact-link">
            Public analytics
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsExperimentDecisionForm
          dashboardId={summary.dashboard.id}
          dashboardTitle={summary.dashboard.title}
          dashboardRevisionId={summary.dashboard.revisionId}
          experimentId={summary.experiment.id}
          experimentTitle={summary.experiment.title}
          experimentStatus={summary.experiment.status}
          variants={summary.experiment.variants}
          currentEvidenceByWindow={summary.currentEvidenceByWindow}
        />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Winner rollout</p>
            <h2>Route unmatched traffic to a winner with rollback evidence.</h2>
          </div>
          <Link href="/analytics/source-data" className="text-link compact-link">
            Read rollout contract
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <AdminAnalyticsWinnerRolloutForm
          dashboardId={winnerRolloutSummary.dashboard.id}
          dashboardTitle={winnerRolloutSummary.dashboard.title}
          dashboardRevisionId={winnerRolloutSummary.dashboard.revisionId}
          experimentId={winnerRolloutSummary.experiment.id}
          experimentTitle={winnerRolloutSummary.experiment.title}
          experimentStatus={winnerRolloutSummary.experiment.status}
          variants={summary.experiment.variants}
          currentEvidenceByWindow={winnerRolloutSummary.currentEvidenceByWindow}
          activeRollout={winnerRolloutSummary.activeRollout}
        />
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest notifications</p>
            <h2>Inbox records hide recipients and email bodies.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestNotification ? (
            notificationSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">{record.recordKind.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <Bell aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  {record.expectedAlertThresholdCount} thresholds and {record.expectedConversionSampleSize} conversion
                  samples acknowledged at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No delivery</strong>
                  <span>
                    Email send {String(record.ownerEmailSendEnabled)}, queue dispatch{" "}
                    {String(record.queueDispatchEnabled)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Ready</span>
              </div>
              <Bell aria-hidden="true" />
              <h3>Notification inbox evidence is ready</h3>
              <p>Use the confirmed-write form once the owner has reviewed the notification readiness snapshot.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest dispatch preflights</p>
            <h2>Dispatch records hide recipients, bodies, provider IDs, and queue payloads.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestDispatchPreflight ? (
            dispatchPreflightSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationDispatchPreflightDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Inbox {record.inboxRecordId} checked with {record.expectedConversionSampleSize} conversion samples at{" "}
                  {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No dispatch</strong>
                  <span>
                    Email send {String(record.ownerEmailSendEnabled)}, queue dispatch{" "}
                    {String(record.queueDispatchEnabled)}, provider ID {String(record.providerMessageIdIncluded)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs inbox</span>
              </div>
              <MailCheck aria-hidden="true" />
              <h3>Dispatch preflight evidence is ready</h3>
              <p>Record a current notification inbox record before recording dispatch preflight evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest provider/domain readiness</p>
            <h2>Provider/domain records hide secrets, DNS credentials, recipients, bodies, and provider IDs.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestProviderDomainReadiness ? (
            providerDomainReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationProviderDomainReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Dispatch {record.dispatchPreflightId} checked with {record.expectedConversionSampleSize} conversion
                  samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No provider configuration</strong>
                  <span>
                    Provider configured {String(record.providerConfigured)}, provider called{" "}
                    {String(record.providerCalled)}, sender domain verified {String(record.senderDomainVerified)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs dispatch preflight</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>Provider/domain readiness evidence is ready</h3>
              <p>Record a current dispatch preflight before recording provider/domain readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest content/consent readiness</p>
            <h2>Content/consent records hide bodies, templates, unsubscribe URLs, provider IDs, and queue payloads.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestContentConsentReadiness ? (
            contentConsentReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationContentConsentReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Provider/domain {record.providerDomainReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No content payload</strong>
                  <span>
                    Body template reviewed {String(record.bodyTemplateReviewed)}, unsubscribe reviewed{" "}
                    {String(record.unsubscribeLinkReviewed)}, email body included {String(record.emailBodyIncluded)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs provider/domain</span>
              </div>
              <MailCheck aria-hidden="true" />
              <h3>Content/consent readiness evidence is ready</h3>
              <p>Record a current provider/domain readiness before recording content/consent readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest evidence</p>
            <h2>Decision records expose only public-safe metadata.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestDecision ? (
            summary.latestDecisions.map((decision) => (
              <article key={decision.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">{decision.decisionKind.replaceAll("_", " ")}</span>
                  <span className="admin-pill">{decision.timeWindowKey}</span>
                </div>
                <FlaskConical aria-hidden="true" />
                <h3>{decision.selectedVariantLabel ?? decision.experimentTitle}</h3>
                <p>
                  {decision.expectedAssignmentCount} assignments and {decision.expectedConversionSampleSize} conversion
                  samples acknowledged at {compactDate(decision.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No routing</strong>
                  <span>
                    Traffic routing {String(decision.trafficRoutingEnabled)}, automated winner{" "}
                    {String(decision.automatedWinnerEnabled)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Ready</span>
              </div>
              <FlaskConical aria-hidden="true" />
              <h3>Decision evidence is ready to record</h3>
              <p>Use the confirmed-write form once the owner has reviewed the aggregate experiment snapshot.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest winner rollout</p>
            <h2>Rollout records preserve rollback state and keep custom routing first.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestWinnerRollout ? (
            winnerRolloutSummary.latestRollouts.map((rollout) => (
              <article key={rollout.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className={`status-badge ${rollout.rolloutStatus === "active" ? "live" : "pending"}`}>
                    {rollout.rolloutStatus.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{rollout.timeWindowKey}</span>
                </div>
                <Trophy aria-hidden="true" />
                <h3>{rollout.selectedVariantLabel ?? rollout.selectedVariantId}</h3>
                <p>
                  {rollout.expectedAssignmentCount} assignments and {rollout.expectedConversionSampleSize} conversion
                  samples acknowledged at {compactDate(rollout.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>Routing state</strong>
                  <span>
                    Traffic routing {String(rollout.trafficRoutingEnabled)}, automated winner{" "}
                    {String(rollout.automatedWinnerEnabled)}, custom rules preserved{" "}
                    {String(rollout.customRoutingPreserved)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No rollout yet</span>
                <span className="admin-pill">Ready</span>
              </div>
              <Trophy aria-hidden="true" />
              <h3>Winner rollout is ready</h3>
              <p>Use the owner-confirmed form after reviewing aggregate assignments and sample-size caveats.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest send-payload readiness</p>
            <h2>Send-payload records hide recipient payloads, bodies, provider responses, and queue messages.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestSendPayloadReadiness ? (
            sendPayloadReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationSendPayloadReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Content/consent {record.contentConsentReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No send payload</strong>
                  <span>
                    Recipient payload {String(record.recipientPayloadCreated)}, queue message{" "}
                    {String(record.queueMessageCreated)}, provider response{" "}
                    {String(record.providerResponseCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs content/consent</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>Send-payload readiness evidence is ready</h3>
              <p>Record a current content/consent readiness before recording send-payload readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest queue-producer readiness</p>
            <h2>Queue-producer records keep Queue execution and payload creation disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestQueueProducerReadiness ? (
            queueProducerReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationQueueProducerReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Send-payload readiness {record.sendPayloadReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No Queue production</strong>
                  <span>
                    Queue producer {String(record.queueProducerEnabled)}, queue message{" "}
                    {String(record.queueMessageCreated)}, queue payload body{" "}
                    {String(record.queuePayloadBodyCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs send-payload</span>
              </div>
              <MailCheck aria-hidden="true" />
              <h3>Queue-producer readiness evidence is ready</h3>
              <p>Record a current send-payload readiness before recording queue-producer readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest queue-consumer readiness</p>
            <h2>Queue-consumer records keep message consumption, acks, and payload reads disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestQueueConsumerReadiness ? (
            queueConsumerReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationQueueConsumerReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Queue-producer readiness {record.queueProducerReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No Queue consumption</strong>
                  <span>
                    Queue consumer {String(record.queueConsumerEnabled)}, message consumed{" "}
                    {String(record.queueMessageConsumed)}, message acked {String(record.queueMessageAcknowledged)},
                    payload body read {String(record.queuePayloadBodyRead)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs queue-producer</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>Queue-consumer readiness evidence is ready</h3>
              <p>Record a current queue-producer readiness before recording queue-consumer readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest provider-call readiness</p>
            <h2>Provider-call records keep providers, sends, responses, and secrets disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestProviderCallReadiness ? (
            providerCallReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationProviderCallReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Queue-consumer readiness {record.queueConsumerReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No provider call</strong>
                  <span>
                    Provider send {String(record.providerSendEnabled)}, provider called{" "}
                    {String(record.providerCalled)}, provider response {String(record.providerResponseCreated)}, queue
                    consumer {String(record.queueConsumerEnabled)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs queue-consumer</span>
              </div>
              <MailCheck aria-hidden="true" />
              <h3>Provider-call readiness evidence is ready</h3>
              <p>Record a current queue-consumer readiness before recording provider-call readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest delivery-attempt readiness</p>
            <h2>Delivery-attempt records keep provider sends, responses, and message IDs disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestDeliveryAttemptReadiness ? (
            deliveryAttemptReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationDeliveryAttemptReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Provider-call readiness {record.providerCallReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No delivery attempt</strong>
                  <span>
                    Delivery enabled {String(record.deliveryAttemptEnabled)}, attempted{" "}
                    {String(record.deliveryAttempted)}, provider send {String(record.providerSendEnabled)}, response{" "}
                    {String(record.providerResponseCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs provider-call</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>Delivery-attempt readiness evidence is ready</h3>
              <p>Record a current provider-call readiness before recording delivery-attempt readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest delivery-result readiness</p>
            <h2>Delivery-result records keep provider responses, receipts, and status webhooks disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestDeliveryResultReadiness ? (
            deliveryResultReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationDeliveryResultReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Delivery-attempt readiness {record.deliveryAttemptReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No delivery result</strong>
                  <span>
                    Result enabled {String(record.deliveryResultEnabled)}, result recorded{" "}
                    {String(record.deliveryResultRecorded)}, provider send {String(record.providerSendEnabled)}, response{" "}
                    {String(record.providerResponseCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs delivery-attempt</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>Delivery-result readiness evidence is ready</h3>
              <p>Record a current delivery-attempt readiness before recording delivery-result readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest delivery-status webhook readiness</p>
            <h2>Status-webhook records keep receipts, payloads, polling, and webhook processing disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestDeliveryStatusWebhookReadiness ? (
            deliveryStatusWebhookReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationDeliveryStatusWebhookReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Delivery-result readiness {record.deliveryResultReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No webhook processing</strong>
                  <span>
                    Webhook enabled {String(record.deliveryStatusWebhookEnabled)}, webhook recorded{" "}
                    {String(record.deliveryStatusWebhookRecorded)}, provider response{" "}
                    {String(record.providerResponseCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs delivery-result</span>
              </div>
              <MailCheck aria-hidden="true" />
              <h3>Delivery-status webhook readiness evidence is ready</h3>
              <p>Record a current delivery-result readiness before recording status-webhook readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest provider-polling readiness</p>
            <h2>Provider-polling records keep polling execution, receipts, and provider responses disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestProviderPollingReadiness ? (
            providerPollingReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationProviderPollingReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Delivery-status-webhook readiness {record.deliveryStatusWebhookReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No provider polling</strong>
                  <span>
                    Polling enabled {String(record.providerPollingEnabled)}, polling recorded{" "}
                    {String(record.providerPollingRecorded)}, provider response {String(record.providerResponseCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs status-webhook</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>Provider-polling readiness evidence is ready</h3>
              <p>Record a current delivery-status-webhook readiness before recording provider-polling readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest receipt-payload readiness</p>
            <h2>Receipt-payload records keep payload capture, receipts, and provider responses disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestReceiptPayloadReadiness ? (
            receiptPayloadReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationReceiptPayloadReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Provider-polling readiness {record.providerPollingReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No receipt payloads</strong>
                  <span>
                    Receipt payload enabled {String(record.receiptPayloadEnabled)}, receipt payload recorded{" "}
                    {String(record.receiptPayloadRecorded)}, provider response {String(record.providerResponseCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs provider polling</span>
              </div>
              <MailCheck aria-hidden="true" />
              <h3>Receipt-payload readiness evidence is ready</h3>
              <p>Record a current provider-polling readiness before recording receipt-payload readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest delivery-receipt readiness</p>
            <h2>Delivery-receipt records keep receipt creation and provider payloads disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestDeliveryReceiptReadiness ? (
            deliveryReceiptReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationDeliveryReceiptReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <ShieldCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Receipt-payload readiness {record.receiptPayloadReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No delivery receipts</strong>
                  <span>
                    Delivery receipt enabled {String(record.deliveryReceiptEnabled)}, delivery receipt recorded{" "}
                    {String(record.deliveryReceiptRecorded)}, provider response {String(record.providerResponseCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs receipt payload</span>
              </div>
              <ShieldCheck aria-hidden="true" />
              <h3>Delivery-receipt readiness evidence is ready</h3>
              <p>Record a current receipt-payload readiness before recording delivery-receipt readiness evidence.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Latest provider-status reconciliation readiness</p>
            <h2>Provider-status reconciliation records keep provider polling and status processing disabled.</h2>
          </div>
        </div>
        <div className="roadmap-grid">
          {latestProviderStatusReconciliationReadiness ? (
            providerStatusReconciliationReadinessSummary.latestRecords.map((record) => (
              <article key={record.id} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="status-badge live">
                    {record.notificationProviderStatusReconciliationReadinessDisposition.replaceAll("_", " ")}
                  </span>
                  <span className="admin-pill">{record.timeWindowKey}</span>
                </div>
                <MailCheck aria-hidden="true" />
                <h3>{record.channelId}</h3>
                <p>
                  Delivery-receipt readiness {record.deliveryReceiptReadinessId} checked with{" "}
                  {record.expectedConversionSampleSize} conversion samples at {compactDate(record.createdAt)}.
                </p>
                <div className="roadmap-detail">
                  <strong>No provider status reconciliation</strong>
                  <span>
                    Provider status reconciliation enabled {String(record.providerStatusReconciliationEnabled)}, recorded{" "}
                    {String(record.providerStatusReconciliationRecorded)}, provider response{" "}
                    {String(record.providerResponseCreated)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="roadmap-card">
              <div className="roadmap-card-top">
                <span className="status-badge pending">No records yet</span>
                <span className="admin-pill">Needs delivery receipt</span>
              </div>
              <MailCheck aria-hidden="true" />
              <h3>Provider-status reconciliation readiness evidence is ready</h3>
              <p>Record a current delivery-receipt readiness before provider-status reconciliation readiness evidence.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
