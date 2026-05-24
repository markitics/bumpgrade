import { getCloudflareContext } from "@opennextjs/cloudflare";

export const mobileAdminPrivateRowsIssue = 414;
export const mobileAdminPrivateRowsStatus = "owner-mobile-private-rows-ready";
export const mobileAdminPrivateRowsApiRoute = "/api/mobile-admin/private-rows";

type Runtime = {
  db: D1Database;
};

type PrivateRowsCountRow = {
  private_rows: number;
  requires_action_rows: number;
  unread_rows: number;
  owner_only_notes: number;
  private_payload_rows: number;
};

type PrivateRow = {
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

export type MobileAdminPrivateRowsPublicRow = {
  id: string;
  rowKind: string;
  title: string;
  summary: string;
  sourceRoute: string;
  sourceRecordId: string | null;
  priority: string;
  readState: string;
  requiresAction: boolean;
  privateFieldsAvailable: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type MobileAdminPrivateRowsOwnerRow = MobileAdminPrivateRowsPublicRow & {
  ownerOnlyNote: string | null;
  privatePayload: Record<string, unknown> | null;
};

export type MobileAdminPrivateRowsSummary = {
  id: "mobile-admin-private-rows-contract";
  status: typeof mobileAdminPrivateRowsStatus;
  issue: typeof mobileAdminPrivateRowsIssue;
  parentIssue: 13;
  apiRoute: typeof mobileAdminPrivateRowsApiRoute;
  source: "d1" | "unavailable";
  loadError: string | null;
  auth: {
    required: true;
    boundary: "owner-session";
    sessionRoute: "/api/auth/[...all]";
    acceptedRoles: ["owner"];
  };
  counts: {
    privateRows: number;
    requiresActionRows: number;
    unreadRows: number;
    ownerOnlyNotes: number;
    privatePayloadRows: number;
  };
  latestRows: MobileAdminPrivateRowsPublicRow[];
  redaction: {
    privateRowsIncludedInPublicSourceData: false;
    ownerOnlyNotesIncludedInPublicSourceData: false;
    privatePayloadIncludedInPublicSourceData: false;
    ownerEmailValuesIncluded: false;
    sessionIdentifiersIncluded: false;
    cookiesIncluded: false;
    tokensIncluded: false;
    rawRowsIncluded: false;
  };
  privateFieldsExcluded: string[];
  readBoundary: string;
};

export type MobileAdminPrivateRowsOwnerResponse = MobileAdminPrivateRowsSummary & {
  rows: MobileAdminPrivateRowsOwnerRow[];
};

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function numberValue(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

export function mobileAdminPrivateRowsRedaction(): MobileAdminPrivateRowsSummary["redaction"] {
  return {
    privateRowsIncludedInPublicSourceData: false,
    ownerOnlyNotesIncludedInPublicSourceData: false,
    privatePayloadIncludedInPublicSourceData: false,
    ownerEmailValuesIncluded: false,
    sessionIdentifiersIncluded: false,
    cookiesIncluded: false,
    tokensIncluded: false,
    rawRowsIncluded: false,
  };
}

function emptyCounts(): MobileAdminPrivateRowsSummary["counts"] {
  return {
    privateRows: 0,
    requiresActionRows: 0,
    unreadRows: 0,
    ownerOnlyNotes: 0,
    privatePayloadRows: 0,
  };
}

function emptySummary(source: MobileAdminPrivateRowsSummary["source"], loadError: string | null): MobileAdminPrivateRowsSummary {
  return {
    id: "mobile-admin-private-rows-contract",
    status: mobileAdminPrivateRowsStatus,
    issue: mobileAdminPrivateRowsIssue,
    parentIssue: 13,
    apiRoute: mobileAdminPrivateRowsApiRoute,
    source,
    loadError,
    auth: {
      required: true,
      boundary: "owner-session",
      sessionRoute: "/api/auth/[...all]",
      acceptedRoles: ["owner"],
    },
    counts: emptyCounts(),
    latestRows: [],
    redaction: mobileAdminPrivateRowsRedaction(),
    privateFieldsExcluded: [
      "ownerOnlyNote",
      "privatePayload",
      "privatePayloadJson",
      "rawRows",
      "ownerEmail",
      "sessionId",
      "cookie",
      "token",
    ],
    readBoundary:
      "Issue #414 lets verified owners inspect Mobile Admin private rows through an owner-session-only API. Public mobile source-data exposes route, status, counts, public row labels, and redaction flags only; it does not expose owner-only notes, private payload JSON, owner email values, session IDs, cookies, tokens, or raw rows.",
  };
}

function publicRow(row: PrivateRow): MobileAdminPrivateRowsPublicRow {
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

function ownerPayload(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function ownerRow(row: PrivateRow): MobileAdminPrivateRowsOwnerRow {
  return {
    ...publicRow(row),
    ownerOnlyNote: row.owner_only_note,
    privatePayload: ownerPayload(row.private_payload_json),
  };
}

async function loadCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS private_rows,
        SUM(CASE WHEN requires_action = 1 THEN 1 ELSE 0 END) AS requires_action_rows,
        SUM(CASE WHEN read_state = 'unread' THEN 1 ELSE 0 END) AS unread_rows,
        SUM(CASE WHEN owner_only_note IS NOT NULL THEN 1 ELSE 0 END) AS owner_only_notes,
        SUM(CASE WHEN private_payload_json IS NOT NULL THEN 1 ELSE 0 END) AS private_payload_rows
       FROM mobile_admin_private_rows`,
    )
    .first<PrivateRowsCountRow>();

  return {
    privateRows: numberValue(row?.private_rows),
    requiresActionRows: numberValue(row?.requires_action_rows),
    unreadRows: numberValue(row?.unread_rows),
    ownerOnlyNotes: numberValue(row?.owner_only_notes),
    privatePayloadRows: numberValue(row?.private_payload_rows),
  };
}

async function loadRows(db: D1Database, limit: number) {
  const result = await db
    .prepare(
      `SELECT *
       FROM mobile_admin_private_rows
       ORDER BY requires_action DESC, updated_at DESC, created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<PrivateRow>();
  return result.results ?? [];
}

export async function getMobileAdminPrivateRowsSummary(options?: { db?: D1Database }): Promise<MobileAdminPrivateRowsSummary> {
  try {
    const db = options?.db ?? (await getRuntime()).db;
    const rows = await loadRows(db, 5);
    return {
      ...emptySummary("d1", null),
      counts: await loadCounts(db),
      latestRows: rows.map(publicRow),
    };
  } catch (error) {
    return emptySummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load mobile private rows.",
    );
  }
}

export async function getMobileAdminPrivateRowsOwnerResponse(options?: {
  db?: D1Database;
  limit?: number;
}): Promise<MobileAdminPrivateRowsOwnerResponse> {
  const db = options?.db ?? (await getRuntime()).db;
  const rows = await loadRows(db, options?.limit ?? 20);
  return {
    ...(await getMobileAdminPrivateRowsSummary({ db })),
    rows: rows.map(ownerRow),
  };
}
