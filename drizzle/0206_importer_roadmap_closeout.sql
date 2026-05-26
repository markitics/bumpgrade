UPDATE admin_roadmap_items
SET
  status = 'live',
  summary = 'Importer center, dedicated platform import paths, public redacted review maps, private draft creation, checkout rebuild readiness, private subscriber import records, owner-only private subscriber inspection, imported-pending audience review-list promotion, owner-only private subscriber CSV export, and reusable source-data contract for moving competitor platform context into private Bumpgrade launch workspaces before go-live.',
  public_evidence_json = json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '`/imports` lists supported importer paths.',
    'Dedicated importer pages can show a redacted preflight review map before sign-in or private draft creation, including platform-specific source-guide readiness.',
    'Public preflight review can parse small CSV, JSON, HTML, or text exports for structure without saving raw files, rows, file names, or pasted text.',
    'Public preflight review matches parsed export structure against platform-specific templates before private draft creation.',
    'Dedicated importer pages list platform-specific source guides for the URLs, exports, files, and notes Bumpgrade can use.',
    'Dedicated importer pages support private Free Build import-plan creation.',
    'Private importer writes persist the safe importReview export analysis, platform export matches, and recognized match IDs on new private draft metadata.',
    'Private importer writes create structured private import records for matched offer, product, audience, checkout, funnel/page, sequence, and asset review areas.',
    'Verified publishers can open a private importer record review route for their own importer-created plan after creation.',
    'Verified publishers can mark private import records ready or needing cleanup without triggering buyer-facing changes.',
    'Verified publishers can record checkout migration readiness on private checkout-offer and product-catalog records without creating checkout intents, Stripe sessions, live payment credentials, public checkout routes, account transfer, domains, fulfillment, subscriber sends, or go-live effects.',
    'Private importer records include safe extracted field plans that show owner-review target fields without raw row values or private source content.',
    'Verified publishers can edit safe extracted field labels, review status, and prompts without storing raw extracted values or triggering buyer-facing changes.',
    'Private audience import records include safe subscriber import depth with aggregate row counts and identity, tag, consent, and sequence signals before any subscriber write exists.',
    'Verified publishers can record subscriber import preflight decisions for private audience records without creating subscriber rows, sequence enrollments, sends, private exports, or go-live effects.',
    'Verified publishers can create private importer subscriber records from a confirmed fresh upload or paste without sequence enrollments, sends, private exports, or go-live effects.',
    'Verified publishers can inspect saved private importer subscriber records from the same-owner private review page while public source-data and unauthenticated responses expose counts only.',
    'Verified publishers can add saved importer contacts to the audience review list as imported-pending subscriber rows without consent events, sequence enrollments, sends, private exports, or go-live effects.',
    'Verified publishers can download owner-only private subscriber CSV files from saved importer contacts after exact confirmation while public source-data, unauthenticated responses, and JSON API responses expose counts and redaction rules only.',
    '`/imports/source-data` exposes platform IDs, input kinds, platform-specific source checklists, export match templates, preflight signal labels, export-file parser fields, private structured import-record fields, extracted field plans, checkout migration readiness actions, subscriber import depth, subscriber import preflight actions, subscriber import creation actions, subscriber audience promotion actions, owner-only private subscriber record inspection rules, owner-only private subscriber export actions, private record review routes, review-action routes, extracted-field edit actions, saved private plan parts, preflight review routes, private-draft API routes, safety gates, limitations, and source evidence IDs for agents.',
    'Private importer writes reuse an existing draft when the same platform, workspace, normalized title, and source URL or export file name match.',
    'Private importer rollback routes archive private import plans without deleting saved plan content, structured private import records, steps, or audit history so the same source can be restarted.'
  ),
  next_milestone = 'Parent importer scope is shipped; keep sequence enrollment and sends, live checkout creation, payment credential migration, account transfer, domains, and fulfillment parked behind their dedicated confirmed-write workstreams.',
  updated_at = unixepoch()
WHERE id = 'roadmap-competitor-importers';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json,
  closed_prs_json, features_updated_json, roadmap_updated_json, user_journeys_updated_json,
  documentation_updated_json, validation_json, flags_attention, first_prompt_at, completed_at,
  relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-26-importer-roadmap-closeout',
  'Closed the importer roadmap parent as shipped',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Owner requested easy importers from ClickFunnels and competitor platforms, while preferring broad owner-visible workstream outcomes instead of many narrow readiness updates.',
  json_array(json_object('number', 467, 'url', 'https://github.com/markitics/bumpgrade/issues/467')),
  json_array(),
  json_array('https://bumpgrade.com/imports', 'https://bumpgrade.com/imports/source-data', 'https://bumpgrade.com/features/source-data'),
  json_array('roadmap-competitor-importers'),
  json_array('journey-prospect-imports-from-clickfunnels'),
  json_array('docs/features/importers.md'),
  json_array(
    'Roadmap fallback data marks the importer parent shipped while preserving separate go-live workstream boundaries.',
    'D1 migration updates /admin/roadmap and /admin/director source-data from active to live for roadmap-competitor-importers.',
    'Focused roadmap/importer source-data smoke coverage.',
    'Typecheck',
    'Lint',
    'Runtime secrets',
    'Cloudflare build'
  ),
  'No new importer write is enabled in this closeout. Sequence sends, live checkout creation, payment credential migration, account transfer, domains, and fulfillment remain parked in their dedicated confirmed-write workstreams.',
  unixepoch('2026-05-26T22:00:00Z'),
  unixepoch('2026-05-26T22:00:00Z'),
  json_array(
    'https://github.com/markitics/bumpgrade/issues/467',
    'https://bumpgrade.com/admin/roadmap/source-data',
    'https://bumpgrade.com/admin/director/source-data',
    'https://bumpgrade.com/admin/work-log/source-data',
    'https://bumpgrade.com/imports/source-data'
  ),
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  closed_prs_json=excluded.closed_prs_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  pr_comment_url=COALESCE(admin_work_log_entries.pr_comment_url, excluded.pr_comment_url),
  updated_at=unixepoch();
