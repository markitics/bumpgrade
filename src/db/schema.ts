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
