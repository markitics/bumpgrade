CREATE TABLE IF NOT EXISTS product_entitlements (
  id TEXT PRIMARY KEY,
  checkout_intent_id TEXT REFERENCES checkout_intents(id) ON DELETE SET NULL,
  source_stripe_event_id TEXT REFERENCES stripe_webhook_events(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL,
  source_commerce_product_id TEXT REFERENCES commerce_products(id) ON DELETE SET NULL,
  entitlement_template_id TEXT NOT NULL,
  access_rule_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  grant_kind TEXT NOT NULL,
  buyer_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  buyer_email_hash TEXT,
  source_price_id TEXT,
  revoked_at INTEGER,
  metadata_json TEXT,
  granted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS product_entitlements_checkout_template_unique
  ON product_entitlements(checkout_intent_id, product_id, entitlement_template_id);
CREATE INDEX IF NOT EXISTS product_entitlements_product_status_idx
  ON product_entitlements(product_id, status);
CREATE INDEX IF NOT EXISTS product_entitlements_template_status_idx
  ON product_entitlements(entitlement_template_id, status);

CREATE TABLE IF NOT EXISTS product_fulfillment_tasks (
  id TEXT PRIMARY KEY,
  entitlement_id TEXT REFERENCES product_entitlements(id) ON DELETE CASCADE,
  checkout_intent_id TEXT REFERENCES checkout_intents(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  fulfillment_kind TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS product_fulfillment_tasks_entitlement_unique
  ON product_fulfillment_tasks(entitlement_id);
CREATE INDEX IF NOT EXISTS product_fulfillment_tasks_status_created_idx
  ON product_fulfillment_tasks(status, created_at);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Digital product records, product/access source data, sandbox webhook-backed entitlement grants, fulfillment task evidence, protected content planning, access rules, and subscriptions.',
  public_evidence_json = '["Issue #16 owns products, downloads, courses, memberships, subscriptions, access rules, fulfillment, and entitlements.", "Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold.", "Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events."]',
  next_milestone = 'Add signed download access and authenticated entitlement inspection without exposing private R2 keys or raw Stripe identifiers.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-verifies-sandbox-entitlement-grant',
  'Publisher verifies sandbox entitlement grant evidence',
  'feature-products-access',
  'pending',
  '[16,83,99,101]',
  'Publisher or agent validating fulfillment readiness',
  'Confirm that a paid sandbox checkout webhook can grant product entitlements and queue fulfillment evidence without exposing private assets.',
  '["https://bumpgrade.com/products/source-data","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/16","https://github.com/markitics/bumpgrade/issues/99","https://github.com/markitics/bumpgrade/issues/101"]',
  '["Start a sandbox checkout for the primary offer and selected order bump.","Receive trusted checkout.session.completed webhook evidence.","Update the checkout intent to paid.","Insert idempotent product_entitlements rows for mapped line items.","Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, or private buyer data."]',
  '["Duplicate webhook events do not create duplicate entitlements.","Private asset delivery remains disabled.","Revocation, signed downloads, protected content, customer portal, refunds, and direct agent writes require later confirmed-write APIs.","Raw Stripe identifiers and buyer email remain server-private."]',
  'Agents can read /products/source-data and /commerce/source-data to understand the entitlement grant contract. Agents cannot grant, revoke, inspect private buyer access, or issue signed download URLs without future authenticated confirmed-write APIs.',
  '["Playwright covers source-data output, a paid test checkout webhook that creates entitlement rows, and duplicate webhook idempotency.","Issue #101 records the sandbox entitlement grant path."]',
  50,
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
