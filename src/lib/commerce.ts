export type CommerceObjectStatus = "live" | "planned";

export type StripeMode = "sandbox" | "live";

export type CommerceTableContract = {
  table: string;
  status: CommerceObjectStatus;
  publicSafeFields: string[];
  serverPrivateFields: string[];
  purpose: string;
};

export type CommerceDecision = {
  id: string;
  title: string;
  status: "accepted";
  summary: string;
  evidence: string[];
};

export const stripeCommerceUpdatedAt = "2026-05-18";

export const stripeNodeVersion = "22.1.1";

export const stripeApiVersion = "2026-04-22.dahlia";

export const stripeCommerceContract = {
  id: "stripe-commerce-architecture-v1",
  issue: 11,
  firstCheckoutIssue: 34,
  status: "live" as const,
  activeMode: "sandbox" as StripeMode,
  summary:
    "Bumpgrade has a Stripe architecture, secret mapping, D1 commerce schema, billing-safe agent contract, sandbox Checkout Session path, and constrained order-bump checkout start. Live payment rollout remains deliberately disabled.",
  notLiveYet: [
    "No live-mode checkout path is enabled.",
    "No customer-facing checkout button is published outside the sandbox smoke path yet.",
    "No publisher payout or connected-account onboarding flow exists yet.",
  ],
  sandboxCheckout: {
    issue: 34,
    orderBumpIssue: 99,
    checkoutEndpoint: "/api/commerce/checkout",
    webhookEndpoint: "/api/stripe/webhook",
    createsStripeCheckoutSession: true,
    supportsConstrainedOrderBump: true,
    liveModeEnabled: false,
  },
  secretNames: [
    {
      name: "STRIPE_SECRET_KEY_SANDBOX",
      storage: "Cloudflare Worker secret and ignored local .env.local",
      visibility: "server-only",
    },
    {
      name: "STRIPE_SECRET_KEY_LIVE",
      storage: "Cloudflare Worker secret and ignored local .env.local",
      visibility: "server-only",
    },
    {
      name: "STRIPE_PUBLIC_KEY_SANDBOX",
      storage: "Cloudflare Worker secret and ignored local .env.local",
      visibility: "safe to expose only through an intentional public config route",
    },
    {
      name: "STRIPE_PUBLIC_KEY_LIVE",
      storage: "Cloudflare Worker secret and ignored local .env.local",
      visibility: "safe to expose only through an intentional public config route",
    },
    {
      name: "STRIPE_WEBHOOK_SECRET_SANDBOX",
      storage: "Cloudflare Worker secret when the webhook endpoint ships",
      visibility: "server-only",
    },
    {
      name: "STRIPE_WEBHOOK_SECRET_LIVE",
      storage: "Cloudflare Worker secret when live billing is enabled",
      visibility: "server-only",
    },
  ],
  sourceReferences: [
    {
      id: "stripe-docs-checkout-sessions",
      title: "Stripe Checkout Sessions API",
      url: "https://docs.stripe.com/api/checkout/sessions",
      retrievedAt: stripeCommerceUpdatedAt,
      confidence: "high",
    },
    {
      id: "stripe-docs-subscription-design",
      title: "Stripe subscription integration design",
      url: "https://docs.stripe.com/billing/subscriptions/design-an-integration",
      retrievedAt: stripeCommerceUpdatedAt,
      confidence: "high",
    },
    {
      id: "stripe-docs-accounts-v2",
      title: "Stripe Connect Accounts v2",
      url: "https://docs.stripe.com/connect/accounts-v2",
      retrievedAt: stripeCommerceUpdatedAt,
      confidence: "high",
    },
    {
      id: "stripe-node-changelog-22-1-0",
      title: "stripe-node 22.1.0 changelog",
      url: "https://github.com/stripe/stripe-node/blob/master/CHANGELOG.md",
      retrievedAt: stripeCommerceUpdatedAt,
      confidence: "medium",
    },
  ],
};

