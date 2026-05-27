CREATE TABLE IF NOT EXISTS funnel_resource_delivery_receipts (
  id TEXT PRIMARY KEY,
  product_download_token_id TEXT NOT NULL,
  delivery_source TEXT NOT NULL,
  funnel_id TEXT NOT NULL,
  funnel_slug TEXT NOT NULL,
  funnel_title TEXT NOT NULL,
  funnel_revision_id TEXT NOT NULL,
  block_id TEXT NOT NULL,
  block_title TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  asset_title TEXT NOT NULL,
  checkout_intent_sha256 TEXT NOT NULL,
  entitlement_sha256 TEXT NOT NULL,
  receipt_status TEXT NOT NULL DEFAULT 'downloaded',
  redaction_json TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS funnel_resource_delivery_receipts_token_idx
  ON funnel_resource_delivery_receipts(product_download_token_id);

CREATE INDEX IF NOT EXISTS funnel_resource_delivery_receipts_funnel_idx
  ON funnel_resource_delivery_receipts(funnel_slug, created_at);

CREATE INDEX IF NOT EXISTS funnel_resource_delivery_receipts_block_idx
  ON funnel_resource_delivery_receipts(funnel_slug, block_id, created_at);

UPDATE admin_roadmap_items
SET
  summary = 'Active post-MVP funnel parity for visual funnel editing, resource delivery, webinar integrations, unauthenticated public agent writes, and stronger resource fulfillment; owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private download-token delivery, owner-session agent-created resource delivery tokens, redacted resource-delivery receipt evidence after successful private download redemption, webinar event/replay links, visual block style controls, bounded canvas layout controls, archived-draft purge, bulk archived-draft purge, within-step block reordering, drag/drop block placement through existing move endpoints, cross-step block moves, and owner-session direct agent-safe draft writes are now part of this bucket''s shipped evidence.',
  public_evidence_json = json_array(
    'Issue #417 tracks this active post-MVP funnel parity bucket.',
    'Issue #417 adds funnel-scoped private download-token delivery from published linked resource blocks after checkout intent, entitlement, product, and file asset scope match.',
    'Issue #417 adds owner-session agent-created resource delivery tokens through /api/agent/funnels/resource-delivery-tokens after exact confirmation, idempotency, current published revision checks, entitlement checks, and audit correlation.',
    'Issue #417 records redacted funnel resource-delivery receipts when the existing private download route successfully redeems a funnel-scoped token; receipt source-data exposes safe funnel, block, product, asset, and aggregate source counts without raw buyer, checkout, entitlement, token, R2, or signed URL data.',
    'Issue #417 adds owner-session direct agent-safe draft writes through /api/agent/funnels/draft-writes for block copy edits, visual style presets, bounded canvas layouts, reusable block add/remove, checkout linking/unlinking, resource-delivery linking, webinar-event linking, block movement, private duplication, public publishing, archive/unpublish, archived-draft purge, and bulk archived-draft purge after exact confirmation, idempotency, current revision checks, and audit correlation.',
    'Issue #219 tracks live publisher-offer billing separately from advanced funnel editing and resource delivery.'
  ),
  next_milestone = 'Keep arbitrary uploaded private asset delivery, signed URLs, live fulfillment task automation, full webinar provider integrations, unauthenticated public agent-created delivery tokens, unauthenticated public agent publishing, non-archived purge, and live billing mutation parked until stronger rollback, provider, and payment safety can be designed together.',
  updated_at = unixepoch()
WHERE id = 'roadmap-advanced-funnel-builder-parity';

UPDATE admin_user_journeys
SET
  user_goal = 'Create, edit, publish, archive, restore, duplicate, reorder, move, style, lay out, and safely purge draft funnels while preserving audit evidence, checkout/resource/webinar metadata, private preview boundaries, public published routes, public-safe checkout start rendering, entitlement-scoped resource delivery, owner-session agent write contracts, and redacted resource-delivery receipt evidence.',
  happy_path_json = json_array(
    'Open /admin/funnels as a verified owner.',
    'Seed or create a private draft funnel.',
    'Edit steps and block copy, add reusable blocks, apply visual style presets, set bounded canvas layout, reorder blocks, and move blocks across steps.',
    'Attach checkout offer metadata to checkout blocks, resource delivery metadata to resource/delivery blocks, and webinar registration/replay URLs to webinar blocks.',
    'Publish the draft to a public D1 funnel route after exact confirmation and current revision checks.',
    'Use a checkout-linked entitlement to request a funnel-scoped private resource delivery token from the published resource block.',
    'Redeem the Bumpgrade download route; the successful redemption records redacted funnel resource-delivery receipt evidence without exposing buyer data, raw checkout or entitlement IDs, raw tokens, R2 keys, signed URLs, or raw rows.',
    'Read /funnels/source-data to inspect published funnel summaries, resource-delivery receipt counts, latest safe receipt metadata, owner-session agent token contract, direct agent draft-write contract, and remaining not-live boundaries.',
    'Archive, unpublish, purge already archived drafts, or bulk purge selected archived drafts only after exact confirmation and tombstone evidence.'
  ),
  edge_cases_json = json_array(
    'Resource delivery requires a published funnel, a resource-linked block, a trusted checkout intent, and an active matching entitlement before any token is created.',
    'Receipt evidence is recorded only after the existing Bumpgrade download route successfully revalidates checkout, entitlement, product, and asset state and consumes the token.',
    'Receipt source-data exposes safe funnel/block/product/asset/source metadata and aggregate counts only; it excludes raw buyer identity, raw checkout intent IDs, raw entitlement IDs, raw bearer tokens, R2 object keys, signed URLs, and raw rows.',
    'Token replay after successful redemption returns already-used behavior and does not create a second receipt because receipts are unique by product download token.',
    'Arbitrary uploaded private asset delivery, signed object URLs, live fulfillment tasks, provider-hosted media, unauthenticated public agent-created delivery tokens, unauthenticated public agent publishing, live billing mutation, and non-archived purge remain disabled.'
  ),
  agent_access = 'Agents can read /funnels/source-data to inspect published funnel summaries, public and owner-session resource delivery token boundaries, redacted resource-delivery receipt counts, latest safe receipt metadata, direct owner-session draft-write capabilities, and remaining not-live boundaries. Owner-session agents can request funnel-scoped delivery tokens only through the confirmed owner-session route. Public agents cannot create unauthenticated delivery tokens, signed URLs, arbitrary asset delivery, fulfillment tasks, billing mutations, or public route writes.',
  validation_json = json_array(
    'Playwright covers funnel resource delivery token creation, owner-session agent token creation, download-token redemption, redacted resource-delivery receipt creation, source-data receipt summary, replay behavior, unauthenticated agent rejection, stale revision rejection, mismatched entitlement rejection, and public page rendering.',
    'Issue #417 records the shipped resource delivery receipt evidence without claiming arbitrary private asset delivery, signed URLs, live fulfillment automation, live billing, or unauthenticated public agent writes.'
  ),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-previews-seeded-funnel';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-27-funnel-resource-delivery-receipts',
  'Added funnel resource-delivery receipt evidence',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Continue the Bumpgrade build with Director-level owner-visible funnel/resource fulfillment progress while keeping noisy narrow ships quiet.',
  json_array(json_object('number', 417, 'url', 'https://github.com/markitics/bumpgrade/issues/417')),
  json_array(),
  json_array('feature-sales-funnels'),
  json_array('roadmap-advanced-funnel-builder-parity'),
  json_array('journey-publisher-previews-seeded-funnel'),
  json_array('docs/agent/agent-ready.md', 'public/llms.txt'),
  json_array(
    'Successful funnel-scoped private download redemption now records redacted receipt evidence keyed to safe funnel, block, product, asset, and source metadata.',
    '/funnels/source-data exposes aggregate receipt counts, latest safe receipt summaries, and explicit redaction flags without raw buyer, checkout, entitlement, token, R2, or signed URL data.',
    'The existing public and owner-session agent resource delivery token paths remain constrained by checkout/entitlement/product/asset revalidation.'
  ),
  'No Mark action required. This records fulfillment/access proof only; arbitrary uploaded asset delivery, signed URLs, live billing, live fulfillment automation, and unauthenticated public agent writes remain parked in issue #417.',
  unixepoch() - 1800,
  unixepoch(),
  json_array('https://bumpgrade.com/funnels/source-data', 'https://bumpgrade.com/admin/funnels', 'https://bumpgrade.com/admin/roadmap/source-data', 'https://bumpgrade.com/admin/user-journeys/source-data', 'https://bumpgrade.com/admin/work-log/source-data', 'https://github.com/markitics/bumpgrade/issues/417'),
  NULL,
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
