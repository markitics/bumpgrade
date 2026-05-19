import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

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
      confirmation: {
        required: true,
        text: checkoutConfirmationText,
      },
      rawStripeIdsIncluded: false,
    },
    referralAttribution: {
      contract: checkoutReferralAttributionContract,
      summary: await loadCheckoutReferralAttributionSummary(db),
    },
    agentWriteRules: commerceAgentWriteRules,
  });
}
