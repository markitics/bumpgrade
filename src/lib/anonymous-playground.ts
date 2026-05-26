import { getCloudflareContext } from "@opennextjs/cloudflare";

import { sha256Hex } from "@/lib/analytics-events";
import {
  createAnonymousPlaygroundDraftFunnel,
  type DraftFunnelRecord,
} from "@/lib/funnel-drafts";
import { getImporterBySlug, importerPlatforms, importerSourceDataRoute } from "@/lib/importers";
import {
  createFreeBuildWorkspace,
  publisherFreeBuildParentIssue,
  publisherFreeBuildWorkspaceConfirmationText,
  type PublisherSessionUser,
} from "@/lib/publisher-tenants";

export type AnonymousPlaygroundStatus = "active" | "claimed" | "expired";
export type AnonymousPlaygroundClaimRecordKind = "offer" | "product" | "audience" | "importer_review";

export type AnonymousPlaygroundDraft = {
  offerName: string;
  audience: string;
  launchGoal: string;
  productFormat: string;
  pricePoint: string;
  leadMagnet: string;
  checkoutPlan: string;
  deliveryPlan: string;
  followUpPlan: string;
  sourceUrl: string;
  selectedImporterSlug: string | null;
};

export type AnonymousPlaygroundWorkspace = {
  id: string;
  status: AnonymousPlaygroundStatus;
  draft: AnonymousPlaygroundDraft;
  revision: number;
  expiresAt: string | null;
  claimedByUserId: string | null;
  claimedTenantId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastSeenAt: string | null;
};

export type AnonymousPlaygroundClaimRecord = {
  id: string;
  kind: AnonymousPlaygroundClaimRecordKind;
  status: string;
  title: string;
  summary: string;
  sourceUrl: string | null;
  selectedImporterSlug: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AnonymousPlaygroundCleanupResult = {
  expiredCount: number;
  activeExpiredCount: number;
  claimedRecoveryExpiredCount: number;
  batchLimit: number;
  retentionDays: number;
  rawDraftContentCleared: boolean;
  recoveryTokenHashReplaced: boolean;
  privateClaimRecordsPreserved: boolean;
  paidGoLiveRequired: boolean;
};

type AnonymousPlaygroundWorkspaceRow = {
  id: string;
  status: AnonymousPlaygroundStatus;
  offer_name: string | null;
  audience: string | null;
  launch_goal: string | null;
  product_format: string | null;
  price_point: string | null;
  lead_magnet: string | null;
  checkout_plan: string | null;
  delivery_plan: string | null;
  follow_up_plan: string | null;
  source_url: string | null;
  selected_importer_slug: string | null;
  revision: number | null;
  expires_at: number | null;
  claimed_by_user_id: string | null;
  claimed_tenant_id: string | null;
  created_at: number | null;
  updated_at: number | null;
  last_seen_at: number | null;
};

type AnonymousPlaygroundCleanupCandidateRow = {
  id: string;
  status: AnonymousPlaygroundStatus;
  claimed_by_user_id: string | null;
  claimed_tenant_id: string | null;
  expires_at: number | null;
};

type AnonymousPlaygroundAuditRow = {
  workspace_id: string;
  event_kind: string;
};

type AnonymousPlaygroundClaimRecordRow = {
  id: string;
  record_kind: AnonymousPlaygroundClaimRecordKind;
  status: string;
  title: string;
  summary: string;
  source_url: string | null;
  selected_importer_slug: string | null;
  created_at: number | null;
  updated_at: number | null;
};

type SaveAnonymousPlaygroundInput = AnonymousPlaygroundDraft & {
  idempotencyKey: string;
};

export class AnonymousPlaygroundError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "AnonymousPlaygroundError";
    this.status = status;
    this.code = code;
  }
}

export const anonymousPlaygroundIssue = publisherFreeBuildParentIssue;
export const anonymousPlaygroundUpdatedAt = "2026-05-25";
export const anonymousPlaygroundRoute = "/playground";
export const anonymousPlaygroundSourceDataRoute = "/playground/source-data";
export const anonymousPlaygroundApiRoute = "/api/playground/anonymous-workspace";
export const anonymousPlaygroundClaimApiRoute = "/api/playground/claim";
export const anonymousPlaygroundCleanupApiRoute = "/api/playground/cleanup";
export const anonymousPlaygroundCookieName = "bumpgrade_anonymous_playground";
export const anonymousPlaygroundCookieMaxAgeSeconds = 60 * 60 * 24 * 30;
export const anonymousPlaygroundCookieMaxAgeDays = 30;
export const anonymousPlaygroundClaimConfirmationText = "Attach this playground to my Bumpgrade account";
export const anonymousPlaygroundCleanupConfirmationText = "Expire anonymous playgrounds";
export const anonymousPlaygroundCleanupBatchLimit = 100;
export const anonymousPlaygroundSaveRateLimitWindowSeconds = 10 * 60;
export const anonymousPlaygroundSaveRateLimitMaxSaves = 12;

export type AnonymousPlaygroundSaveRateLimit = {
  scope: "browser_recovery_workspace";
  windowSeconds: number;
  maxSavesPerWindow: number;
  recentSavesInWindow: number;
  remainingSavesInWindow: number;
  rawIpStored: false;
  rawUserAgentStored: false;
};

export const anonymousPlaygroundGoLiveGates = [
  "Public publishing",
  "Live checkout and payment collection",
  "Buyer or subscriber sends",
  "Custom domains and Bumpgrade subdomains",
  "Fulfillment and protected product access",
];

