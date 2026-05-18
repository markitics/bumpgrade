CREATE TABLE IF NOT EXISTS admin_roadmap_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('idea', 'pending', 'active', 'blocked', 'live', 'parked')),
  issue_number INTEGER,
  feature_id TEXT,
  group_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  public_evidence_json TEXT NOT NULL DEFAULT '[]',
  next_milestone TEXT NOT NULL DEFAULT '',
  mark_attention TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS admin_work_log_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  agent_name TEXT NOT NULL DEFAULT 'Codex',
  agent_kind TEXT NOT NULL DEFAULT 'codex',
  session_name TEXT,
  prompt_from_mark TEXT NOT NULL,
  github_issues_json TEXT NOT NULL DEFAULT '[]',
  closed_prs_json TEXT NOT NULL DEFAULT '[]',
  features_updated_json TEXT NOT NULL DEFAULT '[]',
  roadmap_updated_json TEXT NOT NULL DEFAULT '[]',
  user_journeys_updated_json TEXT NOT NULL DEFAULT '[]',
  documentation_updated_json TEXT NOT NULL DEFAULT '[]',
  validation_json TEXT NOT NULL DEFAULT '[]',
  flags_attention TEXT,
  first_prompt_at INTEGER NOT NULL,
  completed_at INTEGER NOT NULL,
  relevant_urls_json TEXT NOT NULL DEFAULT '[]',
  pr_comment_url TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS admin_user_journeys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  feature_status TEXT NOT NULL CHECK (feature_status IN ('live', 'pending')),
  issue_numbers_json TEXT NOT NULL DEFAULT '[]',
  primary_user TEXT NOT NULL,
  user_goal TEXT NOT NULL,
  source_evidence_json TEXT NOT NULL DEFAULT '[]',
  happy_path_json TEXT NOT NULL DEFAULT '[]',
  edge_cases_json TEXT NOT NULL DEFAULT '[]',
  agent_access TEXT NOT NULL,
  validation_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS mark_attention_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('blocked', 'review', 'fyi')),
  state TEXT NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'read', 'ok', 'resolved')),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT,
  required_action TEXT,
  response_instructions TEXT,
  session_name TEXT,
  session_id TEXT,
  session_email TEXT,
  source_agent TEXT NOT NULL DEFAULT 'Codex',
  source_kind TEXT NOT NULL DEFAULT 'codex',
  links_json TEXT NOT NULL DEFAULT '[]',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  last_activity_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_admin_roadmap_status_sort ON admin_roadmap_items(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_admin_work_log_completed ON admin_work_log_entries(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_user_journeys_feature ON admin_user_journeys(feature_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_mark_attention_state ON mark_attention_items(state, urgency, last_activity_at DESC);

INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary, public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES
  ('roadmap-cloudflare-foundation', 'Cloudflare app foundation', 'live', 4, 'feature-cloudflare-foundation', 'Platform', 'Next/OpenNext Worker app, D1 binding, R2 cache binding, DNS, core routes, screenshots, and deploy path.', '["PR #23 merged.", "Cloudflare deployment and live route smoke checks recorded on PR #23."]', 'Keep using this as the base for every issue slice.', NULL, 10, unixepoch()),
  ('roadmap-comparison-hub', 'Comparison hub and alternative pages', 'live', 5, 'feature-compare-source-data', 'SEO and agent discovery', 'Shopify-inspired compare hub, nine alternative pages, source-linked competitor data, and /compare/source-data.', '["PR #25 merged.", "Live edge checks and screenshot URLs recorded on PR #25."]', 'Refresh competitor sources when pricing or packaging copy is used in user-facing answers.', NULL, 20, unixepoch()),
  ('roadmap-feature-catalog', 'Public feature catalog', 'live', 6, 'feature-public-feature-catalog', 'SEO and agent discovery', 'Aspirational /features page with live and pending badges, stable feature IDs, issue links, and /features/source-data.', '["PR #26 merged.", "Live edge checks and feature JSON parse checks recorded on PR #26."]', 'Keep feature records current as product slices move from pending to shipped.', NULL, 30, unixepoch()),
  ('roadmap-public-roadmap', 'Public roadmap from main feature set', 'live', 7, 'feature-public-roadmap', 'Roadmap', 'Public roadmap lanes connected to the feature catalog, GitHub issues, public-safe blockers, and deploy evidence.', '["Issue #7 owns this feature slice.", "PR #27 carries the source, screenshots, validation, and deploy evidence for this issue."]', 'Replace shared static records with D1-backed admin state in #8.', NULL, 40, unixepoch()),
  ('roadmap-admin-surfaces', 'D1-backed admin roadmap, work log, journeys, and for-Mark surfaces', 'live', 8, 'feature-admin-state', 'Admin and operations', 'Owner and agent coordination surfaces backed by D1 instead of static scaffold copy.', '["Tracked by issue #8.", "Current admin routes read this D1-backed surface when available."]', 'Protect private admin workflows with Better Auth in #9 while keeping public-safe agent reads available.', NULL, 50, unixepoch()),
  ('roadmap-codex-email', 'Codex project email and reply monitor', 'blocked', 10, 'feature-codex-email', 'Operations', 'Outbound shipped-feature notices and inbound reply monitoring from codex@bumpgrade.com.', '["Issue #10 records the failed Cloudflare Email REST send attempt.", "Cloudflare API reported Email Routing as unconfigured with missing MX, SPF, and DKIM records."]', 'Configure Cloudflare email DNS/authentication, add sender/routing contracts, then retry a real notice.', 'Shipped emails cannot honestly be sent from codex@bumpgrade.com until #10 is configured.', 60, unixepoch()),
  ('roadmap-better-auth', 'Publisher and admin authentication', 'pending', 9, 'feature-better-auth', 'Accounts', 'Better Auth accounts, sessions, protected routes, and role-aware access for future publisher/admin work.', '["Tracked by issue #9.", "Login route exists as a public scaffold."]', 'Wire Better Auth to Cloudflare-compatible storage and protect admin surfaces.', NULL, 70, unixepoch()),
  ('roadmap-stripe-commerce', 'Stripe payments and checkout architecture', 'pending', 11, 'feature-stripe-commerce', 'Payments', 'Stripe product/price mapping, checkout architecture, webhook idempotency, and billing-safe agent rules.', '["Tracked by issue #11."]', 'Copy only required Stripe values into safe secrets and document billing-impacting write boundaries.', NULL, 80, unixepoch()),
  ('roadmap-agent-contracts', 'Agent-ready docs, manifests, APIs, and MCP', 'pending', 12, 'feature-agent-ready-contracts', 'Developers and agents', 'Public agent docs, source evidence, manifests, server-side APIs, and future MCP resources.', '["Tracked by issue #12.", "llms.txt, /features/source-data, /roadmap/source-data, and /compare/source-data are live inputs."]', 'Publish the next agent-readable manifest and map read contracts to admin data.', NULL, 90, unixepoch()),
  ('roadmap-mobile-admin', 'Publisher admin apps for iOS and Android', 'pending', 13, 'feature-mobile-admin', 'Mobile', 'Mobile admin scaffolds for launch monitoring, approvals, work logs, and agent handoffs.', '["Tracked by issue #13."]', 'Design mobile contracts after web auth/admin data surfaces exist.', NULL, 100, unixepoch()),
  ('roadmap-funnels', 'Funnel and page builder MVP', 'pending', 14, 'feature-funnel-builder', 'Funnels and pages', 'Multi-step funnels, reusable blocks, templates, publishing, and safe draft proposals.', '["Tracked by issue #14."]', 'Define funnel/page schema and build the first editable funnel workflow.', NULL, 110, unixepoch()),
  ('roadmap-checkout-offers', 'Checkout, order bump, upsell, and downsell MVP', 'pending', 15, 'feature-checkout-offers', 'Checkout and offers', 'Stripe-backed checkout flows, order bumps, upsells, downsells, subscriptions, coupons, and audit trails.', '["Tracked by issue #15.", "Depends on Stripe architecture in #11."]', 'Ship the first safe checkout path with explicit billing audit records.', NULL, 120, unixepoch()),
  ('roadmap-products-access', 'Products, downloads, courses, memberships, and subscriptions', 'pending', 16, 'feature-products-access', 'Products and access', 'Digital product records, protected content, access rules, fulfillment state, and subscriptions.', '["Tracked by issue #16."]', 'Model product/access records around checkout and auth primitives.', NULL, 130, unixepoch()),
  ('roadmap-email-automation', 'Email marketing, list growth, CRM-lite, and automations', 'pending', 17, 'feature-email-automation-crm', 'Growth system', 'Subscribers, tags, forms, broadcasts, sequences, lifecycle automations, and lightweight CRM state.', '["Tracked by issue #17."]', 'Separate app customer email workflows from Codex project email in #10.', NULL, 140, unixepoch()),
  ('roadmap-analytics-testing', 'Analytics, A/B testing, and conversion tracking', 'pending', 18, 'feature-analytics-testing', 'Optimization', 'Funnel events, checkout metrics, attribution, experiments, and source-linked reporting.', '["Tracked by issue #18."]', 'Define event taxonomy before feature slices emit production analytics.', NULL, 150, unixepoch()),
  ('roadmap-affiliates-referrals', 'Affiliate and referral management', 'pending', 19, 'feature-affiliates-referrals', 'Growth system', 'Partner profiles, referral links, commission rules, attribution, payout review, and fraud checks.', '["Tracked by issue #19."]', 'Build after product, checkout, and analytics records exist.', NULL, 160, unixepoch()),
  ('roadmap-marketing-surfaces', 'Users, developers and agents, resources, pricing, and blog surfaces', 'pending', 20, 'feature-resources-use-cases-pricing', 'Marketing surfaces', 'Use-case pages, developer/agent pages, resource hub, pricing direction, migration guides, and product notes.', '["Tracked by issue #20.", "Navbar surfaces already exist as scaffolds."]', 'Replace scaffold routes with source-aware pages after roadmap/admin records are stable.', NULL, 170, unixepoch())
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

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES
  ('work-log-2026-05-18-cloudflare-foundation', 'Shipped Cloudflare app foundation', 'Codex', 'codex', 'bumpgrade-bootstrap', 'Mark asked to build entirely on Cloudflare and start from an agent-ready Bumpgrade repo.', '[{"number":4,"url":"https://github.com/markitics/bumpgrade/issues/4"}]', '[{"number":23,"url":"https://github.com/markitics/bumpgrade/pull/23"}]', '["https://bumpgrade.com/"]', '["https://bumpgrade.com/admin/roadmap"]', '[]', '["AGENTS.md","docs/agent/admin-surfaces.md"]', '["npm run verify","npm run cf:build","Cloudflare deploy and route smoke checks"]', NULL, 1779066000, 1779073200, '["https://bumpgrade.com/","https://bumpgrade.com/pr-screenshots/issue-4-home-desktop.png"]', NULL, unixepoch()),
  ('work-log-2026-05-18-comparison-hub', 'Shipped comparison hub and alternatives', 'Codex', 'codex', 'bumpgrade-bootstrap', 'Mark asked for ClickFunnels, Kit, Shopify, SamCart, and adjacent indiepreneur comparison pages.', '[{"number":5,"url":"https://github.com/markitics/bumpgrade/issues/5"}]', '[{"number":25,"url":"https://github.com/markitics/bumpgrade/pull/25"}]', '["https://bumpgrade.com/compare","https://bumpgrade.com/compare/source-data"]', '["https://bumpgrade.com/admin/roadmap"]', '[]', '[]', '["npm run verify","npm run cf:build","Live edge smoke checks for comparison routes"]', 'Competitor source pages must be refreshed before volatile pricing or packaging claims.', 1779073200, 1779077600, '["https://bumpgrade.com/compare","https://bumpgrade.com/compare/clickfunnels-alternative"]', NULL, unixepoch()),
  ('work-log-2026-05-18-feature-catalog', 'Shipped public feature catalog', 'Codex', 'codex', 'bumpgrade-bootstrap', 'Mark asked for /features even before functionality exists, with honest live and pending badges.', '[{"number":6,"url":"https://github.com/markitics/bumpgrade/issues/6"}]', '[{"number":26,"url":"https://github.com/markitics/bumpgrade/pull/26"}]', '["https://bumpgrade.com/features","https://bumpgrade.com/features/source-data"]', '["https://bumpgrade.com/admin/roadmap"]', '[]', '[]', '["npm run verify","npm run cf:build","Live edge smoke checks for /features and /features/source-data"]', NULL, 1779077600, 1779080600, '["https://bumpgrade.com/features","https://bumpgrade.com/pr-screenshots/issue-6-features-desktop.png"]', NULL, unixepoch()),
  ('work-log-2026-05-18-public-roadmap', 'Shipped public roadmap and source data', 'Codex', 'codex', 'bumpgrade-bootstrap', 'Mark asked for a roadmap inspired by the main features and for admin surfaces to stay current.', '[{"number":7,"url":"https://github.com/markitics/bumpgrade/issues/7"}]', '[{"number":27,"url":"https://github.com/markitics/bumpgrade/pull/27"}]', '["https://bumpgrade.com/roadmap","https://bumpgrade.com/roadmap/source-data"]', '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/admin/for-mark"]', '[]', '["public/llms.txt","src/app/agent-docs/bumpgrade-agent-surface/page.tsx"]', '["npm run verify","npm run cf:build","npm audit --omit=dev","Cloudflare Worker version 3d00e998-22b2-4750-ae9f-1402a98f40a9 smoke-tested"]', 'codex@bumpgrade.com shipped emails remain blocked by issue #10.', 1779080600, 1779083151, '["https://bumpgrade.com/roadmap","https://bumpgrade.com/admin/for-mark","https://bumpgrade.com/pr-screenshots/issue-7-roadmap-desktop.png"]', 'https://github.com/markitics/bumpgrade/pull/27#issuecomment-4476435044', unixepoch())
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
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

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES
  ('journey-compare-bumpgrade-to-clickfunnels', 'Compare Bumpgrade to ClickFunnels', 'feature-compare-source-data', 'live', '[5]', 'Indiepreneur evaluating funnel software', 'Decide whether Bumpgrade is the right future platform compared with established funnel tools.', '["compare:clickfunnels", "https://bumpgrade.com/compare/clickfunnels-alternative"]', '["Open /compare.", "Choose the ClickFunnels alternative page.", "Read Bumpgrade stance, competitor strengths, and planned parity gaps.", "Check /compare/source-data before citing volatile claims."]', '["Competitor pricing may change.", "Bumpgrade planned items are not live until feature evidence changes."]', 'Agents can read /compare/source-data and cite source IDs; agents must refresh volatile competitor facts before user-facing claims.', '["Playwright smoke tests cover /compare and every alternative page.", "Live edge checks returned 200 for comparison routes."]', 10, unixepoch()),
  ('journey-read-public-roadmap-source-data', 'Read public roadmap source data', 'feature-public-roadmap', 'live', '[7,8]', 'Future agent resuming Bumpgrade work', 'Recover shipped, active, blocked, next, and planned state without reading chat history.', '["https://bumpgrade.com/roadmap/source-data", "https://github.com/markitics/bumpgrade/pull/27"]', '["Fetch /roadmap/source-data.", "Find item IDs, statuses, issue links, evidence, and Mark-attention caveats.", "Use /admin/roadmap for owner-facing grouping.", "Continue the next issue without inventing state."]', '["D1 may be unavailable locally, so pages can show fixture fallback.", "Private admin notes must not leak into public roadmap JSON."]', 'Agents can read the public-safe source data; write/update paths must use approved D1 scripts or future confirmed APIs.', '["/roadmap/source-data live smoke returned 200 JSON.", "Playwright test asserts stable roadmap records."]', 20, unixepoch()),
  ('journey-mark-reviews-nonblocking-attention', 'Mark reviews non-blocking attention', 'feature-admin-state', 'live', '[8,10]', 'Mark as project owner', 'See important blockers and decisions while agents continue independent work.', '["https://bumpgrade.com/admin/for-mark", "https://github.com/markitics/bumpgrade/issues/10"]', '["Open /admin/for-mark.", "Review open blocked, review, and FYI items.", "Follow the issue or PR link for detail.", "Reply in the relevant issue/email once project email is configured."]', '["Email sending from codex@bumpgrade.com is blocked until #10.", "Auth protection is planned in #9, so current items must stay public-safe."]', 'Agents can add public-safe items with npm run for-mark:add; private or sensitive details must wait for authenticated surfaces.', '["Current page smoke-tested live after PR #27 deploy.", "Issue #10 records email blocker comments."]', 30, unixepoch()),
  ('journey-publisher-plans-funnel-launch', 'Publisher plans a funnel launch', 'feature-funnel-builder', 'pending', '[14,15,16,17,18]', 'Publisher or creator preparing an offer', 'Understand the future path from landing page to checkout, delivery, follow-up, and analytics.', '["https://bumpgrade.com/features", "https://bumpgrade.com/roadmap"]', '["Read the feature catalog.", "Open roadmap items for funnel builder, checkout, products, email automation, and analytics.", "Track which issue owns each capability before assuming it exists.", "Return after each shipped slice to verify the journey has live evidence."]', '["No actual funnel editor exists yet.", "Billing-impacting actions require explicit confirmation and audit records."]', 'Agents can read and summarize planned journeys; agents cannot publish funnels, mutate billing, or claim feature parity until confirmed-write contracts exist.', '["Feature catalog and roadmap tests cover pending records.", "This journey is represented in D1 shape for future expansion."]', 40, unixepoch())
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

INSERT INTO mark_attention_items (
  id, category, state, urgency, title, summary, details, required_action, response_instructions,
  session_name, session_email, source_agent, source_kind, links_json, metadata_json, last_activity_at, created_at, updated_at
) VALUES
  ('mark-attention-2026-05-18-codex-email-blocked', 'blocked', 'open', 'high', 'Configure codex@bumpgrade.com sending and reply monitoring', 'Shipped-feature emails cannot honestly be sent from codex@bumpgrade.com until Cloudflare Email Routing/sending is configured.', 'Issue #10 records the Cloudflare Email REST attempt and missing MX, SPF, and DKIM setup. Agents should keep shipping independent web/admin work and continue noting missed shipped emails on #10.', 'Configure Cloudflare email DNS/authentication and reply routing for codex@bumpgrade.com when ready.', 'Comment on issue #10 or reply once the project email path is configured. No action is needed to keep #8 moving.', 'bumpgrade-bootstrap', 'codex@bumpgrade.com', 'Codex', 'codex', '[{"label":"Issue #10","url":"https://github.com/markitics/bumpgrade/issues/10","kind":"issue"},{"label":"/admin/for-mark","url":"https://bumpgrade.com/admin/for-mark","kind":"roadmap"}]', '{"blocksShippedEmail":true}', 1779083151, 1779083151, unixepoch())
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  state=excluded.state,
  urgency=excluded.urgency,
  title=excluded.title,
  summary=excluded.summary,
  details=excluded.details,
  required_action=excluded.required_action,
  response_instructions=excluded.response_instructions,
  links_json=excluded.links_json,
  metadata_json=excluded.metadata_json,
  last_activity_at=excluded.last_activity_at,
  updated_at=excluded.updated_at;
