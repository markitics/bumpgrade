UPDATE admin_roadmap_items
SET
  status = 'live',
  public_evidence_json = json_array(
    'Issue #466 tracks the Free Build pricing model and optional anonymous playground.',
    '/pricing explains the build-first message in plain public copy.',
    '/pricing/source-data exposes the Free Build design, live anonymous playground state, and paid go-live gates.',
    '/account/setup lets verified signed-in users create a private Free Build workspace before payment.',
    '/account/source-data exposes the signed-in Free Build workspace contract and paid go-live gates.',
    '/playground lets logged-out visitors save structured offer, audience, product, opt-in, checkout, delivery, follow-up, and migration-starting-point progress in this browser.',
    '/playground/source-data exposes browser recovery, structured builder fields, cookie, save-limit, additive claim merge, owner cleanup, scheduled cleanup, retention, redaction, and go-live gate contracts.',
    'Claiming a browser playground reuses an existing Free Build workspace when present and adds a private launch draft plus private claim records without replacing existing workspace work.',
    '/api/playground/cleanup is an owner-gated cleanup route for expiring old anonymous recovery without exposing private draft content.',
    'A Cloudflare Cron trigger runs the same expired-recovery cleanup boundary daily without touching claimed private records or go-live state.',
    '/content/source-data ties the pricing policy into audience and resource discovery records.'
  ),
  next_milestone = 'Parent scope is shipped; future expansion belongs in the relevant paid go-live workstream for publishing, checkout, subscriber sends, domains, fulfillment, or billing changes.',
  updated_at = unixepoch()
WHERE id = 'roadmap-free-build-before-go-live';

UPDATE admin_roadmap_items
SET
  next_milestone = 'Keep live subscriber import creation, checkout/payment credential migration, account transfer, domains, and fulfillment parked behind dedicated confirmed-write work; use the importer surface for private migration planning and cleanup until those gates ship.',
  updated_at = unixepoch()
WHERE id = 'roadmap-competitor-importers';
