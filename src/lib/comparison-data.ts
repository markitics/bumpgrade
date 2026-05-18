export type SourceConfidence = "high" | "medium";

export type CompetitorSource = {
  id: string;
  label: string;
  url: string;
  retrievedAt: string;
  confidence: SourceConfidence;
  notes: string[];
};

export type ComparisonRow = {
  area: string;
  incumbent: string;
  bumpgradePlan: string;
};

export type ComparisonSeoTarget = {
  id: string;
  route: string;
  primaryKeyword: string;
  supportingKeywords: string[];
  intent: string;
  evidenceSourceIds: string[];
  caveat: string;
};

export type ComparisonFaq = {
  question: string;
  answer: string;
};

export type ComparisonDeepDive = {
  title: string;
  paragraphs: string[];
  checklist: ComparisonRow[];
  relatedLinks: {
    label: string;
    href: string;
    description: string;
  }[];
};

export type Competitor = {
  id: string;
  name: string;
  slug: string;
  category: string;
  bestFor: string;
  headline: string;
  summary: string;
  alternativePosition: string;
  sourceId: string;
  sourceUrl: string;
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  searchIntent?: string;
  faqs?: ComparisonFaq[];
  deepDive?: ComparisonDeepDive;
  evidence: string[];
  gapsToAddress: string[];
  rows: ComparisonRow[];
};

export const comparisonRetrievedAt = "2026-05-18";

export const competitorSources: CompetitorSource[] = [
  {
    id: "source-clickfunnels-home",
    label: "ClickFunnels homepage",
    url: "https://www.clickfunnels.com/",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Positions ClickFunnels around funnels, store, CRM, email marketing, online courses, checkout, A/B testing, automations, analytics, payments, affiliate center, and related apps.",
      "Used only for current capability framing, not for pricing or customer claims.",
    ],
  },
  {
    id: "source-shopify-compare",
    label: "Shopify compare hub",
    url: "https://www.shopify.com/compare",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Used as tone and structure inspiration for a broad comparison hub focused on choosing a platform.",
      "Shopify describes an all-in-one commerce platform with tools to start, run, and grow a business.",
    ],
  },
  {
    id: "source-kit-home",
    label: "Kit homepage",
    url: "https://kit.com/",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Positions Kit around creator email marketing, visual automations, commerce, paid newsletters, recommendations, and creator-specific audiences.",
      "Used for product-category positioning, not pricing.",
    ],
  },
  {
    id: "source-samcart-checkout",
    label: "SamCart checkout page",
    url: "https://www.samcart.com/checkout",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Positions checkout as an average-order-value growth surface with order bumps, one-click upsells, and checkout customization.",
      "Used for checkout and revenue optimization positioning.",
    ],
  },
  {
    id: "source-kajabi-home",
    label: "Kajabi homepage",
    url: "https://www.kajabi.com/",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Positions Kajabi for expertise businesses with courses, coaching, communities, memberships, newsletters, downloads, podcasts, payments, funnels, and automations.",
      "Used for all-in-one knowledge-commerce framing.",
    ],
  },
  {
    id: "source-podia-courses",
    label: "Podia online courses page",
    url: "https://www.podia.com/online-courses",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Positions Podia as an all-in-one creator platform with website, blog, landing pages, digital products, checkout, affiliates, and email marketing.",
      "Used for creator-friendly bundle positioning.",
    ],
  },
  {
    id: "source-systeme-features",
    label: "Systeme.io features page",
    url: "https://systeme.io/features",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Positions Systeme.io around website builder, automation, sales funnels, email marketing, courses, affiliate management, communities, booking, SMS, and pipelines.",
      "Used for broad low-friction all-in-one positioning.",
    ],
  },
  {
    id: "source-kartra-home",
    label: "Kartra homepage",
    url: "https://kartra.com/home/",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Positions Kartra around pages, video and webinars, memberships, lead captures, campaigns, funnels, email or SMS, checkouts, and affiliate management.",
      "Used for marketing-suite positioning.",
    ],
  },
  {
    id: "source-thrivecart-features",
    label: "ThriveCart features page",
    url: "https://thrivecart.com/features/",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Positions ThriveCart around checkout, payment options, order bumps, one-click upsells and downsells, subscriptions, affiliates, fulfillment, LMS, revenue intelligence, and integrations.",
      "Used for checkout and revenue optimization positioning.",
    ],
  },
];

