CREATE TABLE IF NOT EXISTS product_download_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  checkout_intent_id TEXT NOT NULL REFERENCES checkout_intents(id) ON DELETE CASCADE,
  entitlement_id TEXT NOT NULL REFERENCES product_entitlements(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS product_download_tokens_hash_unique
  ON product_download_tokens(token_hash);
CREATE INDEX IF NOT EXISTS product_download_tokens_entitlement_status_idx
  ON product_download_tokens(entitlement_id, status, expires_at);
CREATE INDEX IF NOT EXISTS product_download_tokens_checkout_created_idx
  ON product_download_tokens(checkout_intent_id, created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Digital product records, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer-safe checkout intent lookup, short-lived sandbox download tokens, fulfillment task evidence, protected content planning, access rules, and subscriptions.',
  public_evidence_json = '["Tracked by issue #16.", "Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold.", "Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.", "Issue #139 adds /admin/products owner entitlement inspection and aggregate public redaction flags.", "Issue #141 adds /products/entitlements and /api/products/entitlements for customer-safe checkout intent entitlement lookup.", "Issue #143 adds short-lived sandbox download tokens for active file entitlements without exposing private R2 keys or signed object URLs."]',
  next_milestone = 'Replace sandbox placeholder downloads with private R2-backed delivery while preserving the same token, entitlement, expiry, and redaction boundaries.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[16,83,101,139,141,143]',
  source_evidence_json = '["https://bumpgrade.com/products/source-data","https://bumpgrade.com/products/indie-launch-library","https://bumpgrade.com/products/entitlements","https://bumpgrade.com/api/products/entitlements","https://bumpgrade.com/api/products/download-tokens","https://bumpgrade.com/admin/products","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/16","https://github.com/markitics/bumpgrade/issues/83","https://github.com/markitics/bumpgrade/issues/101","https://github.com/markitics/bumpgrade/issues/139","https://github.com/markitics/bumpgrade/issues/141","https://github.com/markitics/bumpgrade/issues/143"]',
  happy_path_json = '["Fetch /products/source-data.","Find seeded product types, asset IDs, access rules, entitlement templates, sandbox grant mappings, aggregate entitlement inspection counts, customer lookup contract, download-token contract, revision ID, and write boundary.","Open /products/indie-launch-library to inspect the public preview.","Open /admin/products as a verified owner to inspect private buyer entitlement rows, checkout state, product/price context, and queued fulfillment evidence.","Open /products/entitlements with a checkout intent reference to inspect customer-safe entitlement and fulfillment state.","Create a short-lived sandbox download token for an active file entitlement without exposing private R2 keys or signed object URLs.","Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists."]',
  edge_cases_json = '["The seeded product/access catalog is not a product admin.","Public /products/source-data exposes aggregate entitlement counts and redaction flags, not buyer emails, raw Stripe IDs, hashes, metadata JSON, R2 keys, or signed URLs.","Private R2-backed delivery, signed object URLs, protected lessons, revocation, and live fulfillment require future confirmed-write APIs.","Subscription access requires trusted billing state before membership entitlements can be granted."]',
  agent_access = 'Agents can read /products/source-data, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, and the short-lived sandbox download-token boundary. Owner sessions can inspect private buyer entitlement rows in /admin/products. Trusted paid sandbox webhooks can grant seeded entitlement rows; direct product/access writes require actor identity, exact confirmation, idempotency, stale-state checks, audit correlation, redaction, and trusted checkout or subscription evidence in a later API.',
  validation_json = '["Playwright covers /products/source-data, aggregate entitlement inspection redaction, /products/indie-launch-library, customer /products/entitlements lookup, sandbox download-token creation and replay rejection, owner /admin/products inspection, sitemap discovery, and agent manifest read-contract discovery.","Issue #83 records the first product/access source-data contract and preview scaffold.","Issue #101 records the first sandbox webhook-backed entitlement grant path.","Issue #139 records the owner product entitlement inspection path.","Issue #141 records the customer-safe checkout intent entitlement lookup path.","Issue #143 records the short-lived sandbox download-token path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-product-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[16,83,99,101,139,141,143]',
  source_evidence_json = '["https://bumpgrade.com/products/source-data","https://bumpgrade.com/products/entitlements","https://bumpgrade.com/api/products/entitlements","https://bumpgrade.com/api/products/download-tokens","https://bumpgrade.com/admin/products","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/16","https://github.com/markitics/bumpgrade/issues/99","https://github.com/markitics/bumpgrade/issues/101","https://github.com/markitics/bumpgrade/issues/139","https://github.com/markitics/bumpgrade/issues/141","https://github.com/markitics/bumpgrade/issues/143"]',
  happy_path_json = '["Start a sandbox checkout for the primary offer and selected order bump.","Receive trusted checkout.session.completed webhook evidence.","Update the checkout intent to paid.","Insert idempotent product_entitlements rows for mapped line items.","Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, or private buyer data.","Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.","Create and consume a one-use sandbox download token for a file entitlement.","Open /admin/products as a verified owner to inspect the entitlement rows and queued fulfillment evidence."]',
  edge_cases_json = '["Duplicate webhook events do not create duplicate entitlements.","Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows.","Private R2-backed asset delivery remains disabled.","Revocation, signed downloads, protected content, customer portal, refunds, and direct agent writes require later confirmed-write APIs.","Raw Stripe identifiers and buyer email remain server-private."]',
  agent_access = 'Agents can read /products/source-data, /api/products/entitlements, /api/products/download-tokens, and /commerce/source-data to understand the entitlement grant contract, customer-safe lookup, short-lived sandbox delivery, and aggregate inspection counts. Owner sessions can inspect private buyer entitlement rows in /admin/products. Agents cannot grant, revoke, expose private buyer data, or issue private R2-backed downloads without future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers source-data output, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, sandbox download-token creation and replay rejection, owner /admin/products inspection, and duplicate webhook idempotency.","Issue #101 records the sandbox entitlement grant path.","Issue #139 records the owner product entitlement inspection path.","Issue #141 records the customer-safe product entitlement lookup path.","Issue #143 records the short-lived sandbox download-token path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-verifies-sandbox-entitlement-grant';
