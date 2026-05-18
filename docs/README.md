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
