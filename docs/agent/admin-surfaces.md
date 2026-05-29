# Admin And Public Surfaces

Bumpgrade should make product state visible to the Bumpgrade owner and
Bumpgrade agents. These routes are not optional housekeeping; they are how
parallel work stays coherent.

## Public `/features`

Purpose: show major public features that are live or planned.

Each feature card or row should include:

- feature name;
- short human-readable value proposition;
- status badge: `live` or `pending`;
- production URL when live;
- roadmap issue links when pending;
- user journey links when available;
- last meaningful update date.

Rules:

- If a feature is live in production, badge it `live`.
- If a feature is planned but not live, badge it `pending` and link roadmap
  item(s).
- Do not claim a feature is live because code merged. Verify production.
- Keep copy public-safe. Do not expose admin details, private notes, or secrets.

## Admin `/admin/director`

Purpose: give the owner a director-level one-pager above the work-log noise. The
page groups roadmap, work-log, and owner-attention evidence into expandable
workstreams such as Marketing, Product / Commerce, Audience / Email,
Analytics / Growth, Mobile Admin, Agent Readiness, Security / Trust,
Infrastructure, and Operations / Project Control.

Use this page for "what changed in the past day/week", "what is in flight",
"what is blocked or at risk", and "what needs owner action". Treat
`/admin/work-log` as the audit trail behind the director summary.

Each recent-change window should include both counts and a compact digest of the
named work-log changes in that window. Agents should cite those digest records
for executive summaries, then link to `/admin/work-log` when the audit trail is
needed.

Each workstream should also expose a stable `brief` object in
`/agent-docs/director-status-source-data`. The legacy
`/admin/director/source-data` route exposes the same payload for compatibility.
The brief is the CMO/CISO/product-lead level
summary: due item, in-flight item, next pending item, latest 7-day change, and
watchlist item. The browser should show those signals while the workstream row is
collapsed, then reveal issue/PR/source evidence when expanded.

The browser view should stay compact by default: workstream rows are expandable,
but only rows with current owner action or blockers should open automatically.
At-risk/high-churn workstreams should remain visible in summary counts without
turning the one-pager into another long audit report.

Issue #448 adds a first-read briefing layer above the detailed rows. The
browser and source-data contract should expose four stable controls: `Past 1
day`, `Past 7 days`, `Executive queue`, and `Workstream map`. Use these controls
when the owner asks what changed recently or wants the CMO/CISO/product-lead
summary without reading every individual work-log entry.

The director source-data route also exposes an `executiveQueue` with stable
lanes for `due-now`, `in-flight`, `pending-next`, and `watchlist`. Each queue
item keeps its workstream ID/title and evidence links so agents and mobile
dashboards can show the CEO-level queue without flattening Marketing, Security,
Operations, Product, or other major categories. `due-now` is intentionally
stateful: it comes from open/read owner-attention records, blocked roadmap items,
and non-live roadmap `markAttention` records. Historical work-log
`flagsAttention` rows stay in recent-change and window evidence, but they should
not inflate current due-now decisions. `markAttention` on already-live roadmap
items belongs in `watchlist` so informational caveats stay visible without being
presented as due today.

## Admin `/admin/roadmap`

Purpose: show the main feature set, status, owners/agents, issue/PR links, and
blockers.

Current shipped boundary: issue #8 added D1 tables for roadmap, work-log,
user-journey, and owner-attention records. The pages read D1 when available and
fall back to public-safe code fixtures during local development or before a
fresh database has migrations applied.

Issue #9 added Better Auth as the human admin gate. Browser-rendered admin pages
require an allowlisted owner session. Public-safe `/agent-docs/*-source-data`
aliases are the preferred agent and crawler discovery routes for admin-derived
project state. Legacy `/admin/*/source-data` routes remain direct JSON endpoints
for compatibility and must not contain private notes, secrets, raw provider
identifiers, or private user data.
The sitemap and `robots.txt` mirror this boundary: public-safe `/agent-docs`
source-data aliases are crawlable, while owner-gated admin UI pages stay
disallowed and are not listed in the sitemap.

Recommended status values:

- `idea`: useful concept, not committed.
- `pending`: committed but not active.
- `active`: branch, PR, or agent is working it now.
- `blocked`: cannot progress without a named unblocker.
- `live`: verified in production.
- `parked`: intentionally deferred.

Every main roadmap item should link to:

- GitHub issue(s);
- active branch or PR when present;
- `/features` entry when public-facing;
- `/admin/user-journeys` entries when user-facing;
- `/admin/work-log` entries after meaningful work.

## Admin `/admin/work-log`

Purpose: durable diary of how agents used their time.

