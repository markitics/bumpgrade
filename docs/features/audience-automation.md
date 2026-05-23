# Audience Automation

Issues #85, #103, #137, #167, #169, #171, #173, #175, #177, #183, #189, #191, #197, #199, #201, #203, #205, #207, #209, #211, #253, #259, #347, #351, #354, and #358 add the first audience automation
contract, the first consent-backed opt-in capture path, owner-gated subscriber
inspection, public-safe unsubscribe/suppression evidence, owner-only CRM
timeline notes, broadcast draft readiness, dry-run schedule intents, dry-run sequence delivery batches, preview/footer safety, queue readiness, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed audience import intents, owner-confirmed audience import preflights, aggregate export readiness, and aggregate sequence delivery readiness for issue #17.

## Live Routes

- `/audience/source-data`: public-safe JSON for the seeded audience automation workspace.
- `/audience/indie-launch-waitlist`: crawlable public opt-in form for the seeded waitlist and nurture path.
- `/api/audience/opt-in`: public POST endpoint for the seeded waitlist form.
- `/api/audience/unsubscribe`: public POST endpoint for unsubscribe/suppression
  evidence without list-membership leakage.
- `/api/admin/audience/notes`: owner-gated POST endpoint for private CRM
  timeline notes.
- `/api/admin/audience/sequences/schedule-intents`: owner-gated POST endpoint
  for dry-run sequence schedule intents.
- `/api/admin/audience/sequences/delivery-batches`: owner-gated POST endpoint
  for dry-run sequence delivery-batch evidence.
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
- `/api/admin/audience/import-intents`: owner-gated GET/POST endpoint for
  exact-confirmed, non-destructive audience import intent metadata.
- `/api/admin/audience/import-preflights`: owner-gated GET/POST endpoint for
  exact-confirmed, aggregate import preflight evidence tied to an import intent.
- `/admin/audience`: owner-gated subscriber, tag, consent, and draft sequence
  enrollment inspection plus suppression totals, private note context, and
  broadcast readiness, schedule intent context, sequence delivery-batch context, preview safety context, queue readiness context, delivery-batch context, queue-message context, dispatch preflight context, dispatch attempt context, send-payload readiness context, Queue producer readiness context, Queue consumer readiness context, import-intent context, import-preflight context, export-readiness context, and sequence delivery readiness context.

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
- owner-confirmed sequence schedule-intent write boundaries;
- owner-confirmed sequence delivery-batch dry-run boundaries;
- suppression-aware broadcast readiness boundaries;
- owner-confirmed dry-run schedule intent boundaries;
- broadcast preview and unsubscribe-footer safety boundaries;
- delivery queue readiness boundaries;
- owner-confirmed delivery-batch dry-run boundaries;
- owner-confirmed delivery queue message dry-run boundaries;
- owner-confirmed dispatch preflight dry-run boundaries;
- owner-confirmed dispatch attempt receipt boundaries;
- sender-domain readiness boundaries;
- provider-event readiness boundaries;
- provider rate-limit readiness boundaries;
- provider response readiness boundaries;
- send-payload readiness boundaries;
- Queue producer readiness boundaries;
- Queue consumer readiness boundaries;
- owner-confirmed import-intent write boundaries;
- owner-confirmed import-preflight write boundaries;
- aggregate export-readiness boundaries;
- aggregate sequence-delivery readiness boundaries;
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
provider message IDs. The sender-domain readiness path records the intended
From address, SPF/DKIM/DMARC alignment state, reply-path policy, bounce-handling
policy, and verification evidence status while still creating no Cloudflare Queue
producers, recipient payloads, provider sends, provider responses, or provider
message IDs. The provider-event readiness path records bounce, complaint,
delivery-event, suppression-update, audit-correlation, and raw-payload storage
policies while still storing no raw provider payloads, provider secrets,
recipient payloads, provider responses, or provider message IDs. The provider
rate-limit readiness path records throttle-window, daily-limit, burst-limit,
retry/backoff, queue-backpressure, and provider-limit policies while still
storing no provider limit secrets, raw provider payloads, recipient payloads,
provider responses, or provider message IDs. The provider response readiness
path records accepted, transient failure, permanent failure, retry decision,
message-id storage, response-body storage, and audit-correlation policies while
still storing no provider secrets, raw response bodies, recipient payloads,
provider responses, or provider message IDs. The send-payload readiness path
records payload scope, recipient identity, unsubscribe footer,
consent/suppression recheck, personalization token, payload body storage, and
audit-correlation policies while still creating no recipient payloads,
personalized bodies, raw payload bodies, provider sends, provider responses, or
provider message IDs. The Queue producer readiness path records binding, producer mode, payload dependency, consumer dependency, idempotency, audit-correlation, and backpressure policies while still enabling no Cloudflare Queue producers, Queue messages, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs. The Queue consumer readiness path records consumer mode, producer dependency, payload dependency, ack, retry, dead-letter, idempotency, audit-correlation, and provider-handoff policies while still enabling no Cloudflare Queue consumers, Queue message consumption, acks, retry/dead-letter rows, queue payload body reads, recipient payloads, provider sends, provider responses, or provider message IDs. The
import-intent path records owner-confirmed source kind, aggregate estimated
contact/update/suppression counts, workspace revision/status expectations,
idempotency evidence, actor hash, and private-note hash while still creating no
subscribers, raw contact rows, raw emails, sequence enrollments, exports, or
sends. The import-preflight path records owner-confirmed aggregate eligibility,
duplicate, suppression, consent, malformed-row, and lawful-basis counts against
a selected import intent while still creating no subscribers, raw contact rows,
raw emails, sequence enrollments, exports, or sends. The sequence delivery
readiness path exposes aggregate draft enrollment, paused/unsubscribed hold, and
sequence-step counts while still enabling no email delivery, recipient payloads,
personalized bodies, body templates, unsubscribe URLs, Queue payloads, provider
IDs, or send/export URLs. The
sequence delivery-batch path records owner-confirmed aggregate batch evidence
from a current sequence schedule intent while still creating no delivery queue
rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends,
or provider message IDs. The
public `/audience/source-data` route exposes only aggregate counts and redaction
flags; email addresses, names, suppression hashes, unsubscribe reasons, private
note bodies, actor emails, private DNS credentials, raw DNS records, provider
secrets, provider limit secrets, raw provider payloads, raw provider response bodies, recipient payloads, personalized bodies, body templates, unsubscribe URLs, provider IDs, send URLs, export URLs, raw payload bodies, raw import rows, raw import emails, import private notes, actor email hashes, provider message IDs, provider responses,
Cloudflare Queue message bodies, Queue payloads, Queue consumer ack/retry/dead-letter rows, send queue payloads, raw IP/user-agent evidence,
and private metadata remain excluded from public agent-readable JSON.

