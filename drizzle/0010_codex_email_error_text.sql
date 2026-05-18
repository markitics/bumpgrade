UPDATE admin_roadmap_items
SET
  mark_attention = 'Self-addressed inbound smoke through Cloudflare Email Sending returns email.sending.error.email.sending_disabled because codex@bumpgrade.com is an inbound alias, not a verified send destination.',
  updated_at = unixepoch()
WHERE id = 'roadmap-codex-email'
  AND mark_attention LIKE '%10203%';
