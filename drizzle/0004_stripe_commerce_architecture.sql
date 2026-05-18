CREATE TABLE IF NOT EXISTS commerce_products (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  fulfillment_kind TEXT NOT NULL DEFAULT 'manual',
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS commerce_products_slug_unique ON commerce_products(slug);
CREATE INDEX IF NOT EXISTS commerce_products_owner_status_idx ON commerce_products(owner_user_id, status);

CREATE TABLE IF NOT EXISTS commerce_prices (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES commerce_products(id) ON DELETE CASCADE,
  nickname TEXT,
  currency TEXT NOT NULL DEFAULT 'usd',
  unit_amount_cents INTEGER NOT NULL,
  billing_interval TEXT NOT NULL DEFAULT 'one_time',
  stripe_price_id TEXT,
  active INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS commerce_prices_stripe_price_unique ON commerce_prices(stripe_price_id);
CREATE INDEX IF NOT EXISTS commerce_prices_product_active_idx ON commerce_prices(product_id, active);

CREATE TABLE IF NOT EXISTS checkout_intents (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  checkout_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  product_id TEXT REFERENCES commerce_products(id) ON DELETE SET NULL,
  price_id TEXT REFERENCES commerce_prices(id) ON DELETE SET NULL,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  buyer_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  buyer_email TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_mode TEXT NOT NULL,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  success_url TEXT,
  cancel_url TEXT,
  confirmation_required INTEGER NOT NULL DEFAULT 1,
  confirmed_at INTEGER,
  audit_correlation_id TEXT,
  agent_client_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS checkout_intents_idempotency_unique ON checkout_intents(idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS checkout_intents_stripe_session_unique ON checkout_intents(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS checkout_intents_status_created_idx ON checkout_intents(status, created_at);
CREATE INDEX IF NOT EXISTS checkout_intents_product_created_idx ON checkout_intents(product_id, created_at);

CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  buyer_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  buyer_email TEXT,
  product_id TEXT REFERENCES commerce_products(id) ON DELETE SET NULL,
  price_id TEXT REFERENCES commerce_prices(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'incomplete',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT,
  current_period_start INTEGER,
  current_period_end INTEGER,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_subscriptions_stripe_subscription_unique ON billing_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS billing_subscriptions_buyer_status_idx ON billing_subscriptions(buyer_user_id, status);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  api_version TEXT,
  livemode INTEGER NOT NULL DEFAULT 0,
  stripe_created_at INTEGER,
  status TEXT NOT NULL DEFAULT 'processed',
  payload_redacted_json TEXT,
  error TEXT,
  processed_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS stripe_webhook_events_type_processed_idx ON stripe_webhook_events(event_type, processed_at);

CREATE TABLE IF NOT EXISTS payment_audit_events (
  id TEXT PRIMARY KEY,
  checkout_intent_id TEXT REFERENCES checkout_intents(id) ON DELETE SET NULL,
  stripe_event_id TEXT REFERENCES stripe_webhook_events(id) ON DELETE SET NULL,
  event_kind TEXT NOT NULL,
  actor_kind TEXT NOT NULL,
  actor_id TEXT,
  summary TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS payment_audit_events_checkout_created_idx ON payment_audit_events(checkout_intent_id, created_at);

UPDATE admin_roadmap_items
SET
  status = 'live',
  summary = 'Stripe mode-specific secrets are stored in Cloudflare, Checkout Sessions are the first payment surface, and D1 commerce/audit tables are defined before live payment code.',
  public_evidence_json = '["Issue #11 owns this Stripe architecture slice.", "Cloudflare stores mode-specific Stripe secret names without repo secret values.", "D1 tables define products, prices, checkout intents, subscriptions, webhook idempotency, and payment audit events.", "Issue #34 owns the first sandbox checkout and webhook implementation."]',
  next_milestone = 'Build sandbox-only Checkout Session and webhook ingestion path in #34 before enabling live payments.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

UPDATE admin_roadmap_items
SET
  next_milestone = 'Use the #11 commerce tables and #34 sandbox checkout route before adding order bumps, upsells, or downsells.',
  updated_at = unixepoch()
WHERE id = 'roadmap-checkout-offers';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES
  (
    'journey-publisher-plans-first-checkout',
    'Publisher plans the first paid offer',
    'feature-stripe-commerce',
    'live',
    '[11,34,15,16]',
    'Publisher preparing to sell a digital offer',
    'Understand what Bumpgrade must know before it can create a Stripe checkout session safely.',
    '["https://bumpgrade.com/features", "https://bumpgrade.com/roadmap", "https://github.com/markitics/bumpgrade/issues/11", "https://github.com/markitics/bumpgrade/issues/34"]',
    '["Create or identify a commerce product record.", "Attach a price record with currency, amount, interval, and optional Stripe Price id.", "Create a checkout intent with an idempotency key and audit correlation id.", "Use sandbox Stripe Checkout first.", "Let the webhook update intent, subscription, and audit state before public fulfillment is trusted."]',
    '["Live mode is not the default; live rollout needs an explicit later issue.", "Agent-started checkout requires exact confirmation and an audit record before Stripe is called.", "Webhook payloads must be redacted before model-readable surfaces expose them.", "Raw card data never enters Bumpgrade."]',
    'Agents may read the architecture, product, price, checkout-intent, and redacted webhook records once exposed. Agents must not create checkout sessions without confirmed-write rules, idempotency, audit correlation, and stale-state checks.',
    '["Issue #11 defines the D1 data model and secret plan.", "Issue #34 tracks the first sandbox route and webhook ingestion implementation."]',
    45,
    unixepoch()
  )
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
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
