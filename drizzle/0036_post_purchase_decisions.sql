CREATE TABLE IF NOT EXISTS checkout_post_purchase_decisions (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  checkout_intent_id TEXT NOT NULL REFERENCES checkout_intents(id) ON DELETE CASCADE,
  offer_stack_id TEXT NOT NULL,
  presented_offer_id TEXT NOT NULL,
  decision_kind TEXT NOT NULL,
  checkout_status TEXT NOT NULL,
  checkout_updated_at INTEGER NOT NULL,
  actor_kind TEXT NOT NULL,
  audit_correlation_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS checkout_post_purchase_decisions_idempotency_unique
  ON checkout_post_purchase_decisions(idempotency_key);
CREATE INDEX IF NOT EXISTS checkout_post_purchase_decisions_checkout_created_idx
  ON checkout_post_purchase_decisions(checkout_intent_id, created_at);
CREATE INDEX IF NOT EXISTS checkout_post_purchase_decisions_offer_created_idx
  ON checkout_post_purchase_decisions(presented_offer_id, decision_kind, created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Stripe sandbox commerce now includes Checkout Session starts, constrained order bumps, webhook-backed entitlement grants, optional referral-click attribution evidence, review-only commission ledger evidence, owner review/reversal actions, and non-billing post-purchase upsell/downsell decision evidence. Live payment and payout rollout remains deliberately disabled.',
  public_evidence_json = '["Issue #11 owns the Stripe architecture slice.", "Issue #34 owns the first sandbox Checkout Session and webhook ingestion path.", "Issue #99 owns the constrained order-bump checkout start.", "Issue #101 grants sandbox product entitlements from trusted paid webhook evidence.", "Issue #111 attaches public-safe referral click evidence to checkout intents.", "Issue #113 creates non-payable commission ledger evidence from checkout attribution.", "Issue #115 adds owner-gated commission review/reversal actions without payout mutation.", "Issue #117 records non-billing post-purchase upsell/downsell decisions after trusted checkout evidence."]',
  next_milestone = 'Add explicit post-purchase billing contracts only after decision evidence and owner review boundaries stay stable.',
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

UPDATE admin_roadmap_items
SET
  summary = 'Stripe-backed checkout flows, confirmed sandbox checkout start with a constrained order bump, optional referral-click attribution evidence, review-only commission ledger evidence, owner review/reversal actions, non-billing post-purchase upsell/downsell decision evidence, subscriptions, coupons, and audit trails.',
  public_evidence_json = '["Tracked by issue #15.", "Depends on Stripe architecture in #11.", "Issue #81 adds the first /offers/source-data contract and /offers/indie-launch-stack preview scaffold.", "Issue #99 adds confirmed sandbox checkout start support for the seeded primary offer plus pre-payment order bump.", "Issue #111 adds public-safe referral-click attribution evidence to checkout intent creation.", "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution.", "Issue #115 adds owner-gated review/reversal actions for commission evidence.", "Issue #117 records non-billing post-purchase upsell/downsell decisions from trusted checkout evidence."]',
  next_milestone = 'Add explicit post-purchase billing contracts and partner-facing reporting only after decision evidence and owner review boundaries stay stable.',
  updated_at = unixepoch()
WHERE id = 'roadmap-checkout-offers';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[11,34,15,16,81,99,101,111,113,115,117]',
  user_goal = 'Plan a checkout offer stack with a primary offer, order bump, post-purchase upsell, and downsell while seeing what is live, what is only decision evidence, and what remains billing-locked.',
  source_evidence_json = '["https://bumpgrade.com/offers/source-data","https://bumpgrade.com/offers/indie-launch-stack","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/api/commerce/post-purchase-decisions","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/products/source-data","https://github.com/markitics/bumpgrade/issues/11","https://github.com/markitics/bumpgrade/issues/34","https://github.com/markitics/bumpgrade/issues/15","https://github.com/markitics/bumpgrade/issues/16","https://github.com/markitics/bumpgrade/issues/81","https://github.com/markitics/bumpgrade/issues/99","https://github.com/markitics/bumpgrade/issues/101","https://github.com/markitics/bumpgrade/issues/111","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115","https://github.com/markitics/bumpgrade/issues/117"]',
  happy_path_json = '["Fetch /offers/source-data to inspect the seeded checkout stack.", "Start a sandbox checkout with the seeded primary offer and optional order bump.", "Use trusted checkout/webhook evidence to open the post-purchase decision path.", "Record a non-billing upsell or downsell follow-up decision with exact confirmation, idempotency, and checkout stale-state evidence.", "Read aggregate post-purchase decision counts from /offers/source-data or /commerce/source-data without exposing buyer, Stripe, entitlement, or private checkout data."]',
  edge_cases_json = '["Missing, untrusted, unpaid, stale, or unsupported checkout intents are rejected.", "Unsupported offer IDs, decision kinds, confirmation text, and idempotency keys return public-safe errors.", "Decision writes do not create Stripe charges, PaymentIntents, subscriptions, fulfillment, entitlements, payable commissions, payout state, tax records, partner notifications, or direct agent billing writes."]',
  agent_access = 'Agents can read checkout offer structure, post-purchase decision contracts, and aggregate decision counts. Direct agent billing writes, one-click upsell charges, fulfillment, entitlement grants, and price changes require future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers post-purchase page rendering, non-billing decision writes, idempotent replay, stale-state rejection, source-data aggregates, and no billing/fulfillment mutation.", "Issue #117 records the first post-purchase upsell/downsell decision evidence boundary."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-plans-first-checkout';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-buyer-chooses-post-purchase-offer',
  'Buyer chooses a post-purchase follow-up offer',
  'feature-checkout-offers',
  'pending',
  '[15,99,117]',
  'Buyer returning from a trusted sandbox checkout',
  'Accept or decline a time-boxed upsell/downsell follow-up without triggering a one-click charge.',
  '["https://bumpgrade.com/commerce/post-purchase/{checkoutIntentId}","https://bumpgrade.com/api/commerce/post-purchase-decisions","https://bumpgrade.com/offers/source-data","https://bumpgrade.com/commerce/source-data","https://github.com/markitics/bumpgrade/issues/15","https://github.com/markitics/bumpgrade/issues/99","https://github.com/markitics/bumpgrade/issues/117"]',
  '["Complete or simulate a trusted sandbox checkout intent.", "Open the post-purchase route for that checkout intent.", "Choose the launch accelerator upsell or decline it and choose the launch review downsell.", "The decision API records follow-up evidence only and returns a redacted public response.", "Source-data exposes aggregate decision counts."]',
  '["Checkout intents that are missing, stale, or not paid/completed cannot record decisions.", "Accepted follow-up decisions do not charge a card or grant access.", "Duplicate idempotency keys replay the same decision row.", "Raw Stripe IDs, buyer details, entitlement data, and private payment data stay out of public source-data."]',
  'Agents can inspect the decision contract and aggregate counts. Agents cannot create billing-impacting post-purchase charges in this slice.',
  '["Playwright covers post-purchase page rendering, accepted/declined decision writes, stale-state rejection, aggregate source-data, and no billing/fulfillment mutation."]',
  50,
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
