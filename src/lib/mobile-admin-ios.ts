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
  privateRowsApi: {
    issue: mobileAdminContract.privateRowsApi.issue,
    status: mobileAdminContract.privateRowsApi.status,
    route: mobileAdminContract.privateRowsApi.route,
    authBoundary: mobileAdminContract.privateRowsApi.authBoundary,
    readBoundary: mobileAdminContract.privateRowsApi.readBoundary,
  },
  actionIntentApi: {
    issue: mobileAdminContract.actionIntentApi.issue,
    status: mobileAdminContract.actionIntentApi.status,
    route: mobileAdminContract.actionIntentApi.route,
    authBoundary: mobileAdminContract.actionIntentApi.authBoundary,
    intentBoundary: mobileAdminContract.actionIntentApi.intentBoundary,
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
      id: "ios-read-mobile-private-rows",
      route: "/api/mobile-admin/private-rows",
      fixturePath: null,
      purpose:
        "A verified owner can inspect read-only Mobile Admin private rows through the shared Better Auth owner session without exposing owner-only notes or private payloads in public source-data.",
    },
    {
      id: "ios-record-mobile-action-intent",
      route: "/api/mobile-admin/actions",
      fixturePath: null,
      purpose:
        "A verified owner can record audit-only mobile action intent evidence after exact confirmation, idempotency, contract revision, stale-state token, source-route, and audit-correlation checks.",
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
    "Read-only private rows can be inspected through /api/mobile-admin/private-rows and audit-only action intents can be recorded through /api/mobile-admin/actions. iOS now renders the shared owner-session, private-row API, action-intent API, and confirmed-action contract, but public, billing-impacting, publishing, source-editing, moderation, creator-speech, push, distribution, and production mutations stay disabled until domain-specific confirmed-write APIs exist.",
  caveat:
    "This source-data route proves the iOS scaffold, simulator smoke path, live dashboard hydration, owner-session/private-row/confirmed-action UI contract, and audit-only action-intent route. It does not mean App Store distribution, push notifications, physical-device private row proof, or production write actions are live.",
};
