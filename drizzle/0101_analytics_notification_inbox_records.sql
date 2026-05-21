CREATE TABLE IF NOT EXISTS analytics_notification_inbox_records (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  readiness_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  record_kind TEXT NOT NULL,
  time_window_key TEXT NOT NULL,
  expected_dashboard_revision_id TEXT NOT NULL,
  expected_readiness_status TEXT NOT NULL,
  expected_owner_review_status TEXT NOT NULL,
  expected_alert_threshold_count INTEGER NOT NULL DEFAULT 0,
  expected_conversion_sample_size INTEGER NOT NULL DEFAULT 0,
  sample_size_caveat_acknowledged INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  admin_inbox_record_created INTEGER NOT NULL DEFAULT 0,
  email_send_enabled INTEGER NOT NULL DEFAULT 0,
  queue_dispatch_enabled INTEGER NOT NULL DEFAULT 0,
  customer_alert_enabled INTEGER NOT NULL DEFAULT 0,
  traffic_routing_enabled INTEGER NOT NULL DEFAULT 0,
  automated_winner_enabled INTEGER NOT NULL DEFAULT 0,
  revenue_claim_enabled INTEGER NOT NULL DEFAULT 0,
  raw_analytics_rows_exposed INTEGER NOT NULL DEFAULT 0,
  recipient_identity_included INTEGER NOT NULL DEFAULT 0,
  email_body_included INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_notification_inbox_records_idempotency_unique
  ON analytics_notification_inbox_records(idempotency_key);
CREATE INDEX IF NOT EXISTS analytics_notification_inbox_records_dashboard_time_idx
  ON analytics_notification_inbox_records(dashboard_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_notification_inbox_records_readiness_channel_idx
  ON analytics_notification_inbox_records(readiness_id, channel_id, created_at);

UPDATE admin_roadmap_items
SET
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    json_object(
      'label', 'Issue #271 owner-confirmed analytics notification inbox records',
      'url', 'https://github.com/markitics/bumpgrade/issues/271'
    )
  ),
  summary = 'Privacy-safe analytics event capture, session-idempotent funnel page-view beacons with deterministic variant and normalized source attribution evidence, dashboard-visible fixed-window aggregate source breakdowns, deterministic seeded experiment assignment, aggregate funnel conversion reports, aggregate report exports, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed experiment decision evidence, attribution boundaries, and source-linked reporting.',
  next_milestone = 'Add analytics owner notification dispatch preflights only after inbox records keep recipients, email bodies, queues, customer alerts, and sends disabled.',
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[18,87,105,107,119,121,123,125,127,129,261,263,265,267,269,271]',
  user_goal = 'Inspect seeded analytics definitions, capture privacy-safe test events, record browser-side funnel page views with deterministic variant and source attribution evidence, read dashboard-visible fixed-window aggregate source rows, assign deterministic variants, read aggregate conversion report rows, read aggregate report export metadata, read owner-reviewed cohort comparison evidence, read owner-reviewed alert threshold/anomaly-review evidence, read owner-reviewed notification delivery readiness evidence, record owner-confirmed notification inbox records, and record owner-reviewed experiment decision evidence before cookies, contact-level reporting, automated alert sends, owner email sends, queue dispatch, traffic routing, automated winners, or revenue claims exist.',
  source_evidence_json = '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://bumpgrade.com/api/analytics/events","https://bumpgrade.com/api/analytics/assignments","https://bumpgrade.com/api/admin/analytics/experiment-decisions","https://bumpgrade.com/api/admin/analytics/notification-inbox-records","https://bumpgrade.com/admin/analytics","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/funnels/indie-launch-sandbox","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87","https://github.com/markitics/bumpgrade/issues/105","https://github.com/markitics/bumpgrade/issues/107","https://github.com/markitics/bumpgrade/issues/119","https://github.com/markitics/bumpgrade/issues/121","https://github.com/markitics/bumpgrade/issues/123","https://github.com/markitics/bumpgrade/issues/125","https://github.com/markitics/bumpgrade/issues/127","https://github.com/markitics/bumpgrade/issues/129","https://github.com/markitics/bumpgrade/issues/261","https://github.com/markitics/bumpgrade/issues/263","https://github.com/markitics/bumpgrade/issues/265","https://github.com/markitics/bumpgrade/issues/267","https://github.com/markitics/bumpgrade/issues/269","https://github.com/markitics/bumpgrade/issues/271"]',
  happy_path_json = '["Fetch /analytics/source-data.","Find event IDs, page-view beacon boundary, aggregate source attribution counts, aggregate variant event counts, fixed time windows, metric IDs, aggregate event counts, aggregate conversion report rows, experiment IDs, variant IDs, assignment rule, assignment API, dashboard source section, and write boundary.","Fetch /analytics/source-data?window=24h to inspect public-safe aggregate source and conversion rows for one supported fixed window.","Read reportExports from /analytics/source-data to inspect aggregate report sections, selected fixed window, sample-size caveats, fixture cohort definitions, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, and owner-reviewed notification delivery readiness evidence.","Read notificationInboxRecords from /analytics/source-data to inspect owner-confirmed inbox record counts, current readiness evidence, and redaction flags.","Open /admin/analytics as a verified owner and record a redacted notification inbox record with the current readiness status, selected fixed-window sample size, threshold count, and sample-size caveat acknowledgement.","Open /admin/analytics as a verified owner and record a redacted experiment decision with the current aggregate assignment counts, fixed-window conversion sample size, and sample-size caveat acknowledgement.","Open /analytics/indie-launch-dashboard to inspect the public preview, aggregate source rows, fixed-window controls, and caveats."]',
  edge_cases_json = '["Public source-data exposes aggregate counts, aggregate source attribution counts, aggregate variant counts, fixed-window metadata, report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox aggregate evidence, and conversion rows only, not raw event or assignment rows.","Unsupported event IDs, experiment IDs, source routes, notification readiness IDs, channel IDs, missing idempotency keys, and missing assignment keys return public-safe validation errors.","Bot, crawler, and preview/test-suppressed page-view traffic is ignored before analytics event rows are created.","Cookie assignment, contact-level analytics, raw referrer/query reporting, automated alert sends, owner email sends, queue dispatch, customer alerts, experiment traffic changes, automated winners, and revenue claims remain disabled even after owner decision, cohort comparison evidence, threshold review evidence, notification readiness evidence, and notification inbox records are recorded.","Agents must include sample-size caveats and must not call sparse test events or assignments statistically meaningful."]',
  agent_access = 'Agents can read /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard, event capture boundaries, page-view beacon boundaries, dashboard-visible fixed-window aggregate source attribution evidence, aggregate variant evidence, assignment boundaries, aggregate conversion report rows, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox aggregate evidence, and redacted experiment decision evidence. Owner sessions can record notification inbox records through /api/admin/analytics/notification-inbox-records and decision evidence through /api/admin/analytics/experiment-decisions. Direct public agent analytics writes, custom events, raw campaign/referrer reporting, raw analytics exports, automated alert sends, owner email sends, queue dispatch, customer alerts, experiment routing, automated winners, and revenue claims require future authenticated confirmed-write APIs with privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.',
  validation_json = '["Playwright covers /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard fixed-window source attribution UI, /admin/analytics owner decision and notification inbox evidence, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox evidence, event ingestion, page-view beacon capture with variant and source attribution evidence, bot suppression, assignment ingestion, conversion reporting from captured events, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.","Issues #87, #105, #107, #119, #121, #123, #125, #127, #129, #261, #263, #265, #267, #269, and #271 record the analytics source-data scaffold, first privacy-safe event capture path, first deterministic assignment path, first aggregate conversion report, first browser-side funnel page-view beacon, first variant-linked page-view evidence, first aggregate source attribution evidence, first dashboard-visible source breakdown, first fixed-window aggregate filters, first owner-confirmed experiment decision evidence, first aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, and owner-confirmed notification inbox records."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-21-analytics-notification-inbox-records',
  'Added owner-confirmed analytics notification inbox records',
  'Codex',
  'codex',
  'bumpgrade-bootstrap',
  'Continue the Bumpgrade parity build and add owner-confirmed analytics notification inbox record evidence for agents.',
  '[{"number":271,"url":"https://github.com/markitics/bumpgrade/issues/271"},{"number":18,"url":"https://github.com/markitics/bumpgrade/issues/18"}]',
  '[]',
  '["https://bumpgrade.com/features","https://bumpgrade.com/analytics/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["src/lib/analytics-notification-inbox.ts","src/app/api/admin/analytics/notification-inbox-records/route.ts","src/app/analytics/source-data/route.ts","src/lib/agent-manifest.ts","docs/features/analytics-experiments.md","drizzle/0101_analytics_notification_inbox_records.sql"]',
  '["npm run lint","npm run typecheck","npm run cf:build","Focused analytics notification inbox, source-data, agent docs, admin source-data, and user-journey smoke tests"]',
  NULL,
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/api/admin/analytics/notification-inbox-records","https://bumpgrade.com/agent-docs/source-data","https://github.com/markitics/bumpgrade/issues/271"]',
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
