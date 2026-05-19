import { site } from "@/lib/site";

export const agentManifestUpdatedAt = "2026-05-19";

export type AgentReadContract = {
  id: string;
  title: string;
  route: string;
  kind: "json" | "doc" | "api";
  auth: "public" | "owner-session" | "server-only";
  sourceOfTruth: string;
  stableIds: string[];
  safeForAgents: string[];
  writeBoundary: string;
};

export type AgentMcpPlan = {
  id: string;
  resourceOrTool: string;
  status: "planned" | "ready-contract";
  backedBy: string;
  purpose: string;
  safetyBoundary: string;
};

export type AgentDoc = {
  id: string;
  title: string;
  route: string;
  purpose: string;
  status: "live" | "planned";
  evidence: string[];
};

export type AgentSourceEvidenceRoute = {
  id: string;
  route: string;
  resolves: string;
  stableIds: string[];
  volatileClaims: string;
};

export type BoilerplateBaselineEvidence = {
  sourceRepo: string;
  sourceBranch: string;
  sourcePath: string;
  adoptedShape: string[];
};

export const agentDocs: AgentDoc[] = [
  {
    id: "doc-agent-index",
    title: "Agent docs index",
    route: "/agent-docs",
    purpose: "Human and agent-friendly index for Bumpgrade read contracts, source evidence, MCP direction, and safety boundaries.",
    status: "live",
    evidence: ["Issue #12", "public/llms.txt"],
  },
  {
    id: "doc-agent-surface",
    title: "Bumpgrade agent surface",
    route: "/agent-docs/bumpgrade-agent-surface",
    purpose: "Orientation for what agents can read, what is planned, and what requires owner credentials.",
    status: "live",
    evidence: ["Issue #12", "/agent-docs/source-data"],
  },
  {
    id: "doc-commerce-contract",
    title: "Bumpgrade commerce contract",
    route: "/agent-docs/bumpgrade-commerce-contract",
    purpose: "Stripe sandbox, checkout, webhook, billing, and confirmed-write safety boundaries.",
    status: "live",
    evidence: ["Issue #11", "Issue #34", "/commerce/source-data"],
  },
  {
    id: "doc-source-evidence",
    title: "Bumpgrade source evidence",
    route: "/agent-docs/bumpgrade-source-evidence",
    purpose: "How public claims resolve to source IDs, URLs, issues, PRs, work-log entries, and caveats.",
    status: "live",
    evidence: ["/compare/source-data", "/features/source-data", "/roadmap/source-data"],
  },
  {
    id: "doc-admin-surfaces",
    title: "Bumpgrade admin surfaces",
    route: "/agent-docs/bumpgrade-admin-surfaces",
    purpose: "Which admin pages require owner auth and which source-data routes are public-safe for agents.",
    status: "live",
    evidence: ["/admin/source-data", "docs/agent/admin-surfaces.md"],
  },
  {
    id: "doc-mcp-roadmap",
    title: "Bumpgrade MCP roadmap",
    route: "/agent-docs/bumpgrade-mcp",
    purpose: "First MCP resources and tools planned on top of the same public-safe contracts.",
    status: "live",
    evidence: ["Issue #12", "docs/agent/agent-ready.md"],
  },
  {
    id: "doc-mobile-admin",
    title: "Bumpgrade mobile admin contract",
    route: "/agent-docs/bumpgrade-mobile-admin",
    purpose: "Shared iOS and Android publisher/admin app jobs, API dependencies, auth boundaries, and write-safety rules.",
    status: "live",
    evidence: ["Issue #13", "Issue #67", "Issue #68", "Issue #153", "/mobile-admin/source-data"],
  },
];

