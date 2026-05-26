UPDATE admin_roadmap_items
SET
  summary = 'Importer center, dedicated platform import paths, public redacted review maps, private draft creation, private subscriber import records, and reusable source-data contract for moving competitor platform context into private Bumpgrade launch workspaces before go-live.',
  public_evidence_json = json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '`/imports` lists supported importer paths.',
    'Dedicated importer pages can show a redacted preflight review map before sign-in or private draft creation, including platform-specific source-guide readiness.',
    'Public preflight review can parse small CSV, JSON, HTML, or text exports for structure without saving raw files, rows, file names, or pasted text.',
    'Public preflight review now matches parsed export structure against platform-specific templates before private draft creation.',
    'Dedicated importer pages now list platform-specific source guides for the URLs, exports, files, and notes Bumpgrade can use.',
    'Dedicated importer pages support private Free Build import-plan creation.',
    'Private importer writes now persist the safe importReview export analysis, platform export matches, and recognized match IDs on new private draft metadata.',
    'Private importer writes now create structured private import records for matched offer, product, audience, checkout, funnel/page, sequence, and asset review areas.',
    'Verified publishers can open a private importer record review route for their own importer-created plan after creation.',
    'Verified publishers can mark private import records ready or needing cleanup without triggering buyer-facing changes.',
    'Private importer records now include safe extracted field plans that show owner-review target fields without raw row values or private source content.',
    'Verified publishers can edit safe extracted field labels, review status, and prompts without storing raw extracted values or triggering buyer-facing changes.',
    'Private audience import records now include safe subscriber import depth with aggregate row counts and identity, tag, consent, and sequence signals before any subscriber write exists.',
    'Verified publishers can record subscriber import preflight decisions for private audience records without creating subscriber rows, sequence enrollments, sends, private exports, or go-live effects.',
    'Verified publishers can create private importer subscriber records from a confirmed fresh upload or paste without creating global audience send-list rows, sequence enrollments, sends, private exports, or go-live effects.',
    '`/imports/source-data` exposes platform IDs, input kinds, platform-specific source checklists, export match templates, preflight signal labels, export-file parser fields, private structured import-record fields, extracted field plans, subscriber import depth, subscriber import preflight actions, subscriber import creation actions, private record review routes, review-action routes, extracted-field edit actions, saved private plan parts, preflight review routes, private-draft API routes, safety gates, limitations, and source evidence IDs for agents.',
    'Private importer writes reuse an existing draft when the same platform, workspace, normalized title, and source URL or export file name match.',
    'Private importer rollback routes archive private import plans without deleting saved plan content, structured private import records, steps, or audit history so the same source can be restarted.'
  ),
  next_milestone = 'Keep global audience send-list promotion, sequence enrollment and sends, private exports, checkout/payment credential migration, account transfer, domains, and fulfillment parked behind dedicated confirmed-write work; use the importer surface for private migration planning and cleanup until those gates ship.',
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
    'For audience imports, review subscriber import depth with aggregate contact-row counts and safe identity, tag, consent, and sequence signals before any private subscriber import creation.',
    'Record subscriber import preflight readiness or cleanup on private audience records before saving private importer subscriber records.',
    'Create private importer subscriber records from a confirmed fresh upload or paste when the subscriber preflight is ready.',
    'Edit safe extracted field labels, review status, and prompts before cleanup without saving raw source values.',
    'Mark each private record ready or needing cleanup so the next importer cleanup pass has explicit owner-reviewed state.',
    'Archive a private importer draft when the source map was wrong, then start a fresh import from the same source.',
    'Use /imports/source-data when an agent needs stable importer IDs, input kinds, source checklist items, export match templates, preflight signal labels, export-file parser fields, importReview persistence fields, structured private import-record fields, extracted field plans, subscriber import depth, subscriber import preflight actions, subscriber import creation actions, private record review routes, review action routes, extracted-field edit actions, saved private plan parts, safety gates, limitations, source IDs, private import API routes, and rollback routes.'
  ),
  edge_cases_json = json_array(
    'Imported material starts in a private workspace and is not buyer-facing by default.',
    'The public review map does not create records or echo pasted source material, export file names, customer rows, private emails, payment credentials, API keys, session cookies, or payment data.',
    'Export-file parsing returns structural labels, counts, and header groups only; raw file names, raw rows, raw file text, private emails, customer values, credentials, and payment data stay out of responses.',
    'Platform export matches use safe header and signal labels only; they do not prove account transfer, subscriber sends, checkout migration, or fulfillment.',
    'Private importReview metadata stores safe export structure, platform export matches, and recognized match IDs only; it does not store raw rows, raw file text, customer rows, credentials, or go-live effects.',
    'Structured private import records store review-area summaries, safe match IDs, header labels, signal labels, counts, extracted field plans, and redaction flags; they do not store raw rows, raw file text, raw export file names, customer rows, credentials, or go-live effects.',
    'Subscriber import depth stores aggregate row counts and safe label groups only; it does not create private subscriber records, store raw emails or names, enroll sequences, send email, enable exports, or expose contact values.',
    'Subscriber import preflight actions store readiness or cleanup metadata only; they do not create private subscriber records, enroll sequences, send email, enable exports, or expose contact values.',
    'Subscriber import creation stores normalized private subscriber records scoped to the private import plan after a confirmed fresh upload or paste; public responses expose counts only and do not create global audience send-list rows, enroll sequences, send email, enable exports, or expose contact values.',
    'Extracted field plans contain Bumpgrade target labels and review prompts only; they do not store raw values, private emails, customer values, payment credentials, or buyer-facing state.',
    'Private record review pages require the same verified publisher who created the import plan and show safe structure only.',
    'Private record review actions store ready or needs-cleanup decisions in private metadata only; they do not store confirmation text, expose idempotency keys, or trigger buyer-facing effects.',
    'Private extracted-field edit actions store field labels, review status, and prompts only; they reject source URLs and email-shaped private values and do not store raw extracted values.',
    'Source-guide readiness exposes matched signal labels only, not the source URL, export file names, pasted copy, follow-up notes, launch goal, or private audience context.',
    'Platform-specific source guides explain useful material to bring, but they are not account-to-account transfer, credential use, or permission to scrape private platform data.',
    'Private import APIs require a verified publisher session, exact confirmation, idempotency, and redacted responses.',
    'Rollback APIs require the same verified publisher, the current draft revision, exact confirmation, and idempotency; they archive only private importer plans and preserve saved plan content, structured private import records, steps, and audit history.',
    'The response does not echo pasted source material, raw exports, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Global audience send-list import, account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, and fulfillment remain follow-up work.',
    'Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims.'
  ),
  agent_access = 'Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, platform-specific source checklists, source checklist items, export match templates, preflight signal labels, redacted sourceChecklistReview maps, exportFileAnalysis fields, platformExportMatches, private importReview metadata persistence, structured private import-record contracts, extracted field plans, subscriber import depth, subscriber import preflight actions, subscriber import creation actions, private record review routes, review action routes, extracted-field edit actions, duplicate-review fields, saved private plan parts, rollback routes, safety gates, source IDs, limitations, and private import API routes. Creating, reviewing, editing, importing private subscriber records, or archiving a private import plan requires verified publisher auth, exact confirmation, idempotency, audit evidence, and redacted responses; public or billing-impacting import writes remain unavailable.',
  validation_json = json_array(
    'Issue #467 adds /imports, dedicated importer source guides, /imports/clickfunnels, /imports/source-data, public redacted preflight review, sourceChecklistReview maps, exportFileAnalysis parsing, platformExportMatches, structured private import records, extracted field plans, subscriber import depth, subscriber import preflight actions, private subscriber import creation, extracted-field editing, private record review, private record review actions, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.',
    'Private importer APIs create or reuse a Free Build workspace, save a private import plan, persist safe importReview export analysis, and create structured private import records with extracted field plans, subscriber import depth, subscriber preflight metadata, private subscriber import records, and no public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.',
    'Private importer rollback APIs archive importer-created private plans, preserve saved plan content, structured import records, steps, and audit history, and let the same source restart as a fresh private plan.',
    'Importer source-data and API responses keep raw exports, customer rows, private emails, payment credentials, API keys, session cookies, export file names, and pasted source material out of public responses.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-prospect-imports-from-clickfunnels';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json,
  closed_prs_json, features_updated_json, roadmap_updated_json, user_journeys_updated_json,
  documentation_updated_json, validation_json, flags_attention, first_prompt_at, completed_at,
  relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-26-importer-subscriber-record-creation',
  'Added private subscriber record creation to importer review',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for easy importers from ClickFunnels and competitor platforms, with real-human public copy and agent-readable contracts.',
  json_array(json_object('number', 467, 'url', 'https://github.com/markitics/bumpgrade/issues/467')),
  json_array(),
  json_array('https://bumpgrade.com/imports', 'https://bumpgrade.com/imports/source-data', 'https://bumpgrade.com/imports/kit/review'),
  json_array('roadmap-competitor-importers'),
  json_array('journey-prospect-imports-from-clickfunnels'),
  json_array('docs/features/importers.md', 'docs/agent/agent-ready.md', 'public/llms.txt'),
  json_array('Focused private Kit audience importer subscriber-creation and redaction smoke coverage', 'typecheck', 'lint', 'runtime secrets', 'Cloudflare build'),
  'Private subscriber import records stay scoped to importer review; global audience send-list import, sequence enrollment, sends, private exports, and go-live effects remain parked behind later confirmed-write gates.',
  unixepoch() - 1800,
  unixepoch(),
  json_array('https://bumpgrade.com/imports/source-data', 'https://bumpgrade.com/imports/kit/review', 'https://bumpgrade.com/pr-screenshots/issue-467-subscriber-import-creation.png', 'https://bumpgrade.com/admin/work-log'),
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  updated_at=unixepoch();
