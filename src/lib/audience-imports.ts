import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { audienceAutomationWorkspace } from "@/lib/audience-automation";
import { sha256Hex } from "@/lib/audience-opt-in";

export const audienceImportIntentIssue = 253;
export const audienceImportIntentStatus = "audience-import-intents-ready";
export const audienceImportIntentUpdatedAt = "2026-05-21";
export const audienceImportIntentApiRoute = "/api/admin/audience/import-intents";
export const audienceImportIntentConfirmationText = "Record Bumpgrade audience import intent";
export const audienceImportPreflightIssue = 259;
export const audienceImportPreflightStatus = "audience-import-preflights-ready";
export const audienceImportPreflightUpdatedAt = "2026-05-21";
export const audienceImportPreflightApiRoute = "/api/admin/audience/import-preflights";
export const audienceImportPreflightConfirmationText = "Record Bumpgrade audience import preflight";

export const audienceImportSourceKinds = ["csv_upload", "kit_export", "manual_paste", "api_migration"] as const;

export type AudienceImportSourceKind = (typeof audienceImportSourceKinds)[number];

export const audienceImportSourceLabels: Record<AudienceImportSourceKind, string> = {
  csv_upload: "CSV upload",
  kit_export: "Kit export",
  manual_paste: "Manual paste",
  api_migration: "API migration",
};

type AudienceRuntime = {
  db: D1Database;
};

type AudienceImportIntentRow = {
  id: string;
  workspace_id: string;
  status: string;
  intent_kind: string;
  source_kind: AudienceImportSourceKind;
  source_label: string;
  expected_workspace_revision_id: string;
  expected_workspace_status: string;
  estimated_contact_count: number | string;
  estimated_new_contact_count: number | string;
  estimated_update_count: number | string;
  estimated_suppressed_count: number | string;
  idempotency_key: string;
  actor_user_id: string;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  import_rows_stored: number | string;
  raw_emails_stored: number | string;
  sequence_enrollments_created: number | string;
  email_delivery_enabled: number | string;
  created_at: number | string;
};

type AudienceImportPreflightRow = {
  id: string;
  workspace_id: string;
  import_intent_id: string;
  status: string;
  preflight_kind: string;
  source_kind: AudienceImportSourceKind;
  expected_import_intent_source_label: string;
  expected_workspace_revision_id: string;
  expected_workspace_status: string;
  total_contacts_checked: number | string;
  eligible_new_contact_count: number | string;
  eligible_update_count: number | string;
  duplicate_count: number | string;
  suppressed_count: number | string;
  missing_consent_count: number | string;
  malformed_count: number | string;
  lawful_basis_count: number | string;
  idempotency_key: string;
  actor_user_id: string;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  import_rows_stored: number | string;
  raw_emails_stored: number | string;
  subscriber_rows_created: number | string;
  sequence_enrollments_created: number | string;
  email_delivery_enabled: number | string;
  export_enabled: number | string;
  created_at: number | string;
};

export type AudienceImportIntentPublic = {
  id: string;
  workspaceId: string;
  status: string;
  intentKind: string;
  sourceKind: AudienceImportSourceKind;
  sourceLabel: string;
  expectedWorkspaceRevisionId: string;
  expectedWorkspaceStatus: string;
  estimatedContactCount: number;
  estimatedNewContactCount: number;
  estimatedUpdateCount: number;
  estimatedSuppressedCount: number;
  privateNoteRecorded: boolean;
  importRowsStored: false;
  rawEmailsStored: false;
  sequenceEnrollmentsCreated: false;
  emailDeliveryEnabled: false;
  duplicate: boolean;
  createdAt: string | null;
};

export type AudienceImportPreflightPublic = {
  id: string;
  workspaceId: string;
  importIntentId: string;
  status: string;
  preflightKind: string;
  sourceKind: AudienceImportSourceKind;
  expectedImportIntentSourceLabel: string;
  expectedWorkspaceRevisionId: string;
  expectedWorkspaceStatus: string;
  totalContactsChecked: number;
  eligibleNewContactCount: number;
  eligibleUpdateCount: number;
  duplicateCount: number;
  suppressedCount: number;
  missingConsentCount: number;
  malformedCount: number;
  lawfulBasisCount: number;
  privateNoteRecorded: boolean;
  importRowsStored: false;
  rawEmailsStored: false;
  subscriberRowsCreated: false;
  sequenceEnrollmentsCreated: false;
  emailDeliveryEnabled: false;
  exportEnabled: false;
  duplicate: boolean;
  createdAt: string | null;
};

