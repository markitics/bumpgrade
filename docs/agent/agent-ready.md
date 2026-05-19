# Agent-Ready Bumpgrade

Bumpgrade should be understandable and operable by agents from the beginning.
Agent readiness is a product surface beside the human web app and admin UI.

The practical goal: Mark should be able to ask Claude Code, ChatGPT, or Codex
something like "compare Bumpgrade to ClickFunnels for a course creator" or
"draft an upsell funnel for this offer" and the agent should know where to find
source evidence, how to cite it, what it is allowed to do, and how to avoid
inventing facts.

## Default Architecture

Build in this order:

1. Human-facing pages and admin workflows.
2. Stable server-side data contracts for the same concepts.
3. Public model-readable docs: `public/llms.txt` and `/agent-docs/...`.
4. Agent manifests and HTTP APIs for important reads.
5. MCP tools/resources for repeated agent workflows.
6. ChatGPT app, Claude-specific workflows, or CLI affordances on top of the same
   contracts.

Do not create separate semantics for each client. Web, admin, MCP, ChatGPT, and
Claude workflows should all describe the same underlying product contract.

## Source Evidence And Commerce Objects

If Bumpgrade has feature records, competitor research, offers, funnels, checkout
flows, products, subscriptions, customers, testimonials, blog claims, or agent
actions, make them first-class data.

Recommended stable concepts:

- `featureId`: stable id for a public or admin feature.
- `roadmapItemId`: stable id for planned, active, blocked, or shipped work.
- `competitorId`: stable id for a competitor or alternative page.
- `sourceId`: stable id for a cited source, page, doc, or screenshot.
- `sourceUrl`: canonical URL for evidence.
- `claimId`: stable id for a specific product, pricing, SEO, or comparison
  claim.
- `funnelId`: stable id for a funnel.
- `offerId`: stable id for an offer, bump, upsell, or bundle.
- `checkoutId`: stable id for a checkout experience.
- `checkoutIntentId`: stable id for an idempotent checkout-start request.
- `productId`: stable id for a digital product, membership, service, or event.
- `priceId`: stable id for a Bumpgrade price record; Stripe Price ids stay
  provider metadata.
- `subscriptionPlanId`: stable id for pricing/billing plans.
- `affiliateProgramId`: stable id for affiliate/referral programs.
- `referralLinkId`: stable id for partner referral links and attribution.
- `commissionRuleId`: stable id for commission terms.
- `commissionLedgerId`: stable id for auditable commission fixtures or records.
- `automationId`: stable id for workflows, emails, reminders, and agent tasks.
- `agentActionId`: stable id for agent-proposed or agent-executed writes.
- `provenance`: where the fact or object came from and who/what generated it.

Rules:

- Do not invent pricing, quotes, customers, endorsements, integrations,
  competitor capabilities, roadmap status, or shipped product behavior.
- Agent answers about public claims must cite stable IDs and source URLs when
  available.
- Competitive research should record retrieval date, source URL, and confidence
  level when facts may change.
- Generated marketing copy should be marked as generated or draft until reviewed
  where it could be mistaken for a sourced claim.
- Keep private notes, unpublished revenue data, raw customer data, provider IDs,
  secrets, and restricted sources out of public agent docs.
- Billing and fulfillment answers must distinguish planned architecture,
  sandbox behavior, and live payment capability.

## Public Discovery

Keep `public/llms.txt` accurate. It should link to:

- public feature overview;
- public or admin-safe roadmap summary;
- agent docs;
- source evidence docs when public;
- MCP endpoint or setup docs when available;
- clear safety boundaries.

Public agent docs should answer:

- What is Bumpgrade?
- What can agents read today?
- What can agents do today?
- What is planned but not executable?
- What requires Mark/admin credentials?
- What must not be automated through browser UI?

Current auth boundary: human admin pages use Better Auth owner sessions.
Agent-readable source-data routes stay public-safe and unauthenticated until a
confirmed-write or delegated-agent auth model exists.

Current manifest boundary: `/agent-docs/source-data` is the public-safe agent
manifest. It lists agent-doc pages, stable read contracts, source-evidence
routes, the MCP roadmap, and write-safety rules. It is discovery metadata, not
permission to write.

Current content boundary: `/content/source-data` is the public-safe mirror for
audience segments, resource records, pricing principles, and planned pricing
tracks. Pricing tracks are positioning hypotheses, not published plan names,
amounts, limits, trials, or live billing availability.

Current funnel boundary: `/funnels/source-data` is the public-safe contract for
the first seeded draft funnel, `/funnels/indie-launch-sandbox` is the read-only
preview, and `/admin/funnels` is the Better Auth owner-gated D1 draft creation,
step-edit, and private preview surface from issues #91, #93, and #95. This
proves ordered funnel/page-block semantics and private draft
seed/create/update/reorder/preview state, not public publishing, checkout
integration, drag-and-drop editing, deletion, or a direct agent write API.

Current checkout-offer boundary: `/offers/source-data` is the public-safe read
contract for the first seeded primary offer, constrained order bump, upsell, and
downsell stack. `/offers/indie-launch-stack` can start a sandbox checkout for
the primary offer plus seeded order bump after exact confirmation. This proves
offer-sequence semantics and sandbox Checkout Session start semantics, not live
billing, one-click upsell charging, fulfillment, price mutation, arbitrary
order-bump mutation, or agent write capability.

