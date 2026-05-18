UPDATE admin_roadmap_items
SET
  status = 'live',
  summary = 'Use-case page, developer/agent page, resource and blog hub, pricing direction, metadata, sitemap entries, and /content/source-data contract.',
  public_evidence_json = '["Issue #20 owns the marketing content surface slice.", "/users, /developers-and-agents, /resources, and /pricing are live navbar destinations.", "/content/source-data exposes stable audience, resource, and pricing-direction records for agents."]',
  next_milestone = 'Promote planned migration guides, launch playbooks, and blog posts into dedicated pages as funnel, checkout, automation, and analytics slices ship.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-marketing-surfaces';

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal, source_evidence_json,
  happy_path_json, edge_cases_json, agent_access, validation_json, sort_order, updated_at
) VALUES (
  'journey-prospect-evaluates-content-surfaces',
  'Prospect evaluates Bumpgrade content surfaces',
  'feature-resources-use-cases-pricing',
  'live',
  '[20]',
  'Creator, coach, publisher, agency, or agent evaluating Bumpgrade',
  'Understand who Bumpgrade is for, what resources exist, and what pricing can safely claim before live billing ships.',
  '["https://bumpgrade.com/users","https://bumpgrade.com/developers-and-agents","https://bumpgrade.com/resources","https://bumpgrade.com/pricing","https://bumpgrade.com/content/source-data","https://github.com/markitics/bumpgrade/issues/20"]',
  '["Open /users to find the relevant audience segment and linked feature IDs.","Open /resources to find live comparison, commerce, and agent contract resources.","Open /pricing to read direction and explicit not-yet-claimed billing caveats.","Fetch /content/source-data to cite stable IDs, issue numbers, evidence routes, and agent boundaries."]',
  '["Pricing tracks are positioning hypotheses, not published plans or live billing availability.","Migration guides and launch playbooks are planned until the related funnel, checkout, automation, and analytics issues ship.","Agents must not treat content copy as permission to perform public, billing-impacting, or creator-speech writes."]',
  'Agents can read /content/source-data for audience, resource, and pricing-direction records. Public copy changes still need source evidence, issue links, or shipped-product proof.',
  '["Playwright covers /users, /resources, /pricing, /content/source-data, sitemap discovery, and agent manifest read-contract discovery.","Issue #20 updates public route metadata and source-data contracts."]',
  44,
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
