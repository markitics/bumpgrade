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
    'Issue #195 adds read-only payout preparation without Stripe payouts, payout account storage, tax collection, partner notifications, payable commission finalization, or direct agent writes.',
    'Issue #273 adds owner-confirmed payout preparation records without payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger rows, fraud enforcement, or direct agent writes.',
    'Issue #275 adds owner-reviewed fraud review records without fraud enforcement, payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger/click/checkout rows, private fraud signals, or direct agent writes.',
    'Issue #277 adds owner-reviewed partner notification readiness records without partner sends, provider calls, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #279 adds owner-reviewed partner notification send preflight records without partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #281 adds owner-reviewed notification provider readiness records without provider configuration, provider secrets, sender credentials, partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #424 adds owner-confirmed fraud enforcement records without payable commission state, Stripe payouts, payout accounts, tax data, partner sends, provider calls, buyer data, raw rows, private fraud signals, or direct agent writes.',
    'Issue #424 still tracks live payout execution, partner notifications, private payout/tax data, private partner portals, and direct agent-safe write parity as one pending post-MVP execution bucket.'
  ),
  next_milestone = 'Keep payable commissions, Stripe payout execution, partner notification sends, provider configuration, private payout/tax data, private partner portals, and agent-safe write tools in issue #424 instead of reopening more isolated readiness-gate slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_roadmap_items
SET
  status = 'pending',
  summary = 'Pending post-MVP execution bucket for payable commission finalization, private payout account and tax boundaries, Stripe payouts/transfers/reversals/receipts/reconciliation, partner notification execution, provider configuration and sends, private partner portals, partner statements, buyer attribution finalization, and direct agent-safe affiliate/referral write APIs. Owner-confirmed fraud enforcement records are live as a non-payout issue #424 slice.',
  public_evidence_json = json_array(
    'Issue #424 tracks this pending post-MVP execution bucket.',
    'Issue #424 now adds owner-confirmed fraud enforcement records with exact confirmation, idempotency, stale-state checks, D1 audit evidence, and redaction.',
    'Issue #19 remains the shipped affiliate/referral MVP for source data, partner links, privacy-safe clicks, checkout attribution, review-only commission evidence, owner review/reversal, public-safe partner reports, payout preparation, fraud review records, and partner notification readiness/preflight/provider-readiness proof.'
  ),
  next_milestone = 'Design and ship the remaining live affiliate execution workflow with payout safety, tax/private-data boundaries, partner notification execution, private portals, direct agent-safe writes, audit correlation, stale-state checks, redaction, refund-window checks, provider/payment safety, rollback, dispute paths, and confirmed-write checks.',
  updated_at = unixepoch()
