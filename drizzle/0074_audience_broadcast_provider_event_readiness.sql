CREATE TABLE IF NOT EXISTS audience_broadcast_provider_event_readiness (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'provider_event_readiness_ready',
  provider_name TEXT NOT NULL,
  event_kinds_json TEXT NOT NULL,
  provider_event_boundary TEXT NOT NULL,
  bounce_handling_policy TEXT NOT NULL,
  complaint_handling_policy TEXT NOT NULL,
  delivery_event_policy TEXT NOT NULL,
  suppression_update_policy TEXT NOT NULL,
  audit_correlation_policy TEXT NOT NULL,
  raw_provider_payload_storage TEXT NOT NULL,
  provider_secret_status TEXT NOT NULL,
  sender_domain_gate_status TEXT NOT NULL,
  provider_send_enabled INTEGER NOT NULL DEFAULT 0,
  cloudflare_queue_producers_enabled INTEGER NOT NULL DEFAULT 0,
  recipient_payloads_created INTEGER NOT NULL DEFAULT 0,
  provider_responses_created INTEGER NOT NULL DEFAULT 0,
  provider_message_ids_created INTEGER NOT NULL DEFAULT 0,
  raw_provider_payloads_stored INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS audience_broadcast_provider_event_readiness_draft_status_idx
  ON audience_broadcast_provider_event_readiness(draft_id, status);

CREATE INDEX IF NOT EXISTS audience_broadcast_provider_event_readiness_provider_idx
  ON audience_broadcast_provider_event_readiness(provider_name, sender_domain_gate_status);

INSERT INTO audience_broadcast_provider_event_readiness (
  id, draft_id, status, provider_name, event_kinds_json, provider_event_boundary,
  bounce_handling_policy, complaint_handling_policy, delivery_event_policy,
  suppression_update_policy, audit_correlation_policy, raw_provider_payload_storage,
  provider_secret_status, sender_domain_gate_status, provider_send_enabled,
  cloudflare_queue_producers_enabled, recipient_payloads_created, provider_responses_created,
  provider_message_ids_created, raw_provider_payloads_stored, metadata_json, created_at, updated_at
) VALUES (
  'broadcast-provider-event-readiness-launch-window',
  'broadcast-draft-launch-window',
  'provider_event_readiness_ready',
  'provider_pending',
  '["bounce","complaint","delivered"]',
  'Future provider webhooks must normalize event kind, provider timestamp, redacted correlation IDs, and suppression intent before any private payload is retained.',
  'Future hard bounces must create or update suppression evidence before another send attempt can be queued.',
  'Future spam complaints must create suppression evidence and mark the subscriber out of future sends before provider retry.',
  'Future delivered/open/click event handling must stay aggregate-first until contact-specific analytics redaction is defined.',
  'Future provider events may update suppression state through hashed subscriber evidence only; public source-data must never expose raw recipient identity.',
  'Future event rows must carry broadcast draft id, dispatch attempt id, provider event readiness id, and redacted audit correlation id.',
  'raw_provider_payload_storage_disabled_redacted_events_only',
  'not_configured_provider_secrets_absent',
  'blocked_until_sender_domain_and_provider_event_alignment_verified',
  0,
  0,
  0,
  0,
  0,
  0,
  '{"issue":201,"providerSendEnabled":false,"cloudflareQueueProducersEnabled":false,"recipientPayloadsCreated":false,"providerResponsesCreated":false,"providerMessageIdsCreated":false,"rawProviderPayloadsStored":false,"providerSecretsIncluded":false,"rawProviderPayloadsIncluded":false}',
  unixepoch(),
  unixepoch()
) ON CONFLICT(id) DO UPDATE SET
  status=excluded.status,
  provider_name=excluded.provider_name,
  event_kinds_json=excluded.event_kinds_json,
  provider_event_boundary=excluded.provider_event_boundary,
  bounce_handling_policy=excluded.bounce_handling_policy,
  complaint_handling_policy=excluded.complaint_handling_policy,
  delivery_event_policy=excluded.delivery_event_policy,
  suppression_update_policy=excluded.suppression_update_policy,
  audit_correlation_policy=excluded.audit_correlation_policy,
  raw_provider_payload_storage=excluded.raw_provider_payload_storage,
  provider_secret_status=excluded.provider_secret_status,
  sender_domain_gate_status=excluded.sender_domain_gate_status,
  provider_send_enabled=excluded.provider_send_enabled,
  cloudflare_queue_producers_enabled=excluded.cloudflare_queue_producers_enabled,
  recipient_payloads_created=excluded.recipient_payloads_created,
  provider_responses_created=excluded.provider_responses_created,
  provider_message_ids_created=excluded.provider_message_ids_created,
  raw_provider_payloads_stored=excluded.raw_provider_payloads_stored,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Issue #167 adds POST /api/audience/unsubscribe with idempotent unsubscribe/suppression evidence and no list-membership leak.", "Issue #169 adds owner-gated private audience CRM timeline notes with aggregate public redaction.", "Issue #171 adds suppression-aware broadcast draft readiness without send queues or provider message IDs.", "Issue #173 adds owner-confirmed dry-run broadcast schedule intents without recipient payloads or email sends.", "Issue #175 adds broadcast preview and unsubscribe-footer safety records without send queues.", "Issue #177 adds broadcast delivery queue readiness contracts without live queue producers or provider sends.", "Issue #183 adds owner-confirmed delivery-batch dry runs without recipient payloads, queue messages, or provider sends.", "Issue #189 adds owner-confirmed dry-run delivery queue message evidence without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.", "Issue #191 adds owner-confirmed dispatch preflight dry runs without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.", "Issue #197 adds owner-confirmed dispatch attempt receipts without Cloudflare Queue producers, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs.", "Issue #199 adds sender-domain readiness gates without private DNS credentials, Cloudflare Queue producers, recipient payloads, provider sends, provider responses, or provider message IDs.", "Issue #201 adds provider-event readiness gates without provider secrets, raw provider payloads, recipient payloads, provider sends, provider responses, or provider message IDs.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add real Cloudflare Queue producers only after sender-domain, provider-event, unsubscribe footer, suppression, provider limits, audit checks, delivery-batch gates, queue-message gates, dispatch preflight boundaries, dispatch-attempt receipts, and provider-response handling stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171,173,175,177,183,189,191,197,199,201]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, broadcast readiness, dry-run schedule intents, preview/footer safety, queue readiness, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, and the live consent/unsubscribe/note/delivery boundary before email sends exist.',
  happy_path_json = '["Fetch /audience/source-data.", "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, broadcast readiness counts, dry-run schedule intent counts, preview/footer safety records, queue readiness records, delivery-batch dry-run counts, dry-run queue-message counts, dispatch preflight counts, dispatch attempt counts, sender-domain readiness records, provider-event readiness records, and write boundaries.", "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, private CRM timeline notes, broadcast readiness, schedule intents, preview safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, sender-domain readiness gates, and provider-event readiness gates.", "Record dry-run delivery and dispatch evidence only after queue, sender-domain, provider-event, suppression, unsubscribe, stale-state, and audit gates are checked.", "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can expose sender-domain and provider-event readiness gates, but it is not a general contact import, live Cloudflare Queue producer, provider-send path, provider webhook receiver, or full CRM database.", "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, private DNS credentials, raw DNS records, provider secrets, raw provider payloads, recipient payloads, provider message IDs, provider responses, Cloudflare Queue message bodies, send queue payloads, delivery payloads, reasons, or private metadata.", "Subscriber imports, direct agent contact writes, real email sends, provider webhook processing, private exports, and CRM automation require future confirmed-write APIs."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety/queue readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/sender-domain/provider-event readiness counts, and the opt-in/unsubscribe/note/schedule-intent/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt write boundaries. Owner sessions can inspect private rows, create private notes, view broadcast readiness, inspect preview safety, queue readiness, sender-domain readiness, and provider-event readiness, and record dry-run schedule intents, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, and dispatch attempt receipts in /admin/audience. Direct agent subscriber writes, imports, real sends, private exports, provider setup, provider webhooks, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, sender-domain safety, provider-event safety, queue safety, provider limits, and audit correlation.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety/queue readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/sender-domain/provider-event readiness redaction, /audience/indie-launch-waitlist, owner /admin/audience inspection, sitemap discovery, and agent manifest discovery.", "Issues #85, #103, #137, #167, #169, #171, #173, #175, #177, #183, #189, #191, #197, #199, and #201 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, owner CRM timeline note path, broadcast readiness path, dry-run broadcast schedule intent path, broadcast preview safety path, queue readiness path, delivery-batch dry-run path, queue-message dry-run path, dispatch-preflight dry-run path, dispatch-attempt receipt path, sender-domain readiness path, and provider-event readiness path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
