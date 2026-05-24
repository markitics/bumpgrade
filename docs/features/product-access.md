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
intent readiness. Issue #181 adds protected content readiness metadata, and
issue #185 adds checkout-intent-scoped protected fixture delivery. Issue #187
adds subscription-backed membership entitlement state from trusted Stripe
Billing webhooks. Issue #251 adds owner-confirmed, non-destructive revocation
intent records with exact confirmation, idempotency, and stale-state checks.
Issue #403 adds owner-confirmed draft product creation records with exact
confirmation, idempotency, duplicate-slug checks, and public-safe aggregate
source data. Issue #405 links owner-created products to test offer/funnel IDs
and creates synthetic paid checkout/access grant evidence without live Stripe
checkout, live charges, published offer copy, or public buyer exposure. Issue
#407 adds owner-confirmed buyer-facing test checkout links and public test
checkout completion for owner-created products with link-revision checks.

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
- `/api/products/protected-content`: returns seeded protected course/member
  fixture bodies only when the request includes a known checkout intent, a
  matching active entitlement, and a protected content section id, and the
  checkout is still paid or completed.
- `/api/admin/products/catalog`: lets verified owners create draft product
  records after exact confirmation and idempotency without creating Stripe
  products or prices, creating customer access, exposing owner identity, or
  enabling direct unauthenticated agent writes.
- `/api/admin/products/offer-access-grants`: lets verified owners link an
  owner-created product to test offer/funnel IDs and create a synthetic paid
  checkout intent, product entitlement, fulfillment task evidence, and audit
  event after exact confirmation and idempotency. It does not create Stripe
  products, Stripe prices, Checkout Sessions, live charges, published offer
  copy, customer-facing fulfillment delivery, raw buyer exposure, or direct
  unauthenticated agent writes.
- `/api/admin/products/test-checkout-links`: lets verified owners create a
  stable buyer-facing test checkout link for an owner-created product after
  exact confirmation, idempotency, and a current product `updatedAt` check.
- `/products/test-checkout/{linkId}` and `/api/products/test-checkout`: let a
  public test buyer complete that checkout after exact confirmation,
  idempotency, and a current link revision check, creating a synthetic paid
  checkout intent, entitlement row, fulfillment task evidence, and audit event
  without Stripe Checkout Sessions or live charges.
- `billing_subscriptions` plus `product_entitlements`: trusted
  `customer.subscription.created`, `customer.subscription.updated`, and
  `customer.subscription.deleted` webhooks mirror Stripe Billing state and sync
  checkout-linked membership access while the subscription is active or
  trialing.
- `/api/admin/products/assets`: lets verified owners create small private asset
  upload records after exact confirmation, idempotency, and catalog revision
  checks without exposing object keys, signed URLs, or upload bodies.
- `product_entitlement_revocation_intents`: owner-visible D1 readiness and
  confirmed intent records for future access removal confirmation, stale-state,
  and audit checks. These records do not remove access or mutate entitlements.
- `/api/admin/products/revocation-intents`: lets verified owners record a
  non-destructive access-removal intent after exact confirmation, idempotency,
  and a current entitlement status check.
- `product_protected_content_sections`: owner-visible D1 readiness records for
  course/module and member-area delivery. Public source-data records do not
  include lesson bodies, videos, transcripts, member posts, progress rows,
  private R2 keys, or signed URLs.
- Agent manifest entries for reading product/access state and future MCP
  resources.

Not live in this slice:

- Private R2 object keys or signed download URLs.
- Real protected course lessons, videos, transcripts, progress records, member
  posts, customer delivery of arbitrary private R2-backed asset uploads, or live
  fulfillment delivery.
- Stripe product/price creation, live offer/funnel publishing, and live
  purchase-to-created-product fulfillment for owner-created draft products.
  Issues #405 and #407 record only direct test grant evidence, buyer-facing
  test checkout links, and synthetic paid test access-grant evidence.
- Subscription access changes, refunds, destructive revocations, or customer
  portal actions. The issue #187 fixture can activate or pause one seeded
  checkout-linked membership entitlement from trusted subscription state, but it
  does not expose self-service subscription management or live fulfillment.
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
  public-safe policy text. `/admin/products` can inspect seeded readiness and
  owner-confirmed intent records, but destructive access removal is still
  blocked.
- `/products/source-data` exposes aggregate protected-content readiness counts
  and public-safe access policy text. `/admin/products` can inspect the seeded
  protected content readiness records. `/api/products/protected-content` can
  return seeded fixture bodies only after active entitlement, product/template
  scope, and trusted checkout-state checks.
- `/products/source-data` exposes aggregate subscription-backed membership
  access counts and public-safe policy text. `/api/products/entitlements` can
  show checkout-linked membership entitlement state after trusted Billing events
  without exposing raw Stripe subscription or customer IDs.
- `/products/source-data` exposes aggregate product creation counts and
  supported-kind policy text. `/admin/products` can inspect recent owner-created
  draft product records. Public source-data does not include owner emails, actor
  user IDs, idempotency keys, raw metadata, or raw Stripe IDs.
- `/products/source-data` exposes aggregate owner-created product test grant
  counts and supported policy text. `/admin/products` can inspect the linked
  product, test offer/funnel IDs, synthetic checkout state, entitlement status,
  and fulfillment evidence. Public source-data does not include buyer emails,
  buyer hashes, checkout intent IDs, entitlement IDs, idempotency keys, raw
  metadata, owner identity, or raw Stripe IDs.
- `/products/source-data` exposes aggregate owner-created product test checkout
  link and purchase counts plus supported policy text. `/admin/products` can
  inspect the public test link, link revision, synthetic checkout state,
  entitlement status, and fulfillment evidence. Public source-data does not
  include checkout link IDs, buyer emails, buyer hashes, checkout intent IDs,
  entitlement IDs, idempotency keys, raw metadata, owner identity, or raw Stripe
  IDs.
- Buyer emails, buyer hashes, raw Stripe IDs, webhook event IDs, metadata JSON,
  owner emails, actor user IDs, idempotency keys, private R2 object keys, signed
  URLs, real lesson bodies, member posts, transcripts, Customer Portal URLs, and
  progress rows remain server-private.

Future destructive product/access writes must require actor identity, exact
confirmation, idempotency, stale-state checks, audit correlation, redaction,
customer-safe notification review, and trusted checkout or subscription evidence
before access or fulfillment changes.
