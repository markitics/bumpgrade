UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Digital product records, read-only access contract, protected content, access rules, fulfillment state, and subscriptions.',
  public_evidence_json = '["Issue #16 owns products, downloads, courses, memberships, subscriptions, access rules, fulfillment, and entitlements.", "Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold."]',
  next_milestone = 'Build authenticated entitlement writes from trusted checkout or subscription evidence without exposing private asset data.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-previews-product-access',
  'Publisher previews product access rules',
  'feature-products-access',
  'pending',
  '[16,83]',
  'Publisher or agent planning fulfillment',
  'Inspect products, assets, access rules, and entitlement templates before private fulfillment writes are enabled.',
  '["https://bumpgrade.com/products/source-data","https://bumpgrade.com/products/indie-launch-library","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/16","https://github.com/markitics/bumpgrade/issues/83"]',
  '["Fetch /products/source-data.","Find seeded product types, asset IDs, access rules, entitlement templates, revision ID, and write boundary.","Open /products/indie-launch-library to inspect the public preview.","Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists."]',
  '["The seeded product/access catalog is read-only and not a product admin.","Private R2 keys, signed URLs, protected lessons, customer entitlements, and fulfillment writes require future confirmed-write APIs.","Subscription access requires trusted billing state before membership entitlements can be granted."]',
  'Agents can read /products/source-data and the preview route. Product/access writes require actor identity, exact confirmation, idempotency, stale-state checks, audit correlation, redaction, and trusted checkout or subscription evidence in a later API.',
  '["Playwright covers /products/source-data, /products/indie-launch-library, sitemap discovery, and agent manifest read-contract discovery.","Issue #83 records the first product/access source-data contract and preview scaffold."]',
  49,
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
