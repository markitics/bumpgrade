export type PricingV2Status = "exploration" | "decision-needed";

export type PricingV2SourceReference = {
  id: string;
  label: string;
  url: string;
  retrievedAt: string;
  relevantPattern: string;
  caution: string;
};

export type PricingV2Meter = {
  id: string;
  label: string;
  unit: string;
  productArea: string;
  role: string;
  includedStartingPoint: string;
  scalingSignal: string;
  evidenceRoutes: string[];
};

export type PricingV2Model = {
  id: string;
  title: string;
  status: PricingV2Status;
  summary: string;
  fit: string;
  risk: string;
};

export type PricingV2DecisionQuestion = {
  id: string;
  question: string;
  whyItMatters: string;
};

export const pricingV2UpdatedAt = "2026-05-22";

export const pricingV2SourceReferences: PricingV2SourceReference[] = [
  {
    id: "source-stripe-pricing-2026-05-22",
    label: "Stripe pricing",
    url: "https://stripe.com/pricing",
    retrievedAt: "2026-05-22",
    relevantPattern:
      "Pay-as-you-go standard pricing sits beside custom pricing for volume, country-specific, and multi-product situations.",
    caution: "Use only as structure inspiration. Do not copy Stripe rates or present Bumpgrade as a payments processor.",
  },
  {
    id: "source-resend-pricing-2026-05-22",
    label: "Resend pricing",
    url: "https://resend.com/pricing",
    retrievedAt: "2026-05-22",
    relevantPattern:
      "Email pricing is presented around send volume and product dimensions such as transactional and marketing email.",
    caution: "Use only as a pattern for understandable usage dimensions. Bumpgrade email sending costs still need provider proof.",
  },
  {
    id: "source-samcart-updated-plans-2026-05-22",
    label: "SamCart updated plans",
    url: "https://help.samcart.com/support/solutions/articles/60001525818-a-guide-to-samcart-s-updated-plans",
    retrievedAt: "2026-05-22",
    relevantPattern:
      "One package can include all conversion features while the monthly subscription scales as the seller grows.",
    caution: "Use only as packaging inspiration. Bumpgrade must not claim SamCart pricing parity without a fresh source check.",
  },
];

export const pricingV2Models: PricingV2Model[] = [
  {
    id: "model-base-plus-usage",
    title: "Base subscription plus usage bands",
    status: "exploration",
    summary:
      "One core Bumpgrade workspace includes the launch stack, then predictable meters scale with audience, checkout, sending, domains, and support needs.",
    fit: "Best if Mark wants a simple first sale with room for larger publishers to grow without renegotiating every feature.",
    risk: "Needs very clear included allowances so prospects do not feel charged for every click before value is proven.",
  },
  {
    id: "model-all-features-scale-with-growth",
    title: "All core features, scale with growth",
    status: "exploration",
    summary:
      "Keep funnels, checkout, products, email, analytics, affiliates, and agents available from day one, then scale price by business activity.",
    fit: "Best if Bumpgrade wants a SamCart-like promise that creators do not need to choose between fragmented feature gates.",
    risk: "Requires discipline around high-cost support, sending, and agent workloads so the lowest tier does not become expensive to serve.",
  },
  {
    id: "model-custom-for-high-volume",
    title: "Custom package for high-volume operators",
    status: "decision-needed",
    summary:
      "Large publishers, agencies, and teams with unusual payment, migration, compliance, or support needs move to a custom package.",
    fit: "Best when checkout volume, deliverability, domain complexity, or done-with-you setup makes a public calculator misleading.",
    risk: "Needs a crisp threshold so standard prospects are not pushed into a sales conversation too early.",
  },
];

