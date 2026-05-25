import { getCloudflareContext } from "@opennextjs/cloudflare";

import { sha256Hex } from "@/lib/analytics-events";
import { getImporterBySlug, importerPlatforms, importerSourceDataRoute } from "@/lib/importers";
import {
  createFreeBuildWorkspace,
  publisherFreeBuildParentIssue,
  publisherFreeBuildWorkspaceConfirmationText,
  type PublisherSessionUser,
} from "@/lib/publisher-tenants";

export type AnonymousPlaygroundStatus = "active" | "claimed" | "expired";

export type AnonymousPlaygroundDraft = {
  offerName: string;
  audience: string;
  launchGoal: string;
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

type AnonymousPlaygroundWorkspaceRow = {
  id: string;
  status: AnonymousPlaygroundStatus;
  offer_name: string | null;
  audience: string | null;
  launch_goal: string | null;
  selected_importer_slug: string | null;
  revision: number | null;
  expires_at: number | null;
  claimed_by_user_id: string | null;
  claimed_tenant_id: string | null;
  created_at: number | null;
  updated_at: number | null;
  last_seen_at: number | null;
};

type AnonymousPlaygroundAuditRow = {
  workspace_id: string;
  event_kind: string;
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
export const anonymousPlaygroundCookieName = "bumpgrade_anonymous_playground";
export const anonymousPlaygroundCookieMaxAgeSeconds = 60 * 60 * 24 * 30;
export const anonymousPlaygroundCookieMaxAgeDays = 30;
export const anonymousPlaygroundClaimConfirmationText = "Attach this playground to my Bumpgrade account";

export const anonymousPlaygroundGoLiveGates = [
  "Public publishing",
  "Live checkout and payment collection",
  "Buyer or subscriber sends",
  "Custom domains and Bumpgrade subdomains",
  "Fulfillment and protected product access",
];

const defaultDraft: AnonymousPlaygroundDraft = {
  offerName: "",
  audience: "",
  launchGoal: "",
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

export function normalizeAnonymousPlaygroundDraft(input: Partial<AnonymousPlaygroundDraft>): AnonymousPlaygroundDraft {
  return {
    offerName: clampText(input.offerName ?? "", 90),
    audience: clampText(input.audience ?? "", 180),
    launchGoal: clampText(input.launchGoal ?? "", 260),
    selectedImporterSlug: normalizeImporterSlug(input.selectedImporterSlug) ?? defaultDraft.selectedImporterSlug,
  };
}

export function hasAnonymousPlaygroundDraftContent(draft: AnonymousPlaygroundDraft) {
  return Boolean(draft.offerName || draft.audience || draft.launchGoal || draft.selectedImporterSlug);
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
    if (idempotentWorkspace) return { workspace: idempotentWorkspace, idempotent: true };
  }

  if (existing) {
    await db
      .prepare(
        `UPDATE anonymous_playground_workspaces
         SET offer_name = ?,
             audience = ?,
             launch_goal = ?,
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
        paidGoLiveRequired: true,
        rawCookieStored: false,
        publicPublishingEnabled: false,
      },
    });

    return { workspace: (await loadWorkspaceById(db, existing.id)) ?? existing, idempotent: false };
  }

  const workspaceId = runtimeId("anonymous-playground");
  await db
    .prepare(
      `INSERT INTO anonymous_playground_workspaces (
        id, recovery_token_sha256, status, offer_name, audience, launch_goal,
        selected_importer_slug, revision, expires_at, source_issue_number,
        metadata_json, created_at, updated_at, last_seen_at
      ) VALUES (?, ?, 'active', ?, ?, ?, ?, 1, unixepoch() + ?, ?, ?, unixepoch(), unixepoch(), unixepoch())`,
    )
    .bind(
      workspaceId,
      recoveryTokenSha256,
      draft.offerName,
      draft.audience,
      draft.launchGoal,
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
      paidGoLiveRequired: true,
      rawCookieStored: false,
      publicPublishingEnabled: false,
    },
  });

  return { workspace: (await loadWorkspaceById(db, workspaceId))!, idempotent: false };
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

  await db
    .prepare(
      `UPDATE anonymous_playground_workspaces
       SET status = 'claimed',
           claimed_by_user_id = ?,
           claimed_tenant_id = ?,
           updated_at = unixepoch(),
           last_seen_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(user.id, freeBuild.tenant.id, workspace.id)
    .run();

  await writeAuditEvent(db, {
    workspaceId: workspace.id,
    eventKind: "anonymous_playground_claimed",
    idempotencyKey: claimIdempotencyKey,
    metadata: {
      sourceIssueNumber: anonymousPlaygroundIssue,
      claimedTenantId: freeBuild.tenant.id,
      tenantPlanStatus: freeBuild.tenant.planStatus,
      paidGoLiveRequired: freeBuild.paidGoLiveRequired,
      rawCookieStored: false,
      publicPublishingEnabled: false,
    },
  });

  return {
    workspace: (await loadWorkspaceById(db, workspace.id)) ?? workspace,
    tenant: freeBuild.tenant,
    idempotent: workspace.status === "claimed",
    paidGoLiveRequired: freeBuild.paidGoLiveRequired,
  };
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

export function anonymousPlaygroundRedaction(overrides?: { workspaceIncluded?: boolean }) {
  return {
    recoveryCookieValueIncluded: false,
    recoveryTokenHashIncluded: false,
    rawIpIncluded: false,
    rawUserAgentIncluded: false,
    customerDataIncluded: false,
    billingStateCreated: false,
    publicPublishingEnabled: false,
    workspaceIncluded: overrides?.workspaceIncluded ?? false,
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
    { id: "selectedImporterSlug", label: "Starting platform", allowedValues: importerPlatforms.map((platform) => platform.slug) },
  ],
  currentAvailability: {
    loggedOutSaveLive: true,
    browserRecoveryLive: true,
    claimToSignedInFreeBuildLive: true,
    paidGoLiveRequired: true,
  },
  goLiveGates: anonymousPlaygroundGoLiveGates,
  redaction: anonymousPlaygroundRedaction(),
  agentBoundary:
    "Agents may read this contract and help a visitor prepare draft launch context, but anonymous playground state is browser-scoped and cannot publish, charge buyers, send subscribers, reserve domains, fulfill access, or expose the recovery cookie or token hash.",
};
