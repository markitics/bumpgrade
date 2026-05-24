UPDATE admin_roadmap_items
SET
  status = 'live',
  public_evidence_json = json_array(
    'Tracked by issue #17.',
    'Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.',
    'Issue #103 adds consent-backed opt-in capture with normalized subscriber, consent, tag, and draft sequence enrollment evidence.',
    'Issue #137 adds /admin/audience owner subscriber inspection with aggregate public redaction flags.',
    'Issue #167 adds public-safe unsubscribe/suppression evidence without list-membership leakage.',
    'Issue #169 adds owner-gated CRM-lite timeline notes with aggregate public redaction.',
    'Issues #171 through #211 add suppression-aware broadcast readiness, dry-run schedule intents, preview/footer safety, queue readiness, delivery-batch, queue-message, dispatch-preflight, dispatch-attempt, sender-domain, provider-event, provider rate-limit, provider response, send-payload, Queue producer, and Queue consumer readiness boundaries without live sends.',
    'Issues #253, #259, and #347 add owner-confirmed import-intent, import-preflight, and aggregate export-readiness boundaries without real imports or private exports.',
    'Issues #351 through #380 add aggregate sequence delivery readiness and dry-run sequence execution/readiness boundaries without live sequence delivery.',
    'Issue #420 tracks live email delivery, automation execution, and direct agent-safe write parity as one pending post-MVP execution bucket.'
  ),
  next_milestone = 'Keep live sender/provider configuration, Queue producer/consumer execution, recipient payloads, provider calls, delivery results, webhooks, imports, exports, and agent-safe write tools in issue #420 instead of reopening more isolated readiness-gate slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-live-email-delivery-execution',
  'Live email delivery, automation execution, and agent-safe writes',
  'pending',
  420,
  'feature-email-automation-crm',
  'Growth system',
  'Pending post-MVP execution bucket for sender/domain/provider setup, Cloudflare Queue producer and consumer execution, recipient payload generation, provider calls, delivery attempts, results, webhooks, polling, receipts, live imports, exports, automation execution, and direct agent-safe write APIs.',
  json_array(
    'Tracked by issue #420.',
    'Issue #17 remains the shipped email automation MVP for consent-backed opt-ins, unsubscribe/suppression, owner subscriber inspection, CRM-lite notes, dry-run broadcast and sequence readiness, and source-data contracts.',
    'The issue #17 closeout deliberately stops creating more single-gate proof slices unless they directly unlock live execution.'
  ),
  'Design and ship the real broadcast and sequence execution path as one coherent workflow with consent, suppression, unsubscribe, sender-domain, provider, Queue, idempotency, audit, redaction, retry, dead-letter, webhook, receipt, and confirmed-write checks.',
  NULL,
  145,
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
WHERE feature_id = 'feature-email-automation-crm';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171,173,175,177,183,189,191,197,199,201,203,205,207,209,211,253,259,347,351,354,358,360,362,364,366,368,370,372,374,376,378,380,420]',
  source_evidence_json = CASE
    WHEN instr(source_evidence_json, 'issues/420') > 0 THEN source_evidence_json
    ELSE json_insert(source_evidence_json, '$[#]', 'https://github.com/markitics/bumpgrade/issues/420')
  END,
  validation_json = CASE
    WHEN instr(validation_json, 'Issue #420') > 0 THEN validation_json
    ELSE json_insert(validation_json, '$[#]', 'Issue #420 tracks live email delivery, automation execution, and agent-safe write parity after the issue #17 MVP closeout.')
  END,
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-email-automation-mvp-live-closeout',
  'Moved Email automation MVP to live and grouped delivery execution',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark said the project felt noisy and wanted Director-level nesting; this closes out the satisfied email MVP parent and leaves one broad pending delivery/execution bucket instead of more niche readiness-gate ships.',
  '[{"number":17,"url":"https://github.com/markitics/bumpgrade/issues/17"},{"number":420,"url":"https://github.com/markitics/bumpgrade/issues/420"}]',
  '[]',
  '["feature-email-automation-crm"]',
  '["roadmap-email-automation active -> live","roadmap-live-email-delivery-execution pending"]',
  '["journey-publisher-previews-audience-automation launch-preview -> live","journey-visitor-joins-indie-launch-waitlist launch-preview -> live"]',
  '["docs/features/audience-automation.md","docs/agent/agent-ready.md","public/llms.txt"]',
  '["git diff --check","npm run db:migrate:local","npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run cf:build","focused Playwright source-data checks"]',
  NULL,
  unixepoch() - 3600,
  unixepoch(),
  '["https://github.com/markitics/bumpgrade/issues/17","https://github.com/markitics/bumpgrade/issues/420","https://bumpgrade.com/audience/source-data","https://bumpgrade.com/features/source-data","https://bumpgrade.com/roadmap/source-data","https://bumpgrade.com/admin/roadmap/source-data","https://bumpgrade.com/admin/director/source-data","https://bumpgrade.com/admin/user-journeys/source-data"]',
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
