import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import {
  loadAllAnalyticsExperimentDecisionEvidence,
  loadAnalyticsExperimentDecisionEvidence,
  type AnalyticsExperimentDecisionEvidence,
} from "@/lib/analytics-experiment-decisions";
import { sha256Hex } from "@/lib/analytics-events";
import { analyticsDashboard, type ExperimentDefinition } from "@/lib/analytics-experiments";
import {
  defaultAnalyticsTimeWindow,
  resolveAnalyticsTimeWindow,
  type AnalyticsTimeWindow,
} from "@/lib/analytics-time-windows";

export const analyticsExperimentWinnerRolloutIssue = 422;
export const analyticsExperimentWinnerRolloutStatus = "owner-experiment-winner-rollout-ready";
export const analyticsExperimentWinnerRolloutApiRoute = "/api/admin/analytics/winner-rollouts";
export const analyticsExperimentWinnerRolloutOwnerRoute = "/admin/analytics";
export const analyticsExperimentWinnerRolloutConfirmationText = "Route Bumpgrade experiment winner";
export const analyticsExperimentWinnerRollbackConfirmationText = "Rollback Bumpgrade experiment winner rollout";

const rolloutActions = ["rollout_winner", "rollback_winner_rollout"] as const;

export type AnalyticsExperimentWinnerRolloutAction = (typeof rolloutActions)[number];
export type AnalyticsExperimentWinnerRolloutStatusValue = "active" | "rolled_back";

type Runtime = {
  db: D1Database;
};

