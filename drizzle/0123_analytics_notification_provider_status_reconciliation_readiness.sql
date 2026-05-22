CREATE TABLE IF NOT EXISTS analytics_notification_provider_status_reconciliation_readiness_records (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  readiness_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  inbox_record_id TEXT NOT NULL,
  dispatch_preflight_id TEXT NOT NULL,
  provider_domain_readiness_id TEXT NOT NULL,
  send_payload_readiness_id TEXT NOT NULL,
  delivery_receipt_readiness_id TEXT NOT NULL,
  record_kind TEXT NOT NULL,
  notification_provider_status_reconciliation_readiness_disposition TEXT NOT NULL,
  time_window_key TEXT NOT NULL,
  expected_dashboard_revision_id TEXT NOT NULL,
  expected_readiness_status TEXT NOT NULL,
  expected_notification_inbox_status TEXT NOT NULL,
  expected_notification_dispatch_preflight_status TEXT NOT NULL,
  expected_notification_provider_domain_readiness_status TEXT NOT NULL,
  expected_notification_send_payload_readiness_status TEXT NOT NULL,
  expected_notification_delivery_receipt_readiness_status TEXT NOT NULL,
  expected_owner_review_status TEXT NOT NULL,
  expected_alert_threshold_count INTEGER NOT NULL DEFAULT 0,
  expected_conversion_sample_size INTEGER NOT NULL DEFAULT 0,
  sample_size_caveat_acknowledged INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  confirmation_text_sha256 TEXT NOT NULL,
  owner_provider_status_reconciliation_readiness_recorded INTEGER NOT NULL DEFAULT 0,
  queue_binding_reviewed INTEGER NOT NULL DEFAULT 0,
  consumer_mode_reviewed INTEGER NOT NULL DEFAULT 0,
  producer_dependency_reviewed INTEGER NOT NULL DEFAULT 0,
  payload_read_policy_reviewed INTEGER NOT NULL DEFAULT 0,
  ack_policy_reviewed INTEGER NOT NULL DEFAULT 0,
  retry_dead_letter_policy_reviewed INTEGER NOT NULL DEFAULT 0,
  provider_handoff_dependency_reviewed INTEGER NOT NULL DEFAULT 0,
  idempotency_policy_reviewed INTEGER NOT NULL DEFAULT 0,
  backpressure_policy_reviewed INTEGER NOT NULL DEFAULT 0,
  audit_correlation_reviewed INTEGER NOT NULL DEFAULT 0,
  retention_policy_reviewed INTEGER NOT NULL DEFAULT 0,
  email_send_enabled INTEGER NOT NULL DEFAULT 0,
  queue_dispatch_enabled INTEGER NOT NULL DEFAULT 0,
  queue_producer_enabled INTEGER NOT NULL DEFAULT 0,
  queue_consumer_enabled INTEGER NOT NULL DEFAULT 0,
  provider_status_reconciliation_enabled INTEGER NOT NULL DEFAULT 0,
  queue_message_created INTEGER NOT NULL DEFAULT 0,
  queue_message_consumed INTEGER NOT NULL DEFAULT 0,
  queue_message_acknowledged INTEGER NOT NULL DEFAULT 0,
  retry_dead_letter_row_created INTEGER NOT NULL DEFAULT 0,
  queue_payload_body_read INTEGER NOT NULL DEFAULT 0,
  queue_payload_body_created INTEGER NOT NULL DEFAULT 0,
  customer_alert_enabled INTEGER NOT NULL DEFAULT 0,
  traffic_routing_enabled INTEGER NOT NULL DEFAULT 0,
  automated_winner_enabled INTEGER NOT NULL DEFAULT 0,
  revenue_claim_enabled INTEGER NOT NULL DEFAULT 0,
  raw_analytics_rows_exposed INTEGER NOT NULL DEFAULT 0,
  recipient_identity_included INTEGER NOT NULL DEFAULT 0,
  recipient_payload_created INTEGER NOT NULL DEFAULT 0,
  personalized_body_created INTEGER NOT NULL DEFAULT 0,
  raw_payload_body_stored INTEGER NOT NULL DEFAULT 0,
  email_body_included INTEGER NOT NULL DEFAULT 0,
  provider_message_id_included INTEGER NOT NULL DEFAULT 0,
  queue_payload_included INTEGER NOT NULL DEFAULT 0,
  provider_send_enabled INTEGER NOT NULL DEFAULT 0,
  provider_status_reconciliation_recorded INTEGER NOT NULL DEFAULT 0,
  provider_configured INTEGER NOT NULL DEFAULT 0,
  provider_response_created INTEGER NOT NULL DEFAULT 0,
  provider_secret_included INTEGER NOT NULL DEFAULT 0,
  sender_domain_configured INTEGER NOT NULL DEFAULT 0,
  sender_domain_verified INTEGER NOT NULL DEFAULT 0,
  sender_credential_included INTEGER NOT NULL DEFAULT 0,
  private_dns_credentials_included INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_notification_provider_status_reconciliation_readiness_idempotency_unique
  ON analytics_notification_provider_status_reconciliation_readiness_records(idempotency_key);
CREATE INDEX IF NOT EXISTS analytics_notification_provider_status_reconciliation_readiness_dashboard_time_idx
  ON analytics_notification_provider_status_reconciliation_readiness_records(dashboard_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_notification_provider_status_reconciliation_readiness_readiness_channel_idx
  ON analytics_notification_provider_status_reconciliation_readiness_records(readiness_id, channel_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_notification_provider_status_reconciliation_readiness_send_payload_idx
  ON analytics_notification_provider_status_reconciliation_readiness_records(send_payload_readiness_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_notification_provider_status_reconciliation_readiness_delivery_receipt_idx
  ON analytics_notification_provider_status_reconciliation_readiness_records(delivery_receipt_readiness_id, created_at);

UPDATE admin_roadmap_items
SET
  public_evidence_json = json_insert(
    COALESCE(public_evidence_json, json_array()),
    '$[#]',
    json_object('label', 'Issue #311 owner-reviewed analytics notification provider-status reconciliation readiness', 'url', 'https://github.com/markitics/bumpgrade/issues/311')
  ),
  summary = replace(
    summary,
    'owner-reviewed delivery-receipt readiness records, owner-confirmed experiment decision evidence',
    'owner-reviewed delivery-receipt readiness records, owner-reviewed provider-status reconciliation readiness records, owner-confirmed experiment decision evidence'
  ),
  next_milestone = 'Add analytics notification provider-status reconciliation execution only after provider-status reconciliation readiness keeps provider sends/calls, provider responses, provider message IDs, delivery receipts, status webhooks, receipt payloads, raw delivery receipts, provider secrets, sender credentials, recipients, email bodies, queues, customer alerts, and sends disabled.',
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = json_array(18,87,105,107,119,121,123,125,127,129,261,263,265,267,269,271,284,286,288,290,292,294,297,299,301,303,305,307,309,311),
  user_goal = replace(
    user_goal,
    'record owner-reviewed delivery-receipt readiness evidence, and record owner-reviewed experiment decision evidence',
    'record owner-reviewed delivery-receipt readiness evidence, record owner-reviewed provider-status reconciliation readiness evidence, and record owner-reviewed experiment decision evidence'
  ),
  source_evidence_json = json_insert(
    json_insert(
      COALESCE(source_evidence_json, json_array()),
      '$[#]',
      'https://bumpgrade.com/api/admin/analytics/notification-provider-status-reconciliation-readiness'
    ),
    '$[#]',
    'https://github.com/markitics/bumpgrade/issues/311'
  ),
  happy_path_json = json_insert(
    json_insert(
      COALESCE(happy_path_json, json_array()),
      '$[#]',
      'Read notificationProviderStatusReconciliationReadiness from /analytics/source-data to inspect owner-reviewed provider-status reconciliation readiness counts, current delivery-receipt evidence, and redaction flags.'
    ),
    '$[#]',
    'Open /admin/analytics as a verified owner and record redacted provider-status reconciliation readiness only after a current delivery-receipt readiness record exists.'
  ),
  edge_cases_json = json_insert(
    COALESCE(edge_cases_json, json_array()),
    '$[#]',
    'Provider-status reconciliation readiness remains owner-reviewed evidence only: it does not poll providers, process delivery receipts, ingest receipt payloads, reconcile provider statuses, call providers, send email, expose recipients, expose provider responses or message IDs, create customer alerts, route traffic, choose winners, or make revenue claims.'
  ),
  agent_access = agent_access || ' Agents can read owner-reviewed provider-status reconciliation aggregate evidence from /analytics/source-data and owner sessions can record provider-status reconciliation readiness through /api/admin/analytics/notification-provider-status-reconciliation-readiness. Provider polling, receipt processing, provider status reconciliation execution, provider responses, provider message IDs, recipients, email sends, customer alerts, routing, winners, and revenue claims still require future authenticated confirmed-write APIs.',
  validation_json = json_insert(
    COALESCE(validation_json, json_array()),
    '$[#]',
    'Playwright covers owner-reviewed provider-status reconciliation readiness auth, stale delivery-receipt evidence, idempotency, source-data redaction, admin/source-data contracts, user-journey contracts, and agent-doc contracts.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-22-analytics-notification-provider-status-reconciliation-readiness',
  'Added analytics notification provider-status reconciliation readiness records',
  'Codex',
  'codex',
  'bumpgrade-goal-runner',
  'Continue the Bumpgrade parity build and add owner-reviewed analytics notification provider-status reconciliation readiness evidence for agents.',
  json_array(json_object('number',311,'url','https://github.com/markitics/bumpgrade/issues/311'), json_object('number',18,'url','https://github.com/markitics/bumpgrade/issues/18'), json_object('number',3,'url','https://github.com/markitics/bumpgrade/issues/3')),
  json_array(),
  json_array('https://bumpgrade.com/features','https://bumpgrade.com/analytics/source-data'),
  json_array('https://bumpgrade.com/admin/roadmap','https://bumpgrade.com/roadmap/source-data'),
  json_array('https://bumpgrade.com/admin/user-journeys','https://bumpgrade.com/admin/user-journeys/source-data'),
  json_array('src/lib/analytics-notification-provider-status-reconciliation-readiness.ts','src/app/api/admin/analytics/notification-provider-status-reconciliation-readiness/route.ts','src/app/analytics/source-data/route.ts','src/lib/agent-manifest.ts','docs/features/analytics-experiments.md','docs/agent/agent-ready.md','drizzle/0123_analytics_notification_provider_status_reconciliation_readiness.sql'),
  json_array('npm run db:migrate:local','npm run typecheck','npm run cf:build','npm run lint','npm run test:runtime-secrets','npx playwright test tests/smoke.spec.ts --project=chromium focused provider-status reconciliation readiness coverage','admin analytics provider-status reconciliation readiness screenshot captured under docs/pr-screenshots and public/pr-screenshots'),
  'Provider-status reconciliation readiness remains review-only: no provider polling, delivery receipt processing, receipt payload ingestion, provider status reconciliation execution, provider call, provider send, provider response, provider message ID, provider secret, sender credential, private DNS credential, Queue producer, queue message, queue acknowledgement, queue payload body, recipient payload, email body, customer alert, traffic routing, automated winner, or revenue claim was enabled.',
  unixepoch(),
  unixepoch(),
  json_array('https://bumpgrade.com/analytics/source-data','https://bumpgrade.com/api/admin/analytics/notification-provider-status-reconciliation-readiness','https://bumpgrade.com/agent-docs/source-data','https://bumpgrade.com/pr-screenshots/issue-311-admin-analytics-provider-status-reconciliation-readiness.png','https://github.com/markitics/bumpgrade/issues/311'),
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
