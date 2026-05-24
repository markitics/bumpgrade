UPDATE admin_roadmap_items
SET
  status = 'live',
  public_evidence_json = json_array(
    'Tracked by issue #19.',
    'Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold.',
    'Issue #109 adds POST /api/affiliates/clicks with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.',
    'Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions.',
    'Issue #113 creates review-only commission ledger evidence from trusted checkout attribution without making commissions payable.',
    'Issue #115 adds owner-gated review, hold, and reversal actions without creating payout state.',
    'Issue #193 adds public-safe partner reports without exposing buyer, payout, tax, Stripe, raw click, raw checkout, or private actor data.',
    'Issue #195 adds read-only payout preparation without Stripe payouts, payout account storage, tax collection, partner notifications, payable commission finalization, or direct agent writes.',
    'Issue #273 adds owner-confirmed payout preparation records without payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger rows, fraud enforcement, or direct agent writes.',
    'Issue #275 adds owner-reviewed fraud review records without fraud enforcement, payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger/click/checkout rows, private fraud signals, or direct agent writes.',
    'Issue #277 adds owner-reviewed partner notification readiness records without partner sends, provider calls, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #279 adds owner-reviewed partner notification send preflight records without partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #281 adds owner-reviewed notification provider readiness records without provider configuration, provider secrets, sender credentials, partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #424 tracks live payout execution, partner notifications, fraud enforcement, private payout/tax data, private partner portals, and direct agent-safe write parity as one pending post-MVP execution bucket.'
  ),
  next_milestone = 'Keep payable commissions, Stripe payout execution, partner notification sends, provider configuration, private payout/tax data, fraud enforcement, private partner portals, and agent-safe write tools in issue #424 instead of reopening more isolated readiness-gate slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-live-affiliate-execution',
  'Live affiliate payout execution, partner notifications, fraud enforcement, and agent-safe writes',
  'pending',
  424,
  'feature-affiliates-referrals',
  'Growth system',
  'Pending post-MVP execution bucket for payable commission finalization, private payout account and tax boundaries, Stripe payouts/transfers/reversals/receipts/reconciliation, partner notification execution, provider configuration and sends, fraud enforcement, private partner portals, partner statements, buyer attribution finalization, and direct agent-safe affiliate/referral write APIs.',
  json_array(
    'Issue #424 tracks this pending post-MVP execution bucket.',
    'Issue #19 remains the shipped affiliate/referral MVP for source data, partner links, privacy-safe clicks, checkout attribution, review-only commission evidence, owner review/reversal, public-safe partner reports, payout preparation, fraud review records, and partner notification readiness/preflight/provider-readiness proof.',
    'The issue #19 closeout deliberately stops creating more single-gate proof slices unless they directly unlock live payout, notification, fraud, private portal, or agent-write execution.'
  ),
  'Design and ship live affiliate execution as one coherent workflow with payout safety, tax/private-data boundaries, idempotency, audit correlation, stale-state checks, redaction, refund-window checks, provider/payment safety, fraud-review safety, rollback/dispute paths, and confirmed-write checks.',
  NULL,
  165,
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
  feature_status = 'live',
  updated_at = unixepoch()
WHERE feature_id = 'feature-affiliates-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113,115,193,195,273,275,277,279,281,424]',
  source_evidence_json = CASE
    WHEN instr(source_evidence_json, 'issues/424') > 0 THEN source_evidence_json
    ELSE json_insert(source_evidence_json, '$[#]', 'https://github.com/markitics/bumpgrade/issues/424')
  END,
  validation_json = CASE
    WHEN instr(validation_json, 'Issue #424') > 0 THEN validation_json
    ELSE json_insert(validation_json, '$[#]', 'Issue #424 tracks live affiliate payout execution, partner notifications, fraud enforcement, and agent-safe write parity after the issue #19 MVP closeout.')
  END,
  agent_access = CASE
    WHEN instr(agent_access, 'Issue #424') > 0 THEN agent_access
    ELSE agent_access || ' Issue #424 owns payout execution, fraud enforcement, tax, partner notification sends, provider-send enablement, provider configuration, provider secrets, provider calls, send payload creation, queue dispatch, private partner portals, payout account storage, buyer attribution finalization, and direct agent affiliate writes behind future confirmed-write APIs.'
  END,
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-affiliate-mvp-live-closeout',
  'Moved Affiliate/referral MVP to live and grouped execution work',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark said the project felt noisy and wanted Director-level nesting; this closes out the satisfied affiliate/referral MVP parent and leaves one broad pending payout/notification/fraud/agent-write execution bucket instead of more niche readiness-gate ships.',
  '[{"number":19,"url":"https://github.com/markitics/bumpgrade/issues/19"},{"number":424,"url":"https://github.com/markitics/bumpgrade/issues/424"}]',
  '[]',
  '["feature-affiliates-referrals"]',
  '["roadmap-affiliates-referrals active -> live","roadmap-live-affiliate-execution pending"]',
  '["journey-publisher-previews-affiliate-referrals launch-preview -> live","all feature-affiliates-referrals journeys launch-preview -> live"]',
  '["docs/features/affiliate-referrals.md","docs/agent/agent-ready.md","public/llms.txt"]',
  '["git diff --check","npm run db:migrate:local","npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run cf:build","focused Playwright source-data checks"]',
  NULL,
  unixepoch() - 3600,
  unixepoch(),
  '["https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/424","https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/features/source-data","https://bumpgrade.com/roadmap/source-data","https://bumpgrade.com/admin/roadmap/source-data","https://bumpgrade.com/admin/director/source-data","https://bumpgrade.com/admin/user-journeys/source-data"]',
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
