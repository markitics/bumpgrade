CREATE TABLE IF NOT EXISTS `user` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `email_verified` integer DEFAULT false NOT NULL,
  `image` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `user_email_unique` ON `user` (`email`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `session` (
  `id` text PRIMARY KEY NOT NULL,
  `expires_at` integer NOT NULL,
  `token` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `session_token_unique` ON `session` (`token`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `session_user_id_idx` ON `session` (`user_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `account` (
  `id` text PRIMARY KEY NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` text NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` integer,
  `refresh_token_expires_at` integer,
  `scope` text,
  `password` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `account_user_id_idx` ON `account` (`user_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `verification` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `verification_identifier_idx` ON `verification` (`identifier`);
--> statement-breakpoint
UPDATE admin_roadmap_items
SET
  status = 'live',
  public_evidence_json = '["Tracked by issue #9.", "Better Auth API route, D1 auth tables, login/sign-up UI, and protected admin page gates are included in the issue #9 implementation."]',
  next_milestone = 'Wire project email in #10 so production owner email verification can be completed from codex@bumpgrade.com workflows.',
  mark_attention = 'Production admin access requires a verified owner email; project email remains tracked in #10.',
  updated_at = unixepoch()
WHERE id = 'roadmap-better-auth';
--> statement-breakpoint
INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES
  ('journey-owner-opens-protected-admin', 'Owner opens protected admin surfaces', 'feature-better-auth', 'live', '[9,10]', 'Mark as Bumpgrade owner', 'Sign in with a Bumpgrade owner account before viewing private admin roadmap, work-log, user-journey, or for-Mark pages.', '["https://bumpgrade.com/login", "https://bumpgrade.com/admin/roadmap", "https://github.com/markitics/bumpgrade/issues/9"]', '["Open /login.", "Create or sign in to a Bumpgrade account.", "Open an admin route.", "If the owner email is verified and allowlisted, view the private admin page; otherwise see a specific gate reason."]', '["Production owner verification depends on email sending/routing in #10.", "Agent-readable source-data routes stay public-safe and should not carry private notes or secrets."]', 'Agents can read public-safe source-data routes, but browser admin pages require a Better Auth owner session and must not be scraped as a bypass.', '["Playwright covers signed-out admin gates and auth API availability.", "D1 migration creates Better Auth storage tables."]', 35, unixepoch())
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
