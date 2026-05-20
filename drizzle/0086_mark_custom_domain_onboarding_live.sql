UPDATE admin_roadmap_items
SET status = 'live',
    public_evidence_json = '["Issue #223 tracks custom-domain onboarding with DNS guidance and verification state.","PR #228 merged and deployed existing-domain DNS onboarding.","/account/setup is the signed-in publisher setup surface for custom domains.","/account/source-data exposes the public-safe custom-domain DNS contract.","POST /api/account/publisher/custom-domain starts onboarding and re-checks DNS for paid, email-confirmed publishers with a default Bumpgrade hostname.","Cloudflare Worker version 11dc5b0a-468a-44dd-9e8a-3e5769795076 deployed the route, screenshot asset, and wildcard route binding."]',
    next_milestone = 'Add custom-domain auth semantics in issue #224, then domain purchase decisions in issue #225.',
    updated_at = unixepoch()
WHERE id = 'roadmap-custom-domain-onboarding';

UPDATE admin_work_log_entries
SET closed_prs_json = '[{"number":228,"url":"https://github.com/markitics/bumpgrade/pull/228"}]',
    validation_json = '["npm run lint","npm run typecheck","git diff --check","npm run test:browser -> 189 passed, 17 skipped","GitHub Actions CI passed for PR #228","Remote D1 migration 0085_publisher_custom_domains.sql applied","Cloudflare deploy version 11dc5b0a-468a-44dd-9e8a-3e5769795076","Production smoke: /account/source-data, /account/setup, /roadmap/source-data, /admin/user-journeys/source-data, and /pr-screenshots/issue-223-custom-domain-setup.png"]',
    relevant_urls_json = '["https://bumpgrade.com/account/setup","https://bumpgrade.com/account/source-data","https://bumpgrade.com/pr-screenshots/issue-223-custom-domain-setup.png","https://github.com/markitics/bumpgrade/pull/228"]',
    pr_comment_url = 'https://github.com/markitics/bumpgrade/pull/228',
    updated_at = unixepoch()
WHERE id = 'work-log-2026-05-20-custom-domain-dns-onboarding';
