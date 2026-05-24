UPDATE admin_roadmap_items
SET
  issue_number = 414,
  summary = 'Current follow-up for installable private mobile admin parity after the completed read-only dashboard, iOS scaffold, Android scaffold, live-hydration, and owner-session/confirmed-action contract slices.',
  public_evidence_json = json_array(
    'Current active follow-up tracked by issue #414.',
    'Original scaffold contract tracked by issue #13.',
    'iOS app slice tracked by issue #67.',
    'Android app slice tracked by issue #68.',
    'Live dashboard source-data slice tracked by issue #153.',
    'Mobile dashboard scaffold rendering tracked by issue #155.',
    'Mobile dashboard live network hydration tracked by issue #157.',
    'Issue #414 now renders the owner-session and confirmed-action contract in the Expo, iOS, and Android app scaffolds while keeping mobile mutations disabled.',
    '`/mobile-admin/source-data` exposes the shared mobile contract, private-auth boundary, confirmed-action requirements, and no-installable-app caveat.',
    '`/mobile-admin/dashboard/source-data` exposes the public-safe dashboard digest plus redacted private-auth and confirmed-action summaries for mobile clients.',
    '`/mobile-admin/ios/source-data` exposes the iOS scaffold, fixture, simulator smoke command, owner-session contract, confirmed-action cards, and screenshot path.',
    '`/mobile-admin/android/source-data` exposes the Android scaffold, fixture asset, emulator smoke command, owner-session contract, confirmed-action cards, and screenshot path.'
  ),
  next_milestone = 'Add authenticated private mobile rows, live confirmed-write API implementation, physical-device proof, push-notification boundaries, and eventual App Store/Play Store distribution readiness without claiming parity early.',
  updated_at = unixepoch()
