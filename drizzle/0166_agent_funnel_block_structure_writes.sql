UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, bulk purge policy, and agent-safe writes; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, webinar event/replay links, archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and owner-session direct agent-safe draft writes including block add/remove and public publishing are now part of this bucket''s shipped evidence.',
  public_evidence_json = json_array(
    'Issue #417 tracks the advanced funnel parity bucket after issue #14 MVP closeout.',
    'Issue #430 moves granular existing-block title/body editing into the owner-session builder.',
    'Issue #432 moves reusable block add/remove controls into the owner-session builder; issue #417 now exposes those block add/remove semantics through the owner-session agent draft-write contract.',
    'Issue #417 adds owner-confirmed checkout unlinking from private draft blocks while preserving block IDs, kinds, title/body copy, step order, and audit evidence.',
    'Issue #417 adds owner-confirmed resource delivery links from private draft resource/delivery blocks to public-safe product/access catalog assets without private R2 keys, signed URLs, buyer records, arbitrary uploaded asset delivery, or live fulfillment automation.',
    'Issue #417 adds funnel-scoped private download-token delivery from published linked resource blocks after checkout intent, entitlement, product, and file asset scope match.',
    'Issue #417 adds owner-confirmed webinar event/replay links from private draft webinar blocks to public-safe external URLs without provider secrets, attendance tracking, reminder automation, or replay hosting.',
    'Issue #417 adds owner-session within-step block reordering while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, step membership, and audit evidence.',
    'Issue #417 adds owner-session drag/drop block placement in /admin/funnels by replaying the existing block reorder and cross-step move endpoint modes with fresh revisions.',
    'Issue #417 adds owner-session cross-step block moves while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, and audit evidence.',
    'Issue #417 adds owner-session direct agent-safe draft writes through /api/agent/funnels/draft-writes for block copy edits, reusable block add/remove, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, public publishing, and archive/unpublish after exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Owner-session direct agent block removal refuses checkout-linked blocks and refuses to leave a step empty.',
    'Owner-session direct agent publishing creates a public route mutation with archive-draft rollback and no billing mutation; unauthenticated public agent publishing remains not live.',
    'Issue #14 remains the shipped MVP covering D1 draft funnels, owner-gated edits, private preview, exact-confirmed publishing, duplication, archive/unpublish, templates, source-data, and public semantic routes.',
    'Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.'
  ),
  next_milestone = 'Design freeform canvas layout styling, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, direct agent-created delivery tokens, unauthenticated public agent publishing, and direct agent purge as one coherent post-MVP workflow instead of more single-gate readiness slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-advanced-funnel-builder-parity';

