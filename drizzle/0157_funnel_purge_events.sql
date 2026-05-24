CREATE TABLE IF NOT EXISTS funnel_purge_events (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  draft_slug TEXT NOT NULL,
  draft_title TEXT NOT NULL,
  previous_status TEXT NOT NULL,
  previous_revision_id TEXT NOT NULL,
  actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  summary TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS funnel_purge_events_draft_created_idx
  ON funnel_purge_events(draft_id, created_at);
