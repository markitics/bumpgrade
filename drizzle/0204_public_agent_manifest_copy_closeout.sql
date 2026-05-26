UPDATE admin_work_log_entries
SET
  closed_prs_json = json_array(json_object('number', 524, 'url', 'https://github.com/markitics/bumpgrade/pull/524')),
  pr_comment_url = COALESCE(pr_comment_url, 'https://github.com/markitics/bumpgrade/pull/524#issuecomment-4548534768'),
  updated_at = unixepoch()
WHERE id = 'work-log-2026-05-26-importer-private-subscriber-export';

UPDATE admin_work_log_entries
SET
  closed_prs_json = json_array(json_object('number', 517, 'url', 'https://github.com/markitics/bumpgrade/pull/517')),
  validation_json = json_array(
    'Expanded public and agent-readable source-data banned-copy guard',
    'Public launch page internal-language guard',
    'Typecheck',
    'Lint',
    'Runtime secrets',
    'Cloudflare build',
    'Whitespace checks',
    'PR #517 CI passed static checks and browser journeys.'
  ),
  flags_attention = NULL,
  completed_at = unixepoch('2026-05-26T12:57:37Z'),
  relevant_urls_json = json_array(
    'https://github.com/markitics/bumpgrade/issues/468',
    'https://github.com/markitics/bumpgrade/pull/517',
    'https://bumpgrade.com/agent-docs/bumpgrade-agent-surface',
    'https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin',
    'https://bumpgrade.com/mobile-admin/source-data',
    'https://bumpgrade.com/admin/work-log'
  ),
  updated_at = unixepoch()
WHERE id = 'work-log-2026-05-26-public-agent-mobile-copy-followup';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark, github_issues_json,
  closed_prs_json, features_updated_json, roadmap_updated_json, user_journeys_updated_json,
  documentation_updated_json, validation_json, flags_attention, first_prompt_at, completed_at,
  relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-26-agent-manifest-starter-copy-closeout',
  'Removed starter-source implementation labels from the public agent manifest',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Owner asked for public Bumpgrade surfaces to be written for real humans and their agents, not as notes for Mark or future implementation commentary.',
  json_array(json_object('number', 468, 'url', 'https://github.com/markitics/bumpgrade/issues/468')),
  json_array(json_object('number', 525, 'url', 'https://github.com/markitics/bumpgrade/pull/525')),
  json_array('https://bumpgrade.com/agent-docs/source-data', 'https://bumpgrade.com/agent-docs/bumpgrade-agent-surface'),
  json_array(),
  json_array(),
  json_array(),
  json_array(
    'Live public-copy audit found the old upstream starter branch/path label in /agent-docs/source-data.',
    'Removed the public agent-manifest field/value wording that exposed project-starter implementation labels.',
    'Expanded the focused public source-data guard for /agent-docs/source-data.',
    'Typecheck',
    'Lint',
    'Cloudflare build',
    'Focused public copy Playwright guard',
    'Whitespace checks'
  ),
  NULL,
  unixepoch('2026-05-26T20:31:00Z'),
  unixepoch('2026-05-26T20:45:00Z'),
  json_array(
    'https://github.com/markitics/bumpgrade/issues/468',
    'https://github.com/markitics/bumpgrade/pull/525',
    'https://bumpgrade.com/agent-docs/source-data',
    'https://bumpgrade.com/agent-docs/bumpgrade-agent-surface',
    'https://bumpgrade.com/admin/work-log'
  ),
  'https://github.com/markitics/bumpgrade/pull/525',
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  closed_prs_json=excluded.closed_prs_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  pr_comment_url=COALESCE(admin_work_log_entries.pr_comment_url, excluded.pr_comment_url),
  updated_at=unixepoch();
