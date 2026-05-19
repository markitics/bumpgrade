# Audience Automation

Issues #85 and #103 add the first audience automation contract and the first
consent-backed opt-in capture path for issue #17.

## Live Routes

- `/audience/source-data`: public-safe JSON for the seeded audience automation workspace.
- `/audience/indie-launch-waitlist`: crawlable public opt-in form for the seeded waitlist and nurture path.
- `/api/audience/opt-in`: public POST endpoint for the seeded waitlist form.

## Current Contract

The first workspace includes stable IDs for:

- subscriber segments;
- subscriber tags;
- lead magnets;
- opt-in forms and fields;
- email sequence steps;
- automation rules and actions;
- broadcast drafts.
- subscriber, consent, tag assignment, and draft sequence enrollment write boundaries.

The current write path stores normalized subscriber email, optional first name,
explicit consent evidence, seeded tag assignments, and draft sequence enrollment
evidence for the seeded waitlist. It returns only public-safe confirmation data
plus the normalized submitted email. It does not import contacts, send email,
schedule broadcasts, manage unsubscribe state, expose private contact metadata,
or create CRM timeline entries.

## Agent Boundary

Agents may read the source-data route, preview route, and opt-in write boundary
to understand audience automation state. Direct agent subscriber writes,
imports, email sends, broadcast scheduling, unsubscribe state changes, CRM notes,
or suppression-list mutations require future authenticated confirmed-write APIs
with actor identity, explicit consent or lawful basis, idempotency, audit
correlation, stale-state checks, redaction, suppression-list checks, and
sender-domain safety.

Codex project email in issue #10 is separate from customer or publisher email
automation in issue #17.
