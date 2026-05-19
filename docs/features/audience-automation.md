# Audience Automation

Issues #85, #103, #137, #167, and #169 add the first audience automation
contract, the first consent-backed opt-in capture path, owner-gated subscriber
inspection, public-safe unsubscribe/suppression evidence, and owner-only CRM
timeline notes for issue #17.

## Live Routes

- `/audience/source-data`: public-safe JSON for the seeded audience automation workspace.
- `/audience/indie-launch-waitlist`: crawlable public opt-in form for the seeded waitlist and nurture path.
- `/api/audience/opt-in`: public POST endpoint for the seeded waitlist form.
- `/api/audience/unsubscribe`: public POST endpoint for unsubscribe/suppression
  evidence without list-membership leakage.
- `/api/admin/audience/notes`: owner-gated POST endpoint for private CRM
  timeline notes.
- `/admin/audience`: owner-gated subscriber, tag, consent, and draft sequence
  enrollment inspection plus suppression totals and private note context.

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
- unsubscribe/suppression write boundaries;
- owner-only CRM timeline note write boundaries;
- public-safe aggregate subscriber, suppression, and timeline inspection counts and
  redaction flags.

The current opt-in write path stores normalized subscriber email, optional first
name, explicit consent evidence, seeded tag assignments, and draft sequence
enrollment evidence for the seeded waitlist. The unsubscribe path stores hashed
suppression evidence with idempotency, marks a known subscriber unsubscribed,
and returns the submitted normalized email without revealing whether that email
was already on the list. It does not import contacts, send email, schedule
broadcasts, expose private contact metadata, or create CRM timeline entries.

The current owner admin path can inspect recent subscribers, source forms, active
tags, consent counts, draft sequence enrollments, suppression totals, and private
CRM timeline notes from D1. The public `/audience/source-data` route exposes
only aggregate counts and redaction flags; email addresses, names, suppression
hashes, unsubscribe reasons, private note bodies, actor emails, raw
IP/user-agent evidence, and private metadata remain excluded from public
agent-readable JSON.

## Agent Boundary

Agents may read the source-data route, preview route, opt-in write boundary, and
public aggregate subscriber inspection contract to understand audience automation
state, including aggregate suppression counts and the unsubscribe write boundary.
Owner sessions can inspect private contact rows and create private CRM notes in
`/admin/audience`. Direct agent subscriber writes, imports, email sends,
broadcast scheduling, CRM automation, private exports, or suppression-list
administration require future authenticated confirmed-write APIs with actor
identity, explicit consent or lawful basis, idempotency, audit correlation,
stale-state checks, redaction, suppression-list checks, and sender-domain
safety.

Codex project email in issue #10 is separate from customer or publisher email
automation in issue #17.
