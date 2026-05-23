CREATE TABLE IF NOT EXISTS audience_sequence_delivery_result_readiness (
  id TEXT PRIMARY KEY,
  sequence_id TEXT NOT NULL,
  delivery_attempt_readiness_id TEXT NOT NULL,
  provider_call_readiness_id TEXT NOT NULL,
  queue_consumer_readiness_id TEXT NOT NULL,
  queue_producer_readiness_id TEXT NOT NULL,
  dispatch_attempt_id TEXT NOT NULL,
  dispatch_preflight_id TEXT NOT NULL,
  delivery_queue_message_id TEXT NOT NULL,
  delivery_batch_id TEXT NOT NULL,
  schedule_intent_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sequence_delivery_result_readiness_recorded',
  queue_name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  provider_mode TEXT NOT NULL,
  delivery_result_gate_status TEXT NOT NULL,
  delivery_attempt_dependency_status TEXT NOT NULL,
  provider_response_policy TEXT NOT NULL,
  provider_message_id_policy TEXT NOT NULL,
  delivery_attempt_policy TEXT NOT NULL,
  delivery_result_policy TEXT NOT NULL,
  idempotency_policy TEXT NOT NULL,
  audit_correlation_policy TEXT NOT NULL,
  backpressure_policy TEXT NOT NULL,
  expected_workspace_revision_id TEXT NOT NULL,
  expected_sequence_status TEXT NOT NULL,
  expected_ready_enrollment_count INTEGER NOT NULL DEFAULT 0,
  expected_delivery_attempt_readiness_status TEXT NOT NULL,
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
  delivery_result_enabled INTEGER NOT NULL DEFAULT 0,
  delivery_attempts_created INTEGER NOT NULL DEFAULT 0,
  delivery_results_created INTEGER NOT NULL DEFAULT 0,
  delivery_status_webhooks_processed INTEGER NOT NULL DEFAULT 0,
  delivery_receipts_created INTEGER NOT NULL DEFAULT 0,
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

CREATE UNIQUE INDEX IF NOT EXISTS audience_sequence_delivery_result_readiness_idempotency_unique
  ON audience_sequence_delivery_result_readiness(idempotency_key);

CREATE INDEX IF NOT EXISTS audience_sequence_delivery_result_readiness_attempt_readiness_idx
  ON audience_sequence_delivery_result_readiness(delivery_attempt_readiness_id);

CREATE INDEX IF NOT EXISTS audience_sequence_delivery_result_readiness_provider_call_idx
  ON audience_sequence_delivery_result_readiness(provider_call_readiness_id);

CREATE INDEX IF NOT EXISTS audience_sequence_delivery_result_readiness_attempt_idx
  ON audience_sequence_delivery_result_readiness(dispatch_attempt_id);

CREATE INDEX IF NOT EXISTS audience_sequence_delivery_result_readiness_sequence_status_idx
  ON audience_sequence_delivery_result_readiness(sequence_id, status);

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, aggregate sequence delivery readiness, dry-run sequence schedule intents, dry-run sequence delivery batches, dry-run sequence queue-message evidence, dry-run sequence dispatch preflight evidence, dry-run sequence dispatch attempt receipts, owner-reviewed sequence Queue producer readiness gates, owner-reviewed sequence Queue consumer readiness gates, owner-reviewed sequence provider-call readiness gates, owner-reviewed sequence delivery-attempt readiness gates, owner-reviewed sequence delivery-result readiness gates, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, provider-call readiness gates, delivery-attempt readiness gates, delivery-result readiness gates, owner-confirmed import intents, owner-confirmed import preflights, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    'Issue #374 adds owner-reviewed sequence delivery-result readiness gates from current delivery-attempt readiness without enabling provider calls, sends, responses, message IDs, delivery attempts, delivery results, webhooks, receipts, Cloudflare Queue consumption, Queue acknowledgements, retry/dead-letter rows, queue payload body reads, recipient payloads, personalized bodies, or unsubscribe URLs.'
  ),
  next_milestone = 'Add real contact imports, sequence scheduling, Cloudflare Queue producers/consumers, provider calls, delivery attempts, and delivery results only after sender-domain, provider-event, provider rate-limit, provider response, send-payload, Queue producer, Queue consumer, provider-call, delivery-attempt, delivery-result, import redaction, unsubscribe footer, suppression, audit checks, sequence delivery-readiness, sequence delivery-batch gates, sequence queue-message gates, sequence dispatch-preflight gates, and sequence dispatch-attempt receipts stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_insert(COALESCE(issue_numbers_json, '[]'), '$[#]', 374),
  user_goal = REPLACE(
    user_goal,
    'owner-reviewed sequence delivery-attempt readiness gates, broadcast readiness',
    'owner-reviewed sequence delivery-attempt readiness gates, owner-reviewed sequence delivery-result readiness gates, broadcast readiness'
  ),
  source_evidence_json = json_insert(
    COALESCE(source_evidence_json, '[]'),
    '$[#]',
    'https://bumpgrade.com/api/admin/audience/sequences/delivery-result-readiness',
    '$[#]',
    'https://github.com/markitics/bumpgrade/issues/374'
  ),
  happy_path_json = json_insert(
    COALESCE(happy_path_json, '[]'),
    '$[#]',
    'Record sequence delivery-result readiness from the current sequence delivery-attempt readiness record after workspace revision, sequence status, readiness, delivery-attempt, provider-response, message-ID, delivery-result, backpressure, idempotency, audit, and redaction gates are checked.'
  ),
  edge_cases_json = json_insert(
    COALESCE(edge_cases_json, '[]'),
    '$[#]',
    'Sequence delivery-result readiness records owner evidence only; it does not call providers, send messages, create provider responses, create provider message IDs, create delivery attempts or results, process webhooks, create receipts, consume or ack Queue messages, create retry/dead-letter rows, read queue payload bodies, create recipient payloads, personalized bodies, unsubscribe URLs, or public agent sequence writes.'
  ),
  agent_access = REPLACE(
    agent_access,
    'record sequence delivery-attempt readiness gates, view broadcast readiness',
    'record sequence delivery-attempt readiness gates, record sequence delivery-result readiness gates, view broadcast readiness'
  ),
  validation_json = json_insert(
    COALESCE(validation_json, '[]'),
    '$[#]',
    'Issue #374 records the owner-confirmed sequence delivery-result readiness path after current sequence delivery-attempt readiness, workspace revision, sequence status, readiness, provider-response, message-ID, delivery-result, backpressure, idempotency, audit, and redaction checks.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
