# Bumpgrade Mobile Admin Scaffold

This folder is the shared mobile admin workspace for the iOS and Android
publisher/admin apps.

Current scope:

- Parent contract issue: #13.
- Active private-auth/action follow-up: #414.
- iOS child issue: #67.
- Android child issue: #68.
- Shared contract route: `/mobile-admin/source-data`.
- iOS source-data route: `/mobile-admin/ios/source-data`.
- Android source-data route: `/mobile-admin/android/source-data`.
- Source doc: `docs/features/mobile-admin.md`.

The selected starting direction is Expo React Native with TypeScript, sharing
one mobile admin codebase across iOS and Android unless device smoke tests prove
a platform-specific split is required.

Issue #67 adds the first iOS slice:

- `src/App.tsx`: Expo/React Native first screen for the shared app.
- `fixtures/mobile-admin-contract.json`: checked-in fixture generated from the
  web contract in `src/lib/mobile-admin.ts`.
- `ios/BumpgradeMobileAdmin.xcodeproj`: simulator smoke target that renders the
  same fixture with SwiftUI for a real iOS screenshot path.

Issue #68 adds the first Android slice:

- `android/AndroidManifest.xml`: native Android smoke target metadata.
- `android/src/main/java/com/bumpgrade/mobileadmin/MainActivity.java`: native
  read-only first screen that renders the same generated fixture.
- `android/src/main/assets/mobile-admin-contract.json`: bundled fixture asset
  kept in sync by `scripts/sync-mobile-fixture.mjs`.

This is not App Store distribution, push notifications, private mobile auth, or
mobile write support yet. The current #414 surface renders the owner-session
and confirmed-action contract in the app scaffolds, but it does not expose
private rows or mutate production state. Do not replace the app with a broad
WebView shortcut.

First screen target:

1. Read the mobile admin contract from `/mobile-admin/source-data` or a checked
   in fixture generated from it.
2. Render a mobile admin digest with roadmap, work-log, for-Mark attention, and
   commerce health sections.
3. Keep the first slice read-only.
4. Render the shared owner-session and confirmed-action requirements before
   private rows or live mobile writes exist.
5. Add mutation controls only after the shared mobile action API exists.

## Validation

From the repo root:

```bash
npm run mobile:ios:validate
npm run mobile:ios:smoke
npm run mobile:android:validate
npm run mobile:android:smoke
```

`mobile:ios:validate` checks that the fixture matches `src/lib/mobile-admin.ts`,
that the iOS source-data route is declared, and that Xcode is available.

`mobile:ios:smoke` syncs the fixture, builds the simulator target, installs and
launches it on the `iPhone 17` simulator by default, and writes a screenshot to
`docs/pr-screenshots/issue-67-ios-mobile-admin-simulator.png`.

Use `IOS_SIMULATOR_NAME="iPhone 17 Pro"` to target another installed simulator.

`mobile:android:validate` checks that the fixture matches
`src/lib/mobile-admin.ts`, that the Android source-data route is declared, and
that API 36 build tools plus the default AVD are available.

`mobile:android:smoke` syncs the fixture, builds a signed debug APK without
Gradle, installs and launches it on the `MusicWebs_API_36` emulator by default,
and writes a screenshot to
`docs/pr-screenshots/issue-68-android-mobile-admin-emulator.png`.

Use `ANDROID_AVD_NAME="Another_AVD"` to target another installed emulator.
