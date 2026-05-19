UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Multi-step funnel model, source-data contract, read-only seeded preview scaffold, D1-backed editable draft scaffold with step edit/reorder controls and owner-gated private preview, reusable blocks, templates, publishing, and safe draft proposals.',
  public_evidence_json = '["Issue #14 owns the funnel and page builder MVP.", "Issue #79 adds the first /funnels/source-data contract and /funnels/indie-launch-sandbox preview scaffold.", "Issue #91 adds owner-gated D1 tables and /admin/funnels for editable draft funnels.", "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.", "Issue #95 adds owner-gated private draft preview from current D1 draft state."]',
  next_milestone = 'Add confirmed publish review, checkout linking, deletion/archive, drag-and-drop block editing, and direct agent-safe edit tools on top of D1 draft funnels.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[14,79,91,93,95]',
  source_evidence_json = '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/admin/funnels/funnel-draft-indie-launch-working-copy/preview","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/91","https://github.com/markitics/bumpgrade/issues/93","https://github.com/markitics/bumpgrade/issues/95"]',
  happy_path_json = '["Sign in with an allowlisted owner account.","Open /admin/funnels.","Seed the indie launch working draft or create a new template draft.","Edit a step title, goal, or kind, then move a step up or down.","Open the owner-gated preview route to confirm the private draft sequence reflects current D1 state.","Confirm the page lists the updated D1-backed draft with ordered steps and audit metadata.","Use /funnels/source-data to distinguish owner-session editable drafts from public preview records."]',
  edge_cases_json = '["The admin draft builder is owner-gated and not crawlable public content.","Publishing, checkout linking, deletion, drag-and-drop layout editing, and direct agent writes still require future confirmed-write APIs.","Draft copy remains private/admin-scoped; the preview route is owner-gated and is not public publishing."]',
  agent_access = 'Agents can read public /funnels/source-data for capability metadata. Owner-session UI may create, edit, and preview private draft steps with actor identity, idempotency, audit correlation, stale-state checks, and redaction; direct agent edit tools are still planned.',
  validation_json = '["Playwright covers the owner-gated /admin/funnels surface, seed/update/reorder POST paths, private draft preview, /funnels/source-data capability metadata, and agent manifest discovery.","Issue #91 records the first D1-backed draft funnel builder scaffold.","Issue #93 records the first step edit and reorder controls.","Issue #95 records the first owner-gated private draft preview route."]',
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';
