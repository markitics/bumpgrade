# Operations

This file records production facts and setup notes that future agents should
check before changing Bumpgrade infrastructure.

## Cloudflare

- Worker name: `bumpgrade`.
- Canonical domain: `https://bumpgrade.com`.
- D1 database binding: `DB`.
- D1 database name: `bumpgrade-prod`.
- R2 OpenNext cache binding: `NEXT_INC_CACHE_R2_BUCKET`.
- R2 bucket name: `bumpgrade-opennext-cache`.

## Better Auth

Issue #9 added the first Better Auth foundation:

- `/api/auth/[...all]` serves Better Auth routes.
- `/login` provides email/password sign-in and sign-up.
- Auth records are stored in D1 tables: `user`, `session`, `account`, and
  `verification`.
- Browser-rendered admin pages require an allowlisted Better Auth owner session.
- Public-safe `/admin/*/source-data` routes remain readable by agents and must
  not contain secrets, private notes, raw provider ids, or private user data.

Required production configuration:

- `BETTER_AUTH_SECRET`: Cloudflare secret, not a checked-in variable.
- `BETTER_AUTH_URL`: `https://bumpgrade.com`.
- `PUBLIC_SITE_URL`: `https://bumpgrade.com`.
- `BUMPGRADE_OWNER_EMAILS`: comma-separated owner allowlist; starts with
  `m@rkmoriarty.com`.

Production owner admin access requires the signed-in owner email to be verified.
Project email sending/routing is tracked in issue #10, so keep that blocker
visible until confirmation mail can be sent from the Bumpgrade email stack.

## Local Auth

`.env.example` documents safe local values. Do not commit `.env`, `.dev.vars`,
real secrets, session cookies, or raw tokens.

The Playwright web server sets local test auth environment variables inline so
the Better Auth memory fallback can run under `next dev`.

## Stripe

Issue #11 added the first Stripe architecture and secret plan. Bumpgrade uses
mode-specific Stripe secret names so sandbox checkout can ship before any live
payment path is enabled.

Cloudflare secrets installed on 2026-05-18:

- `STRIPE_SECRET_KEY_LIVE`
- `STRIPE_PUBLISHABLE_KEY_LIVE`
- `STRIPE_SECRET_KEY_SANDBOX`
- `STRIPE_PUBLISHABLE_KEY_SANDBOX`

Checked source, without printing values:

- `/Users/mark/Documents/code/laurelharned/.env.local`

Worker vars:

- `STRIPE_ACTIVE_MODE`: `sandbox`
- `STRIPE_API_VERSION`: `2026-04-22.dahlia`

`/api/stripe/webhook` exists for Bumpgrade. Stripe webhook signing secrets are
endpoint-specific and must not be copied from LaurelHarned. Set
`STRIPE_WEBHOOK_SECRET_SANDBOX` only after creating the Bumpgrade sandbox webhook
endpoint. The webhook route intentionally returns `503` when the relevant
endpoint secret is not configured.

See `docs/features/payments.md` for the D1 commerce tables, first checkout
route, webhook events, and billing-safe agent rules.
