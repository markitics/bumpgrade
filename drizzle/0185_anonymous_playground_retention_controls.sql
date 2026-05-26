UPDATE admin_roadmap_items
SET
  public_evidence_json = json_array(
    'Issue #466 tracks the Free Build pricing model and optional anonymous playground.',
    '/playground lets logged-out visitors save structured offer, audience, product, opt-in, checkout, delivery, follow-up, and migration-starting-point progress in this browser.',
    '/playground/source-data exposes browser recovery, structured builder fields, cookie, claim, cleanup, retention, redaction, and go-live gate contracts.',
    '/api/playground/cleanup is an owner-gated cleanup route for expiring old anonymous recovery without exposing private draft content.',
    '/pricing explains the build-first message in plain public copy.',
    '/pricing/source-data exposes the Free Build design, live anonymous playground state, and paid go-live gates.',
    '/account/setup lets verified signed-in users create a private Free Build workspace before payment.',
    '/account/source-data exposes the signed-in Free Build workspace contract and paid go-live gates.',
    '/content/source-data ties the pricing policy into audience and resource discovery records.'
  ),
  next_milestone = 'Add anonymous playground abuse limits and deeper claim/merge semantics for users with existing workspaces.',
  updated_at = unixepoch()
WHERE id = 'roadmap-free-build-before-go-live';

UPDATE admin_user_journeys
SET
  edge_cases_json = json_array(
    'Recovery depends on the browser cookie remaining available.',
    'The cookie stores a recovery token only; D1 stores its hash, not the raw cookie value.',
    'Anonymous playground rows expire after 30 days unless extended by later saves; owner cleanup marks expired recovery, clears anonymous draft fields, and replaces the recovery token hash.',
    'Playground saves do not create billing state, public domains, buyer routes, subscriber sends, or product access.',
    'Attaching to an account creates or reuses a private Free Build workspace, maps structured playground fields into an idempotent private funnel draft plus private claim records, and keeps paid go-live gates intact.'
  ),
  agent_access = 'Agents can read /playground/source-data for the anonymous playground contract. Saving structured playground state is browser-scoped and redacted; cleanup requires an owner session and exact confirmation; attaching it requires authenticated, email-verified publisher context, creates private draft and claim records, and still does not authorize public or billing-impacting actions.',
  validation_json = json_array(
    'Playwright covers logged-out save, recovery-cookie persistence across refresh, source-data redaction, unauthenticated claim rejection, owner cleanup rejection, verified-account claim, private draft and claim-record creation, idempotent claim replay, and paid go-live gate preservation.',
    '/pricing/source-data and /account/source-data distinguish anonymous playground, signed-in Free Build, and paid go-live actions.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-prospect-saves-anonymous-playground';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json,
  closed_prs_json, features_updated_json, roadmap_updated_json, user_journeys_updated_json,
  documentation_updated_json, validation_json, flags_attention, first_prompt_at, completed_at,
  relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-25-anonymous-playground-retention-controls',
  'Added anonymous playground retention controls',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for logged-out product play that saves progress without losing work, while keeping public copy human-facing and agent contracts honest.',
  json_array(json_object('number', 466, 'url', 'https://github.com/markitics/bumpgrade/issues/466')),
  json_array(),
  json_array('https://bumpgrade.com/playground', 'https://bumpgrade.com/playground/source-data', 'https://bumpgrade.com/account/source-data', 'https://bumpgrade.com/agent-docs/source-data'),
  json_array('roadmap-free-build-before-go-live'),
  json_array('journey-prospect-saves-anonymous-playground'),
  json_array('docs/agent/agent-ready.md', 'docs/features/publisher-tenants.md', 'public/llms.txt'),
  json_array('Focused anonymous playground retention/source-data/admin smoke coverage', 'typecheck', 'lint', 'runtime secrets', 'Cloudflare build'),
  NULL,
  unixepoch() - 1800,
  unixepoch(),
  json_array('https://bumpgrade.com/playground', 'https://bumpgrade.com/playground/source-data', 'https://bumpgrade.com/admin/work-log'),
  NULL,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  updated_at=unixepoch();
