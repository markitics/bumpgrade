UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Subscriber segments, read-only opt-in and automation contract, lead magnets, tags, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Issue #17 owns email marketing, list growth, CRM-lite, and automations.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Build confirmed subscriber/consent writes and unsubscribe-safe email delivery without exposing private contact data.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-publisher-previews-audience-automation',
  'Publisher previews audience opt-in automation',
  'feature-email-automation-crm',
  'pending',
  '[17,85]',
  'Publisher or agent planning list growth',
  'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, and automation rules before subscriber writes or email sends exist.',
  '["https://bumpgrade.com/audience/source-data","https://bumpgrade.com/audience/indie-launch-waitlist","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/17","https://github.com/markitics/bumpgrade/issues/85"]',
  '["Fetch /audience/source-data.","Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, and write boundary.","Open /audience/indie-launch-waitlist to inspect the public preview.","Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming live automation exists."]',
  '["The seeded audience automation workspace is read-only and not a subscriber database.","Subscriber imports, contact writes, email sends, broadcasts, unsubscribe changes, and CRM notes require future confirmed-write APIs.","Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  'Agents can read /audience/source-data and the preview route. Audience automation writes require actor identity, explicit consent or lawful basis, idempotency, stale-state checks, audit correlation, redaction, suppression-list checks, and sender-domain safety in a later API.',
  '["Playwright covers /audience/source-data, /audience/indie-launch-waitlist, sitemap discovery, and agent manifest read-contract discovery.","Issue #85 records the first audience automation source-data contract and preview scaffold."]',
  50,
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
