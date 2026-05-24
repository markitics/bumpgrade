INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-live-publisher-offer-billing',
  'Live publisher-offer checkout and webhook rollout',
  'pending',
  219,
  'feature-checkout-offers',
  'Checkout and offers',
  'Pending live-mode publisher-offer billing after the first package, amount, Stripe Price policy, and live webhook secret are confirmed. Bumpgrade account-plan self-serve checkout remains separate.',
  json_array(
    'Issue #219 tracks the live publisher-offer billing decision and rollout.',
    'Production publisher-offer checkout remains sandbox-only until the first live package, amount, live Stripe Price policy, and live webhook secret are confirmed.',
    '`/pricing` self-serve Bumpgrade subscription checkout is separate from customer-facing publisher-offer billing.'
  ),
  'Confirm the first live publisher package/amount and STRIPE_WEBHOOK_SECRET_LIVE, then add live-mode checkout and signed webhook proof without exposing provider IDs.',
  NULL,
  125,
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

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-live-publisher-offer-billing-pending',
  'Added live publisher-offer checkout to Director pending',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for a clearer Director-level overview with big categories, recent windows, due work, and pending work instead of noisy niche technical ships.',
  '[{"number":219,"url":"https://github.com/markitics/bumpgrade/issues/219"}]',
  '[]',
  '["https://bumpgrade.com/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["roadmap-live-publisher-offer-billing planned -> pending-next"]',
  '[]',
  '[]',
  '["git diff --check","npm run db:migrate:local","npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g \"roadmap source data|director source data exposes nested executive status windows|director executive queue\""]',
  NULL,
  1779602400,
  1779603300,
  '["https://github.com/markitics/bumpgrade/issues/219","https://bumpgrade.com/roadmap","https://bumpgrade.com/roadmap/source-data","https://bumpgrade.com/admin/director","https://bumpgrade.com/admin/director/source-data"]',
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
