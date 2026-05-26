import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/analytics-events";
import { ownerSafeRequestText } from "@/lib/admin-surface-data";
import { mobileAdminContract, mobileAdminUpdatedAt, type MobileConfirmedAction } from "@/lib/mobile-admin";

export const mobileAdminActionIntentIssue = 414;
export const mobileAdminActionIntentStatus = "owner-mobile-action-intent-ready";
export const mobileAdminActionIntentApiRoute = "/api/mobile-admin/actions";

type Runtime = {
  db: D1Database;
};

type ActionIntentCountRow = {
  action_intents: number;
  review_agent_work_intents: number;
  commerce_change_intents: number;
  production_mutations_created_records: number;
  billing_mutations_created_records: number;
  push_notifications_sent_records: number;
  distribution_state_changed_records: number;
};

type ActionIntentRow = {
  id: string;
  action_id: string;
  action_title: string;
  action_surface: string;
  source_route: string;
  target_id: string | null;
  expected_contract_updated_at: string;
  stale_state_token_sha256: string;
  confirmation_text_sha256: string;
  idempotency_key: string;
  audit_correlation_id: string;
  actor_user_id: string;
  actor_email_hash: string;
  private_note_sha256: string | null;
  production_mutation_created: number;
  billing_mutation_created: number;
  push_notification_sent: number;
  distribution_state_changed: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

export type MobileAdminActionIntentPublic = {
  id: string;
  actionId: string;
  actionTitle: string;
  actionSurface: string;
  sourceRoute: string;
  targetId: string | null;
  expectedContractUpdatedAt: string;
  auditCorrelationId: string;
  privateNoteRecorded: boolean;
  productionMutationCreated: false;
  billingMutationCreated: false;
  pushNotificationSent: false;
  distributionStateChanged: false;
  createdAt: string | null;
  duplicate?: boolean;
};

type MobileAdminAllowedAction = {
  id: string;
  issue: number;
  title: string;
  status: string;
  surface: string;
  confirmationText: string;
  sourceRoutes: string[];
  requiredInputs: string[];
  staleStateTokenRequired: true;
  staleStateToken?: string;
  productionMutationCreated: false;
  billingMutationCreated: false;
  pushNotificationSent: false;
  distributionStateChanged: false;
};

export type MobileAdminActionIntentSummary = {
  id: "mobile-admin-action-intent-contract";
  status: typeof mobileAdminActionIntentStatus;
  issue: typeof mobileAdminActionIntentIssue;
  parentIssue: 13;
  apiRoute: typeof mobileAdminActionIntentApiRoute;
  contractUpdatedAt: typeof mobileAdminUpdatedAt;
  source: "d1" | "unavailable";
  loadError: string | null;
  auth: {
    required: true;
    boundary: "owner-session";
    sessionRoute: "/api/auth/[...all]";
    acceptedRoles: string[];
  };
  confirmation: {
    required: true;
    exactTextByAction: Record<string, string>;
  };
  allowedActions: MobileAdminAllowedAction[];
  counts: {
    actionIntents: number;
    reviewAgentWorkIntents: number;
    commerceChangeIntents: number;
    productionMutationsCreatedRecords: number;
    billingMutationsCreatedRecords: number;
    pushNotificationsSentRecords: number;
    distributionStateChangedRecords: number;
  };
  latestIntents: MobileAdminActionIntentPublic[];
  redaction: {
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    actorUserIdIncluded: false;
    privateNoteIncluded: false;
    idempotencyKeysIncluded: false;
    staleStateTokenIncludedInPublicSourceData: false;
    staleStateTokenHashIncluded: false;
    rawRowsIncluded: false;
    productionMutationCreated: false;
    billingMutationCreated: false;
    pushNotificationSent: false;
    distributionStateChanged: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type RecordMobileAdminActionIntentInput = {
  actionId?: unknown;
  sourceRoute?: unknown;
  targetId?: unknown;
  expectedContractUpdatedAt?: unknown;
  staleStateToken?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  auditCorrelationId?: unknown;
  privateNote?: unknown;
  actor: AdminIdentity;
};

type RecordMobileAdminActionIntentResult =
  | {
      ok: true;
      status: "mobile_admin_action_intent_recorded" | "mobile_admin_action_intent_replayed";
      duplicate: boolean;
      intent: MobileAdminActionIntentPublic;
      redaction: MobileAdminActionIntentSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_action"
        | "unsupported_source_route"
        | "confirmation_required"
        | "stale_contract_revision"
        | "stale_state_token"
        | "idempotency_conflict"
        | "action_intent_not_created";
      message: string;
      redaction: MobileAdminActionIntentSummary["redaction"];
      currentContractUpdatedAt?: string;
      allowedSourceRoutes?: string[];
    };

const sourceRoutesByActionId: Record<string, string[]> = {
  "mobile-confirm-review-agent-work": [
    "/admin/for-mark/source-data",
    "/admin/work-log/source-data",
    "/admin/director/source-data",
    "/agent-docs/source-data",
  ],
  "mobile-confirm-commerce-health-review": ["/commerce/source-data", "/features/source-data", "/roadmap/source-data"],
  "mobile-confirm-commerce-change": ["/commerce/source-data", "/features/source-data", "/roadmap/source-data"],
};

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function redaction(): MobileAdminActionIntentSummary["redaction"] {
  return {
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    actorUserIdIncluded: false,
    privateNoteIncluded: false,
    idempotencyKeysIncluded: false,
    staleStateTokenIncludedInPublicSourceData: false,
    staleStateTokenHashIncluded: false,
    rawRowsIncluded: false,
    productionMutationCreated: false,
    billingMutationCreated: false,
    pushNotificationSent: false,
    distributionStateChanged: false,
  };
}

function emptyCounts(): MobileAdminActionIntentSummary["counts"] {
  return {
    actionIntents: 0,
    reviewAgentWorkIntents: 0,
    commerceChangeIntents: 0,
    productionMutationsCreatedRecords: 0,
    billingMutationsCreatedRecords: 0,
    pushNotificationsSentRecords: 0,
    distributionStateChangedRecords: 0,
  };
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

function findAction(actionId: string | null) {
  if (!actionId) return null;
  return mobileAdminContract.confirmedActions.find((action) => action.id === actionId) ?? null;
}

export function mobileAdminActionStaleStateToken(action: Pick<MobileConfirmedAction, "id" | "issue">) {
  return `${mobileAdminContract.id}:${mobileAdminUpdatedAt}:${action.id}:issue-${action.issue}`;
}

function allowedActions(includeStaleStateTokens: boolean): MobileAdminAllowedAction[] {
  return mobileAdminContract.confirmedActions.map((action) => ({
    id: action.id,
    issue: action.issue,
    title: ownerSafeRequestText(action.title),
    status: action.status,
    surface: ownerSafeRequestText(action.surface),
    confirmationText: action.confirmationText,
    sourceRoutes: sourceRoutesByActionId[action.id] ?? [],
    requiredInputs: [
      "actionId",
      "sourceRoute",
      "expectedContractUpdatedAt",
      "staleStateToken",
      "confirmationText",
      "idempotencyKey",
      "auditCorrelationId",
    ],
    staleStateTokenRequired: true,
    ...(includeStaleStateTokens ? { staleStateToken: mobileAdminActionStaleStateToken(action) } : {}),
    productionMutationCreated: false,
    billingMutationCreated: false,
    pushNotificationSent: false,
    distributionStateChanged: false,
  }));
}

function confirmationTextByAction() {
  return Object.fromEntries(mobileAdminContract.confirmedActions.map((action) => [action.id, action.confirmationText]));
}

function emptySummary(
  source: MobileAdminActionIntentSummary["source"],
  loadError: string | null,
  includeStaleStateTokens: boolean,
): MobileAdminActionIntentSummary {
  return {
    id: "mobile-admin-action-intent-contract",
    status: mobileAdminActionIntentStatus,
    issue: mobileAdminActionIntentIssue,
    parentIssue: 13,
    apiRoute: mobileAdminActionIntentApiRoute,
    contractUpdatedAt: mobileAdminUpdatedAt,
    source,
    loadError,
    auth: {
      required: true,
      boundary: "owner-session",
      sessionRoute: "/api/auth/[...all]",
      acceptedRoles: mobileAdminContract.privateAuth.acceptedRoles,
    },
    confirmation: {
      required: true,
      exactTextByAction: confirmationTextByAction(),
    },
    allowedActions: allowedActions(includeStaleStateTokens),
    counts: emptyCounts(),
    latestIntents: [],
    redaction: redaction(),
    privateFieldsExcluded: [
      "actorEmail",
      "actorEmailHash",
      "actorUserId",
      "idempotencyKey",
      "privateNote",
      "privateNoteSha256",
      "confirmationTextSha256",
      "staleStateToken",
      "staleStateTokenSha256",
      "rawRows",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #414 lets verified owners record audit-only mobile action intents after exact confirmation, idempotency, contract revision checks, stale-state token checks, audit correlation, source-route allowlisting, and redaction. It creates no production admin mutation, billing mutation, push notification, distribution state change, private mobile row exposure, or direct public agent write.",
  };
}

function publicIntent(row: ActionIntentRow, duplicate = false): MobileAdminActionIntentPublic {
  return {
    id: row.id,
    actionId: row.action_id,
    actionTitle: ownerSafeRequestText(row.action_title),
    actionSurface: ownerSafeRequestText(row.action_surface),
    sourceRoute: row.source_route,
    targetId: row.target_id,
    expectedContractUpdatedAt: row.expected_contract_updated_at,
    auditCorrelationId: row.audit_correlation_id,
    privateNoteRecorded: Boolean(row.private_note_sha256),
    productionMutationCreated: false,
    billingMutationCreated: false,
    pushNotificationSent: false,
    distributionStateChanged: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
}

async function findIntentByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM mobile_admin_action_intents
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<ActionIntentRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS action_intents,
        SUM(CASE WHEN action_id = 'mobile-confirm-review-agent-work' THEN 1 ELSE 0 END) AS review_agent_work_intents,
        SUM(CASE WHEN action_id IN ('mobile-confirm-commerce-health-review', 'mobile-confirm-commerce-change') THEN 1 ELSE 0 END) AS commerce_change_intents,
        SUM(production_mutation_created) AS production_mutations_created_records,
        SUM(billing_mutation_created) AS billing_mutations_created_records,
        SUM(push_notification_sent) AS push_notifications_sent_records,
        SUM(distribution_state_changed) AS distribution_state_changed_records
       FROM mobile_admin_action_intents`,
    )
    .first<ActionIntentCountRow>();

  return {
    actionIntents: numberValue(row?.action_intents),
    reviewAgentWorkIntents: numberValue(row?.review_agent_work_intents),
    commerceChangeIntents: numberValue(row?.commerce_change_intents),
    productionMutationsCreatedRecords: numberValue(row?.production_mutations_created_records),
    billingMutationsCreatedRecords: numberValue(row?.billing_mutations_created_records),
    pushNotificationsSentRecords: numberValue(row?.push_notifications_sent_records),
    distributionStateChangedRecords: numberValue(row?.distribution_state_changed_records),
  };
}

async function loadLatestIntents(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM mobile_admin_action_intents
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<ActionIntentRow>();
  return (result.results ?? []).map((row) => publicIntent(row, false));
}

export async function getMobileAdminActionIntentSummary(options?: {
  db?: D1Database;
  includeStaleStateTokens?: boolean;
}): Promise<MobileAdminActionIntentSummary> {
  const includeStaleStateTokens = options?.includeStaleStateTokens ?? false;
  try {
    const db = options?.db ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null, includeStaleStateTokens),
      counts: await loadCounts(db),
      latestIntents: await loadLatestIntents(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load mobile action intents.",
      includeStaleStateTokens,
    );
  }
}

export async function recordMobileAdminActionIntent(
  input: RecordMobileAdminActionIntentInput,
): Promise<RecordMobileAdminActionIntentResult> {
  const summaryRedaction = redaction();
  const actionId = parseString(input.actionId);
  const sourceRoute = parseString(input.sourceRoute);
  const targetId = parseString(input.targetId, 180);
  const expectedContractUpdatedAt = parseString(input.expectedContractUpdatedAt, 40);
  const staleStateToken = parseString(input.staleStateToken, 260);
  const auditCorrelationId = parseString(input.auditCorrelationId, 180);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;
  const action = findAction(actionId);

  if (!action || !actionId) {
    return {
      ok: false,
      status: "unsupported_action",
      message: "A supported mobile confirmed action is required.",
      redaction: summaryRedaction,
    };
  }

  if (!sourceRoute || !expectedContractUpdatedAt || !staleStateToken || !auditCorrelationId || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Action id, source route, expected contract timestamp, stale-state token, audit correlation id, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== action.confirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact mobile confirmation text is required before recording this action intent.",
      redaction: summaryRedaction,
    };
  }

  if (expectedContractUpdatedAt !== mobileAdminUpdatedAt) {
    return {
      ok: false,
      status: "stale_contract_revision",
      message: "The mobile admin contract changed before the action intent was recorded.",
      redaction: summaryRedaction,
      currentContractUpdatedAt: mobileAdminUpdatedAt,
    };
  }

  const allowedSourceRoutes = sourceRoutesByActionId[action.id] ?? [];
  if (!allowedSourceRoutes.includes(sourceRoute)) {
    return {
      ok: false,
      status: "unsupported_source_route",
      message: "The selected source route is not allowed for this mobile action.",
      redaction: summaryRedaction,
      allowedSourceRoutes,
    };
  }

  const expectedStaleStateToken = mobileAdminActionStaleStateToken(action);
  if (staleStateToken !== expectedStaleStateToken) {
    return {
      ok: false,
      status: "stale_state_token",
      message: "The mobile action stale-state token changed before the action intent was recorded.",
      redaction: summaryRedaction,
    };
  }

  const { db } = await getRuntime();
  const staleStateTokenSha256 = await sha256Hex(staleStateToken);
  const confirmationTextSha256 = await sha256Hex(action.confirmationText);
  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const actorUserId = input.actor.userId ?? "unknown-owner";
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const existing = await findIntentByIdempotency(db, idempotencyKey);

  if (existing) {
    const sameRequest =
      existing.action_id === action.id &&
      existing.source_route === sourceRoute &&
      (existing.target_id ?? null) === targetId &&
      existing.expected_contract_updated_at === expectedContractUpdatedAt &&
      existing.stale_state_token_sha256 === staleStateTokenSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256 &&
      existing.audit_correlation_id === auditCorrelationId &&
      existing.actor_user_id === actorUserId &&
      existing.actor_email_hash === actorEmailHash &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.production_mutation_created === 0 &&
      existing.billing_mutation_created === 0 &&
      existing.push_notification_sent === 0 &&
      existing.distribution_state_changed === 0;
    if (!sameRequest) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "The idempotency key is already associated with a different mobile action intent request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "mobile_admin_action_intent_replayed",
      duplicate: true,
      intent: publicIntent(existing, true),
      redaction: summaryRedaction,
    };
  }

  const intentId = `mobile-admin-action-intent-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO mobile_admin_action_intents (
        id, action_id, action_title, action_surface, source_route, target_id,
        expected_contract_updated_at, stale_state_token_sha256, confirmation_text_sha256,
        idempotency_key, audit_correlation_id, actor_user_id, actor_email_hash, private_note_sha256,
        production_mutation_created, billing_mutation_created, push_notification_sent,
        distribution_state_changed, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      intentId,
      action.id,
      action.title,
      action.surface,
      sourceRoute,
      targetId,
      expectedContractUpdatedAt,
      staleStateTokenSha256,
      confirmationTextSha256,
      idempotencyKey,
      auditCorrelationId,
      actorUserId,
      actorEmailHash,
      privateNoteSha256,
      JSON.stringify({
        issue: mobileAdminActionIntentIssue,
        parentIssue: 13,
        contractId: mobileAdminContract.id,
        actionStatus: action.status,
        productionMutationCreated: false,
        billingMutationCreated: false,
        pushNotificationSent: false,
        distributionStateChanged: false,
        privateRowsIncluded: false,
      }),
    )
    .run();

  const intent = await findIntentByIdempotency(db, idempotencyKey);
  if (!intent) {
    return {
      ok: false,
      status: "action_intent_not_created",
      message: "The mobile action intent could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "mobile_admin_action_intent_recorded",
    duplicate: false,
    intent: publicIntent(intent, false),
    redaction: summaryRedaction,
  };
}
