INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-25-anonymous-playground-claimed-drafts',
  'Turned claimed playgrounds into private launch drafts',
  'Codex',
  'codex',
  'bumpgrade-anonymous-playground-claimed-drafts',
  'Owner asked for users to play with Bumpgrade without paying, keep logged-out progress, and preserve that work when they later sign up.',
  '[{"number":466,"url":"https://github.com/markitics/bumpgrade/issues/466"}]',
  '[]',
  '["https://bumpgrade.com/playground","https://bumpgrade.com/playground/source-data","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/account/source-data","https://bumpgrade.com/pricing/source-data"]',
  '["https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/roadmap/source-data"]',
  '["https://bumpgrade.com/admin/user-journeys/source-data"]',
  '["docs/agent/agent-ready.md","docs/features/publisher-tenants.md","public/llms.txt"]',
  '["npm run typecheck","npm run lint","npm run test:runtime-secrets","npm run db:migrate:local","npm run cf:build","npx playwright test tests/smoke.spec.ts --project=chromium -g anonymous playground source data and API persist browser-scoped draft state|verified publisher can claim anonymous playground into Free Build draft|admin user journeys source data exposes launch proof summary|public launch pages avoid internal build language","npx playwright test tests/smoke.spec.ts --project=chromium -g publisher account source data exposes paid subdomain setup contract","git diff --check"]',
  'Claimed playgrounds now create private launch draft records after verified account context; public publishing, checkout, subscriber sends, domains, fulfillment, and billing mutation remain gated.',
  1779727200,
  1779728100,
  '["https://github.com/markitics/bumpgrade/issues/466","https://bumpgrade.com/playground","https://bumpgrade.com/playground/source-data","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/pr-screenshots/issue-466-playground-claim-draft.jpg"]',
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
  pr_comment_url=excluded.pr_comment_url,
  updated_at=excluded.updated_at;

UPDATE admin_roadmap_items
SET
  status = 'active',
  summary = 'Defines the $0 private-building path, logged-out browser playground recovery, signed-in Free Build workspace creation, private launch draft creation after claim, and paid go-live gates before public, billing, sending, domain, or fulfillment actions.',
  public_evidence_json = json_array(
    'Issue #466 tracks the Free Build pricing model and optional anonymous playground.',
    '/playground lets logged-out visitors save basic launch setup progress in this browser.',
    '/playground/source-data exposes browser recovery, cookie, claim, private draft creation, redaction, and go-live gate contracts.',
    '/api/playground/anonymous-workspace saves the browser-scoped playground without billing or public publishing.',
    '/api/playground/claim attaches the saved playground to a verified signed-in Free Build workspace and private D1 funnel draft.',
    '/funnels/source-data exposes the private draft-funnel records created by the claim path.',
    '/pricing explains the build-first message in plain public copy.',
    '/account/source-data exposes the signed-in Free Build workspace contract and paid go-live gates.'
  ),
  next_milestone = 'Broaden the anonymous playground draft from launch/funnel setup into offer, product, audience, importer review, abuse-limit, cleanup, and merge semantics.',
  mark_attention = NULL,
  updated_at = unixepoch()
WHERE id = 'roadmap-free-build-before-go-live';

UPDATE admin_user_journeys
SET
  source_evidence_json = '["https://bumpgrade.com/playground","https://bumpgrade.com/playground/source-data","https://bumpgrade.com/funnels/source-data","https://bumpgrade.com/pricing/source-data","https://github.com/markitics/bumpgrade/issues/466"]',
  happy_path_json = '["Open /playground while logged out.","Enter an offer name, audience, launch goal, and starting platform.","Save the playground and refresh the page.","Return from the same browser and see the saved draft.","Create or sign into a verified account and attach the playground to a private Free Build workspace.","Bumpgrade creates an idempotent private launch draft from the saved playground context.","Choose a paid go-live plan before public publishing, live checkout, sends, domains, or fulfillment."]',
  edge_cases_json = '["Recovery depends on the browser cookie remaining available.","The cookie stores a recovery token only; D1 stores its hash, not the raw cookie value.","Anonymous playground rows expire after 30 days unless extended by later saves.","Playground saves do not create billing state, public domains, buyer routes, subscriber sends, or product access.","Attaching to an account creates or reuses a private Free Build workspace, creates an idempotent private funnel draft, and keeps paid go-live gates intact.","Claim responses return draft summary metadata only; raw recovery tokens, token hashes, and public source-data private draft content stay redacted."]',
  agent_access = 'Agents can read /playground/source-data for the anonymous playground contract and /funnels/source-data for the private draft-funnel boundary. Saving playground state is browser-scoped and redacted; attaching it requires authenticated, email-verified publisher context, creates private draft records, and still does not authorize public or billing-impacting actions.',
  validation_json = '["Playwright covers logged-out save, recovery-cookie persistence across refresh, source-data redaction, unauthenticated claim rejection, verified-account claim, private draft creation, idempotent claim replay, and paid go-live gate preservation.","/pricing/source-data and /account/source-data distinguish anonymous playground, signed-in Free Build, private draft creation, and paid go-live actions."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-saves-anonymous-playground';

UPDATE admin_user_journeys
SET
  edge_cases_json = '["Logged-out playground recovery is browser-scoped and depends on the recovery cookie still being present.","Signed-in Free Build workspace creation is covered by /account/setup and /account/source-data.","Claimed playground work can become a private launch draft, but buyer-facing publishing, live checkout, email sends, domains, and fulfillment remain gated.","Anonymous playground state can attach to a verified account, but it still does not create public buyer-facing state."]',
  validation_json = '["Pricing route smoke confirms the public copy avoids internal implementation language.","/pricing/source-data exposes Free Build capability records and paid go-live gate records.","/playground and /playground/source-data expose logged-out browser recovery and private draft creation as live.","/account/source-data exposes signed-in Free Build workspace creation as live.","/content/source-data and /agent-docs/source-data include the pricing policy as agent-readable evidence."]',
  updated_at = unixepoch()
WHERE id = 'journey-prospect-understands-free-build';
