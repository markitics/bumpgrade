import { normalizeOptInEmail, sha256Hex } from "@/lib/audience-opt-in";

export const audienceUnsubscribeUpdatedAt = "2026-05-19";

export const audienceUnsubscribeApiRoute = "/api/audience/unsubscribe";

export const audienceUnsubscribeIssue = 167;

export const audienceUnsubscribeStatus = "unsubscribe-suppression-ready";

export const audienceUnsubscribeWriteContract = {
  id: "audience-unsubscribe-suppression-contract",
  status: audienceUnsubscribeStatus,
  issue: audienceUnsubscribeIssue,
  parentIssue: 17,
  apiRoute: audienceUnsubscribeApiRoute,
  tables: ["audience_subscribers", "audience_suppression_entries"],
  publicSafeFields: [
    "suppressionEntryId",
    "normalizedEmail",
    "status",
    "duplicate",
    "emailDeliveryEnabled",
    "subscriberExistenceRevealed",
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
    "Issue #167 can record unsubscribe/suppression evidence for a normalized email with idempotency and can mark known subscribers unsubscribed without revealing list membership. Email sending, imports, broadcasts, CRM notes, private exports, and direct agent subscriber writes still require authenticated confirmed-write APIs with suppression checks.",
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
