CREATE TABLE IF NOT EXISTS audience_sequence_queue_consumer_readiness (
  id TEXT PRIMARY KEY,
  sequence_id TEXT NOT NULL,
  queue_producer_readiness_id TEXT NOT NULL,
  dispatch_attempt_id TEXT NOT NULL,
  dispatch_preflight_id TEXT NOT NULL,
  delivery_queue_message_id TEXT NOT NULL,
  delivery_batch_id TEXT NOT NULL,
  schedule_intent_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sequence_queue_consumer_readiness_recorded',
  queue_name TEXT NOT NULL,
  consumer_binding TEXT NOT NULL,
  consumer_mode TEXT NOT NULL,
  consumer_gate_status TEXT NOT NULL,
  producer_dependency_status TEXT NOT NULL,
  payload_read_policy TEXT NOT NULL,
  ack_policy TEXT NOT NULL,
  retry_policy TEXT NOT NULL,
  dead_letter_policy TEXT NOT NULL,
  idempotency_policy TEXT NOT NULL,
  audit_correlation_policy TEXT NOT NULL,
  provider_handoff_policy TEXT NOT NULL,
  backpressure_policy TEXT NOT NULL,
  expected_workspace_revision_id TEXT NOT NULL,
  expected_sequence_status TEXT NOT NULL,
  expected_ready_enrollment_count INTEGER NOT NULL DEFAULT 0,
  expected_queue_producer_readiness_status TEXT NOT NULL,
  dry_run_message_count INTEGER NOT NULL DEFAULT 0,
  held_enrollment_count INTEGER NOT NULL DEFAULT 0,
  active_suppression_count INTEGER NOT NULL DEFAULT 0,
  provider_limit_policy TEXT NOT NULL,
  provider_rate_limit_window TEXT NOT NULL,
  dispatch_mode TEXT NOT NULL,
  dispatch_result_status TEXT NOT NULL,
  suppression_check_status TEXT NOT NULL,
  unsubscribe_footer_check_status TEXT NOT NULL,
  sender_domain_gate_status TEXT NOT NULL,
  cloudflare_queue_consumer_enabled INTEGER NOT NULL DEFAULT 0,
  cloudflare_queue_messages_consumed INTEGER NOT NULL DEFAULT 0,
  cloudflare_queue_messages_acked INTEGER NOT NULL DEFAULT 0,
  queue_retry_records_created INTEGER NOT NULL DEFAULT 0,
  queue_dead_letter_records_created INTEGER NOT NULL DEFAULT 0,
  queue_payload_bodies_read INTEGER NOT NULL DEFAULT 0,
  queue_payload_bodies_created INTEGER NOT NULL DEFAULT 0,
  recipient_payloads_created INTEGER NOT NULL DEFAULT 0,
  personalized_bodies_created INTEGER NOT NULL DEFAULT 0,
  unsubscribe_urls_created INTEGER NOT NULL DEFAULT 0,
  provider_send_enabled INTEGER NOT NULL DEFAULT 0,
  provider_responses_created INTEGER NOT NULL DEFAULT 0,
  provider_message_ids_created INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_sequence_queue_consumer_readiness_idempotency_unique
  ON audience_sequence_queue_consumer_readiness(idempotency_key);

CREATE INDEX IF NOT EXISTS audience_sequence_queue_consumer_readiness_producer_idx
  ON audience_sequence_queue_consumer_readiness(queue_producer_readiness_id);

CREATE INDEX IF NOT EXISTS audience_sequence_queue_consumer_readiness_attempt_idx
  ON audience_sequence_queue_consumer_readiness(dispatch_attempt_id);

CREATE INDEX IF NOT EXISTS audience_sequence_queue_consumer_readiness_sequence_status_idx
  ON audience_sequence_queue_consumer_readiness(sequence_id, status);

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, aggregate sequence delivery readiness, dry-run sequence schedule intents, dry-run sequence delivery batches, dry-run sequence queue-message evidence, dry-run sequence dispatch preflight evidence, dry-run sequence dispatch attempt receipts, owner-reviewed sequence Queue producer readiness gates, owner-reviewed sequence Queue consumer readiness gates, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed import intents, owner-confirmed import preflights, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    'Issue #368 adds owner-reviewed sequence Queue consumer readiness gates without enabling Cloudflare Queue consumers, consuming or acking Queue messages, creating retry/dead-letter rows, reading queue payload bodies, creating queue payload bodies, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.'
  ),
  next_milestone = 'Add real contact imports, sequence scheduling, Cloudflare Queue producers, and consumers only after sender-domain, provider-event, provider rate-limit, provider response, send-payload, Queue producer, Queue consumer, import redaction, unsubscribe footer, suppression, audit checks, sequence delivery-readiness, sequence delivery-batch gates, sequence queue-message gates, sequence dispatch-preflight gates, sequence dispatch-attempt receipts, sequence Queue producer readiness, sequence Queue consumer readiness, delivery-batch gates, queue-message gates, dispatch preflight boundaries, and dispatch-attempt receipts stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_insert(COALESCE(issue_numbers_json, '[]'), '$[#]', 368),
  user_goal = REPLACE(
    user_goal,
    'owner-reviewed sequence Queue producer readiness gates, broadcast readiness',
    'owner-reviewed sequence Queue producer readiness gates, owner-reviewed sequence Queue consumer readiness gates, broadcast readiness'
  ),
  source_evidence_json = json_insert(
    COALESCE(source_evidence_json, '[]'),
    '$[#]',
    'https://bumpgrade.com/api/admin/audience/sequences/queue-consumer-readiness',
    '$[#]',
    'https://github.com/markitics/bumpgrade/issues/368'
  ),
  happy_path_json = json_insert(
    COALESCE(happy_path_json, '[]'),
    '$[#]',
    'Record sequence Queue consumer readiness from the current sequence Queue producer readiness record after workspace revision, sequence status, readiness, producer-readiness, payload-read, ack, retry, dead-letter, provider-handoff, backpressure, idempotency, audit, and redaction gates are checked.'
  ),
  edge_cases_json = json_insert(
    COALESCE(edge_cases_json, '[]'),
    '$[#]',
    'Sequence Queue consumer readiness records owner evidence only; it does not enable Cloudflare Queue consumers, consume or ack Queue messages, create retry/dead-letter rows, read queue payload bodies, create queue payload bodies, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, provider message IDs, or public agent sequence writes.'
  ),
  agent_access = REPLACE(
    agent_access,
    'record sequence Queue producer readiness gates, view broadcast readiness',
    'record sequence Queue producer readiness gates, record sequence Queue consumer readiness gates, view broadcast readiness'
  ),
  validation_json = json_insert(
    COALESCE(validation_json, '[]'),
    '$[#]',
    'Issue #368 records the owner-confirmed sequence Queue consumer readiness path after current sequence Queue producer readiness, workspace revision, sequence status, readiness, payload-read, ack, retry, dead-letter, provider-handoff, backpressure, idempotency, audit, and redaction checks.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