export const anonymousPlaygroundClaimRecordKinds: {
  id: AnonymousPlaygroundClaimRecordKind;
  privateRecordType: string;
  label: string;
  sourceFields: (keyof AnonymousPlaygroundDraft)[];
}[] = [
  {
    id: "offer",
    privateRecordType: "playground_offer_record",
    label: "Offer record",
    sourceFields: ["offerName", "launchGoal", "pricePoint", "checkoutPlan"],
  },
  {
    id: "product",
    privateRecordType: "playground_product_record",
    label: "Product record",
    sourceFields: ["productFormat", "pricePoint", "deliveryPlan"],
  },
  {
    id: "audience",
    privateRecordType: "playground_audience_record",
    label: "Audience record",
    sourceFields: ["audience", "leadMagnet", "followUpPlan"],
  },
  {
    id: "importer_review",
    privateRecordType: "playground_importer_review_record",
    label: "Importer review record",
    sourceFields: ["selectedImporterSlug", "sourceUrl"],
  },
];

const defaultDraft: AnonymousPlaygroundDraft = {
  offerName: "",
  audience: "",
  launchGoal: "",
  productFormat: "",
  pricePoint: "",
  leadMagnet: "",
  checkoutPlan: "",
  deliveryPlan: "",
  followUpPlan: "",
  sourceUrl: "",
  selectedImporterSlug: "clickfunnels",
};

function isoFromSeconds(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function clampText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeImporterSlug(value: string | null | undefined) {
  const slug = value?.trim().toLowerCase() ?? "";
  return getImporterBySlug(slug)?.slug ?? null;
}

function workspaceFromRow(row: AnonymousPlaygroundWorkspaceRow | null | undefined): AnonymousPlaygroundWorkspace | null {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    draft: {
      offerName: row.offer_name ?? "",
      audience: row.audience ?? "",
      launchGoal: row.launch_goal ?? "",
      productFormat: row.product_format ?? "",
      pricePoint: row.price_point ?? "",
      leadMagnet: row.lead_magnet ?? "",
      checkoutPlan: row.checkout_plan ?? "",
      deliveryPlan: row.delivery_plan ?? "",
      followUpPlan: row.follow_up_plan ?? "",
      sourceUrl: row.source_url ?? "",
      selectedImporterSlug: normalizeImporterSlug(row.selected_importer_slug) ?? defaultDraft.selectedImporterSlug,
    },
    revision: row.revision ?? 1,
    expiresAt: isoFromSeconds(row.expires_at),
    claimedByUserId: row.claimed_by_user_id,
    claimedTenantId: row.claimed_tenant_id,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
    lastSeenAt: isoFromSeconds(row.last_seen_at),
  };
}

function claimRecordFromRow(row: AnonymousPlaygroundClaimRecordRow): AnonymousPlaygroundClaimRecord {
  return {
    id: row.id,
    kind: row.record_kind,
    status: row.status,
    title: row.title,
    summary: row.summary,
    sourceUrl: row.source_url,
    selectedImporterSlug: normalizeImporterSlug(row.selected_importer_slug),
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

export function normalizeAnonymousPlaygroundDraft(input: Partial<AnonymousPlaygroundDraft>): AnonymousPlaygroundDraft {
  return {
    offerName: clampText(input.offerName ?? "", 90),
    audience: clampText(input.audience ?? "", 180),
    launchGoal: clampText(input.launchGoal ?? "", 260),
    productFormat: clampText(input.productFormat ?? "", 140),
    pricePoint: clampText(input.pricePoint ?? "", 80),
    leadMagnet: clampText(input.leadMagnet ?? "", 180),
    checkoutPlan: clampText(input.checkoutPlan ?? "", 220),
    deliveryPlan: clampText(input.deliveryPlan ?? "", 220),
    followUpPlan: clampText(input.followUpPlan ?? "", 220),
    sourceUrl: clampText(input.sourceUrl ?? "", 260),
    selectedImporterSlug: normalizeImporterSlug(input.selectedImporterSlug) ?? defaultDraft.selectedImporterSlug,
  };
}

export function hasAnonymousPlaygroundDraftContent(draft: AnonymousPlaygroundDraft) {
  return Boolean(
    draft.offerName ||
      draft.audience ||
      draft.launchGoal ||
      draft.productFormat ||
      draft.pricePoint ||
      draft.leadMagnet ||
      draft.checkoutPlan ||
      draft.deliveryPlan ||
      draft.followUpPlan ||
      draft.sourceUrl ||
      draft.selectedImporterSlug,
  );
}

export async function getOptionalAnonymousPlaygroundD1() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as Cloudflare.Env).DB ?? null;
  } catch {
    return null;
  }
}

export function createAnonymousPlaygroundRecoveryToken() {
  const first = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const second = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2);
  return `apg_${first}_${second}`;
}

export function isLikelyAnonymousPlaygroundToken(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith("apg_") && value.length >= 40 && value.length <= 180);
}

async function tokenHash(token: string) {
  return sha256Hex(`bumpgrade-anonymous-playground:${token}`);
}

async function loadWorkspaceByTokenHash(db: D1Database, recoveryTokenSha256: string) {
  const row = await db
    .prepare(
      `SELECT *
       FROM anonymous_playground_workspaces
       WHERE recovery_token_sha256 = ?
         AND status IN ('active', 'claimed')
         AND expires_at > unixepoch()
       LIMIT 1`,
    )
    .bind(recoveryTokenSha256)
    .first<AnonymousPlaygroundWorkspaceRow>();

  return workspaceFromRow(row);
}

