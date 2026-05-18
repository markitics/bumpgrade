# Decision Log

## 2026-05-18: Use Webpack For Production Next Builds

Issue: #51

Decision: Bumpgrade production builds use `next build --webpack` before
OpenNext packages the Cloudflare Worker.

Why:

- Local Next 16 default production builds repeatedly failed with transient
  missing `.next` files during OpenNext validation.
- The same checkout completed `cf:build` and the browser suite under the
  Webpack builder.
- A stable deploy path matters more than testing Turbopack production behavior
  while the rest of the app is still being sliced into issue-sized work.

Consequences:

- Revisit the default builder only after a focused compatibility issue proves
  `npm run cf:build`, Worker preview, and browser tests are stable.
- Broad validation should use Node 22 until the Cloudflare/OpenNext runtime
  baseline changes intentionally.

## 2026-05-18: Use Stripe Checkout Sessions First

Issue: #11

Decision: Bumpgrade starts with Stripe Checkout Sessions, not raw card forms or
direct PaymentIntent-first flows. The first implementation remains sandbox-only
until the webhook route, idempotent D1 records, and payment audit records are
working.

Why:

- Stripe Checkout keeps payment UI and PCI-heavy card collection outside
  Bumpgrade.
- Checkout Sessions can cover both one-time payments and subscriptions.
- Fanful/LaurelHarned already proved the Cloudflare Worker shape: Stripe SDK
  fetch HTTP client, async Web Crypto webhook verification, D1 purchase records,
  and webhook event idempotency.
- Bumpgrade needs agent-safe confirmed-write contracts before any billing
  action can happen from an agent client.

Consequences:

- `STRIPE_ACTIVE_MODE` defaults to `sandbox`.
- Live keys may exist as Cloudflare secrets, but live checkout needs a later
  explicit rollout issue.
- Webhook signing secrets are Bumpgrade endpoint-specific and must not be copied
  from LaurelHarned.
- Connect and application fees wait until Bumpgrade has publisher account and
  payout responsibility records.
