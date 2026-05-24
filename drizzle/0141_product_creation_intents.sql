CREATE TABLE IF NOT EXISTS product_creation_intents (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES commerce_products(id) ON DELETE CASCADE,
  actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  actor_email_hash TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  requested_slug TEXT NOT NULL,
  product_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft_product_created',
  confirmation_text_sha256 TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS product_creation_intents_idempotency_unique
  ON product_creation_intents(idempotency_key);
CREATE INDEX IF NOT EXISTS product_creation_intents_product_status_idx
  ON product_creation_intents(product_id, status);
CREATE INDEX IF NOT EXISTS product_creation_intents_created_idx
  ON product_creation_intents(created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Digital product records, owner-confirmed draft product creation, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, private R2-backed fixture delivery with redemption revalidation, owner-confirmed private asset upload intents, owner-confirmed non-destructive revocation intents, protected content readiness, checkout-intent-scoped protected fixture delivery, subscription-backed membership access, fulfillment task evidence, access rules, and subscriptions.',
  public_evidence_json = json_array(
    'Tracked by issue #16.',
    'Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold.',
    'Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.',
    'Issue #139 adds /admin/products owner entitlement inspection and aggregate public redaction flags.',
    'Issue #141 adds /products/entitlements and /api/products/entitlements for customer-safe checkout intent entitlement lookup.',
    'Issue #143 adds one-use download tokens for active file entitlements without exposing private R2 keys or signed object URLs.',
    'Issue #146 streams a seeded private R2-backed fixture through Bumpgrade without exposing private object keys.',
    'Issue #147 revalidates current entitlement and trusted checkout state before redemption.',
    'Issue #151 adds owner-confirmed private product asset upload intent records.',
    'Issue #179 adds owner-visible revocation intent readiness without destructive entitlement mutation.',
    'Issue #181 adds protected content readiness metadata.',
    'Issue #185 adds checkout-intent-scoped protected fixture delivery.',
    'Issue #187 syncs checkout-linked membership entitlement state from trusted Stripe Billing subscription events.',
    'Issue #251 adds owner-confirmed non-destructive revocation intent records with exact confirmation, idempotency, stale-state checks, and public redaction.',
    'Issue #403 adds owner-confirmed draft product creation records without Stripe product/price creation or fulfillment mutation.'
  ),
  next_milestone = 'Link owner-created draft products to offers/funnels and test-mode purchases, then grant access from those created records before closing issue #16.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_array(16,83,101,139,141,143,146,147,151,179,181,185,187,251,403),
  source_evidence_json = json_array(
    'https://bumpgrade.com/products/source-data',
    'https://bumpgrade.com/products/indie-launch-library',
    'https://bumpgrade.com/products/entitlements',
    'https://bumpgrade.com/api/products/entitlements',
    'https://bumpgrade.com/api/products/download-tokens',
    'https://bumpgrade.com/api/products/protected-content',
    'https://bumpgrade.com/api/admin/products/catalog',
    'https://bumpgrade.com/api/admin/products/assets',
    'https://bumpgrade.com/api/admin/products/revocation-intents',
    'https://bumpgrade.com/admin/products',
    'https://bumpgrade.com/offers/source-data',
    'https://github.com/markitics/bumpgrade/issues/16',
    'https://github.com/markitics/bumpgrade/issues/403'
  ),
  user_goal = 'Inspect products, create a draft product record as an owner, inspect assets, access rules, entitlement templates, sandbox entitlement grant mappings, subscription-backed membership access, owner entitlement rows, owner-confirmed revocation intents, and protected fixture delivery checks before real private content storage is enabled.',
  happy_path_json = json_array(
    'Fetch /products/source-data.',
    'Find seeded product types, owner product creation contract, asset IDs, access rules, entitlement templates, sandbox grant mappings, subscription membership access contract, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, owner-confirmed revocation intent contract, protected content readiness, protected fixture delivery contract, revision ID, and write boundary.',
    'Open /products/indie-launch-library to inspect the public preview.',
    'Open /admin/products as a verified owner to create a draft product record and inspect private buyer entitlement rows, checkout state, product and price context, queued fulfillment evidence, revocation intent records, and protected content readiness.',
    'Record a non-destructive product access removal intent only after exact confirmation, idempotency, and a current entitlement status check.',
    'Open /products/entitlements with a checkout intent reference to inspect customer-safe entitlement and fulfillment state.',
    'Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists.'
  ),
  edge_cases_json = json_array(
    'Owner-created draft products do not create Stripe products or prices.',
    'Owner-created draft products are not linked to offers or funnels yet.',
    'Public /products/source-data exposes aggregate product creation counts plus redaction flags, not owner emails, actor user IDs, idempotency keys, metadata JSON, or raw Stripe IDs.',
    'Owner-confirmed revocation intents record intent only; they do not remove access, issue refunds, change billing, or notify customers.',
    'Owner-uploaded private assets are stored as records but are not yet wired to customer delivery.',
    'Signed object URLs, real protected media, destructive revocation, customer delivery of arbitrary uploads, Customer Portal actions, and live fulfillment automation require future APIs.'
  ),
  agent_access = 'Agents can read /products/source-data, aggregate product creation counts, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, the owner-authenticated private asset upload intent boundary, owner-confirmed non-destructive revocation intent evidence, protected content readiness, protected fixture delivery checks, and subscription-backed membership access state. Owner sessions can create draft product records and inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products, create small private asset upload records, and record non-destructive revocation intents only through exact-confirmed, idempotent, stale-state-checked writes. Trusted paid sandbox webhooks can grant seeded entitlement rows and trusted Stripe Billing webhooks can sync membership access; direct customer delivery of arbitrary uploads, destructive revocation, Stripe product or price creation, offer/funnel product linking, real protected media delivery, Customer Portal actions, and subscription mutations require later APIs.',
  validation_json = json_array(
    'Playwright covers /products/source-data, product creation contract redaction, owner draft product creation, idempotent replay, duplicate slug rejection, aggregate product creation source-data exposure, aggregate entitlement inspection redaction, /products/indie-launch-library, customer /products/entitlements lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, protected fixture delivery, protected fixture stale-state rejection, subscription-backed membership access activation/inactivation, owner private asset upload intent creation, owner-confirmed non-destructive revocation intent creation, idempotent replay, stale-state rejection, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, sitemap discovery, and agent manifest read-contract discovery.',
    'Issue #403 records the first owner-confirmed draft product creation path.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-product-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_array(16,83,99,101,139,141,143,146,147,151,179,181,185,187,251,403),
  source_evidence_json = json_array(
    'https://bumpgrade.com/products/source-data',
    'https://bumpgrade.com/products/entitlements',
    'https://bumpgrade.com/api/products/entitlements',
    'https://bumpgrade.com/api/products/download-tokens',
    'https://bumpgrade.com/api/products/protected-content',
    'https://bumpgrade.com/api/admin/products/catalog',
    'https://bumpgrade.com/api/admin/products/assets',
    'https://bumpgrade.com/api/admin/products/revocation-intents',
    'https://bumpgrade.com/admin/products',
    'https://bumpgrade.com/commerce/source-data',
    'https://bumpgrade.com/offers/source-data',
    'https://github.com/markitics/bumpgrade/issues/16',
    'https://github.com/markitics/bumpgrade/issues/403'
  ),
  user_goal = 'Confirm that paid sandbox checkout webhooks can grant product entitlements, trusted Stripe Billing state can sync membership access, owner-created draft products are recorded safely, queued fulfillment evidence stays public-safe, owner-confirmed revocation intent records stay non-destructive, and protected fixtures return only for active eligible checkout-linked entitlements.',
  happy_path_json = json_array(
    'Create a draft product record as a verified owner without billing or fulfillment mutation.',
    'Start a sandbox checkout for the primary offer and selected order bump.',
    'Receive trusted checkout.session.completed webhook evidence.',
    'Update the checkout intent to paid.',
    'Insert idempotent product_entitlements rows for mapped line items.',
    'Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, private buyer data, or arbitrary protected content bodies.',
    'Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.',
    'Use the bundle entitlement and checkout intent to read a seeded protected course/member fixture through /api/products/protected-content.',
    'As a verified owner, record a non-destructive product access removal intent with exact confirmation and a current entitlement status check.',
    'Open /admin/products as a verified owner to inspect the draft product, entitlement rows, queued fulfillment evidence, revocation intents, and protected content readiness.'
  ),
  edge_cases_json = json_array(
    'Duplicate draft product creation idempotency keys replay only identical requests.',
    'Duplicate draft product slugs are rejected before creating another record.',
    'Duplicate webhook events do not create duplicate entitlements.',
    'Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows or owner identity.',
    'Protected fixture delivery rejects mismatched entitlements and stale checkout state.',
    'Owner-confirmed revocation intents reject stale entitlement status and idempotency conflicts but do not mutate access, billing, refunds, notifications, or fulfillment.',
    'Signed downloads, arbitrary protected content delivery, customer portal, refunds, destructive revocation, offer/funnel product linking, and direct customer delivery of uploads require later confirmed-write APIs.',
    'Raw Stripe identifiers and buyer email remain server-private.'
  ),
  agent_access = 'Agents can read /products/source-data, /api/products/entitlements, /api/products/download-tokens, /api/products/protected-content, and /commerce/source-data to understand the draft product creation contract, entitlement grant contract, customer-safe lookup, short-lived private R2-backed fixture delivery with redemption revalidation, owner-upload intent boundary, owner-confirmed non-destructive revocation intent boundary, protected content readiness, protected fixture delivery checks, subscription-backed membership access, and aggregate inspection counts. Owner sessions can create draft product records and inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products, create small private asset upload records, and record revocation intents via exact-confirmed, idempotent, stale-state-checked writes. Agents cannot grant, destructively revoke, expose private buyer data, deliver arbitrary protected bodies, deliver arbitrary uploads to customers, create Stripe products or prices, link products to live offers, mutate subscriptions, create Customer Portal sessions, or issue signed object URLs without future authenticated confirmed-write APIs.',
  validation_json = json_array(
    'Playwright covers source-data output, product creation contract redaction, owner draft product creation, duplicate handling, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, protected fixture delivery and stale-state rejection, subscription-backed membership access activation/inactivation, owner private asset upload intent creation, owner-confirmed non-destructive revocation intent creation, idempotent replay, stale-state rejection, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, and duplicate webhook idempotency.',
    'Issue #403 records the owner-confirmed draft product creation path.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-verifies-sandbox-entitlement-grant';
