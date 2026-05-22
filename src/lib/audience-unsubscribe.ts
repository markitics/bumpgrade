import { normalizeOptInEmail, sha256Hex } from "@/lib/audience-opt-in";

export const audienceUnsubscribeUpdatedAt = "2026-05-19";

export const audienceUnsubscribeApiRoute = "/api/audience/unsubscribe";

export const audienceUnsubscribeSuppressionIssue = 167;
export const audienceUnsubscribeIssue = 343;

export const audienceUnsubscribeStatus = "unsubscribe-sequence-pause-ready";

export const audienceUnsubscribeWriteContract = {
  id: "audience-unsubscribe-suppression-contract",
  status: audienceUnsubscribeStatus,
  issue: audienceUnsubscribeIssue,
  suppressionIssue: audienceUnsubscribeSuppressionIssue,
  sequencePauseIssue: audienceUnsubscribeIssue,
  parentIssue: 17,
  apiRoute: audienceUnsubscribeApiRoute,
  tables: ["audience_subscribers", "audience_suppression_entries", "audience_sequence_enrollments"],
  publicSafeFields: [
    "suppressionEntryId",
    "normalizedEmail",
    "status",
    "duplicate",
    "emailDeliveryEnabled",
    "subscriberExistenceRevealed",
    "sequenceEnrollmentStateIncluded",
  ],
  serverPrivateFields: [
    "email_hash",
    "subscriber_id",
    "reason",
    "ip_hash",
    "user_agent_hash",
    "metadata_json",
    "raw request headers",
  ],
  redaction: {
    privateContactDataIncluded: false,
    subscriberExistenceRevealed: false,
    rawEmailIncludedInSourceData: false,
    rawIpIncluded: false,
    rawUserAgentIncluded: false,
  },
  writeBoundary:
    "Issue #167 can record unsubscribe/suppression evidence for a normalized email with idempotency and can mark known subscribers unsubscribed without revealing list membership. Issue #343 also pauses known draft sequence enrollments as aggregate owner evidence while keeping the public response membership-safe. Email sending, imports, broadcasts, CRM notes, private exports, and direct agent subscriber writes still require authenticated confirmed-write APIs with suppression checks.",
};

export function normalizeUnsubscribeEmail(value: unknown) {
  return normalizeOptInEmail(value);
}

export function normalizeUnsubscribeReason(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, 240);
}

export async function hashUnsubscribeEmail(email: string) {
  return sha256Hex(email);
}
