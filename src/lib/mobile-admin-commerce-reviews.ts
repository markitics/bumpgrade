import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/analytics-events";
import {
  commerceAgentWriteRules,
  commerceDecisions,
  commerceTables,
  stripeCommerceContract,
  stripeCommerceUpdatedAt,
  type CommerceTableContract,
} from "@/lib/commerce";

export const mobileAdminCommerceReviewIssue = 414;
export const mobileAdminCommerceReviewStatus = "owner-mobile-commerce-review-ready";
export const mobileAdminCommerceReviewApiRoute = "/api/mobile-admin/commerce-reviews";
export const mobileAdminCommerceReviewSourceRoute = "/commerce/source-data";
export const mobileAdminCommerceReviewConfirmationText = "ACKNOWLEDGE MOBILE COMMERCE HEALTH";

type Runtime = {
  db: D1Database;
};

type CommerceReviewCountRow = {
  commerce_reviews: number;
  reviewed_targets: number;
  commerce_state_recorded_rows: number;
  billing_mutation_created_rows: number;
  refund_created_rows: number;
  subscription_changed_rows: number;
  price_changed_rows: number;
  fulfillment_state_changed_rows: number;
  entitlement_state_changed_rows: number;
  push_notification_sent_rows: number;
  distribution_state_changed_rows: number;
  public_agent_write_created_rows: number;
};

