UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Importer center, ClickFunnels import path, reusable source-data contract, and verified-publisher private ClickFunnels import creation for moving competitor platform context into private Bumpgrade launch workspaces before go-live.',
  public_evidence_json = json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '/imports lists supported importer paths.',
    '/imports/clickfunnels is the first dedicated ClickFunnels import path and private import-plan form.',
    '/imports/source-data exposes platform IDs, input kinds, generated private record types, safety gates, limitations, source evidence IDs, and the ClickFunnels private import API.',
    '/api/imports/clickfunnels/draft creates or reuses a verified publisher Free Build workspace and saves a private D1 funnel draft without public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.'
  ),
  next_milestone = 'Broaden importer writes into review screens, source-match duplicate detection, rollback/cleanup controls, and dedicated SamCart, Kit, Kajabi, Shopify, Podia, Systeme.io, Kartra, and ThriveCart private import paths.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-competitor-importers';

UPDATE admin_user_journeys
SET
  feature_status = 'live',
  source_evidence_json = '["https://bumpgrade.com/imports","https://bumpgrade.com/imports/clickfunnels","https://bumpgrade.com/imports/source-data","https://bumpgrade.com/api/imports/clickfunnels/draft","https://bumpgrade.com/compare/source-data","https://github.com/markitics/bumpgrade/issues/467"]',
  happy_path_json = '["Open /imports.","Choose the current platform, starting with ClickFunnels.","Add the strongest public URL, page copy, offer notes, and follow-up notes.","Sign in or create a verified publisher account.","Confirm the private ClickFunnels import action.","Bumpgrade creates or reuses a Free Build workspace and saves a private D1 funnel draft.","Use /imports/source-data when an agent needs stable importer IDs, input kinds, generated private record types, safety gates, limitations, source IDs, and the ClickFunnels private import API."]',
  edge_cases_json = '["Imported material starts in a private workspace and is not buyer-facing by default.","The ClickFunnels import API requires a verified publisher session, exact confirmation, idempotency, and redacted responses.","The response does not echo pasted source material, raw exports, customer rows, private emails, payment credentials, API keys, or session cookies.","Account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, fulfillment, and broader competitor import writes remain follow-up work.","Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims."]',
  agent_access = 'Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, generated private record types, safety gates, source IDs, limitations, and the ClickFunnels private import API. Creating a ClickFunnels private draft requires verified publisher auth, exact confirmation, idempotency, audit evidence, and redacted responses; public or billing-impacting import writes remain unavailable.',
  validation_json = '["Issue #467 adds /imports, /imports/clickfunnels, /imports/source-data, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.","The ClickFunnels private import API creates or reuses a Free Build workspace and saves a private D1 funnel draft with no public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.","Importer source-data and API responses keep raw exports, customer rows, private emails, payment credentials, API keys, session cookies, and pasted source material out of public responses."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-imports-from-clickfunnels';
