import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Bell, Database, FlaskConical, ShieldCheck } from "lucide-react";

import { AdminAnalyticsExperimentDecisionForm } from "@/components/admin-analytics-experiment-decision-form";
import { AdminAnalyticsNotificationInboxForm } from "@/components/admin-analytics-notification-inbox-form";
import { AdminLocked } from "@/components/admin-auth-gate";
import { getCurrentAdminState } from "@/lib/admin-auth";
import {
  analyticsExperimentDecisionIssue,
  getAnalyticsExperimentDecisionSummary,
} from "@/lib/analytics-experiment-decisions";
import {
  analyticsNotificationInboxIssue,
  getAnalyticsNotificationInboxSummary,
} from "@/lib/analytics-notification-inbox";

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
  const notificationSummary = await getAnalyticsNotificationInboxSummary();
  const latestDecision = summary.latestDecisions[0];
  const latestNotification = notificationSummary.latestRecords[0];

  return (
    <main className="roadmap-page admin-roadmap-page">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Admin analytics</p>
          <h1>Experiment decisions stay evidenced before traffic routing.</h1>
          <p className="lede">
            Owners can inspect aggregate assignment counts, fixed-window conversion sample sizes, and sample-size
            caveats before recording an experiment decision or owner inbox notification record. The evidence rows stay
            redacted and do not send email, dispatch queues, route traffic, assign cookies, pick automated winners,
            expose raw events, expose raw assignments, or make revenue claims.
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
            <Link href={`https://github.com/markitics/bumpgrade/issues/${analyticsNotificationInboxIssue}`} className="secondary-action">
              Issue #{analyticsNotificationInboxIssue}
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
            <FlaskConical aria-hidden="true" />
            <h3>Decision boundary</h3>
            <p>
              {summary.counts.trafficRoutingEnabledRecords} traffic-routing records;{" "}
              {summary.counts.automatedWinnerEnabledRecords} automated-winner records.
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

      <section className="content-band">
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
    </main>
  );
}
