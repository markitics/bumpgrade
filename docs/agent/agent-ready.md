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
- `productPaymentPlanId`: stable id for public-safe product pay-in-full,
  installment, or subscription plan records.
- `priceId`: stable id for a Bumpgrade price record; Stripe Price ids stay
  provider metadata.
- `subscriptionPlanId`: stable id for pricing/billing plans.
- `affiliateProgramId`: stable id for affiliate/referral programs.
- `affiliatePartnerReportId`: stable id for public-safe partner performance reports.
- `payoutPreparationId`: stable id for read-only affiliate payout preparation rows.
- `partnerNotificationReadinessRecordId`: stable id for owner-reviewed partner
  notification readiness records.
- `partnerNotificationSendPreflightRecordId`: stable id for owner-reviewed
  partner notification send preflight records.
- `partnerNotificationProviderReadinessRecordId`: stable id for owner-reviewed
  partner notification provider readiness records.
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
paths, `/mobile-admin/dashboard/source-data` is the live public-safe dashboard
digest for mobile clients, `/api/mobile-admin/private-rows` is the owner-gated
read-only private-row inspection API, `/api/mobile-admin/private-rows/actions`
is the owner-confirmed low-risk private-row workflow action API, and
`/api/mobile-admin/director-reviews` is the owner-confirmed low-risk Director
workstream review API, `/api/mobile-admin/commerce-reviews` is the
owner-confirmed low-risk commerce health review API, and
`/api/mobile-admin/actions` is the owner-gated
audit-only action-intent API. The dashboard summarizes feature, roadmap, recent
work-log, attention, commerce, agent-readiness, platform status, private-row
counts, private-row action counts, Director review counts, commerce review
counts, action-intent counts, and a redacted Director workstream digest from the same contracts as the web
app. It returns counts, statuses, route IDs, issue evidence, recent public-safe
work-log metadata, Director workstream IDs, compact brief signals, public
private-row labels, redacted action labels, redacted Director review labels,
redacted commerce review labels, and redaction flags only.
Owner-authenticated GET `/api/mobile-admin/private-rows` returns owner-only
private row notes and synthetic private payload metadata through the same Better
Auth owner session as web admin; public source-data must not expose those notes,
payloads, owner email values, session IDs, cookies, tokens, or raw rows.
Owner-authenticated GET `/api/mobile-admin/private-rows/actions?rowId=...`
returns the row-specific confirmation contract and stale-state token only to
accepted owners, and owner-authenticated POST can mark a private row read or
deferred after exact confirmation, idempotency, stale row revision checks,
stale-state token checks, and audit correlation. Public source-data must not
expose actor identity, private notes, owner-only notes, private payloads,
idempotency keys, stale-state tokens, token hashes, or raw rows.
Owner-authenticated GET `/api/mobile-admin/director-reviews` returns current
Director workstream review confirmation contracts and stale-state tokens only to
accepted owners, and owner-authenticated POST can acknowledge a workstream after
exact confirmation, idempotency, current Director source-revision checks,
stale-state token checks, and audit correlation. Public source-data must not
expose actor identity, review notes, idempotency keys, stale-state tokens, token
hashes, or raw rows.
Owner-authenticated GET `/api/mobile-admin/commerce-reviews` returns current
commerce review confirmation contracts and stale-state tokens only to accepted
owners, and owner-authenticated POST can acknowledge a commerce source-data
target after exact confirmation, idempotency, current commerce source-revision
checks, stale-state token checks, and audit correlation. Public source-data must
not expose actor identity, review notes, idempotency keys, stale-state tokens,
token hashes, raw rows, buyer identity, Stripe identifiers, entitlement rows,
signed URLs, R2 object keys, or private fulfillment state.
Owner-authenticated GET `/api/mobile-admin/actions`
returns exact stale-state tokens for the supported mobile confirmed actions,
and owner-authenticated POST records redacted action intent evidence after
exact confirmation, idempotency, contract revision checks, stale-state token
checks, source-route allowlisting, and audit correlation. This endpoint creates
no production admin mutation, billing mutation, push notification, distribution
state change, private mobile row exposure, or direct public agent write. It is
not push notifications, installable app distribution, private buyer rows, raw
inbox bodies, owner email values, session IDs, R2 object keys, signed URLs,
upload bodies, secret values, or production mobile mutation support.
Public `/mobile-admin/source-data` now also exposes a Mobile Admin
push-notification boundary and distribution-readiness boundary. The push
boundary names APNs and FCM as required providers, keeps send capability
disabled, and lists the provider credential, private device-token registration,
send preflight, queue, delivery-result, receipt, consent, audit, and redaction
evidence required before sends. The distribution boundary separates
simulator/emulator proof from physical-device, TestFlight/App Store, and Play
Store/internal-testing claims. Public source-data must not expose APNs/FCM
credentials, device tokens, recipient identifiers, payload bodies, provider
responses, queue rows, delivery receipts, signing credentials, provisioning
profiles, keystore material, store account identifiers, private tester lists, or
physical-device private rows.
The Expo, iOS, and Android smoke scaffolds now render the dashboard route,
fetch the live public-safe dashboard payload, label live-network versus fallback
fixture hydration, and keep the generated fixture as a deterministic simulator
or emulator fallback. Issue #414 now also renders the shared owner-session
contract, private-row API boundary, private-row action API boundary, action-intent API boundary,
Director review API boundary, commerce review API boundary, push-readiness boundary, distribution-readiness boundary, and confirmed-action
requirements in the Expo, iOS, and Android scaffolds. Those panels reuse the
web/admin Better Auth, owner allowlist, verified-email, exact-confirmation,
idempotency, stale-state, audit-correlation, and redaction rules. They can now
represent low-risk private-row workflow actions and readiness blockers, but they
are still not high-risk billing, fulfillment, or publishing mobile write clients, live push
notifications, physical-device proof, or installable app distribution.

