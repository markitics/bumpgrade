# Mobile Admin

Bumpgrade will build publisher/admin apps for iOS and Android on top of the same
contracts as the web app. The mobile apps must not create separate product
semantics for roadmap, work-log, commerce, agent approvals, or confirmed writes.

## Current State

- Parent planning issue: #13.
- iOS implementation issue: #67. The first iOS slice now has an Expo
  TypeScript entrypoint, generated source-data fixture, SwiftUI simulator smoke
  target, and `/mobile-admin/ios/source-data`.
- Android implementation issue: #68.
- Shared contract route: `/mobile-admin/source-data`.
- Agent doc: `/agent-docs/bumpgrade-mobile-admin`.

Issue #13 defines the jobs-to-be-done, API dependencies, stack direction, auth
boundary, child issues, and write-safety rules. It does not claim that an
installable app exists yet.

## Stack Direction

Start with an Expo React Native TypeScript workspace shared by iOS and Android,
unless the first device/simulator smoke tests expose a platform-specific reason
to split native code. The repo has no existing native app tree, and current
admin/product state is already modeled in TypeScript and JSON.

Do not ship a broad WebView shortcut as the mobile admin app. The first mobile
screen can be read-only, but it should be structured as a native admin surface
that can later support notifications, confirmations, screenshots, and device
smoke tests.

The #67 iOS slice uses a checked-in fixture generated from
`/mobile-admin/source-data`. The Expo app reads the fixture in `src/App.tsx`; the
SwiftUI smoke target reads the same JSON from the iOS bundle so Codex can build,
install, launch, and screenshot a real simulator surface without claiming full
mobile parity.

## First Mobile Jobs

- Check launch and platform status away from desktop.
- Review agent work and confirm safe follow-up actions.
- Inspect offer and checkout health.

## API Dependencies

- `/admin/source-data`: roadmap, work-log, user-journey, and Mark-attention
  digest.
- `/features/source-data`: feature status and issue evidence.
- `/roadmap/source-data`: public roadmap lanes and blockers.
- `/commerce/source-data`: redacted commerce architecture and checkout state.
- `/api/auth/[...all]`: Better Auth session boundary for future private mobile
  screens.
- Future `/api/mobile-admin/actions`: confirmed writes for mobile admin actions.
- `/mobile-admin/ios/source-data`: iOS scaffold status, fixture path,
  simulator target, smoke command, and screenshot path.

## iOS Slice Commands

From the repo root:

```bash
npm run mobile:ios:validate
npm run mobile:ios:smoke
```

The smoke command targets the `iPhone 17` simulator by default and writes
`docs/pr-screenshots/issue-67-ios-mobile-admin-simulator.png`.

## Write Boundary

The first iOS and Android slices are read-only until a confirmed-write API
exists. Public, destructive, billing-impacting, publishing, moderation,
source-editing, and creator-speech writes require explicit confirmation text,
idempotency, stale-state checks, audit correlation, and redaction.
