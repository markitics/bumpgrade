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
#341 adds owner-confirmed archive/unpublish lifecycle actions. Issue #430 adds
owner-session granular block title/body editing that preserves block IDs, block
kinds, ordered step structure, and checkout-link metadata. Issue #432 adds
owner-session block add/remove controls backed by the reusable block library
while refusing checkout-linked block removal. Issue #409 links owner-created
product test checkout links to the seeded offer/funnel delivery gates without
live billing, signed URLs, private R2 delivery, or arbitrary customer
fulfillment. Issue #417 adds owner-confirmed checkout unlinking,
owner-confirmed resource delivery links to product/access catalog assets, and
owner-session within-step block reordering plus cross-step block moves, and remains the single post-MVP
bucket for freeform drag-and-drop canvas editing, arbitrary private R2 delivery,
live fulfillment automation, webinar
integrations, physical deletion policy, and direct agent-safe write tools.

Live in this slice:

- `/funnels/source-data`: public-safe JSON with one seeded draft funnel, ordered
  steps, block IDs, reusable funnel templates, block-template records, revision
  ID, preview route, webinar/resource page-shape metadata, owner-session
  editable draft capability metadata, owner-session checkout-link capability
  metadata, owner-session resource delivery link capability metadata,
  owner-session block reorder capability metadata, owner-session cross-step
  block move capability metadata, owner-session
  archive/unpublish lifecycle metadata, published D1 funnel
  summaries, aggregate owner product delivery-gate counts, and write boundary.
- `/funnels/indie-launch-sandbox`: crawlable semantic preview of the seeded
  opt-in, sales, and thank-you funnel, including reusable template and block
  library cards.
- `/funnels/:slug`: crawlable semantic public route for published D1 draft
  funnels, with unpublished private draft copy excluded from source data. When a
  published checkout block carries owner-confirmed `checkoutLink` metadata, the
  route renders the sandbox checkout start panel for the seeded offer stack.
- `/admin/funnels`: Better Auth owner-gated page that can seed, create, edit,
  reorder, create private drafts from reusable templates, duplicate private
  drafts, edit existing block title/body copy, add reusable block-library blocks,
  reorder existing blocks within the same step, move existing blocks between
  steps, remove safe unlinked blocks, attach the seeded sandbox checkout offer to
  checkout blocks, unlink checkout metadata from draft blocks, link
  resource/delivery blocks to product access assets, and publish, archive, or
  unpublish private D1 draft funnels with ordered steps.
- `/admin/funnels/:draftId/preview`: Better Auth owner-gated preview of the
  current private D1 draft sequence.
- `/api/admin/funnels/drafts`: owner-session POST endpoint for seed/create,
  template-to-draft create, private draft duplicate, step update, step reorder,
  block update, block add, block remove, block-reorder, block-cross-step-move, checkout-link,
  checkout-unlink, resource-delivery-link, exact-confirmed publish, and exact-confirmed
  archive/unpublish actions with idempotency, revision checks, and audit rows.
  Reusable webinar/resource templates use the same exact-confirmed
  template-to-draft path.
- D1 tables: `funnel_drafts`, `funnel_draft_steps`, and `funnel_audit_events`.
- Agent manifest entries for reading funnel state, distinguishing owner-session
  draft capability, and future MCP resources/tools.

Not live in this slice:

- Freeform drag-and-drop visual editing.
- Direct removal of checkout-linked blocks without first unlinking checkout
  metadata.
- Physical deletion of funnels.
- Live webinar scheduling, attendance tracking, reminder sending, replay
  hosting, or provider integrations.
- Arbitrary private resource file delivery, R2 object selection, signed URLs,
  live fulfillment automation, or direct customer access from funnel editing.
- Checkout-link deletion, arbitrary offer mutation, order-bump mutation,
  live billing, one-click upsell charging, or fulfillment.
- Live owner-created product selection, signed URLs, private R2 delivery, or
  arbitrary customer fulfillment from delivery-gate links.
- Agent-initiated draft edits or publishing tools.

These post-MVP gaps are intentionally tracked together in issue #417 so future
work moves a coherent funnel workflow instead of adding more isolated readiness
metadata. Live publisher-offer billing remains separate in issue #219.

Current draft creation and step editing require an owner session, D1 storage, an
idempotency key, and an audit event. Creating a private draft from a reusable
template additionally requires exact template confirmation text; webinar and
resource templates create page-shape draft rows only and do not create webinar
provider, replay, private asset, or entitlement state. Duplicating a private
draft requires exact duplicate confirmation text, idempotency, and a current
revision ID; it creates a new private draft with copied ordered steps and
blocks, but strips checkout-link and resource-link metadata so billing-related
and delivery-related links must be reviewed and re-linked separately. Editing a
private draft block requires an
owner session, idempotency, and a current revision ID; it updates title/body copy
only and preserves block ID, kind, agent-editable flag, ordered step structure,
checkout-link metadata, and resource-link metadata. Adding, removing, or
reordering draft blocks requires an owner
session, idempotency, and a current revision ID; additions come from the
reusable block library, removals refuse checkout-linked blocks, and each step
must keep at least one block. Reordering moves existing blocks only within the
same step while preserving block IDs, kinds, copy, checkout-link metadata,
resource-link metadata, step membership, and audit evidence. Cross-step moves
append an existing block to another step while preserving block IDs, kinds,
copy, checkout-link metadata, resource-link metadata, and audit evidence; they
refuse moves that would leave the source step empty. Linking the seeded sandbox checkout offer
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
writes. After publishing, a linked
checkout block can render the existing sandbox checkout start panel on the
public funnel route; that path remains exact-confirmed, idempotent, redacted,
and constrained to the seeded offer stack. Published resource-linked blocks can
render entitlement-safe access references while keeping private files and signed
URLs hidden. Owner product delivery-gate links can
connect an owner-created product test checkout link to the seeded offer/funnel
path, but only as redacted delivery-intent evidence. Current draft preview
requires an owner session and does not
publish private copy publicly. Publishing requires an owner session, the exact
publish confirmation text, an idempotency key, and a current revision ID.
Archiving or unpublishing requires an owner session, the exact archive
confirmation text, an idempotency key, and a current revision ID; it changes the
draft status to `archived`, clears the public route, removes the route from
published D1 funnel source data, and preserves draft rows, ordered steps, block
metadata, checkout-link metadata, resource-link metadata, and audit rows. Future
direct agent writes, direct agent checkout unlinking, direct agent resource
delivery linking, direct agent block reordering, direct agent cross-step block
moves, live
billing, live webinar integrations, arbitrary private R2 delivery, signed URLs,
live fulfillment automation, physical deletion, and destructive draft actions
must add explicit confirmation, stale-state checks,
audit correlation, redaction, and rollback notes before acting on draft state.
