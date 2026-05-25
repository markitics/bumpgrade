UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, bulk purge policy, and agent-safe writes; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, webinar event/replay links, visual block style controls, archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and owner-session direct agent-safe draft writes including visual style presets, reusable block add/remove, public publishing, and archive/unpublish are now part of this bucket''s shipped evidence.',
  public_evidence_json = json_array(
    'Issue #417 tracks the advanced funnel parity bucket after issue #14 MVP closeout.',
    'Issue #430 moves granular existing-block title/body editing into the owner-session builder while preserving block metadata.',
    'Issue #432 moves reusable block add/remove controls into the owner-session builder; issue #417 now exposes those block add/remove semantics through the owner-session agent draft-write contract.',
    'Issue #417 adds owner-confirmed checkout unlinking from private draft blocks while preserving block IDs, kinds, title/body copy, step order, and audit evidence.',
    'Issue #417 adds owner-confirmed resource delivery links from private draft resource/delivery blocks to public-safe product/access catalog assets without private R2 keys, signed URLs, buyer records, arbitrary uploaded asset delivery, or live fulfillment automation.',
    'Issue #417 adds funnel-scoped private download-token delivery from published linked resource blocks after checkout intent, entitlement, product, and file asset scope match.',
    'Issue #417 adds owner-confirmed webinar event/replay links from private draft webinar blocks to public-safe external URLs without provider secrets, attendance tracking, reminder automation, or replay hosting.',
    'Issue #417 adds owner-session visual style presets for existing private draft blocks while preserving block IDs, copy, checkout/resource/webinar metadata, and audit evidence.',
    'Issue #417 adds owner-session direct agent-safe visual style writes through /api/agent/funnels/draft-writes using curated style IDs only, exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Issue #417 adds owner-session within-step block reordering while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, step membership, and audit evidence.',
    'Issue #417 adds owner-session drag/drop block placement in /admin/funnels by replaying the existing block reorder and cross-step move endpoint modes with fresh revisions.',
    'Issue #417 adds owner-session cross-step block moves while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, and audit evidence.',
    'Issue #417 adds owner-session direct agent-safe draft writes through /api/agent/funnels/draft-writes for block copy edits, visual style presets, reusable block add/remove, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, public publishing, and archive/unpublish after exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Issue #417 keeps arbitrary CSS, full absolute-position canvas editing, direct agent purge, direct agent-created delivery tokens, unauthenticated public agent publishing, live billing, and live fulfillment automation out of this owner-session style-write slice.',
    'Issue #14 remains the shipped MVP covering D1 draft funnels, owner-gated edits, private preview, exact-confirmed publishing, duplication, archive/unpublish, templates, source-data, and public semantic routes.',
    'Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.'
  ),
  next_milestone = 'Design full absolute-position canvas editing, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, direct agent-created delivery tokens, unauthenticated public agent publishing, and direct agent purge as one coherent post-MVP workflow instead of more single-gate readiness slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-advanced-funnel-builder-parity';

