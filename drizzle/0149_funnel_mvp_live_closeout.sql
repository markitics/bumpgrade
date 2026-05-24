UPDATE admin_roadmap_items
SET
  status = 'live',
  public_evidence_json = json_array(
    'Tracked by issue #14.',
    'Issue #79 adds the first /funnels/source-data contract and /funnels/indie-launch-sandbox preview scaffold.',
    'Issue #91 adds owner-gated /admin/funnels, /api/admin/funnels/drafts, and D1 draft/audit tables.',
    'Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.',
    'Issue #95 adds owner-gated private draft preview from current D1 draft state.',
    'Issue #135 adds exact-confirmed public publishing from D1 draft funnels to stable public /funnels/{slug} routes.',
    'Issue #159 adds reusable funnel templates and block-template library records to /funnels/source-data and the seeded preview route.',
    'Issue #161 adds owner-confirmed template-to-draft creation from reusable funnel templates.',
    'Issue #163 adds owner-confirmed checkout-offer linking to private draft checkout blocks.',
    'Issue #165 adds public sandbox checkout start rendering on published funnel checkout blocks with owner-confirmed checkout links.',
    'Issue #213 adds webinar and resource funnel template/block contracts plus D1 step-kind storage readiness.',
    'Issue #215 adds owner-confirmed private draft duplication with checkout-link metadata stripped by default.',
    'Issue #341 adds owner-confirmed archive/unpublish lifecycle actions that preserve audit evidence and remove published routes from source data.',
    'Issue #409 links owner-created product test checkout links to the seeded offer/funnel delivery gates without live billing or private fulfillment delivery.',
    'Issue #417 tracks advanced funnel editing, resource delivery, webinar integrations, physical deletion policy, and direct agent-safe write tools after the MVP closeout.'
  ),
  next_milestone = 'Keep advanced drag-and-drop editing, private resource delivery, live webinar integrations, physical deletion policy, and direct agent-safe funnel tools in issue #417; keep live publisher-offer billing in issue #219.',
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-advanced-funnel-builder-parity',
  'Advanced funnel editing, resource delivery, and agent-safe writes',
  'pending',
  417,
  'feature-funnel-builder',
  'Funnels and pages',
  'Pending post-MVP funnel parity for drag-and-drop visual block editing, granular block content editing, private resource delivery, webinar integrations, physical deletion policy, and direct agent-safe write tools.',
  json_array(
    'Issue #417 tracks the advanced funnel parity bucket after issue #14 MVP closeout.',
    'Issue #14 remains the shipped MVP covering D1 draft funnels, owner-gated edits, private preview, exact-confirmed publishing, duplication, archive/unpublish, templates, source-data, and public semantic routes.',
    'Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.'
  ),
  'Design advanced funnel editing, private resource delivery, live webinar integrations, physical deletion, and direct agent-safe write tools as one coherent post-MVP workflow instead of more single-gate readiness slices.',
  NULL,
  115,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  status=excluded.status,
  issue_number=excluded.issue_number,
  feature_id=excluded.feature_id,
  group_name=excluded.group_name,
  summary=excluded.summary,
  public_evidence_json=excluded.public_evidence_json,
  next_milestone=excluded.next_milestone,
  mark_attention=excluded.mark_attention,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;

UPDATE admin_user_journeys
SET
  feature_status = 'live',
  updated_at = unixepoch()
