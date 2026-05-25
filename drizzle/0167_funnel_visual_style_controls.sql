UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, bulk purge policy, and agent-safe writes; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, webinar event/replay links, visual block style controls, archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and owner-session direct agent-safe draft writes including block add/remove and public publishing are now part of this bucket''s shipped evidence.',
  public_evidence_json = json_array(
    'Issue #417 tracks the advanced funnel parity bucket after issue #14 MVP closeout.',
    'Issue #430 moves granular existing-block title/body editing into the owner-session builder while keeping direct agent block edits pending.',
    'Issue #432 moves reusable block add/remove controls into the owner-session builder; issue #417 now exposes those block add/remove semantics through the owner-session agent draft-write contract.',
    'Issue #417 adds owner-confirmed checkout unlinking from private draft blocks while preserving block IDs, kinds, title/body copy, step order, and audit evidence.',
    'Issue #417 adds owner-confirmed resource delivery links from private draft resource/delivery blocks to public-safe product/access catalog assets without private R2 keys, signed URLs, buyer records, arbitrary uploaded asset delivery, or live fulfillment automation.',
    'Issue #417 adds funnel-scoped private download-token delivery from published linked resource blocks after checkout intent, entitlement, product, and file asset scope match.',
    'Issue #417 adds owner-confirmed webinar event/replay links from private draft webinar blocks to public-safe external URLs without provider secrets, attendance tracking, reminder automation, or replay hosting.',
    'Issue #417 adds owner-session visual style presets for existing private draft blocks while preserving block IDs, copy, checkout/resource/webinar metadata, and audit evidence.',
    'Issue #417 adds owner-session within-step block reordering while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, step membership, and audit evidence.',
    'Issue #417 adds owner-session drag/drop block placement in /admin/funnels by replaying the existing block reorder and cross-step move endpoint modes with fresh revisions.',
    'Issue #417 adds owner-session cross-step block moves while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, and audit evidence.',
    'Issue #417 adds owner-session direct agent-safe draft writes through /api/agent/funnels/draft-writes for block copy edits, reusable block add/remove, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, public publishing, and archive/unpublish after exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Issue #14 remains the shipped MVP covering D1 draft funnels, owner-gated edits, private preview, exact-confirmed publishing, duplication, archive/unpublish, templates, source-data, and public semantic routes.',
    'Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.'
  ),
  next_milestone = 'Design full absolute-position canvas editing, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, direct agent visual style writes, direct agent-created delivery tokens, unauthenticated public agent publishing, and direct agent purge as one coherent post-MVP workflow instead of more single-gate readiness slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-advanced-funnel-builder-parity';

UPDATE admin_user_journeys
SET
  user_goal = 'Inspect an ordered opt-in, sales, and thank-you funnel plus reusable templates, webinar/resource page shapes, block records, owner-session draft duplication capability, owner-session checkout-link capability, owner-session resource delivery link capability, public funnel resource delivery token capability, owner-session webinar event link capability, owner-session visual block style capability, owner-session archived-draft purge capability, owner-session block reorder capability, owner-session cross-step block move capability, owner-session direct agent public publishing capability, owner-session archive/unpublish lifecycle capability, and public linked-checkout start capability before full absolute-position canvas editing or direct agent template creation exists.',
  happy_path_json = json_array(
    'Fetch /funnels/source-data.',
    'Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, private draft duplication capability, archive/unpublish capability, archived-draft purge capability, public checkout-start capability, and write boundary.',
    'Inspect reusable funnel templates and block-template records, including webinar/resource templates, owner-session draftCreation, and block write boundaries.',
    'Inspect resource delivery link capability metadata so product/access assets are distinguishable from arbitrary private delivery.',
    'Inspect public funnel resource delivery token metadata so scoped private download-token delivery is distinguishable from arbitrary uploaded asset delivery.',
    'Inspect webinar event link capability metadata so external registration/replay references are distinguishable from scheduling, reminders, attendance tracking, and replay hosting.',
    'Inspect visual block style capability metadata so curated owner-session presentation presets are distinguishable from arbitrary CSS or absolute-position canvas editing.',
    'Inspect block reorder and cross-step move capability metadata so owner-session block positioning and drag/drop placement are distinguishable from full absolute-position canvas editing.',
    'Open /funnels/indie-launch-sandbox to inspect semantic preview sections.',
    'Use the write boundary to avoid claiming live billing, non-archived purge, direct agent purge, direct agent visual style writes, direct agent-created delivery tokens, unauthenticated public agent publishing, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, arbitrary CSS, full absolute-position canvas editing, or broad direct agent-write capability beyond the owner-session draft write API.'
  ),
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
    'Issue #417 records owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private delivery tokens, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge, owner-session visual style controls, owner-session within-step block reordering, owner-session drag/drop block placement, owner-session cross-step block moves, owner-session direct agent public publishing, and the remaining advanced funnel parity follow-up after MVP closeout.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';

