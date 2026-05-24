import { productDeliveryGateApiRoute } from "@/lib/product-delivery-gates";

export type FunnelStatus = "draft" | "published";
export type FunnelStepKind = "opt_in" | "sales" | "checkout" | "upsell" | "webinar" | "resource" | "thank_you";
export type FunnelBlockKind = "hero" | "benefits" | "proof" | "cta" | "checkout" | "delivery" | "webinar" | "resource";

export type FunnelBlock = {
  id: string;
  kind: FunnelBlockKind;
  title: string;
  body: string;
  agentEditable: boolean;
  checkoutLink?: FunnelCheckoutLink | null;
};

export type FunnelStep = {
  id: string;
  slug: string;
  order: number;
  kind: FunnelStepKind;
  title: string;
  goal: string;
  routeAnchor: string;
  blocks: FunnelBlock[];
};

export type FunnelRecord = {
  id: string;
  slug: string;
  title: string;
  status: FunnelStatus;
  issue: number;
  parentIssue: number;
  summary: string;
  audienceSegmentIds: string[];
  linkedFeatureIds: string[];
  previewRoute: string;
  sourceDataRoute: string;
  revisionId: string;
  steps: FunnelStep[];
  writeBoundary: string;
  validation: string[];
};

export type FunnelTemplateStep = {
  order: number;
  kind: FunnelStepKind;
  title: string;
  requiredBlockKinds: FunnelBlockKind[];
};

export type FunnelTemplate = {
  id: string;
  title: string;
  audience: string;
  goal: string;
  recommendedFor: string[];
  steps: FunnelTemplateStep[];
  sourceIssue: number;
  draftCreation: "future-confirmed-write" | "owner-session-confirmed-write";
};

export type FunnelBlockLibraryItem = {
  id: string;
  kind: FunnelBlockKind;
  title: string;
  purpose: string;
  agentEditable: boolean;
  safeInputs: string[];
  writeBoundary: string;
};

export type FunnelCheckoutLink = {
  id: string;
  status: "owner-session-linked";
  issue: number;
  parentIssue: number;
  offerStackId: string;
  offerId: string;
  offerKind: "primary" | "order_bump" | "upsell" | "downsell";
  offerTitle: string;
  priceId: string;
  productId: string;
  checkoutEndpoint: string;
  offerPreviewRoute: string;
  offerSourceDataRoute: string;
  checkoutContractRoute: string;
  mode: "sandbox";
  liveBillingEnabled: false;
  confirmationRequired: true;
  idempotencyRequired: true;
  staleRevisionRequired: true;
  rawStripeIdsIncluded: false;
  linkedAt: string | null;
};

export const funnelsUpdatedAt = "2026-05-24";
export const draftFunnelBuilderIssue = 91;
export const draftFunnelStepEditingIssue = 93;
export const draftFunnelPreviewIssue = 95;
export const draftFunnelPublishingIssue = 135;
export const funnelTemplateLibraryIssue = 159;
export const draftFunnelTemplateCreationIssue = 161;
export const draftFunnelCheckoutLinkingIssue = 163;
export const publicFunnelCheckoutStartIssue = 165;
export const funnelWebinarResourceTemplateIssue = 213;
export const draftFunnelDuplicationIssue = 215;
export const draftFunnelArchiveIssue = 341;
export const draftFunnelBlockEditingIssue = 430;
export const draftFunnelBuilderParentIssue = 14;

export const draftFunnelBuilderWriteBoundary =
  "Owner-session draft writes are live for creating, seeding, webinar/resource template-to-draft creation, private draft duplication, step editing, step reordering, granular block title/body editing with preserved block metadata, private preview, exact-confirmed public publishing of D1 draft funnels, exact-confirmed archive/unpublish, and exact-confirmed checkout-offer linking on private draft steps. Deleting, destructive purge, drag-and-drop visual editing, block add/remove, direct agent template creation or duplication, direct webinar scheduling, private resource delivery, and agent-initiated edits still require future confirmed-write APIs with actor identity, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.";

