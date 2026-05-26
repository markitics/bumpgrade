# Funnels

Issue #14 is the shipped funnel and page builder MVP. Issue #79 shipped the first
read-only funnel source-data contract and preview scaffold. Issue #91 adds the
first owner-gated D1 draft builder scaffold, issue #93 adds owner-gated step
editing and reordering, issue #95 adds owner-gated private draft preview, and
issue #135 adds exact-confirmed public publishing from D1 draft funnels. Issue
#159 adds the read-only reusable funnel template and block-template library.
Issue #161 adds owner-confirmed private draft creation from those templates.
Issue #163 adds owner-confirmed checkout-offer links on private draft checkout
blocks. Issue #165 renders linked checkout blocks on published funnel routes as
the existing sandbox checkout start surface. Issue #213 adds webinar and
resource funnel template/page-block contracts plus D1 step-kind storage
readiness. Issue #215 adds owner-confirmed private draft duplication. Issue
#341 adds owner-confirmed archive/unpublish lifecycle actions. Issue #417 adds
owner-confirmed checkout unlinking, owner-confirmed resource delivery links to
product/access catalog assets, funnel-scoped private download-token delivery
from published linked resource blocks, owner-confirmed webinar event/replay
links to public-safe external URLs, owner-session within-step block reordering,
drag/drop block placement through existing move endpoints, cross-step block
moves, owner-session direct agent-safe draft writes for block copy edits,
visual style presets, bounded canvas layouts, reusable block add/remove, checkout linking/unlinking, resource-delivery
linking, webinar-event linking, block movement, duplication, public publishing,
archive/unpublish, and archived-draft purge, owner-session visual block style controls,
owner-session bounded canvas layout controls,
and owner-confirmed archived-draft purge with tombstone evidence. Issue #430 adds owner-session granular block title/body editing that
preserves block IDs, block kinds, ordered step structure, and checkout-link
metadata. Issue #432 adds owner-session block add/remove controls backed by the
reusable block library while refusing checkout-linked block removal. Issue #409
links owner-created product test checkout links to the seeded offer/funnel
delivery gates without live billing, signed URLs, private R2 delivery, or
arbitrary customer fulfillment. Issue #417 remains the single post-MVP bucket
for arbitrary uploaded private asset delivery,
live fulfillment automation, full webinar integrations, bulk retention policy,
unauthenticated public agent-created delivery tokens, and unauthenticated public agent publishing.

Live in this slice:

- `/funnels/source-data`: public-safe JSON with one seeded draft funnel, ordered
  steps, block IDs, reusable funnel templates, block-template records, revision
  ID, preview route, webinar/resource page-shape metadata, owner-session
  editable draft capability metadata, owner-session checkout-link capability
  metadata, owner-session resource delivery link capability metadata,
  owner-session webinar event link capability metadata, owner-session visual
  block style capability metadata, owner-session bounded canvas layout capability metadata,
  owner-session block reorder capability metadata, owner-session cross-step
  block move capability metadata, owner-session archived-draft purge capability
  metadata, owner-session
  archive/unpublish lifecycle metadata, published D1 funnel
  summaries, aggregate owner product delivery-gate counts, and write boundary.
- `/funnels/indie-launch-sandbox`: crawlable semantic preview of the seeded
  opt-in, sales, and thank-you funnel, including reusable template and block
  library cards.
- `/funnels/:slug`: crawlable semantic public route for published D1 draft
  funnels, with unpublished private draft copy excluded from source data. When a
  published checkout block carries owner-confirmed `checkoutLink` metadata, the
  route renders the sandbox checkout start panel for the seeded offer stack.
  Published resource-linked blocks render a customer delivery panel that can
  request a short-lived Bumpgrade download route only after the checkout intent
  and entitlement match the linked product and file asset.
  Published webinar-linked blocks render external registration/replay references
  without provider secrets or attendee records.
- `/admin/funnels`: Better Auth owner-gated page that can seed, create, edit,
  reorder, create private drafts from reusable templates, duplicate private
  drafts, edit existing block title/body copy, apply curated visual style
  presets to existing blocks, set bounded canvas layout for existing blocks, add reusable block-library blocks,
  reorder existing blocks within the same step, drag/drop existing blocks
  through the same owner-session move endpoints, move existing blocks between
  steps, remove safe unlinked blocks, attach the seeded sandbox checkout offer to
  checkout blocks, unlink checkout metadata from draft blocks, link
  resource/delivery blocks to product access assets, link webinar blocks to
  public-safe event/replay URLs, publish, archive, unpublish, and purge already
  archived private D1 draft funnels with tombstone evidence.
