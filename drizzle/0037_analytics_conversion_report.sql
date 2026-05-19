UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Privacy-safe analytics event capture, deterministic seeded experiment assignment, aggregate funnel conversion reports, attribution boundaries, and source-linked reporting.',
  public_evidence_json = '["Issue #18 owns analytics, A/B testing, and conversion tracking.", "Issue #87 adds the first /analytics/source-data contract and /analytics/indie-launch-dashboard preview scaffold.", "Issue #105 adds POST /api/analytics/events with seeded event validation, idempotency, hashed request evidence, and aggregate-only source-data reporting.", "Issue #107 adds POST /api/analytics/assignments with seeded experiment validation, deterministic weighted variant assignment, hashed visitor evidence, and aggregate-only assignment reporting.", "Issue #119 adds aggregate funnel conversion report rows from captured test events without exposing raw analytics rows."]',
  next_milestone = 'Add bot-filtered page-view instrumentation and connect assignment evidence to captured funnel events without exposing raw visitor identifiers.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[18,87,105,107,119]',
  user_goal = 'Inspect seeded analytics definitions, capture privacy-safe test events, assign deterministic variants, and read aggregate conversion report rows before cookies, contact-level reporting, or automated decisions exist.',
  source_evidence_json = '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://bumpgrade.com/api/analytics/events","https://bumpgrade.com/api/analytics/assignments","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87","https://github.com/markitics/bumpgrade/issues/105","https://github.com/markitics/bumpgrade/issues/107","https://github.com/markitics/bumpgrade/issues/119"]',
  happy_path_json = '["Fetch /analytics/source-data.","Find event IDs, metric IDs, aggregate event counts, aggregate conversion report rows, experiment IDs, variant IDs, assignment rule, assignment API, and write boundary.","POST a seeded event to /api/analytics/events with an idempotency key and source route.","POST a seeded experiment assignment to /api/analytics/assignments with an anonymous assignment key, idempotency key, and source route.","Confirm duplicate idempotency returns the same public-safe event or assignment without duplicating rows.","Open /analytics/indie-launch-dashboard to inspect the public preview and caveats."]',
  edge_cases_json = '["Public source-data exposes aggregate counts and conversion rows only, not raw event or assignment rows.","Unsupported event IDs, experiment IDs, source routes, missing idempotency keys, and missing assignment keys return public-safe validation errors.","Cookie assignment, contact-level analytics, experiment traffic changes, automated winners, and revenue claims require future confirmed-write APIs.","Agents must include sample-size caveats and must not call sparse test events or assignments statistically meaningful."]',
  agent_access = 'Agents can read /analytics/source-data, event capture boundaries, assignment boundaries, and aggregate conversion report rows. Direct agent analytics writes, custom events, campaign attribution mutation, experiment routing, and automated decisions require future authenticated confirmed-write APIs with privacy review, idempotency, bot filtering, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.',
  validation_json = '["Playwright covers /analytics/source-data, /analytics/indie-launch-dashboard, event ingestion, assignment ingestion, conversion reporting from captured events, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.","Issues #87, #105, #107, and #119 record the analytics source-data scaffold, first privacy-safe event capture path, first deterministic assignment path, and first aggregate conversion report."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-reads-funnel-conversion-report',
  'Publisher reads a funnel conversion report',
  'feature-analytics-testing',
  'pending',
  '[18,87,105,107,119]',
  'Publisher or agent validating funnel optimization evidence',
  'Read visitor, conversion, and conversion-rate rows from captured test events without exposing raw analytics events or visitor identifiers.',
  '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/119"]',
  '["Capture seeded analytics events with idempotency.","Fetch /analytics/source-data.","Read funnelConversionReport rows for metric ID, step ID, visitor count, conversion count, conversion rate, report mode, and sample-size caveat.","Open /analytics/indie-launch-dashboard and confirm the report renders captured rows when samples exist."]',
  '["Duplicate idempotency does not inflate conversion counts.","Rows fall back to fixture counts only when no captured samples exist.","Raw analytics rows, IP hashes, user agent hashes, visitor keys, contact IDs, and Stripe IDs are not included.","Sparse samples are not statistically meaningful and must be labeled with caveats."]',
  'Agents can read aggregate funnel conversion rows and cite metric IDs, event IDs, and issue #119 evidence. Direct analytics writes, traffic routing, and automated experiment decisions require future confirmed-write APIs.',
  '["Playwright seeds captured events, replays duplicate idempotency, verifies conversion counts and rates, and checks public source-data excludes raw/private rows.","Issue #119 records the first aggregate conversion report from captured analytics events."]',
  55,
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
