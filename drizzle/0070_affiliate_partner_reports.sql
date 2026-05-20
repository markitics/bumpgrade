UPDATE admin_roadmap_items
SET
  summary = 'Affiliate programs, referral links, privacy-safe click capture, checkout attribution evidence, review-only commission ledger evidence, owner review/reversal actions, public-safe partner reports, payout review states, fraud flags, and agent-readable reports.',
  public_evidence_json = '["Issue #19 owns affiliate and referral management.", "Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold.", "Issue #109 adds POST /api/affiliates/clicks with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting.", "Issue #111 attaches validated referral click evidence to sandbox checkout intents without creating commissions or payout state.", "Issue #113 creates review-only commission ledger evidence from trusted checkout attribution without making commissions payable.", "Issue #115 adds owner-gated review, hold, and reversal actions for review-only ledger evidence without payout mutation.", "Issue #193 adds public-safe partner reports without exposing buyer, payout, tax, Stripe, raw click, raw checkout, or private actor data."]',
  next_milestone = 'Add payout batch preparation only after public-safe partner reports and review/reversal state stay stable.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_roadmap_items
SET
  next_milestone = 'Add explicit post-purchase billing contracts and payout preparation only after decision evidence, public-safe partner reports, and owner review boundaries stay stable.',
  updated_at = unixepoch()
WHERE id = 'roadmap-stripe-commerce';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109,111,113,115,193]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, review-only ledger evidence, owner review/reversal state, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/api/affiliates/commission-ledger","https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions","https://bumpgrade.com/api/commerce/checkout","https://bumpgrade.com/commerce/source-data","https://bumpgrade.com/offers/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109","https://github.com/markitics/bumpgrade/issues/111","https://github.com/markitics/bumpgrade/issues/113","https://github.com/markitics/bumpgrade/issues/115","https://github.com/markitics/bumpgrade/issues/193"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, partner report IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, partner report contract, and write boundary.","Read partnerReportSummary to compare aggregate click, attributed checkout, review-only ledger, review action, and commission evidence totals by partner without exposing raw rows.","POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.","Start a sandbox checkout intent through /api/commerce/checkout with the referral click ID and checkout idempotency key.","Create review-only commission evidence through /api/affiliates/commission-ledger with checkout intent ID, exact confirmation, and idempotency key.","As an owner, POST a review, hold, or reversal action to /api/admin/affiliates/commission-ledger/actions with exact confirmation, idempotency, expected updated_at, and reason.","Use /commerce/source-data and /affiliates/source-data to distinguish checkout attribution evidence, review-only ledger evidence, public-safe partner reports, and owner review/reversal actions from payable commissions."]',
  edge_cases_json = '["Public source-data exposes aggregate click, checkout attribution, commission ledger, owner action, and partner report counts only, not raw click, checkout, buyer, actor, reason, tax, payout, or Stripe rows.","Unsupported referral link IDs, codes, destination routes, referral click IDs, checkout intent IDs, commission ledger IDs, action kinds, stale expected updated_at values, and missing idempotency keys return public-safe validation errors.","Cookie assignment, buyer attribution finalization, payable commission writes, payout accounts, tax forms, fraud enforcement, Stripe payouts, private partner portals, and partner notifications require future confirmed-write APIs.","Agents must not call review-only commission evidence or partner report totals payable or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, and public-safe partner reports. Payout, fraud, tax, partner notification, private partner portal access, partner payout account storage, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, duplicate idempotency, stale-state validation, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89, #109, #111, #113, #115, and #193 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, and public-safe partner report contract."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-reads-affiliate-partner-reports',
  'Publisher reads affiliate partner reports',
  'feature-affiliates-referrals',
  'pending',
  '[19,193]',
  'Publisher reviewing partner growth before payouts exist',
  'Compare partner performance evidence across clicks, attributed checkouts, review-only ledgers, owner review actions, and payout-readiness caveats without exposing private buyer or payout data.',
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/193"]',
  '["Fetch /affiliates/source-data.","Find partnerReportContract and partnerReportSummary.","Read each affiliatePartnerReportId, affiliatePartnerId, linked referralLinkIds, aggregate totals, payoutReadiness caveats, and redaction flags.","Open /affiliates/indie-launch-partners and inspect the partner report cards.","Use the report caveat before treating totals as payable, partner-facing statements, or published affiliate terms."]',
  '["Reports return zero aggregate totals when no D1 click, attribution, ledger, or review action rows exist yet.","Reports never expose buyer emails, buyer hashes, Stripe IDs, raw click rows, raw checkout rows, payout accounts, tax forms, raw actor identity, private review reasons, or partner notification state.","Private partner portals, payable commissions, payout batches, fraud decisions, and tax collection require future confirmed-write APIs."]',
  'Agents can read public-safe partner reports from /affiliates/source-data and cite affiliatePartnerReportId values. Partner notifications, private partner portals, payout preparation, tax handling, fraud decisions, and direct agent affiliate writes require future confirmed-write APIs.',
  '["Playwright covers the source-data partner report contract, preview report cards, redaction flags, and agent manifest stable IDs.","Issue #193 records the public-safe partner report slice."]',
  59,
  unixepoch()
)
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
