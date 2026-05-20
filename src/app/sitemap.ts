import type { MetadataRoute } from "next";

import { affiliatePrograms } from "@/lib/affiliate-referrals";
import { analyticsDashboards } from "@/lib/analytics-experiments";
import { audienceAutomationWorkspaces } from "@/lib/audience-automation";
import { comparisonRoutes } from "@/lib/comparison-data";
import { checkoutOfferStacks } from "@/lib/checkout-offers";
import { seededFunnels } from "@/lib/funnels";
import { marketingFeatures } from "@/lib/marketing-features";
import { productAccessCatalogs } from "@/lib/product-access";
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
  "/affiliates/source-data",
  "/audience/source-data",
  "/analytics/source-data",
  "/funnels/source-data",
  "/offers/source-data",
  "/products/source-data",
  "/api/products/entitlements",
  "/api/products/download-tokens",
  "/api/products/protected-content",
  "/agent-docs/source-data",
  "/mobile-admin/source-data",
  "/mobile-admin/dashboard/source-data",
  "/mobile-admin/ios/source-data",
  "/mobile-admin/android/source-data",
  "/api/commerce/checkout",
  "/api/commerce/post-purchase-decisions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-18T00:00:00.000Z");
  const funnelRoutes = seededFunnels.map((funnel) => funnel.previewRoute);
  const offerRoutes = checkoutOfferStacks.map((stack) => stack.previewRoute);
  const productRoutes = productAccessCatalogs.map((catalog) => catalog.previewRoute);
  const audienceRoutes = audienceAutomationWorkspaces.map((workspace) => workspace.previewRoute);
  const analyticsRoutes = analyticsDashboards.map((dashboard) => dashboard.previewRoute);
  const affiliateRoutes = affiliatePrograms.map((program) => program.previewRoute);
  const marketingFeatureRoutes = marketingFeatures.map((feature) => `/features/${feature.slug}`);
  return [
    "",
    ...scaffoldRoutes,
    ...sourceDataRoutes,
    ...marketingFeatureRoutes,
    ...comparisonRoutes,
    ...funnelRoutes,
    ...offerRoutes,
    ...productRoutes,
    ...audienceRoutes,
    ...analyticsRoutes,
    ...affiliateRoutes,
  ].map((path) => ({
      url: `${site.url}${path}`,
      lastModified,
      changeFrequency: path === "" ? "weekly" : "daily",
      priority: path === "" ? 1 : path.startsWith("/admin") ? 0.2 : 0.7,
    }));
}
