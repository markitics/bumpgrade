CREATE TABLE IF NOT EXISTS affiliate_commission_ledger_actions (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  commission_ledger_id TEXT NOT NULL REFERENCES affiliate_commission_ledger_entries(id) ON DELETE CASCADE,
  checkout_intent_id TEXT NOT NULL REFERENCES checkout_intents(id) ON DELETE CASCADE,
  action_kind TEXT NOT NULL,
  previous_ledger_status TEXT NOT NULL,
  previous_review_status TEXT NOT NULL,
  previous_payout_status TEXT NOT NULL,
  next_ledger_status TEXT NOT NULL,
  next_review_status TEXT NOT NULL,
  next_payout_status TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email TEXT,
  actor_role TEXT NOT NULL,
  reason_public TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_commission_ledger_actions_idempotency_unique
  ON affiliate_commission_ledger_actions(idempotency_key);
CREATE INDEX IF NOT EXISTS affiliate_commission_ledger_actions_ledger_created_idx
  ON affiliate_commission_ledger_actions(commission_ledger_id, created_at);
CREATE INDEX IF NOT EXISTS affiliate_commission_ledger_actions_action_created_idx
  ON affiliate_commission_ledger_actions(action_kind, created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Affiliate programs, referral links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal actions, payout review states, fraud flags, and agent-readable reports.',
  public_evidence_json = '["Issue #19 owns affiliate and referral management.", "Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold.", "Issue #109 adds POST /api/affiliates/clicks with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.", "Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions or payout state.", "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution without making commissions payable.", "Issue #115 adds owner-gated review, hold, and reversal actions for review-only ledger evidence without payout mutation."]',
  next_milestone = 'Add partner-facing reporting and explicit payout batch preparation only after owner review/reversal controls stay stable.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_roadmap_items
SET
  summary = 'Stripe sandbox commerce now includes Checkout Session starts, constrained order bumps, webhook-backed entitlement grants, optional referral-click attribution evidence, review-only commission ledger evidence, and owner review/reversal actions. Live payment and payout rollout remains deliberately disabled.',
  public_evidence_json = '["Issue #11 owns the Stripe architecture slice.", "Issue #34 owns the first sandbox Checkout Session and webhook ingestion path.", "Issue #99 owns the constrained order-bump checkout start.", "Issue #101 grants sandbox product entitlements from trusted paid webhook evidence.", "Issue #111 attaches public-safe referral click evidence to checkout intents.", "Issue #113 creates non-payable commission ledger evidence from checkout attribution.", "Issue #115 adds owner-gated commission review/reversal actions without payout mutation."]',
  next_milestone = 'Add post-purchase upsell/downsell decision surfaces plus partner reporting before payout preparation.',
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113,115]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, review-only ledger evidence, owner review/reversal state, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, and write boundary.","POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.","Start a sandbox checkout intent through /api/commerce/checkout with the referral click ID and checkout idempotency key.","Create review-only commission evidence through /api/affiliates/commission-ledger with checkout intent ID, exact confirmation, and idempotency key.","As an owner, POST a review, hold, or reversal action to /api/admin/affiliates/commission-ledger/actions with exact confirmation, idempotency, expected updated_at, and reason.","Confirm duplicate action idempotency returns the same action row and does not duplicate owner review evidence.","Use /commerce/source-data and /affiliates/source-data to distinguish checkout attribution evidence, review-only ledger evidence, and owner review/reversal actions from payable commissions."]',
  edge_cases_json = '["Public source-data exposes aggregate click, checkout attribution, commission ledger, and owner action counts only, not raw click, checkout, buyer, actor, reason, or payout rows.","Unsupported referral link IDs, codes, destination routes, referral click IDs, checkout intent IDs, commission ledger IDs, action kinds, stale expected updated_at values, and missing idempotency keys return public-safe validation errors.","Cookie assignment, buyer attribution finalization, payable commission writes, payout accounts, tax forms, fraud enforcement, Stripe payouts, and partner notifications require future confirmed-write APIs.","Agents must not call review-only commission evidence payable or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, and owner review action boundaries. Payout, fraud, tax, partner notification, partner payout account storage, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, duplicate idempotency, stale-state validation, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, #111, #113, and #115 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, and owner review/reversal action boundary."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-owner-reviews-commission-ledger-evidence',
  'Owner reviews or reverses commission evidence',
  'feature-affiliates-referrals',
  'pending',
  '[19,113,115]',
  'Owner reviewing affiliate commission evidence before payout exists',
  'Apply an owner review, hold, or reversal action to review-only commission evidence without making it payable.',
  '["https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/affiliates/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115"]',
  '["Create review-only commission ledger evidence from trusted checkout attribution.","Read the current ledger updatedAt from the ledger creation response.","POST an owner review action with exact confirmation, idempotency key, action kind, expectedUpdatedAt, and public reason.","Replay the idempotency key and receive the same action row.","Read aggregate review action counts from /commerce/source-data or /affiliates/source-data without exposing raw actor, buyer, Stripe, payout, or private reason fields."]',
  '["Signed-out requests are rejected.","Missing confirmation, unknown action kinds, unknown ledgers, stale expectedUpdatedAt values, and conflicting idempotency keys are rejected.","Actions keep payoutStatus not_payable and do not create payout, tax, fraud, partner notification, or buyer attribution finalization state.","Private actor identity and private reasons remain server-private."]',
  'Agents can inspect public-safe review action contracts and aggregate counts. Direct agent review/reversal writes, payable commission writes, payout mutation, fraud decisions, buyer attribution finalization, and partner notifications require future authenticated confirmed-write APIs.',
  '["Playwright covers owner sign-in, review action creation, duplicate idempotency, stale-state rejection, signed-out rejection, aggregate-only source-data, and no payout/tax/partner notification state.","Issue #115 records the first owner-gated review/reversal action boundary."]',
  58,
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
