INSERT INTO commerce_products (
  id, slug, name, kind, status, description, fulfillment_kind, metadata_json, created_at, updated_at
) VALUES (
  'product-bumpgrade-launch-membership',
  'launch-membership-monthly',
  'Bumpgrade launch membership',
  'membership_subscription',
  'sandbox_live',
  'Monthly membership fixture used to prove Stripe Billing subscription-backed access state before Customer Portal or live fulfillment ships.',
  'membership',
  '{"issue":187,"rawStripeIdsIncluded":false,"customerPortalUrlIncluded":false}',
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
  updated_at=unixepoch();

INSERT INTO commerce_prices (
  id, product_id, nickname, currency, unit_amount_cents, billing_interval, stripe_price_id, active, metadata_json, created_at, updated_at
) VALUES (
  'price-launch-membership-monthly-usd',
  'product-bumpgrade-launch-membership',
  'Launch membership monthly',
  'usd',
  2900,
  'month',
  NULL,
  1,
  '{"issue":187,"stripePriceIdIncluded":false,"usesStripeBilling":true}',
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  product_id=excluded.product_id,
  nickname=excluded.nickname,
  currency=excluded.currency,
  unit_amount_cents=excluded.unit_amount_cents,
  billing_interval=excluded.billing_interval,
  active=excluded.active,
  metadata_json=excluded.metadata_json,
  updated_at=unixepoch();

UPDATE admin_roadmap_items
SET
  summary = 'Digital product records, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, private R2-backed fixture delivery with redemption revalidation, owner-confirmed private asset upload intents, non-destructive revocation intent readiness, protected content readiness, checkout-intent-scoped protected fixture delivery, subscription-backed membership access, fulfillment task evidence, access rules, and subscriptions.',
  public_evidence_json = CASE
    WHEN instr(public_evidence_json, 'issues/187') > 0 THEN public_evidence_json
    ELSE substr(public_evidence_json, 1, length(public_evidence_json) - 1) || ',"Issue #187 syncs checkout-linked membership access from trusted Stripe Billing subscription state."]'
  END,
  next_milestone = 'Extend beyond seeded subscription membership fixtures only after Customer Portal/self-service management, private member storage, and access-change audit records stay enforced.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = CASE
    WHEN instr(issue_numbers_json, '187') > 0 THEN issue_numbers_json
    ELSE replace(issue_numbers_json, '185]', '185,187]')
  END,
  source_evidence_json = CASE
    WHEN instr(source_evidence_json, 'issues/187') > 0 THEN source_evidence_json
    ELSE substr(source_evidence_json, 1, length(source_evidence_json) - 1) || ',"https://github.com/markitics/bumpgrade/issues/187"]'
  END,
  happy_path_json = CASE
    WHEN instr(happy_path_json, 'Stripe Billing subscription state') > 0 THEN happy_path_json
    ELSE substr(happy_path_json, 1, length(happy_path_json) - 1) || ',"Receive trusted Stripe Billing subscription state and sync checkout-linked membership entitlement access while the subscription is active or trialing."]'
  END,
  edge_cases_json = CASE
    WHEN instr(edge_cases_json, 'Customer Portal actions') > 0 THEN edge_cases_json
    ELSE substr(edge_cases_json, 1, length(edge_cases_json) - 1) || ',"Canceled, unpaid, incomplete_expired, or deleted subscriptions pause membership access without exposing raw subscription/customer IDs, Customer Portal URLs, member posts, private files, or progress rows."]'
  END,
  agent_access = agent_access || ' Issue #187 adds a public-safe subscription-backed membership access contract; agents can inspect active/inactive membership state from checkout-linked Billing evidence but cannot mutate subscriptions, create Customer Portal sessions, or expose raw Stripe subscription/customer IDs.',
  validation_json = CASE
    WHEN instr(validation_json, 'Issue #187') > 0 THEN validation_json
    ELSE substr(validation_json, 1, length(validation_json) - 1) || ',"Issue #187 records the first subscription-backed membership entitlement path."]'
  END,
  updated_at = unixepoch()
WHERE id IN (
  'journey-publisher-previews-product-access',
  'journey-publisher-verifies-sandbox-entitlement-grant'
);
