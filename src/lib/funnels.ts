import type { ProductAssetKind, ProductKind } from "@/lib/product-access";
import { productDeliveryGateApiRoute } from "@/lib/product-delivery-gates";

export type FunnelStatus = "draft" | "published";
export type FunnelStepKind = "opt_in" | "sales" | "checkout" | "upsell" | "webinar" | "resource" | "thank_you";
export type FunnelBlockKind = "hero" | "benefits" | "proof" | "cta" | "checkout" | "delivery" | "webinar" | "resource";
export type FunnelBlockVisualStyleId = "standard" | "spotlight" | "split" | "compact";

export type FunnelBlockVisualStyle = {
  id: FunnelBlockVisualStyleId;
  label: string;
  description: string;
  layout: "stacked" | "split" | "compact";
  emphasis: "neutral" | "high" | "conversion" | "quiet";
  className: string;
};

export type FunnelBlockCanvasLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

export type FunnelBlock = {
  id: string;
  kind: FunnelBlockKind;
  title: string;
  body: string;
  agentEditable: boolean;
  visualStyle?: FunnelBlockVisualStyleId;
  canvasLayout?: FunnelBlockCanvasLayout;
  checkoutLink?: FunnelCheckoutLink | null;
  resourceDeliveryLink?: FunnelResourceDeliveryLink | null;
  webinarEventLink?: FunnelWebinarEventLink | null;
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

export type FunnelResourceDeliveryLink = {
  id: string;
  status: "owner-session-linked";
  issue: number;
  parentIssue: number;
  productId: string;
  productTitle: string;
  productKind: ProductKind;
  assetId: string;
  assetTitle: string;
  assetKind: ProductAssetKind;
  entitlementTemplateId: string;
  entitlementTemplateTitle: string;
  accessRuleIds: string[];
  productSourceDataRoute: string;
  entitlementLookupRoute: string;
  downloadTokenEndpoint: string;
  protectedContentEndpoint: string;
  deliveryMode: "seeded-product-access-reference";
  confirmationRequired: true;
  idempotencyRequired: true;
  staleRevisionRequired: true;
  liveFulfillmentDeliveryEnabled: false;
  arbitraryUploadedAssetDeliveryEnabled: false;
  rawR2KeysIncluded: false;
  signedUrlsIncluded: false;
  buyerDataIncluded: false;
  linkedAt: string | null;
};

export type FunnelWebinarEventLink = {
  id: string;
  status: "owner-session-linked";
  issue: number;
  parentIssue: number;
  eventTitle: string;
  registrationUrl: string;
  replayUrl: string | null;
  providerLabel: string;
  accessMode: "external-event-reference";
  confirmationRequired: true;
  idempotencyRequired: true;
  staleRevisionRequired: true;
  liveSchedulingEnabled: false;
  reminderAutomationEnabled: false;
  attendanceTrackingEnabled: false;
  replayHostingEnabled: false;
  providerSecretsIncluded: false;
  privateAttendeeDataIncluded: false;
  linkedAt: string | null;
};

export const funnelsUpdatedAt = "2026-05-26";
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
export const draftFunnelBlockStructureIssue = 432;
export const draftFunnelAdvancedParityIssue = 417;
export const draftFunnelBuilderParentIssue = 14;
export const agentFunnelDraftWriteIssue = draftFunnelAdvancedParityIssue;
export const agentFunnelDraftWriteApiRoute = "/api/agent/funnels/draft-writes";
export const agentFunnelDraftWriteConfirmationText = "CONFIRM AGENT FUNNEL DRAFT WRITE";
export const agentFunnelResourceDeliveryTokenIssue = draftFunnelAdvancedParityIssue;
export const agentFunnelResourceDeliveryTokenStatus = "owner-session-agent-resource-delivery-token-ready";
export const agentFunnelResourceDeliveryTokenApiRoute = "/api/agent/funnels/resource-delivery-tokens";
export const agentFunnelResourceDeliveryTokenConfirmationText = "CONFIRM AGENT FUNNEL RESOURCE DELIVERY TOKEN";
export const defaultFunnelBlockVisualStyleId: FunnelBlockVisualStyleId = "standard";
export const funnelBlockVisualStyles: FunnelBlockVisualStyle[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Default stacked card treatment for ordinary funnel page blocks.",
    layout: "stacked",
    emphasis: "neutral",
    className: "funnel-block-style-standard",
  },
  {
    id: "spotlight",
    label: "Spotlight",
    description: "High-emphasis treatment for hero, proof, webinar, and offer promise blocks.",
    layout: "stacked",
    emphasis: "high",
    className: "funnel-block-style-spotlight",
  },
  {
    id: "split",
    label: "Split",
    description: "Two-column editorial treatment for comparison, proof, and benefit blocks.",
    layout: "split",
    emphasis: "conversion",
    className: "funnel-block-style-split",
  },
  {
    id: "compact",
    label: "Compact",
    description: "Dense treatment for follow-up, delivery, and secondary CTA blocks.",
    layout: "compact",
    emphasis: "quiet",
    className: "funnel-block-style-compact",
  },
];
export const agentFunnelDraftWriteOperationIds = [
  "update-block",
  "update-block-style",
  "update-block-canvas-layout",
  "add-block",
  "remove-block",
  "link-checkout-offer",
  "unlink-checkout",
  "link-resource-delivery",
  "link-webinar-event",
  "move-block",
  "move-block-to-step",
  "duplicate-draft",
  "publish-draft",
  "archive-draft",
  "purge-archived-draft",
  "bulk-purge-archived-drafts",
] as const;

export function isFunnelBlockVisualStyleId(value: string): value is FunnelBlockVisualStyleId {
  return funnelBlockVisualStyles.some((style) => style.id === value);
}

export function funnelBlockVisualStyleForId(value: string | null | undefined) {
  return funnelBlockVisualStyles.find((style) => style.id === value) ?? funnelBlockVisualStyles[0];
}

