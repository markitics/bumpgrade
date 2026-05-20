# Audience Automation

Issues #85, #103, #137, #167, #169, #171, #173, #175, #177, #183, #189, #191, and #197 add the first audience automation
contract, the first consent-backed opt-in capture path, owner-gated subscriber
inspection, public-safe unsubscribe/suppression evidence, owner-only CRM
timeline notes, broadcast draft readiness, dry-run schedule intents, preview/footer safety, queue readiness, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, and dispatch attempt receipts for issue #17.

## Live Routes

- `/audience/source-data`: public-safe JSON for the seeded audience automation workspace.
- `/audience/indie-launch-waitlist`: crawlable public opt-in form for the seeded waitlist and nurture path.
- `/api/audience/opt-in`: public POST endpoint for the seeded waitlist form.
- `/api/audience/unsubscribe`: public POST endpoint for unsubscribe/suppression
  evidence without list-membership leakage.
- `/api/admin/audience/notes`: owner-gated POST endpoint for private CRM
  timeline notes.
- `/api/admin/audience/broadcasts/schedule-intents`: owner-gated POST endpoint
  for dry-run broadcast schedule intents.
- `/api/admin/audience/broadcasts/delivery-batches`: owner-gated POST endpoint
  for suppression-checked delivery-batch dry runs.
- `/api/admin/audience/broadcasts/delivery-queue-messages`: owner-gated POST
  endpoint for delivery queue message dry-run evidence.
- `/api/admin/audience/broadcasts/dispatch-preflights`: owner-gated POST
  endpoint for dispatch preflight dry-run evidence.
- `/api/admin/audience/broadcasts/dispatch-attempts`: owner-gated POST
  endpoint for dispatch attempt receipt evidence.
- `/admin/audience`: owner-gated subscriber, tag, consent, and draft sequence
  enrollment inspection plus suppression totals, private note context, and
  broadcast readiness, schedule intent context, preview safety context, queue readiness context, delivery-batch context, queue-message context, dispatch preflight context, and dispatch attempt context.

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
- suppression-aware broadcast readiness boundaries;
- owner-confirmed dry-run schedule intent boundaries;
- broadcast preview and unsubscribe-footer safety boundaries;
- delivery queue readiness boundaries;
- owner-confirmed delivery-batch dry-run boundaries;
- owner-confirmed delivery queue message dry-run boundaries;
- owner-confirmed dispatch preflight dry-run boundaries;
- owner-confirmed dispatch attempt receipt boundaries;
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
CRM timeline notes from D1. Issue #171 also stores the seeded broadcast draft in
D1 and calculates readiness from subscriber status, consent evidence, and active
suppression rows without creating send queue rows or provider message IDs. The
owner schedule-intent path stores exact-confirmed dry-run schedule metadata with
idempotency, the expected draft revision, and expected readiness count while
still creating no recipient payloads, send queue rows, or provider message IDs. The
preview safety path stores subject, preview text, body outline, unsubscribe
footer policy, and sender-domain caveat without personalized body text. The
queue readiness path stores queue name, dry-run mode, retry policy, suppression
check policy, unsubscribe footer gate, sender-domain gate, and audit correlation
policy without queue producers, recipient payloads, or provider sends. The
delivery-batch path records owner-confirmed aggregate batch evidence from the
current schedule intent after preview safety, queue readiness, sender-domain
gate, suppression, and stale-state checks while still creating no recipient
payloads, queue messages, provider sends, or provider message IDs. The
delivery queue message path records owner-confirmed aggregate dry-run message
evidence from the current delivery batch after stale-state and dry-run queue
gate checks while still creating no Cloudflare Queue messages, recipient
payloads, provider sends, or provider message IDs. The dispatch preflight path
records owner-confirmed aggregate provider-limit, rate-window, sender-domain,
unsubscribe, suppression, audit-correlation, and queue-dispatch gate evidence
from the current queue-message record while still creating no Cloudflare Queue
messages, recipient payloads, provider sends, or provider message IDs. The
dispatch attempt path records owner-confirmed aggregate queue-producer,
provider-response, and final handoff receipt evidence from the current dispatch
preflight record while still creating no Cloudflare Queue messages, queue
payload bodies, recipient payloads, provider sends, provider responses, or
provider message IDs. The
public `/audience/source-data` route exposes only aggregate counts and redaction
flags; email addresses, names, suppression hashes, unsubscribe reasons, private
note bodies, actor emails, recipient payloads, provider message IDs, provider
responses, Cloudflare Queue message bodies, send queue payloads, raw IP/user-agent evidence, and
private metadata remain excluded from public agent-readable JSON.

## Agent Boundary

Agents may read the source-data route, preview route, opt-in write boundary, and
public aggregate subscriber inspection contract to understand audience automation
state, including aggregate suppression counts, broadcast readiness counts, and
schedule intent counts, plus preview safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, and the unsubscribe write boundary.
Owner sessions can inspect private contact rows and create private CRM notes in
`/admin/audience`, inspect broadcast readiness, and record dry-run schedule
intents. They can also inspect preview/footer safety and queue readiness and
record delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, and dispatch attempt receipts without sending. Direct agent subscriber
writes, imports, real email sends, CRM automation, private
exports, or suppression-list administration require future authenticated
confirmed-write APIs with actor identity, explicit consent or lawful basis,
idempotency, audit correlation, stale-state checks, redaction, suppression-list
checks, unsubscribe footer validation, provider limits, sender-domain safety, and queue safety.

Codex project email in issue #10 is separate from customer or publisher email
automation in issue #17.
