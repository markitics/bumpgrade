UPDATE admin_roadmap_items
SET
  status = 'live',
  public_evidence_json = json_array(
    'Tracked by issue #16.',
    'Issue #83 adds the first /products/source-data contract and /products/indie-launch-library preview scaffold.',
    'Issue #101 adds idempotent sandbox entitlement rows and fulfillment task evidence from trusted paid checkout webhook events.',
    'Issue #139 adds /admin/products owner entitlement inspection and aggregate public redaction flags.',
    'Issue #141 adds /products/entitlements and /api/products/entitlements for customer-safe checkout intent entitlement lookup.',
    'Issue #143 adds one-use download tokens for active file entitlements without exposing private R2 keys or signed object URLs.',
    'Issue #146 streams a seeded private R2-backed fixture through Bumpgrade without exposing private object keys.',
    'Issue #147 revalidates current entitlement and trusted checkout state before redemption.',
    'Issue #151 adds owner-confirmed private product asset upload records.',
    'Issue #179 adds owner-visible revocation intent readiness without destructive entitlement mutation.',
    'Issue #181 adds protected content readiness metadata.',
    'Issue #185 adds checkout-intent-scoped protected fixture delivery.',
    'Issue #187 syncs checkout-linked membership access from trusted Stripe Billing subscription state.',
    'Issue #251 adds owner-confirmed non-destructive revocation intent records with exact confirmation, idempotency, stale-state checks, and public redaction.',
    'Issue #403 adds owner-confirmed draft product creation records without Stripe product/price creation or fulfillment mutation.',
    'Issue #405 adds owner-confirmed test offer/funnel links and direct test access grants for owner-created products.',
    'Issue #407 adds owner-confirmed buyer-facing test checkout links and public test checkout completion for owner-created products without Stripe Checkout Sessions, live charges, or public buyer exposure.',
    'Issue #409 links owner-created product test checkout links to the seeded offer/funnel delivery gates with stale-state checks and aggregate public redaction.',
    'Issue #16 exposes seeded pay-in-full, installment, and subscription payment-plan read records without live amounts, Stripe Price creation, Checkout Sessions, or customer data exposure.',
    'PR #412 merged and deployed product payment-plan readiness with production smoke evidence.',
    'Issue #16 is ready to close; live self-serve billing remains tracked separately in issue #219.'
  ),
  next_milestone = 'Keep live product payment-plan checkout, Stripe Price creation, first package/amount selection, webhook-secret confirmation, Customer Portal actions, and live fulfillment tracked separately in issue #219.',
  updated_at = unixepoch()
WHERE id = 'roadmap-products-access';

UPDATE admin_user_journeys
SET
  feature_status = 'live',
  updated_at = unixepoch()
WHERE feature_id = 'feature-products-access';

INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  'work-log-2026-05-24-products-access-live-closeout',
  'Moved Products and access to live',
  'Codex',
  'codex',
  'bumpgrade-build-heartbeat',
  'Mark asked for a clearer Director-level view with less noisy nesting and clearer done versus active categories.',
  '[{"number":16,"url":"https://github.com/markitics/bumpgrade/issues/16"},{"number":219,"url":"https://github.com/markitics/bumpgrade/issues/219"}]',
  '[{"number":412,"url":"https://github.com/markitics/bumpgrade/pull/412"}]',
  '["feature-products-access"]',
  '["roadmap-products-access active -> live"]',
  '["journey-publisher-previews-product-access launch-preview -> live","journey-publisher-verifies-sandbox-entitlement-grant launch-preview -> live"]',
  '[]',
  '["git diff --check","npm run db:migrate:local","npm run test:runtime-secrets","npm run lint","npm run typecheck","npm run cf:build","npx playwright test tests/smoke.spec.ts -g \"feature source data exposes stable feature records|roadmap source data exposes stable roadmap records|admin source data exposes durable admin surface records|admin user journeys source data exposes launch proof summary\" --project=chromium","Issue #16 acceptance audit against /products/source-data, /admin/roadmap/source-data, /admin/user-journeys/source-data, and PR #412 production smoke evidence."]',
  'Live payment-plan checkout, Stripe Price creation, first package/amount selection, webhook-secret confirmation, Customer Portal actions, and live fulfillment remain parked on issue #219.',
  1779598870,
  1779599400,
  '["https://github.com/markitics/bumpgrade/issues/16","https://github.com/markitics/bumpgrade/issues/219","https://github.com/markitics/bumpgrade/pull/412","https://bumpgrade.com/features","https://bumpgrade.com/admin/roadmap","https://bumpgrade.com/admin/user-journeys","https://bumpgrade.com/products/source-data"]',
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
