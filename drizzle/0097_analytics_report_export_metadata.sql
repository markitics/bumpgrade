UPDATE admin_roadmap_items
SET
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    json_object(
      'label', 'Issue #263 aggregate analytics report export metadata',
      'url', 'https://github.com/markitics/bumpgrade/issues/263'
    )
  ),
  next_milestone = 'Add owner-reviewed cohort comparison evidence without exposing raw event rows or turning sparse experiment evidence into automated winner claims.',
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[18,87,105,107,119,121,123,125,127,129,261,263]',
  user_goal = 'Inspect seeded analytics definitions, capture privacy-safe test events, record browser-side funnel page views with deterministic variant and source attribution evidence, read dashboard-visible fixed-window aggregate source rows, assign deterministic variants, read aggregate conversion report rows, read aggregate report export metadata, and record owner-reviewed experiment decision evidence before cookies, contact-level reporting, traffic routing, or automated winners exist.',
  source_evidence_json = '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://bumpgrade.com/api/analytics/events","https://bumpgrade.com/api/analytics/assignments","https://bumpgrade.com/api/admin/analytics/experiment-decisions","https://bumpgrade.com/admin/analytics","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/funnels/indie-launch-sandbox","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87","https://github.com/markitics/bumpgrade/issues/105","https://github.com/markitics/bumpgrade/issues/107","https://github.com/markitics/bumpgrade/issues/119","https://github.com/markitics/bumpgrade/issues/121","https://github.com/markitics/bumpgrade/issues/123","https://github.com/markitics/bumpgrade/issues/125","https://github.com/markitics/bumpgrade/issues/127","https://github.com/markitics/bumpgrade/issues/129","https://github.com/markitics/bumpgrade/issues/261","https://github.com/markitics/bumpgrade/issues/263"]',
  happy_path_json = '["Fetch /analytics/source-data.","Find event IDs, page-view beacon boundary, aggregate source attribution counts, aggregate variant event counts, fixed time windows, metric IDs, aggregate event counts, aggregate conversion report rows, experiment IDs, variant IDs, assignment rule, assignment API, dashboard source section, and write boundary.","Fetch /analytics/source-data?window=24h to inspect public-safe aggregate source and conversion rows for one supported fixed window.","Open /funnels/indie-launch-sandbox with safe UTM parameters and let the session-idempotent page-view beacon assign a variant and record a seeded event with that variant ID and normalized source attribution.","POST a seeded event to /api/analytics/events with an idempotency key and source route.","POST a seeded experiment assignment to /api/analytics/assignments with an anonymous assignment key, idempotency key, and source route.","Read reportExports from /analytics/source-data to inspect aggregate report sections, selected fixed window, sample-size caveats, and fixture cohort definitions.","Open /admin/analytics as a verified owner and record a redacted experiment decision with the current aggregate assignment counts, fixed-window conversion sample size, and sample-size caveat acknowledgement.","Confirm duplicate idempotency returns the same public-safe event or assignment without duplicating rows.","Open /analytics/indie-launch-dashboard to inspect the public preview, aggregate source rows, fixed-window controls, and caveats."]',
  edge_cases_json = '["Public source-data exposes aggregate counts, aggregate source attribution counts, aggregate variant counts, fixed-window metadata, report export metadata, and conversion rows only, not raw event or assignment rows.","Unsupported event IDs, experiment IDs, source routes, missing idempotency keys, and missing assignment keys return public-safe validation errors.","Bot, crawler, and preview/test-suppressed page-view traffic is ignored before analytics event rows are created.","Cookie assignment, contact-level analytics, raw referrer/query reporting, experiment traffic changes, automated winners, and revenue claims remain disabled even after owner decision evidence is recorded.","Agents must include sample-size caveats and must not call sparse test events or assignments statistically meaningful."]',
  agent_access = 'Agents can read /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard, event capture boundaries, page-view beacon boundaries, dashboard-visible fixed-window aggregate source attribution evidence, aggregate variant evidence, assignment boundaries, aggregate conversion report rows, aggregate report export metadata, and redacted experiment decision evidence. Owner sessions can record decision evidence through /api/admin/analytics/experiment-decisions. Direct public agent analytics writes, custom events, raw campaign/referrer reporting, raw analytics exports, experiment routing, automated winners, and revenue claims require future authenticated confirmed-write APIs with privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.',
  validation_json = '["Playwright covers /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard fixed-window source attribution UI, /admin/analytics owner decision evidence, aggregate report export metadata, event ingestion, page-view beacon capture with variant and source attribution evidence, bot suppression, assignment ingestion, conversion reporting from captured events, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.","Issues #87, #105, #107, #119, #121, #123, #125, #127, #129, #261, and #263 record the analytics source-data scaffold, first privacy-safe event capture path, first deterministic assignment path, first aggregate conversion report, first browser-side funnel page-view beacon, first variant-linked page-view evidence, first aggregate source attribution evidence, first dashboard-visible source breakdown, first fixed-window aggregate filters, first owner-confirmed experiment decision evidence, and first aggregate report export metadata."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-21-analytics-report-export-metadata',
  'Added aggregate analytics report export metadata',
  'Codex',
  'codex',
  'bumpgrade-bootstrap',
  'Continue the Bumpgrade parity build and add public-safe analytics report export evidence for agents.',
  '[{"number":263,"url":"https://github.com/markitics/bumpgrade/issues/263"},{"number":18,"url":"https://github.com/markitics/bumpgrade/issues/18"}]',
  '[{"number":264,"url":"https://github.com/markitics/bumpgrade/pull/264"}]',
  '["https://bumpgrade.com/features","https://bumpgrade.com/analytics/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["src/lib/analytics-report-exports.ts","src/app/analytics/source-data/route.ts","src/lib/agent-manifest.ts","docs/features/analytics-experiments.md","drizzle/0097_analytics_report_export_metadata.sql"]',
  '["npm run lint","npm run typecheck","npm run cf:build","Focused analytics source-data, agent docs, admin source-data, and user-journey smoke tests"]',
  NULL,
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/agent-docs/source-data","https://github.com/markitics/bumpgrade/issues/263","https://github.com/markitics/bumpgrade/pull/264"]',
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  github_issues_json = excluded.github_issues_json,
  closed_prs_json = excluded.closed_prs_json,
  features_updated_json = excluded.features_updated_json,
  roadmap_updated_json = excluded.roadmap_updated_json,
  user_journeys_updated_json = excluded.user_journeys_updated_json,
  documentation_updated_json = excluded.documentation_updated_json,
  validation_json = excluded.validation_json,
  flags_attention = excluded.flags_attention,
  completed_at = excluded.completed_at,
  relevant_urls_json = excluded.relevant_urls_json,
  pr_comment_url = excluded.pr_comment_url,
  updated_at = excluded.updated_at;
