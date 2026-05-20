import { site } from "@/lib/site";

export type MarketingFeatureStatus = "live" | "pending";

export type MarketingFeature = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  status: MarketingFeatureStatus;
  availability: string;
  eyebrow: string;
  hero: string;
  summary: string;
  audience: string;
  problem: string;
  outcome: string;
  imageUrl: string;
  imageAlt: string;
  featureIds: string[];
  issueIds: number[];
  proofRoutes: string[];
  benefits: string[];
  useCases: string[];
  replaces: string[];
  nextStep: {
    label: string;
    href: string;
  };
};

export const marketingFeaturesUpdatedAt = "2026-05-20";

export const marketingFeatureStructureReferences = [
  {
    label: "ClickFunnels feature index",
    url: "https://goto.clickfunnels.com/clickfunnels-features",
    usefulPattern: "Dedicated feature tiles that route prospects into deeper feature education.",
  },
  {
    label: "ScoreApp feature list",
    url: "https://www.scoreapp.com/features/",
    usefulPattern: "Plain-language feature grouping around what the customer gets done.",
  },
  {
    label: "Shopify products",
    url: "https://www.shopify.com/products",
    usefulPattern: "Confident product-category cards with clear jobs-to-be-done paths.",
  },
  {
    label: "Kajabi product pages",
    url: "https://www.kajabi.com/product",
    usefulPattern: "Each major capability gets a learn-more route instead of one dense board.",
  },
];

