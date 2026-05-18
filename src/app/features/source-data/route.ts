import { NextResponse } from "next/server";

import { featureCatalog, featureCatalogUpdatedAt, featureGroups } from "@/lib/feature-catalog";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    id: "bumpgrade-feature-catalog-source-data",
    generatedFrom: "src/lib/feature-catalog.ts",
    updatedAt: featureCatalogUpdatedAt,
    caveat:
      "Only records with status=live should be treated as shipped Bumpgrade functionality. Pending records are roadmap commitments tied to GitHub issues.",
    groups: featureGroups,
    features: featureCatalog,
  });
}
