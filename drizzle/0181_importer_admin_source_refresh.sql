UPDATE admin_roadmap_items
SET
  summary = 'Importer center, dedicated platform import paths, public redacted review maps, private draft creation, and reusable source-data contract for moving competitor platform context into private Bumpgrade launch workspaces before go-live.',
  public_evidence_json = json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '/imports lists supported importer paths.',
    'Dedicated importer pages can show a redacted preflight review map before sign-in or private draft creation.',
    'Dedicated importer pages support private Free Build import-plan creation.',
    '/imports/source-data exposes platform IDs, input kinds, generated private record types, preflight review routes, private-draft API routes, safety gates, limitations, and source evidence IDs for agents.',
    'Private importer writes reuse an existing draft when the same platform, workspace, normalized title, and source URL or export file name match.'
  ),
  next_milestone = 'Add rollback controls and deeper platform-specific extraction after the shared review and private draft paths are stable.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-competitor-importers';

UPDATE admin_user_journeys
SET
  feature_status = 'live',
  source_evidence_json = json_array(
    'https://bumpgrade.com/imports',
    'https://bumpgrade.com/imports/clickfunnels',
    'https://bumpgrade.com/imports/samcart',
    'https://bumpgrade.com/imports/source-data',
    'https://bumpgrade.com/api/imports/samcart/preview',
    'https://bumpgrade.com/api/imports/samcart/draft',
    'https://bumpgrade.com/pr-screenshots/issue-467-importer-preflight-review.png',
    'https://bumpgrade.com/compare/source-data',
    'https://github.com/markitics/bumpgrade/issues/467',
    'https://github.com/markitics/bumpgrade/pull/494'
  ),
  happy_path_json = json_array(
    'Open /imports.',
    'Choose the current platform.',
    'Add the strongest public URL, page copy, offer notes, export file names, and follow-up notes.',
    'Review the redacted import map before sign-in or private draft creation.',
    'Sign in or create a verified publisher account.',
    'Confirm the private importer action.',
    'Bumpgrade creates or reuses a Free Build workspace and saves a private D1 funnel draft.',
    'Use /imports/source-data when an agent needs stable importer IDs, input kinds, preflight review routes, generated private record types, safety gates, limitations, source IDs, and private import API routes.'
  ),
  edge_cases_json = json_array(
    'Imported material starts in a private workspace and is not buyer-facing by default.',
    'The public review map does not create records or echo pasted source material, export file names, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Private import APIs require a verified publisher session, exact confirmation, idempotency, and redacted responses.',
    'The private draft response does not echo pasted source material, raw exports, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, and fulfillment remain follow-up work.',
    'Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims.'
  ),
  agent_access = 'Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, redacted preflight review routes, duplicate-review fields, generated private record types, safety gates, source IDs, limitations, and private import API routes. Public preflight review routes return redacted maps without record creation. Creating a private draft requires verified publisher auth, exact confirmation, idempotency, audit evidence, and redacted responses; public or billing-impacting import writes remain unavailable.',
  validation_json = json_array(
    'Issue #467 adds /imports, dedicated importer pages, /imports/source-data, public redacted preflight review, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.',
    'Private importer APIs create or reuse a Free Build workspace and save a private D1 funnel draft with no public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.',
    'Importer source-data and API responses keep raw exports, customer rows, private emails, payment credentials, API keys, session cookies, export file names, and pasted source material out of public responses.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-prospect-imports-from-clickfunnels';
