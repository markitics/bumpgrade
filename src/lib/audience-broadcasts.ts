import { getCloudflareContext } from "@opennextjs/cloudflare";

export const audienceBroadcastReadinessIssue = 171;
export const audienceBroadcastReadinessStatus = "broadcast-readiness-ready";
export const audienceBroadcastReadinessUpdatedAt = "2026-05-19";
export const audienceBroadcastReadinessDraftId = "broadcast-draft-launch-window";
export const audienceBroadcastReadinessWorkspaceId = "audience-automation-workspace-indie-launch";
export const audienceBroadcastReadinessSegmentId = "segment-indie-launch-waitlist";
export const audienceBroadcastReadinessFormId = "opt-in-form-indie-launch-waitlist";

type AudienceRuntime = {
  db: D1Database;
};

type BroadcastDraftRow = {
  id: string;
  workspace_id: string;
  title: string;
  status: string;
  subject_intent: string;
  preview_text: string;
  audience_scope: string;
  segment_id: string;
  approval_boundary: string;
  suppression_policy: string;
  updated_at: number | string;
};

type ReadinessCountRow = {
  draft_count: number | string | null;
  scoped_subscriber_count: number | string | null;
  consented_subscriber_count: number | string | null;
  ready_recipient_count: number | string | null;
  suppressed_recipient_count: number | string | null;
  unsubscribed_recipient_count: number | string | null;
  missing_consent_count: number | string | null;
  active_suppression_count: number | string | null;
  last_readiness_at: number | string | null;
};

export type AudienceBroadcastDraftReadiness = {
  id: string;
  workspaceId: string;
  title: string;
  status: string;
  subjectIntent: string;
  previewText: string;
  audienceScope: string;
  segmentId: string;
  approvalBoundary: string;
  suppressionPolicy: string;
  readyRecipientCount: number;
  excludedBySuppressionCount: number;
  excludedByUnsubscribeCount: number;
  excludedByMissingConsentCount: number;
  sendQueueRowsCreated: false;
  providerMessageIdsIncluded: false;
  updatedAt: string | null;
};

