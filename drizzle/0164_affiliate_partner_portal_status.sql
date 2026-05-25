UPDATE admin_roadmap_items
SET
  public_evidence_json = json_array(
    'Tracked by issue #19.',
    'Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold.',
    'Issue #109 adds POST /api/affiliates/clicks with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.',
    'Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions.',
    'Issue #113 creates review-only commission ledger evidence from trusted checkout attribution without making commissions payable.',
    'Issue #115 adds owner-gated review, hold, and reversal actions without creating payout state.',
    'Issue #193 adds public-safe partner reports without exposing buyer, payout, tax, Stripe, raw click, raw checkout, or private actor data.',
    'Issue #424 adds public-safe partner portal status pages without private partner auth, buyer data, payout accounts, tax forms, Stripe payout IDs, provider secrets, message bodies, queue rows, raw rows, or direct public agent writes.',
    'Issue #195 adds read-only payout preparation without Stripe payouts, payout account storage, tax collection, partner notifications, payable commission finalization, or direct agent writes.',
    'Issue #273 adds owner-confirmed payout preparation records without payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger rows, fraud enforcement, or direct agent writes.',
    'Issue #275 adds owner-reviewed fraud review records without fraud enforcement, payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger/click/checkout rows, private fraud signals, or direct agent writes.',
    'Issue #277 adds owner-reviewed partner notification readiness records without partner sends, provider calls, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #279 adds owner-reviewed partner notification send preflight records without partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #281 adds owner-reviewed notification provider readiness records without provider configuration, provider secrets, sender credentials, partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #424 adds owner-confirmed fraud enforcement records without payable commission state, Stripe payouts, payout accounts, tax data, partner sends, provider calls, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #424 still tracks live payout execution, partner notifications, private payout/tax data, authenticated private partner portals, and direct agent-safe write parity as one pending post-MVP execution bucket.'
  ),
  next_milestone = 'Keep payable commissions, Stripe payout execution, partner notification sends, provider configuration, private payout/tax data, authenticated private partner portals, and agent-safe write tools in issue #424 instead of reopening isolated readiness-gate slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_roadmap_items
SET
  status = 'pending',
  summary = 'Pending post-MVP execution bucket for payable commission finalization, private payout account and tax boundaries, Stripe payouts/transfers/reversals/receipts/reconciliation, partner notification execution, provider configuration and sends, authenticated private partner portals, partner statements, buyer attribution finalization, and direct agent-safe affiliate/referral write APIs. Owner-confirmed fraud enforcement records and public-safe partner portal status pages are live as non-payout issue #424 slices.',
  public_evidence_json = json_array(
    'Issue #424 tracks this pending post-MVP execution bucket.',
    'Issue #424 adds public-safe partner portal status pages for aggregate partner report, payout-readiness, fraud, and notification status without private payout, tax, buyer, provider, or raw-row data.',
    'Issue #424 adds owner-confirmed fraud enforcement records with exact confirmation, idempotency, stale-state checks, D1 audit evidence, and redaction.',
    'Issue #19 remains the shipped affiliate/referral MVP for source data, partner links, privacy-safe clicks, checkout attribution, review-only commission evidence, owner review/reversal, public-safe partner reports, payout preparation, fraud review records, and partner notification readiness/preflight/provider-readiness proof.'
  ),
  next_milestone = 'Design and ship the remaining live affiliate execution workflow with payout safety, tax/private-data boundaries, authenticated private partner portals, partner notification execution, direct agent-safe writes, audit correlation, stale-state checks, redaction, refund-window checks, provider/payment safety, rollback, dispute paths, and confirmed-write checks.',
  updated_at = unixepoch()
WHERE id = 'roadmap-live-affiliate-execution';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal,
  source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json,
  sort_order, updated_at
) VALUES (
  'journey-partner-checks-affiliate-status-portal',
  'Partner checks affiliate status portal',
  'feature-affiliates-referrals',
  'live',
  '[19,193,195,273,275,277,279,281,424]',
  'Affiliate partner checking public-safe status before payouts exist',
  'Inspect referral link, aggregate performance, payout-readiness blockers, fraud status, and notification readiness without exposing buyer data, payout accounts, tax forms, Stripe identifiers, provider secrets, message bodies, queue rows, raw rows, or private fraud signals.',
  '["https://bumpgrade.com/affiliates/indie-launch-partners/partners/launch-circle","https://bumpgrade.com/affiliates/source-data","https://github.com/markitics/bumpgrade/issues/424","https://github.com/markitics/bumpgrade/issues/193","https://github.com/markitics/bumpgrade/issues/195"]',
  '["Open /affiliates/indie-launch-partners/partners/launch-circle.","Confirm the partner portal ID, referral link, report, commission evidence, payout readiness, fraud/review status, and notification readiness sections.","Use /affiliates/source-data.partnerPortalSummary to read the same public-safe portal route, stable IDs, aggregate totals, blocker counts, redaction flags, and non-live execution boundaries.","Follow the program overview or source-data links when a partner or agent needs broader context."]',
  '["The portal does not authenticate a partner or expose private partner rows.","The portal does not expose partner email, buyer data, raw click rows, raw checkout rows, raw ledger rows, private fraud signals, payout accounts, tax data, Stripe payout IDs, notification recipient emails, message bodies, send payloads, provider secrets, provider message IDs, or queue rows.","Payable commission state, Stripe transfers, payout receipts, payout account collection, tax collection, partner notification sends, provider configuration, provider calls, queue dispatch, and direct public agent writes remain grouped in issue #424."]',
  'Agents can read the partner portal page and /affiliates/source-data.partnerPortalSummary as public-safe status. Authenticated private partner access, payout execution, provider sends, and direct agent affiliate writes require future confirmed-write APIs and private auth boundaries.',
  '["Playwright covers the partner portal route, heading, source-data partnerPortalSummary, sitemap entry, agent manifest stable IDs, and redaction boundaries.","Issue #424 records this as a partner-facing status slice, not private partner auth or payout execution."]',
  54,
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
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-25-affiliate-partner-status-portal',
  'Added public-safe affiliate partner portal status',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Continue the Bumpgrade parity build while moving broad owner/customer workflows instead of isolated readiness shards.',
  '[{"number":424,"url":"https://github.com/markitics/bumpgrade/issues/424"},{"number":19,"url":"https://github.com/markitics/bumpgrade/issues/19"}]',
  '[]',
  '["feature-affiliates-referrals"]',
  '["roadmap-affiliates-referrals","roadmap-live-affiliate-execution"]',
  '["journey-partner-checks-affiliate-status-portal"]',
  '["docs/features/affiliate-referrals.md","docs/agent/agent-ready.md","public/llms.txt"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","Focused Playwright affiliate source-data, partner portal, sitemap, agent docs, admin source-data, and user-journey smoke tests"]',
  NULL,
  unixepoch() - 3600,
  unixepoch(),
  '["https://bumpgrade.com/affiliates/indie-launch-partners/partners/launch-circle","https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/admin/user-journeys","https://github.com/markitics/bumpgrade/issues/424"]',
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
