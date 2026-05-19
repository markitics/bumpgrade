CREATE TABLE IF NOT EXISTS audience_suppression_entries (
  id TEXT PRIMARY KEY,
  email_hash TEXT NOT NULL,
  subscriber_id TEXT REFERENCES audience_subscribers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  suppression_kind TEXT NOT NULL DEFAULT 'unsubscribe',
  source_route TEXT NOT NULL,
  reason TEXT,
  idempotency_key TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_suppression_entries_idempotency_unique
  ON audience_suppression_entries(idempotency_key);
CREATE INDEX IF NOT EXISTS audience_suppression_entries_email_status_idx
  ON audience_suppression_entries(email_hash, status);
CREATE INDEX IF NOT EXISTS audience_suppression_entries_subscriber_status_idx
  ON audience_suppression_entries(subscriber_id, status);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Subscriber segments, live consent-backed opt-in capture, owner subscriber inspection, unsubscribe/suppression evidence, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Issue #167 adds POST /api/audience/unsubscribe with idempotent unsubscribe/suppression evidence and no list-membership leak.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add unsubscribe-safe email delivery, broadcast scheduling, and CRM timeline notes without exposing private contact data publicly.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, and the live consent/unsubscribe boundary before email sends exist.',
  source_evidence_json = '["https://bumpgrade.com/audience/source-data","https://bumpgrade.com/audience/indie-launch-waitlist","https://bumpgrade.com/api/audience/opt-in","https://bumpgrade.com/api/audience/unsubscribe","https://bumpgrade.com/admin/audience","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/17","https://github.com/markitics/bumpgrade/issues/85","https://github.com/markitics/bumpgrade/issues/103","https://github.com/markitics/bumpgrade/issues/137","https://github.com/markitics/bumpgrade/issues/167"]',
  happy_path_json = '["Fetch /audience/source-data.","Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, and write boundaries.","Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.","Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.","Confirm the API trims and normalizes email, records suppression evidence, marks a known subscriber unsubscribed, and does not reveal whether the submitted email was already on the list.","Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, and suppression totals.","Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins and record unsubscribe/suppression evidence, but it is not a general contact import or CRM database.","Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, reasons, or private metadata.","The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.","Subscriber imports, direct agent contact writes, email sends, broadcasts, private exports, and CRM notes require future confirmed-write APIs.","Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber and suppression counts, and the opt-in/unsubscribe write boundaries. Owner sessions can inspect private rows in /admin/audience. Direct agent subscriber writes, imports, sends, broadcasts, private exports, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber and suppression redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.","Issues #85, #103, #137, and #167 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, and unsubscribe/suppression path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,167]',
  edge_cases_json = '["Missing consent or invalid email returns public-safe validation errors.","Duplicate opt-in idempotency keys do not duplicate consent, tag, or sequence rows.","A later unsubscribe request records suppression evidence and marks a known subscriber unsubscribed without revealing list membership.","Email sending, imports, broadcasts, and CRM notes remain disabled.","Private contact metadata and provider IDs stay server-private."]',
  agent_access = 'Agents can read /audience/source-data, the opt-in write boundary, and the unsubscribe/suppression write boundary. Direct agent subscriber writes, imports, sends, broadcasts, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.',
  validation_json = '["Playwright covers source-data output, valid opt-in, unsubscribe, unknown-email suppression, validation failures, duplicate idempotency, and agent manifest discovery.","Issues #103 and #167 record the first live audience opt-in and unsubscribe/suppression paths."]',
  updated_at = unixepoch()
WHERE id = 'journey-visitor-joins-indie-launch-waitlist';
