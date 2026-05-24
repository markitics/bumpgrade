UPDATE admin_roadmap_items
SET
  summary = 'Digital product records, seeded payment-plan read records, owner-created product test checkout links, owner product delivery-gate links, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, private R2-backed fixture delivery with redemption revalidation, owner-confirmed private asset upload intents, owner-confirmed non-destructive revocation intents, protected content readiness, checkout-intent-scoped protected fixture delivery, subscription-backed membership access, fulfillment task evidence, access rules, and subscriptions.',
  public_evidence_json = json_array(
    'Tracked by issue #16.',
    'Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold.',
    'Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.',
    'Issue #139 adds /admin/products owner entitlement inspection and aggregate public redaction flags.',
    'Issue #141 adds /products/entitlements and /api/products/entitlements for customer-safe checkout intent entitlement lookup.',
    'Issue #143 adds one-use download tokens for active file entitlements without exposing private R2 keys or signed object URLs.',
    'Issue #146 streams a seeded private R2-backed fixture through Bumpgrade without exposing private object keys.',
    'Issue #147 revalidates current entitlement and trusted checkout state before redemption.',
    'Issue #151 adds owner-confirmed private product asset upload records.',
    'Issue #179 adds owner-visible revocation intent readiness without destructive entitlement mutation.',
    'Issue #181 adds protected content readiness metadata.',
    'Issue #185 adds checkout-intent-scoped protected fixture delivery.',
    'Issue #187 syncs checkout-linked membership access from trusted Stripe Billing subscription state.',
    'Issue #251 adds owner-confirmed non-destructive revocation intent records with exact confirmation, idempotency, stale-state checks, and public redaction.',
    'Issue #403 adds owner-confirmed draft product creation records without Stripe product/price creation or fulfillment mutation.',
    'Issue #405 adds owner-confirmed test offer/funnel links and direct test access grants for owner-created products.',
    'Issue #407 adds owner-confirmed buyer-facing test checkout links and public test checkout completion for owner-created products without Stripe Checkout Sessions, live charges, or public buyer exposure.',
    'Issue #409 links owner-created product test checkout links to the seeded offer/funnel delivery gates with stale-state checks and aggregate public redaction.',
    'Issue #16 exposes seeded pay-in-full, installment, and subscription payment-plan read records without live amounts, Stripe Price creation, Checkout Sessions, or customer data exposure.'
  ),
  next_milestone = 'Keep payment plans as read records until the first live package, amount, Stripe price policy, and webhook boundary are confirmed in issue #219.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_array(16,83,101,139,141,143,146,147,151,179,181,185,187,251,403,405,407,409),
  source_evidence_json = json_array(
    'https://bumpgrade.com/products/source-data',
    'https://bumpgrade.com/products/indie-launch-library',
    'https://bumpgrade.com/products/entitlements',
    'https://bumpgrade.com/api/products/entitlements',
    'https://bumpgrade.com/api/products/test-checkout',
    'https://bumpgrade.com/api/products/download-tokens',
    'https://bumpgrade.com/api/products/protected-content',
    'https://bumpgrade.com/api/admin/products/catalog',
    'https://bumpgrade.com/api/admin/products/test-checkout-links',
    'https://bumpgrade.com/api/admin/products/delivery-gates',
    'https://bumpgrade.com/api/admin/products/offer-access-grants',
    'https://bumpgrade.com/api/admin/products/assets',
    'https://bumpgrade.com/api/admin/products/revocation-intents',
    'https://bumpgrade.com/admin/products',
    'https://bumpgrade.com/offers/source-data',
    'https://bumpgrade.com/funnels/source-data',
    'https://github.com/markitics/bumpgrade/issues/16',
    'https://github.com/markitics/bumpgrade/issues/219',
    'https://github.com/markitics/bumpgrade/issues/409'
  ),
  user_goal = 'Inspect products, payment-plan read records, draft product creation, buyer-facing test checkout links, delivery-gate links, public test checkout evidence, assets, access rules, entitlement templates, sandbox entitlement grant mappings, subscription-backed membership access, owner entitlement rows, owner-confirmed revocation intents, and protected fixture delivery checks before live billing or private content storage is enabled.',
  happy_path_json = json_array(
    'Fetch /products/source-data.',
    'Find seeded product types, seeded pay-in-full, installment, and subscription payment-plan records, owner product creation contract, owner product test checkout link contract, owner product delivery-gate contract, owner product offer/access test grant contract, asset IDs, access rules, entitlement templates, sandbox grant mappings, subscription membership access contract, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, owner-confirmed revocation intent contract, protected content readiness, protected fixture delivery contract, revision ID, and write boundary.',
    'Open /products/indie-launch-library to inspect the public preview and payment-plan cards.',
    'Open /admin/products as a verified owner to create a draft product record, create a buyer-facing test checkout link after a current product updatedAt check, link that checkout link to the seeded offer/funnel delivery gates after a current checkout-link revision check, and inspect private buyer entitlement rows, checkout state, product and price context, queued fulfillment evidence, revocation intent records, and protected content readiness.',
    'Use /offers/source-data, /funnels/source-data, and /commerce/source-data to confirm checkout, funnel, delivery-gate, and webhook dependencies before assuming live billing or fulfillment exists.'
  ),
  edge_cases_json = json_array(
    'Payment-plan records are public-safe seeded read records only and do not create live Stripe Prices, Checkout Sessions, installment schedules, charges, customer records, or portal sessions.',
    'Owner-created draft products do not create Stripe products or prices.',
    'Owner-created product test checkout links create only a test price record and public test checkout route; they do not create live offer copy or publish funnels.',
    'Owner product delivery-gate links connect a test checkout link to the seeded offer/funnel path only; they do not create Stripe Checkout Sessions, live charges, live published offer/funnel state, signed URLs, private R2 keys, or arbitrary customer delivery.',
    'Public /products/source-data exposes aggregate product creation, test checkout link, delivery-gate, test grant, and seeded payment-plan records plus redaction flags, not owner emails, actor user IDs, buyer emails, buyer hashes, checkout link IDs, checkout intent IDs, entitlement IDs, idempotency keys, metadata JSON, raw Stripe IDs, raw Stripe Price IDs, or live amounts.',
    'Signed object URLs, real protected media, destructive revocation, customer delivery of arbitrary uploads, Customer Portal actions, live Stripe Checkout Sessions, live payment-plan checkout, live charges, and live fulfillment automation require future APIs.'
  ),
  agent_access = 'Agents can read /products/source-data, /offers/source-data, /funnels/source-data, seeded payment-plan read records, aggregate product creation counts, aggregate owner-created product test checkout counts, aggregate owner product delivery-gate counts, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, the owner-authenticated private asset upload intent boundary, owner-confirmed non-destructive revocation intent evidence, protected content readiness, protected fixture delivery checks, and subscription-backed membership access state. Payment-plan records expose stable IDs and billing-model semantics only; live amounts, Stripe Price creation, Checkout Sessions, customer records, and Customer Portal actions require future confirmed-write APIs.',
  validation_json = json_array(
    'Playwright covers /products/source-data payment-plan read records, payment-plan preview cards, product creation contract redaction, owner draft product creation, owner-created product test checkout link contract redaction, owner product delivery-gate contract redaction, customer /products/entitlements lookup, owner /admin/products inspection, revocation intent readiness, protected content readiness, sitemap discovery, and agent manifest read-contract discovery.',
    'Issue #16 records seeded payment-plan read semantics without live billing mutation.',
    'Issue #409 records owner-created product delivery-gate link evidence.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-product-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_array(16,83,99,101,139,141,143,146,147,151,179,181,185,187,251,403,405,407,409),
  source_evidence_json = json_array(
    'https://bumpgrade.com/products/source-data',
    'https://bumpgrade.com/products/entitlements',
    'https://bumpgrade.com/api/products/entitlements',
    'https://bumpgrade.com/api/products/test-checkout',
    'https://bumpgrade.com/api/products/download-tokens',
    'https://bumpgrade.com/api/products/protected-content',
    'https://bumpgrade.com/api/admin/products/catalog',
    'https://bumpgrade.com/api/admin/products/test-checkout-links',
    'https://bumpgrade.com/api/admin/products/delivery-gates',
    'https://bumpgrade.com/api/admin/products/offer-access-grants',
    'https://bumpgrade.com/api/admin/products/assets',
    'https://bumpgrade.com/api/admin/products/revocation-intents',
    'https://bumpgrade.com/admin/products',
    'https://bumpgrade.com/commerce/source-data',
    'https://bumpgrade.com/offers/source-data',
    'https://bumpgrade.com/funnels/source-data',
    'https://github.com/markitics/bumpgrade/issues/16',
    'https://github.com/markitics/bumpgrade/issues/219',
    'https://github.com/markitics/bumpgrade/issues/409'
  ),
  user_goal = 'Confirm that paid sandbox checkout webhooks can grant product entitlements, trusted Stripe Billing state can sync membership access, seeded payment-plan records describe billing semantics without live billing mutation, owner-created draft products can produce buyer-facing test checkout links, delivery-gate links, and access grant evidence, queued fulfillment evidence stays public-safe, owner-confirmed revocation intent records stay non-destructive, and protected fixtures return only for active eligible checkout-linked entitlements.',
  happy_path_json = json_array(
    'Fetch /products/source-data and confirm seeded payment-plan records expose stable productPaymentPlanId values, product IDs, billing models, null live amounts, and redaction flags.',
    'Create a draft product record as a verified owner without billing or fulfillment mutation.',
    'Create a buyer-facing test checkout link for the owner-created product after exact confirmation, idempotency, and a current product updatedAt check.',
    'Link that checkout link to the seeded offer/funnel delivery gates after exact confirmation, idempotency, a current product updatedAt check, and a current checkout-link revision check.',
    'Complete the public test checkout after exact confirmation, idempotency, and a current link revision check.',
    'Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.',
    'Open /admin/products as a verified owner to inspect draft products, test checkout links, delivery-gate links, entitlement rows, queued fulfillment evidence, revocation intents, and protected content readiness.'
  ),
  edge_cases_json = json_array(
    'Payment-plan records do not create Stripe Prices, Checkout Sessions, live charges, installment schedules, customer records, Customer Portal sessions, or access grants.',
    'Duplicate draft product creation idempotency keys replay only identical requests.',
    'Duplicate owner-created product test checkout link idempotency keys replay only identical requests.',
    'Duplicate owner product delivery-gate idempotency keys replay only identical requests.',
    'Public test checkout completion rejects stale link revisions and conflicting idempotency replays.',
    'Public /products/source-data exposes seeded payment-plan records and aggregate counts, not raw buyer rows, owner identity, checkout link IDs, checkout IDs, entitlement IDs, idempotency keys, raw Stripe Price IDs, or live amounts.',
    'Raw Stripe identifiers and buyer email remain server-private.'
  ),
  agent_access = 'Agents can read /products/source-data, /offers/source-data, /funnels/source-data, seeded payment-plan read records, /api/products/entitlements, /api/products/test-checkout, /api/products/download-tokens, /api/products/protected-content, and /commerce/source-data to understand billing-model semantics, draft product creation, owner-created product test checkout, owner-created product delivery-gate link, entitlement grant, customer-safe lookup, short-lived private R2-backed fixture delivery, owner-upload intent, owner-confirmed non-destructive revocation intent, protected content, subscription-backed membership access, and aggregate inspection boundaries. Agents cannot grant live access, create live payment-plan checkout, destructively revoke, expose private buyer data, deliver arbitrary protected bodies, deliver arbitrary uploads to customers, create Stripe products or prices, mutate subscriptions, publish live offer/funnel changes, create Customer Portal sessions, or issue signed object URLs without future authenticated confirmed-write APIs.',
  validation_json = json_array(
    'Playwright covers source-data payment-plan output, payment-plan preview cards, product creation contract redaction, owner draft product creation, owner-created product test checkout link contract redaction, owner product delivery-gate contract redaction, public test checkout completion, duplicate handling, aggregate redaction, customer-safe lookup, private R2-backed token delivery, protected fixture delivery, subscription-backed membership access, owner private asset upload intent creation, owner-confirmed non-destructive revocation intent creation, owner /admin/products inspection, revocation intent readiness, protected content readiness, and duplicate webhook idempotency.',
    'Issue #16 records seeded product payment-plan read records.',
    'Issue #409 records the owner-created product delivery-gate link path.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-verifies-sandbox-entitlement-grant';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-product-payment-plan-readiness',
  'Exposed product payment-plan readiness',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked Codex to keep building Bumpgrade while reducing noisy updates and clarifying executive/product status.',
  '[{"number":16,"url":"https://github.com/markitics/bumpgrade/issues/16"},{"number":219,"url":"https://github.com/markitics/bumpgrade/issues/219"}]',
  '[]',
  '["https://bumpgrade.com/products/source-data","https://bumpgrade.com/products/indie-launch-library"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/admin/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/product-access.md","docs/agent/agent-ready.md","public/llms.txt"]',
  '["npm run lint","npm run typecheck","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npm run test:browser"]',
  'Live payment-plan checkout, Stripe Price creation, first package/amount selection, webhook-secret confirmation, Customer Portal actions, and live fulfillment remain parked on issue #219.',
  1779596000,
  1779597600,
  '["https://github.com/markitics/bumpgrade/issues/16","https://github.com/markitics/bumpgrade/issues/219","https://bumpgrade.com/products/source-data","https://bumpgrade.com/products/indie-launch-library"]',
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  closed_prs_json=excluded.closed_prs_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  pr_comment_url=excluded.pr_comment_url,
  updated_at=excluded.updated_at;
