UPDATE admin_work_log_entries
SET
  closed_prs_json = '[{"number":470,"url":"https://github.com/markitics/bumpgrade/pull/470"}]',
  validation_json = '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g \"public and agent-readable source-data avoids placeholder and private-note phrasing\"","GitHub Actions main CI run 26398324984 passed static checks and browser journeys","Live smoke passed for /roadmap, /agent-docs/bumpgrade-admin-surfaces, public/admin source-data routes, and issue #468 screenshot assets","git diff --check"]',
  flags_attention = NULL,
  completed_at = 1779709260,
  relevant_urls_json = '["https://github.com/markitics/bumpgrade/issues/468","https://github.com/markitics/bumpgrade/pull/470","https://bumpgrade.com/features/source-data","https://bumpgrade.com/content/source-data","https://bumpgrade.com/roadmap/source-data","https://bumpgrade.com/agent-docs/source-data","https://bumpgrade.com/admin/source-data","https://bumpgrade.com/pr-screenshots/issue-468-roadmap-copy-cleanup.png","https://bumpgrade.com/pr-screenshots/issue-468-admin-agent-docs-copy-cleanup.png"]',
  pr_comment_url = 'https://github.com/markitics/bumpgrade/pull/470',
  updated_at = unixepoch()
WHERE id = 'work-log-2026-05-25-public-copy-cleanup';
