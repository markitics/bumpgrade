UPDATE admin_roadmap_items
SET
  issue_number = 414,
  summary = 'Current follow-up for installable private mobile admin parity after the completed read-only dashboard, iOS scaffold, Android scaffold, and live-hydration slices.',
  public_evidence_json = json_array(
    'Current active follow-up tracked by issue #414.',
    'Original scaffold contract tracked by issue #13.',
    'iOS app slice tracked by issue #67.',
    'Android app slice tracked by issue #68.',
    'Live dashboard source-data slice tracked by issue #153.',
    'Mobile dashboard scaffold rendering tracked by issue #155.',
    'Mobile dashboard live network hydration tracked by issue #157.',
    '`/mobile-admin/source-data` exposes the shared mobile contract and no-installable-app caveat.',
    '`/mobile-admin/dashboard/source-data` exposes the public-safe dashboard digest for mobile clients.',
    '`/mobile-admin/ios/source-data` exposes the iOS scaffold, fixture fallback, live dashboard URL, simulator smoke command, and screenshot path.',
    '`/mobile-admin/android/source-data` exposes the Android scaffold, fixture fallback, live dashboard URL, emulator smoke command, and screenshot path.'
  ),
  next_milestone = 'Add private mobile auth, confirmed-write UX, device proof, push-notification boundaries, and eventual distribution readiness without claiming App Store or Play Store parity early.',
  updated_at = unixepoch()
WHERE id = 'roadmap-mobile-admin';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[414,13,67,68,153,155,157]',
  source_evidence_json = '["https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/mobile-admin/dashboard/source-data","https://bumpgrade.com/mobile-admin/ios/source-data","https://bumpgrade.com/mobile-admin/android/source-data","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin","https://github.com/markitics/bumpgrade/issues/414","https://github.com/markitics/bumpgrade/issues/13","https://github.com/markitics/bumpgrade/issues/67","https://github.com/markitics/bumpgrade/issues/68","https://github.com/markitics/bumpgrade/issues/153","https://github.com/markitics/bumpgrade/issues/155","https://github.com/markitics/bumpgrade/issues/157"]',
  happy_path_json = '["Open the future mobile admin app.","Fetch /mobile-admin/dashboard/source-data for the public-safe mobile dashboard digest.","For iOS, open the first simulator scaffold and read the live dashboard payload, falling back to the generated fixture if the network is unavailable.","For Android, open the first emulator scaffold and read the live dashboard payload, falling back to the same generated fixture if the network is unavailable.","Confirm the Expo, iOS, and Android surfaces distinguish live network hydration from fixture fallback while keeping the dashboard read-only.","Use the dashboard digest to resolve live /admin/source-data, /features/source-data, /roadmap/source-data, /commerce/source-data, and /agent-docs/source-data without scraping private admin pages.","Use issue #414 for private mobile auth, confirmed-write UX, device proof, push-notification boundaries, and eventual distribution readiness.","Follow closed scaffold issues #13, #67, #68, #153, #155, and #157 for completed read-only evidence."]',
  validation_json = '["Issue #414 tracks private mobile auth, confirmed-write UX, device proof, push-notification boundaries, and eventual distribution readiness after scaffold closeout.","Issue #13 defines the shared contract and splits iOS and Android child issues.","Issue #67 adds an Expo app scaffold, generated fixture, iOS simulator target, validation command, smoke command, and screenshot path.","Issue #68 adds a native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.","Issue #153 adds /mobile-admin/dashboard/source-data as the live public-safe dashboard contract.","Issue #155 renders the live dashboard route and redaction boundary in the Expo, iOS, and Android scaffold surfaces.","Issue #157 fetches the live dashboard route in Expo, iOS, and Android while preserving fixture fallback for deterministic smoke tests.","Playwright covers /agent-docs/bumpgrade-mobile-admin, /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data. Mobile validations assert the scaffold apps render and live-hydrate the dashboard panel."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-checks-mobile-admin';
