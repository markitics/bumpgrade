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
- `features/checkout-offers.md`: checkout offer, order bump, upsell, and
  downsell source-data contract from issue #81 plus the confirmed sandbox
  checkout start and constrained order-bump path from issue #99, with optional
  referral-click attribution evidence from issue #111 and review-only commission
  ledger evidence from issue #113 plus owner review/reversal actions from issue
  #115 and non-billing post-purchase decision evidence from issue #117.
- `features/product-access.md`: product, asset, access-rule, entitlement, and
  sandbox webhook grant contract from issues #83 and #101.
- `features/audience-automation.md`: opt-in, lead magnet, tag, sequence,
  broadcast, automation, consent, seeded subscriber capture, owner subscriber
  inspection, suppression, CRM notes, broadcast readiness, preview safety,
  queue readiness, delivery-batch, queue-message, dispatch-preflight, and
  dispatch-attempt, sender-domain readiness, provider-event readiness,
  provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness,
  Queue consumer readiness, and owner-confirmed import intent
  contracts from issues #85, #103, #137, #167, #169, #171, #173, #175, #177,
  #183, #189, #191, #197, #199, #201, #203, #205, #207, #209, #211, and
  #253.
- `features/analytics-experiments.md`: event, metric, aggregate conversion
  report, variant, assignment-rule, aggregate count, seeded event capture,
  browser-side page-view beacon, aggregate source attribution evidence,
  dashboard source attribution breakdown, aggregate variant evidence, and seeded
  assignment contract from issues #87, #105, #107, #119, #121, #123, #125,
  #127, and #129, including fixed all-time, 24-hour, 7-day, and 30-day
  aggregate source/conversion windows.
- `features/affiliate-referrals.md`: affiliate program, referral link, click
  capture, checkout attribution evidence, review-only commission ledger, payout
  review, owner review/reversal actions, public-safe partner reports, read-only
  payout preparation, and fraud flag source-data contract from issues #89, #109,
  #111, #113, #115, #193, and #195.
- `features/payments.md`: Stripe checkout, D1 commerce tables, webhook, and
  billing-safe agent rules.
- `features/mobile-admin.md`: iOS and Android publisher/admin app planning,
  source-data dependencies, auth boundaries, and confirmed-write rules.
  The first iOS and Android scaffolds live in `apps/mobile-admin/`; mobile
  source-data now includes `/mobile-admin/dashboard/source-data`,
  `/mobile-admin/ios/source-data`, and `/mobile-admin/android/source-data`.
- `features/publisher-tenants.md`: paid publisher tenant setup, default
  Bumpgrade subdomain reservation, existing-domain DNS onboarding, and
  publisher-site auth boundary from issues #221-#224.
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
