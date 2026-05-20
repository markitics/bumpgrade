INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user,
  user_goal, source_evidence_json, happy_path_json, edge_cases_json,
  agent_access, validation_json, sort_order, updated_at
) VALUES
  (
    'journey-prospect-explores-launch-marketing',
    'Prospect explores Bumpgrade launch features',
    'feature-public-feature-catalog',
    'live',
    '[6,14,15,16,17,18,19,217]',
    'Publisher invited to try Bumpgrade',
    'Understand what Bumpgrade can do for a launch without needing to decode project management notes.',
    '["https://bumpgrade.com/","https://bumpgrade.com/features","https://bumpgrade.com/features/email-campaigns","https://bumpgrade.com/features/order-bump","https://bumpgrade.com/features/source-data","https://github.com/markitics/bumpgrade/issues/217"]',
    '["Open the homepage and understand Bumpgrade as a publisher launch system.","Open /features to see customer-facing feature groups organized by launch job.","Open a dedicated feature page such as /features/email-campaigns or /features/order-bump.","Follow proof routes for the feature preview, source data, or issue evidence.","Open /pricing to understand invite access and payment options."]',
    '["Live billing must not be promoted until live Stripe smoke evidence is linked.","Feature pages must distinguish launch-preview availability from planned parity work.","Admin and implementation details should not be the public marketing story."]',
    'Agents can read /features/source-data and feature detail pages; public copy changes still need issue evidence, route proof, or source-data support.',
    '["Issue #217 adds launch marketing pages, dedicated feature routes, sitemap entries, screenshots, and CI wiring.","Playwright smoke tests cover homepage, /features, dedicated feature pages, /pricing, and source-data routes."]',
    8,
    unixepoch()
  ),
  (
    'journey-prospect-reviews-launch-pricing',
    'Prospect reviews launch pricing and payment options',
    'feature-resources-use-cases-pricing',
    'live',
    '[20,46,217]',
    'Publisher deciding whether to request Bumpgrade access',
    'Understand how early access, paid pilots, and live payment handling work before inviting buyers.',
    '["https://bumpgrade.com/pricing","https://bumpgrade.com/commerce/source-data","https://github.com/markitics/bumpgrade/issues/46","https://github.com/markitics/bumpgrade/issues/217"]',
    '["Open /pricing.","Read launch preview, publisher pilot, and operator stack options.","Review payment option language for card payments, Stripe invoices, and manual approval.","Use the access CTA when ready to discuss the first live offer."]',
    '["No self-serve live checkout button should appear until live checkout smoke proof is linked.","Pricing should not invent fixed plan amounts before the launch wave confirms packaging.","Sandbox checkout proof is not the same as live-mode product payment proof."]',
    'Agents can read /pricing and /content/source-data, but billing-impacting recommendations must cite /commerce/source-data and current Stripe proof.',
    '["Issue #217 rewrites pricing as launch-facing copy.","The pricing page links to human contact paths instead of an unverified live checkout button."]',
    43,
    unixepoch()
  )
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  feature_id = excluded.feature_id,
  feature_status = excluded.feature_status,
  issue_numbers_json = excluded.issue_numbers_json,
  primary_user = excluded.primary_user,
  user_goal = excluded.user_goal,
  source_evidence_json = excluded.source_evidence_json,
  happy_path_json = excluded.happy_path_json,
  edge_cases_json = excluded.edge_cases_json,
  agent_access = excluded.agent_access,
  validation_json = excluded.validation_json,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-20-launch-marketing-readiness',
  'Prepared launch marketing and journey proof surfaces',
  'Codex',
  'codex',
  'bumpgrade-launch-readiness',
  'Mark asked to make the public homepage, features, feature detail pages, pricing, and user-journey proof feel ready before inviting people to try Bumpgrade.',
  '[{"number":217,"url":"https://github.com/markitics/bumpgrade/issues/217"}]',
  '[]',
  '["https://bumpgrade.com/","https://bumpgrade.com/features","https://bumpgrade.com/features/email-campaigns","https://bumpgrade.com/features/order-bump","https://bumpgrade.com/pricing","https://bumpgrade.com/features/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '[".github/workflows/ci.yml","docs/pr-screenshots/issue-217-homepage.png"]',
  '["npm run lint","npm run typecheck","npm run test:runtime-secrets","npm run build","npm run cf:build","npm run test:browser"]',
  'Live self-serve checkout is still not claimed until the production Stripe path has a linked live smoke test. The Documents checkout stayed blocked by macOS TCC in this running Codex process, so this branch was built from /tmp/bumpgrade-launch.',
  1779265119,
  1779270100,
  '["https://bumpgrade.com/pr-screenshots/issue-217-homepage.png","https://bumpgrade.com/pr-screenshots/issue-217-features.png","https://bumpgrade.com/pr-screenshots/issue-217-pricing.png","https://bumpgrade.com/pr-screenshots/issue-217-admin-user-journeys.png"]',
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
