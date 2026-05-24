CREATE TABLE IF NOT EXISTS mobile_admin_private_row_actions (
  id TEXT PRIMARY KEY,
  row_id TEXT NOT NULL,
  action_id TEXT NOT NULL,
  action_title TEXT NOT NULL,
  previous_read_state TEXT NOT NULL,
  next_read_state TEXT NOT NULL,
  previous_requires_action INTEGER NOT NULL DEFAULT 0,
  next_requires_action INTEGER NOT NULL DEFAULT 0,
  expected_row_updated_at TEXT NOT NULL,
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
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (row_id) REFERENCES mobile_admin_private_rows(id)
);

CREATE INDEX IF NOT EXISTS idx_mobile_admin_private_row_actions_row
  ON mobile_admin_private_row_actions(row_id);

CREATE INDEX IF NOT EXISTS idx_mobile_admin_private_row_actions_action
  ON mobile_admin_private_row_actions(action_id);

UPDATE admin_roadmap_items
SET
  issue_number = 414,
  summary = 'Current follow-up for installable private mobile admin parity after the completed read-only dashboard, iOS scaffold, Android scaffold, live-hydration, owner-session/confirmed-action contract, audit-only action-intent API, private-row inspection, and low-risk private-row workflow action slices.',
  public_evidence_json = json_array(
    'Current active follow-up tracked by issue #414.',
    'Original scaffold contract tracked by issue #13.',
    'iOS app slice tracked by issue #67.',
    'Android app slice tracked by issue #68.',
    'Live dashboard source-data slice tracked by issue #153.',
    'Mobile dashboard scaffold rendering tracked by issue #155.',
    'Mobile dashboard live network hydration tracked by issue #157.',
    'Issue #414 renders the owner-session and confirmed-action contract in the Expo, iOS, and Android app scaffolds while keeping high-risk production mobile mutations disabled.',
    'Issue #414 adds owner-gated POST /api/mobile-admin/actions for audit-only action intents with exact confirmation, idempotency, stale-state, contract revision, source-route, audit-correlation, and redaction checks.',
    'Issue #414 adds owner-gated GET /api/mobile-admin/private-rows for read-only private mobile row inspection through the shared Better Auth owner session.',
    'Issue #428 adds owner-gated POST /api/mobile-admin/private-rows/actions for low-risk private-row workflow actions with exact confirmation, idempotency, stale row revision, stale-state token, audit correlation, and redaction checks.',
    '`/mobile-admin/source-data` exposes the shared mobile contract, private-auth boundary, private-row API summary, private-row action API summary, action-intent API summary, confirmed-action requirements, and no-installable-app caveat.',
    '`/mobile-admin/dashboard/source-data` exposes the public-safe dashboard digest plus redacted private-auth, private-row, private-row action, confirmed-action, and action-intent summaries for mobile clients.'
  ),
  next_milestone = 'Add higher-risk domain-specific production confirmed-write APIs, physical-device proof, push-notification boundaries, and eventual App Store/Play Store distribution readiness without claiming parity early.',
  updated_at = unixepoch()