type RolloutRow = {
  id: string;
  dashboard_id: string;
  experiment_id: string;
  selected_variant_id: string;
  source_route: string;
  rollout_status: AnalyticsExperimentWinnerRolloutStatusValue;
  time_window_key: string;
  expected_dashboard_revision_id: string;
  expected_experiment_status: string;
  expected_assignment_count: number;
  expected_variant_counts_json: string;
  expected_primary_metric_id: string;
  expected_conversion_sample_size: number;
  sample_size_caveat_acknowledged: number;
  idempotency_key: string;
  actor_user_id: string | null;
  actor_email_hash: string;
  private_note_sha256: string | null;
  confirmation_text_sha256: string;
  rollback_idempotency_key: string | null;
  rollback_actor_user_id: string | null;
  rollback_actor_email_hash: string | null;
  rollback_note_sha256: string | null;
  rollback_confirmation_text_sha256: string | null;
  rolled_back_at: number | null;
  traffic_routing_enabled: number;
  automated_winner_enabled: number;
  custom_routing_preserved: number;
  cookie_assignment_enabled: number;
  revenue_claim_enabled: number;
  raw_event_rows_exposed: number;
  raw_assignment_rows_exposed: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

type RolloutCountRow = {
  total_rollouts: number;
  active_rollouts: number;
  rolled_back_rollouts: number;
  traffic_routing_enabled_records: number;
  automated_winner_enabled_records: number;
  custom_routing_preserved_records: number;
  cookie_assignment_enabled_records: number;
  revenue_claim_enabled_records: number;
  raw_event_rows_exposed_records: number;
  raw_assignment_rows_exposed_records: number;
};

export type AnalyticsExperimentWinnerRolloutPublic = {
  id: string;
  dashboardId: string;
  experimentId: string;
  experimentTitle: string;
  selectedVariantId: string;
  selectedVariantLabel: string | null;
  sourceRoute: string;
  rolloutStatus: AnalyticsExperimentWinnerRolloutStatusValue;
  rolloutRevision: string;
  timeWindowKey: string;
  expectedAssignmentCount: number;
  expectedVariantCounts: Record<string, number>;
  expectedPrimaryMetricId: string;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
  privateNoteRecorded: boolean;
  rollbackNoteRecorded: boolean;
  rolledBackAt: string | null;
  trafficRoutingEnabled: boolean;
  automatedWinnerEnabled: boolean;
  customRoutingPreserved: boolean;
  cookieAssignmentEnabled: false;
  revenueClaimEnabled: false;
  rawEventRowsExposed: false;
  rawAssignmentRowsExposed: false;
  createdAt: string | null;
  updatedAt: string | null;
  duplicate?: boolean;
};

export type AnalyticsExperimentWinnerRolloutSummary = {
  id: "analytics-experiment-winner-rollout-contract";
  status: typeof analyticsExperimentWinnerRolloutStatus;
  issue: typeof analyticsExperimentWinnerRolloutIssue;
  parentIssue: 18;
  apiRoute: typeof analyticsExperimentWinnerRolloutApiRoute;
  ownerRoute: typeof analyticsExperimentWinnerRolloutOwnerRoute;
  source: "d1" | "unavailable";
  loadError: string | null;
  dashboard: {
    id: string;
    title: string;
    revisionId: string;
    status: string;
  };
  experiment: {
    id: string;
    title: string;
    status: string;
  };
  confirmation: {
    rolloutText: typeof analyticsExperimentWinnerRolloutConfirmationText;
    rollbackText: typeof analyticsExperimentWinnerRollbackConfirmationText;
  };
  currentEvidenceByWindow: AnalyticsExperimentDecisionEvidence[];
  counts: {
    totalRollouts: number;
    activeRollouts: number;
    rolledBackRollouts: number;
    trafficRoutingEnabledRecords: number;
    automatedWinnerEnabledRecords: number;
    customRoutingPreservedRecords: number;
    cookieAssignmentEnabledRecords: number;
    revenueClaimEnabledRecords: number;
    rawEventRowsExposedRecords: number;
    rawAssignmentRowsExposedRecords: number;
  };
  activeRollout: AnalyticsExperimentWinnerRolloutPublic | null;
  latestRollouts: AnalyticsExperimentWinnerRolloutPublic[];
  redaction: {
    privateDataIncluded: false;
    rawEventRowsIncluded: false;
    rawAssignmentRowsIncluded: false;
    contactAnalyticsIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    rollbackNoteIncluded: false;
    rawRoutingUrlsIncluded: false;
    trafficRoutingEnabled: boolean;
    automatedWinnerEnabled: boolean;
    customRoutingPreserved: true;
    cookieAssignmentEnabled: false;
    revenueClaimEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateWinnerRolloutInput = {
  action?: unknown;
  dashboardId?: unknown;
  experimentId?: unknown;
  selectedVariantId?: unknown;
  timeWindowKey?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedExperimentStatus?: unknown;
  expectedAssignmentCount?: unknown;
  expectedVariantCounts?: unknown;
  expectedPrimaryMetricId?: unknown;
  expectedConversionSampleSize?: unknown;
  expectedActiveRolloutRevision?: unknown;
  rolloutId?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateWinnerRolloutResult =
  | {
      ok: true;
      status:
        | "analytics_experiment_winner_rollout_recorded"
        | "analytics_experiment_winner_rollout_replayed"
        | "analytics_experiment_winner_rollout_rolled_back"
        | "analytics_experiment_winner_rollout_rollback_replayed";
      duplicate: boolean;
      rollout: AnalyticsExperimentWinnerRolloutPublic;
      redaction: AnalyticsExperimentWinnerRolloutSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "unsupported_action"
        | "dashboard_not_found"
        | "experiment_not_found"
        | "unsupported_variant"
        | "holdout_variant_not_rollout_winner"
        | "sample_size_caveat_required"
        | "confirmation_required"
        | "stale_dashboard_revision"
        | "stale_experiment_status"
        | "stale_analytics_evidence"
        | "active_rollout_exists"
        | "rollout_not_found"
        | "rollout_not_active"
        | "stale_active_rollout"
        | "idempotency_conflict"
        | "rollout_not_created"
        | "rollout_not_updated";
      message: string;
      redaction: AnalyticsExperimentWinnerRolloutSummary["redaction"];
      currentDashboardRevisionId?: string;
      currentExperimentStatus?: string;
      currentEvidence?: AnalyticsExperimentDecisionEvidence;
      activeRollout?: AnalyticsExperimentWinnerRolloutPublic | null;
    };

async function getRuntime(): Promise<Runtime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function sourceRouteForExperiment(experiment: ExperimentDefinition) {
  return experiment.linkedRoute.split("#")[0] ?? experiment.linkedRoute;
}

function emptyCounts(): AnalyticsExperimentWinnerRolloutSummary["counts"] {
  return {
    totalRollouts: 0,
    activeRollouts: 0,
    rolledBackRollouts: 0,
    trafficRoutingEnabledRecords: 0,
    automatedWinnerEnabledRecords: 0,
    customRoutingPreservedRecords: 0,
    cookieAssignmentEnabledRecords: 0,
    revenueClaimEnabledRecords: 0,
    rawEventRowsExposedRecords: 0,
    rawAssignmentRowsExposedRecords: 0,
  };
}

function redaction(options?: { activeRouting?: boolean }): AnalyticsExperimentWinnerRolloutSummary["redaction"] {
  return {
    privateDataIncluded: false,
    rawEventRowsIncluded: false,
    rawAssignmentRowsIncluded: false,
    contactAnalyticsIncluded: false,
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    privateNoteIncluded: false,
    rollbackNoteIncluded: false,
    rawRoutingUrlsIncluded: false,
    trafficRoutingEnabled: Boolean(options?.activeRouting),
    automatedWinnerEnabled: Boolean(options?.activeRouting),
    customRoutingPreserved: true,
    cookieAssignmentEnabled: false,
    revenueClaimEnabled: false,
  };
}

function emptySummary(
  source: AnalyticsExperimentWinnerRolloutSummary["source"],
  loadError: string | null,
): AnalyticsExperimentWinnerRolloutSummary {
  const experiment = analyticsDashboard.experiments[0];
  return {
    id: "analytics-experiment-winner-rollout-contract",
    status: analyticsExperimentWinnerRolloutStatus,
    issue: analyticsExperimentWinnerRolloutIssue,
    parentIssue: 18,
    apiRoute: analyticsExperimentWinnerRolloutApiRoute,
    ownerRoute: analyticsExperimentWinnerRolloutOwnerRoute,
    source,
    loadError,
    dashboard: {
      id: analyticsDashboard.id,
      title: analyticsDashboard.title,
      revisionId: analyticsDashboard.revisionId,
      status: analyticsDashboard.status,
    },
    experiment: {
      id: experiment.id,
      title: experiment.title,
      status: experiment.status,
    },
    confirmation: {
      rolloutText: analyticsExperimentWinnerRolloutConfirmationText,
      rollbackText: analyticsExperimentWinnerRollbackConfirmationText,
    },
    currentEvidenceByWindow: [],
    counts: emptyCounts(),
    activeRollout: null,
    latestRollouts: [],
    redaction: redaction(),
    privateFieldsExcluded: [
      "rawAnalyticsEventRows",
      "rawExperimentAssignmentRows",
      "rawVisitorKeys",
      "visitorKeyHash",
      "assignmentHash",
      "actorEmail",
      "actorEmailHash",
      "privateNote",
      "privateNoteSha256",
      "rollbackNote",
      "rollbackNoteSha256",
      "confirmationTextSha256",
      "rollbackConfirmationTextSha256",
      "idempotencyKey",
      "rollbackIdempotencyKey",
      "metadataJson",
    ],
    writeBoundary:
      "Issue #422 lets verified owners route future unmatched seeded experiment assignments to a selected treatment variant after exact confirmation, idempotency, dashboard revision checks, experiment status checks, aggregate evidence checks, and sample-size caveat acknowledgement. Custom source/campaign routing rules still run first. Rollback requires a current rollout revision and exact confirmation. It does not expose raw events, raw assignments, visitor keys, contact analytics, raw routing URLs, raw/private exports, provider sends, Queue execution, or public agent write authority.",
  };
}

function numberValue(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseString(value: unknown, maxLength = 220) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function parseInteger(value: unknown) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;
  if (!Number.isInteger(numeric) || numeric < 0) return null;
  return numeric;
}

function parseBoolean(value: unknown) {
  return value === true || value === "true";
}

function parseAction(value: unknown): AnalyticsExperimentWinnerRolloutAction | null {
  if (typeof value !== "string") return null;
  return rolloutActions.includes(value as AnalyticsExperimentWinnerRolloutAction)
    ? (value as AnalyticsExperimentWinnerRolloutAction)
    : null;
}

function createdAtIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function safeParseVariantCounts(value: string | null) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).map(([key, count]) => [key, numberValue(count)]));
  } catch {
    return {};
  }
}