export const editableDraftCapability = {
  id: "editable-funnel-drafts-admin",
  status: "owner-session-lifecycle-ready",
  issue: draftFunnelArchiveIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  previewRoutePattern: "/admin/funnels/:draftId/preview",
  createEndpoint: "/api/admin/funnels/drafts",
  editEndpoint: "/api/admin/funnels/drafts",
  duplicateEndpoint: "/api/admin/funnels/drafts",
  publishEndpoint: "/api/admin/funnels/drafts",
  archiveEndpoint: "/api/admin/funnels/drafts",
  checkoutLinkEndpoint: "/api/admin/funnels/drafts",
  blockEditEndpoint: "/api/admin/funnels/drafts",
  storage: ["funnel_drafts", "funnel_draft_steps", "funnel_audit_events"],
  auth: "owner-session",
  safeForPublicAgents: [
    "Read that editable owner-gated draft funnels exist behind owner auth.",
    "Read that owner sessions can update and reorder draft funnel steps.",
    "Read that owner sessions can edit draft block titles and body copy while preserving block IDs, kinds, and checkout-link metadata.",
    "Read that owner sessions can preview private D1 draft state without publishing it.",
    "Read that owner sessions can publish a D1 draft to a stable public funnel route after exact confirmation.",
    "Read that owner sessions can attach the seeded sandbox checkout offer to a private draft step after exact confirmation.",
    "Read that owner sessions can duplicate a private draft after exact confirmation and a fresh revision check.",
    "Read that owner sessions can create private webinar and resource funnel drafts from reusable templates after exact confirmation.",
    "Read that owner sessions can archive private drafts or unpublish public D1 draft funnels after exact confirmation.",
    "Read that published linked checkout blocks can render the existing sandbox checkout start surface.",
    "Distinguish private draft creation from public funnel preview and publishing.",
    "Cite issues #91, #93, #95, #135, #163, #165, #213, #215, #341, and #430 before claiming editable, publishable, checkout-linkable, public checkout-start, webinar-template, resource-template, duplicate, archive/unpublish, or granular block-edit capability.",
  ],
  notYetLive: [
    "Drag-and-drop layout editing",
    "Block add/remove controls",
    "Destructive deletion or purge workflows",
    "Live webinar scheduling or replay hosting",
    "Private resource delivery",
    "Agent-initiated edits without owner confirmation",
    "Agent-initiated duplication without owner confirmation",
    "Agent-initiated archive/unpublish without owner confirmation",
  ],
  writeBoundary: draftFunnelBuilderWriteBoundary,
};

export const draftFunnelBlockEditingCapability = {
  id: "funnel-draft-block-edit-owner-confirmed",
  status: "owner-session-confirmed-write-ready",
  issue: draftFunnelBlockEditingIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: false,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  preservesBlockIds: true,
  preservesBlockKinds: true,
  preservesCheckoutLinks: true,
  editableFields: ["title", "body"],
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can edit draft block title and body copy from /admin/funnels.",
    "Read that block edits require an owner session, idempotency key, and fresh draft revision.",
    "Read that block ID, kind, agent-editable flag, and checkout-link metadata are preserved by block edits.",
    "Distinguish granular block copy editing from drag-and-drop layout editing, block add/remove, live billing, private resource delivery, or direct agent writes.",
  ],
  notYetLive: [
    "Direct agent block edits without owner confirmation",
    "Block add/remove controls",
    "Drag-and-drop visual layout editing",
    "Checkout-link deletion from block editing",
    "Live billing or fulfillment mutation from block editing",
  ],
  writeBoundary:
    "Issue #430 lets verified owners edit title and body copy on existing private draft blocks after idempotency and a fresh revision check. The write preserves block IDs, block kinds, agent-editable flags, checkout-link metadata, ordered step structure, and audit evidence. It does not add, delete, reorder, publish, bill, fulfill, schedule webinars, expose private resource delivery, or create direct public agent writes.",
};