Current content boundary: `/content/source-data` is the public-safe mirror for
audience segments, resource records, pricing principles, and planned pricing
tracks. Experiment, Grow, Enterprise, and White glove setup are current public
pricing records; future limits, trials, and usage-meter rates still require
fresh source evidence before agents cite them as current.

Current funnel boundary: `/funnels/source-data` is the public-safe contract for
the first seeded draft funnel plus reusable funnel template and block-template
records, `/funnels/indie-launch-sandbox` is the read-only preview, and
`/admin/funnels` is the Better Auth owner-gated D1 draft creation, step-edit,
granular block title/body edit, block add/remove, within-step block reorder,
drag/drop block placement through existing move endpoints, cross-step block move, private preview, exact-confirmed publish,
exact-confirmed archive/unpublish, exact-confirmed checkout-unlink, exact-confirmed resource-delivery-link,
exact-confirmed webinar-event-link, and exact-confirmed archived-draft purge
surface from issues #91, #93, #95, #135, #159, #161, #163, #165, #213, #215,
#341, #417, #430, and #432. This proves ordered
funnel/page-block semantics,
read-only template and block-template discovery, owner-confirmed
template-to-draft creation from issue #161, owner-confirmed checkout-offer
linking on private checkout blocks from issue #163, private draft
seed/create/update/reorder and preview state, owner-session block copy editing
from issue #430 while preserving block IDs, kinds, and checkout-link metadata,
owner-session block add/remove from issue #432 while refusing checkout-linked
block removal, owner-session checkout unlinking from issue #417 while
preserving block IDs, kinds, title/body copy, step order, and audit evidence,
owner-session resource delivery linking from issue #417 while preserving block
IDs, kinds, title/body copy, step order, and audit evidence, public
funnel-scoped private download-token delivery from issue #417 for published
resource blocks after checkout entitlement, product, and file asset scope match,
owner-session within-step block reordering from issue #417 while preserving block IDs, kinds,
copy, checkout-link metadata, resource-link metadata, step membership, and audit
evidence, owner-session drag/drop block placement from issue #417 while reusing
the same move endpoint modes with fresh revision checks, owner-session cross-step block moves from issue #417 while preserving
block IDs, kinds, copy, checkout-link metadata, resource-link metadata, and audit
evidence while changing step membership, owner-session webinar event/replay
linking from issue #417 while preserving block IDs, kinds, title/body copy, step
order, and audit evidence while storing only public-safe external URL references,
and public D1
funnel publishing to `/funnels/{slug}` after owner confirmation and revision
checks. Issue #341 lets
owners archive private drafts or unpublish public D1 draft routes without
deleting draft, step, block, checkout-link, resource-link, or audit evidence;
archived drafts become read-only owner evidence. Issue #417 lets owners purge
already archived draft funnels only after exact confirmation, idempotency, and a
fresh archived revision check; the purge records a `funnel_purge_events`
tombstone before deleting draft and step rows, and does not delete prior audit
rows, product assets, R2 objects, buyer records, billing state, or raw owner
data. Issue #165 lets published funnel routes render
the existing sandbox checkout start surface when a checkout block carries
owner-confirmed `checkoutLink` metadata. Published resource-linked blocks can
render entitlement-safe product access references without private R2 keys,
signed URLs, buyer records, arbitrary uploaded asset delivery, or live
fulfillment automation, and can request short-lived Bumpgrade download routes
through `/api/funnels/resource-delivery` only after checkout intent and
entitlement scope match the linked product and file asset. Published
webinar-linked blocks can render external
registration/replay references without provider secrets, attendee records,
scheduling, reminders, attendance tracking, or hosted replay media.
`/api/agent/funnels/draft-writes` lets verified owner-session agents perform
direct agent-safe private draft writes for block title/body edits, private draft
duplication, and archive/unpublish only after exact confirmation, idempotency,
fresh revision checks, and audit correlation; responses are redacted draft
summaries and do not expose owner identity or raw rows. It is not direct agent
template creation, direct agent block add/remove, direct agent checkout
unlinking, direct agent resource delivery linking, direct agent block reordering,
direct agent-created delivery tokens, direct agent cross-step block moves,
direct agent webinar event linking, live billing mutation, freeform canvas
layout styling, direct agent purge, non-archived purge, one-click upsell
charging, arbitrary uploaded private asset delivery, signed URL creation, live
fulfillment automation, live webinar scheduling, attendance tracking, replay
hosting, direct agent public publishing, or public unauthenticated agent writes. Issue #14 is the shipped MVP boundary;
issue #417 now includes owner-confirmed checkout unlinking, resource delivery
links, funnel-scoped private download-token delivery, webinar event/replay links,
within-step block reordering, drag/drop block placement, cross-step block moves,
archived-draft purge, and direct agent-safe private draft writes, and remains
the pending advanced funnel parity bucket for freeform canvas layout styling,
arbitrary uploaded private asset delivery, live fulfillment automation, full
webinar integrations, bulk purge policy, direct agent-created delivery tokens,
direct agent public publishing, direct agent checkout/resource/webinar linking,
and direct agent purge. Live
publisher-offer billing remains separate in issue #219.

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
assets, access rules, entitlement templates, payment-plan records, and sandbox
webhook grant mappings.
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
contract, owner product creation metadata, owner-created product test checkout
metadata, owner-created product delivery-gate metadata, owner-created product
direct test grant metadata, owner upload intent metadata, owner-confirmed
non-destructive revocation intent records, protected content readiness,
checkout-scoped protected fixture delivery metadata,
subscription-backed membership access metadata, seeded payment-plan read records,
and redaction flags. `/api/products/download-tokens` can create a
short-lived token for an active checkout-linked file entitlement, and
`/api/products/downloads?token={token}` revalidates current entitlement status,
checkout intent linkage, trusted checkout state, and asset scope before it
streams a seeded private R2-backed fixture through Bumpgrade while rejecting
expired or replayed tokens. `/api/products/protected-content` returns seeded
course/member fixture bodies only when the request includes a known checkout
intent, a matching active entitlement, and a protected content section id, and
the checkout state is still paid or completed. `/api/admin/products/catalog`
lets verified owners create draft product records after exact confirmation and
idempotency without Stripe product/price creation or fulfillment mutation.
`/api/admin/products/test-checkout-links` lets verified owners create stable
buyer-facing test checkout links for owner-created products after exact
confirmation, idempotency, and a current product `updatedAt` check.
`/products/test-checkout/{linkId}` and `/api/products/test-checkout` let public
test buyers complete those links after exact confirmation, idempotency, and a
current link revision check, creating synthetic paid checkout/access evidence
without Stripe Checkout Sessions, live charges, public buyer exposure, or live
fulfillment delivery. `/api/admin/products/delivery-gates` lets verified owners
link those test checkout links to the seeded offer/funnel delivery gates after
exact confirmation, idempotency, a current product `updatedAt` check, and a
current checkout-link revision check, without Stripe Checkout Sessions, live
charges, live published offer/funnel state, signed URLs, private R2 keys, or
arbitrary customer delivery. `/api/admin/products/offer-access-grants` lets verified
owners create direct test offer/access grant evidence for owner-created products
after exact confirmation and idempotency. `/api/admin/products/assets` lets verified owners
create small private product asset upload records only after exact confirmation,
idempotency, and product-catalog revision checks. It stores the body in
`PRODUCT_ASSETS` under a server-only object key and returns only redacted
metadata. `/api/admin/products/revocation-intents` lets verified owners record
non-destructive access-removal intent only after exact confirmation,
idempotency, and a current entitlement status check. This proves entitlement
grant, owner-inspection, customer-safe lookup, private fixture delivery, seeded
protected fixture delivery, owner-confirmed product creation, owner-created
product test checkout evidence, owner-created product delivery-gate link
evidence, owner-confirmed private upload-record semantics, owner-confirmed
non-destructive revocation intent semantics, and
subscription-backed membership access state, and payment-plan read semantics,
not live product payment-plan checkout, signed object URLs, customer delivery of
arbitrary uploads, real protected media delivery, destructive revocation,
Customer Portal actions, live fulfillment automation, live Stripe product/price
mutation, or direct unconfirmed agent write capability.
`product_entitlement_revocation_intents`
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
`/api/admin/audience/sequences/schedule-intents` dry-run sequence schedule
intent boundary, the owner-gated
`/api/admin/audience/sequences/delivery-batches` dry-run sequence delivery
batch boundary, the owner-gated
`/api/admin/audience/sequences/delivery-queue-messages` dry-run sequence
queue-message boundary, the owner-gated
`/api/admin/audience/sequences/dispatch-preflights` dry-run sequence dispatch
preflight boundary, the owner-gated
`/api/admin/audience/sequences/dispatch-attempts` dry-run sequence dispatch
attempt boundary, the owner-gated
`/api/admin/audience/sequences/queue-producer-readiness` sequence Queue
producer readiness boundary, the owner-gated
`/api/admin/audience/broadcasts/schedule-intents` dry-run schedule intent
boundary, the owner-gated
`/api/admin/audience/broadcasts/delivery-batches` dry-run batch boundary,
the owner-gated
`/api/admin/audience/broadcasts/delivery-queue-messages` dry-run queue-message
boundary, the owner-gated
`/api/admin/audience/broadcasts/dispatch-preflights` dry-run dispatch preflight
boundary, the owner-gated
`/api/admin/audience/broadcasts/dispatch-attempts` dry-run dispatch attempt
boundary, the owner-gated
`/api/admin/audience/sequences/test-sends` owner-only sequence test-send
boundary, the owner-gated
`/api/admin/audience/broadcasts/test-sends` owner-only broadcast test-send
boundary,
the owner-gated `/api/admin/audience/import-intents` non-destructive import
intent boundary, the owner-gated `/api/admin/audience/import-preflights`
aggregate import preflight boundary,
sender-domain readiness records,
provider-event readiness records,
provider rate-limit readiness records,
provider response readiness records,
send-payload readiness records,
Queue producer readiness records,
Queue consumer readiness records,
owner-confirmed import intent records,
owner-confirmed import preflight records,
aggregate sequence delivery-readiness records,
dry-run sequence delivery-batch records,
dry-run sequence queue-message records,
dry-run sequence dispatch preflight records,
dry-run sequence dispatch attempt records,
sequence Queue producer readiness records,
sequence Queue consumer readiness records,
sequence provider-call readiness records,
sequence delivery-attempt readiness records,
sequence delivery-result readiness records,
sequence delivery-status webhook readiness records,
sequence provider-polling readiness records,
sequence receipt-payload readiness records,
aggregate audience export-readiness records,
broadcast preview/footer safety records, queue readiness records,
owner-only sequence and broadcast test-send records,
suppression-aware broadcast readiness, and aggregate
subscriber/suppression/timeline inspection redaction flags.
`/audience/indie-launch-waitlist` can capture explicit-consent waitlist
opt-ins, normalize the submitted email, assign seeded tags, record draft
sequence enrollment evidence, and record an unsubscribe preference without
revealing list membership. Known unsubscribes also pause draft sequence
enrollment state while public source-data exposes only aggregate paused-sequence
counts. Sequence delivery readiness exposes aggregate step and enrollment safety
counts without recipient payloads, personalized bodies, body templates,
unsubscribe URLs, queue payloads, provider sends, or provider message IDs.
`/admin/audience` lets verified owners inspect
private subscriber rows, consent counts, active tags, draft sequence enrollments,
suppression totals, private CRM timeline notes, broadcast readiness, preview
safety, queue readiness, sender-domain readiness, provider-event readiness,
provider rate-limit readiness, provider response readiness, send-payload
readiness, Queue producer readiness, Queue consumer readiness, sequence delivery
readiness, dry-run sequence delivery batches, dry-run sequence queue messages,
dry-run sequence dispatch preflights, dry-run sequence dispatch attempts,
sequence Queue producer readiness, sequence Queue consumer readiness, sequence provider-call readiness, sequence delivery-attempt readiness, sequence delivery-result readiness, sequence delivery-status webhook readiness, sequence provider-polling readiness, sequence receipt-payload readiness, import intent, import preflight, and
export readiness records from D1. It can record private CRM notes, owner-only
sequence and broadcast test sends to the verified owner-session email, dry-run
schedule intents, sequence delivery-batch dry runs, sequence queue-message dry
runs, sequence dispatch preflight dry runs, sequence dispatch attempt receipts,
sequence Queue producer readiness gates, sequence Queue consumer readiness gates, sequence provider-call readiness gates, sequence delivery-attempt readiness gates, sequence delivery-result readiness gates, sequence delivery-status webhook readiness gates, sequence provider-polling readiness gates, sequence receipt-payload readiness gates, delivery-batch dry runs, dry-run
queue-message evidence, dispatch preflight evidence, dispatch attempt receipts,
import intents, and import preflights, but those records do
not create recipient payloads, personalized bodies, queue payload bodies, raw
contact rows, raw emails, subscriber rows, sequence enrollments, provider sends, provider
calls, delivery attempts, delivery results, status webhooks, webhook payload reads, provider polling, polling results, receipt payloads, delivery receipts, responses, provider message IDs, exports, or real imports. This proves seeded
subscriber capture, unsubscribe evidence, owner inspection, private owner-note
semantics, aggregate broadcast readiness, owner-confirmed dry-run schedule
intent semantics, owner-confirmed test-send stale-state/idempotency/audit
semantics, preview safety semantics, queue readiness semantics,
delivery-batch dry-run semantics, queue-message semantics, dispatch-preflight
semantics, dispatch-attempt semantics, sequence Queue producer readiness, sequence Queue consumer readiness, sequence provider-call readiness, sequence delivery-attempt readiness, sequence delivery-result readiness, sequence delivery-status webhook readiness, sequence provider-polling readiness, sequence receipt-payload readiness,
sender-domain readiness, provider-event
readiness, provider-rate-limit readiness, provider-response readiness,
send-payload readiness, Queue producer readiness, Queue consumer readiness, provider-call readiness, delivery-attempt readiness, delivery-result readiness, delivery-status webhook readiness,
aggregate sequence-delivery-readiness semantics,
sequence delivery-batch dry-run semantics,
sequence queue-message dry-run semantics,
non-destructive import-intent semantics, aggregate import-preflight semantics,
and aggregate export-readiness semantics, not contact import, sequence scheduling, live email sending,
live Cloudflare Queue producer or consumer execution or dispatch, provider calls, delivery attempts, delivery results, webhooks, webhook payloads, provider polling, polling results, receipt payloads, receipts, recipient
payloads, delivery queue rows, body templates, unsubscribe URLs, CRM automation, private export, suppression-list administration, or
direct agent subscriber write capability.