function variantLabel(experiment: ExperimentDefinition, variantId: string | null) {
  if (!variantId) return null;
  return experiment.variants.find((variant) => variant.id === variantId)?.label ?? null;
}

function canonicalVariantCounts(experiment: ExperimentDefinition, counts: Record<string, number>) {
  return Object.fromEntries(experiment.variants.map((variant) => [variant.id, numberValue(counts[variant.id])]));
}

function canonicalVariantCountsJson(experiment: ExperimentDefinition, counts: Record<string, number>) {
  return JSON.stringify(canonicalVariantCounts(experiment, counts));
}

function parseExpectedVariantCounts(experiment: ExperimentDefinition, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const parsed: Record<string, number> = {};
  for (const variant of experiment.variants) {
    const count = parseInteger(record[variant.id]);
    if (count === null) return null;
    parsed[variant.id] = count;
  }
  return parsed;
}

function publicRollout(row: RolloutRow, duplicate = false): AnalyticsExperimentWinnerRolloutPublic {
  const experiment = analyticsDashboard.experiments.find((candidate) => candidate.id === row.experiment_id) ?? analyticsDashboard.experiments[0];
  return {
    id: row.id,
    dashboardId: row.dashboard_id,
    experimentId: row.experiment_id,
    experimentTitle: experiment.title,
    selectedVariantId: row.selected_variant_id,
    selectedVariantLabel: variantLabel(experiment, row.selected_variant_id),
    sourceRoute: row.source_route,
    rolloutStatus: row.rollout_status,
    rolloutRevision: `${row.id}:${numberValue(row.updated_at)}`,
    timeWindowKey: row.time_window_key,
    expectedAssignmentCount: numberValue(row.expected_assignment_count),
    expectedVariantCounts: safeParseVariantCounts(row.expected_variant_counts_json),
    expectedPrimaryMetricId: row.expected_primary_metric_id,
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
    privateNoteRecorded: Boolean(row.private_note_sha256),
    rollbackNoteRecorded: Boolean(row.rollback_note_sha256),
    rolledBackAt: createdAtIso(row.rolled_back_at),
    trafficRoutingEnabled: row.traffic_routing_enabled === 1,
    automatedWinnerEnabled: row.automated_winner_enabled === 1,
    customRoutingPreserved: row.custom_routing_preserved === 1,
    cookieAssignmentEnabled: false,
    revenueClaimEnabled: false,
    rawEventRowsExposed: false,
    rawAssignmentRowsExposed: false,
    createdAt: createdAtIso(row.created_at),
    updatedAt: createdAtIso(row.updated_at),
    duplicate,
  };
}