WHERE id = 'roadmap-mobile-admin';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[414,13,67,68,153,155,157]',
  source_evidence_json = '["https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/mobile-admin/dashboard/source-data","https://bumpgrade.com/mobile-admin/ios/source-data","https://bumpgrade.com/mobile-admin/android/source-data","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin","https://github.com/markitics/bumpgrade/issues/414","https://github.com/markitics/bumpgrade/issues/13","https://github.com/markitics/bumpgrade/issues/67","https://github.com/markitics/bumpgrade/issues/68","https://github.com/markitics/bumpgrade/issues/153","https://github.com/markitics/bumpgrade/issues/155","https://github.com/markitics/bumpgrade/issues/157"]',
  happy_path_json = '["Open the future mobile admin app.","Fetch /mobile-admin/dashboard/source-data for the public-safe mobile dashboard digest.","For iOS, open the first simulator scaffold and read the live dashboard payload, falling back to the generated fixture if the network is unavailable.","For Android, open the first emulator scaffold and read the live dashboard payload, falling back to the same generated fixture if the network is unavailable.","Confirm the Expo, iOS, and Android surfaces distinguish live network hydration from fixture fallback while keeping the dashboard read-only.","Review the shared owner-session panel and confirmed-action cards before any private mobile rows or live mobile mutations exist.","Use the dashboard digest to resolve live /admin/source-data, /features/source-data, /roadmap/source-data, /commerce/source-data, and /agent-docs/source-data without scraping private admin pages.","Use issue #414 for private mobile rows, live confirmed-write APIs, device proof, push-notification boundaries, and eventual distribution readiness.","Follow closed scaffold issues #13, #67, #68, #153, #155, and #157 for completed read-only evidence."]',
  edge_cases_json = '["The iOS simulator target is not App Store distribution, push notifications, private mobile rows, or live confirmed-write support.","The Android emulator target is not Play Store distribution, push notifications, private mobile rows, or live confirmed-write support.","Private admin state requires Better Auth owner or publisher sessions.","Mobile writes stay disabled until confirmed-write APIs exist.","/mobile-admin/dashboard/source-data is public-safe and excludes private buyer rows, owner email values, raw inbox bodies, R2 object keys, signed URLs, secret values, upload bodies, session IDs, and write tokens."]',
  agent_access = 'Agents can read /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data to understand app scope, live public-safe mobile digest state, owner-session requirements, confirmed-action requirements, and smoke evidence; they must not claim mobile app parity until private rows, distribution, and live confirmed writes ship.',
  validation_json = '["Issue #414 tracks private mobile auth, confirmed-write UX, device proof, push-notification boundaries, and eventual distribution readiness after scaffold closeout.","Issue #13 defines the shared contract and splits iOS and Android child issues.","Issue #67 adds an Expo app scaffold, generated fixture, iOS simulator target, validation command, smoke command, and screenshot path.","Issue #68 adds a native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.","Issue #153 adds /mobile-admin/dashboard/source-data as the live public-safe dashboard contract.","Issue #155 renders the live dashboard route and redaction boundary in the Expo, iOS, and Android scaffold surfaces.","Issue #157 fetches the live dashboard route in Expo, iOS, and Android while preserving fixture fallback for deterministic smoke tests.","Issue #414 renders the shared owner-session and confirmed-action contract in Expo, iOS, Android, source-data, and agent docs while keeping mobile writes disabled.","Playwright covers /agent-docs/bumpgrade-mobile-admin, /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data. Mobile validations assert the scaffold apps render and live-hydrate the dashboard panel."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-checks-mobile-admin';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-mobile-admin-auth-actions-contract',
  'Added Mobile Admin owner-session and confirmed-action contract',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for fewer niche technical ships and clearer Director-level status; this advances the active Mobile Admin bucket with one owner-visible auth/actions contract slice instead of claiming full app parity early.',
  '[{"number":414,"url":"https://github.com/markitics/bumpgrade/issues/414"},{"number":13,"url":"https://github.com/markitics/bumpgrade/issues/13"},{"number":67,"url":"https://github.com/markitics/bumpgrade/issues/67"},{"number":68,"url":"https://github.com/markitics/bumpgrade/issues/68"},{"number":153,"url":"https://github.com/markitics/bumpgrade/issues/153"},{"number":155,"url":"https://github.com/markitics/bumpgrade/issues/155"},{"number":157,"url":"https://github.com/markitics/bumpgrade/issues/157"}]',
  '[{"number":419,"url":"https://github.com/markitics/bumpgrade/pull/419"}]',
  '["feature-mobile-admin"]',
  '["roadmap-mobile-admin active: owner-session and confirmed-action contract rendered; private rows, live writes, device proof, push, and distribution remain next"]',
  '["journey-publisher-checks-mobile-admin updated with owner-session and confirmed-action requirements"]',
  '["apps/mobile-admin/README.md","docs/features/mobile-admin.md","docs/agent/agent-ready.md","public/llms.txt","/agent-docs/bumpgrade-mobile-admin"]',
  '["git diff --check","npm run db:migrate:local","npm run mobile:ios:validate","npm run mobile:android:validate","npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run cf:build","focused Playwright mobile source-data checks","npm run mobile:ios:smoke","npm run mobile:android:smoke"]',
  NULL,
  unixepoch() - 3600,
  unixepoch(),
  '["https://github.com/markitics/bumpgrade/pull/419","https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/mobile-admin/dashboard/source-data","https://bumpgrade.com/mobile-admin/ios/source-data","https://bumpgrade.com/mobile-admin/android/source-data","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin","https://bumpgrade.com/pr-screenshots/issue-67-ios-mobile-admin-simulator.png","https://bumpgrade.com/pr-screenshots/issue-68-android-mobile-admin-emulator.png","https://bumpgrade.com/pr-screenshots/issue-414-mobile-auth-actions-agent-docs.png"]',
  'https://github.com/markitics/bumpgrade/pull/419',
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  closed_prs_json=excluded.closed_prs_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  pr_comment_url=excluded.pr_comment_url,
  updated_at=excluded.updated_at;
