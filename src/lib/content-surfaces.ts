import {
  canonicalPricingRoute,
  freeBuildModeContract,
  pricingRoutePolicy,
  pricingSourceDataRoute,
  usagePricingDraftRoute,
} from "@/lib/pricing-plans";
import { importerHubRoute, importerIssue, importerSourceDataRoute } from "@/lib/importers";
import { site } from "@/lib/site";

export type ContentSurfaceStatus = "live" | "planned";

export type AudienceSegmentRelatedRoute = {
  label: string;
  route: string;
  kind: "feature" | "comparison" | "importer" | "resource" | "pricing" | "agent";
  status: ContentSurfaceStatus;
  summary: string;
};

export type AudienceSegmentCta = {
  label: string;
  route: string;
};

export type AudienceSegment = {
  id: string;
  slug: string;
  title: string;
  route: string;
  status: ContentSurfaceStatus;
  seoTitle: string;
  seoDescription: string;
  headline: string;
  summary: string;
  bestFor: string;
  outcome: string;
  primaryCta: AudienceSegmentCta;
  secondaryCta: AudienceSegmentCta;
  primaryJobs: string[];
  linkedFeatureIds: string[];
  relatedRoutes: AudienceSegmentRelatedRoute[];
  evidenceRoutes: string[];
  journeyIds: string[];
  issueNumbers: number[];
  agentBoundary: string;
};

export type ResourceHubItem = {
  id: string;
  title: string;
  type: "comparison" | "migration" | "launch" | "product" | "agent" | "blog" | "brand";
  status: ContentSurfaceStatus;
  route: string;
  summary: string;
  evidenceRoutes: string[];
  issueNumbers: number[];
  agentBoundary: string;
};

export type PricingPrinciple = {
  id: string;
  title: string;
  status: ContentSurfaceStatus;
  summary: string;
  evidenceRoutes: string[];
};

export type PlannedPricingTrack = {
  id: string;
  title: string;
  status: ContentSurfaceStatus;
  intendedFor: string;
  price: string;
  includes: string[];
  checkoutStatus: string;
  issueNumbers: number[];
};

export type LaunchSignupPolicy = {
  id: string;
  status: ContentSurfaceStatus;
  issueNumbers: number[];
  summary: string;
  freeBuildMode: typeof freeBuildModeContract;
  defaultSubdomain: string;
  customDomain: string;
  domainPurchase: string;
  payments: string[];
  customerCheckout: string;
  evidenceRoutes: string[];
  routePolicy: typeof pricingRoutePolicy;
};

export const contentSurfacesUpdatedAt = "2026-05-28";

