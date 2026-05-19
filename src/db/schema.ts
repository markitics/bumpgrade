import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
  }),
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId),
  }),
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  }),
);

export const accountVerificationEmails = sqliteTable(
  "account_verification_emails",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    status: text("status").notNull().default("sent"),
    provider: text("provider").notNull(),
    source: text("source").notNull(),
    error: text("error"),
    sentAt: integer("sent_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    emailSentIdx: index("account_verification_emails_email_sent_idx").on(table.email, table.sentAt),
    statusSentIdx: index("account_verification_emails_status_sent_idx").on(table.status, table.sentAt),
  }),
);

export const commerceProducts = sqliteTable(
  "commerce_products",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    status: text("status").notNull().default("draft"),
    description: text("description"),
    fulfillmentKind: text("fulfillment_kind").notNull().default("manual"),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("commerce_products_slug_unique").on(table.slug),
    ownerStatusIdx: index("commerce_products_owner_status_idx").on(table.ownerUserId, table.status),
  }),
);

export const commercePrices = sqliteTable(
  "commerce_prices",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => commerceProducts.id, { onDelete: "cascade" }),
    nickname: text("nickname"),
    currency: text("currency").notNull().default("usd"),
    unitAmountCents: integer("unit_amount_cents").notNull(),
    billingInterval: text("billing_interval").notNull().default("one_time"),
    stripePriceId: text("stripe_price_id"),
    active: integer("active", { mode: "boolean" }).notNull().default(false),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    stripePriceUnique: uniqueIndex("commerce_prices_stripe_price_unique").on(table.stripePriceId),
    productActiveIdx: index("commerce_prices_product_active_idx").on(table.productId, table.active),
  }),
);

export const checkoutIntents = sqliteTable(
  "checkout_intents",
  {
    id: text("id").primaryKey(),
    idempotencyKey: text("idempotency_key").notNull(),
    checkoutKind: text("checkout_kind").notNull(),
    status: text("status").notNull().default("draft"),
    productId: text("product_id").references(() => commerceProducts.id, { onDelete: "set null" }),
    priceId: text("price_id").references(() => commercePrices.id, { onDelete: "set null" }),
    ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
    buyerUserId: text("buyer_user_id").references(() => user.id, { onDelete: "set null" }),
    buyerEmail: text("buyer_email"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    stripeMode: text("stripe_mode").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    successUrl: text("success_url"),
    cancelUrl: text("cancel_url"),
    confirmationRequired: integer("confirmation_required", { mode: "boolean" }).notNull().default(true),
    confirmedAt: integer("confirmed_at", { mode: "timestamp" }),
    auditCorrelationId: text("audit_correlation_id"),
    agentClientId: text("agent_client_id"),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    idempotencyUnique: uniqueIndex("checkout_intents_idempotency_unique").on(table.idempotencyKey),
    stripeSessionUnique: uniqueIndex("checkout_intents_stripe_session_unique").on(table.stripeCheckoutSessionId),
    statusCreatedIdx: index("checkout_intents_status_created_idx").on(table.status, table.createdAt),
    productCreatedIdx: index("checkout_intents_product_created_idx").on(table.productId, table.createdAt),
  }),
);

export const billingSubscriptions = sqliteTable(
  "billing_subscriptions",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
    buyerUserId: text("buyer_user_id").references(() => user.id, { onDelete: "set null" }),
    buyerEmail: text("buyer_email"),
    productId: text("product_id").references(() => commerceProducts.id, { onDelete: "set null" }),
    priceId: text("price_id").references(() => commercePrices.id, { onDelete: "set null" }),
    status: text("status").notNull().default("incomplete"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id").notNull(),
    stripePriceId: text("stripe_price_id"),
    currentPeriodStart: integer("current_period_start", { mode: "timestamp" }),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
    cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).notNull().default(false),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    stripeSubscriptionUnique: uniqueIndex("billing_subscriptions_stripe_subscription_unique").on(
      table.stripeSubscriptionId,
    ),
    buyerStatusIdx: index("billing_subscriptions_buyer_status_idx").on(table.buyerUserId, table.status),
  }),
);

export const stripeWebhookEvents = sqliteTable(
  "stripe_webhook_events",
  {
    id: text("id").primaryKey(),
    eventType: text("event_type").notNull(),
    apiVersion: text("api_version"),
    livemode: integer("livemode", { mode: "boolean" }).notNull().default(false),
    stripeCreatedAt: integer("stripe_created_at", { mode: "timestamp" }),
    status: text("status").notNull().default("processed"),
    payloadRedactedJson: text("payload_redacted_json"),
    error: text("error"),
    processedAt: integer("processed_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    typeProcessedIdx: index("stripe_webhook_events_type_processed_idx").on(table.eventType, table.processedAt),
  }),
);

