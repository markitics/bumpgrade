UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Stripe-backed checkout flows, read-only offer-stack contract, order bumps, upsells, downsells, subscriptions, coupons, and audit trails.',
  public_evidence_json = '["Issue #15 owns the checkout, order bump, upsell, and downsell MVP.", "Issue #81 adds the first /offers/source-data contract and /offers/indie-launch-stack preview scaffold.", "Issue #34 provides the existing sandbox Checkout Session and webhook path."]',
  next_milestone = 'Build the first confirmed sandbox checkout flow that can include an approved order bump while preserving billing audit evidence.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-checkout-offers';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-previews-checkout-offer-stack',
  'Publisher previews checkout bump and upsell stack',
  'feature-checkout-offers',
  'pending',
  '[15,81]',
  'Publisher or agent planning checkout revenue lifts',
  'Inspect the primary offer, order bump, upsell, and downsell path before billing writes are enabled.',
  '["https://bumpgrade.com/offers/source-data","https://bumpgrade.com/offers/indie-launch-stack","https://bumpgrade.com/commerce/source-data","https://github.com/markitics/bumpgrade/issues/15","https://github.com/markitics/bumpgrade/issues/81"]',
  '["Fetch /offers/source-data.","Find the seeded checkout stack, revision ID, primary offer, order bump, upsell, downsell, and write boundary.","Open /offers/indie-launch-stack to inspect the public preview.","Use /commerce/source-data to confirm sandbox checkout and webhook rules before assuming a billing path exists."]',
  '["The seeded checkout offer stack is read-only and not a live checkout builder.","Order bump mutation, one-click upsell charging, fulfillment, and live billing require future confirmed-write APIs.","Raw Stripe identifiers and private buyer data stay server-private."]',
  'Agents can read /offers/source-data and the preview route. Checkout-offer writes require actor identity, exact confirmation, idempotency, stale-state checks, audit correlation, redaction, and webhook evidence in a later API.',
  '["Playwright covers /offers/source-data, /offers/indie-launch-stack, sitemap discovery, and agent manifest read-contract discovery.","Issue #81 records the first checkout-offer source-data contract and preview scaffold."]',
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
