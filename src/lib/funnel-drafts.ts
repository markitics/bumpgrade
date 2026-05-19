import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import type { FunnelBlock, FunnelStep, FunnelStepKind } from "@/lib/funnels";
import {
  draftFunnelBuilderIssue,
  draftFunnelBuilderParentIssue,
  draftFunnelBuilderWriteBoundary,
  draftFunnelStepEditingIssue,
  editableDraftCapability,
  seededFunnel,
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

const draftFunnelStepKinds: FunnelStepKind[] = ["opt_in", "sales", "checkout", "upsell", "thank_you"];

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

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function identityEmail(identity: AdminIdentity) {
  return identity.email ?? "unknown-owner@bumpgrade.local";
}

function draftBlocksForStep(step: FunnelStep): FunnelBlock[] {
  return step.blocks.map((block) => ({
    ...block,
    id: block.id.replace(/^block-/, "draft-block-"),
  }));
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

async function loadDraftFromD1(db: D1Database, draftId: string) {
  const drafts = await loadDraftsFromD1(db);
  return drafts.find((draft) => draft.id === draftId) ?? null;
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
  eventKind: "draft_seeded" | "draft_created" | "draft_updated",
  idempotencyKey: string,
  summary?: string,
  metadata: Record<string, unknown> = {},
) {
  const action = eventKind === "draft_seeded" ? "seeded" : eventKind === "draft_created" ? "created" : "updated";
  const issue = eventKind === "draft_updated" ? draftFunnelStepEditingIssue : draftFunnelBuilderIssue;
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
      JSON.stringify({ issue, parentIssue: draftFunnelBuilderParentIssue, ...metadata }),
    );
}

async function persistDraft(
  db: D1Database,
  draft: DraftFunnelRecord,
  identity: AdminIdentity,
  eventKind: "draft_seeded" | "draft_created",
  idempotencyKey: string,
) {
  await db.batch([
    insertDraftStatement(db, draft, {
      issue: draftFunnelBuilderIssue,
      parentIssue: draftFunnelBuilderParentIssue,
      editableDraftCapability: editableDraftCapability.id,
    }),
    parkExistingStepOrdersStatement(db, draft.id),
    ...insertStepStatements(db, draft),
    insertAuditStatement(db, draft, identity, eventKind, idempotencyKey),
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
      "D1-backed working copy seeded from the indie launch sandbox funnel. It can be inspected by the owner before granular editing, preview generation, and publishing ship.",
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

export async function createDraftFunnelFromTemplate(
  db: D1Database,
  identity: AdminIdentity,
  input: { title: string; idempotencyKey: string },
) {
  const baseTitle = input.title.trim() || "Untitled launch funnel";
  const slug = await uniqueDraftSlug(db, slugifyDraftFunnelTitle(baseTitle));
  const draftId = `funnel-draft-${slug}`;
  const draft: DraftFunnelRecord = {
    id: draftId,
    slug,
    title: baseTitle.slice(0, 120),
    status: "draft",
    summary:
      "D1-backed editable draft funnel created from the default three-step opt-in, sales, and thank-you template.",
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
  };
}

export async function updateDraftFunnelStep(
  db: D1Database,
  identity: AdminIdentity,
  input: { draftId: string; stepId: string; title: string; goal: string; kind: string; idempotencyKey: string },
) {
  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");

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

export async function reorderDraftFunnelStep(
  db: D1Database,
  identity: AdminIdentity,
  input: { draftId: string; stepId: string; direction: string; idempotencyKey: string },
) {
  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");

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
