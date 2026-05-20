UPDATE admin_roadmap_items
SET
  summary = 'Affiliate programs, referral links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal actions, public-safe partner reports, read-only payout preparation, payout review states, fraud flags, and agent-readable reports.',
  public_evidence_json = '["Issue #19 owns affiliate and referral management.", "Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold.", "Issue #109 adds POST /api/affiliates/clicks with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.", "Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions or payout state.", "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution without making commissions payable.", "Issue #115 adds owner-gated review, hold, and reversal actions for review-only ledger evidence without payout mutation.", "Issue #193 adds public-safe partner reports without exposing buyer, payout, tax, Stripe, raw click, raw checkout, or private actor data.", "Issue #195 adds read-only payout preparation without Stripe payouts, payout account storage, tax collection, partner notifications, payable commission finalization, or direct agent writes."]',
  next_milestone = 'Add private payout account, tax, partner notification, and fraud-review contracts only after read-only payout preparation stays stable.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_roadmap_items
SET
  summary = 'Stripe sandbox commerce now includes Checkout Session starts, constrained order bumps, webhook-backed entitlement grants, optional referral-click attribution evidence, review-only commission ledger evidence, owner review/reversal actions, and read-only payout preparation. Live payment and payout rollout remains deliberately disabled.',
  public_evidence_json = '["Issue #11 owns the Stripe architecture slice.", "Issue #34 owns the first sandbox Checkout Session and webhook ingestion path.", "Issue #99 owns the constrained order-bump checkout start.", "Issue #101 grants sandbox product entitlements from trusted paid webhook evidence.", "Issue #111 attaches public-safe referral click evidence to checkout intents.", "Issue #113 creates non-payable commission ledger evidence from checkout attribution.", "Issue #115 adds owner-gated commission review/reversal actions without payout mutation.", "Issue #195 adds affiliate payout preparation as read-only readiness evidence without Stripe payouts."]',
  next_milestone = 'Add private payout account, tax, and partner notification contracts only after read-only payout preparation stays stable.',
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113,115,193,195]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, read-only payout preparation, review-only ledger evidence, owner review/reversal state, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115","https://github.com/markitics/bumpgrade/issues/193","https://github.com/markitics/bumpgrade/issues/195"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, partner report IDs, payout preparation IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, partner report contract, payout preparation contract, and write boundary.","Read partnerReportSummary to compare aggregate click, attributed checkout, review-only ledger, review action, and commission evidence totals by partner without exposing raw rows.","Read payoutPreparationSummary to inspect eligible, blocked, and reversed fixture ledgers plus readiness checklist items without treating them as payable.","POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.","Start a sandbox checkout intent through /api/commerce/checkout with the referral click ID and checkout idempotency key.","Create review-only commission evidence through /api/affiliates/commission-ledger with checkout intent ID, exact confirmation, and idempotency key.","As an owner, POST a review, hold, or reversal action to /api/admin/affiliates/commission-ledger/actions with exact confirmation, idempotency, expected updated_at, and reason.","Use /commerce/source-data and /affiliates/source-data to distinguish checkout attribution evidence, review-only ledger evidence, public-safe partner reports, read-only payout preparation, and owner review/reversal actions from payable commissions."]',
  edge_cases_json = '["Public source-data exposes aggregate click, checkout attribution, commission ledger, owner action, partner report, and payout preparation counts only, not raw click, checkout, buyer, actor, reason, tax, payout, partner notification, or Stripe rows.","Unsupported referral link IDs, codes, destination routes, referral click IDs, checkout intent IDs, commission ledger IDs, action kinds, stale expected updated_at values, and missing idempotency keys return public-safe validation errors.","Cookie assignment, buyer attribution finalization, payable commission writes, payout accounts, tax forms, fraud enforcement, Stripe payouts, private partner portals, and partner notifications require future confirmed-write APIs.","Agents must not call review-only commission evidence, partner report totals, or payout preparation rows payable or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, public-safe partner reports, and read-only payout preparation. Payout execution, fraud, tax, partner notification, private partner portal access, partner payout account storage, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, read-only payout preparation, duplicate idempotency, stale-state validation, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, #111, #113, #115, #193, and #195 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, public-safe partner report contract, and read-only payout preparation contract."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-prepares-affiliate-payout-batch',
  'Publisher prepares an affiliate payout batch',
  'feature-affiliates-referrals',
  'pending',
  '[19,113,115,193,195]',
  'Publisher reviewing affiliate payout readiness before payable state exists',
  'Inspect read-only payout preparation rows, checklist blockers, and partner-report links before any Stripe payout, tax, payout account, or partner notification capability exists.',
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115","https://github.com/markitics/bumpgrade/issues/193","https://github.com/markitics/bumpgrade/issues/195"]',
  '["Fetch /affiliates/source-data.","Find payoutPreparationContract and payoutPreparationSummary.","Inspect each payoutPreparationId, linked payoutBatchId, partnerReportIds, eligible ledger IDs, blocked ledger IDs, reversed ledger IDs, readiness checklist, and public-safe aggregate totals.","Open /affiliates/indie-launch-partners and inspect the read-only payout preparation card.","Treat the preparation row as a checklist only; do not call it payable commission state or a partner statement."]',
  '["Refund-window, owner-hold, and self-referral evidence keep preparation blocked until future private review contracts exist.","Public preparation rows never expose buyer data, raw ledger rows, raw actor identity, private reasons, partner payout accounts, tax forms, Stripe payout identifiers, or partner notification payloads.","Stripe payouts, transfer creation, private partner portals, payout account storage, tax collection, fraud decisions, payable commission finalization, and direct agent writes require future confirmed-write APIs."]',
  'Agents can read public-safe payout preparation from /affiliates/source-data and cite payoutPreparationId values. Payout execution, tax handling, payout accounts, partner notifications, fraud decisions, and direct agent affiliate writes require future authenticated confirmed-write APIs.',
  '["Playwright covers payoutPreparationContract, payoutPreparationSummary, preview rendering, admin journey exposure, agent manifest stable IDs, and redaction boundaries.","Issue #195 records the read-only payout preparation slice."]',
  59,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  feature_id=excluded.feature_id,
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
