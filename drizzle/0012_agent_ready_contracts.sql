UPDATE admin_roadmap_items
SET
  status = 'live',
  summary = 'Public agent docs, source evidence, /agent-docs/source-data manifest, server-side read contracts, and future MCP resources are published.',
  public_evidence_json = '["Issue #12 owns the agent-ready docs, manifests, APIs, and MCP roadmap slice.", "/agent-docs/source-data exposes public-safe docs, read contracts, source evidence routes, MCP plan, and write-safety boundaries.", "/agent-docs/bumpgrade-mcp documents MCP resources and planned confirmed-write tools."]',
  next_milestone = 'Implement the first MCP resource server on top of the documented read contracts.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-agent-contracts';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-agent-reads-bumpgrade-manifest',
  'Agent reads Bumpgrade manifest before acting',
  'feature-agent-ready-contracts',
  'live',
  '[12]',
  'Codex, ChatGPT, Claude, or another capable agent',
  'Understand what Bumpgrade can read, cite, and safely propose without scraping private admin UI or inventing state.',
  '["https://bumpgrade.com/agent-docs","https://bumpgrade.com/agent-docs/source-data","https://bumpgrade.com/agent-docs/bumpgrade-agent-surface","https://github.com/markitics/bumpgrade/issues/12"]',
  '["Open /agent-docs or fetch /agent-docs/source-data.","Choose the relevant read contract for feature, roadmap, comparison, commerce, admin, or agent docs.","Cite stable IDs, issue or PR evidence, source URLs, and retrieved dates.","Use MCP roadmap entries only as planned tooling until the MCP server exists.","Require confirmed-write safeguards before any public, billing-impacting, admin, or creator-speech write."]',
  '["Human admin pages require Better Auth owner sessions and should not be scraped as a bypass.","The manifest is public-safe discovery metadata, not permission to write.","Volatile competitor pricing, packaging, and feature availability need current source refreshes.","Live billing remains disabled until a separate rollout proves webhook evidence."]',
  'Agents can read /agent-docs/source-data, /features/source-data, /roadmap/source-data, /compare/source-data, /commerce/source-data, and /admin/source-data; writes need approved scripts now and confirmed APIs later.',
  '["Playwright covers /agent-docs pages and /agent-docs/source-data.","The manifest exposes stable read contract IDs, evidence route IDs, MCP plan IDs, and write-safety rules."]',
  38,
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
