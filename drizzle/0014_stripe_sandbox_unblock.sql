UPDATE mark_attention_items
SET
  state = 'resolved',
  title = 'Stripe sandbox checkout credentials configured',
  summary = 'The Bumpgrade sandbox checkout route now has a valid test secret, public key, and endpoint-specific webhook signing secret configured in Cloudflare.',
  details = 'Issue #46 records the production checkout and webhook smoke evidence. Live mode remains disabled until a later billing rollout issue deliberately enables it.',
  required_action = NULL,
  response_instructions = NULL,
  metadata_json = '{"issue":46,"blocksLiveCheckoutSmoke":false,"livePaymentEnabled":false}',
  last_activity_at = unixepoch(),
  updated_at = unixepoch()
WHERE id = 'mark-attention-2026-05-18-blocked-valid-stripe-sandbox-secret';
