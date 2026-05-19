import { featureCatalog } from "@/lib/feature-catalog";

export type RoadmapStatus = "shipped" | "active" | "blocked" | "next" | "planned";

export type RoadmapItem = {
  id: string;
  title: string;
  status: RoadmapStatus;
  issue: number;
  featureId?: string;
  group: string;
  summary: string;
  publicEvidence: string[];
  nextMilestone: string;
  markAttention?: string;
};

export const roadmapUpdatedAt = "2026-05-18";

export const roadmapLanes: Array<{ status: RoadmapStatus; label: string; description: string }> = [
  {
    status: "shipped",
    label: "Shipped",
    description: "Merged, deployed, and safe to describe as live public surface area.",
  },
  {
    status: "active",
    label: "Active",
    description: "Currently being implemented or validated in the Codex issue loop.",
  },
  {
    status: "blocked",
    label: "Blocked",
    description: "Known unblock condition is public-safe and specific.",
  },
  {
    status: "next",
    label: "Next",
    description: "Queued near-term because later work depends on it.",
  },
  {
    status: "planned",
    label: "Planned",
    description: "Aspirational parity work with an issue, but not active yet.",
  },
];

const featureByIssue = new Map(featureCatalog.map((feature) => [feature.issue, feature]));

function featureIdFor(issue: number) {
  return featureByIssue.get(issue)?.id;
}

