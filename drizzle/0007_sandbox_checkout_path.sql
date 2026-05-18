INSERT INTO commerce_products (
  id, slug, name, kind, status, description, fulfillment_kind, metadata_json, created_at, updated_at
) VALUES (
  'product-bumpgrade-sandbox-launch-pass',
  'sandbox-launch-pass',
  'Bumpgrade sandbox launch pass',
  'digital_offer',
  'sandbox',
  'One-time sandbox checkout offer for proving Checkout Sessions, D1 checkout intents, webhook ingestion, and redacted audit records before live billing is enabled.',
  'manual',
  '{"issue":34,"public":true,"sandbox":true}',
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  slug=excluded.slug,
  name=excluded.name,
  kind=excluded.kind,
  status=excluded.status,
  description=excluded.description,
  fulfillment_kind=excluded.fulfillment_kind,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

INSERT INTO commerce_prices (
  id, product_id, nickname, currency, unit_amount_cents, billing_interval, stripe_price_id, active, metadata_json, created_at, updated_at
) VALUES (
  'price-bumpgrade-sandbox-launch-pass-usd',
  'product-bumpgrade-sandbox-launch-pass',
  'Sandbox launch pass',
  'usd',
  900,
  'one_time',
  NULL,
  1,
  '{"issue":34,"checkout_surface":"sandbox","uses_inline_price_data":true}',
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  product_id=excluded.product_id,
  nickname=excluded.nickname,
  currency=excluded.currency,
  unit_amount_cents=excluded.unit_amount_cents,
  billing_interval=excluded.billing_interval,
  stripe_price_id=excluded.stripe_price_id,
  active=excluded.active,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  summary = 'Stripe mode-specific secrets are stored in Cloudflare, Checkout Sessions are the first payment surface, D1 commerce/audit tables are defined, and the first sandbox checkout API/webhook path is implemented.',
  public_evidence_json = '["Issue #11 owns the Stripe architecture slice.", "Issue #34 owns the first sandbox Checkout Session and webhook ingestion path.", "D1 stores a sandbox product, price, checkout intents, webhook idempotency, and redacted audit records.", "The checkout API returns preview data when sandbox secrets are missing or incomplete."]',
  next_milestone = 'Configure a valid Bumpgrade-specific sandbox webhook secret and expand from the test offer into the checkout/offers MVP in #15.',
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

UPDATE admin_roadmap_items
SET
  next_milestone = 'Build order bumps, upsells, and downsells on top of the #34 sandbox checkout route and D1 intent/audit records.',
  updated_at = unixepoch()
WHERE id = 'roadmap-checkout-offers';

UPDATE admin_user_journeys
SET
  happy_path_json = '["Open the sandbox checkout API contract.", "Read the seeded sandbox product and price.", "Create a checkout intent with an idempotency key, confirmation text, and audit correlation id.", "Use sandbox Stripe Checkout when a valid sandbox key is configured; otherwise receive a safe preview response.", "Let the webhook store an idempotent redacted event before fulfillment is trusted."]',
  edge_cases_json = '["Live mode is not enabled; live rollout needs an explicit later issue.", "Agent-started checkout requires exact confirmation and an audit record before Stripe is called.", "Webhook payloads must be redacted before model-readable surfaces expose them.", "Raw Stripe IDs are stored server-side only and are not returned by source-data routes.", "Raw card data never enters Bumpgrade."]',
  validation_json = '["Issue #11 defines the D1 data model and secret plan.", "Issue #34 adds the sandbox checkout route, safe preview path, redirect wrapper, webhook ingestion route, and tests."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-plans-first-checkout';
