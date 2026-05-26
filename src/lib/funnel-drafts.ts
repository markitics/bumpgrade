import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/audience-opt-in";
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
  draftFunnelBlockCanvasLayoutCapability,
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
  normalizeFunnelBlockCanvasLayout,
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

export type DraftFunnelBulkPurgeTarget = {
  draftId: string;
  expectedRevisionId: string;
};

export type DraftFunnelBulkPurgeResult = {
  id: string;
  requestedDraftCount: number;
  purgedDraftCount: number;
  idempotentReplayCount: number;
  purges: DraftFunnelPurgeResult[];
  idempotencyKey: string;
  actorEmail: string;
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

export type CompetitorImportPrivateRecordReviewDecision = "pending_review" | "ready" | "needs_cleanup";

export type CompetitorImportPrivateRecordExtractedField = {
  id: string;
  label: string;
  targetArea: ImportDraftEntity;
  source: "safe_header_group" | "safe_signal_label" | "source_guide";
  status: "ready_for_review" | "needs_context";
  reviewPrompt: string;
  fromHeaderLabels: string[];
  fromSignalLabels: string[];
  editedByOwner: boolean;
  editedAt: string | null;
  editSource: "verified_publisher_extracted_field_edit" | null;
  rawValueIncluded: false;
  rawRowsEchoed: false;
  rawTextEchoed: false;
  rawFileNamesEchoed: false;
  customerValuesIncluded: false;
  privateEmailsIncluded: false;
  goLiveEffectsEnabled: false;
};

export type CompetitorImportPrivateRecordSubscriberImportDepth = {
  responseField: "subscriberImportDepth";
  status: "ready_for_private_review" | "needs_context";
  source: "safe_export_headers_and_signals" | "source_guide";
  aggregateContactRowCount: number;
  parsedExportFileCount: number;
  identitySignals: string[];
  segmentationSignals: string[];
  consentStatusSignals: string[];
  sequenceSignals: string[];
  sourceChecklistItemIds: string[];
  reviewSteps: string[];
  goLiveBlockers: string[];
  redaction: {
    rawContactRowsIncluded: false;
    rawEmailsIncluded: false;
    rawNamesIncluded: false;
    rawExportTextIncluded: false;
    rawFileNamesEchoed: false;
    subscriberRowsCreated: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
    exportEnabled: false;
    goLiveEffectsEnabled: false;
  };
};

export type CompetitorImportPrivateRecordSubscriberPreflightStatus =
  | "not_recorded"
  | "ready_for_import_planning"
  | "needs_cleanup";

export type CompetitorImportPrivateRecordSubscriberPreflight = {
  responseField: "subscriberImportPreflight";
  status: CompetitorImportPrivateRecordSubscriberPreflightStatus;
  source: "verified_publisher_subscriber_preflight" | null;
  recordedAt: string | null;
  depthStatus: CompetitorImportPrivateRecordSubscriberImportDepth["status"] | null;
  aggregateContactRowCount: number;
  parsedExportFileCount: number;
  summary: string;
  nextStep: string;
  acknowledgedBlockers: string[];
  createsSubscriberRows: false;
  createsSequenceEnrollments: false;
  emailDeliveryEnabled: false;
  exportEnabled: false;
  goLiveEffectsEnabled: false;
  redaction: {
    rawContactRowsIncluded: false;
    rawEmailsIncluded: false;
    rawNamesIncluded: false;
    rawExportTextIncluded: false;
    rawFileNamesEchoed: false;
    confirmationTextStored: false;
    idempotencyKeysIncluded: false;
    actorEmailIncluded: false;
    subscriberRowsCreated: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
    exportEnabled: false;
    goLiveEffectsEnabled: false;
  };
};

export type CompetitorImportPrivateRecordSubscriberImportCreationStatus =
  | "not_created"
  | "subscriber_records_created";

export type CompetitorImportPrivateRecordSubscriberImportCreation = {
  responseField: "subscriberImportCreation";
  status: CompetitorImportPrivateRecordSubscriberImportCreationStatus;
  source: "verified_publisher_subscriber_import_creation" | null;
  recordedAt: string | null;
  sourceFormId: string | null;
  sourceSegmentId: string | null;
  normalizedEmailCount: number;
  privateSubscriberRecordCount: number;
  createdPrivateSubscriberRecordCount: number;
  updatedPrivateSubscriberRecordCount: number;
  suppressedContactCount: number;
  malformedContactCount: number;
  summary: string;
  nextStep: string;
  createsSubscriberRows: boolean;
  createsSequenceEnrollments: false;
  emailDeliveryEnabled: false;
  exportEnabled: false;
  goLiveEffectsEnabled: false;
  redaction: {
    rawContactRowsIncluded: false;
    rawEmailsIncluded: false;
    rawNamesIncluded: false;
    rawExportTextIncluded: false;
    rawFileNamesEchoed: false;
    confirmationTextStored: false;
    idempotencyKeysIncluded: false;
    actorEmailIncluded: false;
    privateSubscriberEmailsIncludedInResponse: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
    exportEnabled: false;
    goLiveEffectsEnabled: false;
  };
};

export type CompetitorImportPrivateRecordSubscriberAudiencePromotionStatus =
  | "not_promoted"
  | "global_audience_rows_created";

export type CompetitorImportPrivateRecordSubscriberAudiencePromotion = {
  responseField: "subscriberAudiencePromotion";
  status: CompetitorImportPrivateRecordSubscriberAudiencePromotionStatus;
  source: "verified_publisher_subscriber_audience_promotion" | null;
  recordedAt: string | null;
  sourceFormId: string | null;
  sourceSegmentId: string | null;
  globalAudienceSubscriberStatus: "imported_pending_review";
  privateSubscriberRecordCount: number;
  promotedPrivateSubscriberRecordCount: number;
  createdGlobalAudienceSubscriberCount: number;
  updatedGlobalAudienceSubscriberCount: number;
  tagAssignmentCount: number;
  suppressedContactCount: number;
  summary: string;
  nextStep: string;
  createsGlobalAudienceSubscriberRows: boolean;
  createsConsentEvents: false;
  createsSequenceEnrollments: false;
  emailDeliveryEnabled: false;
  exportEnabled: false;
  goLiveEffectsEnabled: false;
  requiresConsentReviewBeforeSending: true;
  redaction: {
    rawContactRowsIncluded: false;
    rawEmailsIncluded: false;
    rawNamesIncluded: false;
    confirmationTextStored: false;
    idempotencyKeysIncluded: false;
    actorEmailIncluded: false;
    privateSubscriberEmailsIncludedInResponse: false;
    subscriberIdsIncludedInResponse: false;
    consentEventsCreated: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
    exportEnabled: false;
    goLiveEffectsEnabled: false;
  };
};

export type CompetitorImportPrivateRecordSubscriberPrivateExportStatus =
  | "not_exported"
  | "private_export_prepared";

export type CompetitorImportPrivateRecordSubscriberPrivateExport = {
  responseField: "subscriberPrivateExport";
  status: CompetitorImportPrivateRecordSubscriberPrivateExportStatus;
  source: "verified_publisher_private_subscriber_export" | null;
  recordedAt: string | null;
  exportFileName: string | null;
  privateSubscriberRecordCount: number;
  exportedPrivateSubscriberRecordCount: number;
  csvColumnHeaders: string[];
  summary: string;
  nextStep: string;
  createsSubscriberRows: false;
  createsConsentEvents: false;
  createsSequenceEnrollments: false;
  emailDeliveryEnabled: false;
  privateExportEnabled: boolean;
  publicExportEnabled: false;
  goLiveEffectsEnabled: false;
  redaction: {
    ownerOnly: true;
    publicSourceDataIncluded: false;
    unauthenticatedResponsesIncluded: false;
    rawContactRowsIncludedInPublicResponse: false;
    privateSubscriberEmailsIncludedInJsonResponse: false;
    confirmationTextStored: false;
    idempotencyKeysIncluded: false;
    actorEmailIncluded: false;
    consentEventsCreated: false;
    sequenceEnrollmentsCreated: false;
    emailDeliveryEnabled: false;
    publicExportEnabled: false;
    goLiveEffectsEnabled: false;
  };
};

export type CompetitorImportPrivateRecordCheckoutMigrationReadinessStatus =
  | "not_recorded"
  | "ready_for_checkout_rebuild"
  | "needs_payment_copy_cleanup"
  | "parked_for_later";

export type CompetitorImportPrivateRecordCheckoutMigrationReadiness = {
  responseField: "checkoutMigrationReadiness";
  status: CompetitorImportPrivateRecordCheckoutMigrationReadinessStatus;
  source: "verified_publisher_checkout_migration_readiness" | null;
  recordedAt: string | null;
  summary: string;
  nextStep: string;
  acknowledgedBlockers: string[];
  createsCheckoutIntents: false;
  createsStripeCheckoutSessions: false;
  importsPaymentCredentials: false;
  publicCheckoutRoutesEnabled: false;
  liveCheckoutEnabled: false;
  publicPublishingEnabled: false;
  goLiveEffectsEnabled: false;
  redaction: {
    paymentCredentialsIncluded: false;
    checkoutSessionIdsIncluded: false;
    customerRowsIncluded: false;
    confirmationTextStored: false;
    idempotencyKeysIncluded: false;
    actorEmailIncluded: false;
    checkoutIntentsCreated: false;
    stripeCheckoutSessionsCreated: false;
    publicCheckoutRoutesEnabled: false;
    liveCheckoutEnabled: false;
    goLiveEffectsEnabled: false;
  };
};

export type CompetitorImportPrivateSubscriberRecord = {
  id: string;
  importRecordId: string;
  draftFunnelId: string;
  importerPlatformId: string;
  importerSlug: string;
  platformName: string;
  email: string;
  emailHash: string;
  firstName: string | null;
  sourceStatus: string | null;
  status: "private_imported_pending_review" | "promoted_to_global_audience_pending_review" | "archived";
  sourceTagLabels: string[];
  createdAt: string | null;
  updatedAt: string | null;
  redaction: {
    ownerOnly: true;
    publicSourceDataIncluded: false;
    unauthenticatedResponsesIncluded: false;
    globalAudienceSubscriberRow: boolean;
    sequenceEnrollmentCreated: false;
    emailDeliveryEnabled: false;
    privateExportEligible: boolean;
    publicExportEnabled: false;
    goLiveEffectsEnabled: false;
  };
};

export type CompetitorImportSubscriberCandidate = {
  email: string;
  firstName: string | null;
  sourceStatus: string | null;
  tagLabels: string[];
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
export const draftFunnelBulkPurgeConfirmationText = "Purge selected archived draft funnels and keep tombstone evidence";

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
  extractedFields: CompetitorImportPrivateRecordExtractedField[];
  subscriberImportDepth: CompetitorImportPrivateRecordSubscriberImportDepth | null;
  subscriberImportPreflight: CompetitorImportPrivateRecordSubscriberPreflight | null;
  subscriberImportCreation: CompetitorImportPrivateRecordSubscriberImportCreation | null;
  subscriberAudiencePromotion: CompetitorImportPrivateRecordSubscriberAudiencePromotion | null;
  subscriberPrivateExport: CompetitorImportPrivateRecordSubscriberPrivateExport | null;
  checkoutMigrationReadiness: CompetitorImportPrivateRecordCheckoutMigrationReadiness | null;
  reviewDecision: CompetitorImportPrivateRecordReviewDecision;
  reviewDecisionAt: string | null;
  reviewDecisionSource: "verified_publisher_record_review" | null;
  reviewAudit: {
    confirmationTextStored: false;
    idempotencyKeysIncluded: false;
    actorEmailIncluded: false;
    rawNotesIncluded: false;
    goLiveEffectsEnabled: false;
  };
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

export type CompetitorImportPrivateRecordReviewResult = {
  draft: DraftFunnelRecord;
  record: CompetitorImportPrivateRecord;
  previousDecision: CompetitorImportPrivateRecordReviewDecision;
  idempotent: boolean;
  goLiveEffects: CompetitorImportPrivateRecord["goLiveEffects"];
  redaction: CompetitorImportPrivateRecord["redaction"];
};

export type CompetitorImportPrivateRecordExtractedFieldEditResult = {
  draft: DraftFunnelRecord;
  record: CompetitorImportPrivateRecord;
  field: CompetitorImportPrivateRecordExtractedField;
  previousField: CompetitorImportPrivateRecordExtractedField;
  idempotent: boolean;
  goLiveEffects: CompetitorImportPrivateRecord["goLiveEffects"];
  redaction: CompetitorImportPrivateRecord["redaction"];
};

export type CompetitorImportPrivateRecordSubscriberPreflightResult = {
  draft: DraftFunnelRecord;
  record: CompetitorImportPrivateRecord;
  preflight: CompetitorImportPrivateRecordSubscriberPreflight;
  previousPreflight: CompetitorImportPrivateRecordSubscriberPreflight | null;
  idempotent: boolean;
  goLiveEffects: CompetitorImportPrivateRecord["goLiveEffects"];
  redaction: CompetitorImportPrivateRecord["redaction"];
};

export type CompetitorImportPrivateRecordSubscriberImportCreationResult = {
  draft: DraftFunnelRecord;
  record: CompetitorImportPrivateRecord;
  creation: CompetitorImportPrivateRecordSubscriberImportCreation;
  previousCreation: CompetitorImportPrivateRecordSubscriberImportCreation | null;
  idempotent: boolean;
  goLiveEffects: CompetitorImportPrivateRecord["goLiveEffects"];
  redaction: CompetitorImportPrivateRecord["redaction"];
};

export type CompetitorImportPrivateRecordSubscriberAudiencePromotionResult = {
  draft: DraftFunnelRecord;
  record: CompetitorImportPrivateRecord;
  promotion: CompetitorImportPrivateRecordSubscriberAudiencePromotion;
  previousPromotion: CompetitorImportPrivateRecordSubscriberAudiencePromotion | null;
  idempotent: boolean;
  goLiveEffects: CompetitorImportPrivateRecord["goLiveEffects"];
  redaction: CompetitorImportPrivateRecord["redaction"];
};

export type CompetitorImportPrivateRecordSubscriberPrivateExportResult = {
  draft: DraftFunnelRecord;
  record: CompetitorImportPrivateRecord;
  privateSubscriberRecords: CompetitorImportPrivateSubscriberRecord[];
  subscriberExport: CompetitorImportPrivateRecordSubscriberPrivateExport;
  previousSubscriberExport: CompetitorImportPrivateRecordSubscriberPrivateExport | null;
  idempotent: boolean;
  goLiveEffects: CompetitorImportPrivateRecord["goLiveEffects"];
  redaction: CompetitorImportPrivateRecord["redaction"];
};

export type CompetitorImportPrivateRecordCheckoutMigrationReadinessResult = {
  draft: DraftFunnelRecord;
  record: CompetitorImportPrivateRecord;
  checkoutMigrationReadiness: CompetitorImportPrivateRecordCheckoutMigrationReadiness;
  previousCheckoutMigrationReadiness: CompetitorImportPrivateRecordCheckoutMigrationReadiness | null;
  idempotent: boolean;
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

function competitorImportRecordReviewDecision(value: unknown): CompetitorImportPrivateRecordReviewDecision {
  return value === "ready" || value === "needs_cleanup" ? value : "pending_review";
}

type CompetitorImportFieldDefinition = {
  id: string;
  label: string;
  targetArea: ImportDraftEntity;
  headerLabels?: string[];
  signalLabels?: string[];
  reviewPrompt: string;
};

const competitorImportFieldDefinitions: Record<ImportDraftEntity, CompetitorImportFieldDefinition[]> = {
  draft_funnel: [
    {
      id: "funnel-step-path",
      label: "Funnel step path",
      targetArea: "draft_funnel",
      headerLabels: ["Page or URL column"],
      signalLabels: ["Source URL"],
      reviewPrompt: "Confirm which detected page or path should become each Bumpgrade funnel step.",
    },
    {
      id: "launch-goal",
      label: "Launch goal",
      targetArea: "draft_funnel",
      signalLabels: ["Launch goal"],
      reviewPrompt: "Confirm the first launch goal before arranging the private funnel draft.",
    },
  ],
  draft_page_blocks: [
    {
      id: "page-section-outline",
      label: "Page section outline",
      targetArea: "draft_page_blocks",
      signalLabels: ["Page or offer copy", "Parsed export structure"],
      reviewPrompt: "Review which page sections should become private Bumpgrade blocks.",
    },
    {
      id: "page-form-or-checkout-block",
      label: "Form or checkout block",
      targetArea: "draft_page_blocks",
      headerLabels: ["Checkout or order column", "Page or URL column"],
      signalLabels: ["Source URL"],
      reviewPrompt: "Confirm whether a detected form, checkout, or URL belongs on this page.",
    },
  ],
  draft_checkout_offer: [
    {
      id: "offer-name",
      label: "Offer name",
      targetArea: "draft_checkout_offer",
      headerLabels: ["Product or offer column"],
      signalLabels: ["Page or offer copy"],
      reviewPrompt: "Confirm the offer name Bumpgrade should prepare before checkout setup.",
    },
    {
      id: "price-or-payment-shape",
      label: "Price or payment shape",
      targetArea: "draft_checkout_offer",
      headerLabels: ["Checkout or order column"],
      signalLabels: ["Page or offer copy"],
      reviewPrompt: "Review the price, payment shape, coupon, bump, or upsell context before any live checkout exists.",
    },
    {
      id: "checkout-source",
      label: "Checkout source",
      targetArea: "draft_checkout_offer",
      headerLabels: ["Page or URL column"],
      signalLabels: ["Source URL"],
      reviewPrompt: "Confirm which source path should inform the private checkout draft.",
    },
  ],
  draft_product_catalog: [
    {
      id: "product-title",
      label: "Product title",
      targetArea: "draft_product_catalog",
      headerLabels: ["Product or offer column"],
      signalLabels: ["Page or offer copy"],
      reviewPrompt: "Confirm the product title and promise before creating buyer-facing access.",
    },
    {
      id: "delivery-or-access-promise",
      label: "Delivery or access promise",
      targetArea: "draft_product_catalog",
      signalLabels: ["Follow-up notes", "Page or offer copy"],
      reviewPrompt: "Review delivery and access expectations while fulfillment stays off.",
    },
  ],
  draft_audience_import: [
    {
      id: "subscriber-identifier",
      label: "Subscriber identifier field",
      targetArea: "draft_audience_import",
      headerLabels: ["Subscriber or customer column", "Name column"],
      signalLabels: ["Audience context"],
      reviewPrompt: "Review the subscriber identifier shape without importing or exposing private contacts.",
    },
    {
      id: "tag-or-segment",
      label: "Tag or segment field",
      targetArea: "draft_audience_import",
      headerLabels: ["Tag or segment column"],
      signalLabels: ["Audience context"],
      reviewPrompt: "Confirm tag or segment meaning before any subscriber import is enabled.",
    },
    {
      id: "consent-or-status",
      label: "Consent or status field",
      targetArea: "draft_audience_import",
      headerLabels: ["Status or date column"],
      signalLabels: ["Follow-up notes"],
      reviewPrompt: "Check consent, suppression, or timing context before any send or import action.",
    },
  ],
  draft_sequence_outline: [
    {
      id: "sequence-name",
      label: "Sequence or campaign name",
      targetArea: "draft_sequence_outline",
      headerLabels: ["Tag or segment column"],
      signalLabels: ["Follow-up notes"],
      reviewPrompt: "Confirm which sequence or campaign outline should be recreated privately.",
    },
    {
      id: "message-timing",
      label: "Message timing or status",
      targetArea: "draft_sequence_outline",
      headerLabels: ["Status or date column"],
      signalLabels: ["Follow-up notes"],
      reviewPrompt: "Review timing signals while subscriber sends stay disabled.",
    },
  ],
  asset_reference: [
    {
      id: "asset-source",
      label: "Asset source",
      targetArea: "asset_reference",
      headerLabels: ["Page or URL column"],
      signalLabels: ["Source URL", "Parsed export structure"],
      reviewPrompt: "Confirm which source paths or exported structure point to assets Bumpgrade should collect later.",
    },
    {
      id: "product-asset-link",
      label: "Product asset link",
      targetArea: "asset_reference",
      headerLabels: ["Product or offer column"],
      signalLabels: ["Page or offer copy"],
      reviewPrompt: "Review which product or offer references need matching assets before fulfillment.",
    },
  ],
};

function matchingSafeLabels(available: string[], wanted: string[] | undefined) {
  if (!wanted?.length) return [];
  const availableSet = new Set(available);
  return wanted.filter((label) => availableSet.has(label));
}

function competitorImportRecordExtractedFields(
  kind: ImportDraftEntity,
  input: {
    matchedHeaderLabels: string[];
    matchedSignalLabels: string[];
    recordConfidence: CompetitorImportPrivateRecord["recordConfidence"];
  },
): CompetitorImportPrivateRecordExtractedField[] {
  return (competitorImportFieldDefinitions[kind] ?? []).map((field) => {
    const fromHeaderLabels = matchingSafeLabels(input.matchedHeaderLabels, field.headerLabels);
    const fromSignalLabels = matchingSafeLabels(input.matchedSignalLabels, field.signalLabels);
    const source =
      fromHeaderLabels.length > 0 ? "safe_header_group" : fromSignalLabels.length > 0 ? "safe_signal_label" : "source_guide";
    const status =
      input.recordConfidence === "recognized_export_match" && (fromHeaderLabels.length > 0 || fromSignalLabels.length > 0)
        ? "ready_for_review"
        : "needs_context";

    return {
      id: `${kind}:${field.id}`,
      label: field.label,
      targetArea: field.targetArea,
      source,
      status,
      reviewPrompt: field.reviewPrompt,
      fromHeaderLabels,
      fromSignalLabels,
      editedByOwner: false,
      editedAt: null,
      editSource: null,
      rawValueIncluded: false,
      rawRowsEchoed: false,
      rawTextEchoed: false,
      rawFileNamesEchoed: false,
      customerValuesIncluded: false,
      privateEmailsIncluded: false,
      goLiveEffectsEnabled: false,
    };
  });
}

function competitorImportExtractedFieldSource(value: unknown): CompetitorImportPrivateRecordExtractedField["source"] {
  if (value === "safe_header_group" || value === "safe_signal_label" || value === "source_guide") return value;
  return "source_guide";
}

function competitorImportExtractedFieldStatus(value: unknown): CompetitorImportPrivateRecordExtractedField["status"] {
  if (value === "ready_for_review" || value === "needs_context") return value;
  return "needs_context";
}

function competitorImportExtractedFieldEditSource(value: unknown): CompetitorImportPrivateRecordExtractedField["editSource"] {
  return value === "verified_publisher_extracted_field_edit" ? value : null;
}

function competitorImportExtractedFieldStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function competitorImportNormalizeExtractedField(
  kind: ImportDraftEntity,
  value: unknown,
  fallback?: CompetitorImportPrivateRecordExtractedField,
): CompetitorImportPrivateRecordExtractedField | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback ?? null;
  const input = value as Partial<CompetitorImportPrivateRecordExtractedField>;
  const id = typeof input.id === "string" && input.id.trim() ? compactImportText(input.id, 120) : fallback?.id;
  if (!id) return null;
  const label =
    typeof input.label === "string" && input.label.trim()
      ? compactImportText(input.label, 80)
      : (fallback?.label ?? competitorImportPrivateRecordLabel(kind));
  const reviewPrompt =
    typeof input.reviewPrompt === "string" && input.reviewPrompt.trim()
      ? compactImportText(input.reviewPrompt, 220)
      : (fallback?.reviewPrompt ?? "Review this prepared field before cleanup.");
  const targetArea = competitorImportPrivateRecordKindOrder.includes(input.targetArea as ImportDraftEntity)
    ? (input.targetArea as ImportDraftEntity)
    : (fallback?.targetArea ?? kind);

  return {
    id,
    label,
    targetArea,
    source: competitorImportExtractedFieldSource(input.source ?? fallback?.source),
    status: competitorImportExtractedFieldStatus(input.status ?? fallback?.status),
    reviewPrompt,
    fromHeaderLabels: competitorImportExtractedFieldStringArray(input.fromHeaderLabels).length
      ? competitorImportExtractedFieldStringArray(input.fromHeaderLabels)
      : (fallback?.fromHeaderLabels ?? []),
    fromSignalLabels: competitorImportExtractedFieldStringArray(input.fromSignalLabels).length
      ? competitorImportExtractedFieldStringArray(input.fromSignalLabels)
      : (fallback?.fromSignalLabels ?? []),
    editedByOwner: input.editedByOwner === true,
    editedAt: typeof input.editedAt === "string" ? input.editedAt : null,
    editSource: competitorImportExtractedFieldEditSource(input.editSource),
    rawValueIncluded: false,
    rawRowsEchoed: false,
    rawTextEchoed: false,
    rawFileNamesEchoed: false,
    customerValuesIncluded: false,
    privateEmailsIncluded: false,
    goLiveEffectsEnabled: false,
  };
}

function competitorImportExtractedFieldsFromMetadata(
  kind: ImportDraftEntity,
  metadata: Record<string, unknown>,
  fallback: {
    matchedHeaderLabels: string[];
    matchedSignalLabels: string[];
    recordConfidence: CompetitorImportPrivateRecord["recordConfidence"];
  },
) {
  const fallbackRecords = competitorImportRecordExtractedFields(kind, fallback);
  const fallbackById = new Map(fallbackRecords.map((field) => [field.id, field]));
  const records = Array.isArray(metadata.extractedFields)
    ? metadata.extractedFields
        .map((item) => {
          const id =
            item && typeof item === "object" && !Array.isArray(item) && typeof (item as { id?: unknown }).id === "string"
              ? (item as { id: string }).id
              : "";
          return competitorImportNormalizeExtractedField(kind, item, fallbackById.get(id));
        })
        .filter((item): item is CompetitorImportPrivateRecordExtractedField => Boolean(item))
    : [];

  return records.length ? records : fallbackRecords;
}

function competitorImportSubscriberDepthRedaction(): CompetitorImportPrivateRecordSubscriberImportDepth["redaction"] {
  return {
    rawContactRowsIncluded: false,
    rawEmailsIncluded: false,
    rawNamesIncluded: false,
    rawExportTextIncluded: false,
    rawFileNamesEchoed: false,
    subscriberRowsCreated: false,
    sequenceEnrollmentsCreated: false,
    emailDeliveryEnabled: false,
    exportEnabled: false,
    goLiveEffectsEnabled: false,
  };
}

function safeSubscriberDepthStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function safeSubscriberDepthNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

function competitorImportSubscriberDepth(
  kind: ImportDraftEntity,
  input: {
    matchedHeaderLabels: string[];
    matchedSignalLabels: string[];
    sourceChecklistItemIds: string[];
    recordConfidence: CompetitorImportPrivateRecord["recordConfidence"];
    exportFileAnalysis?: CompetitorImportReviewMetadata["exportFileAnalysis"] | null;
  },
): CompetitorImportPrivateRecordSubscriberImportDepth | null {
  if (kind !== "draft_audience_import") return null;

  const identitySignals = input.matchedHeaderLabels.filter((label) =>
    label === "Subscriber or customer column" || label === "Name column",
  );
  const segmentationSignals = input.matchedHeaderLabels.filter((label) => label === "Tag or segment column");
  const consentStatusSignals = input.matchedHeaderLabels.filter((label) => label === "Status or date column");
  const sequenceSignals = input.matchedSignalLabels.filter((label) => label === "Follow-up notes" || label === "Audience context");
  const aggregateContactRowCount =
    input.exportFileAnalysis?.files.reduce((total, file) => total + (file.rowCount ?? file.objectCount ?? 0), 0) ?? 0;
  const readySignals = identitySignals.length + segmentationSignals.length + consentStatusSignals.length + sequenceSignals.length;

  return {
    responseField: "subscriberImportDepth",
    status:
      input.recordConfidence === "recognized_export_match" && identitySignals.length > 0 && readySignals > 1
        ? "ready_for_private_review"
        : "needs_context",
    source: readySignals > 0 ? "safe_export_headers_and_signals" : "source_guide",
    aggregateContactRowCount,
    parsedExportFileCount: input.exportFileAnalysis?.parsedFileCount ?? 0,
    identitySignals,
    segmentationSignals,
    consentStatusSignals,
    sequenceSignals: Array.from(new Set(sequenceSignals)),
    sourceChecklistItemIds: input.sourceChecklistItemIds,
    reviewSteps: [
      "Confirm which safe identity columns should map to subscriber matching.",
      "Review tag, segment, consent, suppression, and timing context before any audience review-list promotion.",
      "Keep sequence entry and broadcast sends disabled until a later confirmed-write gate exists.",
    ],
    goLiveBlockers: [
      "Private subscriber records are created only after the owner confirms a fresh subscriber import upload or paste.",
      "No raw contact rows, private emails, names, or export file text are stored in public source-data.",
      "No sequence enrollments, broadcasts, exports, or provider sends run from this private review.",
    ],
    redaction: competitorImportSubscriberDepthRedaction(),
  };
}

function competitorImportNormalizeSubscriberDepth(
  kind: ImportDraftEntity,
  value: unknown,
  fallback: CompetitorImportPrivateRecordSubscriberImportDepth | null,
): CompetitorImportPrivateRecordSubscriberImportDepth | null {
  if (kind !== "draft_audience_import") return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const input = value as Partial<CompetitorImportPrivateRecordSubscriberImportDepth>;
  const status =
    input.status === "ready_for_private_review" || input.status === "needs_context"
      ? input.status
      : (fallback?.status ?? "needs_context");
  const source =
    input.source === "safe_export_headers_and_signals" || input.source === "source_guide"
      ? input.source
      : (fallback?.source ?? "source_guide");

  return {
    responseField: "subscriberImportDepth",
    status,
    source,
    aggregateContactRowCount:
      safeSubscriberDepthNumber(input.aggregateContactRowCount) || fallback?.aggregateContactRowCount || 0,
    parsedExportFileCount: safeSubscriberDepthNumber(input.parsedExportFileCount) || fallback?.parsedExportFileCount || 0,
    identitySignals: safeSubscriberDepthStringArray(input.identitySignals).length
      ? safeSubscriberDepthStringArray(input.identitySignals)
      : (fallback?.identitySignals ?? []),
    segmentationSignals: safeSubscriberDepthStringArray(input.segmentationSignals).length
      ? safeSubscriberDepthStringArray(input.segmentationSignals)
      : (fallback?.segmentationSignals ?? []),
    consentStatusSignals: safeSubscriberDepthStringArray(input.consentStatusSignals).length
      ? safeSubscriberDepthStringArray(input.consentStatusSignals)
      : (fallback?.consentStatusSignals ?? []),
    sequenceSignals: safeSubscriberDepthStringArray(input.sequenceSignals).length
      ? safeSubscriberDepthStringArray(input.sequenceSignals)
      : (fallback?.sequenceSignals ?? []),
    sourceChecklistItemIds: safeSubscriberDepthStringArray(input.sourceChecklistItemIds).length
      ? safeSubscriberDepthStringArray(input.sourceChecklistItemIds)
      : (fallback?.sourceChecklistItemIds ?? []),
    reviewSteps: safeSubscriberDepthStringArray(input.reviewSteps).length
      ? safeSubscriberDepthStringArray(input.reviewSteps)
      : (fallback?.reviewSteps ?? []),
    goLiveBlockers: safeSubscriberDepthStringArray(input.goLiveBlockers).length
      ? safeSubscriberDepthStringArray(input.goLiveBlockers)
      : (fallback?.goLiveBlockers ?? []),
    redaction: competitorImportSubscriberDepthRedaction(),
  };
}

function competitorImportSubscriberPreflightRedaction(): CompetitorImportPrivateRecordSubscriberPreflight["redaction"] {
  return {
    rawContactRowsIncluded: false,
    rawEmailsIncluded: false,
    rawNamesIncluded: false,
    rawExportTextIncluded: false,
    rawFileNamesEchoed: false,
    confirmationTextStored: false,
    idempotencyKeysIncluded: false,
    actorEmailIncluded: false,
    subscriberRowsCreated: false,
    sequenceEnrollmentsCreated: false,
    emailDeliveryEnabled: false,
    exportEnabled: false,
    goLiveEffectsEnabled: false,
  };
}

function competitorImportSubscriberPreflightSummary(
  status: CompetitorImportPrivateRecordSubscriberPreflightStatus,
  depth: CompetitorImportPrivateRecordSubscriberImportDepth | null,
) {
  if (status === "ready_for_import_planning") {
    return "Owner confirmed this private audience record is ready for subscriber import planning.";
  }

  if (status === "needs_cleanup") {
    return "Owner marked this private audience record as needing subscriber cleanup before import planning.";
  }

  if (depth?.status === "ready_for_private_review") {
    return "Safe subscriber import depth is ready for owner preflight.";
  }

  return "Subscriber import preflight has not been recorded yet.";
}

function competitorImportSubscriberPreflightNextStep(status: CompetitorImportPrivateRecordSubscriberPreflightStatus) {
  if (status === "ready_for_import_planning") {
    return "Use the private audience record as input for a later confirmed subscriber import plan.";
  }

  if (status === "needs_cleanup") {
    return "Clean up field labels, consent context, segments, and sequence notes before any subscriber import plan.";
  }

  return "Review the safe subscriber import depth, then record a private preflight decision.";
}

function competitorImportSubscriberPreflightFromMetadata(
  kind: ImportDraftEntity,
  metadata: Record<string, unknown>,
  depth: CompetitorImportPrivateRecordSubscriberImportDepth | null,
): CompetitorImportPrivateRecordSubscriberPreflight | null {
  if (kind !== "draft_audience_import") return null;

  const input =
    metadata.subscriberImportPreflight &&
    typeof metadata.subscriberImportPreflight === "object" &&
    !Array.isArray(metadata.subscriberImportPreflight)
      ? (metadata.subscriberImportPreflight as Partial<CompetitorImportPrivateRecordSubscriberPreflight>)
      : {};
  const status =
    input.status === "ready_for_import_planning" || input.status === "needs_cleanup" ? input.status : "not_recorded";
  const source = input.source === "verified_publisher_subscriber_preflight" ? input.source : null;
  const recordedAt = typeof input.recordedAt === "string" ? input.recordedAt : null;

  return {
    responseField: "subscriberImportPreflight",
    status,
    source,
    recordedAt,
    depthStatus: depth?.status ?? null,
    aggregateContactRowCount: depth?.aggregateContactRowCount ?? 0,
    parsedExportFileCount: depth?.parsedExportFileCount ?? 0,
    summary:
      typeof input.summary === "string" && input.summary.length > 0
        ? input.summary
        : competitorImportSubscriberPreflightSummary(status, depth),
    nextStep:
      typeof input.nextStep === "string" && input.nextStep.length > 0
        ? input.nextStep
        : competitorImportSubscriberPreflightNextStep(status),
    acknowledgedBlockers: depth?.goLiveBlockers ?? [],
    createsSubscriberRows: false,
    createsSequenceEnrollments: false,
    emailDeliveryEnabled: false,
    exportEnabled: false,
    goLiveEffectsEnabled: false,
    redaction: competitorImportSubscriberPreflightRedaction(),
  };
}

function competitorImportSubscriberCreationRedaction(): CompetitorImportPrivateRecordSubscriberImportCreation["redaction"] {
  return {
    rawContactRowsIncluded: false,
    rawEmailsIncluded: false,
    rawNamesIncluded: false,
    rawExportTextIncluded: false,
    rawFileNamesEchoed: false,
    confirmationTextStored: false,
    idempotencyKeysIncluded: false,
    actorEmailIncluded: false,
    privateSubscriberEmailsIncludedInResponse: false,
    sequenceEnrollmentsCreated: false,
    emailDeliveryEnabled: false,
    exportEnabled: false,
    goLiveEffectsEnabled: false,
  };
}

function competitorImportSubscriberCreationSummary(
  creation: Pick<
    CompetitorImportPrivateRecordSubscriberImportCreation,
    "status" | "privateSubscriberRecordCount" | "suppressedContactCount" | "malformedContactCount"
  >,
) {
  if (creation.status === "subscriber_records_created") {
    const contactLabel = creation.privateSubscriberRecordCount === 1 ? "private subscriber record" : "private subscriber records";
    return `Saved ${creation.privateSubscriberRecordCount} ${contactLabel} from the confirmed importer upload.`;
  }

  if (creation.suppressedContactCount || creation.malformedContactCount) {
    return "No private subscriber records have been saved from this importer upload yet.";
  }

  return "Subscriber import creation has not been recorded yet.";
}

function competitorImportSubscriberCreationNextStep(status: CompetitorImportPrivateRecordSubscriberImportCreationStatus) {
  if (status === "subscriber_records_created") {
    return "Review the private subscriber records before any sequence enrollment, send, export, or go-live workflow is enabled.";
  }

  return "Upload or paste the subscriber export on the private review page after the subscriber preflight is ready.";
}

function competitorImportSubscriberCreationFromMetadata(
  kind: ImportDraftEntity,
  metadata: Record<string, unknown>,
): CompetitorImportPrivateRecordSubscriberImportCreation | null {
  if (kind !== "draft_audience_import") return null;

  const input =
    metadata.subscriberImportCreation &&
    typeof metadata.subscriberImportCreation === "object" &&
    !Array.isArray(metadata.subscriberImportCreation)
      ? (metadata.subscriberImportCreation as Partial<CompetitorImportPrivateRecordSubscriberImportCreation>)
      : {};
  const status = input.status === "subscriber_records_created" ? input.status : "not_created";
  const source = input.source === "verified_publisher_subscriber_import_creation" ? input.source : null;
  const creation: CompetitorImportPrivateRecordSubscriberImportCreation = {
    responseField: "subscriberImportCreation",
    status,
    source,
    recordedAt: typeof input.recordedAt === "string" ? input.recordedAt : null,
    sourceFormId: typeof input.sourceFormId === "string" ? input.sourceFormId : null,
    sourceSegmentId: typeof input.sourceSegmentId === "string" ? input.sourceSegmentId : null,
    normalizedEmailCount: safeSubscriberDepthNumber(input.normalizedEmailCount),
    privateSubscriberRecordCount: safeSubscriberDepthNumber(input.privateSubscriberRecordCount),
    createdPrivateSubscriberRecordCount: safeSubscriberDepthNumber(input.createdPrivateSubscriberRecordCount),
    updatedPrivateSubscriberRecordCount: safeSubscriberDepthNumber(input.updatedPrivateSubscriberRecordCount),
    suppressedContactCount: safeSubscriberDepthNumber(input.suppressedContactCount),
    malformedContactCount: safeSubscriberDepthNumber(input.malformedContactCount),
    summary: "",
    nextStep: "",
    createsSubscriberRows: input.createsSubscriberRows === true,
    createsSequenceEnrollments: false,
    emailDeliveryEnabled: false,
    exportEnabled: false,
    goLiveEffectsEnabled: false,
    redaction: competitorImportSubscriberCreationRedaction(),
  };

  return {
    ...creation,
    summary:
      typeof input.summary === "string" && input.summary.length > 0
        ? input.summary
        : competitorImportSubscriberCreationSummary(creation),
    nextStep:
      typeof input.nextStep === "string" && input.nextStep.length > 0
        ? input.nextStep
      : competitorImportSubscriberCreationNextStep(status),
  };
}

function competitorImportSubscriberAudiencePromotionRedaction(): CompetitorImportPrivateRecordSubscriberAudiencePromotion["redaction"] {
  return {
    rawContactRowsIncluded: false,
    rawEmailsIncluded: false,
    rawNamesIncluded: false,
    confirmationTextStored: false,
    idempotencyKeysIncluded: false,
    actorEmailIncluded: false,
    privateSubscriberEmailsIncludedInResponse: false,
    subscriberIdsIncludedInResponse: false,
    consentEventsCreated: false,
    sequenceEnrollmentsCreated: false,
    emailDeliveryEnabled: false,
    exportEnabled: false,
    goLiveEffectsEnabled: false,
  };
}

function competitorImportSubscriberAudiencePromotionSummary(
  promotion: Pick<
    CompetitorImportPrivateRecordSubscriberAudiencePromotion,
    "status" | "promotedPrivateSubscriberRecordCount" | "suppressedContactCount"
  >,
) {
  if (promotion.status === "global_audience_rows_created") {
    const contactLabel = promotion.promotedPrivateSubscriberRecordCount === 1 ? "contact" : "contacts";
    return `Added ${promotion.promotedPrivateSubscriberRecordCount} imported ${contactLabel} to the audience review list.`;
  }

  if (promotion.suppressedContactCount) {
    return "No saved importer contacts have been added to the audience review list yet.";
  }

  return "Audience list promotion has not been recorded yet.";
}

function competitorImportSubscriberAudiencePromotionNextStep(
  status: CompetitorImportPrivateRecordSubscriberAudiencePromotionStatus,
) {
  if (status === "global_audience_rows_created") {
    return "Review imported-pending contacts in audience tools before any consent, sequence, send, export, or go-live workflow is enabled.";
  }

  return "Inspect the saved private importer contacts, then add them to the audience review list when they are ready.";
}

function competitorImportSubscriberAudiencePromotionFromMetadata(
  kind: ImportDraftEntity,
  metadata: Record<string, unknown>,
): CompetitorImportPrivateRecordSubscriberAudiencePromotion | null {
  if (kind !== "draft_audience_import") return null;

  const input =
    metadata.subscriberAudiencePromotion &&
    typeof metadata.subscriberAudiencePromotion === "object" &&
    !Array.isArray(metadata.subscriberAudiencePromotion)
      ? (metadata.subscriberAudiencePromotion as Partial<CompetitorImportPrivateRecordSubscriberAudiencePromotion>)
      : {};
  const status = input.status === "global_audience_rows_created" ? input.status : "not_promoted";
  const source = input.source === "verified_publisher_subscriber_audience_promotion" ? input.source : null;
  const promotion: CompetitorImportPrivateRecordSubscriberAudiencePromotion = {
    responseField: "subscriberAudiencePromotion",
    status,
    source,
    recordedAt: typeof input.recordedAt === "string" ? input.recordedAt : null,
    sourceFormId: typeof input.sourceFormId === "string" ? input.sourceFormId : null,
    sourceSegmentId: typeof input.sourceSegmentId === "string" ? input.sourceSegmentId : null,
    globalAudienceSubscriberStatus: "imported_pending_review",
    privateSubscriberRecordCount: safeSubscriberDepthNumber(input.privateSubscriberRecordCount),
    promotedPrivateSubscriberRecordCount: safeSubscriberDepthNumber(input.promotedPrivateSubscriberRecordCount),
    createdGlobalAudienceSubscriberCount: safeSubscriberDepthNumber(input.createdGlobalAudienceSubscriberCount),
    updatedGlobalAudienceSubscriberCount: safeSubscriberDepthNumber(input.updatedGlobalAudienceSubscriberCount),
    tagAssignmentCount: safeSubscriberDepthNumber(input.tagAssignmentCount),
    suppressedContactCount: safeSubscriberDepthNumber(input.suppressedContactCount),
    summary: "",
    nextStep: "",
    createsGlobalAudienceSubscriberRows: input.createsGlobalAudienceSubscriberRows === true,
    createsConsentEvents: false,
    createsSequenceEnrollments: false,
    emailDeliveryEnabled: false,
    exportEnabled: false,
    goLiveEffectsEnabled: false,
    requiresConsentReviewBeforeSending: true,
    redaction: competitorImportSubscriberAudiencePromotionRedaction(),
  };

  return {
    ...promotion,
    summary:
      typeof input.summary === "string" && input.summary.length > 0
        ? input.summary
        : competitorImportSubscriberAudiencePromotionSummary(promotion),
    nextStep:
      typeof input.nextStep === "string" && input.nextStep.length > 0
        ? input.nextStep
        : competitorImportSubscriberAudiencePromotionNextStep(status),
  };
}

function competitorImportSubscriberPrivateExportRedaction(): CompetitorImportPrivateRecordSubscriberPrivateExport["redaction"] {
  return {
    ownerOnly: true,
    publicSourceDataIncluded: false,
    unauthenticatedResponsesIncluded: false,
    rawContactRowsIncludedInPublicResponse: false,
    privateSubscriberEmailsIncludedInJsonResponse: false,
    confirmationTextStored: false,
    idempotencyKeysIncluded: false,
    actorEmailIncluded: false,
    consentEventsCreated: false,
    sequenceEnrollmentsCreated: false,
    emailDeliveryEnabled: false,
    publicExportEnabled: false,
    goLiveEffectsEnabled: false,
  };
}

function competitorImportSubscriberPrivateExportSummary(
  subscriberExport: Pick<
    CompetitorImportPrivateRecordSubscriberPrivateExport,
    "status" | "exportedPrivateSubscriberRecordCount"
  >,
) {
  if (subscriberExport.status === "private_export_prepared") {
    const contactLabel = subscriberExport.exportedPrivateSubscriberRecordCount === 1 ? "contact" : "contacts";
    return `Prepared a private owner-only subscriber export with ${subscriberExport.exportedPrivateSubscriberRecordCount} ${contactLabel}.`;
  }

  return "Private subscriber export has not been prepared yet.";
}

function competitorImportSubscriberPrivateExportNextStep(
  status: CompetitorImportPrivateRecordSubscriberPrivateExportStatus,
) {
  if (status === "private_export_prepared") {
    return "Use the private export for owner review or migration cleanup; consent events, sequence enrollments, sends, and go-live effects remain disabled.";
  }

  return "Save private importer subscriber records, then prepare an owner-only export when needed.";
}

function competitorImportSubscriberPrivateExportFromMetadata(
  kind: ImportDraftEntity,
  metadata: Record<string, unknown>,
): CompetitorImportPrivateRecordSubscriberPrivateExport | null {
  if (kind !== "draft_audience_import") return null;

  const input =
    metadata.subscriberPrivateExport &&
    typeof metadata.subscriberPrivateExport === "object" &&
    !Array.isArray(metadata.subscriberPrivateExport)
      ? (metadata.subscriberPrivateExport as Partial<CompetitorImportPrivateRecordSubscriberPrivateExport>)
      : {};
  const status = input.status === "private_export_prepared" ? input.status : "not_exported";
  const source = input.source === "verified_publisher_private_subscriber_export" ? input.source : null;
  const subscriberExport: CompetitorImportPrivateRecordSubscriberPrivateExport = {
    responseField: "subscriberPrivateExport",
    status,
    source,
    recordedAt: typeof input.recordedAt === "string" ? input.recordedAt : null,
    exportFileName: typeof input.exportFileName === "string" ? input.exportFileName : null,
    privateSubscriberRecordCount: safeSubscriberDepthNumber(input.privateSubscriberRecordCount),
    exportedPrivateSubscriberRecordCount: safeSubscriberDepthNumber(input.exportedPrivateSubscriberRecordCount),
    csvColumnHeaders: safeSubscriberDepthStringArray(input.csvColumnHeaders).length
      ? safeSubscriberDepthStringArray(input.csvColumnHeaders)
      : ["email", "first_name", "source_status", "source_tags", "status"],
    summary: "",
    nextStep: "",
    createsSubscriberRows: false,
    createsConsentEvents: false,
    createsSequenceEnrollments: false,
    emailDeliveryEnabled: false,
    privateExportEnabled: status === "private_export_prepared",
    publicExportEnabled: false,
    goLiveEffectsEnabled: false,
    redaction: competitorImportSubscriberPrivateExportRedaction(),
  };

  return {
    ...subscriberExport,
    summary:
      typeof input.summary === "string" && input.summary.length > 0
        ? input.summary
        : competitorImportSubscriberPrivateExportSummary(subscriberExport),
    nextStep:
      typeof input.nextStep === "string" && input.nextStep.length > 0
        ? input.nextStep
        : competitorImportSubscriberPrivateExportNextStep(status),
  };
}

const checkoutMigrationReadinessKinds: ImportDraftEntity[] = ["draft_checkout_offer", "draft_product_catalog"];

function competitorImportCheckoutMigrationReadinessRedaction(): CompetitorImportPrivateRecordCheckoutMigrationReadiness["redaction"] {
  return {
    paymentCredentialsIncluded: false,
    checkoutSessionIdsIncluded: false,
    customerRowsIncluded: false,
    confirmationTextStored: false,
    idempotencyKeysIncluded: false,
    actorEmailIncluded: false,
    checkoutIntentsCreated: false,
    stripeCheckoutSessionsCreated: false,
    publicCheckoutRoutesEnabled: false,
    liveCheckoutEnabled: false,
    goLiveEffectsEnabled: false,
  };
}

function competitorImportCheckoutMigrationReadinessSummary(
  status: CompetitorImportPrivateRecordCheckoutMigrationReadinessStatus,
) {
  if (status === "ready_for_checkout_rebuild") {
    return "Owner confirmed this private checkout or product record is ready to rebuild as a Bumpgrade checkout plan.";
  }

  if (status === "needs_payment_copy_cleanup") {
    return "Owner marked this private checkout or product record as needing payment-copy cleanup before rebuilding checkout.";
  }

  if (status === "parked_for_later") {
    return "Owner parked this checkout rebuild so the import can keep moving without live payment work.";
  }

  return "Checkout migration readiness has not been recorded yet.";
}

function competitorImportCheckoutMigrationReadinessNextStep(
  status: CompetitorImportPrivateRecordCheckoutMigrationReadinessStatus,
) {
  if (status === "ready_for_checkout_rebuild") {
    return "Use this private review as input for a later Bumpgrade checkout setup; live payment credentials and Stripe sessions remain disabled.";
  }

  if (status === "needs_payment_copy_cleanup") {
    return "Clean up offer copy, price language, bump or upsell notes, and delivery promises before checkout setup.";
  }

  if (status === "parked_for_later") {
    return "Leave this checkout work parked until payment setup, copy, or offer decisions are ready.";
  }

  return "Review the imported offer fields, then record whether checkout is ready to rebuild, needs cleanup, or should stay parked.";
}

function competitorImportCheckoutMigrationReadinessFromMetadata(
  kind: ImportDraftEntity,
  metadata: Record<string, unknown>,
): CompetitorImportPrivateRecordCheckoutMigrationReadiness | null {
  if (!checkoutMigrationReadinessKinds.includes(kind)) return null;

  const input =
    metadata.checkoutMigrationReadiness &&
    typeof metadata.checkoutMigrationReadiness === "object" &&
    !Array.isArray(metadata.checkoutMigrationReadiness)
      ? (metadata.checkoutMigrationReadiness as Partial<CompetitorImportPrivateRecordCheckoutMigrationReadiness>)
      : {};
  const status =
    input.status === "ready_for_checkout_rebuild" ||
    input.status === "needs_payment_copy_cleanup" ||
    input.status === "parked_for_later"
      ? input.status
      : "not_recorded";
  const source = input.source === "verified_publisher_checkout_migration_readiness" ? input.source : null;
  const acknowledgedBlockers = [
    "No live payment credentials are imported.",
    "No Stripe checkout sessions or checkout intents are created.",
    "No public checkout route, account transfer, domain, fulfillment, or go-live effect is enabled.",
  ];

  return {
    responseField: "checkoutMigrationReadiness",
    status,
    source,
    recordedAt: typeof input.recordedAt === "string" ? input.recordedAt : null,
    summary:
      typeof input.summary === "string" && input.summary.length > 0
        ? input.summary
        : competitorImportCheckoutMigrationReadinessSummary(status),
    nextStep:
      typeof input.nextStep === "string" && input.nextStep.length > 0
        ? input.nextStep
        : competitorImportCheckoutMigrationReadinessNextStep(status),
    acknowledgedBlockers,
    createsCheckoutIntents: false,
    createsStripeCheckoutSessions: false,
    importsPaymentCredentials: false,
    publicCheckoutRoutesEnabled: false,
    liveCheckoutEnabled: false,
    publicPublishingEnabled: false,
    goLiveEffectsEnabled: false,
    redaction: competitorImportCheckoutMigrationReadinessRedaction(),
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
  const matchedHeaderLabels = stringArray(metadata.matchedHeaderLabels);
  const matchedSignalLabels = stringArray(metadata.matchedSignalLabels);
  const sourceChecklistItemIds = stringArray(metadata.sourceChecklistItemIds);
  const recordConfidence =
    metadata.recordConfidence === "recognized_export_match" ||
    metadata.recordConfidence === "needs_more_context" ||
    metadata.recordConfidence === "source_guide"
      ? metadata.recordConfidence
      : "source_guide";
  const fallbackSubscriberImportDepth = competitorImportSubscriberDepth(row.record_kind, {
    matchedHeaderLabels,
    matchedSignalLabels,
    sourceChecklistItemIds,
    recordConfidence,
  });
  const subscriberImportDepth = competitorImportNormalizeSubscriberDepth(
    row.record_kind,
    metadata.subscriberImportDepth,
    fallbackSubscriberImportDepth,
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
    sourceChecklistItemIds,
    recognizedPlatformExportMatchIds: stringArray(metadata.recognizedPlatformExportMatchIds),
    matchedHeaderLabels,
    matchedSignalLabels,
    sourceUrlCount: typeof metadata.sourceUrlCount === "number" ? metadata.sourceUrlCount : 0,
    sourceFileNameCount: typeof metadata.sourceFileNameCount === "number" ? metadata.sourceFileNameCount : 0,
    exportFileCount: typeof metadata.exportFileCount === "number" ? metadata.exportFileCount : 0,
    parsedExportFileCount: typeof metadata.parsedExportFileCount === "number" ? metadata.parsedExportFileCount : 0,
    recordConfidence,
    extractedFields: competitorImportExtractedFieldsFromMetadata(row.record_kind, metadata, {
      matchedHeaderLabels,
      matchedSignalLabels,
      recordConfidence,
    }),
    subscriberImportDepth,
    subscriberImportPreflight: competitorImportSubscriberPreflightFromMetadata(row.record_kind, metadata, subscriberImportDepth),
    subscriberImportCreation: competitorImportSubscriberCreationFromMetadata(row.record_kind, metadata),
    subscriberAudiencePromotion: competitorImportSubscriberAudiencePromotionFromMetadata(row.record_kind, metadata),
    subscriberPrivateExport: competitorImportSubscriberPrivateExportFromMetadata(row.record_kind, metadata),
    checkoutMigrationReadiness: competitorImportCheckoutMigrationReadinessFromMetadata(row.record_kind, metadata),
    reviewDecision: competitorImportRecordReviewDecision(metadata.reviewDecision),
    reviewDecisionAt: typeof metadata.reviewDecisionAt === "string" ? metadata.reviewDecisionAt : null,
    reviewDecisionSource:
      metadata.reviewDecisionSource === "verified_publisher_record_review" ? metadata.reviewDecisionSource : null,
    reviewAudit: {
      confirmationTextStored: false,
      idempotencyKeysIncluded: false,
      actorEmailIncluded: false,
      rawNotesIncluded: false,
      goLiveEffectsEnabled: false,
    },
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
        extractedFields: competitorImportRecordExtractedFields(kind, {
          matchedHeaderLabels,
          matchedSignalLabels,
          recordConfidence,
        }),
        subscriberImportDepth: competitorImportSubscriberDepth(kind, {
          matchedHeaderLabels,
          matchedSignalLabels,
          sourceChecklistItemIds,
          recordConfidence,
          exportFileAnalysis,
        }),
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

export async function reviewCompetitorImportPrivateRecord(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
    recordId: string;
    decision: Exclude<CompetitorImportPrivateRecordReviewDecision, "pending_review">;
    idempotencyKey: string;
  },
): Promise<CompetitorImportPrivateRecordReviewResult> {
  const review = await loadCompetitorImportedDraftReview(db, owner, {
    importerSlug: input.importerSlug,
    platformName: input.platformName,
    draftId: input.draftId,
  });
  const row = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(input.recordId.trim(), review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!row) {
    throw new Error("Private import record not found.");
  }

  if (row.owner_user_id !== owner.userId || row.importer_platform_id !== review.importerPlatformId || row.importer_slug !== review.importerSlug) {
    throw new Error("Only the publisher who created this private import plan can review this record.");
  }

  if (row.status !== "private_draft") {
    throw new Error("Archived private import records cannot be reviewed.");
  }

  const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
  const previousDecision = competitorImportRecordReviewDecision(metadata.reviewDecision);
  const previousIdempotencyKey = typeof metadata.reviewDecisionIdempotencyKey === "string" ? metadata.reviewDecisionIdempotencyKey : "";

  if (previousIdempotencyKey && previousIdempotencyKey === input.idempotencyKey && previousDecision !== input.decision) {
    throw new Error("This idempotency key already reviewed the import record with a different decision.");
  }

  const idempotent = previousIdempotencyKey === input.idempotencyKey && previousDecision === input.decision;

  if (!idempotent) {
    await db
      .prepare(
        `UPDATE competitor_import_private_records
         SET metadata_json = ?, updated_at = unixepoch()
         WHERE id = ? AND draft_funnel_id = ?`,
      )
      .bind(
        JSON.stringify({
          ...metadata,
          reviewDecision: input.decision,
          reviewDecisionAt: new Date().toISOString(),
          reviewDecisionSource: "verified_publisher_record_review",
          reviewDecisionIdempotencyKey: input.idempotencyKey,
          reviewDecisionConfirmationMatched: true,
          reviewDecisionGoLiveEffectsEnabled: false,
        }),
        row.id,
        review.draft.id,
      )
      .run();
  }

  const updated = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(row.id, review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!updated) {
    throw new Error("The private import record review could not be loaded after update.");
  }

  return {
    draft: review.draft,
    record: competitorImportPrivateRecordFromRow(updated),
    previousDecision,
    idempotent,
    goLiveEffects: competitorImportRecordGoLiveEffects(),
    redaction: competitorImportRecordRedaction(),
  };
}

function extractedFieldTextLooksPrivate(value: string) {
  return /https?:\/\/|www\.|@|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(value);
}

function extractedFieldEditSignature(input: {
  fieldId: string;
  label: string;
  status: CompetitorImportPrivateRecordExtractedField["status"];
  reviewPrompt: string;
}) {
  return JSON.stringify(input);
}

export async function updateCompetitorImportPrivateRecordExtractedField(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
    recordId: string;
    fieldId: string;
    label: string;
    status: CompetitorImportPrivateRecordExtractedField["status"];
    reviewPrompt: string;
    idempotencyKey: string;
  },
): Promise<CompetitorImportPrivateRecordExtractedFieldEditResult> {
  const label = compactImportText(input.label, 80);
  const reviewPrompt = compactImportText(input.reviewPrompt, 220);

  if (label.length < 2) {
    throw new Error("Name the Bumpgrade field before saving.");
  }

  if (reviewPrompt.length < 12) {
    throw new Error("Add a short review prompt before saving this field.");
  }

  if (extractedFieldTextLooksPrivate(label) || extractedFieldTextLooksPrivate(reviewPrompt)) {
    throw new Error("Save field names and review prompts only, not source URLs, email addresses, or copied private values.");
  }

  const review = await loadCompetitorImportedDraftReview(db, owner, {
    importerSlug: input.importerSlug,
    platformName: input.platformName,
    draftId: input.draftId,
  });
  const row = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(input.recordId.trim(), review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!row) {
    throw new Error("Private import record not found.");
  }

  if (row.owner_user_id !== owner.userId || row.importer_platform_id !== review.importerPlatformId || row.importer_slug !== review.importerSlug) {
    throw new Error("Only the publisher who created this private import plan can edit this field plan.");
  }

  if (row.status !== "private_draft") {
    throw new Error("Archived private import records cannot be edited.");
  }

  const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
  const matchedHeaderLabels = competitorImportExtractedFieldStringArray(metadata.matchedHeaderLabels);
  const matchedSignalLabels = competitorImportExtractedFieldStringArray(metadata.matchedSignalLabels);
  const recordConfidence =
    metadata.recordConfidence === "recognized_export_match" ||
    metadata.recordConfidence === "needs_more_context" ||
    metadata.recordConfidence === "source_guide"
      ? metadata.recordConfidence
      : "source_guide";
  const fields = competitorImportExtractedFieldsFromMetadata(row.record_kind, metadata, {
    matchedHeaderLabels,
    matchedSignalLabels,
    recordConfidence,
  });
  const fieldIndex = fields.findIndex((field) => field.id === input.fieldId);

  if (fieldIndex < 0) {
    throw new Error("Choose a prepared field from this private import record.");
  }

  const signature = extractedFieldEditSignature({
    fieldId: input.fieldId,
    label,
    status: input.status,
    reviewPrompt,
  });
  const previousIdempotencyKey =
    typeof metadata.extractedFieldEditIdempotencyKey === "string" ? metadata.extractedFieldEditIdempotencyKey : "";
  const previousSignature =
    typeof metadata.extractedFieldEditSignature === "string" ? metadata.extractedFieldEditSignature : "";

  if (previousIdempotencyKey && previousIdempotencyKey === input.idempotencyKey && previousSignature !== signature) {
    throw new Error("This idempotency key already saved different field edits.");
  }

  const previousField = fields[fieldIndex];
  const idempotent = previousIdempotencyKey === input.idempotencyKey && previousSignature === signature;

  if (!idempotent) {
    const editedAt = new Date().toISOString();
    const nextFields = fields.map((field, index) =>
      index === fieldIndex
        ? {
            ...field,
            label,
            status: input.status,
            reviewPrompt,
            editedByOwner: true,
            editedAt,
            editSource: "verified_publisher_extracted_field_edit" as const,
            rawValueIncluded: false,
            rawRowsEchoed: false,
            rawTextEchoed: false,
            rawFileNamesEchoed: false,
            customerValuesIncluded: false,
            privateEmailsIncluded: false,
            goLiveEffectsEnabled: false,
          }
        : field,
    );

    await db
      .prepare(
        `UPDATE competitor_import_private_records
         SET metadata_json = ?, updated_at = unixepoch()
         WHERE id = ? AND draft_funnel_id = ?`,
      )
      .bind(
        JSON.stringify({
          ...metadata,
          extractedFields: nextFields,
          extractedFieldEditAt: editedAt,
          extractedFieldEditSource: "verified_publisher_extracted_field_edit",
          extractedFieldEditIdempotencyKey: input.idempotencyKey,
          extractedFieldEditSignature: signature,
          extractedFieldEditConfirmationMatched: true,
          extractedFieldEditRawValuesStored: false,
          extractedFieldEditGoLiveEffectsEnabled: false,
        }),
        row.id,
        review.draft.id,
      )
      .run();
  }

  const updated = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(row.id, review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!updated) {
    throw new Error("The private import record field edit could not be loaded after update.");
  }

  const record = competitorImportPrivateRecordFromRow(updated);
  const field = record.extractedFields.find((item) => item.id === input.fieldId);
  if (!field) {
    throw new Error("The edited private import field could not be loaded after update.");
  }

  return {
    draft: review.draft,
    record,
    field,
    previousField,
    idempotent,
    goLiveEffects: competitorImportRecordGoLiveEffects(),
    redaction: competitorImportRecordRedaction(),
  };
}

function subscriberPreflightSignature(input: {
  decision: Exclude<CompetitorImportPrivateRecordSubscriberPreflightStatus, "not_recorded">;
  depthStatus: CompetitorImportPrivateRecordSubscriberImportDepth["status"];
  aggregateContactRowCount: number;
  parsedExportFileCount: number;
}) {
  return JSON.stringify(input);
}

export async function recordCompetitorImportPrivateRecordSubscriberPreflight(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
    recordId: string;
    decision: Exclude<CompetitorImportPrivateRecordSubscriberPreflightStatus, "not_recorded">;
    idempotencyKey: string;
  },
): Promise<CompetitorImportPrivateRecordSubscriberPreflightResult> {
  const review = await loadCompetitorImportedDraftReview(db, owner, {
    importerSlug: input.importerSlug,
    platformName: input.platformName,
    draftId: input.draftId,
  });
  const row = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(input.recordId.trim(), review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!row) {
    throw new Error("Private import record not found.");
  }

  if (row.owner_user_id !== owner.userId || row.importer_platform_id !== review.importerPlatformId || row.importer_slug !== review.importerSlug) {
    throw new Error("Only the publisher who created this private import plan can record this subscriber preflight.");
  }

  if (row.status !== "private_draft") {
    throw new Error("Archived private import records cannot record subscriber preflight.");
  }

  if (row.record_kind !== "draft_audience_import") {
    throw new Error("Subscriber import preflight is available only on private audience import records.");
  }

  const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
  const record = competitorImportPrivateRecordFromRow(row);
  const depth = record.subscriberImportDepth;

  if (!depth) {
    throw new Error("Review subscriber import depth before recording subscriber preflight.");
  }

  const previousPreflight = record.subscriberImportPreflight;
  const signature = subscriberPreflightSignature({
    decision: input.decision,
    depthStatus: depth.status,
    aggregateContactRowCount: depth.aggregateContactRowCount,
    parsedExportFileCount: depth.parsedExportFileCount,
  });
  const previousIdempotencyKey =
    typeof metadata.subscriberImportPreflightIdempotencyKey === "string"
      ? metadata.subscriberImportPreflightIdempotencyKey
      : "";
  const previousSignature =
    typeof metadata.subscriberImportPreflightSignature === "string" ? metadata.subscriberImportPreflightSignature : "";

  if (previousIdempotencyKey && previousIdempotencyKey === input.idempotencyKey && previousSignature !== signature) {
    throw new Error("This idempotency key already recorded a different subscriber preflight decision.");
  }

  const idempotent = previousIdempotencyKey === input.idempotencyKey && previousSignature === signature;

  if (!idempotent) {
    const recordedAt = new Date().toISOString();
    const subscriberImportPreflight: CompetitorImportPrivateRecordSubscriberPreflight = {
      responseField: "subscriberImportPreflight",
      status: input.decision,
      source: "verified_publisher_subscriber_preflight",
      recordedAt,
      depthStatus: depth.status,
      aggregateContactRowCount: depth.aggregateContactRowCount,
      parsedExportFileCount: depth.parsedExportFileCount,
      summary: competitorImportSubscriberPreflightSummary(input.decision, depth),
      nextStep: competitorImportSubscriberPreflightNextStep(input.decision),
      acknowledgedBlockers: depth.goLiveBlockers,
      createsSubscriberRows: false,
      createsSequenceEnrollments: false,
      emailDeliveryEnabled: false,
      exportEnabled: false,
      goLiveEffectsEnabled: false,
      redaction: competitorImportSubscriberPreflightRedaction(),
    };

    await db
      .prepare(
        `UPDATE competitor_import_private_records
         SET metadata_json = ?, updated_at = unixepoch()
         WHERE id = ? AND draft_funnel_id = ?`,
      )
      .bind(
        JSON.stringify({
          ...metadata,
          subscriberImportPreflight,
          subscriberImportPreflightAt: recordedAt,
          subscriberImportPreflightSource: "verified_publisher_subscriber_preflight",
          subscriberImportPreflightIdempotencyKey: input.idempotencyKey,
          subscriberImportPreflightSignature: signature,
          subscriberImportPreflightConfirmationMatched: true,
          subscriberImportPreflightRawRowsStored: false,
          subscriberImportPreflightCreatesSubscriberRows: false,
          subscriberImportPreflightCreatesSequenceEnrollments: false,
          subscriberImportPreflightEmailDeliveryEnabled: false,
          subscriberImportPreflightExportEnabled: false,
          subscriberImportPreflightGoLiveEffectsEnabled: false,
        }),
        row.id,
        review.draft.id,
      )
      .run();
  }

  const updated = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(row.id, review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!updated) {
    throw new Error("The private import record subscriber preflight could not be loaded after update.");
  }

  const updatedRecord = competitorImportPrivateRecordFromRow(updated);
  if (!updatedRecord.subscriberImportPreflight) {
    throw new Error("The private import record subscriber preflight could not be loaded after update.");
  }

  return {
    draft: review.draft,
    record: updatedRecord,
    preflight: updatedRecord.subscriberImportPreflight,
    previousPreflight,
    idempotent,
    goLiveEffects: competitorImportRecordGoLiveEffects(),
    redaction: competitorImportRecordRedaction(),
  };
}

function checkoutMigrationReadinessSignature(input: {
  decision: Exclude<CompetitorImportPrivateRecordCheckoutMigrationReadinessStatus, "not_recorded">;
  recordKind: ImportDraftEntity;
  matchedHeaderLabels: string[];
  matchedSignalLabels: string[];
}) {
  return JSON.stringify(input);
}

export async function recordCompetitorImportPrivateRecordCheckoutMigrationReadiness(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
    recordId: string;
    decision: Exclude<CompetitorImportPrivateRecordCheckoutMigrationReadinessStatus, "not_recorded">;
    idempotencyKey: string;
  },
): Promise<CompetitorImportPrivateRecordCheckoutMigrationReadinessResult> {
  const review = await loadCompetitorImportedDraftReview(db, owner, {
    importerSlug: input.importerSlug,
    platformName: input.platformName,
    draftId: input.draftId,
  });
  const row = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(input.recordId.trim(), review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!row) {
    throw new Error("Private import record not found.");
  }

  if (row.owner_user_id !== owner.userId || row.importer_platform_id !== review.importerPlatformId || row.importer_slug !== review.importerSlug) {
    throw new Error("Only the publisher who created this private import plan can record checkout readiness.");
  }

  if (row.status !== "private_draft") {
    throw new Error("Archived private import records cannot record checkout readiness.");
  }

  if (!checkoutMigrationReadinessKinds.includes(row.record_kind)) {
    throw new Error("Checkout readiness is available only on private checkout offer or product catalog records.");
  }

  const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
  const record = competitorImportPrivateRecordFromRow(row);
  const previousCheckoutMigrationReadiness = record.checkoutMigrationReadiness;
  const signature = checkoutMigrationReadinessSignature({
    decision: input.decision,
    recordKind: row.record_kind,
    matchedHeaderLabels: record.matchedHeaderLabels,
    matchedSignalLabels: record.matchedSignalLabels,
  });
  const previousIdempotencyKey =
    typeof metadata.checkoutMigrationReadinessIdempotencyKey === "string"
      ? metadata.checkoutMigrationReadinessIdempotencyKey
      : "";
  const previousSignature =
    typeof metadata.checkoutMigrationReadinessSignature === "string" ? metadata.checkoutMigrationReadinessSignature : "";

  if (previousIdempotencyKey && previousIdempotencyKey === input.idempotencyKey && previousSignature !== signature) {
    throw new Error("This idempotency key already recorded different checkout readiness.");
  }

  const idempotent = previousIdempotencyKey === input.idempotencyKey && previousSignature === signature;

  if (!idempotent) {
    const recordedAt = new Date().toISOString();
    const checkoutMigrationReadiness: CompetitorImportPrivateRecordCheckoutMigrationReadiness = {
      responseField: "checkoutMigrationReadiness",
      status: input.decision,
      source: "verified_publisher_checkout_migration_readiness",
      recordedAt,
      summary: competitorImportCheckoutMigrationReadinessSummary(input.decision),
      nextStep: competitorImportCheckoutMigrationReadinessNextStep(input.decision),
      acknowledgedBlockers: [
        "No live payment credentials are imported.",
        "No Stripe checkout sessions or checkout intents are created.",
        "No public checkout route, account transfer, domain, fulfillment, or go-live effect is enabled.",
      ],
      createsCheckoutIntents: false,
      createsStripeCheckoutSessions: false,
      importsPaymentCredentials: false,
      publicCheckoutRoutesEnabled: false,
      liveCheckoutEnabled: false,
      publicPublishingEnabled: false,
      goLiveEffectsEnabled: false,
      redaction: competitorImportCheckoutMigrationReadinessRedaction(),
    };

    await db
      .prepare(
        `UPDATE competitor_import_private_records
         SET metadata_json = ?, updated_at = unixepoch()
         WHERE id = ? AND draft_funnel_id = ?`,
      )
      .bind(
        JSON.stringify({
          ...metadata,
          checkoutMigrationReadiness,
          checkoutMigrationReadinessAt: recordedAt,
          checkoutMigrationReadinessSource: "verified_publisher_checkout_migration_readiness",
          checkoutMigrationReadinessIdempotencyKey: input.idempotencyKey,
          checkoutMigrationReadinessSignature: signature,
          checkoutMigrationReadinessConfirmationMatched: true,
          checkoutMigrationReadinessCreatesCheckoutIntents: false,
          checkoutMigrationReadinessCreatesStripeCheckoutSessions: false,
          checkoutMigrationReadinessImportsPaymentCredentials: false,
          checkoutMigrationReadinessPublicCheckoutRoutesEnabled: false,
          checkoutMigrationReadinessLiveCheckoutEnabled: false,
          checkoutMigrationReadinessGoLiveEffectsEnabled: false,
        }),
        row.id,
        review.draft.id,
      )
      .run();
  }

  const updated = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(row.id, review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!updated) {
    throw new Error("The checkout migration readiness could not be loaded after update.");
  }

  const updatedRecord = competitorImportPrivateRecordFromRow(updated);
  if (!updatedRecord.checkoutMigrationReadiness) {
    throw new Error("The checkout migration readiness could not be loaded after update.");
  }

  return {
    draft: review.draft,
    record: updatedRecord,
    checkoutMigrationReadiness: updatedRecord.checkoutMigrationReadiness,
    previousCheckoutMigrationReadiness,
    idempotent,
    goLiveEffects: competitorImportRecordGoLiveEffects(),
    redaction: competitorImportRecordRedaction(),
  };
}

type D1CompetitorImportSubscriberRecordRow = {
  id: string;
  status: string;
};

type D1CompetitorImportPrivateSubscriberRecordRow = {
  id: string;
  tenant_id: string;
  draft_funnel_id: string;
  import_record_id: string;
  owner_user_id: string | null;
  importer_platform_id: string;
  importer_slug: string;
  platform_name: string;
  email: string;
  email_hash: string;
  first_name: string | null;
  source_status: string | null;
  status: string;
  source_tags_json: string | null;
  metadata_json: string | null;
  created_at: number | null;
  updated_at: number | null;
};

function competitorImportPrivateSubscriberRecordFromRow(
  row: D1CompetitorImportPrivateSubscriberRecordRow,
): CompetitorImportPrivateSubscriberRecord {
  return {
    id: row.id,
    importRecordId: row.import_record_id,
    draftFunnelId: row.draft_funnel_id,
    importerPlatformId: row.importer_platform_id,
    importerSlug: row.importer_slug,
    platformName: row.platform_name,
    email: row.email,
    emailHash: row.email_hash,
    firstName: row.first_name,
    sourceStatus: row.source_status,
    status:
      row.status === "archived"
        ? "archived"
        : row.status === "promoted_to_global_audience_pending_review"
          ? "promoted_to_global_audience_pending_review"
          : "private_imported_pending_review",
    sourceTagLabels: stringArrayMetadata(parseJson<unknown>(row.source_tags_json ?? "[]", [])),
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
    redaction: {
      ownerOnly: true,
      publicSourceDataIncluded: false,
      unauthenticatedResponsesIncluded: false,
      globalAudienceSubscriberRow: row.status === "promoted_to_global_audience_pending_review",
      sequenceEnrollmentCreated: false,
      emailDeliveryEnabled: false,
      privateExportEligible: row.status !== "archived",
      publicExportEnabled: false,
      goLiveEffectsEnabled: false,
    },
  };
}

async function loadCompetitorImportPrivateSubscriberRecords(
  db: D1Database,
  input: { tenantId: string; draftFunnelId: string; ownerUserId: string },
) {
  const rows = await db
    .prepare(
      `SELECT id, tenant_id, draft_funnel_id, import_record_id, owner_user_id, importer_platform_id, importer_slug, platform_name,
              email, email_hash, first_name, source_status, status, source_tags_json, metadata_json, created_at, updated_at
       FROM competitor_import_subscriber_records
       WHERE tenant_id = ? AND draft_funnel_id = ? AND owner_user_id = ?
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 100`,
    )
    .bind(input.tenantId, input.draftFunnelId, input.ownerUserId)
    .all<D1CompetitorImportPrivateSubscriberRecordRow>();

  const records = (rows.results ?? []).map(competitorImportPrivateSubscriberRecordFromRow);
  return records.reduce<Record<string, CompetitorImportPrivateSubscriberRecord[]>>((byRecordId, record) => {
    byRecordId[record.importRecordId] = [...(byRecordId[record.importRecordId] ?? []), record];
    return byRecordId;
  }, {});
}

export async function loadCompetitorImportedDraftReviewWithSubscriberRecords(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
  },
) {
  const review = await loadCompetitorImportedDraftReview(db, owner, input);
  return {
    ...review,
    privateSubscriberRecordsByImportRecordId: await loadCompetitorImportPrivateSubscriberRecords(db, {
      tenantId: review.tenantId,
      draftFunnelId: review.draft.id,
      ownerUserId: owner.userId,
    }),
  };
}

