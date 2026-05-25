import { site } from "@/lib/site";

export type MarketingFeatureStatus = "live" | "launch-preview" | "pending";

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
  cardImageUrl?: string;
  cardImageAlt?: string;
  featureIds: string[];
  issueIds: number[];
  proofRoutes: string[];
  benefits: string[];
  useCases: string[];
  examples?: {
    title: string;
    body: string;
    request: string;
  }[];
  replaces: string[];
  nextStep: {
    label: string;
    href: string;
  };
};

export const marketingFeaturesUpdatedAt = "2026-05-22";

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
    status: "launch-preview",
    availability:
      "Available for launch planning, offer review, funnel suggestions, email outlines, and analytics readouts. You stay in control of publishing, billing, and sends.",
    eyebrow: "Decide faster",
    hero: "Ask an AI launch advisor what to do next.",
    summary:
      "Bumpgrade's AI coach helps publishers turn an offer idea into a practical launch plan using the funnel, checkout, audience, product, and analytics context already in Bumpgrade.",
    audience: "Solo publishers, coaches, course sellers, and operators who want a clearer launch plan without stitching together private notes, screenshots, and generic AI prompts.",
    problem:
      "Generic AI tools can write advice, but they usually cannot see the page, offer, checkout, audience, product, and analytics details that shape a real launch.",
    outcome:
      "Ask for a launch plan, funnel sequence, offer-page rewrite, missing-step review, analytics readout, or email follow-up outline grounded in your actual Bumpgrade launch state.",
    imageUrl: "/marketing/ai-launch-advisor-workspace.png",
    imageAlt: "Bumpgrade AI launch advisor workspace with offer, audience, analytics, and next-step recommendations.",
    cardImageUrl: "/marketing/ai-launch-advisor-card.png",
    cardImageAlt: "Bumpgrade AI launch advisor panel with launch context and next-step recommendations.",
    featureIds: ["feature-agent-ready-contracts", "feature-compare-source-data"],
    issueIds: [12, 217],
    proofRoutes: ["/agent-docs", "/agent-docs/source-data", "/compare/source-data"],
    benefits: [
      "Turn offer notes into a launch plan that references the real funnel, offer stack, product access, audience, and analytics surfaces.",
      "Spot missing checkout, product, audience, or analytics steps before a publisher sends traffic to the launch.",
      "Choose when to publish copy, charge customers, send messages, or change product access.",
    ],
    useCases: [
      "Turn an offer idea into a launch plan.",
      "Outline a funnel sequence from the current offer stack.",
      "Find missing checkout, product, audience, or analytics steps.",
      "Review launch analytics and suggest next actions.",
      "Rewrite an offer page for a clearer buyer promise.",
      "Prepare an email follow-up outline after opt-in or purchase.",
    ],
    examples: [
      {
        title: "Plan the launch",
        body: "Start with a rough product idea and get a step-by-step launch path that names the page, checkout, follow-up, product delivery, and measurement work.",
        request: "Turn this offer idea into a first launch plan and flag the missing Bumpgrade setup steps.",
      },
      {
        title: "Improve the funnel",
        body: "Review the current funnel and offer stack, then ask for the next page, bump, upsell, or follow-up change that would make the launch easier to buy.",
        request: "Read the current funnel and offer stack, then suggest the next three changes to improve conversion.",
      },
      {
        title: "Decide from evidence",
        body: "Use conversion, audience, and product-access signals to choose what to change next without exposing private customer or billing details.",
        request: "Summarize what the latest launch signals say and recommend the next action I should approve.",
      },
    ],
    replaces: ["Generic AI prompts", "Scattered launch docs", "Private chat-only project memory"],
    nextStep: { label: "Start with Bumpgrade", href: "/pricing" },
  },
  {
    slug: "simple-landing-page",
    title: "Simple landing pages",
    shortTitle: "Landing pages",
    category: "Funnels",
    status: "live",
    availability: "Landing page templates, funnel routing, and public launch examples are ready to use.",
    eyebrow: "Publish the first page",
    hero: "Give a launch idea a public page, not another private note.",
    summary:
      "Build around opt-in, sales, webinar, resource, thank-you, and checkout handoff page shapes your team can review before publishing.",
    audience: "Creators who need a crisp landing page for a lead magnet, event, resource, or paid offer.",
    problem: "A lot of launches stall because the first public page is trapped in a site builder, doc, or designer queue.",
    outcome: "Use a structured page path that makes launch pages easier to review, approve, and evolve.",
    imageUrl: "/marketing/launch-funnel-card.png",
    imageAlt: "Bumpgrade launch funnel workspace with opt-in, offer, checkout, and delivery steps.",
    featureIds: ["feature-funnel-builder"],
    issueIds: [14, 79, 135, 159, 161, 213],
    proofRoutes: ["/funnels/indie-launch-sandbox", "/funnels/source-data"],
    benefits: [
      "Start with proven page shapes for opt-ins, webinars, resources, sales pages, checkout handoffs, and thank-you pages.",
      "Keep page work easy to review before publishing.",
      "Publish the checked funnel route once the launch page is ready.",
    ],
    useCases: ["Lead magnet page", "Webinar registration page", "Resource library page", "Sales page"],
    replaces: ["One-off landing page builders", "Static launch docs", "Ad hoc page copy handoffs"],
    nextStep: { label: "Open a landing page example", href: "/funnels/indie-launch-sandbox" },
  },
  {
    slug: "sales-funnels",
    title: "Sales funnels",
    shortTitle: "Funnels",
    category: "Funnels",
    status: "live",
    availability:
      "Funnel examples, reusable templates, checkout links, public funnel routes, and archive/unpublish controls are ready to use.",
    eyebrow: "Connect the path",
    hero: "Move people from first click to the right next offer.",
    summary:
      "Bumpgrade models launches as ordered funnel steps with reusable templates, checkout links, review pages, and publishing controls.",
    audience: "Publishers and operators who want one coherent launch path instead of disconnected pages and checkouts.",
    problem: "Landing pages, checkout pages, upsells, and follow-up content often live in separate tools with unclear state.",
    outcome: "Plan, review, and publish a sequence your team can approve before it changes what customers see.",
    imageUrl: "/marketing/sales-funnels-card.png",
    imageAlt: "Bumpgrade sales funnel sequence with lead page, offer page, order bump, and follow-up steps.",
    featureIds: ["feature-funnel-builder", "feature-checkout-offers"],
    issueIds: [14, 79, 91, 93, 95, 135, 159, 161, 163, 165, 215, 341, 409],
    proofRoutes: ["/funnels/indie-launch-sandbox", "/funnels/source-data", "/admin/funnels"],
    benefits: [
      "Use launch, webinar, resource, and checkout handoff templates as reusable starting points.",
      "Review, duplicate, and archive launch paths before or after publishing.",
      "Connect checkout links, publishing, and unpublishing steps from the same launch path.",
    ],
    useCases: ["Book launch funnel", "Course waitlist", "Paid workshop funnel", "Digital product launch"],
    replaces: ["ClickFunnels page sequences", "Manual page-to-checkout handoffs", "Untracked funnel docs"],
    nextStep: { label: "Open a funnel example", href: "/funnels/indie-launch-sandbox" },
  },
  {
    slug: "email-campaigns",
    title: "Email campaigns",
    shortTitle: "Email",
    category: "Audience",
    status: "live",
    availability:
      "Opt-in forms, consent, tags, suppression, unsubscribe-paused sequence evidence, sequence delivery readiness, CRM notes, campaign prep, and send checks are ready to use.",
    eyebrow: "Grow the list",
    hero: "Capture subscribers and prepare campaigns without breaking trust.",
    summary:
      "Bumpgrade connects waitlist forms, consent, tags, subscriber inspection, suppression, unsubscribe-paused sequence evidence, aggregate sequence delivery readiness, CRM notes, campaign preparation, and safer send checks.",
    audience: "Publishers who need launch email workflows but do not want a brittle list glued to a separate funnel stack.",
    problem: "Email tools are powerful, but they often hide the relationship between consent, segments, campaign plans, and checkout journeys.",
    outcome:
      "See who can receive a campaign, why they qualify, what is suppressed, and what to check before sending.",
    imageUrl: "/marketing/audience-email-card.png",
    imageAlt: "Bumpgrade audience campaign workspace with opt-in, consent, segment, and nurture outline steps.",
    featureIds: ["feature-email-automation-crm"],
    issueIds: [17, 85, 103, 137, 167, 343, 169, 171, 173, 175, 177, 183, 189, 191, 197, 199, 201, 203, 205, 207, 209, 211, 347, 351],
    proofRoutes: ["/audience/indie-launch-waitlist", "/audience/source-data", "/admin/audience"],
    benefits: [
      "Capture waitlist leads with consent and normalized email records.",
      "Inspect tags, consent, suppression, unsubscribe-paused sequence evidence, aggregate sequence delivery readiness, CRM notes, and campaign preparation in one place.",
      "Check scheduling, audience, message, and delivery details before live sends.",
    ],
    useCases: ["Launch waitlist", "Lead magnet nurture", "Broadcast preflight", "CRM follow-up notes"],
    replaces: ["Kit list growth workflows", "Spreadsheet-based launch lists", "Untracked broadcast checklists"],
    nextStep: { label: "Open the waitlist", href: "/audience/indie-launch-waitlist" },
  },
  {
    slug: "order-bump",
    title: "Checkout and order bumps",
    shortTitle: "Order bumps",
    category: "Checkout",
    status: "live",
    availability: "Checkout examples, order bumps, post-purchase paths, and Stripe-backed plan checkout are ready to use.",
    eyebrow: "Increase order value",
    hero: "Offer the right bump, upsell, or downsell at the moment of purchase.",
    summary:
      "Bumpgrade models primary offers, order bumps, post-purchase decisions, checkout success state, and referral attribution in one launch flow.",
    audience: "Sellers who want better average order value and safer billing flows.",
    problem: "Offer stacks are usually split across checkout builders, payment dashboards, and manual fulfillment notes.",
    outcome:
      "Review the full offer ladder, inspect the checkout path, and make sure every buyer lands on the right next step.",
    imageUrl: "/marketing/checkout-offer-card.png",
    imageAlt: "Bumpgrade checkout offer stack with primary offer, order bump, upsell, and success path.",
    featureIds: ["feature-checkout-offers"],
    issueIds: [15, 34, 81, 99, 111, 117, 133],
    proofRoutes: ["/offers/indie-launch-stack", "/offers/source-data", "/commerce/source-data"],
    benefits: [
      "Model primary offers, bumps, upsells, downsells, and checkout intent state.",
      "Attach eligible referral evidence to checkout starts.",
      "Send buyers to post-purchase paths based on completed checkout state instead of hopeful redirects.",
    ],
    useCases: ["Order bump", "Paid offer checkout", "Post-purchase upsell prompt", "Referral-attributed checkout"],
    replaces: ["SamCart checkout paths", "ThriveCart-style bump logic", "Manual checkout notes"],
    nextStep: { label: "Open the offer stack", href: "/offers/indie-launch-stack" },
  },
  {
    slug: "digital-products",
    title: "Digital products and memberships",
    shortTitle: "Products",
    category: "Commerce",
    status: "live",
    availability: "Product catalogs, access checks, downloads, protected content, and membership state are ready to use.",
    eyebrow: "Deliver the thing",
    hero: "Sell products that can actually grant access afterward.",
    summary:
      "Bumpgrade connects product catalogs, access rules, entitlements, protected content, download tokens, and subscription-backed membership state.",
    audience: "Course sellers, template sellers, paid newsletter operators, and digital product creators.",
    problem: "Checkout without fulfillment creates support work and fragile manual access checks.",
    outcome: "Confirm product access, grant the right entitlement, and deliver protected content without messy manual links.",
    imageUrl: "/marketing/product-access-card.png",
    imageAlt: "Bumpgrade product library with course, download, member access, and revocation rule steps.",
    featureIds: ["feature-products-access"],
    issueIds: [16, 83, 101, 139, 141, 143, 146, 147, 151, 179, 181, 185, 187],
    proofRoutes: ["/products/indie-launch-library", "/products/source-data", "/products/entitlements"],
    benefits: [
      "Connect products, access rules, entitlements, downloads, protected content, and membership state.",
      "Let customers inspect access without exposing private identifiers.",
      "Handle access updates deliberately when products, memberships, or customer state change.",
    ],
    useCases: ["Download delivery", "Course access", "Membership access", "Bundle fulfillment"],
    replaces: ["Kajabi product access pieces", "Manual download links", "Spreadsheet entitlement tracking"],
    nextStep: { label: "Open product access", href: "/products/indie-launch-library" },
  },
  {
    slug: "ad-tracking",
    title: "Ad tracking and conversion analytics",
    shortTitle: "Analytics",
    category: "Optimization",
    status: "live",
    availability:
      "Source tracking, conversion reports, experiments, time windows, exports, cohort comparisons, alerts, and notification preparation are ready to use.",
    eyebrow: "Know what worked",
    hero: "See which sources, variants, and launch paths are moving buyers.",
    summary:
      "Bumpgrade shows which traffic sources, page variants, funnel steps, and time windows are moving buyers so you can improve the next launch.",
    audience: "Operators buying traffic, testing pages, or trying to understand which launch channel is working.",
    problem: "Launch attribution is often split between ad platforms, analytics scripts, checkout exports, and gut feel.",
    outcome: "Use aggregate source and conversion reports to understand the launch without exposing private visitor details.",
    imageUrl: "/marketing/analytics-card.png",
    imageAlt: "Bumpgrade launch dashboard with traffic source, funnel step, conversion trend, and revenue signals.",
    featureIds: ["feature-analytics-testing"],
    issueIds: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129, 261, 263, 265, 267, 269, 271, 284, 286, 288],
    proofRoutes: ["/analytics/indie-launch-dashboard", "/analytics/source-data", "/admin/analytics"],
    benefits: [
      "Track page views, opt-ins, checkout starts, purchases, and source attribution.",
      "Read aggregate conversion, cohort, and variant evidence with time-window controls.",
      "Keep raw visitor data and private identifiers out of public reports.",
    ],
    useCases: ["UTM tracking", "A/B test readouts", "Launch conversion review", "Traffic-source comparison"],
    replaces: ["Manual UTM spreadsheets", "Disconnected analytics dashboards", "Guesswork after ads run"],
    nextStep: { label: "Open analytics dashboard", href: "/analytics/indie-launch-dashboard" },
  },
  {
    slug: "audience-crm",
    title: "Audience CRM",
    shortTitle: "CRM",
    category: "Audience",
    status: "live",
    availability: "Subscriber inspection, consent records, suppression, and CRM notes are available.",
    eyebrow: "Remember the relationship",
    hero: "Keep subscriber context close to the launch.",
    summary:
      "Bumpgrade gives publishers CRM-lite subscriber context, consent status, tags, suppression, timeline notes, and campaign preparation instead of a disconnected list export.",
    audience: "Creators and small publishers who need enough CRM context to launch thoughtfully without a full enterprise CRM.",
    problem: "Launch lists usually show email addresses but not the surrounding consent, segment, note, and campaign safety context.",
    outcome: "Review the audience state that matters before sending, segmenting, or following up.",
    imageUrl: "/marketing/crm-notes-card.png",
    imageAlt: "Bumpgrade subscriber notes workspace with tags, owner note, and follow-up task.",
    featureIds: ["feature-email-automation-crm"],
    issueIds: [17, 103, 137, 167, 169, 171],
    proofRoutes: ["/audience/indie-launch-waitlist", "/audience/source-data", "/admin/audience"],
    benefits: [
      "Inspect subscribers, consent, tags, suppression, and follow-up enrollments.",
      "Add private CRM timeline notes.",
      "Use suppression-aware checks before campaign work proceeds.",
    ],
    useCases: ["Lead follow-up", "Segment review", "Campaign prep", "Suppression audit"],
    replaces: ["Lightweight CRM spreadsheets", "Disconnected tag notes", "Manual suppression checks"],
    nextStep: { label: "Open the waitlist", href: "/audience/indie-launch-waitlist" },
  },
  {
    slug: "affiliate-referrals",
    title: "Affiliate and referral tracking",
    shortTitle: "Affiliates",
    category: "Growth",
    status: "live",
    availability:
      "Referral links, attribution, commission review, partner reports, payout preparation, fraud checks, and partner notifications are ready to use.",
    eyebrow: "Grow with partners",
    hero: "Track partner growth without rushing into unsafe payout automation.",
    summary:
      "Bumpgrade models affiliate programs, referral links, clicks, checkout attribution, commission review, partner reports, payout preparation, fraud checks, and partner notifications.",
    audience: "Publishers who want partners, affiliates, and creators to help sell without messy attribution logs.",
    problem: "Referral tracking gets risky when attribution, commission state, and payout decisions are blended together too early.",
    outcome:
      "See which partners are driving buyers, review commission state, prepare payouts, and keep risky partner actions deliberate.",
    imageUrl: "/marketing/affiliate-card.png",
    imageAlt: "Bumpgrade referral partner workspace with partner link, referral visit, purchase match, and commission review.",
    featureIds: ["feature-affiliates-referrals"],
    issueIds: [19, 89, 109, 111, 113, 115, 193, 195, 273, 275, 277, 279, 281],
    proofRoutes: ["/affiliates/indie-launch-partners", "/affiliates/source-data"],
    benefits: [
      "Create partner and referral-link records with click and checkout attribution.",
      "Attach eligible referral clicks to checkout intents.",
      "Prepare payout reviews without automating money movement prematurely.",
    ],
    useCases: ["Affiliate launch", "Referral partner program", "Commission review", "Payout prep"],
    replaces: ["Manual affiliate spreadsheets", "Unreviewed payout exports", "Attribution screenshots"],
    nextStep: { label: "Open partner program", href: "/affiliates/indie-launch-partners" },
  },
  {
    slug: "webinars-and-resources",
    title: "Webinars and resource funnels",
    shortTitle: "Webinars",
    category: "Funnels",
    status: "live",
    availability: "Webinar and resource funnel templates are available for first-wave launch pages.",
    eyebrow: "Teach before selling",
    hero: "Use education, resources, and events as part of the launch path.",
    summary:
      "Bumpgrade includes webinar and resource page-block records so launch funnels can support registration, replay/resource positioning, and post-event sales paths.",
    audience: "Experts, coaches, consultants, and educators using teaching moments to sell deeper products.",
    problem: "Webinar and resource launches often become separate islands from the actual offer, checkout, and follow-up system.",
    outcome: "Keep registration, resource delivery, offer handoff, and follow-up context in the same launch path.",
    imageUrl: "/marketing/webinar-resource-card.png",
    imageAlt: "Bumpgrade resource launch workspace with registration, delivery, replay offer, and email follow-up steps.",
    featureIds: ["feature-funnel-builder"],
    issueIds: [14, 213],
    proofRoutes: ["/funnels/source-data", "/funnels/indie-launch-sandbox"],
    benefits: [
      "Add webinar and resource page shapes to the funnel library.",
      "Keep event/resource positioning connected to offers and checkout handoffs.",
      "Keep event, resource, and offer context together for future edits.",
    ],
    useCases: ["Webinar registration", "Replay funnel", "Resource library", "Educational sales path"],
    replaces: ["Standalone webinar pages", "Resource portals disconnected from checkout", "One-off event copy"],
    nextStep: { label: "Open webinar funnel", href: "/funnels/indie-launch-sandbox" },
  },
  {
    slug: "competitor-importers",
    title: "Competitor importers",
    shortTitle: "Importers",
    category: "Migration",
    status: "launch-preview",
    availability:
      "Private import planning is live for the dedicated competitor import paths, starting from review-first drafts in Free Build workspaces.",
    eyebrow: "Move what matters",
    hero: "Bring your existing launch stack into Bumpgrade before going live.",
    summary:
      "Bumpgrade helps publishers map current funnels, checkout paths, audience notes, product context, and page copy from familiar platforms into one private launch workspace.",
    audience: "Publishers moving from ClickFunnels, SamCart, Kit, Kajabi, Shopify, Podia, Systeme.io, Kartra, or ThriveCart.",
    problem: "Switching platforms gets risky when pages, checkout, products, emails, and customer-facing links all move at once.",
    outcome:
      "Review what comes over, keep it private while you organize the launch, and go live only when the page, checkout, email, product, and domain pieces are ready.",
    imageUrl: "/marketing/launch-funnel-card.png",
    imageAlt: "Bumpgrade importer workspace with current platform material mapped into a private launch path.",
    featureIds: ["feature-competitor-importers", "feature-compare-source-data"],
    issueIds: [467, 5, 14, 15, 17],
    proofRoutes: ["/imports", "/imports/clickfunnels", "/imports/source-data", "/compare/source-data"],
    benefits: [
      "Start from public URLs, exported files, CSVs, or pasted copy when a platform does not have a clean transfer path.",
      "Review detected pages, offers, products, audience notes, assets, and follow-up ideas before Bumpgrade creates private workspace records.",
      "Create a private import plan in Free Build before paying or going live.",
      "Keep publishing, checkout, subscriber sends, domains, and fulfillment off until the launch is approved.",
    ],
    useCases: [
      "ClickFunnels migration",
      "SamCart checkout move",
      "Kit audience import",
      "Kajabi product move",
      "Shopify offer launch",
    ],
    replaces: ["Manual migration spreadsheets", "Copy-paste launch rebuilds", "Unreviewed platform switches"],
    nextStep: { label: "Open import center", href: "/imports" },
  },
];

export const marketingFeatureCategories = Array.from(new Set(marketingFeatures.map((feature) => feature.category)));

export const featuredMarketingFeatureSlugs = [
  "simple-landing-page",
  "email-campaigns",
  "competitor-importers",
  "order-bump",
  "ai-business-coach",
];

export function getMarketingFeature(slug: string) {
  return marketingFeatures.find((feature) => feature.slug === slug) ?? null;
}

export function marketingFeatureUrl(slug: string) {
  return `${site.url}/features/${slug}`;
}
