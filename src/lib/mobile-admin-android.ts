import { mobileAdminContract } from "@/lib/mobile-admin";

const androidSlice = mobileAdminContract.childIssues.find((slice) => slice.platform === "android");

if (!androidSlice) {
  throw new Error("The mobile admin contract must include the Android platform slice.");
}

export const androidMobileAdminSourceData = {
  id: "bumpgrade-android-mobile-admin-source-data",
  generatedFrom: "src/lib/mobile-admin-android.ts",
  updatedAt: "2026-05-19",
  platform: "android",
  issue: 68,
  parentIssue: mobileAdminContract.parentIssue,
  featureId: mobileAdminContract.featureId,
  status: androidSlice.status ?? "scaffolded",
  appPath: androidSlice.appPath ?? "apps/mobile-admin",
  sourceContractRoute: "/mobile-admin/source-data",
  sourceDataRoute: androidSlice.sourceDataRoute ?? "/mobile-admin/android/source-data",
  fixturePath: androidSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
  androidAssetPath: "apps/mobile-admin/android/src/main/assets/mobile-admin-contract.json",
  expoEntrypoint: "apps/mobile-admin/src/App.tsx",
  nativeProjectPath: "apps/mobile-admin/android",
  nativePackage: "com.bumpgrade.mobileadmin",
  defaultAvd: "MusicWebs_API_36",
  smokeCommand: androidSlice.smokeCommand ?? "npm run mobile:android:smoke",
  validationCommand: "npm run mobile:android:validate",
  screenshotPath: androidSlice.screenshotPath ?? "/pr-screenshots/issue-68-android-mobile-admin-emulator.png",
  dashboardPanelIssue: 155,
  liveHydrationIssue: 157,
  liveDashboardUrl: `${mobileAdminContract.publicBaseUrl}${mobileAdminContract.liveDashboard.route}`,
  directorDigest: {
    route: "/admin/director/source-data",
    dashboardField: "directorDigest",
    redactionBoundary:
      "The Android scaffold reads only public-safe Director workstream IDs, titles, statuses, compact signals, and 1-day/7-day counts from the live dashboard payload.",
  },
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
    requiredProvider: mobileAdminContract.pushNotificationBoundary.requiredProviders.find((provider) => provider.platform === "android"),
    blockedBy: mobileAdminContract.pushNotificationBoundary.blockedBy,
    redactionFlags: mobileAdminContract.pushNotificationBoundary.redactionFlags,
  },
  distributionReadiness: {
    issue: mobileAdminContract.distributionReadiness.issue,
    status: mobileAdminContract.distributionReadiness.status,
    installableDistributionClaim: mobileAdminContract.distributionReadiness.installableDistributionClaim,
    platformEvidence: mobileAdminContract.distributionReadiness.platformEvidence.find((evidence) => evidence.platform === "android"),
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
      id: "android-read-mobile-contract-fixture",
      route: "/mobile-admin/source-data",
      fixturePath: androidSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      purpose:
        "The Expo entrypoint and native Android activity render the mobile admin digest from the checked-in fixture generated from the shared source-data contract when live hydration is unavailable.",
    },
    {
      id: "android-read-live-mobile-dashboard",
      route: "/mobile-admin/dashboard/source-data",
      fixturePath: null,
      purpose:
        "The Expo entrypoint and native Android activity fetch the live public-safe mobile dashboard contract, render its Director workstream brief, and distinguish live network hydration from fixture fallback.",
    },
    {
      id: "android-read-director-workstreams",
      route: "/admin/director/source-data",
      fixturePath: null,
      purpose:
        "The live dashboard payload carries a redacted Director workstream digest so the Android scaffold can show CEO-style nesting without scraping the private admin page.",
    },
    {
      id: "android-read-mobile-private-rows",
      route: "/api/mobile-admin/private-rows",
      fixturePath: null,
      purpose:
        "A verified owner can inspect read-only Mobile Admin private rows through the shared Better Auth owner session without exposing owner-only notes or private payloads in public source-data.",
    },
    {
      id: "android-record-mobile-private-row-action",
      route: "/api/mobile-admin/private-rows/actions",
      fixturePath: null,
      purpose:
        "A verified owner can mark private rows read or deferred after exact confirmation, idempotency, stale row revision, stale-state token, and audit-correlation checks.",
    },
    {
      id: "android-record-mobile-action-intent",
      route: "/api/mobile-admin/actions",
      fixturePath: null,
      purpose:
        "A verified owner can record audit-only mobile action intent evidence after exact confirmation, idempotency, contract revision, stale-state token, source-route, and audit-correlation checks.",
    },
    {
      id: "android-read-mobile-push-boundary",
      route: "/mobile-admin/source-data",
      fixturePath: androidSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      purpose:
        "The Android scaffold renders the FCM push-notification readiness boundary while sends, device tokens, provider credentials, payload bodies, and delivery receipts remain disabled and redacted.",
    },
    {
      id: "android-read-mobile-distribution-boundary",
      route: "/mobile-admin/source-data",
      fixturePath: androidSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      purpose:
        "The Android scaffold renders the distribution boundary that separates emulator proof from physical-device, internal testing, and Play Store claims.",
    },
    {
      id: "android-read-admin-source-next",
      route: "/admin/source-data",
      fixturePath: null,
      purpose:
        "The next Android slice should replace or supplement the generated fixture with live public-safe admin source-data reads.",
    },
  ],
  writeBoundary:
    "Read-only private rows can be inspected through /api/mobile-admin/private-rows, low-risk private-row workflow actions can be recorded through /api/mobile-admin/private-rows/actions, and audit-only action intents can be recorded through /api/mobile-admin/actions. Android now renders the shared Director workstream brief, owner-session, private-row API, private-row action API, action-intent API, push-notification boundary, distribution-readiness boundary, and confirmed-action contract, but public, billing-impacting, publishing, source-editing, moderation, creator-speech, push sends, distribution, and high-risk production mutations stay disabled until domain-specific confirmed-write APIs and platform evidence exist.",
  caveat:
    "This source-data route proves the Android scaffold, emulator smoke path, live dashboard hydration, redacted Director workstream digest, owner-session/private-row/private-row-action/confirmed-action UI contract, audit-only action-intent route, FCM readiness boundary, and distribution boundary. It does not mean Play Store/internal-testing distribution, push notifications, physical-device private row proof, or high-risk production write actions are live.",
};
