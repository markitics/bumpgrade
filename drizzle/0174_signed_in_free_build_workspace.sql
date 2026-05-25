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
  'Defines the $0 private-building path, signed-in Free Build workspace creation, paid go-live gates, and the anonymous playground recovery boundary before public, billing, sending, domain, or fulfillment actions are treated as live.',
  json_array(
    'Issue #466 tracks the Free Build pricing model and optional anonymous playground.',
    'Issue #473 tracks verified signed-in Free Build workspace creation.',
    '/pricing explains the build-first message in plain public copy.',
    '/pricing/source-data exposes signed-in Free Build workspace status, non-live anonymous playground state, and paid go-live gates.',
    '/account/setup lets verified signed-in users create a private Free Build workspace before payment.',
    '/account/source-data exposes the signed-in Free Build workspace contract and paid go-live gates.',
    '/content/source-data ties the pricing policy into audience and resource discovery records.'
  ),
  'Implement logged-out anonymous browser recovery only after privacy, abuse, expiration, merge-to-account, redaction, and cleanup rules are ready.',
  'Signed-in Free Build workspace creation is live for verified authenticated publishers; anonymous playground recovery is still not live.',
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
  issue_numbers_json = '[20,46,217,222,223,225,226,234,466,473]',
  source_evidence_json = '["https://bumpgrade.com/pricing","https://bumpgrade.com/pricing/source-data","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://github.com/markitics/bumpgrade/issues/46","https://github.com/markitics/bumpgrade/issues/217","https://github.com/markitics/bumpgrade/issues/466","https://github.com/markitics/bumpgrade/issues/473"]',
  edge_cases_json = '["Free Build is a tracked build-before-payment model; verified signed-in private workspace creation is live, while anonymous recovery is not live until implementation evidence exists.","Enterprise is a contact path, not self-serve checkout.","/pricing-v2 is an alternate usage-based draft and is not the default pricing model.","Successful Checkout Sessions are verified server-side before a publisher plan entitlement is activated.","Bumpgrade connects domains customers already own; it does not sell, register, renew, transfer, or price domains today."]',
  validation_json = '["Issue #217 rewrites pricing as launch-facing copy.","Issue #225 clarifies the domain purchase policy.","Issue #226 refreshes launch signup and pricing copy for paid domain readiness.","Issue #234 refreshes pricing user-journey proof with the latest PR #233 CI and issue #226 screenshot links.","Issue #316 adds live self-serve Bumpgrade plan checkout, success verification, and seeded product/price records.","Issue #466 adds the Free Build policy source data and paid go-live gate evidence.","Issue #473 adds signed-in Free Build workspace creation while keeping buyer-facing actions paid-gated."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-reviews-launch-pricing';

UPDATE admin_user_journeys
SET
  edge_cases_json = '["The first policy slice does not prove logged-out browser recovery is live.","Signed-in Free Build workspace creation is covered by /account/setup and /account/source-data.","Buyer-facing publishing, live checkout, email sends, domains, and fulfillment remain gated."]',
  validation_json = '["Pricing route smoke confirms the public copy avoids internal implementation language.","/pricing/source-data exposes Free Build capability records and paid go-live gate records.","/account/source-data exposes signed-in Free Build workspace creation as live.","/content/source-data and /agent-docs/source-data include the pricing policy as agent-readable evidence."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-understands-free-build';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal,
  source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json,
  sort_order, updated_at
) VALUES (
  'journey-publisher-creates-free-build-workspace',
  'Publisher creates a private Free Build workspace',
  'feature-better-auth',
  'live',
  '[9,221,466,473]',
  'Verified publisher who wants to start setup before paying',
  'Create a private Bumpgrade workspace before payment and return later without unlocking public buyer-facing actions.',
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://bumpgrade.com/pricing/source-data","https://github.com/markitics/bumpgrade/issues/466","https://github.com/markitics/bumpgrade/issues/473"]',
  '["Create or sign into a Bumpgrade publisher account.","Confirm the account email.","Open /account/setup.","Create the private Free Build workspace.","Return to /account/setup and see that Free Build is active.","Choose a paid go-live plan before reserving domains or enabling public buyer-facing actions."]',
  '["Signed-out users must sign in first.","Unverified users must confirm email first.","Idempotent replays return the same workspace.","Free Build workspaces cannot reserve Bumpgrade subdomains or add custom domains until a paid plan is active.","Logged-out anonymous browser recovery remains out of scope."]',
  'Agents can read /account/source-data for the signed-in Free Build contract, but creating workspaces requires authenticated publisher context, explicit confirmation, idempotency, and redacted audit evidence.',
  '["Playwright covers verified signed-in Free Build creation, idempotent replay, paid subdomain gate preservation, paid custom-domain gate preservation, and /account/setup state.","/account/source-data exposes signed-in Free Build as live and anonymous playground recovery as not live."]',
  43,
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
  'work-log-2026-05-25-signed-in-free-build-workspace',
  'Added signed-in Free Build workspace creation',
  'Codex',
  'codex',
  'bumpgrade-signed-in-free-build-workspace',
  'Owner asked for users to play with Bumpgrade without paying and keep their work before going live.',
  '[{"number":466,"url":"https://github.com/markitics/bumpgrade/issues/466"},{"number":473,"url":"https://github.com/markitics/bumpgrade/issues/473"}]',
  '[]',
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://bumpgrade.com/pricing/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/publisher-tenants.md","public/llms.txt"]',
  '["Focused Playwright covers signed-in Free Build workspace creation, idempotent replay, and paid domain gate preservation.","Source-data smoke covers /account/source-data Free Build policy."]',
  'Signed-in Free Build workspace creation is live in this slice; logged-out anonymous recovery remains future work.',
  1779712800,
  1779713700,
  '["https://github.com/markitics/bumpgrade/issues/473","https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://bumpgrade.com/pricing/source-data"]',
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