## Agent Boundary

Agents may read the source-data route, preview route, opt-in write boundary, and
public aggregate subscriber inspection contract to understand audience automation
state, including aggregate suppression counts, broadcast readiness counts, and
schedule intent counts, plus sequence delivery-batch dry runs, preview safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, sender-domain readiness, provider-event readiness, provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness, Queue consumer readiness, import-intent counts, import-preflight counts, export-readiness counts, sequence delivery readiness counts, and the unsubscribe/import-intent/import-preflight write boundaries.
Owner sessions can inspect private contact rows and create private CRM notes in
`/admin/audience`, inspect broadcast readiness, and record dry-run schedule
intents and sequence delivery-batch dry runs. They can also inspect preview/footer safety and queue readiness and
record delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, non-destructive import intents, and aggregate import preflights without sending or importing. Sender-domain readiness stays read-only until a future provider setup flow verifies SPF/DKIM/DMARC and bounce handling. Provider-event readiness stays read-only until future provider webhooks can normalize events, update suppression state, redact raw payloads, and preserve audit correlation. Provider rate-limit readiness stays read-only until future provider setup can enforce throttle windows, retry budgets, and queue backpressure. Provider response readiness stays read-only until future provider send handling can capture response classes without raw bodies. Send-payload readiness stays read-only until future Queue producers create recipient payloads with consent, suppression, unsubscribe footer, and audit gates. Queue producer readiness stays read-only until future producer and consumer flows can enforce idempotency, backpressure, payload, and audit gates. Queue consumer readiness stays read-only until future consumers can enforce ack, retry, dead-letter, provider handoff, payload, and audit gates. Direct agent subscriber
writes, real imports, real email sends, sequence delivery, CRM automation, private
exports, or suppression-list administration require future authenticated
confirmed-write APIs with actor identity, explicit consent or lawful basis,
idempotency, audit correlation, stale-state checks, redaction, suppression-list
checks, unsubscribe footer validation, provider limits, sender-domain safety, provider-event safety, provider rate-limit safety, provider response safety, send-payload safety, Queue producer safety, Queue consumer safety, and queue safety.

Codex project email in issue #10 is separate from customer or publisher email
automation in issue #17.
