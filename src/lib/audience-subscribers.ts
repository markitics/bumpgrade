import { getCloudflareContext } from "@opennextjs/cloudflare";

import { audienceAutomationWorkspace } from "@/lib/audience-automation";

export const audienceSubscriberInspectionIssue = 137;
export const audienceSubscriberInspectionStatus = "owner-subscriber-inspection-ready";
export const audienceSubscriberInspectionOwnerRoute = "/admin/audience";

type AudienceRuntime = {
  db: D1Database;
};

type CountRow = {
  subscriber_count: number | string | null;
  consent_count: number | string | null;
  tag_assignment_count: number | string | null;
  sequence_enrollment_count: number | string | null;
  last_subscriber_at: number | string | null;
  last_consent_at: number | string | null;
};

type DimensionCountRow = {
  id: string | null;
  status: string | null;
  total: number | string | null;
};

type SubscriberRow = {
  id: string;
  email: string;
  first_name: string | null;
  status: string;
  source_form_id: string;
  source_segment_id: string | null;
  created_at: number | string;
  updated_at: number | string;
  consent_count: number | string | null;
  last_consented_at: number | string | null;
  tag_ids: string | null;
  sequence_states: string | null;
};

export type AudienceInspectionCount = {
  id: string;
  status: string;
  total: number;
};

export type AudienceInspectionSummary = {
  id: string;
  status: typeof audienceSubscriberInspectionStatus;
  issue: typeof audienceSubscriberInspectionIssue;
  parentIssue: 17;
  ownerRoute: typeof audienceSubscriberInspectionOwnerRoute;
  publicSourceDataRoute: "/audience/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    subscribers: number;
    consentEvents: number;
    tagAssignments: number;
    sequenceEnrollments: number;
  };
  lastSubscriberAt: string | null;
  lastConsentAt: string | null;
  formCounts: AudienceInspectionCount[];
  tagCounts: AudienceInspectionCount[];
  sequenceCounts: AudienceInspectionCount[];
  redaction: {
    privateContactDataIncluded: false;
    rawEmailIncluded: false;
    rawNameIncluded: false;
    rawIpIncluded: false;
    rawUserAgentIncluded: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AdminAudienceSubscriber = {
  id: string;
  email: string;
  firstName: string | null;
  status: string;
  sourceFormId: string;
  sourceSegmentId: string | null;
  createdAt: string;
  updatedAt: string;
  consentCount: number;
  lastConsentedAt: string | null;
  tags: Array<{
    id: string;
    label: string;
  }>;
  sequences: Array<{
    id: string;
    title: string;
    status: string;
    nextStepId: string | null;
  }>;
};

export type AdminAudienceInspectionState = AudienceInspectionSummary & {
  privateContactDataIncluded: true;
  rawHashesIncluded: false;
  subscribers: AdminAudienceSubscriber[];
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

function dimensionCounts(rows: DimensionCountRow[]): AudienceInspectionCount[] {
  return rows
    .filter((row) => row.id)
    .map((row) => ({
      id: row.id ?? "unknown",
      status: row.status ?? "unknown",
      total: numberValue(row.total),
    }));
}

function emptySummary(source: AudienceInspectionSummary["source"], loadError: string | null): AudienceInspectionSummary {
  return {
    id: "audience-subscriber-inspection-contract",
    status: audienceSubscriberInspectionStatus,
    issue: audienceSubscriberInspectionIssue,
    parentIssue: 17,
    ownerRoute: audienceSubscriberInspectionOwnerRoute,
    publicSourceDataRoute: "/audience/source-data",
    source,
    loadError,
    counts: {
      subscribers: 0,
      consentEvents: 0,
      tagAssignments: 0,
      sequenceEnrollments: 0,
    },
    lastSubscriberAt: null,
    lastConsentAt: null,
    formCounts: [],
    tagCounts: [],
    sequenceCounts: [],
    redaction: {
      privateContactDataIncluded: false,
      rawEmailIncluded: false,
      rawNameIncluded: false,
      rawIpIncluded: false,
      rawUserAgentIncluded: false,
    },
    privateFieldsExcluded: ["email", "firstName", "ipHash", "userAgentHash", "metadataJson"],
    writeBoundary:
      "Issue #137 exposes owner-gated subscriber inspection and public aggregate source-data. Imports, sends, unsubscribes, CRM notes, private subscriber exports, and direct agent writes still require future confirmed-write APIs with consent and suppression checks.",
  };
}

function parseTags(value: string | null) {
  const tagById = new Map(audienceAutomationWorkspace.tags.map((tag) => [tag.id, tag]));
  return (value ?? "")
    .split(",")
    .map((tagId) => tagId.trim())
    .filter(Boolean)
    .map((tagId) => ({
      id: tagId,
      label: tagById.get(tagId)?.label ?? tagId,
    }));
}

function parseSequences(value: string | null) {
  const sequenceById = new Map(audienceAutomationWorkspace.sequences.map((sequence) => [sequence.id, sequence]));
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, status, nextStepId] = entry.split("::");
      return {
        id,
        title: sequenceById.get(id)?.title ?? id,
        status: status || "unknown",
        nextStepId: nextStepId || null,
      };
    });
}