async function loadWorkspaceById(db: D1Database, workspaceId: string) {
  const row = await db
    .prepare(
      `SELECT *
       FROM anonymous_playground_workspaces
       WHERE id = ?
         AND expires_at > unixepoch()
       LIMIT 1`,
    )
    .bind(workspaceId)
    .first<AnonymousPlaygroundWorkspaceRow>();

  return workspaceFromRow(row);
}

async function loadAuditEventByIdempotencyKey(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT workspace_id, event_kind
       FROM anonymous_playground_audit_events
       WHERE idempotency_key = ?
       LIMIT 1`,
    )
    .bind(idempotencyKey)
    .first<AnonymousPlaygroundAuditRow>();
}

async function countRecentSaveEvents(db: D1Database, workspaceId: string) {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM anonymous_playground_audit_events
       WHERE workspace_id = ?
         AND event_kind IN ('anonymous_playground_created', 'anonymous_playground_saved')
         AND created_at >= unixepoch() - ?`,
    )
    .bind(workspaceId, anonymousPlaygroundSaveRateLimitWindowSeconds)
    .first<{ count: number | null }>();

  return Number(row?.count ?? 0);
}

function saveRateLimit(recentSavesInWindow: number, remainingSavesInWindow: number): AnonymousPlaygroundSaveRateLimit {
  return {
    scope: "browser_recovery_workspace",
    windowSeconds: anonymousPlaygroundSaveRateLimitWindowSeconds,
    maxSavesPerWindow: anonymousPlaygroundSaveRateLimitMaxSaves,
    recentSavesInWindow,
    remainingSavesInWindow,
    rawIpStored: false,
    rawUserAgentStored: false,
  };
}

async function assertAnonymousPlaygroundSaveRateLimit(db: D1Database, workspaceId: string) {
  const recentSavesInWindow = await countRecentSaveEvents(db, workspaceId);

  if (recentSavesInWindow >= anonymousPlaygroundSaveRateLimitMaxSaves) {
    throw new AnonymousPlaygroundError(
      "This browser has saved often enough for now. Wait a few minutes before saving again.",
      429,
      "ANONYMOUS_PLAYGROUND_SAVE_RATE_LIMITED",
    );
  }

  return saveRateLimit(
    recentSavesInWindow + 1,
    Math.max(0, anonymousPlaygroundSaveRateLimitMaxSaves - recentSavesInWindow - 1),
  );
}

async function writeAuditEvent(
  db: D1Database,
  input: {
    workspaceId: string;
    eventKind: string;
    idempotencyKey: string;
    metadata: Record<string, unknown>;
  },
) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO anonymous_playground_audit_events (
        id, workspace_id, event_kind, idempotency_key, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      runtimeId("anonymous-playground-audit"),
      input.workspaceId,
      input.eventKind,
      input.idempotencyKey,
      JSON.stringify(input.metadata),
    )
    .run();
}

export async function loadAnonymousPlaygroundWorkspace(db: D1Database | null, token: string | null | undefined) {
  if (!db || !isLikelyAnonymousPlaygroundToken(token)) return null;
  return loadWorkspaceByTokenHash(db, await tokenHash(token));
}