export const agentReadContracts: AgentReadContract[] = [
  {
    id: "read-feature-catalog",
    title: "Feature catalog",
    route: "/features/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/feature-catalog.ts",
    stableIds: ["featureId", "issue", "status"],
    safeForAgents: ["Read feature status", "Distinguish live from pending", "Cite feature evidence"],
    writeBoundary: "Feature status changes must land through GitHub issue/PR work and admin work-log updates.",
  },
  {
    id: "read-public-roadmap",
    title: "Public roadmap",
    route: "/roadmap/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/roadmap.ts",
    stableIds: ["roadmapItemId", "featureId", "issue", "status"],
    safeForAgents: ["Read public-safe roadmap state", "Find blockers and next milestones", "Cite issue evidence"],
    writeBoundary: "Roadmap moves require an issue/PR or approved admin append path, not chat-only edits.",
  },
  {
    id: "read-comparisons",
    title: "Competitor comparisons and source evidence",
    route: "/compare/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/comparison-data.ts",
    stableIds: ["competitorId", "sourceId", "seoTargetId"],
    safeForAgents: ["Resolve competitor claims", "Read retrieved dates", "Cite official source URLs"],
    writeBoundary: "Refresh competitor claims from official sources before changing dated pricing, packaging, or feature claims.",
  },
  {
    id: "read-commerce-contract",
    title: "Commerce contract",
    route: "/commerce/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/commerce.ts and src/lib/sandbox-checkout.ts",
    stableIds: [
      "productId",
      "priceId",
      "checkoutIntentId",
      "referralClickId",
      "referralAttributionId",
      "reviewOnlyCommissionLedgerId",
      "commissionReviewActionId",
      "postPurchaseDecisionId",
      "auditCorrelationId",
    ],
    safeForAgents: [
      "Read redacted commerce architecture",
      "Separate sandbox from live billing",
      "Inspect referral attribution evidence",
      "Inspect review-only commission ledger evidence",
      "Inspect owner review action boundaries",
      "Inspect non-billing post-purchase decision evidence",
      "Inspect write safety rules",
    ],
    writeBoundary:
      "Non-billing post-purchase decisions can be recorded only for trusted checkout state; billing-impacting and payable commission writes require exact confirmation, idempotency, stale-state checks, audit correlation, owner review, and webhook evidence.",
  },
  {
    id: "read-admin-source",
    title: "Admin source-data bundle",
    route: "/admin/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "D1 admin tables with fixture fallback in src/lib/admin-surface-data.ts",
    stableIds: ["workLogEntryId", "userJourneyId", "markAttentionId", "roadmapItemId"],
    safeForAgents: ["Read public-safe work-log entries", "Read user journeys", "Read Mark attention summaries"],
    writeBoundary: "Human admin pages require Better Auth; agent writes need approved scripts or future confirmed APIs.",
  },
  {
    id: "read-agent-manifest",
    title: "Agent manifest",
    route: "/agent-docs/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/agent-manifest.ts",
    stableIds: ["readContractId", "mcpPlanId", "agentDocId"],
    safeForAgents: ["Discover read contracts", "Route to source-data APIs", "Understand write boundaries"],
    writeBoundary: "This route is read-only until confirmed-write agent APIs exist.",
  },
  {
    id: "read-content-surfaces",
    title: "Content surfaces",
    route: "/content/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/content-surfaces.ts",
    stableIds: ["audienceSegmentId", "resourceItemId", "pricingPrincipleId", "pricingTrackId"],
    safeForAgents: ["Read use-case records", "Read resource hub records", "Read pricing caveats"],
    writeBoundary: "Content changes must cite source-data routes, issues, or shipped evidence before public claims change.",
  },
  {
    id: "read-funnel-contract",
    title: "Funnel source data",
    route: "/funnels/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/funnels.ts",
    stableIds: ["funnelId", "funnelStepId", "funnelBlockId", "funnelRevisionId", "funnelDraftId", "funnelAuditEventId", "agentActionId"],
    safeForAgents: [
      "Read seeded draft funnel",
      "Inspect ordered steps",
      "Inspect page blocks and write boundaries",
      "Discover owner-session editable draft, private preview, and exact-confirmed publish capability from issues #91, #93, #95, and #135",
    ],
    writeBoundary:
      "Owner-session seed/create/update/reorder draft writes, private draft preview, and exact-confirmed public publishing exist at /admin/funnels. Checkout linking, deletion, unpublishing, drag-and-drop layout editing, and direct agent edits require future confirmed-write APIs.",
  },
  {
    id: "read-admin-draft-funnels",
    title: "Admin draft funnels",
    route: "/admin/funnels",
    kind: "doc",
    auth: "owner-session",
    sourceOfTruth: "D1 tables funnel_drafts, funnel_draft_steps, and funnel_audit_events",
    stableIds: ["funnelDraftId", "funnelDraftStepId", "funnelAuditEventId", "ownerUserId"],
    safeForAgents: [
      "Read private draft funnel rows only with an owner session",
      "Preview private draft funnel state only with an owner session",
      "Publish a draft only through owner-session UI with exact confirmation, idempotency, and a fresh revision ID",
      "Check audit metadata before acting on draft state",
    ],
    writeBoundary:
      "The POST endpoint can seed, create, update, reorder, and publish private draft steps for an authenticated owner; private preview is owner-gated; checkout linking, deletion, unpublishing, and direct agent edits are not live.",
  },
  {
    id: "read-checkout-offer-stack",
    title: "Checkout offer source data",
    route: "/offers/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/checkout-offers.ts",
    stableIds: [
      "checkoutOfferStackId",
      "offerId",
      "orderBumpId",
      "upsellId",
      "downsellId",
      "checkoutRevisionId",
      "referralClickId",
      "postPurchaseDecisionId",
      "agentActionId",
    ],
    safeForAgents: [
      "Read seeded checkout offer stack",
      "Inspect bump and upsell sequence",
      "Inspect confirmed sandbox checkout start boundaries",
      "Inspect optional referral-click attribution evidence",
      "Inspect aggregate non-billing post-purchase decision counts",
    ],
    writeBoundary:
      "A confirmed sandbox checkout start can include the seeded primary offer, constrained order bump, and optional referral-click attribution evidence; trusted checkout state can record non-billing upsell/downsell follow-up decisions; live billing, price mutation, fulfillment, commission writes, direct agent writes, and post-purchase charges require future confirmed-write APIs.",
  },
  {
    id: "read-product-access-catalog",
    title: "Product access source data",
    route: "/products/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth:
      "src/lib/product-access.ts + src/lib/product-entitlement-inspection.ts + src/lib/customer-product-entitlements.ts + src/lib/product-download-tokens.ts",
    stableIds: [
      "productId",
      "assetId",
      "accessRuleId",
      "entitlementTemplateId",
      "productEntitlementInspectionId",
      "customerProductEntitlementLookupId",
      "productDownloadTokenId",
      "productAssetUploadIntentId",
      "subscriptionPlanId",
      "fulfillmentId",
      "agentActionId",
    ],
    safeForAgents: [
      "Read seeded product catalog",
      "Inspect access rules",
      "Inspect sandbox entitlement grant mappings",
      "Inspect aggregate owner-entitlement counts and redaction flags",
      "Discover the customer-safe checkout intent entitlement lookup contract",
      "Discover short-lived private R2-backed download-token boundaries",
      "Discover owner-confirmed private asset upload-intent boundaries",
      "Inspect entitlement and fulfillment boundaries",
    ],
    writeBoundary:
      "Trusted paid sandbox webhooks can grant idempotent entitlement rows for seeded checkout line items; verified owners can inspect private entitlement rows in /admin/products; customers can inspect checkout-intent-scoped entitlement status and create short-lived download tokens that stream a seeded private R2 fixture without buyer or provider identifiers; verified owners can create small private asset upload records after exact confirmation, idempotency, and catalog revision checks; product creation, customer delivery of arbitrary uploads, signed object URLs, revocation, live fulfillment automation, subscription access, and private content writes require future authenticated confirmed-write APIs.",
  },
  {
    id: "read-customer-product-entitlements",
    title: "Customer product entitlement lookup",
    route: "/api/products/entitlements",
    kind: "api",
    auth: "public",
    sourceOfTruth: "src/lib/customer-product-entitlements.ts",
    stableIds: ["checkoutIntentId", "productEntitlementId", "productId", "entitlementTemplateId", "fulfillmentTaskId"],
    safeForAgents: [
      "Inspect customer-safe product access for a known checkout intent",
      "Confirm entitlement and fulfillment state without private buyer data",
      "Confirm raw Stripe IDs, event IDs, metadata JSON, R2 keys, and signed URLs are excluded",
    ],
    writeBoundary:
      "This is a read-only checkout-intent-scoped lookup; signed downloads, protected lessons, buyer identity, entitlement mutation, revocation, and live fulfillment require future authenticated confirmed-write APIs.",
  },
  {
    id: "create-sandbox-product-download-token",
    title: "Private R2 product download token",
    route: "/api/products/download-tokens",
    kind: "api",
    auth: "public",
    sourceOfTruth: "src/lib/product-download-tokens.ts",
    stableIds: ["checkoutIntentId", "productEntitlementId", "productDownloadTokenId", "assetId"],
    safeForAgents: [
      "Create a short-lived download token for an active checkout-linked file entitlement",
      "Confirm private R2-backed fixture delivery does not expose private R2 keys or signed object URLs",
      "Inspect token expiry, one-use replay rejection, entitlement scope, and current checkout-state revalidation",
    ],
    writeBoundary:
      "This creates a short-lived token and streams a seeded private R2-backed fixture through Bumpgrade after revalidating current entitlement status, checkout intent linkage, trusted checkout state, and asset scope; protected content, arbitrary asset uploads, revocation, subscription access, and live fulfillment automation require future authenticated confirmed-write APIs.",
  },
  {
    id: "read-admin-product-entitlements",
    title: "Admin product entitlements",
    route: "/admin/products",
    kind: "doc",
    auth: "owner-session",
    sourceOfTruth: "D1 tables product_entitlements, product_fulfillment_tasks, checkout_intents, commerce_products, and commerce_prices",
    stableIds: ["productId", "entitlementTemplateId", "productEntitlementId", "fulfillmentTaskId", "checkoutIntentId", "ownerUserId"],
    safeForAgents: [
      "Read private buyer entitlement rows only with an owner session",
      "Inspect checkout status, product/price context, access rule, and queued fulfillment state",
      "Confirm public source-data redacts buyer email, raw Stripe IDs, hashes, metadata JSON, private R2 keys, and signed URLs",
    ],
    writeBoundary:
      "This owner page is inspection-only; signed downloads, protected content, revocation, subscription access changes, refunds, customer portals, private asset delivery, and direct agent entitlement writes require future confirmed-write APIs.",
  },
  {
    id: "create-owner-product-asset-upload-intent",
    title: "Owner private product asset upload intent",
    route: "/api/admin/products/assets",
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 table product_asset_uploads and PRODUCT_ASSETS R2 binding",
    stableIds: ["productAssetUploadIntentId", "productId", "assetId", "ownerUserId", "idempotencyKey", "catalogRevisionId"],
    safeForAgents: [
      "Inspect the owner-only private asset upload confirmation contract",
      "Create small private product asset upload records only with an owner session",
      "Confirm public responses omit R2 object keys, signed URLs, raw upload bodies, raw owner email, buyer data, and private metadata",
      "Use idempotency and catalog revision checks before storing a private payload",
    ],
    writeBoundary:
      "This owner-session API stores small private payloads in PRODUCT_ASSETS and records redacted upload metadata in D1 after exact confirmation, idempotency, and catalog revision checks. It does not make uploaded assets customer-deliverable, create signed URLs, expose object keys, mutate entitlements, or allow unauthenticated/direct public agent writes.",
  },
  {
    id: "read-audience-automation",
    title: "Audience automation source data",
    route: "/audience/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/audience-automation.ts + src/lib/audience-subscribers.ts",
    stableIds: [
      "subscriberId",
      "subscriberInspectionId",
      "subscriberSegmentId",
      "optInFormId",
      "leadMagnetId",
      "subscriberTagId",
      "emailSequenceId",
      "automationRuleId",
      "broadcastDraftId",
      "consentRecordId",
      "agentActionId",
    ],
    safeForAgents: [
      "Read seeded opt-in form",
      "Inspect tags and segments",
      "Inspect consent-backed capture boundary",
      "Inspect aggregate owner-subscriber counts and redaction flags",
      "Inspect sequence and automation boundaries",
    ],
    writeBoundary:
      "Public visitors can submit the seeded opt-in form with explicit consent; verified owners can inspect private subscriber rows in /admin/audience; imports, broadcasts, unsubscribes, CRM notes, private exports, direct agent subscriber writes, and email sends require future confirmed-write APIs.",
  },
  {
    id: "read-admin-audience-subscribers",
    title: "Admin audience subscribers",
    route: "/admin/audience",
    kind: "doc",
    auth: "owner-session",
    sourceOfTruth: "D1 tables audience_subscribers, audience_consent_events, audience_tag_assignments, and audience_sequence_enrollments",
    stableIds: ["subscriberId", "subscriberSegmentId", "subscriberTagId", "emailSequenceId", "consentRecordId", "ownerUserId"],
    safeForAgents: [
      "Read private subscriber rows only with an owner session",
      "Inspect consent counts, active tags, source form, and draft sequence enrollment state",
      "Confirm public source-data redacts email, name, raw IP, raw user agent, and private metadata",
    ],
    writeBoundary:
      "This owner page is inspection-only; imports, sends, unsubscribes, broadcasts, CRM notes, suppression changes, private exports, and direct agent subscriber writes require future confirmed-write APIs.",
  },
  {
    id: "read-analytics-experiments",
    title: "Analytics and experiments source data",
    route: "/analytics/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/analytics-experiments.ts + src/lib/analytics-conversion-report.ts",
    stableIds: [
      "analyticsEventId",
      "analyticsEventIngestionId",
      "analyticsPageViewBeaconId",
      "analyticsEventVariantAggregateId",
      "analyticsEventSourceAggregateId",
      "experimentAssignmentId",
      "analyticsFunnelConversionReportId",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "referrerHost",
      "metricId",
      "funnelStepMetricId",
      "experimentId",
      "variantId",
      "assignmentRuleId",
      "reportId",
      "agentActionId",
    ],
    safeForAgents: [
      "Read seeded event taxonomy",
      "Inspect aggregate event counts",
      "Inspect aggregate variant event counts",
      "Inspect aggregate source attribution counts",
      "Inspect aggregate assignment counts",
      "Inspect aggregate funnel conversion report rows",
      "Inspect dashboard-visible source attribution rows",
      "Inspect fixed time-window metadata and aggregate source/conversion rows",
      "Inspect metric formulas",
      "Inspect seeded event capture boundary",
      "Inspect browser-side page-view beacon boundary",
      "Inspect seeded experiment assignment boundary",
      "Inspect experiment assignment boundaries",
    ],
    writeBoundary:
      "Seeded analytics events, browser-side seeded funnel page-view beacons with deterministic variant evidence and normalized source attribution, and seeded experiment assignments can be captured with idempotency, source-route validation, and bot/preview suppression; fixed-window aggregate funnel conversion reports, dashboard-visible aggregate source counts, and aggregate variant counts can be read from captured test events. Cookie assignment, contact analytics, raw campaign/referrer reporting, custom events, experiment traffic routing, and decision writes require future confirmed-write APIs.",
  },
  {
    id: "read-affiliate-referrals",
    title: "Affiliate and referral source data",
    route: "/affiliates/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/affiliate-referrals.ts",
    stableIds: [
      "affiliateProgramId",
      "affiliatePartnerId",
      "referralLinkId",
      "referralClickId",
      "checkoutIntentId",
      "referralAttributionId",
      "reviewOnlyCommissionLedgerId",
      "commissionReviewActionId",
      "attributionRuleId",
      "commissionRuleId",
      "commissionLedgerId",
      "payoutBatchId",
      "reviewFlagId",
      "auditEventId",
      "agentActionId",
    ],
    safeForAgents: [
      "Read seeded affiliate program",
      "Inspect referral links and attribution rules",
      "Inspect aggregate referral click counts",
      "Inspect aggregate checkout attribution counts",
      "Inspect aggregate review-only commission ledger counts",
      "Inspect aggregate owner review and reversal action counts",
      "Inspect commission and payout review boundaries",
    ],
    writeBoundary:
      "Seeded referral clicks can be captured with idempotency and destination-route validation, eligible clicks can be attached to sandbox checkout intents as evidence, trusted checkout attribution can create review-only commission ledger evidence, and owner sessions can review, hold, or reverse that evidence; cookie assignment, buyer attribution finalization, payable commission writes, direct agent review writes, fraud enforcement, payout actions, tax collection, and partner notifications require future confirmed-write APIs.",
  },
  {
    id: "read-mobile-admin-contract",
    title: "Mobile admin contract",
    route: "/mobile-admin/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/mobile-admin.ts",
    stableIds: ["mobileJobId", "mobileApiDependencyId", "platformIssue", "featureId"],
    safeForAgents: ["Read iOS and Android scope", "Find API dependencies", "Understand mobile write boundaries"],
    writeBoundary: "Mobile app writes remain read-only until a future confirmed-write API exists.",
  },
  {
    id: "read-mobile-admin-dashboard",
    title: "Live mobile admin dashboard source data",
    route: "/mobile-admin/dashboard/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/mobile-admin-dashboard.ts",
    stableIds: ["mobileDashboardCardId", "featureId", "roadmapItemId", "workLogEntryId", "markAttentionId", "agentReadContractId"],
    safeForAgents: [
      "Read one public-safe mobile dashboard digest",
      "Inspect live feature, roadmap, admin, commerce, and agent-readiness counts",
      "Find iOS and Android source-data routes without scraping private admin pages",
    ],
    writeBoundary:
      "Read-only public-safe digest; private mobile auth, push notifications, and confirmed mobile writes require future authenticated APIs.",
  },
  {
    id: "read-ios-mobile-admin",
    title: "iOS mobile admin source data",
    route: "/mobile-admin/ios/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/mobile-admin-ios.ts and apps/mobile-admin",
    stableIds: ["platformIssue", "fixturePath", "smokeCommand", "simulatorBundleId"],
    safeForAgents: ["Read iOS scaffold status", "Find simulator smoke command", "Find screenshot evidence"],
    writeBoundary: "The iOS slice is read-only until the shared confirmed-write API and mobile auth boundary exist.",
  },
  {
    id: "read-android-mobile-admin",
    title: "Android mobile admin source data",
    route: "/mobile-admin/android/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/mobile-admin-android.ts and apps/mobile-admin",
    stableIds: ["platformIssue", "fixturePath", "smokeCommand", "nativePackage", "defaultAvd"],
    safeForAgents: ["Read Android scaffold status", "Find emulator smoke command", "Find screenshot evidence"],
    writeBoundary: "The Android slice is read-only until the shared confirmed-write API and mobile auth boundary exist.",
  },
];

