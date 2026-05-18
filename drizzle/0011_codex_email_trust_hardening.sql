ALTER TABLE codex_inbound_messages
ADD COLUMN sender_verification_status TEXT NOT NULL DEFAULT 'trusted_unverified';

ALTER TABLE codex_inbound_messages
ADD COLUMN sender_authentication_json TEXT;

ALTER TABLE codex_inbound_messages
ADD COLUMN auto_replied_at INTEGER;

ALTER TABLE codex_inbound_messages
ADD COLUMN auto_reply_error TEXT;

UPDATE codex_inbound_messages
SET
  trusted_sender = 0,
  status = 'held_unverified',
  sender_verification_status = 'trusted_unverified',
  sender_authentication_json = '{"policy":"allowlisted-and-authenticated","note":"This row was received before issue #61 stored structured authentication evidence. Manual inspection of the raw MIME showed dmarc=none header.from=rkmoriarty.com, spf=pass smtp.mailfrom=markeffect@gmail.com, and arc=pass."}',
  updated_at = unixepoch()
WHERE id = 'codex-inbound-b0f253d8-9bdc-4dfc-9da2-0132ee8c6b05';

UPDATE admin_roadmap_items
SET
  next_milestone = 'Harden inbound Codex mail so only explicitly allowlisted and authenticated senders can steer Codex.',
  mark_attention = 'Mark asked that only m@rkmoriarty.com, mark@awesound.com, and markmoriarty@stripe.com can steer Codex, and that messages must pass sender authentication rather than trusting From text.',
  updated_at = unixepoch()
WHERE id = 'roadmap-codex-email';

INSERT INTO mark_attention_items (
  id, category, state, urgency, title, summary, details, required_action, response_instructions,
  session_name, session_email, source_agent, source_kind, links_json, metadata_json, last_activity_at, created_at, updated_at
) VALUES (
  'mark-attention-2026-05-18-rkmoriarty-auth-alignment',
  'review',
  'open',
  'medium',
  'Confirm authenticated sender alignment for m@rkmoriarty.com',
  'The first real reply proved D1/R2 inbound capture, but strict sender verification cannot treat From text alone as proof.',
  'Cloudflare authentication headers on Mark''s first reply showed dmarc=none for header.from=rkmoriarty.com and spf=pass for smtp.mailfrom=markeffect@gmail.com. Issue #61 hardens Codex so only the three addresses Mark listed can steer it, and only when authentication evidence aligns.',
  'If m@rkmoriarty.com should steer Codex directly, configure aligned SPF/DKIM/DMARC for that sending path or use mark@awesound.com / markmoriarty@stripe.com until alignment is verified.',
  'Reply to codex@bumpgrade.com or comment on issue #61 after the preferred authenticated sender path is confirmed.',
  'bumpgrade-bootstrap',
  'codex@bumpgrade.com',
  'Codex',
  'codex',
  '[{"label":"Issue #61","url":"https://github.com/markitics/bumpgrade/issues/61","kind":"issue"},{"label":"Codex mail workflow","url":"https://bumpgrade.com/admin/for-mark","kind":"admin"}]',
  '{"blocksShippedEmail":false,"blocksUntrustedInput":true}',
  unixepoch(),
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  state=excluded.state,
  urgency=excluded.urgency,
  title=excluded.title,
  summary=excluded.summary,
  details=excluded.details,
  required_action=excluded.required_action,
  response_instructions=excluded.response_instructions,
  links_json=excluded.links_json,
  metadata_json=excluded.metadata_json,
  last_activity_at=excluded.last_activity_at,
  updated_at=excluded.updated_at;