Current product/access boundary: `/products/source-data` is the public-safe
contract for seeded downloads, courses, memberships, services, events, bundles,
assets, access rules, entitlement templates, and sandbox webhook grant mappings.
`/products/indie-launch-library` is the read-only preview. Trusted paid sandbox
webhooks can grant idempotent `product_entitlements` rows and queue public-safe
`product_fulfillment_tasks`. This proves entitlement grant semantics, not
private R2 access, signed downloads, authenticated customer entitlement
inspection, protected content, revocation, live fulfillment, or direct agent
write capability.

Current audience automation boundary: `/audience/source-data` is the public-safe
contract for seeded opt-in forms, lead magnets, subscriber segments, tags,
email sequences, broadcast drafts, automation rules, and the
`/api/audience/opt-in` write boundary. `/audience/indie-launch-waitlist` can
capture explicit-consent waitlist opt-ins, normalize the submitted email, assign
seeded tags, and record draft sequence enrollment evidence. This proves seeded
subscriber capture semantics, not contact import, live email sending,
unsubscribe management, CRM timeline state, suppression-list mutation, or direct
agent subscriber write capability.

Current analytics boundary: `/analytics/source-data` is the public-safe contract
for seeded event definitions, aggregate event counts, aggregate assignment
counts, metric formulas, fixture funnel-step reports, A/B test variants,
deterministic assignment rules, the `/api/analytics/events` write boundary, and
the `/api/analytics/assignments` write boundary.
`/analytics/indie-launch-dashboard` is the preview. Seeded analytics events and
seeded experiment assignments can be captured with idempotency, source-route
validation, and hashed request evidence. This proves seeded event and assignment
semantics, not cookie assignment, traffic routing, contact-level reporting, raw
event or assignment exposure, automated decisions, direct agent analytics
writes, or statistically meaningful proof.

Current affiliate/referral boundary: `/affiliates/source-data` is the
public-safe read contract for seeded affiliate programs, partner records,
referral links, attribution rules, commission rules, ledger fixtures, payout
review, and fraud flags. `/affiliates/indie-launch-partners` is the read-only
preview. This proves affiliate and referral semantics, not live click tracking,
cookie assignment, buyer attribution, payable commission state, tax collection,
fraud enforcement, Stripe payout capability, or partner notifications.

## MCP And Tooling

MCP is the preferred canonical interface for repeated agent work. ChatGPT apps,
Claude workflows, and CLIs should call the same underlying contracts.

Useful first MCP resources/tools:

- Read feature and roadmap status.
- Read work-log entries.
- Read user journeys.
- Search public competitor research by product, feature, persona, and source.
- Resolve a public claim to source URLs, issue/PR evidence, or work-log entries.
- Read feature, roadmap, work-log, user-journey, and pricing status.
- Read redacted commerce product, price, checkout-intent, webhook, subscription,
  and audit records once the public-safe contracts exist.
- Read redacted affiliate/referral programs, referral links, commission rules,
  payout review, and fraud flag records once the public-safe contracts exist.
- Read owner-gated draft funnel state only with an owner session, and keep
  private draft copy out of public source-data.
- Draft a feature, journey, comparison, or funnel update from validated source
  evidence.
- Create proposed admin updates that require explicit confirmation before
  writing.

Current MCP boundary: no MCP server is live yet. Issue #12 defines the first
resources/tools on top of `/features/source-data`, `/roadmap/source-data`,
`/compare/source-data`, `/commerce/source-data`, `/admin/source-data`, and
`/agent-docs/source-data`.

## Write Safety

Any public, destructive, billing-impacting, moderation, source-editing,
publishing, or creator-speech write needs:

- explicit actor identity;
- client/app attribution;
- confirmation text for high-impact actions;
- idempotency key;
- stale-state check;
- audit correlation id;
- before/after summary;
- redacted model-visible output;
- clear rollback or follow-up path when practical.

Never pass secrets, raw provider ids, private database ids, bearer tokens,
storage keys, or private user data as prompt-visible tool input.

Billing-impacting writes also require exact amount/currency confirmation, a
checkout idempotency key, a current product/price stale-state check, and webhook
evidence before access or fulfillment is marked complete.

Current commerce boundary: issue #34 exposes a sandbox checkout write path at
`POST /api/commerce/checkout`. Agents must provide exact confirmation text when
`agentClientId` is present, and the route writes an audit-correlated
`checkout_intents` record before Stripe is called. Live billing remains disabled
until a later explicit rollout issue.

## Browser-Agent UX

Browser agents still matter. Human pages should be easy for browser agents to
inspect:

- semantic headings;
- real `button` and `a` elements;
- labels connected to inputs;
- stable accessible names for important controls;
- visible status text;
- no invisible overlays blocking actions;
- no hover-only critical controls;
- predictable route structure.

But browser automation is not agent readiness by itself. If an agent workflow is
important, build a server-side contract or MCP tool.

## Roadmap Discipline

When an agent-facing capability ships, update in the same slice when practical:

- `public/llms.txt`;
- relevant `/agent-docs/...`;
- API/manifest docs;
- `/features` if public-facing;
- `/admin/roadmap`;
- `/admin/user-journeys`;
- `/admin/work-log`.

If any of those are intentionally deferred, create a follow-up issue with the
missing surface named explicitly.