export const draftFunnelDuplicationCapability = {
  id: "funnel-draft-duplicate-owner-confirmed",
  status: "owner-session-confirmed-write-ready",
  issue: draftFunnelDuplicationIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  duplicateEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  copiesOrderedSteps: true,
  copiesBlocks: true,
  copiesCheckoutLinks: false,
  publishesDuplicate: false,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can duplicate a private draft into another private draft only after exact confirmation.",
    "Read that duplication requires the current draft revision and idempotency key to prevent stale or repeated writes.",
    "Read that ordered steps and blocks are copied, but checkout-link metadata is intentionally stripped before the duplicate can be reviewed.",
    "Distinguish owner-gated duplication from publishing, deletion, unpublishing, live billing, or direct public agent draft writes.",
  ],
  notYetLive: [
    "Direct agent duplication without owner confirmation",
    "Copying checkout-link metadata by default",
    "Publishing the duplicate automatically",
    "Destructive deletion or purge lifecycle actions",
  ],
  writeBoundary:
    "Issue #215 lets verified owners duplicate a private D1 draft funnel after exact confirmation, idempotency, and a fresh revision check. The duplicate remains private, gets new draft and step IDs, and strips checkout-link metadata so billing-related links must be reviewed and re-linked separately.",
};

export const draftFunnelArchiveCapability = {
  id: "funnel-draft-archive-owner-confirmed",
  status: "owner-session-confirmed-write-ready",
  issue: draftFunnelArchiveIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  archiveEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  statusAfterArchive: "archived",
  clearsPublicPreviewRoute: true,
  deletesDraftRows: false,
  deletesStepRows: false,
  deletesAuditRows: false,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can archive a private draft only after exact confirmation.",
    "Read that archiving a published D1 draft clears its public route and removes it from published funnel source-data.",
    "Read that archived drafts become read-only while keeping draft, step, block, checkout-link, and audit evidence for owner review.",
    "Distinguish owner-gated archive/unpublish from destructive deletion, public agent writes, or content purge.",
  ],
  notYetLive: [
    "Destructive deletion or purge",
    "Direct agent archive/unpublish without owner confirmation",
    "Automatic redirects from archived public routes",
  ],
  writeBoundary:
    "Issue #341 lets verified owners archive private draft funnels or unpublish published D1 draft funnels after exact confirmation, idempotency, and a fresh revision check. It makes the archived draft read-only, clears the public preview route, and removes the draft from published funnel source-data without deleting draft rows, steps, blocks, checkout links, or audit records.",
};

export const seededFunnel: FunnelRecord = {
  id: "funnel-indie-launch-sandbox",
  slug: "indie-launch-sandbox",
  title: "Indie launch funnel",
  status: "draft",
  issue: 79,
  parentIssue: 14,
  summary:
    "A three-step launch funnel for capturing interest, presenting the paid offer, and guiding buyers into delivery and follow-up.",
  audienceSegmentIds: ["audience-creators", "audience-newsletter-publishers", "audience-indie-hackers"],
  linkedFeatureIds: ["feature-funnel-builder", "feature-checkout-offers", "feature-agent-ready-contracts"],
  previewRoute: "/funnels/indie-launch-sandbox",
  sourceDataRoute: "/funnels/source-data",
  revisionId: "funnel-revision-indie-launch-sandbox-2026-05-18",
  steps: [
    {
      id: "funnel-step-indie-launch-opt-in",
      slug: "warm-list-opt-in",
      order: 1,
      kind: "opt_in",
      title: "Warm list opt-in",
      goal: "Capture interested subscribers before the offer opens.",
      routeAnchor: "warm-list-opt-in",
      blocks: [
        {
          id: "block-opt-in-hero",
          kind: "hero",
          title: "Lead with the promise",
          body: "Describe the outcome, who it is for, and what the subscriber receives next.",
          agentEditable: true,
        },
        {
          id: "block-opt-in-benefits",
          kind: "benefits",
          title: "Why join the waitlist",
          body: "List the practical reasons to subscribe without inventing testimonials or revenue claims.",
          agentEditable: true,
        },
        {
          id: "block-opt-in-cta",
          kind: "cta",
          title: "Email capture",
          body: "Connect this block to a consented form, tags, and follow-up email.",
          agentEditable: false,
        },
      ],
    },
    {
      id: "funnel-step-indie-launch-sales",
      slug: "offer-sales-page",
      order: 2,
      kind: "sales",
      title: "Offer sales page",
      goal: "Explain the offer, the transformation, objections, and next action.",
      routeAnchor: "offer-sales-page",
      blocks: [
        {
          id: "block-sales-hero",
          kind: "hero",
          title: "Offer headline",
          body: "Position the paid offer with a clear buyer promise and next action.",
          agentEditable: true,
        },
        {
          id: "block-sales-proof",
          kind: "proof",
          title: "Evidence and proof",
          body: "Use screenshots, customer-approved quotes, product proof, or clear examples that support the claim.",
          agentEditable: true,
        },
        {
          id: "block-sales-checkout",
          kind: "checkout",
          title: "Checkout handoff",
          body: "Send buyers from the offer page into a checkout that matches the current offer stack.",
          agentEditable: false,
        },
      ],
    },
    {
      id: "funnel-step-indie-launch-thank-you",
      slug: "thank-you-delivery",
      order: 3,
      kind: "thank_you",
      title: "Thank-you and delivery",
      goal: "Confirm the next step and prepare fulfillment or nurture.",
      routeAnchor: "thank-you-delivery",
      blocks: [
        {
          id: "block-thank-you-confirmation",
          kind: "hero",
          title: "Purchase or signup confirmation",
          body: "Tell the buyer what happened and what to expect next without exposing private order data.",
          agentEditable: true,
        },
        {
          id: "block-thank-you-delivery",
          kind: "delivery",
          title: "Delivery status",
          body: "Connect the buyer to products, memberships, downloads, or subscription access.",
          agentEditable: false,
        },
        {
          id: "block-thank-you-follow-up",
          kind: "cta",
          title: "Next relationship step",
          body: "Invite a reply, onboarding action, or referral only after consent and audience scope are known.",
          agentEditable: true,
        },
      ],
    },
  ],
  writeBoundary:
    "Issue #79 is read-only. Owner-session creating, editing, publishing, archive/unpublishing, and checkout-linking run through /admin/funnels with confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes; issue #409 links owner-created product test checkout links to the seeded offer/funnel delivery gates without live billing or fulfillment delivery; destructive deletion or direct agent-writing funnel state still requires future confirmed-write APIs.",
  validation: [
    "/funnels/source-data returns a three-step draft funnel.",
    "/funnels/indie-launch-sandbox renders semantic preview sections.",
    "/agent-docs/source-data lists the funnel read contract for future MCP resources.",
  ],
};

