CREATE TABLE IF NOT EXISTS affiliate_fraud_review_records (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  review_flag_id TEXT NOT NULL,
  payout_preparation_id TEXT NOT NULL,
  payout_batch_id TEXT NOT NULL,
  record_kind TEXT NOT NULL,
  review_disposition TEXT NOT NULL,
  expected_program_revision_id TEXT NOT NULL,
  expected_payout_batch_status TEXT NOT NULL,
  expected_flag_severity TEXT NOT NULL,
  expected_linked_ledger_count INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  owner_fraud_review_record_created INTEGER NOT NULL DEFAULT 0,
  fraud_decision_enforced INTEGER NOT NULL DEFAULT 0,
  payable_commission_created INTEGER NOT NULL DEFAULT 0,
  stripe_payout_created INTEGER NOT NULL DEFAULT 0,
  stripe_transfer_created INTEGER NOT NULL DEFAULT 0,
  payout_account_stored INTEGER NOT NULL DEFAULT 0,
  tax_data_collected INTEGER NOT NULL DEFAULT 0,
  partner_notification_sent INTEGER NOT NULL DEFAULT 0,
  buyer_data_included INTEGER NOT NULL DEFAULT 0,
  raw_ledger_rows_exposed INTEGER NOT NULL DEFAULT 0,
  raw_click_rows_exposed INTEGER NOT NULL DEFAULT 0,
  raw_checkout_rows_exposed INTEGER NOT NULL DEFAULT 0,
  raw_actor_identity_included INTEGER NOT NULL DEFAULT 0,
  private_fraud_signals_included INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_fraud_review_records_idempotency_unique
  ON affiliate_fraud_review_records(idempotency_key);
CREATE INDEX IF NOT EXISTS affiliate_fraud_review_records_program_time_idx
  ON affiliate_fraud_review_records(program_id, created_at);
CREATE INDEX IF NOT EXISTS affiliate_fraud_review_records_flag_time_idx
  ON affiliate_fraud_review_records(review_flag_id, created_at);
CREATE INDEX IF NOT EXISTS affiliate_fraud_review_records_preparation_batch_idx
  ON affiliate_fraud_review_records(payout_preparation_id, payout_batch_id, created_at);

UPDATE admin_roadmap_items
SET
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    json_object(
      'label', 'Issue #275 owner-reviewed affiliate fraud review records',
      'url', 'https://github.com/markitics/bumpgrade/issues/275'
    )
  ),
  summary = 'Affiliate and referral evidence now includes partner links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger rows, owner review/reversal actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, and owner-reviewed fraud review records before payable commissions or Stripe payouts exist.',
  next_milestone = 'Add private payout account, tax, partner notification, and eventual fraud-enforcement contracts only after owner-reviewed fraud review records stay redacted and non-payable.',
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113,115,193,195,273,275]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, read-only payout preparation, review-only ledger evidence, owner review/reversal state, owner-confirmed payout preparation records, owner-reviewed fraud review records, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/api/admin/affiliates/fraud-review-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115","https://github.com/markitics/bumpgrade/issues/193","https://github.com/markitics/bumpgrade/issues/195","https://github.com/markitics/bumpgrade/issues/273","https://github.com/markitics/bumpgrade/issues/275"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, partner report IDs, payout preparation IDs, payout preparation record IDs, fraud review record IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, partner report contract, payout preparation contract, owner payout preparation record contract, owner fraud review record contract, and write boundary.","Read fraudReviewRecords to inspect aggregate owner-reviewed fraud review evidence without private fraud signals or raw rows.","Open /admin/affiliates as a verified owner and record redacted fraud review evidence with the current program revision, payout batch status, review flag severity, linked ledger count, exact confirmation, and idempotency key.","Open /affiliates/indie-launch-partners to inspect the public preview."]',
  edge_cases_json = '["Public source-data exposes aggregate counts and redacted latest payout-preparation and fraud-review records only, not payout accounts, tax data, Stripe payout IDs, partner notification bodies, buyer data, raw ledger rows, raw click rows, raw checkout rows, private reasons, private fraud signals, or raw actor fields.","Unsupported payout preparation IDs, unsupported batch IDs, unsupported review flag IDs, unsupported dispositions, stale program revisions, stale payout batch statuses, stale review flag evidence, missing confirmation text, and duplicate conflicting idempotency keys fail safely.","Agents must not call review-only commission evidence, partner report totals, read-only payout preparation, owner-confirmed payout preparation records, or owner-reviewed fraud review records payable, fraud enforcement, or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, and owner-reviewed fraud review records. Owner sessions can record payout preparation records through /api/admin/affiliates/payout-preparation-records and fraud review evidence through /api/admin/affiliates/fraud-review-records. Payout execution, fraud enforcement, tax handling, payout accounts, partner notifications, private partner portal access, partner payout account storage, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, private fraud review, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, duplicate idempotency, stale-state validation, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, #111, #113, #115, #193, #195, #273, and #275 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, public-safe partner report contract, read-only payout preparation contract, owner-confirmed payout preparation records, and owner-reviewed fraud review records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,113,115,193,195,273,275]',
  user_goal = 'Inspect read-only payout preparation rows, checklist blockers, partner-report links, owner-confirmed payout preparation records, and owner-reviewed fraud review records before any Stripe payout, tax, payout account, partner notification, or fraud enforcement capability exists.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/api/admin/affiliates/fraud-review-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115","https://github.com/markitics/bumpgrade/issues/193","https://github.com/markitics/bumpgrade/issues/195","https://github.com/markitics/bumpgrade/issues/273","https://github.com/markitics/bumpgrade/issues/275"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find payoutPreparationContract, payoutPreparationSummary, payoutPreparationRecords, and fraudReviewRecords.","Inspect each payoutPreparationId, linked payoutBatchId, partnerReportIds, eligible ledger IDs, blocked ledger IDs, reversed ledger IDs, readiness checklist, fraud review flag, and public-safe aggregate totals.","Open /admin/affiliates as a verified owner and record redacted payout preparation evidence with exact confirmation, idempotency, current program revision, payout batch status, ledger counts, and total commission cents.","Record redacted fraud review evidence with exact confirmation, idempotency, current program revision, payout batch status, review flag severity, and linked ledger count.","Treat the preparation and fraud review rows as evidence only; do not call them payable commission state, partner statements, or fraud enforcement."]',
  edge_cases_json = '["Refund-window, owner-hold, and self-referral evidence keep preparation blocked until future private review contracts exist.","Public preparation rows, owner-confirmed payout records, and owner-reviewed fraud records never expose buyer data, raw ledger rows, raw click rows, raw checkout rows, raw actor identity, private fraud signals, partner payout accounts, tax forms, Stripe payout identifiers, or partner notification payloads.","Stripe payouts, transfer creation, private partner portals, payout account storage, tax collection, fraud enforcement, payable commission finalization, and direct agent writes require future confirmed-write APIs."]',
  agent_access = 'Agents can read public-safe payout preparation and fraud review evidence from /affiliates/source-data and cite payoutPreparationId, payoutPreparationRecordId, reviewFlagId, and fraudReviewRecordId values. Owner sessions can record payout preparation evidence through /api/admin/affiliates/payout-preparation-records and fraud review evidence through /api/admin/affiliates/fraud-review-records. Payout execution, tax handling, payout accounts, partner notifications, fraud enforcement, and direct agent affiliate writes require future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers payoutPreparationContract, payoutPreparationSummary, owner-confirmed payout preparation records, owner-reviewed fraud review records, preview rendering, admin journey exposure, agent manifest stable IDs, and redaction boundaries.","Issues #195, #273, and #275 record the read-only payout preparation slice, owner-confirmed payout preparation records, and owner-reviewed fraud review records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-prepares-affiliate-payout-batch';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal,
  source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json,
  sort_order, updated_at
) VALUES (
  'journey-owner-reviews-affiliate-fraud-flag',
  'Owner records affiliate fraud review evidence',
  'feature-affiliates-referrals',
  'pending',
  '[19,113,115,193,195,273,275]',
  'Owner reviewing affiliate fraud evidence before payout exists',
  'Record redacted fraud review evidence for a seeded affiliate review flag without enforcing a fraud decision or creating payout state.',
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/api/admin/affiliates/fraud-review-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/275"]',
  '["Fetch /affiliates/source-data and inspect fraudReviewRecords.currentEvidence.","Open /admin/affiliates as a verified owner.","Record a fraud review disposition with exact confirmation, idempotency key, current program revision, payout batch status, review flag severity, and linked ledger count.","Replay the idempotency key and confirm the same redacted record is returned.","Read /affiliates/source-data again and confirm aggregate fraud review counts and latest redacted metadata update."]',
  '["Signed-out requests are rejected.","Missing confirmation, unsupported review flags, unsupported dispositions, unsupported payout preparation IDs, unsupported payout batch IDs, stale program revisions, stale payout batch statuses, stale review flag evidence, and conflicting idempotency keys fail safely.","The record does not enforce fraud decisions, create payable commission state, trigger Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, expose actor identity, or expose private fraud signals."]',
  'Agents can read the public-safe fraud review contract and aggregate evidence, but only owner sessions can create fraud review records. Direct public agent writes, fraud enforcement, payable commission mutation, payout execution, tax handling, partner notification, and private fraud signal exposure require future confirmed-write APIs.',
  '["Playwright covers unauthenticated rejection, owner contract read, exact confirmation, idempotency replay/conflict, stale-state rejection, unsupported review flags and dispositions, public source-data redaction, and admin UI rendering for fraud review records.","Issue #275 records the owner-reviewed affiliate fraud review evidence slice."]',
  60,
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
  'work-log-2026-05-21-affiliate-fraud-review-records',
  'Added owner-reviewed affiliate fraud review records',
  'Codex',
  'codex',
  'bumpgrade-bootstrap',
  'Continue the Bumpgrade parity build and add owner-reviewed affiliate fraud review evidence for agents.',
  '[{"number":275,"url":"https://github.com/markitics/bumpgrade/issues/275"},{"number":19,"url":"https://github.com/markitics/bumpgrade/issues/19"}]',
  '[{"number":276,"url":"https://github.com/markitics/bumpgrade/pull/276"}]',
  '["https://bumpgrade.com/features","https://bumpgrade.com/affiliates/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["src/lib/affiliate-fraud-review-records.ts","src/app/api/admin/affiliates/fraud-review-records/route.ts","src/app/admin/affiliates/page.tsx","src/app/affiliates/source-data/route.ts","src/lib/agent-manifest.ts","docs/features/affiliate-referrals.md","drizzle/0103_affiliate_fraud_review_records.sql"]',
  '["npm run lint","npm run typecheck","npm run cf:build","Focused affiliate fraud review records, source-data, admin affiliates, agent docs, admin source-data, and user-journey smoke tests"]',
  NULL,
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/api/admin/affiliates/fraud-review-records","https://bumpgrade.com/admin/affiliates","https://bumpgrade.com/agent-docs/source-data","https://github.com/markitics/bumpgrade/issues/275","https://github.com/markitics/bumpgrade/pull/276"]',
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