function numericLayoutValue(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampLayoutValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function defaultFunnelBlockCanvasLayoutForIndex(index = 0): FunnelBlockCanvasLayout {
  const safeIndex = Math.max(0, index);
  const column = safeIndex % 2;
  const row = Math.floor(safeIndex / 2);
  return {
    x: column === 0 ? 4 : 54,
    y: Math.min(78, 6 + row * 24),
    width: 42,
    height: 18,
    zIndex: Math.min(20, safeIndex + 1),
  };
}

export function normalizeFunnelBlockCanvasLayout(
  input: Partial<Record<keyof FunnelBlockCanvasLayout, unknown>> | null | undefined,
  fallbackIndex = 0,
): FunnelBlockCanvasLayout {
  const fallback = defaultFunnelBlockCanvasLayoutForIndex(fallbackIndex);
  const x = clampLayoutValue(numericLayoutValue(input?.x, fallback.x), 0, 80);
  const y = clampLayoutValue(numericLayoutValue(input?.y, fallback.y), 0, 90);
  const width = clampLayoutValue(numericLayoutValue(input?.width, fallback.width), 20, 100 - x);
  const height = clampLayoutValue(numericLayoutValue(input?.height, fallback.height), 14, 60);

  return {
    x,
    y,
    width,
    height,
    zIndex: clampLayoutValue(numericLayoutValue(input?.zIndex, fallback.zIndex), 0, 20),
  };
}

export function funnelBlockCanvasLayoutStyle(layout: FunnelBlockCanvasLayout): Record<string, string | number> {
  return {
    "--funnel-block-x": `${layout.x}%`,
    "--funnel-block-y": `${layout.y}%`,
    "--funnel-block-width": `${layout.width}%`,
    "--funnel-block-height": `${layout.height}%`,
    "--funnel-block-z": layout.zIndex,
  };
}

export const draftFunnelBuilderWriteBoundary =
  "Owner-session draft writes are live for creating, seeding, webinar/resource template-to-draft creation, private draft duplication, step editing, step reordering, granular block title/body editing with preserved block metadata, block add/remove from the reusable block library with checkout-linked block protection, owner-session visual style controls for existing blocks, bounded owner-session canvas layout controls for existing blocks, block reordering within a step while preserving checkout/resource/webinar metadata, drag/drop block placement through the existing block reorder and cross-step move endpoints, cross-step block moves that preserve block metadata, private preview, exact-confirmed public publishing of D1 draft funnels, exact-confirmed archive/unpublish, exact-confirmed archived-draft purge with tombstone evidence, exact-confirmed bulk archived-draft purge with one tombstone per draft, exact-confirmed checkout-offer linking on private draft steps, exact-confirmed checkout unlinking on private draft blocks, exact-confirmed resource delivery links to product/access catalog assets, funnel-scoped private download-token delivery on published resource blocks, owner-session agent-created resource delivery tokens for published linked resource blocks, exact-confirmed webinar event/replay links on private webinar blocks, and owner-session direct agent-safe draft writes for block copy edits, block visual styles, bounded block canvas layouts, block add/remove, checkout-offer linking, checkout unlinking, resource-delivery linking, webinar-event linking, within-step block reordering, cross-step block moves, private duplication, public publishing, archive/unpublish, archived-draft purge, and bulk archived-draft purge through /api/agent/funnels/draft-writes. Unbounded arbitrary CSS/script layout editing, unauthenticated public agent-created delivery tokens, direct webinar scheduling, attendance tracking, replay hosting, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, non-archived direct agent purge, and unauthenticated public agent writes still require future confirmed-write APIs with stronger rollback and provider safety notes.";

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
  purgeEndpoint: "/api/admin/funnels/drafts",
  checkoutLinkEndpoint: "/api/admin/funnels/drafts",
  checkoutUnlinkEndpoint: "/api/admin/funnels/drafts",
  resourceDeliveryLinkEndpoint: "/api/admin/funnels/drafts",
  webinarEventLinkEndpoint: "/api/admin/funnels/drafts",
  blockEditEndpoint: "/api/admin/funnels/drafts",
  blockStructureEndpoint: "/api/admin/funnels/drafts",
  blockVisualStyleEndpoint: "/api/admin/funnels/drafts",
  blockReorderEndpoint: "/api/admin/funnels/drafts",
  blockCrossStepMoveEndpoint: "/api/admin/funnels/drafts",
  storage: ["funnel_drafts", "funnel_draft_steps", "funnel_audit_events", "funnel_purge_events"],
  auth: "owner-session",
  safeForPublicAgents: [
    "Read that editable owner-gated draft funnels exist behind owner auth.",
    "Read that owner sessions can update and reorder draft funnel steps.",
    "Read that owner sessions can edit draft block titles and body copy while preserving block IDs, kinds, and checkout-link metadata.",
    "Read that owner sessions can add reusable block-library blocks to draft steps and remove safe unlinked blocks.",
    "Read that owner sessions can apply visual style presets to existing draft blocks and render them in private previews and public published routes.",
    "Read that owner sessions can set bounded canvas layout values for existing draft blocks and render them in private previews and public published routes.",
    "Read that owner sessions can reorder blocks within the same step while preserving block IDs, kinds, copy, checkout-link metadata, resource-link metadata, and webinar-link metadata.",
    "Read that owner sessions can move blocks across steps while preserving block IDs, kinds, copy, checkout-link metadata, resource-link metadata, and webinar-link metadata.",
    "Read that owner sessions can drag/drop existing blocks in the /admin/funnels UI while the UI reuses the same owner-session reorder and cross-step move endpoint modes.",
    "Read that owner sessions can preview private D1 draft state without publishing it.",
    "Read that owner sessions can publish a D1 draft to a stable public funnel route after exact confirmation.",
    "Read that owner sessions can attach the seeded sandbox checkout offer to a private draft step after exact confirmation.",
    "Read that owner sessions can unlink checkout metadata from private draft blocks after exact confirmation.",
    "Read that owner sessions can link draft resource or delivery blocks to public-safe product/access catalog assets after exact confirmation.",
    "Read that owner sessions can link draft webinar blocks to public-safe webinar registration and replay URLs after exact confirmation.",
    "Read that owner sessions can duplicate a private draft after exact confirmation and a fresh revision check.",
    "Read that owner sessions can create private webinar and resource funnel drafts from reusable templates after exact confirmation.",
    "Read that owner sessions can archive private drafts or unpublish public D1 draft funnels after exact confirmation.",
    "Read that owner sessions can purge already archived draft funnels only after exact confirmation, idempotency, a fresh archived revision, and durable tombstone evidence.",
    "Read that owner sessions can use direct agent-safe draft writes for block copy edits, block visual styles, bounded block canvas layouts, block add/remove, checkout-offer linking, checkout unlinking, resource-delivery linking, webinar-event linking, block reordering, cross-step block moves, private draft duplication, public publishing, archive/unpublish, and archived-draft purge through /api/agent/funnels/draft-writes after exact confirmation, idempotency, fresh revision checks, and audit correlation.",
    "Read that published linked checkout blocks can render the existing sandbox checkout start surface.",
    "Read that published resource-linked blocks can mint funnel-scoped private download tokens only after checkout intent and entitlement scope match the linked product and file asset.",
    "Distinguish private draft creation from public funnel preview and publishing.",
    "Cite issues #91, #93, #95, #135, #163, #165, #213, #215, #341, #417, #430, and #432 before claiming editable, publishable, checkout-linkable, checkout-unlinkable, public checkout-start, webinar-linkable, webinar-template, resource-template, duplicate, archive/unpublish, archived-draft purge, granular block-edit, block add/remove, block visual-style, block canvas-layout, block reorder, or cross-step block move capability.",
  ],
  notYetLive: [
    "Unbounded arbitrary CSS or script layout editing",
    "Live webinar scheduling, attendance tracking, or replay hosting",
    "Arbitrary private R2 delivery, signed URLs, or live fulfillment automation",
    "Direct agent public publishing without owner-session confirmation",
    "Direct unauthenticated or delegated public agent checkout linking",
    "Direct public or unauthenticated purge without owner confirmation",
  ],
  writeBoundary: draftFunnelBuilderWriteBoundary,
};