async function loadCompetitorImportPrivateSubscriberRowsForRecord(
  db: D1Database,
  input: { tenantId: string; draftFunnelId: string; importRecordId: string; ownerUserId: string },
) {
  const savedSubscriberRows = await db
    .prepare(
      `SELECT id, tenant_id, draft_funnel_id, import_record_id, owner_user_id, importer_platform_id, importer_slug, platform_name,
              email, email_hash, first_name, source_status, status, source_tags_json, metadata_json, created_at, updated_at
       FROM competitor_import_subscriber_records
       WHERE tenant_id = ?
         AND draft_funnel_id = ?
         AND import_record_id = ?
         AND owner_user_id = ?
         AND status != 'archived'
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 100`,
    )
    .bind(input.tenantId, input.draftFunnelId, input.importRecordId, input.ownerUserId)
    .all<D1CompetitorImportPrivateSubscriberRecordRow>();

  return savedSubscriberRows.results ?? [];
}

function subscriberImportCreationSignature(input: {
  contacts: CompetitorImportSubscriberCandidate[];
  malformedContactCount: number;
}) {
  return JSON.stringify({
    emails: input.contacts.map((contact) => contact.email).sort(),
    malformedContactCount: input.malformedContactCount,
  });
}

function sourceStatusIsSuppressed(value: string | null) {
  return Boolean(value && /unsubscribed|unsubscribe|suppressed|spam|complaint|bounced|invalid/i.test(value));
}