export type AudienceBroadcastReadinessSummary = {
  id: string;
  status: typeof audienceBroadcastReadinessStatus;
  issue: typeof audienceBroadcastReadinessIssue;
  parentIssue: 17;
  publicSourceDataRoute: "/audience/source-data";
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    broadcastDrafts: number;
    scopedSubscribers: number;
    consentedSubscribers: number;
    readyRecipients: number;
    suppressedRecipients: number;
    unsubscribedRecipients: number;
    missingConsentRecipients: number;
    activeSuppressionEntries: number;
  };
  lastReadinessAt: string | null;
  drafts: AudienceBroadcastDraftReadiness[];
  redaction: {
    privateContactDataIncluded: false;
    rawRecipientEmailsIncluded: false;
    rawRecipientNamesIncluded: false;
    suppressionHashesIncluded: false;
    providerMessageIdsIncluded: false;
    sendQueueRowsCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

async function getRuntime(): Promise<AudienceRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function timestampValue(value: number | string | null | undefined) {
  const seconds = numberValue(value);
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function emptySummary(
  source: AudienceBroadcastReadinessSummary["source"],
  loadError: string | null,
): AudienceBroadcastReadinessSummary {
  return {
    id: "audience-broadcast-readiness-contract",
    status: audienceBroadcastReadinessStatus,
    issue: audienceBroadcastReadinessIssue,
    parentIssue: 17,
    publicSourceDataRoute: "/audience/source-data",
    ownerRoute: "/admin/audience",
    source,
    loadError,
    counts: {
      broadcastDrafts: 0,
      scopedSubscribers: 0,
      consentedSubscribers: 0,
      readyRecipients: 0,
      suppressedRecipients: 0,
      unsubscribedRecipients: 0,
      missingConsentRecipients: 0,
      activeSuppressionEntries: 0,
    },
    lastReadinessAt: null,
    drafts: [],
    redaction: {
      privateContactDataIncluded: false,
      rawRecipientEmailsIncluded: false,
      rawRecipientNamesIncluded: false,
      suppressionHashesIncluded: false,
      providerMessageIdsIncluded: false,
      sendQueueRowsCreated: false,
    },
    privateFieldsExcluded: [
      "recipientEmail",
      "recipientName",
      "subscriberEmailHash",
      "suppressionHash",
      "providerMessageId",
      "sendQueuePayload",
      "personalizedBody",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #171 exposes read-only broadcast draft readiness with suppression-aware aggregate counts. It does not send email, schedule broadcasts, create send queue rows, expose private recipients, or authorize direct agent broadcast writes.",
  };
}

function mapDraft(row: BroadcastDraftRow, counts: ReadinessCountRow | null): AudienceBroadcastDraftReadiness {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    status: row.status,
    subjectIntent: row.subject_intent,
    previewText: row.preview_text,
    audienceScope: row.audience_scope,
    segmentId: row.segment_id,
    approvalBoundary: row.approval_boundary,
    suppressionPolicy: row.suppression_policy,
    readyRecipientCount: numberValue(counts?.ready_recipient_count),
    excludedBySuppressionCount: numberValue(counts?.suppressed_recipient_count),
    excludedByUnsubscribeCount: numberValue(counts?.unsubscribed_recipient_count),
    excludedByMissingConsentCount: numberValue(counts?.missing_consent_count),
    sendQueueRowsCreated: false,
    providerMessageIdsIncluded: false,
    updatedAt: timestampValue(row.updated_at),
  };
}

export async function getAudienceBroadcastReadinessSummary(): Promise<AudienceBroadcastReadinessSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `WITH scoped AS (
          SELECT *
          FROM audience_subscribers
          WHERE source_segment_id = ? OR source_form_id = ?
        )
        SELECT
          (SELECT COUNT(*) FROM audience_broadcast_drafts) AS draft_count,
          (SELECT COUNT(*) FROM scoped) AS scoped_subscriber_count,
          (
            SELECT COUNT(*)
            FROM scoped s
            WHERE EXISTS (
              SELECT 1 FROM audience_consent_events c
              WHERE c.subscriber_id = s.id AND c.status = 'consented'
            )
          ) AS consented_subscriber_count,
          (
            SELECT COUNT(*)
            FROM scoped s
            WHERE s.status = 'subscribed'
              AND EXISTS (
                SELECT 1 FROM audience_consent_events c
                WHERE c.subscriber_id = s.id AND c.status = 'consented'
              )
              AND NOT EXISTS (
                SELECT 1 FROM audience_suppression_entries se
                WHERE se.email_hash = s.email_hash AND se.status = 'active'
              )
          ) AS ready_recipient_count,
          (
            SELECT COUNT(*)
            FROM scoped s
            WHERE s.status = 'subscribed'
              AND EXISTS (
                SELECT 1 FROM audience_suppression_entries se
                WHERE se.email_hash = s.email_hash AND se.status = 'active'
              )
          ) AS suppressed_recipient_count,
          (SELECT COUNT(*) FROM scoped WHERE status = 'unsubscribed') AS unsubscribed_recipient_count,
          (
            SELECT COUNT(*)
            FROM scoped s
            WHERE s.status = 'subscribed'
              AND NOT EXISTS (
                SELECT 1 FROM audience_consent_events c
                WHERE c.subscriber_id = s.id AND c.status = 'consented'
              )
          ) AS missing_consent_count,
          (SELECT COUNT(*) FROM audience_suppression_entries WHERE status = 'active') AS active_suppression_count,
          (SELECT MAX(updated_at) FROM audience_broadcast_drafts) AS last_readiness_at`,
      )
      .bind(audienceBroadcastReadinessSegmentId, audienceBroadcastReadinessFormId)
      .first<ReadinessCountRow>();

    const drafts = await db
      .prepare(
        `SELECT
          id, workspace_id, title, status, subject_intent, preview_text, audience_scope, segment_id,
          approval_boundary, suppression_policy, updated_at
        FROM audience_broadcast_drafts
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<BroadcastDraftRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        broadcastDrafts: numberValue(counts?.draft_count),
        scopedSubscribers: numberValue(counts?.scoped_subscriber_count),
        consentedSubscribers: numberValue(counts?.consented_subscriber_count),
        readyRecipients: numberValue(counts?.ready_recipient_count),
        suppressedRecipients: numberValue(counts?.suppressed_recipient_count),
        unsubscribedRecipients: numberValue(counts?.unsubscribed_recipient_count),
        missingConsentRecipients: numberValue(counts?.missing_consent_count),
        activeSuppressionEntries: numberValue(counts?.active_suppression_count),
      },
      lastReadinessAt: timestampValue(counts?.last_readiness_at),
      drafts: (drafts.results ?? []).map((row) => mapDraft(row, counts ?? null)),
    };
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Unable to load audience broadcast readiness.");
  }
}
