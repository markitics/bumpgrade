import { mobileAdminContract } from "@/lib/mobile-admin";

const androidSlice = mobileAdminContract.childIssues.find((slice) => slice.platform === "android");

if (!androidSlice) {
  throw new Error("The mobile admin contract must include the Android platform slice.");
}

export const androidMobileAdminSourceData = {
  id: "bumpgrade-android-mobile-admin-source-data",
  generatedFrom: "src/lib/mobile-admin-android.ts",
  updatedAt: "2026-05-18",
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
  reads: [
    {
      id: "android-read-mobile-contract-fixture",
      route: "/mobile-admin/source-data",
      fixturePath: androidSlice.fixturePath ?? "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      purpose:
        "The Expo entrypoint and native Android activity render the mobile admin digest from the checked-in fixture generated from the shared source-data contract.",
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
    "Read-only. Android public, billing-impacting, publishing, source-editing, moderation, and creator-speech writes stay disabled until the shared confirmed-write API exists.",
  caveat:
    "This source-data route proves the first Android scaffold and emulator smoke path. It does not mean Play Store distribution, push notifications, private mobile auth, or write actions are live.",
};
