CREATE TABLE IF NOT EXISTS audience_broadcast_preview_safety (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preview_safety_ready',
  subject_line TEXT NOT NULL,
  preview_text TEXT NOT NULL,
  body_outline_json TEXT NOT NULL,
  unsubscribe_footer_policy TEXT NOT NULL,
  sender_domain_status TEXT NOT NULL,
  safety_notes_json TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS audience_broadcast_preview_safety_draft_status_idx
  ON audience_broadcast_preview_safety(draft_id, status);

CREATE INDEX IF NOT EXISTS audience_broadcast_preview_safety_status_updated_idx
  ON audience_broadcast_preview_safety(status, updated_at);

INSERT INTO audience_broadcast_preview_safety (
  id, draft_id, status, subject_line, preview_text, body_outline_json,
  unsubscribe_footer_policy, sender_domain_status, safety_notes_json, metadata_json, created_at, updated_at
) VALUES (
  'broadcast-preview-safety-launch-window',
  'broadcast-draft-launch-window',
  'preview_safety_ready',
  'Your Bumpgrade launch window is ready to preview',
  'A safe preview of the launch-window broadcast before any send queue exists.',
  '["Open with the launch checklist promise and reminder of consent.", "Explain how the funnel, offer, and product access records now connect.", "Invite the subscriber to review the sandbox offer path without implying live fulfillment.", "Close with a required unsubscribe footer placeholder before any delivery queue can exist."]',
  'Required before delivery: every broadcast must include an unsubscribe footer tied to the suppression API and must re-check suppression state immediately before queueing.',
  'sender_domain_pending',
  '["Sender-domain alignment is still pending for real customer email.", "No recipient payloads, send queue rows, or provider message IDs exist in this preview slice.", "Body copy is a reusable outline, not personalized subscriber content.", "Agents may inspect this safety record but cannot send or queue broadcasts from public source-data."]',
  '{"issue":175,"privateContactDataIncluded":false,"personalizedBodyIncluded":false,"sendQueueRowsCreated":false,"providerMessageIdsIncluded":false}',
  unixepoch(),
  unixepoch()
) ON CONFLICT(id) DO UPDATE SET
  status=excluded.status,
  subject_line=excluded.subject_line,
  preview_text=excluded.preview_text,
  body_outline_json=excluded.body_outline_json,
  unsubscribe_footer_policy=excluded.unsubscribe_footer_policy,
  sender_domain_status=excluded.sender_domain_status,
  safety_notes_json=excluded.safety_notes_json,
  metadata_json=excluded.metadata_json,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  summary = 'Subscriber segments, live consent-backed opt-in capture, unsubscribe/suppression evidence, owner CRM timeline notes, broadcast draft readiness, dry-run broadcast schedule intents, preview/footer safety records, lead magnets, tags, draft sequence enrollment evidence, broadcasts, sequences, consent, and CRM-lite state.',
  public_evidence_json = '["Tracked by issue #17.", "Issue #85 adds the first /audience/source-data contract and /audience/indie-launch-waitlist preview scaffold.", "Issue #103 adds POST /api/audience/opt-in with normalized subscriber, consent, tag, and draft sequence enrollment rows.", "Issue #137 adds /admin/audience owner subscriber inspection and aggregate public redaction flags.", "Issue #167 adds POST /api/audience/unsubscribe with idempotent unsubscribe/suppression evidence and no list-membership leak.", "Issue #169 adds owner-gated private audience CRM timeline notes with aggregate public redaction.", "Issue #171 adds suppression-aware broadcast draft readiness without send queues or provider message IDs.", "Issue #173 adds owner-confirmed dry-run broadcast schedule intents without recipient payloads or email sends.", "Issue #175 adds broadcast preview and unsubscribe-footer safety records without send queues.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  next_milestone = 'Add real email delivery queues only after sender-domain, unsubscribe footer, suppression, audit, and provider-send boundaries stay explicit.',
  updated_at = unixepoch()
WHERE id = 'roadmap-email-automation';

UPDATE admin_user_journeys
SET
  issue_numbers_json = '[17,85,103,137,167,169,171,173,175]',
  user_goal = 'Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, broadcast readiness, dry-run schedule intents, preview/footer safety, and the live consent/unsubscribe/note boundary before email sends exist.',
  happy_path_json = '["Fetch /audience/source-data.", "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, broadcast readiness counts, dry-run schedule intent counts, preview/footer safety records, and write boundaries.", "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.", "Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.", "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, private CRM timeline notes, broadcast readiness, schedule intents, and preview safety.", "Create a short owner CRM note with exact confirmation, idempotency, and the expected subscriber status.", "Record a dry-run broadcast schedule intent with exact confirmation, idempotency, expected readiness count, and current draft timestamp.", "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists."]',
  edge_cases_json = '["The seeded audience automation workspace can capture explicit-consent opt-ins, record unsubscribe/suppression evidence, store private owner notes, calculate broadcast readiness, record dry-run schedule intents, and expose preview safety metadata, but it is not a general contact import, provider send queue, or full CRM database.", "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, provider message IDs, send queue payloads, personalized bodies, reasons, or private metadata.", "The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.", "Subscriber imports, direct agent contact writes, real email sends, broadcast dispatch, private exports, and CRM automation require future confirmed-write APIs.", "Codex project email in issue #10 is separate from publisher/customer email workflows."]',
  agent_access = 'Agents can read /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety counts, and the opt-in/unsubscribe/note/schedule-intent write boundaries. Owner sessions can inspect private rows, create private notes, view broadcast readiness, inspect preview/footer safety, and record dry-run schedule intents in /admin/audience. Direct agent subscriber writes, imports, sends, broadcast dispatch, private exports, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, sender-domain safety, and audit correlation.',
  validation_json = '["Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, owner CRM note creation, owner dry-run broadcast schedule intent creation, unauthorized schedule-intent rejection, stale readiness rejection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.", "Issues #85, #103, #137, #167, #169, #171, #173, and #175 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, owner CRM timeline note path, broadcast readiness path, dry-run broadcast schedule intent path, and preview/footer safety path."]',
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-audience-automation';