export const draftFunnelBlockVisualStyleCapability = {
  id: "funnel-draft-block-visual-style-owner-confirmed",
  status: "owner-session-block-visual-style-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: false,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  storesIn: "funnel_draft_steps.blocks_json",
  styleIds: funnelBlockVisualStyles.map((style) => style.id),
  defaultStyleId: defaultFunnelBlockVisualStyleId,
  privatePreviewRendersStyle: true,
  publicPublishedRouteRendersStyle: true,
  boundedCanvasLayoutCompanionLive: true,
  preservesBlockId: true,
  preservesBlockKind: true,
  preservesBlockTitle: true,
  preservesBlockBody: true,
  preservesCheckoutLinks: true,
  preservesResourceDeliveryLinks: true,
  preservesWebinarEventLinks: true,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can apply standard, spotlight, split, or compact visual styles to existing draft blocks from /admin/funnels.",
    "Read that visual style updates require an owner session, idempotency key, and fresh draft revision.",
    "Read that verified owner-session agents can apply the same curated visual style presets through /api/agent/funnels/draft-writes after exact agent confirmation, idempotency, a fresh draft revision, and audit correlation.",
    "Read that private previews and public published funnel routes render the saved visual style.",
    "Read that visual style updates preserve block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence.",
    "Distinguish owner-session block visual styles from bounded canvas layout controls, arbitrary CSS injection, billing mutation, live fulfillment automation, webinar provider automation, and direct public agent writes.",
  ],
  notYetLive: [
    "Arbitrary CSS or script injection from funnel editing",
    "Unauthenticated public agent visual layout writes",
    "Live billing or fulfillment mutation from visual style changes",
  ],
  writeBoundary:
    "Issue #417 lets verified owners apply curated visual style presets to existing draft funnel blocks after idempotency and a fresh revision check. The write stores a small style ID in funnel_draft_steps.blocks_json, preserves block content and linked checkout/resource/webinar metadata, and renders the same style in owner private preview and public published routes. Bounded canvas layout is handled by the separate canvas-layout capability. Visual styles do not provide arbitrary CSS, script injection, live billing, live fulfillment automation, webinar provider automation, unauthenticated public agent-created delivery tokens, non-archived direct agent purge, or unauthenticated public agent writes.",
};

export const draftFunnelBlockCanvasLayoutCapability = {
  id: "funnel-draft-block-canvas-layout-owner-confirmed",
  status: "owner-session-block-canvas-layout-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  agentEndpoint: agentFunnelDraftWriteApiRoute,
  auth: "owner-session",
  confirmationRequired: false,
  agentConfirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  auditCorrelationRequiredForAgents: true,
  storesIn: "funnel_draft_steps.blocks_json.canvasLayout",
  coordinateSystem: "bounded responsive percentage canvas",
  acceptedFields: ["x", "y", "width", "height", "zIndex"],
  bounds: {
    xPercent: { min: 0, max: 80 },
    yPercent: { min: 0, max: 90 },
    widthPercent: { min: 20, max: 100 },
    heightPercent: { min: 14, max: 60 },
    zIndex: { min: 0, max: 20 },
  },
  defaultLayout: defaultFunnelBlockCanvasLayoutForIndex(0),
  privatePreviewRendersLayout: true,
  publicPublishedRouteRendersLayout: true,
  mobileFallsBackToReadableStack: true,
  arbitraryCssAccepted: false,
  scriptAccepted: false,
  preservesBlockId: true,
  preservesBlockKind: true,
  preservesBlockTitle: true,
  preservesBlockBody: true,
  preservesCheckoutLinks: true,
  preservesResourceDeliveryLinks: true,
  preservesWebinarEventLinks: true,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can set bounded x, y, width, height, and z-index layout values for existing draft blocks from /admin/funnels.",
    "Read that verified owner-session agents can set the same bounded canvas layout through /api/agent/funnels/draft-writes after exact agent confirmation, idempotency, a fresh draft revision, and audit correlation.",
    "Read that private previews and public published funnel routes render saved canvas layouts on wide screens and fall back to a readable stack on small screens.",
    "Read that layout writes preserve block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence.",
    "Distinguish bounded canvas layout from arbitrary CSS injection, script injection, live billing, live fulfillment automation, webinar provider automation, unauthenticated public agent-created delivery tokens, and direct unauthenticated public writes.",
  ],
  notYetLive: [
    "Unbounded arbitrary CSS or script injection from funnel editing",
    "Unauthenticated public agent canvas layout writes",
    "Live billing or fulfillment mutation from canvas layout changes",
  ],
  writeBoundary:
    "Issue #417 lets verified owners and owner-session agents set bounded responsive canvas coordinates for existing draft funnel blocks after idempotency and a fresh revision check. The write stores only x, y, width, height, and zIndex numbers in funnel_draft_steps.blocks_json.canvasLayout, preserves block content and linked checkout/resource/webinar metadata, and renders the same layout in owner private preview and public published routes with a small-screen readable stack fallback. It does not accept arbitrary CSS, scripts, live billing mutation, live fulfillment automation, webinar provider automation, unauthenticated public agent-created delivery tokens, non-archived direct agent purge, or unauthenticated public agent writes.",
};

