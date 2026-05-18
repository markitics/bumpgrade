# Decision Log

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
