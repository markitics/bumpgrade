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
  sourceIds?: string[];
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
    id: "source-clickfunnels-pricing",
    label: "ClickFunnels pricing and plan table",
    url: "https://www.clickfunnels.com/pricing",
    retrievedAt: comparisonRetrievedAt,
    confidence: "high",
    notes: [
      "Official plan table lists ClickFunnels surface areas including funnels, email contacts, courses/community, stores, site pages, landing pages, Webhooks/API Access, CRM pipelines, analytics, payments, affiliate center, A/B testing, API & Webhooks, and Smart Checkout.",
      "Used for feature-surface evidence only; Bumpgrade should not cite current plan prices without a fresh pricing-specific source refresh.",
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
    title: "Compare what buyers can actually use",
    body: "Each competitor note starts with the official product pages rechecked on 2026-05-18.",
  },
  {
    title: "Choose the stack shape",
    body: "Use the hub to decide whether you need a specialist tool or one connected launch system.",
  },
  {
    title: "Start from the buyer journey",
    body: "Funnels, checkout, products, email, analytics, and AI help should work around the same offer.",
  },
];

export const comparisonSeoTargets: ComparisonSeoTarget[] = [
  {
    id: "seo-clickfunnels-alternative",
    route: "/compare/clickfunnels-alternative",
    primaryKeyword: "ClickFunnels alternative",
    supportingKeywords: ["ClickFunnels alternatives", "ClickFunnels competitor", "sites like ClickFunnels"],
    intent:
      "A buyer already knows ClickFunnels and wants an alternative path for funnels, checkout, email, courses, CRM, and AI-assisted operations.",
    evidenceSourceIds: ["source-clickfunnels-home", "source-clickfunnels-pricing"],
    caveat: "Best when the buyer wants the launch path, offer, checkout, and follow-up to stay connected.",
  },
  {
    id: "seo-clickfunnels-competitors",
    route: "/compare/clickfunnels-alternative",
    primaryKeyword: "ClickFunnels competitors",
    supportingKeywords: ["funnel builder competitors", "sales funnel platform comparison", "ClickFunnels vs alternatives"],
    intent:
      "A buyer is comparing the funnel-builder category and wants to understand which tools own the full launch journey.",
    evidenceSourceIds: ["source-clickfunnels-home", "source-clickfunnels-pricing", "source-shopify-compare"],
    caveat: "Use current vendor pages for volatile pricing or packaging decisions before switching tools.",
  },
  {
    id: "seo-indiepreneur-platform-compare",
    route: "/compare",
    primaryKeyword: "indiepreneur platform comparison",
    supportingKeywords: ["creator commerce platform comparison", "funnel checkout email platform", "publisher growth OS"],
    intent:
      "A founder wants one comparison hub for funnel, checkout, email, course, community, affiliate, analytics, and AI-assisted platform decisions.",
    evidenceSourceIds: [
      "source-shopify-compare",
      "source-clickfunnels-home",
      "source-clickfunnels-pricing",
      "source-samcart-checkout",
      "source-kit-home",
    ],
    caveat: "The hub helps choose a product direction by focusing on buyer outcomes instead of tool-category jargon.",
  },
];