export const agentFunnelDraftWriteCapability = {
  id: "agent-funnel-draft-writes-owner-confirmed",
  status: "owner-session-agent-write-ready",
  issue: agentFunnelDraftWriteIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  apiRoute: agentFunnelDraftWriteApiRoute,
  sourceDataRoute: "/funnels/source-data",
  auth: "owner-session",
  confirmationRequired: true,
  confirmationText: agentFunnelDraftWriteConfirmationText,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  auditCorrelationRequired: true,
  allowedOperations: [
    {
      id: "update-block",
      label: "Update block copy",
      mutates: "private draft block title/body only",
      requiresStepId: true,
      requiresBlockId: true,
      requiresTitleOrBody: true,
      publicRouteMutation: false,
    },
    {
      id: "update-block-style",
      label: "Update block visual style",
      mutates: "private draft block visual style preset only",
      requiresStepId: true,
      requiresBlockId: true,
      requiresVisualStyleId: true,
      allowedVisualStyleIds: funnelBlockVisualStyles.map((style) => style.id),
      publicRouteMutation: false,
      publicRouteRenderingCanChangeWhenPublished: true,
      liveBillingMutation: false,
    },
    {
      id: "update-block-canvas-layout",
      label: "Update block canvas layout",
      mutates: "private draft block bounded responsive canvas coordinates only",
      requiresStepId: true,
      requiresBlockId: true,
      requiresCanvasLayout: true,
      acceptedFields: ["x", "y", "width", "height", "zIndex"],
      publicRouteMutation: false,
      publicRouteRenderingCanChangeWhenPublished: true,
      arbitraryCssAccepted: false,
      scriptAccepted: false,
      liveBillingMutation: false,
    },
    {
      id: "add-block",
      label: "Add reusable block",
      mutates: "appends a reusable block-library item to a private draft step",
      requiresStepId: true,
      requiresBlockKind: true,
      acceptsTitleOrBody: true,
      publicRouteMutation: false,
      liveBillingMutation: false,
    },
    {
      id: "remove-block",
      label: "Remove unlinked block",
      mutates: "removes an eligible unlinked block from a private draft step",
      requiresStepId: true,
      requiresBlockId: true,
      refusesCheckoutLinkedBlocks: true,
      keepsAtLeastOneBlockPerStep: true,
      publicRouteMutation: false,
      liveBillingMutation: false,
    },
    {
      id: "link-checkout-offer",
      label: "Link checkout offer",
      mutates: "private draft checkout block metadata only",
      requiresStepId: true,
      requiresOfferId: true,
      publicRouteMutation: false,
      liveBillingMutation: false,
    },
    {
      id: "unlink-checkout",
      label: "Unlink checkout metadata",
      mutates: "private draft checkout block metadata only",
      requiresStepId: true,
      requiresBlockId: true,
      publicRouteMutation: false,
      liveBillingMutation: false,
    },
    {
      id: "link-resource-delivery",
      label: "Link resource delivery",
      mutates: "private draft resource/delivery block metadata only",
      requiresStepId: true,
      requiresBlockId: true,
      requiresProductId: true,
      requiresAssetId: true,
      publicRouteMutation: false,
    },
    {
      id: "link-webinar-event",
      label: "Link webinar event",
      mutates: "private draft webinar block metadata only",
      requiresStepId: true,
      requiresBlockId: true,
      requiresEventTitle: true,
      requiresRegistrationUrl: true,
      requiresProviderLabel: true,
      publicRouteMutation: false,
    },
    {
      id: "move-block",
      label: "Move block within step",
      mutates: "private draft block order only",
      requiresStepId: true,
      requiresBlockId: true,
      requiresDirection: true,
      allowedDirections: ["up", "down"] as const,
      publicRouteMutation: false,
    },
    {
      id: "move-block-to-step",
      label: "Move block to another step",
      mutates: "private draft block step membership only",
      requiresStepId: true,
      requiresTargetStepId: true,
      requiresBlockId: true,
      publicRouteMutation: false,
    },
    {
      id: "duplicate-draft",
      label: "Duplicate private draft",
      mutates: "creates another private draft copy",
      requiresStepId: false,
      requiresBlockId: false,
      requiresTitleOrBody: false,
      publicRouteMutation: false,
    },
    {
      id: "publish-draft",
      label: "Publish draft",
      mutates: "publishes a private draft to its stable public funnel route",
      requiresStepId: false,
      requiresBlockId: false,
      requiresTitleOrBody: false,
      publicRouteMutation: true,
      liveBillingMutation: false,
      rollbackOperationId: "archive-draft",
    },
    {
      id: "archive-draft",
      label: "Archive or unpublish draft",
      mutates: "archives private draft and clears public route if published",
      requiresStepId: false,
      requiresBlockId: false,
      requiresTitleOrBody: false,
      publicRouteMutation: true,
    },
    {
      id: "purge-archived-draft",
      label: "Purge archived draft",
      mutates: "deletes already archived private draft and step rows after tombstone evidence",
      requiresStepId: false,
      requiresBlockId: false,
      requiresTitleOrBody: false,
      requiresArchivedStatus: true,
      recordsTombstone: true,
      publicRouteMutation: false,
      liveBillingMutation: false,
      deletesProductAssets: false,
      deletesR2Objects: false,
      deletesBuyerRecords: false,
      deletesAuditRows: false,
    },
    {
      id: "bulk-purge-archived-drafts",
      label: "Bulk purge archived drafts",
      mutates: "deletes selected already archived private draft and step rows after one tombstone per draft",
      requiresTargets: true,
      targetShape: ["draftId", "expectedRevisionId"],
      requiresArchivedStatus: true,
      recordsTombstonePerDraft: true,
      validatesAllTargetsBeforeDelete: true,
      maxDraftsPerRequest: 12,
      publicRouteMutation: false,
      liveBillingMutation: false,
      deletesProductAssets: false,
      deletesR2Objects: false,
      deletesBuyerRecords: false,
      deletesAuditRows: false,
      purgesNonArchivedDrafts: false,
    },
  ],
  returnsRedactedDraft: true,
  returnsRedactedPurge: true,
  rawOwnerDataIncluded: false,
  actorEmailIncluded: false,
  actorUserIdIncluded: false,
  rawRowsIncluded: false,
  safeForPublicAgents: [
    "Read that verified owner sessions can let an agent update private draft block copy, apply curated visual style presets, set bounded canvas layout, add reusable blocks, remove eligible unlinked blocks, link checkout-offer metadata, unlink checkout metadata, link resource-delivery metadata, link webinar-event metadata, reorder blocks, move blocks across steps, duplicate a private draft, publish a draft, archive/unpublish a draft, purge an already archived draft, or bulk purge selected archived drafts through one JSON endpoint.",
    "Read that direct agent-safe funnel writes require exact confirmation, idempotency, a fresh draft revision, and an audit correlation ID.",
    "Read that responses return redacted draft or purge tombstone summaries without owner email, owner user ID, idempotency key, raw rows, private session data, or provider secrets.",
    "Read that direct agent style writes accept only curated style IDs, direct agent canvas-layout writes accept only bounded numeric layout fields, and neither accepts arbitrary CSS or scripts.",
    "Distinguish owner-confirmed direct agent publishing, archived-draft purge, and bulk archived-draft purge from unauthenticated public agent writes, live billing, non-archived purge, arbitrary R2 delivery, signed URLs, live webinar automation, and live fulfillment automation.",
  ],
  notYetLive: [
    "Unauthenticated or delegated public agent writes",
    "Direct agent non-archived purge",
    "Live billing, live fulfillment automation, arbitrary private R2 delivery, or signed URL creation",
  ],
  writeBoundary:
    "Issue #417 lets verified owner sessions perform direct agent-safe draft funnel writes through /api/agent/funnels/draft-writes for block copy edits, curated block visual styles, bounded block canvas layouts, reusable block add/remove, checkout-offer linking, checkout unlinking, resource-delivery linking, webinar-event linking, within-step block reordering, cross-step block moves, private draft duplication, exact-confirmed public publishing, archive/unpublish, archived-draft purge, and bulk archived-draft purge. Every write requires exact confirmation, an idempotency key, current draft revision or per-target archived revisions, and audit correlation ID, and responses redact owner identity, idempotency keys, and raw rows. Block style writes store only a curated style ID; canvas layout writes store only bounded x, y, width, height, and zIndex numbers. Both preserve block content plus checkout/resource/webinar metadata. Block removal refuses checkout-linked blocks and keeps at least one block per step. Publishing creates a public route mutation only under owner-session confirmation and can be rolled back with archive-draft. Archived-draft purge and bulk archived-draft purge record tombstones before deleting draft and step rows; they do not mutate billing, create unauthenticated public agent writes, purge non-archived drafts, expose arbitrary private R2 delivery, create signed URLs, schedule webinars, track attendance, host replays, or run live fulfillment automation.",
};

export const draftFunnelPurgeCapability = {
  id: "funnel-archived-draft-purge-owner-confirmed",
  status: "owner-session-archived-purge-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  agentEndpoint: "/api/agent/funnels/draft-writes",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  allowedPreviousStatuses: ["archived"] as const,
  deletesDraftRows: true,
  deletesStepRows: true,
  deletesAuditRows: false,
  tombstoneTable: "funnel_purge_events",
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can physically purge already archived draft funnels from /admin/funnels.",
    "Read that verified owner-session agents can purge already archived draft funnels through /api/agent/funnels/draft-writes after exact agent confirmation, idempotency, fresh archived revision checks, and audit correlation.",
    "Read that purge requires exact owner confirmation, an idempotency key, a fresh archived draft revision, and a durable tombstone event.",
    "Read that purge deletes draft and step rows but preserves prior audit rows and the purge tombstone.",
    "Distinguish archived-draft purge from archive/unpublish, live billing, private R2 object deletion, product asset deletion, and direct public agent writes.",
  ],
  notYetLive: [
    "Direct public or unauthenticated purge without owner confirmation",
    "Purging non-archived draft funnels",
    "Deleting product assets, R2 objects, buyer records, or audit events",
    "Purging archived drafts without per-draft tombstone evidence",
  ],
  writeBoundary:
    "Issue #417 lets verified owners and owner-session agents physically purge an already archived draft funnel after exact confirmation, idempotency, a fresh archived revision check, and audit correlation for agent calls. The write records a durable tombstone in funnel_purge_events before deleting draft and step rows; it does not delete prior audit rows, product assets, R2 objects, buyer records, published live billing state, non-archived drafts, or create direct public agent writes.",
};

