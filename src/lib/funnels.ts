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

export const funnelsUpdatedAt = "2026-05-18";
export const draftFunnelBuilderIssue = 91;
export const draftFunnelBuilderParentIssue = 14;

export const draftFunnelBuilderWriteBoundary =
  "Owner-session draft writes are live only for creating or seeding private D1 draft funnels. Publishing, deleting, checkout linking, public preview generation, and agent-initiated edits still require future confirmed-write APIs with actor identity, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.";

export const editableDraftCapability = {
  id: "editable-funnel-drafts-admin",
  status: "owner-session-live",
  issue: draftFunnelBuilderIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  createEndpoint: "/api/admin/funnels/drafts",
  storage: ["funnel_drafts", "funnel_draft_steps", "funnel_audit_events"],
  auth: "owner-session",
  safeForPublicAgents: [
    "Read that editable D1-backed draft funnels exist behind owner auth.",
    "Distinguish private draft creation from public funnel preview and publishing.",
    "Cite issue #91 before claiming editable draft capability.",
  ],
  notYetLive: [
    "Public publishing",
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

export function getFunnelBySlug(slug: string) {
  return seededFunnels.find((funnel) => funnel.slug === slug) ?? null;
}

export const funnelSourceData = {
  id: "bumpgrade-funnel-source-data",
  updatedAt: funnelsUpdatedAt,
  status: "read-contract-and-owner-draft-ready",
  issue: draftFunnelBuilderIssue,
  parentIssue: 14,
  generatedFrom: "src/lib/funnels.ts",
  routes: ["/funnels/source-data", ...seededFunnels.map((funnel) => funnel.previewRoute)],
  adminRoutes: [editableDraftCapability.adminRoute],
  stableIds: [
    "funnelId",
    "funnelStepId",
    "funnelBlockId",
    "funnelRevisionId",
    "funnelDraftId",
    "funnelAuditEventId",
    "agentActionId",
  ],
  writeBoundary: seededFunnel.writeBoundary,
  editableDraftCapability,
  funnels: seededFunnels,
  caveat:
    "This public contract proves read and preview semantics plus the existence of an owner-session D1 draft builder. It does not expose private draft copy and is not a public publishing system, checkout integration, drag-and-drop visual builder, or unconfirmed agent-write API.",
};
