export const audienceOptInUpdatedAt = "2026-05-19";

export const audienceOptInApiRoute = "/api/audience/opt-in";

export const audienceOptInWriteContract = {
  id: "audience-opt-in-consent-capture-contract",
  status: "subscriber-capture-ready",
  issue: 103,
  parentIssue: 17,
  apiRoute: audienceOptInApiRoute,
  tables: ["audience_subscribers", "audience_consent_events", "audience_tag_assignments", "audience_sequence_enrollments"],
  publicSafeFields: [
    "subscriberId",
    "normalizedEmail",
    "formId",
    "tagIds",
    "sequenceId",
    "status",
    "emailDeliveryEnabled",
  ],
  serverPrivateFields: [
    "email",
    "email_hash",
    "first_name",
    "ip_hash",
    "user_agent_hash",
    "metadata_json",
    "raw request headers",
    "unsubscribe tokens",
  ],
  writeBoundary:
    "Issue #103 can capture explicit-consent opt-ins, normalize subscriber email, assign seeded tags, and record draft sequence enrollment evidence. Email sending, imports, unsubscribe management, broadcasts, CRM notes, suppression-list mutation, and direct agent writes require future confirmed-write APIs.",
};

export function normalizeOptInEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) return null;
  return normalized;
}

export function normalizeOptionalName(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, 120);
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
