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
