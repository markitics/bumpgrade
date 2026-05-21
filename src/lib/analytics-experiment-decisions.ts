import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { loadAnalyticsFunnelConversionReport } from "@/lib/analytics-conversion-report";
import { sha256Hex } from "@/lib/analytics-events";
import { analyticsDashboard, type ExperimentDefinition, type ExperimentVariant } from "@/lib/analytics-experiments";
import {
  analyticsTimeWindowStart,
  analyticsTimeWindows,
  defaultAnalyticsTimeWindow,
  resolveAnalyticsTimeWindow,
  type AnalyticsTimeWindow,
} from "@/lib/analytics-time-windows";

export const analyticsExperimentDecisionIssue = 261;
export const analyticsExperimentDecisionStatus = "owner-experiment-decision-evidence-ready";
export const analyticsExperimentDecisionApiRoute = "/api/admin/analytics/experiment-decisions";
export const analyticsExperimentDecisionOwnerRoute = "/admin/analytics";
export const analyticsExperimentDecisionConfirmationText = "Record Bumpgrade experiment decision evidence";

const decisionKinds = ["continue_observing", "prefer_variant", "pause_experiment", "needs_more_data"] as const;

export type AnalyticsExperimentDecisionKind = (typeof decisionKinds)[number];

type Runtime = {
  db: D1Database;
};

type VariantAggregateRow = {
  variant_id: string;
  total_assignments: number;
  last_assigned_at: number | null;
};

type DecisionCountRow = {
  experiment_decisions: number;
  owner_confirmed_decisions: number;
  continue_observing_decisions: number;
  prefer_variant_decisions: number;
  pause_experiment_decisions: number;
  needs_more_data_decisions: number;
  traffic_routing_enabled_records: number;
  automated_winner_enabled_records: number;
  cookie_assignment_enabled_records: number;
  revenue_claim_enabled_records: number;
  raw_event_rows_exposed_records: number;
  raw_assignment_rows_exposed_records: number;
};

type DecisionRow = {
  id: string;
  dashboard_id: string;
  experiment_id: string;
  decision_kind: AnalyticsExperimentDecisionKind;
  selected_variant_id: string | null;
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
  traffic_routing_enabled: number;
  automated_winner_enabled: number;
  cookie_assignment_enabled: number;
  revenue_claim_enabled: number;
  raw_event_rows_exposed: number;
  raw_assignment_rows_exposed: number;
  metadata_json: string | null;
  created_at: number;
  updated_at: number;
};

export type AnalyticsExperimentDecisionEvidence = {
  timeWindow: AnalyticsTimeWindow;
  experimentId: string;
  sourceRoute: string;
  assignmentCount: number;
  variantCounts: Array<{
    variantId: string;
    label: string;
    totalAssignments: number;
    lastAssignedAt: number | null;
  }>;
  primaryMetricId: string;
  conversionSampleSize: number;
  conversionReportMode: "captured_events" | "fixture_fallback";
  sampleSizeCaveat: string;
  rawRowsIncluded: false;
  privateDataIncluded: false;
};

export type AnalyticsExperimentDecisionPublic = {
  id: string;
  dashboardId: string;
  experimentId: string;
  experimentTitle: string;
  decisionKind: AnalyticsExperimentDecisionKind;
  selectedVariantId: string | null;
  selectedVariantLabel: string | null;
  timeWindowKey: string;
  expectedAssignmentCount: number;
  expectedVariantCounts: Record<string, number>;
  expectedPrimaryMetricId: string;
  expectedConversionSampleSize: number;
  sampleSizeCaveatAcknowledged: boolean;
  privateNoteRecorded: boolean;
  trafficRoutingEnabled: false;
  automatedWinnerEnabled: false;
  cookieAssignmentEnabled: false;
  revenueClaimEnabled: false;
  rawEventRowsExposed: false;
  rawAssignmentRowsExposed: false;
  createdAt: string | null;
  duplicate?: boolean;
};