export const marketingFeatures: MarketingFeature[] = [
  {
    slug: "ai-business-coach",
    title: "AI business coach",
    shortTitle: "AI coach",
    category: "Launch planning",
    status: "pending",
    availability: "Agent-readable contracts are live; guided coaching workflows are in build.",
    eyebrow: "Decide faster",
    hero: "Turn scattered launch ideas into a cleaner plan.",
    summary:
      "Bumpgrade gives agents and operators structured source data for features, competitors, funnels, offers, products, audience, and analytics so AI help can work from evidence instead of vague prompts.",
    audience: "Solo publishers, coaches, course sellers, and operators who want help choosing the next best launch move.",
    problem: "AI tools can draft advice, but they usually cannot see the funnel, offer, evidence, and safety boundaries behind the advice.",
    outcome: "Ask for a launch plan, funnel outline, offer critique, or competitor-informed next step with citations back to Bumpgrade records.",
    imageUrl: "/marketing/bumpgrade-home-hero.jpg",
    imageAlt: "A publisher founder reviewing a launch dashboard on a laptop.",
    featureIds: ["feature-agent-ready-contracts", "feature-compare-source-data"],
    issueIds: [12, 217],
    proofRoutes: ["/agent-docs", "/agent-docs/source-data", "/compare/source-data"],
    benefits: [
      "Ground AI recommendations in feature IDs, source routes, competitor references, and roadmap issues.",
      "Keep public, billing, and creator-speech changes behind confirmation boundaries.",
      "Give future agents a stable place to inspect Bumpgrade before making claims or proposals.",
    ],
    useCases: [
      "Ask what to build next for a product launch.",
      "Draft a funnel outline from a known offer stack.",
      "Compare Bumpgrade with ClickFunnels, SamCart, Kit, Shopify, Kajabi, and other alternatives.",
    ],
    replaces: ["Generic AI prompts", "Scattered launch docs", "Private chat-only project memory"],
    nextStep: { label: "Read the agent docs", href: "/agent-docs" },
  },
  {
    slug: "simple-landing-page",
    title: "Simple landing pages",
    shortTitle: "Landing pages",
    category: "Funnels",
    status: "live",
    availability: "Public preview routes and published funnel routing are available for the launch preview.",
    eyebrow: "Publish the first page",
    hero: "Give a launch idea a public page, not another private note.",
    summary:
      "Build around opt-in, sales, webinar, resource, thank-you, and checkout handoff page shapes that can be inspected by humans and agents.",
    audience: "Creators who need a crisp landing page for a lead magnet, event, resource, or paid offer.",
    problem: "A lot of launches stall because the first public page is trapped in a site builder, doc, or designer queue.",
    outcome: "Use a structured page path with source data, screenshots, and issue evidence so launch pages are easier to review and evolve.",
    imageUrl: "/pr-screenshots/issue-213-webinar-resource-funnels.png",
    imageAlt: "Bumpgrade webinar and resource funnel template screenshot.",
    featureIds: ["feature-funnel-builder"],
    issueIds: [14, 79, 135, 159, 161, 213],
    proofRoutes: ["/funnels/indie-launch-sandbox", "/funnels/source-data"],
    benefits: [
      "Start with proven page shapes for opt-ins, webinars, resources, sales pages, checkout handoffs, and thank-you pages.",
      "Keep page state source-readable for agents and future admin tools.",
      "Publish the checked funnel route once the owner confirms the draft.",
    ],
    useCases: ["Lead magnet page", "Webinar registration page", "Resource library page", "Sales page"],
    replaces: ["One-off landing page builders", "Static launch docs", "Ad hoc page copy handoffs"],
    nextStep: { label: "Preview a funnel page", href: "/funnels/indie-launch-sandbox" },
  },
  {
    slug: "sales-funnels",
    title: "Sales funnels",
    shortTitle: "Funnels",
    category: "Funnels",
    status: "live",
    availability: "Seeded funnel previews, draft editing, template starts, checkout linking, and public funnel routes are available.",
    eyebrow: "Connect the path",
    hero: "Move people from first click to the right next offer.",
    summary:
      "Bumpgrade models launches as ordered funnel steps with reusable templates, checkout links, preview state, publishing controls, and evidence routes.",
    audience: "Publishers and operators who want one coherent launch path instead of disconnected pages and checkouts.",
    problem: "Landing pages, checkout pages, upsells, and follow-up content often live in separate tools with unclear state.",
    outcome: "Plan, preview, and publish a sequence that agents can read and owners can confirm before it changes what customers see.",
    imageUrl: "/pr-screenshots/issue-159-funnel-template-library.png",
    imageAlt: "Bumpgrade funnel template library screenshot.",
    featureIds: ["feature-funnel-builder", "feature-checkout-offers"],
    issueIds: [14, 79, 91, 93, 95, 135, 159, 161, 163, 165],
    proofRoutes: ["/funnels/source-data", "/admin/funnels"],
    benefits: [
      "Use launch, webinar, resource, and checkout handoff templates as reusable starting points.",
      "Preview private drafts before publishing.",
      "Keep checkout links and public publishing behind owner confirmation.",
    ],
    useCases: ["Book launch funnel", "Course waitlist", "Paid workshop funnel", "Digital product launch"],
    replaces: ["ClickFunnels page sequences", "Manual page-to-checkout handoffs", "Untracked funnel docs"],
    nextStep: { label: "Explore funnel templates", href: "/funnels/source-data" },
  },
  {
    slug: "email-campaigns",
    title: "Email campaigns",
    shortTitle: "Email",
    category: "Audience",
    status: "live",
    availability: "Opt-in, suppression, CRM notes, broadcast readiness, and dry-run sending contracts are available; provider sending remains gated.",
    eyebrow: "Grow the list",
    hero: "Capture subscribers and prepare campaigns without breaking trust.",
    summary:
      "Bumpgrade connects waitlist forms, consent, tags, subscriber inspection, suppression, CRM notes, broadcast readiness, queue safety, and provider-readiness checks.",
    audience: "Publishers who need launch email workflows but do not want a brittle list glued to a separate funnel stack.",
    problem: "Email tools are powerful, but they often hide the relationship between consent, segments, campaign drafts, and checkout journeys.",
    outcome:
      "See who can receive a campaign, why they qualify, what is suppressed, and what still needs a safe provider handoff before a real send.",
    imageUrl: "/pr-screenshots/issue-171-broadcast-readiness.png",
    imageAlt: "Bumpgrade broadcast readiness screenshot.",
    featureIds: ["feature-email-automation-crm"],
    issueIds: [17, 85, 103, 137, 167, 169, 171, 173, 175, 177, 183, 189, 191, 197, 199, 201, 203, 205, 207, 209, 211],
    proofRoutes: ["/audience/indie-launch-waitlist", "/audience/source-data", "/admin/audience"],
    benefits: [
      "Capture waitlist leads with consent and normalized email records.",
      "Inspect tags, consent, suppression, CRM notes, and campaign readiness in one place.",
      "Dry-run campaign scheduling, queue, dispatch, and provider checks before live sends.",
    ],
    useCases: ["Launch waitlist", "Lead magnet nurture", "Broadcast preflight", "CRM follow-up notes"],
    replaces: ["Kit list growth workflows", "Spreadsheet-based launch lists", "Untracked broadcast checklists"],
    nextStep: { label: "Open the waitlist preview", href: "/audience/indie-launch-waitlist" },
  },
  {
    slug: "order-bump",
    title: "Checkout and order bumps",
    shortTitle: "Order bumps",
    category: "Checkout",
    status: "live",
    availability: "Sandbox checkout and order-bump flow are available; live-mode checkout requires verified live Stripe configuration.",
    eyebrow: "Increase order value",
    hero: "Offer the right bump, upsell, or downsell at the moment of purchase.",
    summary:
      "Bumpgrade models primary offers, order bumps, post-purchase decisions, checkout success state, and referral attribution without treating unverified live billing as shipped.",
    audience: "Sellers who want better average order value and safer billing flows.",
    problem: "Offer stacks are usually split across checkout builders, payment dashboards, and manual fulfillment notes.",
    outcome:
      "Preview the full offer ladder, start a sandbox checkout, and keep billing-impacting actions behind exact confirmation and trusted webhook state.",
    imageUrl: "/pr-screenshots/issue-99-checkout-order-bump-start.png",
    imageAlt: "Bumpgrade checkout order bump start screenshot.",
    featureIds: ["feature-checkout-offers"],
    issueIds: [15, 34, 81, 99, 111, 117, 133],
    proofRoutes: ["/offers/indie-launch-stack", "/offers/source-data", "/commerce/source-data"],
    benefits: [
      "Model primary offers, bumps, upsells, downsells, and checkout intent state.",
      "Attach eligible referral evidence to checkout starts.",
      "Gate post-purchase paths on trusted checkout state instead of hopeful redirects.",
    ],
    useCases: ["Order bump", "Paid offer checkout", "Post-purchase upsell prompt", "Referral-attributed checkout"],
    replaces: ["SamCart checkout paths", "ThriveCart-style bump logic", "Manual Stripe checkout notes"],
    nextStep: { label: "Preview the offer stack", href: "/offers/indie-launch-stack" },
  },
  {
    slug: "digital-products",
    title: "Digital products and memberships",
    shortTitle: "Products",
    category: "Commerce",
    status: "live",
    availability: "Product previews, entitlement lookup, fixture delivery, and membership state contracts are available.",
    eyebrow: "Deliver the thing",
    hero: "Sell products that can actually grant access afterward.",
    summary:
      "Bumpgrade connects product catalogs, access rules, entitlements, protected content readiness, download tokens, and subscription-backed membership state.",
    audience: "Course sellers, template sellers, paid newsletter operators, and digital product creators.",
    problem: "Checkout without fulfillment creates support work and fragile manual access checks.",
    outcome: "Inspect product access, prove entitlement state, and deliver seeded protected fixtures without exposing private storage keys.",
    imageUrl: "/pr-screenshots/issue-146-r2-delivery-desktop.png",
    imageAlt: "Bumpgrade protected delivery screenshot.",
    featureIds: ["feature-products-access"],
    issueIds: [16, 83, 101, 139, 141, 143, 146, 147, 151, 179, 181, 185, 187],
    proofRoutes: ["/products/indie-launch-library", "/products/source-data", "/products/entitlements"],
    benefits: [
      "Connect products, access rules, entitlements, downloads, protected content, and membership state.",
      "Let customers inspect access without exposing private identifiers.",
      "Keep private asset uploads and revocation paths owner-confirmed.",
    ],
    useCases: ["Download delivery", "Course access", "Membership access", "Bundle fulfillment"],
    replaces: ["Kajabi product access pieces", "Manual download links", "Spreadsheet entitlement tracking"],
    nextStep: { label: "Preview product access", href: "/products/indie-launch-library" },
  },
  {
    slug: "ad-tracking",
    title: "Ad tracking and conversion analytics",
    shortTitle: "Analytics",
    category: "Optimization",
    status: "live",
    availability: "Seeded analytics, source attribution, experiment assignment, and time-window reports are available.",
    eyebrow: "Know what worked",
    hero: "See which sources, variants, and launch paths are moving buyers.",
    summary:
      "Bumpgrade records privacy-safe events, page-view beacons, source attribution, experiment assignment, conversion reports, and time-window summaries.",
    audience: "Operators buying traffic, testing pages, or trying to understand which launch channel is working.",
    problem: "Launch attribution is often split between ad platforms, analytics scripts, checkout exports, and gut feel.",
    outcome: "Use aggregate source and conversion reports to understand the launch without leaking raw private analytics rows.",
    imageUrl: "/pr-screenshots/issue-129-analytics-time-windows-desktop.png",
    imageAlt: "Bumpgrade analytics time window screenshot.",
    featureIds: ["feature-analytics-testing"],
    issueIds: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129],
    proofRoutes: ["/analytics/indie-launch-dashboard", "/analytics/source-data"],
    benefits: [
      "Track seeded page views, opt-ins, checkout starts, purchases, and source attribution.",
      "Read aggregate conversion and variant evidence with time-window controls.",
      "Keep raw visitor data and private identifiers out of public source data.",
    ],
    useCases: ["UTM tracking", "A/B test readouts", "Launch conversion review", "Traffic-source comparison"],
    replaces: ["Manual UTM spreadsheets", "Disconnected analytics dashboards", "Guesswork after ads run"],
    nextStep: { label: "Open analytics preview", href: "/analytics/indie-launch-dashboard" },
  },
  {
    slug: "audience-crm",
    title: "Audience CRM",
    shortTitle: "CRM",
    category: "Audience",
    status: "live",
    availability: "Subscriber inspection, consent records, suppression, and CRM note contracts are available.",
    eyebrow: "Remember the relationship",
    hero: "Keep subscriber context close to the launch.",
    summary:
      "Bumpgrade gives owners CRM-lite subscriber context, consent status, tags, suppression, timeline notes, and campaign readiness instead of a disconnected list export.",
    audience: "Creators and small publishers who need enough CRM context to launch thoughtfully without a full enterprise CRM.",
    problem: "Launch lists usually show email addresses but not the surrounding consent, segment, note, and campaign safety context.",
    outcome: "Review the audience state that matters before sending, segmenting, or following up.",
    imageUrl: "/pr-screenshots/issue-169-audience-crm-notes.png",
    imageAlt: "Bumpgrade audience CRM notes screenshot.",
    featureIds: ["feature-email-automation-crm"],
    issueIds: [17, 103, 137, 167, 169, 171],
    proofRoutes: ["/audience/source-data", "/admin/audience"],
    benefits: [
      "Inspect subscribers, consent, tags, suppression, and draft enrollments.",
      "Add owner-gated CRM timeline notes.",
      "Use suppression-aware readiness before campaign work proceeds.",
    ],
    useCases: ["Lead follow-up", "Segment review", "Campaign readiness", "Suppression audit"],
    replaces: ["Lightweight CRM spreadsheets", "Disconnected tag notes", "Manual suppression checks"],
    nextStep: { label: "View audience source data", href: "/audience/source-data" },
  },
  {
    slug: "affiliate-referrals",
    title: "Affiliate and referral tracking",
    shortTitle: "Affiliates",
    category: "Growth",
    status: "live",
    availability: "Referral links, attribution evidence, review-only commissions, partner reports, and payout-prep records are available.",
    eyebrow: "Grow with partners",
    hero: "Track partner growth without rushing into unsafe payout automation.",
    summary:
      "Bumpgrade models affiliate programs, referral links, clicks, checkout attribution, review-only commission evidence, partner reports, and payout preparation.",
    audience: "Publishers who want partners, affiliates, and creators to help sell without messy attribution logs.",
    problem: "Referral tracking gets risky when attribution, commission state, and payout readiness are blended together too early.",
    outcome:
      "Separate public-safe partner performance evidence from payout-impacting actions that still need owner review and confirmation.",
    imageUrl: "/pr-screenshots/issue-195-affiliate-payout-prep.png",
    imageAlt: "Bumpgrade affiliate payout preparation screenshot.",
    featureIds: ["feature-affiliates-referrals"],
    issueIds: [19, 89, 109, 111, 113, 115, 193, 195],
    proofRoutes: ["/affiliates/indie-launch-partners", "/affiliates/source-data"],
    benefits: [
      "Create partner and referral-link records with public-safe click evidence.",
      "Attach eligible referral clicks to checkout intents.",
      "Prepare payout review records without automating live payouts prematurely.",
    ],
    useCases: ["Affiliate launch", "Referral partner program", "Commission review", "Payout readiness"],
    replaces: ["Manual affiliate spreadsheets", "Unreviewed payout exports", "Attribution screenshots"],
    nextStep: { label: "Preview partner program", href: "/affiliates/indie-launch-partners" },
  },
  {
    slug: "webinars-and-resources",
    title: "Webinars and resource funnels",
    shortTitle: "Webinars",
    category: "Funnels",
    status: "live",
    availability: "Webinar and resource funnel templates are available as launch-preview page shapes.",
    eyebrow: "Teach before selling",
    hero: "Use education, resources, and events as part of the launch path.",
    summary:
      "Bumpgrade includes webinar and resource page-block records so launch funnels can support registration, replay/resource positioning, and post-event sales paths.",
    audience: "Experts, coaches, consultants, and educators using teaching moments to sell deeper products.",
    problem: "Webinar and resource launches often become separate islands from the actual offer, checkout, and follow-up system.",
    outcome: "Keep registration, resource delivery shape, offer handoff, and future agent context in the same funnel contract.",
    imageUrl: "/pr-screenshots/issue-213-webinar-resource-funnels.png",
    imageAlt: "Bumpgrade webinar and resource funnel templates screenshot.",
    featureIds: ["feature-funnel-builder"],
    issueIds: [14, 213],
    proofRoutes: ["/funnels/source-data", "/funnels/indie-launch-sandbox"],
    benefits: [
      "Add webinar and resource page shapes to the funnel library.",
      "Keep event/resource positioning connected to offers and checkout handoffs.",
      "Give agents stable block metadata for future drafts and recommendations.",
    ],
    useCases: ["Webinar registration", "Replay funnel", "Resource library", "Educational sales path"],
    replaces: ["Standalone webinar pages", "Resource portals disconnected from checkout", "One-off event copy"],
    nextStep: { label: "See webinar resources", href: "/funnels/source-data" },
  },
];

export const marketingFeatureCategories = Array.from(new Set(marketingFeatures.map((feature) => feature.category)));

export const featuredMarketingFeatureSlugs = [
  "simple-landing-page",
  "email-campaigns",
  "order-bump",
  "ai-business-coach",
];

export function getMarketingFeature(slug: string) {
  return marketingFeatures.find((feature) => feature.slug === slug) ?? null;
}

export function marketingFeatureUrl(slug: string) {
  return `${site.url}/features/${slug}`;
}
