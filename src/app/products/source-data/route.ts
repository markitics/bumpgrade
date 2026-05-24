import { NextResponse } from "next/server";

import { customerProductEntitlementLookupSummary } from "@/lib/customer-product-entitlements";
import { getProductAssetUploadIntentSummary } from "@/lib/product-asset-uploads";
import { productAccessSourceData } from "@/lib/product-access";
import { productDownloadTokenSummary } from "@/lib/product-download-tokens";
import { getSubscriptionMembershipAccessSummary } from "@/lib/product-entitlements";
import {
  getProductEntitlementInspectionSummary,
  getProductEntitlementRevocationIntentSummary,
} from "@/lib/product-entitlement-inspection";
import { getProductCreationSummary } from "@/lib/product-creation";
import { getProductDeliveryGateSummary } from "@/lib/product-delivery-gates";
import { getProductOfferAccessSummary } from "@/lib/product-offer-access";
import { getProductTestCheckoutSummary } from "@/lib/product-test-checkout-links";
import { getProductProtectedContentSummary } from "@/lib/product-protected-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [
    entitlementInspection,
    subscriptionMembershipAccess,
    ownerAssetUploadIntents,
    productCreation,
    productDeliveryGates,
    productOfferAccess,
    productTestCheckout,
    revocationIntents,
    protectedContent,
  ] = await Promise.all([
    getProductEntitlementInspectionSummary(),
    getSubscriptionMembershipAccessSummary(),
    getProductAssetUploadIntentSummary(),
    getProductCreationSummary(),
    getProductDeliveryGateSummary(),
    getProductOfferAccessSummary(),
    getProductTestCheckoutSummary(),
    getProductEntitlementRevocationIntentSummary(),
    getProductProtectedContentSummary(),
  ]);

  return NextResponse.json({
    ...productAccessSourceData,
    entitlementInspection,
    subscriptionMembershipAccess,
    customerEntitlementLookup: customerProductEntitlementLookupSummary,
    sandboxDownloadTokens: productDownloadTokenSummary,
    ownerAssetUploadIntents,
    productCreation,
    productDeliveryGates,
    productOfferAccess,
    productTestCheckout,
    revocationIntents,
    protectedContent,
  });
}
