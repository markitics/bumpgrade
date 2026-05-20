import { NextResponse } from "next/server";

import { featureCatalog, featureCatalogUpdatedAt, featureGroups } from "@/lib/feature-catalog";
import {
  marketingFeatureCategories,
  marketingFeatureStructureReferences,
  marketingFeatures,
  marketingFeaturesUpdatedAt,
} from "@/lib/marketing-features";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    id: "bumpgrade-feature-catalog-source-data",
    generatedFrom: ["src/lib/feature-catalog.ts", "src/lib/marketing-features.ts"],
    updatedAt: marketingFeaturesUpdatedAt,
    caveat:
      "Public /features is a customer-facing marketing surface. Records with status=live or status=launch-preview have available Bumpgrade routes, previews, source-data contracts, or owner-gated workflows. Billing, provider-send, payout, destructive-write, private mobile auth, app-store distribution, and direct agent-write claims still require separate production proof.",
    groups: featureGroups,
    features: featureCatalog,
    legacyCatalogUpdatedAt: featureCatalogUpdatedAt,
    marketingCategories: marketingFeatureCategories,
    marketingFeatures,
    structureReferences: marketingFeatureStructureReferences,
  });
}