export async function saveAnonymousPlaygroundWorkspace(db: D1Database, token: string, input: SaveAnonymousPlaygroundInput) {
  if (!isLikelyAnonymousPlaygroundToken(token)) {
    throw new AnonymousPlaygroundError("Start a new playground before saving.", 400, "INVALID_RECOVERY_TOKEN");
  }

  const draft = normalizeAnonymousPlaygroundDraft(input);
  if (!hasAnonymousPlaygroundDraftContent(draft)) {
    throw new AnonymousPlaygroundError("Add at least one launch detail before saving.", 400, "EMPTY_PLAYGROUND");
  }

  const idempotencyKey = input.idempotencyKey.trim();
  if (!idempotencyKey) {
    throw new AnonymousPlaygroundError("An idempotency key is required.", 400, "IDEMPOTENCY_REQUIRED");
  }

  const recoveryTokenSha256 = await tokenHash(token);
  const existing = await loadWorkspaceByTokenHash(db, recoveryTokenSha256);
  const existingAudit = await loadAuditEventByIdempotencyKey(db, idempotencyKey);

  if (existingAudit) {
    if (existing && existingAudit.workspace_id !== existing.id) {
      throw new AnonymousPlaygroundError("That save key belongs to a different playground.", 409, "IDEMPOTENCY_CONFLICT");
    }

    const idempotentWorkspace = await loadWorkspaceById(db, existingAudit.workspace_id);
    if (idempotentWorkspace) {
      const recentSavesInWindow = await countRecentSaveEvents(db, idempotentWorkspace.id);
      return {
        workspace: idempotentWorkspace,
        idempotent: true,
        rateLimit: saveRateLimit(
          recentSavesInWindow,
          Math.max(0, anonymousPlaygroundSaveRateLimitMaxSaves - recentSavesInWindow),
        ),
      };
    }
  }

  if (existing) {
    const rateLimit = await assertAnonymousPlaygroundSaveRateLimit(db, existing.id);

    await db
      .prepare(
        `UPDATE anonymous_playground_workspaces
         SET offer_name = ?,
             audience = ?,
             launch_goal = ?,
             product_format = ?,
             price_point = ?,
             lead_magnet = ?,
             checkout_plan = ?,
             delivery_plan = ?,
             follow_up_plan = ?,
             source_url = ?,
             selected_importer_slug = ?,
             revision = revision + 1,
             expires_at = unixepoch() + ?,
             updated_at = unixepoch(),
             last_seen_at = unixepoch()
         WHERE id = ?`,
      )
      .bind(
        draft.offerName,
        draft.audience,
        draft.launchGoal,
        draft.productFormat,
        draft.pricePoint,
        draft.leadMagnet,
        draft.checkoutPlan,
        draft.deliveryPlan,
        draft.followUpPlan,
        draft.sourceUrl,
        draft.selectedImporterSlug,
        anonymousPlaygroundCookieMaxAgeSeconds,
        existing.id,
      )
      .run();

    await writeAuditEvent(db, {
      workspaceId: existing.id,
      eventKind: "anonymous_playground_saved",
      idempotencyKey,
      metadata: {
        sourceIssueNumber: anonymousPlaygroundIssue,
        revisionBeforeSave: existing.revision,
        selectedImporterSlug: draft.selectedImporterSlug,
        structuredBuilderFieldsStored: true,
        paidGoLiveRequired: true,
        rawCookieStored: false,
        publicPublishingEnabled: false,
      },
    });

    return { workspace: (await loadWorkspaceById(db, existing.id)) ?? existing, idempotent: false, rateLimit };
  }

  const workspaceId = runtimeId("anonymous-playground");
  await db
    .prepare(
      `INSERT INTO anonymous_playground_workspaces (
        id, recovery_token_sha256, status, offer_name, audience, launch_goal,
        product_format, price_point, lead_magnet, checkout_plan, delivery_plan,
        follow_up_plan, source_url, selected_importer_slug, revision, expires_at, source_issue_number,
        metadata_json, created_at, updated_at, last_seen_at
      ) VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, unixepoch() + ?, ?, ?, unixepoch(), unixepoch(), unixepoch())`,
    )
    .bind(
      workspaceId,
      recoveryTokenSha256,
      draft.offerName,
      draft.audience,
      draft.launchGoal,
      draft.productFormat,
      draft.pricePoint,
      draft.leadMagnet,
      draft.checkoutPlan,
      draft.deliveryPlan,
      draft.followUpPlan,
      draft.sourceUrl,
      draft.selectedImporterSlug,
      anonymousPlaygroundCookieMaxAgeSeconds,
      anonymousPlaygroundIssue,
      JSON.stringify({
        paidGoLiveRequired: true,
        publicPublishingEnabled: false,
        liveCheckoutEnabled: false,
        emailSendsEnabled: false,
        fulfillmentEnabled: false,
      }),
    )
    .run();

  await writeAuditEvent(db, {
    workspaceId,
    eventKind: "anonymous_playground_created",
    idempotencyKey,
    metadata: {
      sourceIssueNumber: anonymousPlaygroundIssue,
      selectedImporterSlug: draft.selectedImporterSlug,
      structuredBuilderFieldsStored: true,
      paidGoLiveRequired: true,
      rawCookieStored: false,
      publicPublishingEnabled: false,
    },
  });

  return {
    workspace: (await loadWorkspaceById(db, workspaceId))!,
    idempotent: false,
    rateLimit: saveRateLimit(1, anonymousPlaygroundSaveRateLimitMaxSaves - 1),
  };
}

function privateClaimRecordSummary(parts: string[]) {
  return clampText(parts.filter(Boolean).join(" "), 900);
}

function privateClaimRecordInputs(
  workspace: AnonymousPlaygroundWorkspace,
  input: { tenantId: string; draftFunnelId: string; ownerUserId: string },
) {
  const draft = workspace.draft;
  const offerName = draft.offerName || "Saved playground launch";
  const importer = draft.selectedImporterSlug ? getImporterBySlug(draft.selectedImporterSlug) : null;
  const importerName = importer?.platformName ?? "starting platform";

  return [
    {
      kind: "offer" as const,
      title: clampText(offerName, 160),
      summary: privateClaimRecordSummary([
        draft.launchGoal ? `Launch goal: ${draft.launchGoal}.` : "Launch goal still needs a first pass.",
        draft.pricePoint ? `Price or offer structure: ${draft.pricePoint}.` : "Price or offer structure still needs review.",
        draft.checkoutPlan ? `Checkout handoff: ${draft.checkoutPlan}.` : "Checkout handoff still needs setup.",
      ]),
      sourceUrl: draft.sourceUrl || null,
      selectedImporterSlug: draft.selectedImporterSlug,
      metadata: {
        sourceIssueNumber: anonymousPlaygroundIssue,
        anonymousPlaygroundWorkspaceId: workspace.id,
        tenantId: input.tenantId,
        draftFunnelId: input.draftFunnelId,
        ownerUserId: input.ownerUserId,
        privateRecordType: "playground_offer_record",
        goLiveGated: true,
        publicPublishingEnabled: false,
      },
    },
    {
      kind: "product" as const,
      title: clampText(draft.productFormat || `${offerName} product`, 160),
      summary: privateClaimRecordSummary([
        draft.productFormat ? `Format: ${draft.productFormat}.` : "Product or service format still needs review.",
        draft.pricePoint ? `Offer structure: ${draft.pricePoint}.` : "Offer structure still needs review.",
        draft.deliveryPlan ? `Delivery promise: ${draft.deliveryPlan}.` : "Delivery promise still needs setup.",
      ]),
      sourceUrl: draft.sourceUrl || null,
      selectedImporterSlug: draft.selectedImporterSlug,
      metadata: {
        sourceIssueNumber: anonymousPlaygroundIssue,
        anonymousPlaygroundWorkspaceId: workspace.id,
        tenantId: input.tenantId,
        draftFunnelId: input.draftFunnelId,
        ownerUserId: input.ownerUserId,
        privateRecordType: "playground_product_record",
        fulfillmentEnabled: false,
        billingMutationEnabled: false,
      },
    },
    {
      kind: "audience" as const,
      title: clampText(draft.audience || `${offerName} audience`, 160),
      summary: privateClaimRecordSummary([
        draft.audience ? `Audience: ${draft.audience}.` : "Audience still needs definition.",
        draft.leadMagnet ? `First opt-in: ${draft.leadMagnet}.` : "First opt-in still needs review.",
        draft.followUpPlan ? `Follow-up path: ${draft.followUpPlan}.` : "Follow-up path still needs setup.",
      ]),
      sourceUrl: draft.sourceUrl || null,
      selectedImporterSlug: draft.selectedImporterSlug,
      metadata: {
        sourceIssueNumber: anonymousPlaygroundIssue,
        anonymousPlaygroundWorkspaceId: workspace.id,
        tenantId: input.tenantId,
        draftFunnelId: input.draftFunnelId,
        ownerUserId: input.ownerUserId,
        privateRecordType: "playground_audience_record",
        subscriberSendsEnabled: false,
        rawSubscriberRowsStored: false,
      },
    },
    {
      kind: "importer_review" as const,
      title: clampText(`${importerName} review`, 160),
      summary: privateClaimRecordSummary([
        importer ? `Starting platform: ${importer.platformName}.` : "Starting platform still needs review.",
        draft.sourceUrl ? `Source URL to inspect: ${draft.sourceUrl}.` : "No source URL was saved.",
        "Review claims, guarantees, checkout language, delivery promises, and follow-up assumptions before any public import or go-live step.",
      ]),
      sourceUrl: draft.sourceUrl || null,
      selectedImporterSlug: draft.selectedImporterSlug,
      metadata: {
        sourceIssueNumber: anonymousPlaygroundIssue,
        anonymousPlaygroundWorkspaceId: workspace.id,
        tenantId: input.tenantId,
        draftFunnelId: input.draftFunnelId,
        ownerUserId: input.ownerUserId,
        privateRecordType: "playground_importer_review_record",
        sourceUrlStoredPrivately: Boolean(draft.sourceUrl),
        importerSlug: draft.selectedImporterSlug,
        importMutationEnabled: false,
      },
    },
  ];
}