export const seededFunnels = [seededFunnel];

export const funnelTemplateLibrary: FunnelTemplate[] = [
  {
    id: "template-warm-list-opt-in",
    title: "Warm list opt-in funnel",
    audience: "Newsletter publishers and creators validating demand before a paid launch.",
    goal: "Capture consented subscribers, set expectations, and route them to a thank-you or nurture step.",
    recommendedFor: ["lead magnet", "waitlist", "prelaunch"],
    sourceIssue: funnelTemplateLibraryIssue,
    draftCreation: "owner-session-confirmed-write",
    steps: [
      { order: 1, kind: "opt_in", title: "Promise and email capture", requiredBlockKinds: ["hero", "benefits", "cta"] },
      { order: 2, kind: "thank_you", title: "Confirmation and next step", requiredBlockKinds: ["hero", "delivery", "cta"] },
    ],
  },
  {
    id: "template-launch-sales-stack",
    title: "Launch sales funnel",
    audience: "Indie sellers launching a digital product, cohort, service, or workshop.",
    goal: "Move a visitor from opt-in or offer context through proof, checkout handoff, and fulfillment expectation.",
    recommendedFor: ["digital product", "course", "service launch"],
    sourceIssue: funnelTemplateLibraryIssue,
    draftCreation: "owner-session-confirmed-write",
    steps: [
      { order: 1, kind: "opt_in", title: "Lead capture", requiredBlockKinds: ["hero", "benefits", "cta"] },
      { order: 2, kind: "sales", title: "Offer and proof", requiredBlockKinds: ["hero", "proof", "checkout"] },
      { order: 3, kind: "thank_you", title: "Delivery expectation", requiredBlockKinds: ["hero", "delivery", "cta"] },
    ],
  },
  {
    id: "template-webinar-registration-replay",
    title: "Webinar registration and replay funnel",
    audience: "Publishers running live workshops, launch webinars, trainings, or recorded replay campaigns.",
    goal: "Collect registrations, explain the session promise, and route attendees to replay or resource follow-up.",
    recommendedFor: ["webinar", "workshop", "training", "launch event"],
    sourceIssue: funnelWebinarResourceTemplateIssue,
    draftCreation: "owner-session-confirmed-write",
    steps: [
      { order: 1, kind: "webinar", title: "Registration and agenda", requiredBlockKinds: ["hero", "webinar", "proof", "cta"] },
      { order: 2, kind: "resource", title: "Replay and resources", requiredBlockKinds: ["hero", "resource", "delivery", "cta"] },
      { order: 3, kind: "thank_you", title: "Follow-up confirmation", requiredBlockKinds: ["hero", "delivery", "cta"] },
    ],
  },
  {
    id: "template-resource-library-opt-in",
    title: "Resource library opt-in funnel",
    audience: "Newsletter publishers and educators packaging guides, templates, checklists, and launch resources.",
    goal: "Present a public resource promise, capture consent, and set clear fulfillment expectations.",
    recommendedFor: ["lead magnet", "resource hub", "template library", "buyer onboarding"],
    sourceIssue: funnelWebinarResourceTemplateIssue,
    draftCreation: "owner-session-confirmed-write",
    steps: [
      { order: 1, kind: "resource", title: "Resource library overview", requiredBlockKinds: ["hero", "resource", "benefits", "cta"] },
      { order: 2, kind: "opt_in", title: "Access request", requiredBlockKinds: ["hero", "benefits", "cta"] },
      { order: 3, kind: "thank_you", title: "Access expectation", requiredBlockKinds: ["hero", "delivery", "cta"] },
    ],
  },
  {
    id: "template-post-purchase-offer",
    title: "Post-purchase offer path",
    audience: "Publishers testing non-billing upsell or downsell messaging after trusted checkout state.",
    goal: "Present a follow-up offer decision path after checkout.",
    recommendedFor: ["upsell", "downsell", "checkout follow-up"],
    sourceIssue: funnelTemplateLibraryIssue,
    draftCreation: "owner-session-confirmed-write",
    steps: [
      { order: 1, kind: "checkout", title: "Trusted checkout handoff", requiredBlockKinds: ["checkout", "proof"] },
      { order: 2, kind: "upsell", title: "Follow-up offer", requiredBlockKinds: ["hero", "benefits", "cta"] },
      { order: 3, kind: "thank_you", title: "Final confirmation", requiredBlockKinds: ["delivery", "cta"] },
    ],
  },
];

