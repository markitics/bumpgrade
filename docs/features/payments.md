# Stripe Payments And Checkout Architecture

Architecture issue: #11
Sandbox checkout issue: #34
Self-serve plan checkout issue: #316
Last reviewed: 2026-05-22

Bumpgrade will use Stripe Checkout Sessions first, backed by Cloudflare Workers
and D1. This keeps Bumpgrade out of raw card-data handling, gives publishers a
hosted payment surface early, and leaves room for embedded Checkout or Payment
Element work after the product model is stable.

## Current Shipped State

Issue #316 adds the first self-serve Bumpgrade account-plan checkout path:

- `/pricing` renders Experiment at `$97/mo`, Grow at `$197/mo`, Enterprise as a
  contact path, and an optional one-time White glove setup add-on at `$1,000`.
- `POST /api/billing/checkout` starts live Stripe Checkout for Experiment or
  Grow, optionally including White glove setup on the first invoice.
- `/pricing/success` verifies the returned Stripe Checkout Session server-side
  before creating an active `publisher_plan_entitlements` row by buyer email.
- `/pricing-v2` is a public alternate usage-based pricing draft, not the default
  packaging decision.

The deployed Worker has live Stripe secret material available, but the live
webhook signing secret was not listed in Cloudflare secret inventory during this
implementation. Initial activation therefore verifies the Checkout Session on
the success page. Renewal, cancellation, and customer-portal automation still
need the live webhook/customer-portal follow-up.

Issue #34 adds the first sandbox-only checkout path:

- `POST /api/commerce/checkout` reads an active D1 `commerce_prices` row, writes a
  `checkout_intents` row before calling Stripe, and creates a Stripe Checkout
  Session when sandbox secrets are available.
- `APP_ENV=test`, missing-secret, and explicit `previewOnly` requests return a
  safe preview response and do not call Stripe.
- `POST /api/stripe/webhook` verifies Stripe signatures with the async Web
  Crypto provider, dedupes `stripe_webhook_events`, updates checkout/subscription
  state, and writes redacted `payment_audit_events`.
- A seeded sandbox smoke product/price exists:
  `price-bumpgrade-sandbox-launch-pass-usd`.

This publisher-offer checkout path is not live billing parity.
`STRIPE_ACTIVE_MODE` remains `sandbox`, live mode is rejected by the
`/api/commerce/checkout` route, and public offer checkout starts must still use
exact confirmation plus the Bumpgrade redirect wrapper. That is deliberately
separate from the self-serve Bumpgrade account-plan checkout route above.

Issue #81 adds the first checkout-offer contract and issue #99 adds the first
confirmed sandbox checkout start with the seeded order bump:

- `/offers/source-data` exposes a seeded primary offer, order bump, upsell, and
  downsell stack tied to the sandbox checkout contract.
- `/offers/indie-launch-stack` previews that sequence and includes the exact
  confirmation form for starting a sandbox Checkout Session.
- `/api/commerce/checkout` accepts the seeded `price-launch-checklist-bump-usd`
  order bump in sandbox mode and returns a Bumpgrade redirect URL rather than a
  raw Stripe URL when a Checkout Session is created.
- Arbitrary order bump mutation, one-click upsell charging, fulfillment, and
  live billing still require future confirmed-write APIs.

Issue #83 adds the first read-only product/access contract:

- `/products/source-data` exposes seeded products, assets, access rules, and
  entitlement templates for downloads, courses, memberships, services, events,
  and bundles.
- `/products/indie-launch-library` previews those records for humans and browser
  agents.

Issue #101 connects paid sandbox checkout evidence to product access:

- Trusted `checkout.session.completed` paid webhooks can create idempotent
  `product_entitlements` rows for the seeded primary offer and selected order
  bump.
- Matching `product_fulfillment_tasks` rows are queued as public-safe evidence.
- Private R2 keys, signed URLs, authenticated customer entitlement inspection,
  protected content delivery, destructive revocation, live fulfillment, and direct agent writes still
  require future confirmed-write APIs.

Issue #111 connects privacy-safe referral click evidence to sandbox checkout
intents:

- A recorded seeded referral click can be referenced when creating a sandbox
  checkout intent.
- Bumpgrade stores a `checkout_referral_attributions` row with public-safe
  referral click, link, code, partner, destination, checkout intent, and
  attribution status fields.
- Replaying the checkout idempotency key returns the same attribution evidence
  without duplicating rows.
- This does not create commissions, finalize buyer attribution, set cookies,
  mutate payout state, make fraud decisions, collect tax data, notify partners,
  or expose raw request, buyer, or Stripe identifiers.

Issue #113 connects checkout attribution to review-only commission ledger
evidence:

- `POST /api/affiliates/commission-ledger` accepts a checkout intent ID, exact
  confirmation text, and idempotency key.