export const draftFunnelBulkPurgeCapability = {
  id: "funnel-archived-draft-bulk-purge-owner-confirmed",
  status: "owner-session-archived-bulk-purge-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  agentEndpoint: "/api/agent/funnels/draft-writes",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequiredPerDraft: true,
  allowedPreviousStatuses: ["archived"] as const,
  maxDraftsPerRequest: 12,
  validatesAllTargetsBeforeDelete: true,
  deletesDraftRows: true,
  deletesStepRows: true,
  deletesAuditRows: false,
  tombstoneTable: "funnel_purge_events",
  tombstonePerDraft: true,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can bulk purge selected already archived draft funnels from /admin/funnels.",
    "Read that verified owner-session agents can bulk purge selected already archived draft funnels through /api/agent/funnels/draft-writes after exact agent confirmation, idempotency, fresh archived revision checks for every target, and audit correlation.",
    "Read that bulk purge validates every selected archived draft before deleting any selected draft rows.",
    "Read that bulk purge records one durable funnel_purge_events tombstone for each purged draft.",
    "Distinguish bulk archived-draft purge from non-archived purge, live billing, private R2 object deletion, product asset deletion, buyer data deletion, and direct public agent writes.",
  ],
  notYetLive: [
    "Direct public or unauthenticated bulk purge without owner confirmation",
    "Purging non-archived draft funnels",
    "Deleting product assets, R2 objects, buyer records, or audit events",
    "Automatic retention scheduling without owner confirmation",
  ],
  writeBoundary:
    "Issue #417 lets verified owners and owner-session agents bulk purge selected already archived draft funnels after exact confirmation, idempotency, a fresh archived revision check for each target, all-target prevalidation, and audit correlation for agent calls. The write records one durable tombstone in funnel_purge_events per draft before deleting selected draft and step rows; it does not delete prior audit rows, product assets, R2 objects, buyer records, published live billing state, non-archived drafts, or create direct public agent writes.",
};

export const draftFunnelBlockReorderCapability = {
  id: "funnel-draft-block-reorder-owner-confirmed",
  status: "owner-session-block-order-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: false,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  moveScope: "within-step",
  directions: ["up", "down"] as const,
  dragDropUi: true,
  dragDropReusesEndpoint: true,
  dragDropPlacement: "before-or-after-target-block-by-replaying-directional-moves",
  preservesStepMembership: true,
  preservesBlockIds: true,
  preservesBlockKinds: true,
  preservesBlockTitles: true,
  preservesBlockBodies: true,
  preservesCheckoutLinks: true,
  preservesResourceDeliveryLinks: true,
  preservesWebinarEventLinks: true,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can move existing draft blocks up or down within the same step from /admin/funnels.",
    "Read that verified owner-session agents can move existing draft blocks up or down through /api/agent/funnels/draft-writes after exact agent confirmation, idempotency, a fresh draft revision, and audit correlation.",
    "Read that the /admin/funnels drag/drop UI reuses the same owner-session block reorder mode with fresh revision checks.",
    "Read that block reordering requires an owner session, idempotency key, and fresh draft revision.",
    "Read that block reordering preserves block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and step membership.",
    "Distinguish block reordering from block add/remove, bounded canvas layout controls, live billing, webinar scheduling, arbitrary uploaded private asset delivery, live fulfillment automation, or direct public agent writes.",
  ],
  notYetLive: [
    "Direct public or unauthenticated agent block reordering",
    "Unbounded arbitrary CSS or script layout editing",
    "Live billing or fulfillment mutation from block reordering",
  ],
  writeBoundary:
    "Issue #417 lets verified owners move existing draft blocks up or down within the same step after idempotency and a fresh revision check. The /admin/funnels drag/drop UI reuses that same endpoint mode to place a block before or after another block by replaying directional moves with fresh revisions. The write changes block order only and preserves block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, step membership, and audit evidence. It does not add or remove blocks, publish, bill, fulfill, schedule webinars, track attendance, host replays, expose arbitrary uploaded private asset delivery, create signed URLs, run live fulfillment automation, or create direct public agent writes.",
};

export const draftFunnelBlockCrossStepMoveCapability = {
  id: "funnel-draft-block-cross-step-move-owner-confirmed",
  status: "owner-session-cross-step-move-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: false,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  moveScope: "cross-step",
  target: "append-to-destination-step",
  dragDropUi: true,
  dragDropReusesEndpoint: true,
  dragDropPlacement: "destination-step-or-before-after-target-block-by-replaying-existing-move-modes",
  refusesSourceStepEmpty: true,
  preservesBlockIds: true,
  preservesBlockKinds: true,
  preservesBlockTitles: true,
  preservesBlockBodies: true,
  preservesCheckoutLinks: true,
  preservesResourceDeliveryLinks: true,
  preservesWebinarEventLinks: true,
  changesStepMembership: true,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can move an existing draft block to another step from /admin/funnels.",
    "Read that verified owner-session agents can move existing draft blocks across steps through /api/agent/funnels/draft-writes after exact agent confirmation, idempotency, a fresh draft revision, and audit correlation.",
    "Read that the /admin/funnels drag/drop UI reuses the same owner-session cross-step move mode and then replays within-step moves when placement before or after a target block is needed.",
    "Read that cross-step block moves require an owner session, idempotency key, and fresh draft revision.",
    "Read that cross-step block moves append the block to the destination step and refuse to empty the source step.",
    "Read that cross-step block moves preserve block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence.",
    "Distinguish cross-step block moves from bounded canvas layout controls, live billing, webinar scheduling, arbitrary uploaded private asset delivery, live fulfillment automation, or direct public agent writes.",
  ],
  notYetLive: [
    "Direct public or unauthenticated agent cross-step block moves",
    "Unbounded arbitrary CSS or script layout editing",
    "Live billing or fulfillment mutation from cross-step block moves",
  ],
  writeBoundary:
    "Issue #417 lets verified owners move an existing draft block from one step to another after idempotency and a fresh revision check. The /admin/funnels drag/drop UI reuses that same endpoint mode for cross-step drops and, when the owner drops before or after a target block, replays within-step moves with fresh revisions to complete placement. The cross-step write appends the block to the destination step, refuses moves that would leave the source step empty, and preserves block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence. Bounded canvas layout is handled by the separate canvas-layout capability. Cross-step moves do not publish, bill, fulfill, schedule webinars, track attendance, host replays, expose arbitrary uploaded private asset delivery, create signed URLs, run live fulfillment automation, or create direct public agent writes.",
};

