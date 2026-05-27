CREATE TABLE IF NOT EXISTS analytics_experiment_winner_rollouts (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  experiment_id TEXT NOT NULL,
  selected_variant_id TEXT NOT NULL,
  source_route TEXT NOT NULL,
  rollout_status TEXT NOT NULL DEFAULT 'active',
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
  rollback_idempotency_key TEXT,
  rollback_actor_user_id TEXT,
  rollback_actor_email_hash TEXT,
  rollback_note_sha256 TEXT,
  rollback_confirmation_text_sha256 TEXT,
  rolled_back_at INTEGER,
  traffic_routing_enabled INTEGER NOT NULL DEFAULT 0,
  automated_winner_enabled INTEGER NOT NULL DEFAULT 0,
  custom_routing_preserved INTEGER NOT NULL DEFAULT 1,
  cookie_assignment_enabled INTEGER NOT NULL DEFAULT 0,
  revenue_claim_enabled INTEGER NOT NULL DEFAULT 0,
  raw_event_rows_exposed INTEGER NOT NULL DEFAULT 0,
  raw_assignment_rows_exposed INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_experiment_winner_rollouts_idempotency_unique
  ON analytics_experiment_winner_rollouts(idempotency_key);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_experiment_winner_rollouts_rollback_idempotency_unique
  ON analytics_experiment_winner_rollouts(rollback_idempotency_key)
  WHERE rollback_idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS analytics_experiment_winner_rollouts_active_idx
  ON analytics_experiment_winner_rollouts(experiment_id, source_route, rollout_status, created_at);

CREATE INDEX IF NOT EXISTS analytics_experiment_winner_rollouts_dashboard_time_idx
  ON analytics_experiment_winner_rollouts(dashboard_id, created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Privacy-safe analytics event capture, session-idempotent funnel page-view beacons with deterministic variant and normalized source attribution evidence, public-safe custom source/campaign routing rules, owner-confirmed winner rollout and rollback routing for unmatched experiment traffic, dashboard-visible fixed-window aggregate source breakdowns, deterministic seeded experiment assignment, aggregate funnel conversion reports, aggregate report exports, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflights, owner-reviewed provider/domain readiness records, owner-reviewed content/consent readiness records, owner-reviewed send-payload readiness records, owner-reviewed queue-producer readiness records, owner-reviewed queue-consumer readiness records, owner-reviewed provider-call readiness records, owner-reviewed delivery-attempt readiness records, owner-reviewed delivery-result readiness records, owner-reviewed delivery-status-webhook readiness records, owner-reviewed provider-polling readiness records, owner-reviewed receipt-payload readiness records, owner-reviewed delivery-receipt readiness records, owner-reviewed provider-status reconciliation readiness records, owner-confirmed experiment decision evidence, attribution boundaries, and source-linked reporting.',
  next_milestone = 'Keep custom analytics schemas beyond the current seeded boundary, notification execution, Queue producer/consumer execution, provider calls, delivery results, raw exports, and direct agent-safe write tools in issue #422 until they have execution-safe contracts.',
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Active post-MVP execution bucket for custom/non-seeded analytics event schemas beyond the current seeded boundary, owner-confirmed winner rollout and rollback routing, automated alert/notification execution, Cloudflare Queue producer and consumer execution, provider calls, delivery attempts, results, webhooks, polling, receipts, raw/private exports, and direct agent-safe analytics write APIs. Public-safe source/campaign rules, seeded sandbox funnel copy routing, baseline holdout, and owner-confirmed winner rollout contracts are now live through the existing assignment API.',
  public_evidence_json = json_array(
    'Issue #422 tracks this active post-MVP execution bucket.',
    'Issue #18 remains the shipped analytics MVP for privacy-safe events, deterministic assignments, aggregate conversion reporting, fixed-window attribution, owner decision evidence, aggregate exports, and notification readiness proof.',
    'Seeded sandbox funnel copy routing applies public-safe source/campaign rules first, then uses the same deterministic assignment API and session-scoped anonymous key as the page-view beacon, with a 10% baseline holdout for unmatched traffic.',
    'Owner-confirmed winner rollouts can route future unmatched assignment traffic to a selected treatment variant and can be rolled back with exact-confirmed audit evidence.',
    'Custom routing rule matches store only the matched public rule ID in assignment metadata; winner rollout matches store only the rollout ID; raw routing URLs, cookies, visitor keys, and contact analytics remain excluded.'
  ),
  next_milestone = 'Continue the remaining analytics execution work with privacy review, idempotency, audit correlation, stale-state checks, redaction, Queue/provider safety, rollback, sample-size caveats, and confirmed-write checks.',
  updated_at = unixepoch()
WHERE id = 'roadmap-live-analytics-execution';

UPDATE admin_user_journeys
SET
  user_goal = 'Inspect seeded analytics definitions, capture privacy-safe test events, record browser-side funnel page views with deterministic variant and source attribution evidence, route the seeded sandbox opt-in copy through public-safe source/campaign rules and the same session assignment with a baseline holdout, record owner-confirmed winner rollout and rollback evidence for unmatched traffic, read dashboard-visible fixed-window aggregate source rows, assign deterministic variants, read aggregate conversion report rows, read aggregate report export metadata, read owner-reviewed cohort comparison evidence, read owner-reviewed alert threshold/anomaly-review evidence, read owner-reviewed notification delivery readiness evidence, record owner-confirmed notification inbox records, record owner-confirmed dispatch preflights, record owner-reviewed provider/domain readiness evidence, record owner-reviewed content/consent readiness evidence, record owner-reviewed send-payload readiness evidence, record owner-reviewed queue-producer readiness evidence, record owner-reviewed queue-consumer readiness evidence, record owner-reviewed provider-call readiness evidence, record owner-reviewed delivery-attempt readiness evidence, record owner-reviewed delivery-result readiness evidence, record owner-reviewed delivery-status webhook readiness evidence, record owner-reviewed provider-polling readiness evidence, record owner-reviewed receipt-payload readiness evidence, record owner-reviewed delivery-receipt readiness evidence, record owner-reviewed provider-status reconciliation readiness evidence, and record owner-reviewed experiment decision evidence before cookies, contact-level reporting, automated alerts, owner email sends, Queue producer execution, Queue consumer execution, queue dispatch, queue messages, queue message consumption, queue acknowledgements, retry/dead-letter rows, queue payload body reads, queue payload bodies, recipient payloads, personalized bodies, raw payload bodies, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, provider polling, provider status reconciliation, provider configuration, provider secrets, sender credentials, private DNS credentials, body templates, unsubscribe URLs, customer alerts, raw/private exports, direct public agent writes, or revenue claims exist.',
  agent_access = 'Agents can read /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard, event capture boundaries, page-view beacon boundaries, public-safe custom routing rule metadata, owner-confirmed winner rollout metadata, seeded sandbox routing and baseline holdout metadata, dashboard-visible fixed-window aggregate source attribution evidence, aggregate variant evidence, assignment boundaries, aggregate conversion report rows, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox aggregate evidence, owner-confirmed dispatch preflight aggregate evidence, owner-reviewed provider/domain readiness aggregate evidence, owner-reviewed content/consent readiness aggregate evidence, owner-reviewed send-payload readiness aggregate evidence, owner-reviewed queue-producer readiness aggregate evidence, owner-reviewed queue-consumer readiness aggregate evidence, owner-reviewed provider-call readiness aggregate evidence, owner-reviewed delivery-attempt readiness aggregate evidence, owner-reviewed delivery-result readiness aggregate evidence, owner-reviewed delivery-status webhook readiness aggregate evidence, owner-reviewed provider-polling readiness aggregate evidence, owner-reviewed receipt-payload readiness aggregate evidence, owner-reviewed delivery-receipt readiness aggregate evidence, owner-reviewed provider-status reconciliation readiness aggregate evidence, and redacted experiment decision evidence. Owner sessions can record winner rollout and rollback evidence through /api/admin/analytics/winner-rollouts, notification readiness records through owner analytics APIs, and decision evidence through /api/admin/analytics/experiment-decisions. Issue #422 still owns direct public agent analytics writes, custom events beyond the current seeded boundary, raw campaign/referrer reporting, raw analytics exports, automated alert sends, owner email sends, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, provider polling, provider status reconciliation execution, provider configuration, provider secrets, sender credentials, private DNS credentials, Queue producer execution, Queue consumer execution, queue dispatch, queue-message creation, queue message consumption, queue acknowledgements, retry/dead-letter rows, queue payload body reads, queue payload body creation, recipient-payload creation, personalized body creation, raw payload body storage, body-template exposure, unsubscribe-URL exposure, customer alerts, and revenue claims behind future authenticated confirmed-write APIs with privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.',
  validation_json = json_array(
    'Playwright covers /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard fixed-window source attribution UI, /admin/analytics owner decision, winner rollout, rollback, notification readiness forms, event ingestion, assignment ingestion, custom source/campaign routing, winner rollout assignment routing, conversion reporting from captured events, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.',
    'Issues #87, #105, #107, #119, #121, #123, #125, #127, #129, #261, #263, #265, #267, #269, #271, #284, #286, #288, #290, #292, #294, #297, #299, #301, #303, #305, #307, #309, and #311 record the analytics source-data foundation, first privacy-safe event capture path, first deterministic assignment path, first aggregate conversion report, first browser-side funnel page-view beacon, first variant-linked page-view evidence, first aggregate source attribution evidence, first dashboard-visible source breakdown, first fixed-window aggregate filters, first owner-confirmed experiment decision evidence, first aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflights, owner-reviewed provider/domain readiness, owner-reviewed content/consent readiness, owner-reviewed send-payload readiness, owner-reviewed queue-producer readiness, owner-reviewed queue-consumer readiness, owner-reviewed provider-call readiness, owner-reviewed delivery-attempt readiness, owner-reviewed delivery-result readiness, owner-reviewed delivery-status webhook readiness, owner-reviewed provider-polling readiness, owner-reviewed receipt-payload readiness, owner-reviewed delivery-receipt readiness, and owner-reviewed provider-status reconciliation readiness. Issue #422 routes seeded sandbox funnel copy with public-safe source/campaign rules, a baseline holdout, and owner-confirmed winner rollout/rollback while tracking the remaining custom analytics schemas, notification execution, and agent-safe write parity after the issue #18 MVP closeout.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-27-analytics-winner-rollouts',
  'Added owner-confirmed analytics winner rollouts',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Continue the Bumpgrade build with Director-level owner-visible analytics progress while keeping noisy narrow ships quiet.',
  json_array(json_object('number', 422, 'url', 'https://github.com/markitics/bumpgrade/issues/422')),
  json_array(),
  json_array('feature-analytics-testing'),
  json_array('roadmap-analytics-testing', 'roadmap-live-analytics-execution'),
  json_array('journey-publisher-previews-analytics-experiments'),
  json_array('docs/features/analytics-experiments.md', 'docs/agent/agent-ready.md', 'public/llms.txt'),
  json_array('Owner-gated /api/admin/analytics/winner-rollouts can record winner rollout and rollback evidence with exact confirmation, idempotency, aggregate evidence checks, stale rollout revisions, and redaction.', 'The assignment API preserves custom source/campaign rules first, then can route unmatched traffic through an active owner-confirmed rollout before falling back to seeded buckets.', 'Public source-data exposes winner rollout counts, active rollout metadata, redaction flags, and no raw event rows, raw assignment rows, visitor keys, contact analytics, provider sends, Queue execution, or public agent writes.'),
  'No Mark action required. The API enables owner-confirmed routing but does not create an active rollout until a verified owner submits it; provider notification execution, raw/private exports, custom non-seeded schemas, and direct public agent writes remain parked in issue #422.',
  unixepoch() - 1800,
  unixepoch(),
  json_array('https://bumpgrade.com/analytics/source-data', 'https://bumpgrade.com/analytics/indie-launch-dashboard', 'https://bumpgrade.com/admin/analytics', 'https://bumpgrade.com/admin/roadmap/source-data', 'https://bumpgrade.com/admin/user-journeys/source-data', 'https://bumpgrade.com/admin/work-log/source-data', 'https://github.com/markitics/bumpgrade/issues/422'),
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