Issue #17 is the live MVP boundary for audience/email automation. Issue #420
now includes the first owner-only sequence and broadcast test-send execution paths while
still grouping the remaining subscriber delivery, automation execution,
sender/provider, Queue, receipt, import/export, and agent-safe write work so agents do not infer
that every readiness gate is a separate shipped product milestone.

Current analytics boundary: `/analytics/source-data` is the public-safe contract
for seeded event definitions, aggregate event counts, aggregate source
attribution counts, aggregate variant event counts, aggregate assignment counts,
aggregate funnel conversion report rows, fixed time-window metadata, metric
formulas, A/B test variants, deterministic assignment rules, the
`/api/analytics/events` write boundary, the `/api/analytics/assignments`
write boundary, the owner-gated `/api/admin/analytics/experiment-decisions`
decision-evidence boundary, aggregate report export metadata, and owner-reviewed
cohort comparison evidence, plus owner-reviewed alert threshold/anomaly-review
evidence, owner-reviewed notification delivery readiness evidence,
owner-confirmed notification inbox record evidence, and owner-confirmed
notification dispatch preflight evidence, plus owner-reviewed notification
provider/domain readiness, content/consent readiness, send-payload readiness,
queue-producer readiness, queue-consumer readiness, provider-call readiness,
delivery-attempt readiness, delivery-result readiness, delivery-status webhook
readiness, provider-polling readiness, receipt-payload readiness,
delivery-receipt readiness, and provider-status reconciliation readiness
evidence.
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
samples exist. `/admin/analytics` lets verified owners record redacted
experiment decision evidence after exact confirmation, aggregate count checks,
fixed-window selection, current dashboard/experiment checks, and sample-size
caveat acknowledgement. `/admin/analytics` also lets verified owners record
redacted notification inbox evidence after exact confirmation, readiness checks,
fixed-window sample-size checks, and sample-size caveat acknowledgement. The
same admin page lets verified owners record redacted notification dispatch
preflight evidence after exact confirmation, readiness checks, current inbox
record checks, fixed-window sample-size checks, and sample-size caveat
acknowledgement. The same admin page lets verified owners record redacted
notification content/consent readiness evidence after exact confirmation,
readiness checks, current provider/domain readiness checks, fixed-window
sample-size checks, and sample-size caveat acknowledgement. The same admin page
lets verified owners record redacted notification send-payload readiness
evidence after exact confirmation, readiness checks, current content/consent
readiness checks, fixed-window sample-size checks, and sample-size caveat
acknowledgement. The same admin page lets verified owners record redacted
notification queue-producer readiness evidence after exact confirmation,
readiness checks, current send-payload readiness checks, fixed-window
sample-size checks, and sample-size caveat acknowledgement. The same admin
page lets verified owners record redacted notification
queue-consumer readiness evidence after exact confirmation, readiness checks,
current queue-producer readiness checks, fixed-window sample-size checks, and
sample-size caveat acknowledgement. The same admin page lets verified owners
record redacted notification provider-call readiness evidence after exact
confirmation, readiness checks, current queue-consumer readiness checks,
fixed-window sample-size checks, and sample-size caveat acknowledgement. The
same admin page lets verified owners record redacted notification
delivery-attempt readiness evidence after exact confirmation, readiness checks,
current provider-call readiness checks, fixed-window sample-size checks, and
sample-size caveat acknowledgement. The same admin page lets verified owners
record redacted notification delivery-result readiness evidence after exact
confirmation, readiness checks, current delivery-attempt readiness checks,
fixed-window sample-size checks, and sample-size caveat acknowledgement. The
same admin page lets verified owners record redacted notification
delivery-status-webhook readiness evidence after exact confirmation, readiness
checks, current delivery-result readiness checks, fixed-window sample-size
checks, and sample-size caveat acknowledgement. The same admin page lets
verified owners record redacted notification provider-polling readiness evidence
after exact confirmation, readiness checks, current delivery-status-webhook
readiness checks, fixed-window sample-size checks, and sample-size caveat
acknowledgement. The same admin page lets verified owners record redacted
notification receipt-payload readiness evidence after exact confirmation,
readiness checks, current provider-polling readiness checks, fixed-window
sample-size checks, and sample-size caveat acknowledgement. The same admin page
lets verified owners record redacted notification delivery-receipt readiness
evidence after exact confirmation, readiness checks, current receipt-payload
readiness checks, fixed-window sample-size checks, and sample-size caveat
acknowledgement. The same admin page lets verified owners record redacted notification
provider-status reconciliation readiness evidence after exact confirmation,
readiness checks, current delivery-receipt readiness checks, fixed-window
sample-size checks, and sample-size caveat acknowledgement. The same
source-data route exposes aggregate report
export sections, fixture cohort-comparison definitions, and owner-reviewed
cohort comparison evidence without creating raw analytics downloads. It also
exposes owner-reviewed alert threshold/anomaly-review evidence as review prompts
only, not customer alerts or automated actions. It also exposes owner-reviewed
notification delivery readiness as a future owner-notification contract only,
not live email delivery. The notification inbox record path creates
owner-visible inbox evidence only, not recipients, email bodies, queues, or
customer alerts. The dispatch preflight path creates owner-visible preflight
evidence only, not recipients, email bodies, provider message IDs, queue
payloads, queues, provider sends, or customer alerts. The provider/domain
readiness path creates owner-visible readiness evidence only, not provider
configuration, provider secrets, sender credentials, private DNS credentials,
verified sender-domain claims, recipients, email bodies, provider message IDs,
queue payloads, queues, provider sends, or customer alerts. The content/consent
readiness path creates owner-visible readiness evidence only, not body
templates, unsubscribe URLs, recipients, email bodies, provider message IDs,
queue payloads, queues, provider sends, or customer alerts.
The send-payload readiness path creates owner-visible readiness evidence only,
not recipients, recipient payloads, personalized bodies, raw payload bodies,
email bodies, body templates, unsubscribe URLs, provider responses, provider
message IDs, queue messages, queue payloads, queues, provider sends, or customer
alerts. The queue-producer readiness path creates owner-visible readiness
evidence only, not Queue producer execution, queue messages, queue payload
bodies, queue payloads, queues, provider sends, provider responses, recipients,
email bodies, provider message IDs, or customer alerts. The queue-consumer
readiness path creates owner-visible readiness evidence
only, not Queue consumer execution, queue message consumption,
acknowledgements, retry/dead-letter rows, queue payload body reads, queue
payloads, queues, provider sends, provider responses, recipients, email bodies,
provider message IDs, or customer alerts. The provider-call readiness path
creates owner-visible readiness evidence only, not provider sends, provider
calls, provider configuration, provider responses, provider secrets, sender
credentials, private DNS credentials, Queue producer execution, Queue consumer
execution, queue messages, queue message consumption, acknowledgements,
retry/dead-letter rows, queue payload body reads, queue payloads, queues,
recipients, email bodies, provider message IDs, or customer alerts. The
delivery-attempt readiness path creates owner-visible readiness evidence only,
not provider sends, provider calls, delivery attempts, provider configuration,
provider responses, provider secrets, sender credentials, private DNS
credentials, Queue producer execution, Queue consumer execution, queue messages,
queue message consumption, acknowledgements, retry/dead-letter rows, queue
payload body reads, queue payloads, queues, recipients, email bodies, provider
message IDs, or customer alerts. The delivery-result readiness path creates
owner-visible readiness evidence only, not provider sends, provider calls,
delivery attempts, delivery results, delivery receipts, receipt payloads, status
webhooks, provider polling, provider configuration, provider responses,
provider secrets, sender credentials, private DNS credentials, Queue producer
execution, Queue consumer execution, queue messages, queue message consumption,
acknowledgements, retry/dead-letter rows, queue payload body reads, queue
payloads, queues, recipients, email bodies, provider message IDs, or customer
alerts. The delivery-status-webhook readiness path creates owner-visible
readiness evidence only, not provider sends, provider calls, delivery attempts,
delivery results, delivery receipts, receipt payloads, status webhooks,
provider polling, provider configuration, provider responses, provider secrets,
sender credentials, private DNS credentials, Queue producer execution, Queue
consumer execution, queue messages, queue message consumption,
acknowledgements, retry/dead-letter rows, queue payload body reads, queue
payloads, queues, recipients, email bodies, provider message IDs, or customer
alerts. The provider-polling readiness path creates owner-visible readiness
evidence only, not provider sends, provider calls, delivery attempts, delivery
results, delivery status webhooks, provider polling execution, delivery
receipts, receipt payloads, status webhooks, provider configuration, provider
responses, provider secrets, sender credentials, private DNS credentials, Queue
producer execution, Queue consumer execution, queue messages, queue message
consumption, acknowledgements, retry/dead-letter rows, queue payload body reads,
queue payloads, queues, recipients, email bodies, provider message IDs, or customer
alerts. The receipt-payload readiness path creates owner-visible readiness
evidence only, not provider sends, provider calls, delivery attempts, delivery
results, delivery status webhooks, provider polling execution, delivery
receipts, receipt payload capture, status webhooks, provider configuration,
provider responses, provider secrets, sender credentials, private DNS
credentials, Queue producer execution, Queue consumer execution, queue
messages, queue message consumption, acknowledgements, retry/dead-letter rows,
queue payload body reads, queue payloads, queues, recipients, email bodies,
provider message IDs, or customer alerts. The delivery-receipt readiness path
creates owner-visible readiness evidence only, not provider sends, provider
calls, delivery attempts, delivery results, delivery status webhooks, provider
polling execution, delivery receipts, raw receipt payloads, status webhooks,
provider configuration, provider responses, provider secrets, sender
credentials, private DNS credentials, Queue producer execution, Queue consumer
execution, queue messages, queue message consumption, acknowledgements,
retry/dead-letter rows, queue payload body reads, queue payloads, queues,
recipients, email bodies, provider message IDs, or customer alerts. The
provider-status reconciliation readiness path creates owner-visible
readiness evidence only, not provider sends, provider calls, delivery attempts,
delivery results, delivery status webhooks, provider polling execution,
delivery receipt processing, receipt payload capture, provider status
reconciliation execution, provider configuration, provider responses, provider
secrets, sender credentials, private DNS credentials, Queue producer execution,
Queue consumer execution, queue messages, queue message consumption,
acknowledgements, retry/dead-letter rows, queue payload body reads, queue
payloads, queues, recipients, email bodies, provider message IDs, or customer
alerts. This proves
seeded event, page-view beacon, dashboard-visible fixed-window aggregate source,
aggregate variant, assignment, and reporting semantics plus owner-reviewed
decision evidence, owner-reviewed cohort evidence, owner-reviewed threshold
evidence, owner-reviewed notification readiness evidence, owner-confirmed
notification inbox evidence, owner-confirmed dispatch preflight evidence, and
owner-reviewed provider/domain readiness evidence, owner-reviewed content/consent
readiness evidence, owner-reviewed send-payload readiness evidence,
owner-reviewed queue-producer readiness evidence, owner-reviewed
queue-consumer readiness evidence, owner-reviewed provider-call readiness
evidence, owner-reviewed delivery-attempt readiness evidence, and
owner-reviewed delivery-result readiness evidence, owner-reviewed
delivery-status-webhook readiness evidence, owner-reviewed provider-polling
readiness evidence, owner-reviewed receipt-payload readiness evidence,
owner-reviewed delivery-receipt readiness evidence, owner-reviewed
provider-status reconciliation readiness evidence, plus aggregate
export metadata and seeded sandbox funnel copy routing with a baseline holdout, not cookie assignment, automated alert sends, owner email
sends, provider sends, provider calls, delivery attempts, delivery results,
delivery receipts, status webhooks, provider polling, provider status
reconciliation, provider configuration,
provider responses, provider secrets, sender credentials,
private DNS credentials, body templates, unsubscribe URLs, Queue producer execution,
Queue consumer execution, queue dispatch, queue messages, queue message
consumption, acknowledgements, retry/dead-letter rows, queue payload body
reads, queue payload bodies, recipient payloads,
personalized bodies, raw payload bodies, customer alerts, traffic routing beyond the seeded sandbox copy path,
contact-level reporting, raw referrer/query
exposure, raw event or assignment exposure, raw analytics exports, automated
winners, direct public agent analytics writes, revenue claims, or statistically
meaningful proof.

