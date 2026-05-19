INSERT INTO commerce_products (
  id, slug, name, kind, status, description, fulfillment_kind, metadata_json, created_at, updated_at
) VALUES (
  'product-launch-checklist-bump',
  'launch-checklist-bump',
  'Launch checklist bump',
  'digital_download',
  'sandbox',
  'A sandbox pre-payment order bump used to prove Bumpgrade can attach a constrained add-on to the primary Checkout Session.',
  'manual',
  '{"issue":99,"public":true,"sandbox":true,"offer_kind":"order_bump"}',
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
  'price-launch-checklist-bump-usd',
  'product-launch-checklist-bump',
  'Launch checklist bump',
  'usd',
  1900,
  'one_time',
  NULL,
  1,
  '{"issue":99,"checkout_surface":"sandbox","uses_inline_price_data":true,"offer_kind":"order_bump"}',
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
  summary = 'Stripe-backed checkout flows, confirmed sandbox checkout start with a constrained order bump, read-only upsell/downsell path, subscriptions, coupons, and audit trails.',
  public_evidence_json = '["Issue #15 owns the checkout, order bump, upsell, and downsell MVP.", "Issue #81 adds the first /offers/source-data contract and /offers/indie-launch-stack preview scaffold.", "Issue #34 provides the existing sandbox Checkout Session and webhook path.", "Issue #99 adds a confirmed sandbox checkout start path that can attach the seeded pre-payment order bump while preserving exact confirmation, idempotency, redaction, and audit metadata."]',
  next_milestone = 'Add post-purchase upsell/downsell decision surfaces and webhook-backed fulfillment state after the order-bump checkout start is verified.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-checkout-offers';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-previews-checkout-offer-stack',
  'Publisher previews and starts a sandbox checkout bump stack',
  'feature-checkout-offers',
  'pending',
  '[15,81,99]',
  'Publisher or agent planning checkout revenue lifts',
  'Inspect the primary offer, choose the seeded order bump, and start a confirmed sandbox Checkout Session without enabling live billing.',
  '["https://bumpgrade.com/offers/source-data","https://bumpgrade.com/offers/indie-launch-stack","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/commerce/source-data","https://github.com/markitics/bumpgrade/issues/15","https://github.com/markitics/bumpgrade/issues/81","https://github.com/markitics/bumpgrade/issues/99"]',
  '["Open /offers/indie-launch-stack.","Review the primary sandbox launch pass and launch checklist order bump.","Choose the order bump, enter the exact confirmation text, and submit the sandbox checkout start form.","In test or incomplete-secret environments, receive a redacted preview response.","In production sandbox mode with valid secrets, receive a Bumpgrade redirect URL for the Checkout Session rather than a raw Stripe URL."]',
  '["Live billing mode remains disabled.","Only the seeded order bump can be attached in this slice.","One-click upsell/downsell charging, fulfillment, refund, coupon, and customer portal writes require later confirmed-write APIs.","Raw Stripe identifiers and private buyer data stay server-private."]',
  'Agents can read /offers/source-data and the preview route, and can inspect the confirmed-write checkout boundary. Agents must not create or mutate checkout sessions without exact confirmation, idempotency, stale-state checks, audit correlation, redaction, and webhook evidence.',
  '["Playwright covers /offers/source-data, /offers/indie-launch-stack, the order-bump form preview response, sitemap discovery, and agent manifest read-contract discovery.","Issue #99 records the confirmed sandbox checkout start plus constrained order-bump support."]',
  48,
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
