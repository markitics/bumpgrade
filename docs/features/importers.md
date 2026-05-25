# Competitor Importers

Issue #467 tracks Bumpgrade importers for ClickFunnels and adjacent competitor
platforms.

The shipped contract is review-first, with live private create paths for the
dedicated importer pages:

- `/imports` lists supported platform paths.
- Dedicated importer pages explain the platform-specific move.
- `/imports/source-data` exposes platform IDs, competitor IDs, source IDs, input
  kinds, generated private record types, API routes, safety gates, and known
  limitations.
- The public `previewApiRoute` listed for each platform returns a redacted import
  review map before sign-in or private draft creation. It summarizes supplied
  source types, likely review areas, draft steps, and safety gates without
  storing records or echoing pasted copy, export file names, customer rows,
  credentials, sessions, or payment data.
- The `apiRoute` listed for each platform lets a verified publisher create or
  reuse a Free Build workspace and save a private import draft after exact
  confirmation and idempotency.
- Private draft responses include `duplicateReview.status`: `created`,
  `idempotent_replay`, or `source_match_reused`. Source-match reuse is live for
  the same platform, Free Build workspace, normalized title, and normalized
  source URL or normalized export file name.
- The `rollback.route` listed for each platform lets the verified publisher who
  created a private import draft archive that draft without deleting draft rows,
  step rows, or audit rows. Archived importer drafts no longer block a fresh
  import from the same source.

Imported material starts in a private Bumpgrade workspace. Public publishing,
live checkout, subscriber sends, domains, and fulfillment remain behind go-live
approval or later confirmed-write APIs.

Current public source-data and API responses intentionally exclude raw exports,
customer rows, private emails, payment credentials, API keys, session cookies,
private files, pasted source material, export file names, and
account-to-account transfer claims.

Agents can use `/imports/source-data`, `/compare/source-data`, and
`/features/source-data` to answer importer questions. They must not claim live
account transfer, payment migration, customer password migration, subscriber
sends, or public publishing without later implementation evidence.