export type AudienceImportIntentSummary = {
  id: "audience-import-intent-contract";
  status: typeof audienceImportIntentStatus;
  issue: typeof audienceImportIntentIssue;
  parentIssue: 17;
  apiRoute: typeof audienceImportIntentApiRoute;
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  workspace: {
    id: string;
    title: string;
    status: string;
    revisionId: string;
  };
  confirmation: {
    required: true;
    text: typeof audienceImportIntentConfirmationText;
  };
  sourceKinds: typeof audienceImportSourceKinds;
  counts: {
    importIntents: number;
    ownerConfirmedIntents: number;
    estimatedContacts: number;
    estimatedNewContacts: number;
    estimatedUpdates: number;
    estimatedSuppressions: number;
    importRowsStoredRecords: number;
    rawEmailsStoredRecords: number;
    sequenceEnrollmentsCreatedRecords: number;
    emailDeliveryEnabledRecords: number;
  };
  latestIntents: AudienceImportIntentPublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawEmailsIncluded: false;
    importRowsIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type AudienceImportPreflightSummary = {
  id: "audience-import-preflight-contract";
  status: typeof audienceImportPreflightStatus;
  issue: typeof audienceImportPreflightIssue;
  parentIssue: 17;
  apiRoute: typeof audienceImportPreflightApiRoute;
  ownerRoute: "/admin/audience";
  source: "d1" | "unavailable";
  loadError: string | null;
  workspace: {
    id: string;
    title: string;
    status: string;
    revisionId: string;
  };
  confirmation: {
    required: true;
    text: typeof audienceImportPreflightConfirmationText;
  };
  counts: {
    importPreflights: number;
    ownerConfirmedPreflights: number;
    totalContactsChecked: number;
    eligibleNewContacts: number;
    eligibleUpdates: number;
    duplicates: number;
    suppressed: number;
    missingConsent: number;
    malformed: number;
    lawfulBasisContacts: number;
    importRowsStoredRecords: number;
    rawEmailsStoredRecords: number;
    subscriberRowsCreatedRecords: number;
    sequenceEnrollmentsCreatedRecords: number;
    emailDeliveryEnabledRecords: number;
    exportEnabledRecords: number;
  };
  latestPreflights: AudienceImportPreflightPublic[];
  redaction: {
    privateContactDataIncluded: false;
    rawEmailsIncluded: false;
    importRowsIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    subscriberRowsCreated: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
    exportEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateAudienceImportIntentInput = {
  workspaceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedWorkspaceStatus?: unknown;
  sourceKind?: unknown;
  sourceLabel?: unknown;
  estimatedContactCount?: unknown;
  estimatedNewContactCount?: unknown;
  estimatedUpdateCount?: unknown;
  estimatedSuppressedCount?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateAudienceImportPreflightInput = {
  workspaceId?: unknown;
  importIntentId?: unknown;
  expectedImportIntentSourceLabel?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedWorkspaceStatus?: unknown;
  totalContactsChecked?: unknown;
  eligibleNewContactCount?: unknown;
  eligibleUpdateCount?: unknown;
  duplicateCount?: unknown;
  suppressedCount?: unknown;
  missingConsentCount?: unknown;
  malformedCount?: unknown;
  lawfulBasisCount?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateAudienceImportIntentResult =
  | {
      ok: true;
      status: "audience_import_intent_recorded" | "audience_import_intent_replayed";
      duplicate: boolean;
      intent: AudienceImportIntentPublic;
      redaction: AudienceImportIntentSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "workspace_not_found"
        | "stale_workspace_revision"
        | "stale_workspace_status"
        | "idempotency_conflict"
        | "intent_not_created";
      message: string;
      redaction: AudienceImportIntentSummary["redaction"];
      currentWorkspaceRevisionId?: string;
      currentWorkspaceStatus?: string;
    };

type CreateAudienceImportPreflightResult =
  | {
      ok: true;
      status: "audience_import_preflight_recorded" | "audience_import_preflight_replayed";
      duplicate: boolean;
      preflight: AudienceImportPreflightPublic;
      redaction: AudienceImportPreflightSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "workspace_not_found"
        | "stale_workspace_revision"
        | "stale_workspace_status"
        | "import_intent_not_found"
        | "import_intent_mismatch"
        | "aggregate_count_mismatch"
        | "idempotency_conflict"
        | "preflight_not_created";
      message: string;
      redaction: AudienceImportPreflightSummary["redaction"];
      currentWorkspaceRevisionId?: string;
      currentWorkspaceStatus?: string;
    };

async function getRuntime(): Promise<AudienceRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function timestampValue(value: number | string | null | undefined) {
  const seconds = numberValue(value);
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function parseString(value: unknown, maxLength = 160) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

function parseInteger(value: unknown) {
  const parsed = typeof value === "string" && value.trim() ? Number(value) : Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function parseSourceKind(value: unknown): AudienceImportSourceKind | null {
  if (typeof value !== "string") return null;
  return audienceImportSourceKinds.includes(value as AudienceImportSourceKind)
    ? (value as AudienceImportSourceKind)
    : null;
}

function emptyImportIntentSummary(
  source: AudienceImportIntentSummary["source"],
  loadError: string | null,
): AudienceImportIntentSummary {
  return {
    id: "audience-import-intent-contract",
    status: audienceImportIntentStatus,
    issue: audienceImportIntentIssue,
    parentIssue: 17,
    apiRoute: audienceImportIntentApiRoute,
    ownerRoute: "/admin/audience",
    source,
    loadError,
    workspace: {
      id: audienceAutomationWorkspace.id,
      title: audienceAutomationWorkspace.title,
      status: audienceAutomationWorkspace.status,
      revisionId: audienceAutomationWorkspace.revisionId,
    },
    confirmation: {
      required: true,
      text: audienceImportIntentConfirmationText,
    },
    sourceKinds: audienceImportSourceKinds,
    counts: {
      importIntents: 0,
      ownerConfirmedIntents: 0,
      estimatedContacts: 0,
      estimatedNewContacts: 0,
      estimatedUpdates: 0,
      estimatedSuppressions: 0,
      importRowsStoredRecords: 0,
      rawEmailsStoredRecords: 0,
      sequenceEnrollmentsCreatedRecords: 0,
      emailDeliveryEnabledRecords: 0,
    },
    latestIntents: [],
    redaction: {
      privateContactDataIncluded: false,
      rawEmailsIncluded: false,
      importRowsIncluded: false,
      actorEmailIncluded: false,
      actorEmailHashIncluded: false,
      privateNoteIncluded: false,
      sequenceEnrollmentsCreated: false,
      emailDeliveryEnabled: false,
    },
    privateFieldsExcluded: [
      "rawContactRows",
      "rawEmails",
      "rawNames",
      "csvBody",
      "providerPayload",
      "actorEmail",
      "actorEmailHash",
      "privateNote",
      "privateNoteSha256",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #253 lets verified owners record non-destructive audience import intent metadata after exact confirmation, idempotency, and workspace stale-state checks. It does not import contacts, store raw contact rows, store raw emails, create subscribers, create sequence enrollments, send email, expose actor identity, export private data, or authorize direct public agent subscriber writes.",
  };
}

function emptyImportPreflightSummary(
  source: AudienceImportPreflightSummary["source"],
  loadError: string | null,
): AudienceImportPreflightSummary {
  return {
    id: "audience-import-preflight-contract",
    status: audienceImportPreflightStatus,
    issue: audienceImportPreflightIssue,
    parentIssue: 17,
    apiRoute: audienceImportPreflightApiRoute,
    ownerRoute: "/admin/audience",
    source,
    loadError,
    workspace: {
      id: audienceAutomationWorkspace.id,
      title: audienceAutomationWorkspace.title,
      status: audienceAutomationWorkspace.status,
      revisionId: audienceAutomationWorkspace.revisionId,
    },
    confirmation: {
      required: true,
      text: audienceImportPreflightConfirmationText,
    },
    counts: {
      importPreflights: 0,
      ownerConfirmedPreflights: 0,
      totalContactsChecked: 0,
      eligibleNewContacts: 0,
      eligibleUpdates: 0,
      duplicates: 0,
      suppressed: 0,
      missingConsent: 0,
      malformed: 0,
      lawfulBasisContacts: 0,
      importRowsStoredRecords: 0,
      rawEmailsStoredRecords: 0,
      subscriberRowsCreatedRecords: 0,
      sequenceEnrollmentsCreatedRecords: 0,
      emailDeliveryEnabledRecords: 0,
      exportEnabledRecords: 0,
    },
    latestPreflights: [],
    redaction: {
      privateContactDataIncluded: false,
      rawEmailsIncluded: false,
      importRowsIncluded: false,
      actorEmailIncluded: false,
      actorEmailHashIncluded: false,
      privateNoteIncluded: false,
      subscriberRowsCreated: false,
      sequenceEnrollmentsCreated: false,
      emailDeliveryEnabled: false,
      exportEnabled: false,
    },
    privateFieldsExcluded: [
      "rawContactRows",
      "rawEmails",
      "rawNames",
      "csvBody",
      "providerPayload",
      "actorEmail",
      "actorEmailHash",
      "privateNote",
      "privateNoteSha256",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #259 lets verified owners record aggregate audience import preflight evidence after exact confirmation, idempotency, workspace stale-state checks, and selected import-intent source checks. It does not store raw contact rows, store raw emails, create subscriber rows, create sequence enrollments, enable delivery, export private data, expose actor identity, or authorize public agent subscriber writes.",
  };
}

function publicImportIntent(row: AudienceImportIntentRow, duplicate: boolean): AudienceImportIntentPublic {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    status: row.status,
    intentKind: row.intent_kind,
    sourceKind: row.source_kind,
    sourceLabel: row.source_label,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedWorkspaceStatus: row.expected_workspace_status,
    estimatedContactCount: numberValue(row.estimated_contact_count),
    estimatedNewContactCount: numberValue(row.estimated_new_contact_count),
    estimatedUpdateCount: numberValue(row.estimated_update_count),
    estimatedSuppressedCount: numberValue(row.estimated_suppressed_count),
    privateNoteRecorded: Boolean(row.private_note_sha256),
    importRowsStored: false,
    rawEmailsStored: false,
    sequenceEnrollmentsCreated: false,
    emailDeliveryEnabled: false,
    duplicate,
    createdAt: timestampValue(row.created_at),
  };
}

function publicImportPreflight(row: AudienceImportPreflightRow, duplicate: boolean): AudienceImportPreflightPublic {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    importIntentId: row.import_intent_id,
    status: row.status,
    preflightKind: row.preflight_kind,
    sourceKind: row.source_kind,
    expectedImportIntentSourceLabel: row.expected_import_intent_source_label,
    expectedWorkspaceRevisionId: row.expected_workspace_revision_id,
    expectedWorkspaceStatus: row.expected_workspace_status,
    totalContactsChecked: numberValue(row.total_contacts_checked),
    eligibleNewContactCount: numberValue(row.eligible_new_contact_count),
    eligibleUpdateCount: numberValue(row.eligible_update_count),
    duplicateCount: numberValue(row.duplicate_count),
    suppressedCount: numberValue(row.suppressed_count),
    missingConsentCount: numberValue(row.missing_consent_count),
    malformedCount: numberValue(row.malformed_count),
    lawfulBasisCount: numberValue(row.lawful_basis_count),
    privateNoteRecorded: Boolean(row.private_note_sha256),
    importRowsStored: false,
    rawEmailsStored: false,
    subscriberRowsCreated: false,
    sequenceEnrollmentsCreated: false,
    emailDeliveryEnabled: false,
    exportEnabled: false,
    duplicate,
    createdAt: timestampValue(row.created_at),
  };
}

async function findImportIntentByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, workspace_id, status, intent_kind, source_kind, source_label,
        expected_workspace_revision_id, expected_workspace_status,
        estimated_contact_count, estimated_new_contact_count, estimated_update_count,
        estimated_suppressed_count, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, import_rows_stored, raw_emails_stored,
        sequence_enrollments_created, email_delivery_enabled, created_at
      FROM audience_import_intents
      WHERE idempotency_key = ?
      LIMIT 1`,
    )
    .bind(idempotencyKey)
    .first<AudienceImportIntentRow>();
}

async function findImportIntentById(db: D1Database, importIntentId: string) {
  return db
    .prepare(
      `SELECT
        id, workspace_id, status, intent_kind, source_kind, source_label,
        expected_workspace_revision_id, expected_workspace_status,
        estimated_contact_count, estimated_new_contact_count, estimated_update_count,
        estimated_suppressed_count, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, import_rows_stored, raw_emails_stored,
        sequence_enrollments_created, email_delivery_enabled, created_at
      FROM audience_import_intents
      WHERE id = ?
      LIMIT 1`,
    )
    .bind(importIntentId)
    .first<AudienceImportIntentRow>();
}

async function findImportPreflightByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        id, workspace_id, import_intent_id, status, preflight_kind, source_kind,
        expected_import_intent_source_label, expected_workspace_revision_id, expected_workspace_status,
        total_contacts_checked, eligible_new_contact_count, eligible_update_count, duplicate_count,
        suppressed_count, missing_consent_count, malformed_count, lawful_basis_count,
        idempotency_key, actor_user_id, actor_email_hash, private_note_sha256, confirmation_text_sha256,
        import_rows_stored, raw_emails_stored, subscriber_rows_created, sequence_enrollments_created,
        email_delivery_enabled, export_enabled, created_at
      FROM audience_import_preflights
      WHERE idempotency_key = ?
      LIMIT 1`,
    )
    .bind(idempotencyKey)
    .first<AudienceImportPreflightRow>();
}

export async function getAudienceImportIntentSummary(): Promise<AudienceImportIntentSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS import_intent_count,
          SUM(CASE WHEN intent_kind = 'owner_confirmed_dry_run' THEN 1 ELSE 0 END) AS owner_confirmed_intent_count,
          COALESCE(SUM(estimated_contact_count), 0) AS estimated_contact_count,
          COALESCE(SUM(estimated_new_contact_count), 0) AS estimated_new_contact_count,
          COALESCE(SUM(estimated_update_count), 0) AS estimated_update_count,
          COALESCE(SUM(estimated_suppressed_count), 0) AS estimated_suppressed_count,
          SUM(CASE WHEN import_rows_stored = 1 THEN 1 ELSE 0 END) AS import_rows_stored_count,
          SUM(CASE WHEN raw_emails_stored = 1 THEN 1 ELSE 0 END) AS raw_emails_stored_count,
          SUM(CASE WHEN sequence_enrollments_created = 1 THEN 1 ELSE 0 END) AS sequence_enrollments_created_count,
          SUM(CASE WHEN email_delivery_enabled = 1 THEN 1 ELSE 0 END) AS email_delivery_enabled_count
        FROM audience_import_intents`,
      )
      .first<{
        import_intent_count: number | string | null;
        owner_confirmed_intent_count: number | string | null;
        estimated_contact_count: number | string | null;
        estimated_new_contact_count: number | string | null;
        estimated_update_count: number | string | null;
        estimated_suppressed_count: number | string | null;
        import_rows_stored_count: number | string | null;
        raw_emails_stored_count: number | string | null;
        sequence_enrollments_created_count: number | string | null;
        email_delivery_enabled_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, workspace_id, status, intent_kind, source_kind, source_label,
          expected_workspace_revision_id, expected_workspace_status,
          estimated_contact_count, estimated_new_contact_count, estimated_update_count,
          estimated_suppressed_count, idempotency_key, actor_user_id, actor_email_hash,
          private_note_sha256, confirmation_text_sha256, import_rows_stored, raw_emails_stored,
          sequence_enrollments_created, email_delivery_enabled, created_at
        FROM audience_import_intents
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<AudienceImportIntentRow>();

    return {
      ...emptyImportIntentSummary("d1", null),
      counts: {
        importIntents: numberValue(counts?.import_intent_count),
        ownerConfirmedIntents: numberValue(counts?.owner_confirmed_intent_count),
        estimatedContacts: numberValue(counts?.estimated_contact_count),
        estimatedNewContacts: numberValue(counts?.estimated_new_contact_count),
        estimatedUpdates: numberValue(counts?.estimated_update_count),
        estimatedSuppressions: numberValue(counts?.estimated_suppressed_count),
        importRowsStoredRecords: numberValue(counts?.import_rows_stored_count),
        rawEmailsStoredRecords: numberValue(counts?.raw_emails_stored_count),
        sequenceEnrollmentsCreatedRecords: numberValue(counts?.sequence_enrollments_created_count),
        emailDeliveryEnabledRecords: numberValue(counts?.email_delivery_enabled_count),
      },
      latestIntents: (latest.results ?? []).map((row) => publicImportIntent(row, false)),
    };
  } catch (error) {
    return emptyImportIntentSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience import intents.",
    );
  }
}

export async function getAudienceImportPreflightSummary(): Promise<AudienceImportPreflightSummary> {
  try {
    const { db } = await getRuntime();
    const counts = await db
      .prepare(
        `SELECT
          COUNT(*) AS import_preflight_count,
          SUM(CASE WHEN preflight_kind = 'owner_confirmed_import_preflight' THEN 1 ELSE 0 END) AS owner_confirmed_preflight_count,
          COALESCE(SUM(total_contacts_checked), 0) AS total_contacts_checked,
          COALESCE(SUM(eligible_new_contact_count), 0) AS eligible_new_contact_count,
          COALESCE(SUM(eligible_update_count), 0) AS eligible_update_count,
          COALESCE(SUM(duplicate_count), 0) AS duplicate_count,
          COALESCE(SUM(suppressed_count), 0) AS suppressed_count,
          COALESCE(SUM(missing_consent_count), 0) AS missing_consent_count,
          COALESCE(SUM(malformed_count), 0) AS malformed_count,
          COALESCE(SUM(lawful_basis_count), 0) AS lawful_basis_count,
          SUM(CASE WHEN import_rows_stored = 1 THEN 1 ELSE 0 END) AS import_rows_stored_count,
          SUM(CASE WHEN raw_emails_stored = 1 THEN 1 ELSE 0 END) AS raw_emails_stored_count,
          SUM(CASE WHEN subscriber_rows_created = 1 THEN 1 ELSE 0 END) AS subscriber_rows_created_count,
          SUM(CASE WHEN sequence_enrollments_created = 1 THEN 1 ELSE 0 END) AS sequence_enrollments_created_count,
          SUM(CASE WHEN email_delivery_enabled = 1 THEN 1 ELSE 0 END) AS email_delivery_enabled_count,
          SUM(CASE WHEN export_enabled = 1 THEN 1 ELSE 0 END) AS export_enabled_count
        FROM audience_import_preflights`,
      )
      .first<{
        import_preflight_count: number | string | null;
        owner_confirmed_preflight_count: number | string | null;
        total_contacts_checked: number | string | null;
        eligible_new_contact_count: number | string | null;
        eligible_update_count: number | string | null;
        duplicate_count: number | string | null;
        suppressed_count: number | string | null;
        missing_consent_count: number | string | null;
        malformed_count: number | string | null;
        lawful_basis_count: number | string | null;
        import_rows_stored_count: number | string | null;
        raw_emails_stored_count: number | string | null;
        subscriber_rows_created_count: number | string | null;
        sequence_enrollments_created_count: number | string | null;
        email_delivery_enabled_count: number | string | null;
        export_enabled_count: number | string | null;
      }>();
    const latest = await db
      .prepare(
        `SELECT
          id, workspace_id, import_intent_id, status, preflight_kind, source_kind,
          expected_import_intent_source_label, expected_workspace_revision_id, expected_workspace_status,
          total_contacts_checked, eligible_new_contact_count, eligible_update_count, duplicate_count,
          suppressed_count, missing_consent_count, malformed_count, lawful_basis_count,
          idempotency_key, actor_user_id, actor_email_hash, private_note_sha256, confirmation_text_sha256,
          import_rows_stored, raw_emails_stored, subscriber_rows_created, sequence_enrollments_created,
          email_delivery_enabled, export_enabled, created_at
        FROM audience_import_preflights
        ORDER BY created_at DESC
        LIMIT 10`,
      )
      .all<AudienceImportPreflightRow>();

    return {
      ...emptyImportPreflightSummary("d1", null),
      counts: {
        importPreflights: numberValue(counts?.import_preflight_count),
        ownerConfirmedPreflights: numberValue(counts?.owner_confirmed_preflight_count),
        totalContactsChecked: numberValue(counts?.total_contacts_checked),
        eligibleNewContacts: numberValue(counts?.eligible_new_contact_count),
        eligibleUpdates: numberValue(counts?.eligible_update_count),
        duplicates: numberValue(counts?.duplicate_count),
        suppressed: numberValue(counts?.suppressed_count),
        missingConsent: numberValue(counts?.missing_consent_count),
        malformed: numberValue(counts?.malformed_count),
        lawfulBasisContacts: numberValue(counts?.lawful_basis_count),
        importRowsStoredRecords: numberValue(counts?.import_rows_stored_count),
        rawEmailsStoredRecords: numberValue(counts?.raw_emails_stored_count),
        subscriberRowsCreatedRecords: numberValue(counts?.subscriber_rows_created_count),
        sequenceEnrollmentsCreatedRecords: numberValue(counts?.sequence_enrollments_created_count),
        emailDeliveryEnabledRecords: numberValue(counts?.email_delivery_enabled_count),
        exportEnabledRecords: numberValue(counts?.export_enabled_count),
      },
      latestPreflights: (latest.results ?? []).map((row) => publicImportPreflight(row, false)),
    };
  } catch (error) {
    return emptyImportPreflightSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load audience import preflights.",
    );
  }
}

export async function createAudienceImportIntent(
  input: CreateAudienceImportIntentInput,
): Promise<CreateAudienceImportIntentResult> {
  const redaction = emptyImportIntentSummary("d1", null).redaction;
  const workspaceId = parseString(input.workspaceId);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedWorkspaceStatus = parseString(input.expectedWorkspaceStatus);
  const sourceKind = parseSourceKind(input.sourceKind);
  const sourceLabel = parseString(input.sourceLabel, 120);
  const estimatedContactCount = parseInteger(input.estimatedContactCount);
  const estimatedNewContactCount = parseInteger(input.estimatedNewContactCount ?? 0);
  const estimatedUpdateCount = parseInteger(input.estimatedUpdateCount ?? 0);
  const estimatedSuppressedCount = parseInteger(input.estimatedSuppressedCount ?? 0);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !workspaceId ||
    !expectedWorkspaceRevisionId ||
    !expectedWorkspaceStatus ||
    !sourceKind ||
    !sourceLabel ||
    estimatedContactCount === null ||
    estimatedNewContactCount === null ||
    estimatedUpdateCount === null ||
    estimatedSuppressedCount === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "A workspace, expected revision/status, source, aggregate counts, and idempotency key are required.",
      redaction,
    };
  }

  if (estimatedNewContactCount + estimatedUpdateCount + estimatedSuppressedCount > estimatedContactCount) {
    return {
      ok: false,
      status: "invalid_request",
      message: "Aggregate import counts cannot exceed the estimated contact count.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceImportIntentConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording an audience import intent.",
      redaction,
    };
  }

  if (workspaceId !== audienceAutomationWorkspace.id) {
    return {
      ok: false,
      status: "workspace_not_found",
      message: "The audience workspace could not be found.",
      redaction,
    };
  }

  if (expectedWorkspaceRevisionId !== audienceAutomationWorkspace.revisionId) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace revision changed before the import intent was recorded.",
      redaction,
      currentWorkspaceRevisionId: audienceAutomationWorkspace.revisionId,
    };
  }

  if (expectedWorkspaceStatus !== audienceAutomationWorkspace.status) {
    return {
      ok: false,
      status: "stale_workspace_status",
      message: "The audience workspace status changed before the import intent was recorded.",
      redaction,
      currentWorkspaceStatus: audienceAutomationWorkspace.status,
    };
  }

  const { db } = await getRuntime();
  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(audienceImportIntentConfirmationText);
  const existing = await findImportIntentByIdempotency(db, idempotencyKey);
  if (existing) {
    const sameRequest =
      existing.workspace_id === workspaceId &&
      existing.source_kind === sourceKind &&
      existing.source_label === sourceLabel &&
      existing.expected_workspace_revision_id === expectedWorkspaceRevisionId &&
      existing.expected_workspace_status === expectedWorkspaceStatus &&
      numberValue(existing.estimated_contact_count) === estimatedContactCount &&
      numberValue(existing.estimated_new_contact_count) === estimatedNewContactCount &&
      numberValue(existing.estimated_update_count) === estimatedUpdateCount &&
      numberValue(existing.estimated_suppressed_count) === estimatedSuppressedCount &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256;
    if (!sameRequest) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "The idempotency key is already associated with a different import intent request.",
        redaction,
      };
    }
    return {
      ok: true,
      status: "audience_import_intent_replayed",
      duplicate: true,
      intent: publicImportIntent(existing, true),
      redaction,
    };
  }

  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const intentId = `audience-import-intent-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_import_intents (
        id, workspace_id, status, intent_kind, source_kind, source_label,
        expected_workspace_revision_id, expected_workspace_status,
        estimated_contact_count, estimated_new_contact_count, estimated_update_count,
        estimated_suppressed_count, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, import_rows_stored, raw_emails_stored,
        sequence_enrollments_created, email_delivery_enabled, metadata_json, created_at, updated_at
      ) VALUES (?, ?, 'import_intent_recorded', 'owner_confirmed_dry_run', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      intentId,
      workspaceId,
      sourceKind,
      sourceLabel,
      expectedWorkspaceRevisionId,
      expectedWorkspaceStatus,
      estimatedContactCount,
      estimatedNewContactCount,
      estimatedUpdateCount,
      estimatedSuppressedCount,
      idempotencyKey,
      input.actor.userId ?? "unknown-owner",
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      JSON.stringify({
        issue: audienceImportIntentIssue,
        importRowsStored: false,
        rawEmailsStored: false,
        sequenceEnrollmentsCreated: false,
        emailDeliveryEnabled: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const intent = await findImportIntentByIdempotency(db, idempotencyKey);
  if (!intent) {
    return {
      ok: false,
      status: "intent_not_created",
      message: "The audience import intent could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "audience_import_intent_recorded",
    duplicate: false,
    intent: publicImportIntent(intent, false),
    redaction,
  };
}

export async function createAudienceImportPreflight(
  input: CreateAudienceImportPreflightInput,
): Promise<CreateAudienceImportPreflightResult> {
  const redaction = emptyImportPreflightSummary("d1", null).redaction;
  const workspaceId = parseString(input.workspaceId);
  const importIntentId = parseString(input.importIntentId, 220);
  const expectedImportIntentSourceLabel = parseString(input.expectedImportIntentSourceLabel, 120);
  const expectedWorkspaceRevisionId = parseString(input.expectedWorkspaceRevisionId);
  const expectedWorkspaceStatus = parseString(input.expectedWorkspaceStatus);
  const totalContactsChecked = parseInteger(input.totalContactsChecked);
  const eligibleNewContactCount = parseInteger(input.eligibleNewContactCount ?? 0);
  const eligibleUpdateCount = parseInteger(input.eligibleUpdateCount ?? 0);
  const duplicateCount = parseInteger(input.duplicateCount ?? 0);
  const suppressedCount = parseInteger(input.suppressedCount ?? 0);
  const missingConsentCount = parseInteger(input.missingConsentCount ?? 0);
  const malformedCount = parseInteger(input.malformedCount ?? 0);
  const lawfulBasisCount = parseInteger(input.lawfulBasisCount ?? 0);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !workspaceId ||
    !importIntentId ||
    !expectedImportIntentSourceLabel ||
    !expectedWorkspaceRevisionId ||
    !expectedWorkspaceStatus ||
    totalContactsChecked === null ||
    eligibleNewContactCount === null ||
    eligibleUpdateCount === null ||
    duplicateCount === null ||
    suppressedCount === null ||
    missingConsentCount === null ||
    malformedCount === null ||
    lawfulBasisCount === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message:
        "A workspace, import intent, expected revision/status, aggregate preflight counts, and idempotency key are required.",
      redaction,
    };
  }

  const classifiedCount =
    eligibleNewContactCount +
    eligibleUpdateCount +
    duplicateCount +
    suppressedCount +
    missingConsentCount +
    malformedCount;
  if (classifiedCount > totalContactsChecked || lawfulBasisCount > totalContactsChecked) {
    return {
      ok: false,
      status: "aggregate_count_mismatch",
      message: "Aggregate preflight counts cannot exceed the total contacts checked.",
      redaction,
    };
  }

  if (input.confirmationText !== audienceImportPreflightConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording an audience import preflight.",
      redaction,
    };
  }

  if (workspaceId !== audienceAutomationWorkspace.id) {
    return {
      ok: false,
      status: "workspace_not_found",
      message: "The audience workspace could not be found.",
      redaction,
    };
  }

  if (expectedWorkspaceRevisionId !== audienceAutomationWorkspace.revisionId) {
    return {
      ok: false,
      status: "stale_workspace_revision",
      message: "The audience workspace revision changed before the import preflight was recorded.",
      redaction,
      currentWorkspaceRevisionId: audienceAutomationWorkspace.revisionId,
    };
  }

  if (expectedWorkspaceStatus !== audienceAutomationWorkspace.status) {
    return {
      ok: false,
      status: "stale_workspace_status",
      message: "The audience workspace status changed before the import preflight was recorded.",
      redaction,
      currentWorkspaceStatus: audienceAutomationWorkspace.status,
    };
  }

  const { db } = await getRuntime();
  const importIntent = await findImportIntentById(db, importIntentId);
  if (!importIntent) {
    return {
      ok: false,
      status: "import_intent_not_found",
      message: "The selected audience import intent could not be found.",
      redaction,
    };
  }

  if (
    importIntent.workspace_id !== workspaceId ||
    importIntent.source_label !== expectedImportIntentSourceLabel ||
    importIntent.expected_workspace_revision_id !== expectedWorkspaceRevisionId ||
    importIntent.expected_workspace_status !== expectedWorkspaceStatus
  ) {
    return {
      ok: false,
      status: "import_intent_mismatch",
      message: "The selected import intent does not match the expected workspace or source label.",
      redaction,
    };
  }

  if (totalContactsChecked > numberValue(importIntent.estimated_contact_count)) {
    return {
      ok: false,
      status: "aggregate_count_mismatch",
      message: "Preflight contacts checked cannot exceed the selected import intent estimate.",
      redaction,
    };
  }

  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(audienceImportPreflightConfirmationText);
  const existing = await findImportPreflightByIdempotency(db, idempotencyKey);
  if (existing) {
    const sameRequest =
      existing.workspace_id === workspaceId &&
      existing.import_intent_id === importIntentId &&
      existing.source_kind === importIntent.source_kind &&
      existing.expected_import_intent_source_label === expectedImportIntentSourceLabel &&
      existing.expected_workspace_revision_id === expectedWorkspaceRevisionId &&
      existing.expected_workspace_status === expectedWorkspaceStatus &&
      numberValue(existing.total_contacts_checked) === totalContactsChecked &&
      numberValue(existing.eligible_new_contact_count) === eligibleNewContactCount &&
      numberValue(existing.eligible_update_count) === eligibleUpdateCount &&
      numberValue(existing.duplicate_count) === duplicateCount &&
      numberValue(existing.suppressed_count) === suppressedCount &&
      numberValue(existing.missing_consent_count) === missingConsentCount &&
      numberValue(existing.malformed_count) === malformedCount &&
      numberValue(existing.lawful_basis_count) === lawfulBasisCount &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256;
    if (!sameRequest) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "The idempotency key is already associated with a different import preflight request.",
        redaction,
      };
    }
    return {
      ok: true,
      status: "audience_import_preflight_replayed",
      duplicate: true,
      preflight: publicImportPreflight(existing, true),
      redaction,
    };
  }

  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const preflightId = `audience-import-preflight-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_import_preflights (
        id, workspace_id, import_intent_id, status, preflight_kind, source_kind,
        expected_import_intent_source_label, expected_workspace_revision_id, expected_workspace_status,
        total_contacts_checked, eligible_new_contact_count, eligible_update_count, duplicate_count,
        suppressed_count, missing_consent_count, malformed_count, lawful_basis_count,
        idempotency_key, actor_user_id, actor_email_hash, private_note_sha256, confirmation_text_sha256,
        import_rows_stored, raw_emails_stored, subscriber_rows_created, sequence_enrollments_created,
        email_delivery_enabled, export_enabled, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, 'import_preflight_recorded', 'owner_confirmed_import_preflight', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      preflightId,
      workspaceId,
      importIntentId,
      importIntent.source_kind,
      expectedImportIntentSourceLabel,
      expectedWorkspaceRevisionId,
      expectedWorkspaceStatus,
      totalContactsChecked,
      eligibleNewContactCount,
      eligibleUpdateCount,
      duplicateCount,
      suppressedCount,
      missingConsentCount,
      malformedCount,
      lawfulBasisCount,
      idempotencyKey,
      input.actor.userId ?? "unknown-owner",
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      JSON.stringify({
        issue: audienceImportPreflightIssue,
        importIntentIssue: audienceImportIntentIssue,
        importIntentId,
        sourceKind: importIntent.source_kind,
        importRowsStored: false,
        rawEmailsStored: false,
        subscriberRowsCreated: false,
        sequenceEnrollmentsCreated: false,
        emailDeliveryEnabled: false,
        exportEnabled: false,
        privateContactDataIncluded: false,
      }),
    )
    .run();

  const preflight = await findImportPreflightByIdempotency(db, idempotencyKey);
  if (!preflight) {
    return {
      ok: false,
      status: "preflight_not_created",
      message: "The audience import preflight could not be saved.",
      redaction,
    };
  }

  return {
    ok: true,
    status: "audience_import_preflight_recorded",
    duplicate: false,
    preflight: publicImportPreflight(preflight, false),
    redaction,
  };
}
