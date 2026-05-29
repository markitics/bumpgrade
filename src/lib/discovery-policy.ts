export const publicSafeAdminSourceDataRoutes = [
  "/admin/director/source-data",
  "/admin/source-data",
  "/admin/roadmap/source-data",
  "/admin/work-log/source-data",
  "/admin/user-journeys/source-data",
  "/admin/for-mark/source-data",
] as const;

export const publicDiscoverySourceDataRoutes = [
  "/features/source-data",
  "/roadmap/source-data",
  ...publicSafeAdminSourceDataRoutes,
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
