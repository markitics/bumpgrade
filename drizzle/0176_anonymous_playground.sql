CREATE TABLE IF NOT EXISTS anonymous_playground_workspaces (
  id TEXT PRIMARY KEY,
  recovery_token_sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  offer_name TEXT,
  audience TEXT,
  launch_goal TEXT,
  selected_importer_slug TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  expires_at INTEGER NOT NULL,
  claimed_by_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  claimed_tenant_id TEXT REFERENCES publisher_tenants(id) ON DELETE SET NULL,
  source_issue_number INTEGER NOT NULL DEFAULT 466,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_seen_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS anonymous_playground_workspaces_recovery_token_unique
  ON anonymous_playground_workspaces(recovery_token_sha256);

CREATE INDEX IF NOT EXISTS anonymous_playground_workspaces_status_expiry_idx
  ON anonymous_playground_workspaces(status, expires_at);

CREATE INDEX IF NOT EXISTS anonymous_playground_workspaces_claimed_user_idx
  ON anonymous_playground_workspaces(claimed_by_user_id, updated_at);

CREATE TABLE IF NOT EXISTS anonymous_playground_audit_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES anonymous_playground_workspaces(id) ON DELETE CASCADE,
  event_kind TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS anonymous_playground_audit_events_idempotency_unique
  ON anonymous_playground_audit_events(idempotency_key);

CREATE INDEX IF NOT EXISTS anonymous_playground_audit_events_workspace_created_idx
  ON anonymous_playground_audit_events(workspace_id, created_at);

INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-free-build-before-go-live',
  'Free build-before-go-live pricing model',
  'active',
  466,
  'feature-resources-use-cases-pricing',
  'Marketing surfaces',
  'Defines the $0 private-building path, logged-out browser playground recovery, signed-in Free Build workspace creation, paid go-live gates, and the handoff before public, billing, sending, domain, or fulfillment actions are treated as live.',
  json_array(
    'Issue #466 tracks the Free Build pricing model and optional anonymous playground.',
    '/playground lets logged-out visitors save basic launch setup progress in this browser.',
    '/playground/source-data exposes browser recovery, cookie, claim, redaction, and go-live gate contracts.',
    '/api/playground/anonymous-workspace saves the browser-scoped playground without billing or public publishing.',
    '/api/playground/claim attaches the saved playground to a verified signed-in Free Build workspace.',
    '/pricing explains the build-first message in plain public copy.',
    '/account/source-data exposes the signed-in Free Build workspace contract and paid go-live gates.'
  ),
  'Broaden the anonymous playground from basic launch context into real draft funnel, offer, product, audience, and importer records after abuse limits, cleanup policy, and merge semantics are proven.',
  NULL,
  205,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  status=excluded.status,
  issue_number=excluded.issue_number,
  feature_id=excluded.feature_id,
  group_name=excluded.group_name,
  summary=excluded.summary,
  public_evidence_json=excluded.public_evidence_json,
  next_milestone=excluded.next_milestone,
  mark_attention=excluded.mark_attention,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[20,316,466]',
  source_evidence_json = '["https://bumpgrade.com/pricing","https://bumpgrade.com/pricing/source-data","https://bumpgrade.com/playground","https://bumpgrade.com/playground/source-data","https://github.com/markitics/bumpgrade/issues/466"]',
  edge_cases_json = '["Logged-out playground recovery is browser-scoped and depends on the recovery cookie still being present.","Signed-in Free Build workspace creation is covered by /account/setup and /account/source-data.","Buyer-facing publishing, live checkout, email sends, domains, and fulfillment remain gated.","Anonymous playground state can attach to a verified account, but it still does not create public buyer-facing state."]',
  validation_json = '["Pricing route smoke confirms the public copy avoids internal implementation language.","/pricing/source-data exposes Free Build capability records and paid go-live gate records.","/playground and /playground/source-data expose logged-out browser recovery as live.","/account/source-data exposes signed-in Free Build workspace creation as live.","/content/source-data and /agent-docs/source-data include the pricing policy as agent-readable evidence."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-understands-free-build';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal,
  source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json,
  sort_order, updated_at
) VALUES (
  'journey-prospect-saves-anonymous-playground',
  'Prospect saves a logged-out launch playground',
  'feature-resources-use-cases-pricing',
  'live',
  '[466]',
  'Publisher exploring Bumpgrade before signup',
  'Try the product, save launch context in this browser, return later, and attach the work to a Free Build account without paying first.',
  '["https://bumpgrade.com/playground","https://bumpgrade.com/playground/source-data","https://bumpgrade.com/pricing/source-data","https://github.com/markitics/bumpgrade/issues/466"]',
  '["Open /playground while logged out.","Enter an offer name, audience, launch goal, and starting platform.","Save the playground and refresh the page.","Return from the same browser and see the saved draft.","Create or sign into a verified account and attach the playground to a private Free Build workspace.","Choose a paid go-live plan before public publishing, live checkout, sends, domains, or fulfillment."]',
  '["Recovery depends on the browser cookie remaining available.","The cookie stores a recovery token only; D1 stores its hash, not the raw cookie value.","Anonymous playground rows expire after 30 days unless extended by later saves.","Playground saves do not create billing state, public domains, buyer routes, subscriber sends, or product access.","Attaching to an account creates or reuses a private Free Build workspace and keeps paid go-live gates intact."]',
  'Agents can read /playground/source-data for the anonymous playground contract. Saving playground state is browser-scoped and redacted; attaching it requires authenticated, email-verified publisher context and still does not authorize public or billing-impacting actions.',
  '["Playwright covers logged-out save, recovery-cookie persistence across refresh, source-data redaction, unauthenticated claim rejection, verified-account claim, and paid go-live gate preservation.","/pricing/source-data and /account/source-data distinguish anonymous playground, signed-in Free Build, and paid go-live actions."]',
  42,
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