export const agentSourceEvidenceRoutes: AgentSourceEvidenceRoute[] = [
  {
    id: "evidence-features",
    route: "/features/source-data",
    resolves: "Bumpgrade feature status, audience, expected capabilities, issue ownership, and agent contract notes.",
    stableIds: ["featureId", "issue"],
    volatileClaims: "Feature records must not be described as live unless status is live and issue/PR evidence supports it.",
  },
  {
    id: "evidence-roadmap",
    route: "/roadmap/source-data",
    resolves: "Public roadmap item status, blocker notes, next milestones, issue links, and public evidence.",
    stableIds: ["roadmapItemId", "featureId", "issue"],
    volatileClaims: "Roadmap lane changes should come from merged issue work or explicit admin updates.",
  },
  {
    id: "evidence-comparisons",
    route: "/compare/source-data",
    resolves: "Competitor records, official source URLs, retrieval dates, SEO targets, and caveats.",
    stableIds: ["competitorId", "sourceId", "seoTargetId"],
    volatileClaims: "Pricing, packaging, integrations, and feature availability require a fresh source refresh before citation.",
  },
  {
    id: "evidence-admin",
    route: "/admin/source-data",
    resolves: "Public-safe admin roadmap, work-log, user-journey, and Mark-attention records.",
    stableIds: ["workLogEntryId", "userJourneyId", "markAttentionId", "roadmapItemId"],
    volatileClaims: "Private notes and owner-only decisions stay behind Better Auth or approved scripts.",
  },
  {
    id: "evidence-commerce",
    route: "/commerce/source-data",
    resolves:
      "Redacted commerce architecture, sandbox checkout offer, referral attribution evidence, review-only commission ledger evidence, owner review action boundaries, non-billing post-purchase decision evidence, payment tables, webhook rules, and billing write safety.",
    stableIds: [
      "productId",
      "priceId",
      "checkoutIntentId",
      "referralClickId",
      "referralAttributionId",
      "commissionReviewActionId",
      "reviewOnlyCommissionLedgerId",
      "postPurchaseDecisionId",
      "auditCorrelationId",
    ],
    volatileClaims:
      "Live payment capability, one-click post-purchase charging, fulfillment, and payable commission state are not enabled until separate rollout and webhook smoke evidence prove them.",
  },
  {
    id: "evidence-agent-manifest",
    route: "/agent-docs/source-data",
    resolves: "Agent doc links, read contracts, evidence routes, MCP plan, and write-safety rules.",
    stableIds: ["agentDocId", "readContractId", "mcpPlanId", "evidenceRouteId"],
    volatileClaims: "The manifest is discovery metadata; it does not grant write permission.",
  },
  {
    id: "evidence-content-surfaces",
    route: "/content/source-data",
    resolves: "Audience segments, resource hub records, pricing principles, planned pricing tracks, issue links, and agent boundaries.",
    stableIds: ["audienceSegmentId", "resourceItemId", "pricingPrincipleId", "pricingTrackId"],
    volatileClaims: "Pricing tracks are positioning hypotheses; plan names, amounts, limits, trials, and live billing are not claimed.",
  },
  {
    id: "evidence-funnels",
    route: "/funnels/source-data",
    resolves:
      "Seeded funnel, ordered steps, page blocks, revision ID, preview route, source-data route, published D1 funnel summaries, owner-gated draft capability, D1 table names, and confirmed-write boundary.",
    stableIds: ["funnelId", "funnelStepId", "funnelBlockId", "funnelRevisionId", "funnelDraftId", "funnelAuditEventId"],
    volatileClaims:
      "The public funnel contract exposes owner-gated editable draft and publish capability metadata; it does not expose unpublished private draft copy, checkout linking, unpublishing, or unconfirmed agent edits.",
  },
  {
    id: "evidence-checkout-offers",
    route: "/offers/source-data",
    resolves:
      "Seeded checkout offer stack, primary offer, selectable order bump, optional referral-click attribution evidence, upsell, downsell, non-billing post-purchase decision contract, aggregate decision counts, checkout route, revision ID, and confirmed-write boundary.",
    stableIds: [
      "checkoutOfferStackId",
      "offerId",
      "orderBumpId",
      "upsellId",
      "downsellId",
      "checkoutRevisionId",
      "referralClickId",
      "postPurchaseDecisionId",
    ],
    volatileClaims:
      "The checkout-offer contract now includes a confirmed sandbox checkout start for the seeded primary offer plus constrained order bump, optional referral-click attribution evidence, and non-billing upsell/downsell decision evidence; it is not live billing, one-click upsell charging, fulfillment, commission writes, price mutation, or direct agent write capability.",
  },
  {
    id: "evidence-products-access",
    route: "/products/source-data",
    resolves:
      "Seeded product catalog, assets, access rules, entitlement templates, sandbox webhook grant mappings, aggregate owner-entitlement inspection counts, customer-safe lookup contract, private R2-backed fixture delivery contract, owner-confirmed private asset upload intent contract, redaction flags, preview route, revision ID, and confirmed-write boundary.",
    stableIds: [
      "productId",
      "assetId",
      "accessRuleId",
      "entitlementTemplateId",
      "productEntitlementInspectionId",
      "customerProductEntitlementLookupId",
      "productDownloadTokenId",
      "productAssetUploadIntentId",
      "fulfillmentId",
    ],
    volatileClaims:
      "The product/access contract includes sandbox webhook-backed entitlement row grants, owner-only entitlement inspection, customer-safe checkout intent lookup, short-lived tokens that stream a seeded private R2 fixture, and owner-confirmed private asset upload records; it is not signed object URL access, customer delivery of arbitrary uploads, revocation, protected content, or live fulfillment automation.",
  },
  {
    id: "evidence-audience-automation",
    route: "/audience/source-data",
    resolves:
      "Seeded audience automation workspace, opt-in form, consent-backed capture API, aggregate subscriber inspection counts, redaction flags, tags, segments, lead magnet, sequence, broadcast draft, and confirmed-write boundary.",
    stableIds: ["subscriberSegmentId", "subscriberId", "subscriberInspectionId", "optInFormId", "leadMagnetId", "emailSequenceId", "automationRuleId"],
    volatileClaims:
      "The audience automation contract includes consent-backed opt-in capture and aggregate owner-inspection evidence; it is not contact import, live email sending, unsubscribe management, CRM timeline state, private export, or direct agent subscriber write capability.",
  },
  {
    id: "evidence-analytics-experiments",
    route: "/analytics/source-data",
    resolves:
      "Seeded analytics event taxonomy, event capture API, browser-side page-view beacon boundary, dashboard-visible aggregate source attribution rows, fixed time-window metadata, aggregate event counts, aggregate variant event counts, aggregate source attribution counts, assignment API, aggregate assignment counts, aggregate funnel conversion reports, metric formulas, experiment variants, assignment rule, and confirmed-write boundary.",
    stableIds: [
      "analyticsEventId",
      "analyticsEventIngestionId",
      "analyticsPageViewBeaconId",
      "analyticsEventVariantAggregateId",
      "analyticsEventSourceAggregateId",
      "experimentAssignmentId",
      "analyticsFunnelConversionReportId",
      "analyticsTimeWindow",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "referrerHost",
      "metricId",
      "experimentId",
      "variantId",
      "assignmentRuleId",
    ],
    volatileClaims:
      "The analytics contract includes seeded event capture, browser-side page-view beacons with deterministic variant evidence and normalized source attribution, seeded assignment, dashboard-visible aggregate source rows, fixed-window aggregate counts, aggregate source counts, aggregate variant counts, and aggregate conversion report rows; it is not cookie assignment, traffic routing, contact-level analytics, raw event or assignment exposure, raw referrer/query exposure, automated decisions, or statistically meaningful proof.",
  },
  {
    id: "evidence-affiliate-referrals",
    route: "/affiliates/source-data",
    resolves:
      "Seeded affiliate program, partner records, referral links, referral click capture API, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal actions, aggregate counts, attribution rules, commission rules, ledger fixtures, payout batch, review flags, and confirmed-write boundary.",
    stableIds: [
      "affiliateProgramId",
      "affiliatePartnerId",
      "referralLinkId",
      "referralClickId",
      "checkoutIntentId",
      "referralAttributionId",
      "reviewOnlyCommissionLedgerId",
      "commissionReviewActionId",
      "commissionRuleId",
      "commissionLedgerId",
      "payoutBatchId",
    ],
    volatileClaims:
      "The affiliate/referral contract includes seeded click capture, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal action boundaries, and aggregate counts; it is not cookie assignment, buyer attribution finalization, payable commission state, fraud enforcement, tax collection, partner notification, direct agent review automation, or Stripe payout capability.",
  },
  {
    id: "evidence-mobile-admin",
    route: "/mobile-admin/source-data",
    resolves: "Mobile jobs-to-be-done, iOS and Android child issues, live dashboard source-data route, API dependencies, stack decision, and write boundaries.",
    stableIds: ["mobileJobId", "mobileApiDependencyId", "platformIssue", "mobileDashboardCardId"],
    volatileClaims:
      "The mobile contract and live public dashboard digest are live, but installable iOS and Android app claims require #67 and #68 smoke evidence.",
  },
  {
    id: "evidence-mobile-admin-dashboard",
    route: "/mobile-admin/dashboard/source-data",
    resolves:
      "Public-safe mobile dashboard digest with feature counts, roadmap counts, recent work-log metadata, attention counts, commerce table counts, agent-readiness counts, and platform source-data routes.",
    stableIds: ["mobileDashboardCardId", "featureId", "roadmapItemId", "workLogEntryId", "markAttentionId", "agentReadContractId"],
    volatileClaims:
      "The dashboard is a public-safe read contract, not private mobile auth, push notifications, confirmed writes, App Store distribution, or Play Store distribution.",
  },
  {
    id: "evidence-ios-mobile-admin",
    route: "/mobile-admin/ios/source-data",
    resolves: "iOS scaffold path, generated fixture, simulator target, validation command, smoke command, and screenshot evidence.",
    stableIds: ["platformIssue", "fixturePath", "simulatorBundleId"],
    volatileClaims:
      "The iOS simulator smoke target is not App Store distribution, push notification support, private mobile auth, or confirmed-write capability.",
  },
  {
    id: "evidence-android-mobile-admin",
    route: "/mobile-admin/android/source-data",
    resolves: "Android scaffold path, generated fixture asset, native package, emulator target, validation command, smoke command, and screenshot evidence.",
    stableIds: ["platformIssue", "fixturePath", "nativePackage", "defaultAvd"],
    volatileClaims:
      "The Android emulator smoke target is not Play Store distribution, push notification support, private mobile auth, or confirmed-write capability.",
  },
];

