# Stripe Payments And Checkout Architecture

Architecture issue: #11
Sandbox checkout issue: #34
Last reviewed: 2026-05-18

Bumpgrade will use Stripe Checkout Sessions first, backed by Cloudflare Workers
and D1. This keeps Bumpgrade out of raw card-data handling, gives publishers a
hosted payment surface early, and leaves room for embedded Checkout or Payment
Element work after the product model is stable.

## Current Shipped State

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

This is not live billing parity. `STRIPE_ACTIVE_MODE` remains `sandbox`, live
mode is rejected by the checkout route, and no customer-facing checkout button is
published outside the smoke path.

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

`/Users/mark/Documents/code/laurelharned/.env.local` was inspected without
printing values. The reusable Stripe entries found were:

| Source key | Safe classification | Bumpgrade Cloudflare secret |
| --- | --- | --- |
| `STRIPE_SECRET_KEY_LIVE` | live restricted key | `STRIPE_SECRET_KEY_LIVE` |
| `STRIPE_PUBLIC_KEY_LIVE` | live publishable key | `STRIPE_PUBLISHABLE_KEY_LIVE` |
| `STRIPE_SECRET_KEY_SANDBOX` | test secret key | `STRIPE_SECRET_KEY_SANDBOX` |
| `STRIPE_PUBLIC_KEY_SANDBOX` | test publishable key | `STRIPE_PUBLISHABLE_KEY_SANDBOX` |

Those four Bumpgrade secrets were uploaded to Cloudflare on 2026-05-18 without
printing values. The Worker var `STRIPE_ACTIVE_MODE` defaults to `sandbox`.
Production live checkout must not be enabled until a later issue deliberately
switches the mode and has webhook evidence.

Do not commit Stripe values to git. Local development should use `.env.local`.
Cloudflare production should use Worker secrets.

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
commerce tables:

- `commerce_products`: products, memberships, services, downloads, or offer
  records owned by a publisher/user.
- `commerce_prices`: amount, currency, billing interval, active flag, and
  optional Stripe Price id.
- `checkout_intents`: idempotent checkout-start records created before Stripe is
  called.
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
