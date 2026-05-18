CREATE TABLE IF NOT EXISTS `account_verification_emails` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text REFERENCES `user`(`id`) ON DELETE SET NULL,
  `email` text NOT NULL,
  `subject` text NOT NULL,
  `status` text NOT NULL DEFAULT 'sent',
  `provider` text NOT NULL,
  `source` text NOT NULL,
  `error` text,
  `sent_at` integer NOT NULL,
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS `account_verification_emails_email_sent_idx`
  ON `account_verification_emails` (`email`, `sent_at`);

CREATE INDEX IF NOT EXISTS `account_verification_emails_status_sent_idx`
  ON `account_verification_emails` (`status`, `sent_at`);

UPDATE `admin_roadmap_items`
SET
  `public_evidence_json` = '["Issue #9 owns the Better Auth foundation slice.","Login/signup, D1 auth tables, Better Auth API routes, and owner-gated admin pages are included in the issue #9 implementation.","Issue #55 adds owner verification resend UX and last-sent status for protected admin gates."]',
  `next_milestone` = 'Broaden publisher account surfaces and keep verification email evidence connected to admin access.',
  `updated_at` = unixepoch()
WHERE `id` = 'roadmap-better-auth';

UPDATE `admin_user_journeys`
SET
  `issue_numbers_json` = '[9,10,55]',
  `source_evidence_json` = '["https://bumpgrade.com/login","https://bumpgrade.com/admin/roadmap","https://github.com/markitics/bumpgrade/issues/9","https://github.com/markitics/bumpgrade/issues/55"]',
  `happy_path_json` = '["Open /login.","Create or sign in to a Bumpgrade account.","Open an admin route.","If the owner email is verified and allowlisted, view the private admin page.","If the owner email is not verified, use the Gmail or resend actions instead of seeing a raw denial string."]',
  `edge_cases_json` = '["Cloudflare Email Sending may reject account confirmation mail and must return an actionable browser error.","Recent verification sends hold a 120 second resend cooldown.","Agent-readable source-data routes stay public-safe and should not carry private notes or secrets."]',
  `validation_json` = '["Playwright covers signed-out admin gates, verified owner sign-in, and unverified owner resend/cooldown copy.","D1 migration creates Better Auth storage and account verification email event tables."]',
  `updated_at` = unixepoch()
WHERE `id` = 'journey-owner-opens-protected-admin';
