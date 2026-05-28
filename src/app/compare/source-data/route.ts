import { NextResponse } from "next/server";

import {
  comparisonHubRows,
  comparisonPrinciples,
  comparisonRetrievedAt,
  comparisonSeoTargets,
  type Competitor,
  competitorSources,
  competitors,
} from "@/lib/comparison-data";
import { importerPlatforms } from "@/lib/importers";
import { getMarketingFeature } from "@/lib/marketing-features";

export const dynamic = "force-static";

function competitorSourceData(competitor: Competitor) {
  return {
    ...competitor,
    relatedFeatures: competitor.relatedFeatures.map((relatedFeature) => {
      const feature = getMarketingFeature(relatedFeature.featureSlug);

      return {
        ...relatedFeature,
        featureIds: feature?.featureIds ?? [],
        featureTitle: feature?.title ?? null,
        featureStatus: feature?.status ?? "missing",
        featureRoute: feature ? `/features/${feature.slug}` : null,
        proofRoutes: feature?.proofRoutes ?? [],
      };
    }),
  };
}

export function GET() {
  return NextResponse.json({
    id: "bumpgrade-competitor-comparison-source-data",
    generatedFrom: "src/lib/comparison-data.ts",
    retrievedAt: comparisonRetrievedAt,
    status: "public-draft",
    caveat:
      "Bumpgrade capability statements are planned roadmap targets unless a linked issue or PR says the feature has shipped.",
    seoTargets: comparisonSeoTargets,
    sources: competitorSources,
    hubRows: comparisonHubRows,
    principles: comparisonPrinciples,
    competitors: competitors.map(competitorSourceData),
    importers: importerPlatforms.map((platform) => ({
      id: platform.id,
      competitorId: platform.competitorId,
      platformName: platform.platformName,
      status: platform.status,
      route: platform.route,
      sourceIds: platform.sourceIds,
      priority: platform.priority,
    })),
  });
}