export const paymentAuditEvents = sqliteTable(
  "payment_audit_events",
  {
    id: text("id").primaryKey(),
    checkoutIntentId: text("checkout_intent_id").references(() => checkoutIntents.id, { onDelete: "set null" }),
    stripeEventId: text("stripe_event_id").references(() => stripeWebhookEvents.id, { onDelete: "set null" }),
    eventKind: text("event_kind").notNull(),
    actorKind: text("actor_kind").notNull(),
    actorId: text("actor_id"),
    summary: text("summary").notNull(),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    checkoutCreatedIdx: index("payment_audit_events_checkout_created_idx").on(
      table.checkoutIntentId,
      table.createdAt,
    ),
  }),
);

export const productEntitlements = sqliteTable(
  "product_entitlements",
  {
    id: text("id").primaryKey(),
    checkoutIntentId: text("checkout_intent_id").references(() => checkoutIntents.id, { onDelete: "set null" }),
    sourceStripeEventId: text("source_stripe_event_id").references(() => stripeWebhookEvents.id, { onDelete: "set null" }),
    productId: text("product_id").notNull(),
    sourceCommerceProductId: text("source_commerce_product_id").references(() => commerceProducts.id, {
      onDelete: "set null",
    }),
    entitlementTemplateId: text("entitlement_template_id").notNull(),
    accessRuleId: text("access_rule_id").notNull(),
    status: text("status").notNull().default("active"),
    grantKind: text("grant_kind").notNull(),
    buyerUserId: text("buyer_user_id").references(() => user.id, { onDelete: "set null" }),
    buyerEmailHash: text("buyer_email_hash"),
    sourcePriceId: text("source_price_id"),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
    metadataJson: text("metadata_json"),
    grantedAt: integer("granted_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    checkoutTemplateUnique: uniqueIndex("product_entitlements_checkout_template_unique").on(
      table.checkoutIntentId,
      table.productId,
      table.entitlementTemplateId,
    ),
    productStatusIdx: index("product_entitlements_product_status_idx").on(table.productId, table.status),
    templateStatusIdx: index("product_entitlements_template_status_idx").on(table.entitlementTemplateId, table.status),
  }),
);

export const productFulfillmentTasks = sqliteTable(
  "product_fulfillment_tasks",
  {
    id: text("id").primaryKey(),
    entitlementId: text("entitlement_id").references(() => productEntitlements.id, { onDelete: "cascade" }),
    checkoutIntentId: text("checkout_intent_id").references(() => checkoutIntents.id, { onDelete: "set null" }),
    productId: text("product_id").notNull(),
    status: text("status").notNull().default("queued"),
    fulfillmentKind: text("fulfillment_kind").notNull(),
    summary: text("summary").notNull(),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    entitlementUnique: uniqueIndex("product_fulfillment_tasks_entitlement_unique").on(table.entitlementId),
    statusCreatedIdx: index("product_fulfillment_tasks_status_created_idx").on(table.status, table.createdAt),
  }),
);

export const audienceSubscribers = sqliteTable(
  "audience_subscribers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    emailHash: text("email_hash").notNull(),
    firstName: text("first_name"),
    status: text("status").notNull().default("subscribed"),
    sourceFormId: text("source_form_id").notNull(),
    sourceSegmentId: text("source_segment_id"),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("audience_subscribers_email_unique").on(table.email),
    statusCreatedIdx: index("audience_subscribers_status_created_idx").on(table.status, table.createdAt),
    emailHashIdx: index("audience_subscribers_email_hash_idx").on(table.emailHash),
  }),
);

export const audienceConsentEvents = sqliteTable(
  "audience_consent_events",
  {
    id: text("id").primaryKey(),
    subscriberId: text("subscriber_id")
      .notNull()
      .references(() => audienceSubscribers.id, { onDelete: "cascade" }),
    formId: text("form_id").notNull(),
    consentStatement: text("consent_statement").notNull(),
    consentKind: text("consent_kind").notNull().default("launch_follow_up"),
    status: text("status").notNull().default("consented"),
    idempotencyKey: text("idempotency_key").notNull(),
    ipHash: text("ip_hash"),
    userAgentHash: text("user_agent_hash"),
    metadataJson: text("metadata_json"),
    consentedAt: integer("consented_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    idempotencyUnique: uniqueIndex("audience_consent_events_idempotency_unique").on(table.idempotencyKey),
    subscriberIdx: index("audience_consent_events_subscriber_idx").on(table.subscriberId, table.consentedAt),
  }),
);