export const roadmapItems: RoadmapItem[] = [
  {
    id: "roadmap-cloudflare-foundation",
    title: "Cloudflare app foundation",
    status: "shipped",
    issue: 4,
    featureId: featureIdFor(4),
    group: "Platform",
    summary: "Next/OpenNext Worker app, D1 binding, R2 cache binding, DNS, core routes, screenshots, and deploy path.",
    publicEvidence: ["PR #23 merged.", "Cloudflare deployment and live route smoke checks recorded on PR #23."],
    nextMilestone: "Keep using this as the base for every issue slice.",
  },
  {
    id: "roadmap-comparison-hub",
    title: "Comparison hub and alternative pages",
    status: "shipped",
    issue: 5,
    featureId: featureIdFor(5),
    group: "SEO and agent discovery",
    summary: "Shopify-inspired compare hub, nine alternative pages, source-linked competitor data, and `/compare/source-data`.",
    publicEvidence: ["PR #25 merged.", "Live edge checks and screenshot URLs recorded on PR #25."],
    nextMilestone: "Refresh competitor sources when pricing or packaging copy is used in user-facing answers.",
  },
  {
    id: "roadmap-feature-catalog",
    title: "Public feature catalog",
    status: "shipped",
    issue: 6,
    featureId: featureIdFor(6),
    group: "SEO and agent discovery",
    summary: "Aspirational `/features` page with live and pending badges, stable feature IDs, issue links, and `/features/source-data`.",
    publicEvidence: ["PR #26 merged.", "Live edge checks and feature JSON parse checks recorded on PR #26."],
    nextMilestone: "Keep feature records current as product slices move from pending to shipped.",
  },
  {
    id: "roadmap-public-roadmap",
    title: "Public roadmap from main feature set",
    status: "shipped",
    issue: 7,
    featureId: featureIdFor(7),
    group: "Roadmap",
    summary: "Public roadmap lanes connected to the feature catalog, GitHub issues, public-safe blockers, and deploy evidence.",
    publicEvidence: [
      "Issue #7 owns this feature slice.",
      "PR #27 carries the source, screenshots, validation, and deploy evidence for this issue.",
    ],
    nextMilestone: "Replace shared static records with D1-backed admin state in #8.",
  },
  {
    id: "roadmap-codex-email",
    title: "Codex project email and reply monitor",
    status: "shipped",
    issue: 10,
    featureId: featureIdFor(10),
    group: "Operations",
    summary: "Outbound shipped-feature notices and inbound reply monitoring from `codex@bumpgrade.com`.",
    publicEvidence: [
      "Issue #10 owns the Codex project email workflow.",
      "Cloudflare Email Routing for bumpgrade.com is enabled and reported ready after MX, SPF, and DKIM records were installed.",
      "D1/R2 contracts store outbound notice results, inbound reply metadata, and raw MIME storage keys.",
      "A real delayed PR #40 notice was delivered from codex@bumpgrade.com and recorded in D1.",
      "Cloudflare routes codex@bumpgrade.com to Worker bumpgrade for inbound capture and forwarding.",
    ],
    nextMilestone: "Harden inbound Codex mail so only explicitly allowlisted and authenticated senders can steer Codex.",
    markAttention:
      "Mark asked that only m@rkmoriarty.com, mark@awesound.com, and markmoriarty@stripe.com can steer Codex, and that messages must pass sender authentication rather than trusting From text.",
  },
  {
    id: "roadmap-admin-surfaces",
    title: "D1-backed admin roadmap, work log, journeys, and for-Mark surfaces",
    status: "shipped",
    issue: 8,
    featureId: featureIdFor(8),
    group: "Admin and operations",
    summary: "Owner and agent coordination surfaces backed by D1 instead of static scaffold copy.",
    publicEvidence: [
      "Issue #8 owns this D1 admin surface slice.",
      "Admin source-data routes, D1 migrations, and append scripts are included in the issue #8 implementation.",
    ],
    nextMilestone: "Keep private admin pages behind Better Auth while adding confirmed write APIs and richer agent contracts.",
  },
  {
    id: "roadmap-better-auth",
    title: "Publisher and admin authentication",
    status: "shipped",
    issue: 9,
    featureId: featureIdFor(9),
    group: "Accounts",
    summary: "Better Auth email/password accounts, D1-backed sessions, API routes, login/signup UI, and owner-gated admin pages.",
    publicEvidence: [
      "Issue #9 owns the Better Auth foundation slice.",
      "Login/signup, D1 auth tables, Better Auth API routes, and owner-gated admin pages are included in the issue #9 implementation.",
      "Issue #55 adds owner verification resend UX and last-sent status for protected admin gates.",
    ],
    nextMilestone: "Broaden publisher account surfaces and keep verification email evidence connected to admin access.",
  },
  {
    id: "roadmap-stripe-commerce",
    title: "Stripe payments and checkout architecture",
    status: "shipped",
    issue: 11,
    featureId: featureIdFor(11),
    group: "Payments",
    summary:
      "Stripe mode-specific secrets are stored in Cloudflare, Checkout Sessions are the first payment surface, and D1 commerce/audit tables are defined before live payment code.",
    publicEvidence: [
      "Issue #11 owns this Stripe architecture slice.",
      "Cloudflare now stores mode-specific Stripe secret names without repo secret values.",
      "D1 tables define products, prices, checkout intents, subscriptions, webhook idempotency, and payment audit events.",
      "Issue #34 owns the first sandbox checkout and webhook implementation.",
    ],
    nextMilestone: "Build sandbox-only Checkout Session and webhook ingestion path in #34 before enabling live payments.",
  },
  {
    id: "roadmap-agent-contracts",
    title: "Agent-ready docs, manifests, APIs, and MCP",
    status: "shipped",
    issue: 12,
    featureId: featureIdFor(12),
    group: "Developers and agents",
    summary:
      "Public agent docs, source evidence, `/agent-docs/source-data` manifest, server-side read contracts, and future MCP resources.",
    publicEvidence: [
      "Tracked by issue #12.",
      "`llms.txt`, `/features/source-data`, `/compare/source-data`, `/commerce/source-data`, and `/agent-docs/source-data` are live inputs.",
      "The MCP roadmap is documented on `/agent-docs/bumpgrade-mcp` and stays read-only until confirmed-write APIs exist.",
    ],
    nextMilestone: "Implement the first MCP resource server on top of the documented read contracts.",
  },
  {
    id: "roadmap-mobile-admin",
    title: "Publisher admin apps for iOS and Android",
    status: "active",
    issue: 13,
    featureId: featureIdFor(13),
    group: "Mobile",
    summary:
      "Shared mobile-admin contract plus first iOS simulator and Android emulator scaffolds for independently shippable mobile app slices.",
    publicEvidence: [
      "Tracked by issue #13.",
      "iOS app slice tracked by issue #67.",
      "Android app slice tracked by issue #68.",
      "`/mobile-admin/source-data` exposes the shared mobile contract and no-installable-app caveat.",
      "`/mobile-admin/ios/source-data` exposes the iOS scaffold, fixture, simulator smoke command, and screenshot path.",
      "`/mobile-admin/android/source-data` exposes the Android scaffold, fixture asset, emulator smoke command, and screenshot path.",
    ],
    nextMilestone: "Use the iOS and Android smoke evidence to add mobile auth, live source-data reads, and confirmed-write UX in follow-up slices.",
  },
  {
    id: "roadmap-funnels",
    title: "Funnel and page builder MVP",
    status: "active",
    issue: 14,
    featureId: featureIdFor(14),
    group: "Funnels and pages",
    summary:
      "Multi-step funnel model, source-data contract, read-only seeded preview scaffold, D1-backed editable draft scaffold with step edit/reorder controls and owner-gated private preview, reusable blocks, templates, publishing, and safe draft proposals.",
    publicEvidence: [
      "Tracked by issue #14.",
      "Issue #79 adds the first `/funnels/source-data` contract and `/funnels/indie-launch-sandbox` preview scaffold.",
      "Issue #91 adds owner-gated `/admin/funnels`, `/api/admin/funnels/drafts`, and D1 draft/audit tables.",
      "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.",
      "Issue #95 adds owner-gated private draft preview from current D1 draft state.",
    ],
    nextMilestone:
      "Add confirmed publish review, checkout linking, deletion/archive, drag-and-drop block editing, and direct agent-safe edit tools on top of D1 draft funnels.",
  },
  {
    id: "roadmap-checkout-offers",
    title: "Checkout, order bump, upsell, and downsell MVP",
    status: "active",
    issue: 15,
    featureId: featureIdFor(15),
    group: "Checkout and offers",
    summary:
      "Stripe-backed checkout flows, confirmed sandbox checkout start with a constrained order bump, read-only upsell/downsell path, subscriptions, coupons, and audit trails.",
    publicEvidence: [
      "Tracked by issue #15.",
      "Depends on Stripe architecture in #11.",
      "Issue #81 adds the first `/offers/source-data` contract and `/offers/indie-launch-stack` preview scaffold.",
      "Issue #99 adds confirmed sandbox checkout start support for the seeded primary offer plus pre-payment order bump.",
    ],
    nextMilestone:
      "Add post-purchase upsell/downsell decision surfaces and webhook-backed fulfillment state after the order-bump checkout start is verified.",
  },
  {
    id: "roadmap-products-access",
    title: "Products, downloads, courses, memberships, and subscriptions",
    status: "active",
    issue: 16,
    featureId: featureIdFor(16),
    group: "Products and access",
    summary:
      "Digital product records, product/access source data, sandbox webhook-backed entitlement grants, fulfillment task evidence, protected content planning, access rules, and subscriptions.",
    publicEvidence: [
      "Tracked by issue #16.",
      "Issue #83 adds the first `/products/source-data` contract and `/products/indie-launch-library` preview scaffold.",
      "Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.",
    ],
    nextMilestone:
      "Add signed download access and authenticated entitlement inspection without exposing private R2 keys or raw Stripe identifiers.",
  },
  {
    id: "roadmap-email-automation",
    title: "Email marketing, list growth, CRM-lite, and automations",
    status: "active",
    issue: 17,
    featureId: featureIdFor(17),
    group: "Growth system",
    summary:
      "Subscriber segments, read-only opt-in and automation contract, lead magnets, tags, broadcasts, sequences, consent, and CRM-lite state.",
    publicEvidence: [
      "Tracked by issue #17.",
      "Issue #85 adds the first `/audience/source-data` contract and `/audience/indie-launch-waitlist` preview scaffold.",
      "Codex project email in issue #10 is separate from publisher/customer email workflows.",
    ],
    nextMilestone:
      "Build confirmed subscriber/consent writes and unsubscribe-safe email delivery without exposing private contact data.",
  },
  {
    id: "roadmap-analytics-testing",
    title: "Analytics, A/B testing, and conversion tracking",
    status: "active",
    issue: 18,
    featureId: featureIdFor(18),
    group: "Optimization",
    summary:
      "Read-only analytics and experiment contract, event taxonomy, funnel metrics, attribution, A/B assignment, and source-linked reporting.",
    publicEvidence: [
      "Tracked by issue #18.",
      "Issue #87 adds the first `/analytics/source-data` contract and `/analytics/indie-launch-dashboard` preview scaffold.",
    ],
    nextMilestone:
      "Build privacy-safe event ingestion and deterministic experiment assignment after the taxonomy and sample-size caveats are stable.",
  },
  {
    id: "roadmap-affiliates-referrals",
    title: "Affiliate and referral management",
    status: "active",
    issue: 19,
    featureId: featureIdFor(19),
    group: "Growth system",
    summary:
      "Read-only affiliate/referral contract, partner profiles, referral links, commission rules, attribution, payout review, and fraud checks.",
    publicEvidence: [
      "Tracked by issue #19.",
      "Issue #89 adds the first `/affiliates/source-data` contract and `/affiliates/indie-launch-partners` preview scaffold.",
    ],
    nextMilestone:
      "Build live referral click capture and commission writes after privacy-safe analytics and trusted checkout evidence are connected.",
  },
  {
    id: "roadmap-marketing-surfaces",
    title: "Users, developers and agents, resources, pricing, and blog surfaces",
    status: "shipped",
    issue: 20,
    featureId: featureIdFor(20),
    group: "Marketing surfaces",
    summary:
      "Use-case page, developer/agent page, resource and blog hub, pricing direction, metadata, sitemap entries, and `/content/source-data` contract.",
    publicEvidence: [
      "Tracked by issue #20.",
      "`/users`, `/developers-and-agents`, `/resources`, and `/pricing` are live navbar destinations.",
      "`/content/source-data` exposes stable audience, resource, and pricing-direction records for agents.",
    ],
    nextMilestone:
      "Promote planned migration guides, launch playbooks, and blog posts into dedicated pages as funnel, checkout, automation, and analytics slices ship.",
  },
];

export function roadmapItemsByStatus(status: RoadmapStatus) {
  return roadmapItems.filter((item) => item.status === status);
}

export function roadmapCounts() {
  return roadmapLanes.map((lane) => ({
    ...lane,
    count: roadmapItemsByStatus(lane.status).length,
  }));
}
