# Publisher Tenants And Bumpgrade Subdomains

Issue #222 adds the first paid publisher tenant setup path.

## Live Slice

- `/account/setup`: signed-in publisher account setup surface.
- `/account/source-data`: public-safe contract for paid publisher tenants,
  default Bumpgrade subdomains, existing-domain DNS onboarding, and auth
  boundaries.
- `POST /api/account/publisher/subdomain`: reserves a unique
  `*.bumpgrade.com` hostname for an email-confirmed account with an active
  paid-plan or launch-pilot entitlement.
- `POST /api/account/publisher/custom-domain`: starts onboarding for a domain
  the publisher already owns, returns CNAME instructions, and re-checks DNS
  verification state.

The write path records a tenant row, subdomain reservation row, and audit event
in D1. It rejects signed-out, unverified, unpaid, invalid, reserved-name, and
already-taken subdomain requests.

## Paid Gate

Default Bumpgrade subdomains are not free-account inventory. Reservation requires
an active row in `publisher_plan_entitlements`, either from live billing later
or from a launch-pilot/manual entitlement during the invite wave.

## Auth Boundary

Better Auth is configured to trust `https://*.bumpgrade.com` and to use the
`bumpgrade.com` cookie domain in production, so one login can work across
`bumpgrade.com`, `a.bumpgrade.com`, and `b.bumpgrade.com`.

Custom domains are different: browser cookies cannot span unrelated
customer-owned domains. DNS onboarding is live, but custom-domain customer auth
semantics need the follow-up auth slice.

## Existing Domains

After a paid publisher has reserved the default Bumpgrade hostname, they can add
an existing domain in `/account/setup`. Bumpgrade shows:

- Record type: `CNAME`
- Record name: the publisher-owned hostname, such as `www.example.com`
- Record value: `custom-domains.bumpgrade.com`
- Verification state: `pending_dns`, `dns_verified`, `ssl_pending`, `active`,
  `failed`, or `disabled`

Public source data exposes the policy and DNS instruction shape. Private
customer domain rows stay behind authenticated publisher context.

## Not Included

- Buying domains through Bumpgrade.
- Publisher site editing parity on the reserved hostname.
- Customer auth across arbitrary custom domains.
