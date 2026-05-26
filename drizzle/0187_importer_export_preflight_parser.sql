UPDATE admin_roadmap_items
SET
  public_evidence_json = json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '/imports lists supported importer paths.',
    'Dedicated importer pages can show a redacted preflight review map before sign-in or private draft creation, including platform-specific source-guide readiness.',
    'Public preflight review can parse small CSV, JSON, HTML, or text exports for structure without saving raw files, rows, file names, or pasted text.',
    'Dedicated importer pages list platform-specific source guides for the URLs, exports, files, and notes Bumpgrade can use.',
    'Dedicated importer pages support private Free Build import-plan creation.',
    '/imports/source-data exposes platform IDs, input kinds, platform-specific source checklists, preflight signal labels, export-file parser fields, saved private plan parts, preflight review routes, private-draft API routes, rollback routes, safety gates, limitations, and source evidence IDs for agents.',
    'Private importer writes reuse an existing draft when the same platform, workspace, normalized title, and source URL or export file name match.',
    'Private importer rollback routes archive private import plans without deleting saved plan content, steps, or audit history so the same source can be restarted.'
  ),
  next_milestone = 'Add deeper platform-specific extraction from parsed exports, then subscriber import depth behind explicit confirmed-write gates.',
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
    'Review the redacted import map before sign-in or private draft creation, including source-guide items that are ready, need more context, or need source material.',
    'Sign in or create a verified publisher account.',
    'Confirm the private importer action.',
    'Bumpgrade creates or reuses a Free Build workspace and saves a private import plan.',
    'Archive a private importer draft when the source map was wrong, then start a fresh import from the same source.',
    'Use /imports/source-data when an agent needs stable importer IDs, input kinds, source checklist items, preflight signal labels, export-file parser fields, saved private plan parts, safety gates, limitations, source IDs, private import API routes, and rollback routes.'
  ),
  edge_cases_json = json_array(
    'Imported material starts in a private workspace and is not buyer-facing by default.',
    'The public review map does not create records or echo pasted source material, export file names, customer rows, private emails, payment credentials, API keys, session cookies, or payment data.',
    'Export-file parsing returns structural labels, counts, and header groups only; raw file names, raw rows, raw file text, private emails, customer values, credentials, and payment data stay out of responses.',
    'Source-guide readiness exposes matched signal labels only, not the source URL, export file names, pasted copy, follow-up notes, launch goal, or private audience context.',
    'Platform-specific source guides explain useful material to bring, but they are not account-to-account transfer, credential use, or permission to scrape private platform data.',
    'Private import APIs require a verified publisher session, exact confirmation, idempotency, and redacted responses.',
    'Rollback APIs require the same verified publisher, the current draft revision, exact confirmation, and idempotency; they archive only private importer plans and preserve saved plan content, steps, and audit history.',
    'The private draft and rollback responses do not echo pasted source material, raw exports, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, and fulfillment remain follow-up work.',
    'Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims.'
  ),
  agent_access = 'Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, platform-specific source checklists, source checklist items, preflight signal labels, redacted sourceChecklistReview maps, exportFileAnalysis fields, duplicate-review fields, saved private plan parts, rollback routes, safety gates, source IDs, limitations, and private import API routes. Creating or archiving a private import plan requires verified publisher auth, exact confirmation, idempotency, audit evidence, and redacted responses; public or billing-impacting import writes remain unavailable.',
  validation_json = json_array(
    'Issue #467 adds /imports, dedicated importer source guides, /imports/clickfunnels, /imports/source-data, public redacted preflight review, sourceChecklistReview maps, exportFileAnalysis parsing, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.',
    'Private importer APIs create or reuse a Free Build workspace and save a private import plan with no public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.',
    'Private importer rollback APIs archive importer-created private plans, preserve saved plan content, steps, and audit history, and let the same source restart as a fresh private plan.',
    'Importer source-data and API responses keep raw exports, raw rows, raw file text, customer rows, private emails, payment credentials, API keys, session cookies, export file names, and pasted source material out of public responses.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-prospect-imports-from-clickfunnels';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json,
  closed_prs_json, features_updated_json, roadmap_updated_json, user_journeys_updated_json,
  documentation_updated_json, validation_json, flags_attention, first_prompt_at, completed_at,
  relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-25-importer-export-preflight-parser',
  'Added redacted importer export-file preflight parsing',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for easy importers from ClickFunnels and competitor platforms, with public copy for real prospects and their agents.',
  json_array(json_object('number', 467, 'url', 'https://github.com/markitics/bumpgrade/issues/467')),
  json_array(),
  json_array('https://bumpgrade.com/imports', 'https://bumpgrade.com/imports/source-data', 'https://bumpgrade.com/imports/samcart'),
  json_array('roadmap-competitor-importers'),
  json_array('journey-prospect-imports-from-clickfunnels'),
  json_array('docs/features/importers.md', 'docs/agent/agent-ready.md', 'public/llms.txt'),
  json_array('Focused importer export-file preflight parser and redaction smoke coverage', 'typecheck', 'lint', 'runtime secrets', 'Cloudflare build'),
  NULL,
  unixepoch() - 1800,
  unixepoch(),
  json_array('https://bumpgrade.com/imports/source-data', 'https://bumpgrade.com/imports/samcart', 'https://bumpgrade.com/admin/work-log'),
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
