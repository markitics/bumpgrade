# Checkout Offers

Issue #15 owns the checkout, order bump, upsell, and downsell MVP. Issue #81
added the first checkout-offer source-data contract and preview scaffold. Issue
#99 adds the first confirmed sandbox checkout start path with the seeded primary
offer and constrained order bump. Issue #111 adds optional referral-click
attribution evidence on sandbox checkout intents. Issue #113 adds review-only
commission ledger evidence from trusted checkout attribution. Issue #115 adds
owner-gated review, hold, and reversal actions for that evidence without payout
mutation.

Live in this slice:

- `/offers/source-data`: public-safe JSON with one seeded checkout offer stack,
  a primary sandbox offer, order bump, upsell, downsell, revision ID, checkout
  route links, and write boundary.
- `/offers/indie-launch-stack`: crawlable semantic preview of the seeded offer
  sequence plus a sandbox checkout start panel.
- `/api/commerce/checkout`: sandbox-only checkout start route that can include
  the seeded primary offer and the `price-launch-checklist-bump-usd` order bump
  after exact confirmation. Test and incomplete-secret environments return a
  redacted preview response. Eligible referral click IDs can be attached as
  public-safe attribution evidence.
- `/api/affiliates/commission-ledger`: confirmed write route that can create
  non-payable, review-only commission ledger evidence from a trusted checkout
  intent with referral attribution.
- `/api/admin/affiliates/commission-ledger/actions`: owner-gated review action
  route that can review, hold, or reverse that evidence without payout state.
- Agent manifest entries for reading checkout-offer state and future MCP
  resources.

Not live in this slice:

- Live billing mode.
- Arbitrary order bump mutation or unapproved bump attachment.
- One-click upsell or downsell charging.
- Fulfillment, entitlement, refund, coupon, or customer portal writes.
- Payable commission writes, payout mutation, fraud decisions, direct agent
  review writes, tax records, and partner notifications.
- Agent write tools.

Future checkout-offer writes must require actor identity, exact confirmation,
idempotency, stale-state checks, audit correlation, redaction, owner review,
reversal controls, and webhook evidence before fulfillment, payout, or access
changes.
