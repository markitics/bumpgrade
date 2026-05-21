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
- `affiliatePartnerReportId`: stable id for public-safe partner performance reports.
- `payoutPreparationId`: stable id for read-only affiliate payout preparation rows.
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

Current mobile-admin boundary: `/mobile-admin/source-data` is the shared
iOS/Android app contract, `/mobile-admin/ios/source-data` and
`/mobile-admin/android/source-data` describe the first simulator/emulator smoke
paths, and `/mobile-admin/dashboard/source-data` is the live public-safe
dashboard digest for mobile clients. The dashboard summarizes feature, roadmap,
recent work-log, attention, commerce, agent-readiness, and platform status from
the same contracts as the web app. It returns counts, statuses, route IDs, issue
evidence, recent public-safe work-log metadata, and redaction flags only. It is
not private mobile auth, push notifications, confirmed writes, installable app
distribution, private buyer rows, raw inbox bodies, owner email values, session
IDs, R2 object keys, signed URLs, upload bodies, secret values, or write tokens.
The Expo, iOS, and Android smoke scaffolds now render the dashboard route,
fetch the live public-safe dashboard payload, label live-network versus fallback
fixture hydration, and keep the generated fixture as a deterministic simulator
or emulator fallback. They are still not private mobile auth, mobile write
clients, or installable app distribution.

Current content boundary: `/content/source-data` is the public-safe mirror for
audience segments, resource records, pricing principles, and planned pricing
tracks. Pricing tracks are positioning hypotheses, not published plan names,
amounts, limits, trials, or live billing availability.

Current funnel boundary: `/funnels/source-data` is the public-safe contract for
the first seeded draft funnel plus reusable funnel template and block-template
records, `/funnels/indie-launch-sandbox` is the read-only preview, and
`/admin/funnels` is the Better Auth owner-gated D1 draft creation, step-edit,
private preview, and exact-confirmed publish surface from issues #91, #93, #95,
#135, #159, #161, #163, and #165. This proves ordered funnel/page-block semantics,
read-only template and block-template discovery, owner-confirmed
template-to-draft creation from issue #161, owner-confirmed checkout-offer
linking on private checkout blocks from issue #163, private draft
seed/create/update/reorder and preview state, and public D1 funnel publishing to
`/funnels/{slug}` after owner confirmation and revision checks. Issue #165 lets
published funnel routes render the existing sandbox checkout start surface when
a checkout block carries owner-confirmed `checkoutLink` metadata. It is not
direct agent template creation, live billing mutation, drag-and-drop editing,
deletion/unpublishing, one-click upsell charging, or a direct agent write API.

Current checkout-offer boundary: `/offers/source-data` is the public-safe read
contract for the first seeded primary offer, constrained order bump, upsell, and
downsell stack. `/offers/indie-launch-stack` can start a sandbox checkout for
the primary offer plus seeded order bump after exact confirmation, and
`/api/commerce/checkout` can attach eligible referral click IDs as attribution
evidence. `/api/affiliates/commission-ledger` can create review-only commission
ledger evidence from trusted checkout attribution, and
`/api/commerce/post-purchase-decisions` can record non-billing upsell/downsell
follow-up decisions after trusted checkout state with exact confirmation,
idempotency, and stale-state checks. `/commerce/checkout/success` polls that
redacted contract and only opens the post-purchase path after trusted webhook
state marks the checkout eligible. This proves offer-sequence semantics,
sandbox Checkout Session start semantics, referral-click-to-checkout evidence,
non-payable ledger evidence, and post-purchase decision evidence, not live
billing, one-click upsell charging, fulfillment, payable commission writes,
price mutation, arbitrary order-bump mutation, payout mutation, or agent write
capability.

