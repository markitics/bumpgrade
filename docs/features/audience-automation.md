# Audience Automation

Issue #85 adds the first read-only audience automation contract for issue #17.

## Live Routes

- `/audience/source-data`: public-safe JSON for the seeded audience automation workspace.
- `/audience/indie-launch-waitlist`: crawlable preview for the seeded opt-in and nurture path.

## Current Contract

The first workspace includes stable IDs for:

- subscriber segments;
- subscriber tags;
- lead magnets;
- opt-in forms and fields;
- email sequence steps;
- automation rules and actions;
- broadcast drafts.

This slice is intentionally read-only. It does not store subscribers, import
contacts, send email, schedule broadcasts, manage unsubscribe state, expose
private contact data, or create CRM timeline entries.

## Agent Boundary

Agents may read the source-data route and preview route to understand audience
automation plans. Any future write that touches subscriber data, consent,
tagging, delivery, broadcast scheduling, unsubscribe state, or CRM notes must
require actor identity, explicit consent or lawful basis, idempotency, audit
correlation, stale-state checks, redaction, suppression-list checks, and
sender-domain safety.

Codex project email in issue #10 is separate from customer or publisher email
automation in issue #17.
