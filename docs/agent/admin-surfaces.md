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

The page can seed the indie launch working draft, create a new three-step
template draft, update step title/goal/kind, reorder steps, and link to an
owner-gated private preview route. This is private/admin state. Public agents
should read `/funnels/source-data` for the capability boundary, not scrape
private draft copy. Publishing, checkout linking, deletion, public preview, and
direct agent edits still need future confirmed-write APIs.

## Admin `/admin/products`

Purpose: owner-gated product entitlement, checkout, and fulfillment inspection
on top of the public product/access source contract.

Issue #139 added the first owner-only product entitlement inspection surface.
The page reads:

- `product_entitlements`
- `product_fulfillment_tasks`
- `checkout_intents`
- `commerce_products`
- `commerce_prices`

Verified owners can inspect buyer email, checkout status, product/price context,
access rules, and queued fulfillment evidence. Public agents should read
`/products/source-data` for aggregate counts and redaction flags, not scrape or
infer private buyer rows. Issue #141 adds `/products/entitlements` and
`/api/products/entitlements` for customer-safe checkout intent lookup without
buyer emails, hashes, raw Stripe IDs, event IDs, metadata JSON, private R2 keys,
or signed URLs. Issue #143 adds short-lived sandbox download tokens and a
placeholder attachment route for active file entitlements. Private R2-backed
downloads, protected content, revocation, subscription access changes, refunds,
customer portals, private asset delivery, and direct agent entitlement writes
still need future confirmed-write APIs.

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
