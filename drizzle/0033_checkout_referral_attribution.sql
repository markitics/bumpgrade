CREATE TABLE IF NOT EXISTS checkout_referral_attributions (
  id TEXT PRIMARY KEY,
  checkout_intent_id TEXT NOT NULL REFERENCES checkout_intents(id) ON DELETE CASCADE,
  referral_click_id TEXT NOT NULL REFERENCES affiliate_referral_clicks(id) ON DELETE CASCADE,
  referral_link_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  destination_route TEXT NOT NULL,
  attribution_status TEXT NOT NULL DEFAULT 'checkout_intent_attached',
  checkout_product_id TEXT REFERENCES commerce_products(id) ON DELETE SET NULL,
  checkout_price_id TEXT REFERENCES commerce_prices(id) ON DELETE SET NULL,
  audit_correlation_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS checkout_referral_attributions_intent_unique
  ON checkout_referral_attributions(checkout_intent_id);
CREATE INDEX IF NOT EXISTS checkout_referral_attributions_click_idx
  ON checkout_referral_attributions(referral_click_id);
CREATE INDEX IF NOT EXISTS checkout_referral_attributions_partner_time_idx
  ON checkout_referral_attributions(partner_id, created_at);
CREATE INDEX IF NOT EXISTS checkout_referral_attributions_link_time_idx
  ON checkout_referral_attributions(referral_link_id, created_at);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Affiliate programs, referral links, privacy-safe click capture, checkout attribution evidence, attribution windows, commission rules, payout review states, fraud flags, and agent-readable reports.',
  public_evidence_json = '["Issue #19 owns affiliate and referral management.", "Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold.", "Issue #109 adds POST /api/affiliates/clicks with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.", "Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions or payout state."]',
  next_milestone = 'Create reversible commission ledger evidence from trusted paid sandbox checkout attribution without making commissions payable or exposing buyer identifiers.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_roadmap_items
SET
  summary = 'Stripe sandbox commerce now includes Checkout Session starts, constrained order bumps, webhook-backed entitlement grants, and optional referral-click attribution evidence on checkout intents. Live payment rollout remains deliberately disabled.',
  public_evidence_json = '["Issue #11 owns the Stripe architecture slice.", "Issue #34 owns the first sandbox Checkout Session and webhook ingestion path.", "Issue #99 owns the constrained order-bump checkout start.", "Issue #101 grants sandbox product entitlements from trusted paid webhook evidence.", "Issue #111 attaches public-safe referral click evidence to checkout intents."]',
  next_milestone = 'Use trusted paid checkout plus referral attribution evidence to create reversible commission ledger records without payout mutation.',
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before commissions or payouts exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, referral link IDs, attribution rule IDs, commission rule IDs, ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, and write boundary.","POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.","Start a sandbox checkout intent through /api/commerce/checkout with the referral click ID and checkout idempotency key.","Confirm duplicate idempotency returns the same checkout intent and does not duplicate attribution evidence.","Open /affiliates/indie-launch-partners to inspect the public preview.","Use /commerce/source-data and /offers/source-data to distinguish checkout attribution evidence from payable commissions."]',
  edge_cases_json = '["Public source-data exposes aggregate click and checkout attribution counts only, not raw click or checkout rows.","Unsupported referral link IDs, codes, destination routes, referral click IDs, and missing idempotency keys return public-safe validation errors.","Cookie assignment, buyer attribution finalization, commission writes, payout accounts, tax forms, fraud enforcement, Stripe payouts, and partner notifications require future confirmed-write APIs.","Agents must not call fixture commission amounts payable or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, the preview route, click capture boundaries, and checkout attribution boundaries. Commission, payout, fraud, tax, partner notification, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, duplicate idempotency, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, and #111 record the affiliate/referral source-data scaffold, privacy-safe click capture, and first checkout attribution evidence path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[11,34,15,16,99,101,111]',
  user_goal = 'Understand what Bumpgrade must know before it can create a Stripe checkout session safely, including optional referral-click evidence that remains separate from commissions.',
  source_evidence_json = '["https://bumpgrade.com/features","https://bumpgrade.com/roadmap","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/affiliates/source-data","https://github.com/markitics/bumpgrade/issues/11","https://github.com/markitics/bumpgrade/issues/34","https://github.com/markitics/bumpgrade/issues/99","https://github.com/markitics/bumpgrade/issues/101","https://github.com/markitics/bumpgrade/issues/111"]',
  happy_path_json = '["Create or identify a commerce product record.","Attach a price record with currency, amount, interval, and optional Stripe Price id.","Optionally attach a validated seeded referral click when creating a checkout intent.","Create a checkout intent with an idempotency key and audit correlation id.","Use sandbox Stripe Checkout first.","Let the webhook update intent, subscription, entitlement, and audit state before public fulfillment is trusted."]',
  edge_cases_json = '["Live mode is not the default; live rollout needs an explicit later issue.","Agent-started checkout requires exact confirmation and an audit record before Stripe is called.","Webhook payloads must be redacted before model-readable surfaces expose them.","Referral click evidence is not a commission, payout, fraud decision, or buyer attribution finalization.","Raw card data never enters Bumpgrade."]',
  agent_access = 'Agents may read the architecture, product, price, checkout-intent, referral attribution, and redacted webhook records once exposed. Agents must not create checkout sessions without confirmed-write rules, idempotency, audit correlation, and stale-state checks, and must not create commissions or payout state.',
  validation_json = '["Issue #11 defines the D1 data model and secret plan.","Issue #34 tracks the first sandbox route and webhook ingestion implementation.","Issue #111 records the first checkout referral attribution evidence path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-plans-first-checkout';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-agent-attaches-referral-click-to-checkout',
  'Agent attaches referral click evidence to checkout',
  'feature-affiliates-referrals',
  'pending',
  '[19,109,111]',
  'Agent or system integration validating referral-to-checkout tracking',
  'Record a seeded referral click, create a sandbox checkout intent that references it, and verify Bumpgrade stores only public-safe attribution evidence.',
  '["https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/affiliates/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111"]',
  '["POST a seeded referral click for the launch funnel with idempotency.","POST /api/commerce/checkout with exact confirmation text, checkout idempotency, and the referral click ID.","Replay the checkout idempotency key and receive the same checkout intent plus the same attribution evidence.","Read aggregate attribution counts from /commerce/source-data or /affiliates/source-data without exposing raw rows."]',
  '["Missing or unknown referral click IDs are rejected.","Referral clicks for non-eligible destinations are rejected.","The evidence row does not create a commission, payout, fraud decision, tax record, partner notification, or buyer attribution finalization.","Private request, buyer, and Stripe fields remain server-private."]',
  'Agents can inspect the checkout attribution contract and propose referral-to-checkout tests, but commission writes, payout mutations, fraud decisions, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs.',
  '["Playwright covers referral click creation, checkout attribution attachment, duplicate idempotency, validation failures, and aggregate-only source-data.","Issue #111 records the first checkout referral attribution evidence path."]',
  56,
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
