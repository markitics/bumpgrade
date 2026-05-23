CREATE TABLE IF NOT EXISTS audience_sequence_delivery_batches (
  id TEXT PRIMARY KEY,
  sequence_id TEXT NOT NULL,
  schedule_intent_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'delivery_batch_dry_run_recorded',
  queue_name TEXT NOT NULL,
  queue_mode TEXT NOT NULL DEFAULT 'dry_run_contract',
  expected_workspace_revision_id TEXT NOT NULL,
  expected_sequence_status TEXT NOT NULL,
  expected_ready_enrollment_count INTEGER NOT NULL DEFAULT 0,
  ready_enrollment_count INTEGER NOT NULL DEFAULT 0,
  held_enrollment_count INTEGER NOT NULL DEFAULT 0,
  active_suppression_count INTEGER NOT NULL DEFAULT 0,
  unsubscribe_footer_check_status TEXT NOT NULL,
  sender_domain_gate_status TEXT NOT NULL,
  provider_send_enabled INTEGER NOT NULL DEFAULT 0,
  delivery_queue_rows_created INTEGER NOT NULL DEFAULT 0,
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

CREATE UNIQUE INDEX IF NOT EXISTS audience_sequence_delivery_batches_idempotency_unique
  ON audience_sequence_delivery_batches(idempotency_key);

CREATE INDEX IF NOT EXISTS audience_sequence_delivery_batches_schedule_intent_idx
  ON audience_sequence_delivery_batches(schedule_intent_id);

CREATE INDEX IF NOT EXISTS audience_sequence_delivery_batches_sequence_status_idx
  ON audience_sequence_delivery_batches(sequence_id, status);

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, aggregate sequence delivery readiness, owner-confirmed dry-run sequence schedule intents, dry-run sequence delivery batches, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed import intents, owner-confirmed import preflights, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    'Issue #358 adds owner-confirmed dry-run sequence delivery batches without delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, or provider message IDs.'
  ),
  next_milestone = 'Add real contact imports, sequence scheduling, Cloudflare Queue producers, and consumers only after sender-domain, provider-event, provider rate-limit, provider response, send-payload, Queue producer, Queue consumer, import redaction, unsubscribe footer, suppression, audit checks, sequence delivery-readiness, sequence delivery-batch gates, delivery-batch gates, queue-message gates, dispatch preflight boundaries, and dispatch-attempt receipts stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_insert(COALESCE(issue_numbers_json, '[]'), '$[#]', 358),
  user_goal = REPLACE(
    user_goal,
    'aggregate sequence delivery readiness, dry-run sequence schedule intents, broadcast readiness',
    'aggregate sequence delivery readiness, dry-run sequence schedule intents, dry-run sequence delivery batches, broadcast readiness'
  ),
  source_evidence_json = json_insert(
    COALESCE(source_evidence_json, '[]'),
    '$[#]',
    'https://bumpgrade.com/api/admin/audience/sequences/delivery-batches',
    '$[#]',
    'https://github.com/markitics/bumpgrade/issues/358'
  ),
  happy_path_json = json_insert(
    COALESCE(happy_path_json, '[]'),
    '$[#]',
    'Record a dry-run sequence delivery batch from the current sequence schedule intent after workspace revision, sequence status, readiness, suppression, unsubscribe-footer, sender-domain, and idempotency gates are checked.'
  ),
  edge_cases_json = json_insert(
    COALESCE(edge_cases_json, '[]'),
    '$[#]',
    'Sequence delivery-batch dry runs record aggregate owner intent only; they do not create delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider message IDs, or public agent sequence writes.'
  ),
  agent_access = REPLACE(
    agent_access,
    'record dry-run sequence schedule intents, view broadcast readiness',
    'record dry-run sequence schedule intents, record dry-run sequence delivery batches, view broadcast readiness'
  ),
  validation_json = json_insert(
    COALESCE(validation_json, '[]'),
    '$[#]',
    'Issue #358 records the owner-confirmed dry-run sequence delivery-batch path after sequence schedule intent, workspace revision, sequence status, readiness, suppression, unsubscribe-footer, sender-domain, idempotency, and redaction checks.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
