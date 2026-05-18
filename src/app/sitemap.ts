import type { MetadataRoute } from "next";

import { comparisonRoutes } from "@/lib/comparison-data";
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
  "/agent-docs/source-data",
  "/mobile-admin/source-data",
  "/mobile-admin/ios/source-data",
  "/api/commerce/checkout",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-18T00:00:00.000Z");
  return ["", ...scaffoldRoutes, ...sourceDataRoutes, ...comparisonRoutes].map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : path.startsWith("/admin") ? 0.2 : 0.7,
  }));
}
