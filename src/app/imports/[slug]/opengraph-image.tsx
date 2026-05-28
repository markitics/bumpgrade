import { notFound } from "next/navigation";

import { getImporterBySlug } from "@/lib/importers";
import {
  routeOgImageContentType,
  routeOgImageResponse,
  routeOgImageSize,
} from "@/lib/route-og-images";

export const alt = "Bumpgrade importer social image";
export const size = routeOgImageSize;
export const contentType = routeOgImageContentType;

type ImporterOgImageProps = {
  params: Promise<{ slug: string }>;
};

function statusLabel(status: string) {
  return status === "private-draft-live" ? "Private import ready" : "Dedicated path";
}

export default async function Image({ params }: ImporterOgImageProps) {
  const { slug } = await params;
  const platform = getImporterBySlug(slug);

  if (!platform) notFound();

  return routeOgImageResponse({
    routeType: "Importer",
    eyebrow: `${platform.platformName} importer`,
    title: platform.headline,
    summary: platform.summary,
    route: platform.route,
    status: statusLabel(platform.status),
    facts: [
      `${platform.importableAreas.length} import areas`,
      `${platform.inputs.length} input paths`,
      "Private until go-live approval",
    ],
    theme: {
      accent: "#ff8066",
      accentSoft: "rgba(255, 128, 102, 0.17)",
      panel: "#fff0eb",
    },
  });
}
