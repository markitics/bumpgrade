UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, bulk purge policy, and agent-safe writes; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, webinar event/replay links, archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and expanded direct agent-safe private draft writes are now part of this bucket''s shipped evidence.',
  public_evidence_json = json_array(
    'Issue #417 tracks the advanced funnel parity bucket after issue #14 MVP closeout.',
    'Issue #430 moves granular existing-block title/body editing into the owner-session builder.',
    'Issue #432 moves reusable block add/remove controls into the owner-session builder while keeping direct agent block structure edits pending.',
    'Issue #417 adds owner-confirmed checkout unlinking from private draft blocks while preserving block IDs, kinds, title/body copy, step order, and audit evidence.',
    'Issue #417 adds owner-confirmed resource delivery links from private draft resource/delivery blocks to public-safe product/access catalog assets without private R2 keys, signed URLs, buyer records, arbitrary uploaded asset delivery, or live fulfillment automation.',
    'Issue #417 adds funnel-scoped private download-token delivery from published linked resource blocks after checkout intent, entitlement, product, and file asset scope match.',
    'Issue #417 adds owner-confirmed webinar event/replay links from private draft webinar blocks to public-safe external URLs without provider secrets, attendance tracking, reminder automation, or replay hosting.',
    'Issue #417 adds owner-session within-step block reordering while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, step membership, and audit evidence.',
    'Issue #417 adds owner-session drag/drop block placement in /admin/funnels by replaying the existing block reorder and cross-step move endpoint modes with fresh revisions.',
    'Issue #417 adds owner-session cross-step block moves while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, and audit evidence.',
    'Issue #417 adds owner-session direct agent-safe private draft writes through /api/agent/funnels/draft-writes for block copy edits, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, and archive/unpublish after exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Issue #14 remains the shipped MVP covering D1 draft funnels, owner-gated edits, private preview, exact-confirmed publishing, duplication, archive/unpublish, templates, source-data, and public semantic routes.',
    'Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.'
  ),
  next_milestone = 'Design freeform canvas layout styling, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, direct agent-created delivery tokens, direct agent public publishing, direct agent block add/remove, and direct agent purge as one coherent post-MVP workflow instead of more single-gate readiness slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-advanced-funnel-builder-parity';

UPDATE admin_user_journeys
SET
  validation_json = json_array(
    'Issue #14 is the shipped funnel MVP boundary.',
    'Issue #91 records the first owner-gated draft funnel builder scaffold.',
    'Issue #93 records step edit and reorder controls.',
    'Issue #95 records owner-gated private draft preview.',
    'Issue #135 records exact-confirmed D1 draft publishing.',
    'Issue #159 records reusable template and block-template source data.',
    'Issue #161 records owner-confirmed template-to-draft creation.',
    'Issue #163 records owner-confirmed checkout-offer linking on private draft steps.',
    'Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.',
    'Issue #213 records webinar/resource funnel template and D1 step-kind storage readiness.',
    'Issue #215 records owner-confirmed private draft duplication.',
    'Issue #341 records owner-confirmed archive/unpublish lifecycle actions.',
    'Issue #409 records owner-created product delivery-gate links for the seeded offer/funnel path.',
    'Issue #417 records owner-session direct agent-safe private block copy edits, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block reordering, cross-step block moves, private duplication, and archive/unpublish.'
  ),
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, block-edit capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, and published D1 funnel routes. Owner-session agents can use /api/agent/funnels/draft-writes for private block copy edits, checkout linking/unlinking, block reordering, cross-step block moves, resource-delivery linking, webinar-event linking, private duplication, and archive/unpublish with exact confirmation, idempotency, current revision checks, audit correlation, and redacted responses. Direct agent purge, block add/remove, public publishing, live billing, signed URLs, live fulfillment automation, and unauthenticated public agent writes remain out of scope.',
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-25-agent-funnel-editor-operations',
  'Expanded agent-safe funnel editor operations',
  'Codex',
  'codex',
  'bumpgrade-agent-funnel-editor-operations',
  'The Bumpgrade goal-runner continued issue #417 and narrowed the next agent-safe funnel parity slice to owner-session checkout linking/unlinking and block placement operations.',
  '[{"number":417,"url":"https://github.com/markitics/bumpgrade/issues/417"}]',
  '[]',
  '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/features/source-data","https://bumpgrade.com/agent-docs/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/funnels.md","docs/agent/agent-ready.md","public/llms.txt"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|agent funnel draft write endpoint\"","npx playwright test tests/smoke.spec.ts --project=chromium -g \"admin source data exposes|admin user journeys source data exposes|agent docs source data exposes|agent manifest\""]',
  'This keeps the writes private and owner-session confirmed. It adds direct agent-safe checkout link/unlink and block movement, but still excludes direct public publishing, purge, block add/remove, signed URLs, live billing, live fulfillment automation, and unauthenticated public agent writes.',
  1779586640,
  1779690360,
  '["https://github.com/markitics/bumpgrade/issues/417","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/agent-docs/source-data"]',
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
