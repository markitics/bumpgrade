CREATE TABLE IF NOT EXISTS mobile_admin_commerce_reviews (
  id TEXT PRIMARY KEY,
  review_target_id TEXT NOT NULL,
  review_target_title TEXT NOT NULL,
  review_target_status TEXT NOT NULL,
  source_route TEXT NOT NULL,
  expected_commerce_generated_at TEXT NOT NULL,
  stale_state_token_sha256 TEXT NOT NULL,
  confirmation_text_sha256 TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  audit_correlation_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_email_hash TEXT NOT NULL,
  review_note_sha256 TEXT,
  commerce_state_recorded INTEGER NOT NULL DEFAULT 1,
  billing_mutation_created INTEGER NOT NULL DEFAULT 0,
  refund_created INTEGER NOT NULL DEFAULT 0,
  subscription_changed INTEGER NOT NULL DEFAULT 0,
  price_changed INTEGER NOT NULL DEFAULT 0,
  fulfillment_state_changed INTEGER NOT NULL DEFAULT 0,
  entitlement_state_changed INTEGER NOT NULL DEFAULT 0,
  push_notification_sent INTEGER NOT NULL DEFAULT 0,
  distribution_state_changed INTEGER NOT NULL DEFAULT 0,
  public_agent_write_created INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_mobile_admin_commerce_reviews_target
  ON mobile_admin_commerce_reviews(review_target_id, created_at);

CREATE INDEX IF NOT EXISTS idx_mobile_admin_commerce_reviews_created_at
  ON mobile_admin_commerce_reviews(created_at);
