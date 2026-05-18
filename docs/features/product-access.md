# Product Access

Issue #16 owns products, downloads, courses, memberships, services, events,
bundles, subscriptions, access rules, fulfillment, and entitlements. Issue #83
is the first independently shippable slice: a read-only product/access
source-data contract and preview scaffold.

Live in this slice:

- `/products/source-data`: public-safe JSON with seeded product types, asset IDs,
  access rules, entitlement templates, revision ID, preview route, and write
  boundary.
- `/products/indie-launch-library`: crawlable semantic preview of the seeded
  product/access catalog.
- Agent manifest entries for reading product/access state and future MCP
  resources.

Not live in this slice:

- Private R2 object keys or signed download URLs.
- Protected course lessons, videos, transcripts, progress records, member posts,
  customer entitlement rows, or fulfillment tasks.
- Subscription access changes, refunds, revocations, or customer portal actions.
- Agent write tools.

Future product/access writes must require actor identity, exact confirmation,
idempotency, stale-state checks, audit correlation, redaction, and trusted
checkout or subscription evidence before access or fulfillment changes.