- The route reads D1 checkout intent and referral attribution state before
  calculating commission evidence from seeded commission rules. Client payloads
  cannot supply gross sale or commission amounts.
- Bumpgrade stores one `affiliate_commission_ledger_entries` row per checkout
  intent. The row is `review_only`, `refund_window_open`, and `not_payable`.
- Replaying the ledger idempotency key returns the same non-payable ledger row
  without duplicating evidence.
- This does not make commissions payable, mutate payout state, execute owner
  review or reversal actions, make fraud decisions, collect tax data, notify
  partners, or expose raw request, buyer, payout, or Stripe identifiers.

Issue #115 adds owner-gated review actions for that ledger evidence:

- `POST /api/admin/affiliates/commission-ledger/actions` requires a Better Auth
  owner session, exact confirmation text, idempotency key, action kind, and
  expected ledger `updatedAt` stale-state value.
- Supported action kinds are `mark_reviewed`, `hold_for_review`, and
  `reverse_evidence`.
- Actions update only review-only commission evidence and keep payout status
  `not_payable`.
- Public source-data exposes aggregate action counts only, not raw actor email,
  private reasons, buyer identifiers, payout data, tax data, or Stripe IDs.
- This does not create payout batches, execute Stripe payouts, notify partners,
  collect tax data, finalize buyer attribution, or enable direct agent review
  writes.

Issue #193 adds public-safe affiliate partner reports:

- `/affiliates/source-data` exposes partner report definitions and aggregate
  report rows keyed by `affiliatePartnerReportId`.
- Report rows summarize public-safe clicks, attributed checkouts, review-only
  ledger evidence, owner review actions, commission evidence totals, and payout
  readiness caveats by partner.
- Reports never expose buyer emails, buyer hashes, raw click rows, raw checkout
  rows, Stripe IDs, tax data, payout accounts, raw actor identity, or private
  review reasons.
- This does not create a private partner portal, payable commission state,
  payout batches, Stripe payouts, fraud decisions, tax collection, partner
  notification, or direct agent affiliate writes.

Issue #195 adds read-only affiliate payout preparation:

- `/affiliates/source-data` exposes payout preparation rows keyed by
  `payoutPreparationId` and linked to seeded `payoutBatchId` values.
- Preparation rows summarize eligible, blocked, and reversed fixture ledger IDs,
  readiness checklist items, partner report links, aggregate review action
  evidence, and public-safe commission totals.
- Preparation rows never expose buyer data, raw ledger rows, raw actor identity,
  private review reasons, payout accounts, tax forms, Stripe payout or transfer
  IDs, or partner notification payloads.
- This does not create payable commissions, payout batches for execution,
  Stripe payouts, partner statements, tax collection, payout account storage,
  partner notifications, fraud decisions, or direct agent affiliate writes.

Issue #273 adds owner-confirmed affiliate payout preparation records:

- `/api/admin/affiliates/payout-preparation-records` requires an owner session,
  exact confirmation, idempotency, current affiliate program revision, payout
  batch status, ledger counts, and public-safe commission total.
- `/affiliates/source-data` exposes `payoutPreparationRecords` with aggregate
  counts and latest redacted metadata only.
- Records never expose payout accounts, tax data, Stripe payout IDs, partner
  notification bodies, buyer data, raw ledger rows, raw actor identity, private
  fraud signals, or private notes.
- This does not create payable commissions, Stripe payouts or transfers, tax
  collection, payout account storage, partner notifications, fraud decisions, or
  direct agent affiliate writes.

Issue #275 adds owner-reviewed affiliate fraud review records:

- `/api/admin/affiliates/fraud-review-records` requires an owner session, exact
  confirmation, idempotency, current affiliate program revision, payout batch
  status, review flag severity, and linked ledger count.
- `/affiliates/source-data` exposes `fraudReviewRecords` with aggregate counts
  and latest redacted metadata only.
- Records never expose private fraud signals, buyer data, raw ledger rows, raw
  click rows, raw checkout rows, raw actor identity, payout accounts, tax data,
  Stripe payout IDs, partner notification bodies, or private notes.
- This does not enforce fraud decisions, create payable commissions, create
  Stripe payouts or transfers, collect tax data, store payout accounts, notify
  partners, or create direct agent affiliate writes.

Issue #277 adds owner-reviewed affiliate partner notification readiness records:

- `/api/admin/affiliates/notification-readiness-records` requires an owner
  session, exact confirmation, idempotency, current affiliate program revision,
  partner report status, payout batch status, payout preparation record status,
  fraud review record status, review flag severity, and linked ledger count.
- `/affiliates/source-data` exposes `partnerNotificationReadinessRecords` with
  aggregate counts and latest redacted metadata only.