UPDATE admin_user_journeys
SET
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
    'Use the write boundary to avoid claiming live billing, non-archived purge, direct agent purge, direct agent-created delivery tokens, unauthenticated public agent publishing, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, arbitrary CSS, full absolute-position canvas editing, or broad direct agent-write capability beyond the owner-session draft write API.'
  ),
  edge_cases_json = json_array(
    'The seeded funnel is read-only and not an authenticated builder UI.',
    'Owner-session template-to-draft creation, private draft duplication, granular block copy editing, curated visual block styling, reusable block add/remove, within-step block reordering, drag/drop block placement through the same move endpoints, cross-step block moves, checkout-offer linking, checkout unlinking, resource delivery linking, webinar event/replay linking, archive/unpublish lifecycle actions, and archived-draft purge are available from /admin/funnels, and published linked checkout blocks can render the existing sandbox checkout start surface. Owner-session agents can also call /api/agent/funnels/draft-writes for private block copy edits, curated visual style presets, reusable block add/remove, checkout-offer linking, checkout unlinking, resource-delivery linking, webinar-event linking, block reordering, cross-step block moves, private draft duplication, public publishing, and archive/unpublish after exact confirmation, idempotency, current revision checks, and audit correlation. Published linked resource blocks can mint scoped Bumpgrade download routes only when checkout intent and entitlement scope match the linked product and file asset. Block copy edits and style updates preserve IDs, kinds, checkout-link metadata, resource-link metadata, and webinar-link metadata. Direct agent block style writes store only curated style IDs and never accept arbitrary CSS. Direct agent block add/remove uses the reusable block library, refuses checkout-linked removals, and keeps at least one block per step. Direct agent checkout, resource-delivery, webinar-event, block-style, and block-placement writes preserve existing block identity and do not create new public routes; direct agent publishing is the only owner-session agent funnel operation in this set that creates a public route binding, and it does not mutate billing. Block reordering preserves step membership and checkout/resource/webinar metadata. Cross-step block moves preserve block metadata while changing step membership and refuse to empty the source step. Block removal refuses checkout-linked blocks until the dedicated unlink action clears checkout metadata. Duplicates stay private and strip checkout-link/resource-link/webinar-link metadata. Archived-draft purge records tombstone evidence before deleting draft and step rows, without deleting prior audit rows, product assets, R2 objects, buyer records, or billing state. Webinar/resource templates do not schedule webinars, track attendance, host replays, deliver arbitrary uploaded private files, create signed URLs, automate fulfillment, or grant entitlements. Non-archived purge, bulk purge, live billing, full absolute-position canvas editing, direct agent purge, direct agent-created delivery tokens, unauthenticated public agent publishing, and broader direct agent edits require future confirmed-write APIs.',
    'Generated copy remains draft until a publisher confirms it.'
  ),
  agent_access = 'Agents can read /funnels/source-data, reusable template and block-template records, webinar/resource page-shape records, draft duplication capability metadata, granular block-edit capability metadata, visual block style capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, the seeded preview route, and published D1 funnel routes. Owner-session template-to-draft creation, private draft duplication, block copy editing, curated visual block styling, reusable block add/remove, within-step block reordering, cross-step block moves, checkout-offer linking, resource delivery linking, webinar event/replay linking, public publishing, archive/unpublish actions, and archived-draft purge require owner auth, idempotency, and stale-state checks; public funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published resource block; direct agent writes require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.',
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
    'Issue #417 records owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private delivery tokens, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge, owner-session visual style controls, owner-session within-step block reordering, owner-session drag/drop block placement, owner-session cross-step block moves, owner-session direct agent visual style writes, owner-session direct agent public publishing, and the remaining advanced funnel parity follow-up after MVP closeout.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';

