CREATE TABLE IF NOT EXISTS analytics_experiment_decisions (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  experiment_id TEXT NOT NULL,
  decision_kind TEXT NOT NULL,
  selected_variant_id TEXT,
  time_window_key TEXT NOT NULL,
  expected_dashboard_revision_id TEXT NOT NULL,
  expected_experiment_status TEXT NOT NULL,
  expected_assignment_count INTEGER NOT NULL DEFAULT 0,
  expected_variant_counts_json TEXT NOT NULL,
  expected_primary_metric_id TEXT NOT NULL,
  expected_conversion_sample_size INTEGER NOT NULL DEFAULT 0,
  sample_size_caveat_acknowledged INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  traffic_routing_enabled INTEGER NOT NULL DEFAULT 0,
  automated_winner_enabled INTEGER NOT NULL DEFAULT 0,
  cookie_assignment_enabled INTEGER NOT NULL DEFAULT 0,
  revenue_claim_enabled INTEGER NOT NULL DEFAULT 0,
  raw_event_rows_exposed INTEGER NOT NULL DEFAULT 0,
  raw_assignment_rows_exposed INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_experiment_decisions_idempotency_unique
  ON analytics_experiment_decisions(idempotency_key);
CREATE INDEX IF NOT EXISTS analytics_experiment_decisions_experiment_time_idx
  ON analytics_experiment_decisions(experiment_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_experiment_decisions_dashboard_time_idx
  ON analytics_experiment_decisions(dashboard_id, created_at);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Privacy-safe analytics event capture, session-idempotent funnel page-view beacons with deterministic variant and normalized source attribution evidence, dashboard-visible fixed-window aggregate source breakdowns, deterministic seeded experiment assignment, aggregate funnel conversion reports, owner-confirmed experiment decision evidence, attribution boundaries, and source-linked reporting.',
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    json_object(
      'label', 'Issue #261 owner-confirmed analytics experiment decision evidence',
      'url', 'https://github.com/markitics/bumpgrade/issues/261'
    )
  ),
  next_milestone = 'Add exportable aggregate reports and cohort comparison fixtures without exposing raw event rows.',
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[18,87,105,107,119,121,123,125,127,129,261]',
  user_goal = 'Inspect seeded analytics definitions, capture privacy-safe test events, record browser-side funnel page views with deterministic variant and source attribution evidence, read dashboard-visible fixed-window aggregate source rows, assign deterministic variants, read aggregate conversion report rows, and record owner-reviewed experiment decision evidence before cookies, contact-level reporting, traffic routing, or automated winners exist.',
  source_evidence_json = '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://bumpgrade.com/api/analytics/events","https://bumpgrade.com/api/analytics/assignments","https://bumpgrade.com/api/admin/analytics/experiment-decisions","https://bumpgrade.com/admin/analytics","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/funnels/indie-launch-sandbox","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87","https://github.com/markitics/bumpgrade/issues/105","https://github.com/markitics/bumpgrade/issues/107","https://github.com/markitics/bumpgrade/issues/119","https://github.com/markitics/bumpgrade/issues/121","https://github.com/markitics/bumpgrade/issues/123","https://github.com/markitics/bumpgrade/issues/125","https://github.com/markitics/bumpgrade/issues/127","https://github.com/markitics/bumpgrade/issues/129","https://github.com/markitics/bumpgrade/issues/261"]',
  happy_path_json = '["Fetch /analytics/source-data.","Find event IDs, page-view beacon boundary, aggregate source attribution counts, aggregate variant event counts, fixed time windows, metric IDs, aggregate event counts, aggregate conversion report rows, experiment IDs, variant IDs, assignment rule, assignment API, dashboard source section, and write boundary.","Fetch /analytics/source-data?window=24h to inspect public-safe aggregate source and conversion rows for one supported fixed window.","Open /funnels/indie-launch-sandbox with safe UTM parameters and let the session-idempotent page-view beacon assign a variant and record a seeded event with that variant ID and normalized source attribution.","POST a seeded event to /api/analytics/events with an idempotency key and source route.","POST a seeded experiment assignment to /api/analytics/assignments with an anonymous assignment key, idempotency key, and source route.","Open /admin/analytics as a verified owner and record a redacted experiment decision with the current aggregate assignment counts, fixed-window conversion sample size, and sample-size caveat acknowledgement.","Confirm duplicate idempotency returns the same public-safe event or assignment without duplicating rows.","Open /analytics/indie-launch-dashboard to inspect the public preview, aggregate source rows, fixed-window controls, and caveats."]',
  edge_cases_json = '["Public source-data exposes aggregate counts, aggregate source attribution counts, aggregate variant counts, fixed-window metadata, and conversion rows only, not raw event or assignment rows.","Unsupported event IDs, experiment IDs, source routes, missing idempotency keys, and missing assignment keys return public-safe validation errors.","Bot, crawler, and preview/test-suppressed page-view traffic is ignored before analytics event rows are created.","Cookie assignment, contact-level analytics, raw referrer/query reporting, experiment traffic changes, automated winners, and revenue claims remain disabled even after owner decision evidence is recorded.","Agents must include sample-size caveats and must not call sparse test events or assignments statistically meaningful."]',
  agent_access = 'Agents can read /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard, event capture boundaries, page-view beacon boundaries, dashboard-visible fixed-window aggregate source attribution evidence, aggregate variant evidence, assignment boundaries, aggregate conversion report rows, and redacted experiment decision evidence. Owner sessions can record decision evidence through /api/admin/analytics/experiment-decisions. Direct public agent analytics writes, custom events, raw campaign/referrer reporting, experiment routing, automated winners, and revenue claims require future authenticated confirmed-write APIs with privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.',
  validation_json = '["Playwright covers /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard fixed-window source attribution UI, /admin/analytics owner decision evidence, event ingestion, page-view beacon capture with variant and source attribution evidence, bot suppression, assignment ingestion, conversion reporting from captured events, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.","Issues #87, #105, #107, #119, #121, #123, #125, #127, #129, and #261 record the analytics source-data scaffold, first privacy-safe event capture path, first deterministic assignment path, first aggregate conversion report, first browser-side funnel page-view beacon, first variant-linked page-view evidence, first aggregate source attribution evidence, first dashboard-visible source breakdown, first fixed-window aggregate filters, and first owner-confirmed experiment decision evidence."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';
