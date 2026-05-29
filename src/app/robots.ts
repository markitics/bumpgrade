import type { MetadataRoute } from "next";

import { publicAdminSourceDataAliasRoutes } from "@/lib/discovery-policy";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...publicAdminSourceDataAliasRoutes],
        disallow: ["/admin/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