function subscriberAudiencePromotionSignature(records: D1CompetitorImportPrivateSubscriberRecordRow[]) {
  return JSON.stringify({
    records: records.map((record) => `${record.id}:${record.email_hash}`).sort(),
  });
}

function subscriberPrivateExportSignature(records: D1CompetitorImportPrivateSubscriberRecordRow[]) {
  return JSON.stringify({
    records: records.map((record) => `${record.id}:${record.email_hash}:${record.status}`).sort(),
  });
}

function subscriberPrivateExportFileName(importerSlug: string, recordId: string) {
  const suffix = recordId.replace(/[^a-zA-Z0-9]/g, "").slice(-10) || "records";
  return `${importerSlug}-private-subscriber-export-${suffix}.csv`;
}

function importerAudienceTagId(importerSlug: string, label: string) {
  const tagSlug = slugifyDraftFunnelTitle(label).slice(0, 64);
  return tagSlug ? `importer-${importerSlug}-${tagSlug}` : null;
}

export async function createCompetitorImportPrivateRecordSubscribers(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
    recordId: string;
    contacts: CompetitorImportSubscriberCandidate[];
    malformedContactCount: number;
    idempotencyKey: string;
  },
): Promise<CompetitorImportPrivateRecordSubscriberImportCreationResult> {
  const review = await loadCompetitorImportedDraftReview(db, owner, {
    importerSlug: input.importerSlug,
    platformName: input.platformName,
    draftId: input.draftId,
  });
  const row = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(input.recordId.trim(), review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!row) {
    throw new Error("Private import record not found.");
  }

  if (row.owner_user_id !== owner.userId || row.importer_platform_id !== review.importerPlatformId || row.importer_slug !== review.importerSlug) {
    throw new Error("Only the publisher who created this private import plan can create private subscriber records.");
  }

  if (row.status !== "private_draft") {
    throw new Error("Archived private import records cannot create private subscriber records.");
  }

  if (row.record_kind !== "draft_audience_import") {
    throw new Error("Subscriber record creation is available only on private audience import records.");
  }

  const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
  const record = competitorImportPrivateRecordFromRow(row);
  const previousCreation = record.subscriberImportCreation;

  if (record.subscriberImportPreflight?.status !== "ready_for_import_planning") {
    throw new Error("Mark this subscriber preflight ready before creating private subscriber records.");
  }

  if (!input.contacts.length) {
    throw new Error("Upload or paste at least one subscriber email before creating private subscriber records.");
  }

  const signature = await sha256Hex(subscriberImportCreationSignature(input));
  const previousIdempotencyKey =
    typeof metadata.subscriberImportCreationIdempotencyKey === "string" ? metadata.subscriberImportCreationIdempotencyKey : "";
  const previousSignature =
    typeof metadata.subscriberImportCreationSignature === "string" ? metadata.subscriberImportCreationSignature : "";

  if (previousIdempotencyKey && previousIdempotencyKey === input.idempotencyKey && previousSignature !== signature) {
    throw new Error("This idempotency key already created a different private subscriber import.");
  }

  const idempotent = previousIdempotencyKey === input.idempotencyKey && previousSignature === signature;

  if (!idempotent) {
    const recordedAt = new Date().toISOString();
    const sourceFormId = `importer-${input.importerSlug}-private-subscriber-import`;
    const sourceSegmentId = `imported-${input.importerSlug}-audience`;
    let createdPrivateSubscriberRecordCount = 0;
    let updatedPrivateSubscriberRecordCount = 0;
    let suppressedContactCount = 0;

    for (const contact of input.contacts.slice(0, 100)) {
      const emailHash = await sha256Hex(contact.email);
      const suppressed = await db
        .prepare("SELECT id FROM audience_suppression_entries WHERE email_hash = ? AND status = 'active' LIMIT 1")
        .bind(emailHash)
        .first<{ id: string }>();

      if (suppressed || sourceStatusIsSuppressed(contact.sourceStatus)) {
        suppressedContactCount += 1;
        continue;
      }

      const existing = await db
        .prepare(
          `SELECT id, status
           FROM competitor_import_subscriber_records
           WHERE import_record_id = ? AND email_hash = ?
           LIMIT 1`,
        )
        .bind(row.id, emailHash)
        .first<D1CompetitorImportSubscriberRecordRow>();

      await db
        .prepare(
          `INSERT INTO competitor_import_subscriber_records (
            id, tenant_id, draft_funnel_id, import_record_id, owner_user_id, importer_platform_id,
            importer_slug, platform_name, email, email_hash, first_name, source_status, status,
            source_tags_json, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'private_imported_pending_review', ?, ?, unixepoch(), unixepoch())
          ON CONFLICT(import_record_id, email_hash) DO UPDATE SET
            email=excluded.email,
            first_name=COALESCE(excluded.first_name, competitor_import_subscriber_records.first_name),
            source_status=excluded.source_status,
            status=CASE
              WHEN competitor_import_subscriber_records.status = 'archived' THEN competitor_import_subscriber_records.status
              ELSE 'private_imported_pending_review'
            END,
            source_tags_json=excluded.source_tags_json,
            metadata_json=excluded.metadata_json,
            updated_at=unixepoch()`,
        )
        .bind(
          `competitor-import-subscriber-${crypto.randomUUID()}`,
          review.tenantId,
          review.draft.id,
          row.id,
          owner.userId,
          row.importer_platform_id,
          row.importer_slug,
          row.platform_name,
          contact.email,
          emailHash,
          contact.firstName,
          contact.sourceStatus,
          JSON.stringify(contact.tagLabels.slice(0, 20)),
          JSON.stringify({
            issue: importerIssue,
            source: "verified_publisher_subscriber_import_creation",
            importerSlug: row.importer_slug,
            platformName: row.platform_name,
            draftFunnelId: review.draft.id,
            importRecordId: row.id,
            rawImportRowsStored: false,
            rawExportTextStored: false,
            sourceTagLabelsStoredPrivately: contact.tagLabels.length > 0,
            sequenceEnrollmentsCreated: false,
            emailDeliveryEnabled: false,
            goLiveEffectsEnabled: false,
          }),
        )
        .run();

      if (existing) {
        updatedPrivateSubscriberRecordCount += 1;
      } else {
        createdPrivateSubscriberRecordCount += 1;
      }
    }

    const privateSubscriberRecordCount = createdPrivateSubscriberRecordCount + updatedPrivateSubscriberRecordCount;
    const subscriberImportCreation: CompetitorImportPrivateRecordSubscriberImportCreation = {
      responseField: "subscriberImportCreation",
      status: "subscriber_records_created",
      source: "verified_publisher_subscriber_import_creation",
      recordedAt,
      sourceFormId,
      sourceSegmentId,
      normalizedEmailCount: input.contacts.length,
      privateSubscriberRecordCount,
      createdPrivateSubscriberRecordCount,
      updatedPrivateSubscriberRecordCount,
      suppressedContactCount,
      malformedContactCount: input.malformedContactCount,
      summary: competitorImportSubscriberCreationSummary({
        status: "subscriber_records_created",
        privateSubscriberRecordCount,
        suppressedContactCount,
        malformedContactCount: input.malformedContactCount,
      }),
      nextStep: competitorImportSubscriberCreationNextStep("subscriber_records_created"),
      createsSubscriberRows: privateSubscriberRecordCount > 0,
      createsSequenceEnrollments: false,
      emailDeliveryEnabled: false,
      exportEnabled: false,
      goLiveEffectsEnabled: false,
      redaction: competitorImportSubscriberCreationRedaction(),
    };

    await db
      .prepare(
        `UPDATE competitor_import_private_records
         SET metadata_json = ?, updated_at = unixepoch()
         WHERE id = ? AND draft_funnel_id = ?`,
      )
      .bind(
        JSON.stringify({
          ...metadata,
          subscriberImportCreation,
          subscriberImportCreationAt: recordedAt,
          subscriberImportCreationSource: "verified_publisher_subscriber_import_creation",
          subscriberImportCreationIdempotencyKey: input.idempotencyKey,
          subscriberImportCreationSignature: signature,
          subscriberImportCreationConfirmationMatched: true,
          subscriberImportCreationRawRowsStored: false,
          subscriberImportCreationRawEmailsIncludedInResponse: false,
          subscriberImportCreationCreatesSequenceEnrollments: false,
          subscriberImportCreationEmailDeliveryEnabled: false,
          subscriberImportCreationExportEnabled: false,
          subscriberImportCreationGoLiveEffectsEnabled: false,
        }),
        row.id,
        review.draft.id,
      )
      .run();
  }

  const updated = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(row.id, review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!updated) {
    throw new Error("The private subscriber import record could not be loaded after update.");
  }

  const updatedRecord = competitorImportPrivateRecordFromRow(updated);
  if (!updatedRecord.subscriberImportCreation) {
    throw new Error("The private subscriber import creation could not be loaded after update.");
  }

  return {
    draft: review.draft,
    record: updatedRecord,
    creation: updatedRecord.subscriberImportCreation,
    previousCreation,
    idempotent,
    goLiveEffects: competitorImportRecordGoLiveEffects(),
    redaction: competitorImportRecordRedaction(),
  };
}

