export type ContentSurfaceStatus = "live" | "planned";

export type AudienceSegment = {
  id: string;
  title: string;
  route: string;
  status: ContentSurfaceStatus;
  summary: string;
  primaryJobs: string[];
  linkedFeatureIds: string[];
  issueNumbers: number[];
  agentBoundary: string;
};

export type ResourceHubItem = {
  id: string;
  title: string;
  type: "comparison" | "migration" | "launch" | "product" | "agent" | "blog";
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
  includes: string[];
  notYetClaimed: string;
  issueNumbers: number[];
};

export const contentSurfacesUpdatedAt = "2026-05-20";

export const audienceSegments: AudienceSegment[] = [
  {
    id: "audience-creators",
    title: "Creators with a paid offer",
    route: "/users#creators",
    status: "live",
    summary: "Publishers packaging knowledge, templates, communities, or services into repeatable offers.",
    primaryJobs: ["Draft a funnel", "Capture leads", "Sell the first offer", "Measure conversion"],
    linkedFeatureIds: ["feature-funnel-builder", "feature-checkout-offers", "feature-products-access"],
    issueNumbers: [14, 15, 16, 20],
    agentBoundary: "Agents may draft funnel or offer copy, but publishing and billing changes require confirmed-write rules.",
  },
  {
    id: "audience-coaches",
    title: "Coaches and consultants",
    route: "/users#coaches",
    status: "live",
    summary: "Solo experts and small teams selling calls, cohorts, audits, workshops, or retainers.",
    primaryJobs: ["Qualify demand", "Sell session packages", "Track customer follow-up", "Protect client context"],
    linkedFeatureIds: ["feature-checkout-offers", "feature-email-automation-crm", "feature-better-auth"],
    issueNumbers: [9, 15, 17, 20],
    agentBoundary: "Agents must not expose private customer data or send follow-up email without confirmation and audience scope.",
  },
  {
    id: "audience-newsletter-publishers",
    title: "Newsletter writers and small publishers",
    route: "/users#newsletter-publishers",
    status: "live",
    summary: "Audience owners who need list growth, launch workflows, paid products, and lightweight CRM state.",
    primaryJobs: ["Grow the list", "Segment subscribers", "Launch paid products", "Reuse evidence in public copy"],
    linkedFeatureIds: ["feature-email-automation-crm", "feature-products-access", "feature-agent-ready-contracts"],
    issueNumbers: [12, 16, 17, 20],
    agentBoundary: "Subscriber and segment writes require consent-safe confirmation; public claims need cited source evidence.",
  },
  {
    id: "audience-course-sellers",
    title: "Course and membership sellers",
    route: "/users#course-sellers",
    status: "live",
    summary: "Knowledge businesses that need product access, subscriptions, checkout, and fulfillment state.",
    primaryJobs: ["Model products", "Sell subscriptions", "Grant access", "Handle upgrades or cancellations"],
    linkedFeatureIds: ["feature-products-access", "feature-stripe-commerce", "feature-checkout-offers"],
    issueNumbers: [11, 15, 16, 20],
    agentBoundary: "Access and billing state must stay behind authenticated contracts with audit evidence.",
  },
  {
    id: "audience-agencies",
    title: "Agencies and launch operators",
    route: "/users#agencies",
    status: "live",
    summary: "Operators managing multiple offers, launches, analytics, and approvals for clients.",
    primaryJobs: ["Clone launch systems", "Review performance", "Coordinate approvals", "Avoid client data leakage"],
    linkedFeatureIds: ["feature-analytics-testing", "feature-affiliates-referrals", "feature-admin-state"],
    issueNumbers: [8, 18, 19, 20],
    agentBoundary: "Multi-client data and client-speech actions require explicit tenant boundaries and approval logs.",
  },
  {
    id: "audience-indie-hackers",
    title: "Indie hackers and tiny teams",
    route: "/users#indie-hackers",
    status: "live",
    summary: "Builders who want one owned growth system instead of stitching together many single-purpose tools.",
    primaryJobs: ["Ship a minimum funnel", "Take payments", "Automate the follow-up", "Let agents read the state"],
    linkedFeatureIds: ["feature-cloudflare-foundation", "feature-agent-ready-contracts", "feature-codex-email"],
    issueNumbers: [4, 10, 12, 20],
    agentBoundary: "Agents should use source-data routes and manifests instead of scraping hidden admin UI.",
  },
];

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
    title: "ClickFunnels migration guide",
    type: "migration",
    status: "planned",
    route: "/compare/clickfunnels-alternative",
    summary: "Use the comparison page as the current evidence base before a dedicated migration guide exists.",
    evidenceRoutes: ["/compare/source-data", "/roadmap/source-data"],
    issueNumbers: [5, 14, 15, 20],
    agentBoundary: "Migration steps are draft guidance until funnel/page and checkout implementations ship.",
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
    route: "/resources#product-notes-blog-index",
    summary: "Current index for product notes, launch essays, and future blog posts before dedicated article routes exist.",
    evidenceRoutes: ["/content/source-data", "/features/source-data", "/roadmap/source-data"],
    issueNumbers: [20],
    agentBoundary: "Posts should cite source routes, issue evidence, or retrieved source URLs before factual claims are published.",
  },
  {
    id: "resource-commerce-notes",
    title: "Commerce implementation notes",
    type: "product",
    status: "live",
    route: "/agent-docs/bumpgrade-commerce-contract",
    summary: "Sandbox checkout, Stripe mode, webhook, and billing-safe agent boundaries.",
    evidenceRoutes: ["/commerce/source-data", "/agent-docs/source-data"],
    issueNumbers: [11, 34, 46],
    agentBoundary: "Live billing remains disabled until a later explicit rollout proves webhook evidence.",
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
];

