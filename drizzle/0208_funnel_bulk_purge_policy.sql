UPDATE admin_roadmap_items
SET
  summary = 'Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, unauthenticated public agent writes, and stronger resource fulfillment; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, owner-session agent-created resource delivery tokens, webinar event/replay links, visual block style controls, bounded canvas layout controls, archived-draft purge, bulk archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and owner-session direct agent-safe draft writes including block add/remove, canvas layout, public publishing, archived-draft purge, and bulk archived-draft purge are now part of this bucket''s shipped evidence.',
  public_evidence_json = json_array(
    'Issue #417 tracks the advanced funnel parity bucket after issue #14 MVP closeout.',
    'Issue #417 adds owner-confirmed checkout unlinking from private draft blocks while preserving block IDs, kinds, title/body copy, step order, and audit evidence.',
    'Issue #417 adds owner-confirmed resource delivery links from private draft resource/delivery blocks to public-safe product/access catalog assets without private R2 keys, signed URLs, buyer records, arbitrary uploaded asset delivery, or live fulfillment automation.',
    'Issue #417 adds funnel-scoped private download-token delivery from published linked resource blocks after checkout intent, entitlement, product, and file asset scope match.',
    'Issue #417 adds owner-session agent-created resource delivery tokens through /api/agent/funnels/resource-delivery-tokens after exact confirmation, idempotency, current published revision checks, entitlement checks, and audit correlation.',
    'Issue #417 adds owner-confirmed webinar event/replay links from private draft webinar blocks to public-safe external URLs without provider secrets, attendance tracking, reminder automation, or replay hosting.',
    'Issue #417 adds owner-session visual style presets for existing private draft blocks while preserving block IDs, copy, checkout/resource/webinar metadata, and audit evidence.',
    'Issue #417 adds bounded owner-session canvas layout controls for existing private draft blocks while preserving block IDs, copy, checkout/resource/webinar metadata, and audit evidence.',
    'Issue #417 adds owner-session within-step block reordering while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, step membership, and audit evidence.',
    'Issue #417 adds owner-session drag/drop block placement in /admin/funnels by replaying the existing block reorder and cross-step move endpoint modes with fresh revisions.',
    'Issue #417 adds owner-session cross-step block moves while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, and audit evidence.',
    'Issue #417 adds archived-draft purge and bulk archived-draft purge with exact confirmation, idempotency, current archived revision checks, audit correlation, and one funnel_purge_events tombstone per purged draft.',
    'Issue #417 adds owner-session direct agent-safe draft writes through /api/agent/funnels/draft-writes for block copy edits, visual style presets, bounded canvas layouts, reusable block add/remove, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, public publishing, archive/unpublish, archived-draft purge, and bulk archived-draft purge after exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Issue #14 remains the shipped MVP covering D1 draft funnels, owner-gated edits, private preview, exact-confirmed publishing, duplication, archive/unpublish, templates, source-data, and public semantic routes.',
    'Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.'
  ),
  next_milestone = 'Design arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, unauthenticated public agent-created delivery tokens, non-archived purge, and unauthenticated public agent publishing as one coherent post-MVP workflow instead of more single-gate readiness slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-advanced-funnel-builder-parity';

UPDATE admin_roadmap_items
SET
  summary = 'Multi-step funnel model, source-data contract, read-only seeded preview foundation, owner-gated editable draft foundation with step edit/reorder controls, granular block title/body editing, reusable block add/remove controls, owner-session visual style controls, bounded owner-session canvas layout controls, owner-session within-step block reordering, owner-session cross-step block moves, owner-gated private preview, exact-confirmed public publishing, reusable template and block-template library records including webinar/resource page shapes, owner-confirmed template-to-draft creation, owner-confirmed private draft duplication, owner-confirmed checkout-offer linking on private draft steps, public sandbox checkout start rendering from published linked checkout blocks, owner-confirmed archive/unpublish lifecycle actions, owner-confirmed archived-draft purge with tombstone evidence, owner-confirmed bulk archived-draft purge with one tombstone per draft, owner-confirmed resource delivery links to product/access catalog assets, funnel-scoped private download-token delivery from published linked resource blocks, owner-confirmed webinar event/replay links to public-safe external URLs, and safe draft proposals.',
  next_milestone = 'Keep arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, unauthenticated public agent-created delivery tokens, non-archived purge, and unauthenticated public agent publishing in issue #417; keep live publisher-offer billing in issue #219.',
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

