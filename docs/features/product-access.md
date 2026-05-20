# Product Access

Issue #16 owns products, downloads, courses, memberships, services, events,
bundles, subscriptions, access rules, fulfillment, and entitlements. Issue #83
is the first independently shippable slice: a read-only product/access
source-data contract and preview scaffold. Issue #101 adds the first sandbox
entitlement write path from trusted paid checkout webhooks. Issue #139 adds
owner entitlement and fulfillment inspection without exposing buyer rows through
public source-data. Issue #141 adds customer-safe checkout intent entitlement
lookup. Issue #143 adds one-use download tokens. Issue #146 adds the
first seeded private R2-backed fixture delivery path through Bumpgrade. Issue
#147 adds redemption-time revalidation, issue #151 adds owner-confirmed private
asset upload intent records, and issue #179 adds non-destructive revocation
intent readiness. Issue #181 adds protected content readiness metadata without
protected body delivery.

Live in this slice:

- `/products/source-data`: public-safe JSON with seeded product types, asset IDs,
  access rules, entitlement templates, sandbox grant mappings, revision ID,
  preview route, and write boundary.
- `/products/indie-launch-library`: crawlable semantic preview of the seeded
  product/access catalog.
- `product_entitlements`: server-side D1 rows granted idempotently after trusted
  `checkout.session.completed` paid evidence for seeded checkout line items.
- `product_fulfillment_tasks`: public-safe fulfillment queue evidence; private
  arbitrary asset delivery is still disabled.
- `/admin/products`: owner-gated inspection for entitlement rows, buyer email,
  checkout state, product and price context, access rules, and queued
  fulfillment evidence.
- `/products/entitlements`: customer-safe page for looking up product access
  and fulfillment status from a checkout intent reference.
- `/api/products/entitlements`: matching JSON contract for checkout-intent
  scoped entitlement lookup.
- `/api/products/download-tokens`: creates short-lived download tokens
  for active file entitlements.
- `/api/products/downloads?token={token}`: consumes a token once and streams the
  seeded private R2-backed fixture through Bumpgrade after revalidating current
  entitlement and trusted checkout state.
- `/api/admin/products/assets`: lets verified owners create small private asset
  upload records after exact confirmation, idempotency, and catalog revision
  checks without exposing object keys, signed URLs, or upload bodies.
- `product_entitlement_revocation_intents`: owner-visible D1 readiness records
  for future access removal confirmation, stale-state, and audit checks. These
  records do not remove access or mutate entitlements.
- `product_protected_content_sections`: owner-visible D1 readiness records for
  future course/module and member-area delivery. These records do not include or
  deliver lesson bodies, videos, transcripts, member posts, progress rows,
  private R2 keys, or signed URLs.
- Agent manifest entries for reading product/access state and future MCP
  resources.

Not live in this slice:

- Private R2 object keys or signed download URLs.
- Protected course lesson delivery, videos, transcripts, progress records,
  member posts, customer delivery of arbitrary private R2-backed asset uploads,
  or live fulfillment delivery.
- Subscription access changes, refunds, destructive revocations, or customer
  portal actions.
- Agent write tools for granting, revoking, or delivering product access.

Public redaction boundary:

- `/products/source-data` exposes aggregate entitlement and fulfillment counts
  plus redaction flags and the customer lookup contract.
- `/api/products/entitlements` exposes customer-safe entitlement and fulfillment
  status for a known checkout intent only.
- `/api/products/download-tokens` and `/api/products/downloads?token={token}`
  expose token status and stream a seeded private fixture without private object
  keys or signed object URLs. Redemption revalidates current entitlement status,
  checkout intent linkage, trusted checkout state, and asset scope before the
  private R2 read or token consumption.
- `/products/source-data` exposes aggregate revocation intent counts and
  public-safe policy text. `/admin/products` can inspect the seeded revocation
  readiness record for owner review, but destructive access removal is still
  blocked.
- `/products/source-data` exposes aggregate protected-content readiness counts
  and public-safe access policy text. `/admin/products` can inspect the seeded
  protected content readiness records, but protected body delivery is still
  blocked.
- Buyer emails, buyer hashes, raw Stripe IDs, webhook event IDs, metadata JSON,
  private R2 object keys, signed URLs, lesson bodies, member posts, transcripts,
  and progress rows remain server-private.

Future product/access writes must require actor identity, exact confirmation,
idempotency, stale-state checks, audit correlation, redaction, and trusted
checkout or subscription evidence before access or fulfillment changes.