export const audienceSegments: AudienceSegment[] = [
  {
    id: "audience-creators",
    slug: "creators",
    title: "Creators with a paid offer",
    route: "/users/creators",
    status: "live",
    seoTitle: "Bumpgrade for Creators With a Paid Offer",
    seoDescription:
      "Use Bumpgrade to turn a creator offer into a focused landing page, buyer path, checkout, product delivery, and follow-up system.",
    headline: "Launch a paid creator offer without stitching the buyer path together.",
    summary: "Publishers packaging knowledge, templates, communities, or services into repeatable offers.",
    bestFor: "Templates, communities, paid downloads, services, and expertise packaged into a clear offer.",
    outcome: "Turn a scattered idea into a focused page, offer, checkout path, and follow-up plan.",
    primaryCta: { label: "Build the first page", route: "/features/simple-landing-page" },
    secondaryCta: { label: "Compare platforms", route: "/compare/clickfunnels-alternative" },
    primaryJobs: ["Outline a funnel", "Capture leads", "Sell the first offer", "Measure conversion"],
    linkedFeatureIds: ["feature-funnel-builder", "feature-checkout-offers", "feature-products-access"],
    relatedRoutes: [
      {
        label: "Simple landing pages",
        route: "/features/simple-landing-page",
        kind: "feature",
        status: "live",
        summary: "Turn the offer promise into a page people can understand and act on.",
      },
      {
        label: "Sales funnels",
        route: "/features/sales-funnels",
        kind: "feature",
        status: "live",
        summary: "Connect the opt-in, offer, checkout handoff, and follow-up path.",
      },
      {
        label: "Digital products",
        route: "/features/digital-products",
        kind: "feature",
        status: "live",
        summary: "Keep paid downloads, courses, memberships, and access tied to the purchase.",
      },
      {
        label: "ClickFunnels comparison",
        route: "/compare/clickfunnels-alternative",
        kind: "comparison",
        status: "live",
        summary: "Compare the launch path against the funnel-builder category creators already know.",
      },
    ],
    evidenceRoutes: [
      "/content/source-data",
      "/features/source-data",
      "/funnels/source-data",
      "/offers/source-data",
      "/products/source-data",
      "/compare/source-data",
    ],
    journeyIds: [
      "journey-prospect-evaluates-content-surfaces",
      "journey-publisher-previews-seeded-funnel",
      "journey-publisher-previews-product-access",
    ],
    issueNumbers: [14, 15, 16, 20, 536],
    agentBoundary: "Agents may draft funnel or offer copy, but publishing and billing changes require confirmed-write rules.",
  },
  {
    id: "audience-coaches",
    slug: "coaches",
    title: "Coaches and consultants",
    route: "/users/coaches",
    status: "live",
    seoTitle: "Bumpgrade for Coaches and Consultants",
    seoDescription:
      "Use Bumpgrade to qualify coaching demand, sell sessions or cohorts, collect leads, and keep follow-up connected to the buyer journey.",
    headline: "Sell coaching packages with a calmer path from interest to follow-up.",
    summary: "Solo experts and small teams selling calls, cohorts, audits, workshops, or retainers.",
    bestFor: "Coaches, consultants, and solo experts selling audits, workshops, cohorts, or retainers.",
    outcome: "Qualify demand, sell the first package, and keep the follow-up organized around real buyers.",
    primaryCta: { label: "Shape the offer", route: "/features/order-bump" },
    secondaryCta: { label: "Open teaching funnels", route: "/features/webinars-and-resources" },
    primaryJobs: ["Qualify demand", "Sell session packages", "Track customer follow-up", "Protect client context"],
    linkedFeatureIds: ["feature-checkout-offers", "feature-email-automation-crm", "feature-better-auth"],
    relatedRoutes: [
      {
        label: "Checkout and order bumps",
        route: "/features/order-bump",
        kind: "feature",
        status: "live",
        summary: "Model paid sessions, workshops, add-ons, and the next offer after purchase.",
      },
      {
        label: "Webinars and resources",
        route: "/features/webinars-and-resources",
        kind: "feature",
        status: "live",
        summary: "Use teaching moments, resources, and events as part of the sales path.",
      },
      {
        label: "Audience CRM",
        route: "/features/audience-crm",
        kind: "feature",
        status: "live",
        summary: "Keep consent, segments, suppression, and follow-up context close to the launch.",
      },
      {
        label: "Kajabi comparison",
        route: "/compare/kajabi-alternative",
        kind: "comparison",
        status: "live",
        summary: "Compare Bumpgrade with a knowledge-commerce platform often used by coaches.",
      },
    ],
    evidenceRoutes: ["/content/source-data", "/features/source-data", "/offers/source-data", "/audience/source-data", "/compare/source-data"],
    journeyIds: [
      "journey-prospect-evaluates-content-surfaces",
      "journey-publisher-previews-checkout-offer-stack",
      "journey-publisher-previews-audience-automation",
    ],
    issueNumbers: [9, 15, 17, 20, 536],
    agentBoundary: "Agents must not expose private customer data or send follow-up email without confirmation and audience scope.",
  },
  {
    id: "audience-newsletter-publishers",
    slug: "newsletter-publishers",
    title: "Newsletter writers and small publishers",
    route: "/users/newsletter-publishers",
    status: "live",
    seoTitle: "Bumpgrade for Newsletter Publishers",
    seoDescription:
      "Use Bumpgrade to grow a newsletter audience, segment subscribers, launch paid products, and keep AI-readable context grounded in public-safe records.",
    headline: "Turn newsletter attention into a launch path you can keep improving.",
    summary: "Audience owners who need list growth, launch workflows, paid products, and lightweight CRM state.",
    bestFor: "Audience owners who want to grow a list and turn attention into paid products.",
    outcome: "Capture subscribers, segment interest, and prepare a launch sequence without stitching together extra tools.",
    primaryCta: { label: "Grow the list", route: "/features/email-campaigns" },
    secondaryCta: { label: "Import audience context", route: "/imports/kit" },
    primaryJobs: ["Grow the list", "Segment subscribers", "Launch paid products", "Reuse evidence in public copy"],
    linkedFeatureIds: ["feature-email-automation-crm", "feature-products-access", "feature-agent-ready-contracts"],
    relatedRoutes: [
      {
        label: "Email campaigns",
        route: "/features/email-campaigns",
        kind: "feature",
        status: "live",
        summary: "Capture waitlist leads, segment subscribers, and prepare safer campaign work.",
      },
      {
        label: "Audience CRM",
        route: "/features/audience-crm",
        kind: "feature",
        status: "live",
        summary: "Review consent, suppression, tags, and subscriber context before sending.",
      },
      {
        label: "Digital products",
        route: "/features/digital-products",
        kind: "feature",
        status: "live",
        summary: "Connect paid newsletter products, downloads, and memberships to access checks.",
      },
      {
        label: "Kit importer",
        route: "/imports/kit",
        kind: "importer",
        status: "live",
        summary: "Map existing audience, form, and follow-up context into a private Bumpgrade workspace.",
      },
    ],
    evidenceRoutes: [
      "/content/source-data",
      "/features/source-data",
      "/audience/source-data",
      "/products/source-data",
      "/imports/source-data",
      "/agent-docs/source-data",
    ],
    journeyIds: [
      "journey-prospect-evaluates-content-surfaces",
      "journey-visitor-joins-indie-launch-waitlist",
      "journey-publisher-previews-audience-automation",
      "journey-agent-reads-bumpgrade-manifest",
    ],
    issueNumbers: [12, 16, 17, 20, 536],
    agentBoundary: "Subscriber and segment writes require consent-safe confirmation; public claims need cited source evidence.",
  },
  {
    id: "audience-course-sellers",
    slug: "course-sellers",
    title: "Course and membership sellers",
    route: "/users/course-sellers",
    status: "live",
    seoTitle: "Bumpgrade for Course and Membership Sellers",
    seoDescription:
      "Use Bumpgrade to package courses, memberships, checkout paths, subscriptions, protected access, and customer lookup flows in one launch system.",
    headline: "Sell courses and memberships with access tied to the purchase.",
    summary: "Knowledge businesses that need product access, subscriptions, checkout, and fulfillment state.",
    bestFor: "Course creators, membership sellers, and productized knowledge businesses.",
    outcome: "Sell access, deliver protected files or lessons, and keep customer access tied to the purchase.",
    primaryCta: { label: "Open product access", route: "/features/digital-products" },
    secondaryCta: { label: "Compare Kajabi", route: "/compare/kajabi-alternative" },
    primaryJobs: ["Model products", "Sell subscriptions", "Grant access", "Handle upgrades or cancellations"],
    linkedFeatureIds: ["feature-products-access", "feature-stripe-commerce", "feature-checkout-offers"],
    relatedRoutes: [
      {
        label: "Digital products",
        route: "/features/digital-products",
        kind: "feature",
        status: "live",
        summary: "Model courses, memberships, bundles, files, access rules, and customer lookup.",
      },
      {
        label: "Checkout and order bumps",
        route: "/features/order-bump",
        kind: "feature",
        status: "live",
        summary: "Connect paid offers, bumps, and post-purchase choices to the product path.",
      },
      {
        label: "Sales funnels",
        route: "/features/sales-funnels",
        kind: "feature",
        status: "live",
        summary: "Build the opt-in, sales, checkout, and delivery handoff around the same offer.",
      },
      {
        label: "Kajabi importer",
        route: "/imports/kajabi",
        kind: "importer",
        status: "live",
        summary: "Map current course, membership, offer, and audience material before moving buyers.",
      },
    ],
    evidenceRoutes: ["/content/source-data", "/features/source-data", "/products/source-data", "/offers/source-data", "/imports/source-data"],
    journeyIds: [
      "journey-prospect-evaluates-content-surfaces",
      "journey-publisher-previews-product-access",
      "journey-publisher-verifies-sandbox-entitlement-grant",
    ],
    issueNumbers: [11, 15, 16, 20, 536],
    agentBoundary: "Access and billing state must stay behind authenticated contracts with audit evidence.",
  },
  {
    id: "audience-agencies",
    slug: "agencies",
    title: "Agencies and launch operators",
    route: "/users/agencies",
    status: "live",
    seoTitle: "Bumpgrade for Agencies and Launch Operators",
    seoDescription:
      "Use Bumpgrade to run repeatable client launches with funnels, analytics, affiliate tracking, importer paths, and approval-friendly evidence.",
    headline: "Run repeatable launches without burying client context in separate tools.",
    summary: "Operators managing multiple offers, launches, analytics, and approvals for clients.",
    bestFor: "Operators managing repeated launches, client offers, partner campaigns, and reporting.",
    outcome: "Reuse launch structures, review performance, and coordinate approvals across offers.",
    primaryCta: { label: "Review analytics", route: "/features/ad-tracking" },
    secondaryCta: { label: "Open import center", route: importerHubRoute },
    primaryJobs: ["Clone launch systems", "Review performance", "Coordinate approvals", "Avoid client data leakage"],
    linkedFeatureIds: ["feature-analytics-testing", "feature-affiliates-referrals", "feature-admin-state"],
    relatedRoutes: [
      {
        label: "Ad tracking and analytics",
        route: "/features/ad-tracking",
        kind: "feature",
        status: "live",
        summary: "Read aggregate source, variant, conversion, and launch performance signals.",
      },
      {
        label: "Affiliate and referrals",
        route: "/features/affiliate-referrals",
        kind: "feature",
        status: "live",
        summary: "Track partner growth, commission review, payout preparation, and fraud checks deliberately.",
      },
      {
        label: "Competitor importers",
        route: "/features/competitor-importers",
        kind: "feature",
        status: "live",
        summary: "Bring existing client launch material into a private Bumpgrade workspace for review.",
      },
      {
        label: "Comparison hub",
        route: "/compare",
        kind: "comparison",
        status: "live",
        summary: "Explain stack choices across the platforms clients already know.",
      },
    ],
    evidenceRoutes: [
      "/content/source-data",
      "/features/source-data",
      "/analytics/source-data",
      "/affiliates/source-data",
      "/imports/source-data",
      "/compare/source-data",
    ],
    journeyIds: [
      "journey-prospect-evaluates-content-surfaces",
      "journey-publisher-previews-analytics-experiments",
      "journey-publisher-previews-affiliate-referrals",
      "journey-prospect-imports-from-clickfunnels",
    ],
    issueNumbers: [8, 18, 19, 20, 536],
    agentBoundary: "Multi-client data and client-speech actions require explicit tenant boundaries and approval logs.",
  },
  {
    id: "audience-indie-hackers",
    slug: "indie-hackers",
    title: "Indie hackers and tiny teams",
    route: "/users/indie-hackers",
    status: "live",
    seoTitle: "Bumpgrade for Indie Hackers and Tiny Teams",
    seoDescription:
      "Use Bumpgrade to ship a minimum funnel, take payments when ready, automate follow-up, and keep enough context for AI helpers to assist.",
    headline: "Ship a minimum launch system that AI helpers can understand.",
    summary: "Builders who want one owned growth system instead of stitching together many single-purpose tools.",
    bestFor: "Tiny teams and builders who want one owned growth system around a minimum viable offer.",
    outcome: "Ship a useful funnel, take payment when ready, and keep enough context for AI helpers to assist.",
    primaryCta: { label: "Ask the AI coach", route: "/features/ai-business-coach" },
    secondaryCta: { label: "Start building", route: "/pricing" },
    primaryJobs: ["Ship a minimum funnel", "Take payments", "Automate the follow-up", "Let agents read the state"],
    linkedFeatureIds: ["feature-cloudflare-foundation", "feature-agent-ready-contracts", "feature-codex-email"],
    relatedRoutes: [
      {
        label: "AI business coach",
        route: "/features/ai-business-coach",
        kind: "feature",
        status: "live",
        summary: "Turn launch state into practical planning, copy, and next-step recommendations.",
      },
      {
        label: "Simple landing pages",
        route: "/features/simple-landing-page",
        kind: "feature",
        status: "live",
        summary: "Give the first offer a page and path instead of another private note.",
      },
      {
        label: "Developers and agents",
        route: "/developers-and-agents",
        kind: "agent",
        status: "live",
        summary: "Inspect the public docs, manifest, and safe read boundaries for AI-assisted work.",
      },
      {
        label: "Pricing",
        route: "/pricing",
        kind: "pricing",
        status: "live",
        summary: "Start from Free Build, Experiment, Grow, or Enterprise depending on the launch stage.",
      },
    ],
    evidenceRoutes: ["/content/source-data", "/features/source-data", "/agent-docs/source-data", "/pricing/source-data"],
    journeyIds: [
      "journey-prospect-evaluates-content-surfaces",
      "journey-agent-reads-bumpgrade-manifest",
      "journey-prospect-understands-free-build",
      "journey-publisher-previews-seeded-funnel",
    ],
    issueNumbers: [4, 10, 12, 20, 536],
    agentBoundary: "Agents should use source-data routes and manifests instead of scraping hidden admin UI.",
  },
];

