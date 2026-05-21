CREATE TABLE IF NOT EXISTS audience_import_intents (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'import_intent_recorded',
  intent_kind TEXT NOT NULL DEFAULT 'owner_confirmed_dry_run',
  source_kind TEXT NOT NULL,
  source_label TEXT NOT NULL,
  expected_workspace_revision_id TEXT NOT NULL,
  expected_workspace_status TEXT NOT NULL,
  estimated_contact_count INTEGER NOT NULL DEFAULT 0,
  estimated_new_contact_count INTEGER NOT NULL DEFAULT 0,
  estimated_update_count INTEGER NOT NULL DEFAULT 0,
  estimated_suppressed_count INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  import_rows_stored INTEGER NOT NULL DEFAULT 0,
  raw_emails_stored INTEGER NOT NULL DEFAULT 0,
  sequence_enrollments_created INTEGER NOT NULL DEFAULT 0,
  email_delivery_enabled INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS audience_import_intents_idempotency_unique
  ON audience_import_intents(idempotency_key);

CREATE INDEX IF NOT EXISTS audience_import_intents_workspace_status_idx
  ON audience_import_intents(workspace_id, status);

CREATE INDEX IF NOT EXISTS audience_import_intents_status_created_idx
  ON audience_import_intents(status, created_at);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed import intents, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    json_object(
      'label', 'Issue #253 owner-confirmed audience import intent path',
      'url', 'https://github.com/markitics/bumpgrade/issues/253'
    )
  ),
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171,173,175,177,183,189,191,197,199,201,203,205,207,209,211,253]',
  validation_json = json_insert(
    COALESCE(validation_json, '[]'),
    '$[#]',
    'Issue #253 records owner-confirmed audience import intent evidence without raw contacts, imports, sequence enrollments, or email sends.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
