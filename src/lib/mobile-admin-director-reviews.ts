import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { getAdminSurfaceData } from "@/lib/admin-surface-data";
import { sha256Hex } from "@/lib/analytics-events";
import { buildDirectorStatusData, type DirectorStatusData, type DirectorWorkstream } from "@/lib/director-status";

export const mobileAdminDirectorReviewIssue = 414;
export const mobileAdminDirectorReviewStatus = "owner-mobile-director-review-ready";
export const mobileAdminDirectorReviewApiRoute = "/api/mobile-admin/director-reviews";
export const mobileAdminDirectorReviewSourceRoute = "/admin/director/source-data";
export const mobileAdminDirectorReviewConfirmationText = "ACKNOWLEDGE DIRECTOR WORKSTREAM";

type Runtime = {
  db: D1Database;
};

type DirectorReviewCountRow = {
  director_reviews: number;
  reviewed_workstreams: number;
  production_admin_state_recorded_rows: number;
  billing_mutation_created_rows: number;
  push_notification_sent_rows: number;
  distribution_state_changed_rows: number;
  public_agent_write_created_rows: number;
};

type DirectorReviewRow = {
  id: string;
  workstream_id: string;
  workstream_title: string;
  workstream_status: string;
  source_route: string;
  expected_director_generated_at: string;
  stale_state_token_sha256: string;
  confirmation_text_sha256: string;
  idempotency_key: string;
  audit_correlation_id: string;
  actor_user_id: string;
  actor_email_hash: string;
  review_note_sha256: string | null;
  production_admin_state_recorded: number;
  billing_mutation_created: number;
  push_notification_sent: number;
  distribution_state_changed: number;
  public_agent_write_created: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

export type MobileAdminDirectorReviewAllowedWorkstream = {
  id: string;
  title: string;
  status: string;
  currentFocus: string;
  counts: {
    active: number;
    pending: number;
    shipped: number;
    blocked: number;
    needsMark: number;
    changedPastDay: number;
    changedPastWeek: number;
  };
  expectedDirectorGeneratedAt: string;
  staleStateTokenRequired: true;
  staleStateToken?: string;
};

export type MobileAdminDirectorReviewPublic = {
  id: string;
  workstreamId: string;
  workstreamTitle: string;
  workstreamStatus: string;
  sourceRoute: typeof mobileAdminDirectorReviewSourceRoute;
  expectedDirectorGeneratedAt: string;
  auditCorrelationId: string;
  reviewNoteRecorded: boolean;
  productionAdminStateRecorded: true;
  billingMutationCreated: false;
  pushNotificationSent: false;
  distributionStateChanged: false;
  publicAgentWriteCreated: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type MobileAdminDirectorReviewSummary = {
  id: "mobile-admin-director-review-contract";
  status: typeof mobileAdminDirectorReviewStatus;
  issue: typeof mobileAdminDirectorReviewIssue;
  parentIssue: 414;
  apiRoute: typeof mobileAdminDirectorReviewApiRoute;
  sourceRoute: typeof mobileAdminDirectorReviewSourceRoute;
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
    exactText: typeof mobileAdminDirectorReviewConfirmationText;
  };
  directorGeneratedAt: string | null;
  allowedWorkstreams: MobileAdminDirectorReviewAllowedWorkstream[];
  counts: {
    directorReviews: number;
    reviewedWorkstreams: number;
    productionAdminStateRecordedRows: number;
    billingMutationCreatedRows: number;
    pushNotificationSentRows: number;
    distributionStateChangedRows: number;
    publicAgentWriteCreatedRows: number;
  };
  latestReviews: MobileAdminDirectorReviewPublic[];
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
    pushNotificationSent: false;
    distributionStateChanged: false;
    publicAgentWriteCreated: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type RecordMobileAdminDirectorReviewInput = {
  workstreamId?: unknown;
  expectedDirectorGeneratedAt?: unknown;
  staleStateToken?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  auditCorrelationId?: unknown;
  reviewNote?: unknown;
  actor: AdminIdentity;
};

type RecordMobileAdminDirectorReviewResult =
  | {
      ok: true;
      status: "mobile_admin_director_review_recorded" | "mobile_admin_director_review_replayed";
      duplicate: boolean;
      review: MobileAdminDirectorReviewPublic;
      redaction: MobileAdminDirectorReviewSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_workstream"
        | "confirmation_required"
        | "stale_director_status"
        | "stale_state_token"
        | "idempotency_conflict"
        | "director_review_not_created";
      message: string;
      redaction: MobileAdminDirectorReviewSummary["redaction"];
      currentDirectorGeneratedAt?: string | null;
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

function redaction(): MobileAdminDirectorReviewSummary["redaction"] {
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
    pushNotificationSent: false,
    distributionStateChanged: false,
    publicAgentWriteCreated: false,
  };
}

function emptyCounts(): MobileAdminDirectorReviewSummary["counts"] {
  return {
    directorReviews: 0,
    reviewedWorkstreams: 0,
    productionAdminStateRecordedRows: 0,
    billingMutationCreatedRows: 0,
    pushNotificationSentRows: 0,
    distributionStateChangedRows: 0,
    publicAgentWriteCreatedRows: 0,
  };
}

function publicReview(row: DirectorReviewRow, duplicate = false): MobileAdminDirectorReviewPublic {
  return {
    id: row.id,
    workstreamId: row.workstream_id,
    workstreamTitle: row.workstream_title,
    workstreamStatus: row.workstream_status,
    sourceRoute: mobileAdminDirectorReviewSourceRoute,
    expectedDirectorGeneratedAt: row.expected_director_generated_at,
    auditCorrelationId: row.audit_correlation_id,
    reviewNoteRecorded: Boolean(row.review_note_sha256),
    productionAdminStateRecorded: true,
    billingMutationCreated: false,
    pushNotificationSent: false,
    distributionStateChanged: false,
    publicAgentWriteCreated: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
}

export function mobileAdminDirectorReviewStaleStateToken(input: {
  directorRevision: string;
  workstreamId: string;
}) {
  return `${mobileAdminDirectorReviewApiRoute}:${input.workstreamId}:revision-${input.directorRevision}:issue-${mobileAdminDirectorReviewIssue}`;
}

function publicSafeFocus(workstream: DirectorWorkstream) {
  return workstream.currentFocus.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email-redacted]");
}

function stableHash(input: string) {
  let hash = 0xcbf29ce484222325n;
  for (const char of input) {
    hash ^= BigInt(char.codePointAt(0) ?? 0);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

function directorReviewRevision(director: DirectorStatusData) {
  const revisionInput = {
    source: director.source,
    loadError: director.loadError,
    totals: director.totals,
    executiveQueue: director.executiveQueue.map((lane) => ({
      id: lane.id,
      items: lane.items.map((item) => [item.id, item.status, item.workstreamId, item.updatedAt]),
    })),
    workstreams: director.workstreams.map((workstream) => ({
      id: workstream.id,
      status: workstream.status,
      currentFocus: publicSafeFocus(workstream),
      counts: workstream.counts,
      sourceRecordIds: {
        roadmap: [...workstream.sourceRecordIds.roadmap].sort(),
        workLog: [...workstream.sourceRecordIds.workLog].sort(),
        attention: [...workstream.sourceRecordIds.attention].sort(),
      },
    })),
  };
  return `director-revision-${stableHash(JSON.stringify(revisionInput))}`;
}

function allowedWorkstreams(director: DirectorStatusData | null, includeStaleStateTokens: boolean) {
  if (!director) return [];
  const directorRevision = directorReviewRevision(director);
  return director.workstreams.map((workstream) => ({
    id: workstream.id,
    title: workstream.title,
    status: workstream.status,
    currentFocus: publicSafeFocus(workstream),
    counts: {
      active: workstream.counts.active,
      pending: workstream.counts.pending,
      shipped: workstream.counts.shipped,
      blocked: workstream.counts.blocked,
      needsMark: workstream.counts.needsMark,
      changedPastDay: workstream.counts.changedPastDay,
      changedPastWeek: workstream.counts.changedPastWeek,
    },
    expectedDirectorGeneratedAt: directorRevision,
    staleStateTokenRequired: true as const,
    ...(includeStaleStateTokens
      ? {
          staleStateToken: mobileAdminDirectorReviewStaleStateToken({
            directorRevision,
            workstreamId: workstream.id,
          }),
        }
      : {}),
  }));
}

function emptySummary(
  source: MobileAdminDirectorReviewSummary["source"],
  loadError: string | null,
  director: DirectorStatusData | null,
  includeStaleStateTokens: boolean,
): MobileAdminDirectorReviewSummary {
  return {
    id: "mobile-admin-director-review-contract",
    status: mobileAdminDirectorReviewStatus,
    issue: mobileAdminDirectorReviewIssue,
    parentIssue: 414,
    apiRoute: mobileAdminDirectorReviewApiRoute,
    sourceRoute: mobileAdminDirectorReviewSourceRoute,
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
      exactText: mobileAdminDirectorReviewConfirmationText,
    },
    directorGeneratedAt: director?.generatedAt ?? null,
    allowedWorkstreams: allowedWorkstreams(director, includeStaleStateTokens),
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
      "Issue #414 lets verified owners acknowledge a Director workstream from Mobile Admin after exact confirmation, idempotency, current Director source-revision checks, stale-state token checks, audit correlation, and redaction. It records low-risk production owner review state only; it does not create billing mutations, publishing mutations, push notifications, distribution state changes, public agent writes, or private-row changes.",
  };
}

async function buildDirector() {
  const adminData = await getAdminSurfaceData();
  return buildDirectorStatusData(adminData);
}

async function findReviewByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM mobile_admin_director_reviews
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<DirectorReviewRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS director_reviews,
        COUNT(DISTINCT workstream_id) AS reviewed_workstreams,
        SUM(production_admin_state_recorded) AS production_admin_state_recorded_rows,
        SUM(billing_mutation_created) AS billing_mutation_created_rows,
        SUM(push_notification_sent) AS push_notification_sent_rows,
        SUM(distribution_state_changed) AS distribution_state_changed_rows,
        SUM(public_agent_write_created) AS public_agent_write_created_rows
       FROM mobile_admin_director_reviews`,
    )
    .first<DirectorReviewCountRow>();

  return {
    directorReviews: numberValue(row?.director_reviews),
    reviewedWorkstreams: numberValue(row?.reviewed_workstreams),
    productionAdminStateRecordedRows: numberValue(row?.production_admin_state_recorded_rows),
    billingMutationCreatedRows: numberValue(row?.billing_mutation_created_rows),
    pushNotificationSentRows: numberValue(row?.push_notification_sent_rows),
    distributionStateChangedRows: numberValue(row?.distribution_state_changed_rows),
    publicAgentWriteCreatedRows: numberValue(row?.public_agent_write_created_rows),
  };
}

async function loadLatestReviews(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM mobile_admin_director_reviews
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<DirectorReviewRow>();
  return (result.results ?? []).map((row) => publicReview(row, false));
}

export async function getMobileAdminDirectorReviewSummary(options?: {
  db?: D1Database;
  includeStaleStateTokens?: boolean;
}): Promise<MobileAdminDirectorReviewSummary> {
  const includeStaleStateTokens = options?.includeStaleStateTokens ?? false;
  let director: DirectorStatusData | null = null;
  try {
    director = await buildDirector();
    const db = options?.db ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null, director, includeStaleStateTokens),
      counts: await loadCounts(db),
      latestReviews: await loadLatestReviews(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load mobile Director review state.",
      director,
      includeStaleStateTokens,
    );
  }
}

export async function recordMobileAdminDirectorReview(
  input: RecordMobileAdminDirectorReviewInput,
): Promise<RecordMobileAdminDirectorReviewResult> {
  const summaryRedaction = redaction();
  const workstreamId = parseString(input.workstreamId, 160);
  const expectedDirectorGeneratedAt = parseString(input.expectedDirectorGeneratedAt, 50);
  const staleStateToken = parseString(input.staleStateToken, 320);
  const auditCorrelationId = parseString(input.auditCorrelationId, 180);
  const reviewNote = parseString(input.reviewNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!workstreamId || !expectedDirectorGeneratedAt || !staleStateToken || !auditCorrelationId || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Workstream id, expected Director source revision, stale-state token, audit correlation id, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== mobileAdminDirectorReviewConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact mobile Director review confirmation text is required before recording review state.",
      redaction: summaryRedaction,
    };
  }

  const director = await buildDirector();
  const directorRevision = directorReviewRevision(director);
  const workstream = director.workstreams.find((candidate) => candidate.id === workstreamId);
  if (!workstream) {
    return {
      ok: false,
      status: "unsupported_workstream",
      message: "The requested Director workstream is not available in the current Director status payload.",
      redaction: summaryRedaction,
      currentDirectorGeneratedAt: directorRevision,
    };
  }

  if (expectedDirectorGeneratedAt !== directorRevision) {
    return {
      ok: false,
      status: "stale_director_status",
      message: "The Director status payload changed before the mobile review was recorded.",
      redaction: summaryRedaction,
      currentDirectorGeneratedAt: directorRevision,
    };
  }

  const expectedStaleStateToken = mobileAdminDirectorReviewStaleStateToken({
    directorRevision,
    workstreamId,
  });
  if (staleStateToken !== expectedStaleStateToken) {
    return {
      ok: false,
      status: "stale_state_token",
      message: "The mobile Director review stale-state token changed before the review was recorded.",
      redaction: summaryRedaction,
    };
  }

  const { db } = await getRuntime();
  const staleStateTokenSha256 = await sha256Hex(staleStateToken);
  const confirmationTextSha256 = await sha256Hex(mobileAdminDirectorReviewConfirmationText);
  const reviewNoteSha256 = reviewNote ? await sha256Hex(reviewNote) : null;
  const actorUserId = input.actor.userId ?? "unknown-owner";
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const existing = await findReviewByIdempotency(db, idempotencyKey);

  if (existing) {
    const sameRequest =
      existing.workstream_id === workstream.id &&
      existing.expected_director_generated_at === expectedDirectorGeneratedAt &&
      existing.stale_state_token_sha256 === staleStateTokenSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256 &&
      existing.audit_correlation_id === auditCorrelationId &&
      existing.actor_user_id === actorUserId &&
      existing.actor_email_hash === actorEmailHash &&
      (existing.review_note_sha256 ?? null) === reviewNoteSha256 &&
      existing.production_admin_state_recorded === 1 &&
      existing.billing_mutation_created === 0 &&
      existing.push_notification_sent === 0 &&
      existing.distribution_state_changed === 0 &&
      existing.public_agent_write_created === 0;
    if (!sameRequest) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "The idempotency key is already associated with a different mobile Director review request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "mobile_admin_director_review_replayed",
      duplicate: true,
      review: publicReview(existing, true),
      redaction: summaryRedaction,
    };
  }

  const reviewId = `mobile-admin-director-review-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO mobile_admin_director_reviews (
        id, workstream_id, workstream_title, workstream_status, source_route,
        expected_director_generated_at, stale_state_token_sha256, confirmation_text_sha256,
        idempotency_key, audit_correlation_id, actor_user_id, actor_email_hash, review_note_sha256,
        production_admin_state_recorded, billing_mutation_created, push_notification_sent,
        distribution_state_changed, public_agent_write_created, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      reviewId,
      workstream.id,
      workstream.title,
      workstream.status,
      mobileAdminDirectorReviewSourceRoute,
      expectedDirectorGeneratedAt,
      staleStateTokenSha256,
      confirmationTextSha256,
      idempotencyKey,
      auditCorrelationId,
      actorUserId,
      actorEmailHash,
      reviewNoteSha256,
      JSON.stringify({
        issue: mobileAdminDirectorReviewIssue,
        sourceRoute: mobileAdminDirectorReviewSourceRoute,
        directorStatusId: director.id,
        directorGeneratedAt: director.generatedAt,
        directorRevision,
        productionAdminStateRecorded: true,
        billingMutationCreated: false,
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
      status: "director_review_not_created",
      message: "The mobile Director review could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "mobile_admin_director_review_recorded",
    duplicate: false,
    review: publicReview(review, false),
    redaction: summaryRedaction,
  };
}
