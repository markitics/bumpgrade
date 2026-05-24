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
- Mobile private-row API issue: #414. `/api/mobile-admin/private-rows` now lets a
  verified owner inspect read-only private mobile rows through the same Better
  Auth owner session as web admin. Public source-data exposes only route,
  status, counts, public row labels, and redaction flags.
- Mobile private-row action API issue: #428. `/api/mobile-admin/private-rows/actions`
  now lets a verified owner mark private rows read or deferred after exact
  confirmation, idempotency, stale row revision, stale-state token, and
  audit-correlation checks. It mutates only private-row workflow state.
- Mobile action-intent API issue: #414. `/api/mobile-admin/actions` now lets a
  verified owner record redacted audit-only action intent evidence after exact
  confirmation, idempotency, contract revision, stale-state, source-route, and
  audit-correlation checks. It does not mutate production admin, commerce,
  publishing, push, distribution, or private mobile row state.
- Mobile push-notification boundary issue: #414. `/mobile-admin/source-data` now
  names the APNs/FCM requirements, disabled send status, blockers, and redaction
  flags that must exist before Mobile Admin can send or schedule push
  notifications.
- Mobile distribution-readiness boundary issue: #414. `/mobile-admin/source-data`
  now separates simulator/emulator proof from physical-device, TestFlight/App
  Store, and Play Store/internal-testing claims.
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

The current #414 private-row slice proves authenticated mobile row inspection
without turning public source-data into another private API. Owner-authenticated
GET `/api/mobile-admin/private-rows` returns synthetic owner-only row notes and
private payload metadata from D1. Public `/mobile-admin/source-data` and
`/mobile-admin/dashboard/source-data` expose only the route, status, counts,
public row labels, and redaction flags, and they exclude owner-only notes,
private payload JSON, owner email values, session IDs, cookies, tokens, and raw
rows.

The current #414 action-intent slice turns the future endpoint into an
owner-gated audit trail without enabling production mutations. Owner-authenticated
GET `/api/mobile-admin/actions` exposes the confirmation contract and current
stale-state tokens. Owner-authenticated POST records only redacted intent
evidence, with actor email, actor hash, actor user id, idempotency key, private
note, stale-state token hash, and raw rows excluded from responses.

The current #428 private-row action slice is the first low-risk Mobile Admin
confirmed-write API. Owner-authenticated GET
`/api/mobile-admin/private-rows/actions?rowId=...` exposes only the row-specific
confirmation contract and stale-state token to accepted owners.
Owner-authenticated POST can mark a private row read or deferred after exact
confirmation, idempotency, stale row revision, stale-state token, and audit
correlation checks. Public source-data exposes only the route, status, counts,
latest redacted action labels, and redaction flags; it excludes actor identity,
private notes, owner-only row notes, private payload JSON, idempotency keys,
stale-state tokens, token hashes, and raw rows.

The current #414 push and distribution boundary slice still does not send
notifications or create installable distribution. It makes the missing APNs/FCM
provider configuration, private device-token registration, send preflight,
queue, delivery-result, receipt, physical-device proof, signing, and store-track
evidence explicit in the contract and app scaffolds. Public source-data may
expose provider names, disabled status, required evidence, and blockers, but it
must not expose provider credentials, device tokens, recipient identifiers, push
payload bodies, provider responses, queue rows, delivery receipts, signing
credentials, provisioning profiles, keystore material, store account
identifiers, private tester lists, or physical-device private rows.

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
- `/api/mobile-admin/private-rows`: owner-session-only private row inspection.
  Public mobile source-data can mention route, counts, row labels, and redaction
  flags, but it must not include owner-only notes or private payload JSON.
- `/api/mobile-admin/private-rows/actions`: owner-confirmed private row workflow
  actions. This can mark private rows read or deferred; it must not perform
  billing, commerce, publishing, moderation, creator-speech, push, distribution,
  or public agent writes.
- `/api/mobile-admin/actions`: owner-gated audit-only action intents for mobile
  admin actions. Future domain-specific APIs must still perform any production
  mutation.
- `/mobile-admin/source-data`: public-safe push-notification and distribution
  readiness boundaries. These name APNs/FCM and store-readiness requirements
  without exposing credentials or claiming push/store distribution is live.
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

The first iOS and Android slices can inspect owner-session private rows through
`/api/mobile-admin/private-rows`, mark those private rows read or deferred
through `/api/mobile-admin/private-rows/actions`, record audit-only action
intents through `/api/mobile-admin/actions`, and render push/distribution
readiness boundaries from `/mobile-admin/source-data`, but high-risk production
mobile writes still require domain-specific confirmed-write APIs. Public,
destructive, billing-impacting, publishing, moderation, source-editing,
creator-speech, live push, and distribution actions require explicit
confirmation text, idempotency, stale-state checks, audit correlation, platform
evidence, and redaction.

The current #414 surface proves that iOS and Android expose the same private
auth, private-row, private-row action, action-intent, push-readiness,
distribution-readiness, and confirmed-action rules the web/admin app uses; it
does not prove App Store/TestFlight or Play Store/internal-testing distribution,
live push notifications, physical-device private row proof, billing mutation,
publishing mutation, commerce mutation, or full mobile write parity.