export const commerceDecisions: CommerceDecision[] = [
  {
    id: "commerce-decision-checkout-sessions-first",
    title: "Use Checkout Sessions first",
    status: "accepted",
    summary:
      "Bumpgrade will create Checkout Sessions server-side for on-session purchases, subscriptions, order bumps, and future upsell paths before considering lower-level PaymentIntent flows.",
    evidence: [
      "Stripe Checkout Sessions represent a customer payment session for one-time purchases or subscriptions.",
      "Checkout redirects keep payment collection off Bumpgrade's infrastructure for the first checkout path.",
    ],
  },
  {
    id: "commerce-decision-billing-for-subscriptions",
    title: "Use Stripe Billing for recurring plans",
    status: "accepted",
    summary:
      "Subscriptions, trials, upgrades, downgrades, cancellations, and payment-method updates should use Stripe Billing plus Checkout and Customer Portal patterns rather than hand-rolled renewal loops.",
    evidence: [
      "Stripe's subscription design guide starts with pricing model, checkout interface, and billing model choices.",
      "Issue #16 product access and issue #15 checkout offers depend on subscription state staying provider-backed.",
    ],
  },
  {
    id: "commerce-decision-connect-v2-later",
    title: "Use Connect Accounts v2 for future publisher payouts",
    status: "accepted",
    summary:
      "Publisher payout or marketplace flows will use Accounts v2 with explicit configuration, capabilities, dashboard access, and responsibility choices. No connected-account onboarding is live in this slice.",
    evidence: [
      "Stripe documents Accounts v2 as the unified identity model for connected accounts.",
      "Bumpgrade needs creator payout responsibility decisions before enabling platform fund flows.",
    ],
  },
  {
    id: "commerce-decision-idempotent-webhooks",
    title: "Webhook events are idempotent and auditable",
    status: "accepted",
    summary:
      "Every Stripe event must be keyed by its event id, store a payload hash, record processing status, and write redacted billing audit entries for state changes.",
    evidence: [
      "Billing-impacting writes are explicitly covered by Bumpgrade's agent-ready confirmed-write rules.",
      "The D1 schema includes stripe_webhook_events and payment_audit_events before checkout code ships.",
    ],
  },
  {
    id: "commerce-decision-no-public-provider-ids",
    title: "Public routes redact provider identifiers",
    status: "accepted",
    summary:
      "Public and agent-readable commerce routes expose stable Bumpgrade IDs, statuses, and source evidence. Raw Stripe customer, session, payment, subscription, and account IDs stay server-private.",
    evidence: [
      "AGENTS.md requires raw provider identifiers and private user data to stay out of prompt-visible surfaces.",
      "The commerce source-data route only returns schema and safety contract metadata.",
    ],
  },
];

export const commerceTables: CommerceTableContract[] = [
  {
    table: "commerce_products",
    status: "live",
    publicSafeFields: ["id", "slug", "name", "kind", "status", "description", "fulfillment_kind"],
    serverPrivateFields: ["owner_user_id", "metadata_json"],
    purpose: "Canonical Bumpgrade product records for products, memberships, services, downloads, and future offers.",
  },
  {
    table: "commerce_prices",
    status: "live",
    publicSafeFields: ["id", "product_id", "nickname", "currency", "unit_amount_cents", "billing_interval", "active"],
    serverPrivateFields: ["stripe_price_id", "metadata_json"],
    purpose: "Stable price records mapped to Stripe Prices for one-time and subscription checkout.",
  },
  {
    table: "checkout_intents",
    status: "live",
    publicSafeFields: ["id", "checkout_kind", "status", "product_id", "price_id", "amount_cents", "currency", "stripe_mode"],
    serverPrivateFields: [
      "idempotency_key",
      "owner_user_id",
      "buyer_user_id",
      "buyer_email",
      "stripe_checkout_session_id",
      "stripe_payment_intent_id",
      "stripe_subscription_id",
      "success_url",
      "cancel_url",
      "audit_correlation_id",
      "agent_client_id",
      "metadata_json",
    ],
    purpose: "Idempotent checkout-start record created before Stripe is called.",
  },
  {
    table: "stripe_webhook_events",
    status: "live",
    publicSafeFields: ["event_type", "api_version", "livemode", "status", "processed_at"],
    serverPrivateFields: ["id", "payload_redacted_json", "error"],
    purpose: "Webhook idempotency and redacted event evidence keyed by Stripe event id.",
  },
  {
    table: "billing_subscriptions",
    status: "live",
    publicSafeFields: ["id", "product_id", "price_id", "status", "current_period_start", "current_period_end", "cancel_at_period_end"],
    serverPrivateFields: [
      "owner_user_id",
      "buyer_user_id",
      "buyer_email",
      "stripe_customer_id",
      "stripe_subscription_id",
      "stripe_price_id",
      "metadata_json",
    ],
    purpose: "Subscription access state derived from Stripe Billing events.",
  },
  {
    table: "payment_audit_events",
    status: "live",
    publicSafeFields: ["id", "checkout_intent_id", "event_kind", "actor_kind", "summary", "created_at"],
    serverPrivateFields: ["stripe_event_id", "actor_id", "metadata_json"],
    purpose: "Redacted audit trail for billing-impacting checkout, webhook, and agent actions.",
  },
];

export const commerceAgentWriteRules = [
  "Agents may read public-safe commerce source-data without a private session.",
  "Agents must not create, expire, refund, cancel, upgrade, downgrade, or publish a billing object without explicit confirmation text.",
  "Billing-impacting writes require actor identity, client attribution, idempotency key, audit correlation id, stale-state check, and redacted output.",
  "Model-visible output must not include raw Stripe secret keys, webhook secrets, customer IDs, Checkout Session IDs, PaymentIntent IDs, Subscription IDs, connected-account IDs, or private customer data.",
  "If an event or provider response is ambiguous, record the blocked state and continue with non-billing work instead of guessing.",
];