export const audienceSegmentRoutes = audienceSegments.map((segment) => segment.route);

export function getAudienceSegment(slug: string) {
  return audienceSegments.find((segment) => segment.slug === slug) ?? null;
}

export function audienceSegmentUrl(slugOrSegment: string | AudienceSegment) {
  const route = typeof slugOrSegment === "string" ? `/users/${slugOrSegment}` : slugOrSegment.route;
  return `${site.url}${route}`;
}

export const resourceHubItems: ResourceHubItem[] = [
  {
    id: "resource-comparison-hub",
    title: "Comparison hub",
    type: "comparison",
    status: "live",
    route: "/compare",
    summary: "First-wave alternatives and ClickFunnels competitor intent with official source URLs and caveats.",
    evidenceRoutes: ["/compare/source-data"],
    issueNumbers: [5],
    agentBoundary: "Refresh official source URLs before using volatile pricing, packaging, or feature claims.",
  },
  {
    id: "resource-clickfunnels-migration",
    title: "ClickFunnels importer",
    type: "migration",
    status: "live",
    route: "/imports/clickfunnels",
    summary: "Review-first path for bringing ClickFunnels pages, offer paths, products, and follow-up context into Bumpgrade.",
    evidenceRoutes: [importerSourceDataRoute, "/compare/source-data", "/roadmap/source-data"],
    issueNumbers: [importerIssue, 5, 14, 15, 20],
    agentBoundary:
      "Importer guidance creates private workspace records only after review; public publishing, live checkout, subscriber sends, domains, and fulfillment require go-live approval.",
  },
  {
    id: "resource-import-center",
    title: "Importer center",
    type: "migration",
    status: "live",
    route: importerHubRoute,
    summary: "Dedicated import paths for ClickFunnels, SamCart, Kit, Kajabi, Shopify, Podia, Systeme.io, Kartra, and ThriveCart.",
    evidenceRoutes: [importerSourceDataRoute, "/features/source-data"],
    issueNumbers: [importerIssue],
    agentBoundary:
      "Agents can cite supported platforms, input kinds, generated private record types, safety gates, and limitations; account-to-account transfer and live buyer-facing actions need later proof.",
  },
  {
    id: "resource-launch-playbook",
    title: "Offer launch playbook",
    type: "launch",
    status: "planned",
    route: "/resources#launch-playbook",
    summary: "Planned practical guide for opt-in, sales, checkout, upsell, email, and measurement workflows.",
    evidenceRoutes: ["/features/source-data", "/roadmap/source-data"],
    issueNumbers: [14, 15, 17, 18, 20],
    agentBoundary: "Playbook claims must distinguish Bumpgrade roadmap plans from shipped capability.",
  },
  {
    id: "resource-product-notes-blog-index",
    title: "Product notes and blog index",
    type: "blog",
    status: "live",
    route: "/resources/product-notes",
    summary: "Current index for product notes, launch guidance, and the public evidence routes behind Bumpgrade resources.",
    evidenceRoutes: ["/content/source-data", "/features/source-data", "/roadmap/source-data"],
    issueNumbers: [20],
    agentBoundary: "Posts should cite source routes, issue evidence, or retrieved source URLs before factual claims are published.",
  },
  {
    id: "resource-commerce-notes",
    title: "Commerce setup notes",
    type: "product",
    status: "live",
    route: "/agent-docs/bumpgrade-commerce-contract",
    summary: "Self-serve subscription checkout, sandbox offer checkout, Stripe mode, and billing-safe agent boundaries.",
    evidenceRoutes: ["/commerce/source-data", "/api/billing/checkout", "/agent-docs/source-data"],
    issueNumbers: [11, 34, 46, 316],
    agentBoundary: "Bumpgrade subscription checkout is live; publisher-offer checkout remains governed by offer-specific billing safety boundaries.",
  },
  {
    id: "resource-agent-contracts",
    title: "Agent contract map",
    type: "agent",
    status: "live",
    route: "/agent-docs",
    summary: "Public read contracts, source evidence, MCP roadmap, and confirmed-write rules for agent clients.",
    evidenceRoutes: ["/agent-docs/source-data"],
    issueNumbers: [12],
    agentBoundary: "The manifest is read-only discovery metadata, not permission to perform writes.",
  },
  {
    id: "resource-brand-kit",
    title: "Brand kit",
    type: "brand",
    status: "live",
    route: "/brand",
    summary: "Logo, favicon, social card, colors, typography, voice, and UI principles for Bumpgrade surfaces.",
    evidenceRoutes: ["/brand/source-data", "/content/source-data"],
    issueNumbers: [318],
    agentBoundary: "Agents may cite brand assets and principles, but new public claims still need source evidence.",
  },
];

