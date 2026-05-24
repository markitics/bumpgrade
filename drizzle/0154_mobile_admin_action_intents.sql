CREATE TABLE IF NOT EXISTS mobile_admin_action_intents (
  id TEXT PRIMARY KEY,
  action_id TEXT NOT NULL,
  action_title TEXT NOT NULL,
  action_surface TEXT NOT NULL,
  source_route TEXT NOT NULL,
  target_id TEXT,
  expected_contract_updated_at TEXT NOT NULL,
  stale_state_token_sha256 TEXT NOT NULL,
  confirmation_text_sha256 TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  audit_correlation_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_email_hash TEXT NOT NULL,
  private_note_sha256 TEXT,
  production_mutation_created INTEGER NOT NULL DEFAULT 0,
  billing_mutation_created INTEGER NOT NULL DEFAULT 0,
  push_notification_sent INTEGER NOT NULL DEFAULT 0,
  distribution_state_changed INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mobile_admin_action_intents_action
  ON mobile_admin_action_intents(action_id);

CREATE INDEX IF NOT EXISTS idx_mobile_admin_action_intents_source_route
  ON mobile_admin_action_intents(source_route);

UPDATE admin_roadmap_items
SET
  issue_number = 414,
  summary = 'Current follow-up for installable private mobile admin parity after the completed read-only dashboard, iOS scaffold, Android scaffold, live-hydration, owner-session/confirmed-action contract, and owner-gated audit-only action-intent API slices.',
  public_evidence_json = json_array(
    'Current active follow-up tracked by issue #414.',
    'Original scaffold contract tracked by issue #13.',
    'iOS app slice tracked by issue #67.',
    'Android app slice tracked by issue #68.',
    'Live dashboard source-data slice tracked by issue #153.',
    'Mobile dashboard scaffold rendering tracked by issue #155.',
    'Mobile dashboard live network hydration tracked by issue #157.',
    'Issue #414 renders the owner-session and confirmed-action contract in the Expo, iOS, and Android app scaffolds while keeping production mobile mutations disabled.',
    'Issue #414 now adds owner-gated POST /api/mobile-admin/actions for audit-only action intents with exact confirmation, idempotency, stale-state, contract revision, source-route, audit-correlation, and redaction checks.',
    '`/mobile-admin/source-data` exposes the shared mobile contract, private-auth boundary, action-intent API summary, confirmed-action requirements, and no-installable-app caveat.',
    '`/mobile-admin/dashboard/source-data` exposes the public-safe dashboard digest plus redacted private-auth, confirmed-action, and action-intent summaries for mobile clients.',
    '`/mobile-admin/ios/source-data` exposes the iOS scaffold, fixture, simulator smoke command, owner-session contract, action-intent API panel, confirmed-action cards, and screenshot path.',
    '`/mobile-admin/android/source-data` exposes the Android scaffold, fixture asset, emulator smoke command, owner-session contract, action-intent API panel, confirmed-action cards, and screenshot path.'
  ),
  next_milestone = 'Add authenticated private mobile rows, domain-specific production confirmed-write APIs, physical-device proof, push-notification boundaries, and eventual App Store/Play Store distribution readiness without claiming parity early.',
  updated_at = unixepoch()
WHERE id = 'roadmap-mobile-admin';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[414,13,67,68,153,155,157]',
  source_evidence_json = '["https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/mobile-admin/dashboard/source-data","https://bumpgrade.com/mobile-admin/ios/source-data","https://bumpgrade.com/mobile-admin/android/source-data","https://bumpgrade.com/api/mobile-admin/actions","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin","https://github.com/markitics/bumpgrade/issues/414","https://github.com/markitics/bumpgrade/issues/13","https://github.com/markitics/bumpgrade/issues/67","https://github.com/markitics/bumpgrade/issues/68","https://github.com/markitics/bumpgrade/issues/153","https://github.com/markitics/bumpgrade/issues/155","https://github.com/markitics/bumpgrade/issues/157"]',
  happy_path_json = '["Open the future mobile admin app.","Fetch /mobile-admin/dashboard/source-data for the public-safe mobile dashboard digest.","For iOS, open the first simulator scaffold and read the live dashboard payload, falling back to the generated fixture if the network is unavailable.","For Android, open the first emulator scaffold and read the live dashboard payload, falling back to the same generated fixture if the network is unavailable.","Confirm the Expo, iOS, and Android surfaces distinguish live network hydration from fixture fallback while keeping production actions read-only.","Review the shared owner-session panel, action-intent API panel, and confirmed-action cards before any private mobile rows or live production mutations exist.","Use owner-gated /api/mobile-admin/actions to record redacted audit-only action intent evidence after exact confirmation, idempotency, contract revision, stale-state, source-route, and audit-correlation checks.","Use the dashboard digest to resolve live /admin/source-data, /features/source-data, /roadmap/source-data, /commerce/source-data, and /agent-docs/source-data without scraping private admin pages.","Use issue #414 for private mobile rows, domain-specific production confirmed-write APIs, device proof, push-notification boundaries, and eventual distribution readiness.","Follow closed scaffold issues #13, #67, #68, #153, #155, and #157 for completed read-only evidence."]',
  edge_cases_json = '["The iOS simulator target is not App Store distribution, push notifications, private mobile rows, or production confirmed-write support.","The Android emulator target is not Play Store distribution, push notifications, private mobile rows, or production confirmed-write support.","Private admin state requires Better Auth owner or publisher sessions.","/api/mobile-admin/actions records audit-only action intent evidence and must not be described as production mutation support.","Domain-specific mobile writes stay disabled until separate confirmed-write APIs exist.","/mobile-admin/dashboard/source-data is public-safe and excludes private buyer rows, owner email values, raw inbox bodies, R2 object keys, signed URLs, secret values, upload bodies, session IDs, and write tokens."]',
  agent_access = 'Agents can read /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data to understand app scope, live public-safe mobile digest state, owner-session requirements, action-intent API boundaries, confirmed-action requirements, and smoke evidence. Owner-authenticated clients can inspect /api/mobile-admin/actions and record audit-only action intent evidence. Agents must not claim mobile app parity until private rows, distribution, push notifications, and domain-specific production confirmed writes ship.',
  validation_json = '["Issue #414 tracks private mobile auth, confirmed-write UX, device proof, push-notification boundaries, and eventual distribution readiness after scaffold closeout.","Issue #13 defines the shared contract and splits iOS and Android child issues.","Issue #67 adds an Expo app scaffold, generated fixture, iOS simulator target, validation command, smoke command, and screenshot path.","Issue #68 adds a native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.","Issue #153 adds /mobile-admin/dashboard/source-data as the live public-safe dashboard contract.","Issue #155 renders the live dashboard route and redaction boundary in the Expo, iOS, and Android scaffold surfaces.","Issue #157 fetches the live dashboard route in Expo, iOS, and Android while preserving fixture fallback for deterministic smoke tests.","Issue #414 renders the shared owner-session, action-intent API, and confirmed-action contract in Expo, iOS, Android, source-data, and agent docs while keeping production mobile mutations disabled.","Playwright covers /agent-docs/bumpgrade-mobile-admin, /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, /mobile-admin/android/source-data, and /api/mobile-admin/actions. Mobile validations assert the scaffold apps render and live-hydrate the dashboard panel."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-checks-mobile-admin';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-mobile-admin-action-intents',
  'Added Mobile Admin audit-only action intents',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for less noisy status and clearer executive nesting; this advances the active Mobile Admin bucket with one owner-visible action-intent boundary instead of claiming broad mobile parity.',
  '[{"number":414,"url":"https://github.com/markitics/bumpgrade/issues/414"},{"number":13,"url":"https://github.com/markitics/bumpgrade/issues/13"}]',
  '[]',
  '["feature-mobile-admin"]',
  '["roadmap-mobile-admin remains active: audit-only action intent API added; private rows, production writes, device proof, push, and distribution remain next"]',
  '["journey-publisher-checks-mobile-admin updated with action-intent API boundary"]',
  '["docs/features/mobile-admin.md","docs/agent/agent-ready.md","public/llms.txt","/agent-docs/bumpgrade-mobile-admin"]',
  '["git diff --check","npm run db:migrate:local","npm run mobile:ios:validate","npm run mobile:android:validate","npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run cf:build","focused Playwright mobile action-intent checks"]',
  NULL,
  unixepoch() - 3600,
  unixepoch(),
  '["https://github.com/markitics/bumpgrade/issues/414","https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/mobile-admin/dashboard/source-data","https://bumpgrade.com/mobile-admin/ios/source-data","https://bumpgrade.com/mobile-admin/android/source-data","https://bumpgrade.com/api/mobile-admin/actions","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin"]',
  NULL,
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
