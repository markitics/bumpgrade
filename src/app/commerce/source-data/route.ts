import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import {
  affiliateCommissionLedgerContract,
  affiliateCommissionReviewActionsContract,
  loadAffiliateCommissionLedgerSummary,
} from "@/lib/affiliate-commission-ledger";
import {
  commerceAgentWriteRules,
  commerceDecisions,
  commerceTables,
  stripeApiVersion,
  stripeCommerceContract,
  stripeCommerceUpdatedAt,
  stripeNodeVersion,
} from "@/lib/commerce";
import { checkoutOfferStack } from "@/lib/checkout-offers";
import {
  loadPostPurchaseDecisionSummary,
  postPurchaseDecisionContract,
} from "@/lib/post-purchase-decisions";
import {
  checkoutReferralAttributionContract,
  loadCheckoutReferralAttributionSummary,
} from "@/lib/referral-checkout-attribution";
import { checkoutConfirmationText, checkoutRoutes, sandboxCheckoutOffer } from "@/lib/sandbox-checkout";

export const dynamic = "force-dynamic";

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as Cloudflare.Env).DB ?? null;
}

export async function GET() {
  const db = await getDb();

  return NextResponse.json({
    id: "bumpgrade-commerce-source-data",
    updatedAt: stripeCommerceUpdatedAt,
    stripeNodeVersion,
    stripeApiVersion,
    contract: stripeCommerceContract,
    decisions: commerceDecisions,
    tables: commerceTables,
    sandboxCheckout: {
      offer: sandboxCheckoutOffer,
      orderBumps: checkoutOfferStack.orderBumps.map((offer) => ({
        id: offer.id,
        priceId: offer.priceId,
        productId: offer.productId,
        unitAmountCents: offer.unitAmountCents,
        currency: offer.currency,
      })),
      supportsOrderBumps: true,
      supportsReferralAttributionEvidence: true,
      routes: checkoutRoutes,
      postPurchaseDecisionRoute: postPurchaseDecisionContract.apiRoute,
      postPurchaseRoutePrefix: postPurchaseDecisionContract.routePrefix,
      confirmation: {
        required: true,
        text: checkoutConfirmationText,
      },
      rawStripeIdsIncluded: false,
    },
    postPurchaseDecisions: {
      contract: postPurchaseDecisionContract,
      summary: await loadPostPurchaseDecisionSummary(db),
    },
    referralAttribution: {
      contract: checkoutReferralAttributionContract,
      summary: await loadCheckoutReferralAttributionSummary(db),
    },
    affiliateCommissionLedger: {
      contract: affiliateCommissionLedgerContract,
      ownerReviewActions: affiliateCommissionReviewActionsContract,
      summary: await loadAffiliateCommissionLedgerSummary(db),
    },
    agentWriteRules: commerceAgentWriteRules,
  });
}
