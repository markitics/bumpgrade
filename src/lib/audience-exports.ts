import { getCloudflareContext } from "@opennextjs/cloudflare";

export const audienceExportReadinessIssue = 347;
export const audienceExportReadinessStatus = "audience-export-readiness-ready";
export const audienceExportReadinessOwnerRoute = "/admin/audience";
export const audienceExportReadinessPublicSourceDataRoute = "/audience/source-data";

type AudienceRuntime = {
  db: D1Database;
};

type ExportReadinessCountRow = {
  subscriber_count: number | string | null;
  subscribed_subscriber_count: number | string | null;
  consented_subscriber_count: number | string | null;
  export_eligible_subscriber_count: number | string | null;
  suppressed_subscriber_count: number | string | null;
  active_suppression_entry_count: number | string | null;
  unsubscribed_subscriber_count: number | string | null;
  paused_sequence_subscriber_count: number | string | null;
};

export type AudienceExportReadinessSummary = {
  id: "audience-export-readiness-contract";
  status: typeof audienceExportReadinessStatus;
  issue: typeof audienceExportReadinessIssue;
  parentIssue: 17;
  ownerRoute: typeof audienceExportReadinessOwnerRoute;
  publicSourceDataRoute: typeof audienceExportReadinessPublicSourceDataRoute;
  source: "d1" | "unavailable";
  loadError: string | null;
  exportFormat: "csv_private_contact_export";
  exportEnabled: false;
  counts: {
    subscribers: number;
    subscribedSubscribers: number;
    consentedSubscribers: number;
    exportEligibleSubscribers: number;
    suppressedSubscribers: number;
    activeSuppressionEntries: number;
    unsubscribedSubscribers: number;
    pausedSequenceSubscribers: number;
    exportFilesCreatedRecords: 0;
    rawEmailsIncludedRecords: 0;
    exportUrlsCreatedRecords: 0;
  };
  redaction: {
    privateContactDataIncluded: false;
    rawEmailsIncluded: false;
    subscriberIdsIncluded: false;
    exportFileUrlsIncluded: false;
    exportFilesCreated: false;
    actorEmailIncluded: false;
    suppressionHashesIncluded: false;
    privateNotesIncluded: false;
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

function emptySummary(source: AudienceExportReadinessSummary["source"], loadError: string | null): AudienceExportReadinessSummary {
  return {
    id: "audience-export-readiness-contract",
    status: audienceExportReadinessStatus,
    issue: audienceExportReadinessIssue,
    parentIssue: 17,
    ownerRoute: audienceExportReadinessOwnerRoute,
    publicSourceDataRoute: audienceExportReadinessPublicSourceDataRoute,
    source,
    loadError,
    exportFormat: "csv_private_contact_export",
    exportEnabled: false,
    counts: {
      subscribers: 0,
      subscribedSubscribers: 0,
      consentedSubscribers: 0,
      exportEligibleSubscribers: 0,
      suppressedSubscribers: 0,
      activeSuppressionEntries: 0,
      unsubscribedSubscribers: 0,
      pausedSequenceSubscribers: 0,
      exportFilesCreatedRecords: 0,
      rawEmailsIncludedRecords: 0,
      exportUrlsCreatedRecords: 0,
    },
    redaction: {
      privateContactDataIncluded: false,
      rawEmailsIncluded: false,
      subscriberIdsIncluded: false,
      exportFileUrlsIncluded: false,
      exportFilesCreated: false,
      actorEmailIncluded: false,
      suppressionHashesIncluded: false,
      privateNotesIncluded: false,
    },
    privateFieldsExcluded: [
      "subscriberId",
      "email",
      "firstName",
      "emailHash",
      "suppressionHash",
      "exportFileUrl",
      "exportObjectKey",
      "actorEmail",
      "privateNote",
    ],
    writeBoundary:
      "Issue #347 exposes aggregate owner/public-safe audience export readiness for CSV-style private contact exports without creating export files, URLs, raw email payloads, subscriber-id lists, or direct public agent export writes. Real private exports still require a future owner-confirmed export API with actor identity, exact confirmation, consent and suppression checks, audit correlation, redaction, and time-limited delivery.",
  };
}

export async function getAudienceExportReadinessSummary(): Promise<AudienceExportReadinessSummary> {
  let runtime: AudienceRuntime;
  try {
    runtime = await getRuntime();
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Audience export runtime unavailable.");
  }

  try {
    const counts = await runtime.db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM audience_subscribers) AS subscriber_count,
          (SELECT COUNT(*) FROM audience_subscribers WHERE status = 'subscribed') AS subscribed_subscriber_count,
          (SELECT COUNT(DISTINCT subscriber_id) FROM audience_consent_events WHERE status = 'consented') AS consented_subscriber_count,
          (
            SELECT COUNT(*)
            FROM audience_subscribers subscribers
            WHERE subscribers.status = 'subscribed'
              AND EXISTS (
                SELECT 1
                FROM audience_consent_events consent
                WHERE consent.subscriber_id = subscribers.id
                  AND consent.status = 'consented'
              )
              AND NOT EXISTS (
                SELECT 1
                FROM audience_suppression_entries suppression
                WHERE suppression.subscriber_id = subscribers.id
                  AND suppression.status = 'active'
              )
          ) AS export_eligible_subscriber_count,
          (
            SELECT COUNT(DISTINCT subscriber_id)
            FROM audience_suppression_entries
            WHERE subscriber_id IS NOT NULL
              AND status = 'active'
          ) AS suppressed_subscriber_count,
          (SELECT COUNT(*) FROM audience_suppression_entries WHERE status = 'active') AS active_suppression_entry_count,
          (SELECT COUNT(*) FROM audience_subscribers WHERE status = 'unsubscribed') AS unsubscribed_subscriber_count,
          (
            SELECT COUNT(DISTINCT subscriber_id)
            FROM audience_sequence_enrollments
            WHERE status = 'unsubscribe_paused'
          ) AS paused_sequence_subscriber_count`,
      )
      .first<ExportReadinessCountRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        subscribers: numberValue(counts?.subscriber_count),
        subscribedSubscribers: numberValue(counts?.subscribed_subscriber_count),
        consentedSubscribers: numberValue(counts?.consented_subscriber_count),
        exportEligibleSubscribers: numberValue(counts?.export_eligible_subscriber_count),
        suppressedSubscribers: numberValue(counts?.suppressed_subscriber_count),
        activeSuppressionEntries: numberValue(counts?.active_suppression_entry_count),
        unsubscribedSubscribers: numberValue(counts?.unsubscribed_subscriber_count),
        pausedSequenceSubscribers: numberValue(counts?.paused_sequence_subscriber_count),
        exportFilesCreatedRecords: 0,
        rawEmailsIncludedRecords: 0,
        exportUrlsCreatedRecords: 0,
      },
    };
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Audience export counts unavailable.");
  }
}
