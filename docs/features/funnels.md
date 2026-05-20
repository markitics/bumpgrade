# Funnels

Issue #14 owns the funnel and page builder MVP. Issue #79 shipped the first
read-only funnel source-data contract and preview scaffold. Issue #91 adds the
first owner-gated D1 draft builder scaffold, issue #93 adds owner-gated step
editing and reordering, issue #95 adds owner-gated private draft preview, and
issue #135 adds exact-confirmed public publishing from D1 draft funnels. Issue
#159 adds the read-only reusable funnel template and block-template library.
Issue #161 adds owner-confirmed private draft creation from those templates.
Issue #163 adds owner-confirmed checkout-offer links on private draft checkout
blocks. Issue #165 renders linked checkout blocks on published funnel routes as
the existing sandbox checkout start surface. Issue #213 adds webinar and
resource funnel template/page-block contracts plus D1 step-kind storage
readiness.

Live in this slice:

- `/funnels/source-data`: public-safe JSON with one seeded draft funnel, ordered
  steps, block IDs, reusable funnel templates, block-template records, revision
  ID, preview route, webinar/resource page-shape metadata, owner-session
  editable draft capability metadata, owner-session checkout-link capability
  metadata, published D1 funnel summaries, and write boundary.
- `/funnels/indie-launch-sandbox`: crawlable semantic preview of the seeded
  opt-in, sales, and thank-you funnel, including reusable template and block
  library cards.
- `/funnels/:slug`: crawlable semantic public route for published D1 draft
  funnels, with unpublished private draft copy excluded from source data. When a
  published checkout block carries owner-confirmed `checkoutLink` metadata, the
  route renders the sandbox checkout start panel for the seeded offer stack.
- `/admin/funnels`: Better Auth owner-gated page that can seed, create, edit,
  reorder, create private drafts from reusable templates, attach the seeded
  sandbox checkout offer to checkout blocks, and publish private D1 draft
  funnels with ordered steps.
- `/admin/funnels/:draftId/preview`: Better Auth owner-gated preview of the
  current private D1 draft sequence.
- `/api/admin/funnels/drafts`: owner-session POST endpoint for seed/create,
  template-to-draft create, step update, step reorder, checkout-link, and
  exact-confirmed publish actions with idempotency, revision checks, and audit
  rows. Reusable webinar/resource templates use the same exact-confirmed
  template-to-draft path.
- D1 tables: `funnel_drafts`, `funnel_draft_steps`, and `funnel_audit_events`.
- Agent manifest entries for reading funnel state, distinguishing owner-session
  draft capability, and future MCP resources/tools.

Not live in this slice:

- Drag-and-drop visual editing or granular block editing.
- Deleting, archiving, unpublishing, or duplicating funnels.
- Live webinar scheduling, attendance tracking, reminder sending, replay
  hosting, or provider integrations.
- Private resource file delivery, R2 object selection, signed URLs, or
  entitlement-gated resource access.
- Checkout-link deletion, arbitrary offer mutation, order-bump mutation,
  live billing, one-click upsell charging, or fulfillment.
- Agent-initiated draft edits or publishing tools.

Current draft creation and step editing require an owner session, D1 storage, an
idempotency key, and an audit event. Creating a private draft from a reusable
template additionally requires exact template confirmation text; webinar and
resource templates create page-shape draft rows only and do not create webinar
provider, replay, private asset, or entitlement state. Linking the seeded
sandbox checkout offer additionally requires exact checkout-link
confirmation text, idempotency, and a current revision ID; it stores public-safe
metadata in private draft step blocks and does not start checkout or enable live
billing by itself. After publishing, a linked checkout block can render the
existing sandbox checkout start panel on the public funnel route; that path
remains exact-confirmed, idempotent, redacted, and constrained to the seeded
offer stack. Current draft preview requires an owner session and does not
publish private copy publicly. Publishing requires an owner session, the exact
publish confirmation text, an idempotency key, and a current revision ID. Future
direct agent writes, unpublishing, checkout-link deletion, live billing, live
webinar integrations, private resource delivery, and destructive draft actions
must add explicit confirmation, stale-state checks, audit correlation,
redaction, and rollback notes before acting on draft state.