- `/admin/funnels/:draftId/preview`: Better Auth owner-gated preview of the
  current private D1 draft sequence, including saved visual style presets and
  bounded canvas layouts.
- `/api/admin/funnels/drafts`: owner-session POST endpoint for seed/create,
  template-to-draft create, private draft duplicate, step update, step reorder,
  block update, block visual style update, bounded block canvas layout update, block add, block remove, block-reorder, block-cross-step-move, checkout-link,
  checkout-unlink, resource-delivery-link, webinar-event-link, exact-confirmed publish, and
  exact-confirmed archive/unpublish actions, plus exact-confirmed archived-draft purge with
  idempotency, revision checks, audit rows, and purge tombstone evidence.
  Reusable webinar/resource templates use the same exact-confirmed
  template-to-draft path.
- `/api/agent/funnels/draft-writes`: owner-session JSON endpoint for direct
  agent-safe draft writes. It allows block copy edits, visual style presets,
  bounded canvas layouts, reusable block add/remove, checkout linking/unlinking, resource-delivery linking,
  webinar-event linking, block movement, private draft duplication, public publishing,
  archive/unpublish, and archived-draft purge only after exact confirmation, idempotency, current draft
  revision, and audit correlation checks. Responses are redacted
  and exclude owner email, owner user ID, private session data, raw rows, buyer
  data, R2 keys, signed URLs, billing mutations, and public agent write state.
- D1 tables: `funnel_drafts`, `funnel_draft_steps`, `funnel_audit_events`, and
  `funnel_purge_events`.
- Agent manifest entries for reading funnel state, distinguishing owner-session
  draft capability, and future MCP resources/tools.

Not live in this slice:

- Unbounded arbitrary CSS or script injection from funnel editing.
- Direct removal of checkout-linked blocks without first unlinking checkout
  metadata.
- Non-archived purge, checkout-linked direct deletion, or
  bulk purge policy.
- Live webinar scheduling, attendance tracking, reminder sending, replay
  hosting, or provider integrations.
- Arbitrary private resource file delivery, R2 object selection, signed URLs,
  live fulfillment automation, arbitrary uploaded private asset delivery, or
  unauthenticated public agent-created delivery tokens from funnel editing.
- Checkout-link deletion, arbitrary offer mutation, order-bump mutation,
  live billing, one-click upsell charging, or fulfillment.
- Live owner-created product selection, signed URLs, private R2 delivery, or
  arbitrary customer fulfillment from delivery-gate links.
- Unauthenticated public agent publishing, direct checkout linking without owner-session confirmation,
  unauthenticated public agent-created delivery tokens, non-archived purge, bulk purge, or unauthenticated public writes.

The remaining post-MVP gaps are intentionally tracked together in issue #417 so future
work moves a coherent funnel workflow instead of adding more isolated readiness
metadata. Live publisher-offer billing remains separate in issue #219.

