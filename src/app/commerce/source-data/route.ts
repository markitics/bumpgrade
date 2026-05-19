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
import { checkoutConfirmationText, checkoutRoutes, sandboxCheckoutOffer } from "@/lib/sandbox-checkout";

export const dynamic = "force-dynamic";

export function GET() {
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
      routes: checkoutRoutes,
      confirmation: {
        required: true,
        text: checkoutConfirmationText,
      },
      rawStripeIdsIncluded: false,
    },
    agentWriteRules: commerceAgentWriteRules,
  });
}
