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
import { getProductProtectedContentSummary } from "@/lib/product-protected-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [
    entitlementInspection,
    subscriptionMembershipAccess,
    ownerAssetUploadIntents,
    productCreation,
    revocationIntents,
    protectedContent,
  ] = await Promise.all([
    getProductEntitlementInspectionSummary(),
    getSubscriptionMembershipAccessSummary(),
    getProductAssetUploadIntentSummary(),
    getProductCreationSummary(),
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
    revocationIntents,
    protectedContent,
  });
}
