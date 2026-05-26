# Competitor Importers

Issue #467 tracks Bumpgrade importers for ClickFunnels and adjacent competitor
platforms.

The shipped contract is review-first, with live private create paths for the
dedicated importer pages:

- `/imports` lists supported platform paths.
- Dedicated importer pages explain the platform-specific move.
- `/imports/source-data` exposes platform IDs, competitor IDs, source IDs, input
  kinds, platform-specific source checklists, export-file parser fields, saved
  private plan parts, API routes, safety gates, and known limitations.
- Each dedicated importer page includes a source guide that lists which platform
  URLs, exports, files, and notes Bumpgrade can use before a private import plan
  is created.
- The public `previewApiRoute` listed for each platform returns a redacted import
  review map before sign-in or private draft creation. It summarizes supplied
  source types, platform-specific source-guide readiness, likely review areas,
  draft steps, and safety gates without storing records or echoing pasted copy,
  export file names, customer rows, credentials, sessions, or payment data.
- Preview responses include `sourceChecklistReview` items for each platform
  source guide. They expose ready/needs-context/needs-source status and matched
  signal labels only, not the source URL, export file names, pasted copy, or
  private notes.
- Preview responses include `exportFileAnalysis` when a visitor uploads or
  pastes a small CSV, JSON, HTML, or text export. The parser reports structure,
  safe header groups, counts, and signal labels only; it does not store files or
  echo raw rows, raw file text, file names, private emails, customer values,
  credentials, sessions, or payment data.
- Preview responses include `platformExportMatches` so users and agents can see
  which platform-specific export shapes Bumpgrade recognizes before private
  draft creation. Matches use safe header labels and signal labels only, not raw
  column values or file contents.
- The `apiRoute` listed for each platform lets a verified publisher create or
  reuse a Free Build workspace and save a private import draft after exact
  confirmation and idempotency.
- Private draft responses include `importReview`, which carries the same safe
  `exportFileAnalysis`, `platformExportMatches`, and recognized match IDs into
  private draft metadata so the export shape survives the sign-in handoff
  without storing raw rows, raw file text, customer rows, credentials, or go-live
  effects.
- Private draft responses include `importRecords`, owner-visible structured
  records for matched offer, product, audience, checkout, funnel/page, sequence,
  or asset review areas. They are derived from safe `importReview` metadata and
  store counts, match IDs, safe header labels, safe signal labels, and redaction
  flags only, not raw rows, raw file text, export file names, private emails,
  customer values, credentials, or go-live effects.
- Private import records include `extractedFields`, a safe owner-review field
  plan for Bumpgrade target fields such as offer name, price shape, checkout
  source, product title, subscriber identifier, tag/segment, sequence timing,
  page block outline, or asset source. These fields are derived from safe header
  labels, signal labels, and record kind only; they do not store or expose raw
  row values, raw file text, file names, private emails, customer values,
  credentials, or buyer-facing effects.
- Private audience import records include `subscriberImportDepth`, a safe
  readiness summary for subscriber migration work. It reports aggregate contact
  row counts and safe identity, tag/segment, consent/status, and sequence-context
  signals from headers and source signals only. It does not create subscriber
  rows, store raw contact rows, store raw emails or names, enroll sequences, send
  email, enable private exports, or turn on buyer-facing effects.
- Verified publishers can record `subscriberImportPreflight` on private audience
  import records after reviewing subscriber depth. The preflight decision stores
  readiness or cleanup metadata and acknowledged go-live blockers only; it does
  not create subscriber rows, enroll sequences, send email, enable exports, or
  turn on buyer-facing effects.
- Verified publishers can create private importer subscriber records from a
  confirmed fresh upload or paste after preflight. Those records are scoped to
  the private import plan and can store normalized private subscriber email/name
  data server-side for owner review; public responses expose counts only and do
  not create global audience send-list rows, enroll sequences, send email,
  enable exports, or turn on buyer-facing effects.
- After private subscriber creation, the same verified owner can inspect saved
  importer contacts from the private review page. Public source-data,
  unauthenticated responses, and public agent contracts still expose counts and
  redaction rules only, not contact values.
- The owner can add saved importer contacts to the audience review list after
  exact confirmation. Bumpgrade creates `audience_subscribers` rows with
  `imported_pending_review` status and non-sending tag assignments; it does not
  create consent events, sequence enrollments, sends, exports, or go-live
  effects.
- The private `privateRecordReviewRoute` listed for each platform lets the
  verified publisher who created an import plan inspect those structured records
  and saved private importer subscriber records after creation. The paired review
  action route lets that publisher mark each private record ready or needing
  cleanup with metadata-only review decisions, and edit safe extracted field
  labels, review status, and prompts before cleanup.
  These routes and actions keep raw rows, raw file text, file names, customer
  values, private subscriber emails, payment credentials, sessions, confirmation text,
  idempotency keys, and buyer-facing go-live actions out of public responses.
- Private draft responses include `duplicateReview.status`: `created`,
  `idempotent_replay`, or `source_match_reused`. Source-match reuse is live for
  the same platform, Free Build workspace, normalized title, and normalized
  source URL or normalized export file name.
- The `rollback.route` listed for each platform lets the verified publisher who
  created a private import plan archive that plan while preserving saved content,
  steps, and audit history. Archived importer plans no longer block a fresh
  import from the same source.

Imported material starts in a private Bumpgrade workspace. Public publishing,
live checkout, subscriber sends, domains, and fulfillment remain behind go-live
approval or later confirmed-write APIs.

Current public source-data and API responses intentionally exclude raw exports,
raw file text, raw rows, customer rows, private emails, payment credentials, API
keys, session cookies, private files, pasted source material, export file names,
and account-to-account transfer claims.

Agents can use `/imports/source-data`, `/compare/source-data`, and
`/features/source-data` to answer importer questions, including platform-specific
  source checklist items, export-file parser fields, structured private
  import-record contracts, private record review routes and review action
  routes, and the signal labels used by preview review maps, including
  platform-specific export match templates. They must not claim live
  account transfer, payment migration, customer password migration, subscriber
  sends, or public publishing without later implementation evidence.