export const audienceTagAssignments = sqliteTable(
  "audience_tag_assignments",
  {
    id: text("id").primaryKey(),
    subscriberId: text("subscriber_id")
      .notNull()
      .references(() => audienceSubscribers.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull(),
    sourceFormId: text("source_form_id").notNull(),
    status: text("status").notNull().default("active"),
    idempotencyKey: text("idempotency_key").notNull(),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    subscriberTagUnique: uniqueIndex("audience_tag_assignments_subscriber_tag_unique").on(
      table.subscriberId,
      table.tagId,
    ),
    idempotencyUnique: uniqueIndex("audience_tag_assignments_idempotency_unique").on(table.idempotencyKey),
  }),
);

export const audienceSequenceEnrollments = sqliteTable(
  "audience_sequence_enrollments",
  {
    id: text("id").primaryKey(),
    subscriberId: text("subscriber_id")
      .notNull()
      .references(() => audienceSubscribers.id, { onDelete: "cascade" }),
    sequenceId: text("sequence_id").notNull(),
    sourceFormId: text("source_form_id").notNull(),
    status: text("status").notNull().default("draft_enrolled"),
    idempotencyKey: text("idempotency_key").notNull(),
    nextStepId: text("next_step_id"),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    subscriberSequenceUnique: uniqueIndex("audience_sequence_enrollments_subscriber_sequence_unique").on(
      table.subscriberId,
      table.sequenceId,
    ),
    idempotencyUnique: uniqueIndex("audience_sequence_enrollments_idempotency_unique").on(table.idempotencyKey),
  }),
);

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: text("id").primaryKey(),
    eventDefinitionId: text("event_definition_id").notNull(),
    eventKind: text("event_kind").notNull(),
    sourceRoute: text("source_route").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    funnelId: text("funnel_id"),
    funnelStepId: text("funnel_step_id"),
    formId: text("form_id"),
    productId: text("product_id"),
    priceId: text("price_id"),
    variantId: text("variant_id"),
    amountCents: integer("amount_cents"),
    currency: text("currency"),
    publicPropertiesJson: text("public_properties_json"),
    clientCorrelationHash: text("client_correlation_hash"),
    ipHash: text("ip_hash"),
    userAgentHash: text("user_agent_hash"),
    metadataJson: text("metadata_json"),
    occurredAt: integer("occurred_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    idempotencyUnique: uniqueIndex("analytics_events_idempotency_unique").on(table.idempotencyKey),
    definitionTimeIdx: index("analytics_events_definition_time_idx").on(table.eventDefinitionId, table.occurredAt),
    sourceTimeIdx: index("analytics_events_source_time_idx").on(table.sourceRoute, table.occurredAt),
    kindTimeIdx: index("analytics_events_kind_time_idx").on(table.eventKind, table.occurredAt),
  }),
);

export const analyticsEventIngestions = sqliteTable(
  "analytics_event_ingestions",
  {
    id: text("id").primaryKey(),
    idempotencyKey: text("idempotency_key").notNull(),
    analyticsEventId: text("analytics_event_id").references(() => analyticsEvents.id, { onDelete: "set null" }),
    eventDefinitionId: text("event_definition_id").notNull(),
    status: text("status").notNull().default("recorded"),
    requestHash: text("request_hash").notNull(),
    errorCode: text("error_code"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    idempotencyUnique: uniqueIndex("analytics_event_ingestions_idempotency_unique").on(table.idempotencyKey),
    eventIdx: index("analytics_event_ingestions_event_idx").on(table.analyticsEventId),
    statusCreatedIdx: index("analytics_event_ingestions_status_created_idx").on(table.status, table.createdAt),
  }),
);

