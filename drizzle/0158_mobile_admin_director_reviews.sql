CREATE TABLE IF NOT EXISTS mobile_admin_director_reviews (
  id TEXT PRIMARY KEY,
  workstream_id TEXT NOT NULL,
  workstream_title TEXT NOT NULL,
  workstream_status TEXT NOT NULL,
  source_route TEXT NOT NULL,
  expected_director_generated_at TEXT NOT NULL,
  stale_state_token_sha256 TEXT NOT NULL,
  confirmation_text_sha256 TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  audit_correlation_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_email_hash TEXT NOT NULL,
  review_note_sha256 TEXT,
  production_admin_state_recorded INTEGER NOT NULL DEFAULT 1,
  billing_mutation_created INTEGER NOT NULL DEFAULT 0,
  push_notification_sent INTEGER NOT NULL DEFAULT 0,
  distribution_state_changed INTEGER NOT NULL DEFAULT 0,
  public_agent_write_created INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_mobile_admin_director_reviews_workstream
  ON mobile_admin_director_reviews(workstream_id, created_at);

CREATE INDEX IF NOT EXISTS idx_mobile_admin_director_reviews_created_at
  ON mobile_admin_director_reviews(created_at);
