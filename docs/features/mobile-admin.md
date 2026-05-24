# Mobile Admin

Bumpgrade will build publisher/admin apps for iOS and Android on top of the same
contracts as the web app. The mobile apps must not create separate product
semantics for roadmap, work-log, commerce, agent approvals, or confirmed writes.

## Current State

- Current active follow-up issue: #414. This tracks private mobile auth,
  confirmed-write UX, device proof, push-notification boundaries, and eventual
  distribution readiness after the scaffold closeout.
- Historical parent planning issue: #13.
- iOS implementation issue: #67. The first iOS slice now has an Expo
  TypeScript entrypoint, generated source-data fixture, SwiftUI simulator smoke
  target, and `/mobile-admin/ios/source-data`.
- Android implementation issue: #68. The first Android slice now has a native
  activity, generated fixture asset, emulator smoke target, and
  `/mobile-admin/android/source-data`.
- Live dashboard contract issue: #153. `/mobile-admin/dashboard/source-data`
  now gives iOS, Android, web, and agents one public-safe digest for feature,
  roadmap, work-log, attention, commerce, agent, and platform status.
- Dashboard scaffold rendering issue: #155. The Expo, iOS, and Android scaffold
  surfaces render the dashboard route, status, issue, and redaction boundary
  from the generated mobile-admin fixture.
- Dashboard live hydration issue: #157. The Expo, iOS, and Android scaffold
  surfaces fetch the live public dashboard route and fall back to the generated
  fixture when network hydration is unavailable.
- Mobile auth/action contract issue: #414. The shared contract, Expo app,
  SwiftUI simulator target, and Android emulator target now render the
  owner-session boundary and confirmed-action requirements that future private
  mobile flows must use.
- Shared contract route: `/mobile-admin/source-data`.
- Agent doc: `/agent-docs/bumpgrade-mobile-admin`.

Issue #13 defines the jobs-to-be-done, API dependencies, stack direction, auth
boundary, child issues, and write-safety rules. Issue #414 is now the active
roadmap issue for turning that read-only scaffold into private mobile admin app
parity. Neither issue claims that an installable app exists yet.

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

The #68 Android slice uses the same generated fixture. The native Android
activity reads `android/src/main/assets/mobile-admin-contract.json` so Codex can
build, install, launch, and screenshot a real emulator surface without claiming
Play Store distribution or full mobile parity.

The #153 dashboard slice does not replace the fixture smoke path. It adds a live
public-safe contract route that future iOS and Android clients can fetch before
private auth exists. The payload intentionally exposes counts, statuses, route
IDs, issue evidence, recent public-safe work-log metadata, and redaction flags,
not private buyer rows, raw inbox bodies, owner email values, session IDs, R2
object keys, signed URLs, upload bodies, secret values, or write tokens.

The #155 scaffold-rendering slice made the dashboard route and boundary visible
from the generated fixture. The #157 live-hydration slice keeps that fixture as
deterministic fallback while the Expo, iOS, and Android surfaces fetch the live
public-safe dashboard route and label whether the panel came from the live
network or fallback fixture.

The #414 mobile auth/action slice keeps the app read-only for mutations while
making the future private surfaces explicit. Mobile owner sessions must reuse
Better Auth, the owner allowlist, verified-email checks, and the same admin role
mapping as web. Confirmed mobile actions must carry exact confirmation text,
actor identity, idempotency, stale-state checks, audit correlation, and redacted
output before any public, billing-impacting, publishing, moderation,
source-editing, or creator-speech action can mutate production state.

## First Mobile Jobs

- Check launch and platform status away from desktop.
- Review agent work and confirm safe follow-up actions.
- Inspect offer and checkout health.

## API Dependencies

- `/admin/source-data`: roadmap, work-log, user-journey, and Mark-attention
  digest.
- `/mobile-admin/dashboard/source-data`: live public-safe dashboard digest for
  mobile clients.
- `/features/source-data`: feature status and issue evidence.
- `/roadmap/source-data`: public roadmap lanes and blockers.
- `/commerce/source-data`: redacted commerce architecture and checkout state.
- `/api/auth/[...all]`: Better Auth session boundary for future private mobile
  screens.
- Future `/api/mobile-admin/actions`: confirmed writes for mobile admin actions.
- `/mobile-admin/ios/source-data`: iOS scaffold status, fixture path,
  simulator target, smoke command, and screenshot path.
- `/mobile-admin/android/source-data`: Android scaffold status, fixture asset,
  emulator target, smoke command, and screenshot path.

## iOS Slice Commands

From the repo root:

```bash
npm run mobile:ios:validate
npm run mobile:ios:smoke
```

The smoke command targets the `iPhone 17` simulator by default and writes
`docs/pr-screenshots/issue-67-ios-mobile-admin-simulator.png`.

## Android Slice Commands

From the repo root:

```bash
npm run mobile:android:validate
npm run mobile:android:smoke
```

The smoke command targets the `MusicWebs_API_36` AVD by default and writes
`docs/pr-screenshots/issue-68-android-mobile-admin-emulator.png`.

## Write Boundary

The first iOS and Android slices are read-only until a confirmed-write API
exists. Public, destructive, billing-impacting, publishing, moderation,
source-editing, and creator-speech writes require explicit confirmation text,
idempotency, stale-state checks, audit correlation, and redaction.

The current #414 surface is a UI and contract milestone, not a live mutation
API. It proves that iOS and Android expose the same private auth and
confirmed-action rules the web/admin app uses; it does not prove App Store or
Play Store distribution, push notifications, private rows on device, or live
mobile writes.
