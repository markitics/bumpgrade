# Funnels

Issue #14 owns the funnel and page builder MVP. Issue #79 is the first
independently shippable slice: a read-only funnel source-data contract and
preview scaffold.

Live in this slice:

- `/funnels/source-data`: public-safe JSON with one seeded draft funnel, ordered
  steps, block IDs, revision ID, preview route, and write boundary.
- `/funnels/indie-launch-sandbox`: crawlable semantic preview of the seeded
  opt-in, sales, and thank-you funnel.
- Agent manifest entries for reading funnel state and future MCP resources.

Not live in this slice:

- Authenticated visual builder UI.
- Creating, editing, publishing, deleting, or duplicating funnels.
- Checkout-linking, order bumps, upsells, or fulfillment.
- Agent write tools.

Future funnel writes must require actor identity, confirmation, idempotency,
stale-state checks, audit correlation, redaction, and rollback notes.
