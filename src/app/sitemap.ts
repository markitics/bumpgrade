import type { MetadataRoute } from "next";

import { scaffoldRoutes, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-18T00:00:00.000Z");
  return ["", ...scaffoldRoutes].map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : path.startsWith("/admin") ? 0.2 : 0.7,
  }));
}
