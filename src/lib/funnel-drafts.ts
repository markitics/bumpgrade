import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { checkoutOfferStack, type CheckoutOffer } from "@/lib/checkout-offers";
import { productAccessCatalogs } from "@/lib/product-access";
import type {
  FunnelBlock,
  FunnelBlockKind,
  FunnelCheckoutLink,
  FunnelRecord,
  FunnelResourceDeliveryLink,
  FunnelStep,
  FunnelStepKind,
  FunnelWebinarEventLink,
  FunnelTemplate,
  FunnelTemplateStep,
} from "@/lib/funnels";
import {
  importerDraftImportCapabilityId,
  importerDraftRollbackCapabilityId,
  importerDraftRollbackConfirmationText,
  getImporterBySlug,
  importerIssue,
  type ImportDraftEntity,
} from "@/lib/importers";
import {
  checkoutLinkingCapability,
  draftFunnelAdvancedParityIssue,
  draftFunnelArchiveCapability,
  draftFunnelArchiveIssue,
  draftFunnelBlockEditingCapability,
  draftFunnelBlockCrossStepMoveCapability,
  draftFunnelBlockEditingIssue,
  draftFunnelBlockReorderCapability,
  draftFunnelBlockStructureCapability,
  draftFunnelBlockVisualStyleCapability,
  draftFunnelBlockStructureIssue,
  draftFunnelCheckoutUnlinkCapability,
  draftFunnelResourceDeliveryLinkCapability,
  draftFunnelWebinarEventLinkCapability,
  draftFunnelPurgeCapability,
  draftFunnelDuplicationCapability,
  draftFunnelDuplicationIssue,
  draftFunnelCheckoutLinkingIssue,
  draftFunnelBuilderIssue,
  draftFunnelBuilderParentIssue,
  draftFunnelBuilderWriteBoundary,
  draftFunnelPublishingIssue,
  draftFunnelStepEditingIssue,
  draftFunnelTemplateCreationIssue,
  editableDraftCapability,
  agentFunnelDraftWriteApiRoute,
  agentFunnelDraftWriteCapability,
  funnelBlockVisualStyleForId,
  funnelBlockLibrary,
  funnelTemplateLibrary,
  isFunnelBlockVisualStyleId,
  seededFunnel,
  templateDraftCreationCapability,
} from "@/lib/funnels";

export type DraftFunnelSource = "d1" | "fixture";
export type DraftFunnelStatus = "draft" | "review" | "published" | "archived";

