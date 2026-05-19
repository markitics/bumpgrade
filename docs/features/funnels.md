# Funnels

Issue #14 owns the funnel and page builder MVP. Issue #79 shipped the first
read-only funnel source-data contract and preview scaffold. Issue #91 adds the
first owner-gated D1 draft builder scaffold, issue #93 adds owner-gated step
editing and reordering, issue #95 adds owner-gated private draft preview, and
issue #135 adds exact-confirmed public publishing from D1 draft funnels. Issue
#159 adds the read-only reusable funnel template and block-template library.

Live in this slice:

- `/funnels/source-data`: public-safe JSON with one seeded draft funnel, ordered
  steps, block IDs, reusable funnel templates, block-template records, revision
  ID, preview route, owner-session editable draft capability metadata, published
  D1 funnel summaries, and write boundary.
- `/funnels/indie-launch-sandbox`: crawlable semantic preview of the seeded
  opt-in, sales, and thank-you funnel, including reusable template and block
  library cards.
- `/funnels/:slug`: crawlable semantic public route for published D1 draft
  funnels, with unpublished private draft copy excluded from source data.
- `/admin/funnels`: Better Auth owner-gated page that can seed, create, edit,
  reorder, and publish private D1 draft funnels with three ordered steps.
- `/admin/funnels/:draftId/preview`: Better Auth owner-gated preview of the
  current private D1 draft sequence.
- `/api/admin/funnels/drafts`: owner-session POST endpoint for seed/create,
  step update, step reorder, and exact-confirmed publish actions with
  idempotency, revision checks, and audit rows.
- D1 tables: `funnel_drafts`, `funnel_draft_steps`, and `funnel_audit_events`.
- Agent manifest entries for reading funnel state, distinguishing owner-session
  draft capability, and future MCP resources/tools.

Not live in this slice:

- Template-to-draft creation from the reusable template library.
- Drag-and-drop visual editing or granular block editing.
- Deleting, archiving, unpublishing, or duplicating funnels.
- Checkout-linking, order bumps, upsells, or fulfillment.
- Agent-initiated draft edits or publishing tools.

Current draft creation and step editing require an owner session, D1 storage, an
idempotency key, and an audit event. Current draft preview requires an owner
session and does not publish private copy publicly. Publishing requires an owner
session, the exact publish confirmation text, an idempotency key, and a current
revision ID. Future direct agent writes, unpublishing, checkout linking, and
destructive draft actions must add explicit confirmation, stale-state checks,
audit correlation, redaction, and rollback notes before acting on draft state.