The browser view supports time-window filtering with `/admin/work-log`,
`/admin/work-log?window=past-1-day`, and
`/admin/work-log?window=past-7-days`. Use the filtered browser view when Mark
asks what changed recently; use `/agent-docs/project-work-log-source-data` for
agent-side audit reads.

Append public-safe work-log rows with:

```bash
npm run work-log:add -- --file /tmp/work-log-entry.json
```

Use it after:

- shipping a feature;
- merging a PR;
- closing or moving a roadmap item;
- finishing a long work burst;
- parking an important blocker;
- making a significant decision that Bumpgrade agents should see.

See `docs/agent/work-log.md` for the entry shape.

## Admin `/admin/user-journeys`

Purpose: tie product behavior to actual user goals.

Every main feature should have at least one journey. Each journey should include:

- journey name;
- linked feature(s);
- primary user or role;
- user goal;
- source evidence involved, if any;
- happy path;
- edge/error states;
- validation evidence;
- GitHub issue/PR links.

See `docs/agent/user-journeys.md` for the template.

## Admin `/admin/funnels`

Purpose: owner-gated draft funnel creation, step editing, and private preview on
top of the public funnel source contract.

Issue #91 added the first D1-backed draft tables:

- `funnel_drafts`
- `funnel_draft_steps`
- `funnel_audit_events`

The page can seed the indie launch working draft, create a new generic draft,
create a private draft from a reusable template after exact confirmation, update
step title/goal/kind, reorder steps, attach the seeded sandbox checkout offer to
a private checkout block after exact confirmation and a fresh revision check,
unlink checkout metadata from a private draft block after exact confirmation and
a fresh revision check, move existing blocks up or down within the same draft
step after idempotency and a fresh revision check, drag/drop existing blocks
through the same owner-session move endpoint modes, move existing blocks across
steps after idempotency and a fresh revision check, link resource/delivery blocks to product access assets
after exact confirmation and a fresh revision check, set bounded canvas layout
values for existing blocks after idempotency and a fresh revision check, publish a draft after exact
confirmation, archive private drafts, unpublish public draft routes by archiving
them, and link to an owner-gated private preview route. This is private/admin state. Public agents should read
`/funnels/source-data` for the capability boundary, not scrape private draft
copy. Publishing, checkout-linking, checkout-unlinking, resource delivery
linking, bounded canvas layout, within-step block reordering, drag/drop block placement, cross-step block moves, and archive/unpublish lifecycle actions are owner-confirmed; physical
deletion, arbitrary uploaded private asset delivery, signed URL
creation, live fulfillment automation, webinar integrations, direct agent-created
delivery tokens, and direct agent edits still need future confirmed-write APIs.
Published resource-linked blocks can mint short-lived Bumpgrade download routes
through `/api/funnels/resource-delivery` only after checkout intent and
entitlement scope match the linked product and file asset.

## Admin `/admin/products`

Purpose: owner-gated product entitlement, checkout, and fulfillment inspection
on top of the public product/access source contract.

Issue #139 added the first owner-only product entitlement inspection surface.
The page reads:

- `product_entitlements`
- `product_fulfillment_tasks`
- `product_entitlement_revocation_intents`
- `product_protected_content_sections`
- `checkout_intents`
- `commerce_products`
- `commerce_prices`

Verified owners can inspect buyer email, checkout status, product/price context,
access rules, queued fulfillment evidence, and revocation intent records.
Issue #181 also lets owners inspect protected content readiness without
delivering protected bodies.
Public agents should read
`/products/source-data` for aggregate counts and redaction flags, not scrape or
infer private buyer rows. Issue #141 adds `/products/entitlements` and
`/api/products/entitlements` for customer-safe checkout intent lookup without
buyer emails, hashes, raw Stripe IDs, event IDs, metadata JSON, private R2 keys,
or signed URLs. Issue #143 adds one-use download tokens for active file
entitlements. Issue #146 streams a seeded private R2-backed fixture through
Bumpgrade without exposing object keys or signed URLs. Issue #147 revalidates
current entitlement status, checkout intent linkage, trusted checkout state, and
asset scope before token redemption. Issue #151 records owner-confirmed private
asset upload intents without customer delivery. Issue #179 records
non-destructive revocation intent readiness. Issue #251 records owner-confirmed,
non-destructive revocation intent records after exact confirmation, idempotency,
and stale-state checks, without removing access. Issue #181 records protected
content readiness without lesson bodies, member posts, progress rows, private R2
keys, or signed URLs. Protected content delivery, arbitrary asset delivery,
destructive revocation,
subscription access changes, refunds, customer portals, and direct agent
entitlement writes still need future confirmed-write APIs.

## Admin `/admin/audience`

