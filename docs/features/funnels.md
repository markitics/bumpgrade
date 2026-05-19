# Funnels

Issue #14 owns the funnel and page builder MVP. Issue #79 shipped the first
read-only funnel source-data contract and preview scaffold. Issue #91 adds the
first owner-gated D1 draft builder scaffold.

Live in this slice:

- `/funnels/source-data`: public-safe JSON with one seeded draft funnel, ordered
  steps, block IDs, revision ID, preview route, owner-session editable draft
  capability metadata, and write boundary.
- `/funnels/indie-launch-sandbox`: crawlable semantic preview of the seeded
  opt-in, sales, and thank-you funnel.
- `/admin/funnels`: Better Auth owner-gated page that can seed or create private
  D1 draft funnels with three ordered steps.
- `/api/admin/funnels/drafts`: owner-session POST endpoint for seed/create
  draft actions with idempotency and audit rows.
- D1 tables: `funnel_drafts`, `funnel_draft_steps`, and `funnel_audit_events`.
- Agent manifest entries for reading funnel state, distinguishing owner-session
  draft capability, and future MCP resources/tools.

Not live in this slice:

- Drag-and-drop visual editing or granular block editing.
- Publishing, deleting, archiving, or duplicating funnels.
- Checkout-linking, order bumps, upsells, or fulfillment.
- Agent-initiated draft edits or publishing tools.

Current draft creation requires an owner session, D1 storage, an idempotency key,
and an audit event. Future funnel writes must add explicit confirmation,
stale-state checks, audit correlation, redaction, and rollback notes before
agents or public publishing paths can act on draft state.
