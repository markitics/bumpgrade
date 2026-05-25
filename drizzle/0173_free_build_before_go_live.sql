INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-free-build-before-go-live',
  'Free build-before-go-live pricing model',
  'active',
  466,
  'feature-resources-use-cases-pricing',
  'Marketing surfaces',
  'Defines the $0 private-building path, the paid go-live gates, and the anonymous playground recovery boundary before any public, billing, sending, domain, or fulfillment action is treated as live.',
  json_array(
    'Issue #466 tracks the Free Build pricing model and optional anonymous playground.',
    '/pricing explains the build-first message in plain public copy.',
    '/pricing/source-data exposes the Free Build design, non-live anonymous playground state, and paid go-live gates.',
    '/content/source-data ties the pricing policy into audience and resource discovery records.'
  ),
  'Implement signed-in free workspace persistence and anonymous browser recovery only after privacy, abuse, expiration, merge-to-account, redaction, and cleanup rules are ready.',
  'Signed-in free workspace persistence and anonymous playground recovery are not live yet; this slice makes the policy and gates explicit first.',
  205,
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
  issue_numbers_json = '[20,46,217,222,223,225,226,234,466]',
  user_goal = 'Understand Free Build, Experiment, Grow, Enterprise, White glove setup, and live payment handling before starting or upgrading the account plan.',
  source_evidence_json = '["https://bumpgrade.com/pricing","https://bumpgrade.com/pricing/source-data","https://bumpgrade.com/commerce/source-data","https://github.com/markitics/bumpgrade/issues/46","https://github.com/markitics/bumpgrade/issues/217","https://github.com/markitics/bumpgrade/issues/466"]',
  happy_path_json = '["Open /pricing.","Review the build-first message and paid go-live gates.","Compare Experiment, Grow, Enterprise, and the optional White glove setup add-on.","Submit Experiment or Grow to start Stripe Checkout for the Bumpgrade account plan.","Return from Stripe to /pricing/success and continue to account setup with the same email."]',
  edge_cases_json = '["Free Build is a tracked build-before-payment model; signed-in free workspace persistence and anonymous recovery are not live until implementation evidence exists.","Enterprise is a contact path, not self-serve checkout.","/pricing-v2 is an alternate usage-based draft and is not the default pricing model.","Successful Checkout Sessions are verified server-side before a publisher plan entitlement is activated.","Bumpgrade connects domains customers already own; it does not sell, register, renew, transfer, or price domains today."]',
  agent_access = 'Agents can read /pricing, /pricing/source-data, and /content/source-data, but billing-impacting recommendations must cite /commerce/source-data and current Stripe proof.',
  validation_json = '["Issue #217 rewrites pricing as launch-facing copy.","Issue #225 clarifies the domain purchase policy.","Issue #226 refreshes launch signup and pricing copy for paid domain readiness.","Issue #234 refreshes pricing user-journey proof with the latest PR #233 CI and issue #226 screenshot links.","Issue #316 adds live self-serve Bumpgrade plan checkout, success verification, and seeded product/price records.","Issue #466 adds the Free Build policy source data and paid go-live gate evidence."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-reviews-launch-pricing';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal,
  source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json,
  sort_order, updated_at
) VALUES (
  'journey-prospect-understands-free-build',
  'Prospect understands Free Build before going live',
  'feature-resources-use-cases-pricing',
  'live',
  '[20,316,466]',
  'Publisher who wants to start building before paying',
  'See that Bumpgrade can be shaped before payment while public publishing, live checkout, subscriber sends, domains, and fulfillment stay gated until go-live.',
  '["https://bumpgrade.com/pricing","https://bumpgrade.com/pricing/source-data","https://github.com/markitics/bumpgrade/issues/466"]',
  '["Open /pricing.","Read the build-first explanation.","Review what can be assembled privately before payment.","Review which buyer-facing actions require a paid or approved go-live state.","Use /pricing/source-data when an agent needs stable IDs for the same policy."]',
  '["The first policy slice does not prove signed-in free workspace persistence is live.","The first policy slice does not prove logged-out browser recovery is live.","Buyer-facing publishing, live checkout, email sends, domains, and fulfillment remain gated."]',
  'Agents can read /pricing/source-data for Free Build capability IDs, paid go-live gate IDs, non-live anonymous playground state, and redaction boundaries.',
  '["Pricing route smoke confirms the public copy avoids internal implementation language.","/pricing/source-data exposes Free Build capability records and paid go-live gate records.","/content/source-data and /agent-docs/source-data include the pricing policy as agent-readable evidence."]',
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

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-25-free-build-before-go-live',
  'Added Free Build pricing policy and go-live gates',
  'Codex',
  'codex',
  'bumpgrade-free-build-before-go-live',
  'Owner asked for Bumpgrade to make it clear publishers should be able to build before paying and only pay when ready to go live.',
  '[{"number":466,"url":"https://github.com/markitics/bumpgrade/issues/466"}]',
  '[]',
  '["https://bumpgrade.com/pricing","https://bumpgrade.com/pricing/source-data","https://bumpgrade.com/content/source-data","https://bumpgrade.com/agent-docs/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["public/llms.txt"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g pricing/source-data/content/commerce/agent/public-copy focus","Pricing screenshots captured under docs/pr-screenshots and public/pr-screenshots.","git diff --check"]',
  'This is the policy and source-data slice. Signed-in free workspace persistence and anonymous playground recovery are not live until issue #466 has implementation evidence.',
  1779710400,
  1779712500,
  '["https://github.com/markitics/bumpgrade/issues/466","https://bumpgrade.com/pricing","https://bumpgrade.com/pricing/source-data","https://bumpgrade.com/content/source-data","https://bumpgrade.com/agent-docs/source-data"]',
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
