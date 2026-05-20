CREATE TABLE IF NOT EXISTS audience_broadcast_queue_readiness (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queue_readiness_ready',
  queue_name TEXT NOT NULL,
  queue_mode TEXT NOT NULL DEFAULT 'dry_run_contract',
  retry_policy TEXT NOT NULL,
  suppression_check_policy TEXT NOT NULL,
  unsubscribe_footer_check_policy TEXT NOT NULL,
  sender_domain_gate TEXT NOT NULL,
  audit_correlation_policy TEXT NOT NULL,
  provider_send_enabled INTEGER NOT NULL DEFAULT 0,
  recipient_payloads_created INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS audience_broadcast_queue_readiness_draft_status_idx
  ON audience_broadcast_queue_readiness(draft_id, status);

CREATE INDEX IF NOT EXISTS audience_broadcast_queue_readiness_mode_updated_idx
  ON audience_broadcast_queue_readiness(queue_mode, updated_at);

INSERT INTO audience_broadcast_queue_readiness (
  id, draft_id, status, queue_name, queue_mode, retry_policy, suppression_check_policy,
  unsubscribe_footer_check_policy, sender_domain_gate, audit_correlation_policy,
  provider_send_enabled, recipient_payloads_created, metadata_json, created_at, updated_at
) VALUES (
  'broadcast-queue-readiness-launch-window',
  'broadcast-draft-launch-window',
  'queue_readiness_ready',
  'audience-broadcast-delivery-dry-run',
  'dry_run_contract',
  'Future queue workers must use bounded retry with audit correlation, recipient revalidation, and no provider retry before sender-domain verification.',
  'Future producer must re-check active suppression and subscriber status immediately before queue row creation.',
  'Future producer must require an unsubscribe footer tied to /api/audience/unsubscribe before queue row creation.',
  'sender_domain_pending',
  'Future queue rows must carry owner action id, broadcast draft id, readiness snapshot id, and idempotency key.',
  0,
  0,
  '{"issue":177,"providerSendEnabled":false,"recipientPayloadsCreated":false,"sendQueueRowsCreated":false,"providerMessageIdsIncluded":false}',
  unixepoch(),
  unixepoch()
) ON CONFLICT(id) DO UPDATE SET
  status=excluded.status,
  queue_name=excluded.queue_name,
  queue_mode=excluded.queue_mode,
  retry_policy=excluded.retry_policy,
  suppression_check_policy=excluded.suppression_check_policy,
  unsubscribe_footer_check_policy=excluded.unsubscribe_footer_check_policy,
  sender_domain_gate=excluded.sender_domain_gate,
  audit_correlation_policy=excluded.audit_correlation_policy,
  provider_send_enabled=excluded.provider_send_enabled,
  recipient_payloads_created=excluded.recipient_payloads_created,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Issue #167 adds POST /api/audience/unsubscribe with idempotent unsubscribe/suppression evidence and no list-membership leak.", "Issue #169 adds owner-gated private audience CRM timeline notes with aggregate public redaction.", "Issue #171 adds suppression-aware broadcast draft readiness without send queues or provider message IDs.", "Issue #173 adds owner-confirmed dry-run broadcast schedule intents without recipient payloads or email sends.", "Issue #175 adds broadcast preview and unsubscribe-footer safety records without send queues.", "Issue #177 adds broadcast delivery queue readiness contracts without live queue producers or provider sends.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add real queue producers only after sender-domain, unsubscribe footer, suppression, audit, and provider-send boundaries stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171,173,175,177]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, broadcast readiness, dry-run schedule intents, preview/footer safety, queue readiness, and the live consent/unsubscribe/note boundary before email sends exist.',
  happy_path_json = '["Fetch /audience/source-data.", "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, broadcast readiness counts, dry-run schedule intent counts, preview/footer safety records, queue readiness records, and write boundaries.", "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.", "Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.", "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, private CRM timeline notes, broadcast readiness, schedule intents, preview safety, and queue readiness.", "Create a short owner CRM note with exact confirmation, idempotency, and the expected subscriber status.", "Record a dry-run broadcast schedule intent with exact confirmation, idempotency, expected readiness count, and current draft timestamp.", "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins, record unsubscribe/suppression evidence, store private owner notes, calculate broadcast readiness, record dry-run schedule intents, expose preview safety metadata, and expose queue readiness metadata, but it is not a general contact import, provider send queue, or full CRM database.", "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, provider message IDs, send queue payloads, recipient payloads, personalized bodies, reasons, or private metadata.", "The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.", "Subscriber imports, direct agent contact writes, real email sends, broadcast dispatch, private exports, and CRM automation require future confirmed-write APIs.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety/queue readiness counts, and the opt-in/unsubscribe/note/schedule-intent write boundaries. Owner sessions can inspect private rows, create private notes, view broadcast readiness, inspect preview/footer safety and queue readiness, and record dry-run schedule intents in /admin/audience. Direct agent subscriber writes, imports, sends, broadcast dispatch, private exports, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, sender-domain safety, queue safety, and audit correlation.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety/queue readiness redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, owner CRM note creation, owner dry-run broadcast schedule intent creation, unauthorized schedule-intent rejection, stale readiness rejection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.", "Issues #85, #103, #137, #167, #169, #171, #173, #175, and #177 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, owner CRM timeline note path, broadcast readiness path, dry-run broadcast schedule intent path, preview/footer safety path, and queue readiness path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
