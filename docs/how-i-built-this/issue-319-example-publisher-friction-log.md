# Issue 319 example publisher friction log

Date: 2026-05-22

Scope: production-safe walkthrough of the public self-serve publisher path after the pricing, brand, and account setup slices shipped. I inspected the live public pages and used the preview-safe billing checkout API path rather than making a real Stripe purchase.

## Path inspected

- `https://bumpgrade.com/`
- `https://bumpgrade.com/pricing`
- `https://bumpgrade.com/api/billing/checkout` with `previewOnly: true`
- `https://bumpgrade.com/pricing/success`
- `https://bumpgrade.com/login`
- `https://bumpgrade.com/account/setup`

## Findings

1. Generic public login defaulted to the owner admin callback.
   - Impact: a new publisher coming from the public nav could create an account and be sent toward an owner-only admin route instead of account setup.
   - Resolution in this branch: `/login` and the auth panel now default to `/account/setup`; explicit admin callbacks still work for owner-gated routes.

2. Login copy described owner-only launch tools.
   - Impact: the account page sounded like an internal owner/admin entrypoint instead of a publisher account entrypoint.
   - Resolution in this branch: login copy now describes publisher workspace setup, subdomain reservation, and paid-plan connection.

3. Checkout success asked for "one more check" without a direct paid-email handoff.
   - Impact: after Stripe success, a buyer could miss that the paid entitlement is keyed by email and accidentally create an account with a different address.
   - Follow-up issue: #332.
   - Resolution in this branch: verified checkout success links to signup with the paid email prefilled, and the generic failure heading is clearer.

## Not tested

- A real Stripe purchase was not made.
- Email verification delivery was not tested from production.
- DNS or custom domain verification was not exercised.

## Evidence

- Preview-safe checkout returned the Experiment plan line item and no raw Stripe IDs.
- The account setup page correctly gates subdomain reservation behind a signed-in, email-confirmed account with an active paid entitlement.
