UPDATE admin_roadmap_items
SET
  summary = 'Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, bulk purge policy, and agent-safe writes; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, owner-session agent-created resource delivery tokens, webinar event/replay links, visual block style controls, bounded canvas layout controls, archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and owner-session direct agent-safe draft writes including block add/remove, canvas layout, public publishing, and archived-draft purge are now part of this bucket''s shipped evidence.',
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
    'Issue #417 adds owner-session direct agent-safe draft writes through /api/agent/funnels/draft-writes for block copy edits, visual style presets, bounded canvas layouts, reusable block add/remove, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, public publishing, archive/unpublish, and archived-draft purge after exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Issue #14 remains the shipped MVP covering D1 draft funnels, owner-gated edits, private preview, exact-confirmed publishing, duplication, archive/unpublish, templates, source-data, and public semantic routes.',
    'Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.'
  ),
  next_milestone = 'Design arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, unauthenticated public agent-created delivery tokens, and unauthenticated public agent publishing as one coherent post-MVP workflow instead of more single-gate readiness slices.',
  updated_at = unixepoch()
WHERE id = 'roadmap-advanced-funnel-builder-parity';

UPDATE admin_roadmap_items
SET
  summary = 'Multi-step funnel model, source-data contract, read-only seeded preview foundation, owner-gated editable draft foundation with step edit/reorder controls, granular block title/body editing, reusable block add/remove controls, owner-session visual style controls, bounded owner-session canvas layout controls, owner-session within-step block reordering, owner-session cross-step block moves, owner-gated private preview, exact-confirmed public publishing, reusable template and block-template library records including webinar/resource page shapes, owner-confirmed template-to-draft creation, owner-confirmed private draft duplication, owner-confirmed checkout-offer linking on private draft steps, public sandbox checkout start rendering from published linked checkout blocks, owner-confirmed archive/unpublish lifecycle actions, owner-confirmed archived-draft purge with tombstone evidence, owner-confirmed resource delivery links to product/access catalog assets, funnel-scoped private download-token delivery from published linked resource blocks, owner-confirmed webinar event/replay links to public-safe external URLs, and safe draft proposals.',
  next_milestone = 'Keep arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, unauthenticated public agent-created delivery tokens, and unauthenticated public agent publishing in issue #417; keep live publisher-offer billing in issue #219.',
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

UPDATE admin_user_journeys
SET
  user_goal = 'Create, seed, template-start, or duplicate an owner-gated draft funnel, including webinar and resource page shapes, tune the ordered steps, individual block copy, curated block visual styles, and bounded canvas layouts, attach the seeded sandbox checkout offer to a checkout block, link resource/delivery blocks to product access assets, link webinar blocks to external registration/replay URLs, preview it privately, publish it to a public route that can start the linked sandbox checkout after exact confirmation, show entitlement-safe resource access, mint a scoped private download token for matching checkout entitlements, and show webinar access references, then archive or unpublish without deleting evidence and purge only already archived drafts after tombstone evidence exists.',
  happy_path_json = json_array(
    'Sign in with an allowlisted owner account.',
    'Open /admin/funnels.',
    'Seed the indie launch working draft, create a generic draft, or create a private draft from a reusable template after typing the exact template confirmation text.',
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
    'For an already archived draft that no longer needs owner workspace rows, type the exact purge confirmation text with the current archived revision and confirm a purge tombstone is recorded before draft and step rows disappear from /admin/funnels.'
  ),
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, block-edit capability metadata, block visual-style capability metadata, block canvas-layout capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, and published D1 funnel routes. Owner-session UI may create from templates, duplicate, edit steps, edit existing block copy, apply curated visual style presets, set bounded canvas layout, add reusable blocks, remove safe unlinked blocks, reorder or drag/drop existing blocks within a step, move existing blocks across steps, link checkout offers, link resource delivery, link webinar event/replay references, preview, publish, archive, unpublish, and purge archived private draft steps with actor identity, confirmation where required, idempotency, audit correlation, stale-state checks, and redaction. Owner-session agents can use /api/agent/funnels/draft-writes for private block copy edits, curated visual style presets, bounded canvas layouts, reusable block add/remove, checkout linking/unlinking, block reordering, cross-step block moves, resource-delivery linking, webinar-event linking, private duplication, public publishing, archive/unpublish, and archived-draft purge with the same confirmation, stale-state, audit, and redaction boundary. Published funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published linked resource block; direct agent non-archived purge and unauthenticated public agent publishing are still planned.',
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';

