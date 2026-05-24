import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/analytics-events";
import { mobileAdminPrivateRowsApiRoute, type MobileAdminPrivateRowsPublicRow } from "@/lib/mobile-admin-private-rows";

export const mobileAdminPrivateRowActionIssue = 428;
export const mobileAdminPrivateRowActionStatus = "owner-mobile-private-row-actions-ready";
export const mobileAdminPrivateRowActionApiRoute = "/api/mobile-admin/private-rows/actions";

type Runtime = {
  db: D1Database;
};

type PrivateRowForAction = {
  id: string;
  row_kind: string;
  title: string;
  summary: string;
  source_route: string;
  source_record_id: string | null;
  priority: string;
  read_state: string;
  requires_action: number;
  owner_only_note: string | null;
  private_payload_json: string | null;
  created_at: number;
  updated_at: number;
};

type PrivateRowActionRow = {
  id: string;
  row_id: string;
  action_id: string;
  action_title: string;
  previous_read_state: string;
  next_read_state: string;
  previous_requires_action: number;
  next_requires_action: number;
  expected_row_updated_at: string;
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

type PrivateRowActionCountRow = {
  private_row_actions: number;
  mark_read_actions: number;
  defer_actions: number;
  production_mutations_created_records: number;
  billing_mutations_created_records: number;
  push_notifications_sent_records: number;
  distribution_state_changed_records: number;
};

type PrivateRowActionDefinition = {
  id: "mobile-private-row-mark-read" | "mobile-private-row-defer";
  title: string;
  confirmationText: string;
  nextReadState: "read" | "deferred";
  nextRequiresAction: false;
};

export type MobileAdminPrivateRowActionAllowed = {
  id: PrivateRowActionDefinition["id"];
  issue: typeof mobileAdminPrivateRowActionIssue;
  title: string;
  status: typeof mobileAdminPrivateRowActionStatus;
  confirmationText: string;
  sourceRoute: typeof mobileAdminPrivateRowsApiRoute;
  requiredInputs: string[];
  staleStateTokenRequired: true;
  staleStateToken?: string;
  productionMutationCreated: false;
  billingMutationCreated: false;
  pushNotificationSent: false;
  distributionStateChanged: false;
};

export type MobileAdminPrivateRowActionPublic = {
  id: string;
  rowId: string;
  actionId: string;
  actionTitle: string;
  previousReadState: string;
  nextReadState: string;
  previousRequiresAction: boolean;
  nextRequiresAction: boolean;
  expectedRowUpdatedAt: string;
  auditCorrelationId: string;
  privateNoteRecorded: boolean;
  productionMutationCreated: false;
  billingMutationCreated: false;
  pushNotificationSent: false;
  distributionStateChanged: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type MobileAdminPrivateRowActionSummary = {
  id: "mobile-admin-private-row-action-contract";
  status: typeof mobileAdminPrivateRowActionStatus;
  issue: typeof mobileAdminPrivateRowActionIssue;
  parentIssue: 414;
  apiRoute: typeof mobileAdminPrivateRowActionApiRoute;
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
    exactTextByAction: Record<PrivateRowActionDefinition["id"], string>;
  };
  allowedActions: MobileAdminPrivateRowActionAllowed[];
  selectedRow: MobileAdminPrivateRowsPublicRow | null;
  counts: {
    privateRowActions: number;
    markReadActions: number;
    deferActions: number;
    productionMutationsCreatedRecords: number;
    billingMutationsCreatedRecords: number;
    pushNotificationsSentRecords: number;
    distributionStateChangedRecords: number;
  };
  latestActions: MobileAdminPrivateRowActionPublic[];
  redaction: {
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    actorUserIdIncluded: false;
    privateNoteIncluded: false;
    privatePayloadIncluded: false;
    ownerOnlyNoteIncluded: false;
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

type RecordMobileAdminPrivateRowActionInput = {
  rowId?: unknown;
  actionId?: unknown;
  expectedRowUpdatedAt?: unknown;
  staleStateToken?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  auditCorrelationId?: unknown;
  privateNote?: unknown;
  actor: AdminIdentity;
};

type RecordMobileAdminPrivateRowActionResult =
  | {
      ok: true;
      status: "mobile_admin_private_row_action_recorded" | "mobile_admin_private_row_action_replayed";
      duplicate: boolean;
      action: MobileAdminPrivateRowActionPublic;
      redaction: MobileAdminPrivateRowActionSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_action"
        | "row_not_found"
        | "confirmation_required"
        | "stale_private_row"
        | "stale_state_token"
        | "idempotency_conflict"
        | "private_row_action_not_created";
      message: string;
      redaction: MobileAdminPrivateRowActionSummary["redaction"];
      currentRowUpdatedAt?: string | null;
    };

const privateRowActionDefinitions: PrivateRowActionDefinition[] = [
  {
    id: "mobile-private-row-mark-read",
    title: "Mark private row read",
    confirmationText: "MARK PRIVATE ROW READ",
    nextReadState: "read",
    nextRequiresAction: false,
  },
  {
    id: "mobile-private-row-defer",
    title: "Defer private row",
    confirmationText: "DEFER PRIVATE ROW",
    nextReadState: "deferred",
    nextRequiresAction: false,
  },
];

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

function publicRow(row: PrivateRowForAction): MobileAdminPrivateRowsPublicRow {
  return {
    id: row.id,
    rowKind: row.row_kind,
    title: row.title,
    summary: row.summary,
    sourceRoute: row.source_route,
    sourceRecordId: row.source_record_id,
    priority: row.priority,
    readState: row.read_state,
    requiresAction: row.requires_action === 1,
    privateFieldsAvailable: Boolean(row.owner_only_note || row.private_payload_json),
    createdAt: createdAtIso(row.created_at),
    updatedAt: createdAtIso(row.updated_at),
  };
}

export function mobileAdminPrivateRowActionRedaction(): MobileAdminPrivateRowActionSummary["redaction"] {
  return {
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    actorUserIdIncluded: false,
    privateNoteIncluded: false,
    privatePayloadIncluded: false,
    ownerOnlyNoteIncluded: false,
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

function emptyCounts(): MobileAdminPrivateRowActionSummary["counts"] {
  return {
    privateRowActions: 0,
    markReadActions: 0,
    deferActions: 0,
    productionMutationsCreatedRecords: 0,
    billingMutationsCreatedRecords: 0,
    pushNotificationsSentRecords: 0,
    distributionStateChangedRecords: 0,
  };
}

function findAction(actionId: string | null) {
  if (!actionId) return null;
  return privateRowActionDefinitions.find((action) => action.id === actionId) ?? null;
}

export function mobileAdminPrivateRowActionStaleStateToken(row: Pick<PrivateRowForAction, "id" | "updated_at">) {
  return `${mobileAdminPrivateRowActionApiRoute}:${row.id}:updated-${row.updated_at}:issue-${mobileAdminPrivateRowActionIssue}`;
}

function allowedActions(
  includeStaleStateTokens: boolean,
  row: PrivateRowForAction | null,
): MobileAdminPrivateRowActionAllowed[] {
  return privateRowActionDefinitions.map((action) => ({
    id: action.id,
    issue: mobileAdminPrivateRowActionIssue,
    title: action.title,
    status: mobileAdminPrivateRowActionStatus,
    confirmationText: action.confirmationText,
    sourceRoute: mobileAdminPrivateRowsApiRoute,
    requiredInputs: [
      "rowId",
      "actionId",
      "expectedRowUpdatedAt",
      "staleStateToken",
      "confirmationText",
      "idempotencyKey",
      "auditCorrelationId",
    ],
    staleStateTokenRequired: true,
    ...(includeStaleStateTokens && row ? { staleStateToken: mobileAdminPrivateRowActionStaleStateToken(row) } : {}),
    productionMutationCreated: false,
    billingMutationCreated: false,
    pushNotificationSent: false,
    distributionStateChanged: false,
  }));
}

function confirmationTextByAction() {
  return Object.fromEntries(
    privateRowActionDefinitions.map((action) => [action.id, action.confirmationText]),
  ) as Record<PrivateRowActionDefinition["id"], string>;
}

function emptySummary(
  source: MobileAdminPrivateRowActionSummary["source"],
  loadError: string | null,
  includeStaleStateTokens: boolean,
  row: PrivateRowForAction | null,
): MobileAdminPrivateRowActionSummary {
  return {
    id: "mobile-admin-private-row-action-contract",
    status: mobileAdminPrivateRowActionStatus,
    issue: mobileAdminPrivateRowActionIssue,
    parentIssue: 414,
    apiRoute: mobileAdminPrivateRowActionApiRoute,
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
      exactTextByAction: confirmationTextByAction(),
    },
    allowedActions: allowedActions(includeStaleStateTokens, row),
    selectedRow: row ? publicRow(row) : null,
    counts: emptyCounts(),
    latestActions: [],
    redaction: mobileAdminPrivateRowActionRedaction(),
    privateFieldsExcluded: [
      "actorEmail",
      "actorEmailHash",
      "actorUserId",
      "idempotencyKey",
      "privateNote",
      "privateNoteSha256",
      "ownerOnlyNote",
      "privatePayload",
      "privatePayloadJson",
      "confirmationTextSha256",
      "staleStateToken",
      "staleStateTokenSha256",
      "rawRows",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #428 lets verified owners mark Mobile Admin private rows read or deferred after exact confirmation, idempotency, stale row revision checks, stale-state token checks, audit correlation, and redaction. It mutates only the private row workflow state; it creates no billing mutation, commerce mutation, publishing mutation, push notification, distribution state change, creator-speech action, moderation action, or public agent write.",
  };
}

function publicAction(row: PrivateRowActionRow, duplicate = false): MobileAdminPrivateRowActionPublic {
  return {
    id: row.id,
    rowId: row.row_id,
    actionId: row.action_id,
    actionTitle: row.action_title,
    previousReadState: row.previous_read_state,
    nextReadState: row.next_read_state,
    previousRequiresAction: row.previous_requires_action === 1,
    nextRequiresAction: row.next_requires_action === 1,
    expectedRowUpdatedAt: row.expected_row_updated_at,
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

async function findPrivateRow(db: D1Database, rowId: string) {
  return db
    .prepare(
      `SELECT *
       FROM mobile_admin_private_rows
       WHERE id = ?`,
    )
    .bind(rowId)
    .first<PrivateRowForAction>();
}

async function findActionByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM mobile_admin_private_row_actions
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<PrivateRowActionRow>();
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS private_row_actions,
        SUM(CASE WHEN action_id = 'mobile-private-row-mark-read' THEN 1 ELSE 0 END) AS mark_read_actions,
        SUM(CASE WHEN action_id = 'mobile-private-row-defer' THEN 1 ELSE 0 END) AS defer_actions,
        SUM(production_mutation_created) AS production_mutations_created_records,
        SUM(billing_mutation_created) AS billing_mutations_created_records,
        SUM(push_notification_sent) AS push_notifications_sent_records,
        SUM(distribution_state_changed) AS distribution_state_changed_records
       FROM mobile_admin_private_row_actions`,
    )
    .first<PrivateRowActionCountRow>();

  return {
    privateRowActions: numberValue(row?.private_row_actions),
    markReadActions: numberValue(row?.mark_read_actions),
    deferActions: numberValue(row?.defer_actions),
    productionMutationsCreatedRecords: numberValue(row?.production_mutations_created_records),
    billingMutationsCreatedRecords: numberValue(row?.billing_mutations_created_records),
    pushNotificationsSentRecords: numberValue(row?.push_notifications_sent_records),
    distributionStateChangedRecords: numberValue(row?.distribution_state_changed_records),
  };
}

async function loadLatestActions(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM mobile_admin_private_row_actions
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<PrivateRowActionRow>();
  return (result.results ?? []).map((row) => publicAction(row, false));
}

export async function getMobileAdminPrivateRowActionSummary(options?: {
  db?: D1Database;
  includeStaleStateTokens?: boolean;
  rowId?: string | null;
}): Promise<MobileAdminPrivateRowActionSummary> {
  const includeStaleStateTokens = options?.includeStaleStateTokens ?? false;
  try {
    const db = options?.db ?? (await getRuntime()).db;
    const row = options?.rowId ? await findPrivateRow(db, options.rowId) : null;
    return {
      ...emptySummary("d1", null, includeStaleStateTokens, row),
      counts: await loadCounts(db),
      latestActions: await loadLatestActions(db),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load mobile private row actions.",
      includeStaleStateTokens,
      null,
    );
  }
}

export async function recordMobileAdminPrivateRowAction(
  input: RecordMobileAdminPrivateRowActionInput,
): Promise<RecordMobileAdminPrivateRowActionResult> {
  const summaryRedaction = mobileAdminPrivateRowActionRedaction();
  const rowId = parseString(input.rowId, 180);
  const actionId = parseString(input.actionId, 180);
  const expectedRowUpdatedAt = parseString(input.expectedRowUpdatedAt, 50);
  const staleStateToken = parseString(input.staleStateToken, 260);
  const auditCorrelationId = parseString(input.auditCorrelationId, 180);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;
  const action = findAction(actionId);

  if (!action || !actionId) {
    return {
      ok: false,
      status: "unsupported_action",
      message: "A supported mobile private-row action is required.",
      redaction: summaryRedaction,
    };
  }

  if (!rowId || !expectedRowUpdatedAt || !staleStateToken || !auditCorrelationId || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "Row id, action id, expected row timestamp, stale-state token, audit correlation id, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== action.confirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact mobile private-row confirmation text is required before mutating row workflow state.",
      redaction: summaryRedaction,
    };
  }

  const { db } = await getRuntime();
  const staleStateTokenSha256 = await sha256Hex(staleStateToken);
  const confirmationTextSha256 = await sha256Hex(action.confirmationText);
  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const actorUserId = input.actor.userId ?? "unknown-owner";
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const existing = await findActionByIdempotency(db, idempotencyKey);

  if (existing) {
    const sameRequest =
      existing.row_id === rowId &&
      existing.action_id === action.id &&
      existing.expected_row_updated_at === expectedRowUpdatedAt &&
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
        message: "The idempotency key is already associated with a different mobile private-row action request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "mobile_admin_private_row_action_replayed",
      duplicate: true,
      action: publicAction(existing, true),
      redaction: summaryRedaction,
    };
  }

  const row = await findPrivateRow(db, rowId);
  if (!row) {
    return {
      ok: false,
      status: "row_not_found",
      message: "The requested mobile private row does not exist.",
      redaction: summaryRedaction,
    };
  }

  const currentRowUpdatedAt = createdAtIso(row.updated_at);
  if (expectedRowUpdatedAt !== currentRowUpdatedAt) {
    return {
      ok: false,
      status: "stale_private_row",
      message: "The mobile private row changed before the action was recorded.",
      redaction: summaryRedaction,
      currentRowUpdatedAt,
    };
  }

  const expectedStaleStateToken = mobileAdminPrivateRowActionStaleStateToken(row);
  if (staleStateToken !== expectedStaleStateToken) {
    return {
      ok: false,
      status: "stale_state_token",
      message: "The mobile private row stale-state token changed before the action was recorded.",
      redaction: summaryRedaction,
    };
  }

  const privateRowActionId = `mobile-admin-private-row-action-${crypto.randomUUID()}`;
  const previousRequiresAction = row.requires_action === 1 ? 1 : 0;
  const nextRequiresAction = action.nextRequiresAction ? 1 : 0;
  await db
    .prepare(
      `INSERT INTO mobile_admin_private_row_actions (
        id, row_id, action_id, action_title, previous_read_state, next_read_state,
        previous_requires_action, next_requires_action, expected_row_updated_at,
        stale_state_token_sha256, confirmation_text_sha256, idempotency_key,
        audit_correlation_id, actor_user_id, actor_email_hash, private_note_sha256,
        production_mutation_created, billing_mutation_created, push_notification_sent,
        distribution_state_changed, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      privateRowActionId,
      row.id,
      action.id,
      action.title,
      row.read_state,
      action.nextReadState,
      previousRequiresAction,
      nextRequiresAction,
      expectedRowUpdatedAt,
      staleStateTokenSha256,
      confirmationTextSha256,
      idempotencyKey,
      auditCorrelationId,
      actorUserId,
      actorEmailHash,
      privateNoteSha256,
      JSON.stringify({
        issue: mobileAdminPrivateRowActionIssue,
        parentIssue: 414,
        sourceRoute: mobileAdminPrivateRowsApiRoute,
        productionMutationCreated: false,
        billingMutationCreated: false,
        pushNotificationSent: false,
        distributionStateChanged: false,
        privatePayloadIncluded: false,
        ownerOnlyNoteIncluded: false,
      }),
    )
    .run();

  await db
    .prepare(
      `UPDATE mobile_admin_private_rows
       SET read_state = ?, requires_action = ?, updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(action.nextReadState, nextRequiresAction, row.id)
    .run();

  const rowAction = await findActionByIdempotency(db, idempotencyKey);
  if (!rowAction) {
    return {
      ok: false,
      status: "private_row_action_not_created",
      message: "The mobile private-row action could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "mobile_admin_private_row_action_recorded",
    duplicate: false,
    action: publicAction(rowAction, false),
    redaction: summaryRedaction,
  };
}
