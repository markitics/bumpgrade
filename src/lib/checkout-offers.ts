import { checkoutConfirmationText, checkoutRoutes, sandboxCheckoutOffer } from "@/lib/sandbox-checkout";

export type CheckoutOfferStackStatus = "draft";
export type CheckoutOfferKind = "primary" | "order_bump" | "upsell" | "downsell";

export type CheckoutOffer = {
  id: string;
  kind: CheckoutOfferKind;
  title: string;
  slug: string;
  priceLabel: string;
  unitAmountCents: number;
  currency: string;
  productId: string;
  priceId: string;
  customerPromise: string;
  placement: string;
  copyIntent: string;
  agentEditable: boolean;
};

export type CheckoutOfferPath = {
  id: string;
  trigger: string;
  startsAfter: string;
  expiresAfterMinutes: number;
  offers: CheckoutOffer[];
};

export type CheckoutOfferStack = {
  id: string;
  slug: string;
  title: string;
  status: CheckoutOfferStackStatus;
  issue: number;
  parentIssue: number;
  linkedFunnelId: string;
  linkedFunnelRoute: string;
  sourceDataRoute: string;
  previewRoute: string;
  checkoutContractRoute: string;
  checkoutEndpoint: string;
  webhookEndpoint: string;
  revisionId: string;
  summary: string;
  primaryOffer: CheckoutOffer;
  orderBumps: CheckoutOffer[];
  postPurchasePath: CheckoutOfferPath;
  confirmation: {
    required: boolean;
    checkoutText: string;
  };
  writeBoundary: string;
  validation: string[];
};

export const checkoutOffersUpdatedAt = "2026-05-18";

const sandboxCurrency = sandboxCheckoutOffer.currency;

export const checkoutOfferStack: CheckoutOfferStack = {
  id: "checkout-stack-indie-launch-sandbox",
  slug: "indie-launch-stack",
  title: "Indie launch checkout offer stack",
  status: "draft",
  issue: 81,
  parentIssue: 15,
  linkedFunnelId: "funnel-indie-launch-sandbox",
  linkedFunnelRoute: "/funnels/indie-launch-sandbox",
  sourceDataRoute: "/offers/source-data",
  previewRoute: "/offers/indie-launch-stack",
  checkoutContractRoute: "/commerce/source-data",
  checkoutEndpoint: checkoutRoutes.start,
  webhookEndpoint: checkoutRoutes.webhook,
  revisionId: "checkout-offer-revision-indie-launch-stack-2026-05-18",
  summary:
    "A read-only checkout-offer scaffold for the primary sandbox offer, one pre-payment order bump, and a post-purchase upsell/downsell path.",
  primaryOffer: {
    id: "offer-primary-sandbox-launch-pass",
    kind: "primary",
    title: sandboxCheckoutOffer.name,
    slug: "sandbox-launch-pass",
    priceLabel: "$9 one-time sandbox payment",
    unitAmountCents: sandboxCheckoutOffer.unitAmountCents,
    currency: sandboxCurrency,
    productId: sandboxCheckoutOffer.productId,
    priceId: sandboxCheckoutOffer.priceId,
    customerPromise: "Prove the checkout route, D1 intent record, Stripe Checkout handoff, webhook, and redacted audit path.",
    placement: "Primary checkout line item",
    copyIntent: "Explain exactly what the sandbox launch pass proves without implying live billing is enabled.",
    agentEditable: true,
  },
  orderBumps: [
    {
      id: "offer-bump-launch-checklist",
      kind: "order_bump",
      title: "Launch checklist bump",
      slug: "launch-checklist-bump",
      priceLabel: "$19 draft bump",
      unitAmountCents: 1900,
      currency: sandboxCurrency,
      productId: "product-launch-checklist-bump",
      priceId: "price-launch-checklist-bump-usd",
      customerPromise: "Add a concise implementation checklist before checkout without changing the primary product.",
      placement: "Pre-payment order bump beside the primary checkout confirmation.",
      copyIntent: "Increase basket size with a relevant add-on while keeping the customer in the same checkout decision.",
      agentEditable: true,
    },
  ],
  postPurchasePath: {
    id: "post-purchase-path-launch-acceleration",
    trigger: "checkout.session.completed",
    startsAfter: "Primary sandbox checkout success and webhook evidence",
    expiresAfterMinutes: 30,
    offers: [
      {
        id: "offer-upsell-launch-accelerator",
        kind: "upsell",
        title: "Launch accelerator upsell",
        slug: "launch-accelerator-upsell",
        priceLabel: "$199 draft upsell",
        unitAmountCents: 19900,
        currency: sandboxCurrency,
        productId: "product-launch-accelerator-upsell",
        priceId: "price-launch-accelerator-upsell-usd",
        customerPromise: "Offer a time-boxed implementation package immediately after the first purchase.",
        placement: "Post-purchase one-click upsell candidate after webhook-confirmed checkout.",
        copyIntent: "Present a limited follow-on offer without claiming one-click billing is live yet.",
        agentEditable: true,
      },
      {
        id: "offer-downsell-launch-review",
        kind: "downsell",
        title: "Launch review downsell",
        slug: "launch-review-downsell",
        priceLabel: "$49 draft downsell",
        unitAmountCents: 4900,
        currency: sandboxCurrency,
        productId: "product-launch-review-downsell",
        priceId: "price-launch-review-downsell-usd",
        customerPromise: "Offer a lighter review option if the upsell is declined.",
        placement: "Fallback downsell after the upsell decision.",
        copyIntent: "Keep the follow-up relevant and lower commitment without hidden recurring billing.",
        agentEditable: true,
      },
    ],
  },
  confirmation: {
    required: true,
    checkoutText: checkoutConfirmationText,
  },
  writeBoundary:
    "Issue #81 is read-only. Adding bumps to a Stripe Checkout Session, charging post-purchase upsells, changing prices, publishing offer copy, or granting fulfillment requires actor identity, exact confirmation, idempotency, stale-state checks, audit correlation, redaction, and webhook evidence.",
  validation: [
    "/offers/source-data returns the seeded primary offer, order bump, upsell, and downsell records.",
    "/offers/indie-launch-stack renders the checkout-offer preview.",
    "/agent-docs/source-data lists the checkout-offer read contract for future MCP resources.",
  ],
};

export const checkoutOfferStacks = [checkoutOfferStack];

export function getCheckoutOfferStackBySlug(slug: string) {
  return checkoutOfferStacks.find((stack) => stack.slug === slug) ?? null;
}

export const checkoutOfferSourceData = {
  id: "bumpgrade-checkout-offer-source-data",
  updatedAt: checkoutOffersUpdatedAt,
  status: "read-contract-ready",
  issue: 81,
  parentIssue: 15,
  generatedFrom: "src/lib/checkout-offers.ts",
  routes: ["/offers/source-data", ...checkoutOfferStacks.map((stack) => stack.previewRoute)],
  stableIds: [
    "checkoutOfferStackId",
    "offerId",
    "orderBumpId",
    "upsellId",
    "downsellId",
    "checkoutRevisionId",
    "agentActionId",
  ],
  sandboxCheckout: {
    endpoint: checkoutRoutes.start,
    webhook: checkoutRoutes.webhook,
    confirmationRequired: true,
    rawStripeIdsIncluded: false,
    liveModeEnabled: false,
  },
  writeBoundary: checkoutOfferStack.writeBoundary,
  stacks: checkoutOfferStacks,
  caveat:
    "This contract proves offer-stack read and preview semantics only. It does not enable live billing, one-click upsell charging, order-bump mutation, fulfillment, or confirmed-write agent APIs.",
};
