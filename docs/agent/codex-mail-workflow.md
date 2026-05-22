# Codex Mail Workflow

Issue #10 owns Bumpgrade project email for Codex shipped notices and Mark reply
monitoring.

## Addresses

- Default sender: `Bumpgrade Codex <codex@bumpgrade.com>`.
- Default recipient for shipped notices: `m@rkmoriarty.com`.
- Trusted inbound task senders:
  - `m@rkmoriarty.com`
  - `mark@awesound.com`
  - `markmoriarty@stripe.com`

Per-session plus addressing is not assumed yet. Cloudflare currently reports
subaddressing disabled for `bumpgrade.com`, so use `codex@bumpgrade.com` until
an explicit plus-address route is proven.

## Outbound

Send shipped notices only for merged work that is user-visible, owner-visible,
or materially actionable for Mark. Good reasons include product UI/content
changes, live feature launches, user-impacting bug fixes, roadmap/status
movement, production incidents resolved, and anything Mark explicitly asked to
hear about by email.

Use the quiet path for low-signal internal work: PR comment, issue update, and
`/admin/work-log` entry when durable recordkeeping is useful. Do not send a
shipped notice for docs-only edits, tests, lint, refactors, plumbing, dependency
housekeeping, or agent workflow tweaks unless they are bundled with a qualifying
user-facing change or need Mark's action.

For qualifying shipped notices, deploy and smoke-test first, then send:

```bash
npm run codex:email-pr -- --pr <number> --version "<worker-version>"
```

`npm run pr:email -- --pr <number> --version "<worker-version>"` is the
short alias for the same command.

The script uses Cloudflare Email Service REST, sends from
`codex@bumpgrade.com`, and records the provider result in
`codex_outbound_messages`.

If the provider returns `permanent_bounces`, do not claim the email was
delivered. Record the exact status on the PR or issue and keep moving.

Known evidence from issue #10:

- A delayed PR #40 notice sent from `codex@bumpgrade.com` to
  `m@rkmoriarty.com` returned `delivered` and is recorded in
  `codex_outbound_messages`.
- A self-addressed smoke from `codex@bumpgrade.com` to `codex@bumpgrade.com`
  returned Cloudflare error `email.sending.error.email.sending_disabled`
  because the inbound alias is not a verified destination for Email Sending.
  The failed attempt is recorded as
  `codex-outbound-pr-49-1779108678616`. Verify D1/R2 inbound capture on the
  next real reply instead of describing the self-smoke as delivered.

## Inbound

Cloudflare Email Routing invokes the Worker `email(message, env)` handler in
`custom-worker.ts`.

The handler:

1. Forwards a copy to `EMAIL_FORWARD_TO` when configured.
2. Stores raw MIME in R2 bucket `bumpgrade-mail` under
   `codex/email/inbound/<id>.eml`.
3. Stores public-safe metadata, a snippet, and a bounded raw body prefix in D1
   table `codex_inbound_messages`.
4. Stores sender authentication evidence from Cloudflare mail headers.
5. Marks rows with `trusted_sender = 1` only when the sender identity is one of
   the three addresses above and the authentication evidence aligns.
6. Sends a safe acknowledgement to unlisted senders without executing or
   treating their message as actionable.

The first real Mark reply to `codex@bumpgrade.com` proved D1/R2 inbound capture
and had no attachments. Its headers showed `dmarc=none` for
`header.from=rkmoriarty.com` and `spf=pass` for
`smtp.mailfrom=markeffect@gmail.com`. That means strict steering from
`m@rkmoriarty.com` needs an aligned authenticated sender path before Codex can
trust it automatically.

Before starting unrelated large work, poll for recent trusted replies:

```bash
npm run codex:poll-inbox -- --minutes 70 --limit 20
```

Use `--show-body` only when you need the private body text to act on Mark's
reply. Do not paste private inbox bodies, raw MIME, tokens, or attachments into
GitHub.

## Cloudflare State

As of May 18, 2026, Cloudflare Email Routing for `bumpgrade.com` is enabled and
reports `ready` after installing the required MX, SPF, and DKIM records.

Routing rules:

- `Codex Worker inbox` routes `codex@bumpgrade.com` to Worker `bumpgrade`.

R2:

- `bumpgrade-mail`: raw inbound Codex MIME.

D1:

- `codex_outbound_messages`: sent PR notices and provider status.
- `codex_inbound_messages`: inbound reply metadata and raw storage keys.

## Source References

- Cloudflare Email Service REST sends through
  `POST /accounts/{account_id}/email/sending/send`.
- Cloudflare Email Workers expose an `email(message, env, ctx)` handler and a
  `ForwardableEmailMessage` with `from`, `to`, `headers`, `raw`, `rawSize`,
  `forward()`, and `reply()`.
