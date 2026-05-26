UPDATE admin_roadmap_items
SET
  public_evidence_json = json_array(
    'Issue #466 tracks the Free Build pricing model and optional anonymous playground.',
    '/playground lets logged-out visitors save structured offer, audience, product, opt-in, checkout, delivery, follow-up, and migration-starting-point progress in this browser.',
    '/playground/source-data exposes browser recovery, structured builder fields, cookie, save-limit, additive claim merge, owner cleanup, scheduled cleanup, retention, redaction, and go-live gate contracts.',
    'Claiming a browser playground reuses an existing Free Build workspace when present and adds a private launch draft without replacing existing workspace work.',
    '/api/playground/cleanup is an owner-gated cleanup route for expiring old anonymous recovery without exposing private draft content.',
    'A Cloudflare Cron trigger runs the same expired-recovery cleanup boundary daily without touching claimed private records or go-live state.',
    '/pricing explains the build-first message in plain public copy.',
    '/pricing/source-data exposes the Free Build design, live anonymous playground state, and paid go-live gates.',
    '/account/setup lets verified signed-in users create a private Free Build workspace before payment.',
    '/account/source-data exposes the signed-in Free Build workspace contract and paid go-live gates.',
    '/content/source-data ties the pricing policy into audience and resource discovery records.'
  ),
  next_milestone = 'Continue broad Free Build/paid go-live hardening after the anonymous recovery cleanup loop is scheduled.',
  updated_at = unixepoch()
WHERE id = 'roadmap-free-build-before-go-live';

UPDATE admin_user_journeys
SET
  edge_cases_json = json_array(
    'Recovery depends on the browser cookie remaining available.',
    'The cookie stores a recovery token only; D1 stores its hash, not the raw cookie value.',
    'Anonymous playground rows expire after 30 days unless extended by later saves.',
    'Owner cleanup and scheduled Cloudflare cleanup can expire old anonymous recovery, clear anonymous draft fields, replace the recovery token hash, and preserve private claimed records.',
    'Playground saves do not create billing state, public domains, buyer routes, subscriber sends, or product access.',
    'Attaching to an account creates or reuses a private Free Build workspace and keeps paid go-live gates intact.'
  ),
  agent_access = 'Agents can read /playground/source-data for the anonymous playground contract. Saving structured playground state is browser-scoped, rate-limited per browser recovery workspace, and redacted; cleanup can run through owner confirmation or the scheduled Cloudflare cleanup trigger; attaching it requires authenticated, email-verified publisher context, creates private draft and claim records, and still does not authorize public or billing-impacting actions.',
  validation_json = json_array(
    'Playwright covers logged-out save, recovery-cookie persistence across refresh, source-data redaction, save-limit rejection, unauthenticated claim rejection, owner cleanup rejection, scheduled cleanup source-data, verified-account claim, private draft and claim-record creation, idempotent claim replay, and paid go-live gate preservation.',
    '/pricing/source-data and /account/source-data distinguish anonymous playground, signed-in Free Build, scheduled cleanup, and paid go-live actions.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-prospect-saves-anonymous-playground';
