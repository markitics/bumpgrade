# Competitor Importers

Issue #467 tracks Bumpgrade importers for ClickFunnels and adjacent competitor
platforms.

The first shipped contract is review-first:

- `/imports` lists supported platform paths.
- `/imports/clickfunnels` is the first dedicated importer page.
- `/imports/source-data` exposes platform IDs, competitor IDs, source IDs, input
  kinds, generated private record types, safety gates, and known limitations.

Imported material starts in a private Bumpgrade workspace. Public publishing,
live checkout, subscriber sends, domains, and fulfillment remain behind go-live
approval or later confirmed-write APIs.

Current public source-data intentionally excludes raw exports, customer rows,
private emails, payment credentials, API keys, session cookies, private files,
and account-to-account transfer claims.

Agents can use `/imports/source-data`, `/compare/source-data`, and
`/features/source-data` to answer importer questions. They must not claim live
account transfer, payment migration, customer password migration, subscriber
sends, or public publishing without later implementation evidence.
