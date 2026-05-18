# Analytics And Experiments

Issue #87 adds the first read-only analytics and experimentation contract for
issue #18.

## Live Routes

- `/analytics/source-data`: public-safe JSON for the seeded analytics dashboard.
- `/analytics/indie-launch-dashboard`: crawlable preview for funnel metrics and
  A/B assignment semantics.

## Current Contract

The first dashboard includes stable IDs for:

- analytics event definitions;
- metric formulas;
- fixture funnel-step reports;
- experiment definitions;
- variants;
- assignment rules.

This slice is intentionally read-only. It does not collect live events, assign
cookies, expose contact-level analytics, store raw event rows, make automated
decisions, or prove statistical significance.

## Agent Boundary

Agents may read the source-data route and preview route to understand planned
analytics and experiment semantics. Any future write that touches event
ingestion, visitor assignment, tracking cookies, experiment traffic, reporting
decisions, or revenue claims must require actor identity, privacy review,
idempotency, bot filtering, stale-state checks, audit correlation, redaction,
retention limits, and sample-size caveats.