export const resourceHubRoutes = Array.from(
  new Set(resourceHubItems.map((item) => item.route).filter((route) => !route.includes("#"))),
);

export const pricingPrinciples: PricingPrinciple[] = [
  {
    id: "pricing-build-before-go-live",
    title: "Build before paying",
    status: "live",
    summary:
      "Issue #466 defines the logged-out playground, free private-building path, and paid go-live gates; issue #473 adds signed-in Free Build workspace creation.",
    evidenceRoutes: [canonicalPricingRoute, "/playground", "/playground/source-data", pricingSourceDataRoute, "/account/source-data", "/content/source-data"],
  },
  {
    id: "pricing-self-serve",
    title: "Self-serve subscription checkout",
    status: "live",
    summary: "Experiment and Grow use Stripe Checkout so publishers can start today without a sales conversation.",
    evidenceRoutes: [canonicalPricingRoute, "/api/billing/checkout", "/commerce/source-data"],
  },
  {
    id: "pricing-flexible-entitlements",
    title: "Flexible plan entitlements",
    status: "live",
    summary: "Plan capability boundaries live in a data framework so features can move between plans later.",
    evidenceRoutes: [canonicalPricingRoute, "/content/source-data"],
  },
  {
    id: "pricing-agent-safe",
    title: "Agent-started billing needs stronger confirmation",
    status: "live",
    summary: "Billing-impacting writes require exact confirmation, idempotency, stale-state checks, audit correlation, and redaction.",
    evidenceRoutes: ["/agent-docs/source-data", "/commerce/source-data"],
  },
];

