export type PricingPlanSlug = "experiment" | "grow" | "enterprise";
export type SelfServePricingPlanSlug = Exclude<PricingPlanSlug, "enterprise">;

export type PricingPlan = {
  slug: PricingPlanSlug;
  name: string;
  label: string;
  headline: string;
  monthlyAmountCents: number | null;
  billingInterval: "month" | "contact";
  status: "self_serve" | "contact";
  productId: string | null;
  priceId: string | null;
  cta: string;
  description: string;
  included: string[];
  bestFor: string;
};

export type PricingFeature = {
  id: string;
  label: string;
  summary: string;
  minimumPlan: PricingPlanSlug;
  availability: Record<PricingPlanSlug, string>;
};

export const selfServePricingUpdatedAt = "2026-05-22";
export const billingCheckoutRoute = "/api/billing/checkout";
export const billingCheckoutSuccessRoute = "/pricing/success";
export const pricingSourceIssue = 316;

export const whiteGloveSetupAddon = {
  slug: "white-glove-setup",
  name: "White glove",
  label: "Optional setup",
  description: "Paired with humans to help you set up and scale with confidence.",
  unitAmountCents: 100_000,
  currency: "usd",
  productId: "product-bumpgrade-white-glove-setup",
  priceId: "price-bumpgrade-white-glove-setup-usd",
};

export const pricingPlans: PricingPlan[] = [
  {
    slug: "experiment",
    name: "Experiment",
    label: "Start today",
    headline: "One launch workspace for the first serious offer.",
    monthlyAmountCents: 9_700,
    billingInterval: "month",
    status: "self_serve",
    productId: "product-bumpgrade-experiment",
    priceId: "price-bumpgrade-experiment-monthly-usd",
    cta: "Start Experiment",
    description:
      "For publishers validating a funnel, checkout, product, and audience loop without stitching together five tools.",
    bestFor: "Solo publishers and small teams launching one offer at a time.",
    included: [
      "1 Bumpgrade publisher workspace",
      "Landing pages, funnel steps, checkout handoff, products, and audience capture",
      "Bumpgrade subdomain reservation after payment",
      "Basic launch analytics and AI-ready launch context",
      "AI coach context for launch planning and review",
    ],
  },
  {
    slug: "grow",
    name: "Grow",
    label: "Most complete",
    headline: "More launch surface for publishers ready to scale.",
    monthlyAmountCents: 19_700,
    billingInterval: "month",
    status: "self_serve",
    productId: "product-bumpgrade-grow",
    priceId: "price-bumpgrade-grow-monthly-usd",
    cta: "Start Grow",
    description:
      "For publishers who need richer automation, custom domain setup, affiliate tracking, and optimization reports.",
    bestFor: "Operators growing multiple offers, partners, or repeated launches.",
    included: [
      "Everything in Experiment",
      "Custom-domain onboarding for domains you already own",
      "Affiliate/referral tracking and partner reporting",
      "Advanced analytics, experiments, and launch alerts",
      "Higher plan limits through configurable plan access",
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    label: "Custom",
    headline: "SSO, custom development, and launch systems for teams.",
    monthlyAmountCents: null,
    billingInterval: "contact",
    status: "contact",
    productId: null,
    priceId: null,
    cta: "Contact us",
    description:
      "For teams that need SSO, custom development, dedicated implementation help, or unusual billing and data boundaries.",
    bestFor: "Agencies, publishers with internal teams, and operators with special requirements.",
    included: [
      "Everything in Grow",
      "SSO planning",
      "Custom development and integration support",
      "Dedicated launch architecture review",
      "Team-specific security, data, and workflow requirements",
    ],
  },
];

export const pricingFeatureMatrix: PricingFeature[] = [
  {
    id: "landing-pages-funnels",
    label: "Landing pages and funnels",
    summary: "Build opt-in, sales, webinar, resource, checkout handoff, and thank-you paths.",
    minimumPlan: "experiment",
    availability: {
      experiment: "Included",
      grow: "Included with more reusable launch structure",
      enterprise: "Included with custom implementation support",
    },
  },
  {
    id: "checkout-products",
    label: "Checkout, order bumps, and products",
    summary: "Model offers, checkout paths, product access, and post-purchase decisions.",
    minimumPlan: "experiment",
    availability: {
      experiment: "Included",
      grow: "Included with advanced offer tracking",
      enterprise: "Included with custom offer architecture",
    },
  },
  {
    id: "email-crm",
    label: "Email, CRM, and audience capture",
    summary: "Collect subscribers, inspect consent, prepare broadcasts, and record follow-up notes.",
    minimumPlan: "experiment",
    availability: {
      experiment: "Included",
      grow: "Included with richer automation controls",
      enterprise: "Included with team workflow support",
    },
  },
  {
    id: "custom-domains",
    label: "Custom domains",
    summary: "Connect domains you already own after reserving the default Bumpgrade hostname.",
    minimumPlan: "grow",
    availability: {
      experiment: "Bumpgrade subdomain included",
      grow: "Included",
      enterprise: "Included with custom domain support",
    },
  },
  {
    id: "affiliates-analytics",
    label: "Affiliates, experiments, and advanced analytics",
    summary: "Track partners, attribution, experiments, cohorts, and launch alerts.",
    minimumPlan: "grow",
    availability: {
      experiment: "Basic analytics",
      grow: "Included",
      enterprise: "Included with custom reporting",
    },
  },
  {
    id: "sso-custom-development",
    label: "SSO and custom development",
    summary: "Dedicated help for security, integration, team, and unusual workflow requirements.",
    minimumPlan: "enterprise",
    availability: {
      experiment: "Not included",
      grow: "Not included",
      enterprise: "Included",
    },
  },
];

const planOrder: Record<PricingPlanSlug, number> = {
  experiment: 1,
  grow: 2,
  enterprise: 3,
};

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function isSelfServePricingPlanSlug(value: string | null | undefined): value is SelfServePricingPlanSlug {
  return value === "experiment" || value === "grow";
}

export function pricingPlanBySlug(slug: PricingPlanSlug) {
  return pricingPlans.find((plan) => plan.slug === slug) ?? null;
}

export function selfServePricingPlanBySlug(slug: string | null | undefined) {
  if (!isSelfServePricingPlanSlug(slug)) return null;
  return pricingPlanBySlug(slug) as (PricingPlan & { slug: SelfServePricingPlanSlug }) | null;
}

export function planIncludesFeature(planSlug: PricingPlanSlug, feature: PricingFeature) {
  return planOrder[planSlug] >= planOrder[feature.minimumPlan];
}

export const selfServePricingContract = {
  id: "bumpgrade-self-serve-pricing-v1",
  status: "live",
  issue: pricingSourceIssue,
  updatedAt: selfServePricingUpdatedAt,
  checkoutRoute: billingCheckoutRoute,
  successRoute: billingCheckoutSuccessRoute,
  stripeMode: "live",
  publicPlans: pricingPlans.map((plan) => ({
    slug: plan.slug,
    name: plan.name,
    status: plan.status,
    monthlyAmountCents: plan.monthlyAmountCents,
    billingInterval: plan.billingInterval,
    productId: plan.productId,
    priceId: plan.priceId,
  })),
  setupAddon: whiteGloveSetupAddon,
  provisioning:
    "Successful Stripe Checkout Sessions are verified server-side on /pricing/success and create active publisher plan entitlements keyed by buyer email.",
  webhookCaveat:
    "Cloudflare currently has live Stripe secret material configured, but live webhook signing secret setup is still a separate operational step.",
};