Issue #18 is the live analytics MVP boundary. Issue #422 has started seeded
sandbox funnel routing with a baseline holdout and still tracks custom analytics schemas, custom routing rules,
winner selection, notification execution, Cloudflare Queue producer/consumer
execution, provider calls, delivery attempts/results, webhooks, polling,
receipts, raw/private exports, and agent-safe write parity work as the
remaining bucket.

Current affiliate/referral boundary: `/affiliates/source-data` is the
public-safe read contract for seeded affiliate programs, partner records,
referral links, public-safe partner reports, aggregate click counts, checkout
attribution evidence, aggregate review-only commission ledger counts,
read-only payout preparation, owner-confirmed payout preparation records,
owner-reviewed fraud review records, owner-reviewed partner notification
readiness records, attribution rules, commission rules, ledger fixtures, payout review, fraud flags, and the
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
identity, or private reasons. Issue #273 lets owners record payout preparation
evidence after exact confirmation, idempotency, revision checks, payout batch
status checks, and ledger count/total checks without exposing payout accounts,
tax data, Stripe payout IDs, partner notification bodies, buyer data, raw ledger
rows, raw actor identity, or private fraud signals. Issue #275 lets owners
record fraud review evidence after exact confirmation, idempotency, revision
checks, payout batch status checks, review flag checks, and linked ledger count
checks without exposing private fraud signals, buyer data, raw ledger rows, raw
click rows, raw checkout rows, raw actor identity, payout accounts, tax data,
Stripe payout IDs, or partner notification bodies. Issue #277 lets owners
record partner notification readiness evidence after exact confirmation,
idempotency, revision checks, partner report checks, payout batch status checks,
payout preparation record status checks, fraud review record status checks,
review flag checks, and linked ledger count checks without sending partner
notifications, calling providers, creating queue rows, exposing recipient
emails, exposing message bodies, exposing provider message IDs, exposing private
fraud signals, exposing buyer data, exposing raw rows, exposing actor identity,
or creating payout state. This proves affiliate and referral
click-to-checkout-to-ledger-to-review-to-report-to-preparation-to-fraud-review-to-notification-readiness semantics. Issue
#279 lets owners record partner notification send preflight evidence after exact
confirmation, idempotency, revision checks, partner report checks, payout batch
status checks, payout preparation record status checks, fraud review record
status checks, notification readiness record status checks, review flag checks,
linked ledger count checks, and provider-send-disabled checks without sending
partner notifications, enabling provider sends, calling providers, creating send
payloads, creating queue rows, exposing recipient emails, exposing message
bodies, exposing provider message IDs, exposing private fraud signals, exposing
buyer data, exposing raw rows, exposing actor identity, or creating payout state.
This proves affiliate and referral
click-to-checkout-to-ledger-to-review-to-report-to-preparation-to-fraud-review-to-notification-readiness-to-send-preflight semantics, not
provider configuration. Issue #281 lets owners record partner notification
provider readiness evidence after exact confirmation, idempotency, revision
checks, partner report checks, payout batch status checks, payout preparation
record status checks, fraud review record status checks, notification readiness
record status checks, send preflight record status checks, review flag checks,
linked ledger count checks, provider-configuration-disabled checks, provider
secret redaction checks, sender credential redaction checks, and
provider-send-disabled checks without configuring providers, storing provider
secrets, storing sender credentials, sending partner notifications, enabling
provider sends, calling providers, creating send payloads, creating queue rows,
exposing recipient emails, exposing message bodies, exposing provider message
IDs, exposing private fraud signals, exposing buyer data, exposing raw rows,
exposing actor identity, or creating payout state. This proves affiliate and
referral
click-to-checkout-to-ledger-to-review-to-report-to-preparation-to-fraud-review-to-notification-readiness-to-send-preflight-to-provider-readiness semantics, not
cookie assignment, buyer attribution finalization, payable commission state,
direct agent review writes, payout execution, tax collection, fraud enforcement,
Stripe payout capability, private partner portal access, partner notification
sends, provider-send configuration, provider calls, send payload creation, or
queue dispatch. Issue #19 is the live affiliate/referral MVP boundary. Issue
#424 tracks the remaining live payout execution, partner notification execution,
fraud enforcement, private partner portal, payout/tax-data, buyer attribution
finalization, and agent-safe affiliate/referral write parity work as one pending
bucket.

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
  partner reports, payout preparation, payout review, fraud flag records, and
  partner notification readiness records once the public-safe contracts exist.
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
partner notification sends, and buyer attribution finalization remain disabled. Live
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
