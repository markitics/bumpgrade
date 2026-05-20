CREATE TABLE IF NOT EXISTS publisher_custom_domains (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES publisher_tenants(id) ON DELETE CASCADE,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  owner_email TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  normalized_domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_dns',
  dns_record_type TEXT NOT NULL DEFAULT 'CNAME',
  dns_record_name TEXT NOT NULL,
  dns_record_value TEXT NOT NULL,
  dns_expected_value TEXT NOT NULL,
  dns_last_checked_at INTEGER,
  dns_verified_at INTEGER,
  ssl_status TEXT NOT NULL DEFAULT 'not_requested',
  failure_reason TEXT,
  idempotency_key TEXT NOT NULL,
  source_issue_number INTEGER NOT NULL DEFAULT 223,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS publisher_custom_domains_normalized_domain_unique
  ON publisher_custom_domains(normalized_domain);

CREATE UNIQUE INDEX IF NOT EXISTS publisher_custom_domains_idempotency_unique
  ON publisher_custom_domains(idempotency_key);

CREATE INDEX IF NOT EXISTS publisher_custom_domains_tenant_status_idx
  ON publisher_custom_domains(tenant_id, status, updated_at);

UPDATE admin_roadmap_items
SET status = 'live',
    next_milestone = 'Use the paid-gated account and default subdomain foundation as the base for custom-domain DNS onboarding, domain purchase, and publisher site auth.',
    updated_at = unixepoch()
WHERE id = 'roadmap-paid-publisher-subdomains';

INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-custom-domain-onboarding',
  'Custom domain DNS onboarding and verification',
  'active',
  223,
  'feature-better-auth',
  'Accounts and domains',
  'Paid publishers can add an existing custom domain, receive deterministic CNAME instructions, and re-check DNS verification state from account setup without exposing private DNS credentials.',
  '["Issue #223 tracks custom-domain onboarding with DNS guidance and verification state.","/account/setup is the signed-in publisher setup surface for custom domains.","/account/source-data exposes the public-safe custom-domain DNS contract.","POST /api/account/publisher/custom-domain starts onboarding and re-checks DNS for paid, email-confirmed publishers with a default Bumpgrade hostname."]',
  'Add custom-domain auth semantics in issue #224, then domain purchase decisions in issue #225.',
  NULL,
  53,
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
  'journey-publisher-connects-custom-domain',
  'Publisher connects an existing custom domain',
  'feature-better-auth',
  'live',
  '[9,221,222,223]',
  'Paid publisher who already controls a domain',
  'Add an existing domain to a Bumpgrade tenant, copy the required DNS record, and see whether DNS has been verified before activation.',
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://github.com/markitics/bumpgrade/issues/221","https://github.com/markitics/bumpgrade/issues/223"]',
  '["Create or sign into a Bumpgrade publisher account.","Confirm the account email.","Activate a paid plan or launch-pilot entitlement.","Reserve the default Bumpgrade subdomain first.","Open /account/setup and enter the existing domain.","Copy the CNAME record name and target shown by Bumpgrade.","Click re-check DNS after the record is created at the domain host.","See pending DNS or verified DNS state without exposing private provider credentials."]',
  '["Signed-out users must sign in first.","Unverified users must confirm email first.","Free or unpaid accounts cannot add a custom domain.","A default Bumpgrade hostname is required before custom-domain onboarding.","Bumpgrade-owned domains such as bumpgrade.com are rejected here.","Domains already claimed by another tenant return a conflict.","DNS verification can be pending while records propagate.","SSL and final custom-hostname activation remain visible as state, not hidden implementation detail."]',
  'Agents can read /account/source-data and inspect the custom-domain DNS contract. Custom-domain writes require authenticated user context, paid-plan checks, idempotency, audit correlation, redaction, and explicit DNS verification state.',
  '["Playwright covers /account/setup rendering, /account/source-data, paid custom-domain onboarding, idempotent replay, DNS verification transition, invalid Bumpgrade-owned domain rejection, and unpaid account rejection.","Issue #223 records the D1 migration, API, account setup UI, DNS instruction, and redacted source-data contract."]',
  45,
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
  'work-log-2026-05-20-custom-domain-dns-onboarding',
  'Added custom-domain DNS onboarding and verification state',
  'Codex',
  'codex',
  'bumpgrade-launch-readiness',
  'Mark asked whether a paid Bumpgrade publisher can bring their own domain and whether Bumpgrade tells them exactly what DNS to configure.',
  '[{"number":221,"url":"https://github.com/markitics/bumpgrade/issues/221"},{"number":223,"url":"https://github.com/markitics/bumpgrade/issues/223"}]',
  '[]',
  '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://bumpgrade.com/pricing"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/publisher-tenants.md"]',
  '["npm run lint","npm run typecheck","git diff --check","npm run test:browser"]',
  'Existing-domain onboarding now gives CNAME instructions and DNS verification state. Buying domains through Bumpgrade is still tracked separately in issue #225.',
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
