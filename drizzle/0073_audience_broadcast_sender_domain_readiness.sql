CREATE TABLE IF NOT EXISTS audience_broadcast_sender_domain_readiness (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sender_domain_pending_verification',
  domain TEXT NOT NULL,
  intended_from_address TEXT NOT NULL,
  from_address_policy TEXT NOT NULL,
  reply_path_policy TEXT NOT NULL,
  bounce_handling_policy TEXT NOT NULL,
  spf_alignment_status TEXT NOT NULL,
  dkim_alignment_status TEXT NOT NULL,
  dmarc_alignment_status TEXT NOT NULL,
  sender_domain_gate_status TEXT NOT NULL,
  verification_evidence_status TEXT NOT NULL,
  provider_send_enabled INTEGER NOT NULL DEFAULT 0,
  cloudflare_queue_producers_enabled INTEGER NOT NULL DEFAULT 0,
  recipient_payloads_created INTEGER NOT NULL DEFAULT 0,
  provider_responses_created INTEGER NOT NULL DEFAULT 0,
  provider_message_ids_created INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS audience_broadcast_sender_domain_readiness_draft_status_idx
  ON audience_broadcast_sender_domain_readiness(draft_id, status);

CREATE INDEX IF NOT EXISTS audience_broadcast_sender_domain_readiness_domain_idx
  ON audience_broadcast_sender_domain_readiness(domain, sender_domain_gate_status);

INSERT INTO audience_broadcast_sender_domain_readiness (
  id, draft_id, status, domain, intended_from_address, from_address_policy,
  reply_path_policy, bounce_handling_policy, spf_alignment_status, dkim_alignment_status,
  dmarc_alignment_status, sender_domain_gate_status, verification_evidence_status,
  provider_send_enabled, cloudflare_queue_producers_enabled, recipient_payloads_created,
  provider_responses_created, provider_message_ids_created, metadata_json, created_at, updated_at
) VALUES (
  'broadcast-sender-domain-readiness-bumpgrade-com',
  'broadcast-draft-launch-window',
  'sender_domain_pending_verification',
  'bumpgrade.com',
  'updates@bumpgrade.com',
  'Future publisher broadcasts must use an aligned bumpgrade.com From address after SPF, DKIM, and DMARC evidence is recorded for the selected provider.',
  'Future replies and bounces must route through an aligned, monitored path before provider sends are enabled.',
  'Future provider integration must capture bounce and complaint evidence before Cloudflare Queue producers can hand off live payloads.',
  'pending_verification',
  'pending_verification',
  'pending_verification',
  'blocked_until_dns_and_provider_alignment_verified',
  'no_live_provider_send_evidence_recorded',
  0,
  0,
  0,
  0,
  0,
  '{"issue":199,"providerSendEnabled":false,"cloudflareQueueProducersEnabled":false,"recipientPayloadsCreated":false,"providerResponsesCreated":false,"providerMessageIdsCreated":false,"privateDnsCredentialsIncluded":false,"rawDnsRecordsIncluded":false,"providerSecretsIncluded":false}',
  unixepoch(),
  unixepoch()
) ON CONFLICT(id) DO UPDATE SET
  status=excluded.status,
  domain=excluded.domain,
  intended_from_address=excluded.intended_from_address,
  from_address_policy=excluded.from_address_policy,
  reply_path_policy=excluded.reply_path_policy,
  bounce_handling_policy=excluded.bounce_handling_policy,
  spf_alignment_status=excluded.spf_alignment_status,
  dkim_alignment_status=excluded.dkim_alignment_status,
  dmarc_alignment_status=excluded.dmarc_alignment_status,
  sender_domain_gate_status=excluded.sender_domain_gate_status,
  verification_evidence_status=excluded.verification_evidence_status,
  provider_send_enabled=excluded.provider_send_enabled,
  cloudflare_queue_producers_enabled=excluded.cloudflare_queue_producers_enabled,
  recipient_payloads_created=excluded.recipient_payloads_created,
  provider_responses_created=excluded.provider_responses_created,
  provider_message_ids_created=excluded.provider_message_ids_created,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Issue #167 adds POST /api/audience/unsubscribe with idempotent unsubscribe/suppression evidence and no list-membership leak.", "Issue #169 adds owner-gated private audience CRM timeline notes with aggregate public redaction.", "Issue #171 adds suppression-aware broadcast draft readiness without send queues or provider message IDs.", "Issue #173 adds owner-confirmed dry-run broadcast schedule intents without recipient payloads or email sends.", "Issue #175 adds broadcast preview and unsubscribe-footer safety records without send queues.", "Issue #177 adds broadcast delivery queue readiness contracts without live queue producers or provider sends.", "Issue #183 adds owner-confirmed delivery-batch dry runs without recipient payloads, queue messages, or provider sends.", "Issue #189 adds owner-confirmed dry-run delivery queue message evidence without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.", "Issue #191 adds owner-confirmed dispatch preflight dry runs without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.", "Issue #197 adds owner-confirmed dispatch attempt receipts without Cloudflare Queue producers, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs.", "Issue #199 adds sender-domain readiness gates without private DNS credentials, Cloudflare Queue producers, recipient payloads, provider sends, provider responses, or provider message IDs.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add real Cloudflare Queue producers only after sender-domain, unsubscribe footer, suppression, provider limits, audit checks, delivery-batch gates, queue-message gates, dispatch preflight boundaries, dispatch-attempt receipts, and provider-response handling stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171,173,175,177,183,189,191,197,199]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, broadcast readiness, dry-run schedule intents, preview/footer safety, queue readiness, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, and the live consent/unsubscribe/note/delivery boundary before email sends exist.',
  happy_path_json = '["Fetch /audience/source-data.", "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, broadcast readiness counts, dry-run schedule intent counts, preview/footer safety records, queue readiness records, delivery-batch dry-run counts, dry-run queue-message counts, dispatch preflight counts, dispatch attempt counts, sender-domain readiness records, and write boundaries.", "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.", "Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.", "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, private CRM timeline notes, broadcast readiness, schedule intents, preview safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, and sender-domain readiness gates.", "Create a short owner CRM note with exact confirmation, idempotency, and the expected subscriber status.", "Record a dry-run broadcast schedule intent with exact confirmation, idempotency, expected readiness count, and current draft timestamp.", "Record a delivery-batch dry run from the current schedule intent after queue readiness, preview safety, sender-domain gate, and suppression counts are checked.", "Record dry-run delivery queue message evidence from the current delivery batch after stale-state and dry-run queue gates are checked.", "Record dispatch preflight evidence from the current queue-message dry run after provider-limit, sender-domain, unsubscribe, suppression, and audit gates are checked.", "Record a dispatch attempt receipt from the current dispatch preflight after queue-producer and provider-response gates are checked.", "Use sender-domain readiness records to confirm live sends remain blocked until SPF, DKIM, DMARC, reply-path, bounce, and provider evidence are aligned.", "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins, record unsubscribe/suppression evidence, store private owner notes, calculate broadcast readiness, record dry-run schedule intent metadata, expose preview safety metadata, expose queue readiness metadata, record delivery-batch dry runs, record aggregate dry-run queue-message evidence, record dispatch preflight evidence, record dispatch attempt receipts, and expose sender-domain readiness gates, but it is not a general contact import, live Cloudflare Queue producer, provider-send path, or full CRM database.", "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, private DNS credentials, raw DNS records, provider secrets, recipient payloads, provider message IDs, provider responses, Cloudflare Queue message bodies, send queue payloads, reasons, delivery payloads, or private metadata.", "The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.", "Subscriber imports, direct agent contact writes, real email sends, broadcast dispatch, private exports, and CRM automation require future confirmed-write APIs.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety/queue readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/sender-domain readiness counts, and the opt-in/unsubscribe/note/schedule-intent/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt write boundaries. Owner sessions can inspect private rows, create private notes, view broadcast readiness, inspect preview safety, queue readiness, and sender-domain readiness, and record dry-run schedule intents, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, and dispatch attempt receipts in /admin/audience. Direct agent subscriber writes, imports, real sends, private exports, provider setup, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, sender-domain safety, queue safety, provider limits, and audit correlation.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety/queue readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/sender-domain readiness redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, owner CRM note creation, owner dry-run broadcast schedule intent creation, owner delivery-batch dry-run creation, owner queue-message dry-run creation, owner dispatch-preflight dry-run creation, owner dispatch-attempt receipt creation, unauthorized schedule/delivery/queue-message/dispatch-preflight/dispatch-attempt rejection, stale readiness rejection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.", "Issues #85, #103, #137, #167, #169, #171, #173, #175, #177, #183, #189, #191, #197, and #199 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, owner CRM timeline note path, broadcast readiness path, dry-run broadcast schedule intent path, broadcast preview safety path, queue readiness path, delivery-batch dry-run path, queue-message dry-run path, dispatch-preflight dry-run path, dispatch-attempt receipt path, and sender-domain readiness path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
