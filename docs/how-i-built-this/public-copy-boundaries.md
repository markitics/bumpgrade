# Public Copy Boundaries

Issue #330 moved internal build notes out of public marketing pages.

## What Changed

- `/pricing` now describes the buyer path, Stripe checkout, setup add-on, plan
  access, and workspace setup without showing checkout contract IDs or route
  names.
- `/pricing-v2` now reads as an alternate usage-pricing option, not an internal
  draft for Mark to decide on.
- `/brand` now presents logo assets, palette, voice, and usage guidance for
  customers and partners. The machine-readable brand contract remains available
  at `/brand/source-data`.
- `/features` and `/features/[slug]` now explain the problem, outcome, examples,
  and launch jobs in customer language. Source-data and admin routes remain in
  the feature records for agents but are filtered out of visible related-example
  links.
- Public example routes for funnels, offers, products, audience, analytics, and
  affiliate programs now describe the user workflow instead of issue numbers,
  source-data routes, contract boundaries, or scaffold status.

## Notes Kept For Us

- Bumpgrade still keeps source-data routes and `public/llms.txt` for agents.
- Admin pages and `/agent-docs/*` may still use contract language because those
  surfaces are explicitly for agents, owners, or implementation workflows.
- The pricing checkout contract remains in `src/lib/pricing-plans.ts` and the
  billing API. The public pricing page should not expose the contract ID.
- Brand source-data remains in `src/lib/brand.ts` and `/brand/source-data`; the
  public brand page should focus on practical logo and voice usage.

## Regression Rule

The Playwright smoke suite checks the main customer routes for obvious internal
phrasing such as `source-data`, `Issue #`, `contract`, `scaffold`, `D1`,
`Cloudflare`, `pilot`, `request access`, and `In build`. Add new phrases there
when a placeholder pattern shows up in review.
