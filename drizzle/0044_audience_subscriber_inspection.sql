UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Subscriber segments, live consent-backed opt-in capture, owner subscriber inspection, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add unsubscribe-safe email delivery and CRM timeline notes without exposing private contact data publicly.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, and the live consent-backed capture boundary before email sends exist.',
  source_evidence_json = '["https://bumpgrade.com/audience/source-data","https://bumpgrade.com/audience/indie-launch-waitlist","https://bumpgrade.com/api/audience/opt-in","https://bumpgrade.com/admin/audience","https://bumpgrade.com/funnels/source-data","https://github.com/markitics/bumpgrade/issues/17","https://github.com/markitics/bumpgrade/issues/85","https://github.com/markitics/bumpgrade/issues/103","https://github.com/markitics/bumpgrade/issues/137"]',
  happy_path_json = '["Fetch /audience/source-data.","Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, and write boundary.","Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.","Confirm the API trims and normalizes email, stores consent evidence, assigns seeded tags, and records draft sequence enrollment without sending email.","Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, and draft sequence enrollment state.","Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins, but it is not a general contact import or CRM database.","Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, or private metadata.","Subscriber imports, direct agent contact writes, email sends, broadcasts, unsubscribe changes, private exports, and CRM notes require future confirmed-write APIs.","Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber inspection counts, and the opt-in write boundary. Owner sessions can inspect private rows in /admin/audience. Direct agent subscriber writes, imports, sends, unsubscribes, broadcasts, private exports, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber inspection redaction, /audience/indie-launch-waitlist, valid opt-in, owner /admin/audience inspection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.","Issues #85, #103, and #137 record the audience automation source-data contract, first live opt-in capture path, and owner subscriber inspection path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
