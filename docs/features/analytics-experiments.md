# Analytics And Experiments

Issues #87, #105, #107, #119, #121, #123, #125, #127, #129, #261, and #263 add the first
analytics and experimentation contract, the first privacy-safe event capture
path, the first deterministic experiment assignment path, the first aggregate
funnel conversion report, the first browser-side funnel page-view beacon, the
first aggregate variant and source attribution page-view evidence, and the first
dashboard-visible source attribution breakdown, fixed aggregate source and
conversion time-window filters, owner-confirmed experiment decision evidence,
and aggregate report export metadata for issue #18.

## Live Routes

- `/analytics/source-data`: public-safe JSON for the seeded analytics dashboard.
  Supports `?window=all`, `?window=24h`, `?window=7d`, and `?window=30d` for
  aggregate source and conversion rows.
- `/analytics/indie-launch-dashboard`: crawlable preview for funnel metrics and
  A/B assignment semantics, with a browser-hydrated aggregate source attribution
  panel and fixed-window controls.
- `/api/analytics/events`: public POST endpoint for seeded analytics events.
- `/api/analytics/assignments`: public POST endpoint for seeded experiment
  assignments.
- `/api/admin/analytics/experiment-decisions`: owner-gated GET/POST endpoint for
  confirmed experiment decision evidence.
- `/admin/analytics`: owner-gated page for aggregate experiment decision
  evidence.
- `/funnels/indie-launch-sandbox`: emits a session-idempotent seeded funnel
  page-view event through `/api/analytics/events` with deterministic variant
  evidence from `/api/analytics/assignments` and normalized UTM/source
  attribution when available.

## Current Contract

The first dashboard includes stable IDs for:

- analytics event definitions;
- metric formulas;
- aggregate funnel conversion report rows;
- experiment definitions;
- variants;
- assignment rules.
- aggregate event counts, aggregate variant event counts, aggregate assignment
  counts, aggregate source attribution counts, seeded event ingestion
  boundaries, and seeded assignment boundaries.
- fixed time-window metadata for all-time, 24-hour, 7-day, and 30-day aggregate
  source and conversion summaries.
- browser-side page-view beacon boundaries.
- dashboard-visible source attribution breakdowns.
- owner-confirmed experiment decision counts, latest public-safe decision
  metadata, selected fixed-window evidence, and redaction flags.
- aggregate report export metadata, export sections, and fixture cohort
  comparison definitions.

The current write paths store seeded analytics events and seeded experiment
assignments with source-route validation, idempotency, public-safe responses,
hashed request evidence, and aggregate-only public reporting. The public funnel
preview now records the seeded `event-funnel-page-view` event once per browser
session and funnel step through `sessionStorage` idempotency. It first requests
the seeded deterministic assignment and includes the assigned variant ID in the
page-view event when assignment succeeds. It also includes normalized UTM
fields and a coarse referrer host when present, while excluding raw referrer
URLs and raw query strings. The server ignores known bot/crawler and explicit
preview/test-suppressed traffic before creating analytics event rows. The
current report path computes visitor, conversion, and conversion-rate rows from
captured test events in the selected fixed window when samples exist, then
falls back to fixture rows only when no samples exist. Owner sessions can record
experiment decision evidence only after exact confirmation, idempotency,
dashboard revision checks, experiment status checks, aggregate assignment-count
checks, selected fixed-window evidence, and sample-size caveat acknowledgement.
The current export contract exposes aggregate report section metadata only:
event aggregates, source attribution aggregates, variant aggregates, assignment
aggregates, funnel conversion rows, and experiment decision evidence. These
paths do not assign cookies, expose contact-level analytics, expose raw event or
assignment rows, expose raw campaign/referrer payloads, create raw analytics
exports, route experiment traffic, make automated winner decisions, make revenue
claims, or prove statistical significance.

## Agent Boundary

Agents may read the source-data route, preview route, event capture boundary,
page-view beacon boundary, dashboard-visible aggregate source attribution
evidence, fixed-window metadata, aggregate variant evidence, assignment
boundary, owner-confirmed experiment decision evidence, and aggregate conversion
report rows, and aggregate report export metadata to understand analytics and
experiment semantics. Direct public agent analytics writes, custom events, raw
campaign/referrer reporting, tracking cookies, raw analytics exports, experiment
traffic routing, automated winners, or revenue claims require authenticated
confirmed-write APIs with actor identity, privacy review, idempotency,
stale-state checks, audit correlation, redaction, retention limits, and
sample-size caveats.