export const pricingV2Meters: PricingV2Meter[] = [
  {
    id: "meter-funnels",
    label: "Funnels and pages",
    unit: "published funnels",
    productArea: "Funnels",
    role: "Core value meter",
    includedStartingPoint: "One active launch funnel with opt-in, sales, checkout, and thank-you path.",
    scalingSignal: "More live funnels, duplicated launch systems, reusable templates, or client workspaces.",
    evidenceRoutes: ["/funnels/source-data", "/features/simple-landing-page"],
  },
  {
    id: "meter-contacts",
    label: "Contacts and audience",
    unit: "contacts",
    productArea: "Audience",
    role: "Audience growth meter",
    includedStartingPoint: "A starter list for early launch validation, tags, and simple segmentation.",
    scalingSignal: "Growing subscriber records, richer segmentation, imports, and CRM-lite review needs.",
    evidenceRoutes: ["/audience/source-data"],
  },
  {
    id: "meter-email-sends",
    label: "Email sends",
    unit: "emails sent",
    productArea: "Email",
    role: "Provider-cost meter",
    includedStartingPoint: "Enough transactional and launch-nurture sending for a first campaign.",
    scalingSignal: "Broadcast frequency, automation volume, provider-send readiness, and deliverability support.",
    evidenceRoutes: ["/audience/source-data", "/analytics/source-data"],
  },
  {
    id: "meter-products",
    label: "Products and memberships",
    unit: "active products",
    productArea: "Products",
    role: "Fulfillment complexity meter",
    includedStartingPoint: "A first digital product, course, membership, download, or paid resource library.",
    scalingSignal: "More protected content, subscription-backed access, revocation workflows, and customer lookup needs.",
    evidenceRoutes: ["/products/source-data", "/products/entitlements"],
  },
  {
    id: "meter-checkout-volume",
    label: "Checkout volume",
    unit: "processed order volume",
    productArea: "Checkout",
    role: "Seller growth meter",
    includedStartingPoint: "Sandbox-proven checkout structure and live path review before customer charges.",
    scalingSignal: "Higher monthly checkout volume, post-purchase offers, attribution, and revenue reporting needs.",
    evidenceRoutes: ["/offers/source-data", "/commerce/source-data"],
  },
  {
    id: "meter-agents",
    label: "Agent work",
    unit: "confirmed proposals",
    productArea: "Agents",
    role: "Operational leverage meter",
    includedStartingPoint: "Read-only source-data, public docs, and owner-confirmed proposal paths.",
    scalingSignal: "More agent-assisted drafts, audits, confirmed writes, and review history across launches.",
    evidenceRoutes: ["/developers-and-agents", "/agent-docs/source-data"],
  },
  {
    id: "meter-domains",
    label: "Domains",
    unit: "connected domains",
    productArea: "Account setup",
    role: "Configuration meter",
    includedStartingPoint: "One Bumpgrade subdomain plus instructions for a domain the publisher already owns.",
    scalingSignal: "Multiple launch domains, client domains, DNS verification reviews, and login handoff needs.",
    evidenceRoutes: ["/account/setup", "/account/source-data"],
  },
  {
    id: "meter-support",
    label: "Setup and support",
    unit: "human review level",
    productArea: "Service",
    role: "White-glove meter",
    includedStartingPoint: "Self-guided setup with reviewed launch/payment boundaries.",
    scalingSignal: "Done-with-you migration, funnel buildout, checkout review, deliverability help, or operator support.",
    evidenceRoutes: ["/pricing", "/admin/user-journeys/source-data"],
  },
];

export const pricingV2DecisionQuestions: PricingV2DecisionQuestion[] = [
  {
    id: "decision-public-allowances",
    question: "Which allowances should be public before live self-serve checkout?",
    whyItMatters: "A usage page can help prospects, but checkout-backed limits need Stripe and entitlement proof before they become contractual.",
  },
  {
    id: "decision-growth-meter",
    question: "Should Bumpgrade scale on contacts, checkout volume, or both?",
    whyItMatters: "Contacts reflect audience value, while checkout volume tracks seller success. Using both may be fair but harder to explain.",
  },
  {
    id: "decision-all-features",
    question: "Are all core growth features included from day one?",
    whyItMatters: "The clearest competitor response is fewer feature gates, but costly email, support, and agent workloads still need guardrails.",
  },
  {
    id: "decision-custom-threshold",
    question: "When does a publisher move from public pricing to custom?",
    whyItMatters: "High-volume operators need flexibility, but small publishers should not feel forced into sales before seeing a clear starting point.",
  },
];

export const pricingV2SourceData = {
  id: "bumpgrade-pricing-v2-source-data",
  status: "public-exploration",
  updatedAt: pricingV2UpdatedAt,
  issue: 317,
  parentIssue: 313,
  route: "/pricing-v2",
  sourceDataRoute: "/pricing-v2/source-data",
  caveat:
    "This is a usage-based pricing exploration, not a live checkout, final price list, or subscription entitlement contract. Billing-impacting claims still require issue #316 or later Stripe proof.",
  sourceReferences: pricingV2SourceReferences,
  models: pricingV2Models,
  meters: pricingV2Meters,
  decisionQuestions: pricingV2DecisionQuestions,
  relatedRoutes: [
    "/pricing",
    "/content/source-data",
    "/commerce/source-data",
    "/account/source-data",
    "/agent-docs/source-data",
  ],
};
