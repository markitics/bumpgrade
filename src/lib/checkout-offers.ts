import { checkoutConfirmationText, checkoutRoutes, sandboxCheckoutOffer } from "@/lib/sandbox-checkout";
import {
  loadPostPurchaseDecisionSummary,
  postPurchaseDecisionApiRoute,
  postPurchaseDecisionContract,
  postPurchaseDecisionRoutePrefix,
} from "@/lib/post-purchase-decisions";

export type CheckoutOfferStackStatus = "draft" | "sandbox_checkout_ready";
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
  postPurchaseDecisionEndpoint: string;
  postPurchaseRoutePrefix: string;
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

export const checkoutOffersUpdatedAt = "2026-05-19";

const sandboxCurrency = sandboxCheckoutOffer.currency;

export const checkoutOfferStack: CheckoutOfferStack = {
  id: "checkout-stack-indie-launch-sandbox",
  slug: "indie-launch-stack",
  title: "Indie launch checkout offer stack",
  status: "sandbox_checkout_ready",
  issue: 117,
  parentIssue: 15,
  linkedFunnelId: "funnel-indie-launch-sandbox",
  linkedFunnelRoute: "/funnels/indie-launch-sandbox",
  sourceDataRoute: "/offers/source-data",
  previewRoute: "/offers/indie-launch-stack",
  checkoutContractRoute: "/commerce/source-data",
  checkoutEndpoint: checkoutRoutes.start,
  postPurchaseDecisionEndpoint: postPurchaseDecisionApiRoute,
  postPurchaseRoutePrefix: postPurchaseDecisionRoutePrefix,
  webhookEndpoint: checkoutRoutes.webhook,
  revisionId: "checkout-offer-revision-indie-launch-stack-2026-05-19-post-purchase-decisions",
  summary:
    "A checkout offer stack for the primary offer, one selectable pre-payment order bump, optional referral-click attribution evidence, review-only commission ledger evidence, owner review/reversal actions, and non-billing post-purchase upsell/downsell decision evidence.",
  primaryOffer: {
    id: "offer-primary-sandbox-launch-pass",
    kind: "primary",
    title: sandboxCheckoutOffer.name,
    slug: "sandbox-launch-pass",
    priceLabel: "$9 one-time payment",
    unitAmountCents: sandboxCheckoutOffer.unitAmountCents,
    currency: sandboxCurrency,
    productId: sandboxCheckoutOffer.productId,
    priceId: sandboxCheckoutOffer.priceId,
    customerPromise: "Review the checkout route, intent record, Stripe Checkout handoff, webhook, and redacted audit path.",
    placement: "Primary checkout line item",
    copyIntent: "Explain exactly what the launch pass proves without implying live billing is enabled.",
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
    startsAfter: "Primary checkout success and webhook evidence",
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
    "Issue #99 allows a confirmed sandbox Checkout Session start with the seeded primary offer and constrained order bump. Issue #111 allows eligible referral click IDs to be attached as checkout attribution evidence. Issue #113 allows review-only commission ledger evidence from trusted checkout attribution. Issue #115 allows owner-gated review, hold, and reversal actions for that ledger evidence without payout mutation. Issue #117 allows non-billing post-purchase upsell/downsell decision evidence after trusted checkout state. Charging post-purchase upsells, changing prices, publishing offer copy, granting fulfillment, live billing, payable commission writes, payout mutation, and direct agent writes require future confirmed-write APIs with actor identity, exact confirmation, idempotency, stale-state checks, audit correlation, redaction, owner review, reversal controls, and webhook evidence.",
  validation: [
    "/offers/source-data returns the seeded primary offer, order bump, upsell, and downsell records.",
    "/offers/indie-launch-stack renders the checkout-offer preview and sandbox checkout start panel.",
    "/api/commerce/checkout accepts the seeded order bump in sandbox/test mode and returns redacted responses.",
    "/api/commerce/checkout accepts eligible referral click IDs and returns public-safe attribution evidence.",
    "/api/affiliates/commission-ledger can create non-payable commission evidence from trusted checkout attribution.",
    "/api/admin/affiliates/commission-ledger/actions can apply owner-gated review/reversal actions without payout mutation.",
    "/commerce/checkout/success polls the redacted post-purchase contract and gates its CTA on trusted webhook state.",
    "/api/commerce/post-purchase-decisions can record non-billing upsell/downsell follow-up decisions from trusted checkout state.",
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
  status: "post-purchase-decision-ready",
  issue: 117,
  parentIssue: 15,
  generatedFrom: "src/lib/checkout-offers.ts",
  routes: [
    "/offers/source-data",
    "/commerce/checkout/success",
    postPurchaseDecisionApiRoute,
    postPurchaseDecisionRoutePrefix,
    ...checkoutOfferStacks.map((stack) => stack.previewRoute),
  ],
  stableIds: [
    "checkoutOfferStackId",
    "offerId",
    "orderBumpId",
    "upsellId",
    "downsellId",
    "checkoutRevisionId",
    "postPurchaseDecisionId",
    "agentActionId",
  ],
  sandboxCheckout: {
    endpoint: checkoutRoutes.start,
    successPage: "/commerce/checkout/success",
    webhook: checkoutRoutes.webhook,
    confirmationRequired: true,
    supportsOrderBumps: true,
    supportsReferralAttributionEvidence: true,
    allowedOrderBumpPriceIds: checkoutOfferStack.orderBumps.map((offer) => offer.priceId),
    rawStripeIdsIncluded: false,
    liveModeEnabled: false,
  },
  checkoutSuccess: {
    issue: 133,
    route: "/commerce/checkout/success",
    status: "webhook-gated",
    reads: postPurchaseDecisionApiRoute,
    opensPostPurchaseOnlyWhenEligible: true,
    rawStripeIdsIncluded: false,
    privateDataIncluded: false,
  },
  postPurchaseDecisions: postPurchaseDecisionContract,
  writeBoundary: checkoutOfferStack.writeBoundary,
  stacks: checkoutOfferStacks,
  caveat:
    "This contract proves offer-stack read semantics, a confirmed sandbox checkout start for the seeded primary offer plus constrained order bump, optional referral-click attribution evidence, review-only commission ledger evidence, owner-gated review/reversal actions, and non-billing post-purchase upsell/downsell decision evidence. It does not enable live billing, one-click upsell charging, fulfillment, price mutation, payable commission writes, payout mutation, partner notifications, tax records, or direct confirmed-write agent APIs.",
};

export async function checkoutOfferSourceDataWithRuntime(db: D1Database | null | undefined) {
  return {
    ...checkoutOfferSourceData,
    postPurchaseDecisionSummary: await loadPostPurchaseDecisionSummary(db),
  };
}
