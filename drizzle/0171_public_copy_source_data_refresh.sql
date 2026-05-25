UPDATE admin_roadmap_items
SET
  mark_attention = 'Owner policy requires explicitly allowlisted and authenticated sender addresses before inbound email can steer Codex; From text alone is not trusted.',
  updated_at = unixepoch()
WHERE id = 'roadmap-codex-email';

UPDATE admin_work_log_entries
SET
  prompt_from_mark = 'Owner requested that the public homepage, features, feature detail pages, pricing, and user-journey proof feel ready before inviting people to try Bumpgrade.',
  updated_at = unixepoch()
WHERE id = 'work-log-2026-05-20-launch-marketing-readiness';

UPDATE admin_work_log_entries
SET
  prompt_from_mark = 'Owner requested a public roadmap inspired by the main feature set and for admin surfaces to stay current.',
  updated_at = unixepoch()
WHERE id = 'work-log-2026-05-18-public-roadmap';

UPDATE admin_user_journeys
SET
  primary_user = 'Agent resuming Bumpgrade work',
  updated_at = unixepoch()
WHERE id = 'journey-read-public-roadmap-source-data';