Current product/access boundary: `/products/source-data` is the public-safe
contract for seeded downloads, courses, memberships, services, events, bundles,
assets, access rules, entitlement templates, and sandbox webhook grant mappings.
`/products/indie-launch-library` is the read-only preview. Trusted paid sandbox
webhooks can grant idempotent `product_entitlements` rows and queue public-safe
`product_fulfillment_tasks`. `/admin/products` lets verified owners inspect
private entitlement rows, buyer email, checkout state, product and price context,
access rules, and queued fulfillment evidence. `/products/entitlements` and
`/api/products/entitlements` let a customer inspect checkout-intent-scoped
entitlement and fulfillment status without exposing buyer email, hashes, raw
Stripe identifiers, webhook event IDs, metadata JSON, private R2 keys, or signed
URLs. Public product source-data only exposes aggregate entitlement inspection
counts, the customer lookup contract, short-lived private R2-backed download-token
contract, owner upload intent metadata, owner-confirmed non-destructive
revocation intent records, protected content readiness, checkout-scoped protected fixture
delivery metadata, subscription-backed membership access metadata, and redaction flags. `/api/products/download-tokens` can create a
short-lived token for an active checkout-linked file entitlement, and
`/api/products/downloads?token={token}` revalidates current entitlement status,
checkout intent linkage, trusted checkout state, and asset scope before it
streams a seeded private R2-backed fixture through Bumpgrade while rejecting
expired or replayed tokens. `/api/products/protected-content` returns seeded
course/member fixture bodies only when the request includes a known checkout
intent, a matching active entitlement, and a protected content section id, and
the checkout state is still paid or completed. `/api/admin/products/assets` lets verified owners
create small private product asset upload records only after exact confirmation,
idempotency, and product-catalog revision checks. It stores the body in
`PRODUCT_ASSETS` under a server-only object key and returns only redacted
metadata. `/api/admin/products/revocation-intents` lets verified owners record
non-destructive access-removal intent only after exact confirmation,
idempotency, and a current entitlement status check. This proves entitlement
grant, owner-inspection, customer-safe lookup, private fixture delivery, seeded
protected fixture delivery, owner-confirmed private upload-record semantics,
owner-confirmed non-destructive revocation intent semantics,
and subscription-backed membership access state, not signed object URLs, customer delivery of arbitrary uploads, real protected
media delivery, destructive revocation, Customer Portal actions, live fulfillment automation, or direct
unauthenticated agent write capability. `product_entitlement_revocation_intents`
records are non-destructive intent records only until future exact-confirmed
destructive APIs enforce owner identity, idempotency, stale-state checks, reason
codes, customer-safe notification review, audit correlation, and redaction.
`product_protected_content_sections` records expose readiness and seeded fixture
delivery scope only; future real protected delivery APIs still need active
entitlement or subscription state, stale-state checks, audit correlation, and
redaction before returning real lesson bodies, videos, transcripts, member posts,
progress rows, private R2 objects, or signed URLs. Issue #187 lets trusted
Stripe Billing subscription webhooks activate or pause a checkout-linked seeded
membership entitlement while keeping raw subscription/customer IDs, buyer hashes,
Customer Portal URLs, member posts, private files, and progress data out of
public source-data.

Current audience automation boundary: `/audience/source-data` is the public-safe
contract for seeded opt-in forms, lead magnets, subscriber segments, tags,
email sequences, broadcast drafts, automation rules, the
`/api/audience/opt-in` write boundary, the `/api/audience/unsubscribe`
unsubscribe/suppression boundary, the owner-gated `/api/admin/audience/notes`
CRM note boundary, the owner-gated
`/api/admin/audience/broadcasts/schedule-intents` dry-run schedule intent
boundary, the owner-gated
`/api/admin/audience/broadcasts/delivery-batches` dry-run batch boundary,
the owner-gated
`/api/admin/audience/broadcasts/delivery-queue-messages` dry-run queue-message
boundary, the owner-gated
`/api/admin/audience/broadcasts/dispatch-preflights` dry-run dispatch preflight
boundary, the owner-gated
`/api/admin/audience/broadcasts/dispatch-attempts` dry-run dispatch attempt
boundary,
sender-domain readiness records,
provider-event readiness records,
provider rate-limit readiness records,
provider response readiness records,
send-payload readiness records,
Queue producer readiness records,
Queue consumer readiness records,
broadcast preview/footer safety records, queue readiness records,
suppression-aware broadcast readiness, and aggregate
subscriber/suppression/timeline inspection redaction flags.
`/audience/indie-launch-waitlist` can capture
explicit-consent waitlist opt-ins, normalize the submitted email, assign seeded
tags, record draft sequence enrollment evidence, and record an unsubscribe
preference without revealing list membership. `/admin/audience` lets verified
owners inspect private subscriber rows, consent counts, active tags, draft
sequence enrollments, suppression totals, private CRM timeline notes, and
broadcast readiness from D1, plus record dry-run schedule intents without
recipient payloads, inspect preview/footer safety and queue readiness without
personalized bodies, queue rows, or provider sends, and record
delivery-batch dry runs without recipient payloads, queue messages, provider
sends, or provider message IDs, and record dry-run queue-message evidence without
Cloudflare Queue dispatch, recipient payloads, provider sends, or provider
message IDs, and record dispatch preflight evidence without Cloudflare Queue
dispatch, recipient payloads, provider sends, or provider message IDs, and
record dispatch attempt receipts without Cloudflare Queue producers, queue
payload bodies, recipient payloads, provider sends, provider responses, or
provider message IDs, and inspect sender-domain readiness without private DNS
credentials, raw DNS records, provider secrets, queue producers, recipient
payloads, provider sends, provider responses, or provider message IDs, and
inspect provider-event readiness without provider secrets, raw provider payloads,
provider responses, or provider message IDs, and inspect provider rate-limit
readiness without provider secrets, provider limit secrets, raw provider
payloads, provider responses, or provider message IDs, and inspect provider
response readiness without provider secrets, raw response bodies, provider
responses, or provider message IDs, and inspect send-payload readiness without
raw recipient identity, recipient payloads, personalized bodies, raw payload
bodies, provider sends, provider responses, or provider message IDs, and inspect
Queue producer readiness without enabling Queue producers, Queue messages, queue
payload bodies, recipient payloads, provider sends, provider responses, or
provider message IDs, and inspect Queue consumer readiness without enabling
Queue consumers, consuming or acking Queue messages, reading queue payload
bodies, creating retry/dead-letter rows, recipient payloads, provider sends,
provider responses, or provider message IDs. This
proves seeded subscriber capture, unsubscribe
evidence, owner inspection, private owner-note semantics, aggregate broadcast
readiness, owner-confirmed dry-run schedule intent semantics, preview safety
semantics, queue readiness semantics, delivery-batch dry-run semantics, and
queue-message, dispatch-preflight, dispatch-attempt, sender-domain readiness, provider-event readiness, provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness, and Queue consumer readiness semantics, not contact import, live email sending, live
Cloudflare Queue producer or consumer execution or dispatch, recipient payloads, CRM
automation, private export, suppression-list administration, or direct agent
subscriber write capability.

