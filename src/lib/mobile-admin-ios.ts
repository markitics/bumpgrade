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
  privateRowActionsApi: {
    issue: mobileAdminContract.privateRowActionsApi.issue,
    status: mobileAdminContract.privateRowActionsApi.status,
    route: mobileAdminContract.privateRowActionsApi.route,
    authBoundary: mobileAdminContract.privateRowActionsApi.authBoundary,
    actionBoundary: mobileAdminContract.privateRowActionsApi.actionBoundary,
  },
  actionIntentApi: {
    issue: mobileAdminContract.actionIntentApi.issue,
    status: mobileAdminContract.actionIntentApi.status,
    route: mobileAdminContract.actionIntentApi.route,
    authBoundary: mobileAdminContract.actionIntentApi.authBoundary,
    intentBoundary: mobileAdminContract.actionIntentApi.intentBoundary,
  },
  pushNotificationBoundary: {
    issue: mobileAdminContract.pushNotificationBoundary.issue,
    status: mobileAdminContract.pushNotificationBoundary.status,
    sendCapability: mobileAdminContract.pushNotificationBoundary.sendCapability,
    requiredProvider: mobileAdminContract.pushNotificationBoundary.requiredProviders.find((provider) => provider.platform === "ios"),
    blockedBy: mobileAdminContract.pushNotificationBoundary.blockedBy,
    redactionFlags: mobileAdminContract.pushNotificationBoundary.redactionFlags,
  },
  distributionReadiness: {
    issue: mobileAdminContract.distributionReadiness.issue,
    status: mobileAdminContract.distributionReadiness.status,
    installableDistributionClaim: mobileAdminContract.distributionReadiness.installableDistributionClaim,
    platformEvidence: mobileAdminContract.distributionReadiness.platformEvidence.find((evidence) => evidence.platform === "ios"),
    redactionFlags: mobileAdminContract.distributionReadiness.redactionFlags,
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
      id: "ios-record-mobile-private-row-action",
      route: "/api/mobile-admin/private-rows/actions",
      fixturePath: null,
      purpose:
        "A verified owner can mark private rows read or deferred after exact confirmation, idempotency, stale row revision, stale-state token, and audit-correlation checks.",
    },
    {
      id: "ios-record-mobile-action-intent",
      route: "/api/mobile-admin/actions",
      fixturePath: null,
      purpose:
        "A verified owner can record audit-only mobile action intent evidence after exact confirmation, idempotency, contract revision, stale-state token, source-route, and audit-correlation checks.",
    },
    {
      id: "ios-read-mobile-push-boundary",
      route: "/mobile-admin/source-data",
      fixturePath: iosSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      purpose:
        "The iOS scaffold renders the APNs push-notification readiness boundary while sends, device tokens, provider credentials, payload bodies, and delivery receipts remain disabled and redacted.",
    },
    {
      id: "ios-read-mobile-distribution-boundary",
      route: "/mobile-admin/source-data",
      fixturePath: iosSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      purpose:
        "The iOS scaffold renders the distribution boundary that separates simulator proof from physical-device, TestFlight, and App Store claims.",
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
    "Read-only private rows can be inspected through /api/mobile-admin/private-rows, low-risk private-row workflow actions can be recorded through /api/mobile-admin/private-rows/actions, and audit-only action intents can be recorded through /api/mobile-admin/actions. iOS now renders the shared owner-session, private-row API, private-row action API, action-intent API, push-notification boundary, distribution-readiness boundary, and confirmed-action contract, but public, billing-impacting, publishing, source-editing, moderation, creator-speech, push sends, distribution, and high-risk production mutations stay disabled until domain-specific confirmed-write APIs and platform evidence exist.",
  caveat:
    "This source-data route proves the iOS scaffold, simulator smoke path, live dashboard hydration, owner-session/private-row/private-row-action/confirmed-action UI contract, audit-only action-intent route, APNs readiness boundary, and distribution boundary. It does not mean App Store/TestFlight distribution, push notifications, physical-device private row proof, or high-risk production write actions are live.",
};
