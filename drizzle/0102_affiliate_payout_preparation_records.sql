CREATE TABLE IF NOT EXISTS affiliate_payout_preparation_records (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  payout_preparation_id TEXT NOT NULL,
  payout_batch_id TEXT NOT NULL,
  record_kind TEXT NOT NULL,
  expected_program_revision_id TEXT NOT NULL,
  expected_payout_batch_status TEXT NOT NULL,
  expected_eligible_ledger_count INTEGER NOT NULL DEFAULT 0,
  expected_blocked_ledger_count INTEGER NOT NULL DEFAULT 0,
  expected_reversed_ledger_count INTEGER NOT NULL DEFAULT 0,
  expected_total_commission_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  owner_payout_preparation_record_created INTEGER NOT NULL DEFAULT 0,
  payable_commission_created INTEGER NOT NULL DEFAULT 0,
  stripe_payout_created INTEGER NOT NULL DEFAULT 0,
  stripe_transfer_created INTEGER NOT NULL DEFAULT 0,
  payout_account_stored INTEGER NOT NULL DEFAULT 0,
  tax_data_collected INTEGER NOT NULL DEFAULT 0,
  partner_notification_sent INTEGER NOT NULL DEFAULT 0,
  fraud_decision_enforced INTEGER NOT NULL DEFAULT 0,
  buyer_data_included INTEGER NOT NULL DEFAULT 0,
  raw_ledger_rows_exposed INTEGER NOT NULL DEFAULT 0,
  raw_actor_identity_included INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_payout_preparation_records_idempotency_unique
  ON affiliate_payout_preparation_records(idempotency_key);
CREATE INDEX IF NOT EXISTS affiliate_payout_preparation_records_program_time_idx
  ON affiliate_payout_preparation_records(program_id, created_at);
CREATE INDEX IF NOT EXISTS affiliate_payout_preparation_records_preparation_batch_idx
  ON affiliate_payout_preparation_records(payout_preparation_id, payout_batch_id, created_at);

UPDATE admin_roadmap_items
SET
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    json_object(
      'label', 'Issue #273 owner-confirmed affiliate payout preparation records',
      'url', 'https://github.com/markitics/bumpgrade/issues/273'
    )
  ),
  summary = 'Affiliate and referral evidence now includes partner links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger rows, owner review/reversal actions, public-safe partner reports, read-only payout preparation, and owner-confirmed payout preparation records before payable commissions or Stripe payouts exist.',
  next_milestone = 'Add partner-facing notification and payout-account readiness only after owner-confirmed payout preparation records keep Stripe payouts, tax data, partner notifications, payout accounts, buyer data, raw ledger rows, and fraud enforcement disabled.',
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113,115,193,195,273]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, read-only payout preparation, review-only ledger evidence, owner review/reversal state, owner-confirmed payout preparation records, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115","https://github.com/markitics/bumpgrade/issues/193","https://github.com/markitics/bumpgrade/issues/195","https://github.com/markitics/bumpgrade/issues/273"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, partner report IDs, payout preparation IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, partner report contract, payout preparation contract, owner payout preparation record contract, and write boundary.","Open /admin/affiliates as a verified owner and record redacted payout preparation evidence with the current program revision, payout batch status, ledger counts, total commission cents, exact confirmation, and idempotency key.","Open /affiliates/indie-launch-partners to inspect the public preview."]',
  edge_cases_json = '["Public source-data exposes aggregate counts and redacted latest payout-preparation records only, not payout accounts, tax data, Stripe payout IDs, partner notification bodies, buyer data, raw ledger rows, private reasons, or raw actor fields.","Unsupported payout preparation IDs, unsupported batch IDs, stale program revisions, stale payout batch statuses, stale ledger counts, missing confirmation text, and duplicate conflicting idempotency keys fail safely.","Agents must not call review-only commission evidence, partner report totals, read-only payout preparation, or owner-confirmed payout preparation records payable or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, public-safe partner reports, read-only payout preparation, and owner-confirmed payout preparation record evidence. Owner sessions can record payout preparation records through /api/admin/affiliates/payout-preparation-records. Payout execution, fraud enforcement, tax handling, payout accounts, partner notifications, private partner portal access, partner payout account storage, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, duplicate idempotency, stale-state validation, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, #111, #113, #115, #193, #195, and #273 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, public-safe partner report contract, read-only payout preparation contract, and owner-confirmed payout preparation records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,113,115,193,195,273]',
  user_goal = 'Inspect read-only payout preparation rows, checklist blockers, partner-report links, and owner-confirmed payout preparation records before any Stripe payout, tax, payout account, or partner notification capability exists.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/admin/affiliates","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115","https://github.com/markitics/bumpgrade/issues/193","https://github.com/markitics/bumpgrade/issues/195","https://github.com/markitics/bumpgrade/issues/273"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find payoutPreparationContract, payoutPreparationSummary, and payoutPreparationRecords.","Inspect each payoutPreparationId, linked payoutBatchId, partnerReportIds, eligible ledger IDs, blocked ledger IDs, reversed ledger IDs, readiness checklist, and public-safe aggregate totals.","Open /admin/affiliates as a verified owner and record redacted payout preparation evidence with exact confirmation, idempotency, current program revision, payout batch status, ledger counts, and total commission cents.","Open /affiliates/indie-launch-partners and inspect the read-only payout preparation card.","Treat the preparation row as a checklist only; do not call it payable commission state or a partner statement."]',
  edge_cases_json = '["Refund-window, owner-hold, and self-referral evidence keep preparation blocked until future private review contracts exist.","Public preparation rows and owner-confirmed payout records never expose buyer data, raw ledger rows, raw actor identity, private reasons, partner payout accounts, tax forms, Stripe payout identifiers, or partner notification payloads.","Stripe payouts, transfer creation, private partner portals, payout account storage, tax collection, fraud decisions, payable commission finalization, and direct agent writes require future confirmed-write APIs."]',
  agent_access = 'Agents can read public-safe payout preparation from /affiliates/source-data and cite payoutPreparationId and payoutPreparationRecordId values. Owner sessions can record payout preparation evidence through /api/admin/affiliates/payout-preparation-records. Payout execution, tax handling, payout accounts, partner notifications, fraud decisions, and direct agent affiliate writes require future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers payoutPreparationContract, payoutPreparationSummary, owner-confirmed payout preparation records, preview rendering, admin journey exposure, agent manifest stable IDs, and redaction boundaries.","Issues #195 and #273 record the read-only payout preparation slice and owner-confirmed payout preparation records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-prepares-affiliate-payout-batch';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-21-affiliate-payout-preparation-records',
  'Added owner-confirmed affiliate payout preparation records',
  'Codex',
  'codex',
  'bumpgrade-bootstrap',
  'Continue the Bumpgrade parity build and add owner-confirmed affiliate payout preparation record evidence for agents.',
  '[{"number":273,"url":"https://github.com/markitics/bumpgrade/issues/273"},{"number":19,"url":"https://github.com/markitics/bumpgrade/issues/19"}]',
  '[]',
  '["https://bumpgrade.com/features","https://bumpgrade.com/affiliates/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["src/lib/affiliate-payout-preparation-records.ts","src/app/api/admin/affiliates/payout-preparation-records/route.ts","src/app/affiliates/source-data/route.ts","src/lib/agent-manifest.ts","docs/features/affiliate-referrals.md","drizzle/0102_affiliate_payout_preparation_records.sql"]',
  '["npm run lint","npm run typecheck","npm run cf:build","Focused affiliate payout preparation records, source-data, agent docs, admin source-data, and user-journey smoke tests"]',
  NULL,
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/api/admin/affiliates/payout-preparation-records","https://bumpgrade.com/agent-docs/source-data","https://github.com/markitics/bumpgrade/issues/273"]',
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