type CommerceReviewRow = {
  id: string;
  review_target_id: string;
  review_target_title: string;
  review_target_status: string;
  source_route: string;
  expected_commerce_generated_at: string;
  stale_state_token_sha256: string;
  confirmation_text_sha256: string;
  idempotency_key: string;
  audit_correlation_id: string;
  actor_user_id: string;
  actor_email_hash: string;
  review_note_sha256: string | null;
  commerce_state_recorded: number;
  billing_mutation_created: number;
  refund_created: number;
  subscription_changed: number;
  price_changed: number;
  fulfillment_state_changed: number;
  entitlement_state_changed: number;
  push_notification_sent: number;
  distribution_state_changed: number;
  public_agent_write_created: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

export type MobileAdminCommerceReviewAllowedTarget = {
  id: string;
  title: string;
  status: CommerceTableContract["status"];
  purpose: string;
  publicSafeFieldCount: number;
  serverPrivateFieldCount: number;
  expectedCommerceGeneratedAt: string;
  staleStateTokenRequired: true;
  staleStateToken?: string;
};

export type MobileAdminCommerceReviewPublic = {
  id: string;
  reviewTargetId: string;
  reviewTargetTitle: string;
  reviewTargetStatus: string;
  sourceRoute: typeof mobileAdminCommerceReviewSourceRoute;
  expectedCommerceGeneratedAt: string;
  auditCorrelationId: string;
  reviewNoteRecorded: boolean;
  commerceStateRecorded: true;
  billingMutationCreated: false;
  refundCreated: false;
  subscriptionChanged: false;
  priceChanged: false;
  fulfillmentStateChanged: false;
  entitlementStateChanged: false;
  pushNotificationSent: false;
  distributionStateChanged: false;
  publicAgentWriteCreated: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type MobileAdminCommerceReviewSummary = {
  id: "mobile-admin-commerce-review-contract";
  status: typeof mobileAdminCommerceReviewStatus;
  issue: typeof mobileAdminCommerceReviewIssue;
  parentIssue: 414;
  apiRoute: typeof mobileAdminCommerceReviewApiRoute;
  sourceRoute: typeof mobileAdminCommerceReviewSourceRoute;
  source: "d1" | "unavailable";
  loadError: string | null;
  auth: {
    required: true;
    boundary: "owner-session";
    sessionRoute: "/api/auth/[...all]";
    acceptedRoles: ["owner"];
  };
  confirmation: {
    required: true;
    exactText: typeof mobileAdminCommerceReviewConfirmationText;
  };
  commerceGeneratedAt: string;
  allowedReviewTargets: MobileAdminCommerceReviewAllowedTarget[];
  counts: {
    commerceReviews: number;
    reviewedTargets: number;
    commerceStateRecordedRows: number;
    billingMutationCreatedRows: number;
    refundCreatedRows: number;
    subscriptionChangedRows: number;
    priceChangedRows: number;
    fulfillmentStateChangedRows: number;
    entitlementStateChangedRows: number;
    pushNotificationSentRows: number;
    distributionStateChangedRows: number;
    publicAgentWriteCreatedRows: number;
  };
  latestReviews: MobileAdminCommerceReviewPublic[];
  redaction: {
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    actorUserIdIncluded: false;
    reviewNoteIncluded: false;
    idempotencyKeysIncluded: false;
    staleStateTokenIncludedInPublicSourceData: false;
    staleStateTokenHashIncluded: false;
    rawRowsIncluded: false;
    billingMutationCreated: false;
    refundCreated: false;
    subscriptionChanged: false;
    priceChanged: false;
    fulfillmentStateChanged: false;
    entitlementStateChanged: false;
    pushNotificationSent: false;
    distributionStateChanged: false;
    publicAgentWriteCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type RecordMobileAdminCommerceReviewInput = {
  reviewTargetId?: unknown;
  expectedCommerceGeneratedAt?: unknown;
  staleStateToken?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  auditCorrelationId?: unknown;
  reviewNote?: unknown;
  actor: AdminIdentity;
};

type RecordMobileAdminCommerceReviewResult =
  | {
      ok: true;
      status: "mobile_admin_commerce_review_recorded" | "mobile_admin_commerce_review_replayed";
      duplicate: boolean;
      review: MobileAdminCommerceReviewPublic;
      redaction: MobileAdminCommerceReviewSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_review_target"
        | "confirmation_required"
        | "stale_commerce_status"
        | "stale_state_token"
        | "idempotency_conflict"
        | "commerce_review_not_created";
      message: string;
      redaction: MobileAdminCommerceReviewSummary["redaction"];
      currentCommerceGeneratedAt?: string | null;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function parseString(value: unknown, maxLength = 220) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function numberValue(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function redaction(): MobileAdminCommerceReviewSummary["redaction"] {
  return {
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    actorUserIdIncluded: false,
    reviewNoteIncluded: false,
    idempotencyKeysIncluded: false,
    staleStateTokenIncludedInPublicSourceData: false,
    staleStateTokenHashIncluded: false,
    rawRowsIncluded: false,
    billingMutationCreated: false,
    refundCreated: false,
    subscriptionChanged: false,
    priceChanged: false,
    fulfillmentStateChanged: false,
    entitlementStateChanged: false,
    pushNotificationSent: false,
    distributionStateChanged: false,
    publicAgentWriteCreated: false,
  };
}

function emptyCounts(): MobileAdminCommerceReviewSummary["counts"] {
  return {
    commerceReviews: 0,
    reviewedTargets: 0,
    commerceStateRecordedRows: 0,
    billingMutationCreatedRows: 0,
    refundCreatedRows: 0,
    subscriptionChangedRows: 0,
    priceChangedRows: 0,
    fulfillmentStateChangedRows: 0,
    entitlementStateChangedRows: 0,
    pushNotificationSentRows: 0,
    distributionStateChangedRows: 0,
    publicAgentWriteCreatedRows: 0,
  };
}

function titleFromTableName(tableName: string) {
  return tableName
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function publicReview(row: CommerceReviewRow, duplicate = false): MobileAdminCommerceReviewPublic {
  return {
    id: row.id,
    reviewTargetId: row.review_target_id,
    reviewTargetTitle: row.review_target_title,
    reviewTargetStatus: row.review_target_status,
    sourceRoute: mobileAdminCommerceReviewSourceRoute,
    expectedCommerceGeneratedAt: row.expected_commerce_generated_at,
    auditCorrelationId: row.audit_correlation_id,
    reviewNoteRecorded: Boolean(row.review_note_sha256),
    commerceStateRecorded: true,
    billingMutationCreated: false,
    refundCreated: false,
    subscriptionChanged: false,
    priceChanged: false,
    fulfillmentStateChanged: false,
    entitlementStateChanged: false,
    pushNotificationSent: false,
    distributionStateChanged: false,
    publicAgentWriteCreated: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
}

export function mobileAdminCommerceReviewStaleStateToken(input: {
  commerceRevision: string;
  reviewTargetId: string;
}) {
  return `${mobileAdminCommerceReviewApiRoute}:${input.reviewTargetId}:revision-${input.commerceRevision}:issue-${mobileAdminCommerceReviewIssue}`;
}

function stableHash(input: string) {
  let hash = 0xcbf29ce484222325n;
  for (const char of input) {
    hash ^= BigInt(char.codePointAt(0) ?? 0);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

function commerceReviewRevision() {
  const revisionInput = {
    stripeCommerceUpdatedAt,
    contract: {
      id: stripeCommerceContract.id,
      issue: stripeCommerceContract.issue,
      status: stripeCommerceContract.status,
      activeMode: stripeCommerceContract.activeMode,
      sandboxCheckout: stripeCommerceContract.sandboxCheckout,
      notLiveYet: stripeCommerceContract.notLiveYet,
    },
    tables: commerceTables.map((table) => ({
      table: table.table,
      status: table.status,
      publicSafeFields: [...table.publicSafeFields].sort(),
      serverPrivateFieldCount: table.serverPrivateFields.length,
      purpose: table.purpose,
    })),
    decisions: commerceDecisions.map((decision) => ({
      id: decision.id,
      title: decision.title,
      status: decision.status,
    })),
    rules: commerceAgentWriteRules,
  };
  return `commerce-revision-${stableHash(JSON.stringify(revisionInput))}`;
}

function allowedReviewTargets(includeStaleStateTokens: boolean) {
  const commerceRevision = commerceReviewRevision();
  return commerceTables.map((table) => ({
    id: table.table,
    title: titleFromTableName(table.table),
    status: table.status,
    purpose: table.purpose,
    publicSafeFieldCount: table.publicSafeFields.length,
    serverPrivateFieldCount: table.serverPrivateFields.length,
    expectedCommerceGeneratedAt: commerceRevision,
    staleStateTokenRequired: true as const,
    ...(includeStaleStateTokens
      ? {
          staleStateToken: mobileAdminCommerceReviewStaleStateToken({
            commerceRevision,
            reviewTargetId: table.table,
          }),
        }
      : {}),
  }));
}

function emptySummary(
  source: MobileAdminCommerceReviewSummary["source"],
  loadError: string | null,
  includeStaleStateTokens: boolean,
): MobileAdminCommerceReviewSummary {
  return {
    id: "mobile-admin-commerce-review-contract",
    status: mobileAdminCommerceReviewStatus,
    issue: mobileAdminCommerceReviewIssue,
    parentIssue: 414,
    apiRoute: mobileAdminCommerceReviewApiRoute,
    sourceRoute: mobileAdminCommerceReviewSourceRoute,
    source,
    loadError,
    auth: {
      required: true,
      boundary: "owner-session",
      sessionRoute: "/api/auth/[...all]",
      acceptedRoles: ["owner"],
    },
    confirmation: {
      required: true,
      exactText: mobileAdminCommerceReviewConfirmationText,
    },
    commerceGeneratedAt: commerceReviewRevision(),
    allowedReviewTargets: allowedReviewTargets(includeStaleStateTokens),
    counts: emptyCounts(),
    latestReviews: [],
    redaction: redaction(),
    privateFieldsExcluded: [
      "actorEmail",
      "actorEmailHash",
      "actorUserId",
      "idempotencyKey",
      "reviewNote",
      "reviewNoteSha256",
      "confirmationTextSha256",
      "staleStateToken",
      "staleStateTokenSha256",
      "rawRows",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #414 lets verified owners acknowledge current commerce-health state from Mobile Admin after exact confirmation, idempotency, current commerce source-revision checks, stale-state token checks, audit correlation, and redaction. It records low-risk owner review state only; it does not create billing mutations, refunds, subscription changes, price changes, fulfillment changes, entitlement changes, push notifications, distribution state changes, public agent writes, or private-row changes.",
  };
}

async function findReviewByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM mobile_admin_commerce_reviews
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<CommerceReviewRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS commerce_reviews,
        COUNT(DISTINCT review_target_id) AS reviewed_targets,
        SUM(commerce_state_recorded) AS commerce_state_recorded_rows,
        SUM(billing_mutation_created) AS billing_mutation_created_rows,
        SUM(refund_created) AS refund_created_rows,
        SUM(subscription_changed) AS subscription_changed_rows,
        SUM(price_changed) AS price_changed_rows,
        SUM(fulfillment_state_changed) AS fulfillment_state_changed_rows,
        SUM(entitlement_state_changed) AS entitlement_state_changed_rows,
        SUM(push_notification_sent) AS push_notification_sent_rows,
        SUM(distribution_state_changed) AS distribution_state_changed_rows,
        SUM(public_agent_write_created) AS public_agent_write_created_rows
       FROM mobile_admin_commerce_reviews`,
    )
    .first<CommerceReviewCountRow>();

  return {
    commerceReviews: numberValue(row?.commerce_reviews),
    reviewedTargets: numberValue(row?.reviewed_targets),
    commerceStateRecordedRows: numberValue(row?.commerce_state_recorded_rows),
    billingMutationCreatedRows: numberValue(row?.billing_mutation_created_rows),
    refundCreatedRows: numberValue(row?.refund_created_rows),
    subscriptionChangedRows: numberValue(row?.subscription_changed_rows),
    priceChangedRows: numberValue(row?.price_changed_rows),
    fulfillmentStateChangedRows: numberValue(row?.fulfillment_state_changed_rows),
    entitlementStateChangedRows: numberValue(row?.entitlement_state_changed_rows),
    pushNotificationSentRows: numberValue(row?.push_notification_sent_rows),
    distributionStateChangedRows: numberValue(row?.distribution_state_changed_rows),
    publicAgentWriteCreatedRows: numberValue(row?.public_agent_write_created_rows),
  };
}

async function loadLatestReviews(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM mobile_admin_commerce_reviews
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<CommerceReviewRow>();
  return (result.results ?? []).map((row) => publicReview(row, false));
}

export async function getMobileAdminCommerceReviewSummary(options?: {
  db?: D1Database;
  includeStaleStateTokens?: boolean;
}): Promise<MobileAdminCommerceReviewSummary> {
  const includeStaleStateTokens = options?.includeStaleStateTokens ?? false;
  try {
    const db = options?.db ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null, includeStaleStateTokens),
      counts: await loadCounts(db),
      latestReviews: await loadLatestReviews(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load mobile commerce review state.",
      includeStaleStateTokens,
    );
  }
}

export async function recordMobileAdminCommerceReview(
  input: RecordMobileAdminCommerceReviewInput,
): Promise<RecordMobileAdminCommerceReviewResult> {
  const summaryRedaction = redaction();
  const reviewTargetId = parseString(input.reviewTargetId, 160);
  const expectedCommerceGeneratedAt = parseString(input.expectedCommerceGeneratedAt, 50);
  const staleStateToken = parseString(input.staleStateToken, 320);
  const auditCorrelationId = parseString(input.auditCorrelationId, 180);
  const reviewNote = parseString(input.reviewNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!reviewTargetId || !expectedCommerceGeneratedAt || !staleStateToken || !auditCorrelationId || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Review target id, expected commerce source revision, stale-state token, audit correlation id, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== mobileAdminCommerceReviewConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact mobile commerce review confirmation text is required before recording review state.",
      redaction: summaryRedaction,
    };
  }

  const commerceRevision = commerceReviewRevision();
  const reviewTarget = commerceTables.find((candidate) => candidate.table === reviewTargetId);
  if (!reviewTarget) {
    return {
      ok: false,
      status: "unsupported_review_target",
      message: "The requested commerce review target is not available in the current commerce source-data payload.",
      redaction: summaryRedaction,
      currentCommerceGeneratedAt: commerceRevision,
    };
  }

  if (expectedCommerceGeneratedAt !== commerceRevision) {
    return {
      ok: false,
      status: "stale_commerce_status",
      message: "The commerce source-data payload changed before the mobile review was recorded.",
      redaction: summaryRedaction,
      currentCommerceGeneratedAt: commerceRevision,
    };
  }

  const expectedStaleStateToken = mobileAdminCommerceReviewStaleStateToken({
    commerceRevision,
    reviewTargetId,
  });
  if (staleStateToken !== expectedStaleStateToken) {
    return {
      ok: false,
      status: "stale_state_token",
      message: "The mobile commerce review stale-state token changed before the review was recorded.",
      redaction: summaryRedaction,
    };
  }

  const { db } = await getRuntime();
  const staleStateTokenSha256 = await sha256Hex(staleStateToken);
  const confirmationTextSha256 = await sha256Hex(mobileAdminCommerceReviewConfirmationText);
  const reviewNoteSha256 = reviewNote ? await sha256Hex(reviewNote) : null;
  const actorUserId = input.actor.userId ?? "unknown-owner";
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const existing = await findReviewByIdempotency(db, idempotencyKey);

  if (existing) {
    const sameRequest =
      existing.review_target_id === reviewTarget.table &&
      existing.expected_commerce_generated_at === expectedCommerceGeneratedAt &&
      existing.stale_state_token_sha256 === staleStateTokenSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256 &&
      existing.audit_correlation_id === auditCorrelationId &&
      existing.actor_user_id === actorUserId &&
      existing.actor_email_hash === actorEmailHash &&
      (existing.review_note_sha256 ?? null) === reviewNoteSha256 &&
      existing.commerce_state_recorded === 1 &&
      existing.billing_mutation_created === 0 &&
      existing.refund_created === 0 &&
      existing.subscription_changed === 0 &&
      existing.price_changed === 0 &&
      existing.fulfillment_state_changed === 0 &&
      existing.entitlement_state_changed === 0 &&
      existing.push_notification_sent === 0 &&
      existing.distribution_state_changed === 0 &&
      existing.public_agent_write_created === 0;
    if (!sameRequest) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "The idempotency key is already associated with a different mobile commerce review request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "mobile_admin_commerce_review_replayed",
      duplicate: true,
      review: publicReview(existing, true),
      redaction: summaryRedaction,
    };
  }

  const reviewId = `mobile-admin-commerce-review-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO mobile_admin_commerce_reviews (
        id, review_target_id, review_target_title, review_target_status, source_route,
        expected_commerce_generated_at, stale_state_token_sha256, confirmation_text_sha256,
        idempotency_key, audit_correlation_id, actor_user_id, actor_email_hash, review_note_sha256,
        commerce_state_recorded, billing_mutation_created, refund_created, subscription_changed,
        price_changed, fulfillment_state_changed, entitlement_state_changed, push_notification_sent,
        distribution_state_changed, public_agent_write_created, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      reviewId,
      reviewTarget.table,
      titleFromTableName(reviewTarget.table),
      reviewTarget.status,
      mobileAdminCommerceReviewSourceRoute,
      expectedCommerceGeneratedAt,
      staleStateTokenSha256,
      confirmationTextSha256,
      idempotencyKey,
      auditCorrelationId,
      actorUserId,
      actorEmailHash,
      reviewNoteSha256,
      JSON.stringify({
        issue: mobileAdminCommerceReviewIssue,
        sourceRoute: mobileAdminCommerceReviewSourceRoute,
        stripeCommerceContractId: stripeCommerceContract.id,
        stripeCommerceUpdatedAt,
        commerceRevision,
        reviewTargetPurpose: reviewTarget.purpose,
        publicSafeFieldCount: reviewTarget.publicSafeFields.length,
        serverPrivateFieldCount: reviewTarget.serverPrivateFields.length,
        commerceStateRecorded: true,
        billingMutationCreated: false,
        refundCreated: false,
        subscriptionChanged: false,
        priceChanged: false,
        fulfillmentStateChanged: false,
        entitlementStateChanged: false,
        pushNotificationSent: false,
        distributionStateChanged: false,
        publicAgentWriteCreated: false,
      }),
    )
    .run();

  const review = await findReviewByIdempotency(db, idempotencyKey);
  if (!review) {
    return {
      ok: false,
      status: "commerce_review_not_created",
      message: "The mobile commerce review could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "mobile_admin_commerce_review_recorded",
    duplicate: false,
    review: publicReview(review, false),
    redaction: summaryRedaction,
  };
}