- Records never expose recipient emails, message bodies, provider message IDs,
  send queue rows, private fraud signals, buyer data, raw ledger rows, raw click
  rows, raw checkout rows, raw actor identity, payout accounts, tax data, Stripe
  payout IDs, or private notes.
- This does not send partner notifications, call providers, create queue
  dispatch rows, enforce fraud decisions, create payable commissions, create
  Stripe payouts or transfers, collect tax data, store payout accounts, or
  create direct agent affiliate writes.

Issue #279 adds owner-reviewed affiliate partner notification send preflight records:

- `/api/admin/affiliates/notification-send-preflights` requires an owner
  session, exact confirmation, idempotency, current affiliate program revision,
  partner report status, payout batch status, payout preparation record status,
  fraud review record status, notification readiness record status, review flag
  severity, and linked ledger count.
- `/affiliates/source-data` exposes `partnerNotificationSendPreflightRecords`
  with aggregate counts and latest redacted metadata only.
- Records never expose recipient emails, message bodies, send payloads,
  provider message IDs, send queue rows, private fraud signals, buyer data, raw
  ledger rows, raw click rows, raw checkout rows, raw actor identity, payout
  accounts, tax data, Stripe payout IDs, or private notes.
- This does not send partner notifications, enable provider sends, call
  providers, create send payloads, create queue dispatch rows, enforce fraud
  decisions, create payable commissions, create Stripe payouts or transfers,
  collect tax data, store payout accounts, or create direct agent affiliate
  writes.

Issue #281 adds owner-reviewed affiliate partner notification provider readiness records:

- `/api/admin/affiliates/notification-provider-readiness` requires an owner
  session, exact confirmation, idempotency, current affiliate program revision,
  partner report status, payout batch status, payout preparation record status,
  fraud review record status, notification readiness record status, send
  preflight record status, review flag severity, and linked ledger count.
- `/affiliates/source-data` exposes `partnerNotificationProviderReadinessRecords`
  with aggregate counts and latest redacted metadata only.
- Records never expose provider configuration, provider secrets, sender
  credentials, recipient emails, message bodies, send payloads, provider message
  IDs, send queue rows, private fraud signals, buyer data, raw ledger rows, raw
  click rows, raw checkout rows, raw actor identity, payout accounts, tax data,
  Stripe payout IDs, or private notes.
- This does not configure notification providers, store provider secrets, store
  sender credentials, send partner notifications, enable provider sends, call
  providers, create send payloads, create queue dispatch rows, enforce fraud
  decisions, create payable commissions, create Stripe payouts or transfers,
  collect tax data, store payout accounts, or create direct agent affiliate
  writes.

Issue #117 records post-purchase upsell/downsell follow-up decisions without
creating a billing mutation:

- `/commerce/checkout/success` is the Stripe return target and issue #133 gates
  its post-purchase CTA on trusted webhook state instead of assuming the webhook
  has already updated D1.
- `/commerce/post-purchase/{checkoutIntentId}` renders the seeded launch
  accelerator upsell and launch review downsell only after trusted paid or
  completed sandbox checkout evidence exists.
- `POST /api/commerce/post-purchase-decisions` requires a checkout intent ID,
  supported decision kind, exact confirmation text, idempotency key, and current
  checkout `updatedAt` stale-state value.
- The route stores `checkout_post_purchase_decisions` rows and redacted
  `payment_audit_events` only.
- Source-data exposes aggregate decision counts through `/offers/source-data`
  and `/commerce/source-data`.
- This does not create Stripe charges, PaymentIntents, subscriptions,
  fulfillment, entitlement grants, payable commissions, payout state, tax
  records, partner notifications, or direct agent billing writes.

## Source Checks

Checked on 2026-05-18:

- Installed `stripe` package `22.1.1` pins API version
  `2026-04-22.dahlia`.
- Stripe Checkout documentation positions Checkout Sessions as the shared API
  behind hosted, embedded, and Elements-based checkout UIs.
- Stripe Connect Accounts v2 is the preferred model for new connected-account
  platform work.
- Fanful/LaurelHarned already uses Stripe Checkout Sessions, async Web Crypto
  webhook verification, D1 purchase/subscription records, and webhook event
  idempotency on Cloudflare Workers.

## Secret And Mode Plan

`/Users/mark/Documents/code/2026/bumpgrade/.env.local` was inspected without
printing values. The installed Bumpgrade Stripe entries are:

| Source key | Safe classification | Bumpgrade Cloudflare secret |
| --- | --- | --- |
| `STRIPE_SECRET_KEY_LIVE` | live restricted key | `STRIPE_SECRET_KEY_LIVE` |
| `STRIPE_PUBLIC_KEY_LIVE` | live publishable key | `STRIPE_PUBLIC_KEY_LIVE` |
| `STRIPE_SECRET_KEY_SANDBOX` | test secret key | `STRIPE_SECRET_KEY_SANDBOX` |
| `STRIPE_PUBLIC_KEY_SANDBOX` | test publishable key | `STRIPE_PUBLIC_KEY_SANDBOX` |
| `STRIPE_WEBHOOK_SECRET_SANDBOX` | test endpoint signing secret for `https://bumpgrade.com/api/stripe/webhook` | `STRIPE_WEBHOOK_SECRET_SANDBOX` |

Those Bumpgrade secrets were uploaded to Cloudflare on 2026-05-18 without
printing values. The Worker var `STRIPE_ACTIVE_MODE` defaults to `sandbox`.
Production live checkout must not be enabled until a later issue deliberately
switches the mode and has webhook evidence.

Do not commit Stripe values to git. Local development should use `.env.local`.
Cloudflare production should use Worker secrets. In Worker runtime code,
Cloudflare `env` bindings are authoritative and `process.env` is only a local
fallback so a build-time placeholder cannot mask a valid production secret.

## First Payment Surface

Start with Stripe-hosted Checkout Sessions:

- `mode: "payment"` for one-time products, downloads, coaching, services, and
  donations.
- `mode: "subscription"` for memberships and recurring subscriptions.
- Dynamic `price_data` is acceptable for early sandbox checkout, but D1
  `commerce_prices.stripe_price_id` leaves room for dashboard-created Prices.
- Use Stripe Customer Portal later for subscription self-service rather than
  hand-rolled cancellation or renewal loops.

PaymentIntents are not the first API. Use them later only if Bumpgrade needs
off-session charging or a checkout state model that Checkout Sessions cannot
represent.

## D1 Commerce Contract

Migration `0004_stripe_commerce_architecture.sql` defines the first durable
commerce tables, and later migrations extend them:

- `commerce_products`: products, memberships, services, downloads, or offer
  records owned by a publisher/user.
- `commerce_prices`: amount, currency, billing interval, active flag, and
  optional Stripe Price id.
- `checkout_intents`: idempotent checkout-start records created before Stripe is
  called.
- `checkout_referral_attributions`: public-safe evidence linking eligible
  seeded referral clicks to sandbox checkout intents.
- `affiliate_commission_ledger_entries`: review-only, non-payable commission
  evidence created from trusted checkout referral attribution.
- `affiliate_commission_ledger_actions`: owner-gated review, hold, and reversal
  action evidence for non-payable commission ledger rows.
- `checkout_post_purchase_decisions`: non-billing upsell/downsell decision
  evidence tied to trusted sandbox checkout state.
- `billing_subscriptions`: Stripe subscription state mirrored into D1.
- `stripe_webhook_events`: webhook idempotency and redacted event evidence.
- `payment_audit_events`: public-safe payment state changes and agent/action
  audit records.

The first checkout route in #34 writes a checkout intent before calling Stripe,
then updates it after Stripe returns a Checkout Session. When sandbox secrets are
missing or incomplete, the route returns a redacted preview instead of guessing
or falling back to live mode. Webhooks update status through idempotent event
storage before returning success.

## Webhook Contract

The Bumpgrade webhook endpoint should be:

```text
https://bumpgrade.com/api/stripe/webhook
```

When creating the Stripe webhook endpoint, ask for these events first:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Use Stripe's async Web Crypto verification path on Cloudflare Workers. Store the
endpoint signing secret as `STRIPE_WEBHOOK_SECRET_SANDBOX` or
`STRIPE_WEBHOOK_SECRET_LIVE` without printing it. Do not reuse LaurelHarned's
webhook secret; webhook signing secrets are endpoint-specific. The route returns
`503` until the relevant endpoint secret is configured.

## Agent And Admin Safety

Billing-impacting agent writes need all of these before Stripe is called:

- exact user confirmation text for the specific product, price, amount, and
  currency;
- idempotency key;
- audit correlation id;
- stale-state check against the current product/price/checkout record;
- redacted model-visible metadata;
- webhook evidence before Bumpgrade grants paid access or marks fulfillment
  complete.

Agents may read redacted commerce state. Agents must not expose raw Stripe keys,
raw webhook payloads, full payment identifiers, private buyer data, card data,
or private customer support context.

## Connect Later

Connect is not part of the first checkout implementation. When Bumpgrade routes
money to publishers rather than charging on Mark's platform account, use Stripe
Connect Accounts v2 and decide responsibilities explicitly:

- dashboard access;
- fees and losses responsibility;
- capabilities;
- connected account onboarding state;
- destination charges versus direct charges.

Destination charges with Checkout are the likely first platform shape, but do
not enable application fees or transfers until D1 can store connected-account
state, fee policy version, transfer/application fee ids, refunds, disputes, and
deauthorization state.