export const plannedPricingTracks: PlannedPricingTrack[] = [
  {
    id: "pricing-track-free-build",
    title: "Free Build",
    status: "live",
    intendedFor: "Publishers who want to assemble launch pages, offers, products, audience setup, and AI context before paying.",
    price: "$0 while building",
    includes: [
      "Private launch workspace design",
      "Offer, product, and audience setup",
      "AI-readable launch context",
      "Paid go-live gates for public publishing, live checkout, subscriber sends, domains, and fulfillment",
    ],
    checkoutStatus:
      "Issue #473 adds signed-in private workspace creation. Paid go-live actions still require the right entitlement.",
    issueNumbers: [466, 473],
  },
  {
    id: "pricing-track-publisher",
    title: "Experiment",
    status: "live",
    intendedFor: "Solo creators, coaches, and newsletter publishers starting with one owned audience.",
    price: "$97/mo",
    includes: [
      "Funnel and page builder",
      "Checkout and products",
      "Email/list growth",
      "Basic analytics",
      "Paid-gated Bumpgrade subdomain reservation",
      "AI coach launch context",
    ],
    checkoutStatus: "Self-serve Stripe Checkout is available through /api/billing/checkout.",
    issueNumbers: [14, 15, 16, 17, 18, 20, 222, 316],
  },
  {
    id: "pricing-track-growth",
    title: "Grow",
    status: "live",
    intendedFor: "Publishers who need optimization, affiliates, richer automations, and multi-offer reporting.",
    price: "$197/mo",
    includes: ["A/B tests", "Referral and affiliate tracking", "Advanced automations", "Offer performance views"],
    checkoutStatus: "Self-serve Stripe Checkout is available through /api/billing/checkout.",
    issueNumbers: [17, 18, 19, 20, 316],
  },
  {
    id: "pricing-track-agent",
    title: "Enterprise",
    status: "live",
    intendedFor: "Teams that need SSO, custom development, dedicated implementation help, or unusual billing/data boundaries.",
    price: "Contact us",
    includes: ["SSO planning", "Custom development", "Team security requirements", "Dedicated launch architecture review"],
    checkoutStatus: "Enterprise uses a contact path instead of self-serve checkout.",
    issueNumbers: [12, 20, 316],
  },
];

