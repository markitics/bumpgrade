# Audience Automation

Issues #85, #103, and #137 add the first audience automation contract, the first
consent-backed opt-in capture path, and owner-gated subscriber inspection for
issue #17.

## Live Routes

- `/audience/source-data`: public-safe JSON for the seeded audience automation workspace.
- `/audience/indie-launch-waitlist`: crawlable public opt-in form for the seeded waitlist and nurture path.
- `/api/audience/opt-in`: public POST endpoint for the seeded waitlist form.
- `/admin/audience`: owner-gated subscriber, tag, consent, and draft sequence
  enrollment inspection.

## Current Contract

The first workspace includes stable IDs for:

- subscriber segments;
- subscriber tags;
- lead magnets;
- opt-in forms and fields;
- email sequence steps;
- automation rules and actions;
- broadcast drafts.
- subscriber, consent, tag assignment, and draft sequence enrollment write boundaries;
- public-safe aggregate subscriber inspection counts and redaction flags.

The current write path stores normalized subscriber email, optional first name,
explicit consent evidence, seeded tag assignments, and draft sequence enrollment
evidence for the seeded waitlist. It returns only public-safe confirmation data
plus the normalized submitted email. It does not import contacts, send email,
schedule broadcasts, manage unsubscribe state, expose private contact metadata,
or create CRM timeline entries.

The current owner admin path can inspect recent subscribers, source forms, active
tags, consent counts, and draft sequence enrollments from D1. The public
`/audience/source-data` route exposes only aggregate counts and redaction flags;
email addresses, names, raw IP/user-agent evidence, and private metadata remain
excluded from public agent-readable JSON.

## Agent Boundary

Agents may read the source-data route, preview route, opt-in write boundary, and
public aggregate subscriber inspection contract to understand audience automation
state. Owner sessions can inspect private contact rows in `/admin/audience`.
Direct agent subscriber writes, imports, email sends, broadcast scheduling,
unsubscribe state changes, CRM notes, private exports, or suppression-list
mutations require future authenticated confirmed-write APIs with actor identity,
explicit consent or lawful basis, idempotency, audit correlation, stale-state
checks, redaction, suppression-list checks, and sender-domain safety.

Codex project email in issue #10 is separate from customer or publisher email
automation in issue #17.
