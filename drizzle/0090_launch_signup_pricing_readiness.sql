UPDATE admin_user_journeys
SET issue_numbers_json = '[6,14,15,16,17,18,19,217,226]',
    happy_path_json = '["Open the homepage and understand Bumpgrade as a publisher launch system.","Open /features to see customer-facing feature groups organized by launch job.","Open a dedicated feature page such as /features/email-campaigns or /features/order-bump.","Follow feature examples or related launch previews when the feature fits the offer.","Open /pricing to understand invite access and payment options."]',
    validation_json = '["Issue #217 adds launch marketing pages, dedicated feature routes, sitemap entries, screenshots, and CI wiring.","Issue #226 removes internal status-board language from public launch copy and refreshes pricing/domain readiness proof.","Playwright smoke tests cover homepage, /features, dedicated feature pages, /pricing, and source-data routes."]',
    updated_at = unixepoch()
WHERE id = 'journey-prospect-explores-launch-marketing';

UPDATE admin_user_journeys
SET issue_numbers_json = '[20,46,217,222,223,225,226]',
    source_evidence_json = '["https://bumpgrade.com/pricing","https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://bumpgrade.com/commerce/source-data","https://github.com/markitics/bumpgrade/issues/46","https://github.com/markitics/bumpgrade/issues/217","https://github.com/markitics/bumpgrade/issues/222","https://github.com/markitics/bumpgrade/issues/223","https://github.com/markitics/bumpgrade/issues/225","https://github.com/markitics/bumpgrade/issues/226"]',
    happy_path_json = '["Open /pricing.","Read launch preview, publisher pilot, and operator stack options.","Review payment option language for pilot payments, Stripe invoices, subdomains, custom domains, and manual approval.","Use the access CTA when ready to discuss the first live offer."]',
    edge_cases_json = '["No self-serve live checkout button should appear until live checkout smoke proof is linked.","Pricing should not invent fixed plan amounts before the launch wave confirms packaging.","Sandbox checkout proof is not the same as live-mode product payment proof.","Bumpgrade connects domains customers already own; it does not sell, register, renew, transfer, or price domains today."]',
    validation_json = '["Issue #217 rewrites pricing as launch-facing copy.","Issue #225 clarifies the domain purchase policy.","Issue #226 refreshes launch signup and pricing copy for paid domain readiness.","The pricing page links to human contact paths instead of an unverified live checkout button."]',
    updated_at = unixepoch()
WHERE id = 'journey-prospect-reviews-launch-pricing';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-20-launch-signup-pricing-readiness',
  'Refreshed launch signup and pricing readiness copy',
  'Codex',
  'codex',
  'bumpgrade-launch-readiness',
  'Mark asked whether Bumpgrade is ready to invite people and called out public copy, feature marketing, pricing, domains, and user-journey proof.',
  '[{"number":226,"url":"https://github.com/markitics/bumpgrade/issues/226"}]',
  '[]',
  '["https://bumpgrade.com/","https://bumpgrade.com/features","https://bumpgrade.com/features/email-campaigns","https://bumpgrade.com/features/order-bump","https://bumpgrade.com/pricing","https://bumpgrade.com/account/setup","https://bumpgrade.com/content/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["src/lib/content-surfaces.ts","src/lib/marketing-features.ts","src/lib/admin-surface-data.ts"]',
  '["npm run lint","npm run typecheck","npm run db:migrate:local","Focused Playwright route and source-data tests","Launch page screenshots for issue #226"]',
  'Public copy now treats Bumpgrade as ready for invite conversations while still gating customer-facing live checkout per offer until Stripe live smoke evidence exists.',
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/","https://bumpgrade.com/features","https://bumpgrade.com/pricing","https://bumpgrade.com/account/setup","https://bumpgrade.com/admin/user-journeys/source-data","https://github.com/markitics/bumpgrade/issues/226"]',
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
