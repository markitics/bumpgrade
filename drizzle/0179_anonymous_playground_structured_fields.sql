ALTER TABLE anonymous_playground_workspaces ADD COLUMN product_format TEXT;
ALTER TABLE anonymous_playground_workspaces ADD COLUMN price_point TEXT;
ALTER TABLE anonymous_playground_workspaces ADD COLUMN lead_magnet TEXT;
ALTER TABLE anonymous_playground_workspaces ADD COLUMN checkout_plan TEXT;
ALTER TABLE anonymous_playground_workspaces ADD COLUMN delivery_plan TEXT;
ALTER TABLE anonymous_playground_workspaces ADD COLUMN follow_up_plan TEXT;
ALTER TABLE anonymous_playground_workspaces ADD COLUMN source_url TEXT;

UPDATE admin_roadmap_items
SET
  summary = 'Defines the $0 private-building path, logged-out browser playground recovery, signed-in Free Build workspace creation, paid go-live gates, and the handoff before public, billing, sending, domain, or fulfillment actions are treated as live.',
  public_evidence_json = json_array(
    'Issue #466 tracks the Free Build pricing model and optional anonymous playground.',
    '/playground lets logged-out visitors save structured offer, audience, product, opt-in, checkout, delivery, follow-up, and migration-starting-point progress in this browser.',
    '/playground/source-data exposes browser recovery, structured builder fields, cookie, claim, private draft creation, redaction, and go-live gate contracts.',
    '/api/playground/anonymous-workspace saves the browser-scoped structured playground without billing or public publishing.',
    '/api/playground/claim attaches the saved playground to a verified signed-in Free Build workspace and private D1 funnel draft.',
    '/pricing explains the build-first message in plain public copy.',
    '/account/source-data exposes the signed-in Free Build workspace contract and paid go-live gates.'
  ),
  next_milestone = 'Broaden the anonymous playground claim path into dedicated offer, product, audience, importer-review, cleanup, and abuse-limit records after structured funnel-draft mapping is proven.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-free-build-before-go-live';

UPDATE admin_user_journeys
SET
  happy_path_json = '["Open /playground while logged out.","Enter offer, audience, product, opt-in, checkout, delivery, follow-up, and migration starting-point details.","Save the playground and refresh the page.","Return from the same browser and see the saved draft.","Create or sign into a verified account and attach the playground to a private Free Build workspace.","Bumpgrade maps the structured playground fields into an idempotent private launch draft.","Choose a paid go-live plan before public publishing, live checkout, sends, domains, or fulfillment."]',
  edge_cases_json = '["Recovery depends on the browser cookie remaining available.","The cookie stores a recovery token only; D1 stores its hash, not the raw cookie value.","Anonymous playground rows expire after 30 days unless extended by later saves.","Playground saves do not create billing state, public domains, buyer routes, subscriber sends, or product access.","Attaching to an account creates or reuses a private Free Build workspace, maps structured fields into an idempotent private funnel draft, and keeps paid go-live gates intact.","Claim responses return draft summary metadata only; raw recovery tokens, token hashes, and public source-data private draft content stay redacted."]',
  agent_access = 'Agents can read /playground/source-data for the anonymous playground contract and /funnels/source-data for the private draft-funnel boundary. Saving structured playground state is browser-scoped and redacted; attaching it requires authenticated, email-verified publisher context, creates private draft records, and still does not authorize public or billing-impacting actions.',
  validation_json = '["Playwright covers logged-out structured save, recovery-cookie persistence across refresh, source-data redaction, unauthenticated claim rejection, verified-account claim, private draft creation, idempotent claim replay, and paid go-live gate preservation.","/pricing/source-data and /account/source-data distinguish anonymous playground, signed-in Free Build, private draft creation, and paid go-live actions."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-saves-anonymous-playground';

UPDATE admin_user_journeys
SET
  validation_json = '["Pricing route smoke confirms the public copy avoids internal implementation language.","/pricing/source-data exposes Free Build capability records and paid go-live gate records.","/playground and /playground/source-data expose logged-out structured browser recovery and private draft creation as live.","/account/source-data exposes signed-in Free Build workspace creation as live.","/content/source-data and /agent-docs/source-data include the pricing policy as agent-readable evidence."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-understands-free-build';
