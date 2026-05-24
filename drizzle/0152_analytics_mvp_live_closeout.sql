UPDATE admin_roadmap_items
SET
  status = 'live',
  public_evidence_json = json_array(
    'Tracked by issue #18.',
    'Issue #87 adds the first /analytics/source-data contract and /analytics/indie-launch-dashboard preview scaffold.',
    'Issue #105 adds POST /api/analytics/events with seeded event validation, idempotency, hashed request evidence, and aggregate-only source-data reporting.',
    'Issue #107 adds POST /api/analytics/assignments with seeded experiment validation, deterministic weighted variant assignment, hashed visitor evidence, and aggregate-only assignment reporting.',
    'Issues #119 through #129 add aggregate conversion reports, browser-side page-view beacons, deterministic variant evidence, normalized source attribution, dashboard-visible source rows, and fixed all-time, 24-hour, 7-day, and 30-day aggregate windows.',
    'Issues #261 through #311 add owner-confirmed experiment decision evidence, aggregate exports, cohort comparison, alert threshold/anomaly review, notification delivery readiness, inbox records, dispatch preflights, provider/domain readiness, content/consent readiness, send-payload readiness, Queue producer readiness, Queue consumer readiness, provider-call readiness, delivery-attempt readiness, delivery-result readiness, delivery-status webhook readiness, provider-polling readiness, receipt-payload readiness, delivery-receipt readiness, and provider-status reconciliation readiness without live sends or routing.',
    'Issue #422 tracks live analytics automation, experiment routing, notification execution, and direct agent-safe write parity as one pending post-MVP execution bucket.'
  ),
  next_milestone = 'Keep live analytics automation, experiment routing, notification execution, Queue producer/consumer execution, provider calls, delivery results, raw exports, and agent-safe write tools in issue #422 instead of reopening more isolated readiness-gate slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-analytics-testing';

INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-live-analytics-execution',
  'Live analytics automation, experiment routing, notification execution, and agent-safe writes',
  'pending',
  422,
  'feature-analytics-testing',
  'Optimization',
  'Pending post-MVP execution bucket for custom/non-seeded analytics event schemas, live experiment traffic routing, holdouts, winner selection, rollback and audit logs, automated alert/notification execution, Cloudflare Queue producer and consumer execution, provider calls, delivery attempts, results, webhooks, polling, receipts, raw/private exports, and direct agent-safe analytics write APIs.',
  json_array(
    'Issue #422 tracks this pending post-MVP execution bucket.',
    'Issue #18 remains the shipped analytics MVP for privacy-safe events, deterministic assignments, aggregate conversion reporting, fixed-window attribution, owner decision evidence, aggregate exports, and notification readiness proof.',
    'The issue #18 closeout deliberately stops creating more single-gate proof slices unless they directly unlock live execution.'
  ),
  'Design and ship live analytics execution as one coherent workflow with privacy review, idempotency, audit correlation, stale-state checks, redaction, Queue/provider safety, rollback, sample-size caveats, and confirmed-write checks.',
  NULL,
  155,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  status=excluded.status,
  issue_number=excluded.issue_number,
  feature_id=excluded.feature_id,
  group_name=excluded.group_name,
  summary=excluded.summary,
  public_evidence_json=excluded.public_evidence_json,
  next_milestone=excluded.next_milestone,
  mark_attention=excluded.mark_attention,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;

UPDATE admin_user_journeys
SET
  feature_status = 'live',
  updated_at = unixepoch()
WHERE feature_id = 'feature-analytics-testing';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[18,87,105,107,119,121,123,125,127,129,261,263,265,267,269,271,284,286,288,290,292,294,297,299,301,303,305,307,309,311,422]',
  source_evidence_json = CASE
    WHEN instr(source_evidence_json, 'issues/422') > 0 THEN source_evidence_json
    ELSE json_insert(source_evidence_json, '$[#]', 'https://github.com/markitics/bumpgrade/issues/422')
  END,
  validation_json = CASE
    WHEN instr(validation_json, 'Issue #422') > 0 THEN validation_json
    ELSE json_insert(validation_json, '$[#]', 'Issue #422 tracks live analytics automation, experiment routing, notification execution, and agent-safe write parity after the issue #18 MVP closeout.')
  END,
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-analytics-experiments';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-analytics-mvp-live-closeout',
  'Moved Analytics MVP to live and grouped execution work',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark said the project felt noisy and wanted Director-level nesting; this closes out the satisfied analytics MVP parent and leaves one broad pending execution bucket instead of more niche readiness-gate ships.',
  '[{"number":18,"url":"https://github.com/markitics/bumpgrade/issues/18"},{"number":422,"url":"https://github.com/markitics/bumpgrade/issues/422"}]',
  '[]',
  '["feature-analytics-testing"]',
  '["roadmap-analytics-testing active -> live","roadmap-live-analytics-execution pending"]',
  '["journey-publisher-previews-analytics-experiments launch-preview -> live","journey-publisher-reads-funnel-conversion-report launch-preview -> live","journey-agent-records-privacy-safe-analytics-event launch-preview -> live","journey-agent-assigns-privacy-safe-experiment-variant launch-preview -> live"]',
  '["docs/features/analytics-experiments.md","docs/agent/agent-ready.md","public/llms.txt"]',
  '["git diff --check","npm run db:migrate:local","npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run cf:build","focused Playwright source-data checks"]',
  NULL,
  unixepoch() - 3600,
  unixepoch(),
  '["https://github.com/markitics/bumpgrade/issues/18","https://github.com/markitics/bumpgrade/issues/422","https://bumpgrade.com/analytics/source-data","https://bumpgrade.com/features/source-data","https://bumpgrade.com/roadmap/source-data","https://bumpgrade.com/admin/roadmap/source-data","https://bumpgrade.com/admin/director/source-data","https://bumpgrade.com/admin/user-journeys/source-data"]',
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
  pr_comment_url=excluded.pr_comment_url,
  updated_at=excluded.updated_at;
