import type { MetadataRoute } from "next";

import { affiliatePartnerPortalRoute, affiliatePrograms } from "@/lib/affiliate-referrals";
import { analyticsDashboards } from "@/lib/analytics-experiments";
import { audienceAutomationWorkspaces } from "@/lib/audience-automation";
import { comparisonRoutes } from "@/lib/comparison-data";
import { audienceSegmentRoutes } from "@/lib/content-surfaces";
import { checkoutOfferStacks } from "@/lib/checkout-offers";
import { isOwnerGatedAdminUiRoute, publicDiscoverySourceDataRoutes } from "@/lib/discovery-policy";
import { seededFunnels } from "@/lib/funnels";
import { importerRoutes } from "@/lib/importers";
import { marketingFeatures } from "@/lib/marketing-features";
import { productAccessCatalogs } from "@/lib/product-access";
import { scaffoldRoutes, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-28T00:00:00.000Z");
  const funnelRoutes = seededFunnels.map((funnel) => funnel.previewRoute);
  const offerRoutes = checkoutOfferStacks.map((stack) => stack.previewRoute);
  const productRoutes = productAccessCatalogs.map((catalog) => catalog.previewRoute);
  const audienceRoutes = audienceAutomationWorkspaces.map((workspace) => workspace.previewRoute);
  const analyticsRoutes = analyticsDashboards.map((dashboard) => dashboard.previewRoute);
  const affiliateRoutes = affiliatePrograms.map((program) => program.previewRoute);
  const affiliatePartnerRoutes = affiliatePrograms.flatMap((program) =>
    program.partners.map((partner) => affiliatePartnerPortalRoute(program.slug, partner.portalSlug)),
  );
  const marketingFeatureRoutes = marketingFeatures.map((feature) => `/features/${feature.slug}`);
  const routes = [
    "",
    ...scaffoldRoutes.filter((path) => !isOwnerGatedAdminUiRoute(path)),
    ...audienceSegmentRoutes,
    ...publicDiscoverySourceDataRoutes,
    ...marketingFeatureRoutes,
    ...comparisonRoutes,
    ...importerRoutes,
    ...funnelRoutes,
    ...offerRoutes,
    ...productRoutes,
    ...audienceRoutes,
    ...analyticsRoutes,
    ...affiliateRoutes,
    ...affiliatePartnerRoutes,
  ];

  return Array.from(new Set(routes)).map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : path.startsWith("/admin") ? 0.2 : 0.7,
  }));
}
