UPDATE admin_roadmap_items
SET
  public_evidence_json = json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '/imports lists supported importer paths.',
    'Dedicated importer pages can show a redacted preflight review map before sign-in or private draft creation.',
    'Dedicated importer pages support private Free Build import-plan creation.',
    '/imports/source-data exposes platform IDs, input kinds, saved private plan parts, preflight review routes, private-draft API routes, rollback routes, safety gates, limitations, and source evidence IDs for agents.',
    'Private importer writes reuse an existing draft when the same platform, workspace, normalized title, and source URL or export file name match.',
    'Private importer rollback routes archive private import plans without deleting saved plan content, steps, or audit history so the same source can be restarted.'
  ),
  updated_at = unixepoch()
WHERE id = 'roadmap-competitor-importers';

UPDATE admin_user_journeys
SET
  happy_path_json = json_array(
    'Open /imports.',
    'Choose the current platform.',
    'Add the strongest public URL, page copy, offer notes, export file names, and follow-up notes.',
    'Review the redacted import map before sign-in or private draft creation.',
    'Sign in or create a verified publisher account.',
    'Confirm the private importer action.',
    'Bumpgrade creates or reuses a Free Build workspace and saves a private import plan.',
    'Archive a private importer draft when the source map was wrong, then start a fresh import from the same source.',
    'Use /imports/source-data when an agent needs stable importer IDs, input kinds, saved private plan parts, safety gates, limitations, source IDs, private import API routes, and rollback routes.'
  ),
  edge_cases_json = json_array(
    'Imported material starts in a private workspace and is not buyer-facing by default.',
    'The public review map does not create records or echo pasted source material, export file names, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Private import APIs require a verified publisher session, exact confirmation, idempotency, and redacted responses.',
    'Rollback APIs require the same verified publisher, the current draft revision, exact confirmation, and idempotency; they archive only private importer plans and preserve saved plan content, steps, and audit history.',
    'The private draft and rollback responses do not echo pasted source material, raw exports, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, and fulfillment remain follow-up work.',
    'Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims.'
  ),
  agent_access = 'Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, redacted preflight review routes, duplicate-review fields, saved private plan parts, rollback routes, safety gates, source IDs, limitations, and private import API routes. Creating or archiving a private import plan requires verified publisher auth, exact confirmation, idempotency, audit evidence, and redacted responses; public or billing-impacting import writes remain unavailable.',
  validation_json = json_array(
    'Issue #467 adds /imports, dedicated importer pages, /imports/source-data, public redacted preflight review, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.',
    'Private importer APIs create or reuse a Free Build workspace and save a private import plan with no public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.',
    'Private importer rollback APIs archive importer-created private plans, preserve saved plan content, steps, and audit history, and let the same source restart as a fresh private plan.',
    'Importer source-data and API responses keep raw exports, customer rows, private emails, payment credentials, API keys, session cookies, export file names, and pasted source material out of public responses.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-prospect-imports-from-clickfunnels';
