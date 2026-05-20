UPDATE admin_user_journeys
SET issue_numbers_json = '[6,14,15,16,17,18,19,217,226,234]',
    source_evidence_json = '["https://bumpgrade.com/","https://bumpgrade.com/features","https://bumpgrade.com/features/email-campaigns","https://bumpgrade.com/features/order-bump","https://bumpgrade.com/features/source-data","https://github.com/markitics/bumpgrade/issues/217","https://github.com/markitics/bumpgrade/issues/226","https://github.com/markitics/bumpgrade/issues/234","https://github.com/markitics/bumpgrade/pull/233","https://github.com/markitics/bumpgrade/actions/runs/26168608279"]',
    validation_json = '["Issue #217 adds launch marketing pages, dedicated feature routes, sitemap entries, screenshots, and CI wiring.","Issue #226 removes internal status-board language from public launch copy and refreshes pricing/domain readiness proof.","Issue #234 refreshes launch user-journey proof with the latest PR #233 CI and issue #226 screenshot links.","Playwright smoke tests cover homepage, /features, dedicated feature pages, /pricing, and source-data routes."]',
    updated_at = unixepoch()
WHERE id = 'journey-prospect-explores-launch-marketing';

UPDATE admin_user_journeys
SET issue_numbers_json = '[20,46,217,222,223,225,226,234]',
    source_evidence_json = '["https://bumpgrade.com/pricing","https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://bumpgrade.com/commerce/source-data","https://github.com/markitics/bumpgrade/issues/46","https://github.com/markitics/bumpgrade/issues/217","https://github.com/markitics/bumpgrade/issues/222","https://github.com/markitics/bumpgrade/issues/223","https://github.com/markitics/bumpgrade/issues/225","https://github.com/markitics/bumpgrade/issues/226","https://github.com/markitics/bumpgrade/issues/234","https://github.com/markitics/bumpgrade/pull/233","https://github.com/markitics/bumpgrade/actions/runs/26168608279"]',
    validation_json = '["Issue #217 rewrites pricing as launch-facing copy.","Issue #225 clarifies the domain purchase policy.","Issue #226 refreshes launch signup and pricing copy for paid domain readiness.","Issue #234 refreshes pricing user-journey proof with the latest PR #233 CI and issue #226 screenshot links.","The pricing page links to human contact paths instead of an unverified live checkout button."]',
    updated_at = unixepoch()
WHERE id = 'journey-prospect-reviews-launch-pricing';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-20-launch-user-journey-proof-links',
  'Refreshed launch user-journey proof links',
  'Codex',
  'codex',
  'bumpgrade-launch-readiness',
  'Production smoke after PR #233 showed launch user-journey proof still pointed at older issue #217 screenshots and CI links.',
  '[{"number":234,"url":"https://github.com/markitics/bumpgrade/issues/234"},{"number":226,"url":"https://github.com/markitics/bumpgrade/issues/226"}]',
  '[{"number":233,"url":"https://github.com/markitics/bumpgrade/pull/233"}]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["src/lib/admin-surface-data.ts","tests/smoke.spec.ts","drizzle/0091_launch_user_journey_proof_links.sql"]',
  '["npm run lint","npm run typecheck","npm run db:migrate:local","Focused admin user-journey source-data smoke"]',
  'Launch marketing and pricing journeys now link directly to PR #233 CI and issue #226 screenshot evidence.',
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/admin/user-journeys/source-data","https://bumpgrade.com/pr-screenshots/issue-226-homepage.png","https://bumpgrade.com/pr-screenshots/issue-226-features.png","https://bumpgrade.com/pr-screenshots/issue-226-pricing.png","https://bumpgrade.com/pr-screenshots/issue-226-account-setup.png","https://github.com/markitics/bumpgrade/pull/233","https://github.com/markitics/bumpgrade/issues/234"]',
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  github_issues_json = excluded.github_issues_json,
  closed_prs_json = excluded.closed_prs_json,
  features_updated_json = excluded.features_updated_json,
  roadmap_updated_json = excluded.roadmap_updated_json,
  user_journeys_updated_json = excluded.user_journeys_updated_json,
  documentation_updated_json = excluded.documentation_updated_json,
  validation_json = excluded.validation_json,
  flags_attention = excluded.flags_attention,
  completed_at = excluded.completed_at,
  relevant_urls_json = excluded.relevant_urls_json,
  pr_comment_url = excluded.pr_comment_url,
  updated_at = excluded.updated_at;
