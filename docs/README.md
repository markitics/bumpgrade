# Documentation Map

Start here when the docs folder feels too busy. Read the must-read files first,
then open the relevant shelf for the task.

## Must Read For Agents

- `../AGENTS.md`: compact agent entrypoint and hard project rules.
- `working-agreements.md`: durable workflow expectations for Codex, Claude, and
  other agents.
- `agent/agent-ready.md`: how Bumpgrade becomes understandable and operable by
  direct agent clients instead of hidden browser automation.
- `agent/admin-surfaces.md`: expectations for `/features`, `/admin/roadmap`,
  `/admin/work-log`, and `/admin/user-journeys`.
- `agent/codex-mail-workflow.md`: Codex shipped notices, inbound reply routing,
  and inbox polling.
- `agent/pr-screenshots.md`: screenshot storage and PR-link rules.
- `agent/work-log.md`: how to record substantive agent work.
- `agent/user-journeys.md`: how journeys tie back to features and roadmap items.
- `operations.md`: production facts, secrets, migrations, and auth notes.
- `features/content-surfaces.md`: users, resources, pricing, and
  `/content/source-data` content contracts from issue #20.
- `features/funnels.md`: funnel source-data and preview contract from issue #79,
  plus the owner-gated D1 draft builder, step editing, and private preview
  slices from issues #91, #93, and #95.
- `features/checkout-offers.md`: read-only checkout offer, order bump, upsell,
  and downsell source-data contract from issue #81.
- `features/product-access.md`: read-only product, asset, access-rule, and
  entitlement source-data contract from issue #83.
- `features/audience-automation.md`: read-only opt-in, lead magnet, tag,
  sequence, broadcast, and automation source-data contract from issue #85.
- `features/analytics-experiments.md`: read-only event, metric, fixture report,
  variant, and assignment-rule source-data contract from issue #87.
- `features/affiliate-referrals.md`: read-only affiliate program, referral
  link, attribution, commission, payout review, and fraud flag source-data
  contract from issue #89.
- `features/payments.md`: Stripe checkout, D1 commerce tables, webhook, and
  billing-safe agent rules.
- `features/mobile-admin.md`: iOS and Android publisher/admin app planning,
  source-data dependencies, auth boundaries, and confirmed-write rules.
  The first iOS and Android scaffolds live in `apps/mobile-admin/` and publish
  `/mobile-admin/ios/source-data` and `/mobile-admin/android/source-data`.
- `decision-log.md`: durable technical decisions that future agents should not
  rediscover from chat.
- `keep-working/README.md`: how to use the repo-tracked `goal-runner` and
  `status-update` skills.

## Suggested Future Shelves

- `architecture.md`: how the app is built technically.
- `testing.md`: local and CI validation policy.
- `features/`: one short doc per major feature.
- `contracts/`: API, MCP, agent, feature, competitor, commerce, and admin
  contract fixtures.
- `agent-docs/` or `public/agent-docs/`: public model-readable docs.
- `pr-screenshots/`: durable screenshots linked from PR descriptions.

## Reading Rule

Do not read every file before small work. Read the must-read files, then open the
specific docs that match the area you are changing.
