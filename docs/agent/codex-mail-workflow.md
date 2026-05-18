# Codex Mail Workflow

Issue #10 owns Bumpgrade project email for Codex shipped notices and Mark reply
monitoring.

## Addresses

- Default sender: `Bumpgrade Codex <codex@bumpgrade.com>`.
- Default recipient for shipped notices: `m@rkmoriarty.com`.
- Trusted inbound task senders:
  - `m@rkmoriarty.com`
  - `markeffect@gmail.com`
  - `markmoriarty@stripe.com`
  - `mark@awesound.com`

Per-session plus addressing is not assumed yet. Cloudflare currently reports
subaddressing disabled for `bumpgrade.com`, so use `codex@bumpgrade.com` until
an explicit plus-address route is proven.

## Outbound

After a substantive merged PR, deploy and smoke-test first, then send a short
notice:

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
4. Marks rows from trusted Mark-controlled senders with `trusted_sender = 1`.

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