export const draftFunnelWebinarEventLinkCapability = {
  id: "funnel-webinar-event-link-owner-confirmed",
  status: "owner-session-webinar-link-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  eligibleBlockKinds: ["webinar"] as FunnelBlockKind[],
  storesIn: "funnel_draft_steps.blocks_json",
  auditTable: "funnel_audit_events",
  allowedUrlProtocols: ["https:", "http:"] as const,
  accessMode: "external-event-reference",
  preservesBlock: true,
  preservesBlockId: true,
  preservesBlockKind: true,
  preservesBlockTitle: true,
  preservesBlockBody: true,
  liveSchedulingEnabled: false,
  reminderAutomationEnabled: false,
  attendanceTrackingEnabled: false,
  replayHostingEnabled: false,
  providerSecretsIncluded: false,
  privateAttendeeDataIncluded: false,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can attach public-safe webinar registration and replay URLs to draft webinar blocks from /admin/funnels.",
    "Read that webinar event links require exact owner confirmation, an idempotency key, URL validation, and a fresh draft revision.",
    "Read that webinar event links preserve the block ID, kind, title, body, step order, and audit evidence.",
    "Read that published webinar-linked blocks can render external registration and replay references without exposing provider secrets or attendee data.",
    "Distinguish webinar event links from live scheduling, attendance tracking, reminder sends, replay hosting, private registrant data, billing, and direct public agent writes.",
  ],
  notYetLive: [
    "Direct agent webinar event linking without owner confirmation",
    "Live webinar scheduling",
    "Reminder automation or calendar invite sends",
    "Attendance tracking or registrant sync",
    "Replay hosting or private media delivery",
  ],
  writeBoundary:
    "Issue #417 lets verified owners link draft webinar blocks to public-safe registration and optional replay URLs after exact confirmation, idempotency, URL validation, and a fresh revision check. The write preserves block ID, kind, title, body, step order, and audit evidence while storing only event title, external URLs, provider label, and redacted safety flags. It does not schedule webinars, send reminders, track attendance, host replays, expose provider secrets, expose private attendee data, mutate billing, or create direct public agent writes.",
};

export const draftFunnelResourceDeliveryLinkCapability = {
  id: "funnel-resource-delivery-link-owner-confirmed",
  status: "owner-session-resource-link-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  eligibleBlockKinds: ["resource", "delivery"] as FunnelBlockKind[],
  storesIn: "funnel_draft_steps.blocks_json",
  auditTable: "funnel_audit_events",
  productSourceDataRoute: "/products/source-data",
  entitlementLookupRoute: "/products/entitlements",
  downloadTokenEndpoint: "/api/products/download-tokens",
  protectedContentEndpoint: "/api/products/protected-content",
  deliveryMode: "seeded-product-access-reference",
  preservesBlock: true,
  preservesBlockId: true,
  preservesBlockKind: true,
  preservesBlockTitle: true,
  preservesBlockBody: true,
  liveFulfillmentDeliveryEnabled: false,
  arbitraryUploadedAssetDeliveryEnabled: false,
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  buyerDataIncluded: false,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can link draft resource or delivery blocks to product/access catalog assets from /admin/funnels.",
    "Read that resource delivery links require exact owner confirmation, an idempotency key, and a fresh draft revision.",
    "Read that resource delivery links preserve the block ID, kind, title, body, step order, and audit evidence.",
    "Read that the link points to public-safe product/access routes and entitlement-gated delivery contracts without exposing R2 keys, signed URLs, buyer data, or arbitrary uploaded asset delivery.",
    "Distinguish resource delivery links from live fulfillment automation, direct customer delivery, private R2 object selection, webinar provider integration, live billing, non-archived purge, and direct public agent writes.",
  ],
  notYetLive: [
    "Direct agent resource delivery linking without owner confirmation",
    "Customer delivery of arbitrary uploaded private assets",
    "Private R2 object selection or signed URL creation from funnel editing",
    "Live fulfillment automation from funnel editing",
    "Webinar provider scheduling or replay hosting from resource links",
  ],
  writeBoundary:
    "Issue #417 lets verified owners link draft resource or delivery blocks to public-safe product/access catalog assets after exact confirmation, idempotency, and a fresh revision check. The write preserves block ID, kind, title, body, step order, and audit evidence while storing only redacted product, asset, entitlement-template, and safe route metadata. It does not expose private R2 keys, signed URLs, buyer records, raw checkout IDs, arbitrary uploaded asset delivery, live fulfillment automation, billing mutation, webinar provider state, non-archived purge, or direct public agent writes.",
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
    "Distinguish granular block copy editing from block placement, block add/remove, visual style presets, bounded canvas layout controls, live billing, arbitrary uploaded private asset delivery, live fulfillment automation, or direct agent writes.",
  ],
  notYetLive: [
    "Direct agent block edits without owner confirmation",
    "Block add/remove through the title/body edit action",
    "Unbounded arbitrary CSS or script layout editing",
    "Checkout-link deletion from block editing",
    "Live billing or fulfillment mutation from block editing",
  ],
  writeBoundary:
    "Issue #430 lets verified owners edit title and body copy on existing private draft blocks after idempotency and a fresh revision check. The write preserves block IDs, block kinds, agent-editable flags, checkout-link/resource-link metadata, ordered step structure, and audit evidence. It does not add, delete, reorder, publish, bill, fulfill, schedule webinars, expose arbitrary uploaded private asset delivery, create signed URLs, run live fulfillment automation, or create direct public agent writes.",
};

export const draftFunnelBlockStructureCapability = {
  id: "funnel-draft-block-structure-owner-confirmed",
  status: "owner-session-structure-write-ready",
  issue: draftFunnelBlockStructureIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: false,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  addSource: "funnelBlockLibrary",
  canAddBlocks: true,
  canRemoveUnlinkedBlocks: true,
  refusesCheckoutLinkedBlockRemoval: true,
  preservesCheckoutLinks: true,
  refusesLastBlockRemoval: true,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can add reusable block-library items to draft funnel steps from /admin/funnels.",
    "Read that verified owners can remove draft blocks only when the block is not carrying checkout-link metadata and the step keeps at least one block.",
    "Read that block add/remove writes require an owner session, idempotency key, and fresh draft revision.",
    "Distinguish block add/remove from the dedicated checkout unlink action, visual style presets, bounded canvas layout controls, destructive funnel deletion, arbitrary uploaded private asset delivery, live fulfillment automation, live billing, or direct public agent writes.",
  ],
  notYetLive: [
    "Unauthenticated or delegated agent block add/remove without owner-session confirmation",
    "Checkout-link unlinking through block removal instead of the dedicated confirmed action",
    "Unbounded arbitrary CSS or script layout editing",
    "Direct agent or non-archived purge of draft rows, and any purge of audit events",
    "Live billing or fulfillment mutation from block structure edits",
  ],
  writeBoundary:
    "Issue #432 lets verified owners add reusable block-library items to draft funnel steps and remove safe unlinked blocks after idempotency and a fresh revision check. Removal refuses checkout-linked blocks and refuses to leave a step empty; issue #417 provides the separate confirmed checkout unlink action and block placement path. The write updates private draft block structure and audit evidence only; it does not publish, bill, fulfill, schedule webinars, expose arbitrary uploaded private asset delivery, create signed URLs, run live fulfillment automation, physically delete rows, or create direct public agent writes.",
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
    "Direct agent non-archived purge lifecycle actions",
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
    "Distinguish owner-gated archive/unpublish from archived-draft purge, public agent writes, or content purge.",
  ],
  notYetLive: [
    "Direct agent non-archived purge or audit-event purge",
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
    "Issue #79 is read-only. Owner-session creating, editing, publishing, archive/unpublishing, archived-draft purge, checkout-linking, and direct agent-safe archived purge run through owner-session confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes; issue #409 links owner-created product test checkout links to the seeded offer/funnel delivery gates without live billing or fulfillment delivery; non-archived purge or unauthenticated public agent-writing funnel state still requires future confirmed-write APIs.",
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
    writeBoundary:
      "Owner-confirmed event/replay links can reference external URLs, but scheduling, reminders, attendance tracking, provider secrets, and replay hosting require future confirmed-write integrations.",
  },
  {
    id: "block-template-resource",
    kind: "resource",
    title: "Resource library promise",
    purpose: "List resources, formats, and access expectations without exposing private files or delivery links.",
    agentEditable: true,
    safeInputs: ["resource titles", "format labels", "approved public summaries", "delivery route"],
    writeBoundary:
      "Published linked resource blocks can request Bumpgrade download tokens after checkout entitlement scope matches; arbitrary R2 object selection, signed URLs, and unauthenticated public agent-created delivery tokens still require future confirmed-write contracts.",
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
    "Distinguish webinar/resource page foundations from live webinar scheduling, replay hosting, private downloads, or entitlement delivery.",
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
    "Read that verified owner-session agents can link the same checkout offer metadata through /api/agent/funnels/draft-writes after exact agent confirmation, idempotency, a fresh draft revision, and audit correlation.",
    "Read that the link points at Bumpgrade's sandbox checkout offer contract and does not start a checkout session by itself.",
    "Distinguish owner-gated checkout linking from public or unauthenticated agent checkout writes, live billing, and Stripe mutation.",
  ],
  notYetLive: [
    "Direct public or unauthenticated agent checkout linking",
    "Live-mode checkout routing",
    "Checkout-link deletion or unpublishing",
    "Arbitrary offer or price mutation from funnel editing",
  ],
};