async function findRolloutByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_experiment_winner_rollouts
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<RolloutRow>();
}

async function findRolloutByRollbackIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_experiment_winner_rollouts
       WHERE rollback_idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<RolloutRow>();
}

async function findRolloutById(db: D1Database, rolloutId: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_experiment_winner_rollouts
       WHERE id = ?`,
    )
    .bind(rolloutId)
    .first<RolloutRow>();
}

async function loadActiveRolloutRow(db: D1Database, experimentId: string, sourceRoute: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_experiment_winner_rollouts
       WHERE experiment_id = ?
         AND source_route = ?
         AND rollout_status = 'active'
         AND traffic_routing_enabled = 1
         AND automated_winner_enabled = 1
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(experimentId, sourceRoute)
    .first<RolloutRow>();
}

async function loadRolloutCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS total_rollouts,
        SUM(CASE WHEN rollout_status = 'active' THEN 1 ELSE 0 END) AS active_rollouts,
        SUM(CASE WHEN rollout_status = 'rolled_back' THEN 1 ELSE 0 END) AS rolled_back_rollouts,
        SUM(traffic_routing_enabled) AS traffic_routing_enabled_records,
        SUM(automated_winner_enabled) AS automated_winner_enabled_records,
        SUM(custom_routing_preserved) AS custom_routing_preserved_records,
        SUM(cookie_assignment_enabled) AS cookie_assignment_enabled_records,
        SUM(revenue_claim_enabled) AS revenue_claim_enabled_records,
        SUM(raw_event_rows_exposed) AS raw_event_rows_exposed_records,
        SUM(raw_assignment_rows_exposed) AS raw_assignment_rows_exposed_records
       FROM analytics_experiment_winner_rollouts`,
    )
    .first<RolloutCountRow>();

  return {
    totalRollouts: numberValue(row?.total_rollouts),
    activeRollouts: numberValue(row?.active_rollouts),
    rolledBackRollouts: numberValue(row?.rolled_back_rollouts),
    trafficRoutingEnabledRecords: numberValue(row?.traffic_routing_enabled_records),
    automatedWinnerEnabledRecords: numberValue(row?.automated_winner_enabled_records),
    customRoutingPreservedRecords: numberValue(row?.custom_routing_preserved_records),
    cookieAssignmentEnabledRecords: numberValue(row?.cookie_assignment_enabled_records),
    revenueClaimEnabledRecords: numberValue(row?.revenue_claim_enabled_records),
    rawEventRowsExposedRecords: numberValue(row?.raw_event_rows_exposed_records),
    rawAssignmentRowsExposedRecords: numberValue(row?.raw_assignment_rows_exposed_records),
  };
}