WHERE id = 'roadmap-live-affiliate-execution';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113,115,193,195,273,275,277,279,281,424]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, read-only payout preparation, review-only ledger evidence, owner review/reversal state, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payout execution or partner sends exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/api/admin/affiliates/fraud-review-records","https://bumpgrade.com/api/admin/affiliates/fraud-enforcement-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/424"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, partner report IDs, payout preparation IDs, payout preparation record IDs, fraud review record IDs, fraud enforcement record IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, partner report contract, payout preparation contract, owner payout preparation record contract, owner fraud review record contract, owner fraud enforcement record contract, and write boundary.","Read fraudReviewRecords and fraudEnforcementRecords to inspect aggregate owner-reviewed fraud review and owner-confirmed fraud enforcement evidence without private fraud signals, buyer data, payout accounts, tax data, Stripe payout IDs, raw rows, or actor identity.","Open /admin/affiliates as a verified owner and record redacted fraud enforcement with the current program revision, payout batch status, fraud review status, review flag severity, linked ledger count, exact confirmation, and idempotency key.","Open /affiliates/indie-launch-partners to inspect the public preview."]',
  edge_cases_json = '["Public source-data exposes aggregate counts and redacted latest payout-preparation, fraud-review, and fraud-enforcement records only, not payout accounts, tax data, Stripe payout IDs, partner notification bodies, buyer data, raw ledger rows, raw click rows, raw checkout rows, private reasons, private fraud signals, or raw actor fields.","Unsupported payout preparation IDs, unsupported batch IDs, unsupported review flag IDs, unsupported dispositions, stale program revisions, stale payout batch statuses, stale fraud review record status, stale review flag evidence, missing confirmation text, and duplicate conflicting idempotency keys fail safely.","Agents must not call review-only commission evidence, partner report totals, read-only payout preparation, owner-confirmed payout records, owner-reviewed fraud review records, or owner-confirmed fraud enforcement records payable commission state, Stripe payout execution, partner notification delivery, or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, and owner-confirmed fraud enforcement records. Owner sessions can record fraud enforcement evidence through /api/admin/affiliates/fraud-enforcement-records. Payout execution, tax handling, payout accounts, partner notification sends, provider-send enablement, provider configuration, provider secrets, provider calls, send payload creation, queue dispatch, private partner portal access, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, private fraud review, notification send preflight checks, provider readiness checks, provider/payment safety, rollback/dispute paths, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, duplicate idempotency, stale-state validation, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, #111, #113, #115, #193, #195, #273, #275, #277, #279, #281, and #424 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, public-safe partner report contract, read-only payout preparation contract, owner-confirmed payout preparation records, owner-reviewed fraud review records, partner notification readiness/preflight/provider readiness records, and owner-confirmed fraud enforcement records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,113,115,193,195,273,275,277,279,281,424]',
  user_goal = 'Inspect read-only payout preparation rows, checklist blockers, partner-report links, owner-confirmed payout preparation records, owner-reviewed fraud review records, and owner-confirmed fraud enforcement records before any Stripe payout, tax, payout account, or partner notification execution exists.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/api/admin/affiliates/fraud-review-records","https://bumpgrade.com/api/admin/affiliates/fraud-enforcement-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/424"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find payoutPreparationContract, payoutPreparationSummary, payoutPreparationRecords, fraudReviewRecords, and fraudEnforcementRecords.","Inspect each payoutPreparationId, linked payoutBatchId, partnerReportIds, eligible ledger IDs, blocked ledger IDs, reversed ledger IDs, readiness checklist, fraud review flag, fraud review contract status, and public-safe aggregate totals.","Open /admin/affiliates as a verified owner and record redacted fraud enforcement evidence with exact confirmation, idempotency, current program revision, payout batch status, fraud review record status, review flag severity, and linked ledger count.","Treat the rows as evidence only; do not call them payable commission state, partner statements, Stripe payouts, partner notifications, or direct agent write parity."]',
  edge_cases_json = '["Refund-window, owner-hold, and self-referral evidence keep payout execution blocked until future private review contracts exist.","Public preparation rows, owner-confirmed payout records, owner-reviewed fraud records, and owner-confirmed fraud enforcement records never expose buyer data, raw ledger rows, raw click rows, raw checkout rows, raw actor identity, private fraud signals, partner payout accounts, tax forms, Stripe payout identifiers, or partner notification payloads.","Stripe payouts, transfer creation, private partner portals, payout account storage, tax collection, payable commission finalization, partner notification sends, and direct agent writes require future confirmed-write APIs."]',
  agent_access = 'Agents can read public-safe payout preparation, fraud review, and fraud enforcement evidence from /affiliates/source-data and cite payoutPreparationId, payoutPreparationRecordId, reviewFlagId, fraudReviewRecordId, and fraudEnforcementRecordId values. Owner sessions can record fraud enforcement evidence through /api/admin/affiliates/fraud-enforcement-records. Payout execution, tax handling, payout accounts, partner sends, private portals, and direct agent affiliate writes require future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers payoutPreparationContract, payoutPreparationSummary, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, preview rendering, admin journey exposure, agent manifest stable IDs, and redaction boundaries.","Issues #195, #273, #275, and #424 record the read-only payout preparation slice, owner-confirmed payout preparation records, owner-reviewed fraud review records, and owner-confirmed fraud enforcement records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-prepares-affiliate-payout-batch';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal,
  source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json,
  sort_order, updated_at
) VALUES (
  'journey-owner-records-affiliate-fraud-enforcement',
  'Owner records affiliate fraud enforcement evidence',
  'feature-affiliates-referrals',
  'live',
  '[19,113,115,193,195,273,275,424]',
  'Owner enforcing affiliate fraud review before payout execution exists',
  'Record a redacted affiliate fraud enforcement decision for a seeded review flag without creating payable commission state, Stripe payouts, partner notifications, payout accounts, tax data, buyer data, raw rows, or direct public agent writes.',
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/api/admin/affiliates/fraud-enforcement-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/424"]',
  '["Fetch /affiliates/source-data and inspect fraudEnforcementRecords.currentEvidence.","Open /admin/affiliates as a verified owner.","Record a fraud enforcement disposition with exact confirmation, idempotency key, current program revision, payout batch status, fraud review record status, review flag severity, and linked ledger count.","Replay the idempotency key and confirm the same redacted record is returned.","Read /affiliates/source-data again and confirm aggregate fraud enforcement counts and latest redacted metadata update."]',
  '["Signed-out requests are rejected.","Missing confirmation, unsupported review flags, unsupported dispositions, unsupported payout preparation IDs, unsupported payout batch IDs, stale program revisions, stale payout batch statuses, stale fraud review contract status, stale review flag evidence, and conflicting idempotency keys fail safely.","The record does not create payable commission state, trigger Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, expose actor identity, or expose private fraud signals."]',
  'Agents can read the public-safe fraud enforcement contract and aggregate evidence, but only owner sessions can create fraud enforcement records. Direct public agent writes, payable commission mutation, payout execution, tax handling, partner notification, private portal access, and private fraud signal exposure require future confirmed-write APIs.',
  '["Playwright covers unauthenticated rejection, owner contract read, exact confirmation, idempotency replay/conflict, stale-state rejection, unsupported review flags and dispositions, public source-data redaction, and admin UI rendering for fraud enforcement records.","Issue #424 records the owner-confirmed affiliate fraud enforcement evidence slice."]',
  61,
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

UPDATE admin_user_journeys
SET sort_order = 62, updated_at = unixepoch()
WHERE id = 'journey-owner-prepares-affiliate-partner-notification-readiness';

UPDATE admin_user_journeys
SET sort_order = 63, updated_at = unixepoch()
WHERE id = 'journey-owner-prepares-affiliate-partner-notification-send-preflight';

UPDATE admin_user_journeys
SET sort_order = 64, updated_at = unixepoch()
WHERE id = 'journey-owner-prepares-affiliate-partner-notification-provider-readiness';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-affiliate-fraud-enforcement-records',
  'Added owner-confirmed affiliate fraud enforcement records',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Continue the Bumpgrade parity build while keeping issue #424 broad enough to avoid more tiny disconnected readiness-gate ships.',
  '[{"number":424,"url":"https://github.com/markitics/bumpgrade/issues/424"},{"number":19,"url":"https://github.com/markitics/bumpgrade/issues/19"}]',
  '[]',
  '["feature-affiliates-referrals"]',
  '["roadmap-affiliates-referrals","roadmap-live-affiliate-execution"]',
  '["journey-publisher-previews-affiliate-referrals","journey-publisher-prepares-affiliate-payout-batch","journey-owner-records-affiliate-fraud-enforcement"]',
  '["docs/features/affiliate-referrals.md","docs/agent/agent-ready.md","public/llms.txt"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","Focused Playwright affiliate fraud enforcement records, source-data, admin affiliates, agent docs, admin source-data, and user-journey smoke tests"]',
  NULL,
  unixepoch() - 3600,
  unixepoch(),
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/api/admin/affiliates/fraud-enforcement-records","https://bumpgrade.com/admin/affiliates","https://bumpgrade.com/features","https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/admin/user-journeys","https://github.com/markitics/bumpgrade/issues/424"]',
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
