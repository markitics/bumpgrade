CREATE TABLE IF NOT EXISTS audience_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  first_name TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed',
  source_form_id TEXT NOT NULL,
  source_segment_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_subscribers_email_unique
  ON audience_subscribers(email);
CREATE INDEX IF NOT EXISTS audience_subscribers_status_created_idx
  ON audience_subscribers(status, created_at);
CREATE INDEX IF NOT EXISTS audience_subscribers_email_hash_idx
  ON audience_subscribers(email_hash);

CREATE TABLE IF NOT EXISTS audience_consent_events (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL REFERENCES audience_subscribers(id) ON DELETE CASCADE,
  form_id TEXT NOT NULL,
  consent_statement TEXT NOT NULL,
  consent_kind TEXT NOT NULL DEFAULT 'launch_follow_up',
  status TEXT NOT NULL DEFAULT 'consented',
  idempotency_key TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  metadata_json TEXT,
  consented_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_consent_events_idempotency_unique
  ON audience_consent_events(idempotency_key);
CREATE INDEX IF NOT EXISTS audience_consent_events_subscriber_idx
  ON audience_consent_events(subscriber_id, consented_at);

CREATE TABLE IF NOT EXISTS audience_tag_assignments (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL REFERENCES audience_subscribers(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL,
  source_form_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  idempotency_key TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_tag_assignments_subscriber_tag_unique
  ON audience_tag_assignments(subscriber_id, tag_id);
CREATE UNIQUE INDEX IF NOT EXISTS audience_tag_assignments_idempotency_unique
  ON audience_tag_assignments(idempotency_key);

CREATE TABLE IF NOT EXISTS audience_sequence_enrollments (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL REFERENCES audience_subscribers(id) ON DELETE CASCADE,
  sequence_id TEXT NOT NULL,
  source_form_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft_enrolled',
  idempotency_key TEXT NOT NULL,
  next_step_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_sequence_enrollments_subscriber_sequence_unique
  ON audience_sequence_enrollments(subscriber_id, sequence_id);
CREATE UNIQUE INDEX IF NOT EXISTS audience_sequence_enrollments_idempotency_unique
  ON audience_sequence_enrollments(idempotency_key);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Subscriber segments, live consent-backed opt-in capture, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Issue #17 owns email marketing, list growth, CRM-lite, and automations.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add unsubscribe-safe email delivery and subscriber inspection without exposing private contact data.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, and the live consent-backed capture boundary before email sends exist.',
  source_evidence_json = '["https://bumpgrade.com/audience/source-data","https://bumpgrade.com/audience/indie-launch-waitlist","https://bumpgrade.com/api/audience/opt-in","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/17","https://github.com/markitics/bumpgrade/issues/85","https://github.com/markitics/bumpgrade/issues/103"]',
  happy_path_json = '["Fetch /audience/source-data.","Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, and write boundary.","Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.","Confirm the API trims and normalizes email, stores consent evidence, assigns seeded tags, and records draft sequence enrollment without sending email.","Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins, but it is not a general contact import or CRM database.","Subscriber imports, direct agent contact writes, email sends, broadcasts, unsubscribe changes, and CRM notes require future confirmed-write APIs.","Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data and the opt-in write boundary. Direct agent subscriber writes, imports, sends, unsubscribes, broadcasts, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.',
  validation_json = '["Playwright covers /audience/source-data, /audience/indie-launch-waitlist, valid opt-in, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.","Issues #85 and #103 record the audience automation source-data contract and first live opt-in capture path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-visitor-joins-indie-launch-waitlist',
  'Visitor joins the indie launch waitlist',
  'feature-email-automation-crm',
  'pending',
  '[17,85,103]',
  'Visitor interested in the launch checklist',
  'Submit a normalized email and explicit consent, then receive a safe confirmation that Bumpgrade recorded the opt-in without sending email yet.',
  '["https://bumpgrade.com/audience/indie-launch-waitlist","https://bumpgrade.com/audience/source-data","https://bumpgrade.com/api/audience/opt-in","https://github.com/markitics/bumpgrade/issues/17","https://github.com/markitics/bumpgrade/issues/85","https://github.com/markitics/bumpgrade/issues/103"]',
  '["Open /audience/indie-launch-waitlist.","Enter an email with optional first name and check consent.","Submit the form to /api/audience/opt-in.","Bumpgrade trims and normalizes the email, stores subscriber and consent evidence, assigns seeded tags, and records draft sequence enrollment.","The response confirms the normalized email and states email delivery is disabled."]',
  '["Missing consent or invalid email returns public-safe validation errors.","Duplicate idempotency keys do not duplicate consent, tag, or sequence rows.","Email sending, imports, unsubscribe management, broadcasts, and CRM notes remain disabled.","Private contact metadata and provider IDs stay server-private."]',
  'Agents can read /audience/source-data and the opt-in write boundary. Direct agent subscriber writes, imports, sends, unsubscribes, broadcasts, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.',
  '["Playwright covers source-data output, valid opt-in, validation failures, duplicate idempotency, and agent manifest discovery.","Issue #103 records the first live audience opt-in capture path."]',
  51,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  feature_id=excluded.feature_id,
  feature_status=excluded.feature_status,
  issue_numbers_json=excluded.issue_numbers_json,
  primary_user=excluded.primary_user,
  user_goal=excluded.user_goal,
  source_evidence_json=excluded.source_evidence_json,
  happy_path_json=excluded.happy_path_json,
  edge_cases_json=excluded.edge_cases_json,
  agent_access=excluded.agent_access,
  validation_json=excluded.validation_json,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;
