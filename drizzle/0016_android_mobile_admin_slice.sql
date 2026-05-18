UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Shared mobile-admin contract plus first iOS simulator and Android emulator scaffolds for independently shippable mobile app slices.',
  public_evidence_json = '["Issue #13 owns the shared mobile admin contract.", "Issue #67 adds the first iOS Expo entrypoint, generated fixture, simulator target, validation command, smoke command, and screenshot path.", "Issue #68 adds the first native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.", "/mobile-admin/source-data exposes the shared mobile contract.", "/mobile-admin/ios/source-data exposes the iOS scaffold and smoke metadata.", "/mobile-admin/android/source-data exposes the Android scaffold and smoke metadata."]',
  next_milestone = 'Use the iOS and Android smoke evidence to add mobile auth, live source-data reads, and confirmed-write UX in follow-up slices.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-mobile-admin';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-checks-mobile-admin',
  'Publisher checks mobile admin status',
  'feature-mobile-admin',
  'pending',
  '[13,67,68]',
  'Publisher away from desktop',
  'Open the future Bumpgrade mobile app to check roadmap, work-log, for-Mark attention, and commerce health without separate mobile-only semantics.',
  '["https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/mobile-admin/ios/source-data","https://bumpgrade.com/mobile-admin/android/source-data","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin","https://github.com/markitics/bumpgrade/issues/13","https://github.com/markitics/bumpgrade/issues/67","https://github.com/markitics/bumpgrade/issues/68"]',
  '["Open the future mobile admin app.","For iOS, open the first simulator scaffold and read the digest sourced from the generated /mobile-admin/source-data fixture.","For Android, open the first emulator scaffold and read the digest sourced from the same generated /mobile-admin/source-data fixture.","Later mobile slices should read live /admin/source-data, /features/source-data, /roadmap/source-data, and /commerce/source-data.","Review work-log entries, for-Mark attention, and checkout health.","Follow iOS issue #67 or Android issue #68 for platform-specific implementation evidence."]',
  '["The iOS simulator target is not App Store distribution, push notifications, private mobile auth, or confirmed-write support.","The Android emulator target is not Play Store distribution, push notifications, private mobile auth, or confirmed-write support.","Private admin state requires Better Auth owner or publisher sessions.","Mobile writes stay disabled until confirmed-write APIs exist."]',
  'Agents can read /mobile-admin/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data to understand app scope and smoke evidence; they must not claim mobile app parity until private auth, live reads, distribution, and confirmed writes ship.',
  '["Issue #13 defines the shared contract and splits iOS and Android child issues.","Issue #67 adds an Expo app scaffold, generated fixture, iOS simulator target, validation command, smoke command, and screenshot path.","Issue #68 adds a native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.","Playwright covers /agent-docs/bumpgrade-mobile-admin, /mobile-admin/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data."]',
  42,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  feature_id=excluded.feature_id,
  feature_status=excluded.feature_status,
  issue_numbers_json=excluded.issue_numbers_json,
  primary_user=excluded.primary_user,
  user_goal=excluded.user_goal,
  source_evidence_json=excluded.source_evidence_json,
  happy_path_json=excluded.happy_path_json,
  edge_cases_json=excluded.edge_cases_json,
  agent_access=excluded.agent_access,
  validation_json=excluded.validation_json,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;
