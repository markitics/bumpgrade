UPDATE product_protected_content_sections
SET
  delivery_enabled = 1,
  protected_body_included = 0,
  metadata_json = json_set(
    COALESCE(metadata_json, '{}'),
    '$.issue',
    185,
    '$.followsIssue',
    181,
    '$.deliveryEnabled',
    true,
    '$.deliveryMode',
    'seeded-protected-fixture',
    '$.protectedBodyIncludedInSourceData',
    false,
    '$.buyerDataIncluded',
    false,
    '$.rawStripeIdsIncluded',
    false,
    '$.signedUrlsIncluded',
    false
  ),
  updated_at = unixepoch()
WHERE id IN (
  'protected-content-launch-course-module-1',
  'protected-content-launch-member-area'
);

UPDATE admin_roadmap_items
SET
  summary = 'Digital product records, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, private R2-backed fixture delivery with redemption revalidation, owner-confirmed private asset upload intents, revocation intent readiness, protected content readiness, checkout-intent-scoped protected fixture delivery, fulfillment task evidence, access rules, and subscriptions.',
  public_evidence_json = '["Tracked by issue #16.", "Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold.", "Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.", "Issue #139 adds /admin/products owner entitlement inspection and aggregate public redaction flags.", "Issue #141 adds /products/entitlements and /api/products/entitlements for customer-safe checkout intent entitlement lookup.", "Issue #143 adds one-use download tokens for active file entitlements without exposing private R2 keys or signed object URLs.", "Issue #146 streams a seeded private R2-backed fixture through Bumpgrade without exposing private object keys.", "Issue #147 revalidates current entitlement and trusted checkout state before redemption.", "Issue #151 adds owner-confirmed private product asset upload intent records.", "Issue #179 adds owner-visible revocation intent readiness without destructive entitlement mutation.", "Issue #181 adds protected content readiness metadata.", "Issue #185 adds checkout-intent-scoped protected fixture delivery for active eligible entitlements."]',
  next_milestone = 'Extend protected content beyond seeded fixtures only after subscription entitlement checks, progress/audit records, real protected storage, and private media redaction stay enforced.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[16,83,101,139,141,143,146,147,151,179,181,185]',
  user_goal = 'Inspect products, assets, access rules, entitlement templates, sandbox entitlement grant mappings, owner entitlement rows, revocation intent readiness, protected content readiness, and checkout-scoped protected fixture delivery before real private content storage is enabled.',
  happy_path_json = '["Fetch /products/source-data.", "Find seeded product types, asset IDs, access rules, entitlement templates, sandbox grant mappings, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, revocation intent readiness, protected content readiness, protected fixture delivery contract, revision ID, and write boundary.", "Open /products/indie-launch-library to inspect the public preview.", "Open /admin/products as a verified owner to inspect private buyer entitlement rows, checkout state, product/price context, queued fulfillment evidence, revocation intent readiness, and protected content readiness.", "Open /products/entitlements with a checkout intent reference to inspect customer-safe entitlement and fulfillment state.", "Use /api/products/protected-content with a known checkout intent, active matching entitlement, and protected content id to read the seeded protected fixture.", "Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists."]',
  edge_cases_json = '["The seeded product/access catalog is not a complete product admin.", "Public /products/source-data exposes aggregate entitlement, owner-upload, revocation-intent, and protected-content counts plus redaction flags, not buyer emails, raw Stripe IDs, hashes, lesson bodies, member posts, progress rows, metadata JSON, R2 keys, signed URLs, or upload bodies.", "Protected fixture delivery requires a matching active entitlement and trusted checkout state; mismatched or stale checkout state is rejected.", "Owner-uploaded private assets are stored as records but are not yet wired to arbitrary customer delivery.", "Signed object URLs, real protected media, destructive revocation, customer delivery of arbitrary uploads, and live fulfillment automation require future confirmed-write APIs.", "Subscription access requires trusted billing state before real recurring member access ships."]',
  agent_access = 'Agents can read /products/source-data, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, the owner-authenticated private asset upload intent boundary, non-destructive revocation intent readiness, protected content readiness, and checkout-scoped protected fixture delivery boundaries. Owner sessions can inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products and can create small private asset upload records only through exact-confirmed, idempotent, revision-checked writes. Trusted paid sandbox webhooks can grant seeded entitlement rows; direct customer delivery of arbitrary uploads, destructive revocation, real protected media delivery, and subscription access changes require later APIs.',
  validation_json = '["Playwright covers /products/source-data, aggregate entitlement inspection redaction, /products/indie-launch-library, customer /products/entitlements lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, checkout-scoped protected fixture delivery, protected fixture stale-state rejection, owner private asset upload intent creation, idempotent replay, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, sitemap discovery, and agent manifest read-contract discovery.", "Issue #185 records the first gated protected content delivery path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-product-access';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[16,83,99,101,139,141,143,146,147,151,179,181,185]',
  user_goal = 'Confirm that paid sandbox checkout webhooks can grant product entitlements, customer-safe downloads can be revalidated, owner-uploaded assets stay private, revocation intent readiness is explicit, and protected content fixtures only render for active eligible checkout-linked entitlements.',
  happy_path_json = '["Start a sandbox checkout for the primary offer and selected order bump.", "Receive trusted checkout.session.completed webhook evidence.", "Update the checkout intent to paid.", "Insert idempotent product_entitlements rows for mapped line items.", "Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, private buyer data, or arbitrary protected content bodies.", "Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.", "Use the bundle entitlement and checkout intent to read a seeded protected course/member fixture through /api/products/protected-content.", "Open /admin/products as a verified owner to inspect the entitlement rows, queued fulfillment evidence, revocation intent readiness, and protected content readiness."]',
  edge_cases_json = '["Duplicate webhook events do not create duplicate entitlements.", "Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows or protected bodies.", "Protected fixture delivery rejects mismatched entitlements and stale checkout state.", "Owner-uploaded private assets are not yet customer-delivered.", "Signed downloads, arbitrary protected content delivery, customer portal, refunds, destructive revocation, and direct customer delivery of uploads require later confirmed-write APIs.", "Raw Stripe identifiers and buyer email remain server-private."]',
  agent_access = 'Agents can read /products/source-data, /api/products/entitlements, /api/products/download-tokens, /api/products/protected-content, and /commerce/source-data to understand the entitlement grant contract, customer-safe lookup, short-lived private R2-backed fixture delivery with redemption revalidation, owner-upload intent boundary, revocation intent readiness, protected content readiness, protected fixture delivery checks, and aggregate inspection counts. Owner sessions can inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products and create small private asset upload records via exact-confirmed, idempotent, revision-checked writes. Agents cannot grant, destructively revoke, expose private buyer data, deliver arbitrary protected bodies, deliver arbitrary uploads to customers, or issue signed object URLs without future authenticated confirmed-write APIs.',
  validation_json = '["Playwright covers source-data output, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, protected fixture delivery and stale-state rejection, owner private asset upload intent creation, idempotent replay, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, and duplicate webhook idempotency.", "Issue #185 records the first gated protected content delivery path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-verifies-sandbox-entitlement-grant';