export async function prepareCompetitorImportPrivateRecordSubscriberExport(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
    recordId: string;
    idempotencyKey: string;
  },
): Promise<CompetitorImportPrivateRecordSubscriberPrivateExportResult> {
  const review = await loadCompetitorImportedDraftReview(db, owner, {
    importerSlug: input.importerSlug,
    platformName: input.platformName,
    draftId: input.draftId,
  });
  const row = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(input.recordId.trim(), review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!row) {
    throw new Error("Private import record not found.");
  }

  if (row.owner_user_id !== owner.userId || row.importer_platform_id !== review.importerPlatformId || row.importer_slug !== review.importerSlug) {
    throw new Error("Only the publisher who created this private import plan can export importer subscriber records.");
  }

  if (row.status !== "private_draft") {
    throw new Error("Archived private import records cannot export private subscriber records.");
  }

  if (row.record_kind !== "draft_audience_import") {
    throw new Error("Private subscriber export is available only on private audience import records.");
  }

  const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
  const record = competitorImportPrivateRecordFromRow(row);
  const previousSubscriberExport = record.subscriberPrivateExport;

  if (record.subscriberImportCreation?.status !== "subscriber_records_created") {
    throw new Error("Save private subscriber records before preparing a private export.");
  }

  const privateSubscriberRows = await loadCompetitorImportPrivateSubscriberRowsForRecord(db, {
    tenantId: review.tenantId,
    draftFunnelId: review.draft.id,
    importRecordId: row.id,
    ownerUserId: owner.userId,
  });

  if (!privateSubscriberRows.length) {
    throw new Error("Save private subscriber records before preparing a private export.");
  }

  const signature = await sha256Hex(subscriberPrivateExportSignature(privateSubscriberRows));
  const previousIdempotencyKey =
    typeof metadata.subscriberPrivateExportIdempotencyKey === "string"
      ? metadata.subscriberPrivateExportIdempotencyKey
      : "";
  const previousSignature =
    typeof metadata.subscriberPrivateExportSignature === "string" ? metadata.subscriberPrivateExportSignature : "";

  if (previousIdempotencyKey && previousIdempotencyKey === input.idempotencyKey && previousSignature !== signature) {
    throw new Error("This idempotency key already prepared a different private subscriber export.");
  }

  const idempotent = previousIdempotencyKey === input.idempotencyKey && previousSignature === signature;

  if (!idempotent) {
    const recordedAt = new Date().toISOString();
    const exportFileName = subscriberPrivateExportFileName(input.importerSlug, row.id);
    const subscriberPrivateExport: CompetitorImportPrivateRecordSubscriberPrivateExport = {
      responseField: "subscriberPrivateExport",
      status: "private_export_prepared",
      source: "verified_publisher_private_subscriber_export",
      recordedAt,
      exportFileName,
      privateSubscriberRecordCount: privateSubscriberRows.length,
      exportedPrivateSubscriberRecordCount: privateSubscriberRows.length,
      csvColumnHeaders: ["email", "first_name", "source_status", "source_tags", "status"],
      summary: competitorImportSubscriberPrivateExportSummary({
        status: "private_export_prepared",
        exportedPrivateSubscriberRecordCount: privateSubscriberRows.length,
      }),
      nextStep: competitorImportSubscriberPrivateExportNextStep("private_export_prepared"),
      createsSubscriberRows: false,
      createsConsentEvents: false,
      createsSequenceEnrollments: false,
      emailDeliveryEnabled: false,
      privateExportEnabled: true,
      publicExportEnabled: false,
      goLiveEffectsEnabled: false,
      redaction: competitorImportSubscriberPrivateExportRedaction(),
    };

    await db
      .prepare(
        `UPDATE competitor_import_private_records
         SET metadata_json = ?, updated_at = unixepoch()
         WHERE id = ? AND draft_funnel_id = ?`,
      )
      .bind(
        JSON.stringify({
          ...metadata,
          subscriberPrivateExport,
          subscriberPrivateExportAt: recordedAt,
          subscriberPrivateExportSource: "verified_publisher_private_subscriber_export",
          subscriberPrivateExportIdempotencyKey: input.idempotencyKey,
          subscriberPrivateExportSignature: signature,
          subscriberPrivateExportConfirmationMatched: true,
          subscriberPrivateExportOwnerOnly: true,
          subscriberPrivateExportPublicSourceDataIncluded: false,
          subscriberPrivateExportPrivateEmailsIncludedInJsonResponse: false,
          subscriberPrivateExportCreatesConsentEvents: false,
          subscriberPrivateExportCreatesSequenceEnrollments: false,
          subscriberPrivateExportEmailDeliveryEnabled: false,
          subscriberPrivateExportPublicExportEnabled: false,
          subscriberPrivateExportGoLiveEffectsEnabled: false,
        }),
        row.id,
        review.draft.id,
      )
      .run();
  }

  const updated = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(row.id, review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!updated) {
    throw new Error("The private subscriber export could not be loaded after update.");
  }

  const updatedRecord = competitorImportPrivateRecordFromRow(updated);
  if (!updatedRecord.subscriberPrivateExport) {
    throw new Error("The private subscriber export could not be loaded after update.");
  }

  return {
    draft: review.draft,
    record: updatedRecord,
    privateSubscriberRecords: privateSubscriberRows.map(competitorImportPrivateSubscriberRecordFromRow),
    subscriberExport: updatedRecord.subscriberPrivateExport,
    previousSubscriberExport,
    idempotent,
    goLiveEffects: competitorImportRecordGoLiveEffects(),
    redaction: competitorImportRecordRedaction(),
  };
}

