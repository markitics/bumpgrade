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