Current draft creation and step editing require an owner session, D1 storage, an
idempotency key, and an audit event. Creating a private draft from a reusable
template additionally requires exact template confirmation text; webinar and
resource templates create page-shape draft rows only and do not create webinar
provider, replay, private asset, or entitlement state. Duplicating a private
draft requires exact duplicate confirmation text, idempotency, and a current
revision ID; it creates a new private draft with copied ordered steps and
blocks, but strips checkout-link, resource-link, and webinar-link metadata so
billing-related, delivery-related, and event-related links must be reviewed and
re-linked separately. Editing a private draft block requires an
owner session, idempotency, and a current revision ID; it updates title/body copy
only and preserves block ID, kind, agent-editable flag, ordered step structure,
checkout-link metadata, resource-link metadata, and webinar-link metadata.
Applying a visual style preset requires an owner session, idempotency, and a
current revision ID; it stores only a curated style ID and preserves block ID,
kind, title/body copy, checkout-link metadata, resource-link metadata,
webinar-link metadata, and audit evidence while rendering in private previews
and public published funnel routes.
Adding, removing, or reordering draft blocks requires an owner session,
idempotency, and a current revision ID; additions come from the
reusable block library, removals refuse checkout-linked blocks, and each step
must keep at least one block. Reordering moves existing blocks only within the
same step while preserving block IDs, kinds, copy, checkout-link metadata,
resource-link metadata, webinar-link metadata, step membership, and audit
evidence. Cross-step moves append an existing block to another step while
preserving block IDs, kinds, copy, checkout-link metadata, resource-link
metadata, webinar-link metadata, and audit evidence; they refuse moves that
would leave the source step empty. Linking the seeded sandbox checkout offer
additionally requires exact checkout-link
confirmation text, idempotency, and a current revision ID; it stores public-safe
metadata in private draft step blocks and does not start checkout or enable live
billing by itself. Unlinking checkout metadata additionally requires exact
checkout-unlink confirmation text, idempotency, and a current revision ID; it
preserves the block ID, kind, title, body, step order, and audit evidence while
removing `checkoutLink` metadata so the block can be edited, relinked, or
removed through the normal unlinked-block path. Linking resource delivery
additionally requires exact resource-delivery confirmation text, idempotency,
and a current revision ID; it stores public-safe product, asset,
entitlement-template, and route metadata in private draft step blocks without
exposing private R2 keys, signed URLs, buyer records, raw checkout IDs,
arbitrary uploaded asset delivery, live fulfillment automation, or direct agent
writes. Linking webinar event/replay references additionally requires exact
webinar-link confirmation text, URL validation, idempotency, and a current
revision ID; it stores public-safe event title, provider label, registration URL,
and optional replay URL metadata in private draft webinar blocks without
creating provider events, reminder automation, attendance tracking, replay
hosting, provider secrets, private attendee records, billing mutation, or direct
agent writes. After publishing, a linked
checkout block can render the existing sandbox checkout start panel on the
public funnel route; that path remains exact-confirmed, idempotent, redacted,
and constrained to the seeded offer stack. Published resource-linked blocks can
render entitlement-safe access references while keeping private files and signed
URLs hidden, and can request a short-lived private download token through
`/api/funnels/resource-delivery` only when the submitted checkout intent,
entitlement, product, and file asset match the link stored on that published
block. The response returns a Bumpgrade download route backed by the existing
product download-token stream and does not expose private R2 keys, signed URLs,
buyer records, raw entitlement rows, arbitrary uploaded assets, or live
fulfillment automation. Verified owner-session agents can create the same
scoped delivery token through `/api/agent/funnels/resource-delivery-tokens`
after exact confirmation, idempotency, current published revision checks,
checkout intent, entitlement, and audit correlation; idempotent replays return
redacted audit metadata because raw bearer tokens are not stored. Published webinar-linked blocks can render external
registration and replay references while keeping provider secrets and attendee
records hidden. Owner product delivery-gate links can
connect an owner-created product test checkout link to the seeded offer/funnel
path, but only as redacted delivery-intent evidence. Current draft preview
requires an owner session and does not
publish private copy publicly. Publishing requires an owner session, the exact
publish confirmation text, an idempotency key, and a current revision ID.
Archiving or unpublishing requires an owner session, the exact archive
confirmation text, an idempotency key, and a current revision ID; it changes the
draft status to `archived`, clears the public route, removes the route from
published D1 funnel source data, and preserves draft rows, ordered steps, block
metadata, checkout-link metadata, resource-link metadata, webinar-link metadata,
and audit rows. Purging requires a draft that is already `archived`, the exact
purge confirmation text, an idempotency key, and the current archived revision
ID; it records a `funnel_purge_events` tombstone before deleting the draft and
step rows, and it does not delete prior audit rows, product assets, R2 objects,
buyer records, billing state, or raw owner data. The direct agent-safe draft
write endpoint requires an owner session, exact agent-funnel confirmation text,
an idempotency key, the current draft revision ID, and an audit correlation ID.
It can update private draft block title/body copy, link and unlink checkout
metadata, apply curated visual style presets, add reusable blocks, remove eligible unlinked blocks, link
resource-delivery metadata, link webinar-event metadata, move blocks, duplicate
a private draft, publish a draft, archive/unpublish a draft, or purge an already
archived draft while returning only redacted draft or purge tombstone summaries.
The owner-session resource-token endpoint can create a scoped download token for
published linked resource blocks; it does not expose raw tokens on replay,
private R2 keys, signed URLs, buyer data, or owner identity.
Future unauthenticated public agent publishing, unauthenticated public agent-created delivery tokens, live
billing, live webinar scheduling, attendance tracking, replay hosting,
arbitrary uploaded private asset delivery, signed URLs, live fulfillment
automation, non-archived purge, and bulk purge
must add stronger rollback and provider safety notes before acting on draft
state.
