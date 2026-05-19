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
  unsubscribed_subscriber_count: number | string | null;
  consent_count: number | string | null;
  tag_assignment_count: number | string | null;
  sequence_enrollment_count: number | string | null;
  suppression_count: number | string | null;
  active_suppression_count: number | string | null;
  timeline_count: number | string | null;
  active_timeline_count: number | string | null;
  last_subscriber_at: number | string | null;
  last_consent_at: number | string | null;
  last_suppression_at: number | string | null;
  last_timeline_at: number | string | null;
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

type TimelineEntryRow = {
  id: string;
  subscriber_id: string;
  entry_kind: string;
  body: string;
  status: string;
  created_at: number | string;
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
    unsubscribedSubscribers: number;
    consentEvents: number;
    tagAssignments: number;
    sequenceEnrollments: number;
    suppressionEntries: number;
    activeSuppressionEntries: number;
    timelineEntries: number;
    activeTimelineEntries: number;
  };
  lastSubscriberAt: string | null;
  lastConsentAt: string | null;
  lastSuppressionAt: string | null;
  lastTimelineAt: string | null;
  formCounts: AudienceInspectionCount[];
  tagCounts: AudienceInspectionCount[];
  sequenceCounts: AudienceInspectionCount[];
  suppressionCounts: AudienceInspectionCount[];
  timelineCounts: AudienceInspectionCount[];
  redaction: {
    privateContactDataIncluded: false;
    rawEmailIncluded: false;
    rawNameIncluded: false;
    rawIpIncluded: false;
    rawUserAgentIncluded: false;
    rawSuppressionHashIncluded: false;
    suppressionReasonIncluded: false;
    privateTimelineNoteBodiesIncluded: false;
    timelineActorEmailIncluded: false;
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
  timelineNoteCount: number;
  timelineEntries: Array<{
    id: string;
    entryKind: string;
    body: string;
    status: string;
    createdAt: string;
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
      unsubscribedSubscribers: 0,
      consentEvents: 0,
      tagAssignments: 0,
      sequenceEnrollments: 0,
      suppressionEntries: 0,
      activeSuppressionEntries: 0,
      timelineEntries: 0,
      activeTimelineEntries: 0,
    },
    lastSubscriberAt: null,
    lastConsentAt: null,
    lastSuppressionAt: null,
    lastTimelineAt: null,
    formCounts: [],
    tagCounts: [],
    sequenceCounts: [],
    suppressionCounts: [],
    timelineCounts: [],
    redaction: {
      privateContactDataIncluded: false,
      rawEmailIncluded: false,
      rawNameIncluded: false,
      rawIpIncluded: false,
      rawUserAgentIncluded: false,
      rawSuppressionHashIncluded: false,
      suppressionReasonIncluded: false,
      privateTimelineNoteBodiesIncluded: false,
      timelineActorEmailIncluded: false,
    },
    privateFieldsExcluded: [
      "email",
      "firstName",
      "emailHash",
      "ipHash",
      "userAgentHash",
      "suppressionReason",
      "timelineNoteBody",
      "timelineActorEmail",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #137 exposes owner-gated subscriber inspection and public aggregate source-data. Issue #167 records unsubscribe/suppression evidence and marks known subscribers unsubscribed without public list-membership leakage. Issue #169 lets owners create private CRM timeline notes while public source-data exposes aggregate counts only. Issue #171 calculates suppression-aware broadcast readiness without creating send queues. Imports, sends, broadcast scheduling, private subscriber exports, and direct agent writes still require future confirmed-write APIs with consent and suppression checks.",
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
    timelineNoteCount: 0,
    timelineEntries: [],
  };
}

function adminTimelineEntry(row: TimelineEntryRow) {
  return {
    id: row.id,
    entryKind: row.entry_kind,
    body: row.body,
    status: row.status,
    createdAt: timestampValue(row.created_at) ?? "Unknown",
  };
}