UPDATE admin_user_journeys
SET
  edge_cases_json = json_array(
    'The admin draft builder is owner-gated and unpublished draft copy is not crawlable public content.',
    'Template-to-draft creation writes only private D1 draft rows and audit metadata; it does not publish.',
    'Draft duplication writes only a new private D1 draft, copies ordered steps and blocks, strips checkout-link, resource-link, and webinar-link metadata, and does not publish.',
    'Granular block editing changes existing block title/body copy only; it preserves block ID, kind, agent-editable flag, ordered step structure, checkout-link metadata, resource-link metadata, and webinar-link metadata.',
    'Visual style updates store only a curated style ID; they preserve block ID, kind, copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence while rendering in private previews and public published routes.',
    'Within-step block reordering changes block order only; it preserves block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, step membership, and audit evidence.',
    'The drag/drop UI reuses the same owner-session block reorder and cross-step move endpoint modes with fresh revision checks; it is not a separate direct-agent write surface.',
    'Cross-step block moves append an existing block to another step, refuse to empty the source step, and preserve block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence.',
    'Webinar event links store public-safe external URLs only; they do not create webinar provider state, reminder sequences, attendance tracking, replay hosting, provider secrets, private files, signed URLs, live fulfillment automation, or entitlements.',
    'Webinar/resource templates are page shapes only; they do not create webinar provider state, reminder sequences, replay hosting, private files, signed URLs, live fulfillment automation, or entitlements.',
    'Checkout-offer linking writes public-safe metadata into private draft step blocks and does not start a checkout session or enable live billing by itself.',
    'Resource delivery linking writes public-safe product, asset, entitlement-template, and safe route metadata into private draft step blocks. It does not expose private R2 keys, signed URLs, buyer records, raw checkout IDs, arbitrary uploaded asset delivery, live fulfillment automation, or direct agent writes.',
    'Published funnel resource delivery token creation requires a published linked resource block plus a matching checkout intent, entitlement, product, and file asset; mismatched entitlements are rejected and replayed download tokens are rejected by the existing product download stream.',
    'The public linked checkout start remains sandbox-only, exact-confirmed, idempotent, and constrained to the seeded offer stack.',
    'Publishing and archive/unpublish actions require exact confirmation and a fresh revision ID.',
    'Archiving changes status to archived, clears preview_route, and preserves draft, step, block, checkout-link, resource-link, webinar-link, and audit records; it does not physically delete data.',
    'Purging requires an archived draft, exact confirmation, a fresh archived revision ID, and an idempotency key; it records a purge tombstone before deleting draft and step rows and does not delete prior audit rows, product assets, R2 objects, buyer records, or billing state.',
    'Non-archived purge, bulk purge, full absolute-position canvas editing, live billing, direct agent purge, direct agent-created delivery tokens, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, unauthenticated public agent publishing, and broad direct agent writes beyond private block copy edits, visual style presets, reusable block add/remove, checkout linking/unlinking, block movement, resource-delivery linking, webinar-event linking, private duplication, public publishing, and archive/unpublish still require future confirmed-write APIs.',
    '/funnels/source-data lists published D1 funnels but does not expose raw owner session or unpublished or archived private draft data.'
  ),
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, block-edit capability metadata, block visual-style capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, and published D1 funnel routes. Owner-session UI may create from templates, duplicate, edit steps, edit existing block copy, apply curated visual style presets, add reusable blocks, remove safe unlinked blocks, reorder or drag/drop existing blocks within a step, move existing blocks across steps, link checkout offers, link resource delivery, link webinar event/replay references, preview, publish, archive, unpublish, and purge archived private draft steps with actor identity, confirmation where required, idempotency, audit correlation, stale-state checks, and redaction. Owner-session agents can use /api/agent/funnels/draft-writes for private block copy edits, curated visual style presets, reusable block add/remove, checkout linking/unlinking, block reordering, cross-step block moves, resource-delivery linking, webinar-event linking, private duplication, public publishing, and archive/unpublish with the same confirmation, stale-state, audit, and redaction boundary. Published funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published linked resource block; direct agent purge and unauthenticated public agent publishing are still planned.',
  validation_json = json_array(
    'Playwright covers the owner-gated /admin/funnels surface, webinar/resource template records, template-to-draft create path, draft duplicate path, granular block-edit path, block visual-style path, block add/remove path, block reorder path, drag/drop block placement UI, cross-step block move path, linked-checkout block removal refusal, checkout-link create path, resource delivery link path, funnel-scoped private delivery token path, webinar event link path, archived-draft purge path, idempotent replay, stale checkout-link/resource-link/webinar-link/purge, block-edit, block-style, block-add, block-move, and cross-step block-move rejection, seed/update/reorder/publish/archive POST paths, stale publish/archive rejection, archived draft read-only behavior, private draft preview, public D1 funnel route rendering, public linked-checkout start rendering, public visual-style rendering, public resource-link and webinar-link rendering, archive removal from /funnels/source-data, /funnels/source-data capability metadata, direct agent style-write coverage, and agent manifest discovery.',
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
    'Issue #417 records owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private delivery tokens, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge, owner-session visual style controls, owner-session within-step block reordering, owner-session cross-step block moves, owner-session direct agent public publishing, owner-session direct agent visual style writes, and the remaining advanced funnel parity follow-up after MVP closeout.',
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
  'work-log-2026-05-25-agent-funnel-visual-style-writes',
  'Added owner-session agent funnel visual style writes',
  'Codex',
  'codex',
  'bumpgrade-agent-funnel-visual-style-writes',
  'The Bumpgrade goal-runner continued issue #417 after deploying owner UI visual styles and promoted the same curated style preset write into the owner-session agent draft-write contract while fixing a signed-out JSON auth regression found during production smoke.',
  '[{"number":417,"url":"https://github.com/markitics/bumpgrade/issues/417"}]',
  '[]',
  '["https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/features/source-data","https://bumpgrade.com/agent-docs/source-data","https://bumpgrade.com/api/agent/funnels/draft-writes"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/funnels.md","docs/agent/agent-ready.md","public/llms.txt","src/lib/agent-manifest.ts"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel draft endpoint rejects unauthenticated JSON writes before validation|funnel draft archive endpoint rejects unauthenticated writes|agent funnel draft write endpoint records owner-session private edits|agent funnel draft write endpoint requires owner session\"","npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|agent docs source data exposes|agent manifest|admin source data exposes|admin user journeys source data exposes\"","git diff --check"]',
  'This moves direct agent visual style writes from planned to live for owner-session agents only. The write stores only curated style IDs, preserves block metadata, requires exact confirmation/idempotency/current revision/audit correlation, and still excludes arbitrary CSS, public unauthenticated writes, purge, delivery-token creation, billing, and fulfillment automation.',
  1779701036,
  1779702840,
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
