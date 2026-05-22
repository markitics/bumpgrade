INSERT INTO commerce_products (
  id, slug, name, kind, status, description, fulfillment_kind, metadata_json, created_at, updated_at
) VALUES
  (
    'product-bumpgrade-experiment',
    'bumpgrade-experiment',
    'Bumpgrade Experiment',
    'membership_subscription',
    'live',
    'Self-serve Bumpgrade plan for publishers starting one serious offer with funnels, checkout, products, audience workflows, analytics, and AI launch context.',
    'membership',
    '{"issue":316,"pricing_surface":"self_serve","rawStripeIdsIncluded":false}',
    unixepoch(),
    unixepoch()
  ),
  (
    'product-bumpgrade-grow',
    'bumpgrade-grow',
    'Bumpgrade Grow',
    'membership_subscription',
    'live',
    'Self-serve Bumpgrade plan for publishers who need custom-domain onboarding, affiliates, richer automation, experiments, and advanced launch evidence.',
    'membership',
    '{"issue":316,"pricing_surface":"self_serve","rawStripeIdsIncluded":false}',
    unixepoch(),
    unixepoch()
  ),
  (
    'product-bumpgrade-white-glove-setup',
    'bumpgrade-white-glove-setup',
    'Bumpgrade White glove setup',
    'implementation_service',
    'live',
    'Optional one-time setup support paired with humans to help a publisher set up and scale with confidence.',
    'manual',
    '{"issue":316,"pricing_surface":"self_serve","one_time_addon":true,"rawStripeIdsIncluded":false}',
    unixepoch(),
    unixepoch()
  )
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  name = excluded.name,
  kind = excluded.kind,
  status = excluded.status,
  description = excluded.description,
  fulfillment_kind = excluded.fulfillment_kind,
  metadata_json = excluded.metadata_json,
  updated_at = unixepoch();

INSERT INTO commerce_prices (
  id, product_id, nickname, currency, unit_amount_cents, billing_interval, stripe_price_id, active, metadata_json, created_at, updated_at
) VALUES
  (
    'price-bumpgrade-experiment-monthly-usd',
    'product-bumpgrade-experiment',
    'Experiment monthly',
    'usd',
    9700,
    'month',
    NULL,
    1,
    '{"issue":316,"pricing_surface":"self_serve","uses_inline_price_data":true,"rawStripeIdsIncluded":false}',
    unixepoch(),
    unixepoch()
  ),
  (
    'price-bumpgrade-grow-monthly-usd',
    'product-bumpgrade-grow',
    'Grow monthly',
    'usd',
    19700,
    'month',
    NULL,
    1,
    '{"issue":316,"pricing_surface":"self_serve","uses_inline_price_data":true,"rawStripeIdsIncluded":false}',
    unixepoch(),
    unixepoch()
  ),
  (
    'price-bumpgrade-white-glove-setup-usd',
    'product-bumpgrade-white-glove-setup',
    'White glove setup',
    'usd',
    100000,
    'one_time',
    NULL,
    1,
    '{"issue":316,"pricing_surface":"self_serve","uses_inline_price_data":true,"one_time_addon":true,"rawStripeIdsIncluded":false}',
    unixepoch(),
    unixepoch()
  )
ON CONFLICT(id) DO UPDATE SET
  product_id = excluded.product_id,
  nickname = excluded.nickname,
  currency = excluded.currency,
  unit_amount_cents = excluded.unit_amount_cents,
  billing_interval = excluded.billing_interval,
  stripe_price_id = excluded.stripe_price_id,
  active = excluded.active,
  metadata_json = excluded.metadata_json,
  updated_at = unixepoch();

UPDATE admin_roadmap_items
SET
  summary = 'Users, developers and agents, resources, self-serve pricing, pricing-v2, metadata, sitemap entries, and /content/source-data contract.',
  public_evidence_json = '["Tracked by issue #20.","/users, /developers-and-agents, /resources, /pricing, and /pricing-v2 are public destinations.","/pricing offers self-serve Experiment and Grow subscriptions plus a White glove setup add-on.","/content/source-data exposes stable audience, resource, pricing, and signup-policy records for agents.","Issue #316 moves pricing from launch conversation copy to a self-serve Stripe Checkout path."]',
  next_milestone = 'Promote planned migration guides, launch playbooks, and blog posts into dedicated pages as funnel, checkout, automation, and analytics slices ship.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-marketing-surfaces';

