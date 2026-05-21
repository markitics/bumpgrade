# Checkout Offers

Issue #15 owns the checkout, order bump, upsell, and downsell MVP. Issue #81
added the first checkout-offer source-data contract and preview scaffold. Issue
#99 adds the first confirmed sandbox checkout start path with the seeded primary
offer and constrained order bump. Issue #111 adds optional referral-click
attribution evidence on sandbox checkout intents. Issue #113 adds review-only
commission ledger evidence from trusted checkout attribution. Issue #115 adds
owner-gated review, hold, and reversal actions for that evidence without payout
mutation. Issue #273 adds owner-confirmed payout preparation records without
payable commission state, Stripe payouts, payout accounts, tax data, or partner
notifications. Issue #275 adds owner-reviewed fraud review records without fraud
enforcement, payable commission state, Stripe payouts, private fraud signals, or
partner notifications. Issue #277 adds owner-reviewed partner notification
readiness records without partner sends, provider calls, queue dispatch,
recipient emails, message bodies, provider message IDs, payable commission
state, Stripe payouts, private fraud signals, or partner notifications. Issue #117 adds a trusted post-purchase route and an idempotent
non-billing decision API for upsell/downsell follow-up evidence. Issue #133
gates the checkout success CTA on trusted webhook state before opening that
post-purchase path.

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
- `/commerce/checkout/success`: safe Stripe return target that polls the
  post-purchase decision contract and only shows the upsell/downsell CTA once
  the checkout intent is paid or completed from trusted webhook evidence.
- `/api/affiliates/commission-ledger`: confirmed write route that can create
  non-payable, review-only commission ledger evidence from a trusted checkout
  intent with referral attribution.
- `/api/admin/affiliates/commission-ledger/actions`: owner-gated review action
  route that can review, hold, or reverse that evidence without payout state.
- `/api/admin/affiliates/payout-preparation-records`: owner-gated payout
  preparation record route that can record review evidence without creating
  payout state.
- `/api/admin/affiliates/fraud-review-records`: owner-gated fraud review record
  route that can record review evidence without enforcing fraud decisions or
  creating payout state.
- `/api/admin/affiliates/notification-readiness-records`: owner-gated partner
  notification readiness record route that can record readiness evidence without
  sending partner notifications, calling providers, creating queue rows, or
  creating payout state.
- `/commerce/post-purchase/{checkoutIntentId}`: public-safe post-purchase offer
  path for eligible paid or completed sandbox checkout intents.
- `/api/commerce/post-purchase-decisions`: confirmed, idempotent route that can
  record non-billing upsell/downsell follow-up decisions from trusted checkout
  state.
- Agent manifest entries for reading checkout-offer state and future MCP
  resources.

Not live in this slice:

- Live billing mode.
- Arbitrary order bump mutation or unapproved bump attachment.
- One-click upsell or downsell charging.
- Fulfillment, entitlement, refund, coupon, or customer portal writes.
- Payable commission writes, payout mutation, fraud decisions, direct agent
  review writes, tax records, partner sends, provider calls, and notification
  queue dispatch.
- Agent write tools.

Future checkout-offer writes must require actor identity, exact confirmation,
idempotency, stale-state checks, audit correlation, redaction, owner review,
reversal controls, and webhook evidence before fulfillment, payout, or access
changes.
