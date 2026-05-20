import { NextResponse } from "next/server";

import { customerProductEntitlementLookupSummary } from "@/lib/customer-product-entitlements";
import { getProductAssetUploadIntentSummary } from "@/lib/product-asset-uploads";
import { productAccessSourceData } from "@/lib/product-access";
import { productDownloadTokenSummary } from "@/lib/product-download-tokens";
import {
  getProductEntitlementInspectionSummary,
  getProductEntitlementRevocationIntentSummary,
} from "@/lib/product-entitlement-inspection";
import { getProductProtectedContentSummary } from "@/lib/product-protected-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [entitlementInspection, ownerAssetUploadIntents, revocationIntents, protectedContent] = await Promise.all([
    getProductEntitlementInspectionSummary(),
    getProductAssetUploadIntentSummary(),
    getProductEntitlementRevocationIntentSummary(),
    getProductProtectedContentSummary(),
  ]);

  return NextResponse.json({
    ...productAccessSourceData,
    entitlementInspection,
    customerEntitlementLookup: customerProductEntitlementLookupSummary,
    sandboxDownloadTokens: productDownloadTokenSummary,
    ownerAssetUploadIntents,
    revocationIntents,
    protectedContent,
  });
}