export type AnalyticsExperimentDecisionSummary = {
  id: "analytics-experiment-decision-contract";
  status: typeof analyticsExperimentDecisionStatus;
  issue: typeof analyticsExperimentDecisionIssue;
  parentIssue: 18;
  apiRoute: typeof analyticsExperimentDecisionApiRoute;
  ownerRoute: typeof analyticsExperimentDecisionOwnerRoute;
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
    primaryMetricId: string;
    variants: ExperimentVariant[];
  };
  confirmation: {
    required: true;
    text: typeof analyticsExperimentDecisionConfirmationText;
  };
  currentEvidenceByWindow: AnalyticsExperimentDecisionEvidence[];
  counts: {
    experimentDecisions: number;
    ownerConfirmedDecisions: number;
    continueObservingDecisions: number;
    preferVariantDecisions: number;
    pauseExperimentDecisions: number;
    needsMoreDataDecisions: number;
    trafficRoutingEnabledRecords: number;
    automatedWinnerEnabledRecords: number;
    cookieAssignmentEnabledRecords: number;
    revenueClaimEnabledRecords: number;
    rawEventRowsExposedRecords: number;
    rawAssignmentRowsExposedRecords: number;
  };
  latestDecisions: AnalyticsExperimentDecisionPublic[];
  redaction: {
    privateDataIncluded: false;
    rawEventRowsIncluded: false;
    rawAssignmentRowsIncluded: false;
    contactAnalyticsIncluded: false;
    actorEmailIncluded: false;
    actorEmailHashIncluded: false;
    privateNoteIncluded: false;
    trafficRoutingEnabled: false;
    automatedWinnerEnabled: false;
    cookieAssignmentEnabled: false;
    revenueClaimEnabled: false;
  };
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

type CreateExperimentDecisionInput = {
  dashboardId?: unknown;
  experimentId?: unknown;
  decisionKind?: unknown;
  selectedVariantId?: unknown;
  timeWindowKey?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedExperimentStatus?: unknown;
  expectedAssignmentCount?: unknown;
  expectedVariantCounts?: unknown;
  expectedPrimaryMetricId?: unknown;
  expectedConversionSampleSize?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: string | null;
  actor: AdminIdentity;
};

