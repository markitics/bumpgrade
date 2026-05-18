UPDATE admin_roadmap_items
SET
  next_milestone = 'Keep private admin pages behind Better Auth while adding confirmed write APIs and richer agent contracts.',
  updated_at = unixepoch()
WHERE id = 'roadmap-admin-surfaces';

UPDATE admin_roadmap_items
SET
  status = 'live',
  summary = 'Better Auth email/password accounts, D1-backed sessions, API routes, login/signup UI, and owner-gated admin pages.',
  public_evidence_json = '["Issue #9 owns the Better Auth foundation slice.", "Login/signup, D1 auth tables, Better Auth API routes, and owner-gated admin pages are included in the issue #9 implementation."]',
  next_milestone = 'Enable verified production owner access after Cloudflare project email in #10 can send confirmation mail, then broaden publisher account surfaces.',
  updated_at = unixepoch()
WHERE id = 'roadmap-better-auth';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES
  ('journey-owner-opens-protected-admin', 'Owner opens protected admin surfaces', 'feature-better-auth', 'live', '[9,10]', 'Mark as Bumpgrade owner', 'Sign in with an allowlisted owner account and open private admin pages while public-safe JSON remains available to agents.', '["https://bumpgrade.com/login", "https://github.com/markitics/bumpgrade/issues/9", "https://github.com/markitics/bumpgrade/issues/10"]', '["Open /login.", "Create or sign into a Better Auth account.", "Use an allowlisted owner email.", "Open /admin/roadmap or /admin/for-mark.", "Use /admin/source-data for public-safe agent reads."]', '["Production owner access requires verified email; email delivery remains tracked by issue #10.", "Non-allowlisted accounts stay signed in as publishers but cannot view private admin pages."]', 'Agents can read public-safe source data without a session; private admin pages require a human Better Auth owner session.', '["Playwright signs in or creates the allowlisted owner and opens protected admin pages locally.", "Unauthenticated admin page smoke tests assert the lock screen."]', 35, unixepoch())
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
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