export const comparisonPrinciples = [
  {
    title: "Current claims stay sourced",
    body: "Competitor capability notes come from official product pages rechecked on 2026-05-18.",
  },
  {
    title: "Bumpgrade claims stay explicit",
    body: "Until a feature ships, Bumpgrade copy says planned, target, or roadmap instead of pretending the product is live.",
  },
  {
    title: "Agent readers get the same evidence",
    body: "The page content, source IDs, retrieval date, and JSON endpoint all point at the same data records.",
  },
];

export const comparisonSeoTargets: ComparisonSeoTarget[] = [
  {
    id: "seo-clickfunnels-alternative",
    route: "/compare/clickfunnels-alternative",
    primaryKeyword: "ClickFunnels alternative",
    supportingKeywords: ["ClickFunnels alternatives", "ClickFunnels competitor", "sites like ClickFunnels"],
    intent:
      "A buyer already knows ClickFunnels and wants a source-grounded alternative path for funnels, checkout, email, courses, CRM, and agent-readable operations.",
    evidenceSourceIds: ["source-clickfunnels-home"],
    caveat: "Bumpgrade must describe parity targets as planned until the linked roadmap issues ship.",
  },
  {
    id: "seo-clickfunnels-competitors",
    route: "/compare/clickfunnels-alternative",
    primaryKeyword: "ClickFunnels competitors",
    supportingKeywords: ["funnel builder competitors", "sales funnel platform comparison", "ClickFunnels vs alternatives"],
    intent:
      "A buyer is comparing the funnel-builder category and needs the main competitor capabilities mapped to Bumpgrade roadmap slices.",
    evidenceSourceIds: ["source-clickfunnels-home", "source-shopify-compare"],
    caveat: "The page can cite official ClickFunnels capabilities and Bumpgrade roadmap state, not unsupported performance or pricing claims.",
  },
  {
    id: "seo-indiepreneur-platform-compare",
    route: "/compare",
    primaryKeyword: "indiepreneur platform comparison",
    supportingKeywords: ["creator commerce platform comparison", "funnel checkout email platform", "publisher growth OS"],
    intent:
      "A founder wants one comparison hub for funnel, checkout, email, course, community, affiliate, analytics, and agent-ready platform decisions.",
    evidenceSourceIds: ["source-shopify-compare", "source-clickfunnels-home", "source-samcart-checkout", "source-kit-home"],
    caveat: "The hub should help choose a product direction while keeping Bumpgrade's not-yet-shipped features labeled as roadmap work.",
  },
];

export const comparisonHubRows: ComparisonRow[] = [
  {
    area: "Funnels and landing pages",
    incumbent: "ClickFunnels, Systeme.io, Kartra, and Leadpages emphasize page and funnel creation.",
    bumpgradePlan: "Bumpgrade will start with funnel/page authoring that is source-grounded, agent-readable, and Cloudflare-native.",
  },
  {
    area: "Checkout and revenue optimization",
    incumbent: "SamCart and ThriveCart focus heavily on checkout, bumps, upsells, subscriptions, affiliates, and revenue reporting.",
    bumpgradePlan: "Bumpgrade will make checkout, bumps, upsells, subscriptions, and audit trails first-class Stripe-backed objects.",
  },
  {
    area: "Creator email and automation",
    incumbent: "Kit, Systeme.io, Kartra, Kajabi, and Podia cover email, automation, and list growth from different angles.",
    bumpgradePlan: "Bumpgrade will treat email and automation as part of the offer lifecycle, not a disconnected broadcast tool.",
  },
  {
    area: "Products, courses, and memberships",
    incumbent: "Kajabi, Podia, Teachable, ClickFunnels, Systeme.io, and ThriveCart all speak to digital products or learning delivery.",
    bumpgradePlan: "Bumpgrade will model products, access, fulfillment, and subscriptions with stable IDs agents can inspect.",
  },
  {
    area: "Agent readiness",
    incumbent: "Most comparison targets optimize for human dashboards first; some expose developer APIs or newer agent hooks.",
    bumpgradePlan: "Bumpgrade will publish public docs, manifests, source evidence, APIs, and future MCP resources from the start.",
  },
];

