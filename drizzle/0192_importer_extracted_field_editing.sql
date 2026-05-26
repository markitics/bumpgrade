UPDATE admin_roadmap_items
SET
  public_evidence_json = json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '/imports lists supported importer paths.',
    'Dedicated importer pages can show a redacted preflight review map before sign-in or private draft creation, including platform-specific source-guide readiness.',
    'Public preflight review can parse small CSV, JSON, HTML, or text exports for structure without saving raw files, rows, file names, or pasted text.',
    'Public preflight review matches parsed export structure against platform-specific templates before private draft creation.',
    'Dedicated importer pages list platform-specific source guides for the URLs, exports, files, and notes Bumpgrade can use.',
    'Dedicated importer pages support private Free Build import-plan creation.',
    'Private importer writes persist the safe importReview export analysis, platform export matches, and recognized match IDs on new private draft metadata.',
    'Private importer writes create structured private import records for matched offer, product, audience, checkout, funnel/page, sequence, and asset review areas.',
    'Private importer records include safe extracted field plans that show owner-review target fields without raw row values or private source content.',
    'Verified publishers can edit safe extracted field labels, review status, and prompts without storing raw extracted values or triggering buyer-facing changes.',
    'Verified publishers can open a private importer record review route for their own importer-created plan after creation.',
    'Verified publishers can mark private import records ready or needing cleanup without triggering buyer-facing changes.',
    '/imports/source-data exposes platform IDs, input kinds, platform-specific source checklists, export match templates, preflight signal labels, export-file parser fields, private structured import-record fields, extracted field plans, private record review routes, review-action routes, extracted-field edit actions, saved private plan parts, preflight review routes, private-draft API routes, safety gates, limitations, and source evidence IDs for agents.',
    'Private importer writes reuse an existing draft when the same platform, workspace, normalized title, and source URL or export file name match.',
    'Private importer rollback routes archive private import plans without deleting saved plan content, structured private import records, steps, or audit history so the same source can be restarted.'
  ),
  next_milestone = 'Use owner-edited importer record fields to add subscriber import depth behind explicit confirmed-write gates.',
  updated_at = unixepoch()
WHERE id = 'roadmap-competitor-importers';

UPDATE admin_user_journeys
SET
  happy_path_json = json_array(
    'Open /imports.',
    'Choose the current platform.',
    'Review the platform-specific source guide for the URLs, exports, files, and notes Bumpgrade can use.',
    'Add the strongest public URL, page copy, offer notes, export file names, follow-up notes, launch goal, and audience context.',
    'Upload or paste a small CSV, JSON, HTML, or text export so Bumpgrade can parse safe structure before any private record is created.',
    'Review the recognized platform export shape and matched safe header groups before private draft creation.',
    'Review the redacted import map before sign-in or private draft creation, including source-guide items that are ready, need more context, or need source material.',
    'Sign in or create a verified publisher account.',
    'Confirm the private importer action.',
    'Bumpgrade creates or reuses a Free Build workspace, saves a private import plan, keeps the safe importReview export analysis with the private draft, and creates structured private import records for matched review areas.',
    'Open the private record review route to inspect those structured records and safe extracted field targets before any go-live action.',
    'Edit safe extracted field labels, review status, and prompts before cleanup without saving raw source values.',
    'Mark each private record ready or needing cleanup so the next importer cleanup pass has explicit owner-reviewed state.',
    'Archive a private importer draft when the source map was wrong, then start a fresh import from the same source.',
    'Use /imports/source-data when an agent needs stable importer IDs, input kinds, source checklist items, export match templates, preflight signal labels, export-file parser fields, importReview persistence fields, structured private import-record fields, extracted field plans, private record review routes, review action routes, extracted-field edit actions, saved private plan parts, safety gates, limitations, source IDs, private import API routes, and rollback routes.'
  ),
  edge_cases_json = json_array(
    'Imported material starts in a private workspace and is not buyer-facing by default.',
    'The public review map does not create records or echo pasted source material, export file names, customer rows, private emails, payment credentials, API keys, session cookies, or payment data.',
    'Export-file parsing returns structural labels, counts, and header groups only; raw file names, raw rows, raw file text, private emails, customer values, credentials, and payment data stay out of responses.',
    'Platform export matches use safe header and signal labels only; they do not prove account transfer, subscriber sends, checkout migration, or fulfillment.',
    'Private importReview metadata stores safe export structure, platform export matches, and recognized match IDs only; it does not store raw rows, raw file text, customer rows, credentials, or go-live effects.',
    'Structured private import records store review-area summaries, safe match IDs, header labels, signal labels, counts, extracted field plans, and redaction flags; they do not store raw rows, raw file text, raw export file names, customer rows, credentials, or go-live effects.',
    'Extracted field plans contain Bumpgrade target labels and review prompts only; they do not store raw values, private emails, customer values, payment credentials, or buyer-facing state.',
    'Private extracted-field edit actions store field labels, review status, and prompts only; they reject source URLs and email-shaped private values and do not store raw extracted values.',
    'Private record review pages require the same verified publisher who created the import plan and show safe structure only.',
    'Private record review actions store ready or needs-cleanup decisions in private metadata only; they do not store confirmation text, expose idempotency keys, or trigger buyer-facing effects.',
    'Source-guide readiness exposes matched signal labels only, not the source URL, export file names, pasted copy, follow-up notes, launch goal, or private audience context.',
    'Platform-specific source guides explain useful material to bring, but they are not account-to-account transfer, credential use, or permission to scrape private platform data.',
    'Private import APIs require a verified publisher session, exact confirmation, idempotency, and redacted responses.',
    'Rollback APIs require the same verified publisher, the current draft revision, exact confirmation, and idempotency; they archive only private importer plans and preserve saved plan content, structured private import records, steps, and audit history.',
    'The response does not echo pasted source material, raw exports, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, and fulfillment remain follow-up work.',
    'Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims.'
  ),
  agent_access = 'Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, platform-specific source checklists, source checklist items, export match templates, preflight signal labels, redacted sourceChecklistReview maps, exportFileAnalysis fields, platformExportMatches, private importReview metadata persistence, structured private import-record contracts, extracted field plans, private record review routes, review action routes, extracted-field edit actions, duplicate-review fields, saved private plan parts, rollback routes, safety gates, source IDs, limitations, and private import API routes. Creating, reviewing, editing, or archiving a private import plan requires verified publisher auth, exact confirmation, idempotency, audit evidence, and redacted responses; public or billing-impacting import writes remain unavailable.',
  validation_json = json_array(
    'Issue #467 adds /imports, dedicated importer source guides, /imports/clickfunnels, /imports/source-data, public redacted preflight review, sourceChecklistReview maps, exportFileAnalysis parsing, platformExportMatches, structured private import records, extracted field plans, extracted-field editing, private record review, private record review actions, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.',
    'Private importer APIs create or reuse a Free Build workspace, save a private import plan, persist safe importReview export analysis, and create structured private import records with owner-editable extracted field plans and no public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.',
    'Private importer rollback APIs archive importer-created private plans, preserve saved plan content, structured import records, steps, and audit history, and let the same source restart as a fresh private plan.',
    'Importer source-data and API responses keep raw exports, customer rows, private emails, payment credentials, API keys, session cookies, export file names, raw values, and pasted source material out of public responses.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-prospect-imports-from-clickfunnels';
