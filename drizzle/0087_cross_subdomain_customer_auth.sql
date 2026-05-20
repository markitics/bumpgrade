INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-cross-subdomain-customer-auth',
  'Customer login across Bumpgrade-hosted publisher sites',
  'active',
  224,
  'feature-better-auth',
  'Accounts and domains',
  'Bumpgrade-hosted publisher subdomains share the central Better Auth identity session while tenant access remains scoped per hostname, checkout, entitlement, and membership state.',
  '["Issue #224 tracks the publisher-site auth boundary.","/account/source-data exposes the Bumpgrade-subdomain session-sharing contract and custom-domain caveat.","Production Better Auth uses the bumpgrade.com cookie domain and https://*.bumpgrade.com trusted origin pattern.","Custom domains cannot receive the bumpgrade.com browser cookie directly, so they use a central Bumpgrade login handoff before returning to tenant-scoped access checks."]',
  'Validate the contract in Playwright, deploy the source-data update, then move to domain purchase decisions in issue #225.',
  NULL,
  54,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  status = excluded.status,
  issue_number = excluded.issue_number,
  feature_id = excluded.feature_id,
  group_name = excluded.group_name,
  summary = excluded.summary,
  public_evidence_json = excluded.public_evidence_json,
  next_milestone = excluded.next_milestone,
  mark_attention = excluded.mark_attention,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user,
  user_goal, source_evidence_json, happy_path_json, edge_cases_json,
  agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-customer-uses-one-login-across-bumpgrade-subdomains',
  'Customer uses one login across Bumpgrade-hosted publisher sites',
  'feature-better-auth',
  'live',
  '[9,221,222,223,224]',
  'Customer buying from multiple Bumpgrade-hosted publishers',
  'Use one Bumpgrade identity session across publisher subdomains while each publisher site keeps its own access and entitlement checks.',
  '["https://bumpgrade.com/account/source-data","https://github.com/markitics/bumpgrade/issues/221","https://github.com/markitics/bumpgrade/issues/224"]',
  '["Customer signs into the central Bumpgrade account session.","Customer opens a paid publisher site on a.bumpgrade.com.","Customer later opens another paid publisher site on b.bumpgrade.com without creating a second identity login.","Each site resolves its hostname to the correct publisher tenant before showing protected products, memberships, or customer content.","If the publisher uses a custom domain, Bumpgrade uses the central sign-in handoff and returns the customer to the custom domain for tenant-scoped access checks."]',
  '["A shared identity session must not grant access to products or memberships sold by a different publisher.","A shared identity session must not grant owner/admin access.","Unrelated customer-owned domains cannot receive the bumpgrade.com browser cookie directly.","Localhost smoke tests cannot prove bumpgrade.com browser cookie sharing; production smoke should verify the deployed source-data contract."]',
  'Agents can read /account/source-data for the session boundary. They must not infer cross-tenant customer access from a shared identity session.',
  '["Playwright asserts the production Better Auth cookie-domain and trusted-origin contract.","Playwright asserts /account/source-data exposes the Bumpgrade-subdomain and custom-domain auth boundary.","Issue #224 records the explicit launch behavior and custom-domain limitation."]',
  46,
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
  'work-log-2026-05-20-cross-subdomain-customer-auth',
  'Defined cross-subdomain customer auth boundary',
  'Codex',
  'codex',
  'bumpgrade-launch-readiness',
  'Mark asked whether end-user auth works across a.bumpgrade.com and b.bumpgrade.com and how custom domains should behave.',
  '[{"number":221,"url":"https://github.com/markitics/bumpgrade/issues/221"},{"number":224,"url":"https://github.com/markitics/bumpgrade/issues/224"}]',
  '[]',
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/publisher-tenants.md","docs/operations.md","public/llms.txt"]',
  '["npm run lint","npm run typecheck","git diff --check","npm run test:browser"]',
  'Bumpgrade-hosted subdomains share the central identity session; custom domains use a Bumpgrade login handoff because browser cookies cannot span unrelated domains.',
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://github.com/markitics/bumpgrade/issues/224"]',
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
