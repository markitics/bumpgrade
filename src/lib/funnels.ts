export type FunnelStatus = "draft" | "published";
export type FunnelStepKind = "opt_in" | "sales" | "checkout" | "upsell" | "thank_you";
export type FunnelBlockKind = "hero" | "benefits" | "proof" | "cta" | "checkout" | "delivery";

export type FunnelBlock = {
  id: string;
  kind: FunnelBlockKind;
  title: string;
  body: string;
  agentEditable: boolean;
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
  draftCreation: "future-confirmed-write";
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

export const funnelsUpdatedAt = "2026-05-19";
export const draftFunnelBuilderIssue = 91;
export const draftFunnelStepEditingIssue = 93;
export const draftFunnelPreviewIssue = 95;
export const draftFunnelPublishingIssue = 135;
export const funnelTemplateLibraryIssue = 159;
export const draftFunnelBuilderParentIssue = 14;

export const draftFunnelBuilderWriteBoundary =
  "Owner-session draft writes are live for creating, seeding, step editing, step reordering, private preview, and exact-confirmed public publishing of D1 draft funnels. Deleting, archiving, checkout linking, drag-and-drop visual editing, and agent-initiated edits still require future confirmed-write APIs with actor identity, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.";

export const editableDraftCapability = {
  id: "editable-funnel-drafts-admin",
  status: "owner-session-publish-ready",
  issue: draftFunnelPublishingIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  previewRoutePattern: "/admin/funnels/:draftId/preview",
  createEndpoint: "/api/admin/funnels/drafts",
  editEndpoint: "/api/admin/funnels/drafts",
  publishEndpoint: "/api/admin/funnels/drafts",
  storage: ["funnel_drafts", "funnel_draft_steps", "funnel_audit_events"],
  auth: "owner-session",
  safeForPublicAgents: [
    "Read that editable D1-backed draft funnels exist behind owner auth.",
    "Read that owner sessions can update and reorder draft funnel steps.",
    "Read that owner sessions can preview private D1 draft state without publishing it.",
    "Read that owner sessions can publish a D1 draft to a stable public funnel route after exact confirmation.",
    "Distinguish private draft creation from public funnel preview and publishing.",
    "Cite issues #91, #93, #95, and #135 before claiming editable or publishable draft capability.",
  ],
  notYetLive: [
    "Checkout-step linking",
    "Drag-and-drop layout editing",
    "Deletion/archive workflows",
    "Agent-initiated edits without owner confirmation",
  ],
  writeBoundary: draftFunnelBuilderWriteBoundary,
};

export const seededFunnel: FunnelRecord = {
  id: "funnel-indie-launch-sandbox",
  slug: "indie-launch-sandbox",
  title: "Indie launch sandbox funnel",
  status: "draft",
  issue: 79,
  parentIssue: 14,
  summary:
    "A read-only three-step launch funnel scaffold that proves ordered funnel state, page blocks, preview rendering, and source-data discovery before write APIs exist.",
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
          body: "Future slices connect this block to forms, consent, tags, and email automation records.",
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
          body: "Position the paid offer while marking generated copy as draft until the publisher reviews it.",
          agentEditable: true,
        },
        {
          id: "block-sales-proof",
          kind: "proof",
          title: "Evidence and proof",
          body: "Reference source IDs, screenshots, customer-approved quotes, or shipped-product evidence only.",
          agentEditable: true,
        },
        {
          id: "block-sales-checkout",
          kind: "checkout",
          title: "Checkout handoff",
          body: "This slice links to the commerce contract; billing writes remain disabled until confirmed-write checkout rules are met.",
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
          body: "Future slices connect this block to products, memberships, downloads, and subscription access records.",
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
    "Issue #79 is read-only. Creating, editing, publishing, deleting, checkout-linking, or agent-writing funnel state requires actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.",
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
    draftCreation: "future-confirmed-write",
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
    draftCreation: "future-confirmed-write",
    steps: [
      { order: 1, kind: "opt_in", title: "Lead capture", requiredBlockKinds: ["hero", "benefits", "cta"] },
      { order: 2, kind: "sales", title: "Offer and proof", requiredBlockKinds: ["hero", "proof", "checkout"] },
      { order: 3, kind: "thank_you", title: "Delivery expectation", requiredBlockKinds: ["hero", "delivery", "cta"] },
    ],
  },
  {
    id: "template-post-purchase-offer",
    title: "Post-purchase offer path",
    audience: "Publishers testing non-billing upsell or downsell messaging after trusted checkout state.",
    goal: "Present a follow-up offer decision path without creating one-click billing or fulfillment mutations.",
    recommendedFor: ["upsell", "downsell", "checkout follow-up"],
    sourceIssue: funnelTemplateLibraryIssue,
    draftCreation: "future-confirmed-write",
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
    purpose: "Anchor claims to source IDs, screenshots, approved quotes, or shipped-product evidence.",
    agentEditable: true,
    safeInputs: ["source IDs", "approved quotes", "screenshot URLs", "PR evidence"],
    writeBoundary: "Only cite verified evidence; private customer data stays excluded.",
  },
  {
    id: "block-template-checkout",
    kind: "checkout",
    title: "Checkout handoff",
    purpose: "Connect the funnel to a checkout contract without exposing raw Stripe or buyer data.",
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
    id: "block-template-cta",
    kind: "cta",
    title: "Primary call to action",
    purpose: "Render the next action for opt-in, checkout, reply, or follow-up paths.",
    agentEditable: true,
    safeInputs: ["route", "button label", "confirmation requirement"],
    writeBoundary: "Public CTA changes require owner confirmation when they affect publishing, billing, or creator speech.",
  },
];

export function getFunnelBySlug(slug: string) {
  return seededFunnels.find((funnel) => funnel.slug === slug) ?? null;
}

export const funnelSourceData = {
  id: "bumpgrade-funnel-source-data",
  updatedAt: funnelsUpdatedAt,
  status: "read-contract-template-library-ready",
  issue: funnelTemplateLibraryIssue,
  parentIssue: 14,
  generatedFrom: "src/lib/funnels.ts",
  routes: ["/funnels/source-data", ...seededFunnels.map((funnel) => funnel.previewRoute)],
  adminRoutes: [editableDraftCapability.adminRoute, editableDraftCapability.previewRoutePattern],
  stableIds: [
    "funnelId",
    "funnelStepId",
    "funnelBlockId",
    "funnelTemplateId",
    "funnelBlockTemplateId",
    "funnelRevisionId",
    "funnelDraftId",
    "funnelAuditEventId",
    "agentActionId",
  ],
  writeBoundary: seededFunnel.writeBoundary,
  editableDraftCapability,
  templateLibraryIssue: funnelTemplateLibraryIssue,
  templates: funnelTemplateLibrary,
  blockLibrary: funnelBlockLibrary,
  funnels: seededFunnels,
  caveat:
    "This public contract proves read and preview semantics, reusable template and block-template records, plus the existence of an owner-session D1 draft builder with step edit/reorder controls, owner-gated private draft preview, and exact-confirmed public publishing. Template-to-draft creation, block editing, checkout integration, drag-and-drop visual building, and unconfirmed agent-write APIs are not live.",
};
