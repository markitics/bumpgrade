PRAGMA foreign_keys=off;

CREATE TABLE funnel_audit_events_next (
  id TEXT PRIMARY KEY,
  funnel_draft_id TEXT REFERENCES funnel_drafts(id) ON DELETE SET NULL,
  actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  event_kind TEXT NOT NULL CHECK (event_kind IN ('draft_seeded', 'draft_created', 'draft_duplicated', 'draft_updated', 'draft_reviewed', 'draft_published')),
  summary TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO funnel_audit_events_next (
  id, funnel_draft_id, actor_user_id, actor_email, event_kind, summary, idempotency_key, metadata_json, created_at
)
SELECT
  id, funnel_draft_id, actor_user_id, actor_email, event_kind, summary, idempotency_key, metadata_json, created_at
FROM funnel_audit_events;

DROP TABLE funnel_audit_events;

ALTER TABLE funnel_audit_events_next RENAME TO funnel_audit_events;

CREATE UNIQUE INDEX IF NOT EXISTS funnel_audit_events_idempotency_unique
  ON funnel_audit_events(idempotency_key);

CREATE INDEX IF NOT EXISTS funnel_audit_events_draft_created_idx
  ON funnel_audit_events(funnel_draft_id, created_at);

PRAGMA foreign_keys=on;
