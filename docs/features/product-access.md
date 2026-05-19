# Product Access

Issue #16 owns products, downloads, courses, memberships, services, events,
bundles, subscriptions, access rules, fulfillment, and entitlements. Issue #83
is the first independently shippable slice: a read-only product/access
source-data contract and preview scaffold. Issue #101 adds the first sandbox
entitlement write path from trusted paid checkout webhooks. Issue #139 adds
owner entitlement and fulfillment inspection without exposing buyer rows through
public source-data. Issue #141 adds customer-safe entitlement lookup by checkout
intent evidence.

Live in this slice:

- `/products/source-data`: public-safe JSON with seeded product types, asset IDs,
  access rules, entitlement templates, sandbox grant mappings, revision ID,
  preview route, and write boundary.
- `/products/indie-launch-library`: crawlable semantic preview of the seeded
  product/access catalog.
- `product_entitlements`: server-side D1 rows granted idempotently after trusted
  `checkout.session.completed` paid evidence for seeded checkout line items.
- `product_fulfillment_tasks`: public-safe fulfillment queue evidence; private
  asset delivery is still disabled.
- `/admin/products`: owner-gated inspection for entitlement rows, buyer email,
  checkout state, product and price context, access rules, and queued
  fulfillment evidence.
- `/api/products/entitlements`: customer-safe JSON lookup keyed by a Bumpgrade
  checkout intent ID.
- `/products/entitlements/{checkoutIntentId}`: customer-facing receipt view for
  entitlement status, fulfillment state, and next steps.
- Agent manifest entries for reading product/access state and future MCP
  resources.

Not live in this slice:

- Private R2 object keys or signed download URLs.
- Protected course lessons, videos, transcripts, progress records, member posts,
  signed downloads, or live fulfillment delivery.
- Subscription access changes, refunds, revocations, or customer portal actions.
- Agent write tools for granting, revoking, or delivering product access.

Public redaction boundary:

- `/products/source-data` exposes aggregate entitlement and fulfillment counts,
  the customer lookup contract, and redaction flags.
- Customer entitlement lookup exposes checkout status, product titles, access
  rules, entitlement state, fulfillment summaries, and next steps only.
- Buyer emails, buyer hashes, raw Stripe IDs, webhook event IDs, metadata JSON,
  private R2 object keys, and signed URLs remain server-private.

Future product/access writes must require actor identity, exact confirmation,
idempotency, stale-state checks, audit correlation, redaction, and trusted
checkout or subscription evidence before access or fulfillment changes.
