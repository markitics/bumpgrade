export const publicSafeAdminSourceDataRoutes = [
  "/admin/director/source-data",
  "/admin/source-data",
  "/admin/roadmap/source-data",
  "/admin/work-log/source-data",
  "/admin/user-journeys/source-data",
  "/admin/for-mark/source-data",
] as const;

export const publicAdminSourceDataAliases = [
  {
    id: "director-status-source-data",
    title: "Director status source data",
    route: "/agent-docs/director-status-source-data",
    sourceRoute: "/admin/director/source-data",
  },
  {
    id: "project-source-data",
    title: "Project source data",
    route: "/agent-docs/project-source-data",
    sourceRoute: "/admin/source-data",
  },
  {
    id: "project-roadmap-source-data",
    title: "Project roadmap source data",
    route: "/agent-docs/project-roadmap-source-data",
    sourceRoute: "/admin/roadmap/source-data",
  },
  {
    id: "project-work-log-source-data",
    title: "Project work-log source data",
    route: "/agent-docs/project-work-log-source-data",
    sourceRoute: "/admin/work-log/source-data",
  },
  {
    id: "user-journey-source-data",
    title: "User journey source data",
    route: "/agent-docs/user-journey-source-data",
    sourceRoute: "/admin/user-journeys/source-data",
  },
  {
    id: "owner-attention-source-data",
    title: "Owner attention source data",
    route: "/agent-docs/owner-attention-source-data",
    sourceRoute: "/admin/for-mark/source-data",
  },
] as const;

export const publicAdminSourceDataAliasRoutes = publicAdminSourceDataAliases.map((alias) => alias.route);

export const publicDiscoverySourceDataRoutes = [
  "/features/source-data",
  "/roadmap/source-data",
  ...publicAdminSourceDataAliasRoutes,
  "/compare/source-data",
  "/imports/source-data",
  "/playground/source-data",
  "/commerce/source-data",
  "/content/source-data",
  "/trust/source-data",
  "/pricing/source-data",
  "/brand/source-data",
  "/account/source-data",
  "/api/billing/checkout",
  "/api/account/publisher/subdomain",
  "/api/account/publisher/custom-domain",
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
] as const;

export function isOwnerGatedAdminUiRoute(path: string) {
  return path.startsWith("/admin/") && !publicSafeAdminSourceDataRoutes.some((route) => route === path);
}
