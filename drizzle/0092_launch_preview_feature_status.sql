CREATE TABLE IF NOT EXISTS admin_user_journeys_next (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  feature_status TEXT NOT NULL CHECK (feature_status IN ('live', 'launch-preview', 'pending')),
  issue_numbers_json TEXT NOT NULL DEFAULT '[]',
  primary_user TEXT NOT NULL,
  user_goal TEXT NOT NULL,
  source_evidence_json TEXT NOT NULL DEFAULT '[]',
  happy_path_json TEXT NOT NULL DEFAULT '[]',
  edge_cases_json TEXT NOT NULL DEFAULT '[]',
  agent_access TEXT NOT NULL,
  validation_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR REPLACE INTO admin_user_journeys_next (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
)
SELECT
  id,
  title,
  feature_id,
  CASE WHEN feature_status = 'pending' THEN 'launch-preview' ELSE feature_status END,
  issue_numbers_json,
  primary_user,
  user_goal,
  source_evidence_json,
  happy_path_json,
  edge_cases_json,
  agent_access,
  validation_json,
  sort_order,
  unixepoch()
FROM admin_user_journeys;

DROP TABLE admin_user_journeys;

ALTER TABLE admin_user_journeys_next RENAME TO admin_user_journeys;

CREATE INDEX IF NOT EXISTS idx_admin_user_journeys_feature ON admin_user_journeys(feature_id, sort_order);

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-20-launch-preview-feature-status',
  'Reframed public feature status as launch preview instead of pending',
  'Codex',
  'codex',
  'bumpgrade-launch',
  'Mark asked Codex to keep working until no launch-critical feature surfaces looked pending or obviously unstarted.',
  '[{"number":236,"url":"https://github.com/markitics/bumpgrade/issues/236"}]',
  '[]',
  '["https://bumpgrade.com/features","https://bumpgrade.com/features/source-data","https://bumpgrade.com/admin/user-journeys"]',
  '["https://bumpgrade.com/admin/roadmap"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '[]',
  '["npm run lint","npm run typecheck","npm run db:migrate:local","npm run cf:build","Playwright feature source-data and launch page smoke checks"]',
  'Live self-serve checkout remains parked on issue #219 until the first live package/amount and live webhook secret are confirmed.',
  1779286200,
  1779286200,
  '["https://bumpgrade.com/features/source-data","https://bumpgrade.com/admin/user-journeys/source-data","https://github.com/markitics/bumpgrade/issues/236"]',
  null,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  github_issues_json=excluded.github_issues_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  pr_comment_url=excluded.pr_comment_url,
  updated_at=excluded.updated_at;