async function loadLatestRollouts(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM analytics_experiment_winner_rollouts
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<RolloutRow>();
  return (result.results ?? []).map((row) => publicRollout(row, false));
}

export async function getAnalyticsExperimentWinnerRolloutSummary(
  dbInput?: D1Database,
): Promise<AnalyticsExperimentWinnerRolloutSummary> {
  const experiment = analyticsDashboard.experiments[0];
  try {
    const db = dbInput ?? (await getRuntime()).db;
    const sourceRoute = sourceRouteForExperiment(experiment);
    const activeRow = await loadActiveRolloutRow(db, experiment.id, sourceRoute);
    const activeRollout = activeRow ? publicRollout(activeRow) : null;
    return {
      ...emptySummary("d1", null),
      currentEvidenceByWindow: await loadAllAnalyticsExperimentDecisionEvidence(db, experiment),
      counts: await loadRolloutCounts(db),
      activeRollout,
      latestRollouts: await loadLatestRollouts(db),
      redaction: redaction({ activeRouting: Boolean(activeRollout) }),
    };
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Unable to load winner rollouts.");
  }
}

async function createRollout(
  db: D1Database,
  input: CreateWinnerRolloutInput,
  experiment: ExperimentDefinition,
  timeWindow: AnalyticsTimeWindow,
  expectedVariantCounts: Record<string, number>,
  selectedVariantId: string,
  privateNote: string | null,
  idempotencyKey: string,
): Promise<CreateWinnerRolloutResult> {
  const summaryRedaction = redaction();
  const selectedVariant = experiment.variants.find((variant) => variant.id === selectedVariantId);
  if (!selectedVariant) {
    return {
      ok: false,
      status: "unsupported_variant",
      message: "The selected variant does not belong to the experiment.",
      redaction: summaryRedaction,
    };
  }
  if (selectedVariant.routingRole === "holdout") {
    return {
      ok: false,
      status: "holdout_variant_not_rollout_winner",
      message: "The baseline holdout cannot be promoted as the winner rollout target.",
      redaction: summaryRedaction,
    };
  }

  const sourceRoute = sourceRouteForExperiment(experiment);
  const activeRollout = await loadActiveRolloutRow(db, experiment.id, sourceRoute);
  if (activeRollout) {
    return {
      ok: false,
      status: "active_rollout_exists",
      message: "An active winner rollout already exists. Roll it back before creating another one.",
      redaction: redaction({ activeRouting: true }),
      activeRollout: publicRollout(activeRollout),
    };
  }

  const currentEvidence = await loadAnalyticsExperimentDecisionEvidence(db, experiment, timeWindow);
  const currentVariantCounts = Object.fromEntries(
    currentEvidence.variantCounts.map((variant) => [variant.variantId, variant.totalAssignments]),
  );
  const expectedAssignmentCount = parseInteger(input.expectedAssignmentCount);
  const expectedPrimaryMetricId = parseString(input.expectedPrimaryMetricId);
  const expectedConversionSampleSize = parseInteger(input.expectedConversionSampleSize);
  const evidenceMatches =
    expectedAssignmentCount === currentEvidence.assignmentCount &&
    expectedPrimaryMetricId === currentEvidence.primaryMetricId &&
    expectedConversionSampleSize === currentEvidence.conversionSampleSize &&
    canonicalVariantCountsJson(experiment, expectedVariantCounts) === canonicalVariantCountsJson(experiment, currentVariantCounts);

  if (!evidenceMatches) {
    return {
      ok: false,
      status: "stale_analytics_evidence",
      message: "The aggregate analytics evidence changed before the winner rollout was recorded.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(analyticsExperimentWinnerRolloutConfirmationText);
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const rolloutId = `analytics-experiment-winner-rollout-${crypto.randomUUID()}`;
  const expectedVariantCountsJson = canonicalVariantCountsJson(experiment, expectedVariantCounts);

  await db
    .prepare(
      `INSERT INTO analytics_experiment_winner_rollouts (
        id, dashboard_id, experiment_id, selected_variant_id, source_route, rollout_status,
        time_window_key, expected_dashboard_revision_id, expected_experiment_status,
        expected_assignment_count, expected_variant_counts_json, expected_primary_metric_id,
        expected_conversion_sample_size, sample_size_caveat_acknowledged, idempotency_key,
        actor_user_id, actor_email_hash, private_note_sha256, confirmation_text_sha256,
        traffic_routing_enabled, automated_winner_enabled, custom_routing_preserved,
        cookie_assignment_enabled, revenue_claim_enabled, raw_event_rows_exposed,
        raw_assignment_rows_exposed, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 1, 1, 1, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      rolloutId,
      analyticsDashboard.id,
      experiment.id,
      selectedVariantId,
      sourceRoute,
      timeWindow.key,
      analyticsDashboard.revisionId,
      experiment.status,
      expectedAssignmentCount,
      expectedVariantCountsJson,
      expectedPrimaryMetricId,
      expectedConversionSampleSize,
      idempotencyKey,
      input.actor.userId ?? "unknown-owner",
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      JSON.stringify({
        issue: analyticsExperimentWinnerRolloutIssue,
        parentIssue: 18,
        selectedVariantId,
        customRoutingPreserved: true,
        trafficRoutingEnabled: true,
        automatedWinnerEnabled: true,
        cookieAssignmentEnabled: false,
        revenueClaimEnabled: false,
        rawEventRowsExposed: false,
        rawAssignmentRowsExposed: false,
        privateDataIncluded: false,
      }),
    )
    .run();

  const rollout = await findRolloutByIdempotency(db, idempotencyKey);
  if (!rollout) {
    return {
      ok: false,
      status: "rollout_not_created",
      message: "The experiment winner rollout could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "analytics_experiment_winner_rollout_recorded",
    duplicate: false,
    rollout: publicRollout(rollout, false),
    redaction: redaction({ activeRouting: true }),
  };
}

async function rollbackRollout(
  db: D1Database,
  input: CreateWinnerRolloutInput,
  privateNote: string | null,
  idempotencyKey: string,
): Promise<CreateWinnerRolloutResult> {
  const summaryRedaction = redaction();
  const existingRollback = await findRolloutByRollbackIdempotency(db, idempotencyKey);
  if (existingRollback) {
    return {
      ok: true,
      status: "analytics_experiment_winner_rollout_rollback_replayed",
      duplicate: true,
      rollout: publicRollout(existingRollback, true),
      redaction: redaction({ activeRouting: false }),
    };
  }

  const rolloutId = parseString(input.rolloutId);
  const expectedActiveRolloutRevision = parseString(input.expectedActiveRolloutRevision, 260);
  if (!rolloutId || !expectedActiveRolloutRevision) {
    return {
      ok: false,
      status: "invalid_request",
      message: "A rollout id and current rollout revision are required before rollback.",
      redaction: summaryRedaction,
    };
  }

  const rollout = await findRolloutById(db, rolloutId);
  if (!rollout) {
    return {
      ok: false,
      status: "rollout_not_found",
      message: "The winner rollout could not be found.",
      redaction: summaryRedaction,
    };
  }

  if (rollout.rollout_status !== "active") {
    return {
      ok: false,
      status: "rollout_not_active",
      message: "Only active winner rollouts can be rolled back.",
      redaction: summaryRedaction,
      activeRollout: null,
    };
  }

  const currentRevision = publicRollout(rollout).rolloutRevision;
  if (expectedActiveRolloutRevision !== currentRevision) {
    return {
      ok: false,
      status: "stale_active_rollout",
      message: "The active winner rollout changed before rollback.",
      redaction: redaction({ activeRouting: true }),
      activeRollout: publicRollout(rollout),
    };
  }

  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(analyticsExperimentWinnerRollbackConfirmationText);
  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  await db
    .prepare(
      `UPDATE analytics_experiment_winner_rollouts
       SET rollout_status = 'rolled_back',
           rollback_idempotency_key = ?,
           rollback_actor_user_id = ?,
           rollback_actor_email_hash = ?,
           rollback_note_sha256 = ?,
           rollback_confirmation_text_sha256 = ?,
           rolled_back_at = unixepoch(),
           traffic_routing_enabled = 0,
           automated_winner_enabled = 0,
           updated_at = unixepoch()
       WHERE id = ?
         AND rollout_status = 'active'`,
    )
    .bind(
      idempotencyKey,
      input.actor.userId ?? "unknown-owner",
      actorEmailHash,
      privateNoteSha256,
      confirmationTextSha256,
      rollout.id,
    )
    .run();

  const updated = await findRolloutById(db, rollout.id);
  if (!updated || updated.rollout_status !== "rolled_back") {
    return {
      ok: false,
      status: "rollout_not_updated",
      message: "The experiment winner rollout could not be rolled back.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "analytics_experiment_winner_rollout_rolled_back",
    duplicate: false,
    rollout: publicRollout(updated, false),
    redaction: redaction({ activeRouting: false }),
  };
}

export async function createAnalyticsExperimentWinnerRollout(
  input: CreateWinnerRolloutInput,
): Promise<CreateWinnerRolloutResult> {
  const summaryRedaction = redaction();
  const action = parseAction(input.action);
  const dashboardId = parseString(input.dashboardId);
  const experimentId = parseString(input.experimentId);
  const selectedVariantId = parseString(input.selectedVariantId);
  const timeWindowKey = parseString(input.timeWindowKey, 20) ?? defaultAnalyticsTimeWindow.key;
  const expectedDashboardRevisionId = parseString(input.expectedDashboardRevisionId);
  const expectedExperimentStatus = parseString(input.expectedExperimentStatus);
  const expectedVariantCounts = parseExpectedVariantCounts(analyticsDashboard.experiments[0], input.expectedVariantCounts);
  const sampleSizeCaveatAcknowledged = parseBoolean(input.sampleSizeCaveatAcknowledged);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (!action) {
    return {
      ok: false,
      status: "unsupported_action",
      message: "A supported winner rollout action is required.",
      redaction: summaryRedaction,
    };
  }

  if (!dashboardId || !experimentId || !idempotencyKey) {
    return {
      ok: false,
      status: "invalid_request",
      message: "A dashboard, experiment, action, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  const expectedConfirmation =
    action === "rollout_winner"
      ? analyticsExperimentWinnerRolloutConfirmationText
      : analyticsExperimentWinnerRollbackConfirmationText;
  if (input.confirmationText !== expectedConfirmation) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before changing winner rollout state.",
      redaction: summaryRedaction,
    };
  }

  const { db } = await getRuntime();
  if (action === "rollback_winner_rollout") {
    return rollbackRollout(db, input, privateNote, idempotencyKey);
  }

  if (
    !selectedVariantId ||
    !expectedDashboardRevisionId ||
    !expectedExperimentStatus ||
    !expectedVariantCounts ||
    parseInteger(input.expectedAssignmentCount) === null ||
    !parseString(input.expectedPrimaryMetricId) ||
    parseInteger(input.expectedConversionSampleSize) === null
  ) {
    return {
      ok: false,
      status: "invalid_request",
      message: "Winner rollout requires a selected variant, current revision/status, aggregate evidence, and sample size.",
      redaction: summaryRedaction,
    };
  }

  if (!sampleSizeCaveatAcknowledged) {
    return {
      ok: false,
      status: "sample_size_caveat_required",
      message: "The sample-size caveat must be acknowledged before routing a winner rollout.",
      redaction: summaryRedaction,
    };
  }

  if (dashboardId !== analyticsDashboard.id) {
    return {
      ok: false,
      status: "dashboard_not_found",
      message: "The analytics dashboard could not be found.",
      redaction: summaryRedaction,
    };
  }

  const experiment = analyticsDashboard.experiments.find((candidate) => candidate.id === experimentId);
  if (!experiment) {
    return {
      ok: false,
      status: "experiment_not_found",
      message: "The selected experiment could not be found.",
      redaction: summaryRedaction,
    };
  }

  if (expectedDashboardRevisionId !== analyticsDashboard.revisionId) {
    return {
      ok: false,
      status: "stale_dashboard_revision",
      message: "The analytics dashboard revision changed before the winner rollout was recorded.",
      redaction: summaryRedaction,
      currentDashboardRevisionId: analyticsDashboard.revisionId,
    };
  }

  if (expectedExperimentStatus !== experiment.status) {
    return {
      ok: false,
      status: "stale_experiment_status",
      message: "The experiment status changed before the winner rollout was recorded.",
      redaction: summaryRedaction,
      currentExperimentStatus: experiment.status,
    };
  }

  const timeWindow = resolveAnalyticsTimeWindow(timeWindowKey);
  if (timeWindow.key !== timeWindowKey) {
    return {
      ok: false,
      status: "invalid_request",
      message: "The selected analytics time window is not supported.",
      redaction: summaryRedaction,
    };
  }

  const existing = await findRolloutByIdempotency(db, idempotencyKey);
  if (existing) {
    const sameRequest =
      existing.dashboard_id === dashboardId &&
      existing.experiment_id === experiment.id &&
      existing.selected_variant_id === selectedVariantId &&
      existing.time_window_key === timeWindow.key &&
      existing.expected_dashboard_revision_id === expectedDashboardRevisionId &&
      existing.expected_experiment_status === expectedExperimentStatus &&
      numberValue(existing.expected_assignment_count) === parseInteger(input.expectedAssignmentCount) &&
      existing.expected_variant_counts_json === canonicalVariantCountsJson(experiment, expectedVariantCounts) &&
      existing.expected_primary_metric_id === parseString(input.expectedPrimaryMetricId) &&
      numberValue(existing.expected_conversion_sample_size) === parseInteger(input.expectedConversionSampleSize) &&
      existing.sample_size_caveat_acknowledged === 1;
    if (!sameRequest) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "The idempotency key is already associated with a different winner rollout request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "analytics_experiment_winner_rollout_replayed",
      duplicate: true,
      rollout: publicRollout(existing, true),
      redaction: redaction({ activeRouting: existing.rollout_status === "active" }),
    };
  }

  return createRollout(db, input, experiment, timeWindow, expectedVariantCounts, selectedVariantId, privateNote, idempotencyKey);
}
