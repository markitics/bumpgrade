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
  reads: [
    {
      id: "ios-read-mobile-contract-fixture",
      route: "/mobile-admin/source-data",
      fixturePath: iosSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      purpose:
        "The Expo entrypoint and iOS simulator target render the mobile admin digest from the checked-in fixture generated from the shared source-data contract.",
    },
    {
      id: "ios-read-live-mobile-dashboard-next",
      route: "/mobile-admin/dashboard/source-data",
      fixturePath: null,
      purpose:
        "The next iOS app slice should fetch or hydrate from the live public-safe mobile dashboard contract while keeping the fixture as a simulator fallback.",
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
    "Read-only. iOS public, billing-impacting, publishing, source-editing, moderation, and creator-speech writes stay disabled until the shared confirmed-write API exists.",
  caveat:
    "This source-data route proves the first iOS scaffold and simulator smoke path. It does not mean App Store distribution, push notifications, private mobile auth, or write actions are live.",
};
