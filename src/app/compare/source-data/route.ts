import { NextResponse } from "next/server";

import {
  comparisonHubRows,
  comparisonPrinciples,
  comparisonRetrievedAt,
  comparisonSeoTargets,
  competitorSources,
  competitors,
} from "@/lib/comparison-data";

export const dynamic = "force-static";

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
    competitors,
  });
}
