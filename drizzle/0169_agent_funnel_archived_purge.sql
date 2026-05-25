UPDATE admin_roadmap_items
SET
  summary = 'Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, bulk purge policy, and agent-safe writes; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, webinar event/replay links, visual block style controls, archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and owner-session direct agent-safe draft writes including block add/remove, public publishing, and archived-draft purge are now part of this bucket''s shipped evidence.',
  public_evidence_json = replace(
    public_evidence_json,
    'Issue #417 adds owner-session direct agent-safe draft writes through /api/agent/funnels/draft-writes for block copy edits, visual style presets, reusable block add/remove, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, public publishing, and archive/unpublish after exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Issue #417 adds owner-session direct agent-safe draft writes through /api/agent/funnels/draft-writes for block copy edits, visual style presets, reusable block add/remove, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, public publishing, archive/unpublish, and archived-draft purge after exact confirmation, idempotency, current revision checks, and audit correlation.'
  ),
  next_milestone = 'Design full absolute-position canvas editing, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, direct agent-created delivery tokens, and unauthenticated public agent publishing as one coherent post-MVP workflow instead of more single-gate readiness slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-advanced-funnel-builder-parity';

UPDATE admin_roadmap_items
SET
  public_evidence_json = replace(
    public_evidence_json,
    'public publishing, and archive/unpublish while tracking remaining full absolute-position canvas editing, full webinar integrations, bulk purge policy, live fulfillment automation, arbitrary uploaded private asset delivery, direct agent-created delivery tokens, unauthenticated public agent publishing, and direct agent purge after the MVP closeout.',
    'public publishing, archive/unpublish, and archived-draft purge while tracking remaining full absolute-position canvas editing, full webinar integrations, bulk purge policy, live fulfillment automation, arbitrary uploaded private asset delivery, direct agent-created delivery tokens, and unauthenticated public agent publishing after the MVP closeout.'
  ),
  next_milestone = 'Keep full absolute-position canvas editing, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, direct agent-created delivery tokens, and unauthenticated public agent publishing in issue #417; keep live publisher-offer billing in issue #219.',
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

UPDATE admin_user_journeys
SET
  happy_path_json = replace(
    happy_path_json,
    'Use the write boundary to avoid claiming live billing, non-archived purge, direct agent purge, direct agent-created delivery tokens, unauthenticated public agent publishing, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, arbitrary CSS, full absolute-position canvas editing, or broad direct agent-write capability beyond the owner-session draft write API.',
    'Use the write boundary to avoid claiming live billing, non-archived purge, bulk purge, direct agent-created delivery tokens, unauthenticated public agent publishing, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, arbitrary CSS, full absolute-position canvas editing, or broad direct agent-write capability beyond the owner-session draft write API.'
  ),
  edge_cases_json = replace(
    replace(
      edge_cases_json,
      'private draft duplication, public publishing, and archive/unpublish after exact confirmation, idempotency, current revision checks, and audit correlation.',
      'private draft duplication, public publishing, archive/unpublish, and archived-draft purge after exact confirmation, idempotency, current revision checks, and audit correlation.'
    ),
    'Non-archived purge, bulk purge, live billing, full absolute-position canvas editing, direct agent purge, direct agent-created delivery tokens, unauthenticated public agent publishing, and broader direct agent edits require future confirmed-write APIs.',
    'Non-archived purge, bulk purge, live billing, full absolute-position canvas editing, direct agent-created delivery tokens, unauthenticated public agent publishing, and broader direct agent edits require future confirmed-write APIs.'
  ),
  validation_json = replace(
    validation_json,
    'owner-session direct agent visual style writes, owner-session direct agent public publishing, and the remaining advanced funnel parity follow-up after MVP closeout.',
    'owner-session direct agent visual style writes, owner-session direct agent public publishing, owner-session direct agent archived-draft purge, and the remaining advanced funnel parity follow-up after MVP closeout.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';

UPDATE admin_user_journeys
SET
  edge_cases_json = replace(
    edge_cases_json,
    'Non-archived purge, bulk purge, full absolute-position canvas editing, live billing, direct agent purge, direct agent-created delivery tokens, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, unauthenticated public agent publishing, and broad direct agent writes beyond private block copy edits, visual style presets, reusable block add/remove, checkout linking/unlinking, block movement, resource-delivery linking, webinar-event linking, private duplication, public publishing, and archive/unpublish still require future confirmed-write APIs.',
    'Non-archived purge, bulk purge, full absolute-position canvas editing, live billing, direct agent-created delivery tokens, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, unauthenticated public agent publishing, and broad direct agent writes beyond private block copy edits, visual style presets, reusable block add/remove, checkout linking/unlinking, block movement, resource-delivery linking, webinar-event linking, private duplication, public publishing, archive/unpublish, and archived-draft purge still require future confirmed-write APIs.'
  ),
  agent_access = replace(
    replace(
      agent_access,
      'private duplication, public publishing, and archive/unpublish with the same confirmation, stale-state, audit, and redaction boundary.',
      'private duplication, public publishing, archive/unpublish, and archived-draft purge with the same confirmation, stale-state, audit, and redaction boundary.'
    ),
    'direct agent purge and unauthenticated public agent publishing are still planned.',
    'direct agent non-archived purge and unauthenticated public agent publishing are still planned.'
  ),
  validation_json = replace(
    validation_json,
    'owner-session direct agent visual style writes, and the remaining advanced funnel parity follow-up after MVP closeout.',
    'owner-session direct agent visual style writes, owner-session direct agent archived-draft purge, and the remaining advanced funnel parity follow-up after MVP closeout.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-25-agent-funnel-archived-purge',
  'Added owner-session agent archived draft purge',
  'Codex',
  'codex',
  'bumpgrade-agent-funnel-archived-purge',
  'The Bumpgrade goal-runner continued issue #417 and promoted the existing archived-draft purge policy into the owner-session agent draft-write contract without opening another narrow issue.',
  '[{"number":417,"url":"https://github.com/markitics/bumpgrade/issues/417"}]',
  '[]',
  '["https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/features/source-data","https://bumpgrade.com/agent-docs/source-data","https://bumpgrade.com/api/agent/funnels/draft-writes"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/funnels.md","docs/agent/agent-ready.md","public/llms.txt","src/lib/agent-manifest.ts"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g \"agent funnel draft write endpoint records owner-session private edits|funnel source data exposes\"","npx playwright test tests/smoke.spec.ts --project=chromium -g \"agent docs source data exposes|agent manifest|admin source data exposes|admin user journeys source data exposes\"","git diff --check"]',
  'This moves direct agent archived-draft purge from planned to live for owner-session agents only. It still requires exact confirmation, idempotency, current archived revision, audit correlation, and tombstone evidence, and it does not delete audit rows, product assets, R2 objects, buyer records, billing state, non-archived drafts, or bulk rows.',
  1779704319,
  1779704972,
  '["https://github.com/markitics/bumpgrade/issues/417","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/agent-docs/source-data","https://bumpgrade.com/api/agent/funnels/draft-writes"]',
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
