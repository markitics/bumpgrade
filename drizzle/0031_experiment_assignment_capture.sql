CREATE TABLE IF NOT EXISTS analytics_experiment_assignments (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  source_route TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  assignment_bucket INTEGER NOT NULL,
  assignment_hash TEXT NOT NULL,
  visitor_key_hash TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  request_hash TEXT NOT NULL,
  metadata_json TEXT,
  assigned_at INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_experiment_assignments_idempotency_unique
  ON analytics_experiment_assignments(idempotency_key);
CREATE INDEX IF NOT EXISTS analytics_experiment_assignments_experiment_variant_time_idx
  ON analytics_experiment_assignments(experiment_id, variant_id, assigned_at);
CREATE INDEX IF NOT EXISTS analytics_experiment_assignments_source_time_idx
  ON analytics_experiment_assignments(source_route, assigned_at);
CREATE INDEX IF NOT EXISTS analytics_experiment_assignments_bucket_idx
  ON analytics_experiment_assignments(experiment_id, assignment_bucket);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Privacy-safe analytics event capture, deterministic seeded experiment assignment, aggregate funnel metrics, attribution boundaries, and source-linked reporting.',
  public_evidence_json = '["Issue #18 owns analytics, A/B testing, and conversion tracking.", "Issue #87 adds the first /analytics/source-data contract and /analytics/indie-launch-dashboard preview scaffold.", "Issue #105 adds POST /api/analytics/events with seeded event validation, idempotency, hashed request evidence, and aggregate-only source-data reporting.", "Issue #107 adds POST /api/analytics/assignments with seeded experiment validation, deterministic weighted variant assignment, hashed visitor evidence, and aggregate-only assignment reporting."]',
  next_milestone = 'Add bot-filtered page-view instrumentation and connect assignment evidence to captured funnel events without exposing raw visitor identifiers.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[18,87,105,107]',
  user_goal = 'Inspect seeded analytics definitions, capture privacy-safe test events, assign deterministic variants, and read aggregate counts before cookies, contact-level reporting, or automated decisions exist.',
  source_evidence_json = '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://bumpgrade.com/api/analytics/events","https://bumpgrade.com/api/analytics/assignments","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87","https://github.com/markitics/bumpgrade/issues/105","https://github.com/markitics/bumpgrade/issues/107"]',
  happy_path_json = '["Fetch /analytics/source-data.","Find event IDs, metric IDs, aggregate event counts, experiment IDs, variant IDs, assignment rule, assignment API, and write boundary.","POST a seeded event to /api/analytics/events with an idempotency key and source route.","POST a seeded experiment assignment to /api/analytics/assignments with an anonymous assignment key, idempotency key, and source route.","Confirm duplicate idempotency returns the same public-safe event or assignment without duplicating rows.","Open /analytics/indie-launch-dashboard to inspect the public preview and caveats."]',
  edge_cases_json = '["Public source-data exposes aggregate counts only, not raw event or assignment rows.","Unsupported event IDs, experiment IDs, source routes, missing idempotency keys, and missing assignment keys return public-safe validation errors.","Cookie assignment, contact-level analytics, experiment traffic changes, automated winners, and revenue claims require future confirmed-write APIs.","Agents must include sample-size caveats and must not call sparse test events or assignments statistically meaningful."]',
  agent_access = 'Agents can read /analytics/source-data, event capture boundaries, and assignment boundaries. Direct agent analytics writes, custom events, campaign attribution mutation, experiment routing, and automated decisions require future authenticated confirmed-write APIs with privacy review, idempotency, bot filtering, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.',
  validation_json = '["Playwright covers /analytics/source-data, /analytics/indie-launch-dashboard, event ingestion, assignment ingestion, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.","Issues #87, #105, and #107 record the analytics source-data scaffold, first privacy-safe event capture path, and first deterministic assignment path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-agent-assigns-privacy-safe-experiment-variant',
  'Agent assigns a privacy-safe experiment variant',
  'feature-analytics-testing',
  'pending',
  '[18,87,105,107]',
  'Agent or system integration validating A/B assignment',
  'Assign a seeded experiment variant with idempotency and verify Bumpgrade stores only public-safe response fields plus hashed visitor evidence.',
  '["https://bumpgrade.com/api/analytics/assignments","https://bumpgrade.com/analytics/source-data","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87","https://github.com/markitics/bumpgrade/issues/105","https://github.com/markitics/bumpgrade/issues/107"]',
  '["Choose a seeded experiment definition from /analytics/source-data.","POST the experiment ID, source route, anonymous assignment key, and idempotency key to /api/analytics/assignments.","Replay the same idempotency key and receive the same public-safe assignment ID.","Use a new idempotency key with the same anonymous assignment key and receive the same variant and bucket.","Read aggregate assignment counts from /analytics/source-data without exposing raw assignment rows."]',
  '["Missing idempotency is rejected.","Missing anonymous assignment key is rejected.","Unsupported experiment IDs and source routes are rejected.","Private request fields are hashed or omitted.","The API does not set cookies, route traffic, create page-view events, mutate campaign attribution, or decide winners."]',
  'Agents can inspect the assignment contract and propose experiment assignment tests, but direct agent experiment writes beyond seeded assignment requires future authenticated confirmed-write APIs.',
  '["Playwright covers valid assignment ingestion, duplicate idempotency, deterministic replay with a new idempotency key, validation failures, and aggregate-only source-data.","Issue #107 records the first deterministic experiment assignment path."]',
  54,
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
