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
