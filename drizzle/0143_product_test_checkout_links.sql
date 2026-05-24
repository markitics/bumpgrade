CREATE TABLE IF NOT EXISTS product_test_checkout_links (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES commerce_products(id) ON DELETE CASCADE,
  actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  actor_email_hash TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  test_price_id TEXT NOT NULL REFERENCES commerce_prices(id) ON DELETE CASCADE,
  public_path TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'test_checkout_link_active',
  revision_id TEXT NOT NULL,
  product_updated_at INTEGER NOT NULL,
  confirmation_text_sha256 TEXT NOT NULL,
  billing_mutation_enabled INTEGER NOT NULL DEFAULT 0,
  stripe_checkout_session_created INTEGER NOT NULL DEFAULT 0,
  live_charge_created INTEGER NOT NULL DEFAULT 0,
  raw_buyer_email_included INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS product_test_checkout_links_idempotency_unique
  ON product_test_checkout_links(idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS product_test_checkout_links_public_path_unique
  ON product_test_checkout_links(public_path);
CREATE INDEX IF NOT EXISTS product_test_checkout_links_product_status_idx
  ON product_test_checkout_links(product_id, status);
CREATE INDEX IF NOT EXISTS product_test_checkout_links_created_idx
  ON product_test_checkout_links(created_at);

CREATE TABLE IF NOT EXISTS product_test_checkout_purchases (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  checkout_link_id TEXT NOT NULL REFERENCES product_test_checkout_links(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES commerce_products(id) ON DELETE CASCADE,
  checkout_intent_id TEXT NOT NULL REFERENCES checkout_intents(id) ON DELETE CASCADE,
  entitlement_id TEXT NOT NULL REFERENCES product_entitlements(id) ON DELETE CASCADE,
  fulfillment_task_id TEXT NOT NULL REFERENCES product_fulfillment_tasks(id) ON DELETE CASCADE,
  buyer_email_hash TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  test_price_id TEXT NOT NULL REFERENCES commerce_prices(id) ON DELETE CASCADE,
  entitlement_template_id TEXT NOT NULL,
  access_rule_id TEXT NOT NULL,
  expected_link_revision_id TEXT NOT NULL,
  link_revision_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'test_checkout_paid',
  confirmation_text_sha256 TEXT NOT NULL,
  billing_mutation_enabled INTEGER NOT NULL DEFAULT 0,
  stripe_checkout_session_created INTEGER NOT NULL DEFAULT 0,
  live_charge_created INTEGER NOT NULL DEFAULT 0,
  raw_buyer_email_included INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS product_test_checkout_purchases_idempotency_unique
  ON product_test_checkout_purchases(idempotency_key);
CREATE INDEX IF NOT EXISTS product_test_checkout_purchases_link_status_idx
  ON product_test_checkout_purchases(checkout_link_id, status);
CREATE INDEX IF NOT EXISTS product_test_checkout_purchases_product_status_idx
  ON product_test_checkout_purchases(product_id, status);
CREATE INDEX IF NOT EXISTS product_test_checkout_purchases_checkout_idx
  ON product_test_checkout_purchases(checkout_intent_id);
CREATE INDEX IF NOT EXISTS product_test_checkout_purchases_created_idx
  ON product_test_checkout_purchases(created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Digital product records, owner-confirmed draft product creation, owner-confirmed test checkout links, buyer-facing test checkout/access grant evidence, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, private R2-backed fixture delivery with redemption revalidation, owner-confirmed private asset upload intents, owner-confirmed non-destructive revocation intents, protected content readiness, checkout-intent-scoped protected fixture delivery, subscription-backed membership access, fulfillment task evidence, access rules, and subscriptions.',
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
    'Issue #407 adds owner-confirmed buyer-facing test checkout links and public test checkout completion for owner-created products without Stripe Checkout Sessions, live charges, or public buyer exposure.'
  ),
  next_milestone = 'Wire owner-created product test checkout links into real offer/funnel product selection and customer delivery gates before closing issue #16.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_array(16,83,101,139,141,143,146,147,151,179,181,185,187,251,403,405,407),
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
    'https://bumpgrade.com/api/admin/products/offer-access-grants',
    'https://bumpgrade.com/api/admin/products/assets',
    'https://bumpgrade.com/api/admin/products/revocation-intents',
    'https://bumpgrade.com/admin/products',
    'https://bumpgrade.com/offers/source-data',
    'https://github.com/markitics/bumpgrade/issues/16',
    'https://github.com/markitics/bumpgrade/issues/403',
    'https://github.com/markitics/bumpgrade/issues/405',
    'https://github.com/markitics/bumpgrade/issues/407'
  ),
  user_goal = 'Inspect products, create a draft product record as an owner, create a buyer-facing test checkout link, complete that public test checkout to create paid test access evidence, and inspect assets, access rules, entitlement templates, sandbox entitlement grant mappings, subscription-backed membership access, owner entitlement rows, owner-confirmed revocation intents, and protected fixture delivery checks before real private content storage is enabled.',
  happy_path_json = json_array(
    'Fetch /products/source-data.',
    'Find seeded product types, owner product creation contract, owner product test checkout link contract, owner product offer/access test grant contract, asset IDs, access rules, entitlement templates, sandbox grant mappings, subscription membership access contract, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, owner-confirmed revocation intent contract, protected content readiness, protected fixture delivery contract, revision ID, and write boundary.',
    'Open /products/indie-launch-library to inspect the public preview.',
    'Open /admin/products as a verified owner to create a draft product record, create a buyer-facing test checkout link after a current product updatedAt check, and inspect private buyer entitlement rows, checkout state, product and price context, queued fulfillment evidence, revocation intent records, and protected content readiness.',
    'Open /products/test-checkout/{linkId} to complete a public test checkout after exact confirmation and a current link revision check.',
    'Open /products/entitlements with the checkout intent reference to inspect customer-safe entitlement and fulfillment state.',
    'Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming live billing or fulfillment exists.'
  ),
  edge_cases_json = json_array(
    'Owner-created draft products do not create Stripe products or prices.',
    'Owner-created product test checkout links create only a test price record and public test checkout route; they do not create live offer copy or publish funnels.',
    'Buyer-facing test checkout completion creates only a synthetic paid checkout intent, entitlement row, fulfillment task evidence, and audit evidence.',
    'Public /products/source-data exposes aggregate product creation, test checkout link, and test grant counts plus redaction flags, not owner emails, actor user IDs, buyer emails, buyer hashes, checkout link IDs, checkout intent IDs, entitlement IDs, idempotency keys, metadata JSON, or raw Stripe IDs.',
    'Signed object URLs, real protected media, destructive revocation, customer delivery of arbitrary uploads, Customer Portal actions, live Stripe Checkout Sessions, live charges, and live fulfillment automation require future APIs.'
  ),
  agent_access = 'Agents can read /products/source-data, aggregate product creation counts, aggregate owner-created product test checkout counts, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, the owner-authenticated private asset upload intent boundary, owner-confirmed non-destructive revocation intent evidence, protected content readiness, protected fixture delivery checks, and subscription-backed membership access state. Owner sessions can create draft product records, create buyer-facing test checkout links, create direct test offer/access grants, inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products, create small private asset upload records, and record non-destructive revocation intents only through exact-confirmed, idempotent, stale-state-checked writes. Public test checkout links can create synthetic paid test access evidence only after exact confirmation, idempotency, and a current link revision check. Trusted paid sandbox webhooks can grant seeded entitlement rows and trusted Stripe Billing webhooks can sync membership access; direct customer delivery of arbitrary uploads, destructive revocation, Stripe product or price creation, live offer/funnel publishing, real protected media delivery, Customer Portal actions, and subscription mutations require later APIs.',
  validation_json = json_array(
    'Playwright covers /products/source-data, product creation contract redaction, owner draft product creation, owner-created product test checkout link contract redaction, public test checkout completion, idempotent replay, stale-state rejection, aggregate product creation and test checkout source-data exposure, customer /products/entitlements lookup, owner /admin/products inspection, revocation intent readiness, protected content readiness, sitemap discovery, and agent manifest read-contract discovery.',
    'Issue #403 records the first owner-confirmed draft product creation path.',
    'Issue #405 records owner-created product direct test offer/access grant evidence.',
    'Issue #407 records owner-created product buyer-facing test checkout link evidence.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-product-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_array(16,83,99,101,139,141,143,146,147,151,179,181,185,187,251,403,405,407),
  source_evidence_json = json_array(
    'https://bumpgrade.com/products/source-data',
    'https://bumpgrade.com/products/entitlements',
    'https://bumpgrade.com/api/products/entitlements',
    'https://bumpgrade.com/api/products/test-checkout',
    'https://bumpgrade.com/api/products/download-tokens',
    'https://bumpgrade.com/api/products/protected-content',
    'https://bumpgrade.com/api/admin/products/catalog',
    'https://bumpgrade.com/api/admin/products/test-checkout-links',
    'https://bumpgrade.com/api/admin/products/offer-access-grants',
    'https://bumpgrade.com/api/admin/products/assets',
    'https://bumpgrade.com/api/admin/products/revocation-intents',
    'https://bumpgrade.com/admin/products',
    'https://bumpgrade.com/commerce/source-data',
    'https://bumpgrade.com/offers/source-data',
    'https://github.com/markitics/bumpgrade/issues/16',
    'https://github.com/markitics/bumpgrade/issues/403',
    'https://github.com/markitics/bumpgrade/issues/405',
    'https://github.com/markitics/bumpgrade/issues/407'
  ),
  user_goal = 'Confirm that paid sandbox checkout webhooks can grant product entitlements, trusted Stripe Billing state can sync membership access, owner-created draft products can produce buyer-facing test checkout links and access grant evidence, queued fulfillment evidence stays public-safe, owner-confirmed revocation intent records stay non-destructive, and protected fixtures return only for active eligible checkout-linked entitlements.',
  happy_path_json = json_array(
    'Create a draft product record as a verified owner without billing or fulfillment mutation.',
    'Create a buyer-facing test checkout link for the owner-created product after exact confirmation, idempotency, and a current product updatedAt check.',
    'Complete the public test checkout after exact confirmation, idempotency, and a current link revision check.',
    'Start a sandbox checkout for the primary seeded offer and selected order bump.',
    'Receive trusted checkout.session.completed webhook evidence.',
    'Update the checkout intent to paid.',
    'Insert idempotent product_entitlements rows for mapped line items.',
    'Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, private buyer data, or arbitrary protected content bodies.',
    'Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.',
    'Open /admin/products as a verified owner to inspect draft products, test checkout links, entitlement rows, queued fulfillment evidence, revocation intents, and protected content readiness.'
  ),
  edge_cases_json = json_array(
    'Duplicate draft product creation idempotency keys replay only identical requests.',
    'Duplicate owner-created product test checkout link idempotency keys replay only identical requests.',
    'Public test checkout completion rejects stale link revisions and conflicting idempotency replays.',
    'Owner-created product test checkouts do not create Stripe Checkout Sessions, live charges, published offer copy, or public buyer records.',
    'Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows, owner identity, checkout link IDs, checkout IDs, entitlement IDs, or idempotency keys.',
    'Signed downloads, arbitrary protected content delivery, customer portal, refunds, destructive revocation, live offer/funnel product linking, direct customer delivery of uploads, and live Stripe charges require later confirmed-write APIs.',
    'Raw Stripe identifiers and buyer email remain server-private.'
  ),
  agent_access = 'Agents can read /products/source-data, /api/products/entitlements, /api/products/test-checkout, /api/products/download-tokens, /api/products/protected-content, and /commerce/source-data to understand the draft product creation contract, owner-created product test checkout link contract, entitlement grant contract, customer-safe lookup, short-lived private R2-backed fixture delivery with redemption revalidation, owner-upload intent boundary, owner-confirmed non-destructive revocation intent boundary, protected content readiness, protected fixture delivery checks, subscription-backed membership access, and aggregate inspection counts. Owner sessions can create draft product records, create owner-created product test checkout links, inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products, create small private asset upload records, and record revocation intents via exact-confirmed, idempotent, stale-state-checked writes. Public test checkout links can create synthetic paid test access evidence only after exact confirmation, idempotency, and a current link revision check. Agents cannot grant live access, destructively revoke, expose private buyer data, deliver arbitrary protected bodies, deliver arbitrary uploads to customers, create Stripe products or prices, mutate subscriptions, publish live offer/funnel changes, create Customer Portal sessions, or issue signed object URLs without future authenticated confirmed-write APIs.',
  validation_json = json_array(
    'Playwright covers source-data output, product creation contract redaction, owner draft product creation, owner-created product test checkout link contract redaction, public test checkout completion, duplicate handling, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, protected fixture delivery and stale-state rejection, subscription-backed membership access activation/inactivation, owner private asset upload intent creation, owner-confirmed non-destructive revocation intent creation, idempotent replay, stale-state rejection, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, and duplicate webhook idempotency.',
    'Issue #403 records the owner-confirmed draft product creation path.',
    'Issue #405 records the owner-created product direct test offer/access grant path.',
    'Issue #407 records the owner-created product buyer-facing test checkout path.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-verifies-sandbox-entitlement-grant';
