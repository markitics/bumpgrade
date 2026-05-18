CREATE TABLE IF NOT EXISTS codex_outbound_messages (
  id TEXT PRIMARY KEY,
  message_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  provider TEXT NOT NULL DEFAULT 'cloudflare-rest',
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails_json TEXT NOT NULL,
  subject TEXT NOT NULL,
  text_body TEXT NOT NULL,
  html_body TEXT,
  pr_number INTEGER,
  github_url TEXT,
  worker_version TEXT,
  cloudflare_result_json TEXT,
  error TEXT,
  sent_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS codex_outbound_messages_status_created_idx
  ON codex_outbound_messages (status, created_at);

CREATE INDEX IF NOT EXISTS codex_outbound_messages_pr_idx
  ON codex_outbound_messages (pr_number);

CREATE TABLE IF NOT EXISTS codex_inbound_messages (
  id TEXT PRIMARY KEY,
  mailbox TEXT NOT NULL,
  from_email TEXT,
  from_name TEXT,
  trusted_sender INTEGER NOT NULL DEFAULT 0,
  subject TEXT,
  snippet TEXT,
  text_body TEXT,
  raw_storage_key TEXT,
  raw_size INTEGER,
  message_id TEXT,
  in_reply_to TEXT,
  references_header TEXT,
  status TEXT NOT NULL DEFAULT 'unread',
  received_at INTEGER NOT NULL,
  forwarded_at INTEGER,
  forward_error TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS codex_inbound_messages_mailbox_received_idx
  ON codex_inbound_messages (mailbox, received_at);

CREATE INDEX IF NOT EXISTS codex_inbound_messages_trusted_status_idx
  ON codex_inbound_messages (trusted_sender, status, received_at);

CREATE UNIQUE INDEX IF NOT EXISTS codex_inbound_messages_message_id_unique
  ON codex_inbound_messages (message_id)
  WHERE message_id IS NOT NULL;

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Cloudflare Email Routing is enabled for bumpgrade.com, Codex outbound notices have a D1 audit table, and inbound replies are routed through the Worker into D1/R2 evidence.',
  public_evidence_json = '["Issue #10 owns Codex project email and reply monitoring.", "Cloudflare Email Routing required MX, SPF, and DKIM records were installed on 2026-05-18.", "R2 bucket bumpgrade-mail stores raw inbound MIME under codex/email/inbound/.", "D1 tables codex_outbound_messages and codex_inbound_messages track sent notices and trusted replies."]',
  next_milestone = 'Retry an actual shipped PR notice from codex@bumpgrade.com after DNS propagation and use D1 inbound rows to poll for Mark replies.',
  mark_attention = 'The first REST probe before DNS readiness permanently bounced; retry after routing/DNS is fully propagated.',
  updated_at = unixepoch()
WHERE id = 'roadmap-codex-email';

UPDATE admin_user_journeys
SET
  happy_path_json = '["Agent ships a PR and deploys it.", "Agent runs the Codex PR email script with the PR number and Worker version.", "The script sends from codex@bumpgrade.com through Cloudflare Email Service and logs the result in D1.", "Mark replies to codex@bumpgrade.com.", "Cloudflare Email Routing invokes the Worker email handler, stores raw MIME in R2, records public-safe metadata in D1, and forwards a copy to Mark.", "Agent polls trusted unread rows before starting unrelated large work."]',
  edge_cases_json = '["Cloudflare REST may return permanent_bounces if DNS/authentication has not propagated.", "Plus-address routing is not assumed because Cloudflare currently reports subaddressing disabled for bumpgrade.com.", "Only Mark-controlled sender addresses are trusted for actionable inbound tasking.", "Raw MIME and private message bodies stay in D1/R2 and must not be pasted into GitHub."]',
  validation_json = '["Cloudflare Email Routing status reports ready after MX/SPF/DKIM records were installed.", "Issue #10 tracks outbound and inbound email setup.", "The Worker email() handler stores inbound metadata and raw MIME references."]',
  updated_at = unixepoch()
WHERE id = 'journey-mark-reviews-nonblocking-attention';