export const funnelBlockLibrary: FunnelBlockLibraryItem[] = [
  {
    id: "block-template-hero",
    kind: "hero",
    title: "Outcome-led hero",
    purpose: "State the offer, audience, and primary action without unsupported claims.",
    agentEditable: true,
    safeInputs: ["offer title", "audience segment", "approved value proposition"],
    writeBoundary: "Creator-speech changes require owner review before publishing.",
  },
  {
    id: "block-template-benefits",
    kind: "benefits",
    title: "Benefit stack",
    purpose: "List practical outcomes, objections, and reasons to continue.",
    agentEditable: true,
    safeInputs: ["feature IDs", "audience pain points", "approved offer notes"],
    writeBoundary: "Do not invent revenue, testimonial, or guarantee claims.",
  },
  {
    id: "block-template-proof",
    kind: "proof",
    title: "Evidence and proof",
    purpose: "Anchor claims to screenshots, approved quotes, product examples, or customer-visible proof.",
    agentEditable: true,
    safeInputs: ["source IDs", "approved quotes", "screenshot URLs", "PR evidence"],
    writeBoundary: "Only cite verified evidence; private customer data stays excluded.",
  },
  {
    id: "block-template-checkout",
    kind: "checkout",
    title: "Checkout handoff",
    purpose: "Connect the funnel to checkout while keeping buyer and payment details private.",
    agentEditable: false,
    safeInputs: ["offer ID", "price ID alias", "checkout route"],
    writeBoundary: "Billing-impacting changes require confirmed-write checkout APIs.",
  },
  {
    id: "block-template-delivery",
    kind: "delivery",
    title: "Delivery and access status",
    purpose: "Explain what the customer receives and where fulfillment evidence comes from.",
    agentEditable: false,
    safeInputs: ["product ID", "entitlement template ID", "fulfillment status"],
    writeBoundary: "Do not expose private asset URLs, R2 keys, signed URLs, or buyer records.",
  },
  {
    id: "block-template-webinar",
    kind: "webinar",
    title: "Webinar agenda and access",
    purpose: "Describe session topic, timing, speaker promise, replay expectation, and access expectations.",
    agentEditable: true,
    safeInputs: ["webinar title", "agenda bullets", "approved speaker notes", "replay availability"],
    writeBoundary: "Scheduling, reminders, attendance tracking, and live-room links require future confirmed-write integrations.",
  },
  {
    id: "block-template-resource",
    kind: "resource",
    title: "Resource library promise",
    purpose: "List resources, formats, and access expectations without exposing private files or delivery links.",
    agentEditable: true,
    safeInputs: ["resource titles", "format labels", "approved public summaries", "delivery route"],
    writeBoundary: "Private file delivery, R2 object selection, signed URLs, and entitlement checks require future product/access contracts.",
  },
  {
    id: "block-template-cta",
    kind: "cta",
    title: "Primary call to action",
    purpose: "Render the next action for opt-in, checkout, reply, or follow-up paths.",
    agentEditable: true,
    safeInputs: ["route", "button label", "confirmation requirement"],
    writeBoundary: "Public CTA changes require owner confirmation when they affect publishing, billing, or creator speech.",
  },
];

