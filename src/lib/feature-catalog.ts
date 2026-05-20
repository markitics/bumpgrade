export type FeatureStatus = "live" | "pending";

export type FeatureRecord = {
  id: string;
  title: string;
  group: string;
  status: FeatureStatus;
  issue: number;
  summary: string;
  audience: string;
  expectedCapabilities: string[];
  evidence: string[];
  agentContract: string;
};

export const featureCatalogUpdatedAt = "2026-05-20";

export const featureCatalog: FeatureRecord[] = [
  {
    id: "feature-cloudflare-foundation",
    title: "Launch app foundation",
    group: "Platform",
    status: "live",
    issue: 4,
    summary:
      "Core public routes, admin placeholders, screenshots, smoke coverage, and deployed paths for the first Bumpgrade launch surfaces.",
    audience: "Agents and Mark need a stable launch base with route proof instead of local-only setup.",
    expectedCapabilities: [
      "Live route for bumpgrade.com and www.bumpgrade.com.",
      "Persistent app state and cache bindings for launch surfaces.",
      "Responsive top navigation and shell routes.",
      "Playwright smoke coverage for desktop and mobile route rendering.",
    ],
    evidence: [
      "Issue #4 closed by PR #23.",
      "Deployment succeeded after DNS records were configured.",
    ],
    agentContract:
      "Agents can treat the app shell and route map as live, but not infer business functionality beyond the shell.",
  },
  {
    id: "feature-compare-source-data",
    title: "Comparison hub and source data",
    group: "SEO and agent discovery",
    status: "live",
    issue: 5,
    summary:
      "Public comparison hub, nine first-wave alternative pages, sitemap entries, llms.txt links, screenshots, and `/compare/source-data` JSON.",
    audience: "Prospects comparing platforms and agents resolving Bumpgrade competitor claims.",
    expectedCapabilities: [
      "Shopify-inspired `/compare` hub.",
      "Alternative pages for ClickFunnels, Kit, Shopify, SamCart, Kajabi, Podia, Systeme.io, Kartra, and ThriveCart.",
      "Official source URLs, retrieval date, confidence notes, and planned-feature caveats.",
      "Agent-readable JSON at `/compare/source-data`.",
    ],
    evidence: [
      "Issue #5 closed by PR #25.",
      "Live smoke checks returned HTTP 200 for comparison routes and screenshots.",
    ],
    agentContract:
      "Agents may cite comparison source IDs and URLs, but must refresh sources before making pricing or volatile feature-availability claims.",
  },
  {
    id: "feature-public-feature-catalog",
    title: "Public feature catalog and source data",
    group: "SEO and agent discovery",
    status: "live",
    issue: 6,
    summary:
      "Public `/features` surface with live and pending badges, stable feature IDs, GitHub issue links, screenshots, and `/features/source-data` JSON.",
    audience: "Prospects and agents who need to distinguish deployed Bumpgrade surfaces from roadmap targets.",
    expectedCapabilities: [
      "Live and pending feature badges.",
      "Feature records with stable IDs, groups, issues, evidence, and agent-contract notes.",
      "Agent-readable JSON at `/features/source-data`.",
      "Sitemap and llms.txt discovery.",
    ],
    evidence: [
      "Issue #6 closed by PR #26.",
      "Live smoke checks returned HTTP 200 for `/features`, `/features/source-data`, and screenshots.",
    ],
    agentContract:
      "Agents may treat live feature records as deployed and must treat pending records as roadmap targets until their issue evidence changes.",
  },
  {
    id: "feature-public-roadmap",
    title: "Public roadmap and source data",
    group: "Roadmap",
    status: "live",
    issue: 7,
    summary:
      "Public `/roadmap` surface with shipped, blocked, next, and planned lanes tied to feature IDs, GitHub issues, evidence, and `/roadmap/source-data` JSON.",
    audience: "Prospects, Mark, and agents who need public-safe project status without reading private admin notes.",
    expectedCapabilities: [
      "Roadmap lanes derived from tracked feature and issue records.",
      "Public-safe blocker notes and next milestones.",
      "Agent-readable JSON at `/roadmap/source-data`.",
      "Admin roadmap and For Mark placeholders that mirror current public-safe state until owner-backed records ship.",
    ],
    evidence: [
      "Issue #7 owns this feature slice.",
      "PR #27 carries the source, screenshots, validation, and deploy evidence for this issue.",
    ],
    agentContract:
      "Agents may cite public roadmap status from `/roadmap/source-data`, but must not expose private admin notes or treat planned items as live functionality.",
  },
  {
    id: "feature-funnel-builder",
    title: "Funnel and page builder",
    group: "Funnels and pages",
    status: "pending",
    issue: 14,
    summary:
      "Multi-step funnels, opt-in pages, sales pages, templates, publishing, and page state that agents can inspect safely.",
    audience: "Creators, coaches, agencies, and small publishers launching offers.",
    expectedCapabilities: [
      "Read-only seeded draft funnel source data and preview route from issue #79.",
      "Owner-gated D1 draft funnel seed/create scaffold from issue #91.",
      "Owner-gated draft step title, goal, kind, and order editing from issue #93.",
      "Owner-gated private D1 draft preview route from issue #95.",
      "Exact-confirmed public D1 draft publishing from issue #135.",
      "Read-only reusable funnel templates and block-template library from issue #159.",
      "Owner-confirmed template-to-draft creation from issue #161.",
      "Owner-confirmed checkout-offer linking on private draft steps from issue #163.",
      "Public sandbox checkout start rendering on published linked checkout blocks from issue #165.",
      "Webinar and resource funnel template/page-block contracts from issue #213.",
      "Funnel steps for opt-in, sales, checkout, upsell, webinar, resource, thank-you, and future nurture paths.",
      "Reusable template and block metadata for opt-ins, sales pages, checkout handoffs, webinars, resources, preview state, and publishing controls.",
      "Stable funnel, page, and revision IDs.",
      "Agent-safe draft proposals before public page changes.",
    ],
    evidence: [
      "Tracked by issue #14.",
      "Issue #79 adds `/funnels/source-data` and `/funnels/indie-launch-sandbox` as the first read-only contract and preview scaffold.",
      "Issue #91 adds `/admin/funnels`, `/api/admin/funnels/drafts`, and D1 draft/audit tables for owner-gated draft creation.",
      "Issue #93 adds owner-session step edit and reorder controls on top of D1 draft funnels.",
      "Issue #95 adds an owner-gated preview route for the current private D1 draft sequence.",
      "Issue #135 adds exact-confirmed publishing from D1 drafts to public `/funnels/{slug}` routes.",
      "Issue #159 adds reusable funnel templates and block-template library records to `/funnels/source-data` and the seeded preview route.",
      "Issue #161 lets verified owners create private D1 drafts from reusable templates after exact confirmation and idempotency.",
      "Issue #163 lets verified owners attach the seeded sandbox checkout offer to private draft checkout blocks after exact confirmation, idempotency, and a fresh revision check.",
      "Issue #165 lets published funnel routes render the existing sandbox checkout start panel when a checkout block carries owner-confirmed checkoutLink metadata.",
      "Issue #213 adds webinar/resource funnel templates, page-block metadata, admin step-kind options, and D1 step-kind storage readiness.",
    ],
    agentContract:
      "Agents may read reusable template, block-template, webinar/resource template, checkout-link, and public funnel checkout-start capability records from `/funnels/source-data`; owner sessions can seed, create from templates, update, reorder, link checkout offers, preview, and publish private draft funnel steps with confirmation and stale-state checks; published linked checkout blocks can render the sandbox checkout start surface, while future direct agent writes must require confirmation before creating drafts directly, editing creator-speech, linking billing-sensitive offers, scheduling webinars, delivering private resources, or publishing public funnel pages.",
  },
  {
    id: "feature-checkout-offers",
    title: "Checkout, order bumps, upsells, and downsells",
    group: "Checkout and offers",
    status: "pending",
    issue: 15,
    summary:
      "Stripe-backed checkout flows with offer ladders, bumps, one-click upsells, downsells, subscriptions, and audit trails.",
    audience: "Sellers who care about average order value, conversion rate, and billing safety.",
    expectedCapabilities: [
      "Read-only checkout offer source data and preview route from issue #81.",
      "Confirmed sandbox checkout start with the seeded primary offer and constrained order bump from issue #99.",
      "Optional referral-click attribution evidence on sandbox checkout intents from issue #111.",
      "Non-billing post-purchase upsell/downsell decision evidence from issue #117.",
      "Checkout success page CTA gated on trusted webhook state from issue #133.",
      "Checkout pages and embeddable checkout entry points.",
      "Order bumps, upsells, downsells, coupons, and subscription offers.",
      "Customer portal and billing-safe state transitions.",
      "Payment and offer change audit logs.",
    ],
    evidence: [
      "Tracked by issue #15.",
      "Stripe architecture tracked by issue #11.",
      "Issue #81 adds `/offers/source-data` and `/offers/indie-launch-stack` as the first read-only checkout-offer contract and preview scaffold.",
      "Issue #99 adds a confirmed sandbox checkout start panel and API support for the seeded pre-payment order bump.",
      "Issue #111 adds public-safe referral-click attribution evidence to checkout intent creation.",
      "Issue #117 adds a trusted post-purchase route and idempotent non-billing decision API for upsell/downsell follow-up evidence.",
      "Issue #133 makes the checkout success page wait for the redacted post-purchase contract before showing the upsell/downsell CTA.",
    ],
    agentContract:
      "Agents may read offer-stack and aggregate post-purchase decision evidence; billing-impacting, fulfillment, and commission-impacting writes require explicit confirmation, idempotency keys, stale-state checks, and redacted outputs.",
  },
  {
    id: "feature-products-access",
    title: "Products, downloads, courses, memberships, and subscriptions",
    group: "Products and access",
    status: "pending",
    issue: 16,
    summary:
      "Digital products, course structures, download delivery, membership access, fulfillment state, and recurring subscriptions.",
    audience: "Knowledge sellers, newsletter publishers, and digital-product businesses.",
    expectedCapabilities: [
      "Read-only product/access source data and preview route from issue #83.",
      "Sandbox webhook-backed entitlement row grants from issue #101.",
      "Owner-gated entitlement and fulfillment inspection from issue #139.",
      "Customer-safe checkout intent entitlement lookup from issue #141.",
      "One-use download tokens for active file entitlements from issue #143.",
      "Seeded private R2-backed fixture delivery through Bumpgrade from issue #146.",
      "Redemption-time current entitlement and trusted checkout state revalidation from issue #147.",
      "Owner-confirmed private product asset upload intent records from issue #151.",
      "Owner-visible non-destructive revocation intent readiness from issue #179.",
      "Protected content readiness records from issue #181.",
      "Checkout-intent-scoped protected fixture delivery from issue #185.",
      "Subscription-backed membership entitlement state from issue #187.",
      "Stable product, offer, asset, access rule, and subscription plan IDs.",
      "Downloads, protected content, courses, memberships, and bundles.",
      "Fulfillment status connected to checkout events.",
      "Public-safe product metadata for agent and SEO surfaces.",
    ],
    evidence: [
      "Tracked by issue #16.",
      "Issue #83 adds `/products/source-data` and `/products/indie-launch-library` as the first read-only product/access contract and preview scaffold.",
      "Issue #101 adds idempotent entitlement grants and fulfillment task evidence after paid sandbox checkout webhooks.",
      "Issue #139 adds `/admin/products` owner entitlement inspection and aggregate public redaction flags.",
      "Issue #141 adds `/products/entitlements` and `/api/products/entitlements` for customer-safe checkout intent entitlement lookup.",
      "Issue #143 adds one-use download tokens for active file entitlements without exposing private R2 keys or signed object URLs.",
      "Issue #146 streams a seeded private R2-backed fixture through Bumpgrade without exposing private object keys or signed URLs.",
      "Issue #147 rejects stale redemption when current entitlement or trusted checkout state is no longer eligible.",
      "Issue #151 creates owner-confirmed private product asset upload records without exposing object keys, signed URLs, upload bodies, or private metadata.",
      "Issue #179 adds owner-visible revocation intent readiness without destructive entitlement mutation.",
      "Issue #181 adds protected content readiness metadata without lesson, video, transcript, member post, or progress delivery.",
      "Issue #185 adds seeded protected fixture delivery after active-entitlement, product/template scope, and trusted checkout-state checks.",
      "Issue #187 syncs checkout-linked membership entitlement state from trusted Stripe Billing subscription webhooks.",
    ],
    agentContract:
      "Agents may read public product metadata, aggregate entitlement counts, customer-safe checkout intent entitlement lookup, short-lived private R2-backed download-token boundaries with redemption revalidation, owner-confirmed private asset upload intent boundaries, non-destructive revocation intent readiness, protected content readiness, checkout-scoped protected fixture delivery boundaries, subscription-backed membership access state, and entitlement grant boundaries; private customer identity, storage object keys, upload bodies, arbitrary protected bodies, destructive revocation, customer delivery of arbitrary uploads, Customer Portal actions, and billing data must stay behind authenticated contracts.",
  },
  {
    id: "feature-email-automation-crm",
    title: "Email marketing, list growth, automations, and CRM-lite",
    group: "Growth system",
    status: "pending",
    issue: 17,
    summary:
      "Forms, subscribers, tags, campaigns, automations, lifecycle events, and lightweight contact/opportunity tracking.",
    audience: "Creators and publishers turning audience attention into repeatable launch workflows.",
    expectedCapabilities: [
      "Audience automation source data and preview route from issue #85.",
      "Signup forms, lead magnets, subscriber tags, segments, and consent-backed opt-in capture from issue #103.",
      "Owner-gated subscriber, consent, tag, and draft enrollment inspection from issue #137.",
      "Public-safe unsubscribe and suppression evidence from issue #167.",
      "Owner-gated CRM timeline notes from issue #169.",
      "Suppression-aware broadcast draft readiness from issue #171.",
      "Owner-confirmed dry-run broadcast schedule intents from issue #173.",
      "Delivery queue readiness contracts from issue #177.",
      "Broadcast preview and unsubscribe-footer safety records from issue #175.",
      "Owner-confirmed delivery-batch dry runs from issue #183.",
      "Owner-confirmed dry-run queue-message evidence from issue #189.",
      "Owner-confirmed dispatch preflight dry runs from issue #191.",
      "Owner-confirmed dispatch attempt receipts from issue #197.",
      "Sender-domain readiness gates from issue #199.",
      "Provider-event readiness gates from issue #201.",
      "Provider rate-limit readiness gates from issue #203.",
      "Provider response readiness gates from issue #205.",
      "Send-payload readiness gates from issue #207.",
      "Queue producer readiness gates from issue #209.",
      "Queue consumer readiness gates from issue #211.",
      "Campaigns, sequences, broadcasts, and behavior-triggered automations.",
      "CRM-lite contact timelines and opportunity states.",
      "Consent, unsubscribe, and deliverability boundaries.",
    ],
    evidence: [
      "Tracked by issue #17.",
      "Issue #85 adds `/audience/source-data` and `/audience/indie-launch-waitlist` as the first read-only audience automation contract and preview scaffold.",
      "Issue #103 adds a public waitlist opt-in write path that stores normalized subscriber, consent, tag, and draft sequence enrollment evidence without sending email.",
      "Issue #137 adds `/admin/audience` owner inspection and aggregate public subscriber inspection redaction flags.",
      "Issue #167 adds a public-safe unsubscribe write path that records suppression evidence and marks known subscribers unsubscribed without revealing list membership.",
      "Issue #169 adds owner-only audience CRM timeline notes with aggregate public redaction.",
      "Issue #171 adds broadcast readiness counts that exclude unsubscribed, suppressed, and missing-consent rows without creating send queues.",
      "Issue #173 adds owner-confirmed dry-run broadcast schedule intents without recipient payloads, send queues, or provider message IDs.",
      "Issue #175 adds preview and unsubscribe-footer safety records without personalized bodies, send queues, or provider message IDs.",
      "Issue #177 adds delivery queue readiness metadata without queue producers, recipient payloads, or provider sends.",
      "Issue #183 adds delivery-batch dry runs without recipient payloads, queue messages, or provider sends.",
      "Issue #189 adds delivery queue message dry runs without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.",
      "Issue #191 adds dispatch preflight dry runs without Cloudflare Queue dispatch, recipient payloads, provider sends, or provider message IDs.",
      "Issue #197 adds dispatch attempt receipts without Cloudflare Queue producers, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #199 adds sender-domain readiness gates without private DNS credentials, Cloudflare Queue producers, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #201 adds provider-event readiness gates without provider secrets, raw provider payloads, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #203 adds provider rate-limit readiness gates without provider secrets, provider limit secrets, raw provider payloads, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #205 adds provider response readiness gates without provider secrets, raw response bodies, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #207 adds send-payload readiness gates without raw recipient identity, recipient payloads, personalized bodies, raw payload bodies, provider sends, provider responses, or provider message IDs.",
      "Issue #209 adds Queue producer readiness gates without enabling Cloudflare Queue producers, Queue messages, queue payload bodies, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Issue #211 adds Queue consumer readiness gates without enabling Cloudflare Queue consumers, Queue message consumption, acks, retry/dead-letter rows, queue payload body reads, recipient payloads, provider sends, provider responses, or provider message IDs.",
      "Codex project email tracked separately by issue #10.",
    ],
    agentContract:
      "Agents may read the public audience contract, aggregate subscriber, suppression, timeline, broadcast readiness, dry-run schedule intent, preview safety, queue readiness, delivery-batch, queue-message, dispatch-preflight, dispatch-attempt, sender-domain readiness, provider-event readiness, provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness, and Queue consumer readiness counts, opt-in write boundary, unsubscribe/suppression write boundary, owner-note contract metadata, owner schedule-intent metadata, owner delivery-batch metadata, owner queue-message metadata, owner dispatch-preflight metadata, and owner dispatch-attempt receipt metadata; direct public agent subscriber writes, imports, real sends, private exports, CRM automation, private DNS/provider setup, provider webhook processing, Cloudflare Queue dispatch, Queue producer execution, Queue consumer execution, queue payload bodies, recipient payloads, personalized bodies, provider responses, and provider delivery require future authenticated confirmed-write APIs with confirmation, audience scope, suppression checks, unsubscribe-safe checks, sender-domain safety, provider-event safety, provider rate-limit safety, provider response safety, send-payload safety, Queue producer safety, Queue consumer safety, queue safety, and provider limits.",
  },
  {
    id: "feature-analytics-testing",
    title: "Analytics, A/B testing, and conversion tracking",
    group: "Optimization",
    status: "pending",
    issue: 18,
    summary:
      "Conversion events, funnel analytics, checkout metrics, experiments, UTM tracking, and source-linked reporting.",
    audience: "Operators optimizing launch funnels, checkout offers, and audience acquisition.",
    expectedCapabilities: [
      "Analytics and experiment source data and preview route from issue #87.",
      "Privacy-safe event capture for seeded page views, opt-ins, checkout starts, purchases, bumps, upsells, refunds, and cancellations from issue #105.",
      "Deterministic seeded experiment assignment for page and offer variants from issue #107.",
      "Aggregate funnel conversion reporting from captured test events from issue #119.",
      "Browser-side seeded funnel page-view beacons with server-side bot/preview suppression from issue #121.",
      "Aggregate variant evidence attached to captured funnel page views from issue #123.",
      "Normalized UTM/source attribution attached to funnel page-view events from issue #125.",
      "Dashboard-visible aggregate source attribution rows from issue #127.",
      "Fixed all-time, 24-hour, 7-day, and 30-day aggregate source and conversion windows from issue #129.",
      "Agent-readable metric summaries with caveats for low sample sizes.",
    ],
    evidence: [
      "Tracked by issue #18.",
      "Issue #87 adds `/analytics/source-data` and `/analytics/indie-launch-dashboard` as the first read-only analytics and experiment contract.",
      "Issue #105 adds seeded event capture with idempotency, hashed request evidence, and aggregate-only source-data reporting.",
      "Issue #107 adds seeded experiment assignment with idempotency, hashed visitor evidence, and aggregate-only assignment reporting.",
      "Issue #119 adds aggregate funnel conversion report rows from captured test events without exposing raw analytics rows.",
      "Issue #121 adds a session-idempotent funnel page-view beacon with bot and preview suppression.",
      "Issue #123 attaches deterministic seeded assignment evidence to funnel page-view events and exposes aggregate variant counts.",
      "Issue #125 attaches normalized UTM/source attribution to funnel page-view events and exposes aggregate source counts.",
      "Issue #127 renders aggregate source attribution rows in the analytics dashboard preview.",
      "Issue #129 adds fixed time-window controls and public-safe source-data window metadata for aggregate source and conversion summaries.",
    ],
    agentContract:
      "Agents may read aggregate analytics, event capture boundaries, page-view beacon boundaries, dashboard-visible aggregate source attribution evidence, fixed-window aggregate source and conversion summaries, aggregate variant evidence, assignment boundaries, and funnel conversion report rows with sample-size caveats; direct agent analytics writes, custom events, contact analytics, raw referrer/query reporting, experiment routing, and automated decisions require future confirmed-write APIs.",
  },
  {
    id: "feature-affiliates-referrals",
    title: "Affiliate and referral management",
    group: "Growth system",
    status: "pending",
    issue: 19,
    summary:
      "Referral links, affiliate partners, commission rules, attribution, public-safe payout preparation, and partner performance reporting.",
    audience: "Publishers who grow through partners, creators, and audience referrals.",
    expectedCapabilities: [
      "Affiliate/referral source data and preview route from issue #89.",
      "Partner profiles, tracking links, and privacy-safe click capture from issue #109.",
      "Checkout attribution evidence that links eligible referral clicks to sandbox checkout intents from issue #111.",
      "Review-only commission ledger evidence from trusted checkout attribution from issue #113.",
      "Owner review, hold, and reversal actions for commission evidence from issue #115.",
      "Public-safe partner performance reports from issue #193.",
      "Read-only payout batch preparation and readiness checklists from issue #195.",
      "Commission and payout rules.",
      "Attribution reports tied to offers and checkout events.",
      "Fraud and self-referral review states.",
    ],
    evidence: [
      "Tracked by issue #19.",
      "Issue #89 adds `/affiliates/source-data` and `/affiliates/indie-launch-partners` as the first read-only affiliate/referral contract.",
      "Issue #109 adds seeded referral click capture with idempotency, hashed request evidence, and aggregate-only source-data reporting.",
      "Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions.",
      "Issue #113 creates non-payable commission ledger evidence from checkout attribution.",
      "Issue #115 adds owner-gated review/reversal actions without payout mutation.",
      "Issue #193 adds public-safe partner reports without exposing buyer, payout, tax, Stripe, raw click, raw checkout, or private actor data.",
      "Issue #195 adds read-only payout preparation without Stripe payouts, tax data, payout accounts, partner notifications, payable commission finalization, or direct agent writes.",
    ],
    agentContract:
      "Agents may read aggregate referral click counts, checkout attribution evidence, review-only commission ledger evidence, owner review action counts, public-safe partner reports, read-only payout preparation checklists, and write boundaries; buyer attribution finalization, payable commission writes, payout-impacting actions, direct agent review writes, private partner portals, fraud decisions, and tax or payout data require confirmation, audit correlation, and a clear rollback or dispute path.",
  },
  {
    id: "feature-admin-state",
    title: "Admin roadmap, work log, journeys, and for-Mark surfaces",
    group: "Admin and operations",
    status: "live",
    issue: 8,
    summary:
      "Owner-backed admin surfaces for roadmap status, work logs, user journeys, blockers, owner notes, and durable project memory.",
    audience: "Mark and future agents coordinating parallel work.",
    expectedCapabilities: [
      "Roadmap lanes with issue and PR links.",
      "Work-log entries for substantive work bursts and shipped features.",
      "User journeys tied to feature IDs and validation evidence.",
      "For-Mark attention items for non-blocking decisions and risks.",
    ],
    evidence: [
      "Issue #8 owns the D1 admin surface slice.",
      "Admin source-data routes and D1 append scripts are included with the issue #8 implementation.",
    ],
    agentContract:
      "Agents should write durable project state through approved scripts or APIs, never by inventing hidden chat-only status.",
  },
  {
    id: "feature-agent-ready-contracts",
    title: "Agent-ready docs, manifests, APIs, and MCP",
    group: "Developers and agents",
    status: "live",
    issue: 12,
    summary:
      "Public agent docs, `/agent-docs/source-data` manifest, source evidence resolution, read contracts, and MCP roadmap for repeated agent workflows.",
    audience: "Codex, ChatGPT, Claude, and other agents helping operate Bumpgrade or customer workspaces.",
    expectedCapabilities: [
      "Public `/agent-docs` pages and `llms.txt` discovery.",
      "Server-side manifest for feature, roadmap, comparison, commerce, admin, and agent-read contracts.",
      "MCP resource and tool roadmap for repeated reads and safe proposed writes.",
      "Confirmed-write contracts for public, destructive, billing, and creator-speech actions.",
    ],
    evidence: [
      "Tracked by issue #12.",
      "`/agent-docs/source-data` exposes public-safe docs, read contracts, source evidence routes, MCP plan, and write-safety boundaries.",
      "Comparison JSON shipped in issue #5 and commerce source data shipped in issues #11 and #34.",
    ],
    agentContract:
      "Agents must prefer documented APIs/manifests/MCP over browser automation when a server-side contract exists.",
  },
  {
    id: "feature-better-auth",
    title: "Publisher and admin authentication",
    group: "Accounts",
    status: "live",
    issue: 9,
    summary:
      "Better Auth-powered publisher and admin login with Cloudflare D1 storage, protected admin routes, and session-safe workflows.",
    audience: "Publishers, admins, and agents needing permission-aware access.",
    expectedCapabilities: [
      "Email/password auth flow.",
      "auth storage tables.",
      "Protected admin and publisher routes.",
      "Owner email verification with resend cooldown, Gmail handoff, and last-sent status.",
      "Role and permission model for future agent actions.",
    ],
    evidence: [
      "Issue #9 owns the Better Auth foundation slice.",
      "Admin pages now require an allowlisted Better Auth owner session; public-safe source-data routes remain readable.",
      "Issue #55 adds human owner verification copy, resend actions, and delivery status evidence.",
    ],
    agentContract:
      "Agents must not bypass auth or scrape private admin UI when authenticated APIs are the appropriate surface.",
  },
  {
    id: "feature-codex-email",
    title: "Codex project email and reply monitor",
    group: "Operations",
    status: "live",
    issue: 10,
    summary:
      "Cloudflare email sending/routing for `codex@bumpgrade.com`, shipped-feature notices, reply monitoring, and attachment-aware follow-up.",
    audience: "Mark and Codex sessions that need durable non-chat coordination.",
    expectedCapabilities: [
      "Outbound shipped-feature and attention emails from `codex@bumpgrade.com`.",
      "Inbound routing and reply detection.",
      "Attachment and inline-image visibility checks.",
      "D1/R2-backed evidence for outbound notices and inbound replies.",
    ],
    evidence: [
      "Tracked by issue #10.",
      "Cloudflare Email Routing for bumpgrade.com reports ready after required DNS records were installed.",
      "`codex_outbound_messages` and `codex_inbound_messages` persist notice and reply evidence.",
      "A delayed PR #40 notice returned delivered from codex@bumpgrade.com to m@rkmoriarty.com.",
      "Cloudflare routes codex@bumpgrade.com to Worker bumpgrade for inbound processing.",
      "Per-session plus addressing is deferred because Cloudflare reports subaddressing disabled for bumpgrade.com.",
    ],
    agentContract:
      "Agents should send shipped PR notices, poll trusted recent replies before unrelated large work, and keep private inbox bodies out of GitHub.",
  },
  {
    id: "feature-stripe-commerce",
    title: "Stripe payments and checkout architecture",
    group: "Payments",
    status: "live",
    issue: 11,
    summary:
      "Stripe SDK, mode-specific secret mapping, Checkout-first architecture, D1 commerce tables, optional referral-click attribution evidence, review-only commission ledger evidence, owner review/reversal actions, and billing-safe agent rules. No live customer checkout or payout flow is enabled yet.",
    audience: "Publishers selling products, courses, memberships, coaching, or services.",
    expectedCapabilities: [
      "Stripe-hosted Checkout Sessions as the first payment surface.",
      "D1 product, price, checkout-intent, subscription, webhook, and audit records.",
      "Optional referral-click attribution evidence attached to sandbox checkout intents from issue #111.",
      "Review-only commission ledger evidence calculated from checkout attribution from issue #113.",
      "Owner-gated review, hold, and reversal actions for commission evidence from issue #115.",
      "Webhook ingestion and event idempotency before fulfillment is trusted.",
      "Subscriptions, trials, upgrades, downgrades, and cancellations after the sandbox path works.",
      "Redacted payment metadata for admin and agent reads.",
    ],
    evidence: [
      "Tracked by issue #11.",
      "Issue #11 stores mode-specific Stripe values as Cloudflare secrets without repo secret values.",
      "`/commerce/source-data` exposes the redacted commerce contract.",
      "Issue #34 owns the first sandbox Checkout Session and webhook ingestion route.",
      "Issue #111 adds checkout referral attribution evidence without commissions or payout state.",
      "Issue #113 adds review-only commission ledger evidence without payout mutation.",
      "Issue #115 adds owner review/reversal actions without payout mutation.",
    ],
    agentContract:
      "Agents can read public-safe commerce contracts, referral attribution evidence, review-only commission ledger evidence, and owner action aggregates, but checkout, refund, subscription, payable commission, payout, direct agent review, and billing mutations require confirmed-write rules.",
  },
  {
    id: "feature-mobile-admin",
    title: "Publisher admin apps for iOS and Android",
    group: "Mobile",
    status: "pending",
    issue: 13,
    summary:
      "Shared mobile-admin contract and planned native iOS/Android app slices for monitoring launches, offers, work logs, and agent handoffs on mobile.",
    audience: "Publishers who run launches away from a desktop dashboard.",
    expectedCapabilities: [
      "Shared `/mobile-admin/source-data` contract for iOS and Android.",
      "Live `/mobile-admin/dashboard/source-data` digest for public-safe mobile dashboard reads from issue #153.",
      "Independently shippable iOS issue #67 and Android issue #68.",
      "iOS, Android, and Expo scaffolds render the live dashboard panel from issue #155.",
      "iOS, Android, and Expo scaffolds live-read the dashboard with fixture fallback from issue #157.",
      "Roadmap and notification-aware mobile admin flows.",
      "Offer, checkout, product, and customer summaries.",
      "Agent handoff and approval queues.",
      "Platform-specific smoke testing before claims of parity.",
    ],
    evidence: [
      "Tracked by issue #13.",
      "iOS app slice tracked by issue #67.",
      "Android app slice tracked by issue #68.",
      "Live dashboard source-data bridge tracked by issue #153.",
      "Mobile dashboard scaffold rendering tracked by issue #155.",
      "Mobile dashboard live hydration tracked by issue #157.",
      "`/mobile-admin/source-data` exposes jobs, API dependencies, stack decision, and confirmed-write boundaries.",
      "`/mobile-admin/dashboard/source-data` exposes a public-safe digest of feature, roadmap, work-log, attention, commerce, agent, and platform status for mobile clients.",
      "`/mobile-admin/ios/source-data` exposes the first iOS scaffold, fixture, simulator target, smoke command, and screenshot path.",
      "`/mobile-admin/android/source-data` exposes the first Android scaffold, fixture asset, emulator smoke command, and screenshot path.",
    ],
    agentContract:
      "Mobile apps can read the shared public-safe dashboard digest, but private mobile auth, push notifications, and confirmed writes must reuse web/admin contracts and the same audit rules as web admin actions.",
  },
  {
    id: "feature-resources-use-cases-pricing",
    title: "Use cases, resources, pricing, and blog surfaces",
    group: "Marketing surfaces",
    status: "live",
    issue: 20,
    summary:
      "Public use-case page, developer/agent page, resource and blog hub, pricing direction, and content source-data contract for search and agent discovery.",
    audience: "Prospects, search traffic, agents, and future customers evaluating Bumpgrade.",
    expectedCapabilities: [
      "Use cases for creators, coaches, course sellers, agencies, and publishers.",
      "Developer and agent pages backed by real contracts.",
      "Resources hub with comparison, migration, launch, product-note, and blog-index records.",
      "Pricing page that avoids invented plan details until packaging is set.",
      "Agent-readable `/content/source-data` records for personas, resources, and pricing caveats.",
    ],
    evidence: [
      "Tracked by issue #20.",
      "`/users`, `/developers-and-agents`, `/resources`, and `/pricing` are live navbar destinations.",
      "`/content/source-data` exposes stable audience, resource, and pricing-direction records.",
    ],
    agentContract:
      "Agents may read content surface records and draft resource copy, but public claims need source URLs or shipped-product evidence before publication.",
  },
];

export const featureGroups = Array.from(new Set(featureCatalog.map((feature) => feature.group)));

export function featuresByGroup(group: string) {
  return featureCatalog.filter((feature) => feature.group === group);
}