UPDATE admin_user_journeys
SET
  agent_access = 'Agents can read /funnels/source-data, reusable template and block-template records, webinar/resource page-shape records, draft duplication capability metadata, granular block-edit capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, the seeded preview route, and published D1 funnel routes. Owner-session template-to-draft creation, private draft duplication, block copy editing, reusable block add/remove, within-step block reordering, cross-step block moves, checkout-offer linking, resource delivery linking, webinar event/replay linking, public publishing, archive/unpublish actions, and archived-draft purge require owner auth, idempotency, and stale-state checks; public funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published resource block; direct agent writes require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.',
  validation_json = json_array(
    'Playwright covers /funnels/source-data, /funnels/indie-launch-sandbox template and block library rendering, sitemap discovery, and agent manifest read-contract discovery.',
    'Issue #79 records the first funnel source-data contract and preview scaffold.',
    'Issue #159 records the first reusable template and block-template library contract.',
    'Issue #161 records owner-confirmed template-to-draft creation.',
    'Issue #163 records owner-confirmed checkout-offer linking on private draft steps.',
    'Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.',
    'Issue #213 records webinar/resource template and block contracts.',
    'Issue #215 records owner-confirmed private draft duplication.',
    'Issue #341 records owner-confirmed archive/unpublish lifecycle actions.',
    'Issue #430 records owner-session granular draft block title/body editing.',
    'Issue #432 records owner-session reusable block add/remove controls with checkout-linked block protection.',
    'Issue #409 records owner-created product delivery-gate links for the seeded offer/funnel path.',
    'Issue #417 records owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private delivery tokens, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge, owner-session within-step block reordering, owner-session drag/drop block placement, owner-session cross-step block moves, owner-session direct agent reusable block add/remove, owner-session direct agent public publishing, and the remaining advanced funnel parity follow-up after MVP closeout.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';

UPDATE admin_user_journeys
SET
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, block-edit capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, and published D1 funnel routes. Owner-session UI may create from templates, duplicate, edit steps, edit existing block copy, add reusable blocks, remove safe unlinked blocks, reorder or drag/drop existing blocks within a step, move existing blocks across steps, link checkout offers, link resource delivery, link webinar event/replay references, preview, publish, archive, unpublish, and purge archived private draft steps with actor identity, confirmation where required, idempotency, audit correlation, stale-state checks, and redaction. Owner-session agents can use /api/agent/funnels/draft-writes for private block copy edits, reusable block add/remove, checkout linking/unlinking, block reordering, cross-step block moves, resource-delivery linking, webinar-event linking, private duplication, public publishing, and archive/unpublish with the same confirmation, stale-state, audit, and redaction boundary. Published funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published linked resource block; direct agent purge and unauthenticated public agent publishing are still planned.',
  validation_json = json_array(
    'Playwright covers the owner-gated /admin/funnels surface, webinar/resource template records, template-to-draft create path, draft duplicate path, granular block-edit path, block add/remove path, block reorder path, drag/drop block placement UI, cross-step block move path, linked-checkout block removal refusal, checkout-link create path, resource delivery link path, funnel-scoped private delivery token path, webinar event link path, archived-draft purge path, idempotent replay, stale checkout-link/resource-link/webinar-link/purge, block-edit, block-add, block-remove, block-move, and cross-step block-move rejection, seed/update/reorder/publish/archive POST paths, stale publish/archive rejection, archived draft read-only behavior, private draft preview, public D1 funnel route rendering, public linked-checkout start rendering, public resource-link and webinar-link rendering, archive removal from /funnels/source-data, /funnels/source-data capability metadata, direct agent publish/archive/block-add/block-remove write coverage, and agent manifest discovery.',
    'Issue #91 records the first owner-gated draft funnel builder scaffold.',
    'Issue #93 records the first step edit and reorder controls.',
    'Issue #95 records the first owner-gated private draft preview route.',
    'Issue #135 records the first exact-confirmed D1 draft publishing path.',
    'Issue #159 records reusable template and block-template source data.',
    'Issue #161 records owner-confirmed template-to-draft creation.',
    'Issue #163 records owner-confirmed checkout-offer linking on private draft steps.',
    'Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.',
    'Issue #213 records webinar/resource funnel template and D1 step-kind storage readiness.',
    'Issue #215 records owner-confirmed private draft duplication.',
    'Issue #341 records owner-confirmed archive/unpublish lifecycle actions.',
    'Issue #409 records owner-created product delivery-gate links for the seeded offer/funnel path.',
    'Issue #417 records owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private delivery tokens, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge, owner-session within-step block reordering, owner-session cross-step block moves, owner-session direct agent reusable block add/remove, owner-session direct agent public publishing, and the remaining advanced funnel parity follow-up after MVP closeout.',
    'Issue #430 records owner-session granular draft block title/body editing.',
    'Issue #432 records owner-session reusable block add/remove controls with checkout-linked block protection.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-25-agent-funnel-block-structure-writes',
  'Added owner-session agent funnel block add/remove',
  'Codex',
  'codex',
  'bumpgrade-agent-funnel-block-structure-writes',
  'The Bumpgrade goal-runner continued issue #417 and narrowed the next funnel parity slice to owner-session direct agent add/remove operations for reusable private draft blocks.',
  '[{"number":417,"url":"https://github.com/markitics/bumpgrade/issues/417"}]',
  '[]',
  '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/features/source-data","https://bumpgrade.com/agent-docs/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/funnels.md","docs/agent/agent-ready.md","public/llms.txt","docs/pr-screenshots/issue-417-agent-block-add-remove.png"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|agent funnel draft write endpoint\"","npx playwright test tests/smoke.spec.ts --project=chromium -g \"admin source data exposes|admin user journeys source data exposes|agent docs source data exposes|agent manifest\""]',
  'This extends the owner-session agent write contract to reusable block add/remove while keeping removals fail-closed for checkout-linked blocks and last-block-per-step cases. It still excludes unauthenticated public agent writes, direct agent purge, direct agent-created delivery tokens, signed URLs, live billing, live fulfillment automation, and provider-side webinar automation.',
  1779586640,
  unixepoch(),
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