export const templateDraftCreationCapability = {
  id: "template-to-draft-owner-confirmed",
  status: "owner-session-confirmed-write-ready",
  issue: draftFunnelTemplateCreationIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  createEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  safeForPublicAgents: [
    "Read that reusable funnel templates can become private drafts only behind owner auth.",
    "Read that template creation uses explicit confirmation and idempotency.",
    "Read that webinar and resource templates create private drafts through the same owner-session confirmed path.",
    "Distinguish owner-gated template-to-draft creation from direct unauthenticated agent writes.",
  ],
  notYetLive: ["Direct agent template creation", "Public publishing from a template without owner review"],
};

export const webinarResourceTemplateCapability = {
  id: "webinar-resource-funnel-template-contract",
  status: "owner-session-template-ready",
  issue: funnelWebinarResourceTemplateIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  createEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  stepKinds: ["webinar", "resource"] as FunnelStepKind[],
  blockKinds: ["webinar", "resource"] as FunnelBlockKind[],
  safeForPublicAgents: [
    "Read webinar and resource funnel templates with stable template IDs and issue evidence.",
    "Read that owner sessions can turn those templates into private D1 draft funnels after exact confirmation.",
    "Distinguish webinar/resource page scaffolds from live webinar scheduling, replay hosting, private downloads, or entitlement delivery.",
  ],
  notYetLive: [
    "Live webinar scheduling",
    "Calendar, room, or replay provider integrations",
    "Private resource asset delivery",
    "Agent-initiated webinar or resource draft creation without owner confirmation",
  ],
  writeBoundary:
    "Issue #213 adds public-safe webinar and resource page shapes to the reusable template/block library and the owner-session template-to-draft path. It does not create webinar provider state, calendar events, reminder sequences, replay hosting, private files, signed URLs, entitlements, or direct public agent writes.",
};

export const checkoutLinkingCapability = {
  id: "funnel-step-checkout-link-owner-confirmed",
  status: "owner-session-confirmed-write-ready",
  issue: draftFunnelCheckoutLinkingIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  createEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  storesIn: "funnel_draft_steps.blocks_json",
  auditTable: "funnel_audit_events",
  liveBillingEnabled: false,
  safeForPublicAgents: [
    "Read that private draft steps can carry a public-safe checkout offer link after owner confirmation.",
    "Read that the link points at Bumpgrade's sandbox checkout offer contract and does not start a checkout session by itself.",
    "Distinguish owner-gated checkout linking from direct agent checkout writes, live billing, and Stripe mutation.",
  ],
  notYetLive: [
    "Direct agent checkout linking without owner confirmation",
    "Live-mode checkout routing",
    "Checkout-link deletion or unpublishing",
    "Arbitrary offer or price mutation from funnel editing",
  ],
};

