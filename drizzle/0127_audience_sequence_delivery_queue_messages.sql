CREATE TABLE IF NOT EXISTS audience_sequence_delivery_queue_messages (
  id TEXT PRIMARY KEY,
  sequence_id TEXT NOT NULL,
  delivery_batch_id TEXT NOT NULL,
  schedule_intent_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'delivery_queue_messages_dry_run_recorded',
  queue_name TEXT NOT NULL,
  queue_mode TEXT NOT NULL DEFAULT 'dry_run_contract',
  expected_workspace_revision_id TEXT NOT NULL,
  expected_sequence_status TEXT NOT NULL,
  expected_ready_enrollment_count INTEGER NOT NULL DEFAULT 0,
  dry_run_message_count INTEGER NOT NULL DEFAULT 0,
  held_enrollment_count INTEGER NOT NULL DEFAULT 0,
  active_suppression_count INTEGER NOT NULL DEFAULT 0,
  retry_policy TEXT NOT NULL,
  dispatch_policy TEXT NOT NULL,
  unsubscribe_footer_check_status TEXT NOT NULL,
  sender_domain_gate_status TEXT NOT NULL,
  provider_send_enabled INTEGER NOT NULL DEFAULT 0,
  delivery_queue_rows_created INTEGER NOT NULL DEFAULT 0,
  cloudflare_queue_messages_created INTEGER NOT NULL DEFAULT 0,
  queue_payload_bodies_created INTEGER NOT NULL DEFAULT 0,
  recipient_payloads_created INTEGER NOT NULL DEFAULT 0,
  personalized_bodies_created INTEGER NOT NULL DEFAULT 0,
  unsubscribe_urls_created INTEGER NOT NULL DEFAULT 0,
  provider_message_ids_created INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_sequence_delivery_queue_messages_idempotency_unique
  ON audience_sequence_delivery_queue_messages(idempotency_key);

CREATE INDEX IF NOT EXISTS audience_sequence_delivery_queue_messages_batch_idx
  ON audience_sequence_delivery_queue_messages(delivery_batch_id);

CREATE INDEX IF NOT EXISTS audience_sequence_delivery_queue_messages_sequence_status_idx
  ON audience_sequence_delivery_queue_messages(sequence_id, status);

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, aggregate sequence delivery readiness, owner-confirmed dry-run sequence schedule intents, dry-run sequence delivery batches, dry-run sequence queue-message evidence, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed import intents, owner-confirmed import preflights, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    'Issue #360 adds owner-confirmed dry-run sequence queue-message evidence without Cloudflare Queue messages, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.'
  ),
  next_milestone = 'Add real contact imports, sequence scheduling, Cloudflare Queue producers, and consumers only after sender-domain, provider-event, provider rate-limit, provider response, send-payload, Queue producer, Queue consumer, import redaction, unsubscribe footer, suppression, audit checks, sequence delivery-readiness, sequence delivery-batch gates, sequence queue-message gates, delivery-batch gates, queue-message gates, dispatch preflight boundaries, and dispatch-attempt receipts stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_insert(COALESCE(issue_numbers_json, '[]'), '$[#]', 360),
  user_goal = REPLACE(
    user_goal,
    'dry-run sequence delivery batches, broadcast readiness',
    'dry-run sequence delivery batches, dry-run sequence queue-message evidence, broadcast readiness'
  ),
  source_evidence_json = json_insert(
    COALESCE(source_evidence_json, '[]'),
    '$[#]',
    'https://bumpgrade.com/api/admin/audience/sequences/delivery-queue-messages',
    '$[#]',
    'https://github.com/markitics/bumpgrade/issues/360'
  ),
  happy_path_json = json_insert(
    COALESCE(happy_path_json, '[]'),
    '$[#]',
    'Record dry-run sequence queue-message evidence from the current sequence delivery batch after workspace revision, sequence status, readiness, dry-run queue, suppression, unsubscribe-footer, sender-domain, and idempotency gates are checked.'
  ),
  edge_cases_json = json_insert(
    COALESCE(edge_cases_json, '[]'),
    '$[#]',
    'Sequence queue-message dry runs record aggregate owner evidence only; they do not create Cloudflare Queue messages, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, provider message IDs, or public agent sequence writes.'
  ),
  agent_access = REPLACE(
    agent_access,
    'record dry-run sequence delivery batches, view broadcast readiness',
    'record dry-run sequence delivery batches, record dry-run sequence queue-message evidence, view broadcast readiness'
  ),
  validation_json = json_insert(
    COALESCE(validation_json, '[]'),
    '$[#]',
    'Issue #360 records the owner-confirmed dry-run sequence queue-message path after sequence delivery batch, workspace revision, sequence status, readiness, suppression, unsubscribe-footer, sender-domain, idempotency, and redaction checks.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
