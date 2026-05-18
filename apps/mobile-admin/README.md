# Bumpgrade Mobile Admin Scaffold

This folder reserves the shared mobile admin workspace for the iOS and Android
publisher/admin apps.

Current scope:

- Parent contract issue: #13.
- iOS child issue: #67.
- Android child issue: #68.
- Shared contract route: `/mobile-admin/source-data`.
- Source doc: `docs/features/mobile-admin.md`.

The selected starting direction is Expo React Native with TypeScript, sharing
one mobile admin codebase across iOS and Android unless device smoke tests prove
a platform-specific split is required.

This is not an installable app yet. The first app targets must be added in #67
and #68 with real simulator/device validation and screenshots. Do not replace
the app with a broad WebView shortcut.

First screen target:

1. Read the mobile admin contract from `/mobile-admin/source-data` or a checked
   in fixture generated from it.
2. Render a mobile admin digest with roadmap, work-log, for-Mark attention, and
   commerce health sections.
3. Keep the first slice read-only.
4. Add confirmed-write UI only after the shared mobile action API exists.
