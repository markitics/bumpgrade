import { mobileAdminContract } from "@/lib/mobile-admin";

const iosSlice = mobileAdminContract.childIssues.find((slice) => slice.platform === "ios");

if (!iosSlice) {
  throw new Error("The mobile admin contract must include the iOS platform slice.");
}

export const iosMobileAdminSourceData = {
  id: "bumpgrade-ios-mobile-admin-source-data",
  generatedFrom: "src/lib/mobile-admin-ios.ts",
  updatedAt: "2026-05-19",
  platform: "ios",
  issue: 67,
  parentIssue: mobileAdminContract.parentIssue,
  featureId: mobileAdminContract.featureId,
  status: iosSlice.status ?? "scaffolded",
  appPath: iosSlice.appPath ?? "apps/mobile-admin",
  sourceContractRoute: "/mobile-admin/source-data",
  sourceDataRoute: iosSlice.sourceDataRoute ?? "/mobile-admin/ios/source-data",
  fixturePath: iosSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
  expoEntrypoint: "apps/mobile-admin/src/App.tsx",
  simulatorTarget: "apps/mobile-admin/ios/BumpgradeMobileAdmin.xcodeproj",
  simulatorBundleId: "com.bumpgrade.mobileadmin",
  smokeCommand: iosSlice.smokeCommand ?? "npm run mobile:ios:smoke",
  validationCommand: "npm run mobile:ios:validate",
  screenshotPath: iosSlice.screenshotPath ?? "/pr-screenshots/issue-67-ios-mobile-admin-simulator.png",
  dashboardPanelIssue: 155,
  liveHydrationIssue: 157,
  liveDashboardUrl: `${mobileAdminContract.publicBaseUrl}${mobileAdminContract.liveDashboard.route}`,
  privateAuth: {
    issue: mobileAdminContract.privateAuth.issue,
    status: mobileAdminContract.privateAuth.status,
    sessionRoute: mobileAdminContract.privateAuth.sessionRoute,
    loginRoute: mobileAdminContract.privateAuth.loginRoute,
    callbackSurface: mobileAdminContract.privateAuth.callbackSurface,
    deniedStates: mobileAdminContract.privateAuth.deniedStates,
  },
  confirmedActions: mobileAdminContract.confirmedActions.map((action) => ({
    id: action.id,
    issue: action.issue,
    status: action.status,
    surface: action.surface,
    requiredInputs: action.requiredInputs,
  })),
  reads: [
    {
      id: "ios-read-mobile-contract-fixture",
      route: "/mobile-admin/source-data",
      fixturePath: iosSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      purpose:
        "The Expo entrypoint and iOS simulator target render the mobile admin digest from the checked-in fixture generated from the shared source-data contract when live hydration is unavailable.",
    },
    {
      id: "ios-read-live-mobile-dashboard",
      route: "/mobile-admin/dashboard/source-data",
      fixturePath: null,
      purpose:
        "The Expo entrypoint and iOS simulator target fetch the live public-safe mobile dashboard contract and distinguish live network hydration from fixture fallback.",
    },
    {
      id: "ios-read-admin-source-next",
      route: "/admin/source-data",
      fixturePath: null,
      purpose:
        "The next iOS slice should replace or supplement the generated fixture with live public-safe admin source-data reads.",
    },
  ],
  writeBoundary:
    "Read-only for mutations. iOS now renders the shared owner-session and confirmed-action contract, but public, billing-impacting, publishing, source-editing, moderation, and creator-speech writes stay disabled until the shared confirmed-write API exists.",
  caveat:
    "This source-data route proves the iOS scaffold, simulator smoke path, live dashboard hydration, and owner-session/confirmed-action UI contract. It does not mean App Store distribution, push notifications, private mobile rows, or write actions are live.",
};
