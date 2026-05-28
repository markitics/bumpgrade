import type { MetadataRoute } from "next";

import { publicSafeAdminSourceDataRoutes } from "@/lib/discovery-policy";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...publicSafeAdminSourceDataRoutes],
        disallow: ["/admin/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
