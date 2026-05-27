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
    'Issue #424 adds public-safe partner portal status pages and statement snapshots without private partner auth, payable statements, buyer data, payout accounts, tax forms, Stripe payout IDs, provider secrets, message bodies, queue rows, raw rows, or direct public agent writes.',
    'Issue #195 adds read-only payout preparation without Stripe payouts, payout account storage, tax collection, partner notifications, payable commission finalization, or direct agent writes.',
    'Issue #273 adds owner-confirmed payout preparation records without payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger rows, fraud enforcement, or direct agent writes.',
    'Issue #275 adds owner-reviewed fraud review records without fraud enforcement, payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger/click/checkout rows, private fraud signals, or direct agent writes.',
    'Issue #277 adds owner-reviewed partner notification readiness records without partner sends, provider calls, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #279 adds owner-reviewed partner notification send preflight records without partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #281 adds owner-reviewed notification provider readiness records without provider configuration, provider secrets, sender credentials, partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #424 adds owner-confirmed fraud enforcement records without payable commission state, Stripe payouts, payout accounts, tax data, partner sends, provider calls, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #424 still tracks live payout execution, partner notifications, private payout/tax data, authenticated private partner portals, payable statement creation, and direct agent-safe write parity as one pending post-MVP execution bucket.'
  ),
  next_milestone = 'Keep payable statements, payable commissions, Stripe payout execution, partner notification sends, provider configuration, private payout/tax data, authenticated private partner portals, and agent-safe write tools in issue #424 instead of reopening isolated readiness-gate slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_roadmap_items
SET
  status = 'pending',
  summary = 'Pending post-MVP execution bucket for payable commission finalization, private payout account and tax boundaries, Stripe payouts/transfers/reversals/receipts/reconciliation, payable statement creation, partner notification execution, provider configuration and sends, authenticated private partner portals, buyer attribution finalization, and direct agent-safe affiliate/referral write APIs. Owner-confirmed fraud enforcement records, public-safe partner portal status pages, and public-safe partner statement snapshots are live as non-payout issue #424 slices.',
  public_evidence_json = json_array(
    'Issue #424 tracks this pending post-MVP execution bucket.',
    'Issue #424 adds public-safe partner portal status pages for aggregate partner report, payout-readiness, fraud, and notification status without private payout, tax, buyer, provider, or raw-row data.',
    'Issue #424 adds public-safe partner statement snapshots for review-only partner totals, payout-preparation blockers, fraud status, notification readiness status, and redaction flags without payable statement creation.',
    'Issue #424 adds owner-confirmed fraud enforcement records with exact confirmation, idempotency, stale-state checks, D1 audit evidence, and redaction.',
    'Issue #19 remains the shipped affiliate/referral MVP for source data, partner links, privacy-safe clicks, checkout attribution, review-only commission evidence, owner review/reversal, public-safe partner reports, payout preparation, fraud review records, and partner notification readiness/preflight/provider-readiness proof.'
  ),
  next_milestone = 'Design and ship the remaining live affiliate execution workflow with payable statement creation, payout safety, tax/private-data boundaries, authenticated private partner portals, partner notification execution, direct agent-safe writes, audit correlation, stale-state checks, redaction, refund-window checks, provider/payment safety, rollback, dispute paths, and confirmed-write checks.',
  updated_at = unixepoch()
WHERE id = 'roadmap-live-affiliate-execution';