export const publicFunnelCheckoutStartCapability = {
  id: "public-funnel-linked-checkout-start",
  status: "sandbox-checkout-start-ready",
  issue: publicFunnelCheckoutStartIssue,
  parentIssue: 15,
  funnelParentIssue: draftFunnelBuilderParentIssue,
  publicRoutePattern: "/funnels/:slug",
  checkoutEndpoint: "/api/commerce/checkout",
  requiresPublishedFunnel: true,
  requiresCheckoutLink: true,
  confirmationRequired: true,
  idempotencyRequired: true,
  supportsOrderBumps: true,
  liveBillingEnabled: false,
  rawStripeIdsIncluded: false,
  safeForPublicAgents: [
    "Read that published funnel checkout blocks can render the sandbox checkout start surface only after an owner linked the checkout offer.",
    "Read that the public funnel route uses Bumpgrade's existing checkout endpoint, confirmation text, idempotency, and redacted redirect wrapper.",
    "Distinguish public funnel checkout start from live billing, direct Stripe URL exposure, one-click upsell charging, fulfillment, and agent billing writes.",
  ],
  notYetLive: [
    "Live billing from public funnel routes",
    "Direct agent-started checkout without confirmation",
    "Arbitrary offer, price, or order-bump mutation from the funnel page",
    "One-click post-purchase charging",
  ],
  writeBoundary:
    "Issue #165 lets published funnel pages render the existing checkout start surface when a checkout block carries owner-confirmed checkoutLink metadata. The route remains confirmation-gated, idempotent, redacted, and constrained to the seeded offer stack; live billing, arbitrary offer mutation, fulfillment, one-click upsell charging, and direct agent checkout writes require later confirmed-write APIs.",
};

export function getFunnelBySlug(slug: string) {
  return seededFunnels.find((funnel) => funnel.slug === slug) ?? null;
}

export const funnelSourceData = {
  id: "bumpgrade-funnel-source-data",
  updatedAt: funnelsUpdatedAt,
  status: "draft-block-edit-ready",
  issue: draftFunnelBlockEditingIssue,
  parentIssue: 14,
  generatedFrom: "src/lib/funnels.ts",
  routes: [
    "/funnels/source-data",
    "/api/commerce/checkout",
    productDeliveryGateApiRoute,
    ...seededFunnels.map((funnel) => funnel.previewRoute),
  ],
  adminRoutes: [editableDraftCapability.adminRoute, editableDraftCapability.previewRoutePattern],
  stableIds: [
    "funnelId",
    "funnelStepId",
    "funnelBlockId",
    "funnelTemplateId",
    "funnelBlockTemplateId",
    "funnelDraftBlockEditId",
    "funnelCheckoutLinkId",
    "funnelWebinarResourceTemplateId",
    "funnelRevisionId",
    "funnelDraftId",
    "funnelDraftDuplicateId",
    "funnelDraftArchiveId",
    "funnelAuditEventId",
    "checkoutIntentId",
    "checkoutOfferStackId",
    "offerId",
    "productDeliveryGateLinkId",
    "agentActionId",
  ],
  writeBoundary: seededFunnel.writeBoundary,
  editableDraftCapability,
  draftFunnelBlockEditingCapability,
  draftFunnelDuplicationCapability,
  draftFunnelArchiveCapability,
  templateDraftCreationCapability,
  webinarResourceTemplateCapability,
  checkoutLinkingCapability,
  publicFunnelCheckoutStartCapability,
  templateLibraryIssue: funnelTemplateLibraryIssue,
  templates: funnelTemplateLibrary,
  blockLibrary: funnelBlockLibrary,
  funnels: seededFunnels,
  caveat:
    "This public contract proves read and preview semantics, reusable template and block-template records including webinar and resource page shapes from issue #213, owner-session confirmed template-to-draft creation, owner-session private draft duplication from issue #215, owner-session checkout-offer linking on private draft steps, public sandbox checkout start rendering on published linked checkout blocks, owner-session granular block title/body editing from issue #430, owner-created product delivery-gate links for the seeded offer/funnel path from issue #409, exact-confirmed owner archive/unpublish from issue #341, plus the existence of an owner-session D1 draft builder with step edit/reorder controls, owner-gated private draft preview, and exact-confirmed public publishing. Direct agent template creation, direct agent block editing, block add/remove, live billing mutation, live webinar scheduling, replay hosting, private resource delivery, drag-and-drop visual building, destructive deletion, direct agent duplication, direct agent archive/unpublish, and unconfirmed agent-write APIs are not live.",
};
