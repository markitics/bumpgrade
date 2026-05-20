UPDATE admin_roadmap_items
SET status = 'live',
    public_evidence_json = '["Issue #224 tracks the publisher-site auth boundary.","PR #230 merged and deployed the cross-subdomain customer auth contract.","/account/source-data exposes the Bumpgrade-subdomain session-sharing contract and custom-domain caveat.","Production Better Auth uses the bumpgrade.com cookie domain and https://*.bumpgrade.com trusted origin pattern.","Custom domains cannot receive the bumpgrade.com browser cookie directly, so they use a central Bumpgrade login handoff before returning to tenant-scoped access checks.","Cloudflare Worker version cd663146-20c5-4899-a43f-5faec8c720a5 deployed the account source-data and Better Auth boundary update."]',
    next_milestone = 'Decide and expose the domain-purchase path in issue #225, then align pricing/signup copy in issue #226.',
    updated_at = unixepoch()
WHERE id = 'roadmap-cross-subdomain-customer-auth';

UPDATE admin_user_journeys
SET validation_json = '["Playwright asserts the production Better Auth cookie-domain and trusted-origin contract.","Playwright asserts /account/source-data exposes the Bumpgrade-subdomain and custom-domain auth boundary.","GitHub Actions CI passed for PR #230.","Production smoke verified /account/source-data after Worker version cd663146-20c5-4899-a43f-5faec8c720a5.","Issue #224 records the explicit launch behavior and custom-domain limitation."]',
    updated_at = unixepoch()
WHERE id = 'journey-customer-uses-one-login-across-bumpgrade-subdomains';

UPDATE admin_work_log_entries
SET closed_prs_json = '[{"number":230,"url":"https://github.com/markitics/bumpgrade/pull/230"}]',
    validation_json = '["npm run lint","npm run typecheck","git diff --check","npm run cf:build && npx playwright test tests/smoke.spec.ts -g admin source data exposes durable admin surface records|publisher account source data exposes paid subdomain setup contract|Better Auth production session boundary -> 6 passed","npm run test:browser -> 191 passed, 17 skipped","GitHub Actions CI passed for PR #230","Remote D1 migration 0087_cross_subdomain_customer_auth.sql applied","Cloudflare deploy version cd663146-20c5-4899-a43f-5faec8c720a5","Production smoke: /account/source-data, /roadmap/source-data, /admin/user-journeys/source-data, and /agent-docs/source-data"]',
    relevant_urls_json = '["https://bumpgrade.com/account/source-data","https://bumpgrade.com/admin/user-journeys/source-data","https://github.com/markitics/bumpgrade/pull/230","https://github.com/markitics/bumpgrade/actions/runs/26164091138"]',
    pr_comment_url = 'https://github.com/markitics/bumpgrade/pull/230',
    updated_at = unixepoch()
WHERE id = 'work-log-2026-05-20-cross-subdomain-customer-auth';
