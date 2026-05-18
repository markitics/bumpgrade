UPDATE admin_roadmap_items
SET
  status = 'live',
  summary = 'Cloudflare Email Routing is enabled for bumpgrade.com, shipped PR notices can send from codex@bumpgrade.com, and inbound replies route through the Worker into D1/R2 evidence.',
  public_evidence_json = '["Issue #10 owns Codex project email and reply monitoring.", "Cloudflare Email Routing required MX, SPF, and DKIM records were installed on 2026-05-18.", "A delayed PR #40 notice from codex@bumpgrade.com to m@rkmoriarty.com returned delivered and is stored in codex_outbound_messages.", "Cloudflare routes codex@bumpgrade.com to Worker bumpgrade.", "R2 bucket bumpgrade-mail stores raw inbound MIME under codex/email/inbound/."]',
  next_milestone = 'Poll trusted replies before unrelated large work and verify D1/R2 inbound capture on the next real reply.',
  mark_attention = 'Self-addressed inbound smoke through Cloudflare Email Sending returns email.sending.error.email.sending_disabled because codex@bumpgrade.com is an inbound alias, not a verified send destination.',
  updated_at = unixepoch()
WHERE id = 'roadmap-codex-email';

UPDATE mark_attention_items
SET
  state = 'resolved',
  details = 'codex@bumpgrade.com can now send shipped notices through Cloudflare Email Service. Cloudflare Email Routing is ready and has a literal route for codex@bumpgrade.com to Worker bumpgrade. The Worker stores inbound metadata in D1, raw MIME in R2, and forwards copies to Mark.',
  required_action = 'No immediate Mark action required. Reply to codex@bumpgrade.com when useful; agents should poll trusted replies before unrelated large work.',
  response_instructions = 'Reply to codex@bumpgrade.com or comment on issue #10 if the workflow misses an expected message.',
  metadata_json = '{"blocksShippedEmail":false,"deliveredPrNotice":40,"inboundRoute":"codex@bumpgrade.com -> Worker bumpgrade"}',
  last_activity_at = unixepoch(),
  updated_at = unixepoch()
WHERE id = 'mark-attention-2026-05-18-codex-email-blocked';

INSERT INTO mark_attention_items (
  id, category, state, urgency, title, summary, details, required_action,
  response_instructions, session_name, session_id, session_email, source_agent,
  source_kind, links_json, metadata_json, last_activity_at, created_at, updated_at
) VALUES (
  'mark-attention-2026-05-18-blocked-valid-stripe-sandbox-secret',
  'blocked',
  'open',
  'high',
  'Valid Stripe sandbox key needed for live checkout smoke',
  'Bumpgrade''s sandbox checkout route is deployed and redacted, but production remains in safe preview mode because the copied Stripe sandbox secret is not a usable test key.',
  'PR #40 shipped the checkout path. PR #45 fixed runtime secret precedence so Cloudflare Worker secrets will win over build-time local placeholders. The remaining blocker is provisioning a valid Bumpgrade Stripe test secret and webhook signing secret without printing them.',
  'Provide or create a valid Stripe test secret for Bumpgrade, then store it as STRIPE_SECRET_KEY_SANDBOX and create the Bumpgrade test webhook endpoint for https://bumpgrade.com/api/stripe/webhook.',
  'Reply with where the valid Stripe test key should come from, or confirm Codex may create it in the Stripe dashboard if browser access is available.',
  'bumpgrade-bootstrap',
  NULL,
  'codex@bumpgrade.com',
  'Codex',
  'codex',
  '[{"label":"Provisioning issue","url":"https://github.com/markitics/bumpgrade/issues/46"},{"label":"Sandbox checkout PR","url":"https://github.com/markitics/bumpgrade/pull/40"},{"label":"Runtime secret precedence PR","url":"https://github.com/markitics/bumpgrade/pull/45"},{"label":"Live checkout contract","url":"https://bumpgrade.com/api/commerce/checkout"}]',
  '{"issue":46,"blocking":["real sandbox Checkout Session smoke","Bumpgrade webhook endpoint signing secret"],"livePaymentEnabled":false}',
  1779106920,
  1779106920,
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
  session_name=excluded.session_name,
  session_email=excluded.session_email,
  source_agent=excluded.source_agent,
  source_kind=excluded.source_kind,
  links_json=excluded.links_json,
  metadata_json=excluded.metadata_json,
  last_activity_at=excluded.last_activity_at,
  updated_at=unixepoch();