UPDATE admin_user_journeys
SET
  user_goal = 'Inspect an ordered opt-in, sales, and thank-you funnel plus reusable templates, webinar/resource page shapes, block records, owner-session draft duplication capability, owner-session checkout-link capability, owner-session resource delivery link capability, public funnel resource delivery token capability, owner-session webinar event link capability, owner-session visual block style capability, owner-session bounded canvas layout capability, owner-session archived-draft purge capability, owner-session block reorder capability, owner-session cross-step block move capability, owner-session direct agent public publishing capability, owner-session archive/unpublish lifecycle capability, and public linked-checkout start capability before direct agent template creation exists.',
  happy_path_json = json_array(
    'Fetch /funnels/source-data.',
    'Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, private draft duplication capability, archive/unpublish capability, archived-draft purge capability, public checkout-start capability, and write boundary.',
    'Inspect reusable funnel templates and block-template records, including webinar/resource templates, owner-session draftCreation, and block write boundaries.',
    'Inspect visual block style capability metadata so curated owner-session presentation presets are distinguishable from arbitrary CSS.',
    'Inspect bounded canvas layout capability metadata so owner-session block layout values are distinguishable from arbitrary CSS or script injection.',
    'Inspect block reorder and cross-step move capability metadata so owner-session block positioning and drag/drop placement are distinguishable from canvas layout.',
    'Open /funnels/indie-launch-sandbox to inspect semantic preview sections.',
    'Use the write boundary to avoid claiming live billing, non-archived purge, bulk purge, unauthenticated public agent-created delivery tokens, unauthenticated public agent publishing, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, arbitrary CSS or scripts, or broad direct agent-write capability beyond the owner-session draft write API.'
  ),
  agent_access = 'Agents can read /funnels/source-data, reusable template and block-template records, webinar/resource page-shape records, draft duplication capability metadata, granular block-edit capability metadata, visual block style capability metadata, bounded canvas layout capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public and owner-session agent funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, the seeded preview route, and published D1 funnel routes. Owner-session template-to-draft creation, private draft duplication, block copy editing, curated visual block styling, bounded canvas layout, reusable block add/remove, within-step block reordering, cross-step block moves, checkout-offer linking, resource delivery linking, webinar event/replay linking, public publishing, archive/unpublish actions, archived-draft purge, and owner-session agent-created resource tokens require owner auth, idempotency, and stale-state checks; public funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published resource block; direct agent writes including archived-draft purge require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json,
  closed_prs_json, features_updated_json, roadmap_updated_json, user_journeys_updated_json,
  documentation_updated_json, validation_json, flags_attention, first_prompt_at, completed_at,
  relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-26-funnel-canvas-layout-controls',
  'Added bounded funnel canvas layout controls',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'The active goal calls for ClickFunnels-level web parity, owner-visible workflows, and agent-ready contracts while avoiding tiny internal-only ships.',
  json_array(json_object('number', 417, 'url', 'https://github.com/markitics/bumpgrade/issues/417')),
  json_array(),
  json_array('https://bumpgrade.com/admin/funnels', 'https://bumpgrade.com/funnels/source-data', 'https://bumpgrade.com/funnels/indie-launch-working-copy'),
  json_array('roadmap-advanced-funnel-builder-parity', 'roadmap-funnels'),
  json_array('journey-owner-seeds-editable-draft-funnel', 'journey-publisher-previews-seeded-funnel'),
  json_array('docs/features/funnels.md', 'docs/agent/agent-ready.md', 'docs/agent/admin-surfaces.md', 'public/llms.txt'),
  json_array('Typecheck', 'Focused funnel source-data and owner-session draft-write smoke coverage', 'Private preview and public published route canvas rendering checks', 'Cloudflare build'),
  'Canvas layout stores bounded x, y, width, height, and z-index numbers only. It does not enable arbitrary CSS/scripts, billing, fulfillment, unauthenticated public writes, or live webinar/provider actions.',
  unixepoch() - 5400,
  unixepoch(),
  json_array('https://bumpgrade.com/admin/funnels', 'https://bumpgrade.com/funnels/source-data', 'https://bumpgrade.com/pr-screenshots/issue-417-funnel-canvas-layout-controls.png', 'https://bumpgrade.com/admin/work-log'),
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
