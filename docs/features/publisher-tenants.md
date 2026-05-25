# Publisher Tenants And Bumpgrade Subdomains

Issues #221-#224 add the first paid publisher tenant setup path, domain
onboarding, and auth-boundary contract. Issue #466 adds logged-out playground
recovery, and issue #473 adds verified signed-in Free Build workspace creation
before paid go-live.

## Live Slice

- `/account/setup`: signed-in publisher account setup surface.
- `/account/source-data`: public-safe contract for paid publisher tenants,
  Free Build workspaces, default Bumpgrade subdomains, existing-domain DNS
  onboarding, and auth boundaries.
- `/playground`: logged-out browser-scoped launch playground for saving basic
  offer, audience, goal, and starting-platform context before signup.
- `/playground/source-data`: public-safe contract for anonymous recovery,
  claim-to-account, redaction, cookie, and go-live gate boundaries.
- `POST /api/playground/anonymous-workspace`: saves or updates a browser-scoped
  anonymous playground. The cookie stores a recovery token only; D1 stores the
  token hash and draft fields.
- `POST /api/playground/claim`: attaches the saved playground to a verified
  signed-in account and creates or reuses a private Free Build workspace.
- `POST /api/account/publisher/free-build-workspace`: creates or confirms a
  private `plan_status=free_build` workspace for an email-confirmed signed-in
  publisher before payment, with exact confirmation, idempotency, audit
  correlation, and redaction.
- `POST /api/account/publisher/subdomain`: reserves a unique
  `*.bumpgrade.com` hostname for an email-confirmed account with an active
  paid plan entitlement.
- `POST /api/account/publisher/custom-domain`: starts onboarding for a domain
  the publisher already owns, returns CNAME instructions, and re-checks DNS
  verification state.

The anonymous playground write path records browser-scoped launch context in D1
without a public hostname, billing state, email send, fulfillment state, or raw
cookie value. The Free Build write path records a tenant row and audit event in
D1 without a public hostname. The paid go-live write path records a tenant row,
subdomain reservation row, and audit event. Domain requests reject signed-out,
unverified, unpaid, invalid, reserved-name, and already-taken subdomain
requests.

## Paid Gate

Default Bumpgrade subdomains are not free-account inventory. Reservation requires
an active row in `publisher_plan_entitlements`, created after a verified
Bumpgrade plan checkout or an owner-approved manual entitlement.

Anonymous playgrounds and Free Build workspaces can hold private launch setup
state before payment, but they cannot reserve domains, publish public buyer
paths, collect live payments, send subscribers, or fulfill protected access until
the account has a paid or explicitly approved go-live entitlement.

## Auth Boundary

Better Auth is configured to trust `https://*.bumpgrade.com` and to use the
`bumpgrade.com` cookie domain in production, so one login can work across
`bumpgrade.com`, `a.bumpgrade.com`, and `b.bumpgrade.com`.

That shared session proves identity only. Publisher-site reads and writes still
need to resolve the requested hostname to a tenant and check checkout,
entitlement, membership, or owner/admin permission before returning private
data.

Custom domains are different: browser cookies cannot span unrelated
customer-owned domains. Existing-domain DNS onboarding is live, and issue #224
documents the launch behavior: custom domains use the central Bumpgrade sign-in
handoff for identity, then return to the custom domain for tenant-scoped access
checks. Do not claim raw cookie sharing across arbitrary custom domains.

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

- Buying, registering, renewing, or transferring domains through Bumpgrade.
- Publisher site editing parity on the reserved hostname.
- Anonymous playground expansion beyond basic launch context into real draft
  funnel, offer, product, audience, and importer records.
- Raw browser-cookie sharing across unrelated custom domains.

## Domain Purchase Policy

Bumpgrade connects domains publishers already own. It does not sell, register,
renew, transfer, or price domains today.

If Bumpgrade adds registration later, the product needs a registrar/provider
decision, availability checks, purchase and renewal terms, contact/privacy
handling, payment/refund policy, and provider failure states before any public
CTA claims domains can be bought through Bumpgrade.