export async function promoteCompetitorImportPrivateRecordSubscribersToAudience(
  db: D1Database,
  owner: { userId: string; email: string },
  input: {
    importerSlug: string;
    platformName: string;
    draftId: string;
    recordId: string;
    idempotencyKey: string;
  },
): Promise<CompetitorImportPrivateRecordSubscriberAudiencePromotionResult> {
  const review = await loadCompetitorImportedDraftReview(db, owner, {
    importerSlug: input.importerSlug,
    platformName: input.platformName,
    draftId: input.draftId,
  });
  const row = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(input.recordId.trim(), review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!row) {
    throw new Error("Private import record not found.");
  }

  if (row.owner_user_id !== owner.userId || row.importer_platform_id !== review.importerPlatformId || row.importer_slug !== review.importerSlug) {
    throw new Error("Only the publisher who created this private import plan can add importer subscribers to the audience list.");
  }

  if (row.status !== "private_draft") {
    throw new Error("Archived private import records cannot add importer subscribers to the audience list.");
  }

  if (row.record_kind !== "draft_audience_import") {
    throw new Error("Audience list promotion is available only on private audience import records.");
  }

  const metadata = parseJson<Record<string, unknown>>(row.metadata_json ?? "{}", {});
  const record = competitorImportPrivateRecordFromRow(row);
  const previousPromotion = record.subscriberAudiencePromotion;

  if (record.subscriberImportCreation?.status !== "subscriber_records_created") {
    throw new Error("Save private subscriber records before adding them to the audience list.");
  }

  const privateSubscriberRecords = await loadCompetitorImportPrivateSubscriberRowsForRecord(db, {
    tenantId: review.tenantId,
    draftFunnelId: review.draft.id,
    importRecordId: row.id,
    ownerUserId: owner.userId,
  });

  if (!privateSubscriberRecords.length) {
    throw new Error("Save private subscriber records before adding them to the audience list.");
  }

  const signature = await sha256Hex(subscriberAudiencePromotionSignature(privateSubscriberRecords));
  const previousIdempotencyKey =
    typeof metadata.subscriberAudiencePromotionIdempotencyKey === "string"
      ? metadata.subscriberAudiencePromotionIdempotencyKey
      : "";
  const previousSignature =
    typeof metadata.subscriberAudiencePromotionSignature === "string" ? metadata.subscriberAudiencePromotionSignature : "";

  if (previousIdempotencyKey && previousIdempotencyKey === input.idempotencyKey && previousSignature !== signature) {
    throw new Error("This idempotency key already added a different importer subscriber set to the audience list.");
  }

  const idempotent = previousIdempotencyKey === input.idempotencyKey && previousSignature === signature;

  if (!idempotent) {
    const recordedAt = new Date().toISOString();
    const sourceFormId = `importer-${input.importerSlug}-audience-review-list`;
    const sourceSegmentId = `imported-${input.importerSlug}-audience-review`;
    let createdGlobalAudienceSubscriberCount = 0;
    let updatedGlobalAudienceSubscriberCount = 0;
    let promotedPrivateSubscriberRecordCount = 0;
    let tagAssignmentCount = 0;
    let suppressedContactCount = 0;

    for (const privateRecord of privateSubscriberRecords) {
      const suppressed = await db
        .prepare("SELECT id FROM audience_suppression_entries WHERE email_hash = ? AND status = 'active' LIMIT 1")
        .bind(privateRecord.email_hash)
        .first<{ id: string }>();
      const existingSubscriber = await db
        .prepare("SELECT id, status FROM audience_subscribers WHERE email = ? LIMIT 1")
        .bind(privateRecord.email)
        .first<{ id: string; status: string }>();

      if (suppressed || sourceStatusIsSuppressed(privateRecord.source_status) || existingSubscriber?.status === "unsubscribed") {
        suppressedContactCount += 1;
        continue;
      }

      const subscriberId = existingSubscriber?.id ?? runtimeId("subscriber");
      await db
        .prepare(
          `INSERT INTO audience_subscribers (
            id, email, email_hash, first_name, status, source_form_id, source_segment_id, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'imported_pending_review', ?, ?, ?, unixepoch(), unixepoch())
          ON CONFLICT(email) DO UPDATE SET
            first_name=COALESCE(audience_subscribers.first_name, excluded.first_name),
            updated_at=unixepoch()`,
        )
        .bind(
          subscriberId,
          privateRecord.email,
          privateRecord.email_hash,
          privateRecord.first_name,
          sourceFormId,
          sourceSegmentId,
          JSON.stringify({
            issue: importerIssue,
            source: "verified_publisher_subscriber_audience_promotion",
            importerSlug: row.importer_slug,
            platformName: row.platform_name,
            draftFunnelId: review.draft.id,
            importRecordId: row.id,
            sourcePrivateSubscriberRecordId: privateRecord.id,
            ownerUserId: owner.userId,
            rawImportRowsStored: false,
            rawContactRowsIncluded: false,
            sequenceEnrollmentsCreated: false,
            consentEventsCreated: false,
            emailDeliveryEnabled: false,
            goLiveEffectsEnabled: false,
          }),
        )
        .run();

      const subscriber = await db
        .prepare("SELECT id, status FROM audience_subscribers WHERE email = ? LIMIT 1")
        .bind(privateRecord.email)
        .first<{ id: string; status: string }>();

      if (!subscriber) {
        throw new Error("The audience subscriber row could not be loaded after promotion.");
      }

      if (existingSubscriber) {
        updatedGlobalAudienceSubscriberCount += 1;
      } else {
        createdGlobalAudienceSubscriberCount += 1;
      }

      const tagLabels = stringArrayMetadata(parseJson<unknown>(privateRecord.source_tags_json ?? "[]", []));
      for (const tagLabel of tagLabels) {
        const tagId = importerAudienceTagId(input.importerSlug, tagLabel);
        if (!tagId) continue;
        const existingAssignment = await db
          .prepare("SELECT id FROM audience_tag_assignments WHERE subscriber_id = ? AND tag_id = ? LIMIT 1")
          .bind(subscriber.id, tagId)
          .first<{ id: string }>();
        await db
          .prepare(
            `INSERT OR IGNORE INTO audience_tag_assignments (
              id, subscriber_id, tag_id, source_form_id, status, idempotency_key, metadata_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'active', ?, ?, unixepoch(), unixepoch())`,
          )
          .bind(
            runtimeId("tag-assignment"),
            subscriber.id,
            tagId,
            sourceFormId,
            `${input.idempotencyKey}:${subscriber.id}:${tagId}`,
            JSON.stringify({
              issue: importerIssue,
              source: "verified_publisher_subscriber_audience_promotion",
              importerSlug: row.importer_slug,
              sourceTagLabelStoredPrivately: true,
              rawContactRowsIncluded: false,
              emailDeliveryEnabled: false,
            }),
          )
          .run();
        if (!existingAssignment) tagAssignmentCount += 1;
      }

      const privateRecordMetadata = parseJson<Record<string, unknown>>(privateRecord.metadata_json ?? "{}", {});
      await db
        .prepare(
          `UPDATE competitor_import_subscriber_records
           SET status = 'promoted_to_global_audience_pending_review',
               metadata_json = ?,
               updated_at = unixepoch()
           WHERE id = ?
             AND import_record_id = ?
             AND tenant_id = ?
             AND owner_user_id = ?`,
        )
        .bind(
          JSON.stringify({
            ...privateRecordMetadata,
            subscriberAudiencePromotionSource: "verified_publisher_subscriber_audience_promotion",
            subscriberAudiencePromotionAt: recordedAt,
            audienceSubscriberStatus: subscriber.status,
            globalAudienceSubscriberRowCreated: !existingSubscriber,
            sequenceEnrollmentsCreated: false,
            consentEventsCreated: false,
            emailDeliveryEnabled: false,
            goLiveEffectsEnabled: false,
          }),
          privateRecord.id,
          row.id,
          review.tenantId,
          owner.userId,
        )
        .run();
      promotedPrivateSubscriberRecordCount += 1;
    }

    const promotionStatus: CompetitorImportPrivateRecordSubscriberAudiencePromotionStatus =
      promotedPrivateSubscriberRecordCount > 0 ? "global_audience_rows_created" : "not_promoted";
    const subscriberAudiencePromotion: CompetitorImportPrivateRecordSubscriberAudiencePromotion = {
      responseField: "subscriberAudiencePromotion",
      status: promotionStatus,
      source: "verified_publisher_subscriber_audience_promotion",
      recordedAt,
      sourceFormId,
      sourceSegmentId,
      globalAudienceSubscriberStatus: "imported_pending_review",
      privateSubscriberRecordCount: privateSubscriberRecords.length,
      promotedPrivateSubscriberRecordCount,
      createdGlobalAudienceSubscriberCount,
      updatedGlobalAudienceSubscriberCount,
      tagAssignmentCount,
      suppressedContactCount,
      summary: competitorImportSubscriberAudiencePromotionSummary({
        status: promotionStatus,
        promotedPrivateSubscriberRecordCount,
        suppressedContactCount,
      }),
      nextStep: competitorImportSubscriberAudiencePromotionNextStep(promotionStatus),
      createsGlobalAudienceSubscriberRows: promotedPrivateSubscriberRecordCount > 0,
      createsConsentEvents: false,
      createsSequenceEnrollments: false,
      emailDeliveryEnabled: false,
      exportEnabled: false,
      goLiveEffectsEnabled: false,
      requiresConsentReviewBeforeSending: true,
      redaction: competitorImportSubscriberAudiencePromotionRedaction(),
    };

    await db
      .prepare(
        `UPDATE competitor_import_private_records
         SET metadata_json = ?, updated_at = unixepoch()
         WHERE id = ? AND draft_funnel_id = ?`,
      )
      .bind(
        JSON.stringify({
          ...metadata,
          subscriberAudiencePromotion,
          subscriberAudiencePromotionAt: recordedAt,
          subscriberAudiencePromotionSource: "verified_publisher_subscriber_audience_promotion",
          subscriberAudiencePromotionIdempotencyKey: input.idempotencyKey,
          subscriberAudiencePromotionSignature: signature,
          subscriberAudiencePromotionConfirmationMatched: true,
          subscriberAudiencePromotionCreatesGlobalAudienceSubscriberRows: promotedPrivateSubscriberRecordCount > 0,
          subscriberAudiencePromotionCreatesConsentEvents: false,
          subscriberAudiencePromotionCreatesSequenceEnrollments: false,
          subscriberAudiencePromotionEmailDeliveryEnabled: false,
          subscriberAudiencePromotionExportEnabled: false,
          subscriberAudiencePromotionGoLiveEffectsEnabled: false,
        }),
        row.id,
        review.draft.id,
      )
      .run();
  }

  const updated = await db
    .prepare(
      `SELECT *
       FROM competitor_import_private_records
       WHERE id = ? AND draft_funnel_id = ?
       LIMIT 1`,
    )
    .bind(row.id, review.draft.id)
    .first<D1CompetitorImportPrivateRecordRow>();

  if (!updated) {
    throw new Error("The audience list promotion could not be loaded after update.");
  }

  const updatedRecord = competitorImportPrivateRecordFromRow(updated);
  if (!updatedRecord.subscriberAudiencePromotion) {
    throw new Error("The audience list promotion could not be loaded after update.");
  }

  return {
    draft: review.draft,
    record: updatedRecord,
    promotion: updatedRecord.subscriberAudiencePromotion,
    previousPromotion,
    idempotent,
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
    canvasLayout: block.canvasLayout ?? null,
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

export async function updateDraftFunnelBlockCanvasLayout(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    draftId: string;
    stepId: string;
    blockId: string;
    x: unknown;
    y: unknown;
    width: unknown;
    height: unknown;
    zIndex: unknown;
    expectedRevisionId: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
) {
  const replay = await draftForIdempotencyKey(db, input.idempotencyKey);
  if (replay) return replay;

  const draft = await loadDraftFromD1(db, input.draftId);
  if (!draft) throw new Error("Draft funnel not found.");
  assertDraftIsMutable(draft, "laid out");

  if (!input.expectedRevisionId || input.expectedRevisionId !== draft.revisionId) {
    throw new Error("Draft funnel revision changed. Refresh before laying out this block.");
  }

  const step = draft.steps.find((item) => item.id === input.stepId);
  if (!step) throw new Error("Draft funnel step not found.");

  const blockIndex = step.blocks.findIndex((item) => item.id === input.blockId);
  if (blockIndex === -1) throw new Error("Draft funnel block not found.");

  const block = step.blocks[blockIndex];
  const previousLayout = block.canvasLayout ? normalizeFunnelBlockCanvasLayout(block.canvasLayout, blockIndex) : null;
  const nextLayout = normalizeFunnelBlockCanvasLayout(
    {
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
      zIndex: input.zIndex,
    },
    blockIndex,
  );
  const nextBlocks = step.blocks.map((item) => {
    if (item.id !== block.id) return item;
    return {
      ...item,
      canvasLayout: nextLayout,
    };
  });
  const nextRevisionId = `${draft.revisionId}-block-canvas-layout-${Date.now()}`;

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
      `${identityEmail(identity)} updated canvas layout for block ${block.id} in ${draft.title}.`,
      {
        issue: draftFunnelAdvancedParityIssue,
        action: "block_canvas_layout_update",
        draftFunnelBlockCanvasLayoutCapability: draftFunnelBlockCanvasLayoutCapability.id,
        ...agentFunnelWriteMetadata(input.agentWriteAudit, { publicRouteMutation: draft.status === "published" }),
        expectedRevisionId: input.expectedRevisionId,
        stepId: step.id,
        blockId: block.id,
        previousLayout,
        nextLayout,
        before: compactBlockForAudit(block),
        after: compactBlockForAudit({
          ...block,
          canvasLayout: nextLayout,
        }),
        blockIdPreserved: true,
        blockKindPreserved: true,
        blockTitlePreserved: true,
        blockBodyPreserved: true,
        checkoutLinkPreserved: Boolean(block.checkoutLink),
        resourceDeliveryLinkPreserved: Boolean(block.resourceDeliveryLink),
        webinarEventLinkPreserved: Boolean(block.webinarEventLink),
        privatePreviewRendersLayout: true,
        publicPublishedRouteRendersLayout: true,
        publicRouteMutation: draft.status === "published",
        arbitraryCssIncluded: false,
        scriptIncluded: false,
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

function normalizeBulkPurgeTargets(targets: DraftFunnelBulkPurgeTarget[]) {
  const seen = new Set<string>();
  const normalized: DraftFunnelBulkPurgeTarget[] = [];

  for (const target of targets) {
    const draftId = target.draftId.trim();
    const expectedRevisionId = target.expectedRevisionId.trim();
    if (!draftId || !expectedRevisionId || seen.has(draftId)) continue;
    seen.add(draftId);
    normalized.push({ draftId, expectedRevisionId });
  }

  return normalized.slice(0, 12);
}

async function bulkPurgeEventIdempotencyKey(baseIdempotencyKey: string, draftId: string) {
  const suffix = (await sha256Hex(draftId)).slice(0, 16);
  return `${baseIdempotencyKey}:draft:${suffix}`.slice(0, 220);
}

export async function bulkPurgeArchivedDraftFunnels(
  db: D1Database,
  identity: AdminIdentity,
  input: {
    targets: DraftFunnelBulkPurgeTarget[];
    confirmationText: string;
    idempotencyKey: string;
    agentWriteAudit?: AgentFunnelWriteAudit;
  },
): Promise<DraftFunnelBulkPurgeResult> {
  if (input.confirmationText !== draftFunnelBulkPurgeConfirmationText) {
    throw new Error("Exact bulk archived draft purge confirmation text is required.");
  }

  const targets = normalizeBulkPurgeTargets(input.targets);
  if (targets.length === 0) {
    throw new Error("Choose at least one archived draft funnel to bulk purge.");
  }

  const planned: Array<{ target: DraftFunnelBulkPurgeTarget; idempotencyKey: string }> = [];
  const replayByDraftId = new Map<string, DraftFunnelPurgeResult>();

  for (const target of targets) {
    const idempotencyKey = await bulkPurgeEventIdempotencyKey(input.idempotencyKey, target.draftId);
    const replay = await purgeEventForIdempotencyKey(db, idempotencyKey);
    if (replay) {
      replayByDraftId.set(target.draftId, replay);
      continue;
    }

    const draft = await loadDraftFromD1(db, target.draftId);
    if (!draft) throw new Error(`Draft funnel ${target.draftId} not found.`);
    if (draft.status !== "archived") {
      throw new Error(`Only archived draft funnels can be bulk purged. Archive ${draft.title} before purging it.`);
    }
    if (target.expectedRevisionId !== draft.revisionId) {
      throw new Error(`Draft funnel revision changed for ${draft.title}. Refresh before bulk purging.`);
    }

    planned.push({ target, idempotencyKey });
  }

  const purgeByDraftId = new Map(replayByDraftId);
  for (const item of planned) {
    const purge = await purgeArchivedDraftFunnel(db, identity, {
      draftId: item.target.draftId,
      expectedRevisionId: item.target.expectedRevisionId,
      confirmationText: draftFunnelPurgeConfirmationText,
      idempotencyKey: item.idempotencyKey,
      agentWriteAudit: input.agentWriteAudit,
    });
    purgeByDraftId.set(item.target.draftId, purge);
  }

  const purges = targets.map((target) => purgeByDraftId.get(target.draftId)).filter(Boolean) as DraftFunnelPurgeResult[];
  const latestCreatedAt =
    purges
      .map((purge) => purge.createdAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;

  return {
    id: `funnel-bulk-purge-${(await sha256Hex(input.idempotencyKey)).slice(0, 20)}`,
    requestedDraftCount: targets.length,
    purgedDraftCount: purges.length,
    idempotentReplayCount: replayByDraftId.size,
    purges,
    idempotencyKey: input.idempotencyKey,
    actorEmail: identityEmail(identity),
    metadata: {
      issue: draftFunnelAdvancedParityIssue,
      parentIssue: draftFunnelBuilderParentIssue,
      action: "archived_draft_bulk_purge",
      requestedDraftIds: targets.map((target) => target.draftId),
      purgedDraftIds: purges.map((purge) => purge.draftId),
      requestedDraftCount: targets.length,
      purgedDraftCount: purges.length,
      idempotentReplayCount: replayByDraftId.size,
      deletedDraftRows: true,
      deletedStepRows: true,
      deletedAuditRows: false,
      deletedProductAssets: false,
      deletedR2Objects: false,
      deletedBuyerRecords: false,
      nonArchivedDraftsPurged: false,
      directAgentWrite: Boolean(input.agentWriteAudit),
      privateAuthDataIncluded: false,
      ...agentFunnelWriteMetadata(input.agentWriteAudit),
    },
    createdAt: latestCreatedAt,
  };
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