Current analytics boundary: `/analytics/source-data` is the public-safe contract
for seeded event definitions, aggregate event counts, aggregate source
attribution counts, aggregate variant event counts, aggregate assignment counts,
aggregate funnel conversion report rows, fixed time-window metadata, metric
formulas, A/B test variants, deterministic assignment rules, the
`/api/analytics/events` write boundary, and the `/api/analytics/assignments`
write boundary.
`/analytics/indie-launch-dashboard` is the preview. Seeded analytics events and
seeded experiment assignments can be captured with idempotency, source-route
validation, and hashed request evidence. `/funnels/indie-launch-sandbox` now
emits a browser-side `event-funnel-page-view` beacon with session-scoped
idempotency, deterministic variant evidence from the seeded assignment API,
normalized UTM/source attribution when available, and server-side bot/preview
suppression. `/analytics/indie-launch-dashboard` renders aggregate source
attribution rows from the same source-data contract and can switch aggregate
source/conversion summaries across all-time, 24-hour, 7-day, and 30-day fixed
windows. Aggregate conversion rows are computed from captured test events when
samples exist. This proves seeded event, page-view beacon, dashboard-visible
fixed-window aggregate source, aggregate variant, assignment, and reporting
semantics, not cookie assignment, traffic routing, contact-level reporting, raw
referrer/query exposure, raw event or assignment exposure, automated decisions,
direct agent analytics writes, or statistically meaningful proof.

Current affiliate/referral boundary: `/affiliates/source-data` is the
public-safe read contract for seeded affiliate programs, partner records,
referral links, public-safe partner reports, aggregate click counts, checkout
attribution evidence, aggregate review-only commission ledger counts,
read-only payout preparation, attribution rules, commission rules, ledger
fixtures, payout review, fraud flags, and the
`/api/affiliates/clicks` write boundary.
`/affiliates/indie-launch-partners` is the preview. Seeded referral clicks can
be captured with idempotency, destination-route validation, and hashed request
evidence, and eligible clicks can be attached to sandbox checkout intents as
public-safe attribution evidence. Trusted checkout attribution can create
review-only commission ledger evidence through
`/api/affiliates/commission-ledger`, and owner sessions can review, hold, or
reverse that evidence through
`/api/admin/affiliates/commission-ledger/actions` without creating payout state.
Issue #193 adds partner report definitions and aggregate report rows for clicks,
attributed checkouts, review-only ledgers, owner review actions, and payout
readiness caveats without exposing buyer, payout, tax, Stripe, raw click, raw
checkout, or private actor fields. Issue #195 adds read-only payout preparation
rows and readiness checklists without payout accounts, tax forms, Stripe payout
identifiers, partner notification payloads, raw ledger rows, private actor
identity, or private reasons. This proves affiliate and referral
click-to-checkout-to-ledger-to-review-to-report-to-preparation semantics, not
cookie assignment, buyer attribution finalization, payable commission state,
direct agent review writes, payout execution, tax collection, fraud enforcement,
Stripe payout capability, private partner portal access, or partner
notifications.

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
  partner reports, payout preparation, payout review, and fraud flag records once
  the public-safe contracts exist.
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
`checkout_intents` record before Stripe is called. Issue #111 can attach
eligible referral click evidence to the checkout intent. Issue #113 can create
review-only commission ledger evidence from trusted checkout attribution. Issue
#115 lets owner sessions review, hold, or reverse that evidence with exact
confirmation, idempotency, stale-state checks, and audit correlation, but
payable commissions, payouts, direct agent review writes, fraud decisions,
partner notifications, and buyer attribution finalization remain disabled. Live
billing remains disabled until a later explicit rollout issue.

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
