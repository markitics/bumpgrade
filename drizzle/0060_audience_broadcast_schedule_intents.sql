CREATE TABLE IF NOT EXISTS audience_broadcast_schedule_intents (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'dry_run_recorded',
  schedule_kind TEXT NOT NULL DEFAULT 'owner_confirmed_dry_run',
  expected_draft_updated_at TEXT NOT NULL,
  ready_recipient_count INTEGER NOT NULL DEFAULT 0,
  held_recipient_count INTEGER NOT NULL DEFAULT 0,
  active_suppression_count INTEGER NOT NULL DEFAULT 0,
  requested_send_at TEXT,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_broadcast_schedule_intents_idempotency_unique
  ON audience_broadcast_schedule_intents(idempotency_key);

CREATE INDEX IF NOT EXISTS audience_broadcast_schedule_intents_draft_status_idx
  ON audience_broadcast_schedule_intents(draft_id, status);

CREATE INDEX IF NOT EXISTS audience_broadcast_schedule_intents_status_created_idx
  ON audience_broadcast_schedule_intents(status, created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, broadcast draft readiness, owner-confirmed dry-run schedule intents, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Issue #167 adds POST /api/audience/unsubscribe with idempotent unsubscribe/suppression evidence and no list-membership leak.", "Issue #169 adds owner-gated private audience CRM timeline notes with aggregate public redaction.", "Issue #171 adds suppression-aware broadcast draft readiness without send queues or provider message IDs.", "Issue #173 adds owner-confirmed dry-run broadcast schedule intents without recipient payloads or email sends.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add real email delivery queues only after sender-domain, unsubscribe footer, suppression, audit, and provider-send boundaries stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171,173]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, broadcast readiness, dry-run schedule intents, and the live consent/unsubscribe/note boundary before email sends exist.',
  source_evidence_json = '["https://bumpgrade.com/audience/source-data", "https://bumpgrade.com/audience/indie-launch-waitlist", "https://bumpgrade.com/api/audience/opt-in", "https://bumpgrade.com/api/audience/unsubscribe", "https://bumpgrade.com/api/admin/audience/notes", "https://bumpgrade.com/api/admin/audience/broadcasts/schedule-intents", "https://bumpgrade.com/admin/audience", "https://bumpgrade.com/funnels/source-data", "https://github.com/markitics/bumpgrade/issues/17", "https://github.com/markitics/bumpgrade/issues/85", "https://github.com/markitics/bumpgrade/issues/103", "https://github.com/markitics/bumpgrade/issues/137", "https://github.com/markitics/bumpgrade/issues/167", "https://github.com/markitics/bumpgrade/issues/169", "https://github.com/markitics/bumpgrade/issues/171", "https://github.com/markitics/bumpgrade/issues/173"]',
  happy_path_json = '["Fetch /audience/source-data.", "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, broadcast readiness counts, dry-run schedule intent counts, and write boundaries.", "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.", "Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.", "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, private CRM timeline notes, broadcast readiness, and schedule intents.", "Create a short owner CRM note with exact confirmation, idempotency, and the expected subscriber status.", "Record a dry-run broadcast schedule intent with exact confirmation, idempotency, expected readiness count, and current draft timestamp.", "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins, record unsubscribe/suppression evidence, store private owner notes, calculate broadcast readiness, and record dry-run schedule intents, but it is not a general contact import, provider send queue, or full CRM database.", "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, provider message IDs, send queue payloads, reasons, or private metadata.", "The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.", "Subscriber imports, direct agent contact writes, real email sends, broadcast dispatch, private exports, and CRM automation require future confirmed-write APIs.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent counts, and the opt-in/unsubscribe/note/schedule-intent write boundaries. Owner sessions can inspect private rows, create private notes, view broadcast readiness, and record dry-run schedule intents in /admin/audience. Direct agent subscriber writes, imports, sends, broadcast dispatch, private exports, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, sender-domain safety, and audit correlation.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, owner CRM note creation, owner dry-run broadcast schedule intent creation, unauthorized schedule-intent rejection, stale readiness rejection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.", "Issues #85, #103, #137, #167, #169, #171, and #173 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, owner CRM timeline note path, broadcast readiness path, and dry-run schedule intent path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