UPDATE admin_roadmap_items
SET
  summary = 'Stripe architecture, secret mapping, D1 commerce schema, billing-safe agent contract, live self-serve Bumpgrade subscription checkout, sandbox publisher-offer checkout, webhooks, and audit trails.',
  public_evidence_json = CASE
    WHEN instr(public_evidence_json, 'issues/316') > 0 THEN public_evidence_json
    ELSE substr(public_evidence_json, 1, length(public_evidence_json) - 1) || ',"Issue #316 adds live self-serve Bumpgrade plan checkout for Experiment, Grow, and optional White glove setup."]'
  END,
  next_milestone = 'Add live webhook signing secret handling and customer portal/self-service subscription management before claiming renewal and cancellation automation.',
  mark_attention = 'Cloudflare secret inventory includes the live Stripe secret but not a live webhook signing secret, so the first self-serve activation verifies Checkout Session success server-side on /pricing/success.',
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user,
  user_goal, source_evidence_json, happy_path_json, edge_cases_json,
  agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-prospect-reviews-launch-pricing',
  'Prospect chooses a Bumpgrade plan and starts checkout',
  'feature-resources-use-cases-pricing',
  'live',
  '[20,46,217,222,223,225,226,234,316,317]',
  'Publisher ready to start a Bumpgrade workspace',
  'Understand the Experiment, Grow, Enterprise, and White glove setup options, then start self-serve Stripe Checkout for the plan that fits today.',
  '["https://bumpgrade.com/pricing","https://bumpgrade.com/pricing-v2","https://bumpgrade.com/api/billing/checkout","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/account/setup","https://github.com/markitics/bumpgrade/issues/316","https://github.com/markitics/bumpgrade/issues/317"]',
  '["Open /pricing.","Compare Experiment, Grow, and Enterprise.","Optionally add White glove setup to Experiment or Grow.","Submit the plan form and continue through Stripe Checkout.","After Stripe success, return to /pricing/success and continue to /account/setup with the same email."]',
  '["Enterprise is a contact path, not self-serve checkout.","/pricing-v2 is an alternate usage-based draft and is not the default pricing model.","Successful Checkout Sessions are verified server-side before a publisher plan entitlement is activated.","Customer-facing checkout for a publisher offer remains separate from the Bumpgrade account subscription path.","The live webhook signing secret is still an operational follow-up for renewal and cancellation automation."]',
  'Agents can read /pricing, /pricing-v2, /api/billing/checkout, /content/source-data, and /commerce/source-data. Billing-impacting writes still require confirmed user action, idempotency, audit correlation, redaction, and server-side Stripe verification.',
  '["Issue #316 adds Experiment, Grow, Enterprise, White glove setup, /api/billing/checkout, /pricing/success, and seeded D1 product/price records.","Issue #317 adds the public /pricing-v2 usage-based draft.","Playwright covers /pricing, /pricing-v2, /api/billing/checkout, /content/source-data, and /commerce/source-data."]',
  43,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  feature_id = excluded.feature_id,
  feature_status = excluded.feature_status,
  issue_numbers_json = excluded.issue_numbers_json,
  primary_user = excluded.primary_user,
  user_goal = excluded.user_goal,
  source_evidence_json = excluded.source_evidence_json,
  happy_path_json = excluded.happy_path_json,
  edge_cases_json = excluded.edge_cases_json,
  agent_access = excluded.agent_access,
  validation_json = excluded.validation_json,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-22-self-serve-pricing',
  'Built self-serve Bumpgrade pricing and checkout start',
  'Codex',
  'codex',
  'bumpgrade-self-serve-pricing',
  'Mark asked for people to be able to sign up today with Experiment, Grow, Enterprise, an optional White glove setup add-on, and a pricing-v2 usage model draft.',
  '[{"number":316,"url":"https://github.com/markitics/bumpgrade/issues/316"},{"number":317,"url":"https://github.com/markitics/bumpgrade/issues/317"}]',
  '[]',
  '["https://bumpgrade.com/pricing","https://bumpgrade.com/pricing-v2","https://bumpgrade.com/api/billing/checkout","https://bumpgrade.com/pricing/success","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/content/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/payments.md","docs/features/content-surfaces.md","docs/features/publisher-tenants.md"]',
  '["npm run lint","npm run typecheck","npm run test:runtime-secrets","npm run cf:build","Focused Playwright pricing and source-data smoke tests"]',
  'Cloudflare secret inventory includes STRIPE_SECRET_KEY_LIVE, but STRIPE_WEBHOOK_SECRET_LIVE is not listed. The initial entitlement path verifies Stripe Checkout Session success directly on /pricing/success; webhook-backed renewal/cancellation automation remains a follow-up.',
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/pricing","https://bumpgrade.com/pricing-v2","https://bumpgrade.com/api/billing/checkout","https://bumpgrade.com/commerce/source-data"]',
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  github_issues_json = excluded.github_issues_json,
  closed_prs_json = excluded.closed_prs_json,
  features_updated_json = excluded.features_updated_json,
  roadmap_updated_json = excluded.roadmap_updated_json,
  user_journeys_updated_json = excluded.user_journeys_updated_json,
  documentation_updated_json = excluded.documentation_updated_json,
  validation_json = excluded.validation_json,
  flags_attention = excluded.flags_attention,
  completed_at = excluded.completed_at,
  relevant_urls_json = excluded.relevant_urls_json,
  pr_comment_url = excluded.pr_comment_url,
  updated_at = excluded.updated_at;