async function loadClaimRecordsForWorkspace(db: D1Database, workspaceId: string) {
  const rows = await db
    .prepare(
      `SELECT id, record_kind, status, title, summary, source_url, selected_importer_slug, created_at, updated_at
       FROM anonymous_playground_claim_records
       WHERE workspace_id = ?`,
    )
    .bind(workspaceId)
    .all<AnonymousPlaygroundClaimRecordRow>();

  const records = (rows.results ?? []).map(claimRecordFromRow);
  const order = new Map<AnonymousPlaygroundClaimRecordKind, number>(
    anonymousPlaygroundClaimRecordKinds.map((record, index) => [record.id, index]),
  );
  return records.sort((left, right) => (order.get(left.kind) ?? 99) - (order.get(right.kind) ?? 99));
}

async function createAnonymousPlaygroundClaimRecords(
  db: D1Database,
  workspace: AnonymousPlaygroundWorkspace,
  input: { tenantId: string; draftFunnelId: string; ownerUserId: string },
) {
  for (const record of privateClaimRecordInputs(workspace, input)) {
    await db
      .prepare(
        `INSERT INTO anonymous_playground_claim_records (
          id, workspace_id, tenant_id, draft_funnel_id, owner_user_id, record_kind, status,
          title, summary, source_url, selected_importer_slug, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'private_draft', ?, ?, ?, ?, ?, unixepoch(), unixepoch())
        ON CONFLICT(workspace_id, record_kind) DO UPDATE SET
          tenant_id = excluded.tenant_id,
          draft_funnel_id = excluded.draft_funnel_id,
          owner_user_id = excluded.owner_user_id,
          status = excluded.status,
          title = excluded.title,
          summary = excluded.summary,
          source_url = excluded.source_url,
          selected_importer_slug = excluded.selected_importer_slug,
          metadata_json = excluded.metadata_json,
          updated_at = excluded.updated_at`,
      )
      .bind(
        runtimeId("anonymous-playground-claim-record"),
        workspace.id,
        input.tenantId,
        input.draftFunnelId,
        input.ownerUserId,
        record.kind,
        record.title,
        record.summary,
        record.sourceUrl,
        record.selectedImporterSlug,
        JSON.stringify(record.metadata),
      )
      .run();
  }

  return loadClaimRecordsForWorkspace(db, workspace.id);
}

