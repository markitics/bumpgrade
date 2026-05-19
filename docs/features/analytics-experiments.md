# Analytics And Experiments

Issues #87, #105, #107, and #119 add the first analytics and experimentation
contract, the first privacy-safe event capture path, the first deterministic
experiment assignment path, and the first aggregate funnel conversion report for
issue #18.

## Live Routes

- `/analytics/source-data`: public-safe JSON for the seeded analytics dashboard.
- `/analytics/indie-launch-dashboard`: crawlable preview for funnel metrics and
  A/B assignment semantics.
- `/api/analytics/events`: public POST endpoint for seeded analytics events.
- `/api/analytics/assignments`: public POST endpoint for seeded experiment
  assignments.

## Current Contract

The first dashboard includes stable IDs for:

- analytics event definitions;
- metric formulas;
- aggregate funnel conversion report rows;
- experiment definitions;
- variants;
- assignment rules.
- aggregate event counts, aggregate assignment counts, seeded event ingestion
  boundaries, and seeded assignment boundaries.

The current write paths store seeded analytics events and seeded experiment
assignments with source-route validation, idempotency, public-safe responses,
hashed request evidence, and aggregate-only public reporting. The current report
path computes visitor, conversion, and conversion-rate rows from captured test
events when samples exist, then falls back to fixture rows only when no samples
exist. These paths do not assign cookies, expose contact-level analytics, expose
raw event or assignment rows, route experiment traffic, make automated
decisions, or prove statistical significance.

## Agent Boundary

Agents may read the source-data route, preview route, event capture boundary,
assignment boundary, and aggregate conversion report rows to understand
analytics and experiment semantics. Direct agent analytics writes, custom
events, campaign attribution mutation, tracking cookies, experiment traffic
routing, reporting decisions, or revenue claims require authenticated
confirmed-write APIs with actor identity, privacy review, idempotency, bot
filtering, stale-state checks, audit correlation, redaction, retention limits,
and sample-size caveats.
