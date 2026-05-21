CREATE TABLE IF NOT EXISTS affiliate_partner_notification_readiness_records (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  affiliate_partner_report_id TEXT NOT NULL,
  affiliate_partner_id TEXT NOT NULL,
  payout_preparation_id TEXT NOT NULL,
  payout_batch_id TEXT NOT NULL,
  review_flag_id TEXT NOT NULL,
  record_kind TEXT NOT NULL,
  notification_readiness_disposition TEXT NOT NULL,
  expected_program_revision_id TEXT NOT NULL,
  expected_partner_report_status TEXT NOT NULL,
  expected_payout_batch_status TEXT NOT NULL,
  expected_payout_preparation_record_status TEXT NOT NULL,
  expected_fraud_review_record_status TEXT NOT NULL,
  expected_review_flag_severity TEXT NOT NULL,
  expected_linked_ledger_count INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  owner_partner_notification_readiness_record_created INTEGER NOT NULL DEFAULT 0,
  partner_notification_sent INTEGER NOT NULL DEFAULT 0,
  notification_provider_called INTEGER NOT NULL DEFAULT 0,
  queue_dispatch_created INTEGER NOT NULL DEFAULT 0,
  notification_body_included INTEGER NOT NULL DEFAULT 0,
  recipient_email_included INTEGER NOT NULL DEFAULT 0,
  provider_message_id_included INTEGER NOT NULL DEFAULT 0,
  send_queue_rows_included INTEGER NOT NULL DEFAULT 0,
  payable_commission_created INTEGER NOT NULL DEFAULT 0,
  fraud_decision_enforced INTEGER NOT NULL DEFAULT 0,
  stripe_payout_created INTEGER NOT NULL DEFAULT 0,
  stripe_transfer_created INTEGER NOT NULL DEFAULT 0,
  payout_account_stored INTEGER NOT NULL DEFAULT 0,
  tax_data_collected INTEGER NOT NULL DEFAULT 0,
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

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_partner_notification_readiness_records_idempotency_unique
  ON affiliate_partner_notification_readiness_records(idempotency_key);
CREATE INDEX IF NOT EXISTS affiliate_partner_notification_readiness_records_program_time_idx
  ON affiliate_partner_notification_readiness_records(program_id, created_at);
CREATE INDEX IF NOT EXISTS affiliate_partner_notification_readiness_records_report_time_idx
  ON affiliate_partner_notification_readiness_records(affiliate_partner_report_id, created_at);
CREATE INDEX IF NOT EXISTS affiliate_partner_notification_readiness_records_preparation_batch_idx
  ON affiliate_partner_notification_readiness_records(payout_preparation_id, payout_batch_id, created_at);

UPDATE admin_roadmap_items
SET
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    json_object(
      'label', 'Issue #277 owner-reviewed affiliate partner notification readiness records',
      'url', 'https://github.com/markitics/bumpgrade/issues/277'
    )
  ),
  summary = 'Affiliate and referral evidence now includes partner links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger rows, owner review/reversal actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, and owner-reviewed partner notification readiness records before payable commissions, partner sends, or Stripe payouts exist.',
  next_milestone = 'Add private payout account, tax, partner notification send-preflight, and eventual fraud-enforcement contracts only after notification readiness records stay redacted and non-sending.',
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113,115,193,195,273,275,277]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, read-only payout preparation, review-only ledger evidence, owner review/reversal state, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts or partner sends exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/api/admin/affiliates/fraud-review-records","https://bumpgrade.com/api/admin/affiliates/notification-readiness-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/277"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find partnerNotificationReadinessRecords with current program revision, partner report status, payout preparation record status, fraud review record status, review flag severity, linked ledger count, redaction flags, and write boundary.","Open /admin/affiliates as a verified owner and record redacted partner notification readiness evidence with exact confirmation and idempotency.","Confirm source-data updates aggregate counts and latest redacted metadata without recipient emails, message bodies, provider message IDs, queue rows, payout accounts, tax data, buyer data, raw rows, actor identity, or private fraud signals.","Open /affiliates/indie-launch-partners to inspect the public preview."]',
  edge_cases_json = '["Public source-data exposes aggregate counts and redacted latest payout-preparation, fraud-review, and notification-readiness records only.","Unsupported partner reports, unsupported partners, unsupported payout preparation IDs, unsupported batch IDs, unsupported review flag IDs, unsupported dispositions, stale program revisions, stale partner report status, stale payout batch status, stale payout preparation contract status, stale fraud review contract status, stale review flag evidence, missing confirmation text, and duplicate conflicting idempotency keys fail safely.","Agents must not call notification readiness records sent partner notifications, payable state, fraud enforcement, or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, and owner-reviewed partner notification readiness records. Owner sessions can record notification readiness evidence through /api/admin/affiliates/notification-readiness-records. Payout execution, fraud enforcement, tax handling, payout accounts, partner notification sends, private partner portal access, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, exact confirmation, idempotency, stale-state checks, audit correlation, redaction, private payout data boundaries, and send preflight rules.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, duplicate idempotency, stale-state validation, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, #111, #113, #115, #193, #195, #273, #275, and #277 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, public-safe partner report contract, read-only payout preparation contract, owner-confirmed payout preparation records, owner-reviewed fraud review records, and owner-reviewed partner notification readiness records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,113,115,193,195,273,275,277]',
  user_goal = 'Inspect read-only payout preparation rows, checklist blockers, partner-report links, owner-confirmed payout preparation records, owner-reviewed fraud review records, and owner-reviewed partner notification readiness records before any Stripe payout, tax, payout account, partner send, or fraud enforcement capability exists.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/api/admin/affiliates/fraud-review-records","https://bumpgrade.com/api/admin/affiliates/notification-readiness-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/277"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find payoutPreparationContract, payoutPreparationSummary, payoutPreparationRecords, fraudReviewRecords, and partnerNotificationReadinessRecords.","Inspect each payoutPreparationId, linked payoutBatchId, partnerReportIds, eligible ledger IDs, blocked ledger IDs, reversed ledger IDs, readiness checklist, fraud review flag, notification readiness checklist, and public-safe aggregate totals.","Open /admin/affiliates as a verified owner and record redacted notification readiness evidence with exact confirmation, idempotency, current program revision, partner report status, payout batch status, payout preparation record status, fraud review record status, review flag severity, and linked ledger count.","Treat all rows as evidence only; do not call them payable commission state, partner statements, notification sends, or fraud enforcement."]',
  edge_cases_json = '["Refund-window, owner-hold, self-referral evidence, missing recipient review, and disabled provider send paths keep notification readiness from becoming a send workflow.","Public preparation rows, owner-confirmed payout records, owner-reviewed fraud records, and notification readiness records never expose recipient emails, message bodies, provider message IDs, send queue rows, buyer data, raw ledger rows, raw click rows, raw checkout rows, raw actor identity, private fraud signals, partner payout accounts, tax forms, or Stripe payout identifiers.","Stripe payouts, transfer creation, private partner portals, payout account storage, tax collection, fraud enforcement, payable commission finalization, partner notification sends, and direct agent writes require future confirmed-write APIs."]',
  agent_access = 'Agents can read public-safe payout preparation, fraud review, and notification readiness evidence from /affiliates/source-data and cite payoutPreparationId, payoutPreparationRecordId, reviewFlagId, fraudReviewRecordId, and partnerNotificationReadinessRecordId values. Owner sessions can record notification readiness evidence through /api/admin/affiliates/notification-readiness-records. Payout execution, tax handling, payout accounts, partner sends, fraud enforcement, and direct agent affiliate writes require future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers payoutPreparationContract, payoutPreparationSummary, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, preview rendering, admin journey exposure, agent manifest stable IDs, and redaction boundaries.","Issues #195, #273, #275, and #277 record the read-only payout preparation slice, owner-confirmed payout preparation records, owner-reviewed fraud review records, and owner-reviewed partner notification readiness records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-prepares-affiliate-payout-batch';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal,
  source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json,
  sort_order, updated_at
) VALUES (
  'journey-owner-prepares-affiliate-partner-notification-readiness',
  'Owner records affiliate partner notification readiness evidence',
  'feature-affiliates-referrals',
  'launch-preview',
  '[19,193,195,273,275,277]',
  'Owner reviewing affiliate partner notification readiness before sends exist',
  'Record redacted partner notification readiness evidence for a seeded affiliate partner report without sending partner notifications, calling providers, creating queue rows, or creating payout state.',
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/api/admin/affiliates/notification-readiness-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/277"]',
  '["Fetch /affiliates/source-data and inspect partnerNotificationReadinessRecords.currentEvidence.","Open /admin/affiliates as a verified owner.","Record a notification readiness disposition with exact confirmation, idempotency key, current program revision, partner report status, payout batch status, payout preparation record status, fraud review record status, review flag severity, and linked ledger count.","Replay the idempotency key and confirm the same redacted record is returned.","Read /affiliates/source-data again and confirm aggregate notification readiness counts and latest redacted metadata update."]',
  '["Signed-out requests are rejected.","Missing confirmation, unsupported partner reports, unsupported partners, unsupported payout preparation IDs, unsupported payout batch IDs, unsupported review flag IDs, unsupported dispositions, stale program revisions, stale partner report statuses, stale payout batch statuses, stale payout preparation contract statuses, stale fraud review contract statuses, stale fraud evidence, and conflicting idempotency keys fail safely.","The record does not send partner notifications, call providers, create queues, include recipient emails or message bodies, enforce fraud decisions, create payable commission state, trigger Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose actor identity, or expose private fraud signals."]',
  'Agents can read the public-safe notification readiness contract and aggregate evidence, but only owner sessions can create notification readiness records. Direct public agent writes, partner notification sends, provider calls, queue dispatch, fraud enforcement, payable commission mutation, payout execution, tax handling, recipient exposure, and private fraud signal exposure require future confirmed-write APIs.',
  '["Playwright covers unauthenticated rejection, owner contract read, exact confirmation, idempotency replay/conflict, stale-state rejection, unsupported report/partner/flag/disposition validation, public source-data redaction, and admin UI rendering for notification readiness records.","Issue #277 records the owner-reviewed affiliate partner notification readiness evidence slice."]',
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

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-21-affiliate-notification-readiness-records',
  'Added owner-reviewed affiliate partner notification readiness records',
  'Codex',
  'codex',
  'bumpgrade-bootstrap',
  'Continue the Bumpgrade parity build and add owner-reviewed affiliate partner notification readiness evidence for agents.',
  '[{"number":277,"url":"https://github.com/markitics/bumpgrade/issues/277"},{"number":19,"url":"https://github.com/markitics/bumpgrade/issues/19"}]',
  '[]',
  '["https://bumpgrade.com/features","https://bumpgrade.com/affiliates/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["src/lib/affiliate-partner-notification-readiness-records.ts","src/app/api/admin/affiliates/notification-readiness-records/route.ts","src/app/admin/affiliates/page.tsx","src/app/affiliates/source-data/route.ts","src/lib/agent-manifest.ts","docs/features/affiliate-referrals.md","drizzle/0104_affiliate_notification_readiness_records.sql"]',
  '["npm run lint","npm run typecheck","npm run cf:build","Focused affiliate notification readiness records, source-data, admin affiliates, agent docs, admin source-data, and user-journey smoke tests"]',
  NULL,
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/api/admin/affiliates/notification-readiness-records","https://bumpgrade.com/admin/affiliates","https://bumpgrade.com/agent-docs/source-data","https://github.com/markitics/bumpgrade/issues/277"]',
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
