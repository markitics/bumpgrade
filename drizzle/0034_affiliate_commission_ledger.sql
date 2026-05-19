CREATE TABLE IF NOT EXISTS affiliate_commission_ledger_entries (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  checkout_intent_id TEXT NOT NULL REFERENCES checkout_intents(id) ON DELETE CASCADE,
  referral_attribution_id TEXT NOT NULL REFERENCES checkout_referral_attributions(id) ON DELETE CASCADE,
  referral_click_id TEXT NOT NULL REFERENCES affiliate_referral_clicks(id) ON DELETE CASCADE,
  referral_link_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  commission_rule_ids_json TEXT NOT NULL,
  source_checkout_status TEXT NOT NULL,
  source_checkout_amount_cents INTEGER NOT NULL,
  commission_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  ledger_status TEXT NOT NULL DEFAULT 'review_only',
  review_status TEXT NOT NULL DEFAULT 'refund_window_open',
  payout_status TEXT NOT NULL DEFAULT 'not_payable',
  refund_window_days INTEGER NOT NULL DEFAULT 14,
  reversible_until INTEGER,
  audit_correlation_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_commission_ledger_entries_idempotency_unique
  ON affiliate_commission_ledger_entries(idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS affiliate_commission_ledger_entries_checkout_unique
  ON affiliate_commission_ledger_entries(checkout_intent_id);
CREATE INDEX IF NOT EXISTS affiliate_commission_ledger_entries_partner_time_idx
  ON affiliate_commission_ledger_entries(partner_id, created_at);
CREATE INDEX IF NOT EXISTS affiliate_commission_ledger_entries_link_time_idx
  ON affiliate_commission_ledger_entries(referral_link_id, created_at);
CREATE INDEX IF NOT EXISTS affiliate_commission_ledger_entries_status_idx
  ON affiliate_commission_ledger_entries(ledger_status, review_status, payout_status);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Affiliate programs, referral links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger evidence, payout review states, fraud flags, and agent-readable reports.',
  public_evidence_json = '["Issue #19 owns affiliate and referral management.", "Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold.", "Issue #109 adds POST /api/affiliates/clicks with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.", "Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions or payout state.", "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution without making commissions payable."]',
  next_milestone = 'Add explicit owner review and reversal actions before any payout mutation, partner notification, tax collection, or fraud enforcement.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_roadmap_items
SET
  summary = 'Stripe sandbox commerce now includes Checkout Session starts, constrained order bumps, webhook-backed entitlement grants, optional referral-click attribution evidence, and review-only commission ledger evidence. Live payment and payout rollout remains deliberately disabled.',
  public_evidence_json = '["Issue #11 owns the Stripe architecture slice.", "Issue #34 owns the first sandbox Checkout Session and webhook ingestion path.", "Issue #99 owns the constrained order-bump checkout start.", "Issue #101 grants sandbox product entitlements from trusted paid webhook evidence.", "Issue #111 attaches public-safe referral click evidence to checkout intents.", "Issue #113 creates non-payable commission ledger evidence from checkout attribution."]',
  next_milestone = 'Require owner review and reversal controls before commission evidence can affect payout state.',
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, review-only ledger evidence, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111","https://github.com/markitics/bumpgrade/issues/113"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, and write boundary.","POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.","Start a sandbox checkout intent through /api/commerce/checkout with the referral click ID and checkout idempotency key.","Create review-only commission evidence through /api/affiliates/commission-ledger with checkout intent ID, exact confirmation, and idempotency key.","Confirm duplicate idempotency returns the same ledger row and does not duplicate commission evidence.","Open /affiliates/indie-launch-partners to inspect the public preview.","Use /commerce/source-data and /offers/source-data to distinguish checkout attribution evidence and review-only ledger evidence from payable commissions."]',
  edge_cases_json = '["Public source-data exposes aggregate click, checkout attribution, and commission ledger counts only, not raw click, checkout, buyer, or payout rows.","Unsupported referral link IDs, codes, destination routes, referral click IDs, checkout intent IDs, and missing idempotency keys return public-safe validation errors.","Cookie assignment, buyer attribution finalization, payable commission writes, payout accounts, tax forms, fraud enforcement, Stripe payouts, and partner notifications require future confirmed-write APIs.","Agents must not call review-only commission evidence payable or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, and review-only commission ledger boundaries. Payout, fraud, tax, partner notification, owner review, reversal, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, duplicate idempotency, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, #111, and #113 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, and first review-only ledger evidence path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-agent-creates-review-only-commission-evidence',
  'Agent creates review-only commission evidence',
  'feature-affiliates-referrals',
  'pending',
  '[19,109,111,113]',
  'Agent or system integration validating referral-to-commission tracking',
  'Create a review-only commission ledger row from trusted sandbox checkout attribution and verify it remains non-payable.',
  '["https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/affiliates/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111","https://github.com/markitics/bumpgrade/issues/113"]',
  '["POST a seeded referral click for the launch funnel with idempotency.","POST /api/commerce/checkout with exact confirmation text, checkout idempotency, and the referral click ID.","POST /api/affiliates/commission-ledger with exact commission confirmation, checkout intent ID, and ledger idempotency key.","Replay the ledger idempotency key and receive the same non-payable ledger evidence.","Read aggregate ledger counts from /commerce/source-data or /affiliates/source-data without exposing raw rows."]',
  '["Missing or unknown checkout intent IDs are rejected.","Checkout intents without referral attribution are rejected.","Ledger evidence remains review-only and does not create payout, tax, fraud, partner notification, or buyer attribution finalization state.","Private request, buyer, and Stripe fields remain server-private."]',
  'Agents can inspect the review-only ledger contract and propose referral-to-commission tests, but payable commission writes, payout mutations, fraud decisions, buyer attribution finalization, owner review, reversal, and direct agent affiliate writes require future authenticated confirmed-write APIs.',
  '["Playwright covers referral click creation, checkout attribution attachment, review-only ledger creation, duplicate idempotency, validation failures, and aggregate-only source-data.","Issue #113 records the first review-only commission ledger evidence path."]',
  57,
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
