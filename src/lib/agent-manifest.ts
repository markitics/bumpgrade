import { site } from "@/lib/site";
import {
  audienceImportIntentApiRoute,
  audienceImportIntentIssue,
  audienceImportPreflightApiRoute,
  audienceImportPreflightIssue,
} from "@/lib/audience-imports";
import {
  analyticsExperimentDecisionApiRoute,
  analyticsExperimentDecisionIssue,
} from "@/lib/analytics-experiment-decisions";
import {
  analyticsNotificationInboxApiRoute,
  analyticsNotificationInboxIssue,
} from "@/lib/analytics-notification-inbox";
import {
  analyticsNotificationDispatchPreflightApiRoute,
  analyticsNotificationDispatchPreflightIssue,
} from "@/lib/analytics-notification-dispatch-preflights";
import {
  analyticsNotificationProviderDomainReadinessApiRoute,
  analyticsNotificationProviderDomainReadinessIssue,
} from "@/lib/analytics-notification-provider-domain-readiness";
import {
  analyticsNotificationContentConsentReadinessApiRoute,
  analyticsNotificationContentConsentReadinessIssue,
} from "@/lib/analytics-notification-content-consent-readiness";
import {
  analyticsNotificationSendPayloadReadinessApiRoute,
  analyticsNotificationSendPayloadReadinessIssue,
} from "@/lib/analytics-notification-send-payload-readiness";
import {
  analyticsNotificationQueueProducerReadinessApiRoute,
  analyticsNotificationQueueProducerReadinessIssue,
} from "@/lib/analytics-notification-queue-producer-readiness";
import {
  analyticsNotificationQueueConsumerReadinessApiRoute,
  analyticsNotificationQueueConsumerReadinessIssue,
} from "@/lib/analytics-notification-queue-consumer-readiness";
import {
  analyticsNotificationProviderCallReadinessApiRoute,
  analyticsNotificationProviderCallReadinessIssue,
} from "@/lib/analytics-notification-provider-call-readiness";
import {
  analyticsNotificationDeliveryAttemptReadinessApiRoute,
  analyticsNotificationDeliveryAttemptReadinessIssue,
} from "@/lib/analytics-notification-delivery-attempt-readiness";
import {
  analyticsNotificationDeliveryResultReadinessApiRoute,
  analyticsNotificationDeliveryResultReadinessIssue,
} from "@/lib/analytics-notification-delivery-result-readiness";
import {
  analyticsNotificationDeliveryStatusWebhookReadinessApiRoute,
  analyticsNotificationDeliveryStatusWebhookReadinessIssue,
} from "@/lib/analytics-notification-delivery-status-webhook-readiness";
import {
  analyticsNotificationProviderPollingReadinessApiRoute,
  analyticsNotificationProviderPollingReadinessIssue,
} from "@/lib/analytics-notification-provider-polling-readiness";
import {
  affiliatePayoutPreparationRecordApiRoute,
  affiliatePayoutPreparationRecordIssue,
} from "@/lib/affiliate-payout-preparation-records";
import {
  affiliateFraudReviewRecordApiRoute,
  affiliateFraudReviewRecordIssue,
} from "@/lib/affiliate-fraud-review-records";
import {
  affiliatePartnerNotificationReadinessRecordApiRoute,
  affiliatePartnerNotificationReadinessRecordIssue,
} from "@/lib/affiliate-partner-notification-readiness-records";
import {
  affiliatePartnerNotificationProviderReadinessRecordApiRoute,
  affiliatePartnerNotificationProviderReadinessRecordIssue,
} from "@/lib/affiliate-partner-notification-provider-readiness-records";
import {
  affiliatePartnerNotificationSendPreflightRecordApiRoute,
  affiliatePartnerNotificationSendPreflightRecordIssue,
} from "@/lib/affiliate-partner-notification-send-preflight-records";
import {
  analyticsAlertAnomalyIssue,
  analyticsCohortComparisonIssue,
  analyticsNotificationReadinessIssue,
  analyticsReportExportIssue,
} from "@/lib/analytics-report-exports";
import {
  publisherCustomDomainIssue,
  publisherCustomerAuthIssue,
  publisherTenantIssue,
  publisherTenantParentIssue,
} from "@/lib/publisher-tenants";

