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
- R2 Codex mail binding: `MAIL`.
- R2 Codex mail bucket name: `bumpgrade-mail`.

## Codex Email

Issue #10 configures Bumpgrade project email for shipped PR notices and Mark
reply monitoring.

- Default sender: `Codex <codex@bumpgrade.com>`.
- Default shipped-notice recipient: `m@rkmoriarty.com`.
- Cloudflare Email Routing status checked on May 18, 2026: `ready`.
- Cloudflare Email Routing destination for Mark is verified as
  `m@rkmoriarty.com`.
- Cloudflare Email Routing rule `Codex Worker inbox` routes
  `codex@bumpgrade.com` to Worker `bumpgrade`
  (`1a4cd26c1a33455b93a2a81865c390bd`).
- R2 raw-message bucket: `bumpgrade-mail`.
- Worker binding for raw mail: `MAIL`.
- Worker send binding: `EMAIL`, restricted to sender
  `codex@bumpgrade.com`.
- Forward copy destination: `EMAIL_FORWARD_TO`, currently
  `m@rkmoriarty.com`.

The Worker `email()` handler stores inbound Codex mail metadata in
`codex_inbound_messages`, stores raw MIME in R2 under
`codex/email/inbound/`, and forwards a copy to Mark when forwarding succeeds.

Outbound shipped notices use Cloudflare Email Service REST:

```bash
npm run pr:email -- --pr <number> --version "<worker-version>"
```

Recent trusted replies can be checked with:

```bash
npm run codex:poll-inbox -- --minutes 70 --limit 20
```

The first REST probe from `codex@bumpgrade.com` before DNS readiness returned a
`permanent_bounces` result for `m@rkmoriarty.com`. A later real PR #40 shipped
notice returned `delivered` and is stored in D1. A self-addressed inbound smoke
through Cloudflare Email Sending returned
`email.sending.error.email.sending_disabled` because `codex@bumpgrade.com` is
an inbound alias, not a verified send destination. Use the next real reply to
prove raw D1/R2 capture end to end.

Use `--show-body` only when private message text is needed to act on Mark's
reply. Do not paste private inbox bodies, raw MIME, attachments, tokens, or
other private user data into GitHub, docs, PR bodies, screenshots, or public
source-data routes. See `docs/agent/codex-mail-workflow.md` for the full
workflow.

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

The first production smoke for issue #34 showed the copied sandbox secret value
is not a usable Stripe test secret yet. The checkout API therefore remains in
safe preview mode until a valid `STRIPE_SECRET_KEY_SANDBOX` is stored as the
Worker secret. Runtime code must prefer Cloudflare `env` bindings over
build-time `process.env` so a local placeholder cannot override production.

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
