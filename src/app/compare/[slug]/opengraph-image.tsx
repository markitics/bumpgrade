import { notFound } from "next/navigation";

import { comparisonRetrievedAt, getCompetitorBySlug } from "@/lib/comparison-data";
import {
  routeOgImageContentType,
  routeOgImageResponse,
  routeOgImageSize,
} from "@/lib/route-og-images";

export const alt = "Bumpgrade comparison social image";
export const size = routeOgImageSize;
export const contentType = routeOgImageContentType;

type CompareOgImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: CompareOgImageProps) {
  const { slug } = await params;
  const competitor = getCompetitorBySlug(slug);

  if (!competitor) notFound();

  return routeOgImageResponse({
    routeType: "Comparison",
    eyebrow: `${competitor.name} alternative`,
    title: competitor.headline,
    summary: competitor.alternativePosition,
    route: `/compare/${competitor.slug}`,
    status: "Source-checked",
    facts: [competitor.category, `Sources checked ${comparisonRetrievedAt}`, competitor.bestFor],
    theme: {
      accent: "#ffb703",
      accentSoft: "rgba(255, 183, 3, 0.17)",
      panel: "#fff7de",
    },
  });
}
