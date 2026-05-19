UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Multi-step funnel model, source-data contract, read-only preview scaffold, D1-backed editable draft scaffold with step edit/reorder controls, reusable blocks, templates, publishing, and safe draft proposals.',
  public_evidence_json = '["Issue #14 owns the funnel and page builder MVP.", "Issue #79 adds the first /funnels/source-data contract and /funnels/indie-launch-sandbox preview scaffold.", "Issue #91 adds owner-gated D1 tables and /admin/funnels for editable draft funnels.", "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts."]',
  next_milestone = 'Add public preview generation, confirmed publish review, checkout linking, and direct agent-safe edit tools on top of D1 draft funnels.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-owner-seeds-editable-draft-funnel',
  'Owner seeds and edits a draft funnel',
  'feature-funnel-builder',
  'pending',
  '[14,79,91,93]',
  'Publisher or owner preparing the first launch funnel',
  'Create or seed a D1-backed draft funnel, then tune the ordered opt-in, sales, and thank-you steps before public publishing exists.',
  '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/91","https://github.com/markitics/bumpgrade/issues/93"]',
  '["Sign in with an allowlisted owner account.","Open /admin/funnels.","Seed the indie launch working draft or create a new template draft.","Edit a step title, goal, or kind, then move a step up or down.","Confirm the page lists the updated D1-backed draft with ordered steps and audit metadata.","Use /funnels/source-data to distinguish owner-session editable drafts from public preview records."]',
  '["The admin draft builder is owner-gated and not crawlable public content.","Publishing, checkout linking, deletion, drag-and-drop layout editing, and direct agent writes still require future confirmed-write APIs.","Draft copy remains private/admin-scoped until a separate preview or publishing slice explicitly exposes it."]',
  'Agents can read public /funnels/source-data for capability metadata. Owner-session UI may create and edit draft steps with actor identity, idempotency, audit correlation, stale-state checks, and redaction; direct agent edit tools are still planned.',
  '["Playwright covers the owner-gated /admin/funnels surface, seed/update/reorder POST paths, /funnels/source-data capability metadata, and agent manifest discovery.","Issue #91 records the first D1-backed draft funnel builder scaffold.","Issue #93 records the first step edit and reorder controls."]',
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
