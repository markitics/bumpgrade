UPDATE admin_roadmap_items
SET
  status = 'live',
  summary = 'Stripe-backed checkout flows, confirmed sandbox checkout start with a constrained order bump, optional referral-click attribution evidence, review-only commission ledger evidence, owner review/reversal actions, non-billing post-purchase upsell/downsell decision evidence, subscriptions, coupons, and audit trails.',
  public_evidence_json = '["Tracked by issue #15.", "Depends on Stripe architecture in #11.", "Issue #81 adds the first /offers/source-data contract and /offers/indie-launch-stack preview scaffold.", "Issue #99 adds confirmed sandbox checkout start support for the seeded primary offer plus pre-payment order bump.", "Issue #111 adds public-safe referral-click attribution evidence to checkout intent creation.", "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution.", "Issue #115 adds owner-gated review/reversal actions for commission evidence.", "Issue #117 records non-billing post-purchase upsell/downsell decisions from trusted checkout evidence.", "Issue #133 gates the checkout success CTA on trusted webhook state before opening the post-purchase path.", "Issue #165 renders the existing sandbox checkout start surface from published linked funnel checkout blocks."]',
  next_milestone = 'Keep live publisher-offer billing separated in issue #219 until the first live package, amount, and webhook secret are confirmed; one-click post-purchase charging and fulfillment remain future confirmed-write work.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-checkout-offers';

