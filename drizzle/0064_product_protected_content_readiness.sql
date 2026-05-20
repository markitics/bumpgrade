CREATE TABLE IF NOT EXISTS product_protected_content_sections (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  entitlement_template_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'protected_content_ready',
  content_kind TEXT NOT NULL,
  title TEXT NOT NULL,
  public_summary TEXT NOT NULL,
  access_policy TEXT NOT NULL,
  private_content_boundary TEXT NOT NULL,
  delivery_enabled INTEGER NOT NULL DEFAULT 0,
  protected_body_included INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS product_protected_content_sections_product_status_idx
  ON product_protected_content_sections(product_id, status);

CREATE INDEX IF NOT EXISTS product_protected_content_sections_kind_status_idx
  ON product_protected_content_sections(content_kind, status);

INSERT INTO product_protected_content_sections (
  id, product_id, asset_id, entitlement_template_id, status, content_kind, title,
  public_summary, access_policy, private_content_boundary, delivery_enabled,
  protected_body_included, metadata_json, created_at, updated_at
) VALUES
(
  'protected-content-launch-course-module-1',
  'product-launch-course-lite',
  'asset-launch-course-lessons',
  'entitlement-template-launch-course',
  'protected_content_ready',
  'course_module',
  'Launch course module readiness',
  'Public-safe metadata for the first protected course module.',
  'Future delivery must require an active course entitlement, current trusted checkout state, and a fresh access check before any lesson body, video, transcript, or progress row is returned.',
  'Lesson body, video URL, transcript body, progress state, buyer identity, private R2 object keys, and signed URLs are excluded from this readiness record.',
  0,
  0,
  '{"issue":181,"deliveryEnabled":false,"protectedBodyIncluded":false,"privateContentBodiesIncluded":false}',
  unixepoch(),
  unixepoch()
),
(
  'protected-content-launch-member-area',
  'product-launch-membership',
  'asset-launch-member-area',
  'entitlement-template-launch-membership',
  'protected_content_ready',
  'member_area',
  'Launch member area readiness',
  'Public-safe metadata for a future protected member area.',
  'Future delivery must require active subscription-backed membership entitlement, stale-state checks, and redacted audit evidence before member posts or files are returned.',
  'Member post bodies, private files, community data, subscription identifiers, buyer identity, private R2 object keys, and signed URLs are excluded from this readiness record.',
  0,
  0,
  '{"issue":181,"deliveryEnabled":false,"protectedBodyIncluded":false,"privateContentBodiesIncluded":false}',
  unixepoch(),
  unixepoch()
) ON CONFLICT(id) DO UPDATE SET
  product_id=excluded.product_id,
  asset_id=excluded.asset_id,
  entitlement_template_id=excluded.entitlement_template_id,
  status=excluded.status,
  content_kind=excluded.content_kind,
  title=excluded.title,
  public_summary=excluded.public_summary,
  access_policy=excluded.access_policy,
  private_content_boundary=excluded.private_content_boundary,
  delivery_enabled=excluded.delivery_enabled,
  protected_body_included=excluded.protected_body_included,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  summary = 'Digital product records, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, private R2-backed fixture delivery with redemption revalidation, owner-confirmed private asset upload intents, revocation intent readiness, protected content readiness, fulfillment task evidence, access rules, and subscriptions.',
  public_evidence_json = '["Tracked by issue #16.", "Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold.", "Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.", "Issue #139 adds /admin/products owner entitlement inspection and aggregate public redaction flags.", "Issue #141 adds /products/entitlements and /api/products/entitlements for customer-safe checkout intent entitlement lookup.", "Issue #143 adds one-use download tokens for active file entitlements without exposing private R2 keys or signed object URLs.", "Issue #146 streams a seeded private R2-backed fixture through Bumpgrade without exposing private object keys.", "Issue #147 revalidates current entitlement and trusted checkout state before redemption.", "Issue #151 adds owner-confirmed private product asset upload intent records.", "Issue #179 adds owner-visible revocation intent readiness without destructive entitlement mutation.", "Issue #181 adds protected content readiness metadata without protected body delivery."]',
  next_milestone = 'Add protected content delivery only after entitlement, subscription, stale-state, redaction, and audit checks are enforced.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[16,83,101,139,141,143,146,147,151,179,181]',
  user_goal = 'Inspect products, assets, access rules, entitlement templates, sandbox entitlement grant mappings, owner entitlement rows, revocation intent readiness, and protected content readiness before destructive access removal or protected delivery is enabled.',
  happy_path_json = '["Fetch /products/source-data.", "Find seeded product types, asset IDs, access rules, entitlement templates, sandbox grant mappings, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, revocation intent readiness, protected content readiness, revision ID, and write boundary.", "Open /products/indie-launch-library to inspect the public preview.", "Open /admin/products as a verified owner to inspect private buyer entitlement rows, checkout state, product/price context, queued fulfillment evidence, revocation intent readiness, and protected content readiness.", "Open /products/entitlements with a checkout intent reference to inspect customer-safe entitlement and fulfillment state.", "Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists."]',
  edge_cases_json = '["The seeded product/access catalog is not a complete product admin.", "Public /products/source-data exposes aggregate entitlement, owner-upload, revocation-intent, and protected-content counts plus redaction flags, not buyer emails, raw Stripe IDs, hashes, lesson bodies, member posts, progress rows, metadata JSON, R2 keys, signed URLs, or upload bodies.", "Owner-uploaded private assets are stored as records but are not yet wired to customer delivery.", "Protected content records are readiness metadata only until future exact-confirmed delivery APIs enforce entitlement, subscription, stale-state, audit, and redaction checks.", "Signed object URLs, protected lessons, destructive revocation, customer delivery of arbitrary uploads, and live fulfillment automation require future confirmed-write APIs.", "Subscription access requires trusted billing state before membership entitlements can be granted."]',
  agent_access = 'Agents can read /products/source-data, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, the owner-authenticated private asset upload intent boundary, non-destructive revocation intent readiness, and protected content readiness. Owner sessions can inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products. Agents cannot grant, destructively revoke, expose private buyer data, deliver protected bodies, deliver arbitrary uploads to customers, or issue signed object URLs without future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers /products/source-data, aggregate entitlement inspection redaction, /products/indie-launch-library, customer /products/entitlements lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, owner private asset upload intent creation, idempotent replay, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, sitemap discovery, and agent manifest read-contract discovery.", "Issue #181 records the non-delivery protected content readiness path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-product-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[16,83,99,101,139,141,143,146,147,151,179,181]',
  user_goal = 'Confirm that paid sandbox checkout webhooks can grant product entitlements, customer-safe downloads can be revalidated, owner-uploaded assets stay private, revocation intent readiness is explicit, and protected content delivery stays blocked until future entitlement checks exist.',
  happy_path_json = '["Start a sandbox checkout for the primary offer and selected order bump.", "Receive trusted checkout.session.completed webhook evidence.", "Update the checkout intent to paid.", "Insert idempotent product_entitlements rows for mapped line items.", "Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, private buyer data, or protected content bodies.", "Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.", "Open /admin/products as a verified owner to inspect the entitlement rows, queued fulfillment evidence, revocation intent readiness, and protected content readiness."]',
  edge_cases_json = '["Duplicate webhook events do not create duplicate entitlements.", "Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows or protected bodies.", "Protected content records are non-delivery readiness metadata until future entitlement, subscription, stale-state, audit, and redaction checks exist.", "Owner-uploaded private assets are not yet customer-delivered.", "Signed downloads, protected content delivery, customer portal, refunds, destructive revocation, and direct customer delivery of arbitrary uploads require later confirmed-write APIs.", "Raw Stripe identifiers and buyer email remain server-private."]',
  agent_access = 'Agents can read /products/source-data, /api/products/entitlements, /api/products/download-tokens, and /commerce/source-data to understand the entitlement grant contract, customer-safe lookup, short-lived private R2-backed fixture delivery with redemption revalidation, owner-upload intent boundary, revocation intent readiness, protected content readiness, and aggregate inspection counts. Owner sessions can inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products. Agents cannot grant, destructively revoke, expose private buyer data, deliver protected bodies, deliver arbitrary uploads to customers, or issue signed object URLs without future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers source-data output, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, owner private asset upload intent creation, idempotent replay, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, and duplicate webhook idempotency.", "Issue #181 records the non-delivery protected content readiness path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-verifies-sandbox-entitlement-grant';
