# Admin And Public Surfaces

Bumpgrade should make product state visible to Mark and future agents. These
routes are not optional housekeeping; they are how parallel work stays coherent.

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

## Admin `/admin/roadmap`

Purpose: show the main feature set, status, owners/agents, issue/PR links, and
blockers.

Current implementation note: issue #8 added D1 tables for roadmap, work-log,
user-journey, and Mark-attention records. The pages read D1 when available and
fall back to public-safe code fixtures during local development or before a
fresh database has migrations applied.

Issue #9 added Better Auth as the human admin gate. Browser-rendered admin pages
require an allowlisted owner session. Public-safe `/admin/*/source-data` routes
remain readable by agents and must not contain private notes, secrets, raw
provider identifiers, or private user data.

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
- making a significant decision that future agents should see.

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
and link to an owner-gated private preview route. This is private/admin state.
Public agents should read `/funnels/source-data` for the capability boundary,
not scrape private draft copy. Publishing and checkout-linking are
owner-confirmed; checkout-link deletion, unpublishing, drag-and-drop block
editing, and direct agent edits still need future confirmed-write APIs.

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
evidence, readiness gates, non-destructive import intents, and aggregate import
preflights on top of the public audience automation source contract.

The page reads audience subscriber, consent, tag, sequence, suppression,
timeline, broadcast, readiness, `audience_import_intents`, and
`audience_import_preflights` tables. Verified
owners can inspect private subscriber rows, create private CRM notes, record
dry-run broadcast evidence, inspect sender/provider/Queue readiness gates, and
record import intents and aggregate import preflights after exact confirmation,
idempotency, workspace revision/status checks, and selected import-intent
source-label checks.

Public agents should read `/audience/source-data` for aggregate counts,
redaction flags, and write boundaries. Import intents and import preflights are
not real imports: they do not create contacts, store raw emails or contact rows,
create subscriber rows, create sequence enrollments, export private data, send
email, expose private notes, or authorize direct public agent subscriber writes.

## Admin `/admin/analytics`

Purpose: owner-gated analytics and experiment decision evidence on top of the
public analytics source contract, plus public-safe owner-reviewed cohort
comparison evidence, alert threshold/anomaly-review evidence, and notification
delivery readiness evidence for agents.

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
owner-confirmed dispatch preflight aggregate evidence, and
write boundaries. Experiment decisions, cohort comparisons, threshold reviews,
notification readiness records, notification inbox records, and dispatch preflights are not
traffic routing or customer alerting: they do not assign cookies, route
visitors, send automated alerts, send owner email, call providers, dispatch queues, alert
customers, select automated winners, expose raw event rows, expose raw
assignment rows, expose recipients, expose email bodies, expose provider
message IDs, expose queue payloads, expose contact
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

- `/admin/source-data`
- `/admin/roadmap/source-data`
- `/admin/work-log/source-data`
- `/admin/user-journeys/source-data`
- `/admin/for-mark/source-data`
