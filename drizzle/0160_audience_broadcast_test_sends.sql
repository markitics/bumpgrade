CREATE TABLE IF NOT EXISTS audience_broadcast_test_sends (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'owner_test_send_recorded',
  recipient_scope TEXT NOT NULL DEFAULT 'verified-owner-session-email-only',
  recipient_email_hash TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  preview_text TEXT NOT NULL,
  expected_draft_updated_at TEXT NOT NULL,
  expected_ready_recipient_count INTEGER NOT NULL DEFAULT 0,
  provider TEXT NOT NULL,
  provider_ok INTEGER NOT NULL DEFAULT 0,
  provider_error TEXT,
  owner_test_email_attempted INTEGER NOT NULL DEFAULT 1,
  subscriber_payloads_created INTEGER NOT NULL DEFAULT 0,
  public_agent_send_created INTEGER NOT NULL DEFAULT 0,
  provider_message_ids_created INTEGER NOT NULL DEFAULT 0,
  raw_recipient_email_stored INTEGER NOT NULL DEFAULT 0,
  raw_email_body_stored INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  audit_correlation_id TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  confirmation_text_sha256 TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_broadcast_test_sends_idempotency_unique
  ON audience_broadcast_test_sends(idempotency_key);

CREATE INDEX IF NOT EXISTS audience_broadcast_test_sends_draft_status_idx
  ON audience_broadcast_test_sends(draft_id, status);

CREATE INDEX IF NOT EXISTS audience_broadcast_test_sends_created_idx
  ON audience_broadcast_test_sends(created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, consent-backed opt-in capture, suppression evidence, owner CRM notes, broadcast and sequence dry-run gates, sender/provider/queue readiness, and the first owner-only broadcast test-send execution path.',
  public_evidence_json = '["Tracked by issue #17 and post-MVP execution issue #420.", "Issue #420 adds an owner-confirmed broadcast test-send path that sends only to the verified owner-session email through the configured Cloudflare Email binding or test capture.", "The test-send record stores recipient and actor hashes, confirmation hash, idempotency key, audit correlation, provider status, and redaction flags without raw recipient email, subscriber payloads, provider message IDs, Queue messages, or public agent sends."]',
  next_milestone = 'Expand from owner-only test sends to Queue-backed subscriber delivery only after verified sender/domain alignment, recipient-payload creation, suppression/footer checks, provider response handling, retries, and dead-letter handling are enforced together.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171,173,175,177,183,189,191,197,199,201,203,205,207,209,211,253,259,347,351,354,358,360,362,364,366,368,370,372,374,376,378,380,420]',
  user_goal = 'Inspect opt-ins, suppression, CRM notes, broadcast and sequence dry-run gates, readiness boundaries, import/export planning, and the owner-only broadcast test-send path before subscriber delivery exists.',
  happy_path_json = '["Open /admin/audience as a verified owner.", "Confirm the seeded broadcast draft timestamp and readiness count.", "Record an owner-only broadcast test send with exact confirmation, idempotency, and audit correlation.", "Verify /audience/source-data summarizes the test-send count and redaction flags without raw recipient email, subscriber payloads, provider message IDs, Queue messages, or public agent sends."]',
  edge_cases_json = '["Owner-only broadcast test sends can call the configured Cloudflare Email binding for the verified owner session email only; they are not subscriber blasts, public agent sends, Queue producer execution, recipient-payload creation, provider response storage, or provider message ID storage.", "Public /audience/source-data exposes aggregate test-send status and redaction flags, not recipient email, recipient hash, actor email, actor hash, idempotency keys, confirmation hashes, raw email body, provider errors, or private metadata."]',
  agent_access = 'Agents can read aggregate owner-only broadcast test-send counts and redaction flags from /audience/source-data. Owner sessions can trigger the test-send API from /admin/audience with exact confirmation, idempotency, audit correlation, draft stale-state checks, and preview/footer checks. Direct public agent broadcast sends, subscriber delivery, Queue dispatch, recipient payloads, provider response storage, and provider message IDs remain disabled.',
  validation_json = '["Playwright covers /audience/source-data, owner-only broadcast test-send redaction, owner-session API creation in APP_ENV=test capture mode, unauthenticated rejection, duplicate idempotency replay, stale readiness rejection, /admin/audience rendering, and agent manifest discovery."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