UPDATE admin_user_journeys
SET
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, public-safe partner statement snapshots, read-only payout preparation, review-only ledger evidence, owner review/reversal state, payout review states, fraud flags, partner notification readiness evidence, send preflight evidence, provider readiness evidence, aggregate click counts, and checkout attribution evidence before payouts exist.',
  happy_path_json = json_array(
    'Fetch /affiliates/source-data.',
    'Find the seeded affiliate program, revision ID, partner IDs, partner report IDs, partner statement snapshot IDs, payout preparation IDs, payout preparation record IDs, fraud review record IDs, fraud enforcement record IDs, partner notification readiness record IDs, partner notification send preflight record IDs, partner notification provider readiness record IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, partner report contract, partner statement snapshot contract, payout preparation contract, owner payout preparation record contract, owner fraud review record contract, owner fraud enforcement record contract, owner notification readiness record contract, owner notification send preflight record contract, owner notification provider readiness record contract, and write boundary.',
    'Read partnerReportSummary to compare aggregate click, attributed checkout, review-only ledger, review action, and commission evidence totals by partner without exposing raw rows.',
    'Read partnerStatementSnapshotSummary to inspect statement windows, review-only totals, eligible/blocked/reversed fixture counts, payout-preparation status, fraud status, and notification readiness status without treating the snapshot as payable.',
    'Read payoutPreparationSummary to inspect eligible, blocked, and reversed fixture ledgers plus readiness checklist items without treating them as payable.',
    'Read fraudReviewRecords, fraudEnforcementRecords, partnerNotificationReadinessRecords, partnerNotificationSendPreflightRecords, and partnerNotificationProviderReadinessRecords to inspect aggregate owner-reviewed fraud review, owner-confirmed fraud enforcement, partner notification readiness, send preflight, and provider readiness evidence without private fraud signals, recipient data, message bodies, send payloads, provider configuration, provider secrets, sender credentials, provider IDs, queue rows, or raw rows.',
    'Open /affiliates/indie-launch-partners and the seeded partner portal to inspect the public preview.'
  ),
  edge_cases_json = json_array(
    'Public source-data exposes aggregate click, checkout attribution, commission ledger, owner action, partner report, statement snapshot, payout preparation, payout preparation record, fraud review record, fraud enforcement record, notification readiness record, notification send preflight record, and notification provider readiness record counts only, not raw click, checkout, buyer, actor, recipient, message, send payload, provider configuration, provider secret, sender credential, provider, queue, reason, private fraud signal, tax, payout, partner notification, or Stripe rows.',
    'Unsupported referral link IDs, codes, destination routes, referral click IDs, checkout intent IDs, commission ledger IDs, action kinds, stale expected updatedAt values, and missing idempotency keys return public-safe validation errors.',
    'Cookie assignment, buyer attribution finalization, payable statement creation, payable commission writes, payout accounts, tax forms, Stripe payouts, private partner portals, partner notifications, provider execution, and direct agent writes remain grouped in issue #424 and require future confirmed-write APIs.',
    'Agents must not call review-only commission evidence, partner report totals, statement snapshots, payout preparation rows, payout preparation records, fraud review records, fraud enforcement records, notification readiness records, notification send preflight records, or notification provider readiness records payable, send-ready partner statements, payout-ready state, provider-send configuration, provider secret storage, or published affiliate terms.'
  ),
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, public-safe partner reports, public-safe partner statement snapshots, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, and owner-reviewed notification provider readiness records. Issue #424 owns payout execution, tax, partner notification sends, provider-send enablement, provider configuration, provider secret storage, provider calls, send payload creation, queue dispatch, private partner portal access, partner payout account storage, payable statement creation, buyer attribution finalization, and direct agent affiliate writes behind future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, private fraud review, notification send preflight checks, provider readiness checks, provider/payment safety, rollback/dispute paths, and private payout data boundaries.',
  validation_json = json_array(
    'Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, public-safe partner statement snapshots, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, owner-reviewed notification provider readiness records, duplicate idempotency, stale-state validation, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.',
    'Issues #89, #109, #111, #113, #115, #193, #195, #273, #275, #277, #279, #281, and #424 record the affiliate/referral source-data foundation, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, public-safe partner report contract, read-only payout preparation contract, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, owner-reviewed notification provider readiness records, and public-safe partner statement snapshots.',
    'Issue #424 tracks live affiliate payout execution, partner notifications, private partner portals, payable statements, and agent-safe write parity after the issue #19 MVP closeout.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

UPDATE admin_user_journeys
SET
  user_goal = 'Inspect referral link, aggregate performance, review-only statement snapshot, payout-readiness blockers, fraud status, and notification readiness without exposing buyer data, payout accounts, tax forms, Stripe identifiers, provider secrets, message bodies, queue rows, raw rows, or private fraud signals.',
  happy_path_json = json_array(
    'Open /affiliates/indie-launch-partners/partners/launch-circle.',
    'Confirm the partner portal ID, referral link, report, statement snapshot, commission evidence, payout readiness, fraud/review status, and notification readiness sections.',
    'Use /affiliates/source-data.partnerPortalSummary and partnerStatementSnapshotSummary to read the same public-safe portal route, stable IDs, aggregate totals, blocker counts, redaction flags, and non-live execution boundaries.',
    'Follow the program overview or source-data links when a partner or agent needs broader context.'
  ),
  edge_cases_json = json_array(
    'The portal does not authenticate a partner or expose private partner rows.',
    'The portal does not expose partner email, buyer data, raw click rows, raw checkout rows, raw ledger rows, private fraud signals, payout accounts, tax data, Stripe payout IDs, notification recipient emails, message bodies, send payloads, provider secrets, provider message IDs, or queue rows.',
    'Payable statement creation, payable commission state, Stripe transfers, payout receipts, payout account collection, tax collection, partner notification sends, provider configuration, provider calls, queue dispatch, and direct public agent writes remain grouped in issue #424.'
  ),
  agent_access = 'Agents can read the partner portal page plus /affiliates/source-data.partnerPortalSummary and partnerStatementSnapshotSummary as public-safe status. Authenticated private partner access, payable statements, payout execution, provider sends, and direct agent affiliate writes require future confirmed-write APIs and private auth boundaries.',
  validation_json = json_array(
    'Playwright covers the partner portal route, heading, source-data partnerPortalSummary and partnerStatementSnapshotSummary, sitemap entry, agent manifest stable IDs, and redaction boundaries.',
    'Issue #424 records this as a partner-facing status slice, not private partner auth, payable statement creation, or payout execution.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-partner-checks-affiliate-status-portal';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-26-affiliate-partner-statement-snapshots',
  'Added public-safe affiliate partner statement snapshots',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Continue the Bumpgrade build with owner-visible and partner-visible workflows instead of narrow readiness-only ships.',
  json_array(json_object('number', 424, 'url', 'https://github.com/markitics/bumpgrade/issues/424')),
  json_array(),
  json_array('feature-affiliates-referrals'),
  json_array('roadmap-affiliates-referrals', 'roadmap-live-affiliate-execution'),
  json_array('journey-publisher-previews-affiliate-referrals', 'journey-partner-checks-affiliate-status-portal'),
  json_array('docs/features/affiliate-referrals.md', 'docs/features/payments.md', 'docs/agent/agent-ready.md', 'public/llms.txt'),
  json_array('Affiliate source-data now exposes partnerStatementSnapshotContract and partnerStatementSnapshotSummary.', 'The seeded partner portal renders review-only statement snapshot totals before payable statement or payout execution exists.', 'Focused Playwright covers source-data, partner portal copy, agent manifest stable IDs, and redaction boundaries.'),
  'No Mark action required. Statement snapshots are public-safe review evidence only; payable statements, Stripe payouts, payout/tax data, partner notification sends, private partner auth, and direct affiliate agent writes remain in issue #424.',
  unixepoch() - 1800,
  unixepoch(),
  json_array('https://bumpgrade.com/affiliates/source-data', 'https://bumpgrade.com/affiliates/indie-launch-partners/partners/launch-circle', 'https://bumpgrade.com/admin/roadmap/source-data', 'https://bumpgrade.com/admin/user-journeys/source-data', 'https://bumpgrade.com/admin/work-log/source-data', 'https://bumpgrade.com/pr-screenshots/issue-424-partner-statement-snapshots.png', 'https://github.com/markitics/bumpgrade/issues/424'),
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
  pr_comment_url=COALESCE(admin_work_log_entries.pr_comment_url, excluded.pr_comment_url),
  updated_at=unixepoch();
