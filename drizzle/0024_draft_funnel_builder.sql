CREATE TABLE IF NOT EXISTS funnel_drafts (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  summary TEXT NOT NULL,
  source_issue_number INTEGER NOT NULL,
  parent_issue_number INTEGER NOT NULL,
  preview_route TEXT,
  source_data_route TEXT NOT NULL DEFAULT '/funnels/source-data',
  revision_id TEXT NOT NULL,
  created_by_email TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS funnel_drafts_slug_unique
  ON funnel_drafts(slug);

CREATE INDEX IF NOT EXISTS funnel_drafts_status_updated_idx
  ON funnel_drafts(status, updated_at);

CREATE INDEX IF NOT EXISTS funnel_drafts_owner_updated_idx
  ON funnel_drafts(owner_user_id, updated_at);

CREATE TABLE IF NOT EXISTS funnel_draft_steps (
  id TEXT PRIMARY KEY,
  funnel_draft_id TEXT NOT NULL REFERENCES funnel_drafts(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('opt_in', 'sales', 'checkout', 'upsell', 'thank_you')),
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  route_anchor TEXT NOT NULL,
  blocks_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS funnel_draft_steps_draft_order_unique
  ON funnel_draft_steps(funnel_draft_id, step_order);

CREATE UNIQUE INDEX IF NOT EXISTS funnel_draft_steps_draft_slug_unique
  ON funnel_draft_steps(funnel_draft_id, slug);

CREATE TABLE IF NOT EXISTS funnel_audit_events (
  id TEXT PRIMARY KEY,
  funnel_draft_id TEXT REFERENCES funnel_drafts(id) ON DELETE SET NULL,
  actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  event_kind TEXT NOT NULL CHECK (event_kind IN ('draft_seeded', 'draft_created', 'draft_updated', 'draft_reviewed')),
  summary TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS funnel_audit_events_idempotency_unique
  ON funnel_audit_events(idempotency_key);

CREATE INDEX IF NOT EXISTS funnel_audit_events_draft_created_idx
  ON funnel_audit_events(funnel_draft_id, created_at);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Multi-step funnel model, source-data contract, read-only preview scaffold, D1-backed editable draft scaffold, reusable blocks, templates, publishing, and safe draft proposals.',
  public_evidence_json = '["Issue #14 owns the funnel and page builder MVP.", "Issue #79 adds the first /funnels/source-data contract and /funnels/indie-launch-sandbox preview scaffold.", "Issue #91 adds owner-gated D1 tables and /admin/funnels for editable draft funnels."]',
  next_milestone = 'Add granular edit/reorder controls, public preview generation, and confirmed publish review on top of D1 draft funnels.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-owner-seeds-editable-draft-funnel',
  'Owner seeds an editable draft funnel',
  'feature-funnel-builder',
  'pending',
  '[14,79,91]',
  'Publisher or owner preparing the first launch funnel',
  'Create or seed a D1-backed draft funnel with ordered opt-in, sales, and thank-you steps before public publishing exists.',
  '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/91"]',
  '["Sign in with an allowlisted owner account.","Open /admin/funnels.","Seed the indie launch working draft or create a new template draft.","Confirm the page lists a D1-backed draft with at least three ordered steps and audit metadata.","Use /funnels/source-data to distinguish owner-session editable drafts from public preview records."]',
  '["The admin draft builder is owner-gated and not crawlable public content.","Publishing, checkout linking, deletion, drag-and-drop layout editing, and agent writes still require future confirmed-write APIs.","Draft copy remains private/admin-scoped until a separate preview or publishing slice explicitly exposes it."]',
  'Agents can read public /funnels/source-data for capability metadata. Owner-session tools may create draft funnels only with actor identity, idempotency, audit correlation, stale-state checks, and redaction.',
  '["Playwright covers the owner-gated /admin/funnels surface, seed POST endpoint, /funnels/source-data capability metadata, and agent manifest discovery.","Issue #91 records the first D1-backed draft funnel builder scaffold."]',
  47,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  feature_id=excluded.feature_id,
  feature_status=excluded.feature_status,
  issue_numbers_json=excluded.issue_numbers_json,
  primary_user=excluded.primary_user,
  user_goal=excluded.user_goal,
  source_evidence_json=excluded.source_evidence_json,
  happy_path_json=excluded.happy_path_json,
  edge_cases_json=excluded.edge_cases_json,
  agent_access=excluded.agent_access,
  validation_json=excluded.validation_json,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;
