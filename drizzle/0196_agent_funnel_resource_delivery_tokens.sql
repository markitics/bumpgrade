CREATE TABLE IF NOT EXISTS agent_funnel_resource_delivery_token_requests (
  id TEXT PRIMARY KEY,
  owner_scope TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  idempotency_key_sha256 TEXT NOT NULL,
  request_signature_sha256 TEXT NOT NULL,
  audit_correlation_id TEXT NOT NULL,
  funnel_slug TEXT NOT NULL,
  funnel_revision_id TEXT NOT NULL,
  block_id TEXT NOT NULL,
  checkout_intent_id TEXT NOT NULL,
  entitlement_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'creating',
  delivery_token_created INTEGER NOT NULL DEFAULT 0,
  download_token_expires_at INTEGER,
  product_id TEXT,
  asset_id TEXT,
  result_status TEXT,
  error_status TEXT,
  error_message TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  metadata_json TEXT,
  replay_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS agent_funnel_resource_delivery_token_requests_owner_idempotency_idx
  ON agent_funnel_resource_delivery_token_requests(owner_scope, idempotency_key_sha256);

CREATE INDEX IF NOT EXISTS agent_funnel_resource_delivery_token_requests_funnel_idx
  ON agent_funnel_resource_delivery_token_requests(funnel_slug, funnel_revision_id, created_at);

CREATE INDEX IF NOT EXISTS agent_funnel_resource_delivery_token_requests_audit_idx
  ON agent_funnel_resource_delivery_token_requests(audit_correlation_id, created_at);