export type DraftFunnelRecord = {
  id: string;
  slug: string;
  title: string;
  status: DraftFunnelStatus;
  summary: string;
  sourceIssueNumber: number;
  parentIssueNumber: number;
  previewRoute: string | null;
  sourceDataRoute: string;
  revisionId: string;
  createdByEmail: string;
  ownerUserId: string | null;
  steps: DraftFunnelStepRecord[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type DraftFunnelStepRecord = {
  id: string;
  slug: string;
  order: number;
  kind: FunnelStepKind;
  title: string;
  goal: string;
  routeAnchor: string;
  blocks: FunnelBlock[];
};

export type DraftFunnelAdminState = {
  source: DraftFunnelSource;
  loadError: string | null;
  drafts: DraftFunnelRecord[];
  canWrite: boolean;
  storage: string;
  writeBoundary: string;
};

export type DraftFunnelPreviewState = {
  source: DraftFunnelSource;
  loadError: string | null;
  draft: DraftFunnelRecord | null;
  storage: string;
  writeBoundary: string;
};

export type DraftFunnelPurgeResult = {
  id: string;
  draftId: string;
  draftSlug: string;
  draftTitle: string;
  previousStatus: "archived";
  previousRevisionId: string;
  actorEmail: string;
  summary: string;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
  createdAt: string | null;
};

export type AgentFunnelWriteAudit = {
  operationId: string;
  auditCorrelationId: string;
};

type D1FunnelDraftRow = {
  id: string;
  owner_user_id: string | null;
  slug: string;
  title: string;
  status: DraftFunnelStatus;
  summary: string;
  source_issue_number: number;
  parent_issue_number: number;
  preview_route: string | null;
  source_data_route: string;
  revision_id: string;
  created_by_email: string;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

type D1FunnelStepRow = {
  id: string;
  funnel_draft_id: string;
  slug: string;
  step_order: number;
  kind: FunnelStepKind;
  title: string;
  goal: string;
  route_anchor: string;
  blocks_json: string;
};

type D1FunnelPurgeEventRow = {
  id: string;
  draft_id: string;
  draft_slug: string;
  draft_title: string;
  previous_status: "archived";
  previous_revision_id: string;
  actor_email: string;
  summary: string;
  idempotency_key: string;
  metadata_json: string | null;
  created_at: number;
};

type D1CompetitorImportPrivateRecordRow = {
  id: string;
  tenant_id: string;
  draft_funnel_id: string;
  owner_user_id: string | null;
  importer_platform_id: string;
  importer_slug: string;
  platform_name: string;
  record_kind: ImportDraftEntity;
  status: "private_draft" | "archived";
  title: string;
  summary: string;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

const draftFunnelStepKinds: FunnelStepKind[] = ["opt_in", "sales", "checkout", "upsell", "webinar", "resource", "thank_you"];
export const draftFunnelPublishConfirmationText = "Publish this draft funnel publicly on Bumpgrade";
export const draftFunnelTemplateCreationConfirmationText = "Create a private draft from this funnel template";
export const draftFunnelCheckoutLinkConfirmationText = "Link this draft funnel step to the seeded checkout offer";
export const draftFunnelCheckoutUnlinkConfirmationText = "Unlink this checkout offer from this draft block";
export const draftFunnelResourceDeliveryLinkConfirmationText = "Link this draft block to product resource delivery";
export const draftFunnelWebinarEventLinkConfirmationText = "Link this draft webinar block to event and replay URLs";
export const draftFunnelDuplicationConfirmationText = "Duplicate this draft funnel privately";
export const draftFunnelArchiveConfirmationText = "Archive this draft funnel and unpublish any public route";
export const draftFunnelPurgeConfirmationText = "Purge this archived draft funnel and keep tombstone evidence";

function isoFromSeconds(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function slugifyDraftFunnelTitle(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return slug || "untitled-funnel";
}

export function draftFunnelPreviewPath(draftId: string) {
  return `/admin/funnels/${encodeURIComponent(draftId)}/preview`;
}

export function publicFunnelPath(slug: string) {
  return `/funnels/${encodeURIComponent(slug)}`;
}

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function identityEmail(identity: AdminIdentity) {
  return identity.email ?? "unknown-owner@bumpgrade.local";
}

function publisherIdentityEmail(identity: { email: string }) {
  return identity.email.trim().toLowerCase();
}

function agentFunnelWriteMetadata(
  audit: AgentFunnelWriteAudit | undefined,
  options: { publicRouteMutation?: boolean } = {},
) {
  if (!audit) return {};

  return {
    agentFunnelDraftWriteIssue: agentFunnelDraftWriteCapability.issue,
    agentFunnelDraftWriteCapability: agentFunnelDraftWriteCapability.id,
    agentFunnelDraftWriteApiRoute,
    agentFunnelDraftWriteOperationId: audit.operationId,
    auditCorrelationId: audit.auditCorrelationId,
    directAgentSafeWrite: true,
    publicRouteMutation: options.publicRouteMutation ?? false,
    publicAgentWrite: false,
    ownerSessionRequired: true,
    exactAgentConfirmationRequired: true,
    responseRedacted: true,
  };
}

function draftBlocksForStep(step: FunnelStep): FunnelBlock[] {
  return step.blocks.map((block) => ({
    ...block,
    id: block.id.replace(/^block-/, "draft-block-"),
  }));
}

function blockLibraryItem(kind: FunnelBlock["kind"]) {
  return funnelBlockLibrary.find((block) => block.kind === kind);
}

function draftBlocksForTemplateStep(draftId: string, step: FunnelTemplateStep): FunnelBlock[] {
  return step.requiredBlockKinds.map((kind, index) => {
    const libraryItem = blockLibraryItem(kind);
    return {
      id: `${draftId}-block-${step.order}-${kind}-${index + 1}`,
      kind,
      title: libraryItem?.title ?? `${kind.replaceAll("_", " ")} block`,
      body: libraryItem?.purpose ?? "Reusable template block.",
      agentEditable: libraryItem?.agentEditable ?? false,
    };
  });
}

function duplicateBlocksForStep(draftId: string, step: DraftFunnelStepRecord): FunnelBlock[] {
  return step.blocks.map((block, index) => {
    const copiedLinkNotice = block.checkoutLink
      ? "Checkout-link metadata was intentionally not copied. Review this duplicate and link an offer again before publishing."
      : block.resourceDeliveryLink
        ? "Resource-delivery metadata was intentionally not copied. Review this duplicate and link product access again before publishing."
      : block.webinarEventLink
        ? "Webinar event-link metadata was intentionally not copied. Review this duplicate and link event or replay URLs again before publishing."
        : block.body;

    return {
      ...block,
      id: `${draftId}-block-${step.order}-${block.kind}-${index + 1}`,
      body: copiedLinkNotice,
      checkoutLink: undefined,
      resourceDeliveryLink: undefined,
      webinarEventLink: undefined,
    };
  });
}

function templateSteps(draftId: string): DraftFunnelStepRecord[] {
  return seededFunnel.steps.map((step) => ({
    id: `${draftId}-${step.kind}-${step.order}`,
    slug: step.slug,
    order: step.order,
    kind: step.kind,
    title: step.title,
    goal: step.goal,
    routeAnchor: step.routeAnchor,
    blocks: draftBlocksForStep(step),
  }));
}

function templateLibrarySteps(draftId: string, template: FunnelTemplate): DraftFunnelStepRecord[] {
  return template.steps.map((step) => {
    const slug = slugifyDraftFunnelTitle(step.title);
    return {
      id: `${draftId}-${step.kind}-${step.order}`,
      slug,
      order: step.order,
      kind: step.kind,
      title: step.title,
      goal: `${step.title} for ${template.title}.`,
      routeAnchor: slug,
      blocks: draftBlocksForTemplateStep(draftId, step),
    };
  });
}

export const fixtureDraftFunnel: DraftFunnelRecord = {
  id: "funnel-draft-fixture-indie-launch-working-copy",
  slug: "indie-launch-working-copy",
  title: "Indie launch working draft",
  status: "draft",
  summary:
    "Fixture fallback showing the owner-gated draft builder shape when D1 is unavailable locally. Real draft writes use the funnel_drafts and funnel_draft_steps tables.",
  sourceIssueNumber: draftFunnelBuilderIssue,
  parentIssueNumber: draftFunnelBuilderParentIssue,
  previewRoute: null,
  sourceDataRoute: "/funnels/source-data",
  revisionId: "funnel-draft-fixture-revision-2026-05-18",
  createdByEmail: "fixture@bumpgrade.local",
  ownerUserId: null,
  steps: templateSteps("funnel-draft-fixture-indie-launch-working-copy"),
  createdAt: null,
  updatedAt: null,
};

function fallbackDraftState(loadError: string | null): DraftFunnelAdminState {
  return {
    source: "fixture",
    loadError,
    drafts: [fixtureDraftFunnel],
    canWrite: false,
    storage: "Fixture fallback only. D1 writes need the funnel_drafts, funnel_draft_steps, and funnel_audit_events tables.",
    writeBoundary: draftFunnelBuilderWriteBoundary,
  };
}

export async function getOptionalFunnelDraftD1() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as Cloudflare.Env).DB ?? null;
  } catch {
    return null;
  }
}

export async function getFunnelDraftD1OrThrow() {
  const db = await getOptionalFunnelDraftD1();
  if (!db) throw new Error("Cloudflare D1 binding DB is not available.");
  return db;
}

function draftFromRow(row: D1FunnelDraftRow, steps: DraftFunnelStepRecord[]): DraftFunnelRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    summary: row.summary,
    sourceIssueNumber: row.source_issue_number,
    parentIssueNumber: row.parent_issue_number,
    previewRoute: row.preview_route,
    sourceDataRoute: row.source_data_route,
    revisionId: row.revision_id,
    createdByEmail: row.created_by_email,
    ownerUserId: row.owner_user_id,
    steps,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

function purgeEventFromRow(row: D1FunnelPurgeEventRow): DraftFunnelPurgeResult {
  return {
    id: row.id,
    draftId: row.draft_id,
    draftSlug: row.draft_slug,
    draftTitle: row.draft_title,
    previousStatus: row.previous_status,
    previousRevisionId: row.previous_revision_id,
    actorEmail: row.actor_email,
    summary: row.summary,
    idempotencyKey: row.idempotency_key,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {}),
    createdAt: isoFromSeconds(row.created_at),
  };
}

async function loadDraftsFromD1(db: D1Database): Promise<DraftFunnelRecord[]> {
  const draftResult = await db
    .prepare("SELECT * FROM funnel_drafts ORDER BY updated_at DESC, title ASC LIMIT 25")
    .all<D1FunnelDraftRow>();
  const rows = draftResult.results ?? [];
  if (rows.length === 0) return [];

  const stepResult = await db
    .prepare("SELECT * FROM funnel_draft_steps ORDER BY funnel_draft_id ASC, step_order ASC")
    .all<D1FunnelStepRow>();
  const stepRows = stepResult.results ?? [];
  const stepsByDraftId = new Map<string, DraftFunnelStepRecord[]>();

  for (const step of stepRows) {
    const current = stepsByDraftId.get(step.funnel_draft_id) ?? [];
    current.push({
      id: step.id,
      slug: step.slug,
      order: step.step_order,
      kind: step.kind,
      title: step.title,
      goal: step.goal,
      routeAnchor: step.route_anchor,
      blocks: parseJson<FunnelBlock[]>(step.blocks_json, []),
    });
    stepsByDraftId.set(step.funnel_draft_id, current);
  }

  return rows.map((row) => draftFromRow(row, stepsByDraftId.get(row.id) ?? []));
}

async function loadDraftStepsFromD1(db: D1Database, draftId: string) {
  const stepResult = await db
    .prepare("SELECT * FROM funnel_draft_steps WHERE funnel_draft_id = ? ORDER BY step_order ASC")
    .bind(draftId)
    .all<D1FunnelStepRow>();

  return (stepResult.results ?? []).map((step) => ({
    id: step.id,
    slug: step.slug,
    order: step.step_order,
    kind: step.kind,
    title: step.title,
    goal: step.goal,
    routeAnchor: step.route_anchor,
    blocks: parseJson<FunnelBlock[]>(step.blocks_json, []),
  }));
}

async function loadDraftFromD1(db: D1Database, draftId: string) {
  const row = await db
    .prepare("SELECT * FROM funnel_drafts WHERE id = ? OR slug = ? LIMIT 1")
    .bind(draftId, draftId)
    .first<D1FunnelDraftRow>();
  if (!row) return null;

  return draftFromRow(row, await loadDraftStepsFromD1(db, row.id));
}

async function purgeEventForIdempotencyKey(db: D1Database, idempotencyKey: string) {
  const existing = await db
    .prepare("SELECT * FROM funnel_purge_events WHERE idempotency_key = ?")
    .bind(idempotencyKey)
    .first<D1FunnelPurgeEventRow>();

  return existing ? purgeEventFromRow(existing) : null;
}

async function loadDraftBySlugFromD1(db: D1Database, slug: string, status?: DraftFunnelStatus) {
  const row = status
    ? await db.prepare("SELECT * FROM funnel_drafts WHERE slug = ? AND status = ?").bind(slug, status).first<D1FunnelDraftRow>()
    : await db.prepare("SELECT * FROM funnel_drafts WHERE slug = ?").bind(slug).first<D1FunnelDraftRow>();

  if (!row) return null;
  return draftFromRow(row, await loadDraftStepsFromD1(db, row.id));
}

function fixtureDraftForId(draftId: string) {
  return [fixtureDraftFunnel].find((draft) => draft.id === draftId || draft.slug === draftId) ?? null;
}

export async function getDraftFunnelAdminState(): Promise<DraftFunnelAdminState> {
  try {
    const db = await getFunnelDraftD1OrThrow();
    const drafts = await loadDraftsFromD1(db);
    return {
      source: "d1",
      loadError: drafts.length === 0 ? "D1 draft tables are reachable, but no draft funnels exist yet." : null,
      drafts,
      canWrite: true,
      storage: "D1 tables: funnel_drafts, funnel_draft_steps, funnel_audit_events.",
      writeBoundary: draftFunnelBuilderWriteBoundary,
    };
  } catch (error) {
    return fallbackDraftState(error instanceof Error ? error.message : "Unable to load draft funnel D1 records.");
  }
}

export async function getDraftFunnelPreviewState(draftId: string): Promise<DraftFunnelPreviewState> {
  const normalizedDraftId = draftId.trim();
  try {
    const db = await getFunnelDraftD1OrThrow();
    const draft = await loadDraftFromD1(db, normalizedDraftId);
    return {
      source: "d1",
      loadError: draft ? null : "D1 draft tables are reachable, but this draft funnel was not found.",
      draft,
      storage: "D1 tables: funnel_drafts, funnel_draft_steps, funnel_audit_events.",
      writeBoundary: draftFunnelBuilderWriteBoundary,
    };
  } catch (error) {
    return {
      source: "fixture",
      loadError: error instanceof Error ? error.message : "Unable to load draft funnel D1 records.",
      draft: fixtureDraftForId(normalizedDraftId),
      storage: "Fixture fallback only. D1 writes need the funnel_drafts, funnel_draft_steps, and funnel_audit_events tables.",
      writeBoundary: draftFunnelBuilderWriteBoundary,
    };
  }
}

async function uniqueDraftSlug(db: D1Database, baseSlug: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await db.prepare("SELECT id FROM funnel_drafts WHERE slug = ?").bind(candidate).first()) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function insertDraftStatement(db: D1Database, draft: DraftFunnelRecord, metadata: Record<string, unknown>) {
  return db
    .prepare(
      `INSERT INTO funnel_drafts (
        id, owner_user_id, slug, title, status, summary, source_issue_number, parent_issue_number,
        preview_route, source_data_route, revision_id, created_by_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        status=excluded.status,
        summary=excluded.summary,
        revision_id=excluded.revision_id,
        metadata_json=excluded.metadata_json,
        updated_at=unixepoch()`,
    )
    .bind(
      draft.id,
      draft.ownerUserId,
      draft.slug,
      draft.title,
      draft.status,
      draft.summary,
      draft.sourceIssueNumber,
      draft.parentIssueNumber,
      draft.previewRoute,
      draft.sourceDataRoute,
      draft.revisionId,
      draft.createdByEmail,
      JSON.stringify(metadata),
    );
}

function insertStepStatements(db: D1Database, draft: DraftFunnelRecord) {
  return draft.steps.map((step) =>
    db
      .prepare(
        `INSERT INTO funnel_draft_steps (
          id, funnel_draft_id, slug, step_order, kind, title, goal, route_anchor, blocks_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
        ON CONFLICT(id) DO UPDATE SET
          slug=excluded.slug,
          step_order=excluded.step_order,
          kind=excluded.kind,
          title=excluded.title,
          goal=excluded.goal,
          route_anchor=excluded.route_anchor,
          blocks_json=excluded.blocks_json,
          updated_at=unixepoch()`,
      )
      .bind(
        step.id,
        draft.id,
        step.slug,
        step.order,
        step.kind,
        step.title,
        step.goal,
        step.routeAnchor,
        JSON.stringify(step.blocks),
      ),
  );
}

function parkExistingStepOrdersStatement(db: D1Database, draftId: string) {
  return db
    .prepare("UPDATE funnel_draft_steps SET step_order = (step_order * -1) - 1000 WHERE funnel_draft_id = ?")
    .bind(draftId);
}

function insertAuditStatement(
  db: D1Database,
  draft: DraftFunnelRecord,
  identity: AdminIdentity,
  eventKind: "draft_seeded" | "draft_created" | "draft_duplicated" | "draft_updated" | "draft_published",
  idempotencyKey: string,
  summary?: string,
  metadata: Record<string, unknown> = {},
) {
  const action =
    eventKind === "draft_seeded"
      ? "seeded"
      : eventKind === "draft_created"
        ? "created"
        : eventKind === "draft_duplicated"
          ? "duplicated"
        : eventKind === "draft_published"
          ? "published"
          : "updated";
  const issue =
    eventKind === "draft_updated"
      ? draftFunnelStepEditingIssue
      : eventKind === "draft_published"
        ? draftFunnelPublishingIssue
        : eventKind === "draft_duplicated"
          ? draftFunnelDuplicationIssue
          : draft.sourceIssueNumber;
  return db
    .prepare(
      `INSERT INTO funnel_audit_events (
        id, funnel_draft_id, actor_user_id, actor_email, event_kind, summary, idempotency_key, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
      ON CONFLICT(idempotency_key) DO NOTHING`,
    )
    .bind(
      runtimeId("funnel-audit"),
      draft.id,
      identity.userId,
      identityEmail(identity),
      eventKind,
      summary ?? `${identityEmail(identity)} ${action} ${draft.title}.`,
      idempotencyKey,
      JSON.stringify({ issue, parentIssue: draft.parentIssueNumber, ...metadata }),
    );
}

async function persistDraft(
  db: D1Database,
  draft: DraftFunnelRecord,
  identity: AdminIdentity,
  eventKind: "draft_seeded" | "draft_created" | "draft_duplicated",
  idempotencyKey: string,
  metadata: Record<string, unknown> = {},
) {
  await db.batch([
    insertDraftStatement(db, draft, {
      issue: draft.sourceIssueNumber,
      parentIssue: draft.parentIssueNumber,
      editableDraftCapability: editableDraftCapability.id,
      ...metadata,
    }),
    parkExistingStepOrdersStatement(db, draft.id),
    ...insertStepStatements(db, draft),
    insertAuditStatement(db, draft, identity, eventKind, idempotencyKey, undefined, metadata),
  ]);

  const persisted = await loadDraftsFromD1(db);
  return persisted.find((item) => item.id === draft.id) ?? draft;
}

export async function seedEditableFunnelDraft(db: D1Database, identity: AdminIdentity, idempotencyKey: string) {
  const draftId = "funnel-draft-indie-launch-working-copy";
  const draft: DraftFunnelRecord = {
    id: draftId,
    slug: "indie-launch-working-copy",
    title: "Indie launch working draft",
    status: "draft",
    summary:
      "Owner-gated working copy seeded from the indie launch sandbox funnel. It can be inspected by the owner before granular editing, preview generation, and publishing ship.",
    sourceIssueNumber: draftFunnelBuilderIssue,
    parentIssueNumber: draftFunnelBuilderParentIssue,
    previewRoute: null,
    sourceDataRoute: "/funnels/source-data",
    revisionId: "funnel-draft-revision-indie-launch-working-copy-2026-05-18",
    createdByEmail: identityEmail(identity),
    ownerUserId: identity.userId,
    steps: templateSteps(draftId),
    createdAt: null,
    updatedAt: null,
  };

  return persistDraft(db, draft, identity, "draft_seeded", idempotencyKey);
}

async function draftForIdempotencyKey(db: D1Database, idempotencyKey: string) {
  const existing = await db
    .prepare("SELECT funnel_draft_id FROM funnel_audit_events WHERE idempotency_key = ?")
    .bind(idempotencyKey)
    .first<{ funnel_draft_id: string | null }>();

  if (!existing?.funnel_draft_id) return null;
  return loadDraftFromD1(db, existing.funnel_draft_id);
}

export async function createDraftFunnelFromTemplate(
  db: D1Database,
  identity: AdminIdentity,
  input: { title: string; idempotencyKey: string },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const baseTitle = input.title.trim() || "Untitled launch funnel";
  const slug = await uniqueDraftSlug(db, slugifyDraftFunnelTitle(baseTitle));
  const draftId = `funnel-draft-${slug}`;
  const draft: DraftFunnelRecord = {
    id: draftId,
    slug,
    title: baseTitle.slice(0, 120),
    status: "draft",
    summary:
      "Owner-gated editable draft funnel created from the default three-step opt-in, sales, and thank-you template.",
    sourceIssueNumber: draftFunnelBuilderIssue,
    parentIssueNumber: draftFunnelBuilderParentIssue,
    previewRoute: null,
    sourceDataRoute: "/funnels/source-data",
    revisionId: `funnel-draft-revision-${slug}-${new Date().toISOString().slice(0, 10)}`,
    createdByEmail: identityEmail(identity),
    ownerUserId: identity.userId,
    steps: templateSteps(draftId),
    createdAt: null,
    updatedAt: null,
  };

  return persistDraft(db, draft, identity, "draft_created", input.idempotencyKey);
}

export type CompetitorImportedDraftInput = {
  tenantId: string;
  importerSlug: string;
  platformName: string;
  offerTitle: string;
  audience: string;
  launchGoal: string;
  sourceUrls: string[];
  sourceFileNames: string[];
  pageCopy: string;
  followUpNotes: string;
  importReview?: CompetitorImportReviewMetadata | null;
  idempotencyKey: string;
};

export type ClickFunnelsImportedDraftInput = Omit<CompetitorImportedDraftInput, "importerSlug" | "platformName">;

export type ImporterDuplicateReviewStatus = "created" | "idempotent_replay" | "source_match_reused";

export type ImporterDuplicateReview = {
  status: ImporterDuplicateReviewStatus;
  checkedFields: string[];
  matchedFields: string[];
  createsNewDraft: boolean;
  reusesExistingDraft: boolean;
  sourceUrlCompared: boolean;
  sourceFileNameCompared: boolean;
  rawSourceEchoed: false;
};

export type CompetitorImportReviewMetadata = {
  responseField: "importReview";
  privateDraftMetadataStored: boolean;
  privateDraftMetadataReason: "pending_private_draft_create" | "created" | "idempotent_replay" | "source_match_reused";
  exportFileAnalysis: {
    fileCount: number;
    uploadedFileCount: number;
    pastedManifestCount: number;
    parsedFileCount: number;
    skippedFileCount: number;
    maxFilesPerReview: number;
    maxParsedBytesPerFile: number;
    detectedSignalLabels: string[];
    detectedHeaderLabels: string[];
    files: Array<{
      id: string;
      label: string;
      kind: string;
      parseStatus: string;
      sizeBucket: string;
      rowCount: number | null;
      objectCount: number | null;
      detectedHeaderLabels: string[];
      detectedSignalLabels: string[];
      rawFileNameEchoed: false;
      rawRowsEchoed: false;
      rawTextEchoed: false;
    }>;
    rawExportFilesIncluded: false;
    rawFileNamesEchoed: false;
    rawRowsEchoed: false;
    rawTextEchoed: false;
  };
  platformExportMatches: Array<{
    id: string;
    label: string;
    status: string;
    matchedFileKinds: string[];
    matchedRequiredHeaders: string[];
    missingRequiredHeaders: string[];
    matchedHelpfulHeaders: string[];
    matchedSignalLabels: string[];
    sourceChecklistItemIds: string[];
    draftEntities: ImportDraftEntity[];
    usesItFor: string;
    reviewPrompt: string;
    rawSourceEchoed: false;
  }>;
  recognizedPlatformExportMatchIds: string[];
  goLiveEffects: {
    publicPublishingEnabled: false;
    liveCheckoutEnabled: false;
    subscriberSendsEnabled: false;
    customDomainsEnabled: false;
    fulfillmentEnabled: false;
  };
  redaction: {
    rawExportFilesIncluded: false;
    rawFileNamesEchoed: false;
    rawRowsEchoed: false;
    rawTextEchoed: false;
    rawSourceEchoed: false;
    rawPastedMaterialIncludedInResponse: false;
    customerRowsIncluded: false;
    privateEmailsIncluded: false;
    paymentCredentialsIncluded: false;
    sessionCookiesIncluded: false;
  };
};

export type CompetitorImportPrivateRecord = {
  id: string;
  responseField: "importRecords";
  privateRecordType: "competitor_import_private_record";
  kind: ImportDraftEntity;
  status: "private_draft" | "archived";
  title: string;
  summary: string;
  importerPlatformId: string;
  importerSlug: string;
  platformName: string;
  draftFunnelId: string;
  tenantId: string;
  ownerUserId: string | null;
  draftEntities: ImportDraftEntity[];
  sourceChecklistItemIds: string[];
  recognizedPlatformExportMatchIds: string[];
  matchedHeaderLabels: string[];
  matchedSignalLabels: string[];
  sourceUrlCount: number;
  sourceFileNameCount: number;
  exportFileCount: number;
  parsedExportFileCount: number;
  recordConfidence: "recognized_export_match" | "needs_more_context" | "source_guide";
  goLiveEffects: {
    publicPublishingEnabled: false;
    liveCheckoutEnabled: false;
    subscriberSendsEnabled: false;
    customDomainsEnabled: false;
    fulfillmentEnabled: false;
  };
  redaction: {
    rawExportFilesIncluded: false;
    rawFileNamesEchoed: false;
    rawRowsEchoed: false;
    rawTextEchoed: false;
    rawSourceEchoed: false;
    rawPastedMaterialIncludedInResponse: false;
    customerRowsIncluded: false;
    privateEmailsIncluded: false;
    paymentCredentialsIncluded: false;
    sessionCookiesIncluded: false;
  };
  createdAt: string | null;
  updatedAt: string | null;
};

export type CompetitorImportedDraftResult = {
  draft: DraftFunnelRecord;
  duplicateReview: ImporterDuplicateReview;
  importReview: CompetitorImportReviewMetadata | null;
  importRecords: CompetitorImportPrivateRecord[];
};

export type CompetitorImportedDraftRollbackResult = {
  draft: DraftFunnelRecord;
  previousStatus: DraftFunnelStatus;
  previousRevisionId: string;
  previousPreviewRoute: string | null;
  idempotent: boolean;
  restartsAvailable: true;
  deletedDraftRows: false;
  deletedStepRows: false;
  deletedAuditRows: false;
  publicPublishingEnabled: false;
  liveCheckoutEnabled: false;
  subscriberSendsEnabled: false;
  customDomainsEnabled: false;
  fulfillmentEnabled: false;
  rawSourceEchoed: false;
};

export type CompetitorImportedDraftReview = {
  draft: DraftFunnelRecord;
  importerPlatformId: string;
  importerSlug: string;
  platformName: string;
  tenantId: string;
  importReview: CompetitorImportReviewMetadata | null;
  importRecords: CompetitorImportPrivateRecord[];
  goLiveEffects: CompetitorImportPrivateRecord["goLiveEffects"];
  redaction: CompetitorImportPrivateRecord["redaction"];
};

export type AnonymousPlaygroundClaimedDraftInput = {
  tenantId: string;
  workspaceId: string;
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
  sourceIssueNumber: number;
  idempotencyKey: string;
};

function compactImportText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function importedBlock(id: string, kind: FunnelBlockKind, title: string, body: string, agentEditable: boolean): FunnelBlock {
  return {
    id,
    kind,
    title: compactImportText(title, 120),
    body: compactImportText(body, 1_200),
    agentEditable,
  };
}

function importedCompetitorSteps(
  draftId: string,
  input: Pick<
    CompetitorImportedDraftInput,
    | "platformName"
    | "offerTitle"
    | "audience"
    | "launchGoal"
    | "sourceUrls"
    | "sourceFileNames"
    | "pageCopy"
    | "followUpNotes"
  >,
): DraftFunnelStepRecord[] {
  const platformName = compactImportText(input.platformName, 80) || "current platform";
  const offerTitle = compactImportText(input.offerTitle, 120) || `${platformName} import draft`;
  const audience = compactImportText(input.audience, 180) || "the intended buyers";
  const launchGoal = compactImportText(input.launchGoal, 300) || "turn the imported material into a private launch path";
  const sourceUrlSummary = input.sourceUrls.length
    ? `Imported starting URLs: ${input.sourceUrls.join(", ")}.`
    : "No public source URL was attached to this import.";
  const sourceFileSummary = input.sourceFileNames.length
    ? `Export file names noted for private duplicate review: ${input.sourceFileNames.join(", ")}.`
    : "No export file name was attached to this import.";
  const pageCopy =
    compactImportText(input.pageCopy, 900) ||
    "Review the imported source material, then refine the page copy before publishing.";
  const followUpNotes =
    compactImportText(input.followUpNotes, 600) ||
    "Decide the follow-up message, delivery expectation, and next relationship step before any subscriber send.";

  return [
    {
      id: `${draftId}-opt-in-1`,
      slug: "imported-opt-in",
      order: 1,
      kind: "opt_in",
      title: "Imported opt-in step",
      goal: `Capture interest from ${audience}.`,
      routeAnchor: "imported-opt-in",
      blocks: [
        importedBlock(
          `${draftId}-block-opt-in-hero`,
          "hero",
          `${offerTitle} opening promise`,
          `Shape the first promise for ${audience}. ${launchGoal}`,
          true,
        ),
        importedBlock(
          `${draftId}-block-opt-in-benefits`,
          "benefits",
          "Why this audience should continue",
          pageCopy,
          true,
        ),
        importedBlock(
          `${draftId}-block-opt-in-cta`,
          "cta",
          "Private opt-in next step",
          "Connect the opt-in only after consent, tagging, and follow-up gates are ready.",
          false,
        ),
      ],
    },
    {
      id: `${draftId}-sales-2`,
      slug: "imported-sales-page",
      order: 2,
      kind: "sales",
      title: "Imported sales page",
      goal: `Turn the ${platformName} source material into a private Bumpgrade sales path for ${offerTitle}.`,
      routeAnchor: "imported-sales-page",
      blocks: [
        importedBlock(
          `${draftId}-block-sales-hero`,
          "hero",
          `${offerTitle} sales promise`,
          pageCopy,
          true,
        ),
        importedBlock(
          `${draftId}-block-sales-proof`,
          "proof",
          "Source material to verify",
          `${sourceUrlSummary} ${sourceFileSummary} Review screenshots, examples, testimonials, guarantees, and claims before any public page uses them.`,
          true,
        ),
        importedBlock(
          `${draftId}-block-sales-checkout`,
          "checkout",
          "Checkout handoff stays private",
          "Map the old offer, bump, upsell, and product notes here. Live checkout remains off until the paid go-live gates are satisfied.",
          false,
        ),
      ],
    },
    {
      id: `${draftId}-thank-you-3`,
      slug: "imported-follow-up",
      order: 3,
      kind: "thank_you",
      title: "Imported follow-up",
      goal: "Confirm what happens after signup or purchase without creating sends or fulfillment state.",
      routeAnchor: "imported-follow-up",
      blocks: [
        importedBlock(
          `${draftId}-block-follow-up-hero`,
          "hero",
          "Post-action confirmation",
          "Tell the buyer or subscriber what happened and what to expect next after the import is reviewed.",
          true,
        ),
        importedBlock(
          `${draftId}-block-follow-up-delivery`,
          "delivery",
          "Delivery expectation",
          "Attach product access, files, or membership delivery only after fulfillment gates are ready.",
          false,
        ),
        importedBlock(
          `${draftId}-block-follow-up-cta`,
          "cta",
          "Follow-up plan",
          followUpNotes,
          true,
        ),
      ],
    },
  ];
}

function normalizeImportTitleForMatch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 160);
}

