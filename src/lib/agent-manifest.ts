import { site } from "@/lib/site";

export const agentManifestUpdatedAt = "2026-05-18";

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
    evidence: ["Issue #13", "Issue #67", "Issue #68", "/mobile-admin/source-data"],
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
    stableIds: ["productId", "priceId", "checkoutIntentId", "auditCorrelationId"],
    safeForAgents: ["Read redacted commerce architecture", "Separate sandbox from live billing", "Inspect write safety rules"],
    writeBoundary: "Billing-impacting writes require exact confirmation, idempotency, stale-state checks, audit correlation, and webhook evidence.",
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
      "Discover owner-session editable draft and private preview capability from issues #91, #93, and #95",
    ],
    writeBoundary:
      "Owner-session seed/create/update/reorder draft writes and private draft preview exist at /admin/funnels. Publishing, checkout linking, deletion, public preview, drag-and-drop layout editing, and direct agent edits require future confirmed-write APIs.",
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
      "Check audit metadata before acting on draft state",
    ],
    writeBoundary:
      "The POST endpoint can seed, create, update, and reorder private draft steps for an authenticated owner; private preview is owner-gated; public publishing, checkout linking, deletion, and direct agent edits are not live.",
  },
  {
    id: "read-checkout-offer-stack",
    title: "Checkout offer source data",
    route: "/offers/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/checkout-offers.ts",
    stableIds: ["checkoutOfferStackId", "offerId", "orderBumpId", "upsellId", "downsellId", "checkoutRevisionId", "agentActionId"],
    safeForAgents: [
      "Read seeded checkout offer stack",
      "Inspect bump and upsell sequence",
      "Inspect confirmed sandbox checkout start boundaries",
    ],
    writeBoundary:
      "A confirmed sandbox checkout start can include the seeded primary offer and constrained order bump; live billing, price mutation, fulfillment, direct agent writes, and post-purchase charges require future confirmed-write APIs.",
  },
  {
    id: "read-product-access-catalog",
    title: "Product access source data",
    route: "/products/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/product-access.ts",
    stableIds: ["productId", "assetId", "accessRuleId", "entitlementTemplateId", "subscriptionPlanId", "fulfillmentId", "agentActionId"],
    safeForAgents: ["Read seeded product catalog", "Inspect access rules", "Inspect entitlement and fulfillment boundaries"],
    writeBoundary: "Product, asset, entitlement, fulfillment, subscription access, and private content writes require future confirmed-write APIs.",
  },
  {
    id: "read-audience-automation",
    title: "Audience automation source data",
    route: "/audience/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/audience-automation.ts",
    stableIds: [
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
    safeForAgents: ["Read seeded opt-in form", "Inspect tags and segments", "Inspect sequence and automation boundaries"],
    writeBoundary: "Subscriber, tag, sequence, broadcast, unsubscribe, and email-send writes require future confirmed-write APIs.",
  },
  {
    id: "read-analytics-experiments",
    title: "Analytics and experiments source data",
    route: "/analytics/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/analytics-experiments.ts",
    stableIds: [
      "analyticsEventId",
      "metricId",
      "funnelStepMetricId",
      "experimentId",
      "variantId",
      "assignmentRuleId",
      "reportId",
      "agentActionId",
    ],
    safeForAgents: ["Read seeded event taxonomy", "Inspect metric formulas", "Inspect experiment assignment boundaries"],
    writeBoundary: "Event ingestion, visitor assignment, contact analytics, experiment traffic, and decision writes require future confirmed-write APIs.",
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
      "attributionRuleId",
      "commissionRuleId",
      "commissionLedgerId",
      "payoutBatchId",
      "reviewFlagId",
      "auditEventId",
      "agentActionId",
    ],
    safeForAgents: ["Read seeded affiliate program", "Inspect referral links and attribution rules", "Inspect commission and payout review boundaries"],
    writeBoundary:
      "Referral click capture, cookie assignment, buyer attribution, commission writes, fraud enforcement, payout actions, and partner notifications require future confirmed-write APIs.",
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
    resolves: "Redacted commerce architecture, sandbox checkout offer, payment tables, webhook rules, and billing write safety.",
    stableIds: ["productId", "priceId", "checkoutIntentId", "auditCorrelationId"],
    volatileClaims: "Live payment capability is not enabled until a separate rollout and webhook smoke evidence prove it.",
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
      "Seeded funnel, ordered steps, page blocks, revision ID, preview route, source-data route, owner-gated draft capability, D1 table names, and confirmed-write boundary.",
    stableIds: ["funnelId", "funnelStepId", "funnelBlockId", "funnelRevisionId", "funnelDraftId", "funnelAuditEventId"],
    volatileClaims:
      "The public funnel contract exposes owner-gated editable draft capability metadata; it does not expose private draft copy, public publishing, checkout linking, or unconfirmed agent edits.",
  },
  {
    id: "evidence-checkout-offers",
    route: "/offers/source-data",
    resolves:
      "Seeded checkout offer stack, primary offer, selectable order bump, upsell, downsell, checkout route, revision ID, and confirmed-write boundary.",
    stableIds: ["checkoutOfferStackId", "offerId", "orderBumpId", "upsellId", "downsellId", "checkoutRevisionId"],
    volatileClaims:
      "The checkout-offer contract now includes a confirmed sandbox checkout start for the seeded primary offer plus constrained order bump; it is not live billing, one-click upsell charging, fulfillment, price mutation, or direct agent write capability.",
  },
  {
    id: "evidence-products-access",
    route: "/products/source-data",
    resolves: "Seeded product catalog, assets, access rules, entitlement templates, preview route, revision ID, and confirmed-write boundary.",
    stableIds: ["productId", "assetId", "accessRuleId", "entitlementTemplateId", "fulfillmentId"],
    volatileClaims:
      "The product/access contract is read-only preview evidence; it is not private asset delivery, signed URL access, customer entitlement state, or fulfillment automation.",
  },
  {
    id: "evidence-audience-automation",
    route: "/audience/source-data",
    resolves: "Seeded audience automation workspace, opt-in form, tags, segments, lead magnet, sequence, broadcast draft, and confirmed-write boundary.",
    stableIds: ["subscriberSegmentId", "optInFormId", "leadMagnetId", "emailSequenceId", "automationRuleId"],
    volatileClaims:
      "The audience automation contract is read-only preview evidence; it is not subscriber storage, contact import, live email sending, unsubscribe management, or CRM timeline state.",
  },
  {
    id: "evidence-analytics-experiments",
    route: "/analytics/source-data",
    resolves: "Seeded analytics event taxonomy, metric formulas, fixture funnel-step reports, experiment variants, assignment rule, and confirmed-write boundary.",
    stableIds: ["analyticsEventId", "metricId", "experimentId", "variantId", "assignmentRuleId"],
    volatileClaims:
      "The analytics contract is read-only preview evidence; it is not live event collection, cookie assignment, contact-level analytics, raw event storage, automated decisions, or statistically meaningful proof.",
  },
  {
    id: "evidence-affiliate-referrals",
    route: "/affiliates/source-data",
    resolves:
      "Seeded affiliate program, partner records, referral links, attribution rules, commission rules, ledger fixtures, payout batch, review flags, and confirmed-write boundary.",
    stableIds: ["affiliateProgramId", "affiliatePartnerId", "referralLinkId", "commissionRuleId", "commissionLedgerId", "payoutBatchId"],
    volatileClaims:
      "The affiliate/referral contract is read-only preview evidence; it is not live click tracking, buyer attribution, payable commission state, fraud enforcement, tax collection, or Stripe payout capability.",
  },
  {
    id: "evidence-mobile-admin",
    route: "/mobile-admin/source-data",
    resolves: "Mobile jobs-to-be-done, iOS and Android child issues, API dependencies, stack decision, and write boundaries.",
    stableIds: ["mobileJobId", "mobileApiDependencyId", "platformIssue"],
    volatileClaims: "The mobile contract is live, but installable iOS and Android app claims require #67 and #68 smoke evidence.",
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
    purpose: "Expose redacted commerce architecture, sandbox checkout status, and billing write rules.",
    safetyBoundary: "No live billing or destructive action may be performed by this resource.",
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
    purpose: "Expose seeded funnel, ordered steps, blocks, revision IDs, owner-gated draft capability, and write-safety boundaries.",
    safetyBoundary: "Public resource stays read-only; owner-session draft create/seed/update/reorder and private preview exist in admin UI, while publish, checkout-link, public preview, and direct agent-edit tools require confirmed-write contracts.",
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
      "Expose seeded checkout offer stack, primary offer, constrained order bump, upsell, downsell, revision IDs, and billing boundaries.",
    safetyBoundary:
      "Read-only for agents; the public UI can start a sandbox checkout only after exact confirmation, while live billing, offer writes, fulfillment, and post-purchase charges require confirmed-write contracts.",
  },
  {
    id: "mcp-resource-product-access",
    resourceOrTool: "resource bumpgrade://product-access",
    status: "ready-contract",
    backedBy: "/products/source-data",
    purpose: "Expose seeded products, assets, access rules, entitlement templates, revision IDs, and fulfillment boundaries.",
    safetyBoundary: "Read-only; private asset access, entitlement writes, subscription access changes, and fulfillment actions require confirmed-write contracts.",
  },
  {
    id: "mcp-resource-audience-automation",
    resourceOrTool: "resource bumpgrade://audience-automation",
    status: "ready-contract",
    backedBy: "/audience/source-data",
    purpose: "Expose seeded opt-in forms, lead magnets, tags, segments, sequences, broadcasts, automation rules, and consent boundaries.",
    safetyBoundary: "Read-only; subscriber writes, imports, sends, broadcasts, unsubscribe changes, and CRM notes require confirmed-write contracts.",
  },
  {
    id: "mcp-resource-analytics-experiments",
    resourceOrTool: "resource bumpgrade://analytics-experiments",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: "Expose seeded event taxonomy, metric formulas, fixture reports, experiment variants, assignment rules, and sample-size caveats.",
    safetyBoundary: "Read-only; event ingestion, cookie assignment, visitor tracking, experiment traffic changes, and automated decisions require confirmed-write contracts.",
  },
  {
    id: "mcp-resource-affiliate-referrals",
    resourceOrTool: "resource bumpgrade://affiliate-referrals",
    status: "ready-contract",
    backedBy: "/affiliates/source-data",
    purpose: "Expose seeded affiliate programs, partner records, referral links, attribution rules, commission fixtures, payout review, and fraud flags.",
    safetyBoundary:
      "Read-only; referral tracking, buyer attribution, commission writes, fraud decisions, tax handling, payout account access, and Stripe payouts require confirmed-write contracts.",
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