WHERE feature_id = 'feature-funnel-builder';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[14,79,159,161,163,165,213,215,341,409,417]',
  source_evidence_json = '["https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/funnels/indie-launch-sandbox","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/79","https://github.com/markitics/bumpgrade/issues/159","https://github.com/markitics/bumpgrade/issues/161","https://github.com/markitics/bumpgrade/issues/163","https://github.com/markitics/bumpgrade/issues/165","https://github.com/markitics/bumpgrade/issues/213","https://github.com/markitics/bumpgrade/issues/215","https://github.com/markitics/bumpgrade/issues/341","https://github.com/markitics/bumpgrade/issues/409","https://github.com/markitics/bumpgrade/issues/417"]',
  validation_json = '["Issue #14 is the shipped funnel MVP boundary.","Issue #79 records the first funnel source-data contract and preview scaffold.","Issue #159 records reusable template and block-template records.","Issue #161 records owner-confirmed template-to-draft creation.","Issue #163 records owner-confirmed checkout-offer linking on private draft steps.","Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.","Issue #213 records webinar/resource template and block contracts.","Issue #215 records owner-confirmed private draft duplication.","Issue #341 records owner-confirmed archive/unpublish lifecycle actions.","Issue #409 records owner-created product delivery-gate links for the seeded offer/funnel path.","Issue #417 tracks advanced post-MVP funnel parity without keeping issue #14 open."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[14,79,91,93,95,135,159,161,163,165,213,215,341,409,417]',
  source_evidence_json = '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/admin/funnels/funnel-draft-indie-launch-working-copy/preview","https://bumpgrade.com/funnels/indie-launch-working-copy","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/91","https://github.com/markitics/bumpgrade/issues/93","https://github.com/markitics/bumpgrade/issues/95","https://github.com/markitics/bumpgrade/issues/135","https://github.com/markitics/bumpgrade/issues/159","https://github.com/markitics/bumpgrade/issues/161","https://github.com/markitics/bumpgrade/issues/163","https://github.com/markitics/bumpgrade/issues/165","https://github.com/markitics/bumpgrade/issues/213","https://github.com/markitics/bumpgrade/issues/215","https://github.com/markitics/bumpgrade/issues/341","https://github.com/markitics/bumpgrade/issues/409","https://github.com/markitics/bumpgrade/issues/417"]',
  validation_json = '["Issue #14 is the shipped funnel MVP boundary.","Issue #91 records the first owner-gated draft funnel builder scaffold.","Issue #93 records step edit and reorder controls.","Issue #95 records owner-gated private draft preview.","Issue #135 records exact-confirmed D1 draft publishing.","Issue #159 records reusable template and block-template source data.","Issue #161 records owner-confirmed template-to-draft creation.","Issue #163 records owner-confirmed checkout-offer linking on private draft steps.","Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.","Issue #213 records webinar/resource funnel template and D1 step-kind storage readiness.","Issue #215 records owner-confirmed private draft duplication.","Issue #341 records owner-confirmed archive/unpublish lifecycle actions.","Issue #409 records owner-created product delivery-gate links for the seeded offer/funnel path.","Issue #417 tracks advanced post-MVP funnel parity without keeping issue #14 open."]',
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-funnel-mvp-live-closeout',
  'Moved Funnel and page builder MVP to live',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for clearer Director-level nesting and fewer niche technical ships; this closes out the satisfied funnel MVP parent and leaves one pending advanced-funnel bucket.',
  '[{"number":14,"url":"https://github.com/markitics/bumpgrade/issues/14"},{"number":417,"url":"https://github.com/markitics/bumpgrade/issues/417"},{"number":219,"url":"https://github.com/markitics/bumpgrade/issues/219"}]',
  '[]',
  '["feature-funnel-builder"]',
  '["roadmap-funnels active -> live","roadmap-advanced-funnel-builder-parity pending"]',
  '["journey-publisher-previews-seeded-funnel launch-preview -> live","journey-owner-seeds-editable-draft-funnel launch-preview -> live"]',
  '["docs/features/funnels.md","docs/agent/agent-ready.md","public/llms.txt"]',
  '["git diff --check","npm run db:migrate:local","npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run cf:build","focused Playwright source-data checks"]',
  NULL,
  1779604200,
  1779604800,
  '["https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/417","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/admin/director/source-data","https://bumpgrade.com/roadmap/source-data","https://bumpgrade.com/admin/user-journeys/source-data"]',
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  closed_prs_json=excluded.closed_prs_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  pr_comment_url=excluded.pr_comment_url,
  updated_at=excluded.updated_at;