export const agentManifestUpdatedAt = "2026-05-21";

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
    evidence: ["Issue #13", "Issue #67", "Issue #68", "Issue #153", "Issue #155", "Issue #157", "/mobile-admin/source-data"],
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
    id: "read-publisher-account-setup",
    title: "Publisher account, subdomain, and custom-domain setup",
    route: "/account/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/publisher-tenants.ts and D1 publisher tenant tables",
    stableIds: [
      "publisherTenantId",
      "publisherSubdomainReservationId",
      "publisherCustomDomainId",
      "publisherPlanEntitlementId",
      "publisherAuthBoundaryId",
      "issue",
    ],
    safeForAgents: [
      "Read paid-plan gate requirements",
      "Read default Bumpgrade subdomain reservation policy",
      "Read custom-domain DNS instruction and verification policy",
      "Read cross-subdomain auth configuration and custom-domain login boundary",
      "Distinguish Bumpgrade subdomains, existing custom domains, and the current no-domain-purchase policy",
    ],
    writeBoundary:
      "Subdomain reservation and custom-domain onboarding require a signed-in, email-confirmed publisher with active paid-plan or launch-pilot entitlement, idempotency, audit correlation, and redacted outputs; Bumpgrade does not sell, register, renew, transfer, or price domains today.",
  },
  {
    id: "read-funnel-contract",
    title: "Funnel source data",
    route: "/funnels/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/funnels.ts",
    stableIds: [
      "funnelId",
      "funnelStepId",
      "funnelBlockId",
      "funnelTemplateId",
      "funnelBlockTemplateId",
      "funnelCheckoutLinkId",
      "funnelWebinarResourceTemplateId",
      "funnelRevisionId",
      "funnelDraftId",
      "funnelDraftDuplicateId",
      "funnelAuditEventId",
      "checkoutIntentId",
      "checkoutOfferStackId",
      "offerId",
      "agentActionId",
    ],
    safeForAgents: [
      "Read seeded draft funnel",
      "Inspect ordered steps",
      "Inspect page blocks and write boundaries",
      "Inspect reusable funnel templates and block-template write boundaries from issue #159",
      "Discover owner-session template-to-draft creation from issue #161",
      "Discover owner-session checkout-offer linking from issue #163",
      "Discover public linked-checkout start rendering from issue #165",
      "Discover webinar and resource page-shape templates from issue #213",
      "Discover owner-session private draft duplication from issue #215",
      "Discover owner-session editable draft, private preview, and exact-confirmed publish capability from issues #91, #93, #95, #135, #163, #165, #213, and #215",
    ],
    writeBoundary:
      "Owner-session seed/create/template-create/duplicate/update/reorder/checkout-link draft writes, including webinar/resource template-to-draft creation, private draft preview, and exact-confirmed public publishing exist at /admin/funnels. Published linked checkout blocks can render the existing sandbox checkout start surface. Direct agent template creation, block editing, direct agent checkout linking, direct agent duplication, deletion, unpublishing, live billing, live webinar scheduling, private resource delivery, drag-and-drop layout editing, and direct agent edits require future confirmed-write APIs.",
  },
  {
    id: "read-admin-draft-funnels",
    title: "Admin draft funnels",
    route: "/admin/funnels",
    kind: "doc",
    auth: "owner-session",
    sourceOfTruth: "D1 tables funnel_drafts, funnel_draft_steps, and funnel_audit_events",
    stableIds: ["funnelDraftId", "funnelDraftDuplicateId", "funnelDraftStepId", "funnelAuditEventId", "ownerUserId"],
    safeForAgents: [
      "Read private draft funnel rows only with an owner session",
      "Preview private draft funnel state only with an owner session",
      "Create private drafts from reusable templates only with an owner session, exact confirmation, and idempotency",
      "Create private webinar/resource template drafts only as page-shape records, not as live scheduling or private asset delivery",
      "Duplicate private drafts only with an owner session, exact confirmation, idempotency, and a fresh revision ID",
      "Do not treat duplicated drafts as published, and do not assume checkout-link metadata is copied",
      "Attach the seeded sandbox checkout offer to private checkout blocks only with an owner session, exact confirmation, idempotency, and a fresh revision ID",
      "Publish a draft only through owner-session UI with exact confirmation, idempotency, and a fresh revision ID",
      "Check audit metadata before acting on draft state",
    ],
    writeBoundary:
      "The POST endpoint can seed, create, create from templates including webinar/resource page shapes, duplicate, update, reorder, checkout-link, and publish private draft steps for an authenticated owner; private preview is owner-gated; deletion, unpublishing, live webinar scheduling, private resource delivery, direct agent template creation, direct agent duplication, and direct agent edits are not live.",
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
      "src/lib/product-access.ts + src/lib/product-entitlement-inspection.ts + src/lib/customer-product-entitlements.ts + src/lib/product-download-tokens.ts + src/lib/product-asset-uploads.ts + src/lib/product-protected-content.ts",
    stableIds: [
      "productId",
      "assetId",
      "accessRuleId",
      "entitlementTemplateId",
      "productEntitlementInspectionId",
      "customerProductEntitlementLookupId",
      "productDownloadTokenId",
      "productAssetUploadIntentId",
      "productEntitlementRevocationIntentId",
      "productProtectedContentId",
      "productProtectedContentDeliveryId",
      "subscriptionPlanId",
      "subscriptionMembershipAccessId",
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
      "Inspect owner-confirmed non-destructive revocation intent records",
      "Inspect protected content readiness and the checkout-intent-scoped protected fixture delivery boundary",
      "Inspect subscription-backed membership access state from trusted Stripe Billing webhook evidence",
      "Inspect entitlement and fulfillment boundaries",
    ],
    writeBoundary:
      "Trusted paid sandbox webhooks can grant idempotent entitlement rows for seeded checkout line items; trusted Stripe Billing subscription webhooks can sync checkout-linked membership access while state is active or trialing and pause it when subscription state is canceled, unpaid, incomplete_expired, or deleted; verified owners can inspect private entitlement rows, owner-confirmed non-destructive revocation intents, and protected content readiness in /admin/products; customers can inspect checkout-intent-scoped entitlement status, create short-lived download tokens that stream a seeded private R2 fixture without buyer or provider identifiers, and read seeded protected course/member fixture bodies only after active-entitlement and trusted-checkout checks; verified owners can create small private asset upload records after exact confirmation, idempotency, and catalog revision checks, and record non-destructive revocation intents after exact confirmation, idempotency, and stale entitlement status checks; product creation, customer delivery of arbitrary uploads, signed object URLs, destructive revocation, live fulfillment automation, Customer Portal actions, and private content writes require future authenticated confirmed-write APIs.",
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
      "This is a read-only checkout-intent-scoped lookup; signed downloads, protected lessons, buyer identity, entitlement mutation, destructive revocation, and live fulfillment require future authenticated confirmed-write APIs.",
  },
  {
    id: "read-subscription-membership-access",
    title: "Subscription membership access state",
    route: "/products/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/product-entitlements.ts + D1 billing_subscriptions and product_entitlements",
    stableIds: [
      "subscriptionMembershipAccessId",
      "checkoutIntentId",
      "productEntitlementId",
      "subscriptionPlanId",
      "productId",
      "entitlementTemplateId",
    ],
    safeForAgents: [
      "Inspect the seeded monthly membership price and access-rule mapping",
      "Confirm active/trialing Stripe Billing subscription state can activate checkout-linked membership access",
      "Confirm canceled, unpaid, incomplete_expired, or deleted subscription state pauses membership access",
      "Confirm buyer identity, raw subscription/customer IDs, webhook IDs, metadata JSON, member posts, private files, Customer Portal URLs, and progress rows are excluded",
    ],
    writeBoundary:
      "This is read-only subscription-backed membership access evidence. It does not create or mutate Stripe subscriptions, open Customer Portal sessions, expose raw Stripe IDs, deliver member posts/files, change pricing, or perform direct agent billing writes.",
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
      "This creates a short-lived token and streams a seeded private R2-backed fixture through Bumpgrade after revalidating current entitlement status, checkout intent linkage, trusted checkout state, and asset scope; protected content, arbitrary asset uploads, destructive revocation, subscription access, and live fulfillment automation require future authenticated confirmed-write APIs.",
  },
  {
    id: "read-protected-product-content",
    title: "Protected product content delivery fixture",
    route: "/api/products/protected-content",
    kind: "api",
    auth: "public",
    sourceOfTruth: "src/lib/product-protected-content.ts",
    stableIds: ["checkoutIntentId", "productEntitlementId", "productProtectedContentId", "productId", "entitlementTemplateId"],
    safeForAgents: [
      "Read a seeded protected course/member fixture only with a known checkout intent and matching active entitlement",
      "Confirm protected fixture delivery rechecks product/template scope and current paid/completed checkout state",
      "Confirm buyer identity, raw Stripe IDs, webhook IDs, metadata JSON, R2 keys, signed URLs, arbitrary uploaded content, and progress rows are excluded",
    ],
    writeBoundary:
      "This route returns seeded protected fixture bodies for eligible checkout-linked entitlements only. It is not direct public agent write access, arbitrary private upload delivery, signed object URL access, progress tracking, subscription mutation, destructive revocation, or live fulfillment automation.",
  },
  {
    id: "read-admin-product-entitlements",
    title: "Admin product entitlements",
    route: "/admin/products",
    kind: "doc",
    auth: "owner-session",
    sourceOfTruth: "D1 tables product_entitlements, product_fulfillment_tasks, product_entitlement_revocation_intents, product_protected_content_sections, checkout_intents, commerce_products, and commerce_prices",
    stableIds: ["productId", "entitlementTemplateId", "productEntitlementId", "productEntitlementRevocationIntentId", "productProtectedContentId", "fulfillmentTaskId", "checkoutIntentId", "ownerUserId"],
    safeForAgents: [
      "Read private buyer entitlement rows only with an owner session",
      "Inspect checkout status, product/price context, access rule, and queued fulfillment state",
      "Inspect owner-visible revocation intent records without removing access",
      "Inspect owner-visible protected content readiness and which sections are eligible for checkout-scoped fixture delivery",
      "Confirm public source-data redacts buyer email, raw Stripe IDs, hashes, metadata JSON, private R2 keys, and signed URLs",
    ],
    writeBoundary:
      "This owner page can inspect entitlement rows and record non-destructive revocation intent evidence without removing access; protected fixture body delivery happens only through checkout-intent scoped customer checks. Signed object URLs, arbitrary uploaded content delivery, destructive revocation, subscription access changes, refunds, customer portals, private asset delivery, and direct public agent entitlement writes require future confirmed-write APIs.",
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
    id: "create-owner-product-revocation-intent",
    title: "Owner product revocation intent",
    route: "/api/admin/products/revocation-intents",
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 table product_entitlement_revocation_intents",
    stableIds: ["productEntitlementRevocationIntentId", "productEntitlementId", "productId", "ownerUserId", "idempotencyKey"],
    safeForAgents: [
      "Inspect the owner-only access-removal confirmation contract",
      "Record non-destructive revocation intent records only with an owner session",
      "Confirm public responses omit buyer identity, actor email, actor hash, target entitlement ids in public source-data, Stripe references, private reason notes, and metadata JSON",
      "Use idempotency and current entitlement status checks before recording intent",
    ],
    writeBoundary:
      "This owner-session API records redacted revocation intent metadata in D1 after exact confirmation, idempotency, and stale entitlement status checks. It does not revoke access, mutate entitlement status, issue refunds, change subscriptions, notify customers, expose private reason text, or allow unauthenticated/direct public agent writes.",
  },
  {
    id: "read-audience-automation",
    title: "Audience automation source data",
    route: "/audience/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth:
      "src/lib/audience-automation.ts + src/lib/audience-subscribers.ts + src/lib/audience-broadcasts.ts + src/lib/audience-imports.ts",
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
      "broadcastReadinessId",
      "consentRecordId",
      "suppressionEntryId",
      "timelineEntryId",
      "agentActionId",
      "broadcastScheduleIntentId",
      "broadcastPreviewSafetyId",
      "broadcastQueueReadinessId",
      "broadcastDeliveryBatchId",
      "broadcastDeliveryQueueMessageId",
      "broadcastDispatchPreflightId",
      "broadcastDispatchAttemptId",
      "broadcastSenderDomainReadinessId",
      "broadcastProviderEventReadinessId",
      "broadcastProviderRateLimitReadinessId",
      "broadcastProviderResponseReadinessId",
      "broadcastSendPayloadReadinessId",
      "broadcastQueueProducerReadinessId",
      "broadcastQueueConsumerReadinessId",
      "audienceImportIntentId",
      "audienceImportPreflightId",
    ],
    safeForAgents: [
      "Read seeded opt-in form",
      "Inspect tags and segments",
      "Inspect consent-backed capture boundary",
      "Inspect aggregate owner-subscriber, suppression, and timeline counts with redaction flags",
      "Inspect suppression-aware broadcast readiness without recipient exposure",
      "Inspect public-safe dry-run broadcast schedule intent counts without actor email or recipient payloads",
      "Inspect broadcast preview and unsubscribe-footer safety without personalized body or recipient exposure",
      "Inspect delivery queue readiness without recipient payloads, queue rows, or provider sends",
      "Inspect delivery-batch dry runs without recipient payloads, queue messages, or provider sends",
      "Inspect delivery queue message dry runs without Cloudflare Queue dispatch, recipient payloads, or provider sends",
      "Inspect dispatch preflight dry runs without Cloudflare Queue dispatch, recipient payloads, or provider sends",
      "Inspect dispatch attempt receipts without Cloudflare Queue producers, queue payload bodies, provider responses, or provider sends",
      "Inspect sender-domain readiness without private DNS credentials, raw DNS records, provider secrets, or provider sends",
      "Inspect provider-event readiness without provider secrets, raw provider payloads, provider responses, or provider message IDs",
      "Inspect provider rate-limit readiness without provider secrets, provider limit secrets, raw provider payloads, provider responses, or provider message IDs",
      "Inspect provider response readiness without provider secrets, raw response bodies, provider responses, or provider message IDs",
      "Inspect send-payload readiness without recipient payloads, personalized bodies, raw payload bodies, queue producers, or provider sends",
      "Inspect Queue producer readiness without Queue messages, queue payload bodies, recipient payloads, or provider sends",
      "Inspect Queue consumer readiness without Queue message consumption, acks, retry/dead-letter rows, queue payload body reads, recipient payloads, or provider sends",
      "Inspect owner-confirmed import intents without raw contact rows, raw emails, actor emails, private notes, sequence enrollments, or sends",
      "Inspect owner-confirmed import preflights without raw contact rows, raw emails, subscriber writes, exports, actor emails, private notes, sequence enrollments, or sends",
      "Inspect the public-safe unsubscribe/suppression write boundary",
      "Inspect the owner-only CRM timeline note boundary",
      "Inspect sequence and automation boundaries",
    ],
    writeBoundary:
      "Public visitors can submit the seeded opt-in form with explicit consent and can record unsubscribe/suppression evidence without exposing list membership; verified owners can inspect private subscriber rows, create private CRM notes, view broadcast readiness, preview safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, sender-domain readiness, provider-event readiness, provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness, Queue consumer readiness, redacted import intents, and redacted import preflights, and record dry-run schedule intents, delivery batches, queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, non-destructive import intents, and aggregate import preflights in /admin/audience; real contact imports, real email delivery, private exports, direct agent subscriber writes, private DNS/provider setup, provider webhooks, Cloudflare Queue dispatch, Queue producer execution, Queue consumer execution, queue payload bodies, recipient payloads, personalized bodies, provider responses, and provider message IDs require future confirmed-write APIs.",
  },
  {
    id: "create-owner-broadcast-schedule-intent",
    title: "Owner broadcast schedule dry-run intent",
    route: "/api/admin/audience/broadcasts/schedule-intents",
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 tables audience_broadcast_schedule_intents, audience_broadcast_drafts, audience_subscribers, audience_consent_events, and audience_suppression_entries",
    stableIds: ["broadcastScheduleIntentId", "broadcastDraftId", "ownerUserId", "idempotencyKey", "expectedDraftUpdatedAt"],
    safeForAgents: [
      "Inspect the owner-only dry-run schedule intent contract",
      "Create dry-run schedule intent records only with an owner session and exact confirmation",
      "Use draft revision, expected readiness count, and idempotency checks before recording intent",
      "Confirm responses omit actor email, recipient email, recipient names, suppression hashes, recipient payloads, send queue rows, and provider message IDs",
    ],
    writeBoundary:
      "This owner-session API records dry-run broadcast schedule intent metadata only. It does not send email, create send queue rows, create provider message IDs, expose recipients, authorize public agent writes, or bypass future unsubscribe footer, sender-domain, suppression, and audit requirements.",
  },
  {
    id: "create-owner-broadcast-delivery-batch",
    title: "Owner broadcast delivery batch dry run",
    route: "/api/admin/audience/broadcasts/delivery-batches",
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 tables audience_broadcast_delivery_batches, audience_broadcast_schedule_intents, audience_broadcast_drafts, audience_broadcast_preview_safety, and audience_broadcast_queue_readiness",
    stableIds: ["broadcastDeliveryBatchId", "broadcastScheduleIntentId", "broadcastDraftId", "ownerUserId", "idempotencyKey", "expectedDraftUpdatedAt"],
    safeForAgents: [
      "Inspect the owner-only delivery-batch dry-run contract",
      "Create dry-run delivery batch records only with an owner session and exact confirmation",
      "Use schedule intent, draft revision, expected readiness count, preview safety, queue readiness, and idempotency checks before recording batch evidence",
      "Confirm responses omit actor email, recipient email, recipient names, suppression hashes, recipient payloads, send queue messages, personalized bodies, and provider message IDs",
    ],
    writeBoundary:
      "This owner-session API records aggregate delivery-batch dry-run metadata only. It does not send email, create recipient payloads, enqueue provider messages, create provider message IDs, expose recipients, authorize public agent writes, or bypass future sender-domain, suppression, unsubscribe footer, provider-limit, and audit requirements.",
  },
  {
    id: "create-owner-broadcast-delivery-queue-messages",
    title: "Owner broadcast delivery queue message dry run",
    route: "/api/admin/audience/broadcasts/delivery-queue-messages",
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 tables audience_broadcast_delivery_queue_messages, audience_broadcast_delivery_batches, audience_broadcast_drafts, and audience_broadcast_queue_readiness",
    stableIds: ["broadcastDeliveryQueueMessageId", "broadcastDeliveryBatchId", "broadcastDraftId", "ownerUserId", "idempotencyKey", "expectedDraftUpdatedAt"],
    safeForAgents: [
      "Inspect the owner-only queue-message dry-run contract",
      "Create dry-run queue-message evidence only with an owner session and exact confirmation",
      "Use delivery batch, draft revision, expected readiness count, queue readiness, and idempotency checks before recording queue-message evidence",
      "Confirm responses omit actor email, recipient email, recipient names, suppression hashes, recipient payloads, Cloudflare Queue message bodies, personalized bodies, and provider message IDs",
    ],
    writeBoundary:
      "This owner-session API records aggregate queue-message dry-run metadata only. It does not send email, dispatch Cloudflare Queue messages, create recipient payloads, create provider message IDs, expose recipients, authorize public agent writes, or bypass future sender-domain, suppression, unsubscribe footer, provider-limit, dispatch, and audit requirements.",
  },
  {
    id: "create-owner-broadcast-dispatch-preflight",
    title: "Owner broadcast dispatch preflight dry run",
    route: "/api/admin/audience/broadcasts/dispatch-preflights",
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 tables audience_broadcast_dispatch_preflights, audience_broadcast_delivery_queue_messages, audience_broadcast_drafts, and audience_broadcast_queue_readiness",
    stableIds: ["broadcastDispatchPreflightId", "broadcastDeliveryQueueMessageId", "broadcastDraftId", "ownerUserId", "idempotencyKey", "expectedDraftUpdatedAt"],
    safeForAgents: [
      "Inspect the owner-only dispatch preflight dry-run contract",
      "Create dry-run dispatch preflight evidence only with an owner session and exact confirmation",
      "Use queue-message evidence, draft revision, expected readiness count, provider-limit, sender-domain, suppression, audit, and idempotency checks before recording dispatch preflight evidence",
      "Confirm responses omit actor email, recipient email, recipient names, suppression hashes, recipient payloads, Cloudflare Queue message bodies, personalized bodies, provider responses, and provider message IDs",
    ],
    writeBoundary:
      "This owner-session API records aggregate dispatch preflight dry-run metadata only. It does not send email, dispatch Cloudflare Queue messages, create recipient payloads, create provider message IDs, expose recipients, authorize public agent writes, or bypass future sender-domain, suppression, unsubscribe footer, provider-limit, queue-dispatch, and audit requirements.",
  },
  {
    id: "create-owner-broadcast-dispatch-attempt",
    title: "Owner broadcast dispatch attempt receipt",
    route: "/api/admin/audience/broadcasts/dispatch-attempts",
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 tables audience_broadcast_dispatch_attempts, audience_broadcast_dispatch_preflights, audience_broadcast_drafts, and audience_broadcast_queue_readiness",
    stableIds: ["broadcastDispatchAttemptId", "broadcastDispatchPreflightId", "broadcastDraftId", "ownerUserId", "idempotencyKey", "expectedDraftUpdatedAt"],
    safeForAgents: [
      "Inspect the owner-only dispatch attempt receipt contract",
      "Create dry-run dispatch attempt receipts only with an owner session and exact confirmation",
      "Use dispatch preflight evidence, draft revision, expected readiness count, queue producer mode, provider response gate, and idempotency checks before recording a receipt",
      "Confirm responses omit actor email, recipient email, recipient names, suppression hashes, recipient payloads, Cloudflare Queue message bodies, queue payload bodies, personalized bodies, provider responses, and provider message IDs",
    ],
    writeBoundary:
      "This owner-session API records aggregate dispatch attempt receipt metadata only. It does not send email, dispatch Cloudflare Queue messages, create queue payload bodies, create recipient payloads, create provider responses, create provider message IDs, expose recipients, authorize public agent writes, or bypass future sender-domain, suppression, unsubscribe footer, provider-limit, queue-dispatch, and audit requirements.",
  },
  {
    id: "create-audience-unsubscribe-suppression",
    title: "Audience unsubscribe suppression",
    route: "/api/audience/unsubscribe",
    kind: "api",
    auth: "public",
    sourceOfTruth: "D1 table audience_suppression_entries and subscriber status in audience_subscribers",
    stableIds: ["suppressionEntryId", "idempotencyKey"],
    safeForAgents: [
      "Inspect the unsubscribe/suppression confirmation contract",
      "Record a public-safe unsubscribe preference only for the submitted email",
      "Confirm responses do not reveal whether the email was already subscribed",
      "Use idempotency before replaying a preference write",
    ],
    writeBoundary:
      "This public API records hashed unsubscribe/suppression evidence and marks known subscribers unsubscribed without revealing list membership. It does not send email, export subscribers, expose suppression hashes or reasons publicly, or authorize direct agent subscriber management.",
  },
  {
    id: "create-owner-audience-crm-note",
    title: "Owner audience CRM timeline note",
    route: "/api/admin/audience/notes",
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 table audience_timeline_entries",
    stableIds: ["timelineEntryId", "subscriberId", "ownerUserId", "idempotencyKey"],
    safeForAgents: [
      "Inspect the owner-only CRM note confirmation contract",
      "Create a short private timeline note only with an owner session",
      "Confirm public source-data exposes note counts and redaction flags, not note bodies",
      "Use exact confirmation, idempotency, and expected subscriber status before writing",
    ],
    writeBoundary:
      "This owner-session API stores private audience timeline notes after exact confirmation, idempotency, and expected subscriber-status checks. It does not expose note bodies publicly, import contacts, send email, schedule broadcasts, export private data, or authorize unauthenticated/direct public agent writes.",
  },
  {
    id: "create-owner-audience-import-intent",
    title: "Owner audience import intent",
    route: audienceImportIntentApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 table audience_import_intents",
    stableIds: ["audienceImportIntentId", "workspaceId", "ownerUserId", "idempotencyKey"],
    safeForAgents: [
      "Inspect the owner-only audience import intent confirmation contract",
      "Record non-destructive import intent metadata only with an owner session",
      "Use exact confirmation, idempotency, workspace revision/status checks, and aggregate counts before writing",
      "Confirm responses omit raw contact rows, raw emails, actor emails, actor hashes, private notes, CSV bodies, provider payloads, sequence enrollments, and send state",
    ],
    writeBoundary:
      "This owner-session API records redacted import intent metadata in D1 after exact confirmation, idempotency, and workspace stale-state checks. It does not import contacts, create subscribers, store raw emails or contact rows, enroll sequences, send email, expose private notes, or allow unauthenticated/direct public agent subscriber writes.",
  },
  {
    id: "create-owner-audience-import-preflight",
    title: "Owner audience import preflight",
    route: audienceImportPreflightApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 tables audience_import_preflights and audience_import_intents",
    stableIds: ["audienceImportPreflightId", "audienceImportIntentId", "workspaceId", "ownerUserId", "idempotencyKey"],
    safeForAgents: [
      "Inspect the owner-only audience import preflight confirmation contract",
      "Record aggregate import preflight evidence only with an owner session",
      "Use exact confirmation, idempotency, workspace revision/status checks, selected import-intent checks, and aggregate eligibility counts before writing",
      "Confirm responses omit raw contact rows, raw emails, subscriber writes, actor emails, actor hashes, private notes, CSV bodies, provider payloads, exports, sequence enrollments, and send state",
    ],
    writeBoundary:
      "This owner-session API records redacted import preflight evidence in D1 after exact confirmation, idempotency, workspace stale-state checks, selected import-intent source checks, and aggregate count validation. It does not import contacts, create subscribers, store raw emails or contact rows, enroll sequences, export private data, send email, expose private notes, or allow unauthenticated/direct public agent subscriber writes.",
  },
  {
    id: "read-admin-audience-subscribers",
    title: "Admin audience subscribers",
    route: "/admin/audience",
    kind: "doc",
    auth: "owner-session",
    sourceOfTruth:
      "D1 tables audience_subscribers, audience_consent_events, audience_tag_assignments, audience_sequence_enrollments, audience_suppression_entries, audience_timeline_entries, audience_import_intents, and audience_import_preflights",
    stableIds: ["subscriberId", "subscriberSegmentId", "subscriberTagId", "emailSequenceId", "consentRecordId", "suppressionEntryId", "timelineEntryId", "audienceImportIntentId", "audienceImportPreflightId", "ownerUserId"],
    safeForAgents: [
      "Read private subscriber rows only with an owner session",
      "Inspect consent counts, active tags, source form, draft sequence enrollment state, suppression totals, and private timeline notes",
      "Inspect owner-visible import intent and import preflight records without importing contacts",
      "Confirm public source-data redacts email, name, suppression hashes, reasons, private note bodies, actor emails, raw IP, raw user agent, and private metadata",
    ],
    writeBoundary:
      "This owner page can create private CRM notes through the owner note API, record non-destructive import intents through the import intent API, and record aggregate import preflights through the import preflight API; real imports, sends, broadcasts, private exports, CRM automation, and direct agent subscriber writes require future confirmed-write APIs.",
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
      "analyticsExperimentDecisionId",
      "analyticsReportExportId",
      "analyticsReportExportSectionId",
      "analyticsCohortFixtureId",
      "analyticsCohortComparisonId",
      "analyticsCohortReviewId",
      "analyticsCohortReviewStatus",
      "analyticsAlertThresholdId",
      "analyticsAnomalyReviewId",
      "analyticsAnomalyReviewStatus",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsNotificationReadinessStatus",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationInboxStatus",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationDispatchPreflightStatus",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationProviderDomainReadinessStatus",
      "analyticsNotificationProviderDomainReadinessDisposition",
      "analyticsNotificationContentConsentReadinessId",
      "analyticsNotificationContentConsentReadinessStatus",
      "analyticsNotificationContentConsentReadinessDisposition",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationSendPayloadReadinessStatus",
      "analyticsNotificationSendPayloadReadinessDisposition",
      "analyticsNotificationQueueProducerReadinessId",
      "analyticsNotificationQueueProducerReadinessStatus",
      "analyticsNotificationQueueProducerReadinessDisposition",
      "analyticsNotificationQueueConsumerReadinessId",
      "analyticsNotificationQueueConsumerReadinessStatus",
      "analyticsNotificationQueueConsumerReadinessDisposition",
      "analyticsNotificationProviderCallReadinessId",
      "analyticsNotificationProviderCallReadinessStatus",
      "analyticsNotificationProviderCallReadinessDisposition",
      "analyticsNotificationDeliveryAttemptReadinessId",
      "analyticsNotificationDeliveryAttemptReadinessStatus",
      "analyticsNotificationDeliveryAttemptReadinessDisposition",
      "analyticsNotificationDeliveryResultReadinessId",
      "analyticsNotificationDeliveryResultReadinessStatus",
      "analyticsNotificationDeliveryResultReadinessDisposition",
      "analyticsNotificationDeliveryStatusWebhookReadinessId",
      "analyticsNotificationDeliveryStatusWebhookReadinessStatus",
      "analyticsNotificationDeliveryStatusWebhookReadinessDisposition",
      "analyticsNotificationProviderPollingReadinessId",
      "analyticsNotificationProviderPollingReadinessStatus",
      "analyticsNotificationProviderPollingReadinessDisposition",
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
      "Inspect aggregate report export sections without raw analytics downloads",
      "Inspect fixture cohort comparison definitions with sample-size caveats",
      "Inspect owner-reviewed cohort comparison evidence without winner or revenue claims",
      "Inspect owner-reviewed alert threshold and anomaly-review evidence without automated alerts or traffic routing",
      "Inspect owner-reviewed notification delivery readiness without sending alerts or writing inbox rows",
      "Inspect owner-confirmed notification inbox records without recipients, email bodies, queue dispatch, or email sends",
      "Inspect owner-confirmed notification dispatch preflights without recipients, email bodies, provider message IDs, queue payloads, queue dispatch, or email sends",
      "Inspect owner-reviewed notification provider/domain readiness without provider configuration, provider secrets, sender credentials, private DNS credentials, provider sends, or verified-domain claims",
      "Inspect owner-reviewed notification content/consent readiness without body templates, unsubscribe URLs, recipients, email bodies, provider message IDs, queue payloads, provider sends, queue dispatch, or email sends",
      "Inspect owner-reviewed notification send-payload readiness without recipient payloads, personalized bodies, raw payload bodies, queue messages, provider responses, provider sends, queue dispatch, or email sends",
      "Inspect owner-reviewed notification queue-producer readiness without Queue producer execution, queue messages, queue payload bodies, provider responses, provider sends, queue dispatch, or email sends",
      "Inspect owner-reviewed notification queue-consumer readiness without Queue consumer execution, message consumption, message acknowledgement, retry/dead-letter rows, queue payload body reads, provider responses, provider sends, queue dispatch, or email sends",
      "Inspect owner-reviewed notification provider-call readiness without provider sends, provider calls, provider responses, provider configuration, provider secrets, sender credentials, private DNS credentials, Queue consumer execution, queue payload body reads, queue dispatch, or email sends",
      "Inspect owner-reviewed notification delivery-attempt readiness without provider sends, delivery attempts, provider responses, provider configuration, provider secrets, sender credentials, private DNS credentials, queue dispatch, or email sends",
      "Inspect owner-reviewed notification delivery-result readiness without delivery results, delivery receipts, status webhooks, provider polling, provider responses, provider message IDs, provider secrets, sender credentials, private DNS credentials, queue dispatch, or email sends",
      "Inspect owner-reviewed notification delivery-status-webhook readiness without delivery status webhooks, delivery receipts, receipt payloads, status webhook payloads, provider polling, provider responses, provider message IDs, provider secrets, sender credentials, private DNS credentials, queue dispatch, or email sends",
      "Inspect owner-reviewed notification provider-polling readiness without provider polling execution, delivery receipts, receipt payloads, status webhook payloads, provider responses, provider message IDs, provider secrets, sender credentials, private DNS credentials, queue dispatch, or email sends",
      "Inspect dashboard-visible source attribution rows",
      "Inspect fixed time-window metadata and aggregate source/conversion rows",
      "Inspect metric formulas",
      "Inspect seeded event capture boundary",
      "Inspect browser-side page-view beacon boundary",
      "Inspect seeded experiment assignment boundary",
      "Inspect experiment assignment boundaries",
      "Inspect owner-confirmed experiment decision evidence without raw event rows or raw assignment rows",
    ],
    writeBoundary:
      `Seeded analytics events, browser-side seeded funnel page-view beacons with deterministic variant evidence and normalized source attribution, seeded experiment assignments, owner-confirmed notification inbox records from issue #${analyticsNotificationInboxIssue}, owner-confirmed notification dispatch preflights from issue #${analyticsNotificationDispatchPreflightIssue}, owner-reviewed provider/domain readiness records from issue #${analyticsNotificationProviderDomainReadinessIssue}, owner-reviewed content/consent readiness records from issue #${analyticsNotificationContentConsentReadinessIssue}, owner-reviewed send-payload readiness records from issue #${analyticsNotificationSendPayloadReadinessIssue}, owner-reviewed queue-producer readiness records from issue #${analyticsNotificationQueueProducerReadinessIssue}, owner-reviewed queue-consumer readiness records from issue #${analyticsNotificationQueueConsumerReadinessIssue}, owner-reviewed provider-call readiness records from issue #${analyticsNotificationProviderCallReadinessIssue}, owner-reviewed delivery-attempt readiness records from issue #${analyticsNotificationDeliveryAttemptReadinessIssue}, owner-reviewed delivery-result readiness records from issue #${analyticsNotificationDeliveryResultReadinessIssue}, owner-reviewed delivery-status-webhook readiness records from issue #${analyticsNotificationDeliveryStatusWebhookReadinessIssue}, owner-reviewed provider-polling readiness records from issue #${analyticsNotificationProviderPollingReadinessIssue}, and owner-confirmed experiment decision evidence can be captured with idempotency, source-route validation, aggregate count checks, and bot/preview suppression; fixed-window aggregate funnel conversion reports, dashboard-visible aggregate source counts, aggregate variant counts, aggregate report export metadata, owner-reviewed cohort comparison evidence from issue #${analyticsCohortComparisonIssue}, owner-reviewed alert threshold/anomaly-review evidence from issue #${analyticsAlertAnomalyIssue}, owner-reviewed notification delivery readiness evidence from issue #${analyticsNotificationReadinessIssue}, and redacted decision counts can be read from captured test events. Cookie assignment, contact analytics, raw campaign/referrer reporting, raw analytics exports, automated alert sends, owner email sends, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, provider polling, provider configuration, provider secrets, sender credentials, private DNS credentials, queue dispatch, Queue producer execution, Queue consumer execution, queue messages, queue message consumption, queue acknowledgements, retry/dead-letter rows, queue payload body reads, queue payload bodies, recipient payloads, personalized bodies, raw payload bodies, body templates, unsubscribe URLs, customer alerts, custom events, experiment traffic routing, automated winners, and direct public agent decision writes require future confirmed-write APIs.`,
  },
  {
    id: "create-owner-analytics-experiment-decision",
    title: "Owner analytics experiment decision",
    route: analyticsExperimentDecisionApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 table analytics_experiment_decisions plus analytics_events and analytics_experiment_assignments aggregates",
    stableIds: [
      "analyticsExperimentDecisionId",
      "analyticsDashboardId",
      "experimentId",
      "variantId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics experiment decision confirmation contract",
      "Record owner-reviewed experiment decision evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, experiment status checks, aggregate assignment counts, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit raw event rows, raw assignment rows, visitor keys, actor emails, actor hashes, private notes, contact analytics, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted experiment decision evidence in D1 after exact confirmation, idempotency, dashboard revision checks, experiment status checks, aggregate count validation, and sample-size caveat acknowledgement. It does not route traffic, assign cookies, select automated winners, expose raw event rows, expose raw assignment rows, expose contact analytics, make revenue claims, or allow unauthenticated/direct public agent experiment writes. Issue #${analyticsExperimentDecisionIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-inbox-record",
    title: "Owner analytics notification inbox record",
    route: analyticsNotificationInboxApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "D1 table analytics_notification_inbox_records plus analytics source-data readiness evidence",
    stableIds: [
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification inbox confirmation contract",
      "Record owner-reviewed notification inbox evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit recipients, email bodies, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification inbox evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It creates owner-visible inbox records only; it does not send email, dispatch queues, alert customers, expose recipients, expose email bodies, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationInboxIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-dispatch-preflight",
    title: "Owner analytics notification dispatch preflight",
    route: analyticsNotificationDispatchPreflightApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_dispatch_preflight_records plus analytics notification inbox/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification dispatch preflight confirmation contract",
      "Record owner-reviewed dispatch preflight evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, inbox record checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit recipients, email bodies, provider message IDs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification dispatch preflight evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox record checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible dispatch preflight evidence only; it does not send email, call providers, dispatch queues, alert customers, expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationDispatchPreflightIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-provider-domain-readiness",
    title: "Owner analytics notification provider/domain readiness",
    route: analyticsNotificationProviderDomainReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_provider_domain_readiness_records plus analytics notification dispatch-preflight/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification provider/domain readiness confirmation contract",
      "Record owner-reviewed provider/domain readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, dispatch preflight checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit provider secrets, sender credentials, private DNS credentials, recipients, email bodies, provider message IDs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, provider configuration, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification provider/domain readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible provider/domain readiness evidence only; it does not send email, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, dispatch queues, alert customers, expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationProviderDomainReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-content-consent-readiness",
    title: "Owner analytics notification content/consent readiness",
    route: analyticsNotificationContentConsentReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_content_consent_readiness_records plus analytics notification provider-domain/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationContentConsentReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification content/consent readiness confirmation contract",
      "Record owner-reviewed content/consent readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, provider/domain readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit body templates, unsubscribe URLs, recipients, email bodies, provider message IDs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification content/consent readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible body-template, unsubscribe, rate-limit, audit-correlation, and retention readiness evidence only; it does not send email, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, dispatch queues, alert customers, expose recipients, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationContentConsentReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-send-payload-readiness",
    title: "Owner analytics notification send-payload readiness",
    route: analyticsNotificationSendPayloadReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_send_payload_readiness_records plus analytics notification content-consent/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationContentConsentReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification send-payload readiness confirmation contract",
      "Record owner-reviewed send-payload readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, current content/consent readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit recipients, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, provider responses, provider message IDs, queue messages, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification send-payload readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current content/consent readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible payload-shape, unsubscribe-footer, consent/suppression recheck, recipient-scope, audit-correlation, and retention readiness evidence only; it does not send email, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, dispatch queues, create queue messages, alert customers, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationSendPayloadReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-queue-producer-readiness",
    title: "Owner analytics notification queue-producer readiness",
    route: analyticsNotificationQueueProducerReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_queue_producer_readiness_records plus analytics notification send-payload/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationQueueProducerReadinessId",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification queue-producer readiness confirmation contract",
      "Record owner-reviewed queue-producer readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, current send-payload readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit Queue payload bodies, Queue messages, recipients, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, provider responses, provider message IDs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, Queue producer execution, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification queue-producer readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible Queue binding, producer-mode, idempotency-policy, retry/dead-letter-policy, consumer-dependency, backpressure, audit-correlation, and retention readiness evidence only; it does not send email, enable Queue producers, create Queue messages, create Queue payload bodies, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, dispatch queues, alert customers, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationQueueProducerReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-queue-consumer-readiness",
    title: "Owner analytics notification queue-consumer readiness",
    route: analyticsNotificationQueueConsumerReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_queue_consumer_readiness_records plus analytics notification queue-producer/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationQueueConsumerReadinessId",
      "analyticsNotificationQueueProducerReadinessId",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification queue-consumer readiness confirmation contract",
      "Record owner-reviewed queue-consumer readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, current queue-producer readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit Queue payload bodies, Queue messages, consumed messages, acknowledgements, retry/dead-letter rows, recipients, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, provider responses, provider message IDs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, Queue producer execution, Queue consumer execution, provider calls, provider responses, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification queue-consumer readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, current queue-producer readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible Queue binding, consumer-mode, producer-dependency, payload-read-policy, ack-policy, retry/dead-letter-policy, provider-handoff-dependency, idempotency-policy, backpressure, audit-correlation, and retention readiness evidence only; it does not send email, enable Queue producers, enable Queue consumers, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue messages, create Queue payload bodies, call providers, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, dispatch queues, alert customers, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationQueueConsumerReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-provider-call-readiness",
    title: "Owner analytics notification provider-call readiness",
    route: analyticsNotificationProviderCallReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_provider_call_readiness_records plus analytics notification queue-consumer/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationProviderCallReadinessId",
      "analyticsNotificationQueueConsumerReadinessId",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification provider-call readiness confirmation contract",
      "Record owner-reviewed provider-call readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, current queue-consumer readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit provider secrets, sender credentials, private DNS credentials, provider responses, provider message IDs, Queue payload bodies, Queue messages, consumed messages, acknowledgements, retry/dead-letter rows, recipients, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, provider calls, Queue producer execution, Queue consumer execution, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification provider-call readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, current queue-consumer readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible provider-call dependency readiness only; it does not send email, enable provider sends or calls, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, enable Queue producers, enable Queue consumers, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue messages, create Queue payload bodies, dispatch queues, alert customers, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationProviderCallReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-delivery-attempt-readiness",
    title: "Owner analytics notification delivery-attempt readiness",
    route: analyticsNotificationDeliveryAttemptReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_delivery_attempt_readiness_records plus analytics notification provider-call/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationDeliveryAttemptReadinessId",
      "analyticsNotificationProviderCallReadinessId",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification delivery-attempt readiness confirmation contract",
      "Record owner-reviewed delivery-attempt readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, current provider-call readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit provider secrets, sender credentials, private DNS credentials, provider responses, provider message IDs, Queue payload bodies, Queue messages, consumed messages, acknowledgements, retry/dead-letter rows, recipients, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, provider calls, delivery attempts, Queue producer execution, Queue consumer execution, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification delivery-attempt readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, current provider-call readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible delivery-attempt dependency readiness only; it does not send email, enable provider sends or calls, attempt delivery, configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, enable Queue producers, enable Queue consumers, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue messages, create Queue payload bodies, dispatch queues, alert customers, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationDeliveryAttemptReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-delivery-result-readiness",
    title: "Owner analytics notification delivery-result readiness",
    route: analyticsNotificationDeliveryResultReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_delivery_result_readiness_records plus analytics notification delivery-attempt/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationDeliveryResultReadinessId",
      "analyticsNotificationDeliveryAttemptReadinessId",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification delivery-result readiness confirmation contract",
      "Record owner-reviewed delivery-result readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, current delivery-attempt readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit provider secrets, sender credentials, private DNS credentials, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, provider polling results, Queue payload bodies, Queue messages, consumed messages, acknowledgements, retry/dead-letter rows, recipients, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, provider calls, delivery attempts, delivery results, Queue producer execution, Queue consumer execution, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification delivery-result readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, current delivery-attempt readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible delivery-result boundary readiness only; it does not send email, enable provider sends or calls, attempt delivery, create delivery results, create delivery receipts, expose receipt payloads, process status webhooks, poll providers, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, enable Queue producers, enable Queue consumers, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue messages, create Queue payload bodies, dispatch queues, alert customers, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationDeliveryResultReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-delivery-status-webhook-readiness",
    title: "Owner analytics notification delivery-status webhook readiness",
    route: analyticsNotificationDeliveryStatusWebhookReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_delivery_status_webhook_readiness_records plus analytics notification delivery-result/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationDeliveryStatusWebhookReadinessId",
      "analyticsNotificationDeliveryResultReadinessId",
      "analyticsNotificationDeliveryAttemptReadinessId",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification delivery-status webhook readiness confirmation contract",
      "Record owner-reviewed delivery-status webhook readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, current delivery-result readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit provider secrets, sender credentials, private DNS credentials, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, status webhook payloads, provider polling results, Queue payload bodies, Queue messages, consumed messages, acknowledgements, retry/dead-letter rows, recipients, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, Queue producer execution, Queue consumer execution, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification delivery-status webhook readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, current delivery-result readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible delivery-status webhook boundary readiness only; it does not send email, enable provider sends or calls, attempt delivery, create delivery results, create delivery receipts, expose receipt payloads, process status webhooks, poll providers, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, enable Queue producers, enable Queue consumers, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue messages, create Queue payload bodies, dispatch queues, alert customers, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationDeliveryStatusWebhookReadinessIssue} tracks this slice.`,
  },
  {
    id: "create-owner-analytics-notification-provider-polling-readiness",
    title: "Owner analytics notification provider-polling readiness",
    route: analyticsNotificationProviderPollingReadinessApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth:
      "D1 table analytics_notification_provider_polling_readiness_records plus analytics notification delivery-status-webhook/readiness source-data evidence",
    stableIds: [
      "analyticsNotificationProviderPollingReadinessId",
      "analyticsNotificationDeliveryStatusWebhookReadinessId",
      "analyticsNotificationSendPayloadReadinessId",
      "analyticsNotificationProviderDomainReadinessId",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsDashboardId",
      "analyticsTimeWindow",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only analytics notification provider-polling readiness confirmation contract",
      "Record owner-reviewed provider-polling readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, dashboard revision checks, notification readiness checks, current delivery-status-webhook readiness checks, fixed-window sample-size checks, and sample-size caveat acknowledgement before writing",
      "Confirm responses omit provider secrets, sender credentials, private DNS credentials, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, status webhook payloads, provider polling results, Queue payload bodies, Queue messages, consumed messages, acknowledgements, retry/dead-letter rows, recipients, recipient payloads, personalized bodies, raw payload bodies, email bodies, body templates, unsubscribe URLs, queue payloads, raw analytics rows, actor emails, actor hashes, private notes, customer alerts, email sends, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, provider polling execution, Queue producer execution, Queue consumer execution, queue dispatch, traffic routing, automated winners, and revenue claims",
    ],
    writeBoundary:
      `This owner-session API records redacted notification provider-polling readiness evidence in D1 after exact confirmation, idempotency, dashboard revision checks, notification readiness checks, notification inbox checks, notification dispatch preflight checks, provider/domain readiness checks, current send-payload readiness checks, current delivery-status-webhook readiness checks, fixed-window evidence validation, and sample-size caveat acknowledgement. It records owner-visible provider-polling boundary readiness only; it does not send email, enable provider sends or calls, attempt delivery, create delivery results, create delivery receipts, expose receipt payloads, process status webhooks, poll providers, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, enable Queue producers, enable Queue consumers, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue messages, create Queue payload bodies, dispatch queues, alert customers, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose queue payloads, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or allow unauthenticated/direct public agent writes. Issue #${analyticsNotificationProviderPollingReadinessIssue} tracks this slice.`,
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
      "affiliatePartnerReportId",
      "payoutPreparationId",
      "payoutPreparationRecordId",
      "payoutPreparationRecordStatus",
      "fraudReviewRecordId",
      "fraudReviewRecordStatus",
      "partnerNotificationReadinessRecordId",
      "partnerNotificationReadinessRecordStatus",
      "partnerNotificationSendPreflightRecordId",
      "partnerNotificationSendPreflightRecordStatus",
      "partnerNotificationProviderReadinessRecordId",
      "partnerNotificationProviderReadinessRecordStatus",
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
      "Inspect public-safe partner performance reports",
      "Inspect read-only payout preparation checklists",
      "Inspect owner-confirmed payout preparation records without payout accounts, tax data, Stripe payout IDs, partner notification bodies, buyer data, raw ledger rows, or raw actor fields",
      "Inspect owner-reviewed fraud review records without private fraud signals, buyer data, raw ledger/click/checkout rows, actor identity, payout accounts, tax data, Stripe payout IDs, or partner notification bodies",
      "Inspect owner-reviewed partner notification readiness records without recipient emails, message bodies, provider message IDs, queue rows, buyer data, raw rows, private fraud signals, payout accounts, tax data, Stripe IDs, or partner sends",
      "Inspect owner-reviewed partner notification send preflight records without recipient emails, message bodies, send payloads, provider message IDs, queue rows, buyer data, raw rows, private fraud signals, payout accounts, tax data, Stripe IDs, provider-send enablement, or partner sends",
      "Inspect owner-reviewed notification provider readiness records without provider configuration, provider secrets, sender credentials, recipient emails, message bodies, send payloads, provider message IDs, queue rows, buyer data, raw rows, private fraud signals, payout accounts, tax data, Stripe IDs, provider-send enablement, or partner sends",
      "Inspect commission and payout review boundaries",
    ],
    writeBoundary:
      "Seeded referral clicks can be captured with idempotency and destination-route validation, eligible clicks can be attached to sandbox checkout intents as evidence, trusted checkout attribution can create review-only commission ledger evidence, owner sessions can review, hold, or reverse that evidence, public-safe partner reports can be read, read-only payout preparation can be inspected, and owner sessions can record payout preparation, fraud review, partner notification readiness, partner notification send preflight, and notification provider readiness evidence; cookie assignment, buyer attribution finalization, payable commission writes, direct agent review writes, fraud enforcement, payout actions, tax collection, private partner portals, partner notification sends, provider-send enablement, provider configuration, provider secret storage, provider calls, send payload creation, and queue dispatch require future confirmed-write APIs.",
  },
  {
    id: "create-owner-affiliate-payout-preparation-record",
    title: "Owner affiliate payout preparation record API",
    route: affiliatePayoutPreparationRecordApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "src/lib/affiliate-payout-preparation-records.ts",
    stableIds: [
      "payoutPreparationRecordId",
      "affiliateProgramId",
      "payoutPreparationId",
      "payoutBatchId",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only affiliate payout preparation confirmation contract",
      "Record owner-reviewed payout preparation evidence only with an owner session",
      "Use exact confirmation, idempotency, program revision checks, payout batch status checks, and payout evidence checks before writing",
      "Confirm responses omit payout accounts, tax data, Stripe IDs, partner notification bodies, buyer data, raw ledger rows, actor emails, actor hashes, private notes, and private fraud signals",
    ],
    writeBoundary:
      `This owner-session API records redacted affiliate payout preparation evidence in D1 after exact confirmation, idempotency, program revision checks, payout batch status checks, and payout evidence validation. It creates owner-visible preparation records only; it does not create payable commission state, Stripe payouts or transfers, payout accounts, tax records, partner notifications, fraud decisions, buyer data, raw ledger rows, or direct public agent payout writes. Issue #${affiliatePayoutPreparationRecordIssue} tracks this slice.`,
  },
  {
    id: "create-owner-affiliate-fraud-review-record",
    title: "Owner affiliate fraud review record API",
    route: affiliateFraudReviewRecordApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "src/lib/affiliate-fraud-review-records.ts",
    stableIds: [
      "fraudReviewRecordId",
      "affiliateProgramId",
      "reviewFlagId",
      "payoutPreparationId",
      "payoutBatchId",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only affiliate fraud review confirmation contract",
      "Record owner-reviewed fraud review evidence only with an owner session",
      "Use exact confirmation, idempotency, program revision checks, payout batch status checks, review-flag checks, and linked-ledger count checks before writing",
      "Confirm responses omit private fraud signals, buyer data, raw ledger rows, raw click rows, raw checkout rows, actor emails, actor hashes, private notes, payout accounts, tax data, Stripe IDs, and partner notification bodies",
    ],
    writeBoundary:
      `This owner-session API records redacted affiliate fraud review evidence in D1 after exact confirmation, idempotency, program revision checks, payout batch status checks, review-flag checks, and linked-ledger evidence validation. It creates owner-visible fraud review records only; it does not enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or allow direct public agent affiliate writes. Issue #${affiliateFraudReviewRecordIssue} tracks this slice.`,
  },
  {
    id: "create-owner-affiliate-partner-notification-readiness-record",
    title: "Owner affiliate partner notification readiness record API",
    route: affiliatePartnerNotificationReadinessRecordApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "src/lib/affiliate-partner-notification-readiness-records.ts",
    stableIds: [
      "partnerNotificationReadinessRecordId",
      "affiliateProgramId",
      "affiliatePartnerReportId",
      "affiliatePartnerId",
      "payoutPreparationId",
      "payoutBatchId",
      "reviewFlagId",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only affiliate partner notification readiness confirmation contract",
      "Record owner-reviewed notification readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, review-flag checks, and linked-ledger count checks before writing",
      "Confirm responses omit recipient emails, message bodies, provider message IDs, queue rows, private fraud signals, buyer data, raw ledger rows, raw click rows, raw checkout rows, actor emails, actor hashes, private notes, payout accounts, tax data, and Stripe IDs",
    ],
    writeBoundary:
      `This owner-session API records redacted affiliate partner notification readiness evidence in D1 after exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, review-flag checks, and linked-ledger evidence validation. It creates owner-visible readiness records only; it does not send partner notifications, call providers, create queue rows, expose recipient emails or message bodies, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or allow direct public agent affiliate writes. Issue #${affiliatePartnerNotificationReadinessRecordIssue} tracks this slice.`,
  },
  {
    id: "create-owner-affiliate-partner-notification-send-preflight-record",
    title: "Owner affiliate partner notification send preflight record API",
    route: affiliatePartnerNotificationSendPreflightRecordApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "src/lib/affiliate-partner-notification-send-preflight-records.ts",
    stableIds: [
      "partnerNotificationSendPreflightRecordId",
      "partnerNotificationReadinessRecordStatus",
      "affiliateProgramId",
      "affiliatePartnerReportId",
      "affiliatePartnerId",
      "payoutPreparationId",
      "payoutBatchId",
      "reviewFlagId",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only affiliate partner notification send preflight confirmation contract",
      "Record owner-reviewed notification send preflight evidence only with an owner session",
      "Use exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, notification readiness record status checks, review-flag checks, and linked-ledger count checks before writing",
      "Confirm responses omit recipient emails, message bodies, send payloads, provider message IDs, queue rows, private fraud signals, buyer data, raw ledger rows, raw click rows, raw checkout rows, actor emails, actor hashes, private notes, payout accounts, tax data, and Stripe IDs",
    ],
    writeBoundary:
      `This owner-session API records redacted affiliate partner notification send preflight evidence in D1 after exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, notification readiness record status checks, review-flag checks, linked-ledger evidence validation, and provider-send-disabled checks. It creates owner-visible send preflight records only; it does not send partner notifications, enable provider sends, call providers, create send payloads, create queue rows, expose recipient emails or message bodies, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or allow direct public agent affiliate writes. Issue #${affiliatePartnerNotificationSendPreflightRecordIssue} tracks this slice.`,
  },
  {
    id: "create-owner-affiliate-partner-notification-provider-readiness-record",
    title: "Owner affiliate partner notification provider readiness record API",
    route: affiliatePartnerNotificationProviderReadinessRecordApiRoute,
    kind: "api",
    auth: "owner-session",
    sourceOfTruth: "src/lib/affiliate-partner-notification-provider-readiness-records.ts",
    stableIds: [
      "partnerNotificationProviderReadinessRecordId",
      "partnerNotificationSendPreflightRecordStatus",
      "affiliateProgramId",
      "affiliatePartnerReportId",
      "affiliatePartnerId",
      "payoutPreparationId",
      "payoutBatchId",
      "reviewFlagId",
      "ownerUserId",
      "idempotencyKey",
    ],
    safeForAgents: [
      "Inspect the owner-only affiliate partner notification provider readiness confirmation contract",
      "Record owner-reviewed notification provider readiness evidence only with an owner session",
      "Use exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, notification readiness record status checks, send preflight record status checks, review-flag checks, and linked-ledger count checks before writing",
      "Confirm responses omit provider configuration, provider secrets, sender credentials, recipient emails, message bodies, send payloads, provider message IDs, queue rows, private fraud signals, buyer data, raw ledger rows, raw click rows, raw checkout rows, actor emails, actor hashes, private notes, payout accounts, tax data, and Stripe IDs",
    ],
    writeBoundary:
      `This owner-session API records redacted affiliate partner notification provider readiness evidence in D1 after exact confirmation, idempotency, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, notification readiness record status checks, send preflight record status checks, review-flag checks, linked-ledger evidence validation, provider-configuration-disabled checks, provider-secret-redaction checks, sender-credential-redaction checks, and provider-send-disabled checks. It creates owner-visible provider readiness records only; it does not configure notification providers, store provider secrets, store sender credentials, send partner notifications, enable provider sends, call providers, create send payloads, create queue rows, expose recipient emails or message bodies, expose provider message IDs, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or allow direct public agent affiliate writes. Issue #${affiliatePartnerNotificationProviderReadinessRecordIssue} tracks this slice.`,
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
    id: "evidence-publisher-account-setup",
    route: "/account/source-data",
    resolves:
      "Paid publisher tenant setup, Bumpgrade subdomain reservation rules, custom-domain DNS onboarding, D1 table boundaries, cross-subdomain auth configuration, and the no-domain-purchase launch policy.",
    stableIds: [
      "publisherTenantId",
      "publisherSubdomainReservationId",
      "publisherCustomDomainId",
      "publisherPlanEntitlementId",
      "issue",
    ],
    volatileClaims:
      `Default Bumpgrade subdomain reservation and existing-domain DNS onboarding are live for paid or launch-pilot accounts; Bumpgrade-hosted subdomains share the central identity session, custom domains use a Bumpgrade login handoff, and Bumpgrade does not sell or register domains today.`,
  },
  {
    id: "evidence-funnels",
    route: "/funnels/source-data",
    resolves:
      "Seeded funnel, ordered steps, page blocks, reusable funnel templates including webinar/resource page shapes, block-template library records, owner-session template-to-draft capability, owner-session checkout-link capability, public funnel checkout-start capability, revision ID, preview route, source-data route, published D1 funnel summaries, owner-gated draft capability, D1 table names, and confirmed-write boundary.",
    stableIds: [
      "funnelId",
      "funnelStepId",
      "funnelBlockId",
      "funnelTemplateId",
      "funnelBlockTemplateId",
      "funnelCheckoutLinkId",
      "funnelWebinarResourceTemplateId",
      "funnelRevisionId",
      "funnelDraftId",
      "funnelAuditEventId",
      "checkoutIntentId",
      "checkoutOfferStackId",
      "offerId",
    ],
    volatileClaims:
      "The public funnel contract exposes template and block-template records, webinar/resource page-shape records, owner-gated template-create, checkout-link, editable draft, publish capability metadata, and public sandbox checkout-start rendering metadata; it does not expose unpublished private draft copy, direct agent template creation, direct agent checkout linking, live billing, live webinar scheduling, private resource delivery, unpublishing, or unconfirmed agent edits.",
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
      "Seeded product catalog, assets, access rules, entitlement templates, sandbox webhook grant mappings, aggregate owner-entitlement inspection counts, customer-safe lookup contract, private R2-backed fixture delivery contract, owner-confirmed private asset upload intent contract, owner-confirmed non-destructive revocation intent contract, protected content readiness, checkout-intent-scoped protected fixture delivery, redaction flags, preview route, revision ID, and confirmed-write boundary.",
    stableIds: [
      "productId",
      "assetId",
      "accessRuleId",
      "entitlementTemplateId",
      "productEntitlementInspectionId",
      "customerProductEntitlementLookupId",
      "productDownloadTokenId",
      "productAssetUploadIntentId",
      "productEntitlementRevocationIntentId",
      "productProtectedContentId",
      "productProtectedContentDeliveryId",
      "fulfillmentId",
    ],
    volatileClaims:
      "The product/access contract includes sandbox webhook-backed entitlement row grants, owner-only entitlement inspection, customer-safe checkout intent lookup, short-lived tokens that stream a seeded private R2 fixture, owner-confirmed private asset upload records, owner-confirmed non-destructive revocation intent records, protected content readiness, and checkout-intent-scoped seeded protected fixture delivery; it is not signed object URL access, customer delivery of arbitrary uploads, destructive revocation, subscription access mutation, or live fulfillment automation.",
  },
  {
    id: "evidence-audience-automation",
    route: "/audience/source-data",
    resolves:
      "Seeded audience automation workspace, opt-in form, consent-backed capture API, aggregate subscriber inspection counts, redaction flags, tags, segments, lead magnet, sequence, broadcast draft, broadcast readiness, dry-run schedule intent counts, broadcast preview safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed import intent evidence, owner-confirmed import preflight evidence, and confirmed-write boundary.",
    stableIds: [
      "subscriberSegmentId",
      "subscriberId",
      "subscriberInspectionId",
      "optInFormId",
      "leadMagnetId",
      "emailSequenceId",
      "automationRuleId",
      "broadcastReadinessId",
      "broadcastScheduleIntentId",
      "broadcastPreviewSafetyId",
      "broadcastQueueReadinessId",
      "broadcastDeliveryBatchId",
      "broadcastDeliveryQueueMessageId",
      "broadcastDispatchPreflightId",
      "broadcastDispatchAttemptId",
      "broadcastSenderDomainReadinessId",
      "broadcastProviderEventReadinessId",
      "broadcastProviderRateLimitReadinessId",
      "broadcastProviderResponseReadinessId",
      "broadcastSendPayloadReadinessId",
      "broadcastQueueProducerReadinessId",
      "broadcastQueueConsumerReadinessId",
      "audienceImportIntentId",
      "audienceImportPreflightId",
    ],
    volatileClaims:
      "The audience automation contract includes consent-backed opt-in capture, aggregate owner-inspection evidence, unsubscribe/suppression evidence, private owner-note counts, broadcast readiness, dry-run schedule intent counts, preview/footer safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, sender-domain readiness, provider-event readiness, provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness, Queue consumer readiness, owner-confirmed import intents, and owner-confirmed import preflights; it is not contact import, raw import row storage, raw email storage, subscriber creation from imports, live email sending, private export, private DNS/provider setup, provider webhook processing, Cloudflare Queue dispatch, Queue producer execution, Queue consumer execution, queue payload body creation or reading, ack/retry/dead-letter row creation, recipient payload creation, raw payload body storage, provider response creation, provider message creation, personalized body generation, or direct public agent subscriber write capability.",
  },
  {
    id: "evidence-analytics-experiments",
    route: "/analytics/source-data",
    resolves:
      "Seeded analytics event taxonomy, event capture API, browser-side page-view beacon boundary, dashboard-visible aggregate source attribution rows, fixed time-window metadata, aggregate event counts, aggregate variant event counts, aggregate source attribution counts, assignment API, aggregate assignment counts, aggregate funnel conversion reports, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflight evidence, owner-reviewed provider/domain readiness evidence, metric formulas, experiment variants, assignment rule, owner-confirmed experiment decision evidence, and confirmed-write boundary.",
    stableIds: [
      "analyticsEventId",
      "analyticsEventIngestionId",
      "analyticsPageViewBeaconId",
      "analyticsEventVariantAggregateId",
      "analyticsEventSourceAggregateId",
      "experimentAssignmentId",
      "analyticsExperimentDecisionId",
      "analyticsReportExportId",
      "analyticsReportExportSectionId",
      "analyticsCohortFixtureId",
      "analyticsCohortComparisonId",
      "analyticsCohortReviewId",
      "analyticsCohortReviewStatus",
      "analyticsAlertThresholdId",
      "analyticsAnomalyReviewId",
      "analyticsAnomalyReviewStatus",
      "analyticsNotificationReadinessId",
      "analyticsNotificationChannelId",
      "analyticsNotificationReadinessStatus",
      "analyticsNotificationInboxRecordId",
      "analyticsNotificationInboxStatus",
      "analyticsNotificationDispatchPreflightId",
      "analyticsNotificationDispatchPreflightStatus",
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
      "The analytics contract includes seeded event capture, browser-side page-view beacons with deterministic variant evidence and normalized source attribution, seeded assignment, dashboard-visible aggregate source rows, fixed-window aggregate counts, aggregate source counts, aggregate variant counts, aggregate conversion report rows, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflight evidence, owner-reviewed provider/domain readiness evidence, and owner-confirmed experiment decision evidence; it is not cookie assignment, automated alert sends, owner email sends, provider sends, provider configuration, provider secrets, private DNS credentials, queue dispatch, customer alerts, traffic routing, contact-level analytics, raw event or assignment exposure, raw referrer/query exposure, raw analytics exports, automated winners, revenue claims, or statistically meaningful proof.",
  },
  {
    id: "evidence-affiliate-referrals",
    route: "/affiliates/source-data",
    resolves:
      "Seeded affiliate program, partner records, referral links, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, owner-reviewed notification provider readiness records, referral click capture API, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal actions, aggregate counts, attribution rules, commission rules, ledger fixtures, payout batch, review flags, and confirmed-write boundary.",
    stableIds: [
      "affiliateProgramId",
      "affiliatePartnerId",
      "affiliatePartnerReportId",
      "payoutPreparationId",
      "payoutPreparationRecordId",
      "payoutPreparationRecordStatus",
      "fraudReviewRecordId",
      "fraudReviewRecordStatus",
      "partnerNotificationReadinessRecordId",
      "partnerNotificationReadinessRecordStatus",
      "partnerNotificationSendPreflightRecordId",
      "partnerNotificationSendPreflightRecordStatus",
      "partnerNotificationProviderReadinessRecordId",
      "partnerNotificationProviderReadinessRecordStatus",
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
      "The affiliate/referral contract includes seeded click capture, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal action boundaries, aggregate counts, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, and owner-reviewed notification provider readiness records; it is not cookie assignment, buyer attribution finalization, payable commission state, fraud enforcement, private fraud signal exposure, tax collection, partner notification sends, provider-send enablement, provider configuration, provider secret storage, provider calls, send payload creation, queue dispatch, private partner portal access, direct agent review automation, or Stripe payout capability.",
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
    purpose: "Expose seeded funnel, published D1 funnels, ordered steps, blocks, reusable templates including webinar/resource page shapes, block templates, owner-gated draft duplication capability, checkout-link capability, public funnel checkout-start capability, revision IDs, owner-gated draft capability, and write-safety boundaries.",
    safetyBoundary:
      "Public resource stays read-only; published linked checkout blocks can render the sandbox checkout start surface, and owner-session draft create/seed/template-create/duplicate/update/reorder/checkout-link, webinar/resource template-to-draft, private preview, and exact-confirmed publish exist in admin UI. Direct agent template creation, block editing, direct agent checkout-link, direct agent duplication, live billing, live webinar scheduling, private resource delivery, unpublish/delete, and direct agent-edit tools require confirmed-write contracts.",
  },
  {
    id: "mcp-tool-duplicate-funnel-draft",
    resourceOrTool: "tool duplicate_funnel_draft",
    status: "planned",
    backedBy: "/admin/funnels and /api/admin/funnels/drafts",
    purpose: "Duplicate a private draft funnel for an authenticated owner using the same D1 tables and audit model.",
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, current draft revision, audit event, and redaction. Checkout-link metadata must not be copied by default, and the duplicate must remain private until separately published.",
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
      "Expose seeded products, assets, access rules, entitlement templates, revision IDs, aggregate owner-entitlement inspection counts, customer-safe checkout intent lookup, short-lived private R2-backed download-token boundaries with redemption revalidation, owner-confirmed private asset upload-intent boundaries, owner-confirmed non-destructive revocation intent boundaries, protected content readiness, and fulfillment boundaries.",
    safetyBoundary:
      "Read-mostly for public agents; customer lookup requires a checkout intent reference and redacts buyer/provider/private asset data. Token delivery streams only the seeded fixture through Bumpgrade. Owner-upload intents require owner auth, exact confirmation, idempotency, catalog revision checks, and redaction. Owner revocation intents require owner auth, exact confirmation, idempotency, current entitlement status checks, and redaction, but still do not mutate entitlement state. Protected-content records remain constrained to checkout-scoped fixture delivery; customer delivery of arbitrary uploads, real protected body delivery, subscription access changes, destructive revocation, and fulfillment actions remain unavailable.",
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
    id: "mcp-tool-create-product-revocation-intent",
    resourceOrTool: "tool create_product_revocation_intent",
    status: "planned",
    backedBy: "/api/admin/products/revocation-intents",
    purpose:
      "Record a non-destructive product access-removal intent for an authenticated owner on top of the same D1 contract.",
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, current entitlement status check, audit metadata, and redacted output. It must not mutate entitlement status, issue refunds, change subscriptions, notify customers, expose private reason text, or enable direct public agent revocation writes.",
  },
  {
    id: "mcp-resource-audience-automation",
    resourceOrTool: "resource bumpgrade://audience-automation",
    status: "ready-contract",
    backedBy: "/audience/source-data",
    purpose: "Expose seeded opt-in forms, lead magnets, tags, segments, sequences, broadcasts, automation rules, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, broadcast readiness counts, dry-run schedule intent counts, preview/footer safety records, queue readiness records, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed import intent evidence, owner-confirmed import preflight evidence, redaction flags, consent boundaries, unsubscribe boundaries, owner-note boundaries, and owner schedule/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/import-intent/import-preflight boundaries.",
    safetyBoundary:
      "Seeded public opt-in capture, public-safe unsubscribe/suppression evidence, owner-gated subscriber inspection, owner-only CRM notes, read-only broadcast readiness, preview/footer safety, queue readiness, sender-domain readiness, provider-event readiness, provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness, Queue consumer readiness, owner-confirmed dry-run schedule intents, owner-confirmed delivery-batch dry runs, owner-confirmed queue-message dry runs, owner-confirmed dispatch preflight dry runs, owner-confirmed dispatch attempt receipts, owner-confirmed import intents, and owner-confirmed import preflights are live; real imports, raw contact row storage, subscriber creation from imports, real sends, private DNS/provider setup, provider webhooks, Cloudflare Queue dispatch, Queue producer execution, Queue consumer execution, queue payload bodies, recipient payloads, personalized bodies, provider responses, private exports, CRM automation, and direct public agent subscriber writes require confirmed-write contracts.",
  },
  {
    id: "mcp-tool-create-audience-import-intent",
    resourceOrTool: "tool create_audience_import_intent",
    status: "planned",
    backedBy: audienceImportIntentApiRoute,
    purpose:
      `Record a non-destructive audience import intent for an authenticated owner on top of the same D1 contract from issue #${audienceImportIntentIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, workspace revision/status checks, aggregate counts, audit metadata, and redacted output. It must not import contacts, store raw emails or contact rows, create sequence enrollments, send email, expose private notes, or enable direct public agent subscriber writes.",
  },
  {
    id: "mcp-tool-create-audience-import-preflight",
    resourceOrTool: "tool create_audience_import_preflight",
    status: "planned",
    backedBy: audienceImportPreflightApiRoute,
    purpose:
      `Record aggregate audience import preflight evidence for an authenticated owner on top of the same D1 contract from issue #${audienceImportPreflightIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, workspace revision/status checks, selected import-intent source checks, aggregate count validation, audit metadata, and redacted output. It must not import contacts, create subscribers, store raw emails or contact rows, export private data, create sequence enrollments, send email, expose private notes, or enable direct public agent subscriber writes.",
  },
  {
    id: "mcp-resource-analytics-experiments",
    resourceOrTool: "resource bumpgrade://analytics-experiments",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose:
      "Expose seeded event taxonomy, browser-side page-view beacon boundaries, dashboard-visible aggregate source attribution rows, fixed time-window metadata, aggregate event counts, aggregate source attribution counts, aggregate variant event counts, aggregate assignment counts, aggregate conversion report rows, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflight evidence, owner-reviewed notification delivery-status webhook readiness evidence, owner-reviewed notification provider-polling readiness evidence, owner-confirmed experiment decision evidence, metric formulas, experiment variants, assignment rules, and sample-size caveats.",
    safetyBoundary:
      "Seeded event capture, browser-side page-view beacons with deterministic variant evidence and normalized source attribution, deterministic assignment, dashboard-visible fixed-window aggregate source rows, aggregate conversion reporting, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflight evidence, staged notification readiness through provider-polling evidence, and owner-confirmed decision evidence are live; cookie assignment, raw visitor tracking, raw referrer/query reporting, raw analytics exports, contact analytics, automated alert sends, owner email sends, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, status webhooks, provider polling, queue dispatch, customer alerts, experiment traffic routing, custom events, automated winners, and public decision writes require confirmed-write contracts.",
  },
  {
    id: "mcp-resource-analytics-report-exports",
    resourceOrTool: "resource bumpgrade://analytics-report-exports",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose:
      `Expose aggregate analytics report export metadata, fixture cohort comparison definitions, and owner-reviewed cohort comparison evidence from issues #${analyticsReportExportIssue} and #${analyticsCohortComparisonIssue}.`,
    safetyBoundary:
      "This resource reads aggregate report sections, selected fixed windows, sample-size caveats, and redaction flags only. It must not expose raw analytics event rows, raw experiment assignment rows, visitor keys, contact analytics, raw referrer URLs, raw query strings, private notes, traffic routing, automated winners, or revenue claims.",
  },
  {
    id: "mcp-resource-analytics-alert-reviews",
    resourceOrTool: "resource bumpgrade://analytics-alert-reviews",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed alert threshold and anomaly-review evidence from issue #${analyticsAlertAnomalyIssue}.`,
    safetyBoundary:
      "This resource reads aggregate threshold review prompts, selected fixed windows, sample-size caveats, owner review state, and redaction flags only. It must not expose raw analytics rows, visitor keys, contact analytics, raw referrer URLs, raw query strings, private notes, customer alerts, traffic routing, automated winners, or revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification delivery readiness evidence from issue #${analyticsNotificationReadinessIssue}.`,
    safetyBoundary:
      "This resource reads future owner-notification readiness, channel metadata, dependency IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not send alerts, write inbox rows, expose recipients, expose email bodies, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-inbox-records",
    resourceOrTool: "resource bumpgrade://analytics-notification-inbox-records",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-confirmed analytics notification inbox record evidence from issue #${analyticsNotificationInboxIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification inbox record counts, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not expose recipients, expose email bodies, dispatch queues, send email, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-dispatch-preflights",
    resourceOrTool: "resource bumpgrade://analytics-notification-dispatch-preflights",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-confirmed analytics notification dispatch preflight evidence from issue #${analyticsNotificationDispatchPreflightIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification dispatch preflight counts, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, dispatch queues, send email, call providers, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-provider-domain-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-provider-domain-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification provider/domain readiness evidence from issue #${analyticsNotificationProviderDomainReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification provider/domain readiness counts, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not configure providers, store provider secrets, store sender credentials, expose private DNS credentials, verify sender domains, expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, dispatch queues, send email, call providers, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-content-consent-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-content-consent-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification content/consent readiness evidence from issue #${analyticsNotificationContentConsentReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification content/consent readiness counts, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not expose body templates, expose unsubscribe URLs, expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, dispatch queues, send email, call providers, configure providers, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-send-payload-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-send-payload-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification send-payload readiness evidence from issue #${analyticsNotificationSendPayloadReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification send-payload readiness counts, content/consent readiness IDs, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, create queue messages, expose queue payloads, dispatch queues, send email, call providers, configure providers, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-queue-producer-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-queue-producer-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification queue-producer readiness evidence from issue #${analyticsNotificationQueueProducerReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification queue-producer readiness counts, send-payload readiness IDs, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not enable Queue producers, create Queue messages, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, dispatch queues, send email, call providers, configure providers, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-queue-consumer-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-queue-consumer-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification queue-consumer readiness evidence from issue #${analyticsNotificationQueueConsumerReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification queue-consumer readiness counts, queue-producer readiness IDs, send-payload readiness IDs, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, dispatch queues, send email, call providers, configure providers, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-provider-call-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-provider-call-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification provider-call readiness evidence from issue #${analyticsNotificationProviderCallReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification provider-call readiness counts, queue-consumer readiness IDs, send-payload readiness IDs, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not enable provider sends or calls, configure providers, create provider responses, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider message IDs, dispatch queues, send email, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-delivery-attempt-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-delivery-attempt-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification delivery-attempt readiness evidence from issue #${analyticsNotificationDeliveryAttemptReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification delivery-attempt readiness counts, provider-call readiness IDs, send-payload readiness IDs, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not enable provider sends or calls, attempt delivery, configure providers, create provider responses, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider message IDs, dispatch queues, send email, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-delivery-result-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-delivery-result-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification delivery-result readiness evidence from issue #${analyticsNotificationDeliveryResultReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification delivery-result readiness counts, delivery-attempt readiness IDs, send-payload readiness IDs, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not enable provider sends or calls, attempt delivery, create delivery results, create delivery receipts, expose receipt payloads, process status webhooks, poll providers, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, dispatch queues, send email, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-delivery-status-webhook-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-delivery-status-webhook-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification delivery-status webhook readiness evidence from issue #${analyticsNotificationDeliveryStatusWebhookReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification delivery-status webhook readiness counts, delivery-result readiness IDs, delivery-attempt readiness IDs, send-payload readiness IDs, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not enable provider sends or calls, attempt delivery, create delivery results, process delivery-status webhooks, create delivery receipts, expose receipt payloads, process status webhooks, poll providers, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, dispatch queues, send email, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-resource-analytics-notification-provider-polling-readiness",
    resourceOrTool: "resource bumpgrade://analytics-notification-provider-polling-readiness",
    status: "ready-contract",
    backedBy: "/analytics/source-data",
    purpose: `Expose owner-reviewed analytics notification provider-polling readiness evidence from issue #${analyticsNotificationProviderPollingReadinessIssue}.`,
    safetyBoundary:
      "This resource reads aggregate owner-notification provider-polling readiness counts, delivery-status-webhook readiness IDs, send-payload readiness IDs, provider/domain readiness IDs, dispatch preflight IDs, inbox record IDs, readiness IDs, channel IDs, selected fixed windows, sample-size caveats, and redaction flags only. It must not enable provider sends or calls, attempt delivery, create delivery results, process delivery-status webhooks, poll providers, create delivery receipts, expose receipt payloads, process status webhooks, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, dispatch queues, send email, alert customers, route traffic, select winners, or make revenue claims.",
  },
  {
    id: "mcp-tool-create-analytics-experiment-decision",
    resourceOrTool: "tool create_analytics_experiment_decision",
    status: "planned",
    backedBy: analyticsExperimentDecisionApiRoute,
    purpose:
      `Record owner-confirmed analytics experiment decision evidence on top of the same D1 contract from issue #${analyticsExperimentDecisionIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, experiment status checks, fixed time-window selection, aggregate count validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not route traffic, assign cookies, choose automated winners, expose raw event rows, expose raw assignment rows, expose contact analytics, make revenue claims, or enable direct public agent experiment writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-inbox-record",
    resourceOrTool: "tool create_analytics_notification_inbox_record",
    status: "planned",
    backedBy: analyticsNotificationInboxApiRoute,
    purpose:
      `Record owner-confirmed analytics notification inbox evidence on top of the same D1 contract from issue #${analyticsNotificationInboxIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not expose recipients, expose email bodies, dispatch queues, send email, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-dispatch-preflight",
    resourceOrTool: "tool create_analytics_notification_dispatch_preflight",
    status: "planned",
    backedBy: analyticsNotificationDispatchPreflightApiRoute,
    purpose:
      `Record owner-confirmed analytics notification dispatch preflight evidence on top of the same D1 contract from issue #${analyticsNotificationDispatchPreflightIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current inbox record checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, dispatch queues, send email, call providers, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-provider-domain-readiness",
    resourceOrTool: "tool create_analytics_notification_provider_domain_readiness",
    status: "planned",
    backedBy: analyticsNotificationProviderDomainReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification provider/domain readiness evidence on top of the same D1 contract from issue #${analyticsNotificationProviderDomainReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current dispatch preflight checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not configure providers, store provider secrets, store sender credentials, verify sender domains, expose private DNS credentials, expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, dispatch queues, send email, call providers, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-content-consent-readiness",
    resourceOrTool: "tool create_analytics_notification_content_consent_readiness",
    status: "planned",
    backedBy: analyticsNotificationContentConsentReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification content/consent readiness evidence on top of the same D1 contract from issue #${analyticsNotificationContentConsentReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current provider/domain readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not expose body templates, expose unsubscribe URLs, expose recipients, expose email bodies, expose provider message IDs, expose queue payloads, dispatch queues, send email, call providers, configure providers, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-send-payload-readiness",
    resourceOrTool: "tool create_analytics_notification_send_payload_readiness",
    status: "planned",
    backedBy: analyticsNotificationSendPayloadReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification send-payload readiness evidence on top of the same D1 contract from issue #${analyticsNotificationSendPayloadReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current content/consent readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, create queue messages, expose queue payloads, dispatch queues, send email, call providers, configure providers, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-queue-producer-readiness",
    resourceOrTool: "tool create_analytics_notification_queue_producer_readiness",
    status: "planned",
    backedBy: analyticsNotificationQueueProducerReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification queue-producer readiness evidence on top of the same D1 contract from issue #${analyticsNotificationQueueProducerReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current send-payload readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not enable Queue producers, create Queue messages, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, dispatch queues, send email, call providers, configure providers, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-queue-consumer-readiness",
    resourceOrTool: "tool create_analytics_notification_queue_consumer_readiness",
    status: "planned",
    backedBy: analyticsNotificationQueueConsumerReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification queue-consumer readiness evidence on top of the same D1 contract from issue #${analyticsNotificationQueueConsumerReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current queue-producer readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider responses, expose provider message IDs, dispatch queues, send email, call providers, configure providers, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-provider-call-readiness",
    resourceOrTool: "tool create_analytics_notification_provider_call_readiness",
    status: "planned",
    backedBy: analyticsNotificationProviderCallReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification provider-call readiness evidence on top of the same D1 contract from issue #${analyticsNotificationProviderCallReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current queue-consumer readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not enable provider sends or calls, configure providers, create provider responses, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider message IDs, dispatch queues, send email, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-delivery-attempt-readiness",
    resourceOrTool: "tool create_analytics_notification_delivery_attempt_readiness",
    status: "planned",
    backedBy: analyticsNotificationDeliveryAttemptReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification delivery-attempt readiness evidence on top of the same D1 contract from issue #${analyticsNotificationDeliveryAttemptReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current provider-call readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not enable provider sends or calls, attempt delivery, configure providers, create provider responses, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, expose provider message IDs, dispatch queues, send email, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-delivery-result-readiness",
    resourceOrTool: "tool create_analytics_notification_delivery_result_readiness",
    status: "planned",
    backedBy: analyticsNotificationDeliveryResultReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification delivery-result readiness evidence on top of the same D1 contract from issue #${analyticsNotificationDeliveryResultReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current delivery-attempt readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not enable provider sends or calls, attempt delivery, create delivery results, create delivery receipts, expose receipt payloads, process status webhooks, poll providers, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, dispatch queues, send email, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-delivery-status-webhook-readiness",
    resourceOrTool: "tool create_analytics_notification_delivery_status_webhook_readiness",
    status: "planned",
    backedBy: analyticsNotificationDeliveryStatusWebhookReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification delivery-status webhook readiness evidence on top of the same D1 contract from issue #${analyticsNotificationDeliveryStatusWebhookReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current delivery-result readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not enable provider sends or calls, attempt delivery, create delivery results, process delivery-status webhooks, create delivery receipts, expose receipt payloads, process status webhooks, poll providers, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, dispatch queues, send email, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-analytics-notification-provider-polling-readiness",
    resourceOrTool: "tool create_analytics_notification_provider_polling_readiness",
    status: "planned",
    backedBy: analyticsNotificationProviderPollingReadinessApiRoute,
    purpose:
      `Record owner-reviewed analytics notification provider-polling readiness evidence on top of the same D1 contract from issue #${analyticsNotificationProviderPollingReadinessIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, dashboard revision checks, notification readiness checks, current delivery-status-webhook readiness checks, fixed time-window evidence validation, sample-size caveat acknowledgement, audit metadata, and redacted output. It must not enable provider sends or calls, attempt delivery, create delivery results, process delivery-status webhooks, poll providers, create delivery receipts, expose receipt payloads, process status webhooks, configure providers, create provider responses, expose provider message IDs, store provider secrets, store sender credentials, expose private DNS credentials, enable Queue producers, enable Queue consumers, create Queue messages, consume Queue messages, acknowledge Queue messages, create retry/dead-letter rows, read Queue payload bodies, create Queue payload bodies, expose queue payloads, expose recipients, create recipient payloads, create personalized bodies, store raw payload bodies, expose email bodies, expose body templates, expose unsubscribe URLs, dispatch queues, send email, alert customers, route traffic, choose automated winners, expose raw analytics rows, make revenue claims, or enable direct public agent writes.",
  },
  {
    id: "mcp-resource-affiliate-referrals",
    resourceOrTool: "resource bumpgrade://affiliate-referrals",
    status: "ready-contract",
    backedBy: "/affiliates/source-data",
    purpose:
      "Expose seeded affiliate programs, partner records, referral links, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, owner-reviewed notification provider readiness records, aggregate click counts, checkout attribution evidence, attribution rules, commission fixtures, payout review, and fraud flags.",
    safetyBoundary:
      "Seeded referral click capture, checkout attribution evidence, review-only commission evidence, owner review actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, and owner-reviewed notification provider readiness records are live; buyer attribution finalization, payable commission writes, fraud enforcement, tax handling, payout account access, partner notification sends, provider-send enablement, provider configuration, provider secret storage, provider calls, send payload creation, queue dispatch, and Stripe payouts require confirmed-write contracts.",
  },
  {
    id: "mcp-tool-create-affiliate-payout-preparation-record",
    resourceOrTool: "tool create_affiliate_payout_preparation_record",
    status: "planned",
    backedBy: affiliatePayoutPreparationRecordApiRoute,
    purpose:
      `Record owner-confirmed affiliate payout preparation evidence on top of the same D1 contract from issue #${affiliatePayoutPreparationRecordIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, program revision checks, payout batch status checks, payout-preparation evidence validation, audit metadata, and redacted output. It must not create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, enforce fraud decisions, expose buyer data, expose raw ledger rows, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-affiliate-fraud-review-record",
    resourceOrTool: "tool create_affiliate_fraud_review_record",
    status: "planned",
    backedBy: affiliateFraudReviewRecordApiRoute,
    purpose:
      `Record owner-reviewed affiliate fraud review evidence on top of the same D1 contract from issue #${affiliateFraudReviewRecordIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, program revision checks, payout batch status checks, review-flag checks, linked-ledger count validation, audit metadata, and redacted output. It must not enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-affiliate-partner-notification-readiness-record",
    resourceOrTool: "tool create_affiliate_partner_notification_readiness_record",
    status: "planned",
    backedBy: affiliatePartnerNotificationReadinessRecordApiRoute,
    purpose:
      `Record owner-reviewed affiliate partner notification readiness evidence on top of the same D1 contract from issue #${affiliatePartnerNotificationReadinessRecordIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, review-flag checks, linked-ledger count validation, audit metadata, and redacted output. It must not send partner notifications, call providers, create queue rows, expose recipient emails, expose message bodies, expose provider message IDs, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-affiliate-partner-notification-send-preflight-record",
    resourceOrTool: "tool create_affiliate_partner_notification_send_preflight_record",
    status: "planned",
    backedBy: affiliatePartnerNotificationSendPreflightRecordApiRoute,
    purpose:
      `Record owner-reviewed affiliate partner notification send preflight evidence on top of the same D1 contract from issue #${affiliatePartnerNotificationSendPreflightRecordIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, notification readiness record status checks, review-flag checks, linked-ledger count validation, provider-send-disabled checks, audit metadata, and redacted output. It must not send partner notifications, enable provider sends, call providers, create send payloads, create queue rows, expose recipient emails, expose message bodies, expose provider message IDs, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or enable direct public agent writes.",
  },
  {
    id: "mcp-tool-create-affiliate-partner-notification-provider-readiness-record",
    resourceOrTool: "tool create_affiliate_partner_notification_provider_readiness_record",
    status: "planned",
    backedBy: affiliatePartnerNotificationProviderReadinessRecordApiRoute,
    purpose:
      `Record owner-reviewed affiliate partner notification provider readiness evidence on top of the same D1 contract from issue #${affiliatePartnerNotificationProviderReadinessRecordIssue}.`,
    safetyBoundary:
      "Requires owner identity, exact confirmation, idempotency key, program revision checks, partner report checks, payout batch status checks, payout preparation record status checks, fraud review record status checks, notification readiness record status checks, send preflight record status checks, review-flag checks, linked-ledger count validation, provider-configuration-disabled checks, provider-secret-redaction checks, sender-credential-redaction checks, provider-send-disabled checks, audit metadata, and redacted output. It must not configure notification providers, store provider secrets, store sender credentials, send partner notifications, enable provider sends, call providers, create send payloads, create queue rows, expose recipient emails, expose message bodies, expose provider message IDs, enforce fraud decisions, create payable commission state, create Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose private fraud signals, or enable direct public agent writes.",
  },
  {
    id: "mcp-resource-publisher-account",
    resourceOrTool: "resource bumpgrade://publisher-account",
    status: "ready-contract",
    backedBy: "/account/source-data",
    purpose: `Expose paid publisher tenant, Bumpgrade subdomain setup, custom-domain DNS onboarding, and publisher-site auth boundaries from issues #${publisherTenantParentIssue}, #${publisherTenantIssue}, #${publisherCustomDomainIssue}, and #${publisherCustomerAuthIssue}.`,
    safetyBoundary:
      "Read-only MCP resource for setup policy; reserving a subdomain or starting custom-domain onboarding requires authenticated publisher context, active paid-plan or launch-pilot entitlement, idempotency, audit correlation, DNS verification state, and redaction. Shared Bumpgrade identity never bypasses tenant-scoped access checks.",
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
    "AGENTS.md is adapted with Bumpgrade project constants, project stack, required product surfaces, and Bumpgrade Codex email identity.",
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