export const comparisonHubRows: ComparisonRow[] = [
  {
    area: "Funnels and landing pages",
    incumbent: "ClickFunnels, Systeme.io, Kartra, and Leadpages emphasize page and funnel creation.",
    bumpgradePlan: "Bumpgrade connects landing pages and funnel steps to checkout, products, email follow-up, and audience workflows.",
  },
  {
    area: "Checkout and revenue optimization",
    incumbent: "SamCart and ThriveCart focus heavily on checkout, bumps, upsells, subscriptions, affiliates, and revenue reporting.",
    bumpgradePlan: "Bumpgrade treats checkout, bumps, upsells, subscriptions, and audit trails as part of the same offer path.",
  },
  {
    area: "Creator email and automation",
    incumbent: "Kit, Systeme.io, Kartra, Kajabi, and Podia cover email, automation, and list growth from different angles.",
    bumpgradePlan: "Bumpgrade treats email and automation as part of the offer lifecycle, not a disconnected broadcast tool.",
  },
  {
    area: "Products, courses, and memberships",
    incumbent: "Kajabi, Podia, Teachable, ClickFunnels, Systeme.io, and ThriveCart all speak to digital products or learning delivery.",
    bumpgradePlan: "Bumpgrade keeps products, access, fulfillment, and subscriptions attached to the buyer record.",
  },
  {
    area: "AI assistance",
    incumbent: "Most comparison targets optimize for human dashboards first; some expose developer APIs or newer agent hooks.",
    bumpgradePlan: "Bumpgrade keeps launch context readable enough for AI helpers to summarize, suggest, and prepare changes.",
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
      "Bumpgrade is for publishers who want those same funnel and revenue surfaces connected to products, customers, follow-up, reporting, and practical AI help.",
    sourceId: "source-clickfunnels-home",
    sourceUrl: "https://www.clickfunnels.com/",
    sourceIds: ["source-clickfunnels-home", "source-clickfunnels-pricing"],
    metaTitle: "ClickFunnels Alternative and Competitors for Indiepreneurs",
    metaDescription:
      "A ClickFunnels alternative and competitors page for indiepreneurs comparing funnels, checkout, email, courses, CRM, analytics, affiliates, and AI-assisted operations.",
    seoKeywords: [
      "ClickFunnels alternative",
      "ClickFunnels alternatives",
      "ClickFunnels competitors",
      "ClickFunnels competitor",
      "sites like ClickFunnels",
      "funnel builder alternative",
    ],
    searchIntent:
      "Compare ClickFunnels with a publisher growth system that connects funnel, checkout, email, course, CRM, affiliate, analytics, and AI-assisted launch work.",
    faqs: [
      {
        question: "Is Bumpgrade a ClickFunnels alternative today?",
        answer:
          "Bumpgrade is launching as a connected publisher growth system for funnels, checkout, email, products, analytics, and AI-assisted operations.",
      },
      {
        question: "What makes this ClickFunnels competitors page different?",
        answer:
          "The comparison focuses on the buyer journey: attract the right people, sell the first offer, increase order value, deliver access, and follow up.",
      },
    ],
    deepDive: {
      title: "How Bumpgrade maps the ClickFunnels competitors category",
      paragraphs: [
        "ClickFunnels is the closest reference point because its public product surface combines funnel pages, checkout, upsells, courses, community, store, email, CRM, analytics, payments, affiliate tooling, API, and webhooks into one online-business platform.",
        "For Bumpgrade, the comparison starts from the publisher's work: shape the offer, publish a page, take payment, deliver access, and learn what to improve next.",
        "That makes the core search promise narrower than a generic ClickFunnels alternative claim. Bumpgrade is aimed at the same indiepreneur outcome with a simpler connected launch path.",
      ],
      checklist: [
        {
          area: "Funnel and page builder",
          incumbent:
            "ClickFunnels presents funnels, a drag-and-drop editor, landing pages, surveys, countdown funnels, content pages, websites, and FunnelHubs as funnel entry points.",
          bumpgradePlan: "Bumpgrade keeps pages and funnel steps attached to the offer, checkout path, subscribers, and launch analytics.",
        },
        {
          area: "Checkout, bumps, and upsells",
          incumbent:
            "ClickFunnels positions Smart Checkout around checkout pages and describes sell or upsell stages with order forms, checkout, one-click upsells, one-time offers, and order bumps.",
          bumpgradePlan: "Bumpgrade connects checkout, order bumps, upsells, subscriptions, and post-purchase paths to the same offer record.",
        },
        {
          area: "Email, CRM, and automation",
          incumbent:
            "ClickFunnels groups CRM, email marketing, automations, message hub, appointments, opportunities, two-way messaging, SMS, and email inside the broader funnel model.",
          bumpgradePlan: "Bumpgrade ties email marketing, list growth, CRM-lite notes, and automations to offer and customer events.",
        },
        {
          area: "Courses, memberships, and community",
          incumbent:
            "ClickFunnels lists courses, membership areas, community groups, email sequences, and repeat-stage product delivery as part of the funnel lifecycle.",
          bumpgradePlan: "Bumpgrade keeps products, downloads, courses, memberships, access rules, and subscriptions in the same buyer journey.",
        },
        {
          area: "Optimization, affiliates, and agent contracts",
          incumbent:
            "ClickFunnels lists A/B testing, analytics, discounts, payments, affiliate center, API, and webhooks among the platform surface area.",
          bumpgradePlan: "Bumpgrade connects testing, analytics, discounts, payments, affiliate referrals, and AI assistance to the launch record.",
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
          label: "Bumpgrade features",
          href: "/features",
          description: "The feature overview for pages, checkout, products, email, analytics, and AI assistance.",
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
      "Use Bumpgrade when your funnel, checkout, email, product delivery, and reporting need to stay connected.",
      "Use a specialist checkout tool when you only need checkout optimization around an otherwise separate stack.",
      "Use a specialist email tool when the newsletter is the center of gravity and the offer system is simple.",
    ],
    rows: [
      {
        area: "Funnel model",
        incumbent: "ClickFunnels leads with funnel stages and conversion-oriented pages.",
        bumpgradePlan: "Bumpgrade represents funnels as offer paths that humans and AI helpers can inspect, test, and improve.",
      },
      {
        area: "Revenue expansion",
        incumbent: "ClickFunnels includes checkout, upsell, discounts, payments, and affiliate center surfaces.",
        bumpgradePlan: "Bumpgrade connects order bumps, upsells, subscriptions, discounts, payments, and affiliate tracking to the offer.",
      },
      {
        area: "AI help",
        incumbent: "ClickFunnels is a mature human product surface.",
        bumpgradePlan: "Bumpgrade keeps enough structured context for AI helpers to explain the launch and prepare safe changes.",
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
      "Bumpgrade keeps Kit's creator focus but extends the workflow into checkout, products, funnels, customer context, and AI-assisted launch work.",
    sourceId: "source-kit-home",
    sourceUrl: "https://kit.com/",
    evidence: [
      "Official navigation highlights email-focused features such as email editor, landing pages, forms, visual automations, app store, commerce, paid recommendations, and paid newsletter.",
      "Kit explicitly frames itself around creators, including artists, authors, bloggers, coaches, course creators, musicians, newsletter creators, podcasters, and YouTubers.",
    ],
    gapsToAddress: [
      "Use Bumpgrade when the email list needs to connect directly to an offer, checkout path, and product access.",
      "Use Kit when email publishing and creator newsletters are the main job.",
      "Use both carefully when the newsletter should stay separate from checkout and product delivery.",
    ],
    rows: [
      {
        area: "Email system",
        incumbent: "Kit is centered on creator email, automation, paid newsletters, and recommendations.",
        bumpgradePlan: "Bumpgrade connects email to funnel steps, offers, product access, checkout events, and customer context.",
      },
      {
        area: "Commerce depth",
        incumbent: "Kit includes creator commerce, but the public positioning is email-first.",
        bumpgradePlan: "Bumpgrade makes checkout, order bumps, upsells, products, and subscriptions part of the launch system.",
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
      "Bumpgrade is not trying to be Shopify-scale commerce. It targets indiepreneur offers, funnels, checkout, digital products, automations, and AI-assisted operations.",
    sourceId: "source-shopify-compare",
    sourceUrl: "https://www.shopify.com/compare",
    evidence: [
      "Shopify's compare hub frames the decision around an all-in-one commerce platform and tools to start, run, and grow a business.",
      "The structure uses broad buyer guidance rather than narrow feature-by-feature takedowns.",
    ],
    gapsToAddress: [
      "Use Bumpgrade for audience-led offers, digital products, and simple launch paths.",
      "Use Shopify when you need a mature general retail commerce platform.",
      "Use the comparison hub to decide whether the store or the offer is the center of gravity.",
    ],
    rows: [
      {
        area: "Commerce scope",
        incumbent: "Shopify is a mature general commerce platform for merchants.",
        bumpgradePlan: "Bumpgrade targets publisher funnels, digital offers, checkout optimization, subscriptions, and content-led commerce.",
      },
      {
        area: "Comparison style",
        incumbent: "Shopify's hub helps buyers compare platform categories clearly.",
        bumpgradePlan: "Bumpgrade uses the same clear buyer posture while focusing on publisher launch jobs.",
      },
      {
        area: "AI surface",
        incumbent: "Shopify has a large ecosystem and developer surface.",
        bumpgradePlan: "Bumpgrade keeps offer, customer, checkout, and product context readable enough for AI helpers.",
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
      "Bumpgrade matches the revenue-expansion path while keeping checkout, offers, bumps, upsells, products, and follow-up in one workflow.",
    sourceId: "source-samcart-checkout",
    sourceUrl: "https://www.samcart.com/checkout",
    evidence: [
      "Official checkout page positions checkout as a revenue opportunity with order bumps and one-click upsells.",
      "SamCart's feature lists include checkout, order bumps and add-ons, payment options, payment processors, reporting, sales pages, subscriptions, and courses app.",
    ],
    gapsToAddress: [
      "Use Bumpgrade when checkout should stay connected to the funnel, email list, product access, and launch reporting.",
      "Use SamCart when checkout optimization is the center of the business system.",
      "Use the comparison to decide whether revenue expansion or the full buyer journey is the bigger constraint.",
    ],
    rows: [
      {
        area: "Checkout",
        incumbent: "SamCart is checkout-first and emphasizes average-order-value expansion.",
        bumpgradePlan: "Bumpgrade makes checkout and revenue expansion core, but ties them to funnels, products, and follow-up.",
      },
      {
        area: "Offer paths",
        incumbent: "SamCart highlights bumps, one-click upsells, subscriptions, and reporting.",
        bumpgradePlan: "Bumpgrade models bumps, upsells, downsells, subscriptions, and follow-up actions around the same offer.",
      },
      {
        area: "AI fit",
        incumbent: "SamCart is optimized for sellers using a dashboard.",
        bumpgradePlan: "Bumpgrade keeps checkout context clear enough for AI helpers to suggest changes without hiding risk.",
      },
    ],
  },
  {
    id: "competitor-kajabi",
    name: "Kajabi",
    slug: "kajabi-alternative",
    category: "Knowledge commerce platform",
    bestFor: "Experts selling courses, coaching, memberships, newsletters, downloads, podcasts, payments, and marketing automations.",
    headline: "Bumpgrade vs Kajabi: expertise commerce with launch context.",
    summary:
      "Kajabi is a polished all-in-one system for experts who monetize knowledge through products, payments, pages, funnels, automations, and communities.",
    alternativePosition:
      "Bumpgrade is for experts who want pages, checkout, products, email, and buyer context to stay connected as the offer evolves.",
    sourceId: "source-kajabi-home",
    sourceUrl: "https://www.kajabi.com/",
    evidence: [
      "Official homepage frames Kajabi around turning expertise into a business with courses, coaching, communities, memberships, newsletters, downloads, podcasts, payments, funnels, and automations.",
      "Kajabi positions itself as an all-in-one connected system for expert-led businesses.",
    ],
    gapsToAddress: [
      "Use Bumpgrade when the first offer matters more than building a full academy from day one.",
      "Use Kajabi when courses, communities, and expert-led content are already the whole business.",
      "Use the comparison to decide whether simplicity or a mature knowledge-commerce suite matters more right now.",
    ],
    rows: [
      {
        area: "Knowledge products",
        incumbent: "Kajabi is strong for courses, coaching, memberships, and expert businesses.",
        bumpgradePlan: "Bumpgrade supports knowledge products with access, billing, delivery, and customer context tied together.",
      },
      {
        area: "All-in-one promise",
        incumbent: "Kajabi emphasizes replacing scattered tools with one connected system.",
        bumpgradePlan: "Bumpgrade uses the same connected-system goal with a launch-first workflow for small teams.",
      },
      {
        area: "Mobile visibility",
        incumbent: "Kajabi promotes a branded mobile app experience.",
        bumpgradePlan: "Bumpgrade gives publishers a mobile-readable view of launch, checkout, product, and customer state.",
      },
    ],
  },
  {
    id: "competitor-podia",
    name: "Podia",
    slug: "podia-alternative",
    category: "Creator website and digital products",
    bestFor: "Creators who want a friendly bundle for websites, courses, downloads, coaching, webinars, checkout, affiliates, and email.",
    headline: "Bumpgrade vs Podia: creator simplicity plus connected growth operations.",
    summary:
      "Podia positions itself as an all-in-one creator platform for websites, blogs, landing pages, digital products, checkout, affiliates, and email marketing.",
    alternativePosition:
      "Bumpgrade preserves that low-friction creator feel while connecting offers, checkout, products, email, reporting, and AI-assisted operations.",
    sourceId: "source-podia-courses",
    sourceUrl: "https://www.podia.com/online-courses",
    evidence: [
      "Official page says Podia puts website, email marketing, digital products, and course-selling features in one place.",
      "The FAQ lists website, blog, landing pages, courses, coaching, downloads, webinars, checkout cart, online store, affiliates, and email marketing.",
    ],
    gapsToAddress: [
      "Use Bumpgrade when the offer, checkout, product access, and follow-up should be shaped together.",
      "Use Podia when creator-friendly websites and digital-product delivery are already enough.",
      "Use the comparison to decide whether your next constraint is simplicity or connected launch operations.",
    ],
    rows: [
      {
        area: "Creator friendliness",
        incumbent: "Podia is approachable for creators who want less tool wiring.",
        bumpgradePlan: "Bumpgrade keeps setup lightweight while preserving enough structure for future AI and API help.",
      },
      {
        area: "Digital products",
        incumbent: "Podia supports courses, coaching, downloads, webinars, checkout, affiliates, and email.",
        bumpgradePlan: "Bumpgrade keeps products, offers, checkout, and automation records connected.",
      },
      {
        area: "Launch clarity",
        incumbent: "Podia is a mature human-facing product.",
        bumpgradePlan: "Bumpgrade keeps launch context visible so publishers can see what to improve next.",
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
      "Bumpgrade competes on breadth by connecting each offer, funnel, checkout, email, product, affiliate, and analytics step around the same launch.",
    sourceId: "source-systeme-features",
    sourceUrl: "https://systeme.io/features",
    evidence: [
      "Official features page groups website builder, business automation, sales funnels, email marketing, courses, affiliate management, communities, booking, SMS, and pipelines.",
      "The page says the email list is integrated into sales funnels and websites.",
    ],
    gapsToAddress: [
      "Use Bumpgrade when you want the launch path and buyer context to drive the system.",
      "Use Systeme.io when low-cost all-in-one breadth is the most important constraint.",
      "Use the comparison to decide whether integrated scope or launch-specific context matters more.",
    ],
    rows: [
      {
        area: "Breadth",
        incumbent: "Systeme.io covers many indiepreneur needs in one place.",
        bumpgradePlan: "Bumpgrade pursues similar breadth through a publisher-specific launch workflow.",
      },
      {
        area: "Integrated list/funnel",
        incumbent: "Systeme.io emphasizes email lists integrated with funnels and websites.",
        bumpgradePlan: "Bumpgrade connects list events to offers, checkout, products, subscriptions, and AI-assisted workflows.",
      },
      {
        area: "Launch clarity",
        incumbent: "Systeme.io has a mature feature set.",
        bumpgradePlan: "Bumpgrade keeps the publisher focused on what helps the next launch earn revenue.",
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
      "Use Bumpgrade when launch pages, leads, checkout, follow-up, and customer access should stay connected.",
      "Use Kartra when you need a mature marketing suite with video, webinars, memberships, and campaign depth.",
      "Use the comparison to decide whether campaign breadth or launch clarity is the bigger constraint.",
    ],
    rows: [
      {
        area: "Marketing suite",
        incumbent: "Kartra covers campaigns, pages, funnels, leads, email/SMS, checkout, affiliates, video, and webinars.",
        bumpgradePlan: "Bumpgrade models those workflows as connected records around offers, buyers, and follow-up.",
      },
      {
        area: "Creator operations",
        incumbent: "Kartra speaks to building and marketing inside a unified suite.",
        bumpgradePlan: "Bumpgrade ties marketing actions to launch context so future AI helpers can recover the why behind changes.",
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
    headline: "Bumpgrade vs ThriveCart: checkout optimization with launch visibility.",
    summary:
      "ThriveCart is a checkout and revenue-growth platform with strong emphasis on order bumps, upsells, subscriptions, affiliates, fulfillment, LMS, revenue intelligence, and integrations.",
    alternativePosition:
      "Bumpgrade turns those revenue surfaces into connected commerce records instead of isolated dashboard actions.",
    sourceId: "source-thrivecart-features",
    sourceUrl: "https://thrivecart.com/features/",
    evidence: [
      "Official features page lists checkout, payment options, multiple order bumps, one-click upsells and downsells, subscriptions, affiliates, fulfillment, LMS, revenue dashboards, funnel analytics, and integrations.",
      "The page frames ThriveCart as a revenue growth engine for boosting sales, converting customers, automating tasks, tracking performance, and selling courses.",
    ],
    gapsToAddress: [
      "Use Bumpgrade when checkout should connect to funnel, product delivery, subscribers, affiliates, and analytics.",
      "Use ThriveCart when checkout and revenue optimization are the main system.",
      "Use the comparison to decide whether the checkout or the full launch path is the center of gravity.",
    ],
    rows: [
      {
        area: "Revenue optimization",
        incumbent: "ThriveCart emphasizes checkout, bumps, upsells, downsells, subscriptions, and revenue reporting.",
        bumpgradePlan: "Bumpgrade builds these as commerce and funnel records connected to the buyer journey.",
      },
      {
        area: "Learning delivery",
        incumbent: "ThriveCart includes LMS and course/membership-related features.",
        bumpgradePlan: "Bumpgrade's product and access model includes courses, memberships, downloads, and subscriptions.",
      },
      {
        area: "AI controls",
        incumbent: "ThriveCart is strong at seller dashboard workflows.",
        bumpgradePlan: "Bumpgrade keeps commerce changes explicit so AI-assisted edits can be reviewed before they affect buyers.",
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

export function getSourcesByIds(sourceIds: string[]) {
  return sourceIds.flatMap((sourceId) => {
    const source = getSourceById(sourceId);
    return source ? [source] : [];
  });
}

export const comparisonRoutes = competitors.map((competitor) => `/compare/${competitor.slug}`);
