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
