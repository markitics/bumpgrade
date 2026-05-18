# Checkout Offers

Issue #15 owns the checkout, order bump, upsell, and downsell MVP. Issue #81 is
the first independently shippable slice: a read-only checkout-offer source-data
contract and preview scaffold.

Live in this slice:

- `/offers/source-data`: public-safe JSON with one seeded checkout offer stack,
  a primary sandbox offer, order bump, upsell, downsell, revision ID, checkout
  route links, and write boundary.
- `/offers/indie-launch-stack`: crawlable semantic preview of the seeded offer
  sequence.
- Agent manifest entries for reading checkout-offer state and future MCP
  resources.

Not live in this slice:

- Live billing mode.
- Order bump mutation inside Stripe Checkout.
- One-click upsell or downsell charging.
- Fulfillment, entitlement, refund, coupon, or customer portal writes.
- Agent write tools.

Future checkout-offer writes must require actor identity, exact confirmation,
idempotency, stale-state checks, audit correlation, redaction, and webhook
evidence before fulfillment or access changes.