function normalizeImportSourceUrlForMatch(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    url.protocol = url.protocol.toLowerCase();
    url.hostname = url.hostname.toLowerCase();
    url.hash = "";
    url.searchParams.sort();
    const normalized = url.toString();
    return normalized.endsWith("/") && url.pathname === "/" && !url.search ? normalized.slice(0, -1) : normalized;
  } catch {
    return trimmed.toLowerCase().replace(/#.*$/, "").replace(/\/$/, "");
  }
}

function normalizeImportSourceFileNameForMatch(value: string) {
  const filename = value.trim().replace(/\\/g, "/").split("/").filter(Boolean).at(-1) ?? "";
  if (!filename) return null;

  const normalized = filename
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 200);

  return normalized || null;
}

function stringArrayMetadata(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function duplicateReviewFor(
  status: ImporterDuplicateReviewStatus,
  matchedFields: string[],
  options: { sourceUrlCompared: boolean; sourceFileNameCompared?: boolean },
): ImporterDuplicateReview {
  return {
    status,
    checkedFields: ["source_platform", "target_workspace", "normalized_title", "source_url", "source_file_name"],
    matchedFields,
    createsNewDraft: status === "created",
    reusesExistingDraft: status !== "created",
    sourceUrlCompared: options.sourceUrlCompared,
    sourceFileNameCompared: options.sourceFileNameCompared ?? false,
    rawSourceEchoed: false,
  };
}

function importReviewForResult(
  importReview: CompetitorImportReviewMetadata | null | undefined,
  reason: CompetitorImportReviewMetadata["privateDraftMetadataReason"],
) {
  if (!importReview) return null;

  return {
    ...importReview,
    privateDraftMetadataStored: reason === "created",
    privateDraftMetadataReason: reason,
  };
}

const competitorImportPrivateRecordKindOrder: ImportDraftEntity[] = [
  "draft_funnel",
  "draft_page_blocks",
  "draft_checkout_offer",
  "draft_product_catalog",
  "draft_audience_import",
  "draft_sequence_outline",
  "asset_reference",
];

function competitorImportPrivateRecordLabel(kind: ImportDraftEntity) {
  switch (kind) {
    case "draft_funnel":
      return "Funnel path record";
    case "draft_page_blocks":
      return "Page-block record";
    case "draft_checkout_offer":
      return "Offer and checkout record";
    case "draft_product_catalog":
      return "Product record";
    case "draft_audience_import":
      return "Audience record";
    case "draft_sequence_outline":
      return "Sequence record";
    case "asset_reference":
      return "Asset checklist record";
  }
}

function competitorImportPrivateRecordSummary(kind: ImportDraftEntity, input: CompetitorImportedDraftInput, matchLabels: string[]) {
  const platformName = compactImportText(input.platformName, 80) || "the previous platform";
  const offerTitle = compactImportText(input.offerTitle, 120) || `${platformName} import plan`;
  const matchedText = matchLabels.length
    ? `Safe export match: ${matchLabels.slice(0, 3).join(", ")}.`
    : "No recognized export shape was required for this private review area.";

  switch (kind) {
    case "draft_funnel":
      return `Private funnel path record for ${offerTitle}. ${matchedText} Review the launch path before publishing.`;
    case "draft_page_blocks":
      return `Private page-block record for ${offerTitle}. ${matchedText} Rewrite and approve page copy before public use.`;
    case "draft_checkout_offer":
      return `Private offer and checkout record for ${offerTitle}. ${matchedText} Review price, bump, upsell, guarantee, and buyer promise before live checkout.`;
    case "draft_product_catalog":
      return `Private product record for ${offerTitle}. ${matchedText} Review delivery, access, files, and fulfillment boundaries before go-live.`;
    case "draft_audience_import":
      return `Private audience record for ${offerTitle}. ${matchedText} Review consent, segments, duplicates, and suppressions before any subscriber write or send.`;
    case "draft_sequence_outline":
      return `Private sequence record for ${offerTitle}. ${matchedText} Review message order and exclusions before any automation or broadcast runs.`;
    case "asset_reference":
      return `Private asset checklist record for ${offerTitle}. ${matchedText} Attach only owned files and references before public publishing or fulfillment.`;
  }
}

function competitorImportRecordRedaction(): CompetitorImportPrivateRecord["redaction"] {
  return {
    rawExportFilesIncluded: false,
    rawFileNamesEchoed: false,
    rawRowsEchoed: false,
    rawTextEchoed: false,
    rawSourceEchoed: false,
    rawPastedMaterialIncludedInResponse: false,
    customerRowsIncluded: false,
    privateEmailsIncluded: false,
    paymentCredentialsIncluded: false,
    sessionCookiesIncluded: false,
  };
}

function competitorImportRecordGoLiveEffects(): CompetitorImportPrivateRecord["goLiveEffects"] {
  return {
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
  };
}

function competitorImportPrivateRecordFromRow(row: D1CompetitorImportPrivateRecordRow): CompetitorImportPrivateRecord {
  const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
  const stringArray = (value: unknown) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
  const entityArray = (value: unknown) =>
    stringArray(value).filter((item): item is ImportDraftEntity =>
      (competitorImportPrivateRecordKindOrder as string[]).includes(item),
    );

  return {
    id: row.id,
    responseField: "importRecords",
    privateRecordType: "competitor_import_private_record",
    kind: row.record_kind,
    status: row.status,
    title: row.title,
    summary: row.summary,
    importerPlatformId: row.importer_platform_id,
    importerSlug: row.importer_slug,
    platformName: row.platform_name,
    draftFunnelId: row.draft_funnel_id,
    tenantId: row.tenant_id,
    ownerUserId: row.owner_user_id,
    draftEntities: entityArray(metadata.draftEntities).length ? entityArray(metadata.draftEntities) : [row.record_kind],
    sourceChecklistItemIds: stringArray(metadata.sourceChecklistItemIds),
    recognizedPlatformExportMatchIds: stringArray(metadata.recognizedPlatformExportMatchIds),
    matchedHeaderLabels: stringArray(metadata.matchedHeaderLabels),
    matchedSignalLabels: stringArray(metadata.matchedSignalLabels),
    sourceUrlCount: typeof metadata.sourceUrlCount === "number" ? metadata.sourceUrlCount : 0,
    sourceFileNameCount: typeof metadata.sourceFileNameCount === "number" ? metadata.sourceFileNameCount : 0,
    exportFileCount: typeof metadata.exportFileCount === "number" ? metadata.exportFileCount : 0,
    parsedExportFileCount: typeof metadata.parsedExportFileCount === "number" ? metadata.parsedExportFileCount : 0,
    recordConfidence:
      metadata.recordConfidence === "recognized_export_match" ||
      metadata.recordConfidence === "needs_more_context" ||
      metadata.recordConfidence === "source_guide"
        ? metadata.recordConfidence
        : "source_guide",
    goLiveEffects: competitorImportRecordGoLiveEffects(),
    redaction: competitorImportRecordRedaction(),
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

async function loadCompetitorImportPrivateRecords(db: D1Database, draftFunnelId: string) {
  const rows = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE draft_funnel_id = ?
       ORDER BY updated_at DESC`,
    )
    .bind(draftFunnelId)
    .all<D1CompetitorImportPrivateRecordRow>();

  const order = new Map<ImportDraftEntity, number>(
    competitorImportPrivateRecordKindOrder.map((recordKind, index) => [recordKind, index]),
  );
  return (rows.results ?? [])
    .map(competitorImportPrivateRecordFromRow)
    .sort((left, right) => (order.get(left.kind) ?? 99) - (order.get(right.kind) ?? 99));
}

function uniqueImportDraftEntities(values: ImportDraftEntity[]) {
  return Array.from(new Set(values)).filter((value) => competitorImportPrivateRecordKindOrder.includes(value));
}

function competitorImportPrivateRecordInputs(
  draft: DraftFunnelRecord,
  input: CompetitorImportedDraftInput,
  importReview: CompetitorImportReviewMetadata | null,
) {
  const importer = getImporterBySlug(input.importerSlug);
  const platformName = compactImportText(input.platformName, 80) || importer?.platformName || "current platform";
  const recognizedMatches = importReview?.platformExportMatches.filter((match) => match.status === "recognized") ?? [];
  const contextualMatches = recognizedMatches.length
    ? recognizedMatches
    : (importReview?.platformExportMatches.filter((match) => match.status === "needs_more_context") ?? []);
  const platformEntities = uniqueImportDraftEntities(importer?.importableAreas.flatMap((area) => area.draftEntities) ?? []);
  const matchedEntities = uniqueImportDraftEntities(contextualMatches.flatMap((match) => match.draftEntities));
  const recordKinds = matchedEntities.length ? matchedEntities : platformEntities;
  const recognizedMatchIds = recognizedMatches.map((match) => match.id);
  const exportFileAnalysis = importReview?.exportFileAnalysis;

  return recordKinds.map((kind) => {
    const relatedMatches = contextualMatches.filter((match) => match.draftEntities.includes(kind));
    const matchLabels = relatedMatches.map((match) => match.label);
    const matchedHeaderLabels = Array.from(
      new Set(relatedMatches.flatMap((match) => [...match.matchedRequiredHeaders, ...match.matchedHelpfulHeaders])),
    );
    const matchedSignalLabels = Array.from(new Set(relatedMatches.flatMap((match) => match.matchedSignalLabels)));
    const sourceChecklistItemIds = Array.from(new Set(relatedMatches.flatMap((match) => match.sourceChecklistItemIds)));
    const recordConfidence =
      relatedMatches.some((match) => match.status === "recognized")
        ? "recognized_export_match"
        : relatedMatches.length
          ? "needs_more_context"
          : "source_guide";

    return {
      kind,
      title: `${platformName} ${competitorImportPrivateRecordLabel(kind)}`,
      summary: competitorImportPrivateRecordSummary(kind, input, matchLabels),
      metadata: {
        sourceIssueNumber: importerIssue,
        privateRecordType: "competitor_import_private_record",
        importerPlatformId: importer?.id ?? `importer-${input.importerSlug}`,
        importerSlug: input.importerSlug,
        platformName,
        tenantId: input.tenantId,
        draftFunnelId: draft.id,
        ownerUserId: draft.ownerUserId,
        draftEntities: [kind],
        sourceChecklistItemIds,
        recognizedPlatformExportMatchIds: recognizedMatchIds,
        relatedPlatformExportMatchIds: relatedMatches.map((match) => match.id),
        matchedHeaderLabels,
        matchedSignalLabels,
        sourceUrlCount: input.sourceUrls.length,
        sourceFileNameCount: input.sourceFileNames.length,
        exportFileCount: exportFileAnalysis?.fileCount ?? 0,
        parsedExportFileCount: exportFileAnalysis?.parsedFileCount ?? 0,
        recordConfidence,
        responseField: "importRecords",
        privateDraftOnly: true,
        publicSourceDataExposesContent: false,
        publicPublishingEnabled: false,
        liveCheckoutEnabled: false,
        subscriberSendsEnabled: false,
        customDomainsEnabled: false,
        fulfillmentEnabled: false,
        rawExportStored: false,
        rawExportRowsStored: false,
        rawExportTextStored: false,
        rawExportFileNamesStored: false,
        rawSourceEchoed: false,
        rawPastedMaterialIncludedInResponse: false,
        customerRowsStored: false,
        privateEmailsStored: false,
        paymentCredentialsStored: false,
        sessionCookiesStored: false,
      },
    };
  });
}

async function upsertCompetitorImportPrivateRecords(
  db: D1Database,
  owner: { userId: string; email: string },
  draft: DraftFunnelRecord,
  input: CompetitorImportedDraftInput,
  importReview: CompetitorImportReviewMetadata | null,
) {
  const importer = getImporterBySlug(input.importerSlug);
  const importerPlatformId = importer?.id ?? `importer-${input.importerSlug}`;
  const platformName = compactImportText(input.platformName, 80) || importer?.platformName || "current platform";
  const records = competitorImportPrivateRecordInputs(draft, input, importReview);

  for (const record of records) {
    await db
      .prepare(
        `INSERT INTO competitor_import_private_records (
          id, tenant_id, draft_funnel_id, owner_user_id, importer_platform_id, importer_slug,
          platform_name, record_kind, status, title, summary, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'private_draft', ?, ?, ?, unixepoch(), unixepoch())
        ON CONFLICT(draft_funnel_id, record_kind) DO UPDATE SET
          tenant_id = excluded.tenant_id,
          owner_user_id = excluded.owner_user_id,
          importer_platform_id = excluded.importer_platform_id,
          importer_slug = excluded.importer_slug,
          platform_name = excluded.platform_name,
          status = excluded.status,
          title = excluded.title,
          summary = excluded.summary,
          metadata_json = excluded.metadata_json,
          updated_at = excluded.updated_at`,
      )
      .bind(
        runtimeId("competitor-import-private-record"),
        input.tenantId,
        draft.id,
        owner.userId,
        importerPlatformId,
        input.importerSlug,
        platformName,
        record.kind,
        record.title,
        record.summary,
        JSON.stringify(record.metadata),
      )
      .run();
  }

  return loadCompetitorImportPrivateRecords(db, draft.id);
}

async function findImporterSourceMatchDraft(
  db: D1Database,
  input: {
    ownerUserId: string;
    importerPlatformId: string;
    tenantId: string;
    offerTitle: string;
    sourceUrls: string[];
    sourceFileNames: string[];
  },
) {
  const normalizedTitle = normalizeImportTitleForMatch(input.offerTitle);
  const normalizedSourceUrls = input.sourceUrls.map(normalizeImportSourceUrlForMatch).filter((url): url is string => Boolean(url));
  const normalizedSourceFileNames = input.sourceFileNames
    .map(normalizeImportSourceFileNameForMatch)
    .filter((name): name is string => Boolean(name));
  if (!normalizedTitle || (normalizedSourceUrls.length === 0 && normalizedSourceFileNames.length === 0)) return null;

  const rows = await db
    .prepare(
      `SELECT *
       FROM funnel_drafts
       WHERE owner_user_id = ?
         AND source_issue_number = ?
         AND status IN ('draft', 'review')
       ORDER BY updated_at DESC
       LIMIT 100`,
    )
    .bind(input.ownerUserId, importerIssue)
    .all<D1FunnelDraftRow>();

  const incomingSourceUrls = new Set(normalizedSourceUrls);
  const incomingSourceFileNames = new Set(normalizedSourceFileNames);
  for (const row of rows.results ?? []) {
    const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
    const rowPlatformId = typeof metadata.importerPlatformId === "string" ? metadata.importerPlatformId : "";
    const rowTenantId = typeof metadata.tenantId === "string" ? metadata.tenantId : "";
    if (rowPlatformId !== input.importerPlatformId || rowTenantId !== input.tenantId) continue;

    const rowTitle =
      typeof metadata.normalizedOfferTitle === "string" && metadata.normalizedOfferTitle
        ? metadata.normalizedOfferTitle
        : normalizeImportTitleForMatch(row.title);
    if (rowTitle !== normalizedTitle) continue;

    const rowSourceUrls = (
      stringArrayMetadata(metadata.normalizedSourceUrls).length
        ? stringArrayMetadata(metadata.normalizedSourceUrls)
        : stringArrayMetadata(metadata.sourceUrls).map(normalizeImportSourceUrlForMatch).filter((url): url is string => Boolean(url))
    );
    const hasSourceUrlMatch = rowSourceUrls.some((url) => incomingSourceUrls.has(url));
    const rowSourceFileNames = (
      stringArrayMetadata(metadata.normalizedSourceFileNames).length
        ? stringArrayMetadata(metadata.normalizedSourceFileNames)
        : stringArrayMetadata(metadata.sourceFileNames)
            .map(normalizeImportSourceFileNameForMatch)
            .filter((name): name is string => Boolean(name))
    );
    const hasSourceFileNameMatch = rowSourceFileNames.some((name) => incomingSourceFileNames.has(name));
    if (!hasSourceUrlMatch && !hasSourceFileNameMatch) continue;

    const matchedFields = ["source_platform", "target_workspace", "normalized_title"];
    if (hasSourceUrlMatch) matchedFields.push("source_url");
    if (hasSourceFileNameMatch) matchedFields.push("source_file_name");

    return {
      draft: draftFromRow(row, await loadDraftStepsFromD1(db, row.id)),
      normalizedTitle,
      normalizedSourceUrlCount: normalizedSourceUrls.length,
      normalizedSourceFileNameCount: normalizedSourceFileNames.length,
      matchedFields,
    };
  }

  return null;
}

async function loadDraftRowWithMetadataFromD1(db: D1Database, draftId: string) {
  const row = await db
    .prepare("SELECT * FROM funnel_drafts WHERE id = ? OR slug = ? LIMIT 1")
    .bind(draftId, draftId)
    .first<D1FunnelDraftRow>();
  if (!row) return null;

  return {
    row,
    draft: draftFromRow(row, await loadDraftStepsFromD1(db, row.id)),
    metadata: parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {}),
  };
}

function competitorImportReviewMetadata(value: unknown): CompetitorImportReviewMetadata | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const metadata = value as Partial<CompetitorImportReviewMetadata>;
  if (metadata.responseField !== "importReview") return null;
  return metadata as CompetitorImportReviewMetadata;
}

export async function loadCompetitorImportedDraftReview(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
  },
): Promise<CompetitorImportedDraftReview> {
  const importer = getImporterBySlug(input.importerSlug);
  const platformName = compactImportText(input.platformName, 80) || importer?.platformName || "current platform";
  const importerPlatformId = importer?.id ?? `importer-${input.importerSlug}`;
  const loaded = await loadDraftRowWithMetadataFromD1(db, input.draftId.trim());
  if (!loaded) throw new Error("Private import draft not found.");

  const { draft, metadata } = loaded;
  const tenantId = typeof metadata.tenantId === "string" ? metadata.tenantId : "";
  const metadataImporterPlatformId = typeof metadata.importerPlatformId === "string" ? metadata.importerPlatformId : "";

  if (draft.ownerUserId !== owner.userId) {
    throw new Error("Only the publisher who created this private import plan can review these records.");
  }

  if (
    draft.sourceIssueNumber !== importerIssue ||
    metadataImporterPlatformId !== importerPlatformId ||
    metadata.privateDraftOnly !== true ||
    !tenantId
  ) {
    throw new Error("Only private importer-created draft plans can be reviewed from this importer path.");
  }

  return {
    draft,
    importerPlatformId,
    importerSlug: input.importerSlug,
    platformName,
    tenantId,
    importReview: competitorImportReviewMetadata(metadata.importReview),
    importRecords: await loadCompetitorImportPrivateRecords(db, draft.id),
    goLiveEffects: competitorImportRecordGoLiveEffects(),
    redaction: competitorImportRecordRedaction(),
  };
}

export async function rollbackCompetitorImportedDraftFunnel(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
  },
): Promise<CompetitorImportedDraftRollbackResult> {
  const importer = getImporterBySlug(input.importerSlug);
  const platformName = compactImportText(input.platformName, 80) || importer?.platformName || "current platform";
  const importerPlatformId = importer?.id ?? `importer-${input.importerSlug}`;
  const loaded = await loadDraftRowWithMetadataFromD1(db, input.draftId.trim());
  if (!loaded) throw new Error("Private import draft not found.");

  const { draft, metadata } = loaded;
  const tenantId = typeof metadata.tenantId === "string" ? metadata.tenantId : "";
  const metadataImporterPlatformId = typeof metadata.importerPlatformId === "string" ? metadata.importerPlatformId : "";

  if (draft.ownerUserId !== owner.userId) {
    throw new Error("Only the publisher who created this private import plan can archive it from the importer page.");
  }

  if (
    draft.sourceIssueNumber !== importerIssue ||
    metadataImporterPlatformId !== importerPlatformId ||
    metadata.privateDraftOnly !== true ||
    !tenantId
  ) {
    throw new Error("Only private importer-created draft plans can be archived from this importer path.");
  }

  if (draft.status === "published" || draft.previewRoute) {
    throw new Error("Only private unpublished importer drafts can be archived from this importer path.");
  }

  const replay = await db
    .prepare("SELECT funnel_draft_id FROM funnel_audit_events WHERE idempotency_key = ?")
    .bind(input.idempotencyKey)
    .first<{ funnel_draft_id: string | null }>();
  if (replay?.funnel_draft_id) {
    if (replay.funnel_draft_id !== draft.id) {
      throw new Error("Importer rollback idempotency key already belongs to another draft.");
    }

    return {
      draft,
      previousStatus: draft.status,
      previousRevisionId: draft.revisionId,
      previousPreviewRoute: draft.previewRoute,
      idempotent: true,
      restartsAvailable: true,
      deletedDraftRows: false,
      deletedStepRows: false,
      deletedAuditRows: false,
      publicPublishingEnabled: false,
      liveCheckoutEnabled: false,
      subscriberSendsEnabled: false,
      customDomainsEnabled: false,
      fulfillmentEnabled: false,
      rawSourceEchoed: false,
    };
  }

  if (input.confirmationText !== importerDraftRollbackConfirmationText(platformName)) {
    throw new Error("Exact private import archive confirmation text is required.");
  }

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Private import draft revision changed. Refresh before archiving.");
  }

  if (draft.status === "archived") {
    return {
      draft,
      previousStatus: "archived",
      previousRevisionId: draft.revisionId,
      previousPreviewRoute: draft.previewRoute,
      idempotent: false,
      restartsAvailable: true,
      deletedDraftRows: false,
      deletedStepRows: false,
      deletedAuditRows: false,
      publicPublishingEnabled: false,
      liveCheckoutEnabled: false,
      subscriberSendsEnabled: false,
      customDomainsEnabled: false,
      fulfillmentEnabled: false,
      rawSourceEchoed: false,
    };
  }

  const previousStatus = draft.status;
  const previousRevisionId = draft.revisionId;
  const previousPreviewRoute = draft.previewRoute;
  const nextRevisionId = `${draft.revisionId}-import-rollback-${Date.now()}`;
  const identity = { userId: owner.userId, email: publisherIdentityEmail(owner), role: "owner" as const, name: publisherIdentityEmail(owner) };

  await db.batch([
    db
      .prepare("UPDATE funnel_drafts SET status = 'archived', preview_route = NULL, revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${publisherIdentityEmail(owner)} archived private ${platformName} import plan ${draft.title}.`,
      {
        issue: importerIssue,
        action: "competitor_import_draft_rollback",
        importerRollbackCapabilityId: importerDraftRollbackCapabilityId(importerPlatformId),
        importerPlatformId,
        importerPlatformName: platformName,
        importerIssue,
        tenantId,
        previousStatus,
        nextStatus: "archived",
        previousRevisionId,
        expectedRevisionId: input.expectedRevisionId,
        previousPreviewRoute,
        previewRouteCleared: true,
        sourceMatchEligibleForRestart: true,
        privateDraftOnly: true,
        deletedDraftRows: false,
        deletedStepRows: false,
        deletedAuditRows: false,
        publicPublishingEnabled: false,
        liveCheckoutEnabled: false,
        subscriberSendsEnabled: false,
        customDomainsEnabled: false,
        fulfillmentEnabled: false,
        rawSourceEchoed: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return {
    draft: (await loadDraftFromD1(db, draft.id)) ?? { ...draft, status: "archived", previewRoute: null, revisionId: nextRevisionId },
    previousStatus,
    previousRevisionId,
    previousPreviewRoute,
    idempotent: false,
    restartsAvailable: true,
    deletedDraftRows: false,
    deletedStepRows: false,
    deletedAuditRows: false,
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
    rawSourceEchoed: false,
  };
}

function anonymousPlaygroundSteps(
  draftId: string,
  input: Pick<
    AnonymousPlaygroundClaimedDraftInput,
    | "offerName"
    | "audience"
    | "launchGoal"
    | "productFormat"
    | "pricePoint"
    | "leadMagnet"
    | "checkoutPlan"
    | "deliveryPlan"
    | "followUpPlan"
    | "sourceUrl"
    | "selectedImporterSlug"
  >,
): DraftFunnelStepRecord[] {
  const offerName = compactImportText(input.offerName, 120) || "Saved playground launch";
  const audience = compactImportText(input.audience, 180) || "the people this launch should serve";
  const launchGoal = compactImportText(input.launchGoal, 300) || "turn the saved playground notes into a private launch path";
  const productFormat = compactImportText(input.productFormat, 180) || "the product or service format still to define";
  const pricePoint = compactImportText(input.pricePoint, 120) || "pricing still to decide";
  const leadMagnet = compactImportText(input.leadMagnet, 220) || "the first opt-in or reason to join the launch list";
  const checkoutPlan = compactImportText(input.checkoutPlan, 260) || "the checkout handoff still to shape";
  const deliveryPlan = compactImportText(input.deliveryPlan, 260) || "the private delivery promise still to shape";
  const followUpPlan = compactImportText(input.followUpPlan, 260) || "the first follow-up path still to shape";
  const sourceUrl = compactImportText(input.sourceUrl, 300);
  const importer = input.selectedImporterSlug ? getImporterBySlug(input.selectedImporterSlug) : null;
  const importerText = importer
    ? `Starting platform noted in the playground: ${importer.platformName}.${sourceUrl ? ` Source page noted: ${sourceUrl}.` : ""}`
    : "No starting platform was attached to the playground.";

  return [
    {
      id: `${draftId}-playground-opt-in-1`,
      slug: "playground-opt-in",
      order: 1,
      kind: "opt_in",
      title: "Playground opt-in step",
      goal: `Shape the first relationship step for ${audience}.`,
      routeAnchor: "playground-opt-in",
      blocks: [
        importedBlock(
          `${draftId}-block-playground-opt-in-hero`,
          "hero",
          `${offerName} opening promise`,
          `Start the launch story for ${audience}. ${launchGoal}`,
          true,
        ),
        importedBlock(
          `${draftId}-block-playground-opt-in-benefits`,
          "benefits",
          "First reason to keep going",
          leadMagnet,
          true,
        ),
        importedBlock(
          `${draftId}-block-playground-opt-in-cta`,
          "cta",
          "Private opt-in action",
          "Connect consent, tags, and follow-up only after the launch is ready for real visitors.",
          false,
        ),
      ],
    },
    {
      id: `${draftId}-playground-offer-2`,
      slug: "playground-offer",
      order: 2,
      kind: "sales",
      title: "Playground offer step",
      goal: `Map the first offer path for ${offerName}.`,
      routeAnchor: "playground-offer",
      blocks: [
        importedBlock(
          `${draftId}-block-playground-offer-hero`,
          "hero",
          `${offerName} offer promise`,
          `${launchGoal} Format: ${productFormat}.`,
          true,
        ),
        importedBlock(
          `${draftId}-block-playground-offer-proof`,
          "proof",
          "Starting material to verify",
          `${importerText} Review examples, testimonials, guarantees, claims, and price language before public use.`,
          true,
        ),
        importedBlock(
          `${draftId}-block-playground-offer-checkout`,
          "checkout",
          "Checkout stays off",
          `Planned price or offer structure: ${pricePoint}. Checkout handoff: ${checkoutPlan}. Keep payment collection private until paid go-live gates are satisfied.`,
          false,
        ),
      ],
    },
    {
      id: `${draftId}-playground-follow-up-3`,
      slug: "playground-follow-up",
      order: 3,
      kind: "thank_you",
      title: "Playground follow-up",
      goal: "Decide what happens after a visitor signs up or buys, without creating sends or fulfillment state.",
      routeAnchor: "playground-follow-up",
      blocks: [
        importedBlock(
          `${draftId}-block-playground-follow-up-delivery`,
          "delivery",
          "Delivery expectation",
          `${deliveryPlan} Attach product access, files, community access, or membership delivery only after fulfillment gates are ready.`,
          false,
        ),
        importedBlock(
          `${draftId}-block-playground-follow-up-cta`,
          "cta",
          "Next edit pass",
          `${followUpPlan} Review the saved playground plan, sharpen the offer, and choose the first private setup step before going live.`,
          true,
        ),
      ],
    },
  ];
}

export async function createCompetitorImportedDraftFunnel(
  db: D1Database,
  owner: { userId: string; email: string },
  input: CompetitorImportedDraftInput,
): Promise<CompetitorImportedDraftResult> {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) {
    return {
      draft: replay,
      duplicateReview: duplicateReviewFor("idempotent_replay", ["idempotency_key"], {
        sourceUrlCompared: input.sourceUrls.length > 0,
        sourceFileNameCompared: input.sourceFileNames.length > 0,
      }),
      importReview: importReviewForResult(input.importReview, "idempotent_replay"),
      importRecords: await loadCompetitorImportPrivateRecords(db, replay.id),
    };
  }

  const importer = getImporterBySlug(input.importerSlug);
  const platformName = compactImportText(input.platformName, 80) || importer?.platformName || "current platform";
  const importerPlatformId = importer?.id ?? `importer-${input.importerSlug}`;
  const baseTitle = compactImportText(input.offerTitle, 120) || `${platformName} import draft`;
  const normalizedOfferTitle = normalizeImportTitleForMatch(baseTitle);
  const normalizedSourceUrls = input.sourceUrls.map(normalizeImportSourceUrlForMatch).filter((url): url is string => Boolean(url));
  const normalizedSourceFileNames = input.sourceFileNames
    .map(normalizeImportSourceFileNameForMatch)
    .filter((name): name is string => Boolean(name));
  const sourceMatch = await findImporterSourceMatchDraft(db, {
    ownerUserId: owner.userId,
    importerPlatformId,
    tenantId: input.tenantId,
    offerTitle: baseTitle,
    sourceUrls: input.sourceUrls,
    sourceFileNames: input.sourceFileNames,
  });
  if (sourceMatch) {
    await insertAuditStatement(
      db,
      sourceMatch.draft,
      { userId: owner.userId, email: publisherIdentityEmail(owner), role: "owner", name: publisherIdentityEmail(owner) },
      "draft_created",
      input.idempotencyKey,
      `${publisherIdentityEmail(owner)} reused ${sourceMatch.draft.title} after importer source-match duplicate review.`,
      {
        importerCapabilityId: importerDraftImportCapabilityId(importerPlatformId),
        importerPlatformId,
        importerPlatformName: platformName,
        importerIssue,
        tenantId: input.tenantId,
        importReview: importReviewForResult(input.importReview, "source_match_reused"),
        privateDraftImportReviewStored: false,
        recognizedPlatformExportMatchIds: input.importReview?.recognizedPlatformExportMatchIds ?? [],
        duplicateReviewStatus: "source_match_reused",
        duplicateReviewPolicy: "source_platform_target_workspace_normalized_title_source_url_or_source_file_name",
        matchedFields: sourceMatch.matchedFields,
        matchedSourceUrlCount: sourceMatch.normalizedSourceUrlCount,
        matchedSourceFileNameCount: sourceMatch.normalizedSourceFileNameCount,
        privateDraftOnly: true,
        responseRedacted: true,
        rawSourceEchoed: false,
      },
    ).run();

    return {
      draft: sourceMatch.draft,
      duplicateReview: duplicateReviewFor("source_match_reused", sourceMatch.matchedFields, {
        sourceUrlCompared: normalizedSourceUrls.length > 0,
        sourceFileNameCompared: normalizedSourceFileNames.length > 0,
      }),
      importReview: importReviewForResult(input.importReview, "source_match_reused"),
      importRecords: await loadCompetitorImportPrivateRecords(db, sourceMatch.draft.id),
    };
  }

  const slug = await uniqueDraftSlug(db, slugifyDraftFunnelTitle(`${baseTitle} ${platformName} import`));
  const draftId = `funnel-draft-${slug}`;
  const draft: DraftFunnelRecord = {
    id: draftId,
    slug,
    title: baseTitle,
    status: "draft",
    summary: `Private ${platformName} import draft for ${baseTitle}. Review the imported pages, offer notes, checkout handoff, and follow-up plan before going live.`,
    sourceIssueNumber: importerIssue,
    parentIssueNumber: importerIssue,
    previewRoute: null,
    sourceDataRoute: "/funnels/source-data",
    revisionId: `funnel-draft-revision-${slug}-${new Date().toISOString().slice(0, 10)}`,
    createdByEmail: publisherIdentityEmail(owner),
    ownerUserId: owner.userId,
    steps: importedCompetitorSteps(draftId, { ...input, platformName }),
    createdAt: null,
    updatedAt: null,
  };

  const storedImportReview = importReviewForResult(input.importReview, "created");
  const plannedImportRecordKinds = competitorImportPrivateRecordInputs(draft, input, storedImportReview).map((record) => record.kind);
  const persisted = await persistDraft(
    db,
    draft,
    { userId: owner.userId, email: publisherIdentityEmail(owner), role: "owner", name: publisherIdentityEmail(owner) },
    "draft_created",
    input.idempotencyKey,
    {
      importerCapabilityId: importerDraftImportCapabilityId(importerPlatformId),
      importerPlatformId,
      importerPlatformName: platformName,
      importerIssue,
      tenantId: input.tenantId,
      duplicateReviewStatus: "created",
      duplicateReviewPolicy: "source_platform_target_workspace_normalized_title_source_url_or_source_file_name",
      normalizedOfferTitle,
      normalizedSourceUrls,
      normalizedSourceFileNames,
      importReview: storedImportReview,
      privateDraftImportReviewStored: Boolean(storedImportReview),
      recognizedPlatformExportMatchIds: storedImportReview?.recognizedPlatformExportMatchIds ?? [],
      privateStructuredImportRecordsPlanned: plannedImportRecordKinds.length,
      privateStructuredImportRecordKinds: plannedImportRecordKinds,
      sourceUrlCount: input.sourceUrls.length,
      sourceFileNameCount: input.sourceFileNames.length,
      sourceUrls: input.sourceUrls,
      sourceFileNames: input.sourceFileNames,
      pastedCopyLength: input.pageCopy.trim().length,
      followUpNotesLength: input.followUpNotes.trim().length,
      privateDraftOnly: true,
      publicPublishingEnabled: false,
      liveCheckoutEnabled: false,
      subscriberSendsEnabled: false,
      customDomainsEnabled: false,
      fulfillmentEnabled: false,
      rawExportStored: false,
      rawExportRowsStored: false,
      rawExportTextStored: false,
      rawExportFileNamesStored: false,
      customerRowsStored: false,
      privateEmailsStored: false,
      paymentCredentialsStored: false,
      sessionCookiesStored: false,
    },
  );
  const importRecords = await upsertCompetitorImportPrivateRecords(db, owner, persisted, input, storedImportReview);

  return {
    draft: persisted,
    duplicateReview: duplicateReviewFor("created", [], {
      sourceUrlCompared: normalizedSourceUrls.length > 0,
      sourceFileNameCompared: normalizedSourceFileNames.length > 0,
    }),
    importReview: storedImportReview,
    importRecords,
  };
}

export async function createClickFunnelsImportedDraftFunnel(
  db: D1Database,
  owner: { userId: string; email: string },
  input: ClickFunnelsImportedDraftInput,
) {
  return createCompetitorImportedDraftFunnel(db, owner, {
    ...input,
    importerSlug: "clickfunnels",
    platformName: "ClickFunnels",
  });
}

export async function createAnonymousPlaygroundDraftFunnel(
  db: D1Database,
  owner: { userId: string; email: string },
  input: AnonymousPlaygroundClaimedDraftInput,
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const baseTitle = compactImportText(input.offerName, 120) || "Saved playground launch";
  const slug = await uniqueDraftSlug(db, slugifyDraftFunnelTitle(`${baseTitle} playground`));
  const draftId = `funnel-draft-${slug}`;
  const draft: DraftFunnelRecord = {
    id: draftId,
    slug,
    title: baseTitle,
    status: "draft",
    summary: `Private Free Build draft created from saved playground work for ${baseTitle}. Review the opt-in, offer, checkout handoff, and follow-up before going live.`,
    sourceIssueNumber: input.sourceIssueNumber,
    parentIssueNumber: input.sourceIssueNumber,
    previewRoute: null,
    sourceDataRoute: "/funnels/source-data",
    revisionId: `funnel-draft-revision-${slug}-${new Date().toISOString().slice(0, 10)}`,
    createdByEmail: publisherIdentityEmail(owner),
    ownerUserId: owner.userId,
    steps: anonymousPlaygroundSteps(draftId, input),
    createdAt: null,
    updatedAt: null,
  };

  return persistDraft(
    db,
    draft,
    { userId: owner.userId, email: publisherIdentityEmail(owner), role: "owner", name: publisherIdentityEmail(owner) },
    "draft_created",
    input.idempotencyKey,
    {
      sourceIssueNumber: input.sourceIssueNumber,
      anonymousPlaygroundWorkspaceId: input.workspaceId,
      tenantId: input.tenantId,
      selectedImporterSlug: input.selectedImporterSlug,
      structuredBuilderFieldsClaimed: true,
      offerNameLength: input.offerName.trim().length,
      audienceLength: input.audience.trim().length,
      launchGoalLength: input.launchGoal.trim().length,
      productFormatLength: input.productFormat.trim().length,
      pricePointLength: input.pricePoint.trim().length,
      leadMagnetLength: input.leadMagnet.trim().length,
      checkoutPlanLength: input.checkoutPlan.trim().length,
      deliveryPlanLength: input.deliveryPlan.trim().length,
      followUpPlanLength: input.followUpPlan.trim().length,
      sourceUrlIncluded: Boolean(input.sourceUrl.trim()),
      privateDraftOnly: true,
      publicPublishingEnabled: false,
      liveCheckoutEnabled: false,
      subscriberSendsEnabled: false,
      customDomainsEnabled: false,
      fulfillmentEnabled: false,
      billingMutationEnabled: false,
      recoveryCookieStored: false,
      recoveryTokenHashExposed: false,
    },
  );
}

export async function createDraftFunnelFromLibraryTemplate(
  db: D1Database,
  identity: AdminIdentity,
  input: { templateId: string; title: string; confirmationText: string; idempotencyKey: string },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelTemplateCreationConfirmationText) {
    throw new Error("Exact template draft confirmation text is required.");
  }

  const template = funnelTemplateLibrary.find((item) => item.id === input.templateId);
  if (!template) throw new Error("Funnel template not found.");

  const baseTitle = input.title.trim() || `${template.title} draft`;
  const slug = await uniqueDraftSlug(db, slugifyDraftFunnelTitle(baseTitle));
  const draftId = `funnel-draft-${slug}`;
  const draft: DraftFunnelRecord = {
    id: draftId,
    slug,
    title: baseTitle.slice(0, 120),
    status: "draft",
    summary: `Owner-gated private draft created from the ${template.title} template. ${template.goal}`,
    sourceIssueNumber: draftFunnelTemplateCreationIssue,
    parentIssueNumber: draftFunnelBuilderParentIssue,
    previewRoute: null,
    sourceDataRoute: "/funnels/source-data",
    revisionId: `funnel-draft-revision-${slug}-${new Date().toISOString().slice(0, 10)}`,
    createdByEmail: identityEmail(identity),
    ownerUserId: identity.userId,
    steps: templateLibrarySteps(draftId, template),
    createdAt: null,
    updatedAt: null,
  };

  return persistDraft(db, draft, identity, "draft_created", input.idempotencyKey, {
    templateDraftCreationCapability: templateDraftCreationCapability.id,
    templateId: template.id,
    templateSourceIssue: template.sourceIssue,
    templateDraftCreationIssue: draftFunnelTemplateCreationIssue,
    draftCreation: template.draftCreation,
  });
}

export async function duplicateDraftFunnel(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    title: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelDuplicationConfirmationText) {
    throw new Error("Exact draft duplication confirmation text is required.");
  }

  const sourceDraft = await loadDraftFromD1(db, input.draftId);
  if (!sourceDraft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(sourceDraft, "duplicated");

  if (!input.expectedRevisionId || input.expectedRevisionId !== sourceDraft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before duplicating.");
  }

  const baseTitle = input.title.trim() || `Copy of ${sourceDraft.title}`;
  const slug = await uniqueDraftSlug(db, slugifyDraftFunnelTitle(baseTitle));
  const draftId = `funnel-draft-${slug}`;
  const steps = sourceDraft.steps.map((step) => ({
    ...step,
    id: `${draftId}-${step.kind}-${step.order}`,
    blocks: duplicateBlocksForStep(draftId, step),
  }));
  const draft: DraftFunnelRecord = {
    id: draftId,
    slug,
    title: baseTitle.slice(0, 120),
    status: "draft",
    summary: `Private duplicate of ${sourceDraft.title}. Checkout-link metadata was intentionally not copied; review and relink offers before publishing.`,
    sourceIssueNumber: draftFunnelDuplicationIssue,
    parentIssueNumber: draftFunnelBuilderParentIssue,
    previewRoute: null,
    sourceDataRoute: "/funnels/source-data",
    revisionId: `funnel-draft-revision-${slug}-${new Date().toISOString().slice(0, 10)}`,
    createdByEmail: identityEmail(identity),
    ownerUserId: identity.userId,
    steps,
    createdAt: null,
    updatedAt: null,
  };

  return persistDraft(db, draft, identity, "draft_duplicated", input.idempotencyKey, {
    ...agentFunnelWriteMetadata(input.agentWriteAudit),
    draftFunnelDuplicationCapability: draftFunnelDuplicationCapability.id,
    sourceDraftId: sourceDraft.id,
    sourceRevisionId: sourceDraft.revisionId,
    copiedStepCount: sourceDraft.steps.length,
    copiedBlockCount: sourceDraft.steps.reduce((total, step) => total + step.blocks.length, 0),
    checkoutLinksCopied: false,
    publishesDuplicate: false,
    privateDraftOnly: true,
  });
}

function normalizeStepKind(value: string, fallback: FunnelStepKind) {
  return draftFunnelStepKinds.includes(value as FunnelStepKind) ? (value as FunnelStepKind) : fallback;
}

function compactStepForAudit(step: DraftFunnelStepRecord) {
  return {
    id: step.id,
    order: step.order,
    kind: step.kind,
    title: step.title,
    goal: step.goal,
    checkoutLinks: step.blocks.flatMap((block) => (block.checkoutLink ? [block.checkoutLink.id] : [])),
  };
}

function compactBlockForAudit(block: FunnelBlock) {
  return {
    id: block.id,
    kind: block.kind,
    title: block.title,
    body: block.body,
    agentEditable: block.agentEditable,
    visualStyleId: funnelBlockVisualStyleForId(block.visualStyle).id,
    checkoutLinkId: block.checkoutLink?.id ?? null,
    checkoutOfferId: block.checkoutLink?.offerId ?? null,
    resourceDeliveryLinkId: block.resourceDeliveryLink?.id ?? null,
    resourceDeliveryProductId: block.resourceDeliveryLink?.productId ?? null,
    resourceDeliveryAssetId: block.resourceDeliveryLink?.assetId ?? null,
    webinarEventLinkId: block.webinarEventLink?.id ?? null,
    webinarEventTitle: block.webinarEventLink?.eventTitle ?? null,
    webinarRegistrationUrl: block.webinarEventLink?.registrationUrl ?? null,
    webinarReplayUrl: block.webinarEventLink?.replayUrl ?? null,
    visualStyle: block.visualStyle ?? null,
  };
}

function checkoutOfferForDraftLink(offerId: string) {
  if (offerId === checkoutOfferStack.primaryOffer.id) return checkoutOfferStack.primaryOffer;
  return null;
}

function checkoutLinkForOffer(draft: DraftFunnelRecord, step: DraftFunnelStepRecord, offer: CheckoutOffer): FunnelCheckoutLink {
  return {
    id: `checkout-link-${draft.id}-${step.id}-${offer.id}`,
    status: "owner-session-linked",
    issue: draftFunnelCheckoutLinkingIssue,
    parentIssue: draftFunnelBuilderParentIssue,
    offerStackId: checkoutOfferStack.id,
    offerId: offer.id,
    offerKind: offer.kind,
    offerTitle: offer.title,
    priceId: offer.priceId,
    productId: offer.productId,
    checkoutEndpoint: checkoutOfferStack.checkoutEndpoint,
    offerPreviewRoute: checkoutOfferStack.previewRoute,
    offerSourceDataRoute: checkoutOfferStack.sourceDataRoute,
    checkoutContractRoute: checkoutOfferStack.checkoutContractRoute,
    mode: "sandbox",
    liveBillingEnabled: false,
    confirmationRequired: true,
    idempotencyRequired: true,
    staleRevisionRequired: true,
    rawStripeIdsIncluded: false,
    linkedAt: new Date().toISOString(),
  };
}

function productResourceForLink(productId: string, assetId: string) {
  for (const catalog of productAccessCatalogs) {
    const product = catalog.products.find((item) => item.id === productId);
    if (!product || !product.assetIds.includes(assetId)) continue;
    const asset = catalog.assets.find((item) => item.id === assetId);
    const entitlementTemplate = catalog.entitlementTemplates.find((item) => item.id === product.entitlementTemplateId);
    if (!asset || !entitlementTemplate) return null;

    return {
      catalog,
      product,
      asset,
      entitlementTemplate,
      accessRules: catalog.accessRules.filter((rule) => product.accessRuleIds.includes(rule.id)),
    };
  }

  return null;
}

function resourceDeliveryLinkForProduct(
  draft: DraftFunnelRecord,
  step: DraftFunnelStepRecord,
  block: FunnelBlock,
  resource: NonNullable<ReturnType<typeof productResourceForLink>>,
): FunnelResourceDeliveryLink {
  return {
    id: `resource-delivery-link-${draft.id}-${step.id}-${block.id}-${resource.product.id}-${resource.asset.id}`,
    status: "owner-session-linked",
    issue: draftFunnelAdvancedParityIssue,
    parentIssue: draftFunnelBuilderParentIssue,
    productId: resource.product.id,
    productTitle: resource.product.title,
    productKind: resource.product.kind,
    assetId: resource.asset.id,
    assetTitle: resource.asset.title,
    assetKind: resource.asset.kind,
    entitlementTemplateId: resource.entitlementTemplate.id,
    entitlementTemplateTitle: resource.entitlementTemplate.title,
    accessRuleIds: resource.accessRules.map((rule) => rule.id),
    productSourceDataRoute: resource.catalog.sourceDataRoute,
    entitlementLookupRoute: "/products/entitlements",
    downloadTokenEndpoint: "/api/products/download-tokens",
    protectedContentEndpoint: "/api/products/protected-content",
    deliveryMode: "seeded-product-access-reference",
    confirmationRequired: true,
    idempotencyRequired: true,
    staleRevisionRequired: true,
    liveFulfillmentDeliveryEnabled: false,
    arbitraryUploadedAssetDeliveryEnabled: false,
    rawR2KeysIncluded: false,
    signedUrlsIncluded: false,
    buyerDataIncluded: false,
    linkedAt: new Date().toISOString(),
  };
}

function publicWebinarUrl(value: string, label: string, options: { required: boolean }) {
  const trimmed = value.trim();
  if (!trimmed) {
    if (options.required) throw new Error(`${label} URL is required before linking a webinar event.`);
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${label} URL must be a valid absolute URL.`);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} URL must use http or https.`);
  }

  return parsed.toString().slice(0, 500);
}

function webinarEventLinkForBlock(
  draft: DraftFunnelRecord,
  step: DraftFunnelStepRecord,
  block: FunnelBlock,
  input: { eventTitle: string; registrationUrl: string; replayUrl: string; providerLabel: string },
): FunnelWebinarEventLink {
  const eventTitle = input.eventTitle.trim().slice(0, 140) || block.title;
  const providerLabel = input.providerLabel.trim().slice(0, 80) || "External webinar provider";

  return {
    id: `webinar-event-link-${draft.id}-${step.id}-${block.id}`,
    status: "owner-session-linked",
    issue: draftFunnelAdvancedParityIssue,
    parentIssue: draftFunnelBuilderParentIssue,
    eventTitle,
    registrationUrl: publicWebinarUrl(input.registrationUrl, "Registration", { required: true }) ?? "",
    replayUrl: publicWebinarUrl(input.replayUrl, "Replay", { required: false }),
    providerLabel,
    accessMode: "external-event-reference",
    confirmationRequired: true,
    idempotencyRequired: true,
    staleRevisionRequired: true,
    liveSchedulingEnabled: false,
    reminderAutomationEnabled: false,
    attendanceTrackingEnabled: false,
    replayHostingEnabled: false,
    providerSecretsIncluded: false,
    privateAttendeeDataIncluded: false,
    linkedAt: new Date().toISOString(),
  };
}

function assertDraftIsMutable(draft: DraftFunnelRecord, action: string) {
  if (draft.status === "archived") {
    throw new Error(`Archived draft funnels are read-only and cannot be ${action}.`);
  }
}

export async function updateDraftFunnelStep(
  db: D1Database,
  identity: AdminIdentity,
  input: { draftId: string; stepId: string; title: string; goal: string; kind: string; idempotencyKey: string },
) {
  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "updated");

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const nextTitle = input.title.trim().slice(0, 120) || step.title;
  const nextGoal = input.goal.trim().slice(0, 500) || step.goal;
  const nextKind = normalizeStepKind(input.kind, step.kind);
  const nextRevisionId = `${draft.revisionId}-step-edit-${Date.now()}`;

  await db.batch([
    db
      .prepare(
        `UPDATE funnel_draft_steps
        SET title = ?, goal = ?, kind = ?, updated_at = unixepoch()
        WHERE id = ? AND funnel_draft_id = ?`,
      )
      .bind(nextTitle, nextGoal, nextKind, step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} updated step ${step.id} in ${draft.title}.`,
      {
        action: "step_update",
        before: compactStepForAudit(step),
        after: { ...compactStepForAudit(step), title: nextTitle, goal: nextGoal, kind: nextKind },
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function updateDraftFunnelBlock(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockId: string;
    title: string;
    body: string;
    expectedRevisionId: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "updated");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before editing this block.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const block = step.blocks.find((item) => item.id === input.blockId);
  if (!block) throw new Error("Draft funnel block not found.");

  const nextTitle = input.title.trim().slice(0, 120) || block.title;
  const nextBody = input.body.trim().slice(0, 1_200) || block.body;
  const nextBlocks = step.blocks.map((item) => {
    if (item.id !== block.id) return item;
    return {
      ...item,
      title: nextTitle,
      body: nextBody,
    };
  });
  const nextRevisionId = `${draft.revisionId}-block-edit-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} updated block ${block.id} in ${draft.title}.`,
      {
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        issue: draftFunnelBlockEditingIssue,
        action: "block_update",
        draftFunnelBlockEditingCapability: draftFunnelBlockEditingCapability.id,
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        blockId: block.id,
        before: compactBlockForAudit(block),
        after: compactBlockForAudit({
          ...block,
          title: nextTitle,
          body: nextBody,
        }),
        blockIdPreserved: true,
        blockKindPreserved: true,
        checkoutLinkPreserved: Boolean(block.checkoutLink),
        resourceDeliveryLinkPreserved: Boolean(block.resourceDeliveryLink),
        webinarEventLinkPreserved: Boolean(block.webinarEventLink),
        orderedStepStructureChanged: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function updateDraftFunnelBlockVisualStyle(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockId: string;
    visualStyleId: string;
    expectedRevisionId: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "restyled");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before styling this block.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const block = step.blocks.find((item) => item.id === input.blockId);
  if (!block) throw new Error("Draft funnel block not found.");

  const normalizedStyleId = input.visualStyleId.trim();
  if (!isFunnelBlockVisualStyleId(normalizedStyleId)) {
    throw new Error("Choose a supported block visual style.");
  }

  const nextStyle = funnelBlockVisualStyleForId(normalizedStyleId);
  const previousStyle = funnelBlockVisualStyleForId(block.visualStyle);
  const nextBlocks = step.blocks.map((item) => {
    if (item.id !== block.id) return item;
    return {
      ...item,
      visualStyle: nextStyle.id,
    };
  });
  const nextRevisionId = `${draft.revisionId}-block-style-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} applied ${nextStyle.label} style to block ${block.id} in ${draft.title}.`,
      {
        issue: draftFunnelAdvancedParityIssue,
        action: "block_visual_style_update",
        draftFunnelBlockVisualStyleCapability: draftFunnelBlockVisualStyleCapability.id,
        ...agentFunnelWriteMetadata(input.agentWriteAudit, { publicRouteMutation: draft.status === "published" }),
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        blockId: block.id,
        previousStyleId: previousStyle.id,
        nextStyleId: nextStyle.id,
        before: compactBlockForAudit(block),
        after: compactBlockForAudit({
          ...block,
          visualStyle: nextStyle.id,
        }),
        blockIdPreserved: true,
        blockKindPreserved: true,
        blockTitlePreserved: true,
        blockBodyPreserved: true,
        checkoutLinkPreserved: Boolean(block.checkoutLink),
        resourceDeliveryLinkPreserved: Boolean(block.resourceDeliveryLink),
        webinarEventLinkPreserved: Boolean(block.webinarEventLink),
        privatePreviewRendersStyle: true,
        publicPublishedRouteRendersStyle: true,
        publicRouteMutation: draft.status === "published",
        arbitraryCssIncluded: false,
        scriptIncluded: false,
        fullAbsoluteCanvasEditingEnabled: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function addDraftFunnelBlock(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockKind: string;
    title: string;
    body: string;
    expectedRevisionId: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "updated");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before adding this block.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const libraryItem = blockLibraryItem(input.blockKind as FunnelBlockKind);
  if (!libraryItem) {
    throw new Error("Choose a reusable block type before adding this block.");
  }

  const addedBlock: FunnelBlock = {
    id: `${draft.id}-block-${step.order}-${libraryItem.kind}-${Date.now()}`,
    kind: libraryItem.kind,
    title: input.title.trim().slice(0, 120) || libraryItem.title,
    body: input.body.trim().slice(0, 1_200) || libraryItem.purpose,
    agentEditable: libraryItem.agentEditable,
  };
  const nextBlocks = [...step.blocks, addedBlock];
  const nextRevisionId = `${draft.revisionId}-block-add-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} added ${libraryItem.kind} block ${addedBlock.id} to ${draft.title}.`,
      {
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        issue: draftFunnelBlockStructureIssue,
        action: "block_add",
        draftFunnelBlockStructureCapability: draftFunnelBlockStructureCapability.id,
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        blockLibraryItemId: libraryItem.id,
        beforeBlockCount: step.blocks.length,
        afterBlockCount: nextBlocks.length,
        addedBlock: compactBlockForAudit(addedBlock),
        checkoutLinksPreserved: step.blocks.flatMap((block) => (block.checkoutLink ? [block.checkoutLink.id] : [])),
        resourceDeliveryLinksPreserved: step.blocks.flatMap((block) =>
          block.resourceDeliveryLink ? [block.resourceDeliveryLink.id] : [],
        ),
        webinarEventLinksPreserved: step.blocks.flatMap((block) => (block.webinarEventLink ? [block.webinarEventLink.id] : [])),
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function removeDraftFunnelBlock(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockId: string;
    expectedRevisionId: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "updated");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before removing this block.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const block = step.blocks.find((item) => item.id === input.blockId);
  if (!block) throw new Error("Draft funnel block not found.");

  if (step.blocks.length <= 1) {
    throw new Error("Draft funnel steps must keep at least one block. Add another block before removing this one.");
  }

  if (block.checkoutLink) {
    throw new Error("Checkout-linked blocks cannot be removed in this slice. Add or edit other blocks, or plan a checkout unlink workflow.");
  }

  const nextBlocks = step.blocks.filter((item) => item.id !== block.id);
  const nextRevisionId = `${draft.revisionId}-block-remove-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} removed block ${block.id} from ${draft.title}.`,
      {
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        issue: draftFunnelBlockStructureIssue,
        action: "block_remove",
        draftFunnelBlockStructureCapability: draftFunnelBlockStructureCapability.id,
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        removedBlock: compactBlockForAudit(block),
        beforeBlockCount: step.blocks.length,
        afterBlockCount: nextBlocks.length,
        checkoutLinkedBlockRemovalRefused: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function reorderDraftFunnelBlock(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockId: string;
    direction: string;
    expectedRevisionId: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "reordered");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before moving this block.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const currentIndex = step.blocks.findIndex((item) => item.id === input.blockId);
  if (currentIndex === -1) throw new Error("Draft funnel block not found.");

  const direction = input.direction === "down" ? "down" : "up";
  const neighborIndex = direction === "down" ? currentIndex + 1 : currentIndex - 1;
  const neighbor = step.blocks[neighborIndex];
  const block = step.blocks[currentIndex];
  if (!neighbor) {
    throw new Error(`Draft funnel block cannot move ${direction} from this position.`);
  }

  const nextBlocks = [...step.blocks];
  nextBlocks[currentIndex] = neighbor;
  nextBlocks[neighborIndex] = block;
  const nextRevisionId = `${draft.revisionId}-block-reorder-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} moved block ${block.id} ${direction} in ${draft.title}.`,
      {
        issue: draftFunnelAdvancedParityIssue,
        action: "block_reorder",
        draftFunnelBlockReorderCapability: draftFunnelBlockReorderCapability.id,
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        blockId: block.id,
        direction,
        beforeBlockIds: step.blocks.map((item) => item.id),
        afterBlockIds: nextBlocks.map((item) => item.id),
        movedBlock: compactBlockForAudit(block),
        swappedWithBlock: compactBlockForAudit(neighbor),
        blockIdsPreserved: true,
        blockKindsPreserved: true,
        blockTitlesPreserved: true,
        blockBodiesPreserved: true,
        checkoutLinksPreserved: true,
        resourceDeliveryLinksPreserved: true,
        webinarEventLinksPreserved: true,
        stepMembershipPreserved: true,
        crossStepMove: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function moveDraftFunnelBlockToStep(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    targetStepId: string;
    blockId: string;
    expectedRevisionId: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "reordered");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before moving this block across steps.");
  }

  const sourceStep = draft.steps.find((item) => item.id === input.stepId);
  if (!sourceStep) throw new Error("Source draft funnel step not found.");

  const targetStep = draft.steps.find((item) => item.id === input.targetStepId);
  if (!targetStep) throw new Error("Destination draft funnel step not found.");

  if (sourceStep.id === targetStep.id) {
    throw new Error("Choose a different destination step before moving this block.");
  }

  const block = sourceStep.blocks.find((item) => item.id === input.blockId);
  if (!block) throw new Error("Draft funnel block not found.");

  if (sourceStep.blocks.length <= 1) {
    throw new Error("Draft funnel steps must keep at least one block. Add another block before moving this one.");
  }

  const nextSourceBlocks = sourceStep.blocks.filter((item) => item.id !== block.id);
  const nextTargetBlocks = [...targetStep.blocks, block];
  const nextRevisionId = `${draft.revisionId}-block-cross-step-move-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextSourceBlocks), sourceStep.id, draft.id),
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextTargetBlocks), targetStep.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} moved block ${block.id} from ${sourceStep.title} to ${targetStep.title} in ${draft.title}.`,
      {
        issue: draftFunnelAdvancedParityIssue,
        action: "block_cross_step_move",
        draftFunnelBlockCrossStepMoveCapability: draftFunnelBlockCrossStepMoveCapability.id,
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        expectedRevisionId: input.expectedRevisionId,
        sourceStepId: sourceStep.id,
        targetStepId: targetStep.id,
        blockId: block.id,
        beforeSourceBlockIds: sourceStep.blocks.map((item) => item.id),
        afterSourceBlockIds: nextSourceBlocks.map((item) => item.id),
        beforeTargetBlockIds: targetStep.blocks.map((item) => item.id),
        afterTargetBlockIds: nextTargetBlocks.map((item) => item.id),
        movedBlock: compactBlockForAudit(block),
        blockIdsPreserved: true,
        blockKindsPreserved: true,
        blockTitlesPreserved: true,
        blockBodiesPreserved: true,
        checkoutLinksPreserved: true,
        resourceDeliveryLinksPreserved: true,
        webinarEventLinksPreserved: true,
        stepMembershipChanged: true,
        sourceStepEmptied: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function linkDraftFunnelStepToCheckoutOffer(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    offerId: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelCheckoutLinkConfirmationText) {
    throw new Error("Exact checkout link confirmation text is required.");
  }

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "linked to checkout");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before linking checkout.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const checkoutBlockIndex = step.blocks.findIndex((block) => block.kind === "checkout");
  if (checkoutBlockIndex === -1) {
    throw new Error("Draft funnel step needs a checkout block before linking checkout.");
  }

  const offer = checkoutOfferForDraftLink(input.offerId);
  if (!offer) {
    throw new Error("Only the seeded primary checkout offer can be linked in this slice.");
  }

  const checkoutLink = checkoutLinkForOffer(draft, step, offer);
  const nextBlocks = step.blocks.map((block, index) => {
    if (index !== checkoutBlockIndex) return block;
    return {
      ...block,
      body: `Linked to ${offer.title} through ${checkoutOfferStack.checkoutEndpoint}. This does not start a checkout session or enable live billing by itself.`,
      checkoutLink,
    };
  });
  const nextRevisionId = `${draft.revisionId}-checkout-link-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} linked ${offer.title} to step ${step.id} in ${draft.title}.`,
      {
        issue: draftFunnelCheckoutLinkingIssue,
        action: "checkout_link",
        checkoutLinkingCapability: checkoutLinkingCapability.id,
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        expectedRevisionId: input.expectedRevisionId,
        offerCatalogRevisionId: checkoutOfferStack.revisionId,
        before: compactStepForAudit(step),
        after: {
          ...compactStepForAudit({ ...step, blocks: nextBlocks }),
          checkoutLink,
        },
        liveBillingEnabled: false,
        rawStripeIdsIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function unlinkDraftFunnelCheckoutLink(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockId: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelCheckoutUnlinkConfirmationText) {
    throw new Error("Exact checkout unlink confirmation text is required.");
  }

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "unlinked from checkout");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before unlinking checkout.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const block = step.blocks.find((item) => item.id === input.blockId);
  if (!block) throw new Error("Draft funnel block not found.");

  if (!block.checkoutLink) {
    throw new Error("Draft funnel block does not have a checkout link to unlink.");
  }

  const nextBlocks = step.blocks.map((item) => {
    if (item.id !== block.id) return item;
    return {
      ...item,
      checkoutLink: undefined,
    };
  });
  const nextRevisionId = `${draft.revisionId}-checkout-unlink-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} unlinked checkout metadata from block ${block.id} in ${draft.title}.`,
      {
        issue: draftFunnelAdvancedParityIssue,
        action: "checkout_unlink",
        draftFunnelCheckoutUnlinkCapability: draftFunnelCheckoutUnlinkCapability.id,
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        blockId: block.id,
        removedCheckoutLink: block.checkoutLink,
        before: compactBlockForAudit(block),
        after: compactBlockForAudit({
          ...block,
          checkoutLink: undefined,
        }),
        blockIdPreserved: true,
        blockKindPreserved: true,
        blockTitlePreserved: true,
        blockBodyPreserved: true,
        orderedStepStructureChanged: false,
        liveBillingEnabled: false,
        rawStripeIdsIncluded: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function linkDraftFunnelBlockToResourceDelivery(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockId: string;
    productId: string;
    assetId: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelResourceDeliveryLinkConfirmationText) {
    throw new Error("Exact resource delivery link confirmation text is required.");
  }

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "linked to resource delivery");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before linking resource delivery.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const block = step.blocks.find((item) => item.id === input.blockId);
  if (!block) throw new Error("Draft funnel block not found.");

  if (block.kind !== "resource" && block.kind !== "delivery") {
    throw new Error("Resource delivery links can only be attached to resource or delivery blocks.");
  }

  const resource = productResourceForLink(input.productId, input.assetId);
  if (!resource) {
    throw new Error("Choose a supported product and asset from the product access catalog before linking resource delivery.");
  }

  const resourceDeliveryLink = resourceDeliveryLinkForProduct(draft, step, block, resource);
  const nextBlocks = step.blocks.map((item) => {
    if (item.id !== block.id) return item;
    return {
      ...item,
      resourceDeliveryLink,
    };
  });
  const nextRevisionId = `${draft.revisionId}-resource-delivery-link-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} linked resource delivery ${resource.asset.id} to block ${block.id} in ${draft.title}.`,
      {
        issue: draftFunnelAdvancedParityIssue,
        action: "resource_delivery_link",
        draftFunnelResourceDeliveryLinkCapability: draftFunnelResourceDeliveryLinkCapability.id,
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        blockId: block.id,
        resourceDeliveryLink,
        before: compactBlockForAudit(block),
        after: compactBlockForAudit({
          ...block,
          resourceDeliveryLink,
        }),
        blockIdPreserved: true,
        blockKindPreserved: true,
        blockTitlePreserved: true,
        blockBodyPreserved: true,
        orderedStepStructureChanged: false,
        liveFulfillmentDeliveryEnabled: false,
        arbitraryUploadedAssetDeliveryEnabled: false,
        rawR2KeysIncluded: false,
        signedUrlsIncluded: false,
        buyerDataIncluded: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function linkDraftFunnelBlockToWebinarEvent(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockId: string;
    eventTitle: string;
    registrationUrl: string;
    replayUrl: string;
    providerLabel: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelWebinarEventLinkConfirmationText) {
    throw new Error("Exact webinar event link confirmation text is required.");
  }

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "linked to a webinar event");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before linking webinar event details.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const block = step.blocks.find((item) => item.id === input.blockId);
  if (!block) throw new Error("Draft funnel block not found.");

  if (block.kind !== "webinar") {
    throw new Error("Webinar event links can only be attached to webinar blocks.");
  }

  const webinarEventLink = webinarEventLinkForBlock(draft, step, block, input);
  const nextBlocks = step.blocks.map((item) => {
    if (item.id !== block.id) return item;
    return {
      ...item,
      webinarEventLink,
    };
  });
  const nextRevisionId = `${draft.revisionId}-webinar-event-link-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET blocks_json = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(JSON.stringify(nextBlocks), step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} linked webinar event ${webinarEventLink.id} to block ${block.id} in ${draft.title}.`,
      {
        issue: draftFunnelAdvancedParityIssue,
        action: "webinar_event_link",
        draftFunnelWebinarEventLinkCapability: draftFunnelWebinarEventLinkCapability.id,
        ...agentFunnelWriteMetadata(input.agentWriteAudit),
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        blockId: block.id,
        webinarEventLink,
        before: compactBlockForAudit(block),
        after: compactBlockForAudit({
          ...block,
          webinarEventLink,
        }),
        blockIdPreserved: true,
        blockKindPreserved: true,
        blockTitlePreserved: true,
        blockBodyPreserved: true,
        orderedStepStructureChanged: false,
        liveSchedulingEnabled: false,
        reminderAutomationEnabled: false,
        attendanceTrackingEnabled: false,
        replayHostingEnabled: false,
        providerSecretsIncluded: false,
        privateAttendeeDataIncluded: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}

export async function publishDraftFunnel(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelPublishConfirmationText) {
    throw new Error("Exact publish confirmation text is required.");
  }

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "published");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before publishing.");
  }

  if (draft.steps.length < 3) {
    throw new Error("Draft funnel needs at least three ordered steps before publishing.");
  }

  const publicRoute = publicFunnelPath(draft.slug);
  const nextRevisionId = `${draft.revisionId}-published-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_drafts SET status = 'published', preview_route = ?, revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(publicRoute, nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_published",
      input.idempotencyKey,
      `${identityEmail(identity)} published ${draft.title} to ${publicRoute}.`,
      {
        ...agentFunnelWriteMetadata(input.agentWriteAudit, { publicRouteMutation: true }),
        action: "draft_publish",
        publicRoute,
        expectedRevisionId: input.expectedRevisionId,
        stepCount: draft.steps.length,
        directAgentPublicPublishing: Boolean(input.agentWriteAudit),
        rollbackAction: "archive-draft",
        liveBillingMutation: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? { ...draft, status: "published", previewRoute: publicRoute, revisionId: nextRevisionId };
}

export async function archiveDraftFunnel(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelArchiveConfirmationText) {
    throw new Error("Exact archive confirmation text is required.");
  }

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before archiving.");
  }

  if (draft.status === "archived") {
    return draft;
  }

  const previousStatus = draft.status;
  const previousPreviewRoute = draft.previewRoute;
  const nextRevisionId = `${draft.revisionId}-archived-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_drafts SET status = 'archived', preview_route = NULL, revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} archived ${draft.title}.`,
      {
        ...agentFunnelWriteMetadata(input.agentWriteAudit, { publicRouteMutation: previousStatus === "published" }),
        issue: draftFunnelArchiveIssue,
        action: "draft_archive",
        draftFunnelArchiveCapability: draftFunnelArchiveCapability.id,
        expectedRevisionId: input.expectedRevisionId,
        previousStatus,
        nextStatus: "archived",
        previousPreviewRoute,
        previewRouteCleared: true,
        publishedRouteRemoved: previousStatus === "published",
        deletedDraftRows: false,
        deletedStepRows: false,
        deletedAuditRows: false,
        privateAuthDataIncluded: false,
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? { ...draft, status: "archived", previewRoute: null, revisionId: nextRevisionId };
}

