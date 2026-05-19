UPDATE admin_roadmap_items
SET
  summary = 'Multi-step funnel model, source-data contract, read-only seeded preview scaffold, D1-backed editable draft scaffold with step edit/reorder controls, owner-gated private preview, exact-confirmed public publishing, reusable template and block-template library records, and safe draft proposals.',
  public_evidence_json = '["Tracked by issue #14.", "Issue #79 adds the first `/funnels/source-data` contract and `/funnels/indie-launch-sandbox` preview scaffold.", "Issue #91 adds owner-gated `/admin/funnels`, `/api/admin/funnels/drafts`, and D1 draft/audit tables.", "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.", "Issue #95 adds owner-gated private draft preview from current D1 draft state.", "Issue #135 adds exact-confirmed public publishing from D1 draft funnels to stable public `/funnels/{slug}` routes.", "Issue #159 adds reusable funnel templates and block-template library records to `/funnels/source-data` and the seeded preview route."]',
  next_milestone = 'Add template-to-draft creation, checkout linking, deletion/archive, unpublishing, drag-and-drop block editing, and direct agent-safe edit tools on top of D1 draft funnels.',
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[14,79,159]',
  source_evidence_json = '["https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/funnels/indie-launch-sandbox","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/79","https://github.com/markitics/bumpgrade/issues/159"]',
  happy_path_json = '["Fetch /funnels/source-data.","Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, and write boundary.","Inspect reusable funnel templates and block-template records, including draftCreation and block write boundaries.","Open /funnels/indie-launch-sandbox to inspect semantic preview sections.","Use the write boundary to avoid claiming checkout-link, unpublish/delete, or direct agent-write capability."]',
  edge_cases_json = '["The seeded funnel is read-only and not an authenticated builder UI.","Template-to-draft creation, checkout linking, deletion, unpublishing, and direct agent edits require future confirmed-write APIs.","Generated copy remains draft until a publisher confirms it."]',
  agent_access = 'Agents can read /funnels/source-data, reusable template and block-template records, the seeded preview route, and published D1 funnel routes. Funnel writes require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.',
  validation_json = '["Playwright covers /funnels/source-data, /funnels/indie-launch-sandbox template and block library rendering, sitemap discovery, and agent manifest read-contract discovery.","Issue #79 records the first funnel source-data contract and preview scaffold.","Issue #159 records the first reusable template and block-template library contract."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';