export const agentMcpPlan: AgentMcpPlan[] = [
  {
    id: "mcp-resource-features",
    resourceOrTool: "resource bumpgrade://features",
    status: "ready-contract",
    backedBy: "/features/source-data",
    purpose: "Expose feature IDs, statuses, issues, evidence, and agent-contract notes.",
    safetyBoundary: "Read-only; feature status changes still happen through issue/PR/admin workflows.",
  },
  {
    id: "mcp-resource-roadmap",
    resourceOrTool: "resource bumpgrade://roadmap",
    status: "ready-contract",
    backedBy: "/roadmap/source-data",
    purpose: "Expose roadmap lanes, public evidence, blockers, and next milestones.",
    safetyBoundary: "Read-only until a confirmed roadmap update API exists.",
  },
  {
    id: "mcp-resource-claims",
    resourceOrTool: "tool resolve_public_claim",
    status: "planned",
    backedBy: "/compare/source-data, /features/source-data, /roadmap/source-data, /admin/work-log/source-data",
    purpose: "Resolve a public claim to source IDs, URLs, issues, PRs, and work-log evidence.",
    safetyBoundary: "Must return caveats when evidence is stale, missing, planned-only, or private.",
  },
  {
    id: "mcp-resource-commerce",
    resourceOrTool: "resource bumpgrade://commerce",
    status: "ready-contract",
    backedBy: "/commerce/source-data",
    purpose: "Expose redacted commerce architecture, sandbox checkout status, referral attribution evidence, and billing write rules.",
    safetyBoundary: "No live billing, commission write, payout mutation, or destructive action may be performed by this resource.",
  },
  {
    id: "mcp-resource-content",
    resourceOrTool: "resource bumpgrade://content-surfaces",
    status: "ready-contract",
    backedBy: "/content/source-data",
    purpose: "Expose personas, resource records, pricing caveats, and content-surface issue evidence.",
    safetyBoundary: "Read-only; public resource and pricing claims still require source evidence or shipped product proof.",
  },
  {
    id: "mcp-resource-funnels",
    resourceOrTool: "resource bumpgrade://funnels",
    status: "ready-contract",
    backedBy: "/funnels/source-data",
    purpose: "Expose seeded funnel, published D1 funnels, ordered steps, blocks, revision IDs, owner-gated draft capability, and write-safety boundaries.",
    safetyBoundary: "Public resource stays read-only; owner-session draft create/seed/update/reorder, private preview, and exact-confirmed publish exist in admin UI, while checkout-link, unpublish/delete, and direct agent-edit tools require confirmed-write contracts.",
  },
  {
    id: "mcp-tool-create-funnel-draft",
    resourceOrTool: "tool create_funnel_draft",
    status: "planned",
    backedBy: "/admin/funnels and /api/admin/funnels/drafts",
    purpose: "Create a private draft funnel for an authenticated owner using the same D1 tables and audit model.",
    safetyBoundary:
      "Requires owner identity, explicit confirmation, idempotency key, audit event, stale-state check, and redaction before an agent may call it directly.",
  },
  {
    id: "mcp-tool-edit-funnel-step",
    resourceOrTool: "tool edit_funnel_step",
    status: "planned",
    backedBy: "/admin/funnels and /api/admin/funnels/drafts",
    purpose: "Edit or reorder a private draft funnel step for an authenticated owner using the same D1 tables and audit model.",
    safetyBoundary:
      "Requires owner identity, explicit confirmation for creator-speech edits, idempotency key, audit event, stale-state check, and redaction before an agent may call it directly.",
  },
  {
    id: "mcp-resource-checkout-offers",
    resourceOrTool: "resource bumpgrade://checkout-offers",
    status: "ready-contract",
    backedBy: "/offers/source-data",
    purpose:
      "Expose seeded checkout offer stack, primary offer, constrained order bump, optional referral attribution evidence, upsell, downsell, aggregate post-purchase decision evidence, revision IDs, and billing boundaries.",
    safetyBoundary:
      "Read-only for agents; the public UI can start a sandbox checkout only after exact confirmation and can record non-billing follow-up decisions after trusted checkout state, while live billing, offer writes, fulfillment, commission writes, and post-purchase charges require confirmed-write contracts.",
  },
  {
    id: "mcp-resource-product-access",
    resourceOrTool: "resource bumpgrade://product-access",
    status: "ready-contract",
    backedBy: "/products/source-data",
    purpose:
      "Expose seeded products, assets, access rules, entitlement templates, revision IDs, aggregate owner-entitlement inspection counts, customer-safe checkout intent lookup, short-lived private R2-backed download-token boundaries with redemption revalidation, owner-confirmed private asset upload-intent boundaries, and fulfillment boundaries.",
    safetyBoundary:
      "Read-mostly for public agents; customer lookup requires a checkout intent reference and redacts buyer/provider/private asset data. Token delivery streams only the seeded fixture through Bumpgrade. Owner-upload intents require owner auth, exact confirmation, idempotency, catalog revision checks, and redaction; customer delivery of arbitrary uploads, subscription access changes, and fulfillment actions remain unavailable.",
  },
  {
    id: "mcp-tool-create-product-asset-upload-intent",
    resourceOrTool: "tool create_product_asset_upload_intent",
    status: "planned",
    backedBy: "/api/admin/products/assets",
    purpose:
      "Create a small private product asset upload record for an authenticated owner on top of the same D1/R2 contract.",
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, catalog revision check, audit metadata, and redacted output. It must not expose R2 object keys, signed URLs, raw upload bodies, buyer data, or make uploaded assets customer-deliverable.",
  },
  {
    id: "mcp-resource-audience-automation",
    resourceOrTool: "resource bumpgrade://audience-automation",
    status: "ready-contract",
    backedBy: "/audience/source-data",
    purpose: "Expose seeded opt-in forms, lead magnets, tags, segments, sequences, broadcasts, automation rules, aggregate subscriber inspection counts, redaction flags, and consent boundaries.",
    safetyBoundary:
      "Seeded public opt-in capture and owner-gated subscriber inspection are live; imports, sends, broadcasts, unsubscribe changes, private exports, CRM notes, and direct agent subscriber writes require confirmed-write contracts.",
  },
  {
    id: "mcp-resource-analytics-experiments",
    resourceOrTool: "resource bumpgrade://analytics-experiments",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose:
      "Expose seeded event taxonomy, browser-side page-view beacon boundaries, dashboard-visible aggregate source attribution rows, fixed time-window metadata, aggregate event counts, aggregate source attribution counts, aggregate variant event counts, aggregate assignment counts, aggregate conversion report rows, metric formulas, experiment variants, assignment rules, and sample-size caveats.",
    safetyBoundary:
      "Seeded event capture, browser-side page-view beacons with deterministic variant evidence and normalized source attribution, deterministic assignment, dashboard-visible fixed-window aggregate source rows, and aggregate conversion reporting are live; cookie assignment, raw visitor tracking, raw referrer/query reporting, contact analytics, experiment traffic routing, custom events, and automated decisions require confirmed-write contracts.",
  },
  {
    id: "mcp-resource-affiliate-referrals",
    resourceOrTool: "resource bumpgrade://affiliate-referrals",
    status: "ready-contract",
    backedBy: "/affiliates/source-data",
    purpose:
      "Expose seeded affiliate programs, partner records, referral links, aggregate click counts, checkout attribution evidence, attribution rules, commission fixtures, payout review, and fraud flags.",
    safetyBoundary:
      "Seeded referral click capture and checkout attribution evidence are live; buyer attribution finalization, commission writes, fraud decisions, tax handling, payout account access, and Stripe payouts require confirmed-write contracts.",
  },
  {
    id: "mcp-tool-propose-update",
    resourceOrTool: "tool propose_admin_update",
    status: "planned",
    backedBy: "/admin/source-data and future confirmed-write APIs",
    purpose: "Create proposed feature, roadmap, journey, or work-log updates for owner review.",
    safetyBoundary: "Requires actor identity, confirmation text, idempotency key, stale-state check, and audit correlation before writing.",
  },
  {
    id: "mcp-resource-mobile-admin",
    resourceOrTool: "resource bumpgrade://mobile-admin",
    status: "ready-contract",
    backedBy: "/mobile-admin/source-data",
    purpose: "Expose the shared iOS and Android mobile admin plan, jobs, API dependencies, and confirmed-write boundaries.",
    safetyBoundary: "Read-only; mobile writes require a future confirmed-write action API and authenticated actor.",
  },
  {
    id: "mcp-resource-mobile-admin-dashboard",
    resourceOrTool: "resource bumpgrade://mobile-admin/dashboard",
    status: "ready-contract",
    backedBy: "/mobile-admin/dashboard/source-data",
    purpose: "Expose the public-safe mobile dashboard digest that iOS, Android, web, and agents can share.",
    safetyBoundary: "Read-only; no private admin rows, write tokens, R2 object keys, signed URLs, or secret values.",
  },
  {
    id: "mcp-resource-ios-mobile-admin",
    resourceOrTool: "resource bumpgrade://mobile-admin/ios",
    status: "ready-contract",
    backedBy: "/mobile-admin/ios/source-data",
    purpose: "Expose the first iOS app slice, simulator smoke command, fixture path, and screenshot evidence.",
    safetyBoundary: "Read-only; native mobile writes and private account data remain unavailable.",
  },
];

