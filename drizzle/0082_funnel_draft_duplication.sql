UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Multi-step funnel model, source-data contract, read-only seeded preview scaffold, D1-backed editable draft scaffold with step edit/reorder controls, owner-gated private preview, exact-confirmed public publishing, reusable template and block-template library records including webinar/resource page shapes, owner-confirmed template-to-draft creation, owner-confirmed private draft duplication, owner-confirmed checkout-offer linking on private draft steps, public sandbox checkout start rendering from published linked checkout blocks, and safe draft proposals.',
  public_evidence_json = '["Issue #14 owns the funnel and page builder MVP.", "Issue #79 adds the first `/funnels/source-data` contract and `/funnels/indie-launch-sandbox` preview scaffold.", "Issue #91 adds owner-gated `/admin/funnels`, `/api/admin/funnels/drafts`, and D1 draft/audit tables.", "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.", "Issue #95 adds owner-gated private draft preview from current D1 draft state.", "Issue #135 adds exact-confirmed public publishing from D1 draft funnels to stable public `/funnels/{slug}` routes.", "Issue #159 adds reusable funnel templates and block-template library records to `/funnels/source-data` and the seeded preview route.", "Issue #161 adds owner-confirmed template-to-draft creation from reusable funnel templates.", "Issue #163 adds owner-confirmed checkout-offer linking to private draft checkout blocks.", "Issue #165 adds public sandbox checkout start rendering on published funnel checkout blocks with owner-confirmed checkout links.", "Issue #213 adds webinar and resource funnel template/block contracts plus D1 step-kind storage readiness.", "Issue #215 adds owner-confirmed private draft duplication with checkout-link metadata stripped by default."]',
  next_milestone = 'Add deletion/archive, unpublishing, drag-and-drop block editing, live webinar integrations, private resource delivery, live checkout rollout, and direct agent-safe edit/duplicate tools on top of D1 draft funnels.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[14,79,91,93,95,135,159,161,163,165,213,215]',
  user_goal = 'Create, seed, template-start, or duplicate an owner-gated draft funnel, including webinar and resource page shapes, tune the ordered steps, attach the seeded sandbox checkout offer to a checkout block, preview it privately, then publish it to a public route that can start the linked sandbox checkout after exact confirmation.',
  source_evidence_json = '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/admin/funnels/funnel-draft-indie-launch-working-copy/preview","https://bumpgrade.com/funnels/indie-launch-working-copy","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/91","https://github.com/markitics/bumpgrade/issues/93","https://github.com/markitics/bumpgrade/issues/95","https://github.com/markitics/bumpgrade/issues/135","https://github.com/markitics/bumpgrade/issues/159","https://github.com/markitics/bumpgrade/issues/161","https://github.com/markitics/bumpgrade/issues/163","https://github.com/markitics/bumpgrade/issues/165","https://github.com/markitics/bumpgrade/issues/213","https://github.com/markitics/bumpgrade/issues/215"]',
  happy_path_json = '["Sign in with an allowlisted owner account.","Open /admin/funnels.","Seed the indie launch working draft, create a generic draft, or create a private draft from a reusable template after typing the exact template confirmation text.","Create webinar registration/replay or resource-library private drafts from the reusable templates when those page shapes fit the offer.","Duplicate an existing private draft after typing the exact duplicate confirmation text and using the current draft revision.","Edit a step title, goal, or kind, then move a step up or down.","Attach the seeded sandbox checkout offer to a draft checkout block after typing the exact checkout-link confirmation text and using the current draft revision.","Open the owner-gated preview route to confirm the private draft sequence reflects current D1 state.","Type the exact publish confirmation text with the current revision and publish the draft.","Open the public /funnels/{slug} route and confirm the published sequence is crawlable and the linked checkout block renders the sandbox checkout start panel.","Use /funnels/source-data to distinguish published D1 funnels from unpublished private drafts."]',
  edge_cases_json = '["The admin draft builder is owner-gated and unpublished draft copy is not crawlable public content.","Template-to-draft creation writes only private D1 draft rows and audit metadata; it does not publish.","Draft duplication writes only a new private D1 draft, copies ordered steps and blocks, strips checkout-link metadata, and does not publish.","Webinar/resource templates are page shapes only; they do not create webinar provider state, reminder sequences, replay hosting, private files, signed URLs, or entitlements.","Checkout-offer linking writes public-safe metadata into private draft step blocks and does not start a checkout session or enable live billing by itself.","The public linked checkout start remains sandbox-only, exact-confirmed, idempotent, and constrained to the seeded offer stack.","Publishing requires exact confirmation and a fresh revision ID.","Checkout-link deletion, unpublishing, drag-and-drop layout editing, live billing, direct agent duplication, and direct agent writes still require future confirmed-write APIs.","/funnels/source-data lists published D1 funnels but does not expose raw owner session or unpublished private draft data."]',
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, checkout-link capability metadata, public funnel checkout-start capability metadata, and published D1 funnel routes. Owner-session UI may create from templates, duplicate, edit, link checkout offers, preview, and publish private draft steps with actor identity, confirmation, idempotency, audit correlation, stale-state checks, and redaction; direct agent edit/duplicate tools are still planned.',
  validation_json = '["Playwright covers the owner-gated /admin/funnels surface, webinar/resource template records, template-to-draft create path, draft duplicate path, checkout-link create path, idempotent replay, stale checkout-link rejection, seed/update/reorder/publish POST paths, stale publish rejection, private draft preview, public D1 funnel route rendering, public linked-checkout start rendering, /funnels/source-data capability metadata, and agent manifest discovery.", "Issue #91 records the first D1-backed draft funnel builder scaffold.", "Issue #93 records the first step edit and reorder controls.", "Issue #95 records the first owner-gated private draft preview route.", "Issue #135 records the first exact-confirmed D1 draft publishing path.", "Issue #159 records reusable template and block-template source data.", "Issue #161 records owner-confirmed template-to-draft creation.", "Issue #163 records owner-confirmed checkout-offer linking on private draft steps.", "Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.", "Issue #213 records webinar/resource funnel template and D1 step-kind storage readiness.", "Issue #215 records owner-confirmed private draft duplication."]',
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json, closed_prs_json,
  features_updated_json, roadmap_updated_json, user_journeys_updated_json, documentation_updated_json,
  validation_json, flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-20-funnel-draft-duplication',
  'Added owner-confirmed funnel draft duplication',
  'Codex',
  'codex',
  'bumpgrade-launch-readiness',
  'Continue launch-readiness work toward Bumpgrade funnel/page builder parity after the public marketing feature hub shipped.',
  '[{"number":215,"url":"https://github.com/markitics/bumpgrade/issues/215"}]',
  '[]',
  '["https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/admin/funnels"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/features/funnels.md","docs/pr-screenshots/issue-215-funnel-draft-duplication.png"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run test:browser -- --grep \"agent docs source data|funnel source data|allowlisted owner\" --project=chromium","Local screenshot capture for /admin/funnels duplicate controls"]',
  'Duplicate drafts intentionally stay private and do not copy checkout-link metadata; relink offers separately before publishing.',
  unixepoch(),
  unixepoch(),
  '["https://bumpgrade.com/pr-screenshots/issue-215-funnel-draft-duplication.png"]',
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  github_issues_json = excluded.github_issues_json,
  closed_prs_json = excluded.closed_prs_json,
  features_updated_json = excluded.features_updated_json,
  roadmap_updated_json = excluded.roadmap_updated_json,
  user_journeys_updated_json = excluded.user_journeys_updated_json,
  documentation_updated_json = excluded.documentation_updated_json,
  validation_json = excluded.validation_json,
  flags_attention = excluded.flags_attention,
  completed_at = excluded.completed_at,
  relevant_urls_json = excluded.relevant_urls_json,
  pr_comment_url = excluded.pr_comment_url,
  updated_at = excluded.updated_at;