export const funnelDrafts = sqliteTable(
  "funnel_drafts",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    status: text("status").notNull().default("draft"),
    summary: text("summary").notNull(),
    sourceIssueNumber: integer("source_issue_number").notNull(),
    parentIssueNumber: integer("parent_issue_number").notNull(),
    previewRoute: text("preview_route"),
    sourceDataRoute: text("source_data_route").notNull().default("/funnels/source-data"),
    revisionId: text("revision_id").notNull(),
    createdByEmail: text("created_by_email").notNull(),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("funnel_drafts_slug_unique").on(table.slug),
    statusUpdatedIdx: index("funnel_drafts_status_updated_idx").on(table.status, table.updatedAt),
    ownerUpdatedIdx: index("funnel_drafts_owner_updated_idx").on(table.ownerUserId, table.updatedAt),
  }),
);

export const funnelDraftSteps = sqliteTable(
  "funnel_draft_steps",
  {
    id: text("id").primaryKey(),
    funnelDraftId: text("funnel_draft_id")
      .notNull()
      .references(() => funnelDrafts.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    stepOrder: integer("step_order").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    goal: text("goal").notNull(),
    routeAnchor: text("route_anchor").notNull(),
    blocksJson: text("blocks_json").notNull().default("[]"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    draftOrderUnique: uniqueIndex("funnel_draft_steps_draft_order_unique").on(table.funnelDraftId, table.stepOrder),
    draftSlugUnique: uniqueIndex("funnel_draft_steps_draft_slug_unique").on(table.funnelDraftId, table.slug),
  }),
);

export const funnelAuditEvents = sqliteTable(
  "funnel_audit_events",
  {
    id: text("id").primaryKey(),
    funnelDraftId: text("funnel_draft_id").references(() => funnelDrafts.id, { onDelete: "set null" }),
    actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
    actorEmail: text("actor_email").notNull(),
    eventKind: text("event_kind").notNull(),
    summary: text("summary").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    metadataJson: text("metadata_json"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    idempotencyUnique: uniqueIndex("funnel_audit_events_idempotency_unique").on(table.idempotencyKey),
    draftCreatedIdx: index("funnel_audit_events_draft_created_idx").on(table.funnelDraftId, table.createdAt),
  }),
);

export const codexOutboundMessages = sqliteTable(
  "codex_outbound_messages",
  {
    id: text("id").primaryKey(),
    messageKind: text("message_kind").notNull(),
    status: text("status").notNull().default("draft"),
    provider: text("provider").notNull().default("cloudflare-rest"),
    fromEmail: text("from_email").notNull(),
    fromName: text("from_name"),
    toEmailsJson: text("to_emails_json").notNull(),
    subject: text("subject").notNull(),
    textBody: text("text_body").notNull(),
    htmlBody: text("html_body"),
    prNumber: integer("pr_number"),
    githubUrl: text("github_url"),
    workerVersion: text("worker_version"),
    cloudflareResultJson: text("cloudflare_result_json"),
    error: text("error"),
    sentAt: integer("sent_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    statusCreatedIdx: index("codex_outbound_messages_status_created_idx").on(table.status, table.createdAt),
    prIdx: index("codex_outbound_messages_pr_idx").on(table.prNumber),
  }),
);

export const codexInboundMessages = sqliteTable(
  "codex_inbound_messages",
  {
    id: text("id").primaryKey(),
    mailbox: text("mailbox").notNull(),
    fromEmail: text("from_email"),
    fromName: text("from_name"),
    trustedSender: integer("trusted_sender", { mode: "boolean" }).notNull().default(false),
    subject: text("subject"),
    snippet: text("snippet"),
    textBody: text("text_body"),
    rawStorageKey: text("raw_storage_key"),
    rawSize: integer("raw_size"),
    messageId: text("message_id"),
    inReplyTo: text("in_reply_to"),
    referencesHeader: text("references_header"),
    status: text("status").notNull().default("unread"),
    senderVerificationStatus: text("sender_verification_status").notNull().default("trusted_unverified"),
    senderAuthenticationJson: text("sender_authentication_json"),
    autoRepliedAt: integer("auto_replied_at", { mode: "timestamp" }),
    autoReplyError: text("auto_reply_error"),
    receivedAt: integer("received_at", { mode: "timestamp" }).notNull(),
    forwardedAt: integer("forwarded_at", { mode: "timestamp" }),
    forwardError: text("forward_error"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => ({
    mailboxReceivedIdx: index("codex_inbound_messages_mailbox_received_idx").on(table.mailbox, table.receivedAt),
    trustedStatusIdx: index("codex_inbound_messages_trusted_status_idx").on(
      table.trustedSender,
      table.status,
      table.receivedAt,
    ),
    messageIdUnique: uniqueIndex("codex_inbound_messages_message_id_unique").on(table.messageId),
  }),
);