export const draftFunnelCheckoutUnlinkCapability = {
  id: "funnel-block-checkout-unlink-owner-confirmed",
  status: "owner-session-confirmed-write-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  adminRoute: "/admin/funnels",
  editEndpoint: "/api/admin/funnels/drafts",
  auth: "owner-session",
  confirmationRequired: true,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  storesIn: "funnel_draft_steps.blocks_json",
  auditTable: "funnel_audit_events",
  removesCheckoutLink: true,
  preservesBlock: true,
  preservesBlockId: true,
  preservesBlockKind: true,
  preservesBlockTitle: true,
  preservesBlockBody: true,
  preservesStepOrder: true,
  liveBillingEnabled: false,
  rawOwnerDataIncluded: false,
  safeForPublicAgents: [
    "Read that verified owners can unlink checkout metadata from a private draft block from /admin/funnels.",
    "Read that verified owner-session agents can unlink checkout metadata through /api/agent/funnels/draft-writes after exact agent confirmation, idempotency, a fresh draft revision, and audit correlation.",
    "Read that checkout unlinking requires exact owner confirmation, an idempotency key, and a fresh draft revision.",
    "Read that checkout unlinking preserves the block ID, kind, title, body, step order, and audit evidence.",
    "Distinguish checkout unlinking from block removal, publishing, live billing, fulfillment, non-archived purge, and direct public agent writes.",
  ],
  notYetLive: [
    "Direct public or unauthenticated agent checkout unlinking",
    "Removing the block through checkout unlinking",
    "Live billing or Stripe mutation from checkout unlinking",
    "Private fulfillment mutation from checkout unlinking",
  ],
  writeBoundary:
    "Issue #417 lets verified owners unlink checkout metadata from a private draft block after exact confirmation, idempotency, and a fresh revision check. The write preserves block ID, kind, title, body, step order, and audit evidence; it does not remove the block, publish, bill, fulfill, mutate Stripe, physically delete rows, or create direct public agent writes.",
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
    "Issue #165 lets published funnel pages render the existing checkout start surface when a checkout block carries owner-confirmed checkoutLink metadata. The route remains confirmation-gated, idempotent, redacted, and constrained to the seeded offer stack; live billing, arbitrary offer mutation, fulfillment, one-click upsell charging, and direct agent-started checkout sessions require later confirmed-write APIs.",
};

export const publicFunnelResourceDeliveryTokenCapability = {
  id: "public-funnel-resource-delivery-token",
  status: "funnel-resource-delivery-token-ready",
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  publicRoutePattern: "/funnels/:slug",
  apiRoute: "/api/funnels/resource-delivery",
  productDownloadTokenEndpoint: "/api/products/download-tokens",
  productDownloadRoutePrefix: "/api/products/downloads",
  requiresPublishedFunnel: true,
  requiresResourceDeliveryLink: true,
  requiresCheckoutIntentAndEntitlement: true,
  verifiesBlockProductAndAsset: true,
  deliveryMode: "funnel-scoped-private-r2-token",
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  buyerDataIncluded: false,
  arbitraryUploadedAssetDeliveryEnabled: false,
  liveFulfillmentAutomationEnabled: false,
  safeForPublicAgents: [
    "Read that published D1 funnel resource/delivery blocks can request a private download token only when the checkout entitlement matches the linked block product and asset.",
    "Read that verified owner-session agents can create the same funnel-scoped token through /api/agent/funnels/resource-delivery-tokens after exact confirmation, idempotency, audit correlation, and published-revision checks.",
    "Read that the customer-facing funnel route delegates to the existing short-lived product download-token stream instead of exposing signed URLs or R2 object keys.",
    "Distinguish funnel-scoped private file delivery from arbitrary uploaded asset delivery, live fulfillment automation, live billing, unauthenticated agent writes, or provider-hosted media.",
  ],
  notYetLive: [
    "Customer delivery of arbitrary uploaded private assets",
    "Signed object URL creation",
    "Live fulfillment automation or fulfillment task mutation from funnel pages",
    "Unauthenticated public agent-created delivery tokens",
  ],
  writeBoundary:
    "Issue #417 lets a published D1 funnel resource/delivery block request the existing short-lived private download token after the submitted checkout intent and entitlement match the block's linked product and file asset. Verified owner-session agents can create the same scoped token through /api/agent/funnels/resource-delivery-tokens after exact confirmation, idempotency, audit correlation, and current published-revision checks. The response returns a Bumpgrade download route only; it does not expose private R2 keys, signed URLs, buyer data, arbitrary uploaded assets, live billing, fulfillment task mutation, provider media, or unauthenticated public agent writes.",
};

