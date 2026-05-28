import { notFound } from "next/navigation";

import { getMarketingFeature } from "@/lib/marketing-features";
import {
  routeOgImageContentType,
  routeOgImageResponse,
  routeOgImageSize,
} from "@/lib/route-og-images";

export const alt = "Bumpgrade feature social image";
export const size = routeOgImageSize;
export const contentType = routeOgImageContentType;

type FeatureOgImageProps = {
  params: Promise<{ slug: string }>;
};

function availabilityLabel(status: string) {
  if (status === "live" || status === "launch-preview") return "Available now";
  return "Next release";
}

export default async function Image({ params }: FeatureOgImageProps) {
  const { slug } = await params;
  const feature = getMarketingFeature(slug);

  if (!feature) notFound();

  return routeOgImageResponse({
    routeType: "Feature",
    eyebrow: feature.category,
    title: feature.hero,
    summary: feature.summary,
    route: `/features/${feature.slug}`,
    status: availabilityLabel(feature.status),
    facts: [feature.shortTitle, feature.nextStep.label, `${feature.proofRoutes.length} proof routes`],
    theme: {
      accent: "#7bdff2",
      accentSoft: "rgba(123, 223, 242, 0.16)",
      panel: "#f5f7fb",
    },
  });
}
