UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Read-only affiliate/referral contract, partner profiles, referral links, commission rules, attribution, payout review, and fraud checks.',
  public_evidence_json = '["Issue #19 owns affiliate and referral management.", "Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold."]',
  next_milestone = 'Build live referral click capture and commission writes after privacy-safe analytics and trusted checkout evidence are connected.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-previews-affiliate-referrals',
  'Publisher previews affiliate and referral management',
  'feature-affiliates-referrals',
  'pending',
  '[19,89]',
  'Publisher or agent planning partner growth',
  'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, payout review states, and fraud flags before live tracking or payouts exist.',
  '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/offers/source-data","https://bumpgrade.com/analytics/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89"]',
  '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, referral link IDs, attribution rule IDs, commission rule IDs, ledger IDs, payout batch ID, review flags, and write boundary.","Open /affiliates/indie-launch-partners to inspect the public preview.","Use /offers/source-data and /analytics/source-data to resolve offer and event dependencies before assuming live affiliate tracking exists."]',
  '["The seeded affiliate program uses fixture commissions and does not track live referral clicks.","Cookie assignment, buyer attribution, payout accounts, tax forms, fraud enforcement, Stripe payouts, and partner notifications require future confirmed-write APIs.","Agents must not call fixture commission amounts payable or published affiliate terms."]',
  'Agents can read /affiliates/source-data and the preview route. Affiliate writes require actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries in a later API.',
  '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, sitemap discovery, and agent manifest read-contract discovery.","Issue #89 records the first affiliate/referral source-data contract and preview scaffold."]',
  52,
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