export const agentFunnelResourceDeliveryTokenCapability = {
  id: "agent-funnel-resource-delivery-token-owner-confirmed",
  status: agentFunnelResourceDeliveryTokenStatus,
  issue: agentFunnelResourceDeliveryTokenIssue,
  parentIssue: draftFunnelBuilderParentIssue,
  apiRoute: agentFunnelResourceDeliveryTokenApiRoute,
  publicTokenApiRoute: publicFunnelResourceDeliveryTokenCapability.apiRoute,
  sourceDataRoute: "/funnels/source-data",
  auth: "owner-session",
  confirmationRequired: true,
  confirmationText: agentFunnelResourceDeliveryTokenConfirmationText,
  idempotencyRequired: true,
  staleRevisionRequired: true,
  auditCorrelationRequired: true,
  requiresPublishedFunnel: true,
  requiresResourceDeliveryLink: true,
  requiresCheckoutIntentAndEntitlement: true,
  verifiesBlockProductAndAsset: true,
  storesIn: "agent_funnel_resource_delivery_token_requests",
  delegatesTo: "createFunnelResourceDeliveryToken",
  replayPolicy: "same idempotency key returns audit replay metadata without raw token or download URL",
  rawTokenStored: false,
  rawTokenAvailableOnReplay: false,
  rawOwnerDataIncluded: false,
  rawRowsIncluded: false,
  buyerDataIncluded: false,
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  billingMutationCreated: false,
  publicRouteMutationCreated: false,
  unauthenticatedAgentWriteCreated: false,
  safeForPublicAgents: [
    "Read that verified owner-session agents can create a short-lived funnel-scoped private download token for a published resource block.",
    "Read that the request requires exact confirmation, an idempotency key, audit correlation, current published funnel revision, checkout intent, entitlement, and block ID.",
    "Read that replaying the same idempotency key returns audit metadata without returning or storing the raw token again.",
    "Confirm the endpoint delegates to the entitlement-scoped product download-token validator and does not expose R2 keys, signed URLs, buyer data, raw rows, or owner identity.",
    "Distinguish owner-session agent token creation from unauthenticated public agent writes, arbitrary uploaded asset delivery, live fulfillment automation, or billing mutation.",
  ],
  notYetLive: [
    "Unauthenticated public agent-created delivery tokens",
    "Arbitrary uploaded private asset delivery",
    "Signed object URL creation",
    "Live fulfillment automation or fulfillment task mutation from funnel pages",
  ],
  writeBoundary:
    "Issue #417 lets verified owner-session agents call /api/agent/funnels/resource-delivery-tokens to create a short-lived funnel-scoped private download token for a published resource block after exact confirmation, idempotency, audit correlation, and current published-revision checks. It delegates entitlement, checkout-intent, product, asset, and private R2-token validation to the existing funnel/product download-token path. Replays return only redacted audit metadata because raw bearer tokens are not stored. The endpoint does not expose owner identity, idempotency keys, raw rows, buyer data, R2 keys, signed URLs, arbitrary uploaded private assets, billing mutations, fulfillment task mutations, public route mutations, or unauthenticated public agent writes.",
};

export function getFunnelBySlug(slug: string) {
  return seededFunnels.find((funnel) => funnel.slug === slug) ?? null;
}

export const funnelSourceData = {
  id: "bumpgrade-funnel-source-data",
  updatedAt: funnelsUpdatedAt,
  status: agentFunnelDraftWriteCapability.status,
  issue: draftFunnelAdvancedParityIssue,
  parentIssue: 14,
  generatedFrom: "src/lib/funnels.ts",
  routes: [
    "/funnels/source-data",
    "/api/commerce/checkout",
    productDeliveryGateApiRoute,
    "/products/source-data",
    "/products/entitlements",
    "/api/products/download-tokens",
    "/api/products/protected-content",
    "/api/funnels/resource-delivery",
    agentFunnelDraftWriteApiRoute,
    agentFunnelResourceDeliveryTokenApiRoute,
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
    "funnelDraftBlockStructureEditId",
    "funnelDraftBlockVisualStyleId",
    "funnelDraftBlockCanvasLayoutId",
    "funnelDraftBlockReorderId",
    "funnelDraftBlockCrossStepMoveId",
    "funnelCheckoutLinkId",
    "funnelCheckoutUnlinkId",
    "funnelResourceDeliveryLinkId",
    "funnelResourceDeliveryTokenId",
    "funnelWebinarEventLinkId",
    "funnelWebinarResourceTemplateId",
    "funnelRevisionId",
    "funnelDraftId",
    "funnelDraftDuplicateId",
    "funnelDraftArchiveId",
    "funnelDraftPurgeId",
    "funnelDraftBulkPurgeId",
    "funnelAuditEventId",
    "funnelPurgeEventId",
    "agentFunnelDraftWriteId",
    "agentFunnelDraftWriteOperationId",
    "agentFunnelResourceDeliveryTokenId",
    "auditCorrelationId",
    "checkoutIntentId",
    "checkoutOfferStackId",
    "offerId",
    "productDeliveryGateLinkId",
    "agentActionId",
  ],
  writeBoundary: seededFunnel.writeBoundary,
  editableDraftCapability,
  draftFunnelBlockEditingCapability,
  draftFunnelBlockStructureCapability,
  draftFunnelBlockVisualStyleCapability,
  draftFunnelBlockCanvasLayoutCapability,
  funnelBlockVisualStyles,
  draftFunnelBlockReorderCapability,
  draftFunnelBlockCrossStepMoveCapability,
  draftFunnelWebinarEventLinkCapability,
  draftFunnelResourceDeliveryLinkCapability,
  draftFunnelDuplicationCapability,
  draftFunnelArchiveCapability,
  draftFunnelPurgeCapability,
  draftFunnelBulkPurgeCapability,
  draftFunnelCheckoutUnlinkCapability,
  agentFunnelDraftWriteCapability,
  agentFunnelResourceDeliveryTokenCapability,
  templateDraftCreationCapability,
  webinarResourceTemplateCapability,
  checkoutLinkingCapability,
  publicFunnelCheckoutStartCapability,
  publicFunnelResourceDeliveryTokenCapability,
  templateLibraryIssue: funnelTemplateLibraryIssue,
  templates: funnelTemplateLibrary,
  blockLibrary: funnelBlockLibrary,
  funnels: seededFunnels,
  caveat:
    "This public contract proves read and preview semantics, reusable template and block-template records including webinar and resource page shapes from issue #213, owner-session confirmed template-to-draft creation, owner-session private draft duplication from issue #215, owner-session checkout-offer linking on private draft steps, owner-session checkout unlinking, owner-session resource delivery linking, owner-session webinar event/replay linking, owner-session visual style controls for existing blocks, bounded owner-session canvas layout controls for existing blocks, owner-session block reordering, owner-session drag/drop block placement through existing move endpoints, owner-session cross-step block moves, owner-confirmed archived-draft purge, owner-confirmed bulk archived-draft purge, owner-session direct agent-safe draft writes for block copy edits, visual style presets, bounded canvas layouts, reusable block add/remove, checkout-offer linking, checkout unlinking, resource-delivery linking, webinar-event linking, within-step block reordering, cross-step block moves, private duplication, owner-confirmed direct agent public publishing, archive/unpublish, archived-draft purge, and bulk archived-draft purge from issue #417, public sandbox checkout start rendering on published linked checkout blocks, funnel-scoped private download-token delivery for published resource blocks, owner-session agent-created resource delivery tokens for published linked resource blocks, owner-session granular block title/body editing from issue #430, owner-session block add/remove controls with checkout-linked block protection from issue #432, owner-created product delivery-gate links for the seeded offer/funnel path from issue #409, exact-confirmed owner archive/unpublish from issue #341, plus the existence of an owner-session D1 draft builder with step edit/reorder controls, owner-gated private draft preview, and exact-confirmed public publishing. Direct agent template creation, unauthenticated public agent publishing, live billing mutation, live webinar scheduling, attendance tracking, replay hosting, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, unbounded arbitrary CSS/script layout editing, direct agent non-archived purge, and unconfirmed unauthenticated agent-write APIs are not live.",
};
