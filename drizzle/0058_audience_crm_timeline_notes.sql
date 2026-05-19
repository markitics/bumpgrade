CREATE TABLE IF NOT EXISTS audience_timeline_entries (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL REFERENCES audience_subscribers(id) ON DELETE CASCADE,
  entry_kind TEXT NOT NULL DEFAULT 'owner_note',
  body TEXT NOT NULL,
  body_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_timeline_entries_idempotency_unique
  ON audience_timeline_entries(idempotency_key);
CREATE INDEX IF NOT EXISTS audience_timeline_entries_subscriber_created_idx
  ON audience_timeline_entries(subscriber_id, created_at);
CREATE INDEX IF NOT EXISTS audience_timeline_entries_kind_status_idx
  ON audience_timeline_entries(entry_kind, status);

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Issue #167 adds POST /api/audience/unsubscribe with idempotent unsubscribe/suppression evidence and no list-membership leak.", "Issue #169 adds owner-gated private audience CRM timeline notes with aggregate public redaction.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add unsubscribe-safe email delivery and broadcast scheduling without exposing private contact data publicly.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, and the live consent/unsubscribe/note boundary before email sends exist.',
  source_evidence_json = '["https://bumpgrade.com/audience/source-data","https://bumpgrade.com/audience/indie-launch-waitlist","https://bumpgrade.com/api/audience/opt-in","https://bumpgrade.com/api/audience/unsubscribe","https://bumpgrade.com/api/admin/audience/notes","https://bumpgrade.com/admin/audience","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/17","https://github.com/markitics/bumpgrade/issues/85","https://github.com/markitics/bumpgrade/issues/103","https://github.com/markitics/bumpgrade/issues/137","https://github.com/markitics/bumpgrade/issues/167","https://github.com/markitics/bumpgrade/issues/169"]',
  happy_path_json = '["Fetch /audience/source-data.","Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, and write boundaries.","Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.","Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.","Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, and private timeline notes.","Create a short owner CRM note with exact confirmation, idempotency, and the expected subscriber status.","Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins, record unsubscribe/suppression evidence, and store private owner notes, but it is not a general contact import or full CRM database.","Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, reasons, or private metadata.","The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.","Subscriber imports, direct agent contact writes, email sends, broadcasts, private exports, and CRM automation require future confirmed-write APIs.","Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber/suppression/timeline counts, and the opt-in/unsubscribe/note write boundaries. Owner sessions can inspect private rows and create private notes in /admin/audience. Direct agent subscriber writes, imports, sends, broadcasts, private exports, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, owner CRM note creation, unauthorized note rejection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.","Issues #85, #103, #137, #167, and #169 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, and owner CRM timeline note path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
