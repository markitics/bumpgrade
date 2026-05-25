INSERT INTO admin_roadmap_items (
  id, title, status, issue_number, feature_id, group_name, summary,
  public_evidence_json, next_milestone, mark_attention, sort_order, updated_at
) VALUES (
  'roadmap-competitor-importers',
  'Easy importers from ClickFunnels and competitor platforms',
  'active',
  467,
  'feature-competitor-importers',
  'Migration',
  'Importer center, ClickFunnels import path, and reusable source-data contract for moving competitor platform context into private Bumpgrade launch workspaces before go-live.',
  json_array(
    'Issue #467 tracks easy importers from ClickFunnels and first-wave competitor platforms.',
    '/imports lists supported importer paths.',
    '/imports/clickfunnels is the first dedicated ClickFunnels import path.',
    '/imports/source-data exposes platform IDs, input kinds, generated private record types, safety gates, limitations, and source evidence IDs for agents.'
  ),
  'Implement owner-authenticated import preview and create-private-record flows after this review-first public and agent-readable contract is stable.',
  NULL,
  72,
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  status=excluded.status,
  issue_number=excluded.issue_number,
  feature_id=excluded.feature_id,
  group_name=excluded.group_name,
  summary=excluded.summary,
  public_evidence_json=excluded.public_evidence_json,
  next_milestone=excluded.next_milestone,
  mark_attention=excluded.mark_attention,
  sort_order=excluded.sort_order,
  updated_at=excluded.updated_at;

INSERT INTO admin_user_journeys (
  id, title, feature_id, feature_status, issue_numbers_json, primary_user, user_goal,
  source_evidence_json, happy_path_json, edge_cases_json, agent_access, validation_json,
  sort_order, updated_at
) VALUES (
  'journey-prospect-imports-from-clickfunnels',
  'Prospect plans a ClickFunnels import',
  'feature-competitor-importers',
  'launch-preview',
  '[5,14,15,17,467]',
  'Publisher moving a launch from ClickFunnels or another familiar platform',
  'Understand what Bumpgrade can bring into a private workspace before public publishing, checkout, subscriber sends, domains, or fulfillment go live.',
  '["https://bumpgrade.com/imports","https://bumpgrade.com/imports/clickfunnels","https://bumpgrade.com/imports/source-data","https://bumpgrade.com/compare/source-data","https://github.com/markitics/bumpgrade/issues/467"]',
  '["Open /imports.","Choose the current platform, starting with ClickFunnels.","Review accepted starting material such as public URLs, exported files, CSVs, or pasted copy.","Review mapped pages, offers, products, assets, audience notes, follow-up outlines, unsupported fields, and go-live gates.","Use /imports/source-data when an agent needs stable importer IDs, input kinds, generated private record types, safety gates, limitations, and source IDs."]',
  '["Imported material starts in a private workspace and is not buyer-facing by default.","Account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, and fulfillment require later confirmed-write evidence.","Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims."]',
  'Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, generated private record types, safety gates, source IDs, and limitations. Agent writes are not live for import previews or record creation in this slice.',
  '["Issue #467 adds /imports, /imports/clickfunnels, /imports/source-data, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.","Importer source-data keeps raw exports, customer rows, private emails, payment credentials, API keys, session cookies, and private files out of public contracts."]',
  43,
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
