UPDATE admin_roadmap_items
SET
  status = 'pending',
  summary = 'Shared mobile-admin contract, jobs-to-be-done, API dependencies, and child issues for independently shippable iOS and Android app slices.',
  public_evidence_json = '["Issue #13 owns the mobile admin planning and scaffold slice.", "Issue #67 tracks the first iOS publisher admin app slice.", "Issue #68 tracks the first Android publisher admin app slice.", "/mobile-admin/source-data exposes jobs, API dependencies, stack decision, and confirmed-write boundaries."]',
  next_milestone = 'Build the first iOS slice in #67 and Android slice in #68 on top of the shared mobile-admin contract.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-mobile-admin';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-checks-mobile-admin',
  'Publisher checks mobile admin status',
  'feature-mobile-admin',
  'pending',
  '[13,67,68]',
  'Publisher away from desktop',
  'Open the future Bumpgrade mobile app to check roadmap, work-log, for-Mark attention, and commerce health without separate mobile-only semantics.',
  '["https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin","https://github.com/markitics/bumpgrade/issues/13","https://github.com/markitics/bumpgrade/issues/67","https://github.com/markitics/bumpgrade/issues/68"]',
  '["Open the future mobile admin app.","Read the mobile admin digest sourced from /admin/source-data, /features/source-data, /roadmap/source-data, and /commerce/source-data.","Review work-log entries, for-Mark attention, and checkout health.","Follow iOS issue #67 or Android issue #68 for platform-specific implementation evidence."]',
  '["No installable app is claimed until #67 and #68 add real simulator or device smoke evidence.","Private admin state requires Better Auth owner or publisher sessions.","Mobile writes stay disabled until confirmed-write APIs exist."]',
  'Agents can read /mobile-admin/source-data to understand app scope and dependencies; they must not claim mobile app parity until platform child issues ship.',
  '["Issue #13 defines the shared contract and splits iOS and Android child issues.","Playwright covers /agent-docs/bumpgrade-mobile-admin and /mobile-admin/source-data."]',
  42,
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
