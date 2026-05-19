CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_definition_id TEXT NOT NULL,
  event_kind TEXT NOT NULL,
  source_route TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  funnel_id TEXT,
  funnel_step_id TEXT,
  form_id TEXT,
  product_id TEXT,
  price_id TEXT,
  variant_id TEXT,
  amount_cents INTEGER,
  currency TEXT,
  public_properties_json TEXT,
  client_correlation_hash TEXT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  metadata_json TEXT,
  occurred_at INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_events_idempotency_unique
  ON analytics_events(idempotency_key);
CREATE INDEX IF NOT EXISTS analytics_events_definition_time_idx
  ON analytics_events(event_definition_id, occurred_at);
CREATE INDEX IF NOT EXISTS analytics_events_source_time_idx
  ON analytics_events(source_route, occurred_at);
CREATE INDEX IF NOT EXISTS analytics_events_kind_time_idx
  ON analytics_events(event_kind, occurred_at);

CREATE TABLE IF NOT EXISTS analytics_event_ingestions (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  analytics_event_id TEXT REFERENCES analytics_events(id) ON DELETE SET NULL,
  event_definition_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'recorded',
  request_hash TEXT NOT NULL,
  error_code TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_event_ingestions_idempotency_unique
  ON analytics_event_ingestions(idempotency_key);
CREATE INDEX IF NOT EXISTS analytics_event_ingestions_event_idx
  ON analytics_event_ingestions(analytics_event_id);
CREATE INDEX IF NOT EXISTS analytics_event_ingestions_status_created_idx
  ON analytics_event_ingestions(status, created_at);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Privacy-safe analytics event capture, seeded event taxonomy, aggregate funnel metrics, attribution boundaries, A/B assignment model, and source-linked reporting.',
  public_evidence_json = '["Issue #18 owns analytics, A/B testing, and conversion tracking.", "Issue #87 adds the first /analytics/source-data contract and /analytics/indie-launch-dashboard preview scaffold.", "Issue #105 adds POST /api/analytics/events with seeded event validation, idempotency, hashed request evidence, and aggregate-only source-data reporting."]',
  next_milestone = 'Add deterministic experiment assignment and bot-filtered page-view instrumentation without exposing raw visitor identifiers.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[18,87,105]',
  user_goal = 'Inspect seeded analytics definitions, capture privacy-safe test events, and read aggregate event counts before cookies, contact-level reporting, or automated decisions exist.',
  source_evidence_json = '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://bumpgrade.com/api/analytics/events","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87","https://github.com/markitics/bumpgrade/issues/105"]',
  happy_path_json = '["Fetch /analytics/source-data.","Find event IDs, metric IDs, aggregate event counts, experiment IDs, variant IDs, assignment rule, and write boundary.","POST a seeded event to /api/analytics/events with an idempotency key and source route.","Confirm duplicate idempotency returns the same public-safe event without duplicating rows.","Open /analytics/indie-launch-dashboard to inspect the public preview and caveats."]',
  edge_cases_json = '["Public source-data exposes aggregate counts only, not raw event rows.","Unsupported event IDs, source routes, and missing idempotency keys return public-safe validation errors.","Cookie assignment, contact-level analytics, experiment traffic changes, automated winners, and revenue claims require future confirmed-write APIs.","Agents must include sample-size caveats and must not call sparse test events statistically meaningful."]',
  agent_access = 'Agents can read /analytics/source-data and event capture boundaries. Direct agent analytics writes, custom events, campaign attribution mutation, experiment routing, and automated decisions require future authenticated confirmed-write APIs with privacy review, idempotency, bot filtering, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.',
  validation_json = '["Playwright covers /analytics/source-data, /analytics/indie-launch-dashboard, event ingestion, duplicate idempotency, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.","Issues #87 and #105 record the analytics source-data scaffold and first privacy-safe event capture path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-agent-records-privacy-safe-analytics-event',
  'Agent records a privacy-safe analytics event',
  'feature-analytics-testing',
  'pending',
  '[18,87,105]',
  'Agent or system integration validating event capture',
  'Record a seeded analytics event with idempotency and verify Bumpgrade stores only public-safe fields plus hashed request evidence.',
  '["https://bumpgrade.com/api/analytics/events","https://bumpgrade.com/analytics/source-data","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87","https://github.com/markitics/bumpgrade/issues/105"]',
  '["Choose a seeded event definition from /analytics/source-data.","POST the event definition ID, source route, public properties, and idempotency key to /api/analytics/events.","Replay the same idempotency key and receive the same public-safe event ID.","Read aggregate counts from /analytics/source-data without exposing raw event rows."]',
  '["Missing idempotency is rejected.","Unsupported event IDs and source routes are rejected.","Private request fields are hashed or omitted.","The API does not create cookies, mutate campaign attribution, route experiment traffic, or decide winners."]',
  'Agents can inspect the event capture contract and propose analytics events, but direct agent analytics writes beyond seeded events require future authenticated confirmed-write APIs.',
  '["Playwright covers valid event ingestion, duplicate idempotency, validation failures, and aggregate-only source-data.","Issue #105 records the first live analytics event capture path."]',
  53,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  feature_id=excluded.feature_id,
  feature_status=excluded.feature_status,
  issue_numbers_json=excluded.issue_numbers_json,
  primary_user=excluded.primary_user,
  user_goal=excluded.user_goal,
  source_evidence_json=excluded.source_evidence_json,
  happy_path_json=excluded.happy_path_json,
  edge_cases_json=excluded.edge_cases_json,
  agent_access=excluded.agent_access,
  validation_json=excluded.validation_json,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;
