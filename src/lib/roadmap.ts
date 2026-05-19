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

export const roadmapUpdatedAt = "2026-05-19";

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
      "Stripe mode-specific secrets are stored in Cloudflare, Checkout Sessions are the first payment surface, and D1 commerce/audit tables now include optional referral-click attribution evidence, review-only commission ledger evidence, and owner review/reversal actions before live payment or payout code.",
    publicEvidence: [
      "Issue #11 owns this Stripe architecture slice.",
      "Cloudflare now stores mode-specific Stripe secret names without repo secret values.",
      "D1 tables define products, prices, checkout intents, subscriptions, webhook idempotency, and payment audit events.",
      "Issue #34 owns the first sandbox checkout and webhook implementation.",
      "Issue #111 adds checkout referral attribution evidence without commission or payout mutation.",
      "Issue #113 creates review-only commission ledger evidence without payout mutation.",
      "Issue #115 adds owner-gated commission review, hold, and reversal actions without payout mutation.",
    ],
    nextMilestone:
      "Add partner-facing reports and payout preparation only after owner review/reversal controls stay stable.",
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
      "Multi-step funnel model, source-data contract, read-only seeded preview scaffold, D1-backed editable draft scaffold with step edit/reorder controls, owner-gated private preview, exact-confirmed public publishing, reusable blocks, templates, and safe draft proposals.",
    publicEvidence: [
      "Tracked by issue #14.",
      "Issue #79 adds the first `/funnels/source-data` contract and `/funnels/indie-launch-sandbox` preview scaffold.",
      "Issue #91 adds owner-gated `/admin/funnels`, `/api/admin/funnels/drafts`, and D1 draft/audit tables.",
      "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.",
      "Issue #95 adds owner-gated private draft preview from current D1 draft state.",
      "Issue #135 adds exact-confirmed public publishing from D1 draft funnels to stable public `/funnels/{slug}` routes.",
    ],
    nextMilestone:
      "Add checkout linking, deletion/archive, unpublishing, drag-and-drop block editing, and direct agent-safe edit tools on top of D1 draft funnels.",
  },
  {
    id: "roadmap-checkout-offers",
    title: "Checkout, order bump, upsell, and downsell MVP",
    status: "active",
    issue: 15,
    featureId: featureIdFor(15),
    group: "Checkout and offers",
    summary:
      "Stripe-backed checkout flows, confirmed sandbox checkout start with a constrained order bump, optional referral-click attribution evidence, review-only commission ledger evidence, owner review/reversal actions, non-billing post-purchase upsell/downsell decision evidence, subscriptions, coupons, and audit trails.",
    publicEvidence: [
      "Tracked by issue #15.",
      "Depends on Stripe architecture in #11.",
      "Issue #81 adds the first `/offers/source-data` contract and `/offers/indie-launch-stack` preview scaffold.",
      "Issue #99 adds confirmed sandbox checkout start support for the seeded primary offer plus pre-payment order bump.",
      "Issue #111 adds public-safe referral-click attribution evidence to checkout intent creation.",
      "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution.",
      "Issue #115 adds owner-gated review/reversal actions for commission evidence.",
      "Issue #117 records non-billing post-purchase upsell/downsell decisions from trusted checkout evidence.",
      "Issue #133 gates the checkout success CTA on trusted webhook state before opening the post-purchase path.",
    ],
    nextMilestone:
      "Add explicit post-purchase billing contracts and partner-facing reporting only after decision evidence and owner review boundaries stay stable.",
  },
  {
    id: "roadmap-products-access",
    title: "Products, downloads, courses, memberships, and subscriptions",
    status: "active",
    issue: 16,
    featureId: featureIdFor(16),
    group: "Products and access",
    summary:
      "Digital product records, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, fulfillment task evidence, protected content planning, access rules, and subscriptions.",
    publicEvidence: [
      "Tracked by issue #16.",
      "Issue #83 adds the first `/products/source-data` contract and `/products/indie-launch-library` preview scaffold.",
      "Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.",
      "Issue #139 adds `/admin/products` owner entitlement inspection and aggregate public redaction flags.",
      "Issue #141 adds customer-safe entitlement lookup from checkout intent evidence without buyer, Stripe, R2, metadata, or signed URL leaks.",
    ],
    nextMilestone:
      "Add signed download access only after customer lookup redaction, entitlement state, and private asset boundaries stay stable.",
  },
  {
    id: "roadmap-email-automation",
    title: "Email marketing, list growth, CRM-lite, and automations",
    status: "active",
    issue: 17,
    featureId: featureIdFor(17),
    group: "Growth system",
    summary:
      "Subscriber segments, live consent-backed opt-in capture, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.",
    publicEvidence: [
      "Tracked by issue #17.",
      "Issue #85 adds the first `/audience/source-data` contract and `/audience/indie-launch-waitlist` preview scaffold.",
      "Issue #103 adds `POST /api/audience/opt-in` with normalized subscriber, consent, tag, and draft sequence enrollment rows.",
      "Issue #137 adds `/admin/audience` owner subscriber inspection and aggregate public redaction flags.",
      "Codex project email in issue #10 is separate from publisher/customer email workflows.",
    ],
    nextMilestone:
      "Add unsubscribe-safe email delivery and CRM timeline notes without exposing private contact data publicly.",
  },
  {
    id: "roadmap-analytics-testing",
    title: "Analytics, A/B testing, and conversion tracking",
    status: "active",
    issue: 18,
    featureId: featureIdFor(18),
    group: "Optimization",
    summary:
      "Privacy-safe analytics event capture, session-idempotent funnel page-view beacons with deterministic variant and normalized source attribution evidence, dashboard-visible fixed-window aggregate source breakdowns, deterministic seeded experiment assignment, aggregate funnel conversion reports, attribution boundaries, and source-linked reporting.",
    publicEvidence: [
      "Tracked by issue #18.",
      "Issue #87 adds the first `/analytics/source-data` contract and `/analytics/indie-launch-dashboard` preview scaffold.",
      "Issue #105 adds `POST /api/analytics/events` with seeded event validation, idempotency, hashed request evidence, and aggregate-only source-data reporting.",
      "Issue #107 adds `POST /api/analytics/assignments` with seeded experiment validation, deterministic weighted variant assignment, hashed visitor evidence, and aggregate-only assignment reporting.",
      "Issue #119 adds aggregate funnel conversion report rows from captured test events without exposing raw analytics rows.",
      "Issue #121 adds browser-side funnel page-view beacons with server-side bot and preview suppression.",
      "Issue #123 attaches deterministic seeded assignment evidence to captured funnel page views and exposes aggregate variant counts.",
      "Issue #125 attaches normalized UTM/source attribution to captured funnel page views and exposes aggregate source counts.",
      "Issue #127 renders aggregate source attribution rows in the analytics dashboard preview.",
      "Issue #129 adds fixed all-time, 24-hour, 7-day, and 30-day aggregate source and conversion windows to source-data and the dashboard preview.",
    ],
    nextMilestone:
      "Add exportable aggregate reports and cohort comparison fixtures without exposing raw event rows.",
  },
  {
    id: "roadmap-affiliates-referrals",
    title: "Affiliate and referral management",
    status: "active",
    issue: 19,
    featureId: featureIdFor(19),
    group: "Growth system",
    summary:
      "Affiliate/referral contract, partner profiles, referral links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal actions, attribution boundaries, payout review, and fraud checks.",
    publicEvidence: [
      "Tracked by issue #19.",
      "Issue #89 adds the first `/affiliates/source-data` contract and `/affiliates/indie-launch-partners` preview scaffold.",
      "Issue #109 adds `POST /api/affiliates/clicks` with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.",
      "Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions.",
      "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution without making commissions payable.",
      "Issue #115 adds owner-gated review, hold, and reversal actions without creating payout state.",
    ],
    nextMilestone:
      "Add partner-facing reporting and payout batch preparation only after review/reversal state is stable.",
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
