import { NextResponse } from "next/server";

import {
  comparisonHubRows,
  comparisonPrinciples,
  comparisonRetrievedAt,
  comparisonSeoTargets,
  type Competitor,
  type CompetitorComparisonRow,
  competitorSources,
  competitors,
} from "@/lib/comparison-data";
import { importerPlatforms } from "@/lib/importers";
import { getMarketingFeature } from "@/lib/marketing-features";
import { roadmapItems } from "@/lib/roadmap";

export const dynamic = "force-static";

function publicProofRoutes(proofRoutes: string[]) {
  return proofRoutes.filter((route) => !route.startsWith("/admin") && !route.startsWith("/api"));
}

function roadmapItemIdsForFeatureIds(featureIds: string[]) {
  const featureIdSet = new Set(featureIds);
  return roadmapItems.flatMap((item) => (item.featureId && featureIdSet.has(item.featureId) ? [item.id] : []));
}

function competitorRowSourceData(competitor: Competitor, row: CompetitorComparisonRow) {
  const relatedFeature = competitor.relatedFeatures.find((item) => item.id === row.featureMatch.relatedFeatureId) ?? null;
  const feature = getMarketingFeature(row.featureMatch.featureSlug);
  const featureIds = feature?.featureIds ?? [];
  const publicRoutes = publicProofRoutes(feature?.proofRoutes ?? []);

  return {
    ...row,
    featureMatch: {
      ...row.featureMatch,
      competitorId: competitor.id,
      featureIds,
      featureTitle: feature?.title ?? null,
      featureStatus: feature?.status ?? "missing",
      featureRoute: feature ? `/features/${feature.slug}` : null,
      issueIds: feature?.issueIds ?? [],
      roadmapItemIds: roadmapItemIdsForFeatureIds(featureIds),
      proofRoutes: publicRoutes,
      relatedFeatureStatus: relatedFeature ? "linked" : "missing",
      relatedFeatureCriteria: relatedFeature?.criteria ?? [],
    },
  };
}

function competitorSourceData(competitor: Competitor) {
  return {
    ...competitor,
    rows: competitor.rows.map((row) => competitorRowSourceData(competitor, row)),
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