type CreateExperimentDecisionResult =
  | {
      ok: true;
      status: "analytics_experiment_decision_recorded" | "analytics_experiment_decision_replayed";
      duplicate: boolean;
      decision: AnalyticsExperimentDecisionPublic;
      redaction: AnalyticsExperimentDecisionSummary["redaction"];
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "dashboard_not_found"
        | "experiment_not_found"
        | "unsupported_decision_kind"
        | "unsupported_variant"
        | "selected_variant_required"
        | "sample_size_caveat_required"
        | "confirmation_required"
        | "stale_dashboard_revision"
        | "stale_experiment_status"
        | "stale_analytics_evidence"
        | "idempotency_conflict"
        | "decision_not_created";
      message: string;
      redaction: AnalyticsExperimentDecisionSummary["redaction"];
      currentDashboardRevisionId?: string;
      currentExperimentStatus?: string;
      currentEvidence?: AnalyticsExperimentDecisionEvidence;
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

function emptyCounts(): AnalyticsExperimentDecisionSummary["counts"] {
  return {
    experimentDecisions: 0,
    ownerConfirmedDecisions: 0,
    continueObservingDecisions: 0,
    preferVariantDecisions: 0,
    pauseExperimentDecisions: 0,
    needsMoreDataDecisions: 0,
    trafficRoutingEnabledRecords: 0,
    automatedWinnerEnabledRecords: 0,
    cookieAssignmentEnabledRecords: 0,
    revenueClaimEnabledRecords: 0,
    rawEventRowsExposedRecords: 0,
    rawAssignmentRowsExposedRecords: 0,
  };
}

function redaction(): AnalyticsExperimentDecisionSummary["redaction"] {
  return {
    privateDataIncluded: false,
    rawEventRowsIncluded: false,
    rawAssignmentRowsIncluded: false,
    contactAnalyticsIncluded: false,
    actorEmailIncluded: false,
    actorEmailHashIncluded: false,
    privateNoteIncluded: false,
    trafficRoutingEnabled: false,
    automatedWinnerEnabled: false,
    cookieAssignmentEnabled: false,
    revenueClaimEnabled: false,
  };
}

function emptySummary(source: AnalyticsExperimentDecisionSummary["source"], loadError: string | null): AnalyticsExperimentDecisionSummary {
  const experiment = analyticsDashboard.experiments[0];
  return {
    id: "analytics-experiment-decision-contract",
    status: analyticsExperimentDecisionStatus,
    issue: analyticsExperimentDecisionIssue,
    parentIssue: 18,
    apiRoute: analyticsExperimentDecisionApiRoute,
    ownerRoute: analyticsExperimentDecisionOwnerRoute,
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
      primaryMetricId: experiment.primaryMetricId,
      variants: experiment.variants,
    },
    confirmation: {
      required: true,
      text: analyticsExperimentDecisionConfirmationText,
    },
    currentEvidenceByWindow: [],
    counts: emptyCounts(),
    latestDecisions: [],
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
      "metadataJson",
    ],
    writeBoundary:
      "Issue #261 lets verified owners record redacted experiment decision evidence after exact confirmation, idempotency, dashboard revision checks, experiment status checks, aggregate assignment/count checks, selected fixed-window evidence, and sample-size caveat acknowledgement. It does not route traffic, assign cookies, decide automated winners, expose raw event rows, expose raw assignment rows, expose contact analytics, or make revenue claims.",
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

function parseDecisionKind(value: unknown): AnalyticsExperimentDecisionKind | null {
  if (typeof value !== "string") return null;
  return decisionKinds.includes(value as AnalyticsExperimentDecisionKind) ? (value as AnalyticsExperimentDecisionKind) : null;
}

function variantLabel(experiment: ExperimentDefinition, variantId: string | null) {
  if (!variantId) return null;
  return experiment.variants.find((variant) => variant.id === variantId)?.label ?? null;
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

function publicDecision(row: DecisionRow, duplicate = false): AnalyticsExperimentDecisionPublic {
  const experiment = analyticsDashboard.experiments.find((candidate) => candidate.id === row.experiment_id) ?? analyticsDashboard.experiments[0];
  return {
    id: row.id,
    dashboardId: row.dashboard_id,
    experimentId: row.experiment_id,
    experimentTitle: experiment.title,
    decisionKind: row.decision_kind,
    selectedVariantId: row.selected_variant_id,
    selectedVariantLabel: variantLabel(experiment, row.selected_variant_id),
    timeWindowKey: row.time_window_key,
    expectedAssignmentCount: numberValue(row.expected_assignment_count),
    expectedVariantCounts: safeParseVariantCounts(row.expected_variant_counts_json),
    expectedPrimaryMetricId: row.expected_primary_metric_id,
    expectedConversionSampleSize: numberValue(row.expected_conversion_sample_size),
    sampleSizeCaveatAcknowledged: row.sample_size_caveat_acknowledged === 1,
    privateNoteRecorded: Boolean(row.private_note_sha256),
    trafficRoutingEnabled: false,
    automatedWinnerEnabled: false,
    cookieAssignmentEnabled: false,
    revenueClaimEnabled: false,
    rawEventRowsExposed: false,
    rawAssignmentRowsExposed: false,
    createdAt: createdAtIso(row.created_at),
    duplicate,
  };
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

async function loadDecisionEvidence(
  db: D1Database | undefined,
  experiment: ExperimentDefinition,
  timeWindow: AnalyticsTimeWindow,
): Promise<AnalyticsExperimentDecisionEvidence> {
  const windowStart = analyticsTimeWindowStart(timeWindow);
  const sourceRoute = sourceRouteForExperiment(experiment);
  let rows: VariantAggregateRow[] = [];
  if (db) {
    const statement = db.prepare(
      `SELECT
        variant_id,
        COUNT(*) AS total_assignments,
        MAX(assigned_at) AS last_assigned_at
       FROM analytics_experiment_assignments
       WHERE experiment_id = ?
         AND source_route = ?
         ${windowStart === null ? "" : "AND assigned_at >= ?"}
       GROUP BY variant_id
       ORDER BY variant_id`,
    );
    const result =
      windowStart === null
        ? await statement.bind(experiment.id, sourceRoute).all<VariantAggregateRow>()
        : await statement.bind(experiment.id, sourceRoute, windowStart).all<VariantAggregateRow>();
    rows = result.results ?? [];
  }

  const conversionReport = await loadAnalyticsFunnelConversionReport(db, analyticsDashboard, timeWindow);
  const primaryMetric =
    conversionReport.rows.find((row) => row.metricId === experiment.primaryMetricId) ?? conversionReport.rows[0];
  const variantCounts = experiment.variants.map((variant) => {
    const row = rows.find((candidate) => candidate.variant_id === variant.id);
    return {
      variantId: variant.id,
      label: variant.label,
      totalAssignments: numberValue(row?.total_assignments),
      lastAssignedAt: row?.last_assigned_at ? numberValue(row.last_assigned_at) : null,
    };
  });

  return {
    timeWindow,
    experimentId: experiment.id,
    sourceRoute,
    assignmentCount: variantCounts.reduce((total, row) => total + row.totalAssignments, 0),
    variantCounts,
    primaryMetricId: experiment.primaryMetricId,
    conversionSampleSize: primaryMetric?.sampleSize ?? 0,
    conversionReportMode: primaryMetric?.reportMode ?? "fixture_fallback",
    sampleSizeCaveat: conversionReport.sampleSizeCaveat,
    rawRowsIncluded: false,
    privateDataIncluded: false,
  };
}

async function loadAllDecisionEvidence(db: D1Database | undefined, experiment: ExperimentDefinition) {
  return Promise.all(analyticsTimeWindows.map((window) => loadDecisionEvidence(db, experiment, window)));
}

async function findDecisionByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT *
       FROM analytics_experiment_decisions
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<DecisionRow>();
}

async function loadDecisionCounts(db: D1Database) {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS experiment_decisions,
        SUM(CASE WHEN sample_size_caveat_acknowledged = 1 THEN 1 ELSE 0 END) AS owner_confirmed_decisions,
        SUM(CASE WHEN decision_kind = 'continue_observing' THEN 1 ELSE 0 END) AS continue_observing_decisions,
        SUM(CASE WHEN decision_kind = 'prefer_variant' THEN 1 ELSE 0 END) AS prefer_variant_decisions,
        SUM(CASE WHEN decision_kind = 'pause_experiment' THEN 1 ELSE 0 END) AS pause_experiment_decisions,
        SUM(CASE WHEN decision_kind = 'needs_more_data' THEN 1 ELSE 0 END) AS needs_more_data_decisions,
        SUM(traffic_routing_enabled) AS traffic_routing_enabled_records,
        SUM(automated_winner_enabled) AS automated_winner_enabled_records,
        SUM(cookie_assignment_enabled) AS cookie_assignment_enabled_records,
        SUM(revenue_claim_enabled) AS revenue_claim_enabled_records,
        SUM(raw_event_rows_exposed) AS raw_event_rows_exposed_records,
        SUM(raw_assignment_rows_exposed) AS raw_assignment_rows_exposed_records
       FROM analytics_experiment_decisions`,
    )
    .first<DecisionCountRow>();

  return {
    experimentDecisions: numberValue(row?.experiment_decisions),
    ownerConfirmedDecisions: numberValue(row?.owner_confirmed_decisions),
    continueObservingDecisions: numberValue(row?.continue_observing_decisions),
    preferVariantDecisions: numberValue(row?.prefer_variant_decisions),
    pauseExperimentDecisions: numberValue(row?.pause_experiment_decisions),
    needsMoreDataDecisions: numberValue(row?.needs_more_data_decisions),
    trafficRoutingEnabledRecords: numberValue(row?.traffic_routing_enabled_records),
    automatedWinnerEnabledRecords: numberValue(row?.automated_winner_enabled_records),
    cookieAssignmentEnabledRecords: numberValue(row?.cookie_assignment_enabled_records),
    revenueClaimEnabledRecords: numberValue(row?.revenue_claim_enabled_records),
    rawEventRowsExposedRecords: numberValue(row?.raw_event_rows_exposed_records),
    rawAssignmentRowsExposedRecords: numberValue(row?.raw_assignment_rows_exposed_records),
  };
}

async function loadLatestDecisions(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT *
       FROM analytics_experiment_decisions
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all<DecisionRow>();
  return (result.results ?? []).map((row) => publicDecision(row, false));
}

export async function getAnalyticsExperimentDecisionSummary(
  dbInput?: D1Database,
): Promise<AnalyticsExperimentDecisionSummary> {
  const experiment = analyticsDashboard.experiments[0];
  try {
    const db = dbInput ?? (await getRuntime()).db;
    return {
      ...emptySummary("d1", null),
      currentEvidenceByWindow: await loadAllDecisionEvidence(db, experiment),
      counts: await loadDecisionCounts(db),
      latestDecisions: await loadLatestDecisions(db),
    };
  } catch (error) {
    return emptySummary("unavailable", error instanceof Error ? error.message : "Unable to load experiment decisions.");
  }
}

export async function createAnalyticsExperimentDecision(
  input: CreateExperimentDecisionInput,
): Promise<CreateExperimentDecisionResult> {
  const summaryRedaction = redaction();
  const dashboardId = parseString(input.dashboardId);
  const experimentId = parseString(input.experimentId);
  const decisionKind = parseDecisionKind(input.decisionKind);
  const selectedVariantId = parseString(input.selectedVariantId);
  const timeWindowKey = parseString(input.timeWindowKey, 20) ?? defaultAnalyticsTimeWindow.key;
  const expectedDashboardRevisionId = parseString(input.expectedDashboardRevisionId);
  const expectedExperimentStatus = parseString(input.expectedExperimentStatus);
  const expectedAssignmentCount = parseInteger(input.expectedAssignmentCount);
  const expectedPrimaryMetricId = parseString(input.expectedPrimaryMetricId);
  const expectedConversionSampleSize = parseInteger(input.expectedConversionSampleSize);
  const sampleSizeCaveatAcknowledged = parseBoolean(input.sampleSizeCaveatAcknowledged);
  const privateNote = parseString(input.privateNote, 800);
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (
    !dashboardId ||
    !experimentId ||
    !decisionKind ||
    !expectedDashboardRevisionId ||
    !expectedExperimentStatus ||
    expectedAssignmentCount === null ||
    !expectedPrimaryMetricId ||
    expectedConversionSampleSize === null ||
    !idempotencyKey
  ) {
    return {
      ok: false,
      status: decisionKind ? "invalid_request" : "unsupported_decision_kind",
      message:
        "A dashboard, experiment, decision kind, expected revision/status, aggregate counts, metric sample size, and idempotency key are required.",
      redaction: summaryRedaction,
    };
  }

  if (input.confirmationText !== analyticsExperimentDecisionConfirmationText) {
    return {
      ok: false,
      status: "confirmation_required",
      message: "Exact confirmation text is required before recording experiment decision evidence.",
      redaction: summaryRedaction,
    };
  }

  if (!sampleSizeCaveatAcknowledged) {
    return {
      ok: false,
      status: "sample_size_caveat_required",
      message: "The sample-size caveat must be acknowledged before recording experiment decision evidence.",
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

  if (expectedDashboardRevisionId !== analyticsDashboard.revisionId) {
    return {
      ok: false,
      status: "stale_dashboard_revision",
      message: "The analytics dashboard revision changed before the decision was recorded.",
      redaction: summaryRedaction,
      currentDashboardRevisionId: analyticsDashboard.revisionId,
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

  if (expectedExperimentStatus !== experiment.status) {
    return {
      ok: false,
      status: "stale_experiment_status",
      message: "The experiment status changed before the decision was recorded.",
      redaction: summaryRedaction,
      currentExperimentStatus: experiment.status,
    };
  }

  if (decisionKind === "prefer_variant" && !selectedVariantId) {
    return {
      ok: false,
      status: "selected_variant_required",
      message: "A selected variant is required when preferring a variant.",
      redaction: summaryRedaction,
    };
  }

  if (selectedVariantId && !experiment.variants.some((variant) => variant.id === selectedVariantId)) {
    return {
      ok: false,
      status: "unsupported_variant",
      message: "The selected variant does not belong to the seeded experiment.",
      redaction: summaryRedaction,
    };
  }

  const expectedVariantCounts = parseExpectedVariantCounts(experiment, input.expectedVariantCounts);
  if (!expectedVariantCounts) {
    return {
      ok: false,
      status: "invalid_request",
      message: "Expected variant counts are required for every seeded variant.",
      redaction: summaryRedaction,
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

  const { db } = await getRuntime();
  const currentEvidence = await loadDecisionEvidence(db, experiment, timeWindow);
  const currentVariantCounts = Object.fromEntries(
    currentEvidence.variantCounts.map((variant) => [variant.variantId, variant.totalAssignments]),
  );
  const evidenceMatches =
    expectedAssignmentCount === currentEvidence.assignmentCount &&
    expectedPrimaryMetricId === currentEvidence.primaryMetricId &&
    expectedConversionSampleSize === currentEvidence.conversionSampleSize &&
    canonicalVariantCountsJson(experiment, expectedVariantCounts) === canonicalVariantCountsJson(experiment, currentVariantCounts);

  if (!evidenceMatches) {
    return {
      ok: false,
      status: "stale_analytics_evidence",
      message: "The aggregate analytics evidence changed before the experiment decision was recorded.",
      redaction: summaryRedaction,
      currentEvidence,
    };
  }

  const privateNoteSha256 = privateNote ? await sha256Hex(privateNote) : null;
  const confirmationTextSha256 = await sha256Hex(analyticsExperimentDecisionConfirmationText);
  const expectedVariantCountsJson = canonicalVariantCountsJson(experiment, expectedVariantCounts);
  const normalizedSelectedVariantId = decisionKind === "prefer_variant" ? selectedVariantId : null;
  const existing = await findDecisionByIdempotency(db, idempotencyKey);
  if (existing) {
    const sameRequest =
      existing.dashboard_id === dashboardId &&
      existing.experiment_id === experiment.id &&
      existing.decision_kind === decisionKind &&
      (existing.selected_variant_id ?? null) === normalizedSelectedVariantId &&
      existing.time_window_key === timeWindow.key &&
      existing.expected_dashboard_revision_id === expectedDashboardRevisionId &&
      existing.expected_experiment_status === expectedExperimentStatus &&
      numberValue(existing.expected_assignment_count) === expectedAssignmentCount &&
      existing.expected_variant_counts_json === expectedVariantCountsJson &&
      existing.expected_primary_metric_id === expectedPrimaryMetricId &&
      numberValue(existing.expected_conversion_sample_size) === expectedConversionSampleSize &&
      existing.sample_size_caveat_acknowledged === 1 &&
      (existing.private_note_sha256 ?? null) === privateNoteSha256 &&
      existing.confirmation_text_sha256 === confirmationTextSha256;
    if (!sameRequest) {
      return {
        ok: false,
        status: "idempotency_conflict",
        message: "The idempotency key is already associated with a different experiment decision request.",
        redaction: summaryRedaction,
      };
    }
    return {
      ok: true,
      status: "analytics_experiment_decision_replayed",
      duplicate: true,
      decision: publicDecision(existing, true),
      redaction: summaryRedaction,
    };
  }

  const actorEmailHash = await sha256Hex((input.actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
  const decisionId = `analytics-experiment-decision-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO analytics_experiment_decisions (
        id, dashboard_id, experiment_id, decision_kind, selected_variant_id, time_window_key,
        expected_dashboard_revision_id, expected_experiment_status, expected_assignment_count,
        expected_variant_counts_json, expected_primary_metric_id, expected_conversion_sample_size,
        sample_size_caveat_acknowledged, idempotency_key, actor_user_id, actor_email_hash,
        private_note_sha256, confirmation_text_sha256, traffic_routing_enabled, automated_winner_enabled,
        cookie_assignment_enabled, revenue_claim_enabled, raw_event_rows_exposed, raw_assignment_rows_exposed,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      decisionId,
      dashboardId,
      experiment.id,
      decisionKind,
      normalizedSelectedVariantId,
      timeWindow.key,
      expectedDashboardRevisionId,
      expectedExperimentStatus,
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
        issue: analyticsExperimentDecisionIssue,
        parentIssue: 18,
        sourceRoute: sourceRouteForExperiment(experiment),
        sampleSizeCaveatAcknowledged: true,
        trafficRoutingEnabled: false,
        automatedWinnerEnabled: false,
        cookieAssignmentEnabled: false,
        revenueClaimEnabled: false,
        rawEventRowsExposed: false,
        rawAssignmentRowsExposed: false,
        privateDataIncluded: false,
      }),
    )
    .run();

  const decision = await findDecisionByIdempotency(db, idempotencyKey);
  if (!decision) {
    return {
      ok: false,
      status: "decision_not_created",
      message: "The experiment decision evidence could not be saved.",
      redaction: summaryRedaction,
    };
  }

  return {
    ok: true,
    status: "analytics_experiment_decision_recorded",
    duplicate: false,
    decision: publicDecision(decision, false),
    redaction: summaryRedaction,
  };
}
