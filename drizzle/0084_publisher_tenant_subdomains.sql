CREATE TABLE IF NOT EXISTS publisher_plan_entitlements (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  owner_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT NOT NULL,
  plan_slug TEXT NOT NULL,
  starts_at INTEGER NOT NULL DEFAULT (unixepoch()),
  ends_at INTEGER,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS publisher_plan_entitlements_owner_user_status_idx
  ON publisher_plan_entitlements(owner_user_id, status, updated_at);

CREATE INDEX IF NOT EXISTS publisher_plan_entitlements_owner_email_status_idx
  ON publisher_plan_entitlements(owner_email, status, updated_at);

CREATE TABLE IF NOT EXISTS publisher_tenants (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  owner_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  plan_status TEXT NOT NULL DEFAULT 'paid',
  default_subdomain TEXT,
  primary_hostname TEXT,
  source_issue_number INTEGER NOT NULL DEFAULT 222,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS publisher_tenants_owner_email_unique
  ON publisher_tenants(owner_email);

CREATE UNIQUE INDEX IF NOT EXISTS publisher_tenants_owner_user_unique
  ON publisher_tenants(owner_user_id);

CREATE INDEX IF NOT EXISTS publisher_tenants_status_updated_idx
  ON publisher_tenants(status, updated_at);

CREATE TABLE IF NOT EXISTS publisher_subdomain_reservations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES publisher_tenants(id) ON DELETE CASCADE,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  owner_email TEXT NOT NULL,
  subdomain TEXT NOT NULL,
  full_hostname TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  idempotency_key TEXT NOT NULL,
  source_issue_number INTEGER NOT NULL DEFAULT 222,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS publisher_subdomain_reservations_subdomain_unique
  ON publisher_subdomain_reservations(subdomain);

CREATE UNIQUE INDEX IF NOT EXISTS publisher_subdomain_reservations_idempotency_unique
  ON publisher_subdomain_reservations(idempotency_key);

CREATE INDEX IF NOT EXISTS publisher_subdomain_reservations_tenant_status_idx
  ON publisher_subdomain_reservations(tenant_id, status, updated_at);

CREATE TABLE IF NOT EXISTS publisher_tenant_audit_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES publisher_tenants(id) ON DELETE SET NULL,
  actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  event_kind TEXT NOT NULL,
  summary TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS publisher_tenant_audit_events_idempotency_unique
  ON publisher_tenant_audit_events(idempotency_key);

CREATE INDEX IF NOT EXISTS publisher_tenant_audit_events_tenant_created_idx
  ON publisher_tenant_audit_events(tenant_id, created_at);

INSERT INTO publisher_plan_entitlements (
  id, owner_user_id, owner_email, status, source, plan_slug, starts_at, metadata_json, created_at, updated_at
) VALUES (
  'publisher-plan-entitlement-mark-launch-pilot',
  NULL,
  'm@rkmoriarty.com',
  'active',
  'launch_pilot',
  'publisher-pilot',
  unixepoch(),
  '{"sourceIssueNumber":222,"note":"Launch-pilot paid entitlement for first Bumpgrade owner smoke path."}',
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  status = excluded.status,
  source = excluded.source,
  plan_slug = excluded.plan_slug,
  metadata_json = excluded.metadata_json,
  updated_at = unixepoch();

INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-paid-publisher-subdomains',
  'Paid publisher tenants and Bumpgrade subdomains',
  'active',
  222,
  'feature-better-auth',
  'Accounts and domains',
  'Publisher account setup now has paid-plan entitlement records, D1-backed tenant rows, idempotent default subdomain reservation, and cross-subdomain Better Auth cookie configuration for bumpgrade.com subdomains.',
  '["Issue #222 tracks paid publisher tenants and Bumpgrade subdomain reservation.","/account/setup is the signed-in publisher setup surface.","/account/source-data exposes the public-safe tenant/subdomain contract.","POST /api/account/publisher/subdomain reserves a unique *.bumpgrade.com hostname only after email verification and active paid-plan or launch-pilot entitlement."]',
  'Add custom-domain DNS guidance and verification state in issue #223, then domain purchase decisions in issue #225.',
  NULL,
  52,
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
  'journey-publisher-reserves-bumpgrade-subdomain',
  'Publisher reserves a paid Bumpgrade subdomain',
  'feature-better-auth',
  'live',
  '[9,221,222]',
  'Publisher who has activated a paid plan or launch pilot',
  'Sign in, confirm email, and reserve a unique Bumpgrade subdomain that can become the default public hostname for the publisher workspace.',
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://github.com/markitics/bumpgrade/issues/221","https://github.com/markitics/bumpgrade/issues/222"]',
  '["Create or sign into a Bumpgrade publisher account.","Confirm the account email.","Activate a paid plan or launch-pilot entitlement.","Open /account/setup.","Enter the desired subdomain, such as studio, and submit the reservation.","See the reserved hostname, such as studio.bumpgrade.com, recorded for the publisher tenant."]',
  '["Signed-out users must sign in first.","Unverified users must confirm email first.","Free or unpaid accounts cannot reserve a Bumpgrade subdomain.","Reserved platform names such as admin, api, www, login, pricing, and features are blocked.","A subdomain already reserved by another tenant returns a conflict.","Custom domains and buying domains are tracked separately and should not be claimed as live from this journey."]',
  'Agents can read /account/source-data and inspect the tenant/subdomain contract. Public or delegated agent writes still require authenticated user context, idempotency, audit correlation, redaction, and paid-plan checks.',
  '["Playwright covers /account/setup rendering, /account/source-data, paid owner reservation, idempotent replay, reserved-name rejection, and unpaid account rejection.","Issue #222 records the D1 migration, API, account setup route, and cross-subdomain auth configuration."]',
  44,
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
  'work-log-2026-05-20-paid-publisher-subdomains',
  'Added paid publisher tenant and Bumpgrade subdomain reservation path',
  'Codex',
  'codex',
  'bumpgrade-launch-readiness',
  'Mark asked whether Bumpgrade is ready for invited publishers, including paid-gated default Bumpgrade subdomains and one login across subdomains.',
  '[{"number":221,"url":"https://github.com/markitics/bumpgrade/issues/221"},{"number":222,"url":"https://github.com/markitics/bumpgrade/issues/222"}]',
  '[]',
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://bumpgrade.com/pricing"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/publisher-tenants.md"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npm run test:browser","Playwright screenshot captured at docs/pr-screenshots/issue-222-account-setup.png and public/pr-screenshots/issue-222-account-setup.png"]',
  'Default bumpgrade.com subdomains are now a paid-gated reservation path. Custom-domain DNS verification, buying domains through Bumpgrade, and custom-domain auth are tracked separately in issues #223, #225, and #224.',
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data"]',
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
