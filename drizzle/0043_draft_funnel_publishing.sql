PRAGMA foreign_keys=off;

CREATE TABLE funnel_audit_events_next (
  id TEXT PRIMARY KEY,
  funnel_draft_id TEXT REFERENCES funnel_drafts(id) ON DELETE SET NULL,
  actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  event_kind TEXT NOT NULL CHECK (event_kind IN ('draft_seeded', 'draft_created', 'draft_updated', 'draft_reviewed', 'draft_published')),
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

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Multi-step funnel model, source-data contract, read-only seeded preview scaffold, D1-backed editable draft scaffold with step edit/reorder controls, owner-gated private preview, exact-confirmed public publishing, reusable blocks, templates, and safe draft proposals.',
  public_evidence_json = '["Issue #14 owns the funnel and page builder MVP.", "Issue #79 adds the first /funnels/source-data contract and /funnels/indie-launch-sandbox preview scaffold.", "Issue #91 adds owner-gated D1 tables and /admin/funnels for editable draft funnels.", "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.", "Issue #95 adds owner-gated private draft preview from current D1 draft state.", "Issue #135 adds exact-confirmed public publishing from D1 draft funnels to stable public /funnels/{slug} routes."]',
  next_milestone = 'Add checkout linking, deletion/archive, drag-and-drop block editing, and direct agent-safe edit tools on top of D1 draft funnels.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[14,79,91,93,95,135]',
  source_evidence_json = '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/admin/funnels/funnel-draft-indie-launch-working-copy/preview","https://bumpgrade.com/funnels/indie-launch-working-copy","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/91","https://github.com/markitics/bumpgrade/issues/93","https://github.com/markitics/bumpgrade/issues/95","https://github.com/markitics/bumpgrade/issues/135"]',
  happy_path_json = '["Sign in with an allowlisted owner account.","Open /admin/funnels.","Seed the indie launch working draft or create a new template draft.","Edit a step title, goal, or kind, then move a step up or down.","Open the owner-gated preview route to confirm the private draft sequence reflects current D1 state.","Type the exact publish confirmation text with the current revision and publish the draft.","Open the public /funnels/{slug} route and confirm the published sequence is crawlable.","Use /funnels/source-data to distinguish published D1 funnels from unpublished private drafts."]',
  edge_cases_json = '["The admin draft builder is owner-gated and unpublished draft copy is not crawlable public content.","Publishing requires exact confirmation and a fresh revision ID.","Checkout linking, deletion, drag-and-drop layout editing, unpublishing, and direct agent writes still require future confirmed-write APIs.","/funnels/source-data lists published D1 funnels but does not expose raw owner session or unpublished private draft data."]',
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, and published D1 funnel routes. Owner-session UI may create, edit, preview, and publish private draft steps with actor identity, idempotency, audit correlation, stale-state checks, and redaction; direct agent edit tools are still planned.',
  validation_json = '["Playwright covers the owner-gated /admin/funnels surface, seed/update/reorder/publish POST paths, stale publish rejection, private draft preview, public D1 funnel route rendering, /funnels/source-data capability metadata, and agent manifest discovery.","Issue #91 records the first D1-backed draft funnel builder scaffold.","Issue #93 records the first step edit and reorder controls.","Issue #95 records the first owner-gated private draft preview route.","Issue #135 records the first exact-confirmed D1 draft publishing path."]',
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';