WHERE id = 'roadmap-mobile-admin';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[414,428,13,67,68,153,155,157]',
  source_evidence_json = '["https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/mobile-admin/dashboard/source-data","https://bumpgrade.com/mobile-admin/ios/source-data","https://bumpgrade.com/mobile-admin/android/source-data","https://bumpgrade.com/api/mobile-admin/private-rows","https://bumpgrade.com/api/mobile-admin/private-rows/actions","https://bumpgrade.com/api/mobile-admin/actions","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin","https://github.com/markitics/bumpgrade/issues/414","https://github.com/markitics/bumpgrade/issues/428","https://github.com/markitics/bumpgrade/issues/13","https://github.com/markitics/bumpgrade/issues/67","https://github.com/markitics/bumpgrade/issues/68","https://github.com/markitics/bumpgrade/issues/153","https://github.com/markitics/bumpgrade/issues/155","https://github.com/markitics/bumpgrade/issues/157"]',
  happy_path_json = '["Open the future mobile admin app.","Fetch /mobile-admin/dashboard/source-data for the public-safe mobile dashboard digest.","For iOS, open the first simulator scaffold and read the live dashboard payload, falling back to the generated fixture if the network is unavailable.","For Android, open the first emulator scaffold and read the live dashboard payload, falling back to the same generated fixture if the network is unavailable.","Confirm the Expo, iOS, and Android surfaces distinguish live network hydration from fixture fallback while keeping high-risk production actions disabled.","Use owner-gated /api/mobile-admin/private-rows to inspect synthetic private mobile rows only after the shared Better Auth owner session succeeds.","Use owner-gated /api/mobile-admin/private-rows/actions to mark private rows read or deferred after exact confirmation, idempotency, stale row revision, stale-state token, and audit-correlation checks.","Use owner-gated /api/mobile-admin/actions to record redacted audit-only action intent evidence after exact confirmation, idempotency, contract revision, stale-state, source-route, and audit-correlation checks.","Use issue #414 for higher-risk production confirmed-write APIs, device proof, push-notification boundaries, and eventual distribution readiness."]',
  edge_cases_json = '["The iOS simulator target is not App Store distribution, push notifications, high-risk production confirmed-write support, or physical device proof.","The Android emulator target is not Play Store distribution, push notifications, high-risk production confirmed-write support, or physical device proof.","Private admin state requires Better Auth owner sessions.","/api/mobile-admin/private-rows is owner-session-only and must not be exposed in public source-data beyond route, count, public row labels, and redaction metadata.","/api/mobile-admin/private-rows/actions mutates only private-row workflow state and must not be described as billing, commerce, publishing, push, moderation, creator-speech, or distribution support.","/api/mobile-admin/actions records audit-only action intent evidence and must not be described as production mutation support.","Domain-specific high-risk mobile writes stay disabled until separate confirmed-write APIs exist.","/mobile-admin/dashboard/source-data is public-safe and excludes private buyer rows, owner email values, raw inbox bodies, R2 object keys, signed URLs, secret values, upload bodies, session IDs, and write tokens."]',
  agent_access = 'Agents can read /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data to understand app scope, live public-safe mobile digest state, owner-session requirements, private-row API boundaries, private-row action API boundaries, action-intent API boundaries, confirmed-action requirements, and smoke evidence. Owner-authenticated clients can inspect /api/mobile-admin/private-rows, mutate private-row workflow state through /api/mobile-admin/private-rows/actions, and inspect /api/mobile-admin/actions. Agents must not claim full mobile app parity until higher-risk production confirmed writes, distribution, push notifications, and physical-device proof ship.',
  validation_json = '["Issue #414 tracks private mobile auth, confirmed-write UX, device proof, push-notification boundaries, and eventual distribution readiness after scaffold closeout.","Issue #428 tracks low-risk private-row confirmed actions for Mobile Admin.","Issue #13 defines the shared contract and splits iOS and Android child issues.","Issue #67 adds an Expo app scaffold, generated fixture, iOS simulator target, validation command, smoke command, and screenshot path.","Issue #68 adds a native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.","Issue #153 adds /mobile-admin/dashboard/source-data as the live public-safe dashboard contract.","Issue #155 renders the live dashboard route and redaction boundary in the Expo, iOS, and Android scaffold surfaces.","Issue #157 fetches the live dashboard route in Expo, iOS, and Android while preserving fixture fallback for deterministic smoke tests.","Playwright covers /agent-docs/bumpgrade-mobile-admin, /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, /mobile-admin/android/source-data, /api/mobile-admin/private-rows, /api/mobile-admin/private-rows/actions, and /api/mobile-admin/actions. Mobile validations assert the scaffold apps render and live-hydrate the dashboard panel."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-checks-mobile-admin';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-mobile-admin-private-row-actions',
  'Added Mobile Admin private-row confirmed actions',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for less noisy status and clearer executive nesting; this advances the active Mobile Admin bucket with one low-risk owner-confirmed private-row workflow mutation instead of claiming broad parity.',
  '[{"number":414,"url":"https://github.com/markitics/bumpgrade/issues/414"},{"number":428,"url":"https://github.com/markitics/bumpgrade/issues/428"}]',
  '[]',
  '["feature-mobile-admin"]',
  '["roadmap-mobile-admin remains active: private-row workflow actions added; high-risk production writes, device proof, push, and distribution remain next"]',
  '["journey-publisher-checks-mobile-admin updated with private-row action API boundary"]',
  '["docs/features/mobile-admin.md","docs/agent/agent-ready.md","public/llms.txt","/agent-docs/bumpgrade-mobile-admin"]',
  '["git diff --check","npm run db:migrate:local","npm run mobile:ios:validate","npm run mobile:android:validate","npm run typecheck","focused Playwright mobile private-row action checks"]',
  NULL,
  unixepoch() - 3600,
  unixepoch(),
  '["https://github.com/markitics/bumpgrade/issues/414","https://github.com/markitics/bumpgrade/issues/428","https://bumpgrade.com/mobile-admin/source-data","https://bumpgrade.com/mobile-admin/dashboard/source-data","https://bumpgrade.com/mobile-admin/ios/source-data","https://bumpgrade.com/mobile-admin/android/source-data","https://bumpgrade.com/api/mobile-admin/private-rows","https://bumpgrade.com/api/mobile-admin/private-rows/actions","https://bumpgrade.com/api/mobile-admin/actions","https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin"]',
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
