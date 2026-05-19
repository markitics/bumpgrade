CREATE TABLE IF NOT EXISTS audience_broadcast_drafts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  subject_intent TEXT NOT NULL,
  preview_text TEXT NOT NULL,
  audience_scope TEXT NOT NULL,
  segment_id TEXT NOT NULL,
  approval_boundary TEXT NOT NULL,
  suppression_policy TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS audience_broadcast_drafts_workspace_status_idx
  ON audience_broadcast_drafts(workspace_id, status);

CREATE INDEX IF NOT EXISTS audience_broadcast_drafts_segment_status_idx
  ON audience_broadcast_drafts(segment_id, status);

INSERT INTO audience_broadcast_drafts (
  id, workspace_id, title, status, subject_intent, preview_text, audience_scope, segment_id,
  approval_boundary, suppression_policy, metadata_json, created_at, updated_at
) VALUES (
  'broadcast-draft-launch-window',
  'audience-automation-workspace-indie-launch',
  'Launch window announcement',
  'readiness_preview',
  'Announce the launch checklist and invite subscribers to inspect the sandbox offer path',
  'A short publisher-safe launch note with source-linked product, offer, and unsubscribe context.',
  'Only subscribers who explicitly opted into the indie launch waitlist, still have consent, and are not suppressed or unsubscribed.',
  'segment-indie-launch-waitlist',
  'Sending stays disabled until an owner confirms the final copy, unsubscribe footer, sender domain, suppression result, and audit correlation.',
  'Exclude unsubscribed subscribers, active suppression hashes, missing-consent rows, and unknown imported contacts before any send queue can exist.',
  '{"seeded":true,"issue":171,"sendQueueRowsCreated":false,"providerMessageIdsCreated":false}',
  unixepoch(),
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  workspace_id=excluded.workspace_id,
  title=excluded.title,
  status=excluded.status,
  subject_intent=excluded.subject_intent,
  preview_text=excluded.preview_text,
  audience_scope=excluded.audience_scope,
  segment_id=excluded.segment_id,
  approval_boundary=excluded.approval_boundary,
  suppression_policy=excluded.suppression_policy,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, broadcast draft readiness, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Issue #167 adds POST /api/audience/unsubscribe with idempotent unsubscribe/suppression evidence and no list-membership leak.", "Issue #169 adds owner-gated private audience CRM timeline notes with aggregate public redaction.", "Issue #171 adds suppression-aware broadcast draft readiness without send queues or provider message IDs.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add owner-confirmed broadcast scheduling and email delivery queues only after sender-domain, unsubscribe footer, suppression, and audit checks are explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, broadcast readiness, and the live consent/unsubscribe/note boundary before email sends exist.',
  source_evidence_json = '["https://bumpgrade.com/audience/source-data", "https://bumpgrade.com/audience/indie-launch-waitlist", "https://bumpgrade.com/api/audience/opt-in", "https://bumpgrade.com/api/audience/unsubscribe", "https://bumpgrade.com/api/admin/audience/notes", "https://bumpgrade.com/admin/audience", "https://bumpgrade.com/funnels/source-data", "https://github.com/markitics/bumpgrade/issues/17", "https://github.com/markitics/bumpgrade/issues/85", "https://github.com/markitics/bumpgrade/issues/103", "https://github.com/markitics/bumpgrade/issues/137", "https://github.com/markitics/bumpgrade/issues/167", "https://github.com/markitics/bumpgrade/issues/169", "https://github.com/markitics/bumpgrade/issues/171"]',
  happy_path_json = '["Fetch /audience/source-data.", "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, broadcast readiness counts, and write boundaries.", "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.", "Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.", "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, private CRM timeline notes, and broadcast readiness.", "Create a short owner CRM note with exact confirmation, idempotency, and the expected subscriber status.", "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins, record unsubscribe/suppression evidence, store private owner notes, and calculate broadcast readiness, but it is not a general contact import, send queue, or full CRM database.", "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, provider message IDs, send queue payloads, reasons, or private metadata.", "The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.", "Subscriber imports, direct agent contact writes, email sends, broadcast scheduling, private exports, and CRM automation require future confirmed-write APIs.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness counts, and the opt-in/unsubscribe/note write boundaries. Owner sessions can inspect private rows, create private notes, and view broadcast readiness in /admin/audience. Direct agent subscriber writes, imports, sends, broadcast scheduling, private exports, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, sender-domain safety, and audit correlation.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, owner CRM note creation, unauthorized note rejection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.", "Issues #85, #103, #137, #167, #169, and #171 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, owner CRM timeline note path, and broadcast readiness path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
