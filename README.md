# Bumpgrade

Bumpgrade is planned as a Cloudflare-first funnel, checkout, commerce, and
agent-ready platform for indiepreneurs and small publishers. The initial target
is feature parity with ClickFunnels, SamCart, Kit, Shopify-style comparison
surfaces, and adjacent creator-commerce platforms, followed by agent-native
workflows on top.

## Current Phase

Phase 1 is project setup, competitor research, issue decomposition, and public
marketing/admin surface scaffolding. No production functionality should be
claimed as live until it is implemented, deployed, and verified.

## Build Direction

- Infrastructure: Cloudflare Workers/Pages, D1, R2, KV, Queues/Cron, Email
  Routing/Sending, Turnstile, and Better Auth where useful.
- Public surfaces: `/features`, `/compare`, competitor alternative pages,
  `/roadmap`, resources, pricing, and agent-readable docs.
- Admin surfaces: `/admin/roadmap`, `/admin/work-log`,
  `/admin/user-journeys`, and `/admin/for-mark`.
- Agent contract: public `llms.txt`, `/agent-docs/...`, stable server-side
  manifests/APIs, and MCP tools as workflows become important.

## Agent Workflow

Start with [AGENTS.md](./AGENTS.md), then read
[docs/working-agreements.md](./docs/working-agreements.md). Use GitHub issues,
feature branches, small commits, PR screenshots, squash merges, and work-log
entries as the durable source of truth.