UPDATE admin_user_journeys
SET
  user_goal = 'Create, seed, template-start, or duplicate an owner-gated draft funnel, including webinar and resource page shapes, tune the ordered steps, individual block copy, and curated block visual styles, attach the seeded sandbox checkout offer to a checkout block, link resource/delivery blocks to product access assets, link webinar blocks to external registration/replay URLs, preview it privately, publish it to a public route that can start the linked sandbox checkout after exact confirmation, show entitlement-safe resource access, mint a scoped private download token for matching checkout entitlements, and show webinar access references, then archive or unpublish without deleting evidence and purge only already archived drafts after tombstone evidence exists.',
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, block-edit capability metadata, block visual-style capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, and published D1 funnel routes. Owner-session UI may create from templates, duplicate, edit steps, edit existing block copy, apply curated visual style presets, add reusable blocks, remove safe unlinked blocks, reorder or drag/drop existing blocks within a step, move existing blocks across steps, link checkout offers, link resource delivery, link webinar event/replay references, preview, publish, archive, unpublish, and purge archived private draft steps with actor identity, confirmation where required, idempotency, audit correlation, stale-state checks, and redaction. Owner-session agents can use /api/agent/funnels/draft-writes for private block copy edits, reusable block add/remove, checkout linking/unlinking, block reordering, cross-step block moves, resource-delivery linking, webinar-event linking, private duplication, public publishing, and archive/unpublish with the same confirmation, stale-state, audit, and redaction boundary. Published funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published linked resource block; direct agent visual style writes, direct agent purge, and unauthenticated public agent publishing are still planned.',
  validation_json = json_array(
    'Playwright covers the owner-gated /admin/funnels surface, webinar/resource template records, template-to-draft create path, draft duplicate path, granular block-edit path, block visual-style path, block add/remove path, block reorder path, drag/drop block placement UI, cross-step block move path, linked-checkout block removal refusal, checkout-link create path, resource delivery link path, funnel-scoped private delivery token path, webinar event link path, archived-draft purge path, idempotent replay, stale checkout-link/resource-link/webinar-link/purge, block-edit, block-style, block-add, block-move, and cross-step block-move rejection, seed/update/reorder/publish/archive POST paths, stale publish/archive rejection, archived draft read-only behavior, private draft preview, public D1 funnel route rendering, public linked-checkout start rendering, public visual-style rendering, public resource-link and webinar-link rendering, archive removal from /funnels/source-data, /funnels/source-data capability metadata, and agent manifest discovery.',
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
    'Issue #417 records owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private delivery tokens, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge, owner-session visual style controls, owner-session within-step block reordering, owner-session cross-step block moves, owner-session direct agent public publishing, and the remaining advanced funnel parity follow-up after MVP closeout.',
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
  'work-log-2026-05-25-funnel-visual-style-controls',
  'Added owner-session funnel block visual styles',
  'Codex',
  'codex',
  'bumpgrade-funnel-visual-style-controls',
  'The Bumpgrade goal-runner continued issue #417 and chose the next owner-visible funnel parity slice: curated visual style controls that render in private and public funnel routes.',
  '[{"number":417,"url":"https://github.com/markitics/bumpgrade/issues/417"}]',
  '[]',
  '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/features/source-data","https://bumpgrade.com/agent-docs/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/funnels.md","docs/agent/agent-ready.md","public/llms.txt","docs/pr-screenshots/issue-417-funnel-visual-style-controls.png"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|allowlisted owner can sign in and open protected admin surfaces\"","npx playwright test tests/smoke.spec.ts --project=chromium -g \"admin source data exposes|admin user journeys source data exposes|agent docs source data exposes|agent manifest\""]',
  'This gives verified owners curated block-level visual styling without arbitrary CSS, script injection, full absolute-position canvas editing, live billing, live fulfillment automation, direct agent visual style writes, direct agent purge, or unauthenticated public writes.',
  1779699236,
  unixepoch(),
  '["https://github.com/markitics/bumpgrade/issues/417","https://bumpgrade.com/admin/funnels","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/agent-docs/source-data"]',
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