function adminSubscriber(row: SubscriberRow): AdminAudienceSubscriber {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    status: row.status,
    sourceFormId: row.source_form_id,
    sourceSegmentId: row.source_segment_id,
    createdAt: timestampValue(row.created_at) ?? "Unknown",
    updatedAt: timestampValue(row.updated_at) ?? "Unknown",
    consentCount: numberValue(row.consent_count),
    lastConsentedAt: timestampValue(row.last_consented_at),
    tags: parseTags(row.tag_ids),
    sequences: parseSequences(row.sequence_states),
  };
}

export async function getAudienceSubscriberInspectionSummary(): Promise<AudienceInspectionSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM audience_subscribers) AS subscriber_count,
          (SELECT COUNT(*) FROM audience_consent_events) AS consent_count,
          (SELECT COUNT(*) FROM audience_tag_assignments) AS tag_assignment_count,
          (SELECT COUNT(*) FROM audience_sequence_enrollments) AS sequence_enrollment_count,
          (SELECT MAX(created_at) FROM audience_subscribers) AS last_subscriber_at,
          (SELECT MAX(consented_at) FROM audience_consent_events) AS last_consent_at`,
      )
      .first<CountRow>();

    const formCounts = await db
      .prepare(
        `SELECT source_form_id AS id, status, COUNT(*) AS total
        FROM audience_subscribers
        GROUP BY source_form_id, status
        ORDER BY total DESC, source_form_id ASC`,
      )
      .all<DimensionCountRow>();
    const tagCounts = await db
      .prepare(
        `SELECT tag_id AS id, status, COUNT(*) AS total
        FROM audience_tag_assignments
        GROUP BY tag_id, status
        ORDER BY total DESC, tag_id ASC`,
      )
      .all<DimensionCountRow>();
    const sequenceCounts = await db
      .prepare(
        `SELECT sequence_id AS id, status, COUNT(*) AS total
        FROM audience_sequence_enrollments
        GROUP BY sequence_id, status
        ORDER BY total DESC, sequence_id ASC`,
      )
      .all<DimensionCountRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        subscribers: numberValue(counts?.subscriber_count),
        consentEvents: numberValue(counts?.consent_count),
        tagAssignments: numberValue(counts?.tag_assignment_count),
        sequenceEnrollments: numberValue(counts?.sequence_enrollment_count),
      },
      lastSubscriberAt: timestampValue(counts?.last_subscriber_at),
      lastConsentAt: timestampValue(counts?.last_consent_at),
      formCounts: dimensionCounts(formCounts.results ?? []),
      tagCounts: dimensionCounts(tagCounts.results ?? []),
      sequenceCounts: dimensionCounts(sequenceCounts.results ?? []),
    };
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Unable to load audience subscriber inspection.");
  }
}

export async function getAdminAudienceInspectionState(): Promise<AdminAudienceInspectionState> {
  const summary = await getAudienceSubscriberInspectionSummary();

  try {
    const { db } = await getRuntime();
    const subscribers = await db
      .prepare(
        `SELECT
          s.id, s.email, s.first_name, s.status, s.source_form_id, s.source_segment_id, s.created_at, s.updated_at,
          (SELECT COUNT(*) FROM audience_consent_events c WHERE c.subscriber_id = s.id) AS consent_count,
          (SELECT MAX(consented_at) FROM audience_consent_events c WHERE c.subscriber_id = s.id) AS last_consented_at,
          (SELECT GROUP_CONCAT(tag_id, ',') FROM audience_tag_assignments t WHERE t.subscriber_id = s.id AND t.status = 'active') AS tag_ids,
          (
            SELECT GROUP_CONCAT(sequence_id || '::' || status || '::' || COALESCE(next_step_id, ''), ',')
            FROM audience_sequence_enrollments e
            WHERE e.subscriber_id = s.id
          ) AS sequence_states
        FROM audience_subscribers s
        ORDER BY s.updated_at DESC
        LIMIT 25`,
      )
      .all<SubscriberRow>();

    return {
      ...summary,
      privateContactDataIncluded: true,
      rawHashesIncluded: false,
      subscribers: (subscribers.results ?? []).map(adminSubscriber),
    };
  } catch (error) {
    return {
      ...summary,
      source: "unavailable",
      loadError: error instanceof Error ? error.message : "Unable to load audience subscriber rows.",
      privateContactDataIncluded: true,
      rawHashesIncluded: false,
      subscribers: [],
    };
  }
}
