export const audienceCrmTimelineUpdatedAt = "2026-05-19";

export const audienceCrmTimelineIssue = 169;

export const audienceCrmTimelineStatus = "owner-crm-timeline-ready";

export const audienceCrmTimelineApiRoute = "/api/admin/audience/notes";

export const audienceCrmTimelineConfirmationText = "Create private Bumpgrade audience timeline note";

export const audienceCrmTimelineWriteContract = {
  id: "audience-crm-timeline-note-contract",
  status: audienceCrmTimelineStatus,
  issue: audienceCrmTimelineIssue,
  parentIssue: 17,
  apiRoute: audienceCrmTimelineApiRoute,
  auth: "owner-session",
  tables: ["audience_subscribers", "audience_timeline_entries"],
  confirmation: {
    required: true,
    text: audienceCrmTimelineConfirmationText,
  },
  publicSafeFields: [
    "timelineEntryId",
    "subscriberId",
    "entryKind",
    "status",
    "duplicate",
    "privateNoteBodyIncluded",
  ],
  serverPrivateFields: ["body", "body_hash", "actor_email", "metadata_json", "raw subscriber email"],
  redaction: {
    publicNoteBodiesIncluded: false,
    privateContactDataIncluded: false,
    rawEmailIncludedInSourceData: false,
  },
  writeBoundary:
    "Issue #169 lets verified owners create private audience CRM timeline notes with exact confirmation, idempotency, and expected subscriber-status checks. Public source-data exposes aggregate note counts and redaction flags only; imports, email sends, broadcasts, private exports, and direct agent subscriber writes remain unavailable.",
};

export function normalizeTimelineNoteBody(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, 800);
}