export const launchSignupPolicy: LaunchSignupPolicy = {
  id: "self-serve-pricing-and-account-setup",
  status: "live",
  issueNumbers: [217, 222, 223, 225, 226, 316, 466, 473, 551],
  summary:
    "Bumpgrade offers signed-in Free Build workspace creation, self-serve Experiment and Grow subscriptions through Stripe Checkout, and an Enterprise contact path.",
  freeBuildMode: freeBuildModeContract,
  defaultSubdomain:
    "A publisher can reserve a default *.bumpgrade.com hostname after a paid or explicitly approved go-live entitlement is active.",
  customDomain:
    "Grow and Enterprise publishers can connect a domain they already own after reserving the default Bumpgrade hostname; Bumpgrade shows the CNAME target and verification state.",
  domainPurchase:
    "Bumpgrade does not sell, register, renew, transfer, price, or check availability for domains today.",
  payments: [
    "Free Build supports signed-in private workspace creation before payment; the anonymous playground saves structured browser-scoped launch setup before signup, has owner-gated and scheduled cleanup for expired recovery, and can become a private launch draft plus private claim records after verified-account claim.",
    "Experiment is $97/month.",
    "Grow is $197/month.",
    "White glove setup is an optional one-time $1,000 add-on.",
    "Successful Stripe Checkout Sessions are verified server-side before Bumpgrade activates publisher plan entitlements.",
  ],
  customerCheckout:
    "Customer-facing checkout for a publisher's own offer remains offer-specific; Bumpgrade subscription checkout is the self-serve account plan path.",
  evidenceRoutes: [
    canonicalPricingRoute,
    "/playground",
    "/playground/source-data",
    pricingSourceDataRoute,
    usagePricingDraftRoute,
    "/api/billing/checkout",
    "/account/setup",
    "/account/source-data",
    "/commerce/source-data",
    "/admin/user-journeys/source-data",
  ],
  routePolicy: pricingRoutePolicy,
};

export const contentSourceData = {
  id: "bumpgrade-content-surface-source-data",
  updatedAt: contentSurfacesUpdatedAt,
  issue: 20,
  routes: Array.from(
    new Set([
      "/users",
      ...audienceSegmentRoutes,
      "/developers-and-agents",
      "/resources",
      ...resourceHubRoutes,
      importerHubRoute,
      "/brand",
      "/trust/source-data",
      canonicalPricingRoute,
      pricingSourceDataRoute,
      "/playground",
      "/playground/source-data",
      usagePricingDraftRoute,
      "/account/setup",
      importerSourceDataRoute,
      "/content/source-data",
    ]),
  ),
  audienceSegments,
  resourceHubItems,
  pricingPrinciples,
  pricingRoutePolicy,
  plannedPricingTracks,
  launchSignupPolicy,
  caveat:
    "This source data describes public content surfaces. It does not turn planned product features, publisher-offer billing, customer proof, or confirmed-write agent tools into shipped capabilities.",
};