export const agentWriteSafetyRules = [
  "Prefer source-data routes and manifests over browser automation when a server-side contract exists.",
  "Do not invent pricing, customer, integration, roadmap, shipped-feature, testimonial, or competitor facts.",
  "Cite stable IDs, issue/PR/work-log evidence, source URLs, and retrieved dates for public claims.",
  "Keep secrets, raw provider IDs, private user data, private inbox bodies, and storage keys out of prompt-visible output.",
  "Require confirmation, idempotency, stale-state checks, audit correlation, and redaction for public, destructive, billing-impacting, moderation, source-editing, publishing, or creator-speech writes.",
  "Distinguish planned architecture, sandbox behavior, and live production capability.",
];

export const boilerplateBaselineEvidence: BoilerplateBaselineEvidence = {
  sourceRepo: "markitics/laurelharned",
  sourceBranch: "new-project-codex-boilerplate",
  sourcePath: "docs/new-project-codex-boilerplate",
  adoptedShape: [
    "AGENTS.md is adapted with Bumpgrade project constants, Cloudflare-first stack, required product surfaces, and Bumpgrade Codex email identity.",
    "docs/working-agreements.md carries the issue/branch/PR, screenshot, validation, work-log, and Mark-attention workflow.",
    "docs/agent/* carries admin-surface, agent-ready, screenshot, work-log, and user-journey rules.",
    "docs/keep-working/* carries the repo-tracked goal-runner and status-update skills.",
    "public/llms.txt points agents to current Bumpgrade feature, roadmap, comparison, commerce, admin, and agent-doc routes.",
  ],
};

export const agentManifest = {
  id: "bumpgrade-agent-manifest",
  generatedFrom: "src/lib/agent-manifest.ts",
  updatedAt: agentManifestUpdatedAt,
  site: site.url,
  caveat:
    "This manifest is public-safe. It exposes read contracts and planned MCP/tooling shape, not private admin data or permission to perform writes.",
  docs: agentDocs,
  readContracts: agentReadContracts,
  sourceEvidenceRoutes: agentSourceEvidenceRoutes,
  mcpPlan: agentMcpPlan,
  writeSafetyRules: agentWriteSafetyRules,
  boilerplateBaselineEvidence,
};
