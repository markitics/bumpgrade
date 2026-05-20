UPDATE admin_user_journeys
SET edge_cases_json = '["Signed-out users must sign in first.","Unverified users must confirm email first.","Free or unpaid accounts cannot add a custom domain.","A default Bumpgrade hostname is required before custom-domain onboarding.","Bumpgrade-owned domains such as bumpgrade.com are rejected here.","Domains already claimed by another tenant return a conflict.","DNS verification can be pending while records propagate.","SSL and final custom-hostname activation remain visible as state, not hidden implementation detail.","Bumpgrade does not sell, register, renew, transfer, or price domains today; publishers bring a domain they already own."]',
    validation_json = '["Playwright covers /account/setup rendering, /account/source-data, paid custom-domain onboarding, idempotent replay, DNS verification transition, invalid Bumpgrade-owned domain rejection, unpaid account rejection, and explicit no-domain-purchase policy.","Issue #223 records the D1 migration, API, account setup UI, DNS instruction, and redacted source-data contract.","Issue #225 records the launch policy that Bumpgrade connects owned domains but does not sell/register domains today."]',
    updated_at = unixepoch()
WHERE id = 'journey-publisher-connects-custom-domain';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-20-domain-purchase-policy',
  'Clarified domain purchase launch policy',
  'Codex',
  'codex',
  'bumpgrade-launch-readiness',
  'Mark asked whether users can buy a domain through Bumpgrade while validating launch readiness.',
  '[{"number":225,"url":"https://github.com/markitics/bumpgrade/issues/225"}]',
  '[]',
  '["https://bumpgrade.com/pricing","https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/publisher-tenants.md","public/llms.txt"]',
  '["npm run lint","npm run typecheck","git diff --check","npm run db:migrate:local","Focused Playwright source-data and account setup tests"]',
  'Bumpgrade connects domains publishers already own, but does not sell, register, renew, transfer, price, or check availability for domains today.',
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/pricing","https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://github.com/markitics/bumpgrade/issues/225"]',
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
