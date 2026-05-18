UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Multi-step funnel model, source-data contract, read-only preview scaffold, reusable blocks, templates, publishing, and safe draft proposals.',
  public_evidence_json = '["Issue #14 owns the funnel and page builder MVP.", "Issue #79 adds the first /funnels/source-data contract and /funnels/indie-launch-sandbox preview scaffold."]',
  next_milestone = 'Build the first authenticated create/edit draft workflow on top of the read-only funnel contract.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-previews-seeded-funnel',
  'Publisher previews a seeded draft funnel',
  'feature-funnel-builder',
  'pending',
  '[14,79]',
  'Publisher or agent planning the first funnel',
  'Inspect an ordered opt-in, sales, and thank-you funnel before visual editing and publishing writes exist.',
  '["https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/funnels/indie-launch-sandbox","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/79"]',
  '["Fetch /funnels/source-data.","Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, and write boundary.","Open /funnels/indie-launch-sandbox to inspect semantic preview sections.","Use the write boundary to avoid claiming create, edit, publish, checkout-link, or agent-write capability."]',
  '["The seeded funnel is read-only and not an authenticated builder UI.","Publishing, checkout linking, deletion, and agent edits require future confirmed-write APIs.","Generated copy remains draft until a publisher confirms it."]',
  'Agents can read /funnels/source-data and the preview route. Funnel writes require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes in a later API.',
  '["Playwright covers /funnels/source-data, /funnels/indie-launch-sandbox, sitemap discovery, and agent manifest read-contract discovery.","Issue #79 records the first funnel source-data contract and preview scaffold."]',
  46,
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
