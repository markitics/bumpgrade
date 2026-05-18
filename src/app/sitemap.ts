import type { MetadataRoute } from "next";

import { comparisonRoutes } from "@/lib/comparison-data";
import { checkoutOfferStacks } from "@/lib/checkout-offers";
import { seededFunnels } from "@/lib/funnels";
import { scaffoldRoutes, site } from "@/lib/site";

const sourceDataRoutes = [
  "/features/source-data",
  "/roadmap/source-data",
  "/admin/source-data",
  "/admin/roadmap/source-data",
  "/admin/work-log/source-data",
  "/admin/user-journeys/source-data",
  "/admin/for-mark/source-data",
  "/compare/source-data",
  "/commerce/source-data",
  "/content/source-data",
  "/funnels/source-data",
  "/offers/source-data",
  "/agent-docs/source-data",
  "/mobile-admin/source-data",
  "/mobile-admin/ios/source-data",
  "/mobile-admin/android/source-data",
  "/api/commerce/checkout",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-18T00:00:00.000Z");
  const funnelRoutes = seededFunnels.map((funnel) => funnel.previewRoute);
  const offerRoutes = checkoutOfferStacks.map((stack) => stack.previewRoute);
  return ["", ...scaffoldRoutes, ...sourceDataRoutes, ...comparisonRoutes, ...funnelRoutes, ...offerRoutes].map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : path.startsWith("/admin") ? 0.2 : 0.7,
  }));
}
