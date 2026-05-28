import {
  anonymousPlaygroundApiRoute,
  anonymousPlaygroundClaimApiRoute,
  anonymousPlaygroundClaimMergePolicy,
  anonymousPlaygroundCleanupApiRoute,
  anonymousPlaygroundRoute,
  anonymousPlaygroundSourceData,
  anonymousPlaygroundSourceDataRoute,
} from "@/lib/anonymous-playground";

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

export type FreeBuildCapability = {
  id: string;
  title: string;
  status: "before-payment" | "designed-next";
  summary: string;
  allowedBeforePayment: boolean;
  requiresPaidGoLive: boolean;
};

export type FreeBuildGoLiveGate = {
  id: string;
  title: string;
  summary: string;
  requires: string[];
};

export const selfServePricingUpdatedAt = "2026-05-28";
export const billingCheckoutRoute = "/api/billing/checkout";
export const billingCheckoutSuccessRoute = "/pricing/success";
export const pricingSourceIssue = 316;
export const freeBuildModeIssue = 466;
export const signedInFreeBuildWorkspaceIssue = 473;
export const pricingCanonicalRouteIssue = 551;
export const canonicalPricingRoute = "/pricing";
export const usagePricingDraftRoute = "/pricing-v2";
export const pricingSourceDataRoute = "/pricing/source-data";

export const pricingRoutePolicy = {
  canonicalBuyerRoute: canonicalPricingRoute,
  canonicalReason:
    "The main navigation, footer, checkout form, pricing source-data, and Stripe success path use /pricing as the buyer-facing self-serve pricing URL.",
  indexedRoutes: [canonicalPricingRoute, pricingSourceDataRoute],
  alternates: [
    {
      route: usagePricingDraftRoute,
      purpose: "Alternate usage-based pricing draft for packaging discussions, not the default buyer checkout path.",
      canonicalRoute: canonicalPricingRoute,
      robots: "noindex,follow",
      sitemapIncluded: false,
      topNavIncluded: false,
      billingBehavior:
        "No billing or checkout behavior originates from this route; it links back to the canonical /pricing plans or the contact email path.",
    },
  ],
} as const;

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

export const freeBuildCapabilities: FreeBuildCapability[] = [
  {
    id: "free-build-private-launch-paths",
    title: "Private launch paths",
    status: "before-payment",
    summary: "Create and edit launch pages, opt-in paths, checkout handoffs, thank-you pages, and reusable launch structure privately before payment.",
    allowedBeforePayment: true,
    requiresPaidGoLive: false,
  },
  {
    id: "free-build-offers-products-audience",
    title: "Offer, product, and audience setup",
    status: "before-payment",
    summary: "Shape offers, products, lead capture, audience notes, and launch context while buyer-facing actions stay off.",
    allowedBeforePayment: true,
    requiresPaidGoLive: false,
  },
  {
    id: "free-build-ai-launch-context",
    title: "AI launch context",
    status: "before-payment",
    summary: "Let agents inspect the private build state through public-safe records that separate free building from live selling.",
    allowedBeforePayment: true,
    requiresPaidGoLive: false,
  },
  {
    id: "free-build-anonymous-playground",
    title: "Logged-out structured playground",
    status: "before-payment",
    summary:
      "Save structured offer, audience, product, opt-in, checkout, delivery, follow-up, and migration-starting-point notes in one browser before signup.",
    allowedBeforePayment: true,
    requiresPaidGoLive: false,
  },
];

export const paidGoLiveGates: FreeBuildGoLiveGate[] = [
  {
    id: "go-live-public-publishing",
    title: "Public publishing",
    summary: "Turning private work into public buyer-facing routes requires a paid or explicitly approved go-live state.",
    requires: ["Paid plan entitlement", "Fresh workspace revision", "Confirmed publish action"],
  },
  {
    id: "go-live-live-checkout",
    title: "Live checkout and payment collection",
    summary: "Charging buyers, collecting tax-relevant payment state, and changing billing records stay behind paid plan and confirmed checkout rules.",
    requires: ["Paid plan entitlement", "Stripe readiness", "Confirmed billing-impacting action"],
  },
  {
    id: "go-live-email-sends",
    title: "Buyer and subscriber sends",
    summary: "Sending email to subscribers, customers, affiliates, or launch audiences requires sender readiness, consent checks, and paid go-live authority.",
    requires: ["Paid plan entitlement", "Sender readiness", "Consent and suppression checks"],
  },
  {
    id: "go-live-domain-fulfillment",
    title: "Domains and fulfillment",
    summary: "Custom domains, fulfillment delivery, protected content access, and public customer paths require paid ownership and current entitlement checks.",
    requires: ["Paid plan entitlement", "Verified ownership", "Current entitlement checks"],
  },
];