Purpose: owner-gated audience inspection, private CRM notes, broadcast dry-run
evidence, readiness gates, aggregate sequence delivery readiness, dry-run
sequence schedule intents, dry-run sequence delivery batches, dry-run sequence
queue-message evidence,
non-destructive import intents, and aggregate import preflights on top of the
public audience automation source contract.

The page reads audience subscriber, consent, tag, sequence, suppression,
timeline, broadcast, readiness, `audience_sequence_schedule_intents`,
`audience_sequence_delivery_batches`,
`audience_sequence_delivery_queue_messages`, `audience_import_intents`, and
`audience_import_preflights` tables. Verified
owners can inspect private subscriber rows, create private CRM notes, record
dry-run sequence and broadcast evidence, inspect sender/provider/Queue readiness gates, and
record import intents and aggregate import preflights after exact confirmation,
idempotency, workspace revision/status checks, and selected import-intent
source-label checks. Sequence delivery readiness stays aggregate-only and does
not create schedules, recipient payloads, body templates, unsubscribe URLs,
queue payloads, provider sends, or provider message IDs.
Sequence queue-message dry runs stay aggregate-only and do not create Cloudflare
Queue messages, queue payload bodies, delivery queue rows, recipient payloads,
personalized bodies, unsubscribe URLs, provider responses, or provider message
IDs.

Public agents should read `/audience/source-data` for aggregate counts,
redaction flags, and write boundaries. Import intents and import preflights are
not real imports: they do not create contacts, store raw emails or contact rows,
create subscriber rows, create sequence enrollments, export private data, send
email, expose private notes, schedule sequence steps, or authorize direct public
agent subscriber writes.

## Admin `/admin/analytics`

Purpose: owner-gated analytics and experiment decision evidence on top of the
public analytics source contract, plus public-safe owner-reviewed cohort
comparison evidence, alert threshold/anomaly-review evidence, and notification
delivery readiness evidence, plus content/consent, send-payload,
queue-producer, and queue-consumer readiness evidence for agents.

The page reads aggregate assignment counts, fixed-window conversion sample
sizes, the seeded experiment definition, and `analytics_experiment_decisions`
records. Verified owners can record decision evidence after exact confirmation,
idempotency, dashboard revision checks, experiment status checks, aggregate
count checks, selected fixed-window evidence, and sample-size caveat
acknowledgement.

Public agents should read `/analytics/source-data` for aggregate counts,
redaction flags, owner-reviewed cohort comparison evidence, owner-reviewed
alert threshold/anomaly-review evidence, owner-reviewed notification delivery
readiness evidence, owner-confirmed notification inbox aggregate evidence,
owner-confirmed dispatch preflight aggregate evidence, owner-reviewed
provider/domain readiness aggregate evidence, owner-reviewed content/consent
readiness aggregate evidence, owner-reviewed send-payload readiness aggregate
evidence, owner-reviewed queue-producer readiness aggregate evidence,
owner-reviewed queue-consumer readiness aggregate evidence, and write
boundaries. Experiment
decisions, cohort comparisons, threshold reviews, notification readiness
records, notification inbox records, dispatch preflights, provider/domain
readiness records, content/consent readiness records, send-payload
readiness records, queue-producer readiness records, and queue-consumer
readiness records are not traffic
routing or customer alerting: they do not
assign cookies, route visitors, send automated alerts, send owner email,
configure providers, store provider secrets, store sender credentials, expose
private DNS credentials, call providers, enable Queue producers, enable Queue
consumers, dispatch queues, alert customers, create queue messages, consume or
acknowledge queue messages, create retry/dead-letter rows, read queue payload
bodies, create queue payload bodies, create recipient payloads, create
personalized bodies, store raw payload bodies, select automated winners, expose raw event rows, expose raw
assignment rows, expose recipients, expose email bodies, expose provider
message IDs, expose queue payloads, expose body templates, expose unsubscribe
URLs, expose contact
analytics, or make revenue claims.

## Agent Maintenance Rule

When any of these change, update the others in the same PR when practical:

- feature status changes;
- roadmap status changes;
- user journey created or altered;
- agent capability added;
- production route deployed;
- work-log entry created.

If keeping them in sync is too much for the current PR, create a follow-up issue
before merging.

## Source Data

Agents can read the current public-safe admin records from:

- `/agent-docs/director-status-source-data`
- `/agent-docs/project-source-data`
- `/agent-docs/project-roadmap-source-data`
- `/agent-docs/project-work-log-source-data`
- `/agent-docs/user-journey-source-data`
- `/agent-docs/owner-attention-source-data`

Legacy compatibility routes remain direct JSON endpoints:

- `/admin/director/source-data`
- `/admin/source-data`
- `/admin/roadmap/source-data`
- `/admin/work-log/source-data`
- `/admin/user-journeys/source-data`
- `/admin/for-mark/source-data`
