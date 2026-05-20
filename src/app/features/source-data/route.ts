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
      "Public /features is a customer-facing marketing surface. Only records with status=live should be treated as available Bumpgrade routes or previews. Pending records are roadmap commitments tied to GitHub issues. Billing and provider-send claims require separate production proof.",
    groups: featureGroups,
    features: featureCatalog,
    legacyCatalogUpdatedAt: featureCatalogUpdatedAt,
    marketingCategories: marketingFeatureCategories,
    marketingFeatures,
    structureReferences: marketingFeatureStructureReferences,
  });
}
