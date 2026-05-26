CREATE TABLE IF NOT EXISTS competitor_import_subscriber_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES publisher_tenants(id) ON DELETE CASCADE,
  draft_funnel_id TEXT NOT NULL REFERENCES funnel_drafts(id) ON DELETE CASCADE,
  import_record_id TEXT NOT NULL REFERENCES competitor_import_private_records(id) ON DELETE CASCADE,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  importer_platform_id TEXT NOT NULL,
  importer_slug TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  first_name TEXT,
  source_status TEXT,
  status TEXT NOT NULL DEFAULT 'private_imported_pending_review',
  source_tags_json TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS competitor_import_subscriber_records_record_email_unique
  ON competitor_import_subscriber_records(import_record_id, email_hash);

CREATE INDEX IF NOT EXISTS competitor_import_subscriber_records_tenant_importer_status_idx
  ON competitor_import_subscriber_records(tenant_id, importer_platform_id, status, updated_at);

CREATE INDEX IF NOT EXISTS competitor_import_subscriber_records_draft_record_idx
  ON competitor_import_subscriber_records(draft_funnel_id, import_record_id);
