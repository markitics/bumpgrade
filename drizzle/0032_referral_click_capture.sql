CREATE TABLE IF NOT EXISTS affiliate_referral_clicks (
  id TEXT PRIMARY KEY,
  referral_link_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  destination_route TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  utm_source TEXT,
  visitor_key_hash TEXT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  referrer_hash TEXT,
  request_hash TEXT NOT NULL,
  metadata_json TEXT,
  clicked_at INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_referral_clicks_idempotency_unique
  ON affiliate_referral_clicks(idempotency_key);
CREATE INDEX IF NOT EXISTS affiliate_referral_clicks_link_time_idx
  ON affiliate_referral_clicks(referral_link_id, clicked_at);
CREATE INDEX IF NOT EXISTS affiliate_referral_clicks_partner_time_idx
  ON affiliate_referral_clicks(partner_id, clicked_at);
CREATE INDEX IF NOT EXISTS affiliate_referral_clicks_destination_time_idx
  ON affiliate_referral_clicks(destination_route, clicked_at);

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Affiliate programs, referral links, privacy-safe click capture, attribution windows, commission rules, payout review states, fraud flags, and agent-readable reports.',
  public_evidence_json = '["Issue #19 owns affiliate and referral management.", "Issue #89 adds the first /affiliates/source-data contract and /affiliates/indie-launch-partners preview scaffold.", "Issue #109 adds POST /api/affiliates/clicks with seeded referral link validation, idempotency, hashed request evidence, and aggregate-only click reporting."]',
  next_milestone = 'Connect privacy-safe click evidence to sandbox checkout intent attribution without creating payable commissions or exposing buyer identifiers.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-affiliates-referrals';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[19,89,109]',
  user_goal = 'Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, payout review states, fraud flags, and aggregate click counts before buyer attribution or payouts exist.',
  source_evidence_json = '["https://bumpgrade.com/affiliates/source-data","https://bumpgrade.com/affiliates/indie-launch-partners","https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/offers/source-data","https://bumpgrade.com/analytics/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109"]',
  happy_path_json = '["Fetch /affiliates/source-data.","Find the seeded affiliate program, revision ID, partner IDs, referral link IDs, attribution rule IDs, commission rule IDs, ledger IDs, payout batch ID, review flags, click capture API, and write boundary.","POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.","Confirm duplicate idempotency returns the same public-safe click without duplicating rows.","Open /affiliates/indie-launch-partners to inspect the public preview.","Use /offers/source-data and /analytics/source-data to resolve offer and event dependencies before assuming buyer attribution exists."]',
  edge_cases_json = '["Public source-data exposes aggregate click counts only, not raw click rows.","Unsupported referral link IDs, codes, destination routes, and missing idempotency keys return public-safe validation errors.","Cookie assignment, buyer attribution, payout accounts, tax forms, fraud enforcement, Stripe payouts, and partner notifications require future confirmed-write APIs.","Agents must not call fixture commission amounts payable or published affiliate terms."]',
  agent_access = 'Agents can read /affiliates/source-data, the preview route, and click capture boundaries. Affiliate attribution, commission, payout, fraud, tax, partner notification, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.',
  validation_json = '["Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, duplicate idempotency, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.","Issues #89 and #109 record the affiliate/referral source-data scaffold and first privacy-safe click capture path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-affiliate-referrals';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-agent-records-privacy-safe-referral-click',
  'Agent records a privacy-safe referral click',
  'feature-affiliates-referrals',
  'pending',
  '[19,89,109]',
  'Agent or system integration validating referral tracking',
  'Record a seeded referral click with idempotency and verify Bumpgrade stores only public-safe response fields plus hashed request evidence.',
  '["https://bumpgrade.com/api/affiliates/clicks","https://bumpgrade.com/affiliates/source-data","https://github.com/markitics/bumpgrade/issues/19","https://github.com/markitics/bumpgrade/issues/89","https://github.com/markitics/bumpgrade/issues/109"]',
  '["Choose a seeded referral link from /affiliates/source-data.","POST the referral link ID or code, destination route, and idempotency key to /api/affiliates/clicks.","Replay the same idempotency key and receive the same public-safe click ID.","Read aggregate click counts from /affiliates/source-data without exposing raw click rows."]',
  '["Missing idempotency is rejected.","Unsupported referral links, codes, and destination routes are rejected.","Private request fields are hashed or omitted.","The API does not set cookies, attribute buyers, create commissions, mutate payout state, or enforce fraud decisions."]',
  'Agents can inspect the click capture contract and propose referral click tests, but buyer attribution, commission writes, payout mutations, fraud decisions, and direct agent affiliate writes require future authenticated confirmed-write APIs.',
  '["Playwright covers valid click ingestion, duplicate idempotency, validation failures, and aggregate-only source-data.","Issue #109 records the first live referral click capture path."]',
  55,
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
