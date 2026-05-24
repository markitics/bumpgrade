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
        "The Expo entrypoint and native Android activity fetch the live public-safe mobile dashboard contract and distinguish live network hydration from fixture fallback.",
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
    "Read-only for mutations. Android now renders the shared owner-session and confirmed-action contract, but public, billing-impacting, publishing, source-editing, moderation, and creator-speech writes stay disabled until the shared confirmed-write API exists.",
  caveat:
    "This source-data route proves the Android scaffold, emulator smoke path, live dashboard hydration, and owner-session/confirmed-action UI contract. It does not mean Play Store distribution, push notifications, private mobile rows, or write actions are live.",
};
