# Analytics And Experiments

Issues #87, #105, #107, #119, #121, #123, #125, #127, and #129 add the first
analytics and experimentation contract, the first privacy-safe event capture
path, the first deterministic experiment assignment path, the first aggregate
funnel conversion report, the first browser-side funnel page-view beacon, the
first aggregate variant and source attribution page-view evidence, and the first
dashboard-visible source attribution breakdown, and fixed aggregate source and
conversion time-window filters for issue #18.

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
falls back to fixture rows only when no samples exist. These paths do not assign
cookies, expose contact-level analytics, expose raw event or assignment rows,
expose raw campaign/referrer payloads, route experiment traffic, make automated
decisions, or prove statistical significance.

## Agent Boundary

Agents may read the source-data route, preview route, event capture boundary,
page-view beacon boundary, dashboard-visible aggregate source attribution
evidence, fixed-window metadata, aggregate variant evidence, assignment
boundary, and aggregate conversion report rows to understand analytics and
experiment semantics. Direct agent analytics writes, custom events, raw
campaign/referrer reporting, tracking cookies, experiment traffic routing,
reporting decisions, or revenue claims require authenticated confirmed-write
APIs with actor identity, privacy review, idempotency, stale-state checks, audit
correlation, redaction, retention limits, and sample-size caveats.