UPDATE admin_user_journeys
SET
  user_goal = 'Create, seed, template-start, or duplicate an owner-gated draft funnel, including webinar and resource page shapes, tune the ordered steps, individual block copy, curated block visual styles, and bounded canvas layouts, attach the seeded sandbox checkout offer to a checkout block, link resource/delivery blocks to product access assets, link webinar blocks to external registration/replay URLs, preview it privately, publish it to a public route that can start the linked sandbox checkout after exact confirmation, show entitlement-safe resource access, mint a scoped private download token for matching checkout entitlements, and show webinar access references, then archive or unpublish without deleting evidence, purge one already archived draft after tombstone evidence exists, or bulk-purge selected archived drafts with one tombstone per draft.',
  happy_path_json = json_array(
    'Sign in with an allowlisted owner account.',
    'Open /admin/funnels.',
    'Seed the indie launch working draft, create a generic draft, or create a private draft from a reusable template after typing the exact template confirmation text.',
    'Create webinar registration/replay or resource-library private drafts from the reusable templates when those page shapes fit the offer.',
    'Duplicate an existing private draft after typing the exact duplicate confirmation text and using the current draft revision.',
    'Edit a step title, goal, or kind, then move a step up or down.',
    'Edit an existing block title/body with the current draft revision while preserving the block ID, kind, and any checkout-link metadata.',
    'Apply a curated visual style preset to an existing block with the current draft revision while preserving block identity, copy, and linked metadata.',
    'Set bounded canvas layout values for an existing block with the current draft revision while preserving block identity, copy, and linked metadata.',
    'Drag or use the fallback controls to move an existing block within or across draft steps with the current draft revision while preserving block metadata.',
    'Attach the seeded sandbox checkout offer to a draft checkout block after typing the exact checkout-link confirmation text and using the current draft revision.',
    'Link a resource or delivery block to a product/access catalog asset after typing the exact resource-delivery confirmation text and using the current draft revision.',
    'Link a webinar block to external registration and optional replay URLs after typing the exact webinar-link confirmation text and using the current draft revision.',
    'Open the owner-gated preview route to confirm the private draft sequence reflects current D1 state, visual styles, and bounded canvas layout.',
    'Type the exact publish confirmation text with the current revision and publish the draft.',
    'Open the public /funnels/{slug} route and confirm the published sequence is crawlable, saved canvas layout renders on wide screens, the linked checkout block renders the sandbox checkout start panel, resource-linked blocks show entitlement-safe access references and the private delivery panel, and webinar-linked blocks show external registration/replay references.',
    'Type the exact archive confirmation text with the current revision and archive or unpublish the draft.',
    'Use /funnels/source-data to confirm archived drafts and unpublished public routes are excluded from published D1 funnel summaries.',
    'For one already archived draft that no longer needs owner workspace rows, type the exact purge confirmation text with the current archived revision and confirm a purge tombstone is recorded before draft and step rows disappear from /admin/funnels.',
    'For multiple already archived drafts, select the archived drafts from /admin/funnels, type the exact bulk purge confirmation text, and confirm every selected archived revision is validated before one tombstone per draft is recorded and draft rows disappear.'
  ),
  edge_cases_json = json_array(
    'The admin draft builder is owner-gated and unpublished draft copy is not crawlable public content.',
    'Template-to-draft creation writes only private D1 draft rows and audit metadata; it does not publish.',
    'Draft duplication writes only a new private D1 draft, copies ordered steps and blocks, strips checkout-link, resource-link, and webinar-link metadata, and does not publish.',
    'Granular block editing changes existing block title/body copy only; it preserves block ID, kind, agent-editable flag, ordered step structure, checkout-link metadata, resource-link metadata, and webinar-link metadata.',
    'Visual style updates store only a curated style ID; they preserve block ID, kind, copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence while rendering in private previews and public published routes.',
    'Canvas layout updates store only bounded x, y, width, height, and z-index numbers; they preserve block ID, kind, copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence while rendering in private previews and public published routes with a readable mobile stack.',
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
    'Bulk archived-draft purge validates every selected archived draft and revision before deleting any rows, caps each request at 12 drafts, records one tombstone per draft, replays from tombstone evidence, and refuses non-archived drafts.',
    'Non-archived purge, live billing, unauthenticated public agent-created delivery tokens, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, unauthenticated public agent publishing, and broad direct agent writes beyond the owner-session draft write API still require future confirmed-write APIs.',
    '/funnels/source-data lists published D1 funnels but does not expose raw owner session or unpublished or archived private draft data.'
  ),
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, block-edit capability metadata, block visual-style capability metadata, block canvas-layout capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, bulk archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, and published D1 funnel routes. Owner-session UI may create from templates, duplicate, edit steps, edit existing block copy, apply curated visual style presets, set bounded canvas layout, add reusable blocks, remove safe unlinked blocks, reorder or drag/drop existing blocks within a step, move existing blocks across steps, link checkout offers, link resource delivery, link webinar event/replay references, preview, publish, archive, unpublish, purge archived private draft steps, and bulk-purge selected archived private drafts with actor identity, confirmation where required, idempotency, audit correlation, stale-state checks, and redaction. Owner-session agents can use /api/agent/funnels/draft-writes for private block copy edits, curated visual style presets, bounded canvas layouts, reusable block add/remove, checkout linking/unlinking, block reordering, cross-step block moves, resource-delivery linking, webinar-event linking, private duplication, public publishing, archive/unpublish, archived-draft purge, and bulk archived-draft purge with the same confirmation, stale-state, audit, and redaction boundary. Published funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published linked resource block; direct agent non-archived purge and unauthenticated public agent publishing are still planned.',
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';