export const competitors: Competitor[] = [
  {
    id: "competitor-clickfunnels",
    name: "ClickFunnels",
    slug: "clickfunnels-alternative",
    category: "Funnels and online business platform",
    bestFor: "Creators who want a funnel-first system with pages, checkout, CRM, courses, email, automations, analytics, and affiliate tooling.",
    headline: "ClickFunnels alternative and competitors map for indiepreneurs.",
    summary:
      "ClickFunnels is the principal target and the main ClickFunnels alternative page for Bumpgrade because it frames the online business as a funnel that connects traffic, sales, upsells, courses, community, email, CRM, analytics, and affiliate growth.",
    alternativePosition:
      "Bumpgrade should be the ClickFunnels competitor for publishers who want those same funnel and revenue surfaces to become inspectable by agents, backed by Cloudflare primitives, and explicit about what is live versus planned.",
    sourceId: "source-clickfunnels-home",
    sourceUrl: "https://www.clickfunnels.com/",
    metaTitle: "ClickFunnels Alternative and Competitors for Indiepreneurs",
    metaDescription:
      "A source-grounded ClickFunnels alternative and competitors page for indiepreneurs comparing funnels, checkout, email, courses, CRM, analytics, affiliates, and agent-ready operations.",
    seoKeywords: [
      "ClickFunnels alternative",
      "ClickFunnels alternatives",
      "ClickFunnels competitors",
      "ClickFunnels competitor",
      "sites like ClickFunnels",
      "funnel builder alternative",
    ],
    searchIntent:
      "Compare ClickFunnels with a planned Cloudflare-first publisher growth OS that keeps funnel, checkout, email, course, CRM, affiliate, analytics, and agent-readiness claims tied to sources and roadmap evidence.",
    faqs: [
      {
        question: "Is Bumpgrade a ClickFunnels alternative today?",
        answer:
          "Bumpgrade is an early Cloudflare-first project, so this page marks ClickFunnels-style funnel, checkout, email, course, CRM, analytics, and affiliate capabilities as roadmap targets unless a linked issue or PR shows they have shipped.",
      },
      {
        question: "What makes this ClickFunnels competitors page different?",
        answer:
          "The comparison is built from official source notes, Bumpgrade roadmap issues, public source-data, and explicit caveats so agents and humans can see what is sourced, planned, or already live.",
      },
    ],
    deepDive: {
      title: "How Bumpgrade maps the ClickFunnels competitors category",
      paragraphs: [
        "ClickFunnels is the closest reference point because its public product surface combines funnel pages, checkout, upsells, courses, community, store, email, CRM, analytics, payments, affiliate tooling, API, and webhooks into one online-business platform.",
        "For Bumpgrade, the SEO page is not just a marketing page. It is a product map: each capability cluster should resolve to a roadmap issue, public source data, and eventually a server-side contract that an agent can inspect without scraping private dashboard state.",
        "That makes the core search promise narrower and more accountable than a generic ClickFunnels alternative claim. Bumpgrade is aiming at the same indiepreneur outcome, while keeping live-versus-planned status visible until each feature has shipped.",
      ],
      checklist: [
        {
          area: "Funnel and page builder",
          incumbent:
            "ClickFunnels presents funnels, a drag-and-drop editor, landing pages, surveys, countdown funnels, content pages, websites, and FunnelHubs as funnel entry points.",
          bumpgradePlan: "Bumpgrade's funnel and page builder MVP is tracked in #14 and should expose funnel/page records to future agents.",
        },
        {
          area: "Checkout, bumps, and upsells",
          incumbent:
            "ClickFunnels positions Smart Checkout around checkout pages and describes sell or upsell stages with order forms, checkout, one-click upsells, one-time offers, and order bumps.",
          bumpgradePlan: "Bumpgrade has Stripe commerce architecture in #11 and tracks checkout, order bumps, upsells, downsells, and subscriptions in #15.",
        },
        {
          area: "Email, CRM, and automation",
          incumbent:
            "ClickFunnels groups CRM, email marketing, automations, message hub, appointments, opportunities, two-way messaging, SMS, and email inside the broader funnel model.",
          bumpgradePlan: "Bumpgrade tracks email marketing, list growth, CRM-lite, and automations in #17, with source-linked objects rather than disconnected broadcast state.",
        },
        {
          area: "Courses, memberships, and community",
          incumbent:
            "ClickFunnels lists courses, membership areas, community groups, email sequences, and repeat-stage product delivery as part of the funnel lifecycle.",
          bumpgradePlan: "Bumpgrade tracks products, downloads, courses, memberships, access rules, and subscriptions in #16.",
        },
        {
          area: "Optimization, affiliates, and agent contracts",
          incumbent:
            "ClickFunnels lists A/B testing, analytics, discounts, payments, affiliate center, API, and webhooks among the platform surface area.",
          bumpgradePlan: "Bumpgrade tracks analytics and testing in #18, affiliate/referral management in #19, and agent-readable docs, manifests, APIs, and MCP in #12.",
        },
      ],
      relatedLinks: [
        {
          label: "SamCart alternative",
          href: "/compare/samcart-alternative",
          description: "Checkout-first comparison for buyers focused on order bumps, upsells, subscriptions, and payment flow.",
        },
        {
          label: "Kit alternative",
          href: "/compare/kit-alternative",
          description: "Email-first comparison for buyers focused on newsletters, automations, and creator audience workflows.",
        },
        {
          label: "Bumpgrade roadmap",
          href: "/roadmap",
          description: "The public status map that separates shipped Cloudflare foundation work from planned parity features.",
        },
        {
          label: "Developers and agents",
          href: "/developers-and-agents",
          description: "The agent-readiness surface for source evidence, APIs, public manifests, and future MCP contracts.",
        },
      ],
    },
    evidence: [
      "Official site lists funnels, ClickFunnels editor, smart checkout, A/B testing, landing pages, courses, community, store, email, automations, analytics, payments, and affiliate center.",
      "The homepage describes the funnel mindset across attract, sell, upsell, ascend, and repeat stages.",
    ],
    gapsToAddress: [
      "Actual funnel builder, editor, templates, and publishing are tracked in #14.",
      "Checkout, bumps, upsells, and subscriptions are tracked in #15.",
      "Email, automations, CRM-lite, and analytics are tracked in #17 and #18.",
    ],
    rows: [
      {
        area: "Funnel model",
        incumbent: "ClickFunnels leads with funnel stages and conversion-oriented pages.",
        bumpgradePlan: "Bumpgrade will represent funnels as durable objects that humans and agents can inspect, test, and update safely.",
      },
      {
        area: "Revenue expansion",
        incumbent: "ClickFunnels includes checkout, upsell, discounts, payments, and affiliate center surfaces.",
        bumpgradePlan: "Bumpgrade will build Stripe-backed order bumps, upsells, subscriptions, and affiliate tracking as separate issue slices.",
      },
      {
        area: "Agent posture",
        incumbent: "ClickFunnels is a mature human product surface.",
        bumpgradePlan: "Bumpgrade will add public source evidence and future MCP/API access as part of product parity, not as an afterthought.",
      },
    ],
  },
  {
    id: "competitor-kit",
    name: "Kit",
    slug: "kit-alternative",
    category: "Creator email and automation",
    bestFor: "Creators who primarily need email marketing, visual automations, paid newsletters, recommendations, and lightweight commerce.",
    headline: "Bumpgrade vs Kit: email is part of the funnel, not the whole operating system.",
    summary:
      "Kit is a strong creator-email platform with automation, creator audience segments, commerce, paid newsletters, and recommendations.",
    alternativePosition:
      "Bumpgrade should respect Kit's creator focus while extending the system into checkout, products, funnels, admin evidence, and agent-readable commerce workflows.",
    sourceId: "source-kit-home",
    sourceUrl: "https://kit.com/",
    evidence: [
      "Official navigation highlights email-focused features such as email editor, landing pages, forms, visual automations, app store, commerce, paid recommendations, and paid newsletter.",
      "Kit explicitly frames itself around creators, including artists, authors, bloggers, coaches, course creators, musicians, newsletter creators, podcasters, and YouTubers.",
    ],
    gapsToAddress: [
      "List growth, email marketing, CRM-lite, and automations are tracked in #17.",
      "Products, downloads, courses, and subscriptions are tracked in #16.",
      "Agent source evidence and manifests are tracked in #12.",
    ],
    rows: [
      {
        area: "Email system",
        incumbent: "Kit is centered on creator email, automation, paid newsletters, and recommendations.",
        bumpgradePlan: "Bumpgrade will connect email to funnel steps, offers, product access, checkout events, and agent-safe source evidence.",
      },
      {
        area: "Commerce depth",
        incumbent: "Kit includes creator commerce, but the public positioning is email-first.",
        bumpgradePlan: "Bumpgrade will make checkout, order bumps, upsells, products, and subscriptions core objects.",
      },
      {
        area: "Use case",
        incumbent: "Kit is compelling when the newsletter is the center of gravity.",
        bumpgradePlan: "Bumpgrade should be compelling when the newsletter, offer, checkout, product delivery, and agent workflow need one contract.",
      },
    ],
  },
  {
    id: "competitor-shopify",
    name: "Shopify",
    slug: "shopify-alternative",
    category: "Commerce platform",
    bestFor: "Merchants who need a mature commerce platform for stores, payments, channels, operations, and scale.",
    headline: "Bumpgrade vs Shopify: publisher growth OS, not general retail commerce.",
    summary:
      "Shopify is the reference point for a confident comparison hub: broad, structured, and focused on the buyer's platform decision.",
    alternativePosition:
      "Bumpgrade should not pretend to be Shopify-scale commerce. It should target indiepreneur offers, funnels, checkout, digital products, automations, and agent-native operations.",
    sourceId: "source-shopify-compare",
    sourceUrl: "https://www.shopify.com/compare",
    evidence: [
      "Shopify's compare hub frames the decision around an all-in-one commerce platform and tools to start, run, and grow a business.",
      "The structure uses broad buyer guidance rather than narrow feature-by-feature takedowns.",
    ],
    gapsToAddress: [
      "Overall compare hub tone is delivered in #5.",
      "Pricing and packaging surface is tracked in #20.",
      "Developer and agent surfaces are tracked in #12 and #20.",
    ],
    rows: [
      {
        area: "Commerce scope",
        incumbent: "Shopify is a mature general commerce platform for merchants.",
        bumpgradePlan: "Bumpgrade will target publisher funnels, digital offers, checkout optimization, subscriptions, and content-led commerce.",
      },
      {
        area: "Comparison style",
        incumbent: "Shopify's hub helps buyers compare platform categories clearly.",
        bumpgradePlan: "Bumpgrade uses the same clear buyer posture while citing official sources and roadmap status.",
      },
      {
        area: "Agent surface",
        incumbent: "Shopify has a large ecosystem and developer surface.",
        bumpgradePlan: "Bumpgrade will keep source evidence, roadmap state, and admin work logs public or admin-safe from the first build.",
      },
    ],
  },
  {
    id: "competitor-samcart",
    name: "SamCart",
    slug: "samcart-alternative",
    category: "Checkout and digital business platform",
    bestFor: "Sellers who want checkout pages, order bumps, one-click upsells, payment options, courses, subscriptions, and reporting.",
    headline: "Bumpgrade vs SamCart: checkout power plus funnel and agent context.",
    summary:
      "SamCart focuses the buying moment: checkout customization, order bumps, one-click upsells, subscriptions, courses, reporting, and payment tooling.",
    alternativePosition:
      "Bumpgrade should match the revenue-expansion path while making each checkout, offer, bump, and upsell source-grounded and safe for agent workflows.",
    sourceId: "source-samcart-checkout",
    sourceUrl: "https://www.samcart.com/checkout",
    evidence: [
      "Official checkout page positions checkout as a revenue opportunity with order bumps and one-click upsells.",
      "SamCart's feature lists include checkout, order bumps and add-ons, payment options, payment processors, reporting, sales pages, subscriptions, and courses app.",
    ],
    gapsToAddress: [
      "Checkout, order bump, upsell, and downsell MVP is tracked in #15.",
      "Products, courses, memberships, and subscriptions model is tracked in #16.",
      "Analytics and conversion tracking are tracked in #18.",
    ],
    rows: [
      {
        area: "Checkout",
        incumbent: "SamCart is checkout-first and emphasizes average-order-value expansion.",
        bumpgradePlan: "Bumpgrade will make checkout and revenue expansion core, but tied to funnels, products, source evidence, and admin audit trails.",
      },
      {
        area: "Offer paths",
        incumbent: "SamCart highlights bumps, one-click upsells, subscriptions, and reporting.",
        bumpgradePlan: "Bumpgrade will model bumps, upsells, downsells, subscriptions, and follow-up actions as explicit objects.",
      },
      {
        area: "Agent fit",
        incumbent: "SamCart is optimized for sellers using a dashboard.",
        bumpgradePlan: "Bumpgrade will add confirmed-write contracts so agents can propose checkout changes without silent destructive edits.",
      },
    ],
  },
  {
    id: "competitor-kajabi",
    name: "Kajabi",
    slug: "kajabi-alternative",
    category: "Knowledge commerce platform",
    bestFor: "Experts selling courses, coaching, memberships, newsletters, downloads, podcasts, payments, and marketing automations.",
    headline: "Bumpgrade vs Kajabi: expertise commerce with Cloudflare and agent evidence.",
    summary:
      "Kajabi is a polished all-in-one system for experts who monetize knowledge through products, payments, pages, funnels, automations, and communities.",
    alternativePosition:
      "Bumpgrade should compete for experts who want transparent roadmap state, direct source evidence, agent-ready operations, and smaller issue-sliced product evolution.",
    sourceId: "source-kajabi-home",
    sourceUrl: "https://www.kajabi.com/",
    evidence: [
      "Official homepage frames Kajabi around turning expertise into a business with courses, coaching, communities, memberships, newsletters, downloads, podcasts, payments, funnels, and automations.",
      "Kajabi positions itself as an all-in-one connected system for expert-led businesses.",
    ],
    gapsToAddress: [
      "Products, downloads, courses, memberships, and subscriptions are tracked in #16.",
      "Funnel and page builder MVP is tracked in #14.",
      "Publisher admin apps are tracked in #13.",
    ],
    rows: [
      {
        area: "Knowledge products",
        incumbent: "Kajabi is strong for courses, coaching, memberships, and expert businesses.",
        bumpgradePlan: "Bumpgrade will support knowledge products with explicit access, billing, delivery, and agent-readable IDs.",
      },
      {
        area: "All-in-one promise",
        incumbent: "Kajabi emphasizes replacing scattered tools with one connected system.",
        bumpgradePlan: "Bumpgrade will use the same connected-system goal, with Cloudflare infrastructure and public/admin evidence surfaces.",
      },
      {
        area: "Mobile/admin",
        incumbent: "Kajabi promotes a branded mobile app experience.",
        bumpgradePlan: "Bumpgrade's publisher admin app plan is tracked separately for iOS and Android in #13.",
      },
    ],
  },
  {
    id: "competitor-podia",
    name: "Podia",
    slug: "podia-alternative",
    category: "Creator website and digital products",
    bestFor: "Creators who want a friendly bundle for websites, courses, downloads, coaching, webinars, checkout, affiliates, and email.",
    headline: "Bumpgrade vs Podia: creator simplicity plus agent-native growth operations.",
    summary:
      "Podia positions itself as an all-in-one creator platform for websites, blogs, landing pages, digital products, checkout, affiliates, and email marketing.",
    alternativePosition:
      "Bumpgrade should preserve that low-friction creator feel while adding source-linked comparisons, admin work logs, and direct agent-readable business objects.",
    sourceId: "source-podia-courses",
    sourceUrl: "https://www.podia.com/online-courses",
    evidence: [
      "Official page says Podia puts website, email marketing, digital products, and course-selling features in one place.",
      "The FAQ lists website, blog, landing pages, courses, coaching, downloads, webinars, checkout cart, online store, affiliates, and email marketing.",
    ],
    gapsToAddress: [
      "Products and course/membership model is tracked in #16.",
      "Resources and use-case surfaces are tracked in #20.",
      "Admin user journeys are tracked in #8.",
    ],
    rows: [
      {
        area: "Creator friendliness",
        incumbent: "Podia is approachable for creators who want less tool wiring.",
        bumpgradePlan: "Bumpgrade should keep setup lightweight while exposing enough structure for agents and future APIs.",
      },
      {
        area: "Digital products",
        incumbent: "Podia supports courses, coaching, downloads, webinars, checkout, affiliates, and email.",
        bumpgradePlan: "Bumpgrade will build those as durable product, offer, checkout, and automation records.",
      },
      {
        area: "Evidence",
        incumbent: "Podia is a mature human-facing product.",
        bumpgradePlan: "Bumpgrade will make source evidence and roadmap status part of the public product from day one.",
      },
    ],
  },
  {
    id: "competitor-systeme",
    name: "Systeme.io",
    slug: "systeme-io-alternative",
    category: "All-in-one online business platform",
    bestFor: "Indie sellers who want funnels, email, courses, automation, affiliate management, websites, communities, booking, SMS, and pipelines in one low-friction platform.",
    headline: "Bumpgrade vs Systeme.io: all-in-one scope with stronger source contracts.",
    summary:
      "Systeme.io is a broad all-in-one competitor that combines sales funnels, email marketing, automation, courses, affiliate management, websites, communities, booking, SMS, and pipelines.",
    alternativePosition:
      "Bumpgrade should compete on breadth over time, but differentiate by making each feature state, evidence source, and agent write contract explicit.",
    sourceId: "source-systeme-features",
    sourceUrl: "https://systeme.io/features",
    evidence: [
      "Official features page groups website builder, business automation, sales funnels, email marketing, courses, affiliate management, communities, booking, SMS, and pipelines.",
      "The page says the email list is integrated into sales funnels and websites.",
    ],
    gapsToAddress: [
      "Funnel builder is tracked in #14.",
      "Email and automations are tracked in #17.",
      "Affiliate/referral management is tracked in #19.",
    ],
    rows: [
      {
        area: "Breadth",
        incumbent: "Systeme.io covers many indiepreneur needs in one place.",
        bumpgradePlan: "Bumpgrade will pursue similar breadth through issue-sliced Cloudflare features and public roadmap state.",
      },
      {
        area: "Integrated list/funnel",
        incumbent: "Systeme.io emphasizes email lists integrated with funnels and websites.",
        bumpgradePlan: "Bumpgrade will connect list events to offers, checkout, products, subscriptions, and agent-readable workflows.",
      },
      {
        area: "Roadmap honesty",
        incumbent: "Systeme.io has a mature feature set.",
        bumpgradePlan: "Bumpgrade will mark planned versus live capabilities until parity is actually shipped.",
      },
    ],
  },
  {
    id: "competitor-kartra",
    name: "Kartra",
    slug: "kartra-alternative",
    category: "Marketing suite",
    bestFor: "Teams that want pages, funnels, campaigns, email or SMS, checkouts, affiliate management, lead management, video, webinars, and memberships.",
    headline: "Bumpgrade vs Kartra: marketing suite ambition with agent-safe operations.",
    summary:
      "Kartra is a marketing-suite competitor spanning pages, funnels, email or SMS, checkouts, affiliate management, video, webinars, memberships, and lead management.",
    alternativePosition:
      "Bumpgrade should compete by building the marketing suite as a set of clear contracts: funnel, offer, checkout, lead, automation, source, and permission records.",
    sourceId: "source-kartra-home",
    sourceUrl: "https://kartra.com/home/",
    evidence: [
      "Official navigation highlights funnels and campaigns, email marketing, checkouts, affiliate management, lead management, video marketing, webinars, and memberships.",
      "The homepage groups the journey into creating pages/video/memberships and marketing with lead captures, campaigns, funnels, email or SMS, and checkouts.",
    ],
    gapsToAddress: [
      "Funnel/page builder is tracked in #14.",
      "Email, automations, and CRM-lite are tracked in #17.",
      "Affiliate management is tracked in #19.",
    ],
    rows: [
      {
        area: "Marketing suite",
        incumbent: "Kartra covers campaigns, pages, funnels, leads, email/SMS, checkout, affiliates, video, and webinars.",
        bumpgradePlan: "Bumpgrade will model those workflows as connected records that can be audited and exposed safely to agents.",
      },
      {
        area: "Creator operations",
        incumbent: "Kartra speaks to building and marketing inside a unified suite.",
        bumpgradePlan: "Bumpgrade will tie marketing actions to roadmap, source evidence, and work-log surfaces so future agents can recover context.",
      },
      {
        area: "Implementation risk",
        incumbent: "Kartra's breadth is already live.",
        bumpgradePlan: "Bumpgrade must keep the broad promise phased, with each feature slice independently shipped and verified.",
      },
    ],
  },
  {
    id: "competitor-thrivecart",
    name: "ThriveCart",
    slug: "thrivecart-alternative",
    category: "Checkout, revenue optimization, and LMS",
    bestFor: "Sellers focused on checkout, payment options, order bumps, upsells/downsells, subscriptions, affiliates, fulfillment, LMS, and revenue intelligence.",
    headline: "Bumpgrade vs ThriveCart: checkout optimization with roadmap and agent visibility.",
    summary:
      "ThriveCart is a checkout and revenue-growth platform with strong emphasis on order bumps, upsells, subscriptions, affiliates, fulfillment, LMS, revenue intelligence, and integrations.",
    alternativePosition:
      "Bumpgrade should compete by turning those revenue surfaces into Stripe-backed, agent-readable commerce records rather than isolated dashboard actions.",
    sourceId: "source-thrivecart-features",
    sourceUrl: "https://thrivecart.com/features/",
    evidence: [
      "Official features page lists checkout, payment options, multiple order bumps, one-click upsells and downsells, subscriptions, affiliates, fulfillment, LMS, revenue dashboards, funnel analytics, and integrations.",
      "The page frames ThriveCart as a revenue growth engine for boosting sales, converting customers, automating tasks, tracking performance, and selling courses.",
    ],
    gapsToAddress: [
      "Checkout, order bump, upsell, and downsell MVP is tracked in #15.",
      "Products, downloads, courses, memberships, and subscriptions are tracked in #16.",
      "Analytics and A/B testing are tracked in #18.",
    ],
    rows: [
      {
        area: "Revenue optimization",
        incumbent: "ThriveCart emphasizes checkout, bumps, upsells, downsells, subscriptions, and revenue reporting.",
        bumpgradePlan: "Bumpgrade will build these as explicit commerce and funnel records with audit and source metadata.",
      },
      {
        area: "Learning delivery",
        incumbent: "ThriveCart includes LMS and course/membership-related features.",
        bumpgradePlan: "Bumpgrade's product and access model will include courses, memberships, downloads, and subscriptions.",
      },
      {
        area: "Agent controls",
        incumbent: "ThriveCart is strong at seller dashboard workflows.",
        bumpgradePlan: "Bumpgrade will require confirmation, idempotency, and stale-state checks for future agent writes.",
      },
    ],
  },
];

export function getCompetitorBySlug(slug: string) {
  return competitors.find((competitor) => competitor.slug === slug);
}

export function getSourceById(sourceId: string) {
  return competitorSources.find((source) => source.id === sourceId);
}

export const comparisonRoutes = competitors.map((competitor) => `/compare/${competitor.slug}`);
