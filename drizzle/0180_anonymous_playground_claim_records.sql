CREATE TABLE IF NOT EXISTS anonymous_playground_claim_records (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES anonymous_playground_workspaces(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES publisher_tenants(id) ON DELETE CASCADE,
  draft_funnel_id TEXT NOT NULL REFERENCES funnel_drafts(id) ON DELETE CASCADE,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  record_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'private_draft',
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT,
  selected_importer_slug TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS anonymous_playground_claim_records_workspace_kind_unique
  ON anonymous_playground_claim_records(workspace_id, record_kind);

CREATE INDEX IF NOT EXISTS anonymous_playground_claim_records_tenant_kind_idx
  ON anonymous_playground_claim_records(tenant_id, record_kind, updated_at);

CREATE INDEX IF NOT EXISTS anonymous_playground_claim_records_draft_idx
  ON anonymous_playground_claim_records(draft_funnel_id, record_kind);
