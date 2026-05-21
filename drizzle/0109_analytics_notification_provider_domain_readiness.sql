CREATE TABLE IF NOT EXISTS analytics_notification_provider_domain_readiness_records (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  readiness_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  inbox_record_id TEXT NOT NULL,
  dispatch_preflight_id TEXT NOT NULL,
  record_kind TEXT NOT NULL,
  notification_provider_domain_readiness_disposition TEXT NOT NULL,
  time_window_key TEXT NOT NULL,
  expected_dashboard_revision_id TEXT NOT NULL,
  expected_readiness_status TEXT NOT NULL,
  expected_notification_inbox_status TEXT NOT NULL,
  expected_notification_dispatch_preflight_status TEXT NOT NULL,
  expected_owner_review_status TEXT NOT NULL,
  expected_alert_threshold_count INTEGER NOT NULL DEFAULT 0,
  expected_conversion_sample_size INTEGER NOT NULL DEFAULT 0,
  sample_size_caveat_acknowledged INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  owner_provider_domain_readiness_recorded INTEGER NOT NULL DEFAULT 0,
  email_send_enabled INTEGER NOT NULL DEFAULT 0,
  queue_dispatch_enabled INTEGER NOT NULL DEFAULT 0,
  customer_alert_enabled INTEGER NOT NULL DEFAULT 0,
  traffic_routing_enabled INTEGER NOT NULL DEFAULT 0,
  automated_winner_enabled INTEGER NOT NULL DEFAULT 0,
  revenue_claim_enabled INTEGER NOT NULL DEFAULT 0,
  raw_analytics_rows_exposed INTEGER NOT NULL DEFAULT 0,
  recipient_identity_included INTEGER NOT NULL DEFAULT 0,
  email_body_included INTEGER NOT NULL DEFAULT 0,
  provider_message_id_included INTEGER NOT NULL DEFAULT 0,
  queue_payload_included INTEGER NOT NULL DEFAULT 0,
  provider_send_enabled INTEGER NOT NULL DEFAULT 0,
  provider_called INTEGER NOT NULL DEFAULT 0,
  provider_configured INTEGER NOT NULL DEFAULT 0,
  provider_secret_included INTEGER NOT NULL DEFAULT 0,
  sender_domain_configured INTEGER NOT NULL DEFAULT 0,
  sender_domain_verified INTEGER NOT NULL DEFAULT 0,
  sender_credential_included INTEGER NOT NULL DEFAULT 0,
  private_dns_credentials_included INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_notification_provider_domain_readiness_idempotency_unique
  ON analytics_notification_provider_domain_readiness_records(idempotency_key);
CREATE INDEX IF NOT EXISTS analytics_notification_provider_domain_readiness_dashboard_time_idx
  ON analytics_notification_provider_domain_readiness_records(dashboard_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_notification_provider_domain_readiness_readiness_channel_idx
  ON analytics_notification_provider_domain_readiness_records(readiness_id, channel_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_notification_provider_domain_readiness_dispatch_preflight_idx
  ON analytics_notification_provider_domain_readiness_records(dispatch_preflight_id, created_at);

UPDATE admin_roadmap_items
SET
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, '[]'),
    '$[#]',
    json_object(
      'label', 'Issue #286 owner-reviewed analytics notification provider/domain readiness',
      'url', 'https://github.com/markitics/bumpgrade/issues/286'
    )
  ),
  summary = 'Privacy-safe analytics event capture, session-idempotent funnel page-view beacons with deterministic variant and normalized source attribution evidence, dashboard-visible fixed-window aggregate source breakdowns, deterministic seeded experiment assignment, aggregate funnel conversion reports, aggregate report exports, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflights, owner-reviewed provider/domain readiness records, owner-confirmed experiment decision evidence, attribution boundaries, and source-linked reporting.',
  next_milestone = 'Add analytics notification body, unsubscribe, rate-limit, and audit readiness only after provider/domain readiness keeps provider sends, secrets, sender credentials, private DNS credentials, recipients, email bodies, queues, customer alerts, and sends disabled.',
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[18,87,105,107,119,121,123,125,127,129,261,263,265,267,269,271,284,286]',
  user_goal = 'Inspect seeded analytics definitions, capture privacy-safe test events, record browser-side funnel page views with deterministic variant and source attribution evidence, read dashboard-visible fixed-window aggregate source rows, assign deterministic variants, read aggregate conversion report rows, read aggregate report export metadata, read owner-reviewed cohort comparison evidence, read owner-reviewed alert threshold/anomaly-review evidence, read owner-reviewed notification delivery readiness evidence, record owner-confirmed notification inbox records, record owner-confirmed dispatch preflights, record owner-reviewed provider/domain readiness, and record owner-reviewed experiment decision evidence before cookies, contact-level reporting, automated alert sends, owner email sends, provider sends, queue dispatch, customer alerts, traffic routing, automated winners, or revenue claims exist.',
  source_evidence_json = '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/analytics/indie-launch-dashboard","https://bumpgrade.com/api/analytics/events","https://bumpgrade.com/api/analytics/assignments","https://bumpgrade.com/api/admin/analytics/experiment-decisions","https://bumpgrade.com/api/admin/analytics/notification-inbox-records","https://bumpgrade.com/api/admin/analytics/notification-dispatch-preflights","https://bumpgrade.com/api/admin/analytics/notification-provider-domain-readiness","https://bumpgrade.com/admin/analytics","https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/286"]',
  happy_path_json = '["Fetch /analytics/source-data.","Read notificationProviderDomainReadiness from /analytics/source-data to inspect owner-reviewed provider/domain readiness counts, current dispatch-preflight evidence, and redaction flags.","Open /admin/analytics as a verified owner and record a redacted provider/domain readiness record only after a current dispatch preflight exists.","Confirm provider configuration, provider secrets, sender credentials, private DNS credentials, recipient identity, email bodies, provider message IDs, queue payloads, customer alerts, traffic routing, automated winners, and revenue claims remain disabled."]',
  edge_cases_json = '["Public source-data exposes aggregate provider/domain readiness counts and latest public-safe metadata only, not provider secrets, private DNS credentials, sender credentials, recipients, bodies, provider message IDs, queue payloads, raw analytics rows, or actor identity.","Unsupported readiness IDs, channel IDs, inbox record IDs, dispatch preflight IDs, missing idempotency keys, stale fixed-window evidence, and missing sample-size caveat acknowledgement return public-safe validation errors.","Agents must not call provider/domain readiness records live provider configuration, verified DNS, email delivery, or provider-send readiness."]',
  agent_access = 'Agents can read /analytics/source-data, /analytics/indie-launch-dashboard, event capture boundaries, assignment boundaries, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed threshold/anomaly evidence, notification readiness evidence, notification inbox evidence, dispatch preflight evidence, provider/domain readiness evidence, and redacted experiment decision evidence. Owner sessions can record notification inbox records, dispatch preflight records, provider/domain readiness records, and decision evidence through /admin/analytics. Direct public agent analytics writes, provider configuration, provider secrets, private DNS credentials, email sends, provider calls, queue dispatch, customer alerts, experiment routing, automated winners, and revenue claims require future authenticated confirmed-write APIs with privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.',
  validation_json = '["Playwright covers /analytics/source-data, /admin/analytics owner notification inbox, dispatch preflight, and provider/domain readiness evidence, agent manifest discovery, admin source-data, user journey source-data, and redaction boundaries.","Issue #286 records owner-reviewed analytics notification provider/domain readiness without provider configuration, provider secrets, sender credentials, private DNS credentials, provider sends, queues, recipients, bodies, provider message IDs, customer alerts, traffic routing, automated winners, or revenue claims."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-21-analytics-notification-provider-domain-readiness',
  'Added analytics notification provider/domain readiness records',
  'Codex',
  'codex',
  'bumpgrade-bootstrap',
  'Continue the Bumpgrade parity build and add owner-reviewed analytics notification provider/domain readiness evidence for agents.',
  '[{"number":286,"url":"https://github.com/markitics/bumpgrade/issues/286"},{"number":18,"url":"https://github.com/markitics/bumpgrade/issues/18"}]',
  '[]',
  '["https://bumpgrade.com/features","https://bumpgrade.com/analytics/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["src/lib/analytics-notification-provider-domain-readiness.ts","src/app/api/admin/analytics/notification-provider-domain-readiness/route.ts","src/app/analytics/source-data/route.ts","src/lib/agent-manifest.ts","docs/features/analytics-experiments.md","drizzle/0109_analytics_notification_provider_domain_readiness.sql"]',
  '["npm run lint","npm run typecheck","npm run cf:build","Focused analytics provider/domain readiness, source-data, agent docs, admin source-data, and user-journey smoke tests"]',
  NULL,
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/api/admin/analytics/notification-provider-domain-readiness","https://bumpgrade.com/agent-docs/source-data","https://github.com/markitics/bumpgrade/issues/286"]',
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