export async function getAudienceSubscriberInspectionSummary(): Promise<AudienceInspectionSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM audience_subscribers) AS subscriber_count,
          (SELECT COUNT(*) FROM audience_subscribers WHERE status = 'unsubscribed') AS unsubscribed_subscriber_count,
          (SELECT COUNT(*) FROM audience_consent_events) AS consent_count,
          (SELECT COUNT(*) FROM audience_tag_assignments) AS tag_assignment_count,
          (SELECT COUNT(*) FROM audience_sequence_enrollments) AS sequence_enrollment_count,
          (SELECT COUNT(*) FROM audience_suppression_entries) AS suppression_count,
          (SELECT COUNT(*) FROM audience_suppression_entries WHERE status = 'active') AS active_suppression_count,
          (SELECT COUNT(*) FROM audience_timeline_entries) AS timeline_count,
          (SELECT COUNT(*) FROM audience_timeline_entries WHERE status = 'active') AS active_timeline_count,
          (SELECT MAX(created_at) FROM audience_subscribers) AS last_subscriber_at,
          (SELECT MAX(consented_at) FROM audience_consent_events) AS last_consent_at,
          (SELECT MAX(created_at) FROM audience_suppression_entries) AS last_suppression_at,
          (SELECT MAX(created_at) FROM audience_timeline_entries) AS last_timeline_at`,
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
    const suppressionCounts = await db
      .prepare(
        `SELECT suppression_kind AS id, status, COUNT(*) AS total
        FROM audience_suppression_entries
        GROUP BY suppression_kind, status
        ORDER BY total DESC, suppression_kind ASC`,
      )
      .all<DimensionCountRow>();
    const timelineCounts = await db
      .prepare(
        `SELECT entry_kind AS id, status, COUNT(*) AS total
        FROM audience_timeline_entries
        GROUP BY entry_kind, status
        ORDER BY total DESC, entry_kind ASC`,
      )
      .all<DimensionCountRow>();

    return {
      ...emptySummary("d1", null),
      counts: {
        subscribers: numberValue(counts?.subscriber_count),
        unsubscribedSubscribers: numberValue(counts?.unsubscribed_subscriber_count),
        consentEvents: numberValue(counts?.consent_count),
        tagAssignments: numberValue(counts?.tag_assignment_count),
        sequenceEnrollments: numberValue(counts?.sequence_enrollment_count),
        suppressionEntries: numberValue(counts?.suppression_count),
        activeSuppressionEntries: numberValue(counts?.active_suppression_count),
        timelineEntries: numberValue(counts?.timeline_count),
        activeTimelineEntries: numberValue(counts?.active_timeline_count),
      },
      lastSubscriberAt: timestampValue(counts?.last_subscriber_at),
      lastConsentAt: timestampValue(counts?.last_consent_at),
      lastSuppressionAt: timestampValue(counts?.last_suppression_at),
      lastTimelineAt: timestampValue(counts?.last_timeline_at),
      formCounts: dimensionCounts(formCounts.results ?? []),
      tagCounts: dimensionCounts(tagCounts.results ?? []),
      sequenceCounts: dimensionCounts(sequenceCounts.results ?? []),
      suppressionCounts: dimensionCounts(suppressionCounts.results ?? []),
      timelineCounts: dimensionCounts(timelineCounts.results ?? []),
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

    const mappedSubscribers = (subscribers.results ?? []).map(adminSubscriber);
    const subscriberIds = mappedSubscribers.map((subscriber) => subscriber.id);
    if (subscriberIds.length > 0) {
      const placeholders = subscriberIds.map(() => "?").join(",");
      const timelineRows = await db
        .prepare(
          `SELECT id, subscriber_id, entry_kind, body, status, created_at
          FROM audience_timeline_entries
          WHERE subscriber_id IN (${placeholders})
          ORDER BY created_at DESC
          LIMIT 100`,
        )
        .bind(...subscriberIds)
        .all<TimelineEntryRow>();
      const timelineBySubscriber = new Map<string, ReturnType<typeof adminTimelineEntry>[]>();
      for (const row of timelineRows.results ?? []) {
        const entries = timelineBySubscriber.get(row.subscriber_id) ?? [];
        entries.push(adminTimelineEntry(row));
        timelineBySubscriber.set(row.subscriber_id, entries);
      }
      for (const subscriber of mappedSubscribers) {
        subscriber.timelineEntries = timelineBySubscriber.get(subscriber.id) ?? [];
        subscriber.timelineNoteCount = subscriber.timelineEntries.length;
      }
    }

    return {
      ...summary,
      privateContactDataIncluded: true,
      rawHashesIncluded: false,
      subscribers: mappedSubscribers,
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