export async function claimAnonymousPlaygroundWorkspace(db: D1Database, token: string, user: PublisherSessionUser) {
  const workspace = await loadAnonymousPlaygroundWorkspace(db, token);
  if (!workspace) {
    throw new AnonymousPlaygroundError("No saved playground was found for this browser.", 404, "PLAYGROUND_NOT_FOUND");
  }

  if (workspace.claimedByUserId && workspace.claimedByUserId !== user.id) {
    throw new AnonymousPlaygroundError("This playground is already attached to another account.", 409, "PLAYGROUND_ALREADY_CLAIMED");
  }

  if (!user.emailVerified) {
    throw new AnonymousPlaygroundError("Confirm your email before attaching this playground.", 403, "EMAIL_UNVERIFIED");
  }

  const claimIdempotencyKey = `anonymous-playground-claim-${workspace.id}-${user.id}`;
  const freeBuild = await createFreeBuildWorkspace(db, user, {
    confirmationText: publisherFreeBuildWorkspaceConfirmationText,
    idempotencyKey: claimIdempotencyKey,
  });
  const draft = await createAnonymousPlaygroundDraftFunnel(db, { userId: user.id, email: user.email }, {
    tenantId: freeBuild.tenant.id,
    workspaceId: workspace.id,
    offerName: workspace.draft.offerName,
    audience: workspace.draft.audience,
    launchGoal: workspace.draft.launchGoal,
    productFormat: workspace.draft.productFormat,
    pricePoint: workspace.draft.pricePoint,
    leadMagnet: workspace.draft.leadMagnet,
    checkoutPlan: workspace.draft.checkoutPlan,
    deliveryPlan: workspace.draft.deliveryPlan,
    followUpPlan: workspace.draft.followUpPlan,
    sourceUrl: workspace.draft.sourceUrl,
    selectedImporterSlug: workspace.draft.selectedImporterSlug,
    sourceIssueNumber: anonymousPlaygroundIssue,
    idempotencyKey: `anonymous-playground-draft-${workspace.id}-${user.id}`,
  });
  const claimRecords = await createAnonymousPlaygroundClaimRecords(db, workspace, {
    tenantId: freeBuild.tenant.id,
    draftFunnelId: draft.id,
    ownerUserId: user.id,
  });

  await db
    .prepare(
      `UPDATE anonymous_playground_workspaces
       SET status = 'claimed',
           claimed_by_user_id = ?,
           claimed_tenant_id = ?,
           metadata_json = ?,
           updated_at = unixepoch(),
           last_seen_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(
      user.id,
      freeBuild.tenant.id,
      JSON.stringify({
        paidGoLiveRequired: freeBuild.paidGoLiveRequired,
        claimedDraftFunnelId: draft.id,
        claimedDraftStepCount: draft.steps.length,
        claimedDraftBlockCount: draft.steps.reduce((total, step) => total + step.blocks.length, 0),
        privateClaimRecordCount: claimRecords.length,
        privateClaimRecordKinds: claimRecords.map((record) => record.kind),
        structuredBuilderFieldsClaimed: true,
        privateLaunchRecordsCreated: true,
        publicPublishingEnabled: false,
        liveCheckoutEnabled: false,
        emailSendsEnabled: false,
        fulfillmentEnabled: false,
      }),
      workspace.id,
    )
    .run();

  await writeAuditEvent(db, {
    workspaceId: workspace.id,
    eventKind: "anonymous_playground_claimed",
    idempotencyKey: claimIdempotencyKey,
    metadata: {
      sourceIssueNumber: anonymousPlaygroundIssue,
      claimedTenantId: freeBuild.tenant.id,
      claimedDraftFunnelId: draft.id,
      claimedDraftStepCount: draft.steps.length,
      claimedDraftBlockCount: draft.steps.reduce((total, step) => total + step.blocks.length, 0),
      privateClaimRecordCount: claimRecords.length,
      privateClaimRecordKinds: claimRecords.map((record) => record.kind),
      structuredBuilderFieldsClaimed: true,
      privateLaunchRecordsCreated: true,
      tenantPlanStatus: freeBuild.tenant.planStatus,
      paidGoLiveRequired: freeBuild.paidGoLiveRequired,
      rawCookieStored: false,
      publicPublishingEnabled: false,
    },
  });

  return {
    workspace: (await loadWorkspaceById(db, workspace.id)) ?? workspace,
    tenant: freeBuild.tenant,
    draft,
    claimRecords,
    idempotent: workspace.status === "claimed",
    paidGoLiveRequired: freeBuild.paidGoLiveRequired,
  };
}

export async function cleanupExpiredAnonymousPlaygroundWorkspaces(
  db: D1Database,
  input: {
    confirmationText: string;
    idempotencyKey: string;
    actor: { role: string; email: string | null; userId: string | null };
    batchLimit?: number;
  },
): Promise<AnonymousPlaygroundCleanupResult> {
  if (input.confirmationText.trim() !== anonymousPlaygroundCleanupConfirmationText) {
    throw new AnonymousPlaygroundError("Confirm anonymous playground cleanup before continuing.", 400, "CONFIRMATION_REQUIRED");
  }

  const idempotencyKey = input.idempotencyKey.trim();
  if (!idempotencyKey) {
    throw new AnonymousPlaygroundError("An idempotency key is required.", 400, "IDEMPOTENCY_REQUIRED");
  }

  const batchLimit = Math.max(
    1,
    Math.min(Math.floor(input.batchLimit ?? anonymousPlaygroundCleanupBatchLimit), anonymousPlaygroundCleanupBatchLimit),
  );
  const rows = await db
    .prepare(
      `SELECT id, status, claimed_by_user_id, claimed_tenant_id, expires_at
       FROM anonymous_playground_workspaces
       WHERE status IN ('active', 'claimed')
         AND expires_at <= unixepoch()
       ORDER BY expires_at ASC, updated_at ASC
       LIMIT ?`,
    )
    .bind(batchLimit)
    .all<AnonymousPlaygroundCleanupCandidateRow>();

  let expiredCount = 0;
  let activeExpiredCount = 0;
  let claimedRecoveryExpiredCount = 0;

  for (const row of rows.results ?? []) {
    const replacementTokenHash = await sha256Hex(`bumpgrade-anonymous-playground-expired:${row.id}:${idempotencyKey}`);
    const update = await db
      .prepare(
        `UPDATE anonymous_playground_workspaces
         SET status = 'expired',
             recovery_token_sha256 = ?,
             offer_name = NULL,
             audience = NULL,
             launch_goal = NULL,
             product_format = NULL,
             price_point = NULL,
             lead_magnet = NULL,
             checkout_plan = NULL,
             delivery_plan = NULL,
             follow_up_plan = NULL,
             source_url = NULL,
             selected_importer_slug = NULL,
             metadata_json = ?,
             updated_at = unixepoch(),
             last_seen_at = unixepoch()
         WHERE id = ?
           AND status IN ('active', 'claimed')
           AND expires_at <= unixepoch()`,
      )
      .bind(
        replacementTokenHash,
        JSON.stringify({
          sourceIssueNumber: anonymousPlaygroundIssue,
          cleanupStatus: "expired",
          cleanupReason: "retention_window_elapsed",
          cleanupActorRole: input.actor.role,
          rawDraftContentCleared: true,
          recoveryTokenHashReplaced: true,
          privateClaimRecordsPreserved: true,
          publicPublishingEnabled: false,
          liveCheckoutEnabled: false,
          emailSendsEnabled: false,
          fulfillmentEnabled: false,
        }),
        row.id,
      )
      .run();
    if (!update.meta.changes) continue;

    await writeAuditEvent(db, {
      workspaceId: row.id,
      eventKind: "anonymous_playground_expired",
      idempotencyKey: `${idempotencyKey}-${row.id}`,
      metadata: {
        sourceIssueNumber: anonymousPlaygroundIssue,
        cleanupActorRole: input.actor.role,
        cleanupActorUserId: input.actor.userId,
        previousStatus: row.status,
        previousExpiresAt: isoFromSeconds(row.expires_at),
        claimedBeforeCleanup: Boolean(row.claimed_by_user_id || row.claimed_tenant_id),
        rawDraftContentCleared: true,
        recoveryTokenHashReplaced: true,
        privateClaimRecordsPreserved: true,
        paidGoLiveRequired: true,
      },
    });

    expiredCount += 1;
    if (row.status === "claimed") claimedRecoveryExpiredCount += 1;
    else activeExpiredCount += 1;
  }

  return {
    expiredCount,
    activeExpiredCount,
    claimedRecoveryExpiredCount,
    batchLimit,
    retentionDays: anonymousPlaygroundCookieMaxAgeDays,
    rawDraftContentCleared: true,
    recoveryTokenHashReplaced: true,
    privateClaimRecordsPreserved: true,
    paidGoLiveRequired: true,
  };
}

export function publicAnonymousPlaygroundClaimedDraft(draft: DraftFunnelRecord | null) {
  if (!draft) return null;
  return {
    id: draft.id,
    slug: draft.slug,
    title: draft.title,
    status: draft.status,
    sourceIssueNumber: draft.sourceIssueNumber,
    parentIssueNumber: draft.parentIssueNumber,
    revisionId: draft.revisionId,
    stepCount: draft.steps.length,
    blockCount: draft.steps.reduce((total, step) => total + step.blocks.length, 0),
    previewRoute: draft.previewRoute,
    sourceDataRoute: draft.sourceDataRoute,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  };
}

export function publicAnonymousPlaygroundClaimRecords(records: AnonymousPlaygroundClaimRecord[]) {
  return records.map((record) => ({
    id: record.id,
    kind: record.kind,
    status: record.status,
    title: record.title,
    summary: record.summary,
    sourceUrl: record.sourceUrl,
    selectedImporterSlug: record.selectedImporterSlug,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }));
}

export function publicAnonymousPlaygroundWorkspace(workspace: AnonymousPlaygroundWorkspace | null) {
  if (!workspace) return null;
  const importer = workspace.draft.selectedImporterSlug ? getImporterBySlug(workspace.draft.selectedImporterSlug) : null;

  return {
    id: workspace.id,
    status: workspace.status,
    draft: {
      offerName: workspace.draft.offerName,
      audience: workspace.draft.audience,
      launchGoal: workspace.draft.launchGoal,
      productFormat: workspace.draft.productFormat,
      pricePoint: workspace.draft.pricePoint,
      leadMagnet: workspace.draft.leadMagnet,
      checkoutPlan: workspace.draft.checkoutPlan,
      deliveryPlan: workspace.draft.deliveryPlan,
      followUpPlan: workspace.draft.followUpPlan,
      sourceUrl: workspace.draft.sourceUrl,
      selectedImporter: importer
        ? {
            slug: importer.slug,
            platformName: importer.platformName,
            route: importer.route,
          }
        : null,
    },
    revision: workspace.revision,
    expiresAt: workspace.expiresAt,
    claimed: Boolean(workspace.claimedByUserId || workspace.claimedTenantId),
    paidGoLiveRequired: true,
    redaction: anonymousPlaygroundRedaction({ workspaceIncluded: true }),
  };
}

export function anonymousPlaygroundRedaction(overrides?: {
  workspaceIncluded?: boolean;
  privateLaunchRecordContentIncluded?: boolean;
}) {
  return {
    recoveryCookieValueIncluded: false,
    recoveryTokenHashIncluded: false,
    rawIpIncluded: false,
    rawUserAgentIncluded: false,
    customerDataIncluded: false,
    billingStateCreated: false,
    publicPublishingEnabled: false,
    workspaceIncluded: overrides?.workspaceIncluded ?? false,
    privateLaunchRecordContentIncluded: overrides?.privateLaunchRecordContentIncluded ?? false,
    rawDraftContentIncluded: false,
    expiredWorkspaceContentIncluded: false,
    cleanupActorIncluded: false,
  };
}

export const anonymousPlaygroundSourceData = {
  id: "bumpgrade-anonymous-playground-source-data",
  updatedAt: anonymousPlaygroundUpdatedAt,
  issue: anonymousPlaygroundIssue,
  status: "live",
  routes: {
    playground: anonymousPlaygroundRoute,
    sourceData: anonymousPlaygroundSourceDataRoute,
    saveApi: anonymousPlaygroundApiRoute,
    claimApi: anonymousPlaygroundClaimApiRoute,
    cleanupApi: anonymousPlaygroundCleanupApiRoute,
    pricingSourceData: "/pricing/source-data",
    accountSourceData: "/account/source-data",
    importerSourceData: importerSourceDataRoute,
  },
  cookie: {
    name: anonymousPlaygroundCookieName,
    maxAgeDays: anonymousPlaygroundCookieMaxAgeDays,
    httpOnly: true,
    sameSite: "lax",
    secureInProduction: true,
    storedPublicly: false,
  },
  draftFields: [
    { id: "offerName", label: "Offer name", maxLength: 90 },
    { id: "audience", label: "Audience", maxLength: 180 },
    { id: "launchGoal", label: "Launch goal", maxLength: 260 },
    { id: "productFormat", label: "Product format", maxLength: 140 },
    { id: "pricePoint", label: "Price point", maxLength: 80 },
    { id: "leadMagnet", label: "Lead magnet or first opt-in", maxLength: 180 },
    { id: "checkoutPlan", label: "Checkout plan", maxLength: 220 },
    { id: "deliveryPlan", label: "Delivery plan", maxLength: 220 },
    { id: "followUpPlan", label: "Follow-up plan", maxLength: 220 },
    { id: "sourceUrl", label: "Existing source URL", maxLength: 260 },
    { id: "selectedImporterSlug", label: "Starting platform", allowedValues: importerPlatforms.map((platform) => platform.slug) },
  ],
  currentAvailability: {
    loggedOutSaveLive: true,
    browserRecoveryLive: true,
    structuredBuilderFieldsLive: true,
    anonymousSaveRateLimitLive: true,
    claimToSignedInFreeBuildLive: true,
    claimCreatesPrivateDraftFunnelLive: true,
    claimMapsStructuredFieldsToPrivateDraftBlocksLive: true,
    claimCreatesPrivateLaunchRecordsLive: true,
    cleanupControlsLive: true,
    expiredWorkspaceCleanupLive: true,
    ownerGatedCleanupApiLive: true,
    paidGoLiveRequired: true,
  },
  retentionPolicy: {
    activeRecoveryMaxAgeDays: anonymousPlaygroundCookieMaxAgeDays,
    extendsOnEverySave: true,
    cleanupApiRoute: anonymousPlaygroundCleanupApiRoute,
    cleanupConfirmationText: anonymousPlaygroundCleanupConfirmationText,
    cleanupBatchLimit: anonymousPlaygroundCleanupBatchLimit,
    expiredStatus: "expired",
    expiresWhen: "expires_at is older than the current server time",
    cleanupClearsAnonymousDraftFields: true,
    cleanupReplacesRecoveryTokenHash: true,
    cleanupPreservesAuditEvents: true,
    cleanupPreservesClaimedPrivateRecords: true,
    unclaimedExpiredDraftsRecoverable: false,
  },
  saveRateLimit: {
    scope: "browser_recovery_workspace",
    windowSeconds: anonymousPlaygroundSaveRateLimitWindowSeconds,
    maxSavesPerWindow: anonymousPlaygroundSaveRateLimitMaxSaves,
    appliesAfterFirstSave: true,
    firstSaveCreatesRecovery: true,
    responseCodeWhenLimited: 429,
    responseCode: "ANONYMOUS_PLAYGROUND_SAVE_RATE_LIMITED",
    rawIpStored: false,
    rawUserAgentStored: false,
    recoveryTokenHashExposed: false,
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
  },
  generatedPrivateRecordTypes: [
    "publisher_tenant",
    "funnel_draft",
    "funnel_draft_step",
    "funnel_audit_event",
    ...anonymousPlaygroundClaimRecordKinds.map((record) => record.privateRecordType),
  ],
  privateClaimRecords: {
    storage: "D1 anonymous_playground_claim_records",
    createdOnClaim: true,
    publicSourceDataExposesContent: false,
    kinds: anonymousPlaygroundClaimRecordKinds,
  },
  claimResult: {
    createsOrReusesFreeBuildWorkspace: true,
    createsPrivateDraftFunnel: true,
    mapsStructuredFieldsToDraftBlocks: true,
    createsPrivateLaunchRecords: true,
    privateClaimRecordKinds: anonymousPlaygroundClaimRecordKinds.map((record) => record.id),
    draftSourceDataRoute: "/funnels/source-data",
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
  },
  cleanupResult: {
    route: anonymousPlaygroundCleanupApiRoute,
    auth: "owner session",
    requiresExactConfirmation: true,
    marksExpiredRows: true,
    clearsAnonymousDraftFields: true,
    replacesRecoveryTokenHash: true,
    preservesAuditEvents: true,
    preservesClaimedPrivateRecords: true,
    exposesPrivateDraftContent: false,
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
  },
  goLiveGates: anonymousPlaygroundGoLiveGates,
  redaction: anonymousPlaygroundRedaction(),
  agentBoundary:
    "Agents may read this contract and help a visitor prepare structured draft launch context. Anonymous playground saves are browser-scoped and rapid repeat saves are limited per browser recovery workspace without storing raw IP or user-agent identifiers. Claiming the playground requires an email-verified publisher session and creates a private Free Build workspace, private funnel draft records, and private offer/product/audience/importer-review claim records. Owner cleanup can expire old anonymous recovery, clear anonymous draft fields, and preserve private claimed records. The playground cannot publish, charge buyers, send subscribers, reserve domains, fulfill access, or expose the recovery cookie, token hash, expired draft content, cleanup actor, or private claim-record content in public source-data.",
};