export const pricingPrinciples: PricingPrinciple[] = [
  {
    id: "pricing-no-invented-plans",
    title: "No invented plan names or price points",
    status: "live",
    summary: "Bumpgrade can explain pricing direction, but published plan names, limits, and amounts wait for packaging evidence.",
    evidenceRoutes: ["/commerce/source-data", "/roadmap/source-data"],
  },
  {
    id: "pricing-checkout-first",
    title: "Checkout and webhook evidence before live billing claims",
    status: "live",
    summary: "Stripe Checkout, D1 commerce records, and webhook idempotency are the foundation before live subscription rollout.",
    evidenceRoutes: ["/commerce/source-data", "/agent-docs/bumpgrade-commerce-contract"],
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
    id: "pricing-track-publisher",
    title: "Publisher workspace",
    status: "live",
    intendedFor: "Solo creators, coaches, and newsletter publishers starting with one owned audience.",
    includes: [
      "Funnel and page builder",
      "Checkout and products",
      "Email/list growth",
      "Basic analytics",
      "Paid-gated Bumpgrade subdomain reservation",
    ],
    notYetClaimed:
      "Published price amounts, plan limits, custom-domain verification, domain purchase, and live self-serve billing availability are separate launch slices.",
    issueNumbers: [14, 15, 16, 17, 18, 20, 222],
  },
  {
    id: "pricing-track-growth",
    title: "Growth stack",
    status: "planned",
    intendedFor: "Publishers who need optimization, affiliates, richer automations, and multi-offer reporting.",
    includes: ["A/B tests", "Referral and affiliate tracking", "Advanced automations", "Offer performance views"],
    notYetClaimed: "This is positioning only until analytics, referrals, and automation slices ship.",
    issueNumbers: [17, 18, 19, 20],
  },
  {
    id: "pricing-track-agent",
    title: "Agent-enabled operations",
    status: "planned",
    intendedFor: "Operators who want Codex, ChatGPT, Claude, or internal agents to inspect and propose changes safely.",
    includes: ["Source-data reads", "MCP resources", "Confirmed-write proposals", "Audit and approval records"],
    notYetClaimed: "Read contracts are live, but write tools and MCP server packaging are still planned.",
    issueNumbers: [12, 20],
  },
];

export const contentSourceData = {
  id: "bumpgrade-content-surface-source-data",
  updatedAt: contentSurfacesUpdatedAt,
  issue: 20,
  routes: ["/users", "/developers-and-agents", "/resources", "/pricing", "/account/setup", "/content/source-data"],
  audienceSegments,
  resourceHubItems,
  pricingPrinciples,
  plannedPricingTracks,
  caveat:
    "This source data describes public content surfaces. It does not turn planned product features, live billing, or confirmed-write agent tools into shipped capabilities.",
};
