# Competitor Importers

Issue #467 tracks Bumpgrade importers for ClickFunnels and adjacent competitor
platforms.

The first shipped contract is review-first, with one live private create path:

- `/imports` lists supported platform paths.
- `/imports/clickfunnels` is the first dedicated importer page.
- `/imports/source-data` exposes platform IDs, competitor IDs, source IDs, input
  kinds, generated private record types, safety gates, and known limitations.
- `POST /api/imports/clickfunnels/draft` lets a verified publisher create or
  reuse a Free Build workspace and save a private ClickFunnels import draft after
  exact confirmation and idempotency.

Imported material starts in a private Bumpgrade workspace. Public publishing,
live checkout, subscriber sends, domains, and fulfillment remain behind go-live
approval or later confirmed-write APIs.

Current public source-data and API responses intentionally exclude raw exports,
customer rows, private emails, payment credentials, API keys, session cookies,
private files, pasted source material, and account-to-account transfer claims.

Agents can use `/imports/source-data`, `/compare/source-data`, and
`/features/source-data` to answer importer questions. They must not claim live
account transfer, payment migration, customer password migration, subscriber
sends, or public publishing without later implementation evidence.
