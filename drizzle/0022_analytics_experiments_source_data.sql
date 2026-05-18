UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Read-only analytics and experiment contract, event taxonomy, funnel metrics, attribution, A/B assignment, and source-linked reporting.',
  public_evidence_json = '["Issue #18 owns analytics, A/B testing, and conversion tracking.", "Issue #87 adds the first /analytics/source-data contract and /analytics/indie-launch-dashboard preview scaffold."]',
  next_milestone = 'Build privacy-safe event ingestion and deterministic experiment assignment after the taxonomy and sample-size caveats are stable.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-previews-analytics-experiments',
  'Publisher previews analytics and experiment reporting',
  'feature-analytics-testing',
  'pending',
  '[18,87]',
  'Publisher or agent optimizing a launch funnel',
  'Inspect event definitions, metric formulas, fixture funnel reports, and A/B assignment rules before live tracking exists.',
  '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/87"]',
  '["Fetch /analytics/source-data.","Find event IDs, metric IDs, fixture funnel-step reports, experiment IDs, variant IDs, assignment rule, and write boundary.","Open /analytics/indie-launch-dashboard to inspect the public preview.","Use /funnels/source-data, /offers/source-data, and /audience/source-data to resolve the sources before assuming live tracking exists."]',
  '["The seeded dashboard uses fixture counts and does not collect live event rows.","Cookie assignment, contact-level analytics, experiment traffic changes, automated winners, and revenue claims require future confirmed-write APIs.","Agents must include sample-size caveats and must not call fixture metrics statistically meaningful."]',
  'Agents can read /analytics/source-data and the preview route. Analytics writes require actor identity, privacy review, idempotency, bot filtering, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats in a later API.',
  '["Playwright covers /analytics/source-data, /analytics/indie-launch-dashboard, sitemap discovery, and agent manifest read-contract discovery.","Issue #87 records the first analytics and experiments source-data contract and preview scaffold."]',
  51,
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