export async function purgeArchivedDraftFunnel(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    expectedRevisionId: string;
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
): Promise<DraftFunnelPurgeResult> {
  const replay = await purgeEventForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  if (input.confirmationText !== draftFunnelPurgeConfirmationText) {
    throw new Error("Exact archived draft purge confirmation text is required.");
  }

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");

  if (draft.status !== "archived") {
    throw new Error("Only archived draft funnels can be purged. Archive this draft before purging it.");
  }

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before purging.");
  }

  const blockCount = draft.steps.reduce((total, step) => total + step.blocks.length, 0);
  const metadata = {
    issue: draftFunnelAdvancedParityIssue,
    parentIssue: draftFunnelBuilderParentIssue,
    action: "archived_draft_purge",
    draftFunnelPurgeCapability: draftFunnelPurgeCapability.id,
    expectedRevisionId: input.expectedRevisionId,
    previousStatus: draft.status,
    previousPreviewRoute: draft.previewRoute,
    stepCount: draft.steps.length,
    blockCount,
    deletedDraftRows: true,
    deletedStepRows: true,
    deletedAuditRows: false,
    deletedProductAssets: false,
    deletedR2Objects: false,
    deletedBuyerRecords: false,
    directAgentWrite: Boolean(input.agentWriteAudit),
    privateAuthDataIncluded: false,
    ...agentFunnelWriteMetadata(input.agentWriteAudit),
  };
  const eventId = runtimeId("funnel-purge");
  const summary = `${identityEmail(identity)} purged archived draft ${draft.title} after tombstone evidence was recorded.`;

  await db.batch([
    db
      .prepare(
        `INSERT INTO funnel_purge_events (
          id, draft_id, draft_slug, draft_title, previous_status, previous_revision_id,
          actor_user_id, actor_email, summary, idempotency_key, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
        ON CONFLICT(idempotency_key) DO NOTHING`,
      )
      .bind(
        eventId,
        draft.id,
        draft.slug,
        draft.title,
        draft.status,
        draft.revisionId,
        identity.userId,
        identityEmail(identity),
        summary,
        input.idempotencyKey,
        JSON.stringify(metadata),
      ),
    db.prepare("DELETE FROM funnel_drafts WHERE id = ? AND status = 'archived'").bind(draft.id),
  ]);

  const persisted = await purgeEventForIdempotencyKey(db, input.idempotencyKey);
  if (!persisted) {
    throw new Error("Archived draft purge tombstone was not recorded.");
  }

  return persisted;
}