UPDATE admin_user_journeys
SET
  user_goal = 'Inspect an ordered opt-in, sales, and thank-you funnel plus reusable templates, webinar/resource page shapes, block records, owner-session draft duplication capability, owner-session checkout-link capability, owner-session resource delivery link capability, public funnel resource delivery token capability, owner-session webinar event link capability, owner-session visual block style capability, owner-session bounded canvas layout capability, owner-session archived-draft purge capability, owner-session bulk archived-draft purge capability, owner-session block reorder capability, owner-session cross-step block move capability, owner-session direct agent public publishing capability, owner-session archive/unpublish lifecycle capability, and public linked-checkout start capability before unauthenticated public agent writes exist.',
  happy_path_json = json_array(
    'Fetch /funnels/source-data.',
    'Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, private draft duplication capability, archive/unpublish capability, archived-draft purge capability, bulk archived-draft purge capability, public checkout-start capability, and write boundary.',
    'Inspect reusable funnel templates and block-template records, including webinar/resource templates, owner-session draftCreation, and block write boundaries.',
    'Inspect resource delivery link capability metadata so product/access assets are distinguishable from arbitrary private delivery.',
    'Inspect public funnel resource delivery token metadata so scoped private download-token delivery is distinguishable from arbitrary uploaded asset delivery.',
    'Inspect owner-session agent resource delivery token metadata so confirmed agent token creation is distinguishable from unauthenticated public agent writes.',
    'Inspect webinar event link capability metadata so external registration/replay references are distinguishable from scheduling, reminders, attendance tracking, and replay hosting.',
    'Inspect visual block style capability metadata so curated owner-session presentation presets are distinguishable from arbitrary CSS.',
    'Inspect bounded canvas layout capability metadata so owner-session block layout values are distinguishable from arbitrary CSS or script injection.',
    'Inspect block reorder and cross-step move capability metadata so owner-session block positioning and drag/drop placement are distinguishable from canvas layout.',
    'Inspect bulk archived-draft purge capability metadata so one-tombstone-per-draft retention cleanup is distinguishable from non-archived purge.',
    'Open /funnels/indie-launch-sandbox to inspect semantic preview sections.',
    'Use the write boundary to avoid claiming live billing, non-archived purge, unauthenticated public agent-created delivery tokens, unauthenticated public agent publishing, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, arbitrary CSS or scripts, or broad direct agent-write capability beyond the owner-session draft write API.'
  ),
  edge_cases_json = json_array(
    'The seeded funnel is read-only and not an authenticated builder UI.',
    'Owner-session template-to-draft creation, private draft duplication, granular block copy editing, curated visual block styling, bounded canvas layout, reusable block add/remove, within-step block reordering, drag/drop block placement through the same move endpoints, cross-step block moves, checkout-offer linking, checkout unlinking, resource delivery linking, webinar event/replay linking, archive/unpublish lifecycle actions, archived-draft purge, and bulk archived-draft purge are available from /admin/funnels, and published linked checkout blocks can render the existing sandbox checkout start surface. Owner-session agents can also call /api/agent/funnels/draft-writes for private block copy edits, curated visual style presets, bounded canvas layouts, reusable block add/remove, checkout-offer linking, checkout unlinking, resource-delivery linking, webinar-event linking, block reordering, cross-step block moves, private draft duplication, public publishing, archive/unpublish, archived-draft purge, and bulk archived-draft purge after exact confirmation, idempotency, current revision checks, and audit correlation. Published linked resource blocks can mint scoped Bumpgrade download routes only when checkout intent and entitlement scope match the linked product and file asset, and owner-session agents can create the same scoped token through /api/agent/funnels/resource-delivery-tokens after exact confirmation, idempotency, current published revision checks, entitlement checks, and audit correlation; replays do not return raw tokens. Block copy edits, style updates, and canvas layout updates preserve IDs, kinds, checkout-link metadata, resource-link metadata, and webinar-link metadata. Direct agent block style writes store only curated style IDs; direct agent canvas layout writes store only bounded numbers; neither accepts arbitrary CSS or scripts. Direct agent block add/remove uses the reusable block library, refuses checkout-linked removals, and keeps at least one block per step. Direct agent checkout, resource-delivery, webinar-event, block-style, canvas-layout, and block-placement writes preserve existing block identity and do not create new public routes; direct agent publishing is the only owner-session agent funnel operation in this set that creates a public route binding, and it does not mutate billing. Direct agent archived-draft purge records tombstone evidence before deleting already archived draft and step rows, without deleting prior audit rows, product assets, R2 objects, buyer records, or billing state. Bulk archived-draft purge validates every selected archived revision before deleting rows and records one tombstone per draft. Block reordering preserves step membership and checkout/resource/webinar metadata. Cross-step block moves preserve block metadata while changing step membership and refuse to empty the source step. Block removal refuses checkout-linked blocks until the dedicated unlink action clears checkout metadata. Duplicates stay private and strip checkout-link/resource-link/webinar-link metadata. Webinar/resource templates do not schedule webinars, track attendance, host replays, deliver arbitrary uploaded private files, create signed URLs, automate fulfillment, or grant entitlements. Non-archived purge, live billing, unauthenticated public agent-created delivery tokens, unauthenticated public agent publishing, and broader direct agent edits require future confirmed-write APIs.',
    'Generated copy remains draft until a publisher confirms it.'
  ),
  agent_access = 'Agents can read /funnels/source-data, reusable template and block-template records, webinar/resource page-shape records, draft duplication capability metadata, granular block-edit capability metadata, visual block style capability metadata, bounded canvas layout capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public and owner-session agent funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, bulk archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, the seeded preview route, and published D1 funnel routes. Owner-session template-to-draft creation, private draft duplication, block copy editing, curated visual block styling, bounded canvas layout, reusable block add/remove, within-step block reordering, cross-step block moves, checkout-offer linking, resource delivery linking, webinar event/replay linking, public publishing, archive/unpublish actions, archived-draft purge, bulk archived-draft purge, and owner-session agent-created resource tokens require owner auth, idempotency, and stale-state checks; public funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published resource block; direct agent writes including archived-draft purge and bulk archived-draft purge require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json,
  closed_prs_json, features_updated_json, roadmap_updated_json, user_journeys_updated_json,
  documentation_updated_json, validation_json, flags_attention, first_prompt_at, completed_at,
  relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-26-funnel-bulk-purge-policy',
  'Added funnel bulk archived-draft purge',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'The active goal calls for broad ClickFunnels-level funnel parity, owner-visible workflows, and agent-ready contracts while avoiding tiny internal-only ships.',
  json_array(json_object('number', 417, 'url', 'https://github.com/markitics/bumpgrade/issues/417')),
  json_array(),
  json_array('https://bumpgrade.com/admin/funnels', 'https://bumpgrade.com/funnels/source-data', 'https://bumpgrade.com/agent-docs/source-data'),
  json_array('roadmap-advanced-funnel-builder-parity', 'roadmap-funnels'),
  json_array('journey-owner-seeds-editable-draft-funnel', 'journey-publisher-previews-seeded-funnel'),
  json_array('docs/features/funnels.md', 'docs/agent/agent-ready.md', 'public/llms.txt'),
  json_array('Typecheck', 'Focused funnel source-data and owner-session draft-write smoke coverage', 'Admin and agent bulk purge tombstone replay checks', 'Cloudflare build'),
  'Bulk purge is limited to already archived drafts, validates every selected archived revision before deleting rows, and records one tombstone per draft. It does not delete audit rows, product assets, R2 objects, buyer records, billing state, or non-archived drafts.',
  unixepoch() - 1800,
  unixepoch(),
  json_array('https://bumpgrade.com/admin/funnels', 'https://bumpgrade.com/funnels/source-data', 'https://bumpgrade.com/agent-docs/source-data', 'https://bumpgrade.com/pr-screenshots/issue-417-bulk-purge-policy.png', 'https://bumpgrade.com/admin/work-log'),
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  pr_comment_url=COALESCE(admin_work_log_entries.pr_comment_url, excluded.pr_comment_url),
  updated_at=unixepoch();
