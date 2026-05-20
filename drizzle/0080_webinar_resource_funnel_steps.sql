PRAGMA foreign_keys=off;

CREATE TABLE funnel_draft_steps_next (
  id TEXT PRIMARY KEY,
  funnel_draft_id TEXT NOT NULL REFERENCES funnel_drafts(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('opt_in', 'sales', 'checkout', 'upsell', 'webinar', 'resource', 'thank_you')),
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  route_anchor TEXT NOT NULL,
  blocks_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO funnel_draft_steps_next (
  id, funnel_draft_id, slug, step_order, kind, title, goal, route_anchor, blocks_json, created_at, updated_at
)
SELECT
  id, funnel_draft_id, slug, step_order, kind, title, goal, route_anchor, blocks_json, created_at, updated_at
FROM funnel_draft_steps;

DROP TABLE funnel_draft_steps;

ALTER TABLE funnel_draft_steps_next RENAME TO funnel_draft_steps;

CREATE UNIQUE INDEX IF NOT EXISTS funnel_draft_steps_draft_order_unique
  ON funnel_draft_steps(funnel_draft_id, step_order);

CREATE UNIQUE INDEX IF NOT EXISTS funnel_draft_steps_draft_slug_unique
  ON funnel_draft_steps(funnel_draft_id, slug);

PRAGMA foreign_keys=on;

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Multi-step funnel model, source-data contract, read-only seeded preview scaffold, D1-backed editable draft scaffold with step edit/reorder controls, owner-gated private preview, exact-confirmed public publishing, reusable template and block-template library records including webinar/resource page shapes, owner-confirmed template-to-draft creation, owner-confirmed checkout-offer linking on private draft steps, public sandbox checkout start rendering from published linked checkout blocks, and safe draft proposals.',
  public_evidence_json = '["Issue #14 owns the funnel and page builder MVP.", "Issue #79 adds the first `/funnels/source-data` contract and `/funnels/indie-launch-sandbox` preview scaffold.", "Issue #91 adds owner-gated `/admin/funnels`, `/api/admin/funnels/drafts`, and D1 draft/audit tables.", "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.", "Issue #95 adds owner-gated private draft preview from current D1 draft state.", "Issue #135 adds exact-confirmed public publishing from D1 draft funnels to stable public `/funnels/{slug}` routes.", "Issue #159 adds reusable funnel templates and block-template library records to `/funnels/source-data` and the seeded preview route.", "Issue #161 adds owner-confirmed template-to-draft creation from reusable funnel templates.", "Issue #163 adds owner-confirmed checkout-offer linking to private draft checkout blocks.", "Issue #165 adds public sandbox checkout start rendering on published funnel checkout blocks with owner-confirmed checkout links.", "Issue #213 adds webinar and resource funnel template/block contracts plus D1 step-kind storage readiness."]',
  next_milestone = 'Add deletion/archive, unpublishing, drag-and-drop block editing, live webinar integrations, private resource delivery, live checkout rollout, and direct agent-safe edit tools on top of D1 draft funnels.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-funnels';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[14,79,91,93,95,135,159,161,163,165,213]',
  source_evidence_json = '["https://bumpgrade.com/admin/funnels","https://bumpgrade.com/admin/funnels/funnel-draft-indie-launch-working-copy/preview","https://bumpgrade.com/funnels/indie-launch-working-copy","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/14","https://github.com/markitics/bumpgrade/issues/91","https://github.com/markitics/bumpgrade/issues/93","https://github.com/markitics/bumpgrade/issues/95","https://github.com/markitics/bumpgrade/issues/135","https://github.com/markitics/bumpgrade/issues/159","https://github.com/markitics/bumpgrade/issues/161","https://github.com/markitics/bumpgrade/issues/163","https://github.com/markitics/bumpgrade/issues/165","https://github.com/markitics/bumpgrade/issues/213"]',
  happy_path_json = '["Sign in with an allowlisted owner account.","Open /admin/funnels.","Seed the indie launch working draft, create a generic draft, or create a private draft from a reusable template after typing the exact template confirmation text.","Create webinar registration/replay or resource-library private drafts from the reusable templates when those page shapes fit the offer.","Edit a step title, goal, or kind, then move a step up or down.","Attach the seeded sandbox checkout offer to a draft checkout block after typing the exact checkout-link confirmation text and using the current draft revision.","Open the owner-gated preview route to confirm the private draft sequence reflects current D1 state.","Type the exact publish confirmation text with the current revision and publish the draft.","Open the public /funnels/{slug} route and confirm the published sequence is crawlable and the linked checkout block renders the sandbox checkout start panel.","Use /funnels/source-data to distinguish published D1 funnels from unpublished private drafts."]',
  edge_cases_json = '["The admin draft builder is owner-gated and unpublished draft copy is not crawlable public content.","Template-to-draft creation writes only private D1 draft rows and audit metadata; it does not publish.","Webinar/resource templates are page shapes only; they do not create webinar provider state, reminder sequences, replay hosting, private files, signed URLs, or entitlements.","Checkout-offer linking writes public-safe metadata into private draft step blocks and does not start a checkout session or enable live billing by itself.","The public linked checkout start remains sandbox-only, exact-confirmed, idempotent, and constrained to the seeded offer stack.","Publishing requires exact confirmation and a fresh revision ID.","Checkout-link deletion, unpublishing, drag-and-drop layout editing, live billing, and direct agent writes still require future confirmed-write APIs.","/funnels/source-data lists published D1 funnels but does not expose raw owner session or unpublished private draft data."]',
  agent_access = 'Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, checkout-link capability metadata, public funnel checkout-start capability metadata, and published D1 funnel routes. Owner-session UI may create from templates, edit, link checkout offers, preview, and publish private draft steps with actor identity, confirmation, idempotency, audit correlation, stale-state checks, and redaction; direct agent edit tools are still planned.',
  validation_json = '["Playwright covers the owner-gated /admin/funnels surface, webinar/resource template records, template-to-draft create path, checkout-link create path, idempotent replay, stale checkout-link rejection, seed/update/reorder/publish POST paths, stale publish rejection, private draft preview, public D1 funnel route rendering, public linked-checkout start rendering, /funnels/source-data capability metadata, and agent manifest discovery.","Issue #91 records the first D1-backed draft funnel builder scaffold.","Issue #93 records the first step edit and reorder controls.","Issue #95 records the first owner-gated private draft preview route.","Issue #135 records the first exact-confirmed D1 draft publishing path.","Issue #159 records reusable template and block-template source data.","Issue #161 records owner-confirmed template-to-draft creation.","Issue #163 records owner-confirmed checkout-offer linking on private draft steps.","Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.","Issue #213 records webinar/resource funnel template and D1 step-kind storage readiness."]',
  updated_at = unixepoch()
WHERE id = 'journey-owner-seeds-editable-draft-funnel';