export function publicFunnelFromDraft(draft: DraftFunnelRecord): FunnelRecord {
  return {
    id: `published-${draft.id}`,
    slug: draft.slug,
    title: draft.title,
    status: "published",
    issue: draftFunnelPublishingIssue,
    parentIssue: draftFunnelBuilderParentIssue,
    summary: draft.summary,
    audienceSegmentIds: seededFunnel.audienceSegmentIds,
    linkedFeatureIds: seededFunnel.linkedFeatureIds,
    previewRoute: draft.previewRoute ?? publicFunnelPath(draft.slug),
    sourceDataRoute: draft.sourceDataRoute,
    revisionId: draft.revisionId,
    steps: draft.steps,
    writeBoundary:
      "Published D1 funnels are public read surfaces. Linked checkout blocks can render the existing sandbox checkout start panel after exact confirmation. Owner-session archive/unpublish can remove a published D1 draft from public source-data without deleting audit evidence. Further publishing edits, checkout-linking, non-archived purge, live billing, and agent writes require owner-session confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.",
    validation: [
      "Owner-session publish action requires exact confirmation and revision match.",
      "Public /funnels/{slug} route renders ordered D1 steps and blocks.",
      "Public /funnels/{slug} route renders sandbox checkout start when a checkout block carries owner-confirmed checkoutLink metadata.",
      "/funnels/source-data lists only published D1 funnel summaries, not unpublished private drafts.",
    ],
  };
}

