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

export const roadmapUpdatedAt = "2026-05-25";

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
    description: "Tracked parity work with an issue, but not active yet.",
  },
];

const featureByIssue = new Map(featureCatalog.map((feature) => [feature.issue, feature]));

function featureIdFor(issue: number) {
  return featureByIssue.get(issue)?.id;
}

export const roadmapItems: RoadmapItem[] = [
  {
    id: "roadmap-cloudflare-foundation",
    title: "Launch app foundation",
    status: "shipped",
    issue: 4,
    featureId: featureIdFor(4),
    group: "Platform",
    summary: "Core public routes, admin shell, screenshots, and deployment path for the first Bumpgrade launch surfaces.",
    publicEvidence: ["PR #23 merged.", "Live route smoke checks recorded on PR #23."],
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
    summary: "Marketing feature hub with live and launch-preview badges, stable feature IDs, issue links, and `/features/source-data`.",
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
    nextMilestone: "Replace shared static records with owner-backed admin state in #8.",
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
    title: "Owner-backed admin roadmap, work log, journeys, and for-Mark surfaces",
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
    summary: "Better Auth email/password accounts, account sessions, API routes, login/signup UI, and owner-gated admin pages.",
    publicEvidence: [
      "Issue #9 owns the Better Auth foundation slice.",
      "Login/signup, D1 auth tables, Better Auth API routes, and owner-gated admin pages are included in the issue #9 implementation.",
      "Issue #55 adds owner verification resend UX and last-sent status for protected admin gates.",
      "Issue #53 documents phone verification and SMS provider options before any phone collection, SMS OTP, or SMS marketing exists.",
    ],
    nextMilestone:
      "Keep phone verification out of launch scope until a specific abuse, account-recovery, publisher-trust, or customer-communication need is recorded; if needed, build it through Better Auth with Cloudflare secrets, rate limits, and redaction.",
  },
  {
    id: "roadmap-paid-publisher-subdomains",
    title: "Paid publisher tenants and Bumpgrade subdomains",
    status: "shipped",
    issue: 222,
    featureId: featureIdFor(9),
    group: "Accounts and domains",
    summary:
      "Signed-in, email-confirmed publishers with an active paid plan entitlement can reserve a unique default `*.bumpgrade.com` subdomain backed by D1 tenant, reservation, and audit records.",
    publicEvidence: [
      "Issue #222 tracks the paid publisher tenant and default Bumpgrade subdomain slice.",
      "`/account/setup` is the signed-in publisher setup surface.",
      "`/account/source-data` exposes the public-safe tenant/subdomain contract.",
      "`POST /api/account/publisher/subdomain` reserves a unique Bumpgrade hostname only after email verification and active paid-plan entitlement.",
      "Better Auth is configured with the `https://*.bumpgrade.com` trusted origin pattern and `bumpgrade.com` cross-subdomain cookie domain in production.",
    ],
    nextMilestone:
      "Use the paid-gated account and default subdomain foundation as the base for custom-domain DNS onboarding, domain purchase, and publisher site auth.",
  },
  {
    id: "roadmap-custom-domain-onboarding",
    title: "Custom domain DNS onboarding and verification",
    status: "shipped",
    issue: 223,
    featureId: featureIdFor(9),
    group: "Accounts and domains",
    summary:
      "Paid publishers can add an existing custom domain, receive deterministic CNAME instructions, and re-check DNS verification state from account setup without exposing private DNS credentials.",
    publicEvidence: [
      "Issue #223 tracks the custom-domain DNS onboarding slice.",
      "PR #228 merged and deployed existing-domain DNS onboarding.",
      "`/account/setup` is the signed-in publisher setup surface for custom domains.",
      "`/account/source-data` exposes the public-safe custom-domain DNS contract.",
      "`POST /api/account/publisher/custom-domain` starts onboarding and re-checks DNS for paid, email-confirmed publishers with a default Bumpgrade hostname.",
      "Cloudflare Worker version `11dc5b0a-468a-44dd-9e8a-3e5769795076` deployed the route, screenshot asset, and wildcard route binding.",
    ],
    nextMilestone: "Add custom-domain auth semantics in issue #224, then domain purchase decisions in issue #225.",
  },
  {
    id: "roadmap-cross-subdomain-customer-auth",
    title: "Customer login across Bumpgrade-hosted publisher sites",
    status: "shipped",
    issue: 224,
    featureId: featureIdFor(9),
    group: "Accounts and domains",
    summary:
      "Bumpgrade-hosted publisher subdomains share the central Better Auth identity session while tenant access remains scoped per hostname, checkout, entitlement, and membership state.",
    publicEvidence: [
      "Issue #224 tracks the publisher-site auth boundary.",
      "PR #230 merged and deployed the cross-subdomain customer auth contract.",
      "`/account/source-data` exposes the Bumpgrade-subdomain session-sharing contract and custom-domain caveat.",
      "Production Better Auth uses the `bumpgrade.com` cookie domain and `https://*.bumpgrade.com` trusted origin pattern.",
      "Custom domains cannot receive the `bumpgrade.com` browser cookie directly, so they use a central Bumpgrade login handoff before returning to tenant-scoped access checks.",
      "Cloudflare Worker version `cd663146-20c5-4899-a43f-5faec8c720a5` deployed the account source-data and Better Auth boundary update.",
    ],
    nextMilestone: "Decide and expose the domain-purchase path in issue #225, then align pricing/signup copy in issue #226.",
  },
  {
    id: "roadmap-stripe-commerce",
    title: "Stripe payments and checkout architecture",
    status: "shipped",
    issue: 11,
    featureId: featureIdFor(11),
    group: "Payments",
    summary:
      "Stripe mode-specific secrets are stored in Cloudflare, Checkout Sessions are the first payment surface, and D1 commerce/audit tables now include optional referral-click attribution evidence, review-only commission ledger evidence, owner review/reversal actions, and read-only payout preparation before live payment or payout code.",
    publicEvidence: [
      "Issue #11 owns this Stripe architecture slice.",
      "Cloudflare now stores mode-specific Stripe secret names without repo secret values.",
      "D1 tables define products, prices, checkout intents, subscriptions, webhook idempotency, and payment audit events.",
      "Issue #34 owns the first sandbox checkout and webhook implementation.",
      "Issue #111 adds checkout referral attribution evidence without commission or payout mutation.",
      "Issue #113 creates review-only commission ledger evidence without payout mutation.",
      "Issue #115 adds owner-gated commission review, hold, and reversal actions without payout mutation.",
      "Issue #195 adds affiliate payout preparation as read-only readiness evidence without Stripe payouts.",
    ],
    nextMilestone:
      "Add private payout account, tax, and partner notification contracts only after read-only payout preparation stays stable.",
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
    issue: 414,
    featureId: featureIdFor(414),
    group: "Mobile",
    summary:
      "Current follow-up for installable private mobile admin parity after the completed read-only dashboard, Director workstream digest, iOS scaffold, Android scaffold, live-hydration, owner-session/confirmed-action contract, owner-gated private-row inspection, low-risk private-row workflow actions, owner-confirmed Director workstream reviews, owner-confirmed commerce-health reviews, owner-gated audit-only action-intent API, and push/distribution readiness-boundary slices.",
    publicEvidence: [
      "Current active follow-up tracked by issue #414.",
      "Original scaffold contract tracked by issue #13.",
      "iOS app slice tracked by issue #67.",
      "Android app slice tracked by issue #68.",
      "Live dashboard source-data slice tracked by issue #153.",
      "Mobile dashboard scaffold rendering tracked by issue #155.",
      "Mobile dashboard live network hydration tracked by issue #157.",
      "Issue #414 renders the owner-session and confirmed-action contract in the Expo, iOS, and Android app scaffolds while keeping production mobile mutations disabled.",
      "Issue #414 now adds owner-gated GET /api/mobile-admin/private-rows for read-only private mobile row inspection through the shared Better Auth owner session.",
      "Issue #428 now adds owner-gated POST /api/mobile-admin/private-rows/actions for low-risk private-row workflow actions with exact confirmation, idempotency, stale row revision, stale-state token, audit-correlation, and redaction checks.",
      "Issue #414 now adds owner-gated POST /api/mobile-admin/director-reviews for low-risk Director workstream acknowledgements with exact confirmation, idempotency, current Director generated-at checks, stale-state token, audit-correlation, and redaction checks.",
      "Issue #414 now adds owner-gated POST /api/mobile-admin/commerce-reviews for low-risk commerce-health acknowledgements with exact confirmation, idempotency, current commerce generated-at checks, stale-state token, audit-correlation, and redaction checks.",
      "Issue #414 now adds owner-gated POST /api/mobile-admin/actions for audit-only action intents with exact confirmation, idempotency, stale-state, contract revision, source-route, audit-correlation, and redaction checks.",
      "Issue #414 now exposes the public-safe Director workstream digest inside /mobile-admin/dashboard/source-data for mobile CEO-style nesting.",
      "Issue #414 now exposes a public-safe push-notification boundary for APNs/FCM requirements, disabled send status, blockers, and redaction flags.",
      "Issue #414 now exposes a public-safe distribution boundary that separates simulator/emulator proof from physical-device, App Store/TestFlight, and Play Store/internal-testing claims.",
      "`/mobile-admin/source-data` exposes the shared mobile contract, private-auth boundary, private-row API summary, private-row action API summary, Director review API summary, commerce review API summary, action-intent API summary, push boundary, distribution boundary, confirmed-action requirements, and no-installable-app caveat.",
      "`/mobile-admin/dashboard/source-data` exposes the public-safe dashboard digest plus the redacted Director workstream brief and redacted private-row, private-row action, Director review, commerce review, and action-intent summaries for mobile clients.",
      "`/mobile-admin/ios/source-data` exposes the iOS scaffold, fixture, simulator smoke command, owner-session contract, private-row API panel, private-row action API panel, Director review API panel, commerce review API panel, action-intent API panel, confirmed-action cards, and screenshot path.",
      "`/mobile-admin/android/source-data` exposes the Android scaffold, fixture asset, emulator smoke command, owner-session contract, private-row API panel, private-row action API panel, Director review API panel, commerce review API panel, action-intent API panel, confirmed-action cards, and screenshot path.",
    ],
    nextMilestone:
      "Add higher-risk billing, fulfillment, publishing, and other production confirmed-write APIs, physical-device proof, private APNs/FCM credential/device-token plumbing, and actual App Store/TestFlight or Play Store/internal-testing evidence without claiming parity early.",
  },
  {
    id: "roadmap-funnels",
    title: "Funnel and page builder MVP",
    status: "shipped",
    issue: 14,
    featureId: featureIdFor(14),
    group: "Funnels and pages",
    summary:
      "Multi-step funnel model, source-data contract, read-only seeded preview scaffold, owner-gated editable draft scaffold with step edit/reorder controls, granular block title/body editing, reusable block add/remove controls, owner-session within-step block reordering, owner-session cross-step block moves, owner-gated private preview, exact-confirmed public publishing, reusable template and block-template library records including webinar/resource page shapes, owner-confirmed template-to-draft creation, owner-confirmed private draft duplication, owner-confirmed checkout-offer linking on private draft steps, public sandbox checkout start rendering from published linked checkout blocks, owner-confirmed archive/unpublish lifecycle actions, owner-confirmed archived-draft purge with tombstone evidence, owner-confirmed resource delivery links to product/access catalog assets, funnel-scoped private download-token delivery from published linked resource blocks, owner-confirmed webinar event/replay links to public-safe external URLs, and safe draft proposals.",
    publicEvidence: [
      "Tracked by issue #14.",
      "Issue #79 adds the first `/funnels/source-data` contract and `/funnels/indie-launch-sandbox` preview scaffold.",
      "Issue #91 adds owner-gated `/admin/funnels`, `/api/admin/funnels/drafts`, and D1 draft/audit tables.",
      "Issue #93 adds owner-gated step title, goal, kind, and order editing on private D1 drafts.",
      "Issue #95 adds owner-gated private draft preview from current D1 draft state.",
      "Issue #135 adds exact-confirmed public publishing from D1 draft funnels to stable public `/funnels/{slug}` routes.",
      "Issue #159 adds reusable funnel templates and block-template library records to `/funnels/source-data` and the seeded preview route.",
      "Issue #161 adds owner-confirmed template-to-draft creation from reusable funnel templates.",
      "Issue #163 adds owner-confirmed checkout-offer linking to private draft checkout blocks.",
      "Issue #165 adds public sandbox checkout start rendering on published funnel checkout blocks with owner-confirmed checkout links.",
      "Issue #213 adds webinar and resource funnel template/block contracts plus D1 step-kind storage readiness.",
      "Issue #215 adds owner-confirmed private draft duplication with checkout-link metadata stripped by default.",
      "Issue #341 adds owner-confirmed archive/unpublish lifecycle actions that preserve audit evidence and remove published routes from source data.",
      "Issue #430 adds owner-session granular block title/body editing while preserving block IDs, kinds, ordered step structure, and checkout-link metadata.",
      "Issue #432 adds owner-session block add/remove controls from the reusable block library while refusing checkout-linked block removal.",
      "Issue #409 links owner-created product test checkout links to the seeded offer/funnel delivery gates without live billing or private fulfillment delivery.",
      "Issue #417 adds owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private download-token delivery from published linked resource blocks, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge with tombstone evidence, owner-session within-step block reordering, owner-session drag/drop block placement through existing move endpoints, owner-session cross-step block moves, and owner-session direct agent-safe private draft writes for block copy edits, resource-delivery linking, webinar-event linking, duplication, and archive/unpublish while tracking remaining freeform canvas styling, full webinar integrations, bulk purge policy, live fulfillment automation, arbitrary uploaded private asset delivery, direct agent-created delivery tokens, direct agent public publishing, direct agent checkout linking, and direct agent purge after the MVP closeout.",
    ],
    nextMilestone:
      "Keep freeform canvas layout styling, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, direct agent-created delivery tokens, direct agent public publishing, direct agent checkout linking, and direct agent purge in issue #417; keep live publisher-offer billing in issue #219.",
  },
  {
    id: "roadmap-advanced-funnel-builder-parity",
    title: "Advanced funnel editing, resource delivery, and agent-safe writes",
    status: "active",
    issue: 417,
    featureId: featureIdFor(14),
    group: "Funnels and pages",
    summary:
      "Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, bulk purge policy, and agent-safe writes; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, webinar event/replay links, archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and direct agent-safe private draft writes are now part of this bucket's shipped evidence.",
    publicEvidence: [
      "Issue #417 tracks the advanced funnel parity bucket after issue #14 MVP closeout.",
      "Issue #430 moves granular existing-block title/body editing into the owner-session builder while keeping direct agent block edits pending.",
      "Issue #432 moves reusable block add/remove controls into the owner-session builder while keeping direct agent block structure edits pending.",
      "Issue #417 adds owner-confirmed checkout unlinking from private draft blocks while preserving block IDs, kinds, title/body copy, step order, and audit evidence.",
      "Issue #417 adds owner-confirmed resource delivery links from private draft resource/delivery blocks to public-safe product/access catalog assets without private R2 keys, signed URLs, buyer records, arbitrary uploaded asset delivery, or live fulfillment automation.",
      "Issue #417 adds funnel-scoped private download-token delivery from published linked resource blocks after checkout intent, entitlement, product, and file asset scope match.",
      "Issue #417 adds owner-confirmed webinar event/replay links from private draft webinar blocks to public-safe external URLs without provider secrets, attendance tracking, reminder automation, or replay hosting.",
      "Issue #417 adds owner-session within-step block reordering while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, step membership, and audit evidence.",
      "Issue #417 adds owner-session drag/drop block placement in /admin/funnels by replaying the existing block reorder and cross-step move endpoint modes with fresh revisions.",
      "Issue #417 adds owner-session cross-step block moves while preserving block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, and audit evidence.",
      "Issue #417 adds owner-session direct agent-safe private draft writes through /api/agent/funnels/draft-writes for block copy edits, resource-delivery linking, webinar-event linking, private duplication, and archive/unpublish after exact confirmation, idempotency, current revision checks, and audit correlation.",
      "Issue #14 remains the shipped MVP covering D1 draft funnels, owner-gated edits, private preview, exact-confirmed publishing, duplication, archive/unpublish, templates, source-data, and public semantic routes.",
      "Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.",
    ],
    nextMilestone:
      "Design freeform canvas layout styling, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, bulk purge policy, direct agent-created delivery tokens, direct agent public publishing, direct agent checkout linking, and direct agent purge as one coherent post-MVP workflow instead of more single-gate readiness slices.",
  },
  {
    id: "roadmap-checkout-offers",
    title: "Checkout, order bump, upsell, and downsell MVP",
    status: "shipped",
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
      "Issue #165 renders the existing sandbox checkout start surface from published linked funnel checkout blocks.",
    ],
    nextMilestone:
      "Keep live publisher-offer billing separated in issue #219 until the first live package, amount, and webhook secret are confirmed; one-click post-purchase charging and fulfillment remain future confirmed-write work.",
  },
  {
    id: "roadmap-live-publisher-offer-billing",
    title: "Live publisher-offer checkout and webhook rollout",
    status: "planned",
    issue: 219,
    featureId: featureIdFor(15),
    group: "Checkout and offers",
    summary:
      "Pending live-mode publisher-offer billing after the first package, amount, Stripe Price policy, and live webhook secret are confirmed. Bumpgrade account-plan self-serve checkout remains separate.",
    publicEvidence: [
      "Issue #219 tracks the live publisher-offer billing decision and rollout.",
      "Production publisher-offer checkout remains sandbox-only until the first live package, amount, live Stripe Price policy, and live webhook secret are confirmed.",
      "`/pricing` self-serve Bumpgrade subscription checkout is separate from customer-facing publisher-offer billing.",
    ],
    nextMilestone:
      "Confirm the first live publisher package/amount and STRIPE_WEBHOOK_SECRET_LIVE, then add live-mode checkout and signed webhook proof without exposing provider IDs.",
  },
  {
    id: "roadmap-products-access",
    title: "Products, downloads, courses, memberships, and subscriptions",
    status: "shipped",
    issue: 16,
    featureId: featureIdFor(16),
    group: "Products and access",
    summary:
      "Digital product records, seeded payment-plan read records, owner-created product test checkout links, owner product delivery-gate links, product/access source data, sandbox webhook-backed entitlement grants, owner entitlement inspection, customer entitlement lookup, private R2-backed fixture delivery with redemption revalidation, owner-confirmed private asset upload intents, owner-confirmed non-destructive revocation intents, protected content readiness, checkout-intent-scoped protected fixture delivery, subscription-backed membership access, fulfillment task evidence, access rules, and subscriptions.",
    publicEvidence: [
      "Tracked by issue #16.",
      "Issue #83 adds the first `/products/source-data` contract and `/products/indie-launch-library` preview scaffold.",
      "Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.",
      "Issue #139 adds `/admin/products` owner entitlement inspection and aggregate public redaction flags.",
      "Issue #141 adds `/products/entitlements` and `/api/products/entitlements` for customer-safe checkout intent entitlement lookup.",
      "Issue #143 adds one-use download tokens for active file entitlements without exposing private R2 keys or signed object URLs.",
      "Issue #146 adds a seeded private R2-backed fixture delivery path through one-use Bumpgrade tokens.",
      "Issue #147 revalidates current entitlement status, checkout intent linkage, trusted checkout state, and asset scope before token redemption.",
      "Issue #151 adds owner-confirmed private product asset upload records backed by PRODUCT_ASSETS without exposing object keys, signed URLs, upload bodies, or private metadata.",
      "Issue #179 adds owner-visible revocation intent readiness without destructive entitlement mutation.",
      "Issue #181 adds protected content readiness metadata.",
      "Issue #185 adds protected fixture delivery only after entitlement, product/template scope, and trusted checkout-state checks.",
      "Issue #187 syncs checkout-linked membership access from trusted Stripe Billing subscription state.",
      "Issue #251 adds owner-confirmed non-destructive revocation intent records with exact confirmation, idempotency, stale-state checks, and public redaction.",
      "Issue #403 adds owner-confirmed draft product creation records without Stripe product/price creation or fulfillment mutation.",
      "Issue #405 adds owner-confirmed test offer/funnel links and direct test access grants for owner-created products.",
      "Issue #407 adds owner-confirmed buyer-facing test checkout links and public test checkout completion for owner-created products without Stripe Checkout Sessions, live charges, or public buyer exposure.",
      "Issue #409 links owner-created product test checkout links to the seeded offer/funnel delivery gates with stale-state checks and aggregate public redaction.",
      "Issue #16 exposes seeded pay-in-full, installment, and subscription payment-plan read records without live amounts, Stripe Price creation, Checkout Sessions, or customer data exposure.",
      "Issue #16 is ready to close after PR #412 merged, deployed, and verified product payment-plan readiness.",
    ],
    nextMilestone:
      "Keep live product payment-plan checkout, Stripe Price creation, first package/amount selection, webhook-secret confirmation, Customer Portal actions, and live fulfillment tracked separately in issue #219.",
  },
  {
    id: "roadmap-email-automation",
    title: "Email marketing, list growth, CRM-lite, and automations",
    status: "shipped",
    issue: 17,
    featureId: featureIdFor(17),
    group: "Growth system",
    summary:
      "Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, aggregate sequence delivery readiness, dry-run sequence schedule intents, dry-run sequence delivery batches, dry-run sequence queue-message evidence, dry-run sequence dispatch preflight evidence, dry-run sequence dispatch attempt receipts, owner-reviewed sequence Queue producer readiness gates, owner-reviewed sequence Queue consumer readiness gates, owner-reviewed sequence provider-call readiness gates, owner-reviewed sequence delivery-attempt readiness gates, owner-reviewed sequence delivery-result readiness gates, owner-reviewed sequence delivery-status webhook readiness gates, owner-reviewed sequence provider-polling readiness gates, owner-reviewed sequence receipt-payload readiness gates, owner-only sequence test sends, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, queue readiness contracts, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, owner-only broadcast test sends, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, provider-call readiness gates, delivery-attempt readiness gates, delivery-result readiness gates, delivery-status webhook readiness gates, provider-polling readiness gates, receipt-payload readiness gates, owner-confirmed import intents, owner-confirmed import preflights, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.",
    publicEvidence: [
      "Tracked by issue #17.",
      "Issue #85 adds the first `/audience/source-data` contract and `/audience/indie-launch-waitlist` preview scaffold.",
      "Issue #103 adds `POST /api/audience/opt-in` with normalized subscriber, consent, tag, and draft sequence enrollment rows.",
      "Issue #137 adds `/admin/audience` owner subscriber inspection and aggregate public redaction flags.",
      "Issue #167 adds `POST /api/audience/unsubscribe` with idempotent unsubscribe/suppression evidence and no list-membership leak.",
      "Issue #169 adds owner-gated private audience CRM timeline notes with aggregate public redaction.",
      "Issue #171 adds suppression-aware broadcast draft readiness without send queues or provider message IDs.",
      "Issue #173 adds owner-confirmed dry-run broadcast schedule intents without recipient payloads, send queues, or provider message IDs.",
      "Issue #175 adds broadcast preview and unsubscribe-footer safety records without personalized bodies, send queues, or provider message IDs.",
      "Issue #177 adds broadcast delivery queue readiness contracts without live queue producers or provider sends.",
      "Issue #183 adds broadcast delivery-batch dry runs without recipient payloads, queue messages, or provider sends.",
      "Issue #189 adds dry-run delivery queue message evidence without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.",
      "Issue #191 adds dispatch preflight dry runs without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.",
      "Issue #197 adds dispatch attempt receipts without Cloudflare Queue producers, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #199 adds sender-domain readiness gates without private DNS credentials, Cloudflare Queue producers, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #201 adds provider-event readiness gates without provider secrets, raw provider payloads, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #203 adds provider rate-limit readiness gates without provider secrets, provider limit secrets, raw provider payloads, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #205 adds provider response readiness gates without provider secrets, raw response bodies, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #207 adds send-payload readiness gates without raw recipient identity, recipient payloads, personalized bodies, raw payload bodies, provider sends, provider responses, or provider message IDs.",
      "Issue #209 adds Queue producer readiness gates without enabling Cloudflare Queue producers, Queue messages, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #211 adds Queue consumer readiness gates without enabling Cloudflare Queue consumers, Queue message consumption, acks, retry/dead-letter rows, queue payload body reads, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #253 adds owner-confirmed import intent records without creating contacts, storing raw rows/emails, enrolling sequences, or sending email.",
      "Issue #259 adds owner-confirmed import preflight evidence without creating contacts, storing raw rows/emails, creating subscriber rows, exporting private data, enrolling sequences, or sending email.",
      "Issue #347 adds aggregate audience export readiness without creating export files, exposing raw emails, subscriber IDs, or export URLs.",
      "Issue #351 adds aggregate sequence delivery readiness without scheduling steps, creating recipient payloads, personalized bodies, unsubscribe URLs, queue payloads, provider sends, or provider message IDs.",
      "Issue #354 adds owner-confirmed dry-run sequence schedule intents without delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, or provider message IDs.",
      "Issue #358 adds owner-confirmed dry-run sequence delivery batches without delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, or provider message IDs.",
      "Issue #360 adds owner-confirmed dry-run sequence queue-message evidence without Cloudflare Queue messages, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
      "Issue #362 adds owner-confirmed dry-run sequence dispatch preflight evidence without Cloudflare Queue dispatch, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
      "Issue #364 adds owner-confirmed dry-run sequence dispatch attempt receipts without Cloudflare Queue dispatch, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
      "Issue #366 adds owner-reviewed sequence Queue producer readiness gates without enabling Cloudflare Queue producers, Queue messages, queue payload bodies, delivery queue rows, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
      "Issue #368 adds owner-reviewed sequence Queue consumer readiness gates without enabling Cloudflare Queue consumers, Queue message consumption, acks, retry/dead-letter rows, queue payload body reads, queue payload body creation, recipient payloads, personalized bodies, unsubscribe URLs, provider sends, provider responses, or provider message IDs.",
      "Issue #370 adds owner-reviewed sequence provider-call readiness gates without making provider calls, sending messages, creating provider responses or message IDs, creating delivery attempts or results, processing webhooks, creating receipts, consuming or acking Queue messages, reading queue payload bodies, creating recipient payloads, personalized bodies, or unsubscribe URLs.",
      "Issue #372 adds owner-reviewed sequence delivery-attempt readiness gates without making provider calls, sending messages, creating provider responses or message IDs, creating delivery attempts or results, processing webhooks, creating receipts, consuming or acking Queue messages, reading queue payload bodies, creating recipient payloads, personalized bodies, or unsubscribe URLs.",
      "Issue #374 adds owner-reviewed sequence delivery-result readiness gates without making provider calls, sending messages, creating provider responses or message IDs, creating delivery attempts or results, processing webhooks, creating receipts, consuming or acking Queue messages, reading queue payload bodies, creating recipient payloads, personalized bodies, or unsubscribe URLs.",
      "Issue #376 adds owner-reviewed sequence delivery-status webhook readiness gates without making provider calls, sending messages, creating provider responses or message IDs, creating delivery attempts or results, processing status webhooks, reading webhook payloads, polling providers, creating receipt payloads or receipts, consuming or acking Queue messages, reading queue payload bodies, creating recipient payloads, personalized bodies, or unsubscribe URLs.",
      "Issue #378 adds owner-reviewed sequence provider-polling readiness gates without making provider calls, sending messages, creating provider responses or message IDs, creating delivery attempts or results, processing status webhooks, reading webhook or polling payloads, polling providers, creating polling results, receipt payloads, or receipts, consuming or acking Queue messages, reading queue payload bodies, creating recipient payloads, personalized bodies, or unsubscribe URLs.",
      "Issue #380 adds owner-reviewed sequence receipt-payload readiness gates without making provider calls, sending messages, creating provider responses or message IDs, creating delivery attempts or results, processing status webhooks, reading webhook or polling payloads, polling providers, creating polling results, receipt payloads, or delivery receipts, consuming or acking Queue messages, reading queue payload bodies, creating recipient payloads, personalized bodies, or unsubscribe URLs.",
      "Issue #420 adds owner-only sequence and broadcast test sends with exact confirmation, idempotency, audit correlation, stale-state checks, recipient/actor hash storage, and redaction before subscriber delivery exists.",
      "Issue #420 tracks subscriber email delivery, automation execution, and direct agent-safe write parity as one pending post-MVP execution bucket.",
      "Codex project email in issue #10 is separate from publisher/customer email workflows.",
    ],
    nextMilestone:
      "Keep live sender/provider configuration, Queue producer/consumer execution, recipient payloads, provider calls, delivery results, webhooks, imports, exports, and agent-safe write tools in issue #420 instead of reopening more isolated readiness-gate slices.",
  },
  {
    id: "roadmap-live-email-delivery-execution",
    title: "Live email delivery, automation execution, and agent-safe writes",
    status: "planned",
    issue: 420,
    featureId: featureIdFor(17),
    group: "Growth system",
    summary:
      "Pending post-MVP execution bucket for owner-only sequence and broadcast test sends, sender/domain/provider setup, Cloudflare Queue producer and consumer execution, recipient payload generation, provider calls, delivery attempts, results, webhooks, polling, receipts, live imports, exports, automation execution, and direct agent-safe write APIs.",
    publicEvidence: [
      "Tracked by issue #420.",
      "Issue #17 remains the shipped email automation MVP for consent-backed opt-ins, unsubscribe/suppression, owner subscriber inspection, CRM-lite notes, dry-run broadcast and sequence readiness, and source-data contracts.",
      "The first #420 slices add owner-only sequence and broadcast test sends without subscriber delivery, Queue messages, recipient payloads, provider message IDs, or public agent sends.",
      "The issue #17 closeout deliberately stops creating more single-gate proof slices unless they directly unlock live execution.",
    ],
    nextMilestone:
      "Design and ship the real broadcast and sequence execution path as one coherent workflow with consent, suppression, unsubscribe, sender-domain, provider, Queue, idempotency, audit, redaction, retry, dead-letter, webhook, receipt, and confirmed-write checks.",
  },
  {
    id: "roadmap-analytics-testing",
    title: "Analytics, A/B testing, and conversion tracking",
    status: "shipped",
    issue: 18,
    featureId: featureIdFor(18),
    group: "Optimization",
    summary:
      "Privacy-safe analytics event capture, session-idempotent funnel page-view beacons with deterministic variant and normalized source attribution evidence, dashboard-visible fixed-window aggregate source breakdowns, deterministic seeded experiment assignment, aggregate funnel conversion reports, aggregate report exports, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflights, owner-reviewed provider/domain readiness records, owner-reviewed content/consent readiness records, owner-reviewed send-payload readiness records, owner-reviewed queue-producer readiness records, owner-reviewed queue-consumer readiness records, owner-reviewed provider-call readiness records, owner-reviewed delivery-attempt readiness records, owner-reviewed delivery-result readiness records, owner-reviewed delivery-status-webhook readiness records, owner-reviewed provider-polling readiness records, owner-reviewed receipt-payload readiness records, owner-reviewed delivery-receipt readiness records, owner-reviewed provider-status reconciliation readiness records, owner-confirmed experiment decision evidence, attribution boundaries, and source-linked reporting.",
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
      "Issue #261 adds owner-confirmed experiment decision evidence without routing traffic, assigning cookies, selecting automated winners, exposing raw event rows, or exposing raw assignment rows.",
      "Issue #263 adds aggregate report export metadata and fixture cohort comparison definitions without raw analytics exports.",
      "Issue #265 adds owner-reviewed cohort comparison evidence without raw analytics exports, automated winners, or revenue claims.",
      "Issue #267 adds owner-reviewed alert threshold and anomaly-review evidence without automated alerts, traffic routing, automated winners, or revenue claims.",
      "Issue #269 adds owner-reviewed notification delivery readiness evidence without alert sends, inbox writes, traffic routing, automated winners, or revenue claims.",
      "Issue #271 adds owner-confirmed notification inbox records without owner email sends, queue dispatch, customer alerts, recipients, email bodies, traffic routing, automated winners, or revenue claims.",
      "Issue #284 adds owner-confirmed notification dispatch preflights without owner email sends, provider calls, queue dispatch, customer alerts, recipients, email bodies, provider message IDs, queue payloads, traffic routing, automated winners, or revenue claims.",
      "Issue #286 adds owner-reviewed provider/domain readiness records without provider configuration, provider secrets, sender credentials, private DNS credentials, provider sends, provider calls, queue dispatch, customer alerts, recipients, email bodies, provider message IDs, queue payloads, traffic routing, automated winners, or revenue claims.",
      "Issue #288 adds owner-reviewed content/consent readiness records without body templates, unsubscribe URLs, owner email sends, provider sends, provider calls, queue dispatch, customer alerts, recipients, email bodies, provider message IDs, queue payloads, traffic routing, automated winners, or revenue claims.",
      "Issue #290 adds owner-reviewed send-payload readiness records without creating recipient payloads, personalized bodies, raw payload bodies, queue messages, provider responses, owner email sends, provider sends, provider calls, queue dispatch, customer alerts, recipients, email bodies, provider message IDs, queue payloads, traffic routing, automated winners, or revenue claims.",
      "Issue #292 adds owner-reviewed queue-producer readiness records without enabling Queue producers, creating queue messages or queue payload bodies, dispatching queues, calling providers, creating provider responses, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #294 adds owner-reviewed queue-consumer readiness records without enabling Queue consumers, consuming or acknowledging Queue messages, creating retry/dead-letter rows, reading queue payload bodies, calling providers, creating provider responses, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #297 adds owner-reviewed provider-call readiness records without enabling provider sends or calls, configuring providers, storing provider secrets or sender credentials, creating provider responses, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #299 adds owner-reviewed delivery-attempt readiness records without enabling provider sends or calls, attempting delivery, configuring providers, storing provider secrets or sender credentials, creating provider responses, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #301 adds owner-reviewed delivery-result readiness records without enabling provider sends or calls, attempting delivery, creating delivery results, processing status webhooks, polling providers, configuring providers, storing provider secrets or sender credentials, creating provider responses, exposing provider message IDs, creating delivery receipts, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #303 adds owner-reviewed delivery-status-webhook readiness records without enabling provider sends or calls, attempting delivery, creating delivery results, processing delivery-status webhooks, polling providers, configuring providers, storing provider secrets or sender credentials, creating provider responses, exposing provider message IDs, creating delivery receipts, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #305 adds owner-reviewed provider-polling readiness records without enabling provider sends or calls, attempting delivery, processing delivery-status webhooks, polling providers, creating delivery receipts, configuring providers, storing provider secrets or sender credentials, creating provider responses, exposing provider message IDs, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #307 adds owner-reviewed receipt-payload readiness records without enabling provider sends or calls, attempting delivery, polling providers, processing status webhooks, creating delivery receipts, exposing receipt payloads, configuring providers, storing provider secrets or sender credentials, creating provider responses, exposing provider message IDs, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #309 adds owner-reviewed delivery-receipt readiness records without enabling provider sends or calls, attempting delivery, polling providers, processing status webhooks, creating delivery receipts, exposing receipt payloads, configuring providers, storing provider secrets or sender credentials, creating provider responses, exposing provider message IDs, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #311 adds owner-reviewed provider-status reconciliation readiness records without enabling provider sends or calls, attempting delivery, polling providers, processing status webhooks, processing delivery receipts, reconciling provider statuses, exposing receipt payloads, configuring providers, storing provider secrets or sender credentials, creating provider responses, exposing provider message IDs, sending owner email, exposing recipients, or making revenue claims.",
      "Issue #422 routes the sandbox opt-in hero copy through seeded session assignment with a baseline holdout and without cookies, and tracks the remaining live analytics automation, custom routing rules, winner selection, notification execution, and direct agent-safe write parity as one post-MVP execution bucket.",
    ],
    nextMilestone:
      "Keep custom analytics schemas, custom routing rules, winner selection, notification execution, Queue producer/consumer execution, provider calls, delivery results, raw exports, and agent-safe write tools in issue #422 instead of reopening more isolated readiness-gate slices.",
  },
  {
    id: "roadmap-live-analytics-execution",
    title: "Live analytics automation, experiment routing, notification execution, and agent-safe writes",
    status: "active",
    issue: 422,
    featureId: featureIdFor(18),
    group: "Optimization",
    summary:
      "Active post-MVP execution bucket for custom/non-seeded analytics event schemas, custom routing rules, winner selection, rollback and audit logs, automated alert/notification execution, Cloudflare Queue producer and consumer execution, provider calls, delivery attempts, results, webhooks, polling, receipts, raw/private exports, and direct agent-safe analytics write APIs. Seeded sandbox funnel copy routing with a baseline holdout is now live through the existing assignment API.",
    publicEvidence: [
      "Issue #422 tracks this pending post-MVP execution bucket.",
      "Issue #18 remains the shipped analytics MVP for privacy-safe events, deterministic assignments, aggregate conversion reporting, fixed-window attribution, owner decision evidence, aggregate exports, and notification readiness proof.",
      "Seeded sandbox funnel copy routing now uses the same deterministic assignment API and session-scoped anonymous key as the page-view beacon, with a 10% baseline holdout.",
      "The issue #18 closeout deliberately stops creating more single-gate proof slices unless they directly unlock live execution.",
    ],
    nextMilestone:
      "Continue the remaining analytics execution work as one coherent workflow with privacy review, idempotency, audit correlation, stale-state checks, redaction, Queue/provider safety, rollback, sample-size caveats, and confirmed-write checks.",
  },
  {
    id: "roadmap-affiliates-referrals",
    title: "Affiliate and referral management",
    status: "shipped",
    issue: 19,
    featureId: featureIdFor(19),
    group: "Growth system",
    summary:
      "Affiliate/referral MVP contract, partner profiles, referral links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, owner-reviewed notification provider readiness records, attribution boundaries, payout review, and fraud review proof.",
    publicEvidence: [
      "Tracked by issue #19.",
      "Issue #89 adds the first `/affiliates/source-data` contract and `/affiliates/indie-launch-partners` preview scaffold.",
      "Issue #109 adds `POST /api/affiliates/clicks` with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.",
      "Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions.",
      "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution without making commissions payable.",
      "Issue #115 adds owner-gated review, hold, and reversal actions without creating payout state.",
      "Issue #193 adds public-safe partner reports without exposing buyer, payout, tax, Stripe, raw click, raw checkout, or private actor data.",
      "Issue #195 adds read-only payout preparation without Stripe payouts, payout account storage, tax collection, partner notifications, payable commission finalization, or direct agent writes.",
      "Issue #273 adds owner-confirmed payout preparation records without payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger rows, fraud enforcement, or direct agent writes.",
      "Issue #275 adds owner-reviewed fraud review records without fraud enforcement, payable commission state, Stripe payouts, payout account storage, tax collection, partner notifications, buyer data, raw ledger/click/checkout rows, private fraud signals, or direct agent writes.",
      "Issue #277 adds owner-reviewed partner notification readiness records without partner sends, provider calls, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.",
      "Issue #279 adds owner-reviewed partner notification send preflight records without partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.",
      "Issue #281 adds owner-reviewed notification provider readiness records without provider configuration, provider secrets, sender credentials, partner sends, provider-send enablement, provider calls, send payloads, queue dispatch, recipient emails, message bodies, provider message IDs, fraud enforcement, payable commission state, Stripe payouts, payout accounts, tax data, buyer data, raw rows, private fraud signals, or direct agent writes.",
      "Issue #424 tracks live payout execution, partner notifications, fraud enforcement, private payout/tax data, private partner portals, and direct agent-safe write parity as one pending post-MVP execution bucket.",
    ],
    nextMilestone:
      "Keep payable commissions, Stripe payout execution, partner notification sends, provider configuration, private payout/tax data, fraud enforcement, private partner portals, and agent-safe write tools in issue #424 instead of reopening more isolated readiness-gate slices.",
  },
  {
    id: "roadmap-live-affiliate-execution",
    title: "Live affiliate payout execution, partner notifications, fraud enforcement, and agent-safe writes",
    status: "planned",
    issue: 424,
    featureId: featureIdFor(19),
    group: "Growth system",
    summary:
      "Pending post-MVP execution bucket for payable commission finalization, private payout account and tax boundaries, Stripe payouts/transfers/reversals/receipts/reconciliation, partner notification execution, provider configuration and sends, fraud enforcement, private partner portals, partner statements, buyer attribution finalization, and direct agent-safe affiliate/referral write APIs.",
    publicEvidence: [
      "Issue #424 tracks this pending post-MVP execution bucket.",
      "Issue #19 remains the shipped affiliate/referral MVP for source data, partner links, privacy-safe clicks, checkout attribution, review-only commission evidence, owner review/reversal, public-safe partner reports, payout preparation, fraud review records, and partner notification readiness/preflight/provider-readiness proof.",
      "The issue #19 closeout deliberately stops creating more single-gate proof slices unless they directly unlock live payout, notification, fraud, private portal, or agent-write execution.",
    ],
    nextMilestone:
      "Design and ship live affiliate execution as one coherent workflow with payout safety, tax/private-data boundaries, idempotency, audit correlation, stale-state checks, redaction, refund-window checks, provider/payment safety, fraud-review safety, rollback/dispute paths, and confirmed-write checks.",
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
