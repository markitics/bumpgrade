# Analytics And Experiments

Issues #87 and #105 add the first analytics and experimentation contract plus
the first privacy-safe event capture path for issue #18.

## Live Routes

- `/analytics/source-data`: public-safe JSON for the seeded analytics dashboard.
- `/analytics/indie-launch-dashboard`: crawlable preview for funnel metrics and
  A/B assignment semantics.
- `/api/analytics/events`: public POST endpoint for seeded analytics events.

## Current Contract

The first dashboard includes stable IDs for:

- analytics event definitions;
- metric formulas;
- fixture funnel-step reports;
- experiment definitions;
- variants;
- assignment rules.
- aggregate event counts and seeded event ingestion boundaries.

The current write path stores seeded analytics events with source-route
validation, idempotency, public properties, hashed request evidence, and
aggregate-only public reporting. It does not assign cookies, expose
contact-level analytics, expose raw event rows, route experiment traffic, make
automated decisions, or prove statistical significance.

## Agent Boundary

Agents may read the source-data route, preview route, and event capture
boundary to understand analytics and experiment semantics. Direct agent
analytics writes, custom events, campaign attribution mutation, visitor
assignment, tracking cookies, experiment traffic, reporting decisions, or
revenue claims require authenticated confirmed-write APIs with actor identity,
privacy review, idempotency, bot filtering, stale-state checks, audit
correlation, redaction, retention limits, and sample-size caveats.
