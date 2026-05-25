UPDATE admin_roadmap_items
SET
  summary = 'Importer center, dedicated platform import paths, public redacted review maps, private draft creation, rollback/restart controls, and reusable source-data contract for moving competitor platform context into private Bumpgrade launch workspaces before go-live.',
  public_evidence_json = json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '/imports lists supported importer paths.',
    'Dedicated importer pages can show a redacted preflight review map before sign-in or private draft creation.',
    'Dedicated importer pages support private Free Build import-plan creation.',
    '/imports/source-data exposes platform IDs, input kinds, generated private record types, preflight review routes, private-draft API routes, rollback routes, safety gates, limitations, and source evidence IDs for agents.',
    'Private importer writes reuse an existing draft when the same platform, workspace, normalized title, and source URL or export file name match.',
    'Private importer rollback routes archive private drafts without deleting draft rows, step rows, or audit rows so the same source can be restarted.'
  ),
  next_milestone = 'Add deeper platform-specific extraction after shared review, private draft, duplicate review, and rollback/restart paths are stable.',
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
    'https://bumpgrade.com/api/imports/samcart/draft/rollback',
    'https://bumpgrade.com/pr-screenshots/issue-467-importer-preflight-review.png',
    'https://bumpgrade.com/compare/source-data',
    'https://github.com/markitics/bumpgrade/issues/467'
  ),
  happy_path_json = json_array(
    'Open /imports.',
    'Choose the current platform.',
    'Add the strongest public URL, page copy, offer notes, export file names, and follow-up notes.',
    'Review the redacted import map before sign-in or private draft creation.',
    'Sign in or create a verified publisher account.',
    'Confirm the private importer action.',
    'Bumpgrade creates or reuses a Free Build workspace and saves a private D1 funnel draft.',
    'Archive a private importer draft when the source map was wrong, then start a fresh import from the same source.',
    'Use /imports/source-data when an agent needs stable importer IDs, input kinds, preflight review routes, generated private record types, safety gates, limitations, source IDs, private import API routes, and rollback routes.'
  ),
  edge_cases_json = json_array(
    'Imported material starts in a private workspace and is not buyer-facing by default.',
    'The public review map does not create records or echo pasted source material, export file names, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Private import APIs require a verified publisher session, exact confirmation, idempotency, and redacted responses.',
    'Rollback APIs require the same verified publisher, the current draft revision, exact confirmation, and idempotency; they archive only private importer drafts and do not delete draft rows, step rows, or audit rows.',
    'The private draft and rollback responses do not echo pasted source material, raw exports, customer rows, private emails, payment credentials, API keys, or session cookies.',
    'Account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, and fulfillment remain follow-up work.',
    'Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims.'
  ),
  agent_access = 'Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, redacted preflight review routes, duplicate-review fields, generated private record types, rollback routes, safety gates, source IDs, limitations, and private import API routes. Creating or archiving a private draft requires verified publisher auth, exact confirmation, idempotency, audit evidence, and redacted responses; public or billing-impacting import writes remain unavailable.',
  validation_json = json_array(
    'Issue #467 adds /imports, dedicated importer pages, /imports/source-data, public redacted preflight review, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.',
    'Private importer APIs create or reuse a Free Build workspace and save a private D1 funnel draft with no public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.',
    'Private importer rollback APIs archive importer-created private drafts, preserve draft rows, step rows, and audit rows, and let the same source restart as a fresh private plan.',
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
  'work-log-2026-05-25-importer-rollback-restart-controls',
  'Added private importer rollback and restart controls',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for easy importer flows and public copy that is geared toward real users; the build goal called for broad owner-visible workflow progress without noisy narrow status.',
  json_array(json_object('number', 467, 'url', 'https://github.com/markitics/bumpgrade/issues/467')),
  json_array(),
  json_array('feature-competitor-importers'),
  json_array('roadmap-competitor-importers'),
  json_array('journey-prospect-imports-from-clickfunnels'),
  json_array('docs/features/importers.md', 'docs/agent/agent-ready.md', 'public/llms.txt'),
  json_array('Focused importer source-data and verified-publisher create rollback restart smoke coverage', 'typecheck', 'lint', 'runtime secrets', 'Cloudflare build'),
  NULL,
  unixepoch() - 1800,
  unixepoch(),
  json_array('https://bumpgrade.com/imports/source-data', 'https://bumpgrade.com/api/imports/samcart/draft/rollback', 'https://bumpgrade.com/admin/work-log'),
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