export async function getPublishedD1FunnelBySlug(slug: string) {
  try {
    const db = await getFunnelDraftD1OrThrow();
    const draft = await loadDraftBySlugFromD1(db, slug, "published");
    return draft ? publicFunnelFromDraft(draft) : null;
  } catch {
    return null;
  }
}

export async function getPublishedD1FunnelSourceData() {
  try {
    const db = await getFunnelDraftD1OrThrow();
    const drafts = (await loadDraftsFromD1(db)).filter((draft) => draft.status === "published");
    return {
      source: "d1" as const,
      loadError: null,
      publishedFunnels: drafts.map((draft) => publicFunnelFromDraft(draft)),
      privateDraftsIncluded: false,
      rawOwnerDataIncluded: false,
    };
  } catch (error) {
    return {
      source: "fixture" as const,
      loadError: error instanceof Error ? error.message : "Unable to load published D1 funnels.",
      publishedFunnels: [] as FunnelRecord[],
      privateDraftsIncluded: false,
      rawOwnerDataIncluded: false,
    };
  }
}

export async function reorderDraftFunnelStep(
  db: D1Database,
  identity: AdminIdentity,
  input: { draftId: string; stepId: string; direction: string; idempotencyKey: string },
) {
  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "reordered");

  const orderedSteps = [...draft.steps].sort((left, right) => left.order - right.order);
  const currentIndex = orderedSteps.findIndex((step) => step.id === input.stepId);
  if (currentIndex === -1) throw new Error("Draft funnel step not found.");

  const neighborIndex = input.direction === "down" ? currentIndex + 1 : currentIndex - 1;
  const neighbor = orderedSteps[neighborIndex];
  const step = orderedSteps[currentIndex];
  if (!neighbor) return draft;

  const nextRevisionId = `${draft.revisionId}-step-reorder-${Date.now()}`;

  await db.batch([
    db
      .prepare("UPDATE funnel_draft_steps SET step_order = -9999, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(step.id, draft.id),
    db
      .prepare("UPDATE funnel_draft_steps SET step_order = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(step.order, neighbor.id, draft.id),
    db
      .prepare("UPDATE funnel_draft_steps SET step_order = ?, updated_at = unixepoch() WHERE id = ? AND funnel_draft_id = ?")
      .bind(neighbor.order, step.id, draft.id),
    db
      .prepare("UPDATE funnel_drafts SET revision_id = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(nextRevisionId, draft.id),
    insertAuditStatement(
      db,
      draft,
      identity,
      "draft_updated",
      input.idempotencyKey,
      `${identityEmail(identity)} reordered step ${step.id} in ${draft.title}.`,
      {
        action: "step_reorder",
        direction: input.direction === "down" ? "down" : "up",
        before: orderedSteps.map(compactStepForAudit),
        after: orderedSteps
          .map((item) => {
            if (item.id === step.id) return { ...compactStepForAudit(item), order: neighbor.order };
            if (item.id === neighbor.id) return { ...compactStepForAudit(item), order: step.order };
            return compactStepForAudit(item);
          })
          .sort((left, right) => left.order - right.order),
      },
    ),
  ]);

  return (await loadDraftFromD1(db, draft.id)) ?? draft;
}