export const freeBuildModeContract = {
  id: "free-build-before-go-live",
  status: "signed-in-free-build-live",
  issue: freeBuildModeIssue,
  updatedAt: selfServePricingUpdatedAt,
  headline: "Build first. Pay when you are ready to go live.",
  summary:
    "Free Build separates private launch setup from buyer-facing go-live actions, so publishers do not need a paid plan while they are still getting ready.",
  freeBuildCapabilities,
  paidGoLiveGates,
  currentAvailability: {
    signedInFreeWorkspaceLive: true,
    anonymousPlaygroundLive: true,
    anonymousSaveRateLimitLive: true,
    anonymousScheduledCleanupLive: true,
    paidGoLiveRequired: true,
  },
  signedInWorkspace: {
    status: "live",
    issue: signedInFreeBuildWorkspaceIssue,
    route: "/api/account/publisher/free-build-workspace",
    accountSetupRoute: "/account/setup",
    planStatus: "free_build",
    summary:
      "Verified signed-in users can create a private Free Build workspace before payment; public go-live actions still require a paid plan.",
  },
  anonymousPlayground: {
    status: "live",
    route: anonymousPlaygroundRoute,
    sourceDataRoute: anonymousPlaygroundSourceDataRoute,
    saveApiRoute: anonymousPlaygroundApiRoute,
    claimApiRoute: anonymousPlaygroundClaimApiRoute,
    cleanupApiRoute: anonymousPlaygroundCleanupApiRoute,
    persistenceModel:
      "Logged-out visitors can save structured launch context through browser-scoped recovery. The cookie stores a recovery token only; D1 stores a token hash, draft fields, expiry, and claim status. Owner cleanup and scheduled Cloudflare cleanup can expire old recovery, clear anonymous draft fields, and preserve claimed private records.",
    privacyBoundary:
      "Anonymous work does not expose private customer data, cleanup actors, expired draft content, create billing records, send email, publish buyer-facing routes, reserve domains, or grant product access.",
    structuredBuilderFieldsLive: true,
    saveRateLimit: anonymousPlaygroundSourceData.saveRateLimit,
    claimMergePolicy: anonymousPlaygroundClaimMergePolicy,
    claimMapsStructuredFieldsToPrivateDraftBlocks: true,
    cleanupControlsLive: true,
    scheduledCleanup: {
      live: true,
      cron: anonymousPlaygroundSourceData.retentionPolicy.scheduledCleanupCron,
      label: anonymousPlaygroundSourceData.retentionPolicy.scheduledCleanupLabel,
      actor: anonymousPlaygroundSourceData.retentionPolicy.scheduledCleanupActor,
      clearsAnonymousDraftFields: true,
      preservesClaimedPrivateRecords: true,
    },
  },
};

export const pricingSourceData = {
  id: "bumpgrade-pricing-policy-source-data",
  updatedAt: selfServePricingUpdatedAt,
  issueNumbers: [pricingSourceIssue, freeBuildModeIssue, signedInFreeBuildWorkspaceIssue, pricingCanonicalRouteIssue],
  routes: [
    canonicalPricingRoute,
    usagePricingDraftRoute,
    pricingSourceDataRoute,
    anonymousPlaygroundRoute,
    anonymousPlaygroundSourceDataRoute,
    anonymousPlaygroundApiRoute,
    anonymousPlaygroundClaimApiRoute,
    anonymousPlaygroundCleanupApiRoute,
    billingCheckoutRoute,
    billingCheckoutSuccessRoute,
  ],
  selfServePricing: {
    contract: "bumpgrade-self-serve-pricing-v1",
    status: "live",
    plans: pricingPlans.map((plan) => ({
      slug: plan.slug,
      name: plan.name,
      status: plan.status,
      monthlyAmountCents: plan.monthlyAmountCents,
      billingInterval: plan.billingInterval,
    })),
    setupAddon: whiteGloveSetupAddon,
  },
  routePolicy: pricingRoutePolicy,
  freeBuildMode: freeBuildModeContract,
  paidGoLiveGates,
  redaction: {
    rawStripeIdsIncluded: false,
    privateWorkspaceRowsIncluded: false,
    anonymousBrowserIdentifiersIncluded: false,
    anonymousRecoveryCookieValueIncluded: false,
    anonymousRecoveryTokenHashIncluded: false,
    customerDataIncluded: false,
  },
  agentBoundary:
    "Agents may cite the pricing policy, anonymous browser playground, signed-in Free Build workspace creation, additive claim merge policy, private claim-record boundary, and paid go-live gates. Anonymous playground state is browser-scoped and cannot publish, charge buyers, send subscribers, reserve domains, or fulfill access.",
};

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
  pricingSourceDataRoute,
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
  freeBuildMode: freeBuildModeContract,
  provisioning:
    "Successful Stripe Checkout Sessions are verified server-side on /pricing/success and create active publisher plan entitlements keyed by buyer email.",
  webhookCaveat:
    "Cloudflare currently has live Stripe secret material configured, but live webhook signing secret setup is still a separate operational step.",
};
