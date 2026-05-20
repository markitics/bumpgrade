CREATE TABLE IF NOT EXISTS product_entitlement_revocation_intents (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  entitlement_template_id TEXT NOT NULL,
  access_rule_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'revocation_intent_ready',
  intent_kind TEXT NOT NULL DEFAULT 'owner_confirmed_dry_run',
  revocation_policy TEXT NOT NULL,
  stale_state_policy TEXT NOT NULL,
  audit_correlation_policy TEXT NOT NULL,
  destructive_action_enabled INTEGER NOT NULL DEFAULT 0,
  entitlement_mutation_enabled INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS product_entitlement_revocation_intents_product_status_idx
  ON product_entitlement_revocation_intents(product_id, status);

CREATE INDEX IF NOT EXISTS product_entitlement_revocation_intents_template_status_idx
  ON product_entitlement_revocation_intents(entitlement_template_id, status);

INSERT INTO product_entitlement_revocation_intents (
  id, product_id, entitlement_template_id, access_rule_id, status, intent_kind,
  revocation_policy, stale_state_policy, audit_correlation_policy,
  destructive_action_enabled, entitlement_mutation_enabled, metadata_json, created_at, updated_at
) VALUES (
  'revocation-intent-launch-download-dry-run',
  'product-launch-checklist-download',
  'entitlement-template-launch-download',
  'access-rule-download-after-paid-webhook',
  'revocation_intent_ready',
  'owner_confirmed_dry_run',
  'Future revocation must require owner identity, exact confirmation, current entitlement status, refund/dispute/manual reason, and customer-safe notification review before access removal.',
  'Reject future destructive revocation if entitlement status, checkout state, buyer scope, or product mapping changed since the owner reviewed it.',
  'Future revocation rows must include owner action id, entitlement id, checkout intent id, product id, reason code, idempotency key, and redacted audit event id.',
  0,
  0,
  '{"issue":179,"destructiveActionEnabled":false,"entitlementMutationEnabled":false,"privateBuyerDataIncluded":false,"rawStripeIdsIncluded":false}',
  unixepoch(),
  unixepoch()
) ON CONFLICT(id) DO UPDATE SET
  product_id=excluded.product_id,
  entitlement_template_id=excluded.entitlement_template_id,
  access_rule_id=excluded.access_rule_id,
  status=excluded.status,
  intent_kind=excluded.intent_kind,
  revocation_policy=excluded.revocation_policy,
  stale_state_policy=excluded.stale_state_policy,
  audit_correlation_policy=excluded.audit_correlation_policy,
  destructive_action_enabled=excluded.destructive_action_enabled,
  entitlement_mutation_enabled=excluded.entitlement_mutation_enabled,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  summary = 'Digital product records, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, private R2-backed fixture delivery with redemption revalidation, owner-confirmed private asset upload intents, revocation intent readiness, fulfillment task evidence, protected content planning, access rules, and subscriptions.',
  public_evidence_json = '["Tracked by issue #16.", "Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold.", "Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.", "Issue #139 adds /admin/products owner entitlement inspection and aggregate public redaction flags.", "Issue #141 adds /products/entitlements and /api/products/entitlements for customer-safe checkout intent entitlement lookup.", "Issue #143 adds one-use download tokens for active file entitlements without exposing private R2 keys or signed object URLs.", "Issue #146 streams a seeded private R2-backed fixture through Bumpgrade without exposing private object keys.", "Issue #147 revalidates current entitlement and trusted checkout state before redemption.", "Issue #151 adds owner-confirmed private product asset upload intent records.", "Issue #179 adds owner-visible revocation intent readiness without destructive entitlement mutation."]',
  next_milestone = 'Add destructive revocation only after owner confirmation, stale-state checks, customer-safe notification review, refunds/disputes policy, and audit correlation are enforced.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[16,83,101,139,141,143,146,147,151,179]',
  source_evidence_json = '["https://bumpgrade.com/products/source-data", "https://bumpgrade.com/products/indie-launch-library", "https://bumpgrade.com/products/entitlements", "https://bumpgrade.com/api/products/entitlements", "https://bumpgrade.com/api/products/download-tokens", "https://bumpgrade.com/api/admin/products/assets", "https://bumpgrade.com/admin/products", "https://bumpgrade.com/offers/source-data", "https://github.com/markitics/bumpgrade/issues/16", "https://github.com/markitics/bumpgrade/issues/83", "https://github.com/markitics/bumpgrade/issues/101", "https://github.com/markitics/bumpgrade/issues/139", "https://github.com/markitics/bumpgrade/issues/141", "https://github.com/markitics/bumpgrade/issues/143", "https://github.com/markitics/bumpgrade/issues/146", "https://github.com/markitics/bumpgrade/issues/147", "https://github.com/markitics/bumpgrade/issues/151", "https://github.com/markitics/bumpgrade/issues/179"]',
  user_goal = 'Inspect products, assets, access rules, entitlement templates, sandbox entitlement grant mappings, owner entitlement rows, and revocation intent readiness before destructive access removal is enabled.',
  happy_path_json = '["Fetch /products/source-data.", "Find seeded product types, asset IDs, access rules, entitlement templates, sandbox grant mappings, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, revocation intent readiness, revision ID, and write boundary.", "Open /products/indie-launch-library to inspect the public preview.", "Open /admin/products as a verified owner to inspect private buyer entitlement rows, checkout state, product/price context, queued fulfillment evidence, and revocation intent readiness.", "Open /products/entitlements with a checkout intent reference to inspect customer-safe entitlement and fulfillment state.", "Create and consume a short-lived download token for an active file entitlement after current entitlement and trusted checkout state are revalidated, streaming the seeded private R2-backed fixture through Bumpgrade without exposing private R2 keys or signed object URLs.", "As a verified owner, create a small private product asset upload record only after exact confirmation, idempotency, and catalog revision checks.", "Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists."]',
  edge_cases_json = '["The seeded product/access catalog is not a complete product admin.", "Public /products/source-data exposes aggregate entitlement, owner-upload, and revocation-intent counts plus redaction flags, not buyer emails, raw Stripe IDs, hashes, metadata JSON, R2 keys, signed URLs, or upload bodies.", "A token is rejected without being consumed when current entitlement or trusted checkout state is no longer eligible.", "Owner-uploaded private assets are stored as records but are not yet wired to customer delivery.", "Revocation intents are non-destructive until future exact-confirmed APIs enforce stale-state, reason, notification, and audit checks.", "Signed object URLs, protected lessons, destructive revocation, customer delivery of arbitrary uploads, and live fulfillment automation require future confirmed-write APIs.", "Subscription access requires trusted billing state before membership entitlements can be granted."]',
  agent_access = 'Agents can read /products/source-data, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, the owner-authenticated private asset upload intent boundary, and non-destructive revocation intent readiness. Owner sessions can inspect private buyer entitlement rows and revocation intent records in /admin/products and can create small private asset upload records only through exact-confirmed, idempotent, revision-checked writes. Trusted paid sandbox webhooks can grant seeded entitlement rows; direct customer delivery of arbitrary uploads, destructive revocation, and protected content require later APIs.',
  validation_json = '["Playwright covers /products/source-data, aggregate entitlement inspection redaction, /products/indie-launch-library, customer /products/entitlements lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, owner private asset upload intent creation, idempotent replay, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, sitemap discovery, and agent manifest read-contract discovery.", "Issue #83 records the first product/access source-data contract and preview scaffold.", "Issue #101 records the first sandbox webhook-backed entitlement grant path.", "Issue #139 records the owner product entitlement inspection path.", "Issue #141 records the customer-safe checkout intent entitlement lookup path.", "Issue #143 records the short-lived download-token path.", "Issue #146 records the seeded private R2-backed fixture delivery path.", "Issue #147 records token redemption revalidation against current entitlement and trusted checkout state.", "Issue #151 records the owner-confirmed private product asset upload intent path.", "Issue #179 records the non-destructive revocation intent readiness path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-product-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[16,83,99,101,139,141,143,146,147,151,179]',
  source_evidence_json = '["https://bumpgrade.com/products/source-data", "https://bumpgrade.com/products/entitlements", "https://bumpgrade.com/api/products/entitlements", "https://bumpgrade.com/api/products/download-tokens", "https://bumpgrade.com/api/admin/products/assets", "https://bumpgrade.com/admin/products", "https://bumpgrade.com/commerce/source-data", "https://bumpgrade.com/offers/source-data", "https://github.com/markitics/bumpgrade/issues/16", "https://github.com/markitics/bumpgrade/issues/99", "https://github.com/markitics/bumpgrade/issues/101", "https://github.com/markitics/bumpgrade/issues/139", "https://github.com/markitics/bumpgrade/issues/141", "https://github.com/markitics/bumpgrade/issues/143", "https://github.com/markitics/bumpgrade/issues/146", "https://github.com/markitics/bumpgrade/issues/147", "https://github.com/markitics/bumpgrade/issues/151", "https://github.com/markitics/bumpgrade/issues/179"]',
  user_goal = 'Confirm that paid sandbox checkout webhooks can grant product entitlements, customer-safe downloads can be revalidated, owner-uploaded assets stay private, and revocation intent readiness is explicit before destructive access removal exists.',
  happy_path_json = '["Start a sandbox checkout for the primary offer and selected order bump.", "Receive trusted checkout.session.completed webhook evidence.", "Update the checkout intent to paid.", "Insert idempotent product_entitlements rows for mapped line items.", "Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, or private buyer data.", "Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.", "Create and consume a one-use download token that revalidates current entitlement and trusted checkout state before streaming the seeded private R2-backed fixture for a file entitlement.", "As a verified owner, create a small private upload record for the file asset after exact confirmation, idempotency, and catalog revision checks.", "Open /admin/products as a verified owner to inspect the entitlement rows, queued fulfillment evidence, and revocation intent readiness."]',
  edge_cases_json = '["Duplicate webhook events do not create duplicate entitlements.", "Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows.", "A token created before a checkout state change is rejected while checkout state is no longer trusted paid or completed.", "Owner-uploaded private assets are not yet customer-delivered.", "Revocation intents are non-destructive until future exact-confirmed APIs enforce stale-state, reason, notification, and audit checks.", "Signed downloads, protected content, customer portal, refunds, destructive revocation, and direct customer delivery of arbitrary uploads require later confirmed-write APIs.", "Raw Stripe identifiers and buyer email remain server-private."]',
  agent_access = 'Agents can read /products/source-data, /api/products/entitlements, /api/products/download-tokens, and /commerce/source-data to understand the entitlement grant contract, customer-safe lookup, short-lived private R2-backed fixture delivery with redemption revalidation, owner-upload intent boundary, revocation intent readiness, and aggregate inspection counts. Owner sessions can inspect private buyer entitlement rows in /admin/products and create small private asset upload records via exact-confirmed, idempotent, revision-checked writes. Agents cannot grant, destructively revoke, expose private buyer data, deliver arbitrary uploads to customers, or issue signed object URLs without future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers source-data output, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, owner private asset upload intent creation, idempotent replay, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, and duplicate webhook idempotency.", "Issue #101 records the sandbox entitlement grant path.", "Issue #139 records the owner product entitlement inspection path.", "Issue #141 records the customer-safe product entitlement lookup path.", "Issue #143 records the short-lived download-token path.", "Issue #146 records the seeded private R2-backed fixture delivery path.", "Issue #147 records token redemption revalidation against current entitlement and trusted checkout state.", "Issue #151 records the owner-confirmed private product asset upload intent path.", "Issue #179 records the non-destructive revocation intent readiness path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-verifies-sandbox-entitlement-grant';
